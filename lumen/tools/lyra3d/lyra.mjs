/* =========================================================
   LUMEN — Lyra, la voyageuse à la Lueur, et Fia.
   Modèle low-poly facetté (aucune sphère), contours noirs en
   « coque inversée » (géométrie), hiérarchie articulée nommée,
   couleurs par sommet en sRGB brut, 10 animations à 30 i/s.
   Utilisable dans Node (export GLB) et dans le navigateur (aperçu).
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
const LIGHT = new THREE.Vector3(0.35, 0.85, 0.5).normalize();

/* sRGB brut (pas de conversion en linéaire) */
const raw = (hex) => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const lighten = (hex, k = 0.14) => { const c = raw(hex); return '#' + c.map((v) => Math.round(Math.min(1, v + (1 - v) * k) * 255).toString(16).padStart(2, '0')).join(''); };

/* ---------- facettes : couleur par face (base / face claire selon l'orientation) ---------- */
function facet(geo, base, light) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.computeVertexNormals();
  const pos = g.attributes.position, n = pos.count;
  const col = new Float32Array(n * 3);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3(), N = new THREE.Vector3();
  const cb = raw(base), cl = raw(light || lighten(base));
  for (let i = 0; i < n; i += 3) {
    A.fromBufferAttribute(pos, i); B.fromBufferAttribute(pos, i + 1); Cc.fromBufferAttribute(pos, i + 2);
    N.subVectors(Cc, B).cross(A.clone().sub(B)).normalize().negate();
    const d = N.dot(LIGHT);
    const c = d > 0.55 ? cl : d > 0.15 ? mixc(cb, cl, 0.45) : cb;   // deux à trois tons nets par facette
    for (let k = 0; k < 3; k++) col.set(c, (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.deleteAttribute('uv');
  return g;
}
const T = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D2R, ry * D2R, rz * D2R)), new THREE.Vector3(sx, sy, sz));
  g.applyMatrix4(m); return g;
};
const prism = (rt, rb, h, s = 6, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
const gem = (r) => new THREE.OctahedronGeometry(r, 0);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
/* deux faces (pour les capes et la capuche) */
function doubleSided(g) {
  const b = g.index ? g.toNonIndexed() : g.clone();
  const p = b.attributes.position.array.slice();
  for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
  const back = new THREE.BufferGeometry(); back.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const front = new THREE.BufferGeometry(); front.setAttribute('position', b.attributes.position.clone());
  return mergeGeometries([front, back]);
}
const stripAttrs = (g) => { const o = new THREE.BufferGeometry(); o.setAttribute('position', (g.index ? g.toNonIndexed() : g).attributes.position.clone()); return o; };

/* ---------- matériaux ---------- */
const M = {
  body: new THREE.MeshStandardMaterial({ name: 'M_Lyra', vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 }),
  gold: new THREE.MeshStandardMaterial({ name: 'M_Lyra_Gold', vertexColors: true, flatShading: true, roughness: 0.4, metalness: 0.6 }),
  outline: new THREE.MeshBasicMaterial({ name: 'M_Outline', vertexColors: true, color: 0xffffff }),
  eyesGlow: new THREE.MeshStandardMaterial({ name: 'M_Glow_Eyes', vertexColors: true, color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1, roughness: 1 }),
  fia: new THREE.MeshStandardMaterial({ name: 'M_Fia_Body', vertexColors: true, flatShading: true, roughness: 0.25, metalness: 0.1, emissive: 0xfff8dc, emissiveIntensity: 0.35, transparent: false }),
  fiaCore: new THREE.MeshStandardMaterial({ name: 'M_Glow_FiaCore', vertexColors: true, color: 0xffffff, emissive: 0xffd166, emissiveIntensity: 2, roughness: 1 }),
  runes: new THREE.MeshStandardMaterial({ name: 'M_Glow_Runes', vertexColors: true, color: 0xffffff, emissive: 0xfff3b0, emissiveIntensity: 1.2, roughness: 1 }),
  staffRing: new THREE.MeshStandardMaterial({ name: 'M_Glow_StaffRing', vertexColors: true, color: 0xffffff, emissive: 0xfff8dc, emissiveIntensity: 1.5, roughness: 1 }),
};
const GLOW = new Set(['Eyes_Glow', 'Fia_Core', 'Staff_LightRing', 'Collar_Runes']);

/* Pièce : liste de [géométrie, couleur, couleur claire] → un maillage nommé + son contour */
function part(name, pieces, mat = M.body, outlineFrom = null) {
  const geo = mergeGeometries(pieces.map(([g, c, l]) => facet(g, c, l)));
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, mat); mesh.name = name;
  // les coques fines (capuche) prennent leur contour sur la face extérieure seulement
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
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));   // noir #000000
  const m = new THREE.Mesh(g, M.outline); m.name = name + '_Outline';
  return m;
}

