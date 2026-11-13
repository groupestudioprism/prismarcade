/* =========================================================
   LUMEN — zones d'aventure du Désert des Échos (Acte III) :
   Cité des Échos, auberge, oasis, dunes, Temple enseveli, vestibule du phare.
   Mêmes conventions que tools/areas.mjs et areas-foret.mjs.
   Terrain : '.' sable · ',' piste · '#' roche / mur de grès · 'T' palmier ou cactus · 'H' bâtiment ou décor
             '~' eau · 'r' ronces sèches (lame) · 'c' roche fissurée (marteau) · 'x' porte
   ========================================================= */
import { grid, blob, rim, rect, disk, road, scatter, toRows } from './areas.mjs';

/* ---------------------------------------------------------
   La Cité des Échos : village de grès, point d'arrivée
   --------------------------------------------------------- */
function cite() {
  const W = 30, H = 24, g = grid(W, H);
  blob(g, 14.5, 11.5, 16.2, 13.2, 71, 0.1);
  rim(g, 72, 0.3);
  road(g, [[1, 5], [29, 5]]);          // grand-rue vers les salles de sable (est)
  road(g, [[15, 5], [15, 23]]);        // piste vers l’Oasis (sud)
  disk(g, 15, 12, 3.4, ',');
  road(g, [[5, 4], [5, 5]]); road(g, [[24, 4], [24, 5]]);
  road(g, [[9, 9], [9, 5]]); road(g, [[9, 9], [12, 9]]);
  road(g, [[19, 10], [19, 9], [26, 9]]); road(g, [[18, 14], [24, 14]]);
  road(g, [[6, 15], [12, 15]]);
  const props = [];
  const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h, style: 'sable' }, extra)); };
  house('auberge_d', 2, 1, 7, 3, { style: 'sable', door: [5, 4], side: 'S', interior: 'auberge_d', name: 'Auberge de l’Oasis', sign: 'lampion' });
  house('oumi_h', 21, 1, 6, 3, { door: [24, 4], side: 'S', name: 'Maison d’Oumi', closed: 'Oumi reçoit sur la place, à l’ombre de la fontaine. Sa porte est fermée.' });
  house('forge_d', 2, 8, 5, 3, { style: 'forge', door: [7, 9], side: 'E', name: 'Forge de Rafik' });
  house('leila_h', 2, 16, 5, 3, { door: [4, 15], side: 'N', name: 'Atelier de Leïla', closed: 'La porte est fermée. On entend tourner un tour de potier.' });
  house('idris_h', 19, 19, 6, 3, { door: [21, 18], side: 'N', name: 'Maison d’Idris', closed: 'Idris est toujours dehors, la tête dans ses tablettes. Sa porte est fermée.' });
  rect(g, 14, 11, 3, 3, 'H'); props.push({ t: 'fountain', id: 'fontaine_d', x: 14, y: 11, w: 3, h: 3, warp: 'cite', name: 'Cristal de voyage' });
  const stall = (id, x, y, color, name) => { rect(g, x, y, 2, 1, 'H'); props.push({ t: 'stall', id, x, y, w: 2, h: 1, color, name }); };
  stall('etal_djamila', 18, 7, '#5fb37a', 'Djamila, apothicaire');
  stall('etal_kassim', 23, 7, '#d98a3a', 'Caravane de Kassim');
  rect(g, 8, 10, 1, 1, 'H'); props.push({ t: 'anvil', id: 'enclume_d', x: 8, y: 10, w: 1, h: 1 });
  disk(g, 9.5, 19.5, 1.9, '~'); disk(g, 11, 20, 1.2, '~');   // bassin
  const deco = (t, x, y, extra) => { g[y][x] = 'H'; props.push(Object.assign({ t, x, y, w: 1, h: 1 }, extra)); };
  [[12, 6, 1], [18, 4, 2], [10, 4, 3], [26, 6, 4], [13, 16, 5], [17, 16, 6], [16, 21, 7]].forEach(([x, y, n]) => deco('lamp', x, y, { id: 'lampion_d' + n }));
  deco('crate', 25, 12); deco('barrel', 20, 13); deco('barrel', 6, 11); deco('crate', 7, 12);
  deco('bench', 12, 14); deco('bench', 18, 10);
  deco('pot', 4, 14, { color: '#c9783a' }); deco('pot', 12, 22, { color: '#b8602a' }); deco('pot', 26, 14, { color: '#d4883a' });
  deco('stele', 27, 6, { id: 'stele_cite' });
  deco('sign', 16, 22, { text: 'Au sud : l’Oasis des Roseaux, où la Cité puise son eau. Méfie-toi des scorpions sous les pierres chaudes.' });
  deco('sign', 27, 4, { text: 'À l’est : les salles de sable, puis les Dunes. Tes pas y sonnent deux fois : c’est l’écho, il ne ment jamais longtemps.' });
  scatter(g, 'T', 0.05, 73, (c, x, y) => c === '.' && !(x > 10 && x < 20 && y > 7 && y < 17));
  return {
    id: 'cite', region: 'cite', title: 'La Cité des Échos', theme: 'cite', music: 'cite', area: true, map: toRows(g),
    spawn: [12, 7], entry: [12, 7],
    ents: [{ t: 'start', x: 12, y: 7 }],
    props,
    npcs: [
      { id: 'oumi', x: 12.6, y: 9.4, face: 'S' },
      { id: 'djamila', x: 18.5, y: 6.1, face: 'S', counter: true },
      { id: 'kassim', x: 23.5, y: 6.1, face: 'S', counter: true },
      { id: 'rafik', x: 9.2, y: 11, face: 'S' },
      { id: 'leila', x: 9, y: 16.6, wander: 2.4 },
      { id: 'idris', x: 17.6, y: 15.6, wander: 1.6 },
      { id: 'yael', x: 25.2, y: 10.6, face: 'W' },
      { id: 'samir', x: 6.4, y: 13.2, face: 'E' },
      { id: 'tarek', x: 12.4, y: 16.6, wander: 2.0 },
      { id: 'ysmael', x: 18.8, y: 11.6, face: 'W' },
    ],
    pickups: [],
  };
}

