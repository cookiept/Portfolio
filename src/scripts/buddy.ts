// Comportamento do Buddy, a mascote do site.
// Segue o rato com os olhos, pisca, reage aos projetos e ao contacto,
// salta quando lhe tocam e adormece se ninguém mexer durante um bocado.

const root = document.querySelector<HTMLElement>('[data-buddy-root]');
const returnBtn = document.querySelector<HTMLButtonElement>('.buddy-return');

if (root && returnBtn) {
  const btn = root.querySelector<HTMLButtonElement>('.buddy__btn')!;
  const hideBtn = root.querySelector<HTMLButtonElement>('.buddy__hide')!;
  const bubble = root.querySelector<HTMLElement>('.buddy__bubble')!;
  const eyes = root.querySelector<SVGGElement>('.buddy__eyes')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const IDLE_MS = 15000;
  const STORAGE_KEY = 'buddy-hidden';

  const clickLines = [
    'Hi! I’m Buddy.',
    'I keep an eye on Gonçalo’s projects.',
    'Gonçalo keeps me around for company.',
    'Hehe, that tickles.',
    'Okay, okay, I’m awake!',
    'You really like clicking, huh?',
  ];

  let clicks = 0;
  let bubbleTimer = 0;
  let idleTimer = 0;
  let lastHover = '';
  let sleeping = false;
  let waved = false;

  // ---------- utilidades ----------
  const flash = (cls: string, ms: number) => {
    root.classList.remove(cls);
    // força o reinício da animação
    void root.offsetWidth;
    root.classList.add(cls);
    window.setTimeout(() => root.classList.remove(cls), ms);
  };

  const say = (text: string, ms = 2800) => {
    bubble.textContent = text;
    bubble.classList.add('is-visible');
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('is-visible'), ms);
  };

  const lookAt = (x: number, y: number) => {
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.48;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, dist / 300) * 4; // até 4 unidades do SVG
    eyes.style.transform = `translate(${(dx / dist) * reach}px, ${(dy / dist) * reach * 0.8}px)`;
  };

  // ---------- adormecer / acordar ----------
  const fallAsleep = () => {
    if (root.classList.contains('is-hidden')) return;
    sleeping = true;
    root.classList.add('is-sleeping');
    say('z z z…', 4000);
  };

  const wakeUp = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
    if (!sleeping) return;
    sleeping = false;
    root.classList.remove('is-sleeping');
    flash('is-surprised', 900);
    say('Oh! I’m awake, I promise.');
  };

  // ---------- piscar ----------
  const blinkLoop = () => {
    if (!sleeping) flash('is-blinking', 140);
    window.setTimeout(blinkLoop, 2500 + Math.random() * 3500);
  };

  // ---------- mostrar / esconder ----------
  const setHidden = (hidden: boolean) => {
    root.classList.toggle('is-hidden', hidden);
    returnBtn.hidden = !hidden;
    try {
      if (hidden) localStorage.setItem(STORAGE_KEY, '1');
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sem armazenamento: não faz mal */
    }
  };

  hideBtn.addEventListener('click', () => setHidden(true));
  returnBtn.addEventListener('click', () => {
    setHidden(false);
    flash('is-hopping', 600);
    say('I’m back!');
  });

  let startHidden = false;
  try {
    startHidden = localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    /* ignora */
  }
  setHidden(startHidden);

  // ---------- interação direta ----------
  btn.addEventListener('click', () => {
    wakeUp();
    if (!reduced) flash('is-hopping', 600);
    say(clickLines[Math.min(clicks, clickLines.length - 1)]);
    clicks++;
  });

  // ---------- olhos a seguir o rato ----------
  window.addEventListener(
    'pointermove',
    (e) => {
      wakeUp();
      lookAt(e.clientX, e.clientY);
    },
    { passive: true },
  );

  // ---------- reagir aos projetos ----------
  document.addEventListener('pointerover', (e) => {
    const card = (e.target as Element).closest<HTMLElement>('[data-buddy]');
    if (!card) {
      root.classList.remove('is-excited');
      lastHover = '';
      return;
    }
    const name = card.dataset.buddy ?? '';
    if (name === lastHover) return;
    lastHover = name;
    root.classList.add('is-excited');
    if (name === 'soon') say('That one is still cooking…', 2200);
    else {
      const lines = [`Ooh, ${name}!`, `${name} is one of my favourites.`, `Click it, ${name} is cool.`];
      say(lines[Math.floor(Math.random() * lines.length)], 2200);
    }
  });

  // ---------- scroll ----------
  let lastY = window.scrollY;
  let scrollTimer = 0;
  window.addEventListener(
    'scroll',
    () => {
      wakeUp();
      const y = window.scrollY;
      const down = y > lastY;
      lastY = y;
      // enquanto se faz scroll, olha na direção do movimento
      eyes.style.transform = `translate(0px, ${down ? 3 : -3}px)`;
      if (!reduced) root.classList.add('is-bouncing');
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => root.classList.remove('is-bouncing'), 160);
    },
    { passive: true },
  );

  // ---------- acenar quando chega ao contacto ----------
  const contact = document.querySelector('[data-buddy-zone="contact"]');
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || waved) return;
        waved = true;
        flash('is-waving', 2000);
        say('Psst… say hi to Gonçalo!', 3500);
      },
      { threshold: 0.4 },
    ).observe(contact);
  }

  // ---------- olá inicial ----------
  window.setTimeout(() => {
    if (root.classList.contains('is-hidden')) return;
    if (!reduced) flash('is-hopping', 600);
    say('Hi! I’m Buddy. Have a look around.', 3500);
  }, 1400);

  idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
  blinkLoop();
}
