/* =========================================================
   LUMEN — portails de lumière (Acte VI, la Citadelle du Zénith).
   Un portail est un objet de la grille { t: 'portal', pair: 'a' } : les portails de même « pair »
   et de la même zone sont jumeaux. Un faisceau qui entre dans l’un ressort par l’autre, dans la MÊME direction et avec
   la même couleur (logic.js : trace). Ni Lyra ni les créatures ne les traversent : ce sont des
   portes pour la lumière seulement.
   Capacité : st.player.abilities.portails (donnée avec le 5e fragment ; l’Acte VI l’éveille aussi,
   voir data/zenith.js). Tant qu’elle manque, main.js pose isl.portalsOff = true et les faisceaux
   s’arrêtent contre les portails, comme contre un mur. Les outils de vérification (Node) les
   considèrent toujours actifs.
   Pur : aucun import, utilisable sans navigateur.
   ========================================================= */

export const isPortal = (e) => !!e && e.t === 'portal';

/* Jumeau d’un portail (même paire, autre case), ou null */
export function portalTwin(isl, e) {
  if (!isPortal(e)) return null;
  const list = isl.portalIndex || (isl.portalIndex = isl.ents.filter(isPortal));
  return list.find((p) => p !== e && p.pair === e.pair && p.zone === e.zone) || null;   /* les paires sont propres à une zone : « a » existe dans chaque salle */
}

/* Les portails sont-ils actifs ? (vrai par défaut : les outils les supposent éveillés) */
export const portalsOn = (isl) => !isl.portalsOff;
