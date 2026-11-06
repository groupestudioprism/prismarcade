/* =========================================================
   LUMEN — interface en jeu : vie, énergie, niveau, objectif,
   pièces, objet rapide, messages, nombres de dégâts,
   barres des ennemis et du boss, invite d'action.
   ========================================================= */
import * as THREE from 'three';
import { $, esc, fmt } from '../engine/util.js';
import { icon } from './icons.js';
import { ITEMS } from '../data/items.js';

export function createHud(G) {
  const el = {
    hud: $('#hud'), hp: $('#h-hp'), hpT: $('#h-hpt'), en: $('#h-en'), xp: $('#h-xp'), lvl: $('#h-lvl'), ecus: $('#h-ecus'), shard: $('#h-shard'),
    quest: $('#h-quest'), quick: $('#quick'), boss: $('#bossbar'), floaters: $('#floaters'), prompt: $('#prompt'), toasts: $('#toasts'), banner: $('#banner'),
    hit: $('#hitflash'), act: $('#t-interact'),
  };
  const v3 = new THREE.Vector3();
  const floaters = [];
  const bars = new Map();
  let last = {};

  function project(x, y, z) {
    v3.set(x, y, z).project(G.camera);
    return { x: (v3.x * 0.5 + 0.5) * innerWidth, y: (-v3.y * 0.5 + 0.5) * innerHeight, ok: v3.z < 1 };
  }
  const api = {
    update() {
      const st = G.st, s = G.stats(), p = st.player;
      const set = (k, v, fn) => { if (last[k] !== v) { last[k] = v; fn(v); } };
      set('hp', Math.ceil(p.hp) + '/' + s.maxHp, () => { el.hp.style.width = (100 * p.hp / s.maxHp) + '%'; el.hpT.textContent = `${Math.ceil(p.hp)} / ${s.maxHp}`; el.hud.classList.toggle('low', p.hp / s.maxHp < 0.25); });
      set('en', Math.floor(p.en) + '/' + s.maxEn, () => { el.en.style.width = (100 * p.en / s.maxEn) + '%'; });
      set('xp', p.xp + '/' + p.lvl, () => { el.xp.style.width = Math.min(100, 100 * p.xp / G.xpFor(p.lvl)) + '%'; el.lvl.textContent = p.lvl; });
      set('ecus', p.ecus, (v) => (el.ecus.textContent = fmt(v)));
      set('shard', G.counts('shards'), (v) => (el.shard.textContent = v));
      const qid = st.equip.quick, qn = qid ? st.inv[qid] || 0 : 0;
      set('quick', qid + qn, () => { el.quick.innerHTML = qid && ITEMS[qid] ? `${icon(ITEMS[qid].icon)}<b>${qn}</b><small>${G.input.touch ? '' : 'F'}</small>` : ''; el.quick.classList.toggle('empty', !qn); });
      const qt = G.quests.tracked();
      const step = qt ? G.quests.step(qt) : null, pr = qt ? G.quests.progress(qt) : null;
      set('quest', qt ? qt + ':' + (step && step.id) + ':' + (pr ? pr.n : '') : '', () => {
        if (!qt || !step) { el.quest.hidden = true; return; }
        const q = G.quests.def(qt);
        el.quest.hidden = false;
        el.quest.innerHTML = `<small>${q.kind === 'main' ? 'Quête principale' : 'Quête'} · ${esc(q.title)}</small><b>${esc(step.text)}${pr ? ` <em>${pr.n} / ${pr.of}</em>` : ''}</b>`;
      });
    },
    toast(ic, title, sub = '', kind = '') {
      const t = document.createElement('div');
      t.className = 'toast ' + kind;
      t.innerHTML = `<span class="ti">${ic.startsWith('<') ? ic : esc(ic)}</span><div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
      el.toasts.appendChild(t);
      while (el.toasts.children.length > 4) el.toasts.firstChild.remove();
      setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, kind === 'reward' ? 2800 : 4200);
    },
    banner(small, big) {
      el.banner.innerHTML = `<small>${esc(small)}</small><b>${esc(big)}</b>`;
      el.banner.classList.remove('show'); void el.banner.offsetWidth; el.banner.classList.add('show');
    },
    prompt(html) {
      if (last.prompt === html) return; last.prompt = html;
      el.prompt.hidden = !html; if (html) el.prompt.innerHTML = html;
      if (el.act) { el.act.classList.toggle('ready', !!html); }
    },
    damage(x, y, z, n, kind = '') {
      const d = document.createElement('div');
      d.className = 'dmg ' + kind; d.textContent = typeof n === 'number' ? n : n;
      el.floaters.appendChild(d);
      floaters.push({ d, x: x + (Math.random() - 0.5) * 0.6, y, z, t: 0 });
      if (floaters.length > 30) { const f = floaters.shift(); f.d.remove(); }
    },
    hurtFlash() { el.hit.classList.remove('on'); void el.hit.offsetWidth; el.hit.classList.add('on'); },
    enemyBar(e, frac) {
      let b = bars.get(e);
      if (frac === null) { if (b) { b.remove(); bars.delete(e); } return; }
      if (!b) { b = document.createElement('div'); b.className = 'ebar' + (e.elite ? ' elite' : ''); b.innerHTML = '<i></i>'; el.floaters.appendChild(b); bars.set(e, b); }
      b.firstChild.style.width = Math.max(0, frac * 100) + '%';
      b._e = e;
    },
    bossBar(e) {
      if (!e) { el.boss.hidden = true; return; }
      el.boss.hidden = e.state === 'dead' || e.state === 'idle';
      el.boss.innerHTML = `<b>${esc(e.def.name)}</b><div class="bb"><i style="width:${Math.max(0, 100 * e.hp / e.maxHp)}%"></i></div>`;
    },
    frame(dt) {
      for (let i = floaters.length - 1; i >= 0; i--) {
        const f = floaters[i]; f.t += dt;
        const p = project(f.x, f.y + f.t * 1.4, f.z);
        f.d.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${f.t < 0.12 ? 1.4 - f.t * 3 : 1})`;
        f.d.style.opacity = f.t > 0.7 ? Math.max(0, 1 - (f.t - 0.7) * 3) : 1;
        if (f.t > 1.05 || !p.ok) { f.d.remove(); floaters.splice(i, 1); }
      }
      bars.forEach((b, e) => {
        const p = project(e.x, (e.def.radius > 1 ? 4.5 : 1.7) + (e.type === 'gardien' ? 0.6 : 0), e.z);
        b.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        b.style.display = p.ok ? '' : 'none';
      });
    },
    clearBars() { bars.forEach((b) => b.remove()); bars.clear(); el.boss.hidden = true; },
    show(on) { el.hud.hidden = !on; el.quick.hidden = !on; if (!on) api.prompt(''); },
    refresh() { last = {}; api.update(); },
  };
  el.quick.addEventListener('click', () => G.useQuick());
  return api;
}
