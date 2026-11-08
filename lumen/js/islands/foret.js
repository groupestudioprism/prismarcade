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
  "lisiere": {
   "name": "La Lisière du Verre",
   "zones": [
    "lisiere"
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
    "can4"
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
 "zones": [
  {
   "id": "f1",
   "region": "vitraux",
   "title": "Le vitrail jaune",
   "num": 1,
   "secret": false,
   "ox": 36,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_vitres",
   "hint": "Un vitrail ne laisse passer que sa couleur. La lumière blanche devient jaune en le traversant.",
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
     "x": 3,
     "y": 8,
     "dir": "E",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 3,
     "y": 5,
     "color": "y"
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 2,
     "color": "y",
     "gate": "fg1"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 9
    }
   ]
  },
  {
   "id": "f2",
   "region": "vitraux",
   "title": "Rouge et vert",
   "num": 2,
   "secret": false,
   "ox": 51,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "fg1",
   "hint": "Le prisme sépare la lumière ; le relais à anneaux (mélangeur) réunit tout ce qu’il reçoit. Rouge + vert = jaune.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "...........",
    "#.........#",
    "#.......#.#",
    "#..#....###",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 5,
     "y": 9,
     "dir": "E",
     "rot": true
    },
    {
     "t": "prism",
     "x": 5,
     "y": 6
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "relay",
     "x": 5,
     "y": 2,
     "mix": true,
     "out": "N",
     "rot": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 2,
     "color": "y",
     "gate": "fg2"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ]
  },
  {
   "id": "f3",
   "region": "vitraux",
   "title": "Magenta et cyan",
   "num": 3,
   "secret": false,
   "ox": 66,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "fg2",
   "hint": "Deux lanternes, deux vitraux, deux cristaux. Chaque couleur a sa route : les faisceaux peuvent se croiser.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "......#....",
    "#......#..#",
    "#.........#",
    "#...##....#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 1,
     "y": 9,
     "dir": "E",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 1,
     "y": 7,
     "color": "m"
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 2,
     "color": "m",
     "gate": "fg3"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 9,
     "dir": "E",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 9,
     "y": 6,
     "color": "c"
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 6,
     "y": 3,
     "color": "c",
     "gate": "fg3"
    },
    {
     "t": "vitrail",
     "x": 3,
     "y": 4,
     "color": "y"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ]
  },
  {
   "id": "vitrebourg",
   "region": "bourg",
   "title": "Vitrebourg",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    12,
    7
   ],
   "map": [
    "      T  #TT#TT##T###T        ",
    "  HHHHHHH....T.......HHHHHH   ",
    "  HHHHHHH............HHHHHH   ",
    "  HHHHHHH.T...T....T.HHHHHH   ",
    "  #..,....H.......H.....,.TH  ",
    " ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "T......T.,..H..,.T.......TH.# ",
    " #.......,.T...,..HH...HH....T",
    "#.HHHHH..,.....,.............T",
    "T.HHHHH..,,,,.,,,..,,,,,,,,..T",
    "T.HHHHH.H....,,,,,H,......T..#",
    "#..T..H.....,,HHH,,..........#",
    "T......H....,,HHH,,....T.H...T",
    "T......T....,,HHH,,.H........T",
    "#...........H,,,,,,,,,,,,....#",
    "T..T..,,,,,,,.,,,..........H.T",
    "T.HHHHHT.....H.,.H...........#",
    "TTHHHHH........,.......T.....T",
    "# HHHHH..~~....,............# ",
    "  #.....~~~~...,...HHHHHHT.T  ",
    "   #....~~~~~..,..THHHHHH.#   ",
    "    #T...~~~...,H..HHHHHHT    ",
    "      T#.T.....,H.....T###    ",
    "      # #T###TT,#TT#TT        "
   ],
   "ents": [
    {
     "t": "start",
     "x": 12,
     "y": 7
    }
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
     "x": 16,
     "y": 22,
     "w": 1,
     "h": 1,
     "text": "Au sud : la Lisière du Verre, puis le Temple. Les cerfs de verre n’aiment pas les visiteurs."
    },
    {
     "t": "sign",
     "x": 27,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "À l’est : les salles de vitraux. Rouge + vert = jaune, dit-on ici."
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
   "pickups": []
  },
  {
   "id": "lisiere",
   "region": "lisiere",
   "title": "La Lisière du Verre",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 26,
   "spawn": [
    15,
    1
   ],
   "map": [
    "           T  T,    T             ",
    "          #.TT.,T#T###   #        ",
    "      T##T.....,T.T...#T# #       ",
    "    T#.........,....#......T#     ",
    "    T.....,,,,,,.............T T  ",
    "  #T#.....,...................#   ",
    " # T.,,,,,,.............rr...T.#  ",
    "  #..,.T#.,...............r....#T ",
    "#T...,....,.#.......T.........#   ",
    "  #..,....,,,,,,,TT...........#T  ",
    "#T #T,..........,...#........T    ",
    "   T............,......T....#     ",
    "    ##..........,.........T..T    ",
    "      TrrrTrrrrrrrrrrrrrrT rr     ",
    "      TT.T......,.........#.T     ",
    "   # T #........,..........####   ",
    "   T ##..T..T...,......T...#..#   ",
    "  T.#...#.......,.............# # ",
    "   #........T...,,,,,,,....#####T ",
    "  #.....rr......T.....,.....#..#  ",
    "  ###c#..#..#.........,#.......T T",
    "   #..#...............,#...rT...T ",
    "  ##..c..........,,,,,,........#  ",
    "  T####..........,TT.....#.....T  ",
    "    TT...........,.T......T..#T   ",
    "   TT###.T.......,#.......T..#    ",
    "        T#..#....,T...TT.T TT     ",
    "        T #T###T#,##T#T # T       "
   ],
   "ents": [],
   "area": true,
   "theme": "foret",
   "props": [
    {
     "t": "ruin",
     "x": 17,
     "y": 25,
     "w": 1,
     "h": 1,
     "name": "Portique du Temple"
    },
    {
     "t": "sign",
     "x": 13,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Lisière du Verre. Les ronces cristallines ne cèdent qu’à une vraie lame."
    }
   ],
   "chests": [
    {
     "id": "ch_lis_coeur",
     "x": 4,
     "y": 21,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_lis_bague",
     "x": 29,
     "y": 17,
     "item": "anneau_prisme",
     "n": 1
    },
    {
     "id": "ch_lis_ecus",
     "x": 25,
     "y": 3,
     "ecus": 80
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "givre1",
     "item": "givre_foret",
     "x": 4,
     "y": 8
    },
    {
     "t": "item",
     "id": "givre2",
     "item": "givre_foret",
     "x": 27,
     "y": 8
    },
    {
     "t": "item",
     "id": "givre3",
     "item": "givre_foret",
     "x": 9,
     "y": 23
    },
    {
     "t": "item",
     "id": "givre4",
     "item": "givre_foret",
     "x": 30,
     "y": 23
    }
   ],
   "spawns": [
    {
     "type": "eclat",
     "x": 9,
     "y": 6,
     "n": 2
    },
    {
     "type": "eclat",
     "x": 20,
     "y": 5,
     "n": 2
    },
    {
     "type": "eclat",
     "x": 22,
     "y": 10,
     "n": 1
    },
    {
     "type": "lierre",
     "x": 27,
     "y": 4,
     "n": 1
    },
    {
     "type": "ronceux",
     "x": 12,
     "y": 17,
     "n": 1
    },
    {
     "type": "cerf",
     "x": 21,
     "y": 21,
     "n": 1
    },
    {
     "type": "cerf",
     "x": 8,
     "y": 16,
     "n": 1
    },
    {
     "type": "lierre",
     "x": 28,
     "y": 22,
     "n": 1
    },
    {
     "type": "eclat",
     "x": 12,
     "y": 22,
     "n": 2
    },
    {
     "type": "sentinelle",
     "x": 17,
     "y": 24,
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
   "ox": 2,
   "oy": 56,
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
   "ox": 81,
   "oy": 0,
   "spawn": [
    2,
    5
   ],
   "entryGate": "fg3",
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
   "theme": "canopee",
   "music": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 5,
     "y": 3,
     "w": 1,
     "h": 1,
     "text": "Le Phare de Verre se dresse au bout de la Canopée, tout là-haut. Il lui faut le jaune, le magenta et le cyan, ensemble. Au sud, un pont de lumière attend celui qui saura grimper."
    }
   ],
   "chests": [
    {
     "id": "ch_belv",
     "x": 5,
     "y": 7,
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
     "y": 5
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
   "ox": 78,
   "oy": 16,
   "spawn": [
    8,
    2
   ],
   "entryGate": "b_canopee",
   "hint": "Grappin de lumière : tiens-toi à côté d’un poteau, tourné vers le poteau d’en face, puis appuie sur E. Le câble fait le reste.",
   "map": [
    "########.#    #######",
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
    "##########    #######"
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
   "ox": 102,
   "oy": 17,
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
   "theme": "canopee",
   "music": "canopee"
  },
  {
   "id": "can3",
   "region": "canopee",
   "title": "La Passerelle des Sentinelles",
   "num": 0,
   "secret": false,
   "ox": 120,
   "oy": 14,
   "spawn": [
    1,
    8
   ],
   "entryGate": "fc1",
   "hint": "La salle de l’autre côté du vide est gardée. Tant que ses gardiens vivent, le sceau reste fermé.",
   "map": [
    "########                ",
    "#......#                ",
    "#......#  ########      ",
    "          .#...###      ",
    "          ......##      ",
    "#......   ......##      ",
    "#T.....   ......##   ###",
    "#......   ......x.   ..#",
    ".......   ...#..x.   ..x",
    "#......   ......x.   ..#",
    "#......   ......##   ###",
    "#T...T.   ......##      ",
    "#######   ......##      ",
    "          .#...###      ",
    "          ########      ",
    "                        "
   ],
   "ents": [
    {
     "t": "post",
     "x": 6,
     "y": 8
    },
    {
     "t": "post",
     "x": 10,
     "y": 8
    },
    {
     "t": "post",
     "x": 17,
     "y": 8
    },
    {
     "t": "post",
     "x": 21,
     "y": 8
    },
    {
     "t": "post",
     "x": 3,
     "y": 5
    },
    {
     "t": "post",
     "x": 3,
     "y": 2
    }
   ],
   "area": true,
   "theme": "canopee",
   "music": "canopee",
   "props": [
    {
     "t": "sign",
     "x": 5,
     "y": 7,
     "w": 1,
     "h": 1,
     "text": "La Passerelle des Sentinelles. Les gardiens de l’arène ne traversent pas le vide : le grappin, lui, si."
    },
    {
     "t": "brazier",
     "x": 4,
     "y": 6,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 4,
     "y": 10,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 20,
     "y": 13,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_can_p1",
     "x": 2,
     "y": 10,
     "item": "anneau_canopee",
     "n": 1
    },
    {
     "id": "ch_can_arene",
     "x": 14,
     "y": 12,
     "ecus": 120
    },
    {
     "id": "ch_can_niche",
     "x": 5,
     "y": 1,
     "item": "fragment_coeur",
     "n": 1
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "graine2",
     "item": "graine_canopee",
     "x": 2,
     "y": 7
    },
    {
     "t": "item",
     "id": "graine3",
     "item": "graine_canopee",
     "x": 23,
     "y": 7
    },
    {
     "t": "page",
     "id": "pg_niche",
     "page": "orin5",
     "x": 2,
     "y": 1
    }
   ],
   "spawns": [
    {
     "type": "eclat_ambre",
     "x": 12,
     "y": 5,
     "n": 3,
     "room": "cn_combat"
    },
    {
     "type": "lierre",
     "x": 14,
     "y": 4,
     "n": 1,
     "room": "cn_combat"
    },
    {
     "type": "cerf_prisme",
     "x": 12,
     "y": 11,
     "n": 1,
     "room": "cn_combat"
    },
    {
     "type": "sentinelle_azur",
     "x": 14,
     "y": 8,
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
       16,
       7
      ],
      [
       16,
       8
      ],
      [
       16,
       9
      ],
      [
       23,
       8
      ]
     ]
    }
   ],
   "combatRooms": [
    {
     "gate": "cn_combat",
     "rect": [
      10,
      3,
      15,
      13
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
   "ox": 144,
   "oy": 17,
   "spawn": [
    0,
    5
   ],
   "entryGate": "cn_combat",
   "hint": "Un prisme, trois cristaux, et un vide au milieu. Les deux paires de poteaux sont à toi.",
   "seed": 3102,
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
     "t": "post",
     "x": 5,
     "y": 3
    },
    {
     "t": "post",
     "x": 8,
     "y": 3
    },
    {
     "t": "post",
     "x": 5,
     "y": 8
    },
    {
     "t": "post",
     "x": 8,
     "y": 8
    },
    {
     "t": "lantern",
     "x": 8,
     "y": 6,
     "dir": "E",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "prism",
     "x": 4,
     "y": 7
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 4,
     "color": "r",
     "gate": "fc2"
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 9,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 10,
     "y": 9,
     "color": "g",
     "gate": "fc2"
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 8,
     "color": "b",
     "gate": "fc2"
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 1,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 13,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 13,
     "y": 9
    }
   ],
   "theme": "canopee",
   "music": "canopee"
  },
  {
   "id": "phare_f",
   "region": "phare",
   "title": "Le Phare de Verre",
   "num": 6,
   "secret": false,
   "ox": 162,
   "oy": 11,
   "spawn": [
    0,
    11
   ],
   "entryGate": "fc2",
   "hint": "Le phare exige le jaune, le magenta et le cyan en même temps. Chaque salle donne sa couleur, mais il faudra défaire ce qui a ouvert les portes.",
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
      "y",
      "m",
      "c"
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
     "color": "y"
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 3,
     "color": "w",
     "gate": "ph_d1"
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
     "gate": "ph_d2"
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
     "color": "c"
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
    },
    {
     "t": "shard",
     "x": 17,
     "y": 1
    }
   ],
   "theme": "phare_verre",
   "music": "phare",
   "doors": [
    {
     "gate": "ph_d1",
     "look": "barrier",
     "cells": [
      [
       6,
       6
      ]
     ]
    },
    {
     "gate": "ph_d2",
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
    "name": "Cristal du Phare de Verre"
   },
   "stages": [
    "ph_d1",
    "ph_d2"
   ],
   "final": "end",
   "respawn": true
  }
 ],
 "bridges": [
  {
   "gate": "b_vitres",
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
   "gate": "fg1",
   "cells": [
    [
     47,
     5
    ],
    [
     48,
     5
    ],
    [
     49,
     5
    ],
    [
     50,
     5
    ]
   ]
  },
  {
   "gate": "fg2",
   "cells": [
    [
     62,
     5
    ],
    [
     63,
     5
    ],
    [
     64,
     5
    ],
    [
     65,
     5
    ]
   ]
  },
  {
   "gate": "fg3",
   "cells": [
    [
     77,
     5
    ],
    [
     78,
     5
    ],
    [
     79,
     5
    ],
    [
     80,
     5
    ]
   ]
  },
  {
   "gate": "b_lisiere",
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
   "gate": "b_temple",
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
   "gate": "b_canopee",
   "cells": [
    [
     86,
     11
    ],
    [
     86,
     12
    ],
    [
     86,
     13
    ],
    [
     86,
     14
    ],
    [
     86,
     15
    ]
   ]
  },
  {
   "gate": "fc0",
   "cells": [
    [
     99,
     22
    ],
    [
     100,
     22
    ],
    [
     101,
     22
    ]
   ]
  },
  {
   "gate": "fc1",
   "cells": [
    [
     117,
     22
    ],
    [
     118,
     22
    ],
    [
     119,
     22
    ]
   ]
  },
  {
   "gate": "fc2",
   "cells": [
    [
     159,
     22
    ],
    [
     160,
     22
    ],
    [
     161,
     22
    ]
   ]
  }
 ]
};
