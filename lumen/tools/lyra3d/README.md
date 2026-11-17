# Modèle de Lyra (source)

- `lyra.mjs` : construction du modèle (formes, couleurs, contours, poses clés, animations). C'est la **source unique** du modèle.
- `export.mjs` : génère `Lyra_Fia.glb`, la table des images clés et les fiches de combat. Commande : `npm i three@0.160.0 && node export.mjs out`.
- `mkviewer.mjs` + `viewer.template.html` : page d'aperçu (`node mkviewer.mjs cdn`).

Le jeu utilise `js/world/lyra.js`, copie de `lyra.mjs` avec en plus :
- la conversion des couleurs en linéaire ;
- la classe `Lyra` (personnalisation, armes, mélange des animations).

Toute modification de forme ou de pose doit être reportée dans les deux fichiers.

## Modèle v2 (17/11/2026)
- Géométrie refaite d'après la planche de référence (6 vues) ; pans de tunique articulés (`Flap_*`), cape sur un axe commun.
- Correcteurs de pose (`finishPose`) : pans, bras, bâton, sol, Fia, cape. Aucune pièce n'en traverse une autre.
- `node clip.mjs all 1` : contrôle des traversées sur chaque image de chaque animation (doit afficher `TOTAL 0`).
- `node smooth.mjs` : sauts d'une image à l'autre (bâton, mains, cape, pans, Fia).
- Nouvelle animation `USE_ITEM` (prisme, clé, porte, coffre), 1,2 s, l'objet agit à 0,50 s.
- Le fichier du jeu `js/world/lyra.js` est généré à partir de `lyra.mjs` (couleurs en linéaire + classe `Lyra`) : toute modification se fait dans `lyra.mjs`, puis se reporte.
