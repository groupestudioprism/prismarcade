/* =========================================================
   LUMEN — Acte IV : vérification des salles à eau miroir, vannes et orbe.
   Contrairement à tools/generate.mjs (qui essaie toutes les combinaisons sans tenir compte du joueur),
   on explore ici l’espace des états comme un joueur : un état = (réglage de tous les objets, zone de marche du joueur).
   Un geste = tourner / basculer un objet adjacent à la zone où le joueur se trouve.
   On vérifie : (1) une solution existe, (2) elle n’est pas là au départ, (3) AUCUN état atteignable n’est une impasse
   (depuis chaque état on peut encore résoudre : vannes et orbe sont toujours réversibles),
   (4) aucun faisceau ne sort de la salle, (5) tous les objets deviennent accessibles à un moment,
   (6) la balise ne s’allume jamais portes fermées (raccourci).
   ========================================================= */
import { buildIsland, evaluate, reachCells, walkable, ORDER } from '../js/logic.js';

const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function analyseRoom(zone, stages = [], final = null, opts = {}) {
  const z = { ox: 0, oy: 0, map: zone.map, ents: zone.ents.map((e) => Object.assign({}, e)), doors: zone.doors || [], barrier: zone.barrier, hmap: zone.hmap, h: zone.h };
  const isl = buildIsland({ zones: [z], bridges: [] });
  const devs = isl.ents.filter((e) => e.rot && ['lantern', 'mirror', 'relay', 'valve'].includes(e.t));
  const socles = isl.ents.filter((e) => e.t === 'socle');
  const hasOrb = socles.length > 0;
  const size = (e) => (e.t === 'mirror' || e.t === 'valve' ? 2 : 4);
  const getv = (e) => (e.t === 'mirror' || e.t === 'valve' ? e.state : e.t === 'lantern' ? ORDER.indexOf(e.dir) : ORDER.indexOf(e.out));
  const setv = (e, v) => { if (e.t === 'mirror' || e.t === 'valve') e.state = v; else if (e.t === 'lantern') e.dir = ORDER[v]; else e.out = ORDER[v]; };
  const init = devs.map(getv).concat(hasOrb ? [0, ORDER.indexOf('E')] : []);
  const nd = devs.length;
  const apply = (cfg) => {
    devs.forEach((e, i) => setv(e, cfg[i]));
    if (hasOrb) { isl.orb.at = cfg[nd] ? socles[cfg[nd] - 1].id : null; isl.orb.dir = ORDER[cfg[nd + 1]]; }
  };
  const setOpen = (open) => Object.values(isl.gates).forEach((g) => (g.open = open.has(g.id)));
  const key = (cfg) => cfg.join('.');
  const targets = (gid) => (Array.isArray(gid) ? gid : [gid]);
  const entry = zone.entry;
  const report = { stages: [], escape: false, shortcut: false, problems: [], devices: nd, orb: hasOrb, total: devs.reduce((a, e) => a * size(e), 1) * (hasOrb ? (socles.length + 1) * 4 : 1) };
  const everAdj = new Set();

  /* graphe d’un étage : sources = {cfg, anchor} de départ ; open = portes ouvertes ; goal = portes à ouvrir */
  const explore = (sources, open, goal, label) => {
    const idx = new Map(), states = [], adj = [], solved = [];
    const push = (cfg, anchor) => {
      apply(cfg); setOpen(open);
      let id = null; reachCells(isl, [anchor]).forEach((k) => { if (id === null || k < id) id = k; });
      const k = key(cfg) + '|' + id;
      if (idx.has(k)) return idx.get(k);
      const i = states.length; idx.set(k, i); states.push({ cfg, anchor, id }); adj.push([]); return i;
    };
    sources.forEach((s0) => push(s0.cfg, s0.anchor));
    const cap = opts.cap || 600000;
    for (let i = 0; i < states.length; i++) {
      if (states.length > cap) { report.problems.push(`${label} : trop d’états (${states.length})`); break; }
      const S = states[i];
      apply(S.cfg); setOpen(open);
      const region = reachCells(isl, [S.anchor]);
      const res = evaluate(isl);
      if (res.segs.some((s) => s.open)) report.escape = true;
      if (targets(goal).every((g) => isl.gates[g] && isl.gates[g].open)) solved.push(i);
      const touch = (e, make) => {
        nb.forEach(([dx, dy]) => {
          const cx = e.x + dx, cy = e.y + dy;
          if (!region.has(cx + ',' + cy)) return;
          everAdj.add(e.id);
          make().forEach((cfg) => {
            apply(cfg); setOpen(open);
            if (!walkable(isl, cx, cy)) report.problems.push(`${label} : le joueur se retrouve coincé en (${cx}, ${cy}) après avoir manœuvré ${e.id}`);
            adj[i].push(push(cfg, [cx, cy]));
          });
          apply(S.cfg); setOpen(open);
        });
      };
      devs.forEach((e, di) => {
        const v = S.cfg[di];
        if (size(e) === 2) touch(e, () => { const n = S.cfg.slice(); n[di] = 1 - v; return [n]; });
        else touch(e, () => { const a = S.cfg.slice(), b = S.cfg.slice(); a[di] = (v + 1) % 4; b[di] = (v + 3) % 4; return [a, b]; });
      });
      if (hasOrb) socles.forEach((s, si) => touch(s, () => {
        if (S.cfg[nd] !== si + 1) { const n = S.cfg.slice(); n[nd] = si + 1; return [n]; }
        const a = S.cfg.slice(), b = S.cfg.slice(); a[nd + 1] = (S.cfg[nd + 1] + 1) % 4; b[nd + 1] = (S.cfg[nd + 1] + 3) % 4; return [a, b];
      }));
    }
    return { idx, states, adj, solved };
  };

  let sources = [{ cfg: init, anchor: entry }];
  const open = new Set();
  const seq = stages.concat([final]);
  for (let si = 0; si < seq.length; si++) {
    const gid = seq[si], label = `étape ${[].concat(gid).join('+')}`;
    // état initial de l’étape : rien n’est résolu
    apply(sources[0].cfg); setOpen(open); evaluate(isl);
    const initialSolved = targets(gid).every((g) => isl.gates[g] && isl.gates[g].open);
    const G = explore(sources, open, gid, label);
    // impasses : états depuis lesquels aucune résolution n’est atteignable
    const rev = G.states.map(() => []);
    G.adj.forEach((l, i) => l.forEach((j) => rev[j].push(i)));
    const good = new Set(G.solved), st = [...G.solved];
    while (st.length) { const j = st.pop(); rev[j].forEach((i) => { if (!good.has(i)) { good.add(i); st.push(i); } }); }
    const stuck = G.states.length - good.size;
    // distance minimale (en gestes) depuis les états de départ
    let dist = -1;
    { const d = new Map(); const q = []; G.states.forEach((s, i) => { if (sources.some((c) => key(c.cfg) === key(s.cfg)) && !d.has(i)) { d.set(i, 0); q.push(i); } }); let h = 0; const sol = new Set(G.solved); while (h < q.length) { const i = q[h++]; if (sol.has(i)) { dist = d.get(i); break; } G.adj[i].forEach((j) => { if (!d.has(j)) { d.set(j, d.get(i) + 1); q.push(j); } }); } }
    report.stages.push({ gate: [].concat(gid).join('+'), states: G.states.length, solutions: G.solved.length, initialSolved, stuck, moves: dist });
    if (!G.solved.length) report.problems.push(`${label} : aucune solution`);
    if (initialSolved) report.problems.push(`${label} : déjà résolue au départ`);
    if (stuck) report.problems.push(`${label} : ${stuck} état(s) sans issue (impasse possible)`);
    sources = [...new Map(G.solved.map((i) => [G.states[i].cfg.join('.') + '|' + G.states[i].id, { cfg: G.states[i].cfg, anchor: G.states[i].anchor }])).values()];
    ([].concat(gid)).forEach((g) => open.add(g));
  }
  // objets jamais manœuvrables
  devs.concat(socles).forEach((e) => { if (!everAdj.has(e.id) && !opts.ignoreAdj) report.problems.push(`objet ${e.t} ${e.id} (${e.x}, ${e.y}) jamais accessible au joueur`); });
  // raccourci : la balise (ou porte finale) ne doit jamais s’allumer si une porte d’étape reste fermée ; fuites : toutes combinaisons
  const totalCfg = report.total;
  if (totalCfg <= (opts.enumCap || 400000)) {
    const enumAll = (fn) => { const sizes = devs.map(size).concat(hasOrb ? [socles.length + 1, 4] : []); const cfg = sizes.map(() => 0); let n = 0; for (;;) { fn(cfg); n++; let i = 0; while (i < cfg.length) { cfg[i]++; if (cfg[i] < sizes[i]) break; cfg[i] = 0; i++; } if (i === cfg.length) break; } return n; };
    for (let k = 0; k <= stages.length; k++) {
      const op = new Set(stages.slice(0, k).flatMap((g) => [].concat(g)));
      enumAll((cfg) => { apply(cfg); setOpen(op); const r = evaluate(isl); if (r.segs.some((s) => s.open)) report.escape = true; if (k < stages.length && targets(final).every((g) => isl.gates[g] && isl.gates[g].open)) report.shortcut = true; });
    }
    report.enumerated = true;
  }
  if (report.escape) report.problems.push('un faisceau sort de la salle');
  if (report.shortcut) report.problems.push('la porte finale peut s’ouvrir portes d’étape fermées (raccourci)');
  report.ok = report.problems.length === 0;
  return report;
}

