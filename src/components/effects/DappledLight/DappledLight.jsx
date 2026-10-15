// Dappled Light: luz do sol a entrar por uma janela e a bater na parede,
// com sombras de folhas a balançar. As folhas mexem-se um pouco quando o
// rato passa por elas. Feito em WebGL2, sem dependências.
import { useEffect, useRef } from 'react';
import './DappledLight.css';

const MAX_LEAVES = 48;
const MAX_SEGS = 24;

const vert = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const frag = `#version 300 es
precision highp float;
#define MAX_LEAVES ${MAX_LEAVES}
#define MAX_SEGS ${MAX_SEGS}
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uPatch;      // centro x, centro y, meia largura, meia altura
uniform float uRot;
uniform vec3 uColor;
uniform vec3 uBg;
uniform float uIntensity;
uniform float uBlur;
uniform float uGrain;
uniform vec4 uLeaves[MAX_LEAVES]; // x, y, ângulo, comprimento
uniform int uLeafCount;
uniform vec4 uSegs[MAX_SEGS];     // ramos: a.x, a.y, b.x, b.y
uniform int uSegCount;
out vec4 outColor;

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 p = gl_FragCoord.xy / uRes.y;
  float H = uPatch.w;
  float blur = uBlur * H;

  // Janela: retângulo rodado e ligeiramente em perspetiva
  vec2 q = p - uPatch.xy;
  float c = cos(uRot), s = sin(uRot);
  vec2 lq = vec2(c * q.x + s * q.y, -s * q.x + c * q.y);
  lq.y *= 1.0 - 0.12 * lq.x / H;
  float dBox = sdBox(lq, uPatch.zw);
  float win = smoothstep(blur, -blur, dBox);

  // Caixilhos da janela (a cruz no meio)
  float dm = min(abs(lq.x), abs(lq.y)) - 0.05 * H;
  float frame = smoothstep(-blur * 0.6, blur * 0.6, dm);
  float light = win * mix(0.12, 1.0, frame);

  // Sombras das folhas
  float shade = 0.0;
  for (int i = 0; i < MAX_LEAVES; i++) {
    if (i >= uLeafCount) break;
    vec4 L = uLeaves[i];
    vec2 d = p - L.xy;
    float ca = cos(L.z), sa = sin(L.z);
    vec2 r = vec2(ca * d.x + sa * d.y, -sa * d.x + ca * d.y);
    float u = r.x / L.w;
    float w = L.w * 0.4 * (1.0 - u * u);
    float lb = blur * (0.5 + 0.3 * float(i % 3));
    float dl = max(abs(r.y) - w, abs(r.x) - L.w);
    float leaf = smoothstep(lb, -lb, dl);
    shade = max(shade, leaf * (0.72 - 0.1 * float(i % 3)));
  }
  for (int i = 0; i < MAX_SEGS; i++) {
    if (i >= uSegCount) break;
    vec4 S = uSegs[i];
    float db = sdSeg(p, S.xy, S.zw) - 0.012 * H;
    shade = max(shade, smoothstep(blur * 0.5, -blur * 0.5, db) * 0.6);
  }

  // O sol oscila muito ligeiramente, como quando passa uma nuvem fina
  float flicker = 0.94 + 0.06 * sin(uTime * 0.37) * sin(uTime * 0.21 + 1.3);
  float lit = light * (1.0 - shade) * flicker * uIntensity;

  // Brilho difuso à volta da luz
  float glow = smoothstep(H * 1.4, -H * 0.3, dBox) * 0.1 * uIntensity;

  vec3 col = uBg + uColor * (lit * 0.8 + glow);
  col += vec3(1.0) * pow(lit, 3.0) * 0.08;
  col += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 113.0) - 0.5) * uGrain;
  outColor = vec4(col, 1.0);
}`;

