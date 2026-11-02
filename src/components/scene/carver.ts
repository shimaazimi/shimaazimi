import * as THREE from 'three';
import type { Lang } from '@/content/content';

// The ice surface data: R = carved name, G = pointer marks, B = hot coral glow.
export const TW = 1536, TH = 768, WX = 16, WZ = 8;
const NAME_Z = -.62;

type Pt = [number, number];
type Node = { p: Pt; hop?: boolean; w?: number; c?: string; tail?: boolean; reveal?: boolean };

function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 18): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

function subdivide(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  return out;
}

// Single-stroke letters, drawn the way a blade would cut them
const S_STROKE: Pt[] = [
  ...bez([.96, .14], [.72, -.06], [.1, -.05], [.07, .24]),
  ...bez([.07, .24], [.05, .52], [.95, .46], [.95, .75]).slice(1),
  ...bez([.95, .75], [.95, 1.07], [.24, 1.07], [.02, .85]).slice(1),
];
const GLYPHS: Record<string, { w: number; strokes: Pt[][] }> = {
  S: { w: 1, strokes: [S_STROKE] },
  H: { w: 1, strokes: [[[0, 0], [0, 1]], [[1, 0], [1, 1]], [[0, .5], [1, .5]]] },
  I: { w: .02, strokes: [[[0, 0], [0, 1]]] },
  M: { w: 1.14, strokes: [[[0, 1], [0, 0], [.57, .66], [1.14, 0], [1.14, 1]]] },
  A: { w: 1.08, strokes: [[[0, 1], [.54, 0], [1.08, 1]], [[.19, .64], [.89, .64]]] },
  Z: { w: .98, strokes: [[[0, 0], [.98, 0], [0, 1], [.98, 1]]] },
};

function addFlourish(route: Node[], from: Pt, firstX: number, lastX: number, bottom: number, k: number, over: number) {
  const y = bottom + .42 * Math.max(k, .8);
  const a: Pt = [lastX - 1.2, y + .15];
  const b: Pt = [firstX + .75 - .9 * over, y + .1];
  const c: Pt = [firstX + .75 - 1.1 * over, y + .72];
  const swoop = [
    ...bez(from, [lastX + 1.1 * over, from[1] + .1], [lastX + 1.2 * over, y + .55], a, 40),
    ...bez(a, [(firstX + lastX) / 2, y - .25], [firstX + 1.6, y + .45], b, 70).slice(1),
    ...bez(b, [firstX + .75 - 1.9 * over, y - .2], [firstX + .75 - 1.85 * over, y + .95], c, 34).slice(1),
    ...bez(c, [firstX + 1.05, y + .5], [firstX + .4, y + .05], [firstX + .75 - 2.25 * over, y + .55], 34).slice(1),
  ];
  subdivide(swoop, .06).slice(1).forEach(p => route.push({ p, w: over < 1 ? 3 : 1.8, c: 'rgb(135,0,255)', tail: true }));
  return route;
}

function buildLatinRoute(lines: string[], target: number): Node[] {
  const LH = 1.72, CW = .92, GAP = .44, SPACE = .5, LINE_GAP = .62;
  const measure = (s: string) => [...s].reduce((sum, c) => sum + (c === ' ' ? SPACE : GLYPHS[c].w * CW + GAP), -GAP);
  const k = target / Math.max(...lines.map(measure));
  const totalH = (lines.length * LH + (lines.length - 1) * LINE_GAP) * k;
  let top = NAME_Z - totalH / 2;
  const route: Node[] = [];
  let prev: Pt | null = null, firstX = 0, lastX = 0, bottom = 0;
  lines.forEach((text, li) => {
    let x = -measure(text) * k / 2;
    if (li === 0) firstX = x;
    [...text].forEach(c => {
      if (c === ' ') { x += SPACE * k; return; }
      const gl = GLYPHS[c];
      gl.strokes.forEach(st => {
        const sub = subdivide(st.map(p => [x + p[0] * CW * k, top + p[1] * LH * k] as Pt), .06);
        if (prev) subdivide([prev, sub[0]], .12).slice(1).forEach(p => route.push({ p, hop: true }));
        else route.push({ p: sub[0], hop: true });
        sub.slice(1).forEach(p => route.push({ p, w: 3, c: 'rgb(255,0,255)' }));
        prev = sub[sub.length - 1];
      });
      x += (gl.w * CW + GAP) * k;
    });
    lastX = x - GAP * k;
    top += (LH + LINE_GAP) * k;
    bottom = top - LINE_GAP * k;
  });
  return addFlourish(route, prev!, firstX, lastX, bottom, k, lines.length > 1 ? .3 : 1);
}

