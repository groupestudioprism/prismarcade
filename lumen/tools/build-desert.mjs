/* =========================================================
   LUMEN — construction du Désert des Échos (île 3, Acte III).
   node tools/build-desert.mjs  →  écrit js/islands/desert.js
   Les salles de lames et de socles sont dessinées à la main puis VÉRIFIÉES par force brute
   (tools/generate.mjs : analyse, y compris toutes les répartitions des objets portés).
   Le village, l'oasis, les dunes, le temple viennent de tools/areas-desert.mjs.
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { analyse, reach } from './generate.mjs';
import { flood, rect, grid, toRows } from './areas.mjs';
import { areasDesert } from './areas-desert.mjs';
import { checkIsland } from './reachlib.mjs';

const OX = 36, GRID = 15;
const at = (c) => ({ ox: OX + c * GRID, oy: 0 });
const Z = [];
const report = [];
const byId = {};
const zone = (z) => { Z.push(z); byId[z.id] = z; return z; };

/* gabarit 11×11 : murs autour, ouvertures, quelques rochers de décor */
function room(openings, rocks = []) {
  const g = Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => (x === 0 || y === 0 || x === 10 || y === 10 ? '#' : '.')));
  openings.forEach(([x, y]) => (g[y][x] = '.'));
  rocks.forEach(([x, y]) => (g[y][x] = '#'));
  return g.map((r) => r.join(''));
}
const A = areasDesert();
const place = (z, ox, oy) => { Object.assign(z, { ox, oy }); zone(z); return z; };

/* ---------------- Cité des Échos (arrivée) ---------------- */
place(A.cite, 0, 0);

/* ---------------- Salle 1 : la lame (aucun objet porté) ---------------- */
zone(Object.assign(at(0), {
  id: 'd1', region: 'dunes', title: 'La première lame', theme: 'ruines', music: 'dunes', num: 1, entry: [0, 5], entryGate: 'b_sable', exits: [[10, 5]],
  hint: 'Une lame semi-réfléchissante laisse passer la lumière ET en renvoie la moitié sur le côté. Une seule lanterne peut éclairer deux cristaux.',
  map: room([[0, 5], [10, 5]], [[3, 2], [8, 4], [2, 6], [8, 9]]),
  ents: [
    { t: 'lantern', x: 2, y: 8, dir: 'S', rot: true },
    { t: 'splitter', x: 6, y: 8, state: 1, rot: true },
    { t: 'receiver', x: 9, y: 8, color: 'w', gate: 'ds1' },
    { t: 'receiver', x: 6, y: 3, color: 'w', gate: 'ds1' },
  ],
}));
/* ---------------- Salle 2 : le premier socle ---------------- */
zone(Object.assign(at(1), {
  id: 'd2', region: 'dunes', title: 'Le miroir sur son socle', theme: 'ruines', music: 'dunes', num: 2, storm: true, entry: [0, 5], entryGate: 'ds1', exits: [[10, 5]],
  hint: 'Ce miroir n’est pas scellé : approche-toi et porte-le (R) jusqu’à un autre socle. Pendant une tempête de sable, la lumière ne porte plus loin : patiente, ou abrite-toi.',
  map: room([[0, 5], [10, 5]], [[3, 4], [4, 8], [6, 4], [6, 8]]),
  socles: [[4, 6], [8, 2]],
  ents: [
    { t: 'lantern', x: 2, y: 2, dir: 'S', rot: true },
    { t: 'mirror', x: 4, y: 6, state: 0, rot: true, carry: true },
    { t: 'receiver', x: 8, y: 8, color: 'w', gate: 'ds2' },
  ],
}));
/* ---------------- Salle 3 : deux routes ---------------- */
zone(Object.assign(at(2), {
  id: 'd3', region: 'dunes', title: 'Deux routes', theme: 'ruines', music: 'dunes', num: 3, storm: true, entry: [0, 5], entryGate: 'ds2', exits: [[10, 5]],
  hint: 'La lame partage le faisceau : une moitié file tout droit, l’autre monte. Deux miroirs mobiles, un seul bon socle.',
  map: room([[0, 5], [10, 5]], [[3, 6], [7, 6], [2, 2], [9, 6]]),
  socles: [[2, 3], [5, 3], [8, 3], [8, 7]],
  ents: [
    { t: 'lantern', x: 1, y: 8, dir: 'N', rot: true },
    { t: 'splitter', x: 5, y: 8, state: 1, rot: true },
    { t: 'mirror', x: 2, y: 3, state: 1, rot: true, carry: true },
    { t: 'mirror', x: 8, y: 7, state: 0, rot: true, carry: true },
    { t: 'receiver', x: 9, y: 8, color: 'w', gate: 'ds3' },
    { t: 'receiver', x: 9, y: 3, color: 'w', gate: 'ds3' },
  ],
}));
/* ---------------- Salle 4 : le prisme porté ---------------- */
zone(Object.assign(at(3), {
  id: 'd4', region: 'dunes', title: 'Le prisme voyageur', theme: 'ruines', music: 'dunes', num: 4, storm: true, entry: [0, 5], entryGate: 'ds3', exits: [[10, 5]],
  hint: 'Même un prisme se porte. Pose-le là où le rouge, le vert et le bleu trouveront chacun leur cristal.',
  map: room([[0, 5], [10, 5]], [[3, 4], [7, 4], [3, 6], [7, 6]]),
  socles: [[3, 2], [5, 8], [8, 2]],
  ents: [
    { t: 'lantern', x: 1, y: 8, dir: 'N', rot: true },
    { t: 'prism', x: 3, y: 2, carry: true },
    { t: 'receiver', x: 5, y: 2, color: 'r', gate: 'ds4' },
    { t: 'receiver', x: 9, y: 8, color: 'g', gate: 'ds4' },
    { t: 'receiver', x: 5, y: 9, color: 'b', gate: 'ds4' },
  ],
}));

