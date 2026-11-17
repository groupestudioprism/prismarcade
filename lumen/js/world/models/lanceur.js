/* =========================================================
   LUMEN — Lance-épines : plante-bulbe sur quatre pattes-racines, tête-bouton à bouche-canon (Île de l'Aube).
   « Il crache des épines de loin. Approche-toi vite. » Comportement : garde ses distances et tire.
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Hauteur ≈ 1,1 m, rayon de jeu 0,5 m.
   Bouche (départ du projectile) : axe +Z, hauteur 0,80 m, lèvre à z ≈ 0,47 m.
   Les pattes sont posées par cinématique inverse (model.finish) : les animations ne donnent que la
   position des pieds (pseudo-articulations FootFL… en écart, repère de la racine).
   ========================================================= */
import { THREE, V, T, prism, gem, loft, disc, slab, part, place, materials, lighten, darken, keyed, add, blend, ease, clamp01, creatureView } from '../kit3d.js';

const PALETTE = { bulb: '#9CC04A', bulbLight: '#C6E06A', head: '#6FAE4A', headLight: '#9AD06A', leaf: '#2F8F5A', leafLight: '#55B878', root: '#8A5B3C', rootLight: '#B88458',
  petal: '#D9486E', petalLight: '#F47C9A', spine: '#F6E6B8', mouth: '#3A1F2A', eye: '#FFFFFF', pupil: '#1B1238', lid: '#3F7A34', angry: '#FF5A6A', glow: '#FFCF7A', star: '#FFE48A' };

/* ---------- pattes : deux segments, cinématique inverse dans le plan vertical de la patte ---------- */
const R2D = 180 / Math.PI, L1 = 0.22, L2 = 0.38, FOOT_Y = 0.014;
const LEGS = { FL: 45, FR: -45, BL: 135, BR: -135 };            // azimut (degrés) : 0 = +Z (avant), 90 = +X (gauche de la créature)
const BODY_P = [0, 0.34, 0];
const hipOf = (az) => V(Math.sin(az / R2D) * 0.17, -0.04, Math.cos(az / R2D) * 0.17);       // repère du corps
const footOf = (az) => V(Math.sin(az / R2D) * 0.46, FOOT_Y, Math.cos(az / R2D) * 0.46);     // repère de la racine
function solveLeg(u, y) {   // cible (distance horizontale u, hauteur y) depuis la hanche → inclinaisons (degrés) de la cuisse et du tibia
  const D = Math.hypot(u, y) || 1e-6, d = Math.min(L1 + L2 - 0.004, Math.max(L2 - L1 + 0.02, D)), tu = u * d / D, ty = y * d / D;
  const eU = Math.atan2(ty, tu) + Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const eS = Math.atan2(ty - L1 * Math.sin(eU), tu - L1 * Math.cos(eU));
  return { up: -eU * R2D, shin: (eU - eS) * R2D };
}
const wrap = (a) => ((a + 540) % 360) - 180;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function legAngles(pose, L) {   // angles absolus (lacet de la hanche, cuisse, tibia) pour la pose donnée
  const b = pose.Body || {}, bp = b.p || [0, 0, 0], br = b.r || [0, 0, 0], bs = Array.isArray(b.s) ? b.s : [b.s ?? 1, b.s ?? 1, b.s ?? 1];
  _m.compose(_p.set(BODY_P[0] + bp[0], BODY_P[1] + bp[1], BODY_P[2] + bp[2]), _q.setFromEuler(_e.set(br[0] / R2D, br[1] / R2D, br[2] / R2D, 'XYZ')), _s.set(bs[0], bs[1], bs[2])).invert();
  const f = pose['Foot' + L], fp = (f && f.p) || [0, 0, 0], q = footOf(LEGS[L]); q.x += fp[0]; q.y += fp[1]; q.z += fp[2];
  q.applyMatrix4(_m).sub(hipOf(LEGS[L]));
  const a = solveLeg(Math.hypot(q.x, q.z), q.y);
  return { yaw: Math.atan2(q.x, q.z) * R2D, up: a.up, shin: a.shin };
}

