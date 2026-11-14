/* =========================================================
   LUMEN — construction de la Forêt de Verre (île 2) : UNE MONTAGNE.
   node tools/build-foret.mjs  →  écrit js/islands/foret.js
   Les salles de vitraux sont dessinées à la main puis VÉRIFIÉES par force brute (tools/generate.mjs : analyse).
   La géographie (altitudes, terrasses, escaliers, falaises) est décrite dans tools/areas-montagne.mjs et ici (placement).
   Plan (x vers l'est, y vers le sud ; la montagne monte vers le NORD, niveaux de 0,75 u) :
     pied : Vitrebourg (0-2) + sentier des vitraux · premières pentes : Lisière du Verre (2-8) · flanc est : trois salles de vitraux
     (3, 4, 5) et le Belvédère (6), escalier de la Cascade (raccourci vers le bas) · flanc ouest : sentier du Portique (8-10) et
     Temple de Verre (10) · hauts : Canopée (7-13), passerelles de cime · sommet : Phare de Verre (13).
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { analyse, analyseStages, generate, reach } from './generate.mjs';
import { grid, rect, toRows } from './areas.mjs';
import { areasForet } from './areas-foret.mjs';
import { branches, passerelle, phare } from './areas-canopee.mjs';
import { vitrebourg, lisiere, sentierTemple, belvedere, cascade, corniche, rotateZone, sizeOf } from './areas-montagne.mjs';
import { checkIsland } from './reachlib.mjs';

const Z = [];
const report = [];
const byId = {};
const zone0 = (z) => { byId[z.id] = z; return z; };   // zone d'origine (non placée)
const place = (z, ox, oy) => { z.ox = ox; z.oy = oy; Z.push(z); return z; };

/* gabarit 11×11 : murs autour, ouvertures, quelques rochers de décor */
function room(openings, rocks = []) {
  const g = Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => (x === 0 || y === 0 || x === 10 || y === 10 ? '#' : '.')));
  openings.forEach(([x, y]) => (g[y][x] = '.'));
  rocks.forEach(([x, y]) => (g[y][x] = '#'));
  return g.map((r) => r.join(''));
}

