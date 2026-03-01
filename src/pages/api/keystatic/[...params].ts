import type { APIContext } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../../../keystatic.config';

export const prerender = false;

export const ALL = async (ctx: APIContext) => {
  // Debug: test the token exchange directly
  // Step 1: visit /api/keystatic/debug — redirects to GitHub using the app's default callback
  // Step 2: after GitHub redirects back to the registered callback, grab the ?code= from the URL
  // Step 3: visit /api/keystatic/debug?code=THE_CODE to test the token exchange
  if (ctx.url.pathname.endsWith('/debug')) {
    const code = ctx.url.searchParams.get('code');
    if (!code) {
      // Redirect to GitHub — no redirect_uri so GitHub uses the app's registered callback
      const loginUrl = new URL('https://github.com/login/oauth/authorize');
      loginUrl.searchParams.set('client_id', process.env.KEYSTATIC_GITHUB_CLIENT_ID!);
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
