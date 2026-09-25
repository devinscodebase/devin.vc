import { neon } from '@neondatabase/serverless';

import { normalizeEmail } from '../../src/lib/waitlist';
import { verifyUnsubscribeToken } from '../../src/lib/unsubscribe';

interface Env {
  DATABASE_URL?: string;
  RESEND_API_KEY?: string;
  UNSUBSCRIBE_SECRET?: string;
}

interface Context {
  request: Request;
  env: Env;
}

async function readParams(request: Request): Promise<{ email: string | null; token: string; oneClick: boolean }> {
  const url = new URL(request.url);
  let email = url.searchParams.get('e');
  let token = url.searchParams.get('t') ?? '';
  let oneClick = false;
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
    const form = await request.formData();
    oneClick = form.get('List-Unsubscribe') === 'One-Click';
    email = (form.get('e') as string | null) ?? email;
    token = (form.get('t') as string | null) ?? token;
  }
  return { email: normalizeEmail(email), token, oneClick };
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const { email, token, oneClick } = await readParams(request);
  const origin = new URL(request.url).origin;

  if (!env.UNSUBSCRIBE_SECRET || !email || !(await verifyUnsubscribeToken(env.UNSUBSCRIBE_SECRET, email, token))) {
    return oneClick
      ? new Response('Invalid unsubscribe link', { status: 400 })
      : Response.redirect(`${origin}/unsubscribe?status=invalid`, 303);
  }

  try {
    if (env.DATABASE_URL) {
      await neon(env.DATABASE_URL)`DELETE FROM waitlist WHERE email = ${email}`;
    }
    if (env.RESEND_API_KEY) {
      const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribed: true }),
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Resend unsubscribe ${response.status}: ${await response.text()}`);
      }
    }
  } catch (error) {
    console.error('unsubscribe failed', error);
    return oneClick
      ? new Response('Unsubscribe failed', { status: 503 })
      : Response.redirect(`${origin}/unsubscribe?status=failed`, 303);
  }

  return oneClick ? new Response('Unsubscribed', { status: 200 }) : Response.redirect(`${origin}/unsubscribe?status=done`, 303);
}
