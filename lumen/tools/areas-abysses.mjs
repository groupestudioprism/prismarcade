/* =========================================================
   LUMEN — zones d’aventure des Abysses Miroirs (île 4) : la Grève (village), l’auberge,
   les Récifs (exploration et combat), les Grottes (donjon et boss), les Îlots du Reflet (plané).
   Mêmes conventions que tools/areas.mjs et tools/areas-foret.mjs.
   Les salles d’énigmes (lac, phare) sont produites par tools/build-abysses.mjs.
   ========================================================= */
import { grid, blob, rim, rect, disk, road, scatter, toRows, flood } from './areas.mjs';

/* relie à la zone principale tout point d’intérêt resté isolé (plus court chemin, en creusant le sol) */
function connect(g, from, pts) {
  const pass = (c) => c === '.' || c === ',' || c === 'c';
  for (const [px, py] of pts) {
    const seen = flood(g.map((r) => r.join('')), from, pass);
    if (seen.has(px + ',' + py)) continue;
    const prev = new Map([[px + ',' + py, null]]), q = [[px, py]];
    let hit = null;
    while (q.length && !hit) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (nx < 1 || ny < 1 || ny >= g.length - 1 || nx >= g[0].length - 1 || prev.has(k)) continue;
        prev.set(k, x + ',' + y);
        if (seen.has(k)) { hit = k; break; }
        q.push([nx, ny]);
      }
    }
    for (let k = prev.get(hit); k; k = prev.get(k)) { const [x, y] = k.split(',').map(Number); if (g[y][x] !== 'c') g[y][x] = g[y][x] === '~' || g[y][x] === ' ' || g[y][x] === 'T' || g[y][x] === '#' ? '.' : g[y][x]; }
  }
}

/* ---------------------------------------------------------
   La Grève : le village de pêcheurs et de plongeurs
   --------------------------------------------------------- */
