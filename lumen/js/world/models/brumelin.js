/* =========================================================
   LUMEN — Brumelin : petite boule de brume curieuse et rancunière (Île de l'Aube).
   MODÈLE D'EXEMPLE du kit : sert de patron aux autres créatures.
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Hauteur ≈ 0,95 m, rayon de jeu 0,45 m.
   ========================================================= */
import { THREE, V, T, prism, gem, loft, disc, slab, star4, part, place, materials, stickOn, lighten, keyed, add, blend, ease, clamp01, creatureView } from '../kit3d.js';

const PALETTE = { body: '#8F7AD6', bodyLight: '#B7A6F2', under: '#6A55B8', horn: '#5A3FB0', eye: '#FFFFFF', pupil: '#1B1238', mouth: '#2A1A4A', cheek: '#C79BE8', wisp: '#C9B6FF', angry: '#FF5A6A', star: '#FFE48A' };
const REST = {
  Root: { p: [0, 0, 0], r: [0, 0, 0] },
  Body: { p: [0, 0.56, 0], r: [0, 0, 0] },
  Tail: { p: [0, -0.34, 0], r: [0, 0, 0] },
  Eyes_Angry: { p: [0, 0, 0], r: [0, 0, 0], s: 0.001 }, Brows_Angry: { p: [0, 0, 0], r: [0, 0, 0], s: 0.001 },
  HandL: { p: [0.5, -0.06, 0.12], r: [0, 0, 0] }, HandR: { p: [-0.5, -0.06, 0.12], r: [0, 0, 0] },
  Wisp_Pivot: { p: [0, 0, 0], r: [0, 0, 0] },
  Wisp1: { p: [0.6, 0.02, 0], r: [0, 0, 0] }, Wisp2: { p: [-0.3, 0.1, 0.52], r: [0, 0, 0] }, Wisp3: { p: [-0.3, -0.06, -0.52], r: [0, 0, 0] },
  Stun_Stars: { p: [0, 0.66, 0], r: [0, 0, 0], s: 0.001 },
};
const JOINTS = Object.keys(REST);

function build(pal = PALETTE) {
  const P = pal, M = materials('M_Brumelin'), nodes = {};
  const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
  const root = new THREE.Object3D(); root.name = 'Root'; nodes.Root = root;

  /* Corps : goutte facettée à face avant plate, deux petites cornes */
  const blob = loft([{ y: -0.36, rx: 0.16, rz: 0.16 }, { y: -0.22, rx: 0.36, rz: 0.34 }, { y: 0, rx: 0.45, rz: 0.42 }, { y: 0.2, rx: 0.4, rz: 0.37 }, { y: 0.36, rx: 0.24, rz: 0.22 }, { y: 0.43, rx: 0.07, rz: 0.07 }], 8, { n: 2.3 });
  const horn = (s) => T(prism(0.004, 0.075, 0.22, 5), s * 0.2, 0.46, 0, 0, 0, -s * 24);
  const on = (g, x, y, off, spin) => stickOn(blob, g, V(x, y, 2), V(0, 0, -1), off, spin);
  const face = [[blob, P.body, P.bodyLight], [horn(1), P.horn, lighten(P.horn, 0.25)], [horn(-1), P.horn, lighten(P.horn, 0.25)]];
  [-1, 1].forEach((s) => {
    face.push([on(disc(0.088, 0.104, 8, Math.PI / 8), s * 0.15, 0.07, 0.003), P.eye, P.eye]);
    face.push([on(disc(0.046, 0.06, 8, Math.PI / 8), s * 0.15, 0.06, 0.006), P.pupil, P.pupil]);
    face.push([on(disc(0.016, 0.016, 6), s * 0.15 - 0.014, 0.085, 0.009), P.eye, P.eye]);
    face.push([on(disc(0.04, 0.026, 6), s * 0.29, -0.06, 0.003), P.cheek, P.cheek]);
  });
  face.push([on(slab([[-0.045, 0.012], [-0.02, -0.004], [0.02, -0.004], [0.045, 0.012], [0.04, -0.002], [0.018, -0.02], [-0.018, -0.02], [-0.04, -0.002]], 0.004), 0, -0.1, 0.003), P.mouth, P.mouth]);
  const body = mk('Body', face, { solid: [blob, horn(1), horn(-1)] });
  root.add(body);

  /* Regard en colère (annonce d'attaque) : pupilles rouges lumineuses et sourcils, cachés au repos (échelle 0,001) */
  const angry = [], brows = [];
  [-1, 1].forEach((s) => { angry.push([on(disc(0.05, 0.064, 8, Math.PI / 8), s * 0.15, 0.06, 0.011), P.angry, P.angry]); brows.push([on(slab([[-0.08, 0.0], [0.08, 0.05], [0.08, 0.085], [-0.08, 0.035]].map(([x, y]) => [x * -s, y]), 0.004), s * 0.15, 0.15, 0.012), P.pupil, P.pupil]); });
  body.add(mk('Eyes_Angry', angry, { mat: M.glow('Angry', P.angry, 0.8), outline: false }));
  body.add(mk('Brows_Angry', brows, { outline: false }));

  /* Queue de brume : pointe recourbée vers l'arrière */
  body.add(mk('Tail', [[loft([{ y: -0.2, rx: 0.004, rz: 0.004, cz: -0.1 }, { y: -0.1, rx: 0.11, rz: 0.11, cz: -0.04 }, { y: 0.03, rx: 0.2, rz: 0.2 }], 6), P.under, P.body]]));

  /* Mains : deux moufles flottantes */
  const hand = () => [[loft([{ y: -0.085, rx: 0.05, rz: 0.05 }, { y: 0, rx: 0.1, rz: 0.09 }, { y: 0.075, rx: 0.06, rz: 0.06 }], 6), P.body, P.bodyLight]];
  body.add(mk('HandL', hand())); body.add(mk('HandR', hand()));

  /* Feux follets en orbite (lumineux, sans contour) */
  const pivot = new THREE.Object3D(); pivot.name = 'Wisp_Pivot'; nodes.Wisp_Pivot = pivot; body.add(place(pivot, REST.Wisp_Pivot));
  const glowW = M.glow('Wisp', P.wisp, 0.6);
  ['Wisp1', 'Wisp2', 'Wisp3'].forEach((n) => pivot.add(mk(n, [[T(gem(1), 0, 0, 0, 0, 0, 0, 0.05, 0.085, 0.05), P.wisp, '#FFFFFF']], { mat: glowW, outline: false })));

  /* Étoiles d'étourdissement, cachées au repos */
  const stars = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return [T(gem(1), Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36, 0, -a * 180 / Math.PI, 0, 0.07, 0.07, 0.03), P.star, '#FFFFFF']; });
  body.add(mk('Stun_Stars', stars, { mat: M.glow('Stars', P.star, 0.7), outline: false }));
  return { root, nodes, materials: M };
}

