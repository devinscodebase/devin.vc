// @ts-check
import { defineConfig, envField } from 'astro/config';

import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import { createClient } from '@sanity/client';

// ─── Build the sitemap's dynamic page list from Sanity at build time ───
// Astro's sitemap integration only auto-discovers prerendered routes, so
// SSR content pages (journal posts, training assets) need to be added here.
const SITE_URL = 'https://www.devin.vc';

async function fetchDynamicPages() {
  try {
    const client = createClient({
      projectId: 'ka7dwvnq',
      dataset: 'production',
      useCdn: true,
      apiVersion: '2024-01-01',
    });
    const [posts, assets] = await Promise.all([
      client.fetch(`*[_type == "journal" && !(_id in path("drafts.**")) && noIndex != true]{"slug": slug.current}`),
      client.fetch(`*[_type == "trainingAsset" && !(_id in path("drafts.**")) && noIndex != true]{"slug": slug.current}`),
    ]);
    return [
      ...posts.map((p) => `${SITE_URL}/journal/${p.slug}`),
      ...assets.map((a) => `${SITE_URL}/training/${a.slug}`),
    ];
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic pages from Sanity:', err);
    return [];
  }
}

const dynamicSitemapPages = await fetchDynamicPages();

// https://astro.build/config
export default defineConfig({
  site: 'https://www.devin.vc',

  env: {
    schema: {
      TURSO_DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      RESEND_AUDIENCE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_GTM_PLANNER_AUDIENCE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_RETENTION_CALC_AUDIENCE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_SCORECARD_AUDIENCE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_TRAINING_AUDIENCE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      NEWSLETTER_SECRET: envField.string({ context: 'server', access: 'secret' }),
      CAL_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CAL_EVENT_TYPE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  integrations: [
    svelte(),
    react(),
    mdx(),
    sanity({
      projectId: 'ka7dwvnq',
      dataset: 'production',
      useCdn: true,
      studioBasePath: '/studio',
    }),
    sitemap({
      // Exclude private, transactional, API, admin, and gated routes from
      // discovery. The OG image endpoints are static assets — keep them out
      // of the sitemap.
      filter: (page) => {
        // Astro emits trailing slashes by default — normalize for matching.
        const path = new URL(page).pathname.replace(/\/$/, '') || '/';
        if (path.startsWith('/api/')) return false;
        if (path.startsWith('/studio')) return false;
        if (path.startsWith('/og/')) return false;
        if (path.startsWith('/dashboard')) return false;
        if (path.startsWith('/proposals/') || path === '/proposals') return false;
        if (path === '/confirm' || path === '/unsubscribe') return false;
        // Gated word-list content lives at /training/{slug}/words; the
        // landing pages (one level shallower) are the indexable surface.
        if (path.startsWith('/training/') && path.endsWith('/words')) return false;
        return true;
      },
      customPages: dynamicSitemapPages,
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  image: {
    // Allow the Sanity CDN as a remote image source so <Image /> can serve
    // and optimize images from urlFor() URLs.
    domains: ['cdn.sanity.io'],
  },

  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  adapter: cloudflare()
});