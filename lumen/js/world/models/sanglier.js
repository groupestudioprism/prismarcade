/* =========================================================
   LUMEN — Sanglier de brume : quadrupède trapu qui gratte le sol puis charge (Île de l'Aube).
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Longueur ≈ 1,7 m, hauteur ≈ 1,3 m, rayon de jeu 0,7 m.
   Pattes : 2 segments + sabot, posées par cinématique inverse (pseudo-articulations « FootXX » = cible de la semelle,
   en mètres dans le repère de Root, r[0] = tangage du sabot). `finish` convertit ces cibles en angles.
   ========================================================= */
import { THREE, V, T, D2R, Soup, gem, loft, disc, part, place, materials, lighten, keyed, add, blend, ease, clamp01, jointMat, creatureView } from '../kit3d.js';

const PALETTE = { body: '#7C68C8', bodyLight: '#A996EC', leg: '#4E3D94', legLight: '#6B58B8', crest: '#3B2A80', crestLight: '#6F52CC', jaw: '#5E4BA8', snout: '#E0A8DC', snoutLight: '#F2C6EC', nostril: '#3A2360',
  tusk: '#F3EAD6', tuskLight: '#FFFDF4', hoof: '#2A2140', hoofLight: '#44386A', eye: '#FFFFFF', pupil: '#1B1238', earIn: '#C79BE8', wisp: '#C9B6FF', angry: '#FF4A5A', star: '#FFE48A' };

/* ---------- pattes : géométrie de la cinématique ---------- */
const L1 = 0.22, L2 = 0.21, HOOF = 0.1;                       // cuisse, canon, hauteur de la cheville
const LEGS = ['FL', 'FR', 'BL', 'BR'];
const HIP = { FL: [0.31, -0.16, 0.22], FR: [-0.31, -0.16, 0.22], BL: [0.3, -0.16, -0.38], BR: [-0.3, -0.16, -0.38] };   // repère du corps
const FOOT0 = { FL: [0.33, 0, 0.25], FR: [-0.33, 0, 0.25], BL: [0.32, 0, -0.44], BR: [-0.32, 0, -0.44] };                   // semelles au repos (repère de Root)

const REST = {
  Root: { p: [0, 0, 0], r: [0, 0, 0] },
  Body: { p: [0, 0.66, 0], r: [0, 0, 0] },
  Crest: { p: [0, 0.32, 0], r: [0, 0, 0] },
  Tail: { p: [0, 0.1, -0.6], r: [0, 0, 0] }, Tail_Wisp: { p: [0, 0.33, -0.08], r: [0, 0, 0] },
  Head: { p: [0, -0.02, 0.5], r: [12, 0, 0] },
  Jaw: { p: [0, -0.17, 0.18], r: [0, 0, 0] },
  EarL: { p: [0.215, 0.205, 0.08], r: [-18, 0, -38] }, EarR: { p: [-0.215, 0.205, 0.08], r: [-18, 0, 38] },
  Eyes_Angry: { p: [0, 0, 0.14], r: [0, 0, 0], s: 0.001 }, Brows_Angry: { p: [0, 0, 0.14], r: [0, 0, 0], s: 0.001 }, Eyes_Dazed: { p: [0, 0, 0.14], r: [0, 0, 0], s: 0.001 },
  Snort: { p: [0, -0.06, 0.58], r: [0, 0, 0], s: 0.001 },
  LegFL_Up: { p: HIP.FL, r: [0, 0, 0] }, LegFL_Low: { p: [0, -L1, 0], r: [0, 0, 0] }, HoofFL: { p: [0, -L2, 0], r: [0, 0, 0] },
  LegFR_Up: { p: HIP.FR, r: [0, 0, 0] }, LegFR_Low: { p: [0, -L1, 0], r: [0, 0, 0] }, HoofFR: { p: [0, -L2, 0], r: [0, 0, 0] },
  LegBL_Up: { p: HIP.BL, r: [0, 0, 0] }, LegBL_Low: { p: [0, -L1, 0], r: [0, 0, 0] }, HoofBL: { p: [0, -L2, 0], r: [0, 0, 0] },
  LegBR_Up: { p: HIP.BR, r: [0, 0, 0] }, LegBR_Low: { p: [0, -L1, 0], r: [0, 0, 0] }, HoofBR: { p: [0, -L2, 0], r: [0, 0, 0] },
  Stun_Stars: { p: [0, 1.3, 0.56], r: [0, 0, 0], s: 0.001 },
};
const JOINTS = Object.keys(REST);

