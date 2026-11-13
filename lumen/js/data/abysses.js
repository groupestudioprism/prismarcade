/* =========================================================
   LUMEN — Acte IV, Les Abysses Miroirs : données de l’île (créatures, objets, boutiques, quêtes, personnages).
   Fichier autonome : les fichiers partagés (enemies.js, items.js, shops.js, quests.js, npcs.js, looks.js)
   n’en reprennent que ce qui est fusionné à leur dernière ligne (voir « ACTE IV »).
   ========================================================= */
const S = (q, id, st) => q.quest(id) === 'active' && q.step(id) === st;
const FIA = (t) => ({ who: 'fia', t });
const LYRA = (t) => ({ who: 'lyra', t });

/* ---------------- Créatures ---------------- */
export const ENEMIES_A4 = {
  crabe_lanterne: {
    name: 'Crabe-lanterne', family: 'abysse', model: 'crabe_lanterne', hp: 62, atk: 17, def: 2, speed: 2.2, charge: 10, behavior: 'charger', aggro: 8, leash: 13, radius: 0.65,
    xp: 18, ecus: [5, 11], drops: [['coquille_nacre', 0.45], ['pierre', 0.3]], weak: { contondant: 1.4 }, resist: { tranchant: 0.75 },
    desc: 'La lanterne sur son dos attire les curieux. Sa carapace encaisse les lames : frappe-le avec quelque chose de lourd, quand il s’étourdit.',
  },
  meduse_reflet: {
    name: 'Méduse-reflet', family: 'abysse', model: 'meduse_reflet', hp: 40, atk: 15, def: 0, speed: 2.0, behavior: 'ranged', aggro: 10, keep: 6, fire: 2.0, proj: 8, leash: 12, radius: 0.55,
    xp: 15, ecus: [4, 9], drops: [['maille_filet', 0.2], ['elixir', 0.12]], weak: { percant: 1.35 }, resist: { lumiere: 0.4 },
    desc: 'Son ombrelle renvoie presque toute la lumière : l’Onde l’agace à peine. Une fronde ou une pointe fine la crève de loin.',
  },
  anguille_ombre: {
    name: 'Anguille d’ombre', family: 'abysse', model: 'anguille', hp: 34, atk: 16, def: 0, speed: 3.4, behavior: 'chaser', aggro: 9, leash: 14, radius: 0.5,
    xp: 14, ecus: [3, 8], drops: [['corail_rouge', 0.15], ['pain_miel', 0.1]], weak: { lumiere: 1.5 }, resist: { contondant: 0.8 },
    desc: 'Elle file dans les flaques et mord vite. La lumière la brûle : une Onde de lumière la met en déroute.',
  },
  sentinelle_corail: {
    name: 'Sentinelle de corail', family: 'abysse', model: 'corail', hp: 150, atk: 24, def: 3, speed: 2.0, behavior: 'guard', shield: true, aggro: 6.5, leash: 9, radius: 0.7,
    xp: 52, ecus: [22, 34], drops: [['coquille_nacre', 1], ['perle_murene', 0.15], ['pierre', 0.6]], weak: { contondant: 1.4 }, resist: { percant: 0.6, tranchant: 0.8 },
    desc: 'Son bouclier de corail arrête tout ce qui vient de face. Contourne-la, ou brise-le au marteau.',
  },
  gardien_marees: {
    name: 'Gardien des Marées', family: 'abysse', model: 'colosse', tint: '#4fd6d0', hp: 700, atk: 26, def: 3, speed: 1.8, behavior: 'boss', aggro: 12, leash: 40, radius: 1.5, boss: true,
    bossFlag: 'boss_marees', place: 'Les Grottes Miroirs', adds: 'anguille_ombre', rageName: 'Le Gardien des Marées',
    xp: 360, ecus: [220, 220], drops: [['larme_marees', 1]], weak: { percant: 1.25 }, resist: { lumiere: 0.6, tranchant: 0.85 },
    desc: 'Un colosse de roche, de corail et d’eau salée. Il fait monter et descendre les marées à chaque pas : les coups de pointe passent entre ses plaques.',
  },
};

