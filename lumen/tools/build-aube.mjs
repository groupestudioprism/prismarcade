/* =========================================================
   LUMEN — construction de l'Île de l'Aube.
   node tools/build-aube.mjs  →  écrit js/islands/aube.js
   Les zones de tutoriel et le phare sont dessinés à la main ;
   les autres sont générées puis vérifiées (tools/generate.mjs).
   Les graines sont fixes : relancer donne exactement la même île.
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { generate, analyse, reach } from './generate.mjs';
import { areas, flood } from './areas.mjs';

const GRID = 15;   // une zone de 11 cases + 4 cases de pont
const OX = 36;     // les zones d'énigmes sont à l'est du village (zones d'aventure : tools/areas.mjs)
const at = (c, r) => ({ ox: OX + c * GRID, oy: r * GRID });

/* Chambre au trésor (en bas à droite) pour les zones secrètes : murs, barrière, cases réservées */
const ROOM = {
  walls: [[6, 7], [7, 7], [8, 7], [9, 7], [6, 9], [6, 8, 'x']],
  reserve: [[7, 8], [8, 8], [9, 8], [7, 9], [8, 9], [9, 9], [5, 8], [5, 9]],
};

const Z = [];
const report = [];
function zone(def) { Z.push(def); return def; }
function gen(def, spec, seed) {
  const res = generate(Object.assign({ entry: def.entry }, spec), { seed });
  report.push(`${def.title.padEnd(22)} graine ${String(res.seed).padStart(5)} · ${res.stats.devices} objets orientables · ${res.stats.combos} combinaisons · ${res.stats.solutions} solution(s)`);
  return Object.assign(def, { map: res.map, ents: res.ents, seed: res.seed });
}

/* ---------------- Le Rivage ---------------- */
zone(Object.assign(at(0, 0), {
  id: 'z1', region: 'rivage', title: 'Premier rayon', num: 1, entry: [3, 5],
  hint: 'Approche-toi de la lanterne (anneau doré) et tourne-la vers le cristal.',
  map: [
    '###########',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........#',
    '...........',
    '#.........#',
    '#.........#',
    '#.........#',
    '#T.......T#',
    '###########',
  ],
  ents: [
    { t: 'start', x: 3, y: 5 },
    { t: 'lantern', x: 2, y: 2, dir: 'S', rot: true },
    { t: 'receiver', x: 8, y: 2, color: 'w', gate: 'g1' },
  ],
  exits: [[10, 5]],
}));
zone(Object.assign(at(1, 0), {
  id: 'z2', region: 'rivage', title: 'Premier reflet', num: 2, entry: [0, 5], entryGate: 'g1',
  hint: 'Un miroir renvoie la lumière sur le côté. Tourne-le pour viser le cristal.',
  map: [
    '###########',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........#',
    '..........#',
    '#.........#',
    '#..........',
    '#.........#',
    '#T.......T#',
    '###########',
  ],
  ents: [
    { t: 'lantern', x: 2, y: 2, dir: 'E' },
    { t: 'mirror', x: 7, y: 2, state: 0, rot: true },
    { t: 'receiver', x: 7, y: 8, color: 'w', gate: 'g2' },
  ],
  exits: [[10, 7]],
}));
gen(zone(Object.assign(at(2, 0), { id: 'z3', region: 'rivage', title: 'Les Rochers', num: 3, entry: [0, 7], entryGate: 'g2', exits: [[5, 10], [10, 3]],
  hint: 'Plusieurs miroirs, mais tous ne servent pas. Suis le faisceau pas à pas.' })),
  { kind: 'mirrors', turns: 3, decoys: 2, gate: 'g3', optional: { gate: 's1' }, exits: [[5, 10], [10, 3]], template: { openings: [[0, 7], [5, 10], [10, 3]], rocks: 8, trees: 3 } }, 300);
