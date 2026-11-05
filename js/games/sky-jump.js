/* Sky Jump — rebondis de plateforme en plateforme, toujours plus haut */
PA.register({
  id: 'sky-jump',
  name: 'Sky Jump',
  tagline: 'Rebondis toujours plus haut, sans tomber.',
  colors: ['#4ade80', '#0e7490'],
  prize: 1.25,
  icon: '<svg viewBox="0 0 64 64"><rect x="6" y="50" width="22" height="6" rx="3" fill="#fff" opacity=".7"/><rect x="36" y="34" width="22" height="6" rx="3" fill="#fff"/><rect x="10" y="16" width="20" height="6" rx="3" fill="#facc15"/><circle cx="44" cy="22" r="8" fill="#fff"/><circle cx="46" cy="20" r="2" fill="#0e7490"/><path d="M40 32l-4 6M48 32l4 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
  controls: '<b>← →</b>, <b>Q D</b>, ou <b>toucher / maintenir</b> à gauche ou à droite : se déplacer. Le saut est automatique.<br>Les plateformes <b>dorées</b> sont des tremplins, les <b>fissurées</b> cèdent, les <b>bleues</b> bougent. Passer par un bord fait revenir de l\'autre côté.',
  repeatKeys: true,
  daily: [800, 1800, 3500],
  xp: (s) => s / 18,
  achievements: [
    { id: 'h1500', name: 'Prise de hauteur', desc: 'Atteindre 1 500 m', test: (r) => r.score >= 1500 },
    { id: 'h4000', name: 'Dans les nuages', desc: 'Atteindre 4 000 m', test: (r) => r.score >= 4000 },
    { id: 'h8000', name: 'Stratosphère', desc: 'Atteindre 8 000 m', test: (r) => r.score >= 8000 },
  ],
  create(api) {
    const W = api.W, H = api.H, PW = 74, PH = 14, G = 1500, JUMP = -760;
    const sk = api.skin() || { body: '#facc15', eye: '#1e1b4b', glow: '#fde68a' };
    const fx = new PA.Particles();
    let p = { x: W / 2, y: H - 140, vx: 0, vy: JUMP, face: 1 }, cam = 0, plats = [], keys = {}, hold = 0, dead = false, t = 0, topY = H - 60, maxH = 0, squash = 0;
    const clouds = Array.from({ length: 8 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 40 + Math.random() * 60, k: 0.2 + Math.random() * 0.3 }));

    function addPlat(y) {
      const h = maxH;
      const r = Math.random();
      let type = 'n';
      if (h > 300 && r < Math.min(0.28, 0.06 + h / 25000)) type = 'm';
      else if (h > 600 && r < Math.min(0.42, 0.2 + h / 30000)) type = 'b';
      if (type === 'b') {
        // une plateforme fissurée est toujours un leurre en plus d'une plateforme solide : le parcours reste faisable
        plats.push({ x: 20 + Math.random() * (W - PW - 40), y: y + 38, type: 'b', spring: false, vx: 0, broken: false, fall: 0 });
        type = 'n';
      }
      const spring = type === 'n' && Math.random() < 0.08;
      plats.push({ x: 20 + Math.random() * (W - PW - 40), y, type, spring, vx: type === 'm' ? (Math.random() < 0.5 ? -1 : 1) * (70 + Math.min(h / 40, 140)) : 0, broken: false, fall: 0 });
    }
    plats.push({ x: W / 2 - PW / 2, y: H - 60, type: 'n', spring: false, vx: 0 });
    while (topY > -H) { topY -= 70 + Math.random() * 40; addPlat(topY); }

    return {
      keydown(k) { keys[k] = true; },
      keyup(k) { keys[k] = false; },
      pointerdown(x) { hold = x < W / 2 ? -1 : 1; },
      pointermove(x, y, down) { if (down) hold = x < W / 2 ? -1 : 1; },
      pointerup() { hold = 0; },
      update(dt) {
        t += dt; fx.update(dt, 300);
        squash = Math.max(0, squash - dt * 6);
        if (dead) { p.vy += G * dt; p.y += p.vy * dt; return; }
        const kx = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.q || keys.Q || keys.a ? 1 : 0) || hold;
        p.vx += (kx * 420 - p.vx) * Math.min(1, dt * 10);
        if (kx) p.face = kx;
        p.x += p.vx * dt;
        if (p.x < -20) p.x += W + 40; if (p.x > W + 20) p.x -= W + 40;
        const prevY = p.y;
        p.vy += G * dt; p.y += p.vy * dt;
        // atterrissage (en descente uniquement)
        if (p.vy > 0) {
          for (const pl of plats) {
            if (pl.broken) continue;
            if (prevY + 18 <= pl.y && p.y + 18 >= pl.y && p.x + 14 > pl.x && p.x - 14 < pl.x + PW) {
              if (pl.type === 'b') { pl.broken = true; api.tone(180, 0.1, 'triangle', 0.08, 0.5); fx.emit(p.x, pl.y, '#a16207', 10, 120, 0.5, 3); continue; }
              p.y = pl.y - 18; p.vy = pl.spring ? JUMP * 1.65 : JUMP; squash = 1;
              if (pl.spring) { api.sfx('power'); fx.emit(p.x, pl.y, '#facc15', 16, 220, 0.6, 3); }
              else api.tone(420 + Math.min(maxH / 30, 400), 0.06, 'sine', 0.07, 1.4);
              break;
            }
          }
        }
        plats.forEach((pl) => {
          if (pl.type === 'm') { pl.x += pl.vx * dt; if (pl.x < 10 || pl.x > W - PW - 10) pl.vx *= -1; }
          if (pl.broken) { pl.fall += dt; pl.y += 600 * dt * pl.fall; }
        });
        // caméra : suit le joueur vers le haut seulement
        const target = p.y - H * 0.42;
        if (target < cam) cam = target;
        const h = Math.floor((H - 140 - cam) / 4);
        if (h > maxH) { maxH = h; api.setScore(maxH); }
        while (topY > cam - 80) { topY -= 70 + Math.random() * (40 + Math.min(maxH / 80, 60)); addPlat(topY); }
        plats = plats.filter((pl) => pl.y - cam < H + 60);
        if (p.y - cam > H + 40) { dead = true; api.sfx('over'); api.over({}); }
      },
      draw(g) {
        const sky = Math.min(1, maxH / 8000);
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, `hsl(${200 + sky * 60} 70% ${30 - sky * 18}%)`); gr.addColorStop(1, `hsl(${190 + sky * 40} 60% ${55 - sky * 35}%)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        if (sky > 0.3) { for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${(sky - 0.3) * ((i * 37) % 10) / 10})`; g.fillRect((i * 97) % W, (i * 53 + cam * -0.05) % H, 2, 2); } }
        clouds.forEach((c) => {
          const y = ((c.y - cam * c.k) % (H + 120) + H + 120) % (H + 120) - 60;
          g.fillStyle = `rgba(255,255,255,${0.12 - sky * 0.08})`;
          g.beginPath(); g.ellipse(c.x, y, c.s, c.s * 0.35, 0, 0, 7); g.fill();
        });
        plats.forEach((pl) => {
          const y = pl.y - cam;
          const col = pl.type === 'm' ? '#38bdf8' : pl.type === 'b' ? '#a16207' : '#e2e8f0';
          g.save(); g.translate(pl.x + PW / 2, y + PH / 2);
          if (pl.broken) g.rotate(pl.fall * 2);
          PA.rr(g, -PW / 2, -PH / 2, PW, PH, 7); g.fillStyle = col; g.fill();
          g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-PW / 2 + 8, -PH / 2 + 3, PW - 16, 3);
          if (pl.type === 'b') { g.strokeStyle = '#451a03'; g.lineWidth = 2; g.beginPath(); g.moveTo(-6, -7); g.lineTo(2, 0); g.lineTo(-3, 7); g.stroke(); }
          g.restore();
          if (pl.spring && !pl.broken) {
            g.save(); g.shadowColor = '#facc15'; g.shadowBlur = 12;
            PA.rr(g, pl.x + PW / 2 - 13, y - 10, 26, 10, 4); g.fillStyle = '#facc15'; g.fill(); g.restore();
          }
        });
        // joueur
        const y = p.y - cam;
        g.save(); g.translate(p.x, y);
        g.scale(1 + squash * 0.18, 1 - squash * 0.18);
        g.shadowColor = sk.glow; g.shadowBlur = 16;
        g.fillStyle = sk.body; PA.rr(g, -16, -18, 32, 34, 13); g.fill();
        g.shadowBlur = 0;
        if (sk.visor) { g.fillStyle = '#0c4a6e'; PA.rr(g, -11, -11, 22, 13, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-7, -9, 6, 3); }
        else {
          g.fillStyle = '#fff'; g.beginPath(); g.arc(p.face * 5 - 5, -6, 5, 0, 7); g.arc(p.face * 5 + 6, -6, 5, 0, 7); g.fill();
          g.fillStyle = sk.eye; g.beginPath(); g.arc(p.face * 7 - 5, -6, 2.4, 0, 7); g.arc(p.face * 7 + 6, -6, 2.4, 0, 7); g.fill();
        }
        g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-8, 16); g.lineTo(-10, 22); g.moveTo(8, 16); g.lineTo(10, 22); g.stroke();
        g.restore();
        fx.draw(g);
        PA.text(g, maxH.toLocaleString('fr-FR') + ' m', W / 2, 44, 30, '#fff', 'center', 800);
      },
    };
  },
});
