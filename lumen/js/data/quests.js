/* =========================================================
   LUMEN — quêtes. Une quête = des étapes, dans l'ordre.
   Types d'étapes (vérifiés par game/quests.js) :
     talk  { npc }            terminée par un dialogue (effet { step: 'idQuête' })
     gates { gates, n? }      portes / cristaux ouverts
     item  { item, n }        objets possédés
     kill  { enemy?, n }      créatures vaincues depuis le début de l'étape
     flag  { flag }           drapeau posé par le jeu
     reach { zone }           zone atteinte
     count { what, n }       pages, lampions, éclats…
   rewards : xp, ecus, items {id: n}, unlock [déblocages d'apparence], pa [xp, pièces Prism Arcade]
   ========================================================= */

export const QUESTS = {
  /* ================= Quêtes principales — Acte I : l'Aube ================= */
  q_reveil: {
    kind: 'main', act: 1, title: 'Une lumière dans la brume', giver: 'selene',
    summary: 'Tu te réveilles à Havre-Aube, sans souvenir de la traversée. Fia, la petite lumière qui t’accompagne, semble pressée de te présenter à quelqu’un.',
    steps: [
      { id: 'parler', type: 'talk', npc: 'selene', text: 'Parler à Séléné, la gardienne du phare, sur la place du village', zone: 'havre' },
      { id: 'rivage', type: 'gates', gates: ['g1', 'g2'], text: 'Rallumer les deux premiers cristaux du Rivage (à l’est, par le pont)', zone: 'z1' },
      { id: 'retour', type: 'talk', npc: 'selene', text: 'Revenir voir Séléné à Havre-Aube', zone: 'havre' },
    ],
    rewards: { xp: 80, ecus: 40, items: { potion: 2 }, pa: [120, 40] },
  },
  q_lentille: {
    kind: 'main', act: 1, title: 'La Lentille volée', giver: 'selene', requires: 'q_reveil',
    summary: 'Le phare ne pourra jamais briller sans sa Lentille d’Aube. Une créature de brume l’a emportée dans le Sanctuaire, au sud de la Lande des Ronces.',
    steps: [
      { id: 'bran', type: 'talk', npc: 'bran', text: 'Demander une vraie lame à Bran, le forgeron', zone: 'havre' },
      { id: 'brume', type: 'item', item: 'brume', n: 3, text: 'Récupérer 3 brumes condensées sur les Brumelins de la Lande', zone: 'lande' },
      { id: 'forge', type: 'talk', npc: 'bran', text: 'Rapporter la brume à Bran', zone: 'havre' },
      { id: 'sanctuaire', type: 'reach', zone: 'sanctuaire', text: 'Couper la haie de ronces et trouver le Sanctuaire de Brume' },
      { id: 'colosse', type: 'flag', flag: 'boss_colosse', text: 'Vaincre le gardien du Sanctuaire', zone: 'sanctuaire' },
      { id: 'retour', type: 'talk', npc: 'selene', text: 'Rapporter la Lentille d’Aube à Séléné', zone: 'havre' },
    ],
    rewards: { xp: 250, ecus: 120, items: { grande_potion: 1 }, pa: [220, 70] },
  },
  q_phare: {
    kind: 'main', act: 1, title: 'Rallumer le phare', giver: 'selene', requires: 'q_lentille',
    summary: 'Avec la Lentille, le phare peut se rallumer. Il faut encore réveiller les cristaux des Jardins et des Ruines pour atteindre le cap.',
    steps: [
      { id: 'enigmes', type: 'gates', gates: ['g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'], text: 'Traverser les Jardins suspendus et les Ruines', zone: 'z4' },
      { id: 'lentille', type: 'flag', flag: 'lens_set', text: 'Poser la Lentille à l’entrée du Phare de l’Aube', zone: 'phare' },
      { id: 'phare', type: 'gates', gates: ['end'], text: 'Rallumer le phare : rouge, vert et bleu en même temps', zone: 'phare' },
      { id: 'retour', type: 'talk', npc: 'selene', text: 'Retrouver Séléné', zone: 'havre' },
    ],
    rewards: { xp: 400, ecus: 200, unlock: ['tenue_aube'], pa: [300, 100] },
  },

  /* ================= Quêtes secondaires ================= */
  s_pain: {
    kind: 'side', title: 'Le pain de Maëlle', giver: 'maelle',
    summary: 'Maëlle, l’aubergiste, n’a plus de fleurs de miel pour son fameux pain. Il en pousse dans la Lande… entre deux ronces.',
    steps: [
      { id: 'fleurs', type: 'item', item: 'fleur_miel', n: 3, text: 'Cueillir 3 fleurs de miel', zone: 'lande' },
      { id: 'retour', type: 'talk', npc: 'maelle', text: 'Les apporter à Maëlle (Auberge du Lampion)', zone: 'havre' },
    ],
    rewards: { xp: 60, ecus: 40, items: { pain_miel: 3 }, unlock: ['acc_couronne'], pa: [60, 20] },
  },
  s_marteau: {
    kind: 'side', title: 'Le marteau de Bran', giver: 'bran',
    summary: 'Bran a perdu son vieux marteau de forge en poursuivant un sanglier dans la Lande. Il l’a vu rouler dans un recoin, à l’est.',
    steps: [
      { id: 'trouver', type: 'item', item: 'marteau_bran', n: 1, text: 'Retrouver le marteau de Bran (Lande, recoin à l’est)', zone: 'lande' },
      { id: 'retour', type: 'talk', npc: 'bran', text: 'Le rapporter à Bran', zone: 'havre' },
    ],
    rewards: { xp: 70, ecus: 60, items: { pierre: 2 }, pa: [60, 20] },
  },
  s_ysolde: {
    kind: 'side', title: 'Brume en bouteille', giver: 'ysolde',
    summary: 'Ysolde, l’apothicaire, veut étudier la brume condensée pour en tirer un remède plus puissant.',
    steps: [
      { id: 'brume', type: 'item', item: 'brume', n: 5, text: 'Rapporter 5 brumes condensées', zone: 'lande' },
      { id: 'retour', type: 'talk', npc: 'ysolde', text: 'Les donner à Ysolde (marché)', zone: 'havre' },
    ],
    rewards: { xp: 70, ecus: 30, items: { grande_potion: 1, elixir: 2 }, pa: [60, 20] },
  },
  s_pendentif: {
    kind: 'side', title: 'Le pendentif de Tobias', giver: 'tobias',
    summary: 'Une pie a volé le pendentif de Tobias et l’a laissé tomber « derrière les ronces, près du puits ». Il faudra une lame.',
    steps: [
      { id: 'trouver', type: 'item', item: 'pendentif', n: 1, text: 'Retrouver le pendentif (près du puits, derrière des ronces)', zone: 'havre' },
      { id: 'retour', type: 'talk', npc: 'tobias', text: 'Le rendre à Tobias', zone: 'havre' },
    ],
    rewards: { xp: 50, ecus: 30, unlock: ['acc_plume'], pa: [50, 15] },
  },
  s_pages: {
    kind: 'side', title: 'Les pages d’Orin', giver: 'lison',
    summary: 'Lison, la fille d’Orin le cartographe, cherche les pages du journal de son père, dispersées dans les chambres secrètes de l’île.',
    steps: [
      { id: 'pages', type: 'count', what: 'pages', n: 3, text: 'Trouver les 3 pages d’Orin (chambres secrètes)', zone: 'z3' },
      { id: 'retour', type: 'talk', npc: 'lison', text: 'Apporter les pages à Lison', zone: 'havre' },
    ],
    rewards: { xp: 120, ecus: 50, items: { cle_orin: 1 }, pa: [100, 30] },
  },
  s_chasse: {
    kind: 'side', title: 'Chasseur de brume', giver: 'aldo',
    summary: 'Le capitaine Aldo veut repousser les créatures qui rôdent aux portes du village.',
    steps: [
      { id: 'chasse', type: 'kill', n: 12, text: 'Vaincre 12 créatures', zone: 'lande' },
      { id: 'retour', type: 'talk', npc: 'aldo', text: 'Faire ton rapport au capitaine Aldo', zone: 'havre' },
    ],
    rewards: { xp: 120, ecus: 120, unlock: ['tenue_chasseur', 'teinte_ardoise'], pa: [80, 30] },
  },
  s_lampions: {
    kind: 'side', title: 'Les lampions du village', giver: 'mira',
    summary: 'Depuis l’arrivée de la brume, les lampions de Havre-Aube se sont éteints un à un. Fia peut les rallumer.',
    steps: [
      { id: 'lampions', type: 'count', what: 'lampions', n: 7, text: 'Rallumer les 7 lampions du village', zone: 'havre' },
      { id: 'retour', type: 'talk', npc: 'mira', text: 'Prévenir Mira', zone: 'havre' },
    ],
    rewards: { xp: 60, ecus: 60, unlock: ['teinte_or'], pa: [50, 20] },
  },
  s_prisme: {
    kind: 'side', title: 'Une étoffe de lumière', giver: 'pell',
    summary: 'Pell, le tailleur, rêve de tisser une étoffe avec des éclats du Grand Prisme. Il lui en faut beaucoup.',
    steps: [
      { id: 'eclats', type: 'count', what: 'shards', n: 8, text: 'Réunir 8 éclats de prisme', zone: 'z1' },
      { id: 'retour', type: 'talk', npc: 'pell', text: 'Montrer les éclats à Pell', zone: 'havre' },
    ],
    rewards: { xp: 100, ecus: 0, unlock: ['tenue_prisme', 'teinture_azur'], pa: [80, 30] },
  },
};
