/* =========================================================
   LUMEN — zones d'aventure de l'Île de l'Aube (village, lande,
   sanctuaire, intérieurs). Dessinées par code, de façon
   déterministe (mêmes graines = même monde).
   Repère local de chaque zone : x vers la droite, y vers le bas.

   Terrain : ' ' vide · '.' herbe · ',' chemin · '#' roche / mur
             'T' arbre · 'H' bâtiment · '~' eau · 'r' ronces (à couper)
             'c' roche fissurée (marteau) · 'x' porte (voir doors)
   ========================================================= */

const hash = (x, y, k = 0) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(k, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

function grid(w, h, ch = ' ') { return Array.from({ length: h }, () => Array(w).fill(ch)); }
const inside = (g, x, y) => y >= 0 && y < g.length && x >= 0 && x < g[0].length;
function blob(g, cx, cy, rx, ry, seed, rough = 0.16) {
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    if (d < 1 + (hash(x, y, seed) - 0.5) * rough * 2) g[y][x] = '.';
  }
}
/* Bord de l'île : roches et arbres sur les cases de terre qui touchent le vide */
function rim(g, seed, treeP = 0.3) {
  const out = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (g[y][x] === ' ') continue;
    const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inside(g, x + dx, y + dy) || g[y + dy][x + dx] === ' ');
    if (edge) out.push([x, y]);
  }
  out.forEach(([x, y]) => (g[y][x] = hash(x, y, seed) < treeP ? 'T' : '#'));
}
function rect(g, x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inside(g, i, j)) g[j][i] = ch; }
function disk(g, cx, cy, r, ch, onlyLand = true) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    if (!inside(g, x, y) || (x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
    if (onlyLand && g[y][x] === ' ') continue;
    g[y][x] = ch;
  }
}
/* Chemin en L entre deux points (horizontal puis vertical), largeur 1 ou 2 */
function road(g, pts, ch = ',', wide = 1) {
  for (let i = 0; i < pts.length - 1; i++) {
    let [x, y] = pts[i]; const [x1, y1] = pts[i + 1];
    const put = (a, b) => { for (let k = 0; k < wide; k++) { if (inside(g, a, b + k)) g[b + k][a] = ch; } };
    const putv = (a, b) => { for (let k = 0; k < wide; k++) { if (inside(g, a + k, b)) g[b][a + k] = ch; } };
    while (x !== x1) { put(x, y); x += Math.sign(x1 - x); }
    while (y !== y1) { putv(x, y); y += Math.sign(y1 - y); }
    put(x, y);
  }
}
function scatter(g, ch, p, seed, ok = (c) => c === '.') {
  for (let y = 1; y < g.length - 1; y++) for (let x = 1; x < g[0].length - 1; x++) if (ok(g[y][x], x, y) && hash(x, y, seed) < p) g[y][x] = ch;
}
const toRows = (g) => g.map((r) => r.join(''));