/* ---------------- Objets ---------------- */
export const ITEMS_A4 = {
  lame_ecume: { cat: 'arme', name: 'Lame d’écume', icon: 'sword', rarity: 'rare', wclass: 'lame', dmg: 'tranchant', atk: 18, rate: 1.3, reach: 2.35, arc: 2.0, price: 0, sell: 130, model: 'epee', cuts: true,
    desc: 'Une lame mince comme une vague, trouvée au fond des Grottes. Elle tranche les ronces et fend l’écume.' },
  trident_corail: { cat: 'arme', name: 'Trident de corail', icon: 'sword', rarity: 'rare', wclass: 'lame', dmg: 'percant', atk: 17, rate: 1.15, reach: 2.9, arc: 1.4, price: 420, sell: 120, model: 'epee', cuts: true,
    desc: 'Un trident taillé dans le corail rouge par Varech. Sa pointe longue passe entre les plaques des créatures des Abysses.' },
  cotte_nacre: { cat: 'armure', name: 'Cotte de nacre', icon: 'armor-scale', rarity: 'rare', def: 11, price: 0, sell: 160, desc: 'Des écailles de nacre cousues sur un gilet de varech séché. Fabriquée à la forge de Varech.' },
  manteau_marin: { cat: 'armure', name: 'Manteau marin', icon: 'cloak', rarity: 'epique', def: 9, speed: 0.05, price: 0, sell: 170, desc: 'Un long manteau de soie d’algue, offert par Murène. Il sèche en un instant et ne se déchire jamais.' },
  anneau_reflet: { cat: 'accessoire', name: 'Anneau du reflet', icon: 'ring', rarity: 'rare', hp: 12, en: 20, price: 0, sell: 110, desc: '+12 points de vie et +20 énergie maximum. L’eau y dort comme dans un miroir.' },
  amulette_reflet: { cat: 'accessoire', name: 'Amulette du reflet', icon: 'amulet', rarity: 'epique', en: 30, regen: 0.8, price: 0, sell: 150, desc: '+30 énergie maximum. L’énergie revient beaucoup plus vite.' },
  perle_miroir: { cat: 'accessoire', name: 'Perle-miroir', icon: 'talisman', rarity: 'epique', hp: 16, speed: 0.06, price: 0, sell: 180, desc: '+16 points de vie et vitesse +6 %. Elle garde un reflet de la salle où elle dormait.' },
  bottes_palmes: { cat: 'accessoire', name: 'Bottes à palmes', icon: 'boots', rarity: 'rare', speed: 0.12, price: 360, sell: 110, desc: 'Des bottes de plongeur à semelles souples. Vitesse +12 %.' },
  tisane_corail: { cat: 'conso', name: 'Tisane de corail', icon: 'potion-red', rarity: 'commun', heal: 70, price: 55, sell: 18, desc: 'Rend 70 points de vie. Elle sent la mer chaude et le gingembre.' },
  nectar_algue: { cat: 'conso', name: 'Nectar d’algue', icon: 'potion-blue', rarity: 'commun', energy: 70, price: 50, sell: 16, desc: 'Rend 70 points d’énergie. Un peu salé, très efficace.' },
  coquille_nacre: { cat: 'materiau', name: 'Coquille de nacre', icon: 'shard', rarity: 'commun', price: 32, sell: 12, desc: 'Une coquille à l’intérieur irisé. Nacre en fait des colliers, Varech des cottes.' },
  maille_filet: { cat: 'materiau', name: 'Maille de filet', icon: 'fiber', rarity: 'commun', price: 18, sell: 7, desc: 'Un morceau de filet solide, tressé par les pêcheurs de la Grève.' },
  corail_rouge: { cat: 'materiau', name: 'Corail rouge', icon: 'flower', rarity: 'commun', price: 28, sell: 11, desc: 'Une branche de corail rouge vif. Corail l’infuse, Varech le forge.' },
  etoile_mer: { cat: 'materiau', name: 'Étoile de mer', icon: 'shard', rarity: 'rare', price: 60, sell: 24, desc: 'Une étoile de mer séchée, orange et cabossée. Il paraît qu’elle porte chance aux marins.' },
  larme_marees: { cat: 'materiau', name: 'Larme des Marées', icon: 'tear', rarity: 'epique', price: 0, sell: 240, desc: 'Un cristal turquoise, encore humide. La forge peut en tirer le meilleur d’une arme.' },
  perle_murene: { cat: 'quete', name: 'Perle de Murène', icon: 'bag', rarity: 'rare', desc: 'Une grosse perle grise, perdue par Murène il y a vingt ans. Elle a roulé jusque chez les sentinelles de corail.' },
  cle_grottes: { cat: 'quete', name: 'Clé des Grottes', icon: 'key', rarity: 'rare', desc: 'Une clé de corail blanc. Elle ouvre la porte scellée du hall des Grottes Miroirs.' },
  prisme_bleu: { cat: 'quete', name: 'Fragment bleu du Prisme', icon: 'shard', rarity: 'legendaire', desc: 'Un éclat du Grand Prisme, bleu comme l’eau d’une grotte. Il bat doucement, comme un cœur.' },
};
export const RECIPES_A4 = { cotte_nacre: { ecus: 260, mats: { coquille_nacre: 6, fibre: 2 } } };

/* ---------------- Boutiques ---------------- */
export const SHOPS_A4 = {
  corail: {
    name: 'Apothicaire de Corail', buyRate: 0, items: [
      { id: 'potion', stock: 6, restock: 6 },
      { id: 'tisane_corail', stock: 4, restock: 4 },
      { id: 'nectar_algue', stock: 4, restock: 4 },
      { id: 'grande_potion', stock: 2, restock: 2 },
      { id: 'corail_rouge', stock: 4, restock: 3 },
    ],
  },
  nacre: {
    name: 'Étal de Nacre', buyRate: 1, items: [
      { id: 'coquille_nacre', stock: 6, restock: 4 },
      { id: 'maille_filet', stock: 6, restock: 4 },
      { id: 'bottes_palmes', stock: 1 },
      { unlock: 'teinte_corail', name: 'Teinte corail', icon: 'dye', hex: '#e8726a', price: 70, desc: 'Pour la cape.' },
      { unlock: 'teinte_abysse', name: 'Teinte d’abysse', icon: 'dye', hex: '#1d6a78', price: 70, desc: 'Pour la cape.' },
      { unlock: 'teinture_lagon', name: 'Teinture bleu lagon', icon: 'dye', hex: '#3fd0d0', price: 90, desc: 'Pour les cheveux.' },
    ],
  },
  varech: {
    name: 'Forge de Varech', buyRate: 0, items: [
      { id: 'trident_corail', stock: 1 },
      { id: 'pierre', stock: 5, restock: 3 },
      { id: 'fibre', stock: 4, restock: 3 },
    ],
  },
  lagon: {
    name: 'Cabane de Lagon', buyRate: 1, items: [
      { id: 'etoile_mer', stock: 2, restock: 1, if: (q) => q.quest('s_etoiles') !== 'none' },
      { id: 'maille_filet', stock: 4, restock: 3 },
      { id: 'bois', stock: 4, restock: 3 },
    ],
  },
};

