/* Fusion — fusionne les tuiles identiques jusqu'à 2048 et au-delà */
PA.register({
  id: 'fusion',
  name: 'Fusion',
  tagline: 'Fais glisser, fusionne les tuiles, vise 2048.',
  colors: ['#8b5cf6', '#4338ca'],
  icon: '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="24" height="24" rx="6" fill="#fff"/><rect x="34" y="6" width="24" height="24" rx="6" fill="#fff" opacity=".55"/><rect x="6" y="34" width="24" height="24" rx="6" fill="#fff" opacity=".55"/><rect x="34" y="34" width="24" height="24" rx="6" fill="#facc15"/><text x="46" y="51" text-anchor="middle" font-family="Sora,sans-serif" font-weight="800" font-size="14" fill="#3b2300">8</text></svg>',
  controls: '<b>Flèches</b>, <b>ZQSD</b> ou <b>glisser</b> : déplacer toutes les tuiles.<br>Deux tuiles identiques fusionnent. La partie s\'arrête quand plus rien ne bouge.',
  daily: [800, 1600, 3000],
  xp: (s) => s / 14,
  overTitle: (e) => (e.tile >= 2048 ? '2048 atteint !' : 'Plus de coups possibles'),
  achievements: [
    { id: 't256', name: 'Bonne fusion', desc: 'Créer une tuile 256', test: (r) => r.tile >= 256 },
    { id: 't1024', name: 'Presque…', desc: 'Créer une tuile 1024', test: (r) => r.tile >= 1024 },
    { id: 't2048', name: '2048 !', desc: 'Créer la tuile 2048', test: (r) => r.tile >= 2048 },
  ],
  create(api) {
    const N = 4, GAP = 12, BX = 30, BY = 190, SIZE = 420, CS = (SIZE - GAP * (N + 1)) / N;
    const COLORS = ['#5b4fd6', '#7c5cf0', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb923c', '#f59e0b', '#facc15', '#a3e635', '#34d399', '#22d3ee', '#38bdf8', '#ffffff'];
    const cx = (c) => BX + GAP + c * (CS + GAP);
    const cy = (r) => BY + GAP + r * (CS + GAP);
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let grid = Array.from({ length: N }, () => Array(N).fill(null));
    let tiles = [], dead = false, maxTile = 2, won = false, t = 0;

    function add() {
      const empty = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) empty.push([r, c]);
      if (!empty.length) return;
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      const tile = { v: Math.random() < 0.9 ? 2 : 4, r, c, x: cx(c), y: cy(r), s: 0, pop: 0, dying: -1 };
      grid[r][c] = tile; tiles.push(tile);
    }
    add(); add();

    function canMove() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const t0 = grid[r][c];
        if (!t0) return true;
        if (c < N - 1 && grid[r][c + 1] && grid[r][c + 1].v === t0.v) return true;
        if (r < N - 1 && grid[r + 1][c] && grid[r + 1][c].v === t0.v) return true;
      }
      return false;
    }

    function move(dir) {
      if (dead) return;
      const vec = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] }[dir];
      if (!vec) return;
      const rows = [0, 1, 2, 3], cols = [0, 1, 2, 3];
      if (vec[0] === 1) rows.reverse();
      if (vec[1] === 1) cols.reverse();
      let moved = false, gained = 0, best = 0;
      const merged = new Set();
      for (const r of rows) for (const c of cols) {
        const tile = grid[r][c];
        if (!tile) continue;
        let nr = r, nc = c, mergedInto = null;
        for (;;) {
          const rr = nr + vec[0], cc = nc + vec[1];
          if (rr < 0 || rr >= N || cc < 0 || cc >= N) break;
          const o = grid[rr][cc];
          if (!o) { nr = rr; nc = cc; continue; }
          if (o.v === tile.v && !merged.has(o)) mergedInto = o;
          break;
        }
        if (mergedInto) {
          grid[r][c] = null;
          tile.r = mergedInto.r; tile.c = mergedInto.c; tile.dying = 0.11;
          mergedInto.v *= 2; mergedInto.pop = 1; merged.add(mergedInto);
          gained += mergedInto.v; best = Math.max(best, mergedInto.v);
          moved = true;
          const col = COLORS[Math.min(COLORS.length - 1, Math.log2(mergedInto.v) - 1)];
          fx.emit(cx(mergedInto.c) + CS / 2, cy(mergedInto.r) + CS / 2, col, 10, 160, 0.5, 3);
        } else if (nr !== r || nc !== c) {
          grid[r][c] = null; grid[nr][nc] = tile; tile.r = nr; tile.c = nc; moved = true;
        }
      }
      if (!moved) return;
      api.addScore(gained);
      if (best) {
        maxTile = Math.max(maxTile, best);
        api.tone(300 + Math.log2(best) * 60, 0.09, 'triangle', 0.1, 1.3);
        if (best >= 2048 && !won) { won = true; api.sfx('win'); fl.add('2048 !', 240, BY - 30, '#facc15', 36); }
        else if (best >= 128) fl.add('+' + gained, 240, BY - 26, '#fff', 22);
      } else api.sfx('move');
      add();
      if (!canMove()) { dead = true; api.over({ tile: maxTile }); }
    }

    const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', q: 'left', a: 'left', d: 'right', z: 'up', w: 'up', s: 'down' };

    return {
      keydown(k) { move(KEYS[k] || KEYS[String(k).toLowerCase()]); },
      swipe: move,
      update(dt) {
        t += dt;
        const k = Math.min(1, dt * 22);
        tiles.forEach((tile) => {
          tile.x += (cx(tile.c) - tile.x) * k;
          tile.y += (cy(tile.r) - tile.y) * k;
          tile.s = Math.min(1, tile.s + dt * 7);
          tile.pop = Math.max(0, tile.pop - dt * 6);
          if (tile.dying > 0) tile.dying -= dt;
        });
        tiles = tiles.filter((tile) => tile.dying === -1 || tile.dying > 0);
        fx.update(dt); fl.update(dt);
      },
      draw(g) {
        PA.bg(g, api.W, api.H, '#181338', '#0a0918');
        PA.text(g, 'FUSION', 30, 70, 30, '#fff', 'left', 800);
        PA.text(g, 'Atteins la tuile 2048', 30, 104, 15, '#a3a1c2', 'left', 600);
        PA.rr(g, 330, 52, 120, 64, 14); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill();
        PA.text(g, 'MEILLEURE', 390, 72, 11, '#a3a1c2', 'center', 700);
        PA.text(g, String(maxTile), 390, 96, 24, '#facc15', 'center', 800);

        PA.rr(g, BX, BY, SIZE, SIZE, 18); g.fillStyle = 'rgba(255,255,255,.06)'; g.fill();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          PA.rr(g, cx(c), cy(r), CS, CS, 12); g.fillStyle = 'rgba(255,255,255,.05)'; g.fill();
        }
        const order = tiles.slice().sort((a, b) => (b.dying > 0) - (a.dying > 0));
        order.forEach((tile) => {
          const idx = Math.min(COLORS.length - 1, Math.log2(tile.v) - 1);
          const col = COLORS[idx];
          const sc = tile.s * (1 + tile.pop * 0.12);
          const w = CS * sc, ox = tile.x + (CS - w) / 2, oy = tile.y + (CS - w) / 2;
          g.save();
          if (tile.v >= 128) { g.shadowColor = col; g.shadowBlur = 18; }
          PA.rr(g, ox, oy, w, w, 12 * sc);
          const gr = g.createLinearGradient(ox, oy, ox, oy + w);
          gr.addColorStop(0, PA.shade(col, 0.18)); gr.addColorStop(1, col);
          g.fillStyle = gr; g.fill();
          g.restore();
          const fs = tile.v < 100 ? 38 : tile.v < 1000 ? 32 : tile.v < 10000 ? 26 : 21;
          PA.text(g, String(tile.v), tile.x + CS / 2, tile.y + CS / 2 + 2, fs * sc, idx >= 7 ? '#2a1600' : '#fff', 'center', 800);
        });
        fx.draw(g); fl.draw(g);
        PA.text(g, 'Glisse ou utilise les flèches', 240, 660, 14, 'rgba(255,255,255,.35)', 'center', 600);
      },
    };
  },
});
