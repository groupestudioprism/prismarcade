# LUMEN : les Îles Brisées — document de conception

*Prism Game · Studio Prism · version 0.2 (novembre 2026)*

## 1. Vision

Un jeu d'aventure et d'énigmes en 3D, en solo. Le joueur, une petite **Porteuse de lumière**, parcourt un archipel d'îles flottantes qui ont perdu leur lumière. Il rallume les cristaux en dirigeant des faisceaux avec des lanternes, des miroirs et des prismes. Chaque île rallumée reprend ses couleurs.

**Durée visée**
- **Quête principale** : 4 h 30 à 5 h 30.
- **Jeu à 100 %** : 7 à 9 h (énigmes facultatives, chambres secrètes, éclats, pages du journal, épreuves).

**Piliers**
1. **Comprendre plutôt que deviner.** Chaque énigme a une seule solution, que l'on peut déduire en lisant les faisceaux. Ils sont toujours visibles, et chaque action a un effet immédiat.
2. **Une mécanique nouvelle à chaque île.** On l'introduit seule, on la combine ensuite, puis le gardien de l'île la pousse à son maximum.
3. **Le monde réagit.** Le ciel, les couleurs, la musique et les ponts changent à chaque énigme résolue.
4. **Un style simple, beau et professionnel.** Low-poly en couleurs unies, lumière douce, faisceaux lumineux.

## 2. Direction artistique

- **Formes** : low-poly en aplats (ombrage plat), sans textures. Îles flottantes posées sur des stalactites de roche, avec des nuages en dessous.
- **Palette** : chaque île a un ciel « éteint » (crépuscule désaturé) et un ciel « rallumé ». Le monde passe de l'un à l'autre au fil des énigmes résolues.
- **Lumière** : un soleil avec ombres douces, un éclairage de ciel, et un halo (bloom) **uniquement** sur ce qui émet de la lumière (faisceaux, cristaux, lanternes, éclats).
- **Personnage** : une silhouette encapuchonnée, avec une petite orbe de lumière qui flotte à son épaule.
- **Interface** : sobre, en verre fumé, avec la typographie de Prism Arcade (Sora / Inter).
- **Son** : une nappe d'ambiance synthétisée par île, et des carillons accordés pour les rotations, les cristaux et les ponts.

## 3. Commandes

| Action | Clavier / souris | Tactile |
|---|---|---|
| Se déplacer | ZQSD / WASD / flèches | Joystick à gauche |
| Tourner la caméra | Glisser avec la souris | Glisser à droite |
| Zoom | Molette | — |
| Interagir (tourner, ramasser) | E / Espace | Bouton d'action |
| Journal et quêtes | J ou Tab | Bouton journal |
| Pause | Échap | Bouton pause |

Une manette est prévue pour la version PC.

## 4. Mécaniques, par ordre d'apparition

| Mécanique | Île | Rôle |
|---|---|---|
| Lanterne (fixe ou orientable) | 1 | Source de lumière blanche |
| Miroir (2 orientations) | 1 | Renvoie la lumière à 90° |
| Prisme | 1 | Lumière blanche → rouge (à gauche), vert (tout droit), bleu (à droite) |
| Cristal récepteur | 1 | S'allume avec sa couleur et ouvre un pont ou une barrière |
| Cristal relais | 1 | S'allume avec la lumière reçue et la réémet dans la direction choisie |
| Phare | 1 à 6 | Objectif final de chaque île : il demande plusieurs couleurs à la fois |
| Vitrail coloré | 2 | Filtre une couleur ; la lumière blanche qui le traverse prend sa couleur |
| Combinateur | 2 | Rouge + vert = jaune, rouge + bleu = magenta, vert + bleu = cyan, les trois = blanc |
| Porter un objet | 3 | Déplacer miroirs et prismes (capacité « Porter ») |
| Lame semi-réfléchissante | 3 | Divise un faisceau en deux |
| Lanterne portée | 4 | Le joueur devient une source mobile (capacité « Orbe ») |
| Eau miroir | 4 | Reflet vertical, niveaux d'eau changeants |
| Courants d'air et planeur | 5 | Atteindre des îlots (capacité « Planer ») |
| Relais temporisés | 5 | Cristaux qui restent allumés quelques secondes |
| Portails de lumière | 6 | Un faisceau entre et ressort ailleurs |

## 5. Structure du jeu

**Sanctuaire central** (point de départ et de retour) : la Gardienne y donne les quêtes. On y trouve l'autel des capacités (améliorées avec les éclats) et la carte de l'archipel. Le sanctuaire s'éclaire un peu plus après chaque île.

