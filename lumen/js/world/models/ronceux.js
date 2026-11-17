/* =========================================================
   LUMEN — Ronceux : buisson de ronces animé, immobile et territorial (Île de l'Aube).
   « Il fouette tout ce qui passe à sa portée. »
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Hauteur ≈ 1,1 m, rayon de jeu 0,6 m.
   Quatre lianes-fouets de trois segments (Vine<i>_A/B/C) montées sur un pivot (Whirl) qui tourne
   pendant le fouet circulaire ; fleur au sommet (Stalk > Flower > Petal1..6) qui s'ouvre à l'annonce.
   ========================================================= */
import { THREE, V, T, prism, gem, loft, disc, slab, part, place, materials, stickOn, lighten, darken, keyed, add, blend, ease, clamp01, creatureView } from '../kit3d.js';

const PALETTE = { body: '#2C5A36', bodyLight: '#3F7C46', leaf: '#3F8C3C', leafLight: '#72B84C', leaf2: '#2F7048', leaf2Light: '#52A060', vine: '#4F7A3A', vineLight: '#86B054',
  bark: '#5A4A3A', barkLight: '#806A52', thorn: '#E4D4A8', thornLight: '#FFF6D8', petal: '#E8607F', petalLight: '#F6A0B8', core: '#FFD25A', berry: '#C42E4C', berryLight: '#F2687E',
  eye: '#FFFFFF', pupil: '#1B1238', mouth: '#12261A', angry: '#FF5A6A', sting: '#FF9A4A', star: '#FFE48A' };

/* géométrie de référence */
const VTH = [45, 135, -135, -45];            // azimut des lianes (0 = devant, 90 = +X) : les diagonales, le visage reste dégagé
const VR = 0.31, VY = 0.61;                  // épaule des lianes
const LA = 0.36, LB = 0.32;                  // longueur des segments A et B (C : 0,37 avec le dard)
const CUM0 = [25, 85, 150];                  // repos : angle cumulé de chaque segment par rapport à la verticale (vers l'extérieur)
const NP = 6, OPEN0 = 38, PR = 0.078;         // pétales
const sd = (a) => Math.sin(a * Math.PI / 180), cd = (a) => Math.cos(a * Math.PI / 180);

const REST = {
  Root: { p: [0, 0, 0], r: [0, 0, 0] },
  Body: { p: [0, 0, 0], r: [0, 0, 0] },
  Eyes: { p: [0, 0, 0], r: [0, 0, 0] }, Eyes_Angry: { p: [0, 0, 0], r: [0, 0, 0], s: 0.001 }, Brows_Angry: { p: [0, 0, 0], r: [0, 0, 0], s: 0.001 }, Lids: { p: [0, 0, 0], r: [0, 0, 0], s: 0.001 },
  Stalk: { p: [0, 0.7, 0], r: [0, 0, 0] },
  Flower: { p: [0, 0.24, 0], r: [0, 0, 0] },
};
for (let k = 1; k <= NP; k++) { const th = (k - 1) * 60 + 30; REST['Petal' + k] = { p: [PR * sd(th), 0.03, PR * cd(th)], r: [0, th - 90, -OPEN0] }; }
REST.Whirl = { p: [0, 0, 0], r: [0, 0, 0] };
VTH.forEach((th, i) => { const n = 'Vine' + (i + 1);
  REST[n + '_A'] = { p: [VR * sd(th), VY, VR * cd(th)], r: [0, th - 90, -CUM0[0]] };
  REST[n + '_B'] = { p: [0, LA, 0], r: [0, 0, -(CUM0[1] - CUM0[0])] };
  REST[n + '_C'] = { p: [0, LB, 0], r: [0, 0, -(CUM0[2] - CUM0[1])] };
  REST['Sting' + (i + 1)] = { p: [0, 0, 0], r: [0, 0, 0], s: 0.001 }; });
REST.Stun_Stars = { p: [0, 1.4, 0], r: [0, 0, 0], s: 0.001 };
const JOINTS = Object.keys(REST);

