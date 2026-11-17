/* =========================================================
   LUMEN — Lyra, la voyageuse à la Lueur, et Fia (modèle v2).
   Reconstruit d'après la planche de référence (6 vues) :
   low-poly facetté (aucune sphère), contours noirs en « coque
   inversée » (géométrie), hiérarchie articulée nommée, couleurs
   par sommet en sRGB brut, 10 animations à 30 i/s.
   Repère glTF : Y vers le haut, Lyra regarde vers +Z, sol à Y = 0.
   ========================================================= */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const PALETTE = {
  cloak: '#283568', cloakLight: '#3A4D8F',
  tunic: '#F4EFE6', tunicLight: '#FFFFFF',
  gold: '#E5B54F', skin: '#F7D6C4', cheek: '#EB9B98',
  eye: '#1B264F', star: '#FFFFFF', hair: '#5C3A28',
  trousers: '#4A3222', boots: '#5E3F2B', wood: '#7A5236',
  fia: '#FFF8DC', fiaCore: '#FFD166', outline: '#000000',
};
export const OUTLINE_OFFSET = 0.015;
const D2R = Math.PI / 180;
const LIGHT = new THREE.Vector3(0.35, 0.85, 0.5).normalize(), LIGHT2 = new THREE.Vector3(-0.45, 0.45, -0.77).normalize();
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* sRGB brut (pas de conversion en linéaire) */
const raw = (hex) => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const hexOf = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
const lighten = (hex, k = 0.14) => hexOf(raw(hex).map((v) => v + (1 - v) * k));
const darken = (hex, k = 0.2) => hexOf(raw(hex).map((v) => v * (1 - k)));

/* ---------- facettes : une couleur par face (base / claire selon l'orientation) ---------- */
function facet(geo, base, light) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  ['uv', 'normal', 'color'].forEach((a) => g.deleteAttribute(a));
  const pos = g.attributes.position, n = pos.count;
  const col = new Float32Array(n * 3);
  const A = V(), B = V(), C = V(), N = V();
  const cb = raw(base), cl = raw(light || lighten(base));
  for (let i = 0; i < n; i += 3) {
    A.fromBufferAttribute(pos, i); B.fromBufferAttribute(pos, i + 1); C.fromBufferAttribute(pos, i + 2);
    N.subVectors(B, A).cross(C.clone().sub(A)).normalize();
    const d = N.dot(LIGHT);
    const c = d > 0.55 ? cl : d > 0.12 ? mixc(cb, cl, 0.5) : N.dot(LIGHT2) > 0.62 ? mixc(cb, cl, 0.28) : cb;
    for (let k = 0; k < 3; k++) col.set(c, (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
const T = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
  g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D2R, ry * D2R, rz * D2R)), V(sx, sy, sz))); return g;
};
const prism = (rt, rb, h, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s, 1, false);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const stripAttrs = (g) => { const o = new THREE.BufferGeometry(); o.setAttribute('position', (g.index ? g.toNonIndexed() : g).attributes.position.clone()); return o; };

/* Soupe de triangles orientés (le « hint » donne le côté extérieur) */
class Soup {
  constructor() { this.p = []; }
  tri(a, b, c, hint) {
    const n = b.clone().sub(a).cross(c.clone().sub(a));
    if (n.lengthSq() < 1e-14) return this;
    if (hint && n.dot(hint) < 0) { const t = b; b = c; c = t; }
    this.p.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); return this;
  }
  quad(a, b, c, d, hint) { return this.tri(a, b, c, hint).tri(a, c, d, hint); }
  geo() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.p), 3)); return g; }
}
/* section en super-ellipse : n = 2 ellipse, n > 2 plus carré (faces plus plates) */
const sgnpow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
function ringPt(r, phi, n) { const s = Math.sin(phi), c = Math.cos(phi), e = 2 / n; return V((r.cx || 0) + r.rx * sgnpow(s, e), r.y, (r.cz || 0) + (c >= 0 ? (r.rf ?? r.rz) : (r.rb ?? r.rz)) * sgnpow(c, e)); }
/* volume par anneaux empilés (facetté) */
function loft(rings, N = 8, o = {}) {
  const n = o.n || 2, ph = o.phase ?? Math.PI / N, S = new Soup();
  const P = rings.map((r) => Array.from({ length: N }, (_, k) => ringPt(r, ph + (k / N) * Math.PI * 2, n)));
  const ctr = (r) => V(r.cx || 0, r.y, r.cz || 0);
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < N; k++) {
    const a = P[i][k], b = P[i][(k + 1) % N], c = P[i + 1][(k + 1) % N], d = P[i + 1][k];
    const mid = a.clone().add(b).add(c).add(d).multiplyScalar(0.25);
    const hint = mid.clone().sub(ctr(rings[i]).lerp(ctr(rings[i + 1]), 0.5)); hint.y = 0;
    if (hint.lengthSq() < 1e-10) hint.set(0, rings[i + 1].rx < rings[i].rx ? 1 : -1, 0);
    S.quad(a, b, c, d, hint);
  }
  const L = rings.length - 1;
  if (o.capBottom !== false) for (let k = 0; k < N; k++) S.tri(ctr(rings[0]), P[0][k], P[0][(k + 1) % N], V(0, -1, 0));
  if (o.capTop !== false) for (let k = 0; k < N; k++) S.tri(ctr(rings[L]), P[L][k], P[L][(k + 1) % N], V(0, 1, 0));
  return S.geo();
}
/* bande épaisse le long de deux lignes A (bord) et B, sortie de « thick » le long des normales */
function band(A, B, Nrm, thick) {
  const S = new Soup();
  for (let i = 0; i < A.length - 1; i++) {
    const n0 = Nrm[i].clone().multiplyScalar(thick), n1 = Nrm[i + 1].clone().multiplyScalar(thick);
    const a0 = A[i], a1 = A[i + 1], b0 = B[i], b1 = B[i + 1];
    const A0 = a0.clone().add(n0), A1 = a1.clone().add(n1), B0 = b0.clone().add(n0), B1 = b1.clone().add(n1);
    const nm = Nrm[i].clone().add(Nrm[i + 1]);
    S.quad(A0, A1, B1, B0, nm);
    S.quad(a0, a1, A1, A0, a0.clone().sub(b0));
    S.quad(b0, b1, B1, B0, b0.clone().sub(a0));
    S.quad(a0, a1, b1, b0, nm.clone().negate());
    if (i === 0) S.quad(a0, A0, B0, b0, a0.clone().sub(a1));
    if (i === A.length - 2) S.quad(a1, A1, B1, b1, a1.clone().sub(a0));
  }
  return S.geo();
}
/* disque plat facetté (face vers +Z), n côtés */
function disc(rx, ry, n = 8, rot = 0) {
  const S = new Soup(), c = V(0, 0, 0);
  for (let k = 0; k < n; k++) { const a = rot + (k / n) * Math.PI * 2, b = rot + ((k + 1) / n) * Math.PI * 2; S.tri(c, V(Math.cos(a) * rx, Math.sin(a) * ry, 0), V(Math.cos(b) * rx, Math.sin(b) * ry, 0), V(0, 0, 1)); }
  return S.geo();
}
/* étoile à 4 branches (reflet des yeux), face vers +Z */
function star4(r, k = 0.32) {
  const S = new Soup(), c = V(0, 0, 0), pts = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? r * k : r; pts.push(V(Math.sin(a) * rr, Math.cos(a) * rr, 0)); }
  for (let i = 0; i < 8; i++) S.tri(c, pts[i], pts[(i + 1) % 8], V(0, 0, 1));
  return S.geo();
}
/* plaque extrudée à partir d'un polygone 2D [[x,y]…], épaisseur d, centrée en z */
function slab(pts, d) { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return T(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), 0, 0, -d / 2); }

/* ---------- matériaux ---------- */
const M = {
  body: new THREE.MeshStandardMaterial({ name: 'M_Lyra', vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 }),
  outline: new THREE.MeshBasicMaterial({ name: 'M_Outline', vertexColors: true, color: 0xffffff }),
  eyesGlow: new THREE.MeshStandardMaterial({ name: 'M_Glow_Eyes', vertexColors: true, color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1, roughness: 1 }),
  fia: new THREE.MeshStandardMaterial({ name: 'M_Fia_Body', vertexColors: true, flatShading: true, roughness: 0.25, metalness: 0.1, emissive: 0xfff8dc, emissiveIntensity: 0.35 }),
  fiaCore: new THREE.MeshStandardMaterial({ name: 'M_Glow_FiaCore', vertexColors: true, color: 0xffffff, emissive: 0xffd166, emissiveIntensity: 2, roughness: 1 }),
  runes: new THREE.MeshStandardMaterial({ name: 'M_Glow_Runes', vertexColors: true, color: 0xffffff, emissive: 0xfff3b0, emissiveIntensity: 1.2, roughness: 1 }),
  staffRing: new THREE.MeshStandardMaterial({ name: 'M_Glow_StaffRing', vertexColors: true, color: 0xffffff, emissive: 0xfff8dc, emissiveIntensity: 1.5, roughness: 1 }),
};
const GLOW = new Set(['Eyes_Glow', 'Fia_Core', 'Staff_LightRing', 'Collar_Runes']);

/* Pièce : liste de [géométrie, couleur, couleur claire] → maillage nommé + contour.
   outlineFrom : géométries servant au contour (les décors plats en sont exclus). */
function part(name, pieces, mat = M.body, outlineFrom = null) {
  const geo = mergeGeometries(pieces.map(([g, c, l]) => facet(g, c, l)));
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, mat); mesh.name = name;
  if (outlineFrom) mesh.userData.solid = mergeGeometries(outlineFrom.map(stripAttrs));
  if (!GLOW.has(name)) mesh.add(outline(outlineFrom ? mergeGeometries(outlineFrom.map(stripAttrs)) : geo, name));
  return mesh;
}
/* Contour « coque inversée » : copie gonflée le long des normales lissées, faces retournées, noire */
function outline(geo, name) {
  let g = stripAttrs(geo);
  g = mergeVertices(g, 1e-4);
  g.computeVertexNormals();
  const p = g.attributes.position, nrm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + nrm.getX(i) * OUTLINE_OFFSET, p.getY(i) + nrm.getY(i) * OUTLINE_OFFSET, p.getZ(i) + nrm.getZ(i) * OUTLINE_OFFSET);
  const idx = g.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  g = g.toNonIndexed(); g.deleteAttribute('normal');
  g.computeVertexNormals();
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  const m = new THREE.Mesh(g, M.outline); m.name = name + '_Outline';
  return m;
}

/* ---------- Pose de repos (pivots aux articulations) ---------- */
export const REST = {
  Pelvis: { p: [0, 0.534, 0], r: [0, 0, 0] },
  Torso: { p: [0, 0.05, 0], r: [0, 0, 0] },
  Head: { p: [0, 0.315, 0], r: [0, 0, 0], s: 1.17 },
  Hood: { p: [0, 0, 0], r: [0, 0, 0] }, Hair_Bangs: { p: [0, 0, 0], r: [0, 0, 0] }, Eyes_Glow: { p: [0, 0, 0], r: [0, 0, 0] },
  Cloak_Back: { p: [0, 0.232, -0.14], r: [5, 0, 0] }, Cloak_Left: { p: [0, 0.232, -0.14], r: [5, 0, 0] }, Cloak_Right: { p: [0, 0.232, -0.14], r: [5, 0, 0] },
  Flap_FL: { p: [0, 0.05, 0.1], r: [-7, 0, 0] }, Flap_FR: { p: [0, 0.05, 0.1], r: [-7, 0, 0] }, Flap_BL: { p: [0, 0.05, -0.1], r: [7, 0, 0] }, Flap_BR: { p: [0, 0.05, -0.1], r: [7, 0, 0] },
  Flap_SL: { p: [0.17, 0.05, 0], r: [0, 0, 8] }, Flap_SR: { p: [-0.17, 0.05, 0], r: [0, 0, -8] },
  ArmL_Upper: { p: [0.165, 0.265, 0], r: [0, 0, 34] }, ArmL_Lower: { p: [0, -0.17, 0], r: [-12, 0, 0] }, HandL: { p: [0, -0.15, 0], r: [0, 0, 0] },
  ArmR_Upper: { p: [-0.165, 0.265, 0], r: [0, 0, -30] }, ArmR_Lower: { p: [0, -0.17, 0], r: [-10, 0, 0] }, HandR: { p: [0, -0.15, 0], r: [0, 0, 0] },
  Staff: { p: [0, -0.06, 0.05], r: [12, 0, -43] },
  LegL_Upper: { p: [0.088, -0.03, 0], r: [0, 0, 2] }, LegL_Lower: { p: [0, -0.19, 0], r: [0, 0, 0] }, FootL: { p: [0, -0.19, 0], r: [0, 0, -2] },
  LegR_Upper: { p: [-0.088, -0.03, 0], r: [0, 0, -2] }, LegR_Lower: { p: [0, -0.19, 0], r: [0, 0, 0] }, FootR: { p: [0, -0.19, 0], r: [0, 0, 2] },
  Fia_Pivot: { p: [0, 0.3, 0], r: [0, 0, 0] },
  Fia_Body: { p: [-0.5, 0.36, 0.06], r: [0, 0, 0] },
  Fia_Core: { p: [-0.5, 0.36, 0.06], r: [0, 0, 0] },
};
/* pointe du bâton (repère du bâton), pour les effets */
export const STAFF_TIP = [0.055, 0.9, 0];

