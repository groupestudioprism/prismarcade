/* =========================================================
   LUMEN — Colosse de Brume : boss de l'Île de l'Aube. Amas de blocs de roche gris-violet qui flottent,
   reliés par de la brume lavande lumineuse, autour d'un cœur de cristal doré volé.
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Hauteur ≈ 4,9 m, envergure ≈ 5,6 m, cœur à Y = 3,0 m.
   Rayon de jeu 1,5 m. Tous les blocs de roche sont disjoints au repos : la brume (lumineuse, sans contour) les relie.
   ========================================================= */
import { THREE, V, T, prism, gem, loft, slab, part, place, materials, stickOn, keyed, add, blend, ease, clamp01, creatureView, D2R } from '../kit3d.js';

const PALETTE = { rock: '#6F6689', rockLight: '#A096BC', rockDark: '#544B6E', rockDarkLight: '#7D7399', cave: '#30284A', caveLight: '#463C66',
  crystal: '#8A63E6', crystalLight: '#C9B4FF', moss: '#5E9A58', mossLight: '#98CC6E', mist: '#B49EFF', mistLight: '#F0E9FF',
  heart: '#FFB92E', heartLight: '#FFF4BC', eye: '#F4EEFF', rage: '#FF62C8', rageLight: '#FFE6F7', fist: '#D6C4FF', star: '#FFE48A' };

const SIDES = [['L', 1], ['R', -1]];
const REST = {}, PARENT = {};
const J = (name, parent, p = [0, 0, 0], r = [0, 0, 0], s) => { REST[name] = s ? { p, r, s } : { p, r }; PARENT[name] = parent; };
J('Root', null);
J('Hips', 'Root', [0, 1.6, 0]);
J('Torso', 'Hips', [0, 0.5, 0]);
J('Mist_Waist', 'Torso');
J('Mist_Core', 'Torso', [0, 0.95, 0.25]);
J('Heart', 'Torso', [0, 0.9, 0.42]);
J('Heart_Rays', 'Heart', [0, 0, 0], [0, 0, 0], 0.001);
J('ChestL', 'Torso', [1.16, 0.95, 0.68]); J('ChestR', 'Torso', [-1.16, 0.95, 0.68]);
J('Head', 'Torso', [0, 1.78, 0.42]);
J('Mist_Neck', 'Head');
J('Eyes', 'Head'); J('Eyes_Rage', 'Head', [0, 0, 0], [0, 0, 0], 0.001);
J('Stun_Stars', 'Head', [0, 1.45, 0.1], [0, 0, 0], 0.001);
SIDES.forEach(([n, s]) => {
  J('Mist_Sh' + n, 'Torso', [s * 1.3, 1.42, 0]);
  J('Shoulder' + n, 'Torso', [s * 1.95, 1.45, 0], [0, 0, s * 5]);
  J('Arm' + n, 'Shoulder' + n, [s * 0.1, -0.5, 0]);
  J('Mist_Ar' + n, 'Arm' + n);
  J('ForeArm' + n, 'Arm' + n, [0, -0.8, 0], [-10, 0, 0]);
  J('Mist_El' + n, 'ForeArm' + n);
  J('Fist' + n, 'ForeArm' + n, [0, -1.22, 0], [10, 0, 0]);
  J('Mist_Wr' + n, 'Fist' + n);
  J('Fist_Glow' + n, 'Fist' + n, [0, -0.52, 0], [0, 0, 0], 0.001);
});
SIDES.forEach(([n, s]) => {
  J('Leg' + n, 'Hips', [s * 0.68, -0.45, 0]);
  J('Mist_Hip' + n, 'Leg' + n);
  J('Foot' + n, 'Leg' + n, [0, -0.7, 0]);
  J('Mist_An' + n, 'Foot' + n);
});
J('Shock', 'Root', [0, 0.02, 2.3], [0, 0, 0], 0.001);
const JOINTS = Object.keys(REST);
const MISTS = JOINTS.filter((j) => j.startsWith('Mist_'));

/* ---------- aides de forme propres au modèle ---------- */
function rng(seed) { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/* bloc de roche anguleux : anneaux empilés, décalés et déformés au hasard (graine fixe). Hauteur exacte h, centré. */
function rock(w, h, d, seed, o = {}) {
  const R = rng(seed), j = o.j ?? 0.07, prof = o.prof || [[-0.5, 0.6], [-0.2, 1], [0.22, 0.93], [0.5, 0.58]];
  const rings = prof.map(([y, k]) => ({ y: y * h, rx: (w / 2) * k * (1 - R() * j), rz: (d / 2) * k * (1 - R() * j), cx: (R() - 0.5) * w * j * 0.5, cz: (R() - 0.5) * d * j * 0.5 }));
  return loft(rings, o.N || 6, { n: o.n || 2.7, phase: o.phase ?? R() * Math.PI });
}
const rk = (w, h, d, seed, x, y, z, o = {}) => T(rock(w, h, d, seed, o), x, y, z, o.rx || 0, o.ry || 0, o.rz || 0);
/* cristal : pointe à 5 pans, base posée en (x, y, z), inclinée */
const spike = (r, h, x, y, z, rx = 0, rz = 0) => T(T(prism(0.004, r, h, 5), 0, h / 2, 0), x, y, z, rx, 0, rz);
/* plaque de mousse posée sur une face du dessus */
const mossPad = (w, d, x, y, z, ph = 0.3) => T(loft([{ y: -0.03, rx: w / 2, rz: d / 2 }, { y: 0.05, rx: w * 0.4, rz: d * 0.4 }], 7, { phase: ph }), x, y, z);
/* éclat allongé partant dans une direction */
const shard = (dir, dist, len, thick) => { const g = T(gem(1), 0, dist + len / 2, 0, 0, 0, 0, thick, len / 2, thick); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize())); return g; };