function greve() {
  const W = 30, H = 24, g = grid(W, H);
  blob(g, 14.5, 11.5, 16.2, 13.2, 61, 0.1);
  rim(g, 62, 0.3);
  road(g, [[1, 5], [29, 5]]);          // grand-rue vers le lac souterrain (est)
  road(g, [[15, 5], [15, 23]]);        // sentier vers les Récifs (sud)
  disk(g, 15, 12, 3.4, ',');
  road(g, [[6, 4], [6, 5]]); road(g, [[24, 4], [24, 5]]);
  road(g, [[5, 7], [5, 5]]); road(g, [[24, 7], [24, 5]]);
  road(g, [[10, 6], [10, 5]]); road(g, [[19, 6], [19, 5]]);
  road(g, [[4, 15], [4, 13], [12, 13]]); road(g, [[18, 14], [23, 14]]); road(g, [[15, 18], [21, 18]]);
  const props = [];
  const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h }, extra)); };
  house('auberge_a', 3, 1, 7, 3, { style: 'auberge', door: [6, 4], side: 'S', interior: 'auberge_a', name: 'Auberge du Coquillage', sign: 'lampion' });
  house('forge_a', 21, 1, 6, 3, { style: 'forge', door: [24, 4], side: 'S', name: 'Forge de Varech' });
  house('maree_h', 2, 8, 6, 3, { style: 'phare', door: [5, 7], side: 'N', name: 'Maison de Marée', closed: 'Marée reçoit sur la place, près du cristal. Sa porte est fermée.' });
  house('isoard_h', 22, 8, 5, 3, { style: 'pierre', door: [24, 7], side: 'N', name: 'Maison d’Isoard', closed: 'Des cartes sèchent derrière la vitre. La porte est fermée à clé.' });
  house('ecume_h', 2, 16, 5, 3, { style: 'bois', door: [4, 15], side: 'N', name: 'Maison d’Écume', closed: 'Une odeur de poisson fumé s’échappe de la cheminée. La porte est fermée.' });
  rect(g, 14, 11, 3, 3, 'H'); props.push({ t: 'fountain', id: 'fontaine_a', x: 14, y: 11, w: 3, h: 3, warp: 'greve', name: 'Cristal de voyage' });
  const stall = (id, x, y, color, name) => { rect(g, x, y, 2, 1, 'H'); props.push({ t: 'stall', id, x, y, w: 2, h: 1, color, name }); };
  stall('etal_corail', 10, 7, '#ff8f7a', 'Corail, apothicaire');
  stall('etal_nacre', 19, 7, '#8fd8e8', 'Nacre, marchande');
  rect(g, 27, 3, 1, 1, 'H'); props.push({ t: 'anvil', id: 'enclume_a', x: 27, y: 3, w: 1, h: 1 });
  disk(g, 8, 20, 2.3, '~'); disk(g, 24, 20, 3.1, '~'); disk(g, 26, 17, 1.5, '~');
  const deco = (t, x, y, extra) => { g[y][x] = 'H'; props.push(Object.assign({ t, x, y, w: 1, h: 1 }, extra)); };
  [[12, 6, 1], [17, 4, 2], [8, 4, 3], [27, 6, 4], [13, 16, 5], [17, 16, 6], [16, 21, 7]].forEach(([x, y, n]) => deco('lamp', x, y, { id: 'lampion_a' + n }));
  deco('crate', 21, 17); deco('barrel', 22, 16); deco('barrel', 9, 12); deco('crate', 8, 13);
  deco('bench', 19, 14); deco('bench', 12, 15);
  deco('sign', 16, 22, { text: 'Au sud : les Récifs, puis plus loin les Îlots du Reflet. Les crabes-lanternes ne plaisantent pas.' });
  deco('sign', 28, 6, { text: 'À l’est : le lac souterrain. Là-bas, l’eau renvoie la lumière dans le sens des flèches gravées.' });
  scatter(g, 'T', 0.05, 63, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  return {
    id: 'greve', region: 'greve', title: 'La Grève', theme: 'greve', area: true, map: toRows(g),
    spawn: [12, 7], entry: [12, 7],
    ents: [{ t: 'start', x: 12, y: 7 }],
    props,
    npcs: [
      { id: 'maree', x: 12.4, y: 9.4, face: 'S' },
      { id: 'corail', x: 10.5, y: 6.1, face: 'S', counter: true },
      { id: 'nacre', x: 19.5, y: 6.1, face: 'S', counter: true },
      { id: 'varech', x: 27.5, y: 4.6, face: 'W' },
      { id: 'isoard', x: 25.4, y: 6.4, face: 'S' },
      { id: 'ecume', x: 11.4, y: 19.4, wander: 1.4 },
      { id: 'petoncle', x: 12.2, y: 16.6, wander: 2.4 },
      { id: 'murene', x: 18.6, y: 14.9, face: 'E' },
      { id: 'lagon', x: 21.6, y: 18.6, face: 'E' },
    ],
    pickups: [],
  };
}

/* ---------------------------------------------------------
   Les Récifs (exploration et combat)
   --------------------------------------------------------- */
