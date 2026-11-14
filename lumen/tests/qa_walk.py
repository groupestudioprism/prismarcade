"""Marche réelle au clavier (bibliothèque commune de qa_montagne_foret / qa_foret_full) : itinéraire par cases (BFS sur logic.js : portes, altitude)
puis pilotage des touches Z/Q/S/D (ZQSD = flèches) jusqu'aux points de passage. Rien n'est téléporté pendant la marche."""
import time, json

ROUTE_JS = """async ([a, b]) => {
  const L = __lumen, lg = await import('/lumen/js/logic.js'), I = L.isl;
  const key = (x, y) => x + ',' + y, goal = key(b[0], b[1]);
  const hooks = new Map();   // case de départ -> [{to, post, dir}]  (le grappin est une arête du graphe, si l'on en possède un)
  if (L.st.inv.grappin) I.ents.filter((e) => e.t === 'post').forEach((p) => lg.postLinks(I, p).forEach((l) => { const [dx, dy] = lg.DIRS[l.dir]; const k = key(p.x - dx, p.y - dy); if (!hooks.has(k)) hooks.set(k, []); hooks.get(k).push({ to: l.land, post: p.id, dir: l.dir }); }));
  const prev = new Map([[key(a[0], a[1]), null]]); const q = [[a[0], a[1]]];
  while (q.length) { const [x, y] = q.shift(); if (key(x, y) === goal) break;
    const next = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy]) => [x + dx, y + dy, null]).filter(([nx, ny]) => (key(nx, ny) === goal || lg.walkable(I, nx, ny)) && lg.stepOk(I, x, y, nx, ny));
    (hooks.get(key(x, y)) || []).forEach((h) => next.push([h.to[0], h.to[1], h]));
    for (const [nx, ny, h] of next) { const k = key(nx, ny); if (prev.has(k)) continue; prev.set(k, [key(x, y), h]); q.push([nx, ny]); } }
  if (!prev.has(goal)) return null;
  const path = []; for (let k = goal; k; ) { const pr = prev.get(k); path.push({ c: k.split(',').map(Number), h: pr ? pr[1] : null }); k = pr ? pr[0] : null; } path.reverse();
  // points de passage : changements de direction ; chaque saut de grappin est une étape à part
  const steps = []; let run = [];
  const flush = () => { if (run.length) { const wp = []; for (let i = 0; i < run.length; i++) { if (i === 0 || i === run.length - 1) { wp.push(run[i]); continue; } const p = run[i - 1], c = run[i], n = run[i + 1]; if ((c[0] - p[0]) !== (n[0] - c[0]) || (c[1] - p[1]) !== (n[1] - c[1])) wp.push(c); } steps.push({ walk: wp }); run = []; } };
  path.forEach((st, i) => { if (st.h) { run.push(path[i - 1].c); flush(); steps.push({ hook: st.h, from: path[i - 1].c, to: st.c }); run = [st.c]; } else run.push(st.c); });
  flush();
  return { n: path.length, steps };
}"""

HOOK_JS = """async ([post, dir, from, to]) => {
  const L = __lumen, lg = await import('/lumen/js/logic.js'); const [dx, dy] = lg.DIRS[dir];
  L.P.face = Math.atan2(dx, dy); L.P.vx = L.P.vz = 0;
  let t = null; for (let i = 0; i < 25; i++) { await T.tick(60); t = L.target(); if (t && t.kind === 'post') break; }
  if (!t || t.kind !== 'post') return 'cible:' + (t ? t.kind : 'aucune');
  L.interact(); let n = 0; while (L.S.mode === 'grapple' && n++ < 200) await T.tick(100); await T.tick(200);
  const ok = Math.hypot(L.P.x - to[0] * 2, L.P.z - to[1] * 2) < 0.9; return ok ? 'ok' : 'raté pos=' + (L.P.x / 2).toFixed(1) + ',' + (L.P.z / 2).toFixed(1);
}"""

def cell_of(q):
    return q.ev("[Math.floor(__lumen.P.x/2+0.5), Math.floor(__lumen.P.z/2+0.5)]")

def walk_to(q, x, z, tol=0.7, maxms=30000):
    """marche (touches) vers le point monde (x, z) ; renvoie True si atteint"""
    pg = q.pg; held = set(); t0 = time.time(); last = None; lastt = t0; ok = False
    def want(ks):
        for k in list(held - ks): pg.keyboard.up(k); held.discard(k)
        for k in ks - held: pg.keyboard.down(k); held.add(k)
    try:
        while (time.time() - t0) * 1000 < maxms:
            px, pz, mode = q.ev("[__lumen.P.x, __lumen.P.z, __lumen.S.mode]")
            if mode != 'play': q.ev("(()=>{try{__lumen.G.screens.close()}catch(e){}})()"); want(set()); q.tick(100); continue
            dx, dz = x - px, z - pz
            if abs(dx) < tol and abs(dz) < tol: ok = True; break
            ks = set()
            if dz < -0.35: ks.add('w')
            if dz > 0.35: ks.add('s')
            if dx < -0.35: ks.add('a')
            if dx > 0.35: ks.add('d')
            want(ks)
            q.ev("(()=>{__lumen.st.player.hp=Math.max(__lumen.st.player.hp,90)})()")
            if time.time() - lastt > 2.5:
                if last is not None and abs(px - last[0]) + abs(pz - last[1]) < 0.4: break   # bloqué
                last = (px, pz); lastt = time.time()
            q.tick(70)
    finally:
        want(set())
    return ok

def walk_cells(q, to, maxms=180000, log=None, tries=4):
    """itinéraire BFS de la case courante vers `to` (colonne, ligne globales) : marche réelle + sauts de grappin réels.
    Renvoie (ok, nb de cases, altitude max atteinte). `log` reçoit (zone, gy) à chaque changement de zone."""
    t0 = time.time(); gmax = 0; zone = None; total = 0
    for attempt in range(tries):
        a = cell_of(q); r = q.pg.evaluate("(" + ROUTE_JS + ")", [a, list(to)])
        if not r: return (False, total, gmax)
        total = max(total, r['n']); failed = False
        for stp in r['steps']:
            if 'hook' in stp:
                h = stp['hook']; res = q.pg.evaluate("(" + HOOK_JS + ")", [h['post'], h['dir'], stp['from'], stp['to']])
                if res != 'ok': failed = True; break
            else:
                for cx, cy in stp['walk'][1:]:
                    left = maxms - (time.time() - t0) * 1000
                    if left <= 0: return (False, total, gmax)
                    if not walk_to(q, cx * 2, cz2(cy), maxms=min(40000, left)): failed = True; break
                    gy, z = q.ev("[__lumen.P.gy, __lumen.G.zoneId()]"); gmax = max(gmax, gy)
                    if z != zone: zone = z; log is not None and log.append((z, round(gy, 2)))
                if failed: break
            gy, z = q.ev("[__lumen.P.gy, __lumen.G.zoneId()]"); gmax = max(gmax, gy)
            if z != zone: zone = z; log is not None and log.append((z, round(gy, 2)))
        if not failed: return (True, total, gmax)
        q.ev("(()=>{__lumen.P.vx=__lumen.P.vz=0})()"); q.tick(300)
    return (False, total, gmax)

def cz2(cy): return cy * 2
