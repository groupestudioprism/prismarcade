# LUMEN : les Îles Brisées — document de conception

*Prism Game · Studio Prism · version 0.5, Actes I et II en cours (novembre 2026)*

---

## 1. Résumé

| | |
|---|---|
| **Genre** | Aventure, exploration, combats et énigmes de lumière en 3D, solo |
| **Plateformes** | Navigateur (Prism Arcade) pendant le développement, puis applications PC (Windows, macOS, Linux) et mobiles (Android, iOS) |
| **Public** | Dès 10 ans ; amateurs d'énigmes calmes (*The Witness*, *Monument Valley*, *Lara Croft GO*) |
| **Durée** | Quête principale : 4 h 30 à 5 h 30 · jeu à 100 % : 7 à 9 h |
| **Modèle** | Jeu complet, sans publicité ni achat intégré ; récompenses reliées au compte Prism Arcade |
| **Ton** | Lumineux, mélancolique puis plein d'espoir. Des zones calmes (énigmes, villages) alternent avec des zones d'exploration et de combat. |

**L'idée en une phrase** : dirige la lumière, à l'aide de lanternes, de miroirs et de prismes, pour rallumer un archipel éteint, île après île, en t'appuyant sur une vraie aventure : villages, quêtes, combats, équipements.

### État de la version 0.5 (partie 1) : la Forêt de Verre
- **Moteur multi-îles :** une page = une île ; le voyage (barque de Calixte à Havre-Aube, Tessel au retour) range le monde de l'île quittée, charge celui de l'île d'arrivée et recharge la page. Sauvegarde version 5 (`otherWorlds`).
- **Mélange des couleurs :** jaune = rouge + vert, magenta = rouge + bleu, cyan = vert + bleu. Le vitrail ne laisse passer que sa couleur ; le relais à anneaux (`mix`) réunit ce qu'il reçoit.
- **Forêt :** Vitrebourg (6 PNJ, 3 boutiques, auberge), 3 salles de vitraux, Lisière du Verre, Temple de Verre (salle scellée, énigme de vitraux, clé, boss *Gardien de Verre* à deux phases), 5 nouveaux ennemis (éclat, lierre-prisme, cerf et sentinelle de verre, Gardien), quête principale *Les vitraux de la Forêt* et 3 secondaires.
- **À venir (0.5 partie 2) :** Phare de Verre (balise qui exige jaune, magenta et cyan), canopée, grappin de lumière.

### État de la version 0.4 (Acte I, Île de l'Aube)
- **Monde :** village de Havre-Aube (maisons accessibles, PNJ à dialogues évolutifs, 5 boutiques, forge, garde-robe), Lande des Ronces (ennemis, ronces à couper, coffres), Sanctuaire de Brume (salle scellée, énigme, clé, boss), 10 zones d'énigmes de lumière et 3 chambres secrètes.
- **Quêtes :** 3 principales (*Une lumière dans la brume*, *La lentille volée*, *Le phare*) et 8 secondaires, avec journal et récompenses.
- **Combat :** attaque de base, attaque tournoyante, esquive, résistances et faiblesses, 5 types d'ennemis aux comportements différents (poursuivant, territorial, à distance, chargeur, garde à bouclier), un boss à deux phases (le Colosse de Brume), butin et pièces.
- **Équipement :** inventaire par catégories, armes, tenues, accessoires, consommables, amélioration à la forge, monnaie.
- **Personnalisation :** coiffure, couleurs, tenues et accessoires visibles sur le modèle 3D ; objets à débloquer par les quêtes.
- **Technique :** modules indépendants (`game/`, `ui/`, `data/`, `world/`), contenu piloté par les données, sauvegarde versionnée sur l'appareil, passation Prism Arcade via `platform.js`. Tests navigateur dans `tests/` et contrôle d'accessibilité `tools/reach.mjs`.
- **Durée mesurée :** environ 1 h 15 pour la quête principale de l'Acte I.

---

## 2. Histoire

### Le monde : l'archipel d'Iridia
Iridia est un archipel d'îles flottantes au-dessus d'une mer de nuages. Au centre brillait le **Grand Prisme** : il recueillait la lumière du soleil et la redistribuait à chaque île par les **phares**. Chaque île vivait de sa couleur : l'aube rose, la forêt verte, le désert doré…

### L'événement
Une nuit, une ombre sans forme, **la Brume**, a enveloppé le Grand Prisme, qui s'est brisé en **six fragments**. Chacun est tombé sur une île. Les phares se sont éteints. Les ponts de lumière se sont effondrés, et les îles se sont éloignées les unes des autres.

