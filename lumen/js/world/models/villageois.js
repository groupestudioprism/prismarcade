/* =========================================================
   LUMEN — Habitants de Havre-Aube (Île de l'Aube) : un modèle paramétrable, onze personnages.
   Même famille que Lyra (grosse tête, petit corps, facettes franches, deux tons par matière, contour noir en
   coque inversée) et même méthode que les créatures v2 (kit3d, pièces rigides articulées, animations par poses).
   Base commune : bassin, buste, tête, cheveux, yeux, bouche, bras et jambes articulés (ou robe longue et pieds).
   Par personnage (FICHES) : morphologie, coiffure ou couvre-chef, vêtements, couleurs, objet de métier, gestes.
   Repère : Y vers le haut, regarde vers +Z, sol à Y = 0. Côté gauche = +X.
   Outils : l'identifiant d'un personnage s'écrit « villageois:<id> » (node clip.mjs villageois:selene 1).
   ========================================================= */
import { THREE, V, T, prism, gem, loft, box, slab, disc, star4, band, ringPt, Soup, part, place, stickOn, materials, lighten, darken, mixHex, setLinear, add, blend, clamp01, jointMat, creatureView, D2R } from '../kit3d.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const STEEL = '#8F97AD', WOOD = '#8A5F3F', GOLD = '#F0C66B', SILVER = '#D7DBE8';

/* ---------- Fiches des onze habitants ----------
   Couleurs reprises de l'ancien « look » (js/data/npcs.js). corps : 'jambes' ou 'robe'. main : main qui tient l'objet. */
const BASE = { scale: 1, hs: 1.12, legU: 0.21, legL: 0.21, ty: 1.05, sw: 0.165, g: 1, gz: 1, ar: 1, armU: 0.17, armL: 0.15, out: 16, lean: 0, eye: 0.9, eyeHex: '#2A2440', brow: -7, corps: 'jambes', manches: 'longues', jupe: 0.13, main: 'R', bottes: '#5E3F2B' };
const FICHES = {
  selene: { name: 'Séléné', role: 'gardienne du phare', scale: 0.98, corps: 'robe', lean: 4, eye: 0.8, hair: '#D9D5E6', skin: '#EFD0B4', robe: '#E9E2F5', haut: '#E9E2F5', accent: '#C9B8E8', trim: GOLD, coiffure: 'chignon', col: 'pelerine', objet: 'baton_phare', main: 'L', tenue: 'perche', eyeHex: '#5A4A8C', calme: 1 },
  ysolde: { name: 'Ysolde', role: 'apothicaire', scale: 0.98, corps: 'robe', hair: '#2A2230', skin: '#8D5B3E', robe: '#3F7D5F', haut: '#3F7D5F', accent: '#2F6149', trim: SILVER, coiffure: 'long', lunettes: 1, objet: 'fiole', tenue: 'outil', tilt: [0, 0], eyeHex: '#1B1626' },
  pell: { name: 'Pell', role: 'tailleur ambulant', hair: '#8F3D22', skin: '#EFD0B4', haut: '#F3E6C8', pantalon: '#7A6248', accent: '#E58FB8', trim: GOLD, coiffure: 'boucles', col: 'foulard', cape: '#E58FB8', sacoche: 1, objet: 'ciseaux', tenue: 'outil', tilt: [18, 0], eyeHex: '#3A5A3A' },
  gaspard: { name: 'Gaspard', role: 'pêcheur de nuages', scale: 0.96, lean: 5, eye: 0.8, hair: '#CFCBE0', skin: '#D9AB84', haut: '#C9965A', pantalon: '#6B4A3A', accent: '#6B4A3A', trim: '#8A5F3F', coiffure: 'court', barbe: '#D9D5E6', chapeau: 'paille', objet: 'epuisette', tenue: 'canne', tilt: [40, 26] },
  bran: { name: 'Bran', role: 'forgeron', scale: 1.08, g: 1.26, gz: 1.3, ar: 1.28, sw: 0.172, out: 22, hair: '#3A2A22', skin: '#C99772', haut: '#7A5A48', pantalon: '#4F3A30', accent: '#4A3A33', trim: '#C9805A', coiffure: 'court', barbe: '#3A2A22', manches: 'nues', tablier: 'cuir', jupe: 0, brow: 12, objet: 'pince', tenue: 'outil', tilt: [78, 0] },
  tobias: { name: 'Tobias', role: 'enfant du village', scale: 0.8, hs: 1.2, legU: 0.15, legL: 0.15, ty: 0.86, sw: 0.15, g: 0.9, gz: 0.9, ar: 0.88, armU: 0.14, armL: 0.125, eye: 1.08, hair: '#D6AA5C', skin: '#F6E3D3', haut: '#5F8FD0', pantalon: '#3F5F96', accent: '#3F5F96', trim: GOLD, coiffure: 'epi', short: 1, jupe: 0.11, objet: 'epee_bois', tenue: 'outil', tilt: [24, 16], out: 24, eyeHex: '#2F5FA8', vif: 1 },
  lison: { name: 'Lison', role: 'fille d’Orin', scale: 0.95, hair: '#262033', skin: '#EFD0B4', haut: '#E9DCC2', pantalon: '#5A4A3C', accent: '#2F7D5B', trim: SILVER, coiffure: 'tresse', col: 'pelerine', cape: '#2F7D5B', objet: 'livre', main: 'L', tenue: 'livre', tilt: [-14, 0], eyeHex: '#2A4A3A' },
  mira: { name: 'Mira', role: 'allumeuse de lampions', scale: 0.97, corps: 'robe', hair: '#EA8FB8', skin: '#A8714D', robe: '#F6A5C8', haut: '#F6A5C8', accent: '#E0709F', trim: GOLD, coiffure: 'carre', objet: 'perche_lampion', tenue: 'perche', eyeHex: '#5A2440' },
  aldo: { name: 'Aldo', role: 'capitaine de la garde', scale: 1.05, g: 1.1, gz: 1.08, ar: 1.08, hair: '#5B3A2B', skin: '#D9AB84', haut: '#7D8396', pantalon: '#4A5466', accent: '#4A5466', trim: SILVER, coiffure: 'court', chapeau: 'casque', manches: 'armure', armure: 1, jupe: 0.11, brow: 12, bottes: '#6A7088', objet: 'lance', tenue: 'perche', raide: 1 },
  calixte: { name: 'Calixte', role: 'passeur', scale: 1.04, g: 1.06, gz: 1.06, hair: '#9A9AA8', skin: '#B98560', haut: '#3F6A8A', pantalon: '#3A4250', accent: '#2C4A63', trim: SILVER, coiffure: 'court', barbe: '#9A9AA8', chapeau: 'bonnet', jupe: 0.17, objet: 'rame', tenue: 'perche' },
  maelle: { name: 'Maëlle', role: 'aubergiste', corps: 'robe', g: 1.06, gz: 1.06, hair: '#8F3D22', skin: '#F6E3D3', robe: '#C97A5A', haut: '#C97A5A', accent: '#A85F44', trim: GOLD, coiffure: 'chignon', tablier: 'toile', objet: 'plateau', main: 'L', tenue: 'plateau', tilt: [0, 0], eyeHex: '#5A3A22' },
};
export const IDS = Object.keys(FICHES);

/* ---------- petites aides de géométrie ---------- */
const yz = (g) => T(g, 0, 0, 0, 0, -90, 0);                     // polygone dessiné en [z, y] : X du dessin → +Z
/* paroi sans fond ni couvercle ; flip : faces vers l'intérieur (doublure) */
function wall(rings, N, n, flip) {
  const S = new Soup(), ph = PI / N, P = rings.map((r) => Array.from({ length: N }, (_, k) => ringPt(r, ph + (k / N) * PI * 2, n)));
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < N; k++) {
    const a = P[i][k], b = P[i][(k + 1) % N], c = P[i + 1][(k + 1) % N], d = P[i + 1][k];
    const h = a.clone().add(b).add(c).add(d).multiplyScalar(0.25); h.y = 0; if (flip) h.negate();
    S.quad(a, b, c, d, h);
  }
  return S.geo();
}
/* panneau en relief posé sur un volume de révolution (tablier) : 3 bandes entre les angles ±a0, décollé de « off » */
function panel(rings, n, a0, off, thick) {
  const out = [];
  for (let s = 0; s < 3; s++) {
    const fa = -a0 + (s / 3) * 2 * a0, fb = -a0 + ((s + 1) / 3) * 2 * a0, fm = (fa + fb) / 2;
    const big = (r) => ({ ...r, rx: r.rx + off, rz: r.rz + off });
    const A = rings.map((r) => ringPt(big(r), fa, n)), B = rings.map((r) => ringPt(big(r), fb, n)), Nr = rings.map(() => V(sin(fm), 0.1, cos(fm)).normalize());
    out.push(band(A, B, Nr, thick));
  }
  return out;
}
const tor = (r, t, x, y, z, rx = 0, ry = 0, rz = 0, seg = 8) => T(new THREE.TorusGeometry(r, t, 4, seg), x, y, z, rx, ry, rz);
const two = (c, k = 0.16) => [c, lighten(c, k)];