const REST = {
  Root: { p: [0, 0, 0], r: [0, 0, 0] },
  Body: { p: BODY_P, r: [0, 0, 0] },
  Collar: { p: [0, 0, 0], r: [0, 0, 0] },
  Neck: { p: [0, 0.13, 0.02], r: [0, 0, 0] },
  Head: { p: [0, 0.13, 0.06], r: [0, 0, 0] },
  Corolla: { p: [0, 0.2, 0.25], r: [0, 0, 0] },
  Mouth_Glow: { p: [0, 0.2, 0.3], r: [0, 0, 0], s: 0.001 },
  Eyes_Angry: { p: [0, 0.3, 0.06], r: [0, 0, 0], s: 0.001 }, Eyes_Shut: { p: [0, 0.3, 0.06], r: [0, 0, 0], s: 0.001 },
  Tail: { p: [0, -0.09, -0.2], r: [0, 0, 0] },
  Stun_Stars: { p: [0, 0.93, 0.08], r: [0, 0, 0], s: 0.001 },
};
Object.keys(LEGS).forEach((L) => { const h = hipOf(LEGS[L]), a = legAngles({}, L);
  REST['Hip' + L] = { p: [h.x, h.y, h.z], r: [0, a.yaw, 0] }; REST['Leg' + L] = { p: [0, 0, 0], r: [a.up, 0, 0] }; REST['Shin' + L] = { p: [0, 0, L1], r: [a.shin, 0, 0] }; });
const JOINTS = Object.keys(REST);
const HIDDEN = ['Eyes_Angry', 'Eyes_Shut', 'Stun_Stars'];   // pièces cachées : tout ou rien (pas d'échelle intermédiaire)

/* correcteur : pose les pattes sur leurs cibles et rend les pièces cachées binaires */
function finish(d) {
  Object.keys(LEGS).forEach((L) => { const a = legAngles(d, L), z = [0, 0, 0];
    d['Hip' + L] = { r: [0, wrap(a.yaw - REST['Hip' + L].r[1]), 0], p: z, s: 1 };
    d['Leg' + L] = { r: [a.up - REST['Leg' + L].r[0], 0, 0], p: z, s: 1 };
    d['Shin' + L] = { r: [a.shin - REST['Shin' + L].r[0], 0, 0], p: z, s: 1 }; });
  HIDDEN.forEach((j) => { if (d[j] && !Array.isArray(d[j].s)) d[j].s = (d[j].s ?? 1) >= 400 ? 1000 : 1; });
  return d;
}

/* ---------- géométrie ---------- */
/* épine : cône facetté de base « at », pointé vers « dir », légèrement enfoncé dans son support */
function spike(at, dir, h, r, sink = 0.02, n = 5) {
  const d = dir.clone().normalize(), g = T(prism(0.004, r, h, n), 0, h / 2 - sink, 0);
  g.applyMatrix4(new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d), V(1, 1, 1))); return g;
}
/* feuille anguleuse : fer de lance à arête centrale, le long de +Y, arête vers ±Z */
const spear = (len, w, th, wide = 0.42) => loft([{ y: 0, rx: w * 0.4, rz: th * 0.6 }, { y: len * wide, rx: w, rz: th }, { y: len, rx: 0.004, rz: 0.004 }], 4, { phase: 0 });