/* ---------------- Zones d'aventure ---------------- */
place(A.oasis, 0, 28);
place(A.dunes, OX + 4 * GRID + 5, 0);          // x = 101 ... voir les ponts
place(A.temple, 0, 0);                         // repositionné plus bas
place(A.vestibule, 0, 0);
place(A.auberge, 200, 60);
/* positions définitives (les ponts sont alignés sur celles-ci) */
const D = byId.dunes; D.ox = 96; D.oy = 0;
byId.temple_d.ox = 101; byId.temple_d.oy = 34;
byId.ph_vest.ox = 140; byId.ph_vest.oy = 5;

/* ---------------- Le Phare des Sables ---------------- */
{
  const g = grid(15, 13, '#');
  rect(g, 1, 1, 13, 11, '.');
  g[1][0] = '.';
  [[3, 8], [8, 8], [13, 3], [13, 9], [7, 4], [2, 4]].forEach(([x, y]) => (g[y][x] = '#'));
  zone({
    id: 'phare_d', region: 'phare', title: 'Le Phare des Sables', theme: 'phare_sable', music: 'phare_sable', num: 5, storm: true, respawn: true, ox: 164, oy: 10, map: toRows(g),
    entry: [0, 1], entryGate: 'ph_vasques',
    hint: 'Le phare veut le rouge, le vert et le bleu, ensemble, sur la balise. Un prisme, un miroir à poser, des lames de lumière : et patience quand le sable se lève.',
    socles: [[5, 6], [3, 3], [5, 2], [8, 4], [2, 9]],
    ents: [
      { t: 'beacon', x: 11, y: 6, gate: 'end' },
      { t: 'lantern', x: 2, y: 6, dir: 'N', rot: true },
      { t: 'prism', x: 3, y: 3, carry: true },
      { t: 'mirror', x: 8, y: 4, state: 1, rot: true, carry: true },
      { t: 'mirror', x: 11, y: 2, state: 0, rot: true },
      { t: 'mirror', x: 5, y: 10, state: 0, rot: true },
      { t: 'mirror', x: 11, y: 10, state: 1, rot: true },
    ],
    warp: { id: 'phare_d', x: 3, y: 10, name: 'Cristal du Phare des Sables' },
  });
}
function bridge(gate, a, [ax, ay], b, [bx, by]) {
  const A_ = [byId[a].ox + ax, byId[a].oy + ay], B = [byId[b].ox + bx, byId[b].oy + by];
  if (A_[0] !== B[0] && A_[1] !== B[1]) throw new Error(`Pont ${gate} non aligné : ${A_} → ${B}`);
  const dx = Math.sign(B[0] - A_[0]), dy = Math.sign(B[1] - A_[1]);
  const cells = [];
  for (let x = A_[0] + dx, y = A_[1] + dy; x !== B[0] || y !== B[1]; x += dx, y += dy) cells.push([x, y]);
  return { gate, cells };
}
const bridges = [
  bridge('b_sable', 'cite', [29, 5], 'd1', [0, 5]),
  bridge('ds1', 'd1', [10, 5], 'd2', [0, 5]),
  bridge('ds2', 'd2', [10, 5], 'd3', [0, 5]),
  bridge('ds3', 'd3', [10, 5], 'd4', [0, 5]),
  bridge('ds4', 'd4', [10, 5], 'dunes', [0, 5]),
  bridge('b_oasis', 'cite', [15, 23], 'oasis', [15, 0]),
  bridge('b_temple_d', 'dunes', [20, 29], 'temple_d', [15, 0]),
  bridge('b_phare', 'dunes', [39, 10], 'ph_vest', [0, 5]),
  bridge('ph_vasques', 'ph_vest', [19, 6], 'phare_d', [0, 1]),
];

