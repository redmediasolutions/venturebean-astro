/**
 * Puts coaching and consulting posts into the saved page HTML.
 *
 *   insights.html       <!--cms:insights-consulting--> … <!--/cms:insights-consulting-->
 *                       <!--cms:insights-coaching-->   … <!--/cms:insights-coaching-->
 *   post-template.html  title, date, HTML body, hero image, related cards
 *
 * Everything between a pair of markers is replaced. If there is no CMS data,
 * the insights page is left exactly as it was.
 */
import template from '../content/post-template.html?raw';
import { postPath, type BlogPost } from './posts';

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

function replaceMarked(html: string, name: string, build: (original: string) => string): string {
  const start = `<!--cms:${name}-->`;
  const end = `<!--/cms:${name}-->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a === -1 || b === -1) {
    console.warn(`[cms] Marker "${name}" not found — that section was left as saved.`);
    return html;
  }
  const original = html.slice(a + start.length, b);
  return html.slice(0, a + start.length) + build(original) + html.slice(b);
}

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

function excerptOf(post: BlogPost): string {
  const text = plain(post.excerpt || post.content);
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  const space = cut.lastIndexOf(' ');
  return `${(space > 80 ? cut.slice(0, space) : cut).trim()}…`;
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

function card(post: BlogPost, category: string): string {
  const href = postPath(post.slug);
  const date = formatDate(post.publishedAt);
  const img = post.featuredImage;
  const thumb = img
    ? `<a class="vb-post__thumbnail__link" href="${esc(href)}" tabindex="-1"><div class="vb-post__thumbnail"><img loading="lazy" decoding="async" src="${esc(img.url)}" alt="${esc(img.alt)}"></div></a>`
    : '';
  return (
    `<article class="vb-post vb-grid-item post type-post status-publish format-standard has-post-thumbnail hentry category-${esc(category)}" role="listitem">` +
    `<div class="vb-post__card">${thumb}` +
    `<div class="vb-post__text">` +
    `<h3 class="vb-post__title"><a href="${esc(href)}">${esc(post.title)}</a></h3>` +
    `<div class="vb-post__excerpt"><p>${esc(excerptOf(post))}</p></div>` +
    `<div class="vb-post__read-more-wrapper"><a class="vb-post__read-more" href="${esc(href)}" aria-label="${esc(`Read more about ${post.title}`)}" tabindex="-1">Read More »</a></div>` +
    `</div>` +
    `<div class="vb-post__meta-data">${date ? `<span class="vb-post-date">${esc(date)}</span>` : ''}</div>` +
    `</div></article>`
  );
}

export function renderInsightLists(html: string, posts: BlogPost[]): string {
  const consulting = posts.filter((p) => p.categorySlugs.includes('consulting'));
  const coaching = posts.filter((p) => p.categorySlugs.includes('coaching'));
  let next = replaceMarked(html, 'insights-consulting', () => consulting.map((p) => card(p, 'consulting')).join(''));
  next = replaceMarked(next, 'insights-coaching', () => coaching.map((p) => card(p, 'coaching')).join(''));
  return next;
}

interface TocItem {
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

function prepareContent(html: string): { html: string; toc: TocItem[] } {
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

function tocHtml(items: TocItem[]): string {
  if (!items.length) {
    return '<p class="vb-toc__empty">In this article</p>';
  }
  const lis = items
    .map(
      (item) =>
        `<li class="vb-toc__list-item vb-toc__list-item-text-level-${item.level - 1}">` +
        `<div class="vb-toc__list-item-text-wrapper">` +
        `<a href="#${esc(item.id)}" class="vb-toc__list-item-text">${esc(item.text)}</a>` +
        `</div></li>`
    )
    .join('');
  return `<ul class="vb-toc__list-wrapper">${lis}</ul>`;
}

function heroStyle(imageUrl: string | undefined): string {
  if (!imageUrl) return '';
  const url = esc(imageUrl);
  return (
    `<style>` +
    `.vb-20312 .vb-element.vb-element-474937f:not(.vb-motion-effects-element-type-background),` +
    `.vb-20312 .vb-element.vb-element-474937f > .vb-motion-effects-container > .vb-motion-effects-layer,` +
    `.vb-20312 .vb-element.vb-element-bd88443:not(.vb-motion-effects-element-type-background),` +
    `.vb-20312 .vb-element.vb-element-bd88443 > .vb-motion-effects-container > .vb-motion-effects-layer{` +
    `background-image:url("${url}");}` +
    `</style>`
  );
}

export function renderPostPage(post: BlogPost, all: BlogPost[]): string {
  const { html: content, toc } = prepareContent(post.content);
  const category = post.categorySlugs.includes('coaching') ? 'coaching' : 'consulting';
  const related = all.filter((p) => p.slug !== post.slug && p.categorySlugs.includes(category)).slice(0, 4);
  let html = template;
  html = replaceMarked(html, 'hero-style', () => heroStyle(post.featuredImage?.url));
  html = html.replaceAll('<!--cms:post-title-->', esc(post.title));
  html = html.replaceAll('<!--cms:post-date-->', esc(formatDate(post.publishedAt)));
  html = replaceMarked(html, 'post-content', () => content);
  html = replaceMarked(html, 'related-posts', () => related.map((p) => card(p, category)).join(''));
  // Table of contents lives in the sticky sidebar, above Calendly.
  html = html.replace(
    /<div class="vb-toc__spinner-container">[\s\S]*?<\/div>\s*<\/div>/,
    `<div class="vb-toc__body-inner">${tocHtml(toc)}</div></div>`
  );
  return `<main id="content" class="site-main">${html}</main>`;
}
