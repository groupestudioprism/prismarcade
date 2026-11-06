/* =========================================================
   LUMEN — zones d'aventure de la Forêt de Verre (village, lisière,
   temple, intérieurs). Même conventions que tools/areas.mjs.
   ========================================================= */
import { grid, blob, rim, rect, disk, road, scatter, toRows } from './areas.mjs';

/* ---------------------------------------------------------
   Vitrebourg : le village des tailleurs de verre
   --------------------------------------------------------- */
function vitrebourg() {
  const W = 30, H = 24, g = grid(W, H);
  blob(g, 14.5, 11.5, 16.2, 13.2, 41, 0.1);
  rim(g, 42, 0.5);
  road(g, [[1, 5], [29, 5]]);          // grand-rue vers les salles de vitraux (est)
  road(g, [[15, 5], [15, 23]]);        // sentier vers la Lisière (sud)
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
  deco('sign', 16, 22, { text: 'Au sud : la Lisière du Verre, puis le Temple. Les cerfs de verre n’aiment pas les visiteurs.' });
  deco('sign', 27, 4, { text: 'À l’est : les salles de vitraux. Rouge + vert = jaune, dit-on ici.' });
  scatter(g, 'T', 0.05, 43, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  return {
    id: 'vitrebourg', region: 'bourg', title: 'Vitrebourg', theme: 'foret', area: true, map: toRows(g),
    spawn: [12, 7], entry: [12, 7],
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
   La Lisière du Verre (exploration et combat)
   --------------------------------------------------------- */
function lisiere() {
  const W = 34, H = 28, g = grid(W, H);
  blob(g, 16, 7.5, 15.5, 7.6, 51, 0.2);
  blob(g, 17, 20, 16, 8, 52, 0.2);
  blob(g, 16, 13.5, 6, 4, 53, 0.1);
  rim(g, 54, 0.45);
  scatter(g, '#', 0.03, 55); scatter(g, 'T', 0.07, 56);
  road(g, [[15, 0], [15, 4], [10, 4], [10, 9], [16, 9], [16, 18], [22, 18], [22, 22], [17, 22], [17, 27]]);
  road(g, [[10, 6], [5, 6], [5, 10]]);
  // haie de ronces cristallines : il faut une lame
  for (let x = 0; x < W; x++) if (g[13][x] !== ' ' && g[13][x] !== 'T' && g[12][x] !== ' ' && g[14][x] !== ' ') g[13][x] = 'r';
  for (let x = 0; x < W; x++) if (g[13][x] === 'r' && (g[12][x] === ' ' || g[14][x] === ' ')) g[13][x] = '#';
  [[24, 6], [25, 6], [26, 7], [8, 19], [9, 19], [27, 21]].forEach(([x, y]) => { if (g[y][x] !== ' ') g[y][x] = 'r'; });
  // cachette sud-ouest (roches fissurées)
  rect(g, 3, 20, 4, 4, '#'); rect(g, 4, 21, 2, 2, '.'); g[20][5] = 'c'; g[22][6] = 'c';
  // recoin est, gardé
  rect(g, 27, 15, 4, 4, '#'); rect(g, 28, 16, 2, 2, '.'); g[17][27] = '.'; g[17][26] = '.';
  g[27][17] = ','; g[26][17] = ',';
  // les emplacements d'objets et de créatures restent dégagés
  [[4, 21], [29, 17], [25, 3], [4, 8], [27, 8], [9, 23], [30, 23], [9, 6], [20, 5], [22, 10], [27, 4], [12, 17], [21, 21], [8, 16], [28, 22], [12, 22], [17, 24]].forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ') g[y][x] = '.'; });
  return {
    id: 'lisiere', region: 'lisiere', title: 'La Lisière du Verre', theme: 'foret', area: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0],
    props: [
      { t: 'ruin', x: 17, y: 25, w: 1, h: 1, name: 'Portique du Temple' },
      { t: 'sign', x: 13, y: 2, w: 1, h: 1, text: 'Lisière du Verre. Les ronces cristallines ne cèdent qu’à une vraie lame.' },
    ],
    chests: [
      { id: 'ch_lis_coeur', x: 4, y: 21, item: 'fragment_coeur', n: 1 },
      { id: 'ch_lis_bague', x: 29, y: 17, item: 'anneau_prisme', n: 1 },
      { id: 'ch_lis_ecus', x: 25, y: 3, ecus: 80 },
    ],
    pickups: [
      { t: 'item', id: 'givre1', item: 'givre_foret', x: 4, y: 8 },
      { t: 'item', id: 'givre2', item: 'givre_foret', x: 27, y: 8 },
      { t: 'item', id: 'givre3', item: 'givre_foret', x: 9, y: 23 },
      { t: 'item', id: 'givre4', item: 'givre_foret', x: 30, y: 23 },
    ],
    spawns: [
      { type: 'eclat', x: 9, y: 6, n: 2 },
      { type: 'eclat', x: 20, y: 5, n: 2 },
      { type: 'eclat', x: 22, y: 10, n: 1 },
      { type: 'lierre', x: 27, y: 4, n: 1 },
      { type: 'ronceux', x: 12, y: 17, n: 1 },
      { type: 'cerf', x: 21, y: 21, n: 1 },
      { type: 'cerf', x: 8, y: 16, n: 1 },
      { type: 'lierre', x: 28, y: 22, n: 1 },
      { type: 'eclat', x: 12, y: 22, n: 2 },
      { type: 'sentinelle', x: 17, y: 24, n: 1, elite: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le Temple de Verre (donjon)
   --------------------------------------------------------- */
function temple() {
  const W = 30, H = 29, g = grid(W, H, '#');
  const room = (x0, y0, x1, y1) => rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.');
  room(11, 1, 19, 7);   // hall
  room(1, 1, 9, 9);     // salle ouest (combat)
  room(21, 1, 28, 9);   // salle est (vitraux)
  room(1, 12, 8, 19);   // salle sud-ouest (clé)
  room(22, 12, 28, 19); // salle sud-est (trésor)
  room(10, 11, 20, 26); // arène du Gardien
  room(1, 23, 7, 27);   // chambre cachée
  g[0][15] = '.';
  g[4][10] = '.'; g[4][20] = '.';
  g[10][4] = 'x'; g[11][4] = 'x';       // sceau (salle nettoyée)
  g[10][25] = 'x'; g[11][25] = 'x';     // barrière de cristal (énigme de couleur)
  g[8][15] = 'x'; g[9][15] = 'x'; g[10][15] = 'x'; // porte verrouillée
  g[20][4] = 'c'; g[21][4] = 'c'; g[22][4] = 'c';
  [[3, 3], [7, 3], [3, 7], [7, 7], [13, 3], [17, 3], [12, 14], [18, 14], [12, 22], [18, 22], [24, 14], [26, 17]].forEach(([x, y]) => (g[y][x] = '#'));
  return {
    id: 'temple', region: 'temple', title: 'Le Temple de Verre', theme: 'temple', area: true, dungeon: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0],
    doors: [
      { gate: 'td_combat', look: 'seal', cells: [[4, 10], [4, 11]] },
      { gate: 'td_light', look: 'barrier', cells: [[25, 10], [25, 11]] },
      { gate: 'td_key', look: 'door', cells: [[15, 8], [15, 9], [15, 10]], key: 'cle_temple' },
    ],
    // salle des vitraux : une lanterne, un vitrail jaune, un vitrail cyan : une seule route donne le jaune au cristal
    ents: [
      { t: 'lantern', x: 22, y: 2, dir: 'S' },
      { t: 'mirror', x: 22, y: 7, state: 0, rot: true },
      { t: 'vitrail', x: 24, y: 7, color: 'y' },
      { t: 'mirror', x: 27, y: 7, state: 1, rot: true },
      { t: 'mirror', x: 27, y: 4, state: 0, rot: true },
      { t: 'receiver', x: 24, y: 4, color: 'y', gate: 'td_light' },
    ],
    props: [
      { t: 'brazier', x: 12, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 12, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 12, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 25, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 25, w: 1, h: 1 },
      { t: 'crystal', x: 2, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 27, y: 18, w: 1, h: 1 }, { t: 'crystal', x: 6, y: 26, w: 1, h: 1 },
    ],
    warp: { id: 'temple', x: 15, y: 5, name: 'Hall du Temple', needs: 'boss_verre' },
    chests: [
      { id: 'ch_cle_t', x: 5, y: 16, item: 'cle_temple', n: 1 },
      { id: 'ch_tresor_t', x: 25, y: 16, item: 'epee_verre', n: 1 },
      { id: 'ch_prisme', x: 15, y: 25, item: 'prisme_vert', n: 1, after: 'boss_verre' },
      { id: 'ch_cache_t', x: 4, y: 25, item: 'fragment_coeur', n: 1 },
      { id: 'ch_cache2_t', x: 2, y: 25, ecus: 200 },
    ],
    combatRooms: [{ gate: 'td_combat', rect: [1, 1, 9, 9] }],
    spawns: [
      { type: 'eclat', x: 5, y: 5, n: 4, room: 'td_combat' },
      { type: 'lierre', x: 2, y: 2, n: 1, room: 'td_combat' },
      { type: 'sentinelle', x: 5, y: 15, n: 1 },
      { type: 'ronceux', x: 25, y: 13, n: 1 },
      { type: 'gardien_verre', x: 15, y: 18, n: 1, boss: true },
    ],
  };
}

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
    id: 'auberge_f', region: 'bourg', title: 'Auberge de la Rosée', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [6, 7], entry: [6, 8], exit: { cell: [6, 8], to: 'vitrebourg', at: [5, 5] },
    props, npcs: [{ id: 'mousse', x: 3.5, y: 2.1, face: 'S', counter: true }],
  };
}

export function areasForet() { return { bourg: vitrebourg(), lisiere: lisiere(), temple: temple(), auberge: auberge() }; }
