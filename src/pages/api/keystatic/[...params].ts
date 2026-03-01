import type { APIContext } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../../../keystatic.config';

export const prerender = false;

const handler = makeHandler({ config: keystaticConfig });

export const ALL = async (ctx: APIContext) => {
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
