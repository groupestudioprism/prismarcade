/* =========================================================
   LUMEN — générateur d'énigmes.
   À partir d'un gabarit (taille, ouvertures, rochers) et d'une spécification
   (nombre de miroirs, prisme, relais, deux lanternes…), il construit une énigme
   puis la VÉRIFIE en essayant toutes les combinaisons d'orientations :
     - au moins une solution, et une seule pour les objets du trajet (les leurres sont libres) ;
     - l'état de départ ne résout rien et demande plusieurs actions ;
     - aucun faisceau ne sort de la zone, quelle que soit la combinaison ;
     - tout est accessible à pied depuis l'entrée.
   Le résultat est déterministe (graine) : on peut le régénérer à l'identique.
   ========================================================= */
import { buildIsland, evaluate, walkable, reachCells, ORDER, DIRS } from '../js/logic.js';

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };
const BACK = { N: 'S', S: 'N', E: 'W', W: 'E' };
const mirrorState = (din, dout) => ({ E: 'N', N: 'E', W: 'S', S: 'W' }[din] === dout ? 0 : 1);

/* ---------- Gabarit de terrain ---------- */
export function makeTemplate(t, R) {
  const w = t.w || 11, h = t.h || 11;
  const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? '#' : '.')));
  const protect = new Set();
  (t.openings || []).forEach(([x, y]) => {
    g[y][x] = '.';
    // couloir protégé : 2 cases vers l'intérieur
    const d = x === 0 ? [1, 0] : x === w - 1 ? [-1, 0] : y === 0 ? [0, 1] : [0, -1];
    for (let k = 0; k <= 2; k++) protect.add((x + d[0] * k) + ',' + (y + d[1] * k));
  });
  (t.reserve || []).forEach(([x, y]) => protect.add(x + ',' + y));
  (t.walls || []).forEach(([x, y, c]) => (g[y][x] = c || '#'));
  const inner = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1;
  for (let i = 0; i < (t.rocks || 0); i++) {
    const x = 1 + Math.floor(R() * (w - 2)), y = 1 + Math.floor(R() * (h - 2));
    if (protect.has(x + ',' + y) || g[y][x] !== '.') continue;
    g[y][x] = '#';
    if (R() < 0.5) { const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][Math.floor(R() * 4)]; if (inner(x + dx, y + dy) && !protect.has((x + dx) + ',' + (y + dy))) g[y + dy][x + dx] = '#'; }
  }
  for (let i = 0; i < (t.trees || 0); i++) {
    // arbres près des bords (décor), sans bloquer les couloirs
    const side = Math.floor(R() * 4), k = 1 + Math.floor(R() * (w - 2));
    const [x, y] = [[k, 1], [k, h - 2], [1, k], [w - 2, k]][side];
    if (!protect.has(x + ',' + y) && g[y] && g[y][x] === '.') g[y][x] = 'T';
  }
  return { rows: g.map((r) => r.join('')), protect };
}

