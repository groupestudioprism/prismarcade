# Tests navigateur de Lumen 0.4

Prérequis : `pip install playwright` et un Chrome/Chromium (variable `CHROME` si le chemin diffère de `/usr/bin/google-chrome`).
Les scripts lancent eux-mêmes le serveur local (port 8765) et pilotent le jeu via `window.__lumen`.

- `e2e_partie.py` : Acte I complet (intro → Séléné → Rivage → Bran → Sanctuaire → Colosse → phare → fin), puis sauvegarde et rechargement.
- `e2e_systemes.py` : boss au corps à corps, mort et reprise, 5 boutiques, vente, forge, garde-robe, menus, potion.
- `e2e_mobile.py` : mode tactile (`?touch`), écran de 844×390.

Chaque script se termine par `ERRORS: []` et `FAILS: []` quand tout est bon.
- `e2e_quetes_secondaires.py` : les 8 quêtes secondaires (proposition, objectifs, remise, récompenses).
- `e2e_interactions.py` : lampions (vraie interaction), pendentif, coffre du marteau.

Contrôle d'accessibilité des coffres et objets : `node lumen/tools/reach.mjs`.
