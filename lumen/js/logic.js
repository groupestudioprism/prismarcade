/* =========================================================
   LUMEN — logique pure (aucun rendu) : construction de l'île,
   trajet des faisceaux, cristaux, portes. Testable sans navigateur.
   Repère : x vers la droite, y vers le bas (en 3D, y de la grille = z).
   ========================================================= */

export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const ORDER = ['N', 'E', 'S', 'W'];
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };
/* Miroirs : 0 = « / », 1 = « \ » */
const MIRROR = [
  { E: 'N', N: 'E', W: 'S', S: 'W' },
  { E: 'S', S: 'E', W: 'N', N: 'W' },
];
export const COLORS = { w: '#fff4d6', r: '#ff4d6d', g: '#3ee08f', b: '#4d8dff' };
export const COLOR_NAMES = { w: 'blanc', r: 'rouge', g: 'vert', b: 'bleu' };

const BLOCK_TERRAIN = new Set(['#', 'T']);
const BLOCKING_ENTS = new Set(['lantern', 'mirror', 'prism', 'receiver', 'beacon', 'relay']);
const PICKUPS = new Set(['shard', 'page', 'wisp', 'start']);

/* Assemble les zones d'une île en une seule grille. */
export function buildIsland(def) {
  let w = 0, h = 0;
  def.zones.forEach((z) => {
    w = Math.max(w, z.ox + Math.max(...z.map.map((r) => r.length)));
    h = Math.max(h, z.oy + z.map.length);
  });
  (def.bridges || []).forEach((b) => b.cells.forEach(([x, y]) => { w = Math.max(w, x + 1); h = Math.max(h, y + 1); }));
  const terrain = Array.from({ length: h }, () => Array(w).fill(' '));
  const zoneAt = Array.from({ length: h }, () => Array(w).fill(-1));
  const gates = {};
  const gateCell = {};
  const gate = (id, kind) => (gates[id] = gates[id] || { id, kind, cells: [], receivers: [], open: false });
  const ents = [];
  const counters = {};
  def.zones.forEach((z, zi) => {
    z.map.forEach((row, ly) => {
      for (let lx = 0; lx < row.length; lx++) {
        const ch = row[lx], x = z.ox + lx, y = z.oy + ly;
        if (ch === ' ') continue;
        zoneAt[y][x] = zi;
        if (ch === 'x') {
          terrain[y][x] = 'x';
          const g = gate(z.barrier, 'barrier');
          g.cells.push([x, y]); gateCell[x + ',' + y] = g.id;
        } else terrain[y][x] = ch;
      }
    });
    (z.ents || []).forEach((e) => {
      counters[e.t] = (counters[e.t] || 0) + 1;
      const ent = Object.assign({}, e, { id: e.id || `${e.t}${zi}_${counters[e.t]}`, x: z.ox + e.x, y: z.oy + e.y, zone: zi });
      if (ent.t === 'mirror') ent.state = ent.state || 0;
      ents.push(ent);
    });
  });
  (def.bridges || []).forEach((b) => {
    const g = gate(b.gate, 'bridge');
    b.cells.forEach(([x, y]) => { terrain[y][x] = '='; gateCell[x + ',' + y] = g.id; g.cells.push([x, y]); });
  });
  ents.forEach((e) => { if ((e.t === 'receiver' || e.t === 'beacon' || e.t === 'relay') && e.gate) gate(e.gate, e.t === 'beacon' ? 'end' : 'bridge').receivers.push(e.id); });
  const entAt = {};
  ents.forEach((e) => { if (e.t !== 'start') entAt[e.x + ',' + e.y] = e; });
  // limites de chaque zone (pour vérifier qu'aucun faisceau n'en sort)
  const zoneRects = def.zones.map((z) => ({ x0: z.ox, y0: z.oy, x1: z.ox + Math.max(...z.map.map((r) => r.length)) - 1, y1: z.oy + z.map.length - 1 }));
  return { def, w, h, terrain, zoneAt, zoneRects, ents, entAt, gates, gateCell, initial: snapshot({ ents, gates }) };
}

/* Copie de l'état modifiable (orientations, portes) */
export function snapshot(isl) {
  const dev = {};
  isl.ents.forEach((e) => { if (e.t === 'lantern') dev[e.id] = e.dir; if (e.t === 'relay') dev[e.id] = e.out; if (e.t === 'mirror') dev[e.id] = e.state; });
  const gates = {};
  Object.values(isl.gates).forEach((g) => (gates[g.id] = g.open ? 1 : 0));
  return { dev, gates };
}
export function restore(isl, snap) {
  isl.ents.forEach((e) => {
    if (!(e.id in (snap.dev || {}))) return;
    if (e.t === 'lantern' && DIRS[snap.dev[e.id]]) e.dir = snap.dev[e.id];
    if (e.t === 'relay' && DIRS[snap.dev[e.id]]) e.out = snap.dev[e.id];
    if (e.t === 'mirror') e.state = snap.dev[e.id] ? 1 : 0;
  });
  Object.values(isl.gates).forEach((g) => (g.open = !!(snap.gates || {})[g.id]));
}

export function rotate(ent) {
  if (!ent || !ent.rot) return false;
  if (ent.t === 'lantern') ent.dir = ORDER[(ORDER.indexOf(ent.dir) + 1) % 4];
  else if (ent.t === 'relay') ent.out = ORDER[(ORDER.indexOf(ent.out) + 1) % 4];
  else if (ent.t === 'mirror') ent.state = 1 - ent.state;
  else return false;
  return true;
}