/* ---------- Construction d'une énigme ---------- */
function attempt(spec, seed) {
  const R = rng(seed);
  const tpl = spec.map ? { rows: spec.map, protect: new Set((spec.reserve || []).map(([x, y]) => x + ',' + y)) } : makeTemplate(spec.template, R);
  const rows = tpl.rows, h = rows.length, w = rows[0].length;
  const cell = (x, y) => (y >= 0 && y < h && x >= 0 && x < w ? rows[y][x] : '#');
  const used = new Map();          // case → objet
  const beamCells = new Set();     // cases traversées par la solution
  (spec.ents || []).forEach((e) => used.set(e.x + ',' + e.y, e));
  const freeForDevice = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1 && cell(x, y) === '.' && !used.has(x + ',' + y) && !tpl.protect.has(x + ',' + y);
  const passable = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1 && (cell(x, y) === '.' || cell(x, y) === ' ') && !used.has(x + ',' + y);   // un faisceau traverse aussi les vides (Canopée)
  const ents = (spec.ents || []).map((e) => Object.assign({}, e));
  const pathDevices = [];
  const add = (e, onPath) => { ents.push(e); used.set(e.x + ',' + e.y, e); if (onPath) pathDevices.push(e); return e; };

  /* Avance de « len » cases ; renvoie la case d'arrivée ou null si bloqué. */
  const advance = (x, y, d, len) => {
    for (let i = 0; i < len; i++) {
      x += DIRS[d][0]; y += DIRS[d][1];
      if (!passable(x, y)) return null;
      beamCells.add(x + ',' + y);
    }
    return [x, y];
  };
  /* Trajet : turns virages (miroirs ou relais), puis une cible. */
  const maxLen = spec.maxLen || 4;   // longueur maximale d'un tronçon (plus long pour franchir un vide)
  const walk = (x, y, d, turns, relayAt = []) => {
    for (let i = 0; i < turns; i++) {
      let ok = false;
      for (let tries = 0; tries < 12 && !ok; tries++) {
        const len = 1 + Math.floor(R() * maxLen);
        const p = advance(x, y, d, len);
        if (!p || !freeForDevice(p[0], p[1])) continue;
        if (relayAt.includes(i)) {
          const outs = ORDER.filter((o) => o !== BACK[d] && o !== d);
          const out = outs[Math.floor(R() * outs.length)];
          add({ t: 'relay', x: p[0], y: p[1], out, rot: true }, true);
          [x, y, d] = [p[0], p[1], out];
        } else {
          const nd = R() < 0.5 ? LEFT[d] : RIGHT[d];
          add({ t: 'mirror', x: p[0], y: p[1], state: mirrorState(d, nd), rot: true }, true);
          [x, y, d] = [p[0], p[1], nd];
        }
        ok = true;
      }
      if (!ok) return null;
    }
    return [x, y, d];
  };
  const target = (x, y, d, color, gate) => {
    for (let tries = 0; tries < 10; tries++) {
      const len = 1 + Math.floor(R() * maxLen);
      const p = advance(x, y, d, len);
      if (p && freeForDevice(p[0], p[1])) return add({ t: 'receiver', x: p[0], y: p[1], color, gate }, false);
    }
    return null;
  };
  const randFree = () => {
    for (let i = 0; i < 200; i++) {
      const x = 1 + Math.floor(R() * (w - 2)), y = 1 + Math.floor(R() * (h - 2));
      if (freeForDevice(x, y) && !beamCells.has(x + ',' + y)) return [x, y];
    }
    return null;
  };
  const lantern = (rot) => {
    for (let i = 0; i < 200; i++) {
      const p = randFree(); if (!p) return null;
      const d = ORDER[Math.floor(R() * 4)];
      if (passable(p[0] + DIRS[d][0], p[1] + DIRS[d][1]) && passable(p[0] + 2 * DIRS[d][0], p[1] + 2 * DIRS[d][1])) {
        return add({ t: 'lantern', x: p[0], y: p[1], dir: d, rot: !!rot }, !!rot);
      }
    }
    return null;
  };

  const gate = spec.gate;
  const k = spec.kind;
  if (k === 'mirrors' || k === 'relay') {
    const L = lantern(spec.lanternRot); if (!L) return null;
    const end = walk(L.x, L.y, L.dir, spec.turns, spec.relayAt || []); if (!end) return null;
    if (!target(end[0], end[1], end[2], 'w', gate)) return null;
  } else if (k === 'twin') {
    for (const p of spec.paths) {
      const L = lantern(p.lanternRot); if (!L) return null;
      const end = walk(L.x, L.y, L.dir, p.turns, p.relayAt || []); if (!end) return null;
      if (!target(end[0], end[1], end[2], 'w', gate)) return null;
    }
  } else if (k === 'prism') {
    const L = lantern(spec.lanternRot); if (!L) return null;
    const pre = walk(L.x, L.y, L.dir, spec.pre || 0, spec.relayAt || []); if (!pre) return null;
    let P = null;
    for (let tries = 0; tries < 10 && !P; tries++) {
      const p = advance(pre[0], pre[1], pre[2], 1 + Math.floor(R() * 3));
      if (p && freeForDevice(p[0], p[1])) P = add({ t: 'prism', x: p[0], y: p[1] }, false);
    }
    if (!P) return null;
    const outDir = { r: LEFT[pre[2]], g: pre[2], b: RIGHT[pre[2]] };
    for (const c of ['r', 'g', 'b']) {
      const turns = spec.branches[c];
      if (turns === undefined || turns === null) continue;
      const end = walk(P.x, P.y, outDir[c], turns); if (!end) return null;
      if (!target(end[0], end[1], end[2], c, gate)) return null;
    }
  }
  // leurres
  for (let i = 0; i < (spec.decoys || 0); i++) {
    const p = randFree(); if (!p) break;
    add({ t: 'mirror', x: p[0], y: p[1], state: R() < 0.5 ? 0 : 1, rot: true }, false);
  }
  return { rows, ents, pathDevices, R, protect: tpl.protect };
}

