Let me research the current state of these frameworks to give you a well-grounded comparison.

Researching all three options in parallel — I'll have a comparison ready shortly once the research completes.

The Astro research agent hit permission issues. Let me wait for the other two and then compile the comparison using my existing knowledge plus whatever they found.

Two of three research agents done. Waiting on the Next.js one to complete before I give you the full comparison.

All research is in. Here's my analysis tailored to your site.

Framework Comparison for ayushgupta.tech
Your site's key traits
Mostly static (portfolio sections, markdown blog, uses page)
Client-side Spotify API integration (OAuth refresh token flow, custom hooks)
styled-components throughout (theme, mixins, global styles)
ScrollReveal + anime.js animations (client-only, SSR null-loaded)
Deployed on Netlify with PWA support
1. Astro — Best fit
Why it wins for this site:

Purpose-built for content sites. Portfolio + blog is Astro's sweet spot.
Content Collections replace your entire gatsby-transformer-remark + gatsby-node.js pipeline with a typed, validated system. Your content/blog/ markdown files work with minimal changes.
Zero JS by default. Static sections (hero, about, jobs, education, projects) ship as pure HTML — no JS bundle. Only interactive parts (Spotify widgets, animations) hydrate as "islands" via client:load / client:visible.
Built-in image optimization (astro:assets) replaces gatsby-plugin-image + gatsby-plugin-sharp.
Built-in integrations for sitemap, RSS, code highlighting (Shiki — better than PrismJS), and Netlify deployment.
Uses Vite under the hood — fast HMR, modern DX.
React components work via @astrojs/react. Your Spotify hooks, now-playing widget, etc. can be kept as React islands.
Trade-offs:

Not a full React SPA — pages are MPA (multi-page app). View Transitions API bridges this gap.
styled-components is awkward in Astro. You'd likely migrate to Tailwind CSS or CSS Modules for Astro page shells, keeping styled-components only inside React islands if needed.
Animations: ScrollReveal/anime.js work inside client:load islands, but you might find Astro's built-in View Transitions + CSS animations sufficient.
Migration effort: Medium. Markdown content ports easily. Layout/pages rewritten as .astro files. React components kept as islands for interactive parts.

2. Next.js — Safe mainstream choice
Strengths:

Full React — your entire component tree stays React. Lowest conceptual migration.
App Router + RSC: static pages can be Server Components (zero client JS). Dynamic parts use 'use client'.
next/image is excellent — blur placeholders, responsive sizing, Netlify Image CDN support.
First-class SEO: built-in metadata export, app/sitemap.ts, app/robots.ts, dynamic OG image generation. All better than Gatsby's plugin approach.
generateStaticParams() directly replaces your gatsby-node.js createPages.
Netlify fully supports Next.js via OpenNext adapter.
Turbopack (default in Next.js 16) — ~400% faster dev startup than webpack.
Trade-offs:

styled-components forces Client Components. Since your entire UI uses styled-components, you'd lose most RSC benefits. This is the biggest friction point. You'd either accept this (fine for a portfolio) or migrate to Tailwind/CSS Modules.
Heavier framework than needed for a mostly-static site. You're bringing SSR/ISR/middleware machinery you won't use.
React 17 → 19 upgrade required (ReactDOM.render → createRoot, etc.).
Node 14 → 18+ required.
Every gatsby-plugin-* needs a manual replacement (see the research for the full mapping).
Migration effort: Medium. More plugin-by-plugin replacement work, but the React component migration is straightforward.

3. Vite + React (with Vike) — Not recommended
Why not:

No built-in content pipeline. You'd wire up markdown parsing, routing, image optimization, sitemap, SEO, etc. yourself.
Vike is the only serious SSG option for Vite+React, and its community is much smaller.
Maximum flexibility, but for a content site you'd be rebuilding what Astro gives you for free.
Makes sense for apps, not content sites.
Recommendation Matrix
Astro	Next.js	Vite+Vike
Content/blog DX	Excellent	Good	Poor (DIY)
React compatibility	Islands only	Full	Full
Bundle size (static pages)	Minimal (zero JS default)	Good (RSC)	Good
Image optimization	Built-in	Built-in	DIY
styled-components story	Awkward (migrate CSS)	Works (forces client)	Works
Spotify integration	React islands	Client components	Client components
Netlify support	First-class	First-class	Manual
Migration effort	Medium	Medium	High
Overkill factor	Low	Moderate	N/A
My recommendation: Astro
Your site is a content-first portfolio with a blog and some interactive widgets. Astro is designed exactly for this. The key advantages:

Dramatically smaller bundles — your about, jobs, education, projects sections become zero-JS HTML.
Content Collections are a massive DX upgrade over Gatsby's GraphQL layer for markdown.
Spotify/animation components stay as React islands — you keep the React code that actually needs to be interactive.
You're already going to touch styling regardless of framework (styled-components has friction everywhere). Astro + Tailwind is the cleanest end state.
The one reason to pick Next.js instead: if you plan to add significant dynamic features (auth, dashboards, API routes, ISR) and want to stay 100% in React. For a portfolio site, that's unlikely.