### Les personnages
- **Lyra** (héroïne jouable) : apprentie Porteuse de lumière. Elle n'a pas de pouvoir offensif. Elle perçoit les faisceaux et sait les orienter. Une petite orbe, **Fia**, l'accompagne, éclaire autour d'elle et grandit au fil du jeu.
- **Séléné, la Gardienne** : dernière gardienne du Sanctuaire, âgée et fatiguée. Elle guide Lyra et lui confie les quêtes.
- **Orin, l'Architecte** (absent) : il a construit les phares il y a des siècles. Ses **pages de journal**, dispersées dans les îles, racontent la vraie histoire du Prisme.
- **Les Lueurs** : petits esprits de lumière perdus sur les îles. Les ramener au Sanctuaire le rallume peu à peu (quêtes secondaires).

### Arc narratif
1. **Prologue, le Sanctuaire** : Séléné confie à Lyra la dernière lanterne. On apprend à se déplacer et à tourner une lanterne.
2. **Îles 1 à 5** : chaque phare rallumé libère un fragment du Prisme. Lyra le rapporte au Sanctuaire, ce qui ouvre la route de l'île suivante et lui donne une nouvelle capacité.
3. **Révélation (pages d'Orin)** : la Brume n'est pas une ennemie venue d'ailleurs. C'est l'ombre née d'une lumière trop concentrée. En voulant tout éclairer depuis un point unique, Orin a créé l'ombre qui a brisé le Prisme.
4. **Île 6, la Citadelle du Zénith** : pour reforger le Prisme, Lyra ne le replace pas au centre. Elle répartit la lumière entre les six phares.
5. **Épilogue** : l'archipel se rassemble, les ponts se reforment et le ciel s'illumine. Fin cachée, à 100 % : la dernière page d'Orin et une cinématique supplémentaire.

**Thème** : la lumière partagée vaut mieux qu'une lumière unique et puissante.

---

## 3. Piliers de conception

1. **Comprendre plutôt que deviner.** Chaque énigme a une seule solution, déductible en lisant les faisceaux. Les faisceaux sont toujours visibles, et chaque action a un effet immédiat et réversible.
2. **Une mécanique nouvelle à chaque île.** Elle est d'abord présentée seule, puis combinée aux précédentes, et le phare de l'île la pousse à son maximum.
3. **Le monde réagit.** Le ciel, les couleurs, la musique, la végétation et les ponts changent à chaque énigme résolue. On voit sa progression.
4. **Simple, beau et professionnel.** Low-poly en couleurs unies, lumière soignée, interface discrète.
5. **Pas d'échec punitif.** Pas de mort ni de chronomètre dans la quête principale. Une porte ouverte le reste.

---

## 4. Boucle de jeu

**Instant (quelques secondes)** : je regarde où va le faisceau, je tourne un objet, le faisceau change.
**Énigme (2 à 8 minutes)** : j'observe la zone, je comprends l'objectif (le cristal et sa couleur), j'essaie, j'ajuste, le cristal s'allume, un pont se forme.
**Île (45 à 70 minutes)** : j'explore les régions, je résous les énigmes, je trouve les secrets, puis je rallume le phare et je récupère le fragment.
**Jeu** : je rapporte le fragment au Sanctuaire, je gagne une capacité, l'île suivante s'ouvre, et je reviens plus tard sur les îles précédentes pour les secrets.

---

## 5. Commandes

| Action | Clavier et souris | Manette (PC) | Tactile |
|---|---|---|---|
| Se déplacer | ZQSD / WASD / flèches | Stick gauche | Joystick à gauche |
| Tourner la caméra | Glisser avec la souris | Stick droit | Glisser à droite |
| Zoom | Molette | Gâchettes | Pincer |
| Interagir (tourner, ramasser, parler) | E / Espace | A | Bouton d'action |
| Interaction inverse (tourner dans l'autre sens) | R | X | Appui long |
| Journal et quêtes | J / Tab | Select | Bouton journal |
| Pause | Échap | Start | Bouton pause |

**Aide à l'interaction** : l'objet ciblé est entouré d'un anneau doré, et une info-bulle indique l'action.

---

## 6. Mécaniques

| Mécanique | Île | Fonctionnement |
|---|---|---|
| Lanterne | 1 | Émet de la lumière blanche ; fixe ou orientable (4 directions) |
| Miroir | 1 | Renvoie la lumière à 90° ; 2 orientations (« / » et « \ ») |
| Prisme | 1 | La lumière blanche se divise en rouge (à gauche), vert (tout droit) et bleu (à droite) ; la lumière colorée le traverse sans changer |
| Cristal récepteur | 1 | S'allume quand il reçoit sa couleur et ouvre un pont ou une barrière |
| Cristal relais | 1 | S'allume avec la lumière reçue et la réémet dans la direction choisie (4 directions) |
| Barrière de cristal | 1 | Bloque le passage et la lumière jusqu'à son ouverture |
| Phare | 1 à 6 | Demande plusieurs couleurs en même temps |
| Vitrail | 2 | La lumière blanche prend sa couleur ; une couleur différente est bloquée |
| Combinateur | 2 | Mélange les couleurs reçues : rouge + vert = jaune, rouge + bleu = magenta, vert + bleu = cyan, les trois = blanc |
| Porter (capacité) | 3 | Soulever et poser miroirs, prismes et vitraux sur des socles |
| Lame semi-réfléchissante | 3 | Laisse passer la moitié de la lumière et renvoie l'autre moitié |
| Fia, l'orbe (capacité) | 4 | Lyra devient une source mobile de lumière (blanche, puis colorée avec les améliorations) |
| Eau miroir | 4 | Renvoie la lumière vers le haut ; des vannes changent le niveau de l'eau |
| Planer (capacité) | 5 | Rejoindre des îlots portés par les courants d'air |
| Relais temporisé | 5 | Reste allumé quelques secondes après avoir été touché |
| Portail de lumière | 6 | Un faisceau qui y entre ressort par le portail jumeau |

---

## 7. Les îles

Chaque île comprend :
- 3 à 4 régions ;
- 9 à 12 énigmes principales et le phare ;
- 3 chambres secrètes ;
- 10 éclats de prisme et 3 pages d'Orin ;
- une Lueur perdue ;
- une épreuve chronométrée (à partir de l'île 2).

### Prologue — Le Sanctuaire (10 min)
Une île centrale en ruines, avec un autel pour les fragments, l'autel des capacités, une carte de l'archipel et Séléné.
- **Tutoriel** : se déplacer, tourner une lanterne, éclairer un cristal.
- **Évolution** : après chaque île, une partie du Sanctuaire se rallume (fontaine, jardin, tour) et un nouveau pont vers l'île suivante apparaît.

### Île 1 — L'Île de l'Aube (45 à 60 min à 100 %)
- **Ambiance** : crépuscule rose et violet qui devient une aube dorée ; herbe, ruines blanches, cerisiers.
- **Mécaniques** : lanterne, miroir, prisme, relais.

| Région | Énigmes |
|---|---|
| Le Rivage | 1. Premier rayon (tourner une lanterne) · 2. Premier reflet (un miroir) · 3. Les Rochers (plusieurs miroirs, des leurres) |
| Les Jardins suspendus | 4. Le Prisme (séparer la lumière) · 5. Trois couleurs (rouge, vert et bleu vers leurs cristaux) · 6. Le Relais (relancer la lumière) |
| Les Ruines | 7. La Chaîne (deux relais) · 8. Deux lanternes · 9. Les Croisements |
| Le Phare de l'Aube | Phare : trois couleurs à rassembler sur le phare |

- **Chambres secrètes** : la Crique (miroirs), le Belvédère (prisme et relais), le Jardin caché (énigme difficile).
- **Récompense** : fragment rouge du Prisme. Fia grandit (portée d'interaction +25 %).

### Île 2 — La Forêt de Verre (60 à 75 min)
- **Ambiance** : arbres de verre, lumière filtrée verte et turquoise, brume légère.
- **Mécaniques** : vitraux, combinateurs, couleurs secondaires (jaune, magenta, cyan).
- **Régions** : la Lisière, la Canopée, le Cœur de la forêt, le Phare de Verre (il demande les six couleurs).
- **Quête secondaire** : « Le chant des arbres ». Allumer 5 arbres de verre cachés (un par couleur) déclenche une mélodie et ouvre une chambre.
- **Récompense** : fragment vert. Capacité « Porter », qui s'utilise sur l'île 3 et après.

### Île 3 — Le Désert des Échos (70 à 80 min)
- **Ambiance** : dunes dorées, temples de grès, tempêtes de sable par cycles.
- **Mécaniques** : porter des objets, lames semi-réfléchissantes, socles.
- **Régions** : les Dunes, le Temple enseveli, la Cité des Échos, le Phare des Sables.
- **Particularité** : pendant les tempêtes, les faisceaux portent moins loin. Il faut attendre ou s'abriter, sans jamais être pénalisé.
- **Récompense** : fragment doré. Fia devient une lanterne portable (capacité « Orbe »).

### Île 4 — Les Abysses Miroirs (70 à 80 min)
- **Ambiance** : grottes immergées, eau turquoise réfléchissante, bioluminescence.
- **Mécaniques** : Lyra comme source mobile, eau miroir, vannes de niveau d'eau.
- **Régions** : la Grève, les Grottes, le Lac souterrain, le Phare des Abysses.
- **Récompense** : fragment bleu. Capacité « Planer ».

### Île 5 — Les Pics du Vent (70 à 80 min)
- **Ambiance** : pics enneigés, moulins, drapeaux, courants d'air visibles.
- **Mécaniques** : planer, relais temporisés, plateformes qui s'élèvent quand elles sont éclairées.
- **Régions** : le Col, les Moulins, les Sommets, le Phare des Vents.
- **Récompense** : fragment violet. Les portails s'activent.

**Réalisation (Acte V, branche `acte5-pics`)** :
- *Géographie* (13 zones, 11 ponts) : le Col (village, 10 habitants, forge de Frimas, auberge du Chamois endormi, boutiques) ; les Courants (3 salles, `cr1`..`cr3`) ; la Terrasse des Girouettes ; les Pentes ; le Moulin du Grand Meunier (donjon : salle de combat, clé, relais à ressort, boss) ; les Sommets (Névé `so1`, Dalle `so2`, Crêtes `so3`, Souffle court `so4`) ; le Phare des Vents (3 étapes, faisceaux rouge, bleu, magenta).
- *Planer* : entité `vent` (pierre de vent), reliée en ligne droite à une jumelle de l'autre côté d'un vide (`ventLinks`, portée 14, comme le grappin mais plus long). Capacité locale `abilities.planer`, donnée par Alizée (`teach: 'planer'`) ; mode de jeu `glide` (arc + voile) dans `js/game/pics-mech.js`. Rejouable à l'infini : on ne tombe jamais.
- *Relais temporisés* : un relais avec `hold` (secondes) garde sa couleur après avoir été touché par un faisceau (`heldC`, `heldT`, `live`), puis s'éteint. `tools/timed.mjs` (`analyseTimed`) simule le temps (marche × 1,5, 0,6 s par action) et prouve : état initial non résolu, aucune fuite de faisceau, solution existante, **aucune solution statique**, marge ×0,75. Salles concernées : `cr3`, `so4`, salle des relais du Moulin.
- *Plateformes qui montent* : ponts `look: 'lift'` (`lf1`, `lf3`), dalles dont les piliers se dressent quand le récepteur est éclairé ; une fois levées elles restent levées (comme les autres ponts : aucun piège possible).
- *Portails* (récompense) : `abilities.portails`, touche V (bouton tactile ◎) ; deux portails reliés par île (`st.player.portals = { island, list: [{x, z}] }`), pose en plein air seulement, recharge anti-aller-retour. À réutiliser tel quel à l'Acte VI.
- *Ennemis* : givrelin, bourrasque, bouquetin (charge rectiligne), veilleur de givre, boss Grand Meunier (IA générique : coup au sol, balayage, pierres, invocation de givrelins ; pas d'IA sur mesure).
- *Quêtes* : principales `q_pics`, `q_moulins`, `q_phare_vents` ; secondaires `s_cerfvolant`, `s_moulin`, `s_fleurs`, `s_chasse_pics`, `s_fanions`, `s_courrier`, `s_corne`.
- *Vérifications* : `node tools/build-pics.mjs` (génération + simulation), `verify.mjs`, `reach.mjs` (pierres de vent incluses), `coherence.mjs`, `tests/qa_pics_full.py` (parcours complet en navigateur).

### Île 6 — La Citadelle du Zénith (80 à 90 min)
- **Ambiance** : citadelle blanche et dorée au-dessus des nuages ; la Brume y est visible.
- **Mécaniques** : portails de lumière, plus toutes les mécaniques précédentes.
- **Régions** : la Porte, les Jardins célestes, la Grande Salle, le Zénith.
- **Phare final** : six faisceaux de six couleurs à envoyer vers les six phares de l'archipel, visibles au loin.
- **Fin** : le Prisme est reforgé en lumière partagée et l'archipel se rassemble.

---

## 8. Quêtes

| Type | Exemples | Où |
|---|---|---|
| **Principale** | « Rallumer le phare de l'Aube », « Rapporter le fragment au Sanctuaire » | Journal, onglet Quêtes |
| **Régionale** | « Ouvrir le chemin des Jardins » (étapes de l'île) | Indiquées à l'arrivée dans une région |
| **Secondaire** | « La Lueur perdue de l'Aube », « Le chant des arbres », « Les six reflets » | Données par Séléné ou trouvées sur place |
| **Collection** | 10 éclats et 3 pages par île | Journal, onglet Collection |
| **Épreuve** | Rallumer un phare miniature en temps limité (3 médailles) | Après le phare de chaque île |

Le journal présente les objectifs en cours, les quêtes terminées, les pages lues, la carte de l'île et les statistiques.

---

## 9. Progression

### Capacités (récupérées avec les fragments)
| Fragment | Capacité |
|---|---|
| 1 (rouge, Aube) | Fia grandit : portée d'interaction +25 % |
| 2 (vert, Forêt) | Porter des objets |
| 3 (doré, Désert) | Orbe : Lyra devient une source de lumière |
| 4 (bleu, Abysses) | Planer |
| 5 (violet, Pics) | Portails |

### Autel des capacités (avec les éclats)
Il y a 60 éclats au total. Chaque amélioration coûte de 5 à 10 éclats.
- **Vitesse de marche** : 2 niveaux.
- **Orbe colorée** : rouge, puis vert et bleu.
- **Vue de la Porteuse** : montre la trajectoire prévue d'un objet avant de le tourner.
- **Tenues de Lyra** : 6 tenues, une par île.

### Récompenses dans Prism Arcade
| Action (une seule fois) | Récompense |
|---|---|
| Énigme principale | 120 XP · 40 pièces |
| Chambre secrète | 200 XP · 60 pièces |
| Éclat | 30 pièces |
| Page d'Orin | 50 XP · 20 pièces |
| Île terminée | 600 XP · 200 pièces |
| Jeu terminé | 3 000 XP, plus un cadre d'avatar exclusif « Porteuse de lumière » |
| 100 % | Avatar exclusif « Fia » et le titre « Lumière d'Iridia » |

---

## 10. Durée de vie

Les temps sont des moyennes pour un joueur qui découvre le jeu, déplacements compris.

| Contenu | Nombre | Temps moyen | Total |
|---|---|---|---|
| Prologue (Sanctuaire) | 1 | 10 min | 10 min |
| Énigmes principales | 64 | de 2 min (île 1) à 6 min (île 6) | ≈ 3 h 30 |
| Phares | 6 | 8 à 12 min | ≈ 1 h |
| Exploration et retours au Sanctuaire | — | — | ≈ 20 min |
| **Quête principale** | | | **≈ 5 h** |
| Chambres secrètes | 18 | 6 à 8 min | ≈ 2 h |
| Éclats (60), pages (18), Lueurs (6) | 84 | — | ≈ 40 min |
| Épreuves chronométrées | 5 | 8 min | ≈ 40 min |
| **Jeu à 100 %** | | | **≈ 8 h 30** |

---

## 11. Direction artistique

*(mise à jour 0.5 — agent Graphisme ; code : `js/world/*`, `css/lumen.css`)*

### Principes
- **Formes** : low-poly en aplats (ombrage plat), **sans texture photo** ; seules textures : un vitrail en niveaux de gris et des dégradés doux générés en canvas (`world/gfx.js`). Îles posées sur des stalactites, au-dessus d'une mer de nuages. Silhouettes arrondies et lisibles, détails portés par la couleur et la lumière, pas par le nombre de polygones.
- **Couleurs** : pastel, rose et or ; chaque île a deux palettes « éteinte » et « rallumée » (le monde passe de l'une à l'autre à chaque énigme résolue). Herbe en grandes plaques de teinte douce (plus de damier), chemins sable, pierre lavande. Forêt : turquoise, menthe et verre coloré.
- **Lumière** : soleil avec ombres douces, éclairage de ciel, **bloom réservé à ce qui émet** (halos sprite additifs sur lampions, cristaux, balise, foyers). Tout ce qui est « allumé » a un halo ; tout ce qui est éteint n'en a pas. Étoiles et halo de soleil pilotés par `world.setSky(k)` (0 crépuscule → 1 aube).
- **Faisceaux** : cœur blanc, halo coloré additif, étincelle à l'impact. Mélange lisible : jaune = rouge + vert, magenta = rouge + bleu, cyan = vert + bleu. Les vitraux ont un cadre doré, des plombs sombres (texture de vitrail) et **projettent une tache de lumière colorée au sol**.

### Personnages et PNJ (`world/character.js`)
- Proportions chibi : grosse tête (×1,1), yeux ovales avec reflet, sourcils, bouche, nez, joues rosées. Les habitants ont une corpulence et une taille de tête dérivées de leur apparence (variété sans toucher aux données).
- Cape (arc dans le dos) et jupes **déformées à chaque image** (vent, course) ; queue de capuche, tresse, foulard et plume qui flottent.
- Animations procédurales : respiration, regard qui flâne, **clignement**, marche avec genoux, **course** (inclinaison, bras fléchis), attaques (fente), esquive (roulé), coup reçu, **mort** (`dead` 0..1), gestes de conversation (bras alternés, bouche qui parle, hochements), salut, incantation. Transitions amorties (pas de coupure marche ↔ arrêt).
- Perf : les parties rigides d'un os sont fusionnées par matériau (`bakeStatic`), ~15 maillages par personnage.

### Créatures (`world/creatures.js`)
Chaque coup est **annoncé** (`wind`) par un geste lisible : brumelin qui gonfle et rougit des yeux, ronceux aux lianes dressées et épines incandescentes, lance-épines à la bouche qui s'embrase, sanglier qui baisse la tête et gratte le sol, gardien à l'arme levée, colosse aux poings qui s'allument (onde de choc au sol). Les créatures étourdies (`stun`) ont des étoiles qui tournent. Variantes de la Forêt **translucides** : éclat (cristal flottant), lierre-prisme (pétales de verre), **cerf de verre** aux bois jaune/magenta/cyan, sentinelle de cristal, Gardien de Verre à la couronne de vitraux.

### Décors (`world/build.js`)
- **Végétation** : herbe en touffes à 4 lames qui ondulent au vent (shader), fleurs à tige, buissons sur le bord des îles, tertres au pied des arbres, arbres de taille variable. **Arbres de verre** (Forêt) : feuillage translucide aux couleurs de vitrail, cœur lumineux qui pulse, racines de verre, rayons de lumière filtrée.
- **Eau** : éclats de lumière qui glissent (shader), poissons qui sautent.
- **Bâtiments** : bardeaux, faîtage, cheminées qui fument, fenêtres encadrées avec volets et jardinières fleuries, porte à linteau avec marche et lanterne.
- **Meubles** : lit à baldaquin simple et tapis, tables rondes avec nappe, chandelle et tabourets, cheminée avec bûches et flammes animées, étagères à livres et bocaux, bureau, étals aux fanions, puits, fontaine à vasque (gouttes animées), lampadaires avec halo.
- **Donjons** : liseré lumineux au pied des murs, pilastres, dalles runiques (Sanctuaire violet, Temple cyan).
- **Ambiance vivante** (`world/life.js`) : papillons, lucioles, oiseaux, pétales, poussières de verre, fumée, braises — un seul appel de dessin pour toutes les particules, seule la zone courante est animée.
- **Prêts pour la suite** : balise à N anneaux colorés (`need`) y compris jaune/magenta/cyan (verre), poteau de grappin (`post`), `world.grappleLine()`, thèmes `canopee` et `phare_verre`.

### Performance
Les maillages statiques sont fusionnés (maisons, meubles, personnages, nuages), les détails sont masqués par quart de zone au-delà de ~60 m, les halos invisibles ne sont pas dessinés. Mesure typique (Havre-Aube, swiftshader) : ~600 appels de dessin, ombres comprises, comme avant les ajouts. Le mode Économie réduit particules, lucioles, rayons et ombres.

### Interface (`css/lumen.css`)
Panneaux en verre fumé teinté (dégradé violet profond, liseré clair en haut), accents rose et or, boîte de dialogue avec filet dégradé, vignette douce (désactivée en « mouvement réduit »), titre qui scintille, bannières en dégradé. Lisible sur téléphone.
- **Caméra** : vue de trois quarts au-dessus du personnage, rotation libre, zoom limité. Plan large lorsqu'un phare s'allume.

## 12. Son et musique
Tout est **synthétisé en direct** (Web Audio, aucun fichier, aucune musique protégée). Code : `js/engine/audio.js` (façade) et `js/audio/` (`core.js` contexte/bus/limiteur, `music.js`, `sfx.js`, `ambience.js`). L'API est décrite dans `COORDINATION.md`.

- **Chaîne audio** : catégories *musique / effets / ambiance / voix* → master → compresseur-limiteur. Volumes réglables (`audio.set`), mute, persistance (`localStorage lumen.audio`). Le contexte naît au premier geste (autoplay) ; avant, tout appel est ignoré sans erreur. Enveloppes sans clic, polyphonie plafonnée (48 voix, 26 sur mobile/tactile), cloches et scintillements supprimés en mode économe. Un nom de son ou de thème inconnu ne lève aucune exception.
- **Musique générative** : chaque thème = tonalité, gamme, grille d'accords et couches (nappe, basse, arpège, mélodie, percussions douces, cloches). Les mélodies dérivent d'un motif graine propre au thème (question/réponse, résolution sur la tonique, silences respirés) qui **mute lentement** à chaque cycle d'accords. Fondu enchaîné de 2,8 s entre zones (1,2 s vers/depuis combat et boss).
  | Thème | Lieu | Couleur |
  |---|---|---|
  | `title` | écran-titre | Ré lydien, 66 bpm, cloches et nappe ouverte |
  | `village` | Havre-Aube | Sol majeur, 92 bpm, pizzicato, flûte, shaker, léger swing |
  | `puzzle` | salles d'énigmes | La dorien, 72 bpm, marimba en polyrythmie (pas de 3), très aéré |
  | `lande` | Lande | Ré éolien, 60 bpm, bourdon, flûte seule, tom lointain |
  | `sanctuaire` | Sanctuaire de Brume | Ré phrygien, 52 bpm, nappe sombre, cœur sourd, cloches longues |
  | `foret` | Forêt de Verre | Mi lydien, 84 bpm, arpèges de verre inharmoniques |
  | `vitrebourg` | Vitrebourg | Fa majeur, 104 bpm, vif, marimba de verre, percussions |
  | `lisiere` | Lisière | Do mixolydien, 70 bpm, brumeux, tambour sur cadre |
  | `temple` | Temple | Do# phrygien, 58 bpm, résonance, gong, arpèges très réverbérés |
  | `canopee` | canopée (Forêt de Verre, en hauteur) | La lydien, 96 bpm, aérien, flûte et verre |
  | `phare` | Phare de Verre | Ré majeur, 80 bpm, majestueux, cloches |
  | `interieur` | auberge, maisons | Do majeur à 3 temps, luth |
  | `combat` | combat | La mineur, 140 bpm, basse en croches, caisse claire |
  | `boss` / `boss2` | Colosse, phases 1 et 2 | Ré phrygien, 118 → 150 bpm, taiko, ostinato en doubles croches |
  | `victoire` | fin de combat/acte | Do majeur, 100 bpm, cuivres doux |
- **Intensité adaptative** : `music(thème, niveau)` reçoit le niveau de restauration du monde (plus de couches quand l'île se rallume). Les effets de combat augmentent une « tension » (0..1, retombe en ~8 s) qui ajoute percussions, basses et mélodie à n'importe quel thème, sans appel supplémentaire.
- **Bruitages** (~115 noms) : pas par sol (herbe, pierre, bois, eau, verre, terre), saut/atterrissage, armes (lame, lourde, distance, magie), coups et parades, mort, coffres/portes/clés/barrières, interface, **blips de voix** propres à chaque PNJ (hauteur, timbre et filtre dérivés de son identifiant ; la musique baisse un peu pendant qu'il parle), grappin, voyage (portail, barque, cristal), quêtes, niveau, achat/vente.
- **Notes des couleurs** : r = Do, g = Mi, b = Sol (cloches). Les mélanges jouent leurs composantes : jaune = Do+Mi, magenta = Do+Sol, cyan = Mi+Sol, blanc = l'accord complet. Le son du mélangeur et des récepteurs est donc *lisible à l'oreille*.
- **Ambiances** : vent, eau, brume, résonance du temple, feu, insectes en continu ; oiseaux, gouttes, craquements, pluie de verre et cloches lointaines en événements aléatoires, panoramiqués. Elles suivent le thème automatiquement ; oiseaux et insectes se multiplient quand le monde se rallume. `audio.ambience({fire: .8})` ajoute une couche locale.
- **Spatialisation simple** : `audio.listener(x, z, yaw)` + `sfx(nom, {x, z})` donne panoramique et atténuation par la distance.
- **Limites actuelles** : pas de réverbération par pièce (un seul espace partagé), pas de sons de météo dynamique, la voix des PNJ est un « blip » (pas de syllabes).

## 13. Accessibilité
- Les couleurs sont toujours doublées d'un symbole : rouge ▲, vert ●, bleu ■, sur les cristaux et dans les faisceaux (option « symboles »).
- Option d'aide : surbrillance des objets qui comptent dans l'énigme en cours.
- Textes agrandissables, sous-titres pour les dialogues, aucune action en temps limité dans la quête principale.
- Réduction des effets (bloom, secousses, particules) ; mode basse consommation sur mobile.

---

## 14. Technique

### Architecture
```
lumen/
  index.html, css/      interface (accueil, HUD, journal, pause, fin)
  js/logic.js           logique pure : grille, faisceaux, portes (testable sans navigateur)
  js/levels.js          îles décrites en données : zones en texte, objets, ponts, quêtes, textes
  js/main.js            rendu 3D (Three.js), personnage, caméra, commandes, effets, sons
  js/platform.js        adaptateur : Prism Arcade (site) / application (PC, mobile)
  tools/verify.mjs      vérification de toutes les énigmes
  tools/generate.mjs    générateur d'énigmes à partir d'un gabarit de terrain
  vendor/               Three.js r160 et post-traitement (intégrés au dépôt)
```

### Format d'une île
Une île est une liste de **zones**. Chaque zone comprend :
- une carte en texte (`.` herbe, `#` rocher, `T` arbre, `x` barrière) ;
- une position dans l'île et des objets placés en coordonnées locales ;
- un point d'arrivée, un conseil et un titre.

Des **ponts** relient les zones : ils apparaissent quand leurs cristaux sont allumés. Les **quêtes** sont des listes d'objectifs liés aux portes ou aux objets ramassés.

### Contrôle qualité des énigmes (obligatoire pour chaque énigme)
Le vérificateur essaie toutes les combinaisons d'orientations de chaque zone et contrôle que :
1. l'énigme a au moins une solution, et l'état de départ ne la résout pas ;
2. **aucun faisceau ne sort de sa zone**, quelle que soit la combinaison (pas d'interaction accidentelle entre énigmes) ;
3. chaque objet orientable, chaque éclat et chaque page est accessible à pied ;
4. l'île entière se termine en suivant l'ordre prévu.

### Sauvegarde
- Une sauvegarde par île : orientation des objets, portes ouvertes, objets ramassés, temps de jeu.
- Les récompenses déjà données sont marquées par des drapeaux, ce qui permet de fusionner sans doublon la progression entre appareils.
- Sur le site : dans le compte Studio Prism, via Prism Arcade. Application : sauvegarde locale, plus synchronisation avec le compte.

### Budgets de performance
| | PC | Mobile milieu de gamme |
|---|---|---|
| Images par seconde | 60 | 45 à 60 |
| Appels de dessin | < 250 (objets en instances) | < 150 |
| Ombres | carte 2048, qui suit le joueur | carte 1024 |
| Halo (bloom) | pleine qualité | demi-résolution ou désactivé |
| Poids de chargement | < 2 Mo hors moteur | idem |

### Applications PC et mobile
- Le dossier `lumen/` est autonome. Seul `platform.js` change.
- **PC** : Tauri (léger) ou Electron, avec prise en charge de la manette. **Mobile** : Capacitor (Android et iOS).
- Le jeu est retiré du site Prism Arcade une fois les applications publiées.

---

## 15. Production

| Version | Contenu | Durée de jeu cumulée |
|---|---|---|
| **0.2** | Moteur 3D, outil d'énigmes, Île de l'Aube complète | ≈ 1 h |
| 0.3 | Sanctuaire et prologue, journal et quêtes, autel, Forêt de Verre | ≈ 2 h 20 |
| 0.4 | Désert des Échos (porter, lames), musique par île | ≈ 3 h 40 |
| 0.5 | Abysses Miroirs, Pics du Vent | ≈ 6 h 20 |
| 0.6 | Citadelle du Zénith, fin, épreuves, fin cachée | ≈ 8 h 30 |
| 0.9 | Bêta fermée (amis et famille), équilibrage, accessibilité | — |
| 1.0 | Manette, applications PC et mobile, retrait du site | — |

**Critères pour terminer une île**
- Toutes les énigmes passent le vérificateur.
- Un testeur qui découvre l'île la termine dans le temps prévu.
- 60 images par seconde sur PC.
- Les textes sont relus.
- La sauvegarde fonctionne entre deux appareils.

## Acte II partie 2 (implémenté)
Canopée (can1..can4) : vides franchis par paires de poteaux de grappin (portée 9 cases, objet `grappin` obtenu chez Silex avec 5 éclats). Phare de Verre : balise y+m+c, trois salles, deux portes d'étape, solution unique vérifiée par force brute ; fin d'acte II générique. Quêtes : q_phare_verre, s_lampions_f, s_colis, s_graines.
