# Modèles 3D de LUMEN (personnages, créatures, boss, objets)

Tous les modèles suivent la méthode validée sur Lyra : planche de contrôle, modèle par code, animations, **contrôle
automatique des traversées**, aperçu animé, puis intégration au jeu. Rien n'est modélisé dans un logiciel 3D.

## Fichiers
- `js/world/kit3d.js` : le kit commun (géométrie facettée, contours noirs, poses, export, vue de jeu). **Ne pas le modifier
  pour un modèle** : si une aide manque, l'écrire dans le fichier du modèle et le signaler.
- `js/world/models/<id>.js` : un fichier par modèle. **Patron à copier : `brumelin.js`.** Lyra (`js/world/lyra.js`,
  `tools/lyra3d/`) est l'exemple complet d'un personnage avec arme et vêtements.
- `tools/models3d/` : outils. Les lancer depuis ce dossier.

## Contrat d'un modèle
```js
export const model = { id, file, name, subtitle, PALETTE, REST, JOINTS, build(pal), ANIMS, LABELS, MOVES, ignore, ground };
export function createView(tint) { return creatureView(model, drive, options); }   // contrat { root, mat, animate(dt, s) } du jeu
```
- `REST` : pose de repos, `{ Nom: { p:[x,y,z] m, r:[x,y,z] degrés, s? } }`. `JOINTS = Object.keys(REST)`, **la racine en premier**.
- `build(pal)` renvoie `{ root, nodes }` : un nœud nommé par articulation, pivot placé à l'articulation, hiérarchie parent/enfant.
- `ANIMS` : `{ NOM: { dur, loop, f(t) → pose } }`. Une pose donne les **écarts** par rapport au repos
  (`r` en degrés, `p` en mètres, `s` nombre ou `[sx, sy, sz]`).
- Pièce cachée au repos (regard en colère, étoiles, anneau lumineux) : `s: 0.001` dans `REST`, et `s: 1000` dans l'animation.
- `ignore` : paires de pièces dont le recouvrement est voulu, en plus des paires parent/enfant ignorées d'office.
  À garder minimal et à justifier dans le rapport.
- `ground: false` seulement pour une créature qui flotte.

## Règles de style (identiques à Lyra)
- Low-poly facetté : volumes par `loft` (anneaux empilés, `n` > 2 pour des faces plates), `prism`, `box`, `slab`, `gem`.
  **Aucune sphère, aucun cylindre lisse, aucune forme parfaitement ronde.**
- Couleurs par sommet, deux tons par matière (`[géométrie, couleur, couleur claire]`), pas de texture.
- Contour noir en géométrie : créé d'office par `part()`. Les pièces lumineuses (`mat: M.glow(...)`, `outline: false`) n'en ont pas.
- Visage et décors plats : `disc`, `star4`, `slab` posés avec `stickOn` ; les exclure du contour avec `solid: [...]`.
- Yeux expressifs et lisibles de loin (la caméra du jeu est haute et fixe, nord en haut) : silhouette nette, gros volumes.
- Chaque coup est annoncé par un geste lisible (animation `WINDUP`) : gonflement, regard qui change, membre qui se lève.
- Limites : moins de 5 000 triangles par pièce, moins de 25 000 au total, contours compris.

## Animations attendues pour une créature
`IDLE` (boucle), `MOVE` (boucle, si elle se déplace), `WINDUP`, `ATTACK`, `HURT`, `STUN` (boucle), `DEATH`, plus celles
propres à son comportement (charge, tir, garde au bouclier, fatigue d'un boss, phases). Lire l'ancienne fabrique dans
`js/world/creatures.js` et son comportement dans `js/game/combat.js` : **tous les champs de l'état `s` utilisés par
l'ancienne fabrique doivent rester pris en compte** par `drive(s, api)`.

## Outils (depuis `tools/models3d/`, après `npm i three@0.160.0 --no-save` dans `lumen/`)
```
node export.mjs <id>                       # GLB + fiche + statistiques (triangles, taille, min Y)
QA_PORT=895x python3 shot.py /tmp/x.png "m=<id>"                                    # planche 6 vues au repos
QA_PORT=895x python3 shot.py /tmp/y.png "m=<id>&poses=IDLE:0.5,ATTACK:0.2:s,..."    # jusqu'à 6 poses ; vue q (3/4), f, b, s, l, r, t
node clip.mjs <id> 1                       # contrôle des traversées sur chaque image : doit finir par TOTAL 0
node smooth.mjs <id>                       # plus grand saut d'une image à l'autre
node mkviewer.mjs <id>                     # aperçu animé out/<id>/index.html
```
`<id>` est le nom du fichier de `js/world/models/`. Un fichier qui contient plusieurs modèles (exemple : `villageois.js`, les onze
habitants de Havre-Aube) exporte `models` (un modèle par nom) et s'utilise avec `<fichier>:<nom>` : `node clip.mjs villageois:selene 1`,
`python3 shot.py /tmp/x.png "m=villageois:bran"`.
Planche de groupe (même échelle, trois quarts, couleurs du jeu, Lyra pour l'échelle) :
`python3 shot.py /tmp/tous.png "m=villageois:selene,villageois:bran&lyra=1" groupe.html 2400 1160` (options `v` = q, f, b, g (vue du jeu), `pose=ANIM:t`, `cols`).

Options de `shot.py` : `z` (zoom), `cy`, `cx` (point visé), `w` (demi-hauteur en mètres).

## Définition de « terminé »
1. `node clip.mjs <id> 1` affiche `TOTAL 0`, et la ligne « Repos » est vide ou presque (recouvrements de construction réduits).
2. Rien ne passe sous le sol ; les pieds et appuis touchent le sol.
3. La planche 6 vues et une planche par groupe d'animations ont été **regardées** : le modèle est beau, lisible, sans face
   retournée, sans trou, sans contour parasite, et chaque pose se lit.
4. `node smooth.mjs <id>` ne montre aucun saut anormal (un coup rapide peut dépasser 40° par image, pas une attente).
5. Le fichier du modèle ne dépend que de `kit3d.js`.

## Personnages non joueurs (`villageois.js`)
Une fabrique `makeModel(id)` et une fiche par habitant (`FICHES` : morphologie, coiffure, tenue, couleurs, objet de métier).
Animations : `IDLE` (respiration, clignement, geste de métier), `TALK`, `WALK` pour ceux qui se promènent, `WAVE` (Tobias).
Le correcteur `finish` garde l'objet tenu dans son orientation (perche droite, plateau à plat), laisse pendre tresse, queue de cheval
et cape à la verticale, et pose le pied le plus bas au sol. Vue de jeu : `createVillager(id)` (même interface que `Character`
pour un habitant : `root`, `animate(dt, { move, talking, wave })`). Contrôle en jeu : `tests/qa_pnj_monde1.py`.

