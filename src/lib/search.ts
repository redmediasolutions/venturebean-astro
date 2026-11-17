/**
 * Site search: the site's pages plus everything published in the Content
 * Manager (blogs, Industry Perspectives, Toolkit, Media Spotlight…).
 * Used by /search/ (results page) and /search.json (live results in the
 * header search box). Reads the same cached copy of the Content Manager as
 * the rest of the site, so searching costs no extra Firebase reads.
 */
import pages from '../data/pages.json';
import { KNOWLEDGE_HUB, getAllPosts, linkOf, postPath, type BlogPost } from './posts';

export interface SearchResult {
  title: string;
  url: string;
  /** Opens another website (e.g. a Media Spotlight article). */
  external: boolean;
  /** "Page", "Blog", "Industry Perspective"… */
  kind: string;
  excerpt: string;
  image: string | null;
  date: string | null;
}

interface Entry extends SearchResult {
  /** Lower-cased text to match: title, excerpt and body. */
  haystack: { title: string; excerpt: string; body: string };
  time: number;
}

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const plain = (html: string) => decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

const clip = (s: string, n = 180) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);

/* ---------------------------------------------------------------- pages */

const PAGE_URLS: Record<string, string> = {
  home: '/',
  'about-us': '/about-us/',
  clients: '/clients/',
  testimonials: '/testimonials/',
  'case-studies': '/case-studies/',
  'consulting-case-studies': '/consulting-case-studies/',
  'coaching-case-studies': '/coaching-case-studies/',
  'business-consulting': '/business-consulting/',
  coaching: '/coaching/',
  'contact-us': '/contact-us/',
  'venturebean-solutions-page': '/venturebean-solutions-page/',
  'knowledge-hub': '/knowledge-hub/',
  insights: '/knowledge-hub/insights/',
  'media-spotlight': '/knowledge-hub/media-spotlight/',
  'industry-perspectives': '/knowledge-hub/industry-perspectives/',
  toolkit: '/knowledge-hub/toolkit/',
};

/** Pages without an entry in pages.json, and extra words people search for. */
const EXTRA_PAGES: { title: string; url: string; description: string; keywords?: string }[] = [
  {
    title: 'Our Services',
    url: '/services/',
    description:
      'Business consulting, coaching, organisational development and assessment to improve performance, develop leaders and build organisations for growth.',
  },
  {
    title: 'Organisational Development',
    url: '/organisational-development/',
    description:
      'Leadership alignment, role clarity, delegation, team effectiveness, people management and succession planning through leadership development and team coaching.',
    keywords: 'od team coaching leadership development workshops succession',
  },
  {
    title: 'Leadership Assessment',
    url: '/assessments/',
    description:
      'Leadership assessments, assessment centres and behavioural insights to identify strengths, development priorities and readiness for greater responsibility.',
    keywords: 'assessment centre motivation factor mcode giant 5 voices bei psychometric',
  },
];

const PAGE_KEYWORDS: Record<string, string> = {
  'business-consulting': 'consultant consultancy strategy growth smb family business',
  coaching: 'executive coach leadership coaching life coach career',
  'contact-us': 'contact book discovery call phone email address',
  'about-us': 'team founder who we are',
};

function pageEntries(): Entry[] {
  const out: Entry[] = [];
  for (const [id, url] of Object.entries(PAGE_URLS)) {
    const head = (pages as Record<string, { head: string }>)[id]?.head ?? '';
    const rawTitle = decode(/<title>([\s\S]*?)<\/title>/.exec(head)?.[1] ?? id);
    const title = rawTitle.replace(/\s*[|–-]\s*Venturebean.*$/i, '').replace(/\s*\|\s*VentureBean.*$/i, '').trim() || rawTitle;
    const description = decode(/<meta\s+name="description"\s+content="([^"]*)"/i.exec(head)?.[1] ?? '');
    out.push(makePage(title, url, description, PAGE_KEYWORDS[id] ?? ''));
  }
  for (const p of EXTRA_PAGES) out.push(makePage(p.title, p.url, p.description, p.keywords ?? ''));
  return out;
}

