/* Flap — un seul bouton, des portes de cristal à franchir */
PA.register({
  id: 'flap',
  name: 'Flap',
  tagline: 'Un bouton, des portes de cristal, zéro répit.',
  colors: ['#38bdf8', '#1d4ed8'],
  prize: 1.25,
  icon: '<svg viewBox="0 0 64 64"><rect x="40" y="0" width="14" height="22" rx="3" fill="#fff" opacity=".85"/><rect x="40" y="42" width="14" height="22" rx="3" fill="#fff" opacity=".85"/><circle cx="20" cy="32" r="10" fill="#facc15"/><path d="M12 30c-6-6-10-2-10 2 4 0 7 2 10 2z" fill="#fff"/><circle cx="24" cy="29" r="2.2" fill="#1e1b4b"/></svg>',
  controls: '<b>Espace</b>, <b>↑</b>, <b>clic</b> ou <b>toucher</b> : battre des ailes.<br>Passe entre les portes de cristal. Les portes se resserrent au fil du temps.',
  daily: [10, 20, 35],
  xp: (s) => s * 6,
  achievements: [
    { id: 'f15', name: 'Envol', desc: 'Franchir 15 portes', test: (r) => r.score >= 15 },
    { id: 'f40', name: 'Plume d\'acier', desc: 'Franchir 40 portes', test: (r) => r.score >= 40 },
    { id: 'f80', name: 'Maître des airs', desc: 'Franchir 80 portes', test: (r) => r.score >= 80 },
  ],
  create(api) {
    const W = api.W, H = api.H, BX = 140, R = 17, GROUND = H - 70, PW = 74;
    const sk = api.skin() || { body: '#facc15', wing: '#fff', beak: '#fb923c', glow: '#facc15' };
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let y = H / 2 - 40, vy = 0, started = false, dead = false, pipes = [], t = 0, scroll = 0, wing = 0;
    let stars = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * (GROUND - 40), s: Math.random() * 1.8 + 0.4 }));

    const gap = () => Math.max(150, 205 - api.score * 1.4);
    const speed = () => Math.min(300, 175 + api.score * 2.2);
    function addPipe(x) {
      const g = gap();
      const top = 90 + Math.random() * (GROUND - 90 - g - 50);
      pipes.push({ x, top, gap: g, passed: false, hue: 190 + Math.random() * 80, moving: api.score > 15 && Math.random() < 0.35, ph: Math.random() * 6 });
    }

    function flap() {
      if (dead) return;
      started = true; vy = -440; wing = 1;
      api.tone(700, 0.06, 'triangle', 0.06, 1.3);
    }

    function die() {
      if (dead) return;
      dead = true; api.sfx('boom'); api.shake(10);
      fx.emit(BX, y, sk.body, 30, 280, 0.8, 3.5);
      api.over({});
    }

    return {
      keydown(k) { if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'z' || k === 'Enter') flap(); },
      pointerdown: flap,
      update(dt) {
        t += dt; fx.update(dt, 400); fl.update(dt);
        wing = Math.max(0, wing - dt * 5);
        if (!started) { y = H / 2 - 40 + Math.sin(t * 3) * 10; return; }
        vy = Math.min(720, vy + 1500 * dt);
        y += vy * dt;
        if (dead) { if (y > GROUND - R) { y = GROUND - R; vy = 0; } return; }
        const sp = speed();
        scroll += sp * dt;
        stars.forEach((s) => { s.x -= sp * dt * 0.08 * s.s; if (s.x < 0) s.x += W; });
        if (!pipes.length || pipes[pipes.length - 1].x < W - 250) addPipe(W + 30);
        pipes.forEach((p) => {
          p.x -= sp * dt;
          if (p.moving) { p.ph += dt * 1.5; p.top = PA.clamp(p.top + Math.sin(p.ph) * 40 * dt, 80, GROUND - p.gap - 40); }
          if (!p.passed && p.x + PW < BX - R) {
            p.passed = true; api.addScore(1);
            api.tone(880, 0.08, 'sine', 0.09, 1.5);
            if (api.score % 10 === 0) { fl.add(api.score + ' !', BX + 60, y - 30, '#facc15', 26); api.sfx('combo'); }
          }
          // collision cercle / rectangles
          const hit = (rx, ry, rw, rh) => {
            const nx = PA.clamp(BX, rx, rx + rw), ny = PA.clamp(y, ry, ry + rh);
            return (BX - nx) ** 2 + (y - ny) ** 2 < (R - 3) ** 2;
          };
          if (hit(p.x, 0, PW, p.top) || hit(p.x, p.top + p.gap, PW, GROUND - p.top - p.gap)) die();
        });
        pipes = pipes.filter((p) => p.x > -PW - 10);
        if (y > GROUND - R || y < -40) die();
      },
      draw(g) {
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#0b1d4a'); gr.addColorStop(0.7, '#1d2f6f'); gr.addColorStop(1, '#3b2a6b');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        stars.forEach((s) => { g.fillStyle = `rgba(255,255,255,${0.25 + s.s * 0.25})`; g.fillRect(s.x, s.y, s.s, s.s); });
        // montagnes en parallaxe
        g.fillStyle = 'rgba(120,140,255,.12)';
        g.beginPath(); g.moveTo(0, GROUND);
        for (let x = 0; x <= W + 40; x += 40) g.lineTo(x, GROUND - 90 - Math.sin((x + scroll * 0.2) / 70) * 40 - Math.sin((x + scroll * 0.2) / 23) * 12);
        g.lineTo(W, GROUND); g.fill();
        pipes.forEach((p) => {
          const c = `hsl(${p.hue} 85% 65%)`;
          const draw = (yy, hh, capY) => {
            const lg = g.createLinearGradient(p.x, 0, p.x + PW, 0);
            lg.addColorStop(0, `hsla(${p.hue} 85% 70% / .9)`); lg.addColorStop(0.5, `hsla(${p.hue} 90% 88% / .95)`); lg.addColorStop(1, `hsla(${p.hue} 80% 55% / .9)`);
            g.save(); g.shadowColor = c; g.shadowBlur = 16;
            g.fillStyle = lg; g.fillRect(p.x, yy, PW, hh);
            g.restore();
            PA.rr(g, p.x - 6, capY, PW + 12, 18, 6); g.fillStyle = '#fff'; g.fill();
          };
          draw(0, p.top, p.top - 18);
          draw(p.top + p.gap, GROUND - p.top - p.gap, p.top + p.gap);
        });
        // sol
        g.fillStyle = '#140f2e'; g.fillRect(0, GROUND, W, H - GROUND);
        g.fillStyle = '#8b5cf6'; g.fillRect(0, GROUND, W, 4);
        g.fillStyle = 'rgba(255,255,255,.08)';
        for (let x = -(scroll % 40); x < W; x += 40) g.fillRect(x, GROUND + 18, 20, 4);
        // oiseau
        if (!dead || Math.floor(t * 10) % 2) {
          g.save(); g.translate(BX, y); g.rotate(PA.clamp(vy / 900, -0.5, 1.1));
          g.shadowColor = sk.glow; g.shadowBlur = 18;
          g.fillStyle = sk.body; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
          g.shadowBlur = 0;
          g.fillStyle = sk.wing; g.beginPath(); g.ellipse(-6, 2 - wing * 8, 10, 6 - wing * 2, -0.4 - wing * 0.6, 0, 7); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(7, -5, 5.5, 0, 7); g.fill();
          g.fillStyle = '#1e1b4b'; g.beginPath(); g.arc(9, -5, 2.6, 0, 7); g.fill();
          g.fillStyle = sk.beak; g.beginPath(); g.moveTo(14, 0); g.lineTo(24, 3); g.lineTo(14, 7); g.fill();
          g.restore();
        }
        fx.draw(g); fl.draw(g);
        PA.text(g, String(api.score), W / 2, 90, 64, 'rgba(255,255,255,.92)', 'center', 800);
        if (!started) PA.text(g, 'Touchez pour vous envoler', W / 2, H / 2 + 60, 17, '#fff', 'center', 700);
      },
    };
  },
});
