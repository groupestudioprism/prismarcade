/* LUMEN — contrôle d'accessibilité des coffres, objets et sorties des zones d'aventure.
   Parcours de la grille depuis l'entrée de chaque zone : « r » (ronces) ne se franchit qu'avec une lame. */
import aube from '../js/islands/aube.js';
const d = aube.default || aube;
const WALK = new Set(['.', ',', 'c', 'x']); // « x » et « c » : portes scellées ou à clé, ouvertes par le jeu
let bad = 0;
for (const z of d.zones) {
  if (!z.map || !z.spawn || !z.chests) continue;
  const H = z.map.length, W = Math.max(...z.map.map((r) => r.length));
  const at = (x, y) => (z.map[y] || '')[x] || ' ';
  const bfs = (thorns) => {
    const seen = new Set(), q = [[Math.floor(z.spawn[0]), Math.floor(z.spawn[1])]];
    while (q.length) {
      const [x, y] = q.pop(); const k = x + ',' + y;
      if (x < 0 || y < 0 || x >= W || y >= H || seen.has(k)) continue;
      const c = at(x, y); if (!(WALK.has(c) || (thorns && c === 'r'))) continue;
      seen.add(k); q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return seen;
  };
  const free = bfs(false), cut = bfs(true);
  const check = (label, x, y) => {
    const ok = (set) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => set.has(Math.floor(x) + a + ',' + (Math.floor(y) + b)));
    if (!ok(cut)) { bad++; console.log(`  ✗ ${z.id} : ${label} (${x},${y}) INACCESSIBLE même avec une lame (case « ${at(Math.floor(x), Math.floor(y))} »)`); }
    else if (!ok(free)) console.log(`  · ${z.id} : ${label} (${x},${y}) derrière des ronces (lame requise)`);
  };
  (z.chests || []).forEach((c) => check('coffre ' + c.id, c.x, c.y));
  (z.pickups || []).forEach((c) => check('objet ' + c.id, c.x, c.y));
}
console.log(bad ? `${bad} élément(s) inaccessible(s)` : '✓ coffres et objets tous accessibles');
process.exit(bad ? 1 : 0);
