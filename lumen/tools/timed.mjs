/* =========================================================
   LUMEN — vérification des énigmes à relais temporisé (Acte V, Pics du Vent).
   Un relais temporisé (hold = secondes) garde sa lumière après avoir été touché. Une énigme qui en contient
   ne peut pas être vérifiée par simple énumération des orientations : il faut simuler le TEMPS.
   Modèle (prudent) :
   - chaque action = une interaction avec un objet orientable (miroir : bascule ; lanterne / relais : quart de tour
     dans un sens ou dans l'autre) ;
   - le joueur marche de l'objet précédent à l'objet suivant (distance à pied BFS, 5,8 m/s × 1,5 de marge) puis
     met 0,6 s à agir ;
   - les relais non touchés voient leur délai s'écouler pendant la marche (extinctions en cascade simulées) ;
   - une porte ouverte le reste ; l'objectif est que toutes les portes demandées s'ouvrent.
   La recherche est exhaustive en largeur (nombre d'actions croissant) : elle prouve qu'une solution existe et
   donne la plus courte. holdScale < 1 durcit l'énigme (marge de sécurité).
   ========================================================= */
import { buildIsland, evaluate, walkable, escapes, stepOk, ORDER } from '../js/logic.js';   /* ALTITUDE : stepOk */

const T_STEP = 2 / 5.8, WALK_MARGIN = 1.5, ACT_COST = 0.6, QUANT = 0.5;
const states = (e) => (e.t === 'mirror' ? [0, 1] : ORDER);
const getv = (e) => (e.t === 'mirror' ? e.state : e.t === 'lantern' ? e.dir : e.out);
const setv = (e, v) => { if (e.t === 'mirror') e.state = v; else if (e.t === 'lantern') e.dir = v; else e.out = v; };