/* ---------- Vérification exhaustive d'une zone isolée ---------- */
export function analyse(rows, ents, gates, opts = {}) {
  const zone = { ox: 0, oy: 0, map: rows, ents: ents.map((e) => Object.assign({}, e)), barrier: opts.barrier };
  const isl = buildIsland({ zones: [zone], bridges: [] });
  const rots = isl.ents.filter((e) => e.rot);
  const states = (e) => (e.t === 'mirror' ? [0, 1] : ORDER);
  const total = rots.reduce((a, e) => a * states(e).length, 1);
  const set = (n) => { let k = n; rots.forEach((e) => { const s = states(e), v = s[k % s.length]; k = Math.floor(k / s.length); if (e.t === 'mirror') e.state = v; else if (e.t === 'lantern') e.dir = v; else e.out = v; }); };
  const init = rots.map((e) => (e.t === 'mirror' ? e.state : e.t === 'lantern' ? e.dir : e.out));
  const resetGates = () => Object.values(isl.gates).forEach((g) => (g.open = false));
  const sols = [], reached = new Map();
  let escape = false;
  for (let n = 0; n < total; n++) {
    set(n); resetGates();
    const r = evaluate(isl);
    if (r.segs.some((s) => s.open)) { escape = true; break; }
    if (gates.every((g) => isl.gates[g] && isl.gates[g].open)) sols.push(n);
    if (opts.collect) r.segs.forEach((s) => {
      // cases traversées (pour placer un cristal facultatif)
      const dx = Math.sign(s.x1 - s.x0), dy = Math.sign(s.y1 - s.y0);
      let x = Math.round(s.x0), y = Math.round(s.y0);
      for (let i = 0; i < 30; i++) {
        x += dx; y += dy;
        if ((dx > 0 && x > s.x1 + 0.01) || (dx < 0 && x < s.x1 - 0.01) || (dy > 0 && y > s.y1 + 0.01) || (dy < 0 && y < s.y1 - 0.01)) break;
        const key = x + ',' + y;
        if (!reached.has(key)) reached.set(key, { n, c: s.c });
      }
    });
  }
  // état initial
  rots.forEach((e, i) => { if (e.t === 'mirror') e.state = init[i]; else if (e.t === 'lantern') e.dir = init[i]; else e.out = init[i]; });
  resetGates();
  const r0 = evaluate(isl);
  const initialSolved = gates.some((g) => isl.gates[g] && isl.gates[g].open);
  return { isl, rots, total, sols, escape, initialSolved, reached, set, states, lit0: r0 };
}

/* Accessibilité à pied depuis l'entrée (toutes portes ouvertes ; poteaux de grappin compris) */
export function reach(rows, ents, from, barrier) {
  const isl = buildIsland({ zones: [{ ox: 0, oy: 0, map: rows, ents, barrier }], bridges: [] });
  Object.values(isl.gates).forEach((g) => (g.open = true));
  return reachCells(isl, [from]);
}