/* ---------------- Quêtes ---------------- */
export const QUESTS_A4 = {
  q_abysses: {
    kind: 'main', island: 'abysses', act: 4, title: 'Le lac qui ne reflète plus', giver: 'maree',
    summary: 'Sous l’île des Abysses, le grand lac dort : ses eaux ne renvoient plus la lumière. Marée, la passeuse de lumière de la Grève, t’apprend à lire les eaux miroirs.',
    steps: [
      { id: 'parler', type: 'talk', npc: 'maree', text: 'Parler à Marée, sur la place de la Grève', zone: 'greve' },
      { id: 'lac', type: 'gates', gates: ['la1', 'la2', 'la3'], text: 'Traverser les trois salles du lac souterrain (à l’est de la Grève)', zone: 'lac1' },
    ],
    rewards: { xp: 400, ecus: 200, items: { grande_potion: 2 }, pa: [300, 100] },
  },
  q_grottes: {
    kind: 'main', island: 'abysses', act: 4, title: 'Les Grottes Miroirs', giver: 'maree', after: 'q_abysses',
    summary: 'Au bout du lac s’ouvrent les Grottes Miroirs. Un Gardien y fait monter et descendre les marées. Il faut franchir ses salles et le calmer.',
    steps: [
      { id: 'grottes', type: 'reach', zone: 'grottes', text: 'Entrer dans les Grottes Miroirs' },
      { id: 'combat', type: 'gates', gates: ['gr_combat'], text: 'Vaincre les créatures de la salle des Écumes et briser le sceau', zone: 'grottes' },
      { id: 'cle', type: 'gates', gates: ['gr_key'], text: 'Trouver la clé de corail et ouvrir la porte du hall', zone: 'grottes' },
      { id: 'eau', type: 'gates', gates: ['gr_eau'], text: 'Résoudre la salle des Marées (vannes, eau miroir et orbe de Fia)', zone: 'grottes' },
      { id: 'gardien', type: 'flag', flag: 'boss_marees', text: 'Vaincre le Gardien des Marées', zone: 'grottes' },
      { id: 'retour', type: 'talk', npc: 'maree', text: 'Annoncer la victoire à Marée (Grève)', zone: 'greve' },
    ],
    rewards: { xp: 650, ecus: 300, items: { grande_potion: 2 }, pa: [380, 130] },
  },
  q_phare_abysses: {
    kind: 'main', island: 'abysses', act: 4, title: 'Le Phare des Abysses', giver: 'maree', after: 'q_grottes',
    summary: 'Le pont de l’arène mène au Phare des Abysses, creusé sous la mer. Il exige deux lumières en même temps : celle d’une lanterne et celle de l’orbe de Fia.',
    steps: [
      { id: 'phare', type: 'reach', zone: 'phare_a', text: 'Traverser le pont de l’arène et entrer dans le Phare des Abysses' },
      { id: 'salles', type: 'gates', gates: ['ph_d1', 'ph_d2'], text: 'Ouvrir les deux premières salles du phare', zone: 'phare_a' },
      { id: 'balise', type: 'gates', gates: ['end'], text: 'Rallumer le Phare des Abysses : lanterne blanche et orbe cyan ensemble', zone: 'phare_a' },
      { id: 'retour', type: 'talk', npc: 'maree', text: 'Annoncer la bonne nouvelle à Marée (Grève)', zone: 'greve' },
    ],
    rewards: { xp: 800, ecus: 380, items: { grande_potion: 2, amulette_reflet: 1 }, pa: [520, 180] },
  },

  s_corail: {
    kind: 'side', island: 'abysses', title: 'Tisane de corail', giver: 'corail', requires: 'q_abysses',
    summary: 'Corail prépare une tisane qui soigne mieux que n’importe quelle potion, mais il lui manque du corail rouge, qui pousse dans les Récifs.',
    steps: [
      { id: 'coraux', type: 'item', item: 'corail_rouge', n: 3, text: 'Ramasser 3 branches de corail rouge (Récifs)', zone: 'recifs' },
      { id: 'retour', type: 'talk', npc: 'corail', text: 'Les apporter à Corail (marché)', zone: 'greve' },
    ],
    rewards: { xp: 90, ecus: 50, items: { tisane_corail: 3 }, pa: [60, 20] },
  },
  s_coquilles: {
    kind: 'side', island: 'abysses', title: 'Les colliers de Nacre', giver: 'nacre', requires: 'q_abysses',
    summary: 'Nacre n’a plus de coquilles pour ses colliers. Les crabes-lanternes en traînent entre les coraux des Récifs.',
    steps: [
      { id: 'coquilles', type: 'item', item: 'coquille_nacre', n: 4, text: 'Rapporter 4 coquilles de nacre (Récifs)', zone: 'recifs' },
      { id: 'retour', type: 'talk', npc: 'nacre', text: 'Les donner à Nacre (marché)', zone: 'greve' },
    ],
    rewards: { xp: 90, ecus: 40, unlock: ['teinte_corail'], pa: [70, 25] },
  },
  s_filets: {
    kind: 'side', island: 'abysses', title: 'Le filet déchiré', giver: 'ecume', requires: 'q_abysses',
    summary: 'Le grand filet d’Écume s’est déchiré sur les récifs. Des mailles flottent encore entre les rochers, et les méduses en emportent d’autres.',
    steps: [
      { id: 'mailles', type: 'item', item: 'maille_filet', n: 3, text: 'Retrouver 3 mailles de filet (Récifs)', zone: 'recifs' },
      { id: 'retour', type: 'talk', npc: 'ecume', text: 'Les rapporter à Écume (bord de mer)', zone: 'greve' },
    ],
    rewards: { xp: 80, ecus: 90, items: { elixir: 2, nectar_algue: 2 }, pa: [50, 20] },
  },
  s_crabes: {
    kind: 'side', island: 'abysses', title: 'Les crabes de Pétoncle', giver: 'petoncle', requires: 'q_abysses',
    summary: 'Pétoncle veut devenir pêcheur, mais les crabes-lanternes lui font peur. Montre-lui que les Récifs peuvent être sûrs.',
    steps: [
      { id: 'chasse', type: 'kill', n: 8, text: 'Vaincre 8 créatures (Récifs)', zone: 'recifs' },
      { id: 'retour', type: 'talk', npc: 'petoncle', text: 'Faire ton rapport à Pétoncle', zone: 'greve' },
    ],
    rewards: { xp: 120, ecus: 100, unlock: ['teinte_abysse'], pa: [80, 30] },
  },
  s_perle: {
    kind: 'side', island: 'abysses', title: 'La perle de Murène', giver: 'murene', requires: 'q_abysses',
    summary: 'Murène, vieux plongeur, a perdu sa plus belle perle il y a vingt ans, au pied d’une sentinelle de corail. Il aimerait la tenir une dernière fois.',
    steps: [
      { id: 'perle', type: 'item', item: 'perle_murene', n: 1, text: 'Retrouver la perle de Murène (près de la sentinelle de corail, Récifs)', zone: 'recifs' },
      { id: 'retour', type: 'talk', npc: 'murene', text: 'La rapporter à Murène (Grève)', zone: 'greve' },
    ],
    rewards: { xp: 160, ecus: 60, items: { manteau_marin: 1 }, pa: [90, 35] },
  },
  s_lampions_a: {
    kind: 'side', island: 'abysses', title: 'Les lampions du Coquillage', giver: 'sargasse', requires: 'q_abysses',
    summary: 'Sargasse regrette les soirées d’avant l’extinction du phare, quand les sept lampions de la Grève brillaient jusqu’au matin. Fia sait les rallumer.',
    steps: [
      { id: 'lampions', type: 'count', what: 'lampions', n: 7, text: 'Rallumer les 7 lampions de la Grève', zone: 'greve' },
      { id: 'retour', type: 'talk', npc: 'sargasse', text: 'Prévenir Sargasse (Auberge du Coquillage)', zone: 'auberge_a' },
    ],
    rewards: { xp: 70, ecus: 70, unlock: ['teinture_lagon'], pa: [50, 20] },
  },
  s_etoiles: {
    kind: 'side', island: 'abysses', title: 'Étoiles de mer', giver: 'lagon', requires: 'q_phare_abysses',
    summary: 'Lagon jure que les étoiles de mer des Îlots du Reflet portent chance. Seul quelqu’un qui sait planer peut les rapporter.',
    steps: [
      { id: 'etoiles', type: 'item', item: 'etoile_mer', n: 3, text: 'Rapporter 3 étoiles de mer (Îlots du Reflet)', zone: 'ilots' },
      { id: 'retour', type: 'talk', npc: 'lagon', text: 'Les donner à Lagon (Grève)', zone: 'greve' },
    ],
    rewards: { xp: 150, ecus: 150, items: { grande_potion: 2 }, pa: [90, 35] },
  },
};

