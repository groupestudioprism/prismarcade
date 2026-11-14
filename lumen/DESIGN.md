# LUMEN : les Îles Brisées — document de conception

*Prism Game · Studio Prism · version 1.0, les 6 actes : jeu complet (novembre 2026)*

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
| Caméra | Fixe (nord en haut, aucune rotation) | Fixe | Fixe |
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
- *Route* : on arrive aux Pics **depuis la fin de l’Acte IV** (`acte4_fini`) : Lagon (Abysses), Calixte (Havre-Aube), Yaël (Désert) proposent « Partir pour les Pics du Vent » (`travel { to: 'pics', zone: 'col', cell: [12, 7] }`) ; Zéphyr (Col) ramène aux Abysses, au Désert, à la Forêt ou à Havre-Aube. Tessel ne propose plus rien. La fin d’acte des Pics annonce l’île 6 comme disponible (« parle au passeur ») et Zéphyr propose la Citadelle du Zénith quand les cinq fragments sont réunis.
- *Géographie* (13 zones, 11 ponts) : le Col (village, 10 habitants, forge de Frimas, auberge du Chamois endormi, boutiques) ; les Courants (3 salles, `cr1`..`cr3`) ; la Terrasse des Girouettes ; les Pentes ; le Moulin du Grand Meunier (donjon : salle de combat, clé, relais à ressort, boss) ; les Sommets (Névé `so1`, Dalle `so2`, Crêtes `so3`, Souffle court `so4`) ; le Phare des Vents (3 étapes, faisceaux rouge, bleu, magenta).
- *Planer* : entité `vent` (pierre de vent), reliée en ligne droite à une jumelle de l'autre côté d'un vide (`ventLinks`, portée 14, comme le grappin mais plus long). Capacité `abilities.planer` : **clé unique avec l’Acte IV** (corniches des Abysses, donnée au Phare des Abysses) ; Alizée (`teach: 'planer'`) enseigne ici les pierres de vent et re-signale la capacité. Les deux mécaniques coexistent sous la même clé (entités `ledge` et `vent` distinctes, cibles d’interaction distinctes, `reachCells` gère les deux) ; mode de jeu `glide` (arc + voile) dans `js/game/pics-mech.js`. Rejouable à l'infini : on ne tombe jamais.
- *Relais temporisés* : un relais avec `hold` (secondes) garde sa couleur après avoir été touché par un faisceau (`heldC`, `heldT`, `live`), puis s'éteint. `tools/timed.mjs` (`analyseTimed`) simule le temps (marche × 1,5, 0,6 s par action) et prouve : état initial non résolu, aucune fuite de faisceau, solution existante, **aucune solution statique**, marge ×0,75. Salles concernées : `cr3`, `so4`, salle des relais du Moulin.
- *Plateformes qui montent* : ponts `look: 'lift'` (`lf1`, `lf3`), dalles dont les piliers se dressent quand le récepteur est éclairé ; une fois levées elles restent levées (comme les autres ponts : aucun piège possible).
- *Portails* (récompense) : `abilities.portails`, touche V (bouton tactile ◎) ; deux portails reliés par île (`st.player.portals = { island, list: [{x, z}] }`), pose en plein air seulement, recharge anti-aller-retour. À l’Acte VI, la même capacité (`abilities.portails`, une seule clé) allume aussi les portails de lumière des salles du Zénith (entités `portal`, `isl.portalsOff` tant que la capacité manque).
- *Ennemis* : givrelin, bourrasque, bouquetin (charge rectiligne), veilleur de givre, boss Grand Meunier (IA générique : coup au sol, balayage, pierres, invocation de givrelins ; pas d'IA sur mesure).
- *Quêtes* : principales `q_pics`, `q_moulins`, `q_phare_vents` ; secondaires `s_cerfvolant`, `s_moulin`, `s_fleurs`, `s_chasse_pics`, `s_fanions`, `s_courrier`, `s_corne`.
- *Vérifications* : `node tools/build-pics.mjs` (génération + simulation), `verify.mjs`, `reach.mjs` (pierres de vent incluses), `coherence.mjs`, `tests/qa_pics_full.py` (parcours complet en navigateur).

### Île 6 — La Citadelle du Zénith (80 à 90 min)
- **Ambiance** : citadelle blanche et dorée au-dessus des nuages ; la Brume y est visible.
- **Mécaniques** : portails de lumière, plus toutes les mécaniques précédentes.
- **Régions** : la Porte, les Jardins célestes, la Grande Salle, le Zénith.
- **Phare final** : six faisceaux de six couleurs à envoyer vers les six phares de l'archipel, visibles au loin.
- **Fin** : le Prisme est reforgé en lumière partagée et l'archipel se rassemble.
- **Réalisé (Acte VI)** : 5 zones jouables + 3 salles à portails + auberge ; boss « Ombre du Prisme » (3 phases : dalles et lances, spirale et téléportation, éclipse bouclier) ; phare à deux balises (rouge-vert-bleu et jaune-magenta-cyan) et deux portes d’étape ; cinématique de fin d’environ 50 s, bilan sur les six îles, générique, jeu libre. **Voyage** : le Zénith s’atteint depuis la fin de l’Acte V avec les cinq fragments (rouge `acte1_fini`, vert `verre_fini`/`acte2_fini`, doré `dore_fini`/`acte3_fini`, bleu `acte4_fini`, violet `acte5_fini`) : Zéphyr, Calixte, Yaël et Lagon proposent « Partir pour la Citadelle du Zénith » seulement quand ils sont réunis ; Calixte (Zénith) ramène vers les cinq autres îles. **Forge** : améliorations arme niveau 4 et armure niveau 3 réservées à la forge du Zénith (`island: 'zenith'`), recettes filtrées par île. **Bilan** : `game/completion.js` recalcule la complétion des îles quittées (mêmes parts que `completion()` de main.js). Détails : HANDOFF.md, annexe ACTE VI.

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
- **Caméra** : vue de trois quarts au-dessus du personnage, **fixe** (lacet 0 : le haut de l’écran est le nord, −z ; inclinaison 0,95 rad), aucune rotation, zoom limité (9 à 30). Plan large lorsqu'un phare s'allume.

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

## Acte III : Le Désert des Échos (implémenté)
Île 3, générée par `tools/build-desert.mjs` (zones : `tools/areas-desert.mjs`, données : `js/data/desert-*.js`, logique : `js/game/acte3.js`, rendu : `js/world/desert-props.js`, audio : `js/audio/desert-audio.js`).
- **Régions** : Cité des Échos (village, 11 PNJ, 3 boutiques, forge, auberge), Dunes (salles de sable d1 à d4, esplanade, oasis), Temple enseveli (donjon, boss Gardien des Échos), Phare des Sables (vestibule à trois vasques puis salle de la balise).
- **Mécaniques** : lames (`splitter`, semi-réfléchissantes : une partie du faisceau passe, l’autre est déviée), objets à porter (`carry`) posés sur des socles (`z.socles`), capacité Porter (donnée par Ambre, rattrapée à l’arrivée), tempêtes de sable par cycles (`isl.range` réduit : le faisceau s’éteint plus tôt ; une porte déjà ouverte ne se referme jamais ; l’abri ou l’attente suffisent).
- **Vérification** : `analyse()` teste toutes les orientations et placements de socles (solution requise, état initial non résolu, objets à porter nécessaires, aucune fuite de faisceau).
- **Contenu** : 3 quêtes principales, 7 secondaires, 6 ennemis (scarabée, scorpion, chacal, cactus, momie, écho) avec résistances, boss à 2 phases, fragment doré et capacité Orbe.
- **Orbe** : Fia devient lanterne portative (lumière plus large, allume les vasques). Ce n’est pas une source de faisceau mobile : limite assumée.
- **Tests** : `tests/qa_desert_boot.py`, `tests/qa_desert_full.py` (84 vérifications, port 8870), `tools/audit.py` (ciblage réel de chaque porte, coffre, PNJ, socle).

## Acte IV (implémenté) : Les Abysses Miroirs

**Idée :** la lumière rebondit sur l’eau. Les bassins d’eau miroir renvoient tout faisceau dans le sens de leur flèche ; une vanne règle leur niveau (haut : on ne peut pas marcher dessus et ils renvoient ; bas : on marche, la lumière passe). Fia, détachée de Lyra, devient l’**orbe** : posée sur un socle, elle émet un faisceau dans la direction qu’on lui donne.

- **Moteur (`js/mech/eau.js`, `js/logic.js`) :** objets `pool` (bassin, champs `o` flèche, `valve` vanne liée, `inv` inversé), `valve` (état 0/1), `socle` (socle d’orbe, couleur optionnelle ; à ne pas confondre avec les socles d’objets portés de l’Acte III, `isl.socles`/`z.socles`, et la cible d’interaction `orbsocle` / `socle`), `ledge` (corniche de plané). L’orbe est un état de l’île (`isl.orb = { at, dir }`) sauvegardé dans `world.dev['@orb']` ; les vannes dans `world.dev[id]`. **Le format de sauvegarde ne change pas** (SAVE_VERSION = 6 avec l’Acte III ; l’Acte IV n’ajoute aucun champ) : capacités libres (`abilities.orbe`, `abilities.planer`), drapeaux `boss_marees`, `acte4_fini`.
- **Île :** la Grève (village de pêcheurs, 9 PNJ + 1 à l’auberge, 4 boutiques, forge, auberge), les Récifs (exploration, 2 cachettes à roches fissurées), le lac souterrain (3 salles : miroir, vanne, orbe), les Grottes Miroirs (salle des Écumes, clé de corail, salle des Marées, arène du *Gardien des Marées*), le Phare des Abysses (3 salles à la suite, balise blanc + cyan), les Îlots du Reflet (après le phare : plané).
- **Capacités :** `orbe` (clé unique, **donnée par le Temple enseveli de l’Acte III** (Fia lanterne : vasques et lumière plus large) ; l’Acte III n’en fait pas une source de faisceau, l’Acte IV ajoute donc, sous la même clé, la pose de l’orbe sur les **socles d’orbe** (entités `socle`, registre `isl.orbSocles`, état `isl.orb`) ; Marée la redonne si elle manque : sans conséquence) et **`planer`** (récompense du phare : sur une corniche gravée, tourné vers l’autre îlot, Interagir fait planer jusqu’à la corniche d’en face, vide de 7 cases au plus).
- **Quêtes :** principales *Le lac qui ne reflète plus*, *Les Grottes Miroirs*, *Le Phare des Abysses* ; secondaires *Tisane de corail*, *Les colliers de Nacre*, *Le filet déchiré*, *Les crabes de Pétoncle*, *La perle de Murène*, *Les lampions du Coquillage*, *Étoiles de mer* (après le phare, demande de planer).
- **Créatures :** crabe-lanterne (chargeur, faible aux coups lourds), méduse-reflet (à distance, résiste à la lumière), anguille d’ombre (rapide, faible à la lumière), sentinelle de corail (bouclier), boss Gardien des Marées (deux phases).
- **Vérification :** `tools/analyse-abysses.mjs` explore l’espace des états (réglage de tous les objets × zone de marche de Lyra) : solution, aucune impasse, aucun faisceau qui sort, objets tous manœuvrables. `tools/build-abysses.mjs` assemble l’île et écrit `js/islands/abysses.js`.
- **Route :** les Abysses s’atteignent **après l’Acte III** (`acte3_fini`) : Yaël (Désert), Calixte (Havre-Aube) ; retour par Lagon vers le Désert, Vitrebourg ou Havre-Aube. Tessel (Forêt) ne propose plus que le Désert.


## Relief : altitude, caméra fixe, trou de visibilité (implémenté, socle moteur)

**Données.** Une zone peut avoir `h` (niveau de base, défaut 0) et `hmap` (tableau de chaînes, une par ligne de `map`, un caractère par case : `0-9a-z` = niveau 0 à 35 ; espace, `.` et `_` = 0). Absence = 0 partout : les îles existantes sont inchangées (même pas de maillage relief). `bridge.h` : nombre ou tableau (sinon le pont est interpolé entre les terres de ses extrémités). 1 niveau = `HU` = 0,75 unité ; une case = 2 unités ; **marche maximale `MAX_STEP` = 1 niveau** : |Δ| ≤ 1 est franchissable (rampe, marche), au-delà c’est une falaise (non franchissable, dessinée en mur de roche).
**Hauteur.** `heightAt(x, z)` (js/altitude.js) : continue, interpolation bilinéaire entre les centres de cases voisines ; un échantillon de l’autre côté d’une falaise ou d’un vide est remplacé par le niveau de la case propriétaire (la falaise reste franche). Elle sert au terrain, au joueur (`P.gy`), PNJ, ennemis, projectiles, objets au sol, coffres, faisceaux, ponts, ombres, audio, caméra (cible = `P.gy + 0,8`). `stepOk` (logique) = connexité ; `reachCells` et tous les outils (`reachlib`, `verify`, `reach`, `coherence`, `generate`) l’utilisent : une case entourée de cases trop hautes est inaccessible.
**Convention « lift ».** Le y logique d’un objet dynamique est sa hauteur au-dessus du sol local ; juste avant le rendu `lift.apply()` ajoute `heightAt`, juste après `lift.restore()` l’enlève. Le code de jeu n’a donc pas à connaître l’altitude. Le contenu statique a l’altitude cuite dans `buildWorld`.
**Terrain.** `world/relief.js` : maillage par zone, sommets colorés, cases plates = 1 quad, cases en pente = 4 ; murs de terre sous le vide, murs de roche facettés sur les falaises, masse de roche sous la montagne.
**Caméra.** Fixe : `CAM_YAW = 0`, `CAM_PITCH = 0,95`. La souris, le tactile et la manette ne la tournent plus (molette / pincer = zoom borné). `S.yaw`/`S.yawT` restent utilisables en interne (cinématiques, tests).
**Trou de visibilité.** `world/hole.js` : un patch `onBeforeCompile` posé une fois sur tous les matériaux Mesh (instanciés/fusionnés compris ; pas les shaders propres, Points, Sprites) ; les fragments qui sont devant Lyra (profondeur + `margin`) et au-dessus de ses pieds (`foot`), dans un disque d’écran, sont écartés par tramage. Aucun coût de géométrie, marche avec `?low&nobloom`. Réglages `hole.cfg` : `radius` 2,3 (unités monde projetées), `margin` 0,55, `foot` 0,8, `alpha` 0,92 ; `?nohole` le désactive. Un second trou suit le PNJ en dialogue. Les intérieurs restent corrects (le sol devant le joueur n’est jamais percé).
**Test.** `node tools/build-test-montagne.mjs` écrit `js/islands/test-montagne.js` (île cachée, hors `ISLANDS`, jamais sauvegardée) ; `?ile=test-montagne`. `tests/qa_altitude.py`.


## Formes des îles (PROPOSITION de conception, rien n'est implémenté)

**Pourquoi.** Aujourd'hui Aube, Désert, Abysses, Pics et Zénith suivent le même schéma : un village en haut à gauche, une ligne de zones carrées de 11×11 reliées par des ponts, un donjon carré, un phare carré. La caméra est désormais fixe (nord en haut, inclinaison 0,95 rad) et le relief existe (`zone.h`, `hmap`, falaises, escaliers). Il faut en profiter pour que **chaque île se distingue sur trois plans** (exigence du créateur) :

- **(a) Visuel** : palette, matériaux, ciel / brume / lumière, décor, silhouette, ambiance sonore ;
- **(b) Carte** : forme et organisation spatiales, usage de l'altitude (ni la ligne de zones carrées actuelle, ni la montagne de la Forêt) ;
- **(c) Logique** : mécanique centrale propre, énigmes et rythme de progression distincts (pas de simples variantes « miroirs et lanternes »).

**Règles caméra fixe pour tout dessin de carte** (issues de l'audit `tests/qa_camera_fixe.py`) :

1. Le haut de l'écran est le **nord**. Ce qui est au sud d'un objet important le cache : on met les objets clés (receveurs, vannes, socles, coffres, PNJ, boss) **à l'écart du bord sud** des falaises, murs et bâtiments, ou on abaisse ce bord (le moteur abaisse déjà à 0,95 les murs de donjon qui ont du sol au nord, `lowFront` dans `world/build.js`).
2. **Monter vers le nord est gratuit** : un relief qui s'élève vers le haut de l'écran ne cache jamais ce qui est devant (les faces de falaise tournées au sud sont même très lisibles). Un relief qui s'élève vers le sud est à éviter, ou à réserver à du décor bas.
3. Les falaises « vers le sud » (la face visible) sont les plus belles : y placer les cascades, les statues, les vitraux. Les faces nord sont invisibles : y cacher les secrets à condition de signaler l'accès.
4. Les grands cercles et spirales passent bien (aucun axe privilégié), les longs couloirs est-ouest aussi ; les couloirs nord-sud longs sont moins lisibles (on avance « dans » l'écran).
5. Une île = une **silhouette reconnaissable sur la carte** (G.drawMap) : prévoir aussi un tracé de carte propre.

### Tableau comparatif des 6 îles (la Forêt est la montagne, refaite par une autre équipe)

| | Aube | Forêt (montagne, autre équipe) | Désert | Abysses | Pics | Zénith |
|---|---|---|---|---|---|---|
| **Forme** | **Croissant** : deux cornes autour d'une baie ouverte au sud | Montagne à lacets | **Canyon en spirale** qui descend vers un temple | **Anneau** autour d'un lac-cratère | **Delta de vent** : plateaux flottants en éventail | **Sablier** : deux plateaux reliés par un col à portails |
| **Altitude** | 0 à 3 niveaux, cornes qui se relèvent doucement | Montée continue, sommet = phare | Du bord (9) vers le centre (0) : on **descend** | Berge 2 à 4, lac 0, grottes dans la berge | 0 au sud, jusqu'à 14 au nord (le vent « descend » vers nous) | Plateaux à 8, col à 3, tours à 14 |
| **Palette / ciel** | Rose, or, blanc ; aube qui monte | Vert verre, turquoise, brume | Ocre, rouge brique, ciel blanc brûlé | Bleu nuit, turquoise, magenta bioluminescent | Gris-bleu, blanc neige, orange des drapeaux | Blanc, or, nuages ; Brume noire à l'horizon |
| **Matière du décor** | Pierre blanche, cerisiers, eau calme | Verre, troncs de verre | Grès, sable, cactus, voiles | Corail, nacre, eau réfléchissante | Pierre grise, neige, bois, toile | Marbre, or, miroirs, vitraux |
| **Mécanique signature** | Ponts d'aube (la lumière pose des ponts) | Couleurs mélangées (vitraux, combinateurs) | Sable et tempêtes : le terrain change dans le temps | Eau : niveau, reflet vertical, Fia | Vent : planer, courants, minuteries | Portails : espace replié |
| **Rythme** | Linéaire, doux, tutoriel | Montée par paliers | Boucle : descendre, remonter par un autre bord | Tour de l'anneau, 2 sens possibles | Éventail : 3 branches libres, puis réunion | Deux grandes salles + col, très dense |
| **Village / phare** | Village à l'ouest (corne ouest) / phare à l'extrémité est | Village au pied / phare au sommet | Cité au bord haut nord-est / phare au centre bas, lit un faisceau vers le ciel | Grève au sud / phare au nord sur la berge, face au lac | Col au sud (bas) / phare tout au nord (haut) | Porte au sud / phare au nord, boss dans le col |
| **Son** | Harpe, cloche, oiseaux | Carillon de verre | Vent chaud, tambour sourd, échos | Gouttes, basses profondes | Sifflement, cordes, drapeaux | Chœur, orgue, silence |
| **Ennemis** | Brumes de base | Éclats de verre | Scarabées de sable, spectres d'écho | Crabes-lanternes, méduses | Givrelins, bourrasques, bouquetins | Ombres d'or |
| **Boss** | Colosse de Brume (rocher qui se dresse) | Gardien de Verre | Gardien d'échos (dans l'arène du fond de la spirale) | Gardien des Marées (arène avec niveaux d'eau) | Grand Meunier (au sommet du moulin) | Ombre du Prisme |

Aucune ligne du tableau n'est identique d'une colonne à l'autre : forme, profil d'altitude, palette, mécanique et boss sont tous différents.

---

### Aube : « Le Croissant » (archipel en croissant ouvert au sud)

**Identité visuelle.** Pierre blanche rosée, cerisiers, toits d'ardoise claire ; eau calme et lagon peu profond dans la baie ; le ciel passe du violet de l'éteint à l'or de l'aube, et **le soleil se lève réellement au bout de la baie** (ciel du bas de l'écran). Ambiance sonore : harpe, cloche de port, mouettes. C'est l'île la plus douce et la plus lumineuse.

**Carte.** Deux cornes de terre (ouest et est) qui encadrent une baie ouverte vers le bas de l'écran ; la corne ouest porte le village, la corne est le phare ; entre les deux, au nord, le ventre du croissant porte la Lande et le Sanctuaire (donjon). Les ponts de lumière traversent la baie.

```
          N
    . . . . . . . . . . . . . .
   .  [Lande]--[Sanctuaire]     .      ventre : niveau 2-3
  .  /   (boss Colosse)    \     .
 .  /                       \     .
 [Village]               [Rivage]     cornes : niveau 1-2
 [ Havre ]   ~ ~ baie ~ ~   [Jardins]-->[Ruines]--[PHARE]
  \  ponts d'aube (lumière)  /          pointe est : niveau 3
   ~~~~~~~~~~~ mer / lever du soleil ~~~~~~~~~
          S
Profil O->E : 1 1 2 2 | 2 3 3 (ventre) | 2 1 1 2 3 (corne est)
```

**Mécanique signature : les ponts d'aube.** Un récepteur allumé ne « ouvre » plus une barrière : il **pose un pont de lumière** dont la longueur suit le faisceau ; le pont existe tant que le faisceau le touche. On construit donc son chemin à travers la baie. Introduit la lumière en douceur (lanternes, miroirs, prismes, relais existants, c'est le socle pédagogique) mais avec une logique propre : le faisceau est à la fois la solution et le chemin.
**Trois types d'énigmes propres.** (1) *Traversée* : le pont dure le temps du faisceau, il faut garder un relais allumé derrière soi ; (2) *Pont à deux sens* : un miroir doit servir deux faisceaux (aller et retour) pour franchir la baie dans les deux sens ; (3) *Lever de soleil* : une lentille fixe sur la corne est reçoit le soleil à heure fixe (cycle court de 90 s, sans pénalité) qui allume un cristal qu'aucune lanterne ne peut atteindre.
**Ennemis / boss.** Voiles de brume lentes, lanceurs de brume (existants) ; boss Colosse de Brume dans le Sanctuaire (existant), arène ronde dégagée au nord du ventre.
**Placement.** Village corne ouest (altitude 1), phare pointe est (altitude 3, on le voit de la baie) ; les receveurs de la baie sont posés sur des plots côté nord des îlots (pas de falaise au sud d'eux).
**Existant / à refaire.** Existe : zones z1..z9 (carrés), phare, havre, lande, sanctuaire, intérieurs, énigmes vérifiées par `build-aube.mjs`. À refaire : carte (zones non carrées, plots), `hmap`, terrain de la baie, ponts à durée, cycle de soleil, nouveau tracé de carte. **Effort : élevé (≈ 6 jours)** : l'île est la plus « données » de toutes (énigmes générées par `build-aube.mjs`, vérifiées à la main par solutions), il faut refaire le générateur et les solutions.

---

### Désert : « Le Canyon » (spirale qui descend vers un temple enseveli)

**Identité visuelle.** Ocre, rouge brique, grès jaune, ciel blanc brûlé, brume de chaleur, voiles de poussière ; temples à demi enterrés, obélisques, voiles tendues entre les falaises. Ambiance : vent chaud, tambour sourd, échos qui répondent. Contraste fort avec l'Aube (pas d'eau, pas de verdure, ombres dures).

**Carte.** Un canyon de 3 zones de large qui s'enroule en spirale de l'extérieur vers le centre : on **descend** du bord (niveau 9, la Cité) jusqu'au fond (niveau 0, le Temple enseveli), la falaise de la spirale est la paroi visible. Un second chemin, étroit (grappin / porté), remonte par le bord intérieur vers le phare.

```
          N
   [Cité 9]========[Dunes 8]========\
     ||                              ||        entrée à l'est (bord haut)
     ||   ====[Oasis 6]======\       ||
     ||   ||                  ||      ||
     ||   ||   [TEMPLE 0]     ||      ||      centre : arène du boss
     ||   ||   (boss, phare)  ||      ||
     ||   \=====[Ruines 3]====/      ||
     \======[Vestibule 5]============/
          S
Profil le long de la spirale : 9 9 8 8 7 6 6 5 4 3 3 2 1 0 (puis remontée par le grappin)
```

**Mécanique signature : le sable change le terrain.** Un cycle de tempête (≈ 3 min) **recouvre et découvre** des cases : socles ensevelis, passages bas, lames. L'état du puzzle dépend du moment. Le joueur apprend à poser un porteur (miroir, prisme, lame) avant la tempête et à s'abriter.
**Trois types d'énigmes propres.** (1) *Marée de sable* : un socle n'est accessible qu'après la tempête, le faisceau doit être prêt avant ; (2) *Écho* : un miroir posé « répète » le faisceau 3 secondes plus tard (relais retardé) pour viser deux receveurs en alternance ; (3) *Abri-éclaireur* : pendant la tempête les faisceaux portent moins loin, on place des relais de proche en proche (porter, existant).
**Ennemis / boss.** Scarabées blindés (existant ou à créer), spectres d'écho qui répètent le coup précédent ; Gardien d'échos (existant), arène circulaire au fond de la spirale, sol plat 15×15.
**Placement.** Cité au bord haut (nord-est, niveau 9) : les maisons y sont au nord des allées ; phare au fond (centre, niveau 0) : un faisceau doré monte du puits, visible de partout ; la falaise intérieure tournée au sud sert de décor (fresques).
**Existant / à refaire.** Existe : 11 zones, porter / lames / socles, tempêtes (`desert-props.js`), boss et énigmes vérifiées par `build-desert.mjs`. À refaire : carte en spirale (nouveau découpage en zones non carrées avec `hmap` décroissant), cycle qui modifie le terrain (aujourd'hui seule la portée des faisceaux change), relais retardé (réutilise `hold` de l'Acte V). **Effort : moyen-élevé (≈ 5 jours).**

---

### Abysses : « L'Anneau du Lac » (couronne autour d'un lac-cratère)

**Identité visuelle.** Bleu nuit, turquoise, magenta bioluminescent ; corail, nacre, algues qui flottent ; eau réfléchissante au centre (le ciel y est inversé), grottes violettes dans la berge. Pas de soleil direct : une lueur venue **du fond du lac**. Ambiance : gouttes, grave profond, bulles, chant de baleine.

**Carte.** Une berge annulaire (largeur 2 à 3 zones) autour d'un lac circulaire de 24 cases de diamètre. L'anneau monte de 2 à 4 niveaux d'est en ouest (pour que la face sud des falaises soit lisible) ; les grottes sont des tunnels dans la berge nord, le phare est sur la berge nord face au lac. On peut faire le tour dans les deux sens : un côté mène à la Grève, l'autre aux Grottes.

```
            N
        ____[PHARE]____
     .-'   grottes     '-.        berge nord : niveau 4
    /  [Grottes][Récifs]  \
   [Lac1]  ~~~~~~~~~~~~  [Lac3]   flancs : niveau 2-3
    \      ~  LAC  ~      /
     '-.   ~~~~~~~~~~   .-'
        '--[GRÈVE]----'          berge sud : niveau 1 (village)
            S
Profil coupe N-S : 4 | 0 0 0 0 (lac) | 1
```

**Mécanique signature : l'eau.** Le niveau du lac monte et descend avec des vannes (existant), mais surtout **le reflet vertical** : un faisceau qui touche l'eau est renvoyé vers le haut, Lyra (Fia, orbe) est une source mobile. Le lac central est le « plateau » du puzzle : en changeant le niveau, on change quelles berges sont des îlots, et l'orientation des reflets.
**Trois types d'énigmes propres.** (1) *Marée* : monter l'eau pour aller sur un îlot, la baisser pour qu'un faisceau passe sous une arche ; (2) *Reflet* : un faisceau qui frappe l'eau remonte, on utilise l'eau comme un miroir à l'envers pour atteindre un receveur en hauteur (berge nord) ; (3) *Orbe voyageuse* : Fia posée sur un socle est une lanterne ; on la déplace d'un socle à l'autre en nageant le tour de l'anneau.
**Ennemis / boss.** Crabes-lanternes, méduses-reflet, anguilles, sentinelles de corail (existants) ; Gardien des Marées (existant), arène dont le niveau d'eau change entre phases.
**Placement.** Grève au sud (bas de l'écran, niveau 1), phare au nord sur la berge haute : on voit le phare à travers le lac. Éviter tout receveur sous la lèvre sud des grottes.
**Existant / à refaire.** Existe : grève, récifs, îlots, 3 salles du lac, grottes, phare, eau (`mech/eau.js`), Orbe et vannes, énigmes de `build-abysses.mjs` + `analyse-abysses.mjs`. À refaire : géométrie en anneau, hmap de la berge, lac central vraiment circulaire, deuxième sens de parcours. **Effort : élevé (≈ 6 jours)** : le simulateur d'états `analyse-abysses.mjs` suppose les zones carrées.

---

### Pics du Vent : « Le Delta » (plateaux flottants en éventail, le vent descend vers le sud)

**Identité visuelle.** Pierre gris-bleu, neige poudreuse, bois et toile orange (drapeaux, moulins, voiles), ciel haut et clair ; **les courants d'air sont visibles** (rubans blancs, fanions). Les plateaux sont des îlots de pierre suspendus avec une fine brume dessous. Ambiance : sifflement continu qui change avec l'altitude, cordes, clochettes de vent. Ce n'est pas une montagne qu'on gravit (c'est la Forêt) mais un **fleuve d'air** qu'on suit.

**Carte.** Une source de vent au nord (haut) qui se divise en trois branches qui se déploient vers le sud en delta ; chaque branche est une chaîne de plateaux de plus en plus bas. L'altitude **monte vers le nord** (le col, village, est au sud, bas ; le phare au nord, haut) : rien ne cache les cibles. On « descend » le vent en planant, on remonte par les ponts à plateformes.

```
                  N
              [PHARE 14]                 source du vent
              /   |    \
         [P 11] [P 11] [P 11]            3 branches libres
         /  |      |      |  \
      [P 8][P 8] [Moulin 9] [P 8][P 8]   le Moulin (boss) au centre
        \   |      |      |   /
     [P 5][P 5]  [P 5]  [P 5][P 5]
              \  |  |  /
              [COL 0-1]                   village, au sud
                  S
Profil N->S : 14 11 8 5 1  (≈ 3 niveaux par palier, planer vers le bas)
```

**Mécanique signature : le vent.** Planer (existant) devient la manière normale de se déplacer ; chaque branche a un **courant** de direction fixe qui porte (ou freine) le planeur. Les relais temporisés (existants) sont remplacés par des **girouettes** : le faisceau est dévié par une girouette tant qu'elle tourne, selon le sens du vent (nord → sud).
**Trois types d'énigmes propres.** (1) *Courant* : choisir la branche et le point de départ pour atterrir sur le bon plateau (planer dépend de la direction du vent) ; (2) *Girouette* : un miroir monté sur girouette ne renvoie la lumière que dans le sens du vent (la solution change quand on ouvre un volet) ; (3) *Minuterie en chaîne* : trois relais à retardement à allumer dans l'ordre pendant une descente en planeur (existant, mais présenté comme parcours chronométré).
**Ennemis / boss.** Givrelins, bourrasques (pousse Lyra, existant), bouquetins qui chargent vers le sud (existant), veilleurs de givre ; boss Grand Meunier (existant) au Moulin central, arène plate au milieu du delta.
**Placement.** Col (village) au sud, niveau 0-1 ; phare au nord, niveau 14 : on le voit en haut de l'écran, au loin. Les plateaux ne portent aucun mur au sud des cibles (falaise = face visible, jamais décor haut).
**Existant / à refaire.** Existe : 13 zones, pierres de vent, corniches, relais temporisés, boss, `timed.mjs`. À refaire : disposition en éventail avec ponts « de vent » et chaînes de pierres de vent, hmap par plateau, girouettes (nouvelle entité), carte. **Effort : moyen (≈ 4 jours)** : les pierres de vent et le planer fournissent déjà la logique.

---

### Zénith : « Le Sablier » (deux plateaux reliés par un col à portails)

**Identité visuelle.** Marbre blanc, or, vitraux, nuages sous les pieds, Brume noire à l'horizon ; symétrie parfaite (miroirs géants, colonnes, rosaces), ciel doré. Ambiance : orgue, chœur, silence solennel, écho long. C'est l'île la plus architecturale et la plus symétrique : le contraire du Désert.

**Carte.** Deux plateaux circulaires symétriques (haut au nord : phare et salle du boss ; bas au sud : porte et jardins) reliés par un col étroit (la Grande Salle) où les portails de lumière replient l'espace. L'altitude des plateaux est 8 ; le col est à 3 : on descend dans la salle puis on remonte (la tension monte avant le phare). Deux tours aux flancs (niveau 14) portent les balises.

```
                N
          .-----------.
         /  [PHARE]    \              plateau nord : niveau 8
        |   boss        |
         \  tours T1 T2/
          '-.       .-'
             \  [GRANDE SALLE]/        col : niveau 3, portails
             /  (⇄ portails ⇄)\
          .-'       '-.
         /  [JARDINS]   \              plateau sud : niveau 8
        |   [PORTE] ⌂    |            village à l'entrée
         \_____________ /
                S
Profil N->S : 8 8 | 3 3 | 8 8   (sablier ; tours à 14 sur les flancs)
```

**Mécanique signature : les portails (espace replié).** Les portails de lumière relient deux points : un faisceau qui entre ressort par le jumeau. Dans cette version, **les plateaux eux-mêmes sont reliés par portails** : un faisceau lancé dans le plateau sud peut sortir dans le plateau nord. On résout les énigmes des deux plateaux en même temps via un seul rayon qui traverse le col ; un miroir mal placé au sud éteint un receveur au nord.
**Trois types d'énigmes propres.** (1) *Rayon traversant* : un faisceau doit passer par deux portails pour atteindre un receveur du plateau opposé ; (2) *Symétrie* : un miroir posé au sud crée son double au nord (les plateaux sont symétriques) : il faut les caler en miroir ; (3) *Portail du joueur* : Lyra emprunte le portail qu'un faisceau vient d'ouvrir (touche V existante) pour atteindre une tour.
**Ennemis / boss.** Ombres d'or (existant), lancers de lances de lumière (existant) ; boss Ombre du Prisme (existant, 3 phases) dans l'arène ronde du plateau nord.
**Placement.** Porte et village au sud (entrée basse de l'écran), phare au nord, boss sur le plateau nord autour du phare ; les deux tours aux flancs.
**Existant / à refaire.** Existe : 8 zones, portails (`mech/portails.js`), boss, séquence de fin 50 s, énigmes vérifiées (`audit_zenith.py`). À refaire : disposition en sablier (zones non carrées, plateaux circulaires, col), puzzles symétriques et rayon traversant, hmap. **Effort : moyen-élevé (≈ 5 jours)** : le moteur de portails existe, il faut un nouvel agencement et de nouvelles énigmes à valider.

---

### Ordre de réalisation conseillé

1. **Pics** (le moins coûteux : le vent et le planer existent), 2. **Zénith** (portails existants), 3. **Désert** (nouveau cycle de sable), 4. **Abysses** et 5. **Aube** (générateurs/solveurs à refaire). Dans chaque cas : d'abord la carte (zones + `hmap`) avec `tools/reach.mjs` et `tests/qa_camera_fixe.py` (aucune cible clé masquée), ensuite les énigmes avec leur solveur, puis le visuel (palette, ciel, son).

### Audit « caméra fixe » (réalisé, voir HANDOFF.md)

Constaté : les murs de donjon (2,9 u) cachaient entièrement tout ce qui était posé sur la rangée devant le mur sud (Abysses : 13 objets clés ; Zénith : un panneau). Corrigé : un mur dont la case nord est du sol est abaissé à 0,95 (`lowFront`). Le trou de visibilité rend Lyra visible partout (0 bloqueur non troué sur les cinq îles) ; les PNJ derrière un étal ou une maison restent visibles pendant le dialogue (second trou).
