/* =========================================================
   LUMEN — Gardien d'ombre : chevalier de brume, bouclier au bras gauche, lame d'ombre en main droite (Île de l'Aube).
   « Son bouclier arrête les coups de face. Frappe dans le dos, au marteau ou avec l'Onde de lumière. »
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Hauteur ≈ 1,8 m, rayon de jeu 0,65 m.
   Bras gauche = +X (bouclier), bras droit = −X (lame).
   ========================================================= */
import { THREE, V, T, prism, gem, loft, box, slab, Soup, part, place, materials, lighten, darken, keyed, add, blend, ease, clamp01, jointMat, creatureView } from '../kit3d.js';

const PALETTE = { armor: '#2E2658', armorLight: '#4B3F86', under: '#1A1433', trim: '#6C56C2', trimLight: '#9A86E8', cape: '#4A1F5E', capeLight: '#6B3285', visor: '#0B0716',
  eye: '#D9C2FF', flare: '#B98CFF', rune: '#B98CFF', blade: '#15102B', bladeLight: '#3A2C6E', edge: '#C7A6FF', shield: '#342A66', shieldLight: '#51449A', rim: '#8F7DD8', emblem: '#F1E9FF', star: '#FFE48A' };

/* Pose de repos = garde détendue : bouclier devant le flanc gauche, lame pointée vers l'avant et le haut. */
const REST = {
  Root: { p: [0, 0, 0], r: [0, 0, 0] },
  Pelvis: { p: [0, 0.72, 0], r: [0, 0, 0] },
  Torso: { p: [0, 0.08, 0], r: [0, 0, 0] },
  Head: { p: [0, 0.52, 0], r: [0, 0, 0] },
  Eyes: { p: [0, 0.165, 0.224], r: [0, 0, 0] }, Eyes_Flare: { p: [0, 0.165, 0.226], r: [0, 0, 0], s: 0.001 },
  Stun_Stars: { p: [0, 0.66, 0], r: [0, 0, 0], s: 0.001 },
  Rune: { p: [0, 0.3, 0.193], r: [0, 0, 0] },
  Cape: { p: [0, 0.43, -0.176], r: [12, 0, 0] },
  PauldronL: { p: [0.3, 0.4, 0], r: [0, 0, 0] }, PauldronR: { p: [-0.3, 0.4, 0], r: [0, 0, 0] },
  ArmL_Upper: { p: [0.3, 0.4, 0], r: [-60, -80, 0] }, ArmL_Lower: { p: [0, -0.24, 0], r: [-70, 0, 0] }, HandL: { p: [0, -0.22, 0], r: [0, 0, 0] },
  Shield: { p: [0, -0.14, 0], r: [0, 58, 0] },
  ArmR_Upper: { p: [-0.3, 0.4, 0], r: [0, 0, -10] }, ArmR_Lower: { p: [0, -0.24, 0], r: [-35, 0, 0] }, HandR: { p: [0, -0.22, 0], r: [0, 0, 0] },
  Blade: { p: [0, -0.06, 0], r: [70, 0, 0] }, Blade_Glow: { p: [0, 0, 0], r: [0, 0, 0] },
  LegL_Upper: { p: [0.122, -0.02, 0], r: [0, 0, 0] }, LegL_Lower: { p: [0, -0.3, 0], r: [0, 0, 0] }, FootL: { p: [0, -0.29, 0], r: [0, 0, 0] },
  LegR_Upper: { p: [-0.122, -0.02, 0], r: [0, 0, 0] }, LegR_Lower: { p: [0, -0.3, 0], r: [0, 0, 0] }, FootR: { p: [0, -0.29, 0], r: [0, 0, 0] },
};
const JOINTS = Object.keys(REST);
const PARENT = { Pelvis: 'Root', Torso: 'Pelvis', Head: 'Torso', Eyes: 'Head', Eyes_Flare: 'Head', Stun_Stars: 'Head', Rune: 'Torso', Cape: 'Torso', PauldronL: 'Torso', PauldronR: 'Torso',
  ArmL_Upper: 'Torso', ArmL_Lower: 'ArmL_Upper', HandL: 'ArmL_Lower', Shield: 'ArmL_Lower', ArmR_Upper: 'Torso', ArmR_Lower: 'ArmR_Upper', HandR: 'ArmR_Lower', Blade: 'HandR', Blade_Glow: 'Blade',
  LegL_Upper: 'Pelvis', LegL_Lower: 'LegL_Upper', FootL: 'LegL_Lower', LegR_Upper: 'Pelvis', LegR_Lower: 'LegR_Upper', FootR: 'LegR_Lower' };

