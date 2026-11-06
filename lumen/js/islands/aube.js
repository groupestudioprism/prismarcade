/* Fichier généré par tools/build-aube.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "aube",
 "num": 1,
 "name": "L’Île de l’Aube",
 "intro": "La Brume a éteint l’archipel. Sur l’Île de l’Aube, les cristaux dorment et le phare s’est tu. Rallume-les, un faisceau après l’autre.",
 "sky": {
  "dusk": [
   "#3b3274",
   "#7a6aa6",
   "#e6a99d"
  ],
  "dawn": [
   "#3f80e0",
   "#b5dcf7",
   "#ffd9a6"
  ]
 },
 "regions": {
  "rivage": {
   "name": "Le Rivage",
   "zones": [
    "z1",
    "z2",
    "z3"
   ]
  },
  "jardins": {
   "name": "Les Jardins suspendus",
   "zones": [
    "z4",
    "z5",
    "z6"
   ]
  },
  "ruines": {
   "name": "Les Ruines",
   "zones": [
    "z7",
    "z8",
    "z9"
   ]
  },
  "phare": {
   "name": "Le Phare de l’Aube",
   "zones": [
    "phare"
   ]
  },
  "secret": {
   "name": "Chambres secrètes",
   "zones": [
    "s1",
    "s2",
    "s3"
   ]
  }
 },
 "pages": {
  "orin1": {
   "title": "Journal d’Orin — I",
   "text": "J’ai posé la dernière pierre du phare de l’Aube. Quand le Grand Prisme l’a touché, toute l’île est devenue rose, comme si le ciel se souvenait de son premier matin. Séléné dit que nous avons dompté la lumière. Je crois plutôt que nous l’avons empruntée."
  },
  "orin2": {
   "title": "Journal d’Orin — II",
   "text": "Les îles s’éloignent un peu chaque année. Il faudrait plus de phares, plus de lumière. Ou une seule lumière, si forte qu’elle les retiendrait toutes. J’ai commencé les plans d’une lentille, au cœur même du Prisme."
  },
  "orin3": {
   "title": "Journal d’Orin — III",
   "text": "La lentille fonctionne. Trop bien. Là où la lumière se concentre, une ombre est née derrière le Prisme. Elle grandit quand je l’éclaire davantage. Je ne sais plus s’il faut l’arrêter… ou si c’est moi qu’il faudrait arrêter."
  }
 },
 "wisp": {
  "name": "Lueur de l’Aube",
  "text": "Une petite Lueur tremble dans les herbes. Elle te suit : quand le Sanctuaire sera accessible, elle y rallumera la fontaine."
 },
 "ending": "Le phare de l’Aube brille à nouveau. Un fragment rouge du Grand Prisme flotte au-dessus de la flamme : la route vers la Forêt de Verre s’éclaire au loin.",
 "zones": [
  {
   "id": "z1",
   "region": "rivage",
   "title": "Premier rayon",
   "num": 1,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    3,
    5
   ],
   "hint": "Approche-toi de la lanterne (anneau doré) et tourne-la vers le cristal.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "#..........",
    "#.........#",
    "#.........#",
    "#.........#",
    "#T.......T#",
    "###########"
   ],
   "ents": [
    {
     "t": "start",
     "x": 3,
     "y": 5
    },
    {
     "t": "lantern",
     "x": 2,
     "y": 2,
     "dir": "S",
     "rot": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 2,
     "color": "w",
     "gate": "g1"
    },
    {
     "t": "shard",
     "x": 9,
     "y": 1
    }
   ]
  },
  {
   "id": "z2",
   "region": "rivage",
   "title": "Premier reflet",
   "num": 2,
   "secret": false,
   "ox": 15,
   "oy": 0,
   "spawn": [
    0,
    5
   ],
   "entryGate": "g1",
   "hint": "Un miroir renvoie la lumière sur le côté. Tourne-le pour viser le cristal.",
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#.........#",
    "#.........#",
    "..........#",
    "#.........#",
    "#..........",
    "#.........#",
    "#T.......T#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 2,
     "dir": "E"
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 7,
     "y": 8,
     "color": "w",
     "gate": "g2"
    }
   ]
  },
  {
   "id": "z3",
   "region": "rivage",
   "title": "Les Rochers",
   "num": 3,
   "secret": false,
   "ox": 30,
   "oy": 0,
   "spawn": [
    0,
    7
   ],
   "entryGate": "g2",
   "hint": "Plusieurs miroirs, mais tous ne servent pas. Suis le faisceau pas à pas.",
   "seed": 303,
   "map": [
    "###########",
    "#........##",
    "#.........#",
    "#..........",
    "#T........#",
    "#.#..####.#",
    "#...###...#",
    "....#.....#",
    "#.......###",
    "#T..#.....#",
    "#####.#####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 7,
     "y": 6,
     "dir": "S",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 9,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 7,
     "color": "w",
     "gate": "g3"
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 1,
     "state": 1,
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
     "t": "receiver",
     "x": 5,
     "y": 7,
     "color": "w",
     "gate": "s1",
     "optional": true
    },
    {
     "t": "shard",
     "x": 9,
     "y": 2
    }
   ]
  },
  {
   "id": "s1",
   "region": "secret",
   "title": "La Crique",
   "num": 0,
   "secret": true,
   "ox": 45,
   "oy": 0,
   "spawn": [
    0,
    3
   ],
   "entryGate": "s1",
   "barrier": "t1",
   "hint": "Chambre secrète : rallume le cristal pour ouvrir la salle au trésor.",
   "seed": 1104,
   "map": [
    "###########",
    "##........#",
    "#.##......#",
    ".....#....#",
    "#T........#",
    "#.........#",
    "#...#.....#",
    "#..##.#####",
    "#..#..x...#",
    "#T....#...#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 6,
     "y": 3,
     "dir": "S",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 4,
     "state": 1,
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
     "x": 7,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 8,
     "y": 2,
     "color": "w",
     "gate": "t1"
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "shard",
     "x": 9,
     "y": 8
    },
    {
     "t": "page",
     "x": 8,
     "y": 9,
     "page": "orin1"
    }
   ]
  },
  {
   "id": "z4",
   "region": "jardins",
   "title": "Le Prisme",
   "num": 4,
   "secret": false,
   "ox": 30,
   "oy": 15,
   "spawn": [
    5,
    0
   ],
   "entryGate": "g3",
   "hint": "Le prisme sépare la lumière blanche : rouge à gauche, vert tout droit, bleu à droite.",
   "seed": 2003,
   "map": [
    "#####.#####",
    "###....T..#",
    "#.........#",
    "#..#.#....#",
    "#T.........",
    "##........#",
    "..........#",
    "#.........#",
    "#.........#",
    "#...#.T...#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 6,
     "y": 4,
     "dir": "S",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "prism",
     "x": 8,
     "y": 7
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 3,
     "color": "r",
     "gate": "g4"
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 7,
     "y": 9,
     "color": "b",
     "gate": "g4"
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 6,
     "y": 3,
     "color": "r",
     "gate": "s2",
     "optional": true
    }
   ]
  },
  {
   "id": "s2",
   "region": "secret",
   "title": "Le Belvédère",
   "num": 0,
   "secret": true,
   "ox": 45,
   "oy": 15,
   "spawn": [
    0,
    4
   ],
   "entryGate": "s2",
   "barrier": "t2",
   "hint": "Chambre secrète : trois couleurs, un relais… et beaucoup de miroirs.",
   "seed": 2438,
   "map": [
    "###########",
    "#T........#",
    "#T........#",
    "#.........#",
    "..........#",
    "#.........#",
    "#.........#",
    "#.....#####",
    "#.....x...#",
    "#.###.#...#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 8,
     "y": 1,
     "dir": "S",
     "rot": false
    },
    {
     "t": "relay",
     "x": 8,
     "y": 4,
     "out": "N",
     "rot": true
    },
    {
     "t": "prism",
     "x": 7,
     "y": 4
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 9,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 5,
     "color": "r",
     "gate": "t2"
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 7,
     "color": "g",
     "gate": "t2"
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 1,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 1,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 3,
     "color": "b",
     "gate": "t2"
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 5,
     "state": 0,
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
     "t": "shard",
     "x": 9,
     "y": 8
    },
    {
     "t": "page",
     "x": 8,
     "y": 9,
     "page": "orin2"
    }
   ]
  },
  {
   "id": "z5",
   "region": "jardins",
   "title": "Trois couleurs",
   "num": 5,
   "secret": false,
   "ox": 15,
   "oy": 15,
   "spawn": [
    10,
    6
   ],
   "entryGate": "g4",
   "hint": "Chaque cristal attend sa couleur. Les trois doivent briller en même temps.",
   "seed": 3059,
   "map": [
    "###########",
    "#T.#......#",
    "#.#.......#",
    "###.....#.#",
    "..........#",
    "#....#....#",
    "#..........",
    "#.........#",
    "#.........#",
    "#.T..T....#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 3,
     "y": 9,
     "dir": "N",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "prism",
     "x": 2,
     "y": 7
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 8,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 6,
     "y": 5,
     "color": "r",
     "gate": "g5"
    },
    {
     "t": "mirror",
     "x": 1,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 5,
     "color": "g",
     "gate": "g5"
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 5,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 5,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 9,
     "color": "b",
     "gate": "g5"
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 1,
     "y": 4
    }
   ]
  },
  {
   "id": "z6",
   "region": "jardins",
   "title": "Le Relais",
   "num": 6,
   "secret": false,
   "ox": 0,
   "oy": 15,
   "spawn": [
    10,
    4
   ],
   "entryGate": "g5",
   "hint": "Un cristal relais réémet la lumière qu’il reçoit. Choisis dans quelle direction.",
   "seed": 4005,
   "map": [
    "###########",
    "#T..T.##.##",
    "#.#......##",
    "#.......#.#",
    "#.....##...",
    "#.........#",
    "#.........#",
    "####......#",
    "#.........#",
    "#.........#",
    "#####.#####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 2,
     "y": 4,
     "dir": "S",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 5,
     "state": 1,
     "rot": true
    },
    {
     "t": "relay",
     "x": 1,
     "y": 5,
     "out": "W",
     "rot": true
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 2,
     "color": "w",
     "gate": "g6"
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 9,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 1,
     "y": 9
    }
   ]
  },
  {
   "id": "z7",
   "region": "ruines",
   "title": "La Chaîne",
   "num": 7,
   "secret": false,
   "ox": 0,
   "oy": 30,
   "spawn": [
    5,
    0
   ],
   "entryGate": "g6",
   "hint": "Deux relais se passent la lumière. Commence par celui qui est déjà éclairé.",
   "seed": 5000,
   "map": [
    "#####.#####",
    "####...T..#",
    "#.........#",
    "#...#.....#",
    "#...#.##..#",
    "##........#",
    "#...#......",
    "#.........#",
    "#.........#",
    "#.......T.#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 7,
     "y": 7,
     "dir": "W",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "relay",
     "x": 6,
     "y": 9,
     "out": "E",
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
     "t": "relay",
     "x": 3,
     "y": 5,
     "out": "E",
     "rot": true
    },
    {
     "t": "receiver",
     "x": 7,
     "y": 5,
     "color": "w",
     "gate": "g7"
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
     "x": 6,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 9,
     "y": 9
    }
   ]
  },
  {
   "id": "z8",
   "region": "ruines",
   "title": "Deux lanternes",
   "num": 8,
   "secret": false,
   "ox": 15,
   "oy": 30,
   "spawn": [
    0,
    6
   ],
   "entryGate": "g7",
   "hint": "Deux lanternes, deux cristaux. Les faisceaux peuvent se croiser sans se gêner.",
   "seed": 6004,
   "map": [
    "###########",
    "#.........#",
    "#.........#",
    "#....##.#.#",
    "##...##....",
    "#.........#",
    "..........#",
    "#.........#",
    "#..#......#",
    "#T##......#",
    "#####.#####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 6,
     "y": 5,
     "dir": "E",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 5,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 9,
     "y": 7,
     "color": "w",
     "gate": "g8"
    },
    {
     "t": "lantern",
     "x": 7,
     "y": 8,
     "dir": "W",
     "rot": false
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
     "x": 4,
     "y": 5,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 5,
     "y": 5,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 5,
     "y": 7,
     "color": "w",
     "gate": "g8"
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 7,
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
     "t": "receiver",
     "x": 7,
     "y": 3,
     "color": "w",
     "gate": "s3",
     "optional": true
    },
    {
     "t": "wisp",
     "x": 9,
     "y": 1
    }
   ]
  },
  {
   "id": "s3",
   "region": "secret",
   "title": "Le Jardin caché",
   "num": 0,
   "secret": true,
   "ox": 15,
   "oy": 45,
   "spawn": [
    5,
    0
   ],
   "entryGate": "s3",
   "barrier": "t3",
   "hint": "La dernière chambre secrète de l’Aube. Prends ton temps.",
   "seed": 7027,
   "map": [
    "#####.#####",
    "#......T..#",
    "#..#......#",
    "#..#......#",
    "#..#.##...#",
    "#.........#",
    "#.#.......#",
    "#.....#####",
    "#.....x...#",
    "#.....#...#",
    "###########"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 7,
     "y": 6,
     "dir": "W",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 3,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "relay",
     "x": 3,
     "y": 8,
     "out": "E",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 8,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 4,
     "y": 9,
     "color": "w",
     "gate": "t3"
    },
    {
     "t": "lantern",
     "x": 8,
     "y": 1,
     "dir": "S",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 8,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 7,
     "y": 2,
     "state": 1,
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
     "x": 9,
     "y": 5,
     "color": "w",
     "gate": "t3"
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 3,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 5,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 9,
     "y": 8
    },
    {
     "t": "page",
     "x": 8,
     "y": 9,
     "page": "orin3"
    }
   ]
  },
  {
   "id": "z9",
   "region": "ruines",
   "title": "Les Croisements",
   "num": 9,
   "secret": false,
   "ox": 30,
   "oy": 30,
   "spawn": [
    0,
    4
   ],
   "entryGate": "g8",
   "hint": "Un relais avant le prisme : la lumière blanche doit d’abord y arriver.",
   "seed": 8016,
   "map": [
    "###########",
    "#T........#",
    "#.......###",
    "##.......##",
    ".........##",
    "#.........#",
    "#......####",
    "#.........#",
    "##.......T#",
    "#........T#",
    "######.####"
   ],
   "ents": [
    {
     "t": "lantern",
     "x": 4,
     "y": 4,
     "dir": "N",
     "rot": false
    },
    {
     "t": "mirror",
     "x": 4,
     "y": 2,
     "state": 1,
     "rot": true
    },
    {
     "t": "relay",
     "x": 5,
     "y": 2,
     "out": "E",
     "rot": true
    },
    {
     "t": "prism",
     "x": 5,
     "y": 3
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
     "x": 7,
     "y": 2,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 6,
     "y": 2,
     "color": "r",
     "gate": "g9"
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 1,
     "y": 6,
     "color": "b",
     "gate": "g9"
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
     "y": 7,
     "state": 0,
     "rot": true
    },
    {
     "t": "shard",
     "x": 8,
     "y": 9
    }
   ]
  },
  {
   "id": "phare",
   "region": "phare",
   "title": "Le Phare de l’Aube",
   "num": 10,
   "secret": false,
   "ox": 30,
   "oy": 45,
   "spawn": [
    6,
    0
   ],
   "entryGate": "g9",
   "hint": "Le phare doit recevoir le rouge, le vert et le bleu en même temps.",
   "map": [
    "######.######",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#############"
   ],
   "ents": [
    {
     "t": "beacon",
     "x": 6,
     "y": 6,
     "gate": "end"
    },
    {
     "t": "lantern",
     "x": 1,
     "y": 10,
     "dir": "W",
     "rot": true
    },
    {
     "t": "prism",
     "x": 6,
     "y": 10
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 10,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 6,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 6,
     "y": 11,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 11,
     "state": 0,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 2,
     "y": 6,
     "state": 1,
     "rot": true
    },
    {
     "t": "shard",
     "x": 11,
     "y": 11
    }
   ]
  }
 ],
 "bridges": [
  {
   "gate": "g1",
   "cells": [
    [
     11,
     5
    ],
    [
     12,
     5
    ],
    [
     13,
     5
    ],
    [
     14,
     5
    ]
   ]
  },
  {
   "gate": "g2",
   "cells": [
    [
     26,
     7
    ],
    [
     27,
     7
    ],
    [
     28,
     7
    ],
    [
     29,
     7
    ]
   ]
  },
  {
   "gate": "s1",
   "cells": [
    [
     41,
     3
    ],
    [
     42,
     3
    ],
    [
     43,
     3
    ],
    [
     44,
     3
    ]
   ]
  },
  {
   "gate": "g3",
   "cells": [
    [
     35,
     11
    ],
    [
     35,
     12
    ],
    [
     35,
     13
    ],
    [
     35,
     14
    ]
   ]
  },
  {
   "gate": "s2",
   "cells": [
    [
     41,
     19
    ],
    [
     42,
     19
    ],
    [
     43,
     19
    ],
    [
     44,
     19
    ]
   ]
  },
  {
   "gate": "g4",
   "cells": [
    [
     29,
     21
    ],
    [
     28,
     21
    ],
    [
     27,
     21
    ],
    [
     26,
     21
    ]
   ]
  },
  {
   "gate": "g5",
   "cells": [
    [
     14,
     19
    ],
    [
     13,
     19
    ],
    [
     12,
     19
    ],
    [
     11,
     19
    ]
   ]
  },
  {
   "gate": "g6",
   "cells": [
    [
     5,
     26
    ],
    [
     5,
     27
    ],
    [
     5,
     28
    ],
    [
     5,
     29
    ]
   ]
  },
  {
   "gate": "g7",
   "cells": [
    [
     11,
     36
    ],
    [
     12,
     36
    ],
    [
     13,
     36
    ],
    [
     14,
     36
    ]
   ]
  },
  {
   "gate": "s3",
   "cells": [
    [
     20,
     41
    ],
    [
     20,
     42
    ],
    [
     20,
     43
    ],
    [
     20,
     44
    ]
   ]
  },
  {
   "gate": "g8",
   "cells": [
    [
     26,
     34
    ],
    [
     27,
     34
    ],
    [
     28,
     34
    ],
    [
     29,
     34
    ]
   ]
  },
  {
   "gate": "g9",
   "cells": [
    [
     36,
     41
    ],
    [
     36,
     42
    ],
    [
     36,
     43
    ],
    [
     36,
     44
    ]
   ]
  }
 ]
};
