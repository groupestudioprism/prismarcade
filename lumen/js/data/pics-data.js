/* =========================================================
   LUMEN — données de l'Acte V (Les Pics du Vent) : objets, créatures, boutiques, recettes, apparences.
   Fusionnées dans les tables communes par UNE ligne en bas de items.js, enemies.js, shops.js et looks.js.
   ========================================================= */

export const ITEMS_PICS = {
  /* armes */
  epee_givre: { cat: 'arme', name: 'Lame de givre', icon: 'sword', rarity: 'rare', wclass: 'lame', dmg: 'tranchant', atk: 18, rate: 1.32, reach: 2.35, arc: 2.0, price: 0, sell: 150, model: 'epee', cuts: true,
    desc: 'Une lame trempée dans l’eau des névés. Elle tranche net, et la neige glisse dessus sans s’y accrocher.' },
  arc_cimes: { cat: 'arme', name: 'Arc des cimes', icon: 'sling', rarity: 'rare', wclass: 'distance', dmg: 'percant', atk: 12, rate: 1.5, proj: { speed: 24, range: 19, size: 0.14, color: '#d8ccff' }, price: 0, sell: 130, model: 'fronde',
    desc: 'Un arc de bois clair, tendu par les vents. Ses flèches de lumière vont plus loin que celles de la fronde.' },
  /* tenues */
  pelisse_cimes: { cat: 'armure', name: 'Pelisse des cimes', icon: 'cloak', rarity: 'epique', def: 11, speed: 0.03, price: 0, sell: 210, desc: 'Une pelisse doublée de laine de bouquetin. Le vent glisse dessus et le froid n’y entre pas.' },
  /* accessoires */
  anneau_vent: { cat: 'accessoire', name: 'Anneau de vent', icon: 'ring', rarity: 'rare', en: 20, speed: 0.05, price: 0, sell: 120, desc: '+20 énergie maximum et vitesse +5 %. Il siffle un peu quand on court.' },
  crampons_givre: { cat: 'accessoire', name: 'Crampons de givre', icon: 'boots', rarity: 'rare', speed: 0.08, hp: 10, price: 0, sell: 130, desc: '+10 points de vie et vitesse +8 %. Forgés par Frimas pour les arêtes verglacées.' },
  /* consommables */
  tisane_cimes: { cat: 'conso', name: 'Tisane des cimes', icon: 'potion-blue', rarity: 'commun', heal: 70, price: 55, sell: 18, desc: 'Rend 70 points de vie. Le thym de montagne y ajoute un goût de printemps.' },
  soupe_montagne: { cat: 'conso', name: 'Soupe de montagne', icon: 'bread', rarity: 'commun', heal: 40, regen: 25, price: 40, sell: 12, desc: 'Rend 40 points de vie, puis 25 de plus pendant quelques secondes. Flocon n’en donne la recette à personne.' },
  /* matériaux */
  edelweiss: { cat: 'materiau', name: 'Edelweiss', icon: 'flower', rarity: 'commun', price: 20, sell: 8, desc: 'Une fleur laineuse, blanche comme la neige où elle pousse. Gentiane en fait des onguents.' },
  cristal_vent: { cat: 'materiau', name: 'Cristal de vent', icon: 'shard', rarity: 'commun', price: 38, sell: 16, desc: 'Un cristal pâle qui murmure quand on le tient près de l’oreille.' },
  larme_meunier: { cat: 'materiau', name: 'Larme du Grand Meunier', icon: 'tear', rarity: 'epique', price: 0, sell: 240, desc: 'Un cristal violet, froid comme la farine de glace. La forge peut en tirer le meilleur d’une arme.' },
  engrenage: { cat: 'quete', name: 'Engrenage du Col', icon: 'gear', rarity: 'commun', desc: 'Une roue dentée de cuivre, tombée d’un vieux moulin. Tourmente en cherche une pareille depuis un an.' },
  /* objets de quête */
  voile_vent: { cat: 'quete', name: 'Voile de vent', icon: 'wing', rarity: 'epique', desc: 'Une voile de soie claire, tendue sur deux baleines. Alizée l’a cousue pour toi.',
    tip: 'Tiens-toi à côté d’une pierre de vent, tournée vers celle d’en face, puis appuie sur Interagir : la voile se déploie et le courant t’emporte jusqu’à l’autre rive. La pierre d’arrivée te ramène aussi.' },
  cle_moulin: { cat: 'quete', name: 'Clé du Moulin', icon: 'key', rarity: 'rare', desc: 'Une clé de fer, froide, couverte de farine gelée.' },
  coeur_moulin: { cat: 'quete', name: 'Cœur du Moulin', icon: 'heart', rarity: 'epique', desc: 'Le cœur du Grand Meunier : une meule de cristal qui bat encore, très lentement.' },
  prisme_violet: { cat: 'quete', name: 'Fragment violet du Prisme', icon: 'shard', rarity: 'legendaire', desc: 'Un éclat du Grand Prisme, violet comme un ciel de haute montagne. Il souffle doucement.' },
  cerf_volant: { cat: 'quete', stack: true, name: 'Cerf-volant d’Edel', icon: 'kite', rarity: 'commun', desc: 'Un cerf-volant de papier et de baguettes, coincé là par le vent. La ficelle porte le nom d’Edel.' },
  lettre_pics: { cat: 'quete', stack: true, name: 'Lettre de Rafale', icon: 'letter', rarity: 'commun', desc: 'Une lettre cachetée de cire grise. Le coursier a écrit le nom du destinataire au dos.' },
  corne_cimes: { cat: 'quete', name: 'Corne des cimes', icon: 'horn', rarity: 'rare', desc: 'La corne d’un vieux bouquetin des crêtes, longue comme un avant-bras et striée comme un tronc.' },
};

