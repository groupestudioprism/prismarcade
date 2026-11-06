# Prism Arcade

**Prism Arcade** est la plateforme de jeux en ligne de **Prism Game**, le pôle jeu vidéo de **Studio Prism**.

Elle propose 14 mini-jeux d'arcade, tous en solo, avec une progression commune à toute la plateforme.

![Logo Prism Arcade](assets/logo.svg)

## Les 14 mini-jeux

| Jeu | Principe | Commandes |
|---|---|---|
| **Fusion** | Fusionner les tuiles identiques jusqu'à 2048 | Flèches, ZQSD, glisser |
| **Prism Run** | Changer de voie pour traverser chaque barrière dans sa couleur | ← →, toucher gauche/droite |
| **Stack** | Empiler les blocs au plus juste (les poses parfaites font grandir le bloc) | Espace, clic, toucher |
| **Brick Break** | Casse-briques à niveaux, avec bonus (raquette large, multi-balle, ralenti, vie) | Souris, glisser, ← → |
| **Snake Neon** | Serpent classique, avec des prismes dorés en bonus | Flèches, ZQSD, glisser |
| **Gem Match** | Jeu de match-3 à niveaux : atteindre l'objectif avant la fin des coups | Glisser, toucher |
| **Block Drop** | Placer des pièces sur une grille 8×8 et effacer lignes et colonnes | Glisser-déposer |
| **Flap** | Franchir les portes de cristal avec un seul bouton | Espace, clic, toucher |
| **Astro Blast** | Shoot spatial en vagues (tir triple, tir rapide, bouclier) | Glisser, souris, flèches |
| **Memory Pulse** | Mémoriser des séquences de couleurs et de sons | Toucher, 1 2 3 4 |
| **Sky Jump** | Rebondir de plateforme en plateforme (tremplins, fissurées, mobiles) | ← →, toucher gauche/droite |
| **Shard Hit** | Planter des éclats dans un cristal qui tourne, gardien tous les 5 niveaux | Espace, toucher |
| **Color Sort** | Trier les couleurs dans les tubes, contre la montre | Toucher, 1 à 9 |
| **Tap Tiles** | Toucher les tuiles en rythme, de plus en plus vite | Toucher, D F J K |

## La progression

- **XP et niveaux** : la courbe est volontairement exigeante (≈ 350 XP pour le niveau 2, ≈ 5 500 XP par niveau vers le niveau 10, ≈ 16 000 vers le niveau 20). Un titre accompagne le niveau, de « Novice » à « Mythe vivant ». Chaque niveau rapporte des pièces ; certains offrent un objet (avatar, cadre) ou un boost.
- **Pièces** : gagnées à chaque partie, avec les succès, les défis, le cadeau du jour et les classements.
- **Boutique** (`js/economy.js`) : apparences pour les jeux (oiseau de Flap, serpent, vaisseau, raquette, tuiles, blocs…), avatars, cadres d'avatar (certains animés), thèmes du site, boosts XP ×2 / pièces ×2 et coffres prismatiques (un objet non possédé, tiré selon sa rareté). Rareté : commun, rare, épique, légendaire, exclusif.
- **Cadeau du jour** : une récompense par jour sur une série de 7 jours (le 7e est un coffre) ; la série repart à zéro si un jour est manqué.
- **Succès** : 3 par jeu, plus 8 succès globaux.
- **Défis du jour** : 3 défis tirés au sort chaque jour, avec un bonus de 100 pièces pour les 3.
- **Classements à cadeaux** : chaque jeu a un classement de la **semaine** (du lundi au dimanche, heure UTC), du **mois** et des records. À la fin d'une période, le podium reçoit automatiquement à sa visite suivante des pièces, de l'XP, des coffres et, pour le 1er, des objets **exclusifs** (cadre « Champion », avatars 🏆 / 👑, thème « Sacre du champion »). Les gains dépendent du rang, de la période et du jeu (coefficient `prize` de chaque jeu). Les trophées s'affichent dans le profil.

## Compte Studio Prism, sauvegarde en ligne et classements

On peut jouer **sans compte** : la progression reste alors dans le navigateur.

Avec un **compte Studio Prism** (même projet Firebase `archivision-studioprism` que le site et les autres applications) :
- la progression est sauvegardée en ligne dans `paPlayers/{uid}` et se retrouve sur tous les appareils ;
- à la première connexion, la progression « invité » de l'appareil est ajoutée au compte (fusion sans doublon : maxima et unions) ;
- chaque record est publié dans `paBoards/{jeu}/scores/{uid}`, et chaque score de la semaine ou du mois dans `paPeriods/{jeu__w<semaine> | jeu__m<mois>}/scores/{uid}` (pseudo, avatar, cadre, score). Les règles n'acceptent un score que pour la période en cours, calculée avec l'heure du serveur : un podium terminé est définitif.

