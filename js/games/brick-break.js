/* Brick Break — casse-briques à niveaux, avec bonus */
PA.register({
  id: 'brick-break',
  name: 'Brick Break',
  tagline: 'Casse toutes les briques, niveau après niveau.',
  colors: ['#f43f5e', '#7c2d12'],
  icon: '<svg viewBox="0 0 64 64"><rect x="6" y="8" width="16" height="8" rx="2" fill="#fff"/><rect x="24" y="8" width="16" height="8" rx="2" fill="#facc15"/><rect x="42" y="8" width="16" height="8" rx="2" fill="#fff"/><rect x="15" y="19" width="16" height="8" rx="2" fill="#fff" opacity=".7"/><rect x="33" y="19" width="16" height="8" rx="2" fill="#fff" opacity=".7"/><circle cx="40" cy="40" r="5" fill="#fff"/><rect x="18" y="52" width="28" height="6" rx="3" fill="#fff"/></svg>',
  controls: '<b>Souris</b> / <b>glisser</b> ou <b>← →</b> : déplacer la raquette.<br><b>Espace</b> ou <b>toucher</b> : lancer la balle. 3 vies. Attrape les bonus qui tombent.',
  repeatKeys: true,
  daily: [1500, 3500, 7000],
  xp: (s, r) => s / 18 + (r.level || 1) * 10,
  overTitle: (e) => `Niveau ${e.level || 1} atteint`,
  achievements: [
    { id: 'l3', name: 'Démolisseur', desc: 'Atteindre le niveau 3', test: (r) => r.level >= 3 },
    { id: 'l6', name: 'Boulet de démolition', desc: 'Atteindre le niveau 6', test: (r) => r.level >= 6 },
    { id: 's10k', name: 'Score fracassant', desc: 'Marquer 10 000 points', test: (r) => r.score >= 10000 },
  ],
  create(api) {
    const W = api.W, H = api.H, PY = 650, COLS = 8, BW = 52, BHH = 22, GAP = 4, TOP = 110;
    const OX = (W - (COLS * (BW + GAP) - GAP)) / 2;
    const HP_COL = ['#38bdf8', '#a855f7', '#f43f5e', '#facc15'];
    const POW = { wide: ['#34d399', 'L'], multi: ['#22d3ee', '×3'], slow: ['#a855f7', 'S'], life: ['#f43f5e', '♥'] };
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let level = 1, lives = 3, bricks = [], balls = [], pows = [], keys = {}, dead = false, banner = 0;
    let pad = { x: W / 2, w: 96, wideT: 0 }, slowT = 0, targetX = null, combo = 0;

    function buildLevel() {
      const rng = PA.mulberry(level * 977 + 13);
      const rows = Math.min(4 + level, 10);
      const pattern = level % 4;
      bricks = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) {
        let keep = true;
        if (pattern === 1) keep = (r + c) % 2 === 0 || r < 2;
        if (pattern === 2) keep = Math.abs(c - 3.5) < r * 0.7 + 1;
        if (pattern === 3) keep = !(c === 3 || c === 4) || r % 3 === 0;
        if (rng() < 0.08 && level > 1) keep = false;
        if (!keep) continue;
        let hp = 1;
        const p = rng();
        if (p < Math.min(0.12 * level, 0.55)) hp = 2;
        if (level >= 3 && p < Math.min(0.06 * level, 0.3)) hp = 3;
        if (level >= 5 && rng() < 0.05) hp = 4; // très résistante
        bricks.push({ x: OX + c * (BW + GAP), y: TOP + r * (BHH + GAP), hp, max: hp, flash: 0 });
      }
      banner = 1.6;
      resetBall();
    }
    function resetBall() { balls = [{ x: pad.x, y: PY - 14, vx: 0, vy: 0, stuck: true }]; }
    function launch() {
      balls.forEach((b) => {
        if (!b.stuck) return;
        const sp = speed(), a = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.stuck = false;
      });
    }
    const speed = () => Math.min(640, 400 + level * 22) * (slowT > 0 ? 0.65 : 1);
    buildLevel();

    function hitBrick(br, b) {
      br.hp--; br.flash = 1; combo++;
      const pts = 10 * combo;
      api.addScore(pts);
      if (br.hp <= 0) {
        api.addScore(40);
        fx.emit(br.x + BW / 2, br.y + BHH / 2, HP_COL[br.max - 1], 14, 200, 0.5, 3);
        api.tone(420 + Math.min(combo, 12) * 40, 0.06, 'square', 0.05);
        if (Math.random() < 0.13) {
          const k = Object.keys(POW)[Math.floor(Math.random() * 4)];
          pows.push({ x: br.x + BW / 2, y: br.y + BHH / 2, k });
        }
      } else api.sfx('hit');
      if (combo >= 5 && combo % 5 === 0) fl.add('Combo ×' + combo, b.x, b.y, '#facc15', 20);
    }

    function stepBall(b, dt) {
      const r = 8;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < r) { b.x = r; b.vx = Math.abs(b.vx); }
      if (b.x > W - r) { b.x = W - r; b.vx = -Math.abs(b.vx); }
      if (b.y < 70 + r) { b.y = 70 + r; b.vy = Math.abs(b.vy); }
      // raquette
      if (b.vy > 0 && b.y + r >= PY && b.y + r <= PY + 16 && Math.abs(b.x - pad.x) <= pad.w / 2 + r) {
        const rel = PA.clamp((b.x - pad.x) / (pad.w / 2), -1, 1);
        const a = -Math.PI / 2 + rel * 1.05, sp = speed();
        b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.y = PY - r;
        combo = 0; api.tone(330, 0.05, 'triangle', 0.08);
      }
      // briques
      for (const br of bricks) {
        if (br.hp <= 0) continue;
        const nx = PA.clamp(b.x, br.x, br.x + BW), ny = PA.clamp(b.y, br.y, br.y + BHH);
        const dx = b.x - nx, dy = b.y - ny;
        if (dx * dx + dy * dy <= r * r) {
          const ox = Math.min(b.x + r - br.x, br.x + BW - (b.x - r));
          const oy = Math.min(b.y + r - br.y, br.y + BHH - (b.y - r));
          if (ox < oy) { b.vx = b.x < br.x + BW / 2 ? -Math.abs(b.vx) : Math.abs(b.vx); }
          else { b.vy = b.y < br.y + BHH / 2 ? -Math.abs(b.vy) : Math.abs(b.vy); }
          hitBrick(br, b);
          break;
        }
      }
    }

    return {
      keydown(k) {
        keys[k] = true;
        if (k === ' ' || k === 'ArrowUp' || k === 'Enter') launch();
      },
      keyup(k) { keys[k] = false; },
      pointerdown(x) { targetX = x; launch(); },
      pointermove(x) { targetX = x; },
      update(dt) {
        fx.update(dt, 300); fl.update(dt);
        banner = Math.max(0, banner - dt);
        if (dead) return;
        slowT = Math.max(0, slowT - dt);
        pad.wideT = Math.max(0, pad.wideT - dt);
        const tw = pad.wideT > 0 ? 150 : 96;
        pad.w += (tw - pad.w) * Math.min(1, dt * 8);
        const kx = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.q || keys.Q || keys.a ? 1 : 0);
        if (kx) { pad.x += kx * 560 * dt; targetX = null; }
        else if (targetX !== null) pad.x += (targetX - pad.x) * Math.min(1, dt * 18);
        pad.x = PA.clamp(pad.x, pad.w / 2, W - pad.w / 2);

        balls.forEach((b) => {
          if (b.stuck) { b.x = pad.x; b.y = PY - 9; return; }
          const steps = 3;
          for (let i = 0; i < steps; i++) stepBall(b, dt / steps);
          // garder une vitesse constante (ralentissement compris)
          const sp = Math.hypot(b.vx, b.vy), want = speed();
          if (sp > 0) { b.vx *= want / sp; b.vy *= want / sp; }
          if (Math.abs(b.vy) < want * 0.25) b.vy = Math.sign(b.vy || -1) * want * 0.25;
        });
        balls = balls.filter((b) => b.y < H + 20);
        bricks.forEach((br) => (br.flash = Math.max(0, br.flash - dt * 5)));
        bricks = bricks.filter((br) => br.hp > 0);

        pows.forEach((p) => {
          p.y += 170 * dt;
          if (p.y > PY - 8 && p.y < PY + 16 && Math.abs(p.x - pad.x) < pad.w / 2 + 12) {
            p.got = true; api.sfx('power');
            if (p.k === 'wide') { pad.wideT = 12; fl.add('Raquette large', p.x, PY - 40, '#34d399'); }
            if (p.k === 'slow') { slowT = 10; fl.add('Ralenti', p.x, PY - 40, '#a855f7'); }
            if (p.k === 'life') { lives = Math.min(5, lives + 1); fl.add('+1 vie', p.x, PY - 40, '#f43f5e'); }
            if (p.k === 'multi') {
              const src = balls.find((b) => !b.stuck) || balls[0];
              if (src) for (let i = 0; i < 2; i++) {
                const a = -Math.PI / 2 + (i ? 0.5 : -0.5), sp = speed();
                balls.push({ x: src.x, y: src.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, stuck: false });
              }
              fl.add('Multi-balle', p.x, PY - 40, '#22d3ee');
            }
          }
        });
        pows = pows.filter((p) => !p.got && p.y < H + 20);

        if (!balls.length) {
          lives--; api.sfx('hit'); api.shake(8); combo = 0;
          if (lives <= 0) { dead = true; api.over({ level }); return; }
          pad.wideT = 0; slowT = 0; resetBall();
        }
        if (!bricks.length) {
          api.addScore(500 * level); api.sfx('win');
          fl.add(`Niveau terminé ! +${500 * level}`, W / 2, H / 2 + 60, '#facc15', 24);
          level++; pows = []; buildLevel();
        }
      },
      draw(g) {
        PA.bg(g, W, H, '#211029', '#0a0710');
        g.strokeStyle = 'rgba(255,255,255,.04)';
        for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, H); g.stroke(); }
        // HUD
        PA.text(g, 'NIVEAU ' + level, 24, 38, 18, '#fff', 'left', 800);
        for (let i = 0; i < lives; i++) { g.fillStyle = '#f43f5e'; g.beginPath(); g.arc(W - 30 - i * 26, 38, 8, 0, 7); g.fill(); }
        if (slowT > 0) PA.text(g, 'RALENTI ' + Math.ceil(slowT), W / 2, 38, 13, '#c4b5fd', 'center', 700);
        g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(0, 69, W, 1);

        bricks.forEach((br) => {
          const c = HP_COL[br.hp - 1];
          g.save(); g.shadowColor = c; g.shadowBlur = 8;
          PA.rr(g, br.x, br.y, BW, BHH, 5); g.fillStyle = br.flash ? '#fff' : c; g.fill(); g.restore();
          g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(br.x + 4, br.y + 3, BW - 8, 4);
          if (br.max >= 3) { g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; PA.rr(g, br.x + 2, br.y + 2, BW - 4, BHH - 4, 4); g.stroke(); }
        });
        pows.forEach((p) => {
          const [c, s] = POW[p.k];
          g.save(); g.shadowColor = c; g.shadowBlur = 14;
          PA.rr(g, p.x - 16, p.y - 11, 32, 22, 11); g.fillStyle = c; g.fill(); g.restore();
          PA.text(g, s, p.x, p.y + 1, 13, '#0b0b16', 'center', 800);
        });
        // raquette
        g.save(); g.shadowColor = '#fb7185'; g.shadowBlur = 18;
        const pg = g.createLinearGradient(pad.x - pad.w / 2, 0, pad.x + pad.w / 2, 0);
        pg.addColorStop(0, '#f43f5e'); pg.addColorStop(0.5, '#fff'); pg.addColorStop(1, '#f43f5e');
        PA.rr(g, pad.x - pad.w / 2, PY, pad.w, 14, 7); g.fillStyle = pg; g.fill(); g.restore();
        balls.forEach((b) => {
          g.save(); g.shadowColor = '#fff'; g.shadowBlur = 16; g.fillStyle = '#fff';
          g.beginPath(); g.arc(b.x, b.y, 8, 0, 7); g.fill(); g.restore();
        });
        fx.draw(g); fl.draw(g);
        if (balls.some((b) => b.stuck) && !dead) PA.text(g, 'Toucher ou Espace pour lancer', W / 2, 700, 14, 'rgba(255,255,255,.55)', 'center', 600);
        if (banner > 0) {
          g.globalAlpha = Math.min(1, banner);
          PA.text(g, 'NIVEAU ' + level, W / 2, H / 2 + 10, 46, '#fff', 'center', 800);
          g.globalAlpha = 1;
        }
      },
    };
  },
});
