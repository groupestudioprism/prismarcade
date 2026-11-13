/* =========================================================
   LUMEN — construction des Pics du Vent (île 5).
   node tools/build-pics.mjs  →  écrit js/islands/pics.js
   Salles de miroirs : générées puis VÉRIFIÉES par force brute (tools/generate.mjs).
   Salles à relais temporisés : dessinées à la main et VÉRIFIÉES en simulant le temps (tools/timed.mjs).
   Le Phare des Vents : énigme à étapes (analyseStages). Accessibilité de toute l'île : checkIsland (pierres de vent comprises).
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { analyse, analyseStages, generate } from './generate.mjs';
import { analyseTimed } from './timed.mjs';
import { toRows, grid, rect } from './areas.mjs';
import { areasPics, courant3, sommet4, phareVents } from './areas-pics.mjs';
import { checkIsland } from './reachlib.mjs';

const Z = [], report = [], byId = {};
const zone = (z) => { Z.push(z); byId[z.id] = z; return z; };
const place = (z, ox, oy) => { Object.assign(z, { ox, oy }); return zone(z); };

const A = areasPics();
/* ---------------- Le Col et ses abords ---------------- */
place(A.col, 0, 0);
place(A.pentes, 0, 26);
place(A.moulins, 2, 56);
place(A.auberge, 150, 0);

