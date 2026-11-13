/* =========================================================
   LUMEN — contrôle de cohérence des données (QA-GAMEPLAY)
   node tools/coherence.mjs   → liste les références orphelines et les fautes de texte probables.
   Vérifie : quêtes ↔ PNJ ↔ objets ↔ boutiques ↔ ennemis ↔ îles ↔ icônes ↔ déblocages.
   ========================================================= */
import fs from 'node:fs';
import { ISLANDS, ISLAND_META } from '../js/levels.js';
import { ITEMS, UPGRADES, RECIPES } from '../js/data/items.js';
import { QUESTS } from '../js/data/quests.js';
import { NPCS } from '../js/data/npcs.js';
import { SHOPS } from '../js/data/shops.js';
import { ENEMIES } from '../js/data/enemies.js';
import { UNLOCK_NAMES, OUTFITS, ACCESSORIES, HAIR_COLORS, CLOAK_COLORS, TRIMS } from '../js/data/looks.js';
import { SAVE_VERSION } from '../js/game/state.js';

const err = [], warn = [];
const E = (m) => err.push(m), Wn = (m) => warn.push(m);
const iconsSrc = fs.readFileSync(new URL('../js/ui/icons.js', import.meta.url), 'utf8');
const ICONS = new Set([...iconsSrc.matchAll(/^\s*'?([a-z0-9-]+)'?\s*:\s*'</gm)].map((m) => m[1]));

const zonesAll = {}; const gatesAll = new Set(); const warpsAll = new Set();
for (const I of ISLANDS) {
  for (const z of I.zones) { zonesAll[z.id] = { island: I.id, z }; if (z.warp) warpsAll.add(z.warp.id); }
  for (const b of I.bridges || []) gatesAll.add(b.gate);
  for (const z of I.zones) {
    for (const e of z.ents || []) if (e.gate) gatesAll.add(e.gate);
    for (const d of z.doors || []) gatesAll.add(d.gate);
    for (const r of z.combatRooms || []) gatesAll.add(r.gate);
  }
  for (const g of I.stageGates || []) gatesAll.add(g);
}
// portes déclarées dans les receveurs / relais / balises
const npcPlaced = {}, itemRefsFromWorld = [];
for (const I of ISLANDS) for (const z of I.zones) {
  for (const n of z.npcs || []) { (npcPlaced[n.id] = npcPlaced[n.id] || []).push(z.id); if (!NPCS[n.id]) E(`PNJ placé inconnu : ${n.id} (zone ${z.id})`); }
  for (const c of z.chests || []) { if (c.item && !ITEMS[c.item]) E(`Coffre ${c.id} : objet inconnu ${c.item}`); if (!c.item && !c.ecus) Wn(`Coffre ${c.id} vide`); if (c.after && !c.after) 0; }
  for (const p of z.pickups || []) if (p.item && !ITEMS[p.item]) E(`Ramassage ${p.id} : objet inconnu ${p.item}`);
  for (const s of z.spawns || []) if (!ENEMIES[s.type]) E(`Spawn ${z.id} : ennemi inconnu ${s.type}`);
  for (const d of z.doors || []) if (d.key && !ITEMS[d.key]) E(`Porte ${d.gate} : clé inconnue ${d.key}`);
  for (const p of z.props || []) { if (p.lock && !ITEMS[p.lock]) E(`Maison ${p.id} : clé inconnue ${p.lock}`); if (p.interior && !zonesAll[p.interior]) E(`Maison ${p.id} : intérieur inconnu ${p.interior}`); }
  if (z.respawn && !zonesAll[z.respawn.zone || z.id]) E(`respawn de ${z.id} invalide`);
}
for (const id of Object.keys(NPCS)) { if (!npcPlaced[id]) Wn(`PNJ ${id} défini mais placé dans aucune zone`); }

/* ---------- Objets ---------- */
for (const [id, it] of Object.entries(ITEMS)) {
  if (!it.name) E(`Objet ${id} sans nom`);
  if (!it.desc) Wn(`Objet ${id} sans description`);
  if (!it.icon) E(`Objet ${id} sans icône`); else if (!ICONS.has(it.icon)) E(`Objet ${id} : icône inconnue « ${it.icon} » (retombe sur l’étoile)`);
  if (!it.cat) E(`Objet ${id} sans catégorie`);
  if (it.cat === 'arme' && !(it.atk > 0 && it.wclass)) E(`Arme ${id} incomplète`);
}
for (const cat of Object.keys(UPGRADES)) for (const u of UPGRADES[cat]) for (const m of Object.keys(u.mats)) if (!ITEMS[m]) E(`Amélioration ${cat} : matériau inconnu ${m}`);
for (const [id, r] of Object.entries(RECIPES)) { if (!ITEMS[id]) E(`Recette ${id} inconnue`); for (const m of Object.keys(r.mats)) if (!ITEMS[m]) E(`Recette ${id} : matériau ${m} inconnu`); }

/* ---------- Ennemis ---------- */
for (const [id, e] of Object.entries(ENEMIES)) {
  for (const [d] of e.drops || []) if (!ITEMS[d]) E(`Ennemi ${id} : butin inconnu ${d}`);
  if (!e.name) E(`Ennemi ${id} sans nom`);
  if (!e.desc) Wn(`Ennemi ${id} sans description`);
}
const dropsFrom = {}; for (const [id, e] of Object.entries(ENEMIES)) for (const [d] of e.drops || []) (dropsFrom[d] = dropsFrom[d] || []).push(id);

/* ---------- Boutiques ---------- */
for (const [id, sh] of Object.entries(SHOPS)) {
  if (!NPCS[id]) Wn(`Boutique ${id} sans PNJ du même nom`);
  for (const r of sh.items) {
    if (r.id && !ITEMS[r.id]) E(`Boutique ${id} : objet inconnu ${r.id}`);
    if (r.unlock && !UNLOCK_NAMES[r.unlock]) Wn(`Boutique ${id} : déblocage « ${r.unlock} » sans nom dans UNLOCK_NAMES`);
    if (r.id && ITEMS[r.id] && ITEMS[r.id].price == null && r.price == null) E(`Boutique ${id} : ${r.id} sans prix`);
    if (r.id && ITEMS[r.id] && !(ITEMS[r.id].price > 0) && r.price == null) Wn(`Boutique ${id} : ${r.id} gratuit (prix 0)`);
    if (r.id && ITEMS[r.id] && sh.buyRate && (r.price != null ? r.price : ITEMS[r.id].price) <= (ITEMS[r.id].sell || 0) * sh.buyRate) E(`Boutique ${id} : ${r.id} se vend plus cher qu’il ne s’achète (argent infini)`);
    if (r.icon && !ICONS.has(r.icon)) E(`Boutique ${id} : icône ${r.icon} inconnue`);
  }
}

/* ---------- Quêtes ---------- */
const flagsSet = new Set(), flagsRead = new Set();
const npcSrc = (fn) => (typeof fn === 'function' ? fn.toString() : '');
const refsIn = (src) => {
  const out = { quests: new Set(), flags: new Set(), items: new Set(), steps: [] };
  for (const m of src.matchAll(/q\.quest\(\s*'([a-z0-9_]+)'/g)) out.quests.add(m[1]);
  for (const m of src.matchAll(/S\(\s*q\s*,\s*'([a-z0-9_]+)'\s*,\s*'([a-z0-9_]+)'/g)) { out.quests.add(m[1]); out.steps.push([m[1], m[2]]); }
  for (const m of src.matchAll(/q\.step\(\s*'([a-z0-9_]+)'\s*\)\s*===\s*'([a-z0-9_]+)'/g)) { out.quests.add(m[1]); out.steps.push([m[1], m[2]]); }
  for (const m of src.matchAll(/q\.flag\(\s*'([a-z0-9_]+)'/g)) out.flags.add(m[1]);
  for (const m of src.matchAll(/q\.has\(\s*'([a-z0-9_]+)'/g)) out.items.add(m[1]);
  return out;
};
const checkRefs = (src, where) => {
  const r = refsIn(src);
  r.quests.forEach((q) => { if (!QUESTS[q]) E(`${where} : quête inconnue ${q}`); });
  r.steps.forEach(([q, s]) => { if (QUESTS[q] && !QUESTS[q].steps.some((x) => x.id === s)) E(`${where} : étape inconnue ${q}.${s}`); });
  r.items.forEach((i) => { if (!ITEMS[i]) E(`${where} : objet inconnu ${i}`); });
  r.flags.forEach((f) => flagsRead.add(f));
};
const checkEffects = (list, where) => {
  for (const e of list || []) {
    if (e.start && !QUESTS[e.start]) E(`${where} : start ${e.start} inconnue`);
    if (e.step && !QUESTS[e.step]) E(`${where} : step ${e.step} inconnue`);
    if (e.give && !ITEMS[e.give]) E(`${where} : give ${e.give} inconnu`);
    if (e.take && !ITEMS[e.take]) E(`${where} : take ${e.take} inconnu`);
    if (e.equip && !ITEMS[e.equip]) E(`${where} : equip ${e.equip} inconnu`);
    if (e.shop && !SHOPS[e.shop]) E(`${where} : boutique ${e.shop} inconnue`);
    if (e.open && !gatesAll.has(e.open)) E(`${where} : porte ${e.open} inconnue`);
    if (e.unlock && !UNLOCK_NAMES[e.unlock]) Wn(`${where} : unlock ${e.unlock} sans nom`);
    if (e.flag) flagsSet.add(e.flag);
    if (e.travel) { const t = ISLANDS.find((i) => i.id === e.travel.to); const z = t && t.zones.find((z) => z.id === e.travel.zone); if (!z) E(`${where} : voyage vers ${e.travel.to}/${e.travel.zone} invalide`); }
  }
};
const walkText = (t, where) => {
  const s = typeof t === 'string' ? t : t && t.t;
  if (typeof s !== 'string') { E(`${where} : réplique invalide`); return; }
  if (!s.trim()) E(`${where} : réplique vide`);
  texts.push([where, s]);
};
const texts = [];
const FQ = { flag: () => false, quest: () => 'none', step: () => null, has: () => false, count: () => 1 };
const sayOf = (x) => (typeof x === 'function' ? [].concat(x(FQ), x({ ...FQ, flag: () => true, quest: () => 'done', has: () => true, count: () => 2 })) : x || []);
for (const [id, n] of Object.entries(NPCS)) {
  if (!n.name) E(`PNJ ${id} sans nom`);
  if (!n.talk || !n.talk.length) { E(`PNJ ${id} sans dialogue`); continue; }
  if (n.talk.some((t) => typeof t.if !== 'function')) E(`PNJ ${id} : un sujet sans « if » (plante le dialogue)`);
  { const FA = { flag: () => false, quest: () => 'none', step: () => null, has: () => false, count: () => 0 }; if (!n.talk.some((t) => typeof t.if === 'function' && t.if(FA))) E(`PNJ ${id} : aucun sujet ne répond quand tout est faux (le dialogue plante)`); }
  n.talk.forEach((t, i) => {
    const w = `PNJ ${id}#${i}`;
    if (t.if) checkRefs(npcSrc(t.if), w);
    checkEffects(t.do, w);
    sayOf(t.say).forEach((l, j) => walkText(l, `${w} l.${j}`));
    if (!t.say && !t.choices) Wn(`${w} sans texte ni choix`);
    for (const c of t.choices || []) {
      if (c.if) checkRefs(npcSrc(c.if), w + ' choix');
      checkEffects(c.do, w + ' choix');
      sayOf(c.say).forEach((l, j) => walkText(l, `${w} choix « ${c.t} » l.${j}`));
      texts.push([w + ' choix', c.t]);
    }
  });
}
for (const [id, q] of Object.entries(QUESTS)) {
  const w = `Quête ${id}`;
  if (!q.title || !q.summary) E(`${w} sans titre/résumé`);
  if (q.giver && !NPCS[q.giver]) E(`${w} : donneur inconnu ${q.giver}`);
  if (q.kind === 'side' && !q.giver) E(`${w} : secondaire sans donneur`);
  for (const k of ['requires', 'after']) if (q[k] && !QUESTS[q[k]]) E(`${w} : ${k} ${q[k]} inconnue`);
  if (q.reqItem && !ITEMS[q.reqItem]) E(`${w} : reqItem ${q.reqItem} inconnu`);
  if (q.island && !ISLANDS.some((i) => i.id === q.island)) E(`${w} : île ${q.island} inconnue`);
  const isl = q.island || 'aube';
  const ids = new Set();
  q.steps.forEach((s, i) => {
    if (ids.has(s.id)) E(`${w} : id d’étape en double ${s.id}`); ids.add(s.id);
    if (!s.text) E(`${w}.${s.id} sans texte`);
    if (s.zone && !zonesAll[s.zone]) E(`${w}.${s.id} : zone inconnue ${s.zone}`);
    else if (s.zone && zonesAll[s.zone].island !== isl) Wn(`${w}.${s.id} : zone ${s.zone} appartient à ${zonesAll[s.zone].island}, quête sur ${isl}`);
    if (s.type === 'talk') {
      if (!NPCS[s.npc]) E(`${w}.${s.id} : PNJ inconnu ${s.npc}`);
      else {
        // il faut un sujet qui avance cette étape (effet step: id)
        const ok = NPCS[s.npc].talk.some((t) => (t.do || []).some((e) => e.step === id) || (t.choices || []).some((c) => (c.do || []).some((e) => e.step === id)));
        if (!ok) E(`${w}.${s.id} : aucun dialogue de ${s.npc} n’avance cette étape (effet step:'${id}')`);
        // l'étape doit avoir un sujet dont la condition la cible
        const cond = NPCS[s.npc].talk.some((t) => t.if && (() => { const r = refsIn(npcSrc(t.if)); return r.steps.some(([a, b]) => a === id && b === s.id); })());
        if (!cond) Wn(`${w}.${s.id} : aucun sujet de ${s.npc} ne cible explicitement cette étape (S(q,'${id}','${s.id}'))`);
      }
    }
    if (s.type === 'gates') for (const g of s.gates) if (!gatesAll.has(g)) E(`${w}.${s.id} : porte inconnue ${g}`);
    if (s.type === 'item') { if (!ITEMS[s.item]) E(`${w}.${s.id} : objet inconnu ${s.item}`); }
    if (s.type === 'flag') flagsRead.add(s.flag);
    if (s.type === 'reach' && !zonesAll[s.zone]) E(`${w}.${s.id} : zone ${s.zone} inconnue`);
    if (s.type === 'count' && !['pages', 'shards', 'lampions', 'kills', 'eclats', 'graines', 'fanions'].includes(s.what)) E(`${w}.${s.id} : compteur inconnu ${s.what}`);
    if (s.type === 'kill' && s.enemy && !ENEMIES[s.enemy]) E(`${w}.${s.id} : ennemi inconnu ${s.enemy}`);
    texts.push([`${w}.${s.id}`, s.text]);
  });
  const r = q.rewards || {};
  for (const i of Object.keys(r.items || {})) if (!ITEMS[i]) E(`${w} : récompense inconnue ${i}`);
  for (const u of [].concat(r.unlock || [])) if (!UNLOCK_NAMES[u]) Wn(`${w} : unlock ${u} sans nom`);
  if (q.kind === 'side' && !r.xp && !r.ecus && !r.items) Wn(`${w} sans récompense`);
  texts.push([w + ' titre', q.title], [w + ' résumé', q.summary]);
  // quête secondaire : le donneur doit pouvoir la proposer (sujet avec effet start)
  if (q.kind === 'side' && NPCS[q.giver]) {
    const ok = NPCS[q.giver].talk.some((t) => JSON.stringify(t.do || []).includes(`"start":"${id}"`) || (t.choices || []).some((c) => JSON.stringify(c.do || []).includes(`"start":"${id}"`)));
    if (!ok) E(`${w} : le donneur ${q.giver} n’a aucun dialogue qui la démarre (effet start)`);
  }
  if (q.kind === 'main' && !q.after && !q.requires && id !== 'q_reveil' && id !== 'q_verre') Wn(`${w} : principale sans requires/after`);
}
// quêtes démarrées par un dialogue mais définies pour un autre PNJ
for (const [id, n] of Object.entries(NPCS)) for (const t of n.talk) for (const e of [...(t.do || []), ...(t.choices || []).flatMap((c) => c.do || [])]) if (e.start && QUESTS[e.start] && QUESTS[e.start].giver !== id && QUESTS[e.start].kind === 'side') Wn(`PNJ ${id} démarre ${e.start} dont le donneur est ${QUESTS[e.start].giver}`);

/* ---------- Drapeaux lus mais jamais posés ---------- */
const mainSrc = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8') + fs.readFileSync(new URL('../js/game/combat.js', import.meta.url), 'utf8') + fs.readFileSync(new URL('../js/ui/screens.js', import.meta.url), 'utf8');
for (const f of flagsRead) {
  if (flagsSet.has(f)) continue;
  const re = new RegExp(`flags\\.${f}\\b|flags\\[['"\`]${f}['"\`]\\]|['"\`]${f}['"\`]`);
  if (!re.test(mainSrc) && !JSON.stringify(ISLANDS).includes(`"${f}"`)) E(`Drapeau « ${f} » lu mais jamais posé`);
}
for (const f of [...flagsSet]) if (!flagsRead.has(f) && !mainSrc.includes(f)) Wn(`Drapeau « ${f} » posé mais jamais lu`);

/* ---------- Objets inobtenables ---------- */
const obtainable = new Set();
const addAll = (o) => JSON.stringify(o, (k, v) => { if (k === 'item' || k === 'give') obtainable.add(v); return v; });
addAll(NPCS); for (const I of ISLANDS) for (const z of I.zones) addAll([z.chests, z.pickups]);
for (const q of Object.values(QUESTS)) for (const i of Object.keys((q.rewards || {}).items || {})) obtainable.add(i);
for (const sh of Object.values(SHOPS)) for (const r of sh.items) if (r.id) obtainable.add(r.id);
for (const d of Object.keys(dropsFrom)) obtainable.add(d);
for (const k of Object.keys(RECIPES)) obtainable.add(k);
for (const I of ISLANDS) for (const z of I.zones) for (const d of z.doors || []) if (d.key) 0;
for (const e of Object.values(ENEMIES)) if (e.boss && e.reward) obtainable.add(e.reward);
for (const m of Object.values(ISLAND_META)) if (m.finaleGive) obtainable.add(m.finaleGive);   /* ACTE V */
const srcAll = mainSrc + fs.readFileSync(new URL('../js/game/combat.js', import.meta.url), 'utf8');
for (const id of Object.keys(ITEMS)) if (!obtainable.has(id) && !new RegExp(`['"]${id}['"]|\\b${id}\\b`).test(srcAll)) Wn(`Objet ${id} jamais obtenable (ni boutique, ni coffre, ni butin, ni quête)`);

/* ---------- Textes : typographie ---------- */
const bad = [
  [/(^|[^A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ]+'[A-Za-zÀ-ÿ]/, 'apostrophe droite (utiliser ’)'],
  [/ {2,}/, 'double espace'],
  [/\boeuf\b|\bcoeur\b|\bsoeur\b|\bboeuf\b|\bvoeu\b|\boeil\b/i, 'ligature œ manquante'],
  [/\.\.\.(?!\.)/, 'trois points (utiliser …)'],
  [/\s[,.]/, 'espace avant virgule/point'],
  [/[a-zéèêàù][!?;:](?=\s|$)/, 'espace fine/insécable manquante avant ! ? ; :'],
  [/\b(a la|ete|etait|etaient|deja|apres|meme|tres|presque ca|voila|piece d’or)\b/i, 'accent manquant probable'],
  [/\b(un|une|le|la|les) (eclat|eclats|ecu|ecus|epee|epees|ile|iles|foret|lumiere|lumiere)\b/i, 'accent manquant probable (nom)'],
  [/undefined|\[object|NaN|TODO|FIXME|XXX/, 'texte technique'],
];
for (const [where, s] of texts) {
  if (typeof s !== 'string') continue;
  for (const [re, why] of bad) { if (re.test(s) && !(why.startsWith('espace fine') && /https?:|\d:\d/.test(s))) Wn(`Texte (${where}) : ${why} → « ${s.slice(Math.max(0, s.search(re) - 15), s.search(re) + 40)} »`); }
  if (s.length > 700) Wn(`Texte (${where}) très long (${s.length} car.)`);
}
// textes des objets / ennemis / îles
for (const [id, it] of Object.entries(ITEMS)) for (const k of ['name', 'desc']) if (it[k]) for (const [re, why] of bad) if (re.test(it[k])) Wn(`Objet ${id}.${k} : ${why} → « ${it[k].slice(0, 70)} »`);
for (const [id, e] of Object.entries(ENEMIES)) for (const k of ['name', 'desc']) if (e[k]) for (const [re, why] of bad) if (re.test(e[k])) Wn(`Ennemi ${id}.${k} : ${why} → « ${e[k].slice(0, 70)} »`);
for (const I of ISLANDS) for (const z of I.zones) for (const p of z.props || []) for (const k of ['text', 'name', 'closed']) if (p[k]) for (const [re, why] of bad) if (re.test(p[k])) Wn(`Zone ${z.id} prop ${p.id || p.t}.${k} : ${why} → « ${p[k].slice(0, 70)} »`);

console.log(`SAVE_VERSION=${SAVE_VERSION} · objets ${Object.keys(ITEMS).length} · quêtes ${Object.keys(QUESTS).length} · PNJ ${Object.keys(NPCS).length} · ennemis ${Object.keys(ENEMIES).length} · portes ${gatesAll.size}`);
console.log(`\nERREURS (${err.length})`); err.forEach((m) => console.log(' ✗', m));
console.log(`\nAVERTISSEMENTS (${warn.length})`); warn.forEach((m) => console.log(' !', m));
process.exit(err.length ? 1 : 0);