/* ---------- Pose de repos (pivots aux articulations) ---------- */
export const REST = {
  Pelvis: { p: [0, 0.605, 0], r: [0, 0, 0] },
  Torso: { p: [0, 0.06, 0], r: [0, 0, 0] },
  Head: { p: [0, 0.37, 0.005], r: [0, 0, 0], s: 1.13 },
  Hood: { p: [0, 0, 0], r: [0, 0, 0] }, Hair_Bangs: { p: [0, 0, 0], r: [0, 0, 0] }, Eyes_Glow: { p: [0, 0, 0], r: [0, 0, 0] },
  Cloak_Back: { p: [0, 0.33, -0.135], r: [4, 0, 0] },
  Cloak_Left: { p: [0.15, 0.33, -0.05], r: [3, -55, 6] },
  Cloak_Right: { p: [-0.15, 0.33, -0.05], r: [3, 55, -6] },
  ArmL_Upper: { p: [0.168, 0.315, 0], r: [0, 0, 11] }, ArmL_Lower: { p: [0, -0.195, 0], r: [-12, 0, 0] }, HandL: { p: [0, -0.175, 0], r: [0, 0, 0] },
  ArmR_Upper: { p: [-0.168, 0.315, 0], r: [0, 0, -13] }, ArmR_Lower: { p: [0, -0.195, 0], r: [-10, 0, 0] }, HandR: { p: [0, -0.175, 0], r: [0, 0, 0] },
  Staff: { p: [0, -0.04, 0.02], r: [12, 0, -11] },
  LegL_Upper: { p: [0.078, -0.03, 0], r: [0, 0, 2] }, LegL_Lower: { p: [0, -0.22, 0], r: [0, 0, 0] }, FootL: { p: [0, -0.22, 0], r: [0, 0, -2] },
  LegR_Upper: { p: [-0.078, -0.03, 0], r: [0, 0, -2] }, LegR_Lower: { p: [0, -0.22, 0], r: [0, 0, 0] }, FootR: { p: [0, -0.22, 0], r: [0, 0, 2] },
  Fia_Pivot: { p: [0, 0.3, 0], r: [0, 0, 0] },
  Fia_Body: { p: [-0.29, 0.44, 0.04], r: [0, 0, 0] },
  Fia_Core: { p: [-0.29, 0.44, 0.04], r: [0, 0, 0] },
};