/* plaque d'écu : rangées [y, demi-largeur], face avant en toit (arête centrale), dos plat ; solide fermé */
function ecu(rows, zBack, zEdge, bulge) {
  const S = new Soup(), wm = Math.max(...rows.map((r) => r[1]));
  const P = rows.map(([y, w]) => ({ L: V(-w, y, zEdge), C: V(0, y, zEdge + bulge * (w / wm)), R: V(w, y, zEdge), l: V(-w, y, zBack), r: V(w, y, zBack) }));
  for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1];
    S.quad(a.L, a.C, b.C, b.L, V(-0.1, 0, 1)); S.quad(a.C, a.R, b.R, b.C, V(0.1, 0, 1));
    S.quad(a.l, a.r, b.r, b.l, V(0, 0, -1));
    S.quad(a.L, a.l, b.l, b.L, V(-1, a.L.y > b.L.y ? -0.2 : 0.2, 0)); S.quad(a.R, a.r, b.r, b.R, V(1, a.L.y > b.L.y ? -0.2 : 0.2, 0)); }
  const a = P[0], up = V(0, 1, 0); S.tri(a.L, a.C, a.l, up).tri(a.C, a.R, a.r, up).tri(a.C, a.r, a.l, up);
  const z = P[P.length - 1], dn = V(0, -1, 0); S.tri(z.L, z.C, z.l, dn).tri(z.C, z.R, z.r, dn).tri(z.C, z.r, z.l, dn);
  return S.geo();
}
/* polygone plat (éventail autour de c), z donné par une fonction : décor posé sur une surface connue */
function fan(c, pts, zf) { const S = new Soup(), P = (p) => V(p[0], p[1], zf(p[0], p[1])); for (let i = 0; i < pts.length; i++) S.tri(P(c), P(pts[i]), P(pts[(i + 1) % pts.length]), V(0, 0, 1)); return S.geo(); }
const yz = (g) => T(g, 0, 0, 0, 0, -90, 0);   // polygone dessiné en [z, y] : X du dessin → +Z

