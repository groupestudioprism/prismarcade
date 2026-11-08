/* =========================================================
   LUMEN — sauvegardes : 4 emplacements (auto, s1, s2, s3).
   Toujours sur l'appareil (localStorage) ; en plus sur le compte
   Studio Prism quand on est connecté (Firestore lumenSaves/{uid}/slots/{slot},
   voir les règles 32-lumen.rules). Au chargement, la version la plus récente gagne.
   ========================================================= */
import { store } from '../engine/util.js';
import { normalize, SAVE_VERSION } from './state.js';

export const SLOTS = ['auto', 's1', 's2', 's3'];
const PA = window.PA || null;
const uid = () => (PA && PA.cloud && PA.cloud.status === 'in' && PA.cloud.user ? PA.cloud.user.uid : null);
const localKey = (slot) => `lumen.save.${uid() || 'local'}.${slot}`;

function meta(st, regionName) {
  return {
    v: SAVE_VERSION, name: String(st.name || 'Lyra').slice(0, 30), region: String(regionName || '').slice(0, 40),
    level: Math.max(0, Math.min(999, st.player.lvl | 0)), playTime: Math.max(0, Math.round(st.playTime)),
    completion: Math.max(0, Math.min(100, Math.round((st.completion || 0) * 10) / 10)),
  };
}

export const saves = {
  cloudReady: () => !!(uid() && PA.cloud.store),
  /* écrit l'emplacement (local tout de suite, compte ensuite) */
  async write(slot, st, regionName, { cloud = true } = {}) {
    st.updated = Date.now();
    const m = meta(st, regionName);
    store.set(localKey(slot), { meta: Object.assign({ updated: st.updated }, m), data: st });
    if (!cloud || !this.cloudReady()) return { local: true, cloud: false };
    try {
      await PA.cloud.store.set(`lumenSaves/${uid()}/slots/${slot}`, Object.assign({}, m, { data: JSON.stringify(st), device: (navigator.platform || '').slice(0, 40) }));
      return { local: true, cloud: true };
    } catch (e) {
      console.warn('[Lumen] sauvegarde en ligne impossible :', e.code || e);
      return { local: true, cloud: false, error: e.code || 'error' };
    }
  },
  /* résumé des emplacements (le plus récent entre appareil et compte) */
  async list() {
    const out = {};
    SLOTS.forEach((s) => { const l = store.get(localKey(s)); if (l && l.meta) out[s] = Object.assign({ where: 'local' }, l.meta); });
    if (this.cloudReady()) {
      try {
        const docs = await PA.cloud.store.list(`lumenSaves/${uid()}/slots`);
        docs.forEach((d) => {
          const upd = d.updatedAt && d.updatedAt.toMillis ? d.updatedAt.toMillis() : 0;
          if (!out[d.id] || upd > (out[d.id].updated || 0) + 2000) out[d.id] = { where: 'cloud', updated: upd, name: d.name, region: d.region, level: d.level, playTime: d.playTime, completion: d.completion, _data: d.data };
          else out[d.id].synced = true;
        });
      } catch (e) { console.warn('[Lumen] liste en ligne indisponible :', e.code || e); }
    }
    return out;
  },
  async read(slot) {
    const list = await this.list();
    const m = list[slot];
    if (!m) return null;
    const usable = (d) => !!d && typeof d === 'object' && !Array.isArray(d) && !!d.player && typeof d.player === 'object';   // une sauvegarde sans joueur n'est pas une sauvegarde
    if (m.where === 'cloud' && m._data) { try { const d = JSON.parse(m._data); return usable(d) ? normalize(d) : null; } catch (e) { return null; } }
    const l = store.get(localKey(slot));
    return l && usable(l.data) ? normalize(l.data) : null;
  },
  /* la sauvegarde la plus récente, tous emplacements confondus */
  async latest() {
    const list = await this.list();
    const best = Object.entries(list).sort((a, b) => (b[1].updated || 0) - (a[1].updated || 0))[0];
    return best ? { slot: best[0], meta: best[1] } : null;
  },
  async remove(slot) {
    store.del(localKey(slot));
    if (this.cloudReady()) { try { await PA.cloud.store.del(`lumenSaves/${uid()}/slots/${slot}`); } catch (e) { /* rien */ } }
  },
};
