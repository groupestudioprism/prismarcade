/* Astro Blast — shoot spatial en vagues, avec améliorations */
PA.register({
  id: 'astro-blast',
  name: 'Astro Blast',
  tagline: 'Repousse les vagues ennemies, améliore ton vaisseau.',
  colors: ['#6366f1', '#0f172a'],
  icon: '<svg viewBox="0 0 64 64"><path d="M32 6l10 30-10-5-10 5z" fill="#fff"/><path d="M22 36l-8 10 12-4zM42 36l8 10-12-4z" fill="#22d3ee"/><path d="M28 40h8l-4 14z" fill="#fb923c"/><circle cx="12" cy="14" r="5" fill="#f43f5e"/><circle cx="52" cy="20" r="4" fill="#f43f5e"/><rect x="31" y="0" width="2" height="4" fill="#facc15"/></svg>',
  controls: '<b>Glisser</b> / <b>souris</b> ou <b>← →</b> (et <b>↑ ↓</b>) : piloter. Le tir est automatique.<br>Ramasse les bonus : <b>tir double</b>, <b>tir rapide</b>, <b>bouclier</b>. 3 vies.',
  repeatKeys: true,
  daily: [2000, 5000, 9000],
  xp: (s, r) => s / 25 + (r.wave || 1) * 10,
  overTitle: (e) => `Vague ${e.wave || 1}`,
  achievements: [
    { id: 'w5', name: 'Pilote', desc: 'Atteindre la vague 5', test: (r) => r.wave >= 5 },
    { id: 'w10', name: 'As de l\'espace', desc: 'Atteindre la vague 10', test: (r) => r.wave >= 10 },
    { id: 'k150', name: 'Exterminateur', desc: 'Détruire 150 ennemis en une partie', test: (r) => r.kills >= 150 },
  ],
  create(api) {
    const W = api.W, H = api.H;
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let ship = { x: W / 2, y: H - 110 }, target = null, keys = {}, lives = 3, inv = 2, shield = 0, dbl = 0, rapid = 0;
    let bullets = [], ebul = [], enemies = [], pows = [], wave = 0, toSpawn = 0, spawnT = 0, fireT = 0, kills = 0, dead = false, banner = 0, t = 0;
    const stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 2.5 + 0.5 }));
    const TYPES = {
      drone: { hp: 1, r: 15, pts: 10, col: '#f43f5e', sp: 120 },
      zig: { hp: 2, r: 15, pts: 25, col: '#fb923c', sp: 100 },
      gunner: { hp: 3, r: 18, pts: 40, col: '#a855f7', sp: 70 },
      tank: { hp: 9, r: 28, pts: 120, col: '#22d3ee', sp: 45 },
    };

    function nextWave() {
      wave++; toSpawn = 6 + wave * 3; spawnT = 1.2; banner = 1.6;
      if (wave > 1) { api.addScore(100 * (wave - 1)); api.sfx('level'); }
    }
    nextWave();

    function spawn() {
      const roll = Math.random();
      let type = 'drone';
      if (wave >= 2 && roll < 0.3) type = 'zig';
      if (wave >= 3 && roll < 0.15 + wave * 0.01) type = 'gunner';
      if (wave >= 4 && roll < 0.06 + wave * 0.006) type = 'tank';
      const d = TYPES[type];
      const hp = d.hp + Math.floor(wave / 6);
      enemies.push({ type, x: 40 + Math.random() * (W - 80), y: -30, hp, max: hp, r: d.r, sp: d.sp * (1 + wave * 0.04), ph: Math.random() * 6, fire: 1 + Math.random() * 2, flash: 0 });
    }

    function hitShip() {
      if (inv > 0) return;
      if (shield > 0) { shield = 0; inv = 1; api.sfx('hit'); fx.emit(ship.x, ship.y, '#22d3ee', 20, 200, 0.5, 3); return; }
      lives--; inv = 2; api.sfx('boom'); api.shake(12);
      fx.emit(ship.x, ship.y, '#fb923c', 30, 260, 0.8, 3.5);
      dbl = 0; rapid = 0;
      if (lives <= 0) { dead = true; fx.emit(ship.x, ship.y, '#fff', 50, 340, 1, 4); api.over({ wave, kills }); }
    }

    return {
      keydown(k) { keys[k] = true; },
      keyup(k) { keys[k] = false; },
      pointerdown(x, y) { target = { x, y: y - 60 }; },
      pointermove(x, y, isDown) { if (isDown) target = { x, y: y - 60 }; },
      pointerup() { target = null; },
      update(dt) {
        t += dt; fx.update(dt); fl.update(dt);
        banner = Math.max(0, banner - dt);
        stars.forEach((s) => { s.y += s.z * 60 * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
        if (dead) return;
        inv = Math.max(0, inv - dt); dbl = Math.max(0, dbl - dt); rapid = Math.max(0, rapid - dt);
        // pilotage
        const kx = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.q || keys.Q || keys.a ? 1 : 0);
        const ky = (keys.ArrowDown || keys.s || keys.S ? 1 : 0) - (keys.ArrowUp || keys.z || keys.Z || keys.w ? 1 : 0);
        if (kx || ky) { ship.x += kx * 380 * dt; ship.y += ky * 320 * dt; }
        else if (target) { ship.x += (target.x - ship.x) * Math.min(1, dt * 14); ship.y += (target.y - ship.y) * Math.min(1, dt * 14); }
        ship.x = PA.clamp(ship.x, 24, W - 24); ship.y = PA.clamp(ship.y, H * 0.45, H - 40);
        // tir automatique
        fireT -= dt;
        if (fireT <= 0) {
          fireT = rapid > 0 ? 0.09 : 0.17;
          if (dbl > 0) { bullets.push({ x: ship.x - 10, y: ship.y - 18, vx: -40 }, { x: ship.x + 10, y: ship.y - 18, vx: 40 }, { x: ship.x, y: ship.y - 24, vx: 0 }); }
          else bullets.push({ x: ship.x, y: ship.y - 24, vx: 0 });
          api.sfx('shoot');
        }
        bullets.forEach((b) => { b.y -= 760 * dt; b.x += b.vx * dt; });
        bullets = bullets.filter((b) => b.y > -20 && !b.dead);
        // vagues
        if (toSpawn > 0) { spawnT -= dt; if (spawnT <= 0) { spawn(); toSpawn--; spawnT = Math.max(0.28, 0.9 - wave * 0.05); } }
        else if (!enemies.length) nextWave();
        enemies.forEach((e) => {
          e.ph += dt; e.flash = Math.max(0, e.flash - dt * 6);
          e.y += e.sp * dt;
          if (e.type === 'zig') e.x += Math.sin(e.ph * 3) * 160 * dt;
          if (e.type === 'drone') e.x += Math.sin(e.ph * 1.5) * 40 * dt;
          if (e.type === 'gunner' || e.type === 'tank') {
            if (e.y > 140 && e.type === 'gunner') e.y -= e.sp * dt * 0.7;
            e.fire -= dt;
            if (e.fire <= 0 && e.y > 0) {
              e.fire = e.type === 'tank' ? 1.1 : 1.8 - Math.min(wave * 0.05, 0.8);
              const a = Math.atan2(ship.y - e.y, ship.x - e.x), sp = 230 + wave * 6;
              if (e.type === 'tank') [-0.25, 0, 0.25].forEach((o) => ebul.push({ x: e.x, y: e.y + 20, vx: Math.cos(a + o) * sp, vy: Math.sin(a + o) * sp }));
              else ebul.push({ x: e.x, y: e.y + 14, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
            }
          }
          e.x = PA.clamp(e.x, e.r, W - e.r);
          for (const b of bullets) {
            if (!b.dead && (b.x - e.x) ** 2 + (b.y - e.y) ** 2 < (e.r + 4) ** 2) {
              b.dead = true; e.hp--; e.flash = 1;
              if (e.hp <= 0) break;
            }
          }
          if (e.hp <= 0 && !e.gone) {
            e.gone = true; kills++;
            const d = TYPES[e.type];
            api.addScore(d.pts * (1 + Math.floor(wave / 4)));
            fx.emit(e.x, e.y, d.col, e.type === 'tank' ? 40 : 16, e.type === 'tank' ? 300 : 200, 0.6, 3);
            api.tone(e.type === 'tank' ? 120 : 260, 0.12, 'sawtooth', 0.05, 0.4);
            if (e.type === 'tank') api.shake(8);
            if (Math.random() < (e.type === 'tank' ? 0.8 : 0.07)) pows.push({ x: e.x, y: e.y, k: ['dbl', 'rapid', 'shield'][Math.floor(Math.random() * 3)] });
          }
          if (!e.gone && (e.x - ship.x) ** 2 + (e.y - ship.y) ** 2 < (e.r + 14) ** 2) { e.gone = true; e.hp = 0; fx.emit(e.x, e.y, d0(e), 16, 200, 0.6, 3); hitShip(); }
          if (e.y > H + 40) e.gone = true;
        });
        enemies = enemies.filter((e) => !e.gone);
        ebul.forEach((b) => {
          b.x += b.vx * dt; b.y += b.vy * dt;
          if ((b.x - ship.x) ** 2 + (b.y - ship.y) ** 2 < 15 * 15) { b.dead = true; hitShip(); }
        });
        ebul = ebul.filter((b) => !b.dead && b.y < H + 20 && b.y > -20 && b.x > -20 && b.x < W + 20);
        pows.forEach((p) => {
          p.y += 120 * dt;
          if ((p.x - ship.x) ** 2 + (p.y - ship.y) ** 2 < 30 * 30) {
            p.got = true; api.sfx('power');
            if (p.k === 'dbl') { dbl = 10; fl.add('Tir triple', p.x, p.y - 20, '#facc15'); }
            if (p.k === 'rapid') { rapid = 10; fl.add('Tir rapide', p.x, p.y - 20, '#34d399'); }
            if (p.k === 'shield') { shield = 1; fl.add('Bouclier', p.x, p.y - 20, '#22d3ee'); }
          }
        });
        pows = pows.filter((p) => !p.got && p.y < H + 20);
      },
      draw(g) {
        PA.bg(g, W, H, '#070a1f', '#02030a');
        stars.forEach((s) => { g.fillStyle = `rgba(200,210,255,${s.z / 3})`; g.fillRect(s.x, s.y, s.z, s.z * (1 + s.z)); });
        // bonus
        const PC = { dbl: ['#facc15', '×3'], rapid: ['#34d399', '»'], shield: ['#22d3ee', 'O'] };
        pows.forEach((p) => {
          g.save(); g.shadowColor = PC[p.k][0]; g.shadowBlur = 16; g.fillStyle = PC[p.k][0];
          g.beginPath(); g.arc(p.x, p.y, 13, 0, 7); g.fill(); g.restore();
          PA.text(g, PC[p.k][1], p.x, p.y + 1, 13, '#0b0b16', 'center', 800);
        });
        // ennemis
        enemies.forEach((e) => {
          const c = e.flash ? '#fff' : TYPES[e.type].col;
          g.save(); g.translate(e.x, e.y); g.shadowColor = c; g.shadowBlur = 14; g.fillStyle = c;
          g.beginPath();
          if (e.type === 'drone') { g.moveTo(0, e.r); g.lineTo(e.r, -e.r * 0.6); g.lineTo(0, -e.r * 0.2); g.lineTo(-e.r, -e.r * 0.6); }
          else if (e.type === 'zig') { for (let i = 0; i < 4; i++) { const a = e.ph * 4 + (i * Math.PI) / 2; g.lineTo(Math.cos(a) * e.r, Math.sin(a) * e.r); } }
          else if (e.type === 'gunner') { for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; g.lineTo(Math.cos(a) * e.r, Math.sin(a) * e.r); } }
          else { PA.rr(g, -e.r, -e.r * 0.7, e.r * 2, e.r * 1.4, 10); }
          g.closePath(); g.fill();
          g.shadowBlur = 0; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(0, 0, e.r * 0.35, 0, 7); g.fill();
          g.restore();
          if (e.max > 2) { g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2, 4); g.fillStyle = '#34d399'; g.fillRect(e.x - e.r, e.y - e.r - 10, (e.r * 2 * e.hp) / e.max, 4); }
        });
        // tirs
        g.save(); g.shadowColor = '#facc15'; g.shadowBlur = 10; g.fillStyle = '#fef08a';
        bullets.forEach((b) => g.fillRect(b.x - 2, b.y - 9, 4, 14));
        g.shadowColor = '#f43f5e'; g.fillStyle = '#fda4af';
        ebul.forEach((b) => { g.beginPath(); g.arc(b.x, b.y, 5, 0, 7); g.fill(); });
        g.restore();
        // vaisseau
        if (!dead && (inv <= 0 || Math.floor(t * 14) % 2)) {
          g.save(); g.translate(ship.x, ship.y);
          g.fillStyle = '#fb923c'; g.beginPath(); g.moveTo(-6, 16); g.lineTo(0, 26 + Math.random() * 10); g.lineTo(6, 16); g.fill();
          g.shadowColor = '#818cf8'; g.shadowBlur = 18;
          g.fillStyle = '#e0e7ff'; g.beginPath(); g.moveTo(0, -24); g.lineTo(13, 14); g.lineTo(0, 8); g.lineTo(-13, 14); g.closePath(); g.fill();
          g.fillStyle = '#22d3ee'; g.beginPath(); g.moveTo(-13, 8); g.lineTo(-24, 20); g.lineTo(-9, 15); g.fill(); g.beginPath(); g.moveTo(13, 8); g.lineTo(24, 20); g.lineTo(9, 15); g.fill();
          g.fillStyle = '#6366f1'; g.beginPath(); g.ellipse(0, -4, 4, 8, 0, 0, 7); g.fill();
          if (shield) { g.strokeStyle = `rgba(34,211,238,${0.5 + Math.sin(t * 8) * 0.3})`; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 32, 0, 7); g.stroke(); }
          g.restore();
        }
        fx.draw(g); fl.draw(g);
        // HUD
        PA.text(g, 'VAGUE ' + wave, 22, 34, 17, '#fff', 'left', 800);
        for (let i = 0; i < lives; i++) {
          g.fillStyle = '#e0e7ff'; g.beginPath(); const x = W - 28 - i * 26; g.moveTo(x, 24); g.lineTo(x + 9, 44); g.lineTo(x - 9, 44); g.fill();
        }
        let hy = 60;
        if (dbl > 0) { PA.text(g, 'TIR TRIPLE ' + Math.ceil(dbl), 22, hy, 12, '#facc15', 'left', 700); hy += 18; }
        if (rapid > 0) PA.text(g, 'TIR RAPIDE ' + Math.ceil(rapid), 22, hy, 12, '#34d399', 'left', 700);
        if (banner > 0) {
          g.globalAlpha = Math.min(1, banner);
          PA.text(g, 'VAGUE ' + wave, W / 2, H / 2 - 40, 44, '#fff', 'center', 800);
          if (wave > 1) PA.text(g, '+' + 100 * (wave - 1) + ' points', W / 2, H / 2, 16, '#facc15', 'center', 700);
          g.globalAlpha = 1;
        }
      },
    };
    function d0(e) { return TYPES[e.type].col; }
  },
});