export const RECIPES_PICS = {
  arc_cimes: { ecus: 320, mats: { cristal_vent: 3, bois: 4, fibre: 2 } },
  crampons_givre: { ecus: 200, mats: { cristal_vent: 2, fibre: 3, pierre: 2 } },
};

export const ENEMIES_PICS = {
  givrelin: {
    name: 'Givrelin', family: 'givre', model: 'brumelin', tint: '#bfe4ff', spark: '#e8f6ff', hp: 28, atk: 10, def: 0, speed: 2.9, behavior: 'chaser', aggro: 7.5, leash: 13, radius: 0.45,
    xp: 10, ecus: [3, 6], drops: [['cristal_vent', 0.25], ['brume', 0.2]], weak: { lumiere: 1.4 }, resist: {},
    desc: 'Une boule de givre vive et rancunière. Elle déboule dès qu’on traverse la neige.',
  },
  bourrasque: {
    name: 'Bourrasque', family: 'givre', model: 'lanceur', tint: '#c9b8ff', spark: '#e6dcff', hp: 32, atk: 13, def: 0, speed: 2.3, behavior: 'ranged', aggro: 10.5, keep: 6.5, fire: 1.7, proj: 10, leash: 12, radius: 0.5,
    xp: 13, ecus: [4, 8], drops: [['cristal_vent', 0.4], ['fibre', 0.2]], weak: { tranchant: 1.25 }, resist: {},
    desc: 'Un tourbillon de neige qui crache des éclats de glace. Approche-toi vite, ou mets-toi à couvert.',
  },
  bouquetin: {
    name: 'Bouquetin des cimes', family: 'bete', model: 'sanglier', tint: '#d9cfb8', spark: '#f0e8d0', hp: 74, atk: 18, def: 1, speed: 2.3, charge: 13, behavior: 'charger', aggro: 8.5, leash: 14, radius: 0.7,
    xp: 20, ecus: [6, 12], drops: [['pierre', 0.4], ['cristal_vent', 0.3]], weak: { contondant: 1.25 }, resist: {},
    desc: 'Il recule d’un pas, baisse les cornes et charge. Esquive sur le côté : il s’étourdit contre la roche.',
  },
  veilleur_givre: {
    name: 'Veilleur de givre', family: 'givre', model: 'gardien', tint: '#a8c8f0', spark: '#d8ecff', hp: 130, atk: 21, def: 3, speed: 2.1, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.65,
    xp: 44, ecus: [16, 26], drops: [['cristal_vent', 1], ['grande_potion', 0.15]], weak: { contondant: 1.4 }, resist: { percant: 0.6 },
    desc: 'Un bloc de glace taillé en soldat. Son bouclier arrête les coups de face : contourne-le, ou brise-le au marteau.',
  },
  grand_meunier: {
    name: 'Le Grand Meunier', family: 'givre', model: 'grand_meunier', tint: '#b59cf0', spark: '#e6dcff', hp: 620, atk: 24, def: 3, speed: 1.9, behavior: 'boss', aggro: 12, leash: 40, radius: 1.5, boss: true,
    bossFlag: 'boss_meunier', place: 'Le Moulin du Grand Meunier', adds: 'givrelin',
    xp: 360, ecus: [240, 240], drops: [['larme_meunier', 1]], weak: { lumiere: 1.3 }, resist: { percant: 0.7 },
    desc: 'Un meunier de pierre et de bois dont les pales tournent encore au-dessus des épaules. Son cœur de meule brille quand il reprend son souffle : c’est le moment de frapper.',
  },
};

