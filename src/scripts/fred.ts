// Comportamento do Fred, a mascote do site.
// Vive no fundo do ecrã: de vez em quando passeia, espreita da borda ou
// entretém-se com uma pequena rotina. Segue o rato com os olhos, reage aos
// projetos e ao contacto, mete-se com o visitante (sem exagerar) e
// adormece se ninguém mexer durante um bocado.

const root = document.querySelector<HTMLElement>('[data-fred-root]');
const returnBtn = document.querySelector<HTMLButtonElement>('.fred-return');

if (root && returnBtn) {
  const btn = root.querySelector<HTMLButtonElement>('.fred__btn')!;
  const hideBtn = root.querySelector<HTMLButtonElement>('.fred__hide')!;
  const bubble = root.querySelector<HTMLElement>('.fred__bubble')!;
  const eyes = root.querySelector<SVGGElement>('.fred__eyes')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const IDLE_MS = 45000; // adormece ao fim deste tempo sem mexer
  const TEASE_GAP_MS = 15000; // intervalo mínimo entre comentários automáticos
  const WALK_SPEED = 110; // px por segundo
  const MARGIN = 24;
  const STORAGE_KEY = 'fred-hidden';

  const clickLines = [
    'Hi! I’m Fred.',
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
  let busy = false; // a passear ou a fazer uma rotina
  let x = 0;
  let facing = -1; // começa no canto direito, virado para a página
  let lastTease = 0;
  let saidLeaving = false;
  let lastDodge = 0;

  const isHidden = () => root.classList.contains('is-hidden');
  const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
  const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

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

  // Comentários automáticos: só um de cada vez e com intervalo entre eles.
  // Por defeito põe as mãos na cintura enquanto fala.
  const tease = (text: string, ms = 2600, pose = 'is-sassy') => {
    const now = Date.now();
    if (isHidden() || sleeping || now - lastTease < TEASE_GAP_MS) return false;
    if (bubble.classList.contains('is-visible')) return false;
    lastTease = now;
    say(text, ms);
    if (pose && !reduced && !busy) flash(pose, pose === 'is-jumping' ? 700 : ms);
    return true;
  };

  const lookAt = (px: number, py: number) => {
    if (busy) return;
    const r = btn.getBoundingClientRect();
    const dx = px - (r.left + r.width / 2);
    const dy = py - (r.top + r.height * 0.48);
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, dist / 300) * 2.6; // até 2.6 unidades do SVG
    // o SVG pode estar espelhado quando ele está virado para a esquerda
    const ex = (dx / dist) * reach * (facing < 0 ? -1 : 1);
    eyes.style.transform = `translate(${ex}px, ${(dy / dist) * reach * 0.8}px)`;
  };

  const setEyes = (ex: number, ey: number) => {
    eyes.style.transform = `translate(${ex}px, ${ey}px)`;
  };

  // ---------- posição e passeio ----------
  const size = () => root.offsetWidth;
  const minX = () => MARGIN;
  const maxX = () => window.innerWidth - size() - MARGIN;
  const clampX = (v: number) => Math.max(minX(), Math.min(maxX(), v));

  const setFacing = (dir: number) => {
    facing = dir;
    root.classList.toggle('is-facing-left', dir < 0);
  };

  const placeAt = (nx: number, dur = 0) => {
    root.style.setProperty('--walk-dur', `${dur}ms`);
    root.style.setProperty('--x', `${nx}px`);
    x = nx;
    root.classList.toggle('is-left', nx + size() / 2 < window.innerWidth / 2);
  };

  const walkTo = async (target: number, allowOffscreen = false) => {
    const nx = allowOffscreen ? target : clampX(target);
    const dist = Math.abs(nx - x);
    if (dist < 8) return;
    const dur = (dist / WALK_SPEED) * 1000;
    setFacing(nx < x ? -1 : 1);
    root.classList.remove('is-sitting', 'is-back');
    root.classList.add('is-walking');
    placeAt(nx, dur);
    await wait(dur);
    root.classList.remove('is-walking');
  };

  window.addEventListener('resize', () => {
    if (!busy) placeAt(clampX(x));
  });

  // ---------- rotinas automáticas ----------
  const routines: Record<string, () => Promise<void>> = {
    async stroll() {
      // vai a um sítio novo, nem muito perto nem muito longe (no máximo uns 5 s a andar)
      const span = maxX() - minX();
      const step = Math.min(550, span * 0.45);
      const dir = x - step < minX() ? 1 : x + step > maxX() ? -1 : Math.random() < 0.5 ? -1 : 1;
      const target = x + dir * step * (0.5 + Math.random() * 0.5);
      await walkTo(target);
      await wait(500);
      // para e olha à volta
      setEyes(-3, -1);
      await wait(700);
      setEyes(3, -1);
      await wait(700);
    },
    async peek() {
      // vai para a borda, fica de costas a "esconder-se" e depois espreita
      const toLeft = x < window.innerWidth / 2;
      const start = x;
      await walkTo(toLeft ? -size() * 0.55 : window.innerWidth - size() * 0.45, true);
      root.classList.add('is-back');
      await wait(1400);
      root.classList.remove('is-back');
      setFacing(toLeft ? 1 : -1);
      setEyes(2, 0);
      await wait(2600);
      await walkTo(start);
    },
    async stretch() {
      flash('is-stretching', 1600);
      await wait(1700);
    },
    async yawn() {
      flash('is-yawning', 1800);
      await wait(1900);
    },
    async juggle() {
      setEyes(0, -4);
      flash('is-juggling', 2700);
      await wait(2800);
    },
    async read() {
      setEyes(0, 2.5);
      root.classList.add('is-sitting', 'is-reading');
      await wait(4500);
      root.classList.remove('is-sitting', 'is-reading');
      if (Math.random() < 0.5) tease('This book is great, by the way.', 2600, '');
    },
    async sit() {
      // senta-se um bocado a ver a página
      root.classList.add('is-sitting');
      await wait(1500);
      setEyes(-2, -1);
      await wait(1500);
      setEyes(2, -1);
      await wait(2500);
      root.classList.remove('is-sitting');
      await wait(400);
    },
  };

  const weighted: [string, number][] = [
    ['stroll', 4],
    ['peek', 1],
    ['stretch', 1.5],
    ['yawn', 1],
    ['juggle', 1.5],
    ['read', 1],
    ['sit', 1.5],
  ];

  const pickRoutine = () => {
    const total = weighted.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [name, w] of weighted) {
      r -= w;
      if (r <= 0) return name;
    }
    return 'stroll';
  };

  const scheduleNext = () => {
    // uma coisa de cada vez, a cada 25 a 45 segundos
    window.setTimeout(runRoutine, 25000 + Math.random() * 20000);
  };

  const runRoutine = async () => {
    if (!reduced && !busy && !sleeping && !isHidden() && !document.hidden) {
      busy = true;
      try {
        await routines[pickRoutine()]();
      } finally {
        busy = false;
      }
    }
    scheduleNext();
  };

  // ---------- adormecer / acordar ----------
  const fallAsleep = () => {
    if (isHidden() || busy) {
      idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
      return;
    }
    sleeping = true;
    root.classList.add('is-sitting', 'is-sleeping');
    say('z z z…', 4000);
  };

  const wakeUp = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
    if (!sleeping) return;
    sleeping = false;
    root.classList.remove('is-sitting', 'is-sleeping');
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
    flash('is-waving', 2000);
    say('I’m back!');
  });

  let startHidden = false;
  try {
    startHidden = localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    /* ignora */
  }
  setHidden(startHidden);
  setFacing(-1);
  placeAt(maxX());

  // ---------- interação direta ----------
  btn.addEventListener('click', () => {
    wakeUp();
    root.classList.remove('is-sitting');
    if (!reduced) flash('is-jumping', 700);
    say(clickLines[Math.min(clicks, clickLines.length - 1)]);
    clicks++;
  });

  // ---------- rato: olhos, e foge um passinho se chegarem muito perto ----------
  window.addEventListener(
    'pointermove',
    (e) => {
      wakeUp();
      lookAt(e.clientX, e.clientY);

      if (reduced || busy || isHidden() || e.pointerType !== 'mouse') return;
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dist = Math.hypot(dx, e.clientY - (r.top + r.height / 2));
      const now = Date.now();
      if (dist < r.width * 0.9 && dist > r.width * 0.55 && now - lastDodge > 45000) {
        lastDodge = now;
        busy = true;
        // afasta-se um passinho, vira-se e põe as mãos na cintura
        walkTo(x - Math.sign(dx || 1) * 90).finally(() => {
          setFacing(dx > 0 ? 1 : -1);
          busy = false;
          tease(pick(['Hey, personal space!', 'Whoa, careful!', 'You can click me, you know.']));
        });
      }
    },
    { passive: true },
  );

  // ---------- sair da página e voltar ----------
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget || e.clientY > 0 || saidLeaving) return;
    if (tease('Leaving already?')) saidLeaving = true;
  });

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt && Date.now() - hiddenAt > 8000) {
      wakeUp();
      tease('You’re back!', 2400, 'is-waving');
    }
  });

  // ---------- reagir aos projetos ----------
  let dwellTimer = 0;
  document.addEventListener('pointerover', (e) => {
    const card = (e.target as Element).closest<HTMLElement>('[data-fred]');
    if (!card) {
      if (lastHover) window.clearTimeout(dwellTimer);
      root.classList.remove('is-excited');
      lastHover = '';
      return;
    }
    const name = card.dataset.fred ?? '';
    if (name === lastHover) return;
    lastHover = name;
    root.classList.add('is-excited');
    window.clearTimeout(dwellTimer);

    if (name === 'soon') {
      tease('That one is still cooking…', 2200, '');
      return;
    }
    if (Math.random() < 0.5) tease(pick([`Ooh, ${name}!`, `${name} is one of my favourites.`]), 2200, 'is-jumping');
    // se ficar muito tempo em cima de um projeto, dá um empurrãozinho
    dwellTimer = window.setTimeout(() => {
      if (lastHover === name) tease('Go on, open it. I won’t tell anyone.');
    }, 4500);
  });

  // ---------- scroll ----------
  let lastY = window.scrollY;
  let lastT = performance.now();
  let scrollTimer = 0;
  window.addEventListener(
    'scroll',
    () => {
      wakeUp();
      const y = window.scrollY;
      const t = performance.now();
      const speed = Math.abs(y - lastY) / Math.max(1, t - lastT); // px por ms
      const down = y > lastY;
      lastY = y;
      lastT = t;

      if (speed > 5) tease(pick(['Woah, slow down!', 'Wheee!', 'Not so fast, there’s good stuff here.']));

      if (busy) return;
      // enquanto se faz scroll, olha na direção do movimento
      setEyes(0, down ? 3 : -3);
      if (!reduced) root.classList.add('is-bouncing');
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => root.classList.remove('is-bouncing'), 160);
    },
    { passive: true },
  );

  // ---------- acenar quando chega ao contacto ----------
  const contact = document.querySelector('[data-fred-zone="contact"]');
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || waved || isHidden()) return;
        waved = true;
        flash('is-waving', 2000);
        say('Psst… say hi to Gonçalo!', 3500);
        lastTease = Date.now();
      },
      { threshold: 0.4 },
    ).observe(contact);
  }

  // ---------- olá inicial ----------
  window.setTimeout(() => {
    if (isHidden()) return;
    if (!reduced) flash('is-waving', 2000);
    say('Hi! I’m Fred. Have a look around.', 3500);
    lastTease = Date.now();
  }, 1400);

  idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
  blinkLoop();
  // o primeiro passeio vem mais cedo, para se perceber que ele está vivo
  window.setTimeout(runRoutine, 9000);
}
