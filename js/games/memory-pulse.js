/* Memory Pulse — retiens et rejoue des séquences de couleurs et de sons */
PA.register({
  id: 'memory-pulse',
  name: 'Memory Pulse',
  tagline: 'Mémorise la séquence, rejoue-la sans faute.',
  colors: ['#ec4899', '#581c87'],
  prize: 1.25,
  icon: '<svg viewBox="0 0 64 64"><path d="M30 30H6A24 24 0 0 1 30 6z" fill="#22d3ee"/><path d="M34 30V6a24 24 0 0 1 24 24z" fill="#facc15"/><path d="M30 34v24A24 24 0 0 1 6 34z" fill="#34d399"/><path d="M34 34h24a24 24 0 0 1-24 24z" fill="#fff"/><circle cx="32" cy="32" r="8" fill="#581c87"/></svg>',
  controls: '<b>Toucher</b> les pavés, ou les touches <b>1 2 3 4</b> (ou <b>flèches</b> ↖ ↗ ↙ ↘ : ← ↑ ↓ →).<br>Regarde la séquence, puis rejoue-la. Elle s\'allonge et accélère à chaque manche.',
  daily: [6, 10, 15],
  xp: (s) => s * 10 + s * s * 0.5,
  achievements: [
    { id: 'm8', name: 'Bonne mémoire', desc: 'Réussir 8 manches', test: (r) => r.score >= 8 },
    { id: 'm15', name: 'Mémoire d\'éléphant', desc: 'Réussir 15 manches', test: (r) => r.score >= 15 },
    { id: 'm25', name: 'Cerveau prismatique', desc: 'Réussir 25 manches', test: (r) => r.score >= 25 },
  ],
  create(api) {
    const W = api.W, H = api.H, CX = W / 2, CY = 400, R = 190, RI = 62;
    const PADS = [
      { col: '#22d3ee', f: 329.6, a0: Math.PI, a1: Math.PI * 1.5 },      // haut gauche
      { col: '#facc15', f: 392.0, a0: Math.PI * 1.5, a1: Math.PI * 2 },  // haut droite
      { col: '#34d399', f: 261.6, a0: Math.PI * 0.5, a1: Math.PI },      // bas gauche
      { col: '#f472b6', f: 523.3, a0: 0, a1: Math.PI * 0.5 },            // bas droite
    ];
    const fx = new PA.Particles();
    let seq = [], step = 0, mode = 'wait', timer = 0.9, lit = -1, litT = 0, dead = false, t = 0, msg = 'Regarde bien…', glow = 0;

    const tempo = () => Math.max(0.24, 0.55 - seq.length * 0.018);
    function addStep() { seq.push(Math.floor(Math.random() * 4)); step = 0; mode = 'show'; timer = 0.6; msg = 'Regarde bien…'; }
    function light(i, d) {
      lit = i; litT = d;
      PA.tone(PADS[i].f, d + 0.05, 'sine', 0.16);
      PA.tone(PADS[i].f * 2, d * 0.6, 'triangle', 0.03);
    }
    function center(i) { const a = (PADS[i].a0 + PADS[i].a1) / 2, rr = (R + RI) / 2; return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]; }

    function press(i) {
      if (mode !== 'input' || dead || i < 0) return;
      light(i, 0.22);
      if (seq[step] !== i) {
        dead = true; mode = 'over'; msg = 'Raté !';
        api.tone(140, 0.5, 'sawtooth', 0.08, 0.5); api.shake(10);
        const [x, y] = center(seq[step]); fx.emit(x, y, '#fff', 24, 200, 0.7, 3);
        lit = seq[step]; litT = 0.8;
        api.over({});
        return;
      }
      const [x, y] = center(i); fx.emit(x, y, PADS[i].col, 10, 140, 0.4, 3);
      step++;
      if (step >= seq.length) {
        api.addScore(1); glow = 1;
        msg = seq.length % 5 === 0 ? 'Excellent !' : 'Bravo !';
        mode = 'wait'; timer = 0.9;
        if (seq.length % 5 === 0) api.sfx('win');
      }
    }

    function padAt(x, y) {
      const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy);
      if (d < RI || d > R + 10) return -1;
      return dy < 0 ? (dx < 0 ? 0 : 1) : (dx < 0 ? 2 : 3);
    }
    const KEYS = { '1': 0, '2': 1, '3': 2, '4': 3, ArrowLeft: 0, ArrowUp: 1, ArrowDown: 2, ArrowRight: 3, '&': 0, 'é': 1, '"': 2, "'": 3 };

    return {
      keydown(k) { if (k in KEYS) press(KEYS[k]); },
      pointerdown(x, y) { press(padAt(x, y)); },
      update(dt) {
        t += dt; fx.update(dt);
        glow = Math.max(0, glow - dt * 1.5);
        if (litT > 0) { litT -= dt; if (litT <= 0) lit = -1; }
        if (dead) return;
        if (mode === 'wait') { timer -= dt; if (timer <= 0) addStep(); }
        else if (mode === 'show') {
          timer -= dt;
          if (timer <= 0) {
            if (step < seq.length) { light(seq[step], tempo()); step++; timer = tempo() + 0.12; }
            else { mode = 'input'; step = 0; msg = 'À toi !'; }
          }
        }
      },
      draw(g) {
        PA.bg(g, W, H, '#2a0f3d', '#0b0512');
        PA.text(g, 'MANCHE ' + (seq.length || 1), CX, 92, 16, '#f9a8d4', 'center', 700);
        PA.text(g, msg, CX, 132, 30, '#fff', 'center', 800);
        if (mode === 'input') {
          // progression dans la séquence
          const n = seq.length, w = Math.min(16, 300 / n);
          for (let i = 0; i < n; i++) { g.fillStyle = i < step ? '#fff' : 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(CX - ((n - 1) * w) / 2 + i * w, 168, Math.min(5, w / 2 - 1), 0, 7); g.fill(); }
        }
        // halo
        if (glow) { g.save(); g.globalAlpha = glow * 0.5; g.fillStyle = '#f472b6'; g.beginPath(); g.arc(CX, CY, R + 30 + (1 - glow) * 40, 0, 7); g.fill(); g.restore(); }
        g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.arc(CX, CY, R + 14, 0, 7); g.fill();
        PADS.forEach((p, i) => {
          const on = lit === i;
          g.save();
          g.beginPath(); g.arc(CX, CY, R, p.a0 + 0.04, p.a1 - 0.04); g.arc(CX, CY, RI + 8, p.a1 - 0.08, p.a0 + 0.08, true); g.closePath();
          if (on) { g.shadowColor = p.col; g.shadowBlur = 40; }
          g.fillStyle = on ? PA.shade(p.col, 0.35) : PA.shade(p.col, -0.45);
          g.globalAlpha = mode === 'input' || on ? 1 : 0.75;
          g.fill(); g.restore();
          const [x, y] = center(i);
          PA.text(g, String(i + 1), x, y, 22, on ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.35)', 'center', 800);
        });
        g.fillStyle = '#1a0a26'; g.beginPath(); g.arc(CX, CY, RI, 0, 7); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 2; g.stroke();
        PA.text(g, String(api.score), CX, CY + 2, 40, '#fff', 'center', 800);
        fx.draw(g);
        PA.text(g, 'Record : ' + api.best(), CX, 650, 15, 'rgba(255,255,255,.45)', 'center', 600);
      },
    };
  },
});