function build(pal = PALETTE) {
  const P = pal, M = materials('M_Gardien'), nodes = {};
  const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
  const root = new THREE.Object3D(); root.name = 'Root'; nodes.Root = root;
  const A = [P.armor, P.armorLight], U = [P.under, lighten(P.under, 0.18)], Tr = [P.trim, P.trimLight];

  /* ----- Bassin : ceinture, plaques de hanche ----- */
  const hip = (s) => T(T(slab([[-0.075, 0.05], [0.075, 0.05], [0.06, -0.12], [0, -0.17], [-0.06, -0.12]], 0.028), 0, 0, 0, 0, 90, 0), s * 0.222, -0.02, 0, 0, 0, s * 10);
  const pelvis = mk('Pelvis', [[loft([{ y: -0.12, rx: 0.11, rz: 0.095 }, { y: -0.03, rx: 0.2, rz: 0.14 }, { y: 0.07, rx: 0.185, rz: 0.135 }, { y: 0.125, rx: 0.16, rz: 0.115 }], 8, { n: 3 }), ...U],
    [loft([{ y: 0.035, rx: 0.195, rz: 0.142 }, { y: 0.09, rx: 0.19, rz: 0.14 }], 8, { n: 3 }), ...Tr], [hip(1), ...A], [hip(-1), ...A],
    [T(gem(0.05), 0, 0.06, 0.135, 0, 0, 0, 1, 1, 0.5), P.trimLight, '#FFFFFF']]);
  root.add(pelvis);

  /* ----- Buste : cuirasse anguleuse, plastron en pointe, gorgerin ----- */
  const torso = mk('Torso', [[loft([{ y: 0.035, rx: 0.15, rz: 0.105 }, { y: 0.12, rx: 0.185, rz: 0.135 }, { y: 0.27, rx: 0.255, rz: 0.175 }, { y: 0.4, rx: 0.25, rz: 0.17 }, { y: 0.47, rx: 0.15, rz: 0.125 }], 8, { n: 3 }), ...A],
    [T(slab([[-0.15, 0.42], [0.15, 0.42], [0.11, 0.26], [0, 0.1], [-0.11, 0.26]], 0.05), 0, 0, 0.162), P.armorLight, lighten(P.armorLight, 0.2)],
    [loft([{ y: 0.44, rx: 0.145, rz: 0.135 }, { y: 0.545, rx: 0.125, rz: 0.12 }], 6), ...U]]);
  pelvis.add(torso);
  torso.add(mk('Rune', [[T(gem(1), 0, 0, 0, 0, 0, 0, 0.045, 0.07, 0.012), P.rune, '#FFFFFF']], { mat: M.glow('Rune'), outline: false }));

  /* ----- Tête : heaume fermé, masque à fente, cimier ----- */
  const helm = loft([{ y: -0.02, rx: 0.15, rz: 0.16 }, { y: 0.05, rx: 0.19, rz: 0.2 }, { y: 0.2, rx: 0.205, rz: 0.21 }, { y: 0.32, rx: 0.175, rz: 0.185 }, { y: 0.4, rx: 0.1, rz: 0.11 }, { y: 0.43, rx: 0.03, rz: 0.035 }], 8, { n: 3 });
  const mask = T(slab([[-0.13, 0.3], [0.13, 0.3], [0.165, 0.17], [0.07, -0.035], [-0.07, -0.035], [-0.165, 0.17]], 0.1), 0, 0, 0.172);
  const crest = yz(slab([[0.2, 0.3], [0.15, 0.44], [0, 0.48], [-0.19, 0.44], [-0.27, 0.33], [-0.17, 0.29], [-0.1, 0.37], [0.08, 0.37]], 0.034));
  const slit = T(slab([[-0.14, 0.22], [0.14, 0.22], [0.145, 0.15], [0.05, 0.108], [0, 0.125], [-0.05, 0.108], [-0.145, 0.15]], 0.003), 0, 0, 0.2235);
  const nasal = T(box(0.022, 0.13, 0.012), 0, 0.03, 0.225);
  const head = mk('Head', [[helm, ...A], [mask, P.armorLight, lighten(P.armorLight, 0.22)], [crest, ...Tr], [slit, P.visor, P.visor], [nasal, ...Tr]], { solid: [helm, mask, crest] });
  torso.add(head);
  const eye = (s) => slab([[0.028, -0.03], [0.118, 0.04], [0.13, 0.0], [0.05, -0.05]].map(([x, y]) => [x * s, y]), 0.003);
  head.add(mk('Eyes', [[eye(1), P.eye, '#FFFFFF'], [eye(-1), P.eye, '#FFFFFF']], { mat: M.glow('Eyes'), outline: false }));
  const flame = (s) => slab([[0.02, -0.045], [0.07, -0.06], [0.15, -0.01], [0.2, 0.11], [0.135, 0.06], [0.14, 0.15], [0.085, 0.07], [0.06, 0.1], [0.04, 0.02]].map(([x, y]) => [x * s, y]), 0.003);
  head.add(mk('Eyes_Flare', [[flame(1), P.flare, '#FFFFFF'], [flame(-1), P.flare, '#FFFFFF']], { mat: M.glow('Flare'), outline: false }));
  const stars = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return [T(gem(1), Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3, 0, -a * 180 / Math.PI, 0, 0.075, 0.075, 0.03), P.star, '#FFFFFF']; });
  head.add(mk('Stun_Stars', stars, { mat: M.glow('Stars'), outline: false }));

  /* ----- Cape courte déchiquetée (charnière en haut du dos) ----- */
  torso.add(mk('Cape', [[T(slab([[-0.2, 0], [0.2, 0], [0.27, -0.5], [0.225, -0.62], [0.16, -0.52], [0.095, -0.7], [0.02, -0.56], [-0.065, -0.68], [-0.14, -0.54], [-0.215, -0.64], [-0.27, -0.5]], 0.022), 0, 0, -0.011), P.cape, P.capeLight],
    [T(box(0.36, 0.05, 0.03), 0, -0.02, -0.015), ...Tr]]));

  /* ----- Épaulières à pointe (suivent à moitié le bras, voir finish) ----- */
  const pauldron = (s) => [[loft([{ y: -0.075, rx: 0.12, rz: 0.125, cx: s * 0.02 }, { y: 0.03, rx: 0.115, rz: 0.12, cx: s * 0.02 }, { y: 0.09, rx: 0.06, rz: 0.07, cx: s * 0.01 }, { y: 0.105, rx: 0.02, rz: 0.025, cx: s * 0.01 }], 6, { n: 2.6 }), ...A],
    [T(prism(0.004, 0.05, 0.15, 4), s * 0.135, 0.07, 0, 0, 0, -s * 58), ...Tr]];
  torso.add(mk('PauldronL', pauldron(1))); torso.add(mk('PauldronR', pauldron(-1)));

  /* ----- Bras : brassard, canon d'avant-bras à cubitière, gantelet ----- */
  const armUpper = () => [[loft([{ y: -0.25, rx: 0.058, rz: 0.06 }, { y: -0.1, rx: 0.068, rz: 0.07 }, { y: 0.02, rx: 0.072, rz: 0.072 }], 6), ...U]];
  const armLower = () => [[loft([{ y: -0.235, rx: 0.056, rz: 0.058 }, { y: -0.16, rx: 0.074, rz: 0.076 }, { y: -0.03, rx: 0.07, rz: 0.07 }, { y: 0.03, rx: 0.058, rz: 0.058 }], 6), ...A]];
  const hand = () => [[loft([{ y: -0.115, rx: 0.048, rz: 0.055 }, { y: -0.06, rx: 0.058, rz: 0.066 }, { y: -0.005, rx: 0.052, rz: 0.056 }], 6, { n: 3 }), ...U], [loft([{ y: -0.02, rx: 0.064, rz: 0.066 }, { y: 0.02, rx: 0.068, rz: 0.07 }], 6), ...Tr]];
  ['L', 'R'].forEach((side) => { const up = mk('Arm' + side + '_Upper', armUpper()), lo = mk('Arm' + side + '_Lower', armLower()), h = mk('Hand' + side, hand()); torso.add(up); up.add(lo); lo.add(h); });

  /* ----- Bouclier (écu) sanglé à l'avant-bras gauche. Repère de dessin : X le long de l'avant-bras (vers le coude),
     Y vers le haut de l'écu, Z vers l'extérieur ; puis X→Y, Y→Z, Z→X de l'avant-bras, et REST.Shield le tourne de 45°
     autour de l'avant-bras : coude plié à 90° et bras porté à 45° vers l'avant, l'écu est droit, face à l'adversaire,
     et l'épaule reste loin derrière la plaque. ----- */
  const toArm = new THREE.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, 1), V(1, 0, 0)), sh = (g) => g.applyMatrix4(toArm);
  const D = 0.092, CY = -0.09;   // distance avant-bras → dos de la plaque ; centre de l'écu sous l'avant-bras
  const rowsOut = [[0.37, 0.25], [0.31, 0.3], [-0.06, 0.3], [-0.26, 0.235], [-0.42, 0.13], [-0.53, 0.012]].map(([y, w]) => [y + CY, w]);
  const rowsIn = [[0.325, 0.215], [0.275, 0.255], [-0.05, 0.255], [-0.235, 0.195], [-0.385, 0.1], [-0.47, 0.012]].map(([y, w]) => [y + CY, w]);
  const zFace = (x) => D + 0.04 + 0.04 * (1 - Math.abs(x) / 0.255) + 0.004;
  const plateOut = sh(ecu(rowsOut, D, D + 0.028, 0.03)), plateIn = sh(ecu(rowsIn, D + 0.01, D + 0.04, 0.04));
  const ey = 0.115 + CY, star = [[0, 0.17], [0.035, 0.04], [0.13, 0], [0.035, -0.04], [0, -0.17], [-0.035, -0.04], [-0.13, 0], [-0.035, 0.04]].map(([x, y]) => [x, y + ey]);
  const emblem = sh(fan([0, ey], star, zFace)), gemLow = sh(fan([0, ey - 0.25], [[0, 0.05], [0.035, 0], [0, -0.05], [-0.035, 0]].map(([x, y]) => [x, y + ey - 0.25]), (x, y) => zFace(x) + 0.004));
  const strap = sh(T(box(0.05, 0.15, D + 0.02), 0.04, 0, D / 2)), bar = sh(T(box(0.03, 0.2, 0.03), -0.14, 0, 0)), post = (s) => sh(T(box(0.03, 0.03, D + 0.01), -0.14, s * 0.085, D / 2));
  nodes.ArmL_Lower.add(mk('Shield', [[plateOut, P.rim, lighten(P.rim, 0.2)], [plateIn, P.shield, P.shieldLight], [emblem, P.emblem, P.emblem], [gemLow, P.emblem, P.emblem], [strap, ...U], [bar, ...U], [post(1), ...U], [post(-1), ...U]],
    { solid: [plateOut, plateIn, strap, bar, post(1), post(-1)] }));

  /* ----- Lame d'ombre (main droite). Axe de la lame = +Y ; le plat de la lame est dans le plan du coup (YZ), tranchant vers +Z. ----- */
  const bladeG = yz(slab([[0.05, 0.13], [-0.04, 0.13], [-0.046, 0.43], [-0.075, 0.47], [-0.046, 0.52], [-0.04, 0.76], [0.005, 0.9], [0.07, 0.74], [0.058, 0.47]], 0.028));
  const guard = yz(slab([[-0.045, 0.09], [-0.045, 0.135], [0.1, 0.135], [0.15, 0.06], [0.07, 0.09]], 0.044));
  const blade = mk('Blade', [[bladeG, P.blade, P.bladeLight], [guard, ...Tr], [T(prism(0.02, 0.02, 0.21, 6), 0, -0.005, 0), ...U], [T(gem(0.036), 0, -0.13, 0), ...Tr]]);
  nodes.HandR.add(blade);
  blade.add(mk('Blade_Glow', [[yz(slab([[0.014, 0.17], [-0.012, 0.17], [-0.012, 0.72], [0.006, 0.8], [0.02, 0.7]], 0.036)), P.edge, '#FFFFFF'], [yz(slab([[0.066, 0.5], [0.076, 0.74], [0.012, 0.9], [0.05, 0.74]], 0.034)), P.edge, '#FFFFFF']], { mat: M.glow('Blade'), outline: false }));

  /* ----- Jambes : cuissot, grève à genouillère, soleret ----- */
  const legUpper = () => [[loft([{ y: -0.31, rx: 0.076, rz: 0.08 }, { y: -0.16, rx: 0.094, rz: 0.098 }, { y: -0.02, rx: 0.102, rz: 0.106 }, { y: 0.04, rx: 0.085, rz: 0.09 }], 6, { n: 2.5 }), ...U]];
  const legLower = () => [[loft([{ y: -0.3, rx: 0.066, rz: 0.07 }, { y: -0.2, rx: 0.09, rz: 0.094 }, { y: -0.05, rx: 0.086, rz: 0.09 }, { y: 0.03, rx: 0.07, rz: 0.074 }], 6, { n: 2.5 }), ...A],
    [T(prism(0.006, 0.066, 0.13, 4), 0, 0.0, 0.078, 28, 45, 0), ...Tr]];
  const foot = () => [[loft([{ y: -0.11, rx: 0.078, rz: 0.135, cz: 0.045 }, { y: -0.05, rx: 0.08, rz: 0.132, cz: 0.045 }, { y: 0.0, rx: 0.068, rz: 0.08 }, { y: 0.03, rx: 0.06, rz: 0.064 }], 6, { n: 3 }), ...A]];
  ['L', 'R'].forEach((side) => { const up = mk('Leg' + side + '_Upper', legUpper()), lo = mk('Leg' + side + '_Lower', legLower()), f = mk('Foot' + side, foot()); pelvis.add(up); up.add(lo); lo.add(f); });
  return { root, nodes, materials: M };
}

