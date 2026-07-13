# Gatsby → Astro Migration Plan

## Summary

Migrate `ayushgupta.tech` from Gatsby 3.x to Astro in the same repository, preserving current URLs, information architecture, and near visual parity at launch. This is a framework migration with targeted simplifications, not a redesign.

### Locked Decisions

- **Framework**: Astro
- **Styling**: Tailwind CSS + local CSS where needed
- **Animations**: CSS keyframes + IntersectionObserver + Astro-native transitions where useful
- **Spotify**: Live server-backed integration via a serverless proxy (Netlify function now; Astro API route remains compatible later)
- **TypeScript**: Full adoption for new Astro code
- **Content**: Markdown for simple collections, MDX for blog posts where richer embed support is needed
- **Comments**: No comments at launch
- **Music recommendations form**: Remove at launch
- **Analytics**: Google Analytics only
- **PWA**: No service worker/offline support; keep manifest/icons
- **Visual direction**: Near visual parity with the current Gatsby site
- **Draft blog posts**: Hidden from indexes/tags, but still routable by direct slug
- **Embeds in blog posts**: Preserve where practical; fall back to plain links for brittle third-party embeds

---

## Phase 0: Migration Strategy & Scaffold

**Goal**: Set up Astro without deleting Gatsby prematurely.

### Steps

1. Create migration branch.
2. Keep the existing Gatsby app intact during the migration as a reference.
3. Initialize Astro in the repo and add required integrations:
   - `@astrojs/react`
   - `@astrojs/tailwind`
   - `@astrojs/mdx`
   - `@astrojs/sitemap`
   - `@astrojs/netlify`
   - `sharp`
4. Configure `astro.config.mjs` with:
   - `site: 'https://ayushgupta.tech'`
   - Netlify adapter
   - hybrid output
   - path aliases mirroring the current repo structure where still useful
5. Add `tsconfig.json` for strict TypeScript with path aliases.
6. Move `static/` assets into Astro’s `public/` shape:
   - `CNAME`
   - `_redirects`
   - `resume.pdf`
   - verification files
7. Update `.nvmrc` to current supported LTS for Astro/Netlify.
8. Update environment variable plan:
   - keep only server-side Spotify env vars
   - remove Hasura/comment env vars from launch scope
9. Update `package.json` scripts for Astro:
   - `dev`
   - `build`
   - `preview`
   - formatting/linting compatible with Astro
10. Keep Gatsby files and dependencies until Astro route parity is confirmed, then remove them in cleanup.

### Verification

- Astro dev server boots.
- Astro build succeeds with placeholder route.
- Netlify config points to Astro output.

---

## Phase 1: Content Model & Collections

**Goal**: Move all content into Astro content collections with schemas that match the real data.

### Collections

Create collections for:

- `blog`
- `projects`
- `featured`
- `jobs`
- `education`
- `uses`
- `about`
- `hero`
- `contact`
- `funFacts`

### Steps

1. Move `content/` into `src/content/`.
2. Keep collection schemas aligned with actual frontmatter already present in the repo.
3. Use:
   - Markdown for simple content collections
   - MDX for blog posts to better handle existing rich content
4. Preserve existing blog `slug` values exactly.
5. Keep blog image references working with Astro content/image handling.
6. Validate frontmatter and content shape against the real files.
7. Ensure collection queries support:
   - draft filtering for listing pages
   - direct lookup by slug
   - tag extraction and grouping

### Important Notes

- Do not assume all blog content is plain markdown. Existing posts contain raw HTML and some third-party embed/script patterns.
- Keep draft posts excluded from public listing/tag pages, but still available by slug route.

### Verification

- `astro check` passes.
- All collections load successfully.
- Blog slugs, tags, and images resolve correctly.

---

## Phase 2: Layout, Styling & Shared Shell

**Goal**: Rebuild the global shell in Astro with near parity to the current site.

### Steps

1. Create `BaseLayout.astro` to replace Gatsby layout responsibilities:
   - head/meta wrapper
   - nav
   - main content container
   - social/email sidebars
   - footer
   - skip link
