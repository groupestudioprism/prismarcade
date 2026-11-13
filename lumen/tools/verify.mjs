/* =========================================================
   LUMEN — vérification de toutes les îles (à lancer avant chaque publication).
   node tools/verify.mjs
   ========================================================= */
import { ISLANDS } from '../js/levels.js';
import { buildIsland, evaluate, walkable, reachCells } from '../js/logic.js';
import { analyse, analyseStages } from './generate.mjs';
import { analysePuzzles } from './analyse-abysses.mjs';   /* ACTE IV */

let fail = 0;
const bad = (m) => { console.log('  ✗ ' + m); fail++; };
for (const def of ISLANDS) {
  console.log(`${def.name}`);
  let devices = 0;
  for (const z of def.zones) {
    if (z.puzzle) {   /* ACTE IV : salles à eau miroir / vannes / orbe : exploration par états (voir tools/analyse-abysses.mjs) */
      analysePuzzles(z).forEach((r) => { devices += r.devices; r.problems.forEach((m) => bad(`${r.label} : ${m}`)); });
      continue;
    }
    if (z.area && !z.ents.some((e) => e.rot)) continue;   // zone d'aventure sans énigme de lumière
    if (z.stages) {   // énigme à plusieurs étapes (Phare de Verre)
      const r = analyseStages({ map: z.map, ents: z.ents, doors: z.doors, entry: z.spawn }, z.stages, z.final);
      devices += r.rots;
      if (r.escape) bad(`${z.title} : un faisceau sort de la zone`);
      if (r.shortcut) bad(`${z.title} : la balise peut s'allumer portes fermées`);
      r.stages.forEach((s) => { if (!s.sols) bad(`${z.title} : étape ${s.gate} sans solution`); if (s.initialSolved) bad(`${z.title} : étape ${s.gate} déjà résolue au départ`); });
      continue;
    }
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
  // ronces et roches fissurées : franchissables une fois l'arme obtenue
  for (let y = 0; y < isl.h; y++) for (let x = 0; x < isl.w; x++) if (isl.terrain[y][x] === 'r' || isl.terrain[y][x] === 'c') isl.terrain[y][x] = ',';
  const st = isl.ents.find((e) => e.t === 'start');
  // les intérieurs sont reliés par des portes (téléportation) : on part aussi de leur entrée ; grappin compris
  const starts = [[st.x, st.y]];
  def.zones.filter((z) => z.interior).forEach((z) => starts.push([z.ox + z.spawn[0], z.oy + z.spawn[1]]));
  const seen = new Set();   /* ACTE IV : vannes réversibles : on réunit les deux niveaux */
  [0, 1].forEach((v) => { Object.values(isl.valves || {}).forEach((e) => (e.state = v)); reachCells(isl, starts).forEach((k) => seen.add(k)); });
  isl.ents.filter((e) => ['shard', 'page', 'wisp'].includes(e.t)).forEach((e) => { if (!seen.has(e.x + ',' + e.y)) bad(`objet ${e.t} inaccessible (${e.x}, ${e.y})`); });
  isl.ents.filter((e) => e.rot).forEach((e) => { if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)))) bad(`objet orientable hors de portée (${e.x}, ${e.y})`); });
  def.zones.forEach((z) => { if (!seen.has((z.ox + z.spawn[0]) + ',' + (z.oy + z.spawn[1]))) bad(`arrivée de ${z.title} inaccessible`); });
  const count = (t) => isl.ents.filter((e) => e.t === t).length;
  const main = def.zones.filter((z) => !z.secret && !z.area).length, sec = def.zones.filter((z) => z.secret).length;
  console.log(`  ${def.zones.filter((z) => z.area).length} zones d'aventure (village, lande, sanctuaire, intérieurs)`);
  console.log(`  ${main} zones principales, ${sec} chambres secrètes, ${devices} objets orientables, ${count('shard')} éclats, ${count('page')} pages, ${count('wisp')} lueur`);
  console.log(`  ${fail ? '✗ ' + fail + ' problème(s)' : '✓ toutes les énigmes sont valides, tout est accessible'}`);
}
process.exit(fail ? 1 : 0);
