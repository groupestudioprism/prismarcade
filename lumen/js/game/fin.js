/* =========================================================
   LUMEN — Acte VI : la séquence de fin.
   Phare du Zénith allumé → six faisceaux vers les six phares de l’archipel → la Brume recule →
   le Prisme est reforgé → l’archipel se rassemble → écran de bilan → générique → retour au jeu libre.
   La scène se rejoue depuis Célestine (« Revoir la scène finale ») ou en contemplant le Prisme au phare.
   Tout est piloté par une chronologie unique (TL) : lisible, testable, sautable.
   ========================================================= */
import * as THREE from 'three';
import { esc, fmt, damp } from '../engine/util.js';
import { SIX } from '../world/zenith-scene.js';

const CSS = `
#fin{position:fixed;inset:0;z-index:60;pointer-events:none;font-family:'Cormorant Garamond',Georgia,serif;color:#fff8e6}
#fin .cap{position:absolute;left:0;right:0;bottom:11%;text-align:center;font-size:clamp(18px,3.2vw,34px);letter-spacing:.02em;text-shadow:0 2px 14px rgba(40,20,70,.85);padding:0 8%;opacity:0;transition:opacity .9s}
#fin .cap.on{opacity:1}
#fin .skip{position:absolute;top:14px;right:16px;pointer-events:auto;font:600 13px Inter,system-ui,sans-serif;background:rgba(30,20,50,.55);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:7px 14px;cursor:pointer}
#fin .veil{position:absolute;inset:0;background:#fff;opacity:0;transition:opacity 1.2s}
#fin .veil.dark{background:#140f24}
#fin .veil.on{opacity:1}
#fin .card{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:auto;background:radial-gradient(ellipse at 50% 30%,rgba(255,238,190,.28),rgba(20,14,40,.92) 70%);overflow:auto}
#fin .panel{max-width:760px;width:92%;text-align:center;padding:26px 22px;margin:auto}
#fin .kicker{font:600 12px Inter,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#ffd978;margin:0 0 6px}
#fin h1{font-size:clamp(28px,5vw,52px);margin:0 0 10px;font-weight:600}
#fin .lead{font-size:clamp(15px,2.2vw,21px);line-height:1.5;margin:0 0 16px;opacity:.95}
#fin .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:14px 0}
#fin .stats div{background:rgba(255,255,255,.1);border-radius:12px;padding:10px 6px}
#fin .stats b{display:block;font-size:clamp(18px,3vw,28px);color:#ffe9a8}
#fin .stats small{font:500 11px Inter,system-ui,sans-serif;opacity:.8}
#fin .isl{display:grid;grid-template-columns:1fr auto;gap:2px 14px;text-align:left;font:500 13px Inter,system-ui,sans-serif;margin:10px auto;max-width:420px}
#fin .isl span:nth-child(even){text-align:right;color:#ffe9a8}
#fin .secret{font-style:italic;margin:12px 0;color:#bff3ff}
#fin .actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px}
#fin .btn{font:600 14px Inter,system-ui,sans-serif;border:0;border-radius:999px;padding:11px 22px;cursor:pointer;background:rgba(255,255,255,.16);color:#fff}
#fin .btn.primary{background:linear-gradient(135deg,#ffd978,#ffb35a);color:#2a1d10}
#fin .credits{position:absolute;inset:0;overflow:hidden;pointer-events:auto;background:radial-gradient(ellipse at 50% 20%,rgba(255,238,190,.18),rgba(14,10,30,.96) 70%)}
#fin .roll{position:absolute;left:0;right:0;top:100%;text-align:center;animation:finroll 46s linear forwards}
#fin .roll h2{font-size:clamp(20px,3.4vw,34px);margin:46px 0 6px;color:#ffd978;font-weight:600}
#fin .roll p{font-size:clamp(14px,2.2vw,20px);margin:3px 0;opacity:.92}
@keyframes finroll{to{top:-220%}}
`;

/* Chronologie : [temps en s, action]. Les durées des phases de la scène suivent ce tableau. */
const TL = [
  [0.3, 'cap', 'Les deux balises du Zénith s’embrasent.'],
  [3.6, 'light', 0, 'Un trait rouge file vers le phare de l’Aube.'],
  [6.2, 'light', 1, 'Un trait vert, vers la Forêt de Verre.'],
  [8.8, 'light', 2, 'Un trait jaune, vers le Désert des Échos.'],
  [11.4, 'light', 3, 'Un trait bleu, vers les Abysses Miroirs.'],
  [14.0, 'light', 4, 'Un trait magenta, vers les Pics du Vent.'],
  [16.6, 'light', 5, 'Un trait cyan, vers le Socle, au centre de l’archipel.'],
  [20.0, 'brume', 'Six phares brillent. La Brume recule, île après île.'],
  [29.0, 'forge', 'Le Prisme se reforge : non plus un cristal que l’on garde, mais une lumière que l’on se passe.'],
  [38.0, 'gather', 'L’archipel se rassemble.'],
  [46.0, 'cap', 'Iridia brille de nouveau.'],
  [52.0, 'stats'],
];
const END_T = 52;