/* Cinématique inverse d'une pose : angles absolus (degrés) des 12 articulations de pattes */
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = V(), _p = V();
function solveLegs(o) {
  const B = jointMat(REST, 'Body', o), Bi = B.clone().invert(), qB = new THREE.Quaternion(); B.decompose(_p, qB, _s);
  const out = {};
  for (const L of LEGS) {
    const f = o['Foot' + L] || {}, fp = f.p || [0, 0, 0], ph = (f.r ? f.r[0] : 0) * D2R, F = FOOT0[L], H = HIP[L];
    const d = V(F[0] + fp[0], F[1] + fp[1] + HOOF * Math.cos(ph), F[2] + fp[2] + HOOF * Math.sin(ph)).applyMatrix4(Bi).sub(V(H[0], H[1], H[2]));
    const D = Math.max(0.06, Math.min(L1 + L2 - 0.004, d.length())); d.setLength(D);
    const beta = Math.acos(Math.max(-1, Math.min(1, (D * D - L1 * L1 - L2 * L2) / (2 * L1 * L2))));       // genou vers l'avant
    const R = L1 + L2 * Math.cos(beta), gamma = Math.asin(Math.max(-0.95, Math.min(0.95, d.x / Math.max(0.02, R))));
    let alpha = Math.atan2(d.z, d.y) - Math.atan2(-L2 * Math.sin(beta), -Math.cos(gamma) * R);
    alpha = Math.atan2(Math.sin(alpha), Math.cos(alpha));
    const qU = new THREE.Quaternion().setFromEuler(_e.set(alpha, 0, gamma, 'XYZ')), qL = new THREE.Quaternion().setFromEuler(_e.set(beta, 0, 0, 'XYZ'));
    _q.copy(qB).multiply(qU).multiply(qL).invert().multiply(new THREE.Quaternion().setFromEuler(_e.set(ph, 0, 0, 'XYZ')));
    _e.setFromQuaternion(_q, 'XYZ');
    out['Leg' + L + '_Up'] = [alpha / D2R, 0, gamma / D2R]; out['Leg' + L + '_Low'] = [beta / D2R, 0, 0]; out['Hoof' + L] = [_e.x / D2R, _e.y / D2R, _e.z / D2R];
  }
  return out;
}
{ const a = solveLegs({}); for (const j in a) REST[j].r = a[j].map((v) => +v.toFixed(3)); }      // pose de repos : sabots au sol
function finish(o) {
  const a = solveLegs(o);
  for (const j in a) { const r = REST[j].r; o[j] = { r: [a[j][0] - r[0], a[j][1] - r[1], a[j][2] - r[2]], p: [0, 0, 0], s: 1 }; }
  return o;
}

/* ---------- aides de construction propres au modèle ---------- */
/* volume couché le long de Z : anneaux { z, w (demi-largeur), up, dn (haut, bas), y (centre) } */
const tube = (rings, N = 8, o = {}) => T(loft(rings.map((r) => ({ y: r.z, rx: r.w, rb: r.up, rf: r.dn, cz: -(r.y || 0) })), N, o), 0, 0, 0, 90, 0, 0);
/* lame de crête : aileron à section en losange, pointe couchée vers l'arrière */
const fin = (h, len, th, x, y, z) => T(loft([{ y: -0.05, rx: th, rz: len }, { y: h * 0.42, rx: th * 0.8, rz: len * 0.72, cz: -len * 0.3 }, { y: h, rx: 0.004, rz: 0.004, cz: -len * 1.05 }], 4, { phase: 0 }), x, y, z);
/* forme plate (face +Z) posée sur une surface au point visé, avec un « haut » imposé (stickOn ne le permet pas) */
function stick(target, g, from, dir, up, off = 0.004) {
  const probe = new THREE.Mesh(target, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); probe.updateMatrixWorld(true);
  const rc = new THREE.Raycaster(); rc.set(from, dir.clone().normalize()); const hit = rc.intersectObject(probe)[0];
  if (!hit) throw new Error('stick : le rayon ne touche pas la surface');
  const n = hit.face.normal.clone(); if (n.dot(dir) > 0) n.negate();
  const x = up.clone().cross(n).normalize(), y = n.clone().cross(x);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, n).setPosition(hit.point.clone().addScaledVector(n, off))); return g;
}
/* polygone plat convexe (face +Z) */
const flat = (pts) => { const S = new Soup(), c = V(pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length, 0); pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; S.tri(c, V(p[0], p[1], 0), V(q[0], q[1], 0), V(0, 0, 1)); }); return S.geo(); };

