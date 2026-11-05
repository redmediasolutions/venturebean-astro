// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://venturebean.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://venturebean.com/coaching-page/' &&
        page !== 'https://venturebean.com/insights/',
      serialize: (item) => {
        // High priority for homepage and main service/about pages
        if (item.url === 'https://venturebean.com/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (
          item.url === 'https://venturebean.com/about-us/' ||
          item.url === 'https://venturebean.com/business-consulting/' ||
          item.url === 'https://venturebean.com/coaching/' ||
          item.url === 'https://venturebean.com/venturebean-solutions-page/' ||
          item.url === 'https://venturebean.com/knowledge-hub/' ||
          item.url === 'https://venturebean.com/contact-us/'
        ) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (
          item.url.includes('/knowledge-hub/') ||
          item.url === 'https://venturebean.com/clients/' ||
          item.url === 'https://venturebean.com/testimonials/' ||
          item.url === 'https://venturebean.com/case-studies/' ||
          item.url === 'https://venturebean.com/consulting-case-studies/' ||
          item.url === 'https://venturebean.com/coaching-case-studies/'
        ) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        }
        item.lastmod = new Date();
        return item;
      },
    }),
    {
      name: 'sitemap-xml-alias',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const fs = await import('node:fs/promises');
          const indexPath = new URL('sitemap-index.xml', dir);
          const aliasPath = new URL('sitemap.xml', dir);
          await fs.copyFile(indexPath, aliasPath);
        },
      },
    },
  ],
  redirects: {
    '/coaching-page/': '/coaching/',
    '/insights/': '/knowledge-hub/insights/',
  },
  build: {
    inlineStylesheets: 'never',
  },
  // Keep whitespace exactly as written: the saved WordPress markup relies on
  // spaces between inline elements (pagination, links inside text).
  compressHTML: false,
  // Snapshot HTML is large; keep Vite from warning about it.
  vite: {
    build: { chunkSizeWarningLimit: 1500 },
  },
});
