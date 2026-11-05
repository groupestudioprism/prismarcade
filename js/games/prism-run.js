/* Prism Run — passe chaque barrière par la couleur qui correspond à la tienne */
PA.register({
  id: 'prism-run',
  name: 'Prism Run',
  tagline: 'Change de voie et traverse la bonne couleur.',
  colors: ['#22d3ee', '#7c3aed'],
  prize: 1,
  icon: '<svg viewBox="0 0 64 64"><rect x="4" y="10" width="17" height="9" rx="3" fill="#f43f5e"/><rect x="23.5" y="10" width="17" height="9" rx="3" fill="#22d3ee"/><rect x="43" y="10" width="17" height="9" rx="3" fill="#facc15"/><circle cx="32" cy="45" r="11" fill="#22d3ee" stroke="#fff" stroke-width="3.5"/><path d="M32 22v8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>',
  controls: '<b>← →</b>, <b>Q D</b>, <b>toucher à gauche / à droite</b> ou <b>glisser</b> : changer de voie.<br>Passe chaque barrière dans la case de <b>ta couleur</b>. Ta couleur change après chaque barrière.',
  daily: [15, 30, 50],
  xp: (s) => s * 4,
  achievements: [
    { id: 'b25', name: 'Coureur', desc: 'Franchir 25 barrières', test: (r) => r.score >= 25 },
    { id: 'b60', name: 'Réflexes prismatiques', desc: 'Franchir 60 barrières', test: (r) => r.score >= 60 },
    { id: 'b100', name: 'Arc-en-ciel', desc: 'Franchir 100 barrières', test: (r) => r.score >= 100 },
  ],
  create(api) {
    const W = api.W, H = api.H;
    const COLS = ['#f43f5e', '#22d3ee', '#facc15'];
    const LANES = [100, 240, 380];
    const PY = 590, BAR_H = 34, SPACING = 330;
    const sk = api.skin() || { ring: '#fff', trail: 14 };
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let lane = 1, px = LANES[1], pc = 1, speed = 280, bars = [], dead = false, t = 0, trail = [], streak = 0, flash = 0;
    let nextY = -60;

    function makeBar(y) {
      const perm = [0, 1, 2].sort(() => Math.random() - 0.5);
      bars.push({ y, cols: perm, passed: false, glow: 0 });
    }
    for (let i = 0; i < 4; i++) makeBar(nextY - i * SPACING);

    function setLane(l) {
      if (dead) return;
      const nl = PA.clamp(l, 0, 2);
      if (nl !== lane) { lane = nl; api.sfx('move'); }
    }
    function nextColor() {
      const upcoming = bars.find((b) => !b.passed);
      // la nouvelle couleur est tirée au hasard, mais jamais trop loin : on évite de toujours rester dans la même voie
      pc = Math.floor(Math.random() * 3);
      if (upcoming && upcoming.cols[lane] === pc && Math.random() < 0.6) pc = (pc + 1 + Math.floor(Math.random() * 2)) % 3;
    }

    return {
      keydown(k) {
        const kk = String(k).toLowerCase();
        if (k === 'ArrowLeft' || kk === 'q' || kk === 'a') setLane(lane - 1);
        if (k === 'ArrowRight' || kk === 'd') setLane(lane + 1);
      },
      pointerdown(x) { setLane(x < W / 2 ? lane - 1 : lane + 1); },
      update(dt) {
        t += dt; fx.update(dt); fl.update(dt);
        flash = Math.max(0, flash - dt * 3);
        if (dead) return;
        speed = Math.min(720, 280 + api.score * 6.5);
        px += (LANES[lane] - px) * Math.min(1, dt * 18);
        trail.push({ x: px, y: PY, c: COLS[pc] });
        if (trail.length > sk.trail) trail.shift();
        bars.forEach((b) => {
          b.y += speed * dt;
          b.glow = Math.max(0, b.glow - dt * 2);
          if (!b.passed && b.y + BAR_H / 2 >= PY - 20) {
            b.passed = true;
            const hit = Math.round((px - LANES[0]) / (LANES[1] - LANES[0]));
            const l = PA.clamp(hit, 0, 2);
            if (b.cols[l] === pc) {
              api.addScore(1); streak++;
              b.glow = 1;
              fx.emit(LANES[l], b.y, COLS[pc], 18, 260, 0.6, 3.5);
              api.tone(500 + (streak % 8) * 70, 0.08, 'sine', 0.1, 1.4);
              if (streak % 10 === 0) { fl.add(streak + ' d\'affilée !', W / 2, PY - 120, '#fff', 24); api.sfx('combo'); }
              nextColor();
            } else {
              dead = true; flash = 1;
              fx.emit(px, PY, COLS[pc], 40, 380, 0.9, 4);
              fx.emit(px, PY, '#fff', 20, 260, 0.6, 3);
              api.shake(14); api.sfx('boom');
              api.over({ score: api.score });
            }
          }
        });
        bars = bars.filter((b) => b.y < H + 60);
        let top = Math.min(...bars.map((b) => b.y));
        while (bars.length < 5) { top -= SPACING; makeBar(top); }
      },
      draw(g) {
        PA.bg(g, W, H, '#0e1730', '#06070f');
        // couloirs en perspective
        const off = (t * speed) % 60;
        g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2;
        for (let y = -60 + off; y < H; y += 60) { g.beginPath(); g.moveTo(30, y); g.lineTo(W - 30, y); g.stroke(); }
        g.strokeStyle = 'rgba(255,255,255,.1)';
        [170, 310].forEach((x) => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); });

        bars.forEach((b) => {
          b.cols.forEach((ci, i) => {
            const x = LANES[i] - 64;
            g.save();
            g.shadowColor = COLS[ci]; g.shadowBlur = 14 + b.glow * 20;
            PA.rr(g, x, b.y - BAR_H / 2, 128, BAR_H, 10);
            g.fillStyle = COLS[ci]; g.globalAlpha = b.passed ? 0.45 : 1; g.fill();
            g.restore();
          });
        });

        g.save(); g.globalCompositeOperation = 'lighter';
        trail.forEach((p, i) => { g.globalAlpha = (i / trail.length) * 0.35; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y + (trail.length - i) * 7, 16 * (i / trail.length), 0, 7); g.fill(); });
        g.restore();
        if (!dead) {
          g.save(); g.shadowColor = COLS[pc]; g.shadowBlur = 26;
          g.fillStyle = COLS[pc]; g.beginPath(); g.arc(px, PY, 24, 0, 7); g.fill();
          g.restore();
          g.lineWidth = 4; g.strokeStyle = sk.ring; if (sk.ghost) g.globalAlpha = 0.75 + Math.sin(t * 6) * 0.2; g.beginPath(); g.arc(px, PY, 24, 0, 7); g.stroke(); g.globalAlpha = 1;
          g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(px - 8, PY - 8, 6, 0, 7); g.fill();
        }
        fx.draw(g); fl.draw(g);
        // indicateur de couleur
        PA.rr(g, 20, 20, 170, 46, 14); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill();
        PA.text(g, 'TA COULEUR', 34, 43, 12, '#a3a1c2', 'left', 700);
        g.fillStyle = COLS[pc]; g.beginPath(); g.arc(166, 43, 12, 0, 7); g.fill();
        PA.text(g, Math.round(speed) + ' km/h', W - 24, 43, 13, 'rgba(255,255,255,.5)', 'right', 700);
        if (flash) { g.fillStyle = `rgba(255,255,255,${flash * 0.35})`; g.fillRect(0, 0, W, H); }
      },
    };
  },
});