/* ---------- Construction ---------- */
export function buildLyra(pal = PALETTE) {
  const P = pal;
  const nodes = {};
  const place = (m, name) => { nodes[name] = m; const r = REST[name]; if (r) { m.position.set(...r.p); m.rotation.set(r.r[0] * D2R, r.r[1] * D2R, r.r[2] * D2R); if (r.s) m.scale.setScalar(r.s); } return m; };
  const mk = (name, pieces, mat, outlineFrom) => place(part(name, pieces, mat, outlineFrom), name);
  const goldL = '#F7DC8F', goldD = '#C9962E';

  /* Bassin : haut du pantalon */
  const pelvis = mk('Pelvis', [[T(prism(0.118, 0.125, 0.13, 8), 0, -0.01, 0), P.trousers]]);

  /* ===== Buste : tunique, ceinture dorée, pans fendus, pèlerine à bordure dorée, broche ===== */
  const tunic = loft([{ y: -0.03, rx: 0.132, rz: 0.102 }, { y: 0.06, rx: 0.14, rz: 0.106 }, { y: 0.2, rx: 0.15, rz: 0.112 }, { y: 0.28, rx: 0.13, rz: 0.1 }, { y: 0.315, rx: 0.075, rz: 0.065 }], 8, { n: 2.4 });
  const belt = loft([{ y: -0.005, rx: 0.146, rz: 0.115 }, { y: 0.05, rx: 0.15, rz: 0.118 }], 8, { n: 2.4 });
  /* pèlerine : 3 anneaux, bas découpé en pointes (deux pointes devant, une derrière) */
  const CN = 12, capY = [0.205, 0.122, 0.18, 0.218, 0.218, 0.18, 0.13, 0.18, 0.218, 0.218, 0.18, 0.122];
  const cTop = { y: 0.345, rx: 0.1, rz: 0.092 }, cMid = { y: 0.3, rx: 0.19, rz: 0.158 }, cBot = { y: 0, rx: 0.243, rz: 0.215 };
  const cp = (r, k, y) => { const p = ringPt(r, (k / CN) * Math.PI * 2, 2.2); if (y !== undefined) p.y = y; return p; };
  const capS = new Soup(), axis = (y) => V(0, y, 0);
  const bot = [], mid = [];
  for (let k = 0; k <= CN; k++) { bot.push(cp(cBot, k % CN, capY[k % CN])); mid.push(cp(cMid, k % CN)); }
  for (let k = 0; k < CN; k++) {
    const t0 = cp(cTop, k), t1 = cp(cTop, (k + 1) % CN);
    const h = mid[k].clone().add(mid[k + 1]).sub(axis(0.3).multiplyScalar(2)); h.y = 0.4;
    capS.quad(mid[k], mid[k + 1], t1, t0, h);
    capS.quad(bot[k], bot[k + 1], mid[k + 1], mid[k], h);
    capS.tri(axis(0.345), t0, t1, V(0, 1, 0));
    capS.tri(axis(0.19), bot[k], bot[k + 1], V(0, -1, 0));
  }
  const rad = (p) => { const n = V(p.x, 0.25, p.z).normalize(); return n; };
  const capTrimA = bot.map((b, k) => b.clone().lerp(mid[k], -0.1)), capTrimB = bot.map((b, k) => b.clone().lerp(mid[k], 0.2));
  const capTrim = band(capTrimA, capTrimB, bot.map(rad), 0.013);
  const clasp = T(prism(0.036, 0.036, 0.024, 8), 0, 0.222, 0.213, 78, 0, 0), claspIn = T(prism(0.019, 0.022, 0.03, 6), 0, 0.222, 0.218, 78, 0, 0);
  const torsoPieces = [
    [tunic, P.tunic, P.tunicLight], [belt, P.gold, goldL],
    [T(box(0.066, 0.058, 0.026), 0, 0.022, 0.118), goldD, goldL], [T(box(0.03, 0.026, 0.03), 0, 0.022, 0.121), '#8A6238', '#A67C4A'],
    [T(box(0.062, 0.075, 0.045), -0.118, -0.04, 0.085, 0, -32, 0), '#8A6238', '#A67C4A'], [T(box(0.066, 0.022, 0.05), -0.118, -0.008, 0.085, 0, -32, 0), goldD, goldL],
    [T(prism(0.05, 0.055, 0.06, 6), 0, 0.335, 0), P.skin],
    [capS.geo(), P.cloak, P.cloakLight], [capTrim, P.gold, goldL], [clasp, P.gold, goldL], [claspIn, goldD, goldL],
  ];
  const torso = mk('Torso', torsoPieces);
  pelvis.add(torso);
  /* pans fendus de la tunique : 6 volets articulés à la ceinture (ils suivent les jambes) */
  const flapFB = (s, tip) => slab([[0.006 * s, 0], [0.15 * s, 0], [0.172 * s, -0.2], [0.095 * s, -tip], [0.006 * s, -0.168]], 0.03);
  const flapSd = () => T(slab([[-0.095, 0], [0.095, 0], [0.105, -0.185], [0, -0.215], [-0.105, -0.185]], 0.03), 0, 0, 0, 0, 90, 0);
  [['L', 1], ['R', -1]].forEach(([n, s]) => {
    pelvis.add(mk('Flap_F' + n, [[flapFB(s, 0.24), P.tunic, P.tunicLight]])); pelvis.add(mk('Flap_B' + n, [[flapFB(s, 0.235), P.tunic, P.tunicLight]])); pelvis.add(mk('Flap_S' + n, [[flapSd(), P.tunic, P.tunicLight]]));
  });
  /* fils de lumière le long de la pèlerine (émissifs, sans contour) */
  const rS = new Soup();
  for (let k = 0; k < CN; k++) {
    if (k === 0 || k === CN - 1) continue;
    const m = mid[k].clone().lerp(mid[k + 1], 0.5), b = bot[k].clone().lerp(bot[k + 1], 0.5), n = rad(m).multiplyScalar(0.005);
    const side = mid[k + 1].clone().sub(mid[k]).normalize().multiplyScalar(0.006);
    const a0 = m.clone().lerp(b, 0.22).add(n), a1 = m.clone().lerp(b, 0.74).add(n);
    rS.quad(a0.clone().sub(side), a0.clone().add(side), a1.clone().add(side), a1.clone().sub(side), n);
  }
  const collar = part('Collar_Runes', [[rS.geo(), '#FFF3B0', '#FFF3B0']], M.runes); torso.add(collar); nodes.Collar_Runes = collar;

  /* ===== Tête : volume facetté à face avant plate, yeux, joues, bouche ===== */
  const headRings = [{ y: 0.012, rx: 0.085, rz: 0.08 }, { y: 0.05, rx: 0.172, rz: 0.152 }, { y: 0.11, rx: 0.23, rz: 0.196 }, { y: 0.19, rx: 0.246, rz: 0.21 }, { y: 0.28, rx: 0.24, rz: 0.208 }, { y: 0.36, rx: 0.2, rz: 0.176 }, { y: 0.415, rx: 0.12, rz: 0.105 }];
  const skull = loft(headRings, 8, { n: 3 });
  const probe = new THREE.Mesh(skull, new THREE.MeshBasicMaterial()); probe.updateMatrixWorld(true);
  const rc = new THREE.Raycaster();
  /* pose une forme plate (face +Z) sur le visage, au point (x, y), décollée de « off » */
  const stick = (g, x, y, off = 0.003, rz = 0) => {
    rc.set(V(x, y, 1), V(0, 0, -1)); const hit = rc.intersectObject(probe)[0];
    const n = hit.face.normal.clone(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n);
    if (rz) g.applyMatrix4(new THREE.Matrix4().makeRotationZ(rz * D2R));
    g.applyMatrix4(new THREE.Matrix4().compose(hit.point.clone().addScaledVector(n, off), q, V(1, 1, 1))); return g;
  };
  const EX = 0.1, EY = 0.182, face = [[skull, '#EBC3B0', '#FFE6D8']];
  [-1, 1].forEach((s) => {
    face.push([stick(disc(0.052, 0.062, 10), s * EX, EY + 0.009, 0.002), '#10162F', '#10162F']);          // cils (liseré supérieur)
    face.push([stick(disc(0.046, 0.059, 10), s * EX, EY, 0.004), P.eye, P.eye]);                             // œil
    face.push([stick(disc(0.032, 0.026, 8), s * EX, EY - 0.028, 0.006), '#3F55A0', '#3F55A0']);              // iris clair (bas)
    face.push([stick(box(0.052, 0.011, 0.006), s * (EX + 0.004), EY + 0.083, 0.004, s * -7), P.hair, P.hair]); // sourcil
    face.push([stick(disc(0.031, 0.019, 6), s * 0.16, 0.112, 0.003), P.cheek, P.cheek]);                     // joue
  });
  face.push([stick(slab([[-0.025, 0.008], [-0.01, -0.001], [0.01, -0.001], [0.025, 0.008], [0.021, -0.001], [0.009, -0.01], [-0.009, -0.01], [-0.021, -0.001]], 0.004), 0, 0.098, 0.003), '#B8605C', '#B8605C']);
  const head = mk('Head', face, M.body, [skull]);
  torso.add(head);
  /* reflets en étoile dans les yeux (émissifs) */
  const glow = [];
  [-1, 1].forEach((s) => { glow.push([stick(star4(0.021), s * EX - 0.011, EY + 0.014, 0.008), P.star, P.star]); glow.push([stick(disc(0.0075, 0.0075, 6), s * EX + 0.017, EY - 0.024, 0.008), P.star, P.star]); });
  const eyesGlow = part('Eyes_Glow', glow, M.eyesGlow); head.add(eyesGlow); nodes.Eyes_Glow = eyesGlow;

  /* ===== Cheveux : calotte, frange droite et mèches du carré qui encadrent le visage ===== */
  const hairL = '#7A4E36';
  const hairCap = loft([{ y: 0.07, rx: 0.2, rb: 0.2, rf: 0.1 }, { y: 0.13, rx: 0.25, rb: 0.225, rf: 0.14 }, { y: 0.2, rx: 0.262, rb: 0.232, rf: 0.15 }, { y: 0.29, rx: 0.257, rb: 0.23, rf: 0.165 }, { y: 0.37, rx: 0.218, rb: 0.2, rf: 0.185 }, { y: 0.43, rx: 0.135, rb: 0.125, rf: 0.115 }], 8, { n: 3 });
  const hairPieces = [[hairCap, P.hair, hairL]];
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.051, bottom = 0.29 + (i % 2 ? 0.014 : -0.006) + Math.abs(i) * 0.005, top = 0.4 - Math.abs(i) * 0.01, hh = top - bottom;
    const g = slab([[-0.03, hh], [0.03, hh], [0.032, 0.014], [0.014, 0], [-0.014, 0], [-0.032, 0.014]], 0.03 + (i % 2 ? 0.008 : 0));
    hairPieces.push([T(g, x, bottom, 0.2 - Math.max(0, Math.abs(x) - 0.09) * 0.45, -14, -i * 8, 0), P.hair, hairL]);
  }
  [-1, 1].forEach((s) => {
    hairPieces.push([loft([{ y: 0.03, rx: 0.018, rz: 0.04, cx: s * 0.178, cz: 0.115 }, { y: 0.085, rx: 0.034, rz: 0.07, cx: s * 0.206, cz: 0.105 }, { y: 0.2, rx: 0.036, rz: 0.08, cx: s * 0.22, cz: 0.098 }, { y: 0.33, rx: 0.03, rz: 0.075, cx: s * 0.2, cz: 0.09 }], 6), P.hair, hairL]);
  });
  const hair = part('Hair_Bangs', hairPieces); head.add(hair); nodes.Hair_Bangs = hair;

  /* ===== Capuche pointue : coque facettée ouverte en arche, large liseré doré ===== */
  const HN = 2.4, HM = 10;
  const hoodRings = [
    { y: -0.012, rx: 0.246, rb: 0.255, rf: 0.2, w: 0.196 }, { y: 0.08, rx: 0.302, rb: 0.3, rf: 0.25, w: 0.226 }, { y: 0.2, rx: 0.326, rb: 0.322, rf: 0.272, w: 0.232 },
    { y: 0.315, rx: 0.314, rb: 0.322, rf: 0.276, w: 0.2 }, { y: 0.4, rx: 0.276, rb: 0.305, rf: 0.262, w: 0.122 }, { y: 0.458, rx: 0.228, rb: 0.268, rf: 0.215, w: 0 },
    { y: 0.54, rx: 0.14, rb: 0.2, rf: 0.105, w: 0, cz: -0.02 }, { y: 0.585, rx: 0.0005, rb: 0.0005, rf: 0.0005, w: 0, cz: -0.085 },
  ];
  const HP = hoodRings.map((r) => { const f0 = Math.asin(Math.min(1, Math.pow(r.w / r.rx, HN / 2))); return Array.from({ length: HM + 1 }, (_, k) => ringPt(r, f0 + (k / HM) * (Math.PI * 2 - 2 * f0), HN)); });
  const hoodOut = new Soup(), hoodIn = new Soup();
  for (let i = 0; i < hoodRings.length - 1; i++) for (let k = 0; k < HM; k++) {
    const a = HP[i][k], b = HP[i][k + 1], c = HP[i + 1][k + 1], d = HP[i + 1][k];
    const h = a.clone().add(b).add(c).add(d).multiplyScalar(0.25).sub(V(0, (hoodRings[i].y + hoodRings[i + 1].y) / 2 - 0.12, -0.02));
    hoodOut.quad(a, b, c, d, h); hoodIn.quad(a, b, c, d, h.clone().negate());
  }
  /* liseré : suit le bord de l'ouverture (côté gauche, sommet de l'arche, côté droit) */
  const edge = []; const L5 = 5;
  for (let i = 0; i <= 4; i++) edge.push(HP[i][0]);
  edge.push(HP[L5][0].clone().lerp(HP[L5][HM], 0.5));
  for (let i = 4; i >= 0; i--) edge.push(HP[i][HM]);
  /* arrondi de l'arche : points intermédiaires */
  const smooth = (pts) => { const o = []; for (let i = 0; i < pts.length - 1; i++) { o.push(pts[i]); if (i >= 3 && i <= 6) o.push(pts[i].clone().lerp(pts[i + 1], 0.5).add(V(0, i === 4 || i === 5 ? 0.006 : 0.003, 0))); } o.push(pts[pts.length - 1]); return o; };
  const E2 = smooth(edge), ctrF = V(0, 0.17, 0);
  const tN = E2.map((p) => V(p.x * 0.35, 0.05, 1).normalize());
  const tA = E2.map((p, i) => { const d = V(p.x - ctrF.x, p.y - ctrF.y, 0).normalize(); return p.clone().addScaledVector(d, -0.006).addScaledVector(tN[i], -0.03); });
  const tB = E2.map((p, i) => { const d = V(p.x - ctrF.x, p.y - ctrF.y, 0).normalize(); return p.clone().addScaledVector(d, 0.044).addScaledVector(tN[i], -0.03).add(V(0, 0, -0.02)); });
  const hoodTrim = band(tA, tB, tN, 0.052);
  const hood = mk('Hood', [[hoodOut.geo(), P.cloak, P.cloakLight], [hoodIn.geo(), darken(P.cloak, 0.42), darken(P.cloak, 0.42)], [hoodTrim, P.gold, goldL]], M.body, [hoodOut.geo(), hoodTrim]);
  head.add(hood);

  /* ===== Cape : 3 panneaux articulés, bordure dorée, fils clairs ===== */
  const thread = '#8C9BDA';
  const backPieces = [[T(slab([[-0.175, 0], [0.175, 0], [0.265, -0.555], [0, -0.635], [-0.265, -0.555]], 0.024), 0, 0, -0.012), P.cloak, P.cloakLight],
    [T(box(0.29, 0.042, 0.034), 0.13, -0.6, -0.012, 0, 0, 16.8), P.gold, goldL], [T(box(0.29, 0.042, 0.034), -0.13, -0.6, -0.012, 0, 0, -16.8), P.gold, goldL]];
  [-0.15, -0.075, 0, 0.075, 0.15].forEach((x) => backPieces.push([T(box(0.008, 0.47 + (0.15 - Math.abs(x)) * 0.25, 0.006), x * 1.12, -0.29, -0.026, 0, 0, x * 42), thread, thread]));
  const cB = mk('Cloak_Back', backPieces, M.body, backPieces.slice(0, 3).map((p) => p[0])); torso.add(cB);
  const wing = (s) => [[T(slab([[0.182 * s, -0.05], [0.268 * s, -0.05], [0.365 * s, -0.46], [0.33 * s, -0.525], [0.262 * s, -0.5]], 0.024), 0, 0, -0.012), P.cloak, P.cloakLight],
    [T(box(0.085, 0.036, 0.032), 0.296 * s, -0.5125, -0.012, 0, 0, -20 * s), P.gold, goldL], [T(box(0.085, 0.036, 0.032), 0.3475 * s, -0.4925, -0.012, 0, 0, 61.7 * s), P.gold, goldL],
    [T(box(0.008, 0.36, 0.006), 0.27 * s, -0.27, -0.026, 0, 0, 10.5 * s), thread, thread]];
  torso.add(mk('Cloak_Left', wing(1), M.body, wing(1).slice(0, 3).map((p) => p[0]))); torso.add(mk('Cloak_Right', wing(-1), M.body, wing(-1).slice(0, 3).map((p) => p[0])));

  /* ===== Bras : manches crème évasées, revers, mains ===== */
  const armUpper = () => [[loft([{ y: -0.175, rx: 0.066, rz: 0.063 }, { y: -0.08, rx: 0.064, rz: 0.061 }, { y: 0.012, rx: 0.072, rz: 0.068 }], 6), P.tunic, P.tunicLight]];
  const armLower = () => [[loft([{ y: -0.092, rx: 0.07, rz: 0.066 }, { y: 0.01, rx: 0.064, rz: 0.061 }], 6), P.tunic, P.tunicLight], [loft([{ y: -0.112, rx: 0.075, rz: 0.071 }, { y: -0.086, rx: 0.077, rz: 0.073 }], 6), P.tunicLight, P.tunicLight], [T(prism(0.036, 0.033, 0.05, 6), 0, -0.132, 0), P.skin]];
  const hand = (s) => [[loft([{ y: -0.098, rx: 0.036, rz: 0.03 }, { y: -0.06, rx: 0.046, rz: 0.034 }, { y: -0.012, rx: 0.04, rz: 0.03 }], 6), P.skin, lighten(P.skin, 0.3)],
    [T(box(0.074, 0.05, 0.026), 0, -0.062, 0.086), P.skin, lighten(P.skin, 0.3)], [T(box(0.07, 0.016, 0.06), 0, -0.094, 0.052), P.skin], [T(box(0.07, 0.016, 0.06), 0, -0.03, 0.052), P.skin]];
  ['L', 'R'].forEach((side) => {
    const s = side === 'L' ? 1 : -1;
    const up = mk('Arm' + side + '_Upper', armUpper()), lo = mk('Arm' + side + '_Lower', armLower()), h = mk('Hand' + side, hand(s));
    torso.add(up); up.add(lo); lo.add(h);
  });

  /* ===== Bâton de voyage (main gauche) : bois noueux, tête en boucle, anneau doré ===== */
  const sp = [], woodL = '#94683F';
  const seg = (a, b, r0, r1) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]), an = Math.atan2(b[0] - a[0], b[1] - a[1]); return [T(prism(r1, r0, len + 0.014, 6), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, 0, 0, -an / D2R), P.wood, woodL]; };
  const pts = [[0, -0.475], [0.013, -0.2], [-0.012, 0.1], [0.011, 0.42], [-0.004, 0.66], [0.002, 0.8], [-0.004, 0.868], [0.02, 0.925], [0.068, 0.945], [0.112, 0.912], [0.118, 0.852], [0.085, 0.812], [0.046, 0.824]];
  for (let i = 0; i < pts.length - 1; i++) sp.push(seg(pts[i], pts[i + 1], i < 4 ? 0.024 : i < 8 ? 0.021 : 0.019, i < 4 ? 0.022 : i < 8 ? 0.02 : 0.016));
  sp.push([T(prism(0.03, 0.03, 0.06, 6), 0.003, 0.0, 0), '#5E3F2B', '#77543A']);
  sp.push([T(new THREE.TorusGeometry(0.036, 0.011, 4, 8), 0.139, 0.803, 0, 0, 0, 22.5), P.gold, goldL]);
  const staff = mk('Staff', sp);
  nodes.HandL.add(staff);
  const lightRing = part('Staff_LightRing', [[T(new THREE.TorusGeometry(0.085, 0.009, 3, 8), 0.055, 0.87, 0, 0, 0, 22.5), '#FFF8DC', '#FFFFFF']], M.staffRing);
  lightRing.scale.setScalar(0.001); staff.add(lightRing); nodes.Staff_LightRing = lightRing;

  /* ===== Jambes et bottes à revers ===== */
  const bootL = '#77543A', cuff = '#8A6444';
  const legUpper = () => [[loft([{ y: -0.2, rx: 0.068, rz: 0.066 }, { y: 0.02, rx: 0.08, rz: 0.076 }], 6), P.trousers, '#5E4230']];
  const legLower = () => [[T(prism(0.066, 0.064, 0.05, 6), 0, -0.02, 0), P.trousers, '#5E4230'], [loft([{ y: -0.2, rx: 0.078, rz: 0.082 }, { y: -0.05, rx: 0.082, rz: 0.086 }], 8), P.boots, bootL], [loft([{ y: -0.085, rx: 0.088, rz: 0.094 }, { y: -0.028, rx: 0.092, rz: 0.1 }], 8), cuff, lighten(cuff, 0.18)]];
  const foot = () => [[T(loft([{ y: -0.085, rx: 0.07, rz: 0.05 }, { y: 0.0, rx: 0.08, rz: 0.058 }, { y: 0.105, rx: 0.082, rz: 0.052 }, { y: 0.168, rx: 0.06, rz: 0.036 }], 8, { n: 3 }), 0, -0.058, 0, 90, 0, 0), P.boots, bootL], [T(box(0.16, 0.022, 0.262), 0, -0.107, 0.042), '#3E2A1C', '#4E3524']];
  ['L', 'R'].forEach((side) => {
    const up = mk('Leg' + side + '_Upper', legUpper()), lo = mk('Leg' + side + '_Lower', legLower()), f = mk('Foot' + side, foot());
    pelvis.add(up); up.add(lo); lo.add(f);
  });

  /* ===== Fia : cristal allongé facetté + cœur lumineux, sur un pivot d'orbite ===== */
  const fiaPivot = new THREE.Object3D(); fiaPivot.name = 'Fia_Pivot'; fiaPivot.position.set(...REST.Fia_Pivot.p); torso.add(fiaPivot); nodes.Fia_Pivot = fiaPivot;
  const crystal = loft([{ y: -0.112, rx: 0.0005, rz: 0.0005 }, { y: -0.04, rx: 0.037, rz: 0.037 }, { y: 0.035, rx: 0.046, rz: 0.046 }, { y: 0.108, rx: 0.0005, rz: 0.0005 }], 6, { capTop: false, capBottom: false });
  const fiaBody = mk('Fia_Body', [[crystal, P.fia, '#FFFFFF']], M.fia);
  const fiaCore = mk('Fia_Core', [[T(new THREE.OctahedronGeometry(1, 0), 0, 0, 0, 0, 0, 0, 0.02, 0.062, 0.056), P.fiaCore, '#FFE7A3']], M.fiaCore);
  fiaPivot.add(fiaBody, fiaCore);

  pelvis.name = 'Pelvis';
  return { root: pelvis, nodes };
}