2. Create `BaseHead.astro` for SEO/meta/canonical/OG/Twitter tags.
3. Port `src/config/index.js` into a typed Astro-friendly config module.
4. Rebuild the nav and shell with:
   - Tailwind for layout/tokens/spacing
   - local CSS for high-fidelity pieces like typography, transitions, scrollbar, selection, and keyframes
5. Use a small React island only for the mobile menu if needed.
6. Remove the old loader completely; it is already disabled and should not return.
7. Keep footer now-playing as a small React island, not a global all-page React shell.
8. Replace Splitbee-specific event assumptions with no-op removal; only GA remains.
9. Keep favicon, manifest, OG image, and verification asset behavior intact.

### Custom Fonts (Critical for Visual Parity)

The site uses two custom font families loaded from local files in `src/fonts/`:

- **Calibre** — primary sans-serif (weights: 300, 400, 500, 600 + italics = 8 @font-face rules)
- **SF Mono** — monospace (weights: 400, 500, 600 + italics = 6 @font-face rules)

These must be ported into `src/styles/global.css` as standard @font-face declarations pointing to the font files in `src/fonts/`. Without these, the site loses its visual identity. Map them in `tailwind.config.mjs`:

```js
fontFamily: {
  calibre: ['Calibre', 'San Francisco', 'SF Pro Text', '-apple-system', 'system-ui', 'sans-serif'],
  mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
}
```

### Theme Tokens (Port from `src/styles/theme.js`)

The current theme has more colors than the obvious ones. Full mapping for `tailwind.config.mjs`:

```
navy: #0a192f, dark-navy: #020c1b, light-navy: #172a45, lightest-navy: #303C55,
slate: #8892b0, light-slate: #a8b2d1, lightest-slate: #ccd6f6, dark-slate: #495670,
white: #e6f1ff, green: #64ffda, pink: #FF647F, yellow: #FFC464, orange: #FF9E64,
blue: #71AFFF, dark-blue: #1D7FFC, highlight: rgba(41,61,90,0.99),
trans-green: rgba(100,255,218,0.07), trans-navy: rgba(10,25,47,0.7)
```

Breakpoints: tiny(330), phone(376), phablet(480), thone(600), tablet(768), desktop(1000), big-desktop(1200), giant(1440).

### GlobalStyle → global.css Migration

Port the following from `src/styles/GlobalStyle.js` (~630 lines) into `src/styles/global.css`:

- All @font-face declarations (14 rules)
- Selection color (lightest-navy bg, lightest-slate text)
- Focus styles (2px dashed green outline, 3px offset)
- Custom scrollbar (thin, dark-slate thumb on navy track)
- Body defaults (navy bg, slate text, Calibre font, font-size 20px / 18px on phablet)
- Heading defaults (weight 600, white color)
- Link hover → green transition
- Animation system: keyframes for fadeup, fadedown, fade, pop, blur, glow, grow, splat, roll, flip, spin, slide, drop + `.animate` class + `.delay-1` through `.delay-15` utility classes
- `.big-heading`, `.medium-heading`, `.subtitle`, `.breadcrumb` utility classes
- Body `.blur` state (for mobile menu overlay)

Skip porting: `.gatsby-image-outer-wrapper`, PrismStyles (replaced by Shiki).

### Verification

- Layout matches the existing site closely on desktop and mobile.
- Nav, sidebars, footer, and skip link work.
- Custom fonts (Calibre, SF Mono) render correctly.
- Scrollbar, selection color, focus outlines match the current site.
- No Splitbee script remains.
- GA loads correctly.

---

## Phase 3: Home Page

**Goal**: Rebuild the homepage sections with the same structure and near the same presentation.
**Status**: Completed on April 19, 2026.

### Sections

- Hero
- About
- Fun Facts
- Jobs
- Education
- Featured
- Projects
- Blog
- Contact

### Steps

1. Port each section as Astro-first components.
2. Use collection data instead of Gatsby GraphQL.
3. Replace ScrollReveal with IntersectionObserver + CSS reveal classes.
4. Keep interactions lightweight:
   - Jobs/Education tabs via small client-side scripts
   - Projects “show more” via small client-side script
   - Fun Facts via lightweight client-side script or tiny island only if necessary
5. Preserve section anchors used by existing nav links.

### Verification

- Homepage content order and section behavior match the current site.
- Anchored nav links still work.
- Reveal and show-more behaviors work without a heavy client bundle.

