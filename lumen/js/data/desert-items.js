/* =========================================================
   LUMEN — ACTE III : objets du Désert des Échos (fusionnés dans ITEMS, UPGRADES, RECIPES).
   ========================================================= */
export const DESERT_ITEMS = {
  /* ---------------- Armes ---------------- */
  cimeterre: { cat: 'arme', name: 'Cimeterre des dunes', icon: 'sword', rarity: 'rare', wclass: 'lame', dmg: 'tranchant', atk: 17, rate: 1.3, reach: 2.35, arc: 2.0, price: 520, sell: 150, model: 'epee', cuts: true,
    desc: 'Une lame courbe, trempée dans le sable chaud. Elle tranche les ronces sèches comme du papier.' },
  cimeterre_dore: { cat: 'arme', name: 'Cimeterre doré', icon: 'sword-aube', rarity: 'epique', wclass: 'lame', dmg: 'tranchant', atk: 20, rate: 1.35, reach: 2.4, arc: 2.1, price: 0, sell: 240, model: 'epee_aube', cuts: true, bonus: { sable: 1.25 },
    desc: 'La lame dorée des gardiens du Temple enseveli. Efficace contre les créatures du sable.' },
  masse_sable: { cat: 'arme', name: 'Masse de grès', icon: 'hammer', rarity: 'rare', wclass: 'lourde', dmg: 'contondant', atk: 26, rate: 0.64, reach: 2.55, arc: 2.7, knock: 3.4, price: 0, sell: 160, model: 'marteau', breaks: true,
    desc: 'Une masse taillée dans un seul bloc de grès. Elle brise les carapaces des scarabées et les roches fissurées.' },
  arc_dunes: { cat: 'arme', name: 'Arc des nomades', icon: 'sling', rarity: 'rare', wclass: 'distance', dmg: 'percant', atk: 10, rate: 1.6, proj: { speed: 22, range: 17, size: 0.14, color: '#ffe9b0' }, price: 480, sell: 140, model: 'fronde',
    desc: 'Un arc court en bois de palmier, léger comme une plume. Parfait pour viser de loin les chacals.' },

  /* ---------------- Tenues et armures ---------------- */
  tunique_nomade: { cat: 'armure', name: 'Tunique nomade', icon: 'tunic', rarity: 'rare', def: 8, speed: 0.04, price: 420, sell: 140, desc: 'Du lin épais, teint à l’indigo et brodé d’or. Elle protège du soleil comme des griffes.' },
  armure_scarabee: { cat: 'armure', name: 'Armure de scarabée', icon: 'armor-scale', rarity: 'epique', def: 11, price: 0, sell: 200, desc: 'Des carapaces polies, assemblées par Rafik. Lourde à porter, difficile à percer.' },
  burnous_echo: { cat: 'armure', name: 'Burnous d’écho', icon: 'cloak', rarity: 'epique', def: 10, speed: 0.06, price: 0, sell: 220, desc: 'Un long manteau tissé de fils de sable. Il renvoie les coups comme les falaises renvoient la voix.' },

  /* ---------------- Accessoires ---------------- */
  bottes_dunes: { cat: 'accessoire', name: 'Bottes des dunes', icon: 'boots', rarity: 'rare', speed: 0.12, price: 0, sell: 120, desc: 'Larges semelles de cuir : on ne s’enfonce plus dans le sable. Vitesse +12 %.' },
  anneau_oasis: { cat: 'accessoire', name: 'Anneau de l’Oasis', icon: 'ring', rarity: 'rare', hp: 15, en: 20, price: 0, sell: 120, desc: '+15 points de vie et +20 énergie maximum. Il garde la fraîcheur de l’eau.' },
  amulette_scarabee: { cat: 'accessoire', name: 'Amulette de scarabée', icon: 'amulet', rarity: 'epique', resSable: 0.25, price: 460, sell: 150, desc: 'Les créatures du sable te font 25 % de dégâts en moins.' },

  /* ---------------- Consommables ---------------- */
  datte: { cat: 'conso', name: 'Datte fourrée', icon: 'bread', rarity: 'commun', heal: 30, price: 22, sell: 7, desc: 'Rend 30 points de vie. Sucrée, collante, imbattable après une longue marche.' },
  the_menthe: { cat: 'conso', name: 'Thé à la menthe', icon: 'potion-blue', rarity: 'commun', heal: 60, regen: 10, price: 48, sell: 16, desc: 'Rend 60 points de vie, puis 10 de plus pendant quelques secondes. Très sucré.' },
  elixir_echo: { cat: 'conso', name: 'Élixir d’écho', icon: 'potion-blue', rarity: 'rare', energy: 90, price: 70, sell: 22, desc: 'Rend 90 points d’énergie. Il résonne dans la gorge.' },

  /* ---------------- Matériaux ---------------- */
  carapace_sable: { cat: 'materiau', name: 'Carapace de scarabée', icon: 'stone', rarity: 'commun', price: 36, sell: 14, desc: 'Une plaque luisante, légère et dure. Rafik la travaille à la forge.' },
  dard_scorpion: { cat: 'materiau', name: 'Dard de scorpion', icon: 'fiber', rarity: 'commun', price: 40, sell: 16, desc: 'Un dard noir, encore tiède. Djamila en tire un remède, Rafik un fil de trempe.' },
  verre_sable: { cat: 'materiau', name: 'Verre du désert', icon: 'shard', rarity: 'commun', price: 30, sell: 12, desc: 'Du sable fondu par la foudre, vert pâle et tranchant.' },
  fleur_sable: { cat: 'materiau', name: 'Rose des sables', icon: 'flower', rarity: 'commun', price: 0, sell: 0, desc: 'Une fleur de cristal rose, qui ne s’ouvre qu’au crépuscule.' },
  larme_echo: { cat: 'materiau', name: 'Larme du Gardien d’échos', icon: 'tear', rarity: 'epique', price: 0, sell: 240, desc: 'Un cristal doré, qui répète en silence les derniers mots du Gardien.' },

  /* ---------------- Objets de quête ---------------- */
  prisme_dore: { cat: 'quete', name: 'Fragment doré du Prisme', icon: 'shard', rarity: 'legendaire', desc: 'Un éclat du Grand Prisme, doré comme le désert à midi. Il fredonne ce qu’on lui murmure.' },
  cle_temple_d: { cat: 'quete', name: 'Clé du Temple enseveli', icon: 'key', rarity: 'rare', desc: 'Une clé de grès gravée d’un œil. Elle sent le sable froid.' },
  tablette_echo: { cat: 'quete', stack: true, name: 'Tablette d’écho', icon: 'bag', rarity: 'commun', desc: 'Une tablette d’argile couverte de signes. Quand on la pose contre l’oreille, elle répète une phrase.' },
  jarre_ancienne: { cat: 'quete', stack: true, name: 'Jarre ancienne', icon: 'bag', rarity: 'commun', desc: 'Une jarre vernie, intacte malgré les siècles. Leïla saura lui donner une seconde vie.' },
  collier_chameau: { cat: 'quete', name: 'Collier de Pachà', icon: 'pendant', rarity: 'commun', desc: 'Un collier de clochettes de cuivre. Il appartient à un chameau capricieux nommé Pachà.' },
  colis_kassim: { cat: 'quete', name: 'Colis de Kassim', icon: 'bag', rarity: 'commun', desc: 'Un paquet noué de ficelle rouge. « Pour Leïla — ne pas secouer », a écrit Kassim.' },
  sachet_epices: { cat: 'quete', name: 'Sachet d’épices', icon: 'bag', rarity: 'commun', desc: 'Un sachet de cumin et de safran. Leïla l’envoie à Samir pour ses grillades.' },
};

/* Fabrication à la forge de Rafik */
export const DESERT_RECIPES = {
  armure_scarabee: { ecus: 300, mats: { carapace_sable: 5, pierre: 3 } },
  cimeterre: { ecus: 260, mats: { dard_scorpion: 3, verre_sable: 3, pierre: 2 } },
};
