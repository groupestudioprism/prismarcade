/* =========================================================
   LUMEN — île de TEST du relief : « Montagne d'essai ».
   node tools/build-test-montagne.mjs  →  écrit js/islands/test-montagne.js
   NON listée dans ISLANDS (js/levels.js) : chargeable seulement par  ?ile=test-montagne  (ou ?island=test-montagne).
   Elle sert de modèle d'écriture (map + hmap) pour bâtir une montagne : trois terrasses (niveaux 0, 4 et 8 ; 1 niveau = 0,75),
   un escalier (A → B, 2 cases de large entre deux falaises), une rampe (B → C, 4 cases de large), des falaises, une maison et des
   arbres devant le joueur (trou de visibilité), un PNJ, un ennemi, un coffre, une lanterne + un miroir + un cristal sur la terrasse C.
   Repère : x vers la droite (est), y vers le bas (sud) ; la caméra est au sud : le haut de l'écran est le nord, la montagne monte vers le nord.
   ========================================================= */
import { writeFileSync } from 'node:fs';
import { grid, rect, rim, toRows, hash } from './areas.mjs';
import { analyse } from './generate.mjs';
import { checkIsland } from './reachlib.mjs';
import { levelOfChar } from '../js/altitude.js';

const W = 24, H = 26;
const g = grid(W, H);
const lv = Array.from({ length: H }, () => Array(W).fill(0));
const terrace = (x0, y0, x1, y1, level) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { g[y][x] = '.'; lv[y][x] = level; } };

terrace(3, 1, 20, 5, 8);        // C : sommet (niveau 8 = 6 unités)
terrace(2, 6, 21, 15, 4);       // B : terrasse médiane (niveau 4 = 3 unités)
terrace(2, 16, 21, 24, 0);      // A : plaine du bas (niveau 0)
// rampe B → C (4 cases de large, 3 cases de long : niveaux 7, 6, 5 — un niveau par case)
for (let x = 14; x <= 17; x++) { lv[6][x] = 7; lv[7][x] = 6; lv[8][x] = 5; }
// escalier A → B (2 cases de large : niveaux 1, 2, 3 de bas en haut) ; de part et d'autre, B reste à 4 : falaise de 3 à 4 niveaux
for (let x = 10; x <= 11; x++) { lv[15][x] = 1; lv[14][x] = 2; lv[13][x] = 3; }
rim(g, 5, 0.45);   // roches et arbres sur les bords qui touchent le vide
// chemins
for (let y = 16; y <= 23; y++) { g[y][10] = ','; g[y][11] = ','; }
for (let y = 6; y <= 15; y++) { if (g[y][10] === '.') g[y][10] = ','; if (g[y][11] === '.') g[y][11] = ','; }
for (let x = 6; x <= 17; x++) if (g[9][x] === '.') g[9][x] = ',';
for (let y = 6; y <= 8; y++) for (let x = 14; x <= 17; x++) g[y][x] = ',';
for (let y = 2; y <= 5; y++) for (let x = 4; x <= 19; x++) if (hash(x, y, 8) < 0.22 && g[y][x] === '.') g[y][x] = ',';
// décor : maison devant le joueur (au sud de son point de départ), arbres
const props = [];
const house = (id, x, y, w, h, extra) => { rect(g, x, y, w, h, 'H'); props.push(Object.assign({ t: 'house', id, x, y, w, h }, extra)); };
house('abri', 8, 19, 4, 2, { style: 'bois', door: [10, 21], side: 'S', name: 'Abri' });
[[5, 18], [15, 18], [16, 20], [4, 22], [18, 22], [6, 11], [18, 12], [4, 3], [19, 4]].forEach(([x, y]) => { if (g[y][x] === '.') g[y][x] = 'T'; });
// garantir : les marches, la rampe et les couloirs restent libres
[[10, 13], [11, 13], [10, 14], [11, 14], [10, 15], [11, 15], [10, 17], [11, 17]].forEach(([x, y]) => { if (g[y][x] === 'T' || g[y][x] === '#') g[y][x] = ','; });
for (let y = 6; y <= 8; y++) for (let x = 14; x <= 17; x++) if (g[y][x] === 'T' || g[y][x] === '#') g[y][x] = ',';

const map = toRows(g);
const CH = '0123456789abcdefghijklmnopqrstuvwxyz';
const hmap = lv.map((row, y) => row.map((v, x) => (map[y][x] === ' ' ? ' ' : CH[v])).join(''));
hmap.forEach((r, y) => r.split('').forEach((c, x) => { if (c !== ' ' && levelOfChar(c) !== lv[y][x]) throw new Error('hmap incohérente'); }));

const ents = [
  { t: 'start', x: 10, y: 17 },
  { t: 'lantern', x: 5, y: 3, dir: 'E', rot: true },
  { t: 'mirror', x: 10, y: 3, state: 0, rot: true },
  { t: 'receiver', x: 10, y: 5, color: 'w', gate: 'g_c' },
];
const zone = {
  id: 'base', region: 'base', title: 'Montagne d’essai', num: 0, secret: false, ox: 0, oy: 0, spawn: [10, 17], entry: [10, 17],
  hint: 'Terrasses, escalier, rampe, falaises. Tourne le miroir vers le cristal, au sommet.',
  area: true, theme: 'village', map, hmap, ents, props,
  npcs: [{ id: 'tobias', x: 7, y: 10, face: 'S' }],
  chests: [{ id: 'ch_test_sommet', x: 18, y: 3, ecus: 30 }],
  spawns: [{ type: 'brumelin', x: 16, y: 12, n: 1 }],
};
const island = {
  id: 'test-montagne', num: 0, name: 'Montagne d’essai',
  intro: 'Île de démonstration du relief : trois terrasses, un escalier, une rampe, des falaises.',
  sky: { dusk: ['#3b3274', '#7a6aa6', '#e6a99d'], dawn: ['#3f80e0', '#b5dcf7', '#ffd9a6'] },
  regions: { base: { name: 'Montagne d’essai', zones: ['base'], area: true } },
  pages: {}, wisp: { name: 'Lueur d’essai', text: '' }, ending: 'Essai terminé.',
  zones: [zone], bridges: [],
};

/* vérifications : énigme de lumière du sommet + accessibilité de tout (altitude comprise) */
const gates = ['g_c'];
const an = analyse(map, ents, gates, { entry: zone.entry, hmap, h: 0 });
if (an.escape || !an.sols.length || an.initialSolved) throw new Error(`énigme du sommet invalide (fuite ${an.escape}, solutions ${an.sols.length}, déjà résolue ${an.initialSolved})`);
const r = checkIsland(island, 'base');
if (r.problems.length) throw new Error('Accessibilité :\n  ' + r.problems.join('\n  '));
const out = `/* Fichier généré par tools/build-test-montagne.mjs — ne pas modifier à la main (modifier le script puis relancer). */\nexport default ${JSON.stringify(island, null, 1)};\n`;
writeFileSync(new URL('../js/islands/test-montagne.js', import.meta.url), out);
console.log(`Montagne d’essai : ${r.cells} cases accessibles · énigme du sommet ${an.sols.length} solution(s)`);
console.log(`→ js/islands/test-montagne.js (${(out.length / 1024).toFixed(1)} Ko)`);