/* ---------- cinématique directe (pour les correcteurs) ---------- */
function world(o) { const W = {}; const get = (j) => W[j] || (W[j] = PARENT[j] ? get(PARENT[j]).clone().multiply(jointMat(REST, j, o)) : jointMat(REST, j, o)); return get; }
const tot = (o, j, i) => REST[j].r[i] + (o[j] && o[j].r ? o[j].r[i] : 0);
const lim = (v, a, b) => Math.max(a, Math.min(b, v));
/* points du corps que la cape doit laisser devant elle : [articulation, point local, rayon] */
const CAPE_PTS = [];
['L', 'R'].forEach((S) => { const s = S === 'L' ? 1 : -1;
  CAPE_PTS.push(['Leg' + S + '_Upper', [0, -0.15, 0], 0.11], ['Leg' + S + '_Lower', [0, 0, 0], 0.105], ['Leg' + S + '_Lower', [0, -0.16, 0], 0.1], ['Foot' + S, [0, 0, 0], 0.09], ['Foot' + S, [0, -0.06, -0.06], 0.085],
    ['Arm' + S + '_Lower', [0, 0, 0], 0.085], ['Arm' + S + '_Lower', [0, -0.12, 0], 0.085], ['Hand' + S, [0, -0.06, 0], 0.08],
    ['Pelvis', [s * 0.14, -0.03, -0.125], 0.03], ['Pelvis', [s * 0.13, 0.08, -0.125], 0.025], ['Pelvis', [s * 0.235, -0.1, -0.07], 0.03]); });
