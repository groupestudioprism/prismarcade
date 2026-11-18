/* =========================================================
   LUMEN — mécanismes d'énigme et objets interactifs, rendu v2 (Île de l'Aube pour l'instant).
   Même style que Lyra et les créatures v2 (kit3d) : low-poly à facettes, couleurs par sommet à deux tons,
   contour noir en coque inversée, parties lumineuses non éclairées.
   Particularité (performance : 68 miroirs, 24 récepteurs) : UNE pièce = UN appel de dessin. Le corps, son contour
   et ses parties lumineuses sont fusionnés dans une seule géométrie ; l'attribut « aGlow » dit au matériau comment
   rendre chaque facette :
       aGlow = 0  facette éclairée normalement (matière)
       aGlow > 0  facette non éclairée, couleur du sommet × aGlow (lumière fixe ; contour noir : couleur 0)
       aGlow < 0  « lampe » : matière éclairée quand uLamp = 0, lumière (couleur × uGain) quand uLamp = 1
   Les géométries sont partagées entre toutes les copies d'un même objet.
   Contrat : les vues gardent les champs lus par build.js (animate) et main.js : head/target, float, spinObj,
   crystal, mat (emissiveIntensity, color, emissive), halo, lit, rings, crown, crownMat, column, cageRing, pick.
   Repère : Y vers le haut, sol à Y = 0, une case = 2 m, « tête » orientable : +X = sens du faisceau.
   ========================================================= */
import { THREE, V, T, prism, box, gem, loft, slab, Soup, facet, stripAttrs, outline, mergeGeometries, lighten, setLinear } from './kit3d.js';

setLinear(true);   /* couleurs par sommet en linéaire dans le jeu (comme creatures.js) */

const OUT = 0.028;   /* épaisseur du contour : lisible à la distance de la caméra de jeu */
const PAL = {
  stone: ['#A198BC', '#D0CAE2'], stoneDark: ['#7B7299', '#A099BA'], gold: ['#C4851C', '#F0B93A'], metal: ['#3D3A52', '#6A6690'],
  wood: ['#9C6B48', '#C59467'], woodLight: ['#B07C54', '#D4A478'], woodDark: ['#6B4A3A', '#8E6650'], inside: ['#2A1A22', '#3A2630'],
  rare: ['#5A4A8A', '#7E6BC0'], rareDark: ['#6A5A9A', '#9486D0'],
  glassA: '#BFE6FA', glassB: '#EEF9FF', glassC: '#9ACFEF', edge: ['#62D6FF', '#A8ECFF'], warm: ['#FFE9B0', '#FFF8E0'],
  ice: ['#8FC4EC', '#D8F0FF'], cyan: ['#7FDCFF', '#DFF7FF'], seal: ['#8A6AF0', '#B9A2FF'], shard: ['#B77DF5', '#E9D2FF'],
  paper: ['#F1E2C2', '#FFF7E2'], ink: ['#8A6B4A', '#8A6B4A'], wisp: ['#FF9FDD', '#FFD9F3'], leaf: ['#4F9A6A', '#7CC48E'], honey: ['#FFBE2E', '#FFD75E'],
  white: ['#D2D2D2', '#FFFFFF'], rock: ['#8F87A6', '#B9B2CE'],
};
const clamp01 = (k) => Math.max(0, Math.min(1, k));

/* ---------- matériau ---------- */
function mecaMat() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 });
  const u = (m.userData.meca = { uLamp: { value: 0 }, uGain: { value: 1.7 } });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLamp = u.uLamp; sh.uniforms.uGain = u.uGain;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlow;\nvarying float vGlow;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;\nuniform float uLamp;\nuniform float uGain;')
      .replace('#include <opaque_fragment>', 'if (vGlow > 0.0) outgoingLight = vColor.rgb * vGlow;\nelse if (vGlow < 0.0) outgoingLight = mix(outgoingLight, diffuseColor.rgb * uGain, uLamp);\n#include <opaque_fragment>');
  };
  m.customProgramCacheKey = () => 'meca2';
  return m;
}

/* ---------- géométrie ---------- */
/* pièces : [géométrie, [couleur, couleur claire], options] ; options.glow (voir en tête), options.hull (false : hors contour ;
   true : dans le contour même si lumineux). Renvoie une géométrie unique : facettes + contour. */
