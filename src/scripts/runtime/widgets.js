// Nested tabs, nested accordion, counters, image marquee, masonry gallery, lightbox.
import { $$, settingsOf, onVisible, currentDevice, reducedMotion } from './utils.js';

export function initWidgets() {
  initTabs();
  initAccordions();
  initCounters();
  initMarquees();
  initGalleries();
  initLightbox();
}

/* ---------------- Nested tabs ---------------- */
function initTabs() {
  $$('.e-n-tabs').forEach((tabs) => {
    tabs.classList.add('e-activated');
    const titles = $$(':scope > .e-n-tabs-heading > .e-n-tab-title', tabs);
    const panels = $$(':scope > .e-n-tabs-content > [role="tabpanel"]', tabs);
    const select = (title, focus) => {
      const idx = title.getAttribute('data-tab-index');
      titles.forEach((t) => {
        const on = t.getAttribute('data-tab-index') === idx;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.getAttribute('data-tab-index') === idx;
        p.classList.toggle('e-active', on);
        if (on) {
          // let lazy backgrounds / reveals inside the panel start
          p.querySelectorAll('.e-con').forEach((c) => c.classList.add('e-lazyloaded'));
          p.classList.remove('vb-tab-in');
          void p.offsetWidth;
          p.classList.add('vb-tab-in');
        }
      });
      if (focus) title.focus();
    };
    titles.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: titles.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        select(titles[(map[e.key] + titles.length) % titles.length], true);
      });
    });
  });
}

/* ---------------- Nested accordion (<details>) ---------------- */
function initAccordions() {
  $$('.e-n-accordion').forEach((acc) => {
    const widget = acc.closest('.elementor-widget-n-accordion');
    const s = settingsOf(widget);
    const onlyOne = s.max_items_expended === 'one';
    const duration = reducedMotion() ? 0 : Number(s.n_accordion_animation_duration?.size) || 400;
    const items = $$(':scope > details.e-n-accordion-item', acc);

    const animate = (item, open) => {
      const summary = item.querySelector(':scope > summary');
      const region = item.querySelector(':scope > [role="region"]');
      summary.setAttribute('aria-expanded', String(open));
      if (!region || !duration) {
        item.open = open;
        return;
      }
      if (open) {
        item.open = true;
        const h = region.scrollHeight;
        region.animate([{ height: '0px', overflow: 'hidden' }, { height: `${h}px`, overflow: 'hidden' }], { duration, easing: 'ease' });
      } else {
        const h = region.scrollHeight;
        const a = region.animate([{ height: `${h}px`, overflow: 'hidden' }, { height: '0px', overflow: 'hidden' }], { duration, easing: 'ease' });
        a.onfinish = () => (item.open = false);
      }
    };

    items.forEach((item) => {
      const summary = item.querySelector(':scope > summary');
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const willOpen = !item.open;
        if (willOpen && onlyOne) items.forEach((other) => other !== item && other.open && animate(other, false));
        animate(item, willOpen);
      });
    });
  });
}

/* ---------------- Counters ---------------- */
function initCounters() {
  const els = $$('.elementor-counter-number');
  const format = (n, delim) => (delim ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, delim) : String(n));
  onVisible(
    els,
    (el) => {
      const to = Number(el.dataset.toValue) || 0;
      const from = Number(el.dataset.fromValue) || 0;
      const dur = reducedMotion() ? 0 : Number(el.dataset.duration) || 2000;
      const delim = el.dataset.delimiter || '';
      const decimals = (String(el.dataset.toValue).split('.')[1] || '').length;
      if (!dur) {
        el.textContent = format(to.toFixed(decimals), delim);
        return;
      }
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // ease-in-out like jQuery "swing"
        el.textContent = format((from + (to - from) * eased).toFixed(decimals), delim);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { threshold: 0.3 },
  );
}

/* ---------------- Image marquee (Marquee Addons for Elementor) ---------------- */
function initMarquees() {
  $$('.deensimc-marquee').forEach((marquee) => {
    const groups = $$(':scope > .deensimc-marquee-group', marquee);
    const vertical = marquee.classList.contains('deensimc-marquee-vertical');
    const speed = parseFloat(marquee.dataset.animationSpeed) || 50;
    const pauseOnHover = marquee.dataset.pauseOnHover === 'yes';
    const setup = () => {
      groups.forEach((group) => {
        const originals = [...group.children];
        originals.forEach((c) => group.appendChild(c.cloneNode(true)));
        // Same measurement as the plugin, so the speed matches the live site.
        let size = originals.reduce((acc, el) => acc + el.clientWidth + el.clientHeight, 0);
        originals.forEach((el) => {
          const cs = getComputedStyle(el);
          size += vertical
            ? el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom)
            : el.offsetWidth + parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
        });
        if (!size) return;
        group.style.animationDuration = `${size / speed}s`;
        group.style.animationPlayState = reducedMotion() ? 'paused' : 'running';
        group.classList.remove('deensimc-paused');
      });
      if (pauseOnHover) {
        marquee.addEventListener('mouseenter', () => groups.forEach((g) => (g.style.animationPlayState = 'paused')));
        marquee.addEventListener('mouseleave', () => groups.forEach((g) => (g.style.animationPlayState = 'running')));
      }
    };
    // wait for images so widths are real
    const imgs = $$('img', marquee).filter((i) => !i.complete);
    if (!imgs.length) setup();
    else Promise.all(imgs.map((i) => new Promise((r) => i.addEventListener('load', r, { once: true }) || i.addEventListener('error', r, { once: true })))).then(setup);
  });
}