function build(pal = PALETTE) {
  const P = pal, M = materials('M_Ronceux'), nodes = {};
  const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
  const root = new THREE.Object3D(); root.name = 'Root'; nodes.Root = root;
  /* pose une forme d'axe Y (base à l'origine) : azimut th, inclinaison vers l'extérieur tilt, à (r, y) */
  const out = (g, th, y, r, tilt, roll = 0) => { if (roll) T(g, 0, 0, 0, 0, roll, 0); return T(g, r * sd(th), y, r * cd(th), 0, th - 90, -tilt); };

  /* ----- Corps : souche brune, cœur de buisson facetté vert sombre, racines, feuilles, épines, baies ----- */
  const mound = loft([{ y: 0.08, rx: 0.43, rz: 0.43 }, { y: 0.17, rx: 0.52, rz: 0.52 }, { y: 0.3, rx: 0.52, rz: 0.52 }, { y: 0.54, rx: 0.42, rz: 0.42 }, { y: 0.65, rx: 0.29, rz: 0.29 }, { y: 0.73, rx: 0.12, rz: 0.12 }], 8, { n: 2.8 });
  const stump = loft([{ y: 0, rx: 0.4, rz: 0.4 }, { y: 0.07, rx: 0.48, rz: 0.48 }, { y: 0.15, rx: 0.44, rz: 0.44 }], 7, { phase: 0.2 });
  const solid = [mound, stump], pieces = [[mound, P.body, P.bodyLight], [stump, P.bark, P.barkLight]];
  const put = (g, c, l) => { solid.push(g); pieces.push([g, c, l]); };
  /* racines qui rampent : deux petites devant (sous le visage), trois longues sur les côtés et derrière */
  [[23, 0.27, 1], [-23, 0.27, -1], [96, 0.52, -1], [184, 0.44, 1], [268, 0.5, -1]].forEach(([th, len, w]) =>
    put(out(loft([{ y: 0, rx: 0.075, rz: 0.085 }, { y: len * 0.5, rx: 0.05, rz: 0.058, cz: 0.05 * w }, { y: len, rx: 0.012, rz: 0.014, cz: -0.03 * w }], 5), th, 0.092, 0.36, 90), P.bark, P.barkLight));
  /* feuilles anguleuses (losanges facettés, à plat sur le rayon) ; les diagonales des lianes restent libres */
  const leaf = (th, y, r, tilt, len, roll, alt) => put(out(T(gem(1), 0, len * 0.72, 0, 0, 0, 0, 0.022, len, len * 0.42), th, y, r, tilt, roll), alt ? P.leaf2 : P.leaf, alt ? P.leaf2Light : P.leafLight);
  [[72, 0.2, 0.44, 66, 0.2, 14, 0], [-72, 0.2, 0.44, 66, 0.2, -14, 0], [108, 0.21, 0.44, 64, 0.21, -12, 1], [-108, 0.21, 0.44, 64, 0.21, 12, 1], [172, 0.2, 0.44, 66, 0.21, 10, 0], [-162, 0.24, 0.44, 60, 0.18, -16, 1],
    [90, 0.36, 0.42, 52, 0.19, 8, 1], [-90, 0.36, 0.42, 52, 0.19, -8, 1], [160, 0.37, 0.42, 50, 0.19, -10, 0], [-175, 0.4, 0.4, 46, 0.17, 12, 1],
    [66, 0.46, 0.38, 58, 0.14, 20, 0], [-66, 0.46, 0.38, 58, 0.14, -20, 0], [114, 0.47, 0.38, 56, 0.14, -18, 0], [-114, 0.47, 0.38, 56, 0.14, 18, 0]].forEach((a) => leaf(...a));
  /* épines du buisson */
  [[21, 0.515, 0.39, 72, 0.12], [-21, 0.515, 0.39, 72, 0.12], [90, 0.5, 0.39, 74, 0.1], [-90, 0.5, 0.39, 74, 0.1], [180, 0.5, 0.39, 72, 0.11], [52, 0.3, 0.5, 80, 0.1], [-52, 0.3, 0.5, 80, 0.1], [132, 0.3, 0.52, 84, 0.09], [-132, 0.3, 0.52, 84, 0.09]]
    .forEach(([th, y, r, tilt, h]) => put(out(T(prism(0.004, 0.03, h, 4), 0, h / 2, 0), th, y, r, tilt), P.thorn, P.thornLight));
  /* baies rouges en grappes (accent) */
  [[36, 0.2, 0.535], [-36, 0.2, 0.535], [148, 0.42, 0.455]].forEach(([th, y, r]) => [[0, 0, 0.055], [9, 0.07, 0.042], [-8, 0.06, 0.038]].forEach(([dt, dy, s]) =>
    put(T(gem(1), (r - dy * 0.25) * sd(th + dt), y + dy, (r - dy * 0.25) * cd(th + dt), 0, th + dt * 3, 0, s, s * 1.1, s), P.berry, P.berryLight)));
  /* visage : gros yeux, bouche en dents de scie */
  const on = (g, x, y, off, spin) => stickOn(mound, g, V(x, y, 2), V(0, 0, -1), off, spin);
  const eyes = [];
  [-1, 1].forEach((s) => {
    eyes.push([on(disc(0.098, 0.114, 8, Math.PI / 8), s * 0.132, 0.42, 0.004), P.eye, P.eye]);
    eyes.push([on(disc(0.052, 0.068, 8, Math.PI / 8), s * 0.12, 0.41, 0.007), P.pupil, P.pupil]);
    eyes.push([on(disc(0.019, 0.019, 6), s * 0.12 - 0.018, 0.445, 0.01), P.eye, P.eye]);
  });
  pieces.push([on(slab([[-0.085, 0.022], [-0.05, 0.0], [-0.025, 0.02], [0, 0.0], [0.025, 0.02], [0.05, 0.0], [0.085, 0.022], [0.06, -0.022], [0.03, -0.004], [0, -0.026], [-0.03, -0.004], [-0.06, -0.022]], 0.004), 0, 0.235, 0.004), P.mouth, P.mouth]);
  const body = mk('Body', pieces, { solid });
  root.add(body);
  /* les yeux sont une pièce à part pour pouvoir les fermer (échelle 0,001 : ils rentrent dans le buisson) */
  body.add(mk('Eyes', eyes, { mat: M.glow('Eyes'), outline: false }));

  /* regard en colère (annonce) : pupilles rouges lumineuses et sourcils froncés, cachés au repos */
  const angry = [], brows = [];
  [-1, 1].forEach((s) => { angry.push([on(disc(0.056, 0.072, 8, Math.PI / 8), s * 0.12, 0.41, 0.012), P.angry, P.angry]);
    brows.push([on(slab([[-0.1, -0.012], [0.1, 0.05], [0.1, 0.1], [-0.1, 0.03]].map(([x, y]) => [x * -s, y]), 0.004), s * 0.132, 0.475, 0.014), P.mouth, P.mouth]); });
  body.add(mk('Eyes_Angry', angry, { mat: M.glow('Angry', P.angry, 0.8), outline: false }));
  body.add(mk('Brows_Angry', brows, { outline: false }));
  /* yeux fermés (coup reçu, mort) : un trait sombre courbé ; cachés au repos */
  const lids = [];
  [-1, 1].forEach((s) => { lids.push([on(slab([[-0.085, 0.012], [-0.04, -0.012], [0.04, -0.012], [0.085, 0.012], [0.085, -0.016], [0.04, -0.04], [-0.04, -0.04], [-0.085, -0.016]], 0.004), s * 0.132, 0.4, 0.006), P.mouth, P.mouth]); });
  body.add(mk('Lids', lids, { outline: false }));

  /* ----- fleur : tige, cœur, six pétales articulés ----- */
  const stalk = mk('Stalk', [[loft([{ y: -0.03, rx: 0.05, rz: 0.05 }, { y: 0.08, rx: 0.04, rz: 0.04 }, { y: 0.23, rx: 0.05, rz: 0.05 }], 5), P.vine, P.vineLight]]);
  body.add(stalk);
  const flower = mk('Flower', [[loft([{ y: -0.035, rx: 0.05, rz: 0.05 }, { y: 0.01, rx: 0.108, rz: 0.108 }, { y: 0.06, rx: 0.085, rz: 0.085 }, { y: 0.1, rx: 0.025, rz: 0.025 }], 6, { phase: 0 }), P.core, lighten(P.core, 0.45)]]);
  stalk.add(flower);
  for (let k = 1; k <= NP; k++) flower.add(mk('Petal' + k, [[T(gem(1), 0, 0.145, 0, 0, 0, 0, 0.018, 0.145, 0.064), k % 2 ? P.petal : lighten(P.petal, 0.18), P.petalLight]], { offset: 0.011 }));

  /* ----- lianes-fouets : trois segments épineux, dard au bout ----- */
  const whirl = new THREE.Object3D(); whirl.name = 'Whirl'; nodes.Whirl = whirl; body.add(place(whirl, REST.Whirl));
  const thorn = (y, side, h = 0.085) => (side === 0 ? T(prism(0.003, 0.02, h, 4), -0.045 - h * 0.4, y, 0, 0, 0, 78) : T(prism(0.003, 0.02, h, 4), 0, y, side * (0.04 + h * 0.4), side * 78, 0, 0));
  const glowS = M.glow('Sting', P.sting, 0.9);
  const dart = (k = 1) => { const g = [T(prism(0.003, 0.036, 0.15, 4), 0, 0.3, 0), T(prism(0.003, 0.02, 0.085, 4), -0.03, 0.245, 0, 0, 0, 128), T(prism(0.003, 0.02, 0.085, 4), 0.03, 0.245, 0, 0, 0, -128)];
    return k === 1 ? g : g.map((x) => T(T(x, 0, -0.28, 0), 0, 0.28, 0, 0, 0, 0, k, k, k)); };
  VTH.forEach((th, i) => { const n = 'Vine' + (i + 1), tc = [P.thorn, P.thornLight];
    const a = mk(n + '_A', [[loft([{ y: -0.05, rx: 0.062, rz: 0.062 }, { y: 0, rx: 0.076, rz: 0.076 }, { y: LA, rx: 0.058, rz: 0.058 }], 5), P.vine, P.vineLight], [thorn(0.15, 0), ...tc], [thorn(0.26, i % 2 ? 1 : -1), ...tc]]);
    const b = mk(n + '_B', [[loft([{ y: 0, rx: 0.058, rz: 0.058 }, { y: LB, rx: 0.046, rz: 0.046 }], 5), P.vine, P.vineLight], [T(gem(1), 0, 0, 0, 0, 36, 0, 0.072, 0.072, 0.072), darken(P.vine, 0.12), P.vine], [thorn(0.13, i % 2 ? -1 : 1), ...tc], [thorn(0.23, 0), ...tc]]);
    const c = mk(n + '_C', [[loft([{ y: 0, rx: 0.046, rz: 0.046 }, { y: 0.19, rx: 0.034, rz: 0.034 }, { y: 0.245, rx: 0.02, rz: 0.02 }], 5), P.vine, P.vineLight], [T(gem(1), 0, 0, 0, 0, 36, 0, 0.058, 0.058, 0.058), darken(P.vine, 0.12), P.vine], [thorn(0.11, 0, 0.075), ...tc], ...dart().map((g) => [g, ...tc])]);
    whirl.add(a); a.add(b); b.add(c);
    c.add(mk('Sting' + (i + 1), dart(1.22).map((g) => [g, P.sting, '#FFE0A0']), { mat: glowS, outline: false })); });

  /* étoiles d'étourdissement, cachées au repos */
  const stars = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return [T(gem(1), Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38, 0, -a * 180 / Math.PI, 0, 0.075, 0.075, 0.032), P.star, '#FFFFFF']; });
  body.add(mk('Stun_Stars', stars, { mat: M.glow('Stars', P.star, 0.7), outline: false }));
  return { root, nodes, materials: M };
}

