/* Fichier généré par tools/build-test-montagne.mjs — ne pas modifier à la main (modifier le script puis relancer). */
export default {
 "id": "test-montagne",
 "num": 0,
 "name": "Montagne d’essai",
 "intro": "Île de démonstration du relief : trois terrasses, un escalier, une rampe, des falaises.",
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
  "base": {
   "name": "Montagne d’essai",
   "zones": [
    "base"
   ],
   "area": true
  }
 },
 "pages": {},
 "wisp": {
  "name": "Lueur d’essai",
  "text": ""
 },
 "ending": "Essai terminé.",
 "zones": [
  {
   "id": "base",
   "region": "base",
   "title": "Montagne d’essai",
   "num": 0,
   "secret": false,
   "ox": 0,
   "oy": 0,
   "spawn": [
    10,
    17
   ],
   "entry": [
    10,
    17
   ],
   "hint": "Terrasses, escalier, rampe, falaises. Tourne le miroir vers le cristal, au sommet.",
   "area": true,
   "theme": "village",
   "map": [
    "                        ",
    "   ##T#T##T#TT#T#TT##   ",
    "   T........,..,.,..T   ",
    "   T,..,..,..,..,..,T   ",
    "   #,.......,......TT   ",
    "   T.............,.,T   ",
    "  T.......,,..,,,,...#  ",
    "  T.......,,..,,,,...T  ",
    "  #.......,,..,,,,...T  ",
    "  T...,,,,,,,,,,,,...#  ",
    "  #.......,,.........#  ",
    "  #...T...,,.........T  ",
    "  #.......,,......T..T  ",
    "  T.......,,.........#  ",
    "  T.......,,.........T  ",
    "  T.......,,.........T  ",
    "  #.......,,.........T  ",
    "  T.......,,.........#  ",
    "  T..T....,,...T.....T  ",
    "  T.....HHHH.........T  ",
    "  T.....HHHH....T....#  ",
    "  #.......,,.........#  ",
    "  T.T.....,,......T..#  ",
    "  T.......,,.........T  ",
    "  TT#######TT#T#T#T#TT  ",
    "                        "
   ],
   "hmap": [
    "                        ",
    "   888888888888888888   ",
    "   888888888888888888   ",
    "   888888888888888888   ",
    "   888888888888888888   ",
    "   888888888888888888   ",
    "  44444444444477774444  ",
    "  44444444444466664444  ",
    "  44444444444455554444  ",
    "  44444444444444444444  ",
    "  44444444444444444444  ",
    "  44444444444444444444  ",
    "  44444444444444444444  ",
    "  44444444334444444444  ",
    "  44444444224444444444  ",
    "  44444444114444444444  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "  00000000000000000000  ",
    "                        "
   ],
   "ents": [
    {
     "t": "start",
     "x": 10,
     "y": 17
    },
    {
     "t": "lantern",
     "x": 5,
     "y": 3,
     "dir": "E",
     "rot": true
    },
    {
     "t": "mirror",
     "x": 10,
     "y": 3,
     "state": 0,
     "rot": true
    },
    {
     "t": "receiver",
     "x": 10,
     "y": 5,
     "color": "w",
     "gate": "g_c"
    }
   ],
   "props": [
    {
     "t": "house",
     "id": "abri",
     "x": 8,
     "y": 19,
     "w": 4,
     "h": 2,
     "style": "bois",
     "door": [
      10,
      21
     ],
     "side": "S",
     "name": "Abri"
    }
   ],
   "npcs": [
    {
     "id": "tobias",
     "x": 7,
     "y": 10,
     "face": "S"
    }
   ],
   "chests": [
    {
     "id": "ch_test_sommet",
     "x": 18,
     "y": 3,
     "ecus": 30
    }
   ],
   "spawns": [
    {
     "type": "brumelin",
     "x": 16,
     "y": 12,
     "n": 1
    }
   ]
  }
 ],
 "bridges": []
};
