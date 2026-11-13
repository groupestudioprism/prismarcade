/* LUMEN — analyse des dialogues : sujets jamais atteints (masqués par un sujet précédent) et incohérences d'état.
   node tools/dialogues.mjs   — échantillonne des états de partie plausibles (quêtes faites dans le désordre comprises). */
import { NPCS } from '../js/data/npcs.js';
import { QUESTS } from '../js/data/quests.js';
import { ITEMS } from '../js/data/items.js';

let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const FLAGS = ['forge_ouverte', 'ysolde_plus', 'forge_remise', 'boss_colosse', 'boss_verre', 'acte1_fini', 'acte2_fini', 'verre_fini', 'lens_set', 'puits', 'fin_jeu', 'boss_zenith', 'epilogue_ok' /* ACTE VI */];
const ITEM_IDS = Object.keys(ITEMS);
const mkState = () => {
  const qs = {};
  const ids = Object.keys(QUESTS).sort(() => rnd() - 0.5);
  const order = Object.keys(QUESTS);
  for (const id of order) {
    const Q = QUESTS[id];
    const dep = Q.requires || Q.after;
    if (dep && qs[dep] && qs[dep].state !== 'done') { qs[id] = { state: 'none' }; continue; }
    if (dep && !qs[dep]) { qs[id] = { state: 'none' }; continue; }
    const r = rnd();
    qs[id] = r < 0.35 ? { state: 'none' } : r < 0.55 ? { state: 'done' } : { state: 'active', step: Math.floor(rnd() * Q.steps.length) };
  }
  const flags = {}; FLAGS.forEach((f) => { if (rnd() < 0.5) flags[f] = 1; });
  const inv = {}; ITEM_IDS.forEach((i) => { if (rnd() < 0.4) inv[i] = 1 + Math.floor(rnd() * 5); });
  return { qs, flags, inv, counts: { pages: Math.floor(rnd() * 4), lampions: Math.floor(rnd() * 8), shards: Math.floor(rnd() * 11), kills: Math.floor(rnd() * 15), eclats: Math.floor(rnd() * 8), graines: Math.floor(rnd() * 4) } };
};
const mkQ = (s) => ({
  flag: (f) => !!s.flags[f], quest: (id) => (s.qs[id] ? s.qs[id].state : 'none'),
  step: (id) => { const r = s.qs[id]; return r && r.state === 'active' ? QUESTS[id].steps[r.step].id : null; },
  has: (id, n = 1) => (s.inv[id] || 0) >= n, count: (w) => s.counts[w] || 0,
});
const hits = {}; Object.entries(NPCS).forEach(([id, n]) => (hits[id] = n.talk.map(() => 0)));
const errors = [];
for (let k = 0; k < 40000; k++) {
  const s = mkState(), q = mkQ(s);
  for (const [id, n] of Object.entries(NPCS)) {
    let idx = -1;
    try { idx = n.talk.findIndex((t) => t.if(q)); } catch (e) { errors.push(`${id}: condition en erreur ${e.message}`); }
    if (idx < 0) { errors.push(`${id}: aucun sujet`); continue; }
    hits[id][idx]++;
    const t = n.talk[idx];
    try { if (typeof t.say === 'function') t.say(q); (t.choices || []).filter((c) => !c.if || c.if(q)).forEach((c) => { if (typeof c.say === 'function') c.say(q); }); } catch (e) { errors.push(`${id}#${idx}: say en erreur ${e.message}`); }
    // un sujet qui propose des choix doit en proposer au moins un
    if (t.choices && !t.choices.some((c) => !c.if || c.if(q))) errors.push(`${id}#${idx}: tous les choix masqués`);
  }
}
console.log('Sujets jamais atteints (masqués ou conditions impossibles) :');
let dead = 0;
for (const [id, h] of Object.entries(hits)) h.forEach((c, i) => { if (!c) { dead++; console.log(`  ✗ ${id} sujet #${i} : ${NPCS[id].talk[i].if.toString().replace(/\s+/g, ' ').slice(0, 110)}`); } });
if (!dead) console.log('  aucun');
console.log('Erreurs :', [...new Set(errors)].slice(0, 20));
