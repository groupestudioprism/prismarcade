/* =========================================================
   LUMEN — créatures. Comportements (game/enemies.js) :
   chaser     fonce sur Lyra dès qu'il la voit
   territorial ne bouge pas ; frappe quand on approche
   ranged     garde ses distances et tire
   charger    se prépare puis charge en ligne droite (étourdi s'il percute un mur)
   guard      bouclier frontal ; défend une zone
   boss       Colosse : phases, attaques annoncées
   weak / resist : multiplicateurs par type de dégâts.
   ========================================================= */
export const ENEMIES = {
  brumelin: {
    name: 'Brumelin', family: 'brume', hp: 18, atk: 8, def: 0, speed: 2.6, behavior: 'chaser', aggro: 7, leash: 13, radius: 0.45,
    xp: 6, ecus: [1, 4], drops: [['brume', 0.45]], weak: { lumiere: 1.5 }, resist: {},
    desc: 'Une petite boule de brume curieuse et rancunière.',
  },
  ronceux: {
    name: 'Ronceux', family: 'plante', hp: 34, atk: 12, def: 1, speed: 0, behavior: 'territorial', aggro: 3.4, leash: 0, radius: 0.6,
    xp: 10, ecus: [2, 6], drops: [['fibre', 0.75]], weak: { tranchant: 1.5 }, resist: { contondant: 0.7, percant: 0.6 },
    desc: 'Un buisson de ronces animé. Il fouette tout ce qui passe à sa portée.',
  },
  lanceur: {
    name: 'Lance-épines', family: 'plante', hp: 22, atk: 9, def: 0, speed: 2.2, behavior: 'ranged', aggro: 10, keep: 6, fire: 1.9, proj: 9, leash: 12, radius: 0.5,
    xp: 9, ecus: [2, 6], drops: [['fibre', 0.4], ['bois', 0.35]], weak: { tranchant: 1.25 }, resist: {},
    desc: 'Il crache des épines de loin. Approche-toi vite.',
  },
  sanglier: {
    name: 'Sanglier de brume', family: 'brume', hp: 46, atk: 14, def: 1, speed: 2.1, charge: 11, behavior: 'charger', aggro: 8, leash: 14, radius: 0.7,
    xp: 14, ecus: [4, 9], drops: [['pierre', 0.5], ['brume', 0.3]], weak: { lumiere: 1.25 }, resist: {},
    desc: 'Il gratte le sol avant de charger. Esquive sur le côté et frappe-le quand il est étourdi.',
  },
  gardien: {
    name: 'Gardien d’ombre', family: 'brume', hp: 80, atk: 16, def: 2, speed: 2.0, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.65,
    xp: 30, ecus: [12, 20], drops: [['brume', 1], ['pierre', 0.6]], weak: { lumiere: 1.3 }, resist: { percant: 0.6 },
    desc: 'Son bouclier arrête les coups de face. Frappe dans le dos, au marteau ou avec l’Onde de lumière.',
  },
  colosse: {
    name: 'Colosse de Brume', family: 'brume', hp: 560, atk: 20, def: 2, speed: 1.7, behavior: 'boss', aggro: 12, leash: 40, radius: 1.5, boss: true,
    xp: 220, ecus: [150, 150], drops: [['larme_colosse', 1]], weak: { lumiere: 1.3 }, resist: { percant: 0.7 },
    desc: 'Un amas de roche et de brume autour d’un cœur volé. Son cœur brille quand il reprend son souffle.',
  },
};
