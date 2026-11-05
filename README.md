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

La progression est enregistrée dans le navigateur (`localStorage`). Toute la persistance passe par `load()` et `save()` dans `js/core.js`. C'est l'endroit où brancher un compte Studio Prism (Firebase) plus tard.

## Structure

```
index.html            page unique (accueil, profil, boutique, écran de jeu)
css/style.css         styles
js/core.js            profil, XP, pièces, succès, défis, sons synthétisés, outils de dessin
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

Le site est publié avec GitHub Pages, depuis la branche `main`, à la racine du dépôt.

---

Studio Prism — Prism Game
