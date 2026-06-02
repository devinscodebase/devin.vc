import type { APIRoute } from 'astro';
import {
  submitTrainingLead,
  gateCookieName,
  TRAINING_GATE_MAX_AGE_SECONDS,
} from '../../lib/training-leads';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const ctx = (locals as any)?.runtime?.ctx as
    | { waitUntil?: (p: Promise<unknown>) => void }
    | undefined;

  const result = await submitTrainingLead(
    body,
    new URL(request.url).origin,
    ctx?.waitUntil?.bind(ctx)
  );

  if (!result.ok) return json({ error: result.error }, result.status);

  // Unlock the soft gate so the user can read /words directly. Bypassable by
  // clearing cookies — by design. Read server-side by words.astro.
  cookies.set(gateCookieName(result.assetSlug), 'unlocked', {
    path: '/',
    maxAge: TRAINING_GATE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    httpOnly: true,
    secure: import.meta.env.PROD,
  });

  return json({ ok: true, assetUrl: result.assetUrl });
};
