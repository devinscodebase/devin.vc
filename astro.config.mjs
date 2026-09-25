import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

function pagesFunctionsInDev() {
  return {
    name: 'pages-functions-in-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const env = loadEnv('development', process.cwd(), '');
        server.middlewares.use('/api', async (req, res, next) => {
          const name = (req.url ?? '').split('?')[0].replace(/^\/+|\/+$/g, '');
          if (!/^[a-z-]+$/.test(name)) return next();
          const handlerName = req.method === 'POST' ? 'onRequestPost' : req.method === 'GET' ? 'onRequestGet' : null;
          let module;
          try {
            module = await server.ssrLoadModule(`/functions/api/${name}.ts`);
          } catch {
            return next();
          }
          const handler = handlerName ? module[handlerName] : null;
          if (!handler) {
            res.statusCode = 405;
            res.end();
            return;
          }
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const request = new Request(`http://${req.headers.host}${req.originalUrl ?? req.url}`, {
            method: req.method,
            headers: new Headers(Object.entries(req.headers).filter(([, value]) => typeof value === 'string')),
            body: req.method === 'GET' ? undefined : Buffer.concat(chunks),
          });
          const response = await handler({ request, env });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        });
      },
    },
  };
}

export default defineConfig({
  site: 'https://www.devin.vc',

  integrations: [
    react(),
    pagesFunctionsInDev(),
    sitemap({
      filter: (page) => !/^\/(components|unsubscribe)/.test(new URL(page).pathname),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
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
});