/* ---------------- Les Courants : trois salles, deux paires de pierres de vent, une salle à relais ---------------- */
const canRoom = (chasm, openings) => {
  const rows = [];
  for (let y = 0; y < 11; y++) {
    let r = '';
    for (let x = 0; x < 15; x++) r += y === 0 || y === 10 || x === 0 || x === 14 ? '#' : x >= chasm[0] && x <= chasm[1] ? ' ' : '.';
    rows.push(r.split(''));
  }
  openings.forEach(([x, y]) => (rows[y][x] = '.'));
  return rows.map((r) => r.join(''));
};
const room11 = (openings, rocks = []) => {
  const g = Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => (x === 0 || y === 0 || x === 10 || y === 10 ? '#' : '.')));
  openings.forEach(([x, y]) => (g[y][x] = '.'));
  rocks.forEach(([x, y]) => (g[y][x] = '#'));
  return g.map((r) => r.join(''));
};
{
  const m1 = canRoom([6, 8], [[0, 5], [14, 5]]);
  const g1 = generate({
    entry: [0, 5], map: m1, kind: 'mirrors', turns: 4, lanternRot: true, decoys: 2, gate: 'pg1', exits: [[14, 5]], span: { axis: 'x', at: 7 },
    ents: [{ t: 'vent', x: 5, y: 5 }, { t: 'vent', x: 9, y: 5 }],
    reserve: [[1, 5], [2, 5], [3, 5], [4, 5], [10, 5], [11, 5], [12, 5], [13, 5], [5, 4], [5, 6], [9, 4], [9, 6]],
  }, { seed: 5100 });
  place({ id: 'cr1', region: 'courants', title: 'Le Premier Courant', theme: 'pics', music: 'pics', num: 1, entry: [0, 5], entryGate: 'b_courants', exits: [[14, 5]],
    hint: 'Les pierres de vent se font face de part et d’autre du vide : approche-toi de l’une, tourne-toi vers l’autre, et laisse le courant te porter. Tourne ce qu’il faut des deux côtés.', map: g1.map, ents: g1.ents, seed: g1.seed }, 36, 0);
  report.push(`${'Le Premier Courant'.padEnd(22)} graine ${String(g1.seed).padStart(5)} · ${g1.stats.devices} objets orientables · ${g1.stats.combos} combinaisons · ${g1.stats.solutions} solution(s)`);

  const m2 = canRoom([6, 7], [[0, 5], [14, 5]]);
  const g2 = generate({
    entry: [0, 5], map: m2, kind: 'prism', pre: 1, branches: { r: 1, g: 1, b: 1 }, lanternRot: true, decoys: 2, gate: 'pg2', exits: [[14, 5]], span: { axis: 'x', at: 6.5 }, maxLen: 6,
    ents: [{ t: 'vent', x: 5, y: 3 }, { t: 'vent', x: 8, y: 3 }, { t: 'vent', x: 5, y: 8 }, { t: 'vent', x: 8, y: 8 }],
    reserve: [[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [4, 3], [4, 8], [9, 3], [9, 8], [5, 2], [5, 4], [5, 7], [5, 9], [8, 2], [8, 4], [8, 7], [8, 9]],
  }, { seed: 5200 });
  place({ id: 'cr2', region: 'courants', title: 'Le Courant double', theme: 'pics', music: 'pics', num: 2, entry: [0, 5], entryGate: 'pg1', exits: [[14, 5]],
    hint: 'Un prisme, trois cristaux, et un vide au milieu. Deux paires de pierres de vent sont à ta disposition.', map: g2.map, ents: g2.ents, seed: g2.seed }, 57, 0);
  report.push(`${'Le Courant double'.padEnd(22)} graine ${String(g2.seed).padStart(5)} · ${g2.stats.devices} objets orientables · ${g2.stats.combos} combinaisons · ${g2.stats.solutions} solution(s)`);

  const c3 = courant3();
  place({ id: 'cr3', region: 'courants', title: 'La Mémoire du vent', theme: 'pics', music: 'pics', num: 3, entry: [0, 5], entryGate: 'pg2', exits: [[10, 5]],
    hint: 'Un relais à ressort garde la lumière quelques secondes, puis la rend. Une seule lanterne, trois relais : éclaire-les l’un après l’autre, avant que le premier ne s’éteigne.', map: c3.map, ents: c3.ents }, 78, 0);
}
place(A.terrasse, 94, 0);

/* ---------------- Les Sommets ---------------- */
place(A.neve, 89, 16);
{
  const m = room11([[0, 5], [10, 5]], [[6, 8], [7, 8], [8, 7], [5, 4]]);
  const g = generate({
    entry: [0, 5], map: m, kind: 'prism', pre: 1, branches: { r: 1, g: 1, b: 1 }, lanternRot: true, decoys: 2, gate: 'lf1', exits: [[10, 5]], maxLen: 6,
    reserve: [[1, 5], [2, 5], [3, 5], [9, 5]],
  }, { seed: 5300 });
  place({ id: 'so2', region: 'sommets', title: 'La Dalle qui s’élève', theme: 'pics', music: 'sommets', num: 4, entry: [0, 5], entryGate: 'b_so2', exits: [[10, 5]],
    hint: 'Trois cristaux, trois couleurs : le prisme les sépare. Quand les trois brillent, les dalles de pierre montent une à une et forment un chemin.', map: g.map, ents: g.ents, seed: g.seed }, 120, 21);
  report.push(`${'La Dalle qui s’élève'.padEnd(22)} graine ${String(g.seed).padStart(5)} · ${g.stats.devices} objets orientables · ${g.stats.combos} combinaisons · ${g.stats.solutions} solution(s)`);
}
place(A.cretes, 136, 21);
{
  const c4 = sommet4();
  place({ id: 'so4', region: 'sommets', title: 'Le Souffle court', theme: 'pics', music: 'sommets', num: 5, entry: [0, 5], entryGate: 'b_so4', exits: [[10, 5]],
    hint: 'Les relais ne gardent la lumière que cinq secondes. Une lanterne qui tourne vite, et des pas encore plus vifs : trois relais à allumer, ensemble.', map: c4.map, ents: c4.ents }, 167, 21);
}
{
  const ph = phareVents();
  place(Object.assign(ph, { region: 'phare' }), 183, 15);
}

/* ---------------- Ponts ---------------- */
function bridge(gate, a, [ax, ay], b, [bx, by], look) {
  const A_ = [byId[a].ox + ax, byId[a].oy + ay], B = [byId[b].ox + bx, byId[b].oy + by];
  if (A_[0] !== B[0] && A_[1] !== B[1]) throw new Error(`Pont ${gate} non aligné : ${A_} → ${B}`);
  const dx = Math.sign(B[0] - A_[0]), dy = Math.sign(B[1] - A_[1]);
  const cells = [];
  for (let x = A_[0] + dx, y = A_[1] + dy; x !== B[0] || y !== B[1]; x += dx, y += dy) cells.push([x, y]);
  const o = { gate, cells };
  if (look) o.look = look;
  return o;
}
const bridges = [
  bridge('b_courants', 'col', [29, 5], 'cr1', [0, 5]),
  bridge('pg1', 'cr1', [14, 5], 'cr2', [0, 5]),
  bridge('pg2', 'cr2', [14, 5], 'cr3', [0, 5]),
  bridge('pg3', 'cr3', [10, 5], 'gir', [0, 5]),
  bridge('b_pentes', 'col', [15, 23], 'pentes', [15, 0]),
  bridge('b_moulins', 'pentes', [17, 27], 'moulins', [15, 0]),
  bridge('b_sommets', 'gir', [5, 10], 'so1', [10, 0]),
  bridge('b_so2', 'so1', [25, 10], 'so2', [0, 5]),
  bridge('lf1', 'so2', [10, 5], 'so3', [0, 5], 'lift'),
  bridge('b_so4', 'so3', [25, 5], 'so4', [0, 5]),
  bridge('lf3', 'so4', [10, 5], 'phare_v', [0, 11], 'lift'),
];
{ // aucune zone ne doit en recouvrir une autre (marge d'une case)
  Z.forEach((a, i) => Z.slice(i + 1).forEach((b) => {
    const w = (z) => Math.max(...z.map.map((r) => r.length)), h = (z) => z.map.length;
    if (a.ox < b.ox + w(b) + 1 && b.ox < a.ox + w(a) + 1 && a.oy < b.oy + h(b) + 1 && b.oy < a.oy + h(a) + 1) throw new Error(`Zones ${a.id} et ${b.id} se chevauchent`);
  }));
}

/* ---------------- Vérifications ---------------- */
for (const id of ['cr1', 'cr2', 'so2']) {
  const z = byId[id];
  const gates = [...new Set(z.ents.filter((e) => e.gate).map((e) => e.gate))];
  const an = analyse(z.map, z.ents, gates, {});
  if (an.escape) throw new Error(`${z.title} : un faisceau peut quitter la salle`);
  if (!an.sols.length) throw new Error(`${z.title} : aucune solution`);
  if (an.initialSolved) throw new Error(`${z.title} : déjà résolue au départ`);
  report.push(`${z.title.padEnd(22)} salle de miroirs      · ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
const timed = (z, opts, label) => {
  const t0 = Date.now();
  const r = analyseTimed(z, opts);
  if (!r.ok) throw new Error(`${label} : énigme temporisée invalide ${JSON.stringify(Object.assign({}, r, { seq: undefined }))}`);
  // marge : la solution doit aussi tenir avec des relais 25 % plus courts
  const hard = analyseTimed(z, Object.assign({}, opts, { holdScale: 0.75 }));
  report.push(`${label.padEnd(22)} relais temporisés   · ${r.rots} objets · ${r.staticSols} solution(s) sans le temps · solution en ${r.actions} actions, ${r.duration} s · marge ×0,75 : ${hard.solvable ? 'oui' : 'NON'} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (!hard.solvable) throw new Error(`${label} : trop serrée (relais ×0,75 insolubles)`);
  if (r.staticSols > 0) throw new Error(`${label} : résoluble sans le temps (${r.staticSols} solution(s) statique(s))`);
  return r;
};
timed({ map: byId.cr3.map, ents: byId.cr3.ents, entry: byId.cr3.entry }, {}, 'La Mémoire du vent');
timed({ map: byId.so4.map, ents: byId.so4.ents, entry: byId.so4.entry }, {}, 'Le Souffle court');
timed({ map: byId.moulins.map, ents: byId.moulins.ents, entry: byId.moulins.entry, gates: ['md_light'], doors: byId.moulins.doors }, {}, 'Salle des relais');
{ // Phare des Vents
  const z = byId.phare_v;
  const t0 = Date.now();
  const an = analyseStages({ map: z.map, ents: z.ents, doors: z.doors, entry: z.entry }, z.stages, z.final);
  if (!an.ok) throw new Error('Phare des Vents : énigme invalide ' + JSON.stringify(an));
  report.push(`${z.title.padEnd(22)} ${an.stages.length} étapes vérifiées · ${an.rots} objets orientables · ${an.total} combinaisons · ` + an.stages.map((s) => `${s.gate}: ${s.sols}/${s.combos}`).join(' · ') + ` · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

const island = {
  id: 'pics', num: 5, name: 'Les Pics du Vent',
  intro: 'Les vents des Pics se sont tus. Les moulins ne tournent plus, les drapeaux pendent comme du linge mouillé, et la neige s’accumule sans que personne ne la balaie.',
  sky: { dusk: ['#241f4d', '#5a5a9e', '#c8a8e0'], dawn: ['#5a6ec8', '#b8c8f0', '#fff0e0'] },
  regions: {
    col: { name: 'Le Col', zones: ['col', 'auberge_p'], area: true },
    courants: { name: 'Les Courants', zones: ['cr1', 'cr2', 'cr3'] },
    terrasse: { name: 'La Terrasse des Girouettes', zones: ['gir'], area: true },
    pentes: { name: 'Les Pentes du Col', zones: ['pentes'], area: true },
    moulins: { name: 'Les Moulins', zones: ['moulins'], area: true },
    sommets: { name: 'Les Sommets', zones: ['so1', 'so2', 'so3', 'so4'] },
    phare: { name: 'Le Phare des Vents', zones: ['phare_v'] },
  },
  pages: {
    orin6: { title: 'Journal d’Orin — VI', text: 'Là-haut, j’ai compris que la lumière n’était pas seule. Le vent la porte, la plie, la retient un instant. Les relais à ressort du Col gardent un éclat pour le rendre plus tard : c’est une mémoire, pas une magie. Le Phare des Vents est bâti sur cette idée. Il exige trois lumières qui ne se ressemblent pas, et le temps de les réunir. Si j’avais eu un peu plus de patience, je n’aurais pas laissé le Grand Meunier s’éteindre tout seul.' },
  },
  stageGates: ['pg1', 'pg2', 'pg3', 'lf1', 'lf3', 'pv_d1', 'pv_d2'],
  gateText: {
    pg1: ['Le premier courant se lève', 'La lumière a trouvé son cristal : le pont se déploie.'],
    pg2: ['Le courant double se lève', 'Les trois cristaux brillent : le pont se déploie.'],
    pg3: ['Les relais se souviennent', 'Le pont vers la Terrasse se déploie.'],
    lf1: ['Les dalles s’élèvent', 'La pierre monte, dalle après dalle, vers les Crêtes.'],
    lf3: ['Les dalles s’élèvent', 'Le chemin du Phare des Vents est ouvert.'],
    pv_d1: ['Une porte de vent s’ouvre', 'Une salle de plus. Les objets de la suivante sont à portée.'],
    pv_d2: ['Une porte de vent s’ouvre', 'Une salle de plus. Les objets de la suivante sont à portée.'],
  },
  endTitle: 'Le Phare des Vents brille',
  wisp: { name: 'Lueur des vents', text: 'Une Lueur violette tourbillonne entre les flocons.' },
  ending: 'Le Phare des Vents brille. Un fragment violet du Grand Prisme flotte au-dessus de la flamme.',
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['area', 'theme', 'music', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms', 'stages', 'final', 'respawn'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};
{ // accessibilité de toute l'île (toutes portes ouvertes, grappin et pierres de vent compris)
  const r = checkIsland(island, 'col');
  if (r.problems.length) throw new Error('Accessibilité :\n  ' + r.problems.join('\n  '));
  report.push(`Accessibilité          ${r.cells} cases · ${r.posts} pierres de vent · ${r.notes.length} élément(s) derrière des ronces ou des roches`);
}
const out = `/* Fichier généré par tools/build-pics.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/pics.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/pics.js (${Z.length} zones, ${bridges.length} ponts, ${(out.length / 1024).toFixed(1)} Ko)`);
void grid; void rect; void toRows;