/* =========================================================
   Animations : poses clés (degrés, en plus de la pose de repos),
   interpolées en douceur et échantillonnées à 30 i/s.
   ========================================================= */
export const FPS = 30;
export const JOINTS = ['Pelvis', 'Torso', 'Head', 'Hood', 'Hair_Bangs', 'Eyes_Glow', 'Cloak_Back', 'Cloak_Left', 'Cloak_Right', 'Flap_FL', 'Flap_FR', 'Flap_BL', 'Flap_BR', 'Flap_SL', 'Flap_SR', 'ArmL_Upper', 'ArmL_Lower', 'HandL', 'ArmR_Upper', 'ArmR_Lower', 'HandR', 'Staff', 'LegL_Upper', 'LegL_Lower', 'FootL', 'LegR_Upper', 'LegR_Lower', 'FootR', 'Fia_Pivot', 'Fia_Body', 'Fia_Core', 'Staff_LightRing'];
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const ease = (k) => k * k * (3 - 2 * k);
const clamp01 = (k) => Math.max(0, Math.min(1, k));
/* interpolation entre poses clés [{t, pose}] ; pose = {joint: {r:[x,y,z], p:[dx,dy,dz], s:k}} */
function keyed(keys) {
  return (t) => {
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1] || a;
    const k = b.t > a.t ? ease(clamp01((t - a.t) / (b.t - a.t))) : 0;
    const out = {};
    new Set([...Object.keys(a.pose), ...Object.keys(b.pose)]).forEach((j) => {
      const A = a.pose[j] || {}, B = b.pose[j] || {};
      const lerp3 = (x, y) => [0, 1, 2].map((n) => ((x || [0, 0, 0])[n]) + (((y || [0, 0, 0])[n]) - ((x || [0, 0, 0])[n])) * k);
      out[j] = { r: lerp3(A.r, B.r), p: lerp3(A.p, B.p), s: (A.s ?? 1) + ((B.s ?? 1) - (A.s ?? 1)) * k };
    });
    return out;
  };
}
const add = (o, j, v) => { o[j] = o[j] || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; if (v.r) o[j].r = o[j].r.map((x, i) => x + v.r[i]); if (v.p) o[j].p = o[j].p.map((x, i) => x + v.p[i]); if (v.s !== undefined) o[j].s *= v.s; return o; };
/* Fia : orbite douce par défaut */
function fiaIdle(o, t, speed = 1) {
  add(o, 'Fia_Pivot', { r: [0, 18 * sin(2 * PI * t / 3 * speed), 0] });
  const bob = 0.03 * sin(4 * PI * t / 3 * speed);
  add(o, 'Fia_Body', { p: [0, bob, 0], r: [0, 360 * t / 3, 0] });
  add(o, 'Fia_Core', { p: [0, bob, 0], r: [0, -360 * t / 3, 0], s: 1 + 0.15 * sin(4 * PI * t / 3) });
  return o;
}

