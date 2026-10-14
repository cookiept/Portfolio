// Elementos com [data-reveal] que começam abaixo do ecrã ficam à espera
// e assentam no lugar quando entram. O que já se vê ao abrir fica visível.
const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('is-waiting');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  for (const el of items) {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('is-waiting');
      observer.observe(el);
    }
  }
}
