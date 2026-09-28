// Entrance animations (Elementor's own, e.g. fadeInUp) + a subtle site-wide reveal.
import { $$, currentDevice, settingsOf, onVisible, reducedMotion } from './utils.js';

export function initAnimations() {
  const reduce = reducedMotion();

  // Elementor lazy-loads section backgrounds (below the 3rd section) until they are near.
  onVisible($$('.e-con.e-parent, .e-con'), (el) => el.classList.add('e-lazyloaded'), { rootMargin: '300px 0px' });

  // Entrance animations stored on each widget (fadeInUp and similar).
  const device = currentDevice();
  const pending = $$('.elementor-invisible');
  pending.forEach((el) => {
    const s = settingsOf(el);
    const name =
      s[`_animation_${device}`] || s[`animation_${device}`] || s._animation || s.animation || '';
    if (!name || name === 'none' || reduce) {
      el.classList.remove('elementor-invisible');
      el.dataset.vbAnimName = '';
    } else {
      el.dataset.vbAnimName = name;
    }
  });
  onVisible(
    pending.filter((el) => el.dataset.vbAnimName),
    (el) => {
      const s = settingsOf(el);
      const delay = Number(s._animation_delay ?? s.animation_delay ?? 0) || 0;
      setTimeout(() => {
        el.classList.remove('elementor-invisible');
        el.classList.add('animated', el.dataset.vbAnimName);
      }, delay);
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  if (reduce) return;

  // Subtle reveal for everything else below the fold: fade + 18px lift, lightly staggered.
  const page = document.querySelector('[data-elementor-type="site-page"]');
  if (!page) return;
  const selector = [
    '.elementor-widget-heading',
    '.elementor-widget-text-editor',
    '.elementor-widget-image',
    '.elementor-widget-image-box',
    '.elementor-widget-icon-box',
    '.elementor-widget-button',
    '.elementor-widget-icon-list',
    '.elementor-widget-counter',
    '.elementor-widget-video',
    '.elementor-widget-divider',
    '.elementor-widget-n-accordion',
    '.elementor-widget-gallery',
    '.elementor-widget-loop-grid',
    '.elementor-widget-posts',
    '.elementor-widget-testimonial-carousel',
    '.elementor-widget-image-carousel',
  ].join(',');
  const fold = window.innerHeight * 0.92;
  const candidates = $$(selector, page).filter((el) => {
    if (el.closest('.swiper, .elementor-invisible, .animated, .e-off-canvas, .elementor-location-popup')) return false;
    if (el.querySelector('.elementor-invisible')) return false;
    if (el.parentElement.closest(selector)) return false; // only the outermost widget
    return el.getBoundingClientRect().top > fold;
  });
  candidates.forEach((el) => el.classList.add('vb-reveal'));

  let batch = [];
  let scheduled = false;
  const flush = () => {
    batch
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
      .forEach((el, i) => {
        el.style.setProperty('--vb-delay', `${Math.min(i, 4) * 70}ms`);
        el.classList.add('vb-in');
      });
    batch = [];
    scheduled = false;
  };
  const queue = (el) => {
    if (el.classList.contains('vb-in') || batch.includes(el)) return;
    batch.push(el);
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(flush);
    }
  };
  onVisible(candidates, queue, { rootMargin: '0px 0px -6% 0px' });

  // Safety net for fast jumps (anchor links, flick scrolling): once scrolling
  // settles, reveal anything that is already above the bottom of the viewport.
  let settle;
  addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        candidates.forEach((el) => {
          if (!el.classList.contains('vb-in') && el.getBoundingClientRect().top < window.innerHeight) queue(el);
        });
      }, 150);
    },
    { passive: true },
  );
}
