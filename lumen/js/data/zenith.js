/* =========================================================
   LUMEN — Acte VI, la Citadelle du Zénith : habitants, quêtes, objets, créatures, boutiques.
   Ce fichier est fusionné dans les tables de data/*.js (voir leurs dernières lignes, marquées ACTE VI).
   Les habitants portent le suffixe _z : ce sont des retrouvailles, pas de nouveaux inconnus.
   Les dialogues évoluent avec l’aventure : quêtes (q.quest), drapeaux (boss_zenith, fin_jeu…).
   ========================================================= */

const S = (q, id, st) => q.quest(id) === 'active' && q.step(id) === st;
const FIA = (t) => ({ who: 'fia', t });
const LYRA = (t) => ({ who: 'lyra', t });
const fini = (q) => q.flag('fin_jeu');

/* ---------------------------------------------------------
   Habitants
   --------------------------------------------------------- */
export const ZENITH_NPCS = {
  celestine: {
    name: 'Célestine', role: 'Gardienne du Zénith',
    look: { hair: 'long', hairHex: '#f3e6b8', skinHex: '#efd0b4', outfit: 'aube', cloakHex: '#fbf6ea', tunicHex: '#f0c66b', trimHex: '#ffffff', scale: 1.02, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_porte', 'parler'),
        say: [
          'Une voyageuse avec une Lueur… et cinq phares allumés dans son sillage. Je les ai vus d’ici, un à un, comme des étoiles qui reviennent. Je m’appelle Célestine. Je garde la Citadelle du Zénith, la dernière île, la plus haute.',
          FIA('Elle connaît mon nom ? Je ne lui ai rien dit ! Lyra, elle est forte.'),
          'Écoute-moi bien, Lyra. Le Grand Prisme n’a pas été brisé par la Brume : il s’est fendu tout seul, il y a longtemps, quand on a voulu le forcer à ne briller que d’une couleur. La Brume n’a fait que remplir la fissure.',
          'Au centre de la Grande Salle, son ombre s’est dressée. Elle se nourrit de ce qui reste du Prisme. Tant qu’elle vit, la lumière ne passera plus de phare en phare.',
          'Il y a un chemin : les Jardins célestes, la Grande Salle, puis le phare au sommet. Mais d’abord, retrouve les tiens. Séléné est arrivée avant toi ; elle t’attend près de la fontaine.',
          'Prends ceci : un don de la citadelle. Les portails de lumière avalent un faisceau d’un côté et le rendent de l’autre. Tu sauras t’en servir.',
        ],
        do: [{ ability: 'portails' }, { open: 'b_portails' }, { step: 'q_porte' }],
      },
      {
        if: (q) => S(q, 'q_porte', 'selene') || S(q, 'q_porte', 'bran'),
        say: ['Les tiens sont sur la place : Séléné près de la fontaine, Bran à son enclume. Ils ont voyagé jusqu’ici pour toi, ne les fais pas attendre.'],
      },
      {
        if: (q) => S(q, 'q_jardins', 'vesper') || q.quest('q_jardins') === 'active',
        say: ['À l’est, les salles des portails te mèneront aux Jardins célestes. Chaque portail a son jumeau : la lumière entre par l’un, ressort par l’autre, dans la même direction et avec la même couleur.', FIA('Moi aussi je voudrais un jumeau. Un Fia de l’autre côté du mur !')],
      },
      {
        if: (q) => q.quest('q_salle') === 'active' && !q.flag('boss_zenith'),
        say: ['La Grande Salle est au sud des Jardins. L’Ombre du Prisme t’y attend ; elle prend la forme de ce que tu crains. Garde ton sang-froid, et tes potions à portée.', 'Quand ses lanternes noires s’allument, c’est qu’elle se cache derrière une éclipse. Éteins-les.'],
      },
      {
        if: (q) => S(q, 'q_salle', 'fragment') || (q.quest('q_salle') === 'active' && q.flag('boss_zenith')),
        say: ['Tu l’as vaincue ? Je l’ai senti jusqu’ici : la citadelle a cessé de trembler. Prends le dernier fragment dans le coffre de l’arène. Le phare est au sud, au bout du pont.'],
      },
      {
        if: (q) => q.quest('q_zenith') === 'active',
        say: ['Le phare du Zénith est un phare à six faisceaux. Rouge, vert et bleu à gauche ; jaune, magenta et cyan à droite. Chaque couleur partira vers un phare de l’archipel.', 'Les cristaux ouvrent les portes, mais pour la lumière finale, il faudra défaire ce qui a ouvert les portes. C’est ainsi depuis Orin.'],
      },
      {
        if: (q) => S(q, 'q_epilogue', 'retour'),
        say: [
          LYRA('C’est fini, Célestine. Les six phares brillent.'),
          'Je les vois tous. Le Prisme n’est plus un seul cristal qu’on garde : c’est une lumière qu’on se passe. Orin avait raison, à la fin.',
          FIA('Et maintenant ? On a le droit de continuer à se promener ? Il reste des coffres et des fleurs à cueillir !'),
          'Bien sûr. La citadelle est à vous, et l’archipel aussi. Revenez quand vous voulez contempler le Prisme : il vous attendra au sommet.',
        ],
        do: [{ step: 'q_epilogue' }, { flag: 'epilogue_ok' }],
      },
      {
        if: (q) => fini(q),
        say: ['La Brume recule sur toutes les îles. Elle reviendra peut-être, mais plus jamais seule : à présent, chacune sait allumer son phare.'],
        choices: [
          { t: 'Revoir la scène finale', if: (q) => q.flag('fin_jeu'), do: [{ replay: 'fin' }] },
          { t: 'Merci, Célestine' },
        ],
      },
      {
        if: () => true,
        say: ['La citadelle respire à nouveau. Que la lumière te guide.'],
      },
    ],
  },

  selene_z: {
    name: 'Séléné', role: 'Gardienne du phare de l’Aube',
    look: { hair: 'chignon', hairHex: '#d9d5e6', skinHex: '#efd0b4', outfit: 'aube', cloakHex: '#e9e2f5', tunicHex: '#c9b8e8', trimHex: '#f0c66b', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_porte', 'selene'),
        say: [
          'Lyra ! Fia ! Quand la barque m’a déposée ici, j’ai cru rêver : la citadelle dont Orin parlait toujours… Le phare de l’Aube brille, tu sais. Mira dit qu’on le voit même de la Forêt.',
          FIA('Séléné ! On est montées tout là-haut ! Et il y a des portails ! Des vrais !'),
          'Je n’ai pas fait tout ce chemin pour regarder. Aube, Forêt, tout l’archipel s’est mis en route derrière toi : ils sont sur la place. Parle-leur. Bran, surtout : il a emporté son enclume.',
        ],
        do: [{ step: 'q_porte' }],
      },
      {
        if: (q) => fini(q),
        say: ['Je ne pensais pas revoir le phare de l’Aube éclairer le Zénith. Mon père aurait… non. Il aurait pleuré, puis il aurait dessiné la carte du retour.', 'Tu sais, Lyra, Havre-Aube sera toujours ta maison. Même si l’archipel s’est rapproché.'],
      },
      {
        if: (q) => q.flag('boss_zenith'),
        say: ['L’Ombre est tombée. Je l’ai senti dans le sol, comme un grand soupir. Va au phare, Lyra : je veux voir la lumière passer d’île en île.'],
      },
      {
        if: (q) => q.quest('q_salle') === 'active',
        say: ['Tu vas dans la Grande Salle ? Prends des potions chez Ysolde. Et rappelle-toi : tu n’es pas seule, Lyra. Même quand tu l’es.'],
      },
      {
        if: () => true,
        say: ['Les Jardins célestes sont à l’est. Orin y avait installé ses plus belles chambres de lumière. Fais attention aux ombres dorées : elles imitent la lumière, mais elles n’ont pas sa chaleur.'],
      },
    ],
  },

  bran_z: {
    name: 'Bran', role: 'Forgeron',
    look: { hair: 'court', hairHex: '#8f6a3a', skinHex: '#c99772', outfit: 'tablier', tunicHex: '#8a5a3a', apronHex: '#6a5a4a', trimHex: '#f0c66b', scale: 1.08, beard: '#8f6a3a' },
    talk: [
      {
        if: (q) => S(q, 'q_porte', 'bran'),
        say: [
          'Ha ! La gamine de la brume ! Tu as grandi. Enfin… tu es montée en grade.',
          'Regarde-moi cet enclume, il est arrivé sans une égratignure. J’ai fondu des morceaux de toutes les îles dans ma forge : fer de l’Aube, éclats de verre de la Forêt… Avec de l’ivoire de la citadelle, je peux te faire des armes dont on parlera longtemps.',
          'Rapporte-moi des éclats d’ivoire, ceux que laissent tomber les créatures d’ici, et la larme de ce qui garde la Grande Salle. Je ferai le reste.',
        ],
        do: [{ step: 'q_porte' }, { flag: 'forge_ouverte' }],
      },
      {
        if: (q) => fini(q),
        say: ['Tu sais quoi ? J’ai forgé ma meilleure lame pendant la dernière semaine, et personne ne s’en servira. C’est ça, la paix : un forgeron qui fait des charrues.', 'Mais si tu veux améliorer ton équipement, je suis là. La forge ne s’éteint plus.'],
        choices: [{ t: 'Améliorer et fabriquer', do: [{ forge: true }] }, { t: 'Voir les marchandises', do: [{ shop: 'bran_z' }] }, { t: 'À bientôt' }],
      },
      {
        if: () => true,
        say: (q) => [q.flag('boss_zenith') ? 'La larme de l’Ombre ! Voilà de quoi pousser tes armes au maximum. Dis-moi ce qu’il te faut.' : 'Le feu est chaud. Éclats d’ivoire, essence de brume : ramène-moi ça et je te forge la Lame du Zénith.'],
        choices: [
          { t: 'Améliorer et fabriquer', do: [{ forge: true }] },
          { t: 'Voir les marchandises', do: [{ shop: 'bran_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  silex_z: {
    name: 'Silex', role: 'Maître verrier',
    look: { hair: 'court', hairHex: '#5a4a3a', skinHex: '#d9ab84', outfit: 'tablier', tunicHex: '#5f9ac8', apronHex: '#e9e2f5', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_verre_z', 'retour'),
        say: ['Six éclats d’ivoire, taillés par la lumière même ! Avec ça, je termine la grande rosace du hall. Et pour toi : un anneau de verre filé. Il portera chance.'],
        do: [{ take: 'eclat_ivoire', n: 6 }, { step: 's_verre_z' }],
      },
      {
        if: (q) => fini(q),
        say: ['La rosace du hall est terminée : six couleurs, une par phare. On a mis le rouge au sud, le vert à l’ouest… Orin aurait dit que le plan n’était pas exact. Il aurait eu tort.'],
        choices: [{ t: 'Voir les marchandises', do: [{ shop: 'silex_z' }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: ['Le verre de la Forêt est beau, mais l’ivoire d’ici chante quand on le frappe. Je n’ai jamais rien travaillé de plus délicat.'],
        choices: [
          { t: 'Voir les marchandises', do: [{ shop: 'silex_z' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_verre_z') === 'none', say: ['Oui : pour la rosace du hall, il me faut six éclats d’ivoire, ceux que perdent les béliers et les statues des Jardins. Je ne peux pas aller les chercher : je tremble devant les ombres.'], do: [{ start: 's_verre_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  ambre_z: {
    name: 'Ambre', role: 'Doyenne de Vitrebourg',
    look: { hair: 'chignon', hairHex: '#e8e2d0', skinHex: '#c99772', outfit: 'aube', cloakHex: '#7fd0c0', tunicHex: '#3f8a86', trimHex: '#f0c66b', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => fini(q),
        say: ['Mes arbres de verre ont repris leurs couleurs. Quand le phare vert s’est rallumé tout à l’heure, toute la forêt a chanté. Je suis fière de toi, petite.'],
      },
      {
        if: (q) => q.flag('boss_zenith'),
        say: ['L’Ombre est vaincue ? Alors il ne reste que le phare. Les couleurs se mélangent comme chez nous : rouge, vert, bleu, puis jaune, magenta, cyan. Aucune n’est de trop.'],
      },
      {
        if: () => true,
        say: ['J’ai quitté Vitrebourg pour la première fois depuis quarante ans. Les portails de lumière sont de beaux vitraux qui voyagent. Orin les aurait aimés.', FIA('Ambre, tu voyages comme une jeune fille !'), 'Flatteuse. Va, les Jardins t’attendent.'],
      },
    ],
  },

  lison_z: {
    name: 'Lison', role: 'Cartographe',
    look: { hair: 'tresse', hairHex: '#d6aa5c', skinHex: '#f6e3d3', outfit: 'tunique', tunicHex: '#c0584a', trimHex: '#f0c66b', scale: 0.96 },
    talk: [
      {
        if: (q) => S(q, 's_eclats_z', 'retour'),
        say: ['Quatre éclats du Zénith ! Mon père aurait fait une danse. Voilà une clé : celle de la bibliothèque d’Orin, que je n’ai jamais pu ouvrir sans les quatre cristaux. Prends aussi une carte à jour.'],
        do: [{ step: 's_eclats_z' }],
      },
      {
        if: (q) => fini(q),
        say: ['J’ai redessiné la carte de l’archipel : les îles sont plus proches qu’avant. J’ai écrit « Provisoire » en haut, parce qu’elles bougent encore un peu. Prends-en un exemplaire.'],
        choices: [{ t: 'Voir les curiosités', do: [{ shop: 'lison_z' }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: (q) => [q.flag('boss_zenith') ? 'Tu as vu sa dernière page, dans les Jardins ? Mon père y parle de six couleurs. Je pleure à chaque fois.' : 'Mon père a écrit une dernière page pour le Zénith. Elle est cachée quelque part dans les Jardins célestes, derrière des roches que seul un marteau brise.'],
        choices: [
          { t: 'Voir les curiosités', do: [{ shop: 'lison_z' }] },
          { t: 'Tu cherches quelque chose ?', if: (q) => q.quest('s_eclats_z') === 'none', say: ['Les quatre éclats de prisme cachés dans la citadelle : dans les salles de portails, dans les Jardins… Mon père les avait cachés pour les reconstituer un jour. Je les cherche depuis que je suis arrivée.'], do: [{ start: 's_eclats_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  mira_z: {
    name: 'Mira', role: 'Allumeuse de lampions',
    look: { hair: 'boucles', hairHex: '#8f3d22', skinHex: '#d9ab84', outfit: 'tunique', tunicHex: '#e8b65a', trimHex: '#f0c66b', scale: 0.92 },
    talk: [
      {
        if: (q) => S(q, 's_lampions_z', 'retour'),
        say: ['Les sept lampions brillent ! Toute la place est dorée. Prends ceci : c’est ma teinte préférée, l’or pâle. Elle ira bien à ta cape.'],
        do: [{ step: 's_lampions_z' }],
      },
      {
        if: (q) => q.quest('s_lampions_z') === 'active',
        say: (q) => [`Lampions rallumés : ${Math.min(7, q.count('lampions'))} sur 7. Ils sont tous sur la place de la Porte. Fia n’a qu’à les effleurer.`],
      },
      {
        if: (q) => fini(q),
        say: ['Tu as vu les phares briller depuis la place ? Six traits de lumière, tous les soirs. Je n’ai plus besoin d’allumer quoi que ce soit : mais je continue, par habitude.'],
      },
      {
        if: () => true,
        say: ['Ici, on dit que la lumière ne s’éteint jamais tout à fait. Moi, je dis qu’elle a besoin d’aide.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_lampions_z') === 'none', say: ['Depuis la Brume, les sept lampions de la place sont éteints. Si Fia pouvait les rallumer, la Porte brillerait enfin comme une vraie porte !'], do: [{ start: 's_lampions_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  aldo_z: {
    name: 'Aldo', role: 'Capitaine de la garde',
    look: { hair: 'court', hairHex: '#9a9aa8', skinHex: '#b98560', outfit: 'chasseur', tunicHex: '#4a5466', trimHex: '#d7dbe8', beard: '#9a9aa8', scale: 1.06 },
    talk: [
      {
        if: (q) => S(q, 's_garde_z', 'retour'),
        say: ['Douze ombres de moins ! Voilà du travail de capitaine. Prends cette teinte ardoise et ces écus : le premier tour de garde est offert.'],
        do: [{ step: 's_garde_z' }],
      },
      {
        if: (q) => q.quest('s_garde_z') === 'active',
        say: ['Douze créatures, pas une de moins. Elles rôdent dans les Jardins célestes, au pied de la Grande Salle. Garde ton bouclier, si tu en as un !'],
      },
      {
        if: (q) => fini(q),
        say: ['Plus un seul Brumelin aux portes. Je m’ennuie. Je vais finir par apprendre le jardinage avec Vesper.'],
      },
      {
        if: () => true,
        say: ['La garde de la Porte, c’est moi et trois sentinelles d’ivoire qui ne parlent pas. Les ombres d’ici sont plus malignes que celles de la Lande : elles imitent la lumière.'],
        choices: [
          { t: 'Une mission pour moi ?', if: (q) => q.quest('s_garde_z') === 'none', say: ['Les ombres dorées et les béliers d’ivoire s’accumulent dans les Jardins. Douze, ce serait un bon début. Reviens me voir quand c’est fait.'], do: [{ start: 's_garde_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  pell_z: {
    name: 'Pell', role: 'Tailleur',
    look: { hair: 'long', hairHex: '#262033', skinHex: '#efd0b4', outfit: 'tunique', tunicHex: '#8a5fb0', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_colis_z', 'pell'),
        say: ['Un colis de Gaspard ? Ah ! Mes aiguilles d’argent ! Je ne savais pas qu’elles voyageaient aussi. Dis-lui que je lui ai laissé quelque chose en retour.'],
        do: [{ take: 'colis_z' }, { give: 'paquet_z' }, { step: 's_colis_z' }],
      },
      {
        if: (q) => fini(q),
        say: ['J’ai cousu une cape tissée de six fils, un par phare. Je l’ai appelée « Lumière partagée ». Elle est à toi, si tu veux la voir en vrai : passe me voir quand tu veux changer d’apparence.'],
        choices: [{ t: 'Changer d’apparence', do: [{ wardrobe: true }] }, { t: 'Voir les marchandises', do: [{ shop: 'pell_z' }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: ['Ici, le tissu est plus léger que partout ailleurs : on dirait de l’air cousu. Je n’ai jamais été aussi inspiré.'],
        choices: [
          { t: 'Changer d’apparence', do: [{ wardrobe: true }] },
          { t: 'Voir les marchandises', do: [{ shop: 'pell_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  ysolde_z: {
    name: 'Ysolde', role: 'Apothicaire',
    look: { hair: 'long', hairHex: '#3f6a4a', skinHex: '#c99772', outfit: 'tablier', tunicHex: '#7fb89a', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 0.98 },
    talk: [
      {
        if: (q) => S(q, 's_colis_z', 'ysolde'),
        say: ['Un paquet pour moi ? De Pell ? Ah, des fils pour mes compresses ! Attends, Gaspard m’a laissé un mot : « Dis à Pell que je lui dois le thé. » Je le lui transmets quand je le croise.'],
        do: [{ take: 'paquet_z' }, { step: 's_colis_z' }],
      },
      {
        if: () => true,
        say: (q) => [q.flag('boss_zenith') ? 'Après un combat pareil, mes meilleurs remèdes. Ambroisie, nectar : tout ce qu’il faut pour tenir.' : 'Potions, élixirs, et dès que tu auras vaincu ce qui garde la Grande Salle, mes préparations de l’ultime.'],
        choices: [{ t: 'Acheter', do: [{ shop: 'ysolde_z' }] }, { t: 'Au revoir' }],
      },
    ],
  },

  gaspard_z: {
    name: 'Gaspard', role: 'Marchand',
    look: { hair: 'court', hairHex: '#8f6a3a', skinHex: '#d9ab84', outfit: 'tunique', tunicHex: '#c9a050', trimHex: '#f0c66b', scale: 1.04, beard: '#8f6a3a' },
    talk: [
      {
        if: (q) => S(q, 's_colis_z', 'retour'),
        say: ['Pell a répondu ? Ysolde a répondu ? Parfait ! Tout le monde est content, personne ne m’a payé, et moi j’ai gagné une amie de plus. Tiens, un peu de ma réserve.'],
        do: [{ step: 's_colis_z' }],
      },
      {
        if: (q) => fini(q),
        say: ['On me demande de vendre des souvenirs de la citadelle. Je n’ai pas de souvenirs : j’ai des clous, des planches, et un million d’histoires.'],
        choices: [{ t: 'Voir les marchandises', do: [{ shop: 'gaspard_z' }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: ['Ça n’a pas été simple de monter tout ça jusqu’ici. Mais un marchand sans marchandises, c’est un homme qui se plaint : je préfère monter.'],
        choices: [
          { t: 'Voir les marchandises', do: [{ shop: 'gaspard_z' }] },
          { t: 'Tu as un travail pour moi ?', if: (q) => q.quest('s_colis_z') === 'none' && q.quest('q_porte') === 'done', say: ['Tu tombes bien : un colis urgent pour Pell. Ensuite, Pell enverra quelque chose à Ysolde. Je n’ai plus de jambes pour tout ça.'], do: [{ give: 'colis_z' }, { start: 's_colis_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  calixte_z: {
    name: 'Calixte', role: 'Passeur',
    look: { hair: 'court', hairHex: '#9a9aa8', skinHex: '#b98560', outfit: 'tunique', tunicHex: '#3f6a8a', trimHex: '#d7dbe8', beard: '#9a9aa8', scale: 1.04 },
    talk: [
      {
        if: (q) => fini(q),
        say: ['Je n’ai jamais autant navigué de ma vie. Depuis que les îles se rapprochent, les routes sont courtes. Où veux-tu aller ?'],
        choices: [
          { t: 'Partir pour l’Île de l’Aube', do: [{ travel: { to: 'aube', zone: 'havre', cell: [15, 15] } }] },
          { t: 'Partir pour la Forêt de Verre', do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [15, 15] } }] },
          { t: 'Pas maintenant' },
        ],
      },
      {
        if: () => true,
        say: ['Ma barque est amarrée au pied de la citadelle. Elle ne retournera pas aux îles tant que le phare du Zénith est éteint : je ne voudrais pas faire demi-tour dans le noir.', 'Mais si tu veux revoir l’Aube ou la Forêt, je t’y mène.'],
        choices: [
          { t: 'Partir pour l’Île de l’Aube', do: [{ travel: { to: 'aube', zone: 'havre', cell: [15, 15] } }] },
          { t: 'Partir pour la Forêt de Verre', do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [15, 15] } }] },
          { t: 'Pas maintenant' },
        ],
      },
    ],
  },

  vesper: {
    name: 'Vesper', role: 'Jardinier de la citadelle',
    look: { hair: 'court', hairHex: '#e8e2d0', skinHex: '#c99772', outfit: 'tunique', tunicHex: '#7fb89a', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 'q_jardins', 'vesper'),
        say: [
          'Une visiteuse ! Je suis Vesper, le dernier jardinier du Zénith. Ne marche pas sur les marguerites d’or, elles repoussent mal.',
          LYRA('Célestine m’a dit que la Grande Salle est au sud.'),
          'Par le grand escalier, derrière la haie. L’ombre qui s’y cache est plus ancienne que mes plantes. Je ne l’ai jamais vue : je n’y suis allé qu’une fois, et j’en suis revenu les cheveux blancs.',
          'Si tu veux de bons soins, cueille les fleurs du ciel. Elles ne poussent que dans la lumière. Elles font les meilleurs nectars.',
        ],
        do: [{ step: 'q_jardins' }],
      },
      {
        if: (q) => S(q, 's_fleurs_z', 'retour'),
        say: ['Quatre fleurs du ciel, intactes ! Je vais en faire un nectar que même Ysolde n’aura pas essayé. Prends ces nectars : tu en auras besoin dans la Grande Salle.'],
        do: [{ take: 'fleur_ciel', n: 4 }, { step: 's_fleurs_z' }],
      },
      {
        if: (q) => fini(q),
        say: ['Le Zénith n’a jamais été aussi beau. Les fleurs se tournent vers le phare maintenant, plus vers le soleil. Je n’ai rien fait : elles ont décidé toutes seules.'],
      },
      {
        if: () => true,
        say: ['Les Jardins célestes ne sont plus ce qu’ils étaient. La lumière y est toujours là, mais il y a trop d’ombres pour les fleurs.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_fleurs_z') === 'none', say: ['Oh oui. Il me faut quatre fleurs du ciel pour mon nectar. Elles poussent aux quatre coins des Jardins. Mais méfie-toi : les ombres adorent les fleurs, elles s’y cachent.'], do: [{ start: 's_fleurs_z' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  oriel: {
    name: 'Oriel', role: 'Aubergiste',
    look: { hair: 'long', hairHex: '#f3e6b8', skinHex: '#f6e3d3', outfit: 'tablier', tunicHex: '#f0c66b', apronHex: '#fbf6ea', trimHex: '#ffffff', scale: 1.0 },
    talk: [
      {
        if: (q) => fini(q),
        say: ['Chaque nuit, je regarde les six lumières de l’archipel depuis ma fenêtre. Un lit pour la championne ? C’est la maison qui offre.'],
        choices: [{ t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: ['Bienvenue à l’Aurore ! Un lit, une soupe de nuages, et la Brume reste dehors.'],
        choices: [{ t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] }, { t: 'Au revoir' }],
      },
    ],
  },
};

/* ---------------------------------------------------------
   Quêtes
   --------------------------------------------------------- */
export const ZENITH_QUESTS = {
  q_porte: {
    kind: 'main', island: 'zenith', act: 6, title: 'La Porte du Zénith', giver: 'celestine',
    summary: 'Tu as atteint la dernière île : la Citadelle du Zénith, blanche et dorée, au-dessus des nuages. Célestine, la gardienne, t’attend sur la place, et les tiens t’y ont précédée.',
    steps: [
      { id: 'parler', type: 'talk', npc: 'celestine', text: 'Parler à Célestine sur la place de la Porte', zone: 'porte' },
      { id: 'selene', type: 'talk', npc: 'selene_z', text: 'Retrouver Séléné près de la fontaine', zone: 'porte' },
      { id: 'bran', type: 'talk', npc: 'bran_z', text: 'Retrouver Bran à son enclume', zone: 'porte' },
    ],
    rewards: { xp: 300, ecus: 150, items: { grande_potion: 2 }, pa: [300, 100] },
  },
  q_jardins: {
    kind: 'main', island: 'zenith', act: 6, title: 'Les Jardins célestes', giver: 'celestine', after: 'q_porte',
    summary: 'Pour gagner la Grande Salle, il faut traverser les salles des portails, puis les Jardins célestes, où un vieux jardinier garde les fleurs de la citadelle.',
    steps: [
      { id: 'portails', type: 'gates', gates: ['zg1', 'zg2', 'zg3'], text: 'Traverser les trois salles des portails (à l’est de la place)', zone: 'jz1' },
      { id: 'jardins', type: 'reach', zone: 'jardins', text: 'Entrer dans les Jardins célestes' },
      { id: 'vesper', type: 'talk', npc: 'vesper', text: 'Parler à Vesper, le jardinier', zone: 'jardins' },
      { id: 'salle', type: 'reach', zone: 'salle', text: 'Descendre le grand escalier jusqu’à la Grande Salle' },
    ],
    rewards: { xp: 500, ecus: 250, items: { nectar: 2, grande_potion: 2 }, pa: [400, 140] },
  },
  q_salle: {
    kind: 'main', island: 'zenith', act: 6, title: 'La Grande Salle', giver: 'celestine', after: 'q_jardins',
    summary: 'Dans la Grande Salle, l’Ombre du Prisme se nourrit de ce qui reste du cristal. Il faut franchir la salle des ombres, celle des portails, trouver la clé de l’arène, puis l’affronter.',
    steps: [
      { id: 'ombres', type: 'gates', gates: ['gs_combat'], text: 'Vaincre les ombres de la salle de gauche et briser le sceau', zone: 'salle' },
      { id: 'portails', type: 'gates', gates: ['gs_light'], text: 'Allumer le cristal jaune de la salle des portails (à droite du hall)', zone: 'salle' },
      { id: 'cle', type: 'item', item: 'cle_salle', n: 1, text: 'Trouver la clé de l’arène', zone: 'salle' },
      { id: 'boss', type: 'flag', flag: 'boss_zenith', text: 'Vaincre l’Ombre du Prisme', zone: 'salle' },
      { id: 'fragment', type: 'item', item: 'eclat_zenith', n: 1, text: 'Prendre le dernier fragment dans le coffre de l’arène', zone: 'salle' },
    ],
    rewards: { xp: 900, ecus: 500, items: { ambroisie: 2 }, pa: [600, 220] },
  },
  q_zenith: {
    kind: 'main', island: 'zenith', act: 6, title: 'Le Phare du Zénith', giver: 'celestine', after: 'q_salle',
    summary: 'Au sud de la Grande Salle, le phare du Zénith attend, avec ses deux balises et ses six couleurs. Il faut le rallumer pour que la lumière passe à nouveau de phare en phare.',
    steps: [
      { id: 'phare', type: 'reach', zone: 'phare_z', text: 'Traverser le pont du Zénith jusqu’au phare' },
      { id: 'd1', type: 'gates', gates: ['ph_d1'], text: 'Ouvrir la première porte du phare (salle de gauche)', zone: 'phare_z' },
      { id: 'd2', type: 'gates', gates: ['ph_d2'], text: 'Ouvrir la deuxième porte (salle du milieu)', zone: 'phare_z' },
      { id: 'six', type: 'gates', gates: ['end'], text: 'Allumer les deux balises : rouge, vert, bleu, jaune, magenta et cyan', zone: 'phare_z' },
    ],
    rewards: { xp: 1200, ecus: 800, items: { grande_potion: 3 }, pa: [800, 300] },
  },
  q_epilogue: {
    kind: 'main', island: 'zenith', act: 6, title: 'Une lumière partagée', giver: 'celestine', after: 'q_zenith',
    summary: 'Le Prisme est reforgé, l’archipel se rassemble. Reste à retrouver Célestine, qui t’attend sur la place de la Porte.',
    steps: [
      { id: 'retour', type: 'talk', npc: 'celestine', text: 'Retrouver Célestine sur la place de la Porte', zone: 'porte' },
    ],
    rewards: { xp: 500, ecus: 500, items: { talisman_zenith: 1 }, unlock: ['teinte_or'], pa: [500, 200] },
  },

  s_lampions_z: {
    kind: 'side', island: 'zenith', title: 'Les lampions de la Porte', giver: 'mira_z', requires: 'q_porte',
    summary: 'Mira voudrait que la place de la Porte brille comme une vraie porte. Fia peut rallumer les sept lampions.',
    steps: [
      { id: 'lampions', type: 'count', what: 'lampions', n: 7, text: 'Rallumer les 7 lampions de la place', zone: 'porte' },
      { id: 'retour', type: 'talk', npc: 'mira_z', text: 'Prévenir Mira', zone: 'porte' },
    ],
    rewards: { xp: 100, ecus: 100, unlock: ['teinte_or'], pa: [60, 25] },
  },
  s_garde_z: {
    kind: 'side', island: 'zenith', title: 'Ménage dans les Jardins', giver: 'aldo_z', requires: 'q_porte',
    summary: 'Le capitaine Aldo veut nettoyer les Jardins célestes des ombres dorées et des béliers d’ivoire.',
    steps: [
      { id: 'chasse', type: 'kill', n: 12, text: 'Vaincre 12 créatures (Jardins célestes)', zone: 'jardins' },
      { id: 'retour', type: 'talk', npc: 'aldo_z', text: 'Faire ton rapport au capitaine Aldo', zone: 'porte' },
    ],
    rewards: { xp: 200, ecus: 200, unlock: ['teinte_ardoise'], pa: [90, 35] },
  },
  s_fleurs_z: {
    kind: 'side', island: 'zenith', title: 'Fleurs du ciel', giver: 'vesper', requires: 'q_porte',
    summary: 'Vesper fabrique un nectar rare avec des fleurs du ciel, qui ne poussent qu’aux quatre coins des Jardins célestes.',
    steps: [
      { id: 'fleurs', type: 'item', item: 'fleur_ciel', n: 4, text: 'Cueillir 4 fleurs du ciel (Jardins célestes)', zone: 'jardins' },
      { id: 'retour', type: 'talk', npc: 'vesper', text: 'Les apporter à Vesper', zone: 'jardins' },
    ],
    rewards: { xp: 150, ecus: 80, items: { nectar: 3, ambroisie: 1 }, pa: [70, 30] },
  },
  s_verre_z: {
    kind: 'side', island: 'zenith', title: 'La rosace de Silex', giver: 'silex_z', requires: 'q_porte',
    summary: 'Silex termine la rosace du hall et lui manquent six éclats d’ivoire, que perdent les créatures des Jardins célestes.',
    steps: [
      { id: 'eclats', type: 'item', item: 'eclat_ivoire', n: 6, text: 'Rapporter 6 éclats d’ivoire', zone: 'jardins' },
      { id: 'retour', type: 'talk', npc: 'silex_z', text: 'Les donner à Silex', zone: 'porte' },
    ],
    rewards: { xp: 160, ecus: 100, items: { anneau_vie: 1 }, pa: [70, 30] },
  },
  s_eclats_z: {
    kind: 'side', island: 'zenith', title: 'Les éclats d’Orin', giver: 'lison_z', requires: 'q_porte',
    summary: 'Orin a caché quatre éclats de prisme dans la citadelle avant de partir. Sa fille Lison voudrait les retrouver.',
    steps: [
      { id: 'eclats', type: 'count', what: 'shards', n: 4, text: 'Trouver 4 éclats de prisme (salles des portails, Jardins, Grande Salle)', zone: 'jz1' },
      { id: 'retour', type: 'talk', npc: 'lison_z', text: 'Les montrer à Lison', zone: 'porte' },
    ],
    rewards: { xp: 220, ecus: 150, items: { fragment_coeur: 1 }, pa: [100, 40] },
  },
  s_colis_z: {
    kind: 'side', island: 'zenith', title: 'Livraison au sommet', giver: 'gaspard_z', requires: 'q_porte',
    summary: 'Un colis pour Pell, un mot pour Ysolde : Gaspard n’a plus de jambes pour tout ça.',
    steps: [
      { id: 'pell', type: 'talk', npc: 'pell_z', text: 'Porter le colis de Gaspard à Pell', zone: 'porte' },
      { id: 'ysolde', type: 'talk', npc: 'ysolde_z', text: 'Apporter le paquet de Pell à Ysolde', zone: 'porte' },
      { id: 'retour', type: 'talk', npc: 'gaspard_z', text: 'Rendre compte à Gaspard', zone: 'porte' },
    ],
    rewards: { xp: 150, ecus: 180, items: { elixir: 2, ambroisie: 1 }, pa: [70, 30] },
  },
};

/* ---------------------------------------------------------
   Objets
   --------------------------------------------------------- */
export const ZENITH_ITEMS = {
  arc_aurore: { cat: 'arme', name: 'Arc d’Aurore', icon: 'sling', rarity: 'epique', wclass: 'distance', dmg: 'percant', atk: 14, rate: 1.55, proj: { speed: 24, range: 18, size: 0.18, color: '#ffe6a0' }, price: 0, sell: 240, model: 'fronde',
    desc: 'Un arc d’ivoire dont la corde est un fil de lumière. Il tire plus loin et plus vite que la fronde.' },
  epee_zenith: { cat: 'arme', name: 'Lame du Zénith', icon: 'sword-aube', rarity: 'legendaire', wclass: 'lame', dmg: 'tranchant', atk: 24, rate: 1.35, reach: 2.45, arc: 2.1, price: 0, sell: 420, model: 'epee_aube', cuts: true, bonus: { brume: 1.4 },
    desc: 'Forgée par Bran avec de l’ivoire de la citadelle et la larme de l’Ombre. Elle blesse la Brume plus que toute autre lame.' },
  marteau_ivoire: { cat: 'arme', name: 'Marteau d’ivoire', icon: 'hammer', rarity: 'epique', wclass: 'lourde', dmg: 'contondant', atk: 36, rate: 0.68, reach: 2.6, arc: 2.7, knock: 3.6, price: 0, sell: 380, model: 'marteau', breaks: true,
    desc: 'Plus léger que le marteau de pierre, aussi dévastateur. Il brise les boucliers d’ivoire d’un seul coup.' },
  armure_zenith: { cat: 'armure', name: 'Armure du Zénith', icon: 'armor-scale', rarity: 'legendaire', def: 14, speed: 0.03, price: 0, sell: 480, desc: 'Des plaques d’ivoire cousues sur de l’or filé. Elle brille quand la lumière est proche.' },
  cape_citadelle: { cat: 'armure', name: 'Cape de la citadelle', icon: 'cloak', rarity: 'epique', def: 10, speed: 0.08, price: 600, sell: 200, desc: 'Une cape blanche brodée d’or. Elle ne pèse rien et ne prend jamais la brume.' },
  anneau_zenith: { cat: 'accessoire', name: 'Anneau du Zénith', icon: 'ring', rarity: 'epique', hp: 25, en: 25, price: 0, sell: 220, desc: '+25 points de vie et +25 énergie maximum.' },
  talisman_zenith: { cat: 'accessoire', name: 'Talisman du Prisme', icon: 'talisman', rarity: 'legendaire', hp: 30, en: 20, resBrume: 0.35, regen: 0.6, price: 0, sell: 400, desc: 'Un éclat du Prisme reforgé, serti d’or. +30 vie, +20 énergie, 35 % de dégâts de Brume en moins.' },
  ambroisie: { cat: 'conso', name: 'Ambroisie', icon: 'potion-big', rarity: 'epique', heal: 180, regen: 25, price: 160, sell: 55, desc: 'Rend 180 points de vie, puis 25 de plus pendant quelques secondes.' },
  nectar: { cat: 'conso', name: 'Nectar du ciel', icon: 'potion-blue', rarity: 'rare', energy: 100, heal: 40, price: 90, sell: 30, desc: 'Rend 100 points d’énergie et 40 points de vie.' },
  eclat_ivoire: { cat: 'materiau', name: 'Éclat d’ivoire', icon: 'shard', rarity: 'rare', price: 60, sell: 24, desc: 'Un éclat de la pierre blanche de la citadelle. Il chante quand on le frappe.' },
  essence_brume: { cat: 'materiau', name: 'Essence de Brume', icon: 'mist', rarity: 'rare', price: 70, sell: 28, desc: 'La brume des ombres d’ici, plus dense que celle de la Lande. Les forgerons s’en arrachent les cheveux.' },
  larme_ombre: { cat: 'materiau', name: 'Larme de l’Ombre', icon: 'tear', rarity: 'legendaire', price: 0, sell: 300, desc: 'Un cristal noir, bordé d’or. Il n’a rien de la chaleur des autres larmes : c’est le regret du Prisme.' },
  fleur_ciel: { cat: 'materiau', name: 'Fleur du ciel', icon: 'flower', rarity: 'rare', price: 0, sell: 0, desc: 'Une fleur d’or pâle qui ne pousse que dans la lumière des Jardins.' },
  cle_salle: { cat: 'quete', name: 'Clé de l’arène', icon: 'key-gold', rarity: 'rare', desc: 'Une grande clé d’ivoire et d’or. Elle ouvre la porte de l’arène, dans la Grande Salle.' },
  eclat_zenith: { cat: 'quete', name: 'Fragment du Zénith', icon: 'shard', rarity: 'legendaire', desc: 'Le dernier éclat du Grand Prisme, blanc comme une aube. Il ne brille pas : il attend.' },
  colis_z: { cat: 'quete', name: 'Colis de Gaspard', icon: 'bag', rarity: 'commun', desc: 'Un paquet ficelé avec soin. « Pour Pell, urgent », a écrit Gaspard, deux fois.' },
  paquet_z: { cat: 'quete', name: 'Paquet de Pell', icon: 'bag', rarity: 'commun', desc: 'Des fils d’argent bien enroulés. Pell les envoie à Ysolde pour ses compresses.' },
};
/* Armes et armures à forger (voir forge dans ui/screens.js : filtre « island ») */
export const ZENITH_RECIPES = {
  epee_zenith: { island: 'zenith', ecus: 900, mats: { eclat_ivoire: 6, larme_ombre: 1, essence_brume: 2 } },
  marteau_ivoire: { island: 'zenith', ecus: 650, mats: { eclat_ivoire: 4, pierre: 4, essence_brume: 1 } },
  armure_zenith: { island: 'zenith', ecus: 800, mats: { eclat_ivoire: 5, essence_brume: 3, fibre: 4 } },
};
/* Quatrième amélioration des armes, troisième des armures */
export const ZENITH_UPGRADES = {
  arme: { ecus: 600, mats: { larme_ombre: 1, eclat_ivoire: 3 }, bonus: 1.3 },
  armure: { ecus: 420, mats: { essence_brume: 2, eclat_ivoire: 2 }, bonus: 7 },
};

/* ---------------------------------------------------------
   Créatures (modèles existants, teintes d’or, d’ivoire et d’ombre)
   --------------------------------------------------------- */
export const ZENITH_ENEMIES = {
  ombre_or: {
    name: 'Ombre dorée', family: 'brume', model: 'brumelin', tint: '#e6c25a', spark: '#fff0a0', hp: 40, atk: 14, def: 0, speed: 3.1, behavior: 'chaser', aggro: 8, leash: 14, radius: 0.45,
    xp: 14, ecus: [3, 8], drops: [['eclat_ivoire', 0.35], ['essence_brume', 0.2]], weak: { lumiere: 1.4 }, resist: {},
    desc: 'Une ombre qui imite la lumière. Elle brille, mais ne réchauffe personne.',
  },
  lanterne_noire: {
    name: 'Lanterne noire', family: 'brume', model: 'lanceur', tint: '#3a2f5a', tintK: 0.9, tintE: 0.8, spark: '#c9a0ff', hp: 44, atk: 15, def: 0, speed: 2.2, behavior: 'ranged', aggro: 11, keep: 6.5, fire: 1.7, proj: 10, leash: 13, radius: 0.5,
    xp: 18, ecus: [4, 9], drops: [['essence_brume', 0.4]], weak: { lumiere: 1.3, tranchant: 1.2 }, resist: {},
    desc: 'Une lanterne qui n’éclaire rien. Elle crache des éclats d’ombre de loin.',
  },
  belier_ivoire: {
    name: 'Bélier d’ivoire', family: 'ivoire', model: 'sanglier', tint: '#f2ead2', spark: '#fff6d8', hp: 92, atk: 22, def: 2, speed: 2.5, charge: 14, behavior: 'charger', aggro: 9, leash: 15, radius: 0.7,
    xp: 28, ecus: [8, 15], drops: [['eclat_ivoire', 0.7], ['pierre', 0.3]], weak: { contondant: 1.4 }, resist: { lumiere: 0.8 },
    desc: 'Un bélier de pierre blanche. Il charge tête baissée : esquive, puis frappe lourd quand il est étourdi.',
  },
  statue_ivoire: {
    name: 'Statue d’ivoire', family: 'ivoire', model: 'gardien', tint: '#f6efd8', spark: '#fff6d8', hp: 170, atk: 26, def: 3, speed: 2.1, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.65,
    xp: 55, ecus: [20, 34], drops: [['eclat_ivoire', 1], ['grande_potion', 0.25]], weak: { contondant: 1.4 }, resist: { percant: 0.6, lumiere: 0.8 },
    desc: 'Une statue de la citadelle, réveillée par la Brume. Son bouclier d’ivoire arrête tout ce qui vient de face.',
  },
  ombre_prisme: {
    name: 'L’Ombre du Prisme', family: 'brume', model: 'colosse', tint: '#f0d890', spark: '#fff0b0', hp: 1100, atk: 26, def: 3, speed: 1.9, behavior: 'boss_zenith', aggro: 13, leash: 40, radius: 1.5, boss: true,
    bossFlag: 'boss_zenith', place: 'La Grande Salle', adds: 'ombre_or',
    xp: 600, ecus: [300, 300], drops: [['larme_ombre', 1]], weak: { lumiere: 1.3 }, resist: { percant: 0.8 },
    desc: 'Le reflet du Grand Prisme, privé de toute couleur. Elle apprend de chacun de tes gestes. Trois fois.',
  },
};

/* ---------------------------------------------------------
   Boutiques
   --------------------------------------------------------- */
export const ZENITH_SHOPS = {
  ysolde_z: {
    name: 'Apothicaire d’Ysolde', buyRate: 0, items: [
      { id: 'potion', stock: 6, restock: 6 },
      { id: 'grande_potion', stock: 4, restock: 4 },
      { id: 'elixir', stock: 4, restock: 4 },
      { id: 'nectar', stock: 3, restock: 3 },
      { id: 'ambroisie', stock: 2, restock: 2, if: (q) => q.flag('boss_zenith') },
    ],
  },
  gaspard_z: {
    name: 'Comptoir de Gaspard', buyRate: 1, items: [
      { id: 'fibre', stock: 8, restock: 5 },
      { id: 'pierre', stock: 6, restock: 4 },
      { id: 'bois', stock: 6, restock: 4 },
      { id: 'eclat_ivoire', stock: 4, restock: 3 },
      { id: 'brume', stock: 2, restock: 2 },
    ],
  },
  bran_z: {
    name: 'Forge de Bran', buyRate: 0, discountFlag: 'forge_remise', items: [
      { id: 'epee_courte', stock: 1, if: (q) => !q.has('epee_aube', 1) && !q.has('epee_courte', 1) && !q.has('epee_verre', 1) },
      { id: 'marteau_ivoire', stock: 1, price: 900, if: (q) => q.quest('q_salle') === 'done' || q.flag('boss_zenith') },
      { id: 'pierre', stock: 5, restock: 3 },
      { id: 'fibre', stock: 5, restock: 3 },
    ],
  },
  silex_z: {
    name: 'Verrerie de Silex', buyRate: 0, items: [
      { id: 'cape_citadelle', stock: 1 },
      { id: 'tunique_vitrail', stock: 1 },
      { id: 'eclat_verre', stock: 3, restock: 2 },
    ],
  },
  pell_z: {
    name: 'Atelier de Pell', buyRate: 0, items: [
      { id: 'cape_exploration', stock: 1 },
      { unlock: 'teinte_pourpre', name: 'Teinte pourpre', icon: 'dye', hex: '#7a3c8f', price: 60, desc: 'Pour la cape (et une bordure rose).' },
      { unlock: 'teinte_turquoise', name: 'Teinte turquoise', icon: 'dye', hex: '#2a9d8f', price: 60, desc: 'Pour la cape.' },
      { unlock: 'teinture_azur', name: 'Teinture azur', icon: 'dye', hex: '#5fa8e8', price: 90, desc: 'Pour les cheveux.' },
      { unlock: 'acc_foulard', name: 'Foulard', icon: 'scarf', price: 70, desc: 'Accessoire.' },
    ],
  },
  lison_z: {
    name: 'Curiosités d’Orin', buyRate: 0, items: [
      { id: 'talisman_brume', stock: 1 },
      { id: 'anneau_vie', stock: 1, price: 320 },
      { id: 'grande_potion', stock: 2, restock: 2 },
    ],
  },
};
