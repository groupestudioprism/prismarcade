/* =========================================================
   LUMEN — décor v2 : SOL et NATURE dans le style de Lyra et des créatures v2
   (low-poly à facettes franches, couleurs par sommet à deux tons par matière, contour noir en coque inversée).
   Branché dans build.js derrière le drapeau GFX2 (pour l'instant : Île de l'Aube, thèmes puzzle / village / lande).

   Par zone, tout tient en peu d'appels de dessin :
     - sol          : UN maillage fusionné (dessus, lèvre d'herbe, flancs de terre, dessous rocheux), sans contour ;
     - eau          : un maillage (surface à facettes + écume), seulement s'il y a de l'eau ;
     - solides      : UN maillage fusionné (rochers, troncs, dalles des chemins, cailloux, nénuphars) + UN contour ;
     - feuillage    : UN InstancedMesh (masses de feuilles des arbres et buissons, vent) + UN contour instancié ;
     - herbes, fleurs : un InstancedMesh chacun (vent), sans contour (trop petits : le contour ferait du bruit) ;
     - ronces, roches fissurées : InstancedMesh + contour instancié (retirables case par case).
   Les solides sont colorés APRÈS placement dans le monde : la face claire regarde toujours la lumière du jeu.
   Les objets instanciés portent des tons neutres (clair = blanc, ombre = OMBRE) multipliés par la couleur d'instance.
   Aucune logique de jeu ici : mêmes cases, mêmes positions, mêmes collisions que l'ancien décor.
   ========================================================= */
import * as THREE from 'three';
import { hash, T as CASE, W } from '../engine/util.js';
import { U, patchSway, shaftTexture } from './gfx.js';
import { setLinear, facet, loft, prism, gem, outline as coque, mergeGeometries, mixHex, Soup, V, T as tr } from './kit3d.js';

/* ---------- Palette (codes sRGB). Paires : [ombre, clair]. Sol : [base, clair, ombre]. ---------- */
const COMMUN = {
  terre: ['#8A6650', '#A88062'], terreBas: ['#6B4C44', '#836050'], dessous: ['#6A5880', '#8E7AA6'],
  roche: ['#8C88A6', '#B6B2CC'], mousse: ['#6FAE5E', '#93D277'], tronc: ['#6B4A3A', '#8C6449'],
  dalle: ['#B4A692', '#D6CAB6'], berge: ['#B89E7C', '#D9C4A0'], fond: ['#3F7FB4', '#4E93C6'],
  eau: ['#58AEE4', '#7FCBF2'], ecume: '#E2F6FF', nenuphar: ['#4F9A6A', '#7CC47C'], lotus: ['#F08CB8', '#FFC2DA'],
  ronce: ['#47743F', '#6A9A52'], epine: ['#C9B48A', '#EFE0B8'], baie: ['#7E3FA0', '#B06CD0'],
  fissuree: ['#9A96B2', '#C6C2DA'], fissure: '#FFE2A0', tige: ['#4F7F42', '#6FA458'], coeur: ['#F2B632', '#FFD84A'],
  fleurs: ['#FFFFFF', '#FFD76A', '#FF9EC7', '#C9B6FF', '#FF9EC7'],
};
export const PALETTE = {
  OMBRE: '#C2CEDA',   // ton d'ombre neutre des objets instanciés (feuillage, herbes, pétales) : couleur d'instance × OMBRE
  commun: COMMUN,
  puzzle: { herbe: ['#7CC268', '#92D277', '#6AB25F'], levre: '#B2E085', chemin: ['#DBC69C', '#E9D8B2', '#CBB48A'], touffe: '#A4DE7A',
    feuilles: [['#66BA7C', '#74C888', '#5CAC72'], ['#F6AECB', '#FAC0D8', '#F09CBE']], floraison: 0.65 },
  village: { herbe: ['#84C96C', '#9AD87A', '#72B862'], levre: '#BAE68A', chemin: ['#E2CFA6', '#EEDDB8', '#D2BC92'], touffe: '#ACE27E', roche: ['#9794AE', '#BFBBD2'],
    feuilles: [['#66BA7C', '#74C888', '#5CAC72'], ['#F6AECB', '#FAC0D8', '#F09CBE']], floraison: 0.5 },
  lande: { herbe: ['#A9C070', '#BCCF7E', '#96AE64'], levre: '#D2DE90', chemin: ['#CDB890', '#DCC9A2', '#BBA57E'], touffe: '#D0D884',
    terre: ['#7A5A46', '#977258'], terreBas: ['#5E443A', '#765646'], dessous: ['#5E5074', '#806E98'], roche: ['#8E8AA2', '#B4B0C6'], mousse: ['#9AAE5E', '#BCCF7E'],
    feuilles: [['#5A9664', '#66A26E', '#76964E'], ['#DDB666', '#E8C67A', '#CFA252']], floraison: 0.25, fleurs: ['#C9B6FF', '#E8A0D0', '#FFFFFF', '#FFD76A', '#C9B6FF'] },
};

const LIGHT = new THREE.Vector3(0.35, 0.85, 0.5).normalize(), LIGHT2 = new THREE.Vector3(-0.45, 0.45, -0.77).normalize();   // mêmes directions que kit3d
const toneK = (nx, ny, nz) => { const d = nx * LIGHT.x + ny * LIGHT.y + nz * LIGHT.z; return d > 0.55 ? 1 : d > 0.12 ? 0.5 : nx * LIGHT2.x + ny * LIGHT2.y + nz * LIGHT2.z > 0.62 ? 0.28 : 0; };
const col = (hex) => new THREE.Color(hex);   // linéaire (gestion des couleurs de three)
const UP = [0, 1, 0], DOWN = [0, -1, 0], DEG = 180 / Math.PI;

