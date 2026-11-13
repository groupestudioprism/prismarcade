/* =========================================================
   LUMEN — construction des Abysses Miroirs (île 4).
   node tools/build-abysses.mjs  →  écrit js/islands/abysses.js
   Les salles à eau miroir, vannes et orbe sont dessinées à la main (ou trouvées par tools/gen-abysses.mjs puis figées ici)
   et VÉRIFIÉES par exploration d’états (tools/analyse-abysses.mjs) : solution, aucune impasse, aucune fuite de faisceau.
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { analyseRoom, analysePuzzles } from './analyse-abysses.mjs';
import { flood, grid, rect, toRows } from './areas.mjs';
import { areasAbysses, MAREES } from './areas-abysses.mjs';
import { checkIsland } from './reachlib.mjs';

const Z = [], report = [], byId = {};
const zone = (z) => { Z.push(z); byId[z.id] = z; return z; };

/* gabarit 11×11 ; open : ouvertures dans le mur, rocks : décor */
function room(rocks = [], open = [[0, 5], [10, 5]], w = 11, h = 11) {
  const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? '#' : '.')));
  open.forEach(([x, y]) => (g[y][x] = '.'));
  rocks.forEach(([x, y]) => (g[y][x] = '#'));
  return g;
}
const P = (id, x, y, o, valve, inv) => Object.assign({ t: 'pool', id, x, y, o }, valve ? { valve } : {}, inv ? { inv: true } : {});
const V = (id, x, y, state = 0) => ({ t: 'valve', id, x, y, state, rot: true });
const M = (id, x, y, state) => ({ t: 'mirror', id, x, y, state, rot: true });
const L = (id, x, y, dir) => ({ t: 'lantern', id, x, y, dir, rot: true });
const S = (id, x, y, color) => Object.assign({ t: 'socle', id, x, y, rot: true }, color ? { color } : {});
const R = (id, x, y, gate, color = 'w') => ({ t: 'receiver', id, x, y, color, gate });

/* ---------------- Plan de l’île ---------------- */
const A = areasAbysses({
  rows: marees().map((r) => r.join('')), ents: mareeEnts(),
});
function marees() {
  const g = room([[3, 3], [10, 8], [2, 8], [4, 2]], [[6, 0], [6, 10]], 13, 11);
  return g;
}
function mareeEnts() {
  return [
    S('sm1', 9, 8), S('sm2', 2, 5), S('sm3', 8, 2),
    M('mm1', 9, 5, 1), M('mm2', 5, 5, 0),
    P('pm1', 9, 6, 'W', 'vm1'), P('pm2', 7, 5, 'N', 'vm2'),
    V('vm1', 11, 8, 1), V('vm2', 1, 9, 1),
    R('rm', 11, 5, 'gr_eau'),
    { t: 'shard', id: 'sh_marees', x: 11, y: 1 },
  ];
}
const place = (z, ox, oy) => { Object.assign(z, { ox, oy }); zone(z); return z; };
place(A.greve, 0, 0);
place(A.auberge, 60, 40);
place(A.recifs, 0, 30);
place(A.ilots, 3, 66);

/* ---------------- Le lac souterrain : trois salles ---------------- */
const lacZone = (id, num, title, hint, ox, g, ents, entryGate, exitGate) => zone({
  id, region: 'lac', title, theme: 'lac', music: 'lac', num, ox, oy: 0, entry: [0, 5], entryGate, exits: [[10, 5]], hint,
  map: g.map((r) => r.join('')), ents: ents.concat([{ t: 'shard', id: 'sh_' + id, x: 1, y: 9 }]),
  puzzle: { rect: [0, 0, 11, 11], entry: [1, 5], final: exitGate, label: title },
});
lacZone('lac1', 1, 'Le Miroir d’entrée',
  'L’eau du lac renvoie la lumière dans le sens de la flèche gravée sur son bord. Tourne la lanterne et le miroir : le rayon doit descendre jusqu’au cristal.',
  36, room([[3, 7], [4, 7], [8, 2], [8, 3], [2, 9]]),
  [L('l1_lan', 2, 3, 'S'), P('l1_p', 6, 3, 'S'), M('l1_mi', 6, 8, 0), R('l1_rc', 9, 8, 'la1')], 'b_lac', 'la1');