function build(pal = PALETTE) {
  const P = pal, M = materials('M_Colosse'), nodes = {};
  const A = [P.rock, P.rockLight], B = [P.rockDark, P.rockDarkLight], C = [P.crystal, P.crystalLight], G = [P.moss, P.mossLight], CV = [P.cave, P.caveLight];
  const gMist = M.glow('Mist'), gHeart = M.glow('Heart'), gEyes = M.glow('Eyes'), gRage = M.glow('Rage'), gFist = M.glow('Fist'), gStar = M.glow('Stars');
  const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
  const glow = (name, pieces, mat) => mk(name, pieces, { mat, outline: false });
  const mist = (name, r, seed, sy = 0.75) => { const R = rng(seed); return glow(name, [0, 1, 2, 3].map((i) => [T(gem(r * (i ? 0.6 : 1)), i ? (R() - 0.5) * r * 1.5 : 0, i ? (R() - 0.5) * r * 0.7 : 0, i ? (R() - 0.5) * r * 1.5 : 0, R() * 90, R() * 90, R() * 90, 1, sy, 1), P.mist, P.mistLight]), gMist); };
  const root = new THREE.Object3D(); root.name = 'Root'; nodes.Root = root;

  /* Bassin : bloc trapu, deux hanches, une boucle de roche devant */
  mk('Hips', [[rk(2.0, 0.7, 1.35, 11, 0, 0, 0, { N: 7 }), ...B], [rk(0.5, 0.46, 0.8, 12, 0.95, 0.03, 0), ...A], [rk(0.5, 0.46, 0.8, 13, -0.95, 0.03, 0), ...A],
    [rk(0.7, 0.44, 0.3, 14, 0, -0.04, 0.62), ...A], [spike(0.11, 0.4, 0.5, -0.05, -0.6, -70, 0), ...C], [spike(0.09, 0.3, -0.35, 0.0, -0.6, -60, 10), ...C]]);

  /* Torse : masse dorsale à face avant plate, cadre de roche (montants, seuil, linteau) autour de la cavité du cœur */
  const main = loft([{ y: 0.15, rx: 0.7, rf: 0.2, rb: 0.5 }, { y: 0.6, rx: 1.08, rf: 0.22, rb: 0.85 }, { y: 1.25, rx: 1.2, rf: 0.22, rb: 0.95 }, { y: 1.7, rx: 1.12, rf: 0.2, rb: 0.9 }, { y: 1.98, rx: 0.7, rf: 0.1, rb: 0.6, cz: -0.1 }], 8, { n: 3 });
  const torso = [[main, ...A]];
  SIDES.forEach(([, s], i) => torso.push([rk(0.62, 1.42, 0.5, 21 + i, s * 0.81, 1.02, 0.37, { prof: [[-0.5, 0.7], [-0.2, 1], [0.25, 1], [0.5, 0.75]] }), ...B]));
  torso.push([rk(1.3, 0.36, 0.5, 23, 0, 0.34, 0.36), ...B], [rk(1.3, 0.38, 0.5, 24, 0, 1.55, 0.36), ...B]);
  torso.push([T(loft([{ y: 0.5, rx: 0.52, rz: 0.03 }, { y: 1.38, rx: 0.52, rz: 0.03 }], 4, { phase: Math.PI / 4 }), 0, 0, 0.2), ...CV]);
  [[0.35, 1.75, -0.55, 0.2, 0.75, -28, -8], [-0.25, 1.8, -0.5, 0.16, 0.55, -20, 12], [0.0, 1.35, -0.85, 0.2, 0.7, -62, 0], [-0.6, 1.2, -0.8, 0.15, 0.5, -55, 18], [0.62, 1.0, -0.78, 0.13, 0.42, -60, -20]].forEach(([x, y, z, r, h, rx, rz]) => torso.push([spike(r, h, x, y, z, rx, rz), ...C]));
  torso.push([mossPad(0.6, 0.5, -0.1, 1.99, -0.25, 0.9), ...G]);
  mk('Torso', torso);
  glow('Mist_Waist', [[T(gem(0.62), 0, 0, 0, 0, 20, 0, 1, 0.42, 0.8), P.mist, P.mistLight], [T(gem(0.4), 0.45, 0.02, 0.1, 20, 50, 10, 1, 0.5, 1), P.mist, P.mistLight], [T(gem(0.4), -0.42, -0.02, -0.1, 0, 10, 30, 1, 0.5, 1), P.mist, P.mistLight]], gMist);
  glow('Mist_Core', [[T(gem(1), 0, 0, 0, 0, 0, 0, 0.5, 0.43, 0.04), P.mist, P.mistLight]], gMist);

  /* Cœur de cristal doré (symétrie de demi-tour : il tourne sans à-coup) et ses rayons, cachés au repos */
  const heart = [[T(gem(1), 0, 0, 0, 0, 0, 0, 0.26, 0.38, 0.19), P.heart, P.heartLight]];
  [1, -1].forEach((s) => { heart.push([T(gem(1), s * 0.17, -0.1, s * 0.05, 0, 0, s * 24, 0.08, 0.2, 0.07), P.heart, P.heartLight], [T(gem(1), -s * 0.13, 0.17, s * 0.06, 0, 0, s * 20, 0.06, 0.15, 0.055), P.heart, P.heartLight]); });
  glow('Heart', heart, gHeart);
  const rays = [[0, 1, 0.5], [0.9, 0.5, 0.6], [-0.9, 0.5, 0.6], [0.8, -0.5, 0.7], [-0.8, -0.5, 0.7], [0, -0.8, 0.9], [0.45, 0.1, 1], [-0.45, 0.1, 1], [0, 0.6, 1]].map(([x, y, z], i) => [shard(V(x, y, z), 0.42, i % 2 ? 0.34 : 0.5, 0.06), P.heart, P.heartLight]);
  glow('Heart_Rays', rays, gHeart);

  /* Plaques de poitrine : le torse fendu. Charnière au bord extérieur, elles s'ouvrent quand il est épuisé. */
  SIDES.forEach(([n, s], i) => {
    const pts = [[-1.07, 0.6], [-0.96, 0.33], [-0.78, -0.03], [-0.96, -0.37], [-1.06, -0.62], [-0.16, -0.62], [-0.02, -0.05], [-0.08, 0.6]].map(([x, y]) => [x * s, y]);
    mk('Chest' + n, [[T(slab(pts, 0.2), 0, 0, 0.1), ...A], [rk(0.56, 0.48, 0.24, 31 + i, -s * 0.5, 0.25, 0.2, { N: 5 }), ...B], [rk(0.46, 0.34, 0.2, 33 + i, -s * 0.56, -0.36, 0.18, { N: 5 }), ...B]]);
  });

  /* Tête : petit bloc enfoncé entre les épaules, deux yeux lumineux, couronne de cristaux */
  const skull = rk(0.92, 0.7, 0.8, 41, 0, 0.43, 0.1, { N: 6, n: 3.2, phase: Math.PI / 6, j: 0.03, prof: [[-0.5, 0.72], [-0.15, 1], [0.25, 0.98], [0.5, 0.7]] });
  mk('Head', [[skull, ...B], [rk(0.62, 0.2, 0.26, 42, 0, 0.14, 0.4, { N: 5 }), ...A],
    [spike(0.1, 0.44, 0, 0.74, -0.08, -12, 0), ...C], [spike(0.08, 0.32, 0.27, 0.72, -0.05, -10, -24), ...C], [spike(0.08, 0.32, -0.27, 0.72, -0.05, -10, 24), ...C], [mossPad(0.34, 0.3, 0.05, 0.79, 0.22, 0.2), ...G]]);
  mist('Mist_Neck', 0.3, 45, 0.5);
  const eyeAt = (g, x, y, off) => stickOn(skull, g, V(x, y, 3), V(0, 0, -1), off);
  const eye = (s, k) => slab([[-0.13, -0.055], [0.12, -0.03], [0.145, 0.075], [-0.09, 0.03]].map(([x, y]) => [x * s * k, y * k]), 0.02);
  glow('Eyes', SIDES.map(([, s]) => [eyeAt(eye(s, 1), s * 0.22, 0.44, 0.014), P.eye, P.eye]), gEyes);
  const rageP = [];
  SIDES.forEach(([, s]) => { rageP.push([eyeAt(eye(s, 1.35), s * 0.22, 0.45, 0.03), P.rage, P.rageLight]);
    rageP.push([eyeAt(slab([[0.1, 0.06], [0.2, 0.1], [0.3, 0.3], [0.17, 0.2], [0.12, 0.24], [0.06, 0.1]].map(([x, y]) => [x * s, y]), 0.02), s * 0.22, 0.45, 0.032), P.rage, P.rageLight]); });
  glow('Eyes_Rage', rageP, gRage);
  glow('Stun_Stars', [0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2; return [T(gem(1), Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, 0, -a / D2R, 0, 0.26, 0.26, 0.1), P.star, '#FFFFFF']; }), gStar);

  /* Bras : épaulière (pivot de l'épaule), bras court, énorme avant-bras, poing massif */
  SIDES.forEach(([n, s], i) => {
    mist('Mist_Sh' + n, 0.34, 50 + i, 0.9);
    mk('Shoulder' + n, [[rk(1.25, 1.0, 1.2, 51 + i, s * 0.03, 0.08, 0, { N: 7 }), ...A], [rk(0.5, 0.6, 0.7, 53 + i, s * 0.5, -0.05, 0.08), ...B],
      [spike(0.15, 0.62, s * 0.3, 0.5, -0.12, -8, -s * 20), ...C], [spike(0.11, 0.42, s * 0.02, 0.52, 0.22, 10, -s * 4), ...C], [spike(0.1, 0.36, s * 0.4, 0.4, 0.3, 24, -s * 30), ...C],
      [mossPad(0.42, 0.4, -s * 0.22, 0.59, -0.12, 0.5 + i), ...G]]);
    mk('Arm' + n, [[rk(0.8, 0.62, 0.8, 55 + i, 0, -0.38, 0, { prof: [[-0.5, 0.5], [-0.2, 1], [0.2, 1], [0.5, 0.5]] }), ...B]]);
    mist('Mist_Ar' + n, 0.33, 57 + i, 0.6);
    mk('ForeArm' + n, [[rk(1.15, 1.0, 1.15, 59 + i, 0, -0.62, 0, { N: 7, prof: [[-0.5, 0.78], [-0.24, 1], [0.2, 0.8], [0.5, 0.45]] }), ...A],
      [rk(0.5, 0.5, 0.36, 61 + i, s * 0.05, -0.7, -0.5, { N: 5 }), ...B], [spike(0.1, 0.36, s * 0.3, -0.5, -0.5, -75, -s * 15), ...C]]);
    mist('Mist_El' + n, 0.34, 63 + i, 0.6);
    const fist = [[rk(1.3, 0.85, 1.3, 65 + i, 0, -0.52, 0, { N: 7, prof: [[-0.5, 0.7], [-0.2, 1], [0.25, 0.95], [0.5, 0.55]] }), ...B]];
    [-0.42, 0, 0.42].forEach((x, k) => fist.push([rk(0.36, 0.42, 0.26, 67 + i * 3 + k, x, -0.62, 0.66, { N: 5 }), ...A]));
    mk('Fist' + n, fist);
    mist('Mist_Wr' + n, 0.36, 73 + i, 0.5);
    /* lueur des poings : cristaux qui sortent de la roche à l'annonce d'un coup (cachés au repos) */
    const fg = [[0.21, -0.08, 0.72, 0.13], [-0.21, -0.08, 0.72, 0.13], [s * 0.7, 0, 0.2, 0.16], [s * 0.66, 0.02, -0.3, 0.13], [0, 0.42, 0.25, 0.17], [0.3, 0.4, -0.15, 0.12], [-0.3, 0.4, -0.1, 0.12], [-s * 0.66, 0.02, 0.1, 0.13]]
      .map(([x, y, z, r], k) => [T(gem(r * 1.7), x, y, z, 20 * k, 35 * k, 0, 1, 1.4, 1), P.fist, '#FFFFFF']);
    glow('Fist_Glow' + n, fg, gFist);
  });

  /* Jambes courtes et pieds larges */
  SIDES.forEach(([n, s], i) => {
    mk('Leg' + n, [[rk(0.85, 0.55, 0.9, 81 + i, 0, -0.355, 0, { prof: [[-0.5, 0.62], [-0.15, 1], [0.2, 1], [0.5, 0.6]] }), ...A]]);
    mist('Mist_Hip' + n, 0.32, 83 + i, 0.5);
    mk('Foot' + n, [[rk(1.0, 0.4, 1.0, 85 + i, 0, -0.25, 0, { N: 7, prof: [[-0.5, 0.86], [-0.1, 1], [0.5, 0.6]] }), ...B], [rk(0.9, 0.3, 0.55, 87 + i, 0, -0.3, 0.58, { N: 5, prof: [[-0.5, 0.9], [0, 1], [0.5, 0.6]] }), ...A],
      [mossPad(0.3, 0.3, s * 0.1, -0.05, -0.1, 0.4 + i), ...G]]);
    mist('Mist_An' + n, 0.32, 89 + i, 0.5);
  });

  /* Onde de choc : couronne d'éclats de brume qui jaillit du sol (cachée au repos) */
  glow('Shock', Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [T(gem(1), Math.cos(a), 0.3, Math.sin(a), 0, -a / D2R, i % 2 ? 14 : -14, 0.1, i % 2 ? 0.3 : 0.42, 0.16), P.mist, P.mistLight]; }), gMist);

  JOINTS.forEach((j) => { if (PARENT[j]) nodes[PARENT[j]].add(nodes[j]); });
  return { root, nodes, materials: M };
}