gen(zone(Object.assign(at(3, 0), { id: 's1', region: 'secret', title: 'La Crique', secret: true, entry: [0, 3], entryGate: 's1', barrier: 't1',
  hint: 'Chambre secrète : rallume le cristal pour ouvrir la salle au trésor.' })),
  { kind: 'mirrors', turns: 5, decoys: 3, gate: 't1', barrier: 't1', mustReach: [[5, 8]], template: Object.assign({ openings: [[0, 3]], rocks: 6, trees: 2 }, ROOM) }, 1100);

/* ---------------- Les Jardins suspendus ---------------- */
gen(zone(Object.assign(at(2, 1), { id: 'z4', region: 'jardins', title: 'Le Prisme', num: 4, entry: [5, 0], entryGate: 'g3', exits: [[0, 6], [10, 4]],
  hint: 'Le prisme sépare la lumière blanche : rouge à gauche, vert tout droit, bleu à droite.' })),
  { kind: 'prism', pre: 1, branches: { r: 1, b: 1 }, decoys: 1, gate: 'g4', optional: { gate: 's2' }, exits: [[0, 6], [10, 4]], template: { openings: [[5, 0], [0, 6], [10, 4]], rocks: 6, trees: 3 } }, 2000);
gen(zone(Object.assign(at(3, 1), { id: 's2', region: 'secret', title: 'Le Belvédère', secret: true, entry: [0, 4], entryGate: 's2', barrier: 't2',
  hint: 'Chambre secrète : trois couleurs, un relais… et beaucoup de miroirs.' })),
  { kind: 'prism', pre: 1, relayAt: [0], branches: { r: 2, g: 1, b: 2 }, decoys: 2, gate: 't2', barrier: 't2', mustReach: [[5, 8]], template: Object.assign({ openings: [[0, 4]], rocks: 4, trees: 2 }, ROOM) }, 2400);
gen(zone(Object.assign(at(1, 1), { id: 'z5', region: 'jardins', title: 'Trois couleurs', num: 5, entry: [10, 6], entryGate: 'g4', exits: [[0, 4]],
  hint: 'Chaque cristal attend sa couleur. Les trois doivent briller en même temps.' })),
  { kind: 'prism', pre: 1, branches: { r: 2, g: 1, b: 2 }, decoys: 1, gate: 'g5', exits: [[0, 4]], template: { openings: [[10, 6], [0, 4]], rocks: 6, trees: 3 } }, 3000);
gen(zone(Object.assign(at(0, 1), { id: 'z6', region: 'jardins', title: 'Le Relais', num: 6, entry: [10, 4], entryGate: 'g5', exits: [[5, 10]],
  hint: 'Un cristal relais réémet la lumière qu’il reçoit. Choisis dans quelle direction.' })),
  { kind: 'relay', turns: 2, relayAt: [1], decoys: 1, gate: 'g6', exits: [[5, 10]], template: { openings: [[10, 4], [5, 10]], rocks: 7, trees: 3 } }, 4000);

/* ---------------- Les Ruines ---------------- */
gen(zone(Object.assign(at(0, 2), { id: 'z7', region: 'ruines', title: 'La Chaîne', num: 7, entry: [5, 0], entryGate: 'g6', exits: [[10, 6]],
  hint: 'Deux relais se passent la lumière. Commence par celui qui est déjà éclairé.' })),
  { kind: 'relay', turns: 4, relayAt: [1, 3], decoys: 2, gate: 'g7', exits: [[10, 6]], template: { openings: [[5, 0], [10, 6]], rocks: 8, trees: 3 } }, 5000);
gen(zone(Object.assign(at(1, 2), { id: 'z8', region: 'ruines', title: 'Deux lanternes', num: 8, entry: [0, 6], entryGate: 'g7', exits: [[10, 4], [5, 10]],
  hint: 'Deux lanternes, deux cristaux. Les faisceaux peuvent se croiser sans se gêner.' })),
  { kind: 'twin', paths: [{ turns: 2 }, { turns: 3 }], decoys: 2, gate: 'g8', optional: { gate: 's3' }, exits: [[10, 4], [5, 10]], template: { openings: [[0, 6], [10, 4], [5, 10]], rocks: 7, trees: 3 } }, 6000);
