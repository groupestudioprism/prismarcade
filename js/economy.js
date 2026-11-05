/* =========================================================
   Prism Arcade — économie : boutique, coffres, boosts, cadeau du jour,
   récompenses de niveau, classements de la semaine et du mois.
   Chargé après js/core.js.
   ========================================================= */
(function () {
  'use strict';
  const PA = window.PA;
  const S = () => PA.state();

  /* ---------------------------------------------------------
     Catalogue des objets
     rarity : common · rare · epic · legendary · exclusive (jamais en vente : récompenses de classement)
     level  : objet offert en atteignant ce niveau (jamais en vente)
     --------------------------------------------------------- */
  const R = { common: 'Commun', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire', exclusive: 'Exclusif' };
  PA.RARITY = R;
  PA.RARITY_COLOR = { common: '#9ca3af', rare: '#38bdf8', epic: '#c084fc', legendary: '#facc15', exclusive: '#f472b6' };

  const items = [];
  const add = (o) => items.push(o);

  // Thèmes du site (repris de PA.themes)
  PA.themes.forEach((t, i) => add({ id: 'theme:' + t.id, cat: 'theme', name: t.name, price: t.price, rarity: ['common', 'rare', 'rare', 'rare', 'epic', 'legendary'][i] || 'rare', data: { colors: t.colors, short: t.id } }));
  add({ id: 'theme:cosmos', cat: 'theme', name: 'Cosmos', price: 600, rarity: 'epic', data: { colors: ['#818cf8', '#c084fc', '#f0abfc'], short: 'cosmos' } });
  add({ id: 'theme:jade', cat: 'theme', name: 'Jade', price: 600, rarity: 'epic', data: { colors: ['#10b981', '#a3e635', '#fef9c3'], short: 'jade' } });
  add({ id: 'theme:sacre', cat: 'theme', name: 'Sacre du champion', price: 0, rarity: 'exclusive', data: { colors: ['#f472b6', '#facc15', '#fff7ed'], short: 'sacre' }, how: 'Finir 1er d’un classement du mois' });

  // Avatars
  [['fox', '🦊', 'Renard', 120, 'common'], ['owl', '🦉', 'Hibou', 120, 'common'], ['cat', '🐱', 'Chat', 0, 'common', 3], ['frog', '🐸', 'Grenouille', 120, 'common'],
    ['alien', '👾', 'Envahisseur', 220, 'rare'], ['rocket', '🚀', 'Fusée', 220, 'rare'], ['ghost', '👻', 'Fantôme', 220, 'rare'], ['robot', '🤖', 'Robot', 220, 'rare'],
    ['dragon', '🐉', 'Dragon', 480, 'epic'], ['unicorn', '🦄', 'Licorne', 480, 'epic'], ['wolf', '🐺', 'Loup', 480, 'epic'],
    ['crystal', '💎', 'Cristal', 900, 'legendary'], ['star', '🌟', 'Étoile', 0, 'epic', 10], ['fire', '🔥', 'Flamme', 0, 'legendary', 20],
    ['trophy', '🏆', 'Trophée', 0, 'exclusive', 0, 'Finir 1er d’un classement de la semaine'], ['crown', '👑', 'Couronne', 0, 'exclusive', 0, 'Finir 1er d’un classement du mois']]
    .forEach(([id, glyph, name, price, rarity, level, how]) => add({ id: 'avatar:' + id, cat: 'avatar', name, price, rarity, level: level || 0, how, data: { glyph } }));

  // Cadres d'avatar (dégradés CSS)
  [['neon', 'Néon', 320, 'rare', 'conic-gradient(#22d3ee,#a855f7,#22d3ee)'],
    ['sunset', 'Couchant', 320, 'rare', 'linear-gradient(135deg,#fb923c,#f43f5e,#a855f7)'],
    ['emerald', 'Émeraude', 320, 'rare', 'linear-gradient(135deg,#34d399,#059669,#a7f3d0)'],
    ['plasma', 'Plasma', 650, 'epic', 'conic-gradient(#f0abfc,#818cf8,#22d3ee,#f0abfc)', true],
    ['rainbow', 'Arc-en-ciel', 1000, 'legendary', 'conic-gradient(#a855f7,#6366f1,#22d3ee,#34d399,#facc15,#fb923c,#f43f5e,#a855f7)', true],
    ['gold', 'Or massif', 1400, 'legendary', 'linear-gradient(135deg,#fef3c7,#f59e0b,#b45309,#fde047)'],
    ['lv5', 'Bronze', 0, 'rare', 'linear-gradient(135deg,#fdba74,#9a3412,#fed7aa)', false, 5],
    ['lv15', 'Argent', 0, 'epic', 'linear-gradient(135deg,#f1f5f9,#64748b,#e2e8f0)', false, 15],
    ['lv25', 'Platine', 0, 'legendary', 'conic-gradient(#e0f2fe,#a5b4fc,#f5f3ff,#e0f2fe)', true, 25],
    ['crown-week', 'Champion de la semaine', 0, 'exclusive', 'conic-gradient(#facc15,#fb923c,#facc15,#fef08a,#facc15)', true, 0, 'Finir 1er d’un classement de la semaine'],
    ['crown-month', 'Champion du mois', 0, 'exclusive', 'conic-gradient(#f472b6,#facc15,#22d3ee,#a855f7,#f472b6)', true, 0, 'Finir 1er d’un classement du mois']]
    .forEach(([id, name, price, rarity, bg, anim, level, how]) => add({ id: 'frame:' + id, cat: 'frame', name, price, rarity, level: level || 0, how, data: { bg, anim: !!anim } }));

  // Apparences des jeux (données lues par chaque jeu via api.skin())
  const skin = (game, id, name, price, rarity, data) => add({ id: `skin:${game}:${id}`, cat: 'skin', game, name, price, rarity, data });
  skin('flap', 'phoenix', 'Phénix', 260, 'rare', { body: '#f97316', wing: '#fde68a', beak: '#facc15', glow: '#fb923c' });
  skin('flap', 'frost', 'Givre', 260, 'rare', { body: '#7dd3fc', wing: '#ffffff', beak: '#38bdf8', glow: '#bae6fd' });
  skin('flap', 'void', 'Néant', 520, 'epic', { body: '#7c3aed', wing: '#c4b5fd', beak: '#f472b6', glow: '#a78bfa' });
  skin('snake-neon', 'lava', 'Lave', 260, 'rare', { h0: 8, h1: 42, glow: '#fb923c' });
  skin('snake-neon', 'ice', 'Banquise', 260, 'rare', { h0: 188, h1: 225, glow: '#7dd3fc' });
  skin('snake-neon', 'rainbow', 'Arc-en-ciel', 650, 'epic', { rainbow: true, glow: '#f0abfc' });
  skin('astro-blast', 'crimson', 'Écarlate', 300, 'rare', { hull: '#fee2e2', wing: '#f43f5e', cockpit: '#7f1d1d', glow: '#fb7185' });
  skin('astro-blast', 'stealth', 'Furtif', 300, 'rare', { hull: '#d4d4d8', wing: '#3f3f46', cockpit: '#22d3ee', glow: '#a1a1aa' });
  skin('astro-blast', 'solar', 'Solaire', 750, 'legendary', { hull: '#fef3c7', wing: '#f59e0b', cockpit: '#b45309', glow: '#facc15' });
  skin('brick-break', 'aqua', 'Aqua', 220, 'common', { pad: ['#06b6d4', '#ecfeff'], ball: '#a5f3fc', glow: '#22d3ee' });
  skin('brick-break', 'toxic', 'Toxique', 220, 'common', { pad: ['#65a30d', '#ecfccb'], ball: '#d9f99d', glow: '#a3e635' });
  skin('brick-break', 'plasma', 'Plasma', 520, 'epic', { pad: ['#a855f7', '#fdf4ff'], ball: '#f5d0fe', glow: '#e879f9', trail: true });
  skin('fusion', 'ocean', 'Océan', 320, 'rare', { colors: ['#1e3a8a', '#1d4ed8', '#2563eb', '#0284c7', '#0891b2', '#0d9488', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ccfbf1', '#e0f2fe', '#ffffff'] });
  skin('fusion', 'candy', 'Bonbon', 320, 'rare', { colors: ['#f9a8d4', '#f472b6', '#e879f9', '#c084fc', '#a78bfa', '#818cf8', '#60a5fa', '#38bdf8', '#2dd4bf', '#4ade80', '#a3e635', '#facc15', '#fb923c', '#ffffff'] });
  skin('stack', 'pastel', 'Pastel', 220, 'common', { sat: 60, light: 76 });
  skin('stack', 'neon', 'Néon', 420, 'epic', { sat: 100, light: 55, step: 22, glow: true });
  skin('prism-run', 'comet', 'Comète', 320, 'rare', { ring: '#facc15', trail: 26 });
  skin('prism-run', 'ghost', 'Spectre', 520, 'epic', { ring: '#e9d5ff', trail: 34, ghost: true });
  skin('sky-jump', 'slime', 'Slime', 260, 'rare', { body: '#4ade80', eye: '#052e16', glow: '#86efac' });
  skin('sky-jump', 'astro', 'Astronaute', 520, 'epic', { body: '#f8fafc', eye: '#0ea5e9', glow: '#7dd3fc', visor: true });

  // Consommables
  add({ id: 'boost:xp2', cat: 'boost', name: 'XP ×2', desc: 'Double l’XP gagnée pendant 5 parties', price: 180, rarity: 'rare', data: { kind: 'xp', games: 5 }, stack: true });
  add({ id: 'boost:coins2', cat: 'boost', name: 'Pièces ×2', desc: 'Double les pièces gagnées pendant 5 parties', price: 160, rarity: 'rare', data: { kind: 'coins', games: 5 }, stack: true });
  add({ id: 'chest:prism', cat: 'chest', name: 'Coffre prismatique', desc: 'Un objet au hasard que tu ne possèdes pas encore : avatar, cadre, apparence ou thème', price: 280, rarity: 'epic', stack: true });

  PA.items = items;
  PA.item = (id) => items.find((x) => x.id === id) || null;
  PA.CATS = [['all', 'Tout'], ['skin', 'Apparences'], ['avatar', 'Avatars'], ['frame', 'Cadres'], ['theme', 'Thèmes'], ['boost', 'Boosts et coffres']];

  /* ---------------------------------------------------------
     Inventaire, achat, équipement
     --------------------------------------------------------- */
  const owns = (id) => !!(S().inv || {})[id];
  PA.owns = owns;
  function grantItem(id) { const s = S(); s.inv = s.inv || {}; s.inv[id] = 1; }
  PA.slotOf = (it) => (it.cat === 'skin' ? 'skin:' + it.game : it.cat);
  PA.equipped = (slot) => (S().equip || {})[slot] || null;
  PA.isEquipped = (id) => { const it = PA.item(id); return !!it && PA.equipped(PA.slotOf(it)) === id; };

  PA.equip = function (id) {
    const it = PA.item(id), s = S();
    if (!it || !owns(id) || !['theme', 'avatar', 'frame', 'skin'].includes(it.cat)) return false;
    s.equip = s.equip || {};
    s.equip[PA.slotOf(it)] = id;
    if (it.cat === 'theme') { s.theme = it.data.short; if (!(s.themes || []).includes(it.data.short)) s.themes = (s.themes || []).concat(it.data.short); }
    PA.save(); return true;
  };
  PA.unequip = function (slot) {
    const s = S();
    if (slot === 'theme') return PA.equip('theme:prisme');
    if (s.equip && s.equip[slot]) { delete s.equip[slot]; PA.save(); }
    return true;
  };

  PA.buy = function (id) {
    const it = PA.item(id), s = S();
    if (!it || !it.price || it.rarity === 'exclusive' || it.level) return { ok: false, why: 'Cet objet ne s’achète pas.' };
    if (!it.stack && owns(id)) return { ok: false, why: 'Tu possèdes déjà cet objet.' };
    if (s.coins < it.price) return { ok: false, why: 'Pas assez de pièces.' };
    s.coins -= it.price;
    if (it.cat === 'boost') { s.boost = s.boost || {}; s.boost[it.data.kind] = (s.boost[it.data.kind] || 0) + it.data.games; PA.save(); return { ok: true }; }
    if (it.cat === 'chest') { const r = openChest(); PA.save(); return { ok: true, chest: r }; }
    grantItem(id);
    if (it.cat !== 'boost') PA.equip(id); else PA.save();
    return { ok: true };
  };

  /* Coffre : un cosmétique non possédé, tiré selon sa rareté. Tout possédé : 350 pièces. */
  const WEIGHT = { common: 55, rare: 30, epic: 12, legendary: 3 };
  function openChest() {
    const pool = items.filter((x) => ['theme', 'avatar', 'frame', 'skin'].includes(x.cat) && WEIGHT[x.rarity] && !x.level && x.price > 0 && !owns(x.id));
    if (!pool.length) { PA.addCoins(350); return { coins: 350 }; }
    let r = Math.random() * pool.reduce((a, x) => a + WEIGHT[x.rarity], 0);
    const it = pool.find((x) => (r -= WEIGHT[x.rarity]) <= 0) || pool[pool.length - 1];
    grantItem(it.id);
    return { item: it };
  }
  PA.openChest = openChest;

  /* Boosts : consommés à chaque partie terminée (appelé par PA.recordResult). */
  PA.consumeBoosts = function () {
    const s = S(), b = s.boost || {}, m = { xp: 1, coins: 1 };
    if (b.xp > 0) { m.xp = 2; b.xp--; }
    if (b.coins > 0) { m.coins = 2; b.coins--; }
    s.boost = b;
    return m;
  };

  /* Apparence équipée pour un jeu (null = apparence d'origine). */
  PA.skinFor = (gameId) => { const id = PA.equipped('skin:' + gameId); const it = id && PA.item(id); return it ? it.data : null; };

  /* ---------------------------------------------------------
     Récompenses de niveau
     --------------------------------------------------------- */
  PA.levelReward = (lvl) => {
    const r = { coins: 40 + lvl * 15, items: items.filter((x) => x.level === lvl).map((x) => x.id) };
    if (lvl % 4 === 0) r.boost = 'xp';
    return r;
  };
  PA.levelRewards = function (from, to) {
    const out = [];
    for (let l = from + 1; l <= to; l++) {
      const r = PA.levelReward(l);
      PA.addCoins(r.coins);
      r.items.forEach(grantItem);
      if (r.boost) { const s = S(); s.boost = s.boost || {}; s.boost[r.boost] = (s.boost[r.boost] || 0) + 3; }
      out.push(Object.assign({ level: l }, r));
    }
    return out;
  };

  /* ---------------------------------------------------------
     Cadeau du jour (série de 7 jours, le 7e est un coffre)
     --------------------------------------------------------- */
  PA.GIFTS = [50, 70, 90, 110, 140, 170, 'chest'];
  PA.giftState = function () {
    const s = S(), today = PA.dateKey();
    const y = new Date(); y.setDate(y.getDate() - 1);
    const claimedToday = s.giftDay === today;
    const continues = s.giftDay === PA.dateKey(y);
    const streak = claimedToday ? s.giftStreak : continues ? s.giftStreak : 0;
    return { claimedToday, day: claimedToday ? ((streak - 1) % 7) : (streak % 7), streak };
  };
  PA.claimGift = function () {
    const g = PA.giftState(), s = S();
    if (g.claimedToday) return null;
    const reward = PA.GIFTS[g.day];
    let res;
    if (reward === 'chest') res = { chest: openChest() };
    else { PA.addCoins(reward); res = { coins: reward }; }
    s.giftDay = PA.dateKey(); s.giftStreak = g.streak + 1;
    PA.save();
    return Object.assign({ day: g.day + 1 }, res);
  };

  /* ---------------------------------------------------------
     Classements de la semaine et du mois
     Semaine : du lundi 00:00 au dimanche 23:59 (heure UTC, soit 1 h ou 2 h à Paris).
     Mois : du 1er au dernier jour (heure UTC).
     Les règles Firestore n'acceptent un score QUE pour la période en cours (calculée avec l'heure du serveur).
     --------------------------------------------------------- */
  const DAY = 86400000, WEEK = 7 * DAY;
  PA.weekIndex = (ms = Date.now()) => Math.floor((ms + 3 * DAY) / WEEK);
  PA.monthIndex = (ms = Date.now()) => { const d = new Date(ms); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
  PA.periodKey = (game, kind, idx) => `${game}__${kind}${idx === undefined ? (kind === 'w' ? PA.weekIndex() : PA.monthIndex()) : idx}`;
  PA.periodEnd = (kind, idx) => (kind === 'w' ? (idx + 1) * WEEK - 3 * DAY : Date.UTC(Math.floor((idx + 1) / 12), (idx + 1) % 12, 1));
  PA.parseKey = (key) => { const m = /^(.+)__([wm])(\d+)$/.exec(key); return m ? { game: m[1], kind: m[2], idx: Number(m[3]) } : null; };
  PA.periodOver = (key) => { const p = PA.parseKey(key); return !!p && (p.kind === 'w' ? p.idx < PA.weekIndex() : p.idx < PA.monthIndex()); };
  PA.timeLeft = (kind) => {
    const ms = PA.periodEnd(kind, kind === 'w' ? PA.weekIndex() : PA.monthIndex()) - Date.now();
    const d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / 3600000), m = Math.floor((ms % 3600000) / 60000);
    return d > 0 ? `${d} j ${h} h` : h > 0 ? `${h} h ${m} min` : `${m} min`;
  };
  PA.periodLabel = (kind, idx) => {
    if (kind === 'm') { const y = Math.floor(idx / 12), mo = idx % 12; return new Date(Date.UTC(y, mo, 15)).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); }
    const start = new Date(idx * WEEK - 3 * DAY);
    return 'semaine du ' + start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  };

  /* Gains d'un podium : pièces et XP selon la période, le rang et le jeu (def.prize : 1 à 2, selon la difficulté du jeu). */
  PA.prize = function (gameId, kind, rank) {
    const def = PA.gameById[gameId], k = def && def.prize ? def.prize : 1;
    const base = kind === 'w' ? { coins: [500, 250, 120], xp: [400, 200, 100] } : { coins: [2500, 1200, 600], xp: [2000, 1000, 500] };
    if (rank < 1 || rank > 3) return null;
    const r10 = (n) => Math.round((n * k) / 10) * 10;
    const out = { coins: r10(base.coins[rank - 1]), xp: r10(base.xp[rank - 1]), items: [] };
    if (rank === 1) out.items = kind === 'w' ? ['frame:crown-week', 'avatar:trophy'] : ['frame:crown-month', 'avatar:crown', 'theme:sacre'];
    if (rank <= 3 && kind === 'm') out.chests = 4 - rank;   // 3 coffres pour le 1er, 2 pour le 2e, 1 pour le 3e
    else if (rank === 1) out.chests = 1;
    return out;
  };

  /* Attribution (une seule fois par période et par jeu). */
  PA.grantPrize = function (key, rank, score) {
    const s = S(), p = PA.parseKey(key);
    if (!p || (s.claims || {})[key]) return null;
    s.claims = s.claims || {}; s.claims[key] = 1;
    if (s.periods) delete s.periods[key];
    const pr = PA.prize(p.game, p.kind, rank);
    if (!pr) { PA.save(); return null; }
    PA.addCoins(pr.coins); s.xp += pr.xp;
    const got = [];
    pr.items.forEach((id) => { if (!owns(id)) { grantItem(id); got.push(id); } });
    const chestItems = [];
    for (let i = 0; i < (pr.chests || 0); i++) chestItems.push(openChest());
    s.trophies = s.trophies || {};
    s.trophies[key] = { game: p.game, kind: p.kind, idx: p.idx, rank, score: Math.floor(score) || 0, at: Date.now() };
    PA.save();
    return { key, game: p.game, kind: p.kind, idx: p.idx, rank, score, prize: pr, newItems: got, chests: chestItems };
  };

  /* ---------------------------------------------------------
     Reprise d'anciennes sauvegardes (thèmes achetés avant la boutique d'objets)
     --------------------------------------------------------- */
  function migrate() {
    const s = S();
    s.inv = s.inv || {}; s.equip = s.equip || {};
    let changed = !s.inv['theme:prisme'];
    s.inv['theme:prisme'] = 1;
    (s.themes || []).forEach((t) => { if (!s.inv['theme:' + t]) { s.inv['theme:' + t] = 1; changed = true; } });
    if (!s.equip.theme) { s.equip.theme = 'theme:' + (s.theme || 'prisme'); changed = true; }
    // objets de niveau déjà mérités
    const lv = PA.levelInfo().level;
    items.forEach((x) => { if (x.level && x.level <= lv && !s.inv[x.id]) { s.inv[x.id] = 1; changed = true; } });
    if (changed) PA.save();
  }
  const useStore = PA.useStore;
  PA.useStore = function (key, st) { useStore(key, st); migrate(); };
  migrate();
})();