/* Tenue du bâton : calcule la rotation (et la position) locales du bâton pour qu'il ait, dans le repère de Lyra,
   la direction voulue quelle que soit la pose du bras gauche. La main peut glisser le long du manche pour que
   le pied du bâton reste posé au sol (plant), ou le bâton peut quitter la main (pos, k). */
/* axe et orientation du bâton au repos (repère de Lyra) */
const Q0 = (() => { const m = new THREE.Matrix4(); ['Pelvis', 'Torso', 'ArmL_Upper', 'ArmL_Lower', 'HandL', 'Staff'].forEach((j) => m.multiply(jointMat(j, {}))); return new THREE.Quaternion().setFromRotationMatrix(m); })();
const R0 = new THREE.Vector3(0, 1, 0).applyQuaternion(Q0).toArray();
const STAFF_FOOT = 0.475, _CH = ['Pelvis', 'Torso', 'ArmL_Upper', 'ArmL_Lower', 'HandL'];
function jointMat(j, o) {
  const r = REST[j], x = o[j] || {}, a = (i) => (r.r[i] + (x.r ? x.r[i] : 0)) * D2R, s = (r.s || 1) * (x.s ?? 1);
  return new THREE.Matrix4().compose(new THREE.Vector3(r.p[0] + (x.p ? x.p[0] : 0), r.p[1] + (x.p ? x.p[1] : 0), r.p[2] + (x.p ? x.p[2] : 0)), new THREE.Quaternion().setFromEuler(new THREE.Euler(a(0), a(1), a(2), 'XYZ')), new THREE.Vector3(s, s, s));
}
function holdStaff(o, dir, opt = {}) {
  Object.defineProperty(o, '_staff', { value: { dir: dir.clone(), opt }, enumerable: false, configurable: true, writable: true });
  const parent = new THREE.Matrix4(); _CH.forEach((j) => parent.multiply(jointMat(j, o)));
  /* orientation : plus petite rotation qui amène l'axe du bâton au repos sur la direction voulue (la crosse ne vrille jamais d'un coup) */
  const y = dir.clone().normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...R0).normalize(), y).multiply(Q0);
  if (opt.frame === 'pelvis') { const pq = new THREE.Quaternion().setFromRotationMatrix(jointMat('Pelvis', o)); y.applyQuaternion(pq); q.premultiply(pq); }
  const x = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  const g = new THREE.Vector3(...REST.Staff.p).applyMatrix4(parent);
  const lift = 0.03 + STAFF_FOOT * y.y - g.y;
  if (y.y > 0.3 && (opt.plant || lift > 0)) g.addScaledVector(y, (lift / y.y) * (opt.plant === undefined || opt.plant === true ? 1 : opt.plant));
  if (opt.slide) g.addScaledVector(y, opt.slide);
  if (opt.pos) { g.lerp(opt.pos, opt.k ?? 1); let m = 1e9; for (const [px, py] of [[0, -STAFF_FOOT], [0, 0.94], [0.16, 0.8], [0.12, 0.93], [-0.02, 0.9]]) m = Math.min(m, g.y + new THREE.Vector3(px, py, 0).applyQuaternion(q).y - 0.035); if (m < 0) g.y -= m; }
  const loc = parent.clone().invert().multiply(new THREE.Matrix4().compose(g, q, new THREE.Vector3(1, 1, 1)));
  const p = new THREE.Vector3(), lq = new THREE.Quaternion(), ls = new THREE.Vector3(); loc.decompose(p, lq, ls);
  const e = new THREE.Euler().setFromQuaternion(lq, 'XYZ');
  o.Staff = { r: [e.x / D2R - REST.Staff.r[0], e.y / D2R - REST.Staff.r[1], e.z / D2R - REST.Staff.r[2]], p: [p.x - REST.Staff.p[0], p.y - REST.Staff.p[1], p.z - REST.Staff.p[2]], s: 1 };
  return o;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

