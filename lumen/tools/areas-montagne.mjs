/* =========================================================
   LUMEN — Forêt de Verre : LA MONTAGNE (zones d'aventure à altitude + transformations de salles).
   Repère de chaque zone : x vers la droite (est), y vers le bas (sud). La montagne monte vers le NORD.
   Niveaux : 1 niveau = 0,75 u ; une marche (case voisine) = 1 niveau au plus ; falaise = 2 niveaux ou plus.
   ========================================================= */
import { grid, blob, rim, rect, disk, road, scatter, toRows, hash } from './areas.mjs';

export const CH = '0123456789abcdefghijklmnopqrstuvwxyz';
const lvChar = (v) => CH[Math.max(0, Math.min(35, v))];

/* ---------------------------------------------------------
   Transformations d'une zone entière (salles d'énigmes) : rotation de 90° vers la gauche (anti-horaire à l'écran), k fois.
   Le trajet de la lumière est conservé : une rotation est une symétrie du jeu (les miroirs « / » et « \ » s'échangent
   à chaque quart de tour, les directions tournent, le prisme garde sa gauche et sa droite). Les solutions sont recalculées.
   --------------------------------------------------------- */
const DIR_CCW = { E: 'N', N: 'W', W: 'S', S: 'E' };
export function rotateZone(z, k) {
  k = ((k % 4) + 4) % 4;
  let cur = z;
  for (let i = 0; i < k; i++) cur = rotOnce(cur);
  return cur;
}
function rotOnce(z) {
  const w = Math.max(...z.map.map((r) => r.length)), h = z.map.length;
  const P = ([x, y]) => [y, w - 1 - x];               // (x, y) -> (y, w-1-x) : l'est devient le nord
  const rows = [];
  for (let ny = 0; ny < w; ny++) { let r = ''; for (let nx = 0; nx < h; nx++) { const ox = w - 1 - ny, oy = nx; r += (z.map[oy][ox] === undefined ? ' ' : z.map[oy][ox]); } rows.push(r); }
  const o = Object.assign({}, z, { map: rows });
  const R = (x, y, ww = 1, hh = 1) => { const [a, b] = P([x, y]), [c, d] = P([x + ww - 1, y + hh - 1]); return { x: Math.min(a, c), y: Math.min(b, d), w: Math.abs(c - a) + 1, h: Math.abs(d - b) + 1 }; };
  if (z.ents) o.ents = z.ents.map((e) => { const n = Object.assign({}, e); const [x, y] = P([e.x, e.y]); n.x = x; n.y = y; if (n.dir) n.dir = DIR_CCW[n.dir]; if (n.out) n.out = DIR_CCW[n.out]; if (n.t === 'mirror' || n.t === 'splitter') n.state = 1 - (n.state || 0); return n; });
  ['entry', 'spawn'].forEach((k) => { if (z[k]) o[k] = P(z[k]); });
  if (z.exits) o.exits = z.exits.map(P);
  if (z.doors) o.doors = z.doors.map((d) => Object.assign({}, d, { cells: d.cells.map(P) }));
  ['chests', 'pickups', 'spawns'].forEach((k) => { if (z[k]) o[k] = z[k].map((c) => { const [x, y] = P([c.x, c.y]); return Object.assign({}, c, { x, y }); }); });
  if (z.npcs) o.npcs = z.npcs.map((c) => { const [x, y] = P([c.x, c.y]); return Object.assign({}, c, { x, y }); });
  if (z.props) o.props = z.props.map((p) => { const r = R(p.x, p.y, p.w || 1, p.h || 1); const n = Object.assign({}, p, { x: r.x, y: r.y }); if (p.w !== undefined) { n.w = r.w; n.h = r.h; } if (p.door) n.door = P(p.door); return n; });
  if (z.warp) { const [x, y] = P([z.warp.x, z.warp.y]); o.warp = Object.assign({}, z.warp, { x, y }); }
  if (z.combatRooms) o.combatRooms = z.combatRooms.map((c) => { const r = R(c.rect[0], c.rect[1], c.rect[2] - c.rect[0] + 1, c.rect[3] - c.rect[1] + 1); return Object.assign({}, c, { rect: [r.x, r.y, r.x + r.w - 1, r.y + r.h - 1] }); });
  return o;
}
export const sizeOf = (z) => [Math.max(...z.map.map((r) => r.length)), z.map.length];