/* =========================================================
   Animations (écarts par rapport au repos)
   ========================================================= */
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const SYM = new Set(['Shoulder', 'Arm', 'ForeArm', 'Fist', 'Leg', 'Foot', 'Chest', 'Fist_Glow']);
const mir = (v) => { const o = {}; if (v.r) o.r = [v.r[0], -v.r[1], -v.r[2]]; if (v.p) o.p = [-v.p[0], v.p[1], v.p[2]]; if (v.s !== undefined) o.s = v.s; return o; };
/* pose : un nom sans L/R s'applique aux deux côtés (en miroir) */
function B(spec) { const o = {}, full = (v) => ({ r: v.r ? [...v.r] : [0, 0, 0], p: v.p ? [...v.p] : [0, 0, 0], s: v.s ?? 1 }); for (const [k, v] of Object.entries(spec)) if (SYM.has(k)) { o[k + 'L'] = full(v); o[k + 'R'] = full(mir(v)); } for (const [k, v] of Object.entries(spec)) if (!SYM.has(k)) o[k] = full(v); return o; }
const both = (o, j, v) => { add(o, j + 'L', v); add(o, j + 'R', mir(v)); return o; };
/* somme de deux poses (les échelles se multiplient) */
function plus(a, b) { const o = {}; for (const j of Object.keys(a)) add(o, j, a[j]); for (const j of Object.keys(b)) add(o, j, b[j]); return o; }
/* vie de la brume et du cœur : w = phase (rad), heat = intensité (0 calme … 1 vif) */
function life(o, w, heat = 0, spin = 0) {
  MISTS.forEach((m, i) => add(o, m, { s: 1 + 0.07 * sin(w + i * 1.7) + heat * (0.3 + 0.1 * sin(3 * w + i)) }));
  add(o, 'Heart', { r: [0, spin, 0], s: 1 + 0.05 * sin(2 * w) + 0.15 * heat });
  return o;
}
/* phase 2 : yeux de rage, brume gonflée et agitée */
function rage(o, w, k = 1) {
  add(o, 'Eyes_Rage', { s: 1 + 999 * clamp01(k * 2) });
  MISTS.forEach((m, i) => add(o, m, { s: 1 + k * (0.3 + 0.1 * sin(5 * w + i * 2.3)) }));
  add(o, 'Mist_Core', { s: 1 + 0.25 * k }); add(o, 'Heart', { s: 1 + 0.12 * k });
  return o;
}