/* ---------- animations (écarts par rapport au repos) ---------- */
const sin = Math.sin, PI = Math.PI;
const squash = (k) => [1 + k * 0.5, 1 - k, 1 + k * 0.5];   // k > 0 : écrasé, k < 0 : étiré
/* lianes : f(i) → { c: [a, b, c] angles cumulés (0 = dressé, 90 = à l'horizontale vers l'extérieur), l: [écart d'azimut de A, dévers de B, dévers de C], s: allongement } */
function vines(o, f) {
  VTH.forEach((_, i) => { const n = 'Vine' + (i + 1), v = f(i), c = v.c, l = v.l || [0, 0, 0];
    add(o, n + '_A', { r: [0, l[0], -(c[0] - CUM0[0])], s: v.s ?? 1 });
    add(o, n + '_B', { r: [l[1], 0, -((c[1] - c[0]) - (CUM0[1] - CUM0[0]))] });
    add(o, n + '_C', { r: [l[2], 0, -((c[2] - c[1]) - (CUM0[2] - CUM0[1]))] });
    if (v.g) add(o, 'Sting' + (i + 1), { s: v.g }); });
  return o;
}
const petals = (o, open, f) => { for (let k = 1; k <= NP; k++) add(o, 'Petal' + k, { r: [0, 0, -(open + (f ? f(k) : 0) - OPEN0)] }); return o; };
const shut = (o, on) => { if (on) { add(o, 'Lids', { s: 1000 }); add(o, 'Eyes', { s: 0.001 }); } return o; };
const mix3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const WIND = { c: [20, 4, -26], s: 1.12 }, FLAT = { c: [66, 90, 97], s: 1.4 }, LIMP = [56, 118, 150];