/* ---------------- Salle 1 : le premier vitrail ---------------- */
zone0(Object.assign({
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
zone0(Object.assign({
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
zone0(Object.assign({
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

/* ---------------- Zones d'aventure, Canopée, Phare (modèles d'origine) ---------------- */
const A = areasForet();
const bourg = vitrebourg(), lis = lisiere(), tpl = Object.assign(A.temple, { h: 10 }), aub = A.auberge;
const sentT = sentierTemple(), belv = belvedere(), casc = cascade(), corn = corniche();
const c1 = branches();
{ // can1 : l'arrivée se fait maintenant par le sud (depuis le Belvédère)
  const rows = c1.map.map((r) => r.split(''));
  rows[0][8] = '#'; rows[12][8] = '.';
  c1.map = rows.map((r) => r.join('')); c1.spawn = [8, 10]; c1.entry = [8, 12];
}
const canRoom = (chasm, openings) => {   // 15×11 : un vide vertical au milieu
  const rows = [];
  for (let y = 0; y < 11; y++) {
    let r = '';
    for (let x = 0; x < 15; x++) {
      if (y === 0 || y === 10 || x === 0 || x === 14) r += '#';
      else r += x >= chasm[0] && x <= chasm[1] ? ' ' : '.';
    }
    rows.push(r.split(''));
  }
  openings.forEach(([x, y]) => (rows[y][x] = '.'));
  return rows.map((r) => r.join(''));
};
const m2 = canRoom([6, 8], [[0, 5], [14, 5]]);
const g2 = generate({
  entry: [0, 5], map: m2, kind: 'mirrors', turns: 4, lanternRot: true, decoys: 2, gate: 'fc1', exits: [[14, 5]], span: { axis: 'x', at: 7 },
  ents: [{ t: 'post', x: 5, y: 5 }, { t: 'post', x: 9, y: 5 }],
  reserve: [[1, 5], [2, 5], [3, 5], [4, 5], [10, 5], [11, 5], [12, 5], [13, 5], [5, 4], [5, 6], [9, 4], [9, 6]],
}, { seed: 2100 });
const c2 = zone0({ id: 'can2', region: 'canopee', title: 'Les Feuilles de lumière', theme: 'canopee', music: 'canopee', num: 4, entry: [0, 5], entryGate: 'fc0', exits: [[14, 5]],
  hint: 'Le vide sépare deux rives. Les poteaux se relient d’un bord à l’autre : tourne ce qu’il faut des deux côtés.', map: g2.map, ents: g2.ents, seed: g2.seed });
report.push(`${'Les Feuilles de lumière'.padEnd(22)} graine ${String(g2.seed).padStart(5)} · ${g2.stats.devices} objets orientables · ${g2.stats.combos} combinaisons · ${g2.stats.solutions} solution(s)`);
const c3 = passerelle();
const m4 = canRoom([6, 7], [[0, 5], [14, 5]]);
const g4 = generate({
  entry: [0, 5], map: m4, kind: 'prism', pre: 1, branches: { r: 1, g: 1, b: 1 }, lanternRot: true, decoys: 2, gate: 'fc2', exits: [[14, 5]], span: { axis: 'x', at: 6.5 }, maxLen: 6,
  ents: [{ t: 'post', x: 5, y: 3 }, { t: 'post', x: 8, y: 3 }, { t: 'post', x: 5, y: 8 }, { t: 'post', x: 8, y: 8 }],
  reserve: [[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [4, 3], [4, 8], [9, 3], [9, 8], [5, 2], [5, 4], [5, 7], [5, 9], [8, 2], [8, 4], [8, 7], [8, 9]],
}, { seed: 3100 });
const c4 = zone0({ id: 'can4', region: 'canopee', title: 'Le Nid de lumière', theme: 'canopee', music: 'canopee', num: 5, entry: [0, 5], entryGate: 'cn_combat', exits: [[14, 5]],
  hint: 'Un prisme, trois cristaux, et un vide au milieu. Les deux paires de poteaux sont à toi.', map: g4.map, ents: g4.ents, seed: g4.seed });
report.push(`${'Le Nid de lumière'.padEnd(22)} graine ${String(g4.seed).padStart(5)} · ${g4.stats.devices} objets orientables · ${g4.stats.combos} combinaisons · ${g4.stats.solutions} solution(s)`);
const ph = Object.assign(phare(), { region: 'phare' });
byId.can1 = c1; byId.can3 = c3; byId.phare_f = ph;

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
for (const id of ['f1', 'f2', 'f3', 'can2', 'can4']) {
  const z = byId[id];
  const p = farCell(z); z.ents.push({ t: 'shard', x: p[0], y: p[1] });
  const gates = [...new Set(z.ents.filter((e) => e.gate).map((e) => e.gate))];
  const an = analyse(z.map, z.ents.filter((e) => e.t !== 'shard'), gates, {});
  if (an.escape) throw new Error(`${z.title} : un faisceau peut quitter la salle`);
  if (!an.sols.length) throw new Error(`${z.title} : aucune solution`);
  if (an.initialSolved) throw new Error(`${z.title} : déjà résolue au départ`);
  report.push(`${z.title.padEnd(22)} ${id.startsWith('can') ? 'avec grappin          ' : 'dessinée à la main'} · ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
{ // Phare de Verre : énigme à plusieurs étapes, vérifiée étape par étape (force brute)
  const z = byId.phare_f;
  const p = farCell(z); z.ents.push({ t: 'shard', x: p[0], y: p[1] });
  const t0 = Date.now();
  const an = analyseStages({ map: z.map, ents: z.ents.filter((e) => e.t !== 'shard'), doors: z.doors, entry: z.entry }, z.stages, z.final);
  if (!an.ok) throw new Error('Phare de Verre : énigme invalide ' + JSON.stringify(an));
  report.push(`${z.title.padEnd(22)} ${an.stages.length} étapes vérifiées · ${an.rots} objets orientables · ${an.total} combinaisons · ` + an.stages.map((s) => `${s.gate}: ${s.sols}/${s.combos}`).join(' · ') + ` · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
{ // la salle du temple (énigme de couleur)
  const z = tpl;
  const an = analyse(z.map.map((r, y) => r.split('').map((c, x) => (x >= 21 && x <= 28 && y >= 1 && y <= 9 ? c : '#')).join('')), z.ents, ['td_light'], {});
  if (an.escape || !an.sols.length || an.initialSolved) throw new Error(`Temple : énigme invalide (fuite ${an.escape}, solutions ${an.sols.length}, résolue ${an.initialSolved})`);
  report.push(`${z.title.padEnd(22)} salle des vitraux     · ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
for (const z of [bourg, lis, tpl, aub, belv, sentT, casc, corn]) {   // les objets posés doivent l'être sur du sol libre
  (z.chests || []).concat(z.pickups || []).forEach((c) => { const ch = z.map[c.y][c.x]; if (ch !== '.' && ch !== ',') throw new Error(`${z.title} : ${c.id} posé sur « ${ch} » (${c.x}, ${c.y})`); });
}

/* ---------------- Salles d'énigmes : on les range dans la montagne (rotations, portes) ---------------- */
const ROT = { f1: 1, f2: 1, f3: 1, can3: 2, can4: 2, phare_f: 2 };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const R = {};
['f1', 'f2', 'f3', 'can1', 'can2', 'can3', 'can4', 'phare_f'].forEach((id) => {
  const z = byId[id], k = ROT[id] || 0;
  R[id] = k ? rotateZone(z, k) : z;
  if (k && !['can3', 'phare_f'].includes(id)) {   // la rotation est une symétrie : mêmes solutions, mêmes combinaisons
    const gates = [...new Set(z.ents.filter((e) => e.gate).map((e) => e.gate))];
    const a = analyse(z.map, z.ents.filter((e) => e.t !== 'shard'), gates, {}), b = analyse(R[id].map, R[id].ents.filter((e) => e.t !== 'shard'), gates, {});
    if (a.sols.length !== b.sols.length || b.escape || a.total !== b.total) throw new Error(`${id} : la rotation change l'énigme (${a.sols.length} → ${b.sols.length})`);
  }
});
{ const z = R.phare_f, an = analyseStages({ map: z.map, ents: z.ents.filter((e) => e.t !== 'shard'), doors: z.doors, entry: z.entry }, z.stages, z.final); if (!an.ok) throw new Error('Phare de Verre tourné : énigme invalide'); }
{ const z = R.can3; const gates = []; const an = analyse(z.map, z.ents, gates, {}); if (an.escape) throw new Error('Passerelle tournée : fuite de faisceau'); }
/* portes dans les murs des salles de vitraux : la sortie de chaque salle (au nord) est une barrière de cristal (gate fgN) */
['f1', 'f2', 'f3'].forEach((id, i) => {
  const z = R[id], [ex, ey] = z.exits[0];
  const rows = z.map.map((r) => r.split('')); rows[ey][ex] = 'x'; z.map = rows.map((r) => r.join(''));
  z.doors = [{ gate: 'fg' + (i + 1), look: 'barrier', cells: [[ex, ey]] }];
  z.h = 3 + i;
});
R.can1.h = 7; R.can2.h = 8; R.can3.h = 11; R.can4.h = 12; R.phare_f.h = 13;

/* ---------------- Placement (coordonnées avant décalage ; le décalage final range tout dans le quadrant positif) ---------------- */
const SX = -22, SY = -36;
const at = (z, x, y) => place(z, x + SX, y + SY);
at(R.f1, 63, 105); at(R.f2, 63, 94); at(R.f3, 63, 83);
at(bourg, 24, 116); at(lis, 24, 88); at(tpl, 30, 59); at(aub, 75 - SX, 88 - SY);
at(belv, 63, 72); at(R.can1, 63, 59); at(R.can2, 87, 60); at(R.can3, 81, 38); at(R.can4, 66, 40); at(R.phare_f, 44, 44);
at(sentT, 24, 57); at(casc, 60, 77); at(corn, 105, 38);
['f1', 'f2', 'f3', 'can1', 'can2', 'can3', 'can4', 'phare_f'].forEach((id) => { byId[id] = R[id]; });
/* ordre des zones = ordre d'origine (les identifiants d'objets en dépendent) */
const ORDER = ['f1', 'f2', 'f3', 'vitrebourg', 'lisiere', 'temple', 'auberge_f', 'belv', 'can1', 'can2', 'can3', 'can4', 'phare_f', 'sentier_t', 'cascade', 'cime_c'];
Z.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
const zid = Object.fromEntries(Z.map((z) => [z.id, z]));
function bridge(gate, a, [ax, ay], b, [bx, by]) {
  const A_ = [zid[a].ox + ax, zid[a].oy + ay], B = [zid[b].ox + bx, zid[b].oy + by];
  if (A_[0] !== B[0] && A_[1] !== B[1]) throw new Error(`Pont ${gate} non aligné : ${A_} → ${B}`);
  const dx = Math.sign(B[0] - A_[0]), dy = Math.sign(B[1] - A_[1]);
  const cells = [];
  for (let x = A_[0] + dx, y = A_[1] + dy; x !== B[0] || y !== B[1]; x += dx, y += dy) cells.push([x, y]);
  return { gate, cells };
}
/* seules les passerelles de cime franchissent encore un vide (le gouffre entre les corniches de la Canopée) */
const bridges = [
  bridge('fc0', 'can1', [20, 6], 'can2', [0, 5]),
  bridge('fc1', 'can2', [14, 5], 'cime_c', [0, 27]),
  bridge('fc2', 'can4', R.can4.exits[0], 'phare_f', R.phare_f.entry),
];
/* les zones se touchent : aucune case de zone ne doit en recouvrir une autre */
{ const occ = new Map(); Z.forEach((z) => z.map.forEach((row, ly) => { for (let lx = 0; lx < row.length; lx++) if (row[lx] !== ' ') { const k = (z.ox + lx) + ',' + (z.oy + ly); if (occ.has(k)) throw new Error(`Chevauchement ${z.id}/${occ.get(k)} en ${k}`); occ.set(k, z.id); } })); }
{ // les arrivées doivent se trouver à côté de la zone voisine : vérifié par checkIsland (portes ouvertes)
}

const island = {
  id: 'foret', num: 2, name: 'La Forêt de Verre',
  intro: 'Les arbres de la Forêt de Verre ont perdu leurs couleurs. Les vitraux du temple ne laissent plus passer que la brume.',
  sky: { dusk: ['#1d3a5a', '#4a8aa0', '#d9a8c8'], dawn: ['#3a9ad0', '#a8e4ec', '#ffe0b8'] },
  regions: {
    bourg: { name: 'Vitrebourg', zones: ['vitrebourg', 'auberge_f'], area: true },
    vitraux: { name: 'Les Salles de Vitraux', zones: ['f1', 'f2', 'f3'] },
    belvedere: { name: 'Le Belvédère de Verre', zones: ['belv'], area: true },
    cascade: { name: 'L’escalier de la Cascade', zones: ['cascade'], area: true },
    lisiere: { name: 'La Lisière du Verre', zones: ['lisiere'], area: true },
    portique: { name: 'Le Sentier du Portique', zones: ['sentier_t'], area: true },
    temple: { name: 'Le Temple de Verre', zones: ['temple'], area: true },
    canopee: { name: 'La Canopée', zones: ['can1', 'can2', 'can3', 'can4', 'cime_c'] },
    phare: { name: 'Le Phare de Verre', zones: ['phare_f'] },
  },
  pages: {
    orin5: { title: 'Journal d’Orin — V', text: 'Dans la forêt, j’ai compris pourquoi le vert ne suffit pas. Le jaune, le magenta et le cyan n’existent qu’à deux : ce sont des lumières qui se tiennent par la main. Le Phare de Verre est bâti sur cette idée. Il ne s’allume que si trois lumières différentes acceptent de brûler ensemble. J’aurais dû m’en souvenir, plus tard, quand j’ai voulu tout éclairer d’un seul feu.' },
  },
  stageGates: ['fc0', 'ph_d1', 'ph_d2'],
  endTitle: 'Le Phare de Verre brille',
  wisp: { name: 'Lueur de verre', text: 'Une Lueur transparente flotte entre les troncs.' },
  ending: 'Le Phare de Verre brille. Un fragment vert du Grand Prisme flotte au-dessus de la flamme.',
  layout: 'montagne-1',   // marque de géographie : une ancienne sauvegarde (sans cette marque) est replacée à l'arrivée de sa zone
  gateLinks: { fg3: ['rac_cime'] },   // MONTAGNE : la descente de la Cascade s'ouvre quand le 3e vitrail est résolu (raccourci vers le bas)
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['h', 'hmap', /* ALTITUDE */ 'area', 'theme', 'music', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms', 'stages', 'final', 'respawn'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};
{ // accessibilité de toute l'île (toutes portes ouvertes, grappin compris)
  const r = checkIsland(island, 'vitrebourg');
  if (r.problems.length) throw new Error('Accessibilité :\n  ' + r.problems.join('\n  '));
  report.push(`Accessibilité          ${r.cells} cases · ${r.posts} poteaux de grappin · ${r.notes.length} élément(s) derrière des ronces ou des roches`);
}
const out = `/* Fichier généré par tools/build-foret.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/foret.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/foret.js (${Z.length} zones, ${bridges.length} passerelles de cime, ${(out.length / 1024).toFixed(1)} Ko)`);
