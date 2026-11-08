/* LUMEN — contrôle d'accessibilité des coffres, objets, PNJ, ennemis, objets de lumière et poteaux de toutes les îles.
   node tools/reach.mjs */
import { ISLANDS, ISLAND_META } from '../js/levels.js';
import { checkIsland } from './reachlib.mjs';

let bad = 0;
for (const def of ISLANDS) {
  const r = checkIsland(def, (ISLAND_META[def.id] || {}).town);
  console.log(`${def.name} : ${r.cells} cases accessibles, ${r.posts} poteau(x) de grappin`);
  console.log(`  ${r.notes.length} élément(s) derrière des ronces ou des roches fissurées (arme requise)${process.argv.includes('-v') ? ' :' : ' — liste avec -v'}`);
  if (process.argv.includes('-v')) r.notes.forEach((n) => console.log('  · ' + n));
  r.problems.forEach((p) => { bad++; console.log('  ✗ ' + p); });
}
console.log(bad ? `${bad} problème(s)` : '✓ coffres, objets, PNJ, ennemis et objets de lumière tous accessibles');
process.exit(bad ? 1 : 0);