/* Analyse les salles d’une zone décrites par z.puzzle ({ rect:[x,y,w,h], entry:[x,y], stages?, final } ou liste de telles salles).
   Les salles d’une même zone ne communiquent que par leurs portes : on les vérifie une à une (portes remplacées par des ouvertures,
   pour détecter les faisceaux qui s’en échapperaient). L’orbe est libre : elle peut être posée sur n’importe quel socle accessible. */
export function analysePuzzles(z, opts = {}) {
  const list = [].concat(z.puzzle);
  return list.map((p, i) => {
    const [rx, ry, rw, rh] = p.rect;
    const map = z.map.slice(ry, ry + rh).map((r) => r.slice(rx, rx + rw).replace(/x/g, '.'));
    const ents = z.ents.filter((e) => e.x >= rx && e.x < rx + rw && e.y >= ry && e.y < ry + rh && e.t !== 'shard').map((e) => Object.assign({}, e, { x: e.x - rx, y: e.y - ry }));
    const t0 = Date.now();
    const r = analyseRoom({ map, ents, doors: [], entry: [p.entry[0] - rx, p.entry[1] - ry] }, p.stages || [], p.final, opts);
    r.label = p.label || z.title + (list.length > 1 ? ' (salle ' + (i + 1) + ')' : '');
    r.ms = Date.now() - t0;
    return r;
  });
}
