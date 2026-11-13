/* =========================================================
   LUMEN — zones d'aventure des Pics du Vent (Acte V) : le Col, l'auberge, la Terrasse,
   les Pentes, les Moulins (donjon), le Névé, les Sommets et le Phare des Vents.
   Mêmes conventions que tools/areas.mjs. Les salles à relais temporisés sont ici dessinées à la main
   et vérifiées par tools/timed.mjs ; les salles de miroirs sont générées dans build-pics.mjs.
   ========================================================= */
import { grid, blob, rim, rect, disk, road, scatter, toRows } from './areas.mjs';

const clear = (g, pts, ch = '.') => pts.forEach(([x, y]) => { if (g[y] && g[y][x] !== undefined) g[y][x] = ch; });

/* ---------------------------------------------------------
   Le Col : village de montagne (départ, boutiques, auberge)
   --------------------------------------------------------- */
function col() {
  const W = 30, H = 24, g = grid(W, H);
  blob(g, 14.5, 11.5, 16.2, 13.2, 61, 0.1);
  rim(g, 62, 0.35);
  road(g, [[1, 5], [29, 5]]);          // vers les Courants (est)
  road(g, [[15, 5], [15, 23]]);        // vers les Pentes (sud)
  disk(g, 15, 12, 3.4, ',');
  road(g, [[5, 4], [5, 5]]); road(g, [[24, 4], [24, 5]]);
  road(g, [[9, 9], [9, 5]]); road(g, [[9, 9], [12, 9]]);
  road(g, [[19, 10], [19, 9], [26, 9]]); road(g, [[18, 14], [24, 14]]);
  road(g, [[6, 15], [12, 15]]);
  const props = [];
  const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h }, extra)); };
  house('auberge_p', 2, 1, 7, 3, { style: 'auberge', door: [5, 4], side: 'S', interior: 'auberge_p', name: 'Auberge du Chamois endormi', sign: 'lampion' });
  house('boree_h', 21, 1, 6, 3, { style: 'pierre', door: [24, 4], side: 'S', name: 'Maison de Borée', closed: 'Borée reçoit sur la place. Sa porte est fermée.' });
  house('forge_p', 2, 8, 5, 3, { style: 'forge', door: [7, 9], side: 'E', name: 'Forge de Frimas', closed: 'La forge est ouverte sur la rue : Frimas travaille dehors, près de l’enclume.' });
  house('tourmente_h', 2, 16, 5, 3, { style: 'bois', door: [4, 15], side: 'N', name: 'Maison de Tourmente', closed: 'La porte est fermée. Derrière, on entend grincer de vieux engrenages.' });
  rect(g, 14, 11, 3, 3, 'H'); props.push({ t: 'cairn', id: 'cairn_col', x: 14, y: 11, w: 3, h: 3, warp: 'col', name: 'Cristal de voyage' });
  const stall = (id, x, y, color, name) => { rect(g, x, y, 2, 1, 'H'); props.push({ t: 'stall', id, x, y, w: 2, h: 1, color, name }); };
  stall('etal_gentiane', 18, 7, '#8fc7e8', 'Gentiane, apothicaire');
  stall('etal_zephyr', 23, 7, '#b59cf0', 'Comptoir de Zéphyr');
  rect(g, 8, 10, 1, 1, 'H'); props.push({ t: 'anvil', id: 'enclume_p', x: 8, y: 10, w: 1, h: 1 });
  rect(g, 20, 17, 3, 3, 'H'); props.push({ t: 'windmill', id: 'moulin_col', x: 20, y: 17, w: 3, h: 3, name: 'Le moulin du Col' });
  const deco = (t, x, y, extra) => { g[y][x] = 'H'; props.push(Object.assign({ t, x, y, w: 1, h: 1 }, extra)); };
  [[12, 6, 1], [18, 4, 2], [10, 4, 3], [26, 6, 4], [13, 16, 5], [17, 21, 6], [27, 11, 7]].forEach(([x, y, n]) => deco('lamp', x, y, { id: 'fanion_c' + n }));
  deco('crate', 25, 12); deco('barrel', 20, 13); deco('barrel', 6, 11); deco('crate', 7, 12);
  deco('bench', 12, 14); deco('bench', 18, 10); deco('well', 27, 16, { id: 'puits_p' });
  deco('weathervane', 11, 8, { id: 'girouette_col' }); deco('snowman', 4, 13); deco('snowman', 26, 21);
  deco('sign', 16, 22, { text: 'Au sud : les Pentes, puis le Moulin du Grand Meunier. Les bouquetins n’aiment pas les visiteurs.' });
  deco('sign', 27, 4, { text: 'À l’est : les Courants. Garde la voile serrée jusqu’au bord, puis laisse le vent faire.' });
  scatter(g, 'T', 0.05, 63, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  return {
    id: 'col', region: 'col', title: 'Le Col', theme: 'pics', music: 'col', area: true, map: toRows(g),
    spawn: [12, 7], entry: [12, 7],
    ents: [{ t: 'start', x: 12, y: 7 }],
    props,
    npcs: [
      { id: 'boree', x: 12.6, y: 9.4, face: 'S' },
      { id: 'gentiane', x: 18.5, y: 6.1, face: 'S', counter: true },
      { id: 'zephyr', x: 23.5, y: 6.1, face: 'S', counter: true },
      { id: 'frimas', x: 9.2, y: 11, face: 'S' },
      { id: 'alizee', x: 11, y: 11.4, face: 'E' },
      { id: 'tourmente', x: 18.6, y: 17.2, face: 'E' },
      { id: 'edel', x: 9, y: 16.6, wander: 2.4 },
      { id: 'rafale', x: 25.2, y: 10.6, face: 'W' },
    ],
    pickups: [],
  };
}