**Contenu de chaque île**
- 9 à 11 énigmes principales réparties en 3 ou 4 régions, plus le phare (le gardien de l'île) ;
- 3 chambres secrètes, ouvertes par un cristal facultatif, avec une énigme plus difficile, un trésor (éclats, page) et une récompense en pièces ;
- 10 éclats de prisme cachés ;
- 3 pages du journal, qui racontent l'histoire de l'archipel ;
- 1 épreuve chronométrée, à débloquer après le phare.

| # | Île | Mécanique phare | Énigmes principales | Facultatif |
|---|---|---|---|---|
| 1 | L'Île de l'Aube | Lanternes, miroirs, prisme, relais | 9 + phare | 3 chambres, 10 éclats, 3 pages |
| 2 | La Forêt de Verre | Vitraux et mélange des couleurs | 10 + phare | idem + épreuve |
| 3 | Le Désert des Échos | Porter des objets, lames semi-réfléchissantes | 11 + phare | idem + épreuve |
| 4 | Les Abysses Miroirs | Orbe portée, eau miroir | 11 + phare | idem + épreuve |
| 5 | Les Pics du Vent | Planer, relais temporisés | 11 + phare | idem + épreuve |
| 6 | La Citadelle du Zénith | Portails, toutes les mécaniques | 12 + phare final | idem + épreuve finale |

## 6. Décompte de la durée

Ces temps sont des moyennes pour un joueur qui découvre le jeu, déplacements et exploration compris.

| Contenu | Nombre | Temps moyen | Total |
|---|---|---|---|
| Énigmes principales | 64 | 3 à 4 min (île 1 : 2 min ; île 6 : 6 min) | ≈ 3 h 30 |
| Phares (gardiens) | 6 | 8 à 12 min | ≈ 1 h |
| Exploration, sanctuaire, récits | — | — | ≈ 30 min |
| **Quête principale** | | | **≈ 5 h** |
| Chambres secrètes | 18 | 6 à 8 min | ≈ 2 h |
| Éclats (60) et pages (18) | 78 | — | ≈ 40 min |
| Épreuves chronométrées | 5 | 8 min | ≈ 40 min |
| **Jeu à 100 %** | | | **≈ 8 h 20** |

## 7. Progression et récompenses

- **Dans Lumen** : les éclats améliorent les capacités à l'autel (portée d'interaction, vitesse, orbe plus puissante) et débloquent des tenues pour la Porteuse. Les pages remplissent le journal.
- **Dans Prism Arcade** : chaque première résolution rapporte de l'XP et des pièces au compte (énigme 120 XP, chambre 200 XP, éclat 30 pièces, île terminée 600 XP et 200 pièces). Les succès de Lumen comptent dans le profil.
- **Sauvegarde** : par île (orientation des objets, portes ouvertes, objets ramassés, temps), sur le compte Studio Prism via Prism Arcade.

## 8. Technique

- **Moteur** : Three.js r160, intégré au dépôt (`lumen/vendor`), avec post-traitement bloom. Aucune dépendance en ligne.
- **Logique pure** (`lumen/js/logic.js`) : grille, faisceaux, portes. Testable sans navigateur.
- **Îles décrites en données** (`lumen/js/levels.js`) : zones en texte, objets, ponts, quêtes, textes.
- **Outil d'énigmes** (`lumen/tools/`) : un solveur exhaustif qui vérifie chaque énigme (solution unique, rien de résolu au départ, aucun faisceau qui sort de sa zone, tout atteignable à pied) et un générateur qui propose des énigmes à partir d'un gabarit de terrain.
- **Adaptateur de plateforme** (`lumen/js/platform.js`) : c'est le seul fichier lié à Prism Arcade.

**Applications PC et mobile (étape suivante)**
- Le dossier `lumen/` est autonome.
- **PC** : empaquetage avec Tauri ou Electron. **Mobile** : Capacitor (Android et iOS).
- Seul `platform.js` change (sauvegarde locale plus compte Studio Prism). Le jeu est ensuite retiré du site.

## 9. Feuille de route

| Étape | Contenu |
|---|---|
| 0.2 | Moteur, outil d'énigmes, Île de l'Aube complète (≈ 45 à 60 min à 100 %) |
| 0.3 | Sanctuaire, autel des capacités, carte, Forêt de Verre |
| 0.4 | Désert des Échos (porter des objets), musique par île |
| 0.5 | Abysses Miroirs, Pics du Vent |
| 0.6 | Citadelle du Zénith, fin du jeu, épreuves |
| 1.0 | Équilibrage, manette, accessibilité, puis applications PC et mobile |