/* ---------------------------------------------------------
   L'Oasis des Roseaux (exploration, quêtes annexes)
   --------------------------------------------------------- */
function oasis() {
  const W = 34, H = 28, g = grid(W, H);
  blob(g, 16.5, 13.5, 17.6, 14.4, 81, 0.08);
  rim(g, 83, 0.3);
  scatter(g, '#', 0.03, 84); scatter(g, 'T', 0.07, 85);
  disk(g, 17, 14, 4.2, '~'); disk(g, 14.5, 12.5, 2.4, '~');          // étang central
  road(g, [[15, 0], [15, 6], [8, 6], [8, 15], [8, 22], [20, 22], [20, 25]]);
  road(g, [[15, 6], [27, 6], [27, 12]]);
  road(g, [[27, 12], [28, 18], [24, 21]]);
  // haie de ronces sèches vers le sud-est
  [[28, 15], [29, 15], [27, 15], [26, 15]].forEach(([x, y]) => { if (g[y][x] !== ' ') g[y][x] = 'r'; });
  // cachette sud-ouest (roches fissurées)
  rect(g, 3, 20, 4, 4, '#'); rect(g, 4, 21, 2, 2, '.'); g[20][5] = 'c'; g[22][6] = 'c';
  // les emplacements d'objets et de créatures restent dégagés
  [[4, 21], [30, 18], [29, 22], [5, 8], [26, 3], [9, 23], [30, 9], [10, 18], [21, 8], [6, 14], [27, 9], [22, 18], [14, 20], [3, 5]].forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ' || g[y][x] === '~') g[y][x] = '.'; });
  return {
    id: 'oasis', region: 'dunes', title: 'L’Oasis des Roseaux', theme: 'desert', music: 'dunes', area: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0],
    props: [
      { t: 'sign', x: 13, y: 2, w: 1, h: 1, text: 'Oasis des Roseaux. L’eau de la Cité vient d’ici. Les scorpions aussi.' },
      { t: 'shelter', x: 19, y: 7, w: 1, h: 1, color: '#c0584a', id: 'abri_oasis' },
      { t: 'pot', x: 23, y: 9, w: 1, h: 1, color: '#c9783a' },
    ],
    chests: [
      { id: 'ch_oas_coeur', x: 4, y: 21, item: 'fragment_coeur', n: 1 },
      { id: 'ch_oas_bottes', x: 30, y: 18, item: 'bottes_dunes', n: 1 },
      { id: 'ch_oas_ecus', x: 26, y: 3, ecus: 90 },
    ],
    pickups: [
      { t: 'item', id: 'fleur1', item: 'fleur_sable', x: 5, y: 8 },
      { t: 'item', id: 'fleur2', item: 'fleur_sable', x: 30, y: 9 },
      { t: 'item', id: 'fleur3', item: 'fleur_sable', x: 9, y: 23 },
      { t: 'item', id: 'fleur4', item: 'fleur_sable', x: 29, y: 22 },
      { t: 'item', id: 'collier1', item: 'collier_chameau', x: 22, y: 18 },
      { t: 'item', id: 'jarre1', item: 'jarre_ancienne', x: 3, y: 5 },
    ],
    spawns: [
      { type: 'scarabee', x: 10, y: 18, n: 2 },
      { type: 'scarabee', x: 21, y: 8, n: 2 },
      { type: 'scorpion', x: 6, y: 14, n: 1 },
      { type: 'scorpion', x: 27, y: 9, n: 1 },
      { type: 'cactus', x: 14, y: 20, n: 1 },
    ],
  };
}