CAPE_PTS.push(['Pelvis', [0, -0.1, -0.1], 0.03], ['Blade', [0, -0.14, 0], 0.045]);
const CAPE_L = 0.7, GROUND_PTS = [[-0.078, -0.11, -0.09], [0.078, -0.11, -0.09], [-0.078, -0.11, 0.18], [0.078, -0.11, 0.18]], KNEE_PTS = [[0, 0.05, 0.12], [0, -0.05, 0.11], [0.07, -0.2, 0.07], [-0.07, -0.2, 0.07]];
const _v = new THREE.Vector3();
/* Correcteurs appliqués à chaque pose (aperçus, export et jeu) :
   1. les épaulières accompagnent à 40 % le bras ; 2. la cape se soulève juste assez pour ne jamais toucher jambes, bassin,
   coudes ni pommeau ; 3. le bassin est recalé pour que le pied (ou le genou) le plus bas touche exactement le sol. */
function finish(o) {
  ['L', 'R'].forEach((S) => { const c = o['Pauldron' + S] || {}; o['Pauldron' + S] = { r: [lim(tot(o, 'Arm' + S + '_Upper', 0) * 0.4, -55, 20), 0, lim(tot(o, 'Arm' + S + '_Upper', 2) * 0.4, -30, 30)], p: [0, 0, 0], s: c.s ?? 1 }; });
  let W = world(o);
  const Ti = W('Torso').clone().invert(), H = REST.Cape.p, cur = REST.Cape.r[0] + (o.Cape && o.Cape.r ? o.Cape.r[0] : 0); let need = cur;
  for (const [j, p, r0] of CAPE_PTS) {
    _v.set(p[0], p[1], p[2]).applyMatrix4(W(j)).applyMatrix4(Ti); const y = _v.y - H[1], z = _v.z - H[2], rho = Math.hypot(y, z), r = r0 + 0.014;
    if (rho <= r + 1e-4) continue;
    const along = Math.sqrt(rho * rho - r * r), half = 0.2 + 0.07 * Math.min(1, along / CAPE_L);
    const w = clamp01((half + r + 0.06 - Math.abs(_v.x)) / 0.06) * clamp01((CAPE_L + r + 0.08 - along) / 0.08) * clamp01((along + 0.02) / 0.06);
    if (w <= 0) continue;
    const a = (Math.atan2(-z, -y) + Math.asin(r / rho)) * 180 / PI;   // angle de la cape (0 = pend droit, > 0 vers l'arrière) qui frôle ce point
    if (a > cur) need = Math.max(need, cur + (a - cur) * w);
  }
  if (need !== cur) { const c = o.Cape || (o.Cape = { r: [0, 0, 0], p: [0, 0, 0], s: 1 }); c.r = [Math.min(82, need) - REST.Cape.r[0], c.r ? c.r[1] : 0, c.r ? c.r[2] : 0]; }
  let m = 1e9;
  ['L', 'R'].forEach((S) => { const F = W('Foot' + S), K = W('Leg' + S + '_Lower'); GROUND_PTS.forEach((p) => { m = Math.min(m, _v.set(p[0], p[1], p[2]).applyMatrix4(F).y); }); KNEE_PTS.forEach((p) => { m = Math.min(m, _v.set(p[0], p[1], p[2]).applyMatrix4(K).y); }); });
  const pe = o.Pelvis || (o.Pelvis = { r: [0, 0, 0], p: [0, 0, 0], s: 1 }), pp = pe.p || [0, 0, 0]; pe.p = [pp[0], pp[1] - m, pp[2]]; if (!pe.r) pe.r = [0, 0, 0];
  return o;
}

