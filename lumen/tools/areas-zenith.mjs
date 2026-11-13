/* =========================================================
   LUMEN — zones de la Citadelle du Zénith (île 6) : la Porte (village),
   les salles des portails, les Jardins célestes, la Grande Salle (donjon)
   et le Phare du Zénith (énigme finale : six couleurs, six faisceaux).
   Mêmes conventions que tools/areas-foret.mjs.
   ========================================================= */
import { grid, blob, rim, rect, disk, road, scatter, toRows } from './areas.mjs';

/* ---------------------------------------------------------
   La Porte du Zénith : le camp des voyageurs, au pied de la citadelle
   --------------------------------------------------------- */
export function porte() {
  const W = 30, H = 24, g = grid(W, H);
  blob(g, 14.5, 11.5, 16.2, 13.2, 61, 0.1);
  rim(g, 62, 0.2);
  road(g, [[1, 5], [29, 5]]);          // grand-rue vers les salles des portails (est)
  road(g, [[15, 5], [15, 22]]);
  disk(g, 15, 12, 3.4, ',');
  road(g, [[5, 4], [5, 5]]); road(g, [[24, 4], [24, 5]]);
  road(g, [[9, 9], [9, 5]]); road(g, [[9, 9], [12, 9]]);
  road(g, [[19, 10], [19, 9], [26, 9]]); road(g, [[18, 14], [24, 14]]);
  road(g, [[6, 15], [12, 15]]);
  const props = [];
  const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h }, extra)); };
  house('auberge_z', 2, 1, 7, 3, { style: 'marbre', door: [5, 4], side: 'S', interior: 'auberge_z', name: 'Auberge de l’Aurore', sign: 'lampion' });
  house('tour_c', 21, 1, 6, 3, { style: 'marbre', door: [24, 4], side: 'S', name: 'Tour de Célestine', closed: 'Célestine reçoit sur la place, sous les lampions. Sa porte reste fermée.' });
  house('forge_z', 2, 8, 5, 3, { style: 'forge', door: [7, 9], side: 'E', name: 'Forge du Zénith', closed: 'La forge est froide depuis que Bran travaille dehors, près de l’enclume.' });
  house('archives_z', 2, 16, 5, 3, { style: 'marbre', door: [4, 15], side: 'N', name: 'Archives de la Porte', closed: 'Les archives sont fermées : tout ce qu’elles contenaient est en route vers la Grande Salle.' });
  house('serre_z', 19, 19, 6, 3, { style: 'marbre', door: [21, 18], side: 'N', name: 'Serre de Vesper', closed: 'La serre est fermée. Vesper travaille dans les Jardins, plus à l’est.' });
  rect(g, 14, 11, 3, 3, 'H'); props.push({ t: 'fountain', id: 'fontaine_z', x: 14, y: 11, w: 3, h: 3, warp: 'porte', name: 'Cristal de voyage' });
  const stall = (id, x, y, color, name) => { rect(g, x, y, 2, 1, 'H'); props.push({ t: 'stall', id, x, y, w: 2, h: 1, color, name }); };
  stall('etal_ysolde_z', 18, 7, '#f0c66b', 'Ysolde, apothicaire');
  stall('etal_gaspard_z', 23, 7, '#e9e2f5', 'Comptoir de Gaspard');
  rect(g, 8, 10, 1, 1, 'H'); props.push({ t: 'anvil', id: 'enclume_z', x: 8, y: 10, w: 1, h: 1 });
  const deco = (t, x, y, extra) => { g[y][x] = 'H'; props.push(Object.assign({ t, x, y, w: 1, h: 1 }, extra)); };
  [[12, 6, 1], [18, 4, 2], [10, 4, 3], [26, 6, 4], [13, 16, 5], [17, 16, 6], [16, 21, 7]].forEach(([x, y, n]) => deco('lamp', x, y, { id: 'lampion_z' + n }));
  deco('crate', 25, 12); deco('barrel', 20, 13); deco('barrel', 6, 11); deco('crate', 7, 12);
  deco('bench', 12, 14); deco('bench', 18, 10); deco('brazier', 11, 12); deco('brazier', 19, 12);
  deco('sign', 16, 22, { text: 'La Porte du Zénith. Au-dessus des nuages, la Brume ronge déjà le bas des remparts : ne t’en approche pas sans lumière.' });
  deco('sign', 27, 4, { text: 'À l’est : les salles des portails, puis les Jardins célestes et la Grande Salle. Au bout de tout, le phare.' });
  scatter(g, 'T', 0.03, 63, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  // les emplacements des habitants restent dégagés
  [[12, 7], [12, 9], [11, 13], [17, 15], [9, 11], [4, 13], [22, 12], [13, 17], [27, 11], [21, 16], [8, 6], [4, 19]].forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ') g[y][x] = '.'; });
  return {
    id: 'porte', region: 'porte', title: 'La Porte du Zénith', theme: 'zenith', area: true, map: toRows(g),
    spawn: [12, 7], entry: [12, 7],
    ents: [{ t: 'start', x: 12, y: 7 }],
    props,
    npcs: [
      { id: 'celestine', x: 12.6, y: 9.4, face: 'S' },
      { id: 'selene_z', x: 11.2, y: 12.8, face: 'E' },
      { id: 'ambre_z', x: 17.6, y: 15.6, wander: 1.6 },
      { id: 'bran_z', x: 9.2, y: 11, face: 'S' },
      { id: 'silex_z', x: 4.2, y: 13, wander: 1.4 },
      { id: 'lison_z', x: 22, y: 11.6, face: 'W' },
      { id: 'mira_z', x: 13, y: 17.4, wander: 2 },
      { id: 'aldo_z', x: 27, y: 11, face: 'W' },
      { id: 'pell_z', x: 21, y: 16, face: 'N' },
      { id: 'ysolde_z', x: 18.5, y: 6.1, face: 'S', counter: true },
      { id: 'gaspard_z', x: 23.5, y: 6.1, face: 'S', counter: true },
      { id: 'calixte_z', x: 4.2, y: 19.4, face: 'E' },
    ],
    chests: [{ id: 'ch_porte_ecus', x: 25, y: 21, ecus: 60 }],
    pickups: [],
  };
}