Prism Arcade **ne crée pas de compte** : l'inscription et la gestion du compte restent sur [studio-prism.com](https://studio-prism.com/). Un compte suspendu, en attente ou supprimé n'entre pas.

Le jeu continue de fonctionner entièrement si Firebase est injoignable : une copie locale par compte est gardée sur l'appareil.

**Règles Firestore** : elles vivent dans le dépôt `Studio-Prism` (`firebase/rules/31-prism-arcade.rules`, assemblées dans `firebase/firestore.rules`). Quand on ajoute un jeu, il faut ajouter son identifiant dans `paGames()`, sinon ses classements sont refusés.

Limite connue : les scores sont calculés dans le navigateur, sans serveur (forfait Spark). Un tricheur motivé peut envoyer un faux score ; l'administration peut supprimer une entrée de classement.

Fichiers concernés : `js/cloud.js` (connexion, synchronisation, classements), `js/core.js` (`PA.merge`, `PA.useStore`) et `js/prism-presence.js` (présence dans le tableau de bord Studio Prism, copie de `shared/` du site).

## Grand jeu : Lumen (version 0.4, Acte I)

`lumen/` contient **Lumen : les Îles Brisées**, une aventure-puzzle en 3D (Three.js r160, fourni dans `lumen/vendor`, sans étape de compilation). On y joue sur `/lumen/` avec le même compte Prism Arcade : XP, pièces et sauvegarde passent par `PA.award` et `gameStats('lumen')`. **La sauvegarde de l'aventure est enregistrée sur l'appareil ; la sauvegarde en ligne demande une règle Firestore, qui n'est pas publiée pour l'instant.**

- **Contenu actuel (Acte I) :** l'Île de l'Aube, avec le village de Havre-Aube (PNJ, 5 boutiques, forge, garde-robe), la Lande des Ronces, le Sanctuaire de Brume et son boss, 3 quêtes principales et 8 quêtes secondaires, un inventaire, des armes et des équipements, des combats et 10 zones d'énigmes. Compter environ 1 h 15 pour la quête principale.
- **Tests :** `lumen/tests/` (navigateur, Playwright) et `node lumen/tools/reach.mjs` (accessibilité des coffres et objets).
- **Conception complète :** `lumen/DESIGN.md` (6 îles, environ 5 h pour la quête principale, environ 8 h 30 à 100 %).
- **Seul fichier lié à la plateforme :** `lumen/js/platform.js`. Le remplacer suffira pour les futures versions PC et mobile.
- **Énigmes :** générées et vérifiées par `node lumen/tools/build-aube.mjs`. La commande `node lumen/tools/verify.mjs` contrôle que chaque énigme a une solution et que tout est accessible.

## Structure

```
index.html            page unique (accueil, profil, boutique, écran de jeu)
css/style.css         styles
js/core.js            profil, XP, pièces, succès, défis, sons synthétisés, outils de dessin
js/economy.js         boutique, coffres, boosts, cadeau du jour, récompenses de niveau et de classement
js/cloud.js           compte Studio Prism, sauvegarde en ligne, classements
js/app.js             interface, navigation, lanceur de jeux (pause, résultats)
js/games/*.js         un fichier par jeu
assets/logo.svg       logo complet
assets/logo-mark.svg  icône (favicon)
```

Aucune dépendance, aucune étape de compilation : le site est en HTML, CSS et JavaScript pur. Les sons sont générés par Web Audio, sans aucun fichier audio.

## Ajouter un jeu

Il suffit de créer `js/games/mon-jeu.js`, puis de l'ajouter dans `index.html` avant `js/app.js` :

```js
PA.register({
  id: 'mon-jeu', name: 'Mon jeu', tagline: '…', colors: ['#hex1', '#hex2'],
  icon: '<svg viewBox="0 0 64 64">…</svg>',
  controls: 'Texte d’aide (HTML)',
  daily: [objectif1, objectif2, objectif3],          // scores possibles pour les défis du jour
  xp: (score, résultat) => …,                         // XP gagnée
  achievements: [{ id, name, desc, test: (résultat) => booléen }],
  create(api) {                                       // api : W, H, score, addScore, sfx, tone, shake, over, best, load, save
    return { update(dt) {}, draw(ctx) {}, keydown(k) {}, pointerdown(x, y) {}, swipe(dir) {} };
  },
});
```

Le canevas mesure toujours 480 × 720 en coordonnées logiques. Le lanceur s'occupe de la mise à l'échelle, de la pause, de l'écran de résultats et de la progression.

## Lancer en local

```
python3 -m http.server 8000
```

Ouvrir ensuite http://localhost:8000.

## Mise en ligne

Le site est publié avec GitHub Pages, depuis la branche `main`, à la racine du dépôt, sur **https://prismarcade.studio-prism.com/** (fichier `CNAME`).

---

Studio Prism — Prism Game