/* ---------- Construction ---------- */
export function buildLyra() {
  const P = PALETTE;
  const nodes = {};
  const mk = (name, pieces, mat) => { const m = part(name, pieces, mat); nodes[name] = m; const r = REST[name]; if (r) { m.position.set(...r.p); m.rotation.set(r.r[0] * D2R, r.r[1] * D2R, r.r[2] * D2R); if (r.s) m.scale.setScalar(r.s); } return m; };

  /* Bassin : haut du pantalon */
  const pelvis = mk('Pelvis', [[T(prism(0.118, 0.13, 0.13, 8), 0, -0.01, 0), P.trousers]]);

  /* Buste : tunique, pans fendus, ceinture dorée, boucle, col de cape */
  const torso = mk('Torso', [
    [T(prism(0.142, 0.165, 0.33, 8), 0, 0.165, 0), P.tunic, P.tunicLight],
    [T(prism(0.16, 0.168, 0.06, 8), 0, 0.01, 0), P.gold],
    [T(box(0.07, 0.055, 0.03), 0, 0.012, 0.168), '#C9962E', '#F2CF77'],
    // pans fendus (avant gauche/droite, arrière gauche/droite)
    [T(box(0.15, 0.24, 0.035), 0.078, -0.12, 0.12, -6, 8, 4), P.tunic, P.tunicLight],
    [T(box(0.15, 0.24, 0.035), -0.078, -0.12, 0.12, -6, -8, -4), P.tunic, P.tunicLight],
    [T(box(0.15, 0.22, 0.035), 0.078, -0.11, -0.12, 6, -8, 4), P.tunic, P.tunicLight],
    [T(box(0.15, 0.22, 0.035), -0.078, -0.11, -0.12, 6, 8, -4), P.tunic, P.tunicLight],
    [T(box(0.04, 0.2, 0.25), 0.155, -0.1, 0, 0, 0, 6), P.tunic, P.tunicLight],
    [T(box(0.04, 0.2, 0.25), -0.155, -0.1, 0, 0, 0, -6), P.tunic, P.tunicLight],
    // col de cape (pèlerine) + bordure dorée + broche
    [T(prism(0.105, 0.255, 0.13, 8, false), 0, 0.31, -0.005), P.cloak, P.cloakLight],
    [T(prism(0.258, 0.262, 0.03, 8, false), 0, 0.245, -0.005), P.gold],
    [T(prism(0.06, 0.068, 0.07, 6), 0, 0.39, 0), P.skin],
    [T(gem(0.032), 0, 0.29, 0.205, 0, 45, 0, 1, 1.2, 0.6), '#C9962E', '#F7DC8F'],
  ]);
  pelvis.add(torso);
  /* runes de lumière le long du col (émissives, sans contour) */
  const runes = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; runes.push([T(box(0.012, 0.075, 0.006), Math.sin(a) * 0.19, 0.31, Math.cos(a) * 0.19 - 0.003, -30 * Math.cos(a), a / D2R, 30 * Math.sin(a)), '#FFF3B0', '#FFFFFF']); }
  const collar = part('Collar_Runes', runes, M.runes); torso.add(collar);

  /* Tête : forme en tonneau facetté (lathe à 8 côtés), yeux, joues, bouche */
  const prof = [[0, -0.205], [0.12, -0.185], [0.2, -0.085], [0.218, 0.03], [0.2, 0.13], [0.13, 0.205], [0, 0.23]].map(([x, y]) => new THREE.Vector2(x, y));
  const headShape = () => T(new THREE.LatheGeometry(prof, 8), 0, 0, 0, 0, 22.5, 0);
  const head = mk('Head', [[box(0.01, 0.01, 0.01), P.skin]]);
  torso.add(head);

  const headGeo = mergeGeometries([
    facet(T(headShape(), 0, 0.2, 0, 0, 0, 0, 1, 1, 0.97), P.skin),
    facet(T(prism(0.036, 0.036, 0.012, 6), 0.078, 0.19, 0.2, 90, 0, 0, 1, 1, 1.35), P.eye, '#2C3A6E'),
    facet(T(prism(0.036, 0.036, 0.012, 6), -0.078, 0.19, 0.2, 90, 0, 0, 1, 1, 1.35), P.eye, '#2C3A6E'),
    facet(T(prism(0.024, 0.024, 0.008, 6), 0.13, 0.15, 0.172, 90, 0, -24), P.cheek, '#F2B2AF'),
    facet(T(prism(0.024, 0.024, 0.008, 6), -0.13, 0.15, 0.172, 90, 0, 24), P.cheek, '#F2B2AF'),
    facet(T(box(0.034, 0.008, 0.01), 0, 0.105, 0.2), '#B5605F'),
    facet(T(box(0.046, 0.011, 0.012), 0.08, 0.258, 0.195, -10, 0, -8), P.hair),
    facet(T(box(0.046, 0.011, 0.012), -0.08, 0.258, 0.195, -10, 0, 8), P.hair),
  ]);
  head.geometry = headGeo;
  head.remove(head.children[0]); head.add(outline(headGeo, 'Head'));

  /* Reflets en étoile dans les yeux (émissifs) */
  const star = (x, y, s) => T(new THREE.OctahedronGeometry(1, 0), x, y, 0.214, 0, 0, 45, s, s, s * 0.4);
  const eyesGlow = part('Eyes_Glow', [[star(0.088, 0.205, 0.013), P.star, P.star], [star(-0.068, 0.205, 0.013), P.star, P.star], [star(0.07, 0.178, 0.006), P.star, P.star], [star(-0.086, 0.178, 0.006), P.star, P.star]], M.eyesGlow);
  head.add(eyesGlow); nodes.Eyes_Glow = eyesGlow;

  /* Cheveux : frange et carré qui dépassent de la capuche */
  const hairPieces = [];
  for (let i = -3; i <= 3; i++) hairPieces.push([T(box(0.058, 0.1, 0.05), i * 0.048, 0.31, 0.172 - Math.abs(i) * 0.012, -18, -i * 6, i * 3), P.hair, '#7A4E36']);
  [-1, 1].forEach((s) => { hairPieces.push([T(box(0.055, 0.21, 0.12), s * 0.185, 0.155, 0.08, 0, s * 12, s * 4), P.hair, '#7A4E36']); hairPieces.push([T(box(0.05, 0.08, 0.1), s * 0.175, 0.04, 0.09, 0, s * 20, s * -10), P.hair, '#7A4E36']); });
  hairPieces.push([T(prism(0.15, 0.19, 0.1, 8), 0, 0.3, 0.0, 0, 22.5, 0), P.hair, '#7A4E36']);
  const hair = part('Hair_Bangs', hairPieces); head.add(hair); nodes.Hair_Bangs = hair;

  /* Capuche pointue, ouverte devant, bordure dorée */
  const hp = [[0.265, -0.06], [0.3, 0.08], [0.305, 0.21], [0.265, 0.34], [0.18, 0.44], [0.07, 0.51], [0.0, 0.55]].map(([x, y]) => new THREE.Vector2(x, y));
  const hoodOuter = () => T(new THREE.LatheGeometry(hp, 9, 0.72, Math.PI * 2 - 1.44), 0, 0.0, -0.02, -6, 0, 0, 1, 1, 1.04);
  const hoodShell = doubleSided(hoodOuter());
  const trim = [];
  const arcN = 11;
  for (let i = 0; i < arcN; i++) {   // arc doré autour du visage (segments plats)
    const a0 = -1.25 + (i / arcN) * 2.5, a1 = -1.25 + ((i + 1) / arcN) * 2.5;
    const r = 0.235, cx = (Math.sin(a0) + Math.sin(a1)) / 2 * r, cy = 0.19 + (Math.cos(a0) + Math.cos(a1)) / 2 * r * 1.12;
    const len = Math.hypot((Math.sin(a1) - Math.sin(a0)) * r, (Math.cos(a1) - Math.cos(a0)) * r * 1.12) + 0.008;
    trim.push([T(box(len, 0.032, 0.045), cx, cy, 0.19 - Math.abs(cx) * 0.3, 0, -cx * 80, -((a0 + a1) / 2) / D2R), P.gold, '#F7DC8F']);
  }
  const hood = part('Hood', [[hoodShell, P.cloak, P.cloakLight], ...trim], M.body, [hoodOuter(), ...trim.map((t) => t[0])]);
  head.add(hood); nodes.Hood = hood;

  /* Capes (3 panneaux articulés aux épaules) */
  const panel = (wTop, wBot, h, tip) => { const s = new THREE.Shape(); s.moveTo(-wTop / 2, 0); s.lineTo(wTop / 2, 0); s.lineTo(wBot / 2, -h); s.lineTo(0, -h - tip); s.lineTo(-wBot / 2, -h); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false }); };
  const back = [[T(panel(0.3, 0.46, 0.56, 0.06), 0, 0, -0.011, 0, 180, 0), P.cloak, P.cloakLight],
    [T(box(0.24, 0.035, 0.03), -0.115, -0.585, -0.004, 0, 0, 14), P.gold, '#F7DC8F'], [T(box(0.24, 0.035, 0.03), 0.115, -0.585, -0.004, 0, 0, -14), P.gold, '#F7DC8F']];
  [-0.12, -0.04, 0.04, 0.12].forEach((x) => back.push([T(box(0.008, 0.48, 0.006), x, -0.29, -0.026, 0, 0, x * 18), P.cloakLight, '#5A6DB0']));
  const cB = mk('Cloak_Back', back); torso.add(cB);
  const side = (s) => [[T(panel(0.1, 0.17, 0.48, 0.03), 0, 0, -0.011, 0, 180, 0), P.cloak, P.cloakLight], [T(box(0.17, 0.03, 0.03), 0, -0.495, -0.004, 0, 0, 0), P.gold, '#F7DC8F']];
  const cL = mk('Cloak_Left', side(1)); torso.add(cL);
  const cR = mk('Cloak_Right', side(-1)); torso.add(cR);

  /* Bras */
  const armUpper = () => [[T(prism(0.068, 0.058, 0.2, 6), 0, -0.1, 0), P.tunic, P.tunicLight], [T(prism(0.082, 0.08, 0.075, 6), 0, -0.015, 0), P.tunic, P.tunicLight]];
  const armLower = () => [[T(prism(0.062, 0.05, 0.13, 6), 0, -0.065, 0), P.tunic, P.tunicLight], [T(prism(0.07, 0.07, 0.035, 6), 0, -0.13, 0), P.tunic, P.tunicLight], [T(prism(0.045, 0.04, 0.05, 6), 0, -0.165, 0), P.skin]];
  const hand = (s) => [[T(box(0.07, 0.085, 0.045), 0, -0.04, 0.005, 0, 0, 0), P.skin], [T(box(0.03, 0.05, 0.03), s * 0.035, -0.03, 0.03, 0, 0, s * -30), P.skin], [T(box(0.07, 0.03, 0.05), 0, -0.088, 0.012, 20, 0, 0), P.skin]];
  ['L', 'R'].forEach((side) => {
    const s = side === 'L' ? 1 : -1;
    const up = mk('Arm' + side + '_Upper', armUpper()), lo = mk('Arm' + side + '_Lower', armLower()), h = mk('Hand' + side, hand(s));
    torso.add(up); up.add(lo); lo.add(h);
  });

  /* Bâton de voyage (main gauche), tête recourbée et anneau doré */
  const sp = [];
  const seg = (x0, y0, x1, y1, r0, r1) => { const len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(x1 - x0, y1 - y0); return [T(prism(r1, r0, len + 0.012, 6), (x0 + x1) / 2, (y0 + y1) / 2, 0, 0, 0, -a / D2R), P.wood, '#94683F']; };
  const pts = [[0.0, -0.585], [0.012, -0.25], [-0.01, 0.15], [0.01, 0.55], [0.0, 0.72], [0.045, 0.8], [0.09, 0.78], [0.1, 0.72], [0.075, 0.68]];
  for (let i = 0; i < pts.length - 1; i++) sp.push(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], i < 3 ? 0.022 : 0.02, i < 3 ? 0.02 : 0.016));
  sp.push([T(prism(0.028, 0.028, 0.03, 6), 0.006, -0.06, 0), '#5E3F2B']);
  const ringPieces = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ringPieces.push([T(box(0.022, 0.012, 0.012), 0.11 + Math.cos(a) * 0.038, 0.66 + Math.sin(a) * 0.038, 0, 0, 0, a / D2R + 90), P.gold, '#F7DC8F']); }
  const staff = mk('Staff', [...sp, ...ringPieces], M.gold);
  staff.material = M.body;
  nodes.HandL.add(staff);
  const lightRing = part('Staff_LightRing', [[T(new THREE.TorusGeometry(0.06, 0.008, 3, 8), 0.05, 0.78, 0, 90, 0, 0), '#FFF8DC', '#FFFFFF']], M.staffRing);
  lightRing.scale.setScalar(0.001); staff.add(lightRing); nodes.Staff_LightRing = lightRing;

  /* Jambes et bottes */
  const legUpper = () => [[T(prism(0.075, 0.064, 0.23, 6), 0, -0.11, 0), P.trousers, '#5E4230']];
  const legLower = () => [[T(prism(0.062, 0.056, 0.12, 6), 0, -0.05, 0), P.trousers, '#5E4230'], [T(prism(0.082, 0.076, 0.13, 7), 0, -0.155, 0.004), P.boots, '#77543A'], [T(prism(0.092, 0.09, 0.04, 7), 0, -0.09, 0.004), P.boots, '#8A6444']];
  const foot = () => [[T(prism(0.075, 0.085, 0.06, 7), 0, -0.065, 0.012), P.boots, '#77543A'], [T(box(0.13, 0.065, 0.13), 0, -0.068, 0.085, -8, 0, 0), P.boots, '#77543A'], [T(box(0.14, 0.022, 0.24), 0, -0.098, 0.04), '#3E2A1C', '#4E3524']];
  ['L', 'R'].forEach((side) => {
    const up = mk('Leg' + side + '_Upper', legUpper()), lo = mk('Leg' + side + '_Lower', legLower()), f = mk('Foot' + side, foot());
    pelvis.add(up); up.add(lo); lo.add(f);
  });

  /* Fia : cristal en losange + cœur lumineux, sur un pivot d'orbite */
  const fiaPivot = new THREE.Object3D(); fiaPivot.name = 'Fia_Pivot'; fiaPivot.position.set(...REST.Fia_Pivot.p); torso.add(fiaPivot); nodes.Fia_Pivot = fiaPivot;
  const fiaBody = mk('Fia_Body', [[T(new THREE.OctahedronGeometry(0.06, 0), 0, 0, 0, 0, 0, 0, 0.75, 1.45, 0.75), P.fia, '#FFFFFF']], M.fia);
  const fiaCore = mk('Fia_Core', [[T(new THREE.OctahedronGeometry(0.03, 0), 0, 0, 0, 0, 0, 0, 0.8, 1.4, 0.8), P.fiaCore, '#FFE7A3']], M.fiaCore);
  fiaPivot.add(fiaBody, fiaCore);

  
  pelvis.name = 'Pelvis';
  return { root: pelvis, nodes };
}

