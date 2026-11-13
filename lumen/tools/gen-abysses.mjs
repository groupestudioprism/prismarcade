/* =========================================================
   LUMEN — Acte IV : générateur de salles (orbe, eau miroir, vannes).
   Même principe que tools/generate.mjs : placement pseudo-aléatoire déterministe (graine) puis VÉRIFICATION par
   tools/analyse-abysses.mjs (solution, pas d’impasse, pas de fuite, objets accessibles, nombre de gestes minimal).
   ========================================================= */
import { buildIsland, evaluate, ORDER } from '../js/logic.js';
import { rng } from './generate.mjs';
import { analyseRoom } from './analyse-abysses.mjs';

/* spec : { rows, entry, goal, fixed: [ents], protect: [[x,y]], add: [{ t, n, ... }], minMoves, maxSols, tries } */
export function searchRoom(spec, seed = 1) {
  const rows = spec.rows, h = rows.length, w = rows[0].length;
  const tries = spec.tries || 3000;
  for (let s = seed; s < seed + tries; s++) {
    const R = rng(s);
    const used = new Set((spec.fixed || []).map((e) => e.x + ',' + e.y));
    const prot = new Set((spec.protect || []).map(([x, y]) => x + ',' + y));
    const free = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1 && rows[y][x] === '.' && !used.has(x + ',' + y) && !prot.has(x + ',' + y);
    const ents = (spec.fixed || []).map((e) => Object.assign({}, e));
    let ok = true;
    for (const a of spec.add || []) {
      for (let i = 0; i < (a.n || 1) && ok; i++) {
        let placed = false;
        for (let t = 0; t < 60 && !placed; t++) {
          const x = (a.xr ? a.xr[0] + Math.floor(R() * (a.xr[1] - a.xr[0] + 1)) : 1 + Math.floor(R() * (w - 2)));
          const y = (a.yr ? a.yr[0] + Math.floor(R() * (a.yr[1] - a.yr[0] + 1)) : 1 + Math.floor(R() * (h - 2)));
          if (!free(x, y)) continue;
          const e = { t: a.t, x, y };
          if (a.t === 'mirror') { e.state = R() < 0.5 ? 0 : 1; e.rot = true; }
          else if (a.t === 'lantern') { e.dir = ORDER[Math.floor(R() * 4)]; e.rot = !!a.rot; }
          else if (a.t === 'relay') { e.out = ORDER[Math.floor(R() * 4)]; e.rot = true; if (a.mix) e.mix = true; }
          else if (a.t === 'socle') { e.rot = true; if (a.colors) e.color = a.colors[i % a.colors.length]; }
          else if (a.t === 'receiver') { e.color = a.color || (a.colors ? a.colors[i % a.colors.length] : 'w'); e.gate = a.gate || spec.goal; }
          else if (a.t === 'vitrail') { e.color = a.color || (a.colors ? a.colors[i % a.colors.length] : 'y'); }
          else if (a.t === 'prism') { /* rien */ }
          if (a.id) e.id = a.id + (a.n > 1 ? '_' + (i + 1) : '');
          ents.push(e); used.add(x + ',' + y); placed = true;
        }
        if (!placed) ok = false;
      }
    }
    if (!ok) continue;
    // pré-filtre rapide : énumération brute (pas de joueur)
    const z = { ox: 0, oy: 0, map: rows, ents: ents.map((e) => Object.assign({}, e)), doors: spec.doors || [] };
    const isl = buildIsland({ zones: [z], bridges: [] });
    const devs = isl.ents.filter((e) => e.rot && ['lantern', 'mirror', 'relay', 'valve'].includes(e.t));
    const socles = isl.ents.filter((e) => e.t === 'socle');
    const size = (e) => (e.t === 'mirror' || e.t === 'valve' ? 2 : 4);
    const sizes = devs.map(size).concat(socles.length ? [socles.length + 1, 4] : []);
    const total = sizes.reduce((a, b) => a * b, 1);
    if (total > (spec.maxTotal || 40000)) continue;
    const goal = [].concat(spec.goal);
    const cfg = sizes.map(() => 0);
    let sols = 0, esc = false;
    for (let n = 0; n < total; n++) {
      devs.forEach((e, i) => { const v = cfg[i]; if (e.t === 'mirror' || e.t === 'valve') e.state = v; else if (e.t === 'lantern') e.dir = ORDER[v]; else e.out = ORDER[v]; });
      if (socles.length) { isl.orb.at = cfg[devs.length] ? socles[cfg[devs.length] - 1].id : null; isl.orb.dir = ORDER[cfg[devs.length + 1]]; }
      Object.values(isl.gates).forEach((g) => (g.open = false));
      const r = evaluate(isl);
      if (r.segs.some((sg) => sg.open)) { esc = true; break; }
      if (goal.every((g) => isl.gates[g] && isl.gates[g].open)) sols++;
      let i = 0; while (i < cfg.length) { cfg[i]++; if (cfg[i] < sizes[i]) break; cfg[i] = 0; i++; }
    }
    if (esc || sols < (spec.minSols || 1) || sols > (spec.maxSols || 6)) continue;
    // état de départ : tout est réglé au hasard ; on exige qu’il ne résolve rien (vérifié par l’analyse)
    const rep = analyseRoom({ map: rows, ents, doors: spec.doors, entry: spec.entry }, [], spec.goal, { enumCap: 1 });
    if (!rep.ok) continue;
    if (rep.stages[0].moves < (spec.minMoves || 4)) continue;
    return { seed: s, ents, report: rep };
  }
  throw new Error('Aucune salle valide pour ' + JSON.stringify(spec).slice(0, 100));
}
