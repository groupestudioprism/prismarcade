/* =========================================================
   LUMEN — îles.
   Terrain : ' ' vide · '.' herbe · '#' rocher · 'T' arbre · 'x' barrière de cristal (porte « barrier » de la zone)
   Objets (coordonnées locales à la zone) :
     lantern  { dir: N|E|S|W, rot }        source de lumière blanche (rot : peut être tournée)
     mirror   { state: 0 « / » | 1 « \ », rot }
     prism    {}                            blanc → rouge (à gauche), vert (tout droit), bleu (à droite)
     receiver { color: w|r|g|b, gate }      cristal : ouvre la porte « gate » quand il reçoit sa couleur
     beacon   { gate }                      phare : s'allume avec rouge + vert + bleu
     shard    {}                            éclat de prisme à ramasser
   Chaque zone : spawn (point d'arrivée), entryGate (porte qui y donne accès), hint (conseil affiché à l'arrivée).
   ========================================================= */

export const ISLANDS = [
  {
    id: 'aube',
    num: 1,
    name: 'L’Île de l’Aube',
    intro: 'La lumière a quitté les îles. Rallume les cristaux, puis le phare de l’Aube.',
    sky: { dusk: ['#2b2350', '#5a4a78', '#c99a8a'], dawn: ['#4a7fd4', '#9cc7f0', '#ffd9a8'] },
    zones: [
      {
        ox: 0, oy: 0,
        spawn: [4, 5],
        hint: 'Approche-toi de la lanterne et tourne-la vers le cristal.',
        map: [
          ' ######## ',
          '#........#',
          '#........#',
          '#........#',
          '#........#',
          '#.........',
          '#........#',
          '#T......T#',
          ' ######## ',
        ],
        ents: [
          { t: 'start', x: 4, y: 5 },
          { t: 'lantern', x: 2, y: 2, dir: 'S', rot: true },
          { t: 'receiver', x: 7, y: 2, color: 'w', gate: 'g1' },
          { t: 'shard', x: 8, y: 1 },
        ],
      },
      {
        ox: 15, oy: 0,
        spawn: [1, 5], entryGate: 'g1', barrier: 'g2',
        hint: 'Les miroirs renvoient la lumière : fais-la contourner les rochers.',
        map: [
          '###########',
          '#.........#',
          '#.#.......#',
          '#.........#',
          '#.........#',
          '.....##...x',
          '#....##...#',
          '#.........#',
          '#.........#',
          '#T.......T#',
          '###########',
        ],
        ents: [
          { t: 'lantern', x: 1, y: 1, dir: 'E' },
          { t: 'mirror', x: 4, y: 1, state: 0, rot: true },
          { t: 'mirror', x: 8, y: 4, state: 1, rot: true },
          { t: 'mirror', x: 1, y: 6, state: 0, rot: true },
          { t: 'mirror', x: 4, y: 8, state: 0, rot: true },
          { t: 'receiver', x: 8, y: 8, color: 'w', gate: 'g2' },
          { t: 'shard', x: 9, y: 2 },
        ],
      },
      {
        ox: 30, oy: 2,
        spawn: [1, 3], entryGate: 'g2',
        hint: 'Le prisme sépare la lumière blanche en rouge, vert et bleu.',
        map: [
          '#############',
          '#T.........T#',
          '#...........#',
          '............#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#............',
          '#...........#',
          '#...........#',
          '#############',
        ],
        ents: [
          { t: 'lantern', x: 6, y: 1, dir: 'S' },
          { t: 'prism', x: 6, y: 5 },
          { t: 'mirror', x: 9, y: 5, state: 0, rot: true },
          { t: 'mirror', x: 9, y: 8, state: 0, rot: true },
          { t: 'mirror', x: 3, y: 5, state: 1, rot: true },
          { t: 'receiver', x: 11, y: 8, color: 'r', gate: 'g3' },
          { t: 'receiver', x: 3, y: 9, color: 'b', gate: 'g3' },
          { t: 'shard', x: 11, y: 4 },
        ],
      },
      {
        ox: 47, oy: 6,
        spawn: [1, 3], entryGate: 'g3',
        hint: 'Le phare a besoin des trois couleurs en même temps.',
        map: [
          '#############',
          '#.....T.....#',
          '#...........#',
          '............#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#...........#',
          '#############',
        ],
        ents: [
          { t: 'beacon', x: 6, y: 6, gate: 'end' },
          { t: 'lantern', x: 1, y: 10, dir: 'W', rot: true },
          { t: 'prism', x: 6, y: 10 },
          { t: 'mirror', x: 10, y: 10, state: 1, rot: true },
          { t: 'mirror', x: 10, y: 6, state: 0, rot: true },
          { t: 'mirror', x: 6, y: 11, state: 1, rot: true },
          { t: 'mirror', x: 2, y: 11, state: 0, rot: true },
          { t: 'mirror', x: 2, y: 6, state: 1, rot: true },
          { t: 'shard', x: 11, y: 11 },
          { t: 'shard', x: 1, y: 1 },
        ],
      },
    ],
    bridges: [
      { gate: 'g1', cells: [[10, 5], [11, 5], [12, 5], [13, 5], [14, 5]] },
      { gate: 'g2', cells: [[26, 5], [27, 5], [28, 5], [29, 5]] },
      { gate: 'g3', cells: [[43, 9], [44, 9], [45, 9], [46, 9]] },
    ],
  },
];

/* Îles prévues (voir DESIGN.md) */
export const UPCOMING = [
  { num: 2, name: 'La Forêt de Verre', what: 'vitraux colorés et mélange des couleurs' },
  { num: 3, name: 'Le Désert des Échos', what: 'blocs et prismes à déplacer' },
  { num: 4, name: 'Les Abysses Miroirs', what: 'reflets sur l’eau et lumière qui se déplace' },
  { num: 5, name: 'La Citadelle du Zénith', what: 'toutes les mécaniques et le gardien final' },
];