/* poses clés */
const KNEEL = B({ Hips: { p: [0, -0.27, 0], r: [0, 0, 0] }, Leg: { r: [62, 0, 0], p: [0, -0.1, -0.1] }, Foot: { r: [-62, 0, 0], p: [0, -0.53, -0.28] },
  Torso: { r: [18, 0, 0] }, Head: { r: [12, 0, 0] }, Shoulder: { r: [-41.4, 0, 3] }, ForeArm: { r: [-4, 0, 0] }, Fist: { r: [18, 0, 0], p: [0, -0.08, 0] } });
const OPEN = B({ Chest: { r: [0, 58, 0] }, Heart: { p: [0, 0, 0.5], s: 1.7 }, Heart_Rays: { s: 1000 }, Mist_Core: { s: 1.5 } });
const TIRED0 = plus(KNEEL, OPEN);
const UP = B({ Hips: { p: [0, -0.08, -0.12] }, Leg: { p: [0, 0.08, 0] }, Torso: { r: [-13, 0, 0] }, Head: { r: [-14, 0, 0] }, Shoulder: { r: [-170, 0, 8] }, ForeArm: { r: [-28, 0, 0] }, Fist: { r: [-12, 0, 0] }, Fist_Glow: { s: 1000 }, Heart: { s: 1.2 } });
const CROUCH = B({ Hips: { p: [0, -0.1, 0] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [10, 0, 0] }, Head: { r: [6, 0, 0] }, Shoulder: { r: [-18, 0, 3] }, ForeArm: { r: [-14, 0, 0] }, Fist_Glow: { s: 300 } });
const SLAMHIT = plus(KNEEL, B({ Torso: { r: [8, 0, 0] }, Shoulder: { r: [-15, 0, 0] }, Head: { r: [6, 0, 0] }, Fist_Glow: { s: 1000 } }));
const SW_BACK = B({ Hips: { p: [0, -0.1, 0], r: [0, -16, 0] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [8, -40, 0] }, Head: { r: [0, 30, 0] }, ShoulderR: { r: [-38, 0, -40] }, ForeArmR: { r: [-22, 0, 0] }, ShoulderL: { r: [-28, 0, 8] }, ForeArmL: { r: [-30, 0, 0] }, Fist_GlowR: { s: 1000 } });
const SW_HIT = B({ Hips: { p: [0, -0.1, 0.1], r: [0, 18, 0] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [20, 52, 0] }, Head: { r: [-6, -30, 0] }, ShoulderR: { r: [-58, 0, -30] }, ForeArmR: { r: [-6, 0, 0] }, ShoulderL: { r: [26, 0, 14] }, ForeArmL: { r: [-20, 0, 0] }, Fist_GlowR: { s: 1000 } });
const RK_BACK = B({ Hips: { p: [0, -0.1, -0.1] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [-8, 0, 0] }, Head: { r: [4, 0, 0] }, Shoulder: { r: [36, 0, 6] }, ForeArm: { r: [-72, 0, 0], p: [0, -0.17, 0.04] }, Fist_Glow: { s: 1000 }, Heart: { s: 1.2 } });
const RK_HIT = B({ Hips: { p: [0, -0.1, 0.16] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [14, 0, 0] }, Head: { r: [-8, 0, 0] }, Shoulder: { r: [-66, 0, 3] }, ForeArm: { r: [-12, 0, 0] }, Fist_Glow: { s: 1000 } });
const SM_BACK = B({ Hips: { p: [0, -0.06, 0] }, Leg: { p: [0, 0.06, 0] }, Torso: { r: [-15, 0, 0] }, Head: { r: [-22, 0, 0] }, Shoulder: { r: [8, 0, 46], p: [0.14, 0, 0] }, ForeArm: { r: [-30, 0, 0] }, Chest: { r: [0, 20, 0] }, Heart: { s: 1.35 }, Fist_Glow: { s: 1000 } });
const SM_HIT = B({ Hips: { p: [0, -0.1, 0] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [9, 0, 0] }, Head: { r: [8, 0, 0] }, Shoulder: { r: [-22, 0, 58], p: [0.18, 0, 0] }, ForeArm: { r: [-48, 0, 0] }, Chest: { r: [0, 30, 0] }, Heart: { s: 1.5 }, Fist_Glow: { s: 1000 } });