// Ramos em unidades da meia altura da janela, relativos ao centro dela.
// p0 é a ponta presa (fora da luz), p2 a ponta solta.
const BRANCHES = [
  { p0: [2.7, 2.1], p1: [1.5, 0.95], p2: [0.35, -0.25], leaves: 14, len: 0.36, phase: 0 },
  { p0: [3.0, 0.6], p1: [2.0, -0.15], p2: [1.15, -1.15], leaves: 11, len: 0.33, phase: 1.7 },
  { p0: [1.4, 2.4], p1: [1.0, 1.7], p2: [0.25, 1.15], leaves: 8, len: 0.3, phase: 3.1 },
];

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const bezier = (a, b, c, t) => {
  const m = 1 - t;
  return [m * m * a[0] + 2 * m * t * b[0] + t * t * c[0], m * m * a[1] + 2 * m * t * b[1] + t * t * c[1]];
};

const tangent = (a, b, c, t) => [
  2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]),
  2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1]),
];

// Folhas de cada ramo, alternando de lado
const buildLeaves = () => {
  const leaves = [];
  BRANCHES.forEach((br, bi) => {
    for (let i = 0; i < br.leaves; i++) {
      const t = 0.18 + (0.82 * i) / (br.leaves - 1);
      const tip = i === br.leaves - 1;
      const side = tip ? 0 : i % 2 ? 1 : -1;
      leaves.push({
        branch: bi,
        t,
        side,
        len: br.len * (0.8 + Math.random() * 0.35) * (tip ? 0.9 : 1),
        spread: 0.75 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        ang: 0,
        vel: 0,
      });
    }
  });
  return leaves;
};