gen(zone(Object.assign(at(1, 3), { id: 's3', region: 'secret', title: 'Le Jardin caché', secret: true, entry: [5, 0], entryGate: 's3', barrier: 't3',
  hint: 'La dernière chambre secrète de l’Aube. Prends ton temps.' })),
  { kind: 'twin', paths: [{ turns: 3, relayAt: [1] }, { turns: 4 }], decoys: 2, gate: 't3', barrier: 't3', mustReach: [[5, 8]], template: Object.assign({ openings: [[5, 0]], rocks: 5, trees: 2 }, ROOM) }, 7000);
gen(zone(Object.assign(at(2, 2), { id: 'z9', region: 'ruines', title: 'Les Croisements', num: 9, entry: [0, 4], entryGate: 'g8', exits: [[6, 10]],
  hint: 'Un relais avant le prisme : la lumière blanche doit d’abord y arriver.' })),
  { kind: 'prism', pre: 2, relayAt: [1], branches: { r: 2, b: 2 }, decoys: 2, gate: 'g9', exits: [[6, 10]], template: { openings: [[0, 4], [6, 10]], rocks: 7, trees: 3 } }, 8000);

/* ---------------- Le Phare de l'Aube (dessiné à la main) ---------------- */
zone(Object.assign(at(2, 3), {
  id: 'phare', region: 'phare', title: 'Le Phare de l’Aube', num: 10, entry: [6, 1], entryGate: 'g9', barrier: 'lens',
  hint: 'Le phare doit recevoir le rouge, le vert et le bleu en même temps.',
  map: [
    '######x######',
    '#...........#',
    '#...........#',
    '#...........#',
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
  ],
}));

/* ---------------- Ponts ---------------- */
const byId = Object.fromEntries(Z.map((z) => [z.id, z]));
function bridge(gate, a, [ax, ay], b, [bx, by]) {
  const A = [byId[a].ox + ax, byId[a].oy + ay], B = [byId[b].ox + bx, byId[b].oy + by];
  if (A[0] !== B[0] && A[1] !== B[1]) throw new Error(`Pont ${gate} non aligné : ${A} → ${B}`);
  const dx = Math.sign(B[0] - A[0]), dy = Math.sign(B[1] - A[1]);
  const cells = [];
  for (let x = A[0] + dx, y = A[1] + dy; x !== B[0] || y !== B[1]; x += dx, y += dy) cells.push([x, y]);
  return { gate, cells };
}
const bridges = [
  bridge('g1', 'z1', [10, 5], 'z2', [0, 5]),
  bridge('g2', 'z2', [10, 7], 'z3', [0, 7]),
  bridge('s1', 'z3', [10, 3], 's1', [0, 3]),
  bridge('g3', 'z3', [5, 10], 'z4', [5, 0]),
  bridge('s2', 'z4', [10, 4], 's2', [0, 4]),
  bridge('g4', 'z4', [0, 6], 'z5', [10, 6]),
  bridge('g5', 'z5', [0, 4], 'z6', [10, 4]),
  bridge('g6', 'z6', [5, 10], 'z7', [5, 0]),
  bridge('g7', 'z7', [10, 6], 'z8', [0, 6]),
  bridge('s3', 'z8', [5, 10], 's3', [5, 0]),
  bridge('g8', 'z8', [10, 4], 'z9', [0, 4]),
  bridge('g9', 'z9', [6, 10], 'phare', [6, 0]),
];

/* ---------------- Objets à collectionner ----------------
   Éclats : dans la case libre accessible la plus éloignée de l'entrée (déterministe). */