/* Accessibilité (pour vérifier qu'aucun PNJ, porte ou objet n'est enfermé) */
export function flood(rows, from, passable = (c) => '.,~'.includes(c) === false ? c === 'x' || c === '=' : c !== '~') {
  const seen = new Set([from.join(',')]), q = [from];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (seen.has(k) || ny < 0 || ny >= rows.length || nx < 0 || nx >= rows[ny].length) continue;
      const c = rows[ny][nx];
      if (!passable(c)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return seen;
}

/* ---------------------------------------------------------
   Havre-Aube : le village (point de départ)
   --------------------------------------------------------- */
function village() {
  const W = 30, H = 24, g = grid(W, H);
  blob(g, 14.5, 11.5, 16.2, 13.2, 11, 0.1);
  rim(g, 12, 0.42);
  // routes : grand-rue est-ouest (vers le pont du Rivage) et rue du sud (vers la Lande)
  road(g, [[1, 5], [29, 5]]);
  road(g, [[15, 5], [15, 23]]);
  disk(g, 15, 12, 3.4, ',');
  road(g, [[5, 4], [5, 5]]); road(g, [[23, 4], [23, 5]]);
  road(g, [[9, 9], [9, 5]]); road(g, [[9, 9], [12, 9]]);
  road(g, [[19, 10], [19, 9], [26, 9]]); road(g, [[18, 14], [24, 14]]);
  road(g, [[6, 15], [12, 15]]);
  road(g, [[18, 18], [23, 18], [23, 16]]);
  // bâtiments (cases 'H') — la vue 3D est dans props
  const props = [];
  const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h }, extra)); };
  house('auberge', 2, 1, 7, 3, { style: 'auberge', door: [5, 4], side: 'S', interior: 'auberge_in', name: 'Auberge du Lampion', sign: 'lampion' });
  house('orin', 20, 1, 6, 3, { style: 'pierre', door: [23, 4], side: 'S', interior: 'orin_in', name: 'Maison d’Orin', lock: 'cle_orin' });
  house('forge', 2, 8, 5, 3, { style: 'forge', door: [7, 9], side: 'E', name: 'Forge de Bran' });
  house('famille', 2, 16, 5, 3, { style: 'bois', door: [4, 15], side: 'N', name: 'Maison de Tobias', closed: 'La porte est fermée. On entend une bouilloire siffler.' });
  house('selene', 19, 19, 6, 3, { style: 'phare', door: [21, 18], side: 'N', name: 'Maison de Séléné', closed: 'Séléné passe ses journées sur la place. Sa porte est fermée.' });
  // place, fontaine au cristal de voyage
  rect(g, 14, 11, 3, 3, 'H'); props.push({ t: 'fountain', id: 'fontaine', x: 14, y: 11, w: 3, h: 3, warp: 'havre', name: 'Cristal de voyage' });
  // marché
  const stall = (id, x, y, color, name) => { rect(g, x, y, 2, 1, 'H'); props.push({ t: 'stall', id, x, y, w: 2, h: 1, color, name }); };
  stall('etal_ysolde', 18, 7, '#5fb37a', 'Apothicaire');
  stall('etal_pell', 23, 7, '#e58fb8', 'Tailleur');
  stall('etal_gaspard', 21, 13, '#c9965a', 'Comptoir des ressources');
  rect(g, 8, 10, 1, 1, 'H'); props.push({ t: 'anvil', id: 'enclume', x: 8, y: 10, w: 1, h: 1 });
  // étang et jardin
  disk(g, 9.5, 19.5, 1.9, '~'); disk(g, 11, 20, 1.2, '~');
  // recoin secret (pendentif de Tobias) derrière des ronces
  rect(g, 25, 19, 3, 3, '#'); g[20][26] = '.'; g[19][26] = 'r';
  road(g, [[26, 18], [23, 18]]);
  // lampadaires, caisses, bancs (décor bloquant 1 case)
  const deco = (t, x, y, extra) => { g[y][x] = 'H'; props.push(Object.assign({ t, x, y, w: 1, h: 1 }, extra)); };
  [[12, 6, 1], [18, 4, 2], [10, 4, 3], [26, 6, 4], [13, 16, 5], [17, 16, 6], [16, 21, 7]].forEach(([x, y, n]) => deco('lamp', x, y, { id: 'lampion' + n }));
  deco('crate', 25, 12); deco('barrel', 20, 13); deco('barrel', 6, 11); deco('crate', 7, 12);
  deco('bench', 12, 14); deco('bench', 18, 10);
  deco('well', 27, 15, { id: 'puits' });
  deco('sign', 16, 22, { text: 'Au sud : la Lande des Ronces. Prudence, la brume y rôde.' });
  deco('sign', 27, 4, { text: 'À l’est : le pont du Rivage et le Phare de l’Aube.' });
  // fleurs et arbres d'agrément
  scatter(g, 'T', 0.035, 13, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  const rows = toRows(g);
  return {
    id: 'havre', region: 'havre', title: 'Havre-Aube', theme: 'village', area: true, map: rows,
    spawn: [6, 6], entry: [6, 6],
    props,
    npcs: [
      { id: 'selene', x: 12.6, y: 9.4, face: 'S' },
      { id: 'ysolde', x: 18.5, y: 6.1, face: 'S', counter: true },
      { id: 'pell', x: 23.5, y: 6.1, face: 'S', counter: true },
      { id: 'gaspard', x: 21.5, y: 12.1, face: 'S', counter: true },
      { id: 'bran', x: 9.2, y: 11, face: 'S' },
      { id: 'tobias', x: 9, y: 16.6, wander: 2.4 },
      { id: 'lison', x: 25.2, y: 4.2, face: 'S' },
      { id: 'mira', x: 17.6, y: 15.6, wander: 1.6 },
      { id: 'aldo', x: 16.6, y: 21.6, face: 'S' },
    ],
    pickups: [{ t: 'item', id: 'pendentif', item: 'pendentif', x: 26, y: 20 }],
  };
}

/* ---------------------------------------------------------
   La Lande des Ronces (exploration et combat)
   --------------------------------------------------------- */