/* ---------- Génération avec contrôle qualité ---------- */
export function generate(spec, { seed = 1, maxTries = 4000, log = false } = {}) {
  for (let s = seed; s < seed + maxTries; s++) {
    const a = attempt(spec, s);
    if (!a) continue;
    const { rows, ents, pathDevices, R } = a;
    const gates = [spec.gate];
    let an = analyse(rows, ents, gates, { collect: !!spec.optional, barrier: spec.barrier });
    if (an.escape || !an.sols.length) continue;
    // unicité sur les objets du trajet (les leurres peuvent rester libres)
    const pathIdx = an.rots.map((e, i) => (pathDevices.some((p) => p.x === e.x && p.y === e.y) ? i : -1)).filter((i) => i >= 0);
    const proj = new Set(an.sols.map((n) => { let k = n; const v = []; an.rots.forEach((e) => { const st = an.states(e); v.push(k % st.length); k = Math.floor(k / st.length); }); return pathIdx.map((i) => v[i]).join(','); }));
    if (proj.size !== 1) continue;
    // état de départ mélangé : au moins « minWrong » objets du trajet mal orientés, rien de résolu
    let ok = false;
    for (let t = 0; t < 40 && !ok; t++) {
      let wrong = 0;
      ents.forEach((e) => {
        if (!e.rot) return;
        const onPath = pathDevices.includes(e);
        if (e.t === 'mirror') { const sol = e.state; if (onPath && R() < 0.75) { e.state = 1 - sol; wrong++; } else if (!onPath) e.state = R() < 0.5 ? 0 : 1; e._sol = e._sol === undefined ? sol : e._sol; }
        else if (e.t === 'lantern') { e._sol = e._sol || e.dir; const o = ORDER.filter((d) => d !== e._sol); e.dir = R() < 0.85 ? o[Math.floor(R() * 3)] : e._sol; if (e.dir !== e._sol) wrong++; }
        else if (e.t === 'relay') { e._sol = e._sol || e.out; const o = ORDER.filter((d) => d !== e._sol); e.out = R() < 0.85 ? o[Math.floor(R() * 3)] : e._sol; if (e.out !== e._sol) wrong++; }
      });
      // remise à la solution avant le tirage suivant
      const need = Math.max(1, Math.ceil(pathDevices.length * (spec.minWrong || 0.6)));
      const check = analyse(rows, ents, gates, { barrier: spec.barrier });
      if (wrong >= need && !check.initialSolved) ok = true;
      else ents.forEach((e) => { if (e._sol !== undefined) { if (e.t === 'mirror') e.state = e._sol; else if (e.t === 'lantern') e.dir = e._sol; else if (e.t === 'relay') e.out = e._sol; } });
    }
    if (!ok) continue;
    // cristal facultatif (ouvre une chambre secrète) : une case éclairée par une AUTRE combinaison que la solution
    let optional = null;
    if (spec.optional) {
      const solCells = new Set();
      an.set(an.sols[0]);
      Object.values(an.isl.gates).forEach((g) => (g.open = false));
      evaluate(an.isl).segs.forEach((sg) => { const dx = Math.sign(sg.x1 - sg.x0), dy = Math.sign(sg.y1 - sg.y0); let x = Math.round(sg.x0), y = Math.round(sg.y0); for (let i = 0; i < 30; i++) { x += dx; y += dy; if ((dx > 0 && x > sg.x1 + 0.01) || (dx < 0 && x < sg.x1 - 0.01) || (dy > 0 && y > sg.y1 + 0.01) || (dy < 0 && y < sg.y1 - 0.01)) break; solCells.add(x + ',' + y); } });
      const occupied = new Set(ents.map((e) => e.x + ',' + e.y));
      const cands = [...an.reached.entries()].filter(([k]) => { const [x, y] = k.split(',').map(Number); return !solCells.has(k) && !occupied.has(k) && !a.protect.has(k) && rows[y][x] === '.' && x > 0 && y > 0 && x < rows[0].length - 1 && y < rows.length - 1; });
      for (let i = 0; i < cands.length && !optional; i++) {
        const [k, info] = cands[Math.floor(R() * cands.length)];
        const [x, y] = k.split(',').map(Number);
        const o = { t: 'receiver', x, y, color: info.c, gate: spec.optional.gate, optional: true };
        const test = analyse(rows, ents.concat([o]), [spec.gate, spec.optional.gate], { barrier: spec.barrier });
        const testMain = analyse(rows, ents.concat([o]), [spec.gate], { barrier: spec.barrier });
        const testOpt = analyse(rows, ents.concat([o]), [spec.optional.gate], { barrier: spec.barrier });
        if (!testMain.escape && testMain.sols.length && testOpt.sols.length && !testOpt.initialSolved && !testMain.initialSolved) optional = o;
        void test;
      }
      if (!optional) continue;
      ents.push(optional);
    }
    // accessibilité
    const entry = spec.entry;
    const seen = reach(rows, ents.map((e) => Object.assign({}, e)), entry, spec.barrier);
    const near = (e) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)));
    if (!(spec.exits || []).every(([x, y]) => seen.has(x + ',' + y))) continue;
    if (!ents.filter((e) => e.rot).every(near)) continue;
    if (!(spec.mustReach || []).every(([x, y]) => seen.has(x + ',' + y))) continue;
    // le trajet doit passer des deux côtés d'un vide (la salle impose alors de franchir le grappin)
    if (spec.span) { const side = (e) => (spec.span.axis === 'x' ? e.x : e.y) < spec.span.at; const pd = ents.filter((e) => pathDevices.includes(e) && e.rot); if (!(pd.some(side) && pd.some((e) => !side(e)))) continue; }
    const final = analyse(rows, ents, [spec.gate], { barrier: spec.barrier });
    const clean = ents.map((e) => { const o = Object.assign({}, e); delete o._sol; return o; });
    if (log) console.log(`  graine ${s} : ${final.total} combinaisons, ${final.sols.length} solution(s)`);
    return { seed: s, map: rows, ents: clean, stats: { combos: final.total, solutions: final.sols.length, devices: ents.filter((e) => e.rot).length, path: pathDevices.length } };
  }
  throw new Error('Aucune énigme valide trouvée pour ' + JSON.stringify(spec).slice(0, 120));
}

