# LUMEN 0.5 — Document de passation (pour reprendre le travail avec n'importe quelle IA)

Rédigé le 06/11/2026 à 13 h 15. Il décrit le contexte, ce qui est fait, ce qui reste à faire et la façon de le faire, avec toutes les directives.
**À l'IA qui reprend :** lis ce document en entier, puis lis les fichiers cités avant de modifier quoi que ce soit.

---

## 1. Contexte

**Porteur du projet :** Kéliann Mauger (Studio Prism).
- Il veut des réponses en **français**.
- Il veut que l'IA **prenne des initiatives** : enchaîner le plus d'étapes possible, agir d'abord et poser les questions à la fin.

**Studio Prism :** suite d'applications web, toutes sur GitHub Pages, avec une organisation GitHub dédiée.
- Organisation GitHub : `groupestudioprism`.
- Projet Firebase unique : `archivision-studioprism`, au forfait gratuit Spark. Le forfait **ne peut pas être changé** pour l'instant, donc pas de Firebase Storage.

**Prism Arcade :** plateforme de jeux de la branche « Prism Game ».
- Dépôt : `groupestudioprism/prismarcade`. Site : https://prismarcade.studio-prism.com.
- Contenu actuel : 14 mini-jeux et un « grand jeu », **Lumen**.

**Lumen : les Îles Brisées :** jeu d'aventure 3D low-poly, fait en Three.js r160 (fourni dans `lumen/vendor`).
- Pas d'étape de compilation : modules ES chargés directement par le navigateur.
- Dossier : `prismarcade/lumen/`.

### Vision demandée par l'utilisateur (prompt complet du 06/11)

Faire de LUMEN un vrai jeu d'aventure inspiré de **la philosophie** de *Zelda: Link's Awakening*, **sans rien en copier**.
- **Contenu :** exploration libre, villages vivants, personnages, quêtes principales et secondaires, donjons, secrets, énigmes environnementales, combats, armes et équipements, progression, objets à améliorer.
- **Direction artistique :** **garder le style actuel**. Low-poly soigné, îles flottantes, rochers polygonaux, arbres stylisés, lumières dynamiques. Ni textures réalistes, ni environnements vides, ni éléments provisoires, ni interface surchargée.
- **6 régions :**
  1. Île de l'Aube (introduction)
  2. Forêt de Verre
  3. Désert des Échos
  4. Abysses Miroirs
  5. Pics du Vent
  6. Citadelle du Zénith
- **Systèmes :**
  - villages, PNJ et dialogues évolutifs ;
  - combat : attaques, attaque spéciale, esquive, PV, résistances, types d'ennemis, boss ;
  - inventaire par catégories et améliorations chez des PNJ ;
  - personnalisation visible en 3D ;
  - quêtes avec journal ;
  - boutiques à stock évolutif ;
  - Lumes et énigmes lumineuses de plus en plus complexes, sans que tout le jeu en dépende ;
  - interface discrète ;
  - architecture modulaire, sauvegarde fiable liée au compte Studio Prism, multijoueur envisageable plus tard.
- **Durée visée :** plusieurs heures pour la quête principale, **7 à 9 h à 100 %**. Le document de conception est `lumen/DESIGN.md`.
- **Méthode exigée :**
  - avancer par étapes ;
  - ne jamais casser l'existant ;
  - tester à chaque étape : régressions, performances, interactions, sauvegardes ;
  - ne jamais remplacer une fonctionnalité qui marche par une maquette.

---

## 2. État des dépôts

| Dépôt | Branche | État |
|---|---|---|
| `groupestudioprism/prismarcade` | `main` | **En ligne.** Lumen 0.4 (Acte I) publié, puis 0.5 (Forêt de Verre) à chaque étape validée. |
| `groupestudioprism/prismarcade` | `lumen-v05` | **Travail en cours** (Forêt de Verre : phare de verre et canopée ensuite). |
| `groupestudioprism/Studio-Prism` | `main` | Site du studio + **source unique des règles Firebase** (`firebase/`). |

**Règle absolue :** ne fusionner `lumen-v04` dans `main` qu'une fois une partie complète testée sans erreur.

La branche 0.4 modifie `lumen/js/islands/aube.js`, `logic.js` et `main.js`. Le phare y est scellé tant que la Lentille n'est pas posée. Mise sur `main` trop tôt, elle casserait le jeu en ligne.

**Fin de chaque message de commit :**
```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01W76daMzZ9EMWdfxbZRp7YR
```
(Une autre IA mettra sa propre signature.)

---

## 3. Firebase (règles) : à faire par l'utilisateur dans la console

- **Le problème :** les règles en ligne étaient anciennes. Elles refusaient les champs `inv`, `equip`, `boost`, `periods`, `claims`, `trophies`, `giftDay` et `giftStreak` de Prism Arcade, donc la **sauvegarde en ligne échouait**.
- **La correction :** elle est prête dans `Studio-Prism/firebase/firestore.publier.rules` (137 Ko, sans commentaires).
  - Assemblée par `python3 tools/build_rules.py` à partir de `firebase/rules/*.rules`.
  - Testée : `cd tests/emulateurs && npm install && npm test` donne 79 tests réussis.