/* ---------- animations (écarts par rapport au repos) ---------- */
const sin = Math.sin, PI = Math.PI;
const squash = (k) => [1 + k * 0.5, 1 - k, 1 + k * 0.5];   // k > 0 : écrasé, k < 0 : étiré
function wisps(o, t, speed = 1, pull = 0) {
  add(o, 'Wisp_Pivot', { r: [0, 120 * t * speed, 0], s: 1 - pull * 0.25 });
  ['Wisp1', 'Wisp2', 'Wisp3'].forEach((w, i) => add(o, w, { p: [0, 0.06 * sin(3 * t + i * 2.1), 0], r: [0, 200 * t, 0] }));
  return o;
}
const ANIMS = {
  IDLE: { dur: 2.4, loop: true, f: (t) => { const w = 2 * PI * t / 2.4, h = Math.abs(sin(w)), o = {};
    add(o, 'Body', { p: [0, 0.05 * h, 0], r: [0, 4 * sin(w), 2 * sin(w)], s: squash(0.06 * (1 - h) - 0.03) });
    add(o, 'Tail', { r: [10 * sin(2 * w), 0, 6 * sin(w)] });
    add(o, 'HandL', { p: [0, 0.04 * sin(2 * w), 0] }); add(o, 'HandR', { p: [0, 0.04 * sin(2 * w + 2), 0] });
    return wisps(o, t, 1); } },
  MOVE: { dur: 0.6, loop: true, f: (t) => { const w = 2 * PI * t / 0.6, h = Math.abs(sin(w / 2)), o = {};
    add(o, 'Body', { p: [0, 0.26 * h, 0], r: [8, 0, 0], s: squash(0.2 * (1 - h) - 0.1) });
    add(o, 'Tail', { r: [-25 + 14 * sin(w), 0, 0], s: [1, 1.2, 1] });
    add(o, 'HandL', { p: [0, 0.05 * sin(w), -0.06], r: [20, 0, 0] }); add(o, 'HandR', { p: [0, 0.05 * sin(w + PI), -0.06], r: [20, 0, 0] });
    return wisps(o, t, 4); } },
  WINDUP: { dur: 0.45, loop: false, f: (t) => { const k = ease(clamp01(t / 0.45)), o = {};
    add(o, 'Body', { p: [0, 0.05 * k, -0.12 * k], r: [-8 * k, 0, 5 * k * sin(t * 70)], s: 1 + 0.2 * k });
    add(o, 'Eyes_Angry', { s: 1 + 999 * clamp01(k * 3) }); add(o, 'Brows_Angry', { s: 1 + 999 * clamp01(k * 3) });
    add(o, 'HandL', { p: [0.04 * k, 0.26 * k, 0] }); add(o, 'HandR', { p: [-0.04 * k, 0.26 * k, 0] });
    add(o, 'Tail', { r: [20 * k, 0, 0] });
    return wisps(o, t, 1 + 5 * k, k); } },
  ATTACK: { dur: 0.4, loop: false, f: (t) => { const o = keyed([
      { t: 0, pose: { Body: { p: [0, 0.05, -0.12], r: [-8, 0, 0], s: 1.2 }, HandL: { p: [0.04, 0.26, 0] }, HandR: { p: [-0.04, 0.26, 0] }, Eyes_Angry: { s: 1000 }, Brows_Angry: { s: 1000 } } },
      { t: 0.14, pose: { Body: { p: [0, 0.3, 0.5], r: [28, 0, 0], s: [0.9, 1.2, 0.9] }, HandL: { p: [-0.08, 0.02, 0.3], r: [60, 0, 0] }, HandR: { p: [0.08, 0.02, 0.3], r: [60, 0, 0] }, Tail: { r: [-40, 0, 0], s: [1, 1.3, 1] }, Eyes_Angry: { s: 1000 }, Brows_Angry: { s: 1000 } } },
      { t: 0.24, pose: { Body: { p: [0, 0.02, 0.42], r: [14, 0, 0], s: [1.2, 0.8, 1.2] }, HandL: { p: [-0.06, -0.04, 0.24] }, HandR: { p: [0.06, -0.04, 0.24] }, Eyes_Angry: { s: 1000 }, Brows_Angry: { s: 1000 } } },
      { t: 0.4, pose: {} }])(t); return wisps(o, t, 3); } },
  HURT: { dur: 0.3, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: {} }, { t: 0.07, pose: { Body: { p: [0, 0.03, -0.2], r: [-22, 0, 8], s: [1.18, 0.82, 1.18] }, HandL: { p: [0.1, 0.18, -0.05] }, HandR: { p: [-0.1, 0.18, -0.05] } } }, { t: 0.3, pose: {} }])(t); return wisps(o, t, 2); } },
  STUN: { dur: 1.2, loop: true, f: (t) => { const w = 2 * PI * t / 1.2, o = {};
    add(o, 'Body', { p: [0, -0.02, 0], r: [8 * sin(w), 0, 12 * sin(w + 1)], s: [1.06, 0.94, 1.06] });
    add(o, 'HandL', { p: [0, -0.14, 0] }); add(o, 'HandR', { p: [0, -0.14, 0] }); add(o, 'Tail', { r: [0, 0, 14 * sin(w)] });
    add(o, 'Stun_Stars', { s: 1000, r: [0, 300 * t, 0] });
    return wisps(o, t, 0.4); } },
  DEATH: { dur: 0.6, loop: false, f: (t) => { const k = ease(clamp01(t / 0.6)), o = {};
    add(o, 'Body', { p: [0, 0.5 * k, 0], r: [0, 360 * k, 0], s: Math.max(0.01, 1 - k) });
    return wisps(o, t, 1 + 6 * k, k); } },
};
const LABELS = { IDLE: 'Attente', MOVE: 'Déplacement', WINDUP: 'Annonce du coup', ATTACK: 'Bond', HURT: 'Coup reçu', STUN: 'Étourdi', DEATH: 'Disparition' };
const MOVES = { WINDUP: { signal: 'il gonfle, tremble, ses yeux virent au rouge, ses mains se lèvent' }, ATTACK: { frappe_s: 0.14, portee_m: 0.9, zone: 'devant lui' } };

export const model = { id: 'brumelin', file: 'Brumelin', name: 'Brumelin', subtitle: 'créature de l’Île de l’Aube', PALETTE, REST, JOINTS, build, ANIMS, LABELS, MOVES,
  ignore: [['Hand.', 'Body']] };

/* ---------- vue de jeu : contrat de js/world/creatures.js ---------- */
export function createView() {
  return creatureView(model, (s, a) => {
    if (s.dead) return a.at('DEATH', s.dead);
    let pose = s.stun ? a.loop('STUN') : s.move ? a.loop('MOVE') : a.loop('IDLE');
    if (s.wind) pose = blend(pose, a.at('WINDUP', s.wind), Math.min(1, s.wind * 3));
    if (s.attack) pose = a.at('ATTACK', s.attack);
    if (s.hurt && !s.attack) pose = blend(pose, a.at('HURT', 1 - s.hurt), 1);
    return pose;
  }, { mat: (nodes) => { const m = nodes.Body.material; m.emissive = new THREE.Color('#3a2a80'); return m; } });
}
