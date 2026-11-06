# LUMEN 0.4 — Document de passation (pour reprendre le travail avec n'importe quelle IA)

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
| `groupestudioprism/prismarcade` | `main` | **En ligne.** Lumen **0.2** (énigmes seules) : ne pas casser. |
| `groupestudioprism/prismarcade` | `lumen-v04` | **Travail en cours** de Lumen 0.4 (dernier commit `527c394`). |
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
- **Déplacement :** ZQSD, WASD ou flèches. **Caméra :** glisser la souris. **Zoom :** molette.
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
