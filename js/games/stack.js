/* Stack — empile les blocs le plus haut possible, au millimètre */
PA.register({
  id: 'stack',
  name: 'Stack',
  tagline: 'Pose chaque bloc pile sur le précédent.',
  colors: ['#fb923c', '#db2777'],
  icon: '<svg viewBox="0 0 64 64"><rect x="14" y="44" width="36" height="12" rx="3" fill="#fff" opacity=".55"/><rect x="16" y="30" width="34" height="12" rx="3" fill="#fff" opacity=".8"/><rect x="18" y="16" width="30" height="12" rx="3" fill="#fff"/><rect x="30" y="4" width="28" height="10" rx="3" fill="#facc15"/></svg>',
  controls: '<b>Espace</b>, <b>clic</b> ou <b>toucher</b> : poser le bloc.<br>Ce qui dépasse est coupé. Les poses <b>parfaites</b> enchaînées font grandir le bloc.',
  daily: [15, 30, 45],
  xp: (s, r) => s * 5 + (r.perfects || 0) * 3,
  achievements: [
    { id: 's25', name: 'Bâtisseur', desc: 'Empiler 25 blocs', test: (r) => r.score >= 25 },
    { id: 's60', name: 'Gratte-ciel', desc: 'Empiler 60 blocs', test: (r) => r.score >= 60 },
    { id: 'perf8', name: 'Main de chirurgien', desc: '8 poses parfaites d\'affilée', test: (r) => r.combo >= 8 },
  ],
  create(api) {
    const W = api.W, H = api.H, BH = 30, BASE_Y = 620, MAX_W = 280;
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let stack = [{ x: (W - 260) / 2, w: 260, hue: 260 }];
    let cur = null, cam = 0, camT = 0, combo = 0, bestCombo = 0, perfects = 0, dead = false, falling = [], t = 0, ring = 0;

    function spawn() {
      const top = stack[stack.length - 1];
      const n = stack.length;
      const fromLeft = n % 2 === 0;
      const speed = Math.min(520, 210 + n * 8);
      cur = { x: fromLeft ? -top.w : W, w: top.w, dir: fromLeft ? 1 : -1, speed, hue: (top.hue + 9) % 360 };
    }
    spawn();

    const yOf = (i) => BASE_Y - i * BH;
    const col = (hue, l = 60) => `hsl(${hue} 85% ${l}%)`;

    function drop() {
      if (dead || !cur) return;
      const top = stack[stack.length - 1];
      const n = stack.length;
      const diff = cur.x - top.x;
      if (Math.abs(diff) <= 5) {
        // pose parfaite
        combo++; bestCombo = Math.max(bestCombo, combo); perfects++;
        let w = top.w;
        if (combo >= 3) w = Math.min(MAX_W, w + 10);
        const x = top.x - (w - top.w) / 2;
        stack.push({ x, w, hue: cur.hue });
        ring = 1;
        api.tone(520 + Math.min(combo, 12) * 55, 0.12, 'sine', 0.11, 1.2);
        fl.add(combo >= 2 ? `Parfait ×${combo}` : 'Parfait !', W / 2, yOf(n) - cam - 40, '#fff', 22);
        fx.emit(x + w / 2, yOf(n) - cam, col(cur.hue, 70), 22, 240, 0.6, 3);
      } else {
        const overlap = top.w - Math.abs(diff);
        if (overlap <= 0) {
          falling.push({ x: cur.x, y: yOf(n), w: cur.w, vy: 0, vr: cur.dir * 2, r: 0, hue: cur.hue });
          cur = null; dead = true; api.sfx('hit'); api.shake(8);
          api.over({ combo: bestCombo, perfects });
          return;
        }
        combo = 0;
        const x = Math.max(cur.x, top.x);
        // morceau coupé qui tombe
        const cutX = diff > 0 ? x + overlap : cur.x;
        falling.push({ x: cutX, y: yOf(n), w: cur.w - overlap, vy: 0, vr: (diff > 0 ? 1 : -1) * 2.5, r: 0, hue: cur.hue });
        stack.push({ x, w: overlap, hue: cur.hue });
        api.tone(300 + Math.min(n, 40) * 6, 0.07, 'triangle', 0.1);
      }
      api.addScore(1);
      camT = Math.max(0, (stack.length - 12) * BH);
      spawn();
    }

    return {
      keydown(k) { if (k === ' ' || k === 'Enter' || k === 'ArrowDown') drop(); },
      pointerdown: drop,
      update(dt) {
        t += dt; fx.update(dt, 200); fl.update(dt);
        ring = Math.max(0, ring - dt * 2.5);
        cam += (camT - cam) * Math.min(1, dt * 6);
        if (cur) {
          cur.x += cur.dir * cur.speed * dt;
          const top = stack[stack.length - 1];
          const lo = Math.min(-cur.w * 0.6, top.x - 200), hi = Math.max(W - cur.w * 0.4, top.x + 200);
          if (cur.x > hi) { cur.x = hi; cur.dir = -1; }
          if (cur.x < lo) { cur.x = lo; cur.dir = 1; }
        }
        falling.forEach((f) => { f.vy += 1500 * dt; f.y += f.vy * dt; f.r += f.vr * dt; });
        falling = falling.filter((f) => f.y - cam < H + 200);
      },
      draw(g) {
        const top = stack[stack.length - 1];
        const hue = top.hue;
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, `hsl(${(hue + 40) % 360} 55% 18%)`); gr.addColorStop(1, `hsl(${hue} 50% 7%)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const block = (x, i, w, h, l = 60) => {
          const y = yOf(i) - cam;
          g.fillStyle = col(h, l); g.fillRect(x, y - BH, w, BH);
          g.fillStyle = col(h, l + 14); g.fillRect(x, y - BH, w, 6);
          g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y - 4, w, 4);
        };
        const first = Math.max(0, Math.floor(cam / BH) - 2);
        for (let i = first; i < stack.length; i++) block(stack[i].x, i, stack[i].w, stack[i].hue);
        // socle
        const by = yOf(0) - cam;
        if (by < H) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, by, W, H - by); }
        if (ring) {
          const s = stack[stack.length - 1], y = yOf(stack.length - 1) - cam - BH / 2;
          g.strokeStyle = `rgba(255,255,255,${ring})`; g.lineWidth = 3;
          PA.rr(g, s.x - (1 - ring) * 30, y - BH / 2 - (1 - ring) * 14, s.w + (1 - ring) * 60, BH + (1 - ring) * 28, 6); g.stroke();
        }
        if (cur) block(cur.x, stack.length, cur.w, cur.hue, 64);
        falling.forEach((f) => {
          g.save(); g.translate(f.x + f.w / 2, f.y - cam - BH / 2); g.rotate(f.r);
          g.fillStyle = col(f.hue, 55); g.fillRect(-f.w / 2, -BH / 2, f.w, BH); g.restore();
        });
        fx.draw(g); fl.draw(g);
        PA.text(g, String(api.score), W / 2, 110, 72, 'rgba(255,255,255,.9)', 'center', 800);
        if (combo >= 2) PA.text(g, `Combo parfait ×${combo}`, W / 2, 160, 16, '#facc15', 'center', 700);
        if (api.score === 0 && !dead) PA.text(g, 'Touchez pour poser le bloc', W / 2, 690, 15, 'rgba(255,255,255,.5)', 'center', 600);
      },
    };
  },
});
