/* LUMEN — contrôle d'accessibilité d'une île (partagé par build-*.mjs et reach.mjs).
   Toutes les portes et tous les ponts sont ouverts ; le grappin relie les poteaux (logic.js : postLinks).
   « cut » = ronces et roches fissurées franchissables (lame / marteau obtenus). */
import { buildIsland, reachCells, postLinks, ventLinks } from '../js/logic.js';

export function checkIsland(def, town) {
  const isl = buildIsland(def);
  Object.values(isl.gates).forEach((g) => (g.open = true));
  const townZ = def.zones.find((z) => z.id === town) || def.zones[0];
  const starts = [[townZ.ox + Math.floor(townZ.spawn[0]), townZ.oy + Math.floor(townZ.spawn[1])]];
  def.zones.filter((z) => z.interior).forEach((z) => starts.push([z.ox + z.spawn[0], z.oy + z.spawn[1]]));
  const free = reachCells(isl, starts, { cut: false }), cut = reachCells(isl, starts, { cut: true });
  const problems = [], notes = [];
  const near = (set, x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => set.has((Math.floor(x) + a) + ',' + (Math.floor(y) + b)));
  const check = (label, x, y) => {
    if (!near(cut, x, y)) problems.push(`${label} (${x}, ${y}) INACCESSIBLE même avec lame, marteau et grappin`);
    else if (!near(free, x, y)) notes.push(`${label} (${x}, ${y}) derrière des ronces ou des roches (arme requise)`);
  };
  def.zones.forEach((z) => {
    check(`arrivée de ${z.id}`, z.ox + Math.floor(z.spawn[0]), z.oy + Math.floor(z.spawn[1]));
    (z.chests || []).forEach((c) => check(`coffre ${c.id}`, z.ox + c.x, z.oy + c.y));
    (z.pickups || []).forEach((c) => check(`objet ${c.id}`, z.ox + c.x, z.oy + c.y));
    (z.npcs || []).filter((n) => !n.counter).forEach((n) => check(`PNJ ${n.id}`, z.ox + n.x, z.oy + n.y));
    (z.spawns || []).forEach((s) => check(`ennemi ${s.type}`, z.ox + s.x, z.oy + s.y));
    (z.props || []).filter((p) => p.door).forEach((p) => check(`porte ${p.id}`, z.ox + p.door[0], z.oy + p.door[1]));
  });
  isl.ents.forEach((e) => {
    if (['shard', 'page', 'wisp'].includes(e.t)) check(`${e.t} ${e.id}`, e.x, e.y);
    if (e.rot) { const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => cut.has((e.x + a) + ',' + (e.y + b))); if (!ok) problems.push(`objet orientable ${e.id} hors de portée (${e.x}, ${e.y})`); }
    if (e.t === 'post' || e.t === 'vent') {
      const links = (e.t === 'vent' ? ventLinks : postLinks)(isl, e);
      if (!links.length) problems.push(`poteau ${e.id} (${e.x}, ${e.y}) sans liaison`);
      links.forEach((l) => { if (!l.to.id) problems.push('poteau sans id'); });
    }
  });
  // chaque poteau doit pouvoir être atteint à pied depuis une case voisine, et le retour doit exister (liens symétriques)
  isl.ents.filter((e) => e.t === 'post' || e.t === 'vent').forEach((p) => {
    const lk = p.t === 'vent' ? ventLinks : postLinks;
    lk(isl, p).forEach((l) => { if (!lk(isl, l.to).some((b) => b.to === p)) problems.push(`liaison à sens unique ${p.id} → ${l.to.id}`); });
  });
  return { problems, notes, cells: cut.size, posts: isl.ents.filter((e) => e.t === 'post' || e.t === 'vent').length };
}
