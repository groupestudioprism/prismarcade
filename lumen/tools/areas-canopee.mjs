/* =========================================================
   LUMEN — Canopée et Phare de Verre (Forêt de Verre, partie 2).
   Zones « en hauteur » : des plates-formes séparées par des vides (' ') que l'on franchit
   avec le grappin de lumière (entités « post », voir logic.js : postLinks).
   Zones dessinées ici : les Branches basses (tutoriel), la Passerelle (combat + secret),
   le Phare de Verre (énigme à plusieurs étapes). Les deux salles d'énigmes de la Canopée
   (les Feuilles, le Nid) sont produites par le générateur dans build-foret.mjs.
   ========================================================= */
import { grid, rect, toRows } from './areas.mjs';

const put = (g, x, y, ch) => { if (g[y] && g[y][x] !== undefined) g[y][x] = ch; };

/* ---------------------------------------------------------
   Les Branches basses (zone d'aventure + mini-énigme)
   plate-forme A (arrivée) · vide de 4 cases · plate-forme B (lanterne, coffre, sortie)
   --------------------------------------------------------- */
export function branches() {
  const W = 21, H = 13, g = grid(W, H, ' ');
  rect(g, 0, 0, 10, 13, '.');         // plate-forme A : x 0..9
  rect(g, 14, 0, 7, 13, '.');         // plate-forme B : x 14..20
  for (let x = 0; x <= 9; x++) { g[0][x] = '#'; g[12][x] = '#'; }
  for (let x = 14; x <= 20; x++) { g[0][x] = '#'; g[12][x] = '#'; }
  for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][20] = '#'; }
  g[0][8] = '.';                      // arrivée par le haut (pont du Belvédère)
  g[6][20] = '.';                     // sortie à l'est (pont des Feuilles)
  [[1, 1], [1, 11], [5, 1], [18, 11], [15, 11]].forEach(([x, y]) => put(g, x, y, 'T'));
  const ents = [
    { t: 'post', x: 9, y: 6 }, { t: 'post', x: 14, y: 6 },
    // mini-énigme sur la plate-forme B : la lumière doit rejoindre le cristal
    { t: 'lantern', x: 16, y: 9, dir: 'W', rot: true },
    { t: 'mirror', x: 16, y: 3, state: 1, rot: true },
    { t: 'receiver', x: 18, y: 3, color: 'w', gate: 'fc0' },
  ];
  return {
    id: 'can1', region: 'canopee', title: 'Les Branches basses', theme: 'canopee', music: 'canopee', area: true, respawn: true, map: toRows(g),
    spawn: [8, 2], entry: [8, 0], entryGate: 'b_canopee',
    hint: 'Grappin de lumière : tiens-toi à côté d’un poteau, tourné vers le poteau d’en face, puis appuie sur E. Le câble fait le reste.',
    ents,
    props: [
      { t: 'sign', x: 6, y: 5, w: 1, h: 1, text: 'Les Branches basses. Les poteaux de verre s’accrochent deux par deux, de part et d’autre d’un vide. Place-toi devant le tien, face à l’autre, et lance le grappin.' },
      { t: 'sign', x: 16, y: 5, w: 1, h: 1, text: 'Un cristal dort sur cette branche. Une lanterne, un miroir : tu connais la musique. Le pont des Feuilles s’ouvrira quand il brillera.' },
      { t: 'crystal', x: 3, y: 3, w: 1, h: 1 },
    ],
    chests: [{ id: 'ch_can_b', x: 19, y: 10, item: 'grande_potion', n: 1 }],
    pickups: [{ t: 'item', id: 'graine1', item: 'graine_canopee', x: 19, y: 1 }],
    spawns: [
      { type: 'eclat_ambre', x: 5, y: 8, n: 2 },
      { type: 'eclat', x: 3, y: 9, n: 1 },
    ],
    warp: { id: 'canopee', x: 3, y: 3, name: 'Cristal de la Canopée' },
  };
}

/* ---------------------------------------------------------
   La Passerelle (combat) — trois plates-formes, une arène scellée, une niche secrète
   --------------------------------------------------------- */
