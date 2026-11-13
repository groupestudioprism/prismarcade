/* =========================================================
   LUMEN — ACTE III : habitants de la Cité des Échos (fusionnés dans NPCS).
   Mêmes conventions que npcs.js : le premier sujet dont la condition « if » est vraie.
   ========================================================= */
const S = (q, id, st) => q.quest(id) === 'active' && q.step(id) === st;
const FIA = (t) => ({ who: 'fia', t });
const LYRA = (t) => ({ who: 'lyra', t });
const done = (q, id) => q.quest(id) === 'done';

export const DESERT_NPCS = {
  /* ---------------- Oumi, doyenne de la Cité ---------------- */
  oumi: {
    name: 'Oumi', role: 'Doyenne de la Cité des Échos',
    look: { hair: 'chignon', hairHex: '#e8e2d0', skinHex: '#a8714d', outfit: 'aube', cloakHex: '#e8b65a', tunicHex: '#b8602a', trimHex: '#f0c66b', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_echos', 'parler'),
        say: [
          'Une barque venue de la Forêt de Verre… Alors le Phare de Verre brille de nouveau. Je m’appelle Oumi, et je garde la Cité des Échos.',
          FIA('Écho ! Écho ! Ça répond !'),
          'Ici, rien ne se perd : ni les voix, ni la lumière. Mais le sable a recouvert les temples, et les tempêtes soufflent par cycles : quand le vent se lève, les faisceaux ne portent plus qu’à quelques pas.',
          'Ne t’inquiète pas : une tempête ne ferme jamais rien. Ce qui est allumé reste allumé, et tu peux t’abriter sous une tente, ou simplement attendre que le sable retombe.',
          'Le fragment vert t’a appris à porter ce qu’on croyait scellé. Approche-toi d’un miroir posé sur son socle et appuie sur Retour (R) : tu le prendras dans tes mains, puis tu le poseras sur un autre socle libre. Les lames, elles, laissent passer la lumière et en renvoient la moitié.',
          'À l’est, quatre salles de sable t’attendent, puis les Dunes. Au sud, l’Oasis des Roseaux nourrit la Cité. Va où tu veux, Lyra : le désert n’est pas pressé.',
        ],
        do: [{ step: 'q_echos' }, { open: 'b_sable' }, { open: 'b_oasis' }],
      },
      {
        if: (q) => S(q, 'q_echos', 'salles'),
        say: ['Les salles de sable sont à l’est, au bout de la grand-rue. Tu peux porter un miroir ou un prisme avec Retour (R), puis le poser sur un socle libre avec la même touche.', FIA('Et si le vent se lève, on s’abrite ! Ou on attend. Les cristaux n’oublient rien.')],
      },
      {
        if: (q) => q.quest('q_echos') === 'active',
        say: ['Les Dunes commencent après la quatrième salle. Le Temple enseveli est au sud, derrière une haie de ronces sèches : il faudra une vraie lame.', 'Djamila vend des remèdes, Kassim des armes et des armures. L’Oasis, au sud de la ville, cache de quoi t’équiper.'],
      },
      {
        if: (q) => S(q, 'q_temple', 'retour'),
        say: [
          LYRA('Le Gardien d’échos est brisé, Oumi. Voici ce qu’il gardait.'),
          'Un fragment doré du Grand Prisme… Il répétait chaque son trois fois, avant que le sable ne l’enterre. Depuis qu’il s’est tu, nos voix s’éteignent aussi.',
          FIA('Il est chaud ! Il chante tout bas ! Regarde, Lyra, il me parle !'),
          'Il te parle, petite lumière ? Alors il te reconnaît. Orin, avant de partir, m’a confié une dernière chose pour toi : l’Orbe. Quand tu le décideras, Fia pourra se faire lanterne de poche et allumer les vasques de pierre. Approche-toi d’une vasque et appuie sur Interagir.',
          'Le Phare des Sables se dresse à l’est des Dunes. Le pont s’ouvre pour toi : trois vasques gardent la porte du phare. Prends le temps de t’équiper.',
        ],
        do: [{ take: 'prisme_dore', n: 1 }, { teach: 'orbe' }, { open: 'b_phare' }, { step: 'q_temple' }, { flag: 'dore_fini' }],
      },
      {
        if: (q) => q.quest('q_temple') === 'active',
        say: ['Le Temple enseveli est au sud des Dunes, derrière la haie de ronces sèches. Dans la salle des lames, un miroir attend sur le mauvais socle : porte-le jusqu’à celui qui laissera la lumière monter.', 'Le Gardien d’échos répète tes coups trois fois… et sa voix t’appelle, sauf quand son cœur doré se découvre. Frappe alors.'],
      },
      {
        if: (q) => S(q, 'q_phare_sable', 'retour'),
        say: [
          LYRA('Le Phare des Sables brille, Oumi. Le rouge, le vert et le bleu se sont rejoints sur la balise.'),
          'Je l’ai entendu avant de le voir : toute la Cité a répété le même mot, très doucement, pendant une minute. Puis la lumière a traversé les dunes. Cent ans que le désert ne nous avait pas parlé.',
          'Orin disait qu’une lumière qu’on porte peut aller plus loin qu’une lumière qu’on garde. Je crois qu’il avait raison.',
          FIA('Et dans la colonne dorée, il y a une route de lumière qui plonge vers le sud. Quelque chose de profond et de bleu, avec des reflets partout.'),
          'Les Abysses Miroirs… Pas encore, Lyra. Yaël ne connaît pas ce chemin, et la mer n’a pas fini de se refléter. Repose-toi à l’Oasis. Tu l’as bien mérité.',
        ],
        do: [{ step: 'q_phare_sable' }, { flag: 'acte3_fini' }],
      },
      {
        if: (q) => q.quest('q_phare_sable') === 'active',
        say: ['Trois vasques gardent la porte du phare : Fia les allume avec l’Orbe. Dans la salle du phare, il faudra poser le prisme au bon endroit pour que le rouge, le vert et le bleu convergent.', 'Si la tempête se lève, attends. La lumière revient toujours. Elle est patiente, elle aussi.'],
      },
      {
        if: (q) => q.quest('q_phare_sable') === 'done',
        say: ['La Cité te doit beaucoup. Les salles de sable, le Temple, le Phare… tout répète ton nom, maintenant. Il reste des jarres à retrouver et des scorpions à chasser, si le cœur t’en dit.', 'Au-delà du désert, d’autres îles attendent. Mais pas encore : l’horizon est brumeux, ce soir.'],
      },
      {
        if: () => true,
        say: ['Bienvenue dans la Cité des Échos. Ici, on parle doucement : la ville répète tout.'],
      },
    ],
  },

  /* ---------------- Yaël, passeur des sables ---------------- */
  yael: {
    name: 'Yaël', role: 'Passeur des sables',
    look: { hair: 'court', hairHex: '#2a2230', skinHex: '#8a5a3a', outfit: 'tunique', tunicHex: '#3f6a8a', trimHex: '#e8b65a', scale: 1.02, beard: '#2a2230' },
    talk: [
      {
        if: (q) => !q.flag('acte3_fini'),
        say: ['Mon voilier des sables est amarré là, mais je ne le détache pas tant que la tempête n’a pas dit son dernier mot. Je peux te ramener à Vitrebourg, si tu y as laissé quelque chose.'],
        choices: [
          { t: 'Retourner à Vitrebourg', do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [12, 7] } }] },
          { t: 'Pas maintenant' },
        ],
      },
      {
        if: () => true,
        say: ['Le Phare des Sables brille : même mon voilier fredonne. Au sud, d’après la colonne dorée, il y a une mer pleine de reflets. Je ne sais pas encore y mener un voilier.'],
        choices: [
          { t: 'Retourner à Vitrebourg', do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [12, 7] } }] },
          { t: 'Vers les Abysses Miroirs…', say: ['Pas encore, Lyra. La route n’existe pas : la lumière doit d’abord la tracer. Reviens quand le prochain phare sera prêt : « bientôt », comme on dit ici quand on ne sait pas.'] },
          { t: 'Pas maintenant' },
        ],
      },
    ],
  },

  /* ---------------- Nour, aubergiste ---------------- */
  nour: {
    name: 'Nour', role: 'Aubergiste de l’Oasis',
    look: { hair: 'long', hairHex: '#2a2230', skinHex: '#b98560', outfit: 'tablier', tunicHex: '#c0584a', apronHex: '#f3e6c8', trimHex: '#e8b65a', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_lampions_d', 'retour'),
        say: ['Un, deux… sept ! La place brille comme au temps des caravanes. Tiens : un thé à la menthe, et ma bénédiction. Que le sable te soit léger.'],
        do: [{ step: 's_lampions_d' }],
      },
      {
        if: (q) => q.quest('s_lampions_d') === 'active',
        say: (q) => [`Lampions rallumés : ${Math.min(7, q.count('lampions'))} sur 7. Ils sont autour de la place, et le long des rues. Fia n’a qu’à les effleurer.`],
      },
      {
        if: () => true,
        say: ['Bienvenue à l’Auberge de l’Oasis ! Un lit frais, un thé brûlant, et le désert reste dehors.'],
        choices: [
          { t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_lampions_d') === 'none' && q.quest('q_echos') !== 'none', say: ['Depuis que le sable a recouvert les temples, les sept lampions de la Cité sont éteints. Avant, on veillait jusqu’à l’aube. Si Fia pouvait les rallumer, la Cité retrouverait sa voix.'], do: [{ start: 's_lampions_d' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Djamila, apothicaire ---------------- */
  djamila: {
    name: 'Djamila', role: 'Apothicaire',
    look: { hair: 'long', hairHex: '#3a2a22', skinHex: '#c99772', outfit: 'robe', tunicHex: '#5fb37a', trimHex: '#e8b65a', acc: 'lunettes', scale: 0.98 },
    talk: [
      {
        if: (q) => S(q, 's_roses', 'retour'),
        say: ['Quatre roses des sables, fermées comme des poings, comme il se doit ! Laisse-moi infuser… Voilà : trois thés à la menthe pour toi, et une teinte sable pour ta cape.'],
        do: [{ take: 'fleur_sable', n: 4 }, { step: 's_roses' }],
      },
      {
        if: () => true,
        say: ['Remèdes, thés et élixirs : tout est frais, ici. Qu’est-ce qui te ferait du bien ?'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'djamila' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_roses') === 'none' && q.quest('q_echos') !== 'none', say: ['Justement ! Il me faut quatre roses des sables : ces fleurs de cristal rose qui poussent autour de l’Oasis. Elles font le meilleur remède contre la fièvre du désert.'], do: [{ start: 's_roses' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Kassim, marchand de la caravane ---------------- */
  kassim: {
    name: 'Kassim', role: 'Marchand de la caravane',
    look: { hair: 'court', hairHex: '#4a3a30', skinHex: '#9a6a3e', outfit: 'tunique', tunicHex: '#d98a3a', trimHex: '#f0c66b', beard: '#4a3a30', scale: 1.05 },
    talk: [
      {
        if: (q) => S(q, 's_colis_d', 'retour'),
        say: ['Livré en main propre, sans une seule secousse ? Tu es la meilleure messagère de la Cité. Tiens : deux élixirs d’écho, et une réduction sur mes cartons de thé, pour la route.'],
        do: [{ step: 's_colis_d' }],
      },
      {
        if: (q) => q.quest('s_colis_d') === 'active',
        say: ['Le colis est pour Leïla, à l’atelier du sud-ouest. Elle donnera ensuite un sachet d’épices à passer à Samir. Doucement avec le paquet : c’est fragile.'],
      },
      {
        if: () => true,
        say: ['Étoffes, armes, épices ! Tout ce que le désert ne fabrique pas, ma caravane l’apporte. Que cherches-tu ?'],
        choices: [
          { t: 'Acheter et vendre', do: [{ shop: 'kassim', sell: true }] },
          { t: 'Changer d’apparence', do: [{ wardrobe: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_colis_d') === 'none' && q.quest('q_echos') !== 'none', say: ['Un colis pour Leïla, la potière, qui attend ses pigments depuis trois jours. Mes chameaux sont fatigués. Prends-le, et ne le secoue pas : c’est écrit dessus.'], do: [{ give: 'colis_kassim' }, { start: 's_colis_d' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Rafik, forgeron ---------------- */
  rafik: {
    name: 'Rafik', role: 'Forgeron',
    look: { hair: 'court', hairHex: '#2a2230', skinHex: '#8a5a3a', outfit: 'forge', tunicHex: '#7d5a4a', apronHex: '#4a3a30', trimHex: '#c9805a', beard: '#2a2230', scale: 1.08 },
    talk: [
      {
        if: (q) => q.quest('q_echos') === 'none',
        say: ['Un nouveau visage ? Je suis Rafik. Quand tu auras vu Oumi, passe me voir : une lame sans trempe, c’est un bâton qui se prend pour un héros.'],
      },
      {
        if: () => true,
        say: (q) => [q.has('carapace_sable', 5) ? 'Cinq carapaces ! Avec ça, je te fais une armure qui fait rire les scorpions.' : 'Le désert fournit de quoi forger : carapaces de scarabées, dards de scorpions, verre du désert. Rapporte-moi tout ça.'],
        choices: [
          { t: 'Améliorer ou fabriquer', do: [{ forge: true }] },
          { t: 'Acheter des matériaux', do: [{ shop: 'rafik' }] },
          { t: 'Des conseils ?', say: ['Les scarabées craignent les coups lourds : une masse ou un marteau fend la carapace. Les scorpions et les cactus, eux, cèdent à une lame. Les échos errants ne craignent que la lumière : l’Onde de Fia les éteint d’un coup.'] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Leïla, potière ---------------- */
  leila: {
    name: 'Leïla', role: 'Potière',
    look: { hair: 'chignon', hairHex: '#5b3a2b', skinHex: '#d9ab84', outfit: 'tablier', tunicHex: '#b8602a', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 0.96 },
    talk: [
      {
        if: (q) => S(q, 's_colis_d', 'leila'),
        say: ['Mes pigments ! Trois jours que je tourne en rond avec des pots sans couleur. Attends, j’ai un sachet d’épices pour Samir : il n’arrête pas de dire que ses grillades manquent de safran.'],
        do: [{ take: 'colis_kassim', n: 1 }, { give: 'sachet_epices' }, { step: 's_colis_d' }],
      },
      {
        if: (q) => S(q, 's_jarres', 'retour'),
        say: ['Trois jarres de l’ancien temps, sans une fêlure ! Le vernis n’a pas bougé en mille ans. Je vais les rendre à la Cité, pleines de grenade. Pour toi, une teinte rouille : mon secret de potière.'],
        do: [{ take: 'jarre_ancienne', n: 3 }, { step: 's_jarres' }],
      },
      {
        if: (q) => q.quest('s_jarres') === 'active',
        say: (q) => [`Jarres retrouvées : ${Math.min(3, q.has('jarre_ancienne', 3) ? 3 : q.has('jarre_ancienne', 2) ? 2 : q.has('jarre_ancienne', 1) ? 1 : 0)} sur 3. L’une est près de l’Oasis, une autre dans les Dunes, la dernière au fond du Temple.`],
      },
      {
        if: () => true,
        say: ['Je tourne le grès comme mes aïeux. Mais les belles jarres, celles de l’ancien temps, ne se refont plus.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_jarres') === 'none' && q.quest('q_echos') !== 'none', say: ['Les jarres des anciens, vernies à la cendre, sont perdues dans le désert : près de l’Oasis, dans les Dunes, et au fond du Temple enseveli. Si tu en trouves trois, je saurai les réparer.'], do: [{ start: 's_jarres' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Idris, archéologue ---------------- */
  idris: {
    name: 'Idris', role: 'Archéologue',
    look: { hair: 'court', hairHex: '#9a9aa8', skinHex: '#c99772', outfit: 'tunique', tunicHex: '#4f7f6a', trimHex: '#d7dbe8', acc: 'lunettes', beard: '#9a9aa8', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_tablettes', 'retour'),
        say: ['Trois tablettes ! Écoute : « La lumière qu’on porte va plus loin que celle qu’on garde. » Et celle-ci : « Les échos ne mentent jamais longtemps. » Et la dernière… elle répète mon nom. Étrange. Prends ce burnous : c’est mon bien le plus cher.'],
        do: [{ take: 'tablette_echo', n: 3 }, { step: 's_tablettes' }],
      },
      {
        if: (q) => q.quest('s_tablettes') === 'active',
        say: ['Une tablette dans les Dunes, deux dans le Temple enseveli : une dans la salle de la clé, une dans la chambre cachée, derrière les roches fissurées. Il faudra un marteau.'],
      },
      {
        if: () => true,
        say: ['Les anciens du désert écrivaient sur l’argile, puis ils faisaient répéter la tablette par l’écho. Je n’ai jamais su comment.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_tablettes') === 'none' && q.quest('q_echos') !== 'none', say: ['Les tablettes d’écho ! Il m’en manque trois : une dans les Dunes, deux dans le Temple. Je ne suis plus assez jeune pour y retourner. Rapporte-les-moi, je t’en prie.'], do: [{ start: 's_tablettes' }] },
          { t: 'Parle-moi d’Orin', say: ['Orin le cartographe est passé par ici il y a dix ans. Il disait que les phares n’étaient pas faits pour les marins, mais pour la lumière elle-même. Il a laissé une page de son journal dans le Temple enseveli, dans la chambre cachée. Si tu la trouves, garde-la bien.'] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Samir, chasseur ---------------- */
  samir: {
    name: 'Samir', role: 'Chasseur de scorpions',
    look: { hair: 'court', hairHex: '#3a2a22', skinHex: '#a8714d', outfit: 'chasseur', tunicHex: '#7d5a4a', trimHex: '#c9805a', scale: 1.04 },
    talk: [
      {
        if: (q) => S(q, 's_colis_d', 'samir'),
        say: ['Du safran ! Ah, voilà ce qui manquait à mes grillades. Dis à Kassim que je ne lui dois plus rien, ni les cartons de thé, ni les excuses.'],
        do: [{ take: 'sachet_epices', n: 1 }, { step: 's_colis_d' }],
      },
      {
        if: (q) => S(q, 's_scorpions', 'retour'),
        say: ['Cinq scorpions ! Les dunes respirent mieux. Garde cette teinte : c’est la couleur du sable au coucher du soleil, quand les scorpions rentrent se coucher.'],
        do: [{ step: 's_scorpions' }],
      },
      {
        if: (q) => q.quest('s_scorpions') === 'active',
        say: ['Les scorpions dorment sous les pierres chaudes, dans les Dunes et à l’Oasis. Ne reste jamais dans leur portée : frappe en premier, ou recule.'],
      },
      {
        if: () => true,
        say: ['Je chasse tout ce qui a un dard. Les scarabées, c’est pour les enfants. Les scorpions, c’est pour moi.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_scorpions') === 'none' && q.quest('q_echos') !== 'none', say: ['Les scorpions se sont multipliés depuis que le sable a recouvert les temples. Si tu pouvais m’en débarrasser de cinq… Ils dorment sous les pierres, dans les Dunes et à l’Oasis.'], do: [{ start: 's_scorpions' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Tarek, enfant ---------------- */
  tarek: {
    name: 'Tarek', role: 'Enfant de la Cité',
    look: { hair: 'court', hairHex: '#2a2230', skinHex: '#b98560', outfit: 'tunique', tunicHex: '#d98a3a', trimHex: '#f0c66b', scale: 0.72 },
    talk: [
      {
        if: (q) => S(q, 's_chameau', 'retour'),
        say: ['LE COLLIER DE PACHÀ ! Tu l’as retrouvé ! Pachà va revenir, j’en suis sûr : il aime quand ça fait « ding-ding-ding ». Tiens, c’est tout ce que j’ai : des dattes !'],
        do: [{ take: 'collier_chameau', n: 1 }, { step: 's_chameau' }],
      },
      {
        if: (q) => q.quest('s_chameau') === 'active',
        say: ['Pachà a perdu son collier de clochettes du côté de l’Oasis, juste après la piste, vers l’est. Il a dû rouler jusqu’à un rocher. Sans son collier, il boude.'],
      },
      {
        if: () => true,
        say: ['Tu es la fille de la barque ? Moi, j’ai un chameau qui s’appelle Pachà. Il n’est pas très obéissant.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_chameau') === 'none' && q.quest('q_echos') !== 'none', say: ['Pachà a perdu son collier de clochettes dans l’Oasis, près de l’étang. Sans lui, il boude. Tu veux bien le chercher ? Il fait « ding-ding » quand il est content.'], do: [{ start: 's_chameau' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Ysmaël, conteur ---------------- */
  ysmael: {
    name: 'Ysmaël', role: 'Conteur',
    look: { hair: 'long', hairHex: '#e8e2d0', skinHex: '#8a5a3a', outfit: 'robe', tunicHex: '#4f4f9c', trimHex: '#e8b65a', beard: '#e8e2d0', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => q.quest('q_phare_sable') === 'done',
        say: ['Voilà une histoire que je raconterai cent fois : une fille, une petite lumière, un phare doré. Et tout le désert qui répète leurs noms. Je n’y changerai pas un mot.', FIA('Il a dit « petite lumière » ! Il parle de moi !')],
      },
      {
        if: (q) => q.flag('dore_fini'),
        say: ['On dit que l’Orbe est une flamme qui tient dans la main. Les anciens en gardaient une dans chaque vasque. Fia saura la porter : elle a déjà tant porté pour toi.'],
      },
      {
        if: (q) => q.flag('boss_echos'),
        say: ['Le Gardien d’échos est tombé ? Alors la voix du Temple va revenir. Il répétait nos cris pour que personne ne se sente seul. C’était une triste façon de veiller.'],
      },
      {
        if: (q) => q.quest('q_echos') === 'done',
        say: ['Tu as traversé les salles de sable ? Alors tu sais déjà qu’une lumière qu’on porte va plus loin qu’une lumière qu’on garde. Les anciens appelaient ça « le secret des quatre socles ».'],
      },
      {
        if: () => true,
        say: ['Assieds-toi, voyageuse. Je raconte l’histoire du désert aux enfants, et le désert la répète après moi. C’est le seul public qui ne s’endort jamais.'],
        choices: [
          { t: 'Raconte-moi les échos', say: ['Au commencement, le désert était une mer de verre. Puis le soleil l’a fondue en sable, et chaque grain a gardé un mot. Voilà pourquoi tout répète tout, ici : ce sont les mots des grains.'] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },
};
