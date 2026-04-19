import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: [
      '.astro/**',
      '.netlify/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'static/**',
      'src-gatsby-ref/**',
      'docs/**',
      '.claude/**',
      'netlify/**',
      'gatsby-browser.js',
      'gatsby-config.js',
      'gatsby-node.js',
      'gatsby-ssr.js',
    ],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
