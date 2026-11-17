/**
 * Posts from the Content Manager.
 *
 *   Insights (blog)        → categories "Consulting" + "Coaching"
 *   Knowledge Hub sections → see KNOWLEDGE_HUB below
 *
 * Each post: title, excerpt, content (HTML), featured image, date, and any
 * custom fields (e.g. link_url for media and video cards).
 */
import { isCmsConfigured, loadCms, toDate } from './cms';

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

/** Content Manager post → BlogPost (null if it has no slug or title). */
function toPost(p: Record<string, unknown> & { id: string }): BlogPost | null {
  const slug = String(p.slug ?? '').trim();
  const title = decodeEntities(String(p.title ?? '')).trim();
  if (!slug || !title) return null;
  const img = p.featuredImage as { url?: unknown; alt?: unknown; width?: unknown; height?: unknown } | null | undefined;
  const featuredImage = img?.url
    ? { url: String(img.url), alt: decodeEntities(String(img.alt || title)), width: num(img.width), height: num(img.height) }
    : null;
  return {
    id: p.id,
    title,
    slug,
    content: String(p.content ?? ''),
    excerpt: decodeEntities(String(p.excerpt ?? '')),
    featuredImage,
    // Lower-case so a category slug typed with capitals still matches.
    categorySlugs: Array.isArray(p.categorySlugs) ? p.categorySlugs.map((c) => String(c).toLowerCase().trim()) : [],
    publishedAt: toDate(p.publishedAt),
    seoTitle: decodeEntities(String(p.seoTitle || title)),
    seoDescription: decodeEntities(String(p.seoDescription || p.excerpt || '')),
    customFields: p.customFields && typeof p.customFields === 'object' ? (p.customFields as Record<string, unknown>) : {},
  };
}

let parsed: { source: unknown; posts: BlogPost[] } | null = null;

/**
 * Every published post, newest first. Posts scheduled for later are left out
 * until their date (checked on every request, so they appear on time).
 * Null if the Content Manager can't be reached — pages then keep their saved cards.
 */
export async function getAllPosts(): Promise<BlogPost[] | null> {
  if (!isCmsConfigured) {
    console.warn('[cms] No Firebase keys found (.env locally, build variables on Cloudflare). Pages keep their saved cards.');
    return null;
  }
  const data = await loadCms();
  if (!data) return null;
  if (parsed?.source !== data) {
    const posts = data.posts.map(toPost).filter((p): p is BlogPost => p !== null);
    posts.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
    parsed = { source: data, posts };
  }
  const now = Date.now();
  return parsed.posts.filter((p) => !p.publishedAt || p.publishedAt.getTime() <= now);
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

/** One published post by its slug (from the same cached copy), or null. */
export async function getPostBySlug(slug: string | undefined): Promise<BlogPost | null> {
  if (!slug) return null;
  const wanted = slug.toLowerCase();
  const all = (await getAllPosts()) ?? [];
  return all.find((p) => p.slug.toLowerCase() === wanted) ?? null;
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