// Hero slider. Slides change only by an explicit tab, arrow, or swipe action.

export function initHero(root) {
  const slides = [...root.querySelectorAll('[data-slide]')];
  const tabs = [...root.querySelectorAll('[data-goto]')];
  const count = slides.length;
  let index = 0;

  const go = (next) => {
    next = (next + count) % count;
    if (next === index) return;
    const prev = slides[index];
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('aria-hidden', 'true');
    prev.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    setTimeout(() => prev.classList.remove('is-leaving'), 300);

    const cur = slides[next];
    cur.classList.add('is-active');
    cur.removeAttribute('aria-hidden');
    cur.querySelectorAll('a').forEach((a) => a.removeAttribute('tabindex'));

    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === next);
      t.classList.toggle('is-done', i < next);
      if (i === next) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    index = next;
  };

  tabs.forEach((t) => {
    t.addEventListener('click', () => go(Number(t.dataset.goto)));
  });
  root.querySelector('[data-prev]')?.addEventListener('click', () => go(index - 1));
  root.querySelector('[data-next]')?.addEventListener('click', () => go(index + 1));

  // Keyboard arrows when focus is inside the hero
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });

  // Touch swipe
  let startX = null;
  root.addEventListener('pointerdown', (e) => e.pointerType !== 'mouse' && (startX = e.clientX), { passive: true });
  root.addEventListener(
    'pointerup',
    (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    },
    { passive: true },
  );

}