function bake(pieces, off = OUT) {
  const gs = [], solids = [];
  pieces.forEach(([g, col, o = {}]) => {
    const f = facet(g, col[0], col[1]), glow = o.glow || 0;
    f.setAttribute('aGlow', new THREE.BufferAttribute(new Float32Array(f.attributes.position.count).fill(glow), 1));
    gs.push(f);
    if (o.hull === undefined ? glow === 0 : o.hull) solids.push(stripAttrs(g));
  });
  if (solids.length && off > 0) {
    const h = outline(mergeGeometries(solids), 'c', {}, off).geometry;
    h.setAttribute('aGlow', new THREE.BufferAttribute(new Float32Array(h.attributes.position.count).fill(1), 1));
    gs.push(h);
  }
  const out = mergeGeometries(gs); out.computeBoundingSphere(); out.computeBoundingBox();
  return out;
}
/* anneau facetté d'axe Y (de l'angle k0 à k1 sur n côtés ; fermé aux extrémités si c'est un arc) */
function band(rOut, rIn, y0, y1, n = 8, k0 = 0, k1 = n, phase = Math.PI / n) {
  const S = new Soup(), P = (r, a, y) => V(r * Math.sin(a), y, r * Math.cos(a));
  for (let k = k0; k < k1; k++) {
    const a = phase + (k / n) * Math.PI * 2, b = phase + ((k + 1) / n) * Math.PI * 2, rad = P(1, (a + b) / 2, 0);
    S.quad(P(rOut, a, y0), P(rOut, b, y0), P(rOut, b, y1), P(rOut, a, y1), rad);
    S.quad(P(rIn, a, y0), P(rIn, b, y0), P(rIn, b, y1), P(rIn, a, y1), rad.clone().negate());
    S.quad(P(rIn, a, y1), P(rIn, b, y1), P(rOut, b, y1), P(rOut, a, y1), V(0, 1, 0));
    S.quad(P(rIn, a, y0), P(rIn, b, y0), P(rOut, b, y0), P(rOut, a, y0), V(0, -1, 0));
    if (k1 - k0 < n && (k === k0 || k === k1 - 1)) {
      const e = k === k0 ? a : b, tg = V(Math.cos(e), 0, -Math.sin(e)).multiplyScalar(k === k0 ? -1 : 1);
      S.quad(P(rIn, e, y0), P(rOut, e, y0), P(rOut, e, y1), P(rIn, e, y1), tg);
    }
  }
  return S.geo();
}
/* face de miroir : bandes obliques de trois tons (reflet stylisé), sans décor coplanaire donc sans scintillement */
function glassFace(w, h, y, z, sign) {
  const cuts = [0, 0.2, 0.3, 0.56, 0.64, 1], cols = [PAL.glassA, PAL.glassB, PAL.glassA, PAL.glassB, PAL.glassC];
  const xb = (f) => -w / 2 + w * clamp01(f * 1.3 - 0.3), xt = (f) => -w / 2 + w * clamp01(f * 1.3);
  return cols.map((c, i) => {
    const S = new Soup();
    S.quad(V(sign * xb(cuts[i]), y - h / 2, z), V(sign * xb(cuts[i + 1]), y - h / 2, z), V(sign * xt(cuts[i + 1]), y + h / 2, z), V(sign * xt(cuts[i]), y + h / 2, z), V(0, 0, sign));
    return [S.geo(), [c, c], { glow: 1 }];
  });
}
const gemY = (r, sy, x = 0, y = 0, z = 0, ry = 0) => T(gem(r), x, y, z, 0, ry, 0, 1, sy, 1);

