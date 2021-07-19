const config = require('./src/config');

module.exports = {
  siteMetadata: {
    title: config.siteTitle,
    siteUrl: config.siteUrl,
    description: config.siteDescription,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-robots-txt`,
    `gatsby-plugin-netlify`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`auto`, `webp`],
          placeholder: `blurred`,
          quality: 50,
          breakpoints: [750, 1080, 1366, 1920],
          backgroundColor: `transparent`,
          // tracedSVGOptions: {},
          // blurredOptions: {},
          // jpgOptions: {},
          // pngOptions: {},
          // webpOptions: {},
          // avifOptions: {},
        },
      },
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: config.greenColor,
        // Disable the loading spinner.
        showSpinner: false,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Ayush Gupta',
        short_name: 'GuptaJi',
        start_url: '/',
        background_color: config.darkNavyColor,
        theme_color: config.navyColor,
        display: 'standalone',
        // cache_busting_mode: 'none',
        icon: 'src/images/pwa-logo.png',
        // icons: [
        //   {
        //     src: 'src/images/favicons/maskable-icon-512.png',
        //     sizes: '512x512',
        //     type: 'image/png',
        //     purpose: 'maskable',
        //   },
        // ],
      },
    },
    `gatsby-plugin-offline`,
    // gatsby-plugin-manifest should be listed before gatsby-plugin-offline
    // {
    //   resolve: 'gatsby-plugin-offline',
    //   options: {
    //     workboxConfig: {
    //       globPatterns: ['**/icon-path*'],
    //     },
    //   },
    // },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projects`,
        path: `${__dirname}/content/projects`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            // https://www.gatsbyjs.org/packages/gatsby-remark-external-links
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow noopener noreferrer',
            },
          },
          {
            // https://www.gatsbyjs.org/packages/gatsby-remark-images
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 900,
              showCaptions: true,
              markdownCaptions: true,
              linkImagesToOriginal: false,
              quality: 90,
              tracedSVG: { color: config.greenColor },
              wrapperStyle: `border-radius: 3px; margin: 10px 0; text-align: center;`,
              backgroundColor: 'transparent',
              // withWebp: { quality: 90 },
              // withAvif: { quality: 90 },
            },
          },
          // https://www.gatsbyjs.com/plugins/gatsby-remark-copy-linked-files
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              destinationDir: f => `${f.name}`,
              ignoreFileExtensions: [`png`, `jpg`, `jpeg`],
            },
          },
          {
            // https://www.gatsbyjs.org/packages/gatsby-remark-code-titles/
            resolve: 'gatsby-remark-code-titles',
          }, // IMPORTANT: this must be ahead of other plugins that use code blocks
          {
            // https://www.gatsbyjs.org/packages/gatsby-remark-prismjs
            resolve: `gatsby-remark-prismjs`,
            options: {
              // Class prefix for <pre> tags containing syntax highlighting;
              // defaults to 'language-' (e.g. <pre class="language-js">).
              // If your site loads Prism into the browser at runtime,
              // (e.g. for use with libraries like react-live),
              // you may use this to prevent Prism from re-processing syntax.
              // This is an uncommon use-case though;
              // If you're unsure, it's best to use the default value.
              classPrefix: 'language-',
              // This is used to allow setting a language for inline code
              // (i.e. single backticks) by creating a separator.
              // This separator is a string and will do no white-space
              // stripping.
              // A suggested value for English speakers is the non-ascii
              // character '›'.
              inlineCodeMarker: null,
              // This lets you set up language aliases.  For example,
              // setting this to '{ sh: "bash" }' will let you use
              // the language "sh" which will highlight using the
              // bash highlighter.
              aliases: {},
              // This toggles the display of line numbers globally alongside the code.
              // To use it, add the following line in gatsby-browser.js
              // right after importing the prism color scheme:
              //  require("prismjs/plugins/line-numbers/prism-line-numbers.css")
              // Defaults to false.
              // If you wish to only show line numbers on certain code blocks,
              // leave false and use the {numberLines: true} syntax below
              showLineNumbers: false,
              // If setting this to true, the parser won't handle and highlight inline
              // code used in markdown i.e. single backtick code like `this`.
              noInlineHighlight: false,
              // This adds a new language definition to Prism or extend an already
              // existing language definition. More details on this option can be
              // found under the header "Add new language definition or extend an
              // existing language" below.
              languageExtensions: [
                {
                  language: 'superscript',
                  extend: 'javascript',
                  definition: {
                    superscript_types: /(SuperType)/,
                  },
                  insertBefore: {
                    function: {
                      superscript_keywords: /(superif|superelse)/,
                    },
                  },
                },
              ],
              // Customize the prompt used in shell output
              // Values below are default
              prompt: {
                user: 'root',
                host: 'localhost',
                global: false,
              },
            },
          },
        ],
      },
    },
    // https://gatsbyjs.com/plugins/gatsby-plugin-google-gtag/
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [config.googleAnalyticsID],
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: false,
          // Setting this parameter is also optional
          respectDNT: true,
        },
      },
    },
  ],
};