### Wrap-Up Notes

- Rebuilt all homepage sections as Astro-first components backed by content collections instead of Gatsby GraphQL.
- Replaced ScrollReveal with IntersectionObserver-driven reveal classes and kept interactions in a small inline script for tabs, project expansion, and fact shuffling.
- Preserved `#projects` anchor behavior used by the global nav.
- Kept the interaction layer progressive-enhancement friendly so the page still renders readable content without JavaScript.

---

## Phase 4: Blog System

**Status**: Completed on April 20, 2026.

**Goal**: Rebuild blog listing, tags, and post pages while preserving route behavior and content fidelity.

### Routes

- `/blog`
- `/blog/[slug]`
- `/blog/tags`
- `/blog/tags/[tag]`

### Steps

1. Recreate blog listing page with current sorting and metadata display.
2. Recreate blog post page with:
   - title
   - description
   - date
   - tags
   - cover image
   - author block
   - share UI if retained
3. Generate routes for all blog posts, including drafts.
4. Exclude drafts from:
   - blog index
   - tags index
   - tag-filtered pages
5. Use MDX/blog rendering that supports current post content realistically.
6. Configure markdown plugins in `astro.config.mjs`:
   - `rehype-external-links` — open external links in new tab with `rel="nofollow noopener noreferrer"` (replaces `gatsby-remark-external-links`)
   - Shiki theme (e.g., `one-dark-pro`) for code syntax highlighting (replaces `gatsby-remark-prismjs`)
   - Astro's built-in image optimization for images in markdown (replaces `gatsby-remark-images`)
7. Preserve embeds where practical:
   - keep working iframe/embed content
   - where third-party script embeds are brittle in Astro/MDX, replace with plain links or a simpler fallback
8. Remove comments from launch entirely:
   - no comment list
   - no submission form
   - no Hasura runtime dependency

### Verification

- All published posts render correctly.
- Drafts are directly routable but not listed.
- Tag pages work.
- Existing post slugs remain unchanged.
- No comments section appears on blog posts.

---

## Phase 5: Music Page & Spotify Integration

**Status**: Completed on April 20, 2026.

**Goal**: Keep the music experience live, but remove comment/form dependencies.

### Current Main Branch Baseline (April 20, 2026)

- Spotify secrets are already server-side on `main` via `netlify/functions/spotify.cjs`; the old direct client-secret flow is no longer the source of truth.
- The current client utility calls `/.netlify/functions/spotify?path=...` and the server-side proxy enforces an allowlist of Spotify paths instead of exposing arbitrary upstream access.
- The current music route surface on `main` is:
  - live now playing widget
  - top tracks with short / medium / long term toggle
  - favourite playlist
  - recently played
  - recently saved tracks
  - top artists with short / medium / long term toggle
  - recently saved playlists
- The current Gatsby music page still has a Supabase-backed song recommendation form and count (`useComments('/music/')`). Astro launch should intentionally remove that behavior per the locked product decision rather than accidentally preserving it.
- Spotify playlist response handling has already needed defensive logic on `main` because total track count may be exposed as either `tracks.total` or `items.total`. Carry this forward in the Astro migration.

### Launch Scope

Keep:

- Now Playing
- Top Tracks
- Favourite Playlist
- Recently Played
- Recently Saved Tracks
- Top Artists
- Recently Saved Playlists

Remove:

- Song recommendation form
- Music-page comment count/submission behavior

### Steps

