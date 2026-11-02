import { WX, WZ } from './carver';

export const iceVertex = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

export const iceFragment = /* glsl */ `
  precision highp float;
  varying vec3 vW;
  uniform sampler2D uT;
  uniform float uTime, uBladeOn, uFogBase;
  uniform vec3 uBlade;
  uniform vec2 uPx;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = .5, s = 0.;
    for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 11.7; a *= .5; }
    return s;
  }
  float crack(vec2 p) {
    vec2 w = p + vec2(fbm(p * .7), fbm(p * .7 + 5.2)) * 2.4;
    return pow(1. - abs(noise(w * 1.1) * 2. - 1.), 34.);
  }
  vec3 env(vec3 p, vec3 R) {
    vec3 c = mix(vec3(.012, .03, .07), vec3(.05, .11, .22), clamp(R.y, 0., 1.));
    if (R.y < .02) return c;
    float t = (13. - p.y) / R.y;
    vec2 q = p.xz + R.xz * t;
    float strips = 0.;
    for (int i = 0; i < 5; i++) {
      float x = (float(i) - 2.) * 9.;
      float d = abs(q.x - x);
      strips += exp(-d * d * .55) * smoothstep(70., 12., abs(q.y - p.z + 16.));
    }
    vec2 sweep = vec2(sin(uTime * .22) * 16., p.z - 14. + cos(uTime * .17) * 10.);
    float spot = exp(-dot(q - sweep, q - sweep) * .018);
    return c + vec3(.5, .72, 1.) * strips * .6 + vec3(.75, .85, 1.) * spot * .55;
  }
  void main() {
    vec3 V = normalize(cameraPosition - vW);
    vec2 uv = vec2((vW.x + ${(WX / 2).toFixed(1)}) / ${WX.toFixed(1)}, 1. - (vW.z + ${(WZ / 2).toFixed(1)}) / ${WZ.toFixed(1)});
    float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);

    vec3 s = vec3(0.), soft = vec3(0.), wide = vec3(0.);
    vec2 grad = vec2(0.);
    // Sampled unconditionally: mip selection needs derivatives across the boundary
    s = texture2D(uT, uv).rgb * inside;
    soft = texture2D(uT, uv, 2.5).rgb * inside;
    wide = texture2D(uT, uv, 4.5).rgb * inside;
    // The per-frame fade leaves a 1-3/255 residue; keep it from tinting the ice
    soft = max(soft - .016, 0.);
    wide = max(wide - .016, 0.);

    // Groove relief from the carved channels
    vec2 e = uPx * 1.6;
    float hL = dot(texture2D(uT, uv - vec2(e.x, 0.)).rg, vec2(1., .75));
    float hR = dot(texture2D(uT, uv + vec2(e.x, 0.)).rg, vec2(1., .75));
    float hD = dot(texture2D(uT, uv - vec2(0., e.y)).rg, vec2(1., .75));
    float hU = dot(texture2D(uT, uv + vec2(0., e.y)).rg, vec2(1., .75));
    grad = vec2(hR - hL, hD - hU) * inside;

    // Surface: slow waves plus fine skate-worn scratches
    vec2 q = vW.xz;
    float ne = .04;
    float n0 = fbm(q * .55);
    vec2 wave = vec2(fbm(q * .55 + vec2(ne, 0.)) - n0, fbm(q * .55 + vec2(0., ne)) - n0) / ne;
    float sc = noise(vec2(q.x * 1.2 + q.y * .7, (q.y - q.x * .55) * 32.)) + noise(vec2((q.x + q.y * .8) * 26., q.y * 1.3));
    vec3 N = normalize(vec3(-wave.x * .035 + (sc - 1.) * .012 - grad.x * .9, 1., -wave.y * .035 + (sc - 1.) * .012 - grad.y * .9));

    vec3 R = reflect(-V, N);
    float fres = .04 + .96 * pow(1. - max(dot(N, V), 0.), 4.);

    // Depth: parallax into the ice, with trapped frost and hairline fractures
    vec2 deep = q - V.xz / max(V.y, .25) * .55;
    float frost = fbm(deep * .85);
    vec3 col = mix(vec3(.003, .009, .026), vec3(.011, .032, .07), smoothstep(.3, .75, frost));
    float patchy = smoothstep(.46, .62, fbm(q * .16 + 3.1));
    float c1 = crack(deep * .3), c2 = crack((q - V.xz / max(V.y, .25) * .22) * .62 + 9.);
    col += vec3(.16, .36, .62) * c1 * .1 * patchy + vec3(.5, .72, .95) * c2 * .05 * patchy;

    col += env(vW, R) * (fres * .42 + .012);

    // The cut line: bright, with an icy halo; marks fade with the G channel
    float cut = max(s.r - .015, 0.) + max(s.g - .03, 0.) * .65;
    col += vec3(.82, .93, 1.) * cut * .95;
    col += vec3(.22, .5, .95) * (soft.r + soft.g * .5) * .55;
    col += vec3(.13, .32, .72) * (wide.r + wide.g * .35) * .95;

    // Fresh cut still hot from the blade
    float hot = max(s.b - .03, 0.);
    col += vec3(1., .42, .3) * hot * 1.1 + vec3(1., .34, .22) * (soft.b * .75 + wide.b * 1.25);

    // Pool of light travelling with the blade
    float bd = length(vW.xz - uBlade.xz);
    col += vec3(1., .46, .34) * exp(-bd * bd * 1.5) * .34 * uBladeOn;

    // Distance falloff into the dark rink
    float dist = length(vW - cameraPosition);
    vec3 fog = pow(vec3(.072, .105, .157), vec3(2.2));
    fog = fog / (1. - fog * .55);
    col = mix(col, fog, smoothstep(uFogBase * 1.35, uFogBase * 4.2, dist));

    col = col / (1. + col * .55);
    gl_FragColor = vec4(pow(col, vec3(1. / 2.2)), 1.);
  }`;

