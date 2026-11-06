/* =========================================================
   LUMEN — construction de la Forêt de Verre (île 2).
   node tools/build-foret.mjs  →  écrit js/islands/foret.js
   Les salles de vitraux sont dessinées à la main puis VÉRIFIÉES par force brute
   (tools/generate.mjs : analyse). Le village, la lisière et le temple viennent de tools/areas-foret.mjs.
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { analyse, reach } from './generate.mjs';
import { flood, rect, grid, toRows } from './areas.mjs';
import { areasForet } from './areas-foret.mjs';

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

/* ---------------- Salle 1 : le premier vitrail ---------------- */
zone(Object.assign(at(0), {
  id: 'f1', region: 'vitraux', title: 'Le vitrail jaune', num: 1, entry: [0, 5], entryGate: 'b_vitres', exits: [[10, 5]],
  hint: 'Un vitrail ne laisse passer que sa couleur. La lumière blanche devient jaune en le traversant.',
  map: room([[0, 5], [10, 5]], [[6, 8], [7, 8], [8, 7], [5, 4]]),
  ents: [
    { t: 'lantern', x: 3, y: 8, dir: 'E', rot: true },
    { t: 'vitrail', x: 3, y: 5, color: 'y' },
    { t: 'mirror', x: 3, y: 2, state: 1, rot: true },
    { t: 'receiver', x: 8, y: 2, color: 'y', gate: 'fg1' },
  ],
}));

/* ---------------- Salle 2 : le mélangeur ---------------- */
zone(Object.assign(at(1), {
  id: 'f2', region: 'vitraux', title: 'Rouge et vert', num: 2, entry: [0, 5], entryGate: 'fg1', exits: [[10, 5]],
  hint: 'Le prisme sépare la lumière ; le relais à anneaux (mélangeur) réunit tout ce qu’il reçoit. Rouge + vert = jaune.',
  map: room([[0, 5], [10, 5]], [[8, 8], [8, 7], [9, 8], [3, 8]]),
  ents: [
    { t: 'lantern', x: 5, y: 9, dir: 'E', rot: true },
    { t: 'prism', x: 5, y: 6 },
    { t: 'mirror', x: 2, y: 6, state: 0, rot: true },
    { t: 'mirror', x: 2, y: 2, state: 1, rot: true },
    { t: 'relay', x: 5, y: 2, mix: true, out: 'N', rot: true },
    { t: 'receiver', x: 8, y: 2, color: 'y', gate: 'fg2' },
  ],
}));

/* ---------------- Salle 3 : deux couleurs à la fois ---------------- */
zone(Object.assign(at(2), {
  id: 'f3', region: 'vitraux', title: 'Magenta et cyan', num: 3, entry: [0, 5], entryGate: 'fg2', exits: [[10, 5]],
  hint: 'Deux lanternes, deux vitraux, deux cristaux. Chaque couleur a sa route : les faisceaux peuvent se croiser.',
  map: room([[0, 5], [10, 5]], [[5, 8], [4, 8], [6, 5], [7, 6]]),
  ents: [
    { t: 'lantern', x: 1, y: 9, dir: 'E', rot: true },
    { t: 'vitrail', x: 1, y: 7, color: 'm' },
    { t: 'mirror', x: 1, y: 2, state: 1, rot: true },
    { t: 'receiver', x: 8, y: 2, color: 'm', gate: 'fg3' },
    { t: 'lantern', x: 9, y: 9, dir: 'E', rot: true },
    { t: 'vitrail', x: 9, y: 6, color: 'c' },
    { t: 'mirror', x: 9, y: 3, state: 0, rot: true },
    { t: 'receiver', x: 6, y: 3, color: 'c', gate: 'fg3' },
    { t: 'vitrail', x: 3, y: 4, color: 'y' },
  ],
}));

