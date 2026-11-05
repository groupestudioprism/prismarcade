/* Shard Hit — plante tes éclats dans le cristal qui tourne, sans toucher les autres */
PA.register({
  id: 'shard-hit',
  name: 'Shard Hit',
  tagline: 'Plante tes éclats dans le cristal qui tourne.',
  colors: ['#f472b6', '#4c1d95'],
  prize: 1,
  icon: '<svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="17" fill="#fff" opacity=".9"/><circle cx="32" cy="24" r="8" fill="#4c1d95" opacity=".35"/><path d="M32 41v18" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M29 59h6" stroke="#facc15" stroke-width="4" stroke-linecap="round"/><path d="M14 12l-6-4M50 12l6-5M49 37l7 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
  controls: '<b>Espace</b>, <b>clic</b> ou <b>toucher</b> : lancer un éclat.<br>Plante tous tes éclats sans toucher ceux déjà en place. Les <b>gemmes</b> du cristal rapportent des bonus. Un <b>gardien</b> attend tous les 5 niveaux.',
  daily: [40, 90, 160],
  xp: (s, r) => s * 1.6 + (r.level || 1) * 6,
  overTitle: (e) => `Niveau ${e.level || 1}`,
  achievements: [
    { id: 'l5', name: 'Briseur de gardien', desc: 'Battre le premier gardien (niveau 5)', test: (r) => r.level >= 6 },
    { id: 'l11', name: 'Main sûre', desc: 'Atteindre le niveau 11', test: (r) => r.level >= 11 },
    { id: 'g10', name: 'Joaillier précis', desc: 'Toucher 10 gemmes en une partie', test: (r) => r.gems >= 10 },
  ],
  create(api) {
    const W = api.W, CX = W / 2, CY = 250, RAD = 92, SL = 70, START_Y = 640;
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let level = 1, rot = 0, t = 0, stuck = [], gems = [], left = 0, flying = null, dead = false, banner = 1.2, shake = 0, gemsHit = 0, bounce = null, breakT = 0, shards = [];

    const boss = () => level % 5 === 0;
    function setup() {
      stuck = []; gems = []; flying = null; breakT = 0;
      left = Math.min(5 + level, 12) + (boss() ? 2 : 0);
      const pre = level < 3 ? 0 : Math.min(1 + Math.floor(level / 3), 5);
      for (let i = 0; i < pre; i++) stuck.push({ a: (i / pre) * Math.PI * 2 + Math.random() * 0.6, pre: true });
      const ng = 1 + (level % 3 === 0 ? 1 : 0);
      for (let i = 0; i < ng; i++) {
        let a, ok = false, n = 0;
        while (!ok && n++ < 30) { a = Math.random() * Math.PI * 2; ok = stuck.every((s) => angDist(s.a, a) > 0.5); }
        gems.push({ a, hit: false });
      }
      banner = 1.2;
    }
    const angDist = (a, b) => { let d = Math.abs(((a - b) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)); return Math.min(d, Math.PI * 2 - d); };
    function speed() {
      const base = 1.6 + Math.min(level * 0.12, 1.6);
      if (boss()) return base * (Math.sin(t * 1.7) > 0 ? 1.6 : -1.3);
      if (level >= 4 && level % 2 === 0) return base * (0.6 + Math.abs(Math.sin(t * 1.1)) * 1.1);
      if (level >= 7 && level % 3 === 0) return base * Math.sign(Math.sin(t * 0.8) + 0.2);
      return base;
    }
    setup();

    function throwShard() {
      if (dead || flying || breakT > 0 || left <= 0) return;
      flying = { y: START_Y };
      left--;
      api.tone(700, 0.04, 'triangle', 0.05, 1.6);
    }

    return {
      keydown(k) { if (k === ' ' || k === 'Enter' || k === 'ArrowUp') throwShard(); },
      pointerdown: throwShard,
      update(dt) {
        t += dt; fx.update(dt, 500); fl.update(dt);
        banner = Math.max(0, banner - dt); shake = Math.max(0, shake - dt * 30);
        if (bounce) { bounce.y += bounce.vy * dt; bounce.vy += 2200 * dt; bounce.x += bounce.vx * dt; bounce.r += dt * 12; }
        shards.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 1500 * dt; s.r += s.vr * dt; });
        shards = shards.filter((s) => s.y < 900);
        if (dead) return;
        if (breakT > 0) {
          breakT -= dt;
          if (breakT <= 0) { level++; setup(); }
          return;
        }
        rot += speed() * dt;
        if (flying) {
          flying.y -= 2600 * dt;
          if (flying.y <= CY + RAD) {
            const a = Math.PI / 2 - rot;   // angle (dans le repère du cristal) du point d'impact, en bas du cristal
            if (stuck.some((s) => angDist(s.a, a) < 0.17)) {
              dead = true; flying = null; api.sfx('hit'); api.shake(10);
              bounce = { x: CX, y: CY + RAD + 20, vx: (Math.random() - 0.5) * 300, vy: 400, r: 0 };
              fx.emit(CX, CY + RAD, '#fff', 20, 260, 0.6, 3);
              api.over({ level, gems: gemsHit });
              return;
            }
            stuck.push({ a, pre: false });
            flying = null; shake = 6;
            api.addScore(1);
            api.tone(300, 0.05, 'square', 0.05);
            fx.emit(CX, CY + RAD, '#f9a8d4', 6, 120, 0.3, 2);
            gems.forEach((gm) => {
              if (!gm.hit && angDist(gm.a, a) < 0.2) {
                gm.hit = true; gemsHit++; api.addScore(5); api.sfx('coin');
                fl.add('+5', CX + Math.cos(gm.a + rot) * RAD, CY + Math.sin(gm.a + rot) * RAD - 10, '#facc15', 20);
                fx.emit(CX + Math.cos(gm.a + rot) * RAD, CY + Math.sin(gm.a + rot) * RAD, '#facc15', 14, 180, 0.5, 3);
              }
            });
            if (left === 0) {
              // niveau terminé : le cristal éclate
              const bonus = 10 * level + (boss() ? 50 : 0);
              api.addScore(bonus); api.sfx(boss() ? 'win' : 'combo');
              fl.add(boss() ? `Gardien vaincu ! +${bonus}` : `Niveau ${level} ! +${bonus}`, CX, CY + RAD + 70, '#fff', 24);
              for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; shards.push({ x: CX + Math.cos(a) * 40, y: CY + Math.sin(a) * 40, vx: Math.cos(a) * 320, vy: Math.sin(a) * 320 - 200, r: a, vr: (Math.random() - 0.5) * 10, c: boss() ? '#facc15' : '#f0abfc' }); }
              stuck.forEach((s) => fx.emit(CX + Math.cos(s.a + rot) * RAD, CY + Math.sin(s.a + rot) * RAD, '#fff', 3, 200, 0.6, 2));
              api.shake(8);
              breakT = 1.1;
            }
          }
        }
      },
      draw(g) {
        PA.bg(g, W, api.H, boss() ? '#2a0c1a' : '#1d0f3a', '#08040f');
        PA.text(g, (boss() ? 'GARDIEN · ' : 'NIVEAU ') + level, CX, 46, 18, boss() ? '#fda4af' : '#e9d5ff', 'center', 800);
        // éclats restants
        for (let i = 0; i < left; i++) {
          const y = 640 - i * 22;
          g.fillStyle = i === 0 && !flying ? '#fff' : 'rgba(255,255,255,.35)';
          g.beginPath(); g.moveTo(34, y - 8); g.lineTo(42, y); g.lineTo(34, y + 8); g.lineTo(26, y); g.closePath(); g.fill();
        }
        const ox = (Math.random() - 0.5) * shake, oy = (Math.random() - 0.5) * shake;
        if (breakT <= 0) {
          g.save(); g.translate(CX + ox, CY + oy - shake);
          // éclats plantés
          stuck.forEach((s) => {
            g.save(); g.rotate(s.a + rot);
            g.fillStyle = s.pre ? '#94a3b8' : '#fff';
            g.beginPath(); g.moveTo(RAD - 6, -4); g.lineTo(RAD + SL - 12, -4); g.lineTo(RAD + SL, 0); g.lineTo(RAD + SL - 12, 4); g.lineTo(RAD - 6, 4); g.fill();
            g.fillStyle = s.pre ? '#64748b' : '#f472b6'; g.fillRect(RAD + SL - 26, -5, 8, 10);
            g.restore();
          });
          // cristal
          g.rotate(rot);
          const col = boss() ? ['#fb7185', '#be123c'] : ['#e9d5ff', '#7c3aed'];
          g.shadowColor = col[0]; g.shadowBlur = 30;
          const gr = g.createRadialGradient(-20, -20, 10, 0, 0, RAD);
          gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
          g.fillStyle = gr;
          g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.lineTo(Math.cos(a) * RAD, Math.sin(a) * RAD); } g.closePath(); g.fill();
          g.shadowBlur = 0;
          g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
          for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * RAD, Math.sin(a) * RAD); g.stroke(); }
          gems.forEach((gm) => {
            if (gm.hit) return;
            g.save(); g.rotate(gm.a); g.translate(RAD - 14, 0);
            g.fillStyle = '#facc15'; g.shadowColor = '#facc15'; g.shadowBlur = 12;
            g.beginPath(); g.moveTo(-9, 0); g.lineTo(0, -9); g.lineTo(9, 0); g.lineTo(0, 9); g.closePath(); g.fill(); g.restore();
          });
          g.restore();
        }
        shards.forEach((s) => { g.save(); g.translate(s.x, s.y); g.rotate(s.r); g.fillStyle = s.c; g.beginPath(); g.moveTo(-14, 0); g.lineTo(0, -10); g.lineTo(16, 4); g.closePath(); g.fill(); g.restore(); });
        const drawShard = (x, y, r = 0) => {
          g.save(); g.translate(x, y); g.rotate(r);
          g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-4, -SL + 12); g.lineTo(0, -SL); g.lineTo(4, -SL + 12); g.lineTo(4, 0); g.fill();
          g.fillStyle = '#f472b6'; g.fillRect(-5, -6, 10, 14); g.restore();
        };
        if (flying) drawShard(CX, flying.y + SL);
        else if (!dead && left > 0 && breakT <= 0) drawShard(CX, START_Y + SL);
        if (bounce) drawShard(bounce.x, bounce.y, bounce.r);
        fx.draw(g); fl.draw(g);
        if (banner > 0 && breakT <= 0) { g.globalAlpha = Math.min(1, banner); PA.text(g, boss() ? 'GARDIEN !' : 'NIVEAU ' + level, CX, 470, 34, '#fff', 'center', 800); g.globalAlpha = 1; }
      },
    };
  },
});
