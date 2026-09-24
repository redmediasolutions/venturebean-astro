// Phased-migration link helper.
//
// Only the routes listed in BUILT_ROUTES exist in this Astro project so far.
// Links to any other internal path are sent to the live WordPress site so that
// nothing 404s while the remaining pages are migrated one by one.
// When a page is rebuilt in Astro, add its path here — every link to it across
// the site switches to the local route automatically.

export const LIVE_ORIGIN = 'https://venturebean.com';

export const BUILT_ROUTES = new Set(['/']);

/**
 * @param {string} href internal path ("/about-us/", "/about-us/#guiding") or absolute URL
 * @returns {string}
 */
export function link(href) {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const [path, hash = ''] = href.split('#');
  const normalized = path.endsWith('/') ? path : `${path}/`;
  if (BUILT_ROUTES.has(normalized)) return href;
  return `${LIVE_ORIGIN}${normalized}${hash ? `#${hash}` : ''}`;
}

/** true when the link leaves the site (used to add rel/target) */
export function isExternal(href) {
  return /^https?:/.test(href) && !href.startsWith(LIVE_ORIGIN);
}