function build(pal = PALETTE) {
  const P = pal, M = materials('M_LanceEpines'), nodes = {};
  const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
  const root = new THREE.Object3D(); root.name = 'Root'; nodes.Root = root;
  const spineC = [P.spine, lighten(P.spine, 0.5)];

  /* Corps : bulbe-navet facetté, deux épines sur le dos */
  const bulb = loft([{ y: -0.2, rx: 0.09, rz: 0.09 }, { y: -0.13, rx: 0.2, rz: 0.2 }, { y: -0.02, rx: 0.25, rz: 0.25 }, { y: 0.08, rx: 0.21, rz: 0.21 }, { y: 0.16, rx: 0.09, rz: 0.09 }], 8, { n: 2.2 });
  const thorns = [spike(V(0, 0.11, -0.165), V(0, 0.8, -0.6), 0.13, 0.034), spike(V(0, 0.05, -0.215), V(0, 0.55, -0.85), 0.12, 0.032)];
  const body = mk('Body', [[bulb, P.bulb, P.bulbLight], ...thorns.map((g) => [g, ...spineC])]);
  root.add(body);

  /* Col : six feuilles anguleuses en étoile autour du cou (aucune dans l'axe du dos : place aux épines) */
  const leaves = [32, -32, 90, -90, 152, -152].map((az) => T(T(spear(Math.abs(az) < 45 ? 0.24 : 0.34, 0.07, 0.028), 0, 0.146, 0.095, Math.abs(az) < 45 ? 88 : 70, 0, 0), 0, 0, 0, 0, az, 0));
  body.add(mk('Collar', leaves.map((g) => [g, P.leaf, P.leafLight])));

  /* Queue : petite tige et pousse à deux feuilles */
  const tailDir = V(0, 0.5, -0.866), tip = tailDir.clone().multiplyScalar(0.27);
  const stem = T(loft([{ y: -0.04, rx: 0.04, rz: 0.04 }, { y: 0.12, rx: 0.032, rz: 0.032 }, { y: 0.29, rx: 0.026, rz: 0.026 }], 5), 0, 0, 0, -60, 0, 0);
  const bud = spike(tip, tailDir, 0.14, 0.05, 0.01, 5);
  const sprout = [1, -1].map((s) => { const g = T(spear(0.2, 0.05, 0.018), 0, 0, 0, -25, 0, -s * 52); return T(g, tip.x, tip.y, tip.z); });
  body.add(mk('Tail', [[stem, P.head, P.headLight], [bud, P.petal, P.petalLight], ...sprout.map((g) => [g, P.leaf, P.leafLight])]));

  /* Cou */
  const neck = mk('Neck', [[loft([{ y: -0.04, rx: 0.046, rz: 0.046 }, { y: 0.05, rx: 0.04, rz: 0.04, cz: 0.023 }, { y: 0.15, rx: 0.046, rz: 0.046, cz: 0.069 }], 6), P.head, P.headLight]]);
  body.add(neck);

  /* Tête-bouton : bourgeon facetté, canon de la bouche, tourelles des yeux, crête d'épines */
  const HC = [0, 0.2, 0.02];   // centre de la tête (repère de la tête) ; l'axe de la bouche passe par ce centre
  const bud0 = T(loft([{ y: -0.2, rx: 0.07, rz: 0.07 }, { y: -0.12, rx: 0.19, rz: 0.18 }, { y: 0, rx: 0.26, rz: 0.25 }, { y: 0.11, rx: 0.22, rz: 0.21 }, { y: 0.19, rx: 0.1, rz: 0.1 }, { y: 0.215, rx: 0.03, rz: 0.03 }], 8, { n: 2.3 }), ...HC);
  const snoutR = [{ y: 0, rx: 0.13, rz: 0.13 }, { y: 0.12, rx: 0.11, rz: 0.11 }, { y: 0.175, rx: 0.135, rz: 0.135 }, { y: 0.19, rx: 0.1, rz: 0.1 }];
  const toMouth = (g) => T(g, 0, HC[1], 0.2, 90, 0, 0);
  const snout = toMouth(loft(snoutR, 8, { capTop: false })), snoutSolid = toMouth(loft(snoutR, 8));
  const cavity = toMouth(T(loft([{ y: 0.1, rx: 0.045, rz: 0.045 }, { y: 0.19, rx: 0.1, rz: 0.1 }], 8, { capTop: false }), 0, 0, 0, 0, 0, 0, -1, 1, 1));   // intérieur du canon (faces retournées)
  const turret = (s) => T(loft([{ y: -0.15, rx: 0.03, rz: 0.03 }, { y: -0.07, rx: 0.097, rz: 0.097 }, { y: 0.1, rx: 0.086, rz: 0.086 }], 8), s * 0.125, 0.32, 0.06, 50, 0, -s * 12);
  const onEye = (g, s, off) => T(T(g, 0, 0.1 + off, 0, -90, 0, 0), s * 0.125, 0.32, 0.06, 50, 0, -s * 12);   // pose une forme plate sur la face d'une tourelle
  const crest = [
    spike(V(0, 0.385, -0.05), V(0, 0.9, -0.42), 0.17, 0.04), spike(V(0, 0.32, -0.175), V(0, 0.6, -0.8), 0.16, 0.04), spike(V(0, 0.215, -0.225), V(0, 0.12, -1), 0.14, 0.036),
    ...[1, -1].map((s) => spike(V(s * 0.15, 0.3, -0.12), V(s * 0.6, 0.6, -0.55), 0.12, 0.032)),
  ];
  const headSolid = [bud0, snoutSolid, turret(1), turret(-1), ...crest];
  const face = [[bud0, P.head, P.headLight], [snout, P.petal, P.petalLight], [cavity, P.mouth, P.mouth], [turret(1), P.head, P.headLight], [turret(-1), P.head, P.headLight], ...crest.map((g) => [g, ...spineC])];
  [-1, 1].forEach((s) => {
    face.push([onEye(disc(0.076, 0.076, 8, Math.PI / 8), s, 0.003), P.eye, P.eye]);
    face.push([onEye(T(disc(0.044, 0.05, 8, Math.PI / 8), -s * 0.008, -0.014, 0), s, 0.006), P.pupil, P.pupil]);
    face.push([onEye(T(disc(0.015, 0.015, 6), s * 0.012, 0.012, 0), s, 0.009), P.eye, P.eye]);
  });
  const head = mk('Head', face, { solid: headSolid });
  neck.add(head);

  /* Corolle : six pétales anguleux autour du canon (s'ouvre et tourne quand il aspire) */
  const petals = [0, 1, 2, 3, 4, 5].map((k) => T(T(spear(0.262, 0.064, 0.02, 0.5), 0, 0.06, -0.012, 25, 0, 0), 0, 0, 0, 0, 0, k * 60));
  head.add(mk('Corolla', petals.map((g) => [g, P.petal, P.petalLight])));

  /* Bouche lumineuse (cachée au repos) : lueur dans le canon et épine prête à partir */
  const glowM = M.glow('Mouth', P.glow, 0.8);
  head.add(mk('Mouth_Glow', [[T(disc(0.092, 0.092, 8, Math.PI / 8), 0, 0, 0.082), P.glow, P.glow], [T(gem(1), 0, 0, 0.06, 0, 0, 0, 0.07, 0.07, 0.08), '#FFF2C0', '#FFFFFF'],
    [T(prism(0.003, 0.038, 0.17, 5), 0, 0, 0.15, 90, 0, 0), '#FFE9A8', '#FFF6D8']], { mat: glowM, outline: false }));

  /* Regard en colère (annonce du tir) et yeux fermés (coup reçu, étourdi, clignement) : cachés au repos */
  const arc = (s, a0, a1, r, n = 5) => Array.from({ length: n }, (_, i) => { const a = (a0 + (a1 - a0) * i / (n - 1)) / R2D; return [Math.cos(a) * r * s, Math.sin(a) * r]; });
  const angry = [], lidsA = [], shut = [], shutLine = [];
  [-1, 1].forEach((s) => {
    angry.push(onEye(T(disc(0.046, 0.052, 8, Math.PI / 8), -s * 0.008, -0.014, 0), s, 0.011));
    lidsA.push(onEye(slab(arc(-s, 20, 172, 0.084), 0.004), s, 0.014));
    shut.push(onEye(disc(0.082, 0.082, 8, Math.PI / 8), s, 0.012));
    shutLine.push(onEye(slab([[-0.07, 0.012], [0, -0.014], [0.07, 0.012], [0.07, -0.008], [0, -0.034], [-0.07, -0.008]], 0.004), s, 0.016));
  });
  [...angry, ...lidsA, ...shut, ...shutLine].forEach((g) => T(g, ...REST.Eyes_Shut.p.map((v) => -v)));   // géométrie ramenée au pivot de la pièce
  head.add(mk('Eyes_Angry', [...angry.map((g) => [g, P.angry, P.angry]), ...lidsA.map((g) => [g, P.lid, P.lid])], { mat: M.glow('Angry', P.angry, 0.8), outline: false }));
  head.add(mk('Eyes_Shut', [...shut.map((g) => [g, P.lid, P.lid]), ...shutLine.map((g) => [g, P.pupil, P.pupil])], { mat: M.glow('Lids', P.lid, 0.8), outline: false }));

  /* Pattes-racines : hanche (lacet), cuisse, tibia à ergot ; le long de +Z local */
  Object.keys(LEGS).forEach((L) => {
    const hip = new THREE.Object3D(); hip.name = 'Hip' + L; nodes['Hip' + L] = hip; body.add(place(hip, REST['Hip' + L]));
    const leg = mk('Leg' + L, [[T(loft([{ y: -0.07, rx: 0.05, rz: 0.05 }, { y: 0.22, rx: 0.04, rz: 0.04 }], 6), 0, 0, 0, 90, 0, 0), P.root, P.rootLight]]);
    const shinG = T(loft([{ y: -0.04, rx: 0.02, rz: 0.02 }, { y: 0, rx: 0.058, rz: 0.058 }, { y: 0.07, rx: 0.04, rz: 0.04 }, { y: 0.29, rx: 0.028, rz: 0.028 }, { y: 0.35, rx: 0.036, rz: 0.036 }, { y: 0.38, rx: 0.018, rz: 0.018 }], 6), 0, 0, 0, 90, 0, 0);
    const spur = spike(V(0, 0.04, 0.03), V(0, 1, -0.25), 0.09, 0.026, 0.012);
    const shin = mk('Shin' + L, [[shinG, P.root, P.rootLight], [spur, ...spineC]]);
    hip.add(leg); leg.add(shin);
  });

  /* Étoiles d'étourdissement, cachées au repos */
  const stars = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return [T(gem(1), Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34, 0, -a * R2D, 0, 0.07, 0.07, 0.03), P.star, '#FFFFFF']; });
  body.add(mk('Stun_Stars', stars, { mat: M.glow('Stars', P.star, 0.7), outline: false }));
  return { root, nodes, materials: M };
}

