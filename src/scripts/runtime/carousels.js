// Swiper-based widgets: Slides, Testimonial Carousel, Image Carousel.
// Options mirror what Elementor's own handlers pass to Swiper.
import { $$, settingsOf } from './utils.js';

const yes = (v) => v === 'yes';
const size = (v, fallback) => (v && typeof v === 'object' ? Number(v.size) : Number(v)) || fallback;

function autoplay(s, delayKey = 'autoplay_speed') {
  if (!yes(s.autoplay)) return false;
  return {
    delay: Number(s[delayKey]) || 5000,
    disableOnInteraction: yes(s.pause_on_interaction),
    pauseOnMouseEnter: yes(s.pause_on_hover),
  };
}

function nav(widget, show) {
  if (!show) return {};
  const nextEl = widget.querySelector('.elementor-swiper-button-next');
  const prevEl = widget.querySelector('.elementor-swiper-button-prev');
  return nextEl && prevEl ? { navigation: { nextEl, prevEl } } : {};
}

function dots(widget, type = 'bullets') {
  const el = widget.querySelector('.swiper-pagination');
  return el ? { pagination: { el, type, clickable: true } } : {};
}

/**
 * Per-device values, as Elementor's carousel handlers read them: a device without its own
 * value uses the widget default for that device (it does not inherit the desktop value).
 */
function responsive(s, key, fallbacks, map = (v) => v) {
  const pick = (suffix, fb) => {
    const v = s[key + suffix];
    return v === undefined || v === '' || (typeof v === 'object' && v && v.size === '') ? fb : v;
  };
  const d = map(pick('', fallbacks.desktop));
  const t = map(pick('_tablet', fallbacks.tablet ?? d));
  const m = map(pick('_mobile', fallbacks.mobile ?? t));
  return { mobile: m, tablet: t, desktop: d };
}

// Elementor passes its breakpoint values straight to Swiper as min-width keys.
const BP_TABLET = 767;
const BP_DESKTOP = 1024;

export function initCarousels(Swiper) {
  if (!Swiper) return;

  // --- Slides (hero sliders) ---
  $$('.elementor-widget-slides').forEach((widget) => {
    const container = widget.querySelector('.elementor-slides-wrapper.swiper, .elementor-slides-wrapper');
    if (!container) return;
    const s = settingsOf(widget);
    const count = container.querySelectorAll('.swiper-slide').length;
    const animation = container.dataset.animation;
    const navigation = s.navigation || 'both';
    const contents = (sw) => sw.slides.map((sl) => sl.querySelector('.swiper-slide-contents')).filter(Boolean);

    const swiper = new Swiper(container, {
      slidesPerView: 1,
      loop: yes(s.infinite) && count > 1,
      speed: Number(s.transition_speed) || 500,
      effect: s.transition === 'fade' ? 'fade' : 'slide',
      fadeEffect: { crossFade: true },
      autoplay: count > 1 ? autoplay(s) : false,
      grabCursor: count > 1,
      ...nav(widget, ['both', 'arrows'].includes(navigation)),
      ...(['both', 'dots'].includes(navigation) ? dots(widget) : {}),
      on: {
        init(sw) {
          kenBurns(sw);
          if (animation) {
            const c = sw.slides[sw.activeIndex]?.querySelector('.swiper-slide-contents');
            c?.classList.add('animated', animation);
          }
        },
        slideChangeTransitionStart(sw) {
          if (!animation) return;
          contents(sw).forEach((c) => {
            c.classList.remove('animated', animation);
            c.style.visibility = 'hidden';
          });
        },
        slideChangeTransitionEnd(sw) {
          kenBurns(sw);
          if (!animation) return;
          const c = sw.slides[sw.activeIndex]?.querySelector('.swiper-slide-contents');
          if (c) {
            c.style.visibility = '';
            c.classList.add('animated', animation);
          }
        },
      },
    });
    if (animation) swiper.slides.forEach((sl, i) => i !== swiper.activeIndex && sl.querySelector('.swiper-slide-contents')?.classList.remove('animated', animation));
  });

  // --- Testimonial carousel ---
  $$('.elementor-widget-testimonial-carousel').forEach((widget) => {
    const container = widget.querySelector('.elementor-main-swiper');
    if (!container) return;
    const s = settingsOf(widget);
    const per = responsive(s, 'slides_per_view', { desktop: 1, tablet: 1, mobile: 1 }, Number);
    const group = responsive(s, 'slides_to_scroll', { desktop: 1, tablet: 1, mobile: 1 }, Number);
    const gap = responsive(s, 'space_between', { desktop: 10 }, (v) => size(v, 10));
    const count = container.querySelectorAll('.swiper-slide').length;
    new Swiper(container, {
      slidesPerView: per.mobile,
      slidesPerGroup: Math.min(group.mobile, per.mobile),
      spaceBetween: gap.mobile,
      breakpoints: {
        [BP_TABLET]: { slidesPerView: per.tablet, slidesPerGroup: Math.min(group.tablet, per.tablet), spaceBetween: gap.tablet },
        [BP_DESKTOP]: { slidesPerView: per.desktop, slidesPerGroup: Math.min(group.desktop, per.desktop), spaceBetween: gap.desktop },
      },
      loop: yes(s.loop) && count > per.desktop,
      speed: Number(s.speed) || 500,
      autoplay: autoplay(s),
      grabCursor: true,
      ...nav(widget, yes(s.show_arrows)),
      ...(s.pagination ? dots(widget, s.pagination) : {}),
    });
  });

  // --- Image carousel ---
  $$('.elementor-widget-image-carousel').forEach((widget) => {
    const container = widget.querySelector('.elementor-image-carousel-wrapper');
    if (!container) return;
    const s = settingsOf(widget);
    const desktopShow = Number(s.slides_to_show) || 3;
    const per = responsive(s, 'slides_to_show', { desktop: 3, tablet: desktopShow === 1 ? 1 : 2, mobile: 1 }, Number);
    const group = responsive(s, 'slides_to_scroll', { desktop: 1, tablet: 1, mobile: 1 }, Number);
    const gapVal = s.image_spacing === 'custom' ? size(s.image_spacing_custom, 20) : 20;
    const navigation = s.navigation || 'both';
    const count = container.querySelectorAll('.swiper-slide').length;
    const single = per.desktop === 1;
    new Swiper(container, {
      slidesPerView: per.mobile,
      slidesPerGroup: group.mobile,
      spaceBetween: single ? 0 : gapVal,
      breakpoints: {
        [BP_TABLET]: { slidesPerView: per.tablet, slidesPerGroup: group.tablet },
        [BP_DESKTOP]: { slidesPerView: per.desktop, slidesPerGroup: group.desktop },
      },
      loop: (s.infinite ?? 'yes') === 'yes' && count > per.desktop,
      speed: Number(s.speed) || 500,
      effect: s.effect === 'fade' && single ? 'fade' : 'slide',
      autoplay: autoplay(s),
      ...nav(widget, ['both', 'arrows'].includes(navigation)),
      ...(['both', 'dots'].includes(navigation) ? dots(widget) : {}),
    });
  });
}

function kenBurns(sw) {
  sw.slides.forEach((sl, i) => {
    const bg = sl.querySelector('.elementor-ken-burns');
    if (bg) bg.classList.toggle('elementor-ken-burns--active', i === sw.activeIndex);
  });
}