/* L'auberge de l'Aurore */
export function auberge() {
  const rows = [
    '#############',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '######.######',
  ];
  const g = rows.map((r) => r.split(''));
  const props = [];
  const put = (t, x, y, w = 1, h = 1, extra = {}) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t, x, y, w, h }, extra)); };
  put('counter', 2, 3, 4, 1);
  put('fireplace', 6, 1, 2, 1);
  put('bed', 10, 1, 2, 2, { rest: true, name: 'Lit de l’auberge' });
  put('table', 8, 5, 1, 1); put('table', 3, 6, 1, 1);
  put('barrel', 1, 1); put('barrel', 1, 2); put('shelf', 3, 1, 2, 1);
  return {
    id: 'auberge_z', region: 'porte', title: 'Auberge de l’Aurore', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [6, 7], entry: [6, 8], exit: { cell: [6, 8], to: 'porte', at: [5, 5] },
    props, npcs: [{ id: 'oriel', x: 3.5, y: 2.1, face: 'S', counter: true }],
  };
}

/* ---------------------------------------------------------
   Salles des portails (11×11). Un mur coupe la salle ; la lumière, elle, le traverse par les portails.
   Colonne de marche : la rangée 5 reste toujours libre.
   --------------------------------------------------------- */
function room(rocks = [], wallX = 5, gapY = 5) {
  const g = Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => (x === 0 || y === 0 || x === 10 || y === 10 ? '#' : '.')));
  g[5][0] = '.'; g[5][10] = '.';
  for (let y = 1; y <= 9; y++) if (y !== gapY) g[y][wallX] = '#';
  rocks.forEach(([x, y]) => (g[y][x] = '#'));
  return g.map((r) => r.join(''));
}
export function portalRooms() {
  return [
    { id: 'jz1', title: 'Le premier portail', num: 1, entryGate: 'b_portails', gate: 'zg1',
      hint: 'Un portail de lumière avale le faisceau et le rend par son jumeau, de l’autre côté du mur. Lyra, elle, ne peut pas y passer.',
      map: room([[3, 6], [8, 6], [7, 8]]),
      ents: [
        { t: 'lantern', x: 2, y: 9, dir: 'W', rot: true },
        { t: 'mirror', x: 2, y: 3, state: 1, rot: true },
        { t: 'portal', x: 4, y: 3, pair: 'a' }, { t: 'portal', x: 6, y: 3, pair: 'a' },
        { t: 'portal', x: 4, y: 7, pair: 'b' }, { t: 'portal', x: 8, y: 8, pair: 'b' },
        { t: 'receiver', x: 8, y: 3, color: 'w', gate: 'zg1' },
      ] },
    { id: 'jz2', title: 'Le portail du cyan', num: 2, entryGate: 'zg1', gate: 'zg2',
      hint: 'Un vitrail cyan, deux miroirs, une paire de portails. La lumière blanche devient cyan en passant le verre, et garde sa couleur après le portail.',
      map: room([[3, 6], [7, 4], [8, 2]]),
      ents: [
        { t: 'lantern', x: 2, y: 9, dir: 'W', rot: true },
        { t: 'mirror', x: 2, y: 7, state: 1, rot: true },
        { t: 'portal', x: 4, y: 7, pair: 'a' }, { t: 'portal', x: 6, y: 8, pair: 'a' },
        { t: 'vitrail', x: 7, y: 8, color: 'c' },
        { t: 'mirror', x: 9, y: 8, state: 1, rot: true },
        { t: 'receiver', x: 9, y: 2, color: 'c', gate: 'zg2' },
      ] },
    { id: 'jz3', title: 'Un portail pour chaque couleur', num: 3, entryGate: 'zg2', gate: 'zg3', wallX: 6,
      hint: 'Le prisme sépare la lumière en trois : le rouge à gauche, le vert tout droit, le bleu à droite. Chaque faisceau peut prendre son propre portail.',
      map: room([[8, 2], [9, 6], [2, 6]], 6),
      ents: [
        { t: 'lantern', x: 1, y: 8, dir: 'W', rot: true },
        { t: 'mirror', x: 1, y: 3, state: 1, rot: true },
        { t: 'prism', x: 3, y: 3 },
        { t: 'receiver', x: 3, y: 2, color: 'r', gate: 'zg3' },
        { t: 'portal', x: 5, y: 3, pair: 'a' }, { t: 'portal', x: 7, y: 3, pair: 'a' },
        { t: 'receiver', x: 9, y: 3, color: 'g', gate: 'zg3' },
        { t: 'portal', x: 3, y: 7, pair: 'b' }, { t: 'portal', x: 8, y: 6, pair: 'b' },
        { t: 'receiver', x: 8, y: 8, color: 'b', gate: 'zg3' },
      ] },
  ];
}

