/* =========================================================
   LUMEN — kit de modèles 3D (personnages, créatures, boss, objets).
   Même style que Lyra : low-poly facetté, aucune sphère, couleurs par sommet, contour noir en
   « coque inversée » (géométrie), pièces rigides nommées et articulées, animations par poses.
   Utilisable dans le navigateur (jeu, aperçus) et dans Node (export GLB, contrôles).
   Repère : Y vers le haut, le modèle regarde vers +Z, sol à Y = 0, unité = 1 m.
   ========================================================= */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export { THREE, mergeGeometries };
export const D2R = Math.PI / 180;
const LIGHT = new THREE.Vector3(0.35, 0.85, 0.5).normalize(), LIGHT2 = new THREE.Vector3(-0.45, 0.45, -0.77).normalize();
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* Couleurs : sRGB brut pour l'export GLB et les aperçus, linéaire dans le jeu (setLinear(true)) */
let LINEAR = false;
export const setLinear = (v) => { LINEAR = !!v; };
const toLin = (v) => (v < 0.04045 ? v * 0.0773993808 : Math.pow(v * 0.9478672986 + 0.0521327014, 2.4));
const rawS = (hex) => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const raw = (hex) => (LINEAR ? rawS(hex).map(toLin) : rawS(hex));
const mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const hexOf = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
const lighten = (hex, k = 0.14) => hexOf(rawS(hex).map((v) => v + (1 - v) * k));
const darken = (hex, k = 0.2) => hexOf(rawS(hex).map((v) => v * (1 - k)));

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


export { V, hexOf, lighten, darken, facet, T, prism, box, stripAttrs, Soup, ringPt, loft, band, disc, star4, slab };
export const gem = (r) => new THREE.OctahedronGeometry(r, 0);
export const mixHex = (a, b, k) => hexOf(rawS(a).map((v, i) => v + (rawS(b)[i] - v) * k));

/* ---------- matériaux (un jeu par modèle) ---------- */
export function materials(prefix = 'M') {
  return {
    body: new THREE.MeshStandardMaterial({ name: prefix + '_Body', vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 }),
    outline: new THREE.MeshBasicMaterial({ name: prefix + '_Outline', vertexColors: true, color: 0xffffff }),
    /* pièces lumineuses : couleur exacte de la palette, non éclairée (yeux, cœurs, runes, feux follets) */
    glow: (name) => new THREE.MeshBasicMaterial({ name: prefix + '_Glow_' + name, vertexColors: true }),
  };
}
/* Pièce : liste de [géométrie, couleur, couleur claire] → maillage nommé + son contour noir (enfant « Nom_Outline »).
   opt.mat : matériau ; opt.outline : false pour les pièces lumineuses ; opt.offset : épaisseur du contour (m) ;
   opt.solid : géométries fermées servant au contour et au contrôle des traversées (les décors plats en sont exclus) ;
   opt.shell : true pour une coque ouverte (capuche, coquille) : le contrôle teste alors la proximité de sa surface. */
export function part(name, pieces, M, opt = {}) {
  const geo = mergeGeometries(pieces.map(([g, c, l]) => facet(g, c, l)));
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, opt.mat || M.body); mesh.name = name;
  if (opt.solid) mesh.userData.solid = mergeGeometries(opt.solid.map(stripAttrs));
  if (opt.shell) mesh.userData.shell = true;
  if (opt.outline === false) mesh.userData.glow = true;
  else mesh.add(outline(opt.solid ? mesh.userData.solid : geo, name, M, opt.offset ?? 0.015));
  return mesh;
}
export function outline(geo, name, M, offset = 0.015) {
  let g = stripAttrs(geo);
  g = mergeVertices(g, 1e-4);
  g.computeVertexNormals();
  const p = g.attributes.position, nrm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + nrm.getX(i) * offset, p.getY(i) + nrm.getY(i) * offset, p.getZ(i) + nrm.getZ(i) * offset);
  const idx = g.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  g = g.toNonIndexed(); g.deleteAttribute('normal');
  g.computeVertexNormals();
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  const m = new THREE.Mesh(g, M.outline); m.name = name + '_Outline';
  return m;
}
/* pose une forme plate (face +Z) sur la surface d'un maillage, au point visé par un rayon, décollée de « off » */
export function stickOn(target, g, from, dir, off = 0.003, spin = 0) {
  const probe = target.isMesh ? target : new THREE.Mesh(target, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); probe.updateMatrixWorld(true);
  const rc = new THREE.Raycaster(); rc.set(from, dir.clone().normalize()); const hit = rc.intersectObject(probe)[0];
  if (!hit) throw new Error('stickOn : le rayon ne touche pas la surface');
  const n = hit.face.normal.clone(); if (n.dot(dir) > 0) n.negate();
  if (spin) g.applyMatrix4(new THREE.Matrix4().makeRotationZ(spin * D2R));
  g.applyMatrix4(new THREE.Matrix4().compose(hit.point.clone().addScaledVector(n, off), new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n), V(1, 1, 1))); return g;
}
/* place un nœud à sa pose de repos */
export function place(node, rest) { if (rest) { node.position.set(...rest.p); node.rotation.set(rest.r[0] * D2R, rest.r[1] * D2R, rest.r[2] * D2R); if (rest.s) node.scale.setScalar(rest.s); } return node; }

