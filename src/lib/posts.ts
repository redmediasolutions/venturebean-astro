/**
 * Posts from the Content Manager, loaded once per build (published only).
 *
 *   Insights (blog)        → categories "Consulting" + "Coaching"
 *   Knowledge Hub sections → see KNOWLEDGE_HUB below
 *
 * Each post: title, excerpt, content (HTML), featured image, date, and any
 * custom fields (e.g. link_url for media and video cards).
 */
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore/lite';
import { getDb, isCmsConfigured } from './firebase';

export const BLOG_CATEGORY_SLUGS = ['consulting', 'coaching'] as const;
export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUGS)[number];

/**
 * Knowledge Hub pages and the Content Manager category slugs they show.
 * Several slugs are accepted in case a category was named a little differently.
 */
export const KNOWLEDGE_HUB = {
  /** Media Spotlight → Publications tab */
  publications: ['media-spotlight'],
  /** Media Spotlight → Videos tab */
  videos: ['videos', 'video'],
  /** Industry Perspectives page */
  industryPerspectives: ['industry-perspectives', 'industry-perspective'],
  /** Toolkit page → Frameworks tab */
  toolkit: ['framework', 'frameworks', 'toolkit'],
} as const;
export type KnowledgeHubSection = keyof typeof KNOWLEDGE_HUB;

/** Categories whose posts get their own article page at /<slug>/. */
const ARTICLE_CATEGORY_SLUGS: readonly string[] = [
  ...BLOG_CATEGORY_SLUGS,
  ...KNOWLEDGE_HUB.industryPerspectives,
  ...KNOWLEDGE_HUB.toolkit,
];

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
  /** Custom field values (Content Manager → Custom Fields), keyed by field name. */
  customFields: Record<string, unknown>;
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

async function loadAll(): Promise<BlogPost[] | null> {
  if (!isCmsConfigured) {
    console.warn(`[cms] No Firebase keys found in ${process.cwd()}/.env. Blog articles won't be built (their links will 404); copy .env from the project you set up.`);
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
      customFields: p.customFields && typeof p.customFields === 'object' ? (p.customFields as Record<string, unknown>) : {},
    });
  }
  posts.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  console.log(`[cms] Loaded ${posts.length} published posts from Firebase.`);
  return posts;
}

let cached: Promise<BlogPost[] | null> | undefined;

/** Every published post. Fetched once per build; null if Firebase can't be reached. */
export function getAllPosts(): Promise<BlogPost[] | null> {
  cached ??= loadAll().catch((err) => {
    console.warn(`[cms] Could not load posts from Firebase (${err?.message ?? err}) — pages keep their saved cards.`);
    return null;
  });
  return cached;
}

const inAny = (post: BlogPost, slugs: readonly string[]) => post.categorySlugs.some((s) => slugs.includes(s));

/** Coaching + consulting articles (Insights). Null (→ keep the saved cards) if there are none. */
export async function getBlogPosts(): Promise<BlogPost[] | null> {
  const all = await getAllPosts();
  const posts = all?.filter((p) => inAny(p, BLOG_CATEGORY_SLUGS)) ?? [];
  if (all && posts.length === 0) console.warn('[cms] No published coaching or consulting posts — insights will keep the saved article cards.');
  return posts.length ? posts : null;
}

/** Posts for one Knowledge Hub section. Null (→ keep the saved cards) if there are none. */
export async function getSectionPosts(section: KnowledgeHubSection): Promise<BlogPost[] | null> {
  const all = await getAllPosts();
  const posts = all?.filter((p) => inAny(p, KNOWLEDGE_HUB[section])) ?? [];
  return posts.length ? posts : null;
}

/** Posts that get their own article page (/<slug>/). */
export async function getArticlePosts(): Promise<BlogPost[]> {
  const all = (await getAllPosts()) ?? [];
  return all.filter((p) => inAny(p, ARTICLE_CATEGORY_SLUGS));
}

/** "Link" custom field (link_url): where a media/video card opens. */
export function linkOf(post: BlogPost): string | null {
  const url = post.customFields.link_url;
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

/** Public path of an article. Trailing slash matches the rest of the site. */
export function postPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return `/${clean}/`;
}
