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
  },
  "havre": {
   "name": "Havre-Aube",
   "zones": [
    "havre",
    "auberge_in",
    "orin_in"
   ],
   "area": true
  },
  "lande": {
   "name": "La Lande des Ronces",
   "zones": [
    "lande"
   ],
   "area": true
  },
  "sanctuaire": {
   "name": "Le Sanctuaire de Brume",
   "zones": [
    "sanctuaire"
   ],
   "area": true
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
  },
  "orin4": {
   "title": "Journal d’Orin — IV",
   "text": "Lison, si tu lis ceci, c’est que tu as retrouvé mes pages. Je pars vers la Citadelle du Zénith : c’est là que la lumière est la plus forte, et l’ombre aussi. Le phare de l’Aube montrera le chemin aux îles une à une. Ne le laisse jamais s’éteindre. Et garde la Lentille loin de moi."
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
   "ox": 36,
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
    "...........",
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
   "ox": 51,
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
   "ox": 66,
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
   "ox": 81,
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
   "ox": 66,
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
   "ox": 81,
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
   "ox": 51,
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
   "ox": 36,
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
   "ox": 36,
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
   "ox": 51,
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
   "ox": 51,
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
   "ox": 66,
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
   "ox": 66,
   "oy": 45,
   "spawn": [
    6,
    1
   ],
   "entryGate": "g9",
   "barrier": "lens",
   "hint": "Le phare doit recevoir le rouge, le vert et le bleu en même temps.",
   "map": [
    "######x######",
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
  },
  {
   "id": "havre",
   "region": "havre",
   "title": "Havre-Aube",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    6,
    6
   ],
   "map": [
    "        T####T###TTT#T        ",
    "  HHHHHHH...........HHHHHH    ",
    "  HHHHHHH.......T...HHHHHH    ",
    "  HHHHHHH...........HHHHHH#   ",
    " ##..,....H.......H....,...H  ",
    "T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "T........,..H..,..........H.# ",
    "#........,.....,..HH...HH....T",
    "#.HHHHH..,.....,........T....T",
    "#.HHHHH..,,,,.,,,..,,,,,,,,..T",
    "T.HHHHH.H....,,,,,H,..T......T",
    "#.....H.....,,HHH,,..........#",
    "TT.....H....,,HHH,,......H...#",
    "T.T.........,,HHH,,.HHH...T..#",
    "T...........H,,,,,,,,,,,,....T",
    "T.....,,,,,,,.,,,....T.....H.#",
    "T.HHHHH......H.,.H.....,.....#",
    " THHHHH........,...T...,.....T",
    "  HHHHH..~~..T.,..,,,,,,,,,.# ",
    "  TT....~~~~...,...HHHHHH#r## ",
    "    #...~~~~~.T,...HHHHHH#.#  ",
    "    TT...~~~...,H..HHHHHH###  ",
    "      T#.......,H.....T ##    ",
    "      # ##TT#T#,##T#TT        "
   ],
   "ents": [],
   "area": true,
   "theme": "village",
   "props": [
    {
     "t": "house",
     "id": "auberge",
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
     "interior": "auberge_in",
     "name": "Auberge du Lampion",
     "sign": "lampion"
    },
    {
     "t": "house",
     "id": "orin",
     "x": 20,
     "y": 1,
     "w": 6,
     "h": 3,
     "style": "pierre",
     "door": [
      23,
      4
     ],
     "side": "S",
     "interior": "orin_in",
     "name": "Maison d’Orin",
     "lock": "cle_orin"
    },
    {
     "t": "house",
     "id": "forge",
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
     "name": "Forge de Bran"
    },
    {
     "t": "house",
     "id": "famille",
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
     "name": "Maison de Tobias",
     "closed": "La porte est fermée. On entend une bouilloire siffler."
    },
    {
     "t": "house",
     "id": "selene",
     "x": 19,
     "y": 19,
     "w": 6,
     "h": 3,
     "style": "phare",
     "door": [
      21,
      18
     ],
     "side": "N",
     "name": "Maison de Séléné",
     "closed": "Séléné passe ses journées sur la place. Sa porte est fermée."
    },
    {
     "t": "fountain",
     "id": "fontaine",
     "x": 14,
     "y": 11,
     "w": 3,
     "h": 3,
     "warp": "havre",
     "name": "Cristal de voyage"
    },
    {
     "t": "stall",
     "id": "etal_ysolde",
     "x": 18,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#5fb37a",
     "name": "Apothicaire"
    },
    {
     "t": "stall",
     "id": "etal_pell",
     "x": 23,
     "y": 7,
     "w": 2,
     "h": 1,
     "color": "#e58fb8",
     "name": "Tailleur"
    },
    {
     "t": "stall",
     "id": "etal_gaspard",
     "x": 21,
     "y": 13,
     "w": 2,
     "h": 1,
     "color": "#c9965a",
     "name": "Comptoir des ressources"
    },
    {
     "t": "anvil",
     "id": "enclume",
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
     "id": "lampion1"
    },
    {
     "t": "lamp",
     "x": 18,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion2"
    },
    {
     "t": "lamp",
     "x": 10,
     "y": 4,
     "w": 1,
     "h": 1,
     "id": "lampion3"
    },
    {
     "t": "lamp",
     "x": 26,
     "y": 6,
     "w": 1,
     "h": 1,
     "id": "lampion4"
    },
    {
     "t": "lamp",
     "x": 13,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion5"
    },
    {
     "t": "lamp",
     "x": 17,
     "y": 16,
     "w": 1,
     "h": 1,
     "id": "lampion6"
    },
    {
     "t": "lamp",
     "x": 16,
     "y": 21,
     "w": 1,
     "h": 1,
     "id": "lampion7"
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
     "id": "puits"
    },
    {
     "t": "sign",
     "x": 16,
     "y": 22,
     "w": 1,
     "h": 1,
     "text": "Au sud : la Lande des Ronces. Prudence, la brume y rôde."
    },
    {
     "t": "sign",
     "x": 27,
     "y": 4,
     "w": 1,
     "h": 1,
     "text": "À l’est : le pont du Rivage et le Phare de l’Aube."
    }
   ],
   "npcs": [
    {
     "id": "selene",
     "x": 12.6,
     "y": 9.4,
     "face": "S"
    },
    {
     "id": "ysolde",
     "x": 18.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "pell",
     "x": 23.5,
     "y": 6.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "gaspard",
     "x": 21.5,
     "y": 12.1,
     "face": "S",
     "counter": true
    },
    {
     "id": "bran",
     "x": 9.2,
     "y": 11,
     "face": "S"
    },
    {
     "id": "tobias",
     "x": 9,
     "y": 16.6,
     "wander": 2.4
    },
    {
     "id": "lison",
     "x": 25.2,
     "y": 4.2,
     "face": "S"
    },
    {
     "id": "mira",
     "x": 17.6,
     "y": 15.6,
     "wander": 1.6
    },
    {
     "id": "aldo",
     "x": 16.6,
     "y": 21.6,
     "face": "S"
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "pendentif",
     "item": "pendentif",
     "x": 26,
     "y": 20
    }
   ]
  },
  {
   "id": "lande",
   "region": "lande",
   "title": "La Lande des Ronces",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 26,
   "spawn": [
    15,
    1
   ],
   "map": [
    "              #,#   #             ",
    "          ##TT.,.##T.# #T         ",
    "    #T ###.....,......#..##       ",
    "    T.#........,..T........#      ",
    "   #....#.,,,,,,.........#.TTT    ",
    "  #.......,#..................#   ",
    " #T..,,,,,,.............rr....#   ",
    " # #.,....,...............r...T## ",
    "  #..,...T,........T..........#   ",
    "  #..,....,,,,,,,............## # ",
    "   #.,.#........,....T......T#    ",
    "   T...#.T......,...........# #   ",
    "    ##T....#...#,.........##T#    ",
    "       TrrrrrrrrrrrrrrrrrT        ",
    "      T T.......,T........TTT     ",
    "    T# #........,..........####   ",
    "   #..#.........,..........#..#   ",
    " # T............,......T......## #",
    "   T............,,,,,,,....####.# ",
    "#  #..#.rr............,.........# ",
    " ####c#.........T.....,...#..#...#",
    "  ##..#T.#..........T.,...#rT...T#",
    "   #..c..........,,,,,,....##.## #",
    " ######..........,.............T  ",
    "    T#...........,...........##   ",
    "    # #..........,..........#     ",
    "       T.T..#....,.....TTT.TT     ",
    "        T #T #TT#,#####   #       "
   ],
   "ents": [],
   "area": true,
   "theme": "lande",
   "props": [
    {
     "t": "ruin",
     "x": 17,
     "y": 25,
     "w": 1,
     "h": 1,
     "name": "Arche du Sanctuaire"
    },
    {
     "t": "sign",
     "x": 13,
     "y": 2,
     "w": 1,
     "h": 1,
     "text": "Lande des Ronces. Les ronces de la haie ne cèdent qu’à une vraie lame."
    }
   ],
   "chests": [
    {
     "id": "ch_marteau_bran",
     "x": 29,
     "y": 17,
     "item": "marteau_bran",
     "n": 1
    },
    {
     "id": "ch_lande_coeur",
     "x": 4,
     "y": 21,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_lande_ecus",
     "x": 25,
     "y": 3,
     "ecus": 60
    }
   ],
   "pickups": [
    {
     "t": "item",
     "id": "fleur1",
     "item": "fleur_miel",
     "x": 4,
     "y": 8
    },
    {
     "t": "item",
     "id": "fleur2",
     "item": "fleur_miel",
     "x": 27,
     "y": 8
    },
    {
     "t": "item",
     "id": "fleur3",
     "item": "fleur_miel",
     "x": 9,
     "y": 23
    },
    {
     "t": "item",
     "id": "fleur4",
     "item": "fleur_miel",
     "x": 30,
     "y": 23
    }
   ],
   "spawns": [
    {
     "type": "brumelin",
     "x": 9,
     "y": 6,
     "n": 2
    },
    {
     "type": "brumelin",
     "x": 20,
     "y": 5,
     "n": 2
    },
    {
     "type": "brumelin",
     "x": 22,
     "y": 10,
     "n": 1
    },
    {
     "type": "lanceur",
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
     "type": "ronceux",
     "x": 26,
     "y": 17,
     "n": 1
    },
    {
     "type": "sanglier",
     "x": 21,
     "y": 21,
     "n": 1
    },
    {
     "type": "sanglier",
     "x": 8,
     "y": 16,
     "n": 1
    },
    {
     "type": "lanceur",
     "x": 28,
     "y": 22,
     "n": 1
    },
    {
     "type": "brumelin",
     "x": 12,
     "y": 22,
     "n": 2
    },
    {
     "type": "gardien",
     "x": 17,
     "y": 24,
     "n": 1,
     "elite": true
    }
   ]
  },
  {
   "id": "sanctuaire",
   "region": "sanctuaire",
   "title": "Le Sanctuaire de Brume",
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
     "t": "mirror",
     "x": 27,
     "y": 7,
     "state": 1,
     "rot": true
    },
    {
     "t": "mirror",
     "x": 24,
     "y": 4,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 27,
     "y": 2,
     "color": "w",
     "gate": "sd_light"
    }
   ],
   "area": true,
   "theme": "sanctuaire",
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
     "id": "ch_cle",
     "x": 5,
     "y": 16,
     "item": "cle_sanctuaire",
     "n": 1
    },
    {
     "id": "ch_tresor",
     "x": 25,
     "y": 16,
     "item": "anneau_vie",
     "n": 1
    },
    {
     "id": "ch_marteau",
     "x": 15,
     "y": 25,
     "item": "marteau",
     "n": 1,
     "after": "boss_colosse"
    },
    {
     "id": "ch_cache",
     "x": 4,
     "y": 25,
     "item": "fragment_coeur",
     "n": 1
    },
    {
     "id": "ch_cache2",
     "x": 2,
     "y": 25,
     "ecus": 150
    }
   ],
   "spawns": [
    {
     "type": "brumelin",
     "x": 5,
     "y": 5,
     "n": 4,
     "room": "sd_combat"
    },
    {
     "type": "lanceur",
     "x": 2,
     "y": 2,
     "n": 1,
     "room": "sd_combat"
    },
    {
     "type": "gardien",
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
     "type": "colosse",
     "x": 15,
     "y": 18,
     "n": 1,
     "boss": true
    }
   ],
   "doors": [
    {
     "gate": "sd_combat",
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
     "gate": "sd_light",
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
     "gate": "sd_key",
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
     "key": "cle_sanctuaire"
    }
   ],
   "warp": {
    "id": "sanctuaire",
    "x": 15,
    "y": 5,
    "name": "Hall du Sanctuaire",
    "needs": "boss_colosse"
   },
   "combatRooms": [
    {
     "gate": "sd_combat",
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
   "id": "auberge_in",
   "region": "havre",
   "title": "Auberge du Lampion",
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
     "id": "maelle",
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
    "to": "havre",
    "at": [
     5,
     5
    ]
   }
  },
  {
   "id": "orin_in",
   "region": "havre",
   "title": "Maison d’Orin",
   "num": 0,
   "secret": false,
   "ox": 150,
   "oy": 12,
   "spawn": [
    5,
    6
   ],
   "map": [
    "###########",
    "#HHH...HHH#",
    "#.........#",
    "#...HHH...#",
    "#.......H.#",
    "#.H.......#",
    "#.........#",
    "#####.#####"
   ],
   "ents": [],
   "area": true,
   "theme": "interieur",
   "interior": true,
   "props": [
    {
     "t": "shelf",
     "x": 1,
     "y": 1,
     "w": 3,
     "h": 1
    },
    {
     "t": "shelf",
     "x": 7,
     "y": 1,
     "w": 3,
     "h": 1
    },
    {
     "t": "desk",
     "x": 4,
     "y": 3,
     "w": 3,
     "h": 1,
     "read": "carte_orin",
     "name": "Bureau d’Orin"
    },
    {
     "t": "globe",
     "x": 8,
     "y": 4,
     "w": 1,
     "h": 1
    },
    {
     "t": "telescope",
     "x": 2,
     "y": 5,
     "w": 1,
     "h": 1
    }
   ],
   "chests": [
    {
     "id": "ch_orin",
     "x": 8,
     "y": 2,
     "item": "amulette_lume",
     "n": 1
    }
   ],
   "pickups": [
    {
     "t": "page",
     "id": "page_orin4",
     "page": "orin4",
     "x": 5,
     "y": 5
    }
   ],
   "exit": {
    "cell": [
     5,
     7
    ],
    "to": "havre",
    "at": [
     23,
     5
    ]
   }
  }
 ],
 "bridges": [
  {
   "gate": "g1",
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
   "gate": "g2",
   "cells": [
    [
     62,
     7
    ],
    [
     63,
     7
    ],
    [
     64,
     7
    ],
    [
     65,
     7
    ]
   ]
  },
  {
   "gate": "s1",
   "cells": [
    [
     77,
     3
    ],
    [
     78,
     3
    ],
    [
     79,
     3
    ],
    [
     80,
     3
    ]
   ]
  },
  {
   "gate": "g3",
   "cells": [
    [
     71,
     11
    ],
    [
     71,
     12
    ],
    [
     71,
     13
    ],
    [
     71,
     14
    ]
   ]
  },
  {
   "gate": "s2",
   "cells": [
    [
     77,
     19
    ],
    [
     78,
     19
    ],
    [
     79,
     19
    ],
    [
     80,
     19
    ]
   ]
  },
  {
   "gate": "g4",
   "cells": [
    [
     65,
     21
    ],
    [
     64,
     21
    ],
    [
     63,
     21
    ],
    [
     62,
     21
    ]
   ]
  },
  {
   "gate": "g5",
   "cells": [
    [
     50,
     19
    ],
    [
     49,
     19
    ],
    [
     48,
     19
    ],
    [
     47,
     19
    ]
   ]
  },
  {
   "gate": "g6",
   "cells": [
    [
     41,
     26
    ],
    [
     41,
     27
    ],
    [
     41,
     28
    ],
    [
     41,
     29
    ]
   ]
  },
  {
   "gate": "g7",
   "cells": [
    [
     47,
     36
    ],
    [
     48,
     36
    ],
    [
     49,
     36
    ],
    [
     50,
     36
    ]
   ]
  },
  {
   "gate": "s3",
   "cells": [
    [
     56,
     41
    ],
    [
     56,
     42
    ],
    [
     56,
     43
    ],
    [
     56,
     44
    ]
   ]
  },
  {
   "gate": "g8",
   "cells": [
    [
     62,
     34
    ],
    [
     63,
     34
    ],
    [
     64,
     34
    ],
    [
     65,
     34
    ]
   ]
  },
  {
   "gate": "g9",
   "cells": [
    [
     72,
     41
    ],
    [
     72,
     42
    ],
    [
     72,
     43
    ],
    [
     72,
     44
    ]
   ]
  },
  {
   "gate": "b_rivage",
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
   "gate": "b_lande",
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
   "gate": "b_sanct",
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
  }
 ]
};
