# ayushgupta.tech

Source for [ayushgupta.tech](https://ayushgupta.tech), built with [Astro](https://astro.build/), React islands, Tailwind CSS, MDX, and Netlify Functions.

## Stack

- Astro 6
- React 18 islands for interactive widgets
- Tailwind CSS 4 plus local CSS for parity-focused styling
- Astro content collections for homepage content, blog posts, and uses data
- Netlify adapter and Netlify Functions for deployment and Spotify proxying
- Supabase (via an Astro API route proxy) for blog comments and song recommendations

## Development

Use Node `22.x`. Astro currently requires `>=22.12.0`, and this repo is pinned to `22.22.2` via `.nvmrc`.

```bash
npm install
npm run dev
```

Available scripts:

- `npm run dev` starts the Astro dev server
- `npm run build` creates the production build in `dist/`
- `npm run preview` reuses the Netlify-aware local dev server because `@astrojs/netlify` does not support `astro preview`
- `npm run check` runs `astro check`
- `npm run lint` runs ESLint on the Astro app
- `npm run format` runs Prettier on source files

## Content

Site content lives under `src/content/`:

- `blog/` for MDX blog posts
- `featured/`, `projects/`, `jobs/`, `education/`, `hero/`, `about/`, `contact/`, `funFacts/`, and `uses/` for structured site sections

## Environment Variables

Spotify and Supabase features use server-side environment variables for the Netlify function and Astro server output. See `.env.example` for the current keys.

## Deployment

The site is deployed on [Netlify](https://netlify.com). Static assets live in `public/`, the Spotify proxy runs from `netlify/functions/spotify.cjs`, and the Supabase comments proxy runs from the Astro API route `src/pages/api/comments.ts`.

## Links

- Site: [ayushgupta.tech](https://ayushgupta.tech)
- Twitter: [@_guptaji_](https://twitter.com/_guptaji_)
- LinkedIn: [guptaji6](https://www.linkedin.com/in/guptaji6)