const _combo = keyed([
    { t: 0, pose: {} },
    { t: 0.12, pose: { Pelvis: { p: [0, -0.03, 0], r: [0, 35, 0] }, Torso: { r: [5, 30, 0] }, ArmL_Upper: { r: [-75, 0, 25] }, ArmL_Lower: { r: [-10, 0, 0] }, Staff: { r: [168, 0, 11] }, LegL_Upper: { r: [-20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, Staff_LightRing: { s: 400 } } },
    { t: 0.25, pose: { Pelvis: { p: [0, -0.04, 0], r: [0, -40, 0] }, Torso: { r: [8, -45, 0] }, Head: { r: [0, 30, 0] }, ArmL_Upper: { r: [-80, 0, -35] }, ArmL_Lower: { r: [-5, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-30, 0, -30] }, LegL_Upper: { r: [-20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, Cloak_Back: { r: [10, 0, 10] }, Staff_LightRing: { s: 700 } } },
    { t: 0.45, pose: { Pelvis: { p: [0, -0.06, 0], r: [0, -15, 0] }, Torso: { r: [12, -10, 0] }, ArmL_Upper: { r: [15, 0, 20] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [150, 0, 11] }, LegL_Upper: { r: [-30, 0, 0] }, LegL_Lower: { r: [35, 0, 0] }, LegR_Upper: { r: [20, 0, 0] }, Staff_LightRing: { s: 400 } } },
    { t: 0.65, pose: { Pelvis: { p: [0, -0.01, 0], r: [-5, 15, 0] }, Torso: { r: [-10, 20, 0] }, Head: { r: [-12, -10, 0] }, ArmL_Upper: { r: [-160, 0, 15] }, ArmL_Lower: { r: [-5, 0, 0] }, Staff: { r: [168, 0, 30] }, LegL_Upper: { r: [-20, 0, 0] }, LegR_Upper: { r: [10, 0, 0] }, Cloak_Back: { r: [18, 0, 0] }, Staff_LightRing: { s: 700 } } },
    { t: 0.85, pose: { Pelvis: { p: [0, -0.05, 0], r: [0, 25, 0] }, Torso: { r: [0, 25, 0] }, ArmL_Upper: { r: [-40, 0, 30] }, ArmL_Lower: { r: [-80, 0, 0] }, Staff: { r: [168, 0, 11] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [25, 0, 0] }, LegR_Upper: { r: [25, 0, 0] }, Staff_LightRing: { s: 400 } } },
    { t: 1.1, pose: { Pelvis: { p: [0, -0.07, 0.05], r: [10, -10, 0] }, Torso: { r: [18, -15, 0] }, Head: { r: [-12, 10, 0] }, ArmL_Upper: { r: [-95, 0, 8] }, ArmL_Lower: { r: [0, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [20, 0, -20] }, LegL_Upper: { r: [-45, 0, 0] }, LegL_Lower: { r: [45, 0, 0] }, LegR_Upper: { r: [30, 0, 0] }, LegR_Lower: { r: [10, 0, 0] }, Cloak_Back: { r: [25, 0, 0] }, Staff_LightRing: { s: 900 } } },
    { t: 1.4, pose: {} },
  ]);
const _spin = keyed([
    { t: 0, pose: {} },
    { t: 0.45, pose: { Pelvis: { p: [0, -0.1, 0], r: [8, 70, 0] }, Torso: { r: [12, 40, 0] }, Head: { r: [0, -60, 0] }, ArmL_Upper: { r: [-60, 0, 60] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-40, 0, -20] }, LegL_Upper: { r: [-35, 0, 10] }, LegR_Upper: { r: [25, 0, -10] }, LegL_Lower: { r: [50, 0, 0] }, LegR_Lower: { r: [30, 0, 0] }, Staff_LightRing: { s: 1600 }, Fia_Core: { s: 1.8 } } },
    { t: 0.65, pose: { Pelvis: { p: [0, -0.08, 0], r: [8, -110, 0] }, Torso: { r: [10, -20, 0] }, Head: { r: [0, 10, 0] }, ArmL_Upper: { r: [-88, 0, -10] }, ArmL_Lower: { r: [0, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-60, 0, -50] }, LegL_Upper: { r: [-30, 0, 10] }, LegR_Upper: { r: [25, 0, -10] }, LegL_Lower: { r: [40, 0, 0] }, Cloak_Back: { r: [55, 0, 0] }, Cloak_Left: { r: [40, 0, 20] }, Cloak_Right: { r: [40, 0, -20] }, Staff_LightRing: { s: 1800 }, Fia_Core: { s: 2.0 } } },
    { t: 0.8, pose: { Pelvis: { p: [0, -0.07, 0], r: [5, -290, 0] }, Torso: { r: [8, -10, 0] }, ArmL_Upper: { r: [-80, 0, -20] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-40, 0, -50] }, LegL_Upper: { r: [-20, 0, 0] }, LegL_Lower: { r: [30, 0, 0] }, Cloak_Back: { r: [45, 0, 0] }, Staff_LightRing: { s: 1000 }, Fia_Core: { s: 1.4 } } },
    { t: 1.2, pose: { Pelvis: { r: [0, -360, 0] } } },
  ]);
const _defeated = keyed([
    { t: 0, pose: {} },
    { t: 0.25, pose: { Pelvis: { p: [0, -0.03, 0], r: [-6, 0, 0] }, Torso: { r: [-10, 0, 0] }, Head: { r: [-10, 0, 0] } } },
    { t: 0.8, pose: { Pelvis: { p: [0, -0.2, 0.03], r: [5, 0, 0] }, Torso: { r: [20, 0, 0] }, Head: { r: [15, 0, 0] }, LegR_Upper: { r: [-85, 0, 0] }, LegR_Lower: { r: [88, 0, 0] }, FootR: { r: [0, 0, 0] }, LegL_Upper: { r: [-8, 0, 0] }, LegL_Lower: { r: [105, 0, 0] }, FootL: { r: [-35, 0, 0] }, ArmL_Upper: { r: [-50, 0, -10] }, ArmL_Lower: { r: [-40, 0, 0] }, Staff: { r: [5, 0, 30] }, ArmR_Upper: { r: [-10, 0, 10] }, Fia_Core: { s: 0.8 }, Fia_Body: { p: [0.1, -0.2, 0.15] } } },
    { t: 1.4, pose: { Pelvis: { p: [0, -0.22, 0.03], r: [12, 0, 0] }, Torso: { r: [38, 0, 0] }, Head: { r: [25, 0, 0] }, LegR_Upper: { r: [-85, 0, 0] }, LegR_Lower: { r: [88, 0, 0] }, LegL_Upper: { r: [-8, 0, 0] }, LegL_Lower: { r: [105, 0, 0] }, FootL: { r: [-35, 0, 0] }, ArmL_Upper: { r: [-60, 0, -10] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [10, 0, 30] }, ArmR_Upper: { r: [-30, 0, 20] }, ArmR_Lower: { r: [-40, 0, 0] }, Cloak_Back: { r: [-8, 0, 0] }, Fia_Core: { s: 0.6 }, Fia_Body: { p: [0.2, -0.4, 0.3] } } },
    { t: 2.5, pose: { Pelvis: { p: [0.05, -0.43, -0.02], r: [0, 0, 84] }, Torso: { r: [12, 0, 0] }, Head: { r: [8, 0, -14] }, LegR_Upper: { r: [-35, 0, 0] }, LegR_Lower: { r: [55, 0, 0] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [60, 0, 0] }, FootL: { r: [-10, 0, 0] }, ArmL_Upper: { r: [-40, 0, -14] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [0, 0, 11] }, ArmR_Upper: { r: [-60, 0, 30] }, ArmR_Lower: { r: [-50, 0, 0] }, Cloak_Back: { r: [-30, 0, 0] }, Cloak_Left: { r: [-10, 0, -40] }, Cloak_Right: { r: [-10, 0, 30] }, Fia_Core: { s: 0.3 }, Fia_Body: { p: [0.35, -0.82, 0.32], s: 0.85 } } },
  ]);

/* Gestes au bâton : poses du bras gauche et direction du bâton (repère du bassin) par instants clés */
function tween(keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1] || a, k = b.t > a.t ? ease(clamp01((t - a.t) / (b.t - a.t))) : 0, out = {};
  for (const f of Object.keys(a)) if (f !== 't') out[f] = Array.isArray(a[f]) ? a[f].map((v, n) => v + ((b[f] ?? a[f])[n] - v) * k) : a[f] + ((b[f] ?? a[f]) - a[f]) * k;
  return out;
}
function staffAct(o, t, keys) {
  const v = tween(keys, t);
  o.ArmL_Upper = { r: v.U, p: [0, 0, 0], s: 1 }; o.ArmL_Lower = { r: [v.L, 0, 0], p: [0, 0, 0], s: 1 };
  return holdStaff(o, V3(...v.d), { frame: 'pelvis', slide: v.slide, plant: v.plant });
}
const _rest = (t) => ({ t, U: [0, 0, 0], L: 0, d: R0, slide: 0, plant: 1 });
const ACT = {
  COMBO: [_rest(0), { t: 0.12, U: [-10, 0, 14], L: -55, d: [0.85, 0.3, -0.3], slide: 0.22, plant: 0 }, { t: 0.25, U: [-42, 0, -6], L: -28, d: [0.1, 0.1, 1], slide: 0.22, plant: 0 }, { t: 0.35, U: [-40, 0, -14], L: -30, d: [-0.75, 0.05, 0.6], slide: 0.22, plant: 0 },
    { t: 0.45, U: [-25, 0, -8], L: -45, d: [-0.45, -0.3, 0.75], slide: 0.22, plant: 0 }, { t: 0.65, U: [-50, 0, 6], L: -35, d: [0.2, 0.8, 0.55], slide: 0.22, plant: 0 }, { t: 0.85, U: [14, 0, 8], L: -60, d: [0.05, 0.12, 1], slide: 0.42, plant: 0 },
    { t: 1.1, U: [-34, 0, 7], L: -36, d: [0, 0.08, 1], slide: 0.42, plant: 0 }, { t: 1.25, U: [-14, 0, 2], L: -30, d: [0.1, 0.75, 0.6], slide: 0.12, plant: 0 }, _rest(1.4)],
  SPIN: [_rest(0), { t: 0.2, U: [-6, 0, 16], L: -50, d: [0.6, 0.75, -0.25], slide: 0.15, plant: 0 }, { t: 0.45, U: [-8, 0, 22], L: -58, d: [0.8, 0.4, -0.45], slide: 0.22, plant: 0 }, { t: 0.6, U: [-38, 0, 28], L: -18, d: [0.75, 0.06, 0.65], slide: 0.22, plant: 0 },
    { t: 0.8, U: [-38, 0, 28], L: -18, d: [0.75, 0.06, 0.65], slide: 0.22, plant: 0 }, { t: 1.0, U: [-16, 0, 14], L: -26, d: [0.42, 0.82, 0.3], slide: 0.06, plant: 0 }, _rest(1.2)],
  GRAPPLE: [_rest(0), { t: 0.1, U: [-10, 0, 4], L: -30, d: [0.1, 0.8, 0.55], slide: 0.25, plant: 0 }, { t: 0.2, U: [-30, 0, 0], L: -40, d: [0, 0.12, 1], slide: 0.42, plant: 0 }, { t: 0.6, U: [-30, 0, 0], L: -40, d: [0, 0.12, 1], slide: 0.42, plant: 0 }, { t: 0.75, U: [-12, 0, 2], L: -30, d: [0.1, 0.8, 0.55], slide: 0.2, plant: 0 }, _rest(0.9)],
};

export const ANIMS = {
  IDLE: { dur: 3.0, loop: true, f: (t) => {
    const w = 2 * PI * t / 3, o = {};
    add(o, 'Pelvis', { p: [0, 0.004 * sin(w * 2), 0] });
    add(o, 'Torso', { r: [1.6 * sin(w * 2), 0, 0] });
    add(o, 'Head', { r: [2 * sin(w + 0.6), 5 * sin(w), 5 * sin(w + 1)] });
    ['Cloak_Back', 'Cloak_Left', 'Cloak_Right'].forEach((c, i) => add(o, c, { r: [2.5 * sin(w * 2 + i), 0, 0] }));
    add(o, 'ArmR_Upper', { r: [2 * sin(w * 2), 0, -2 * sin(w * 2)] }); add(o, 'ArmL_Upper', { r: [0, 0, 1.5 * sin(w * 2)] });
    holdStaff(o, V3(...R0), { plant: true });
    return fiaIdle(o, t);
  } },
  WALK: { dur: 1.1, loop: true, f: (t) => {
    const p = 2 * PI * t / 1.1, o = {};
    add(o, 'Pelvis', { p: [0, 0.018 * Math.abs(cos(p)) - 0.01, 0], r: [3, 5 * sin(p), 0] });
    add(o, 'Torso', { r: [2, -7 * sin(p), 0] });
    add(o, 'Head', { r: [-2, 4 * sin(p), 0] });
    add(o, 'LegL_Upper', { r: [-28 * sin(p), 0, 0] }); add(o, 'LegR_Upper', { r: [28 * sin(p), 0, 0] });
    add(o, 'LegL_Lower', { r: [32 * Math.max(0, sin(p + 1.4)), 0, 0] }); add(o, 'LegR_Lower', { r: [32 * Math.max(0, -sin(p + 1.4)), 0, 0] });
    add(o, 'FootL', { r: [10 * sin(p + 0.5), 0, 0] }); add(o, 'FootR', { r: [-10 * sin(p + 0.5), 0, 0] });
    add(o, 'ArmR_Upper', { r: [-20 * sin(p), 0, -3] }); add(o, 'ArmR_Lower', { r: [-12 - 8 * sin(p), 0, 0] });
    add(o, 'ArmL_Upper', { r: [-6 + 9 * sin(p), 0, -4] }); add(o, 'ArmL_Lower', { r: [-16 - 6 * sin(p), 0, 0] });
    add(o, 'Cloak_Back', { r: [10 + 3 * sin(2 * p), 0, 2 * sin(p)] }); add(o, 'Cloak_Left', { r: [8 + 3 * sin(2 * p + 1), 0, 0] }); add(o, 'Cloak_Right', { r: [8 + 3 * sin(2 * p + 2), 0, 0] });
    holdStaff(o, V3(0.15, 1, 0.07 + 0.11 * sin(p)), { plant: 0.5 + 0.5 * cos(p) });
    fiaIdle(o, t, 1); add(o, 'Fia_Body', { p: [0, 0.03 * sin(2 * p), 0] }); add(o, 'Fia_Core', { p: [0, 0.03 * sin(2 * p), 0] });
    return o;
  } },
  RUN: { dur: 0.65, loop: true, f: (t) => {
    const p = 2 * PI * t / 0.65, o = {};
    add(o, 'Pelvis', { p: [0, 0.035 * Math.abs(cos(p)) - 0.04, 0], r: [12, 8 * sin(p), 0] });
    add(o, 'Torso', { r: [10, -10 * sin(p), 0] }); add(o, 'Head', { r: [-14, 6 * sin(p), 0] });
    add(o, 'LegL_Upper', { r: [-48 * sin(p) - 10, 0, 0] }); add(o, 'LegR_Upper', { r: [48 * sin(p) - 10, 0, 0] });
    add(o, 'LegL_Lower', { r: [20 + 60 * Math.max(0, sin(p + 1.2)), 0, 0] }); add(o, 'LegR_Lower', { r: [20 + 60 * Math.max(0, -sin(p + 1.2)), 0, 0] });
    add(o, 'FootL', { r: [18 * sin(p + 0.5), 0, 0] }); add(o, 'FootR', { r: [-18 * sin(p + 0.5), 0, 0] });
    add(o, 'ArmR_Upper', { r: [-26 * sin(p), 0, -12] }); add(o, 'ArmR_Lower', { r: [-58 - 6 * sin(p), 0, 0] });
    add(o, 'ArmL_Upper', { r: [-4 + 9 * sin(p), 0, 4] }); add(o, 'ArmL_Lower', { r: [-62 - 6 * sin(p), 0, 0] });
    add(o, 'Cloak_Back', { r: [42 + 8 * sin(2 * p), 0, 4 * sin(p)] }); add(o, 'Cloak_Left', { r: [36 + 8 * sin(2 * p + 1), 0, 8] }); add(o, 'Cloak_Right', { r: [36 + 8 * sin(2 * p + 2), 0, -8] });
    holdStaff(o, V3(0.0, 1, 0.5 + 0.06 * sin(2 * p)));
    add(o, 'Fia_Pivot', { r: [0, 0, 0] });
    const trail = [0.16, -0.1 + 0.03 * sin(2 * p), -0.38];
    add(o, 'Fia_Body', { p: trail, r: [0, 720 * t / 0.65, 0] }); add(o, 'Fia_Core', { p: trail, s: 1.15 });
    return o;
  } },
  USE_ITEM: { dur: 1.2, loop: false, f: (t) => {
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.28, pose: { Pelvis: { p: [0, -0.012, 0.02], r: [3, -6, 0] }, Torso: { r: [7, -12, 0] }, Head: { r: [9, -4, 0] }, ArmR_Upper: { r: [-30, 0, -16] }, ArmR_Lower: { r: [-50, 0, 0] }, HandR: { r: [0, 0, 0] }, LegR_Upper: { r: [-8, 0, 0] }, LegR_Lower: { r: [8, 0, 0] }, Cloak_Back: { r: [-4, 0, 0] }, Fia_Body: { p: [0.12, -0.3, 0.3] }, Fia_Core: { s: 1.2 } } },
      { t: 0.5, pose: { Pelvis: { p: [0, -0.015, 0.03], r: [4, -7, 0] }, Torso: { r: [9, -13, 0] }, Head: { r: [11, -4, 0] }, ArmR_Upper: { r: [-36, 0, -16] }, ArmR_Lower: { r: [-44, 0, 0] }, HandR: { r: [0, -75, 0] }, LegR_Upper: { r: [-9, 0, 0] }, LegR_Lower: { r: [9, 0, 0] }, Cloak_Back: { r: [-5, 0, 0] }, Fia_Body: { p: [0.14, -0.31, 0.34] }, Fia_Core: { s: 1.9 } } },
      { t: 0.78, pose: { Pelvis: { p: [0, -0.015, 0.03], r: [4, -7, 0] }, Torso: { r: [9, -13, 0] }, Head: { r: [10, -4, 0] }, ArmR_Upper: { r: [-34, 0, -16] }, ArmR_Lower: { r: [-46, 0, 0] }, HandR: { r: [0, 15, 0] }, LegR_Upper: { r: [-9, 0, 0] }, LegR_Lower: { r: [9, 0, 0] }, Cloak_Back: { r: [-5, 0, 0] }, Fia_Body: { p: [0.13, -0.3, 0.32] }, Fia_Core: { s: 1.4 } } },
      { t: 0.95, pose: { Pelvis: { p: [0, -0.008, 0.015], r: [2, -4, 0] }, Torso: { r: [5, -8, 0] }, Head: { r: [4, -2, 0] }, ArmR_Upper: { r: [-18, 0, -8] }, ArmR_Lower: { r: [-34, 0, 0] }, Fia_Body: { p: [0.07, -0.14, 0.16] } } },
      { t: 1.2, pose: {} },
    ])(t);
    holdStaff(o, V3(0.15 + 0.03 * ease(clamp01(Math.min(t, 1.2 - t) / 0.28)), 1, 0.04 - 0.1 * ease(clamp01(Math.min(t, 1.2 - t) / 0.28))), { plant: true });
    const w = 2 * PI * t / 3, bob = 0.02 * sin(2 * w);
    add(o, 'Fia_Body', { p: [0, bob, 0], r: [0, 360 * t / 1.2, 0] });
    return o;
  } },
  DODGE_ROLL: { dur: 0.55, loop: false, f: (t) => {
    const tuck = { Torso: { r: [38, 0, 0] }, Head: { r: [18, 0, 0] }, LegL_Upper: { r: [-86, 0, 0] }, LegR_Upper: { r: [-86, 0, 0] }, LegL_Lower: { r: [91, 0, 0] }, LegR_Lower: { r: [91, 0, 0] }, ArmL_Upper: { r: [-18, 0, 22] }, ArmR_Upper: { r: [-18, 0, -24] }, ArmL_Lower: { r: [-66, 0, 0] }, ArmR_Lower: { r: [-66, 0, 0] } };
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.08, pose: { Pelvis: { p: [0, -0.18, 0], r: [25, 0, 0] }, Torso: { r: [30, 0, 0] }, Head: { r: [18, 0, 0] }, LegL_Upper: { r: [-60, 0, 0] }, LegR_Upper: { r: [-34, 0, 0] }, LegL_Lower: { r: [70, 0, 0] }, LegR_Lower: { r: [60, 0, 0] }, ArmL_Upper: { r: [-14, 0, 14] }, ArmR_Upper: { r: [-14, 0, -16] }, ArmL_Lower: { r: [-50, 0, 0] }, ArmR_Lower: { r: [-50, 0, 0] } } },
      { t: 0.2, pose: { Pelvis: { p: [0, -0.12, 0], r: [150, 0, 0] }, ...tuck, Fia_Body: { p: [0.1, 0.3, -0.2] }, Fia_Core: { s: 1.3 } } },
      { t: 0.34, pose: { Pelvis: { p: [0, -0.12, 0], r: [290, 0, 0] }, ...tuck, Cloak_Back: { r: [30, 0, 0] }, Fia_Body: { p: [0.1, 0.2, -0.3] }, Fia_Core: { s: 1.3 } } },
      { t: 0.45, pose: { Pelvis: { p: [0, -0.12, 0], r: [360, 0, 0] }, Torso: { r: [20, 0, 0] }, Head: { r: [8, 0, 0] }, LegL_Upper: { r: [-50, 0, 0] }, LegR_Upper: { r: [-20, 0, 0] }, LegL_Lower: { r: [70, 0, 0] }, LegR_Lower: { r: [40, 0, 0] }, ArmL_Upper: { r: [-12, 0, 8] }, ArmR_Upper: { r: [-16, 0, -8] }, ArmL_Lower: { r: [-30, 0, 0] }, Cloak_Back: { r: [25, 0, 0] } } },
      { t: 0.55, pose: { Pelvis: { r: [360, 0, 0] } } },
    ])(t);
    /* le bâton est tenu près du pied, couché sur le côté, le long de l'axe de la roulade : il ne touche ni le corps ni le sol */
    const k = ease(clamp01(t / 0.1)) * (1 - ease(clamp01((t - 0.42) / 0.13)));
    ['Cloak_Back', 'Cloak_Left', 'Cloak_Right'].forEach((c) => { o[c] = o[c] || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; o[c].fold = k; });
    return holdStaff(o, V3(...R0).lerp(V3(1, 0.14, 0.04), k), { slide: 0.4 * k, plant: 1 - k });
  } },
  COMBO_1_2_3: { dur: 1.4, loop: false, f: (t) => staffAct(_combo(t), t, ACT.COMBO) },
  CHARGED_SPIN_SLASH: { dur: 1.2, loop: false, f: (t) => staffAct(_spin(t), t, ACT.SPIN) },
  WAVE_OF_LIGHT: { dur: 1.0, loop: false, f: (t) => {
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.3, pose: { Pelvis: { p: [0, -0.05, 0] }, Torso: { r: [-8, 0, 0] }, Head: { r: [-20, 0, 0] }, ArmR_Upper: { r: [-150, 0, -38] }, ArmR_Lower: { r: [-4, 0, 0] }, HandR: { r: [0, 0, 0] }, ArmL_Upper: { r: [-10, 0, 10] }, LegL_Upper: { r: [-10, 0, 8] }, LegR_Upper: { r: [10, 0, -8] }, Fia_Core: { s: 2.4 }, Fia_Body: { p: [-0.05, 0.3, 0.25], s: 1.3 } } },
      { t: 0.45, pose: { Pelvis: { p: [0, -0.07, 0] }, Torso: { r: [-6, 0, 0] }, Head: { r: [-10, 0, 0] }, ArmR_Upper: { r: [-120, 0, -60] }, ArmR_Lower: { r: [-5, 0, 0] }, ArmL_Upper: { r: [-20, 0, 40] }, LegL_Upper: { r: [-15, 0, 12] }, LegR_Upper: { r: [15, 0, -12] }, Cloak_Back: { r: [30, 0, 0] }, Cloak_Left: { r: [25, 0, 25] }, Cloak_Right: { r: [25, 0, -25] }, Fia_Core: { s: 2.8 }, Fia_Body: { p: [-0.6, -0.42, 0.9], s: 1.5 } } },
      { t: 0.7, pose: { Pelvis: { p: [0, -0.04, 0] }, ArmR_Upper: { r: [-60, 0, -40] }, Cloak_Back: { r: [15, 0, 0] }, Fia_Core: { s: 1.6 }, Fia_Body: { p: [-0.4, -0.3, 0.6], s: 1.2 } } },
      { t: 1.0, pose: {} },
    ])(t);
    // orbite rapide de Fia : 2 tours entre 0,3 et 0,85 s
    const k = clamp01((t - 0.3) / 0.55);
    add(o, 'Fia_Pivot', { r: [0, 720 * ease(k), 0] });
    if (o.Fia_Core && o.Fia_Body) o.Fia_Core.p = o.Fia_Body.p.slice();
    return holdStaff(o, V3(...R0), { plant: true });
  } },
  LIGHT_GRAPPLE: { dur: 0.9, loop: false, f: (t) => {
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.18, pose: { Pelvis: { p: [0, -0.04, 0], r: [0, -20, 0] }, Torso: { r: [-4, -15, 0] }, Head: { r: [-5, 20, 0] }, ArmL_Upper: { r: [-92, 0, -12] }, ArmL_Lower: { r: [0, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-20, 0, -25] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, Staff_LightRing: { s: 1200 }, Fia_Core: { s: 1.6 } } },
      { t: 0.25, pose: { Pelvis: { p: [0, -0.05, 0], r: [0, -20, 0] }, Torso: { r: [-4, -15, 0] }, Head: { r: [-5, 20, 0] }, ArmL_Upper: { r: [-95, 0, -14] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-20, 0, -25] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, Staff_LightRing: { s: 1500 }, Fia_Core: { s: 2.2 }, Fia_Body: { p: [0.6, -0.06, 1.0] } } },
      { t: 0.6, pose: { Pelvis: { p: [0, -0.05, 0], r: [0, -20, 0] }, Torso: { r: [-4, -15, 0] }, ArmL_Upper: { r: [-95, 0, -14] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-20, 0, -25] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, Staff_LightRing: { s: 1500 }, Fia_Core: { s: 2.0 }, Fia_Body: { p: [0.6, -0.06, 1.0] } } },
      { t: 0.9, pose: {} },
    ])(t);
    if (o.Fia_Body) o.Fia_Core = { r: [0, 0, 0], p: o.Fia_Body.p.slice(), s: (o.Fia_Core || { s: 1 }).s };
    return staffAct(o, t, ACT.GRAPPLE);
  } },
  HIT_REACTION: { dur: 0.4, loop: false, f: (t) => {
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.08, pose: { Pelvis: { p: [0, -0.02, -0.03], r: [-8, 0, 0] }, Torso: { r: [-14, 6, 0] }, Head: { r: [-12, -10, 0] }, ArmL_Upper: { r: [-22, 0, 10] }, ArmL_Lower: { r: [-62, 0, 0] }, ArmR_Upper: { r: [-12, 0, -22] }, ArmR_Lower: { r: [-30, 0, 0] }, LegL_Upper: { r: [10, 0, 0] }, LegR_Upper: { r: [-12, 0, 0] }, LegR_Lower: { r: [15, 0, 0] } } },
      { t: 0.22, pose: { Pelvis: { p: [0, -0.02, -0.02], r: [-5, 0, 0] }, Torso: { r: [-9, 4, 0] }, Head: { r: [-8, -6, 0] }, ArmL_Upper: { r: [-20, 0, 10] }, ArmL_Lower: { r: [-58, 0, 0] }, ArmR_Upper: { r: [-10, 0, -18] }, ArmR_Lower: { r: [-24, 0, 0] }, LegR_Upper: { r: [-8, 0, 0] } } },
      { t: 0.4, pose: {} },
    ])(t);
    const kh = ease(clamp01(Math.min(t / 0.08, (0.4 - t) / 0.16)));
    holdStaff(o, V3(...R0).lerp(V3(-0.28, 1, 0.5), kh), { plant: 1 - kh });
    const frame = Math.round(t * FPS);
    add(o, 'Fia_Core', { s: frame % 2 ? 0.45 : 1.35 }); add(o, 'Fia_Body', { s: frame % 2 ? 0.8 : 1.05 });
    return o;
  } },
  DEFEATED: { dur: 2.5, loop: false, f: (t) => { const o = _defeated(t), k = ease(clamp01((t - 1.35) / 0.6));
    const dir = V3(R0[0] + 0.16 * ease(clamp01(t / 0.6)), R0[1], R0[2]).lerp(V3(1, 0.0, 0.1), k);
    return holdStaff(o, dir, { plant: ease(clamp01(t / 0.35)) * (1 - k), pos: V3(0.12, 0.04, 0.95), k }); } },

};