function recifs() {
  const W = 36, H = 30, g = grid(W, H);
  blob(g, 17, 7.5, 15.5, 7.6, 71, 0.2);
  blob(g, 18, 21.5, 16, 7.5, 72, 0.2);
  blob(g, 17, 14.5, 5, 4.4, 73, 0.1);
  rim(g, 74, 0.35);
  scatter(g, '#', 0.03, 75); scatter(g, 'T', 0.07, 76);
  road(g, [[15, 0], [15, 4], [10, 4], [10, 9], [16, 9], [16, 18], [22, 18], [22, 22], [17, 22], [17, 29]]);
  road(g, [[10, 6], [5, 6], [5, 10]]);
  disk(g, 27, 7, 2.2, '~'); disk(g, 7, 23, 2.2, '~'); disk(g, 28, 24, 1.8, '~');
  // roches fissurées : deux cachettes (marteau)
  rect(g, 19, 9, 4, 4, '#'); rect(g, 20, 10, 2, 2, '.'); g[9][20] = 'c';
  rect(g, 5, 18, 4, 4, '#'); rect(g, 6, 19, 2, 2, '.'); g[20][8] = 'c';
  // les emplacements d’objets et de créatures restent dégagés
  [[26, 3], [4, 8], [28, 11], [9, 25], [31, 26], [9, 6], [20, 5], [24, 11], [12, 18], [21, 24], [8, 16], [29, 22], [13, 24], [18, 25], [11, 26]].forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ' || g[y][x] === '~') g[y][x] = '.'; });
  g[29][17] = ','; g[28][17] = ',';
  connect(g, [15, 1], [[20, 10], [6, 19], [26, 3], [4, 8], [28, 11], [9, 25], [31, 26], [9, 6], [20, 5], [24, 11], [12, 18], [21, 24], [8, 16], [29, 22], [13, 24], [18, 25], [11, 26], [17, 28]]);
  return {
    id: 'recifs', region: 'recifs', title: 'Les Récifs', theme: 'recifs', area: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0], entryGate: 'b_recifs',
    props: [
      { t: 'ruin', x: 17, y: 27, w: 1, h: 1, name: 'Arche des Îlots' },
      { t: 'sign', x: 13, y: 2, w: 1, h: 1, text: 'Les Récifs. Les crabes-lanternes se plaisent entre les coraux ; les anguilles d’ombre, dans les flaques. Les roches fissurées cachent parfois des trésors.' },
      { t: 'sign', x: 18, y: 27, w: 1, h: 1, text: 'Les Îlots du Reflet, au sud : seul celui qui sait planer peut en franchir les vides.' },
    ],
    chests: [
      { id: 'ch_rec_coeur', x: 20, y: 10, item: 'fragment_coeur', n: 1 },
      { id: 'ch_rec_anneau', x: 6, y: 19, item: 'anneau_reflet', n: 1 },
      { id: 'ch_rec_ecus', x: 26, y: 3, ecus: 90 },
      { id: 'ch_rec_potion', x: 11, y: 26, item: 'grande_potion', n: 2 },
    ],
    pickups: [
      { t: 'item', id: 'coq1', item: 'coquille_nacre', x: 4, y: 8 },
      { t: 'item', id: 'coq2', item: 'coquille_nacre', x: 28, y: 11 },
      { t: 'item', id: 'coq3', item: 'coquille_nacre', x: 9, y: 25 },
      { t: 'item', id: 'coq4', item: 'coquille_nacre', x: 31, y: 26 },
      { t: 'item', id: 'filet1', item: 'maille_filet', x: 9, y: 6 },
      { t: 'item', id: 'filet2', item: 'maille_filet', x: 24, y: 11 },
      { t: 'item', id: 'filet3', item: 'maille_filet', x: 13, y: 24 },
      { t: 'item', id: 'perle_m', item: 'perle_murene', x: 29, y: 22 },
      { t: 'item', id: 'corail1', item: 'corail_rouge', x: 21, y: 24 },
      { t: 'item', id: 'corail2', item: 'corail_rouge', x: 8, y: 16 },
    ],
    spawns: [
      { type: 'crabe_lanterne', x: 9, y: 6, n: 2 },
      { type: 'meduse_reflet', x: 20, y: 5, n: 1 },
      { type: 'anguille_ombre', x: 24, y: 11, n: 2 },
      { type: 'crabe_lanterne', x: 12, y: 18, n: 1 },
      { type: 'meduse_reflet', x: 8, y: 16, n: 1 },
      { type: 'anguille_ombre', x: 21, y: 24, n: 2 },
      { type: 'crabe_lanterne', x: 18, y: 25, n: 1 },
      { type: 'sentinelle_corail', x: 29, y: 22, n: 1, elite: true },
    ],
  };
}

/* ---------------------------------------------------------
   Les Grottes Miroirs (donjon) : vestibule, hall, salle des Écumes (combat),
   salle de la clé, salle des Marées (eau miroir, vannes, orbe), arène du Gardien, réserve secrète.
   La salle des Marées est insérée par build-abysses.mjs (rectangle MAREES).
   --------------------------------------------------------- */
