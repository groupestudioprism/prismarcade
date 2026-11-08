/* =========================================================
   LUMEN — personnages et dialogues.
   Un PNJ parle du premier sujet (talk) dont la condition « if » est vraie.
   Conditions : fonctions (q) => booléen, avec
     q.flag(id) · q.quest(id) → 'none' | 'active' | 'done' · q.step(id) → étape en cours
     q.has(objet, n) · q.count('pages' | 'lampions' | 'shards' | 'kills')
   Répliques : texte (le PNJ parle) ou { who: 'fia' | 'lyra', t: '…' }.
   Effets (do) : start, step, give, take, ecus, flag, open, shop, forge, wardrobe, rest,
                 unlock, teach, equip, heal.
   ========================================================= */

const S = (q, id, st) => q.quest(id) === 'active' && q.step(id) === st;
const FIA = (t) => ({ who: 'fia', t });
const LYRA = (t) => ({ who: 'lyra', t });

export const NPCS = {
  /* ---------------- Séléné, gardienne du phare ---------------- */
  selene: {
    name: 'Séléné', role: 'Gardienne du phare',
    look: { hair: 'chignon', hairHex: '#d9d5e6', skinHex: '#efd0b4', outfit: 'aube', cloakHex: '#e9e2f5', tunicHex: '#c9b8e8', trimHex: '#f0c66b', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_reveil', 'parler'),
        say: [
          'Te voilà debout. La barque t’a déposée sur la grève à l’aube, endormie, avec cette petite lumière posée sur l’épaule.',
          FIA('Bonjour ! Moi, c’est Fia. Et elle, c’est Lyra. Elle ne se souvient de rien, mais moi je me souviens de tout. Enfin… de presque tout.'),
          'Une Lueur qui parle… Il n’y en a plus eu depuis le temps d’Orin. Écoute-moi bien, Lyra : la Brume a éteint le phare de l’Aube. Sans lui, les îles dérivent et se perdent.',
          'Les cristaux du Rivage, à l’est, dorment encore. Les lanternes s’orientent à la main ; tourne-les pour guider la lumière jusqu’aux cristaux.',
          'Et prends ce bâton. Les Brumelins rôdent jusque dans la lande, au sud. Il ne coupe rien, mais il frappe juste.',
        ],
        do: [{ step: 'q_reveil' }, { give: 'baton' }, { equip: 'baton' }, { give: 'veste_voyage' }, { equip: 'veste_voyage' }, { open: 'b_rivage' }, { open: 'b_lande' }],
      },
      {
        if: (q) => S(q, 'q_reveil', 'rivage'),
        say: ['Le pont du Rivage est à l’est de la grand-rue. Approche-toi d’une lanterne et tourne-la : la lumière fera le reste.', FIA('On y va ? J’adore les cristaux. Ils chantent quand ils s’allument.')],
      },
      {
        if: (q) => S(q, 'q_reveil', 'retour'),
        say: [
          'Je l’ai vu d’ici : deux éclairs dorés au-dessus du Rivage. Tu as le don, Lyra. Ou c’est Fia qui l’a.',
          FIA('C’est nous deux. Et j’ai appris un truc : si je tourne très vite autour de Lyra, ça fait une onde de lumière qui repousse la brume !'),
          'Une Onde de lumière… Utilise-la avec sagesse, elle épuise ton énergie.',
          'Mais il y a pire. La Lentille d’Aube, le cœur du phare, a disparu la nuit où la Brume est venue. Une ombre énorme l’a emportée vers le Sanctuaire, au sud de la Lande.',
          'Un bâton ne suffira pas contre ce qui la garde. Va voir Bran, à la forge. Dis-lui que c’est moi qui t’envoie.',
        ],
        do: [{ step: 'q_reveil' }, { teach: 'onde' }, { start: 'q_lentille' }],
      },
      {
        if: (q) => q.quest('q_lentille') === 'active' && q.step('q_lentille') !== 'retour',
        say: ['Le Sanctuaire de Brume se trouve tout au sud de la Lande des Ronces, derrière la grande haie. Bran saura t’armer.', 'Repose-toi à l’auberge si tu es blessée : Maëlle veille sur les voyageurs.'],
      },
      {
        if: (q) => S(q, 'q_lentille', 'retour'),
        say: [
          LYRA('Séléné… la voici. La Lentille d’Aube.'),
          'Elle est intacte ! Tu as vaincu le Colosse… Orin lui-même n’aurait pas cru ça possible.',
          'Le phare est au bout du cap, au-delà des Jardins suspendus et des Ruines. Les cristaux y sont plus capricieux : prismes, relais, lumières de couleur.',
          'Pose la Lentille à l’entrée du phare, puis rallume-le. Rouge, vert et bleu, ensemble.',
        ],
        do: [{ step: 'q_lentille' }, { start: 'q_phare' }],
      },
      {
        if: (q) => q.quest('q_phare') === 'active' && q.step('q_phare') !== 'retour',
        say: ['Les Jardins suspendus commencent au sud du Rivage. Un prisme y sépare la lumière en trois couleurs : rouge à gauche, vert tout droit, bleu à droite.', FIA('Comme un arc-en-ciel coupé en morceaux !')],
      },
      {
        if: (q) => S(q, 'q_phare', 'retour'),
        say: [
          'Regarde le ciel, Lyra. Rose et or, comme au premier matin. Le phare de l’Aube brille à nouveau.',
          'Un éclat rouge du Grand Prisme flotte au-dessus de la flamme. Il pointe vers l’ouest… vers la Forêt de Verre.',
          'Cette robe était celle des gardiens du phare. Elle te revient.',
          FIA('La Forêt de Verre ! Il paraît que les arbres y sonnent comme des cloches quand le vent passe.'),
          'Repose-toi d’abord. La route vers les autres îles s’ouvrira bientôt.',
        ],
        do: [{ step: 'q_phare' }, { flag: 'acte1_fini' }],
      },
      {
        if: () => true,
        say: ['Le vent tourne, Lyra. Que veux-tu savoir ?'],
        choices: [
          { t: 'Parle-moi du phare', say: ['Orin l’a construit avec les siens, il y a quarante ans. Quand le Grand Prisme l’a touché la première fois, toute l’île est devenue rose. Depuis, il garde les îles ensemble.'] },
          { t: 'Qui était Orin ?', say: ['Un cartographe. Le plus curieux de nous tous. Il a voulu une lumière si forte qu’elle retiendrait toutes les îles… et puis il est parti. Sa fille, Lison, l’attend toujours devant sa maison.'] },
          { t: 'Qu’est-ce que la Brume ?', say: ['Personne ne le sait vraiment. Elle éteint ce qui brille. Ses créatures ont peur de la lumière, mais pas des bâtons.', FIA('Moi j’ai pas peur d’elle. Enfin, un peu.')] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Bran, forgeron ---------------- */
  bran: {
    name: 'Bran', role: 'Forgeron',
    look: { hair: 'court', hairHex: '#3a2a22', skinHex: '#c99772', outfit: 'tablier', tunicHex: '#7a5a48', apronHex: '#4a3a33', trimHex: '#c9805a', beard: '#3a2a22', scale: 1.08 },
    talk: [
      {
        if: (q) => S(q, 'q_lentille', 'bran'),
        say: [
          'Séléné t’envoie ? Alors c’est sérieux. Une vraie lame, hein… Je peux forger ça.',
          'Mais pour qu’elle morde la brume, il faut la tremper dans la brume elle-même. Rapporte-moi trois gouttes de brume condensée. Les Brumelins de la Lande en lâchent quand on les dissipe.',
        ],
        do: [{ step: 'q_lentille' }],
      },
      {
        if: (q) => S(q, 'q_lentille', 'brume'),
        say: ['Trois brumes condensées, pas une de moins. La Lande est au sud du village. Et esquive quand ils te sautent dessus : un Brumelin, ça mord.'],
        choices: [{ t: 'Voir les marchandises', do: [{ shop: 'bran' }] }, { t: 'À plus tard' }],
      },
      {
        if: (q) => S(q, 'q_lentille', 'forge'),
        say: [
          'Ha ! Tu les as. Donne. … Regarde comme le métal boit la brume.',
          'Voilà l’Épée de l’Aube. Elle tranche les ronces comme du pain et les créatures de brume la craignent. La grande haie de la Lande ne t’arrêtera plus.',
        ],
        do: [{ take: 'brume', n: 3 }, { give: 'epee_aube' }, { equip: 'epee_aube' }, { step: 'q_lentille' }, { flag: 'forge_ouverte' }],
      },
      {
        if: (q) => S(q, 's_marteau', 'retour'),
        say: ['Mon marteau ! Je l’aurais reconnu entre mille. Tiens, pour la peine, prends ces pierres… et reviens me voir quand tu veux améliorer tes armes. Pour toi, c’est le meilleur prix.'],
        do: [{ take: 'marteau_bran', n: 1 }, { step: 's_marteau' }, { flag: 'forge_remise' }],
      },
      {
        if: () => true,
        say: (q) => [q.flag('forge_ouverte') ? 'Le feu est chaud. Qu’est-ce que je peux faire pour toi ?' : 'Bienvenue à la forge. Je vends des lames et des vestes solides.'],
        choices: [
          { t: 'Améliorer mon équipement', if: (q) => q.flag('forge_ouverte'), do: [{ forge: true }] },
          { t: 'Voir les marchandises', do: [{ shop: 'bran' }] },
          { t: 'Tu as l’air soucieux…', if: (q) => q.quest('s_marteau') === 'none' && q.flag('forge_ouverte'), say: ['J’ai perdu mon vieux marteau de forge en courant après un sanglier, dans la Lande. Il a roulé dans un recoin, à l’est, gardé par des ronces vivantes. Si tu le retrouves…'], do: [{ start: 's_marteau' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Ysolde, apothicaire ---------------- */
  ysolde: {
    name: 'Ysolde', role: 'Apothicaire',
    look: { hair: 'long', hairHex: '#2a2230', skinHex: '#8d5b3e', outfit: 'robe', tunicHex: '#3f7d5f', trimHex: '#d7dbe8', acc: 'lunettes', scale: 0.98 },
    talk: [
      {
        if: (q) => S(q, 's_ysolde', 'retour'),
        say: ['Cinq ! Parfaites, elles tremblent encore. Avec ça, je pourrai préparer des grandes potions. Tiens, les premières sont pour toi.'],
        do: [{ take: 'brume', n: 5 }, { step: 's_ysolde' }, { flag: 'ysolde_plus' }],
      },
      {
        if: () => true,
        say: (q) => [q.flag('ysolde_plus') ? 'Potions, élixirs, et maintenant de grandes potions. Que te faut-il ?' : 'Potions et élixirs, tout frais. Une piqûre de ronce ? Une morsure de Brumelin ? J’ai ce qu’il faut.'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'ysolde' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_ysolde') === 'none', say: ['Justement… J’aimerais étudier la brume condensée. Cinq gouttes devraient suffire. On en trouve sur les créatures de la Lande.'], do: [{ start: 's_ysolde' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Pell, tailleur ---------------- */
  pell: {
    name: 'Pell', role: 'Tailleur ambulant',
    look: { hair: 'boucles', hairHex: '#8f3d22', skinHex: '#efd0b4', outfit: 'exploratrice', cloakHex: '#e58fb8', tunicHex: '#f3e6c8', trimHex: '#f0c66b', acc: 'foulard', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_prisme', 'retour'),
        say: ['Huit éclats ! Regarde comme ils jettent des couleurs sur le tissu… Laisse-moi une nuit. Voilà : une étoffe prismatique. Et une teinture azur, pour aller avec.'],
        do: [{ step: 's_prisme' }],
      },
      {
        if: () => true,
        say: ['Tissus de l’archipel, teintures rares, et un miroir pour essayer. Une nouvelle allure, voyageuse ?'],
        choices: [
          { t: 'Changer d’apparence', do: [{ wardrobe: true }] },
          { t: 'Acheter', do: [{ shop: 'pell' }] },
          { t: 'Une idée de tenue ?', if: (q) => q.quest('s_prisme') === 'none', say: ['J’en rêve depuis des années : une étoffe tissée de lumière. Avec huit éclats du Grand Prisme, je pourrais essayer. On en trouve un peu partout sur l’île, surtout là où la lumière dort.'], do: [{ start: 's_prisme' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Gaspard, marchand de ressources ---------------- */
  gaspard: {
    name: 'Gaspard', role: 'Pêcheur de nuages',
    look: { hair: 'court', hairHex: '#cfcbe0', skinHex: '#d9ab84', outfit: 'tunique', tunicHex: '#c9965a', trimHex: '#6b4a3a', beard: '#d9d5e6', hat: 'chapeau', scale: 0.96 },
    talk: [
      {
        if: () => true,
        say: (q) => [q.quest('q_lentille') === 'done' ? 'La pêche est bonne depuis que la Lentille est revenue. J’ai même reçu des bottes de l’île du Vent !' : 'J’achète et je vends tout ce que la lande donne : fibres, pierres, brume… Les nuages, eux, ne se vendent pas. Hélas.'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'gaspard' }] },
          { t: 'Vendre', do: [{ shop: 'gaspard', sell: true }] },
          { t: 'Pêcheur de nuages ?', say: ['Avant la Brume, je pêchais des nuages au filet pour en tirer de l’eau douce. Maintenant ils sont pleins de brume. Un jour, peut-être…', FIA('On pourrait l’aider, plus tard ?')] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Tobias, enfant ---------------- */
  tobias: {
    name: 'Tobias', role: 'Enfant du village',
    look: { hair: 'court', hairHex: '#d6aa5c', skinHex: '#f6e3d3', outfit: 'tunique', tunicHex: '#5f8fd0', trimHex: '#f0c66b', scale: 0.72 },
    talk: [
      {
        if: (q) => S(q, 's_pendentif', 'retour'),
        say: ['MON PENDENTIF ! Tu l’as trouvé ! Tiens, je te donne ma plus belle plume. Elle vient d’un oiseau de l’aube, c’est très rare.', FIA('Elle va trop bien avec ta capuche !')],
        do: [{ take: 'pendentif', n: 1 }, { step: 's_pendentif' }],
      },
      {
        if: (q) => q.quest('s_pendentif') === 'active',
        say: ['La pie l’a lâché près du puits, j’en suis sûr ! Mais il y a des ronces partout… Il faudrait une vraie épée.'],
      },
      {
        if: (q) => q.quest('s_pendentif') === 'none',
        say: ['Tu es la fille de la barque ? Tu peux m’aider ? Une pie m’a volé mon pendentif ! Elle l’a laissé tomber derrière les ronces, près du puits, à l’est.'],
        do: [{ start: 's_pendentif' }],
      },
      { if: () => true, say: ['Quand je serai grand, je serai gardien du phare. Ou forgeron. Ou pêcheur de nuages !'] },
    ],
  },

  /* ---------------- Lison, fille d'Orin ---------------- */
  lison: {
    name: 'Lison', role: 'Fille d’Orin',
    look: { hair: 'tresse', hairHex: '#262033', skinHex: '#efd0b4', outfit: 'voyage', cloakHex: '#2f7d5b', tunicHex: '#e9dcc2', trimHex: '#d7dbe8', hood: false, scale: 0.95 },
    talk: [
      {
        if: (q) => S(q, 's_pages', 'retour'),
        say: [
          'Ce sont bien ses pages… son écriture penchée, ses taches d’encre. Merci, Lyra.',
          'Il parle d’une ombre derrière le Prisme… et il me demande de garder le phare allumé.',
          'Prends cette clé. C’est celle de sa maison. Il y a un bureau, des cartes… Moi, je n’ai jamais eu le courage d’entrer. Toi, tu sauras quoi en faire.',
        ],
        do: [{ step: 's_pages' }],
      },
      {
        if: (q) => q.quest('s_pages') === 'active',
        say: (q) => [`Tu en as trouvé ${q.count('pages')} sur 3. Mon père cachait toujours ses écrits là où la lumière dort : derrière les passages secrets, au fond des chambres de cristal.`],
      },
      {
        if: (q) => q.quest('s_pages') === 'none',
        say: ['Mon père, Orin, est parti il y a dix ans. Il a laissé des pages de son journal dans les chambres secrètes de l’île, je le sais. Si tu en trouves, rapporte-les-moi, je t’en prie.'],
        do: [{ start: 's_pages' }],
      },
      {
        if: () => true,
        say: ['La maison de mon père est à toi tant que tu en as besoin. Et si tu cherches des objets rares, j’ai gardé quelques trouvailles de ses voyages.'],
        choices: [{ t: 'Voir les curiosités', do: [{ shop: 'lison' }] }, { t: 'Au revoir' }],
      },
    ],
  },

  /* ---------------- Mira, villageoise ---------------- */
  mira: {
    name: 'Mira', role: 'Allumeuse de lampions',
    look: { hair: 'carre', hairHex: '#ea8fb8', skinHex: '#a8714d', outfit: 'robe', tunicHex: '#f6a5c8', trimHex: '#f0c66b', scale: 0.97 },
    talk: [
      {
        if: (q) => S(q, 's_lampions', 'retour'),
        say: ['Les sept ! Havre-Aube n’a pas été aussi lumineux depuis des années. Prends cette teinture or pâle : elle ira bien à ta cape.'],
        do: [{ step: 's_lampions' }],
      },
      {
        if: (q) => q.quest('s_lampions') === 'active',
        say: (q) => [`${q.count('lampions')} lampion${q.count('lampions') > 1 ? 's' : ''} sur 7. Ils sont le long des rues, du marché jusqu’à la sortie sud.`],
      },
      {
        if: (q) => q.quest('s_lampions') === 'none' && q.quest('q_reveil') !== 'none' && q.step('q_reveil') !== 'parler',
        say: ['C’est toi, la voyageuse à la Lueur ? Depuis la Brume, mes lampions refusent de s’allumer. Mais ta petite amie lumineuse, elle, pourrait peut-être…', FIA('Je peux ! Je peux !')],
        do: [{ start: 's_lampions' }],
      },
      { if: () => true, say: ['Bonjour, voyageuse. Séléné t’attend sur la place.'] },
    ],
  },

  /* ---------------- Aldo, capitaine de la garde ---------------- */
  aldo: {
    name: 'Aldo', role: 'Capitaine de la garde',
    look: { hair: 'court', hairHex: '#5b3a2b', skinHex: '#d9ab84', outfit: 'armure', tunicHex: '#4a5466', trimHex: '#d7dbe8', hat: 'casque', scale: 1.05 },
    talk: [
      {
        if: (q) => S(q, 's_chasse', 'retour'),
        say: ['Douze ! La lande respire mieux. Prends cette tenue : c’est celle des chasseurs de brume. Tu l’as méritée.'],
        do: [{ step: 's_chasse' }],
      },
      {
        if: (q) => q.quest('s_chasse') === 'active',
        say: (q) => [`Créatures vaincues : ${Math.min(12, q.count('kills'))} sur 12. Continue, et pense à esquiver : un bon pas de côté vaut mieux qu’une potion.`],
      },
      {
        if: (q) => q.quest('s_chasse') === 'none' && q.has('baton', 1),
        say: ['Halte ! Ah, c’est toi. La Lande est infestée. Si tu as le cœur solide, aide-moi à la nettoyer : douze créatures, et je te fais chasseur de brume.', 'Conseil de vieux soldat : esquive (Espace) au dernier moment, puis frappe. Et garde une potion sous la main (F).'],
        do: [{ start: 's_chasse' }],
      },
      { if: () => true, say: ['La Lande des Ronces commence ici. Sans arme, je ne te laisse pas passer… enfin, je ne peux pas t’en empêcher, mais je te le déconseille.'] },
    ],
  },

  /* ---------------- Maëlle, aubergiste ---------------- */
  maelle: {
    name: 'Maëlle', role: 'Aubergiste',
    look: { hair: 'chignon', hairHex: '#8f3d22', skinHex: '#f6e3d3', outfit: 'tablier', tunicHex: '#c97a5a', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_pain', 'retour'),
        say: ['Des fleurs de miel ! Et bien dorées. Attends… Voilà, trois pains tout chauds. Et cette couronne, je l’ai tressée avec les fleurs qui restaient.'],
        do: [{ take: 'fleur_miel', n: 3 }, { step: 's_pain' }],
      },
      {
        if: () => true,
        say: (q) => [q.quest('q_reveil') === 'active' && q.step('q_reveil') === 'parler' ? 'Bien dormi ? Séléné t’attend sur la place, près de la fontaine.' : 'Bienvenue au Lampion ! Un lit chaud, une soupe, et la brume reste dehors.'],
        choices: [
          { t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] },
          { t: 'Tu as l’air embêtée…', if: (q) => q.quest('s_pain') === 'none', say: ['Mon pain au miel… plus une seule fleur de miel ! Il en pousse dans la Lande, entre les ronces. Trois suffiraient.'], do: [{ start: 's_pain' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Havre-Aube : le passeur vers la Forêt de Verre ---------------- */
  calixte: {
    name: 'Calixte', role: 'Passeur',
    look: { hair: 'court', hairHex: '#9a9aa8', skinHex: '#b98560', outfit: 'tunique', tunicHex: '#3f6a8a', trimHex: '#d7dbe8', beard: '#9a9aa8', scale: 1.04 },
    talk: [
      {
        if: (q) => !q.flag('acte1_fini'),
        say: ['Ma barque est amarrée là, mais je ne quitte pas le port tant que le phare est éteint. Rallume-le, et je te mènerai où tu voudras.'],
      },
      {
        if: () => true,
        say: ['Le phare brille ! Pour la première fois depuis longtemps, je vois la route : au sud-est, une île couverte d’arbres de verre. La Forêt de Verre. Je t’y emmène quand tu veux.'],
        choices: [
          { t: 'Partir pour la Forêt de Verre', do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [12, 7] } }] },
          { t: 'Pas maintenant' },
        ],
      },
    ],
  },

  /* ---------------- Forêt de Verre ---------------- */
  ambre: {
    name: 'Ambre', role: 'Doyenne de Vitrebourg',
    look: { hair: 'chignon', hairHex: '#e8e2d0', skinHex: '#c99772', outfit: 'aube', cloakHex: '#7fd0c0', tunicHex: '#3f8a86', trimHex: '#f0c66b', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_verre', 'parler'),
        say: [
          'Une barque venue de l’Aube… Alors le phare brille de nouveau. Je m’appelle Ambre, et je garde Vitrebourg depuis qu’Orin nous a quittés.',
          FIA('Ici, les arbres sont en verre ! Regarde comme ils renvoient mes couleurs !'),
          'Ils étaient plus beaux avant la Brume. Le Temple de Verre, au sud, filtrait la lumière du soleil à travers ses vitraux. Maintenant, il ne laisse plus passer que du gris.',
          'Chez nous, on apprend les couleurs avant de savoir lire. Un vitrail ne laisse passer que sa propre couleur. Rouge, vert et bleu mélangés donnent le blanc ; deux d’entre eux donnent le jaune, le magenta ou le cyan.',
          'À l’est du village, trois salles de vitraux te l’apprendront. Quand tu auras réussi, la route de la Lisière te sera ouverte. Le Temple, lui, demande une vraie lame pour couper les ronces cristallines.',
        ],
        do: [{ step: 'q_verre' }, { open: 'b_vitres' }, { open: 'b_lisiere' }],
      },
      {
        if: (q) => S(q, 'q_verre', 'vitraux'),
        say: ['Les salles de vitraux sont à l’est, au bout de la grand-rue. Un vitrail jaune transforme la lumière blanche en jaune. Le relais à anneaux, lui, mélange ce qu’il reçoit.', FIA('Rouge plus vert, ça fait jaune ! Je le savais déjà. Presque.')],
      },
      {
        if: (q) => q.quest('q_verre') === 'active' && !q.flag('boss_verre'),
        say: ['Le Temple de Verre est au sud, après la Lisière. Un Gardien de verre protège ce qu’il reste du fragment du Prisme. Prends de bonnes potions : Opaline en vend.', 'Les créatures de verre craignent les coups lourds. Un marteau, ou une lame bien trempée.'],
      },
      {
        if: (q) => S(q, 'q_verre', 'retour'),
        say: [
          LYRA('Le Gardien est brisé… et voici ce qu’il gardait.'),
          'Un fragment vert du Grand Prisme ! Il y a des siècles, il éclairait tout le temple. Depuis qu’il a disparu, nos vitraux n’ont plus de couleur.',
          'Il reste le Phare de Verre. Il se dresse au bout de la Canopée, tout là-haut, et il ne s’allume que si on lui donne le jaune, le magenta et le cyan en même temps. Trois lumières qui acceptent de brûler ensemble.',
          'Pour monter, il faut un grappin de lumière. Orin en avait dessiné les plans, et Silex, le maître verrier, les garde dans son atelier. Dis-lui que c’est moi qui t’envoie.',
          FIA('Un grappin ! On va voler d’arbre en arbre ! Enfin… de poteau en poteau.'),
        ],
        do: [{ take: 'prisme_vert', n: 1 }, { step: 'q_verre' }, { flag: 'verre_fini' }],
      },
      {
        if: (q) => S(q, 'q_phare_verre', 'retour'),
        say: [
          LYRA('Le Phare de Verre brille, Ambre. Les trois couleurs tiennent ensemble.'),
          'Je l’ai vu depuis la place : une colonne de lumière blanche, puis tout le verre de la forêt qui reprend ses couleurs, branche après branche. Cent ans que je n’avais pas vu ça.',
          'Orin disait que la lumière partagée valait mieux qu’une lumière seule. Je crois que je comprends enfin ce qu’il voulait dire.',
          FIA('Et là-haut, dans la colonne, il y a une route de lumière qui file vers le sud-est. Quelque chose de doré, tout au bout.'),
          'Le Désert des Échos… Le chemin n’est pas encore sûr, Lyra, et la lumière d’un phare ne remplace pas une bonne nuit. Repose-toi à la Rosée. Vitrebourg te doit bien ça.',
        ],
        do: [{ step: 'q_phare_verre' }, { flag: 'acte2_fini' }],
      },
      {
        if: (q) => S(q, 'q_phare_verre', 'silex') || S(q, 'q_phare_verre', 'eclats') || S(q, 'q_phare_verre', 'forge'),
        say: ['Silex t’attend à la verrerie. Il lui faut cinq éclats de verre pour forger le grappin : les créatures de la Lisière en laissent, et Galet en vend si tu es pressée.'],
      },
      {
        if: (q) => q.quest('q_phare_verre') === 'active',
        say: ['Le pont du Belvédère descend vers la Canopée, au sud. Là-haut, les poteaux de verre se répondent deux par deux. Tourne-toi vers celui d’en face, et laisse le câble faire le reste.', 'Le Phare est tout au bout. Il aime la patience : ses trois couleurs viennent de trois salles, et les portes ne s’ouvrent qu’une à une.'],
      },
      {
        if: (q) => q.quest('q_phare_verre') === 'done',
        say: ['Regarde-moi ça : les arbres reprennent leurs couleurs. Le Phare de Verre veille de nouveau sur la forêt, et c’est toi qui l’as rallumé.', 'La route vers le sud-est n’est pas encore ouverte, mais Vitrebourg t’attendra toujours. Les graines de la Canopée, la livraison de Galet… il reste de quoi t’occuper, si tu veux.'],
      },
      {
        if: () => true,
        say: ['Vitrebourg te remercie. Le belvédère, tout au bout des salles de vitraux, est ouvert : de là, un pont descend vers la Canopée.'],
      },
    ],
  },

  opaline: {
    name: 'Opaline', role: 'Apothicaire',
    look: { hair: 'long', hairHex: '#d9eef0', skinHex: '#efd0b4', outfit: 'robe', tunicHex: '#5fc9b8', trimHex: '#d7dbe8', acc: 'lunettes', scale: 0.98 },
    talk: [
      {
        if: (q) => S(q, 's_givre', 'retour'),
        say: ['Quatre ! Bien froids, bien frais. Laisse-moi infuser… Voilà : trois tisanes de givre pour toi.'],
        do: [{ take: 'givre_foret', n: 4 }, { step: 's_givre' }],
      },
      {
        if: () => true,
        say: ['Potions, élixirs et tisanes, tout est frais ici. Qu’est-ce qui te ferait plaisir ?'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'opaline' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_givre') === 'none', say: ['Justement ! Il me faut quatre givres de sous-bois, ces fleurs transparentes de la Lisière. Elles font la meilleure tisane du monde.'], do: [{ start: 's_givre' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  galet: {
    name: 'Galet', role: 'Marchand',
    look: { hair: 'boucles', hairHex: '#3a2a22', skinHex: '#8d5b3e', outfit: 'exploratrice', cloakHex: '#e8b65a', tunicHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_colis', 'retour'),
        say: ['Perle l’a reçu ? Et Ficus aussi ? Ha ! Vitrebourg tourne mieux depuis que tu as des jambes. Tiens : de quoi te remettre en forme, et quelques écus pour la peine.'],
        do: [{ step: 's_colis' }],
      },
      {
        if: (q) => q.quest('s_colis') === 'active',
        say: ['Le colis est pour Perle, la souffleuse de verre, près de sa maison. Elle te dira quoi faire du reste. Ne le secoue pas : ça tinte.'],
      },
      {
        if: () => true,
        say: ['Éclats, givre, fibre, bois : j’achète, je vends. Un éclat de verre, ça se revend toujours, surtout à Silex.'],
        choices: [
          { t: 'Acheter et vendre', do: [{ shop: 'galet', sell: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_colis') === 'none', say: ['Tu tombes bien ! J’ai un colis qui devait partir hier, et je ne peux pas quitter l’étal : les clients passent en coup de vent. Va le porter à Perle, veux-tu ?'], do: [{ start: 's_colis' }, { give: 'colis_galet' }] },
          { t: 'À plus tard' },
        ],
      },
    ],
  },

  silex: {
    name: 'Silex', role: 'Maître verrier',
    look: { hair: 'court', hairHex: '#2a2230', skinHex: '#c99772', outfit: 'tablier', tunicHex: '#3f6a8a', apronHex: '#d9d4e3', trimHex: '#7fd0c0', beard: '#2a2230', scale: 1.08 },
    talk: [
      {
        if: (q) => S(q, 'q_phare_verre', 'silex'),
        say: [
          'Ambre t’envoie ? Alors tu veux monter au Phare. Les plans d’Orin sont là, sous la presse à vitrail : un grappin de lumière. Un câble de lumière solidifié autour d’un éclat de verre, et des poteaux taillés pour l’accueillir.',
          FIA('Des poteaux ? Comme ceux qui dépassent des arbres, là-haut, au bord des vides ?'),
          'Exactement. Deux poteaux se font face de chaque côté d’un vide. Tu te places à côté de l’un, tournée vers l’autre, et le câble te tire jusqu’à l’autre rive. Simple. Il me faut cinq éclats de verre pour le forger : les créatures de la Lisière en laissent, et Galet en vend.',
        ],
        do: [{ step: 'q_phare_verre' }],
      },
      {
        if: (q) => S(q, 'q_phare_verre', 'eclats'),
        say: (q) => [`Il me faut cinq éclats de verre pour le grappin. Tu en as ${Math.min(5, q.count('eclats'))} sur 5. Les créatures de la Lisière en laissent, et Galet en vend si tu es pressée.`],
      },
      {
        if: (q) => S(q, 'q_phare_verre', 'forge'),
        say: [
          'Cinq éclats, bien clairs. Laisse-moi chauffer le verre… Voilà.',
          'Un grappin de lumière, tel que le dessinait Orin. Mode d’emploi : un poteau de verre, un vide, un autre poteau. Tiens-toi à côté du premier, tournée vers le second, et agis. Le poteau d’en face te ramènera aussi.',
          'Le pont au sud du Belvédère est ouvert. Bonne ascension, et ne regarde pas en bas.',
        ],
        do: [{ take: 'eclat_verre', n: 5 }, { give: 'grappin' }, { open: 'b_canopee' }, { step: 'q_phare_verre' }],
      },
      {
        if: (q) => S(q, 's_eclats', 'retour'),
        say: ['Six éclats, pas un de fêlé ! Avec ça, ma commande est prête. Et pour toi, une teinte émeraude pour ta cape : le vert de nos arbres.'],
        do: [{ take: 'eclat_verre', n: 6 }, { step: 's_eclats' }],
      },
      {
        if: () => true,
        say: ['Le verre se souffle, se taille, se trempe. Que veux-tu ?'],
        choices: [
          { t: 'Voir les marchandises', do: [{ shop: 'silex' }] },
          { t: 'Améliorer mon équipement', do: [{ forge: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_eclats') === 'none', say: ['Oui : une grosse commande pour le belvédère, mais je n’ai plus d’éclats. Les créatures de la Lisière en laissent. Six, ce serait parfait.'], do: [{ start: 's_eclats' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  perle: {
    name: 'Perle', role: 'Souffleuse de verre',
    look: { hair: 'chignon', hairHex: '#2f5f7a', skinHex: '#f6e3d3', outfit: 'tablier', tunicHex: '#7fd0c0', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 0.96 },
    talk: [
      {
        if: (q) => S(q, 's_colis', 'perle'),
        say: ['Le colis de Galet ! Enfin. C’est ma pince à verre, celle que j’ai oubliée sur son étal. Attends, j’ai aussi un sachet de sable fin pour Ficus : il en a besoin pour ses pots. Tu veux bien ?'],
        do: [{ take: 'colis_galet' }, { give: 'sachet_sable' }, { step: 's_colis' }],
      },
      {
        if: (q) => S(q, 's_chasse_verre', 'retour'),
        say: ['Dix ! Les cerfs n’oseront plus approcher du village. Tiens : une teinte bordeaux, pour la cape. J’ai soufflé le flacon moi-même.'],
        do: [{ step: 's_chasse_verre' }],
      },
      {
        if: (q) => q.quest('s_chasse_verre') === 'active',
        say: (q) => [`Créatures vaincues : ${Math.min(10, q.count('kills'))} sur 10. Les cerfs chargent en ligne droite : esquive sur le côté, puis frappe.`],
      },
      {
        if: (q) => q.quest('s_chasse_verre') === 'none',
        say: ['Je cueille le sable de la lisière pour mon verre, mais les créatures s’y promènent comme chez elles. Tu pourrais en vaincre dix ? Je t’en serais très reconnaissante.'],
        do: [{ start: 's_chasse_verre' }],
      },
      { if: (q) => q.quest('q_phare_verre') === 'done', say: ['Le Phare brille ! J’ai soufflé un verre ce matin, et il est sorti vert. Vert ! Pas gris. Je crois que je vais pleurer dans mon four.'] },
      { if: () => true, say: ['Un jour, je soufflerai un vitrail aussi grand que le temple.'] },
    ],
  },

  ficus: {
    name: 'Ficus', role: 'Jardinier',
    look: { hair: 'court', hairHex: '#8f6a3a', skinHex: '#d9ab84', outfit: 'tunique', tunicHex: '#5f9a6a', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_colis', 'ficus'),
        say: ['Du sable fin, tamisé trois fois ! Perle pense à tout. Dis à Galet que je lui dois un pot de lierre-prisme.'],
        do: [{ take: 'sachet_sable' }, { step: 's_colis' }],
      },
      {
        if: (q) => S(q, 's_graines', 'retour'),
        say: ['Trois graines de canopée, encore tièdes ! Je les plante ce soir, à la lumière du phare. Dans un an, tu auras un arbre de verre qui porte ton nom. Prends cette teinte turquoise : c’est la couleur de leurs feuilles.'],
        do: [{ take: 'graine_canopee', n: 3 }, { step: 's_graines' }],
      },
      {
        if: (q) => q.quest('s_graines') === 'active',
        say: (q) => [`Graines de canopée : ${Math.min(3, q.count('graines'))} sur 3. Il y en a une sur la deuxième branche des Branches basses, du côté du coffre. Les autres sont sur la Passerelle, là où personne n’ose se promener.`],
      },
      {
        if: () => true,
        say: ['Les arbres de verre poussent plus vite à la lumière du soleil. Dans les salles de vitraux, essaie de croiser les faisceaux : les vitraux ne laissent passer que leur couleur.', FIA('Il y a même un relais qui fait du jaune. Un relais mélangeur, qu’ils disent.')],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_graines') === 'none' && q.has('grappin'), say: ['Les arbres de verre naissent d’une graine de canopée. Tu as un grappin ? Alors monte : il y en a quelques-unes sur les plates-formes, là-haut. Trois me suffiraient pour mon jardin.'], do: [{ start: 's_graines' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_graines') === 'none' && !q.has('grappin') && q.quest('q_verre') === 'done', say: ['Des graines de canopée, j’en rêve. Mais il faut un grappin pour aller les chercher, et seul Silex sait en forger un. Demande-lui, si Ambre ne t’a pas déjà envoyée.'] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  tessel: {
    name: 'Tessel', role: 'Passeur',
    look: { hair: 'court', hairHex: '#5b3a2b', skinHex: '#c99772', outfit: 'tunique', tunicHex: '#3f6a8a', trimHex: '#d7dbe8', scale: 1.0 },
    talk: [
      {
        if: () => true,
        say: ['Je fais la traversée entre Vitrebourg et Havre-Aube. Tu veux rentrer ?'],
        choices: [
          { t: 'Retourner à Havre-Aube', do: [{ travel: { to: 'aube', zone: 'havre', cell: [27, 7] } }] },
          { t: 'Pas maintenant' },
        ],
      },
    ],
  },

  mousse: {
    name: 'Mousse', role: 'Aubergiste',
    look: { hair: 'long', hairHex: '#3f6a4a', skinHex: '#f6e3d3', outfit: 'tablier', tunicHex: '#5f9a6a', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_lampions_f', 'retour'),
        say: ['Je les ai vus depuis la fenêtre : un, deux, sept ! La place brille comme avant. Tiens, c’est ma teinte préférée : l’ambre des lampions. Elle ira bien à ta cape.'],
        do: [{ step: 's_lampions_f' }],
      },
      {
        if: (q) => q.quest('s_lampions_f') === 'active',
        say: (q) => [`Lampions rallumés : ${Math.min(7, q.count('lampions'))} sur 7. Ils sont autour de la place de Vitrebourg. Fia n’a qu’à les effleurer.`],
      },
      {
        if: () => true,
        say: ['Bienvenue à la Rosée ! Un lit, une soupe de champignons, et la brume reste dehors.'],
        choices: [
          { t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_lampions_f') === 'none' && q.quest('q_verre') === 'done', say: ['Depuis la Brume, les sept lampions de la place sont éteints. Avant, on dansait jusqu’au matin. Si Fia pouvait les rallumer, ce serait un cadeau pour tout Vitrebourg.'], do: [{ start: 's_lampions_f' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },
};
