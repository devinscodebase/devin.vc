import type { APIRoute } from 'astro';
import { generateOgImage, type OgImageParams } from '../../lib/og-image';

export const prerender = false;

const validTypes = new Set(['default', 'journal', 'projects', 'page']);

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type') || 'default';

  if (!validTypes.has(type)) {
    return new Response('Invalid type parameter', { status: 400 });
  }

  const params: OgImageParams = {
    type: type as OgImageParams['type'],
    title: url.searchParams.get('title') || undefined,
    subtitle: url.searchParams.get('subtitle') || undefined,
    tag: url.searchParams.get('tag') || undefined,
    date: url.searchParams.get('date') || undefined,
  };

  const png = await generateOgImage(params);

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