export const MAREES = { x: 9, y: 13, w: 13, h: 11 };   // anneau de murs compris ; intérieur 11 × 9
export function grottes(marees) {
  const W = 34, H = 34, g = grid(W, H, '#');
  const room = (x0, y0, x1, y1) => rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.');
  room(0, 5, 9, 5);                 // couloir d’entrée
  room(10, 1, 20, 9);               // hall
  room(21, 5, 22, 5);               // passage du hall vers la salle des Écumes
  room(23, 1, 32, 9);               // salle des Écumes (combat)
  g[10][27] = 'x'; g[11][27] = 'x'; // sceau (salle nettoyée)
  room(23, 12, 32, 19);             // salle de la clé
  g[12][27] = '.';
  g[10][15] = 'x'; g[11][15] = 'x'; g[12][15] = 'x';   // porte verrouillée (clé des Grottes)
  // salle des Marées : fournie par l’énigme
  marees.rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) g[MAREES.y + j][MAREES.x + i] = row[i]; });
  g[24][15] = 'x'; g[25][15] = 'x'; // barrière de cristal (énigme des Marées)
  room(12, 26, 32, 32);             // arène du Gardien
  g[29][33] = 'x';                  // sortie de l’arène (s’ouvre à la mort du Gardien)
  room(1, 8, 8, 13);                // réserve secrète
  g[6][4] = 'c'; g[7][4] = 'c';
  [[12, 3], [18, 3], [12, 7], [18, 7], [25, 3], [30, 3], [25, 7], [30, 7], [26, 15], [29, 17], [16, 28], [22, 28], [16, 31], [22, 31], [28, 28], [28, 31]].forEach(([x, y]) => (g[y][x] = '#'));
  const E = (x, y, dx = 0, dy = 0) => ({ x: x + dx, y: y + dy });
  void E;
  return {
    id: 'grottes', region: 'grottes', title: 'Les Grottes Miroirs', theme: 'grotte', area: true, dungeon: true, map: toRows(g),
    spawn: [1, 5], entry: [0, 5], entryGate: 'la3',
    doors: [
      { gate: 'gr_combat', look: 'seal', cells: [[27, 10], [27, 11]] },
      { gate: 'gr_key', look: 'door', cells: [[15, 10], [15, 11], [15, 12]], key: 'cle_grottes', hint: 'Une porte de corail scellée. Sa serrure a la forme d’une petite clé : elle doit être quelque part dans les Grottes, du côté de la salle des Écumes.', use: 'Déverrouiller la porte de corail' },
      { gate: 'gr_eau', look: 'barrier', cells: [[15, 24], [15, 25]] },
      { gate: 'gr_arene', look: 'seal', cells: [[33, 29]] },
    ],
    ents: marees.ents.map((e) => Object.assign({}, e, { x: e.x + MAREES.x, y: e.y + MAREES.y })),
    props: [
      { t: 'brazier', x: 12, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 24, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 31, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 13, y: 26, w: 1, h: 1 }, { t: 'brazier', x: 31, y: 26, w: 1, h: 1 },
      { t: 'crystal', x: 24, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 31, y: 18, w: 1, h: 1 }, { t: 'crystal', x: 2, y: 12, w: 1, h: 1 },
      { t: 'sign', x: 8, y: 4, w: 1, h: 1, text: 'Les Grottes Miroirs. Ici, l’eau n’est pas un obstacle mais un miroir : elle renvoie la lumière dans le sens de ses flèches. Tourne les vannes pour la faire monter ou descendre.' },
    ],
    warp: { id: 'grottes', x: 15, y: 5, name: 'Hall des Grottes', needs: 'boss_marees' },
    chests: [
      { id: 'ch_cle_g', x: 25, y: 16, item: 'cle_grottes', n: 1 },
      { id: 'ch_tresor_g', x: 30, y: 14, item: 'lame_ecume', n: 1 },
      { id: 'ch_hall_g', x: 17, y: 8, ecus: 70 },
      { id: 'ch_perle_g', x: 22, y: 29, item: 'perle_miroir', n: 1, after: 'boss_marees' },
      { id: 'ch_cache_g', x: 4, y: 11, item: 'fragment_coeur', n: 1 },
      { id: 'ch_cache2_g', x: 6, y: 11, ecus: 220 },
    ],
    combatRooms: [{ gate: 'gr_combat', rect: [23, 1, 32, 9] }, { gate: 'gr_arene', rect: [12, 26, 32, 32] }],
    spawns: [
      { type: 'crabe_lanterne', x: 27, y: 5, n: 2, room: 'gr_combat' },
      { type: 'meduse_reflet', x: 29, y: 3, n: 1, room: 'gr_combat' },
      { type: 'anguille_ombre', x: 25, y: 7, n: 3, room: 'gr_combat' },
      { type: 'sentinelle_corail', x: 15, y: 6, n: 1 },
      { type: 'crabe_lanterne', x: 28, y: 16, n: 1 },
      { type: 'gardien_marees', x: 22, y: 29, n: 1, boss: true, room: 'gr_arene' },
    ],
  };
}

