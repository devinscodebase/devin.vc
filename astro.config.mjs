// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.devin.vc',

  // No env schema: there is no server layer yet. Declare secrets here
  // as they are reintroduced.

  integrations: [
    react(),
    sitemap({
      // API endpoints and OG image routes are assets, not pages.
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '') || '/';
        if (path.startsWith('/api/')) return false;
        if (path.startsWith('/og/')) return false;
        return true;
      },
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    // motion/react gets pre-bundled by the dep optimizer with its own
    // React copy, which breaks hooks at hydration ("Invalid hook call").
    // Optimizing it together with react keeps one shared copy.
    optimizeDeps: {
      include: ['motion/react', 'react', 'react-dom'],
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  adapter: cloudflare(),
});
