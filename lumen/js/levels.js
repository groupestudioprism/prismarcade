/* =========================================================
   LUMEN — liste des îles.
   Chaque île est un fichier de données dans js/islands/ (généré et vérifié par tools/).
   Format d'une zone : map (texte), ents (objets en coordonnées locales), ox/oy (position),
   spawn (arrivée), entryGate (pont d'accès), barrier (porte des barrières « x »), hint, title.
   ========================================================= */
import aube from './islands/aube.js';

export const ISLANDS = [aube];

/* Îles prévues (voir DESIGN.md) */
export const UPCOMING = [
  { num: 2, name: 'La Forêt de Verre', what: 'vitraux et mélange des couleurs' },
  { num: 3, name: 'Le Désert des Échos', what: 'porter les miroirs et les prismes' },
  { num: 4, name: 'Les Abysses Miroirs', what: 'Lyra devient une source de lumière' },
  { num: 5, name: 'Les Pics du Vent', what: 'planer et relais temporisés' },
  { num: 6, name: 'La Citadelle du Zénith', what: 'portails et phare final' },
];
