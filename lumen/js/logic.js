/* =========================================================
   LUMEN — logique pure (aucun rendu) : construction de l'île,
   trajet des faisceaux, cristaux, portes. Testable sans navigateur.
   Repère : x vers la droite, y vers le bas (en 3D, y de la grille = z).
   ========================================================= */

import { poolUp, poolDir, orbSource, glideLinks } from './mech/eau.js';   /* ACTE IV */
export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const ORDER = ['N', 'E', 'S', 'W'];
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };
/* Miroirs : 0 = « / », 1 = « \ » */
const MIRROR = [
  { E: 'N', N: 'E', W: 'S', S: 'W' },
  { E: 'S', S: 'E', W: 'N', N: 'W' },
];
export const COLORS = { w: '#fff4d6', r: '#ff4d6d', g: '#3ee08f', b: '#4d8dff', y: '#ffd84d', m: '#ff6bd6', c: '#4dd8ff' };
export const COLOR_NAMES = { w: 'blanc', r: 'rouge', g: 'vert', b: 'bleu', y: 'jaune', m: 'magenta', c: 'cyan' };

/* Mélange des couleurs (Forêt de Verre) : une couleur est un ensemble de primaires.
   jaune = rouge + vert · magenta = rouge + bleu · cyan = vert + bleu · blanc = les trois. */
const PARTS = { w: 'rgb', r: 'r', g: 'g', b: 'b', y: 'rg', m: 'rb', c: 'gb' };
const BY_PARTS = { r: 'r', g: 'g', b: 'b', rg: 'y', rb: 'm', gb: 'c', rgb: 'w' };
/* couleur obtenue en réunissant des faisceaux (relais mélangeur) */
export function mixColors(list) {
  const set = new Set(); list.forEach((c) => (PARTS[c] || '').split('').forEach((p) => set.add(p)));
  return BY_PARTS[['r', 'g', 'b'].filter((p) => set.has(p)).join('')] || null;
}
/* couleur qui traverse un vitrail : le vitrail ne laisse passer que ses propres primaires */
export function filterColor(beam, glass) {
  const a = PARTS[beam] || '', b = PARTS[glass] || '';
  return b && [...b].every((p) => a.includes(p)) ? glass : null;
}

/* Terrain : '.' herbe · ',' chemin · '#' roche / mur · 'T' arbre · 'H' bâtiment ou décor · '~' eau
   'r' ronces (coupées par une lame) · 'c' roche fissurée (brisée au marteau) · 'x' porte · '=' pont */
