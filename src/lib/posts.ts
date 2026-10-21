/**
 * Coaching and consulting articles, managed in the Content Manager:
 *
 *   Categories → "Consulting" (slug: consulting)
 *                "Coaching"   (slug: coaching)
 *   Posts in those categories → one post per article
 *     • Title, excerpt, content (HTML) and featured image
 *     • Published posts only — drafts stay in the admin
 *
 * Loaded once per build, the same way client logos are.
 */
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore/lite';
import { getDb, isCmsConfigured } from './firebase';

export const BLOG_CATEGORY_SLUGS = ['consulting', 'coaching'] as const;
export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUGS)[number];

export interface PostImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  /** HTML from the editor. Rendered as-is on the article page. */
  content: string;
  excerpt: string;
  featuredImage: PostImage | null;
  categorySlugs: string[];
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
}

const TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)),
  ]);
}

/** Titles copied from WordPress can still hold entities like &#8211; (–). */
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&(?:#039|apos);/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (v instanceof Timestamp) return v.toDate();
  if (typeof v === 'object' && typeof (v as { toDate?: unknown }).toDate === 'function') {
    const date = (v as { toDate: () => Date }).toDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
  }
  if (typeof v === 'object' && typeof (v as { seconds?: unknown }).seconds === 'number') {
    return new Date((v as { seconds: number }).seconds * 1000);
  }
  if (typeof v === 'string') {
    const date = new Date(v);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

async function load(): Promise<BlogPost[] | null> {
  if (!isCmsConfigured) {
    console.warn('[cms] Firebase keys missing (.env) — insights will keep the saved article cards.');
    return null;
  }
  const db = getDb();
  const snap = await withTimeout(
    getDocs(query(collection(db, 'posts'), where('status', '==', 'published')))
  );

  const now = Date.now();
  const posts: BlogPost[] = [];
  for (const d of snap.docs) {
    const p = d.data();
    const slugs: string[] = Array.isArray(p.categorySlugs) ? p.categorySlugs.map(String) : [];
    if (!slugs.some((slug) => (BLOG_CATEGORY_SLUGS as readonly string[]).includes(slug))) continue;
    const publishedAt = toDate(p.publishedAt);
    if (publishedAt && publishedAt.getTime() > now) continue;
    const slug = String(p.slug ?? '').trim();
    const title = decodeEntities(String(p.title ?? '')).trim();
    if (!slug || !title) continue;
    const img = p.featuredImage;
    const featuredImage = img?.url
      ? { url: String(img.url), alt: decodeEntities(String(img.alt || title)), width: num(img.width), height: num(img.height) }
      : null;
    posts.push({
      id: d.id,
      title,
      slug,
      content: String(p.content ?? ''),
      excerpt: decodeEntities(String(p.excerpt ?? '')),
      featuredImage,
      categorySlugs: slugs,
      publishedAt,
      seoTitle: decodeEntities(String(p.seoTitle || title)),
      seoDescription: decodeEntities(String(p.seoDescription || p.excerpt || '')),
    });
  }
  posts.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  if (posts.length === 0) {
    console.warn('[cms] No published coaching or consulting posts — insights will keep the saved article cards.');
    return null;
  }
  console.log(`[cms] Loaded ${posts.length} coaching and consulting posts from Firebase.`);
  return posts;
}

let cached: Promise<BlogPost[] | null> | undefined;

/** Fetched once per build. Returns null (→ keep the saved cards) if anything goes wrong. */
export function getBlogPosts(): Promise<BlogPost[] | null> {
  cached ??= load().catch((err) => {
    console.warn(`[cms] Could not load posts from Firebase (${err?.message ?? err}) — using the saved article cards.`);
    return null;
  });
  return cached;
}

/** Public path of an article. Trailing slash matches the rest of the site. */
export function postPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return `/${clean}/`;
}
