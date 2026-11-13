/* =========================================================
   LUMEN — ACTE III : boutiques de la Cité des Échos (fusionnées dans SHOPS).
   ========================================================= */
export const DESERT_SHOPS = {
  djamila: {
    name: 'Apothicaire de Djamila', buyRate: 0, items: [
      { id: 'potion', stock: 6, restock: 6 },
      { id: 'datte', stock: 8, restock: 6 },
      { id: 'the_menthe', stock: 4, restock: 4 },
      { id: 'elixir', stock: 4, restock: 4 },
      { id: 'grande_potion', stock: 3, restock: 3 },
      { id: 'elixir_echo', stock: 2, restock: 2, if: (q) => q.quest('q_temple') === 'done' },
    ],
  },
  kassim: {
    name: 'Caravane de Kassim', buyRate: 1, items: [
      { id: 'tunique_nomade', stock: 1 },
      { id: 'arc_dunes', stock: 1 },
      { id: 'amulette_scarabee', stock: 1, if: (q) => q.quest('q_echos') === 'done' },
      { id: 'pierre', stock: 6, restock: 4 },
      { id: 'fibre', stock: 6, restock: 4 },
      { id: 'bois', stock: 6, restock: 4 },
      { unlock: 'teinte_sable', name: 'Teinte sable', icon: 'dye', hex: '#d9b26a', price: 60, desc: 'Pour la cape.' },
      { unlock: 'teinte_rouille', name: 'Teinte rouille', icon: 'dye', hex: '#a8502a', price: 60, desc: 'Pour la cape.' },
      { unlock: 'teinte_oasis', name: 'Teinte vert oasis', icon: 'dye', hex: '#3f8a5a', price: 80, desc: 'Pour la cape.' },
    ],
  },
  rafik: {
    name: 'Forge de Rafik', buyRate: 0, discountFlag: 'forge_remise', items: [
      { id: 'pierre', stock: 5, restock: 3 },
      { id: 'verre_sable', stock: 4, restock: 3 },
      { id: 'carapace_sable', stock: 2, restock: 2 },
      { id: 'dard_scorpion', stock: 2, restock: 2 },
    ],
  },
};
