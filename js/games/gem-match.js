/* Gem Match — aligne 3 gemmes ou plus, atteins l'objectif avant la fin des coups */
PA.register({
  id: 'gem-match',
  name: 'Gem Match',
  tagline: 'Échange les gemmes, enchaîne les cascades.',
  colors: ['#d946ef', '#1e1b4b'],
  icon: '<svg viewBox="0 0 64 64"><path d="M14 8l8 8-8 8-8-8z" fill="#22d3ee"/><circle cx="32" cy="16" r="7" fill="#f43f5e"/><path d="M50 9l7 13H43z" fill="#34d399"/><path d="M14 38l8 8-8 8-8-8z" fill="#22d3ee"/><path d="M32 38l8 8-8 8-8-8z" fill="#22d3ee"/><path d="M50 38l8 8-8 8-8-8z" fill="#22d3ee"/><rect x="4" y="34" width="56" height="24" rx="8" fill="none" stroke="#fff" stroke-width="2.5"/></svg>',
  controls: '<b>Glisser</b> une gemme vers sa voisine, ou <b>toucher</b> deux gemmes côte à côte, pour les échanger.<br>Atteins l\'<b>objectif de points</b> avant la fin des coups pour passer au niveau suivant.',
  daily: [3000, 6000, 10000],
  xp: (s, r) => s / 40 + (r.level || 1) * 12,
  overTitle: (e) => `Niveau ${e.level || 1}`,
  achievements: [
    { id: 'lv3', name: 'Joaillier', desc: 'Atteindre le niveau 3', test: (r) => r.level >= 3 },
    { id: 'lv6', name: 'Maître joaillier', desc: 'Atteindre le niveau 6', test: (r) => r.level >= 6 },
    { id: 'casc4', name: 'Réaction en chaîne', desc: 'Enchaîner une cascade de 4', test: (r) => r.cascade >= 4 },
  ],
  create(api) {
    const W = api.W, N = 8, CS = 54, BX = (W - N * CS) / 2, BY = 196;
    const GEM = ['#f43f5e', '#22d3ee', '#34d399', '#facc15', '#a855f7', '#fb923c'];
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let cells = [], phase = 'idle', onSettled = null, clearT = 0, sel = null, drag = null;
    let level = 1, moves = 22, target = 1500, prevTarget = 0, cascade = 0, bestCascade = 0, dead = false, banner = 1.4, idleT = 0, hint = null, t = 0;

    const rand = () => Math.floor(Math.random() * GEM.length);
    const gem = (type, r, c, y) => ({ t: type, x: c, y: y === undefined ? r : y, vy: 0, s: 1, clearing: false });

    function fill() {
      cells = [];
      for (let r = 0; r < N; r++) {
        cells.push([]);
        for (let c = 0; c < N; c++) {
          let tp;
          do { tp = rand(); } while (
            (c >= 2 && cells[r][c - 1].t === tp && cells[r][c - 2].t === tp) ||
            (r >= 2 && cells[r - 1][c].t === tp && cells[r - 2][c].t === tp)
          );
          cells[r].push(gem(tp, r, c, r - N - 1));
        }
      }
      if (!findMove()) fill();
    }

    function findMatches() {
      const set = new Set(), runs = [];
      for (let r = 0; r < N; r++) {
        let c = 0;
        while (c < N) {
          let e = c;
          while (e + 1 < N && cells[r][e + 1].t === cells[r][c].t) e++;
          if (e - c + 1 >= 3) { for (let k = c; k <= e; k++) set.add(r * N + k); runs.push({ len: e - c + 1, r, c: (c + e) / 2 }); }
          c = e + 1;
        }
      }
      for (let c = 0; c < N; c++) {
        let r = 0;
        while (r < N) {
          let e = r;
          while (e + 1 < N && cells[e + 1][c].t === cells[r][c].t) e++;
          if (e - r + 1 >= 3) { for (let k = r; k <= e; k++) set.add(k * N + c); runs.push({ len: e - r + 1, r: (r + e) / 2, c }); }
          r = e + 1;
        }
      }
      return { set, runs };
    }

    function swapCells(a, b) { const tmp = cells[a.r][a.c]; cells[a.r][a.c] = cells[b.r][b.c]; cells[b.r][b.c] = tmp; }

    function findMove() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        for (const [dr, dc] of [[0, 1], [1, 0]]) {
          const r2 = r + dr, c2 = c + dc;
          if (r2 >= N || c2 >= N) continue;
          swapCells({ r, c }, { r: r2, c: c2 });
          const ok = findMatches().set.size > 0;
          swapCells({ r, c }, { r: r2, c: c2 });
          if (ok) return [{ r, c }, { r: r2, c: c2 }];
        }
      }
      return null;
    }

    function settled() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const g = cells[r][c];
        if (Math.abs(g.x - c) > 0.001 || Math.abs(g.y - r) > 0.001) return false;
      }
      return true;
    }
    function waitThen(fn) { phase = 'anim'; onSettled = fn; }

    function trySwap(a, b) {
      if (phase !== 'idle' || dead) return;
      if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return;
      sel = null; drag = null; hint = null; idleT = 0;
      swapCells(a, b);
      api.sfx('move');
      waitThen(() => {
        const m = findMatches();
        if (m.set.size) { moves--; cascade = 0; resolve(m); }
        else { swapCells(a, b); api.tone(200, 0.08, 'triangle', 0.07); waitThen(() => { phase = 'idle'; }); }
      });
    }

    function resolve(m) {
      cascade++; bestCascade = Math.max(bestCascade, cascade);
      let pts = m.set.size * 10 * cascade;
      m.runs.forEach((run) => {
        if (run.len === 4) pts += 60;
        if (run.len >= 5) pts += 200;
        if (run.len >= 4) fl.add(run.len >= 5 ? 'Incroyable !' : 'Super !', BX + run.c * CS + CS / 2, BY + run.r * CS, '#fff', 20);
      });
      api.addScore(pts);
      m.set.forEach((k) => {
        const r = Math.floor(k / N), c = k % N, g = cells[r][c];
        g.clearing = true;
        fx.emit(BX + c * CS + CS / 2, BY + r * CS + CS / 2, GEM[g.t], 8, 170, 0.5, 3);
      });
      if (cascade >= 2) fl.add('Cascade ×' + cascade, W / 2, BY - 20, '#facc15', 22);
      api.tone(520 + cascade * 90, 0.1, 'sine', 0.1, 1.3);
      phase = 'clear'; clearT = 0.22;
    }

    function collapse() {
      for (let c = 0; c < N; c++) {
        const keep = [];
        for (let r = N - 1; r >= 0; r--) if (!cells[r][c].clearing) keep.push(cells[r][c]);
        const missing = N - keep.length;
        for (let i = 0; i < missing; i++) keep.push(gem(rand(), 0, c, -1 - i));
        for (let r = N - 1, i = 0; r >= 0; r--, i++) cells[r][c] = keep[i];
      }
      waitThen(() => {
        const m = findMatches();
        if (m.set.size) { resolve(m); return; }
        afterTurn();
      });
    }

    function afterTurn() {
      cascade = 0;
      if (api.score >= target) {
        level++; prevTarget = target; target = target + 1500 + level * 500; moves = 22 + Math.min(level, 8);
        api.sfx('win'); banner = 1.6;
      } else if (moves <= 0) {
        dead = true; phase = 'over'; api.over({ level, cascade: bestCascade }); return;
      }
      if (!findMove()) {
        fl.add('Mélange…', W / 2, BY + 216, '#fff', 26);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) cells[r][c].y -= N + 2;
        fill(); waitThen(() => { phase = 'idle'; });
        return;
      }
      phase = 'idle';
    }

    fill();
    waitThen(() => { phase = 'idle'; });

    const cellAt = (x, y) => {
      const c = Math.floor((x - BX) / CS), r = Math.floor((y - BY) / CS);
      return r >= 0 && r < N && c >= 0 && c < N ? { r, c } : null;
    };

    function drawGem(g, tp, x, y, s) {
      const col = GEM[tp], R = 20 * s;
      g.save(); g.translate(x, y);
      g.shadowColor = col; g.shadowBlur = 10;
      const gr = g.createLinearGradient(0, -R, 0, R);
      gr.addColorStop(0, PA.shade(col, 0.45)); gr.addColorStop(0.55, col); gr.addColorStop(1, PA.shade(col, -0.35));
      g.fillStyle = gr;
      g.beginPath();
      if (tp === 0) g.arc(0, 0, R, 0, 7);
      else if (tp === 1) { g.moveTo(0, -R); g.lineTo(R, 0); g.lineTo(0, R); g.lineTo(-R, 0); }
      else if (tp === 2) { g.moveTo(0, -R); g.lineTo(R * 0.95, R * 0.75); g.lineTo(-R * 0.95, R * 0.75); }
      else if (tp === 3) PA.rr(g, -R * 0.82, -R * 0.82, R * 1.64, R * 1.64, 6 * s);
      else if (tp === 4) { for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; g.lineTo(Math.cos(a) * R, Math.sin(a) * R); } }
      else { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R * 0.48 : R; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } }
      g.closePath(); g.fill();
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,.55)';
      g.beginPath(); g.ellipse(-R * 0.3, -R * 0.38, R * 0.28, R * 0.14, -0.5, 0, 7); g.fill();
      g.restore();
    }

    return {
      pointerdown(x, y) {
        if (phase !== 'idle') return;
        const p = cellAt(x, y);
        if (!p) { sel = null; return; }
        if (sel && Math.abs(sel.r - p.r) + Math.abs(sel.c - p.c) === 1) { trySwap(sel, p); return; }
        sel = p; drag = { x, y, from: p }; api.sfx('tap');
      },
      pointermove(x, y, isDown) {
        if (!isDown || !drag || phase !== 'idle') return;
        const dx = x - drag.x, dy = y - drag.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
        const to = Math.abs(dx) > Math.abs(dy) ? { r: drag.from.r, c: drag.from.c + Math.sign(dx) } : { r: drag.from.r + Math.sign(dy), c: drag.from.c };
        const from = drag.from; drag = null;
        if (to.r >= 0 && to.r < N && to.c >= 0 && to.c < N) trySwap(from, to);
      },
      pointerup() { drag = null; },
      update(dt) {
        t += dt; fx.update(dt, 200); fl.update(dt);
        banner = Math.max(0, banner - dt);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const g = cells[r][c];
          if (g.y < r) { g.vy += 46 * dt; g.y = Math.min(r, g.y + g.vy * dt); if (g.y === r) g.vy = 0; }
          else if (g.y > r) g.y = Math.max(r, g.y - 9 * dt);
          if (g.x < c) g.x = Math.min(c, g.x + 9 * dt); else if (g.x > c) g.x = Math.max(c, g.x - 9 * dt);
          if (g.clearing) g.s = Math.max(0, g.s - dt * 5);
        }
        if (phase === 'anim' && settled()) { const fn = onSettled; onSettled = null; phase = 'busy'; fn(); }
        if (phase === 'clear') { clearT -= dt; if (clearT <= 0) collapse(); }
        if (phase === 'idle') { idleT += dt; if (idleT > 6 && !hint) hint = findMove(); }
      },
      draw(g) {
        PA.bg(g, W, api.H, '#241042', '#0b0717');
        // HUD
        const box = (x, label, val, col) => {
          PA.rr(g, x, 34, 132, 70, 16); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill();
          PA.text(g, label, x + 66, 56, 11, '#a3a1c2', 'center', 700);
          PA.text(g, val, x + 66, 82, 24, col, 'center', 800);
        };
        box(24, 'NIVEAU', String(level), '#fff');
        box(174, 'COUPS', String(moves), moves <= 5 ? '#f43f5e' : '#fff');
        box(324, 'OBJECTIF', target.toLocaleString('fr-FR'), '#facc15');
        const pct = PA.clamp((api.score - prevTarget) / (target - prevTarget), 0, 1);
        PA.rr(g, 24, 122, W - 48, 12, 6); g.fillStyle = 'rgba(255,255,255,.08)'; g.fill();
        if (pct > 0) {
          const gr = g.createLinearGradient(24, 0, W - 24, 0); gr.addColorStop(0, '#d946ef'); gr.addColorStop(1, '#facc15');
          PA.rr(g, 24, 122, (W - 48) * pct, 12, 6); g.fillStyle = gr; g.fill();
        }
        PA.text(g, 'Vers le niveau ' + (level + 1), 24, 158, 13, '#a3a1c2', 'left', 600);

        PA.rr(g, BX - 8, BY - 8, N * CS + 16, N * CS + 16, 18); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          g.fillStyle = (r + c) % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.065)';
          g.fillRect(BX + c * CS, BY + r * CS, CS, CS);
        }
        if (sel) { g.strokeStyle = '#fff'; g.lineWidth = 3; PA.rr(g, BX + sel.c * CS + 3, BY + sel.r * CS + 3, CS - 6, CS - 6, 10); g.stroke(); }
        if (hint && phase === 'idle') {
          g.strokeStyle = `rgba(250,204,21,${0.4 + Math.sin(t * 6) * 0.35})`; g.lineWidth = 3;
          hint.forEach((p) => { PA.rr(g, BX + p.c * CS + 3, BY + p.r * CS + 3, CS - 6, CS - 6, 10); g.stroke(); });
        }
        g.save(); g.beginPath(); g.rect(BX - 8, BY - 4, N * CS + 16, N * CS + 12); g.clip();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const gm = cells[r][c];
          if (gm.s <= 0) continue;
          const bob = sel && sel.r === r && sel.c === c ? Math.sin(t * 10) * 2 : 0;
          drawGem(g, gm.t, BX + gm.x * CS + CS / 2, BY + gm.y * CS + CS / 2 + bob, gm.s);
        }
        g.restore();
        fx.draw(g); fl.draw(g);
        if (banner > 0) {
          g.globalAlpha = Math.min(1, banner);
          g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, BY + 170, W, 90);
          PA.text(g, 'NIVEAU ' + level, W / 2, BY + 202, 34, '#fff', 'center', 800);
          PA.text(g, 'Objectif : ' + target.toLocaleString('fr-FR') + ' points', W / 2, BY + 236, 15, '#facc15', 'center', 700);
          g.globalAlpha = 1;
        }
      },
    };
  },
});