/* ---------- animations (écarts par rapport au repos) ---------- */
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
/* somme de poses (écarts) */
function plus(...ps) { const o = {}; ps.forEach((p) => { for (const j in p) add(o, j, p[j]); }); return o; }
/* pied à plat : compense bassin + cuisse + genou (plus « toe » degrés, pointe vers le bas) */
const flat = (o, S, toe = 0) => { const s = S === 'L' ? 1 : -1, u = o['Leg' + S + '_Upper'] || {}, l = o['Leg' + S + '_Lower'] || {}, pv = o.Pelvis || {};
  o['Foot' + S] = { r: [-((pv.r ? pv.r[0] : 0) + (u.r ? u.r[0] : 0) + (l.r ? l.r[0] : 0)) + toe, 0, -((u.r ? u.r[2] : 0) + (pv.r ? pv.r[2] : 0))], p: [0, 0, 0], s: 1 }; return o; };
const feet = (o, tl = 0, tr = 0) => flat(flat(o, 'L', tl), 'R', tr);

/* garde : jambe gauche (côté bouclier) en avant, buste de trois quarts, lame dressée à droite */
const GUARD = feet({ Pelvis: { p: [0, -0.03, 0], r: [0, -14, 0] }, Torso: { r: [3, -8, 0] }, Head: { r: [0, 20, 0] },
  LegL_Upper: { r: [-20, 0, 5] }, LegL_Lower: { r: [24, 0, 0] }, LegR_Upper: { r: [16, 0, -6] }, LegR_Lower: { r: [14, 0, 0] },
  ArmR_Upper: { r: [-10, 0, -6] }, ArmR_Lower: { r: [-15, 0, 0] } });
/* arme levée (fin de l'annonce, début du coup) */
const WIND = feet({ Pelvis: { p: [0, -0.05, -0.03], r: [0, -18, 0] }, Torso: { r: [-8, -16, 0] }, Head: { r: [4, 30, 0] },
  LegL_Upper: { r: [-24, 0, 5] }, LegL_Lower: { r: [30, 0, 0] }, LegR_Upper: { r: [14, 0, -6] }, LegR_Lower: { r: [22, 0, 0] },
  ArmR_Upper: { r: [-100, 0, -4] }, ArmR_Lower: { r: [-15, 0, 0] }, HandR: { r: [35, 0, 0] }, Cape: { r: [6, 0, 0] } });
const FLARE = { Eyes: { s: 1.35 }, Eyes_Flare: { s: 1000 }, Rune: { s: 2.4 } };
const hurtDelta = keyed([{ t: 0, pose: {} }, { t: 0.07, pose: { Pelvis: { p: [0, -0.02, -0.07], r: [-5, 0, 0] }, Torso: { r: [-13, 0, 4] }, Head: { r: [-12, 0, -6] }, ArmL_Upper: { r: [5, 0, 0] }, ArmR_Upper: { r: [8, 0, -8] }, Eyes: { s: 0.6 } } }, { t: 0.3, pose: {} }]);
const blockDelta = keyed([{ t: 0, pose: {} }, { t: 0.06, pose: { Root: { p: [0, 0, -0.07] }, Pelvis: { p: [0, -0.05, 0], r: [-4, 0, 0] }, Torso: { r: [-7, -5, 0] }, Head: { r: [8, 0, 0] }, ArmL_Upper: { r: [6, 3, 0] }, LegL_Lower: { r: [10, 0, 0] }, LegR_Lower: { r: [12, 0, 0] }, FootL: { r: [-6, 0, 0] }, FootR: { r: [-8, 0, 0] }, Rune: { s: 1.8 } } },
  { t: 0.16, pose: { Root: { p: [0, 0, -0.1] }, Pelvis: { p: [0, -0.03, 0], r: [-2, 0, 0] }, Torso: { r: [-3, -2, 0] }, Head: { r: [3, 0, 0] }, ArmL_Upper: { r: [-3, 0, 0] }, LegL_Lower: { r: [5, 0, 0] }, LegR_Lower: { r: [6, 0, 0] }, FootL: { r: [-3, 0, 0] }, FootR: { r: [-4, 0, 0] } } }, { t: 0.35, pose: {} }]);
