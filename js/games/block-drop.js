/* Block Drop — place les pièces sur la grille 8×8 et complète des lignes */
PA.register({
  id: 'block-drop',
  name: 'Block Drop',
  tagline: 'Place les pièces, efface lignes et colonnes.',
  colors: ['#facc15', '#c2410c'],
  icon: '<svg viewBox="0 0 64 64"><g fill="#fff"><rect x="6" y="6" width="15" height="15" rx="3"/><rect x="24" y="6" width="15" height="15" rx="3"/><rect x="6" y="24" width="15" height="15" rx="3" opacity=".6"/><rect x="43" y="43" width="15" height="15" rx="3" opacity=".6"/></g><g fill="#1e1b4b"><rect x="24" y="24" width="15" height="15" rx="3"/><rect x="24" y="43" width="15" height="15" rx="3"/><rect x="6" y="43" width="15" height="15" rx="3"/></g></svg>',
  controls: '<b>Glisser</b> une pièce depuis le bas jusque sur la grille.<br>Une ligne ou une colonne pleine s\'efface. Effacer plusieurs lignes d\'un coup rapporte un <b>combo</b>. La partie s\'arrête quand plus aucune pièce ne rentre.',
  daily: [800, 1600, 3000],
  xp: (s, r) => s / 10 + (r.lines || 0) * 2,
  achievements: [
    { id: 'dbl', name: 'Coup double', desc: 'Effacer 2 lignes en un coup', test: (r) => r.multi >= 2 },
    { id: 'tri', name: 'Nettoyage express', desc: 'Effacer 3 lignes en un coup', test: (r) => r.multi >= 3 },
    { id: 's3k', name: 'Architecte', desc: 'Marquer 3 000 points', test: (r) => r.score >= 3000 },
  ],
  create(api) {
    const W = api.W, N = 8, CS = 50, BX = (W - N * CS) / 2, BY = 128, TRAY_Y = 600, MINI = 26;
    const SHAPES = [
      [[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]],
      [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
      [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
      [[0, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]],
    ];
    const COLS = ['#f43f5e', '#fb923c', '#facc15', '#34d399', '#22d3ee', '#6366f1', '#a855f7', '#ec4899'];
    const fx = new PA.Particles(), fl = new PA.Floaters();
    const grid = Array.from({ length: N }, () => Array(N).fill(null));
    let tray = [], drag = null, dead = false, lines = 0, bestMulti = 0, streak = 0, flashes = [];

    const size = (sh) => [Math.max(...sh.map((p) => p[0])) + 1, Math.max(...sh.map((p) => p[1])) + 1];
    function deal() {
      tray = [0, 1, 2].map((i) => {
        const sh = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        return { sh, col: COLS[Math.floor(Math.random() * COLS.length)], slot: i, used: false, pop: 0 };
      });
    }
    const slotX = (i) => 80 + i * 160;
    const fits = (sh, c, r) => sh.every(([dx, dy]) => { const x = c + dx, y = r + dy; return x >= 0 && y >= 0 && x < N && y < N && !grid[y][x]; });
    const anyFit = (sh) => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (fits(sh, c, r)) return true; return false; };
    deal();

    function dropCell(x, y) {
      // position de la pièce tirée : elle est dessinée au-dessus du doigt
      const [w, h] = size(drag.p.sh);
      const ox = x - (w * CS) / 2, oy = y - h * CS - 50;
      return { c: Math.round((ox - BX) / CS), r: Math.round((oy - BY) / CS), ox, oy };
    }

    function place(p, c, r) {
      p.sh.forEach(([dx, dy]) => (grid[r + dy][c + dx] = { col: p.col, pop: 1 }));
      p.used = true;
      api.addScore(p.sh.length);
      api.tone(400 + p.sh.length * 30, 0.06, 'triangle', 0.09);
      const fullR = [], fullC = [];
      for (let i = 0; i < N; i++) {
        if (grid[i].every(Boolean)) fullR.push(i);
        if (grid.every((row) => row[i])) fullC.push(i);
      }
      const n = fullR.length + fullC.length;
      if (n) {
        streak++;
        fullR.forEach((i) => { flashes.push({ r: i, t: 0.35 }); for (let x = 0; x < N; x++) { fx.emit(BX + x * CS + CS / 2, BY + i * CS + CS / 2, grid[i][x].col, 4, 160, 0.6, 3); } });
        fullC.forEach((i) => { flashes.push({ c: i, t: 0.35 }); for (let y = 0; y < N; y++) { if (grid[y][i]) fx.emit(BX + i * CS + CS / 2, BY + y * CS + CS / 2, grid[y][i].col, 4, 160, 0.6, 3); } });
        fullR.forEach((i) => { for (let x = 0; x < N; x++) grid[i][x] = null; });
        fullC.forEach((i) => { for (let y = 0; y < N; y++) grid[y][i] = null; });
        const pts = n * 10 * n + (streak > 1 ? streak * 10 : 0);
        api.addScore(pts);
        lines += n; bestMulti = Math.max(bestMulti, n);
        fl.add(n >= 2 ? `Combo ×${n} ! +${pts}` : `+${pts}`, W / 2, BY - 24, n >= 2 ? '#facc15' : '#fff', n >= 2 ? 26 : 22);
        if (n >= 2) { api.sfx('combo'); api.shake(6); } else api.sfx('point');
      } else streak = 0;
      if (tray.every((t) => t.used)) deal();
      const left = tray.filter((t) => !t.used);
      if (!left.some((t) => anyFit(t.sh))) { dead = true; api.over({ lines, multi: bestMulti }); }
    }

    return {
      pointerdown(x, y) {
        if (dead) return;
        if (y < TRAY_Y - 70) return;
        const p = tray.find((t) => !t.used && Math.abs(x - slotX(t.slot)) < 75);
        if (p) { drag = { p, x, y }; api.sfx('tap'); }
      },
      pointermove(x, y) { if (drag) { drag.x = x; drag.y = y; } },
      pointerup(x, y) {
        if (!drag) return;
        const d = dropCell(x, y);
        if (fits(drag.p.sh, d.c, d.r)) place(drag.p, d.c, d.r);
        else drag.p.pop = 1;
        drag = null;
      },
      update(dt) {
        fx.update(dt, 250); fl.update(dt);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c]) grid[r][c].pop = Math.max(0, grid[r][c].pop - dt * 6);
        tray.forEach((t) => (t.pop = Math.max(0, t.pop - dt * 4)));
        flashes.forEach((f) => (f.t -= dt));
        flashes = flashes.filter((f) => f.t > 0);
      },
      draw(g) {
        PA.bg(g, W, api.H, '#2a1a08', '#0d0905');
        PA.text(g, 'LIGNES ' + lines, 40, 70, 16, '#fff', 'left', 800);
        if (streak > 1) PA.text(g, 'Série ×' + streak, W - 40, 70, 15, '#facc15', 'right', 700);
        const cube = (x, y, s, col, a = 1) => {
          g.globalAlpha = a;
          PA.rr(g, x + 2, y + 2, s - 4, s - 4, s * 0.18);
          const gr = g.createLinearGradient(x, y, x, y + s); gr.addColorStop(0, PA.shade(col, 0.3)); gr.addColorStop(1, col);
          g.fillStyle = gr; g.fill();
          g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x + s * 0.2, y + s * 0.16, s * 0.6, s * 0.1);
          g.globalAlpha = 1;
        };
        PA.rr(g, BX - 8, BY - 8, N * CS + 16, N * CS + 16, 16); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          PA.rr(g, BX + c * CS + 2, BY + r * CS + 2, CS - 4, CS - 4, 8); g.fillStyle = 'rgba(255,255,255,.06)'; g.fill();
        }
        // aperçu de la pose
        let preview = null;
        if (drag) {
          const d = dropCell(drag.x, drag.y);
          if (fits(drag.p.sh, d.c, d.r)) {
            preview = d;
            drag.p.sh.forEach(([dx, dy]) => cube(BX + (d.c + dx) * CS, BY + (d.r + dy) * CS, CS, drag.p.col, 0.3));
          }
        }
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const cl = grid[r][c]; if (!cl) continue;
          const s = CS * (1 + cl.pop * 0.1);
          cube(BX + c * CS - (s - CS) / 2, BY + r * CS - (s - CS) / 2, s, cl.col);
        }
        flashes.forEach((f) => {
          g.fillStyle = `rgba(255,255,255,${f.t * 2})`;
          if (f.r !== undefined) g.fillRect(BX, BY + f.r * CS, N * CS, CS); else g.fillRect(BX + f.c * CS, BY, CS, N * CS);
        });
        // réserve de pièces
        PA.rr(g, 16, TRAY_Y - 70, W - 32, 150, 20); g.fillStyle = 'rgba(255,255,255,.05)'; g.fill();
        tray.forEach((t) => {
          if (t.used || (drag && drag.p === t)) return;
          const [w, h] = size(t.sh), ok = anyFit(t.sh);
          const ms = MINI * (1 + t.pop * 0.15);
          const ox = slotX(t.slot) - (w * ms) / 2 + Math.sin(t.pop * 20) * t.pop * 6, oy = TRAY_Y + 5 - (h * ms) / 2;
          t.sh.forEach(([dx, dy]) => cube(ox + dx * ms, oy + dy * ms, ms, t.col, ok ? 1 : 0.3));
        });
        if (drag) {
          const d = dropCell(drag.x, drag.y);
          drag.p.sh.forEach(([dx, dy]) => cube(d.ox + dx * CS, d.oy + dy * CS, CS, drag.p.col, preview ? 0.95 : 0.7));
        }
        fx.draw(g); fl.draw(g);
      },
    };
  },
});
