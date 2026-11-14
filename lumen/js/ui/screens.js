/* =========================================================
   LUMEN — écrans : titre, menu de jeu (inventaire, personnage,
   journal, carte, options), dialogues, boutiques, forge,
   garde-robe, voyage, lecture, défaite, fin d'acte.
   ========================================================= */
import { $, esc, fmt } from '../engine/util.js';
import { icon } from './icons.js';
import { ITEMS, CATS, RARITY, UPGRADES, RECIPES } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { SHOPS } from '../data/shops.js';
import { QUESTS } from '../data/quests.js';
import { ENEMIES } from '../data/enemies.js';
import { HAIR_STYLES, HAIR_COLORS, SKIN, EYES, OUTFITS, CLOAK_COLORS, TRIMS, ACCESSORIES, HEIGHTS, UNLOCK_NAMES } from '../data/looks.js';
import { SLOTS } from '../game/save.js';

const ABILITIES = [
  { id: 'esquive', name: 'Esquive', desc: 'Une roulade rapide : on ne peut pas être touchée pendant un court instant.', always: true, key: 'Espace' },
  { id: 'onde', name: 'Onde de lumière', desc: 'Fia libère une onde qui frappe tout autour (35 énergie). Traverse les boucliers.', key: 'Clic droit / L' },
  { id: 'charge', name: 'Coup chargé', desc: 'Maintiens l’attaque puis relâche : une attaque tournoyante. Débloqué au niveau 3.', key: 'Maintenir' },
  { id: 'porter', name: 'Porter', desc: 'Prendre un miroir, un prisme ou une lame posé sur un socle, puis le reposer sur un autre socle libre de la même salle.', key: 'R / appui long' },   /* ACTE III */
  { id: 'orbe', name: 'Orbe de Fia', desc: 'Fia devient lanterne de poche : elle allume les vasques de pierre et éclaire plus loin dans les temples.', key: 'Interagir' },
  { id: 'vision', name: 'Vision d’éclat', desc: 'Les secrets (roches fissurées, coffres cachés) apparaissent sur la carte.', key: 'Carte' },
];
const fmtTime = (s) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`; };
const rarityCls = (r) => 'r-' + (r || 'commun');

export function createScreens(G) {
  const scr = $('#screen'), dlg = $('#dialog');
  let cur = null;          // écran ouvert
  let menuTab = 'inventaire', invCat = 'arme', invSel = null, jSel = null, jTab = 'main';

  function open(html, cls = '') { if (scr.hidden && !/title/.test(cls) && cur !== 'title') G.audio.sfx('uiOpen'); scr.className = 'overlay ' + cls; scr.innerHTML = html; scr.hidden = false; }
  function close() { if (!scr.hidden && cur === 'menu') G.audio.sfx('uiClose'); scr.hidden = true; scr.innerHTML = ''; cur = null; G.onScreenClosed(); }

  /* ================= Compte Studio Prism (connexion dans le jeu) ================= */
  const PAc = () => (window.PA && window.PA.cloud) || null;
  function accountHtml() {
    const C = PAc(), st = C ? C.status : 'out';
    if (!C) return '';
    if (st === 'in') return `<div class="acct in"><span>${icon('user')}<span>Connectée : <b>${esc(C.user.email || '')}</b></span></span><button class="btn small" type="button" data-acc="out">Se déconnecter</button></div>`;
    if (st === 'loading') return '<div class="acct"><span class="muted small">Connexion au compte…</span></div>';
    return `<form class="acct-form" data-acc-form autocomplete="on">
      <p class="small"><b>Compte Studio Prism</b> · retrouve tes sauvegardes et tes récompenses sur tous tes appareils.</p>
      <div class="acct-fields"><input type="email" name="email" placeholder="Adresse e-mail" autocomplete="email" inputmode="email" required><input type="password" name="pass" placeholder="Mot de passe" autocomplete="current-password" required></div>
      <div class="row-actions"><button class="btn primary small" type="submit">Se connecter</button><button class="btn small" type="button" data-acc="reset">Mot de passe oublié</button></div>
      <p class="small muted">Pas encore de compte ? <a href="https://studio-prism.com/#/compte/inscription" target="_blank" rel="noopener">Crée-le sur studio-prism.com</a>.</p>
      <p class="small acc-msg" hidden></p></form>`;
  }
  function bindAccount(host, done) {
    const form = host.querySelector('[data-acc-form]');
    const say = (t, ok) => { const m = host.querySelector('.acc-msg'); if (m) { m.hidden = false; m.textContent = t; m.classList.toggle('gold', !ok); } };
    if (form) form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const email = form.email.value.trim(), pass = form.pass.value;
      const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Connexion…';
      try { await PAc().signIn(email, pass, true); G.audio.sfx('ui'); done && done(true); }
      catch (e) { say(window.PA.errText ? window.PA.errText(e) : 'Connexion impossible.'); btn.disabled = false; btn.textContent = 'Se connecter'; }
    });
    host.querySelectorAll('[data-acc]').forEach((b) => b.addEventListener('click', async () => {
      if (b.dataset.acc === 'out') { b.disabled = true; try { await PAc().signOut(); } catch (e) { /* rien */ } done && done(false); }
      if (b.dataset.acc === 'reset') {
        const email = form && form.email.value.trim();
        if (!email) { say('Saisis d’abord ton adresse e-mail, puis touche « Mot de passe oublié ».'); return; }
        try { await PAc().resetPassword(email); say('Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.', true); }
        catch (e) { say(window.PA.errText ? window.PA.errText(e) : 'Envoi impossible.'); }
      }
    }));
  }
  function importScreen(back) {
    cur = cur || 'title';
    const host = document.createElement('div');
    open(`<div class="panel menu-card"><div class="j-head"><h2>Importer une partie</h2><button class="icon-btn" data-a="back">${icon('close')}</button></div>
      <p class="muted small">Colle ici le code de transfert copié depuis un autre appareil (Options → Partie → « Copier le code de ma partie »).</p>
      <textarea id="imp-code" rows="5" placeholder="LUMEN1:…" spellcheck="false"></textarea>
      <div class="row-actions"><button class="btn primary" data-a="go">Importer et jouer</button></div><p class="small gold" id="imp-msg" hidden></p></div>`, 'menu');
    scr.onclick = async (ev) => {
      const b = ev.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'back') { back(); return; }
      const st = G.saves.importCode($('#imp-code').value);
      if (!st) { const m = $('#imp-msg'); m.hidden = false; m.textContent = 'Ce code n’est pas valide. Vérifie qu’il est complet (il commence par LUMEN1:).'; return; }
      G.startFrom(st, 'auto');
    };
  }

  /* ================= Écran titre ================= */
  async function title() {
    cur = 'title';
    open(`<div class="title-wrap"><div class="title"><h1>LUMEN</h1><p>Les Îles Brisées</p></div><div class="panel title-card" id="t-card"><p class="muted">Recherche de tes sauvegardes…</p></div>${window.Capacitor ? '' : '<a class="back-link" href="../#/">← Prism Arcade</a>'}</div>`, 'menu');
    const list = await G.saves.list();
    const latest = Object.entries(list).sort((a, b) => (b[1].updated || 0) - (a[1].updated || 0))[0];
    const legacy = !latest && G.legacyRun();
    const acc = G.account();
    $('#t-card').innerHTML = `
      ${latest ? `<p class="kicker">Dernière partie</p><h2>${esc(latest[1].region || 'Île de l’Aube')}</h2><p class="muted small">Niveau ${latest[1].level} · ${fmtTime(latest[1].playTime || 0)} de jeu${latest[1].completion ? ` · ${latest[1].completion} %` : ''}${latest[1].where === 'cloud' ? ' · sauvegarde en ligne' : ''}</p>` : legacy ? '<p class="kicker">Partie de la version précédente</p><p class="muted small">Tes énigmes résolues et tes objets sont conservés dans la nouvelle aventure.</p>' : '<p class="kicker">Nouvelle aventure</p><p class="muted">La Brume a éteint l’archipel. Sur l’Île de l’Aube, une barque dépose une voyageuse endormie… et une petite lumière qui parle.</p>'}
      <div class="actions">
        ${latest ? `<button class="btn primary" data-a="continue" data-slot="${latest[0]}">Continuer</button>` : legacy ? '<button class="btn primary" data-a="legacy">Continuer l’aventure</button>' : ''}
        <button class="btn ${latest || legacy ? '' : 'primary'}" data-a="new">Nouvelle partie</button>
        ${Object.keys(list).length ? '<button class="btn" data-a="slots">Charger une partie</button>' : ''}
        <button class="btn" data-a="import">Importer une partie</button>
      </div>
      <p class="small muted acc">${acc === 'in' ? icon('save') + ' Sauvegardes enregistrées sur ton compte Studio Prism et sur cet appareil.' : 'Sans compte, les sauvegardes restent sur cet appareil.'}</p>
      <div id="t-acc">${accountHtml()}</div>`;
    bindAccount($('#t-acc'), () => title());
    scr.onclick = async (ev) => {
      const b = ev.target.closest('[data-a]'); if (!b) return;
      G.audio.sfx('ui');
      if (b.dataset.a === 'continue') { const sv = await G.saves.read(b.dataset.slot); if (!sv) { $('#t-card').insertAdjacentHTML('beforeend', '<p class="small gold">⚠ Cette sauvegarde est illisible. Essaie un autre emplacement (« Charger une partie ») ou commence une nouvelle partie.</p>'); return; } G.startFrom(sv, b.dataset.slot); }
      else if (b.dataset.a === 'legacy') G.startFrom(null, 'auto', true);
      else if (b.dataset.a === 'new') { if (latest && !confirm('Commencer une nouvelle partie ? Ta sauvegarde automatique sera remplacée (les emplacements 1 à 3 sont conservés).')) return; G.startFrom(null, 'auto'); }
      else if (b.dataset.a === 'slots') slotsScreen('load', list);
      else if (b.dataset.a === 'import') importScreen(() => title());
    };
  }
  async function slotsScreen(mode, list) {
    list = list || await G.saves.list();
    const row = (s) => { const m = list[s]; return `<button class="slot ${m ? '' : 'empty'}" data-slot="${s}"><b>${s === 'auto' ? 'Sauvegarde automatique' : 'Emplacement ' + s.slice(1)}</b><small>${m ? `${esc(m.region || '')} · niveau ${m.level} · ${fmtTime(m.playTime || 0)}${m.updated ? ' · ' + new Date(m.updated).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : ''}${m.where === 'cloud' ? ' · en ligne' : ''}` : 'Vide'}</small></button>`; };
    const slots = mode === 'save' ? SLOTS.filter((s) => s !== 'auto') : SLOTS.filter((s) => list[s]);
    const html = `<div class="panel menu-card"><div class="j-head"><h2>${mode === 'save' ? 'Sauvegarder' : 'Charger une partie'}</h2><button class="icon-btn" data-a="back">${icon('close')}</button></div><div class="slots">${slots.map(row).join('')}</div></div>`;
    if (mode === 'load' && cur === 'title') { open(html, 'menu'); }
    else { $('#m-body').innerHTML = html.replace('panel menu-card', 'sub'); }
    const host = mode === 'load' && cur === 'title' ? scr : $('#m-body');
    host.onclick = async (ev) => {
      const b = ev.target.closest('[data-a="back"]'); if (b) { if (cur === 'title') title(); else menu('options'); return; }
      const s = ev.target.closest('[data-slot]'); if (!s) return;
      G.audio.sfx('ui');
      if (mode === 'save') { if (list[s.dataset.slot] && !confirm('Remplacer cette sauvegarde ?')) return; const r = await G.saveTo(s.dataset.slot); G.hud.toast('💾', 'Partie sauvegardée', r.cloud ? 'Sur cet appareil et sur ton compte.' : 'Sur cet appareil.'); slotsScreen('save'); }
      else { const st = await G.saves.read(s.dataset.slot); if (st) { if (cur !== 'title' && !confirm('Charger cette partie ? La progression non sauvegardée sera perdue.')) return; G.startFrom(st, s.dataset.slot); } }
    };
  }

  /* ================= Menu de jeu ================= */
  const TABS = { inventaire: ['bag', 'Inventaire'], personnage: ['user', 'Personnage'], journal: ['book', 'Journal'], carte: ['map', 'Carte'], options: ['gear', 'Options'] };
  function menu(tab = menuTab) {
    menuTab = tab; cur = 'menu';
    open(`<div class="panel game-menu"><nav class="m-tabs">${Object.entries(TABS).map(([k, [ic, l]]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${icon(ic)}<span>${l}</span></button>`).join('')}<button class="m-close" data-a="close" aria-label="Fermer">${icon('close')}</button></nav><div id="m-body" class="m-body"></div></div>`, 'menu-bg');
    ({ inventaire: inventory, personnage: character, journal, carte: mapTab, options })[tab]();
    scr.onclick = (ev) => {
      const t = ev.target.closest('[data-tab]'); if (t) { G.audio.sfx('uiTab'); menu(t.dataset.tab); return; }
      if (ev.target.closest('[data-a="close"]')) { close(); }
    };
  }
  /* ---------- Inventaire ---------- */
  function inventory() {
    const st = G.st, body = $('#m-body');
    const ids = Object.keys(st.inv).filter((id) => ITEMS[id] && ITEMS[id].cat === invCat);
    if (!invSel || !ids.includes(invSel)) invSel = ids[0] || null;
    const eq = (id) => Object.values(st.equip).includes(id) && st.equip.quick !== id;
    const it = invSel ? ITEMS[invSel] : null;
    const lvl = invSel ? st.gear[invSel] || 0 : 0;
    const stat = (it) => {
      if (!it) return '';
      const rows = [];
      if (it.atk) rows.push(['Attaque', Math.round(it.atk * (1 + (lvl ? UPGRADES.arme[lvl - 1].bonus : 0)))], ['Cadence', it.rate >= 1.2 ? 'rapide' : it.rate >= 0.9 ? 'moyenne' : 'lente'], ['Dégâts', { tranchant: 'tranchants', contondant: 'contondants', percant: 'perçants', lumiere: 'de lumière' }[it.dmg]]);
      if (it.energy) rows.push(['Énergie par tir', it.energy]);
      if (it.def) rows.push(['Défense', it.def + (lvl ? UPGRADES.armure[lvl - 1].bonus : 0)]);
      if (it.speed) rows.push(['Vitesse', '+' + Math.round(it.speed * 100) + ' %']);
      if (it.hp) rows.push(['Vie max', '+' + it.hp]); if (it.en) rows.push(['Énergie max', '+' + it.en]);
      if (it.heal) rows.push(['Soin', it.heal]); if (it.energy && it.cat === 'conso') rows.push(['Énergie', it.energy]);
      if (lvl) rows.push(['Amélioration', '+' + lvl]);
      return rows.length ? `<dl class="stat-list">${rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>` : '';
    };
    const actions = (id) => {
      const i = ITEMS[id]; if (!i) return '';
      const b = [];
      if (i.cat === 'arme') b.push(st.equip.weapon === id ? '<button class="btn" disabled>Équipée</button>' : `<button class="btn primary" data-eq="${id}">Équiper</button>`);
      if (i.cat === 'armure') b.push(st.equip.armor === id ? '<button class="btn" disabled>Portée</button>' : `<button class="btn primary" data-eq="${id}">Porter</button>`);
      if (i.cat === 'accessoire') b.push(st.equip.acc1 === id || st.equip.acc2 === id ? `<button class="btn" data-uneq="${id}">Retirer</button>` : `<button class="btn primary" data-eq="${id}">Équiper</button>`);
      if (i.cat === 'conso') { b.push(`<button class="btn primary" data-use="${id}">Utiliser</button>`); b.push(st.equip.quick === id ? '<button class="btn" disabled>Objet rapide</button>' : `<button class="btn" data-quick="${id}">Objet rapide (F)</button>`); }
      return b.join('');
    };
    body.innerHTML = `<div class="inv">
      <div class="inv-left">
        <div class="cats">${Object.entries(CATS).map(([k, l]) => { const n = Object.keys(st.inv).filter((id) => ITEMS[id] && ITEMS[id].cat === k).length; return `<button class="${k === invCat ? 'on' : ''}" data-cat="${k}">${l}<em>${n}</em></button>`; }).join('')}</div>
        <div class="grid">${ids.length ? ids.map((id) => { const i = ITEMS[id]; return `<button class="cell ${rarityCls(i.rarity)} ${id === invSel ? 'sel' : ''}" data-sel="${id}" title="${esc(i.name)}">${icon(i.icon)}${st.inv[id] > 1 ? `<b>${st.inv[id]}</b>` : ''}${eq(id) ? '<i class="eqd">É</i>' : ''}${st.gear[id] ? `<i class="lv">+${st.gear[id]}</i>` : ''}</button>`; }).join('') : '<p class="muted small empty-msg">Rien ici pour l’instant.</p>'}</div>
        <p class="purse">${icon('coin')} <b>${fmt(st.player.ecus)}</b> écus</p>
      </div>
      <div class="inv-detail">${it ? `<div class="big-ico ${rarityCls(it.rarity)}">${icon(it.icon)}</div><p class="kicker">${RARITY[it.rarity] || ''} · ${CATS[it.cat]}</p><h3>${esc(it.name)}${lvl ? ` +${lvl}` : ''}</h3><p class="muted">${esc(it.desc)}</p>${stat(it)}<div class="row-actions">${actions(invSel)}</div>` : '<p class="muted">Choisis un objet pour voir ses détails.</p>'}</div>
    </div>`;
    body.onclick = (ev) => {
      const c = ev.target.closest('[data-cat]'); if (c) { invCat = c.dataset.cat; invSel = null; G.audio.sfx('ui'); inventory(); return; }
      const s = ev.target.closest('[data-sel]'); if (s) { invSel = s.dataset.sel; G.audio.sfx('ui'); inventory(); return; }
      const e = ev.target.closest('[data-eq]'); if (e) { G.equip(e.dataset.eq); inventory(); return; }
      const u = ev.target.closest('[data-uneq]'); if (u) { G.unequip(u.dataset.uneq); inventory(); return; }
      const us = ev.target.closest('[data-use]'); if (us) { G.useItem(us.dataset.use); inventory(); return; }
      const q = ev.target.closest('[data-quick]'); if (q) { G.st.equip.quick = q.dataset.quick; G.audio.sfx('ui'); G.hud.refresh(); inventory(); }
    };
  }
  /* ---------- Personnage ---------- */
  function character() {
    const st = G.st, s = G.stats(), p = st.player, body = $('#m-body');
    const slot = (k, label) => { const id = st.equip[k], it = ITEMS[id]; return `<button class="eq-slot ${it ? rarityCls(it.rarity) : 'empty'}" data-goto="${k === 'weapon' ? 'arme' : k === 'armor' ? 'armure' : 'accessoire'}">${it ? icon(it.icon) : icon('star')}<span><small>${label}</small><b>${it ? esc(it.name) + (st.gear[id] ? ' +' + st.gear[id] : '') : 'Aucun'}</b></span></button>`; };
    const ab = (a) => { const on = a.always || p.abilities[a.id]; return `<li class="${on ? '' : 'locked'}"><b>${esc(a.name)}</b><small>${on ? esc(a.desc) : 'À découvrir…'}</small>${on ? `<kbd>${esc(a.key)}</kbd>` : ''}</li>`; };
    body.innerHTML = `<div class="char">
      <div class="char-stats">
        <div class="lvl-row"><div class="lvl-badge">${p.lvl}</div><div><b>${esc(st.name)}</b><small>Niveau ${p.lvl} · ${fmt(p.xp)} / ${fmt(G.xpFor(p.lvl))} XP</small><div class="xpbar"><i style="width:${Math.min(100, 100 * p.xp / G.xpFor(p.lvl))}%"></i></div></div></div>
        <dl class="stat-list big">
          <div><dt>Vie</dt><dd>${Math.ceil(p.hp)} / ${s.maxHp}</dd></div><div><dt>Énergie</dt><dd>${Math.floor(p.en)} / ${s.maxEn}</dd></div>
          <div><dt>Attaque</dt><dd>${s.atk}</dd></div><div><dt>Défense</dt><dd>${s.def}</dd></div>
          <div><dt>Vitesse</dt><dd>${Math.round(s.speed * 100)} %</dd></div><div><dt>Fragments de cœur</dt><dd>${p.fragments}</dd></div>
        </dl>
        <button class="btn primary wide" data-a="wardrobe">Changer d’apparence</button>
        <p class="small muted">Temps de jeu : ${fmtTime(st.playTime)} · Créatures vaincues : ${st.stats.kills} · Coffres ouverts : ${st.stats.chests}</p>
      </div>
      <div class="char-right">
        <h4>Équipement</h4>
        <div class="eq-slots">${slot('weapon', 'Arme')}${slot('armor', 'Tenue / armure')}${slot('acc1', 'Accessoire')}${slot('acc2', 'Accessoire')}</div>
        <h4>Capacités</h4>
        <ul class="abilities">${ABILITIES.map(ab).join('')}</ul>
      </div></div>`;
    body.onclick = (ev) => {
      const g = ev.target.closest('[data-goto]'); if (g) { invCat = g.dataset.goto; menu('inventaire'); return; }
      if (ev.target.closest('[data-a="wardrobe"]')) { close(); wardrobe(); }
    };
  }
  /* ---------- Journal ---------- */
  function journal() {
    const body = $('#m-body'), Q = G.quests;
    const lists = { main: Q.active('main'), side: Q.active('side'), done: Q.done() };
    if (jTab === 'collection') return collection();
    const ids = lists[jTab] || [];
    if (!jSel || !ids.includes(jSel)) jSel = ids[0] || null;
    const q = jSel ? QUESTS[jSel] : null, rec = jSel ? G.st.quests[jSel] : null;
    const rw = (r) => [r.xp ? `${r.xp} XP` : '', r.ecus ? `${r.ecus} écus` : '', ...Object.entries(r.items || {}).map(([id, n]) => `${ITEMS[id].name}${n > 1 ? ' ×' + n : ''}`), ...(r.unlock || []).map((u) => UNLOCK_NAMES[u] || u)].filter(Boolean).join(' · ');
    body.innerHTML = `<div class="seg">${[['main', 'Principales'], ['side', 'Secondaires'], ['done', 'Terminées'], ['collection', 'Collection']].map(([k, l]) => `<button class="${k === jTab ? 'on' : ''}" data-jt="${k}">${l}${k !== 'collection' ? ` <em>${lists[k].length}</em>` : ''}</button>`).join('')}</div>
      <div class="journal">
        <ul class="qlist">${ids.length ? ids.map((id) => `<li class="${id === jSel ? 'sel' : ''} ${QUESTS[id].kind}" data-q="${id}"><b>${esc(QUESTS[id].title)}</b><small>${G.st.quests[id].state === 'done' ? 'Terminée' : esc((Q.step(id) || {}).text || '')}</small>${G.quests.tracked() === id ? '<i class="trk">suivie</i>' : ''}</li>`).join('') : `<li class="muted small">${jTab === 'side' ? 'Parle aux habitants : certains ont besoin d’aide (point d’exclamation au-dessus de leur tête).' : 'Aucune quête ici.'}</li>`}</ul>
        <div class="q-detail">${q ? `<p class="kicker">${q.kind === 'main' ? 'Quête principale · Acte ' + (q.act || 1) : 'Quête secondaire'} · ${esc((NPCS[q.giver] || {}).name || '')}</p><h3>${esc(q.title)}</h3><p class="muted">${esc(q.summary)}</p>
          <ol class="steps">${q.steps.map((s, i) => { const done = rec.state === 'done' || i < rec.step, now = rec.state === 'active' && i === rec.step; if (!done && !now) return ''; const pr = now ? Q.progress(jSel) : null; return `<li class="${done ? 'done' : 'now'}">${esc(s.text)}${pr ? ` <em>${pr.n} / ${pr.of}</em>` : ''}</li>`; }).join('')}</ol>
          <p class="small"><b>Récompenses :</b> ${esc(rw(q.rewards))}</p>
          ${rec.state === 'active' ? `<button class="btn" data-track="${jSel}">${G.quests.tracked() === jSel ? 'Quête suivie' : 'Suivre cette quête'}</button>` : ''}` : ''}</div>
      </div>`;
    body.onclick = (ev) => {
      const t = ev.target.closest('[data-jt]'); if (t) { jTab = t.dataset.jt; jSel = null; G.audio.sfx('ui'); journal(); return; }
      const l = ev.target.closest('[data-q]'); if (l) { jSel = l.dataset.q; G.audio.sfx('ui'); journal(); return; }
      const tr = ev.target.closest('[data-track]'); if (tr) { G.st.tracked = tr.dataset.track; G.hud.refresh(); journal(); }
    };
  }
  function collection() {
    const body = $('#m-body'), st = G.st;
    const pages = G.pageList();
    const kinds = Object.keys(ENEMIES);
    body.innerHTML = `<div class="seg">${[['main', 'Principales'], ['side', 'Secondaires'], ['done', 'Terminées'], ['collection', 'Collection']].map(([k, l]) => `<button class="${k === jTab ? 'on' : ''}" data-jt="${k}">${l}</button>`).join('')}</div>
      <div class="coll"><div><b>${G.counts('shards')} / ${G.countAll('shard')}</b><small>éclats de prisme</small></div><div><b>${pages.filter((p) => p.found).length} / ${pages.length}</b><small>pages d’Orin</small></div><div><b>${G.completion()} %</b><small>île complétée</small></div>${G.completionAll ? `<div><b>${G.completionAll().total} %</b><small>archipel (6 îles)</small></div>` : ''}<div><b>${st.player.fragments}</b><small>fragments de cœur</small></div></div>
      <h4>Pages d’Orin</h4><ul class="pages">${pages.map((p) => p.found ? `<li><button class="link" data-page="${p.id}">${esc(p.title)}</button></li>` : '<li class="muted">Page manquante</li>').join('')}</ul>
      <h4>Bestiaire</h4><ul class="bestiary">${kinds.map((k) => { const n = st.stats.killsBy[k] || 0; const e = ENEMIES[k]; return n ? `<li><b>${esc(e.name)}</b><em>${n}</em><small>${esc(e.desc)}</small></li>` : '<li class="muted"><b>???</b><small>Pas encore rencontré.</small></li>'; }).join('')}</ul>`;
    body.onclick = (ev) => {
      const t = ev.target.closest('[data-jt]'); if (t) { jTab = t.dataset.jt; jSel = null; journal(); return; }
      const p = ev.target.closest('[data-page]'); if (p) reader(p.dataset.page, false, () => menu('journal'));
    };
  }
  /* ---------- Carte ---------- */
  function mapTab() {
    const body = $('#m-body');
    body.innerHTML = `<canvas id="bigmap" width="900" height="560"></canvas><p class="small muted">● Lyra · ◆ objectif suivi · ✦ cristal de voyage · seules les zones visitées apparaissent${G.st.player.abilities.vision ? ' · ✧ secret repéré (Vision d’éclat)' : ''}</p>`;
    G.drawMap($('#bigmap'));
  }
  /* ---------- Options ---------- */
  function options() {
    const body = $('#m-body'), a = G.audio.get();
    body.innerHTML = `<div class="opts">
      <div class="opt-group"><h4>Compte</h4><div id="o-acc">${accountHtml() || '<p class="small muted">Comptes indisponibles.</p>'}</div></div>
      <div class="opt-group"><h4>Partie</h4><div class="row-actions"><button class="btn primary" data-a="save">Sauvegarder…</button><button class="btn" data-a="load">Charger…</button><button class="btn" data-a="export">Copier le code de ma partie</button></div><p class="small muted">${G.account() === 'in' ? 'Tes sauvegardes sont aussi envoyées sur ton compte Studio Prism.' : 'Sauvegardes sur cet appareil (connecte-toi ci-dessus pour les garder en ligne).'} Sauvegarde automatique toutes les minutes et à chaque étape importante.</p></div>
      <div class="opt-group"><h4>Son</h4>
        <label>Général <input type="range" min="0" max="1" step="0.05" value="${a.master}" data-vol="master"></label>
        <label>Effets <input type="range" min="0" max="1" step="0.05" value="${a.sfx}" data-vol="sfx"></label>
        <label>Musique <input type="range" min="0" max="1" step="0.05" value="${a.music}" data-vol="music"></label>
        <label>Ambiance <input type="range" min="0" max="1" step="0.05" value="${a.ambience === undefined ? 0.8 : a.ambience}" data-vol="ambience"></label>
        <label>Voix <input type="range" min="0" max="1" step="0.05" value="${a.voice === undefined ? 0.9 : a.voice}" data-vol="voice"></label>
        <label class="chk"><input type="checkbox" ${a.muted ? 'checked' : ''} data-a="mute"> Couper le son</label></div>
      <div class="opt-group"><h4>Affichage</h4><div class="seg small-seg">${[['auto', 'Automatique'], ['high', 'Haute'], ['low', 'Économie']].map(([k, l]) => `<button class="${G.quality() === k ? 'on' : ''}" data-q="${k}">${l}</button>`).join('')}</div></div>
      <div class="opt-group"><h4>Commandes</h4><div class="help">${G.helpHtml()}</div></div>
      ${window.Capacitor ? '' : '<div class="opt-group"><a class="btn" href="../#/">Quitter vers Prism Arcade</a></div>'}
    </div>`;
    bindAccount($('#o-acc'), () => options());
    body.oninput = (ev) => { const v = ev.target.dataset.vol; if (v) { G.audio.set({ [v]: +ev.target.value }); G.saveSettings(); } };
    body.onclick = (ev) => {
      const b = ev.target.closest('[data-a]');
      if (b && b.dataset.a === 'save') { slotsScreen('save'); return; }
      if (b && b.dataset.a === 'export') {
        const code = G.saves.exportCode(G.packState ? G.packState() : G.st);
        const done = () => G.hud.toast('📋', 'Code de ta partie copié', 'Colle-le dans « Importer une partie » sur l’autre appareil.');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(() => prompt('Copie ce code :', code));
        else prompt('Copie ce code :', code);
        return;
      }
      if (b && b.dataset.a === 'load') { slotsScreen('load'); return; }
      if (b && b.dataset.a === 'mute') { G.audio.set({ muted: ev.target.checked }); G.saveSettings(); return; }
      const q = ev.target.closest('[data-q]'); if (q) { G.setQuality(q.dataset.q); options(); }
    };
  }

  /* ================= Dialogues ================= */
  let D = null;
  function dialog(npcId) {
    const npc = NPCS[npcId]; if (!npc) return;
    const q = G.q();
    const topic = npc.talk.find((t) => t.if(q));
    const say = typeof topic.say === 'function' ? topic.say(q) : topic.say || [];
    D = { npcId, npc, topic, queue: say.slice(), after: 'topic', choiceSay: null };
    cur = 'dialog';
    dlg.hidden = false;
    G.dialogStart(npcId);
    nextLine();
  }
  function speaker(l) { if (typeof l === 'string') return { who: D.npc.name, role: D.npc.role, t: l, cls: '' }; if (l.who === 'fia') return { who: 'Fia', role: 'ta Lueur', t: l.t, cls: 'fia' }; return { who: G.st.name, role: '', t: l.t, cls: 'lyra' }; }
  function nextLine() {
    if (!D) return;
    if (D.typing) { D.typing = false; clearInterval(D.timer); $('#d-text').textContent = D.full; return; }
    if (D.queue.length) {
      const l = speaker(D.queue.shift());
      dlg.innerHTML = `<div class="d-box ${l.cls}"><div class="d-name"><b>${esc(l.who)}</b>${l.role ? `<small>${esc(l.role)}</small>` : ''}</div><p id="d-text"></p><span class="d-next">${G.input.touch ? 'Touche pour continuer' : 'E / clic'} ▸</span></div>`;
      D.full = l.t; D.typing = true; let i = 0;
      const el = $('#d-text');
      const tm = D.timer = setInterval(() => { if (!D) { clearInterval(tm); return; } i += 2; el.textContent = D.full.slice(0, i); if (i % 6 === 0) G.audio.sfx('talk', { voice: D.npc && (D.npc.id || D.npc.name) }); if (i >= D.full.length) { D.typing = false; clearInterval(D.timer); } }, 22);
      return;
    }
    // fin des répliques : effets, puis choix
    if (D.after === 'topic') { D.after = 'choices'; const res = G.runEffects(D.topic.do || []); if (res.screen) { endDialog(res); return; } }
    if (D.after === 'choice') { const res = G.runEffects(D.choice.do || []); if (res.screen || D.choice.do) { endDialog(res); return; } D.after = 'choices'; }
    const q = G.q();
    const choices = (D.topic.choices || []).filter((c) => !c.if || c.if(q));
    if (!choices.length) { endDialog({}); return; }
    dlg.innerHTML = `<div class="d-box"><div class="d-name"><b>${esc(D.npc.name)}</b><small>${esc(D.npc.role)}</small></div><div class="d-choices">${choices.map((c, i) => `<button class="choice" data-c="${i}"><kbd>${i + 1}</kbd>${esc(c.t)}</button>`).join('')}</div></div>`;
    D.choices = choices; D.choosing = true; D.chAt = performance.now();
    const first = dlg.querySelector('.choice'); if (first && !G.input.touch) first.focus();
  }
  function choose(i) {
    if (!D || !D.choosing) return;
    const c = D.choices[i]; if (!c) return;
    G.audio.sfx('ui'); D.choosing = false;
    if (!c.say && !c.do) { endDialog({}); return; }
    const q = G.q();
    D.queue = (typeof c.say === 'function' ? c.say(q) : c.say || []).slice();
    D.choice = c; D.after = 'choice';
    nextLine();
  }
  function endDialog(res) {
    clearInterval(D && D.timer);
    dlg.hidden = true; dlg.innerHTML = ''; D = null; cur = null;
    G.dialogEnd();
    if (res.screen === 'shop') shop(res.shop, res.sell);
    else if (res.screen === 'forge') forge();
    else if (res.screen === 'wardrobe') wardrobe();
    else G.onScreenClosed();
  }
  /* Entrée/Espace maintenus : la répétition clavier ne doit jamais valider le choix qui vient d'apparaître (et prend le focus) */
  dlg.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.repeat) { ev.preventDefault(); ev.stopPropagation(); } }, true);
  dlg.addEventListener('click', (ev) => { const c = ev.target.closest('[data-c]'); if (c) { if (ev.detail === 0 && D && performance.now() - (D.chAt || 0) < 350) return; choose(+c.dataset.c); return; } if (D && !D.choosing) nextLine(); });

  /* ================= Boutiques ================= */
  function shop(id, sellMode = false) {
    const sh = SHOPS[id]; cur = 'shop';
    const st = G.st, q = G.q();
    const stock = G.shopStock(id);
    const disc = sh.discountFlag && st.flags[sh.discountFlag] ? 0.8 : 1;
    const rows = sh.items.filter((r) => !r.if || r.if(q)).map((r) => {
      const it = r.id ? ITEMS[r.id] : null;
      const name = it ? it.name : r.name, price = Math.round((r.price || (it && it.price) || 0) * disc);
      const owned = r.unlock ? !!st.unlocks[r.unlock] : it && !['conso', 'materiau'].includes(it.cat) && st.inv[r.id];
      const left = r.id ? stock[r.id] : 1;
      const out = owned || (left !== null && left !== undefined && left <= 0);
      return { r, it, name, price, owned, left, out, key: r.id || r.unlock };
    });
    const sellRows = sellMode ? Object.keys(st.inv).filter((id) => ITEMS[id] && ITEMS[id].sell && ['materiau', 'conso'].includes(ITEMS[id].cat) && !(G.questLocked && G.questLocked(id))).map((id) => ({ id, it: ITEMS[id], n: st.inv[id], price: ITEMS[id].sell })) : [];
    open(`<div class="panel shop-card"><div class="j-head"><div><p class="kicker">${sellMode ? 'Vendre' : 'Boutique'}</p><h2>${esc(sh.name)}</h2></div><div class="purse">${icon('coin')} <b>${fmt(st.player.ecus)}</b></div><button class="icon-btn" data-a="close">${icon('close')}</button></div>
      ${disc < 1 ? '<p class="small gold">Prix d’ami : −20 %</p>' : ''}
      <ul class="shop-list">${sellMode ? (sellRows.length ? sellRows.map((s) => `<li class="${rarityCls(s.it.rarity)}"><span class="si">${icon(s.it.icon)}</span><div><b>${esc(s.it.name)} <em>×${s.n}</em></b><small>${esc(s.it.desc)}</small></div><button class="btn small" data-sell="${s.id}">+${s.price} ${icon('coin')}</button></li>`).join('') : '<li class="muted">Rien à vendre : Gaspard achète les matériaux et les consommables.</li>')
        : rows.map((x) => `<li class="${x.it ? rarityCls(x.it.rarity) : ''} ${x.out ? 'out' : ''}"><span class="si" ${x.r.hex ? `style="--dye:${x.r.hex}"` : ''}>${icon(x.it ? x.it.icon : x.r.icon)}</span><div><b>${esc(x.name)}${x.left !== null && x.left !== undefined && x.it && ['conso', 'materiau'].includes(x.it.cat) ? ` <em>stock ${x.left}</em>` : ''}${x.it && st.inv[x.r.id] && ['conso', 'materiau'].includes(x.it.cat) ? ` <em>tu en as ${st.inv[x.r.id]}</em>` : ''}</b><small>${esc(x.it ? x.it.desc : x.r.desc)}</small></div>${x.owned ? '<span class="tag">Possédé</span>' : x.out ? '<span class="tag">Épuisé</span>' : `<button class="btn small ${st.player.ecus >= x.price ? 'primary' : ''}" data-buy="${x.key}">${x.price} ${icon('coin')}</button>`}</li>`).join('')}</ul>
      <p class="small muted">${sellMode ? '' : 'Les stocks se renouvellent quand tu te reposes à l’auberge.'}</p></div>`);
    scr.onclick = (ev) => {
      if (ev.target.closest('[data-a="close"]')) { G.audio.sfx('uiBack'); close(); return; }
      const b = ev.target.closest('[data-buy]');
      if (b) { const x = rows.find((r) => r.key === b.dataset.buy); if (G.buy(id, x)) shop(id); return; }
      const s = ev.target.closest('[data-sell]');
      if (s) { G.sell(s.dataset.sell); shop(id, true); }
    };
  }

  /* ================= Forge ================= */
  function forge() {
    cur = 'forge';
    const st = G.st, disc = st.flags.forge_remise ? 0.8 : 1, smith = (G.meta && G.meta.smith) || (G.def.id === 'foret' ? 'Silex' : 'Bran');   /* ACTE III + IV : forgeron de l’île (meta.smith) */
    const owned = Object.keys(st.inv).filter((id) => ITEMS[id] && ['arme', 'armure'].includes(ITEMS[id].cat) && id !== 'veste_voyage' && id !== 'baton');
    const matsHtml = (m) => Object.entries(m).map(([id, n]) => `<span class="${(st.inv[id] || 0) >= n ? 'ok' : 'miss'}">${icon(ITEMS[id].icon)} ${esc(ITEMS[id].name)} ${st.inv[id] || 0}/${n}</span>`).join('');
    const can = (cost) => st.player.ecus >= Math.round(cost.ecus * disc) && Object.entries(cost.mats).every(([id, n]) => (st.inv[id] || 0) >= n);
    const rows = owned.map((id) => {
      const it = ITEMS[id], lvl = st.gear[id] || 0, tbl = UPGRADES[it.cat], next0 = tbl[lvl], next = next0 && (!next0.island || next0.island === G.def.id) ? next0 : null, ailleurs = !!next0 && !next;   /* ACTE VI : le dernier niveau se forge au Zénith */
      return `<li class="${rarityCls(it.rarity)}"><span class="si">${icon(it.icon)}</span><div><b>${esc(it.name)} ${lvl ? '+' + lvl : ''}</b>${next ? `<small>Niveau ${lvl + 1} : ${it.cat === 'arme' ? 'attaque +' + Math.round(next.bonus * 100) + ' %' : 'défense +' + next.bonus}</small><div class="mats">${matsHtml(next.mats)}</div>` : (ailleurs ? '<small>Une forge plus haute, au Zénith, peut aller plus loin.</small>' : '<small>Amélioration maximale.</small>')}</div>${next ? `<button class="btn small ${can(next) ? 'primary' : ''}" data-up="${id}" ${can(next) ? '' : 'disabled'}>${Math.round(next.ecus * disc)} ${icon('coin')}</button>` : '<span class="tag">Max</span>'}</li>`;
    });
    const craft = Object.entries(RECIPES).filter(([, r]) => !r.island || r.island === G.def.id).map(([id, r]) => { const it = ITEMS[id]; const have = st.inv[id]; return `<li class="${rarityCls(it.rarity)}"><span class="si">${icon(it.icon)}</span><div><b>${esc(it.name)}</b><small>${esc(it.desc)}</small><div class="mats">${matsHtml(r.mats)}</div></div>${have ? '<span class="tag">Possédé</span>' : `<button class="btn small ${can(r) ? 'primary' : ''}" data-craft="${id}" ${can(r) ? '' : 'disabled'}>${Math.round(r.ecus * disc)} ${icon('coin')}</button>`}</li>`; });
    open(`<div class="panel shop-card"><div class="j-head"><div><p class="kicker">Forge</p><h2>${({ Silex: 'Verrerie de Silex' })[smith] || 'Forge de ' + smith}</h2></div><div class="purse">${icon('coin')} <b>${fmt(st.player.ecus)}</b></div><button class="icon-btn" data-a="close">${icon('close')}</button></div>
      <h4>Améliorer</h4><ul class="shop-list">${rows.join('') || `<li class="muted">${smith} améliore les armes et les armures (pas le bâton ni la veste de voyage).</li>`}</ul>
      <h4>Fabriquer</h4><ul class="shop-list">${craft.join('')}</ul></div>`);
    scr.onclick = (ev) => {
      if (ev.target.closest('[data-a="close"]')) { close(); return; }
      const u = ev.target.closest('[data-up]'); if (u) { G.upgrade(u.dataset.up, disc); forge(); return; }
      const c = ev.target.closest('[data-craft]'); if (c) { G.craft(c.dataset.craft, disc); forge(); }
    };
  }

  /* ================= Garde-robe ================= */
  function wardrobe() {
    cur = 'wardrobe'; G.wardrobeCam(true);
    const st = G.st, L = st.look;
    const lock = (u) => u && !st.unlocks[u];
    const sw = (key, list, kind) => `<div class="w-row"><span>${kind}</span><div class="w-opts">${list.map((o) => `<button class="${L[key] === o.id ? 'on' : ''} ${lock(o.unlock) ? 'locked' : ''}" data-k="${key}" data-v="${o.id}" ${o.hex ? `style="--c:${o.hex}"` : ''} title="${esc(o.name || '')}${lock(o.unlock) ? ' (à débloquer)' : ''}">${o.hex ? '<i class="sw"></i>' : esc(o.name)}</button>`).join('')}</div></div>`;
    open(`<div class="panel wardrobe"><div class="j-head"><h2>Apparence</h2><button class="icon-btn" data-a="close">${icon('close')}</button></div>
      ${sw('outfit', OUTFITS, 'Tenue')}${sw('cloak', CLOAK_COLORS, 'Cape')}${sw('trim', TRIMS, 'Bordures')}${sw('hair', HAIR_STYLES, 'Coiffure')}${sw('hairColor', HAIR_COLORS, 'Cheveux')}${sw('skin', SKIN.map((s, i) => Object.assign({ name: 'Teint ' + (i + 1) }, s)), 'Peau')}${sw('eyes', EYES.map((s, i) => Object.assign({ name: 'Yeux ' + (i + 1) }, s)), 'Yeux')}${sw('acc', ACCESSORIES, 'Accessoire')}${sw('height', HEIGHTS, 'Taille')}
      <div class="w-row"><span>Capuche</span><div class="w-opts"><button class="${L.hood ? 'on' : ''}" data-k="hood" data-v="1">Relevée</button><button class="${!L.hood ? 'on' : ''}" data-k="hood" data-v="0">Baissée</button></div></div>
      <p class="small muted">Les éléments grisés se débloquent en jouant : quêtes, boutiques, exploration.</p>
      <div class="row-actions"><button class="btn primary" data-a="close">Terminer</button></div></div>`, 'side');
    scr.onclick = (ev) => {
      if (ev.target.closest('[data-a="close"]')) { G.wardrobeCam(false); G.audio.sfx('uiBack'); G.autosave(); close(); return; }
      const b = ev.target.closest('[data-k]'); if (!b) return;
      if (b.classList.contains('locked')) { G.audio.sfx('deny'); G.hud.toast('🔒', 'Pas encore débloqué', 'Termine des quêtes ou passe voir Pell, le tailleur.'); return; }
      L[b.dataset.k] = b.dataset.k === 'hood' ? b.dataset.v === '1' : b.dataset.v;
      G.audio.sfx('ui'); G.applyLook(); wardrobe();
    };
  }

  /* ================= Voyage, lecture, défaite, fin d'acte ================= */
  function warps(list) {
    cur = 'warp';
    open(`<div class="panel menu-card"><div class="j-head"><h2>Cristal de voyage</h2><button class="icon-btn" data-a="close">${icon('close')}</button></div><p class="muted small">Les cristaux que tu as réveillés te transportent les uns vers les autres.</p><div class="slots">${list.map((w) => `<button class="slot ${w.here ? 'empty' : ''}" data-w="${w.id}" ${w.here ? 'disabled' : ''}><b>${esc(w.name)}</b><small>${w.here ? 'Tu es ici' : esc(w.where)}</small></button>`).join('')}</div></div>`);
    scr.onclick = (ev) => { if (ev.target.closest('[data-a="close"]')) { close(); return; } const w = ev.target.closest('[data-w]'); if (w) { close(); G.warpTo(w.dataset.w); } };
  }
  function reader(pageId, fresh, back) {
    cur = 'read';
    const p = G.def.pages[pageId];
    open(`<div class="panel page-card"><p class="kicker">${fresh ? 'Page trouvée' : 'Journal d’Orin'}</p><h2>${esc(p.title)}</h2><p class="page-text">${esc(p.text)}</p><div class="actions"><button class="btn primary" data-a="close">Continuer</button></div></div>`);
    scr.onclick = (ev) => { if (ev.target.closest('[data-a="close"]')) { if (back) back(); else close(); } };
  }
  function message(title, text, btn = 'Continuer') {
    cur = 'msg';
    open(`<div class="panel page-card sign"><h2>${esc(title)}</h2><p class="page-text">${esc(text)}</p><div class="actions"><button class="btn primary" data-a="close">${esc(btn)}</button></div></div>`);
    scr.onclick = (ev) => { if (ev.target.closest('[data-a="close"]')) close(); };
  }
  /* « à / au / aux » devant un nom de lieu (Le Temple → au Temple ; Auberge du Lampion → à l’Auberge du Lampion) */
  const placeTo = (t) => /^Le /.test(t) ? 'au ' + t.slice(3) : /^La /.test(t) ? 'à la ' + t.slice(3) : /^Les /.test(t) ? 'aux ' + t.slice(4) : /^L’/.test(t) ? 'à l’' + t.slice(2) : /^Auberge/.test(t) ? 'à l’' + t : /^Maison/.test(t) ? 'à la ' + t : 'à ' + t;
  function death(where, lost = 0) {
    cur = 'death';
    open(`<div class="panel menu-card death"><h2>Lyra s’est évanouie…</h2><p class="muted">Fia l’a ramenée ${esc(placeTo(where))}. ${lost > 0 ? `${lost} écu${lost > 1 ? 's' : ''} se ${lost > 1 ? 'sont perdus' : 'est perdu'} dans la brume.` : 'Rien n’a été perdu dans la brume.'}</p><div class="actions"><button class="btn primary" data-a="rise">Se relever</button></div></div>`, 'dark');
    scr.onclick = (ev) => { if (ev.target.closest('[data-a="rise"]')) { close(); G.respawn(); } };
  }
  function actEnd(info) {
    cur = 'end';
    open(`<div class="panel end-card"><p class="kicker">Acte ${G.def.num || 1} terminé</p><h1>${esc(G.def.endTitle || (G.def.num === 2 ? 'Le Temple de Verre est libéré' : 'Le phare de l’Aube brille'))}</h1><p class="lead">${esc(G.def.ending)}</p>
      <div class="stats"><div><b>${fmtTime(G.st.playTime)}</b><small>temps de jeu</small></div><div><b>${G.completion()} %</b><small>île complétée</small></div>${G.completionAll ? `<div><b>${G.completionAll().total} %</b><small>archipel complété</small></div>` : ''}<div><b>${G.st.player.lvl}</b><small>niveau</small></div><div><b>${G.st.stats.kills}</b><small>créatures vaincues</small></div><div><b>${G.quests.done('side').length}</b><small>quêtes secondaires</small></div></div>
      ${info && info.xp ? `<p class="gain">🎁 +${fmt(info.xp)} XP · +${fmt(info.coins)} pièces sur Prism Arcade</p>` : ''}
      <div class="next"><h3>La suite du voyage</h3>${(G.islands || []).filter((i) => i.num === (G.def.num || 1) + 1).map((u) => `<div class="up"><span>Île ${u.num}</span><b>${esc(u.name)}</b><small>disponible : parle à Calixte, le passeur, sur le port de Havre-Aube</small></div>`).join('')}${G.upcoming.map((u) => `<div class="up"><span>Île ${u.num}</span><b>${esc(u.name)}</b><small>${esc(u.what)} · bientôt</small></div>`).join('')}</div>
      <div class="actions"><button class="btn primary" data-a="close">Continuer à explorer</button>${window.Capacitor ? '' : '<a class="btn" href="../#/">Retour à Prism Arcade</a>'}</div></div>`, 'end');
    scr.onclick = (ev) => { if (ev.target.closest('[data-a="close"]')) close(); };
  }

  return {
    get current() { return cur; },
    get dialogOpen() { return !!D; },
    title, menu, close, dialog, nextLine, choose, shop, forge, wardrobe, warps, reader, message, death, actEnd, slotsScreen,
    isOpen: () => !scr.hidden || !!D,
  };
}
