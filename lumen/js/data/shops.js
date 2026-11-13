/* =========================================================
   LUMEN — boutiques. stock : quantité de départ (null = illimité),
   restock : quantité rendue à chaque repos à l'auberge.
   if : condition de déblocage (q, voir npcs.js). unlock : déblocage d'apparence vendu.
   Prix : ITEMS[id].price sauf price ici. Remises : flags (voir game/shops.js).
   ========================================================= */
export const SHOPS = {
  ysolde: {
    name: 'Apothicaire d’Ysolde', buyRate: 0, items: [
      { id: 'potion', stock: 6, restock: 6 },
      { id: 'elixir', stock: 4, restock: 4 },
      { id: 'grande_potion', stock: 2, restock: 2, if: (q) => q.flag('ysolde_plus') },
    ],
  },
  bran: {
    name: 'Forge de Bran', buyRate: 0, discountFlag: 'forge_remise', items: [
      { id: 'epee_courte', stock: 1, if: (q) => !q.has('epee_aube', 1) },
      { id: 'veste_cuir', stock: 1 },
      { id: 'pierre', stock: 5, restock: 3 },
    ],
  },
  pell: {
    name: 'Atelier de Pell', buyRate: 0, items: [
      { id: 'cape_exploration', stock: 1 },
      { unlock: 'tenue_exploratrice', name: 'Tenue d’exploratrice', icon: 'outfit', price: 220, desc: 'Cape courte, sacoche et bottes hautes. Apparence.' },
      { unlock: 'teinte_pourpre', name: 'Teinte pourpre', icon: 'dye', hex: '#7a3c8f', price: 60, desc: 'Pour la cape (et une bordure rose).' },
      { unlock: 'teinte_emeraude', name: 'Teinte émeraude', icon: 'dye', hex: '#2f7d5b', price: 60, desc: 'Pour la cape.' },
      { unlock: 'teinte_bordeaux', name: 'Teinte bordeaux', icon: 'dye', hex: '#7d2a3a', price: 60, desc: 'Pour la cape.' },
      { unlock: 'teinture_rose', name: 'Teinture rose aurore', icon: 'dye', hex: '#ea8fb8', price: 90, desc: 'Pour les cheveux.' },
      { unlock: 'acc_foulard', name: 'Foulard', icon: 'scarf', price: 70, desc: 'Accessoire.' },
      { unlock: 'acc_boucles', name: 'Boucles d’oreilles', icon: 'earrings', price: 50, desc: 'Accessoire.' },
    ],
  },
  gaspard: {
    name: 'Comptoir de Gaspard', buyRate: 1, items: [
      { id: 'fibre', stock: 8, restock: 5 },
      { id: 'pierre', stock: 6, restock: 4 },
      { id: 'bois', stock: 8, restock: 5 },
      { id: 'brume', stock: 2, restock: 2 },
      { id: 'bottes_legeres', stock: 1, if: (q) => q.quest('q_lentille') === 'done' },
      { unlock: 'acc_lunettes', name: 'Lunettes d’aviatrice', icon: 'goggles', price: 120, desc: 'Accessoire. « Pour pêcher les nuages sans prendre de vent dans l’œil. »' },
    ],
  },
  lison: {
    name: 'Curiosités d’Orin', buyRate: 0, items: [
      { id: 'fronde', stock: 1 },
      { id: 'talisman_brume', stock: 1 },
      { id: 'grande_potion', stock: 1, restock: 1 },
    ],
  },
  /* ---------------- Forêt de Verre ---------------- */
  opaline: {
    name: 'Apothicaire d’Opaline', buyRate: 0, items: [
      { id: 'potion', stock: 6, restock: 6 },
      { id: 'tisane_foret', stock: 4, restock: 4 },
      { id: 'elixir', stock: 4, restock: 4 },
      { id: 'grande_potion', stock: 2, restock: 2 },
    ],
  },
  silex: {
    name: 'Verrerie de Silex', buyRate: 0, items: [
      { id: 'tunique_vitrail', stock: 1 },
      { id: 'epee_courte', stock: 1, if: (q) => !q.has('epee_aube', 1) && !q.has('epee_courte', 1) },
      { id: 'pierre', stock: 5, restock: 3 },
    ],
  },
  galet: {
    name: 'Marché du verre', buyRate: 1, items: [
      { id: 'eclat_verre', stock: 6, restock: 4 },
      { id: 'givre_foret', stock: 4, restock: 3 },
      { id: 'fibre', stock: 6, restock: 4 },
      { id: 'bois', stock: 6, restock: 4 },
      { id: 'brume', stock: 2, restock: 2 },
    ],
  },
};

/* ACTE VI : la Citadelle du Zénith */
import { ZENITH_SHOPS } from './zenith.js';
Object.assign(SHOPS, ZENITH_SHOPS);
