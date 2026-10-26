/** Links to other websites open in a new tab; links on this site don't. */
export function linkTarget(href: string | undefined): { target?: string; rel?: string } {
  return href && /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?venturebean\.com/i.test(href)
    ? { target: '_blank', rel: 'noopener' }
    : {};
}
