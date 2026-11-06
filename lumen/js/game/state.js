/* =========================================================
   LUMEN — état d'une partie (ce qui est sauvegardé) et calculs
   dérivés (statistiques, apparence). Format versionné : v.
   ========================================================= */
import { ITEMS, UPGRADES, isStackable } from '../data/items.js';
import { DEFAULT_LOOK, HAIR_COLORS, SKIN, EYES, CLOAK_COLORS, TRIMS, HEIGHTS, byId } from '../data/looks.js';

export const SAVE_VERSION = 5;

/* Monde d'une île : tout ce qui change quand on joue (une île = un monde, voir otherWorlds) */
export const newWorld = (firstWarp) => ({ dev: {}, gates: {}, picked: {}, cut: {}, broken: {}, chests: {}, lamps: {}, warps: firstWarp ? { [firstWarp]: 1 } : {}, killed: {} });

export function newState() {
  return {
    v: SAVE_VERSION, created: Date.now(), updated: Date.now(), playTime: 0, name: 'Lyra',
    player: { island: 'aube', zone: 'havre', x: null, z: null, face: 0, hp: 100, en: 60, lvl: 1, xp: 0, ecus: 20, fragments: 0, abilities: {}, respawn: { zone: 'havre', cell: [6, 6] } },
    look: Object.assign({}, DEFAULT_LOOK),
    unlocks: {},
    inv: {},          // id → quantité
    gear: {},         // id → niveau d'amélioration
    equip: { weapon: null, armor: null, acc1: null, acc2: null, quick: 'potion' },
    quests: {},       // id → { state: 'active' | 'done', step, base: {} }
    flags: {},
    world: newWorld('havre'),
    shops: {},
    otherWorlds: {},  // monde (énigmes, coffres, objets ramassés…) des îles où l'on n'est pas en ce moment
    stats: { kills: 0, deaths: 0, killsBy: {}, chests: 0, dmgDealt: 0 },
    seen: {},
  };
}

/* Partie de la version 0.2 (énigmes seules) → aventure */
export function fromRun(run) {
  const st = newState();
  st.world.dev = Object.assign({}, run.dev || {});
  st.world.gates = Object.assign({}, run.gates || {});
  st.world.picked = Object.assign({}, run.picked || {});
  st.playTime = run.time || 0;
  st.migrated = true;
  return st;
}

/* Complète une sauvegarde plus ancienne ou partielle (champs ajoutés au fil des versions) */
export function normalize(raw) {
  const st = newState();
  if (!raw || typeof raw !== 'object') return st;
  const deep = (base, src) => { Object.keys(src || {}).forEach((k) => { if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) deep(base[k], src[k]); else base[k] = src[k]; }); return base; };
  deep(st, raw);
  st.v = SAVE_VERSION;
  return st;
}

/* ---------- Inventaire ---------- */
export const count = (st, id) => st.inv[id] || 0;
export function addItem(st, id, n = 1) {
  if (!ITEMS[id]) return 0;
  if (!isStackable(id) && st.inv[id]) return 0;   // objet unique déjà possédé
  st.inv[id] = (st.inv[id] || 0) + (isStackable(id) ? n : 1);
  if (['arme', 'armure'].includes(ITEMS[id].cat) && st.gear[id] === undefined) st.gear[id] = 0;
  return n;
}
export function takeItem(st, id, n = 1) {
  if ((st.inv[id] || 0) < n) return false;
  st.inv[id] -= n; if (st.inv[id] <= 0) delete st.inv[id];
  ['weapon', 'armor', 'acc1', 'acc2'].forEach((s) => { if (st.equip[s] === id && !st.inv[id]) st.equip[s] = null; });
  return true;
}

/* ---------- Niveau et statistiques ---------- */
export const xpFor = (lvl) => Math.round(70 * Math.pow(lvl, 1.6));
export function stats(st) {
  const p = st.player, L = p.lvl;
  const w = ITEMS[st.equip.weapon], a = ITEMS[st.equip.armor];
  const accs = [st.equip.acc1, st.equip.acc2].map((id) => ITEMS[id]).filter(Boolean);
  const wl = w ? st.gear[st.equip.weapon] || 0 : 0, al = a ? st.gear[st.equip.armor] || 0 : 0;
  const s = {
    maxHp: 100 + (L - 1) * 8 + p.fragments * 15 + accs.reduce((n, x) => n + (x.hp || 0), 0),
    maxEn: 60 + (L - 1) * 4 + accs.reduce((n, x) => n + (x.en || 0), 0),
    atk: w ? Math.round(w.atk * (1 + (wl ? UPGRADES.arme[wl - 1].bonus : 0)) + (L - 1) * 0.8) : 2 + (L - 1),
    def: (a ? a.def + (al ? UPGRADES.armure[al - 1].bonus : 0) : 0) + Math.floor((L - 1) / 3),
    speed: 1 + (a && a.speed ? a.speed : 0) + accs.reduce((n, x) => n + (x.speed || 0), 0),
    regen: 6 + accs.reduce((n, x) => n + (x.regen || 0) * 8, 0),
    resBrume: accs.reduce((n, x) => n + (x.resBrume || 0), 0),
    weapon: w || null, weaponId: st.equip.weapon, weaponLvl: wl,
  };
  return s;
}

/* ---------- Apparence : identifiants → couleurs du modèle ---------- */
export function lookToModel(look) {
  const L = Object.assign({}, DEFAULT_LOOK, look);
  return {
    hair: L.hair, hairHex: byId(HAIR_COLORS, L.hairColor).hex, skinHex: byId(SKIN, L.skin).hex, eyeHex: byId(EYES, L.eyes).hex,
    outfit: L.outfit, cloakHex: byId(CLOAK_COLORS, L.cloak).hex, trimHex: byId(TRIMS, L.trim).hex,
    tunicHex: L.outfit === 'aube' ? '#e9e2f5' : L.outfit === 'chasseur' ? '#4b4458' : L.outfit === 'exploratrice' ? '#e9dcc2' : '#e9e2f5',
    acc: L.acc, hood: L.hood, scale: byId(HEIGHTS, L.height).k,
  };
}
export const isUnlocked = (st, unlock) => !unlock || !!st.unlocks[unlock];