export function passerelle() {
  const W = 24, H = 16, g = grid(W, H, ' ');
  rect(g, 0, 5, 7, 8, '.');            // P1 : arrivée, x 0..6, y 5..12
  rect(g, 10, 2, 8, 13, '.');          // P2 : arène + vestibule, x 10..17, y 2..14
  rect(g, 21, 6, 3, 5, '.');           // P3 : sortie, x 21..23, y 6..10
  rect(g, 0, 0, 8, 3, '.');            // niche : x 0..7, y 0..2
  // remparts
  for (let x = 0; x <= 6; x++) g[12][x] = '#';
  for (let y = 5; y <= 12; y++) g[y][0] = '#';
  g[8][0] = '.';                       // arrivée à l'ouest (pont des Feuilles)
  for (let x = 0; x <= 7; x++) g[0][x] = '#';
  for (let y = 0; y <= 2; y++) { g[y][0] = '#'; g[y][7] = '#'; }
  for (let x = 10; x <= 17; x++) { g[2][x] = '#'; g[14][x] = '#'; }
  for (let y = 2; y <= 14; y++) g[y][16] = '#';        // mur de l'arène (le sceau s'y ouvre)
  for (let y = 7; y <= 9; y++) g[y][16] = 'x';         // sceau (salle nettoyée)
  for (let y = 2; y <= 14; y++) if (y < 7 || y > 9) g[y][17] = '#';   // vestibule : seulement y 7..9
  for (let y = 6; y <= 10; y++) g[y][23] = '#';
  g[8][23] = 'x';                      // porte de sortie : même sceau, donne sur le Nid de lumière
  g[6][22] = '#'; g[6][21] = '#'; g[10][21] = '#'; g[10][22] = '#';
  [[11, 3], [15, 3], [11, 13], [15, 13], [13, 8]].forEach(([x, y]) => put(g, x, y, '#'));   // piliers de l'arène
  [[1, 6], [5, 11], [1, 11]].forEach(([x, y]) => put(g, x, y, 'T'));
  const posts = [
    { t: 'post', x: 6, y: 8 }, { t: 'post', x: 10, y: 8 },       // P1 → arène
    { t: 'post', x: 17, y: 8 }, { t: 'post', x: 21, y: 8 },      // vestibule → sortie
    { t: 'post', x: 3, y: 5 }, { t: 'post', x: 3, y: 2 },        // P1 → niche secrète
  ];
  return {
    id: 'can3', region: 'canopee', title: 'La Passerelle des Sentinelles', theme: 'canopee', music: 'canopee', area: true, respawn: true, map: toRows(g),
    spawn: [1, 8], entry: [0, 8], entryGate: 'fc1',
    hint: 'La salle de l’autre côté du vide est gardée. Tant que ses gardiens vivent, le sceau reste fermé.',
    ents: posts,
    doors: [{ gate: 'cn_combat', look: 'seal', cells: [[16, 7], [16, 8], [16, 9], [23, 8]] }],
    props: [
      { t: 'sign', x: 5, y: 7, w: 1, h: 1, text: 'La Passerelle des Sentinelles. Les gardiens de l’arène ne traversent pas le vide : le grappin, lui, si.' },
      { t: 'brazier', x: 4, y: 6, w: 1, h: 1 }, { t: 'brazier', x: 4, y: 10, w: 1, h: 1 },
      { t: 'crystal', x: 20, y: 13, w: 1, h: 1 },
    ],
    chests: [
      { id: 'ch_can_p1', x: 2, y: 10, item: 'anneau_canopee', n: 1 },
      { id: 'ch_can_arene', x: 14, y: 12, ecus: 120, item: 'sceptre', n: 1 },
      { id: 'ch_can_niche', x: 5, y: 1, item: 'fragment_coeur', n: 1 },
    ],
    pickups: [
      { t: 'item', id: 'graine2', item: 'graine_canopee', x: 2, y: 7 },
      { t: 'item', id: 'graine3', item: 'graine_canopee', x: 23, y: 7 },
      { t: 'page', id: 'pg_niche', page: 'orin5', x: 2, y: 1 },
    ],
    combatRooms: [{ gate: 'cn_combat', rect: [10, 3, 15, 13] }],
    spawns: [
      { type: 'eclat_ambre', x: 12, y: 5, n: 3, room: 'cn_combat' },
      { type: 'lierre', x: 14, y: 4, n: 1, room: 'cn_combat' },
      { type: 'cerf_prisme', x: 12, y: 11, n: 1, room: 'cn_combat' },
      { type: 'sentinelle_azur', x: 14, y: 8, n: 1, room: 'cn_combat', elite: true },
    ],
  };
}

