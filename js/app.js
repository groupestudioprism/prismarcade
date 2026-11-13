/* =========================================================
   Prism Arcade — interface du site et lanceur de jeux
   ========================================================= */
(function () {
  'use strict';
  const PA = window.PA;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.floor(n).toLocaleString('fr-FR');
  const view = $('#view');
  $('#ver').textContent = PA.version;

  /* ---------- Thème ---------- */
  function applyTheme() {
    const it = PA.item(PA.equipped('theme') || 'theme:prisme') || PA.item('theme:prisme');
    const c = it.data.colors, r = document.documentElement.style;
    r.setProperty('--a1', c[0]); r.setProperty('--a2', c[1]); r.setProperty('--a3', c[2]);
  }

  /* Avatar : icône équipée (sinon l'initiale du pseudo) dans son cadre équipé. */
  function avatarHTML(size = '', o = {}) {
    const s = PA.state();
    const av = o.glyph !== undefined ? o.glyph : (PA.item(PA.equipped('avatar') || '') || { data: {} }).data.glyph;
    const fr = PA.item(o.frame !== undefined ? o.frame : PA.equipped('frame') || '');
    const inner = av ? `<span class="glyph">${esc(av)}</span>` : esc((o.name || s.name).charAt(0).toUpperCase());
    return `<span class="ava ${size} ${fr ? 'framed' : ''} ${fr && fr.data.anim ? 'anim' : ''}" ${fr ? `style="--frame:${fr.data.bg}"` : ''}><span class="avatar ${size} ${av ? 'has-glyph' : ''}">${inner}</span></span>`;
  }

  /* ---------- Puce joueur ---------- */
  const CL = () => PA.cloud || { status: 'error' };
  function renderChip() {
    const s = PA.state(), lv = PA.levelInfo(), c = CL();
    const dot = c.status === 'in' ? `<span class="sync-dot ${c.sync === 'saving' ? 'saving' : c.sync === 'error' ? 'error' : ''}" title="${c.sync === 'error' ? 'Sauvegarde en ligne impossible' : 'Progression sauvegardée sur ton compte'}"></span>` : '';
    $('#auth-slot').innerHTML = c.status === 'out' || (c.status === 'error' && !c.user)
      ? '<button class="btn sm primary" data-login>Se connecter</button>' : '';
    const fs = $('#foot-sync');
    if (fs) fs.textContent = c.status === 'in' ? 'progression sauvegardée sur ton compte Studio Prism' : 'progression sauvegardée sur cet appareil';
    $('#player-chip').innerHTML =
      `${avatarHTML()}
       <span class="chip-info"><b>${esc(s.name)}${dot}</b><small>Niveau ${lv.level}</small>
       <span class="mini-bar"><i style="width:${(lv.pct * 100).toFixed(1)}%"></i></span></span>
       <span class="coins"><span class="coin-ico"></span>${fmt(s.coins)}</span>`;
  }

  /* ---------- Notifications ---------- */
  function toast(icon, title, sub = '') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="t-ico">${icon}</span><div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3600);
  }

  const swatch = (g, size = '') => `<span class="sw ${size}" style="background:linear-gradient(135deg,${g.colors[0]},${g.colors[1]})">${g.icon}</span>`;

  /* =========================================================
     Vues
     ========================================================= */
  function dailyHtml() {
    const d = PA.getDaily();
    const items = d.list.map((c) => {
      const pct = Math.min(1, c.progress / c.target);
      const prog = c.type === 'score' ? `${fmt(Math.min(c.progress, c.target))} / ${fmt(c.target)}` : `${Math.min(c.progress, c.target)} / ${c.target}`;
      const link = c.type === 'score' ? ` href="#/jeu/${c.game}"` : '';
      return `<li class="${c.done ? 'done' : ''}"><span class="check"></span>
        <div><a class="lbl"${link}>${esc(PA.dailyLabel(c))}</a><div class="prog">${prog}</div><div class="bar"><i style="width:${pct * 100}%"></i></div></div>
        <span class="reward">+${d.reward.coins} 🪙</span></li>`;
    }).join('');
    const s = PA.state();
    return `<div class="panel"><h2>Défis du jour <small>se renouvellent à minuit</small></h2>
      <ul class="daily-list">${items}</ul>
      <p class="daily-bonus">${d.bonusClaimed ? '✅ Bonus de 100 pièces récupéré' : 'Termine les 3 défis : <b>+100 pièces</b> de bonus'}${s.dailyStreak > 1 ? ` · Série : <b>${s.dailyStreak} jours</b> 🔥` : ''}</p></div>`;
  }

  function giftHtml() {
    const gs = PA.giftState();
    const days = PA.GIFTS.map((r, i) => {
      const done = i < gs.day || (gs.claimedToday && i === gs.day);
      const today = i === gs.day;
      return `<div class="gift-day ${done ? 'done' : ''} ${today && !gs.claimedToday ? 'today' : ''}"><small>J${i + 1}</small><b>${r === 'chest' ? '🎁' : r}</b>${r === 'chest' ? '<small>coffre</small>' : '<small>pièces</small>'}</div>`;
    }).join('');
    const b = PA.state().boost || {};
    const boosts = [b.xp > 0 ? `<span class="boost-pill">XP ×2 · ${b.xp} partie${b.xp > 1 ? 's' : ''}</span>` : '', b.coins > 0 ? `<span class="boost-pill">Pièces ×2 · ${b.coins} partie${b.coins > 1 ? 's' : ''}</span>` : ''].join('');
    return `<div class="panel gift-panel"><h2>Cadeau du jour <small>${gs.streak > 0 ? `série : ${gs.streak} jour${gs.streak > 1 ? 's' : ''}` : 'reviens chaque jour'}</small></h2>
      <div class="gift-days">${days}</div>
      <div class="gift-foot">${gs.claimedToday ? '<span class="muted">Reviens demain pour le suivant.</span>' : '<button class="btn primary sm" data-gift>Récupérer</button>'}${boosts}</div></div>`;
  }

  function weeklyTeaser() {
    const s = PA.state(), c = CL();
    const mine = Object.entries(s.periods || {}).filter(([k]) => !PA.periodOver(k) && /__w\d+$/.test(k)).length;
    return `<a class="panel teaser" href="#/classements">
      <h2>Classements à cadeaux <small>semaine : fin dans ${PA.timeLeft('w')}</small></h2>
      <p>Finis <b>1er</b> d'un jeu à la fin de la semaine ou du mois : pièces, XP, coffres et objets <b>exclusifs</b> (cadre « Champion », avatar 👑, thème « Sacre du champion »).</p>
      <p class="muted">${c.status === 'in' ? (mine ? `Tu es classé cette semaine dans ${mine} jeu${mine > 1 ? 'x' : ''}.` : 'Joue une partie pour entrer dans le classement de la semaine.') : 'Connecte-toi pour participer.'}</p>
      <span class="btn sm">Voir les classements →</span></a>`;
  }

  function gameCard(g) {
    const st = PA.state().games[g.id];
    const ach = g.achievements.map((a) => `<i class="${PA.state().ach[g.id + ':' + a.id] ? 'on' : ''}"></i>`).join('');
    return `<a class="game-card" href="#/jeu/${g.id}" style="--c1:${g.colors[0]};--c2:${g.colors[1]}">
      <div class="art">${g.icon}</div>
      <div class="body"><h3>${esc(g.name)}</h3><p>${esc(g.tagline)}</p>
      <div class="meta"><span>Record <b>${st ? fmt(st.best) : '—'}</b></span><span class="ach-dots" title="Succès">${ach}</span></div></div></a>`;
  }

  function home() {
    const s = PA.state(), lv = PA.levelInfo();
    const played = PA.games.filter((g) => s.games[g.id] && s.games[g.id].plays).length;
    const last = PA.games.slice().sort((a, b) => ((s.games[b.id] || {}).plays || 0) - ((s.games[a.id] || {}).plays || 0))[0];
    view.innerHTML = `
      <section class="hero">
        <div class="hero-main">
          <p class="kicker">Prism Game · Studio Prism</p>
          <h1>Joue. Progresse.<br><span>Débloque.</span></h1>
          <p class="lead">${PA.games.length} mini-jeux d'arcade, une seule progression : chaque partie te rapporte de l'XP et des pièces, des succès à décrocher et des défis chaque jour.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#/jeu/${s.totals.plays ? last.id : 'fusion'}">${s.totals.plays ? 'Rejouer à ' + esc(last.name) : 'Commencer à jouer'}</a>
            <a class="btn" href="#/profil">Niveau ${lv.level} · ${esc(PA.title(lv.level))}</a>
          </div>
        </div>
        ${dailyHtml()}
      </section>
      <section class="home-row">${giftHtml()}${weeklyTeaser()}</section>
      ${bigGames()}
      <div class="section-head"><div><h2>Mini-jeux</h2><p>Parties rapides, scores à battre. ${played}/${PA.games.length} découverts.</p></div></div>
      <div class="games-grid">${PA.games.map(gameCard).join('')}</div>`;
  }

  /* Grands jeux : pages à part (dossier propre), même compte et même progression */
  function bigGames() {
    const st = PA.state().games.lumen;
    const ex = (st && st.extra) || {};
    const solved = Object.keys(ex).filter((k) => k.startsWith('g:aube:')).length;
    const shards = Object.keys(ex).filter((k) => k.startsWith('s:aube:')).length;
    const done = !!ex['done:aube'];
    const prog = st && st.plays ? `Île de l’Aube : ${done ? 'rallumée ✦ · ' : ''}${solved} énigme${solved > 1 ? 's' : ''} · ${shards} / 10 éclats` : '5 îles jouables (Actes I à V) · 1 île à venir';
    return `<div class="section-head"><div><h2>Grands jeux</h2><p>Des aventures plus longues, avec le même compte et la même progression.</p></div></div>
      <a class="big-game" href="lumen/">
        <img src="lumen/assets/cover.webp" alt="Lumen : une île flottante traversée de faisceaux de lumière" loading="lazy" width="1280" height="720">
        <div class="big-body">
          <span class="badge">${done ? 'Actes I à IV jouables' : 'Nouveau · Actes I à IV jouables'}</span>
          <h3>Lumen <span>: les Îles Brisées</span></h3>
          <p>Aventure, combats et énigmes de lumière en 3D. Explore l’Île de l’Aube, la Forêt de Verre, le Désert des Échos, les Abysses Miroirs puis les Pics du Vent (plane sur les courants d’air, relais à retardement), parle aux habitants, affronte le Colosse, les Gardiens de Verre, des Échos et des Marées et le Grand Meunier, et rallume les phares d’un archipel éteint.</p>
          <p class="big-meta">${esc(prog)}</p>
          <span class="btn primary">${st && st.plays ? 'Continuer' : 'Jouer'}</span>
        </div>
      </a>`;
  }

  function profile() {
    const s = PA.state(), lv = PA.levelInfo();
    const all = PA.allAchievements(), got = all.filter((a) => s.ach[a.key]).length;
    const hours = Math.floor(s.totals.time / 3600), mins = Math.floor((s.totals.time % 3600) / 60);
    const rows = PA.games.map((g) => {
      const st = s.games[g.id] || { best: 0, plays: 0, total: 0 };
      return `<tr><td><a class="tname" href="#/jeu/${g.id}">${swatch(g)}${esc(g.name)}</a></td><td class="num"><b>${fmt(st.best)}</b></td><td class="num">${st.plays}</td><td class="num hide-sm">${st.plays ? fmt(st.total / st.plays) : '—'}</td></tr>`;
    }).join('');
    const achHtml = all.map((a) => `<div class="ach ${s.ach[a.key] ? 'on' : ''}"><span class="medal">${s.ach[a.key] ? '★' : '🔒'}</span><div><b>${esc(a.name)}</b><small>${a.game ? esc(a.game.name) + ' · ' : ''}${esc(a.desc)}</small></div></div>`).join('');
    view.innerHTML = `
      <div class="profile-head">
        <a href="#/boutique/avatar" title="Changer d’avatar">${avatarHTML('lg')}</a>
        <div class="who">
          <div class="name-row"><input class="name-input" id="name-in" value="${esc(s.name)}" maxlength="18" aria-label="Pseudo (visible dans les classements)" title="Pseudo visible dans les classements"></div>
          <span class="title-badge">${esc(PA.title(lv.level))}</span>
          <div class="lvl-block"><div class="row"><span>Niveau <b style="color:var(--text)">${lv.level}</b></span><span>${fmt(lv.into)} / ${fmt(lv.need)} XP</span></div><div class="bar"><i style="width:${lv.pct * 100}%"></i></div></div>
        </div>
      </div>
      ${accountPanel()}
      <div class="stats-grid">
        <div class="stat"><small>XP totale</small><b>${fmt(s.xp)}</b></div>
        <div class="stat"><small>Pièces</small><b style="color:var(--a3)">${fmt(s.coins)}</b></div>
        <div class="stat"><small>Parties jouées</small><b>${fmt(s.totals.plays)}</b></div>
        <div class="stat"><small>Temps de jeu</small><b>${hours ? hours + ' h ' : ''}${mins} min</b></div>
        <div class="stat"><small>Succès</small><b>${got} / ${all.length}</b></div>
      </div>
      <div class="panel"><table class="table"><thead><tr><th>Jeu</th><th class="num">Record</th><th class="num">Parties</th><th class="num hide-sm">Moyenne</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${trophiesHtml()}
      <div class="tabs"><h2>Succès</h2></div>
      <div class="ach-grid">${achHtml}</div>
      <div class="danger-zone">
        <button class="btn sm" id="exp">Exporter ma progression</button>
        <label class="btn sm">Importer<input type="file" id="imp" accept="application/json" hidden></label>
        <button class="btn sm" id="rst">Réinitialiser</button>
        <span>Ta progression est enregistrée dans ce navigateur.</span>
      </div>`;
    const inp = $('#name-in');
    inp.addEventListener('change', () => { PA.setName(inp.value); toast('✏️', 'Pseudo mis à jour', PA.state().name); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
    $('#exp').onclick = () => {
      const blob = new Blob([PA.exportData()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'prism-arcade-progression.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $('#imp').onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { PA.importData(t); toast('📥', 'Progression importée'); route(); } catch (err) { toast('⚠️', 'Import impossible', err.message); } });
    };
    $('#rst').onclick = () => { if (confirm('Effacer toute ta progression (XP, pièces, records, succès) ? Cette action est définitive.')) { PA.reset(); route(); toast('🧹', 'Progression réinitialisée'); } };
  }

  function trophiesHtml() {
    const list = Object.values(PA.state().trophies || {}).sort((a, b) => b.at - a.at);
    const medal = ['🥇', '🥈', '🥉'];
    const body = list.length ? `<div class="trophy-grid">${list.map((t) => { const g = PA.gameById[t.game]; return `<div class="trophy r${t.rank}"><span class="tmedal">${medal[t.rank - 1] || '🏅'}</span><div><b>${esc(g ? g.name : t.game)}</b><small>${t.rank}<sup>${t.rank === 1 ? 'er' : 'e'}</sup> · ${esc(PA.periodLabel(t.kind, t.idx))} · ${fmt(t.score)} pts</small></div></div>`; }).join('')}</div>`
      : '<p class="muted">Aucun trophée pour le moment. Finis sur le podium d’un classement de la semaine ou du mois pour en gagner.</p>';
    return `<div class="tabs"><h2>Trophées</h2><a class="btn sm" href="#/classements">Classements</a></div>${body}`;
  }

  function accountPanel() {
    const c = CL();
    if (c.status === 'in') {
      const sync = c.sync === 'error' ? `<span style="color:#fb7185">Sauvegarde en ligne impossible : ${esc(PA.errText(c.syncError))}</span> <button class="link-btn" data-sync>Réessayer</button>`
        : c.sync === 'saving' ? 'Sauvegarde en cours…' : 'Progression sauvegardée en ligne : retrouve-la sur tous tes appareils.';
      return `<div class="panel account-panel"><div><b>Compte Studio Prism</b><p>${esc(c.user.email)} · ${sync}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn sm" href="${PA.SITE}#/compte" target="_blank" rel="noopener">Gérer mon compte</a><button class="btn sm" data-logout>Se déconnecter</button></div></div>`;
    }
    if (c.status === 'loading') return '<div class="panel account-panel"><div><b>Compte Studio Prism</b><p>Connexion en cours…</p></div></div>';
    const err = c.status === 'error' && c.notice ? `<p style="color:#fb7185">${esc(PA.errText(c.notice))}</p>` : c.notice ? `<p style="color:#fb7185">${esc(PA.errText(c.notice))}</p>` : '';
    return `<div class="panel account-panel"><div><b>Joue avec ton compte Studio Prism</b><p>Sauvegarde ta progression en ligne, retrouve-la sur tous tes appareils et entre dans les classements.</p>${err}</div><button class="btn sm primary" data-login>Se connecter</button></div>`;
  }

  /* =========================================================
     Boutique
     ========================================================= */
  let shopCat = 'all';
  function previewHTML(it) {
    if (it.cat === 'avatar') return `<div class="prev prev-av">${avatarHTML('lg', { glyph: it.data.glyph })}</div>`;
    if (it.cat === 'frame') return `<div class="prev prev-av">${avatarHTML('lg', { frame: it.id })}</div>`;
    if (it.cat === 'theme') return `<div class="prev" style="background:linear-gradient(120deg,${it.data.colors.join(',')})"></div>`;
    if (it.cat === 'skin') {
      const g = PA.gameById[it.game], d = it.data;
      const cols = (d.colors ? d.colors.filter((_, i) => i % 3 === 0) : [d.body, d.wing, d.beak, d.hull, d.cockpit, d.ring, d.ball, d.glow, d.pad && d.pad[0]].filter(Boolean)).slice(0, 5);
      const dots = d.rainbow ? PA.spectrum : d.h0 !== undefined ? [`hsl(${d.h0} 80% 60%)`, `hsl(${(d.h0 + d.h1) / 2} 80% 55%)`, `hsl(${d.h1} 80% 50%)`] : d.sat !== undefined ? [0, 60, 120, 200, 280].map((h) => `hsl(${h} ${d.sat}% ${d.light}%)`) : cols;
      return `<div class="prev prev-skin" style="--c1:${g ? g.colors[0] : '#555'};--c2:${g ? g.colors[1] : '#222'}">${g ? g.icon : ''}<span class="dots">${dots.map((c) => `<i style="background:${c}"></i>`).join('')}</span></div>`;
    }
    if (it.cat === 'boost') return `<div class="prev prev-icon">${it.data.kind === 'xp' ? '⚡' : '🪙'}<b>×2</b></div>`;
    return '<div class="prev prev-icon prev-chest">🎁</div>';
  }
  function itemCard(it) {
    const s = PA.state(), owned = PA.owns(it.id), eq = PA.isEquipped(it.id), lv = PA.levelInfo().level;
    const g = it.game ? PA.gameById[it.game] : null;
    let action;
    if (it.cat === 'boost' || it.cat === 'chest') action = `<button class="btn sm primary" data-buy="${it.id}" ${s.coins < it.price ? 'disabled' : ''}><span class="coin-ico"></span>${fmt(it.price)}</button>`;
    else if (eq) action = it.cat === 'theme' ? '<span class="tag on">Équipé</span>' : `<button class="btn sm" data-unequip="${PA.slotOf(it)}">Retirer</button>`;
    else if (owned) action = `<button class="btn sm" data-equip="${it.id}">Équiper</button>`;
    else if (it.level) action = `<span class="tag">🔒 Niveau ${it.level}${lv >= it.level ? '' : ''}</span>`;
    else if (it.rarity === 'exclusive') action = '<span class="tag">🏆 Récompense</span>';
    else action = `<button class="btn sm primary" data-buy="${it.id}" ${s.coins < it.price ? 'disabled' : ''}><span class="coin-ico"></span>${fmt(it.price)}</button>`;
    const sub = it.desc || it.how || (g ? 'Apparence · ' + g.name : { avatar: 'Avatar', frame: 'Cadre d’avatar', theme: 'Thème du site' }[it.cat]);
    return `<div class="item-card ${eq ? 'equipped' : ''} ${owned && !eq ? 'owned' : ''}" style="--rar:${PA.RARITY_COLOR[it.rarity]}">
      ${previewHTML(it)}<div class="body"><span class="rar">${PA.RARITY[it.rarity]}</span><h3>${esc(it.name)}</h3><small class="muted">${esc(sub)}</small>
      <div class="item-act">${action}</div></div></div>`;
  }
  function shop(arg) {
    if (arg && PA.CATS.some(([k]) => k === arg)) shopCat = arg;
    const s = PA.state();
    const cats = PA.CATS.map(([k, label]) => `<button class="chip-btn ${k === shopCat ? 'on' : ''}" data-cat="${k}">${label}</button>`).join('');
    const ordered = PA.items.filter((it) => shopCat === 'all' ? true : shopCat === 'boost' ? ['boost', 'chest'].includes(it.cat) : it.cat === shopCat)
      .slice().sort((a, b) => (['chest', 'boost'].includes(b.cat) - ['chest', 'boost'].includes(a.cat)) || (PA.owns(a.id) - PA.owns(b.id)) || ((a.rarity === 'exclusive') - (b.rarity === 'exclusive')) || (!!a.level - !!b.level) || a.price - b.price);
    const ownedN = PA.items.filter((it) => !['boost', 'chest'].includes(it.cat) && PA.owns(it.id)).length, totalN = PA.items.filter((it) => !['boost', 'chest'].includes(it.cat)).length;
    view.innerHTML = `
      <div class="section-head"><div><h2>Boutique</h2><p>Tu as <b class="coins"><span class="coin-ico"></span>${fmt(s.coins)}</b> · collection : ${ownedN} / ${totalN} objets</p></div><a class="btn sm" href="#/profil">Mon profil</a></div>
      <div class="chip-row">${cats}</div>
      <div class="shop-grid">${ordered.map(itemCard).join('')}</div>
      <p class="small-note">Les apparences s'appliquent dans le jeu correspondant. Les objets <b>Exclusifs</b> ne s'achètent pas : ils récompensent les podiums des classements. Les objets de niveau sont offerts en montant de niveau.</p>`;
  }
  view.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]'); if (c) { shopCat = c.dataset.cat; shop(); return; }
    const b = e.target.closest('[data-buy]');
    if (b) {
      const it = PA.item(b.dataset.buy), r = PA.buy(b.dataset.buy);
      if (!r.ok) { toast('⚠️', r.why); return; }
      PA.sfx('coin');
      if (r.chest) chestReveal(r.chest);
      else if (it.cat === 'boost') toast(it.data.kind === 'xp' ? '⚡' : '🪙', it.name + ' activé', `Pour tes ${it.data.games} prochaines parties`);
      else toast('✨', 'Objet débloqué', it.name);
      shop(); return;
    }
    const q = e.target.closest('[data-equip]'); if (q) { PA.equip(q.dataset.equip); PA.sfx('tap'); shop(); return; }
    const u = e.target.closest('[data-unequip]'); if (u) { PA.unequip(u.dataset.unequip); shop(); return; }
    const gf = e.target.closest('[data-gift]');
    if (gf) {
      const r = PA.claimGift(); if (!r) return;
      PA.sfx('coin');
      if (r.chest) chestReveal(r.chest, 'Cadeau du jour ' + r.day + ' !'); else toast('🎁', `Cadeau du jour ${r.day}`, `+${r.coins} pièces`);
      route();
    }
  });

  function chestReveal(res, title = 'Coffre prismatique') {
    modal.hidden = false;
    const it = res.item;
    modal.innerHTML = `<div class="ov-card chest-card" style="--rar:${it ? PA.RARITY_COLOR[it.rarity] : '#facc15'}">
      <p class="kicker" style="margin:0">${esc(title)}</p>
      <div class="chest-burst">${it ? previewHTML(it) : '<div class="prev prev-icon">🪙</div>'}</div>
      ${it ? `<span class="rar">${PA.RARITY[it.rarity]}</span><h2>${esc(it.name)}</h2><p>${esc(it.game ? 'Apparence · ' + PA.gameById[it.game].name : { avatar: 'Avatar', frame: 'Cadre d’avatar', theme: 'Thème du site' }[it.cat])}</p>`
        : `<h2>+${fmt(res.coins)} pièces</h2><p>Tu possèdes déjà tous les objets !</p>`}
      <div class="actions">${it ? `<button class="btn primary" data-equip-close="${it.id}">Équiper</button>` : ''}<button class="btn" data-close>Fermer</button></div></div>`;
    PA.sfx(it && ['epic', 'legendary'].includes(it.rarity) ? 'win' : 'combo');
    const eqb = modal.querySelector('[data-equip-close]');
    if (eqb) eqb.onclick = () => { PA.equip(eqb.dataset.equipClose); closeModal(); route(); };
  }

  /* Cadeaux de classement gagnés (périodes terminées) */
  PA.on('prizes', (list) => {
    const medal = ['🥇', '🥈', '🥉'];
    const rows = list.map((w) => {
      const g = PA.gameById[w.game], extra = [w.prize.chests ? `${w.prize.chests} coffre${w.prize.chests > 1 ? 's' : ''}` : '', ...w.newItems.map((id) => PA.item(id).name)].filter(Boolean).join(' · ');
      return `<div class="unlock"><i>${medal[w.rank - 1]}</i><div><b>${w.rank}<sup>${w.rank === 1 ? 'er' : 'e'}</sup> à ${esc(g ? g.name : w.game)}</b> <small>(${esc(PA.periodLabel(w.kind, w.idx))})</small><br><small>+${fmt(w.prize.coins)} pièces · +${fmt(w.prize.xp)} XP${extra ? ' · ' + esc(extra) : ''}</small></div></div>`;
    }).join('');
    const chestItems = list.flatMap((w) => w.chests || []).map((r) => r.item ? r.item.name : `+${r.coins} pièces`);
    const show = () => {
      modal.hidden = false;
      modal.innerHTML = `<div class="ov-card"><p class="kicker" style="margin:0">Classements</p><h2>Tu as gagné !</h2><p>Tes résultats des classements terminés :</p>
        <div class="unlocks">${rows}</div>${chestItems.length ? `<p class="small-note">Dans tes coffres : ${esc(chestItems.join(', '))}</p>` : ''}
        <div class="actions"><a class="btn primary" href="#/profil" data-close>Voir mes trophées</a><button class="btn" data-close>Fermer</button></div></div>`;
      PA.sfx('win');
    };
    if (layer.hidden && modal.hidden) show(); else { const wait = setInterval(() => { if (layer.hidden && modal.hidden) { clearInterval(wait); show(); } }, 1500); }
  });

  /* =========================================================
     Compte : fenêtre de connexion
     ========================================================= */
  const modal = $('#modal');
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; }
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  document.addEventListener('click', async (e) => {
    if (e.target.closest('[data-login]')) { e.preventDefault(); loginModal(); return; }
    if (e.target.closest('[data-sync]')) { PA.cloud.retry(); return; }
    const lo = e.target.closest('[data-logout]');
    if (lo) { lo.disabled = true; await PA.cloud.signOut().catch(() => {}); toast('👋', 'Déconnecté', 'Ta progression reste sauvegardée sur ton compte.'); }
  });

  function loginModal(mode = 'login') {
    const c = CL();
    if (c.status === 'error' && c.notice === 'app/sdk-unavailable') { toast('⚠️', 'Comptes indisponibles', PA.errText('app/sdk-unavailable')); return; }
    modal.hidden = false;
    const signup = PA.SITE + '#/compte/inscription';
    if (mode === 'reset') {
      modal.innerHTML = `<form class="ov-card" id="f-reset" novalidate><h2>Mot de passe oublié</h2>
        <p class="muted" style="margin:6px 0 0;font-size:14px">Indique l'adresse de ton compte Studio Prism : un lien pour choisir un nouveau mot de passe t'est envoyé.</p>
        <div class="field"><label for="r-mail">Adresse e-mail</label><input id="r-mail" type="email" autocomplete="email" required></div>
        <p class="form-err" id="r-err" role="alert"></p>
        <div class="actions" style="display:flex;flex-direction:column;gap:8px;margin-top:10px"><button class="btn primary" type="submit">Envoyer le lien</button><button class="btn" type="button" data-back>Retour</button></div></form>`;
      $('#r-mail').focus();
      modal.querySelector('[data-back]').onclick = () => loginModal();
      $('#f-reset').onsubmit = async (e) => {
        e.preventDefault();
        const b = e.target.querySelector('[type=submit]'); b.disabled = true;
        try { await PA.cloud.resetPassword($('#r-mail').value); $('#r-err').className = 'form-ok'; $('#r-err').textContent = 'Si un compte existe pour cette adresse, un e-mail vient d’être envoyé.'; }
        catch (err) { $('#r-err').className = 'form-err'; $('#r-err').textContent = PA.errText(err); }
        b.disabled = false;
      };
      return;
    }
    modal.innerHTML = `<form class="ov-card" id="f-login" novalidate>
      <div style="display:flex;align-items:center;gap:12px"><img src="assets/logo-mark.svg" width="44" height="44" alt="" style="border-radius:12px"><div><h2>Connexion</h2><p class="muted" style="margin:2px 0 0;font-size:13px">avec ton compte Studio Prism</p></div></div>
      <div class="field"><label for="l-mail">Adresse e-mail</label><input id="l-mail" type="email" autocomplete="email" required></div>
      <div class="field"><label for="l-pass">Mot de passe</label><input id="l-pass" type="password" autocomplete="current-password" required></div>
      <label class="check-row"><input type="checkbox" id="l-rem" checked> Rester connecté sur cet appareil</label>
      <p class="form-err" id="l-err" role="alert"></p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px"><button class="btn primary" type="submit">Se connecter</button><button class="btn" type="button" data-close>Plus tard</button></div>
      <p class="small-note"><button class="link-btn" type="button" data-reset>Mot de passe oublié ?</button></p>
      <p class="small-note">Pas encore de compte ? <a href="${signup}" target="_blank" rel="noopener">Créer un compte Studio Prism</a> (gratuit), puis reviens te connecter ici.</p>
      <p class="small-note">Ta progression actuelle sur cet appareil sera ajoutée à ton compte. Ton pseudo apparaît dans les classements publics.</p></form>`;
    $('#l-mail').focus();
    modal.querySelector('[data-reset]').onclick = () => loginModal('reset');
    $('#f-login').onsubmit = async (e) => {
      e.preventDefault();
      const b = e.target.querySelector('[type=submit]'); b.disabled = true; b.textContent = 'Connexion…';
      $('#l-err').textContent = '';
      try {
        await PA.cloud.signIn($('#l-mail').value, $('#l-pass').value, $('#l-rem').checked);
        closeModal();
        toast('✅', 'Connecté', PA.cloud.notice === 'merged' ? 'Ta progression a été ajoutée à ton compte.' : 'Ta progression est sauvegardée en ligne.');
        route();
      } catch (err) {
        $('#l-err').textContent = PA.errText(err);
        b.disabled = false; b.textContent = 'Se connecter';
      }
    };
  }

  /* =========================================================
     Classements : records, semaine, mois
     ========================================================= */
  const FRAME_BG = (id) => { const f = PA.item(id || ''); return f && f.cat === 'frame' ? f : null; };
  function rowAvatar(r) {
    const f = FRAME_BG(r.frame);
    return `<span class="ava sm ${f ? 'framed' : ''} ${f && f.data.anim ? 'anim' : ''}" ${f ? `style="--frame:${f.data.bg}"` : ''}><span class="avatar sm ${r.avatar ? 'has-glyph' : ''}">${r.avatar ? `<span class="glyph">${esc(r.avatar)}</span>` : esc((r.name || '?').charAt(0).toUpperCase())}</span></span>`;
  }
  function boardRows(list, myUid, limit) {
    return list.slice(0, limit).map((r, i) => `<li class="${r.uid === myUid ? 'me' : ''}"><span class="rk">${i + 1}</span><span class="nm">${rowAvatar(r)}<span>${esc(r.name)}${r.uid === myUid ? ' <small>(toi)</small>' : ''}</span></span><span class="sc">${fmt(r.score)}</span></li>`).join('');
  }
  let boardGame = null, boardKind = 'w';
  function prizeTable(gameId, kind) {
    const medal = ['🥇', '🥈', '🥉'];
    return `<div class="prize-table">${[1, 2, 3].map((rk) => {
      const p = PA.prize(gameId, kind, rk);
      const extra = [p.chests ? `🎁 ×${p.chests}` : '', ...p.items.map((id) => PA.item(id).name)].filter(Boolean).join(' · ');
      return `<div class="prize r${rk}"><span>${medal[rk - 1]}</span><div><b><span class="coin-ico"></span> ${fmt(p.coins)}</b> · ${fmt(p.xp)} XP${extra ? `<small>${esc(extra)}</small>` : ''}</div></div>`;
    }).join('')}</div>`;
  }
  function leaderboards() {
    if (!boardGame || !PA.gameById[boardGame]) boardGame = PA.games[0].id;
    const c = CL(), g = PA.gameById[boardGame];
    const kinds = [['w', 'Cette semaine'], ['m', 'Ce mois'], ['all', 'Records']];
    const period = boardKind === 'all' ? null : PA.periodKey(boardGame, boardKind);
    const head = boardKind === 'all'
      ? `<p class="muted">Les meilleurs scores de tous les temps à ${esc(g.name)}.</p>`
      : `<div class="period-head"><div><b>${esc(PA.periodLabel(boardKind, boardKind === 'w' ? PA.weekIndex() : PA.monthIndex()))}</b><p class="muted">Fin dans <b style="color:var(--text)">${PA.timeLeft(boardKind)}</b> · cadeaux ×${g.prize || 1} pour ce jeu</p></div>${prizeTable(boardGame, boardKind)}</div>`;
    view.innerHTML = `<div class="section-head"><div><h2>Classements</h2><p>Finis sur le podium à la fin de la semaine ou du mois pour gagner des cadeaux, remis automatiquement à ta prochaine visite.${c.status === 'in' ? '' : ' Connecte-toi pour participer.'}</p></div>
        ${c.status === 'in' ? '' : '<button class="btn sm primary" data-login>Se connecter</button>'}</div>
      <div class="game-picker" role="tablist" aria-label="Jeu">${PA.games.map((x) => `<button class="pick ${x.id === boardGame ? 'on' : ''}" data-board="${x.id}" role="tab" aria-selected="${x.id === boardGame}" title="${esc(x.name)}">${swatch(x)}<span>${esc(x.name)}</span></button>`).join('')}</div>
      <div class="seg" role="tablist" aria-label="Période">${kinds.map(([k, l]) => `<button class="${k === boardKind ? 'on' : ''}" data-kind="${k}" role="tab" aria-selected="${k === boardKind}">${l}</button>`).join('')}</div>
      <div class="panel board-panel">${head}<div id="board-me"></div><ol class="board" id="board-list"><li><span></span><span class="muted">Chargement…</span><span></span></li></ol></div>
      ${boardKind !== 'all' ? '<div id="last-winners"></div>' : ''}`;
    view.querySelectorAll('[data-board]').forEach((b) => (b.onclick = () => { boardGame = b.dataset.board; leaderboards(); }));
    view.querySelectorAll('[data-kind]').forEach((b) => (b.onclick = () => { boardKind = b.dataset.kind; leaderboards(); }));
    if (!PA.cloud || !PA.cloud.top) { $('#board-list').innerHTML = '<li><span></span><span class="muted">Classements indisponibles.</span><span></span></li>'; return; }
    const id = boardGame, kind = boardKind, myUid = c.user && c.user.uid;
    const stillHere = () => boardGame === id && boardKind === kind && $('#board-list');
    PA.cloud.top(id, 20, period || undefined).then(async (list) => {
      if (!stillHere()) return;
      $('#board-list').innerHTML = list.length ? boardRows(list, myUid, 20) : `<li><span></span><span class="muted">Personne n'est encore classé${kind === 'w' ? ' cette semaine' : kind === 'm' ? ' ce mois-ci' : ''} à ${esc(g.name)}. À toi de jouer !</span><span></span></li>`;
      const mine = kind === 'all' ? PA.gameStats(id).best : (PA.state().periods || {})[period] || 0;
      if (c.status === 'in' && mine > 0 && !list.some((r) => r.uid === myUid)) {
        const r = await PA.cloud.rank(id, mine, period || undefined).catch(() => null);
        if (r && $('#board-me')) $('#board-me').innerHTML = `<p class="muted" style="margin:0 0 10px">Ton score : <b style="color:var(--text)">${fmt(mine)}</b> · rang <b style="color:var(--text)">${r}</b></p>`;
      }
    }).catch((err) => { if (stillHere()) $('#board-list').innerHTML = `<li><span></span><span class="muted">${esc(PA.errText(err))}</span><span></span></li>`; });
    if (kind !== 'all') {
      const prevIdx = (kind === 'w' ? PA.weekIndex() : PA.monthIndex()) - 1, prevKey = PA.periodKey(id, kind, prevIdx);
      PA.cloud.top(id, 3, prevKey).then((list) => {
        const el = $('#last-winners'); if (!el || !stillHere() || !list.length) return;
        el.innerHTML = `<div class="panel" style="margin-top:14px"><h2 style="font-size:15px">Podium ${kind === 'w' ? 'de la semaine dernière' : 'du mois dernier'} <small>${esc(PA.periodLabel(kind, prevIdx))}</small></h2><ol class="board">${boardRows(list, myUid, 3)}</ol></div>`;
      }).catch(() => {});
    }
  }

  /* =========================================================
     Lanceur de jeux
     ========================================================= */
  const W = 480, H = 720;
  const layer = $('#game-layer'), canvas = $('#game-canvas'), ctx = canvas.getContext('2d'), overlay = $('#g-overlay'), stage = $('#stage');
  let cur = null;      // { def, inst, state, score, time, shake, endT }
  let scale = 1;
  let lastT = 0;

  function fitCanvas() {
    const r = stage.getBoundingClientRect();
    scale = Math.max(0.3, Math.min((r.width - 20) / W, (r.height - 20) / H));
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.style.width = W * scale + 'px';
    canvas.style.height = H * scale + 'px';
    canvas.width = Math.round(W * scale * dpr);
    canvas.height = Math.round(H * scale * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }
  window.addEventListener('resize', () => { if (cur) fitCanvas(); });

  function setScore(n) {
    if (!cur) return;
    cur.score = Math.max(0, Math.floor(n));
    $('#g-score').textContent = fmt(cur.score);
    const best = PA.gameStats(cur.def.id).best;
    $('#g-best').textContent = fmt(Math.max(best, cur.score));
  }

  function makeApi(def) {
    return {
      W, H,
      get score() { return cur ? cur.score : 0; },
      setScore,
      addScore: (n) => setScore((cur ? cur.score : 0) + n),
      sfx: PA.sfx, tone: PA.tone,
      shake: (m = 6) => { if (cur) cur.shake = Math.max(cur.shake, m); },
      over: (extra = {}) => { if (cur && cur.state === 'play') { cur.state = 'ending'; cur.endT = 0.75; cur.extra = extra; } },
      best: () => PA.gameStats(def.id).best,
      skin: () => PA.skinFor(def.id),
      load: (k, d) => { const v = PA.gameStats(def.id).data[k]; return v === undefined ? d : v; },
      save: (k, v) => { PA.gameStats(def.id).data[k] = v; PA.save(); },
    };
  }

  function openGame(id) {
    const def = PA.gameById[id];
    if (!def) { location.hash = '#/'; return; }
    layer.hidden = false;
    document.body.style.overflow = 'hidden';
    layer.style.setProperty('--gc', def.colors[0]);
    $('#g-title').innerHTML = `${swatch(def)}<span>${esc(def.name)}</span>`;
    renderMute();
    fitCanvas();
    newRound(def);
    showReady();
  }

  function newRound(def) {
    if (cur && cur.inst && cur.inst.destroy) cur.inst.destroy();
    cur = { def, state: 'ready', score: 0, time: 0, shake: 0, endT: 0, extra: {} };
    cur.inst = def.create(makeApi(def));
    setScore(0);
  }

  function closeGame() {
    if (cur && cur.inst && cur.inst.destroy) cur.inst.destroy();
    cur = null;
    layer.hidden = true; overlay.hidden = true;
    document.body.style.overflow = '';
  }

  function ovIcon(def) { return `<div class="ov-ico" style="background:linear-gradient(135deg,${def.colors[0]},${def.colors[1]})">${def.icon}</div>`; }

  function showReady() {
    const def = cur.def, st = PA.gameStats(def.id);
    overlay.hidden = false;
    overlay.innerHTML = `<div class="ov-card">${ovIcon(def)}<h2>${esc(def.name)}</h2><p>${esc(def.tagline)}</p>
      <div class="controls">${def.controls}</div>
      ${st.best ? `<p style="margin-top:14px">Ton record : <b style="color:var(--text)">${fmt(st.best)}</b></p>` : ''}
      <div class="mini-board" id="ov-board"></div>
      <div class="actions"><button class="btn primary" data-act="start">Jouer</button><button class="btn" data-act="quit">Retour aux jeux</button></div></div>`;
    focusFirst();
    miniBoard(def.id, 3, 'Podium de la semaine', '', PA.periodKey(def.id, 'w'));
  }

  function miniBoard(id, n, title, extra = '', period) {
    if (!PA.cloud || !PA.cloud.top || PA.cloud.status === 'error') return;
    const myUid = PA.cloud.user && PA.cloud.user.uid;
    PA.cloud.top(id, n, period).then((list) => {
      const el = $('#ov-board');
      if (!el || !cur || cur.def.id !== id) return;
      if (!list.length && !extra) return;
      el.innerHTML = `${extra}${list.length ? `<h4>${esc(title)}</h4><ol>${list.map((r, i) => `<li class="${r.uid === myUid ? 'me' : ''}"><span>${i + 1}. ${esc(r.name)}</span><b>${fmt(r.score)}</b></li>`).join('')}</ol>` : ''}`;
    }).catch(() => {});
  }

  function showPause() {
    overlay.hidden = false;
    overlay.innerHTML = `<div class="ov-card"><h2>Pause</h2><p>Score actuel : ${fmt(cur.score)}</p>
      <div class="actions"><button class="btn primary" data-act="resume">Reprendre</button><button class="btn" data-act="restart">Recommencer</button><button class="btn" data-act="quit">Quitter</button></div></div>`;
    focusFirst();
  }

  function showResults(res) {
    const def = cur.def, lv = PA.levelInfo();
    const unl = res.unlocked.map((a) => `<div class="unlock"><i>🏆</i><div><b>${esc(a.name)}</b><br><small>${esc(a.desc)}</small></div></div>`).join('');
    const lvr = (res.levelRewards || []).map((r) => `<div class="unlock"><i>⬆️</i><div><b>Niveau ${r.level} !</b><br><small>+${fmt(r.coins)} pièces${r.items.length ? ' · ' + esc(r.items.map((id) => PA.item(id).name).join(', ')) : ''}${r.boost ? ' · boost XP ×2 (3 parties)' : ''}</small></div></div>`).join('');
    const daily = res.dailyDone.map((c) => `<div class="unlock"><i>${c.bonus ? '🎁' : '✅'}</i><div><b>${c.bonus ? 'Tous les défis du jour terminés !' : 'Défi du jour terminé'}</b><br><small>${c.bonus ? '+100 pièces de bonus' : esc(PA.dailyLabel(c))}</small></div></div>`).join('');
    overlay.hidden = false;
    overlay.innerHTML = `<div class="ov-card">
      <p class="kicker" style="margin:0">${esc(def.name)}</p>
      <h2>${def.overTitle ? esc(def.overTitle(cur.extra)) : 'Partie terminée'}</h2>
      <div class="big-score">${fmt(res.score)}</div>
      ${res.newBest ? '<span class="record">NOUVEAU RECORD</span>' : `<p>Record : ${fmt(Math.max(res.prevBest, res.score))}</p>`}
      <div class="gains"><div class="gain">+${fmt(res.xp)}<small>XP${res.mult && res.mult.xp > 1 ? ' · ×2 ⚡' : ''}</small></div><div class="gain" style="color:var(--a3)">+${fmt(res.coins)}<small>pièces${res.mult && res.mult.coins > 1 ? ' · ×2' : ''}</small></div></div>
      <div class="ov-lvl"><div class="row"><span>Niveau ${lv.level}${res.levelUp ? ' — niveau supérieur !' : ''}</span><span>${fmt(lv.into)} / ${fmt(lv.need)} XP</span></div><div class="bar"><i style="width:${lv.pct * 100}%"></i></div></div>
      ${unl || daily || lvr ? `<div class="unlocks">${lvr}${unl}${daily}</div>` : ''}
      <div class="mini-board" id="ov-board">${CL().status !== 'in' && res.score > 0 ? `<p class="small-note" style="margin:0"><button class="link-btn" data-login>Connecte-toi</button> pour sauvegarder ta progression en ligne et entrer dans le classement.</p>` : ''}</div>
      <div class="actions"><button class="btn primary" data-act="restart">Rejouer</button><button class="btn" data-act="quit">Retour aux jeux</button></div></div>`;
    focusFirst();
  }

  function focusFirst() { const b = overlay.querySelector('.btn.primary'); if (b) setTimeout(() => b.focus({ preventScroll: true }), 30); }

  function start() {
    if (!cur) return;
    overlay.hidden = true;
    if (cur.state === 'ready') { cur.state = 'play'; if (cur.inst.start) cur.inst.start(); PA.sfx('tap'); }
  }
  function pause() { if (cur && cur.state === 'play') { cur.state = 'pause'; showPause(); } }
  function resume() { if (cur && cur.state === 'pause') { cur.state = 'play'; overlay.hidden = true; } }
  function restart() { const def = cur.def; newRound(def); overlay.hidden = true; cur.state = 'play'; if (cur.inst.start) cur.inst.start(); }

  function finish() {
    const def = cur.def;
    cur.state = 'over';
    PA.sfx('over');
    const res = PA.recordResult(def.id, Object.assign({}, cur.extra, { score: cur.score }), cur.time);
    showResults(res);
    setScore(cur.score);
    if (PA.cloud && PA.cloud.status === 'in' && res.score > 0) {
      const id = def.id, wk = PA.periodKey(id, 'w');
      Promise.all([res.newBest ? PA.cloud.submit(id, res.score) : null, PA.cloud.submitPeriods(id, res.score)])
        .then(() => PA.cloud.rank(id, (PA.state().periods || {})[wk] || res.score, wk))
        .then((r) => miniBoard(id, 5, 'Classement de la semaine', r ? `<p class="muted" style="margin:0 0 8px;font-size:13px">Rang cette semaine : <b style="color:var(--text)">${r}</b>${r <= 3 ? ' — sur le podium 🎁' : ''} · fin dans ${PA.timeLeft('w')}</p>` : '', wk))
        .catch(() => {});
    }
    if (res.levelUp) { setTimeout(() => PA.sfx('level'), 350); toast('⬆️', `Niveau ${res.levelUp} atteint !`, PA.title(res.levelUp)); }
    res.unlocked.forEach((a, i) => setTimeout(() => toast('🏆', 'Succès débloqué', a.name), 300 + i * 500));
  }

  overlay.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'start') start();
    else if (act === 'resume') resume();
    else if (act === 'restart') restart();
    else if (act === 'quit') location.hash = '#/';
  });
  $('#g-back').onclick = () => { location.hash = '#/'; };
  $('#g-pause').onclick = () => (cur && cur.state === 'pause' ? resume() : pause());
  $('#g-mute').onclick = () => { PA.toggleMute(); renderMute(); };
  function renderMute() {
    const m = PA.state().muted;
    $('#g-mute').innerHTML = m
      ? '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
    $('#g-mute').setAttribute('aria-label', m ? 'Activer le son' : 'Couper le son');
  }

  /* ---------- Boucle ---------- */
  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0);
    lastT = t;
    if (!cur || layer.hidden) return;
    const inst = cur.inst;
    if (cur.state === 'play' || cur.state === 'ending') {
      cur.time += dt;
      try { inst.update(dt); } catch (err) { console.error(err); }
      if (cur.state === 'ending') { cur.endT -= dt; if (cur.endT <= 0) finish(); }
    } else if (inst.idle) inst.idle(dt);
    ctx.save();
    if (cur.shake > 0) {
      ctx.translate((Math.random() - 0.5) * cur.shake, (Math.random() - 0.5) * cur.shake);
      cur.shake = Math.max(0, cur.shake - dt * 40);
    }
    try { inst.draw(ctx); } catch (err) { console.error(err); }
    ctx.restore();
  }
  requestAnimationFrame(frame);

  /* ---------- Entrées ---------- */
  const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar']);
  window.addEventListener('keydown', (e) => {
    if (!cur || layer.hidden) return;
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (cur.state === 'play') pause(); else if (cur.state === 'pause') resume();
      return;
    }
    if (cur.state !== 'play') {
      if ((e.key === 'Enter' || e.key === ' ') && cur.state === 'ready' && document.activeElement && !document.activeElement.closest('[data-act="quit"]')) { e.preventDefault(); start(); }
      return;
    }
    if (GAME_KEYS.has(e.key)) e.preventDefault();
    if (!e.repeat || cur.def.repeatKeys) cur.inst.keydown && cur.inst.keydown(e.key);
  });
  window.addEventListener('keyup', (e) => { if (cur && cur.state === 'play' && cur.inst.keyup) cur.inst.keyup(e.key); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);

  let down = null;
  const toLocal = (e) => { const r = canvas.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
  canvas.addEventListener('pointerdown', (e) => {
    if (!cur || cur.state !== 'play') return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    const [x, y] = toLocal(e);
    down = { x, y, t: performance.now() };
    cur.inst.pointerdown && cur.inst.pointerdown(x, y);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur || cur.state !== 'play') return;
    const [x, y] = toLocal(e);
    cur.inst.pointermove && cur.inst.pointermove(x, y, !!down);
  });
  const up = (e) => {
    if (!cur || cur.state !== 'play') { down = null; return; }
    const [x, y] = toLocal(e);
    cur.inst.pointerup && cur.inst.pointerup(x, y);
    if (down && cur.inst.swipe) {
      const dx = x - down.x, dy = y - down.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 28 && performance.now() - down.t < 600) {
        cur.inst.swipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      }
    }
    down = null;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', () => { down = null; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  /* =========================================================
     Navigation
     ========================================================= */
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === (page || 'home')));
    if (page === 'jeu' && arg) { openGame(arg); return; }
    if (!layer.hidden) closeGame();
    if (page === 'profil') profile();
    else if (page === 'boutique') shop(arg);
    else if (page === 'classements') { if (arg && PA.gameById[arg]) boardGame = arg; leaderboards(); }
    else home();
    document.title = ({ profil: 'Profil', boutique: 'Boutique', classements: 'Classements' }[page] ? { profil: 'Profil', boutique: 'Boutique', classements: 'Classements' }[page] + ' — ' : '') + 'Prism Arcade';
    window.scrollTo(0, 0);
  }

  PA.on('change', () => { renderChip(); applyTheme(); });
  /* Changement d'état du compte : rafraîchit la puce, et la page affichée si elle dépend du compte (jamais pendant une partie). */
  let lastStatus = CL().status;
  PA.on('cloud', (c) => {
    renderChip();
    if (c.status === lastStatus) { if (/^#\/profil/.test(location.hash)) { const ap = view.querySelector('.account-panel'); if (ap) ap.outerHTML = accountPanel(); } return; }
    lastStatus = c.status;
    if (layer.hidden && modal.hidden) route();
  });
  applyTheme(); renderChip();
  window.addEventListener('hashchange', route);
  route();
})();
