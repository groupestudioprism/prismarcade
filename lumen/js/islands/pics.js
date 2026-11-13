/* Fichier généré par tools/build-pics.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "pics",
 "num": 5,
 "name": "Les Pics du Vent",
 "intro": "Les vents des Pics se sont tus. Les moulins ne tournent plus, les drapeaux pendent comme du linge mouillé, et la neige s’accumule sans que personne ne la balaie.",
 "sky": {
  "dusk": [
   "#241f4d",
   "#5a5a9e",
   "#c8a8e0"
  ],
  "dawn": [
   "#5a6ec8",
   "#b8c8f0",
   "#fff0e0"
  ]
 },
 "regions": {
  "col": {
   "name": "Le Col",
   "zones": [
    "col",
    "auberge_p"
   ],
   "area": true
  },
  "courants": {
   "name": "Les Courants",
   "zones": [
    "cr1",
    "cr2",
    "cr3"
   ]
  },
  "terrasse": {
   "name": "La Terrasse des Girouettes",
   "zones": [
    "gir"
   ],
   "area": true
  },
  "pentes": {
   "name": "Les Pentes du Col",
   "zones": [
    "pentes"
   ],
   "area": true
  },
  "moulins": {
   "name": "Les Moulins",
   "zones": [
    "moulins"
   ],
   "area": true
  },
  "sommets": {
   "name": "Les Sommets",
   "zones": [
    "so1",
    "so2",
    "so3",
    "so4"
   ]
  },
  "phare": {
   "name": "Le Phare des Vents",
   "zones": [
    "phare_v"
   ]
  }
 },
 "pages": {
  "orin6": {
   "title": "Journal d’Orin — VI",
   "text": "Là-haut, j’ai compris que la lumière n’était pas seule. Le vent la porte, la plie, la retient un instant. Les relais à ressort du Col gardent un éclat pour le rendre plus tard : c’est une mémoire, pas une magie. Le Phare des Vents est bâti sur cette idée. Il exige trois lumières qui ne se ressemblent pas, et le temps de les réunir. Si j’avais eu un peu plus de patience, je n’aurais pas laissé le Grand Meunier s’éteindre tout seul."
  }
 },
 "stageGates": [
  "pg1",
  "pg2",
  "pg3",
  "lf1",
  "lf3",
  "pv_d1",
  "pv_d2"
 ],
 "gateText": {
  "pg1": [
   "Le premier courant se lève",
   "La lumière a trouvé son cristal : le pont se déploie."
  ],
  "pg2": [
   "Le courant double se lève",
   "Les trois cristaux brillent : le pont se déploie."
  ],
  "pg3": [
   "Les relais se souviennent",
   "Le pont vers la Terrasse se déploie."
  ],
  "lf1": [
   "Les dalles s’élèvent",
   "La pierre monte, dalle après dalle, vers les Crêtes."
  ],
  "lf3": [
   "Les dalles s’élèvent",
   "Le chemin du Phare des Vents est ouvert."
  ],
  "pv_d1": [
   "Une porte de vent s’ouvre",
   "Une salle de plus. Les objets de la suivante sont à portée."
  ],
  "pv_d2": [
   "Une porte de vent s’ouvre",
   "Une salle de plus. Les objets de la suivante sont à portée."
  ]
 },
 "endTitle": "Le Phare des Vents brille",
 "wisp": {
  "name": "Lueur des vents",
  "text": "Une Lueur violette tourbillonne entre les flocons."
 },
 "ending": "Le Phare des Vents brille. Un fragment violet du Grand Prisme flotte au-dessus de la flamme.",
 "zones": [
  {
   "id": "col",
   "region": "col",
   "title": "Le Col",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    12,
    7
   ],
   "map": [
    "       ##TT#T###T#TT####      ",
    "  HHHHHHH............HHHHHH   ",
    "  HHHHHHH.......T....HHHHHH   ",
    "  HHHHHHH.........T..HHHHHH#  ",
    " ##..,....H.......H..T..,.#H# ",
    " ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "TT.......,..H..,..........H..#",
    "T........,.....,..HH...HH....T",
    "T.HHHHH..,.H...,.............T",
    "T.HHHHH..,,,,.,,,..,,,,,,,,..T",
    "#.HHHHH.H....,,,,,H,.T.......T",
    "#.....H.....,,HHH,,.T......H.#",
    "#......H....,,HHH,,.T....HT..#",
    "#...H.......,,HHH,,.H......TT#",
    "#...........H,,,,,,,,,,,,....#",
    "#.....,,,,,,,.,,,....T......TT",
    "#.HHHHH......H.,.....T.....H.#",
    "TTHHHHH........,....HHH......#",
    "  HHHHH.T......,...THHH.....# ",
    "  T.....T..T...,....HHH....#  ",
    "  TT#..........,..........T   ",
    "     #.........,.H........H   ",
    "    # #........,H......#T#    ",
    "      ######T##,#####T#       "
   ],
   "ents": [
    {
     "t": "start",
     "x": 12,
     "y": 7
    }
   ],
   "area": true,
   "theme": "pics",
   "music": "col",
   "props": [
    {
     "t": "house",
     "id": "auberge_p",
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
     "interior": "auberge_p",
     "name": "Auberge du Chamois endormi",
     "sign": "lampion"
    },
    {
     "t": "house",
     "id": "boree_h",
     "x": 21,
     "y": 1,
     "w": 6,
     "h": 3,
     "style": "pierre",
     "door": [
      24,
      4
     ],
     "side": "S",
     "name": "Maison de Borée",
     "closed": "Borée reçoit sur la place. Sa porte est fermée."
    },
    {
     "t": "house",
     "id": "forge_p",
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
     "name": "Forge de Frimas"
    },
    {
     "t": "house",
     "id": "tourmente_h",
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
     "name": "Maison de Tourmente",
     "closed": "La porte est fermée. Derrière, on entend grincer de vieux engrenages."
    },
    {
     "t": "cairn",
     "id": "cairn_col",
     "x": 14,
     "y": 11,
     "w": 3,
     "h": 3,
     "warp": "col",
     "name": "Cristal de voyage"
    },
    {
     "t": "stall",
     "id": "etal_gentiane",
     "x": 18,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#8fc7e8",
     "name": "Gentiane, apothicaire"
    },
    {
     "t": "stall",
     "id": "etal_zephyr",
     "x": 23,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#b59cf0",
     "name": "Comptoir de Zéphyr"
    },
    {
     "t": "anvil",
     "id": "enclume_p",
     "x": 8,
     "y": 10,
     "w": 1,
     "h": 1
    },
    {
     "t": "windmill",
     "id": "moulin_col",
     "x": 20,
     "y": 17,
     "w": 3,
     "h": 3,
     "name": "Le moulin du Col"
    },
    {
     "t": "lamp",
     "x": 12,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "fanion_c1"
    },
    {
     "t": "lamp",
     "x": 18,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "fanion_c2"
    },
    {
     "t": "lamp",
     "x": 10,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "fanion_c3"
    },
    {
     "t": "lamp",
     "x": 26,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "fanion_c4"
    },
    {
     "t": "lamp",
     "x": 13,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "fanion_c5"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 21,
     "w": 1,
     "h": 1,
     "id": "fanion_c6"
    },
    {
     "t": "lamp",
     "x": 27,
     "y": 11,
     "w": 1,
     "h": 1,
     "id": "fanion_c7"
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
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "puits_p"
    },
    {
     "t": "weathervane",
     "x": 11,
     "y": 8,
     "w": 1,
     "h": 1,
     "id": "girouette_col"
    },
    {
     "t": "snowman",
     "x": 4,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "snowman",
     "x": 26,
     "y": 21,
     "w": 1,
     "h": 1
    },
    {
     "t": "sign",
     "x": 16,
     "y": 22,
     "w": 1,
     "h": 1,
     "text": "Au sud : les Pentes, puis le Moulin du Grand Meunier. Les bouquetins n’aiment pas les visiteurs."
    },
    {
     "t": "sign",
     "x": 27,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "À l’est : les Courants. Garde la voile serrée jusqu’au bord, puis laisse le vent faire."
    }
   ],
   "npcs": [
    {
     "id": "boree",
     "x": 12.6,
     "y": 9.4,
     "face": "S"
    },
    {
     "id": "gentiane",
     "x": 18.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "zephyr",
     "x": 23.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "frimas",
     "x": 9.2,
     "y": 11,
     "face": "S"
    },
    {
     "id": "alizee",
     "x": 11,
     "y": 11.4,
     "face": "E"
    },
    {
     "id": "tourmente",
     "x": 18.6,
     "y": 17.2,
     "face": "E"
    },
    {
     "id": "edel",
     "x": 9,
     "y": 16.6,
     "wander": 2.4
    },
    {
     "id": "rafale",
     "x": 25.2,
     "y": 10.6,
     "face": "W"
    }
   ],
   "pickups": []
  },
  {
   "id": "pentes",
   "region": "pentes",
   "title": "Les Pentes du Col",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 26,
   "spawn": [
    15,
    1
   ],
   "entryGate": "b_pentes",
   "map": [
    "       # T# T  ,                  ",
    "    ###.#..T.# ,#T                ",
    "    T.......T.#,..#               ",
    "   #...........,....#             ",
    "  T.#..T..,,,,,,.T..T             ",
    " T...T....,..........##           ",
    "#....,,,,.,.......T## T           ",
    "#....,....,.TT.......             ",
    " T...,...#,#...T.....             ",
    "# T..,#...,,,,,......   ########  ",
    " T..#,........,...#..   #......#  ",
    " #T#..#..T....,.....#   #......#  ",
    "    TT........,......   #......#  ",
    "      T.......,......   .......#  ",
    "    ##.......#,......   #......#  ",
    "    #.T.....#.,#.....   #......#  ",
    "    #.........,......   #......#  ",
    "  T#.T........,......   ########  ",
    "  #.......T...,,,,,TT   TT        ",
    "  TT..............,..   #         ",
    "  T##c##...T.....T,T.....#        ",
    "  ##..#...........,.....T         ",
    "   #..c..........,,...T#TT        ",
    " # ####..........,..T.#T #        ",
    "    TTrrrrrrrrrrr.r...#T          ",
    "      #..#....##.,....T           ",
    "     TT..T......T,#.T#            ",
    "       TT####TT# , #              "
   ],
   "ents": [
    {
     "t": "vent",
     "x": 20,
     "y": 13
    },
    {
     "t": "vent",
     "x": 24,
     "y": 13
    }
   ],
   "area": true,
   "theme": "pics",
   "props": [
    {
     "t": "ruin",
     "x": 17,
     "y": 25,
     "w": 1,
     "h": 1,
     "name": "Portique du Moulin"
    },
    {
     "t": "sign",
     "x": 13,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Les Pentes du Col. Les ronces de givre ne cèdent qu’à une vraie lame. Au bord du ravin, une pierre de vent attend qui oserait planer."
    },
    {
     "t": "flagpole",
     "x": 12,
     "y": 13,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_pen_coeur",
     "x": 28,
     "y": 13,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_pen_bague",
     "x": 4,
     "y": 21,
     "item": "anneau_vent",
     "n": 1
    },
    {
     "id": "ch_pen_ecus",
     "x": 19,
     "y": 3,
     "ecus": 80
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "edel1",
     "item": "edelweiss",
     "x": 4,
     "y": 8
    },
    {
     "t": "item",
     "id": "edel2",
     "item": "edelweiss",
     "x": 9,
     "y": 23
    },
    {
     "t": "item",
     "id": "edel3",
     "item": "edelweiss",
     "x": 27,
     "y": 13
    },
    {
     "t": "item",
     "id": "edel4",
     "item": "edelweiss",
     "x": 20,
     "y": 5
    },
    {
     "t": "item",
     "id": "cerf1",
     "item": "cerf_volant",
     "x": 26,
     "y": 12
    },
    {
     "t": "item",
     "id": "engrenage1",
     "item": "engrenage",
     "x": 12,
     "y": 22
    }
   ],
   "spawns": [
    {
     "type": "givrelin",
     "x": 9,
     "y": 6,
     "n": 2
    },
    {
     "type": "givrelin",
     "x": 20,
     "y": 5,
     "n": 2
    },
    {
     "type": "bourrasque",
     "x": 20,
     "y": 10,
     "n": 1
    },
    {
     "type": "bouquetin",
     "x": 12,
     "y": 17,
     "n": 1
    },
    {
     "type": "bouquetin",
     "x": 8,
     "y": 16,
     "n": 1
    },
    {
     "type": "givrelin",
     "x": 12,
     "y": 22,
     "n": 2
    },
    {
     "type": "veilleur_givre",
     "x": 17,
     "y": 24,
     "n": 1,
     "elite": true
    }
   ]
  },
  {
   "id": "moulins",
   "region": "moulins",
   "title": "Le Moulin du Grand Meunier",
   "num": 0,
   "secret": false,
   "ox": 2,
   "oy": 56,
   "spawn": [
    15,
    1
   ],
   "entryGate": "b_moulins",
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
     "x": 24,
     "y": 5,
     "dir": "S",
     "rot": true
    },
    {
     "t": "relay",
     "x": 22,
     "y": 5,
     "out": "S",
     "hold": 7,
     "id": "rl_w"
    },
    {
     "t": "receiver",
     "x": 22,
     "y": 8,
     "color": "w",
     "gate": "md_light"
    },
    {
     "t": "relay",
     "x": 24,
     "y": 2,
     "out": "E",
     "hold": 7,
     "id": "rl_n"
    },
    {
     "t": "receiver",
     "x": 27,
     "y": 2,
     "color": "w",
     "gate": "md_light"
    },
    {
     "t": "relay",
     "x": 27,
     "y": 5,
     "out": "S",
     "hold": 7,
     "id": "rl_e"
    },
    {
     "t": "receiver",
     "x": 27,
     "y": 8,
     "color": "w",
     "gate": "md_light"
    }
   ],
   "area": true,
   "theme": "moulins",
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
     "id": "ch_cle_m",
     "x": 5,
     "y": 16,
     "item": "cle_moulin",
     "n": 1
    },
    {
     "id": "ch_tresor_m",
     "x": 25,
     "y": 16,
     "item": "epee_givre",
     "n": 1
    },
    {
     "id": "ch_coeur_m",
     "x": 15,
     "y": 25,
     "item": "coeur_moulin",
     "n": 1,
     "after": "boss_meunier"
    },
    {
     "id": "ch_cache_m",
     "x": 4,
     "y": 25,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_cache2_m",
     "x": 2,
     "y": 25,
     "ecus": 220
    }
   ],
   "pickups": [
    {
     "t": "page",
     "id": "pg_moulin",
     "page": "orin6",
     "x": 2,
     "y": 24
    }
   ],
   "spawns": [
    {
     "type": "givrelin",
     "x": 5,
     "y": 5,
     "n": 4,
     "room": "md_combat"
    },
    {
     "type": "bourrasque",
     "x": 2,
     "y": 2,
     "n": 1,
     "room": "md_combat"
    },
    {
     "type": "veilleur_givre",
     "x": 5,
     "y": 15,
     "n": 1
    },
    {
     "type": "bouquetin",
     "x": 25,
     "y": 13,
     "n": 1
    },
    {
     "type": "grand_meunier",
     "x": 15,
     "y": 18,
     "n": 1,
     "boss": true
    }
   ],
   "doors": [
    {
     "gate": "md_combat",
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
     "gate": "md_light",
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
     "gate": "md_key",
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
     "key": "cle_moulin"
    }
   ],
   "warp": {
    "id": "moulins",
    "x": 15,
    "y": 5,
    "name": "Hall du Moulin",
    "needs": "boss_meunier"
   },
   "combatRooms": [
    {
     "gate": "md_combat",
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
   "id": "auberge_p",
   "region": "col",
   "title": "Auberge du Chamois endormi",
   "num": 0,
   "secret": false,
   "ox": 150,
   "oy": 0,
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
     "id": "flocon",
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
    "to": "col",
    "at": [
     5,
     5
    ]
   }
  },
  {
   "id": "cr1",
   "region": "courants",
   "title": "Le Premier Courant",
   "num": 1,
   "secret": false,
   "ox": 36,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_courants",
   "hint": "Les pierres de vent se font face de part et d’autre du vide : approche-toi de l’une, tourne-toi vers l’autre, et laisse le courant te porter. Tourne ce qu’il faut des deux côtés.",
   "seed": 5106,
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
     "t": "vent",
     "x": 5,
     "y": 5
    },
    {
     "t": "vent",
     "x": 9,
     "y": 5
    },
    {
     "t": "lantern",
     "x": 3,
     "y": 2,
     "dir": "N",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 1,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 1,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 12,
     "y": 2,
     "color": "w",
     "gate": "pg1"
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 4,
     "state": 0,
     "rot": true
    }
   ],
   "theme": "pics",
   "music": "pics"
  },
  {
   "id": "cr2",
   "region": "courants",
   "title": "Le Courant double",
   "num": 2,
   "secret": false,
   "ox": 57,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "pg1",
   "hint": "Un prisme, trois cristaux, et un vide au milieu. Deux paires de pierres de vent sont à ta disposition.",
   "seed": 5249,
   "map": [
    "###############",
    "#.....  ......#",
    "#.....  ......#",
    "#.....  ......#",
    "#.....  ......#",
    "......  .......",
    "#.....  ......#",
    "#.....  ......#",
    "#.....  ......#",
    "#.....  ......#",
    "###############"
   ],
   "ents": [
    {
     "t": "vent",
     "x": 5,
     "y": 3
    },
    {
     "t": "vent",
     "x": 8,
     "y": 3
    },
    {
     "t": "vent",
     "x": 5,
     "y": 8
    },
    {
     "t": "vent",
     "x": 8,
     "y": 8
    },
    {
     "t": "lantern",
     "x": 2,
     "y": 6,
     "dir": "N",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "prism",
     "x": 4,
     "y": 4
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 3,
     "y": 2,
     "color": "r",
     "gate": "pg2"
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 10,
     "y": 7,
     "color": "g",
     "gate": "pg2"
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 7,
     "color": "b",
     "gate": "pg2"
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 1,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 8,
     "state": 0,
     "rot": true
    }
   ],
   "theme": "pics",
   "music": "pics"
  },
  {
   "id": "cr3",
   "region": "courants",
   "title": "La Mémoire du vent",
   "num": 3,
   "secret": false,
   "ox": 78,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "pg2",
   "hint": "Un relais à ressort garde la lumière quelques secondes, puis la rend. Une seule lanterne, trois relais : éclaire-les l’un après l’autre, avant que le premier ne s’éteigne.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "...........",
    "#.........#",
    "#....#....#",
    "#..#...#..#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 5,
     "y": 4,
     "dir": "S",
     "rot": true
    },
    {
     "t": "relay",
     "x": 1,
     "y": 4,
     "out": "S",
     "hold": 10,
     "id": "cr_w"
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 7,
     "color": "w",
     "gate": "pg3"
    },
    {
     "t": "relay",
     "x": 5,
     "y": 1,
     "out": "E",
     "hold": 10,
     "id": "cr_n"
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 1,
     "color": "w",
     "gate": "pg3"
    },
    {
     "t": "relay",
     "x": 9,
     "y": 4,
     "out": "S",
     "hold": 10,
     "id": "cr_e"
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 7,
     "color": "w",
     "gate": "pg3"
    }
   ],
   "theme": "pics",
   "music": "pics"
  },
  {
   "id": "gir",
   "region": "terrasse",
   "title": "La Terrasse des Girouettes",
   "num": 0,
   "secret": false,
   "ox": 94,
   "oy": 0,
   "spawn": [
    2,
    5
   ],
   "entryGate": "pg3",
   "map": [
    "###########",
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
   "area": true,
   "theme": "pics",
   "music": "sommets",
   "props": [
    {
     "t": "weathervane",
     "id": "girouette_t1",
     "x": 3,
     "y": 3,
     "w": 1,
     "h": 1
    },
    {
     "t": "weathervane",
     "id": "girouette_t2",
     "x": 7,
     "y": 3,
     "w": 1,
     "h": 1
    },
    {
     "t": "sign",
     "x": 5,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Les girouettes de la Terrasse montrent toutes la même direction : le sud, vers les Sommets. Mais le pont ne se déploiera qu’une fois le moulin remis en marche."
    },
    {
     "t": "flagpole",
     "x": 8,
     "y": 6,
     "w": 1,
     "h": 1
    }
   ],
   "npcs": [
    {
     "id": "cime",
     "x": 7.4,
     "y": 7.5,
     "face": "W"
    }
   ],
   "chests": [
    {
     "id": "ch_terrasse",
     "x": 5,
     "y": 7,
     "item": "grande_potion",
     "n": 2
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "gir_cristal",
     "item": "cristal_vent",
     "x": 8,
     "y": 4
    }
   ],
   "warp": {
    "id": "terrasse",
    "x": 3,
    "y": 5,
    "name": "Cristal de la Terrasse"
   }
  },
  {
   "id": "so1",
   "region": "sommets",
   "title": "Le Névé",
   "num": 0,
   "secret": false,
   "ox": 89,
   "oy": 16,
   "spawn": [
    10,
    1
   ],
   "entryGate": "b_sommets",
   "map": [
    "        T .T     ##       ",
    "     TTT.#..    #..#      ",
    "    #T...#..    ....# T   ",
    "   #......,.    .....TT   ",
    " ##T......,.    ...T..T## ",
    " #.T...T..,.    ......##.#",
    " T........,.    .........#",
    "#......#.T,.    ....TTT..#",
    "#.........,.    ........T#",
    "#.T.......,.    ...T.....#",
    "#..T.....#,.    .,,,.,,,..",
    "T......#..T.    .........#",
    "#...........    ...TT....T",
    "#.#.........    .T...#..# ",
    " ##.........    .......T# ",
    "  #.........    .......## ",
    " # TT..T....    ......#   ",
    "   # #......    ...###    ",
    "      #T.#..    ..#       ",
    "        T T#    ##        "
   ],
   "ents": [
    {
     "t": "vent",
     "x": 11,
     "y": 10
    },
    {
     "t": "vent",
     "x": 16,
     "y": 10
    }
   ],
   "area": true,
   "theme": "pics",
   "music": "sommets",
   "props": [
    {
     "t": "sign",
     "x": 8,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Le Névé. Le gouffre n’a pas de pont : les anciens y déployaient leur voile. Les pierres de vent se font face de part et d’autre."
    },
    {
     "t": "flagpole",
     "x": 9,
     "y": 11,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "id": "fanion_n1",
     "x": 6,
     "y": 6,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "id": "fanion_n2",
     "x": 20,
     "y": 6,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_neve1",
     "x": 4,
     "y": 6,
     "item": "tisane_cimes",
     "n": 2
    },
    {
     "id": "ch_neve2",
     "x": 21,
     "y": 14,
     "ecus": 120
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "edel5",
     "item": "edelweiss",
     "x": 7,
     "y": 12
    },
    {
     "t": "item",
     "id": "cerf2",
     "item": "cerf_volant",
     "x": 16,
     "y": 14
    }
   ],
   "spawns": [
    {
     "type": "givrelin",
     "x": 6,
     "y": 8,
     "n": 2
    },
    {
     "type": "bourrasque",
     "x": 19,
     "y": 8,
     "n": 1
    },
    {
     "type": "givrelin",
     "x": 20,
     "y": 12,
     "n": 2
    }
   ],
   "warp": {
    "id": "neve",
    "x": 10,
    "y": 3,
    "name": "Cristal du Névé"
   }
  },
  {
   "id": "so2",
   "region": "sommets",
   "title": "La Dalle qui s’élève",
   "num": 4,
   "secret": false,
   "ox": 120,
   "oy": 21,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_so2",
   "hint": "Trois cristaux, trois couleurs : le prisme les sépare. Quand les trois brillent, les dalles de pierre montent une à une et forment un chemin.",
   "seed": 5312,
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#....#....#",
    "...........",
    "#.........#",
    "#.......#.#",
    "#.....##..#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 9,
     "dir": "S",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 9,
     "state": 0,
     "rot": true
    },
    {
     "t": "prism",
     "x": 3,
     "y": 6
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 8,
     "color": "r",
     "gate": "lf1"
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 1,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 2,
     "y": 1,
     "color": "g",
     "gate": "lf1"
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 6,
     "y": 5,
     "color": "b",
     "gate": "lf1"
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 6,
     "state": 1,
     "rot": true
    }
   ],
   "theme": "pics",
   "music": "sommets"
  },
  {
   "id": "so3",
   "region": "sommets",
   "title": "Les Crêtes",
   "num": 0,
   "secret": false,
   "ox": 136,
   "oy": 21,
   "spawn": [
    2,
    5
   ],
   "entryGate": "lf1",
   "map": [
    "        T#      #         ",
    "       #..      .###      ",
    "    ###...      ...T##    ",
    "   #......      ......T#  ",
    " ##....#..      .....#..T ",
    "..,,,,,,,.      .,,,,,,,,.",
    "#.......#.      ...T...T.T",
    "T.........      ..T...T..#",
    "#......... #### .T.......#",
    "T......TT. #..# .T.......#",
    "#...T..... .... .....#...#",
    "#......... #..# ......T..#",
    "T......... #### .........#",
    "#T.....T..      ........# ",
    "##........      .##....T.T",
    "  #.T...T.      ....T...T ",
    " # #.#....      .T.....#  ",
    "   #T##...      .....T#   ",
    "       #T.      .###T     ",
    "         #      #         "
   ],
   "ents": [
    {
     "t": "vent",
     "x": 9,
     "y": 5
    },
    {
     "t": "vent",
     "x": 16,
     "y": 5
    },
    {
     "t": "vent",
     "x": 9,
     "y": 10
    },
    {
     "t": "vent",
     "x": 11,
     "y": 10
    },
    {
     "t": "vent",
     "x": 14,
     "y": 10
    },
    {
     "t": "vent",
     "x": 16,
     "y": 10
    }
   ],
   "area": true,
   "theme": "pics",
   "music": "sommets",
   "props": [
    {
     "t": "sign",
     "x": 3,
     "y": 3,
     "w": 1,
     "h": 1,
     "text": "Les Crêtes. Six cases de vide, sans une planche. Au centre, un îlot garde ce que le vent n’a pas emporté."
    },
    {
     "t": "flagpole",
     "x": 7,
     "y": 7,
     "w": 1,
     "h": 1
    },
    {
     "t": "flagpole",
     "x": 18,
     "y": 7,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "id": "fanion_s1",
     "x": 6,
     "y": 3,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "id": "fanion_s2",
     "x": 19,
     "y": 3,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "id": "fanion_s3",
     "x": 12,
     "y": 9,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_cretes1",
     "x": 13,
     "y": 10,
     "item": "pelisse_cimes",
     "n": 1
    },
    {
     "id": "ch_cretes2",
     "x": 6,
     "y": 12,
     "item": "grande_potion",
     "n": 2
    },
    {
     "id": "ch_cretes3",
     "x": 22,
     "y": 16,
     "ecus": 160
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "edel6",
     "item": "edelweiss",
     "x": 4,
     "y": 14
    },
    {
     "t": "item",
     "id": "cerf3",
     "item": "cerf_volant",
     "x": 12,
     "y": 9
    },
    {
     "t": "item",
     "id": "edel7",
     "item": "edelweiss",
     "x": 21,
     "y": 8
    },
    {
     "t": "item",
     "id": "corne1",
     "item": "corne_cimes",
     "x": 22,
     "y": 10
    }
   ],
   "spawns": [
    {
     "type": "givrelin",
     "x": 6,
     "y": 8,
     "n": 2
    },
    {
     "type": "bourrasque",
     "x": 20,
     "y": 12,
     "n": 1
    },
    {
     "type": "bouquetin",
     "x": 20,
     "y": 6,
     "n": 1,
     "elite": true
    },
    {
     "type": "givrelin",
     "x": 21,
     "y": 8,
     "n": 2
    }
   ],
   "warp": {
    "id": "cretes",
    "x": 2,
    "y": 3,
    "name": "Cristal des Crêtes"
   }
  },
  {
   "id": "so4",
   "region": "sommets",
   "title": "Le Souffle court",
   "num": 5,
   "secret": false,
   "ox": 167,
   "oy": 21,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_so4",
   "hint": "Les relais ne gardent la lumière que cinq secondes. Une lanterne qui tourne vite, et des pas encore plus vifs : trois relais à allumer, ensemble.",
   "map": [
    "###########",
    "#.........#",
    "#.....#...#",
    "#.........#",
    "#.........#",
    ".....#.....",
    "#.........#",
    "#.........#",
    "#...#.....#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 5,
     "y": 4,
     "dir": "S",
     "rot": true
    },
    {
     "t": "relay",
     "x": 1,
     "y": 4,
     "out": "S",
     "hold": 5,
     "id": "so_w"
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 7,
     "color": "w",
     "gate": "lf3"
    },
    {
     "t": "relay",
     "x": 5,
     "y": 1,
     "out": "W",
     "hold": 5,
     "id": "so_n"
    },
    {
     "t": "receiver",
     "x": 2,
     "y": 1,
     "color": "w",
     "gate": "lf3"
    },
    {
     "t": "relay",
     "x": 9,
     "y": 4,
     "out": "S",
     "hold": 5,
     "id": "so_e"
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 7,
     "color": "w",
     "gate": "lf3"
    }
   ],
   "theme": "pics",
   "music": "sommets"
  },
  {
   "id": "phare_v",
   "region": "phare",
   "title": "Le Phare des Vents",
   "num": 6,
   "secret": false,
   "ox": 183,
   "oy": 15,
   "spawn": [
    0,
    11
   ],
   "entryGate": "lf3",
   "hint": "Le phare exige le rouge, le bleu et le magenta en même temps. Chaque salle donne sa couleur, mais il faudra défaire ce qui a ouvert les portes.",
   "map": [
    "###################",
    "#.....#.....#.....#",
    "#.....#.....x.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....#..#..#.....#",
    "#.....x.....x.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "#.....#.....#.....#",
    "......#.....#.....#",
    "###################"
   ],
   "ents": [
    {
     "t": "beacon",
     "x": 15,
     "y": 6,
     "gate": "end",
     "need": [
      "r",
      "b",
      "m"
     ]
    },
    {
     "t": "lantern",
     "x": 1,
     "y": 9,
     "dir": "S",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 3,
     "y": 6,
     "color": "r"
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 3,
     "color": "w",
     "gate": "pv_d1"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 10,
     "dir": "E",
     "rot": true
    },
    {
     "t": "prism",
     "x": 9,
     "y": 8
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "relay",
     "x": 9,
     "y": 3,
     "mix": true,
     "out": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 7,
     "y": 2,
     "color": "m",
     "gate": "pv_d2"
    },
    {
     "t": "lantern",
     "x": 13,
     "y": 10,
     "dir": "N",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 14,
     "y": 10,
     "color": "b"
    },
    {
     "t": "mirror",
     "x": 17,
     "y": 10,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 17,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 15,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 15,
     "y": 2,
     "state": 0,
     "rot": true
    }
   ],
   "theme": "phare_vents",
   "music": "phare_vents",
   "doors": [
    {
     "gate": "pv_d1",
     "look": "barrier",
     "cells": [
      [
       6,
       6
      ]
     ]
    },
    {
     "gate": "pv_d2",
     "look": "barrier",
     "cells": [
      [
       12,
       6
      ],
      [
       12,
       2
      ]
     ]
    }
   ],
   "warp": {
    "id": "phare",
    "x": 3,
    "y": 10,
    "name": "Cristal du Phare des Vents"
   },
   "stages": [
    "pv_d1",
    "pv_d2"
   ],
   "final": "end",
   "respawn": true
  }
 ],
 "bridges": [
  {
   "gate": "b_courants",
   "cells": [
    [
     30,
     5
    ],
    [
     31,
     5
    ],
    [
     32,
     5
    ],
    [
     33,
     5
    ],
    [
     34,
     5
    ],
    [
     35,
     5
    ]
   ]
  },
  {
   "gate": "pg1",
   "cells": [
    [
     51,
     5
    ],
    [
     52,
     5
    ],
    [
     53,
     5
    ],
    [
     54,
     5
    ],
    [
     55,
     5
    ],
    [
     56,
     5
    ]
   ]
  },
  {
   "gate": "pg2",
   "cells": [
    [
     72,
     5
    ],
    [
     73,
     5
    ],
    [
     74,
     5
    ],
    [
     75,
     5
    ],
    [
     76,
     5
    ],
    [
     77,
     5
    ]
   ]
  },
  {
   "gate": "pg3",
   "cells": [
    [
     89,
     5
    ],
    [
     90,
     5
    ],
    [
     91,
     5
    ],
    [
     92,
     5
    ],
    [
     93,
     5
    ]
   ]
  },
  {
   "gate": "b_pentes",
   "cells": [
    [
     15,
     24
    ],
    [
     15,
     25
    ]
   ]
  },
  {
   "gate": "b_moulins",
   "cells": [
    [
     17,
     54
    ],
    [
     17,
     55
    ]
   ]
  },
  {
   "gate": "b_sommets",
   "cells": [
    [
     99,
     11
    ],
    [
     99,
     12
    ],
    [
     99,
     13
    ],
    [
     99,
     14
    ],
    [
     99,
     15
    ]
   ]
  },
  {
   "gate": "b_so2",
   "cells": [
    [
     115,
     26
    ],
    [
     116,
     26
    ],
    [
     117,
     26
    ],
    [
     118,
     26
    ],
    [
     119,
     26
    ]
   ]
  },
  {
   "gate": "lf1",
   "cells": [
    [
     131,
     26
    ],
    [
     132,
     26
    ],
    [
     133,
     26
    ],
    [
     134,
     26
    ],
    [
     135,
     26
    ]
   ],
   "look": "lift"
  },
  {
   "gate": "b_so4",
   "cells": [
    [
     162,
     26
    ],
    [
     163,
     26
    ],
    [
     164,
     26
    ],
    [
     165,
     26
    ],
    [
     166,
     26
    ]
   ]
  },
  {
   "gate": "lf3",
   "cells": [
    [
     178,
     26
    ],
    [
     179,
     26
    ],
    [
     180,
     26
    ],
    [
     181,
     26
    ],
    [
     182,
     26
    ]
   ],
   "look": "lift"
  }
 ]
};