/* ---------- animations (écarts par rapport au repos) ---------- */
const sin = Math.sin, PI = Math.PI;
const feet = (o, f) => { Object.keys(f).forEach((L) => add(o, 'Foot' + L, { p: f[L] })); return o; };
const splay = (o, k) => feet(o, Object.fromEntries(Object.keys(LEGS).map((L) => [L, [Math.sin(LEGS[L] / R2D) * k, 0, Math.cos(LEGS[L] / R2D) * k]])));
const WIND_END = { Body: { p: [0, -0.075, -0.04], r: [-4, 0, 0] }, Neck: { r: [-18, 0, 0] }, Head: { r: [15, 0, 0], s: 1.15 }, Corolla: { s: 1.3, r: [0, 0, 120] }, Mouth_Glow: { s: 1000 }, Tail: { r: [20, 0, 0] } };
const ANIMS = {
  IDLE: { dur: 2.4, loop: true, f: (t) => { const w = 2 * PI * t / 2.4, o = {};
    add(o, 'Body', { p: [0, 0.02 * sin(w), 0], r: [1.5 * sin(w), 0, 0] });
    add(o, 'Neck', { r: [3 * sin(w - 0.6), 0, 0] });
    add(o, 'Head', { r: [-2 * sin(w - 0.6), 4 * sin(w), 3.5 * sin(w)], s: 1 + 0.03 * sin(2 * w) });
    add(o, 'Corolla', { s: 1 + 0.04 * sin(2 * w + 1), r: [0, 0, 6 * sin(w)] });
    add(o, 'Tail', { r: [5 * sin(2 * w), 14 * sin(w), 0] });
    if (t > 1.9 && t < 2.02) add(o, 'Eyes_Shut', { s: 1000 });
    return o; } },
  MOVE: { dur: 0.4, loop: true, f: (t) => { const w = 2 * PI * t / 0.4, o = {};
    const step = (ph) => [0, 0.09 * Math.max(0, sin(ph)), -0.08 * Math.cos(ph)];
    feet(o, { FL: step(w), BR: step(w), FR: step(w + PI), BL: step(w + PI) });
    add(o, 'Body', { p: [0, 0.03 * Math.abs(sin(w)), 0], r: [6, 0, 2.5 * sin(w)] });
    add(o, 'Neck', { r: [-4 + 3 * sin(2 * w), 0, 0] });
    add(o, 'Head', { r: [-2, 0, -2.5 * sin(w)] });
    add(o, 'Corolla', { s: 1 + 0.03 * sin(2 * w) });
    add(o, 'Tail', { r: [-8 + 8 * sin(2 * w), 10 * sin(w), 0] });
    return o; } },
  WINDUP: { dur: 0.5, loop: false, f: (t) => { const k = ease(clamp01(t / 0.5)), o = {};
    add(o, 'Body', { p: [0, -0.075 * k, -0.04 * k], r: [-4 * k, 0, 0] });
    add(o, 'Neck', { r: [-18 * k, 0, 0] });
    add(o, 'Head', { r: [15 * k, 0, 2 * k * sin(t * 60)], s: 1 + 0.15 * k });
    add(o, 'Corolla', { s: 1 + 0.3 * k, r: [0, 0, 120 * k * k] });
    add(o, 'Mouth_Glow', { s: k < 0.04 ? 1 : 1000 * (0.3 + 0.7 * k) * (1 + 0.06 * k * sin(t * 50)) });
    if (k > 0.12) add(o, 'Eyes_Angry', { s: 1000 });
    add(o, 'Tail', { r: [20 * k, 0, 0] });
    return o; } },
  ATTACK: { dur: 0.25, loop: false, f: (t) => { const o = keyed([
      { t: 0, pose: WIND_END },
      { t: 0.05, pose: { Body: { p: [0, -0.02, -0.13], r: [-10, 0, 0] }, Neck: { r: [-12, 0, 0] }, Head: { r: [-6, 0, 0], s: 0.94 }, Corolla: { s: 1.45, r: [0, 0, 120] }, Mouth_Glow: { s: 1500 }, Tail: { r: [-28, 0, 0] }, FootFL: { p: [0, 0.05, -0.02] }, FootFR: { p: [0, 0.05, -0.02] } } },
      { t: 0.09, pose: { Body: { p: [0, -0.01, -0.12], r: [-8, 0, 0] }, Neck: { r: [-8, 0, 0] }, Head: { r: [-4, 0, 0], s: 0.95 }, Corolla: { s: 1.25, r: [0, 0, 120] }, Tail: { r: [-20, 0, 0] }, FootFL: { p: [0, 0.02, -0.01] }, FootFR: { p: [0, 0.02, -0.01] } } },
      { t: 0.16, pose: { Body: { p: [0, 0, -0.05], r: [-2, 0, 0] }, Neck: { r: [7, 0, 0] }, Head: { r: [3, 0, 0], s: 1.02 }, Corolla: { s: 0.92, r: [0, 0, 120] }, Tail: { r: [8, 0, 0] } } },
      { t: 0.25, pose: { Corolla: { r: [0, 0, 120] } } }])(t);
    if (t < 0.13) add(o, 'Eyes_Angry', { s: 1000 });
    return o; } },
  HURT: { dur: 0.3, loop: false, f: (t) => { const o = keyed([{ t: 0, pose: {} },
      { t: 0.07, pose: { Body: { p: [0, 0.02, -0.1], r: [-12, 0, 6] }, Neck: { r: [-18, 0, 0] }, Head: { r: [-10, 0, 8], s: 1.06 }, Corolla: { s: 0.75 }, Tail: { r: [25, 0, 0] }, FootFL: { p: [0, 0.05, 0] }, FootFR: { p: [0, 0.03, 0] } } },
      { t: 0.3, pose: {} }])(t);
    if (t > 0.02 && t < 0.24) add(o, 'Eyes_Shut', { s: 1000 });
    return o; } },
  STUN: { dur: 1.2, loop: true, f: (t) => { const w = 2 * PI * t / 1.2, o = {};
    splay(o, 0.04);
    add(o, 'Body', { p: [0, -0.04, 0], r: [0, 0, 6 * sin(w)] });
    add(o, 'Neck', { r: [12 + 4 * sin(2 * w), 0, 10 * sin(w + 1)] });
    add(o, 'Head', { r: [8, 0, 12 * sin(w + 0.5)] });
    add(o, 'Corolla', { s: 0.85 });
    add(o, 'Tail', { r: [-20, 0, 10 * sin(w)] });
    add(o, 'Eyes_Shut', { s: 1000 });
    add(o, 'Stun_Stars', { s: 1000, r: [0, 300 * t, 0] });
    return o; } },
  DEATH: { dur: 0.6, loop: false, f: (t) => { const a = ease(clamp01(t / 0.3)), b = ease(clamp01((t - 0.22) / 0.38)), o = {};
    splay(o, 0.05 * a);
    add(o, 'Root', { s: Math.max(0.01, 1 - b) });
    add(o, 'Body', { p: [0, -0.1 * a, 0], r: [4 * a, 0, 0] });
    add(o, 'Neck', { r: [18 * a, 0, 0] });
    add(o, 'Head', { r: [16 * a, 0, 6 * a], s: 1 - 0.08 * a });
    add(o, 'Corolla', { s: 1 - 0.35 * a });
    add(o, 'Tail', { r: [-28 * a, 0, 0] });
    if (t > 0.03) add(o, 'Eyes_Shut', { s: 1000 });
    return o; } },
};
const LABELS = { IDLE: 'Attente', MOVE: 'Trot sur ses racines', WINDUP: 'Aspiration', ATTACK: 'Crachat d’épine', HURT: 'Coup reçu', STUN: 'Étourdi', DEATH: 'Flétrissement' };
const MOVES = { WINDUP: { signal: 'il s’accroupit, la tête recule et gonfle, la corolle s’ouvre en tournant, la bouche s’éclaire, les yeux virent au rouge' },
  ATTACK: { tir_s: 0, bouche_m: [0, 0.8, 0.47], direction: '+Z', zone: 'projectile en ligne droite devant lui' } };