/* ---------------------------------------------------------
   Auberge du Coquillage (intérieur)
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
  put('counter', 7, 3, 4, 1);
  put('fireplace', 2, 1, 2, 1);
  put('bed', 10, 1, 2, 2, { rest: true, name: 'Lit du Coquillage' });
  put('table', 3, 5, 1, 1); put('table', 8, 6, 1, 1);
  put('barrel', 1, 3); put('barrel', 1, 4); put('shelf', 6, 1, 3, 1);
  return {
    id: 'auberge_a', region: 'greve', title: 'Auberge du Coquillage', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [6, 7], entry: [6, 8], exit: { cell: [6, 8], to: 'greve', at: [6, 5] },
    props, npcs: [{ id: 'sargasse', x: 8.5, y: 2.2, face: 'S', counter: true }],
  };
}

/* ---------------------------------------------------------
   Les Îlots du Reflet (après le phare : plané)
   Trois plates-formes séparées par des vides de 5 cases ; des corniches se répondent de part et d’autre.
   --------------------------------------------------------- */
function ilots() {
  const W = 44, H = 14, g = grid(W, H, ' ');
  const plate = (x0, y0, x1, y1) => { rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.'); for (let x = x0; x <= x1; x++) { g[y0][x] = g[y0][x] === '.' ? '#' : g[y0][x]; g[y1][x] = '#'; } for (let y = y0; y <= y1; y++) { g[y][x0] = '#'; g[y][x1] = '#'; } };
  plate(6, 0, 17, 10);   // P1 : arrivée
  plate(22, 1, 33, 11);  // P2
  plate(38, 3, 43, 9);   // P3
  g[0][14] = '.';                       // arrivée par le nord (Récifs)
  g[5][17] = ' '; g[5][22] = ' ';       // les bords en regard s’ouvrent sur le vide
  g[5][33] = ' '; g[5][38] = ' ';
  [[8, 2], [15, 2], [8, 8], [15, 8], [25, 3], [31, 3], [25, 9], [31, 9], [41, 4], [41, 8]].forEach(([x, y]) => (g[y][x] = 'T'));
  return {
    id: 'ilots', region: 'ilots', title: 'Les Îlots du Reflet', theme: 'greve', area: true, respawn: true, map: toRows(g),
    spawn: [14, 2], entry: [14, 0], entryGate: 'b_ilots',
    ents: [
      { t: 'ledge', x: 16, y: 5, id: 'ledge_a1', dir: 'E' }, { t: 'ledge', x: 23, y: 5, id: 'ledge_a2', dir: 'W' },
      { t: 'ledge', x: 32, y: 5, id: 'ledge_b1', dir: 'E' }, { t: 'ledge', x: 39, y: 5, id: 'ledge_b2', dir: 'W' },
    ],
    hint: 'Tiens-toi sur une corniche, tourné vers l’autre île, et appuie sur E : Lyra plane de l’autre côté du vide.',
    props: [
      { t: 'sign', x: 13, y: 4, w: 1, h: 1, text: 'Les Îlots du Reflet. Les corniches de pierre se répondent d’un îlot à l’autre : plane de l’une à l’autre, d’un bord à l’autre du vide.' },
      { t: 'crystal', x: 9, y: 5, w: 1, h: 1 }, { t: 'crystal', x: 29, y: 9, w: 1, h: 1 },
    ],
    chests: [
      { id: 'ch_ilot_coeur', x: 30, y: 9, item: 'fragment_coeur', n: 1 },
      { id: 'ch_ilot_amulette', x: 42, y: 6, item: 'amulette_reflet', n: 1 },
      { id: 'ch_ilot_ecus', x: 9, y: 9, ecus: 250 },
    ],
    pickups: [
      { t: 'item', id: 'etoile1', item: 'etoile_mer', x: 9, y: 3 },
      { t: 'item', id: 'etoile2', item: 'etoile_mer', x: 27, y: 9 },
      { t: 'item', id: 'etoile3', item: 'etoile_mer', x: 41, y: 6 },
      { t: 'page', id: 'pg_ilot', page: 'orin8', x: 42, y: 4 },
    ],
    spawns: [
      { type: 'meduse_reflet', x: 11, y: 7, n: 2 },
      { type: 'anguille_ombre', x: 28, y: 6, n: 2 },
    ],
    warp: { id: 'ilots', x: 9, y: 5, name: 'Cristal des Îlots' },
  };
}

export function areasAbysses(marees) { return { greve: greve(), recifs: recifs(), grottes: grottes(marees), auberge: auberge(), ilots: ilots() }; }
