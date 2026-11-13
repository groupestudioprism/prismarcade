/* Fichier généré par tools/build-zenith.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "zenith",
 "num": 6,
 "name": "La Citadelle du Zénith",
 "intro": "Au-dessus des nuages, la citadelle blanche et dorée attend. Sous ses remparts, la Brume monte, patiente et affamée.",
 "sky": {
  "dusk": [
   "#3a2a6a",
   "#c88ab8",
   "#ffd8a0"
  ],
  "dawn": [
   "#4aa8e8",
   "#cfe8ff",
   "#fff2d0"
  ]
 },
 "regions": {
  "porte": {
   "name": "La Porte du Zénith",
   "zones": [
    "porte",
    "auberge_z"
   ],
   "area": true
  },
  "portails": {
   "name": "Les Salles des Portails",
   "zones": [
    "jz1",
    "jz2",
    "jz3"
   ]
  },
  "jardins": {
   "name": "Les Jardins célestes",
   "zones": [
    "jardins"
   ],
   "area": true
  },
  "salle": {
   "name": "La Grande Salle",
   "zones": [
    "salle"
   ],
   "area": true
  },
  "zenith": {
   "name": "Le Zénith",
   "zones": [
    "phare_z"
   ]
  }
 },
 "pages": {
  "orin6": {
   "title": "Journal d’Orin — VI",
   "text": "J’ai fini par comprendre pourquoi le Prisme s’est brisé. Je voulais une seule lumière, la plus pure, la plus forte, et je l’ai forcée. Une lumière qu’on force se fend. Les six couleurs ne se remplacent pas : elles se complètent. Si quelqu’un lit ces lignes au Zénith, qu’il ne répare rien tout seul. Qu’il rallume les phares, un à un, et qu’il laisse la lumière passer de main en main."
  }
 },
 "stageGates": [
  "ph_d1",
  "ph_d2"
 ],
 "endTitle": "Le Phare du Zénith brille",
 "wisp": {
  "name": "Lueur dorée",
  "text": "Une Lueur d’or pâle flotte entre les colonnes."
 },
 "ending": "Les six phares brillent. Le Prisme est reforgé, et l’archipel se rassemble sous la lumière partagée.",
 "zones": [
  {
   "id": "porte",
   "region": "porte",
   "title": "La Porte du Zénith",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    12,
    7
   ],
   "map": [
    "       ###T#######TT####      ",
    "  HHHHHHH............HHHHHH   ",
    "  HHHHHHH.......T....HHHHHH   ",
    "  HHHHHHH............HHHHHH#  ",
    " ##..,....H.......H..T..,.#H# ",
    " ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "#T.......,..H..,..........H..#",
    "T........,.....,..HH...HH....T",
    "T.HHHHH..,.....,.............T",
    "#.HHHHH..,,,,.,,,..,,,,,,,,..T",
    "#.HHHHH.H....,,,,,H,.T.......T",
    "#.....H.....,,HHH,,.T........#",
    "#......H...H,,HHH,,H.....H...#",
    "#...........,,HHH,,.H.......T#",
    "#...........H,,,,,,,,,,,,....#",
    "#.....,,,,,,,.,,,....T......TT",
    "#.HHHHH......H.,.H...........#",
    "TTHHHHH........,.............#",
    "  HHHHH.T......,...T........# ",
    "  T.....T......,...HHHHHH..#  ",
    "  T##..........,...HHHHHH.T   ",
    "     #.........,H..HHHHHH.#   ",
    "    # #........,H......#T#    ",
    "      ###############T#       "
   ],
   "ents": [
    {
     "t": "start",
     "x": 12,
     "y": 7
    }
   ],
   "area": true,
   "theme": "zenith",
   "props": [
    {
     "t": "house",
     "id": "auberge_z",
     "x": 2,
     "y": 1,
     "w": 7,
     "h": 3,
     "style": "marbre",
     "door": [
      5,
      4
     ],
     "side": "S",
     "interior": "auberge_z",
     "name": "Auberge de l’Aurore",
     "sign": "lampion"
    },
    {
     "t": "house",
     "id": "tour_c",
     "x": 21,
     "y": 1,
     "w": 6,
     "h": 3,
     "style": "marbre",
     "door": [
      24,
      4
     ],
     "side": "S",
     "name": "Tour de Célestine",
     "closed": "Célestine reçoit sur la place, sous les lampions. Sa porte reste fermée."
    },
    {
     "t": "house",
     "id": "forge_z",
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
     "name": "Forge du Zénith",
     "closed": "La forge est froide depuis que Bran travaille dehors, près de l’enclume."
    },
    {
     "t": "house",
     "id": "archives_z",
     "x": 2,
     "y": 16,
     "w": 5,
     "h": 3,
     "style": "marbre",
     "door": [
      4,
      15
     ],
     "side": "N",
     "name": "Archives de la Porte",
     "closed": "Les archives sont fermées : tout ce qu’elles contenaient est en route vers la Grande Salle."
    },
    {
     "t": "house",
     "id": "serre_z",
     "x": 19,
     "y": 19,
     "w": 6,
     "h": 3,
     "style": "marbre",
     "door": [
      21,
      18
     ],
     "side": "N",
     "name": "Serre de Vesper",
     "closed": "La serre est fermée. Vesper travaille dans les Jardins, plus à l’est."
    },
    {
     "t": "fountain",
     "id": "fontaine_z",
     "x": 14,
     "y": 11,
     "w": 3,
     "h": 3,
     "warp": "porte",
     "name": "Cristal de voyage"
    },
    {
     "t": "stall",
     "id": "etal_ysolde_z",
     "x": 18,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#f0c66b",
     "name": "Ysolde, apothicaire"
    },
    {
     "t": "stall",
     "id": "etal_gaspard_z",
     "x": 23,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#e9e2f5",
     "name": "Comptoir de Gaspard"
    },
    {
     "t": "anvil",
     "id": "enclume_z",
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
     "id": "lampion_z1"
    },
    {
     "t": "lamp",
     "x": 18,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_z2"
    },
    {
     "t": "lamp",
     "x": 10,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_z3"
    },
    {
     "t": "lamp",
     "x": 26,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion_z4"
    },
    {
     "t": "lamp",
     "x": 13,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_z5"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_z6"
    },
    {
     "t": "lamp",
     "x": 16,
     "y": 21,
     "w": 1,
     "h": 1,
     "id": "lampion_z7"
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
     "t": "brazier",
     "x": 11,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 19,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "sign",
     "x": 16,
     "y": 22,
     "w": 1,
     "h": 1,
     "text": "La Porte du Zénith. Au-dessus des nuages, la Brume ronge déjà le bas des remparts : ne t’en approche pas sans lumière."
    },
    {
     "t": "sign",
     "x": 27,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "À l’est : les salles des portails, puis les Jardins célestes et la Grande Salle. Au bout de tout, le phare."
    }
   ],
   "npcs": [
    {
     "id": "celestine",
     "x": 12.6,
     "y": 9.4,
     "face": "S"
    },
    {
     "id": "selene_z",
     "x": 11.2,
     "y": 12.8,
     "face": "E"
    },
    {
     "id": "ambre_z",
     "x": 17.6,
     "y": 15.6,
     "wander": 1.6
    },
    {
     "id": "bran_z",
     "x": 9.2,
     "y": 11,
     "face": "S"
    },
    {
     "id": "silex_z",
     "x": 4.2,
     "y": 13,
     "wander": 1.4
    },
    {
     "id": "lison_z",
     "x": 22,
     "y": 11.6,
     "face": "W"
    },
    {
     "id": "mira_z",
     "x": 13,
     "y": 17.4,
     "wander": 2
    },
    {
     "id": "aldo_z",
     "x": 27,
     "y": 11,
     "face": "W"
    },
    {
     "id": "pell_z",
     "x": 21,
     "y": 16,
     "face": "N"
    },
    {
     "id": "ysolde_z",
     "x": 18.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "gaspard_z",
     "x": 23.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "calixte_z",
     "x": 4.2,
     "y": 19.4,
     "face": "E"
    }
   ],
   "chests": [
    {
     "id": "ch_porte_ecus",
     "x": 25,
     "y": 21,
     "ecus": 60
    }
   ],
   "pickups": []
  },
  {
   "id": "jz1",
   "region": "portails",
   "title": "Le premier portail",
   "num": 1,
   "secret": false,
   "ox": 36,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_portails",
   "hint": "Un portail de lumière avale le faisceau et le rend par son jumeau, de l’autre côté du mur. Lyra, elle, ne peut pas y passer.",
   "map": [
    "###########",
    "#....#....#",
    "#....#....#",
    "#....#....#",
    "#....#....#",
    "...........",
    "#..#.#..#.#",
    "#....#....#",
    "#....#.#..#",
    "#....#....#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 9,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "portal",
     "x": 4,
     "y": 3,
     "pair": "a"
    },
    {
     "t": "portal",
     "x": 6,
     "y": 3,
     "pair": "a"
    },
    {
     "t": "portal",
     "x": 4,
     "y": 7,
     "pair": "b"
    },
    {
     "t": "portal",
     "x": 8,
     "y": 8,
     "pair": "b"
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 3,
     "color": "w",
     "gate": "zg1"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 9
    }
   ],
   "theme": "jardins",
   "music": "jardins"
  },
  {
   "id": "jz2",
   "region": "portails",
   "title": "Le portail du cyan",
   "num": 2,
   "secret": false,
   "ox": 51,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "zg1",
   "hint": "Un vitrail cyan, deux miroirs, une paire de portails. La lumière blanche devient cyan en passant le verre, et garde sa couleur après le portail.",
   "map": [
    "###########",
    "#....#....#",
    "#....#..#.#",
    "#....#....#",
    "#....#.#..#",
    "...........",
    "#..#.#....#",
    "#....#....#",
    "#....#....#",
    "#....#....#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 9,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "portal",
     "x": 4,
     "y": 7,
     "pair": "a"
    },
    {
     "t": "portal",
     "x": 6,
     "y": 8,
     "pair": "a"
    },
    {
     "t": "vitrail",
     "x": 7,
     "y": 8,
     "color": "c"
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 2,
     "color": "c",
     "gate": "zg2"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 9
    }
   ],
   "theme": "jardins",
   "music": "jardins"
  },
  {
   "id": "jz3",
   "region": "portails",
   "title": "Un portail pour chaque couleur",
   "num": 3,
   "secret": false,
   "ox": 66,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "zg2",
   "hint": "Le prisme sépare la lumière en trois : le rouge à gauche, le vert tout droit, le bleu à droite. Chaque faisceau peut prendre son propre portail.",
   "map": [
    "###########",
    "#.....#...#",
    "#.....#.#.#",
    "#.....#...#",
    "#.....#...#",
    "...........",
    "#.#...#..##",
    "#.....#...#",
    "#.....#...#",
    "#.....#...#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 1,
     "y": 8,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "prism",
     "x": 3,
     "y": 3
    },
    {
     "t": "receiver",
     "x": 3,
     "y": 2,
     "color": "r",
     "gate": "zg3"
    },
    {
     "t": "portal",
     "x": 5,
     "y": 3,
     "pair": "a"
    },
    {
     "t": "portal",
     "x": 7,
     "y": 3,
     "pair": "a"
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 3,
     "color": "g",
     "gate": "zg3"
    },
    {
     "t": "portal",
     "x": 3,
     "y": 7,
     "pair": "b"
    },
    {
     "t": "portal",
     "x": 8,
     "y": 6,
     "pair": "b"
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 8,
     "color": "b",
     "gate": "zg3"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 9
    }
   ],
   "theme": "jardins",
   "music": "jardins"
  },
  {
   "id": "jardins",
   "region": "jardins",
   "title": "Les Jardins célestes",
   "num": 0,
   "secret": false,
   "ox": 82,
   "oy": 0,
   "spawn": [
    1,
    5
   ],
   "entryGate": "zg3",
   "map": [
    "       ##TT#####T####T###T##      ",
    "  ######.........T.........#      ",
    "  #...##T..T.T..............##    ",
    "  #...#....TT..T..............#   ",
    "  ##c##T....T..................#  ",
    ",,,,,,,,,...#.....#.....T.,.....# ",
    "#..#....,.TT..T...........,.....# ",
    "#.......,........T........,.....##",
    "T......T,...........T...#.,......#",
    "T.......,................T,......#",
    "#......T,,,,,,,,,,,,,,,,,,,T.....#",
    "#.T..#..,....T..,,,...#..........#",
    "#....T..,..T...,,,,,........######",
    "#....~~~,......,,,,,........r...##",
    "#....~~~,..TT..,,,,,.....T..#...##",
    "T....~~~,.....#.,,,...T.....######",
    "rTrrrrrrrrrrrrrr.,.TrrrrrrrrrTrrrr",
    "#.......,..T...T.,......~~~......#",
    "#...,,,,,.......T,T....~~~~~.....#",
    "##.............T.,......~~~.T..T# ",
    "  #.T.T......T...,T......~......#T",
    "  T.....#........,.............T  ",
    "   ##..T.#.....T#,...........##   ",
    "     #T..........,..........# #   ",
    "      T#.........,.........#      ",
    "        ##T######,###T###TTT      "
   ],
   "ents": [
    {
     "t": "shard",
     "x": 12,
     "y": 20
    },
    {
     "t": "shard",
     "x": 20,
     "y": 21
    }
   ],
   "area": true,
   "theme": "jardins",
   "props": [
    {
     "t": "sign",
     "x": 2,
     "y": 6,
     "w": 1,
     "h": 1,
     "text": "Jardins célestes. Les fleurs d’ici ne poussent que dans la lumière. Au sud, par le grand escalier : la Grande Salle."
    },
    {
     "t": "ruin",
     "x": 17,
     "y": 24,
     "w": 1,
     "h": 1,
     "name": "Portique de la Grande Salle"
    },
    {
     "t": "crystal",
     "x": 15,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 19,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 16,
     "y": 9,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 18,
     "y": 9,
     "w": 1,
     "h": 1
    },
    {
     "t": "bench",
     "x": 7,
     "y": 6,
     "w": 1,
     "h": 1
    },
    {
     "t": "bench",
     "x": 27,
     "y": 6,
     "w": 1,
     "h": 1
    }
   ],
   "npcs": [
    {
     "id": "vesper",
     "x": 12.5,
     "y": 8.6,
     "wander": 1.8
    }
   ],
   "chests": [
    {
     "id": "ch_jar_coeur",
     "x": 3,
     "y": 2,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_jar_bague",
     "x": 30,
     "y": 13,
     "item": "anneau_zenith",
     "n": 1
    },
    {
     "id": "ch_jar_ecus",
     "x": 10,
     "y": 3,
     "ecus": 120
    },
    {
     "id": "ch_jar_nectar",
     "x": 4,
     "y": 18,
     "item": "nectar",
     "n": 2
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "fleur1",
     "item": "fleur_ciel",
     "x": 12,
     "y": 7
    },
    {
     "t": "item",
     "id": "fleur2",
     "item": "fleur_ciel",
     "x": 22,
     "y": 7
    },
    {
     "t": "item",
     "id": "fleur3",
     "item": "fleur_ciel",
     "x": 6,
     "y": 22
    },
    {
     "t": "item",
     "id": "fleur4",
     "item": "fleur_ciel",
     "x": 28,
     "y": 22
    },
    {
     "t": "page",
     "id": "pg_jardin",
     "page": "orin6",
     "x": 31,
     "y": 14
    }
   ],
   "spawns": [
    {
     "type": "ombre_or",
     "x": 12,
     "y": 12,
     "n": 2
    },
    {
     "type": "ombre_or",
     "x": 22,
     "y": 7,
     "n": 2
    },
    {
     "type": "lanterne_noire",
     "x": 29,
     "y": 8,
     "n": 1
    },
    {
     "type": "belier_ivoire",
     "x": 21,
     "y": 13,
     "n": 1
    },
    {
     "type": "ombre_or",
     "x": 6,
     "y": 22,
     "n": 2
    },
    {
     "type": "lanterne_noire",
     "x": 25,
     "y": 3,
     "n": 1
    },
    {
     "type": "belier_ivoire",
     "x": 13,
     "y": 13,
     "n": 1
    },
    {
     "type": "ombre_or",
     "x": 28,
     "y": 22,
     "n": 2
    },
    {
     "type": "statue_ivoire",
     "x": 17,
     "y": 22,
     "n": 1,
     "elite": true
    },
    {
     "type": "lanterne_noire",
     "x": 9,
     "y": 23,
     "n": 1
    }
   ]
  },
  {
   "id": "salle",
   "region": "salle",
   "title": "La Grande Salle",
   "num": 0,
   "secret": false,
   "ox": 84,
   "oy": 36,
   "spawn": [
    15,
    1
   ],
   "entryGate": "b_salle",
   "map": [
    "###############.##############",
    "#.........#.........#...#....#",
    "#.........#.........#...#....#",
    "#..#...#..#..#...#..#...#....#",
    "#.......................#....#",
    "#.........#.........#...#....#",
    "#.........#.........#...#....#",
    "#..#...#..#.........#...#....#",
    "#.........#####x#####...#....#",
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
    "#.......#######.##############",
    "###############.##############"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 22,
     "y": 8,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 22,
     "y": 5,
     "state": 1,
     "rot": true
    },
    {
     "t": "portal",
     "x": 23,
     "y": 5,
     "pair": "a"
    },
    {
     "t": "portal",
     "x": 25,
     "y": 5,
     "pair": "a"
    },
    {
     "t": "vitrail",
     "x": 26,
     "y": 5,
     "color": "y"
    },
    {
     "t": "receiver",
     "x": 27,
     "y": 5,
     "color": "y",
     "gate": "gs_light"
    },
    {
     "t": "shard",
     "x": 5,
     "y": 25
    }
   ],
   "area": true,
   "theme": "salle",
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
     "t": "sign",
     "x": 14,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "La Grande Salle. À gauche, la salle des ombres ; à droite, la salle des portails. Il faut la clé pour entrer dans l’arène."
    }
   ],
   "chests": [
    {
     "id": "ch_cle_s",
     "x": 5,
     "y": 16,
     "item": "cle_salle",
     "n": 1
    },
    {
     "id": "ch_tresor_s",
     "x": 25,
     "y": 16,
     "item": "arc_aurore",
     "n": 1
    },
    {
     "id": "ch_prisme_z",
     "x": 15,
     "y": 25,
     "item": "eclat_zenith",
     "n": 1,
     "after": "boss_zenith"
    },
    {
     "id": "ch_cache_s",
     "x": 4,
     "y": 25,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_cache2_s",
     "x": 2,
     "y": 25,
     "ecus": 250
    },
    {
     "id": "ch_hall_s",
     "x": 12,
     "y": 5,
     "item": "ambroisie",
     "n": 1
    }
   ],
   "spawns": [
    {
     "type": "ombre_or",
     "x": 5,
     "y": 5,
     "n": 4,
     "room": "gs_combat"
    },
    {
     "type": "lanterne_noire",
     "x": 2,
     "y": 2,
     "n": 1,
     "room": "gs_combat"
    },
    {
     "type": "lanterne_noire",
     "x": 8,
     "y": 8,
     "n": 1,
     "room": "gs_combat"
    },
    {
     "type": "statue_ivoire",
     "x": 5,
     "y": 15,
     "n": 1
    },
    {
     "type": "belier_ivoire",
     "x": 25,
     "y": 13,
     "n": 1
    },
    {
     "type": "ombre_prisme",
     "x": 15,
     "y": 19,
     "n": 1,
     "boss": true
    }
   ],
   "doors": [
    {
     "gate": "gs_combat",
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
     "gate": "gs_light",
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
     "gate": "gs_key",
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
     "key": "cle_salle"
    }
   ],
   "warp": {
    "id": "salle",
    "x": 15,
    "y": 5,
    "name": "Hall de la Grande Salle",
    "needs": "salle_vue"
   },
   "combatRooms": [
    {
     "gate": "gs_combat",
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
   "id": "phare_z",
   "region": "zenith",
   "title": "Le Phare du Zénith",
   "num": 6,
   "secret": false,
   "ox": 98,
   "oy": 70,
   "spawn": [
    1,
    1
   ],
   "entryGate": "b_zenith",
   "hint": "Six faisceaux, six couleurs. Les trois portails de la première salle mènent au dernier salon ; la lumière de la deuxième salle doit, elle, traverser la porte.",
   "map": [
    "#.#####################",
    "#......#......#.......#",
    "#......#......x.......#",
    "#......#......#.......#",
    "#......#......#.......#",
    "#......#......#.......#",
    "#......x......x.......#",
    "#......#......#.......#",
    "#......#......#.......#",
    "#......#......#.......#",
    "#......#......x.......#",
    "#......#......#.......#",
    "#######################"
   ],
   "ents": [
    {
     "t": "beacon",
     "x": 17,
     "y": 4,
     "gate": "end",
     "need": [
      "r",
      "g",
      "b"
     ]
    },
    {
     "t": "beacon",
     "x": 20,
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
     "x": 3,
     "y": 9,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 5,
     "y": 6,
     "color": "w",
     "gate": "ph_d1"
    },
    {
     "t": "prism",
     "x": 2,
     "y": 6
    },
    {
     "t": "portal",
     "x": 2,
     "y": 10,
     "pair": "r"
    },
    {
     "t": "portal",
     "x": 1,
     "y": 6,
     "pair": "g"
    },
    {
     "t": "portal",
     "x": 2,
     "y": 1,
     "pair": "b"
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 2,
     "color": "w",
     "gate": "ph_d2"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 4,
     "dir": "W",
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
     "t": "vitrail",
     "x": 11,
     "y": 2,
     "color": "y"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 6,
     "dir": "W",
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 11,
     "y": 6,
     "color": "m"
    },
    {
     "t": "lantern",
     "x": 9,
     "y": 8,
     "dir": "W",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 10,
     "state": 0,
     "rot": true
    },
    {
     "t": "vitrail",
     "x": 11,
     "y": 10,
     "color": "c"
    },
    {
     "t": "portal",
     "x": 17,
     "y": 1,
     "pair": "r"
    },
    {
     "t": "portal",
     "x": 19,
     "y": 4,
     "pair": "g"
    },
    {
     "t": "portal",
     "x": 17,
     "y": 8,
     "pair": "b"
    },
    {
     "t": "mirror",
     "x": 20,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 20,
     "y": 10,
     "state": 1,
     "rot": true
    }
   ],
   "theme": "phare_zenith",
   "music": "zenith",
   "props": [
    {
     "t": "sign",
     "x": 2,
     "y": 11,
     "w": 1,
     "h": 1,
     "text": "Ici bat le cœur de la citadelle. Six lumières, six phares : l’archipel attend qu’on les allume ensemble."
    }
   ],
   "doors": [
    {
     "gate": "ph_d1",
     "look": "barrier",
     "cells": [
      [
       7,
       6
      ]
     ]
    },
    {
     "gate": "ph_d2",
     "look": "barrier",
     "cells": [
      [
       14,
       2
      ],
      [
       14,
       6
      ],
      [
       14,
       10
      ]
     ]
    }
   ],
   "warp": {
    "id": "phare",
    "x": 3,
    "y": 10,
    "name": "Cristal du Phare du Zénith"
   },
   "stages": [
    "ph_d1",
    "ph_d2"
   ],
   "final": "end",
   "respawn": true
  },
  {
   "id": "auberge_z",
   "region": "porte",
   "title": "Auberge de l’Aurore",
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
     "id": "oriel",
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
    "to": "porte",
    "at": [
     5,
     5
    ]
   }
  }
 ],
 "bridges": [
  {
   "gate": "b_portails",
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
   "gate": "zg1",
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
   "gate": "zg2",
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
   "gate": "zg3",
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
    ],
    [
     81,
     5
    ]
   ]
  },
  {
   "gate": "b_salle",
   "cells": [
    [
     99,
     26
    ],
    [
     99,
     27
    ],
    [
     99,
     28
    ],
    [
     99,
     29
    ],
    [
     99,
     30
    ],
    [
     99,
     31
    ],
    [
     99,
     32
    ],
    [
     99,
     33
    ],
    [
     99,
     34
    ],
    [
     99,
     35
    ]
   ]
  },
  {
   "gate": "b_zenith",
   "cells": [
    [
     99,
     65
    ],
    [
     99,
     66
    ],
    [
     99,
     67
    ],
    [
     99,
     68
    ],
    [
     99,
     69
    ]
   ]
  }
 ]
};
