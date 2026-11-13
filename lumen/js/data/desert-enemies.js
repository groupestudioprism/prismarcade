/* =========================================================
   LUMEN — ACTE III : créatures du Désert des Échos (fusionnées dans ENEMIES).
   family « sable » : les objets qui visent le sable (bonus d’arme, résistance d’amulette) s’appliquent.
   ========================================================= */
export const DESERT_ENEMIES = {
  scarabee: {
    name: 'Scarabée doré', family: 'sable', hp: 30, atk: 10, def: 1, speed: 2.7, behavior: 'chaser', aggro: 7, leash: 13, radius: 0.5,
    xp: 9, ecus: [2, 6], drops: [['carapace_sable', 0.5]], weak: { contondant: 1.5 }, resist: { tranchant: 0.7, percant: 0.8 },
    desc: 'Un gros scarabée à carapace d’or. Les lames glissent sur son dos : un coup lourd la fend.',
  },
  scorpion: {
    name: 'Scorpion des pierres', family: 'sable', hp: 46, atk: 16, def: 1, speed: 0, behavior: 'territorial', aggro: 3.6, leash: 0, radius: 0.6,
    xp: 13, ecus: [3, 8], drops: [['dard_scorpion', 0.55]], weak: { tranchant: 1.3, lumiere: 1.25 }, resist: { contondant: 0.7 },
    desc: 'Il dort sous les pierres chaudes et frappe vite, la queue en avant. Reste hors de sa portée, ou frappe en premier.',
  },
  chacal: {
    name: 'Chacal ocre', family: 'sable', model: 'sanglier', tint: '#d9a55a', spark: '#ffe2a0', hp: 40, atk: 14, def: 0, speed: 2.5, charge: 13, behavior: 'charger', aggro: 9, leash: 15, radius: 0.6,
    xp: 15, ecus: [4, 10], drops: [['datte', 0.3], ['carapace_sable', 0.15]], weak: { percant: 1.4 }, resist: { lumiere: 0.8 },
    desc: 'Il charge en rafale, plus vite qu’un sanglier. Esquive, puis frappe quand il s’étourdit contre un rocher.',
  },
  cactus: {
    name: 'Cactus rôdeur', family: 'plante', model: 'ronceux', tint: '#6fb85a', spark: '#c8f0a0', hp: 56, atk: 13, def: 2, speed: 0, behavior: 'territorial', aggro: 3.4, leash: 0, radius: 0.65,
    xp: 12, ecus: [3, 8], drops: [['fibre', 0.6], ['verre_sable', 0.2]], weak: { tranchant: 1.5 }, resist: { contondant: 0.6, percant: 0.4 },
    desc: 'Un cactus qui a appris à marcher, puis à s’arrêter dès qu’on le regarde. Ses épines arrêtent les flèches.',
  },
  momie: {
    name: 'Momie de grès', family: 'sable', model: 'gardien', tint: '#d8c49a', spark: '#f0e0b0', hp: 118, atk: 19, def: 2, speed: 1.9, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.65,
    xp: 40, ecus: [14, 26], drops: [['verre_sable', 0.8], ['grande_potion', 0.15]], weak: { lumiere: 1.6 }, resist: { percant: 0.6, tranchant: 0.85 },
    desc: 'Des bandelettes autour d’un bloc de grès. Son bouclier arrête tout ce qui vient de face ; l’Onde de lumière le traverse.',
  },
  echo: {
    name: 'Écho errant', family: 'sable', model: 'lanceur', tint: '#bfe8ff', spark: '#e8f8ff', hp: 28, atk: 12, def: 0, speed: 2.3, behavior: 'ranged', aggro: 10, keep: 6, fire: 1.7, proj: 10, leash: 12, radius: 0.5,
    xp: 12, ecus: [3, 8], drops: [['elixir_echo', 0.15], ['verre_sable', 0.3]], weak: { lumiere: 1.7 }, resist: { tranchant: 0.5, contondant: 0.5 },
    desc: 'La voix d’un voyageur resté dans le sable, devenue visible. Les lames passent à travers : seule la lumière l’éteint.',
  },
  gardien_echos: {
    name: 'Gardien d’échos', family: 'sable', model: 'colosse', tint: '#e8b84a', spark: '#fff0b0', hp: 640, atk: 24, def: 3, speed: 1.9, behavior: 'boss', aggro: 12, leash: 40, radius: 1.5, boss: true,
    bossFlag: 'boss_echos', place: 'Le Temple enseveli', win: { banner: 'Le Gardien d’échos est brisé', warp: 'temple_d', xp: 360, coins: 120, key: 'gardien_echos', toast: 'Il te ramène au Temple enseveli quand tu veux. Le fragment doré t’attend dans le coffre de l’arène.' }, adds: 'echo', bossColor: '#e8b84a', tiredText: 'Le Gardien se recroqueville : son cœur doré est à découvert !',
    xp: 360, ecus: [240, 240], drops: [['larme_echo', 1]], weak: { lumiere: 1.35, contondant: 1.2 }, resist: { percant: 0.7, tranchant: 0.85 },
    desc: 'Une statue de grès et d’or qui répète chaque coup trois fois. Son cœur doré s’éclaire quand il reprend son souffle : frappe alors.',
  },
};