// Sprite for ice chips and the rink's cold dust
export const chipVertex = /* glsl */ `
  attribute float aLife; attribute float aHot;
  varying float vL; varying float vH; uniform float uScale;
  void main() {
    vL = aLife; vH = aHot;
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    gl_PointSize = uScale * (.35 + aLife * .65) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
export const chipFragment = /* glsl */ `
  varying float vL; varying float vH;
  void main() {
    if (vL <= 0.) discard;
    float d = length(gl_PointCoord - .5);
    float a = smoothstep(.5, .05, d) * vL;
    gl_FragColor = vec4(mix(vec3(.75, .9, 1.), vec3(1., .55, .42), vH), a);
  }`;

export const dustVertex = /* glsl */ `
  attribute float aSeed; uniform float uTime, uScale; varying float vA;
  void main() {
    vec3 p = position;
    p.y = mod(p.y - uTime * (.06 + fract(aSeed) * .08), 7.);
    p.x += sin(uTime * .22 + aSeed) * .55;
    p.z += cos(uTime * .17 + aSeed * 2.) * .4;
    vA = (.25 + .75 * abs(sin(uTime * .5 + aSeed * 3.))) * smoothstep(0., .5, p.y);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_PointSize = uScale * (.45 + fract(aSeed * 3.) * .8) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
export const dustFragment = /* glsl */ `
  varying float vA;
  void main() {
    float a = smoothstep(.5, 0., length(gl_PointCoord - .5));
    gl_FragColor = vec4(.68, .84, 1., a * a * vA * .42);
  }`;

// The blade's continuous line across the whole rink
export const trailVertex = /* glsl */ `
  attribute float aU; varying float vU; varying float vS; attribute float aSide; varying float vF; uniform float uFogBase;
  void main() {
    vU = aU; vS = aSide;
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vF = 1. - smoothstep(uFogBase * 1.35, uFogBase * 3.6, -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
export const trailFragment = /* glsl */ `
  uniform float uHead; varying float vU; varying float vS; varying float vF;
  void main() {
    if (vU > uHead) discard;
    float behind = uHead - vU;
    float core = 1. - abs(vS);
    float heat = exp(-behind * 90.);
    vec3 cold = vec3(.72, .88, 1.) * .78;
    vec3 col = mix(cold, vec3(1., .46, .33) * 1.5, heat);
    gl_FragColor = vec4(col, core * core * vF);
  }`;

// Standing blades of ice in the projects scene
export const shardVertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main() {
    vP = position;
    vec4 w = modelMatrix * vec4(position, 1.);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = cameraPosition - w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
export const shardFragment = /* glsl */ `
  uniform float uCrack, uDim;
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3. - 2. * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    vec3 N = normalize(vN), V = normalize(vV);
    float fres = pow(1. - abs(dot(N, V)), 2.4);
    float veins = pow(1. - abs(noise(vP.xy * 2.6 + vP.z * 1.7 + noise(vP.xy * 1.2) * 2.) * 2. - 1.), 22.);
    vec3 col = vec3(.3, .52, .85) * (.035 + fres * .5);
    col += vec3(.85, .95, 1.) * veins * (.05 + uCrack * .95);
    col += vec3(1., .5, .38) * uCrack * .16;
    gl_FragColor = vec4(col * uDim, (.1 + fres * .5 + veins * uCrack) * uDim);
  }`;

// Particles gathering into six snow crystals
export const crystalVertex = /* glsl */ `
  attribute vec3 aStart; attribute vec3 aCenter; attribute float aIndex; attribute float aRand;
  uniform float uForm, uTime, uScale, uActive;
  varying float vA; varying float vOn;
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  void main() {
    float on = 1. - smoothstep(.0, .6, abs(aIndex - uActive));
    float f = clamp((uForm - aRand * .35) / .65, 0., 1.);
    f = f * f * (3. - 2. * f);
    vec3 local = position - aCenter;
    local.xz = rot(uTime * (.05 + on * .16) + aIndex) * local.xz;
    local *= 1. + on * .32;
    vec3 p = mix(aStart, aCenter + local, f);
    p.y += sin(uTime * .8 + aRand * 12.) * .03 + on * .35;
    vA = (.25 + f * .75) * (.55 + on * .45);
    vOn = on;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_PointSize = uScale * (.55 + aRand * .55) * (1. + on * .4) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
export const crystalFragment = /* glsl */ `
  varying float vA; varying float vOn;
  void main() {
    float a = smoothstep(.5, .08, length(gl_PointCoord - .5));
    gl_FragColor = vec4(mix(vec3(.66, .84, 1.), vec3(1., .6, .48), vOn), a * vA);
  }`;

// The final spiral of light
export const spiralVertex = /* glsl */ `
  attribute float aU; uniform float uReveal, uTime, uScale; varying float vA; varying float vU;
  void main() {
    vU = aU;
    float on = smoothstep(0., .05, uReveal - aU);
    vA = on * (.45 + .55 * abs(sin(uTime * 1.3 + aU * 90.)));
    vec3 p = position;
    float a = uTime * .35;
    float c = cos(a), s = sin(a);
    p.xz = mat2(c, -s, s, c) * p.xz;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_PointSize = uScale * (.7 + (1. - aU) * .6) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
export const spiralFragment = /* glsl */ `
  varying float vA; varying float vU;
  void main() {
    float a = smoothstep(.5, .05, length(gl_PointCoord - .5));
    gl_FragColor = vec4(mix(vec3(1., .5, .38), vec3(.72, .88, 1.), vU), a * vA);
  }`;