- **La nouvelle collection de Lumen :** `lumenSaves/{uid}/slots/{slot}`, avec `slot` parmi auto, s1, s2, s3. Fichier `firebase/rules/32-lumen.rules`.
  - Champs : `v`, `name`, `region`, `level`, `playTime`, `completion`, `data` (texte JSON, 900 000 caractères au plus), `updatedAt == request.time`, `device?`.
  - Le titulaire seul lit et écrit ; un administrateur peut supprimer.
- **Action de l'utilisateur :** console Firebase → Firestore Database → Règles → coller **tout** le fichier `firestore.publier.rules` → Publier. **Il n'a peut-être pas encore publié** : à lui demander.
- **Storage :** non publiable (forfait Blaze nécessaire).
  - Conséquences : la médiathèque du site, la synchronisation des fichiers d'ArchiVision et les médias de SPECTRA Motion ne marchent pas.
  - Proposition faite et **en attente de réponse** : faire passer ArchiVision par Firestore en morceaux de moins de 1 Mo, et la médiathèque par GitHub.
- **À chaque nouveau mini-jeu de Prism Arcade :** ajouter son identifiant dans `paGames()` (`31-prism-arcade.rules`), reconstruire, tester, puis faire publier.

---

## 4. Architecture de Lumen 0.4 (branche `lumen-v04`)

```
lumen/
  index.html            page du jeu (HUD, boutons tactiles, #screen, #dialog, #fade, #saveflag…)
  css/lumen.css         toute l'interface (glass UI ; section « LUMEN 0.4 » à la fin)
  DESIGN.md             document de conception v0.3 (histoire, 6 îles, progression, durées)
  HANDOFF.md            ce document
  vendor/               Three.js r160 + addons (EffectComposer, bloom…)
  assets/               icon.svg, cover.webp, cover-small.webp
  js/
    main.js             ORCHESTRATEUR : rendu, ambiance, joueur, interactions, combat côté joueur,
                        sauvegarde, quêtes ↔ monde, carte, complétion, boucle. Expose window.__lumen (tests)
    logic.js            logique pure des îles : terrain, portes, faisceaux (trace/evaluate), walkable
    levels.js           liste des îles (ISLANDS = [aube]) + UPCOMING
    platform.js         SEUL lien avec Prism Arcade (récompenses XP/pièces, ancienne sauvegarde 0.2)
    islands/aube.js     GÉNÉRÉ par tools/build-aube.mjs, ne pas modifier à la main
    engine/  util.js (constantes T=2, W(), hash, bus, store) · audio.js (sons synthétisés + musique par ambiance)
             input.js (clavier/souris/tactile → actions)
    world/   build.js (vues 3D : terrain par zone et par thème, maisons, décor, portes, coffres, faisceaux)
             character.js (personnage paramétrable : Lyra et PNJ, animations procédurales, armes)
             creatures.js (Brumelin, Ronceux, Lance-épines, Sanglier, Gardien d'ombre, Colosse)
    game/    state.js (format de sauvegarde v4, statistiques, apparence) · save.js (4 emplacements, local + Firestore)
             quests.js (moteur d'étapes) · combat.js (IA, dégâts, projectiles, butin, effets)
    ui/      hud.js (barres, objectif, toasts, nombres de dégâts, barres ennemis/boss)
             screens.js (titre, menu à onglets, dialogues, boutiques, forge, garde-robe, voyage, mort, fin d'acte)
             icons.js (icônes SVG)
    data/    items.js · looks.js · enemies.js · npcs.js (dialogues) · quests.js · shops.js
  tools/   build-aube.mjs (construit l'île) · areas.mjs (village, lande, sanctuaire, intérieurs)
           generate.mjs (générateur d'énigmes vérifiées) · verify.mjs (vérifie tout)
```

**Le lien avec la plateforme** se fait par `window.PA` (fichiers `../js/core.js`, `economy.js`, `cloud.js` de Prism Arcade).
- `PA.cloud.store` est l'API ajoutée le 06/11 dans `js/cloud.js` : `get`, `set`, `list` et `del` de documents Firestore pour le compte connecté.
- `game/save.js` s'en sert pour `lumenSaves`.

### Contenu déjà en place
- **Monde :**
  - les zones d'énigmes 0.2 (z1–z9, phare, chambres secrètes s1–s3), **inchangées**. Elles sont décalées de `OX = 36` vers l'est et z1 est ouverte vers l'ouest. Les identifiants d'objets n'ont pas changé, donc les sauvegardes 0.2 sont compatibles ;
  - **Havre-Aube** (village, départ) ;
  - **Lande des Ronces** (combat ; haie de ronces à couper avec une lame) ;
  - **Sanctuaire de Brume** (donjon) :
    - salle de combat dont le sceau s'ouvre quand elle est nettoyée ;
    - énigme de lumière qui ouvre une barrière ;
    - petite clé et porte verrouillée ;
    - arène du boss ;
    - mur fissuré à briser au marteau ;
  - **2 intérieurs** : Auberge du Lampion et maison d'Orin, placés en x = 150 et cachés quand on est dehors ;
  - ponts `b_rivage`, `b_lande`, `b_sanct` ; phare scellé par la porte `lens`.
