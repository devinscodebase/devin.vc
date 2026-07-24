# devin.vc

Marketing site for Devin Alexander, built on Astro 7 with React islands and
the Marker design system.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 7 (Vite 8), SSR |
| UI | React 19 islands, `motion` for animation |
| Styles | Tailwind CSS 4, driven by `src/styles/global.css` |
| Hosting | Cloudflare Workers via `@astrojs/cloudflare` |
| Email | Resend |
| Bookings | Cal.com (`/api/availability`) |

No database, no CMS, no auth. Those were removed deliberately; see
`updates.md` for what went and why.

## Commands

```bash
bun install
bun run dev      # http://localhost:4321
bun run build
bun test
```

## Layout

```
src/
  components/   React islands and page sections
  config/       nav
  icons/        Streamline Freehand SVGs (the only icon set)
  layouts/      Site.astro shell
  lib/          pricing, resend client, turnstile
  pages/        7 routes, thin .astro shells over React
  styles/       global.css IS the design system
```

## Design system

`src/styles/global.css` is the source of truth in code, `/components` is the
rendered catalog, and `docs/design.md` is the prose spec. Read the spec before
building UI. Nothing ships that is not built from system classes and tokens.

## Deployment

Deploys as a Cloudflare Worker with static assets. `wrangler.jsonc` carries
`nodejs_compat`. Pushing to `main` triggers the production deploy, so do not
push unless you mean to release.
