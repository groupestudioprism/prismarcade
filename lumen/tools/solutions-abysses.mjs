/* LUMEN — Acte IV : calcule UNE solution pour chaque porte d’énigme (force brute, salle par salle) et l’écrit dans tests/qa_solutions.json
   (clé « abysses »). Les tests de navigateur la rejouent par l’API (__lumen.set / __lumen.setOrb).
   node tools/solutions-abysses.mjs */
import { readFileSync, writeFileSync } from 'node:fs';
import abysses from '../js/islands/abysses.js';
import { buildIsland, evaluate, ORDER } from '../js/logic.js';

const isl = buildIsland(abysses);
const out = {};
for (const z of abysses.zones.filter((q) => q.puzzle)) {
  for (const p of [].concat(z.puzzle)) {
    const [rx, ry, rw, rh] = p.rect, X0 = z.ox + rx, Y0 = z.oy + ry;
    const inside = (e) => e.x >= X0 && e.x < X0 + rw && e.y >= Y0 && e.y < Y0 + rh;
    const devs = isl.ents.filter((e) => e.rot && ['lantern', 'mirror', 'relay', 'valve'].includes(e.t) && inside(e));
    const socles = isl.ents.filter((e) => e.t === 'socle' && inside(e));
    const size = (e) => (e.t === 'mirror' || e.t === 'valve' ? 2 : 4);
    const sizes = devs.map(size).concat(socles.length ? [socles.length + 1, 4] : []);
    const total = sizes.reduce((a, b) => a * b, 1);
    const cfg = sizes.map(() => 0);
    const goal = p.final;
    let found = null;
    const gates = Object.values(isl.gates);
    for (let n = 0; n < total && !found; n++) {
      devs.forEach((e, i) => { const v = cfg[i]; if (e.t === 'mirror' || e.t === 'valve') e.state = v; else if (e.t === 'lantern') e.dir = ORDER[v]; else e.out = ORDER[v]; });
      if (socles.length) { const k = cfg[devs.length]; isl.orb.at = k ? socles[k - 1].id : null; isl.orb.dir = ORDER[cfg[devs.length + 1]]; }
      gates.forEach((g) => (g.open = false));
      evaluate(isl);
      if (isl.gates[goal] && isl.gates[goal].open) {
        found = {};
        devs.forEach((e) => (found[e.id] = e.t === 'mirror' || e.t === 'valve' ? e.state : e.t === 'lantern' ? e.dir : e.out));
        if (isl.orb.at) found['@orb'] = { at: isl.orb.at, dir: isl.orb.dir };
      }
      let i = 0; while (i < cfg.length) { cfg[i]++; if (cfg[i] < sizes[i]) break; cfg[i] = 0; i++; }
    }
    if (!found) throw new Error('pas de solution pour ' + goal);
    out[goal] = found;
    // rétablit l’état de départ
    devs.forEach((e) => { const o = abysses.zones.find((q) => q.id === z.id).ents.find((q) => q.id === e.id); if (e.t === 'mirror' || e.t === 'valve') e.state = o.state; else if (e.t === 'lantern') e.dir = o.dir; else e.out = o.out; });
    isl.orb.at = null;
  }
}
const f = new URL('../tests/qa_solutions.json', import.meta.url);
const all = JSON.parse(readFileSync(f, 'utf8'));
all.abysses = out;
writeFileSync(f, JSON.stringify(all));
console.log(JSON.stringify(out));
