// Buddy em 3D: um robô pequenino com um ecrã como cara.
// O comportamento (passear, dormir, acenar, falar…) continua em buddy.ts,
// que muda classes no elemento [data-buddy-root]. Aqui só se desenha o
// modelo com Three.js e se traduzem essas classes em movimento.
// Se não houver WebGL, fica o Buddy em SVG.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const ICE = 0xa9c8ff;
const ICE_DEEP = 0x5b7fc4;
const SHELL = 0xeef2f8;
const SCREEN = 0x0b1120;

export function mountBuddy3D(root: HTMLElement) {
  const btn = root.querySelector<HTMLElement>('.buddy__btn');
  const eyesSvg = root.querySelector<SVGGElement>('.buddy__eyes');
  if (!btn || !eyesSvg) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'buddy__canvas';
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
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.5, 7.6);
  camera.lookAt(0, 1.25, 0);

  // Luzes: chave quente por cima, recorte azul por trás
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x0a0b0f, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-2.5, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(ICE, 2.2);
  rim.position.set(3, 2, -3);
  scene.add(rim);

  // ---------- materiais ----------
  const shell = new THREE.MeshPhysicalMaterial({ color: SHELL, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15 });
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x7fa8f0, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const deep = new THREE.MeshPhysicalMaterial({ color: ICE_DEEP, roughness: 0.45, clearcoat: 0.5 });
  const glass = new THREE.MeshPhysicalMaterial({ color: SCREEN, roughness: 0.12, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xd6e6ff });
  const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff8fb0, transparent: true, opacity: 0.45 });
  const bulb = new THREE.MeshStandardMaterial({ color: ICE, emissive: ICE, emissiveIntensity: 1.4, roughness: 0.3 });

  // ---------- modelo ----------
  const model = new THREE.Group(); // rodar para os lados (para onde vai)
  const hopper = new THREE.Group(); // saltos e esticões
  model.add(hopper);
  scene.add(model);

  // corpo
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.78, 0.8, 5, 0.3), blue);
  body.position.y = 0.62;
  hopper.add(body);
  const belly = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.38, 0.1, 4, 0.05), shell);
  belly.position.set(0, 0.6, 0.39);
  hopper.add(belly);
  const heart = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), bulb);
  heart.position.set(0, 0.63, 0.446);
  hopper.add(heart);

  // pés
  const feet: THREE.Mesh[] = [];
  for (const sx of [-0.27, 0.27]) {
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.2, 0.5, 4, 0.09), deep);
    foot.position.set(sx, 0.12, 0.06);
    hopper.add(foot);
    feet.push(foot);
  }

  // braços (o pivô fica no ombro)
  const makeArm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.55, 0.85, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.32, 6, 12), blue);
    arm.position.y = -0.22;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), shell);
    hand.position.y = -0.44;
    pivot.add(hand);
    pivot.rotation.z = side * 0.18;
    hopper.add(pivot);
    return pivot;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // cabeça
  const head = new THREE.Group();
  head.position.y = 1.02;
  hopper.add(head);
  const skull = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.12, 1.05, 6, 0.36), shell);
  skull.position.y = 0.56;
  head.add(skull);
  const screen = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.8, 0.12, 5, 0.18), glass);
  screen.position.set(0, 0.56, 0.49);
  head.add(screen);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 24), blue);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(sx * 0.78, 0.56, 0);
    head.add(ear);
  }

  // antena com mola
  const antenna = new THREE.Group();
  antenna.position.set(0, 1.1, 0);
  head.add(antenna);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.34, 10), deep);
  stalk.position.y = 0.17;
  antenna.add(stalk);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), bulb);
  tip.position.y = 0.38;
  antenna.add(tip);

  // cara no ecrã
  const face = new THREE.Group();
  face.position.set(0, 0.58, 0.556);
  head.add(face);
  const eyeGeo = new THREE.CapsuleGeometry(0.075, 0.12, 4, 12);
  const eyes = [-0.24, 0.24].map((ex) => {
    const eye = new THREE.Mesh(eyeGeo, glow);
    eye.position.set(ex, 0.05, 0);
    face.add(eye);
    return eye;
  });
  // olhos fechados (a dormir): arcos
  const lidGeo = new THREE.TorusGeometry(0.09, 0.022, 6, 20, Math.PI);
  const lids = [-0.24, 0.24].map((ex) => {
    const lid = new THREE.Mesh(lidGeo, glow);
    lid.position.set(ex, 0.02, 0);
    lid.rotation.z = Math.PI;
    lid.visible = false;
    face.add(lid);
    return lid;
  });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 20, Math.PI), glow);
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.17, 0);
  face.add(smile);
  const mouthO = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 6, 20), glow);
  mouthO.position.set(0, -0.2, 0);
  mouthO.visible = false;
  face.add(mouthO);
  for (const cx of [-0.4, 0.4]) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), cheekMat);
    cheek.position.set(cx, -0.13, 0);
    face.add(cheek);
  }

  // adereços das rotinas
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0xffb36b, roughness: 0.4, clearcoat: 1 }));
  ball.visible = false;
  model.add(ball);
  const book = new THREE.Group();
  const cover = new THREE.MeshPhysicalMaterial({ color: 0x2b3550, roughness: 0.5 });
  const pages = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const half = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.04), cover);
    half.position.set(side * 0.2, 0, 0);
    half.rotation.y = -side * 0.35;
    book.add(half);
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.02), pages);
    page.position.set(side * 0.19, 0, 0.035);
    page.rotation.y = -side * 0.35;
    book.add(page);
  }
  book.position.set(0, 0.62, 0.75);
  book.rotation.x = -0.5;
  book.visible = false;
  hopper.add(book);

  // sombra no chão
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0,0,0,0.65)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  scene.add(shadow);

  // ---------- tamanho ----------
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // ---------- estado ----------
  const has = (c: string) => root.classList.contains(c);
  const starts: Record<string, number> = {};
  const since = (c: string, now: number) => {
    if (!has(c)) {
      delete starts[c];
      return -1;
    }
    starts[c] ??= now;
    return now - starts[c];
  };
  // olhar: o buddy.ts escreve translate(x, y) nos olhos do SVG (até ~4 unidades)
  const readLook = () => {
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(eyesSvg.style.transform);
    if (!m) return [0, 0];
    const flip = has('is-facing-left') ? -1 : 1;
    return [(parseFloat(m[1]) / 4) * flip, parseFloat(m[2]) / 4];
  };

  const damp = (cur: number, target: number, k: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-k * dt));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let yaw = -0.35;
  let headYaw = 0;
  let headPitch = 0;
  let eyeScale = 1;
  let antennaSwing = 0;
  let antennaVel = 0;
  let prevX = 0;
  let last = performance.now();

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const [lx, ly] = readLook();
    const sleeping = has('is-sleeping');
    const walking = has('is-walking');

    // virar para onde vai, e olhar para o rato com a cabeça
    yaw = damp(yaw, has('is-facing-left') ? -0.45 : 0.45, 8, dt);
    if (walking) yaw = damp(yaw, has('is-facing-left') ? -0.9 : 0.9, 6, dt);
    model.rotation.y = yaw;
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    headYaw = damp(headYaw, sleeping ? 0 : clamp(lx * 0.6 - yaw * 0.55, 0.7), 6, dt);
    headPitch = damp(headPitch, sleeping ? 0.25 : has('is-reading') ? 0.3 : ly * 0.25, 6, dt);
    head.rotation.y = clamp(headYaw, 0.7);
    head.rotation.x = clamp(headPitch, 0.4);
    face.position.x = damp(face.position.x, sleeping ? 0 : lx * 0.08, 8, dt);

    // respirar / andar
    let y = 0;
    let roll = 0;
    let sx = 1;
    let sy = 1;
    const breathe = Math.sin(t * (sleeping ? 1.6 : 2.4));
    sy += breathe * (sleeping ? 0.03 : 0.015);
    if (walking) {
      const w = t * Math.PI * 2 / 0.42;
      roll = Math.sin(w) * 0.12;
      y = Math.abs(Math.sin(w)) * 0.08;
      feet[0].position.y = 0.12 + Math.max(0, Math.sin(w)) * 0.12;
      feet[1].position.y = 0.12 + Math.max(0, -Math.sin(w)) * 0.12;
      armL.rotation.x = Math.sin(w) * 0.5;
      armR.rotation.x = -Math.sin(w) * 0.5;
    } else {
      feet[0].position.y = damp(feet[0].position.y, 0.12, 12, dt);
      feet[1].position.y = damp(feet[1].position.y, 0.12, 12, dt);
      armL.rotation.x = damp(armL.rotation.x, 0, 8, dt);
      armR.rotation.x = damp(armR.rotation.x, 0, 8, dt);
    }

    // salto (0,6 s)
    const hop = since('is-hopping', now);
    if (hop >= 0 && hop < 600) {
      const p = hop / 600;
      y += Math.sin(Math.min(1, p / 0.7) * Math.PI) * 0.8;
      if (p > 0.7) {
        sy *= 1 - Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.12;
        sx *= 1 + Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.1;
      }
    }
    if (has('is-bouncing')) {
      sy *= 0.94;
      sx *= 1.05;
    }

    // esticar
    const st = since('is-stretching', now);
    let armUp = 0;
    if (st >= 0) {
      const p = Math.min(1, st / 1600);
      const k = Math.sin(p * Math.PI);
      sy *= 1 + k * 0.12;
      sx *= 1 - k * 0.05;
      armUp = k * 2.6;
    }

    // acenar com o braço direito
    let wave = 0;
    if (has('is-waving')) wave = 1;
    armR.rotation.z = damp(armR.rotation.z, 0.18 + armUp + wave * (2.4 + Math.sin(t * 12.5) * 0.35), 10, dt);
    armL.rotation.z = damp(armL.rotation.z, -0.18 - armUp, 10, dt);

    // ler: braços à frente a segurar o livro
    const reading = has('is-reading');
    book.visible = reading;
    if (reading) {
      armL.rotation.x = damp(armL.rotation.x, -1.1, 8, dt);
      armR.rotation.x = damp(armR.rotation.x, -1.1, 8, dt);
    }

    // malabarismo
    const jug = since('is-juggling', now);
    ball.visible = jug >= 0;
    if (jug >= 0) {
      const p = (jug % 900) / 900;
      ball.position.set(0, 2.5 + Math.sin(p * Math.PI) * 0.9, 0.3);
      headPitch = damp(headPitch, -0.3, 8, dt);
    }

    hopper.position.y = y;
    hopper.rotation.z = roll;
    hopper.scale.set(sx, sy, sx);
    shadow.scale.setScalar(1 - Math.min(0.5, y * 0.6));

    // olhos
    const blinking = has('is-blinking') || has('is-yawning');
    const excited = has('is-excited');
    eyeScale = damp(eyeScale, excited ? 1.25 : 1, 10, dt);
    for (const eye of eyes) {
      eye.visible = !sleeping;
      eye.scale.set(eyeScale, blinking ? (has('is-yawning') ? 0.3 : 0.1) : eyeScale, 1);
    }
    for (const lid of lids) lid.visible = sleeping;
    const oMouth = excited || has('is-surprised') || has('is-yawning');
    mouthO.visible = oMouth;
    smile.visible = !oMouth;
    if (has('is-yawning')) {
      const p = Math.min(1, (since('is-yawning', now) || 0) / 1800);
      mouthO.scale.setScalar(1 + Math.sin(p * Math.PI) * 1.2);
    } else mouthO.scale.setScalar(1);

    // antena: mola que reage ao movimento
    const vx = (root.getBoundingClientRect().left - prevX) / Math.max(dt, 0.001);
    prevX = root.getBoundingClientRect().left;
    antennaVel += (-antennaSwing * 60 - antennaVel * 6 - vx * 0.004) * dt;
    antennaSwing += antennaVel * dt;
    antenna.rotation.z = Math.max(-0.6, Math.min(0.6, antennaSwing + (hop >= 0 ? -0.2 : 0)));
    (bulb as THREE.MeshStandardMaterial).emissiveIntensity = sleeping ? 0.3 : excited ? 2.4 : 1.2 + Math.sin(t * 2) * 0.2;

    renderer.render(scene, camera);
  };

  // só desenha quando se vê
  let raf = 0;
  const loop = (now: number) => {
    frame(now);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!reduced) start();
  });
  if (reduced) {
    // movimento reduzido: um desenho por segundo chega para olhos e estados
    window.setInterval(() => frame(performance.now()), 1000);
    frame(performance.now());
  } else start();
}
