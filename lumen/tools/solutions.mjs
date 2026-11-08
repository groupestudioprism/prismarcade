/* LUMEN — calcule une solution pour chaque porte d'énigme de lumière (utilisée par les tests de parcours).
   node tools/solutions.mjs [fichier.json]   → { île: { porte: { idObjet: état } } }
   Pour l'énigme à étapes (Phare de Verre), chaque solution ne touche que les objets accessibles à ce moment. */
import fs from 'node:fs';
import { ISLANDS } from '../js/levels.js';
import { buildIsland, evaluate, reachCells } from '../js/logic.js';
const ORDER = ['N', 'E', 'S', 'W'];
const out = {};
const states = (e) => (e.t === 'mirror' ? [0, 1] : ORDER);
const getv = (e) => (e.t === 'mirror' ? e.state : e.t === 'lantern' ? e.dir : e.out);
const setv = (e, v) => { if (e.t === 'mirror') e.state = v; else if (e.t === 'lantern') e.dir = v; else e.out = v; };
for (const def of ISLANDS) {
  out[def.id] = {};
  const isl = buildIsland(def);
  const init = Object.fromEntries(isl.ents.filter((e) => e.rot).map((e) => [e.id, getv(e)]));
  for (const z of def.zones) {
    const zi = def.zones.indexOf(z);
    const rotsAll = isl.ents.filter((e) => e.rot && e.zone === zi);
    if (!rotsAll.length) continue;
    const gateIds = [...new Set(isl.ents.filter((e) => e.zone === zi && e.gate).map((e) => e.gate))];
    const seq = z.stages ? z.stages.concat([z.final]) : gateIds;
    const open = new Set();
    for (const gid of seq) {
      Object.values(isl.gates).forEach((g) => (g.open = open.has(g.id)));
      let cand = rotsAll;
      if (z.stages) { const seen = reachCells(isl, [[z.ox + z.spawn[0], z.oy + z.spawn[1]]]); cand = rotsAll.filter((e) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)))); }
      const total = cand.reduce((a, e) => a * states(e).length, 1);
      let found = null;
      for (let n = 0; n < total && !found; n++) {
        rotsAll.forEach((e) => setv(e, init[e.id]));
        let k = n; cand.forEach((e) => { const s = states(e); setv(e, s[k % s.length]); k = Math.floor(k / s.length); });
        Object.values(isl.gates).forEach((g) => (g.open = open.has(g.id)));
        evaluate(isl);
        if (isl.gates[gid].open) found = Object.fromEntries(cand.map((e) => [e.id, getv(e)]));
      }
      out[def.id][gid] = found;
      if (z.stages) { open.add(gid); } // étapes cumulatives
      rotsAll.forEach((e) => setv(e, init[e.id]));
    }
  }
}
const f = process.argv[2];
const txt = JSON.stringify(out);
if (f) fs.writeFileSync(f, txt); else console.log(txt);
const miss = Object.entries(out).flatMap(([i, g]) => Object.entries(g).filter(([, v]) => !v).map(([k]) => i + ':' + k));
console.error('Portes sans solution :', miss.length ? miss.join(', ') : 'aucune');