const idle = (t) => { const w = 2 * PI * t / 3; return plus(GUARD, { Torso: { r: [1.2 * sin(w), 0, 0] }, Pelvis: { p: [0, -0.008 * (1 - cos(w)), 0] }, Head: { r: [0, 5 * sin(w), 0] }, ArmL_Upper: { r: [1.5 * sin(w), 0, 0] }, ArmR_Lower: { r: [3 * sin(w + 1), 0, 0] }, Cape: { r: [2 * sin(w + 0.5), 0, 0] }, Eyes: { s: 1 + 0.06 * sin(2 * w) }, Rune: { s: 1 + 0.2 * sin(2 * w) } }); };
const attack = keyed([
  { t: 0, pose: plus(WIND, FLARE) },
  { t: 0.13, pose: plus(feet({ Pelvis: { p: [0, -0.08, 0.1], r: [6, 16, 0] }, Torso: { r: [18, 22, 0] }, Head: { r: [-12, -30, 0] }, LegL_Upper: { r: [-38, 0, 5] }, LegL_Lower: { r: [42, 0, 0] }, LegR_Upper: { r: [22, 0, -6] }, LegR_Lower: { r: [10, 0, 0] },
      ArmR_Upper: { r: [-44, 0, -4] }, ArmR_Lower: { r: [25, 0, 0] }, HandR: { r: [45, 0, 0] }, ArmL_Upper: { r: [0, 40, 25] }, Cape: { r: [20, 0, 0] } }, 0, 18), FLARE) },
  { t: 0.22, pose: plus(feet({ Pelvis: { p: [0, -0.1, 0.12], r: [8, 20, 0] }, Torso: { r: [24, 26, 0] }, Head: { r: [-16, -34, 0] }, LegL_Upper: { r: [-40, 0, 5] }, LegL_Lower: { r: [44, 0, 0] }, LegR_Upper: { r: [22, 0, -6] }, LegR_Lower: { r: [10, 0, 0] },
      ArmR_Upper: { r: [-27, 0, -4] }, ArmR_Lower: { r: [25, 0, 0] }, HandR: { r: [50, 0, 0] }, ArmL_Upper: { r: [0, 40, 25] }, Cape: { r: [26, 0, 0] } }, 0, 18), { Eyes: { s: 1.2 }, Eyes_Flare: { s: 1000 } }) },
  { t: 0.4, pose: GUARD }]);
const STUNP = feet({ Pelvis: { p: [0, -0.08, 0], r: [4, 0, 0] }, Torso: { r: [14, 0, 0] }, Head: { r: [16, 0, 0] }, LegL_Upper: { r: [-14, 0, 8] }, LegL_Lower: { r: [26, 0, 0] }, LegR_Upper: { r: [-10, 0, -8] }, LegR_Lower: { r: [24, 0, 0] },
  ArmL_Upper: { r: [50, 32, 14] }, ArmL_Lower: { r: [55, 0, 0] }, ArmR_Upper: { r: [5, 0, -4] }, ArmR_Lower: { r: [23, 0, 0] }, HandR: { r: [40, 0, 0] } });
const KNEEL = { Pelvis: { p: [0, -0.33, 0], r: [4, 6, 0] }, Torso: { r: [20, -4, 0] }, Head: { r: [22, -4, 0] }, LegR_Upper: { r: [-82, 0, -6] }, LegR_Lower: { r: [86, 0, 0] }, FootR: { r: [-8, 0, 6] }, LegL_Upper: { r: [-4, 0, 4] }, LegL_Lower: { r: [100, 0, 0] }, FootL: { r: [-20, 0, 0] },
  ArmL_Upper: { r: [0, 0, 0] }, ArmR_Upper: { r: [-10, 0, -8] }, ArmR_Lower: { r: [10, 0, 0] }, HandR: { r: [45, 0, 0] } };
const death = keyed([{ t: 0, pose: GUARD }, { t: 0.16, pose: plus(GUARD, { Pelvis: { p: [0, -0.04, -0.05], r: [-6, 0, 0] }, Torso: { r: [-12, 0, 5] }, Head: { r: [-14, 0, -8] }, ArmR_Upper: { r: [10, 0, -10] } }) },
  { t: 0.45, pose: KNEEL }, { t: 0.9, pose: plus(KNEEL, { Torso: { r: [8, 0, 0] }, Head: { r: [10, 0, 0] } }) }]);