/* =========================================================
   Animations : poses clés (degrés, en plus de la pose de repos),
   interpolées en douceur et échantillonnées à 30 i/s.
   ========================================================= */
export const FPS = 30;
export const JOINTS = ['Pelvis', 'Torso', 'Head', 'Hood', 'Hair_Bangs', 'Eyes_Glow', 'Cloak_Back', 'Cloak_Left', 'Cloak_Right', 'ArmL_Upper', 'ArmL_Lower', 'HandL', 'ArmR_Upper', 'ArmR_Lower', 'HandR', 'Staff', 'LegL_Upper', 'LegL_Lower', 'FootL', 'LegR_Upper', 'LegR_Lower', 'FootR', 'Fia_Pivot', 'Fia_Body', 'Fia_Core', 'Staff_LightRing'];
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

export const ANIMS = {
  IDLE: { dur: 3.0, loop: true, f: (t) => {
    const w = 2 * PI * t / 3, o = {};
    add(o, 'Pelvis', { p: [0, 0.004 * sin(w * 2), 0] });
    add(o, 'Torso', { r: [1.6 * sin(w * 2), 0, 0] });
    add(o, 'Head', { r: [2 * sin(w + 0.6), 5 * sin(w), 5 * sin(w + 1)] });
    ['Cloak_Back', 'Cloak_Left', 'Cloak_Right'].forEach((c, i) => add(o, c, { r: [2.5 * sin(w * 2 + i), 0, 0] }));
    add(o, 'ArmR_Upper', { r: [2 * sin(w * 2), 0, -2 * sin(w * 2)] }); add(o, 'ArmL_Upper', { r: [0, 0, 1.5 * sin(w * 2)] });
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
    add(o, 'ArmR_Upper', { r: [-24 * sin(p), 0, 8] }); add(o, 'ArmR_Lower', { r: [-12 - 8 * sin(p), 0, 0] });
    add(o, 'ArmL_Upper', { r: [10 * sin(p), 0, 0] }); add(o, 'Staff', { r: [-8 * sin(p), 0, 0] });
    add(o, 'Cloak_Back', { r: [10 + 3 * sin(2 * p), 0, 2 * sin(p)] }); add(o, 'Cloak_Left', { r: [8 + 3 * sin(2 * p + 1), 0, 0] }); add(o, 'Cloak_Right', { r: [8 + 3 * sin(2 * p + 2), 0, 0] });
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
    add(o, 'ArmR_Upper', { r: [-48 * sin(p), 0, 10] }); add(o, 'ArmR_Lower', { r: [-60, 0, 0] });
    add(o, 'ArmL_Upper', { r: [-40, 0, -14] }); add(o, 'ArmL_Lower', { r: [-50, 0, 0] }); add(o, 'Staff', { r: [-35, 10, 52] });
    add(o, 'Cloak_Back', { r: [42 + 8 * sin(2 * p), 0, 4 * sin(p)] }); add(o, 'Cloak_Left', { r: [36 + 8 * sin(2 * p + 1), 0, 8] }); add(o, 'Cloak_Right', { r: [36 + 8 * sin(2 * p + 2), 0, -8] });
    add(o, 'Fia_Pivot', { r: [0, 0, 0] });
    const trail = [0.16, -0.1 + 0.03 * sin(2 * p), -0.38];
    add(o, 'Fia_Body', { p: trail, r: [0, 720 * t / 0.65, 0] }); add(o, 'Fia_Core', { p: trail, s: 1.15 });
    return o;
  } },
  DODGE_ROLL: { dur: 0.55, loop: false, f: keyed([
    { t: 0, pose: {} },
    { t: 0.08, pose: { Pelvis: { p: [0, -0.18, 0], r: [25, 0, 0] }, Torso: { r: [35, 0, 0] }, Head: { r: [20, 0, 0] }, LegL_Upper: { r: [-60, 0, 0] }, LegR_Upper: { r: [-30, 0, 0] }, LegL_Lower: { r: [70, 0, 0] }, LegR_Lower: { r: [60, 0, 0] }, ArmL_Upper: { r: [-50, 0, -10] }, ArmR_Upper: { r: [-50, 0, 10] }, Staff: { r: [-60, 0, 30] } } },
    { t: 0.2, pose: { Pelvis: { p: [0, -0.12, 0], r: [150, 0, 0] }, Torso: { r: [85, 0, 0] }, Head: { r: [40, 0, 0] }, LegL_Upper: { r: [-110, 0, 0] }, LegR_Upper: { r: [-110, 0, 0] }, LegL_Lower: { r: [130, 0, 0] }, LegR_Lower: { r: [130, 0, 0] }, ArmL_Upper: { r: [-70, 0, -20] }, ArmR_Upper: { r: [-70, 0, 20] }, ArmL_Lower: { r: [-60, 0, 0] }, ArmR_Lower: { r: [-70, 0, 0] }, Staff: { r: [-70, 0, 40] }, Cloak_Back: { r: [-20, 0, 0] }, Fia_Body: { p: [0.1, 0.3, -0.2] }, Fia_Core: { p: [0.1, 0.3, -0.2], s: 1.3 } } },
    { t: 0.34, pose: { Pelvis: { p: [0, -0.12, 0], r: [290, 0, 0] }, Torso: { r: [85, 0, 0] }, Head: { r: [40, 0, 0] }, LegL_Upper: { r: [-110, 0, 0] }, LegR_Upper: { r: [-110, 0, 0] }, LegL_Lower: { r: [130, 0, 0] }, LegR_Lower: { r: [130, 0, 0] }, ArmL_Upper: { r: [-70, 0, -20] }, ArmR_Upper: { r: [-70, 0, 20] }, ArmL_Lower: { r: [-60, 0, 0] }, ArmR_Lower: { r: [-70, 0, 0] }, Staff: { r: [-70, 0, 40] }, Cloak_Back: { r: [30, 0, 0] }, Fia_Body: { p: [0.1, 0.2, -0.3] }, Fia_Core: { p: [0.1, 0.2, -0.3], s: 1.3 } } },
    { t: 0.45, pose: { Pelvis: { p: [0, -0.12, 0], r: [360, 0, 0] }, Torso: { r: [20, 0, 0] }, Head: { r: [8, 0, 0] }, LegL_Upper: { r: [-50, 0, 0] }, LegR_Upper: { r: [-20, 0, 0] }, LegL_Lower: { r: [70, 0, 0] }, LegR_Lower: { r: [40, 0, 0] }, ArmL_Upper: { r: [-20, 0, 0] }, ArmR_Upper: { r: [-25, 0, 10] }, Cloak_Back: { r: [25, 0, 0] } } },
    { t: 0.55, pose: { Pelvis: { r: [360, 0, 0] } } },
  ]) },
  COMBO_1_2_3: { dur: 1.4, loop: false, f: keyed([
    { t: 0, pose: {} },
    { t: 0.12, pose: { Pelvis: { p: [0, -0.03, 0], r: [0, 35, 0] }, Torso: { r: [5, 30, 0] }, ArmL_Upper: { r: [-75, 0, 25] }, ArmL_Lower: { r: [-10, 0, 0] }, Staff: { r: [168, 0, 11] }, LegL_Upper: { r: [-20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, Staff_LightRing: { s: 400 } } },
    { t: 0.25, pose: { Pelvis: { p: [0, -0.04, 0], r: [0, -40, 0] }, Torso: { r: [8, -45, 0] }, Head: { r: [0, 30, 0] }, ArmL_Upper: { r: [-80, 0, -35] }, ArmL_Lower: { r: [-5, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-30, 0, -30] }, LegL_Upper: { r: [-20, 0, 0] }, LegR_Upper: { r: [15, 0, 0] }, LegL_Lower: { r: [20, 0, 0] }, Cloak_Back: { r: [10, 0, 10] }, Staff_LightRing: { s: 700 } } },
    { t: 0.45, pose: { Pelvis: { p: [0, -0.06, 0], r: [0, -15, 0] }, Torso: { r: [12, -10, 0] }, ArmL_Upper: { r: [15, 0, 20] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [150, 0, 11] }, LegL_Upper: { r: [-30, 0, 0] }, LegL_Lower: { r: [35, 0, 0] }, LegR_Upper: { r: [20, 0, 0] }, Staff_LightRing: { s: 400 } } },
    { t: 0.65, pose: { Pelvis: { p: [0, -0.01, 0], r: [-5, 15, 0] }, Torso: { r: [-10, 20, 0] }, Head: { r: [-12, -10, 0] }, ArmL_Upper: { r: [-160, 0, 15] }, ArmL_Lower: { r: [-5, 0, 0] }, Staff: { r: [168, 0, 30] }, LegL_Upper: { r: [-20, 0, 0] }, LegR_Upper: { r: [10, 0, 0] }, Cloak_Back: { r: [18, 0, 0] }, Staff_LightRing: { s: 700 } } },
    { t: 0.85, pose: { Pelvis: { p: [0, -0.05, 0], r: [0, 25, 0] }, Torso: { r: [0, 25, 0] }, ArmL_Upper: { r: [-40, 0, 30] }, ArmL_Lower: { r: [-80, 0, 0] }, Staff: { r: [168, 0, 11] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [25, 0, 0] }, LegR_Upper: { r: [25, 0, 0] }, Staff_LightRing: { s: 400 } } },
    { t: 1.1, pose: { Pelvis: { p: [0, -0.07, 0.05], r: [10, -10, 0] }, Torso: { r: [18, -15, 0] }, Head: { r: [-12, 10, 0] }, ArmL_Upper: { r: [-95, 0, 8] }, ArmL_Lower: { r: [0, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [20, 0, -20] }, LegL_Upper: { r: [-45, 0, 0] }, LegL_Lower: { r: [45, 0, 0] }, LegR_Upper: { r: [30, 0, 0] }, LegR_Lower: { r: [10, 0, 0] }, Cloak_Back: { r: [25, 0, 0] }, Staff_LightRing: { s: 900 } } },
    { t: 1.4, pose: {} },
  ]) },
  CHARGED_SPIN_SLASH: { dur: 1.2, loop: false, f: keyed([
    { t: 0, pose: {} },
    { t: 0.45, pose: { Pelvis: { p: [0, -0.1, 0], r: [8, 70, 0] }, Torso: { r: [12, 40, 0] }, Head: { r: [0, -60, 0] }, ArmL_Upper: { r: [-60, 0, 60] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-40, 0, -20] }, LegL_Upper: { r: [-35, 0, 10] }, LegR_Upper: { r: [25, 0, -10] }, LegL_Lower: { r: [50, 0, 0] }, LegR_Lower: { r: [30, 0, 0] }, Staff_LightRing: { s: 1600 }, Fia_Core: { s: 1.8 } } },
    { t: 0.65, pose: { Pelvis: { p: [0, -0.08, 0], r: [8, -110, 0] }, Torso: { r: [10, -20, 0] }, Head: { r: [0, 10, 0] }, ArmL_Upper: { r: [-88, 0, -10] }, ArmL_Lower: { r: [0, 0, 0] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-60, 0, -50] }, LegL_Upper: { r: [-30, 0, 10] }, LegR_Upper: { r: [25, 0, -10] }, LegL_Lower: { r: [40, 0, 0] }, Cloak_Back: { r: [55, 0, 0] }, Cloak_Left: { r: [40, 0, 20] }, Cloak_Right: { r: [40, 0, -20] }, Staff_LightRing: { s: 1800 }, Fia_Core: { s: 2.0 } } },
    { t: 0.8, pose: { Pelvis: { p: [0, -0.07, 0], r: [5, -290, 0] }, Torso: { r: [8, -10, 0] }, ArmL_Upper: { r: [-80, 0, -20] }, Staff: { r: [168, 0, 11] }, ArmR_Upper: { r: [-40, 0, -50] }, LegL_Upper: { r: [-20, 0, 0] }, LegL_Lower: { r: [30, 0, 0] }, Cloak_Back: { r: [45, 0, 0] }, Staff_LightRing: { s: 1000 }, Fia_Core: { s: 1.4 } } },
    { t: 1.2, pose: { Pelvis: { r: [0, -360, 0] } } },
  ]) },
  WAVE_OF_LIGHT: { dur: 1.0, loop: false, f: (t) => {
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.3, pose: { Pelvis: { p: [0, -0.05, 0] }, Torso: { r: [-8, 0, 0] }, Head: { r: [-20, 0, 0] }, ArmR_Upper: { r: [-150, 0, -20] }, ArmR_Lower: { r: [-10, 0, 0] }, HandR: { r: [0, 0, 0] }, ArmL_Upper: { r: [-10, 0, 10] }, LegL_Upper: { r: [-10, 0, 8] }, LegR_Upper: { r: [10, 0, -8] }, Fia_Core: { s: 2.4 }, Fia_Body: { p: [0.34, 0.25, -0.06], s: 1.3 } } },
      { t: 0.45, pose: { Pelvis: { p: [0, -0.07, 0] }, Torso: { r: [-6, 0, 0] }, Head: { r: [-10, 0, 0] }, ArmR_Upper: { r: [-120, 0, -60] }, ArmR_Lower: { r: [-5, 0, 0] }, ArmL_Upper: { r: [-20, 0, 40] }, LegL_Upper: { r: [-15, 0, 12] }, LegR_Upper: { r: [15, 0, -12] }, Cloak_Back: { r: [30, 0, 0] }, Cloak_Left: { r: [25, 0, 25] }, Cloak_Right: { r: [25, 0, -25] }, Fia_Core: { s: 2.8 }, Fia_Body: { p: [-0.6, -0.42, 0.9], s: 1.5 } } },
      { t: 0.7, pose: { Pelvis: { p: [0, -0.04, 0] }, ArmR_Upper: { r: [-60, 0, -40] }, Cloak_Back: { r: [15, 0, 0] }, Fia_Core: { s: 1.6 }, Fia_Body: { p: [-0.4, -0.3, 0.6], s: 1.2 } } },
      { t: 1.0, pose: {} },
    ])(t);
    // orbite rapide de Fia : 2 tours entre 0,3 et 0,85 s
    const k = clamp01((t - 0.3) / 0.55);
    add(o, 'Fia_Pivot', { r: [0, 720 * ease(k), 0] });
    if (o.Fia_Core && o.Fia_Body) o.Fia_Core.p = o.Fia_Body.p.slice();
    return o;
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
    return o;
  } },
  HIT_REACTION: { dur: 0.4, loop: false, f: (t) => {
    const o = keyed([
      { t: 0, pose: {} },
      { t: 0.08, pose: { Pelvis: { p: [0, -0.02, -0.03], r: [-8, 0, 0] }, Torso: { r: [-16, 6, 0] }, Head: { r: [-14, -10, 0] }, ArmL_Upper: { r: [-60, 0, -20] }, ArmL_Lower: { r: [-95, 0, 0] }, Staff: { r: [-30, 0, 40] }, ArmR_Upper: { r: [-20, 0, -30] }, Cloak_Back: { r: [-10, 0, 0] }, LegL_Upper: { r: [10, 0, 0] }, LegR_Upper: { r: [-12, 0, 0] }, LegR_Lower: { r: [15, 0, 0] } } },
      { t: 0.22, pose: { Pelvis: { p: [0, -0.02, -0.02], r: [-5, 0, 0] }, Torso: { r: [-10, 4, 0] }, Head: { r: [-8, -6, 0] }, ArmL_Upper: { r: [-55, 0, -20] }, ArmL_Lower: { r: [-90, 0, 0] }, Staff: { r: [-30, 0, 40] }, ArmR_Upper: { r: [-15, 0, -25] }, LegR_Upper: { r: [-8, 0, 0] } } },
      { t: 0.4, pose: {} },
    ])(t);
    const frame = Math.round(t * FPS);
    add(o, 'Fia_Core', { s: frame % 2 ? 0.45 : 1.35 }); add(o, 'Fia_Body', { s: frame % 2 ? 0.8 : 1.05 });
    return o;
  } },
  DEFEATED: { dur: 2.5, loop: false, f: keyed([
    { t: 0, pose: {} },
    { t: 0.25, pose: { Pelvis: { p: [0, -0.03, 0], r: [-6, 0, 0] }, Torso: { r: [-10, 0, 0] }, Head: { r: [-10, 0, 0] } } },
    { t: 0.8, pose: { Pelvis: { p: [0, -0.2, 0.03], r: [5, 0, 0] }, Torso: { r: [20, 0, 0] }, Head: { r: [15, 0, 0] }, LegR_Upper: { r: [-85, 0, 0] }, LegR_Lower: { r: [88, 0, 0] }, FootR: { r: [0, 0, 0] }, LegL_Upper: { r: [-8, 0, 0] }, LegL_Lower: { r: [105, 0, 0] }, FootL: { r: [-35, 0, 0] }, ArmL_Upper: { r: [-50, 0, -10] }, ArmL_Lower: { r: [-40, 0, 0] }, Staff: { r: [5, 0, 30] }, ArmR_Upper: { r: [-10, 0, 10] }, Fia_Core: { s: 0.8 }, Fia_Body: { p: [0.1, -0.2, 0.15] } } },
    { t: 1.4, pose: { Pelvis: { p: [0, -0.22, 0.03], r: [12, 0, 0] }, Torso: { r: [38, 0, 0] }, Head: { r: [25, 0, 0] }, LegR_Upper: { r: [-85, 0, 0] }, LegR_Lower: { r: [88, 0, 0] }, LegL_Upper: { r: [-8, 0, 0] }, LegL_Lower: { r: [105, 0, 0] }, FootL: { r: [-35, 0, 0] }, ArmL_Upper: { r: [-60, 0, -10] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [10, 0, 30] }, ArmR_Upper: { r: [-30, 0, 20] }, ArmR_Lower: { r: [-40, 0, 0] }, Cloak_Back: { r: [-8, 0, 0] }, Fia_Core: { s: 0.6 }, Fia_Body: { p: [0.2, -0.4, 0.3] } } },
    { t: 2.5, pose: { Pelvis: { p: [0.05, -0.43, -0.02], r: [0, 0, 84] }, Torso: { r: [12, 0, 0] }, Head: { r: [8, 0, -14] }, LegR_Upper: { r: [-35, 0, 0] }, LegR_Lower: { r: [55, 0, 0] }, LegL_Upper: { r: [-25, 0, 0] }, LegL_Lower: { r: [60, 0, 0] }, FootL: { r: [-10, 0, 0] }, ArmL_Upper: { r: [-40, 0, -14] }, ArmL_Lower: { r: [-30, 0, 0] }, Staff: { r: [0, 0, 11] }, ArmR_Upper: { r: [-60, 0, 30] }, ArmR_Lower: { r: [-50, 0, 0] }, Cloak_Back: { r: [-30, 0, 0] }, Cloak_Left: { r: [-10, 0, -40] }, Cloak_Right: { r: [-10, 0, 30] }, Fia_Core: { s: 0.3 }, Fia_Body: { p: [0.35, -0.82, 0.32], s: 0.85 } } },
  ]) },
};

