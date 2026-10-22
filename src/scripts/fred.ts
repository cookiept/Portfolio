// Comportamento do Fred, a mascote do site.
// Vive num ninho no canto inferior direito, sempre no mesmo sítio em todas
// as páginas. Não passeia pela página (para não tapar os projetos): fica no
// ninho, entretém-se com pequenas rotinas, segue o rato com os olhos e
// encolhe-se quando um projeto passa por trás dele.
// Clicar nele abre um balão com os contactos. Nos case studies, quando um
// ecrã com nota ([data-fred-note]) aparece, conta a curiosidade.

const root = document.querySelector<HTMLElement>('[data-fred-root]');
const returnBtn = document.querySelector<HTMLButtonElement>('.fred-return');

if (root && returnBtn) {
  const btn = root.querySelector<HTMLButtonElement>('.fred__btn')!;
  const hideBtn = root.querySelector<HTMLButtonElement>('.fred__hide')!;
  const bubble = root.querySelector<HTMLElement>('.fred__bubble')!;
  const bubbleText = bubble.querySelector<HTMLElement>('.fred__text')!;
  const panel = root.querySelector<HTMLElement>('.fred__panel')!;
  const puffs = root.querySelector<HTMLElement>('.fred__puffs')!;
  const eyes = root.querySelector<SVGGElement>('.fred__eyes')!;
  const nests = [...document.querySelectorAll<HTMLElement>('[data-fred-nest]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const IDLE_MS = 25000; // adormece ao fim deste tempo sem lhe tocarem
  const NEAR_PX = 180; // o rato a esta distância conta como tocar-lhe
  const TEASE_GAP_MS = 15000; // intervalo mínimo entre comentários automáticos
  const STORAGE_KEY = 'fred-hidden';

  let bubbleTimer = 0;
  let idleTimer = 0;
  let lastHover = '';
  let sleeping = false;
  let drowsy = false; // a cabecear antes de adormecer
  let waved = false;
  let busy = false; // a fazer uma rotina
  let ready = false; // o 3D (ou o SVG) já está à vista
  let lastTease = 0;
  let saidLeaving = false;
  let lastDodge = 0;

  const isHidden = () => root.classList.contains('is-hidden');

  // ---------- memória ----------
  // localStorage lembra-se de quem já o conheceu (entre visitas);
  // sessionStorage guarda o que já aconteceu nesta visita, de página
  // para página: se já se apresentou, se está a dormir, se já disse adeus.
  const MEMORY = { met: 'fred-met', greeted: 'fred-greeted', asleep: 'fred-asleep', leaving: 'fred-said-leaving' };
  const recall = (store: Storage | undefined, key: string) => {
    try {
      return store?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
  const remember = (store: Storage | undefined, key: string, value: string | null) => {
    try {
      if (value === null) store?.removeItem(key);
      else store?.setItem(key, value);
    } catch {
      /* sem armazenamento: esquece-se, não faz mal */
    }
  };
  const local = (() => { try { return window.localStorage; } catch { return undefined; } })();
  const session = (() => { try { return window.sessionStorage; } catch { return undefined; } })();
  saidLeaving = recall(session, MEMORY.leaving) === '1';
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

  // As palavras entram uma a uma (ver .fred__w no Fred.astro)
  const say = (text: string, ms = 2800) => {
    if (panel.classList.contains('is-visible')) return;
    bubbleText.replaceChildren(
      ...text.split(' ').flatMap((word, i) => {
        const w = document.createElement('span');
        w.className = 'fred__w';
        w.style.setProperty('--i', String(i));
        w.textContent = word;
        return i ? [' ', w] : [w];
      }),
    );
    if (bubble.classList.contains('is-visible')) {
      // já estava aberto: reinicia as palavras e a gota estremece
      bubble.classList.remove('is-visible', 'is-jelly');
      void bubble.offsetWidth;
      bubble.classList.add('is-jelly');
    }
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

  // Bolhinhas que sobem da cabeça: "z" a dormir, notas de música a dançar
  const puff = (char: string) => {
    if (reduced || document.hidden) return;
    const el = document.createElement('span');
    el.className = 'fred__puff';
    el.textContent = char;
    el.style.setProperty('--dx', `${(Math.random() * 1.2 - 0.3).toFixed(2)}rem`);
    el.style.setProperty('--s', (0.75 + Math.random() * 0.4).toFixed(2));
    puffs.append(el);
    el.addEventListener('animationend', () => el.remove());
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
    async preen() {
      // arranja as penas debaixo da asa
      root.classList.add('is-preening');
      await wait(2600);
      root.classList.remove('is-preening');
      flash('is-shaking', 450);
      await wait(500);
    },
    async dance() {
      root.classList.add('is-dancing');
      for (const note of ['♪', '♫', '♪', '♫']) {
        puff(note);
        await wait(800);
      }
      root.classList.remove('is-dancing');
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
    ['preen', 1.5],
    ['dance', 1],
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
    // uma coisa de cada vez, a cada 15 a 27 segundos
    window.setTimeout(runRoutine, 15000 + Math.random() * 12000);
  };

  const runRoutine = async () => {
    if (!reduced && !busy && !sleeping && !drowsy && !isHidden() && !document.hidden) {
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
  // Se ninguém lhe tocar (clicar ou passar o rato perto), boceja, cabeceia
  // e adormece, com bolhinhas "z" a subir. A dormir, só acorda com um clique.
  const snore = () => {
    if (!sleeping) return;
    puff('z');
    window.setTimeout(snore, 1700);
  };

  const fallAsleep = async () => {
    if (isHidden() || busy || document.hidden || panel.classList.contains('is-visible')) {
      idleTimer = window.setTimeout(fallAsleep, IDLE_MS / 2);
      return;
    }
    drowsy = true;
    root.classList.add('is-drowsy');
    if (!reduced) flash('is-yawning', 1800);
    await wait(5000);
    if (!drowsy) return; // tocaram-lhe entretanto
    drowsy = false;
    root.classList.remove('is-drowsy');
    goToSleep();
  };

  const goToSleep = () => {
    sleeping = true;
    remember(session, MEMORY.asleep, '1');
    root.classList.add('is-sitting', 'is-sleeping');
    setEyes(0, 0);
    window.setTimeout(snore, 900);
  };

  // Atividade perto dele: adia o sono e espanta a sonolência,
  // mas não o acorda se já estiver a dormir
  const poke = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(fallAsleep, IDLE_MS);
    if (!drowsy) return;
    drowsy = false;
    root.classList.remove('is-drowsy');
    flash('is-surprised', 600);
  };

  // Três maneiras de acordar, ao calhas
  const wakings = [
    // assusta-se e dá um salto
    () => {
      if (!reduced) {
        flash('is-shaking', 400);
        flash('is-jumping', 700);
      }
      flash('is-surprised', 1200);
      say(pick(['Ah! You scared me!', 'Whoa! I’m up, I’m up!']), 2600);
    },
    // boceja, envergonhado
    async () => {
      if (!reduced) flash('is-yawning', 1300);
      await wait(1100);
      flash('is-surprised', 700);
      say('Was I snoring?', 2600);
    },
    // acorda baralhado, olha à volta e espreguiça-se
    async () => {
      if (!reduced) flash('is-looking-around', 1800);
      say('Huh? Where am I?', 1800);
      await wait(1900);
      if (!reduced) flash('is-stretching', 1400);
      say('I wasn’t sleeping, I promise.', 2600);
    },
  ];

  const wakeUp = () => {
    poke();
    if (!sleeping) return;
    sleeping = false;
    remember(session, MEMORY.asleep, null);
    root.classList.remove('is-sitting', 'is-sleeping');
    pick(wakings)();
  };

  // ---------- piscar ----------
  const blinkLoop = () => {
    if (!sleeping) flash('is-blinking', 140);
    window.setTimeout(blinkLoop, 2500 + Math.random() * 3500);
  };

  // ---------- balão de contactos ----------
  let panelY = 0;
  const setPanel = (open: boolean) => {
    if (open === panel.classList.contains('is-visible')) return;
    panel.classList.toggle('is-visible', open);
    panel.inert = !open;
    btn.setAttribute('aria-expanded', String(open));
    panelY = window.scrollY;
    if (open) {
      window.clearTimeout(bubbleTimer);
      bubble.classList.remove('is-visible');
    }
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-visible')) {
      setPanel(false);
      btn.focus();
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (!root.contains(e.target as Node)) setPanel(false);
  });
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setPanel(false)));

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
      if (!ready || sleeping || isHidden() || bubble.classList.contains('is-visible') || now - lastNote < NOTE_GAP_MS) {
        window.setTimeout(() => tryNote(el), 1500);
        return;
      }
      noteObserver.unobserve(el);
      visible.delete(el);
      lastNote = lastTease = now;
      poke();
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
    const wasAsleep = sleeping;
    wakeUp();
    if (wasAsleep) return; // o primeiro toque só o acorda
    root.classList.remove('is-sitting');
    const open = !panel.classList.contains('is-visible');
    setPanel(open);
    if (open && !reduced) flash('is-waving', 1400);
  });

  // ---------- rato: olhos, e encolhe-se se chegarem muito perto ----------
  window.addEventListener(
    'pointermove',
    (e) => {
      const r = btn.getBoundingClientRect();
      const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      // o rato perto adia o sono (a dormir, só um clique o acorda)
      if (dist < NEAR_PX) poke();
      if (sleeping || drowsy) return;
      lookAt(e.clientX, e.clientY);

      if (reduced || busy || isHidden() || e.pointerType !== 'mouse') return;
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
    if (tease('Leaving already?')) {
      saidLeaving = true;
      remember(session, MEMORY.leaving, '1');
    }
  });

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt && Date.now() - hiddenAt > 8000) {
      poke();
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
      queueDuck();
      const y = window.scrollY;
      if (Math.abs(y - panelY) > 120) setPanel(false); // fecha ao fazer scroll
      const t = performance.now();
      const speed = Math.abs(y - lastY) / Math.max(1, t - lastT); // px por ms
      const down = y > lastY;
      lastY = y;
      lastT = t;

      if (speed > 5) tease(pick(['Woah, slow down!', 'Wheee!', 'Not so fast, there’s good stuff here.']));

      if (busy || sleeping || drowsy) return;
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
    if (isHidden() || sleeping) return;
    poke();
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
      // Continua a dormir se adormeceu na página anterior
      if (recall(session, MEMORY.asleep) === '1') {
        window.clearTimeout(idleTimer);
        goToSleep();
        return;
      }
      // Apresenta-se uma vez por visita: na primeira de sempre diz o nome,
      // nas seguintes dá as boas-vindas. Ao mudar de página fica calado.
      if (recall(session, MEMORY.greeted) === '1') return;
      remember(session, MEMORY.greeted, '1');
      const metBefore = recall(local, MEMORY.met) === '1';
      remember(local, MEMORY.met, '1');
      if (!reduced) flash('is-waving', 2000);
      say(metBefore ? pick(['Welcome back!', 'Oh, you again! Hi!', 'Hey, good to see you again.']) : 'Hi! I’m Fred.', 3000);
      lastTease = Date.now();
    },
    { once: true },
  );
}
