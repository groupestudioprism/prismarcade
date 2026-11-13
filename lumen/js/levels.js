/* =========================================================
   LUMEN — liste des îles.
   Chaque île est un fichier de données dans js/islands/ (généré et vérifié par tools/).
   Format d'une zone : map (texte), ents (objets en coordonnées locales), ox/oy (position),
   spawn (arrivée), entryGate (pont d'accès), barrier (porte des barrières « x »), hint, title.
   ========================================================= */
import aube from './islands/aube.js';
import foret from './islands/foret.js';
import zenith from './islands/zenith.js';   /* ACTE VI */

export const ISLANDS = [aube, foret, zenith];   /* ACTE VI : à la fusion, ajouter ici les îles des Actes III à V entre foret et zenith */

/* Données propres à chaque île, utilisées par le moteur (point de repos, ville, voyage).
   home : lit où l'on se repose et où l'on réapparaît · town : zone du village · title : nom affiché
   finale : bannière une fois la balise allumée · actEndFlag : drapeau (posé par un dialogue) qui affiche l'écran de fin d'acte
   restoreBoss : la défaite du boss compte dans la restauration des couleurs de l'île */
export const ISLAND_META = {
  foret: { home: { zone: 'auberge_f', cell: [9, 3] }, town: 'vitrebourg', title: 'La Forêt de Verre', inn: 'à la Rosée', warp: 'vitrebourg', boss: 'boss_verre', first: 'q_verre', restoreBoss: true,
    finale: { title: 'Le Phare de Verre brille', sub: 'Retourne voir Ambre à Vitrebourg' }, actEndFlag: 'acte2_fini' },
  /* ACTE VI */
  zenith: { home: { zone: 'auberge_z', cell: [9, 3] }, town: 'porte', title: 'La Citadelle du Zénith', inn: 'à l’Aurore', warp: 'porte', boss: 'boss_zenith', first: 'q_porte', restoreBoss: true,
    finale: { title: 'Le Phare du Zénith brille', sub: 'La lumière est partagée' }, actEndFlag: 'fin_jeu' },
  aube: { home: { zone: 'auberge_in', cell: [9, 3] }, town: 'havre', title: 'L’Île de l’Aube', inn: 'au Lampion', warp: 'havre', boss: 'boss_colosse',
    finale: { title: 'Le phare de l’Aube brille', sub: 'Retourne voir Séléné' }, actEndFlag: 'acte1_fini' },
};

/* Îles prévues (voir DESIGN.md) : il n'en reste aucune, le dernier acte est jouable */
export const UPCOMING = [];