/* Fiches de combat (données de jeu) */
export const MOVES = {
  COMBO_1_2_3: { type: 'Mêlée (bâton)', duration: 1.4, phases: [{ name: 'Coup 1 · balayage horizontal', windup: [0, 0.12], active: [0.18, 0.3], hit: 0.25 }, { name: 'Coup 2 · frappe diagonale montante', windup: [0.3, 0.45], active: [0.58, 0.7], hit: 0.65 }, { name: 'Coup 3 · estoc', windup: [0.7, 0.85], active: [1.02, 1.14], hit: 1.1 }], recovery: [1.14, 1.4], range: 1.8, area: { shape: 'cône avant', radius: 1.8, arc: 110 }, cooldown: 0.2, telegraph: 'L’anneau du bâton s’illumine à chaque coup.' },
  CHARGED_SPIN_SLASH: { type: 'Zone rapprochée', duration: 1.2, windup: [0, 0.45], active: [0.55, 0.8], hit: 0.65, recovery: [0.65, 1.2], range: 2.4, area: { shape: 'cercle complet autour de Lyra', radius: 2.4, arc: 360 }, cooldown: 3.0, telegraph: 'Accroupie, bâton en arrière, la pointe accumule la lumière (anneau ×16, Fia ×1,8).' },
  WAVE_OF_LIGHT: { type: 'Capacité de zone (traverse les boucliers)', duration: 1.0, windup: [0, 0.3], active: [0.4, 0.85], hit: 0.45, recovery: [0.45, 1.0], range: 3.5, area: { shape: 'anneau / cercle', radius: 3.5, arc: 360 }, cooldown: 5.0, telegraph: 'Main libre levée, le cœur de Fia gonfle (×2,4) puis Fia tourne deux fois autour de Lyra.' },
  LIGHT_GRAPPLE: { type: 'Utilitaire / déplacement', duration: 0.9, windup: [0, 0.18], active: [0.25, 0.6], hit: 0.25, recovery: [0.6, 0.9], range: 12, area: { shape: 'ligne droite', length: 12, width: 0.8 }, cooldown: 2.0, telegraph: 'Bâton pointé, Fia file vers la pointe et projette le câble de lumière.' },
  DODGE_ROLL: { type: 'Esquive (invulnérable)', duration: 0.55, invulnerable: [0.05, 0.45], cooldown: 0.5 },
  USE_ITEM: { type: 'Interaction (prisme, clé, porte, coffre)', duration: 1.2, windup: [0, 0.28], active: [0.45, 0.8], hit: 0.5, recovery: [0.8, 1.2], telegraph: 'Main droite tendue, tour de poignet (clé ou prisme), Fia vient éclairer le geste. L\'objet agit à 0,50 s.' },
  HIT_REACTION: { type: 'Réaction', duration: 0.4 },
  DEFEATED: { type: 'Défaite', duration: 2.5 },
};


/* =========================================================
   Tissus rigides sans traversée : les pans de la tunique suivent les jambes, la cape s'écarte de ce qui
   passe derrière le corps (jambes, bras, bâton) et ne traverse jamais le sol. Calcul sur des points témoins.
   ========================================================= */