export const BLOCK_TERRAIN = new Set(['#', 'T', 'H', '~', 'r', 'c']);
const BLOCKING_ENTS = new Set(['lantern', 'mirror', 'prism', 'receiver', 'beacon', 'relay', 'vitrail', 'post', 'splitter', 'valve', 'socle' /* ACTE IV : socle d’orbe */]);
/* ACTE III — Objets orientables à deux états « / » et « \\ » (miroir, lame semi-réfléchissante) */
export const isMirrorLike = (e) => e.t === 'mirror' || e.t === 'splitter';
const PICKUPS = new Set(['shard', 'page', 'wisp', 'start', 'ledge' /* ACTE IV */]);

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
  const gate = (id, kind, look) => (gates[id] = gates[id] || { id, kind, look: look || kind, cells: [], receivers: [], open: false });
  const ents = [];
  const socles = [], socleAt = {};
  const counters = {};
  def.zones.forEach((z, zi) => {
    z.map.forEach((row, ly) => {
      for (let lx = 0; lx < row.length; lx++) {
        const ch = row[lx], x = z.ox + lx, y = z.oy + ly;
        if (ch === ' ') continue;
        zoneAt[y][x] = zi;
        if (ch === 'x') {
          terrain[y][x] = 'x';
          // une zone peut avoir plusieurs portes (doors) ; sinon, la barrière de la zone
          const door = (z.doors || []).find((d) => d.cells.some(([dx, dy]) => dx === lx && dy === ly));
          const g = door ? gate(door.gate, 'barrier', door.look) : gate(z.barrier, 'barrier', z.barrier === 'lens' ? 'seal' : 'barrier');
          if (door && door.key) g.key = door.key;
          if (door && door.hint) g.hint = door.hint;   /* ACTE IV : message de la porte verrouillée */
          if (door && door.use) g.use = door.use;      /* ACTE IV : libellé de l’action */
          g.cells.push([x, y]); gateCell[x + ',' + y] = g.id;
        } else terrain[y][x] = ch;
      }
    });
    (z.ents || []).forEach((e) => {
      counters[e.t] = (counters[e.t] || 0) + 1;
      const ent = Object.assign({}, e, { id: e.id || `${e.t}${zi}_${counters[e.t]}`, x: z.ox + e.x, y: z.oy + e.y, zone: zi });
      if (isMirrorLike(ent)) ent.state = ent.state || 0;
      if (ent.carry) { ent.carried = false; ent.home = [ent.x, ent.y]; }
      ents.push(ent);
    });
    /* ACTE III — socles : emplacements où l'on peut poser les objets portés (capacité « Porter ») */
    (z.socles || []).forEach(([sx, sy], k) => { const so = { id: `socle${zi}_${k + 1}`, x: z.ox + sx, y: z.oy + sy, zone: zi }; socles.push(so); socleAt[so.x + ',' + so.y] = so; });
  });
  (def.bridges || []).forEach((b) => {
    const g = gate(b.gate, 'bridge');
    b.cells.forEach(([x, y]) => { terrain[y][x] = '='; gateCell[x + ',' + y] = g.id; g.cells.push([x, y]); });
  });
  ents.forEach((e) => { if ((e.t === 'receiver' || e.t === 'beacon' || e.t === 'relay') && e.gate) gate(e.gate, e.t === 'beacon' ? 'end' : 'bridge').receivers.push(e.id); });
  const entAt = {};
  ents.forEach((e) => { if (e.t !== 'start') entAt[e.x + ',' + e.y] = e; });
  /* ACTE IV : vannes, socles d’orbe et orbe (état de l’île, voir js/mech/eau.js). Le registre des socles d’orbe s’appelle « orbSocles » (« socles » est réservé aux socles de l’objet porté de l’Acte III). */
  const valves = {}, orbSocles = {}, orb = { at: null, dir: 'E' };
  ents.forEach((e) => { if (e.t === 'valve') { e.state = e.state ? 1 : 0; valves[e.id] = e; } if (e.t === 'socle') orbSocles[e.id] = e; });
  ents.forEach((e) => { if (e.carry && socleAt[e.x + ',' + e.y] === undefined) throw new Error(`Objet porté ${e.id} hors d’un socle (${e.x}, ${e.y})`); });
  // limites de chaque zone (pour vérifier qu'aucun faisceau n'en sort)
  const zoneRects = def.zones.map((z) => ({ x0: z.ox, y0: z.oy, x1: z.ox + Math.max(...z.map.map((r) => r.length)) - 1, y1: z.oy + z.map.length - 1 }));
  // solid : cases bloquées par des objets posés en jeu (coffres, PNJ immobiles…)
  /* ACTE III */ // tempête de sable : portée maximale des faisceaux (null = aucune tempête) dans les zones marquées « storm »
  const stormZone = def.zones.map((z) => !!z.storm);
  return { def, w, h, terrain, zoneAt, zoneRects, ents, entAt, gates, gateCell, socles, socleAt, stormZone, range: null, solid: new Set(), valves, orbSocles, orb, initial: snapshot({ ents, gates, orb }) };
}