function windup(t) { const k = ease(clamp01(t / 0.5)), q = sin(t * 60) * k * (1 - k * 0.6), o = {};
  add(o, 'Body', { s: squash(-0.07 * k + 0.012 * q) });
  add(o, 'Eyes_Angry', { s: 1 + 999 * clamp01(k * 3) }); add(o, 'Brows_Angry', { s: 1 + 999 * clamp01(k * 3) });
  add(o, 'Stalk', { r: [5 * k, 0, 0] }); add(o, 'Flower', { p: [0, 0.04 * k, 0], r: [0, 120 * k * k, 0] });
  petals(o, OPEN0 + 28 * k);
  return vines(o, (i) => ({ c: mix3(CUM0, WIND.c, k), l: [3 * q * (i % 2 ? 1 : -1), 4 * q, 6 * q], s: 1 + (WIND.s - 1) * k, g: 1 + 999 * clamp01(k * 2.5) })); }

const ANIMS = {
  IDLE: { dur: 3, loop: true, f: (t) => { const w = 2 * PI * t / 3, o = {};
    add(o, 'Body', { s: squash(0.03 * sin(2 * w)) });
    add(o, 'Stalk', { r: [5 * sin(w + 0.5), 0, 5 * sin(w)] }); add(o, 'Flower', { p: [0, 0.012 * sin(2 * w), 0], r: [0, 40 * t, 0] });
    petals(o, OPEN0 + 5 + 5 * sin(2 * w));
    return vines(o, (i) => { const p = w + i * 1.7; return { c: [25 + 4 * sin(p), 85 + 8 * sin(p - 0.7), 150 + 13 * sin(p - 1.4)], l: [4 * sin(w + i * 2.3), 0, 5 * sin(2 * w + i)] }; }); } },
  WINDUP: { dur: 0.5, loop: false, f: windup },
  ATTACK: { dur: 0.45, loop: false, f: (t) => { const g = 1000, A = 'Eyes_Angry', B = 'Brows_Angry';
    const vk = keyed([{ t: 0, pose: { v: { r: WIND.c, p: [0, 0, 0], s: WIND.s } } }, { t: 0.13, pose: { v: { r: FLAT.c, p: [0, -26, -34], s: FLAT.s } } }, { t: 0.27, pose: { v: { r: [60, 94, 116], p: [0, -12, -18], s: 1.25 } } }, { t: 0.45, pose: { v: { r: CUM0, p: [0, 0, 0], s: 1 } } }])(t).v;
    const o = keyed([
      { t: 0, pose: Object.assign(windup(0.5), {}) },
      { t: 0.13, pose: petals({ Body: { s: squash(0.12) }, [A]: { s: g }, [B]: { s: g }, Flower: { p: [0, 0.02, 0], r: [0, 200, 0] } }, 82) },
      { t: 0.27, pose: petals({ Body: { s: squash(-0.04) }, [A]: { s: g }, [B]: { s: g }, Flower: { r: [0, 300, 0] } }, 62) },
      { t: 0.45, pose: { Flower: { r: [0, 360, 0] } } }])(t);
    VTH.forEach((_, i) => ['_A', '_B', '_C'].forEach((x) => delete o['Vine' + (i + 1) + x]));
    VTH.forEach((_, i) => { o['Sting' + (i + 1)] = { r: [0, 0, 0], p: [0, 0, 0], s: t < 0.3 ? g : 1 + (g - 1) * Math.pow(clamp01((0.45 - t) / 0.15), 3) }; });
    add(o, 'Whirl', { r: [0, 360 * ease(clamp01(t / 0.45)), 0] });
    return vines(o, () => ({ c: vk.r, l: vk.p, s: vk.s })); } },
  HURT: { dur: 0.3, loop: false, f: (t) => { const k = keyed([{ t: 0, pose: { v: { p: [0, 0, 0] } } }, { t: 0.07, pose: { v: { p: [1, 0, 0] } } }, { t: 0.3, pose: { v: { p: [0, 0, 0] } } }])(t).v.p[0], o = {};
    add(o, 'Body', { s: squash(0.16 * k) }); shut(o, k > 0.15);
    add(o, 'Stalk', { r: [-16 * k, 0, 6 * k] }); petals(o, OPEN0 + 16 * k);
    return vines(o, (i) => ({ c: [25 + 8 * k, 85 - 26 * k, 150 - 48 * k], l: [(i % 2 ? 8 : -8) * k, 0, 0] })); } },
  STUN: { dur: 1.2, loop: true, f: (t) => { const w = 2 * PI * t / 1.2, o = {};
    add(o, 'Body', { s: squash(0.06 + 0.025 * sin(2 * w)) });
    add(o, 'Stalk', { r: [24 * sin(w), 0, 24 * Math.cos(w)] }); petals(o, 62);
    add(o, 'Stun_Stars', { s: 1000, r: [0, 300 * t, 0] });
    return vines(o, (i) => { const p = w + i * 1.3; return { c: [LIMP[0] + 3 * sin(p), LIMP[1] + 6 * sin(p - 0.8), LIMP[2] + 9 * sin(p - 1.6)], l: [5 * sin(w + i * 2), 0, 0] }; }); } },
  DEATH: { dur: 0.6, loop: false, f: (t) => { const a = ease(clamp01(t / 0.24)), f = ease(clamp01((t - 0.1) / 0.26)), b = ease(clamp01((t - 0.24) / 0.36)), o = {}, sq = squash(0.34 * ease(clamp01(t / 0.4))), u = 1 - 0.86 * b;
    add(o, 'Body', { s: sq.map((v) => v * u) }); shut(o, t > 0.05);
    add(o, 'Stalk', { r: [20 * f, 0, 6 * f] }); petals(o, OPEN0 + 68 * f, (k) => 6 * sin(k * 2.1) * f);
    return vines(o, (i) => ({ c: mix3(CUM0, [70 + (i % 2) * 3, 160, 146], a), l: [(i % 2 ? 5 : -5) * a, 0, 0] })); } },
};
const LABELS = { IDLE: 'Attente', WINDUP: 'Annonce du coup', ATTACK: 'Fouet circulaire', HURT: 'Coup reçu', STUN: 'Étourdi', DEATH: 'Il se fane' };
const MOVES = { WINDUP: { signal: 'les quatre lianes se dressent et tremblent, les dards rougeoient, la fleur s’ouvre, le regard vire au rouge' }, ATTACK: { frappe_s: 0.15, portee_m: 3.0, zone: 'tout autour de lui (fouet circulaire)' } };

