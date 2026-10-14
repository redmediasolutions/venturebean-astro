/**
 * Puts the client logos from the Content Manager into the saved page HTML.
 *
 * The page files mark the two logo sections with comments:
 *   home.html     <!--cms:home-client-logos--> … <!--/cms:home-client-logos-->
 *   clients.html  <!--cms:client-logo-tabs-->  … <!--/cms:client-logo-tabs-->
 * Everything between a pair is replaced. If there is no CMS data, the page is
 * left exactly as it was (the original logos stay).
 */
import type { ClientLogo, ClientsData } from './clients';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function replaceMarked(html: string, name: string, build: (original: string) => string): string {
  const start = `<!--cms:${name}-->`;
  const end = `<!--/cms:${name}-->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a === -1 || b === -1) {
    console.warn(`[cms] Marker "${name}" not found in page HTML — logos not replaced.`);
    return html;
  }
  const original = html.slice(a + start.length, b);
  return html.slice(0, a + start.length) + build(original) + html.slice(b);
}

/* ---------------- Home page: scrolling logo strip ---------------- */

function marqueeItem(c: ClientLogo) {
  return (
    // No loading="lazy": the marquee script waits for every logo to load before it starts
    // scrolling, and lazy images outside the visible strip would never load.
    `<div class="deensimc-img-wrapper"><img decoding="async" src="${esc(c.logo.url)}" alt="${esc(c.logo.alt)}">` +
    `<figcaption class="vb-image-marquee-caption"></figcaption></div>`
  );
}

export function renderHomeLogos(html: string, data: ClientsData): string {
  const items = data.clients.filter((c) => c.onHome);
  if (!items.length) return html;
  // The marquee scrolls two identical groups side by side for a seamless loop.
  const group = `<div class="deensimc-marquee-group">${items.map(marqueeItem).join('')}</div>`;
  return replaceMarked(html, 'home-client-logos', () => ` ${group}${group} `);
}

/* ---------------- Clients page: industry tabs + logo grids ---------------- */

function logoWidget(c: ClientLogo) {
  const size = c.logoSize && c.logoSize > 0 && c.logoSize <= 100 ? ` style="width:${c.logoSize}%;max-width:100%"` : '';
  const dims = c.logo.width && c.logo.height ? ` width="${c.logo.width}" height="${c.logo.height}"` : '';
  return (
    `<div class="vb-element vb-widget vb-widget-image vb-client-logo" data-element_type="widget" data-widget_type="image.default">` +
    ` <div class="vb-widget-container"> <img loading="lazy" decoding="async"${dims} src="${esc(c.logo.url)}"` +
    ` class="vb-animation-grow attachment-full size-full" alt="${esc(c.logo.alt)}"${size}> </div> </div>`
  );
}

export function renderClientTabs(html: string, data: ClientsData): string {
  // Tab widget id, e.g. data-widget-number="113642916" — tab ids are built from it.
  const widgetNumber = html.match(/class="e-n-tabs" data-widget-number="(\d+)"/)?.[1] ?? '1';
  const onPage = data.clients.filter((c) => c.onClientsPage);
  if (!onPage.length) return html;

  const tabs = [
    { title: 'All', clients: onPage },
    ...data.industries
      .map((ind) => ({ title: ind.name, clients: onPage.filter((c) => c.industryIds.includes(ind.id)) }))
      .filter((t) => t.clients.length > 0),
  ];

  return replaceMarked(html, 'client-logo-tabs', (original) => {
    // Re-use the original panel + grid wrappers so the existing styles still apply.
    const panelOpens = [...original.matchAll(/<div id="e-n-tab-content-\d+" role="tabpanel"[^>]*>/g)].map((m) => m[0]);
    const gridOpens = panelOpens.map((p) => {
      const at = original.indexOf(p) + p.length;
      return original.slice(at).match(/<div class="vb-element vb-element-[0-9a-f]+ e-grid[^>]*>/)?.[0] ?? '';
    });

    const buttons: string[] = [];
    const panels: string[] = [];
    tabs.forEach((tab, i) => {
      const n = i + 1;
      const first = n === 1;
      const titleId = first ? 'tabs' : `e-n-tab-title-${widgetNumber}${n}`;
      const contentId = `e-n-tab-content-${widgetNumber}${n}`;

      buttons.push(
        `<button id="${titleId}" data-tab-title-id="e-n-tab-title-${widgetNumber}${n}" class="e-n-tab-title vb-animation-grow"` +
          ` aria-selected="${first}" data-tab-index="${n}" role="tab" tabindex="${first ? 0 : -1}" aria-controls="${contentId}"` +
          ` style="--n-tabs-title-order: ${n};"> <span class="e-n-tab-title-text"> ${esc(tab.title)} </span> </button>`
      );

      // Template: same position in the original if it existed, otherwise the 2nd tab's.
      const t = first ? 0 : i < panelOpens.length ? i : Math.min(1, panelOpens.length - 1);
      const panelOpen = (panelOpens[t] ?? '<div role="tabpanel" class="e-con-full e-flex e-con e-child">')
        .replace(/id="e-n-tab-content-\d+"/, `id="${contentId}"`)
        .replace(/aria-labelledby="[^"]*"/, `aria-labelledby="${titleId}"`)
        .replace(/data-tab-index="\d+"/, `data-tab-index="${n}"`)
        .replace(/--n-tabs-title-order: \d+;/, `--n-tabs-title-order: ${n};`)
        .replace(/class="(e-active )?/, `class="${first ? 'e-active ' : ''}`);
      const gridOpen = gridOpens[t] || '<div class="e-grid e-con-boxed e-con e-child">';

      // "Boxed" containers wrap their items in an extra .e-con-inner div; "full" ones don't.
      const logos = tab.clients.map(logoWidget).join(' ');
      const inner = gridOpen.includes('e-con-boxed') ? `<div class="e-con-inner"> ${logos} </div>` : logos;
      panels.push(`${panelOpen} ${gridOpen} ${inner} </div> </div>`);
    });

    return (
      ` <div class="e-n-tabs-heading" role="tablist"> ${buttons.join(' ')} </div>` +
      ` <div class="e-n-tabs-content"> ${panels.join(' ')} </div> `
    );
  });
}