/* ---------------------------------------------------------
   L'auberge du Chamois endormi (intérieur)
   --------------------------------------------------------- */
function auberge() {
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
    id: 'auberge_p', region: 'col', title: 'Auberge du Chamois endormi', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [6, 7], entry: [6, 8], exit: { cell: [6, 8], to: 'col', at: [5, 5] },
    props, npcs: [{ id: 'flocon', x: 3.5, y: 2.1, face: 'S', counter: true }],
  };
}

/* ---------------------------------------------------------
   La Terrasse des Girouettes : belvédère au bout des Courants, avant la montée
   --------------------------------------------------------- */
function terrasse() {
  const g = grid(11, 11);
  rect(g, 0, 0, 11, 11, '.');
  for (let i = 0; i < 11; i++) { g[0][i] = '#'; g[10][i] = '#'; g[i][10] = '#'; if (i !== 5) g[i][0] = '#'; }
  g[5][0] = '.'; g[10][5] = '.';       // entrée ouest (pont des Courants), sortie sud (pont des Sommets)
  [[2, 2], [8, 2], [2, 8], [8, 8]].forEach(([x, y]) => (g[y][x] = 'T'));
  return {
    id: 'gir', region: 'terrasse', title: 'La Terrasse des Girouettes', theme: 'pics', music: 'sommets', area: true, map: toRows(g),
    spawn: [2, 5], entry: [0, 5], entryGate: 'pg3',
    props: [
      { t: 'weathervane', id: 'girouette_t1', x: 3, y: 3, w: 1, h: 1 }, { t: 'weathervane', id: 'girouette_t2', x: 7, y: 3, w: 1, h: 1 },
      { t: 'sign', x: 5, y: 2, w: 1, h: 1, text: 'Les girouettes de la Terrasse montrent toutes la même direction : le sud, vers les Sommets. Mais le pont ne se déploiera qu’une fois le moulin remis en marche.' },
      { t: 'flagpole', x: 8, y: 6, w: 1, h: 1 },
    ],
    npcs: [{ id: 'cime', x: 7.4, y: 7.5, face: 'W' }],
    chests: [{ id: 'ch_terrasse', x: 5, y: 7, item: 'grande_potion', n: 2 }],
    pickups: [{ t: 'item', id: 'gir_cristal', item: 'cristal_vent', x: 8, y: 4 }],
    warp: { id: 'terrasse', x: 3, y: 5, name: 'Cristal de la Terrasse' },
  };
}

/* ---------------------------------------------------------
   Les Pentes : exploration et combat ; un ravin se franchit en planant
   --------------------------------------------------------- */