lacZone('lac2', 2, 'La Vanne du lac',
  'Cette vanne règle le niveau du lac. Quand l’eau monte, elle renvoie le rayon vers le nord ; quand elle descend, la lumière passe.',
  51, room([[3, 2], [2, 7], [8, 9]]),
  [L('l2_lan', 8, 8, 'N'), ...[2, 3, 4, 5, 6, 7, 8, 9].map((y) => P('l2_p' + y, 5, y, 'N', 'vn_lac2')), V('vn_lac2', 8, 2, 0), R('l2_rc', 5, 1, 'la2')], 'la1', 'la2');
lacZone('lac3', 3, 'L’orbe de Fia',
  'Pose l’orbe de Fia sur un socle (touche E), puis tourne-la : c’est elle, ici, qui éclaire. Aucune lanterne dans cette salle.',
  66, room([[3, 2], [7, 8]]),
  [R('l3_rc', 8, 2, 'la3'), S('l3_s1', 9, 4), S('l3_s2', 7, 9), S('l3_s3', 5, 6), M('l3_m1', 8, 4, 0), M('l3_m2', 2, 3, 1)], 'la2', 'la3');

/* ---------------- Les Grottes (donjon) ---------------- */
place(A.grottes, 81, 0);
Object.assign(A.grottes, { puzzle: { rect: [MAREES.x, MAREES.y, MAREES.w, MAREES.h], entry: [MAREES.x + 6, MAREES.y + 1], final: 'gr_eau', label: 'Salle des Marées' } });
{ const gz = A.grottes; gz.ents = gz.ents.concat([{ t: 'shard', id: 'sh_grotte1', x: 3, y: 12 }, { t: 'shard', id: 'sh_grotte2', x: 30, y: 18 }]); }

