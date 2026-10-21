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
  if (!btn || !eyesSvg) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'fred__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return; // sem WebGL: fica o SVG
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
      [0, 0], [0.5, 0.02], [0.77, 0.14], [0.9, 0.36], [0.93, 0.6], [0.89, 0.84],
      [0.82, 1.02], [0.83, 1.2], [0.81, 1.42], [0.72, 1.66], [0.52, 1.86], [0.27, 1.97], [0, 2],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
  );
  const pts = profile.getPoints(96).map((p) => new THREE.Vector2(Math.max(0.0001, p.x), p.y));
  pts[0].x = 0;
  pts[pts.length - 1].x = 0;
  const bodyGeo = new THREE.LatheGeometry(pts, 96);
  bodyGeo.scale(1, 1.06, 0.9);
  // Barriga mais clara pintada no próprio corpo, sem costuras
  const pos = bodyGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const d = (x / 0.54) ** 2 + ((y - 0.6) / 0.44) ** 2;
    const w = (1 - smooth(0.72, 1.0, d)) * smooth(0.15, 0.45, z);
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
    grp.position.set(ex as number, 1.48, 0.665);
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
  beakUp.position.set(0, 1.33, 0.76);
  beakUp.rotation.x = 0.2;
  torso.add(beakUp);
  const mouth = ellipsoid(0.1, 0.06, 0.08, mouthMat, 16);
  mouth.position.set(0, 1.26, 0.74);
  mouth.scale.multiplyScalar(0.01);
  torso.add(mouth);
  const jaw = new THREE.Group();
  jaw.position.set(0, 1.28, 0.7);
  torso.add(jaw);
  const beakDown = ellipsoid(0.11, 0.05, 0.12, orangeMat);
  beakDown.position.set(0, -0.005, 0.07);
  jaw.add(beakDown);

  // Asas em dois segmentos (ombro e "cotovelo") para poder pôr as mãos na cintura
  const makeWing = (side: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.8, 1.06, 0.04);
    const upper = ellipsoid(0.11, 0.19, 0.12, wingMat);
    upper.position.y = -0.15;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.24;
    shoulder.add(elbow);
    const lower = ellipsoid(0.1, 0.2, 0.11, wingMat);
    lower.position.y = -0.12;
    elbow.add(lower);
    torso.add(shoulder);
    return { shoulder, elbow, side };
  };
  const wingL = makeWing(-1);
  const wingR = makeWing(1);

  // Cauda (vê-se de lado e de costas)
  const tail = new THREE.Group();
  tail.position.set(0, 0.53, -0.74);
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
  book.position.set(0, 0.82, 0.98);
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
    wl: 0.22, wle: 0, wlx: 0, wr: 0.22, wre: 0, wrx: 0,
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
    let wl = 0.22, wle = 0, wlx = 0, wr = 0.22, wre = 0, wrx = 0;
    if (walking) {
      wl = wr = 0.3 + Math.sin(walkPhase) * 0.12;
    }
    if (sitting) wl = wr = 0.15;
    if (reading) {
      wl = wr = 0.45;
      wle = wre = -0.9;
      wlx = wrx = -0.9;
    }
    if (sassy) {
      wl = wr = 1.2;
      wle = wre = -2.1;
      wlx = wrx = -0.35;
    }
    if (jumping || stretching) {
      wl = wr = stretching ? 2.6 : 2.1;
      wle = wre = 0.2;
    }
    if (waving) {
      wr = 2.5 + Math.sin(time * 12) * 0.3;
      wre = -0.3 + Math.sin(time * 12 + 0.6) * 0.35;
    }
    s.wl = ease(s.wl, wl, dt, 12);
    s.wle = ease(s.wle, wle, dt, 12);
    s.wlx = ease(s.wlx, wlx, dt, 12);
    s.wr = ease(s.wr, wr, dt, waving ? 20 : 12);
    s.wre = ease(s.wre, wre, dt, waving ? 20 : 12);
    s.wrx = ease(s.wrx, wrx, dt, 12);
    // lado esquerdo roda para -z, direito para +z
    wingL.shoulder.rotation.set(s.wlx, 0, -s.wl);
    wingL.elbow.rotation.z = -s.wle;
    wingR.shoulder.rotation.set(s.wrx, 0, s.wr);
    wingR.elbow.rotation.z = s.wre;

    // Patas
    feet.forEach(({ g, side }, i) => {
      const step = walking ? Math.sin(walkPhase + i * Math.PI) : 0;
      const standX = side * 0.3, standZ = 0.42;
      const sitX = side * 0.44, sitZ = 0.62;
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
}
