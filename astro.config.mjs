// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://venturebean.com',
  trailingSlash: 'always',
  
  // Choose how you want routes rendered:
  // - 'server': Renders everything dynamically on-demand by default.
  // - 'static': Keeps pages prerendered by default, allowing you to opt specific routes out.
  output: 'static', 

  adapter: vercel({
    webAnalytics: { enabled: true },
    imagesConfig: {
      sizes: [320, 640, 1280],
    },
  }),

  redirects: {
    '/coaching-page/': '/coaching/',
    '/insights/': '/knowledge-hub/insights/',
  },
  build: {
    inlineStylesheets: 'never',
  },
  // Keep whitespace exactly as written for legacy/WordPress markup
  compressHTML: false,
  // Snapshot HTML is large; keep Vite from warning about it
  vite: {
    build: { chunkSizeWarningLimit: 1500 },
  },
});