/* ---------------------------------------------------------
   Les Dunes : grande étendue ouverte, exposée aux tempêtes de sable
   --------------------------------------------------------- */
function dunes() {
  const W = 40, H = 30, g = grid(W, H);
  blob(g, 19.5, 14.5, 20.4, 15.2, 91, 0.2);
  rect(g, 0, 3, 10, 6, '.');          // esplanade d'arrivée (le pont des salles de sable y débouche)
  rim(g, 92, 0.25);
  scatter(g, '#', 0.035, 93); scatter(g, 'T', 0.045, 94);
  road(g, [[0, 5], [10, 5], [10, 12], [20, 12], [20, 29]]);
  road(g, [[20, 12], [30, 12], [30, 10], [39, 10]]);
  road(g, [[10, 12], [10, 21], [5, 21]]);
  road(g, [[30, 12], [30, 19], [35, 19]]);
  road(g, [[10, 5], [10, 2], [18, 2]]);
  // haie de ronces sèches avant le Temple
  for (let x = 0; x < W; x++) if (g[24][x] !== ' ' && g[24][x] !== 'T' && g[23][x] !== ' ' && g[25][x] !== ' ') g[24][x] = 'r';
  for (let x = 0; x < W; x++) if (g[24][x] === 'r' && (g[23][x] === ' ' || g[25][x] === ' ')) g[24][x] = '#';
  // dune creuse, au sud-ouest (roches fissurées)
  rect(g, 2, 19, 5, 5, '#'); rect(g, 3, 20, 3, 3, '.'); g[19][4] = 'c'; g[21][6] = 'c';
  // recoin gardé, à l'est
  rect(g, 33, 17, 5, 5, '#'); rect(g, 34, 18, 3, 3, '.'); g[19][33] = '.';
  [[4, 21], [35, 19], [17, 2], [6, 8], [26, 3], [14, 18], [26, 20], [33, 7], [36, 12], [24, 8], [12, 27], [31, 26], [13, 7], [20, 18], [28, 14], [8, 14], [16, 22], [24, 21], [30, 4]].forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#' || g[y][x] === ' ') g[y][x] = '.'; });
  // la route reste dégagée
  return {
    id: 'dunes', region: 'dunes', title: 'Les Dunes', theme: 'desert', music: 'dunes', area: true, storm: true, map: toRows(g),
    spawn: [2, 5], entry: [0, 5], entryGate: 'ds4',
    props: [
      { t: 'sign', x: 3, y: 4, w: 1, h: 1, text: 'Les Dunes. Quand le vent se lève, la lumière ne porte plus : abrite-toi sous une tente, ou attends que le sable retombe. Rien ne presse.' },
      { t: 'shelter', x: 12, y: 9, w: 1, h: 1, color: '#c0584a', id: 'abri_dunes1' },
      { t: 'shelter', x: 27, y: 10, w: 1, h: 1, color: '#4f8aa0', id: 'abri_dunes2' },
      { t: 'stele', x: 21, y: 7, w: 1, h: 1, id: 'stele_dunes' },
      { t: 'ruin', x: 20, y: 27, w: 1, h: 1, name: 'Portique du Temple enseveli' },
      { t: 'dunerock', x: 25, y: 16, w: 1, h: 1 }, { t: 'dunerock', x: 8, y: 17, w: 1, h: 1 },
      { t: 'sign', x: 22, y: 26, w: 1, h: 1, text: 'Temple enseveli : le sable a tout recouvert, sauf la porte. Les ronces sèches ne cèdent qu’à une vraie lame.' },
    ],
    chests: [
      { id: 'ch_dun_coeur', x: 4, y: 21, item: 'fragment_coeur', n: 1 },
      { id: 'ch_dun_masse', x: 35, y: 19, item: 'masse_sable', n: 1 },
      { id: 'ch_dun_ecus', x: 17, y: 2, ecus: 110 },
      { id: 'ch_dun_the', x: 30, y: 4, item: 'grande_potion', n: 2 },
    ],
    pickups: [
      { t: 'item', id: 'tablette1', item: 'tablette_echo', x: 6, y: 8 },
      { t: 'item', id: 'jarre2', item: 'jarre_ancienne', x: 33, y: 7 },
      { t: 'item', id: 'fleur5', item: 'fleur_sable', x: 12, y: 27 },
    ],
    spawns: [
      { type: 'scarabee', x: 14, y: 18, n: 2 },
      { type: 'scarabee', x: 26, y: 20, n: 2 },
      { type: 'scorpion', x: 24, y: 8, n: 1 },
      { type: 'chacal', x: 36, y: 12, n: 2 },
      { type: 'chacal', x: 16, y: 22, n: 1 },
      { type: 'cactus', x: 28, y: 14, n: 1 },
      { type: 'cactus', x: 8, y: 14, n: 1 },
      { type: 'scorpion', x: 12, y: 27, n: 1 },
      { type: 'momie', x: 36, y: 20, n: 1, elite: true },
      { type: 'scarabee', x: 31, y: 26, n: 2 },
      { type: 'echo', x: 20, y: 18, n: 1 },
    ],
  };
}