/* ---------------------------------------------------------
   Les Jardins célestes (exploration et combat)
   --------------------------------------------------------- */
export function jardins() {
  const W = 34, H = 26, g = grid(W, H);
  blob(g, 16.5, 12.5, 18.6, 14.6, 71, 0.08);
  rim(g, 72, 0.2);
  road(g, [[0, 5], [8, 5], [8, 10], [17, 10], [17, 25]]);
  road(g, [[17, 10], [26, 10], [26, 5]]);
  road(g, [[8, 10], [8, 18], [4, 18]]);
  disk(g, 17, 13, 2.6, ',');
  disk(g, 25, 18, 2.2, '~'); disk(g, 6, 14, 1.6, '~');
  scatter(g, '#', 0.02, 73); scatter(g, 'T', 0.07, 74);
  // haie de ronces lumineuses : il faut une lame
  for (let x = 0; x < W; x++) if (g[16][x] !== ' ' && g[16][x] !== 'T' && g[15][x] !== ' ' && g[17][x] !== ' ' && x !== 17 && x !== 16 && x !== 18) g[16][x] = 'r';
  for (let x = 0; x < W; x++) if (g[16][x] === 'r' && (g[15][x] === ' ' || g[17][x] === ' ')) g[16][x] = '#';
  // cachette nord-ouest (roches fissurées : il faut un marteau)
  rect(g, 2, 1, 5, 4, '#'); rect(g, 3, 2, 3, 2, '.'); g[4][4] = 'c';
  // recoin est, gardé par des ronces
  rect(g, 28, 12, 5, 4, '#'); rect(g, 29, 13, 3, 2, '.'); g[13][28] = 'r';
  const clear = [[3, 2], [5, 3], [30, 13], [31, 14], [4, 18], [12, 7], [22, 7], [6, 22], [28, 22], [12, 20], [20, 21], [30, 5], [10, 3], [21, 13], [13, 13], [4, 11], [29, 8], [12, 12], [25, 3], [9, 23]];
  clear.forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ' || g[y][x] === '~') g[y][x] = '.'; });
  return {
    id: 'jardins', region: 'jardins', title: 'Les Jardins célestes', theme: 'jardins', area: true, map: toRows(g),
    spawn: [1, 5], entry: [0, 5], entryGate: 'zg3',
    props: [
      { t: 'sign', x: 2, y: 6, w: 1, h: 1, text: 'Jardins célestes. Les fleurs d’ici ne poussent que dans la lumière. Au sud, par le grand escalier : la Grande Salle.' },
      { t: 'ruin', x: 17, y: 24, w: 1, h: 1, name: 'Portique de la Grande Salle' },
      { t: 'crystal', x: 15, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 19, y: 13, w: 1, h: 1 },
      { t: 'brazier', x: 16, y: 9, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 9, w: 1, h: 1 },
      { t: 'bench', x: 7, y: 6, w: 1, h: 1 }, { t: 'bench', x: 27, y: 6, w: 1, h: 1 },
    ],
    npcs: [{ id: 'vesper', x: 12.5, y: 8.6, wander: 1.8 }],
    chests: [
      { id: 'ch_jar_coeur', x: 3, y: 2, item: 'fragment_coeur', n: 1 },
      { id: 'ch_jar_bague', x: 30, y: 13, item: 'anneau_zenith', n: 1 },
      { id: 'ch_jar_ecus', x: 10, y: 3, ecus: 120 },
      { id: 'ch_jar_nectar', x: 4, y: 18, item: 'nectar', n: 2 },
    ],
    pickups: [
      { t: 'item', id: 'fleur1', item: 'fleur_ciel', x: 12, y: 7 },
      { t: 'item', id: 'fleur2', item: 'fleur_ciel', x: 22, y: 7 },
      { t: 'item', id: 'fleur3', item: 'fleur_ciel', x: 6, y: 22 },
      { t: 'item', id: 'fleur4', item: 'fleur_ciel', x: 28, y: 22 },
      { t: 'page', id: 'pg_jardin', page: 'orin6', x: 31, y: 14 },
    ],
    ents: [{ t: 'shard', x: 12, y: 20 }, { t: 'shard', x: 20, y: 21 }],
    spawns: [
      { type: 'ombre_or', x: 12, y: 12, n: 2 },
      { type: 'ombre_or', x: 22, y: 7, n: 2 },
      { type: 'lanterne_noire', x: 29, y: 8, n: 1 },
      { type: 'belier_ivoire', x: 21, y: 13, n: 1 },
      { type: 'ombre_or', x: 6, y: 22, n: 2 },
      { type: 'lanterne_noire', x: 25, y: 3, n: 1 },
      { type: 'belier_ivoire', x: 13, y: 13, n: 1 },
      { type: 'ombre_or', x: 28, y: 22, n: 2 },
      { type: 'statue_ivoire', x: 17, y: 22, n: 1, elite: true },
      { type: 'lanterne_noire', x: 9, y: 23, n: 1 },
    ],
  };
}

