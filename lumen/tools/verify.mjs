/* =========================================================
   LUMEN — vérification de toutes les îles (à lancer avant chaque publication).
   node tools/verify.mjs
   ========================================================= */
import { ISLANDS } from '../js/levels.js';
import { buildIsland, evaluate, walkable } from '../js/logic.js';
import { analyse } from './generate.mjs';

let fail = 0;
const bad = (m) => { console.log('  ✗ ' + m); fail++; };
for (const def of ISLANDS) {
  console.log(`${def.name}`);
  let devices = 0;
  for (const z of def.zones) {
    const gates = [...new Set(z.ents.filter((e) => e.gate && !e.optional).map((e) => e.gate))];
    const opt = z.ents.filter((e) => e.optional).map((e) => e.gate);
    const an = analyse(z.map, z.ents, gates, { barrier: z.barrier });
    devices += an.rots.length;
    if (an.escape) bad(`${z.title} : un faisceau sort de la zone`);
    if (!an.sols.length) bad(`${z.title} : aucune solution`);
    if (an.initialSolved) bad(`${z.title} : déjà résolue au départ`);
    opt.forEach((g) => { const o = analyse(z.map, z.ents, [g], { barrier: z.barrier }); if (!o.sols.length || o.initialSolved) bad(`${z.title} : cristal facultatif ${g} invalide`); });
  }
  // île complète : toutes portes ouvertes, tout doit être accessible depuis le départ
  const isl = buildIsland(def);
  Object.values(isl.gates).forEach((g) => (g.open = true));
  const st = isl.ents.find((e) => e.t === 'start');
  const seen = new Set([st.x + ',' + st.y]), q = [[st.x, st.y]];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && walkable(isl, x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
  isl.ents.filter((e) => ['shard', 'page', 'wisp'].includes(e.t)).forEach((e) => { if (!seen.has(e.x + ',' + e.y)) bad(`objet ${e.t} inaccessible (${e.x}, ${e.y})`); });
  isl.ents.filter((e) => e.rot).forEach((e) => { if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)))) bad(`objet orientable hors de portée (${e.x}, ${e.y})`); });
  def.zones.forEach((z) => { if (!seen.has((z.ox + z.spawn[0]) + ',' + (z.oy + z.spawn[1]))) bad(`arrivée de ${z.title} inaccessible`); });
  const count = (t) => isl.ents.filter((e) => e.t === t).length;
  const main = def.zones.filter((z) => !z.secret).length, sec = def.zones.filter((z) => z.secret).length;
  console.log(`  ${main} zones principales, ${sec} chambres secrètes, ${devices} objets orientables, ${count('shard')} éclats, ${count('page')} pages, ${count('wisp')} lueur`);
  console.log(`  ${fail ? '✗ ' + fail + ' problème(s)' : '✓ toutes les énigmes sont valides, tout est accessible'}`);
}
process.exit(fail ? 1 : 0);