export class Carver {
  readonly canvas = document.createElement('canvas');
  readonly texture: THREE.CanvasTexture;
  private g: CanvasRenderingContext2D;
  private textLayer = document.createElement('canvas');
  private route: Node[] = [];
  private idx = 0;
  private frac = 0;
  private speed = 1;
  private lastRevealX: number | null = null;
  private melting = 0;
  private pending: (() => void) | null = null;
  private frame = 0;
  private activeUntil = 0;
  carving = false;
  hopping = 0;
  bladeX = 0;
  bladeZ = 0;
  onDone: () => void = () => {};
  onChip: (x: number, z: number, vx: number, vz: number, n: number) => void = () => {};

  constructor(maxAnisotropy: number) {
    this.canvas.width = TW; this.canvas.height = TH;
    this.textLayer.width = TW; this.textLayer.height = TH;
    this.g = this.canvas.getContext('2d', { alpha: false })!;
    this.clear();
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.anisotropy = maxAnisotropy;
  }

  private toC(x: number, z: number): Pt { return [(x + WX / 2) / WX * TW, (z + WZ / 2) / WZ * TH]; }

  private clear() {
    this.g.globalCompositeOperation = 'source-over';
    this.g.fillStyle = '#000';
    this.g.fillRect(0, 0, TW, TH);
  }

  private line(a: Pt, b: Pt, width: number, color: string) {
    const [ax, ay] = this.toC(a[0], a[1]), [bx, by] = this.toC(b[0], b[1]);
    const g = this.g;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round';
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  }