export function createFin(G, ctx) {
  const { S, scene3, setTouch, platform, IID, music, camera } = ctx;
  let el = null, F = null, idx = 0, brumeT = -1, last = '';
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  const cap = (t) => { if (!el) return; const c = el.querySelector('.cap'); if (!t) { c.classList.remove('on'); return; } c.classList.remove('on'); setTimeout(() => { c.textContent = t; c.classList.add('on'); }, 250); };
  const sfxNote = (k) => { try { G.audio.note(k); G.audio.chord([392, 494, 587], 0.12); } catch (e) { /* le son ne doit rien casser */ } };

  function start(opts = {}) {
    if (F) return;
    F = { t: 0, replay: !!opts.replay, done: false };
    idx = 0; brumeT = -1;
    S.mode = 'ending'; setTouch(false); G.hud.prompt(''); G.input.clear(); S.endMusic = 'epilogue';
    scene3.reset();
    el = document.createElement('div'); el.id = 'fin';
    el.innerHTML = '<div class="cap"></div><button class="skip">Passer la scène</button><div class="veil"></div>';
    document.body.appendChild(el);
    el.querySelector('.skip').onclick = () => skip();
    G.hud.show(false);
    G.audio.chord([392, 494, 587, 784, 988], 0.35);
    const veil = el.querySelector('.veil'); veil.classList.add('on'); setTimeout(() => veil.classList.remove('on'), 60);
  }

  function skip() { if (!F || F.done) return; while (idx < TL.length) run(TL[idx++], true); F.t = END_T; }

  function run(ev, quick) {
    const [, kind, a, b] = ev;
    if (kind === 'cap') { if (!quick) cap(a); }
    else if (kind === 'light') { scene3.lightUp(a, true); if (!quick) { cap(b); sfxNote(SIX[a].k); } }
    else if (kind === 'brume') { brumeT = 0; if (!quick) { cap(a); G.audio.chord([330, 440, 554, 659], 0.2); } else scene3.setBrume(0); }
    else if (kind === 'forge') { scene3.forge(); if (!quick) { cap(a); G.audio.chord([523, 659, 784, 988, 1319], 0.25); G.audio.sfx('puzzle_solved'); } }
    else if (kind === 'gather') { scene3.setGather(1); if (!quick) cap(a); }
    else if (kind === 'stats') { cap(''); showStats(); }
  }

  function update(dt) {
    if (!F) return;
    F.t += dt;
    while (idx < TL.length && F.t >= TL[idx][0]) run(TL[idx++], false);
    if (brumeT >= 0 && brumeT < 1) { brumeT = Math.min(1, brumeT + dt / 8); scene3.setBrume(1 - brumeT * brumeT * (3 - 2 * brumeT)); }
    // caméra : orbite autour du phare, de plus en plus large
    const top = scene3.top, k = Math.min(1, F.t / 46);
    const yaw = 0.6 + F.t * 0.12, dist = THREE.MathUtils.lerp(34, 150, Math.pow(k, 0.8)), h = THREE.MathUtils.lerp(16, 58, k);
    const target = new THREE.Vector3(top.x, top.y + THREE.MathUtils.lerp(2, 14, k), top.z);
    camera.position.lerp(new THREE.Vector3(top.x + Math.sin(yaw) * dist, top.y + h, top.z + Math.cos(yaw) * dist), damp(2.5, dt));
    camera.lookAt(target);
    S.restoreT = 1;
  }

  const fmtTime = (s) => { const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`; };
  function stats() {
    const st = G.st, q = G.quests, all = G.completionAll ? G.completionAll() : { total: G.completion(), islands: [] };
    return { st, side: q.done('side').length, main: q.done('main').length, all };
  }
  function showStats() {
    G.st.flags.fin_jeu = 1; G.st.flags.fin_vue = (G.st.flags.fin_vue || 0) + 1;
    if (!F.replay) { try { platform.reward('g:' + IID + ':end', 120, 40); platform.reward('done:' + IID, 600, 200); platform.finish(IID, G.st.playTime); } catch (e) { /* hors ligne */ } }
    G.autosave && G.autosave();
    const s = stats(), st = s.st;
    scene3.settle();
    el.querySelector('.card') && el.querySelector('.card').remove();
    const card = document.createElement('div'); card.className = 'card';
    const rows = s.all.islands.map((i) => `<span>${esc(i.name)}</span><span>${i.pct} %</span>`).join('');
    card.innerHTML = `<div class="panel"><p class="kicker">Fin · La Citadelle du Zénith</p><h1>La lumière est partagée</h1>
      <p class="lead">Les six phares brillent. Le Prisme n’est plus gardé par une seule île : il passe de main en main, et la Brume n’a plus de fissure où se glisser.</p>
      <div class="stats"><div><b>${fmtTime(st.playTime)}</b><small>temps de jeu</small></div><div><b>${st.player.lvl}</b><small>niveau</small></div><div><b>${fmt(st.stats.kills)}</b><small>créatures vaincues</small></div><div><b>${s.main}</b><small>quêtes principales</small></div><div><b>${s.side}</b><small>quêtes secondaires</small></div><div><b>${s.all.total} %</b><small>archipel complété</small></div></div>
      <div class="isl">${rows}</div>
      ${s.all.total >= 100 ? '<p class="secret">Tout est trouvé. Au dos de la dernière page d’Orin, une ligne que personne n’avait lue : « Merci d’avoir tout rallumé. Maintenant, va voir ce que la lumière éclaire. »</p>' : '<p class="small" style="opacity:.8;font:500 13px Inter,system-ui,sans-serif">Il reste des coffres, des pages et des quêtes à découvrir : l’archipel t’attend, et la citadelle aussi.</p>'}
      <div class="actions"><button class="btn primary" data-a="credits">Voir le générique</button><button class="btn" data-a="free">Continuer à explorer</button></div></div>`;
    el.appendChild(card);
    card.onclick = (ev) => { const b = ev.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'credits') credits(); else finish(); };
    el.querySelector('.skip').style.display = 'none';
    F.done = true;
  }

  function credits() {
    S.endMusic = 'generique';
    const c = document.createElement('div'); c.className = 'credits';
    const rows = [
      ['LUMEN', 'Les Îles Brisées'], ['Un jeu d’aventure et d’énigmes de lumière', 'pour Prism Arcade'],
      ['Histoire', 'Iridia, ses six îles et le Grand Prisme'], ['Énigmes', 'miroirs, prismes, vitraux, relais, grappin, portails'],
      ['Mondes', 'l’Aube · la Forêt de Verre · le Désert · les Abysses · les Pics · le Zénith'],
      ['Personnages', 'Lyra et Fia · Séléné · Ambre · Bran · Silex · Lison · Mira · Aldo · Pell · Ysolde · Gaspard · Calixte · Vesper · Oriel · Célestine'],
      ['Musique et sons', 'synthétisés en direct dans ton navigateur : aucun fichier audio'],
      ['Réalisation', 'Claude, avec le groupe Studio Prism'],
      ['Remerciements', 'à Orin, l’architecte absent, et à toutes celles et ceux qui rallument une lumière quand tout s’éteint'],
      ['Merci d’avoir joué', ''],
    ];
    c.innerHTML = `<div class="roll">${rows.map(([h, p]) => `<h2>${esc(h)}</h2>${p ? `<p>${esc(p)}</p>` : ''}`).join('')}<h2 style="margin-top:90px">Fin</h2></div>`;
    const bar = document.createElement('div'); bar.style.cssText = 'position:absolute;bottom:18px;left:0;right:0;text-align:center;pointer-events:auto';
    bar.innerHTML = '<button class="btn primary" data-a="free">Retour au jeu libre</button>';
    c.appendChild(bar);
    c.onclick = (ev) => { if (ev.target.closest('[data-a="free"]')) finish(); };
    el.appendChild(c);
    const roll = c.querySelector('.roll'); roll.addEventListener('animationend', () => { c.__ended = true; });
  }

  function finish() {
    if (!F) return;
    const veil = el.querySelector('.veil'); veil.classList.add('dark', 'on');
    setTimeout(() => {
      if (el) el.remove(); el = null; F = null; S.endMusic = null;
      S.mode = 'play'; setTouch(true); G.hud.show(true); G.input.clear();
      // retour au jeu libre : le joueur reste au phare, tout est allumé
      G.hud.banner('Jeu libre', 'Explore, termine tes quêtes, reviens contempler le Prisme');
      G.quests.check(); G.autosave && G.autosave();
    }, 1300);
  }

  return { start, update, skip, get active() { return !!F; }, get time() { return F ? F.t : 0; }, get phase() { return F ? (F.done ? 'bilan' : 'scene') : null; }, END_T };
}