/* =========================================================
   Énigme à plusieurs étapes (Phare de Verre) : des portes (stages) qui s'ouvrent l'une après l'autre,
   puis la balise (gate finale). Vérification par force brute, étape par étape, comme un joueur :
   - à l'étape i, seuls les objets ACCESSIBLES (portes précédentes ouvertes) peuvent être tournés,
     les autres restent dans leur état initial ; une porte ouverte le reste ;
   - chaque étape doit avoir au moins une solution et ne pas être résolue au départ ;
   - la balise doit avoir au moins une solution portes ouvertes, et ne jamais s'allumer portes fermées ;
   - aucun faisceau ne doit jamais sortir de la zone (toutes combinaisons, toutes portes).
   zone = { map, ents, doors, entry } ; stages = [ids de portes dans l'ordre] ; final = id de la porte finale.
   ========================================================= */
export function analyseStages(zone, stages, final) {
  const z = { ox: 0, oy: 0, map: zone.map, ents: zone.ents.map((e) => Object.assign({}, e)), doors: zone.doors || [], barrier: zone.barrier };
  const isl = buildIsland({ zones: [z], bridges: [] });
  const rots = isl.ents.filter((e) => e.rot);
  const states = (e) => (e.t === 'mirror' ? [0, 1] : ORDER);
  const getv = (e) => (e.t === 'mirror' ? e.state : e.t === 'lantern' ? e.dir : e.out);
  const setv = (e, v) => { if (e.t === 'mirror') e.state = v; else if (e.t === 'lantern') e.dir = v; else e.out = v; };
  const init = rots.map(getv);
  const setOpen = (open) => Object.values(isl.gates).forEach((g) => (g.open = open.has(g.id)));
  const accessible = (open) => {
    setOpen(open);
    const seen = reachCells(isl, [zone.entry]);
    return rots.map((e) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy))));
  };
  const report = { stages: [], escape: false, total: rots.reduce((a, e) => a * states(e).length, 1), rots: rots.length };
  /* énumère les combinaisons des objets d'indices idx (les autres restent à l'état initial) */
  const enumerate = (idx, open, wanted, fn) => {
    const sizes = idx.map((i) => states(rots[i]).length);
    const tot = sizes.reduce((a, b) => a * b, 1);
    for (let n = 0; n < tot; n++) {
      rots.forEach((e, i) => setv(e, init[i]));
      let k = n; idx.forEach((i, j) => { setv(rots[i], states(rots[i])[k % sizes[j]]); k = Math.floor(k / sizes[j]); });
      setOpen(open);
      const r = evaluate(isl);
      if (r.segs.some((s) => s.open)) report.escape = true;
      if (wanted.every((g) => isl.gates[g].open)) fn(n);
    }
    rots.forEach((e, i) => setv(e, init[i]));
  };
  const open = new Set();
  const seq = stages.concat([final]);
  seq.forEach((gid, si) => {
    const acc = accessible(open);
    const idx = rots.map((_, i) => i).filter((i) => acc[i]);
    // état de départ : rien n'est résolu
    rots.forEach((e, i) => setv(e, init[i])); setOpen(open); evaluate(isl);
    const initialSolved = isl.gates[gid].open;
    let sols = 0;
    enumerate(idx, open, [gid], () => sols++);
    report.stages.push({ gate: gid, accessible: idx.length, combos: idx.reduce((a, i) => a * states(rots[i]).length, 1), sols, initialSolved });
    open.add(gid);
  });
  // la balise ne doit jamais s'allumer si une porte reste fermée (aucun raccourci)
  report.shortcut = false;
  for (let k = 0; k < stages.length; k++) {
    const op = new Set(stages.slice(0, k)); const all = rots.map((_, i) => i);
    enumerate(all, op, [final], () => { report.shortcut = true; });
  }
  // fuites : toutes combinaisons, avec chaque préfixe de portes ouvertes
  for (let k = 0; k <= stages.length; k++) enumerate(rots.map((_, i) => i), new Set(stages.slice(0, k)), [], () => {});
  report.ok = !report.escape && !report.shortcut && report.stages.every((s) => s.sols > 0 && !s.initialSolved);
  return report;
}