  // Persian script is connected, so the blade glides over it and reveals real type.
  private buildPersianRoute(target: number, stacked: boolean): Node[] {
    const t = this.textLayer.getContext('2d')!;
    const family = getComputedStyle(document.documentElement).getPropertyValue('--font-fa') || 'Vazirmatn';
    const font = (size: number) => `200 ${size}px ${family}, Tahoma, sans-serif`;
    t.clearRect(0, 0, TW, TH);
    t.fillStyle = 'rgb(255,0,255)';
    t.textAlign = 'center'; t.textBaseline = 'middle'; t.direction = 'rtl';
    const pxTarget = target / WX * TW, over = stacked ? .3 : 1;
    const fit = (s: string) => {
      t.font = font(100);
      return 100 * pxTarget / t.measureText(s).width;
    };
    // Stretch vertically so the ice's foreshortening does not squash the letters
    const STRETCH = 1.55;
    const lines = stacked ? ['شیما', 'عظیمی'] : ['شیما عظیمی'];
    const size = Math.min(...lines.map(fit));
    t.font = font(size);
    const [cx, cy] = this.toC(0, NAME_Z);
    const stepPx = size * 1.15 * STRETCH;
    lines.forEach((s, i) => {
      t.save();
      t.translate(cx, cy + (i - (lines.length - 1) / 2) * stepPx);
      t.scale(1, STRETCH);
      t.fillText(s, 0, 0);
      t.restore();
    });
    const worldH = (size * STRETCH * lines.length * 1.1) / TH * WZ;
    const halfW = target / 2, route: Node[] = [];
    const n = 260;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      route.push({
        p: [halfW * 1.04 - f * halfW * 2.08, NAME_Z + Math.sin(f * Math.PI * 9) * worldH * .46],
        reveal: true, hop: i === 0,
      });
    }
    const bottom = NAME_Z + worldH / 2;
    const last = route[route.length - 1].p;
    const a: Pt = [-halfW + 1, bottom + .5];
    const swoop = [
      ...bez(last, [-halfW - 1.1 * over, last[1] + .4], [-halfW - over, bottom + .9], a, 40),
      ...bez(a, [-1, bottom + .1], [halfW - 1.5, bottom + .95], [halfW + 1.2 * over, bottom + .35], 80).slice(1),
    ];
    subdivide(swoop, .06).slice(1).forEach(p => route.push({ p, w: over < 1 ? 3 : 1.8, c: 'rgb(135,0,255)', tail: true }));
    return route;
  }

  private drawStep(a: Pt, node: Node, silent = false) {
    const b = node.p;
    if (node.reveal) {
      const x = (b[0] + WX / 2) / WX * TW;
      if (this.lastRevealX === null) this.lastRevealX = x + 40;
      if (x < this.lastRevealX) {
        this.g.globalCompositeOperation = 'lighter';
        const w = this.lastRevealX - x;
        this.g.drawImage(this.textLayer, x, 0, w, TH, x, 0, w, TH);
        this.lastRevealX = x;
      }
      return;
    }
    if (!node.hop) this.line(a, b, node.w!, node.c!);
    if (!silent && !node.hop && Math.random() < (node.tail ? .35 : .6)) {
      this.onChip(b[0], b[1], (b[0] - a[0]) * 40, (b[1] - a[1]) * 40, 1);
    }
  }

  private start(lang: Lang, target: number, stacked: boolean, instant: boolean, seconds: number) {
    this.route = lang === 'fa'
      ? this.buildPersianRoute(target, stacked)
      : buildLatinRoute(stacked ? ['SHIMA', 'AZIMI'] : ['SHIMA AZIMI'], target);
    this.lastRevealX = null;
    if (instant) {
      for (let i = 1; i < this.route.length; i++) this.drawStep(this.route[i - 1].p, this.route[i], true);
      this.clearHeat();
      this.activeUntil = performance.now() + 500;
      this.carving = false;
      this.onDone();
      return;
    }
    const seg = (a: Pt, n: Node) => Math.hypot(n.p[0] - a[0], n.p[1] - a[1]) * (n.hop ? .32 : 1);
    let total = 0;
    for (let i = 1; i < this.route.length; i++) total += seg(this.route[i - 1].p, this.route[i]);
    this.speed = total / seconds;
    this.idx = 0; this.frac = 0; this.carving = true;
  }

  // Instant carves arrive cold, so the coral only ever follows a moving blade
  private clearHeat() {
    this.g.globalCompositeOperation = 'multiply';
    this.g.fillStyle = 'rgb(255,255,0)';
    this.g.fillRect(0, 0, TW, TH);
  }

  carve(lang: Lang, target: number, stacked: boolean, opts: { instant: boolean; melt: boolean; seconds: number }) {
    this.carving = false;
    const go = () => { this.clear(); this.start(lang, target, stacked, opts.instant, opts.seconds); };
    if (opts.melt && !opts.instant) {
      this.melting = .75;
      this.pending = go;
    } else {
      this.melting = 0;
      go();
    }
    this.activeUntil = performance.now() + 15000;
    this.texture.needsUpdate = true;
  }

  mark(a: Pt, b: Pt) {
    this.line(a, b, 1.7, 'rgb(0,170,190)');
    this.activeUntil = performance.now() + 15000;
  }

  update(dt: number) {
    this.frame++;
    const g = this.g;
    if (this.melting > 0) {
      this.melting -= dt;
      g.globalCompositeOperation = 'difference';
      g.fillStyle = 'rgb(9,9,9)';
      g.fillRect(0, 0, TW, TH);
      if (this.melting <= 0 && this.pending) {
        const go = this.pending;
        this.pending = null;
        go();
      }
    } else if (performance.now() < this.activeUntil) {
      // Resurface marks slowly, cool the hot line quickly
      g.globalCompositeOperation = 'difference';
      g.fillStyle = `rgb(0,${this.frame % 3 === 0 ? 1 : 0},3)`;
      g.fillRect(0, 0, TW, TH);
    }
    if (this.carving) this.advance(dt);
    if (performance.now() < this.activeUntil) this.texture.needsUpdate = true;
  }

  private advance(dt: number) {
    const route = this.route;
    const seg = (a: Pt, n: Node) => Math.hypot(n.p[0] - a[0], n.p[1] - a[1]) * (n.hop ? .32 : 1);
    let budget = this.speed * dt;
    while (budget > 0 && this.idx < route.length - 1) {
      const a = route[this.idx].p, node = route[this.idx + 1];
      const len = seg(a, node);
      if (this.frac + budget < len) { this.frac += budget; budget = 0; break; }
      budget -= len - this.frac;
      this.frac = 0;
      this.drawStep(a, node);
      this.idx++;
    }
    const a = route[this.idx].p, next = route[Math.min(this.idx + 1, route.length - 1)];
    const f = this.frac / Math.max(seg(a, next), 1e-5);
    this.bladeX = a[0] + (next.p[0] - a[0]) * f;
    this.bladeZ = a[1] + (next.p[1] - a[1]) * f;
    const target = next.hop && !next.reveal ? 1 : 0;
    this.hopping += (target - this.hopping) * Math.min(1, dt * 14);
    this.activeUntil = performance.now() + 15000;
    if (this.idx >= route.length - 1) {
      this.carving = false;
      this.onDone();
    }
  }
}
