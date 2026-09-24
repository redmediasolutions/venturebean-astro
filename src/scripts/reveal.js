// Scroll-triggered reveal for [data-reveal] and [data-split] elements.
// One shared IntersectionObserver; each element animates once.

const targets = document.querySelectorAll('[data-reveal], [data-split]');

if (!('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  targets.forEach((el) => io.observe(el));
}
