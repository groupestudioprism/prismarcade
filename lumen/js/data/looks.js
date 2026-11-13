/* =========================================================
   LUMEN — personnalisation de Lyra (visible sur le modèle 3D)
   unlock : null = disponible dès le départ ; sinon identifiant
   de déblocage (achat, quête, exploration), voir state.looks.
   ========================================================= */

export const HAIR_STYLES = [
  { id: 'carre', name: 'Carré' },
  { id: 'court', name: 'Court' },
  { id: 'long', name: 'Long' },
  { id: 'tresse', name: 'Tresse' },
  { id: 'chignon', name: 'Chignon' },
  { id: 'boucles', name: 'Boucles' },
];
export const HAIR_COLORS = [
  { id: 'chatain', name: 'Châtain', hex: '#5b3a2b' },
  { id: 'noir', name: 'Noir bleuté', hex: '#262033' },
  { id: 'auburn', name: 'Auburn', hex: '#8f3d22' },
  { id: 'blond', name: 'Blond miel', hex: '#d6aa5c' },
  { id: 'argent', name: 'Argent', hex: '#cfcbe0' },
  { id: 'rose', name: 'Rose aurore', hex: '#ea8fb8', unlock: 'teinture_rose' },
  { id: 'azur', name: 'Azur', hex: '#5fa8e8', unlock: 'teinture_azur' },
];
export const SKIN = [
  { id: 'p1', hex: '#f6e3d3' }, { id: 'p2', hex: '#efd0b4' }, { id: 'p3', hex: '#d9ab84' },
  { id: 'p4', hex: '#a8714d' }, { id: 'p5', hex: '#6e4530' },
];
export const EYES = [
  { id: 'nuit', hex: '#1d1b3a' }, { id: 'foret', hex: '#2f6b4f' }, { id: 'ciel', hex: '#3b6fc0' },
  { id: 'ambre', hex: '#9a5a22' }, { id: 'lilas', hex: '#8a5bd6' },
];
export const OUTFITS = [
  { id: 'voyage', name: 'Tenue de voyage', desc: 'Cape à capuche et tunique.' },
  { id: 'exploratrice', name: 'Tenue d’exploratrice', desc: 'Cape courte, sacoche et bottes hautes.', unlock: 'tenue_exploratrice' },
  { id: 'chasseur', name: 'Tenue de chasseur de brume', desc: 'Épaulières et cape sombre.', unlock: 'tenue_chasseur' },
  { id: 'aube', name: 'Robe de l’Aube', desc: 'La robe des gardiens du phare.', unlock: 'tenue_aube' },
  { id: 'prisme', name: 'Étoffe prismatique', desc: 'Elle change de couleur avec la lumière.', unlock: 'tenue_prisme' },
];
export const CLOAK_COLORS = [
  { id: 'indigo', name: 'Indigo', hex: '#3e3f9c' },
  { id: 'nuit', name: 'Bleu nuit', hex: '#272a5c' },
  { id: 'ciel', name: 'Ciel', hex: '#4f7fd0' },
  { id: 'pourpre', name: 'Pourpre', hex: '#7a3c8f', unlock: 'teinte_pourpre' },
  { id: 'emeraude', name: 'Émeraude', hex: '#2f7d5b', unlock: 'teinte_emeraude' },
  { id: 'bordeaux', name: 'Bordeaux', hex: '#7d2a3a', unlock: 'teinte_bordeaux' },
  { id: 'ardoise', name: 'Ardoise', hex: '#4a5466', unlock: 'teinte_ardoise' },
  { id: 'or', name: 'Or pâle', hex: '#c99a3a', unlock: 'teinte_or' },
  { id: 'ambre', name: 'Ambre', hex: '#d9892b', unlock: 'teinte_ambre' },
  { id: 'turquoise', name: 'Turquoise', hex: '#2a9d8f', unlock: 'teinte_turquoise' },
  { id: 'sable', name: 'Sable', hex: '#d9b26a', unlock: 'teinte_sable' },   /* ACTE III */
  { id: 'rouille', name: 'Rouille', hex: '#a8502a', unlock: 'teinte_rouille' },
  { id: 'oasis', name: 'Vert oasis', hex: '#3f8a5a', unlock: 'teinte_oasis' },
];
export const TRIMS = [
  { id: 'or', name: 'Or', hex: '#f0c66b' },
  { id: 'argent', name: 'Argent', hex: '#d7dbe8' },
  { id: 'cuivre', name: 'Cuivre', hex: '#c9805a' },
  { id: 'rose', name: 'Rose', hex: '#f6a5c8', unlock: 'teinte_pourpre' },
];
export const ACCESSORIES = [
  { id: 'aucun', name: 'Aucun' },
  { id: 'plume', name: 'Plume d’Aube', unlock: 'acc_plume' },
  { id: 'couronne', name: 'Couronne de fleurs', unlock: 'acc_couronne' },
  { id: 'foulard', name: 'Foulard', unlock: 'acc_foulard' },
  { id: 'boucles', name: 'Boucles d’oreilles', unlock: 'acc_boucles' },
  { id: 'lunettes', name: 'Lunettes d’aviatrice', unlock: 'acc_lunettes' },
];
export const HEIGHTS = [
  { id: 'petite', name: 'Petite', k: 0.94 },
  { id: 'moyenne', name: 'Moyenne', k: 1 },
  { id: 'grande', name: 'Grande', k: 1.06 },
];

export const DEFAULT_LOOK = { hair: 'carre', hairColor: 'chatain', skin: 'p1', eyes: 'nuit', outfit: 'voyage', cloak: 'indigo', trim: 'or', acc: 'aucun', height: 'moyenne', hood: true };

/* Noms lisibles des déblocages (affichés en toast) */
export const UNLOCK_NAMES = {
  teinture_rose: 'Teinture rose aurore (cheveux)', teinture_azur: 'Teinture azur (cheveux)',
  tenue_exploratrice: 'Tenue d’exploratrice', tenue_chasseur: 'Tenue de chasseur de brume', tenue_aube: 'Robe de l’Aube', tenue_prisme: 'Étoffe prismatique',
  teinte_pourpre: 'Teinte pourpre', teinte_emeraude: 'Teinte émeraude', teinte_bordeaux: 'Teinte bordeaux', teinte_ardoise: 'Teinte ardoise', teinte_or: 'Teinte or pâle', teinte_ambre: 'Teinte ambre', teinte_turquoise: 'Teinte turquoise',
  teinte_sable: 'Teinte sable', teinte_rouille: 'Teinte rouille', teinte_oasis: 'Teinte vert oasis',   /* ACTE III */
  acc_plume: 'Plume d’Aube', acc_couronne: 'Couronne de fleurs', acc_foulard: 'Foulard', acc_boucles: 'Boucles d’oreilles', acc_lunettes: 'Lunettes d’aviatrice',
};

export const byId = (list, id) => list.find((x) => x.id === id) || list[0];

/* ACTE IV : Les Abysses Miroirs (js/data/abysses.js) */
import { CLOAKS_A4, HAIRS_A4, UNLOCKS_A4 } from './abysses.js';
CLOAK_COLORS.push(...CLOAKS_A4); HAIR_COLORS.push(...HAIRS_A4); Object.assign(UNLOCK_NAMES, UNLOCKS_A4);