/* ---------------------------------------------------------
   Le Temple enseveli (donjon)
   --------------------------------------------------------- */
function temple() {
  const W = 30, H = 29, g = grid(W, H, '#');
  const room = (x0, y0, x1, y1) => rect(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, '.');
  room(11, 1, 19, 7);   // hall
  room(1, 1, 9, 9);     // salle ouest (combat)
  room(21, 1, 28, 9);   // salle est (énigme de lumière)
  room(1, 12, 8, 19);   // salle sud-ouest (clé)
  room(22, 12, 28, 19); // salle sud-est (trésor)
  room(10, 11, 20, 26); // arène du Gardien
  room(1, 23, 7, 27);   // chambre cachée
  g[0][15] = '.';
  g[4][10] = '.'; g[4][20] = '.';
  g[10][4] = 'x'; g[11][4] = 'x';       // sceau (salle nettoyée)
  g[10][25] = 'x'; g[11][25] = 'x';     // barrière de lumière (énigme)
  g[8][15] = 'x'; g[9][15] = 'x'; g[10][15] = 'x'; // porte verrouillée
  g[20][4] = 'c'; g[21][4] = 'c'; g[22][4] = 'c';
  [[3, 3], [7, 3], [3, 7], [7, 7], [13, 3], [17, 3], [12, 14], [18, 14], [12, 22], [18, 22], [24, 14], [26, 17], [27, 5]].forEach(([x, y]) => (g[y][x] = '#'));
  return {
    id: 'temple_d', region: 'temple', title: 'Le Temple enseveli', theme: 'temple_sable', music: 'temple_sable', area: true, dungeon: true, map: toRows(g),
    spawn: [15, 1], entry: [15, 0],
    doors: [
      { gate: 'td_combat', look: 'seal', cells: [[4, 10], [4, 11]] },
      { gate: 'td_light', look: 'barrier', cells: [[25, 10], [25, 11]] },
      { gate: 'td_key', look: 'door', cells: [[15, 8], [15, 9], [15, 10]], key: 'cle_temple_d' },
    ],
    // salle des lames : une lanterne, une lame semi-réfléchissante, un miroir à poser sur le bon socle
    socles: [[25, 2], [23, 5], [27, 7]],
    ents: [
      { t: 'lantern', x: 22, y: 8, dir: 'S', rot: true },
      { t: 'splitter', x: 25, y: 8, state: 1, rot: true },
      { t: 'mirror', x: 23, y: 5, state: 1, rot: true, carry: true },
      { t: 'receiver', x: 28, y: 8, color: 'w', gate: 'td_light' },
      { t: 'receiver', x: 28, y: 2, color: 'w', gate: 'td_light' },
    ],
    props: [
      { t: 'brazier', x: 12, y: 1, w: 1, h: 1 }, { t: 'brazier', x: 18, y: 1, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 12, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 12, w: 1, h: 1 },
      { t: 'brazier', x: 10, y: 25, w: 1, h: 1 }, { t: 'brazier', x: 20, y: 25, w: 1, h: 1 },
      { t: 'crystal', x: 2, y: 13, w: 1, h: 1 }, { t: 'crystal', x: 27, y: 18, w: 1, h: 1 }, { t: 'crystal', x: 6, y: 26, w: 1, h: 1 },
      { t: 'stele', x: 15, y: 3, w: 1, h: 1, id: 'stele_temple' },
    ],
    warp: { id: 'temple_d', x: 15, y: 5, name: 'Hall du Temple enseveli', needs: 'boss_echos' },
    chests: [
      { id: 'ch_cle_td', x: 5, y: 16, item: 'cle_temple_d', n: 1 },
      { id: 'ch_tresor_td', x: 25, y: 16, item: 'cimeterre_dore', n: 1 },
      { id: 'ch_prisme_d', x: 15, y: 25, item: 'prisme_dore', n: 1, after: 'boss_echos' },
      { id: 'ch_cache_td', x: 4, y: 25, item: 'fragment_coeur', n: 1 },
      { id: 'ch_cache2_td', x: 2, y: 25, ecus: 220 },
    ],
    pickups: [
      { t: 'item', id: 'tablette2', item: 'tablette_echo', x: 3, y: 17 },
      { t: 'item', id: 'tablette3', item: 'tablette_echo', x: 3, y: 26 },
      { t: 'item', id: 'jarre3', item: 'jarre_ancienne', x: 27, y: 14 },
      { t: 'page', id: 'pg_temple', page: 'orin6', x: 6, y: 24 },
    ],
    combatRooms: [{ gate: 'td_combat', rect: [1, 1, 9, 9] }],
    spawns: [
      { type: 'scarabee', x: 5, y: 5, n: 4, room: 'td_combat' },
      { type: 'echo', x: 2, y: 2, n: 1, room: 'td_combat' },
      { type: 'momie', x: 5, y: 15, n: 1 },
      { type: 'scorpion', x: 25, y: 13, n: 1 },
      { type: 'gardien_echos', x: 15, y: 18, n: 1, boss: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le vestibule du Phare des Sables : trois vasques à allumer avec l'Orbe de Fia
   --------------------------------------------------------- */
function vestibule() {
  const W = 20, H = 12, g = grid(W, H, '#');
  rect(g, 1, 1, 18, 10, '.');
  g[5][0] = '.';                         // arrivée (pont des Dunes)
  g[6][19] = '.';                        // vers la salle du phare
  for (let y = 1; y <= 10; y++) g[y][14] = '#';
  g[5][14] = 'x'; g[6][14] = 'x'; g[7][14] = 'x';   // la porte de lumière : trois vasques
  [[4, 4], [9, 3], [9, 8], [4, 8]].forEach(([x, y]) => (g[y][x] = '#'));
  return {
    id: 'ph_vest', region: 'phare', title: 'Le vestibule du Phare', theme: 'desert', music: 'phare_sable', area: true, storm: true, map: toRows(g),
    spawn: [2, 5], entry: [0, 5], entryGate: 'b_phare',
    doors: [{ gate: 'ph_vasques', look: 'barrier', cells: [[14, 5], [14, 6], [14, 7]] }],
    props: [
      { t: 'vasque', x: 3, y: 2, w: 1, h: 1, id: 'vasque1' },
      { t: 'vasque', x: 11, y: 2, w: 1, h: 1, id: 'vasque2' },
      { t: 'vasque', x: 7, y: 9, w: 1, h: 1, id: 'vasque3' },
      { t: 'stele', x: 12, y: 6, w: 1, h: 1, id: 'stele_phare' },
      { t: 'shelter', x: 2, y: 9, w: 1, h: 1, color: '#d98a3a', id: 'abri_phare' },
      { t: 'sign', x: 2, y: 3, w: 1, h: 1, text: 'Trois vasques, une porte. Elles brûlent quand une petite lumière les effleure : Fia sait faire, si elle porte l’Orbe.' },
    ],
    warp: { id: 'phare_v', x: 3, y: 5, name: 'Cristal du vestibule' },
    chests: [
      { id: 'ch_phv_potion', x: 17, y: 9, item: 'grande_potion', n: 2 },
      { id: 'ch_phv_anneau', x: 17, y: 2, item: 'anneau_oasis', n: 1 },
    ],
    pickups: [],
    spawns: [
      { type: 'momie', x: 8, y: 6, n: 1 },
      { type: 'echo', x: 11, y: 8, n: 1 },
      { type: 'scarabee', x: 6, y: 3, n: 2 },
      { type: 'scorpion', x: 12, y: 4, n: 1 },
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
    id: 'auberge_d', region: 'cite', title: 'Auberge de l’Oasis', theme: 'interieur', area: true, interior: true, map: toRows(g),
    spawn: [6, 7], entry: [6, 8], exit: { cell: [6, 8], to: 'cite', at: [5, 5] },
    props, npcs: [{ id: 'nour', x: 3.5, y: 2.1, face: 'S', counter: true }],
  };
}

/* Les accessoires d'une case (abri, stèle, vasque, rocher, panneau…) bloquent le passage comme les autres décors. */
const BLOCK = new Set(['shelter', 'vasque', 'stele', 'dunerock', 'sign', 'ruin', 'pot']);
function blockProps(z) {
  const g = z.map.map((r) => r.split(''));
  (z.props || []).filter((p) => BLOCK.has(p.t)).forEach((p) => {
    const ch = g[p.y] && g[p.y][p.x];
    if (ch === undefined || ch === ' ') throw new Error(`${z.id} : ${p.t} ${p.id || ''} posé dans le vide (${p.x}, ${p.y})`);
    if (ch === '.' || ch === ',') g[p.y][p.x] = 'H';
    else if (ch !== 'H') throw new Error(`${z.id} : ${p.t} ${p.id || ''} posé sur « ${ch} » (${p.x}, ${p.y})`);
  });
  z.map = toRows(g);
  return z;
}
export function areasDesert() { const A = { cite: cite(), oasis: oasis(), dunes: dunes(), temple: temple(), vestibule: vestibule(), auberge: auberge() }; Object.values(A).forEach(blockProps); return A; }
