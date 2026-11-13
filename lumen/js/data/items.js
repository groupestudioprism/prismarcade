/* =========================================================
   LUMEN — objets : armes, équipements, consommables, matériaux,
   objets de quête. Données pures (aucun rendu).
   cat : arme · armure · accessoire · conso · materiau · quete
   ========================================================= */

export const CATS = {
  arme: 'Armes',
  armure: 'Tenues et armures',
  accessoire: 'Accessoires',
  conso: 'Consommables',
  materiau: 'Matériaux',
  quete: 'Objets de quête',
};
export const RARITY = { commun: 'Commun', rare: 'Rare', epique: 'Épique', legendaire: 'Légendaire' };

/* Types de dégâts : tranchant · contondant · percant · lumiere */
export const ITEMS = {
  /* ---------------- Armes ----------------
     wclass : lame (rapide), lourde (lente, large, repousse, brise la roche),
              distance (projectile), magie (projectile de lumière, coûte de l'énergie) */
  baton: { cat: 'arme', name: 'Bâton de voyage', icon: 'staff', rarity: 'commun', wclass: 'lame', dmg: 'contondant', atk: 6, rate: 1.15, reach: 2.2, arc: 1.9, price: 0, sell: 0, model: 'baton',
    desc: 'Un bâton de frêne poli par des années de marche. Il ne coupe rien, mais il rassure.' },
  epee_courte: { cat: 'arme', name: 'Épée courte', icon: 'sword', rarity: 'commun', wclass: 'lame', dmg: 'tranchant', atk: 9, rate: 1.25, reach: 2.2, arc: 1.8, price: 140, sell: 40, model: 'epee', cuts: true,
    desc: 'Une lame simple et fiable, forgée à Havre-Aube. Elle tranche les ronces.' },
  epee_aube: { cat: 'arme', name: 'Épée de l’Aube', icon: 'sword-aube', rarity: 'rare', wclass: 'lame', dmg: 'tranchant', atk: 13, rate: 1.3, reach: 2.35, arc: 2.0, price: 0, sell: 0, model: 'epee_aube', cuts: true, bonus: { brume: 1.25 },
    desc: 'Trempée dans la brume condensée, elle garde un reflet de l’aurore. Efficace contre les créatures de la Brume.' },
  marteau: { cat: 'arme', name: 'Marteau de pierre', icon: 'hammer', rarity: 'rare', wclass: 'lourde', dmg: 'contondant', atk: 22, rate: 0.62, reach: 2.5, arc: 2.6, knock: 3.2, price: 0, sell: 0, model: 'marteau', breaks: true,
    desc: 'Lourd, lent, irrésistible. Il brise les roches fissurées et les boucliers.' },
  fronde: { cat: 'arme', name: 'Fronde de lumière', icon: 'sling', rarity: 'rare', wclass: 'distance', dmg: 'percant', atk: 7, rate: 1.7, proj: { speed: 20, range: 15, size: 0.16, color: '#ffe2a0' }, price: 260, sell: 80, model: 'fronde',
    desc: 'Elle projette des billes de lumière solide. Parfaite pour viser de loin.' },
  sceptre: { cat: 'arme', name: 'Sceptre de Fia', icon: 'scepter', rarity: 'epique', wclass: 'magie', dmg: 'lumiere', atk: 15, rate: 0.95, energy: 10, proj: { speed: 15, range: 13, size: 0.26, color: '#9fe9ff', pierce: true }, price: 0, sell: 0, model: 'sceptre',
    desc: 'Fia y concentre sa lumière : chaque tir traverse plusieurs ennemis. Coûte de l’énergie.' },

  epee_verre: { cat: 'arme', name: 'Lame de verre', icon: 'sword', rarity: 'rare', wclass: 'lame', dmg: 'tranchant', atk: 15, rate: 1.3, reach: 2.3, arc: 2.0, price: 0, sell: 110, model: 'epee', cuts: true,
    desc: 'Taillée dans un vitrail du temple. Elle tranche net et renvoie la lumière.' },

  /* ---------------- Tenues et armures (emplacement : armure) ---------------- */
  manteau_verre: { cat: 'armure', name: 'Manteau de verre filé', icon: 'cloak', rarity: 'epique', def: 9, speed: 0.04, price: 0, sell: 180, desc: 'Un manteau tissé de fils de verre, offert par Vitrebourg. Il renvoie la lumière et amortit les coups.' },
  veste_voyage: { cat: 'armure', name: 'Veste de voyage', icon: 'tunic', rarity: 'commun', def: 1, price: 0, sell: 0, desc: 'Confortable et chaude. Elle protège surtout du vent.' },
  veste_cuir: { cat: 'armure', name: 'Veste de cuir', icon: 'armor', rarity: 'commun', def: 3, price: 160, sell: 50, desc: 'Du cuir épais, cousu double. Les épines y restent plantées au lieu de te piquer.' },
  cape_exploration: { cat: 'armure', name: 'Cape d’exploration', icon: 'cloak', rarity: 'rare', def: 2, speed: 0.06, price: 240, sell: 70, desc: 'Légère et pleine de poches. On marche plus vite quand rien ne gêne.' },
  plastron_ecailles: { cat: 'armure', name: 'Plastron d’écailles', icon: 'armor-scale', rarity: 'rare', def: 6, price: 0, sell: 120, desc: 'Des écailles de pierre polie montées sur fibre de ronce. Fabriqué à la forge de Bran.' },

  tunique_vitrail: { cat: 'armure', name: 'Tunique de vitrail', icon: 'tunic', rarity: 'rare', def: 7, price: 380, sell: 130, desc: 'Des écailles de verre cousues sur du lin renforcé. Étonnamment légère.' },

  /* ---------------- Accessoires (2 emplacements) ---------------- */
  anneau_prisme: { cat: 'accessoire', name: 'Anneau de prisme', icon: 'ring', rarity: 'rare', hp: 10, en: 15, price: 0, sell: 100, desc: '+10 points de vie et +15 énergie maximum.' },
  anneau_vie: { cat: 'accessoire', name: 'Anneau de vie', icon: 'ring', rarity: 'rare', hp: 20, price: 0, sell: 90, desc: '+20 points de vie maximum.' },
  amulette_lume: { cat: 'accessoire', name: 'Amulette de Lume', icon: 'amulet', rarity: 'rare', en: 25, regen: 0.5, price: 0, sell: 90, desc: '+25 énergie maximum. L’énergie revient plus vite.' },
  bottes_legeres: { cat: 'accessoire', name: 'Bottes légères', icon: 'boots', rarity: 'rare', speed: 0.1, price: 320, sell: 100, desc: 'On a l’impression de flotter. Vitesse +10 %.' },
  talisman_brume: { cat: 'accessoire', name: 'Talisman de brume', icon: 'talisman', rarity: 'epique', resBrume: 0.25, price: 420, sell: 140, desc: 'Les créatures de la Brume te font 25 % de dégâts en moins.' },

  anneau_canopee: { cat: 'accessoire', name: 'Anneau de canopée', icon: 'ring', rarity: 'rare', en: 15, speed: 0.06, price: 0, sell: 110, desc: '+15 énergie maximum et vitesse +6 %. Taillé dans une branche de verre, il ne pèse rien.' },

  /* ---------------- Consommables ---------------- */
  potion: { cat: 'conso', name: 'Potion de soin', icon: 'potion-red', rarity: 'commun', heal: 40, price: 30, sell: 10, desc: 'Rend 40 points de vie.' },
  grande_potion: { cat: 'conso', name: 'Grande potion', icon: 'potion-big', rarity: 'rare', heal: 100, price: 85, sell: 28, desc: 'Rend 100 points de vie.' },
  elixir: { cat: 'conso', name: 'Élixir d’énergie', icon: 'potion-blue', rarity: 'commun', energy: 50, price: 40, sell: 12, desc: 'Rend 50 points d’énergie.' },
  tisane_foret: { cat: 'conso', name: 'Tisane de givre', icon: 'potion-blue', rarity: 'commun', heal: 55, price: 45, sell: 15, desc: 'Rend 55 points de vie. Elle sent la menthe et la neige.' },
  pain_miel: { cat: 'conso', name: 'Pain de miel', icon: 'bread', rarity: 'commun', heal: 25, regen: 12, price: 0, sell: 8, desc: 'Rend 25 points de vie, puis 12 de plus pendant quelques secondes. La recette de Maëlle.' },

  /* ---------------- Matériaux ---------------- */
  brume: { cat: 'materiau', name: 'Brume condensée', icon: 'mist', rarity: 'commun', price: 30, sell: 12, desc: 'Une goutte de brume devenue presque solide. Les Brumelins en laissent derrière eux.' },
  fibre: { cat: 'materiau', name: 'Fibre de ronce', icon: 'fiber', rarity: 'commun', price: 16, sell: 6, desc: 'Souple et très solide une fois tressée.' },
  pierre: { cat: 'materiau', name: 'Pierre polie', icon: 'stone', rarity: 'commun', price: 24, sell: 9, desc: 'Une pierre lisse et dense, parfaite pour la forge.' },
  bois: { cat: 'materiau', name: 'Bois clair', icon: 'wood', rarity: 'commun', price: 14, sell: 5, desc: 'Du bois léger des îles hautes.' },
  fleur_miel: { cat: 'materiau', name: 'Fleur de miel', icon: 'flower', rarity: 'commun', price: 0, sell: 0, desc: 'Une fleur dorée au parfum sucré. Maëlle en met dans son pain.' },
  eclat_verre: { cat: 'materiau', name: 'Éclat de verre', icon: 'shard', rarity: 'commun', price: 34, sell: 14, desc: 'Un éclat de vitrail encore tiède. Les verriers de Vitrebourg en raffolent.' },
  givre_foret: { cat: 'materiau', name: 'Givre de sous-bois', icon: 'flower', rarity: 'commun', price: 14, sell: 7, desc: 'Une fleur transparente qui pousse au pied des arbres de verre.' },
  larme_verre: { cat: 'materiau', name: 'Larme du Gardien', icon: 'tear', rarity: 'epique', price: 0, sell: 220, desc: 'Un cristal vert, limpide. La forge peut en tirer le meilleur d’une arme.' },
  larme_colosse: { cat: 'materiau', name: 'Larme du Colosse', icon: 'tear', rarity: 'epique', price: 0, sell: 200, desc: 'Un cristal violet, encore tiède. La forge peut en tirer le meilleur d’une arme.' },

  /* ---------------- Objets de quête (non vendables) ---------------- */
  lentille: { cat: 'quete', name: 'Lentille d’Aube', icon: 'lens', rarity: 'legendaire', desc: 'Le cœur du phare de l’Aube. Elle concentre la lumière au point de la rendre solide.' },
  cle_sanctuaire: { cat: 'quete', name: 'Clé du Sanctuaire', icon: 'key', rarity: 'rare', desc: 'Une petite clé de bronze couverte de givre violet.' },
  cle_orin: { cat: 'quete', name: 'Clé de la maison d’Orin', icon: 'key-gold', rarity: 'rare', desc: 'Lison te l’a confiée. La maison du cartographe n’a pas été ouverte depuis des années.' },
  pendentif: { cat: 'quete', name: 'Pendentif de Tobias', icon: 'pendant', rarity: 'commun', desc: 'Un petit soleil en laiton, accroché à un lacet bleu.' },
  marteau_bran: { cat: 'quete', name: 'Vieux marteau de Bran', icon: 'hammer-small', rarity: 'commun', desc: 'Le marteau de forge que Bran a perdu dans la lande. Le manche porte ses initiales.' },
  prisme_vert: { cat: 'quete', name: 'Fragment vert du Prisme', icon: 'shard', rarity: 'legendaire', desc: 'Un éclat du Grand Prisme, vert comme une feuille à contre-jour. Il chante doucement.' },
  cle_temple: { cat: 'quete', name: 'Clé du Temple de Verre', icon: 'key', rarity: 'rare', desc: 'Une clé de verre taillé. Elle laisse passer la lumière sans la retenir.' },
  grappin: { cat: 'quete', name: 'Grappin de lumière', icon: 'hook', rarity: 'epique', desc: 'Un câble de lumière solidifié par un éclat de vitrail, d’après les plans d’Orin. Il s’accroche aux poteaux de verre, de l’autre côté d’un vide.',
    tip: 'Tiens-toi à côté d’un poteau de verre, tourné vers le poteau d’en face, puis appuie sur Interagir : le câble te tire de l’autre côté. Le poteau d’arrivée te ramène, lui aussi.' },
  graine_canopee: { cat: 'quete', stack: true, name: 'Graine de canopée', icon: 'seed', rarity: 'commun', desc: 'Une graine translucide, tiède, qui germe dans la lumière. Ficus en rêve.' },
  colis_galet: { cat: 'quete', name: 'Colis de Galet', icon: 'bag', rarity: 'commun', desc: 'Un paquet ficelé avec soin. Galet a écrit « Pour Perle, urgent » dessus, deux fois.' },
  sachet_sable: { cat: 'quete', name: 'Sachet de sable fin', icon: 'bag', rarity: 'commun', desc: 'Du sable de la Lisière, tamisé trois fois. Perle l’envoie à Ficus pour ses pots de verre.' },
  fragment_coeur: { cat: 'quete', name: 'Fragment de cœur', icon: 'heart', rarity: 'rare', instant: true, desc: '+15 points de vie maximum, pour toujours.' },
};