const _mul = (...m) => m.reduce((a, b) => a.clone().multiply(b));
const _pt = (m, x, y, z, r) => ({ p: new THREE.Vector3(x, y, z).applyMatrix4(m), r });
function clearAngle(H, sigma, axis, L, range, pts, margin = 0.014) {
  let need = -1e9;
  for (const q of pts) {
    const dx = q.p.x - H[0], dy = q.p.y - H[1], dz = q.p.z - H[2], w = axis === 'z' ? dx : dz;
    if (w < range[0] - q.r || w > range[1] + q.r) continue;
    const u = -dy, v = sigma * (axis === 'z' ? dz : dx), rho = Math.hypot(u, v), rr = q.r + margin;
    if (rho > L + q.r || rho <= rr) continue;
    need = Math.max(need, (Math.atan2(v, u) + Math.asin(rr / rho)) / D2R);
  }
  return Math.min(need, 150);
}
function legPts(o, n) {
  const U = jointMat('Leg' + n + '_Upper', o), Lw = _mul(U, jointMat('Leg' + n + '_Lower', o)), F = _mul(Lw, jointMat('Foot' + n, o));
  return [_pt(U, 0, -0.1, 0, 0.082), _pt(Lw, 0, 0, 0, 0.085), _pt(Lw, 0, -0.06, 0, 0.102), _pt(Lw, 0, -0.13, 0, 0.09), _pt(F, 0, 0, 0, 0.09), _pt(F, 0, -0.06, -0.06, 0.078), _pt(F, 0, -0.06, 0.06, 0.088), _pt(F, 0, -0.06, 0.16, 0.072)];
}
export function solveFlaps(o) {
  const tips = [];
  [['L', 1], ['R', -1]].forEach(([n, s]) => {
    const pts = legPts(o, n), xr = s > 0 ? [0, 0.175] : [-0.175, 0];
    const tf = Math.max(7, clearAngle(REST['Flap_F' + n].p, 1, 'z', 0.245, xr, pts)), tb = Math.max(7, clearAngle(REST['Flap_B' + n].p, -1, 'z', 0.24, xr, pts));
    const ts = Math.max(8, clearAngle(REST['Flap_S' + n].p, s, 'x', 0.22, [-0.11, 0.11], pts));
    o['Flap_F' + n] = { r: [-(tf - 7), 0, 0], p: [0, 0, 0], s: 1 }; o['Flap_B' + n] = { r: [tb - 7, 0, 0], p: [0, 0, 0], s: 1 }; o['Flap_S' + n] = { r: [0, 0, s * (ts - 8)], p: [0, 0, 0], s: 1 };
    const H = REST['Flap_B' + n].p, a = tb * D2R;
    tips.push({ p: new THREE.Vector3(H[0] + s * 0.09, H[1] - Math.cos(a) * 0.22, H[2] - Math.sin(a) * 0.22), r: 0.04 }, { p: new THREE.Vector3(H[0] + s * 0.09, H[1] - Math.cos(a) * 0.11, H[2] - Math.sin(a) * 0.11), r: 0.035 });
  });
  return tips;
}
const CLOAK = { Cloak_Back: { L: 0.64, range: [-0.27, 0.27], corners: [[-0.265, 0.555], [0.265, 0.555], [0, 0.65], [-0.2, 0.2], [0.2, 0.2]] }, Cloak_Left: { L: 0.56, range: [0.17, 0.37], corners: [[0.365, 0.46], [0.33, 0.54], [0.262, 0.5], [0.3, 0.2]] }, Cloak_Right: { L: 0.56, range: [-0.37, -0.17], corners: [[-0.365, 0.46], [-0.33, 0.54], [-0.262, 0.5], [-0.3, 0.2]] } };
export function solveCloak(o, flapTips = []) {
  const Tm = jointMat('Torso', o), Ti = Tm.clone().invert(), W = _mul(jointMat('Pelvis', o), Tm);
  const inT = (q, grow = 0) => ({ p: q.p.clone().applyMatrix4(Ti), r: q.r + grow });
  const body = [...legPts(o, 'L'), ...legPts(o, 'R')].map((q) => inT(q, 0.012)).concat(flapTips.map((q) => inT(q)), [inT({ p: new THREE.Vector3(0, -0.03, -0.06), r: 0.125 })]);
  const arm = (n) => { const A = jointMat('Arm' + n + '_Upper', o), Lo = _mul(A, jointMat('Arm' + n + '_Lower', o)), Hd = _mul(Lo, jointMat('Hand' + n, o)); return { pts: [_pt(A, 0, -0.17, 0, 0.08), _pt(Lo, 0, -0.05, 0, 0.075), _pt(Lo, 0, -0.1, 0, 0.082), _pt(Hd, 0, -0.055, 0.02, 0.07)], Hd }; };
  const aL = arm('L'), aR = arm('R'), St = _mul(aL.Hd, jointMat('Staff', o));
  const staff = [-0.47, -0.36, -0.25, -0.14, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((y) => _pt(St, 0, y, 0, 0.032)).concat([_pt(St, 0.07, 0.88, 0, 0.075)]);
  const obst = { Cloak_Back: [...body, ...aL.pts, ...aR.pts, ...staff], Cloak_Left: [...body, ...aL.pts, ...staff], Cloak_Right: [...body, ...aR.pts, ...staff] };
  const Hm = jointMat('Head', o), rim = [[0, -0.03, -0.27], [0.17, -0.03, -0.21], [-0.17, -0.03, -0.21], [0.25, -0.03, -0.08], [-0.25, -0.03, -0.08]].map(([x, y, z]) => new THREE.Vector3(x, y, z).applyMatrix4(Hm));
  const ceil = (H) => { let m = 150; for (const q of rim) { const u = -(q.y - H[1]), v = -(q.z - H[2]), rho = Math.hypot(u, v); if (v > 0.02 && rho > 0.06) m = Math.min(m, (Math.atan2(v, u) - Math.asin(Math.min(1, 0.05 / rho))) / D2R); } return m; };
  const e = W.elements;
  Object.entries(CLOAK).forEach(([name, c]) => {
    const H = REST[name].p, rest = REST[name].r[0];
    const top = ceil(H), needA = clearAngle(H, -1, 'z', c.L, c.range, obst[name]);
    let th = Math.max(rest, Math.min(top, rest + ((o[name] && o[name].r) ? o[name].r[0] : 0)), needA), cut = 1;
    if (th > top) { th = Math.max(rest, top); let lim = c.L; for (const q of obst[name]) { const dx = q.p.x - H[0], u = -(q.p.y - H[1]), v = -(q.p.z - H[2]), rho = Math.hypot(u, v), rr = q.r + 0.014; if (dx < c.range[0] - q.r || dx > c.range[1] + q.r || rho <= rr) continue; if ((Math.atan2(v, u) + Math.asin(rr / rho)) / D2R > th) lim = Math.min(lim, rho - rr); } cut = Math.max(0.12, lim / c.L); }
    /* sol : hauteur du point le plus bas du panneau pour un angle et des échelles donnés */
    const low = (a, sx, sy) => { let m = 1e9; const ca = Math.cos(a * D2R), sa = Math.sin(a * D2R); for (const [x, rho] of c.corners) { const px = H[0] + x * sx, py = H[1] - rho * sy * ca, pz = H[2] - rho * sy * sa; const y = e[1] * px + e[5] * py + e[9] * pz + e[13]; if (y < m) m = y; } return m; };
    let sx = 1, sy = Math.min(cut, 1 - 0.82 * ((o[name] && o[name].fold) || 0)); const G = 0.03;
    if (low(th, 1, sy) < G) {
      let best = th, bl = low(th, 1, sy);
      for (let a = th; a <= Math.max(th, top); a += 2.5) { const l = low(a, 1, sy); if (l > bl) { bl = l; best = a; } if (l >= G) break; }
      th = best;
      for (let k = 0; k < 14 && low(th, sx, sy) < G; k++) { if (sx > 0.3) sx -= 0.1; else sy -= 0.08; }
    }
    o[name] = { r: [th - rest, 0, 0], p: [0, 0, 0], s: sx === 1 && sy === 1 ? 1 : [sx, Math.max(0.2, sy), 1] };
  });
  return o;
}

/* =========================================================
   Corps sans traversée : capsules témoins (tête et capuche, buste, hanches, jambes, bras). Les avant-bras
   s'écartent s'ils entrent dans le corps ; le bâton pivote autour de la main s'il touche le corps ou le sol.
   ========================================================= */
function segDist(p1, q1, p2, q2) {
  const d1 = q1.clone().sub(p1), d2 = q2.clone().sub(p2), r = p1.clone().sub(p2), a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
  let s = 0, t = 0;
  if (a <= 1e-12 && e <= 1e-12) return r.length();
  if (a <= 1e-12) t = Math.min(1, Math.max(0, f / e));
  else { const c = d1.dot(r); if (e <= 1e-12) s = Math.min(1, Math.max(0, -c / a)); else { const b = d1.dot(d2), den = a * e - b * b; s = den > 1e-12 ? Math.min(1, Math.max(0, (b * f - c * e) / den)) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = Math.min(1, Math.max(0, -c / a)); } else if (t > 1) { t = 1; s = Math.min(1, Math.max(0, (b - c) / a)); } } }
  return p1.clone().addScaledVector(d1, s).distanceTo(p2.clone().addScaledVector(d2, t));
}
const _cap = (m, a, b, r, tag) => ({ a: new THREE.Vector3(...a).applyMatrix4(m), b: new THREE.Vector3(...b).applyMatrix4(m), r, tag });
function bodyCaps(o) {
  const Wp = jointMat('Pelvis', o), Wt = _mul(Wp, jointMat('Torso', o)), Wh = _mul(Wt, jointMat('Head', o)), k = REST.Head.s || 1, caps = [];
  caps.push(_cap(Wh, [0, 0.19, -0.01], [0, 0.19, -0.01], 0.352 * k, 'head'), _cap(Wh, [0, 0.42, -0.04], [0, 0.42, -0.04], 0.29 * k, 'head'), _cap(Wh, [0, 0.2, 0.07], [0, 0.3, 0.07], 0.3 * k, 'head'));
  caps.push(_cap(Wt, [0, 0.21, 0], [0, 0.3, 0], 0.24, 'mantle'), _cap(Wt, [0, -0.02, 0], [0, 0.2, 0], 0.158, 'tunic'), _cap(Wp, [0, 0.03, 0], [0, -0.13, 0], 0.19, 'hips'));
  ['L', 'R'].forEach((n) => { const U = _mul(Wp, jointMat('Leg' + n + '_Upper', o)), Lw = _mul(U, jointMat('Leg' + n + '_Lower', o)), F = _mul(Lw, jointMat('Foot' + n, o)); caps.push(_cap(U, [0, -0.02, 0], [0, -0.19, 0], 0.088, 'leg' + n), _cap(Lw, [0, 0, 0], [0, -0.19, 0], 0.098, 'leg' + n), _cap(F, [0, -0.06, -0.06], [0, -0.06, 0.15], 0.085, 'leg' + n)); });
  ['L', 'R'].forEach((n) => { const s = n === 'L' ? 1 : -1; [['Flap_F' + n, [0.04 * s, 0.13 * s]], ['Flap_B' + n, [0.04 * s, 0.13 * s]], ['Flap_S' + n, [0, 0]]].forEach(([j, xs]) => { if (!o[j]) return; const m = _mul(Wp, jointMat(j, o)); if (j[5] === 'S') caps.push(_cap(m, [0, 0, -0.06], [0, -0.2, -0.06], 0.042, 'flap'), _cap(m, [0, 0, 0.06], [0, -0.2, 0.06], 0.042, 'flap')); else xs.forEach((x) => caps.push(_cap(m, [x, 0, 0], [x, -0.22, 0], 0.032, 'flap'))); }); });
  return { caps, Wp, Wt };
}
function armMats(o, Wt, n) { const A = _mul(Wt, jointMat('Arm' + n + '_Upper', o)), Lo = _mul(A, jointMat('Arm' + n + '_Lower', o)), Hd = _mul(Lo, jointMat('Hand' + n, o)); return { A, Lo, Hd }; }
const pen = (list, caps, skip) => { let s = 0; for (const x of list) for (const c of caps) { if (skip && skip(x, c)) continue; const d = x.r + c.r - segDist(x.a, x.b, c.a, c.b); if (d > 0) s += d; } return s; };
export function solveArms(o) {
  const { caps, Wt } = bodyCaps(o);
  [['L', 1], ['R', -1]].forEach(([n, s]) => {
    const base = (o['Arm' + n + '_Upper'] && o['Arm' + n + '_Upper'].r) ? o['Arm' + n + '_Upper'].r.slice() : [0, 0, 0];
    const cur = o['Arm' + n + '_Upper'] || (o['Arm' + n + '_Upper'] = { r: [0, 0, 0], p: [0, 0, 0], s: 1 });
    const score = () => { const m = armMats(o, Wt, n); return pen([_cap(m.Lo, [0, -0.03, 0], [0, -0.105, 0], 0.086, 'fore'), _cap(m.Hd, [0, -0.055, 0.02], [0, -0.055, 0.02], 0.064, 'hand'), _cap(m.A, [0, -0.012, 0], [0, -0.17, 0], 0.09, 'upper')], caps, (x, c) => c.tag === 'mantle' || c.tag === 'flap' && x.tag !== 'hand' || (x.tag === 'upper' && c.tag !== 'head')); };
    let best = score(), bz = 0, be = 1; if (best < 1e-4) return;
    const low = o['Arm' + n + '_Lower'] || (o['Arm' + n + '_Lower'] = { r: [0, 0, 0], p: [0, 0, 0], s: 1 }), lb = (low.r || [0, 0, 0]).slice();
    let bf = 1, bcost = best;
    search: for (const f of [1, 0.85, 0.7, 0.55, 0.4, 0.25]) for (const e of [1, 0.8, 0.6, 0.4, 0.2]) for (let dz = 0; dz <= 60; dz += 4) {
      cur.r = [base[0] * f, base[1], base[2] * f + s * dz]; low.r = [lb[0] * e, lb[1], lb[2]];
      const raw = score(), cost = raw + dz * 1e-5 + (1 - e) * 2e-3 + (1 - f) * 4e-3; if (cost < bcost) { bcost = cost; bz = dz; be = e; bf = f; } if (raw < 1e-4) break search;
    }
    cur.r = [base[0] * bf, base[1], base[2] * bf + s * bz]; low.r = [lb[0] * be, lb[1], lb[2]];
    [cur, low].forEach((c) => { if (!c.p) c.p = [0, 0, 0]; if (c.s === undefined) c.s = 1; });
  });
  return o;
}
const STAFF_Y = [-0.475, -0.24, 0, 0.25, 0.5, 0.8];
function staffScore(S, caps) {
  const P = STAFF_Y.map((y) => new THREE.Vector3(0, y, 0).applyMatrix4(S)), list = [];
  for (let i = 0; i < P.length - 1; i++) list.push({ a: P[i], b: P[i + 1], r: 0.03 });
  const ck = new THREE.Vector3(0.06, 0.875, 0).applyMatrix4(S); list.push({ a: ck, b: ck, r: 0.088 });
  let s = pen(list, caps);
  for (const p of P) if (p.y < 0.027) s += 0.027 - p.y;
  if (ck.y < 0.095) s += 0.095 - ck.y;
  return s;
}
function setStaffWorld(o, parent, g, q) {
  const loc = parent.clone().invert().multiply(new THREE.Matrix4().compose(g, q, new THREE.Vector3(1, 1, 1)));
  const p = new THREE.Vector3(), lq = new THREE.Quaternion(), ls = new THREE.Vector3(); loc.decompose(p, lq, ls);
  const e = new THREE.Euler().setFromQuaternion(lq, 'XYZ');
  o.Staff = { r: [e.x / D2R - REST.Staff.r[0], e.y / D2R - REST.Staff.r[1], e.z / D2R - REST.Staff.r[2]], p: [p.x - REST.Staff.p[0], p.y - REST.Staff.p[1], p.z - REST.Staff.p[2]], s: 1 };
}
export function staffHits(o) { const { caps, Wt } = bodyCaps(o), L = armMats(o, Wt, 'L'), S = _mul(L.Hd, jointMat('Staff', o)), out = {}; caps.concat([_cap(L.A, [0, 0, 0], [0, -0.17, 0], 0.07, 'armL'), _cap(L.Lo, [0, 0, 0], [0, -0.098, 0], 0.06, 'armL')]).forEach((c) => { const s = staffScore(S, [c]); if (s > 0) out[c.tag] = +((out[c.tag] || 0) + s).toFixed(4); }); out.ground = +staffScore(S, []).toFixed(4); return out; }
export function solveStaff(o) {
  const { caps, Wt } = bodyCaps(o), L = armMats(o, Wt, 'L'), R = armMats(o, Wt, 'R');
  caps.push(_cap(L.A, [0, 0, 0], [0, -0.17, 0], 0.07, 'armL'), _cap(L.Lo, [0, 0, 0], [0, -0.098, 0], 0.06, 'armL'), _cap(R.A, [0, 0, 0], [0, -0.17, 0], 0.075, 'armR'), _cap(R.Lo, [0, 0, 0], [0, -0.11, 0], 0.085, 'armR'), _cap(R.Hd, [0, -0.055, 0.02], [0, -0.055, 0.02], 0.07, 'armR'));
  const S0 = _mul(L.Hd, jointMat('Staff', o)), s0 = staffScore(S0, caps);
  if (s0 < 1e-4) return o;
  const g = new THREE.Vector3(), q0 = new THREE.Quaternion(), sc = new THREE.Vector3(); S0.decompose(g, q0, sc);
  const x0 = new THREE.Vector3(1, 0, 0).applyQuaternion(q0), z0 = new THREE.Vector3(0, 0, 1).applyQuaternion(q0);
  const M = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
  const at = (az, ang) => new THREE.Quaternion().setFromAxisAngle(x0.clone().multiplyScalar(Math.cos(az)).addScaledVector(z0, Math.sin(az)), ang * D2R).multiply(q0);
  const scAt = (az, ang) => staffScore(M.compose(g, at(az, ang), one), caps);
  let best = s0, bAz = 0, bAng = 0;
  for (let ang = 6; ang <= 132 && best > 1e-4; ang += 6) for (let k = 0; k < 24; k++) { const az = (k / 24) * Math.PI * 2, s = scAt(az, ang); if (s < best - 1e-6) { best = s; bAz = az; bAng = ang; } }
  if (best <= 1e-4) {   /* affinage : plus petite rotation suffisante, direction et angle ajustés finement */
    for (let pass = 0; pass < 2; pass++) {
      let lo = Math.max(0, bAng - 6), hi = bAng; for (let i = 0; i < 6; i++) { const mid = (lo + hi) / 2; if (scAt(bAz, mid) <= 1e-4) hi = mid; else lo = mid; } bAng = hi;
      let bestA = bAng, bestZ = bAz; for (const dz of [-0.2, -0.13, -0.065, 0.065, 0.13, 0.2]) { let l = Math.max(0, bAng - 6), h = bAng; if (scAt(bAz + dz, h) > 1e-4) continue; for (let i = 0; i < 5; i++) { const mid = (l + h) / 2; if (scAt(bAz + dz, mid) <= 1e-4) h = mid; else l = mid; } if (h < bestA - 0.05) { bestA = h; bestZ = bAz + dz; } }
      bAng = bestA; bAz = bestZ;
    }
    bAng += 1.0;
  }
  const bq = at(bAz, bAng);
  setStaffWorld(o, L.Hd, g, bq);
  Object.defineProperty(o, '_fix', { value: { ang: bq.angleTo(q0) / D2R, left: best }, enumerable: false, configurable: true });
  return o;
}
/* recalage au sol (exact, sur les maillages du corps) : rien ne passe sous Y = 0 */
let _gm = null;
function groundShift(d, exact) {
  if (!_gm) { const b = buildLyra(); const by = {}; b.root.traverse((n) => { if (n.name) by[n.name] = n; }); const ms = []; b.root.traverse((n) => { if (n.isMesh && /^(Pelvis|Torso|Head|Hood|Hair_Bangs|Arm|Hand|Leg|Foot)/.test(n.name) && !n.name.endsWith('_Outline')) ms.push(n); }); _gm = { root: b.root, by, ms }; }
  JOINTS.forEach((j) => { const n = _gm.by[j], r = REST[j]; if (!n || !r) return; const x = d[j] || {}; n.position.set(r.p[0] + (x.p ? x.p[0] : 0), r.p[1] + (x.p ? x.p[1] : 0), r.p[2] + (x.p ? x.p[2] : 0)); n.rotation.set((r.r[0] + (x.r ? x.r[0] : 0)) * D2R, (r.r[1] + (x.r ? x.r[1] : 0)) * D2R, (r.r[2] + (x.r ? x.r[2] : 0)) * D2R); });
  _gm.root.updateMatrixWorld(true);
  let m = 1e9;
  for (const n of _gm.ms) { const e = n.matrixWorld.elements, p = n.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const y = e[1] * p[i] + e[5] * p[i + 1] + e[9] * p[i + 2] + e[13]; if (y < m) m = y; } }
  if (m < 0 || exact) { d.Pelvis = d.Pelvis || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; d.Pelvis.p = [d.Pelvis.p[0], d.Pelvis.p[1] - m, d.Pelvis.p[2]]; }
}
/* Fia ne traverse ni le sol ni la capuche : elle est repoussée hors d'une bulle autour de la tête et au-dessus du sol */
export function solveFia(o) {
  const Tm = jointMat('Torso', o), W = _mul(jointMat('Pelvis', o), Tm), Pv = jointMat('Fia_Pivot', o), B = jointMat('Fia_Body', o);
  const head = new THREE.Vector3(0, 0.29, 0).applyMatrix4(jointMat('Head', o));           // centre de la tête (repère du buste)
  const pos = new THREE.Vector3().setFromMatrixPosition(_mul(Pv, B)), from = pos.clone();   // Fia (repère du buste)
  const d = pos.clone().sub(head), R = 0.5; if (d.length() < R) { if (d.lengthSq() < 1e-6) d.set(-1, 0, 0); pos.copy(head).addScaledVector(d.normalize(), R); }
  const wy = pos.clone().applyMatrix4(W).y; if (wy < 0.2) { const up = new THREE.Vector3(0, 1, 0).transformDirection(W.clone().invert()); pos.addScaledVector(up, 0.2 - wy); }
  if (pos.distanceToSquared(from) > 1e-10) {
    const dv = pos.clone().sub(from), len = dv.length(), dl = dv.transformDirection(Pv.clone().invert()).multiplyScalar(len);   // déplacement dans le repère du pivot
    const add3 = (x) => { const c = x || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; return { r: (c.r || [0, 0, 0]).slice(), p: [0, 1, 2].map((i) => ((c.p || [0, 0, 0])[i]) + dl.getComponent(i)), s: c.s ?? 1 }; };
    o.Fia_Body = add3(o.Fia_Body);
  }
  return o;
}
/* pose complète et sans traversée à l'instant t */
export function restScores() { const o = {}; solveFlaps(o); const { caps, Wt } = bodyCaps(o); const L = armMats(o, Wt, 'L'), S = _mul(L.Hd, jointMat('Staff', o)); const out = {}; caps.concat([_cap(L.A, [0, 0, 0], [0, -0.17, 0], 0.07, 'armL'), _cap(L.Lo, [0, 0, 0], [0, -0.098, 0], 0.06, 'armL')]).forEach((c) => { const s = staffScore(S, [c]); if (s > 0) out[c.tag] = (out[c.tag] || 0) + s; }); return out; }
/* Termine une pose (écarts par rapport au repos) : pans, bras, bâton, sol, Fia, cape. À appeler sur toute pose, même mélangée. */
export function finishPose(d, exact = false) {
  const tips = solveFlaps(d);
  solveArms(d);
  if (d._staff) holdStaff(d, d._staff.dir, d._staff.opt);
  groundShift(d, exact);
  if (d._staff && d._staff.opt.plant) holdStaff(d, d._staff.dir, d._staff.opt);
  if (!(d._staff && d._staff.opt.pos)) solveStaff(d);
  solveFia(d);
  return solveCloak(d, tips);
}
/* pose complète et sans traversée à l'instant t */
export function poseAt(name, t) { return finishPose(ANIMS[name].f(t), name === 'DEFEATED' && t >= 2.2); }