export function walkable(isl, x, y) {
  if (x < 0 || y < 0 || x >= isl.w || y >= isl.h) return false;
  const t = isl.terrain[y][x];
  if (t === ' ' || BLOCK_TERRAIN.has(t)) return false;
  if (t === 'x' || t === '=') { const g = isl.gates[isl.gateCell[x + ',' + y]]; if (!g || !g.open) return false; }
  const e = isl.entAt[x + ',' + y];
  return !(e && BLOCKING_ENTS.has(e.t));
}

/* Trajet de tous les faisceaux. Renvoie les segments (en coordonnées de case) et les couleurs reçues par entité. */
export function trace(isl, active = {}) {
  const segs = [], hits = {}, seen = new Set();
  const stack = [];
  isl.ents.forEach((e) => {
    if (e.t === 'lantern') stack.push({ x: e.x, y: e.y, d: e.dir, c: 'w', from: 0.32 });
    if (e.t === 'relay' && active[e.id]) stack.push({ x: e.x, y: e.y, d: e.out, c: active[e.id], from: 0.32 });
  });
  let guard = 0;
  while (stack.length && guard++ < 500) {
    const b = stack.pop();
    const key = `${b.x},${b.y},${b.d},${b.c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const [dx, dy] = DIRS[b.d];
    const sx = b.x + dx * (b.from || 0), sy = b.y + dy * (b.from || 0);
    let x = b.x, y = b.y;
    for (;;) {
      x += dx; y += dy;
      if (x < 0 || y < 0 || x >= isl.w || y >= isl.h) { segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c, open: true }); break; }
      const t = isl.terrain[y][x];
      const blockedGate = t === 'x' && !(isl.gates[isl.gateCell[x + ',' + y]] || {}).open;
      if (BLOCK_TERRAIN.has(t) || blockedGate) { segs.push({ x0: sx, y0: sy, x1: x - dx * 0.5, y1: y - dy * 0.5, c: b.c, end: 'wall' }); break; }
      const e = isl.entAt[x + ',' + y];
      if (!e || PICKUPS.has(e.t)) continue;
      if (e.t === 'mirror') {
        segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c });
        stack.push({ x, y, d: MIRROR[e.state][b.d], c: b.c });
        break;
      }
      if (e.t === 'prism') {
        segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c });
        if (b.c === 'w') {
          stack.push({ x, y, d: LEFT[b.d], c: 'r', from: 0.3 });
          stack.push({ x, y, d: b.d, c: 'g', from: 0.3 });
          stack.push({ x, y, d: RIGHT[b.d], c: 'b', from: 0.3 });
        } else stack.push({ x, y, d: b.d, c: b.c, from: 0.3 });
        break;
      }
      if (e.t === 'receiver' || e.t === 'beacon' || e.t === 'relay') {
        segs.push({ x0: sx, y0: sy, x1: x - dx * 0.3, y1: y - dy * 0.3, c: b.c, end: 'hit' });
        (hits[e.id] = hits[e.id] || new Set()).add(b.c);
        break;
      }
      // lanterne ou autre objet plein
      segs.push({ x0: sx, y0: sy, x1: x - dx * 0.45, y1: y - dy * 0.45, c: b.c, end: 'wall' });
      break;
    }
  }
  return { segs, hits };
}

/* Fait tourner les faisceaux jusqu'à stabilité : un relais éclairé réémet la lumière reçue (blanc en priorité). */
export function traceAll(isl) {
  let active = {}, res;
  for (let i = 0; i < 12; i++) {
    res = trace(isl, active);
    const next = {};
    isl.ents.forEach((e) => {
      if (e.t !== 'relay' || !res.hits[e.id]) return;
      const h = res.hits[e.id];
      next[e.id] = h.has('w') ? 'w' : ['r', 'g', 'b'].find((c) => h.has(c));
    });
    const same = Object.keys(next).length === Object.keys(active).length && Object.keys(next).every((k) => active[k] === next[k]);
    active = next;
    if (same) break;
  }
  res.active = active;
  return res;
}

export function isLit(e, hits) {
  const h = hits[e.id];
  if (!h) return false;
  if (e.t === 'beacon') return h.has('r') && h.has('g') && h.has('b');
  if (e.t === 'relay') return h.size > 0;
  return h.has(e.color || 'w');
}

/* Calcule les faisceaux et ouvre les portes dont tous les cristaux sont éclairés.
   Une porte ouverte le reste (l'énigme est résolue) : le joueur ne peut pas se retrouver bloqué. */
export function evaluate(isl) {
  const opened = [];
  let res;
  for (let i = 0; i < 8; i++) {
    res = traceAll(isl);
    let changed = false;
    Object.values(isl.gates).forEach((g) => {
      if (g.open || !g.receivers.length) return;
      if (g.receivers.every((id) => isLit(isl.ents.find((e) => e.id === id), res.hits))) { g.open = true; opened.push(g.id); changed = true; }
    });
    if (!changed) break;
  }
  isl.ents.forEach((e) => { if (e.t === 'receiver' || e.t === 'beacon' || e.t === 'relay') { e.lit = isLit(e, res.hits); e.got = res.hits[e.id] ? [...res.hits[e.id]] : []; e.emit = res.active[e.id] || ''; } });
  return { segs: res.segs, hits: res.hits, opened };
}

/* Un faisceau sort-il de la zone d'où il part ? (utilisé par l'outil de vérification) */
export function escapes(isl, segs) {
  return segs.some((sg) => {
    const zx = Math.round(sg.x0), zy = Math.round(sg.y0);
    const zi = isl.zoneAt[zy] && isl.zoneAt[zy][zx];
    if (zi === undefined || zi < 0) return false;
    const r = isl.zoneRects[zi];
    return sg.x1 < r.x0 - 0.01 || sg.x1 > r.x1 + 0.01 || sg.y1 < r.y0 - 0.01 || sg.y1 > r.y1 + 0.01;
  });
}