const shock = (o, k, z = 0, big = 1) => add(o, 'Shock', k > 0 && k < 1 ? { p: [0, 0, z], s: [1000 * (0.8 + 2.4 * k) * big, 1000 * Math.max(0.001, sin(PI * Math.min(1, k * 1.15))) * 1.6, 1000 * (0.8 + 2.4 * k) * big], r: [0, 40 * k, 0] } : {});

const ANIMS = {
  IDLE: { dur: 3.2, loop: true, f: (t) => { const w = 2 * PI * t / 3.2, b = sin(w), o = {};
    const d = 0.03 - 0.03 * b; add(o, 'Hips', { p: [0, -d, 0] }); both(o, 'Leg', { p: [0, d, 0] });
    add(o, 'Torso', { p: [0, 0.05 * b, 0], r: [-1.5 * b, 0, 0] });
    add(o, 'Head', { r: [3 * sin(w - 0.6), 5 * sin(w / 1), 0], p: [0, 0.02 * b, 0] });
    both(o, 'Chest', { p: [0, 0, 0.035 * (0.5 + 0.5 * b)] });
    both(o, 'Shoulder', { p: [0, 0.05 * b, 0], r: [2.5 * sin(w - 0.4), 0, 1.5 * b] });
    both(o, 'ForeArm', { r: [-2 * b, 0, 0] });
    return life(o, w, 0, 360 * t / 3.2); } },
  MOVE: { dur: 1.5, loop: true, f: (t) => { const w = 2 * PI * t / 1.5, o = {};
    const leg = (n, ph) => { const a = 15 * cos(w + ph), up = Math.max(0, sin(w + ph)); add(o, 'Leg' + n, { r: [a, 0, 0], p: [0, 0.07 * up, 0] }); add(o, 'Foot' + n, { r: [-a + 8 * up * cos(w + ph), 0, 0], p: [0, 0.05 * up, 0] }); };
    leg('L', 0); leg('R', PI);
    const thud = Math.pow(Math.abs(cos(w)), 3);
    add(o, 'Hips', { p: [-0.05 * sin(w), 0.105 * Math.abs(sin(w)), 0], r: [0, 3 * sin(w), 6 * sin(w)] });
    add(o, 'Torso', { r: [4 + 2 * thud, -5 * sin(w), -4.5 * sin(w)] });
    add(o, 'Head', { r: [2 * thud, 3 * sin(w), 0] });
    add(o, 'ShoulderL', { r: [-12 * cos(w) - 4, 0, 2], p: [0, 0.04 * thud, 0] }); add(o, 'ShoulderR', { r: [12 * cos(w) - 4, 0, -2], p: [0, 0.04 * thud, 0] });
    add(o, 'ForeArmL', { r: [-6 - 5 * cos(w), 0, 0] }); add(o, 'ForeArmR', { r: [-6 + 5 * cos(w), 0, 0] });
    return life(o, w, 0.1, 180 * t / 1.5); } },
  WINDUP_SLAM: { dur: 1.1, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: {} }, { t: 0.4, pose: CROUCH }, { t: 1.1, pose: UP }])(t), k = clamp01(t / 1.1);
    add(o, 'Torso', { r: [0, 0, 1.2 * k * sin(t * 60)] }); return life(o, t * 5, k); } },
  SLAM: { dur: 0.4, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: UP }, { t: 0.12, pose: SLAMHIT }, { t: 0.26, pose: plus(KNEEL, B({ Chest: { r: [0, 20, 0] }, Fist_Glow: { s: 400 } })) }, { t: 0.4, pose: TIRED0 }])(t);
    shock(o, (t - 0.1) / 0.3); return life(o, t * 5, 1 - t / 0.4); } },
  TIRED: { dur: 2.4, loop: true, f: (t) => { const w = 2 * PI * t / 1.2, b = sin(w), o = plus(TIRED0, {}), dy = 0.035 * b, a = 18 * D2R;
    add(o, 'Torso', { p: [0, dy, 0] }); both(o, 'Shoulder', { p: [0, -dy * cos(a), dy * sin(a)] });
    add(o, 'Head', { r: [5 * sin(w - 0.5), 0, 3 * sin(w / 2)] });
    both(o, 'Chest', { r: [0, 6 * b, 0] });
    const pulse = sin(2 * PI * t / 0.6);
    life(o, w, 0.2, 360 * t / 2.4);
    add(o, 'Heart', { s: 1 + 0.16 * pulse }); add(o, 'Heart_Rays', { s: 0.85 + 0.25 * pulse, r: [0, 0, 150 * t] }); add(o, 'Mist_Core', { s: 1 + 0.2 * pulse });
    return o; } },
  RISE: { dur: 0.7, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: TIRED0 }, { t: 0.3, pose: plus(B({ Hips: { p: [0, 0.02, 0] }, Leg: { r: [32, 0, 0], p: [0, -0.02, -0.05] }, Foot: { r: [-32, 0, 0], p: [0, -0.08, -0.05] }, Torso: { r: [12, 0, 0] }, Shoulder: { r: [-26, 0, 4] }, ForeArm: { r: [-12, 0, 0] }, Fist: { r: [14, 0, 0] } }), B({ Chest: { r: [0, 14, 0] }, Heart: { s: 1.2 } })) }, { t: 0.7, pose: {} }])(t);
    return life(o, t * 4, 0.2 * (1 - t / 0.7)); } },
  WINDUP_SWEEP: { dur: 0.75, loop: false, f: (t) => life(keyed([{ t: 0, pose: {} }, { t: 0.75, pose: SW_BACK }])(t), t * 5, clamp01(t / 0.75)) },
  SWEEP: { dur: 0.4, loop: false, f: (t) => life(keyed([{ t: 0, pose: SW_BACK }, { t: 0.14, pose: SW_HIT }, { t: 0.22, pose: SW_HIT }, { t: 0.4, pose: {} }])(t), t * 5, 1 - t / 0.4) },
  WINDUP_ROCKS: { dur: 0.8, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: {} }, { t: 0.8, pose: RK_BACK }])(t), k = clamp01(t / 0.8); both(o, 'ForeArm', { r: [1.5 * k * sin(t * 55), 0, 0] }); return life(o, t * 5, k); } },
  ROCKS: { dur: 0.4, loop: false, f: (t) => life(keyed([{ t: 0, pose: RK_BACK }, { t: 0.1, pose: RK_HIT }, { t: 0.2, pose: RK_HIT }, { t: 0.4, pose: {} }])(t), t * 5, 1 - t / 0.4) },
  WINDUP_SUMMON: { dur: 0.8, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: {} }, { t: 0.8, pose: SM_BACK }])(t), k = clamp01(t / 0.8); add(o, 'Head', { r: [0, 0, 2 * k * sin(t * 50)] }); return life(o, t * 5, k); } },
  SUMMON: { dur: 0.4, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: SM_BACK }, { t: 0.12, pose: SM_HIT }, { t: 0.22, pose: SM_HIT }, { t: 0.4, pose: {} }])(t);
    shock(o, (t - 0.08) / 0.32, -2.3, 1.5); return life(o, t * 5, 1.4 * sin(PI * clamp01(t / 0.4))); } },
  HURT: { dur: 0.3, loop: false, f: (t) => keyed([{ t: 0, pose: {} }, { t: 0.07, pose: B({ Torso: { r: [-7, 0, 2] }, Hips: { p: [0, 0, -0.08] }, Head: { r: [-14, 0, 5] }, Shoulder: { p: [0, 0.08, 0] }, Heart: { s: 1.3 } }) }, { t: 0.3, pose: {} }])(t) },
  STUN: { dur: 1.6, loop: true, f: (t) => { const w = 2 * PI * t / 1.6, o = B({ Hips: { p: [0, -0.08, 0] }, Leg: { p: [0, 0.08, 0] }, Torso: { r: [10, 0, 0] }, Head: { r: [16, 0, 0] }, Shoulder: { r: [-19, 0, 2] }, ForeArm: { r: [-12, 0, 0] } });
    add(o, 'Hips', { p: [0.05 * sin(w), 0, 0] }); add(o, 'Torso', { r: [2 * sin(w + 1), 0, 3 * sin(w + 0.5)] }); add(o, 'Head', { r: [0, 0, 9 * sin(w + 1.2)] });
    both(o, 'Shoulder', { r: [3 * sin(w), 0, 0] });
    add(o, 'Stun_Stars', { s: 1000, r: [0, 225 * t, 0] });
    return life(o, w, -0.15, 180 * t / 1.6); } },
  RAGE: { dur: 1.2, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: {} }, { t: 0.35, pose: B({ Hips: { p: [0, -0.1, 0] }, Leg: { p: [0, 0.1, 0] }, Torso: { r: [14, 0, 0] }, Head: { r: [14, 0, 0] }, Shoulder: { r: [-24, 0, 2] }, ForeArm: { r: [-30, 0, 0] } }) },
      { t: 0.6, pose: B({ Hips: { p: [0, -0.06, 0] }, Leg: { p: [0, 0.06, 0] }, Torso: { r: [-16, 0, 0] }, Head: { r: [-24, 0, 0] }, Shoulder: { r: [14, 0, 40], p: [0.12, 0, 0] }, ForeArm: { r: [-36, 0, 0] }, Chest: { r: [0, 16, 0] }, Fist_Glow: { s: 1000 } }) },
      { t: 0.9, pose: B({ Hips: { p: [0, -0.06, 0] }, Leg: { p: [0, 0.06, 0] }, Torso: { r: [-14, 0, 0] }, Head: { r: [-20, 0, 0] }, Shoulder: { r: [14, 0, 40], p: [0.12, 0, 0] }, ForeArm: { r: [-36, 0, 0] }, Chest: { r: [0, 16, 0] }, Fist_Glow: { s: 1000 } }) }, { t: 1.2, pose: {} }])(t);
    const k = clamp01((t - 0.3) / 0.3); add(o, 'Head', { r: [0, 0, 3 * k * sin(t * 50) * clamp01((1.1 - t) * 5)] });
    life(o, t * 5, 1.2 * sin(PI * clamp01((t - 0.3) / 0.9))); return rage(o, t * 4, k); } },
  IDLE_RAGE: { dur: 3.2, loop: true, f: (t) => rage(ANIMS.IDLE.f(t), 2 * PI * t / 3.2) },
  DEATH: { dur: 1.8, loop: false, f: (t) => deathPose(t) },
};