/* =========================================================
   Animations : une pose = { Articulation: { r:[x,y,z] degrés, p:[dx,dy,dz] m, s: échelle } } en ÉCART par rapport au repos.
   ========================================================= */
export const FPS = 30;
export const ease = (k) => k * k * (3 - 2 * k);
export const clamp01 = (k) => Math.max(0, Math.min(1, k));
export function keyed(keys) {
  return (t) => {
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1] || a, k = b.t > a.t ? ease(clamp01((t - a.t) / (b.t - a.t))) : 0, out = {};
    new Set([...Object.keys(a.pose), ...Object.keys(b.pose)]).forEach((j) => {
      const A = a.pose[j] || {}, B = b.pose[j] || {}, l3 = (x, y) => [0, 1, 2].map((n) => ((x || [0, 0, 0])[n]) + (((y || [0, 0, 0])[n]) - ((x || [0, 0, 0])[n])) * k);
      const arr = Array.isArray(A.s) || Array.isArray(B.s), s3 = (s) => (Array.isArray(s) ? s : [s ?? 1, s ?? 1, s ?? 1]), sa = s3(A.s), sb = s3(B.s), s = sa.map((v, n) => v + (sb[n] - v) * k);
      out[j] = { r: l3(A.r, B.r), p: l3(A.p, B.p), s: arr ? s : s[0] };
    });
    return out;
  };
}
export const add = (o, j, v) => { o[j] = o[j] || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; if (v.r) o[j].r = o[j].r.map((x, i) => x + v.r[i]); if (v.p) o[j].p = o[j].p.map((x, i) => x + v.p[i]); if (v.s !== undefined) { const c = o[j].s; o[j].s = Array.isArray(v.s) || Array.isArray(c) ? [0, 1, 2].map((n) => (Array.isArray(c) ? c[n] : c) * (Array.isArray(v.s) ? v.s[n] : v.s)) : c * v.s; } return o; };
export function blend(a, b, k) {
  const o = {}, s3 = (s) => (Array.isArray(s) ? s : [s ?? 1, s ?? 1, s ?? 1]);
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach((j) => {
    const A = a[j] || {}, B = b[j] || {}, l3 = (x, y) => [0, 1, 2].map((n) => ((x || [0, 0, 0])[n]) + (((y || [0, 0, 0])[n]) - ((x || [0, 0, 0])[n])) * k);
    const arr = Array.isArray(A.s) || Array.isArray(B.s), sa = s3(A.s), sb = s3(B.s), s = sa.map((v, n) => v + (sb[n] - v) * k);
    o[j] = { r: l3(A.r, B.r), p: l3(A.p, B.p), s: arr ? s : s[0] };
  });
  return o;
}
/* matrice locale d'une articulation (repos + écart) : pour les calculs de pose (cinématique directe) */
export function jointMat(REST, j, o) {
  const r = REST[j], x = o[j] || {}, a = (i) => (r.r[i] + (x.r ? x.r[i] : 0)) * D2R, s = (r.s || 1) * (Array.isArray(x.s) ? 1 : (x.s ?? 1));
  return new THREE.Matrix4().compose(V(r.p[0] + (x.p ? x.p[0] : 0), r.p[1] + (x.p ? x.p[1] : 0), r.p[2] + (x.p ? x.p[2] : 0)), new THREE.Quaternion().setFromEuler(new THREE.Euler(a(0), a(1), a(2), 'XYZ')), V(s, s, s));
}
/* applique une pose à un modèle construit (nœuds par nom) */
export function applyPose(model, nodes, pose) {
  model.JOINTS.forEach((j) => {
    const n = nodes[j], r = model.REST[j]; if (!n || !r) return; const x = pose[j] || {}, xr = x.r || [0, 0, 0], xp = x.p || [0, 0, 0];
    n.position.set(r.p[0] + xp[0], r.p[1] + xp[1], r.p[2] + xp[2]); n.rotation.set((r.r[0] + xr[0]) * D2R, (r.r[1] + xr[1]) * D2R, (r.r[2] + xr[2]) * D2R);
    if (Array.isArray(x.s)) n.scale.set(x.s[0] * (r.s || 1), x.s[1] * (r.s || 1), x.s[2] * (r.s || 1)); else n.scale.setScalar((x.s ?? 1) * (r.s || 1));
  });
}
/* recalage au sol exact : rien ne passe sous Y = 0 (model.ground === false pour une créature qui flotte) */
const _gm = new Map();
export function groundPose(model, pose, exact = false) {
  if (model.ground === false) return pose;
  let g = _gm.get(model); if (!g) { const b = model.build(model.PALETTE); const ms = []; b.root.traverse((n) => { if (n.isMesh && !n.name.endsWith('_Outline') && !n.userData.glow && !(model.groundSkip && model.groundSkip.test(n.name))) ms.push(n); }); g = { b, ms }; _gm.set(model, g); }
  applyPose(model, g.b.nodes, pose); g.b.root.updateMatrixWorld(true);
  let m = 1e9; for (const n of g.ms) { const e = n.matrixWorld.elements, p = n.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const y = e[1] * p[i] + e[5] * p[i + 1] + e[9] * p[i + 2] + e[13]; if (y < m) m = y; } }
  if (m < 0 || exact) { const root = model.JOINTS[0]; pose[root] = pose[root] || { r: [0, 0, 0], p: [0, 0, 0], s: 1 }; const p = pose[root].p || [0, 0, 0]; pose[root].p = [p[0], p[1] - m, p[2]]; if (!pose[root].r) pose[root].r = [0, 0, 0]; }
  return pose;
}
/* pose complète d'une animation à l'instant t (correcteurs du modèle puis sol) */
export function poseAt(model, name, t) {
  const A = model.ANIMS[name]; let d = A.f(t);
  if (model.finish) d = model.finish(d, name, t) || d;
  return groundPose(model, d, !!A.rest && t >= A.rest);
}
export function sample(model, name) {
  const A = model.ANIMS[name], n = Math.round(A.dur * FPS) + 1, frames = [];
  for (let i = 0; i < n; i++) {
    const t = Math.min(A.dur, i / FPS), d = poseAt(model, name, A.loop && i === n - 1 ? 0 : t), fr = { t: +t.toFixed(4), j: {} };
    model.JOINTS.forEach((j) => { const r = model.REST[j], x = d[j] || {}, xr = x.r || [0, 0, 0], xp = x.p || [0, 0, 0]; fr.j[j] = { r: [0, 1, 2].map((k) => r.r[k] + xr[k]), p: [0, 1, 2].map((k) => r.p[k] + xp[k]), s: Array.isArray(x.s) ? x.s.map((v) => v * (r.s || 1)) : (x.s ?? 1) * (r.s || 1) }; });
    frames.push(fr);
  }
  return { name, dur: A.dur, loop: !!A.loop, frames };
}
export function toClip(model, name, S = sample(model, name)) {
  const times = S.frames.map((f) => f.t), tracks = [], q = new THREE.Quaternion(), e = new THREE.Euler();
  model.JOINTS.forEach((j) => {
    const qv = [], pv = [], sv = []; let prev = null;
    S.frames.forEach((f) => { const v = f.j[j]; e.set(v.r[0] * D2R, v.r[1] * D2R, v.r[2] * D2R, 'XYZ'); q.setFromEuler(e); if (prev && prev.dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w); prev = q.clone(); qv.push(q.x, q.y, q.z, q.w); pv.push(...v.p); if (Array.isArray(v.s)) sv.push(...v.s); else sv.push(v.s, v.s, v.s); });
    tracks.push(new THREE.QuaternionKeyframeTrack(j + '.quaternion', times, qv), new THREE.VectorKeyframeTrack(j + '.position', times, pv), new THREE.VectorKeyframeTrack(j + '.scale', times, sv));
  });
  return new THREE.AnimationClip(name, S.dur, tracks);
}

