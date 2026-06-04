import type { APIRoute } from 'astro';
import {
  submitTrainingLead,
  gateCookieName,
  gateCookieOptions,
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
  const ip = request.headers.get('CF-Connecting-IP') ?? undefined;

  const result = await submitTrainingLead(body, {
    ip,
    waitUntil: ctx?.waitUntil?.bind(ctx),
  });

  if (!result.ok) return json({ error: result.error }, result.status);

  // Unlock the soft gate so the user can read /words directly. Bypassable by
  // clearing cookies — by design. Read server-side by words.astro.
  cookies.set(gateCookieName(result.assetSlug), 'unlocked', gateCookieOptions(result.assetSlug));

  return json({ ok: true, assetUrl: result.assetUrl });
};
