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
    const t = PA.themes.find((x) => x.id === PA.state().theme) || PA.themes[0];
    const r = document.documentElement.style;
    r.setProperty('--a1', t.colors[0]); r.setProperty('--a2', t.colors[1]); r.setProperty('--a3', t.colors[2]);
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
      `<span class="avatar">${esc(s.name.charAt(0).toUpperCase())}</span>
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
      <div class="section-head"><div><h2>Mini-jeux</h2><p>Parties rapides, scores à battre. ${played}/${PA.games.length} découverts.</p></div></div>
      <div class="games-grid">${PA.games.map(gameCard).join('')}</div>
      <div class="soon"><div class="soon-ico">🎮</div><div><h3>Les grands jeux arrivent</h3>
        <p>Prism Arcade accueillera aussi les jeux plus ambitieux du studio, en solo d'abord, puis en multijoueur. Ta progression actuelle sera conservée.</p></div></div>`;
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
        <span class="avatar lg">${esc(s.name.charAt(0).toUpperCase())}</span>
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

  function shop() {
    const s = PA.state();
    const cards = PA.themes.map((t) => {
      const owned = s.themes.includes(t.id), active = s.theme === t.id;
      const btn = active ? '<span class="muted">Actif</span>'
        : owned ? `<button class="btn sm" data-use="${t.id}">Utiliser</button>`
          : `<button class="btn sm primary" data-buy="${t.id}" ${s.coins < t.price ? 'disabled' : ''}><span class="coin-ico"></span>${fmt(t.price)}</button>`;
      return `<div class="theme-card ${active ? 'active' : ''}"><div class="theme-prev" style="background:linear-gradient(120deg,${t.colors.join(',')})"></div>
        <div class="body"><div><h3>${esc(t.name)}</h3><small class="muted">${owned ? 'Possédé' : 'Thème du site'}</small></div>${btn}</div></div>`;
    }).join('');
    view.innerHTML = `
      <div class="section-head"><div><h2>Boutique</h2><p>Dépense tes pièces pour personnaliser Prism Arcade. Tu as <b class="coins"><span class="coin-ico"></span>${fmt(s.coins)}</b></p></div></div>
      <div class="shop-grid">${cards}</div>
      <div class="soon"><div class="soon-ico">✨</div><div><h3>D'autres objets arrivent</h3><p>Apparences pour les jeux, cadres de profil et titres spéciaux viendront enrichir la boutique.</p></div></div>`;
    view.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => {
      if (PA.buyTheme(b.dataset.buy)) { PA.sfx('coin'); toast('🎨', 'Thème débloqué', PA.themes.find((t) => t.id === b.dataset.buy).name); }
      shop();
    }));
    view.querySelectorAll('[data-use]').forEach((b) => (b.onclick = () => { PA.setTheme(b.dataset.use); shop(); }));
  }

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
     Classements
     ========================================================= */
  function boardRows(list, myUid, limit) {
    return list.slice(0, limit).map((r, i) => `<li class="${r.uid === myUid ? 'me' : ''}"><span class="rk">${i + 1}</span><span class="nm">${esc(r.name)}${r.uid === myUid ? ' (toi)' : ''}</span><span class="sc">${fmt(r.score)}</span></li>`).join('');
  }
  let boardGame = null;
  function leaderboards() {
    if (!boardGame || !PA.gameById[boardGame]) boardGame = PA.games[0].id;
    const c = CL(), g = PA.gameById[boardGame];
    view.innerHTML = `<div class="section-head"><div><h2>Classements</h2><p>Les 20 meilleurs joueurs de chaque jeu.${c.status === 'in' ? '' : ' Connecte-toi pour y apparaître.'}</p></div>
        ${c.status === 'in' ? '' : '<button class="btn sm primary" data-login>Se connecter</button>'}</div>
      <div class="board-tabs" role="tablist">${PA.games.map((x) => `<button class="board-tab ${x.id === boardGame ? 'on' : ''}" data-board="${x.id}" role="tab" aria-selected="${x.id === boardGame}">${swatch(x)}${esc(x.name)}</button>`).join('')}</div>
      <div class="panel"><div id="board-me"></div><ol class="board" id="board-list"><li><span></span><span class="muted">Chargement…</span><span></span></li></ol></div>`;
    view.querySelectorAll('[data-board]').forEach((b) => (b.onclick = () => { boardGame = b.dataset.board; leaderboards(); }));
    const t = view.querySelector('.board-tab.on'); if (t) t.scrollIntoView({ inline: 'center', block: 'nearest' });
    if (!PA.cloud || !PA.cloud.top) { $('#board-list').innerHTML = '<li><span></span><span class="muted">Classements indisponibles.</span><span></span></li>'; return; }
    const id = boardGame, myUid = c.user && c.user.uid;
    PA.cloud.top(id, 20).then(async (list) => {
      if (boardGame !== id || !$('#board-list')) return;
      $('#board-list').innerHTML = list.length ? boardRows(list, myUid, 20) : `<li><span></span><span class="muted">Personne n'est encore classé à ${esc(g.name)}. À toi de jouer !</span><span></span></li>`;
      const best = PA.gameStats(id).best;
      if (c.status === 'in' && best > 0 && !list.some((r) => r.uid === myUid)) {
        const r = await PA.cloud.rank(id, best).catch(() => null);
        if (r && $('#board-me')) $('#board-me').innerHTML = `<p class="muted" style="margin:0 0 10px">Ton record : <b style="color:var(--text)">${fmt(best)}</b> · rang <b style="color:var(--text)">${r}</b></p>`;
      }
    }).catch((err) => { if ($('#board-list')) $('#board-list').innerHTML = `<li><span></span><span class="muted">${esc(PA.errText(err))}</span><span></span></li>`; });
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
    miniBoard(def.id, 3, 'Meilleurs joueurs');
  }

  function miniBoard(id, n, title, extra = '') {
    if (!PA.cloud || !PA.cloud.top || PA.cloud.status === 'error') return;
    const myUid = PA.cloud.user && PA.cloud.user.uid;
    PA.cloud.top(id, n).then((list) => {
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
    const daily = res.dailyDone.map((c) => `<div class="unlock"><i>${c.bonus ? '🎁' : '✅'}</i><div><b>${c.bonus ? 'Tous les défis du jour terminés !' : 'Défi du jour terminé'}</b><br><small>${c.bonus ? '+100 pièces de bonus' : esc(PA.dailyLabel(c))}</small></div></div>`).join('');
    overlay.hidden = false;
    overlay.innerHTML = `<div class="ov-card">
      <p class="kicker" style="margin:0">${esc(def.name)}</p>
      <h2>${def.overTitle ? esc(def.overTitle(cur.extra)) : 'Partie terminée'}</h2>
      <div class="big-score">${fmt(res.score)}</div>
      ${res.newBest ? '<span class="record">NOUVEAU RECORD</span>' : `<p>Record : ${fmt(Math.max(res.prevBest, res.score))}</p>`}
      <div class="gains"><div class="gain">+${fmt(res.xp)}<small>XP</small></div><div class="gain" style="color:var(--a3)">+${fmt(res.coins)}<small>pièces</small></div></div>
      <div class="ov-lvl"><div class="row"><span>Niveau ${lv.level}${res.levelUp ? ' — niveau supérieur !' : ''}</span><span>${fmt(lv.into)} / ${fmt(lv.need)} XP</span></div><div class="bar"><i style="width:${lv.pct * 100}%"></i></div></div>
      ${unl || daily ? `<div class="unlocks">${unl}${daily}</div>` : ''}
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
    if (PA.cloud && PA.cloud.status === 'in') {
      const id = def.id, best = PA.gameStats(id).best;
      (res.newBest ? PA.cloud.submit(id, res.score) : Promise.resolve())
        .then(() => PA.cloud.rank(id, best))
        .then((r) => miniBoard(id, 5, 'Classement', r ? `<p class="muted" style="margin:0 0 8px;font-size:13px">Ton rang : <b style="color:var(--text)">${r}</b>${res.newBest ? ' — record envoyé au classement' : ''}</p>` : ''))
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
    else if (page === 'boutique') shop();
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
