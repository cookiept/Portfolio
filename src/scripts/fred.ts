// Comportamento do Fred, a mascote do site.
// Vive num ninho no canto inferior direito, sempre no mesmo sítio em todas
// as páginas. Não passeia pela página (para não tapar os projetos): fica no
// ninho, entretém-se com pequenas rotinas, segue o rato com os olhos e
// encolhe-se quando um projeto passa por trás dele.
// No ninho há um ovo por projeto: abrir um projeto choca o ovo dele (fica
// guardado no browser) e ver todos dá um ovo dourado. Nos case studies,
// quando um ecrã com nota ([data-fred-note]) aparece, conta a curiosidade.

const root = document.querySelector<HTMLElement>('[data-fred-root]');
const returnBtn = document.querySelector<HTMLButtonElement>('.fred-return');

if (root && returnBtn) {
  const btn = root.querySelector<HTMLButtonElement>('.fred__btn')!;
  const hideBtn = root.querySelector<HTMLButtonElement>('.fred__hide')!;
  const bubble = root.querySelector<HTMLElement>('.fred__bubble')!;
  const eyes = root.querySelector<SVGGElement>('.fred__eyes')!;
  const nests = [...document.querySelectorAll<HTMLElement>('[data-fred-nest]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const IDLE_MS = 45000; // adormece ao fim deste tempo sem mexer
  const TEASE_GAP_MS = 15000; // intervalo mínimo entre comentários automáticos
  const STORAGE_KEY = 'fred-hidden';

  let bubbleTimer = 0;
  let idleTimer = 0;
  let lastHover = '';
  let sleeping = false;
  let waved = false;
  let busy = false; // a fazer uma rotina
  let ready = false; // o 3D (ou o SVG) já está à vista
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
    if (!ready || isHidden() || sleeping || now - lastTease < TEASE_GAP_MS) return false;
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
    // o SVG está espelhado porque ele olha para a esquerda (para a página)
    eyes.style.transform = `translate(${(dx / dist) * reach * -1}px, ${(dy / dist) * reach * 0.8}px)`;
  };

  const setEyes = (ex: number, ey: number) => {
    eyes.style.transform = `translate(${ex}px, ${ey}px)`;
  };

  // ---------- casa: o ninho ----------
  // A posição vem sempre do ninho, por isso é igual em todas as páginas.
  const placeHome = () => {
    const nest = nests[0]?.getBoundingClientRect();
    const size = root.offsetWidth;
    const x = nest && nest.width ? nest.left + nest.width / 2 - size / 2 : window.innerWidth - size - 32;
    root.style.setProperty('--walk-dur', '0ms');
    root.style.setProperty('--x', `${x}px`);
  };
  root.classList.add('is-facing-left');
  placeHome();
  window.addEventListener('resize', placeHome);

  // Encolhe-se no ninho quando um projeto, uma imagem ou o formulário passa
  // por trás dele, para nunca tapar o conteúdo.
  const blockers = [...document.querySelectorAll<HTMLElement>('[data-fred], figure, form')];
  let duckFrame = 0;
  const checkDuck = () => {
    duckFrame = 0;
    const me = root.getBoundingClientRect();
    const over = blockers.some((el) => {
      const r = el.getBoundingClientRect();
      return r.left < me.right && r.right > me.left && r.top < me.bottom && r.bottom > me.top + me.height * 0.3;
    });
    root.classList.toggle('is-ducking', over);
  };
  const queueDuck = () => {
    if (!duckFrame) duckFrame = requestAnimationFrame(checkDuck);
  };

  // ---------- rotinas automáticas (todas sem sair do ninho) ----------
  const routines: Record<string, () => Promise<void>> = {
    async look() {
      // espreita à volta
      setEyes(-3, -1);
      await wait(900);
      setEyes(3, -1);
      await wait(900);
      setEyes(0, 0);
    },
    async hide() {
      // esconde-se no ninho e volta a espreitar
      root.classList.add('is-ducking');
      await wait(1800);
      root.classList.remove('is-ducking');
      flash('is-surprised', 700);
      await wait(800);
      queueDuck();
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
    },
    async sit() {
      root.classList.add('is-sitting');
      await wait(1500);
      setEyes(-2, -1);
      await wait(2500);
      root.classList.remove('is-sitting');
      await wait(400);
    },
  };

  const weighted: [string, number][] = [
    ['look', 2],
    ['hide', 1],
    ['stretch', 1.5],
    ['yawn', 1],
    ['juggle', 1],
    ['read', 1],
    ['sit', 2],
  ];

  const pickRoutine = () => {
    const total = weighted.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [name, w] of weighted) {
      r -= w;
      if (r <= 0) return name;
    }
    return 'look';
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

  const clickLines = ['Hehe, that tickles.', 'Hi! I’m Fred.', 'Careful, my nest is fragile!'];
  let clicks = 0;

  // ---------- notas do Fred nos case studies ----------
  // Cada ecrã com [data-fred-note] conta a sua curiosidade uma vez,
  // quando fica bem à vista.
  const NOTE_GAP_MS = 6000;
  let lastNote = 0;
  const notes = [...document.querySelectorAll<HTMLElement>('[data-fred-note]')];
  if (notes.length && 'IntersectionObserver' in window) {
    const visible = new Set<Element>();
    const tryNote = (el: HTMLElement) => {
      if (!visible.has(el)) return;
      const now = Date.now();
      if (!ready || isHidden() || bubble.classList.contains('is-visible') || now - lastNote < NOTE_GAP_MS) {
        window.setTimeout(() => tryNote(el), 1500);
        return;
      }
      noteObserver.unobserve(el);
      visible.delete(el);
      lastNote = lastTease = now;
      wakeUp();
      root.classList.remove('is-ducking');
      if (!reduced) flash('is-hopping', 600);
      say(el.dataset.fredNote ?? '', 5200);
    };
    const noteObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
            tryNote(entry.target as HTMLElement);
          } else visible.delete(entry.target);
        }
      },
      { threshold: 0.6 },
    );
    notes.forEach((el) => noteObserver.observe(el));
  }

  // ---------- mostrar / esconder ----------
  const setHidden = (hidden: boolean) => {
    root.classList.toggle('is-hidden', hidden);
    nests.forEach((n) => n.classList.toggle('is-away', hidden));
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

  // ---------- interação direta ----------
  btn.addEventListener('click', () => {
    wakeUp();
    root.classList.remove('is-sitting');
    if (!reduced) flash('is-jumping', 700);
    say(clickLines[clicks % clickLines.length], 3200);
    clicks++;
  });

  // ---------- rato: olhos, e encolhe-se se chegarem muito perto ----------
  window.addEventListener(
    'pointermove',
    (e) => {
      wakeUp();
      lookAt(e.clientX, e.clientY);

      if (reduced || busy || isHidden() || e.pointerType !== 'mouse') return;
      const r = btn.getBoundingClientRect();
      const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      const now = Date.now();
      if (dist < r.width * 0.9 && dist > r.width * 0.55 && now - lastDodge > 45000) {
        lastDodge = now;
        tease(pick(['Hey, personal space!', 'Whoa, careful!', 'You can click me, you know.']));
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
      queueDuck();
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

  // ---------- momentos especiais ----------
  const onceVisible = (el: Element | null, fn: () => void, threshold = 0.4) => {
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !ready || isHidden()) return;
        io.disconnect();
        fn();
      },
      { threshold },
    );
    io.observe(el);
  };

  // Acena quando chega ao contacto
  onceVisible(document.querySelector('[data-fred-zone="contact"]'), () => {
    if (waved) return;
    waved = true;
    flash('is-waving', 2000);
    say('Psst… say hi to Gonçalo!', 3500);
    lastTease = Date.now();
  });

  // No fim de um case study, aponta para o projeto seguinte
  onceVisible(document.querySelector('.case__next'), () => {
    flash('is-waving', 2000);
    say('Next one’s a good one →', 3200);
    lastTease = Date.now();
  });

  // Festeja quando a mensagem do formulário é enviada
  window.addEventListener('contact:sent', () => {
    if (isHidden()) return;
    wakeUp();
    if (!reduced) flash('is-jumping', 700);
    say('Yay! Message sent. Gonçalo will reply soon.', 3800);
    lastTease = Date.now();
  });

  // ---------- arranque: só depois de o Fred estar à vista ----------
  root.addEventListener(
    'fred:ready',
    () => {
      ready = true;
      placeHome();
      checkDuck();
      idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
      blinkLoop();
      window.setTimeout(runRoutine, 12000);
      if (isHidden()) return;
      if (!reduced) flash('is-waving', 2000);
      say('Hi! I’m Fred.', 3000);
      lastTease = Date.now();
    },
    { once: true },
  );
}