/* Fiches de combat (données de jeu) */
export const MOVES = {
  COMBO_1_2_3: { type: 'Mêlée (bâton)', duration: 1.4, phases: [{ name: 'Coup 1 · balayage horizontal', windup: [0, 0.12], active: [0.18, 0.3], hit: 0.25 }, { name: 'Coup 2 · frappe diagonale montante', windup: [0.3, 0.45], active: [0.58, 0.7], hit: 0.65 }, { name: 'Coup 3 · estoc', windup: [0.7, 0.85], active: [1.02, 1.14], hit: 1.1 }], recovery: [1.14, 1.4], range: 1.8, area: { shape: 'cône avant', radius: 1.8, arc: 110 }, cooldown: 0.2, telegraph: 'L’anneau du bâton s’illumine à chaque coup.' },
  CHARGED_SPIN_SLASH: { type: 'Zone rapprochée', duration: 1.2, windup: [0, 0.45], active: [0.55, 0.8], hit: 0.65, recovery: [0.65, 1.2], range: 2.4, area: { shape: 'cercle complet autour de Lyra', radius: 2.4, arc: 360 }, cooldown: 3.0, telegraph: 'Accroupie, bâton en arrière, la pointe accumule la lumière (anneau ×16, Fia ×1,8).' },
  WAVE_OF_LIGHT: { type: 'Capacité de zone (traverse les boucliers)', duration: 1.0, windup: [0, 0.3], active: [0.4, 0.85], hit: 0.45, recovery: [0.45, 1.0], range: 3.5, area: { shape: 'anneau / cercle', radius: 3.5, arc: 360 }, cooldown: 5.0, telegraph: 'Main libre levée, le cœur de Fia gonfle (×2,4) puis Fia tourne deux fois autour de Lyra.' },
  LIGHT_GRAPPLE: { type: 'Utilitaire / déplacement', duration: 0.9, windup: [0, 0.18], active: [0.25, 0.6], hit: 0.25, recovery: [0.6, 0.9], range: 12, area: { shape: 'ligne droite', length: 12, width: 0.8 }, cooldown: 2.0, telegraph: 'Bâton pointé, Fia file vers la pointe et projette le câble de lumière.' },
  DODGE_ROLL: { type: 'Esquive (invulnérable)', duration: 0.55, invulnerable: [0.05, 0.45], cooldown: 0.5 },
  HIT_REACTION: { type: 'Réaction', duration: 0.4 },
  DEFEATED: { type: 'Défaite', duration: 2.5 },
};