/* ---------------- Personnages ---------------- */
export const NPCS_A4 = {
  maree: {
    name: 'Marée', role: 'Passeuse de lumière',
    look: { hair: 'chignon', hairHex: '#cfe9ec', skinHex: '#c99772', outfit: 'aube', cloakHex: '#4fc8c0', tunicHex: '#1f6f7a', trimHex: '#f0c66b', scale: 0.98, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_abysses', 'parler'),
        say: [
          'Une voyageuse de la Forêt de Verre… Alors le phare de verre brille. Je m’appelle Marée. Ici, à la Grève, on guide la lumière depuis qu’Orin a posé la première lanterne.',
          FIA('Bonjour ! Ça sent le sel et le poisson fumé. J’adore.'),
          'Sous nos pieds, un lac souterrain relie les Grottes au Phare des Abysses. Son eau était un miroir parfait : elle renvoyait la lumière du phare jusqu’à l’horizon. Depuis qu’il est éteint, elle dort.',
          'Là-bas, l’eau obéit à deux règles. Haute, elle renvoie la lumière dans le sens de la flèche gravée sur son bord. Basse, elle laisse passer la lumière et on peut y marcher. Les vannes règlent le niveau.',
          'Et il y a Fia. Les anciens disaient qu’une Lueur peut se détacher de sa voyageuse pour se poser sur un socle de pierre : on l’appelle l’orbe. Elle éclaire alors tout droit, dans la direction qu’on lui donne.',
          FIA('Moi ? Me poser ? Sur un socle ? … Bon. Mais tu viens me rechercher, Lyra.'),
          'Appuie sur Interagir près d’un socle pour la poser, puis encore pour la tourner. Le lac est à l’est de la grand-rue ; les Récifs, au sud, te feront les jambes.',
        ],
        do: [{ ability: 'orbe' }, { step: 'q_abysses' }, { open: 'b_lac' }, { open: 'b_recifs' }],
      },
      {
        if: (q) => S(q, 'q_abysses', 'lac'),
        say: ['Le lac est à l’est de la grand-rue, par le pont. Trois salles : un miroir, une vanne, puis l’orbe de Fia. Regarde bien les flèches gravées sur l’eau.', FIA('Dans la dernière salle, il n’y a aucune lanterne. Tout repose sur moi. Pas de pression.')],
      },
      {
        if: (q) => S(q, 'q_grottes', 'retour'),
        say: [
          LYRA('Le Gardien des Marées s’est apaisé, Marée. L’eau des Grottes redescend toute seule.'),
          'Je l’ai senti d’ici : la mer s’est retirée de dix pas, puis elle est revenue, doucement, comme quelqu’un qui respire enfin. Cent ans que les marées ne se calmaient plus.',
          'L’arène donne sur un pont qui n’existait plus : celui du Phare des Abysses. Il s’est déployé quand le Gardien est tombé.',
          'Là-haut, le phare exige deux lumières en même temps : celle d’une lanterne et celle de l’orbe de Fia. Elles ne s’aiment pas toujours. Va doucement.',
          FIA('Je vais être très sage. Et très brillante.'),
        ],
        do: [{ step: 'q_grottes' }],
      },
      {
        if: (q) => q.quest('q_grottes') === 'active' && !q.flag('boss_marees'),
        say: ['Les Grottes Miroirs sont au bout du lac. Une porte de corail t’attend dans le hall : sa clé est dans les salles de l’est. Et dans la salle des Marées, ne tente pas de forcer : tourne les vannes avec calme.', 'Le Gardien, au fond, fait monter l’eau à chaque pas. Les coups de pointe passent entre ses plaques ; l’Onde de lumière, moins bien : son corail renvoie la lumière.'],
      },
      {
        if: (q) => S(q, 'q_phare_abysses', 'retour'),
        say: [
          LYRA('Le Phare des Abysses brille, Marée. La lanterne et l’orbe tiennent ensemble.'),
          'Je l’ai vu de la plage : une colonne turquoise, puis le lac entier qui se remet à renvoyer la lumière, de rive en rive. Les anciens appelaient ça « le grand miroir ».',
          'Prends ceci : le fragment bleu du Grand Prisme. Il dormait sous la dernière flamme. Il t’appartient plus qu’à nous.',
          FIA('Il est tout chaud ! Et il bat, comme un petit cœur.'),
          'Et puisque tu as appris à te fier à Fia, apprends à te fier à l’air. Ce que tu vas sentir sur les corniches des Îlots du Reflet, au sud des Récifs, s’appelle planer. Sur une corniche, tourne-toi vers l’autre îlot et laisse-toi porter.',
          'Les Pics du Vent, là-bas, auront besoin de quelqu’un qui sache voler un peu. Mais pas ce soir. Repose-toi au Coquillage.',
        ],
        do: [{ give: 'prisme_bleu' }, { ability: 'planer' }, { open: 'b_ilots' }, { step: 'q_phare_abysses' }, { flag: 'acte4_fini' }],
      },
      {
        if: (q) => q.quest('q_phare_abysses') === 'active',
        say: ['Le pont de l’arène mène au Phare des Abysses. Trois salles : la première te rend la vanne, la deuxième l’orbe et l’eau ensemble, la troisième les réunit avec une lanterne.', 'La balise veut du blanc et du cyan en même temps. Défaire ce qui a ouvert une porte fait aussi partie du chemin.'],
      },
      {
        if: (q) => q.quest('q_phare_abysses') === 'done',
        say: ['Le phare veille de nouveau. Regarde l’eau, le soir : elle renvoie tout, même les étoiles. Les Îlots du Reflet t’attendent, au sud des Récifs, avec leurs corniches. Et Lagon cherche quelqu’un qui sache planer.'],
        choices: [
          { t: 'Comment planer ?', say: ['Sur une corniche gravée d’un chevron, tourne-toi vers l’îlot d’en face et appuie sur Interagir. Les corniches se répondent deux par deux, de part et d’autre d’un vide d’au plus six cases.'] },
          { t: 'Au revoir' },
        ],
      },
      {
        if: () => true,
        say: ['La Grève te souhaite le bonjour. Si tu cherches ton chemin, regarde où l’eau penche : elle te dira où va la lumière.'],
      },
    ],
  },

  corail: {
    name: 'Corail', role: 'Apothicaire',
    look: { hair: 'boucles', hairHex: '#ff8f7a', skinHex: '#a8714d', outfit: 'robe', tunicHex: '#e8726a', trimHex: '#f0c66b', acc: 'lunettes', scale: 0.98 },
    talk: [
      {
        if: (q) => S(q, 's_corail', 'retour'),
        say: ['Trois branches, bien rouges, pas une brisée. Laisse-moi infuser… Voilà : trois tisanes de corail pour toi. C’est ce que la mer m’a appris de mieux.'],
        do: [{ take: 'corail_rouge', n: 3 }, { step: 's_corail' }],
      },
      {
        if: (q) => q.quest('s_corail') === 'active',
        say: (q) => [`Corail rouge : ${Math.min(3, (q.has('corail_rouge', 3) ? 3 : q.has('corail_rouge', 2) ? 2 : q.has('corail_rouge', 1) ? 1 : 0))} sur 3. Il pousse dans les Récifs, au sud de la Grève. Les anguilles d’ombre y rôdent.`],
      },
      {
        if: (q) => q.flag('acte4_fini'),
        say: ['Depuis que le phare brille, les gens se soignent moins : ils se sentent mieux. Ça ne me ruine pas, mais ça me réjouit. Qu’est-ce qui te ferait plaisir ?'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'corail' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_corail') === 'none', say: ['Du corail rouge, trois branches. Les Récifs en regorgent, sous les anguilles.'], do: [{ start: 's_corail' }] },
          { t: 'Au revoir' },
        ],
      },
      {
        if: () => true,
        say: ['Potions, tisanes et élixirs : tout vient de la mer ou y retourne. Qu’est-ce qui te ferait plaisir ?'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'corail' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_corail') === 'none' && q.quest('q_abysses') === 'done', say: ['Justement ! Il me faut trois branches de corail rouge pour ma meilleure tisane. Elles poussent dans les Récifs, au sud.'], do: [{ start: 's_corail' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  nacre: {
    name: 'Nacre', role: 'Marchande',
    look: { hair: 'long', hairHex: '#f2eef8', skinHex: '#efd0b4', outfit: 'exploratrice', cloakHex: '#8fd8e8', tunicHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_coquilles', 'retour'),
        say: ['Quatre belles coquilles, irisées à souhait ! Je les enfile ce soir. Et pour toi, la teinte corail : la couleur des petites heures sur la plage.'],
        do: [{ take: 'coquille_nacre', n: 4 }, { step: 's_coquilles' }],
      },
      {
        if: (q) => q.quest('s_coquilles') === 'active',
        say: (q) => [`Coquilles : ${Math.min(4, q.has('coquille_nacre', 4) ? 4 : q.has('coquille_nacre', 3) ? 3 : q.has('coquille_nacre', 2) ? 2 : q.has('coquille_nacre', 1) ? 1 : 0)} sur 4. Les crabes-lanternes en traînent entre les coraux, au sud. Je t’en vends aussi, si tu es pressée.`],
        choices: [{ t: 'Acheter et vendre', do: [{ shop: 'nacre', sell: true }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: ['Nacre, marchande de tout ce qui brille sous l’eau : coquilles, mailles, bottes de plongeur, teintes de cape. Regarde, ne te gêne pas.'],
        choices: [
          { t: 'Acheter et vendre', do: [{ shop: 'nacre', sell: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_coquilles') === 'none' && q.quest('q_abysses') === 'done', say: ['Je suis à court de coquilles pour mes colliers. Quatre, dans les Récifs, au sud : les crabes-lanternes en cachent entre les coraux.'], do: [{ start: 's_coquilles' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  varech: {
    name: 'Varech', role: 'Forgeron',
    look: { hair: 'court', hairHex: '#3f6a4a', skinHex: '#8d5b3e', outfit: 'tablier', tunicHex: '#2f6f7a', apronHex: '#d9d4e3', trimHex: '#ff8f7a', beard: '#3f6a4a', scale: 1.08 },
    talk: [
      {
        if: (q) => q.flag('boss_marees') && !q.flag('varech_larme'),
        say: ['Tu rapportes une larme des Marées ? Pose-la sur l’enclume, que je la regarde… C’est du cristal d’eau, pur. Je peux en tirer le meilleur d’une arme, si tu as de quoi payer.'],
        choices: [
          { t: 'Améliorer mon équipement', do: [{ forge: true }, { flag: 'varech_larme' }] },
          { t: 'Acheter', do: [{ shop: 'varech' }] },
          { t: 'Au revoir' },
        ],
      },
      {
        if: () => true,
        say: ['Varech, forgeron de la Grève. Le corail se forge comme la pierre, en plus rouge. Qu’est-ce que je peux faire pour toi ?'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'varech' }] },
          { t: 'Améliorer mon équipement', do: [{ forge: true }] },
          { t: 'Une cotte de nacre ? ', say: ['Six coquilles de nacre, deux fibres de ronce et deux cent soixante écus : je te couds une cotte qui ne rouille pas. Ouvre la forge, tu la verras dans la liste.'], do: [{ forge: true }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  isoard: {
    name: 'Isoard', role: 'Cartographe des eaux',
    look: { hair: 'court', hairHex: '#cfcbe0', skinHex: '#d9ab84', outfit: 'tunique', tunicHex: '#4f6fae', trimHex: '#6b4a3a', beard: '#d9d5e6', hat: 'chapeau', scale: 0.96 },
    talk: [
      {
        if: (q) => q.flag('acte4_fini'),
        say: ['J’ai redessiné mes cartes ce matin. Le lac y est enfin juste : chaque flèche, chaque vanne. Orin en aurait pleuré.', 'Les Îlots du Reflet, au sud des Récifs, sont les seuls coins que mes cartes ne montrent pas. Ils changent de place avec les marées, dit-on. Ou c’est moi qui perds le nord.'],
      },
      {
        if: (q) => q.flag('boss_marees'),
        say: ['Le Gardien est calmé ! Alors le Phare des Abysses va pouvoir se rallumer. Le pont de l’arène, tout au fond des Grottes, y mène. Les eaux de là-bas aiment les lumières de couleur : une lanterne blanche d’un côté, l’orbe de Fia de l’autre.'],
      },
      {
        if: (q) => q.quest('q_grottes') === 'active',
        say: ['J’ai cartographié les Grottes avant qu’elles se scellent : le hall, deux salles à l’est, une clé de corail qui dort dans une salle sans éclairage, et tout au fond, l’arène. Trouve la clé, ouvre la porte du hall, et descends.'],
      },
      {
        if: () => true,
        say: ['Isoard. Je trace les eaux de l’île depuis trente ans. Si tu veux un conseil : dans les salles du lac, regarde toujours la flèche sur l’eau. Elle dit où la lumière ira, pas où tu voudrais qu’elle aille.'],
        choices: [
          { t: 'Et pour les vannes ?', say: ['Une vanne, c’est un robinet pour toute la salle. Elle monte ou descend tous les bassins qui lui sont liés. Si tu te sens coincée, tourne-la : on ne peut rien casser, tout se remet en place.'] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  ecume: {
    name: 'Écume', role: 'Pêcheuse',
    look: { hair: 'tresse', hairHex: '#2f5f7a', skinHex: '#efd0b4', outfit: 'voyage', cloakHex: '#e8b65a', tunicHex: '#e9dcc2', trimHex: '#d7dbe8', hood: false, scale: 0.95 },
    talk: [
      {
        if: (q) => S(q, 's_filets', 'retour'),
        say: ['Trois mailles ! Avec ça, je recoud tout le coin déchiré. Tiens, deux élixirs et deux nectars : mes poissons me suffisent, pas toi.'],
        do: [{ take: 'maille_filet', n: 3 }, { step: 's_filets' }],
      },
      {
        if: (q) => q.quest('s_filets') === 'active',
        say: ['Les mailles sont tombées entre les rochers des Récifs. Les méduses en emportent aussi. Trois suffisent.'],
      },
      {
        if: () => true,
        say: ['Écume, pêcheuse. L’eau de la Grève nourrit tout le monde, mais depuis que le phare est éteint, les poissons ne montent plus.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_filets') === 'none' && q.quest('q_abysses') === 'done', say: ['Mon grand filet s’est déchiré sur les récifs. Trois mailles bien solides, et je le recoud. Elles flottent entre les rochers, au sud.'], do: [{ start: 's_filets' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  petoncle: {
    name: 'Pétoncle', role: 'Apprenti pêcheur',
    look: { hair: 'court', hairHex: '#d6aa5c', skinHex: '#f6e3d3', outfit: 'tunique', tunicHex: '#5f8fd0', trimHex: '#f0c66b', scale: 0.72 },
    talk: [
      {
        if: (q) => S(q, 's_crabes', 'retour'),
        say: ['Huit créatures à toi toute seule ! Je le dirai à tout le monde. Et la teinte d’abysse est de la part de ma mère : elle dit que c’est la couleur d’une vraie pêcheuse.'],
        do: [{ step: 's_crabes' }],
      },
      {
        if: (q) => q.quest('s_crabes') === 'active',
        say: (q) => [`Alors, ça avance ? Il te reste des crabes-lanternes à vaincre dans les Récifs. (${Math.min(8, q.count('kills'))} sur 8)`],
      },
      {
        if: () => true,
        say: ['Je veux devenir pêcheur ! Mais les crabes-lanternes me font trop peur. Leur lumière, là, sur leur dos… elle me regarde.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_crabes') === 'none' && q.quest('q_abysses') === 'done', say: ['Tu veux bien me débarrasser de huit créatures, dans les Récifs ? Comme ça je pourrai y aller sans trembler.'], do: [{ start: 's_crabes' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  murene: {
    name: 'Murène', role: 'Ancien plongeur',
    look: { hair: 'court', hairHex: '#9a9aa8', skinHex: '#b98560', outfit: 'tunique', tunicHex: '#3f6a8a', trimHex: '#d7dbe8', beard: '#9a9aa8', scale: 1.04 },
    talk: [
      {
        if: (q) => S(q, 's_perle', 'retour'),
        say: ['La voilà… Grise comme un matin de brume. Vingt ans que je la cherche. Garde ce manteau, il est de soie d’algue : il m’a suivi sous toutes les eaux de l’île.'],
        do: [{ take: 'perle_murene', n: 1 }, { step: 's_perle' }],
      },
      {
        if: (q) => q.quest('s_perle') === 'active',
        say: ['Elle a roulé près d’une sentinelle de corail, du côté sud-est des Récifs. Sa carapace de corail renvoie la lumière et ses coups sont rudes. Prends un marteau.'],
      },
      {
        if: () => true,
        say: ['Murène. J’ai plongé dans toutes les grottes de l’île, du temps où l’eau était claire. Aujourd’hui, mes genoux préfèrent le banc.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_perle') === 'none' && q.quest('q_abysses') === 'done', say: ['J’ai perdu ma plus belle perle il y a vingt ans, pas loin d’une sentinelle de corail, dans les Récifs. Elle me manque plus que mes cheveux.'], do: [{ start: 's_perle' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  lagon: {
    name: 'Lagon', role: 'Passeur',
    look: { hair: 'court', hairHex: '#5b3a2b', skinHex: '#c99772', outfit: 'tunique', tunicHex: '#3f6a8a', trimHex: '#d7dbe8', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_etoiles', 'retour'),
        say: ['Trois étoiles ! Orange, cabossées, parfaites. Chez moi, on dit que le premier qui en tient trois n’a plus jamais peur de la mer. Tiens, deux grandes potions pour la route.'],
        do: [{ take: 'etoile_mer', n: 3 }, { step: 's_etoiles' }],
      },
      {
        if: (q) => q.quest('s_etoiles') === 'active',
        say: ['Les étoiles de mer sont sur les trois îlots, au sud des Récifs. Il faut planer de corniche en corniche. Et si tu en manques une, j’en vends : je ne suis pas un pirate, mais presque.'],
        choices: [{ t: 'Acheter et vendre', do: [{ shop: 'lagon', sell: true }] }, { t: 'Au revoir' }],
      },
      {
        if: () => true,
        say: ['Lagon, passeur. Je relie la Grève à la Forêt de Verre depuis que le phare de verre brille. Tu veux rentrer, ou tu restes un peu ?'],
        choices: [
          { t: 'Retourner à Vitrebourg', do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [12, 7] } }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_etoiles') === 'none' && q.quest('q_phare_abysses') === 'done', say: ['Tu sais planer, maintenant : alors rapporte-moi trois étoiles de mer des Îlots du Reflet. Les îlots sont au sud des Récifs.'], do: [{ start: 's_etoiles' }] },
          { t: 'Acheter et vendre', do: [{ shop: 'lagon', sell: true }] },
          { t: 'Pas maintenant' },
        ],
      },
    ],
  },

  sargasse: {
    name: 'Sargasse', role: 'Aubergiste',
    look: { hair: 'chignon', hairHex: '#8f3d22', skinHex: '#f6e3d3', outfit: 'tablier', tunicHex: '#c97a5a', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_lampions_a', 'retour'),
        say: ['Je les ai vus de la fenêtre : un, deux, sept ! La Grève brille comme avant. Pour toi : une teinture bleu lagon pour les cheveux, de la part de la maison.'],
        do: [{ step: 's_lampions_a' }],
      },
      {
        if: (q) => q.quest('s_lampions_a') === 'active',
        say: (q) => [`Lampions rallumés : ${Math.min(7, q.count('lampions'))} sur 7. Ils sont autour de la place. Fia n’a qu’à les effleurer.`],
      },
      {
        if: () => true,
        say: ['Bienvenue au Coquillage ! Un lit, une soupe d’algues, et la mer reste dehors.'],
        choices: [
          { t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_lampions_a') === 'none' && q.quest('q_abysses') === 'done', say: ['Depuis que le phare est éteint, les sept lampions de la place ne brillent plus. Avant, on dansait jusqu’au matin. Si Fia pouvait les rallumer…'], do: [{ start: 's_lampions_a' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },
};

/* ---------------- Apparences ---------------- */
export const CLOAKS_A4 = [
  { id: 'corail', name: 'Corail', hex: '#e8726a', unlock: 'teinte_corail' },
  { id: 'abysse', name: 'Abysse', hex: '#1d6a78', unlock: 'teinte_abysse' },
];
export const HAIRS_A4 = [{ id: 'lagon', name: 'Bleu lagon', hex: '#3fd0d0', unlock: 'teinture_lagon' }];
export const UNLOCKS_A4 = { teinte_corail: 'Teinte corail', teinte_abysse: 'Teinte d’abysse', teinture_lagon: 'Teinture bleu lagon (cheveux)' };
