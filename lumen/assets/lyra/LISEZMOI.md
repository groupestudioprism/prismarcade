# Lyra et Fia : modèle 3D pour LUMEN

## Fichiers
- `Lyra_Fia.glb` : le modèle (Lyra + Fia + bâton), les contours noirs et les 10 animations, prêt pour Unity, Godot, Unreal ou Blender.
- `Lyra_apercu.html` : page d'aperçu à ouvrir dans un navigateur. On y joue chaque animation avec ses effets visuels, avec la zone de frappe dessinée au sol, un ralenti et les vues face, profil, dos et dessus.
- `Lyra_keyframes_30fps.csv` : table complète des images clés. Pour chaque animation, chaque image (30 i/s) et chaque articulation : temps, rotation X/Y/Z en degrés, position et échelle.
- `Lyra_moves.json` : fiches de combat (préparation, phase active, image de frappe, portée, forme de la zone, recharge), palette et durées.
- `Lyra_turnaround.png`, `Lyra_animations.png` : rendus de contrôle.

## Caractéristiques techniques
- **Hauteur et emprise :** 1,59 m de haut (sommet de la capuche), environ 0,73 m de large bras relâchés, environ 0,6 m de profondeur. Unité : 1 m.
- **Orientation :** repère glTF standard. Y vers le haut, Lyra regarde vers +Z, pieds à Y = 0, centrée sur l'origine.
- **Triangles :** environ 4 300 au total, contours compris. La plus grosse pièce fait moins de 400 triangles (limites demandées : 25 000 au total, 5 000 par pièce).
- **Style :** low-poly facetté, aucune sphère. Les formes rondes (Fia, pierres, tête, capuche) sont des volumes à facettes.
- **Couleurs :** couleurs par sommet en **sRGB brut** (non converties en linéaire), sans texture. Deux tons par matière : facettes sombres et facettes claires. Couleurs de la fiche : indigo #283568 / #3A4D8F, crème #F4EFE6 / #FFFFFF, or #E5B54F, etc.
- **Parties lumineuses :** matériaux émissifs nommés `M_Glow_*`, sans contour : `Eyes_Glow`, `Fia_Core`, `Staff_LightRing` (anneau de la pointe du bâton, caché au repos) et `Collar_Runes` (runes de lumière du col).
- **Contour noir :** géométrie dans le GLB, sans shader. Chaque pièce a un enfant `<Nom>_Outline` : copie gonflée de 15 mm le long des normales, faces retournées, couleur de sommet #000000, matériau `M_Outline` non éclairé. Les contours suivent leur pièce dans toutes les animations.
- **Hiérarchie (pivots placés aux articulations) :**
  ```
  Pelvis (racine)
  ├─ Torso
  │  ├─ Head ─ Hood, Hair_Bangs, Eyes_Glow
  │  ├─ Cloak_Back, Cloak_Left, Cloak_Right
  │  ├─ ArmL_Upper ─ ArmL_Lower ─ HandL ─ Staff ─ Staff_LightRing
  │  ├─ ArmR_Upper ─ ArmR_Lower ─ HandR
  │  ├─ Fia_Pivot ─ Fia_Body, Fia_Core
  │  └─ Collar_Runes
  ├─ LegL_Upper ─ LegL_Lower ─ FootL
  └─ LegR_Upper ─ LegR_Lower ─ FootR
  ```
- **Animations :**
  - animation par nœuds rigides (sans squelette ni pondération de peau), donc chaque pièce et son contour bougent sans déformation ;
  - cuites à 30 i/s, avec des images clés aux **mêmes instants pour toutes les articulations** ;
  - pas de nœud racine supplémentaire ;
  - recalage automatique : aucune pièce ne passe sous Y = 0, et la pose finale de la défaite repose exactement au sol.
- **Pose neutre :** pose en A, bâton vertical dans la main gauche, Fia au-dessus de l'épaule droite. Pas d'anneau ni de plan d'ombre sous le modèle.

## Animations et fiches de combat
| Animation | Durée | Boucle | Frappe | Zone | Recharge |
|---|---|---|---|---|---|
| IDLE | 3,0 s | oui | – | – | – |
| WALK | 1,1 s | oui | – | – | – |
| RUN | 0,65 s | oui | – | – | – |
| DODGE_ROLL | 0,55 s | non | invulnérable de 0,05 à 0,45 s | – | 0,5 s |
| COMBO_1_2_3 | 1,4 s | non | 0,25 / 0,65 / 1,10 s | cône avant de 1,8 m, 110° | 0,2 s |
| CHARGED_SPIN_SLASH | 1,2 s | non | 0,65 s (préparation de 0 à 0,45 s) | cercle de 2,4 m | 3,0 s |
| WAVE_OF_LIGHT | 1,0 s | non | 0,45 s (préparation de 0 à 0,30 s) | anneau de 3,5 m, traverse les boucliers | 5,0 s |
| LIGHT_GRAPPLE | 0,9 s | non | actif à 0,25 s | ligne de 12 m × 0,8 m | 2,0 s |
| HIT_REACTION | 0,4 s | non | – | – | – |
| DEFEATED | 2,5 s | non | – | – | – |

**Signaux visuels avant chaque attaque :** pose de préparation, anneau de lumière à la pointe du bâton (`Staff_LightRing`, mis à l'échelle) et cœur de Fia qui grossit (`Fia_Core`). Pendant le coup reçu, Fia clignote d'une image à l'autre.

## Effets visuels
Ils sont à recréer dans le moteur de jeu. La page d'aperçu en est la référence.
- **En permanence :** étincelles dorées qui s'échappent de Fia (#FFF8DC et #FFD166), environ 15 par seconde, montée lente, durée de vie de 0,9 à 1,5 s.
- **Marche et course :** petits nuages de poussière facettés (#E6DFD3) à chaque pas, 2 par pas en marchant et 3 en courant, durée 0,6 s. Pendant la course, ruban de lumière dorée derrière Fia (#FFD166, 0,35 s).
- **Combo et coup chargé :** traînée en arc derrière la pointe du bâton (#FFF3B0, 0,25 s). Pendant la préparation du coup chargé, étincelles à la pointe.
- **Onde de lumière :** anneau facetté à 12 côtés (#FFD166) qui passe de 0,3 à 3,8 m en 0,45 s en s'estompant.
- **Grappin de lumière :** rayon tendu (#FFF8DC, 5 cm de diamètre) de la pointe du bâton jusqu'à 12 m, de 0,25 à 0,62 s.

## Mettre à jour le modèle
Le modèle est généré par du code, sans logiciel de modélisation. Il se modifie dans `lyra.mjs` (formes, couleurs, poses clés), puis se régénère avec `node export.mjs out`.
