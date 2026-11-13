/* =========================================================
   LUMEN — complétion de l’archipel (Acte VI).
   Chaque île a sa complétion (main.js : completion(), pour l’île où l’on se trouve). Pour les autres îles,
   on la recalcule ici à partir de leurs données statiques et de l’état sauvegardé (st.otherWorlds).
   Pur : aucune dépendance au navigateur.
   ========================================================= */
export function islandCompletion(def, meta, w, st, QUESTS) {
  if (!w) return 0;
  const mine = (k) => (QUESTS[k].island || 'aube') === def.id;
  const mainQ = Object.keys(QUESTS).filter((k) => QUESTS[k].kind === 'main' && mine(k));
  const sideQ = Object.keys(QUESTS).filter((k) => QUESTS[k].kind === 'side' && mine(k));
  const done = (k) => st.quests[k] && st.quests[k].state === 'done';
  const gates = (w && w.gates) || {};
  const mainGates = def.zones.filter((z) => !z.secret && !z.area).map((z) => (z.ents || []).find((e) => e.gate && !e.optional)).filter(Boolean).map((e) => e.gate);
  const secretGates = def.zones.filter((z) => z.secret).map((z) => z.barrier);
  const chests = def.zones.flatMap((z) => (z.chests || []).map((c) => c.id));
  const shards = def.zones.reduce((n, z) => n + (z.ents || []).filter((e) => e.t === 'shard').length, 0);
  const picked = w.picked || {};
  const shardsGot = Object.keys(picked).filter((k) => picked[k] && /^shard/.test(k)).length;
  const pages = Object.keys(def.pages || {});
  const pagesGot = pages.filter((p) => picked['page_' + p] || Object.keys(picked).some((k) => picked[k] && k.includes(p))).length;
  const parts = [
    [mainQ.filter(done).length, mainQ.length, 25],
    [mainGates.filter((g) => gates[g]).length, mainGates.length, 15],
    [secretGates.filter((g) => gates[g]).length, secretGates.length, 8],
    [sideQ.filter(done).length, sideQ.length, 22],
    [Math.min(shards, shardsGot), shards, 8],
    [pagesGot, pages.length, 6],
    [chests.filter((c) => (w.chests || {})[c]).length, chests.length, 8],
    [st.flags[meta.boss] ? 1 : 0, 1, 2],
  ];
  const wsum = parts.reduce((a, [, , k]) => a + k, 0);
  return Math.floor(parts.reduce((a, [n, t, k]) => a + (t ? (n / t) * k : k), 0) / wsum * 100);
}

/* total : moyenne sur toutes les îles du jeu ; current : { id, pct } calculé par main.js pour l’île en cours */
export function globalCompletion(ISLANDS, META, st, QUESTS, current) {
  const islands = ISLANDS.map((def) => {
    const pct = def.id === current.id ? current.pct : islandCompletion(def, META[def.id], (st.otherWorlds || {})[def.id], st, QUESTS);
    return { id: def.id, name: def.name, pct };
  });
  const total = Math.floor(islands.reduce((a, i) => a + i.pct, 0) / Math.max(1, islands.length));
  return { total, islands };
}
