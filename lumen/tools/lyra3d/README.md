# Modèle de Lyra (source)

- `lyra.mjs` : construction du modèle (formes, couleurs, contours, poses clés, animations). C'est la **source unique** du modèle.
- `export.mjs` : génère `Lyra_Fia.glb`, la table des images clés et les fiches de combat. Commande : `npm i three@0.160.0 && node export.mjs out`.
- `mkviewer.mjs` + `viewer.template.html` : page d'aperçu (`node mkviewer.mjs cdn`).

Le jeu utilise `js/world/lyra.js`, copie de `lyra.mjs` avec en plus :
- la conversion des couleurs en linéaire ;
- la classe `Lyra` (personnalisation, armes, mélange des animations).

Toute modification de forme ou de pose doit être reportée dans les deux fichiers.