function farCell(z, avoid = []) {
  const seen = reach(z.map, z.ents.map((e) => Object.assign({}, e)), z.entry, z.barrier);
  const occ = new Set(z.ents.map((e) => e.x + ',' + e.y).concat(avoid.map(([x, y]) => x + ',' + y)));
  let best = null, bd = -1;
  seen.forEach((k) => {
    const [x, y] = k.split(',').map(Number);
    if (occ.has(k) || z.map[y][x] !== '.' || x === 0 || y === 0 || x === z.map[0].length - 1 || y === z.map.length - 1) return;
    if (z.secret && x >= 6 && y >= 7) return; // pas dans la salle au trésor
    const d = Math.abs(x - z.entry[0]) + Math.abs(y - z.entry[1]);
    if (d > bd) { bd = d; best = [x, y]; }
  });
  return best;
}
const SHARD_ZONES = ['z1', 'z3', 'z5', 'z6', 'z7', 'z9', 'phare'];
SHARD_ZONES.forEach((id) => { const z = byId[id]; const p = farCell(z); z.ents.push({ t: 'shard', x: p[0], y: p[1] }); });
const PAGES = ['orin1', 'orin2', 'orin3'];
['s1', 's2', 's3'].forEach((id, i) => {
  const z = byId[id];
  z.ents.push({ t: 'shard', x: 9, y: 8 }, { t: 'page', x: 8, y: 9, page: PAGES[i] });
});
{ const z = byId.z8; const p = farCell(z); z.ents.push({ t: 'wisp', x: p[0], y: p[1] }); }

/* ---------------- Zones d'aventure (village, lande, sanctuaire, intérieurs) ----------------
   Ajoutées APRÈS les zones d'énigmes : les identifiants des objets des zones d'énigmes ne changent pas
   (les sauvegardes de la version 0.2 restent valables). */
const A = areas();
const place = (z, ox, oy) => { Object.assign(z, { ox, oy }); Z.push(z); byId[z.id] = z; return z; };
place(A.village, 0, 0);
place(A.lande, 0, 26);
place(A.sanctuaire, 2, 56);
place(A.auberge, 150, 0);
place(A.orin, 150, 12);
bridges.push(
  bridge('b_rivage', 'havre', [29, 5], 'z1', [0, 5]),
  bridge('b_lande', 'havre', [15, 23], 'lande', [15, 0]),
  bridge('b_sanct', 'lande', [17, 27], 'sanctuaire', [15, 0]),
);
/* tout ce qui compte doit être accessible (ronces, roches fissurées et portes considérées comme franchissables) */
for (const z of [A.village, A.lande, A.sanctuaire, A.auberge, A.orin]) {
  const pass = (c) => c === '.' || c === ',' || c === 'r' || c === 'c' || c === 'x';
  const seen = flood(z.map, z.spawn, pass);
  const need = [].concat(
    (z.npcs || []).filter((n) => !n.counter).map((n) => [Math.round(n.x), Math.round(n.y), 'PNJ ' + n.id]),
    (z.chests || []).map((c) => [c.x, c.y, 'coffre ' + c.id]),
    (z.pickups || []).map((c) => [c.x, c.y, 'objet ' + c.id]),
    (z.props || []).filter((p) => p.door).map((p) => [p.door[0], p.door[1], 'porte ' + p.id]),
    (z.spawns || []).map((s) => [s.x, s.y, 'ennemi ' + s.type]),
  );
  // un coffre ou un PNJ derrière un comptoir est atteint depuis une case voisine
  need.forEach(([x, y, what]) => {
    const ok = seen.has(x + ',' + y) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    if (!ok) throw new Error(`${z.title} : ${what} inaccessible (${x}, ${y})`);
  });
  report.push(`${z.title.padEnd(22)} zone d'aventure     · ${seen.size} cases accessibles`);
}
// les coffres et objets doivent être sur des cases libres
for (const z of [A.village, A.lande, A.sanctuaire, A.auberge, A.orin]) {
  (z.chests || []).concat(z.pickups || []).forEach((c) => { const ch = z.map[c.y][c.x]; if (ch !== '.' && ch !== ',') throw new Error(`${z.title} : ${c.id} posé sur « ${ch} » (${c.x}, ${c.y})`); });
}