/* Amélioration des armes et armures à la forge (niveau 0 → 3 pour les armes, 0 → 2 pour les armures) */
export const UPGRADES = {
  arme: [
    { ecus: 80, mats: { fibre: 2, pierre: 1 }, bonus: 0.25 },
    { ecus: 180, mats: { pierre: 3, brume: 3 }, bonus: 0.5 },
    { ecus: 360, mats: { larme_colosse: 1, pierre: 2 }, bonus: 0.85 },
  ],
  armure: [
    { ecus: 100, mats: { fibre: 3 }, bonus: 2 },
    { ecus: 220, mats: { pierre: 3, brume: 2 }, bonus: 4 },
  ],
};
/* Fabrication à la forge */
export const RECIPES = {
  plastron_ecailles: { ecus: 250, mats: { pierre: 4, fibre: 3 } },
};

export const item = (id) => ITEMS[id] || null;
export const isStackable = (id) => ['conso', 'materiau'].includes((ITEMS[id] || {}).cat) || id === 'fragment_coeur' || !!(ITEMS[id] || {}).stack;

/* ACTE IV : Les Abysses Miroirs (js/data/abysses.js) */
import { ITEMS_A4, RECIPES_A4 } from './abysses.js';
Object.assign(ITEMS, ITEMS_A4); Object.assign(RECIPES, RECIPES_A4);