function pentes() {
  const W = 34, H = 28, g = grid(W, H);
  blob(g, 11, 7.5, 11, 7.6, 71, 0.2);
  blob(g, 13, 20, 12, 8, 72, 0.2);
  blob(g, 14, 13.5, 6, 4, 73, 0.1);
  rim(g, 74, 0.35);
  scatter(g, '#', 0.03, 75); scatter(g, 'T', 0.07, 76);
  road(g, [[15, 0], [15, 4], [10, 4], [10, 9], [14, 9], [14, 18], [18, 18], [18, 22], [17, 22], [17, 27]]);
  road(g, [[10, 6], [5, 6], [5, 10]]);
  // ravin à franchir en planant : trois cases de vide, un îlot (corniche) à l'est
  for (let y = 7; y <= 19; y++) for (let x = 21; x <= 23; x++) g[y][x] = ' ';
  rect(g, 24, 9, 8, 9, '.');
  for (let x = 24; x < 32; x++) { g[9][x] = '#'; g[17][x] = '#'; }
  for (let y = 9; y <= 17; y++) { g[y][31] = '#'; g[y][24] = y === 13 ? '.' : '#'; }
  [[24, 13], [25, 13], [26, 13], [28, 12], [28, 14]].forEach(([x, y]) => (g[y][x] = '.'));
  rect(g, 18, 12, 3, 3, '.'); g[13][20] = '.'; g[13][19] = '.';   // rive ouest du ravin
  // haie de ronces : il faut une lame
  for (let x = 0; x < 19; x++) if (g[24][x] !== ' ' && g[24][x] !== 'T' && g[23][x] !== ' ' && g[25][x] !== ' ') g[24][x] = 'r';
  for (let x = 0; x < W; x++) if (g[24][x] === 'r' && (g[23][x] === ' ' || g[25][x] === ' ')) g[24][x] = '#';
  g[24][17] = ',';
  // cachette sud-ouest (roches fissurées)
  rect(g, 3, 20, 4, 4, '#'); rect(g, 4, 21, 2, 2, '.'); g[20][5] = 'c'; g[22][6] = 'c';
  clear(g, [[4, 21], [28, 13], [19, 3], [4, 8], [9, 23], [9, 6], [20, 5], [20, 10], [12, 17], [8, 16], [12, 22], [17, 24], [16, 13], [14, 21], [27, 13], [26, 12]]);
  return {
    id: 'pentes', region: 'pentes', title: 'Les Pentes du Col', theme: 'pics', area: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0], entryGate: 'b_pentes',
    ents: [
      { t: 'vent', x: 20, y: 13 }, { t: 'vent', x: 24, y: 13 },
    ],
    props: [
      { t: 'ruin', x: 17, y: 25, w: 1, h: 1, name: 'Portique du Moulin' },
      { t: 'sign', x: 13, y: 2, w: 1, h: 1, text: 'Les Pentes du Col. Les ronces de givre ne cèdent qu’à une vraie lame. Au bord du ravin, une pierre de vent attend qui oserait planer.' },
      { t: 'flagpole', x: 12, y: 13, w: 1, h: 1 },
    ],
    chests: [
      { id: 'ch_pen_coeur', x: 28, y: 13, item: 'fragment_coeur', n: 1 },
      { id: 'ch_pen_bague', x: 4, y: 21, item: 'anneau_vent', n: 1 },
      { id: 'ch_pen_ecus', x: 19, y: 3, ecus: 80 },
    ],
    pickups: [
      { t: 'item', id: 'edel1', item: 'edelweiss', x: 4, y: 8 },
      { t: 'item', id: 'edel2', item: 'edelweiss', x: 9, y: 23 },
      { t: 'item', id: 'edel3', item: 'edelweiss', x: 27, y: 13 },
      { t: 'item', id: 'edel4', item: 'edelweiss', x: 20, y: 5 },
      { t: 'item', id: 'cerf1', item: 'cerf_volant', x: 26, y: 12 },
      { t: 'item', id: 'engrenage1', item: 'engrenage', x: 12, y: 22 },
    ],
    spawns: [
      { type: 'givrelin', x: 9, y: 6, n: 2 },
      { type: 'givrelin', x: 20, y: 5, n: 2 },
      { type: 'bourrasque', x: 20, y: 10, n: 1 },
      { type: 'bouquetin', x: 12, y: 17, n: 1 },
      { type: 'bouquetin', x: 8, y: 16, n: 1 },
      { type: 'givrelin', x: 12, y: 22, n: 2 },
      { type: 'veilleur_givre', x: 17, y: 24, n: 1, elite: true },
    ],
  };
}

/* ---------------------------------------------------------
   Les Moulins (donjon) : le moulin du Grand Meunier
   --------------------------------------------------------- */
