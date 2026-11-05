/* Color Sort — trie les couleurs dans les tubes, contre la montre */
PA.register({
  id: 'color-sort',
  name: 'Color Sort',
  tagline: 'Trie les couleurs avant la fin du chrono.',
  colors: ['#2dd4bf', '#1e3a8a'],
  prize: 1.5,
  icon: '<svg viewBox="0 0 64 64"><g fill="none" stroke="#fff" stroke-width="3"><path d="M8 8v40a7 7 0 0 0 14 0V8"/><path d="M25 8v40a7 7 0 0 0 14 0V8"/><path d="M42 8v40a7 7 0 0 0 14 0V8"/></g><rect x="11" y="38" width="8" height="12" rx="3" fill="#f43f5e"/><rect x="11" y="26" width="8" height="11" fill="#facc15"/><rect x="28" y="38" width="8" height="12" rx="3" fill="#facc15"/><rect x="28" y="26" width="8" height="11" fill="#facc15"/><rect x="45" y="38" width="8" height="12" rx="3" fill="#f43f5e"/></svg>',
  controls: '<b>Toucher</b> un tube puis un autre (ou touches <b>1 à 9</b>) pour verser. On verse sur la <b>même couleur</b> ou dans un tube vide.<br>Chaque niveau terminé rapporte des points et du temps. <b>Annuler</b> : 3 fois par niveau.',
  daily: [400, 900, 1600],
  xp: (s, r) => s / 9 + (r.level || 1) * 5,
  overTitle: (e) => `Temps écoulé · niveau ${e.level || 1}`,
  achievements: [
    { id: 'l5', name: 'Trieur', desc: 'Terminer 5 niveaux', test: (r) => r.level >= 6 },
    { id: 'l12', name: 'Chimiste', desc: 'Terminer 12 niveaux', test: (r) => r.level >= 13 },
    { id: 'fast', name: 'Éclair', desc: 'Terminer un niveau de 6 couleurs ou plus en moins de 25 s', test: (r) => r.fast >= 1 },
  ],
  create(api) {
    const W = api.W, H = api.H, CAP = 4, BALL = 34;
    const PAL = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#34d399', '#fb923c', '#f472b6', '#3b82f6', '#a3e635', '#ffffff'];
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let level = 1, tubes = [], sel = -1, time = 75, dead = false, undo = [], undoLeft = 3, levelT = 0, flash = 0, fast = 0, t = 0, doneT = 0;

    function build() {
      const k = Math.min(3 + Math.floor((level - 1) / 2), 9);
      let ok = false;
      while (!ok) {
        const balls = [];
        for (let c = 0; c < k; c++) for (let i = 0; i < CAP; i++) balls.push(c);
        for (let i = balls.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [balls[i], balls[j]] = [balls[j], balls[i]]; }
        tubes = [];
        for (let c = 0; c < k; c++) tubes.push(balls.slice(c * CAP, c * CAP + CAP));
        tubes.push([], []);
        ok = !tubes.some((tb) => tb.length === CAP && tb.every((x) => x === tb[0]));
      }
      sel = -1; undo = []; undoLeft = 3; levelT = 0;
    }
    build();

    function layout() {
      const n = tubes.length, perRow = n > 6 ? Math.ceil(n / 2) : n, rows = Math.ceil(n / perRow);
      const tw = 58, gap = Math.min(22, (W - 40 - perRow * tw) / Math.max(1, perRow - 1));
      const th = CAP * BALL + 22, top = rows === 1 ? 250 : 170;
      return tubes.map((_, i) => {
        const r = Math.floor(i / perRow), c = i % perRow, inRow = Math.min(perRow, n - r * perRow);
        const rowW = inRow * tw + (inRow - 1) * gap;
        return { x: (W - rowW) / 2 + c * (tw + gap), y: top + r * (th + 50), w: tw, h: th };
      });
    }
    const solved = () => tubes.every((tb) => tb.length === 0 || (tb.length === CAP && tb.every((x) => x === tb[0])));

    function pour(a, b) {
      const A = tubes[a], B = tubes[b];
      if (!A.length || B.length >= CAP) return false;
      const c = A[A.length - 1];
      if (B.length && B[B.length - 1] !== c) return false;
      undo.push(tubes.map((tb) => tb.slice()));
      let n = 0;
      while (A.length && A[A.length - 1] === c && B.length < CAP) { B.push(A.pop()); n++; }
      const L = layout()[b];
      fx.emit(L.x + L.w / 2, L.y + L.h - B.length * BALL, PAL[c], 8, 120, 0.4, 3);
      api.tone(380 + B.length * 70, 0.07, 'sine', 0.09, 1.3);
      if (B.length === CAP && B.every((x) => x === c)) { api.sfx('point'); fx.emit(L.x + L.w / 2, L.y + 20, PAL[c], 16, 200, 0.6, 3); }
      return true;
    }

    function tap(i) {
      if (dead || doneT > 0 || i < 0 || i >= tubes.length) return;
      if (sel === -1) { if (tubes[i].length) { sel = i; api.sfx('tap'); } return; }
      if (sel === i) { sel = -1; return; }
      if (!pour(sel, i)) { api.tone(160, 0.08, 'triangle', 0.07); sel = tubes[i].length ? i : -1; return; }
      sel = -1;
      if (solved()) {
        const k = tubes.length - 2;
        const pts = k * 25 + (levelT < 20 ? 60 : levelT < 40 ? 30 : 0);
        if (k >= 6 && levelT < 25) fast = 1;
        api.addScore(pts);
        const gain = 18 + k * 3;
        time += gain;
        fl.add(`Niveau ${level} ! +${pts} · +${gain} s`, W / 2, 130, '#fff', 22);
        api.sfx('win'); flash = 1; doneT = 0.9;
      }
    }

    function tubeAt(x, y) { return layout().findIndex((L) => x >= L.x - 8 && x <= L.x + L.w + 8 && y >= L.y - 30 && y <= L.y + L.h + 10); }
    const btn = { undo: { x: 60, y: 640, w: 160, h: 46 }, reset: { x: 260, y: 640, w: 160, h: 46 } };
    const inBtn = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

    return {
      keydown(k) {
        if (/^[1-9]$/.test(k)) tap(Number(k) - 1);
        if (k === 'u' || k === 'U' || k === 'Backspace') this.pointerdown(btn.undo.x + 1, btn.undo.y + 1);
      },
      pointerdown(x, y) {
        if (dead || doneT > 0) return;
        if (inBtn(btn.undo, x, y)) {
          if (undoLeft > 0 && undo.length) { tubes = undo.pop(); undoLeft--; sel = -1; api.sfx('move'); }
          return;
        }
        if (inBtn(btn.reset, x, y)) { if (undo.length) { tubes = undo[0]; undo = []; sel = -1; time = Math.max(1, time - 10); fl.add('−10 s', W / 2, 600, '#fb7185', 20); api.sfx('hit'); } return; }
        tap(tubeAt(x, y));
      },
      update(dt) {
        t += dt; fx.update(dt, 300); fl.update(dt); flash = Math.max(0, flash - dt * 2);
        if (dead) return;
        if (doneT > 0) { doneT -= dt; if (doneT <= 0) { level++; build(); } return; }
        time -= dt; levelT += dt;
        if (time <= 0) { time = 0; dead = true; api.over({ level, fast }); }
      },
      draw(g) {
        PA.bg(g, W, H, '#0c1f3d', '#050a14');
        // chrono
        PA.text(g, 'NIVEAU ' + level, 30, 44, 17, '#fff', 'left', 800);
        const low = time < 10;
        PA.text(g, Math.ceil(time) + ' s', W - 30, 44, 26, low ? (Math.sin(t * 12) > 0 ? '#fb7185' : '#fff') : '#5eead4', 'right', 800);
        PA.rr(g, 30, 70, W - 60, 8, 4); g.fillStyle = 'rgba(255,255,255,.1)'; g.fill();
        PA.rr(g, 30, 70, (W - 60) * Math.min(1, time / 90), 8, 4); g.fillStyle = low ? '#fb7185' : '#2dd4bf'; g.fill();
        layout().forEach((L, i) => {
          const lift = i === sel ? -22 : 0;
          const x = L.x, y = L.y + lift, tb = tubes[i];
          const full = tb.length === CAP && tb.every((c) => c === tb[0]);
          // tube
          g.save();
          if (full) { g.shadowColor = PAL[tb[0]]; g.shadowBlur = 18; }
          g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + L.h - L.w / 2); g.arc(x + L.w / 2, y + L.h - L.w / 2, L.w / 2, Math.PI, 0, true); g.lineTo(x + L.w, y);
          g.fillStyle = 'rgba(255,255,255,.06)'; g.fill();
          g.strokeStyle = i === sel ? '#fff' : 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.stroke();
          g.restore();
          tb.forEach((c, j) => {
            const by = y + L.h - 8 - (j + 1) * BALL;
            g.fillStyle = PAL[c];
            if (j === 0) { g.beginPath(); g.moveTo(x + 6, by); g.lineTo(x + 6, by + BALL - L.w / 2 + 6); g.arc(x + L.w / 2, by + BALL - L.w / 2 + 6, L.w / 2 - 6, Math.PI, 0, true); g.lineTo(x + L.w - 6, by); g.fill(); }
            else g.fillRect(x + 6, by, L.w - 12, BALL + 1);
            g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 10, by + 4, 6, BALL - 8);
          });
          PA.text(g, String(i + 1), x + L.w / 2, y - 14, 12, 'rgba(255,255,255,.35)', 'center', 700);
        });
        // boutons
        const b = (o, label, on) => { PA.rr(g, o.x, o.y, o.w, o.h, 14); g.fillStyle = on ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.04)'; g.fill(); PA.text(g, label, o.x + o.w / 2, o.y + o.h / 2 + 1, 15, on ? '#fff' : 'rgba(255,255,255,.35)', 'center', 700); };
        b(btn.undo, `↶ Annuler (${undoLeft})`, undoLeft > 0 && undo.length > 0);
        b(btn.reset, '⟲ Recommencer', undo.length > 0);
        fx.draw(g); fl.draw(g);
        if (flash) { g.fillStyle = `rgba(45,212,191,${flash * 0.18})`; g.fillRect(0, 0, W, H); }
      },
    };
  },
});
