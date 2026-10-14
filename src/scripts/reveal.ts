// Mostra elementos com [data-reveal] quando entram no ecrã.
const items = document.querySelectorAll<HTMLElement>('[data-reveal]');

if (!('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((el) => observer.observe(el));
}