function build(pal = PALETTE) {
  const P = pal, M = materials('M_Sanglier'), nodes = {};
  const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
  const root = new THREE.Object3D(); root.name = 'Root'; nodes.Root = root;

  /* Corps : tonneau trapu, bosse aux épaules, croupe plus basse */
  const torso = () => tube([{ z: -0.64, w: 0.11, up: 0.1, dn: 0.1, y: 0.03 }, { z: -0.54, w: 0.28, up: 0.24, dn: 0.22, y: 0.01 }, { z: -0.28, w: 0.37, up: 0.32, dn: 0.29 }, { z: 0.04, w: 0.39, up: 0.4, dn: 0.3 }, { z: 0.3, w: 0.36, up: 0.38, dn: 0.28 }, { z: 0.46, w: 0.27, up: 0.28, dn: 0.22, y: -0.01 }, { z: 0.56, w: 0.12, up: 0.12, dn: 0.1, y: -0.02 }], 8, { n: 2.4 });
  const body = mk('Body', [[torso(), P.body, P.bodyLight]]);
  root.add(body);

  /* Crête dorsale : cinq lames sombres, de l'épaule à la croupe */
  const fins = [[0.24, 0.115, 0.055, 0.27, 0.385], [0.28, 0.125, 0.06, 0.05, 0.4], [0.24, 0.115, 0.055, -0.17, 0.345], [0.19, 0.1, 0.05, -0.36, 0.295], [0.13, 0.08, 0.045, -0.51, 0.245]];
  body.add(mk('Crest', fins.map(([h, len, th, z, top]) => [fin(h, len, th, 0, top - 0.32 - 0.01, z), P.crest, P.crestLight])));

  /* Queue de brume : petite mèche recourbée + feu follet */
  const tail = mk('Tail', [[loft([{ y: -0.05, rx: 0.055, rz: 0.055, cz: 0.03 }, { y: 0.06, rx: 0.065, rz: 0.065, cz: -0.06 }, { y: 0.15, rx: 0.045, rz: 0.045, cz: -0.1 }, { y: 0.22, rx: 0.004, rz: 0.004, cz: -0.05 }], 6), P.wisp, '#E4D8FF']]);
  body.add(tail);
  tail.add(mk('Tail_Wisp', [[T(gem(1), 0, 0, 0, 0, 0, 0, 0.04, 0.065, 0.04), P.wisp, '#FFFFFF']], { mat: M.glow('Wisp'), outline: false }));

  /* Tête : gros coin à joues larges, groin rose plat, mèche de crête entre les oreilles */
  const skull = () => tube([{ z: -0.06, w: 0.22, up: 0.22, dn: 0.2 }, { z: 0.07, w: 0.3, up: 0.29, dn: 0.24 }, { z: 0.25, w: 0.24, up: 0.21, dn: 0.19, y: -0.01 }, { z: 0.4, w: 0.165, up: 0.13, dn: 0.12, y: -0.05 }, { z: 0.52, w: 0.15, up: 0.115, dn: 0.115, y: -0.06 }], 8, { n: 2.4 });
  const groin = () => tube([{ z: 0.51, w: 0.168, up: 0.132, dn: 0.128, y: -0.06 }, { z: 0.565, w: 0.156, up: 0.12, dn: 0.118, y: -0.06 }], 8, { n: 2.4 });
  const tuft = () => fin(0.17, 0.09, 0.05, 0, 0.265, 0.1);
  const sk = skull(), gr = groin();
  const headP = [[sk, P.body, P.bodyLight], [gr, P.snout, P.snoutLight], [tuft(), P.crest, P.crestLight]];
  const onEye = (g, s, du, dv, off) => { const up = V(-s * 0.72, 0.69, 0).normalize(); return stick(sk, g, V(s * 0.75 + up.x * dv, 0.74 + up.y * dv, 0.15 + du), V(-s, -1, 0), up, off); };   // du : vers le groin, dv : vers le sommet du crâne
  const angry = [], brows = [], lids = [], Z0 = REST.Eyes_Angry.p[2];
  [-1, 1].forEach((s) => {
    headP.push([onEye(disc(0.09, 0.1, 8, Math.PI / 8), s, 0, 0, 0.003), P.pupil, P.pupil]);
    headP.push([onEye(disc(0.076, 0.086, 8, Math.PI / 8), s, 0, 0, 0.005), P.eye, P.eye]);
    headP.push([onEye(disc(0.046, 0.058, 8, Math.PI / 8), s, 0.014, -0.01, 0.007), P.pupil, P.pupil]);
    headP.push([onEye(disc(0.017, 0.017, 6), s, -0.008, 0.024, 0.01), P.eye, P.eye]);
    headP.push([stick(gr, disc(0.024, 0.035, 6), V(s * 0.06, -0.055, 2), V(0, 0, -1), V(0, 1, 0), 0.003), P.nostril, P.nostril]);
    angry.push([T(onEye(disc(0.05, 0.062, 8, Math.PI / 8), s, 0.014, -0.01, 0.012), 0, 0, -Z0), P.angry, P.angry]);
    brows.push([T(onEye(flat([[0.12, -0.035], [0.12, 0.025], [-0.08, 0.1], [-0.08, 0.05]].map(([du, dv]) => [-s * du, dv])), s, 0, 0, 0.014), 0, 0, -Z0), P.pupil, P.pupil]);
    lids.push([T(onEye(flat([[-0.094, -0.005], [0.094, -0.005], [0.088, 0.05], [0.045, 0.104], [-0.045, 0.104], [-0.088, 0.05]]), s, 0, 0, 0.014), 0, 0, -Z0), P.body, P.body]);
  });
  const head = mk('Head', headP, { solid: [skull(), groin(), tuft()] });
  body.add(head);
  head.add(mk('Eyes_Angry', angry, { mat: M.glow('Angry'), outline: false }));
  head.add(mk('Brows_Angry', brows, { outline: false }));
  head.add(mk('Eyes_Dazed', lids, { outline: false }));
  /* souffle de brume par les naseaux (annonce de la charge), caché au repos */
  head.add(mk('Snort', [-1, 1].map((s) => [T(gem(1), s * 0.075, 0, 0.09, 0, 0, 0, 0.045, 0.045, 0.085), P.wisp, '#FFFFFF']), { mat: M.glow('Snort'), outline: false }));

  /* Mâchoire articulée portant les défenses d'ivoire */
  const jawG = () => tube([{ z: -0.03, w: 0.1, up: 0.03, dn: 0.05 }, { z: 0.1, w: 0.14, up: 0.03, dn: 0.08 }, { z: 0.25, w: 0.115, up: 0.03, dn: 0.065 }, { z: 0.31, w: 0.06, up: 0.02, dn: 0.035 }], 6, { n: 2.4 });
  const tusk = (s) => loft([{ y: -0.035, rx: 0.048, rz: 0.048, cx: s * 0.14, cz: 0.17 }, { y: 0.07, rx: 0.044, rz: 0.044, cx: s * 0.2, cz: 0.195 }, { y: 0.17, rx: 0.03, rz: 0.03, cx: s * 0.235, cz: 0.19 }, { y: 0.255, rx: 0.004, rz: 0.004, cx: s * 0.225, cz: 0.15 }], 5);
  head.add(mk('Jaw', [[jawG(), P.jaw, lighten(P.jaw, 0.2)], [tusk(1), P.tusk, P.tuskLight], [tusk(-1), P.tusk, P.tuskLight]]));

  /* Oreilles */
  const ear = () => [[loft([{ y: -0.05, rx: 0.075, rz: 0.04 }, { y: 0.07, rx: 0.07, rz: 0.035 }, { y: 0.21, rx: 0.004, rz: 0.004 }], 4, { phase: 0 }), P.body, P.earIn]];
  head.add(mk('EarL', ear())); head.add(mk('EarR', ear()));

  /* Pattes : cuisse massive, canon sombre, sabot */
  LEGS.forEach((L) => {
    const up = mk('Leg' + L + '_Up', [[loft([{ y: -L1 - 0.045, rx: 0.07, rz: 0.074 }, { y: -L1 + 0.03, rx: 0.088, rz: 0.1 }, { y: -0.06, rx: 0.105, rz: 0.145 }, { y: 0.07, rx: 0.095, rz: 0.13 }, { y: 0.12, rx: 0.045, rz: 0.06 }], 6, { n: 2.3 }), P.body, P.bodyLight]]);
    const low = mk('Leg' + L + '_Low', [[loft([{ y: -L2 - 0.01, rx: 0.058, rz: 0.06 }, { y: -0.09, rx: 0.064, rz: 0.068 }, { y: 0.035, rx: 0.072, rz: 0.078 }], 6, { n: 2.3 }), P.leg, P.legLight]]);
    const hoof = mk('Hoof' + L, [[loft([{ y: -HOOF, rx: 0.09, rf: 0.115, rb: 0.078 }, { y: -0.035, rx: 0.08, rf: 0.095, rb: 0.072 }, { y: 0.02, rx: 0.064, rz: 0.066 }], 6, { n: 2.6 }), P.hoof, P.hoofLight]]);
    body.add(up); up.add(low); low.add(hoof);
  });

  /* Étoiles d'étourdissement, cachées au repos */
  const stars = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return [T(gem(1), Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36, 0, -a * 180 / Math.PI, 0, 0.08, 0.08, 0.035), P.star, '#FFFFFF']; });
  root.add(mk('Stun_Stars', stars, { mat: M.glow('Stars'), outline: false }));
  return { root, nodes, materials: M };
}