/* ---------------- Le Phare des Abysses : trois salles à la suite ---------------- */
{
  const g = room([], [[0, 5]], 31, 11);
  for (let y = 1; y < 10; y++) { g[y][10] = '#'; g[y][20] = '#'; }
  g[5][10] = 'x'; g[5][20] = 'x';
  [[3, 2], [8, 9], [14, 6], [13, 7], [25, 3], [27, 8], [25, 6]].forEach(([x, y]) => (g[y][x] = '#'));
  const sh = (e, dx) => Object.assign({}, e, { id: 'ph_' + e.id, x: e.x + dx, y: e.y });
  const a = [
    L('a_l', 2, 8, 'E'), ...[4, 5, 6, 7, 8].map((x) => P('a_p' + x, x, 8, 'N', 'a_v')), V('a_v', 2, 2, 0), M('a_m', 4, 2, 1), R('a_r', 8, 2, 'ph_d1'),
  ].map((e) => Object.assign({}, e, { id: e.id }));
  const b = [
    S('b_s1', 2, 2), S('b_s2', 2, 8), S('b_s3', 8, 6), M('b_m1', 7, 2, 1), M('b_m2', 7, 8, 1),
    P('b_p1', 7, 3, 'W', 'b_v'), P('b_p2', 7, 4, 'W', 'b_v'), V('b_v', 5, 9, 1), R('b_r', 9, 8, 'ph_d2'),
  ].map((e) => Object.assign({}, e, { x: e.x + 10 }));
  const c = [
    L('c_l', 1, 8, 'E'), P('c_p1', 4, 8, 'N', 'c_v1'), M('c_m', 4, 4, 0), V('c_v1', 2, 6, 0),
    S('c_s1', 9, 1, 'c'), S('c_s2', 2, 2, 'c'), P('c_p2', 9, 3, 'E', 'c_v2'), V('c_v2', 8, 9, 1),
    { t: 'beacon', id: 'c_bc', x: 9, y: 4, gate: 'end', need: ['w', 'c'] },
  ].map((e) => Object.assign({}, e, { x: e.x + 20 }));
  void sh;
  // la zone entière doit rester sans fuite : les ouvertures de l’entrée sont fermées par le pont
  zone({
    id: 'phare_a', region: 'phare', title: 'Le Phare des Abysses', theme: 'phare_abysses', music: 'phare', num: 6, respawn: true, ox: 120, oy: 24,
    map: g.map((r) => r.join('')), entry: [0, 5], entryGate: 'gr_arene',
    ents: [].concat(a, b, c, [{ t: 'shard', id: 'sh_ph1', x: 1, y: 9 }, { t: 'shard', id: 'sh_ph2', x: 11, y: 9 }, { t: 'shard', id: 'sh_ph3', x: 21, y: 9 }]),
    doors: [{ gate: 'ph_d1', look: 'barrier', cells: [[10, 5]] }, { gate: 'ph_d2', look: 'barrier', cells: [[20, 5]] }],
    stages: ['ph_d1', 'ph_d2'], final: 'end',
    puzzle: [{ rect: [0, 0, 11, 11], entry: [1, 5], final: 'ph_d1', label: 'Phare, salle A' }, { rect: [10, 0, 11, 11], entry: [11, 5], final: 'ph_d2', label: 'Phare, salle B' }, { rect: [20, 0, 11, 11], entry: [21, 5], final: 'end', label: 'Phare, salle C' }],
    hint: 'Le phare exige deux lumières en même temps : celle d’une lanterne et celle de l’orbe de Fia. Chaque salle apprend un geste ; la dernière les réunit.',
    warp: { id: 'phare', x: 1, y: 3, name: 'Cristal du Phare des Abysses' },
  });
}

/* ---------------- Ponts ---------------- */
function bridge(gate, a, [ax, ay], b, [bx, by]) {
  const A_ = [byId[a].ox + ax, byId[a].oy + ay], B = [byId[b].ox + bx, byId[b].oy + by];
  if (A_[0] !== B[0] && A_[1] !== B[1]) throw new Error(`Pont ${gate} non aligné : ${A_} → ${B}`);
  const dx = Math.sign(B[0] - A_[0]), dy = Math.sign(B[1] - A_[1]);
  const cells = [];
  for (let x = A_[0] + dx, y = A_[1] + dy; x !== B[0] || y !== B[1]; x += dx, y += dy) cells.push([x, y]);
  return { gate, cells };
}
const bridges = [
  bridge('b_lac', 'greve', [29, 5], 'lac1', [0, 5]),
  bridge('la1', 'lac1', [10, 5], 'lac2', [0, 5]),
  bridge('la2', 'lac2', [10, 5], 'lac3', [0, 5]),
  bridge('la3', 'lac3', [10, 5], 'grottes', [0, 5]),
  bridge('gr_arene', 'grottes', [33, 29], 'phare_a', [0, 5]),
  bridge('b_recifs', 'greve', [15, 23], 'recifs', [15, 0]),
  bridge('b_ilots', 'recifs', [17, 29], 'ilots', [14, 0]),
];

