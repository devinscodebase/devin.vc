/*
  Cloudflare Turnstile verification.

  Used to gate the costly/abusable side effects of the training-lead flow
  (delivery email, audience add) behind a human check. The widget is rendered
  client-side; this verifies the resulting token server-side.

  Graceful by config: if TURNSTILE_SECRET_KEY is unset (local dev, or before
  keys are provisioned) verification is skipped and a warning is logged, so the
  flow still works. Set the secret in production to enforce.
*/
import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string
): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification');
    return true;
  }
  if (!token) return false;

  try {
    const body = new FormData();
    body.append('secret', TURNSTILE_SECRET_KEY);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);

    const res = await fetch(SITEVERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[turnstile] verification request failed:', err);
    return false;
  }
}