const ANIMS = {
  IDLE: { dur: 3, loop: true, f: idle },
  MOVE: { dur: 0.8, loop: true, f: (t) => { const w = 2 * PI * t / 0.8, sw = sin(w), o = { Pelvis: { p: [0, -0.02, 0], r: [5, -8 - 6 * sw, 2.5 * sw] }, Torso: { r: [4, -4 + 7 * sw, -2 * sw] }, Head: { r: [-4, 12, 0] },
      LegL_Upper: { r: [-4 - 24 * sw, 0, 3] }, LegL_Lower: { r: [10 + 36 * Math.max(0, cos(w)), 0, 0] }, LegR_Upper: { r: [-4 + 24 * sw, 0, -3] }, LegR_Lower: { r: [10 + 36 * Math.max(0, -cos(w)), 0, 0] },
      ArmL_Upper: { r: [-3 + 2 * sin(2 * w), 0, 0] }, ArmR_Upper: { r: [-12 + 6 * sw, 0, -6] }, ArmR_Lower: { r: [-18, 0, 0] }, Cape: { r: [8 + 4 * sin(2 * w + 1), 0, 0] }, Rune: { s: 1 + 0.2 * sin(2 * w) } };
    return feet(o); } },
  WINDUP: { dur: 0.5, loop: false, f: (t) => { const k = ease(clamp01(t / 0.4)), o = blend(idle(t), WIND, k), sh = k * sin(t * 80);
    add(o, 'ArmR_Lower', { r: [1.5 * sh, 0, 0] }); add(o, 'Eyes', { s: 1 + 0.35 * k + 0.08 * k * sin(t * 60) }); add(o, 'Eyes_Flare', { s: 1 + 999 * clamp01(k * 3) }); add(o, 'Rune', { s: 1 + 1.4 * k });
    return o; } },
  ATTACK: { dur: 0.4, loop: false, f: (t) => attack(t) },
  BLOCK: { dur: 0.35, loop: false, f: (t) => plus(GUARD, blockDelta(t)) },
  HURT: { dur: 0.3, loop: false, f: (t) => plus(GUARD, hurtDelta(t)) },
  STUN: { dur: 1.2, loop: true, f: (t) => { const w = 2 * PI * t / 1.2;
    return plus(STUNP, { Pelvis: { r: [0, 0, 3 * sin(w)] }, Torso: { r: [3 * sin(2 * w), 6 * sin(w), 5 * sin(w + 1)] }, Head: { r: [6 * sin(2 * w + 0.5), 10 * sin(w), 10 * sin(w + 2)] }, ArmR_Upper: { r: [3 * sin(w), 0, 0] }, ArmL_Upper: { r: [3 * sin(w + 1), 0, 0] },
      Stun_Stars: { s: 1000, r: [0, 300 * t, 0] }, Eyes: { s: 0.7 + 0.2 * sin(4 * w) } }); } },
  DEATH: { dur: 0.9, loop: false, f: (t) => { const o = death(t), kd = ease(clamp01((t - 0.5) / 0.4));
    if (kd > 0) { const sc = Math.max(0.02, 1 - kd); add(o, 'Root', { s: [sc, sc * (1 + 0.8 * kd * (1 - kd)), sc] }); add(o, 'Eyes', { s: Math.max(0.01, 1 - kd) }); add(o, 'Rune', { s: Math.max(0.01, 1 - kd) }); }
    return o; } },
};
const LABELS = { IDLE: 'Garde', MOVE: 'Marche lourde', WINDUP: 'Annonce du coup', ATTACK: 'Coup de taille', BLOCK: 'Parade au bouclier', HURT: 'Coup reçu', STUN: 'Étourdi, garde ouverte', DEATH: 'Genou à terre, dissipation' };
const MOVES = { WINDUP: { signal: 'la lame se lève au-dessus de l’épaule droite, les yeux flamboient, la rune du plastron grossit' }, ATTACK: { frappe_s: 0.13, portee_m: 2.1, zone: 'devant lui, arc de ±75°' },
  BLOCK: { signal: 'le bouclier encaisse : bref recul, puis retour en garde' } };

export const model = { id: 'gardien', file: 'GardienDOmbre', name: 'Gardien d’ombre', subtitle: 'créature de l’Île de l’Aube', PALETTE, REST, JOINTS, build, ANIMS, LABELS, MOVES, finish,
  ignore: [['Pauldron.', 'Arm._Upper'], ['Shield', 'HandL']] };

/* ---------- vue de jeu : contrat de js/world/creatures.js ----------
   État s : move (0..1), wind (0..1), attack (0..1), hurt (1→0), stun, dead (0..1) ; block (1→0, facultatif : parade au bouclier). */
export function createView() {
  let prev = null;
  return creatureView(model, (s, a) => {
    if (s.dead) { prev = null; return a.at('DEATH', s.dead); }
    const mv = Math.min(1, (s.move || 0) * 1.6);
    let pose = s.stun ? a.loop('STUN') : a.loop('IDLE');
    if (!s.stun && mv > 0) pose = blend(pose, a.loop('MOVE', 0.55 + 0.75 * s.move), mv);
    if (s.wind) pose = blend(pose, a.at('WINDUP', s.wind), Math.min(1, s.wind * 3));
    if (s.attack) pose = a.at('ATTACK', s.attack);
    if (s.block) pose = plus(pose, blockDelta((1 - clamp01(s.block)) * 0.35));
    if (s.hurt) pose = plus(pose, hurtDelta((1 - clamp01(s.hurt)) * 0.3));
    /* lissage court entre états (pas de saut de pose à la fin d'un coup ou d'un étourdissement) */
    prev = prev ? blend(prev, pose, 1 - Math.exp(-26 * Math.min(0.05, a.dt))) : pose;
    return blend(prev, prev, 0);
  }, { mat: (nodes) => { const m = nodes.Torso.material; m.emissive = new THREE.Color('#2a1a55'); return m; } });
}