/* =========================================================
   Fabrique d'un modèle (contrat de kit3d) pour un habitant
   ========================================================= */
function makeModel(id) {
  const S = { ...BASE, ...FICHES[id] }, robe = S.corps === 'robe';
  const { g, gz, ty, hs, ar } = S, th = 0.315 * ty, sx = S.sw * g;
  const SOLE = robe ? 0.0885 : 0.118, pelvisY = 0.03 + S.legU + S.legL + 0.118, LEG = S.legU + S.legL, hx = 0.094 * (0.6 + 0.4 * g);
  const HAND = S.main, FREE = HAND === 'L' ? 'R' : 'L', hsn = HAND === 'L' ? 1 : -1, fsn = -hsn;
  const EY = 0.182, EX = 0.1, MY = 0.103;
  const PAL = { skin: S.skin, hair: S.hair, haut: S.haut, robe: S.robe || S.haut, pantalon: S.pantalon || darken(S.haut, 0.45), accent: S.accent, trim: S.trim, eye: S.eyeHex, bottes: S.bottes, cape: S.cape || S.accent, barbe: S.barbe || S.hair };

  /* ----- pose de repos ----- */
  const armRest = (side) => {
    const s = side === 'L' ? 1 : -1;
    if (side !== HAND) return { up: [0, 0, s * S.out], lo: [-14, 0, 0], hd: [0, 0, 0] };
    switch (S.tenue) {
      case 'perche': return { up: [0, s * 42, s * 26], lo: [-76, 0, 0], hd: [0, 0, 0] };                 // avant-bras vers l'avant et l'extérieur, perche verticale
      case 'canne': return { up: [-8, s * 24, s * 20], lo: [-58, 0, 0], hd: [0, 0, 0] };                 // épuisette tenue comme une canne à pêche
      case 'livre': return { up: [-24, s * -4, s * 22], lo: [-74, 0, 0], hd: [0, 0, 0] };                 // livre devant la poitrine
      case 'plateau': return { up: [0, s * 30, s * 18], lo: [-112, 0, 0], hd: [0, 0, 0] };                // plateau porté à plat
      default: return { up: [-6, s * 26, s * 20], lo: [-72, 0, 0], hd: [0, 0, 0] };                      // outil tenu devant soi
    }
  };
  const aL = armRest('L'), aR = armRest('R');
  const REST = {
    Root: { p: [0, 0, 0], r: [0, 0, 0], s: S.scale },
    Pelvis: { p: [0, pelvisY, 0], r: [0, 0, 0] },
    Torso: { p: [0, 0.05, 0], r: [S.lean, 0, 0] },
    Head: { p: [0, th, 0], r: [-S.lean, 0, 0], s: hs },
    Hair: { p: [0, 0, 0], r: [0, 0, 0] },
    Eyes: { p: [0, EY, 0.2], r: [0, 0, 0] },
    Mouth: { p: [0, MY, 0.19], r: [0, 0, 0] },
  };
  const PARENT = { Pelvis: 'Root', Torso: 'Pelvis', Head: 'Torso', Hair: 'Head', Eyes: 'Head', Mouth: 'Head' };
  const hasTail = S.coiffure === 'long' || S.coiffure === 'tresse';
  if (hasTail) { REST.Tail = { p: [0, 0.1, S.coiffure === 'long' ? -0.264 : -0.278], r: [0, 0, 0] }; PARENT.Tail = 'Head'; }
  if (S.cape) { REST.Cape = { p: [0, 0.262 * ty, -(0.112 * gz + 0.034)], r: [9, 0, 0] }; PARENT.Cape = 'Torso'; }
  [['L', 1, aL], ['R', -1, aR]].forEach(([n, s, a]) => {
    REST['Arm' + n + '_Upper'] = { p: [s * sx, 0.265 * ty, 0], r: a.up }; REST['Arm' + n + '_Lower'] = { p: [0, -S.armU, 0], r: a.lo }; REST['Hand' + n] = { p: [0, -S.armL, 0], r: a.hd };
    PARENT['Arm' + n + '_Upper'] = 'Torso'; PARENT['Arm' + n + '_Lower'] = 'Arm' + n + '_Upper'; PARENT['Hand' + n] = 'Arm' + n + '_Lower';
  });
  REST.Prop = { p: [0, -0.06, 0], r: [0, 0, 0] }; PARENT.Prop = 'Hand' + HAND;
  const GLOW = { baton_phare: [0, 0.875, 0], fiole: [0.03, 0.3, 0], epuisette: [0, 1.1, 0.05], pince: [0, 0.535, 0], perche_lampion: [0, 0.86, 0] }[S.objet];   // centre de la pièce lumineuse de l'objet
  if (GLOW) { REST.Prop_Glow = { p: GLOW, r: [0, 0, 0] }; PARENT.Prop_Glow = 'Prop'; }
  let gripY = 0.6;   // hauteur du poing au repos (calculée plus bas) : le bas des perches s'arrête juste au-dessus du sol
  if (robe) [['L', 1], ['R', -1]].forEach(([n, s]) => { REST['Foot' + n] = { p: [s * 0.085, -(pelvisY - SOLE), 0.03], r: [0, 0, 0] }; PARENT['Foot' + n] = 'Pelvis'; });
  else {
    if (S.jupe) { REST.Skirt = { p: [0, 0, 0], r: [0, 0, 0] }; PARENT.Skirt = 'Pelvis'; }
    [['L', 1], ['R', -1]].forEach(([n, s]) => {
      REST['Leg' + n + '_Upper'] = { p: [s * hx, -0.03, 0], r: [0, 0, 0] }; REST['Leg' + n + '_Lower'] = { p: [0, -S.legU, 0], r: [0, 0, 0] }; REST['Foot' + n] = { p: [0, -S.legL, 0], r: [0, 0, 0] };
      PARENT['Leg' + n + '_Upper'] = 'Pelvis'; PARENT['Leg' + n + '_Lower'] = 'Leg' + n + '_Upper'; PARENT['Foot' + n] = 'Leg' + n + '_Lower';
    });
  }
  const JOINTS = Object.keys(REST);

  /* ----- objets de métier : axe +Y, origine dans le poing ----- */
  function propGeo(P) {
    const wood = two(WOOD), steel = two(STEEL, 0.3), gold = two(GOLD, 0.3), o = { pieces: [], glow: null, offset: 0.012 };
    const shaft = (y0, y1, r, c = wood) => [T(prism(r * 0.92, r, y1 - y0, 6), 0, (y0 + y1) / 2, 0), ...c];
    const low = -(gripY - 0.035);   // bas d'une perche tenue droite
    switch (S.objet) {
      case 'baton_phare':   // bâton blanc de la gardienne, fourche dorée, éclat du phare
        o.pieces.push(shaft(low, 0.74, 0.021, two('#E9E2F5', 0.5)), [T(prism(0.034, 0.03, 0.05, 6), 0, 0.02, 0), ...gold], [T(prism(0.036, 0.026, 0.06, 6), 0, 0.75, 0), ...gold],
          [T(box(0.018, 0.16, 0.03), 0.07, 0.85, 0, 0, 0, -22), ...gold], [T(box(0.018, 0.16, 0.03), -0.07, 0.85, 0, 0, 0, 22), ...gold], [T(prism(0.03, 0.024, 0.04, 6), 0, low, 0), ...gold]);
        o.glow = [[T(gem(1), 0, 0.875, 0, 0, 0, 0, 0.05, 0.085, 0.05), '#FFE6B0', '#FFFFFF']]; break;
      case 'perche_lampion':   // perche d'allumeuse : crochet, coupelle de laiton, petite flamme
        o.pieces.push(shaft(low, 0.8, 0.017), [T(prism(0.04, 0.022, 0.05, 6), 0, 0.82, 0), ...gold], [T(box(0.1, 0.018, 0.02), hsn * 0.05, 0.7, 0), ...gold], [T(box(0.018, 0.07, 0.02), hsn * 0.095, 0.672, 0), ...gold]);
        o.glow = [[T(gem(1), 0, 0.905, 0, 0, 0, 0, 0.034, 0.07, 0.034), '#FFD27A', '#FFF6D0']]; break;
      case 'lance':   // lance de la garde : fer en feuille, fanion rouge
        o.pieces.push(shaft(low, 0.86, 0.021), [slab([[0, 1.13], [0.055, 0.96], [0.022, 0.86], [-0.022, 0.86], [-0.055, 0.96]], 0.026), ...steel], [T(prism(0.03, 0.03, 0.05, 6), 0, 0.85, 0), ...steel],
          [slab([[0.02, 0.8], [0.2, 0.76], [0.13, 0.71], [0.2, 0.655], [0.02, 0.63]].map(([x, y]) => [x * hsn, y]), 0.014), '#C94D5A', '#E06A76'], [T(prism(0.026, 0.02, 0.05, 6), 0, low, 0), ...steel]);
        break;
      case 'rame':   // rame du passeur, pale vers le haut
        o.pieces.push(shaft(low, 0.58, 0.021), [slab([[-0.035, 0.56], [0.035, 0.56], [0.082, 0.7], [0.086, 0.98], [0.05, 1.06], [-0.05, 1.06], [-0.086, 0.98], [-0.082, 0.7]], 0.028), ...two('#A77B52')],
          [T(box(0.176, 0.03, 0.034), 0, 0.99, 0), ...two(P.accent)], [T(box(0.05, 0.05, 0.05), 0, low, 0), ...wood]);
        break;
      case 'epuisette': {   // épuisette à nuages : longue perche, cerceau, filet clair, un petit nuage pris dedans
        o.pieces.push(shaft(-0.13, 0.96, 0.017), [tor(0.15, 0.013, 0, 1.1, 0), ...two('#A77B52')], [T(prism(0.022, 0.022, 0.05, 6), 0, 0.955, 0), ...two('#A77B52')],
          [T(loft([{ y: -0.26, rx: 0.02, rz: 0.02 }, { y: -0.16, rx: 0.085, rz: 0.085 }, { y: 0, rx: 0.14, rz: 0.14 }], 6), 0, 1.1, -0.012, 90, 0, 0), '#DCE6F5', '#FFFFFF']);
        o.glow = [[T(gem(1), 0, 1.1, 0.055, 0, 0, 0, 0.085, 0.06, 0.05), '#F4F8FF', '#FFFFFF'], [T(gem(1), 0.06, 1.075, 0.05, 0, 0, 0, 0.05, 0.04, 0.04), '#E6EEFF', '#FFFFFF']]; break; }
      case 'pince':   // pince de forge et lingot rouge (son marteau est perdu dans la lande)
        o.pieces.push([T(box(0.02, 0.5, 0.022), 0.018, 0.2, 0, 0, 0, -3), ...two('#4A4652', 0.3)], [T(box(0.02, 0.5, 0.022), -0.018, 0.2, 0, 0, 0, 3), ...two('#4A4652', 0.3)], [T(box(0.05, 0.03, 0.03), 0, 0.3, 0), ...two('#3A3640', 0.3)],
          [T(box(0.03, 0.06, 0.03), 0.03, 0.47, 0), ...two('#4A4652', 0.3)], [T(box(0.03, 0.06, 0.03), -0.03, 0.47, 0), ...two('#4A4652', 0.3)]);
        o.glow = [[T(box(0.05, 0.13, 0.04), 0, 0.535, 0), '#FF9A4A', '#FFD9A0']]; break;
      case 'epee_bois':   // épée de bois de l'enfant
        o.pieces.push([slab([[-0.03, 0.075], [0.03, 0.075], [0.03, 0.38], [0, 0.45], [-0.03, 0.38]], 0.022), ...two('#B98A5A')], [T(box(0.11, 0.03, 0.034), 0, 0.07, 0), ...wood], [T(prism(0.017, 0.017, 0.11, 6), 0, 0.015, 0), ...wood]);
        o.offset = 0.01; break;
      case 'fiole':   // fiole ventrue, bouchon, bulle lumineuse
        o.pieces.push([loft([{ y: 0.035, rx: 0.03, rz: 0.03 }, { y: 0.06, rx: 0.062, rz: 0.062 }, { y: 0.11, rx: 0.066, rz: 0.066 }, { y: 0.15, rx: 0.03, rz: 0.03 }, { y: 0.2, rx: 0.024, rz: 0.024 }], 6), '#58C98A', '#A6F0C4'],
          [T(prism(0.03, 0.03, 0.016, 6), 0, 0.2, 0), '#CFE8DC', '#FFFFFF'], [T(prism(0.018, 0.022, 0.035, 6), 0, 0.222, 0), ...wood], [T(prism(0.02, 0.02, 0.1, 6), 0, -0.01, 0), '#CFE8DC', '#FFFFFF']);
        o.glow = [[T(gem(1), 0.03, 0.3, 0, 0, 0, 0, 0.022, 0.03, 0.022), '#C8FFD9', '#FFFFFF']]; o.offset = 0.01; break;
      case 'ciseaux':   // grands ciseaux de tailleur
        o.pieces.push([T(slab([[-0.02, 0.02], [0.016, 0.02], [0.006, 0.4]], 0.014), 0, 0, 0.008, 0, 0, -5), ...steel], [T(slab([[0.02, 0.02], [-0.016, 0.02], [-0.006, 0.4]], 0.014), 0, 0, -0.008, 0, 0, 5), ...steel],
          [T(prism(0.014, 0.014, 0.034, 6), 0, 0.075, 0, 90, 0, 0), ...gold], [tor(0.036, 0.011, 0.045, -0.085, 0, 0, 0, 0, 6), ...gold], [tor(0.036, 0.011, -0.045, -0.085, 0, 0, 0, 0, 6), ...gold],
          [T(box(0.02, 0.07, 0.016), 0.022, -0.03, 0, 0, 0, -22), ...gold], [T(box(0.02, 0.07, 0.016), -0.022, -0.03, 0, 0, 0, 22), ...gold]);
        o.offset = 0.01; break;
      case 'livre':   // journal relié (les pages d'Orin)
        o.pieces.push([T(box(0.165, 0.21, 0.05), 0, 0.1, 0), ...two('#6B4A3A')], [T(box(0.15, 0.196, 0.036), 0.012, 0.1, 0), '#EFE4C8', '#FFF8E6'], [T(gem(1), 0, 0.1, 0.027, 0, 0, 0, 0.03, 0.04, 0.006), ...two(SILVER, 0.4)],
          [T(box(0.03, 0.214, 0.054), -0.07, 0.1, 0), ...two(P.accent)]);
        break;
      case 'plateau':   // plateau de l'auberge : miche de pain au miel, chope
        o.pieces.push([loft([{ y: 0.058, rx: 0.165, rz: 0.125, cz: 0.05 }, { y: 0.08, rx: 0.178, rz: 0.136, cz: 0.05 }], 8, { n: 2.8 }), ...wood], [T(prism(0.03, 0.034, 0.05, 6), 0, 0.036, 0), ...wood],
          [loft([{ y: 0.078, rx: 0.062, rz: 0.05, cx: -0.07, cz: 0.05 }, { y: 0.113, rx: 0.074, rz: 0.06, cx: -0.07, cz: 0.05 }, { y: 0.143, rx: 0.05, rz: 0.04, cx: -0.07, cz: 0.05 }], 6), '#D9984A', '#F2C27A'],
          [T(prism(0.04, 0.036, 0.09, 6), 0.08, 0.123, 0.06), '#EFE4C8', '#FFFFFF'], [T(box(0.022, 0.05, 0.02), 0.13, 0.123, 0.06), '#EFE4C8', '#FFFFFF'], [T(prism(0.032, 0.032, 0.01, 6), 0.08, 0.17, 0.06), '#B5793A', '#D9984A']);
        break;
    }
    return o;
  }

  /* ----- construction ----- */
  function build(pal = PAL) {
    const P = pal, M = materials('M_' + id), nodes = {};
    const mk = (name, pieces, opt) => { const m = place(part(name, pieces, M, opt), REST[name]); nodes[name] = m; return m; };
    const root = place(new THREE.Object3D(), REST.Root); root.name = 'Root'; nodes.Root = root;
    const haut = two(P.haut), trim = two(P.trim, 0.3), acc = two(P.accent), skin = [P.skin, lighten(P.skin, 0.3)], pant = two(P.pantalon), hairC = [P.hair, lighten(P.hair, 0.2)];
    const RT = (rings) => rings.map((r) => ({ ...r, y: r.y * ty, rx: r.fix ? r.rx : r.rx * g, rz: r.fix ? r.rz : r.rz * gz, cx: (r.cx || 0) * g }));

    /* ===== Bassin ===== */
    let pelvis;
    if (robe) {
      /* robe longue : cloche fermée du haut des hanches à l'ourlet, les pieds dépassent dessous */
      const hem = -(pelvisY - 0.1), bell = [{ y: hem, rx: 0.262 * g, rz: 0.236 * gz }, { y: -0.25, rx: 0.212 * g, rz: 0.186 * gz }, { y: -0.05, rx: 0.158 * g, rz: 0.128 * gz }, { y: 0.055, rx: 0.125 * g, rz: 0.1 * gz }];
      const robeC = two(P.robe), pieces = [[loft(bell, 10, { n: 2.3 }), ...robeC], [loft([{ y: hem, rx: 0.27 * g, rz: 0.244 * gz }, { y: hem + 0.04, rx: 0.263 * g, rz: 0.237 * gz }], 10, { n: 2.3 }), ...(S.tablier ? acc : trim)]];
      if (S.tablier === 'toile') panel([{ y: hem + 0.07, rx: 0.25 * g, rz: 0.225 * gz }, bell[1], bell[2], { y: 0.03, rx: 0.134 * g, rz: 0.108 * gz }], 2.3, 0.62, 0.006, 0.014).forEach((b) => pieces.push([b, '#F3E6C8', '#FFFAEC']));
      if (S.calme) pieces.push([loft([{ y: -0.2, rx: 0.205 * g, rz: 0.18 * gz }, { y: -0.165, rx: 0.197 * g, rz: 0.172 * gz }], 10, { n: 2.3 }), ...acc]);
      pelvis = mk('Pelvis', pieces);
    } else {
      const hip = loft([{ y: -0.085, rx: 0.11 * g, rz: 0.088 * gz }, { y: -0.02, rx: 0.136 * g, rz: 0.104 * gz }, { y: 0.055, rx: 0.13 * g, rz: 0.1 * gz }], 8, { n: 2.4 });
      const pieces = [[hip, ...(S.jupe ? haut : pant)]];
      if (S.tablier === 'cuir') pieces.push([T(slab([[-0.14 * g, 0.03], [0.14 * g, 0.03], [0.155 * g, -0.3], [0.1 * g, -0.345], [-0.1 * g, -0.345], [-0.155 * g, -0.3]], 0.024), 0, 0, 0.1 * gz + 0.03), ...two(P.accent, 0.12)],
        [T(box(0.11 * g, 0.075, 0.016), 0, -0.14, 0.1 * gz + 0.046), ...two(darken(P.accent, 0.15), 0.12)]);
      if (S.sacoche) pieces.push([T(box(0.07, 0.11, 0.13), 0.128 * g + 0.04, -0.03, -0.01), ...two(WOOD)], [T(box(0.078, 0.04, 0.138), 0.128 * g + 0.04, 0.012, -0.01), ...trim]);
      pelvis = mk('Pelvis', pieces);
      if (S.jupe) {
        /* pan de tunique : coque ouverte autour des hanches (les cuisses passent dessous sans la toucher) */
        const L = S.jupe, gs = 0.5 + 0.5 * g, flare = [{ y: -L, rx: (0.2 + (L - 0.07) * 0.5) * gs, rz: (0.158 + (L - 0.07) * 0.5) * gz }, { y: -0.07, rx: 0.2 * gs, rz: 0.158 * gz }, { y: -0.006, rx: 0.174 * gs, rz: 0.13 * gz }];
        const out = wall(flare, 10, 2.4, false), edge = wall([{ y: -L, rx: flare[0].rx + 0.007, rz: flare[0].rz + 0.007 }, { y: -L + 0.03, rx: flare[0].rx + 0.004, rz: flare[0].rz + 0.004 }], 10, 2.4, false);
        const col = S.armure ? two(STEEL, 0.3) : haut;
        pelvis.add(mk('Skirt', [[out, ...col], [wall(flare, 10, 2.4, true), darken(col[0], 0.4), darken(col[0], 0.4)], [edge, ...(S.armure ? acc : trim)]], { solid: [out, edge], shell: true }));
      }
    }
    root.add(pelvis);

    /* ===== Buste : tunique, ceinture, col, accessoires de tenue ===== */
    const tunic = loft(RT([{ y: -0.03, rx: 0.132, rz: 0.102 }, { y: 0.06, rx: 0.14, rz: 0.106 }, { y: 0.2, rx: 0.15, rz: 0.112 }, { y: 0.28, rx: 0.13, rz: 0.1 }, { y: 0.315, rx: 0.075, rz: 0.062, fix: 1 }]), 8, { n: 2.4 });
    const tp = [[tunic, ...(S.armure ? two(STEEL, 0.3) : haut)], [loft(RT([{ y: -0.005, rx: 0.146, rz: 0.115 }, { y: 0.05, rx: 0.15, rz: 0.118 }]), 8, { n: 2.4 }), ...(S.tablier ? acc : trim)],
      [T(prism(0.05, 0.055, 0.07, 6), 0, th + 0.008, 0), ...skin]];
    if (!S.tablier) tp.push([T(box(0.06, 0.05 * ty, 0.024), 0, 0.022 * ty, 0.118 * gz), ...two(darken(P.trim, 0.2), 0.3)]);
    const zc = 0.112 * gz;   // avant de la poitrine
    if (S.col === 'pelerine') {   // empiècement d'épaules (court : il s'arrête avant les bras) et broche
      tp.push([loft(RT([{ y: 0.262, rx: 0.15, rz: 0.125 }, { y: 0.3, rx: 0.13, rz: 0.112 }, { y: 0.33, rx: 0.086, rz: 0.076 }]), 8, { n: 2.4 }), ...acc], [loft(RT([{ y: 0.25, rx: 0.156, rz: 0.13 }, { y: 0.27, rx: 0.152, rz: 0.127 }]), 8, { n: 2.4 }), ...trim],
        [T(gem(1), 0, 0.272 * ty, 0.13 * gz + 0.004, 0, 0, 0, 0.03, 0.036, 0.014), ...trim]);
    }
    if (S.col === 'foulard') tp.push([loft(RT([{ y: 0.268, rx: 0.132, rz: 0.11 }, { y: 0.3, rx: 0.126, rz: 0.106 }, { y: 0.326, rx: 0.092, rz: 0.08 }]), 8, { n: 2.2 }), '#E85A6A', '#F58A94'],
      [T(slab([[-0.04, 0], [0.04, 0], [0.05, -0.12], [0.012, -0.165], [-0.03, -0.12]], 0.02), 0.045, 0.275 * ty, zc + 0.014, 0, 0, -8), '#E85A6A', '#F58A94']);
    if (S.tablier === 'cuir') tp.push([T(slab([[-0.085 * g, 0.26 * ty], [0.085 * g, 0.26 * ty], [0.125 * g, 0.03], [-0.125 * g, 0.03]], 0.02), 0, 0, zc + 0.012), ...two(P.accent, 0.12)],
      [T(box(0.03, 0.03, 0.01), 0.07 * g, 0.24 * ty, zc + 0.026), ...trim], [T(box(0.03, 0.03, 0.01), -0.07 * g, 0.24 * ty, zc + 0.026), ...trim]);
    if (S.tablier === 'toile') tp.push([T(slab([[-0.07 * g, 0.235 * ty], [0.07 * g, 0.235 * ty], [0.11 * g, 0.045], [-0.11 * g, 0.045]], 0.016), 0, 0, zc + 0.01), '#F3E6C8', '#FFFAEC']);
    if (S.armure) {   // plastron, emblème, épaulières (dômes posés au-dessus de l'articulation)
      tp.push([T(slab([[-0.11 * g, 0.27 * ty], [0.11 * g, 0.27 * ty], [0.1 * g, 0.14 * ty], [0, 0.075 * ty], [-0.1 * g, 0.14 * ty]], 0.03), 0, 0, zc + 0.014), ...two('#A5ACC0', 0.3)], [T(gem(1), 0, 0.2 * ty, zc + 0.032, 0, 0, 0, 0.03, 0.04, 0.01), '#C94D5A', '#E06A76']);
      [1, -1].forEach((s) => tp.push([loft([{ y: 0.268 * ty, rx: 0.1, rz: 0.108, cx: s * (sx + 0.012) }, { y: 0.268 * ty + 0.055, rx: 0.09, rz: 0.098, cx: s * (sx + 0.008) }, { y: 0.268 * ty + 0.092, rx: 0.045, rz: 0.05, cx: s * sx }, { y: 0.268 * ty + 0.1, rx: 0.01, rz: 0.012, cx: s * sx }], 6, { n: 2.4 }), ...two('#A5ACC0', 0.3)]));
    }
    const torso = mk('Torso', tp); pelvis.add(torso);

    /* ===== Tête : crâne facetté de Lyra, visage posé sur la face avant ===== */
    const skull = loft([{ y: 0.012, rx: 0.085, rz: 0.08 }, { y: 0.05, rx: 0.172, rz: 0.152 }, { y: 0.11, rx: 0.23, rz: 0.196 }, { y: 0.19, rx: 0.246, rz: 0.21 }, { y: 0.28, rx: 0.24, rz: 0.208 }, { y: 0.36, rx: 0.2, rz: 0.176 }, { y: 0.415, rx: 0.12, rz: 0.105 }], 8, { n: 3 });
    const probe = new THREE.Mesh(skull, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    const stick = (gm, x, y, off = 0.003, rz = 0) => stickOn(probe, gm, V(x, y, 1), V(0, 0, -1), off, rz);
    const e = S.eye, browC = S.barbe && S.coiffure === 'court' && S.chapeau ? P.barbe : P.hair, blush = mixHex(P.skin, '#E8707A', 0.42);
    const face = [[skull, darken(P.skin, 0.06), lighten(P.skin, 0.35)]];
    [-1, 1].forEach((s) => {
      face.push([stick(box(0.056, S.calme || S.barbe ? 0.016 : 0.011, 0.006), s * (EX + 0.004), EY + 0.028 + 0.06 * e, 0.004, s * S.brow), browC, browC]);
      face.push([stick(disc(0.031, 0.019, 6), s * 0.162, 0.118, 0.003), blush, blush]);
    });
    const head = mk('Head', face, { solid: [skull] }); torso.add(head);
    /* yeux (pièce à part : clignement) : cils, œil, iris clair, reflet en étoile */
    const eyes = [], eo = [0, -EY, -0.2], irisC = lighten(P.eye, 0.38);
    [-1, 1].forEach((s) => {
      eyes.push([stick(disc(0.052 * e, 0.062 * e, 10), s * EX, EY + 0.009 * e, 0.002), '#15121F', '#15121F'], [stick(disc(0.046 * e, 0.059 * e, 10), s * EX, EY, 0.004), P.eye, P.eye],
        [stick(disc(0.032 * e, 0.026 * e, 8), s * EX, EY - 0.028 * e, 0.006), irisC, irisC], [stick(star4(0.021 * e), s * EX - 0.011 * e, EY + 0.014 * e, 0.008), '#FFFFFF', '#FFFFFF'], [stick(disc(0.0075, 0.0075, 6), s * EX + 0.017 * e, EY - 0.024 * e, 0.008), '#FFFFFF', '#FFFFFF']);
    });
    eyes.forEach((p) => p[0].translate(...eo));
    head.add(mk('Eyes', eyes, { outline: false }));
    const mouth = stick(disc(0.024, 0.0075, 6), 0, MY, 0.004); mouth.translate(0, -MY, -0.19);
    head.add(mk('Mouth', [[mouth, '#8A3F42', '#8A3F42']], { outline: false }));

    /* ===== Cheveux, barbe, couvre-chef (une seule pièce, fixe sur la tête) ===== */
    const hp = [], C = S.coiffure;
    const capFull = [{ y: 0.07, rx: 0.2, rb: 0.2, rf: 0.1 }, { y: 0.13, rx: 0.25, rb: 0.225, rf: 0.14 }, { y: 0.2, rx: 0.262, rb: 0.232, rf: 0.15 }, { y: 0.29, rx: 0.257, rb: 0.23, rf: 0.165 }, { y: 0.37, rx: 0.218, rb: 0.2, rf: 0.185 }, { y: 0.43, rx: 0.135, rb: 0.125, rf: 0.115 }];
    const capShort = [{ y: 0.15, rx: 0.236, rb: 0.214, rf: 0.11 }, { y: 0.2, rx: 0.258, rb: 0.229, rf: 0.14 }, { y: 0.29, rx: 0.256, rb: 0.229, rf: 0.165 }, { y: 0.37, rx: 0.218, rb: 0.2, rf: 0.187 }, { y: 0.43, rx: 0.135, rb: 0.125, rf: 0.115 }];
    const fringe = (n0, n1, drop = 0) => { for (let i = n0; i <= n1; i++) { const x = i * 0.051, bottom = 0.29 - drop + (i % 2 ? 0.014 : -0.006) + Math.abs(i) * 0.005, top = 0.4 - Math.abs(i) * 0.01, hh = top - bottom;
      hp.push([T(slab([[-0.03, hh], [0.03, hh], [0.032, 0.014], [0.014, 0], [-0.014, 0], [-0.032, 0.014]], 0.03 + (i % 2 ? 0.008 : 0)), x, bottom, 0.2 - Math.max(0, Math.abs(x) - 0.09) * 0.45, -14, -i * 8, 0), ...hairC]); } };
    const locks = (y0) => [-1, 1].forEach((s) => hp.push([loft([{ y: y0, rx: 0.018, rz: 0.04, cx: s * 0.18, cz: 0.112 }, { y: y0 + 0.055, rx: 0.034, rz: 0.07, cx: s * 0.207, cz: 0.105 }, { y: 0.2, rx: 0.036, rz: 0.08, cx: s * 0.22, cz: 0.098 }, { y: 0.33, rx: 0.03, rz: 0.075, cx: s * 0.2, cz: 0.09 }], 6), ...hairC]));
    if (S.chapeau === 'casque') {   // casque de la garde : calotte d'acier, bandeau, nasal, cimier rouge
      const st = two('#A5ACC0', 0.3);
      hp.push([loft([{ y: 0.13, rx: 0.262, rb: 0.24, rf: 0.1 }, { y: 0.2, rx: 0.272, rb: 0.244, rf: 0.15 }, { y: 0.292, rx: 0.266, rb: 0.24, rf: 0.224 }, { y: 0.38, rx: 0.226, rb: 0.208, rf: 0.2 }, { y: 0.44, rx: 0.135, rb: 0.125, rf: 0.12 }, { y: 0.458, rx: 0.04, rb: 0.04, rf: 0.04 }], 8, { n: 3 }), ...st],
        [loft([{ y: 0.286, rx: 0.274, rb: 0.248, rf: 0.232 }, { y: 0.322, rx: 0.266, rb: 0.242, rf: 0.228 }], 8, { n: 3 }), ...two(STEEL, 0.3)], [T(box(0.03, 0.12, 0.02), 0, 0.245, 0.222), ...two(STEEL, 0.3)],
        [yz(slab([[0.19, 0.4], [0.12, 0.5], [-0.04, 0.535], [-0.19, 0.49], [-0.25, 0.37], [-0.2, 0.35], [-0.1, 0.44], [0.06, 0.445]], 0.04)), '#C94D5A', '#E06A76']);
    } else {
      hp.push([loft(C === 'court' || C === 'epi' || C === 'chignon' ? capShort : capFull, 8, { n: 3 }), ...hairC]);
      if (S.chapeau === 'paille') {   // grand chapeau de paille : bord large légèrement tombant, ruban brun
        const straw = two('#D2B070', 0.22);
        hp.push([loft([{ y: 0.288, rx: 0.37, rz: 0.36 }, { y: 0.3, rx: 0.372, rz: 0.362 }, { y: 0.33, rx: 0.25, rz: 0.228 }], 9, { n: 2.2 }), ...straw],
          [loft([{ y: 0.318, rx: 0.252, rz: 0.23 }, { y: 0.43, rx: 0.214, rz: 0.196 }, { y: 0.5, rx: 0.165, rz: 0.15 }, { y: 0.515, rx: 0.08, rz: 0.072 }], 9, { n: 2.4 }), ...straw],
          [loft([{ y: 0.326, rx: 0.257, rz: 0.235 }, { y: 0.372, rx: 0.242, rz: 0.221 }], 9, { n: 2.4 }), ...two('#8A5F3F')]);
      } else if (S.chapeau === 'bonnet') {   // bonnet de marin à revers
        hp.push([loft([{ y: 0.292, rx: 0.256, rb: 0.232, rf: 0.218 }, { y: 0.4, rx: 0.214, rb: 0.196, rf: 0.186 }, { y: 0.468, rx: 0.125, rb: 0.115, rf: 0.11 }, { y: 0.49, rx: 0.04, rb: 0.04, rf: 0.04 }], 8, { n: 2.8 }), ...acc],
          [loft([{ y: 0.268, rx: 0.268, rb: 0.243, rf: 0.224 }, { y: 0.318, rx: 0.262, rb: 0.238, rf: 0.226 }], 8, { n: 2.8 }), ...two(lighten(P.accent, 0.25))]);
      } else if (C === 'court') fringe(-2, 2, -0.03);
      else if (C === 'epi') { fringe(-3, 3, -0.01); [[0.02, 0.4, -0.02, -18, 12], [-0.05, 0.41, -0.06, -30, -16], [0.07, 0.4, -0.09, -40, 24]].forEach(([x, y, z, rx, rz]) => hp.push([T(prism(0.004, 0.04, 0.13, 4), x, y + 0.04, z, rx, 0, rz), ...hairC])); }
      else if (C === 'chignon') { fringe(-3, 3, 0.02);
        hp.push([loft([{ y: 0.335, rx: 0.06, rz: 0.06, cz: -0.15 }, { y: 0.37, rx: 0.105, rz: 0.1, cz: -0.155 }, { y: 0.44, rx: 0.112, rz: 0.105, cz: -0.16 }, { y: 0.5, rx: 0.07, rz: 0.066, cz: -0.16 }, { y: 0.515, rx: 0.02, rz: 0.02, cz: -0.16 }], 6, { n: 2.4 }), ...hairC],
          [loft([{ y: 0.352, rx: 0.098, rz: 0.094, cz: -0.152 }, { y: 0.376, rx: 0.116, rz: 0.11, cz: -0.155 }], 6, { n: 2.4 }), ...trim]); }
      else if (C === 'carre') { fringe(-3, 3); locks(0.03); }
      else if (C === 'long' || C === 'tresse') { fringe(-3, 3, C === 'long' ? 0.02 : 0); locks(0.07); }
      else if (C === 'boucles') { fringe(-3, 3, 0.01);
        for (let i = 0; i < 9; i++) { const a = PI * 0.5 + ((i - 4) / 4) * PI * 0.62, up = i % 2 ? 0.17 : 0.11; hp.push([T(gem(1), -cos(a) * 0.245, up, -sin(a) * 0.215 + 0.02, 0, i * 40, 0, 0.07, 0.075, 0.07), ...hairC]); }
        [[0.09, 0.43, 0.02], [-0.1, 0.42, -0.03], [0, 0.445, -0.09], [0.13, 0.39, -0.11], [-0.14, 0.38, 0.09]].forEach(([x, y, z], i) => hp.push([T(gem(1), x, y, z, 0, i * 50, 0, 0.075, 0.06, 0.075), ...hairC])); }
    }
    if (S.barbe) {   // barbe en coin sous la bouche, favoris
      const bc = [P.barbe, lighten(P.barbe, 0.2)];
      hp.push([loft([{ y: 0.022, rx: 0.06, rf: 0.07, rb: 0.0, cz: 0.07 }, { y: 0.05, rx: 0.17, rf: 0.125, rb: 0.03, cz: 0.055 }, { y: 0.088, rx: 0.243, rf: 0.158, rb: 0.05, cz: 0.045 }], 8, { n: 2.6 }), ...bc]);
      [-1, 1].forEach((s) => hp.push([loft([{ y: 0.08, rx: 0.026, rz: 0.06, cx: s * 0.226, cz: 0.05 }, { y: 0.17, rx: 0.022, rz: 0.045, cx: s * 0.238, cz: 0.045 }], 6), ...bc], [stick(box(0.05, 0.016, 0.01), s * 0.03, MY + 0.02, 0.006, s * -14), ...bc]));
    }
    if (S.lunettes) { [-1, 1].forEach((s) => hp.push([tor(0.06, 0.008, s * EX, EY, 0.222), ...two(P.trim, 0.3)])); hp.push([T(box(0.085, 0.01, 0.01), 0, EY + 0.012, 0.222), ...two(P.trim, 0.3)]); }
    head.add(mk('Hair', hp));
    if (hasTail) {
      const tl = [];
      if (C === 'long') tl.push([loft([{ y: -0.4, rx: 0.026, rz: 0.02 }, { y: -0.3, rx: 0.07, rz: 0.04 }, { y: -0.1, rx: 0.086, rz: 0.046 }, { y: 0.012, rx: 0.06, rz: 0.04 }], 6, { n: 2.4 }), ...hairC], [loft([{ y: -0.045, rx: 0.08, rz: 0.05 }, { y: -0.015, rx: 0.076, rz: 0.05 }], 6, { n: 2.4 }), ...trim]);
      else { for (let i = 0; i < 4; i++) tl.push([T(gem(1), 0, -0.03 - i * 0.082, 0, 0, i * 45, 0, 0.056 - i * 0.004, 0.058, 0.046 - i * 0.003), ...hairC]); tl.push([T(prism(0.036, 0.03, 0.03, 6), 0, -0.335, 0), ...trim], [T(prism(0.03, 0.008, 0.07, 6), 0, -0.385, 0), ...hairC]); }
      head.add(mk('Tail', tl));
    }
    if (S.cape) {   // cape courte : elle s'arrête aux hanches, charnière en haut du dos
      const cl = 0.285 * ty, cc = two(P.cape);
      torso.add(mk('Cape', [[T(slab([[-0.15 * g, 0], [0.15 * g, 0], [0.2 * g, -cl], [0.1 * g, -cl - 0.03], [0, -cl - 0.055], [-0.1 * g, -cl - 0.03], [-0.2 * g, -cl]], 0.024), 0, 0, -0.012), ...cc], [T(box(0.3 * g, 0.036, 0.03), 0, -0.012, -0.012), ...trim]]));
    }

    /* ===== Bras ===== */
    const sleeve = S.manches === 'nues' ? skin : S.manches === 'armure' ? pant : haut, cuff = S.manches === 'nues' ? two(P.accent, 0.12) : S.manches === 'armure' ? two('#A5ACC0', 0.3) : trim, aU = S.armU, aLo = S.armL;
    const armUpper = () => { const o = [[loft([{ y: -aU - 0.005, rx: 0.066 * ar, rz: 0.063 * ar }, { y: -aU * 0.47, rx: 0.064 * ar, rz: 0.061 * ar }, { y: 0.012, rx: 0.072 * ar, rz: 0.068 * ar }], 6), ...sleeve]];
      if (S.manches === 'nues') o.push([loft([{ y: -aU * 0.42, rx: 0.07 * ar, rz: 0.067 * ar }, { y: 0.016, rx: 0.076 * ar, rz: 0.072 * ar }], 6), ...haut]); return o; };
    const armLower = () => [[loft([{ y: -(aLo - 0.058), rx: 0.07 * ar, rz: 0.066 * ar }, { y: 0.01, rx: 0.064 * ar, rz: 0.061 * ar }], 6), ...sleeve], [loft([{ y: -(aLo - 0.038), rx: 0.075 * ar, rz: 0.071 * ar }, { y: -(aLo - 0.07), rx: 0.077 * ar, rz: 0.073 * ar }], 6), ...cuff],
      [T(prism(0.036 * ar, 0.033 * ar, 0.05, 6), 0, -(aLo - 0.018), 0), ...skin]];
    const hand = () => [[loft([{ y: -0.104, rx: 0.036 * ar, rz: 0.04 * ar }, { y: -0.06, rx: 0.048 * ar, rz: 0.05 * ar }, { y: -0.012, rx: 0.04 * ar, rz: 0.038 * ar }], 6, { n: 3 }), ...skin]];
    ['L', 'R'].forEach((n) => { const up = mk('Arm' + n + '_Upper', armUpper()), lo = mk('Arm' + n + '_Lower', armLower()), h = mk('Hand' + n, hand()); torso.add(up); up.add(lo); lo.add(h); });
    const pg = propGeo(P), prop = mk('Prop', pg.pieces, { offset: pg.offset }); nodes['Hand' + HAND].add(prop);
    if (pg.glow) { pg.glow.forEach((p) => p[0].translate(-GLOW[0], -GLOW[1], -GLOW[2])); prop.add(mk('Prop_Glow', pg.glow, { mat: M.glow('Prop'), outline: false })); }

    /* ===== Jambes et pieds ===== */
    const boot = two(P.bottes, 0.14), sole = two(darken(P.bottes, 0.35), 0.1);
    const footG = (k) => [[T(loft([{ y: -0.085, rx: 0.07, rz: 0.05 }, { y: 0.0, rx: 0.08, rz: 0.058 }, { y: 0.105, rx: 0.082, rz: 0.052 }, { y: 0.168, rx: 0.06, rz: 0.036 }], 8, { n: 3 }), 0, -0.058 * k, 0, 90, 0, 0, 0.9, 1, k), ...boot], [T(box(0.146, 0.022 * k, 0.262), 0, -0.107 * k, 0.042), ...sole]];
    if (robe) ['L', 'R'].forEach((n) => pelvis.add(mk('Foot' + n, footG(0.75))));
    else {
      const lu = S.legU, ll = S.legL, lr = 0.7 + 0.3 * g, shin = S.short ? skin : boot;
      const legUpper = () => [[loft([{ y: -lu, rx: 0.068 * lr, rz: 0.066 * lr }, { y: 0.02, rx: 0.066 * lr, rz: 0.07 * lr }], 6), ...pant]];
      const legLower = () => S.short ? [[loft([{ y: -ll, rx: 0.06, rz: 0.062 }, { y: 0.01, rx: 0.064, rz: 0.064 }], 6), ...skin], [loft([{ y: -ll, rx: 0.07, rz: 0.074 }, { y: -ll + 0.05, rx: 0.07, rz: 0.074 }], 8), '#EFE8DA', '#FFFFFF']]
        : [[T(prism(0.066 * lr, 0.064 * lr, 0.05, 6), 0, -0.02, 0), ...pant], [loft([{ y: -ll, rx: 0.074, rz: 0.082 }, { y: -0.05, rx: 0.078 * lr, rz: 0.086 * lr }], 8), ...shin], [loft([{ y: -0.085, rx: 0.082 * lr, rz: 0.094 * lr }, { y: -0.028, rx: 0.085 * lr, rz: 0.1 * lr }], 8), ...(S.armure ? two('#A5ACC0', 0.3) : two(lighten(P.bottes, 0.18), 0.18))]];
      ['L', 'R'].forEach((n) => { const up = mk('Leg' + n + '_Upper', legUpper()), lo = mk('Leg' + n + '_Lower', legLower()), f = mk('Foot' + n, footG(1)); pelvis.add(up); up.add(lo); lo.add(f); });
    }
    return { root, nodes, materials: M };
  }

  /* ----- cinématique directe dans le repère de la racine (pour les correcteurs) ----- */
  const I4 = new THREE.Matrix4();
  function world(o) { const W = {}; const get = (j) => W[j] || (W[j] = j === 'Root' ? I4 : get(PARENT[j]).clone().multiply(jointMat(REST, j, o))); return get; }
  const _q = new THREE.Quaternion(), _qd = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _v = new THREE.Vector3();
  /* oriente la pièce j dans le repère de la racine : lacet « yaw », puis inclinaisons tx (avant) et tz (côté), en degrés */
  function keep(o, W, j, yaw, tx, tz) {
    W(PARENT[j]).decompose(_p, _q, _s);
    _qd.setFromEuler(_e.set(tx * D2R, yaw * D2R, tz * D2R, 'YXZ'));
    _e.setFromQuaternion(_q.invert().multiply(_qd), 'XYZ');
    const R = REST[j].r, c = o[j] || (o[j] = { p: [0, 0, 0], s: 1 });
    c.r = [_e.x / D2R - R[0], _e.y / D2R - R[1], _e.z / D2R - R[2]]; if (!c.p) c.p = [0, 0, 0];
  }
  const yawOf = (m) => { const e = m.elements; return Math.atan2(e[8], e[10]) / D2R; };
  const GROUND = [[-0.073, -SOLE, -0.089], [0.073, -SOLE, -0.089], [-0.073, -SOLE, 0.173], [0.073, -SOLE, 0.173]];
  const TILT = S.tilt || [0, 0];
  /* Correcteurs appliqués à chaque pose (aperçus, export, contrôles et jeu) :
     1. queue de cheval, tresse et cape pendent toujours à la verticale (elles ne suivent pas les hochements de tête ni le buste) ;
     2. l'objet tenu garde son orientation (perche droite, plateau à plat) quels que soient les gestes du bras ;
     3. le bassin est recalé pour que le pied le plus bas touche exactement le sol (Air : hauteur d'un petit saut). */
  function finish(o) {
    const W = world(o), x = (j) => (o[j] && o[j].r) || [0, 0, 0];
    if (hasTail) keep(o, W, 'Tail', yawOf(W('Head')), x('Tail_Sway')[0], x('Tail_Sway')[2]);
    if (S.cape) keep(o, W, 'Cape', yawOf(W('Torso')), 5 + x('Cape_Sway')[0], 0);
    if (S.tenue !== 'main') { const t = x('Prop_Tilt'); keep(o, W, 'Prop', yawOf(W('Torso')) + t[1], TILT[0] + t[0], TILT[1] + t[2]); }
    let m = 1e9;
    ['L', 'R'].forEach((n) => { const F = W('Foot' + n); GROUND.forEach((p) => { m = Math.min(m, _v.set(p[0], p[1], p[2]).applyMatrix4(F).y); }); });
    const pe = o.Pelvis || (o.Pelvis = { r: [0, 0, 0], p: [0, 0, 0], s: 1 }), pp = pe.p || [0, 0, 0], air = o.Air && o.Air.p ? o.Air.p[1] : 0;
    pe.p = [pp[0], pp[1] - m + air, pp[2]]; if (!pe.r) pe.r = [0, 0, 0];
    return o;
  }

  /* la pose de repos elle-même est corrigée une fois (objet orienté, tresse et cape à la verticale, pieds au sol) */
  { const o = finish({}); ['Tail', 'Cape', 'Prop'].forEach((j) => { if (o[j] && REST[j]) REST[j].r = REST[j].r.map((v, i) => +(v + o[j].r[i]).toFixed(3)); }); REST.Pelvis.p[1] = +(REST.Pelvis.p[1] + o.Pelvis.p[1]).toFixed(4);
    gripY = _v.set(...REST.Prop.p).applyMatrix4(world({})('Hand' + HAND)).y; }

  /* ----- animations (écarts par rapport au repos) ----- */
  const plus = (...ps) => { const o = {}; ps.forEach((p) => { for (const j in p) add(o, j, p[j]); }); return o; };
  /* pieds à plat : compense bassin + cuisse + genou */
  const feet = (o) => { if (robe) return o; ['L', 'R'].forEach((n) => { const u = o['Leg' + n + '_Upper'] || {}, l = o['Leg' + n + '_Lower'] || {}, pv = o.Pelvis || {};
    o['Foot' + n] = { r: [-((pv.r ? pv.r[0] : 0) + (u.r ? u.r[0] : 0) + (l.r ? l.r[0] : 0)), 0, -((u.r ? u.r[2] : 0) + (pv.r ? pv.r[2] : 0))], p: [0, 0, 0], s: 1 }; }); return o; };
  /* déhanchement, pieds plantés : a en degrés */
  const sway = (a) => robe ? { Pelvis: { p: [-0.012 * a, 0, 0], r: [0, 0, -0.5 * a] }, FootL: { p: [0.012 * a, 0, 0], r: [0, 0, 0.5 * a] }, FootR: { p: [0.012 * a, 0, 0], r: [0, 0, 0.5 * a] } }
    : { Pelvis: { p: [-LEG * sin(a * D2R), 0, 0] }, LegL_Upper: { r: [0, 0, a] }, LegR_Upper: { r: [0, 0, a] }, FootL: { r: [0, 0, -a] }, FootR: { r: [0, 0, -a] } };
  const bump = (t, t0, d) => { const k = (t - t0) / d; return k <= 0 || k >= 1 ? 0 : sin(PI * k) ** 2; };          // cloche 0 → 1 → 0
  const hold = (t, t0, t1, e = 0.35) => clamp01((t - t0) / e) * clamp01((t1 - t) / e), sm = (k) => k * k * (3 - 2 * k);   // palier 0 → 1 … 1 → 0
  const blink = (t, ...ts) => ({ Eyes: { s: [1, 1 - 0.93 * Math.max(...ts.map((b) => bump(t, b, 0.16))), 1] } });
  const AH = 'Arm' + HAND, AF = 'Arm' + FREE, k0 = S.calme ? 0.6 : S.raide ? 0.5 : S.vif ? 1.5 : 1;

  /* geste de métier, intégré à l'attente (aucun déclencheur dans le jeu) : k = 0 → 1 → 0 pendant le geste */
  function metier(t, D) {
    const k = sm(hold(t, D * 0.45, D * 0.85)), w = 2 * PI * t;
    switch (S.objet) {
      case 'baton_phare': return { [AH + '_Upper']: { r: [-14 * k, 0, 0] }, Head: { r: [-6 * k, hsn * 10 * k, 0] }, Prop_Glow: { s: 1 + 0.5 * k + 0.12 * sin(w * 1.5) } };                       // lève le bâton, l'éclat grandit
      case 'perche_lampion': return { [AH + '_Upper']: { r: [-26 * k, 0, hsn * 6 * k] }, [AH + '_Lower']: { r: [-12 * k, 0, 0] }, Head: { r: [-12 * k, hsn * 14 * k, 0] }, Torso: { r: [-3 * k, 0, 0] }, Prop_Glow: { s: 1 + 0.6 * k + 0.2 * sin(w * 3) } };   // tend la perche vers un lampion
      case 'lance': return { Head: { r: [0, 26 * sin(2 * PI * t / D) * (1 - k) - hsn * 18 * k, 0] }, [AH + '_Upper']: { r: [-5 * bump(t, D * 0.5, 0.5), 0, 0] }, Torso: { r: [-2 * k, 0, 0] } };       // surveille la lande, frappe le sol de la lance
      case 'rame': return { Head: { r: [-3 * k, -hsn * 30 * k, 0] }, Torso: { r: [0, -hsn * 8 * k, 0] }, [AH + '_Upper']: { r: [-6 * k, 0, 0] } };                                              // regarde le large
      case 'epuisette': return { Prop_Tilt: { r: [-10 * k + 6 * k * sin(w * 0.9), 26 * k * sin(w * 0.45), 0] }, [AH + '_Upper']: { r: [-12 * k, hsn * 10 * k * sin(w * 0.45), 0] }, Head: { r: [-12 * k, 0, 0] }, Prop_Glow: { s: 1 + 0.15 * sin(w * 1.2) } };   // balaie le ciel
      case 'pince': return { [AH + '_Upper']: { r: [-22 * k, 0, 0] }, [AH + '_Lower']: { r: [-16 * k, 0, 0] }, Prop_Tilt: { r: [-34 * k, 0, 20 * k * sin(w * 0.8)] }, Head: { r: [6 * k, hsn * 12 * k, 0] }, Prop_Glow: { s: 1 + 0.12 * sin(w * 2) } };            // examine le lingot rougi
      case 'epee_bois': return { [AH + '_Upper']: { r: [-22 * k - 20 * k * sin(w * 1.6), 0, hsn * 10 * k] }, Prop_Tilt: { r: [6 * k + 14 * k * sin(w * 1.6 - 0.6), 0, 0] }, Torso: { r: [0, hsn * 8 * k * sin(w * 1.6), 0] }, Air: { p: [0, 0.035 * k * Math.abs(sin(w * 1.6)), 0] } };   // joue au chevalier
      case 'fiole': return { [AH + '_Upper']: { r: [-34 * k, 0, 0] }, [AH + '_Lower']: { r: [-6 * k, 0, 0] }, Prop_Tilt: { r: [10 * k * sin(w * 2), 0, 12 * k * sin(w * 2 + 1.5)] }, Head: { r: [-4 * k, hsn * 16 * k, hsn * 4 * k] }, Prop_Glow: { s: 1 + 0.9 * k + 0.25 * sin(w * 2.5) } };   // agite la fiole et la regarde
      case 'ciseaux': return { [AH + '_Upper']: { r: [-18 * k, 0, 0] }, Prop_Tilt: { r: [0, 0, 16 * k * sin(w * 2.2)] }, ['Hand' + HAND]: { r: [0, 0, 8 * k * sin(w * 2.2)] }, Head: { r: [4 * k, hsn * 10 * k, 0] } };   // coupe dans le vide
      case 'livre': return { [AH + '_Upper']: { r: [-3 * k, 0, 0] }, Prop_Tilt: { r: [-14 * k, 0, 0] }, Head: { r: [8 * k, hsn * 6 * k, 0] }, Torso: { r: [2 * k, 0, 0] } };                     // relit une page
      case 'plateau': return { [AH + '_Upper']: { r: [-14 * k, 0, 0] }, [AH + '_Lower']: { r: [-8 * k, 0, 0] }, Head: { r: [0, 0, hsn * 6 * k] }, [AF + '_Upper']: { r: [-10 * k, 0, fsn * 14 * k] }, [AF + '_Lower']: { r: [-30 * k, 0, 0] } };   // présente le plateau
    }
    return {};
  }
  const IDLE_D = 8;
  const idle = (t) => { const w = 2 * PI * t / IDLE_D, b = 3 * w;   // respiration : 3 cycles par boucle
    return feet(plus({ Torso: { r: [0.9 * sin(b), 0, 0], p: [0, 0.003 * (1 - cos(b)), 0] }, Head: { r: [1.4 * sin(b + 1), 6 * k0 * sin(w), 0] },
      [AF + '_Upper']: { r: [1.5 * sin(b), 0, fsn * 1.4 * sin(b + 0.6)] }, [AF + '_Lower']: { r: [-2 * (1 - cos(b)), 0, 0] }, [AH + '_Upper']: { r: [1.2 * sin(b + 0.8), 0, 0] },
      Tail_Sway: { r: [2 * sin(b + 0.5), 0, 2 * sin(w)] }, Cape_Sway: { r: [1.5 * sin(b + 0.5), 0, 0] }, Prop_Glow: { s: 1 + 0.08 * sin(2 * b) } },
    sway(1.6 * k0 * sin(w)), blink(t, 1.1, 4.3, 4.62, 7.0), metier(t, IDLE_D))); };
  const TALK_D = 2.4;
  const talk = (t) => { const w = 2 * PI * t / TALK_D, a = S.raide ? 0.5 : S.calme ? 0.7 : S.vif ? 1.3 : 1, m = 0.5 + 0.5 * sin(2 * PI * t * 3.75);
    return feet(plus({ Torso: { r: [2.5 + 1.2 * sin(w), 2 * a * sin(w), 0], p: [0, 0.002, 0] }, Head: { r: [3 + 4 * a * sin(2 * w), 4 * a * sin(w + 0.5), 2 * a * sin(w)] },
      [AF + '_Upper']: { r: [-22 * a - 8 * a * sin(w), 0, fsn * (6 + 5 * a * sin(2 * w))] }, [AF + '_Lower']: { r: [-52 * a - 18 * a * sin(2 * w + 0.8), 0, 0] }, ['Hand' + FREE]: { r: [0, fsn * 16 * a * sin(2 * w), 0] },
      [AH + '_Upper']: { r: [-4 - 3 * sin(w), 0, 0] }, Mouth: { s: [1 - 0.25 * m, 1 + 3.2 * m, 1] }, Tail_Sway: { r: [2 * sin(w), 0, 0] }, Prop_Glow: { s: 1 + 0.1 * sin(2 * w) },
      Air: { p: [0, S.vif ? 0.02 * Math.abs(sin(w)) : 0, 0] } }, blink(t, 0.9))); };
  const WALK_D = 0.9;
  const walk = (t) => { const w = 2 * PI * t / WALK_D, sw = sin(w), cw = cos(w);
    if (robe) return plus({ Pelvis: { r: [1.5, -3 * sw, 1.2 * sw], p: [0, 0, 0] }, Torso: { r: [1.5, 4 * sw, -1 * sw] }, Head: { r: [-1.5, -1 * sw, 0] },
      FootL: { p: [0, 0.006 * Math.max(0, cw), 0.065 * sw], r: [-1.5, 0, -1.2 * sw] }, FootR: { p: [0, 0.006 * Math.max(0, -cw), -0.065 * sw], r: [-1.5, 0, -1.2 * sw] },
      [AF + '_Upper']: { r: [fsn * 12 * sw, 0, 0] }, [AF + '_Lower']: { r: [-8, 0, 0] }, [AH + '_Upper']: { r: [2 * sin(2 * w), 0, 0] }, Tail_Sway: { r: [-5 + 2 * sin(2 * w), 0, 0] }, Prop_Glow: { s: 1 + 0.1 * sin(2 * w) } });
    return feet({ Pelvis: { r: [3, -4 * sw, 1.5 * sw], p: [0, 0, 0] }, Torso: { r: [2, 6 * sw, -1.2 * sw] }, Head: { r: [-2.5, -2 * sw, 0] },
      LegL_Upper: { r: [-3 - 21 * sw, 0, 0] }, LegL_Lower: { r: [6 + 32 * Math.max(0, cw), 0, 0] }, LegR_Upper: { r: [-3 + 21 * sw, 0, 0] }, LegR_Lower: { r: [6 + 32 * Math.max(0, -cw), 0, 0] },
      [AF + '_Upper']: { r: [fsn * 16 * sw, 0, 0] }, [AF + '_Lower']: { r: [-10 - 6 * Math.abs(sw), 0, 0] }, [AH + '_Upper']: { r: [3 * sin(2 * w), 0, 0] },
      Tail_Sway: { r: [-6 + 2 * sin(2 * w), 0, 0] }, Cape_Sway: { r: [5 + 2 * sin(2 * w), 0, 0] }, Prop_Tilt: { r: [2 * sin(2 * w), 0, 0] } }); };
  const WAVE_D = 1.2;
  const wave = (t) => { const w = 2 * PI * t / WAVE_D;   // grand salut du bras libre, sur la pointe des pieds
    return feet(plus({ Torso: { r: [-2, 0, fsn * -3] }, Head: { r: [-6, 0, fsn * 5] }, [AF + '_Upper']: { r: [0, 0, fsn * (112 - S.out)] }, [AF + '_Lower']: { r: [14, 0, fsn * (34 + 16 * sin(2 * w))] }, ['Hand' + FREE]: { r: [0, 0, fsn * 10 * sin(2 * w + 0.6)] },
      Mouth: { s: [1.1, 3, 1] }, Air: { p: [0, 0.03 * Math.abs(sin(w)), 0] } }, blink(t, 0.5))); };
  const ANIMS = { IDLE: { dur: IDLE_D, loop: true, f: idle }, TALK: { dur: TALK_D, loop: true, f: talk } };
  const wanders = id === 'tobias' || id === 'mira';
  if (wanders) ANIMS.WALK = { dur: WALK_D, loop: true, f: walk };
  if (id === 'tobias') ANIMS.WAVE = { dur: WAVE_D, loop: true, f: wave };
  const LABELS = { IDLE: 'Attente et geste de métier', TALK: 'Parole', WALK: 'Marche', WAVE: 'Salut de la main' };

  return { id: 'villageois:' + id, file: 'PNJ_' + id, name: S.name, subtitle: S.role + ' · habitant de Havre-Aube (Île de l’Aube)', PALETTE: PAL, REST, JOINTS, build, ANIMS, LABELS, MOVES: {}, finish, fiche: S, ignore: [] };
}

const cache = {};
export const getModel = (id) => cache[id] || (cache[id] = makeModel(id));
/* accès par nom pour les outils (clip, export, planches) : models.selene, … */
export const models = new Proxy({}, { get: (_, id) => (FICHES[id] ? getModel(id) : undefined), has: (_, id) => !!FICHES[id], ownKeys: () => IDS, getOwnPropertyDescriptor: (_, id) => (FICHES[id] ? { enumerable: true, configurable: true, value: getModel(id) } : undefined) });
export const model = getModel('selene');

/* ---------- vue de jeu : même interface que Character pour un habitant ({ root, animate(dt, s) }) ----------
   État s (js/main.js) : move (0..1), talking (dialogue ouvert), talk (ancien signal clignotant, accepté), wave (salut). */
export function createView(id) {
  const m = getModel(id), st = { talk: 0, move: 0, wave: 0 };
  const view = creatureView(m, (s, a) => {
    const dt = Math.min(0.1, a.dt), to = (v, target, rate) => v + (target - v) * (1 - Math.exp(-rate * dt));
    st.talk = to(st.talk, s.talking || (s.talking === undefined && s.talk) ? 1 : 0, 7); st.move = to(st.move, s.move ? 1 : 0, 9); st.wave = to(st.wave, s.wave ? 1 : 0, 7);
    let pose = a.loop('IDLE');
    if (m.ANIMS.WALK && st.move > 0.01) pose = blend(pose, a.loop('WALK', 0.7 + 0.9 * (s.move || 0)), st.move);
    if (st.talk > 0.01) pose = blend(pose, a.loop('TALK'), st.talk);
    if (m.ANIMS.WAVE && st.wave > 0.01) pose = blend(pose, a.loop('WAVE'), st.wave * (1 - st.talk));
    return pose;
  }, { ground: false });   // le sol est déjà réglé par finish (pieds), sans reparcourir tous les sommets à chaque image
  view.villager = id; view.state = st; view.model = m;
  return view;
}
/* dans le jeu : couleurs en linéaire (comme les créatures v2) */
export function createVillager(id) { setLinear(true); return createView(id); }
export const isVillager = (id) => !!FICHES[id];
