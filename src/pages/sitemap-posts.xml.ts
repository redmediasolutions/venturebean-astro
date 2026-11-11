/**
 * Blog article sitemap → /sitemap-posts.xml
 *
 * Article pages (/<slug>/) render on request, so @astrojs/sitemap can't see
 * them at build time. This lists them straight from the Content Manager
 * (same cached copy the pages use), so a newly published post is in the
 * sitemap within about a minute. Linked from /sitemap-index.xml.
 */
import type { APIRoute } from 'astro';
import { getArticlePosts, postPath } from '../lib/posts';

export const prerender = false;

const SITE = 'https://venturebean.com';

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const posts = await getArticlePosts();
  const urls = posts
    .filter((p) => p.slug)
    .map((p) => {
      const lastmod = p.publishedAt ? `<lastmod>${p.publishedAt.toISOString()}</lastmod>` : '';
      return `<url><loc>${escapeXml(SITE + postPath(p.slug))}</loc>${lastmod}</url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