export const SHOPS_PICS = {
  gentiane: {
    name: 'Apothicaire de Gentiane', buyRate: 0, items: [
      { id: 'potion', stock: 6, restock: 6 },
      { id: 'tisane_cimes', stock: 4, restock: 4 },
      { id: 'elixir', stock: 4, restock: 4 },
      { id: 'grande_potion', stock: 2, restock: 2 },
    ],
  },
  frimas: {
    name: 'Forge de Frimas', buyRate: 0, items: [
      { id: 'epee_courte', stock: 1, if: (q) => !q.has('epee_aube', 1) && !q.has('epee_courte', 1) && !q.has('epee_givre', 1) },
      { id: 'veste_cuir', stock: 1, if: (q) => !q.has('veste_cuir', 1) },
      { id: 'pierre', stock: 5, restock: 3 },
      { id: 'fibre', stock: 5, restock: 3 },
    ],
  },
  zephyr: {
    name: 'Comptoir de Zéphyr', buyRate: 1, items: [
      { id: 'bois', stock: 8, restock: 5 },
      { id: 'fibre', stock: 8, restock: 5 },
      { id: 'cristal_vent', stock: 4, restock: 3 },
      { id: 'edelweiss', stock: 3, restock: 2 },
      { id: 'soupe_montagne', stock: 3, restock: 3 },
      { id: 'brume', stock: 2, restock: 2 },
    ],
  },
  flocon: {
    name: 'Cuisine du Chamois endormi', buyRate: 0, items: [
      { id: 'soupe_montagne', stock: 4, restock: 4 },
      { id: 'tisane_cimes', stock: 3, restock: 3 },
    ],
  },
};

/* apparences débloquées par des quêtes de l'Acte V */
export const LOOKS_PICS = {
  cloaks: [
    { id: 'givre', name: 'Givre', hex: '#8fb4e0', unlock: 'teinte_givre' },
    { id: 'violet', name: 'Violet des cimes', hex: '#6a4bc0', unlock: 'teinte_violet' },
    { id: 'cime', name: 'Brume de cime', hex: '#7d86a8', unlock: 'teinte_cime' },
  ],
  hairColors: [{ id: 'lavande', name: 'Lavande', hex: '#b9a4ec', unlock: 'teinture_lavande' }],
  names: {
    teinte_givre: 'Teinte givre', teinte_violet: 'Teinte violet des cimes', teinte_cime: 'Teinte brume de cime', teinture_lavande: 'Teinture lavande (cheveux)',
  },
};