export function createMeca2({ COLORS, BEAM_Y, haloSprite, shaftTexture }) {
  const MAT = mecaMat();   /* matériau partagé de toutes les pièces sans état */
  const cache = {};
  const geo = (key, f) => cache[key] || (cache[key] = f());
  const mesh = (g, m = MAT) => { const o = new THREE.Mesh(g, m); o.castShadow = true; return o; };
  const code = (c, k = 0.12) => [COLORS[c] || COLORS.w, lighten(COLORS[c] || COLORS.w, k)];
  /* matériau « lampe » propre à une pièce ; proxy : objet lu et écrit par build.js / main.js comme l'ancien matériau */
  function lamp(hex, off, on, lo = 0.55, floor = 0) {   /* floor : lueur résiduelle une fois éteint (la couleur attendue reste lisible) */
    const m = mecaMat(), u = m.userData.meca, proxy = { emissiveIntensity: off, color: new THREE.Color(hex), emissive: new THREE.Color(hex) };
    const sync = () => { const k = clamp01((proxy.emissiveIntensity - off) / (on - off)); u.uLamp.value = floor + (1 - floor) * k; m.color.copy(proxy.color).multiplyScalar(lo + (1 - lo) * k); return k; };
    sync();
    return { m, u, proxy, sync };
  }

  /* ---------- socle commun ---------- */
  const socle = () => [[loft([{ y: -0.03, rx: 0.9, rz: 0.9 }, { y: 0.11, rx: 0.9, rz: 0.9 }, { y: 0.15, rx: 0.8, rz: 0.8 }, { y: 0.36, rx: 0.76, rz: 0.76 }, { y: 0.42, rx: 0.68, rz: 0.68 }], 8, { capBottom: false }), PAL.stone]];
  const collar = (col, o) => [band(0.84, 0.66, 0.33, 0.45, 8), col, o];   /* anneau du socle : or = orientable, couleur = récepteur */
  const stem = (top, r = 0.1) => [T(prism(r, r + 0.04, top - 0.41, 6), 0, (top + 0.41) / 2, 0), PAL.metal];

  /* ---------- lanterne ---------- */
  const lanternBase = (rot) => geo('lanternBase' + (rot ? 1 : 0), () => bake([...socle(), ...(rot ? [collar(PAL.gold)] : []), stem(0.81), [T(prism(0.17, 0.19, 0.07, 6), 0, 0.455, 0), PAL.gold]]));
  const lanternHead = () => geo('lanternHead', () => bake([
    [T(prism(0.27, 0.27, 0.46, 6), -0.06, 0, 0, 0, 0, -90), PAL.metal],                       // corps
    [T(prism(0.17, 0.21, 0.07, 6), -0.32, 0, 0, 0, 0, -90), PAL.gold],                        // fond
    [T(prism(0.36, 0.2, 0.3, 8), 0.32, 0, 0, 0, 0, -90), PAL.gold],                           // pavillon évasé vers le faisceau
    [T(prism(0.3, 0.3, 0.05, 8), 0.47, 0, 0, 0, 0, -90), PAL.warm, { glow: 2.6 }],            // lentille
    [T(box(0.24, 0.035, 0.17), -0.06, 0.245, 0), PAL.warm, { glow: 2.2 }],                    // lucarne du dessus (lue en plongée)
    [T(box(0.04, 0.13, 0.05), -0.2, 0.29, 0), PAL.gold], [T(box(0.04, 0.13, 0.05), 0.08, 0.29, 0), PAL.gold], [T(box(0.34, 0.045, 0.06), -0.06, 0.365, 0), PAL.gold],   // anse
  ]));

  /* ---------- miroir ---------- */
  const mirrorBase = () => geo('mirrorBase', () => bake([...socle(), collar(PAL.gold), stem(0.56, 0.09)]));
  const mirrorHead = () => geo('mirrorHead', () => bake([
    [T(box(1.56, 0.12, 0.16), 0, -0.47, 0), PAL.metal],                                        // traverse basse
    [T(box(0.12, 1.16, 0.18), 0.84, 0.03, 0), PAL.gold], [T(box(0.12, 1.16, 0.18), -0.84, 0.03, 0), PAL.gold],   // montants
    [T(box(1.56, 0.1, 0.14), 0, 0.52, 0), PAL.edge, { glow: 1.35, hull: true }],               // arête lumineuse : donne l'orientation vue de dessus
    [gemY(0.1, 1.3, 0.84, 0.68, 0), PAL.gold], [gemY(0.1, 1.3, -0.84, 0.68, 0), PAL.gold],     // pommeaux
    ...glassFace(1.58, 0.9, 0.03, 0.04, 1), ...glassFace(1.58, 0.9, 0.03, -0.04, -1),          // deux faces réfléchissantes
  ]));

  /* ---------- prisme ---------- */
  const prismBase = () => geo('prismBase', () => bake([...socle(),
    ...['r', 'g', 'b'].map((c, i) => [band(0.84, 0.66, 0.33, 0.45, 12, i * 4, i * 4 + 4), code(c), { glow: 1.15, hull: true }])]));
  /* cristal triangulaire ; son chapeau porte les trois couleurs séparées (rouge, vert, bleu), lisible en plongée */
  const prismBody = () => geo('prismBody', () => {
    const ph = Math.PI / 3, R = 0.54, r = 0.1, P = (rad, i, y) => { const a = ph + (i / 3) * Math.PI * 2; return V(Math.sin(a) * rad, y, Math.cos(a) * rad); }, top = V(0, 0.52, 0);
    const hat = ['r', 'g', 'b'].map((c, i) => { const S = new Soup(), out = P(1, i + 0.5, 0);
      S.quad(P(R, i, 0.36), P(R, i + 1, 0.36), P(r, i + 1, 0.52), P(r, i, 0.52), out.clone().setY(1)); S.tri(top, P(r, i, 0.52), P(r, i + 1, 0.52), V(0, 1, 0));
      return [S.geo(), code(c, 0.2), { glow: 1.2, hull: true }]; });
    return bake([[loft([{ y: -0.5, rx: 0.14, rz: 0.14 }, { y: -0.38, rx: R, rz: R }, { y: 0.36, rx: R, rz: R }], 3), PAL.ice], ...hat]);
  });

  /* ---------- récepteur ---------- */
  const recvBase = (c) => geo('recvBase' + c, () => bake([...socle(), collar(code(c), { glow: -1, hull: true }),
    [T(prism(0.07, 0.11, 0.13, 6), 0, 0.48, 0), PAL.gold], [T(prism(0.2, 0.1, 0.07, 6), 0, 0.565, 0), PAL.gold]]));   // coupelle (haut : 0,60)
  const RECV = {   /* une forme par couleur attendue (repère en plus de la teinte) ; point le plus bas ≥ -0,41 */
    w: () => gemY(0.36, 1.12),
    r: () => prism(0.03, 0.46, 0.74, 3),
    g: () => loft([{ y: -0.38, rx: 0.03, rz: 0.03 }, { y: -0.1, rx: 0.37, rz: 0.37 }, { y: 0.1, rx: 0.37, rz: 0.37 }, { y: 0.38, rx: 0.03, rz: 0.03 }], 6),
    b: () => box(0.52, 0.52, 0.52),
  };
  const recvCrystal = (c) => geo('recvCrystal' + (RECV[c] ? c : 'w'), () => bake([[(RECV[c] || RECV.w)(), PAL.white, { glow: -1, hull: true }]]));

  /* ---------- relais ---------- */
  const relayBase = () => geo('relayBase', () => bake([...socle(), collar(PAL.gold), [T(prism(0.12, 0.16, 0.15, 6), 0, 0.485, 0), PAL.metal]]));
  const relayHead = () => geo('relayHead', () => bake([
    [band(0.57, 0.46, -0.05, 0.05, 8), PAL.gold],                                              // anneau porteur (le cristal tourne dedans)
    [T(box(0.24, 0.08, 0.11), 0.65, 0, 0), PAL.gold],                                          // flèche de sortie
    [T(slab([[0.68, 0.23], [0.96, 0], [0.68, -0.23]], 0.1), 0, 0, 0, -90, 0, 0), PAL.gold],
    [T(box(0.06, 0.66, 0.06), 0, -0.25, 0.3, 38.66, 0, 0), PAL.gold], [T(box(0.06, 0.66, 0.06), 0, -0.25, -0.3, -38.66, 0, 0), PAL.gold],   // étriers
  ]));
  const relayCrystal = () => geo('relayCrystal', () => bake([[gemY(0.34, 1.1), PAL.white, { glow: -1, hull: true }]]));

  /* ---------- balise ---------- */
  const beaconBase = () => geo('beaconBase', () => {
    const p = [
      [loft([{ y: -0.03, rx: 1.5, rz: 1.5 }, { y: 0.5, rx: 1.5, rz: 1.5 }, { y: 0.62, rx: 1.34, rz: 1.34 }], 6, { capBottom: false }), PAL.stone],
      [loft([{ y: 0.6, rx: 1.16, rz: 1.16 }, { y: 0.9, rx: 1.12, rz: 1.12 }, { y: 1.0, rx: 0.98, rz: 0.98 }], 6), PAL.stoneDark],
      [loft([{ y: 0.98, rx: 0.6, rz: 0.6 }, { y: 4.9, rx: 0.36, rz: 0.36 }, { y: 5.02, rx: 0.3, rz: 0.3 }], 6), PAL.stone],
      [T(prism(0.52, 0.44, 0.2, 6), 0, 5.1, 0), PAL.gold],
      [band(0.6, 0.4, 3.55, 3.7, 6, 0, 6, Math.PI / 6), PAL.gold],
    ];
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; p.push([T(prism(0.012, 0.09, 0.62, 4), Math.cos(a) * 0.56, 5.36, Math.sin(a) * 0.56, Math.sin(a) * 18, 0, -Math.cos(a) * 18), PAL.gold]); }
    return bake(p, 0.035);
  });
  const beaconCrown = () => geo('beaconCrown', () => bake([[gemY(0.6, 1.2), PAL.white, { glow: -1, hull: true }]], 0.035));
  const beaconCage = () => geo('beaconCage', () => { const p = [[T(band(1.07, 0.93, -0.06, 0.06, 6), 0, 0, 0, 90, 0, 0), PAL.gold]];
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; p.push([T(gem(0.13), Math.sin(a) * 1.0, Math.cos(a) * 1.0, 0), PAL.gold]); } return bake(p, 0.035); });
  const beaconRing = (i) => geo('beaconRing' + i, () => { const R = 0.8 - Math.min(i, 3) * 0.06;
    return bake([[T(band(R + 0.07, R - 0.07, -0.06, 0.06, 8), 0, 0, 0, 90, 0, 0), PAL.white, { glow: -1, hull: true }], [T(gem(0.13), R, 0, 0), PAL.white, { glow: -1, hull: true }]]); });

  /* ---------- objets à ramasser et repères ---------- */
  const startRing = () => geo('startRing', () => bake([[band(0.98, 0.76, -0.02, 0.07, 8), PAL.stone],
    ...[0, 1, 2, 3].map((i) => [T(box(0.2, 0.03, 0.1), 0, 0.075, 0.87, 0, 0, 0), PAL.edge, { glow: 1.5 }]).map((p, i) => { p[0].applyMatrix4(new THREE.Matrix4().makeRotationY(i * Math.PI / 2)); return p; })]));
  const startGem = () => geo('startGem', () => bake([[gemY(0.26, 1.3), PAL.edge, { glow: 1.5, hull: true }]]));
  const shardGeo = () => geo('shard', () => bake([[T(gem(0.3), 0, 0, 0, 0, 0, 0, 0.8, 1.45, 0.8), PAL.shard, { glow: 1.2, hull: true }],
    [T(gem(0.09), 0.38, 0.18, 0, 0, 0, 0, 0.8, 1.4, 0.8), PAL.shard, { glow: 1.2, hull: true }], [T(gem(0.07), -0.36, -0.2, 0.05, 0, 0, 0, 0.8, 1.4, 0.8), PAL.shard, { glow: 1.2, hull: true }]]));
  const pageGeo = () => geo('page', () => bake([[box(0.56, 0.03, 0.74), PAL.paper, { glow: 1, hull: true }],
    [T(prism(0.04, 0.04, 0.6, 5), 0, 0.02, -0.37, 0, 0, 90), PAL.paper, { glow: 1, hull: true }],                       // haut roulé
    ...[-0.2, -0.08, 0.04, 0.16].map((z, i) => [T(box(i === 3 ? 0.22 : 0.38, 0.014, 0.04), i === 3 ? -0.08 : 0, 0.016, z), PAL.ink, { glow: 1 }]),   // lignes d'écriture
    [T(gem(0.06), 0.17, 0.02, 0.27, 0, 0, 0, 1, 0.5, 1), PAL.gold, { glow: 1.2 }]]));                                    // sceau
  const floorRing = () => geo('floorRing', () => bake([[band(0.56, 0.49, 0, 0.045, 8), ['#FFE2A0', '#FFF2CC'], { glow: 1.4 }]]));
  const wispGeo = () => geo('wisp', () => bake([[loft([{ y: -0.2, rx: 0.02, rz: 0.02 }, { y: -0.06, rx: 0.17, rz: 0.17 }, { y: 0.1, rx: 0.13, rz: 0.13 }, { y: 0.36, rx: 0.012, rz: 0.012 }], 6), PAL.wisp, { glow: 1.5 }],
    [T(gem(0.05), 0.26, 0.02, 0, 0, 0, 0, 1, 1.5, 1), PAL.wisp, { glow: 1.5 }], [T(gem(0.05), -0.26, 0.02, 0, 0, 0, 0, 1, 1.5, 1), PAL.wisp, { glow: 1.5 }]]));
  const sparkGeo = () => geo('spark', () => bake([[gemY(0.12, 1.3), ['#FFE2A0', '#FFF6D8'], { glow: 2 }]]));
  const flowerGeo = () => geo('flower', () => { const p = [[T(prism(0.025, 0.04, 0.62, 4), 0, 0.29, 0), PAL.leaf],
    [T(gem(1), 0.1, 0.2, 0, 0, 0, -35, 0.13, 0.03, 0.06), PAL.leaf], [T(gem(1), -0.1, 0.3, 0, 0, 0, 35, 0.13, 0.03, 0.06), PAL.leaf],
    [T(gem(0.075), 0, 0.67, 0, 0, 0, 0, 1, 0.8, 1), ['#E8862A', '#F2A040'], { glow: 1 }]];
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 360; p.push([T(T(gem(1), 0.15, 0, 0, 0, 0, 18, 0.13, 0.035, 0.085), 0, 0.63, 0, 0, a, 0), PAL.honey, { glow: 0.95, hull: true }]); }
    return bake(p, 0.02); });
  const trinketGeo = () => geo('trinket', () => bake([[T(band(0.21, 0.13, -0.04, 0.04, 8), 0, 0, 0, 90, 0, 0), PAL.gold], [gemY(0.075, 1.3, 0, 0.23, 0), PAL.cyan, { glow: 1.5, hull: true }]], 0.02));

  /* ---------- portes, sceaux, barrières, ponts ---------- */
  const bridgeGeo = () => geo('bridge', () => bake([
    ...[-0.75, -0.25, 0.25, 0.75].map((x, i) => [T(box(0.46, 0.12, 1.85), x, -0.06, 0), i % 2 ? PAL.woodLight : PAL.wood]),                 // planches (dessus à Y = 0)
    [T(box(1.98, 0.1, 0.14), 0, -0.16, 0.6), PAL.woodDark], [T(box(1.98, 0.1, 0.14), 0, -0.16, -0.6), PAL.woodDark],                         // longerons
    ...[-0.95, 0.95].flatMap((z) => [[T(box(2.0, 0.09, 0.09), 0, 0.5, z), PAL.woodDark], [T(box(0.14, 0.7, 0.14), -0.9, 0.27, z), PAL.wood], [T(prism(0.03, 0.11, 0.1, 4), -0.9, 0.67, z, 0, 45, 0), PAL.gold]]),
  ]));
  const doorGeo = (lock) => geo('door' + (lock ? 1 : 0), () => bake([
    ...[-0.735, -0.245, 0.245, 0.735].map((x, i) => [T(box(0.47, 2.5, 0.34), x, 1.23, 0), i % 2 ? PAL.woodDark : ['#5E4032', '#7E5946']]),   // madriers
    ...[0.5, 1.3, 2.1].map((y) => [T(box(1.96, 0.15, 0.44), 0, y, 0), PAL.metal]),                                                          // ferrures
    [T(box(1.96, 0.12, 0.42), 0, 2.54, 0), PAL.metal],
    ...[-0.735, -0.245, 0.245, 0.735].map((x) => [T(prism(0.02, 0.1, 0.16, 4), x, 2.68, 0, 0, 45, 0), PAL.gold]),                             // pointes
    ...(lock ? [[T(box(0.4, 0.46, 0.54), 0, 1.3, 0), PAL.gold], [T(box(0.1, 0.2, 0.56), 0, 1.3, 0), PAL.inside, { glow: 1 }]] : []),         // serrure (trou visible des deux côtés)
  ]));
  const barrierGeo = () => geo('barrier', () => { const sp = (r, h) => loft([{ y: -0.03, rx: r * 0.8, rz: r * 0.8 }, { y: h * 0.3, rx: r, rz: r }, { y: h * 0.82, rx: r * 0.62, rz: r * 0.62 }, { y: h, rx: 0.015, rz: 0.015 }], 5);
    return bake([[T(sp(0.3, 1.75), -0.52, 0, 0.1, 0, 20, 7), PAL.cyan, { glow: 1.3, hull: true }], [T(sp(0.36, 2.35), 0.04, 0, -0.14, 0, 50, 0), PAL.cyan, { glow: 1.3, hull: true }], [T(sp(0.28, 1.55), 0.56, 0, 0.14, 0, 80, -7), PAL.cyan, { glow: 1.3, hull: true }],
      [T(gem(1), -0.1, 0.02, 0.42, 0, 30, 0, 0.3, 0.16, 0.22), PAL.rock], [T(gem(1), 0.3, 0.02, -0.5, 0, 70, 0, 0.26, 0.14, 0.2), PAL.rock], [T(gem(1), -0.72, 0.02, -0.34, 0, 10, 0, 0.2, 0.12, 0.18), PAL.rock]]); });
  /* cristaux du sceau : bipyramides à six pans (un octaèdre vu en plongée se lit comme un carré plat) */
  const sealGem = (i) => geo('sealGem' + i, () => { const r = [0.6, 0.47, 0.35][i], h = [0.45, 0.36, 0.28][i];
    return bake([[loft([{ y: -h, rx: 0.02, rz: 0.02 }, { y: -h * 0.12, rx: r, rz: r }, { y: h * 0.12, rx: r, rz: r }, { y: h, rx: 0.02, rz: 0.02 }], 6), PAL.seal, { glow: 1.12, hull: true }]]); });
  const sealRing = () => geo('sealRing', () => bake([[band(0.86, 0.74, 0, 0.05, 8), PAL.seal, { glow: 1.25 }], [band(0.56, 0.5, 0, 0.05, 4, 0, 4, Math.PI / 4), PAL.seal, { glow: 1.25 }]]));

  /* ---------- coffre ---------- */
  const chestBody = (rare) => geo('chestBody' + (rare ? 1 : 0), () => bake([
    [T(box(1.1, 0.5, 0.8), 0, 0.37, 0), rare ? PAL.rare : PAL.wood],
    ...[[-0.44, -0.3], [0.44, -0.3], [-0.44, 0.3], [0.44, 0.3]].map(([x, z]) => [T(box(0.18, 0.15, 0.18), x, 0.055, z), PAL.woodDark]),       // pieds posés au sol
    [T(box(0.12, 0.52, 0.84), 0.33, 0.37, 0), PAL.gold], [T(box(0.12, 0.52, 0.84), -0.33, 0.37, 0), PAL.gold],                               // ferrures
    [T(box(0.98, 0.02, 0.68), 0, 0.615, 0), PAL.inside, { glow: 1 }],                                                                        // intérieur sombre (visible une fois ouvert)
  ]));
  /* couvercle : repère du pivot (charnière arrière) ; tout est au-dessus et en avant de la charnière, il ne traverse jamais la caisse */
  const lidProfile = (e) => [[e, 0], [-0.9 - e, 0], [-0.9 - e, 0.12 + e / 2], [-0.76 - e / 2, 0.26 + e], [-0.14 + e / 2, 0.26 + e], [e, 0.12 + e / 2]];
  const chestLid = (rare) => geo('chestLid' + (rare ? 1 : 0), () => bake([
    [T(slab(lidProfile(0), 1.16), 0, 0, 0, 0, 90, 0), rare ? PAL.rareDark : PAL.woodDark],
    [T(slab(lidProfile(0.02), 0.12), 0.33, 0, 0, 0, 90, 0), PAL.gold], [T(slab(lidProfile(0.02), 0.12), -0.33, 0, 0, 0, 90, 0), PAL.gold],
    [T(box(0.22, 0.25, 0.06), 0, -0.065, 0.92), PAL.gold],                                                                                   // moraillon (devant la caisse, solidaire du couvercle)
    [T(box(0.06, 0.1, 0.02), 0, -0.07, 0.948), PAL.inside, { glow: 1 }],
    ...(rare ? [[gemY(0.09, 0.9, 0, 0.29, 0.45), PAL.cyan, { glow: 1.5, hull: true }]] : []),
  ]));

  /* =========================================================
     Vues
     ========================================================= */
  function ent(e, g, v, dirAngle) {
    const add = (o, y = 0) => { o.position.y = y; g.add(o); return o; };
    if (e.t === 'lantern') {
      add(mesh(lanternBase(e.rot))).receiveShadow = true;
      const head = add(mesh(lanternHead()), BEAM_Y);
      const lh = haloSprite('#ffe6b0', 1.9, 0.6); head.add(lh); v.halo = lh; v.lit = true;
      head.rotation.y = dirAngle(e.dir); v.head = head; v.target = () => dirAngle(e.dir);
    } else if (e.t === 'mirror') {
      add(mesh(mirrorBase())).receiveShadow = true;
      const frame = add(mesh(mirrorHead()), BEAM_Y);
      frame.rotation.y = e.state ? -Math.PI / 4 : Math.PI / 4; v.head = frame; v.target = () => (e.state ? -Math.PI / 4 : Math.PI / 4);
    } else if (e.t === 'prism') {
      add(mesh(prismBase())).receiveShadow = true;
      const p = add(mesh(prismBody()), BEAM_Y + 0.1); v.float = p; v.spinObj = p;
    } else if (e.t === 'receiver') {
      const col = COLORS[e.color] || COLORS.w, baseM = mecaMat(), base = { u: baseM.userData.meca }, cr = lamp(col, 0.15, 3.2, 0.8, 0.14);
      base.u.uLamp.value = 1; base.u.uGain.value = 0.72; cr.u.uGain.value = 1.55;   /* anneau du socle : toujours à la couleur attendue, plus vif une fois allumé */
      add(mesh(recvBase(e.color), baseM)).receiveShadow = true;
      const c = add(mesh(recvCrystal(e.color), cr.m), BEAM_Y);
      v.crystal = c; v.mat = cr.proxy;
      v.halo = haloSprite(col, 2.8, 0); v.halo.position.y = BEAM_Y; g.add(v.halo);
      v.tick = (t) => { const k = cr.sync(); base.u.uGain.value = 0.72 + k * (0.4 + Math.sin(t * 4) * 0.08); };
    } else if (e.t === 'relay' && !e.mix) {
      const cr = lamp('#f3e9ff', 0.12, 3, 0.7, 0.1); cr.u.uGain.value = 1.9;
      add(mesh(relayBase())).receiveShadow = true;
      const c = add(mesh(relayCrystal(), cr.m), BEAM_Y);
      const head = add(mesh(relayHead()), BEAM_Y);
      head.rotation.y = dirAngle(e.out); v.head = head; v.target = () => dirAngle(e.out); v.crystal = c; v.mat = cr.proxy;
      v.halo = haloSprite('#ffffff', 2.4, 0); v.halo.position.y = BEAM_Y; g.add(v.halo);
      v.tick = () => { cr.sync(); };
    } else if (e.t === 'beacon' && !(e.need || []).some((c) => 'ymc'.includes(c))) {
      const need = e.need || ['r', 'g', 'b'], gap = Math.min(0.75, 3.4 / Math.max(1, need.length));
      add(mesh(beaconBase())).receiveShadow = true;
      const crown = lamp('#fff6e0', 0.1, 6, 0.9, 0.1); crown.u.uGain.value = 2.6;
      v.crown = add(mesh(beaconCrown(), crown.m), 6.05); v.crownMat = crown.proxy;
      v.cageRing = add(mesh(beaconCage()), 6.05); v.cageRing.rotation.x = Math.PI / 2;
      const lamps = [crown];
      v.rings = need.map((c, i) => {
        const l = lamp(COLORS[c], 0.1, 3.5, 0.6, 0.12); l.u.uGain.value = 1.9; lamps.push(l);
        const r = add(mesh(beaconRing(Math.min(i, 3)), l.m), 1.25 + i * gap); r.rotation.x = Math.PI / 2;
        return { c, mat: l.proxy, r };
      });
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.2, 120, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6b0').multiplyScalar(2.2), map: shaftTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      col.position.y = 66; g.add(col); v.column = col;
      v.halo = haloSprite('#fff2d6', 7, 0); v.halo.position.y = 6.05; g.add(v.halo); v.haloK = 0.6;
      v.tick = () => { lamps.forEach((l) => l.sync()); };
    } else if (e.t === 'shard') {
      const c = add(mesh(shardGeo()), 1); v.float = c; v.spinObj = c; v.pick = true;
    } else if (e.t === 'page') {
      const p = add(mesh(pageGeo()), 1); p.rotation.x = 0.5; add(mesh(floorRing()));
      v.float = p; v.pick = true;
    } else if (e.t === 'wisp') {
      const c = add(mesh(wispGeo()), 0.9); v.float = c; v.spinObj = c; v.pick = true;
    } else if (e.t === 'start') {
      add(mesh(startRing())).receiveShadow = true;
      const cr = add(mesh(startGem()), 0.7); v.float = cr; v.spinObj = cr;
    } else return false;
    return true;
  }

  /* une travée de pont (le groupe est déjà placé et orienté par build.js) */
  function bridge(grp) { const m = mesh(bridgeGeo()); m.receiveShadow = true; grp.add(m); }

  /* porte, sceau ou barrière d'une case ; les enfants d'un sceau tournent (userData.spin lu par build.js) */
  function gate(grp, look, lock) {
    if (look === 'seal') {
      const ring = mesh(sealRing()); ring.castShadow = false; ring.userData.spin = 0.25; grp.add(ring);
      [[0.55, 0.9], [1.42, -1.3], [2.1, 1.7]].forEach(([y, spin], i) => { const m = mesh(sealGem(i)); m.position.y = y; m.userData.spin = spin; grp.add(m); });
    } else if (look === 'door') grp.add(mesh(doorGeo(lock)));
    else grp.add(mesh(barrierGeo()));
  }

  function chest(g, rare) {
    g.add(mesh(chestBody(rare)));
    const lid = new THREE.Group(); lid.position.set(0, 0.66, -0.45); g.add(lid); lid.add(mesh(chestLid(rare)));
    const sparkle = mesh(sparkGeo()); sparkle.castShadow = false; sparkle.position.y = 1.3; g.add(sparkle);
    return { lid, sparkle };
  }

  /* objet à ramasser : renvoie la pièce qui tourne */
  function pickup(g, pk) {
    let f;
    if (pk.item === 'fleur_miel') f = mesh(flowerGeo());
    else if (pk.t === 'page') { f = new THREE.Group(); f.position.y = 1; const p = mesh(pageGeo()); p.rotation.x = 0.5; f.add(p); }
    else { f = mesh(trinketGeo()); f.position.y = 0.9; }
    g.add(f);
    const ring = mesh(floorRing()); ring.castShadow = false; g.add(ring);
    return f;
  }

  return { ent, bridge, gate, chest, pickup };
}
