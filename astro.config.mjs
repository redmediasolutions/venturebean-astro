// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://venturebean.com',
  trailingSlash: 'always',
  redirects: {
    '/coaching-page/': '/coaching/',
  },
  build: {
    inlineStylesheets: 'never',
  },
  // Snapshot HTML is large; keep Vite from warning about it.
  vite: {
    build: { chunkSizeWarningLimit: 1500 },
  },
});
