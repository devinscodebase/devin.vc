// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.devin.vc',
  integrations: [svelte(), react(), mdx(), keystatic()],

  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});