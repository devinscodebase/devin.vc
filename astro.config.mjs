// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.devin.vc',
  integrations: [
    svelte(),
    react(),
    mdx(),
    sanity({
      projectId: 'ka7dwvnq',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/studio',
    }),
  ],

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