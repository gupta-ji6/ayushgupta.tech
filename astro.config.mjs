import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';
import { loadEnv } from 'vite';

// Astro exposes .env values via import.meta.env only; the emulated Netlify
// Functions (netlify/functions/*) read process.env, so mirror .env into it
// for local dev. Existing process.env values (real Netlify builds) win.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
for (const [key, value] of Object.entries(fileEnv)) {
  process.env[key] ??= value;
}

export default defineConfig({
  site: 'https://ayushgupta.tech',
  output: 'server',
  adapter: netlify(),
  trailingSlash: 'never',

  integrations: [
    react(),
    mdx(),
    sitemap(),
    // Runs Google Tag Manager's gtag.js in a web worker instead of main
    // thread. dataLayer.push must stay forwarded for gtag() calls to reach it.
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': '/src/components',
        '@config': '/src/config',
        '@hooks': '/src/hooks',
        '@images': '/src/images',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@utils': '/src/utils',
      },
    },
  },

  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
    rehypePlugins: [
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['nofollow', 'noopener', 'noreferrer'],
      }],
    ],
  },
});