/* ---------------------------------------------------------
   La Grande Salle (donjon) : hall, salle des ombres, salle des portails,
   chambre de la clé, trésor, arène du boss final.
   --------------------------------------------------------- */
export function salle() {
  const W = 30, H = 29, g = grid(W, H, '#');
  const r = (x0, y0, x1, y1) => rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.');
  r(11, 1, 19, 7);   // hall
  r(1, 1, 9, 9);     // salle ouest (combat)
  r(21, 1, 28, 9);   // salle est (portails)
  r(1, 12, 8, 19);   // salle sud-ouest (clé)
  r(22, 12, 28, 19); // salle sud-est (trésor)
  r(10, 11, 20, 26); // arène
  r(1, 23, 7, 27);   // chambre cachée
  g[0][15] = '.';
  g[4][10] = '.'; g[4][20] = '.';
  g[10][4] = 'x'; g[11][4] = 'x';        // sceau (salle nettoyée)
  g[10][25] = 'x'; g[11][25] = 'x';      // barrière de cristal (énigme des portails)
  g[8][15] = 'x'; g[9][15] = 'x'; g[10][15] = 'x';   // porte verrouillée de l'arène
  g[20][4] = 'c'; g[21][4] = 'c'; g[22][4] = 'c';
  g[27][15] = '.'; g[28][15] = '.';      // sortie sud (pont du Zénith, ouvert par la victoire)
  [[3, 3], [7, 3], [3, 7], [7, 7], [13, 3], [17, 3], [12, 14], [18, 14], [12, 22], [18, 22], [24, 14], [26, 17]].forEach(([x, y]) => (g[y][x] = '#'));
  for (let y = 1; y <= 8; y++) g[y][24] = '#';       // mur de la salle des portails (ouvert en (24, 9))
  return {
    id: 'salle', region: 'salle', title: 'La Grande Salle', theme: 'salle', area: true, dungeon: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0], entryGate: 'b_salle',
    doors: [
      { gate: 'gs_combat', look: 'seal', cells: [[4, 10], [4, 11]] },
      { gate: 'gs_light', look: 'barrier', cells: [[25, 10], [25, 11]] },
      { gate: 'gs_key', look: 'door', cells: [[15, 8], [15, 9], [15, 10]], key: 'cle_salle' },
    ],
    ents: [
      { t: 'lantern', x: 22, y: 8, dir: 'W', rot: true },
      { t: 'mirror', x: 22, y: 5, state: 1, rot: true },
      { t: 'portal', x: 23, y: 5, pair: 'a' }, { t: 'portal', x: 25, y: 5, pair: 'a' },
      { t: 'vitrail', x: 26, y: 5, color: 'y' },
      { t: 'receiver', x: 27, y: 5, color: 'y', gate: 'gs_light' },
      { t: 'shard', x: 5, y: 25 },
    ],
    props: [
      { t: 'brazier', x: 12, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 12, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 12, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 25, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 25, w: 1, h: 1 },
      { t: 'crystal', x: 2, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 27, y: 18, w: 1, h: 1 }, { t: 'crystal', x: 6, y: 26, w: 1, h: 1 },
      { t: 'sign', x: 14, y: 2, w: 1, h: 1, text: 'La Grande Salle. À gauche, la salle des ombres ; à droite, la salle des portails. Il faut la clé pour entrer dans l’arène.' },
    ],
    warp: { id: 'salle', x: 15, y: 5, name: 'Hall de la Grande Salle', needs: 'salle_vue' },
    chests: [
      { id: 'ch_cle_s', x: 5, y: 16, item: 'cle_salle', n: 1 },
      { id: 'ch_tresor_s', x: 25, y: 16, item: 'arc_aurore', n: 1 },
      { id: 'ch_prisme_z', x: 15, y: 25, item: 'eclat_zenith', n: 1, after: 'boss_zenith' },
      { id: 'ch_cache_s', x: 4, y: 25, item: 'fragment_coeur', n: 1 },
      { id: 'ch_cache2_s', x: 2, y: 25, ecus: 250 },
      { id: 'ch_hall_s', x: 12, y: 5, item: 'ambroisie', n: 1 },
    ],
    combatRooms: [{ gate: 'gs_combat', rect: [1, 1, 9, 9] }],
    spawns: [
      { type: 'ombre_or', x: 5, y: 5, n: 4, room: 'gs_combat' },
      { type: 'lanterne_noire', x: 2, y: 2, n: 1, room: 'gs_combat' },
      { type: 'lanterne_noire', x: 8, y: 8, n: 1, room: 'gs_combat' },
      { type: 'statue_ivoire', x: 5, y: 15, n: 1 },
      { type: 'belier_ivoire', x: 25, y: 13, n: 1 },
      { type: 'ombre_prisme', x: 15, y: 19, n: 1, boss: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le Phare du Zénith : trois salles en enfilade (A, B, C), deux portes, DEUX balises.
   La balise de gauche exige le rouge, le vert et le bleu ; celle de droite, le jaune, le magenta et le cyan :
   six couleurs, six faisceaux, vers les six phares de l'archipel.
   Étape 1 (salle A)  : un cristal blanc ouvre D1.
   Étape 2 (salle B)  : un cristal blanc ouvre D2 (trois cases : les trois rangées de la lumière de B).
   Finale             : le miroir de A et celui de B doivent être RETOURNÉS : la lanterne de A passe par le prisme et envoie
                        le rouge, le vert et le bleu par trois portails vers C ; les trois lanternes de B envoient le jaune,
                        le magenta et le cyan par D2 jusqu'à la balise de droite.
   --------------------------------------------------------- */
export function phare() {
  const W = 23, H = 13, g = grid(W, H, '#');
  rect(g, 1, 1, 6, 11, '.'); rect(g, 8, 1, 6, 11, '.'); rect(g, 15, 1, 7, 11, '.');
  g[0][1] = '.';                                  // arrivée (pont de la Grande Salle), en haut à gauche
  g[6][7] = 'x';                                  // D1
  g[2][14] = 'x'; g[6][14] = 'x'; g[10][14] = 'x';   // D2 (trois passages)
  const ents = [
    { t: 'beacon', x: 17, y: 4, gate: 'end', need: ['r', 'g', 'b'] },
    { t: 'beacon', x: 20, y: 6, gate: 'end', need: ['y', 'm', 'c'] },
    // salle A : une lanterne, un miroir, un prisme. Miroir à « / » : la lumière blanche file vers le cristal blanc (étape 1).
    // Miroir à « \ » : elle entre dans le prisme, qui l'éclate en rouge, vert et bleu, avalés par trois portails (finale).
    { t: 'lantern', x: 3, y: 9, dir: 'W', rot: true },
    { t: 'mirror', x: 3, y: 6, state: 1, rot: true },
    { t: 'receiver', x: 5, y: 6, color: 'w', gate: 'ph_d1' },
    { t: 'prism', x: 2, y: 6 },
    { t: 'portal', x: 2, y: 10, pair: 'r' }, { t: 'portal', x: 1, y: 6, pair: 'g' }, { t: 'portal', x: 2, y: 1, pair: 'b' },
    // salle B : trois lanternes, trois vitraux, trois rangées qui traversent la porte D2.
    // Le miroir du haut, tourné vers l'ouest, envoie la lumière blanche au cristal blanc (étape 2) ; tourné vers l'est, il l'envoie au vitrail jaune (finale).
    { t: 'receiver', x: 8, y: 2, color: 'w', gate: 'ph_d2' },
    { t: 'lantern', x: 9, y: 4, dir: 'W', rot: true },
    { t: 'mirror', x: 9, y: 2, state: 1, rot: true },
    { t: 'vitrail', x: 11, y: 2, color: 'y' },
    { t: 'lantern', x: 9, y: 6, dir: 'W', rot: true },
    { t: 'vitrail', x: 11, y: 6, color: 'm' },
    { t: 'lantern', x: 9, y: 8, dir: 'W', rot: true },
    { t: 'mirror', x: 9, y: 10, state: 0, rot: true },
    { t: 'vitrail', x: 11, y: 10, color: 'c' },
    // salle C : jumeaux des portails et miroirs de renvoi
    { t: 'portal', x: 17, y: 1, pair: 'r' }, { t: 'portal', x: 19, y: 4, pair: 'g' }, { t: 'portal', x: 17, y: 8, pair: 'b' },
    { t: 'mirror', x: 20, y: 2, state: 0, rot: true },
    { t: 'mirror', x: 20, y: 10, state: 1, rot: true },
  ];
  return {
    id: 'phare_z', region: 'zenith', title: 'Le Phare du Zénith', theme: 'phare_zenith', music: 'zenith', num: 6, respawn: true, map: toRows(g),
    entry: [1, 0], spawn: [1, 1], entryGate: 'b_zenith', ents,
    doors: [
      { gate: 'ph_d1', look: 'barrier', cells: [[7, 6]] },
      { gate: 'ph_d2', look: 'barrier', cells: [[14, 2], [14, 6], [14, 10]] },
    ],
    stages: ['ph_d1', 'ph_d2'], final: 'end',
    hint: 'Six faisceaux, six couleurs. Les trois portails de la première salle mènent au dernier salon ; la lumière de la deuxième salle doit, elle, traverser la porte.',
    warp: { id: 'phare', x: 3, y: 10, name: 'Cristal du Phare du Zénith' },
    props: [{ t: 'sign', x: 2, y: 11, w: 1, h: 1, text: 'Ici bat le cœur de la citadelle. Six lumières, six phares : l’archipel attend qu’on les allume ensemble.' }],
  };
}
