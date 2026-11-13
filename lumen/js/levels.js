/* =========================================================
   LUMEN — liste des îles.
   Chaque île est un fichier de données dans js/islands/ (généré et vérifié par tools/).
   Format d'une zone : map (texte), ents (objets en coordonnées locales), ox/oy (position),
   spawn (arrivée), entryGate (pont d'accès), barrier (porte des barrières « x »), hint, title.
   ========================================================= */
import aube from './islands/aube.js';
import foret from './islands/foret.js';
import pics from './islands/pics.js';   /* ACTE V */

export const ISLANDS = [aube, foret, pics];

/* Données propres à chaque île, utilisées par le moteur (point de repos, ville, voyage).
   home : lit où l'on se repose et où l'on réapparaît · town : zone du village · title : nom affiché
   finale : bannière une fois la balise allumée · actEndFlag : drapeau (posé par un dialogue) qui affiche l'écran de fin d'acte
   restoreBoss : la défaite du boss compte dans la restauration des couleurs de l'île */
export const ISLAND_META = {
  foret: { home: { zone: 'auberge_f', cell: [9, 3] }, town: 'vitrebourg', title: 'La Forêt de Verre', inn: 'à la Rosée', warp: 'vitrebourg', boss: 'boss_verre', first: 'q_verre', restoreBoss: true,
    finale: { title: 'Le Phare de Verre brille', sub: 'Retourne voir Ambre à Vitrebourg' }, actEndFlag: 'acte2_fini' },
  /* ACTE V : arrivée normale depuis les Abysses : travel { to: 'pics', zone: 'col', cell: [12, 7] } */
  pics: { home: { zone: 'auberge_p', cell: [9, 3] }, town: 'col', title: 'Les Pics du Vent', inn: 'au Chamois endormi', warp: 'col', boss: 'boss_meunier', first: 'q_pics', restoreBoss: true,
    finale: { title: 'Le Phare des Vents brille', sub: 'Retourne voir Borée au Col' }, actEndFlag: 'acte5_fini', finaleGive: 'prisme_violet' },
  aube: { home: { zone: 'auberge_in', cell: [9, 3] }, town: 'havre', title: 'L’Île de l’Aube', inn: 'au Lampion', warp: 'havre', boss: 'boss_colosse',
    finale: { title: 'Le phare de l’Aube brille', sub: 'Retourne voir Séléné' }, actEndFlag: 'acte1_fini' },
};

/* Îles prévues (voir DESIGN.md) */
export const UPCOMING = [
  { num: 3, name: 'Le Désert des Échos', what: 'porter les miroirs et les prismes' },
  { num: 4, name: 'Les Abysses Miroirs', what: 'Lyra devient une source de lumière' },
  { num: 5, name: 'Les Pics du Vent', what: 'planer et relais temporisés' },
  { num: 6, name: 'La Citadelle du Zénith', what: 'portails et phare final' },
];
