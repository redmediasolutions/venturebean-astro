
// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://venturebean.com',
  trailingSlash: 'always',

  // Static site generation
  output: 'static',

  // Vercel deployment configuration
  adapter: vercel({
    webAnalytics: { enabled: true },
    imagesConfig: {
      sizes: [320, 640, 1280],
    },
  }),

  // URL redirects
  redirects: {
    '/coaching-page/': '/coaching/',
    '/insights/': '/knowledge-hub/insights/',
    // Case Studies
    '/coaching-case-studies/': '/case-studies/coaching/',
    '/consulting-case-studies/': '/case-studies/consulting/',
  },

  build: {
    inlineStylesheets: 'never',
  },

  // Keep whitespace exactly as written for legacy/WordPress markup
  compressHTML: false,

  // Vite configuration
  vite: {
    plugins: [
      tailwindcss(),
    ],
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
});