export function analyseTimed(zone, opts = {}) {
  const holdScale = opts.holdScale || 1, maxDepth = opts.maxDepth || 14, maxStates = opts.maxStates || 600000;
  const z = { ox: 0, oy: 0, map: zone.map, ents: zone.ents.map((e) => Object.assign({}, e, e.hold ? { hold: e.hold * holdScale } : {})), doors: zone.doors || [], barrier: zone.barrier, hmap: zone.hmap, h: zone.h };
  const isl = buildIsland({ zones: [z], bridges: [] });
  const rots = isl.ents.filter((e) => e.rot);
  const holders = isl.ents.filter((e) => e.t === 'relay' && e.hold);
  const gateIds = Object.keys(isl.gates);
  const gates = zone.gates || gateIds;
  const init = rots.map(getv);

  /* distances à pied (portes fermées) entre cases voisines des objets */
  const bfs = (from) => {
    const d = new Map([[from.join(','), 0]]), q = [from];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (d.has(k) || !walkable(isl, nx, ny) || !stepOk(isl, x, y, nx, ny)) continue;
        d.set(k, d.get(x + ',' + y) + 1); q.push([nx, ny]);
      }
    }
    return d;
  };
  const near = (e) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [e.x + dx, e.y + dy]).filter(([x, y]) => walkable(isl, x, y));
  const entry = zone.entry;
  const dFrom = rots.map((e) => { const m = new Map(); near(e).forEach((c) => m.set(c.join(','), bfs(c))); return m; });
  const dist = (i, j) => {   // i : -1 = entrée
    let best = Infinity;
    const A = i < 0 ? [entry] : near(rots[i]);
    const tgt = near(rots[j]).map((c) => c.join(','));
    A.forEach((a) => { const d = bfs(a); tgt.forEach((k) => { if (d.has(k) && d.get(k) < best) best = d.get(k); }); });
    return best;
  };
  const cost = Array.from({ length: rots.length + 1 }, () => Array(rots.length).fill(Infinity));
  for (let i = -1; i < rots.length; i++) for (let j = 0; j < rots.length; j++) { const d = i === j ? 0 : dist(i, j); cost[i + 1][j] = Number.isFinite(d) ? d * T_STEP * WALK_MARGIN + ACT_COST : Infinity; }

  /* état → monde → faisceaux. state = { cfg: [index], held: [[colorIdx, ticks]], open: Set } */
  const COLS = ['w', 'r', 'g', 'b', 'y', 'm', 'c'];
  const apply = (s) => {
    rots.forEach((e, i) => setv(e, states(e)[s.cfg[i]]));
    holders.forEach((e, i) => { const h = s.held[i]; e.heldC = h ? COLS[h[0]] : null; e.heldT = h ? h[1] * QUANT : 0; e.live = false; });
    gateIds.forEach((g) => (isl.gates[g].open = s.open.has(g)));
  };
  const read = (s) => {   // après evaluate : relève relais tenus et portes
    const held = holders.map((e) => (e.live ? [COLS.indexOf(e.heldC), Math.floor(e.hold / QUANT + 1e-6)] : e.heldT > 0 && e.heldC ? [COLS.indexOf(e.heldC), Math.max(0, Math.floor(e.heldT / QUANT + 1e-6))] : null));
    const open = new Set(gateIds.filter((g) => isl.gates[g].open));
    return { cfg: s.cfg, held, open };
  };
  const settle = (s) => { apply(s); evaluate(isl); return read(s); };
  /* laisse s'écouler dt secondes (extinctions en cascade) */
  const advance = (s0, dt) => {
    let s = s0, rest = dt, guard = 0;
    while (rest > 1e-9 && guard++ < 20) {
      // plus petit délai parmi les relais non touchés
      apply(s); evaluate(isl);
      const run = holders.map((e, i) => (!e.live && e.heldT > 0 ? [i, e.heldT] : null)).filter(Boolean);
      if (!run.length) return read(s);
      const dmin = Math.min(...run.map(([, t]) => t)), step = Math.min(rest, dmin);
      holders.forEach((e) => { if (!e.live && e.heldT > 0) e.heldT -= step; });
      holders.forEach((e) => { if (!e.live && e.heldT <= 1e-9) { e.heldT = 0; e.heldC = null; } });
      s = read(s); rest -= step;
      // `read` quantifie : on garde la précision en restant sur la grille de 0,5 s (arrondi vers le bas = prudent)
    }
    return s;
  };
  const key = (s, pos) => s.cfg.join('') + '|' + s.held.map((h) => (h ? h[0] + ':' + h[1] : '-')).join(',') + '|' + [...s.open].sort().join(',') + '|' + pos;

  /* ---- énumération statique (délais ignorés) : combien de solutions « sans le temps » ? ---- */
  isl.frozenTimers = true;
  const sizes = rots.map((e) => states(e).length), total = sizes.reduce((a, b) => a * b, 1);
  let staticSols = 0, escape = false;
  for (let n = 0; n < total; n++) {
    let k = n; rots.forEach((e, i) => { setv(e, states(e)[k % sizes[i]]); k = Math.floor(k / sizes[i]); });
    gateIds.forEach((g) => (isl.gates[g].open = false));
    const r = evaluate(isl);
    if (escapes(isl, r.segs)) escape = true;
    if (gates.every((g) => isl.gates[g].open)) staticSols++;
  }
  rots.forEach((e, i) => setv(e, init[i])); gateIds.forEach((g) => (isl.gates[g].open = false));
  isl.frozenTimers = false;
  holders.forEach((e) => { e.heldT = 0; e.heldC = null; e.live = false; });

  /* ---- état initial ---- */
  const s0 = settle({ cfg: init.map((v, i) => states(rots[i]).indexOf(v)), held: holders.map(() => null), open: new Set() });
  const initialSolved = gates.every((g) => s0.open.has(g));
  /* ---- recherche en largeur sur les actions ---- */
  const seen = new Map(); seen.set(key(s0, -1), true);
  let frontier = [{ s: s0, pos: -1, time: 0, seq: [] }], found = null, visited = 1;
  for (let depth = 1; depth <= maxDepth && !found && frontier.length && visited < maxStates; depth++) {
    const next = [];
    for (const node of frontier) {
      for (let j = 0; j < rots.length && !found; j++) {
        const c = cost[node.pos + 1][j]; if (!Number.isFinite(c)) continue;
        const e = rots[j], st = states(e), cur = node.s.cfg[j];
        const turns = [1];   // rotate() ne tourne que dans le sens horaire
        for (const tn of turns) {
          const adv = advance(node.s, c);
          const cfg = adv.cfg.slice(); cfg[j] = (cur + tn) % st.length;
          const s1 = settle({ cfg, held: adv.held, open: adv.open });
          const k = key(s1, j); if (seen.has(k)) continue;
          seen.set(k, true); visited++;
          const step = { id: e.id, to: st[cfg[j]], x: e.x, y: e.y, t: +(node.time + c).toFixed(1) };
          const n1 = { s: s1, pos: j, time: node.time + c, seq: node.seq.concat([step]) };
          if (gates.every((g) => s1.open.has(g))) { found = n1; break; }
          next.push(n1);
        }
      }
      if (found) break;
    }
    frontier = next;
  }
  return { ok: !escape && !initialSolved && !!found, escape, initialSolved, staticSols, solvable: !!found, seq: found ? found.seq : null, actions: found ? found.seq.length : 0, duration: found ? +found.time.toFixed(1) : 0, visited, rots: rots.length, combos: total };
}
