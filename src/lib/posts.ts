/**
 * Posts from the Content Manager.
 *
 *   Insights (blog)        → categories "Consulting" + "Coaching"
 *   Knowledge Hub sections → see KNOWLEDGE_HUB below
 *
 * Each post: title, excerpt, content (HTML), featured image, date, and any
 * custom fields (e.g. link_url for media and video cards).
 */
import {
  collection,
  getDocs,
  limit,
  query,
  Timestamp,
  where,
} from 'firebase/firestore/lite';
import { getDb, isCmsConfigured } from './firebase';

export const BLOG_CATEGORY_SLUGS = ['consulting', 'coaching'] as const;
export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUGS)[number];

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

const TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 60_000; // 60 seconds memory cache in SSR / Dev to avoid quota exhaustion

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
    ),
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

function parsePostDocument(id: string, p: Record<string, unknown>, now = Date.now()): BlogPost | null {
  const publishedAt = toDate(p.publishedAt);
  // 5-minute clock drift margin
  if (publishedAt && publishedAt.getTime() > now + 5 * 60 * 1000) return null;

  const slug = String(p.slug ?? '').trim();
  const title = decodeEntities(String(p.title ?? '')).trim();
  if (!slug || !title) return null;

  const slugs: string[] = Array.isArray(p.categorySlugs)
    ? p.categorySlugs.map((s) => String(s).toLowerCase().trim())
    : [];

  const img = p.featuredImage as Record<string, unknown> | undefined;
  const featuredImage = img?.url
    ? {
        url: String(img.url),
        alt: decodeEntities(String(img.alt || title)),
        width: num(img.width),
        height: num(img.height),
      }
    : null;

  return {
    id,
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
  };
}

async function loadAllFromFirestore(): Promise<BlogPost[]> {
  if (!isCmsConfigured) {
    console.warn(`[cms] No Firebase keys configured.`);
    return [];
  }

  const db = getDb();
  const snap = await withTimeout(
    getDocs(query(collection(db, 'posts'), where('status', 'in', ['published', 'publish'])))
  );

  const now = Date.now();
  const posts: BlogPost[] = [];
  for (const d of snap.docs) {
    const post = parsePostDocument(d.id, d.data() as Record<string, unknown>, now);
    if (post) posts.push(post);
  }

  posts.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  console.log(`[cms] Loaded ${posts.length} published posts from Firebase.`);
  return posts;
}

// In-memory cache structure
let cachedPosts: BlogPost[] | null = null;
let lastFetchedAt = 0;
let inFlightRequest: Promise<BlogPost[]> | null = null;

/**
 * Loads posts using a 60-second TTL cache in SSR/Dev to save Firebase quota,
 * while preventing concurrent duplicate requests (thundering herd).
 */
export async function getAllPosts(): Promise<BlogPost[] | null> {
  const now = Date.now();

  // Return fresh in-memory data if within the TTL window
  if (cachedPosts && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedPosts;
  }

  // Deduplicate simultaneous requests
  if (!inFlightRequest) {
    inFlightRequest = loadAllFromFirestore()
      .then((data) => {
        cachedPosts = data;
        lastFetchedAt = Date.now();
        return data;
      })
      .catch((err) => {
        console.warn(`[cms] Firestore query failed (${err?.message ?? err}). Using fallback.`);
        return cachedPosts ?? [];
      })
      .finally(() => {
        inFlightRequest = null;
      });
  }

  const results = await inFlightRequest;
  return results.length ? results : null;
}

const inAny = (post: BlogPost, slugs: readonly string[]) =>
  post.categorySlugs.some((s) => slugs.includes(s.toLowerCase().trim()));

/** Coaching + consulting articles (Insights). Null (→ keep saved cards) if empty. */
export async function getBlogPosts(): Promise<BlogPost[] | null> {
  const all = await getAllPosts();
  const posts = all?.filter((p) => inAny(p, BLOG_CATEGORY_SLUGS)) ?? [];
  return posts.length ? posts : null;
}

/** Posts for one Knowledge Hub section. */
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

/**
 * Single-post query: Checks memory cache first.
 * If not present, queries only that single post document instead of all 210 documents.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (cachedPosts) {
    const found = cachedPosts.find((p) => p.slug === slug);
    if (found) return found;
  }

  if (!isCmsConfigured) return null;

  try {
    const db = getDb();
    const snap = await withTimeout(
      getDocs(
        query(
          collection(db, 'posts'),
          where('slug', '==', slug),
          where('status', 'in', ['published', 'publish']),
          limit(1)
        )
      )
    );

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return parsePostDocument(doc.id, doc.data() as Record<string, unknown>);
  } catch (err: any) {
    console.warn(`[cms] Single-post lookup for "${slug}" failed:`, err?.message ?? err);
    return null;
  }
}

/** "Link" custom field (link_url): where a media/video card opens. */
export function linkOf(post: BlogPost): string | null {
  const url = post.customFields.link_url;
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

/**
 * "Report PDF" custom field (report_pdf): the full report behind
 * "Download the full analysis" on Industry Perspectives articles.
 */
export function reportPdfOf(post: BlogPost): string | null {
  const value = post.customFields.report_pdf;
  const url = value && typeof value === 'object' ? (value as { url?: unknown }).url : value;
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

/** Public path of an article. Trailing slash matches the rest of the site. */
export function postPath(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return `/${clean}/`;
}