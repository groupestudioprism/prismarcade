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
   island : île de la quête (défaut : aube) · act : acte (quêtes principales)
   after : quête qui se lance toute seule quand celle-ci est terminée · reqItem : objet nécessaire pour que la quête soit proposée
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

  /* ================= Quêtes principales — Acte II : la Forêt de Verre ================= */
  q_verre: {
    kind: 'main', island: 'foret', act: 2, title: 'Les vitraux de la Forêt', giver: 'ambre',
    summary: 'Les vitraux du Temple de Verre ne laissent plus passer que la brume. Ambre, la doyenne de Vitrebourg, t’apprend à lire les couleurs.',
    steps: [
      { id: 'parler', type: 'talk', npc: 'ambre', text: 'Parler à Ambre sur la place de Vitrebourg', zone: 'vitrebourg' },
      { id: 'vitraux', type: 'gates', gates: ['fg1', 'fg2', 'fg3'], text: 'Traverser les trois salles de vitraux (à l’est du village)', zone: 'f1' },
      { id: 'lisiere', type: 'reach', zone: 'lisiere', text: 'Rejoindre la Lisière du Verre (au sud du village)' },
      { id: 'temple', type: 'reach', zone: 'temple', text: 'Couper la haie de ronces et entrer dans le Temple de Verre' },
      { id: 'gardien', type: 'flag', flag: 'boss_verre', text: 'Vaincre le Gardien de Verre', zone: 'temple' },
      { id: 'retour', type: 'talk', npc: 'ambre', text: 'Rapporter le fragment vert à Ambre', zone: 'vitrebourg' },
    ],
    rewards: { xp: 500, ecus: 250, items: { grande_potion: 2 }, pa: [320, 110] },
  },

  s_givre: {
    kind: 'side', island: 'foret', title: 'Tisane de givre', giver: 'opaline',
    summary: 'Opaline prépare une tisane qui soigne mieux que n’importe quelle potion, mais il lui faut du givre de sous-bois, qui pousse dans la Lisière.',
    steps: [
      { id: 'fleurs', type: 'item', item: 'givre_foret', n: 4, text: 'Cueillir 4 givres de sous-bois (Lisière du Verre)', zone: 'lisiere' },
      { id: 'retour', type: 'talk', npc: 'opaline', text: 'Les apporter à Opaline (marché)', zone: 'vitrebourg' },
    ],
    rewards: { xp: 80, ecus: 50, items: { tisane_foret: 3 }, pa: [60, 20] },
  },
  s_eclats: {
    kind: 'side', island: 'foret', title: 'La commande de Silex', giver: 'silex',
    summary: 'Silex, le maître verrier, manque d’éclats de vitrail pour sa commande. Les créatures de verre de la Lisière en laissent derrière elles.',
    steps: [
      { id: 'eclats', type: 'item', item: 'eclat_verre', n: 6, text: 'Rapporter 6 éclats de verre', zone: 'lisiere' },
      { id: 'retour', type: 'talk', npc: 'silex', text: 'Les donner à Silex (verrerie)', zone: 'vitrebourg' },
    ],
    rewards: { xp: 90, ecus: 40, items: { pierre: 3 }, unlock: ['teinte_emeraude'], pa: [70, 25] },
  },
  s_chasse_verre: {
    kind: 'side', island: 'foret', title: 'Les cerfs de verre', giver: 'perle',
    summary: 'Perle souffle le verre avec les éclats ramassés dans la forêt, mais les créatures de verre rôdent trop près du village.',
    steps: [
      { id: 'chasse', type: 'kill', n: 10, text: 'Vaincre 10 créatures (Lisière du Verre)', zone: 'lisiere' },
      { id: 'retour', type: 'talk', npc: 'perle', text: 'Faire ton rapport à Perle', zone: 'vitrebourg' },
    ],
    rewards: { xp: 120, ecus: 100, unlock: ['teinte_bordeaux'], pa: [80, 30] },
  },

  /* ================= Acte II, partie 2 : la Canopée et le Phare de Verre ================= */
  q_phare_verre: {
    kind: 'main', island: 'foret', act: 2, title: 'Le Phare de Verre', giver: 'ambre', after: 'q_verre',
    summary: 'Le fragment vert est en sécurité, mais le Phare de Verre reste éteint. Il se dresse au bout de la Canopée et exige le jaune, le magenta et le cyan en même temps. Pour y monter, il faudra un grappin de lumière.',
    steps: [
      { id: 'silex', type: 'talk', npc: 'silex', text: 'Demander à Silex les plans du grappin de lumière (Verrerie)', zone: 'vitrebourg' },
      { id: 'eclats', type: 'item', item: 'eclat_verre', n: 5, text: 'Rassembler 5 éclats de verre (Lisière, ou le marché de Galet)', zone: 'lisiere' },
      { id: 'forge', type: 'talk', npc: 'silex', text: 'Rapporter les éclats à Silex pour qu’il forge le grappin', zone: 'vitrebourg' },
      { id: 'canopee', type: 'reach', zone: 'can1', text: 'Prendre le pont au sud du Belvédère et grimper dans la Canopée' },
      { id: 'branches', type: 'gates', gates: ['fc0', 'fc1'], text: 'Franchir les Branches basses, puis la salle des Feuilles de lumière', zone: 'can1' },
      { id: 'passerelle', type: 'gates', gates: ['cn_combat'], text: 'Vaincre les gardiens de la Passerelle et briser le sceau', zone: 'can3' },
      { id: 'nid', type: 'gates', gates: ['fc2'], text: 'Résoudre le Nid de lumière', zone: 'can4' },
      { id: 'phare', type: 'gates', gates: ['end'], text: 'Rallumer le Phare de Verre : jaune, magenta et cyan en même temps', zone: 'phare_f' },
      { id: 'retour', type: 'talk', npc: 'ambre', text: 'Annoncer la bonne nouvelle à Ambre', zone: 'vitrebourg' },
    ],
    rewards: { xp: 650, ecus: 320, items: { grande_potion: 2, manteau_verre: 1 }, pa: [450, 160] },
  },

  s_lampions_f: {
    kind: 'side', island: 'foret', title: 'Les lampions de la Rosée', giver: 'mousse', requires: 'q_verre',
    summary: 'Mousse, l’aubergiste de la Rosée, regrette les soirées d’avant la Brume, quand les sept lampions de la place brillaient jusqu’au matin. Fia sait les rallumer.',
    steps: [
      { id: 'lampions', type: 'count', what: 'lampions', n: 7, text: 'Rallumer les 7 lampions de Vitrebourg', zone: 'vitrebourg' },
      { id: 'retour', type: 'talk', npc: 'mousse', text: 'Prévenir Mousse (Auberge de la Rosée)', zone: 'auberge_f' },
    ],
    rewards: { xp: 70, ecus: 70, unlock: ['teinte_ambre'], pa: [50, 20] },
  },
  s_colis: {
    kind: 'side', island: 'foret', title: 'Livraison express', giver: 'galet', requires: 'q_verre',
    summary: 'Galet a un colis urgent pour Perle, qui doit à son tour envoyer du sable à Ficus. Tout le monde est pressé à Vitrebourg, sauf les jambes de Galet.',
    steps: [
      { id: 'perle', type: 'talk', npc: 'perle', text: 'Porter le colis de Galet à Perle', zone: 'vitrebourg' },
      { id: 'ficus', type: 'talk', npc: 'ficus', text: 'Apporter le sachet de sable à Ficus', zone: 'vitrebourg' },
      { id: 'retour', type: 'talk', npc: 'galet', text: 'Rendre compte à Galet (marché)', zone: 'vitrebourg' },
    ],
    rewards: { xp: 80, ecus: 90, items: { elixir: 2, tisane_foret: 2 }, pa: [50, 20] },
  },
  s_graines: {
    kind: 'side', island: 'foret', title: 'Graines de canopée', giver: 'ficus', requires: 'q_verre', reqItem: 'grappin',
    summary: 'Ficus rêve de faire pousser des arbres de verre dans son jardin, mais leurs graines ne tombent que tout là-haut, sur les plates-formes de la Canopée. Le grappin ouvre des chemins que personne n’a empruntés depuis longtemps.',
    steps: [
      { id: 'graines', type: 'item', item: 'graine_canopee', n: 3, text: 'Trouver 3 graines de canopée (Branches basses, Passerelle)', zone: 'can1' },
      { id: 'retour', type: 'talk', npc: 'ficus', text: 'Les rapporter à Ficus', zone: 'vitrebourg' },
    ],
    rewards: { xp: 140, ecus: 100, items: { grande_potion: 1 }, unlock: ['teinte_turquoise'], pa: [90, 35] },
  },
};

/* ACTE V : Les Pics du Vent */
import { QUESTS_PICS } from './pics-story.js';
Object.assign(QUESTS, QUESTS_PICS);