1. Start from the current `main` branch Spotify proxy architecture, not the legacy client-secret flow.
2. Preserve the server-only credential model:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`
3. Keep the existing allowlisted Spotify access model when porting to Astro:
   - either keep the Netlify Function proxy during migration for parity
   - or replace it with Astro API routes only after matching the same allowed path behavior
4. Preserve the currently used Spotify route surface:
   - `/me/player/currently-playing`
   - `/me/player/recently-played`
   - `/me/playlists`
   - `/me/tracks`
   - `/me/top/tracks`
   - `/me/top/artists`
   - `/me`
   - `/playlists/{id}`
5. Rebuild the music page with the current section set and behavior:
   - Astro shell page
   - focused React islands only where stateful controls are needed
   - range toggles for Top Tracks and Top Artists
   - defensive playlist metadata handling (`items.total` vs `tracks.total`)
6. Keep footer now-playing live and lightweight.
7. Remove the recommendation form and its backing dependencies from launch:
   - drop `useComments('/music/')`
   - drop Supabase-backed recommendation count/submission behavior
   - remove any UI copy that asks users to submit song recommendations via a form
8. Ensure no Spotify secrets reach the client bundle and no comment/form dependency remains on `/music`.

### Verification

- Music route loads and all sections fetch correctly.
- Footer now-playing works.
- No recommendation form appears.
- No client-exposed Spotify secrets.
- Top Tracks and Top Artists range toggles still work.
- Favourite playlist and saved playlist counts render correctly despite Spotify response shape differences.

---

## Phase 6: Uses, 404, and Remaining Pages

**Status**: Completed on April 20, 2026.

**Goal**: Finish the remaining non-blog routes.

### Steps

1. Rebuild `/uses` using collection content.
2. Keep the current disclosure/accordion behavior, using native HTML where practical.
3. Rebuild `/404`.
4. Preserve existing links and basic metadata behavior for remaining routes.
5. Keep asset references and OG images working.

### Verification

- `/uses` matches current content and interaction patterns.
- `/404` renders correctly.
- No broken internal links across core pages.

---

## Phase 7: SEO, Deploy, and Cleanup

**Status**: Completed on April 20, 2026.

**Goal**: Make Astro production-ready and remove Gatsby once parity is confirmed.

### Steps

1. Finalize SEO:
   - canonical URLs
   - Open Graph
   - Twitter cards
   - sitemap
   - robots if needed
2. Keep GA only.
3. Keep manifest/icons, but no service worker or offline behavior.
4. Verify Netlify deployment and environment variable configuration.
5. Audit production pages:
   - `/`
   - `/blog`
   - representative blog post
   - `/music`
   - `/uses`
6. Once Astro parity is confirmed:
   - remove Gatsby config/files
   - remove Gatsby-only dependencies
   - remove Hasura/comment-related launch codepaths
   - update README and repo docs to reflect Astro architecture

### Verification

- Production deploy succeeds on Netlify.
- Core pages render correctly.
- No console errors.
- No Gatsby runtime or Hasura runtime dependency remains in the shipped launch.
- For local runtime checks with the Netlify adapter, use `astro dev`; `astro preview` is not supported by `@astrojs/netlify`.

---

## Acceptance Tests

### Route & URL Parity

- Existing public URLs continue to work.
- Blog slugs stay unchanged.
- Tag URLs stay unchanged.

### Content Fidelity

- All homepage content matches the current site.
- Blog posts retain content, images, tags, and author block.
- Rich embeds are preserved where practical and safely degraded otherwise.

### Launch Behavior

- No comments appear anywhere.
- No song recommendation form appears on `/music`.
- Draft blog posts are hidden from indexes but accessible directly.

### Runtime & Security

- Spotify data remains live.
- Secrets are server-only.
- Netlify deployment handles API routes correctly.

### UX & Quality

- Responsive behavior matches the current site closely.
- Accessibility basics are preserved:
  - skip link
  - semantic headings
  - keyboard-usable nav/menu
  - sensible focus states

---

## Future TODOs (Post-Launch)

- [ ] Comments system with Supabase (replace dropped Hasura integration)
- [ ] Dynamic OG image generation per blog post (via Satori/`@vercel/og`-style)
- [ ] RSS feed (`@astrojs/rss` integration)
- [ ] Dark/light theme toggle (currently dark-only)
- [ ] Blog search functionality
- [ ] Reading time estimate on blog posts
- [ ] Content draft preview mode

---

## Dependencies Summary

### Add (Astro ecosystem)

`astro`, `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/netlify`, `tailwindcss`, `sharp`, `rehype-external-links`, `prettier-plugin-astro`, `eslint-plugin-astro`

### Keep

`react` + `react-dom` (upgrade to 18+), `lodash` (kebabCase for tags), `react-hot-toast` (music page only)

### Drop

All `gatsby-*` packages, `styled-components`, `babel-plugin-styled-components`, `scrollreveal`, `animejs`, `miniraf`, `react-helmet`, `prop-types`, `react-transition-group`, `prismjs`, `use-comments`, `@splitbee/web`, all `babel-*` packages, `gh-pages`

---

## Gotchas & Lessons from Real Migrations

Sourced from 5 Gatsby→Astro migration blog posts. Only items relevant to this project are included.

### Content & Frontmatter (Phase 1)

- **Strict schema validation**: Astro's Zod schemas are much stricter than Gatsby's GraphQL. Inconsistent date formats, missing optional fields, or type mismatches across markdown files will cause build failures. Audit all frontmatter before defining schemas — don't assume consistency.
- **MDX is stricter than Gatsby's MDX v1**: Expressions that were valid in Gatsby's older MDX pipeline may fail. Raw HTML with attributes like `style="position:relative"` may need adjustment. Test each blog post individually after migration.
- **Image paths in frontmatter**: Relative image references that worked in Gatsby's GraphQL layer don't automatically resolve in Astro content collections. Astro 4+ supports `./image.png` relative to the markdown file, but verify each cover image resolves.

### Styling & CSS (Phase 2)

- **CSS keyframe tree-shaking**: `@keyframes` rules can be removed as "dead code" during build compression. Define animations in Tailwind config or in `global.css` with explicit usage to guarantee inclusion — don't rely on class-based references alone.
- **WOFF font rendering failure**: WOFF fonts caused total rendering failure on some Android devices. Use WOFF2 as primary format (we already have WOFF2 files, so prioritize them in `@font-face` `src` order — WOFF2 first).
- **FOUC risk**: Flash of unstyled content is possible with Astro's MPA model. Ensure critical CSS (body background, font-family) loads synchronously. Inline critical styles if needed.

### Routing & URLs (Phase 4, 7)

- **Trailing slash behavior**: Astro and Gatsby handle trailing slashes differently. This can cause redirect loops or 404s. Configure `trailingSlash` explicitly in `astro.config.mjs` to match the current Gatsby behavior.
- **Gatsby PWA service worker persistence**: Old Gatsby service worker may be cached on returning visitors' devices, serving stale content after migration. Register a no-op service worker that immediately `self.skipWaiting()` + `clients.claim()` to force cache clear. Add this to `public/sw.js` even though we're dropping PWA.

### Performance (Phase 7)

- **Hero image LCP**: Don't lazy-load the hero/above-fold image. Use `loading="eager"` or omit `loading` attribute on the first visible image to avoid LCP regression.
- **Bundle size win**: Multiple authors report 5-7x smaller bundles after migration. Expect similar gains since most of our sections will be zero-JS Astro components.
- **Build time win**: Expect 2-3x faster builds (Gatsby ~4min → Astro ~1-2min on Netlify).

### Architecture (Phase 3, 5)

- **MPA vs SPA navigation feel**: Astro is MPA — page transitions won't feel as instant as Gatsby's prefetched SPA navigation. Astro View Transitions API (already in our plan) mitigates this with crossfade/slide effects.
- **Vanilla JS over React islands**: Multiple authors found vanilla JS with `is:inline` scripts + data attributes sufficient for dark mode toggles, tab switching, etc. Confirms our plan to use `<script>` tags for Jobs/Education tabs and Projects "show more" — React islands only where truly needed (music page, mobile menu).
- **No built-in favicon generation**: Gatsby's `gatsby-plugin-manifest` auto-generated favicons from a source image. We need to pre-generate favicon sizes manually or use a tool like `realfavicongenerator.net` and place them in `public/`.

### Action Items Added to Plan

1. Add `trailingSlash: 'never'` (or `'always'` — match current Gatsby behavior) to `astro.config.mjs` → **Phase 0**
2. Add no-op `public/sw.js` to clear old Gatsby service worker → **Phase 0**
3. Audit all frontmatter for consistency before writing Zod schemas → **Phase 1**
4. Test each blog post individually after MDX conversion → **Phase 4**
5. Set hero image to `loading="eager"` → **Phase 3**
6. Pre-generate favicons and place in `public/` → **Phase 2**

---

## Assumptions

- Deployment remains on Netlify.
- Domain and public route structure remain unchanged.
- Comments preservation or migration is intentionally deferred to a later phase.
- Visual polish can improve slightly during migration, but no intentional redesign work is included in launch scope.