/* Échantillonnage d'une animation : pour chaque image, transformations locales complètes de chaque articulation */
export function sample(name) {
  const A = ANIMS[name], n = Math.round(A.dur * FPS) + 1, frames = [];
  for (let i = 0; i < n; i++) {
    const t = Math.min(A.dur, i / FPS);
    const d = poseAt(name, A.loop && i === n - 1 ? 0 : t);
    const fr = { t: +t.toFixed(4), j: {} };
    JOINTS.forEach((j) => {
      const r = REST[j] || { p: [0, 0, 0], r: [0, 0, 0] }, x = d[j] || { r: [0, 0, 0], p: [0, 0, 0], s: 1 };
      if (j === 'Fia_Core' && d.Fia_Body) x.p = d.Fia_Body.p.slice();   // le cœur reste dans le cristal
      let s = Array.isArray(x.s) ? x.s.map((v) => v * (r.s || 1)) : (x.s ?? 1) * (r.s || 1);
      if (j === 'Staff_LightRing') s = 0.001 * s;      // anneau de lumière caché au repos
      fr.j[j] = { r: [0, 1, 2].map((k) => r.r[k] + x.r[k]), p: [0, 1, 2].map((k) => r.p[k] + x.p[k]), s };
    });
    frames.push(fr);
  }
  return { name, dur: A.dur, loop: A.loop, frames };
}
export function toClip(name, S = sample(name)) {
  const times = S.frames.map((f) => f.t), tracks = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  JOINTS.forEach((j) => {
    const qv = [], pv = [], sv = [];
    let prev = null;
    S.frames.forEach((f) => {
      const v = f.j[j];
      e.set(v.r[0] * D2R, v.r[1] * D2R, v.r[2] * D2R, 'XYZ'); q.setFromEuler(e);
      if (prev && prev.dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w);   // continuité des quaternions
      prev = q.clone();
      qv.push(q.x, q.y, q.z, q.w); pv.push(...v.p); if (Array.isArray(v.s)) sv.push(...v.s); else sv.push(v.s, v.s, v.s);
    });
    tracks.push(new THREE.QuaternionKeyframeTrack(j + '.quaternion', times, qv));
    tracks.push(new THREE.VectorKeyframeTrack(j + '.position', times, pv));
    tracks.push(new THREE.VectorKeyframeTrack(j + '.scale', times, sv));
  });
  return new THREE.AnimationClip(name, S.dur, tracks);
}