/* ---------------- Ponts et zones d'aventure ---------------- */
const A = areasForet();
const place = (z, ox, oy) => { Object.assign(z, { ox, oy }); zone(z); return z; };
place(A.bourg, 0, 0);
place(A.lisiere, 0, 26);
place(A.temple, 2, 56);
place(A.auberge, 150, 0);
/* belvédère : petite terrasse au bout des salles de vitraux (le phare de verre y sera construit à l'étape suivante) */
{
  const g = grid(11, 11);
  rect(g, 0, 0, 11, 11, '.');
  for (let i = 0; i < 11; i++) { g[0][i] = '#'; g[10][i] = '#'; g[i][10] = '#'; if (i !== 5) g[i][0] = '#'; }
  g[5][0] = '.';
  [[2, 2], [8, 2], [2, 8], [8, 8]].forEach(([x, y]) => (g[y][x] = 'T'));
  zone({
    id: 'belv', region: 'belvedere', title: 'Le Belvédère de Verre', theme: 'foret', area: true, ox: OX + 3 * GRID, oy: 0, map: toRows(g),
    spawn: [2, 5], entry: [0, 5], entryGate: 'fg3',
    props: [{ t: 'sign', x: 5, y: 3, w: 1, h: 1, text: 'Ici s’élèvera le Phare de Verre. Ambre dit qu’il lui manque encore trois couleurs…' }],
    chests: [{ id: 'ch_belv', x: 5, y: 7, item: 'grande_potion', n: 2 }],
    pickups: [{ t: 'item', id: 'belv_eclat', item: 'eclat_verre', x: 7, y: 5 }],
    warp: { id: 'belvedere', x: 3, y: 5, name: 'Cristal du Belvédère' },
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
  bridge('b_vitres', 'vitrebourg', [29, 5], 'f1', [0, 5]),
  bridge('fg1', 'f1', [10, 5], 'f2', [0, 5]),
  bridge('fg2', 'f2', [10, 5], 'f3', [0, 5]),
  bridge('fg3', 'f3', [10, 5], 'belv', [0, 5]),
  bridge('b_lisiere', 'vitrebourg', [15, 23], 'lisiere', [15, 0]),
  bridge('b_temple', 'lisiere', [17, 27], 'temple', [15, 0]),
];

/* ---------------- Vérifications ---------------- */
const farCell = (z) => {
  const seen = reach(z.map, z.ents.map((e) => Object.assign({}, e)), z.entry, z.barrier);
  const occ = new Set(z.ents.map((e) => e.x + ',' + e.y));
  let best = null, bd = -1;
  seen.forEach((k) => {
    const [x, y] = k.split(',').map(Number);
    if (occ.has(k) || z.map[y][x] !== '.' || x === 0 || y === 0 || x === 10 || y === 10) return;
    const d = Math.abs(x - z.entry[0]) + Math.abs(y - z.entry[1]);
    if (d > bd) { bd = d; best = [x, y]; }
  });
  return best;
};
for (const id of ['f1', 'f2', 'f3']) {
  const z = byId[id];
  const p = farCell(z); z.ents.push({ t: 'shard', x: p[0], y: p[1] });
  const gates = [...new Set(z.ents.filter((e) => e.gate).map((e) => e.gate))];
  const an = analyse(z.map, z.ents.filter((e) => e.t !== 'shard'), gates, {});
  if (an.escape) throw new Error(`${z.title} : un faisceau peut quitter la salle`);
  if (!an.sols.length) throw new Error(`${z.title} : aucune solution`);
  if (an.initialSolved) throw new Error(`${z.title} : déjà résolue au départ`);
  report.push(`${z.title.padEnd(22)} dessinée à la main · ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
{ // la salle du temple (énigme de couleur)
  const z = byId.temple;
  const an = analyse(z.map.map((r, y) => r.split('').map((c, x) => (x >= 21 && x <= 28 && y >= 1 && y <= 9 ? c : '#')).join('')), z.ents, ['td_light'], {});
  if (an.escape || !an.sols.length || an.initialSolved) throw new Error(`Temple : énigme invalide (fuite ${an.escape}, solutions ${an.sols.length}, résolue ${an.initialSolved})`);
  report.push(`${z.title.padEnd(22)} salle des vitraux     · ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
for (const z of [A.bourg, A.lisiere, A.temple, A.auberge, byId.belv]) {
  const pass = (c) => c === '.' || c === ',' || c === 'r' || c === 'c' || c === 'x';
  const seen = flood(z.map, z.spawn, pass);
  const need = [].concat(
    (z.npcs || []).filter((n) => !n.counter).map((n) => [Math.round(n.x), Math.round(n.y), 'PNJ ' + n.id]),
    (z.chests || []).map((c) => [c.x, c.y, 'coffre ' + c.id]),
    (z.pickups || []).map((c) => [c.x, c.y, 'objet ' + c.id]),
    (z.props || []).filter((p) => p.door).map((p) => [p.door[0], p.door[1], 'porte ' + p.id]),
    (z.spawns || []).map((s) => [s.x, s.y, 'ennemi ' + s.type]),
  );
  need.forEach(([x, y, what]) => {
    const ok = seen.has(x + ',' + y) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    if (!ok) throw new Error(`${z.title} : ${what} inaccessible (${x}, ${y})`);
  });
  (z.chests || []).concat(z.pickups || []).forEach((c) => { const ch = z.map[c.y][c.x]; if (ch !== '.' && ch !== ',') throw new Error(`${z.title} : ${c.id} posé sur « ${ch} » (${c.x}, ${c.y})`); });
  report.push(`${z.title.padEnd(22)} zone d'aventure     · ${seen.size} cases accessibles`);
}

const island = {
  id: 'foret', num: 2, name: 'La Forêt de Verre',
  intro: 'Les arbres de la Forêt de Verre ont perdu leurs couleurs. Les vitraux du temple ne laissent plus passer que la brume.',
  sky: { dusk: ['#1d3a5a', '#4a8aa0', '#d9a8c8'], dawn: ['#3a9ad0', '#a8e4ec', '#ffe0b8'] },
  regions: {
    bourg: { name: 'Vitrebourg', zones: ['vitrebourg', 'auberge_f'], area: true },
    vitraux: { name: 'Les Salles de Vitraux', zones: ['f1', 'f2', 'f3'] },
    belvedere: { name: 'Le Belvédère de Verre', zones: ['belv'], area: true },
    lisiere: { name: 'La Lisière du Verre', zones: ['lisiere'], area: true },
    temple: { name: 'Le Temple de Verre', zones: ['temple'], area: true },
  },
  pages: {},
  wisp: { name: 'Lueur de verre', text: 'Une Lueur transparente flotte entre les troncs.' },
  ending: 'Le Phare de Verre brille. Un fragment vert du Grand Prisme flotte au-dessus de la flamme.',
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['area', 'theme', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};
const out = `/* Fichier généré par tools/build-foret.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/foret.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/foret.js (${Z.length} zones, ${bridges.length} ponts, ${(out.length / 1024).toFixed(1)} Ko)`);