/* ---------- mort : chaque bloc tombe à son tour vers sa place dans l'éboulis (cibles en repère monde) ---------- */
const ROCKS = ['Hips', 'Torso', 'ChestL', 'ChestR', 'Head', 'ShoulderL', 'ArmL', 'ForeArmL', 'FistL', 'ShoulderR', 'ArmR', 'ForeArmR', 'FistR', 'LegL', 'FootL', 'LegR', 'FootR'];
/* c : centre final [x, z] ; e : orientation finale (degrés, repère monde) ; t : [début, fin] de la chute */
const FALL = {
  FistL: { c: [2.75, 1.85], e: [0, 30, 0], t: [0, 0.45] }, FistR: { c: [-2.8, 1.7], e: [0, -40, 0], t: [0.05, 0.5] },
  ForeArmL: { c: [3.3, -0.05], e: [0, 20, 90], t: [0.1, 0.65] }, ForeArmR: { c: [-3.3, -0.2], e: [0, -10, -90], t: [0.15, 0.7] },
  ArmL: { c: [3.05, -1.35], e: [90, 0, 30], t: [0.22, 0.8] }, ArmR: { c: [-3.0, -1.5], e: [90, 0, -40], t: [0.27, 0.85] },
  ShoulderL: { c: [2.35, -2.6], e: [-20, 30, 100], t: [0.35, 0.95] }, ShoulderR: { c: [-2.3, -2.7], e: [-10, -20, -105], t: [0.4, 1.0] },
  Head: { c: [0.25, 3.3], e: [100, 20, 0], t: [0.3, 0.95] },
  ChestL: { c: [0.72, 1.95], e: [-90, 0, 12], t: [0.45, 1.0] }, ChestR: { c: [-0.75, 1.9], e: [-90, 0, -8], t: [0.5, 1.05] },
  FootL: { c: [1.8, 0.6], e: [0, 30, 0], t: [0.55, 0.95] }, FootR: { c: [-1.8, 0.55], e: [0, -24, 0], t: [0.6, 1.0] },
  LegL: { c: [1.85, -0.85], e: [80, 20, 0], t: [0.6, 1.05] }, LegR: { c: [-1.85, -0.9], e: [85, -30, 0], t: [0.65, 1.1] },
  Torso: { c: [0, -2.2], e: [-90, 0, 0], t: [0.75, 1.5] },
  Hips: { c: [0, 0.05], e: [6, 12, -5], t: [0.95, 1.4] },
};
const HEART_END = V(0, 1.25, 1.0);
let _D = null;
function deathData() {
  if (_D) return _D;
  const b = build(PALETTE); b.root.updateMatrixWorld(true);
  const d = { rest: {}, local: {} };
  JOINTS.forEach((j) => { const r = REST[j]; d.local[j] = new THREE.Matrix4().compose(V(...r.p), new THREE.Quaternion().setFromEuler(new THREE.Euler(r.r[0] * D2R, r.r[1] * D2R, r.r[2] * D2R)), V(1, 1, 1).multiplyScalar(r.s || 1)); });
  ROCKS.forEach((j) => { const n = b.nodes[j], g = n.geometry; g.computeBoundingBox(); const o = V(), q = new THREE.Quaternion(), s = V(); n.matrixWorld.decompose(o, q, s);
    const c = g.boundingBox.getCenter(V()), F = FALL[j];
    d.rest[j] = { v: g.attributes.position.array, c, o, q, C: c.clone().applyMatrix4(n.matrixWorld), qe: new THREE.Quaternion().setFromEuler(new THREE.Euler(F.e[0] * D2R, F.e[1] * D2R, F.e[2] * D2R)) }; });
  d.heart = V().setFromMatrixPosition(b.nodes.Heart.matrixWorld);
  return (_D = d);
}
const _m = new THREE.Matrix4();
function minY(v, q) { const e = _m.makeRotationFromQuaternion(q).elements; let m = 1e9; for (let i = 0; i < v.length; i += 3) { const y = e[1] * v[i] + e[5] * v[i + 1] + e[9] * v[i + 2]; if (y < m) m = y; } return m; }
/* pose (écarts) qui amène les pièces données à leur matrice monde ; les autres suivent leur parent */
function worldToPose(W) {
  const D = deathData(), world = {}, o = {}, p = V(), q = new THREE.Quaternion(), s = V(), e = new THREE.Euler();
  JOINTS.forEach((j) => {
    const par = PARENT[j];
    if (!par) { world[j] = new THREE.Matrix4(); return; }
    if (!W[j]) { world[j] = world[par].clone().multiply(D.local[j]); return; }
    world[j] = W[j];
    new THREE.Matrix4().copy(world[par]).invert().multiply(W[j]).decompose(p, q, s); e.setFromQuaternion(q, 'XYZ');
    const r = REST[j];
    o[j] = { r: [e.x / D2R - r.r[0], e.y / D2R - r.r[1], e.z / D2R - r.r[2]], p: [p.x - r.p[0], p.y - r.p[1], p.z - r.p[2]], s: 1 };
  });
  return o;
}
function deathPose(t) {
  const D = deathData(), W = {};
  ROCKS.forEach((j) => { const R = D.rest[j], F = FALL[j], k = clamp01((t - F.t[0]) / (F.t[1] - F.t[0]));
    const q = R.q.clone().slerp(R.qe, ease(k)), kx = 1 - (1 - k) * (1 - k), rc = R.c.clone().applyQuaternion(q);
    const x = R.C.x + (F.c[0] - R.C.x) * kx - rc.x, z = R.C.z + (F.c[1] - R.C.z) * kx - rc.z;
    const y = Math.max(R.o.y + (-minY(R.v, R.qe) - R.o.y) * k * k, -minY(R.v, q));
    W[j] = new THREE.Matrix4().compose(V(x, y, z), q, V(1, 1, 1)); });
  const kh = ease(clamp01((t - 0.3) / 1.0)), hp = D.heart.clone().lerp(HEART_END, kh); hp.y += 0.06 * sin(t * 5) * kh;
  W.Heart = new THREE.Matrix4().compose(hp, new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), t * 2.2), V(1, 1, 1));
  const o = worldToPose(W), fade = clamp01(1 - t / 1.1);
  MISTS.forEach((m) => add(o, m, { s: Math.max(0.001, fade * (1 + 0.3 * sin(t * 20))) }));
  add(o, 'Eyes', { s: Math.max(0.001, clamp01(1 - t / 0.5)) });
  const kr = clamp01((t - 1.2) / 0.5);
  add(o, 'Heart', { s: 1.25 + 0.12 * sin(t * 9) }); add(o, 'Heart_Rays', { s: 1 + 999 * kr * (0.7 + 0.1 * sin(t * 9)), r: [0, 0, 60 * t] });
  return o;
}

