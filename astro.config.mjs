// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://venturebean.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // Used only as a fallback before `npm run assets` has pulled images locally.
    domains: ['venturebean.com'],
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
