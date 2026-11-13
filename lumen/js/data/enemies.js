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
    name: 'Colosse de Brume', family: 'brume', hp: 440, atk: 20, def: 2, speed: 1.7, behavior: 'boss', aggro: 12, leash: 40, radius: 1.5, boss: true,
    xp: 220, ecus: [150, 150], drops: [['larme_colosse', 1]], weak: { lumiere: 1.3 }, resist: { percant: 0.7 },
    desc: 'Un amas de roche et de brume autour d’un cœur volé. Son cœur brille quand il reprend son souffle.',
  },

  /* ---------------- Forêt de Verre ---------------- */
  eclat: {
    name: 'Éclat vagabond', family: 'verre', model: 'brumelin', tint: '#8fe3ff', spark: '#bff3ff', hp: 24, atk: 9, def: 0, speed: 2.8, behavior: 'chaser', aggro: 7, leash: 13, radius: 0.45,
    xp: 8, ecus: [2, 5], drops: [['eclat_verre', 0.45]], weak: { contondant: 1.5 }, resist: { lumiere: 0.7 },
    desc: 'Un éclat de vitrail devenu vivant. Fragile : un coup bien lourd le brise.',
  },
  lierre: {
    name: 'Lierre-prisme', family: 'plante', model: 'lanceur', tint: '#5fd6c0', spark: '#9fe9d0', hp: 28, atk: 11, def: 0, speed: 2.2, behavior: 'ranged', aggro: 10, keep: 6, fire: 1.8, proj: 9.5, leash: 12, radius: 0.5,
    xp: 11, ecus: [3, 7], drops: [['givre_foret', 0.4], ['eclat_verre', 0.3]], weak: { tranchant: 1.25 }, resist: {},
    desc: 'Il crache des éclats de verre de loin. Rapproche-toi vite.',
  },
  cerf: {
    name: 'Cerf de verre', family: 'verre', model: 'sanglier', tint: '#9fd8ff', spark: '#d8f4ff', hp: 56, atk: 16, def: 1, speed: 2.2, charge: 12, behavior: 'charger', aggro: 8, leash: 14, radius: 0.7,
    xp: 17, ecus: [5, 10], drops: [['eclat_verre', 0.6], ['pierre', 0.3]], weak: { contondant: 1.3 }, resist: { lumiere: 0.8 },
    desc: 'Il charge tête baissée, bois en avant. Esquive, puis frappe quand il est étourdi.',
  },
  sentinelle: {
    name: 'Sentinelle de verre', family: 'verre', model: 'gardien', tint: '#7fdcff', spark: '#bff3ff', hp: 96, atk: 18, def: 2, speed: 2.0, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.65,
    xp: 36, ecus: [14, 24], drops: [['eclat_verre', 1], ['pierre', 0.6]], weak: { contondant: 1.4 }, resist: { percant: 0.6, lumiere: 0.8 },
    desc: 'Son bouclier de cristal arrête les coups de face. Contourne-la, ou brise-le au marteau.',
  },
  gardien_verre: {
    name: 'Gardien de Verre', family: 'verre', model: 'colosse', tint: '#6fd6e8', spark: '#bff3ff', hp: 520, atk: 22, def: 2, speed: 1.8, behavior: 'boss', aggro: 12, leash: 40, radius: 1.5, boss: true,
    bossFlag: 'boss_verre', place: 'Le Temple de Verre', adds: 'eclat',
    xp: 300, ecus: [200, 200], drops: [['larme_verre', 1]], weak: { contondant: 1.3 }, resist: { percant: 0.7, lumiere: 0.8 },
    desc: 'Un colosse de vitrail et de racines. Son cœur de verre brille quand il reprend son souffle : c’est le moment de frapper.',
  },

  /* ---------------- Canopée : variantes teintées aux couleurs rares ---------------- */
  eclat_ambre: {
    name: 'Éclat ambré', family: 'verre', model: 'brumelin', tint: '#ffd84d', spark: '#fff0a0', hp: 36, atk: 12, def: 0, speed: 3.3, behavior: 'chaser', aggro: 8, leash: 13, radius: 0.45,
    xp: 12, ecus: [3, 7], drops: [['eclat_verre', 0.5], ['fibre', 0.2]], weak: { contondant: 1.5 }, resist: { lumiere: 0.7 },
    desc: 'Un éclat de vitrail jaune, plus nerveux que ses cousins de la Lisière. Il ne tient pas en place.',
  },
  cerf_prisme: {
    name: 'Cerf de prisme', family: 'verre', model: 'sanglier', tint: '#ff4fd0', tintK: 0.92, tintE: 0.9, spark: '#ffd0f4', hp: 84, atk: 21, def: 2, speed: 2.4, charge: 14, behavior: 'charger', aggro: 9, leash: 15, radius: 0.7,
    xp: 24, ecus: [8, 14], drops: [['eclat_verre', 0.7], ['pierre', 0.4]], weak: { contondant: 1.3 }, resist: { lumiere: 0.8 },
    desc: 'Un cerf de verre magenta qui charge plus vite et plus loin. Attends qu’il s’étourdisse contre un pilier.',
  },
  sentinelle_azur: {
    name: 'Sentinelle d’azur', family: 'verre', model: 'gardien', tint: '#5fd0ff', spark: '#c8f0ff', hp: 138, atk: 22, def: 3, speed: 2.1, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.65,
    xp: 48, ecus: [20, 32], drops: [['eclat_verre', 1], ['grande_potion', 0.2]], weak: { contondant: 1.4 }, resist: { percant: 0.6, lumiere: 0.8 },
    desc: 'La gardienne de la Passerelle. Son bouclier d’azur arrête tout ce qui vient de face : frappe-la dans le dos, ou brise-le au marteau.',
  },
};

/* ACTE VI : la Citadelle du Zénith */
import { ZENITH_ENEMIES } from './zenith.js';
Object.assign(ENEMIES, ZENITH_ENEMIES);