/* ---------------- Vérification de l'île complète ---------------- */
for (const z of Z) {
  if (z.id === 'z1' || z.id === 'z2' || z.id === 'phare') {
    const gates = z.id === 'phare' ? ['end'] : [z.ents.find((e) => e.gate).gate];
    const an = analyse(z.map, z.ents, gates, { barrier: z.barrier });
    if (an.escape || !an.sols.length || an.initialSolved) throw new Error(`Zone ${z.id} invalide (fuite ${an.escape}, solutions ${an.sols.length}, déjà résolue ${an.initialSolved})`);
    report.push(`${z.title.padEnd(22)} dessinée à la main   · ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
  }
}

const island = {
  id: 'aube', num: 1, name: 'L’Île de l’Aube',
  intro: 'La Brume a éteint l’archipel. Sur l’Île de l’Aube, les cristaux dorment et le phare s’est tu. Rallume-les, un faisceau après l’autre.',
  sky: { dusk: ['#3b3274', '#7a6aa6', '#e6a99d'], dawn: ['#3f80e0', '#b5dcf7', '#ffd9a6'] },
  regions: {
    rivage: { name: 'Le Rivage', zones: ['z1', 'z2', 'z3'] },
    jardins: { name: 'Les Jardins suspendus', zones: ['z4', 'z5', 'z6'] },
    ruines: { name: 'Les Ruines', zones: ['z7', 'z8', 'z9'] },
    phare: { name: 'Le Phare de l’Aube', zones: ['phare'] },
    secret: { name: 'Chambres secrètes', zones: ['s1', 's2', 's3'] },
    havre: { name: 'Havre-Aube', zones: ['havre', 'auberge_in', 'orin_in'], area: true },
    lande: { name: 'La Lande des Ronces', zones: ['lande'], area: true },
    sanctuaire: { name: 'Le Sanctuaire de Brume', zones: ['sanctuaire'], area: true },
  },
  pages: {
    orin1: { title: 'Journal d’Orin — I', text: 'J’ai posé la dernière pierre du phare de l’Aube. Quand le Grand Prisme l’a touché, toute l’île est devenue rose, comme si le ciel se souvenait de son premier matin. Séléné dit que nous avons dompté la lumière. Je crois plutôt que nous l’avons empruntée.' },
    orin2: { title: 'Journal d’Orin — II', text: 'Les îles s’éloignent un peu chaque année. Il faudrait plus de phares, plus de lumière. Ou une seule lumière, si forte qu’elle les retiendrait toutes. J’ai commencé les plans d’une lentille, au cœur même du Prisme.' },
    orin3: { title: 'Journal d’Orin — III', text: 'La lentille fonctionne. Trop bien. Là où la lumière se concentre, une ombre est née derrière le Prisme. Elle grandit quand je l’éclaire davantage. Je ne sais plus s’il faut l’arrêter… ou si c’est moi qu’il faudrait arrêter.' },
    orin4: { title: 'Journal d’Orin — IV', text: 'Lison, si tu lis ceci, c’est que tu as retrouvé mes pages. Je pars vers la Citadelle du Zénith : c’est là que la lumière est la plus forte, et l’ombre aussi. Le phare de l’Aube montrera le chemin aux îles une à une. Ne le laisse jamais s’éteindre. Et garde la Lentille loin de moi.' },
  },
  wisp: { name: 'Lueur de l’Aube', text: 'Une petite Lueur tremble dans les herbes. Elle te suit : quand le Sanctuaire sera accessible, elle y rallumera la fontaine.' },
  ending: 'Le phare de l’Aube brille à nouveau. Un fragment rouge du Grand Prisme flotte au-dessus de la flamme : la route vers la Forêt de Verre s’éclaire au loin.',
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['h', 'hmap', /* ALTITUDE */ 'area', 'theme', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};

const out = `/* Fichier généré par tools/build-aube.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/aube.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/aube.js (${Z.length} zones, ${bridges.length} ponts, ${(out.length / 1024).toFixed(1)} Ko)`);