const LABELS = { IDLE: 'Attente (respiration lourde)', MOVE: 'Marche pesante', WINDUP_SLAM: 'Annonce : poings levés', SLAM: 'Frappe à deux poings', TIRED: 'Épuisé : cœur à découvert', RISE: 'Il se relève',
  WINDUP_SWEEP: 'Annonce : bras armé', SWEEP: 'Balayage', WINDUP_ROCKS: 'Annonce : poings ramenés', ROCKS: 'Jet de roches', WINDUP_SUMMON: 'Annonce : bras écartés', SUMMON: 'Invocation / rugissement',
  HURT: 'Coup reçu (additif)', STUN: 'Étourdi', RAGE: 'Passage en phase 2', IDLE_RAGE: 'Attente en phase 2', DEATH: 'Effondrement' };
const MOVES = {
  WINDUP_SLAM: { signal: 'il se tasse puis lève les deux poings au-dessus de la tête, poings et cœur s’allument' }, SLAM: { frappe_s: 0.12, zone: 'cercle de 3,4 m sur la cible', suite: 'TIRED' },
  WINDUP_SWEEP: { signal: 'torse vrillé, bras droit armé en arrière, poing droit allumé' }, SWEEP: { frappe_s: 0.14, zone: 'arc devant lui, 4,3 m' },
  WINDUP_ROCKS: { signal: 'les deux poings allumés ramenés contre les flancs' }, ROCKS: { frappe_s: 0.1, zone: 'projectiles vers l’avant, hauteur 2,2 m' },
  WINDUP_SUMMON: { signal: 'bras écartés, tête renversée, poitrine entrouverte' }, SUMMON: { frappe_s: 0.12, zone: 'autour de lui' },
  TIRED: { vulnerable: true, coeur_m: 'à découvert, devant la poitrine' },
};

