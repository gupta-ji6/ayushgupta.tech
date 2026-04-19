import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://ayushgupta.tech',
  output: 'server',
  adapter: netlify(),
  trailingSlash: 'never',

  integrations: [
    react(),
    mdx(),
    sitemap(),
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