/* Copie de l'état modifiable (orientations, portes) */
export function snapshot(isl) {
  const dev = {}, pos = {};
  isl.ents.forEach((e) => { if (e.t === 'lantern') dev[e.id] = e.dir; if (e.t === 'relay') dev[e.id] = e.out; if (isMirrorLike(e)) dev[e.id] = e.state; if (e.t === 'valve') dev[e.id] = e.state; /* ACTE IV */ if (e.carry) pos[e.id] = e.carried ? null : [e.x, e.y]; });
  if (isl.orb && isl.orb.at) dev['@orb'] = { at: isl.orb.at, dir: isl.orb.dir };   /* ACTE IV : l’orbe de Fia */
  const gates = {};
  Object.values(isl.gates).forEach((g) => (gates[g.id] = g.open ? 1 : 0));
  return { dev, gates, pos };
}
export function restore(isl, snap) {
  if (isl.orb) {   /* ACTE IV */
    const o = (snap.dev || {})['@orb'];
    isl.orb.at = o && isl.orbSocles[o.at] ? o.at : null; isl.orb.dir = o && DIRS[o.dir] ? o.dir : 'E';
  }
  // ACTE III : objets portés : position (sur un socle de leur zone) ou « en main » (null). On les range tous d'abord, puis on les repose.
  const moved = isl.ents.filter((e) => e.carry && snap.pos && e.id in snap.pos);
  moved.forEach((e) => liftEnt(isl, e));
  moved.forEach((e) => {
    const p = snap.pos[e.id], so = Array.isArray(p) && isl.socleAt[p[0] + ',' + p[1]];
    if (so && so.zone === e.zone && !isl.entAt[p[0] + ',' + p[1]]) placeEnt(isl, e, p[0], p[1]);
    else if (p !== null && p !== 0) { const f = isl.socles.find((q) => q.zone === e.zone && q.x === e.home[0] && q.y === e.home[1] && !isl.entAt[q.x + ',' + q.y]) || freeSocles(isl, e.zone)[0]; if (f) placeEnt(isl, e, f.x, f.y); }
  });
  isl.ents.forEach((e) => {
    if (!(e.id in (snap.dev || {}))) return;
    if (e.t === 'lantern' && DIRS[snap.dev[e.id]]) e.dir = snap.dev[e.id];
    if (e.t === 'relay' && DIRS[snap.dev[e.id]]) e.out = snap.dev[e.id];
    if (isMirrorLike(e)) e.state = snap.dev[e.id] ? 1 : 0;
    if (e.t === 'valve') e.state = snap.dev[e.id] ? 1 : 0;   /* ACTE IV */
  });
  Object.values(isl.gates).forEach((g) => (g.open = !!(snap.gates || {})[g.id]));
}

export function rotate(ent) {
  if (!ent || !ent.rot) return false;
  if (ent.t === 'lantern') ent.dir = ORDER[(ORDER.indexOf(ent.dir) + 1) % 4];
  else if (ent.t === 'relay') ent.out = ORDER[(ORDER.indexOf(ent.out) + 1) % 4];
  else if (isMirrorLike(ent)) ent.state = 1 - ent.state;
  else if (ent.t === 'valve') ent.state = 1 - ent.state;   /* ACTE IV */
  else return false;
  return true;
}

/* ACTE III ---------- Objets portés (capacité « Porter ») : miroirs, lames, prismes et vitraux posés sur des socles ---------- */
export function liftEnt(isl, e) {
  if (isl.entAt[e.x + ',' + e.y] === e) delete isl.entAt[e.x + ',' + e.y];
  e.carried = true;
}
export function placeEnt(isl, e, x, y) {
  if (isl.entAt[e.x + ',' + e.y] === e) delete isl.entAt[e.x + ',' + e.y];
  e.x = x; e.y = y; e.carried = false; isl.entAt[x + ',' + y] = e;
}
/* socles libres de la zone d'un objet porté */
export const freeSocles = (isl, zone) => isl.socles.filter((so) => so.zone === zone && !isl.entAt[so.x + ',' + so.y]);

export function walkable(isl, x, y) {
  if (x < 0 || y < 0 || x >= isl.w || y >= isl.h) return false;
  const t = isl.terrain[y][x];
  if (t === ' ' || BLOCK_TERRAIN.has(t)) return false;
  if (t === 'x' || t === '=') { const g = isl.gates[isl.gateCell[x + ',' + y]]; if (!g || !g.open) return false; }
  if (isl.solid && isl.solid.has(x + ',' + y)) return false;
  const e = isl.entAt[x + ',' + y];
  return !(e && (BLOCKING_ENTS.has(e.t) || (e.t === 'pool' && poolUp(isl, e)) /* ACTE IV : bassin en eau */));
}

