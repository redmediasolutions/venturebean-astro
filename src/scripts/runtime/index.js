// Replaces jQuery + Elementor's frontend JS with small vanilla modules.
import { initAnimations } from './animations.js';
import { initNavigation } from './navigation.js';
import { initCarousels } from './carousels.js';
import { initWidgets } from './widgets.js';
import { initExtras } from './extras.js';

export function boot(Swiper) {
  const run = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.error(`[site] ${name} failed`, err);
    }
  };
  run('navigation', initNavigation);
  run('carousels', () => initCarousels(Swiper));
  run('widgets', initWidgets);
  run('animations', initAnimations);
  run('extras', initExtras);
  document.documentElement.classList.add('vb-ready');
}