/* ---------- soupe de triangles colorés (sol, eau) ---------- */
const _c = new THREE.Color();
class Tris {
  constructor() { this.p = []; this.c = []; }
  /* color : THREE.Color, ou paire [ombre, clair] → ton choisi d'après l'orientation de la face (+ décalage `shift`) */
  tri(a, b, c, color, out, shift = 0) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz); if (len < 1e-9) return;
    if (nx * out[0] + ny * out[1] + nz * out[2] < 0) { const t = b; b = c; c = t; nx = -nx; ny = -ny; nz = -nz; }
    let k = color;
    if (Array.isArray(color)) k = _c.copy(color[0]).lerp(color[1], Math.max(0, Math.min(1, toneK(nx / len, ny / len, nz / len) + shift)));
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (let i = 0; i < 3; i++) this.c.push(k.r, k.g, k.b);
  }
  quad(a, b, c, d, color, out, shift = 0) { this.tri(a, b, c, color, out, shift); this.tri(a, c, d, color, out, shift); }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeVertexNormals(); g.computeBoundingSphere(); g.computeBoundingBox(); return g;
  }
}

/* ---------- bruit doux (grandes taches de couleur du sol : jamais de case qui « saute ») ---------- */
const smooth = (t) => t * t * (3 - 2 * t);
function vnoise(x, z, s, k) {
  const fx = x / s, fz = z / s, ix = Math.floor(fx), iz = Math.floor(fz), tx = smooth(fx - ix), tz = smooth(fz - iz);
  const a = hash(ix, iz, k), b = hash(ix + 1, iz, k), c = hash(ix, iz + 1, k), d = hash(ix + 1, iz + 1, k);
  return (a + (b - a) * tx) * (1 - tz) + (c + (d - c) * tx) * tz;
}
const field = (x, z) => vnoise(x, z, 9, 501) * 0.6 + vnoise(x, z, 4.3, 502) * 0.4;

