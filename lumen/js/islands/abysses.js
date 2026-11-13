/* Fichier généré par tools/build-abysses.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "abysses",
 "num": 4,
 "name": "Les Abysses Miroirs",
 "intro": "Sous l’île, un lac souterrain dort depuis des siècles. Ses eaux turquoise ne renvoient plus la lumière : le phare des Abysses est éteint.",
 "sky": {
  "dusk": [
   "#06222e",
   "#0e5a66",
   "#3fd6c4"
  ],
  "dawn": [
   "#0a4a5c",
   "#2fb8b4",
   "#c8fff0"
  ]
 },
 "regions": {
  "greve": {
   "name": "La Grève",
   "zones": [
    "greve",
    "auberge_a"
   ],
   "area": true
  },
  "recifs": {
   "name": "Les Récifs",
   "zones": [
    "recifs"
   ],
   "area": true
  },
  "lac": {
   "name": "Le Lac souterrain",
   "zones": [
    "lac1",
    "lac2",
    "lac3"
   ]
  },
  "grottes": {
   "name": "Les Grottes Miroirs",
   "zones": [
    "grottes"
   ],
   "area": true
  },
  "phare": {
   "name": "Le Phare des Abysses",
   "zones": [
    "phare_a"
   ]
  },
  "ilots": {
   "name": "Les Îlots du Reflet",
   "zones": [
    "ilots"
   ],
   "area": true
  }
 },
 "pages": {
  "orin8": {
   "title": "Journal d’Orin — VIII",
   "text": "Sous la mer, la lumière ne va plus tout droit. Elle rebondit sur l’eau comme un enfant sur un toit. J’ai appris à la suivre : une eau haute la renvoie, une eau basse la laisse passer. Et je me suis souvenu de Fia, qui tenait une lampe pour deux. On croit guider la lumière ; c’est elle qui nous guide."
  }
 },
 "stageGates": [
  "la1",
  "ph_d1",
  "ph_d2"
 ],
 "endTitle": "Le Phare des Abysses brille",
 "wisp": {
  "name": "Lueur marine",
  "text": "Une Lueur turquoise ondule entre les coraux."
 },
 "ending": "Le Phare des Abysses brille. Un fragment bleu du Grand Prisme flotte au-dessus de la flamme.",
 "zones": [
  {
   "id": "greve",
   "region": "greve",
   "title": "La Grève",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    12,
    7
   ],
   "map": [
    "       ##TT#######TT####      ",
    "   HHHHHHH...........HHHHHH   ",
    "   HHHHHHH......T....HHHHHH   ",
    "   HHHHHHH........T..HHHHHHH  ",
    " ##...,.H........H...T..,.# # ",
    " ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "#T...,....,.H..,...,....,..HH#",
    "T....,....HH...,...HH...,....T",
    "T.HHHHHH.......,......HHHHH..T",
    "T.HHHHHH......,,,.....HHHHH..T",
    "#.HHHHHH.....,,,,,...THHHHH..T",
    "#...........,,HHH,,.T........#",
    "#........H..,,HHH,,.T.....T..#",
    "#...,,,,H,,,,,HHH,,........TT#",
    "#...,........,,,,,,H,,,,T....#",
    "#...,.......H.,,,....T......TT",
    "#.HHHHH......H.,.H...TH..~~~.#",
    "TTHHHHH........,.....H..~~~~.#",
    "  HHHHH~~~.....,,,,,,,~~~~~~# ",
    "  T...~~~~~T...,......~~~~~#  ",
    "  TT#.~~~~~....,.....~~~~~~   ",
    "     #~~~~~....,H.....~~~~~   ",
    "    # #~~~.....,H.....~~~~    ",
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
   "theme": "greve",
   "props": [
    {
     "t": "house",
     "id": "auberge_a",
     "x": 3,
     "y": 1,
     "w": 7,
     "h": 3,
     "style": "auberge",
     "door": [
      6,
      4
     ],
     "side": "S",
     "interior": "auberge_a",
     "name": "Auberge du Coquillage",
     "sign": "lampion"
    },
    {
     "t": "house",
     "id": "forge_a",
     "x": 21,
     "y": 1,
     "w": 6,
     "h": 3,
     "style": "forge",
     "door": [
      24,
      4
     ],
     "side": "S",
     "name": "Forge de Varech"
    },
    {
     "t": "house",
     "id": "maree_h",
     "x": 2,
     "y": 8,
     "w": 6,
     "h": 3,
     "style": "phare",
     "door": [
      5,
      7
     ],
     "side": "N",
     "name": "Maison de Marée",
     "closed": "Marée reçoit sur la place, près du cristal. Sa porte est fermée."
    },
    {
     "t": "house",
     "id": "isoard_h",
     "x": 22,
     "y": 8,
     "w": 5,
     "h": 3,
     "style": "pierre",
     "door": [
      24,
      7
     ],
     "side": "N",
     "name": "Maison d’Isoard",
     "closed": "Des cartes sèchent derrière la vitre. La porte est fermée à clé."
    },
    {
     "t": "house",
     "id": "ecume_h",
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
     "name": "Maison d’Écume",
     "closed": "Une odeur de poisson fumé s’échappe de la cheminée. La porte est fermée."
    },
    {
     "t": "fountain",
     "id": "fontaine_a",
     "x": 14,
     "y": 11,
     "w": 3,
     "h": 3,
     "warp": "greve",
     "name": "Cristal de voyage"
    },
    {
     "t": "stall",
     "id": "etal_corail",
     "x": 10,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#ff8f7a",
     "name": "Corail, apothicaire"
    },
    {
     "t": "stall",
     "id": "etal_nacre",
     "x": 19,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#8fd8e8",
     "name": "Nacre, marchande"
    },
    {
     "t": "anvil",
     "id": "enclume_a",
     "x": 27,
     "y": 3,
     "w": 1,
     "h": 1
    },
    {
     "t": "lamp",
     "x": 12,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion_a1"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_a2"
    },
    {
     "t": "lamp",
     "x": 8,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion_a3"
    },
    {
     "t": "lamp",
     "x": 27,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion_a4"
    },
    {
     "t": "lamp",
     "x": 13,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_a5"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion_a6"
    },
    {
     "t": "lamp",
     "x": 16,
     "y": 21,
     "w": 1,
     "h": 1,
     "id": "lampion_a7"
    },
    {
     "t": "crate",
     "x": 21,
     "y": 17,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 22,
     "y": 16,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 9,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "crate",
     "x": 8,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "bench",
     "x": 19,
     "y": 14,
     "w": 1,
     "h": 1
    },
    {
     "t": "bench",
     "x": 12,
     "y": 15,
     "w": 1,
     "h": 1
    },
    {
     "t": "sign",
     "x": 16,
     "y": 22,
     "w": 1,
     "h": 1,
     "text": "Au sud : les Récifs, puis plus loin les Îlots du Reflet. Les crabes-lanternes ne plaisantent pas."
    },
    {
     "t": "sign",
     "x": 28,
     "y": 6,
     "w": 1,
     "h": 1,
     "text": "À l’est : le lac souterrain. Là-bas, l’eau renvoie la lumière dans le sens des flèches gravées."
    }
   ],
   "npcs": [
    {
     "id": "maree",
     "x": 12.4,
     "y": 9.4,
     "face": "S"
    },
    {
     "id": "corail",
     "x": 10.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "nacre",
     "x": 19.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "varech",
     "x": 27.5,
     "y": 4.6,
     "face": "W"
    },
    {
     "id": "isoard",
     "x": 25.4,
     "y": 6.4,
     "face": "S"
    },
    {
     "id": "ecume",
     "x": 11.4,
     "y": 19.4,
     "wander": 1.4
    },
    {
     "id": "petoncle",
     "x": 12.2,
     "y": 16.6,
     "wander": 2.4
    },
    {
     "id": "murene",
     "x": 18.6,
     "y": 14.9,
     "face": "E"
    },
    {
     "id": "lagon",
     "x": 21.6,
     "y": 18.6,
     "face": "E"
    }
   ],
   "pickups": []
  },
  {
   "id": "auberge_a",
   "region": "greve",
   "title": "Auberge du Coquillage",
   "num": 0,
   "secret": false,
   "ox": 60,
   "oy": 40,
   "spawn": [
    6,
    7
   ],
   "map": [
    "#############",
    "#.HH..HHH.HH#",
    "#.........HH#",
    "#H.....HHHH.#",
    "#H..........#",
    "#..H........#",
    "#.......H...#",
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
     "x": 7,
     "y": 3,
     "w": 4,
     "h": 1
    },
    {
     "t": "fireplace",
     "x": 2,
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
     "name": "Lit du Coquillage"
    },
    {
     "t": "table",
     "x": 3,
     "y": 5,
     "w": 1,
     "h": 1
    },
    {
     "t": "table",
     "x": 8,
     "y": 6,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 1,
     "y": 3,
     "w": 1,
     "h": 1
    },
    {
     "t": "barrel",
     "x": 1,
     "y": 4,
     "w": 1,
     "h": 1
    },
    {
     "t": "shelf",
     "x": 6,
     "y": 1,
     "w": 3,
     "h": 1
    }
   ],
   "npcs": [
    {
     "id": "sargasse",
     "x": 8.5,
     "y": 2.2,
     "face": "S",
     "counter": true
    }
   ],
   "exit": {
    "cell": [
     6,
     8
    ],
    "to": "greve",
    "at": [
     6,
     5
    ]
   }
  },
  {
   "id": "recifs",
   "region": "recifs",
   "title": "Les Récifs",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 30,
   "spawn": [
    15,
    1
   ],
   "entryGate": "b_recifs",
   "map": [
    "            T  ,T#T   #             ",
    "         T T ##,...##T # T T        ",
    "      ##T.#.#.T,....T.#.#.#T        ",
    "    T#.........,.....#...#..##      ",
    "    T..T..,,,,,,.T...........#      ",
    "   T.T....,................~..# T   ",
    " ##..,,,,,,.......T#......~~~..#    ",
    " #T..,....,.TT...........~~~~~T.#T  ",
    "   #.,...#,#...T.....T....~~~...#   ",
    "  T#.,#...,,,,,,,..#c##....~...#    ",
    "    #,..........,.##..#........##   ",
    "    #T#..T......,..#..#..T...T#     ",
    "      ##T.....#.,.#####..#..#       ",
    "         T......,........T.#        ",
    "         T#T.#..,.......# #         ",
    "            #..#,.......T           ",
    "        .###....,........###TT      ",
    "     #TT........,.......T..T..T#    ",
    "    T####.T.....,,,,,,,...#....T    ",
    "   #.#..#.............,.........##  ",
    "  T..#..c..T.....T.T..,....T#..## T ",
    "   #.####.............,..........#T ",
    "   #..~~~........,,,,,,#........# T ",
    " #  #~~~~~.......,..T.#....~~~..T#  ",
    "    TT~~~.....#..,....#....~~~.T.## ",
    "      #~......##.,.........~~~.##   ",
    "     TT..T.......,#.........# ..    ",
    "       TT##......,.....T#T#.T##     ",
    "           T#.TT.,#T#..T # T        ",
    "             #T T,   T##            "
   ],
   "ents": [],
   "area": true,
   "theme": "recifs",
   "props": [
    {
     "t": "ruin",
     "x": 17,
     "y": 27,
     "w": 1,
     "h": 1,
     "name": "Arche des Îlots"
    },
    {
     "t": "sign",
     "x": 13,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Les Récifs. Les crabes-lanternes se plaisent entre les coraux ; les anguilles d’ombre, dans les flaques. Les roches fissurées cachent parfois des trésors."
    },
    {
     "t": "sign",
     "x": 18,
     "y": 27,
     "w": 1,
     "h": 1,
     "text": "Les Îlots du Reflet, au sud : seul celui qui sait planer peut en franchir les vides."
    }
   ],
   "chests": [
    {
     "id": "ch_rec_coeur",
     "x": 20,
     "y": 10,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_rec_anneau",
     "x": 6,
     "y": 19,
     "item": "anneau_reflet",
     "n": 1
    },
    {
     "id": "ch_rec_ecus",
     "x": 26,
     "y": 3,
     "ecus": 90
    },
    {
     "id": "ch_rec_potion",
     "x": 11,
     "y": 26,
     "item": "grande_potion",
     "n": 2
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "coq1",
     "item": "coquille_nacre",
     "x": 4,
     "y": 8
    },
    {
     "t": "item",
     "id": "coq2",
     "item": "coquille_nacre",
     "x": 28,
     "y": 11
    },
    {
     "t": "item",
     "id": "coq3",
     "item": "coquille_nacre",
     "x": 9,
     "y": 25
    },
    {
     "t": "item",
     "id": "coq4",
     "item": "coquille_nacre",
     "x": 31,
     "y": 26
    },
    {
     "t": "item",
     "id": "filet1",
     "item": "maille_filet",
     "x": 9,
     "y": 6
    },
    {
     "t": "item",
     "id": "filet2",
     "item": "maille_filet",
     "x": 24,
     "y": 11
    },
    {
     "t": "item",
     "id": "filet3",
     "item": "maille_filet",
     "x": 13,
     "y": 24
    },
    {
     "t": "item",
     "id": "perle_m",
     "item": "perle_murene",
     "x": 29,
     "y": 22
    },
    {
     "t": "item",
     "id": "corail1",
     "item": "corail_rouge",
     "x": 21,
     "y": 24
    },
    {
     "t": "item",
     "id": "corail2",
     "item": "corail_rouge",
     "x": 8,
     "y": 16
    },
    {
     "t": "item",
     "id": "corail3",
     "item": "corail_rouge",
     "x": 13,
     "y": 13
    }
   ],
   "spawns": [
    {
     "type": "crabe_lanterne",
     "x": 9,
     "y": 6,
     "n": 2
    },
    {
     "type": "meduse_reflet",
     "x": 20,
     "y": 5,
     "n": 1
    },
    {
     "type": "anguille_ombre",
     "x": 24,
     "y": 11,
     "n": 2
    },
    {
     "type": "crabe_lanterne",
     "x": 12,
     "y": 18,
     "n": 1
    },
    {
     "type": "meduse_reflet",
     "x": 8,
     "y": 16,
     "n": 1
    },
    {
     "type": "anguille_ombre",
     "x": 21,
     "y": 24,
     "n": 2
    },
    {
     "type": "crabe_lanterne",
     "x": 18,
     "y": 25,
     "n": 1
    },
    {
     "type": "sentinelle_corail",
     "x": 29,
     "y": 22,
     "n": 1,
     "elite": true
    }
   ]
  },
  {
   "id": "ilots",
   "region": "ilots",
   "title": "Les Îlots du Reflet",
   "num": 0,
   "secret": false,
   "ox": 3,
   "oy": 66,
   "spawn": [
    14,
    2
   ],
   "entryGate": "b_ilots",
   "hint": "Tiens-toi sur une corniche, tourné vers l’autre île, et appuie sur E : Lyra plane de l’autre côté du vide.",
   "map": [
    "      ########.###                          ",
    "      #..........#    ############          ",
    "      #.T......T.#    #..........#          ",
    "      #..........#    #..T.....T.#    ######",
    "      #..........#    #..........#    #..T.#",
    "      #..........      ..........      ....#",
    "      #..........#    #..........#    #....#",
    "      #..........#    #..........#    #....#",
    "      #.T......T.#    #..........#    #..T.#",
    "      #..........#    #..T.....T.#    ######",
    "      ############    #..........#          ",
    "                      ############          ",
    "                                            ",
    "                                            "
   ],
   "ents": [
    {
     "t": "ledge",
     "x": 16,
     "y": 5,
     "id": "ledge_a1",
     "dir": "E"
    },
    {
     "t": "ledge",
     "x": 23,
     "y": 5,
     "id": "ledge_a2",
     "dir": "W"
    },
    {
     "t": "ledge",
     "x": 32,
     "y": 5,
     "id": "ledge_b1",
     "dir": "E"
    },
    {
     "t": "ledge",
     "x": 39,
     "y": 5,
     "id": "ledge_b2",
     "dir": "W"
    }
   ],
   "area": true,
   "theme": "greve",
   "props": [
    {
     "t": "sign",
     "x": 13,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "Les Îlots du Reflet. Les corniches de pierre se répondent d’un îlot à l’autre : plane de l’une à l’autre, d’un bord à l’autre du vide."
    },
    {
     "t": "crystal",
     "x": 9,
     "y": 5,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 29,
     "y": 9,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_ilot_coeur",
     "x": 30,
     "y": 9,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_ilot_amulette",
     "x": 42,
     "y": 6,
     "item": "amulette_reflet",
     "n": 1
    },
    {
     "id": "ch_ilot_ecus",
     "x": 9,
     "y": 9,
     "ecus": 250
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "etoile1",
     "item": "etoile_mer",
     "x": 9,
     "y": 3
    },
    {
     "t": "item",
     "id": "etoile2",
     "item": "etoile_mer",
     "x": 27,
     "y": 9
    },
    {
     "t": "item",
     "id": "etoile3",
     "item": "etoile_mer",
     "x": 41,
     "y": 6
    },
    {
     "t": "page",
     "id": "pg_ilot",
     "page": "orin8",
     "x": 42,
     "y": 4
    }
   ],
   "spawns": [
    {
     "type": "meduse_reflet",
     "x": 11,
     "y": 7,
     "n": 2
    },
    {
     "type": "anguille_ombre",
     "x": 28,
     "y": 6,
     "n": 2
    }
   ],
   "warp": {
    "id": "ilots",
    "x": 9,
    "y": 5,
    "name": "Cristal des Îlots"
   },
   "respawn": true
  },
  {
   "id": "lac1",
   "region": "lac",
   "title": "Le Miroir d’entrée",
   "num": 1,
   "secret": false,
   "ox": 36,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "b_lac",
   "hint": "L’eau du lac renvoie la lumière dans le sens de la flèche gravée sur son bord. Tourne la lanterne et le miroir : le rayon doit descendre jusqu’au cristal.",
   "map": [
    "###########",
    "#.........#",
    "#.......#.#",
    "#.......#.#",
    "#.........#",
    "...........",
    "#.........#",
    "#..##.....#",
    "#.........#",
    "#.#.......#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "id": "l1_lan",
     "x": 2,
     "y": 3,
     "dir": "S",
     "rot": true
    },
    {
     "t": "pool",
     "id": "l1_p",
     "x": 6,
     "y": 3,
     "o": "S"
    },
    {
     "t": "mirror",
     "id": "l1_mi",
     "x": 6,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "id": "l1_rc",
     "x": 9,
     "y": 8,
     "color": "w",
     "gate": "la1"
    },
    {
     "t": "shard",
     "id": "sh_lac1",
     "x": 1,
     "y": 9
    }
   ],
   "theme": "lac",
   "music": "lac",
   "puzzle": {
    "rect": [
     0,
     0,
     11,
     11
    ],
    "entry": [
     1,
     5
    ],
    "final": "la1",
    "label": "Le Miroir d’entrée"
   }
  },
  {
   "id": "lac2",
   "region": "lac",
   "title": "La Vanne du lac",
   "num": 2,
   "secret": false,
   "ox": 51,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "la1",
   "hint": "Cette vanne règle le niveau du lac. Quand l’eau monte, elle renvoie le rayon vers le nord ; quand elle descend, la lumière passe.",
   "map": [
    "###########",
    "#.........#",
    "#..#......#",
    "#.........#",
    "#.........#",
    "...........",
    "#.........#",
    "#.#.......#",
    "#.........#",
    "#.......#.#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "id": "l2_lan",
     "x": 8,
     "y": 8,
     "dir": "N",
     "rot": true
    },
    {
     "t": "pool",
     "id": "l2_p2",
     "x": 5,
     "y": 2,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p3",
     "x": 5,
     "y": 3,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p4",
     "x": 5,
     "y": 4,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p5",
     "x": 5,
     "y": 5,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p6",
     "x": 5,
     "y": 6,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p7",
     "x": 5,
     "y": 7,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p8",
     "x": 5,
     "y": 8,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "pool",
     "id": "l2_p9",
     "x": 5,
     "y": 9,
     "o": "N",
     "valve": "vn_lac2"
    },
    {
     "t": "valve",
     "id": "vn_lac2",
     "x": 8,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "id": "l2_rc",
     "x": 5,
     "y": 1,
     "color": "w",
     "gate": "la2"
    },
    {
     "t": "shard",
     "id": "sh_lac2",
     "x": 1,
     "y": 9
    }
   ],
   "theme": "lac",
   "music": "lac",
   "puzzle": {
    "rect": [
     0,
     0,
     11,
     11
    ],
    "entry": [
     1,
     5
    ],
    "final": "la2",
    "label": "La Vanne du lac"
   }
  },
  {
   "id": "lac3",
   "region": "lac",
   "title": "L’orbe de Fia",
   "num": 3,
   "secret": false,
   "ox": 66,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "la2",
   "hint": "Pose l’orbe de Fia sur un socle (touche E), puis tourne-la : c’est elle, ici, qui éclaire. Aucune lanterne dans cette salle.",
   "map": [
    "###########",
    "#.........#",
    "#..#......#",
    "#.........#",
    "#.........#",
    "...........",
    "#.........#",
    "#.........#",
    "#......#..#",
    "#.........#",
    "###########"
   ],
   "ents": [
    {
     "t": "receiver",
     "id": "l3_rc",
     "x": 8,
     "y": 2,
     "color": "w",
     "gate": "la3"
    },
    {
     "t": "socle",
     "id": "l3_s1",
     "x": 9,
     "y": 4,
     "rot": true
    },
    {
     "t": "socle",
     "id": "l3_s2",
     "x": 7,
     "y": 9,
     "rot": true
    },
    {
     "t": "socle",
     "id": "l3_s3",
     "x": 5,
     "y": 6,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "l3_m1",
     "x": 8,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "l3_m2",
     "x": 2,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "id": "sh_lac3",
     "x": 1,
     "y": 9
    }
   ],
   "theme": "lac",
   "music": "lac",
   "puzzle": {
    "rect": [
     0,
     0,
     11,
     11
    ],
    "entry": [
     1,
     5
    ],
    "final": "la3",
    "label": "L’orbe de Fia"
   }
  },
  {
   "id": "grottes",
   "region": "grottes",
   "title": "Les Grottes Miroirs",
   "num": 0,
   "secret": false,
   "ox": 81,
   "oy": 0,
   "spawn": [
    1,
    5
   ],
   "entryGate": "la3",
   "map": [
    "##################################",
    "##########...........##..........#",
    "##########...........##..........#",
    "##########..#.....#..##..#....#..#",
    "##########...........##..........#",
    ".................................#",
    "####c#####...........##..........#",
    "####c#####..#.....#..##..#....#..#",
    "#........#...........##..........#",
    "#........#...........##..........#",
    "#........######x###########x######",
    "#........######x###########x######",
    "#........######x#######..........#",
    "#........######.#######..........#",
    "##########...........##..........#",
    "##########...#.......##...#......#",
    "##########..#........##..........#",
    "##########...........##......#...#",
    "##########...........##..........#",
    "##########...........##..........#",
    "##########...........#############",
    "##########.#.......#.#############",
    "##########...........#############",
    "###############.##################",
    "###############x##################",
    "###############x##################",
    "############.....................#",
    "############.....................#",
    "############....#.....#.....#....#",
    "############.....................x",
    "############.....................#",
    "############....#.....#.....#....#",
    "############.....................#",
    "##################################"
   ],
   "ents": [
    {
     "t": "socle",
     "id": "sm1",
     "x": 18,
     "y": 21,
     "rot": true
    },
    {
     "t": "socle",
     "id": "sm2",
     "x": 11,
     "y": 18,
     "rot": true
    },
    {
     "t": "socle",
     "id": "sm3",
     "x": 17,
     "y": 15,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "mm1",
     "x": 18,
     "y": 18,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "mm2",
     "x": 14,
     "y": 18,
     "state": 0,
     "rot": true
    },
    {
     "t": "pool",
     "id": "pm1",
     "x": 18,
     "y": 19,
     "o": "W",
     "valve": "vm1"
    },
    {
     "t": "pool",
     "id": "pm2",
     "x": 16,
     "y": 18,
     "o": "N",
     "valve": "vm2"
    },
    {
     "t": "valve",
     "id": "vm1",
     "x": 20,
     "y": 21,
     "state": 1,
     "rot": true
    },
    {
     "t": "valve",
     "id": "vm2",
     "x": 10,
     "y": 22,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "id": "rm",
     "x": 20,
     "y": 18,
     "color": "w",
     "gate": "gr_eau"
    },
    {
     "t": "shard",
     "id": "sh_marees",
     "x": 20,
     "y": 14
    },
    {
     "t": "shard",
     "id": "sh_grotte1",
     "x": 3,
     "y": 12
    },
    {
     "t": "shard",
     "id": "sh_grotte2",
     "x": 30,
     "y": 18
    }
   ],
   "area": true,
   "theme": "grotte",
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
     "x": 24,
     "y": 1,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 31,
     "y": 1,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 13,
     "y": 26,
     "w": 1,
     "h": 1
    },
    {
     "t": "brazier",
     "x": 31,
     "y": 26,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 24,
     "y": 13,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 31,
     "y": 18,
     "w": 1,
     "h": 1
    },
    {
     "t": "crystal",
     "x": 2,
     "y": 12,
     "w": 1,
     "h": 1
    },
    {
     "t": "sign",
     "x": 8,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "Les Grottes Miroirs. Ici, l’eau n’est pas un obstacle mais un miroir : elle renvoie la lumière dans le sens de ses flèches. Tourne les vannes pour la faire monter ou descendre."
    }
   ],
   "chests": [
    {
     "id": "ch_cle_g",
     "x": 25,
     "y": 16,
     "item": "cle_grottes",
     "n": 1
    },
    {
     "id": "ch_tresor_g",
     "x": 30,
     "y": 14,
     "item": "lame_ecume",
     "n": 1
    },
    {
     "id": "ch_hall_g",
     "x": 17,
     "y": 8,
     "ecus": 70
    },
    {
     "id": "ch_perle_g",
     "x": 22,
     "y": 29,
     "item": "perle_miroir",
     "n": 1,
     "after": "boss_marees"
    },
    {
     "id": "ch_cache_g",
     "x": 4,
     "y": 11,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_cache2_g",
     "x": 6,
     "y": 11,
     "ecus": 220
    }
   ],
   "spawns": [
    {
     "type": "crabe_lanterne",
     "x": 27,
     "y": 5,
     "n": 2,
     "room": "gr_combat"
    },
    {
     "type": "meduse_reflet",
     "x": 29,
     "y": 3,
     "n": 1,
     "room": "gr_combat"
    },
    {
     "type": "anguille_ombre",
     "x": 25,
     "y": 7,
     "n": 3,
     "room": "gr_combat"
    },
    {
     "type": "sentinelle_corail",
     "x": 15,
     "y": 6,
     "n": 1
    },
    {
     "type": "crabe_lanterne",
     "x": 28,
     "y": 16,
     "n": 1
    },
    {
     "type": "gardien_marees",
     "x": 22,
     "y": 29,
     "n": 1,
     "boss": true,
     "room": "gr_arene"
    }
   ],
   "doors": [
    {
     "gate": "gr_combat",
     "look": "seal",
     "cells": [
      [
       27,
       10
      ],
      [
       27,
       11
      ]
     ]
    },
    {
     "gate": "gr_key",
     "look": "door",
     "cells": [
      [
       15,
       10
      ],
      [
       15,
       11
      ],
      [
       15,
       12
      ]
     ],
     "key": "cle_grottes",
     "hint": "Une porte de corail scellée. Sa serrure a la forme d’une petite clé : elle doit être quelque part dans les Grottes, du côté de la salle des Écumes.",
     "use": "Déverrouiller la porte de corail"
    },
    {
     "gate": "gr_eau",
     "look": "barrier",
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
     "gate": "gr_arene",
     "look": "seal",
     "cells": [
      [
       33,
       29
      ]
     ]
    }
   ],
   "warp": {
    "id": "grottes",
    "x": 15,
    "y": 5,
    "name": "Hall des Grottes",
    "needs": "boss_marees"
   },
   "combatRooms": [
    {
     "gate": "gr_combat",
     "rect": [
      23,
      1,
      32,
      9
     ]
    },
    {
     "gate": "gr_arene",
     "rect": [
      12,
      26,
      32,
      32
     ]
    }
   ],
   "puzzle": {
    "rect": [
     9,
     13,
     13,
     11
    ],
    "entry": [
     15,
     14
    ],
    "final": "gr_eau",
    "label": "Salle des Marées"
   }
  },
  {
   "id": "phare_a",
   "region": "phare",
   "title": "Le Phare des Abysses",
   "num": 6,
   "secret": false,
   "ox": 120,
   "oy": 24,
   "spawn": [
    0,
    5
   ],
   "entryGate": "gr_arene",
   "hint": "Le phare exige deux lumières en même temps : celle d’une lanterne et celle de l’orbe de Fia. Chaque salle apprend un geste ; la dernière les réunit.",
   "map": [
    "###############################",
    "#.........#.........#.........#",
    "#..#......#.........#.........#",
    "#.........#.........#....#....#",
    "#.........#.........#.........#",
    "..........x.........x.........#",
    "#.........#...#.....#....#....#",
    "#.........#..#......#.........#",
    "#.........#.........#......#..#",
    "#.......#.#.........#.........#",
    "###############################"
   ],
   "ents": [
    {
     "t": "lantern",
     "id": "a_l",
     "x": 2,
     "y": 8,
     "dir": "E",
     "rot": true
    },
    {
     "t": "pool",
     "id": "a_p4",
     "x": 4,
     "y": 8,
     "o": "N",
     "valve": "a_v"
    },
    {
     "t": "pool",
     "id": "a_p5",
     "x": 5,
     "y": 8,
     "o": "N",
     "valve": "a_v"
    },
    {
     "t": "pool",
     "id": "a_p6",
     "x": 6,
     "y": 8,
     "o": "N",
     "valve": "a_v"
    },
    {
     "t": "pool",
     "id": "a_p7",
     "x": 7,
     "y": 8,
     "o": "N",
     "valve": "a_v"
    },
    {
     "t": "pool",
     "id": "a_p8",
     "x": 8,
     "y": 8,
     "o": "N",
     "valve": "a_v"
    },
    {
     "t": "valve",
     "id": "a_v",
     "x": 2,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "a_m",
     "x": 4,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "id": "a_r",
     "x": 8,
     "y": 2,
     "color": "w",
     "gate": "ph_d1"
    },
    {
     "t": "socle",
     "id": "b_s1",
     "x": 12,
     "y": 2,
     "rot": true
    },
    {
     "t": "socle",
     "id": "b_s2",
     "x": 12,
     "y": 8,
     "rot": true
    },
    {
     "t": "socle",
     "id": "b_s3",
     "x": 18,
     "y": 6,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "b_m1",
     "x": 17,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "id": "b_m2",
     "x": 17,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "pool",
     "id": "b_p1",
     "x": 17,
     "y": 3,
     "o": "W",
     "valve": "b_v"
    },
    {
     "t": "pool",
     "id": "b_p2",
     "x": 17,
     "y": 4,
     "o": "W",
     "valve": "b_v"
    },
    {
     "t": "valve",
     "id": "b_v",
     "x": 15,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "id": "b_r",
     "x": 19,
     "y": 8,
     "color": "w",
     "gate": "ph_d2"
    },
    {
     "t": "lantern",
     "id": "c_l",
     "x": 21,
     "y": 8,
     "dir": "E",
     "rot": true
    },
    {
     "t": "pool",
     "id": "c_p1",
     "x": 24,
     "y": 8,
     "o": "N",
     "valve": "c_v1"
    },
    {
     "t": "mirror",
     "id": "c_m",
     "x": 24,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "valve",
     "id": "c_v1",
     "x": 22,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "socle",
     "id": "c_s1",
     "x": 29,
     "y": 1,
     "rot": true,
     "color": "c"
    },
    {
     "t": "socle",
     "id": "c_s2",
     "x": 22,
     "y": 2,
     "rot": true,
     "color": "c"
    },
    {
     "t": "pool",
     "id": "c_p2",
     "x": 29,
     "y": 3,
     "o": "E",
     "valve": "c_v2"
    },
    {
     "t": "valve",
     "id": "c_v2",
     "x": 28,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "beacon",
     "id": "c_bc",
     "x": 29,
     "y": 4,
     "gate": "end",
     "need": [
      "w",
      "c"
     ]
    },
    {
     "t": "shard",
     "id": "sh_ph1",
     "x": 1,
     "y": 9
    },
    {
     "t": "shard",
     "id": "sh_ph2",
     "x": 11,
     "y": 9
    },
    {
     "t": "shard",
     "id": "sh_ph3",
     "x": 21,
     "y": 9
    }
   ],
   "theme": "phare_abysses",
   "music": "phare",
   "doors": [
    {
     "gate": "ph_d1",
     "look": "barrier",
     "cells": [
      [
       10,
       5
      ]
     ]
    },
    {
     "gate": "ph_d2",
     "look": "barrier",
     "cells": [
      [
       20,
       5
      ]
     ]
    }
   ],
   "warp": {
    "id": "phare",
    "x": 1,
    "y": 3,
    "name": "Cristal du Phare des Abysses"
   },
   "stages": [
    "ph_d1",
    "ph_d2"
   ],
   "final": "end",
   "respawn": true,
   "puzzle": [
    {
     "rect": [
      0,
      0,
      11,
      11
     ],
     "entry": [
      1,
      5
     ],
     "final": "ph_d1",
     "label": "Phare, salle A"
    },
    {
     "rect": [
      10,
      0,
      11,
      11
     ],
     "entry": [
      11,
      5
     ],
     "final": "ph_d2",
     "label": "Phare, salle B"
    },
    {
     "rect": [
      20,
      0,
      11,
      11
     ],
     "entry": [
      21,
      5
     ],
     "final": "end",
     "label": "Phare, salle C"
    }
   ]
  }
 ],
 "bridges": [
  {
   "gate": "b_lac",
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
   "gate": "la1",
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
   "gate": "la2",
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
   "gate": "la3",
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
   "gate": "gr_arene",
   "cells": [
    [
     115,
     29
    ],
    [
     116,
     29
    ],
    [
     117,
     29
    ],
    [
     118,
     29
    ],
    [
     119,
     29
    ]
   ]
  },
  {
   "gate": "b_recifs",
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
    ],
    [
     15,
     28
    ],
    [
     15,
     29
    ]
   ]
  },
  {
   "gate": "b_ilots",
   "cells": [
    [
     17,
     60
    ],
    [
     17,
     61
    ],
    [
     17,
     62
    ],
    [
     17,
     63
    ],
    [
     17,
     64
    ],
    [
     17,
     65
    ]
   ]
  }
 ]
};