export const model = { id: 'colosse', file: 'ColosseDeBrume', name: 'Colosse de Brume', subtitle: 'boss de l’Île de l’Aube', PALETTE, REST, JOINTS, PARENT, build, ANIMS, LABELS, MOVES,
  ignore: [] };

/* ---------- vue de jeu : contrat de js/world/creatures.js ----------
   Champs lus : move, wind, attack, tired, hurt, dead (ancienne fabrique) + stun, phase (1 | 2) et atk
   ('slam' | 'sweep' | 'rocks' | 'summon' | 'intro'), facultatifs : sans atk, l'annonce et la frappe sont celles du « slam ». */
const KIND = { slam: 'SLAM', sweep: 'SWEEP', rocks: 'ROCKS', summon: 'SUMMON', intro: 'SUMMON' };
const TIRED_ONLY = ['Head', 'Heart', 'ShoulderL', 'ShoulderR'];
export function createView() {
  let rise = -1, hold = null, rel = 1, phase = 1, rageT = -1, kind = 'SLAM';
  return creatureView(model, (s, a) => {
    if (s.dead != null && s.dead !== false) return a.at('DEATH', +s.dead || 0);
    const p2 = s.phase === 2;
    if (p2 && phase === 1) rageT = 0;
    phase = p2 ? 2 : 1;
    let pose;
    if (s.tired) { pose = a.loop('TIRED'); rise = 0; }
    else if (rise >= 0 && rise < ANIMS.RISE.dur && !s.attack) { rise += a.dt; pose = a.clip('RISE', rise); if (s.move) pose = blend(pose, a.loop('MOVE', p2 ? 1.3 : 1), ease(clamp01(rise / ANIMS.RISE.dur))); }
    else { rise = -1; pose = s.stun ? a.loop('STUN') : s.move ? a.loop('MOVE', p2 ? 1.3 : 1) : a.loop('IDLE'); }
    if (rageT >= 0 && !s.tired && !s.wind && !s.attack) { rageT += a.dt; if (rageT < ANIMS.RAGE.dur) pose = blend(pose, a.clip('RAGE', rageT), Math.min(1, rageT * 5, (ANIMS.RAGE.dur - rageT) * 5)); else rageT = -1; }
    if (s.wind || s.attack) {
      kind = KIND[s.atk || s.kind] || 'SLAM';
      pose = s.attack ? a.at(kind, s.attack) : blend(pose, a.at('WINDUP_' + kind, s.wind), Math.min(1, s.wind * 4));
      hold = pose; rel = 0;
    } else if (hold && rel < 0.3 && !s.tired) { rel += a.dt; pose = blend(hold, pose, ease(clamp01(rel / 0.3))); }
    else hold = null;
    if (s.hurt && !s.attack && !s.wind) { const h = a.at('HURT', 1 - s.hurt), f = {}; (s.tired ? TIRED_ONLY : Object.keys(h)).forEach((j) => { if (h[j]) f[j] = h[j]; }); pose = plus(pose, f); }
    if (p2) rage(pose, a.t * 4);
    add(pose, 'Heart', {}); pose.Heart.r = [0, (a.t * (s.tired ? 220 : 90)) % 360, 0];
    return pose;
  }, { mat: (nodes) => { const m = nodes.Torso.material; m.emissive = new THREE.Color('#3a2a66'); return m; } });
}
