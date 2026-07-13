# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Astro 6 portfolio site with React islands and Tailwind CSS v4. `output: 'server'` with the Netlify adapter — pages opt in to prerendering via `export const prerender = true` (all content pages do); API routes run as serverless functions. Node >=22.12 required (see `.nvmrc`).

## Commands

- **Dev server:** `npm run dev` (localhost:4321)
- **Build:** `npm run build`
- **Preview:** `npm run preview` (reuses the Netlify-aware dev server; `astro preview` is unsupported by the adapter)
- **Type check:** `npm run check` (`astro check`)
- **Lint:** `npm run lint`
- **Format:** `npm run format`

## Architecture

### Content → Pages pipeline

Content collections are defined in `src/content.config.ts` and live in `src/content/` (blog MDX, jobs, featured/projects, uses, hero, about, etc.). Pages in `src/pages/`:
- Blog post pages from `src/content/blog/` via `src/pages/blog/[slug].astro` (routed by frontmatter `slug`, helpers in `src/utils/blog.ts`)
- Tag pages at `/blog/tags/{tag}` via `src/pages/blog/tags/[tag].astro`

### Import aliases

Configured in `astro.config.mjs` (Vite) and `tsconfig.json` — always use these in imports:
`@components`, `@config`, `@hooks`, `@images`, `@layouts`, `@styles`, `@utils`

### Styling

Tailwind v4 + plain CSS. Design tokens (colors, fonts) are CSS custom properties in `src/styles/global.css`, which also holds shared utility classes (`.big-heading`, `.subtitle`, `.inline-link`, `.big-button`, `.page-reveal`, `.breadcrumb`). Component CSS lives either in scoped `<style>` blocks (`.astro` files) or co-located CSS files imported by React islands (e.g. `src/components/music/music.css`). Note: Astro scoped CSS does not reach imported child components — use `:global(...)` selectors for that.

### Layout

`src/layouts/BaseLayout.astro` wraps all pages — head/SEO, nav, social + email sidebars, footer, and Astro's `<ClientRouter />` view transitions. Home page (`src/pages/index.astro`) composes section components from `src/components/sections/`.

### Spotify integration

Spotify API calls are proxied through a Netlify Function (`netlify/functions/spotify.cjs`) to keep secrets server-side. The client utility (`src/utils/spotify.ts`) calls `/.netlify/functions/spotify?path=...`; React hooks live in `src/hooks/useSpotify.ts`. Server-side env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`.

### Supabase comments

Blog comments and the music song-recommendation form are stored in a Supabase `comments` table (columns: `post_id`, `author`, `content`, `hidden`, `created_at`; new rows default to `hidden = true` pending approval). The browser never talks to Supabase directly — the Astro API route `src/pages/api/comments.ts` (`prerender = false`, deployed as a serverless function) proxies GET/POST using server-side env vars `SUPABASE_URL` and `SUPABASE_KEY` (publishable key; RLS restricts reads to `hidden = false`). Client hook: `src/hooks/useComments.ts`. `post_id` values are load-bearing: blog posts use the raw frontmatter slug (e.g. `/blog/grid-vs-flex`), the music page uses `/music/`.

### Animations

CSS-only reveal system: `.page-reveal`/`.is-revealed` classes in `global.css`, triggered by `src/components/PageReveal.astro` (re-runs on `astro:page-load` for view transitions). React islands toggle the same classes from `useEffect`. Respect `prefers-reduced-motion` (handled centrally in `global.css`).

### Site config

`src/config/index.ts` — site metadata, nav links, social URLs, verification tokens.
