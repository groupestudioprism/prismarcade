/* Fichier généré par tools/build-desert.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "desert",
 "num": 3,
 "name": "Le Désert des Échos",
 "intro": "Le sable du Désert des Échos a recouvert les temples et fait taire les voix. On dit que chaque cri s’y répète trois fois avant de mourir.",
 "sky": {
  "dusk": [
   "#5a2a3a",
   "#d9803a",
   "#ffd88a"
  ],
  "dawn": [
   "#e8903a",
   "#ffd89a",
   "#fff0c8"
  ]
 },
 "regions": {
  "cite": {
   "name": "La Cité des Échos",
   "zones": [
    "cite",
    "auberge_d"
   ],
   "area": true
  },
  "dunes": {
   "name": "Les Dunes",
   "zones": [
    "d1",
    "d2",
    "d3",
    "d4",
    "dunes",
    "oasis"
   ]
  },
  "temple": {
   "name": "Le Temple enseveli",
   "zones": [
    "temple_d"
   ],
   "area": true
  },
  "phare": {
   "name": "Le Phare des Sables",
   "zones": [
    "ph_vest",
    "phare_d"
   ]
  }
 },
 "pages": {
  "orin6": {
   "title": "Journal d’Orin — VI",
   "text": "Dans le désert, j’ai compris qu’une lumière peut voyager sans qu’on la porte, et qu’on peut porter ce qui la guide. Un miroir sur le bon socle vaut mieux qu’un feu plus grand. J’ai laissé une dernière flamme à Fia, mon amie des routes : une petite lumière qu’on peut garder dans la main, et qui allume les vasques de pierre. Je ne reviendrai pas la chercher."
  }
 },
 "stageGates": [],
 "endTitle": "Le Phare des Sables brille",
 "wisp": {
  "name": "Lueur de sable",
  "text": "Une Lueur dorée tourbillonne dans le vent chaud."
 },
 "ending": "Le Phare des Sables brille. Un fragment doré du Grand Prisme flotte au-dessus de la flamme.",
 "zones": [
  {
   "id": "cite",
   "region": "cite",
   "title": "La Cité des Échos",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    12,
    7
   ],
   "map": [
    "      T##TTT####T####TT       ",
    "  HHHHHHH.........T..HHHHHH   ",
    "  HHHHHHHT.........T.HHHHHH   ",
    "  HHHHHHHT...........HHHHHH   ",
    "  #..,....H.......HT....,.#H# ",
    "#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "#..T.....,..H..,......T...HH.#",
    "T......T.,.....,T.HH...HH....T",
    "T.HHHHH.T,.....,......T.T....#",
    "T.HHHHH..,,,,.,,,..,,,,,,,,..#",
    "#.HHHHH.H....,,,,,H,.....T...#",
    "#....TH.....,,HHH,,.T.T...T..#",
    "#..T...H....,,HHH,,......H.T.T",
    "#...........,,HHH,,.H........#",
    "#...H.......H,,,,,,,,,,,,.H..#",
    "T.....,,,,,,,.,,,............#",
    "#.HHHHH......H.,.H...........#",
    " #HHHHHT.......,.............#",
    "#THHHHH..~~....,............#T",
    "  #....T~~~~...,...HHHHHH..#  ",
    "   #....~~~~~..,...HHHHHH##T  ",
    "    ##..T~~~...,H..HHHHHH     ",
    "      ##TT..HT.,H.T...##      ",
    "         T#T###,##T#TT        "
   ],
   "ents": [
    {
     "t": "start",
     "x": 12,
     "y": 7
    }
   ],
   "area": true,
   "theme": "cite",
   "music": "cite",
   "props": [
    {
     "t": "house",
     "id": "auberge_d",
     "x": 2,
     "y": 1,
     "w": 7,
     "h": 3,
     "style": "sable",
     "door": [
      5,
      4
     ],
     "side": "S",
     "interior": "auberge_d",
     "name": "Auberge de l’Oasis",
     "sign": "lampion"
    },
    {
     "t": "house",
     "id": "oumi_h",
     "x": 21,
     "y": 1,
     "w": 6,
     "h": 3,
     "style": "sable",
     "door": [
      24,
      4
     ],
     "side": "S",
     "name": "Maison d’Oumi",
     "closed": "Oumi reçoit sur la place, à l’ombre de la fontaine. Sa porte est fermée."
    },
    {
     "t": "house",
     "id": "forge_d",
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
     "name": "Forge de Rafik"
    },
    {
     "t": "house",
     "id": "leila_h",
     "x": 2,
     "y": 16,
     "w": 5,
     "h": 3,
     "style": "sable",
     "door": [
      4,
      15
     ],
     "side": "N",
     "name": "Atelier de Leïla",
     "closed": "La porte est fermée. On entend tourner un tour de potier."
    },
    {
     "t": "house",
     "id": "idris_h",
     "x": 19,
     "y": 19,
     "w": 6,
     "h": 3,
     "style": "sable",
     "door": [
      21,
      18
     ],
     "side": "N",
     "name": "Maison d’Idris",
     "closed": "Idris est toujours dehors, la tête dans ses tablettes. Sa porte est fermée."
    },
    {
     "t": "fountain",
     "id": "fontaine_d",
     "x": 14,
     "y": 11,
     "w": 3,
     "h": 3,
     "warp": "cite",
     "name": "Cristal de voyage"
    },
    {
     "t": "stall",
     "id": "etal_djamila",
     "x": 18,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#5fb37a",
     "name": "Djamila, apothicaire"
    },
    {
     "t": "stall",
     "id": "etal_kassim",
     "x": 23,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#d98a3a",
     "name": "Caravane de Kassim"
    },
    {
     "t": "anvil",
     "id": "enclume_d",
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
     "id": "lampion_d1"
    },
    {
     "t": "lamp",
     "x": 18,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_d2"
    },
    {
     "t": "lamp",
     "x": 10,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_d3"
    },
    {
     "t": "lamp",
     "x": 26,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion_d4"
    },
    {
     "t": "lamp",
     "x": 13,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_d5"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_d6"
    },
    {
     "t": "lamp",
     "x": 16,
     "y": 21,
     "w": 1,
     "h": 1,
     "id": "lampion_d7"
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
     "t": "pot",
     "x": 4,
     "y": 14,
     "w": 1,
     "h": 1,
     "color": "#c9783a"
    },
    {
     "t": "pot",
     "x": 12,
     "y": 22,
     "w": 1,
     "h": 1,
     "color": "#b8602a"
    },
    {
     "t": "pot",
     "x": 26,
     "y": 14,
     "w": 1,
     "h": 1,
     "color": "#d4883a"
    },
    {
     "t": "stele",
     "x": 27,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "stele_cite"
    },
    {
     "t": "sign",
     "x": 16,
     "y": 22,
     "w": 1,
     "h": 1,
     "text": "Au sud : l’Oasis des Roseaux, où la Cité puise son eau. Méfie-toi des scorpions sous les pierres chaudes."
    },
    {
     "t": "sign",
     "x": 27,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "À l’est : les salles de sable, puis les Dunes. Tes pas y sonnent deux fois : c’est l’écho, il ne ment jamais longtemps."
    }
   ],
   "npcs": [
    {
     "id": "oumi",
     "x": 12.6,
     "y": 9.4,
     "face": "S"
    },
    {
     "id": "djamila",
     "x": 18.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "kassim",
     "x": 23.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "rafik",
     "x": 9.2,
     "y": 11,
     "face": "S"
    },
    {
     "id": "leila",
     "x": 9,
     "y": 16.6,
     "wander": 2.4
    },
    {
     "id": "idris",
     "x": 17.6,
     "y": 15.6,
     "wander": 1.6
    },
    {
     "id": "yael",
     "x": 25.2,
     "y": 10.6,
     "face": "W"
    },
    {
     "id": "samir",
     "x": 6.4,
     "y": 13.2,
     "face": "E"
    },
    {
     "id": "tarek",
     "x": 12.4,
     "y": 16.6,
     "wander": 2
    },
    {
     "id": "ysmael",
     "x": 18.8,
     "y": 11.6,
     "face": "W"
    }
   ],
   "pickups": [],
   "entry": [
    12,
    7
   ]
  },
  {
   "id": "d1",
   "region": "dunes",
   "title": "La première lame",
   "num": 1,
   "secret": false,
   "ox": 36,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_sable",
   "hint": "Une lame semi-réfléchissante laisse passer la lumière ET en renvoie la moitié sur le côté. Une seule lanterne peut éclairer deux cristaux.",
   "map": [
    "###########",
    "#.........#",
    "#..#......#",
    "#.........#",
    "#.......#.#",
    "...........",
    "#.#.......#",
    "#.........#",
    "#.........#",
    "#.......#.#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 8,
     "dir": "S",
     "rot": true
    },
    {
     "t": "splitter",
     "x": 6,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 8,
     "color": "w",
     "gate": "ds1"
    },
    {
     "t": "receiver",
     "x": 6,
     "y": 3,
     "color": "w",
     "gate": "ds1"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ],
   "theme": "ruines",
   "music": "dunes",
   "entry": [
    0,
    5
   ]
  },
  {
   "id": "d2",
   "region": "dunes",
   "title": "Le miroir sur son socle",
   "num": 2,
   "secret": false,
   "ox": 51,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "ds1",
   "hint": "Ce miroir n’est pas scellé : approche-toi et porte-le (R) jusqu’à un autre socle. Pendant une tempête de sable, la lumière ne porte plus loin : patiente, ou abrite-toi.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#..#..#...#",
    "...........",
    "#.........#",
    "#.........#",
    "#...#.#...#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 2,
     "dir": "S",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 6,
     "state": 0,
     "rot": true,
     "carry": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 8,
     "color": "w",
     "gate": "ds2"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 9
    }
   ],
   "theme": "ruines",
   "music": "dunes",
   "socles": [
    [
     4,
     6
    ],
    [
     8,
     2
    ]
   ],
   "storm": true,
   "entry": [
    0,
    5
   ]
  },
  {
   "id": "d3",
   "region": "dunes",
   "title": "Deux routes",
   "num": 3,
   "secret": false,
   "ox": 66,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "ds2",
   "hint": "La lame partage le faisceau : une moitié file tout droit, l’autre monte. Deux miroirs mobiles, un seul bon socle.",
   "map": [
    "###########",
    "#.........#",
    "#.#.......#",
    "#.........#",
    "#.........#",
    "...........",
    "#..#...#.##",
    "#.........#",
    "#.........#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 1,
     "y": 8,
     "dir": "N",
     "rot": true
    },
    {
     "t": "splitter",
     "x": 5,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 3,
     "state": 1,
     "rot": true,
     "carry": true
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 7,
     "state": 0,
     "rot": true,
     "carry": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 8,
     "color": "w",
     "gate": "ds3"
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 3,
     "color": "w",
     "gate": "ds3"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ],
   "theme": "ruines",
   "music": "dunes",
   "socles": [
    [
     2,
     3
    ],
    [
     5,
     3
    ],
    [
     8,
     3
    ],
    [
     8,
     7
    ]
   ],
   "storm": true,
   "entry": [
    0,
    5
   ]
  },
  {
   "id": "d4",
   "region": "dunes",
   "title": "Le prisme voyageur",
   "num": 4,
   "secret": false,
   "ox": 81,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "ds3",
   "hint": "Même un prisme se porte. Pose-le là où le rouge, le vert et le bleu trouveront chacun leur cristal.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#..#...#..#",
    "...........",
    "#..#...#..#",
    "#.........#",
    "#.........#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 1,
     "y": 8,
     "dir": "N",
     "rot": true
    },
    {
     "t": "prism",
     "x": 3,
     "y": 2,
     "carry": true
    },
    {
     "t": "receiver",
     "x": 5,
     "y": 2,
     "color": "r",
     "gate": "ds4"
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 8,
     "color": "g",
     "gate": "ds4"
    },
    {
     "t": "receiver",
     "x": 5,
     "y": 9,
     "color": "b",
     "gate": "ds4"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ],
   "theme": "ruines",
   "music": "dunes",
   "socles": [
    [
     3,
     2
    ],
    [
     5,
     8
    ],
    [
     8,
     2
    ]
   ],
   "storm": true,
   "entry": [
    0,
    5
   ]
  },
  {
   "id": "oasis",
   "region": "dunes",
   "title": "L’Oasis des Roseaux",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 28,
   "spawn": [
    15,
    1
   ],
   "map": [
    "           T #T,#####T            ",
    "        ##T.T.#,...#..###T        ",
    "       #.....H.,..........T#      ",
    "    #T#...#....,............##    ",
    "    #..........,...#.........T    ",
    "  #.......T....,.........T....TT  ",
    "  #.....,,,,,,,,,,,,,,,,,,,,....T ",
    " #.T....,#.T......TH#..T...,....# ",
    "#T......,.#.............#..,.....#",
    "T.#.....,.........T....H...,...TT#",
    " #.#....,.....T.~~~....T.#.,.....#",
    "#T......,.#T.~~~~~~~.......,T.#..#",
    "T.......,....~~~~~~~~......,,....#",
    "T...T...,....~~~~~~~~~.T...T,....#",
    "T....T..,..#.~~~~~~~~~.#....,....#",
    "T....T..,....~~~~~~~~~....rrrr...#",
    "TT.....#,.....~~~~~~~.......,...T#",
    "#.......,.....T~~~~~........,...##",
    "#.......,.......~~~.....,,,,,...# ",
    " T......,...............,.......# ",
    " #.##c#.,......T........,#......# ",
    " T.#..#.,..............#,......T  ",
    "  T#..cT,,,,,,,,,,,,,....T....T   ",
    "   ####.T......T..T.,.....T..##   ",
    "     T....#.........,.....T##     ",
    "      #.T.....T.....,....T.#      ",
    "       # ###.........#.## #       ",
    "            T####TT## #           "
   ],
   "ents": [],
   "area": true,
   "theme": "desert",
   "music": "dunes",
   "props": [
    {
     "t": "sign",
     "x": 13,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Oasis des Roseaux. L’eau de la Cité vient d’ici. Les scorpions aussi."
    },
    {
     "t": "shelter",
     "x": 19,
     "y": 7,
     "w": 1,
     "h": 1,
     "color": "#c0584a",
     "id": "abri_oasis"
    },
    {
     "t": "pot",
     "x": 23,
     "y": 9,
     "w": 1,
     "h": 1,
     "color": "#c9783a"
    }
   ],
   "chests": [
    {
     "id": "ch_oas_coeur",
     "x": 4,
     "y": 21,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_oas_bottes",
     "x": 30,
     "y": 18,
     "item": "bottes_dunes",
     "n": 1
    },
    {
     "id": "ch_oas_ecus",
     "x": 26,
     "y": 3,
     "ecus": 90
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "fleur1",
     "item": "fleur_sable",
     "x": 5,
     "y": 8
    },
    {
     "t": "item",
     "id": "fleur2",
     "item": "fleur_sable",
     "x": 30,
     "y": 9
    },
    {
     "t": "item",
     "id": "fleur3",
     "item": "fleur_sable",
     "x": 9,
     "y": 23
    },
    {
     "t": "item",
     "id": "fleur4",
     "item": "fleur_sable",
     "x": 29,
     "y": 22
    },
    {
     "t": "item",
     "id": "collier1",
     "item": "collier_chameau",
     "x": 22,
     "y": 18
    },
    {
     "t": "item",
     "id": "jarre1",
     "item": "jarre_ancienne",
     "x": 3,
     "y": 5
    }
   ],
   "spawns": [
    {
     "type": "scarabee",
     "x": 10,
     "y": 18,
     "n": 2
    },
    {
     "type": "scarabee",
     "x": 21,
     "y": 8,
     "n": 2
    },
    {
     "type": "scorpion",
     "x": 6,
     "y": 14,
     "n": 1
    },
    {
     "type": "scorpion",
     "x": 27,
     "y": 9,
     "n": 1
    },
    {
     "type": "cactus",
     "x": 14,
     "y": 20,
     "n": 1
    }
   ],
   "entry": [
    15,
    0
   ]
  },
  {
   "id": "dunes",
   "region": "dunes",
   "title": "Les Dunes",
   "num": 0,
   "secret": false,
   "ox": 96,
   "oy": 0,
   "spawn": [
    2,
    5
   ],
   "entryGate": "ds4",
   "map": [
    "           # #  #  T  ##                ",
    "         #T #.##.##.##.T# ###T# T       ",
    "        ##,,,,,,,,,T.....#....# #       ",
    "T#T#T#T#..,....................##       ",
    "#..H...#..,..........#.........T.T  #   ",
    ",,,,,,,,,,,.........#.....T.......#     ",
    "#.......#.,............T...........#T   ",
    "T.........,.....T.T..HT............# ## ",
    "#.........,......T...#..............#   ",
    "T......TT.,.H...................T##..#  ",
    " #..T.....,..........#.....H..,,,,,,,,,,",
    "#.........,...........T.......,T......# ",
    "T.........,,,,,,,,,,,,,,,,,,,,,........#",
    "#T.....T..,....T....,.........,.......T ",
    "##........,......##.,.........,......T# ",
    "# #.T...T.,.........,.........,.......# ",
    "T#...#...#,.........,..#.H..T.,.....#.T#",
    " T....#.H.,..#......,.........,..#####.#",
    " T....#...,.........,T........,#T#...## ",
    " T##c##...,...#.##..,.........,,,....#T ",
    "#.#...#T..,.........,T..........T#...#  ",
    "T##...c,,,,..T......,.......#....#####  ",
    "  #...#............T,...........T...T#  ",
    "  #####.......#.....,...T.........#..#  ",
    "   # rTrrrrrrrrrrrrrrrrrrrrrrrrrrr T#   ",
    "    T# #.#..........,....#......##      ",
    "      # ##.......T..,.H......... T      ",
    "       #  #..#.#....H#.#.....T#T        ",
    "         #### # #...,## #..##           ",
    "           #  ## ##T,# ####             "
   ],
   "ents": [],
   "area": true,
   "theme": "desert",
   "music": "dunes",
   "props": [
    {
     "t": "sign",
     "x": 3,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "Les Dunes. Quand le vent se lève, la lumière ne porte plus : abrite-toi sous une tente, ou attends que le sable retombe. Rien ne presse."
    },
    {
     "t": "shelter",
     "x": 12,
     "y": 9,
     "w": 1,
     "h": 1,
     "color": "#c0584a",
     "id": "abri_dunes1"
    },
    {
     "t": "shelter",
     "x": 27,
     "y": 10,
     "w": 1,
     "h": 1,
     "color": "#4f8aa0",
     "id": "abri_dunes2"
    },
    {
     "t": "stele",
     "x": 21,
     "y": 7,
     "w": 1,
     "h": 1,
     "id": "stele_dunes"
    },
    {
     "t": "ruin",
     "x": 20,
     "y": 27,
     "w": 1,
     "h": 1,
     "name": "Portique du Temple enseveli"
    },
    {
     "t": "dunerock",
     "x": 25,
     "y": 16,
     "w": 1,
     "h": 1
    },
    {
     "t": "dunerock",
     "x": 8,
     "y": 17,
     "w": 1,
     "h": 1
    },
    {
     "t": "sign",
     "x": 22,
     "y": 26,
     "w": 1,
     "h": 1,
     "text": "Temple enseveli : le sable a tout recouvert, sauf la porte. Les ronces sèches ne cèdent qu’à une vraie lame."
    }
   ],
   "chests": [
    {
     "id": "ch_dun_coeur",
     "x": 4,
     "y": 21,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_dun_masse",
     "x": 35,
     "y": 19,
     "item": "masse_sable",
     "n": 1
    },
    {
     "id": "ch_dun_ecus",
     "x": 17,
     "y": 2,
     "ecus": 110
    },
    {
     "id": "ch_dun_the",
     "x": 30,
     "y": 4,
     "item": "grande_potion",
     "n": 2
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "tablette1",
     "item": "tablette_echo",
     "x": 6,
     "y": 8
    },
    {
     "t": "item",
     "id": "jarre2",
     "item": "jarre_ancienne",
     "x": 33,
     "y": 7
    },
    {
     "t": "item",
     "id": "fleur5",
     "item": "fleur_sable",
     "x": 12,
     "y": 27
    }
   ],
   "spawns": [
    {
     "type": "scarabee",
     "x": 14,
     "y": 18,
     "n": 2
    },
    {
     "type": "scarabee",
     "x": 26,
     "y": 20,
     "n": 2
    },
    {
     "type": "scorpion",
     "x": 24,
     "y": 8,
     "n": 1
    },
    {
     "type": "chacal",
     "x": 36,
     "y": 12,
     "n": 2
    },
    {
     "type": "chacal",
     "x": 16,
     "y": 22,
     "n": 1
    },
    {
     "type": "cactus",
     "x": 28,
     "y": 14,
     "n": 1
    },
    {
     "type": "cactus",
     "x": 8,
     "y": 14,
     "n": 1
    },
    {
     "type": "scorpion",
     "x": 12,
     "y": 27,
     "n": 1
    },
    {
     "type": "momie",
     "x": 36,
     "y": 20,
     "n": 1,
     "elite": true
    },
    {
     "type": "scarabee",
     "x": 31,
     "y": 26,
     "n": 2
    },
    {
     "type": "echo",
     "x": 20,
     "y": 18,
     "n": 1
    }
   ],
   "storm": true,
   "entry": [
    0,
    5
   ]
  },
  {
   "id": "temple_d",
   "region": "temple",
   "title": "Le Temple enseveli",
   "num": 0,
   "secret": false,
   "ox": 101,
   "oy": 34,
   "spawn": [
    15,
    1
   ],
   "map": [
    "###############.##############",
    "#.........#.........#........#",
    "#.........#.........#........#",
    "#..#...#..#..#.H.#..#........#",
    "#............................#",
    "#.........#.........#......#.#",
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
     "y": 8,
     "dir": "S",
     "rot": true
    },
    {
     "t": "splitter",
     "x": 25,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 23,
     "y": 5,
     "state": 1,
     "rot": true,
     "carry": true
    },
    {
     "t": "receiver",
     "x": 28,
     "y": 8,
     "color": "w",
     "gate": "td_light"
    },
    {
     "t": "receiver",
     "x": 28,
     "y": 2,
     "color": "w",
     "gate": "td_light"
    }
   ],
   "area": true,
   "theme": "temple_sable",
   "music": "temple_sable",
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
    },
    {
     "t": "stele",
     "x": 15,
     "y": 3,
     "w": 1,
     "h": 1,
     "id": "stele_temple"
    }
   ],
   "chests": [
    {
     "id": "ch_cle_td",
     "x": 5,
     "y": 16,
     "item": "cle_temple_d",
     "n": 1
    },
    {
     "id": "ch_tresor_td",
     "x": 25,
     "y": 16,
     "item": "cimeterre_dore",
     "n": 1
    },
    {
     "id": "ch_prisme_d",
     "x": 15,
     "y": 25,
     "item": "prisme_dore",
     "n": 1,
     "after": "boss_echos"
    },
    {
     "id": "ch_cache_td",
     "x": 4,
     "y": 25,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_cache2_td",
     "x": 2,
     "y": 25,
     "ecus": 220
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "tablette2",
     "item": "tablette_echo",
     "x": 3,
     "y": 17
    },
    {
     "t": "item",
     "id": "tablette3",
     "item": "tablette_echo",
     "x": 3,
     "y": 26
    },
    {
     "t": "item",
     "id": "jarre3",
     "item": "jarre_ancienne",
     "x": 27,
     "y": 14
    },
    {
     "t": "page",
     "id": "pg_temple",
     "page": "orin6",
     "x": 6,
     "y": 24
    }
   ],
   "spawns": [
    {
     "type": "scarabee",
     "x": 5,
     "y": 5,
     "n": 4,
     "room": "td_combat"
    },
    {
     "type": "echo",
     "x": 2,
     "y": 2,
     "n": 1,
     "room": "td_combat"
    },
    {
     "type": "momie",
     "x": 5,
     "y": 15,
     "n": 1
    },
    {
     "type": "scorpion",
     "x": 25,
     "y": 13,
     "n": 1
    },
    {
     "type": "gardien_echos",
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
     "key": "cle_temple_d"
    }
   ],
   "warp": {
    "id": "temple_d",
    "x": 15,
    "y": 5,
    "name": "Hall du Temple enseveli",
    "needs": "boss_echos"
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
   ],
   "socles": [
    [
     25,
     2
    ],
    [
     23,
     5
    ],
    [
     27,
     7
    ]
   ],
   "entry": [
    15,
    0
   ]
  },
  {
   "id": "ph_vest",
   "region": "phare",
   "title": "Le vestibule du Phare",
   "num": 0,
   "secret": false,
   "ox": 140,
   "oy": 5,
   "spawn": [
    2,
    5
   ],
   "entryGate": "b_phare",
   "map": [
    "####################",
    "#.............#....#",
    "#..H.......H..#....#",
    "#.H......#....#....#",
    "#...#.........#....#",
    "..............x....#",
    "#...........H.x.....",
    "#.............x....#",
    "#...#....#....#....#",
    "#.H....H......#....#",
    "#.............#....#",
    "####################"
   ],
   "ents": [],
   "area": true,
   "theme": "desert",
   "music": "phare_sable",
   "props": [
    {
     "t": "vasque",
     "x": 3,
     "y": 2,
     "w": 1,
     "h": 1,
     "id": "vasque1"
    },
    {
     "t": "vasque",
     "x": 11,
     "y": 2,
     "w": 1,
     "h": 1,
     "id": "vasque2"
    },
    {
     "t": "vasque",
     "x": 7,
     "y": 9,
     "w": 1,
     "h": 1,
     "id": "vasque3"
    },
    {
     "t": "stele",
     "x": 12,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "stele_phare"
    },
    {
     "t": "shelter",
     "x": 2,
     "y": 9,
     "w": 1,
     "h": 1,
     "color": "#d98a3a",
     "id": "abri_phare"
    },
    {
     "t": "sign",
     "x": 2,
     "y": 3,
     "w": 1,
     "h": 1,
     "text": "Trois vasques, une porte. Elles brûlent quand une petite lumière les effleure : Fia sait faire, si elle porte l’Orbe."
    }
   ],
   "chests": [
    {
     "id": "ch_phv_potion",
     "x": 17,
     "y": 9,
     "item": "grande_potion",
     "n": 2
    },
    {
     "id": "ch_phv_anneau",
     "x": 17,
     "y": 2,
     "item": "anneau_oasis",
     "n": 1
    }
   ],
   "pickups": [],
   "spawns": [
    {
     "type": "momie",
     "x": 8,
     "y": 6,
     "n": 1
    },
    {
     "type": "echo",
     "x": 11,
     "y": 8,
     "n": 1
    },
    {
     "type": "scarabee",
     "x": 6,
     "y": 3,
     "n": 2
    },
    {
     "type": "scorpion",
     "x": 12,
     "y": 4,
     "n": 1
    }
   ],
   "doors": [
    {
     "gate": "ph_vasques",
     "look": "barrier",
     "cells": [
      [
       14,
       5
      ],
      [
       14,
       6
      ],
      [
       14,
       7
      ]
     ]
    }
   ],
   "warp": {
    "id": "phare_v",
    "x": 3,
    "y": 5,
    "name": "Cristal du vestibule"
   },
   "storm": true,
   "entry": [
    0,
    5
   ]
  },
  {
   "id": "auberge_d",
   "region": "cite",
   "title": "Auberge de l’Oasis",
   "num": 0,
   "secret": false,
   "ox": 200,
   "oy": 60,
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
     "id": "nour",
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
    "to": "cite",
    "at": [
     5,
     5
    ]
   },
   "entry": [
    6,
    8
   ]
  },
  {
   "id": "phare_d",
   "region": "phare",
   "title": "Le Phare des Sables",
   "num": 5,
   "secret": false,
   "ox": 164,
   "oy": 10,
   "spawn": [
    0,
    1
   ],
   "entryGate": "ph_vasques",
   "hint": "Le phare veut le rouge, le vert et le bleu, ensemble, sur la balise. Un prisme, un miroir à poser, des lames de lumière : et patience quand le sable se lève.",
   "map": [
    "###############",
    "..............#",
    "#.............#",
    "#............##",
    "#.#....#......#",
    "#.............#",
    "#.............#",
    "#.............#",
    "#..#....#.....#",
    "#............##",
    "#.............#",
    "#.............#",
    "###############"
   ],
   "ents": [
    {
     "t": "beacon",
     "x": 11,
     "y": 6,
     "gate": "end"
    },
    {
     "t": "lantern",
     "x": 2,
     "y": 6,
     "dir": "N",
     "rot": true
    },
    {
     "t": "prism",
     "x": 3,
     "y": 3,
     "carry": true
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 4,
     "state": 1,
     "rot": true,
     "carry": true
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 10,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 11,
     "y": 10,
     "state": 1,
     "rot": true
    }
   ],
   "theme": "phare_sable",
   "music": "phare_sable",
   "warp": {
    "id": "phare_d",
    "x": 3,
    "y": 10,
    "name": "Cristal du Phare des Sables"
   },
   "respawn": true,
   "socles": [
    [
     5,
     6
    ],
    [
     3,
     3
    ],
    [
     5,
     2
    ],
    [
     8,
     4
    ],
    [
     2,
     9
    ]
   ],
   "storm": true,
   "entry": [
    0,
    1
   ]
  }
 ],
 "bridges": [
  {
   "gate": "b_sable",
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
   "gate": "ds1",
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
   "gate": "ds2",
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
   "gate": "ds3",
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
   "gate": "ds4",
   "cells": [
    [
     92,
     5
    ],
    [
     93,
     5
    ],
    [
     94,
     5
    ],
    [
     95,
     5
    ]
   ]
  },
  {
   "gate": "b_oasis",
   "cells": [
    [
     15,
     24
    ],
    [
     15,
     25
    ],
    [
     15,
     26
    ],
    [
     15,
     27
    ]
   ]
  },
  {
   "gate": "b_temple_d",
   "cells": [
    [
     116,
     30
    ],
    [
     116,
     31
    ],
    [
     116,
     32
    ],
    [
     116,
     33
    ]
   ]
  },
  {
   "gate": "b_phare",
   "cells": [
    [
     136,
     10
    ],
    [
     137,
     10
    ],
    [
     138,
     10
    ],
    [
     139,
     10
    ]
   ]
  },
  {
   "gate": "ph_vasques",
   "cells": [
    [
     160,
     11
    ],
    [
     161,
     11
    ],
    [
     162,
     11
    ],
    [
     163,
     11
    ]
   ]
  }
 ]
};