/* Échantillonnage d'une animation : pour chaque image, transformations locales complètes de chaque articulation */
export function sample(name) {
  const A = ANIMS[name], n = Math.round(A.dur * FPS) + 1, frames = [];
  for (let i = 0; i < n; i++) {
    const t = Math.min(A.dur, i / FPS);
    const d = A.loop && i === n - 1 ? A.f(0) : A.f(t);
    const fr = { t: +t.toFixed(4), j: {} };
    JOINTS.forEach((j) => {
      const r = REST[j] || { p: [0, 0, 0], r: [0, 0, 0] }, x = d[j] || { r: [0, 0, 0], p: [0, 0, 0], s: 1 };
      if (j === 'Fia_Core' && d.Fia_Body) x.p = d.Fia_Body.p.slice();   // le cœur reste dans le cristal
      let s = (x.s ?? 1) * (r.s || 1);
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
      qv.push(q.x, q.y, q.z, q.w); pv.push(...v.p); sv.push(v.s, v.s, v.s);
    });
    tracks.push(new THREE.QuaternionKeyframeTrack(j + '.quaternion', times, qv));
    tracks.push(new THREE.VectorKeyframeTrack(j + '.position', times, pv));
    tracks.push(new THREE.VectorKeyframeTrack(j + '.scale', times, sv));
  });
  return new THREE.AnimationClip(name, S.dur, tracks);
}