- **3 quêtes principales (Acte I) :**
  - `q_reveil` : parler à Séléné, puis les cristaux g1 et g2 ;
  - `q_lentille` : Bran, 3 brumes, l'Épée de l'Aube, le Sanctuaire, le Colosse, la Lentille ;
  - `q_phare` : énigmes g3 à g9, poser la Lentille, rallumer le phare, retour à Séléné, écran de fin d'acte.
- **7 quêtes secondaires :**
  - `s_pain` (Maëlle, 3 fleurs de miel) ;
  - `s_marteau` (Bran) ;
  - `s_ysolde` (5 brumes) ;
  - `s_pendentif` (Tobias, derrière des ronces près du puits) ;
  - `s_pages` (Lison, 3 pages d'Orin ; la récompense est la clé de la maison d'Orin) ;
  - `s_chasse` (Aldo, 12 créatures) ;
  - `s_lampions` (Mira, 7 lampions) ;
  - `s_prisme` (Pell, 8 éclats).
- **9 PNJ :** Séléné, Bran, Ysolde, Pell, Gaspard, Tobias, Lison, Mira, Aldo, Maëlle. Les dialogues sont dans `data/npcs.js` sous forme de « sujets » conditionnels : le premier `if(q)` vrai l'emporte, avec des effets `do` et des `choices`.
- **Combat :**
  - combo de 3 coups ;
  - coup chargé (capacité « charge », débloquée au niveau 3) ;
  - Onde de lumière (35 d'énergie, traverse les boucliers) ;
  - esquive avec invincibilité ;
  - armes : lame, lourde (brise les roches `c`), distance, magie ;
  - visée douce ;
  - butin attiré vers Lyra ;
  - mort : retour au dernier point de repos, avec perte de 10 % des écus (50 au plus).
- **Boss Colosse (440 PV) :** frappe au sol annoncée par un cercle, balayage, jets de rochers, invocation de Brumelins, phase 2 à 50 % ; dégâts ×2 quand il est « essoufflé ».
- **Boutiques :** Ysolde (potions), Bran (forge), Pell (tenues et teintures), Gaspard (achat et vente de matériaux), Lison (curiosités). Les stocks se renouvellent au repos.
- **Forge :** améliorations +1 à +3 pour les armes et +1 à +2 pour les armures, et une fabrication (plastron d'écailles).
- **Personnalisation :** coiffure, couleur des cheveux, peau, yeux, 5 tenues, couleurs de cape et de bordures, accessoires, taille, capuche. Les déblocages se gagnent par les quêtes ou en boutique.
- **Interface :**
  - HUD : vie, énergie, XP, niveau, objectif suivi, écus, éclats ;
  - objet rapide (F) ;
  - menu à onglets : Inventaire, Personnage, Journal (+ collection et bestiaire), Carte, Options (emplacements de sauvegarde, volumes, qualité, commandes) ;
  - dialogues avec effet machine à écrire ;
  - commandes tactiles complètes.
- **Sauvegarde :**
  - automatique toutes les 60 s et à chaque événement ;
  - 4 emplacements ;
  - en local et dans Firestore (si connecté et règles publiées) ;
  - les parties de la version 0.2 sont reprises (fonction `migrateLegacy`).

### Commandes (PC)
- **Déplacement :** ZQSD, WASD ou flèches. **Caméra :** fixe (nord en haut, aucune rotation). **Zoom :** molette.
- **Attaque :** clic gauche ou K (maintenir pour le coup chargé). **Onde :** clic droit ou L.
- **Esquive :** Espace ou Maj. **Interagir :** E. **Sens inverse :** R. **Potion :** F.
- **Menus :** I (inventaire), J (journal), M (carte), C (personnage), Échap (menu).

---

## 5. Ce qui a été testé et ce qui ne l'a pas été

Mise à jour du 06/11/2026 (session de stabilisation) :

- ✅ `node --check` sur tous les modules ; `verify.mjs` : énigmes valides et accessibles.
- ✅ Test navigateur de l'Acte I complet (`tests/e2e_partie.py`) : intro, Séléné, Rivage, Bran, Sanctuaire, Colosse, Lentille, g3 à g9, sceau, phare, fin ; sauvegarde puis rechargement. Aucune erreur de page.
- ✅ Test des systèmes (`tests/e2e_systemes.py`) : boss (phase 2), mort et reprise, 5 boutiques, vente, forge, garde-robe, 5 menus, potion.
- ✅ Mode tactile (`tests/e2e_mobile.py`) : joystick, boutons d'action et HUD s'affichent.
- 🐞 Bug corrigé : `G.ui` n'était jamais défini, alors que combat.js l'utilise (dégâts, barres d'ennemis, barre de boss). Tout combat plantait avec « Cannot read properties of undefined (reading 'bossBar') ». Correction dans main.js : `G.ui = G.hud`.
- ❌ Pas encore testé : équilibrage réel au clavier/souris (les tests pilotent l'API), performances sur vrai GPU, sauvegarde en ligne (Firestore : nécessite la publication des règles par l'utilisateur), reprise d'une vraie sauvegarde 0.2, quêtes secondaires une à une.

## 6. Ce qu'il reste à faire, dans l'ordre

### Étape A : terminer et stabiliser la 0.4 (priorité absolue)
1. Relancer le serveur local : `cd prismarcade && python3 -m http.server 8765`, puis ouvrir `http://localhost:8765/lumen/`.
2. **Écrire un test Playwright de partie complète.** Chromium est fourni ; lancer avec `--use-gl=swiftshader --enable-unsafe-swiftshader`. Il faut :
   - utiliser `window.__lumen` : `tpZone(id, [x, y])`, `give(id, n)`, `set(entId, v)`, `interact()`, `target()`, `st`, `S`, `P`, `combat`, `quests`, `openGate`, `saveTo` ;
   - faire avancer les dialogues à la touche `e` et choisir les réponses avec `1` à `5` ;
   - dérouler : intro → Séléné (bâton, ponts) → Rivage (g1 : lanterne z1 en S… voir `lumen/solution.json` s'il existe, sinon le résoudre avec `tools/generate.mjs` → `analyse`) → Séléné → Bran → tuer des Brumelins dans la Lande (ou `give('brume', 3)`) → Bran (épée) → couper la haie (ligne 13 de la Lande) → Sanctuaire (salle ouest, énigme est : miroir (22,7) en état 1 et (27,7) en état 0, clé (5,16), porte) → Colosse → Lentille → énigmes g3 à g9 → sceau `lens` → phare → Séléné → écran de fin d'acte ;
   - vérifier la sauvegarde : recharger la page, Continuer, comparer l'état ;
   - vérifier chaque quête secondaire, chaque boutique, la forge et la garde-robe ;
   - vérifier qu'il n'y a **aucune** `pageerror`.
3. **Points à vérifier et à corriger probablement :**
   - l'équilibrage des combats (PV, dégâts, vitesse des ennemis), en jouant pour de vrai ;
   - la collision des ennemis avec les murs du donjon ;
   - l'IA qui ne doit pas changer de zone ;
   - la caméra en intérieur ;
   - les marqueurs de quête des PNJ (`npcMarkers`) ;
   - `findTarget` (portes des maisons, fontaine) ;
   - les sorties d'intérieur (case `exit`) ;
   - l'état `S.mode` après fermeture des écrans (`G.onScreenClosed`) et après la garde-robe (`G.wardrobeCam`) ;
   - le dialogue choix → effets (`screens.js` : `nextLine`, `choose`, `endDialog`) ;
   - l'ancienne sauvegarde 0.2 (bouton « Continuer l'aventure ») ;
   - l'affichage mobile (boutons `.t-btns`, HUD, dialogue, garde-robe en bas) ;
   - les performances : nombre d'appels de dessin, ombres ; le mode « Économie » coupe le bloom.
4. **Rendu :** captures du village, de la Lande, du Sanctuaire, des intérieurs et du boss, à comparer au style des visuels LUMEN (low-poly lumineux, pastel, rose et or). Ajuster les couleurs (`THEMES` dans `world/build.js`, `AMB` dans `main.js`).
5. Mettre à jour la carte « Grands jeux » de l'accueil de Prism Arcade (`js/app.js`, fonction `bigGames()`) : badge « Acte I », description. Mettre aussi à jour `README.md` et l'image de couverture (`lumen/assets/cover.webp`, capture 1280×720 convertie en webp avec Python PIL).
6. Mettre à jour `DESIGN.md` en version 0.4 (architecture réelle, contenu, durées), puis le document Google Drive (dossier LUMEN).
7. **Fusionner `lumen-v04` dans `main`** seulement si tout passe, puis pousser.
8. Rappeler à l'utilisateur de publier les règles Firestore si ce n'est pas fait.

### Étape B : contenu suivant (versions 0.5 et plus, voir DESIGN.md)
**Fait en 0.5 partie 1 :** moteur multi-îles (`ISLAND_META`, `WARPS_BY`, `G.travelTo`), mélange des couleurs (`logic.js`), Forêt de Verre générée par `tools/build-foret.mjs` (+ `tools/areas-foret.mjs`), données dans `data/` (PNJ ambre, opaline, galet, silex, perle, ficus, tessel, mousse, calixte ; ennemis de verre = modèles existants teintés par `tint`), test `tests/foret.py`. **Reste :** Phare de Verre (balise `need` y+m+c), canopée, grappin, puis Désert des Échos.

- **Île 2, Forêt de Verre :**
  - nouveau village ;
  - créatures de cristal (résistantes au tranchant, faibles au contondant) ;
  - énigmes de reflets sur le verre ;
  - donjon et boss ;
  - nouvel objet de traversée, par exemple un grappin de lumière pour franchir les vides.
- Puis Désert des Échos, Abysses Miroirs, Pics du Vent, Citadelle du Zénith.
- **Une région = un fichier dans `tools/`** sur le modèle de `areas.mjs`, ajoutée dans un nouveau `islands/<île>.js` ou dans l'île en cours, plus les données dans `data/` (PNJ, quêtes, boutiques, ennemis).
- **Voyage entre îles :** l'éclat rouge au-dessus du phare ouvre la route. Prévoir un écran de navigation (barque volante).
- **Durées à atteindre :** environ 1 h 15 de quête principale par île, 7 à 9 h à 100 % en tout.
- **Multijoueur plus tard :** collections séparées ; les sauvegardes solo restent privées.
- **Application PC et mobile plus tard :** seul `platform.js` (et `save.js`) seront à remplacer, puis on retirera le jeu du site.

---

## 7. Directives de qualité et de méthode (à respecter)
- **Langue :** tout le texte du jeu et de l'interface en **français soigné**, avec accents et apostrophes typographiques (’).
- **Style :** low-poly, `flatShading`, couleurs douces, bloom léger. Aucune texture photo, aucun élément provisoire visible.
- **Données :** tout le contenu est dans `data/` ou `tools/areas.mjs`. Le moteur reste générique.
- **Île :** ne jamais modifier `islands/aube.js` à la main. Modifier `tools/build-aube.mjs` ou `tools/areas.mjs`, puis relancer `node lumen/tools/build-aube.mjs`, puis `node lumen/tools/verify.mjs`.
- **Nouvelles zones :** les ajouter **après** les zones existantes dans le tableau des zones (les identifiants d'objets dépendent de l'index de zone). Sinon les sauvegardes existantes cassent.
- **Format de sauvegarde :** pour le modifier, incrémenter `SAVE_VERSION` (`game/state.js`) et compléter `normalize()`. Garder la compatibilité.
- **Prism Arcade :** les récompenses passent par `platform.reward(clé unique, xp, pièces)`, une seule fois par clé. Ne pas toucher à l'économie de Prism Arcade sans raison.
- **Firebase :** toute nouvelle collection passe par `Studio-Prism/firebase/rules/NN-nom.rules`, puis `build_rules.py`, puis les tests sur émulateur, puis la publication par l'utilisateur (l'IA n'a pas accès à la console).
- **Tests :** avant chaque poussée, `node --check` sur les fichiers modifiés, puis `verify.mjs`, puis un test navigateur sans `pageerror`.
- **Passation :** expliquer simplement à l'utilisateur ce qui est fait et ce qu'il doit faire, sans jargon.

---

## 8. Autres projets en attente (même session)
- **Prism Arcade :** fait (boutique, XP, classements à cadeaux, 14 jeux, carte « Grands jeux »).
- **Studio-Prism :** la fiche produit Prism Arcade mentionne Lumen.
- **Question en attente de l'utilisateur :** solution sans Storage pour ArchiVision et la médiathèque (voir §3).

## Annexe GAMEPLAY — Acte II partie 2 (Canopée, grappin, Phare de Verre)
- **Fait** : zones can1..can4 + phare_f (Forêt de Verre, 13 zones, 10 ponts), poteaux de grappin (`post`, `postLinks`/`reachCells` dans js/logic.js), phare à `need` y+m+c avec portes d'étape (`stageGates`, `analyseStages` dans tools/generate.mjs), quêtes q_phare_verre (principale, auto après q_verre via `after`), s_lampions_f, s_colis, s_graines (exige le grappin), objets grappin/anneau_canopee/manteau_verre, ennemis eclat_ambre/cerf_prisme/sentinelle_azur, fin d'acte générique (`acteN_fini`, `ISLAND_META.finale`).
- **Outils** : `node tools/build-foret.mjs` (génère + vérifie, ~20 s), `node tools/reach.mjs [-v]` (accessibilité des deux îles, grappin inclus, via tools/reachlib.mjs), `node tools/verify.mjs` (~25 s). Zones : tools/areas-canopee.mjs.
- **Audio** : main.js appelle audio.listener/step/sfx (receiver, relay, mirror, lantern, mixer, puzzle_solved, warp) et la propriété `z.music` (non renseignée dans les données : à ajouter côté zones si souhaité).
- **Tests navigateur** (port 8771) : foret.py (attente 15 s au retour Aube), full.py OK ; systems.py : « boss: phase 2 » échoue car le boss meurt à l'étape précédente (dégâts joueur plus élevés, test dépendant de l'ordre, sans lien avec la Forêt). Phare résolu en navigateur (solution trouvée par force brute), saut de grappin vérifié (lent sous swiftshader).
- **Limites** : durée ≈1h15 non mesurée en jeu ; visuels poteaux/anneaux en repli tant que GRAPHISME n'a pas fourni les modèles ; pas de `music` par zone ; combats de la passerelle non rejoués en navigateur.

## Annexe ACTE VI — Citadelle du Zénith (branche `acte6-zenith`), ÉTAT FINAL après fusion avec les Actes III, IV, V
- **Fait** : île 6 complète et jouable ; **les 6 actes sont fusionnés** (`ISLANDS` = aube, foret, desert, abysses, pics, zenith ; `UPCOMING` vide). Données générées par `node tools/build-zenith.mjs` (zones porte, jz1..jz3, jardins, salle = donjon, phare_z, auberge_z ; 6 ponts). Logique des portails de lumière : `js/mech/portails.js` (branche `portal` de `trace` dans `js/logic.js`). Données : `js/data/zenith.js` (14 PNJ, 5 quêtes principales, 6 secondaires, objets, recettes `island:'zenith'`, 4 ennemis dont le boss `ombre_prisme`, 6 boutiques). Boss : `js/game/boss-zenith.js` (3 phases). Décor lointain : `js/world/zenith-scene.js`. Fin : `js/game/fin.js` (cinématique, bilan, générique, jeu libre ; rejouable via Célestine ou « Contempler le Prisme »). Complétion : `js/game/completion.js`.
- **Voyage (câblage de fusion fait)** : `zenithReady(q)` et `ZENITH_TRAVEL_CHOICE` (zenith.js) ; insérés par `_insZ` en bas de `data/npcs.js` chez Calixte, Yaël, Lagon et Zéphyr, visibles seulement avec `acte1_fini`, `verre_fini|acte2_fini`, `dore_fini|acte3_fini`, `acte4_fini`, `acte5_fini` (les 5 fragments). Le choix PROVISOIRE d’Ambre est supprimé. Retours : Calixte du Zénith propose les cinq autres îles. Dialogues à plus de 5 choix : touches 1 à 9 (main.js).
- **Capacité `portails`** : UNE seule clé `abilities.portails`, donnée par Borée (Acte V, touche V, `player.portals`). Les portails de lumière du Zénith (entités `portal`) sont éteints (`isl.portalsOff`) tant que la clé manque ; Célestine redonne la clé si besoin (sans toast en double) et `main.js` rallume les portails dès qu’une capacité `portails` est donnée. Les deux mécaniques (poser des portails pour Lyra, portails de faisceaux des salles) sont indépendantes mais partagent la clé.
- **Sauvegarde** : `SAVE_VERSION` = 6 ; `normalize` garde `gear` jusqu’au niveau 4 et valide `player.portals` ; une partie d’avant l’Acte VI se charge (testée par qa_saves et qa_full_game).
- **Forge** : `UPGRADES.arme[3]` et `UPGRADES.armure[2]` portent `island: 'zenith'` : seule la forge du Zénith les propose (`screens.js` forge, `G.upgrade`) ; recettes filtrées par `island`.
- **Complétion/bilan** : `islandCompletion` utilise les mêmes parts que `completion()` (éclats, lueurs, pages, coffres, fragments, boss), avec les identifiants d’objets de `buildIsland`. Écran de fin d’acte et journal affichent « archipel complété » ; l’écran de fin liste les 6 îles.
- **Tests** : `tests/qa_zenith1` à `6`, `audit_zenith.py`, **`qa_full_game.py`** (partie complète : Aube → Forêt → Désert → Abysses → Pics → Zénith → écran de fin par les vrais passeurs, avec rechargement de page et « Continuer » entre chaque île ; avancement de chaque acte fabriqué par l’API, dialogues de fin, énigmes du phare, voyages, sauvegardes et bilan réels). Lancer : `flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/qa_full_game.py` (serveur sur le port 8873 depuis la racine du dépôt).
- **Limites honnêtes** : durée de jeu non mesurée en conditions réelles (clavier, GPU) ; qa_full_game fabrique l’avancement (quêtes, portes, boss, butin) avant chaque scène de phare ; sixième phare nommé « Socle » ; équilibrage du boss final non éprouvé hors tests logiciels.

## Annexe — Acte III (Désert des Échos), état réel
- **Fait** : île complète (11 zones, 9 ponts), jouable de bout en bout par voyage Aube/Forêt → Désert ; la fin d’acte mène désormais aux Abysses (Acte IV, via Yaël). SAVE_VERSION 6 (champ `moved`, stat `resSable`). Clés de capacité : `porter` (Acte II), `orbe` (Acte III).
- **Vérifié** : `node tools/verify.mjs`, `reach.mjs`, `coherence.mjs` (0 erreur), `dialogues.mjs` ; `tests/qa_desert_full.py` (marche réelle, ciblage, tempête, boss, vasques, phare, annexes, sauvegarde, allers-retours Forêt).
- **Non vérifié** : jeu réel au clavier, GPU réel, équilibrage et durée (70-80 min estimées, non mesurées), ressenti des tempêtes.
- **Reste** : la résistance `resSable` ne s’applique qu’aux coups de mêlée ; la quête « kill » compte toute créature (limite du moteur) ; îles 4 à 6 à faire.
- Fichiers partagés modifiés (marqués `/* ACTE III */`) : levels.js, main.js, logic.js, combat.js, state.js, screens.js, build.js, music.js, ambience.js, data/{items,enemies,quests,shops,npcs,looks}.js, tests/qa_lib.py.

## Annexe ACTE IV — Les Abysses Miroirs (branche `acte4-abysses`)

**Fichiers nouveaux :** `js/mech/eau.js` (eau miroir, orbe, plané : logique pure), `js/data/abysses.js` (créatures, objets, boutiques, quêtes, 10 PNJ, apparences), `js/world/abysses.js` (vues des bassins, vannes, socles, corniches), `js/world/creatures-abysses.js` (4 modèles), `js/islands/abysses.js` (**généré**), `tools/areas-abysses.mjs`, `tools/build-abysses.mjs`, `tools/analyse-abysses.mjs`, `tools/gen-abysses.mjs`, `tools/solutions-abysses.mjs`, `tests/abysses_*.py`.
**Fichiers partagés touchés (repère `/* ACTE IV */`) :** `js/logic.js` (bassins, vannes, socles, corniches, orbe, plané), `js/main.js` (warps, ciblage, socle/corniche/vanne, plané, boss, capacités, ambiances, `G.meta`), `js/levels.js`, `js/world/build.js` (thèmes, vues), `js/world/life.js`, `js/world/creatures.js`, `js/audio/music.js`, `js/audio/ambience.js`, `js/ui/screens.js` (forgeron générique), `js/game/combat.js` (message d’enragement), `js/data/{enemies,items,shops,quests,npcs,looks}.js` (fusion en dernière ligne), `tools/verify.mjs`, `tools/reachlib.mjs`, `tests/qa_lib.py` (racine relative, port 8871), `tests/qa_helpers.js`, `README.md`, `js/app.js`.
**Fusion avec l’Acte III (faite) :** les Abysses s’atteignent depuis le Désert (Yaël, `acte3_fini`) ou Havre-Aube (Calixte) ; Lagon ramène au Désert, à Vitrebourg ou à Havre-Aube. Une seule clé `orbe` (donnée par le Temple du Désert ; l’Orbe de l’Acte III n’étant pas une source de faisceau, l’Acte IV garde sa pose sur socle d’orbe sous la même clé ; Marée la redonne si besoin). Conflit de noms résolu : registre des socles d’orbe `isl.orbSocles` (les `isl.socles` sont ceux de l’objet porté de l’Acte III), cible d’interaction `orbsocle`. SAVE_VERSION 6, `normalize` déduit `orbe`/`porter` de `acte3_fini` et `planer` de `acte4_fini`. Aucune autre île ne dépend de `planer`.
**Commandes :** `node tools/build-abysses.mjs` · `node tools/solutions-abysses.mjs` · `node tools/verify.mjs` · `node tools/reach.mjs` · `node tools/coherence.mjs` · `flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/abysses_1_arrivee.py` (puis `_2_lac`, `_3_grottes`, `_4_phare`, `_5_secondaires`, `_6_voyage`).

## Annexe ACTE V — Les Pics du Vent (branche `acte5-pics`)
- **Fait** : île `pics` (`js/islands/pics.js`, GÉNÉRÉE par `node tools/build-pics.mjs` à partir de `tools/areas-pics.mjs` : ne jamais l'éditer à la main), données dans `js/data/pics-data.js` (objets, ennemis, boutiques, apparences) et `js/data/pics-story.js` (PNJ, quêtes, choix de Tessel), visuels `js/world/pics.js` + `pics-themes.js` + `creatures-pics.js`, sons `js/audio/themes-pics.js`, mécaniques `js/game/pics-mech.js` (planer, relais, portails). Branchement dans `main.js` : blocs `/* ACTE V */`.
- **Arrivée (fusion faite)** : les Pics s'atteignent depuis la fin de l'Acte IV (`acte4_fini`) : Lagon, Calixte et Yaël ajoutent `PICS_TRAVEL_CHOICE` (pics-story.js ; insertion en bas de npcs.js) avec `travel { to: 'pics', zone: 'col', cell: [12, 7] }`. Tessel ne propose plus les Pics. Retour : Zéphyr (Abysses, Désert, Forêt, Havre-Aube). `UPCOMING` = île 6 seule ; la fin d'acte des Abysses affiche « Pics du Vent : disponible, parle au passeur ».
- **Capacités** : UNE seule clé `planer` : donnée par Marée (Acte IV, mécanique des corniches `ledge`, mech/eau.js) ; Alizée (`teach: 'planer'`) enseigne les pierres de vent (`vent`, `ventLinks`, mode `glide` de pics-mech.js) avec la même clé. Les deux mécaniques sont indépendantes (entités, cibles, liaisons de `reachCells` distinctes). `portails` (touche V) est donnée par Borée ; `orbe`/`porter` viennent de l'Acte III.
- **Sauvegarde** : `SAVE_VERSION` = 6 (inchangé). `normalize()` valide `player.portals` (objet avec tableau `list`, sinon supprimé) et déduit `planer`/`portails` de `acte5_fini` (`planer` aussi de `acte4_fini`, `orbe`/`porter` de `acte3_fini`).
- **Fichiers communs touchés** (fusion) : `logic.js` (vent, relais `hold`, `tickTimers`, `ventLinks`), `levels.js`, `main.js`, `world/build.js` (thèmes), `world/creatures.js`, `data/items|enemies|shops|looks|npcs|quests.js` (une ligne de fusion chacun), `audio/music|ambience|sfx.js`, `engine/input.js` (touche V), `index.html` + css (bouton ◎), `ui/screens.js` (forgeron par île, prochaines îles), `game/state.js`, `tools/verify|reachlib|coherence.mjs`, `tests/qa_lib.py` (ROOT relatif).
- **Limites honnêtes** : durée 70-80 min non mesurée en jeu réel ; boss à IA générique ; le Phare n'a pas de relais temporisé (vérifié par énumération statique) ; rendu testé seulement en logiciel (≈2 images/s).
- **Tests** : `tests/qa_pics_smoke.py`, `tests/qa_pics_full.py` (`QA_PORT=8872 flock /tmp/lumen-chrome.lock timeout 900 python3 -u …` ; `qa_pics_travel.py` = route Abysses → Pics, `qa_pics_regress.py`, `qa_pics_portals.py`, `audit_targets.py`), solutions dans `tests/qa_solutions.json` (clé `pics`) et `tests/qa_solutions_pics_timed.json` (séquences chronométrées, régénérées par build-pics).


## Annexe RELIEF — socle moteur de l’altitude (branche `montagne-moteur`)

- **Données :** `zone.h` + `zone.hmap` (voir DESIGN.md, « Relief »). `HU` = 0,75, `MAX_STEP` = 1 niveau, case = 2 u. Absence = 0 : les 6 îles sont inchangées. `bridge.h` nombre ou tableau.
- **API :** `js/altitude.js` (`heightAt`, `stepOk`, `attachAltitude`, `setActiveIsland`) ; `js/world/lift.js` (`lift.add/addGroup/worldY`) ; `js/world/relief.js` ; `js/world/hole.js`. Dans `window.__lumen` : `heightAt`, `lift`, `hole`, `worldY`. `P.gy` = sol sous Lyra ; `P.y` reste la hauteur au-dessus du sol.
- **Règle d’or :** tout objet dynamique garde un y logique relatif au sol ; s’il est créé hors des groupes déjà gérés (combat, PNJ, joueur), l’enregistrer avec `lift.add(obj)`.
- **Outils :** `reachlib`, `reach`, `verify`, `coherence` (lint de `hmap` et des ponts), `generate`, `timed`, `analyse-abysses` sont conscients de l’altitude ; les `build-*.mjs` conservent désormais `h` et `hmap` (sans régénérer les îles).
- **Test :** `?ile=test-montagne` (île cachée `js/islands/test-montagne.js`, générée par `tools/build-test-montagne.mjs`, 3 terrasses 0/4/8, escalier, rampe, falaise) ; `tests/qa_altitude.py`. `qa_touch.py` attend désormais une caméra qui ne tourne pas.
- **Limites connues :** grappin et planeur interpolent le sol (`P.gy`) mais le câble/la trajectoire restent calculés en y logique : ne pas mettre de poteau de grappin ni de saut de planeur au-dessus d’une falaise de plus de ~4 niveaux sans test ; les portails téléportent au sol de la case d’arrivée (aucun enterrement). Les murs de roche utilisent la couleur de la zone : à affiner par thème. Une marche diagonale entre deux cases a Δ ≥ 2 est refusée (pas de coupe-coin). Pas d’altitude dans les intérieurs.
- **Conseils pour bâtir la montagne :** terrasses plates sous les décors (maisons, arbres, coffres) ; Δ ≤ 1 niveau par case sur les rampes et escaliers ; falaises = Δ ≥ 2 ; laisser un couloir de 2 cases pour les escaliers ; vérifier avec `node tools/verify.mjs` et `reach.mjs` ; copier le modèle de `tools/build-test-montagne.mjs` ; ajouter `h`/`hmap` aux clés de zone du script de build.

## Annexe FORÊT-MONTAGNE (branche `montagne-foret`, base 7036371)
- La Forêt est une montagne continue ; voir DESIGN.md « Forêt de Verre : la montagne ». `js/islands/foret.js` est généré par `tools/build-foret.mjs` (ne jamais éditer à la main) ; géométries dans `tools/areas-montagne.mjs`.
- `tests/qa_solutions.json` : clé `foret` régénérée (les salles pivotées ont de nouvelles solutions) ; les autres îles sont inchangées.
- Tests : `qa_montagne_foret.py`, `qa_foret_full.py`, `qa_saves.py`, outil de marche réelle `qa_walk.py` (BFS + grappin). Toujours `flock /tmp/lumen-chrome.lock`, un seul test à la fois.
- Limites connues : le Phare n'est pas visible en 3D depuis le village (boussole HUD à la place) ; les salles restent des plateformes carrées ; sous les terrasses hautes les parois sont de hautes colonnes ; les gouffres de la Canopée restent visibles ; étiquettes de la carte légèrement serrées.
- Non-régression : aube (2 faux échecs connus : énigme lumière du sanctuaire, écran de fin), désert, abysses 1 à 6, pics, zénith 1 à 6, audit zénith, saves, altitude, touch : OK.

## Audit « caméra fixe » (branche camera-audit)
- **Constat** (rayons réels sur les maillages, `tests/qa_camera_fixe.py`) : seuls les murs de donjon (2,9 u, zones à `th.floor`) cachaient totalement des objets clés (Abysses : 13 éclats, vannes, socles, lanterne, bassins ; Zénith : un panneau). Décor extérieur (rochers bas, arbres, maisons) : aucun objet clé totalement masqué ; PNJ derrière un étal ou une maison seulement partiellement, et le second trou du dialogue les dévoile (capture vue).
- **Correctif** : `world/build.js` abaisse à 0,95 un mur de donjon dont la case nord est du sol (`lowFront`). Finale (main.js) : le tour de caméra revient en douceur au plan fixe ; `S.yaw` n'est modifié nulle part. `__lumen.startFinale` exposé.
- **Textes** : plus aucune mention de rotation de caméra (le test grep le code, les docs et les CSS). Contrôles : haut = nord vérifié (marche, esquive, orientation pour grappin / plané).
- **Test** : `QA_PORT=8876 flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/qa_camera_fixe.py [île…]`. `qa_desert_full.py` : coordonnée de l'abri des Dunes corrigée (échec déjà présent avant l'audit : la case était donnée hors de la zone).
- **Reste** : un objet clé derrière un grand décor reste caché tant que Lyra est loin (le trou ne suit que Lyra et le PNJ en dialogue) ; les ennemis derrière un arbre sont parfois masqués.
