// @ts-check
import { defineConfig } from 'astro/config';
<<<<<<< Updated upstream
import vercel from '@astrojs/vercel';
=======
import { loadEnv } from 'vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

/*
 * Firebase web keys (public, read-only). Taken from .env locally, or from the
 * Cloudflare build variables — named either PUBLIC_FIREBASE_… or
 * NEXT_PUBLIC_FIREBASE_… — and written into the site at build time, so pages
 * rendered on Cloudflare can read the Content Manager.
 */
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const firebaseKey = (name) =>
  process.env[`PUBLIC_FIREBASE_${name}`] ||
  process.env[`NEXT_PUBLIC_FIREBASE_${name}`] ||
  fileEnv[`PUBLIC_FIREBASE_${name}`] ||
  fileEnv[`NEXT_PUBLIC_FIREBASE_${name}`] ||
  '';
const FIREBASE_KEYS = ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET', 'MESSAGING_SENDER_ID', 'APP_ID'];
const firebaseDefines = Object.fromEntries(
  FIREBASE_KEYS.map((k) => [`import.meta.env.PUBLIC_FIREBASE_${k}`, JSON.stringify(firebaseKey(k))])
);
if (!firebaseKey('API_KEY')) {
  console.warn('[cms] No Firebase keys found: pages will show their saved content instead of the Content Manager.');
}
>>>>>>> Stashed changes

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

  // Sitemap → /sitemap-index.xml (pages) + /sitemap-posts.xml (blog articles,
  // listed live from the Content Manager by src/pages/sitemap-posts.xml.ts).
  integrations: [
    sitemap({
      customSitemaps: ['https://venturebean.com/sitemap-posts.xml'],
      // Leave out the duplicate article copies under /knowledge-hub/<section>/<slug>/
      // (each article's real address is /<slug>/, in the posts sitemap).
      filter: (page) => !/\/knowledge-hub\/(insights|industry-perspectives|toolkit)\/[^/]+\/$/.test(page),
    }),
  ],

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