export const model = { id: 'lanceur', file: 'LanceEpines', name: 'Lance-épines', subtitle: 'créature de l’Île de l’Aube', PALETTE, REST, JOINTS, build, ANIMS, LABELS, MOVES, finish,
  ignore: [] };

/* ---------- vue de jeu : contrat de js/world/creatures.js ---------- */
const s3 = (s) => (Array.isArray(s) ? s : [s ?? 1, s ?? 1, s ?? 1]);
function layer(base, over) {   // ajoute une pose (écarts) par-dessus une autre
  Object.keys(over).forEach((j) => { const v = over[j]; add(base, j, { r: v.r, p: v.p, s: Array.isArray(v.s) ? s3(v.s) : (v.s ?? 1) }); });
  return base;
}
export function createView() {
  let mv = 0;
  return creatureView(model, (s, a) => {
    if (s.dead) return a.at('DEATH', s.dead);
    mv += ((s.move ? Math.min(1, s.move) : 0) - mv) * (1 - Math.exp(-14 * a.dt));
    let pose = s.stun ? a.loop('STUN') : mv > 0.02 ? blend(a.loop('IDLE'), a.loop('MOVE'), mv) : a.loop('IDLE');
    if (s.wind) pose = blend(pose, a.at('WINDUP', s.wind), Math.min(1, s.wind * 4));
    if (s.attack) pose = blend(a.at('ATTACK', s.attack), pose, ease(clamp01((s.attack - 0.7) / 0.3)));
    if (s.hurt) pose = layer(pose, a.at('HURT', 1 - s.hurt));
    return pose;
  }, { mat: (nodes) => { const m = nodes.Body.material; m.emissive = new THREE.Color('#2a4a1a'); return m; } });
}
