import { neon } from '@neondatabase/serverless';
import { PostHog } from 'posthog-node/edge';

import { unsubscribeQuery } from '../../src/lib/unsubscribe';
import { joinWaitlist, type WaitlistDeps } from '../../src/lib/waitlist';

interface Env {
  DATABASE_URL?: string;
  POSTHOG_HOST?: string;
  POSTHOG_PROJECT_TOKEN?: string;
  RESEND_API_KEY?: string;
  UNSUBSCRIBE_SECRET?: string;
  WAITLIST_FROM?: string;
}

interface Context {
  request: Request;
  env: Env;
}

const REPLY_TO = 'me@devin.vc';

const RESEND_SEGMENT_ID = '2902dfb8-0e9c-4275-99f8-35162074b39e';
const RESEND_TOPIC_ID = 'a2bf8218-7970-448b-b4c0-6402f89728fb';

async function resend(apiKey: string, method: string, path: string, body: unknown): Promise<Response> {
  return fetch(`https://api.resend.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function failure(step: string, response: Response): Promise<Error> {
  return new Error(`Resend ${step} ${response.status}: ${await response.text()}`);
}

async function syncContact(apiKey: string, email: string): Promise<void> {
  const created = await resend(apiKey, 'POST', '/contacts', {
    email,
    unsubscribed: false,
    segments: [{ id: RESEND_SEGMENT_ID }],
    topics: [{ id: RESEND_TOPIC_ID, subscription: 'opt_in' }],
  });
  if (created.ok) return;

  const address = encodeURIComponent(email);
  const segment = await resend(apiKey, 'POST', `/contacts/${address}/segments/${RESEND_SEGMENT_ID}`, {});
  if (!segment.ok) throw await failure('add to segment', segment);
  const topics = await resend(apiKey, 'PATCH', `/contacts/${address}/topics`, [
    { id: RESEND_TOPIC_ID, subscription: 'opt_in' },
  ]);
  if (!topics.ok) throw await failure('topic opt-in', topics);
}
const CONFIRMATION_TEMPLATE_ID = '172c476d-22c1-4049-a414-b62962174f7b';

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  if (!env.DATABASE_URL) {
    console.error('waitlist: DATABASE_URL is not set');
    return json(503, { ok: false, error: 'unavailable' });
  }

  const isFormPost = (request.headers.get('Content-Type') ?? '').includes('application/x-www-form-urlencoded');
  let body: unknown;
  try {
    body = isFormPost ? Object.fromEntries(await request.formData()) : await request.json();
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  const sql = neon(env.DATABASE_URL);
  let capturedError: unknown;
  let isNewSignup = false;
  const deps: WaitlistDeps = {
    insert: async (email) => {
      const rows = await sql`
        INSERT INTO waitlist (email) VALUES (${email})
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      isNewSignup = rows.length > 0;
      return isNewSignup;
    },
    log: (message, error) => {
      capturedError ??= error;
      console.error(`waitlist: ${message}`, error);
    },
  };

  const { RESEND_API_KEY, WAITLIST_FROM } = env;
  if (RESEND_API_KEY) {
    deps.addContact = (email) => syncContact(RESEND_API_KEY, email);
  }
  if (RESEND_API_KEY && WAITLIST_FROM) {
    deps.sendConfirmation = async (email) => {
      const origin = new URL(request.url).origin;
      const variables: Record<string, string> = { SUBSCRIBER_EMAIL: email };
      let headers: Record<string, string> | undefined;
      if (env.UNSUBSCRIBE_SECRET) {
        const query = await unsubscribeQuery(env.UNSUBSCRIBE_SECRET, email);
        variables.UNSUBSCRIBE_URL = `${origin}/unsubscribe?${query}`;
        headers = {
          'List-Unsubscribe': `<${origin}/api/unsubscribe?${query}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        };
      }
      const response = await resend(RESEND_API_KEY, 'POST', '/emails', {
        from: WAITLIST_FROM,
        to: [email],
        reply_to: REPLY_TO,
        template: { id: CONFIRMATION_TEMPLATE_ID, variables },
        ...(headers ? { headers } : {}),
      });
      if (!response.ok) throw await failure('send', response);
    };
  }

  const result = await joinWaitlist(body, deps);

  const analyticsConsent = request.headers.get('X-PostHog-Consent') === 'accepted';
  if (analyticsConsent && env.POSTHOG_PROJECT_TOKEN && env.POSTHOG_HOST) {
    const distinctId = request.headers.get('X-PostHog-Distinct-Id') || crypto.randomUUID();
    const sessionId = request.headers.get('X-PostHog-Session-Id');
    const posthog = new PostHog(env.POSTHOG_PROJECT_TOKEN, { host: env.POSTHOG_HOST });
    try {
      if (isNewSignup && result.body.ok) {
        await posthog.captureImmediate({
          distinctId,
          event: 'waitlist_joined',
          properties: {
            source: 'waitlist_api',
            confirmation_configured: Boolean(deps.sendConfirmation),
            ...(sessionId ? { $session_id: sessionId } : {}),
          },
        });
      }
      if (capturedError) {
        await posthog.captureExceptionImmediate(capturedError, distinctId, {
          flow: 'waitlist',
          ...(sessionId ? { $session_id: sessionId } : {}),
        });
      }
    } catch (error) {
      console.error('waitlist: PostHog capture failed', error);
    }
  }

  if (isFormPost) {
    const message = result.body.ok
      ? "You're on the list. Check your inbox for a confirmation from me."
      : result.body.error === 'invalid_email'
        ? "That address doesn't look complete. Go back, check it, and try again."
        : result.body.error === 'consent_required'
          ? 'Go back and tick the box to agree to the privacy policy.'
        : "The signup didn't go through. Try again in a minute, or email me@devin.vc.";
    return new Response(message, {
      status: result.status,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return json(result.status, result.body);
}
