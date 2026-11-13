/* =========================================================
   LUMEN — ACTE III : quêtes du Désert des Échos (fusionnées dans QUESTS).
   ========================================================= */
export const DESERT_QUESTS = {
  /* ================= Quêtes principales — Acte III : le Désert des Échos ================= */
  q_echos: {
    kind: 'main', island: 'desert', act: 3, title: 'Les salles de sable', giver: 'oumi',
    summary: 'Le sable a recouvert les temples du Désert des Échos. Oumi, la doyenne de la Cité, t’apprend à porter les miroirs et à lire les lames de lumière. Les tempêtes de sable passent : elles ne ferment jamais rien.',
    steps: [
      { id: 'parler', type: 'talk', npc: 'oumi', text: 'Parler à Oumi sur la place de la Cité des Échos', zone: 'cite' },
      { id: 'salles', type: 'gates', gates: ['ds1', 'ds2', 'ds3', 'ds4'], text: 'Traverser les quatre salles de sable (à l’est de la Cité)', zone: 'd1' },
      { id: 'dunes', type: 'reach', zone: 'dunes', text: 'Rejoindre les Dunes' },
    ],
    rewards: { xp: 520, ecus: 260, items: { grande_potion: 2 }, pa: [330, 115] },
  },
  q_temple: {
    kind: 'main', island: 'desert', act: 3, title: 'Le Temple enseveli', giver: 'oumi', after: 'q_echos',
    summary: 'Au sud des Dunes, le Temple enseveli garde un fragment doré du Grand Prisme. Un Gardien d’échos y répète chaque son trois fois. Il faudra une lame pour couper les ronces sèches, et un miroir bien posé.',
    steps: [
      { id: 'temple', type: 'reach', zone: 'temple_d', text: 'Couper la haie de ronces sèches et entrer dans le Temple enseveli (au sud des Dunes)' },
      { id: 'sceau', type: 'gates', gates: ['td_combat'], text: 'Vaincre les gardiens de la salle de l’ouest et briser le sceau', zone: 'temple_d' },
      { id: 'lames', type: 'gates', gates: ['td_light'], text: 'Résoudre la salle des lames (le miroir doit changer de socle)', zone: 'temple_d' },
      { id: 'gardien', type: 'flag', flag: 'boss_echos', text: 'Vaincre le Gardien d’échos', zone: 'temple_d' },
      { id: 'retour', type: 'talk', npc: 'oumi', text: 'Rapporter le fragment doré à Oumi', zone: 'cite' },
    ],
    rewards: { xp: 620, ecus: 320, items: { grande_potion: 2, burnous_echo: 1 }, pa: [450, 160] },
  },
  q_phare_sable: {
    kind: 'main', island: 'desert', act: 3, title: 'Le Phare des Sables', giver: 'oumi', after: 'q_temple',
    summary: 'Oumi t’a confié l’Orbe : Fia peut désormais allumer les vasques de pierre. Le Phare des Sables se dresse à l’est des Dunes et exige le rouge, le vert et le bleu, ensemble, sur la balise.',
    steps: [
      { id: 'vasques', type: 'gates', gates: ['ph_vasques'], text: 'Allumer les trois vasques du vestibule avec l’Orbe de Fia', zone: 'ph_vest' },
      { id: 'phare', type: 'gates', gates: ['end'], text: 'Rallumer le Phare des Sables : le rouge, le vert et le bleu sur la balise', zone: 'phare_d' },
      { id: 'retour', type: 'talk', npc: 'oumi', text: 'Annoncer la nouvelle à Oumi', zone: 'cite' },
    ],
    rewards: { xp: 800, ecus: 400, items: { grande_potion: 3, elixir_echo: 2 }, unlock: ['teinte_oasis'], pa: [550, 200] },
  },

  /* ================= Quêtes secondaires ================= */
  s_roses: {
    kind: 'side', island: 'desert', title: 'Roses des sables', giver: 'djamila', requires: 'q_echos',
    summary: 'Djamila prépare un remède contre la fièvre du désert, mais il lui faut des roses des sables, ces fleurs de cristal rose qui poussent autour de l’Oasis.',
    steps: [
      { id: 'fleurs', type: 'item', item: 'fleur_sable', n: 4, text: 'Cueillir 4 roses des sables (Oasis et Dunes)', zone: 'oasis' },
      { id: 'retour', type: 'talk', npc: 'djamila', text: 'Les apporter à Djamila (marché)', zone: 'cite' },
    ],
    rewards: { xp: 90, ecus: 50, items: { the_menthe: 3 }, unlock: ['teinte_sable'], pa: [60, 20] },
  },
  s_jarres: {
    kind: 'side', island: 'desert', title: 'Les jarres des anciens', giver: 'leila', requires: 'q_echos',
    summary: 'Leïla, la potière, cherche trois jarres vernies de l’ancien temple : l’une près de l’Oasis, une autre dans les Dunes, la dernière au fond du Temple enseveli.',
    steps: [
      { id: 'jarres', type: 'item', item: 'jarre_ancienne', n: 3, text: 'Retrouver 3 jarres anciennes (Oasis, Dunes, Temple enseveli)', zone: 'oasis' },
      { id: 'retour', type: 'talk', npc: 'leila', text: 'Les rapporter à Leïla (atelier)', zone: 'cite' },
    ],
    rewards: { xp: 130, ecus: 80, items: { elixir_echo: 2 }, unlock: ['teinte_rouille'], pa: [80, 30] },
  },
  s_scorpions: {
    kind: 'side', island: 'desert', title: 'Chasseur de scorpions', giver: 'samir', requires: 'q_echos',
    summary: 'Samir veut débarrasser les pistes des scorpions qui dorment sous les pierres chaudes.',
    steps: [
      { id: 'chasse', type: 'kill', enemy: 'scorpion', n: 5, text: 'Vaincre 5 créatures des sables (Oasis, Dunes)', zone: 'dunes' },
      { id: 'retour', type: 'talk', npc: 'samir', text: 'Faire ton rapport à Samir', zone: 'cite' },
    ],
    rewards: { xp: 120, ecus: 120, items: { grande_potion: 1 }, unlock: ['tenue_chasseur'], pa: [80, 30] },
  },
  s_chameau: {
    kind: 'side', island: 'desert', title: 'Le collier de Pachà', giver: 'tarek', requires: 'q_echos',
    summary: 'Pachà, le chameau de Tarek, a perdu son collier de clochettes du côté de l’Oasis. Sans lui, il boude.',
    steps: [
      { id: 'trouver', type: 'item', item: 'collier_chameau', n: 1, text: 'Retrouver le collier de Pachà (Oasis, à l’est de l’étang)', zone: 'oasis' },
      { id: 'retour', type: 'talk', npc: 'tarek', text: 'Le rapporter à Tarek', zone: 'cite' },
    ],
    rewards: { xp: 70, ecus: 60, items: { datte: 5 }, pa: [50, 15] },
  },
  s_tablettes: {
    kind: 'side', island: 'desert', title: 'Les tablettes d’écho', giver: 'idris', requires: 'q_echos',
    summary: 'Idris, l’archéologue, veut retrouver trois tablettes d’argile qui répètent des phrases des anciens : une dans les Dunes, deux dans le Temple enseveli.',
    steps: [
      { id: 'tablettes', type: 'item', item: 'tablette_echo', n: 3, text: 'Retrouver 3 tablettes d’écho (Dunes, Temple enseveli)', zone: 'dunes' },
      { id: 'retour', type: 'talk', npc: 'idris', text: 'Les apporter à Idris', zone: 'cite' },
    ],
    rewards: { xp: 150, ecus: 90, items: { burnous_echo: 1 }, pa: [90, 35] },
  },
  s_lampions_d: {
    kind: 'side', island: 'desert', title: 'Les lampions de la Cité', giver: 'nour', requires: 'q_echos',
    summary: 'Nour, l’aubergiste, regrette les veillées d’avant le sable. Les sept lampions de la Cité sont éteints. Fia sait les rallumer.',
    steps: [
      { id: 'lampions', type: 'count', what: 'lampions', n: 7, text: 'Rallumer les 7 lampions de la Cité des Échos', zone: 'cite' },
      { id: 'retour', type: 'talk', npc: 'nour', text: 'Prévenir Nour (Auberge de l’Oasis)', zone: 'auberge_d' },
    ],
    rewards: { xp: 80, ecus: 80, items: { the_menthe: 3, datte: 3 }, unlock: ['teinte_ambre'], pa: [50, 20] },
  },
  s_colis_d: {
    kind: 'side', island: 'desert', title: 'Livraison caravanière', giver: 'kassim', requires: 'q_echos',
    summary: 'Kassim a un colis pour Leïla, qui doit à son tour envoyer des épices à Samir. Tout le monde est pressé dans la Cité, sauf les chameaux de Kassim.',
    steps: [
      { id: 'leila', type: 'talk', npc: 'leila', text: 'Porter le colis de Kassim à Leïla', zone: 'cite' },
      { id: 'samir', type: 'talk', npc: 'samir', text: 'Apporter le sachet d’épices à Samir', zone: 'cite' },
      { id: 'retour', type: 'talk', npc: 'kassim', text: 'Rendre compte à Kassim (caravane)', zone: 'cite' },
    ],
    rewards: { xp: 90, ecus: 100, items: { elixir_echo: 2, the_menthe: 2 }, pa: [50, 20] },
  },
};