/* ---------- animations (écarts par rapport au repos) ---------- */
const sin = Math.sin, cos = Math.cos, PI = Math.PI, frac = (u) => u - Math.floor(u);
const foot = (o, L, x, y, z, pitch = 0) => add(o, 'Foot' + L, { p: [x, y, z], r: [pitch, 0, 0] });
/* un pas : appui (la semelle recule au sol) puis envol (elle revient en avant, levée) */
function step(o, L, u, S, lift, duty, zc = 0) {
  u = frac(u);
  if (u < duty) return foot(o, L, 0, 0, zc + S * (0.5 - u / duty));
  const v = (u - duty) / (1 - duty);
  return foot(o, L, 0, lift * sin(PI * v), zc + S * (-0.5 * cos(PI * v)), 34 * sin(2 * PI * v) * sin(PI * v));
}
const show = (o, j) => add(o, j, { s: 1000 });
const ANIMS = {
  IDLE: { dur: 2.4, loop: true, f: (t) => { const w = 2 * PI * t / 2.4, o = {};
    add(o, 'Body', { p: [0, 0.012 * sin(w), 0], r: [0.8 * sin(w), 0, 0] });
    add(o, 'Head', { r: [3 * sin(w - 0.6), 3 * sin(w / 1), 0] }); add(o, 'Jaw', { r: [2 + 2 * sin(w - 1), 0, 0] });
    add(o, 'EarL', { r: [0, 0, -5 * Math.max(0, sin(2 * w))] }); add(o, 'EarR', { r: [0, 0, 5 * Math.max(0, sin(2 * w + 1))] });
    add(o, 'Tail', { r: [8 * sin(2 * w), 0, 12 * sin(w)] }); add(o, 'Tail_Wisp', { p: [0, 0.03 * sin(2 * w), 0], r: [0, 150 * t, 0] });
    add(o, 'Crest', { s: [1, 1 + 0.04 * sin(w), 1] });
    return o; } },
  MOVE: { dur: 0.6, loop: true, f: (t) => { const u = t / 0.6, w = 2 * PI * u, o = {};
    step(o, 'FL', u, 0.26, 0.09, 0.55); step(o, 'BR', u + 0.06, 0.26, 0.09, 0.55); step(o, 'FR', u + 0.5, 0.26, 0.09, 0.55); step(o, 'BL', u + 0.56, 0.26, 0.09, 0.55);
    add(o, 'Body', { p: [0, 0.018 * sin(2 * w + 0.6), 0], r: [1.5 * sin(2 * w), 0, 2 * sin(w)] });
    add(o, 'Head', { r: [3 + 3 * sin(2 * w + 1.2), 0, -2 * sin(w)] }); add(o, 'Jaw', { r: [3, 0, 0] });
    add(o, 'EarL', { r: [-8 + 8 * sin(2 * w), 0, 0] }); add(o, 'EarR', { r: [-8 + 8 * sin(2 * w + 0.5), 0, 0] });
    add(o, 'Tail', { r: [-12 + 10 * sin(2 * w), 0, 14 * sin(w)] }); add(o, 'Tail_Wisp', { p: [0, 0.02 * sin(2 * w), 0], r: [0, 600 * u, 0] });
    return o; } },
  WINDUP: { dur: 0.85, loop: false, f: (t) => { const k = ease(clamp01(t / 0.2)), u = frac(t * 3.53), o = {}, on = 1 + 999 * clamp01(t / 0.08);
    /* la patte avant gauche gratte : la pointe du sabot racle vers l'arrière, puis la patte revient levée */
    if (u < 0.5) { const v = u / 0.5; foot(o, 'FL', 0, 0.04 * k, (0.17 - 0.3 * v) * k, 22 * k); }
    else { const v = (u - 0.5) / 0.5; foot(o, 'FL', 0.03 * k * sin(PI * v), (0.04 + 0.085 * sin(PI * v)) * k, (-0.13 + 0.3 * ease(v)) * k, 22 * k); }
    add(o, 'Body', { p: [0, -0.035 * k, -0.03 * k], r: [6 * k, 0, 1.2 * k * sin(t * 44)] });
    add(o, 'Head', { r: [26 * k + 3 * k * sin(2 * PI * u), 0, 0] }); add(o, 'Jaw', { r: [9 * k, 0, 0] });
    add(o, 'EarL', { r: [-30 * k, 0, 0] }); add(o, 'EarR', { r: [-30 * k, 0, 0] });
    add(o, 'Crest', { s: [1, 1 + 0.3 * k, 1] }); add(o, 'Tail', { r: [-25 * k, 0, 10 * k * sin(t * 30)] });
    add(o, 'Eyes_Angry', { s: on }); add(o, 'Brows_Angry', { s: on });
    add(o, 'Snort', { s: 1 + 999 * (0.35 + 0.65 * u) * clamp01(t / 0.08), p: [0, -0.05 * u, 0.1 * u] });
    return o; } },
  CHARGE: { dur: 0.4, loop: true, f: (t) => { const u = t / 0.4, w = 2 * PI * u, o = {};
    step(o, 'FL', u, 0.44, 0.15, 0.4, 0.05); step(o, 'FR', u + 0.1, 0.44, 0.15, 0.4, 0.05); step(o, 'BL', u + 0.5, 0.44, 0.15, 0.4, -0.02); step(o, 'BR', u + 0.6, 0.44, 0.15, 0.4, -0.02);
    add(o, 'Body', { p: [0, -0.05 + 0.03 * sin(w + 2.2), 0.04], r: [3 + 5 * sin(w + 0.6), 0, 0] });
    add(o, 'Head', { r: [14 - 4 * sin(w + 0.6), 0, 0] }); add(o, 'Jaw', { r: [7, 0, 0] });
    add(o, 'EarL', { r: [-38 + 6 * sin(2 * w), 0, 0] }); add(o, 'EarR', { r: [-38 + 6 * sin(2 * w + 1), 0, 0] });
    add(o, 'Crest', { s: [1, 1.3 + 0.05 * sin(2 * w), 1] }); add(o, 'Tail', { r: [-55 + 8 * sin(2 * w), 0, 0] });
    add(o, 'Tail_Wisp', { r: [0, 900 * u, 0] });
    show(o, 'Eyes_Angry'); show(o, 'Brows_Angry');
    return o; } },
  ATTACK: { dur: 0.4, loop: false, f: (t) => keyed([
      { t: 0, pose: {} },
      { t: 0.12, pose: { Body: { p: [0, -0.04, -0.07], r: [6, 0, 0] }, Head: { r: [30, 0, 0] }, Jaw: { r: [4, 0, 0] }, EarL: { r: [-30, 0, 0] }, EarR: { r: [-30, 0, 0] }, Eyes_Angry: { s: 1000 }, Brows_Angry: { s: 1000 }, Crest: { s: [1, 1.3, 1] } } },
      { t: 0.2, pose: { Body: { p: [0, -0.01, 0.12], r: [-7, 0, 0] }, Head: { r: [-30, 0, 0] }, Jaw: { r: [16, 0, 0] }, EarL: { r: [-40, 0, 0] }, EarR: { r: [-40, 0, 0] }, Tail: { r: [-40, 0, 0] }, Eyes_Angry: { s: 1000 }, Brows_Angry: { s: 1000 }, Crest: { s: [1, 1.3, 1] } } },
      { t: 0.27, pose: { Body: { p: [0, -0.01, 0.1], r: [-5, 0, 0] }, Head: { r: [-24, 0, 0] }, Jaw: { r: [12, 0, 0] }, EarL: { r: [-30, 0, 0] }, EarR: { r: [-30, 0, 0] }, Eyes_Angry: { s: 1000 }, Brows_Angry: { s: 1000 }, Crest: { s: [1, 1.2, 1] } } },
      { t: 0.4, pose: {} }])(t) },
  HURT: { dur: 0.3, loop: false, f: (t) => keyed([{ t: 0, pose: {} },
      { t: 0.07, pose: { Body: { p: [0, -0.04, -0.08], r: [-6, 0, 5] }, Head: { r: [-16, 0, 10] }, Jaw: { r: [14, 0, 0] }, EarL: { r: [-30, 0, -20] }, EarR: { r: [-30, 0, 20] }, Tail: { r: [-25, 0, 0] }, Eyes_Dazed: { s: 1000 } } },
      { t: 0.3, pose: {} }])(t) },
  STUN: { dur: 1.2, loop: true, f: (t) => { const w = 2 * PI * t / 1.2, o = {};
    add(o, 'Body', { p: [0, -0.184, -0.02], r: [-30, 0, 0] });
    foot(o, 'BL', 0.13, 0, 0.47); foot(o, 'BR', -0.13, 0, 0.47); foot(o, 'FL', 0.02, 0, 0.04); foot(o, 'FR', -0.02, 0, 0.04);
    add(o, 'Head', { r: [24 + 5 * sin(w), 9 * sin(w), 12 * sin(w + 1.2)] }); add(o, 'Jaw', { r: [15 + 3 * sin(2 * w), 0, 0] });
    add(o, 'EarL', { r: [10, 0, -30 + 8 * sin(w + 1.2)] }); add(o, 'EarR', { r: [10, 0, 30 + 8 * sin(w + 1.2)] });
    add(o, 'Tail', { r: [-35, 0, 10 * sin(w)] }); add(o, 'Crest', { s: [1, 0.85, 1] });
    show(o, 'Eyes_Dazed'); add(o, 'Stun_Stars', { s: 1000, r: [0, 300 * t, 0] });
    return o; } },
  RECOVER: { dur: 0.7, loop: false, f: (t) => keyed([
      { t: 0, pose: { Body: { p: [0, -0.08, -0.07], r: [-9, 0, 0] }, Head: { r: [-8, 0, 0] }, FootFL: { p: [0, 0, 0.13] }, FootFR: { p: [0, 0, 0.13] }, FootBL: { p: [0, 0, 0.08] }, FootBR: { p: [0, 0, 0.08] }, EarL: { r: [-30, 0, 0] }, EarR: { r: [-30, 0, 0] }, Tail: { r: [-30, 0, 0] } } },
      { t: 0.22, pose: { Body: { p: [0, -0.05, -0.03], r: [-4, 0, 0] }, Head: { r: [4, 14, 6] }, Jaw: { r: [8, 0, 0] }, FootFL: { p: [0, 0, 0.1] }, FootFR: { p: [0, 0, 0.1] }, FootBL: { p: [0, 0, 0.05] }, FootBR: { p: [0, 0, 0.05] } } },
      { t: 0.4, pose: { Body: { p: [0, -0.02, 0], r: [0, 0, 0] }, Head: { r: [4, -14, -6] }, Jaw: { r: [8, 0, 0] }, FootFL: { p: [0, 0.05, 0.05] }, FootFR: { p: [0, 0, 0.1] }, FootBL: { p: [0, 0, 0.05] }, FootBR: { p: [0, 0.04, 0.02] } } },
      { t: 0.55, pose: { Head: { r: [2, 6, 2] }, FootFR: { p: [0, 0.05, 0.05] }, FootBL: { p: [0, 0.04, 0.02] } } },
      { t: 0.7, pose: {} }])(t) },
  DEATH: { dur: 0.6, loop: false, f: (t) => { const a = ease(clamp01(t / 0.3)), b = ease(clamp01((t - 0.22) / 0.38)), o = {};
    add(o, 'Body', { p: [0, -0.2 * a, 0], r: [4 * a, 0, 4 * a] });
    foot(o, 'FL', 0.04 * a, 0, 0.07 * a); foot(o, 'FR', -0.03 * a, 0, 0.07 * a); foot(o, 'BL', 0.04 * a, 0, -0.05 * a); foot(o, 'BR', -0.03 * a, 0, -0.05 * a);
    add(o, 'Head', { r: [4 * a, 0, 8 * a] }); add(o, 'Jaw', { r: [6 * a, 0, 0] });
    add(o, 'EarL', { r: [0, 0, -30 * a] }); add(o, 'EarR', { r: [0, 0, 30 * a] }); add(o, 'Tail', { r: [-60 * a, 0, 0] }); add(o, 'Crest', { s: [1, 1 - 0.3 * a, 1] });
    add(o, 'Eyes_Dazed', { s: 1 + 999 * clamp01(t / 0.08) });
    add(o, 'Root', { r: [0, 200 * b, 0], s: Math.max(0.01, 1 - b) });
    return o; } },
};
const LABELS = { IDLE: 'Attente', MOVE: 'Trot', WINDUP: 'Il gratte le sol', CHARGE: 'Charge', ATTACK: 'Coup de tête', HURT: 'Coup reçu', STUN: 'Étourdi (assis)', RECOVER: 'Freinage après la charge', DEATH: 'Disparition' };
const MOVES = { WINDUP: { signal: 'tête baissée, patte avant gauche qui gratte le sol, regard rouge, crête hérissée, souffle par les naseaux', duree_s: 0.85 }, CHARGE: { zone: 'ligne droite devant lui', fin: 'étourdi s’il heurte un obstacle, sinon freinage' }, ATTACK: { frappe_s: 0.2, portee_m: 1.2, zone: 'devant lui' } };

