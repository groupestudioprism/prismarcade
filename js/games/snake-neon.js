/* Snake Neon — le serpent classique, version néon */
PA.register({
  id: 'snake-neon',
  name: 'Snake Neon',
  tagline: 'Mange, grandis, ne te mords pas la queue.',
  colors: ['#34d399', '#0f766e'],
  icon: '<svg viewBox="0 0 64 64"><path d="M10 46h18V30h16V18" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="16" r="2.4" fill="#0f766e"/><circle cx="52" cy="44" r="6" fill="#facc15"/></svg>',
  controls: '<b>Flèches</b>, <b>ZQSD</b> ou <b>glisser</b> : tourner.<br>Les prismes dorés rapportent un gros bonus mais disparaissent vite. Ne touche ni les murs, ni ta queue.',
  daily: [150, 300, 500],
  xp: (s, r) => s / 4 + (r.length || 0),
  achievements: [
    { id: 'l20', name: 'Bien nourri', desc: 'Atteindre une longueur de 20', test: (r) => r.length >= 20 },
    { id: 'l45', name: 'Anaconda', desc: 'Atteindre une longueur de 45', test: (r) => r.length >= 45 },
    { id: 'gold5', name: 'Chasseur d\'or', desc: 'Manger 5 prismes dorés en une partie', test: (r) => r.golds >= 5 },
  ],
  create(api) {
    const W = api.W, CELL = 24, COLS = 20, ROWS = 26, OY = 72;
    const fx = new PA.Particles(), fl = new PA.Floaters();
    let snake = [{ x: 6, y: 13 }, { x: 5, y: 13 }, { x: 4, y: 13 }];
    let dir = { x: 1, y: 0 }, queue = [], acc = 0, food = null, gold = null, eaten = 0, golds = 0, dead = false, t = 0, grow = 0;

    const free = () => {
      for (let i = 0; i < 400; i++) {
        const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        if (!snake.some((s) => s.x === p.x && s.y === p.y) && !(food && food.x === p.x && food.y === p.y) && !(gold && gold.x === p.x && gold.y === p.y)) return p;
      }
      return { x: 0, y: 0 };
    };
    food = free();

    function turn(d) {
      if (dead) return;
      const v = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[d];
      if (!v) return;
      const last = queue.length ? queue[queue.length - 1] : dir;
      if (v.x === -last.x && v.y === -last.y) return;
      if (v.x === last.x && v.y === last.y) return;
      if (queue.length < 3) queue.push(v);
    }
    const interval = () => Math.max(0.055, 0.135 - eaten * 0.0018);
    const px = (c) => c * CELL + CELL / 2, py = (r) => OY + r * CELL + CELL / 2;

    function step() {
      if (queue.length) dir = queue.shift();
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      const hitsSelf = snake.slice(0, snake.length - (grow > 0 ? 0 : 1)).some((s) => s.x === head.x && s.y === head.y);
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || hitsSelf) {
        dead = true; api.sfx('boom'); api.shake(10);
        snake.forEach((s, i) => fx.emit(px(s.x), py(s.y), i % 2 ? '#34d399' : '#22d3ee', 3, 160, 0.8, 3));
        api.over({ length: snake.length, golds });
        return;
      }
      snake.unshift(head);
      if (grow > 0) grow--; else snake.pop();
      if (head.x === food.x && head.y === food.y) {
        eaten++; grow += 1; api.addScore(10);
        fx.emit(px(food.x), py(food.y), '#f43f5e', 12, 150, 0.5, 3);
        api.tone(600 + (eaten % 10) * 40, 0.07, 'square', 0.05);
        food = free();
        if (eaten % 5 === 0 && !gold) gold = { ...free(), life: 6 };
      }
      if (gold && head.x === gold.x && head.y === gold.y) {
        golds++; grow += 3; api.addScore(50);
        fl.add('+50', px(gold.x), py(gold.y) - 10, '#facc15', 22);
        fx.emit(px(gold.x), py(gold.y), '#facc15', 24, 220, 0.6, 3.5);
        api.sfx('coin'); gold = null;
      }
    }

    const KEYS = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', z: 'up', w: 'up', s: 'down', q: 'left', a: 'left', d: 'right' };
    return {
      keydown(k) { turn(KEYS[String(k).toLowerCase()]); },
      swipe: turn,
      update(dt) {
        t += dt; fx.update(dt); fl.update(dt);
        if (dead) return;
        if (gold) { gold.life -= dt; if (gold.life <= 0) gold = null; }
        acc += dt;
        while (acc >= interval() && !dead) { acc -= interval(); step(); }
      },
      draw(g) {
        PA.bg(g, W, api.H, '#06201c', '#030b0a');
        PA.text(g, 'LONGUEUR ' + snake.length, 24, 38, 16, '#fff', 'left', 800);
        PA.text(g, 'VITESSE ' + Math.round((0.135 / interval()) * 10) / 10 + '×', W - 24, 38, 14, '#5eead4', 'right', 700);
        // plateau
        g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(0, OY, COLS * CELL, ROWS * CELL);
        g.fillStyle = 'rgba(94,234,212,.08)';
        for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if ((c + r) % 2 === 0) g.fillRect(c * CELL, OY + r * CELL, CELL, CELL);
        g.strokeStyle = 'rgba(94,234,212,.45)'; g.lineWidth = 2; g.strokeRect(1, OY + 1, COLS * CELL - 2, ROWS * CELL - 2);

        // nourriture
        const pulse = 1 + Math.sin(t * 8) * 0.12;
        g.save(); g.shadowColor = '#f43f5e'; g.shadowBlur = 16; g.fillStyle = '#f43f5e';
        g.beginPath(); g.arc(px(food.x), py(food.y), 7 * pulse, 0, 7); g.fill(); g.restore();
        if (gold) {
          g.save(); g.globalAlpha = gold.life < 2 ? (Math.sin(t * 20) > 0 ? 1 : 0.3) : 1;
          g.shadowColor = '#facc15'; g.shadowBlur = 22; g.fillStyle = '#facc15';
          const x = px(gold.x), y = py(gold.y), s = 11 * pulse;
          g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); g.fill(); g.restore();
        }
        // serpent
        if (!dead) {
          g.save(); g.shadowColor = '#34d399'; g.shadowBlur = 14;
          for (let i = snake.length - 1; i >= 0; i--) {
            const s = snake[i], k = i / Math.max(1, snake.length - 1);
            g.fillStyle = `hsl(${160 + k * 30} 80% ${62 - k * 20}%)`;
            const pad = i === 0 ? 1 : 3;
            PA.rr(g, s.x * CELL + pad, OY + s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 7); g.fill();
          }
          g.restore();
          const h = snake[0];
          g.fillStyle = '#04201a';
          const ex = dir.y !== 0 ? 5 : 0, ey = dir.x !== 0 ? 5 : 0;
          [1, -1].forEach((sg) => { g.beginPath(); g.arc(px(h.x) + dir.x * 4 + ex * sg, py(h.y) + dir.y * 4 + ey * sg, 2.6, 0, 7); g.fill(); });
        }
        fx.draw(g); fl.draw(g);
      },
    };
  },
});
