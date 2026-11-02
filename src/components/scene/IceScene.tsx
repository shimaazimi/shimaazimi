'use client';

import { Canvas, invalidate, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { projects, skills, type Lang } from '@/content/content';
import { bus, STOPS } from '@/lib/bus';
import { prefersReducedMotion } from '@/lib/gsap';
import { Carver, WX, WZ } from './carver';
import {
  chipFragment, chipVertex, crystalFragment, crystalVertex, dustFragment, dustVertex, iceFragment, iceVertex,
  shardFragment, shardVertex, spiralFragment, spiralVertex, trailFragment, trailVertex,
} from './shaders';

const STATIONS: [number, number][] = [[-6, -32], [6, -44], [-6, -56], [6, -68], [-5, -80]];
const SHARD_Z = -104;
const CRYSTAL_C = new THREE.Vector3(0, 0, -130);
const CRYSTAL_R = 6.6;
const SPIRAL_C = new THREE.Vector3(0, 0, -162);

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const band = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)));

type Key = { pos: THREE.Vector3; look: THREE.Vector3 };

// One camera pose per scroll stop
function buildKeys(aspect: number, stacked: boolean, far: number): Key[] {
  const wide = Math.max(1, Math.min(1.75, 1.15 / aspect));
  const key = (px: number, py: number, pz: number, lx: number, ly: number, lz: number): Key => {
    const look = new THREE.Vector3(lx, ly, lz);
    const pos = new THREE.Vector3(px, py, pz).sub(look).multiplyScalar(wide).add(look);
    return { pos, look };
  };
  const hero: Key = {
    pos: new THREE.Vector3(0, 5.9 * far, 6.9 * far),
    // Raised, so the name and its closing loop sit clear above the headline
    look: new THREE.Vector3(0, 0, stacked ? 1.9 : 1.2 + Math.max(0, aspect - 1.8) * 1.2),
  };
  const keys: Key[] = [hero, key(-3.5, 1.5, -11, 2.5, .2, -22)];
  STATIONS.forEach(([x, z], i) => {
    const side = i % 2 ? -1 : 1;
    // Frame each stop to one side, so the card has the other side of the screen
    const lookX = stacked ? x : x - side * 4.6;
    keys.push(key(x + side * 3.8, 3.4, z + 8.2, lookX, 0, z - 1));
  });
  keys.push(key(0, 2.8, SHARD_Z + 13, 0, 2, SHARD_Z));
  keys.push(stacked
    ? key(0, 15, CRYSTAL_C.z + 17, 0, 0, CRYSTAL_C.z + 11)
    : key(0, 10, CRYSTAL_C.z + 12.5, -7.2, 0, CRYSTAL_C.z));
  keys.push(key(0, 2.6, SPIRAL_C.z + 15, 0, 3.8, SPIRAL_C.z));
  return keys;
}

// The blade's single line, from the name to the final spiral
function buildTrail() {
  const pts: THREE.Vector3[] = [];
  const add = (x: number, z: number) => pts.push(new THREE.Vector3(x, .03, z));
  const stopU: number[] = [0];
  const mark = () => stopU.push(pts.length - 1);

  add(-7.4, 2.8); add(-7.5, -2.5); add(-3.5, -7); add(2, -13);
  add(3, -21); mark();
  STATIONS.forEach(([x, z], i) => {
    const side = i % 2 ? -1 : 1, r = 2.1;
    add(x - side * 2, z + 6);
    add(x + side * r, z + 1.6);
    add(x + side * r * .4, z - r);
    mark();
    add(x - side * r, z - .3);
    add(x + side * .3, z + r * .7);
    add(x + side * r * 1.1, z - 2.6);
  });
  add(-11, SHARD_Z + 6); add(-6.5, SHARD_Z + 3); add(-3, SHARD_Z + 7);
  add(0, SHARD_Z + 3.5); mark();
  add(3, SHARD_Z + 7); add(6.5, SHARD_Z + 3); add(10, SHARD_Z + 7);
  const R = CRYSTAL_R + 2.4;
  add(R, CRYSTAL_C.z + 8);
  for (let i = 0; i <= 8; i++) {
    const a = -.3 + i / 8 * Math.PI * 2;
    add(CRYSTAL_C.x + Math.cos(a) * R, CRYSTAL_C.z + Math.sin(a) * R);
    if (i === 4) mark();
  }
  add(R * .6, CRYSTAL_C.z - 13); add(-2.5, SPIRAL_C.z + 10); add(3, SPIRAL_C.z + 3.6); add(2.4, SPIRAL_C.z - 1.4);
  add(-1.2, SPIRAL_C.z - 1.6); add(-1, SPIRAL_C.z + .9); add(0, SPIRAL_C.z);
  stopU.push(pts.length - 1);

  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .5);
  const N = 2400, width = .05;
  const position = new Float32Array((N + 1) * 6), aU = new Float32Array((N + 1) * 2), aSide = new Float32Array((N + 1) * 2);
  const index: number[] = [];
  const tangent = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    curve.getPoint(t, p);
    curve.getTangent(t, tangent);
    side.crossVectors(up, tangent).normalize().multiplyScalar(width);
    position.set([p.x + side.x, p.y, p.z + side.z, p.x - side.x, p.y, p.z - side.z], i * 6);
    aU.set([t, t], i * 2);
    aSide.set([1, -1], i * 2);
    if (i < N) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geo.setAttribute('aU', new THREE.BufferAttribute(aU, 1));
  geo.setAttribute('aSide', new THREE.BufferAttribute(aSide, 1));
  geo.setIndex(index);
  return { geo, curve, stops: stopU.map(i => i / (pts.length - 1)) };
}