/* ---------------------------------------------------------
   Le Phare de Verre : trois salles en enfilade, deux portes, une balise (jaune + magenta + cyan).
   Étape 1 (salle A)  : allumer le cristal blanc → la porte D1 s'ouvre.
   Étape 2 (salle B)  : faire du magenta avec le prisme et le relais mélangeur → la porte D2 s'ouvre.
   Étape 3 (finale)   : tout reconfigurer pour que le jaune (A), le magenta (B) et le cyan (C)
                        convergent sur la balise, qui exige les trois en même temps.
   --------------------------------------------------------- */
export function phare() {
  const W = 19, H = 13, g = grid(W, H, '#');
  rect(g, 1, 1, 5, 11, '.'); rect(g, 7, 1, 5, 11, '.'); rect(g, 13, 1, 5, 11, '.');
  g[11][0] = '.';                     // arrivée (pont du Nid), en bas à gauche
  g[6][6] = 'x';                      // D1
  g[6][12] = 'x'; g[2][12] = 'x';     // D2 (deux passages)
  g[5][9] = '#';                      // pilier : arrête le faisceau vert du prisme
  const ents = [
    { t: 'beacon', x: 15, y: 6, gate: 'end', need: ['y', 'm', 'c'] },
    // salle A — jaune
    { t: 'lantern', x: 1, y: 9, dir: 'S', rot: true },
    { t: 'mirror', x: 1, y: 6, state: 1, rot: true },
    { t: 'mirror', x: 4, y: 9, state: 1, rot: true },
    { t: 'vitrail', x: 3, y: 6, color: 'y' },
    { t: 'receiver', x: 4, y: 3, color: 'w', gate: 'ph_d1' },
    // salle B — magenta (prisme + relais mélangeur)
    { t: 'lantern', x: 9, y: 10, dir: 'E', rot: true },
    { t: 'prism', x: 9, y: 8 },
    { t: 'mirror', x: 7, y: 8, state: 0, rot: true },
    { t: 'mirror', x: 11, y: 8, state: 1, rot: true },
    { t: 'mirror', x: 7, y: 3, state: 1, rot: true },
    { t: 'mirror', x: 11, y: 3, state: 0, rot: true },
    { t: 'relay', x: 9, y: 3, mix: true, out: 'W', rot: true },
    { t: 'mirror', x: 9, y: 2, state: 1, rot: true },
    { t: 'receiver', x: 7, y: 2, color: 'm', gate: 'ph_d2' },
    // salle C — cyan
    { t: 'lantern', x: 13, y: 10, dir: 'N', rot: true },
    { t: 'vitrail', x: 14, y: 10, color: 'c' },
    { t: 'mirror', x: 17, y: 10, state: 1, rot: true },
    { t: 'mirror', x: 17, y: 8, state: 0, rot: true },
    { t: 'mirror', x: 15, y: 8, state: 0, rot: true },
    { t: 'mirror', x: 15, y: 2, state: 0, rot: true },
  ];
  return {
    id: 'phare_f', region: 'phare', title: 'Le Phare de Verre', theme: 'phare_verre', music: 'phare', num: 6, respawn: true, map: toRows(g),
    entry: [0, 11], entryGate: 'fc2', ents,
    doors: [
      { gate: 'ph_d1', look: 'barrier', cells: [[6, 6]] },
      { gate: 'ph_d2', look: 'barrier', cells: [[12, 6], [12, 2]] },
    ],
    stages: ['ph_d1', 'ph_d2'], final: 'end',
    hint: 'Le phare exige le jaune, le magenta et le cyan en même temps. Chaque salle donne sa couleur, mais il faudra défaire ce qui a ouvert les portes.',
    warp: { id: 'phare', x: 3, y: 10, name: 'Cristal du Phare de Verre' },
  };
}