/* ---------------- Masonry gallery (E-Gallery) ---------------- */
function initGalleries() {
  $$('.elementor-widget-gallery').forEach((widget) => {
    const container = widget.querySelector('.elementor-gallery__container');
    if (!container) return;
    const s = settingsOf(widget);
    const items = $$('.e-gallery-item', container);
    container.classList.add('e-gallery-container', 'e-gallery--ltr', 'e-gallery--lazyload');
    const layout = s.gallery_layout || 'grid';
    container.classList.add(`e-gallery-${layout === 'masonry' ? 'masonry' : 'grid'}`);

    const pick = (key, fallback) => {
      const d = currentDevice();
      const v = (d === 'mobile' && s[`${key}_mobile`]) || (d !== 'desktop' && s[`${key}_tablet`]) || s[key];
      return v === undefined ? fallback : v;
    };

    const relayout = () => {
      const columns = Number(pick('columns', 3)) || 3;
      const gapSetting = pick('gap', { size: 10 });
      const gap = Number(gapSetting?.size ?? gapSetting) || 0;
      container.style.setProperty('--hgap', `${gap}px`);
      container.style.setProperty('--vgap', `${gap}px`);
      container.style.setProperty('--animation-duration', '350ms');
      container.style.setProperty('--columns', columns);
      if (layout !== 'masonry') {
        items.forEach((it) => {
          const img = it.querySelector('.e-gallery-image');
          const ratio = (Number(img.dataset.height) / Number(img.dataset.width)) * 100 || 100;
          img.style.setProperty('--aspect-ratio', `${ratio}%`);
        });
        return;
      }
      const W = container.clientWidth || 1;
      const colWidth = (W - (columns - 1) * gap) / columns;
      const heights = new Array(columns).fill(0);
      const counts = new Array(columns).fill(0);
      const placed = items.map((it) => {
        const img = it.querySelector('.e-gallery-image');
        const ratio = Number(img.dataset.height) / Number(img.dataset.width) || 1;
        const col = heights.indexOf(Math.min(...heights));
        const top = heights[col];
        const index = counts[col];
        heights[col] += ratio * colWidth;
        counts[col] += 1;
        return { it, ratio, col, top, index };
      });
      const tallest = Math.max(...heights) || 1;
      const tallestCol = heights.indexOf(Math.max(...heights));
      container.style.setProperty('--highest-column-gap-count', Math.max(counts[tallestCol] - 1, 0));
      container.style.paddingBottom = `${(tallest / W) * 100}%`;
      placed.forEach(({ it, ratio, col, top, index }) => {
        it.style.setProperty('--item-height', `${ratio * 100}%`);
        it.style.setProperty('--column', col);
        it.style.setProperty('--items-in-column', index);
        it.style.setProperty('--percent-height', `${(top / tallest) * 100}%`);
      });
    };
    relayout();
    let t;
    addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(relayout, 120);
    });

    onVisible(
      $$('.e-gallery-image', container),
      (img) => {
        const src = img.dataset.thumbnail;
        if (!src) return;
        const pre = new Image();
        pre.onload = () => {
          img.style.backgroundImage = `url("${src}")`;
          img.classList.add('e-gallery-image-loaded');
        };
        pre.src = src;
      },
      { rootMargin: '200px' },
    );
  });
}

/* ---------------- Lightbox ---------------- */
const IMAGE_LINK = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;

function initLightbox() {
  let box, imgEl, captionEl, list = [], index = 0;

  const build = () => {
    box = document.createElement('div');
    box.className = 'vb-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML =
      '<button class="vb-lightbox__close" aria-label="Close"><i class="eicon-close"></i></button>' +
      '<button class="vb-lightbox__prev" aria-label="Previous"><i class="eicon-chevron-left"></i></button>' +
      '<figure class="vb-lightbox__figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="vb-lightbox__next" aria-label="Next"><i class="eicon-chevron-right"></i></button>';
    imgEl = box.querySelector('img');
    captionEl = box.querySelector('figcaption');
    box.querySelector('.vb-lightbox__close').onclick = close;
    box.querySelector('.vb-lightbox__prev').onclick = () => show(index - 1);
    box.querySelector('.vb-lightbox__next').onclick = () => show(index + 1);
    box.addEventListener('click', (e) => e.target === box && close());
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    document.body.appendChild(box);
  };
  const show = (i) => {
    index = (i + list.length) % list.length;
    const a = list[index];
    imgEl.src = a.href;
    imgEl.alt = a.querySelector('img')?.alt || '';
    captionEl.textContent = a.dataset.elementorLightboxTitle || '';
    box.classList.toggle('has-nav', list.length > 1);
  };
  const close = () => {
    box.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.dataset.elementorOpenLightbox === 'no' || !IMAGE_LINK.test(a.getAttribute('href'))) return;
    e.preventDefault();
    if (!box) build();
    const group = a.dataset.elementorLightboxSlideshow;
    list = group ? $$(`a[data-elementor-lightbox-slideshow="${group}"]`).filter((x) => !x.closest('.swiper-slide-duplicate')) : [a];
    show(Math.max(list.indexOf(a), 0));
    box.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    box.querySelector('.vb-lightbox__close').focus();
  });
}