/* ---------------- Vérifications ---------------- */
const farCell = (z) => {
  const seen = reach(z.map, z.ents.map((e) => Object.assign({}, e)), z.entry, z.barrier, z.socles);
  const occ = new Set(z.ents.map((e) => e.x + ',' + e.y).concat((z.socles || []).map((s) => s.join(','))));
  let best = null, bd = -1;
  seen.forEach((k) => {
    const [x, y] = k.split(',').map(Number);
    if (occ.has(k) || z.map[y][x] !== '.' || x === 0 || y === 0 || x === 10 || y === 10) return;
    const d = Math.abs(x - z.entry[0]) + Math.abs(y - z.entry[1]);
    if (d > bd) { bd = d; best = [x, y]; }
  });
  return best;
};
for (const id of ['d1', 'd2', 'd3', 'd4']) {
  const z = byId[id];
  const p = farCell(z); z.ents.push({ t: 'shard', x: p[0], y: p[1] });
  const gates = [...new Set(z.ents.filter((e) => e.gate).map((e) => e.gate))];
  const an = analyse(z.map, z.ents.filter((e) => e.t !== 'shard'), gates, { socles: z.socles, entry: z.entry });
  if (an.escape) throw new Error(`${z.title} : un faisceau peut quitter la salle`);
  if (!an.sols.length) throw new Error(`${z.title} : aucune solution`);
  if (an.initialSolved) throw new Error(`${z.title} : déjà résolue au départ`);
  if (z.socles && an.carryFree) throw new Error(`${z.title} : résoluble sans rien porter`);
  if (!an.connected) throw new Error(`${z.title} : accès bloqué ${an.blocked}`);
  report.push(`${z.title.padEnd(26)} ${an.rots.length} objets orientables · ${an.movers.length} portés · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
for (const id of ['temple_d', 'phare_d']) {
  const z = byId[id];
  const gates = [...new Set(z.ents.filter((e) => e.gate).map((e) => e.gate))];
  const an = analyse(z.map, z.ents, gates, { socles: z.socles, entry: z.entry || z.spawn });
  if (an.escape || !an.sols.length || an.initialSolved || an.carryFree || !an.connected) throw new Error(`${z.title} : énigme invalide (fuite ${an.escape}, solutions ${an.sols.length}, résolue ${an.initialSolved}, sans porter ${an.carryFree}, connexe ${an.connected} ${an.blocked})`);
  report.push(`${z.title.padEnd(26)} ${an.rots.length} objets orientables · ${an.movers.length} portés · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
for (const z of [byId.cite, byId.oasis, byId.dunes, byId.temple_d, byId.ph_vest]) {
  const pass = (c) => c === '.' || c === ',' || c === 'r' || c === 'c' || c === 'x';
  const seen = flood(z.map, z.spawn.map(Math.floor), pass);
  const need = [].concat(
    (z.npcs || []).filter((n) => !n.counter).map((n) => [Math.round(n.x), Math.round(n.y), 'PNJ ' + n.id]),
    (z.chests || []).map((c) => [c.x, c.y, 'coffre ' + c.id]),
    (z.pickups || []).map((c) => [c.x, c.y, 'objet ' + c.id]),
    (z.props || []).filter((p) => p.door).map((p) => [p.door[0], p.door[1], 'porte ' + p.id]),
    (z.props || []).filter((p) => ['vasque', 'shelter', 'stele'].includes(p.t)).map((p) => [p.x, p.y, p.t + ' ' + p.id]),
    (z.spawns || []).map((s) => [s.x, s.y, 'ennemi ' + s.type]),
  );
  need.forEach(([x, y, what]) => {
    const ok = seen.has(x + ',' + y) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    if (!ok) throw new Error(`${z.title} : ${what} inaccessible (${x}, ${y})`);
  });
  (z.chests || []).concat(z.pickups || []).forEach((c) => { const ch = z.map[c.y][c.x]; if (ch !== '.' && ch !== ',') throw new Error(`${z.title} : ${c.id} posé sur « ${ch} » (${c.x}, ${c.y})`); });
  (z.spawns || []).forEach((s) => { const ch = z.map[s.y][s.x]; if (ch !== '.' && ch !== ',') throw new Error(`${z.title} : ennemi ${s.type} posé sur « ${ch} » (${s.x}, ${s.y})`); });
  report.push(`${z.title.padEnd(26)} zone d'aventure · ${seen.size} cases accessibles`);
}

const island = {
  id: 'desert', num: 3, name: 'Le Désert des Échos',
  intro: 'Le sable du Désert des Échos a recouvert les temples et fait taire les voix. On dit que chaque cri s’y répète trois fois avant de mourir.',
  sky: { dusk: ['#5a2a3a', '#d9803a', '#ffd88a'], dawn: ['#e8903a', '#ffd89a', '#fff0c8'] },
  regions: {
    cite: { name: 'La Cité des Échos', zones: ['cite', 'auberge_d'], area: true },
    dunes: { name: 'Les Dunes', zones: ['d1', 'd2', 'd3', 'd4', 'dunes', 'oasis'] },
    temple: { name: 'Le Temple enseveli', zones: ['temple_d'], area: true },
    phare: { name: 'Le Phare des Sables', zones: ['ph_vest', 'phare_d'] },
  },
  pages: {
    orin6: { title: 'Journal d’Orin — VI', text: 'Dans le désert, j’ai compris qu’une lumière peut voyager sans qu’on la porte, et qu’on peut porter ce qui la guide. Un miroir sur le bon socle vaut mieux qu’un feu plus grand. J’ai laissé une dernière flamme à Fia, mon amie des routes : une petite lumière qu’on peut garder dans la main, et qui allume les vasques de pierre. Je ne reviendrai pas la chercher.' },
  },
  stageGates: [],
  endTitle: 'Le Phare des Sables brille',
  wisp: { name: 'Lueur de sable', text: 'Une Lueur dorée tourbillonne dans le vent chaud.' },
  ending: 'Le Phare des Sables brille. Un fragment doré du Grand Prisme flotte au-dessus de la flamme.',
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['h', 'hmap', /* ALTITUDE */ 'area', 'theme', 'music', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms', 'stages', 'final', 'respawn', 'socles', 'storm', 'entry'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};
{ // accessibilité de toute l'île (toutes portes ouvertes)
  const r = checkIsland(island, 'cite');
  if (r.problems.length) throw new Error('Accessibilité :\n  ' + r.problems.join('\n  '));
  report.push(`Accessibilité              ${r.cells} cases · ${r.notes.length} élément(s) derrière des ronces ou des roches`);
}
const out = `/* Fichier généré par tools/build-desert.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/desert.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/desert.js (${Z.length} zones, ${bridges.length} ponts, ${(out.length / 1024).toFixed(1)} Ko)`);