/* ---------------------------------------------------------
   Vitrebourg : village au PIED de la montagne (niveaux 0 à 2), prolongé à l'est par le sentier des vitraux.
   Trois bandes de hauteur : haut du village (2), place (1), bas (0). Cases de hauteur par ligne.
   --------------------------------------------------------- */
export function vitrebourg() {
  const W = 48, H = 24, g = grid(W, H);
  const core = grid(30, H);
  blob(core, 14.5, 11.5, 16.2, 13.2, 41, 0.1);
  for (let y = 0; y < H; y++) for (let x = 0; x < 30; x++) g[y][x] = core[y][x];
  // pentes à l'est : le sentier des vitraux monte vers la première salle
  for (let y = 0; y <= 9; y++) for (let x = 30; x < W; x++) { const edge = x > 40 + Math.floor(hash(x, y, 77) * 4) + (y > 6 ? -3 : 0); if (!edge || y < 6) g[y][x] = '.'; }
  for (let y = 0; y <= 9; y++) for (let x = 30; x < 33; x++) g[y][x] = '.';
  rim(g, 42, 0.5);
  road(g, [[1, 5], [44, 5]]);          // grand-rue, puis sentier des vitraux vers l'est
  road(g, [[34, 6], [42, 6]]);         // sentier de 2 cases de large (la porte des vitraux y est posée)
  road(g, [[44, 0], [44, 5]]);
  road(g, [[36, 0], [38, 0]]); road(g, [[37, 0], [37, 5]]);   // arrivée de l’escalier de la Cascade (raccourci)         // il tourne vers le nord : la salle du premier vitrail
  road(g, [[15, 0], [15, 23]]);        // sentier du nord (la Lisière, par la porte) et du sud
  road(g, [[16, 0], [16, 4]]);
  disk(g, 15, 12, 3.4, ',');
  road(g, [[5, 4], [5, 5]]); road(g, [[24, 4], [24, 5]]);
  road(g, [[9, 9], [9, 5]]); road(g, [[9, 9], [12, 9]]);
  road(g, [[19, 10], [19, 9], [26, 9]]); road(g, [[18, 14], [24, 14]]);
  road(g, [[6, 15], [12, 15]]);
  const props = [];
  const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h }, extra)); };
  house('auberge_f', 2, 1, 7, 3, { style: 'auberge', door: [5, 4], side: 'S', interior: 'auberge_f', name: 'Auberge de la Rosée', sign: 'lampion' });
  house('ambre_h', 21, 1, 6, 3, { style: 'phare', door: [24, 4], side: 'S', name: 'Maison d’Ambre', closed: 'Ambre reçoit sur la place. Sa porte est fermée.' });
  house('forge_f', 2, 8, 5, 3, { style: 'forge', door: [7, 9], side: 'E', name: 'Verrerie de Silex' });
  house('perle_h', 2, 16, 5, 3, { style: 'bois', door: [4, 15], side: 'N', name: 'Maison de Perle', closed: 'La porte est fermée. On entend le souffle d’un four à verre.' });
  house('ficus_h', 19, 19, 6, 3, { style: 'pierre', door: [21, 18], side: 'N', name: 'Maison de Ficus', closed: 'Ficus cultive ses plantes dehors. Sa porte est fermée.' });
  rect(g, 14, 11, 3, 3, 'H'); props.push({ t: 'fountain', id: 'fontaine_f', x: 14, y: 11, w: 3, h: 3, warp: 'vitrebourg', name: 'Cristal de voyage' });
  const stall = (id, x, y, color, name) => { rect(g, x, y, 2, 1, 'H'); props.push({ t: 'stall', id, x, y, w: 2, h: 1, color, name }); };
  stall('etal_opaline', 18, 7, '#5fc9b8', 'Opaline, apothicaire');
  stall('etal_galet', 23, 7, '#e8b65a', 'Marché du verre');
  rect(g, 8, 10, 1, 1, 'H'); props.push({ t: 'anvil', id: 'enclume_f', x: 8, y: 10, w: 1, h: 1 });
  disk(g, 9.5, 19.5, 1.9, '~'); disk(g, 11, 20, 1.2, '~');
  const deco = (t, x, y, extra) => { g[y][x] = 'H'; props.push(Object.assign({ t, x, y, w: 1, h: 1 }, extra)); };
  [[12, 6, 1], [18, 4, 2], [10, 4, 3], [26, 6, 4], [13, 16, 5], [17, 16, 6], [16, 21, 7]].forEach(([x, y, n]) => deco('lamp', x, y, { id: 'lampion_f' + n }));
  deco('crate', 25, 12); deco('barrel', 20, 13); deco('barrel', 6, 11); deco('crate', 7, 12);
  deco('bench', 12, 14); deco('bench', 18, 10); deco('well', 27, 15, { id: 'puits_f' });
  deco('sign', 14, 1, { text: 'Au nord : la porte de la Lisière du Verre, puis le Temple. Les cerfs de verre n’aiment pas les visiteurs. Le village est au pied de la montagne : tout ce qui brille là-haut, c’est le Phare.' });
  deco('sign', 30, 4, { text: 'À l’est, le sentier monte vers les salles de vitraux, accrochées au flanc de la montagne. Rouge + vert = jaune, dit-on ici.' });
  scatter(g, 'T', 0.05, 43, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  // portes (cases 'x' ; remises à la bonne place par le script de construction)
  g[0][15] = 'x'; g[0][16] = 'x';        // porte de la Lisière
  g[5][30] = 'x'; g[4][30] = 'H'; g[6][30] = 'T';        // porte des vitraux : seul goulot entre le village et le sentier des vitraux
  // hauteurs : haut du village 2, place 1, bas 0 ; la montée vers la salle des vitraux : 2 puis 3 au tournant
  const hm = [];
  for (let y = 0; y < H; y++) { let row = ''; for (let x = 0; x < W; x++) { let l = y < 7 ? 2 : y < 14 ? 1 : 0; if (x >= 30 && y >= 7) l = 1; if (x === 44 && y <= 1) l = 3; row += g[y][x] === ' ' ? ' ' : lvChar(l); } hm.push(row); }
  return {
    id: 'vitrebourg', region: 'bourg', title: 'Vitrebourg', theme: 'foret', area: true, map: toRows(g), hmap: hm,
    spawn: [12, 7], entry: [12, 7],
    doors: [
      { gate: 'b_lisiere', look: 'barrier', cells: [[15, 0], [16, 0]] },
      { gate: 'b_vitres', look: 'barrier', cells: [[30, 5]] },
    ],
    ents: [{ t: 'start', x: 12, y: 7 }],
    props,
    npcs: [
      { id: 'ambre', x: 12.6, y: 9.4, face: 'S' },
      { id: 'opaline', x: 18.5, y: 6.1, face: 'S', counter: true },
      { id: 'galet', x: 23.5, y: 6.1, face: 'S', counter: true },
      { id: 'silex', x: 9.2, y: 11, face: 'S' },
      { id: 'perle', x: 9, y: 16.6, wander: 2.4 },
      { id: 'ficus', x: 17.6, y: 15.6, wander: 1.6 },
      { id: 'tessel', x: 25.2, y: 10.6, face: 'W' },
    ],
    pickups: [],
  };
}

