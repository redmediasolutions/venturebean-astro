// Scroll-to-top button and the floating chat button (Chaty).
import { reducedMotion } from './utils.js';

export function initExtras() {
  const top = document.getElementById('scroll-top-container');
  if (top) {
    let raf = 0;
    const update = () => {
      top.classList.toggle('show', window.scrollY > 100);
      raf = 0;
    };
    addEventListener('scroll', () => (raf ||= requestAnimationFrame(update)), { passive: true });
    update();
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }));
  }

  const chat = document.querySelector('#chaty-widget-0 .chaty-widget');
  if (chat) {
    chat.querySelector('.open-chaty')?.addEventListener('click', () => chat.classList.add('chaty-open'));
    chat.querySelector('.open-chaty-channel')?.addEventListener('click', () => chat.classList.remove('chaty-open'));
    chat.querySelector('.chaty-cta-close button')?.addEventListener('click', () => chat.classList.remove('chaty-open'));
  }
}