export const model = { id: 'ronceux', file: 'Ronceux', name: 'Ronceux', subtitle: 'créature de l’Île de l’Aube', PALETTE, REST, JOINTS, build, ANIMS, LABELS, MOVES, ignore: [] };

/* ---------- vue de jeu : contrat de js/world/creatures.js ---------- */
export function createView() {
  let spin = Math.random() * 360;
  return creatureView(model, (s, a) => {
    if (s.dead) { const d = a.at('DEATH', s.dead); d.Flower = { r: [0, spin, 0], p: [0, 0, 0], s: 1 }; return d; }
    const wind = s.wind || 0;
    let pose = s.stun ? a.loop('STUN') : a.loop('IDLE');
    if (wind) pose = blend(pose, a.at('WINDUP', wind), Math.min(1, wind * 3));
    /* fin du fouet fondue dans l'attente ; le pivot n'est pas fondu (360° = 0°, sinon il repartirait en arrière) */
    if (s.attack) { const atk = a.at('ATTACK', s.attack); pose = blend(pose, atk, clamp01((1 - s.attack) * 5)); pose.Whirl = atk.Whirl; }
    if (s.hurt && !s.attack) { const h = a.at('HURT', 1 - s.hurt); Object.keys(h).forEach((j) => add(pose, j, h[j])); }
    /* la fleur tourne en continu, plus vite pendant l'annonce et le coup (comme l'ancien bulbe) */
    spin = (spin + a.dt * (40 + 300 * wind + (s.attack ? 500 : 0))) % 360;
    pose.Flower = pose.Flower || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; pose.Flower.r = [pose.Flower.r[0], spin, pose.Flower.r[2]];
    return pose;
  }, { mat: (nodes) => { const m = nodes.Body.material; m.emissive = new THREE.Color('#7A1A3A'); m.emissiveIntensity = 0.45; return m; } });
}
