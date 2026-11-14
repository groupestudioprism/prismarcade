/* Fichier généré par tools/build-foret.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "foret",
 "num": 2,
 "name": "La Forêt de Verre",
 "intro": "Les arbres de la Forêt de Verre ont perdu leurs couleurs. Les vitraux du temple ne laissent plus passer que la brume.",
 "sky": {
  "dusk": [
   "#1d3a5a",
   "#4a8aa0",
   "#d9a8c8"
  ],
  "dawn": [
   "#3a9ad0",
   "#a8e4ec",
   "#ffe0b8"
  ]
 },
 "regions": {
  "bourg": {
   "name": "Vitrebourg",
   "zones": [
    "vitrebourg",
    "auberge_f"
   ],
   "area": true
  },
  "vitraux": {
   "name": "Les Salles de Vitraux",
   "zones": [
    "f1",
    "f2",
    "f3"
   ]
  },
  "belvedere": {
   "name": "Le Belvédère de Verre",
   "zones": [
    "belv"
   ],
   "area": true
  },
  "cascade": {
   "name": "L’escalier de la Cascade",
   "zones": [
    "cascade"
   ],
   "area": true
  },
  "lisiere": {
   "name": "La Lisière du Verre",
   "zones": [
    "lisiere"
   ],
   "area": true
  },
  "portique": {
   "name": "Le Sentier du Portique",
   "zones": [
    "sentier_t"
   ],
   "area": true
  },
  "temple": {
   "name": "Le Temple de Verre",
   "zones": [
    "temple"
   ],
   "area": true
  },
  "canopee": {
   "name": "La Canopée",
   "zones": [
    "can1",
    "can2",
    "can3",
    "can4",
    "cime_c"
   ]
  },
  "phare": {
   "name": "Le Phare de Verre",
   "zones": [
    "phare_f"
   ]
  }
 },
 "pages": {
  "orin5": {
   "title": "Journal d’Orin — V",
   "text": "Dans la forêt, j’ai compris pourquoi le vert ne suffit pas. Le jaune, le magenta et le cyan n’existent qu’à deux : ce sont des lumières qui se tiennent par la main. Le Phare de Verre est bâti sur cette idée. Il ne s’allume que si trois lumières différentes acceptent de brûler ensemble. J’aurais dû m’en souvenir, plus tard, quand j’ai voulu tout éclairer d’un seul feu."
  }
 },
 "stageGates": [
  "fc0",
  "ph_d1",
  "ph_d2"
 ],
 "endTitle": "Le Phare de Verre brille",
 "wisp": {
  "name": "Lueur de verre",
  "text": "Une Lueur transparente flotte entre les troncs."
 },
 "ending": "Le Phare de Verre brille. Un fragment vert du Grand Prisme flotte au-dessus de la flamme.",
 "layout": "montagne-1",
 "gateLinks": {
  "fg3": [
   "rac_cime"
  ]
 },
 "zones": [
  {
   "id": "f1",
   "region": "vitraux",
   "title": "Le vitrail jaune",
   "num": 1,
   "secret": false,
   "ox": 41,
   "oy": 69,
   "spawn": [
    5,
    10
   ],
   "entryGate": "b_vitres",
   "hint": "Un vitrail ne laisse passer que sa couleur. La lumière blanche devient jaune en le traversant.",
   "map": [
    "#####x#####",
    "#.........#",
    "#......#..#",
    "#.......#.#",
    "#.......#.#",
    "#...#.....#",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "#####.#####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 8,
     "y": 7,
     "dir": "N",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 5,
     "y": 7,
     "color": "y"
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 2,
     "y": 2,
     "color": "y",
     "gate": "fg1"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ],
   "h": 3,
   "doors": [
    {
     "gate": "fg1",
     "look": "barrier",
     "cells": [
      [
       5,
       0
      ]
     ]
    }
   ]
  },
  {
   "id": "f2",
   "region": "vitraux",
   "title": "Rouge et vert",
   "num": 2,
   "secret": false,
   "ox": 41,
   "oy": 58,
   "spawn": [
    5,
    10
   ],
   "entryGate": "fg1",
   "hint": "Le prisme sépare la lumière ; le relais à anneaux (mélangeur) réunit tout ce qu’il reçoit. Rouge + vert = jaune.",
   "map": [
    "#####x#####",
    "#.......#.#",
    "#......##.#",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.......#.#",
    "#.........#",
    "#.........#",
    "#####.#####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 9,
     "y": 5,
     "dir": "N",
     "rot": true
    },
    {
     "t": "prism",
     "x": 6,
     "y": 5
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "relay",
     "x": 2,
     "y": 5,
     "mix": true,
     "out": "W",
     "rot": true
    },
    {
     "t": "receiver",
     "x": 2,
     "y": 2,
     "color": "y",
     "gate": "fg2"
    },
    {
     "t": "shard",
     "x": 1,
     "y": 1
    }
   ],
   "h": 4,
   "doors": [
    {
     "gate": "fg2",
     "look": "barrier",
     "cells": [
      [
       5,
       0
      ]
     ]
    }
   ]
  },
  {
   "id": "f3",
   "region": "vitraux",
   "title": "Magenta et cyan",
   "num": 3,
   "secret": false,
   "ox": 41,
   "oy": 47,
   "spawn": [
    5,
    10
   ],
   "entryGate": "fg2",
   "hint": "Deux lanternes, deux vitraux, deux cristaux. Chaque couleur a sa route : les faisceaux peuvent se croiser.",
   "map": [
    "#####x#####",
    "#.........#",
    "#.........#",
    "#.....#...#",
    "#....#....#",
    "#.......#.#",
    "#.......#.#",
    "#.........#",
    "#.........#",
    "#.........#",
    "#####.#####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 9,
     "y": 9,
     "dir": "N",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 7,
     "y": 9,
     "color": "m"
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 9,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 2,
     "y": 2,
     "color": "m",
     "gate": "fg3"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 1,
     "dir": "N",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 6,
     "y": 1,
     "color": "c"
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 1,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 3,
     "y": 4,
     "color": "c",
     "gate": "fg3"
    },
    {
     "t": "vitrail",
     "x": 4,
     "y": 7,
     "color": "y"
    },
    {
     "t": "shard",
     "x": 1,
     "y": 1
    }
   ],
   "h": 5,
   "doors": [
    {
     "gate": "fg3",
     "look": "barrier",
     "cells": [
      [
       5,
       0
      ]
     ]
    }
   ]
  },
  {
   "id": "vitrebourg",
   "region": "bourg",
   "title": "Vitrebourg",
   "num": 0,
   "secret": false,
   "ox": 2,
   "oy": 80,
   "spawn": [
    12,
    7
   ],
   "map": [
    "      T  #TT#TTxxT###T        T#TTTT,,,TTTTT,T##",
    "  HHHHHHH....TH,,....HHHHHH   T......,......,..T",
    "  HHHHHHH......,,....HHHHHH   #......,......,..#",
    "  HHHHHHH.T...T,,..T.HHHHHH   #......,......,..T",
    "  #..,....H....,,.H.....,.TT  H....T.,......,..#",
    " ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,x,,,,,,,,,,,,,,##T",
    "T......T.,..H..,.T.......TH.# T...,,,,,,,,,     ",
    " #.......,.T...,..HH...HH....T...T...T  #       ",
    "#.HHHHH..,.....,.............T.......# T        ",
    "T.HHHHH..,,,,.,,,..,,,,,,,,...TTT###T##         ",
    "T.HHHHH.H....,,,,,H,......T..#                  ",
    "#..T..H.....,,HHH,,..........#                  ",
    "T......H....,,HHH,,....T.H...T                  ",
    "T......T....,,HHH,,.H........T                  ",
    "#...........H,,,,,,,,,,,,....#                  ",
    "T..T..,,,,,,,.,,,..........H.T                  ",
    "T.HHHHHT.....H.,.H...........#                  ",
    "TTHHHHH........,.......T.....T                  ",
    "# HHHHH..~~....,............#                   ",
    "  #.....~~~~...,...HHHHHHT.T                    ",
    "   #....~~~~~..,..THHHHHH.#                     ",
    "    #T...~~~...,H..HHHHHHT                      ",
    "      T#.T.....,T.....T###                      ",
    "      # #T###TT,#TT#TT                          "
   ],
   "ents": [
    {
     "t": "start",
     "x": 12,
     "y": 7
    }
   ],
   "hmap": [
    "      2  2222222222222        222222222222223222",
    "  2222222222222222222222222   222222222222223222",
    "  2222222222222222222222222   222222222222222222",
    "  2222222222222222222222222   222222222222222222",
    "  22222222222222222222222222  222222222222222222",
    " 22222222222222222222222222222222222222222222222",
    "22222222222222222222222222222 2222222222222     ",
    " 1111111111111111111111111111111111111  1       ",
    "11111111111111111111111111111111111111 1        ",
    "111111111111111111111111111111111111111         ",
    "111111111111111111111111111111                  ",
    "111111111111111111111111111111                  ",
    "111111111111111111111111111111                  ",
    "111111111111111111111111111111                  ",
    "000000000000000000000000000000                  ",
    "000000000000000000000000000000                  ",
    "000000000000000000000000000000                  ",
    "000000000000000000000000000000                  ",
    "0 000000000000000000000000000                   ",
    "  00000000000000000000000000                    ",
    "   000000000000000000000000                     ",
    "    0000000000000000000000                      ",
    "      00000000000000000000                      ",
    "      0 00000000000000                          "
   ],
   "area": true,
   "theme": "foret",
   "props": [
    {
     "t": "house",
     "id": "auberge_f",
     "x": 2,
     "y": 1,
     "w": 7,
     "h": 3,
     "style": "auberge",
     "door": [
      5,
      4
     ],
     "side": "S",
     "interior": "auberge_f",
     "name": "Auberge de la Rosée",
     "sign": "lampion"
    },
    {
     "t": "house",
     "id": "ambre_h",
     "x": 21,
     "y": 1,
     "w": 6,
     "h": 3,
     "style": "phare",
     "door": [
      24,
      4
     ],
     "side": "S",
     "name": "Maison d’Ambre",
     "closed": "Ambre reçoit sur la place. Sa porte est fermée."
    },
    {
     "t": "house",
     "id": "forge_f",
     "x": 2,
     "y": 8,
     "w": 5,
     "h": 3,
     "style": "forge",
     "door": [
      7,
      9
     ],
     "side": "E",
     "name": "Verrerie de Silex"
    },
    {
     "t": "house",
     "id": "perle_h",
     "x": 2,
     "y": 16,
     "w": 5,
     "h": 3,
     "style": "bois",
     "door": [
      4,
      15
     ],
     "side": "N",
     "name": "Maison de Perle",
     "closed": "La porte est fermée. On entend le souffle d’un four à verre."
    },
    {
     "t": "house",
     "id": "ficus_h",
     "x": 19,
     "y": 19,
     "w": 6,
     "h": 3,
     "style": "pierre",
     "door": [
      21,
      18
     ],
     "side": "N",
     "name": "Maison de Ficus",
     "closed": "Ficus cultive ses plantes dehors. Sa porte est fermée."
    },
    {
     "t": "fountain",
     "id": "fontaine_f",
     "x": 14,
     "y": 11,
     "w": 3,
     "h": 3,
     "warp": "vitrebourg",
     "name": "Cristal de voyage"
    },
    {
     "t": "stall",
     "id": "etal_opaline",
     "x": 18,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#5fc9b8",
     "name": "Opaline, apothicaire"
    },
    {
     "t": "stall",
     "id": "etal_galet",
     "x": 23,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#e8b65a",
     "name": "Marché du verre"
    },
    {
     "t": "anvil",
     "id": "enclume_f",
     "x": 8,
     "y": 10,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "x": 12,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion_f1"
    },
    {
     "t": "lamp",
     "x": 18,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_f2"
    },
    {
     "t": "lamp",
     "x": 10,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_f3"
    },
    {
     "t": "lamp",
     "x": 26,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion_f4"
    },
    {
     "t": "lamp",
     "x": 13,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_f5"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_f6"
    },
    {
     "t": "lamp",
     "x": 16,
     "y": 21,
     "w": 1,
     "h": 1,
     "id": "lampion_f7"
    },
    {
     "t": "crate",
     "x": 25,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 20,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 6,
     "y": 11,
     "w": 1,
     "h": 1
    },
    {
     "t": "crate",
     "x": 7,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "bench",
     "x": 12,
     "y": 14,
     "w": 1,
     "h": 1
    },
    {
     "t": "bench",
     "x": 18,
     "y": 10,
     "w": 1,
     "h": 1
    },
    {
     "t": "well",
     "x": 27,
     "y": 15,
     "w": 1,
     "h": 1,
     "id": "puits_f"
    },
    {
     "t": "sign",
     "x": 14,
     "y": 1,
     "w": 1,
     "h": 1,
     "text": "Au nord : la porte de la Lisière du Verre, puis le Temple. Les cerfs de verre n’aiment pas les visiteurs. Le village est au pied de la montagne : tout ce qui brille là-haut, c’est le Phare."
    },
    {
     "t": "sign",
     "x": 30,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "À l’est, le sentier monte vers les salles de vitraux, accrochées au flanc de la montagne. Rouge + vert = jaune, dit-on ici."
    }
   ],
   "npcs": [
    {
     "id": "ambre",
     "x": 12.6,
     "y": 9.4,
     "face": "S"
    },
    {
     "id": "opaline",
     "x": 18.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "galet",
     "x": 23.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "silex",
     "x": 9.2,
     "y": 11,
     "face": "S"
    },
    {
     "id": "perle",
     "x": 9,
     "y": 16.6,
     "wander": 2.4
    },
    {
     "id": "ficus",
     "x": 17.6,
     "y": 15.6,
     "wander": 1.6
    },
    {
     "id": "tessel",
     "x": 25.2,
     "y": 10.6,
     "face": "W"
    }
   ],
   "pickups": [],
   "doors": [
    {
     "gate": "b_lisiere",
     "look": "barrier",
     "cells": [
      [
       15,
       0
      ],
      [
       16,
       0
      ]
     ]
    },
    {
     "gate": "b_vitres",
     "look": "barrier",
     "cells": [
      [
       30,
       5
      ]
     ]
    }
   ]
  },
  {
   "id": "lisiere",
   "region": "lisiere",
   "title": "La Lisière du Verre",
   "num": 0,
   "secret": false,
   "ox": 2,
   "oy": 52,
   "spawn": [
    15,
    26
   ],
   "map": [
    "#T#,TT   T T##TT#,##T#TT          ",
    "T..,,,,,,,,,,,,,,,..#...T#T ##    ",
    "T##T..T#.T......T,T...T.#T.#.#    ",
    "   T.............,..#.........# # ",
    "  T####....##....,.............T# ",
    "  ##..c..........,,,,,,..........T",
    "  ##..#..T............,....r.T.T# ",
    " #T##c#T#.............,........#  ",
    " T...#..rr..#.......T.,........T  ",
    "  #..........TT.,,,,,,,....####T  ",
    " T #T...........,...#.........#.T ",
    "    ##..........,......T...#..##  ",
    "    # T#........,..........####   ",
    "      T T.T.....,.........#       ",
    "    ## #rTrrrrrrrrrrrrrrrrrT      ",
    "  T T.#.........,...........T#    ",
    "   TTT..#T..T...,......T....TT    ",
    "  T..,..#.......,.............TT  ",
    " #...,....,,,,,,,............#.#  ",
    " ##..,....,.....T...........#..#T ",
    "#T #.,...#,.#..........#..r...T   ",
    " #T..,,,,,,..........T.#rr..T..T  ",
    "  #T##....,...................T   ",
    "   TT.....,,,,,,.#TT.....#..T.T   ",
    "   # #.........,...T......TT T    ",
    "     ###TT.....,..#......#T       ",
    "         #TT#..,,.T.T#TT#         ",
    "            ###,,T##              "
   ],
   "ents": [],
   "hmap": [
    "888888   8 8888888888888          ",
    "888888888888888888888888888 88    ",
    "888888888888888888888888888888    ",
    "   8888888888888888888888888888 8 ",
    "  8888888888888888888888888888888 ",
    "  88888888888888888888888888888888",
    "  8888888888888888888888888888888 ",
    " 8888888888888888888887788888888  ",
    " 6666666666666666666666666666666  ",
    "  666666666666666666666666666666  ",
    " 6 666666666666666666666666666666 ",
    "    6666666666666666666666666666  ",
    "    6 6666666666666666666666666   ",
    "      6 6666666666666666666       ",
    "    66 666666666556666666666      ",
    "  4 44444444444444444444444444    ",
    "   444444444444444444444444444    ",
    "  444444444444444444444444444444  ",
    " 4444444444444444444444444444444  ",
    " 44444444444444444444444444444444 ",
    "44 4433444334444444444444444444   ",
    " 2222222222222222222222222222222  ",
    "  22222222222222222222222222222   ",
    "   2222222222222222222222222222   ",
    "   2 22222222222222222222222 2    ",
    "     2222222222222222222222       ",
    "         2222222222222222         ",
    "            22222222              "
   ],
   "area": true,
   "theme": "foret",
   "props": [
    {
     "t": "sign",
     "x": 13,
     "y": 25,
     "w": 1,
     "h": 1,
     "text": "Lisière du Verre : les premières pentes. Les ronces cristallines ne cèdent qu’à une vraie lame. Plus haut, le sentier longe le Temple."
    }
   ],
   "chests": [
    {
     "id": "ch_lis_coeur",
     "x": 4,
     "y": 6,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_lis_bague",
     "x": 29,
     "y": 10,
     "item": "anneau_prisme",
     "n": 1
    },
    {
     "id": "ch_lis_ecus",
     "x": 25,
     "y": 24,
     "ecus": 80
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "givre1",
     "item": "givre_foret",
     "x": 4,
     "y": 19
    },
    {
     "t": "item",
     "id": "givre2",
     "item": "givre_foret",
     "x": 27,
     "y": 19
    },
    {
     "t": "item",
     "id": "givre3",
     "item": "givre_foret",
     "x": 9,
     "y": 4
    },
    {
     "t": "item",
     "id": "givre4",
     "item": "givre_foret",
     "x": 30,
     "y": 4
    }
   ],
   "spawns": [
    {
     "type": "eclat",
     "x": 9,
     "y": 21,
     "n": 2
    },
    {
     "type": "eclat",
     "x": 20,
     "y": 22,
     "n": 2
    },
    {
     "type": "eclat",
     "x": 22,
     "y": 17,
     "n": 1
    },
    {
     "type": "lierre",
     "x": 27,
     "y": 23,
     "n": 1
    },
    {
     "type": "ronceux",
     "x": 12,
     "y": 10,
     "n": 1
    },
    {
     "type": "cerf",
     "x": 21,
     "y": 6,
     "n": 1
    },
    {
     "type": "cerf",
     "x": 8,
     "y": 11,
     "n": 1
    },
    {
     "type": "lierre",
     "x": 28,
     "y": 5,
     "n": 1
    },
    {
     "type": "eclat",
     "x": 12,
     "y": 5,
     "n": 2
    },
    {
     "type": "sentinelle",
     "x": 17,
     "y": 3,
     "n": 1,
     "elite": true
    }
   ]
  },
  {
   "id": "temple",
   "region": "temple",
   "title": "Le Temple de Verre",
   "num": 0,
   "secret": false,
   "ox": 8,
   "oy": 23,
   "spawn": [
    15,
    1
   ],
   "map": [
    "###############.##############",
    "#.........#.........#........#",
    "#.........#.........#........#",
    "#..#...#..#..#...#..#........#",
    "#............................#",
    "#.........#.........#........#",
    "#.........#.........#........#",
    "#..#...#..#.........#........#",
    "#.........#####x#####........#",
    "#.........#####x#####........#",
    "####x##########x#########x####",
    "####x#####...........####x####",
    "#........#...........#.......#",
    "#........#...........#.......#",
    "#........#..#.....#..#..#....#",
    "#........#...........#.......#",
    "#........#...........#.......#",
    "#........#...........#....#..#",
    "#........#...........#.......#",
    "#........#...........#.......#",
    "####c#####...........#########",
    "####c#####...........#########",
    "####c#####..#.....#..#########",
    "#.......##...........#########",
    "#.......##...........#########",
    "#.......##...........#########",
    "#.......##...........#########",
    "#.......######################",
    "##############################"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 22,
     "y": 2,
     "dir": "S"
    },
    {
     "t": "mirror",
     "x": 22,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 24,
     "y": 7,
     "color": "y"
    },
    {
     "t": "mirror",
     "x": 27,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 27,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 24,
     "y": 4,
     "color": "y",
     "gate": "td_light"
    }
   ],
   "h": 10,
   "area": true,
   "theme": "temple",
   "dungeon": true,
   "props": [
    {
     "t": "brazier",
     "x": 12,
     "y": 1,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 18,
     "y": 1,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 10,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 20,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 10,
     "y": 25,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 20,
     "y": 25,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 2,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 27,
     "y": 18,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 6,
     "y": 26,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_cle_t",
     "x": 5,
     "y": 16,
     "item": "cle_temple",
     "n": 1
    },
    {
     "id": "ch_tresor_t",
     "x": 25,
     "y": 16,
     "item": "epee_verre",
     "n": 1
    },
    {
     "id": "ch_prisme",
     "x": 15,
     "y": 25,
     "item": "prisme_vert",
     "n": 1,
     "after": "boss_verre"
    },
    {
     "id": "ch_cache_t",
     "x": 4,
     "y": 25,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_cache2_t",
     "x": 2,
     "y": 25,
     "ecus": 200
    }
   ],
   "spawns": [
    {
     "type": "eclat",
     "x": 5,
     "y": 5,
     "n": 4,
     "room": "td_combat"
    },
    {
     "type": "lierre",
     "x": 2,
     "y": 2,
     "n": 1,
     "room": "td_combat"
    },
    {
     "type": "sentinelle",
     "x": 5,
     "y": 15,
     "n": 1
    },
    {
     "type": "ronceux",
     "x": 25,
     "y": 13,
     "n": 1
    },
    {
     "type": "gardien_verre",
     "x": 15,
     "y": 18,
     "n": 1,
     "boss": true
    }
   ],
   "doors": [
    {
     "gate": "td_combat",
     "look": "seal",
     "cells": [
      [
       4,
       10
      ],
      [
       4,
       11
      ]
     ]
    },
    {
     "gate": "td_light",
     "look": "barrier",
     "cells": [
      [
       25,
       10
      ],
      [
       25,
       11
      ]
     ]
    },
    {
     "gate": "td_key",
     "look": "door",
     "cells": [
      [
       15,
       8
      ],
      [
       15,
       9
      ],
      [
       15,
       10
      ]
     ],
     "key": "cle_temple"
    }
   ],
   "warp": {
    "id": "temple",
    "x": 15,
    "y": 5,
    "name": "Hall du Temple",
    "needs": "boss_verre"
   },
   "combatRooms": [
    {
     "gate": "td_combat",
     "rect": [
      1,
      1,
      9,
      9
     ]
    }
   ]
  },
  {
   "id": "auberge_f",
   "region": "bourg",
   "title": "Auberge de la Rosée",
   "num": 0,
   "secret": false,
   "ox": 75,
   "oy": 88,
   "spawn": [
    6,
    7
   ],
   "map": [
    "#############",
    "#H.HH.HH..HH#",
    "#H........HH#",
    "#.HHHH......#",
    "#...........#",
    "#.......H...#",
    "#..H........#",
    "#...........#",
    "######.######"
   ],
   "ents": [],
   "area": true,
   "theme": "interieur",
   "interior": true,
   "props": [
    {
     "t": "counter",
     "x": 2,
     "y": 3,
     "w": 4,
     "h": 1
    },
    {
     "t": "fireplace",
     "x": 6,
     "y": 1,
     "w": 2,
     "h": 1
    },
    {
     "t": "bed",
     "x": 10,
     "y": 1,
     "w": 2,
     "h": 2,
     "rest": true,
     "name": "Lit de l’auberge"
    },
    {
     "t": "table",
     "x": 8,
     "y": 5,
     "w": 1,
     "h": 1
    },
    {
     "t": "table",
     "x": 3,
     "y": 6,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 1,
     "y": 1,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 1,
     "y": 2,
     "w": 1,
     "h": 1
    },
    {
     "t": "shelf",
     "x": 3,
     "y": 1,
     "w": 2,
     "h": 1
    }
   ],
   "npcs": [
    {
     "id": "mousse",
     "x": 3.5,
     "y": 2.1,
     "face": "S",
     "counter": true
    }
   ],
   "exit": {
    "cell": [
     6,
     8
    ],
    "to": "vitrebourg",
    "at": [
     5,
     5
    ]
   }
  },
  {
   "id": "belv",
   "region": "belvedere",
   "title": "Le Belvédère de Verre",
   "num": 0,
   "secret": false,
   "ox": 41,
   "oy": 36,
   "spawn": [
    5,
    8
   ],
   "map": [
    "########x##",
    "#.........#",
    "#.T.....T.#",
    "#.........#",
    "#.........#",
    "..........#",
    "#.........#",
    "#.........#",
    "#.T.....T.#",
    "#.........#",
    "#####.#####"
   ],
   "ents": [],
   "h": 6,
   "area": true,
   "theme": "canopee",
   "music": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 5,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "Le Belvédère. Tout le flanc de la montagne s’étend sous tes pieds. Le Phare de Verre brille tout là-haut, au nord. À l’ouest, l’escalier de la cascade redescend jusqu’au village. Au nord, la porte de la Canopée attend celui qui saura grimper."
    }
   ],
   "chests": [
    {
     "id": "ch_belv",
     "x": 5,
     "y": 6,
     "item": "grande_potion",
     "n": 2
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "belv_eclat",
     "item": "eclat_verre",
     "x": 7,
     "y": 6
    }
   ],
   "doors": [
    {
     "gate": "b_canopee",
     "look": "barrier",
     "cells": [
      [
       8,
       0
      ]
     ]
    }
   ],
   "warp": {
    "id": "belvedere",
    "x": 3,
    "y": 5,
    "name": "Cristal du Belvédère"
   }
  },
  {
   "id": "can1",
   "region": "canopee",
   "title": "Les Branches basses",
   "num": 0,
   "secret": false,
   "ox": 41,
   "oy": 23,
   "spawn": [
    8,
    10
   ],
   "entryGate": "b_canopee",
   "hint": "Grappin de lumière : tiens-toi à côté d’un poteau, tourné vers le poteau d’en face, puis appuie sur E. Le câble fait le reste.",
   "map": [
    "##########    #######",
    "#T...T....    ......#",
    "#.........    ......#",
    "#.........    ......#",
    "#.........    ......#",
    "#.........    ......#",
    "#.........    .......",
    "#.........    ......#",
    "#.........    ......#",
    "#.........    ......#",
    "#.........    ......#",
    "#T........    .T..T.#",
    "########.#    #######"
   ],
   "ents": [
    {
     "t": "post",
     "x": 9,
     "y": 6
    },
    {
     "t": "post",
     "x": 14,
     "y": 6
    },
    {
     "t": "lantern",
     "x": 16,
     "y": 9,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 16,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 18,
     "y": 3,
     "color": "w",
     "gate": "fc0"
    }
   ],
   "h": 7,
   "area": true,
   "theme": "canopee",
   "music": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 6,
     "y": 5,
     "w": 1,
     "h": 1,
     "text": "Les Branches basses. Les poteaux de verre s’accrochent deux par deux, de part et d’autre d’un vide. Place-toi devant le tien, face à l’autre, et lance le grappin."
    },
    {
     "t": "sign",
     "x": 16,
     "y": 5,
     "w": 1,
     "h": 1,
     "text": "Un cristal dort sur cette branche. Une lanterne, un miroir : tu connais la musique. Le pont des Feuilles s’ouvrira quand il brillera."
    },
    {
     "t": "crystal",
     "x": 3,
     "y": 3,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_can_b",
     "x": 19,
     "y": 10,
     "item": "grande_potion",
     "n": 1
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "graine1",
     "item": "graine_canopee",
     "x": 19,
     "y": 1
    }
   ],
   "spawns": [
    {
     "type": "eclat_ambre",
     "x": 5,
     "y": 8,
     "n": 2
    },
    {
     "type": "eclat",
     "x": 3,
     "y": 9,
     "n": 1
    }
   ],
   "warp": {
    "id": "canopee",
    "x": 3,
    "y": 3,
    "name": "Cristal de la Canopée"
   },
   "respawn": true
  },
  {
   "id": "can2",
   "region": "canopee",
   "title": "Les Feuilles de lumière",
   "num": 4,
   "secret": false,
   "ox": 65,
   "oy": 24,
   "spawn": [
    0,
    5
   ],
   "entryGate": "fc0",
   "hint": "Le vide sépare deux rives. Les poteaux se relient d’un bord à l’autre : tourne ce qu’il faut des deux côtés.",
   "seed": 2112,
   "map": [
    "###############",
    "#.....   .....#",
    "#.....   .....#",
    "#.....   .....#",
    "#.....   .....#",
    "......   ......",
    "#.....   .....#",
    "#.....   .....#",
    "#.....   .....#",
    "#.....   .....#",
    "###############"
   ],
   "ents": [
    {
     "t": "post",
     "x": 5,
     "y": 5
    },
    {
     "t": "post",
     "x": 9,
     "y": 5
    },
    {
     "t": "lantern",
     "x": 4,
     "y": 4,
     "dir": "E",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 9,
     "color": "w",
     "gate": "fc1"
    },
    {
     "t": "mirror",
     "x": 12,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 4,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 13,
     "y": 9
    }
   ],
   "h": 8,
   "theme": "canopee",
   "music": "canopee"
  },
  {
   "id": "can3",
   "region": "canopee",
   "title": "La Passerelle des Sentinelles",
   "num": 0,
   "secret": false,
   "ox": 59,
   "oy": 2,
   "spawn": [
    22,
    7
   ],
   "entryGate": "fc1",
   "hint": "La salle de l’autre côté du vide est gardée. Tant que ses gardiens vivent, le sceau reste fermé.",
   "map": [
    "                        ",
    "      ########          ",
    "      ###...#.          ",
    "      ##......   #######",
    "      ##......   .T...T#",
    "###   ##......   ......#",
    "#..   .x......   ......#",
    "x..   .x..#...   .......",
    "#..   .x......   ......#",
    "###   ##......   .....T#",
    "      ##......   ......#",
    "      ##......          ",
    "      ###...#.          ",
    "      ########  #......#",
    "                #......#",
    "                ########"
   ],
   "ents": [
    {
     "t": "post",
     "x": 17,
     "y": 7
    },
    {
     "t": "post",
     "x": 13,
     "y": 7
    },
    {
     "t": "post",
     "x": 6,
     "y": 7
    },
    {
     "t": "post",
     "x": 2,
     "y": 7
    },
    {
     "t": "post",
     "x": 20,
     "y": 10
    },
    {
     "t": "post",
     "x": 20,
     "y": 13
    }
   ],
   "h": 11,
   "area": true,
   "theme": "canopee",
   "music": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 18,
     "y": 8,
     "w": 1,
     "h": 1,
     "text": "La Passerelle des Sentinelles. Les gardiens de l’arène ne traversent pas le vide : le grappin, lui, si."
    },
    {
     "t": "brazier",
     "x": 19,
     "y": 9,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 19,
     "y": 5,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 3,
     "y": 2,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_can_p1",
     "x": 21,
     "y": 5,
     "item": "anneau_canopee",
     "n": 1
    },
    {
     "id": "ch_can_arene",
     "x": 9,
     "y": 3,
     "ecus": 120,
     "item": "sceptre",
     "n": 1
    },
    {
     "id": "ch_can_niche",
     "x": 18,
     "y": 14,
     "item": "fragment_coeur",
     "n": 1
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "graine2",
     "item": "graine_canopee",
     "x": 21,
     "y": 8
    },
    {
     "t": "item",
     "id": "graine3",
     "item": "graine_canopee",
     "x": 0,
     "y": 8
    },
    {
     "t": "page",
     "id": "pg_niche",
     "page": "orin5",
     "x": 21,
     "y": 14
    }
   ],
   "spawns": [
    {
     "type": "eclat_ambre",
     "x": 11,
     "y": 10,
     "n": 3,
     "room": "cn_combat"
    },
    {
     "type": "lierre",
     "x": 9,
     "y": 11,
     "n": 1,
     "room": "cn_combat"
    },
    {
     "type": "cerf_prisme",
     "x": 11,
     "y": 4,
     "n": 1,
     "room": "cn_combat"
    },
    {
     "type": "sentinelle_azur",
     "x": 9,
     "y": 7,
     "n": 1,
     "room": "cn_combat",
     "elite": true
    }
   ],
   "doors": [
    {
     "gate": "cn_combat",
     "look": "seal",
     "cells": [
      [
       7,
       8
      ],
      [
       7,
       7
      ],
      [
       7,
       6
      ],
      [
       0,
       7
      ]
     ]
    }
   ],
   "combatRooms": [
    {
     "gate": "cn_combat",
     "rect": [
      8,
      2,
      13,
      12
     ]
    }
   ],
   "respawn": true
  },
  {
   "id": "can4",
   "region": "canopee",
   "title": "Le Nid de lumière",
   "num": 5,
   "secret": false,
   "ox": 44,
   "oy": 4,
   "spawn": [
    14,
    5
   ],
   "entryGate": "cn_combat",
   "hint": "Un prisme, trois cristaux, et un vide au milieu. Les deux paires de poteaux sont à toi.",
   "seed": 3102,
   "map": [
    "###############",
    "#......  .....#",
    "#......  .....#",
    "#......  .....#",
    "#......  .....#",
    ".......  ......",
    "#......  .....#",
    "#......  .....#",
    "#......  .....#",
    "#......  .....#",
    "###############"
   ],
   "ents": [
    {
     "t": "post",
     "x": 9,
     "y": 7
    },
    {
     "t": "post",
     "x": 6,
     "y": 7
    },
    {
     "t": "post",
     "x": 9,
     "y": 2
    },
    {
     "t": "post",
     "x": 6,
     "y": 2
    },
    {
     "t": "lantern",
     "x": 6,
     "y": 4,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "prism",
     "x": 10,
     "y": 3
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 5,
     "y": 6,
     "color": "r",
     "gate": "fc2"
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 1,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 1,
     "color": "g",
     "gate": "fc2"
    },
    {
     "t": "mirror",
     "x": 13,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 13,
     "y": 2,
     "color": "b",
     "gate": "fc2"
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 9,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 1,
     "y": 1
    }
   ],
   "h": 12,
   "theme": "canopee",
   "music": "canopee"
  },
  {
   "id": "phare_f",
   "region": "phare",
   "title": "Le Phare de Verre",
   "num": 6,
   "secret": false,
   "ox": 22,
   "oy": 8,
   "spawn": [
    18,
    1
   ],
   "entryGate": "fc2",
   "hint": "Le phare exige le jaune, le magenta et le cyan en même temps. Chaque salle donne sa couleur, mais il faudra défaire ce qui a ouvert les portes.",
   "map": [
    "###################",
    "#.....#.....#......",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....x.....x.....#",
    "#.....#..#..#.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....x.....#.....#",
    "#.....#.....#.....#",
    "###################"
   ],
   "ents": [
    {
     "t": "beacon",
     "x": 3,
     "y": 6,
     "gate": "end",
     "need": [
      "y",
      "m",
      "c"
     ]
    },
    {
     "t": "lantern",
     "x": 17,
     "y": 3,
     "dir": "N",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 17,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 14,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 15,
     "y": 6,
     "color": "y"
    },
    {
     "t": "receiver",
     "x": 14,
     "y": 9,
     "color": "w",
     "gate": "ph_d1"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 2,
     "dir": "W",
     "rot": true
    },
    {
     "t": "prism",
     "x": 9,
     "y": 4
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 4,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 9,
     "state": 0,
     "rot": true
    },
    {
     "t": "relay",
     "x": 9,
     "y": 9,
     "mix": true,
     "out": "E",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 10,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 11,
     "y": 10,
     "color": "m",
     "gate": "ph_d2"
    },
    {
     "t": "lantern",
     "x": 5,
     "y": 2,
     "dir": "S",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 4,
     "y": 2,
     "color": "c"
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 10,
     "state": 0,
     "rot": true
    },
    {
     "t": "shard",
     "x": 1,
     "y": 11
    }
   ],
   "h": 13,
   "theme": "phare_verre",
   "music": "phare",
   "doors": [
    {
     "gate": "ph_d1",
     "look": "barrier",
     "cells": [
      [
       12,
       6
      ]
     ]
    },
    {
     "gate": "ph_d2",
     "look": "barrier",
     "cells": [
      [
       6,
       6
      ],
      [
       6,
       10
      ]
     ]
    }
   ],
   "warp": {
    "id": "phare",
    "x": 15,
    "y": 2,
    "name": "Cristal du Phare de Verre"
   },
   "stages": [
    "ph_d1",
    "ph_d2"
   ],
   "final": "end",
   "respawn": true
  },
  {
   "id": "sentier_t",
   "region": "portique",
   "title": "Le Sentier du Portique",
   "num": 0,
   "secret": false,
   "ox": 2,
   "oy": 21,
   "spawn": [
    2,
    29
   ],
   "map": [
    "#####TT###TT#TTTTTTTTH",
    "#.,,,,,,,,,,,,,,,,,,,x",
    "#.,..#                ",
    "T.,,.#                ",
    "#.,,.T                ",
    "#.,,.#                ",
    "#.,,TT                ",
    "T.,,.#                ",
    "T.,,.T                ",
    "T.,,.T                ",
    "T.,,.#                ",
    "#.,,.#                ",
    "TT,,.T                ",
    "#.,,.T                ",
    "#.,,.T                ",
    "#.,,.T                ",
    "T.,,.#                ",
    "T.,,.#                ",
    "T.,,T#                ",
    "T.,,.T                ",
    "T.,,.#                ",
    "T.,,.T                ",
    "T.,,.T                ",
    "#.,,.#                ",
    "TT,,.#                ",
    "T.,,.#                ",
    "#.,,.T                ",
    "T.,,.T                ",
    "T.,,.T                ",
    "#.,,.#                ",
    "#T,,T#                "
   ],
   "ents": [],
   "hmap": [
    "aaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaa                ",
    "aaaaaa                ",
    "aaaaaa                ",
    "aaaaaa                ",
    "aaaaaa                ",
    "aaaaaa                ",
    "aaaaaa                ",
    "aaaaaa                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "999999                ",
    "888888                ",
    "888888                ",
    "888888                ",
    "888888                ",
    "888888                ",
    "888888                ",
    "888888                "
   ],
   "area": true,
   "theme": "foret",
   "props": [
    {
     "t": "ruin",
     "x": 21,
     "y": 0,
     "w": 1,
     "h": 1,
     "name": "Portique du Temple"
    },
    {
     "t": "sign",
     "x": 4,
     "y": 28,
     "w": 1,
     "h": 1,
     "text": "Sentier du Portique. Le Temple de Verre se dresse à ta droite, sur sa terrasse. Son entrée est au nord : le sentier le contourne."
    }
   ],
   "npcs": [],
   "pickups": [],
   "doors": [
    {
     "gate": "b_temple",
     "look": "seal",
     "cells": [
      [
       21,
       1
      ]
     ]
    }
   ]
  },
  {
   "id": "cascade",
   "region": "cascade",
   "title": "L’escalier de la Cascade",
   "num": 0,
   "secret": false,
   "ox": 38,
   "oy": 41,
   "spawn": [
    1,
    1
   ],
   "map": [
    "#,,",
    "#,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,T",
    "~,.",
    "~,T",
    "~,.",
    "~,.",
    "~,T",
    "~,T",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,T",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "~,.",
    "#xx",
    ",,,"
   ],
   "ents": [],
   "hmap": [
    "666",
    "666",
    "666",
    "666",
    "666",
    "555",
    "555",
    "555",
    "555",
    "555",
    "555",
    "555",
    "555",
    "555",
    "555",
    "444",
    "444",
    "444",
    "444",
    "444",
    "444",
    "444",
    "444",
    "444",
    "333",
    "333",
    "333",
    "333",
    "333",
    "333",
    "333",
    "333",
    "333",
    "333",
    "222",
    "222",
    "222",
    "222",
    "222"
   ],
   "area": true,
   "theme": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 2,
     "y": 3,
     "w": 1,
     "h": 1,
     "text": "L’escalier de la Cascade. Un raccourci qui ne s’ouvre que vers le bas : le village est tout en bas, au pied de la montagne."
    }
   ],
   "npcs": [],
   "pickups": [],
   "doors": [
    {
     "gate": "rac_cime",
     "look": "barrier",
     "cells": [
      [
       1,
       37
      ],
      [
       2,
       37
      ]
     ]
    }
   ]
  },
  {
   "id": "cime_c",
   "region": "canopee",
   "title": "La Corniche",
   "num": 0,
   "secret": false,
   "ox": 83,
   "oy": 2,
   "spawn": [
    0,
    27
   ],
   "map": [
    ".####",
    "....#",
    "....#",
    "....#",
    "....#",
    "....#",
    "....#",
    ",,,.#",
    "..,.#",
    "..,.#",
    "..,.#",
    ".T,.#",
    "..,T#",
    "..,.#",
    "..,.#",
    "..,.#",
    "..,.#",
    ".T,.#",
    "..,.#",
    "..,.#",
    "..,T#",
    "..,.#",
    "..,.#",
    "..,.#",
    "..,.#",
    "..,.#",
    "..,.#",
    ",,,.#",
    "....#"
   ],
   "ents": [],
   "hmap": [
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "bbbbb",
    "aaaaa",
    "aaaaa",
    "aaaaa",
    "aaaaa",
    "aaaaa",
    "aaaaa",
    "aaaaa",
    "99999",
    "99999",
    "99999",
    "99999",
    "99999",
    "99999",
    "88888",
    "88888",
    "88888",
    "88888",
    "88888"
   ],
   "area": true,
   "theme": "canopee",
   "music": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 1,
     "y": 25,
     "w": 1,
     "h": 1,
     "text": "La Corniche. La rampe monte en lacet jusqu’à la Passerelle des Sentinelles. Plus haut encore, le Phare."
    }
   ],
   "npcs": [],
   "pickups": []
  }
 ],
 "bridges": [
  {
   "gate": "fc0",
   "cells": [
    [
     62,
     29
    ],
    [
     63,
     29
    ],
    [
     64,
     29
    ]
   ]
  },
  {
   "gate": "fc1",
   "cells": [
    [
     80,
     29
    ],
    [
     81,
     29
    ],
    [
     82,
     29
    ]
   ]
  },
  {
   "gate": "fc2",
   "cells": [
    [
     43,
     9
    ],
    [
     42,
     9
    ],
    [
     41,
     9
    ]
   ]
  }
 ]
};
