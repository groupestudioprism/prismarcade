/* LUMEN — calcule une solution pour chaque porte d'énigme de lumière (utilisée par les tests de parcours).
   node tools/solutions.mjs [fichier.json]   → { île: { porte: { idObjet: état } } }
   Pour l'énigme à étapes (Phare de Verre), chaque solution ne touche que les objets accessibles à ce moment. */
import fs from 'node:fs';
import { ISLANDS } from '../js/levels.js';
import { buildIsland, evaluate, reachCells, isMirrorLike } from '../js/logic.js';
import { analyse } from './generate.mjs';
const ORDER = ['N', 'E', 'S', 'W'];
const out = {};
const states = (e) => (isMirrorLike(e) ? [0, 1] : ORDER);
const getv = (e) => (isMirrorLike(e) ? e.state : e.t === 'lantern' ? e.dir : e.out);
const setv = (e, v) => { if (isMirrorLike(e)) e.state = v; else if (e.t === 'lantern') e.dir = v; else e.out = v; };
for (const def of ISLANDS) {
  if (def.zones.some((z) => z.puzzle)) continue;   /* ACTE IV : énigmes d’eau/orbe → tools/solutions-abysses.mjs (qui complète le même fichier) */
  out[def.id] = {};
  const isl = buildIsland(def);
  const init = Object.fromEntries(isl.ents.filter((e) => e.rot).map((e) => [e.id, getv(e)]));
  for (const z of def.zones) {
    const zi = def.zones.indexOf(z);
    const rotsAll = isl.ents.filter((e) => (e.rot || e.carry) && e.zone === zi);
    if (!rotsAll.length) continue;
    const gateIds = [...new Set(isl.ents.filter((e) => e.zone === zi && e.gate).map((e) => e.gate))];
    if (rotsAll.some((e) => e.carry) || (z.socles || []).length) {   // énigme avec objets portés : on cherche la solution qui demande le moins d'actions
      const gs = [...new Set(isl.ents.filter((e) => e.zone === zi && e.gate && !e.optional).map((e) => e.gate))];
      const an = analyse(z.map, z.ents, gs.length ? gs : [z.final].filter(Boolean), { barrier: z.barrier, socles: z.socles, entry: z.entry || z.spawn });
      const loc = (e) => (e.carry ? [e.x, e.y] : null);
      const base = Object.fromEntries(an.isl.ents.filter((e) => e.rot || e.carry).map((e) => [e.id, [getv(e), loc(e)]]));
      let best = null, bd = 1e9;
      an.sols.forEach((n) => { an.set(n); let d = 0; const sol = {}; an.isl.ents.filter((e) => e.rot || e.carry).forEach((e) => { const b = base[e.id]; if (e.rot) { sol[e.id] = getv(e); if (getv(e) !== b[0]) d++; } if (e.carry) { sol['pos:' + e.id] = [e.x - z.ox * 0, e.y]; if (e.x !== b[1][0] || e.y !== b[1][1]) d++; } }); if (d < bd) { bd = d; best = sol; } });
      // coordonnées locales → globales (la zone est isolée en (0,0) dans l'analyse)
      if (best) Object.keys(best).forEach((k) => { if (k.startsWith('pos:')) best[k] = [best[k][0] + z.ox, best[k][1] + z.oy]; });
      if (best) { const A = an.isl.ents.filter((e) => e.rot || e.carry), R = isl.ents.filter((e) => (e.rot || e.carry) && e.zone === zi), mp = Object.fromEntries(A.map((e, i) => [e.id, R[i].id]));   // ids locaux de l'analyse → ids réels
        best = Object.fromEntries(Object.entries(best).map(([k, v]) => [k.startsWith('pos:') ? 'pos:' + mp[k.slice(4)] : mp[k], v])); }
      const gk = gs[0] || z.final; if (gk) out[def.id][gk] = best;
      continue;
    }
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
