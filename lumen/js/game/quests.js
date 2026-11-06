/* =========================================================
   LUMEN — moteur de quêtes. Les étapes avancent toutes seules
   (portes, objets, créatures, drapeaux, zones, compteurs), sauf
   « talk » qui avance par un dialogue (effet step).
   G fournit : st (sauvegarde), counts(what), isGateOpen(id), zoneId(), emit(ev, data), reward(quest)
   ========================================================= */
import { QUESTS } from '../data/quests.js';

export function createQuests(G) {
  const st = () => G.st;
  const rec = (id) => st().quests[id];
  const api = {
    def: (id) => QUESTS[id],
    state: (id) => (rec(id) ? rec(id).state : 'none'),
    stepId(id) { const r = rec(id); if (!r || r.state !== 'active') return null; const s = QUESTS[id].steps[r.step]; return s ? s.id : null; },
    step(id) { const r = rec(id); return r && r.state === 'active' ? QUESTS[id].steps[r.step] : null; },
    active: (kind) => Object.keys(st().quests).filter((id) => rec(id).state === 'active' && (!kind || QUESTS[id].kind === kind)),
    done: (kind) => Object.keys(st().quests).filter((id) => rec(id).state === 'done' && (!kind || QUESTS[id].kind === kind)),
    start(id) {
      if (!QUESTS[id] || rec(id)) return false;
      st().quests[id] = { state: 'active', step: 0, base: { kills: st().stats.kills }, started: Math.round(st().playTime) };
      G.emit('quest:start', { id, q: QUESTS[id] });
      api.check();
      return true;
    },
    /* termine l'étape en cours (étapes « talk », ou forcer) */
    advance(id) {
      const r = rec(id); if (!r || r.state !== 'active') return;
      r.step++;
      r.base = { kills: st().stats.kills };
      if (r.step >= QUESTS[id].steps.length) {
        r.state = 'done'; r.finished = Math.round(st().playTime);
        G.reward(id);
        G.emit('quest:done', { id, q: QUESTS[id] });
      } else G.emit('quest:step', { id, q: QUESTS[id], step: QUESTS[id].steps[r.step] });
      api.check();
    },
    /* progression d'une étape : { n, of } */
    progress(id) {
      const s = api.step(id); if (!s) return null;
      const r = rec(id);
      switch (s.type) {
        case 'gates': { const n = s.gates.filter((g) => G.isGateOpen(g)).length; return { n, of: s.n || s.gates.length }; }
        case 'item': return { n: Math.min(s.n, (st().inv[s.item] || 0)), of: s.n };
        case 'kill': return { n: Math.min(s.n, st().stats.kills - (r.base.kills || 0)), of: s.n };
        case 'count': return { n: Math.min(s.n, G.counts(s.what)), of: s.n };
        default: return null;
      }
    },
    isStepDone(id) {
      const s = api.step(id); if (!s) return false;
      switch (s.type) {
        case 'talk': return false;
        case 'flag': return !!st().flags[s.flag];
        case 'reach': return G.zoneId() === s.zone || !!(st().seen[s.zone]);
        default: { const p = api.progress(id); return p && p.n >= p.of; }
      }
    },
    check() {
      let guard = 0, changed = true;
      while (changed && guard++ < 20) {
        changed = false;
        for (const id of api.active()) if (api.isStepDone(id)) { api.advance(id); changed = true; break; }
      }
    },
    /* étape « talk » en attente chez ce PNJ ? */
    waitingAt(npc) { return api.active().find((id) => { const s = api.step(id); return s && s.type === 'talk' && s.npc === npc; }) || null; },
    /* quête disponible chez ce PNJ (donneur, prérequis remplis, pas encore commencée) */
    offeredBy(npc) { return Object.keys(QUESTS).find((id) => QUESTS[id].giver === npc && !rec(id) && QUESTS[id].kind === 'side' && (!QUESTS[id].requires || api.state(QUESTS[id].requires) === 'done')) || null; },
    /* objectif à afficher (quête principale d'abord, puis suivie) */
    tracked() {
      const t = st().tracked && api.state(st().tracked) === 'active' ? st().tracked : null;
      return t || api.active('main')[0] || api.active('side')[0] || null;
    },
  };
  return api;
}
