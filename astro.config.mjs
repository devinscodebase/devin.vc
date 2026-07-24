// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.devin.vc',

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      CAL_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CAL_EVENT_TYPE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

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