/* Trajet de tous les faisceaux. Renvoie les segments (en coordonnées de case) et les couleurs reçues par entité. */
export function trace(isl, active = {}) {
  const segs = [], hits = {}, seen = new Set();
  const stack = [];
  /* ACTE III */ // tempête de sable : un faisceau né dans une zone exposée ne porte que « isl.range » cases (le reste de la zone n'est pas touché)
  const reach = (e) => (isl.range && isl.stormZone && isl.stormZone[e.zone] ? isl.range : Infinity);
  isl.ents.forEach((e) => {
    if (e.carried) return;
    if (e.t === 'lantern') stack.push({ x: e.x, y: e.y, d: e.dir, c: 'w', from: 0.32, left: reach(e) });
    if (e.t === 'relay' && active[e.id]) stack.push({ x: e.x, y: e.y, d: e.out, c: active[e.id], from: 0.32, left: reach(e) });
  });
  { const os = orbSource(isl); if (os) stack.push(os); }   /* ACTE IV : l’orbe de Fia est une source de lumière */
  let guard = 0;
  while (stack.length && guard++ < 800) {
    const b = stack.pop();
    const key = `${b.x},${b.y},${b.d},${b.c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const [dx, dy] = DIRS[b.d];
    const sx = b.x + dx * (b.from || 0), sy = b.y + dy * (b.from || 0);
    let x = b.x, y = b.y, left = b.left === undefined ? Infinity : b.left;
    for (;;) {
      if (left <= 0) { segs.push({ x0: sx, y0: sy, x1: x + dx * 0.35, y1: y + dy * 0.35, c: b.c, end: 'fade' }); break; }   // la tempête a éteint le faisceau
      x += dx; y += dy; left--;
      if (x < 0 || y < 0 || x >= isl.w || y >= isl.h) { segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c, open: true }); break; }
      const t = isl.terrain[y][x];
      const blockedGate = t === 'x' && !(isl.gates[isl.gateCell[x + ',' + y]] || {}).open;
      if (BLOCK_TERRAIN.has(t) || blockedGate) { segs.push({ x0: sx, y0: sy, x1: x - dx * 0.5, y1: y - dy * 0.5, c: b.c, end: 'wall' }); break; }
      const e = isl.entAt[x + ',' + y];
      if (!e || PICKUPS.has(e.t) || e.carried) continue;
      /* ACTE IV : eau miroir (bassin en eau : renvoie la lumière dans le sens de sa flèche ; à sec : la lumière passe) et socle vide (la lumière passe) */
      if (e.t === 'pool') { if (!poolUp(isl, e)) continue; segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c }); stack.push({ x, y, d: poolDir(e), c: b.c }); break; }
      if (e.t === 'socle' && !(isl.orb && isl.orb.at === e.id)) continue;
      if (e.t === 'mirror') {
        segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c });
        stack.push({ x, y, d: MIRROR[e.state][b.d], c: b.c, left });
        break;
      }
      if (e.t === 'splitter') {   /* ACTE III */ // lame semi-réfléchissante : la lumière passe tout droit ET se réfléchit à 90°
        segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c });
        stack.push({ x, y, d: b.d, c: b.c, from: 0.3, left });
        stack.push({ x, y, d: MIRROR[e.state][b.d], c: b.c, from: 0.3, left });
        break;
      }
      if (e.t === 'vitrail') {   // vitrail : ne laisse passer que sa couleur
        segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c });
        const f = filterColor(b.c, e.color);
        if (f) stack.push({ x, y, d: b.d, c: f, from: 0.3, left });
        break;
      }
      if (e.t === 'prism') {
        segs.push({ x0: sx, y0: sy, x1: x, y1: y, c: b.c });
        if (b.c === 'w') {
          stack.push({ x, y, d: LEFT[b.d], c: 'r', from: 0.3, left });
          stack.push({ x, y, d: b.d, c: 'g', from: 0.3, left });
          stack.push({ x, y, d: RIGHT[b.d], c: 'b', from: 0.3, left });
        } else stack.push({ x, y, d: b.d, c: b.c, from: 0.3, left });
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
      next[e.id] = e.mix ? mixColors([...h]) : h.has('w') ? 'w' : ['r', 'g', 'b', 'y', 'm', 'c'].find((c) => h.has(c));
    });
    const same = Object.keys(next).length === Object.keys(active).length && Object.keys(next).every((k) => active[k] === next[k]);
    active = next;
    if (same) break;
  }
  res.active = active;
  return res;
}

/* Couleurs qu'une balise doit recevoir en même temps (phare de l'Aube : r, g, b · Phare de Verre : y, m, c) */
export const beaconNeed = (e) => e.need || ['r', 'g', 'b'];

export function isLit(e, hits) {
  const h = hits[e.id];
  if (!h) return false;
  if (e.t === 'beacon') return beaconNeed(e).every((c) => h.has(c));
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


/* =========================================================
   Grappin de lumière (Forêt de Verre, Canopée)
   Un poteau (« post ») se relie en ligne droite à un autre poteau, de l'autre côté d'un vide
   (case vide, eau ou pont encore éteint). Lyra se tient à côté du poteau, tournée vers l'autre,
   et atterrit juste derrière le poteau d'arrivée.
   ========================================================= */
export const POST_RANGE = 9;
const WALLS_FOR_ROPE = new Set(['#', 'T', 'H', 'c', 'r']);
export function postLinks(isl, post) {
  const out = [];
  for (const d of ORDER) {
    const [dx, dy] = DIRS[d];
    let gap = 0;
    for (let k = 1; k <= POST_RANGE; k++) {
      const x = post.x + dx * k, y = post.y + dy * k;
      if (x < 0 || y < 0 || x >= isl.w || y >= isl.h) break;
      const t = isl.terrain[y][x];
      if (WALLS_FOR_ROPE.has(t)) break;
      if (t === 'x' && !(isl.gates[isl.gateCell[x + ',' + y]] || {}).open) break;
      const e = isl.entAt[x + ',' + y];
      if (e && e.t === 'post') {
        const land = [x + dx, y + dy];
        if (gap > 0 && walkable(isl, land[0], land[1])) out.push({ dir: d, to: e, land, gap, from: post });
        break;
      }
      if (e && BLOCKING_ENTS.has(e.t)) break;
      if (t === ' ' || t === '~' || (t === '=' && !(isl.gates[isl.gateCell[x + ',' + y]] || {}).open)) gap++;
    }
  }
  return out;
}

/* Cases accessibles à pied depuis « starts », grappin compris (utilisé par les outils de vérification).
   Les ronces et roches fissurées sont considérées comme franchissables si opts.cut est vrai. */
export function reachCells(isl, starts, opts = {}) {
  const ok = (x, y) => walkable(isl, x, y) || (opts.cut && ['r', 'c'].includes((isl.terrain[y] || [])[x]));
  const seen = new Set(), q = [];
  starts.forEach(([x, y]) => { seen.add(x + ',' + y); q.push([x, y]); });
  const posts = isl.ents.filter((e) => e.t === 'post');
  const linksOf = new Map(posts.map((p) => [p, opts.posts === false ? [] : postLinks(isl, p)]));
  const ledges = new Map(isl.ents.filter((e) => e.t === 'ledge').map((e) => [e.x + ',' + e.y, opts.glide === false ? [] : glideLinks(isl, e, walkable)]));   /* ACTE IV : plané */
  while (q.length) {
    const [x, y] = q.shift();
    for (const l of ledges.get(x + ',' + y) || []) { const lk = l.land.join(','); if (!seen.has(lk)) { seen.add(lk); q.push(l.land); } }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (!seen.has(k) && ok(nx, ny)) { seen.add(k); q.push([nx, ny]); }
      const p = isl.entAt[k];
      if (p && p.t === 'post') for (const l of linksOf.get(p) || []) { const lk = l.land.join(','); if (!seen.has(lk)) { seen.add(lk); q.push(l.land); } }
    }
  }
  return seen;
}

/* ACTE IV : liaisons de plané (voir js/mech/eau.js) */
export const glideFrom = (isl, ledge) => glideLinks(isl, ledge, walkable);