/* ---------------------------------------------------------
   La Lisière du Verre : premières pentes (niveaux 2 à 8), en quatre terrasses séparées par des falaises ;
   on passe d'une terrasse à l'autre par des escaliers (là où passe le sentier). Plan retourné (le village est au sud).
   --------------------------------------------------------- */
export function lisiere() {
  const W = 34, H = 28, g = grid(W, H);
  const Y = (y) => H - 1 - y;
  blob(g, 16, Y(7.5), 15.5, 7.6, 51, 0.2);
  blob(g, 17, Y(20), 16, 8, 52, 0.2);
  blob(g, 16, Y(13.5), 6, 4, 53, 0.1);
  rect(g, 0, 0, 6, 3, '.');                       // coin nord-ouest : départ du sentier du Portique
  rim(g, 54, 0.45);
  scatter(g, '#', 0.03, 55); scatter(g, 'T', 0.07, 56);
  const R = [[15, 0], [15, 4], [10, 4], [10, 9], [16, 9], [16, 18], [22, 18], [22, 22], [17, 22], [17, 27]].map(([x, y]) => [x, Y(y)]);
  road(g, R);
  road(g, [[17, 1], [3, 1], [3, 0]]);               // vers le sentier du Portique (nord-ouest)
  road(g, [[10, Y(6)], [5, Y(6)], [5, Y(10)]]);
  // haie de ronces cristallines : il faut une lame
  const HR = Y(13);
  for (let x = 0; x < W; x++) if (g[HR][x] !== ' ' && g[HR][x] !== 'T' && g[HR - 1][x] !== ' ' && g[HR + 1][x] !== ' ') g[HR][x] = 'r';
  for (let x = 0; x < W; x++) if (g[HR][x] === 'r' && (g[HR - 1][x] === ' ' || g[HR + 1][x] === ' ')) g[HR][x] = '#';
  [[24, 6], [25, 6], [26, 7], [8, 19], [9, 19], [27, 21]].forEach(([x, y]) => { if (g[Y(y)][x] !== ' ') g[Y(y)][x] = 'r'; });
  // cachette (roches fissurées)
  rect(g, 3, Y(23), 4, 4, '#'); rect(g, 4, Y(22), 2, 2, '.'); g[Y(20)][5] = 'c'; g[Y(22)][6] = 'c';
  // recoin gardé
  rect(g, 27, Y(18), 4, 4, '#'); rect(g, 28, Y(17), 2, 2, '.'); g[Y(17)][27] = '.'; g[Y(17)][26] = '.';
  // sortie sud (porte du village) et dégagements
  g[H - 1][15] = ','; g[H - 2][15] = ','; g[H - 1][16] = ','; g[H - 2][16] = ',';
  const keep = [[4, 21], [29, 17], [25, 3], [4, 8], [27, 8], [9, 23], [30, 23], [9, 6], [20, 5], [22, 10], [27, 4], [12, 17], [21, 21], [8, 16], [28, 22], [12, 22], [17, 24]].map(([x, y]) => [x, Y(y)]);
  keep.forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ') g[y][x] = '.'; });
  // hauteurs : bandes (sud -> nord) 2, 4, 6, 8 ; escaliers aux croisements du sentier
  const bandOf = (y) => (y >= 21 ? 2 : y >= 15 ? 4 : y >= 8 ? 6 : 8);
  const lv = Array.from({ length: H }, (_, y) => Array(W).fill(bandOf(y)));
  [[20, 3, 10], [20, 3, 5], [14, 5, 16], [7, 7, 22]].forEach(([row, level, col]) => {   // escaliers : ligne basse de la bande haute, niveau intermédiaire
    [col, col + 1].forEach((xx) => { if (g[row][xx] !== ' ' && g[row][xx] !== '#') { lv[row][xx] = level; if (g[row][xx] === 'T') g[row][xx] = '.'; } });
  });
  const hm = lv.map((r, y) => r.map((v, x) => (g[y][x] === ' ' ? ' ' : lvChar(v))).join(''));
  const F = (x, y) => [x, Y(y)];
  return {
    id: 'lisiere', region: 'lisiere', title: 'La Lisière du Verre', theme: 'foret', area: true, map: toRows(g), hmap: hm,
    spawn: [15, H - 2], entry: [15, H - 1],
    props: [
      { t: 'sign', x: 13, y: Y(2), w: 1, h: 1, text: 'Lisière du Verre : les premières pentes. Les ronces cristallines ne cèdent qu’à une vraie lame. Plus haut, le sentier longe le Temple.' },
    ],
    chests: [
      { id: 'ch_lis_coeur', x: 4, y: Y(21), item: 'fragment_coeur', n: 1 },
      { id: 'ch_lis_bague', x: 29, y: Y(17), item: 'anneau_prisme', n: 1 },
      { id: 'ch_lis_ecus', x: 25, y: Y(3), ecus: 80 },
    ],
    pickups: [
      { t: 'item', id: 'givre1', item: 'givre_foret', x: 4, y: Y(8) },
      { t: 'item', id: 'givre2', item: 'givre_foret', x: 27, y: Y(8) },
      { t: 'item', id: 'givre3', item: 'givre_foret', x: 9, y: Y(23) },
      { t: 'item', id: 'givre4', item: 'givre_foret', x: 30, y: Y(23) },
    ],
    spawns: [
      { type: 'eclat', x: 9, y: Y(6), n: 2 },
      { type: 'eclat', x: 20, y: Y(5), n: 2 },
      { type: 'eclat', x: 22, y: Y(10), n: 1 },
      { type: 'lierre', x: 27, y: Y(4), n: 1 },
      { type: 'ronceux', x: 12, y: Y(17), n: 1 },
      { type: 'cerf', x: 21, y: Y(21), n: 1 },
      { type: 'cerf', x: 8, y: Y(16), n: 1 },
      { type: 'lierre', x: 28, y: Y(22), n: 1 },
      { type: 'eclat', x: 12, y: Y(22), n: 2 },
      { type: 'sentinelle', x: 17, y: Y(24), n: 1, elite: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le Sentier du Portique : il longe le flanc ouest du Temple (niveaux 8 à 10) puis contourne l'édifice par le nord.
   Zone en équerre (colonne ouest + bande nord) : les cases libres sont dans le rectangle du Temple, restées vides.
   --------------------------------------------------------- */
export function sentierTemple() {
  const W = 22, H = 31, g = grid(W, H);
  rect(g, 0, 2, 6, 29, '.');
  rect(g, 0, 0, 22, 2, '.');
  rim(g, 61, 0.5);
  road(g, [[2, 30], [2, 1], [21, 1]]);
  road(g, [[3, 30], [3, 3]]);
  // un petit belvédère de verre sur le flanc, avec un cristal-lampion
  [[1, 12], [4, 18], [1, 24], [4, 6]].forEach(([x, y]) => { if (g[y][x] === '.') g[y][x] = 'T'; });
  const props = [
    { t: 'ruin', x: 21, y: 0, w: 1, h: 1, name: 'Portique du Temple' },
    { t: 'sign', x: 4, y: 28, w: 1, h: 1, text: 'Sentier du Portique. Le Temple de Verre se dresse à ta droite, sur sa terrasse. Son entrée est au nord : le sentier le contourne.' },
  ];
  g[0][21] = 'H';
  g[1][21] = 'x';
  const hm = [];
  for (let y = 0; y < H; y++) { let row = ''; for (let x = 0; x < W; x++) { const l = y <= 1 ? 10 : 8 + Math.round((30 - y) * 2 / 28); row += g[y][x] === ' ' ? ' ' : lvChar(l); } hm.push(row); }
  return {
    id: 'sentier_t', region: 'portique', title: 'Le Sentier du Portique', theme: 'foret', area: true, map: toRows(g), hmap: hm,
    spawn: [2, 29], entry: [2, 30],
    doors: [{ gate: 'b_temple', look: 'seal', cells: [[21, 1]] }],
    props, pickups: [], npcs: [],
  };
}

/* ---------------------------------------------------------
   Le Belvédère de Verre : terrasse haute du flanc des vitraux (niveau 6). Entrée au sud (salle du 3e vitrail), porte du
   Grappin au nord (vers la Canopée), passage de la cascade à l'ouest (raccourci vers le village).
   --------------------------------------------------------- */
export function belvedere() {
  const g = grid(11, 11);
  rect(g, 0, 0, 11, 11, '.');
  for (let i = 0; i < 11; i++) { g[0][i] = '#'; g[10][i] = '#'; g[i][10] = '#'; g[i][0] = '#'; }
  g[10][5] = '.'; g[5][0] = '.'; g[0][8] = 'x';
  [[2, 2], [8, 2], [2, 8], [8, 8]].forEach(([x, y]) => (g[y][x] = 'T'));
  return {
    id: 'belv', region: 'belvedere', title: 'Le Belvédère de Verre', theme: 'canopee', music: 'canopee', area: true, map: toRows(g), h: 6,
    spawn: [5, 8], entry: [5, 10],
    doors: [{ gate: 'b_canopee', look: 'barrier', cells: [[8, 0]] }],
    props: [{ t: 'sign', x: 5, y: 4, w: 1, h: 1, text: 'Le Belvédère. Tout le flanc de la montagne s’étend sous tes pieds. Le Phare de Verre brille tout là-haut, au nord. À l’ouest, l’escalier de la cascade redescend jusqu’au village. Au nord, la porte de la Canopée attend celui qui saura grimper.' }],
    chests: [{ id: 'ch_belv', x: 5, y: 6, item: 'grande_potion', n: 2 }],
    pickups: [{ t: 'item', id: 'belv_eclat', item: 'eclat_verre', x: 7, y: 6 }],
    warp: { id: 'belvedere', x: 3, y: 5, name: 'Cristal du Belvédère' },
  };
}

/* ---------------------------------------------------------
   L'escalier de la Cascade : raccourci qui s'ouvre VERS LE BAS (niveau 6 au Belvédère, 2 au village).
   Une porte en bas ne s'ouvre qu'une fois le troisième vitrail résolu.
   --------------------------------------------------------- */
export function cascade() {
  const W = 3, H = 39, g = grid(W, H);
  rect(g, 0, 0, 3, H, '.');
  for (let y = 0; y < H; y++) { g[y][0] = y > 1 && y < H - 2 ? '~' : '#'; }
  for (let y = 0; y < H; y++) if (g[y][2] === '.' && hash(2, y, 91) < 0.18 && y > 3 && y < H - 4) g[y][2] = 'T';
  for (let y = 0; y < H; y++) { if (g[y][1] === '.') g[y][1] = ','; }
  g[0][1] = ','; g[0][2] = ',';          // à hauteur du Belvédère
  g[H - 2][1] = 'x'; g[H - 2][2] = 'x';  // porte du bas (gate rac_cime)
  g[H - 1][0] = ','; g[H - 1][1] = ','; g[H - 1][2] = ',';
  g[H - 2][0] = '#';
  const hm = [];
  for (let y = 0; y < H; y++) { const l = 6 - Math.round(y * 4 / (H - 1)); hm.push(Array.from({ length: W }, () => lvChar(l)).join('')); }
  return {
    id: 'cascade', region: 'cascade', title: 'L’escalier de la Cascade', theme: 'canopee', area: true, map: toRows(g), hmap: hm,
    spawn: [1, 1], entry: [1, 0],
    doors: [{ gate: 'rac_cime', look: 'barrier', cells: [[1, H - 2], [2, H - 2]] }],
    props: [{ t: 'sign', x: 2, y: 3, w: 1, h: 1, text: 'L’escalier de la Cascade. Un raccourci qui ne s’ouvre que vers le bas : le village est tout en bas, au pied de la montagne.' }],
    pickups: [], npcs: [],
  };
}

/* ---------------------------------------------------------
   La Corniche (connecteur de la Canopée) : après le pont des Feuilles, une rampe en lacet monte vers la passerelle.
   x 0..4, y 0..28 ; niveau 8 (bas) à 11 (haut).
   --------------------------------------------------------- */
export function corniche() {
  const W = 5, H = 29, g = grid(W, H);
  rect(g, 0, 0, 5, H, '.');
  for (let y = 0; y < H; y++) { g[y][4] = '#'; }
  for (let x = 0; x < 5; x++) { g[0][x] = '#'; }
  g[0][0] = '.';
  road(g, [[0, 27], [2, 27], [2, 7], [0, 7]], ',', 1);
  [[3, 20], [3, 12], [1, 17], [1, 11]].forEach(([x, y]) => { if (g[y][x] === '.') g[y][x] = 'T'; });
  const hm = [];
  for (let y = 0; y < H; y++) { const l = y >= 27 ? 8 : 8 + Math.round((27 - y) * 3 / 20); hm.push(Array.from({ length: W }, () => lvChar(Math.min(11, l))).join('')); }
  return {
    id: 'cime_c', region: 'canopee', title: 'La Corniche', theme: 'canopee', music: 'canopee', area: true, map: toRows(g), hmap: hm,
    spawn: [0, 27], entry: [0, 27],
    props: [{ t: 'sign', x: 1, y: 25, w: 1, h: 1, text: 'La Corniche. La rampe monte en lacet jusqu’à la Passerelle des Sentinelles. Plus haut encore, le Phare.' }],
    pickups: [], npcs: [],
  };
}
