import type { APIContext } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../../../keystatic.config';

export const prerender = false;

export const ALL = async (ctx: APIContext) => {
  // Debug: test the token exchange directly (hit /api/keystatic/debug?code=XXX)
  if (ctx.url.pathname.endsWith('/debug')) {
    const code = ctx.url.searchParams.get('code');
    if (!code) {
      // Redirect to GitHub to get a fresh code
      const loginUrl = new URL('https://github.com/login/oauth/authorize');
      loginUrl.searchParams.set('client_id', process.env.KEYSTATIC_GITHUB_CLIENT_ID!);
      loginUrl.searchParams.set('redirect_uri', 'https://www.devin.vc/api/keystatic/debug');
      return Response.redirect(loginUrl.toString());
    }
    // Try the token exchange
    const tokenUrl = new URL('https://github.com/login/oauth/access_token');
    tokenUrl.searchParams.set('client_id', process.env.KEYSTATIC_GITHUB_CLIENT_ID!);
    tokenUrl.searchParams.set('client_secret', process.env.KEYSTATIC_GITHUB_CLIENT_SECRET!);
    tokenUrl.searchParams.set('code', code);
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    const body = await res.json();
    return new Response(JSON.stringify({
      status: res.status,
      ok: res.ok,
      body,
    }, null, 2), { headers: { 'Content-Type': 'application/json' } });
  }

  // Read env vars at request time to avoid build-time bundling issues
  const handler = makeHandler({
    config: keystaticConfig,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET,
  });

  // Vercel serverless functions can receive localhost as the host.
  // Keystatic derives the OAuth redirect_uri from the request URL origin,
  // so we need to fix it to the real domain before passing it through.
  const url = new URL(ctx.request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    const correctUrl = new URL(
      url.pathname + url.search,
      'https://www.devin.vc'
    );
    const fixedRequest = new Request(correctUrl.toString(), ctx.request);
    return handler({ ...ctx, request: fixedRequest });
  }
  return handler(ctx);
};
