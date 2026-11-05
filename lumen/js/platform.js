/* =========================================================
   LUMEN — adaptateur de plateforme.
   Sur le site : progression, compte et récompenses de Prism Arcade (window.PA).
   Pour la future application PC / mobile : remplacer ce seul fichier
   (sauvegarde locale ou compte Studio Prism direct) sans toucher au jeu.

   Données (Prism Arcade, jeu « lumen ») :
     extra  : drapeaux de récompenses déjà données (fusion sans doublon entre appareils)
              « g:<île>:<porte> », « s:<île>:<éclat> », « done:<île> »
     data   : partie en cours par île { dev, gates, shards, time } et meilleur temps « best:<île> »
     best   : nombre total d'énigmes résolues (affiché dans Prism Arcade)
   ========================================================= */
const PA = window.PA || null;
const ID = 'lumen';
const LOCAL = 'lumen.local.v1';

function stats() {
  if (PA) return PA.gameStats(ID);
  try { return JSON.parse(localStorage.getItem(LOCAL)) || { best: 0, plays: 0, extra: {}, data: {} }; } catch (e) { return { best: 0, plays: 0, extra: {}, data: {} }; }
}
function commit(st) {
  if (PA) { PA.save(); return; }
  try { localStorage.setItem(LOCAL, JSON.stringify(st)); } catch (e) { /* rien */ }
}

export const platform = {
  available: !!PA,
  muted: () => (PA ? !!PA.state().muted : false),
  toggleMute: () => (PA ? PA.toggleMute() : false),
  playerName: () => (PA ? PA.state().name : 'Voyageur'),
  account: () => (PA && PA.cloud ? PA.cloud.status : 'out'),
  onChange: (fn) => { if (PA) { PA.on('change', fn); PA.on('cloud', fn); } },

  loadRun(island) { const st = stats(); return (st.data.runs || {})[island] || null; },
  saveRun(island, run) { const st = stats(); st.data.runs = st.data.runs || {}; st.data.runs[island] = run; commit(st); },
  clearRun(island) { const st = stats(); if (st.data.runs) delete st.data.runs[island]; commit(st); },
  flag: (k) => !!stats().extra[k],
  bestTime(island) { return stats().data['best:' + island] || 0; },
  startSession() { const st = stats(); st.plays = (st.plays || 0) + 1; commit(st); },

  /* Récompense UNE seule fois par drapeau (k). Renvoie les gains, ou null si déjà donnée. */
  reward(k, xp, coins) {
    const st = stats();
    if (st.extra[k]) return null;
    st.extra[k] = 1;
    if (k.startsWith('g:')) st.best = Object.keys(st.extra).filter((x) => x.startsWith('g:')).length;
    if (PA) return PA.award(xp, coins);
    commit(st);
    return { xp, coins, levelUp: 0, levelRewards: [] };
  },
  finish(island, seconds) {
    const st = stats(), k = 'best:' + island;
    const better = !st.data[k] || seconds < st.data[k];
    if (better) st.data[k] = Math.round(seconds);
    commit(st);
    return better;
  },
  level: () => (PA ? PA.levelInfo() : null),
};