function lande() {
  const W = 34, H = 28, g = grid(W, H);
  blob(g, 16, 7.5, 15.5, 7.6, 21, 0.2);
  blob(g, 17, 20, 16, 8, 22, 0.2);
  blob(g, 16, 13.5, 6, 4, 23, 0.1);
  rim(g, 24, 0.28);
  scatter(g, '#', 0.035, 25); scatter(g, 'T', 0.03, 26);
  // chemin principal
  road(g, [[15, 0], [15, 4], [10, 4], [10, 9], [16, 9], [16, 18], [22, 18], [22, 22], [17, 22], [17, 27]]);
  road(g, [[10, 6], [5, 6], [5, 10]]);
  // haie de ronces entre les deux moitiés de la lande : il faut une lame
  for (let x = 0; x < W; x++) if (g[13][x] !== ' ' && g[13][x] !== 'T' && g[12][x] !== ' ' && g[14][x] !== ' ') g[13][x] = 'r';
  for (let x = 0; x < W; x++) if (g[13][x] === 'r' && (g[12][x] === ' ' || g[14][x] === ' ')) g[13][x] = '#';
  // fourrés de ronces isolés (fibres) et roches fissurées (cachette)
  [[24, 6], [25, 6], [26, 7], [8, 19], [9, 19], [27, 21]].forEach(([x, y]) => { if (g[y][x] !== ' ') g[y][x] = 'r'; });
  // cachette sud-ouest fermée par des roches fissurées (marteau)
  rect(g, 3, 20, 4, 4, '#'); rect(g, 4, 21, 2, 2, '.'); g[20][5] = 'c'; g[22][6] = 'c';
  // recoin du marteau de Bran (est), gardé
  rect(g, 27, 15, 4, 4, '#'); rect(g, 28, 16, 2, 2, '.'); g[17][27] = '.'; g[17][26] = '.';
  // entrée du sanctuaire (arche)
  g[27][17] = ','; g[26][17] = ',';
  const rows = toRows(g);
  return {
    id: 'lande', region: 'lande', title: 'La Lande des Ronces', theme: 'lande', area: true, map: rows,
    spawn: [15, 1], entry: [15, 0],
    props: [
      { t: 'ruin', x: 17, y: 25, w: 1, h: 1, name: 'Arche du Sanctuaire' },
      { t: 'sign', x: 13, y: 2, w: 1, h: 1, text: 'Lande des Ronces. Les ronces de la haie ne cèdent qu’à une vraie lame.' },
    ],
    chests: [
      { id: 'ch_marteau_bran', x: 29, y: 17, item: 'marteau_bran', n: 1 },
      { id: 'ch_lande_coeur', x: 4, y: 21, item: 'fragment_coeur', n: 1 },
      { id: 'ch_lande_ecus', x: 25, y: 3, ecus: 60 },
    ],
    pickups: [
      { t: 'item', id: 'fleur1', item: 'fleur_miel', x: 4, y: 8 },
      { t: 'item', id: 'fleur2', item: 'fleur_miel', x: 27, y: 8 },
      { t: 'item', id: 'fleur3', item: 'fleur_miel', x: 9, y: 23 },
      { t: 'item', id: 'fleur4', item: 'fleur_miel', x: 30, y: 23 },
    ],
    spawns: [
      { type: 'brumelin', x: 9, y: 6, n: 2 },
      { type: 'brumelin', x: 20, y: 5, n: 2 },
      { type: 'brumelin', x: 22, y: 10, n: 1 },
      { type: 'lanceur', x: 27, y: 4, n: 1 },
      { type: 'ronceux', x: 12, y: 17, n: 1 },
      { type: 'ronceux', x: 26, y: 17, n: 1 },
      { type: 'sanglier', x: 21, y: 21, n: 1 },
      { type: 'sanglier', x: 8, y: 16, n: 1 },
      { type: 'lanceur', x: 28, y: 22, n: 1 },
      { type: 'brumelin', x: 12, y: 22, n: 2 },
      { type: 'gardien', x: 17, y: 24, n: 1, elite: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le Sanctuaire de Brume (donjon)
   --------------------------------------------------------- */
function sanctuaire() {
  const W = 30, H = 29, g = grid(W, H, '#');
  const room = (x0, y0, x1, y1) => rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.');
  room(11, 1, 19, 7);   // hall
  room(1, 1, 9, 9);     // salle ouest (combat)
  room(21, 1, 28, 9);   // salle est (lumière)
  room(1, 12, 8, 19);   // salle sud-ouest (clé)
  room(22, 12, 28, 19); // salle sud-est (trésor)
  room(10, 11, 20, 26); // arène du Colosse
  room(1, 23, 7, 27);   // chambre cachée
  g[0][15] = '.';                       // entrée
  g[4][10] = '.'; g[4][20] = '.';       // passages du hall
  g[10][4] = 'x'; g[11][4] = 'x';       // porte scellée (salle nettoyée)
  g[10][25] = 'x'; g[11][25] = 'x';     // barrière de cristal (énigme)
  g[8][15] = 'x'; g[9][15] = 'x'; g[10][15] = 'x'; // porte verrouillée (petite clé)
  g[20][4] = 'c'; g[21][4] = 'c'; g[22][4] = 'c'; // mur fissuré (marteau)
  // piliers
  [[3, 3], [7, 3], [3, 7], [7, 7], [13, 3], [17, 3], [12, 14], [18, 14], [12, 22], [18, 22], [24, 14], [26, 17]].forEach(([x, y]) => (g[y][x] = '#'));
  const rows = toRows(g);
  return {
    id: 'sanctuaire', region: 'sanctuaire', title: 'Le Sanctuaire de Brume', theme: 'sanctuaire', area: true, dungeon: true, map: rows,
    spawn: [15, 1], entry: [15, 0],
    doors: [
      { gate: 'sd_combat', look: 'seal', cells: [[4, 10], [4, 11]] },
      { gate: 'sd_light', look: 'barrier', cells: [[25, 10], [25, 11]] },
      { gate: 'sd_key', look: 'door', cells: [[15, 8], [15, 9], [15, 10]], key: 'cle_sanctuaire' },
    ],
    ents: [
      { t: 'lantern', x: 22, y: 2, dir: 'S' },
      { t: 'mirror', x: 22, y: 7, state: 0, rot: true },
      { t: 'mirror', x: 27, y: 7, state: 1, rot: true },
      { t: 'mirror', x: 24, y: 4, state: 0, rot: true },
      { t: 'receiver', x: 27, y: 2, color: 'w', gate: 'sd_light' },
    ],
    props: [
      { t: 'brazier', x: 12, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 12, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 12, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 25, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 25, w: 1, h: 1 },
      { t: 'crystal', x: 2, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 27, y: 18, w: 1, h: 1 }, { t: 'crystal', x: 6, y: 26, w: 1, h: 1 },
    ],
    warp: { id: 'sanctuaire', x: 15, y: 5, name: 'Hall du Sanctuaire', needs: 'boss_colosse' },
    chests: [
      { id: 'ch_cle', x: 5, y: 16, item: 'cle_sanctuaire', n: 1 },
      { id: 'ch_tresor', x: 25, y: 16, item: 'anneau_vie', n: 1 },
      { id: 'ch_marteau', x: 15, y: 25, item: 'marteau', n: 1, after: 'boss_colosse' },
      { id: 'ch_cache', x: 4, y: 25, item: 'fragment_coeur', n: 1 },
      { id: 'ch_cache2', x: 2, y: 25, ecus: 150 },
    ],
    combatRooms: [{ gate: 'sd_combat', rect: [1, 1, 9, 9] }],
    spawns: [
      { type: 'brumelin', x: 5, y: 5, n: 4, room: 'sd_combat' },
      { type: 'lanceur', x: 2, y: 2, n: 1, room: 'sd_combat' },
      { type: 'gardien', x: 5, y: 15, n: 1 },
      { type: 'ronceux', x: 25, y: 13, n: 1 },
      { type: 'colosse', x: 15, y: 18, n: 1, boss: true },
    ],
  };
}

/* ---------------------------------------------------------
   Intérieurs (posés loin de l'île ; le brouillard masque l'extérieur)
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
    id: 'auberge_in', region: 'havre', title: 'Auberge du Lampion', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [6, 7], entry: [6, 8], exit: { cell: [6, 8], to: 'havre', at: [5, 5] },
    props, npcs: [{ id: 'maelle', x: 3.5, y: 2.1, face: 'S', counter: true }],
  };
}
function orin() {
  const rows = [
    '###########',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........#',
    '#####.#####',
  ];
  const g = rows.map((r) => r.split(''));
  const props = [];
  const put = (t, x, y, w = 1, h = 1, extra = {}) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t, x, y, w, h }, extra)); };
  put('shelf', 1, 1, 3, 1); put('shelf', 7, 1, 3, 1);
  put('desk', 4, 3, 3, 1, { read: 'carte_orin', name: 'Bureau d’Orin' });
  put('globe', 8, 4); put('telescope', 2, 5);
  return {
    id: 'orin_in', region: 'havre', title: 'Maison d’Orin', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [5, 6], entry: [5, 7], exit: { cell: [5, 7], to: 'havre', at: [23, 5] },
    props,
    chests: [{ id: 'ch_orin', x: 8, y: 2, item: 'amulette_lume', n: 1 }],
    pickups: [{ t: 'page', id: 'page_orin4', page: 'orin4', x: 5, y: 5 }],
  };
}

export function areas() { return { village: village(), lande: lande(), sanctuaire: sanctuaire(), auberge: auberge(), orin: orin() }; }
