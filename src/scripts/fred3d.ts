// Fred em 3D: o passarinho azul modelado em Three.js.
// O comportamento (passear, sentar, acenar, falar…) continua em fred.ts,
// que muda classes no elemento [data-fred-root]. Aqui só se desenha o
// modelo e se traduzem essas classes em poses, com transições suaves.
// Se não houver WebGL, fica o Fred em SVG.
import * as THREE from 'three';

const BODY = new THREE.Color(0x9fbdf0);
const BELLY = new THREE.Color(0xd3e0f6);
const ORANGE = 0xf0a24f;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function mountFred3D(root: HTMLElement) {
  const btn = root.querySelector<HTMLElement>('.fred__btn');
  const eyesSvg = root.querySelector<SVGGElement>('.fred__eyes');
  if (!btn || !eyesSvg) return false;

  const canvas = document.createElement('canvas');
  canvas.className = 'fred__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return false; // sem WebGL: fica o SVG
  }
  btn.appendChild(canvas);
  root.classList.add('is-3d');

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 2.15, 8.4);
  camera.lookAt(0, 1.8, 0);

  // Luz suave de estúdio, como nas imagens de referência
  scene.add(new THREE.HemisphereLight(0xf2f6ff, 0x2a3350, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6);
  fill.position.set(4, 1, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xbcd4ff, 1.2);
  rim.position.set(2, 3, -4);
  scene.add(rim);

  // ---------- materiais (mate, tipo plasticina) ----------
  const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x96b6ec, roughness: 0.78 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.6 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x15161c, roughness: 0.15 });
  const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x7a3324, roughness: 0.7 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf4f7fd, roughness: 0.9 });
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x5b7fc4, roughness: 0.7 });

  const ellipsoid = (rx: number, ry: number, rz: number, mat: THREE.Material, seg = 24) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), mat);
    m.scale.set(rx, ry, rz);
    return m;
  };

  // ---------- modelo ----------
  const model = new THREE.Group(); // para onde está virado
  const hopper = new THREE.Group(); // saltos, balanço a andar
  const torso = new THREE.Group(); // desce quando se senta, respira
  model.add(hopper);
  hopper.add(torso);
  scene.add(model);

  // Corpo: uma só peça torneada (cabeça redonda e corpo em pera)
  const profile = new THREE.CatmullRomCurve3(
    [
      [0, 0], [0.5, 0.02], [0.76, 0.14], [0.87, 0.36], [0.89, 0.6], [0.86, 0.84],
      [0.82, 1.02], [0.83, 1.2], [0.81, 1.42], [0.72, 1.66], [0.52, 1.86], [0.27, 1.97], [0, 2],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
  );
  const pts = profile.getPoints(96).map((p) => new THREE.Vector2(Math.max(0.0001, p.x), p.y));
  pts[0].x = 0;
  pts[pts.length - 1].x = 0;
  const bodyGeo = new THREE.LatheGeometry(pts, 96);
  bodyGeo.scale(0.92, 1.06, 0.82);
  // Barriga mais clara pintada no próprio corpo, sem costuras
  const pos = bodyGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const d = (x / 0.5) ** 2 + ((y - 0.6) / 0.44) ** 2;
    const w = (1 - smooth(0.72, 1.0, d)) * smooth(0.12, 0.38, z);
    c.copy(BODY).lerp(BELLY, w);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  bodyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  bodyGeo.computeVertexNormals();
  torso.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Poupa no topo da cabeça
  const crestMat = new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.78 });
  [-0.45, 0, 0.45].forEach((rz, i) => {
    const g = new THREE.Group();
    g.position.set(0, 2.05, -0.02);
    g.rotation.set(-0.15, 0, rz);
    const tuft = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, i === 1 ? 0.16 : 0.12, 4, 10), crestMat);
    tuft.position.y = 0.1;
    g.add(tuft);
    torso.add(g);
  });

  // Olhos
  const eyes = new THREE.Group();
  torso.add(eyes);
  const eyeL = new THREE.Group();
  const eyeR = new THREE.Group();
  [
    [eyeL, -0.3],
    [eyeR, 0.3],
  ].forEach(([g, ex]) => {
    const grp = g as THREE.Group;
    grp.position.set((ex as number) * 0.92, 1.48, 0.615);
    grp.rotation.y = (ex as number) * 0.8;
    const ball = ellipsoid(0.08, 0.092, 0.045, eyeMat, 20);
    grp.add(ball);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), shineMat);
    shine.position.set(0.025, 0.035, 0.04);
    grp.add(shine);
    eyes.add(grp);
  });

  // Bico: parte de cima fixa e de baixo a abrir
  const beakUp = ellipsoid(0.15, 0.08, 0.17, orangeMat);
  beakUp.position.set(0, 1.33, 0.7);
  beakUp.rotation.x = 0.2;
  torso.add(beakUp);
  const mouth = ellipsoid(0.1, 0.06, 0.08, mouthMat, 16);
  mouth.position.set(0, 1.26, 0.67);
  mouth.scale.multiplyScalar(0.01);
  torso.add(mouth);
  const jaw = new THREE.Group();
  jaw.position.set(0, 1.28, 0.63);
  torso.add(jaw);
  const beakDown = ellipsoid(0.11, 0.05, 0.12, orangeMat);
  beakDown.position.set(0, -0.005, 0.07);
  jaw.add(beakDown);

  // Asas: uma só peça em forma de gota (larga no ombro, ponta redonda),
  // achatada de lado como nas imagens. Para pôr as mãos na cintura ou
  // segurar o livro, a ponta dobra suavemente para dentro.
  const wingShape = (() => {
    const prof = new THREE.CatmullRomCurve3(
      [
        [0, 0.06], [0.1, 0.035], [0.15, -0.05], [0.16, -0.17], [0.14, -0.3], [0.1, -0.42], [0.05, -0.5], [0, -0.52],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
    );
    const p = prof.getPoints(28).map((v) => new THREE.Vector2(Math.max(0.0001, v.x), v.y));
    p[0].x = 0;
    p[p.length - 1].x = 0;
    const g = new THREE.LatheGeometry(p, 28);
    g.scale(0.8, 1, 0.7);
    const base = Float32Array.from(g.attributes.position.array as Float32Array);
    const bent = new Float32Array(base.length);
    const PIVOT = -0.18;
    for (let i = 0; i < base.length; i += 3) {
      const x = base[i], y = base[i + 1];
      const a = 2.0 * smooth(0, 0.22, PIVOT - y); // dobra só abaixo do "cotovelo"
      const dy = y - PIVOT;
      bent[i] = x * Math.cos(a) - dy * Math.sin(a);
      bent[i + 1] = PIVOT + x * Math.sin(a) + dy * Math.cos(a);
      bent[i + 2] = base[i + 2];
    }
    return { g, base, bent };
  })();
  const makeWing = (side: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.78, 1.06, 0.04);
    const geo = wingShape.g.clone();
    const mesh = new THREE.Mesh(geo, wingMat);
    mesh.scale.x = side < 0 ? 1 : -1; // a direita é a esquerda espelhada
    shoulder.add(mesh);
    torso.add(shoulder);
    let current = 0;
    // 0 = asa direita, 1 = ponta dobrada para dentro (mãos na cintura)
    const bend = (k: number) => {
      if (Math.abs(k - current) < 0.002) return;
      current = k;
      const arr = geo.attributes.position.array as Float32Array;
      const { base, bent } = wingShape;
      for (let i = 0; i < arr.length; i++) arr[i] = base[i] + (bent[i] - base[i]) * k;
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
    };
    return { shoulder, bend, side };
  };
  const wingL = makeWing(-1);
  const wingR = makeWing(1);

  // Cauda (vê-se de lado e de costas)
  const tail = new THREE.Group();
  tail.position.set(0, 0.53, -0.66);
  tail.rotation.x = -0.7;
  [-0.35, 0, 0.35].forEach((rz) => {
    const f = ellipsoid(0.08, 0.04, 0.2, wingMat, 16);
    f.position.z = -0.12;
    const g = new THREE.Group();
    g.rotation.y = rz;
    g.add(f);
    tail.add(g);
  });
  torso.add(tail);

  // Livro (para a rotina de ler)
  const book = new THREE.Group();
  book.position.set(0, 0.82, 0.9);
  book.rotation.x = -0.35;
  [-1, 1].forEach((s) => {
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.025), paperMat);
    page.position.x = s * 0.14;
    page.rotation.y = -s * 0.35;
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.39, 0.012), coverMat);
    cover.position.set(s * 0.14, 0, -0.02);
    cover.rotation.y = -s * 0.35;
    book.add(page, cover);
  });
  book.scale.setScalar(0.001);
  torso.add(book);

  // Patas (fora do torso, para ficarem no chão quando ele se senta)
  const makeFoot = (side: number) => {
    const g = new THREE.Group();
    const pad = ellipsoid(0.16, 0.06, 0.17, orangeMat);
    pad.position.z = 0.04;
    g.add(pad);
    [-0.085, 0, 0.085].forEach((tx) => {
      const toe = ellipsoid(0.065, 0.055, 0.09, orangeMat, 14);
      toe.position.set(tx, 0, 0.19);
      g.add(toe);
    });
    hopper.add(g);
    return { g, side };
  };
  const feet = [makeFoot(-1), makeFoot(1)];

  // Bola (para a rotina de malabarismo)
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
  ball.visible = false;
  scene.add(ball);

  // Sombra suave no chão
  const shadowTex = (() => {
    const s = document.createElement('canvas');
    s.width = s.height = 128;
    const g = s.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.6)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(s);
  })();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.4),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  scene.add(shadow);

  // ---------- tamanho ----------
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  // ---------- estado animado (tudo interpolado) ----------
  const has = (cls: string) => root.classList.contains(cls);
  const ease = (cur: number, target: number, dt: number, k = 10) => cur + (target - cur) * (1 - Math.exp(-dt * k));
  const s = {
    yaw: 0, pitch: 0, sit: 0, jaw: 0, eyeY: 1, eyeS: 1, book: 0,
    wl: 0.3, wle: 0, wlx: 0, wr: 0.3, wre: 0, wrx: 0,
  };
  let hopT = -1;
  let wasHopping = false;
  let walkPhase = 0;
  let time = 0;

  const lookFromSvg = () => {
    // fred.ts escreve para onde o Fred olha no SVG (translate(x, y))
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(eyesSvg.style.transform || '');
    if (!m) return [0, 0];
    const flip = has('is-facing-left') ? -1 : 1; // o SVG está espelhado quando vira à esquerda
    return [(parseFloat(m[1]) / 2.6) * flip, parseFloat(m[2]) / 2.6];
  };

  let last = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;

    const walking = has('is-walking');
    const back = has('is-back') && !walking;
    const left = has('is-facing-left');
    const sitting = has('is-sitting');
    const sleeping = has('is-sleeping');
    const reading = has('is-reading');
    const jumping = has('is-jumping');
    const waving = has('is-waving');
    const sassy = has('is-sassy');
    const stretching = has('is-stretching');
    const yawning = has('is-yawning');
    const excited = has('is-excited') || has('is-surprised');

    // Para onde está virado: de lado a andar, de costas a esconder-se,
    // ou a três quartos a olhar para o rato
    const [lx, ly] = lookFromSvg();
    let yawT: number;
    if (walking) yawT = left ? -Math.PI / 2 : Math.PI / 2;
    else if (back) yawT = Math.PI;
    else yawT = (left ? -0.3 : 0.3) * 0.6 + lx * 0.45;
    s.yaw = ease(s.yaw, yawT, dt, 8);
    s.pitch = ease(s.pitch, walking || back ? 0 : ly * 0.12, dt, 8);
    model.rotation.y = s.yaw;
    torso.rotation.x = s.pitch - s.sit * 0.08;

    // Saltos (ao clicar, ao ver um projeto)
    const hopping = jumping || has('is-hopping');
    if (hopping && !wasHopping) hopT = 0;
    wasHopping = hopping;
    let hy = 0;
    let squash = 1;
    if (hopT >= 0) {
      hopT += dt / 0.7;
      if (hopT >= 1) hopT = -1;
      else {
        hy = Math.sin(Math.min(1, hopT / 0.8) * Math.PI) * 0.55;
        squash = hopT > 0.8 ? 1 - Math.sin(((hopT - 0.8) / 0.2) * Math.PI) * 0.08 : 1 + Math.sin(hopT * Math.PI) * 0.04;
      }
    }

    // A andar: bamboleia e mexe as patas
    let roll = 0;
    if (walking) {
      walkPhase += dt * 15;
      roll = Math.sin(walkPhase) * 0.07;
      hy += Math.abs(Math.sin(walkPhase)) * 0.05;
    }
    if (has('is-bouncing')) squash *= 0.95;
    if (stretching) squash *= 1.06;
    hopper.position.y = hy;
    hopper.rotation.z = roll;
    hopper.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    // Sentado e a respirar
    s.sit = ease(s.sit, sitting ? 1 : 0, dt, 8);
    const breathe = sleeping || reading ? 1 + Math.sin(time * 2) * 0.015 : 1;
    torso.position.y = -0.2 * s.sit;
    torso.scale.set(1, breathe, 1);

    // Asas: ângulo para fora (w), cotovelo (e) e para a frente (x)
    let wl = 0.3, wle = 0, wlx = 0, wr = 0.3, wre = 0, wrx = 0;
    if (walking) {
      wl = wr = 0.3 + Math.sin(walkPhase) * 0.12;
    }
    if (sitting) wl = wr = 0.15;
    if (reading) {
      wl = wr = 0.45;
      wle = wre = 0.45;
      wlx = wrx = -0.9;
    }
    if (sassy) {
      wl = wr = 1.25;
      wle = wre = 1;
      wlx = wrx = -0.25;
    }
    if (jumping || stretching) {
      wl = wr = stretching ? 2.6 : 2.1;
      wle = wre = 0;
    }
    if (waving) {
      wr = 2.5 + Math.sin(time * 12) * 0.3;
      wre = 0.1 + Math.sin(time * 12 + 0.6) * 0.1;
    }
    s.wl = ease(s.wl, wl, dt, 12);
    s.wle = ease(s.wle, wle, dt, 12);
    s.wlx = ease(s.wlx, wlx, dt, 12);
    s.wr = ease(s.wr, wr, dt, waving ? 20 : 12);
    s.wre = ease(s.wre, wre, dt, waving ? 20 : 12);
    s.wrx = ease(s.wrx, wrx, dt, 12);
    // lado esquerdo roda para -z, direito para +z
    wingL.shoulder.rotation.set(s.wlx, 0, -s.wl);
    wingL.bend(s.wle);
    wingR.shoulder.rotation.set(s.wrx, 0, s.wr);
    wingR.bend(s.wre);

    // Patas
    feet.forEach(({ g, side }, i) => {
      const step = walking ? Math.sin(walkPhase + i * Math.PI) : 0;
      const standX = side * 0.28, standZ = 0.38;
      const sitX = side * 0.4, sitZ = 0.58;
      g.position.set(
        standX + (sitX - standX) * s.sit,
        0.06 + Math.max(0, step) * 0.12 + 0.1 * s.sit,
        standZ + step * 0.16 + (sitZ - standZ) * s.sit,
      );
      g.rotation.set(-1.25 * s.sit + (hopT >= 0 ? 0.5 : 0), side * 0.35 * s.sit, side * -0.25 * s.sit);
    });

    // Olhos: piscar, fechados a dormir, maiores quando está contente
    const closed = has('is-blinking') || sleeping;
    s.eyeY = ease(s.eyeY, closed ? 0.1 : yawning ? 0.35 : 1, dt, closed ? 30 : 14);
    s.eyeS = ease(s.eyeS, excited ? 1.15 : 1, dt, 12);
    eyeL.scale.set(s.eyeS, s.eyeS * s.eyeY, s.eyeS);
    eyeR.scale.copy(eyeL.scale);
    eyes.position.set(lx * 0.02, -ly * 0.02, 0);

    // Bico aberto
    s.jaw = ease(s.jaw, yawning ? 0.75 : excited || jumping ? 0.45 : 0, dt, 12);
    jaw.rotation.x = s.jaw;
    mouth.scale.set(0.1, 0.06, 0.08).multiplyScalar(s.jaw > 0.05 ? Math.min(1, s.jaw * 2) : 0.01);

    // Livro e bola
    s.book = ease(s.book, reading ? 1 : 0, dt, 10);
    book.scale.setScalar(Math.max(0.001, s.book * 1.3));
    ball.visible = has('is-juggling');
    if (ball.visible) ball.position.set(0, 2.45 + Math.abs(Math.sin(time * 3.5)) * 0.7, 0.15);

    shadow.scale.setScalar(1 - Math.min(0.4, hopper.position.y * 0.6));

    renderer.render(scene, camera);
    raf = document.hidden ? 0 : requestAnimationFrame(frame);
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
  raf = requestAnimationFrame(frame);
  return true;
}

