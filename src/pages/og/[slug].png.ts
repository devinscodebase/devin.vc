import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage, type OgImageParams } from '../../lib/og-image';

export const prerender = true;

interface OgPageDef {
  slug: string;
  params: OgImageParams;
}

const pages: OgPageDef[] = [
  { slug: 'default', params: { type: 'default' } },
  { slug: 'projects', params: { type: 'projects' } },
  {
    slug: 'gtm-planner',
    params: {
      type: 'page',
      title: 'GTM Budget Planner',
      subtitle: 'Reverse-engineer your go-to-market funnel',
    },
  },
  {
    slug: 'retention-calculator',
    params: {
      type: 'page',
      title: 'Retention Revenue Calculator',
      subtitle: 'See the real cost of customer churn',
    },
  },
  {
    slug: 'journal',
    params: {
      type: 'page',
      title: 'Journal',
      subtitle: 'Essays on marketing, leadership, and building',
    },
  },
  {
    slug: 'about',
    params: {
      type: 'page',
      title: 'About',
      subtitle: 'Marketing, Operations, Design & Development',
    },
  },
  {
    slug: 'work',
    params: {
      type: 'page',
      title: 'Work',
      subtitle: 'A decade of executive leadership',
    },
  },
  {
    slug: 'contact',
    params: {
      type: 'page',
      title: 'Contact',
      subtitle: 'Get in touch',
    },
  },
];

export const getStaticPaths: GetStaticPaths = () =>
  pages.map((p) => ({ params: { slug: p.slug }, props: { ogParams: p.params } }));

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOgImage(props.ogParams as OgImageParams);

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