function makePage(title: string, url: string, description: string, keywords: string): Entry {
  return {
    title,
    url,
    external: false,
    kind: 'Page',
    excerpt: clip(description),
    image: null,
    date: null,
    haystack: { title: norm(title), excerpt: norm(description), body: norm(keywords) },
    time: 0,
  };
}

/* ---------------------------------------------------------------- posts */

const ARTICLE_SLUGS = new Set<string>(['consulting', 'coaching', ...KNOWLEDGE_HUB.industryPerspectives, ...KNOWLEDGE_HUB.toolkit]);

function kindOf(p: BlogPost): string {
  const c = p.categorySlugs;
  const has = (list: readonly string[]) => list.some((s) => c.includes(s));
  if (has(KNOWLEDGE_HUB.industryPerspectives)) return 'Industry Perspective';
  if (has(KNOWLEDGE_HUB.toolkit)) return 'Toolkit';
  if (has(KNOWLEDGE_HUB.videos)) return 'Video';
  if (has(KNOWLEDGE_HUB.publications)) return 'Media Spotlight';
  return 'Blog';
}

function urlOf(p: BlogPost): { url: string; external: boolean } {
  if (p.categorySlugs.some((s) => ARTICLE_SLUGS.has(s))) return { url: postPath(p.slug), external: false };
  const link = linkOf(p);
  if (link) return { url: link, external: /^https?:\/\//i.test(link) && !/^https?:\/\/(www\.)?venturebean\.com/i.test(link) };
  if (p.categorySlugs.some((s) => [...KNOWLEDGE_HUB.publications, ...KNOWLEDGE_HUB.videos].includes(s as never))) {
    return { url: '/knowledge-hub/media-spotlight/', external: false };
  }
  return { url: '/knowledge-hub/insights/', external: false };
}

function postEntry(p: BlogPost): Entry {
  const body = plain(p.content);
  const excerpt = plain(p.excerpt) || body;
  const { url, external } = urlOf(p);
  return {
    title: p.title,
    url,
    external,
    kind: kindOf(p),
    excerpt: clip(excerpt),
    image: p.featuredImage?.url ?? null,
    date: p.publishedAt ? p.publishedAt.toISOString() : null,
    haystack: { title: norm(p.title), excerpt: norm(`${excerpt} ${p.seoDescription}`), body: norm(body) },
    time: p.publishedAt?.getTime() ?? 0,
  };
}

/* ---------------------------------------------------------------- index + search */

let cache: { posts: BlogPost[] | null; entries: Entry[] } | null = null;

async function entries(): Promise<Entry[]> {
  const posts = await getAllPosts();
  if (cache && cache.posts === posts) return cache.entries;
  const list = [...pageEntries(), ...(posts ?? []).map(postEntry)];
  cache = { posts, entries: list };
  return list;
}

/** Results for a query, best first. Every word must appear somewhere. */
export async function search(query: string, limit = 50): Promise<{ results: SearchResult[]; total: number }> {
  const words = norm(query).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1 || /\d/.test(w));
  if (!words.length) return { results: [], total: 0 };
  const phrase = norm(query.trim());

  const scored: { e: Entry; score: number }[] = [];
  for (const e of await entries()) {
    const { title, excerpt, body } = e.haystack;
    let score = 0;
    let all = true;
    for (const w of words) {
      const s = (title.includes(w) ? 10 : 0) + (excerpt.includes(w) ? 4 : 0) + (body.includes(w) ? 1 : 0);
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;
    if (words.length > 1 && title.includes(phrase)) score += 15;
    if (title.startsWith(words[0])) score += 3;
    if (e.kind === 'Page') score += 2;
    scored.push({ e, score });
  }
  scored.sort((a, b) => b.score - a.score || b.e.time - a.e.time);
  return {
    total: scored.length,
    results: scored.slice(0, limit).map(({ e }) => {
      const { haystack: _h, time: _t, ...r } = e;
      return r;
    }),
  };
}