export const model = { id: 'sanglier', file: 'SanglierDeBrume', name: 'Sanglier de brume', subtitle: 'créature de l’Île de l’Aube', PALETTE, REST, JOINTS, build, ANIMS, LABELS, MOVES, finish,
  ignore: [] };

/* ---------- vue de jeu : contrat de js/world/creatures.js ---------- */
/* addition d'une pose de réaction (coup reçu) par-dessus la pose courante */
function over(a, b, k) {
  const o = Object.assign({}, a);
  for (const j in b) { const A = a[j] || {}, B = b[j], ar = A.r || [0, 0, 0], ap = A.p || [0, 0, 0], br = B.r || [0, 0, 0], bp = B.p || [0, 0, 0], as = A.s ?? 1, bs = B.s ?? 1;
    o[j] = { r: ar.map((v, i) => v + br[i] * k), p: ap.map((v, i) => v + bp[i] * k), s: Array.isArray(as) || Array.isArray(bs) ? [0, 1, 2].map((n) => (Array.isArray(as) ? as[n] : as) * (1 + ((Array.isArray(bs) ? bs[n] : bs) - 1) * k)) : as * (1 + (bs - 1) * k) }; }
  return o;
}
export function createView() {
  const w = { move: 0, charge: 0, wind: 0, stun: 0, rec: 0 }; let windT = 0, recT = 9, was = false;
  const to = (k, on, dt, rate) => { w[k] += ((on ? 1 : 0) - w[k]) * (1 - Math.exp(-rate * dt)); if (w[k] < 0.002) w[k] = 0; if (w[k] > 0.998) w[k] = 1; return w[k]; };
  return creatureView(model, (s, a) => {
    if (s.dead) return a.at('DEATH', s.dead);
    const dt = a.dt, charging = !!s.charging && !s.stun;
    if (was && !charging && !s.stun) recT = 0;                 // fin de charge sans choc : freinage (état « recover » du jeu, qui n'envoie aucun champ)
    if (s.stun || s.wind || charging) recT = 9;
    was = charging; recT += dt;
    windT = s.wind ? windT + dt : (w.wind > 0 ? windT + dt : 0);
    to('move', s.move && !charging, dt, 12); to('charge', charging, dt, 18); to('wind', s.wind, dt, 16); to('stun', s.stun, dt, 14); to('rec', recT < 0.6, dt, 14);
    let pose = a.loop('IDLE');
    if (w.move) pose = blend(pose, a.loop('MOVE'), w.move);
    if (w.wind) pose = blend(pose, model.ANIMS.WINDUP.f(windT), w.wind);
    if (w.charge) pose = blend(pose, a.loop('CHARGE'), w.charge);
    if (w.rec) pose = blend(pose, a.clip('RECOVER', recT), w.rec);
    if (w.stun) pose = blend(pose, a.loop('STUN'), w.stun);
    if (s.attack) pose = a.at('ATTACK', s.attack);
    if (s.hurt) pose = over(pose, a.clip('HURT', 0.07), Math.max(0, Math.min(1, s.hurt / 0.75, (1 - s.hurt) / 0.12)));
    return pose;
  }, { mat: (nodes) => { const m = nodes.Body.material; m.emissive = new THREE.Color('#2a1f40'); return m; } });
}
