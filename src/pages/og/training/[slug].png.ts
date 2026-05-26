import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../lib/og-image';
import { sanityClient } from '../../../lib/sanity';

export const prerender = true;

interface TrainingAsset {
  slug: string;
  title: string;
  tagline?: string;
  category?: string;
}

const categoryLabels: Record<string, string> = {
  'word-list': 'Word List',
  playbook: 'Playbook',
  checklist: 'Checklist',
  template: 'Template',
  guide: 'Guide',
};

export const getStaticPaths: GetStaticPaths = async () => {
  const assets = await sanityClient.fetch<TrainingAsset[]>(
    `*[_type == "trainingAsset"] { "slug": slug.current, title, tagline, category }`
  );

  return assets.map((asset) => ({
    params: { slug: asset.slug },
    props: { asset },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { asset } = props as { asset: TrainingAsset };

  const png = await generateOgImage({
    type: 'page',
    title: asset.title,
    subtitle: asset.tagline,
    tag: asset.category ? categoryLabels[asset.category] || asset.category : 'Training',
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