/* =========================================================
   Vue de jeu d'une créature : { root, mat, animate(dt, s) }, contrat de js/world/creatures.js.
   drive(s, api) renvoie la pose (écarts) pour l'état de combat s ; api : t (temps), dt, clip(nom, instant),
   loop(nom, vitesse = 1), blend(a, b, k), nodes.
   ========================================================= */
export function creatureView(model, drive, opt = {}) {
  const pal = opt.palette || model.PALETTE, { root: body, nodes } = model.build(pal), root = new THREE.Group(); root.name = model.id; root.add(body);
  body.traverse((o) => { if (o.isMesh) o.castShadow = !o.name.endsWith('_Outline') && !o.userData.glow; });
  const clocks = {}; let t = Math.random() * 5;
  const api = { t: 0, dt: 0, nodes, blend,
    clip: (name, time) => model.ANIMS[name].f(Math.max(0, Math.min(model.ANIMS[name].dur, time))),
    at: (name, k) => model.ANIMS[name].f(clamp01(k) * model.ANIMS[name].dur),
    loop: (name, speed = 1) => { clocks[name] = ((clocks[name] || 0) + api.dt * speed) % model.ANIMS[name].dur; return model.ANIMS[name].f(clocks[name]); } };
  return { root, nodes, mat: opt.mat ? opt.mat(nodes) : null, animate(dt, s = {}) {
    t += dt; api.t = t; api.dt = dt;
    let pose = drive(s, api);
    if (model.finish) pose = model.finish(pose, null, t) || pose;
    if (opt.ground !== false) groundPose(model, pose);
    applyPose(model, nodes, pose);
    if (opt.after) opt.after(s, api, nodes);
  } };
}