// ---------- ninho ----------
// O ninho fica parado no canto e é desenhado em duas camadas: a de trás
// (por trás do Fred) e a da frente (à frente das patas), para ele parecer
// sentado lá dentro. Só se volta a desenhar quando muda de tamanho.
export function mountNest(backEl: HTMLElement, frontEl: HTMLElement) {
  const layers = [backEl, frontEl].map((el) => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(canvas);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xf2f6ff, 0x2a2018, 1.4));
    const key = new THREE.DirectionalLight(0xfff4e6, 1.8);
    key.position.set(-3, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd4ff, 0.9);
    rim.position.set(2, 3, -4);
    scene.add(rim);
    return { el, canvas, renderer, scene };
  });
  if (layers.some((l) => !l)) return false;
  const [back, front] = layers as NonNullable<(typeof layers)[number]>[];

  const camera = new THREE.PerspectiveCamera(26, 2, 0.1, 50);
  camera.position.set(0, 1.25, 3.5);
  camera.lookAt(0, 0.38, 0);

  // Palhinhas em tons de madeira e palha, com um pouco de acaso (fixo)
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const tones = [0x8a6542, 0x6e4f33, 0xa47c50, 0xc2a070, 0x5b412b, 0xb38b5c];
  const mats = tones.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.92 }));
  const twigGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1);
  const up = new THREE.Vector3(0, 1, 0);

  const HEIGHT = 0.42;
  for (let i = 0; i < 360; i++) {
    const a = rand() * Math.PI * 2;
    const h = rand() * HEIGHT;
    const t = h / HEIGHT;
    const r = 1.0 + Math.sin(t * Math.PI * 0.85) * 0.3 + (rand() - 0.3) * 0.22;
    const len = 0.5 + rand() * 0.7;
    const thick = 0.026 + rand() * 0.028;
    const m = new THREE.Mesh(twigGeo, mats[Math.floor(rand() * mats.length)]);
    m.scale.set(thick, len, thick);
    m.position.set(Math.cos(a) * r, h + 0.04, Math.sin(a) * r);
    // deitada à volta do ninho, com inclinação e torção ao acaso
    const tangent = new THREE.Vector3(-Math.sin(a), (rand() - 0.5) * 0.7, Math.cos(a)).normalize();
    m.quaternion.setFromUnitVectors(up, tangent);
    m.rotateOnWorldAxis(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), (rand() - 0.5) * 0.5);
    (m.position.z >= 0 ? front : back).scene.add(m);
  }
  // Pontas soltas a sair do ninho
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const m = new THREE.Mesh(twigGeo, mats[Math.floor(rand() * 3)]);
    m.scale.set(0.016, 0.45 + rand() * 0.3, 0.016);
    m.position.set(Math.cos(a) * 1.32, 0.28 + rand() * 0.16, Math.sin(a) * 1.32);
    const out = new THREE.Vector3(Math.cos(a), 0.6 + rand() * 0.5, Math.sin(a)).normalize();
    m.quaternion.setFromUnitVectors(up, out);
    (m.position.z >= 0 ? front : back).scene.add(m);
  }
  // Palhinhas finas e claras entrelaçadas, para parecer um ninho a sério
  const strawMats = [0xe2c98f, 0xd4b673, 0xc9a65f, 0xeedcae].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 }),
  );
  const strawGeo = new THREE.CylinderGeometry(1, 1, 1, 4, 1);
  for (let i = 0; i < 420; i++) {
    const a = rand() * Math.PI * 2;
    const h = rand() * HEIGHT * 1.05;
    const t = h / HEIGHT;
    const r = 1.0 + Math.sin(Math.min(1, t) * Math.PI * 0.85) * 0.3 + (rand() - 0.4) * 0.26;
    const m = new THREE.Mesh(strawGeo, strawMats[Math.floor(rand() * strawMats.length)]);
    m.scale.set(0.007 + rand() * 0.006, 0.35 + rand() * 0.55, 0.007 + rand() * 0.006);
    m.position.set(Math.cos(a) * r, h + 0.05, Math.sin(a) * r);
    const dir = new THREE.Vector3(-Math.sin(a), (rand() - 0.5) * 1.1, Math.cos(a)).normalize();
    m.quaternion.setFromUnitVectors(up, dir);
    m.rotateOnWorldAxis(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), (rand() - 0.5) * 0.9);
    (m.position.z >= 0 ? front : back).scene.add(m);
  }
  // Palhas soltas a espetar para fora e algumas caídas no chão
  for (let i = 0; i < 40; i++) {
    const a = rand() * Math.PI * 2;
    const ground = i < 8;
    const m = new THREE.Mesh(strawGeo, strawMats[Math.floor(rand() * strawMats.length)]);
    m.scale.set(0.006, 0.3 + rand() * 0.35, 0.006);
    const rr = ground ? 1.45 + rand() * 0.3 : 1.25 + rand() * 0.1;
    m.position.set(Math.cos(a) * rr, ground ? 0.01 : 0.15 + rand() * 0.3, Math.sin(a) * rr);
    const dir = ground
      ? new THREE.Vector3(-Math.sin(a) + (rand() - 0.5), 0.02, Math.cos(a) + (rand() - 0.5)).normalize()
      : new THREE.Vector3(Math.cos(a) + (rand() - 0.5) * 0.8, 0.3 + rand() * 0.9, Math.sin(a)).normalize();
    m.quaternion.setFromUnitVectors(up, dir);
    (m.position.z >= 0 ? front : back).scene.add(m);
  }
  // Uma pena azul perdida, do Fred
  const feather = new THREE.Mesh(
    new THREE.SphereGeometry(1, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x9fbdf0, roughness: 0.8 }),
  );
  feather.scale.set(0.05, 0.012, 0.16);
  feather.position.set(1.15, 0.47, 0.35);
  feather.rotation.set(0.3, 0.9, 0.4);
  front.scene.add(feather);
  // Fundo do ninho: uma taça escura e macia
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 1, side: THREE.DoubleSide }),
  );
  bowl.scale.set(1.08, 0.36, 1.08);
  bowl.position.y = 0.4;
  back.scene.add(bowl);

  // Sombra no chão
  const s = document.createElement('canvas');
  s.width = s.height = 128;
  const g = s.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 2.2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(s), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  back.scene.add(shadow);

  // um pouco mais estreito do que fundo
  back.scene.scale.x = front.scene.scale.x = 0.84;

  const draw = () => {
    for (const l of [back, front]) {
      const w = l.el.clientWidth || 1;
      const h = l.el.clientHeight || 1;
      l.renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // a camada da frente tem de esconder o que está atrás dela no ninho
      l.renderer.render(l.scene, camera);
    }
  };
  draw();
  new ResizeObserver(draw).observe(back.el);
  return true;
}