/* ---------- déformation des volumes : chaque sommet bouge d'après sa position (aucune fissure entre facettes) ---------- */
function jitter(g, amp, seed, ay = 0.5) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = (Math.round(x * 500) * 73856093) ^ (Math.round(y * 500) * 19349663) ^ (Math.round(z * 500) * 83492791);
    p.setXYZ(i, x + (hash(k, seed, 1) - 0.5) * 2 * amp, y + (hash(k, seed, 2) - 0.5) * 2 * amp * ay, z + (hash(k, seed, 3) - 0.5) * 2 * amp);
  }
  return g;
}
/* oriente une forme construite le long de +Y vers `dir` et la pose en `pos` */
function aim(g, pos, dir, spin = 0) {
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  if (spin) q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), spin));
  return g.applyMatrix4(new THREE.Matrix4().compose(pos, q, V(1, 1, 1)));
}
const HM = { outline: null };
function coqueGeo(g, off) { const h = coque(g, '', HM, off).geometry; h.deleteAttribute('color'); return h; }
/* redresse les normales vers le haut : l'objet est éclairé presque comme le sol, ses deux tons peints restent lisibles vus de dessus */
function upNormals(g, k) {
  const n = g.attributes.normal;
  for (let i = 0; i < n.count; i++) { const x = n.getX(i), y = n.getY(i) + k, z = n.getZ(i), l = Math.hypot(x, y, z) || 1; n.setXYZ(i, x / l, y / l, z / l); }
  return g;
}
/* eau : éclats en losange (aplats clairs à bords droits qui glissent et scintillent), dans l'esprit des facettes */
function patchEau(material) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.time;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWp;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec2 gp = vWp.xz * vec2(0.9, 1.5) + vec2(uTime * 0.11, uTime * 0.04);
        vec2 gc = floor(gp);
        float gh = fract(sin(dot(gc, vec2(127.1, 311.7))) * 43758.5453);
        vec2 gf = fract(gp) - 0.5 - (vec2(gh, fract(gh * 7.31)) - 0.5) * 0.3;
        float gs = 0.34 * (0.5 + 0.5 * sin(uTime * 1.2 + gh * 6.2832)) * step(0.55, gh);
        totalEmissiveRadiance += vec3(0.7, 0.9, 1.0) * step(abs(gf.x) + abs(gf.y) * 2.2, gs) * 0.8;`);
  };
  material.customProgramCacheKey = () => 'eau2';
  return material;
}
/* recolore les faces du dessus (mousse sur les rochers plats) */
function tintTop(g, hex, yMin) {
  const p = g.attributes.position, c = g.attributes.color, n = g.attributes.normal, k = col(hex);
  for (let i = 0; i < p.count; i += 3) if (n.getY(i) > 0.7 && Math.min(p.getY(i), p.getY(i + 1), p.getY(i + 2)) > yMin) for (let j = 0; j < 3; j++) c.setXYZ(i + j, k.r, k.g, k.b);
  return g;
}

/* =========================================================
   Formes (repère local : sol à Y = 0, unité = 1 m ; une case fait 2 m)
   ========================================================= */
/* Rochers : 4 silhouettes, chacune déformée par la graine de la case → aucun rocher identique */
function rockParts(v, seed) {
  const J = (g, a = 0.07) => jitter(g, a, seed);
  const small = (x, z, s) => tr(J(loft([{ y: -0.1, rx: 0.44, rz: 0.4 }, { y: 0.26, rx: 0.5, rz: 0.45 }, { y: 0.56, rx: 0.3, rz: 0.26, cx: 0.04 }, { y: 0.66, rx: 0.12, rz: 0.1, cx: 0.05 }], 5, { n: 2.4 }), 0.05), x, 0, z, 0, seed * 37 % 360, 0, s, s, s);
  if (v === 0) return [{ g: J(loft([{ y: -0.12, rx: 0.8, rz: 0.74 }, { y: 0.42, rx: 0.92, rz: 0.84, cx: 0.03 }, { y: 0.95, rx: 0.66, rz: 0.6, cx: -0.05, cz: 0.04 }, { y: 1.2, rx: 0.3, rz: 0.26, cx: -0.08, cz: 0.06 }], 6, { n: 2.5 })) }];   // bloc
  if (v === 1) return [{ g: tr(J(loft([{ y: -0.12, rx: 0.7, rz: 0.64 }, { y: 0.4, rx: 0.78, rz: 0.72 }, { y: 0.86, rx: 0.52, rz: 0.5, cx: 0.05 }, { y: 1.04, rx: 0.22, rz: 0.2, cx: 0.08 }], 6, { n: 2.5 })), -0.16, 0, -0.12) }, { g: small(0.5, 0.42, 0.9) }];   // gros + petit
  if (v === 2) return [{ g: J(loft([{ y: -0.12, rx: 0.62, rz: 0.58 }, { y: 0.6, rx: 0.7, rz: 0.62, cx: 0.04 }, { y: 1.3, rx: 0.5, rz: 0.46, cx: 0.1 }, { y: 1.72, rx: 0.2, rz: 0.18, cx: 0.16 }], 5, { n: 2.3 }), 0.06) }, { g: small(-0.5, 0.45, 0.8) }];   // pierre dressée
  return [{ g: J(loft([{ y: -0.1, rx: 0.92, rz: 0.84 }, { y: 0.3, rx: 0.98, rz: 0.9 }, { y: 0.62, rx: 0.72, rz: 0.64, cx: 0.05 }, { y: 0.7, rx: 0.46, rz: 0.4, cx: 0.05 }], 7, { n: 2.2 }), 0.06), moss: true }];   // dalle basse moussue
}
/* Troncs : une forme par silhouette d'arbre */
const branch = (y, ang, len = 0.8) => tr(loft([{ y: 0, rx: 0.1, rz: 0.1 }, { y: len, rx: 0.055, rz: 0.055 }], 5), 0, y, 0, 0, 0, ang);
function trunkParts(v, seed) {
  const J = (g) => jitter(g, 0.02, seed, 0.3), base = { y: -0.1, rx: 0.33, rz: 0.33 };
  if (v === 1) return [J(loft([base, { y: 0.24, rx: 0.19, rz: 0.19 }, { y: 1.2, rx: 0.15, rz: 0.15, cx: 0.03 }, { y: 2.2, rx: 0.09, rz: 0.09, cx: 0.05 }], 6))];
  if (v === 2) return [J(loft([base, { y: 0.22, rx: 0.21, rz: 0.21 }, { y: 0.95, rx: 0.17, rz: 0.17, cx: -0.02 }, { y: 1.6, rx: 0.1, rz: 0.1 }], 6)), branch(0.9, 44), branch(0.85, -46)];
  if (v === 3) return [J(loft([base, { y: 0.22, rx: 0.2, rz: 0.2 }, { y: 0.9, rx: 0.16, rz: 0.16 }, { y: 1.35, rx: 0.11, rz: 0.11, cx: -0.12 }], 6)), branch(0.8, -32, 1.0), branch(0.95, 26, 0.5)];
  return [J(loft([base, { y: 0.22, rx: 0.2, rz: 0.2 }, { y: 1.0, rx: 0.16, rz: 0.16, cx: 0.04 }, { y: 1.75, rx: 0.1, rz: 0.1, cx: 0.02 }], 6))];
}
/* Houppiers : masses de feuilles [dx, y du bas, dz, taille, écrasement] — rond, élancé, parasol, double */
const CROWNS = [
  [[0, 1.2, 0, 0.95, 1], [0.55, 1.5, -0.2, 0.62, 0.9], [-0.5, 1.7, 0.3, 0.56, 0.9], [0.1, 2.3, 0.1, 0.45, 0.9]],
  [[0, 1.35, 0, 0.8, 1.05], [0.06, 2.15, 0.04, 0.6, 1], [-0.03, 2.8, 0, 0.38, 1]],
  [[-0.55, 1.35, 0.1, 0.72, 0.62], [0.58, 1.3, -0.1, 0.76, 0.62], [0, 1.6, -0.05, 0.7, 0.66], [0.05, 1.25, 0.45, 0.5, 0.6]],
  [[-0.42, 1.25, 0, 0.74, 0.95], [0.45, 1.6, 0.05, 0.62, 0.95], [0, 2.05, -0.2, 0.44, 0.9]],
];
const clumpShape = () => jitter(loft([{ y: 0, rx: 0.55, rz: 0.55 }, { y: 0.36, rx: 1.0, rz: 0.96 }, { y: 0.95, rx: 0.86, rz: 0.82, cx: 0.03 }, { y: 1.32, rx: 0.42, rz: 0.4, cx: -0.02 }], 6), 0.1, 7);
/* Touffe d'herbe : brins larges qui s'ouvrent en éventail (lisibles vus de dessus) */
function bladeShape(h, w, lean, yaw, off = 0.03) {
  const S = new Soup(), A = V(-w, 0, 0), B = V(w, 0, 0), C = V(0, 0, -w * 0.9), P = V(0, h, lean);
  S.tri(A, B, P, V(0, -0.3, 1)); S.tri(B, C, P, V(1, 0.5, -1)); S.tri(C, A, P, V(-1, 0.5, -1));
  return tr(tr(S.geo(), 0, 0, off), 0, 0, 0, 0, yaw, 0);
}
function tuftShape(ombre) {
  const blades = [bladeShape(0.46, 0.07, 0.05, 0, 0), bladeShape(0.4, 0.07, 0.22, 25), bladeShape(0.36, 0.065, 0.24, 112), bladeShape(0.42, 0.07, 0.2, 196), bladeShape(0.34, 0.06, 0.25, 290)];
  return upNormals(mergeGeometries(blades.map((g) => facet(g, ombre, '#FFFFFF'))), 1.6);
}
function flowerShape(ombre) {
  const P = COMMUN, parts = [facet(tr(prism(0.012, 0.018, 0.28, 3), 0, 0.14, 0), P.tige[0], P.tige[1])];
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; parts.push(facet(tr(gem(1), Math.cos(a) * 0.085, 0.3, Math.sin(a) * 0.085, 0, -a * DEG, 0, 0.088, 0.026, 0.052), ombre, '#FFFFFF')); }
  parts.push(facet(tr(gem(1), 0, 0.318, 0, 0, 25, 0, 0.042, 0.036, 0.042), P.coeur[0], P.coeur[1]));
  return upNormals(mergeGeometries(parts), 1.6);
}
/* Ronce : deux mottes épineuses, épines claires, baies violettes (couleurs définitives dans la géométrie) */
function ronceShape() {
  const P = COMMUN, body = [], solid = [];
  const m1 = jitter(loft([{ y: -0.08, rx: 0.8, rz: 0.78 }, { y: 0.3, rx: 0.93, rz: 0.9 }, { y: 0.72, rx: 0.6, rz: 0.58, cx: 0.05 }, { y: 0.92, rx: 0.2, rz: 0.18, cx: 0.08 }], 7), 0.09, 11);
  const m2 = tr(jitter(loft([{ y: -0.08, rx: 0.46, rz: 0.44 }, { y: 0.22, rx: 0.54, rz: 0.5 }, { y: 0.5, rx: 0.28, rz: 0.26 }, { y: 0.6, rx: 0.1, rz: 0.1 }], 6), 0.06, 12), 0.5, 0, 0.42);
  [m1, m2].forEach((g) => { body.push(facet(g, P.ronce[0], P.ronce[1])); solid.push(coqueGeo(g, 0.03)); });
  for (let i = 0; i < 9; i++) {
    const a = i * 2.39996 + 0.4, e = 0.35 + (i % 3) * 0.3, d = V(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
    const g = aim(tr(prism(0.004, 0.065, 0.36, 4), 0, 0.18, 0), d.clone().multiplyScalar(0.62).add(V(0.03, 0.12, 0)), d, i);
    body.push(facet(g, P.epine[0], P.epine[1])); solid.push(coqueGeo(g, 0.012));
  }
  [[0.1, 0.9, 0.22], [-0.3, 0.8, -0.1], [0.36, 0.72, -0.26], [0.62, 0.52, 0.52], [-0.12, 0.62, 0.52]].forEach(([x, y, z], i) => body.push(facet(tr(gem(0.075), x, y, z, 0, i * 40, 0), P.baie[0], P.baie[1])));
  return { body: mergeGeometries(body), hull: mergeGeometries(solid) };
}
/* Roche fissurée : gros bloc clair, fissures lumineuses posées sur les faces tournées vers la caméra (sud et dessus) */
function crackShape() {
  const P = COMMUN;
  const g = jitter(loft([{ y: -0.12, rx: 0.98, rz: 0.94 }, { y: 0.55, rx: 1.04, rz: 1.0 }, { y: 1.2, rx: 0.78, rz: 0.72, cx: 0.04 }, { y: 1.55, rx: 0.34, rz: 0.3, cx: 0.06 }], 7, { n: 2.4 }), 0.08, 21);
  const probe = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), rc = new THREE.Raycaster(), O = V(0, 0.55, 0);
  const hit = (az, el) => { const a = az / DEG, e = el / DEG, d = V(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)); rc.set(O.clone().addScaledVector(d, 4), d.clone().negate()); const h = rc.intersectObject(probe)[0]; return h ? { p: h.point.clone(), n: h.face.normal.clone() } : null; };
  const shards = [];
  [[[-22, 78], [-8, 56], [-26, 38], [-10, 20], [-24, 4]], [[30, 72], [42, 50], [26, 30], [46, 12]], [[-22, 78], [-70, 74], [-120, 60]], [[42, 50], [70, 40], [82, 18]]].forEach((chain) => {
    const pts = chain.map(([az, el]) => hit(az, el)).filter(Boolean);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], dir = b.p.clone().sub(a.p), len = dir.length(), n = a.n.clone().add(b.n).normalize(); dir.normalize();
      const side = dir.clone().cross(n).normalize(), nn = side.clone().cross(dir).normalize();
      const m = new THREE.Matrix4().makeBasis(dir.clone().multiplyScalar(len / 2 + 0.035), nn.clone().multiplyScalar(0.05), side.clone().multiplyScalar(0.05)).setPosition(a.p.clone().add(b.p).multiplyScalar(0.5).addScaledVector(nn, 0.018));
      shards.push(new THREE.OctahedronGeometry(1, 0).applyMatrix4(m));
    }
  });
  shards.forEach((s) => { s.deleteAttribute('uv'); s.computeVertexNormals(); });
  return { body: facet(g, P.fissuree[0], P.fissuree[1]), hull: coqueGeo(g, 0.035), lines: mergeGeometries(shards) };
}

/* =========================================================
   Fabrique : ctx vient de build.js (outils et tables du monde en cours de construction)
   ========================================================= */
export function createDecor2(ctx) {
  const { isl, M, LOW, terr, isLand, depthOf, instanced, detail, shafts, themeOf } = ctx;
  setLinear(true);   // couleurs du kit en linéaire, comme les créatures
  const OMBRE = PALETTE.OMBRE;
  /* Matériaux. Les teintes d'ambiance du jeu (main.js : M.grass / M.foliage / M.tuft .color) sont partagées par référence. */
  const std = (o = {}) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 }, o));
  const mats = {
    sol: std({ roughness: 0.95 }), solide: std(), feuillage: patchSway(std({ roughness: 0.85, flatShading: false }), { amp: 0.05, speed: 1.1, key: 'fol2' }),
    herbe: patchSway(std({ roughness: 1, flatShading: false }), { amp: 0.32, speed: 2.2, key: 'tuft2' }),
    contour: new THREE.MeshBasicMaterial({ color: 0x000000 }), contourVent: patchSway(new THREE.MeshBasicMaterial({ color: 0x000000 }), { amp: 0.05, speed: 1.1, key: 'fol2' }),
    eau: patchEau(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, transparent: true, opacity: 0.84, roughness: 0.12, metalness: 0.15, emissive: '#1f5fa0', emissiveIntensity: 0.22 })),
    fissure: new THREE.MeshBasicMaterial({ color: col(COMMUN.fissure).multiplyScalar(0.95) }),
  };
  mats.sol.color = M.grass.color; mats.feuillage.color = M.foliage.color; mats.herbe.color = M.tuft.color;
  HM.outline = mats.contour;
  /* géométries instanciées, communes à toutes les zones */
  const clump = clumpShape(), geo = {
    clump: upNormals(facet(clump, OMBRE, '#FFFFFF'), 0.55), clumpHull: coqueGeo(clump, 0.035),
    tuft: tuftShape(OMBRE), flower: flowerShape('#DCE2EC'), ronce: ronceShape(), crack: crackShape(),
  };
  const cellIndex = { r: {}, c: {} };
  const dummy = new THREE.Object3D();
  /* objet instancié + son contour (mêmes matrices) */
  const withHull = (G, body, hull, mat, hullMat, items, set, o = {}) => {
    const m = instanced(G, body, mat, items, set, o), h = instanced(G, hull, hullMat, items, (d, it, i) => { set(d, it, i); }, { receive: false });
    return [m, h];
  };

  function zone(z, zi, G, cells) {
    const id = themeOf(z), TH = PALETTE[id]; if (!TH || id === 'OMBRE' || id === 'commun') return false;
    const P = Object.assign({}, COMMUN, TH);
    const herbe = P.herbe.map(col), chemin = P.chemin.map(col), pr = (k) => P[k].map(col);
    const C = { levre: [herbe[0], col(P.levre)], jupe: [herbe[2], herbe[0]], sous: herbe[2].clone().multiplyScalar(0.7), terre: pr('terre'), terreBas: pr('terreBas'), dessous: pr('dessous'), berge: pr('berge'), fond: pr('fond'), eau: pr('eau'), ecume: col(P.ecume) };
    const kind = (x, y) => { const t = terr(x, y); return t === ' ' || t === '=' ? null : t === '~' ? 'w' : t === ',' || t === 'x' ? 'p' : 'g'; };
    const gTone = (px, pz) => { const n = field(px, pz); return n > 0.6 ? herbe[1] : n < 0.38 ? herbe[2] : herbe[0]; };
    const pTone = (px, pz) => { const n = field(px + 37, pz - 19); return n > 0.62 ? chemin[1] : n < 0.36 ? chemin[2] : chemin[0]; };

    /* ================= SOL : dessus, lèvre, flancs, dessous (un maillage) ; eau (un maillage) ================= */
    const S = new Tris(), E = new Tris();
    const CORN = [[-1, -1], [1, -1], [1, 1], [-1, 1]];                      // coins NO, NE, SE, SO
    const A = [[-1, -0.5], [0.5, -1], [1, 0.5], [-0.5, 1]], B = [[-0.5, -1], [1, -0.5], [0.5, 1], [-1, 0.5]];   // points avant / après chaque coin (pan coupé)
    const SIDE = [[0, -1], [1, 0], [0, 1], [-1, 0]];                         // côté qui suit le coin i : N, E, S, O
    const Y_FOND = -0.42, Y_EAU = -0.1, BAS = -2.4;
    cells.forEach(([x, y]) => {
      const k = kind(x, y), cx = W(x), cz = W(y), pt = (o, yy = 0) => [cx + o[0], yy, cz + o[1]];
      /* pan coupé : les coins saillants d'un chemin ou d'une mare sont rendus à l'herbe (formes octogonales, plus de damier) */
      const cham = CORN.map(([sx, sz]) => k !== 'g' && kind(x + sx, y) !== k && kind(x, y + sz) !== k);
      const vide = SIDE.map(([dx, dz]) => !isLand(x + dx, y + dz));
      const own = k === 'p' ? pTone : gTone;
      const flat = (a, b, c, f) => S.tri(a, b, c, f((a[0] + b[0] + c[0]) / 3, (a[2] + b[2] + c[2]) / 3), UP);
      if (k !== 'w') {
        const O = [cx, 0, cz];
        for (let i = 0; i < 4; i++) {
          const a = pt(A[i]), b = pt(B[i]), cn = pt(CORN[i]), a2 = pt(A[(i + 1) % 4]);
          flat(O, a, b, own); flat(a, cn, b, cham[i] ? gTone : own);
          if (vide[i]) { const m = pt(SIDE[i]); flat(O, b, m, own); flat(O, m, a2, own); }   // sommet au milieu du bord : il existe aussi dans le flanc (pas de jonction en T)
          else flat(O, b, a2, own);
        }
      } else {
        /* mare : cuvette (fond + berges) sous une surface d'eau à facettes bordée d'écume */
        const segs = [], wet = (si) => kind(x + SIDE[si][0], y + SIDE[si][1]) === 'w';
        for (let i = 0; i < 4; i++) {
          if (cham[i]) { segs.push([A[i], B[i], true]); flat(pt(A[i]), pt(CORN[i]), pt(B[i]), gTone); }
          else { segs.push([A[i], CORN[i], !wet((i + 3) % 4)]); segs.push([CORN[i], B[i], !wet(i)]); }
          segs.push([B[i], A[(i + 1) % 4], !wet(i)]);
        }
        const Of = [cx, Y_FOND, cz], Oe = [cx, Y_EAU, cz], inner = (o) => [cx + o[0] * 0.86, Y_EAU + 0.012, cz + o[1] * 0.86];
        segs.forEach(([p, q, wall]) => {
          const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
          S.tri(Of, pt(p, Y_FOND), pt(q, Y_FOND), C.fond[field(cx + mx * 3, cz + mz * 3) > 0.5 ? 1 : 0], UP);
          E.tri(Oe, pt(p, Y_EAU), pt(q, Y_EAU), C.eau[field(cx + mx * 2.2 + 11, cz + mz * 2.2 - 5) > 0.5 ? 1 : 0], UP);
          if (wall) {
            S.quad(pt(p), pt(q), pt(q, Y_FOND), pt(p, Y_FOND), C.berge, [-mx, 0, -mz]);
            E.quad([cx + p[0], Y_EAU + 0.012, cz + p[1]], [cx + q[0], Y_EAU + 0.012, cz + q[1]], inner(q), inner(p), C.ecume, UP);
          }
        });
      }
      /* bord de l'île : lèvre d'herbe en surplomb, jupe d'herbe en dents, flanc de terre en deux strates */
      SIDE.forEach(([nx, nz], si) => {
        if (!vide[si]) return;
        const tx = -nz, tz = nx, rows = [[], [], [], [], [], []];
        for (let i = 0; i <= 4; i++) {
          const u = (i - 2) * 0.5, bx = cx + nx + tx * u, bz = cz + nz + tz * u;
          const lx = 4 * x + 2 * nx + (i - 2) * tx, lz = 4 * y + 2 * nz + (i - 2) * tz;   // coordonnées entières du sommet : mêmes tirages pour les deux bords qui se rejoignent
          let mx = nx, mz = nz;
          if (i === 0 || i === 4) {   // onglet aux coins : saillant (les deux bords sont au vide) ou rentrant (case en diagonale)
            const ex = i ? tx : -tx, ez = i ? tz : -tz;
            if (!isLand(x + ex, y + ez)) { mx += ex; mz += ez; } else if (isLand(x + nx + ex, y + nz + ez)) { mx -= ex; mz -= ez; }
          }
          const h1 = hash(lx, lz, 601), h2 = hash(lx, lz, 602), h3 = hash(lx, lz, 603), h4 = hash(lx, lz, 604);
          const ys = i % 2 ? -0.5 - h1 * 0.16 : -0.3 - h1 * 0.08, j = (h2 - 0.5) * 0.22 + 0.02, jb = (h4 - 0.5) * 0.12;
          rows[0].push([bx, 0, bz]); rows[1].push([bx + mx * 0.14, -0.09, bz + mz * 0.14]); rows[2].push([bx + mx * 0.13, ys, bz + mz * 0.13]); rows[3].push([bx, ys, bz]);
          rows[4].push([bx + mx * j, -1.3 + (h3 - 0.5) * 0.3, bz + mz * j]); rows[5].push([bx + mx * jb, BAS, bz + mz * jb]);
        }
        const out = [nx, 0, nz], outUp = [nx, 1.5, nz];
        for (let i = 0; i < 4; i++) {
          const q = (r, color, o, sh = 0) => S.quad(rows[r][i], rows[r][i + 1], rows[r + 1][i + 1], rows[r + 1][i], color, o, sh);
          const lx = 4 * x + 2 * nx + (i - 2) * tx, lz = 4 * y + 2 * nz + (i - 2) * tz;
          q(0, C.levre, outUp, 0.3); q(1, C.jupe, out); q(2, C.sous, DOWN);
          q(3, C.terre, out, (hash(lx, lz, 611 + si) - 0.5) * 0.5); q(4, C.terreBas, out, (hash(lx, lz, 621 + si) - 0.5) * 0.5);
        }
      });
      /* dessous de l'île : pointe de roche à facettes, plus longue vers le cœur de l'île */
      {
        const d = depthOf[x + ',' + y], h = 2 + d * 2.4 + hash(x, y, 5) * 3, r = d === 0 ? 1.3 : CASE * 0.78, off = d === 0 ? 0.3 : 0.6;
        const ox = cx + (hash(x, y, 6) - 0.5) * off, oz = cz + (hash(x, y, 7) - 0.5) * off, rot = hash(x, y, 8) * 6;
        const tip = [ox + (hash(x, y, 631) - 0.5) * 0.7, BAS - h, oz + (hash(x, y, 632) - 0.5) * 0.7], ring = [];
        for (let i = 0; i < 6; i++) ring.push([ox + Math.cos(rot + i * Math.PI / 3) * r, BAS, oz + Math.sin(rot + i * Math.PI / 3) * r]);
        for (let i = 0; i < 6; i++) {
          const a = ring[i], b = ring[(i + 1) % 6];
          S.tri(a, b, tip, C.dessous, [(a[0] + b[0]) / 2 - ox, 0, (a[2] + b[2]) / 2 - oz], (hash(x * 6 + i, y, 633) - 0.5) * 0.6);
          if (d === 0) S.tri([ox, BAS, oz], a, b, C.dessous[1], UP);
        }
      }
    });
    const sol = new THREE.Mesh(S.geo(), mats.sol); sol.receiveShadow = true; sol.name = 'sol2'; G.add(sol);
    if (E.p.length) { const eau = new THREE.Mesh(E.geo(), mats.eau); eau.name = 'eau2'; eau.renderOrder = 1; G.add(eau); }

    /* ================= SOLIDES fusionnés : rochers, troncs, dalles, cailloux, nénuphars ================= */
    const bodies = [], hulls = [];
    const add = (g, pal, x, yy, zz, ry, s, o = {}) => {
      tr(g, x, yy, zz, 0, ry * DEG, 0, s, s * (o.sy || 1), s);
      const f = facet(g, pal[0], pal[1]); if (o.moss) tintTop(f, o.moss, yy + 0.25);
      bodies.push(f); if (o.hull !== 0) hulls.push(coqueGeo(g, o.hull || 0.03));
    };
    const vary = (pal, d) => [mixHex(pal[0], pal[1], d), mixHex(pal[1], pal[0], -d)];
    cells.forEach(([x, y]) => {
      const t = terr(x, y), wx = W(x), wz = W(y), seed = (x * 131 + y * 17) | 0;
      if (t === '#') {
        /* au bord du vide, le rocher est un peu plus petit et rentré vers l'île : rien ne dépasse dans le vide */
        let ex = 0, ez = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!isLand(x + dx, y + dy)) { ex -= dx; ez -= dy; } });
        const edge = ex || ez || [[1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]) => !isLand(x + dx, y + dy));
        const v = Math.floor(hash(x, y, 701) * 4), s = (0.9 + hash(x, y, 702) * 0.2) * (edge ? 0.86 : 1), ry = hash(x, y, 703) * Math.PI * 2, pal = vary(P.roche, (hash(x, y, 704) - 0.5) * 0.3);
        rockParts(v, seed).forEach((r) => add(r.g, pal, wx + (edge ? ex * 0.1 : (hash(x, y, 705) - 0.5) * 0.12), 0, wz + (edge ? ez * 0.1 : (hash(x, y, 706) - 0.5) * 0.12), ry, s, { moss: r.moss && P.mousse[1], sy: 0.9 + hash(x, y, 707) * 0.3 }));
      } else if (t === 'T') {
        const v = Math.floor(hash(x, y, 711) * 4), kk = 0.88 + hash(x, y, 18) * 0.34, ry = hash(x, y, 19) * 6;
        trunkParts(v, seed).forEach((g) => add(g, P.tronc, wx, 0, wz, ry, kk, { hull: 0.025 }));
      } else if (t === ',' && hash(x, y, 90) < 0.8) {
        for (let k = 0; k < 2; k++) {   // dalles de pierre du chemin
          const n = hash(x, y, 721 + k) < 0.5 ? 5 : 6, s = 0.9 + hash(x, y, 723 + k) * 0.6, g = tr(prism(0.17, 0.2, 0.05, n), 0, 0, 0, 0, 0, 0, 1.35, 1, 1);
          add(g, vary(P.dalle, (hash(x, y, 97 + k) - 0.5) * 0.3), wx + (hash(x, y, 91 + k) - 0.5) * 1.3, 0.014, wz + (hash(x, y, 93 + k) - 0.5) * 1.3, hash(x, y, 95 + k) * 6, s, { hull: 0.012 });
        }
      } else if (t === '.' && !isl.entAt[x + ',' + y] && hash(x, y, 731) < (id === 'lande' ? 0.11 : 0.06)) {
        const g = jitter(loft([{ y: -0.04, rx: 0.2, rz: 0.17 }, { y: 0.09, rx: 0.22, rz: 0.19 }, { y: 0.19, rx: 0.1, rz: 0.09, cx: 0.02 }], 5, { n: 2.3 }), 0.025, seed);   // petit caillou
        add(g, vary(P.roche, (hash(x, y, 732) - 0.5) * 0.3), wx + (hash(x, y, 733) - 0.5) * 1.4, 0, wz + (hash(x, y, 734) - 0.5) * 1.4, hash(x, y, 735) * 6, 0.7 + hash(x, y, 736) * 0.6, { hull: 0.015 });
      } else if (t === '~' && hash(x, y, 741) < 0.45) {
        const px = wx + (hash(x, y, 742) - 0.5) * 0.9, pz = wz + (hash(x, y, 743) - 0.5) * 0.9, s = 0.8 + hash(x, y, 744) * 0.5;   // nénuphar (parfois en fleur)
        add(prism(0.2, 0.2, 0.024, 7), P.nenuphar, px, Y_EAU + 0.014, pz, hash(x, y, 745) * 6, s, { hull: 0.012 });
        if (hash(x, y, 746) < 0.5) add(gem(0.07), P.lotus, px + 0.03, Y_EAU + 0.06, pz - 0.02, 0.4, s, { hull: 0 });
      }
    });
    if (bodies.length) {
      const m = new THREE.Mesh(mergeGeometries(bodies), mats.solide); m.castShadow = true; m.receiveShadow = true; m.name = 'solides2'; G.add(m);
      const h = new THREE.Mesh(mergeGeometries(hulls), mats.contour); h.name = 'solides2_contour'; G.add(h);
    }

    /* ================= FEUILLAGE : houppiers des arbres + buissons de bord d'île (instanciés, vent) ================= */
    const trees = cells.filter(([x, y]) => terr(x, y) === 'T'), leaves = [];
    trees.forEach(([x, y]) => {
      const v = Math.floor(hash(x, y, 711) * 4), kk = 0.88 + hash(x, y, 18) * 0.34, ry = hash(x, y, 19) * 6, ca = Math.cos(ry), sa = Math.sin(ry);
      const kindL = P.feuilles[hash(x, y, 20) < P.floraison ? 1 : 0];
      CROWNS[v].forEach(([dx, yy, dz, s, sy], k) => leaves.push([W(x) + (dx * ca + dz * sa) * kk, yy * kk, W(y) + (-dx * sa + dz * ca) * kk, s * kk, sy, (hash(x, y, 24 + k) - 0.5) * 1.0, kindL[k % 3]]));
    });
    cells.forEach(([x, y]) => {
      const t = terr(x, y); if (t === '#' || t === 'T' || t === 'r' || t === 'c' || t === '~' || isl.entAt[x + ',' + y] || hash(x, y, 120) > 0.3) return;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy], i) => {
        if (isLand(x + dx, y + dy) || hash(x, y, 121 + i) >= 0.7 || leaves.length > 4000) return;
        const s = 0.3 + hash(x, y, 122) * 0.14;   // posé sur l'île (jamais au-dessus du vide)
        leaves.push([W(x) + dx * 0.5 + (hash(x, y, 123) - 0.5) * 0.7 * Math.abs(dy), -0.03, W(y) + dy * 0.5 + (hash(x, y, 124) - 0.5) * 0.7 * Math.abs(dx), s, 0.8, (hash(x, y, 125) - 0.5) * 1.0, P.feuilles[hash(x, y, 126) < P.floraison * 0.6 ? 1 : 0][hash(x, y, 127) < 0.5 ? 0 : 1]]);
      });
    });
    const fol = withHull(G, geo.clump, geo.clumpHull, mats.feuillage, mats.contourVent, leaves, (o, [px, py, pz, s, sy, ry, c]) => { o.position.set(px, py, pz); o.scale.set(s, s * sy, s); o.rotation.y = ry; return col(c); }, { cast: true });
    if (fol[0]) { fol[0].name = 'feuillage2'; fol[1].name = 'feuillage2_contour'; }

    /* rayons de lumière filtrés : inchangés (mêmes tirages que build.js) */
    if (cells.length) {
      const picks = trees.length ? trees : cells.filter(([x, y]) => hash(x, y, 130) < 0.02), nS = Math.min(LOW ? 1 : 3, picks.length);
      for (let i = 0; i < nS; i++) {
        const [x, y] = picks[Math.floor(hash(i, zi, 131) * picks.length)];
        const sm = new THREE.Mesh(new THREE.PlaneGeometry(2.6 + hash(x, y, 132) * 1.4, 11), new THREE.MeshBasicMaterial({ color: '#ffe9b8', map: shaftTexture(), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
        sm.position.set(W(x) + 1.2, 5.2, W(y)); sm.rotation.set(0, hash(x, y, 133) * 3.14, 0.33); sm.rotation.order = 'YXZ'; sm.userData = { ph: hash(x, y, 134) * 6, base: 0.13 };
        detail(zi, sm.position.x, sm.position.z).add(sm); shafts.push(sm);
      }
    }

    /* ================= HERBES ET FLEURS (instanciées, vent, sans contour) ================= */
    const grassCells = cells.filter(([x, y]) => terr(x, y) === '.' && !isl.entAt[x + ',' + y]), tufts = [], lande = id === 'lande';
    grassCells.forEach(([x, y]) => { for (let k = 0; k < (LOW ? 1 : 2); k++) if (hash(x, y, 30 + k) < (lande ? 0.8 : 0.6)) tufts.push([x, y, k]); });
    instanced(G, geo.tuft, mats.herbe, tufts, (o, [x, y, k]) => {
      o.position.set(W(x) + (hash(x, y, 40 + k) - 0.5) * 1.6, 0, W(y) + (hash(x, y, 50 + k) - 0.5) * 1.6); o.rotation.y = hash(x, y, 60 + k) * 6;
      const sc = 0.8 + hash(x, y, 61 + k) * 0.6; o.scale.set(sc, lande ? sc * 1.45 : sc, sc);
      return col(P.touffe).offsetHSL((hash(x, y, 71 + k) - 0.5) * 0.03, 0, (hash(x, y, 70 + k) - 0.5) * 0.08);
    }, { receive: false });
    const fleurs = grassCells.filter(([x, y]) => hash(x, y, 80) < (id === 'village' ? 0.4 : 0.3)).flatMap(([x, y]) => [[x, y, 0], [x, y, 1], ...(hash(x, y, 88) < 0.5 ? [[x, y, 2]] : [])]);
    instanced(G, geo.flower, mats.herbe, fleurs, (o, [x, y, k]) => {
      o.position.set(W(x) + (hash(x, y, 81 + k * 7) - 0.5) * 1.6, 0, W(y) + (hash(x, y, 82 + k * 7) - 0.5) * 1.6); o.rotation.y = hash(x, y, 89 + k) * 6; o.scale.setScalar(0.95 + hash(x, y, 90 + k) * 0.45);
      return col(P.fleurs[Math.floor(hash(x, y, 83 + k) * P.fleurs.length)]);
    }, { receive: false });

    /* ================= RONCES et ROCHES FISSURÉES (retirables : voir remove) ================= */
    const ron = cells.filter(([x, y]) => terr(x, y) === 'r');
    if (ron.length) {
      const ms = withHull(G, geo.ronce.body, geo.ronce.hull, mats.solide, mats.contour, ron, (o, [x, y]) => {
        o.position.set(W(x), 0, W(y)); o.rotation.y = hash(x, y, 6) * 6; const s = 0.96 + hash(x, y, 751) * 0.12; o.scale.set(s, s * (0.9 + hash(x, y, 5) * 0.3), s);
        const g = 0.9 + hash(x, y, 7) * 0.1; return new THREE.Color(g, g, g * 0.97);
      }, { cast: true });
      ron.forEach(([x, y], i) => (cellIndex.r[x + ',' + y] = { ms, i }));
    }
    const cr = cells.filter(([x, y]) => terr(x, y) === 'c');
    if (cr.length) {
      const set = (o, [x, y]) => { o.position.set(W(x), 0, W(y)); o.rotation.y = (hash(x, y, 3) - 0.5) * 1.0; };
      const ms = withHull(G, geo.crack.body, geo.crack.hull, mats.solide, mats.contour, cr, set, { cast: true });
      ms.push(instanced(G, geo.crack.lines, mats.fissure, cr, set, { receive: false }));
      cr.forEach(([x, y], i) => (cellIndex.c[x + ',' + y] = { ms, i }));
    }
    return true;
  }

  /* retire une ronce coupée ou une roche brisée (corps, contour, fissures) ; faux si la case n'est pas gérée ici */
  function remove(kindId, x, y) {
    const r = cellIndex[kindId] && cellIndex[kindId][x + ',' + y]; if (!r) return false;
    r.ms.forEach((mesh) => { if (!mesh) return; dummy.matrix.makeScale(0, 0, 0); mesh.setMatrixAt(r.i, dummy.matrix); mesh.instanceMatrix.needsUpdate = true; });
    delete cellIndex[kindId][x + ',' + y]; return true;
  }
  return { zone, remove, mats, geo };
}