export default function DappledLight({
  color = '#a9c8ff',
  background = '#0a0b0f',
  intensity = 1,
  blur = 0.07,
  speed = 1,
  grain = 0.035,
  mouseInfluence = 1,
  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n) => gl.getUniformLocation(prog, n);
    const u = {
      res: U('uRes'), time: U('uTime'), patch: U('uPatch'), rot: U('uRot'), color: U('uColor'),
      bg: U('uBg'), intensity: U('uIntensity'), blur: U('uBlur'), grain: U('uGrain'),
      leaves: U('uLeaves'), leafCount: U('uLeafCount'), segs: U('uSegs'), segCount: U('uSegCount'),
    };
    gl.uniform3fv(u.color, hexToRgb(color));
    gl.uniform3fv(u.bg, hexToRgb(background));
    gl.uniform1f(u.intensity, intensity);
    gl.uniform1f(u.blur, blur);
    gl.uniform1f(u.grain, grain);

    const leaves = buildLeaves();
    const leafData = new Float32Array(MAX_LEAVES * 4);
    const segData = new Float32Array(MAX_SEGS * 4);
    const SEG_STEPS = 6;

    let layout = { cx: 0, cy: 0, H: 0.25, aspect: 1 };
    const resize = () => {
      // Como a luz é desfocada, desenhar a meia resolução chega e poupa bateria
      const scale = 0.5 * Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(container.clientWidth * scale));
      const h = Math.max(1, Math.round(container.clientHeight * scale));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.res, w, h);
      const aspect = w / h;
      layout =
        aspect >= 1
          ? { cx: aspect - Math.min(0.47, aspect * 0.24), cy: 0.52, H: 0.22, aspect }
          : { cx: aspect * 0.62, cy: 0.74, H: 0.15, aspect };
      gl.uniform4f(u.patch, layout.cx, layout.cy, layout.H * 1.4, layout.H * 0.78);
      gl.uniform1f(u.rot, 0.42);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Rato em coordenadas do shader (altura = 1, origem em baixo à esquerda)
    const mouse = { x: -10, y: -10, dx: 0, dy: 0, inside: false };
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) {
        mouse.inside = false;
        return;
      }
      const x = (e.clientX - r.left) / r.height;
      const y = (r.bottom - e.clientY) / r.height;
      if (mouse.inside) {
        mouse.dx += x - mouse.x;
        mouse.dy += y - mouse.y;
      }
      mouse.x = x;
      mouse.y = y;
      mouse.inside = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const toWorld = (pt) => [layout.cx + pt[0] * layout.H, layout.cy + pt[1] * layout.H];
    const rotAround = (pt, o, a) => {
      const c = Math.cos(a), s = Math.sin(a);
      const x = pt[0] - o[0], y = pt[1] - o[1];
      return [o[0] + c * x - s * y, o[1] + s * x + c * y];
    };

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) time += dt * speed;

      // Vento: balanço lento com rajadas suaves de vez em quando
      const gust = Math.max(0, Math.sin(time * 0.13) * Math.sin(time * 0.29 + 0.8)) * 0.6;

      const branchRot = BRANCHES.map((br) => (Math.sin(time * 0.5 + br.phase) * 0.01 + gust * 0.012) * (reduced ? 0 : 1));

      let segCount = 0;
      BRANCHES.forEach((br, bi) => {
        const o = toWorld(br.p0);
        let prev = rotAround(toWorld(bezier(br.p0, br.p1, br.p2, 0)), o, branchRot[bi]);
        for (let k = 1; k <= SEG_STEPS && segCount < MAX_SEGS; k++) {
          const cur = rotAround(toWorld(bezier(br.p0, br.p1, br.p2, k / SEG_STEPS)), o, branchRot[bi]);
          segData.set([prev[0], prev[1], cur[0], cur[1]], segCount * 4);
          segCount++;
          prev = cur;
        }
      });

      const mdx = mouse.dx, mdy = mouse.dy;
      mouse.dx = 0;
      mouse.dy = 0;

      leaves.forEach((lf, i) => {
        const br = BRANCHES[lf.branch];
        const o = toWorld(br.p0);
        const attach = rotAround(toWorld(bezier(br.p0, br.p1, br.p2, lf.t)), o, branchRot[lf.branch]);
        const tg = tangent(br.p0, br.p1, br.p2, lf.t);
        const base = Math.atan2(tg[1], tg[0]) + branchRot[lf.branch] + lf.side * lf.spread;
        const sway = reduced ? 0 : Math.sin(time * (1 + gust) * 1.2 + lf.phase) * (0.03 + gust * 0.04);
        const len = lf.len * layout.H;

        // O rato empurra as folhas que estão perto, depois elas voltam ao lugar
        if (mouseInfluence > 0 && !reduced) {
          const a0 = base + sway + lf.ang;
          const cx = attach[0] + Math.cos(a0) * len;
          const cy = attach[1] + Math.sin(a0) * len;
          const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
          const infl = Math.exp(-((dist / (layout.H * 0.55)) ** 2));
          const push = (-Math.sin(a0) * mdx + Math.cos(a0) * mdy) / len;
          lf.vel += push * infl * 1.6 * mouseInfluence;
          lf.vel += (-28 * lf.ang - 3.2 * lf.vel) * dt;
          lf.ang = Math.max(-0.28, Math.min(0.28, lf.ang + lf.vel * dt));
        }

        const a = base + sway + lf.ang;
        leafData.set([attach[0] + Math.cos(a) * len, attach[1] + Math.sin(a) * len, a, len], i * 4);
      });

      gl.uniform1f(u.time, time);
      gl.uniform4fv(u.leaves, leafData);
      gl.uniform1i(u.leafCount, Math.min(leaves.length, MAX_LEAVES));
      gl.uniform4fv(u.segs, segData);
      gl.uniform1i(u.segCount, segCount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // Para de desenhar quando o hero sai do ecrã ou a aba fica escondida
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(container);
    const onVis = () => start();
    document.addEventListener('visibilitychange', onVis);
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, background, intensity, blur, speed, grain, mouseInfluence]);

  return (
    <div ref={containerRef} className={`dappled-light ${className}`}>
      <canvas ref={canvasRef} className="dappled-light__canvas" />
    </div>
  );
}
