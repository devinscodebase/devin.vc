# devin.vc

Marketing site for Devin Alexander, built on Astro 7 with React islands and
the Marker design system.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 7 (Vite 8), fully static |
| UI | React 19 islands, `motion` for animation |
| Styles | Tailwind CSS 4, driven by `src/styles/global.css` |

Ten dependencies, one dev dependency. There is no server layer: no
database, no CMS, no auth, no email, no API routes, no environment
variables. `astro build` emits plain static HTML to `dist/`. All of that
was removed deliberately; see `updates.md` for what went and why.

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
  lib/          pricing (pure client-side math)
  pages/        7 routes, thin .astro shells over React
  styles/       global.css IS the design system
```

## Design system

`src/styles/global.css` is the source of truth in code, `/components` is the
rendered catalog, and `docs/design.md` is the prose spec. Read the spec before
building UI. Nothing ships that is not built from system classes and tokens.

## Deployment

`dist/` is plain static output, so it deploys to Cloudflare Pages from the
existing Git integration with no adapter and no wrangler config. Pushing to
`main` triggers the production deploy, so do not push unless you mean to
release.
