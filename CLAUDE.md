# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gatsby 3.x static portfolio site (React 17, styled-components 5). Deployed on Netlify. Node 14.16.0 required (see `.nvmrc`).

## Commands

- **Dev server:** `npm run develop` (localhost:8000)
- **Build:** `npm run build`
- **Serve production build:** `npm run serve`
- **Format:** `npm run format` (prettier on `src/**/*.{js,jsx}`)
- **Lint:** `npx eslint src/` (eslint via `@upstatement/eslint-config/react`)
- **Deploy:** `npm run deploy` (builds then pushes to gh-pages)

Pre-commit hook runs `pretty-quick --staged && lint-staged` (eslint --fix on staged JS files).

## Architecture

### Content → Pages pipeline

Markdown files in `content/` are sourced via `gatsby-source-filesystem` and processed by `gatsby-transformer-remark`. `gatsby-node.js` creates:
- Blog post pages from `content/blog/` using `src/templates/article.js` (routed by frontmatter `slug`)
- Tag pages at `/blog/tags/{tag}/` using `src/templates/tag.js`

### Webpack aliases

Configured in `gatsby-node.js` — always use these in imports:
`@components`, `@config`, `@fonts`, `@hooks`, `@images`, `@pages`, `@styles`, `@utils`

### Styling

CSS-in-JS with styled-components. Theme defined in `src/styles/theme.js` (colors, fonts, sizes). Reusable mixins in `src/styles/mixins.js`. Media breakpoints in `src/styles/media.js`. Global styles and CSS animations in `src/styles/GlobalStyle.js`.

### Layout

`src/components/layout.js` wraps all pages — provides nav, social sidebar, email sidebar, footer. Home page (`src/pages/index.js`) composes section components from `src/components/sections/`.

### Spotify integration

Client-side API calls in `src/utils/spotify.js` with OAuth refresh token flow. Custom hooks in `src/hooks/` (`useTopTracks`, `useNowPlayingTrack`, `useRecentlyPlayedTracks`, etc.). Requires env vars: `GATSBY_SPOTIFY_CLIENT_ID`, `GATSBY_SPOTIFY_CLIENT_SECRET`, `GATSBY_SPOTIFY_REFRESH_TOKEN`.

### Animations

ScrollReveal (config in `src/utils/sr.js`) + React Transition Group + CSS keyframe animations. Libraries `scrollreveal`, `animejs`, `miniraf` are null-loaded during SSR build (see `gatsby-node.js`). `usePrefersReducedMotion` hook for accessibility.

### Site config

`src/config/index.js` — site metadata, nav links, social URLs, theme colors for the manifest.
