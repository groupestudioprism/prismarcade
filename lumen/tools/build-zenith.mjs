/* =========================================================
   LUMEN — construction de la Citadelle du Zénith (île 6, la dernière).
   node tools/build-zenith.mjs  →  écrit js/islands/zenith.js
   Les salles des portails et le phare sont dessinés à la main puis VÉRIFIÉS par force brute
   (tools/generate.mjs : analyse, analyseStages).
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { analyse, analyseStages, reach } from './generate.mjs';
import { flood } from './areas.mjs';
import { porte, auberge, portalRooms, jardins, salle, phare } from './areas-zenith.mjs';
import { checkIsland } from './reachlib.mjs';

const OX = 36, GRID = 15;
const Z = [], byId = {}, report = [];
const zone = (z) => { Z.push(z); byId[z.id] = z; return z; };
const place = (z, ox, oy) => { Object.assign(z, { ox, oy }); return zone(z); };

place(porte(), 0, 0);
const rooms = portalRooms();
rooms.forEach((r, i) => {
  zone({ id: r.id, region: 'portails', title: r.title, num: r.num, ox: OX + i * GRID, oy: 0, entry: [0, 5], entryGate: r.entryGate, exits: [[10, 5]], hint: r.hint, map: r.map, ents: r.ents, theme: 'jardins', music: 'jardins' });
});
place(jardins(), 82, 0);
place(salle(), 84, 36);
place(phare(), 98, 70);
place(auberge(), 150, 0);

function bridge(gate, a, [ax, ay], b, [bx, by]) {
  const A_ = [byId[a].ox + ax, byId[a].oy + ay], B = [byId[b].ox + bx, byId[b].oy + by];
  if (A_[0] !== B[0] && A_[1] !== B[1]) throw new Error(`Pont ${gate} non aligné : ${A_} → ${B}`);
  const dx = Math.sign(B[0] - A_[0]), dy = Math.sign(B[1] - A_[1]);
  const cells = [];
  for (let x = A_[0] + dx, y = A_[1] + dy; x !== B[0] || y !== B[1]; x += dx, y += dy) cells.push([x, y]);
  return { gate, cells };
}
const bridges = [
  bridge('b_portails', 'porte', [29, 5], 'jz1', [0, 5]),
  bridge('zg1', 'jz1', [10, 5], 'jz2', [0, 5]),
  bridge('zg2', 'jz2', [10, 5], 'jz3', [0, 5]),
  bridge('zg3', 'jz3', [10, 5], 'jardins', [0, 5]),
  bridge('b_salle', 'jardins', [17, 25], 'salle', [15, 0]),
  bridge('b_zenith', 'salle', [15, 28], 'phare_z', [1, 0]),
];

/* ---------------- Vérifications ---------------- */
const farCell = (z) => {
  const seen = reach(z.map, z.ents.map((e) => Object.assign({}, e)), z.entry, z.barrier);
  const occ = new Set(z.ents.map((e) => e.x + ',' + e.y));
  let best = null, bd = -1;
  seen.forEach((k) => {
    const [x, y] = k.split(',').map(Number);
    if (occ.has(k) || z.map[y][x] !== '.' || x === 0 || y === 0 || x === 10 || y === 10 || y === 5) return;
    const d = Math.abs(x - z.entry[0]) + Math.abs(y - z.entry[1]);
    if (d > bd) { bd = d; best = [x, y]; }
  });
  return best;
};
for (const r of rooms) {
  const z = byId[r.id];
  const p = farCell(z); z.ents.push({ t: 'shard', x: p[0], y: p[1] });
  const an = analyse(z.map, z.ents.filter((e) => e.t !== 'shard'), [r.gate], {});
  if (an.escape) throw new Error(`${z.title} : un faisceau peut quitter la salle`);
  if (!an.sols.length) throw new Error(`${z.title} : aucune solution`);
  if (an.initialSolved) throw new Error(`${z.title} : déjà résolue au départ`);
  report.push(`${z.title.padEnd(34)} ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
{ // la salle des portails de la Grande Salle
  const z = byId.salle;
  const an = analyse(z.map.map((r, y) => r.split('').map((c, x) => (x >= 21 && x <= 28 && y >= 1 && y <= 9 ? c : '#')).join('')), z.ents.filter((e) => e.t !== 'shard'), ['gs_light'], {});
  if (an.escape || !an.sols.length || an.initialSolved) throw new Error(`Grande Salle : énigme invalide (fuite ${an.escape}, solutions ${an.sols.length}, résolue ${an.initialSolved})`);
  report.push(`${'La Grande Salle (portails)'.padEnd(34)} ${an.rots.length} objets orientables · ${an.total} combinaisons · ${an.sols.length} solution(s)`);
}
{ // le phare : énigme à étapes, vérifiée étape par étape
  const z = byId.phare_z;
  const t0 = Date.now();
  const an = analyseStages({ map: z.map, ents: z.ents, doors: z.doors, entry: z.entry }, z.stages, z.final);
  if (!an.ok) throw new Error('Phare du Zénith : énigme invalide ' + JSON.stringify(an));
  report.push(`${z.title.padEnd(34)} ${an.stages.length} étapes vérifiées · ${an.rots} objets orientables · ${an.total} combinaisons · ` + an.stages.map((s) => `${s.gate}: ${s.sols}/${s.combos}`).join(' · ') + ` · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
for (const id of ['porte', 'jardins', 'salle', 'auberge_z']) {
  const z = byId[id];
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
  report.push(`${z.title.padEnd(34)} zone d'aventure · ${seen.size} cases accessibles`);
}

const island = {
  id: 'zenith', num: 6, name: 'La Citadelle du Zénith',
  intro: 'Au-dessus des nuages, la citadelle blanche et dorée attend. Sous ses remparts, la Brume monte, patiente et affamée.',
  sky: { dusk: ['#3a2a6a', '#c88ab8', '#ffd8a0'], dawn: ['#4aa8e8', '#cfe8ff', '#fff2d0'] },
  regions: {
    porte: { name: 'La Porte du Zénith', zones: ['porte', 'auberge_z'], area: true },
    portails: { name: 'Les Salles des Portails', zones: ['jz1', 'jz2', 'jz3'] },
    jardins: { name: 'Les Jardins célestes', zones: ['jardins'], area: true },
    salle: { name: 'La Grande Salle', zones: ['salle'], area: true },
    zenith: { name: 'Le Zénith', zones: ['phare_z'] },
  },
  pages: {
    orin6: { title: 'Journal d’Orin — VI', text: 'J’ai fini par comprendre pourquoi le Prisme s’est brisé. Je voulais une seule lumière, la plus pure, la plus forte, et je l’ai forcée. Une lumière qu’on force se fend. Les six couleurs ne se remplacent pas : elles se complètent. Si quelqu’un lit ces lignes au Zénith, qu’il ne répare rien tout seul. Qu’il rallume les phares, un à un, et qu’il laisse la lumière passer de main en main.' },
  },
  stageGates: ['ph_d1', 'ph_d2'],
  endTitle: 'Le Phare du Zénith brille',
  wisp: { name: 'Lueur dorée', text: 'Une Lueur d’or pâle flotte entre les colonnes.' },
  ending: 'Les six phares brillent. Le Prisme est reforgé, et l’archipel se rassemble sous la lumière partagée.',
  zones: Z.map((z) => {
    const o = { id: z.id, region: z.region, title: z.title, num: z.num || 0, secret: !!z.secret, ox: z.ox, oy: z.oy, spawn: z.area ? z.spawn : z.spawn || z.entry, entryGate: z.entryGate, barrier: z.barrier, hint: z.hint, seed: z.seed, map: z.map, ents: z.ents || [] };
    ['h', 'hmap', /* ALTITUDE */ 'area', 'theme', 'music', 'interior', 'dungeon', 'props', 'npcs', 'chests', 'pickups', 'spawns', 'doors', 'warp', 'exit', 'combatRooms', 'stages', 'final', 'respawn'].forEach((k) => { if (z[k] !== undefined) o[k] = z[k]; });
    return o;
  }),
  bridges,
};
{
  const r = checkIsland(island, 'porte');
  if (r.problems.length) throw new Error('Accessibilité :\n  ' + r.problems.join('\n  '));
  report.push(`Accessibilité                      ${r.cells} cases · ${r.posts} poteaux de grappin · ${r.notes.length} élément(s) derrière des ronces ou des roches`);
}
const out = `/* Fichier généré par tools/build-zenith.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/zenith.js', import.meta.url), out);
console.log(report.join('\n'));
console.log(`→ js/islands/zenith.js (${Z.length} zones, ${bridges.length} ponts, ${(out.length / 1024).toFixed(1)} Ko)`);