function buildCrystals(perCrystal: number) {
  const n = perCrystal * skills.length;
  const position = new Float32Array(n * 3), aStart = new Float32Array(n * 3), aCenter = new Float32Array(n * 3);
  const aIndex = new Float32Array(n), aRand = new Float32Array(n);
  let v = 0;
  skills.forEach((_, c) => {
    const ang = c / skills.length * Math.PI * 2 + Math.PI / 6;
    const cx = CRYSTAL_C.x + Math.cos(ang) * CRYSTAL_R, cz = CRYSTAL_C.z + Math.sin(ang) * CRYSTAL_R;
    const y = 1.2;
    const seed = c * 1.7;
    for (let i = 0; i < perCrystal; i++, v++) {
      // Six arms; a branch every so often along each, with each crystal's own proportions
      const arm = Math.floor(Math.random() * 6);
      const a = arm / 6 * Math.PI * 2;
      const along = Math.pow(Math.random(), .8);
      let x = Math.cos(a) * along * 2.1, z = Math.sin(a) * along * 2.1;
      const onBranch = Math.random() < .58;
      if (onBranch) {
        const stations = [.34 + (seed % .1), .58, .8];
        const at = stations[Math.floor(Math.random() * 3)];
        const len = Math.random() * (1 - at) * 1.5;
        const dir = a + (Math.random() < .5 ? 1 : -1) * Math.PI / 3;
        x = Math.cos(a) * at * 2.1 + Math.cos(dir) * len;
        z = Math.sin(a) * at * 2.1 + Math.sin(dir) * len;
      }
      position.set([cx + x, y, cz + z], v * 3);
      aCenter.set([cx, y, cz], v * 3);
      aStart.set([CRYSTAL_C.x + (Math.random() - .5) * 34, Math.random() * 9, CRYSTAL_C.z + (Math.random() - .5) * 30], v * 3);
      aIndex[v] = c;
      aRand[v] = Math.random();
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(aStart, 3));
  geo.setAttribute('aCenter', new THREE.BufferAttribute(aCenter, 3));
  geo.setAttribute('aIndex', new THREE.BufferAttribute(aIndex, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1));
  return geo;
}

function World({ lang, onCarved, small, reduced }: { lang: Lang; onCarved: () => void; small: boolean; reduced: boolean }) {
  const { gl, scene, camera, size, setDpr } = useThree();
  const onCarvedRef = useRef(onCarved);
  onCarvedRef.current = onCarved;

  const w = useMemo(() => {
    const px = gl.getPixelRatio();
    const carver = new Carver(gl.capabilities.getMaxAnisotropy());
    const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;

    const iceMat = new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: {
        uT: { value: carver.texture }, uTime: { value: 0 }, uFogBase: { value: 9 },
        uBlade: { value: new THREE.Vector3() }, uBladeOn: { value: 0 },
        uPx: { value: new THREE.Vector2(1 / 1536, 1 / 768) },
      },
      vertexShader: iceVertex, fragmentShader: iceFragment,
    });
    const ice = new THREE.Mesh(new THREE.PlaneGeometry(220, 220).rotateX(-Math.PI / 2), iceMat);
    ice.renderOrder = -1;
    ice.frustumCulled = false;

    // Chips
    const MAX = small ? 260 : 620;
    const P = { pos: new Float32Array(MAX * 3), vel: new Float32Array(MAX * 3), life: new Float32Array(MAX), hot: new Float32Array(MAX), i: 0 };
    const chipGeo = new THREE.BufferGeometry();
    chipGeo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3));
    chipGeo.setAttribute('aLife', new THREE.BufferAttribute(P.life, 1));
    chipGeo.setAttribute('aHot', new THREE.BufferAttribute(P.hot, 1));
    const chipMat = new THREE.ShaderMaterial({ ...additive, uniforms: { uScale: { value: 40 * px } }, vertexShader: chipVertex, fragmentShader: chipFragment });
    const chips = new THREE.Points(chipGeo, chipMat);
    chips.frustumCulled = false;
    const spray = (x: number, z: number, vx: number, vz: number, n: number) => {
      for (let k = 0; k < n; k++) {
        const i = P.i = (P.i + 1) % MAX;
        const s = Math.random() < .5 ? -1 : 1, sp = .35 + Math.random() * 1.1;
        P.pos.set([x, .02, z], i * 3);
        P.vel.set([-vx * .1 - vz * s * sp + (Math.random() - .5) * .3, .5 + Math.random() * 1.5, -vz * .1 + vx * s * sp + (Math.random() - .5) * .3], i * 3);
        P.life[i] = .55 + Math.random() * .45;
        P.hot[i] = Math.random() < .3 ? 1 : 0;
      }
    };
    carver.onChip = spray;

    // Cold dust travels with the camera
    const DUST = reduced ? 0 : small ? 90 : 240;
    const dustPos = new Float32Array(DUST * 3), dustSeed = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dustPos.set([(Math.random() - .5) * 26, Math.random() * 7, (Math.random() - .5) * 22 - 3], i * 3);
      dustSeed[i] = Math.random() * 6.28;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1));
    const dustMat = new THREE.ShaderMaterial({ ...additive, uniforms: { uTime: { value: 0 }, uScale: { value: 30 * px } }, vertexShader: dustVertex, fragmentShader: dustFragment });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;

    // Blade glow
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,245,235,1)'); gr.addColorStop(.18, 'rgba(255,150,120,.8)');
    gr.addColorStop(.5, 'rgba(255,90,60,.16)'); gr.addColorStop(1, 'rgba(255,80,50,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    const blade = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    blade.scale.setScalar(.8);

    // Trail
    const trail = buildTrail();
    const trailMat = new THREE.ShaderMaterial({ ...additive, side: THREE.DoubleSide, uniforms: { uHead: { value: 0 }, uFogBase: { value: 9 } }, vertexShader: trailVertex, fragmentShader: trailFragment });
    const trailMesh = new THREE.Mesh(trail.geo, trailMat);
    trailMesh.frustumCulled = false;

    // Station rings light up as the blade reaches each company
    const ringGeo = new THREE.RingGeometry(1.5, 1.54, 64).rotateX(-Math.PI / 2);
    const rings = STATIONS.map(([rx, rz]) => {
      const mesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xbfe0ff, ...additive, opacity: .1 }));
      mesh.position.set(rx, .03, rz);
      return mesh;
    });

    // Ice blades
    const shardGeo = new THREE.ConeGeometry(1, 1, 5, 1).toNonIndexed();
    shardGeo.computeVertexNormals();
    const n = projects.length;
    const shards = projects.map((_, i) => {
      const f = n > 1 ? i / (n - 1) * 2 - 1 : 0;
      const h = 2.8 + ((i * 37) % 11) / 11 * 2.2;
      const mat = new THREE.ShaderMaterial({ ...additive, side: THREE.DoubleSide, uniforms: { uCrack: { value: 0 }, uDim: { value: 1 } }, vertexShader: shardVertex, fragmentShader: shardFragment });
      const mesh = new THREE.Mesh(shardGeo, mat);
      const px2 = f * 10.5, pz = SHARD_Z - Math.abs(f) * -2.5 + Math.sin(i * 2.1) * .8;
      mesh.position.set(px2, h / 2, pz);
      mesh.scale.set(.62, h, .28);
      mesh.rotation.y = i * 1.3;
      mesh.rotation.z = Math.sin(i * 3.3) * .05;
      // Fake reflection: the same blade mirrored under the ice, which draws without depth
      const mirrorMat = mat.clone();
      mirrorMat.uniforms = { uCrack: mat.uniforms.uCrack, uDim: { value: .32 } };
      const mirror = new THREE.Mesh(shardGeo, mirrorMat);
      mirror.position.set(px2, -h / 2, pz);
      mirror.scale.set(.62, -h, .28);
      mirror.rotation.y = mesh.rotation.y;
      return { mesh, mirror, mat };
    });

    // Crystals
    const crystalMat = new THREE.ShaderMaterial({ ...additive, uniforms: { uForm: { value: 0 }, uTime: { value: 0 }, uScale: { value: 28 * px }, uActive: { value: 0 } }, vertexShader: crystalVertex, fragmentShader: crystalFragment });
    const crystals = new THREE.Points(buildCrystals(small ? 260 : 560), crystalMat);
    crystals.frustumCulled = false;

    // Spiral
    const SP = small ? 500 : 1100;
    const spPos = new Float32Array(SP * 3), spU = new Float32Array(SP);
    for (let i = 0; i < SP; i++) {
      const u = i / SP, a = u * Math.PI * 2 * 7, r = (1 - u) * 3.4 + .25 + (Math.random() - .5) * .22;
      spPos.set([Math.cos(a) * r, u * 11 + (Math.random() - .5) * .15, Math.sin(a) * r], i * 3);
      spU[i] = u;
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    spGeo.setAttribute('aU', new THREE.BufferAttribute(spU, 1));
    const spMat = new THREE.ShaderMaterial({ ...additive, uniforms: { uReveal: { value: 0 }, uTime: { value: 0 }, uScale: { value: 30 * px } }, vertexShader: spiralVertex, fragmentShader: spiralFragment });
    const spiral = new THREE.Points(spGeo, spMat);
    spiral.position.copy(SPIRAL_C);
    spiral.frustumCulled = false;

    return { carver, iceMat, ice, P, MAX, chipGeo, chipMat, chips, spray, dustMat, dust, DUST, blade, trail, trailMat, trailMesh, rings, shards, crystalMat, crystals, spMat, spiral };
  }, [gl, small, reduced]);

  useEffect(() => {
    scene.background = new THREE.Color().setRGB(.072, .105, .157, THREE.LinearSRGBColorSpace);
    const items: THREE.Object3D[] = [w.ice, w.chips, w.blade, w.trailMesh, ...w.rings, w.crystals, w.spiral, ...w.shards.flatMap(s => [s.mesh, s.mirror])];
    if (w.DUST) items.push(w.dust);
    scene.add(...items);
    return () => { scene.remove(...items); };
  }, [scene, w]);

  // Layout follows the viewport
  const layout = useRef({ keys: [] as Key[], stacked: false, far: 1, target: 10 });
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const stacked = aspect < 1.05;
    const far = stacked ? Math.max(1.05, 1.02 / aspect) : Math.max(1, 1.5 / aspect);
    const cam = camera as THREE.PerspectiveCamera;
    const dist = Math.hypot(5.9 * far, 6.9 * far);
    const visible = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist * aspect;
    const scale = gl.getPixelRatio() * Math.min(size.height, 900) / 900;
    layout.current = {
      keys: buildKeys(aspect, stacked, far), stacked, far,
      // The headline carries the message, so the name stays quieter than the frame allows
      target: Math.min(stacked ? 5.2 : 7.7, visible * (stacked ? .66 : .5)),
    };
    w.chipMat.uniforms.uScale.value = 62 * scale * far;
    w.dustMat.uniforms.uScale.value = 42 * scale * far;
    w.crystalMat.uniforms.uScale.value = 86 * scale;
    w.spMat.uniforms.uScale.value = 46 * scale;
    w.iceMat.uniforms.uFogBase.value = 9 * far;
    w.trailMat.uniforms.uFogBase.value = 9 * far;
    w.blade.scale.setScalar(.8 * far);
  }, [size, camera, gl, w]);

  // Carving: the name follows the language, and is never replayed for someone further down the page
  const introT = useRef(0);
  const carve = (melt: boolean, instant: boolean) => {
    const seconds = small ? 4.6 : 5.6;
    if (!instant) introT.current = melt ? introT.current : 0;
    w.carver.carve(lang, layout.current.target, layout.current.stacked, { instant, melt, seconds });
    invalidate();
  };
  const started = useRef(false);
  useEffect(() => {
    w.carver.onDone = () => { onCarvedRef.current(); invalidate(); };
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-fa');
    const ready = document.fonts?.load
      ? Promise.race([document.fonts.load(`200 80px ${fam}`, 'شیما'), new Promise(r => setTimeout(r, 1500))])
      : Promise.resolve();
    let live = true;
    ready.finally(() => {
      if (!live) return;
      const first = !started.current;
      started.current = true;
      carve(!first, reduced || bus.stop > .6);
    });
    return () => { live = false; };
    // Replays when language or the screen's shape changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, w, size.width > size.height]);

  // Pointer leaves marks
  useEffect(() => {
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
    const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    let prev: [number, number] | null = null, prevT = 0;
    const onMove = (e: PointerEvent) => {
      parallax.current.tx = e.clientX / innerWidth - .5;
      parallax.current.ty = e.clientY / innerHeight - .5;
      if (bus.stop > .45) { prev = null; return; }
      ptr.set(parallax.current.tx * 2, -parallax.current.ty * 2);
      ray.setFromCamera(ptr, camera);
      if (!ray.ray.intersectPlane(floor, hit)) return;
      const pt: [number, number] = [hit.x, hit.z], now = performance.now();
      if (Math.abs(hit.x) < WX / 2 && Math.abs(hit.z) < WZ / 2) {
        if (prev && now - prevT < 120) {
          const dx = pt[0] - prev[0], dz = pt[1] - prev[1], d = Math.hypot(dx, dz);
          if (d > .004 && d < 3) {
            w.carver.mark(prev, pt);
            if (d > .05) w.spray(pt[0], pt[1], dx * 26, dz * 26, Math.min(4, 1 + Math.floor(d * 7)));
          }
        }
        prev = pt; prevT = now;
      } else prev = null;
      bus.wake();
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, [camera, w]);

  const parallax = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const smoothStop = useRef(bus.stop);
  const replaySeen = useRef(bus.replayRequest);
  const adapt = useRef({ t: 0, n: 0, dpr: gl.getPixelRatio() });
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);
  const bladePos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, .05), t = state.clock.elapsedTime;
    const { keys } = layout.current;
    if (!keys.length) return;

    if (bus.replayRequest !== replaySeen.current) {
      replaySeen.current = bus.replayRequest;
      introT.current = 0;
      carve(true, reduced);
    }
    w.carver.update(dt);

    // Scroll: the camera eases along the rink, pausing at each stop
    smoothStop.current = reduced ? bus.stop : smoothStop.current + (bus.stop - smoothStop.current) * Math.min(1, dt * 4.5);
    const s = Math.min(STOPS - 1, Math.max(0, smoothStop.current));
    const i = Math.min(STOPS - 2, Math.floor(s)), f = smooth(s - i);
    tmpPos.lerpVectors(keys[i].pos, keys[i + 1].pos, f);
    tmpLook.lerpVectors(keys[i].look, keys[i + 1].look, f);

    // The opening: a low skater's-eye glide settling into the reading angle
    introT.current = Math.min(1, introT.current + dt / 3.4);
    const k = reduced ? 1 : 1 - Math.pow(1 - introT.current, 3);
    const heroWeight = 1 - band(0, 1, s);
    tmpPos.y *= 1 - heroWeight * .38 * (1 - k);
    tmpPos.z += heroWeight * keys[0].pos.z * .16 * (1 - k);

    const pr = parallax.current;
    pr.x += (pr.tx - pr.x) * Math.min(1, dt * 2.4);
    pr.y += (pr.ty - pr.y) * Math.min(1, dt * 2.4);
    if (!reduced) {
      tmpPos.x += pr.x * .9 + Math.sin(t * .13) * .16;
      tmpPos.y -= pr.y * .4;
    }
    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);

    // Ice and dust follow the camera; the surface itself stays in world space
    w.ice.position.z = tmpPos.z - 40;
    w.dust.position.z = tmpPos.z - 6;

    // Blade: carving the name, otherwise at the head of the scroll-driven line
    const stops = w.trail.stops;
    const j = Math.min(stops.length - 2, Math.floor(s));
    const head = stops[j] + (stops[j + 1] - stops[j]) * (s - j);
    w.trailMat.uniforms.uHead.value = head;
    let on: number;
    if (w.carver.carving) {
      bladePos.set(w.carver.bladeX, .05 + w.carver.hopping * .32, w.carver.bladeZ);
      on = 1;
    } else {
      w.trail.curve.getPoint(head, bladePos);
      bladePos.y = .06;
      on = band(.04, .22, s);
    }
    w.blade.position.copy(bladePos);
    w.blade.material.opacity += (on - w.blade.material.opacity) * Math.min(1, dt * 6);
    w.iceMat.uniforms.uBlade.value.copy(bladePos);
    w.iceMat.uniforms.uBladeOn.value = w.blade.material.opacity;
    w.iceMat.uniforms.uTime.value = t;
    w.dustMat.uniforms.uTime.value = t;

    // Stations
    w.rings.forEach((ring, idx) => {
      const near = 1 - clamp01(Math.abs(s - (idx + 2)) * 1.4);
      const m = ring.material as THREE.MeshBasicMaterial;
      m.opacity = .08 + near * .9;
      m.color.setRGB(.75 + near * .25, .88 - near * .4, 1 - near * .68);
      const grow = 1 + near * .28 + (reduced ? 0 : Math.sin(t * 2.4 + idx) * .02 * near);
      ring.scale.set(grow, 1, grow);
    });

    // Each scene's objects only exist once the camera is close, for both looks and speed
    w.crystals.visible = s > 6.4;
    w.spiral.visible = s > 7.4;

    // Blades crack on hover
    w.shards.forEach(({ mat, mesh, mirror }, idx) => {
      mesh.visible = mirror.visible = s > 5.6 && s < 8.2;
      const want = bus.project === idx ? 1 : 0;
      const u = mat.uniforms.uCrack;
      u.value += (want - u.value) * Math.min(1, dt * (want ? 5 : 2));
    });

    w.crystalMat.uniforms.uForm.value = band(7.15, 7.95, s);
    w.crystalMat.uniforms.uActive.value += (bus.skill - w.crystalMat.uniforms.uActive.value) * (reduced ? 1 : Math.min(1, dt * 7));
    w.crystalMat.uniforms.uTime.value = reduced ? 0 : t;
    w.spMat.uniforms.uReveal.value = band(8.2, 9, s) * 1.06;
    w.spMat.uniforms.uTime.value = reduced ? 0 : t;

    // Chips
    const { P, MAX } = w;
    for (let n = 0; n < MAX; n++) {
      if (P.life[n] <= 0) continue;
      P.life[n] -= dt * 1.15;
      P.vel[n * 3 + 1] -= 3.6 * dt;
      P.pos[n * 3] += P.vel[n * 3] * dt;
      P.pos[n * 3 + 1] = Math.max(.01, P.pos[n * 3 + 1] + P.vel[n * 3 + 1] * dt);
      P.pos[n * 3 + 2] += P.vel[n * 3 + 2] * dt;
    }
    w.chipGeo.attributes.position.needsUpdate = true;
    w.chipGeo.attributes.aLife.needsUpdate = true;
    w.chipGeo.attributes.aHot.needsUpdate = true;
    // Spray along the moving trail head while scrolling
    if (!w.carver.carving && !reduced && Math.abs(bus.stop - smoothStop.current) > .01 && Math.random() < .5) {
      w.spray(bladePos.x, bladePos.z, (bus.stop - smoothStop.current) * 4, 0, 1);
    }

    // Keep frames smooth on slower machines by trading resolution
    if (!reduced && document.visibilityState === 'visible') {
      const a = adapt.current;
      a.t += rawDt; a.n++;
      if (a.t > 2.5) {
        const fps = a.n / a.t;
        if (fps < 42 && a.dpr > .8) {
          a.dpr = Math.max(.8, a.dpr * .82);
          setDpr(a.dpr);
        }
        a.t = 0; a.n = 0;
      }
    }

    // On-demand mode (reduced motion): settle, then stop drawing
    if (reduced && (w.carver.carving || Math.abs(bus.stop - smoothStop.current) > .001)) invalidate();
  });

  return null;
}

export default function IceScene({ lang, onCarved }: { lang: Lang; onCarved: () => void }) {
  const reduced = useMemo(prefersReducedMotion, []);
  const small = useMemo(() => Math.min(innerWidth, innerHeight) < 640, []);
  useEffect(() => {
    bus.wake = () => invalidate();
    return () => { bus.wake = () => {}; };
  }, []);
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        flat
        linear
        frameloop={reduced ? 'demand' : 'always'}
        dpr={[1, small ? 1.5 : 1.75]}
        camera={{ fov: 38, near: .1, far: 400, position: [0, 6, 7] }}
        gl={{ antialias: !small, powerPreference: 'high-performance', alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <World lang={lang} onCarved={onCarved} small={small} reduced={reduced} />
      </Canvas>
    </div>
  );
}
