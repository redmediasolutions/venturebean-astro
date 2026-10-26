/**
 * Helpers for blog articles from the Content Manager:
 *   - formatContentUrls: old venturebean.com links → paths on this site
 *   - prepareContent:    adds ids to headings and builds the table of contents
 *   - excerptOf / formatDate: text for the cards
 * The pieces of the article page itself are in src/components/blog/.
 */
import type { BlogPost } from './posts';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SITE_PAGES: Record<string, string> = {
  'about-us': '/about-us/',
  'business-consulting': '/business-consulting/',
  'business-solutions': '/venturebean-solutions-page/',
  coaching: '/coaching/',
  'coaching-page': '/coaching/',
  'contact-us': '/contact-us/',
  clients: '/clients/',
  'case-studies': '/case-studies/',
  testimonials: '/testimonials/',
  'knowledge-hub': '/knowledge-hub/',
  'venturebean-solutions-page': '/venturebean-solutions-page/',
  insights: '/knowledge-hub/insights/',
  'knowledge-hub/insights': '/knowledge-hub/insights/',
  blog: '/knowledge-hub/insights/',
  'category/consulting': '/knowledge-hub/insights/',
  'category/coaching': '/knowledge-hub/insights/',
};

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function plain(html: string): string {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** First 20 words, like the cards on the WordPress site (no "[…]"). */
export function excerptOf(post: BlogPost): string {
  const text = plain(post.excerpt || post.content).replace(/\s*\[(…|\.\.\.)\]\s*$/, '');
  const words = text.split(' ');
  return words.length <= 20 ? text : words.slice(0, 20).join(' ');
}

export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Turn absolute VentureBean links in stored HTML into paths on this site. */
export function formatContentUrls(html: string): string {
  return html.replace(/https?:\/\/(?:www\.)?venturebean\.com\/([^"'#\s]*)/gi, (full, raw: string) => {
    if (/^wp-content\/uploads\//i.test(raw)) {
      return `/assets/uploads/${raw.replace(/^wp-content\/uploads\//i, '').split('?')[0]}`;
    }
    if (/^(wp-content|wp-includes|wp-json)\//i.test(raw)) return '/';
    const path = raw.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    if (!path) return '/';
    if (/^\d{4}\/\d{2}(\/\d{2})?$/.test(path)) return '/knowledge-hub/insights/';
    if (SITE_PAGES[path]) return SITE_PAGES[path];
    return `/${path}/`;
  });
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

function headingId(text: string, attrs: string, used: Set<string>): string {
  let id = /id="([^"]+)"/.exec(attrs)?.[1] ?? '';
  if (!id) {
    id = text
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }
  let unique = id || 'section';
  let n = 2;
  while (used.has(unique)) unique = `${id || 'section'}-${n++}`;
  used.add(unique);
  return unique;
}

export function prepareContent(html: string): { html: string; toc: TocItem[] } {
  const used = new Set<string>();
  const toc: TocItem[] = [];
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Stored articles still use the old builder class prefix. Match the renamed site styles.
  const formatted = formatContentUrls(withoutScripts).replace(/elementor/gi, 'vb');
  // Real headings, plus a paragraph that is only a bold line.
  const out = formatted.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>|<p([^>]*)>\s*<(strong|b)>([\s\S]*?)<\/\5>\s*<\/p>/gi,
    (full, hLevel: string | undefined, hAttrs: string | undefined, hInner: string | undefined, pAttrs: string | undefined, _tag: string | undefined, pInner: string | undefined) => {
      const inner = hInner ?? pInner ?? '';
      const text = plain(inner);
      if (!text || text.length > 140) return full;
      const level = hLevel ? Number(hLevel) : 2;
      const attrs = hAttrs ?? pAttrs ?? '';
      const id = headingId(text, attrs, used);
      toc.push({ id, text, level });
      const attrsWithoutId = attrs.replace(/\s+id="[^"]*"/i, '');
      if (hLevel) return `<h${hLevel} id="${esc(id)}"${attrsWithoutId}>${inner}</h${hLevel}>`;
      return `<p id="${esc(id)}"${attrsWithoutId}><strong>${inner}</strong></p>`;
    }
  );
  return { html: out, toc };
}

/** First `words` words of the excerpt (or article), with " ..." when cut, like the WordPress cards. */
export function excerptWords(post: BlogPost, words = 25): string {
  const text = plain(post.excerpt || post.content).replace(/\s*\[(…|\.\.\.)\]\s*$/, '');
  const parts = text.split(' ');
  return parts.length <= words ? text : `${parts.slice(0, words).join(' ')} ...`;
}

/**
 * One-line description for a Toolkit card: the article's first short line
 * (e.g. "The operating system that helps organisations …"), else a short excerpt.
 */
export function subtitleOf(post: BlogPost): string {
  const first = /<(p|h[2-6])[^>]*>([\s\S]*?)<\/\1>/i.exec(post.content)?.[2];
  const line = first ? plain(first) : '';
  if (line && line.length <= 160 && line.toLowerCase() !== post.title.toLowerCase()) return line;
  return excerptWords(post, 18);
}
