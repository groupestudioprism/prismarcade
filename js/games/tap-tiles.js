/* Tap Tiles — touche les tuiles lumineuses dans l'ordre, sans en rater une */
PA.register({
  id: 'tap-tiles',
  name: 'Tap Tiles',
  tagline: 'Touche les tuiles en rythme, de plus en plus vite.',
  colors: ['#818cf8', '#111827'],
  prize: 1,
  icon: '<svg viewBox="0 0 64 64"><g fill="#fff" opacity=".18"><rect x="4" y="4" width="13" height="56" rx="3"/><rect x="19" y="4" width="13" height="56" rx="3"/><rect x="34" y="4" width="13" height="56" rx="3"/><rect x="49" y="4" width="11" height="56" rx="3"/></g><rect x="19" y="6" width="13" height="20" rx="3" fill="#fff"/><rect x="49" y="26" width="11" height="18" rx="3" fill="#fff"/><rect x="4" y="44" width="13" height="16" rx="3" fill="#c7d2fe"/></svg>',
  controls: '<b>Toucher</b> les tuiles lumineuses, ou touches <b>D F J K</b> (ou <b>1 2 3 4</b>).<br>Touche toujours la tuile <b>la plus basse</b>. Toucher une case vide ou laisser passer une tuile termine la partie.',
  daily: [60, 130, 220],
  xp: (s) => s * 1.1,
  achievements: [
    { id: 't100', name: 'Doigts agiles', desc: 'Toucher 100 tuiles', test: (r) => r.score >= 100 },
    { id: 't250', name: 'Virtuose', desc: 'Toucher 250 tuiles', test: (r) => r.score >= 250 },
    { id: 't400', name: 'Pianiste prismatique', desc: 'Toucher 400 tuiles', test: (r) => r.score >= 400 },
  ],
  create(api) {
    const W = api.W, H = api.H, COLS = 4, CW = W / COLS, TH = 168;
    const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0];
    const fx = new PA.Particles();
    let rows = [], started = false, dead = false, speed = 2.3, t = 0, note = 4, fail = null, hitFlash = [];
    let lastCol = -1;

    function addRow(y) {
      let col;
      do { col = Math.floor(Math.random() * COLS); } while (col === lastCol && Math.random() < 0.6);
      lastCol = col;
      rows.push({ y, col, hit: false });
    }
    for (let i = 0; i < 6; i++) addRow(H - 60 - TH * (i + 1));

    function press(col) {
      if (dead || col < 0 || col >= COLS) return;
      const next = rows.find((r) => !r.hit);
      if (!next) return;
      if (next.col !== col) {
        dead = true; fail = { col, y: next.y, wrong: true };
        api.tone(110, 0.5, 'sawtooth', 0.08, 0.6); api.shake(8);
        api.over({}); return;
      }
      started = true; next.hit = true;
      api.addScore(1);
      note = PA.clamp(note + Math.floor(Math.random() * 5) - 2, 0, SCALE.length - 1);
      api.tone(SCALE[note], 0.22, 'triangle', 0.12);
      api.tone(SCALE[note] * 2, 0.12, 'sine', 0.03);
      hitFlash.push({ x: col * CW, y: next.y, t: 0.3 });
      fx.emit(col * CW + CW / 2, next.y + TH / 2, '#c7d2fe', 8, 160, 0.4, 3);
      if (api.score % 50 === 0) api.sfx('combo');
    }

    return {
      keydown(k) {
        const m = { d: 0, f: 1, j: 2, k: 3, D: 0, F: 1, J: 2, K: 3, '1': 0, '2': 1, '3': 2, '4': 3, '&': 0, 'é': 1, '"': 2, "'": 3 };
        if (k in m) press(m[k]);
      },
      pointerdown(x) { press(Math.floor(x / CW)); },
      update(dt) {
        t += dt; fx.update(dt);
        hitFlash.forEach((h) => (h.t -= dt)); hitFlash = hitFlash.filter((h) => h.t > 0);
        if (dead || !started) return;
        speed = Math.min(7.5, 2.3 + api.score * 0.025);
        const v = speed * TH * 0.62;
        rows.forEach((r) => (r.y += v * dt));
        hitFlash.forEach((h) => (h.y += v * dt));
        const missed = rows.find((r) => !r.hit && r.y > H);
        if (missed) {
          dead = true; fail = { col: missed.col, y: H - TH - 20, wrong: false };
          rows.forEach((r) => (r.y -= missed.y - (H - TH - 20)));
          api.tone(110, 0.5, 'sawtooth', 0.08, 0.6); api.shake(8);
          api.over({}); return;
        }
        rows = rows.filter((r) => r.y < H + 10);
        let top = Math.min(...rows.map((r) => r.y));
        while (top > -TH) { top -= TH; addRow(top); }
      },
      draw(g) {
        PA.bg(g, W, H, '#151a33', '#06070f');
        g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
        for (let c = 1; c < COLS; c++) { g.beginPath(); g.moveTo(c * CW, 0); g.lineTo(c * CW, H); g.stroke(); }
        const next = rows.find((r) => !r.hit);
        rows.forEach((r) => {
          const x = r.col * CW + 4, y = r.y + 4, w = CW - 8, h = TH - 8;
          if (r.hit) { PA.rr(g, x, y, w, h, 12); g.fillStyle = 'rgba(129,140,248,.14)'; g.fill(); return; }
          g.save();
          const isNext = r === next;
          g.shadowColor = '#818cf8'; g.shadowBlur = isNext ? 24 : 10;
          const gr = g.createLinearGradient(0, y, 0, y + h);
          gr.addColorStop(0, isNext ? '#e0e7ff' : '#c7d2fe'); gr.addColorStop(1, isNext ? '#818cf8' : '#6366f1');
          PA.rr(g, x, y, w, h, 12); g.fillStyle = gr; g.fill(); g.restore();
          if (isNext && !started) PA.text(g, 'Commencer', x + w / 2, y + h / 2, 17, '#1e1b4b', 'center', 800);
        });
        hitFlash.forEach((hf) => { g.fillStyle = `rgba(255,255,255,${hf.t})`; PA.rr(g, hf.x + 4, hf.y + 4, CW - 8, TH - 8, 12); g.fill(); });
        if (fail) {
          g.fillStyle = Math.sin(t * 14) > 0 ? 'rgba(244,63,94,.75)' : 'rgba(244,63,94,.35)';
          PA.rr(g, fail.col * CW + 4, fail.y + 4, CW - 8, TH - 8, 12); g.fill();
        }
        fx.draw(g);
        PA.text(g, String(api.score), W / 2, 60, 50, '#fff', 'center', 800);
        PA.text(g, (speed * 0.62).toFixed(1) + ' tuiles/s', W / 2, 100, 13, 'rgba(255,255,255,.45)', 'center', 700);
      },
    };
  },
});