function moulins() {
  const W = 30, H = 29, g = grid(W, H, '#');
  const room = (x0, y0, x1, y1) => rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.');
  room(11, 1, 19, 7);   // hall
  room(1, 1, 9, 9);     // salle ouest (combat)
  room(21, 1, 28, 9);   // salle est (relais temporisés)
  room(1, 12, 8, 19);   // salle sud-ouest (clé)
  room(22, 12, 28, 19); // salle sud-est (trésor)
  room(10, 11, 20, 26); // arène du Grand Meunier
  room(1, 23, 7, 27);   // chambre cachée
  g[0][15] = '.';
  g[4][10] = '.'; g[4][20] = '.';
  g[10][4] = 'x'; g[11][4] = 'x';       // sceau (salle nettoyée)
  g[10][25] = 'x'; g[11][25] = 'x';     // barrière de lumière (relais)
  g[8][15] = 'x'; g[9][15] = 'x'; g[10][15] = 'x'; // porte verrouillée
  g[20][4] = 'c'; g[21][4] = 'c'; g[22][4] = 'c';
  [[3, 3], [7, 3], [3, 7], [7, 7], [13, 3], [17, 3], [12, 14], [18, 14], [12, 22], [18, 22], [24, 14], [26, 17]].forEach(([x, y]) => (g[y][x] = '#'));
  return {
    id: 'moulins', region: 'moulins', title: 'Le Moulin du Grand Meunier', theme: 'moulins', area: true, dungeon: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0], entryGate: 'b_moulins',
    doors: [
      { gate: 'md_combat', look: 'seal', cells: [[4, 10], [4, 11]] },
      { gate: 'md_light', look: 'barrier', cells: [[25, 10], [25, 11]] },
      { gate: 'md_key', look: 'door', cells: [[15, 8], [15, 9], [15, 10]], key: 'cle_moulin' },
    ],
    /* salle des relais : une seule lanterne, quatre relais à mémoire (7 s) ; le faisceau ne peut en éclairer qu’un à la fois */
    ents: [
      { t: 'lantern', x: 24, y: 5, dir: 'S', rot: true },
      { t: 'relay', x: 22, y: 5, out: 'S', hold: 7, id: 'rl_w' },
      { t: 'receiver', x: 22, y: 8, color: 'w', gate: 'md_light' },
      { t: 'relay', x: 24, y: 2, out: 'E', hold: 7, id: 'rl_n' },
      { t: 'receiver', x: 27, y: 2, color: 'w', gate: 'md_light' },
      { t: 'relay', x: 27, y: 5, out: 'S', hold: 7, id: 'rl_e' },
      { t: 'receiver', x: 27, y: 8, color: 'w', gate: 'md_light' },
    ],
    props: [
      { t: 'brazier', x: 12, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 12, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 12, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 25, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 25, w: 1, h: 1 },
      { t: 'crystal', x: 2, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 27, y: 18, w: 1, h: 1 }, { t: 'crystal', x: 6, y: 26, w: 1, h: 1 },
    ],
    warp: { id: 'moulins', x: 15, y: 5, name: 'Hall du Moulin', needs: 'boss_meunier' },
    chests: [
      { id: 'ch_cle_m', x: 5, y: 16, item: 'cle_moulin', n: 1 },
      { id: 'ch_tresor_m', x: 25, y: 16, item: 'epee_givre', n: 1 },
      { id: 'ch_coeur_m', x: 15, y: 25, item: 'coeur_moulin', n: 1, after: 'boss_meunier' },
      { id: 'ch_cache_m', x: 4, y: 25, item: 'fragment_coeur', n: 1 },
      { id: 'ch_cache2_m', x: 2, y: 25, ecus: 220 },
    ],
    pickups: [{ t: 'page', id: 'pg_moulin', page: 'orin6', x: 2, y: 24 }],
    combatRooms: [{ gate: 'md_combat', rect: [1, 1, 9, 9] }],
    spawns: [
      { type: 'givrelin', x: 5, y: 5, n: 4, room: 'md_combat' },
      { type: 'bourrasque', x: 2, y: 2, n: 1, room: 'md_combat' },
      { type: 'veilleur_givre', x: 5, y: 15, n: 1 },
      { type: 'bouquetin', x: 25, y: 13, n: 1 },
      { type: 'grand_meunier', x: 15, y: 18, n: 1, boss: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le Névé : première étape des Sommets. Un gouffre sépare l'arrivée de la sortie (planer).
   --------------------------------------------------------- */
function neve() {
  const W = 26, H = 20, g = grid(W, H);
  blob(g, 12.5, 9.5, 14, 10, 81, 0.12);
  rim(g, 82, 0.3);
  for (let y = 0; y < H; y++) for (let x = 12; x <= 15; x++) if (g[y][x] !== ' ') g[y][x] = ' ';   // le gouffre : quatre cases de vide, de part en part
  road(g, [[10, 0], [10, 10], [11, 10]]); road(g, [[16, 10], [25, 10]]);
  scatter(g, '#', 0.04, 83); scatter(g, 'T', 0.06, 84);
  // bords du gouffre : rives praticables
  for (let y = 4; y <= 16; y++) { g[y][11] = '.'; g[y][16] = '.'; }
  clear(g, [[10, 0], [10, 1], [10, 2], [11, 10], [16, 10], [20, 10], [7, 12], [4, 6], [20, 5], [21, 14], [19, 8], [8, 5], [11, 5], [16, 14], [24, 10], [25, 10]]);
  return {
    id: 'so1', region: 'sommets', title: 'Le Névé', theme: 'pics', music: 'sommets', area: true, map: toRows(g),
    spawn: [10, 1], entry: [10, 0], entryGate: 'b_sommets',
    ents: [{ t: 'vent', x: 11, y: 10 }, { t: 'vent', x: 16, y: 10 }],
    props: [
      { t: 'sign', x: 8, y: 2, w: 1, h: 1, text: 'Le Névé. Le gouffre n’a pas de pont : les anciens y déployaient leur voile. Les pierres de vent se font face de part et d’autre.' },
      { t: 'flagpole', x: 9, y: 11, w: 1, h: 1 },
      { t: 'lamp', id: 'fanion_n1', x: 6, y: 6, w: 1, h: 1 }, { t: 'lamp', id: 'fanion_n2', x: 20, y: 6, w: 1, h: 1 },
    ],
    chests: [{ id: 'ch_neve1', x: 4, y: 6, item: 'tisane_cimes', n: 2 }, { id: 'ch_neve2', x: 21, y: 14, ecus: 120 }],
    pickups: [{ t: 'item', id: 'edel5', item: 'edelweiss', x: 7, y: 12 }, { t: 'item', id: 'cerf2', item: 'cerf_volant', x: 16, y: 14 }],
    spawns: [
      { type: 'givrelin', x: 6, y: 8, n: 2 },
      { type: 'bourrasque', x: 19, y: 8, n: 1 },
      { type: 'givrelin', x: 20, y: 12, n: 2 },
    ],
    warp: { id: 'neve', x: 10, y: 3, name: 'Cristal du Névé' },
  };
}

/* ---------------------------------------------------------
   Les Crêtes : large gouffre, îlot central, ennemi d'élite
   --------------------------------------------------------- */
function cretes() {
  const W = 26, H = 20, g = grid(W, H);
  blob(g, 12.5, 9.5, 14, 10, 91, 0.12);
  rim(g, 92, 0.3);
  for (let y = 0; y < H; y++) for (let x = 10; x <= 15; x++) if (g[y][x] !== ' ') g[y][x] = ' ';   // gouffre de six cases
  rect(g, 11, 8, 4, 5, '.');                                                                        // îlot central
  for (let y = 8; y <= 12; y++) { g[y][11] = y === 10 ? '.' : '#'; g[y][14] = y === 10 ? '.' : '#'; }
  for (let x = 11; x <= 14; x++) { g[8][x] = '#'; g[12][x] = '#'; }
  road(g, [[0, 5], [9, 5]]); road(g, [[16, 5], [25, 5]]);
  scatter(g, '#', 0.04, 93); scatter(g, 'T', 0.05, 94);
  for (let y = 3; y <= 17; y++) { if (y < 8 || y > 12) { /* rives */ } g[y][9] = g[y][9] === ' ' ? ' ' : '.'; g[y][16] = g[y][16] === ' ' ? ' ' : '.'; }
  clear(g, [[0, 5], [1, 5], [9, 5], [16, 5], [25, 5], [9, 10], [16, 10], [12, 10], [13, 10], [12, 9], [13, 11], [6, 12], [20, 12], [4, 14], [21, 8], [22, 10], [19, 3], [6, 3], [22, 16]]);
  return {
    id: 'so3', region: 'sommets', title: 'Les Crêtes', theme: 'pics', music: 'sommets', area: true, map: toRows(g),
    spawn: [2, 5], entry: [0, 5], entryGate: 'lf1',
    ents: [
      { t: 'vent', x: 9, y: 5 }, { t: 'vent', x: 16, y: 5 },
      { t: 'vent', x: 9, y: 10 }, { t: 'vent', x: 11, y: 10 }, { t: 'vent', x: 14, y: 10 }, { t: 'vent', x: 16, y: 10 },
    ],
    props: [
      { t: 'sign', x: 3, y: 3, w: 1, h: 1, text: 'Les Crêtes. Six cases de vide, sans une planche. Au centre, un îlot garde ce que le vent n’a pas emporté.' },
      { t: 'flagpole', x: 7, y: 7, w: 1, h: 1 }, { t: 'flagpole', x: 18, y: 7, w: 1, h: 1 },
      { t: 'lamp', id: 'fanion_s1', x: 6, y: 3, w: 1, h: 1 }, { t: 'lamp', id: 'fanion_s2', x: 19, y: 3, w: 1, h: 1 }, { t: 'lamp', id: 'fanion_s3', x: 12, y: 9, w: 1, h: 1 },
    ],
    chests: [{ id: 'ch_cretes1', x: 13, y: 11, item: 'pelisse_cimes', n: 1 }, { id: 'ch_cretes2', x: 6, y: 12, item: 'grande_potion', n: 2 }, { id: 'ch_cretes3', x: 22, y: 16, ecus: 160 }],
    pickups: [{ t: 'item', id: 'edel6', item: 'edelweiss', x: 4, y: 14 }, { t: 'item', id: 'cerf3', item: 'cerf_volant', x: 12, y: 9 }, { t: 'item', id: 'edel7', item: 'edelweiss', x: 21, y: 8 }, { t: 'item', id: 'corne1', item: 'corne_cimes', x: 22, y: 10 }],
    spawns: [
      { type: 'givrelin', x: 6, y: 8, n: 2 },
      { type: 'bourrasque', x: 20, y: 12, n: 1 },
      { type: 'bouquetin', x: 20, y: 6, n: 1, elite: true },
      { type: 'givrelin', x: 21, y: 8, n: 2 },
    ],
    warp: { id: 'cretes', x: 2, y: 3, name: 'Cristal des Crêtes' },
  };
}

/* ---------------------------------------------------------
   Salles à relais temporisés (dessinées à la main, vérifiées par tools/timed.mjs)
   --------------------------------------------------------- */
const room11 = (openings) => {
  const g = grid(11, 11);
  rect(g, 0, 0, 11, 11, '.');
  for (let i = 0; i < 11; i++) { g[0][i] = '#'; g[10][i] = '#'; g[i][0] = '#'; g[i][10] = '#'; }
  openings.forEach(([x, y]) => (g[y][x] = '.'));
  return g;
};
/* Courants III : trois relais à mémoire (10 s), une seule lanterne */
export function courant3() {
  const g = room11([[0, 5], [10, 5]]);
  [[3, 8], [7, 8], [5, 7]].forEach(([x, y]) => (g[y][x] = '#'));
  return {
    map: toRows(g),
    ents: [
      { t: 'lantern', x: 5, y: 4, dir: 'S', rot: true },
      { t: 'relay', x: 1, y: 4, out: 'S', hold: 10, id: 'cr_w' },
      { t: 'receiver', x: 1, y: 7, color: 'w', gate: 'pg3' },
      { t: 'relay', x: 5, y: 1, out: 'E', hold: 10, id: 'cr_n' },
      { t: 'receiver', x: 8, y: 1, color: 'w', gate: 'pg3' },
      { t: 'relay', x: 9, y: 4, out: 'S', hold: 10, id: 'cr_e' },
      { t: 'receiver', x: 9, y: 7, color: 'w', gate: 'pg3' },
    ],
  };
}
/* Sommets IV : quatre relais à mémoire courte (4 s), deux lanternes décalées */
export function sommet4() {
  const g = room11([[0, 5], [10, 5]]);
  [[5, 5], [4, 8], [6, 2]].forEach(([x, y]) => (g[y][x] = '#'));
  return {
    map: toRows(g),
    ents: [
      { t: 'lantern', x: 5, y: 4, dir: 'S', rot: true },
      { t: 'relay', x: 1, y: 4, out: 'S', hold: 5, id: 'so_w' },
      { t: 'receiver', x: 1, y: 7, color: 'w', gate: 'lf3' },
      { t: 'relay', x: 5, y: 1, out: 'W', hold: 5, id: 'so_n' },
      { t: 'receiver', x: 2, y: 1, color: 'w', gate: 'lf3' },
      { t: 'relay', x: 9, y: 4, out: 'S', hold: 5, id: 'so_e' },
      { t: 'receiver', x: 9, y: 7, color: 'w', gate: 'lf3' },
    ],
  };
}

/* ---------------------------------------------------------
   Le Phare des Vents : trois salles en enfilade, deux portes, une balise (rouge + bleu + magenta).
   Étape 1 (salle A)  : allumer le cristal blanc → la porte D1 s'ouvre.
   Étape 2 (salle B)  : faire du magenta avec le prisme et le relais mélangeur → la porte D2 s'ouvre.
   Étape 3 (finale)   : le rouge (A), le magenta (B) et le bleu (C) convergent sur la balise.
   --------------------------------------------------------- */
export function phareVents() {
  const W = 19, H = 13, g = grid(W, H, '#');
  rect(g, 1, 1, 5, 11, '.'); rect(g, 7, 1, 5, 11, '.'); rect(g, 13, 1, 5, 11, '.');
  g[11][0] = '.';
  g[6][6] = 'x';
  g[6][12] = 'x'; g[2][12] = 'x';
  g[5][9] = '#';
  const ents = [
    { t: 'beacon', x: 15, y: 6, gate: 'end', need: ['r', 'b', 'm'] },
    // salle A — rouge
    { t: 'lantern', x: 1, y: 9, dir: 'S', rot: true },
    { t: 'mirror', x: 1, y: 6, state: 1, rot: true },
    { t: 'mirror', x: 4, y: 9, state: 1, rot: true },
    { t: 'vitrail', x: 3, y: 6, color: 'r' },
    { t: 'receiver', x: 4, y: 3, color: 'w', gate: 'pv_d1' },
    // salle B — magenta (prisme + relais mélangeur)
    { t: 'lantern', x: 9, y: 10, dir: 'E', rot: true },
    { t: 'prism', x: 9, y: 8 },
    { t: 'mirror', x: 7, y: 8, state: 0, rot: true },
    { t: 'mirror', x: 11, y: 8, state: 1, rot: true },
    { t: 'mirror', x: 7, y: 3, state: 1, rot: true },
    { t: 'mirror', x: 11, y: 3, state: 0, rot: true },
    { t: 'relay', x: 9, y: 3, mix: true, out: 'W', rot: true },
    { t: 'mirror', x: 9, y: 2, state: 1, rot: true },
    { t: 'receiver', x: 7, y: 2, color: 'm', gate: 'pv_d2' },
    // salle C — bleu
    { t: 'lantern', x: 13, y: 10, dir: 'N', rot: true },
    { t: 'vitrail', x: 14, y: 10, color: 'b' },
    { t: 'mirror', x: 17, y: 10, state: 1, rot: true },
    { t: 'mirror', x: 17, y: 8, state: 0, rot: true },
    { t: 'mirror', x: 15, y: 8, state: 0, rot: true },
    { t: 'mirror', x: 15, y: 2, state: 0, rot: true },
  ];
  return {
    id: 'phare_v', region: 'phare', title: 'Le Phare des Vents', theme: 'phare_vents', music: 'phare_vents', num: 6, respawn: true, map: toRows(g),
    entry: [0, 11], entryGate: 'lf3', ents,
    doors: [
      { gate: 'pv_d1', look: 'barrier', cells: [[6, 6]] },
      { gate: 'pv_d2', look: 'barrier', cells: [[12, 6], [12, 2]] },
    ],
    stages: ['pv_d1', 'pv_d2'], final: 'end',
    hint: 'Le phare exige le rouge, le bleu et le magenta en même temps. Chaque salle donne sa couleur, mais il faudra défaire ce qui a ouvert les portes.',
    warp: { id: 'phare', x: 3, y: 10, name: 'Cristal du Phare des Vents' },
  };
}

export function areasPics() { return { col: col(), auberge: auberge(), terrasse: terrasse(), pentes: pentes(), moulins: moulins(), neve: neve(), cretes: cretes() }; }
