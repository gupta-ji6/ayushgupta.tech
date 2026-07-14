# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project

Astro 6 portfolio site with React islands and Tailwind CSS v4. `output: 'server'` with the Netlify adapter — pages opt in to prerendering via `export const prerender = true` (all content pages do); API routes run as serverless functions. Node >=22.12 required (see `.nvmrc`).

## Commands

- **Dev server:** `npm run dev` (localhost:4321)
- **Build:** `npm run build`
- **Preview:** `npm run preview` (reuses the Netlify-aware dev server; `astro preview` is unsupported by the adapter)
- **Type check:** `npm run check` (`astro check`)
- **Lint:** `npm run lint`
- **Format:** `npm run format` (scope is `src/**` — `netlify/functions/` and root configs are not covered)

There are no automated tests; verification is done by building plus checking pages in a browser against production (https://ayushgupta.tech).

## Architecture

### Content → Pages pipeline

Content collections are defined in `src/content.config.ts` and live in `src/content/` (blog MDX, jobs, featured/projects, uses, hero, about, etc.). Pages in `src/pages/`:
- Blog post pages from `src/content/blog/` via `src/pages/blog/[slug].astro` (routed by frontmatter `slug`, helpers in `src/utils/blog.ts`)
- Tag pages at `/blog/tags/{tag}` via `src/pages/blog/tags/[tag].astro`

### Import aliases

Configured in `astro.config.mjs` (Vite) and `tsconfig.json` — always use these in imports:
`@components`, `@config`, `@hooks`, `@images`, `@layouts`, `@styles`, `@utils`

### Styling

Tailwind v4 + plain CSS. Design tokens (colors, fonts) are CSS custom properties in `src/styles/global.css`, which also holds shared utility classes (`.big-heading`, `.subtitle`, `.inline-link`, `.big-button`, `.page-reveal`, `.breadcrumb`). Component CSS lives either in scoped `<style>` blocks (`.astro` files) or co-located CSS files imported by React islands (e.g. `src/components/music/music.css`). Prefer extending these shared classes over duplicating animations/styles per page.

### Layout & view transitions

`src/layouts/BaseLayout.astro` wraps all pages — head/SEO, nav, social + email sidebars, footer, and Astro's `<ClientRouter />` view transitions. Home page (`src/pages/index.astro`) composes section components from `src/components/sections/`. The nav header uses `transition:persist` (its scroll listener must survive soft navigation) and `#main-content` uses `transition:animate="none"` (the custom reveal handles entry animation).

### Spotify integration

Spotify API calls are proxied through a Netlify Function (`netlify/functions/spotify.cjs`) with a strict path allowlist. Server-side env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`. Serverless invocation count is a deliberate constraint, kept low by four cache layers — don't add refetching without considering them:
1. The function caches its OAuth token across warm invocations and sends `Netlify-CDN-Cache-Control: ... durable ...` so the CDN serves repeats without invoking it (30s for now-playing, 5min for library endpoints).
2. `spotifyGet` in `src/utils/spotify.ts` has a module-level TTL cache + in-flight dedupe that survives island remounts and soft navigations.
3. The music page's `<details>` sections mount their query panels only on first open (see `DisclosureSection` in `MusicExperience.tsx`).
4. Track preview audio uses `preload='none'`.

React hooks live in `src/hooks/useSpotify.ts`; now-playing render appears in the footer widget, the homepage hero line, and the music page.

### Supabase comments

Blog comments and the music song-recommendation form are stored in a Supabase `comments` table (columns: `post_id`, `author`, `content`, `hidden`, `created_at`; new rows default to `hidden = true` pending approval). The browser never talks to Supabase directly — the Astro API route `src/pages/api/comments.ts` (`prerender = false`, deployed as a serverless function) proxies GET/POST using server-side env vars `SUPABASE_URL` and `SUPABASE_KEY` (publishable key; RLS restricts reads to `hidden = false`). Client hook: `src/hooks/useComments.ts`. `post_id` values are load-bearing: blog posts use the raw frontmatter slug (e.g. `/blog/grid-vs-flex`), the music page uses `/music/`.

### Animations

CSS-only reveal system: `.page-reveal`/`.is-revealed` classes in `global.css`, triggered by `src/components/PageReveal.astro` (re-runs on `astro:page-load` for view transitions; skips elements inside `astro-island` — islands manage their own reveal state). Respect `prefers-reduced-motion` (handled centrally in `global.css`).

### Site config

`src/config/index.ts` — site metadata, nav links, social URLs, verification tokens.

## Gotchas (each of these has bitten a real session)

- **Islands must not return bare `null` from the root.** Astro's React renderer re-probes null-returning components outside a render pass during SSR, logging "Invalid hook call" on every request. Return a fragment with the conditional inside (see `HeroNowPlaying.tsx`).
- **No `Math.random()` in island render paths.** Server and client would disagree → hydration mismatch. Compute a seed in `.astro` frontmatter (server-only) and pass it as a prop (`introSeed` pattern), or compute only after client-side data arrives.
- **Astro scoped CSS does not reach imported child components** — use `:global(...)` selectors for markup rendered by children (recurring bug class: icon sizing).
- **`global.css` sets `svg { fill: currentColor }`**, which beats the `fill="none"` presentation attribute on stroke-based icons; `svg[fill='none'] { fill: none }` restores them. Filled/distorted icons usually mean a new stroke icon hit this.
- **Identical inline scripts are deduped across soft navigations** — Astro won't re-execute them on `ClientRouter` page swaps; hook `astro:page-load` instead of relying on script re-runs.
- **Tailwind preflight zeroes default heading sizes and list styles** — restore explicitly where markdown/content renders (see `.post-content` rules in `blog/[slug].astro`).
- **Page containers**: use `width: 100%; max-width: NNNpx` — `calc(100vw - Xpx)` widths stack on `site-main`'s responsive padding and overflow.

## Environment & deployment

- Deployed on Netlify; production deploys from `main`. `netlify.toml` (build command `npm run build`, publish `dist/`) overrides dashboard settings. `public/_redirects` and `public/_headers` are emitted as-is.
- `astro.config.mjs` mirrors `.env` into `process.env` at startup so the emulated Netlify Function sees credentials in dev (Astro only exposes `.env` via `import.meta.env`; real Netlify env always wins).
- The repo is linked to the Netlify site via `.netlify/state.json` (gitignored, per-checkout). If the dev server nags about linking: `npx netlify link --id fd027885-3ba9-437f-9377-2fe1ec74e437`.
- `CLAUDE.md` mirrors this file for Claude Code — keep both in sync when editing either.
