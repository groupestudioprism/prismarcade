/* =========================================================
   Prism Arcade — noyau de la plateforme
   Profil joueur, XP / niveaux, pièces, succès, défis du jour,
   sons synthétisés et petits outils de dessin partagés.
   Studio Prism — Prism Game
   ========================================================= */
(function () {
  'use strict';

  const PA = (window.PA = { games: [], gameById: {}, version: '1.2.0' });

  /* ---------- Registre des jeux ---------- */
  PA.register = function (def) {
    def.achievements = def.achievements || [];
    def.daily = def.daily || [10, 20, 40];
    def.xp = def.xp || ((s) => s);
    PA.games.push(def);
    PA.gameById[def.id] = def;
  };

  /* ---------- Petit système d'événements ---------- */
  const listeners = {};
  PA.on = (ev, fn) => ((listeners[ev] = listeners[ev] || []).push(fn));
  PA.emit = (ev, data) => (listeners[ev] || []).forEach((fn) => fn(data));

  /* ---------- Palette spectrale ---------- */
  PA.spectrum = ['#a855f7', '#6366f1', '#22d3ee', '#34d399', '#facc15', '#fb923c', '#f43f5e'];

  /* ---------- Hasard déterministe ---------- */
  PA.mulberry = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  PA.hash = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  /* =========================================================
     Sauvegarde (localStorage). Toute la persistance passe par
     load()/save() : c'est ici qu'on branchera Firebase plus tard.
     ========================================================= */
  const GUEST_KEY = 'prismarcade.v1';   // progression « invité » (sans compte)
  let KEY = GUEST_KEY;                   // clé active : invité, ou cache local du compte connecté (js/cloud.js)
  const defaults = () => ({
    version: 1,
    name: 'Joueur',
    xp: 0,
    coins: 0,
    coinsEarned: 0,
    theme: 'prisme',
    themes: ['prisme'],
    muted: false,
    games: {},
    ach: {},
    boards: {},
    inv: {},          // objets possédés (boutique, coffres, récompenses) : id → 1
    equip: {},        // objets équipés : emplacement → id
    boost: {},        // boosts actifs : xp / coins → parties restantes
    periods: {},      // meilleurs scores envoyés aux classements de la semaine / du mois : clé → score
    claims: {},       // récompenses de classement déjà réclamées : clé → 1
    trophies: {},     // trophées gagnés : clé → { game, kind, rank, score, at }
    giftDay: '',      // dernier cadeau du jour récupéré
    giftStreak: 0,
    daily: null,
    dailyStreak: 0,
    lastDailyDone: '',
    totals: { plays: 0, time: 0 },
    created: Date.now(),
  });

  const readKey = (key) => {
    try { const raw = localStorage.getItem(key); return raw ? Object.assign(defaults(), JSON.parse(raw)) : null; } catch (e) { return null; }
  };
  let state = readKey(KEY) || defaults();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
    PA.emit('change', state);
  }

  PA.state = () => state;
  PA.save = save;
  PA.defaults = defaults;
  PA.GUEST_KEY = GUEST_KEY;
  PA.readStore = readKey;
  PA.clearStore = (key) => { try { localStorage.removeItem(key); } catch (e) { /* rien */ } };
  /* Change de sauvegarde active (connexion / déconnexion d'un compte). */
  PA.useStore = function (key, s) { KEY = key; state = Object.assign(defaults(), s || readKey(key) || {}); save(); };
  PA.hasProgress = (s) => !!s && ((s.totals && s.totals.plays > 0) || s.xp > 0);

  /* Fusion de deux progressions (même joueur sur deux appareils, ou partie « invité » rattachée à un compte).
     Maxima et unions : fusionner deux fois donne le même résultat (aucun gain dupliqué). « a » est prioritaire pour les réglages. */
  PA.merge = function (a, b) {
    a = Object.assign(defaults(), a || {}); b = Object.assign(defaults(), b || {});
    const mx = (x, y) => Math.max(Number(x) || 0, Number(y) || 0);
    const out = defaults();
    out.name = a.name !== 'Joueur' ? a.name : b.name;
    ['xp', 'coins', 'coinsEarned', 'dailyStreak'].forEach((k) => (out[k] = mx(a[k], b[k])));
    out.themes = Array.from(new Set([...(a.themes || []), ...(b.themes || []), 'prisme']));
    out.theme = out.themes.includes(a.theme) ? a.theme : 'prisme';
    out.muted = !!a.muted;
    out.lastDailyDone = [a.lastDailyDone || '', b.lastDailyDone || ''].sort().pop();
    out.totals = { plays: mx(a.totals.plays, b.totals.plays), time: mx(a.totals.time, b.totals.time) };
    out.created = Math.min(a.created || Date.now(), b.created || Date.now());
    const ids = new Set([...Object.keys(a.games || {}), ...Object.keys(b.games || {})]);
    ids.forEach((id) => {
      const x = (a.games || {})[id] || {}, y = (b.games || {})[id] || {};
      const extra = {};
      new Set([...Object.keys(x.extra || {}), ...Object.keys(y.extra || {})]).forEach((k) => (extra[k] = mx((x.extra || {})[k], (y.extra || {})[k])));
      out.games[id] = { best: mx(x.best, y.best), plays: mx(x.plays, y.plays), total: mx(x.total, y.total), last: Number(x.last || y.last) || 0, extra, data: Object.assign({}, y.data, x.data) };
    });
    new Set([...Object.keys(a.ach || {}), ...Object.keys(b.ach || {})]).forEach((k) => {
      const v = [(a.ach || {})[k], (b.ach || {})[k]].filter(Boolean);
      out.ach[k] = Math.min(...v);
    });
    new Set([...Object.keys(a.boards || {}), ...Object.keys(b.boards || {})]).forEach((k) => (out.boards[k] = mx((a.boards || {})[k], (b.boards || {})[k])));
    out.inv = Object.assign({}, b.inv, a.inv);
    out.equip = Object.assign({}, b.equip, a.equip);
    ['boost', 'periods'].forEach((f) => new Set([...Object.keys(a[f] || {}), ...Object.keys(b[f] || {})]).forEach((k) => (out[f][k] = mx((a[f] || {})[k], (b[f] || {})[k]))));
    out.claims = Object.assign({}, b.claims, a.claims);
    out.trophies = Object.assign({}, b.trophies, a.trophies);
    const ga = a.giftDay || '', gb = b.giftDay || '';
    out.giftDay = ga >= gb ? ga : gb;
    out.giftStreak = ga === gb ? mx(a.giftStreak, b.giftStreak) : ga > gb ? (a.giftStreak || 0) : (b.giftStreak || 0);
    if (out.equip.theme) out.theme = String(out.equip.theme).replace(/^theme:/, '');
    const da = a.daily, db = b.daily;
    if (da && db && da.date === db.date && Array.isArray(da.list) && Array.isArray(db.list)) {
      out.daily = JSON.parse(JSON.stringify(da));
      out.daily.bonusClaimed = !!(da.bonusClaimed || db.bonusClaimed);
      out.daily.list.forEach((c) => {
        const o = db.list.find((z) => z.id === c.id && z.type === c.type);
        if (!o) return;
        c.progress = mx(c.progress, o.progress); c.done = !!(c.done || o.done);
        if (c.seen || o.seen) c.seen = Array.from(new Set([...(c.seen || []), ...(o.seen || [])]));
      });
    } else out.daily = (da && db ? (da.date >= db.date ? da : db) : da || db) || null;
    return out;
  };

  PA.reset = function () { state = defaults(); save(); };
  PA.exportData = () => JSON.stringify(state, null, 2);
  PA.importData = function (json) {
    const obj = JSON.parse(json);
    if (typeof obj !== 'object' || obj === null || typeof obj.xp !== 'number') throw new Error('Fichier invalide');
    state = Object.assign(defaults(), obj);
    save();
  };

  PA.gameStats = function (id) {
    if (!state.games[id]) state.games[id] = { best: 0, plays: 0, total: 0, last: 0, extra: {}, data: {} };
    const g = state.games[id];
    g.extra = g.extra || {}; g.data = g.data || {};
    return g;
  };

  /* ---------- Niveaux ---------- */
  /* Courbe exigeante : ~350 XP pour le niveau 2, ~2 000 au niveau 5, ~5 500 au niveau 10, ~16 000 au niveau 20 (XP par niveau).
     Une partie moyenne rapporte 40 à 150 XP : le niveau 10 demande environ 150 parties. */
  PA.xpNeeded = (lvl) => Math.round(200 + 150 * Math.pow(lvl, 1.55));
  PA.levelInfo = function (xp = state.xp) {
    let level = 1, rest = xp, need = PA.xpNeeded(1);
    while (rest >= need) { rest -= need; level++; need = PA.xpNeeded(level); }
    return { level, into: rest, need, pct: rest / need };
  };
  const TITLES = [
    [1, 'Novice'], [3, 'Apprenti'], [6, 'Joueur confirmé'], [10, 'Vétéran'],
    [15, 'Expert'], [20, 'Maître du prisme'], [30, 'Légende Arcade'], [40, 'Mythe vivant'],
  ];
  PA.title = function (level = PA.levelInfo().level) {
    let t = TITLES[0][1];
    for (const [l, name] of TITLES) if (level >= l) t = name;
    return t;
  };

  /* ---------- Succès globaux ---------- */
  PA.globalAchievements = [
    { id: 'first', name: 'Première partie', desc: 'Jouer une partie', test: (s) => s.totals.plays >= 1 },
    { id: 'p25', name: 'Habitué', desc: 'Jouer 25 parties', test: (s) => s.totals.plays >= 25 },
    { id: 'p100', name: 'Accro du joystick', desc: 'Jouer 100 parties', test: (s) => s.totals.plays >= 100 },
    { id: 'all', name: 'Touche-à-tout', desc: 'Jouer à tous les jeux', test: (s) => PA.games.every((g) => s.games[g.id] && s.games[g.id].plays > 0) },
    { id: 'lv5', name: 'Niveau 5', desc: 'Atteindre le niveau 5', test: () => PA.levelInfo().level >= 5 },
    { id: 'lv10', name: 'Niveau 10', desc: 'Atteindre le niveau 10', test: () => PA.levelInfo().level >= 10 },
    { id: 'rich', name: 'Collectionneur', desc: 'Gagner 1 000 pièces au total', test: (s) => s.coinsEarned >= 1000 },
    { id: 'daily3', name: 'Régulier', desc: 'Finir les défis du jour 3 jours de suite', test: (s) => s.dailyStreak >= 3 },
  ];

  PA.allAchievements = function () {
    const list = PA.globalAchievements.map((a) => ({ key: 'global:' + a.id, game: null, ...a }));
    PA.games.forEach((g) => g.achievements.forEach((a) => list.push({ key: g.id + ':' + a.id, game: g, ...a })));
    return list;
  };

  /* ---------- Défis du jour ---------- */
  const dateKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  PA.dateKey = dateKey;

  PA.getDaily = function () {
    const today = dateKey();
    if (state.daily && state.daily.date === today && state.daily.list) return state.daily;
    const rng = PA.mulberry(PA.hash('prism-' + today));
    const pool = PA.games.slice();
    const pick = () => pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const g1 = pick(), g2 = pick();
    const tier = (g) => g.daily[Math.min(g.daily.length - 1, Math.floor(rng() * g.daily.length))];
    const list = [
      { id: 'c1', type: 'score', game: g1.id, target: tier(g1), progress: 0, done: false },
      { id: 'c2', type: 'score', game: g2.id, target: tier(g2), progress: 0, done: false },
      rng() < 0.5
        ? { id: 'c3', type: 'plays', target: 3 + Math.floor(rng() * 3), progress: 0, done: false }
        : { id: 'c3', type: 'variety', target: 3, progress: 0, done: false, seen: [] },
    ];
    state.daily = { date: today, list, reward: { xp: 80, coins: 40 }, bonusClaimed: false };
    save();
    return state.daily;
  };

  PA.dailyLabel = function (c) {
    const g = PA.gameById[c.game];
    if (c.type === 'score') return `Atteindre ${c.target.toLocaleString('fr-FR')} points à ${g ? g.name : '?'}`;
    if (c.type === 'plays') return `Jouer ${c.target} parties`;
    return `Jouer à ${c.target} jeux différents`;
  };

  function updateDaily(gameId, score) {
    const d = PA.getDaily();
    const done = [];
    d.list.forEach((c) => {
      if (c.done) return;
      if (c.type === 'score' && c.game === gameId) c.progress = Math.max(c.progress, score);
      if (c.type === 'plays') c.progress++;
      if (c.type === 'variety') {
        c.seen = c.seen || [];
        if (!c.seen.includes(gameId)) c.seen.push(gameId);
        c.progress = c.seen.length;
      }
      if (c.progress >= c.target) {
        c.done = true;
        state.xp += d.reward.xp; addCoins(d.reward.coins);
        done.push(c);
      }
    });
    if (!d.bonusClaimed && d.list.every((c) => c.done)) {
      d.bonusClaimed = true;
      addCoins(100);
      const y = new Date(); y.setDate(y.getDate() - 1);
      state.dailyStreak = state.lastDailyDone === dateKey(y) ? state.dailyStreak + 1 : 1;
      state.lastDailyDone = d.date;
      done.push({ bonus: true });
    }
    return done;
  }

  function addCoins(n) { state.coins += n; state.coinsEarned += n; }

  /* ---------- Enregistrer le résultat d'une partie ---------- */
  PA.recordResult = function (gameId, result, seconds = 0) {
    const def = PA.gameById[gameId];
    const g = PA.gameStats(gameId);
    const score = Math.max(0, Math.floor(result.score || 0));
    const prevBest = g.best;
    g.plays++; g.total += score; g.last = score;
    if (score > g.best) g.best = score;
    for (const k in result) {
      if (k !== 'score' && typeof result[k] === 'number') g.extra[k] = Math.max(g.extra[k] || 0, result[k]);
    }
    state.totals.plays++;
    state.totals.time += seconds;

    const lvBefore = PA.levelInfo().level;
    const mult = PA.consumeBoosts ? PA.consumeBoosts() : { xp: 1, coins: 1 };   // boosts achetés en boutique (js/economy.js)
    const baseXp = Math.max(5, Math.round(def.xp(score, result)));
    const xp = baseXp * mult.xp;
    const coins = Math.max(1, Math.round(baseXp / 4)) * mult.coins;
    state.xp += xp; addCoins(coins);

    const unlocked = [];
    def.achievements.forEach((a) => {
      const key = gameId + ':' + a.id;
      if (!state.ach[key] && a.test(result, g)) {
        state.ach[key] = Date.now(); state.xp += 60; addCoins(25);
        unlocked.push({ ...a, game: def });
      }
    });
    const dailyDone = updateDaily(gameId, score);
    // les succès globaux se vérifient après la mise à jour du reste
    PA.globalAchievements.forEach((a) => {
      const key = 'global:' + a.id;
      if (!state.ach[key] && a.test(state)) {
        state.ach[key] = Date.now(); state.xp += 100; addCoins(50);
        unlocked.push({ ...a, game: null });
      }
    });
    const lvAfter = PA.levelInfo().level;
    const levelRewards = lvAfter > lvBefore && PA.levelRewards ? PA.levelRewards(lvBefore, lvAfter) : [];
    save();
    return { score, xp, coins, mult, prevBest, newBest: score > prevBest && score > 0, unlocked, dailyDone, levelUp: lvAfter > lvBefore ? lvAfter : 0, levelRewards };
  };

  /* ---------- Récompense hors partie (grands jeux : énigme résolue, île terminée…) ---------- */
  PA.award = function (xp, coins) {
    const lvBefore = PA.levelInfo().level;
    xp = Math.max(0, Math.round(xp || 0)); coins = Math.max(0, Math.round(coins || 0));
    state.xp += xp; addCoins(coins);
    const lvAfter = PA.levelInfo().level;
    const levelRewards = lvAfter > lvBefore && PA.levelRewards ? PA.levelRewards(lvBefore, lvAfter) : [];
    save();
    return { xp, coins, levelUp: lvAfter > lvBefore ? lvAfter : 0, levelRewards };
  };

  /* ---------- Boutique : thèmes ---------- */
  PA.themes = [
    { id: 'prisme', name: 'Prisme', price: 0, colors: ['#a855f7', '#22d3ee', '#facc15'] },
    { id: 'aurore', name: 'Aurore boréale', price: 200, colors: ['#34d399', '#22d3ee', '#818cf8'] },
    { id: 'magma', name: 'Magma', price: 300, colors: ['#f43f5e', '#fb923c', '#facc15'] },
    { id: 'ocean', name: 'Abysses', price: 300, colors: ['#0ea5e9', '#6366f1', '#2dd4bf'] },
    { id: 'neon', name: 'Néon rose', price: 450, colors: ['#ec4899', '#a855f7', '#f0abfc'] },
    { id: 'or', name: 'Lingot', price: 900, colors: ['#fde047', '#f59e0b', '#fef3c7'] },
  ];
  PA.addCoins = addCoins;
  PA.setName = function (n) { state.name = String(n).trim().slice(0, 18) || 'Joueur'; save(); };

  /* =========================================================
     Sons synthétisés (Web Audio, aucun fichier à charger)
     ========================================================= */
  let actx = null;
  function audio() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  PA.tone = function (freq, dur = 0.1, type = 'sine', vol = 0.12, slide = 0, delay = 0) {
    if (state.muted) return;
    const a = audio(); if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator(), gn = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(a.destination);
    o.start(t); o.stop(t + dur + 0.03);
  };
  const SFX = {
    tap: () => PA.tone(540, 0.06, 'triangle', 0.1),
    move: () => PA.tone(320, 0.05, 'triangle', 0.07, 1.4),
    point: () => PA.tone(880, 0.09, 'sine', 0.1, 1.5),
    coin: () => { PA.tone(990, 0.07, 'square', 0.05); PA.tone(1320, 0.12, 'square', 0.05, 1, 0.06); },
    hit: () => PA.tone(220, 0.1, 'square', 0.06, 0.6),
    break: () => PA.tone(660, 0.08, 'triangle', 0.09, 0.5),
    power: () => PA.tone(440, 0.25, 'triangle', 0.1, 3),
    combo: () => { PA.tone(660, 0.08, 'sine', 0.1); PA.tone(990, 0.12, 'sine', 0.1, 1, 0.07); },
    perfect: () => { PA.tone(784, 0.1, 'sine', 0.1); PA.tone(1175, 0.16, 'sine', 0.09, 1, 0.08); },
    shoot: () => PA.tone(900, 0.05, 'square', 0.025, 0.4),
    boom: () => PA.tone(150, 0.25, 'sawtooth', 0.08, 0.3),
    over: () => { PA.tone(392, 0.18, 'sawtooth', 0.07, 0.8); PA.tone(262, 0.35, 'sawtooth', 0.07, 0.5, 0.16); },
    level: () => [523, 659, 784, 1047].forEach((f, i) => PA.tone(f, 0.14, 'triangle', 0.09, 1, i * 0.08)),
    win: () => [659, 784, 988, 1319].forEach((f, i) => PA.tone(f, 0.16, 'sine', 0.09, 1, i * 0.09)),
  };
  PA.sfx = (name) => { const f = SFX[name]; if (f) f(); };
  PA.toggleMute = function () { state.muted = !state.muted; save(); return state.muted; };

  /* =========================================================
     Outils de dessin pour les jeux
     ========================================================= */
  PA.rr = function (g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  PA.text = function (g, str, x, y, size = 20, color = '#fff', align = 'center', weight = 700) {
    g.font = `${weight} ${size}px Sora, Inter, system-ui, sans-serif`;
    g.textAlign = align; g.textBaseline = 'middle';
    g.fillStyle = color; g.fillText(str, x, y);
  };
  PA.bg = function (g, W, H, top = '#12112a', bottom = '#07070f') {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  };
  PA.shade = function (hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
    return '#' + ((1 << 24) | (f(r) << 16) | (f(gg) << 8) | f(b)).toString(16).slice(1);
  };
  PA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Particules additives */
  PA.Particles = class {
    constructor() { this.list = []; }
    emit(x, y, color, n = 12, speed = 180, life = 0.6, size = 3) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
        this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life * (0.6 + Math.random() * 0.4), max: life, color, size: size * (0.6 + Math.random() * 0.8) });
      }
    }
    update(dt, gravity = 0) {
      for (let i = this.list.length - 1; i >= 0; i--) {
        const p = this.list[i];
        p.life -= dt;
        if (p.life <= 0) { this.list.splice(i, 1); continue; }
        p.vy += gravity * dt; p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
    draw(g) {
      g.save(); g.globalCompositeOperation = 'lighter';
      for (const p of this.list) {
        g.globalAlpha = Math.max(0, p.life / p.max);
        g.fillStyle = p.color;
        g.beginPath(); g.arc(p.x, p.y, p.size, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
  };

  /* Textes flottants (+10, Parfait !, …) */
  PA.Floaters = class {
    constructor() { this.list = []; }
    add(str, x, y, color = '#fff', size = 22) { this.list.push({ str, x, y, color, size, t: 0 }); }
    update(dt) { this.list.forEach((f) => { f.t += dt; f.y -= 40 * dt; }); this.list = this.list.filter((f) => f.t < 0.9); }
    draw(g) {
      this.list.forEach((f) => { g.globalAlpha = 1 - f.t / 0.9; PA.text(g, f.str, f.x, f.y, f.size, f.color, 'center', 800); });
      g.globalAlpha = 1;
    }
  };
})();