/* ---------------- Vérifications ---------------- */
for (const z of [byId.lac1, byId.lac2, byId.lac3, byId.phare_a, byId.grottes]) {
  analysePuzzles(z).forEach((r) => {
    if (!r.ok) throw new Error(`${r.label} : ${r.problems.join(' | ')}`);
    report.push(`${r.label.padEnd(26)} ${r.devices} objets · ${r.orb ? 'orbe · ' : ''}${r.stages.map((x) => `${x.gate}: ${x.solutions} sol., ${x.moves} gestes min., ${x.states} états`).join(' · ')} · ${(r.ms / 1000).toFixed(1)} s`);
  });
}
for (const z of [A.greve, A.recifs, A.ilots, A.auberge, A.grottes]) {
  const pass = (c) => c === '.' || c === ',' || c === 'r' || c === 'c' || c === 'x';
  const seen = flood(z.map, z.spawn, pass);
  const need = [].concat(
    (z.npcs || []).filter((n) => !n.counter).map((n) => [Math.round(n.x), Math.round(n.y), 'PNJ ' + n.id]),
    (z.chests || []).map((c) => [c.x, c.y, 'coffre ' + c.id]),
    (z.props || []).filter((p) => p.door).map((p) => [p.door[0], p.door[1], 'porte ' + p.id]),
  );
  if (z.id !== 'ilots') need.push(...(z.spawns || []).map((s) => [s.x, s.y, 'ennemi ' + s.type]), ...(z.pickups || []).map((c) => [c.x, c.y, 'objet ' + c.id]));
  need.forEach(([x, y, what]) => {
    const ok = seen.has(x + ',' + y) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    if (!ok && z.id !== 'grottes' && z.id !== 'ilots') throw new Error(`${z.title} : ${what} inaccessible (${x}, ${y})`);
  });
  (z.chests || []).concat(z.pickups || []).forEach((c) => { const ch = z.map[c.y][c.x]; if (ch !== '.' && ch !== ',') throw new Error(`${z.title} : ${c.id} posé sur « ${ch} » (${c.x}, ${c.y})`); });
  report.push(`${z.title.padEnd(26)} zone d’aventure · ${seen.size} cases accessibles`);
}

const island = {
  id: 'abysses', num: 4, name: 'Les Abysses Miroirs',
  intro: 'Sous l’île, un lac souterrain dort depuis des siècles. Ses eaux turquoise ne renvoient plus la lumière : le phare des Abysses est éteint.',
  sky: { dusk: ['#06222e', '#0e5a66', '#3fd6c4'], dawn: ['#0a4a5c', '#2fb8b4', '#c8fff0'] },
  regions: {
    greve: { name: 'La Grève', zones: ['greve', 'auberge_a'], area: true },
    recifs: { name: 'Les Récifs', zones: ['recifs'], area: true },
    lac: { name: 'Le Lac souterrain', zones: ['lac1', 'lac2', 'lac3'] },
    grottes: { name: 'Les Grottes Miroirs', zones: ['grottes'], area: true },
    phare: { name: 'Le Phare des Abysses', zones: ['phare_a'] },
    ilots: { name: 'Les Îlots du Reflet', zones: ['ilots'], area: true },
  },
  pages: {
    orin8: { title: 'Journal d’Orin — VIII', text: 'Sous la mer, la lumière ne va plus tout droit. Elle rebondit sur l’eau comme un enfant sur un toit. J’ai appris à la suivre : une eau haute la renvoie, une eau basse la laisse passer. Et je me suis souvenu de Fia, qui tenait une lampe pour deux. On croit guider la lumière ; c’est elle qui nous guide.' },
  },
  stageGates: ['la1', 'ph_d1', 'ph_d2'],
  endTitle: 'Le Phare des Abysses brille',
  wisp: { name: 'Lueur marine', text: 'Une Lueur turquoise ondule entre les coraux.' },
  ending: 'Le Phare des Abysses brille. Un fragment bleu du Grand Prisme flotte au-dessus de la flamme.',
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['area', 'theme', 'music', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms', 'stages', 'final', 'respawn', 'puzzle'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};
{
  const r = checkIsland(island, 'greve');
  if (r.problems.length) throw new Error('Accessibilité :\n  ' + r.problems.join('\n  '));
  report.push(`Accessibilité          ${r.cells} cases · ${r.notes.length} élément(s) derrière des ronces ou des roches`);
}
const out = `/* Fichier généré par tools/build-abysses.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/abysses.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/abysses.js (${Z.length} zones, ${bridges.length} ponts, ${(out.length / 1024).toFixed(1)} Ko)`);
