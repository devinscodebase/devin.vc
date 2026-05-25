// @ts-check
import { defineConfig, envField } from 'astro/config';

import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

import sanity from '@sanity/astro';

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