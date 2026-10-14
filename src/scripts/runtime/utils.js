// Small helpers shared by the runtime modules.

export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Default breakpoints: mobile ≤ 767, tablet ≤ 1024. */
export function currentDevice() {
  const w = window.innerWidth;
  if (w <= 767) return 'mobile';
  if (w <= 1024) return 'tablet';
  return 'desktop';
}

export function settingsOf(el) {
  try {
    return JSON.parse(el.getAttribute('data-settings') || '{}');
  } catch {
    return {};
  }
}

/** Responsive setting lookup: mobile, then tablet, then desktop. */
export function deviceSetting(settings, key, device = currentDevice()) {
  const order = device === 'mobile' ? ['_mobile', '_tablet', ''] : device === 'tablet' ? ['_tablet', ''] : [''];
  for (const suffix of order) {
    const v = settings[key + suffix];
    if (v !== undefined && v !== '' && !(typeof v === 'object' && v && v.size === '')) return v;
  }
  return undefined;
}

/** Run `fn(el)` once when each element scrolls into view. */
export function onVisible(elements, fn, options = {}) {
  const list = [...elements];
  if (!list.length) return;
  if (!('IntersectionObserver' in window)) {
    list.forEach(fn);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        io.unobserve(e.target);
        fn(e.target);
      }
    });
  }, options);
  list.forEach((el) => io.observe(el));
}

/** Decode "#vb-action:action=…&settings=base64" links. */
export function parseAction(href) {
  const raw = decodeURIComponent(href.replace(/^#/, ''));
  const m = raw.match(/^vb-action:action=([^&]+)(?:&settings=(.+))?$/);
  if (!m) return null;
  let settings = {};
  if (m[2]) {
    try {
      settings = JSON.parse(atob(m[2]));
    } catch {}
  }
  return { action: m[1], settings };
}
