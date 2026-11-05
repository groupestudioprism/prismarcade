# Prism Arcade

**Prism Arcade** est la plateforme de jeux en ligne de **Prism Game**, le pôle jeu vidéo de **Studio Prism**.

Elle propose 10 mini-jeux d'arcade, tous en solo, avec une progression commune à toute la plateforme.

![Logo Prism Arcade](assets/logo.svg)

## Les 10 mini-jeux

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

## La progression

- **XP et niveaux** : chaque partie rapporte de l'XP selon le score. Un titre accompagne le niveau, de « Novice » à « Légende Arcade ».
- **Pièces** : gagnées à chaque partie, avec chaque succès et chaque défi. Elles se dépensent dans la **boutique**, qui propose pour l'instant des thèmes de couleur pour le site.
- **Succès** : 3 par jeu, plus 8 succès globaux, soit 38 au total.
- **Défis du jour** : 3 défis tirés au sort chaque jour (les mêmes pour tous les joueurs). Les finir tous rapporte un bonus de 100 pièces et alimente une série de jours consécutifs.
- **Profil** : pseudo, statistiques, records par jeu, export et import de la progression.

## Compte Studio Prism, sauvegarde en ligne et classements

On peut jouer **sans compte** : la progression reste alors dans le navigateur.

Avec un **compte Studio Prism** (même projet Firebase `archivision-studioprism` que le site et les autres applications) :
- la progression est sauvegardée en ligne dans `paPlayers/{uid}` et se retrouve sur tous les appareils ;
- à la première connexion, la progression « invité » de l'appareil est ajoutée au compte (fusion sans doublon : maxima et unions) ;
- chaque record est publié dans `paBoards/{jeu}/scores/{uid}` (pseudo + score), et la page **Classements** affiche le top 20 de chaque jeu, ainsi que le rang du joueur.

Prism Arcade **ne crée pas de compte** : l'inscription et la gestion du compte restent sur [studio-prism.com](https://studio-prism.com/). Un compte suspendu, en attente ou supprimé n'entre pas.

Le jeu continue de fonctionner entièrement si Firebase est injoignable : une copie locale par compte est gardée sur l'appareil.

**Règles Firestore** : elles vivent dans le dépôt `Studio-Prism` (`firebase/rules/31-prism-arcade.rules`, assemblées dans `firebase/firestore.rules`). Quand on ajoute un jeu, il faut ajouter son identifiant dans `paGames()`, sinon son classement est refusé.

Fichiers concernés : `js/cloud.js` (connexion, synchronisation, classements), `js/core.js` (`PA.merge`, `PA.useStore`) et `js/prism-presence.js` (présence dans le tableau de bord Studio Prism, copie de `shared/` du site).

## Structure

```
index.html            page unique (accueil, profil, boutique, écran de jeu)
css/style.css         styles
js/core.js            profil, XP, pièces, succès, défis, sons synthétisés, outils de dessin
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
