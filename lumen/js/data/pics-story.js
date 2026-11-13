/* =========================================================
   LUMEN — Acte V, Les Pics du Vent : personnages, dialogues et quêtes.
   Fusionnés dans NPCS (npcs.js) et QUESTS (quests.js) par une ligne en bas de chaque fichier.
   Conventions : voir npcs.js et quests.js. Aucune condition n'utilise autre chose que flag / quest / step / has / count.
   ========================================================= */
import { ISLANDS } from '../levels.js';

const S = (q, id, st) => q.quest(id) === 'active' && q.step(id) === st;
const FIA = (t) => ({ who: 'fia', t });
const LYRA = (t) => ({ who: 'lyra', t });
/* Tant que les Abysses Miroirs (Acte IV) ne sont pas fusionnées, Zéphyr ramène vers la Forêt de Verre ; ensuite, le passage par les Abysses prend le relais. */
const sansAbysses = () => !ISLANDS.some((i) => i.id === 'abysses');

export const NPCS_PICS = {
  /* ---------------- Borée, doyen du Col ---------------- */
  boree: {
    name: 'Borée', role: 'Doyen du Col',
    look: { hair: 'long', hairHex: '#e4e2ee', skinHex: '#c99772', outfit: 'aube', cloakHex: '#8a7fd0', tunicHex: '#5a5aa8', trimHex: '#d7dbe8', beard: '#e4e2ee', scale: 1.02, staff: true },
    talk: [
      {
        if: (q) => S(q, 'q_pics', 'parler'),
        say: [
          'Une voyageuse, enfin. Je me nomme Borée. Je garde le Col depuis que le vent a cessé de souffler… et ça fait trop longtemps.',
          FIA('Les drapeaux pendent tout droits ! Et ce moulin, là-bas, il ne tourne pas du tout !'),
          'Les moulins des Pics vivent de vent. Les Courants, à l’est, portaient jadis les voyageurs d’un pic à l’autre. Maintenant, ils dorment, et les pierres de vent ne répondent plus à personne.',
          'Il y a pourtant un moyen de les réveiller. Alizée, notre guetteuse, sait coudre la voile qui permet de planer. Elle est près de la forge de Frimas. Va la voir, puis traverse les Courants jusqu’à la Terrasse des Girouettes.',
          'Là-haut, la lumière ne voyage pas seule : on t’y apprendra des relais qui gardent un éclat, quelques secondes, pour le rendre plus tard.',
        ],
        do: [{ step: 'q_pics' }],
      },
      {
        if: (q) => S(q, 'q_pics', 'voile'),
        say: ['Alizée t’attend près de la forge de Frimas, à l’ouest de la place. Sans sa voile, les Courants ne sont qu’un vide.'],
      },
      {
        if: (q) => q.quest('q_pics') === 'active' && (q.step('q_pics') === 'courants' || q.step('q_pics') === 'terrasse'),
        say: ['Les Courants sont à l’est, au bout de la grand-rue. Place-toi à côté d’une pierre de vent, face à celle d’en face, et laisse la voile faire. Chaque salle a sa lumière à guider, de part et d’autre du vide.'],
      },
      {
        if: (q) => S(q, 'q_pics', 'retour'),
        say: [
          LYRA('Les trois salles sont franchies, Borée. J’ai vu la Terrasse des Girouettes. Toutes montrent le sud.'),
          'Le sud… Le moulin du Grand Meunier. Voilà pourquoi tout s’est tu : son cœur s’est arrêté, et il est devenu pierre, avec ses pales et sa colère.',
          'Les Pentes du Col mènent à son moulin. Les ronces de givre ne cèdent qu’à une vraie lame ; Frimas en vend une, ou t’en forgera une. Prends des potions chez Gentiane, et reposes-toi au Chamois endormi avant d’y aller.',
          FIA('Un meunier de pierre… J’espère qu’il aime les lumières.'),
        ],
        do: [{ step: 'q_pics' }, { open: 'b_pentes' }],
      },
      {
        if: (q) => q.quest('q_moulins') === 'active' && !q.flag('boss_meunier'),
        say: ['Les Pentes, puis le Moulin du Grand Meunier, tout au sud. Dedans, les relais à ressort demandent des gestes vifs : un seul faisceau, plusieurs cristaux, et le temps qui presse.', 'Les bouquetins chargent en ligne droite. Esquive de côté, et ils s’étourdiront contre la roche.'],
      },
      {
        if: (q) => S(q, 'q_moulins', 'retour'),
        say: [
          LYRA('Le Grand Meunier est tombé. Voici son cœur.'),
          'Une meule de cristal, qui bat encore… Donne-la-moi. Je vais la porter au moulin du Col : ses pales tourneront de nouveau, et avec elles, le premier vent.',
          'Écoute… Là-bas, sur la Terrasse. Les girouettes bougent. Le pont des Sommets se déploie.',
          'Au bout des Sommets se dresse le Phare des Vents. Les dalles de pierre y montent quand elles sont éclairées, et les relais n’y gardent la lumière qu’un souffle. Va, Lyra. Et ne perds pas ta voile.',
        ],
        do: [{ take: 'coeur_moulin', n: 1 }, { step: 'q_moulins' }, { open: 'b_sommets' }],
      },
      {
        if: (q) => q.quest('q_phare_vents') === 'active' && q.step('q_phare_vents') !== 'retour',
        say: ['Le pont de la Terrasse mène au Névé, puis aux Crêtes. Plane au-dessus des gouffres, et fais monter les dalles : le Phare des Vents est tout au bout.', 'Il lui faut le rouge, le bleu et le magenta, en même temps. Trois lumières qui ne se ressemblent pas, et le courage de défaire ce qui a ouvert les portes.'],
      },
      {
        if: (q) => S(q, 'q_phare_vents', 'retour'),
        say: [
          LYRA('Le Phare des Vents brille, Borée. Et le fragment violet est ici.'),
          'Je l’ai vu d’ici. Une colonne violette, puis tous les drapeaux du Col qui se sont dressés d’un coup, comme des oiseaux. Les moulins tournent… tous. Même celui de Tourmente, tu m’avais dit ?',
          'Ce fragment, je le garde. Mais je te dois quelque chose, en échange. Orin l’appelait le « don des Portails » : une paire de portes de lumière, que tu poses toi-même, et qui s’ouvrent l’une sur l’autre. Pose-en une ici, une plus loin : tu entreras par l’une et sortiras par l’autre.',
          FIA('Des portails ! Alors on pourra aller où on veut, du moment qu’on y a posé le deuxième !'),
          'Pas où tu veux : où tu as déjà mis les pieds. C’est déjà beaucoup. La Citadelle du Zénith t’attend, tout là-haut, là où la lumière commence. Le chemin n’est pas encore sûr. Repose-toi d’abord.',
        ],
        do: [{ take: 'prisme_violet', n: 1 }, { step: 'q_phare_vents' }, { flag: 'acte5_fini' }, { teach: 'portails' }],
      },
      {
        if: (q) => q.quest('q_phare_vents') === 'done',
        say: ['Le Col respire de nouveau. Les drapeaux claquent, les moulins chantent. Chaque fois que le vent se lève, je pense à toi.', 'Il reste de quoi t’occuper : les fanions, les cerfs-volants d’Edel, les lettres de Rafale. Le Col te doit bien ça.'],
      },
      { if: () => true, say: ['Le Col vous salue, voyageuse. Le vent reviendra. Il revient toujours, dit-on, à ceux qui l’attendent debout.'] },
    ],
  },

  /* ---------------- Alizée, guetteuse des vents ---------------- */
  alizee: {
    name: 'Alizée', role: 'Guetteuse des vents',
    look: { hair: 'tresse', hairHex: '#3a2f5a', skinHex: '#d9ab84', outfit: 'exploratrice', cloakHex: '#7a6ad0', tunicHex: '#e6e0f5', trimHex: '#f0c66b', acc: 'lunettes', scale: 0.98 },
    talk: [
      {
        if: (q) => S(q, 'q_pics', 'voile'),
        say: [
          'Borée t’envoie ? Alors tu veux traverser les Courants. J’ai cousu cette voile pendant des nuits sans vent, en espérant servir à quelqu’un.',
          FIA('Elle est toute légère ! On dirait un nuage plié en quatre.'),
          'Deux baleines, de la soie claire : rien de plus. Le secret, c’est la pierre de vent. Il y en a deux qui se font face, de chaque côté d’un vide. Tu te places à côté de l’une, tournée vers l’autre, et tu agis : la voile s’ouvre, le courant te porte jusqu’à l’autre rive, et tu te poses juste derrière.',
          'Une fois sur l’autre rive, tourne ce qu’il faut des deux côtés, car la lumière traverse aussi le vide. Et si tu tombes… tu ne tombes pas : les pierres te ramènent.',
          'Les Courants sont à l’est de la place. Bon vent !',
        ],
        do: [{ give: 'voile_vent' }, { teach: 'planer' }, { open: 'b_courants' }, { step: 'q_pics' }],
      },
      {
        if: (q) => S(q, 's_fanions', 'retour'),
        say: ['Sept fanions hissés, et tous au vent… enfin, au futur vent. Regarde-les pendre : même mous, ils ont de l’allure. Prends ça : la teinte de brume de cime, que la neige a tissée.'],
        do: [{ step: 's_fanions' }],
      },
      {
        if: (q) => q.quest('s_fanions') === 'active',
        say: (q) => [`Fanions hissés : ${Math.min(7, q.count('fanions'))} sur 7. Les mâts sont autour de la place du Col, et il y en a encore au Névé et sur les Crêtes. Fia n’a qu’à les effleurer.`],
      },
      {
        if: (q) => q.quest('q_phare_vents') === 'done',
        say: ['Les drapeaux du Col claquent. Je ne t’avais pas dit : je n’avais jamais entendu ça. Le vent qui s’engouffre dans le tissu… ça fait un bruit de mille ailes.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_fanions') === 'none', say: ['Les fanions du Col, plus personne ne les hisse. Sept, si tu veux bien : ceux de la place, c’est un début.'], do: [{ start: 's_fanions' }] },
          { t: 'Au revoir' },
        ],
      },
      {
        if: () => true,
        say: ['Je guette les vents depuis la place. Aujourd’hui : rien. Ni brise, ni souffle. Même les girouettes dorment.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_fanions') === 'none', say: ['Les fanions du Col, plus personne ne les hisse. Sept, si tu veux bien : ceux de la place, c’est un début.'], do: [{ start: 's_fanions' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Frimas, forgeron ---------------- */
  frimas: {
    name: 'Frimas', role: 'Forgeron',
    look: { hair: 'court', hairHex: '#d9d9e8', skinHex: '#a8714d', outfit: 'tablier', tunicHex: '#4a5a8a', apronHex: '#cfd2e0', trimHex: '#c9805a', beard: '#d9d9e8', scale: 1.1 },
    talk: [
      {
        if: (q) => S(q, 's_chasse_pics', 'retour'),
        say: ['Douze ! Les bouquetins ne descendront plus aux étals. Tiens, la teinte violette des cimes : je la tire d’une pierre qu’on ne trouve que là-haut.'],
        do: [{ step: 's_chasse_pics' }],
      },
      {
        if: (q) => q.quest('s_chasse_pics') === 'active',
        say: (q) => [`Créatures vaincues : ${Math.min(12, q.count('kills'))} sur 12. Les bouquetins chargent en ligne droite : esquive sur le côté, puis frappe.`],
      },
      {
        if: () => true,
        say: ['Le froid rend l’acier sage. Tu veux de la lame, de la tenue, ou juste du feu pour te réchauffer ?'],
        choices: [
          { t: 'Voir les marchandises', do: [{ shop: 'frimas' }] },
          { t: 'Améliorer mon équipement', do: [{ forge: true }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_chasse_pics') === 'none' && q.quest('q_pics') === 'done', say: ['Les bouquetins et les givrelins descendent jusqu’à mon enclume. Douze de moins, et je pourrai forger en paix.'], do: [{ start: 's_chasse_pics' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Gentiane, apothicaire ---------------- */
  gentiane: {
    name: 'Gentiane', role: 'Apothicaire',
    look: { hair: 'long', hairHex: '#c9b8e8', skinHex: '#efd0b4', outfit: 'robe', tunicHex: '#8fc7e8', trimHex: '#d7dbe8', acc: 'lunettes', scale: 0.97 },
    talk: [
      {
        if: (q) => S(q, 's_courrier', 'gentiane'),
        say: ['Une lettre de ma sœur, de l’autre côté des Pics ! Elle écrit enfin. Merci, coursière improvisée : voilà de quoi tenir la route.'],
        do: [{ take: 'lettre_pics', n: 1 }, { step: 's_courrier' }],
      },
      {
        if: (q) => S(q, 's_fleurs', 'retour'),
        say: ['Cinq edelweiss, bien laineux ! Laisse-moi piler tout ça… Trois tisanes des cimes pour toi, et cette teinture lavande : la couleur de la fleur de montagne au crépuscule.'],
        do: [{ take: 'edelweiss', n: 5 }, { step: 's_fleurs' }],
      },
      {
        if: () => true,
        say: ['Potions, élixirs, tisanes : tout ce qu’il faut pour un climat qui mord.'],
        choices: [
          { t: 'Acheter', do: [{ shop: 'gentiane' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_fleurs') === 'none', say: ['Mes onguents manquent d’edelweiss. Cinq fleurs, ce serait parfait : elles poussent sur les Pentes, et plus haut, sur les Crêtes.'], do: [{ start: 's_fleurs' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Flocon, aubergiste ---------------- */
  flocon: {
    name: 'Flocon', role: 'Aubergiste',
    look: { hair: 'chignon', hairHex: '#e8e2f0', skinHex: '#f6e3d3', outfit: 'tablier', tunicHex: '#8a7fd0', apronHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: (q) => S(q, 's_corne', 'retour'),
        say: ['La corne du vieux bouquetin des crêtes ! Je l’accrocherai au-dessus de la cheminée, à côté du chapeau d’Orin. Et voilà pour la peine : une paire de crampons, ça ne se refuse pas.'],
        do: [{ take: 'corne_cimes', n: 1 }, { step: 's_corne' }],
      },
      {
        if: () => true,
        say: (q) => [q.quest('q_pics') === 'active' && q.step('q_pics') === 'parler' ? 'Borée t’attend sur la place. Après, un lit et une soupe, si tu veux.' : 'Bienvenue au Chamois endormi ! Un lit, une soupe de montagne, et le vent reste dehors. Enfin, il n’y en a plus, mais c’est pareil.'],
        choices: [
          { t: 'Se reposer (soigne et sauvegarde)', do: [{ rest: true }] },
          { t: 'Voir la carte du jour', do: [{ shop: 'flocon' }] },
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_corne') === 'none' && q.quest('q_moulins') === 'done', say: ['Là-haut, sur les Crêtes, vit un vieux bouquetin dont on dit qu’il a la plus belle corne des Pics. Je rêve de l’accrocher au-dessus de ma cheminée. Tu veux bien ?'], do: [{ start: 's_corne' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Zéphyr, marchand et passeur ---------------- */
  zephyr: {
    name: 'Zéphyr', role: 'Marchand et passeur',
    look: { hair: 'boucles', hairHex: '#2a2230', skinHex: '#8d5b3e', outfit: 'exploratrice', cloakHex: '#b59cf0', tunicHex: '#f3e6c8', trimHex: '#f0c66b', scale: 1.0 },
    talk: [
      {
        if: () => true,
        say: ['Marchand le jour, passeur quand la brise le permet. Cristaux, fibre, bois : j’achète, je vends.'],
        choices: [
          { t: 'Acheter et vendre', do: [{ shop: 'zephyr', sell: true }] },
          { t: 'Retourner à la Forêt de Verre', if: () => sansAbysses(), do: [{ travel: { to: 'foret', zone: 'vitrebourg', cell: [12, 7] } }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Tourmente, meunier ---------------- */
  tourmente: {
    name: 'Tourmente', role: 'Meunier',
    look: { hair: 'court', hairHex: '#8a8a98', skinHex: '#d9ab84', outfit: 'tablier', tunicHex: '#7a6a5a', apronHex: '#efe8d8', trimHex: '#c9805a', beard: '#8a8a98', scale: 1.04 },
    talk: [
      {
        if: (q) => S(q, 's_courrier', 'tourmente'),
        say: ['Une lettre pour moi ? De la meunière de la vallée… Elle veut des nouvelles du moulin. Je lui répondrai qu’il dort, mais qu’il va se réveiller. Merci, petite.'],
        do: [{ take: 'lettre_pics', n: 1 }, { step: 's_courrier' }],
      },
      {
        if: (q) => S(q, 's_moulin', 'retour'),
        say: [
          'Une roue dentée, du bois, de la patience… Voilà. Écoute-le : il grince, il tousse, il tourne. Il tourne !',
          FIA('Les pales bougent ! Il y a un peu de vent, tout de même !'),
          'Pas encore : c’est la mécanique qui tourne à vide. Mais ça viendra. Prends cette teinte, la couleur des soirs de meunier.',
        ],
        do: [{ take: 'engrenage', n: 1 }, { take: 'bois', n: 3 }, { flag: 'moulin_col' }, { step: 's_moulin' }],
      },
      {
        if: (q) => q.quest('s_moulin') === 'active',
        say: ['Il me faut une roue dentée de cuivre, et trois morceaux de bois clair. Zéphyr en vend, du bois. Les engrenages… j’en ai vu un tomber sur les Pentes, du côté de la haie de ronces.'],
      },
      {
        if: (q) => q.flag('boss_meunier') && q.quest('q_phare_vents') !== 'done',
        say: ['Tu l’as vaincu… Le Grand Meunier, c’était mon maître. Il moulait le blé des Pics pour toute la vallée. Quand le vent a cessé, il a continué à tourner, tourner, jusqu’à devenir pierre.', 'Merci de l’avoir délivré. Il n’a pas souffert, je crois : c’était un vieil homme qui avait trop attendu.'],
      },
      {
        if: (q) => q.quest('q_phare_vents') === 'done',
        say: ['Les pales ont repris, tu as vu ? Toutes seules, et dans le bon sens. Mon maître aurait pleuré de joie. Moi, je pleure de farine dans l’œil.'],
      },
      {
        if: () => true,
        say: ['Mon moulin ne tourne plus depuis un an. Sans vent, pas de farine, sans farine, pas de pain. Et pas de pain, pas de Col.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_moulin') === 'none', say: ['Il me manque une roue dentée de cuivre, et du bois clair : trois morceaux. Avec ça, je remets au moins la mécanique en route.'], do: [{ start: 's_moulin' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Rafale, coursier ---------------- */
  rafale: {
    name: 'Rafale', role: 'Coursier',
    look: { hair: 'court', hairHex: '#d6aa5c', skinHex: '#f6e3d3', outfit: 'exploratrice', cloakHex: '#5a6ec8', tunicHex: '#e6e0f5', trimHex: '#d7dbe8', scale: 0.96 },
    talk: [
      {
        if: (q) => S(q, 's_courrier', 'retour'),
        say: ['Trois lettres, trois sourires ! Je n’aurais pas fait mieux. Enfin, j’aurais été plus vite. Tiens, pour la route : de quoi te remettre en jambes.'],
        do: [{ step: 's_courrier' }],
      },
      {
        if: (q) => q.quest('s_courrier') === 'active',
        say: ['Une lettre pour Gentiane, une pour Tourmente, une pour Cime, sur la Terrasse. Je la porterais bien moi-même, mais les Courants me donnent le vertige.'],
      },
      {
        if: () => true,
        say: ['Coursier des Pics, c’est un métier de jambes et de patience. Depuis que le vent a cessé, ça va plutôt mal : les lettres s’envolaient toutes seules, avant.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_courrier') === 'none' && q.quest('q_pics') === 'done', say: ['J’ai trois lettres en retard, et aucune envie de passer les Courants. Gentiane, Tourmente, et Cime, tout au bout, sur la Terrasse. Tu veux bien ?'], do: [{ start: 's_courrier' }, { give: 'lettre_pics', n: 3 }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Edel, enfant du Col ---------------- */
  edel: {
    name: 'Edel', role: 'Enfant du Col',
    look: { hair: 'carre', hairHex: '#8f6a3a', skinHex: '#f6e3d3', outfit: 'voyage', cloakHex: '#e8668a', tunicHex: '#f3e6c8', trimHex: '#f0c66b', scale: 0.7 },
    talk: [
      {
        if: (q) => S(q, 's_cerfvolant', 'retour'),
        say: ['Mes trois cerfs-volants ! Celui des Pentes, celui du Névé, celui des Crêtes ! Tu les as vraiment trouvés ? Tu es la meilleure ! Prends ça : la teinte givre, c’est la couleur du ciel quand il fait très froid.'],
        do: [{ take: 'cerf_volant', n: 3 }, { step: 's_cerfvolant' }],
      },
      {
        if: (q) => q.quest('s_cerfvolant') === 'active',
        say: (q) => [`Cerfs-volants retrouvés : ${Math.min(3, q.has('cerf_volant', 3) ? 3 : q.has('cerf_volant', 2) ? 2 : q.has('cerf_volant', 1) ? 1 : 0)} sur 3. Il y en a un sur les Pentes, de l’autre côté du ravin, un au Névé, et un sur les Crêtes, au milieu du vide.`],
      },
      {
        if: () => true,
        say: ['Je faisais voler mes cerfs-volants, avant ! Mais maintenant, ils tombent tout droit. Alors j’en ai perdu trois. Dans le vent… enfin, plus tard.'],
        choices: [
          { t: 'Tu as besoin d’aide ?', if: (q) => q.quest('s_cerfvolant') === 'none' && q.quest('q_pics') === 'done', say: ['Trois cerfs-volants, perdus là-haut : un sur les Pentes, un au Névé, un sur les Crêtes. Moi, je n’ai pas de voile pour y aller. Toi, si !'], do: [{ start: 's_cerfvolant' }] },
          { t: 'Au revoir' },
        ],
      },
    ],
  },

  /* ---------------- Cime, gardienne de la Terrasse ---------------- */
  cime: {
    name: 'Cime', role: 'Gardienne de la Terrasse',
    look: { hair: 'chignon', hairHex: '#b9a4ec', skinHex: '#c99772', outfit: 'aube', cloakHex: '#6a4bc0', tunicHex: '#8a7fd0', trimHex: '#d7dbe8', scale: 1.0, staff: true },
    talk: [
      {
        if: (q) => S(q, 's_courrier', 'cime'),
        say: ['Une lettre de Rafale… depuis un an qu’elle est en route. Elle est de mon frère, qui est parti dans la vallée. Merci, voyageuse. Je la lirai quand le vent sera revenu.'],
        do: [{ take: 'lettre_pics', n: 1 }, { step: 's_courrier' }],
      },
      {
        if: (q) => q.flag('boss_meunier') && q.quest('q_phare_vents') !== 'done',
        say: ['Le pont du Névé est déployé. Regarde les girouettes : elles tournent de nouveau, lentement, toutes vers le sud. C’est la route des Sommets.', 'Quand tu planeras là-haut, sois humble. Le vent des cimes ne pardonne pas la précipitation.'],
      },
      {
        if: (q) => q.quest('q_phare_vents') === 'done',
        say: ['Le Phare brille, les girouettes dansent. Je n’avais pas compris, avant, pourquoi Borée me demandait de garder cette terrasse. Maintenant, si.'],
      },
      {
        if: () => true,
        say: ['Bienvenue sur la Terrasse des Girouettes. Le sud est fermé : le pont ne se déploiera qu’une fois le moulin du Grand Meunier remis en marche.', 'En attendant, pose ton cristal de voyage ici : tu reviendras d’un pas.'],
      },
    ],
  },
};

/* Tessel (Forêt de Verre) : tant que les Abysses ne sont pas là, il propose la traversée vers les Pics. Fusionné dans npcs.js (voir bas de fichier). */
export const TESSEL_PICS_CHOICE = { t: 'Partir pour les Pics du Vent', if: (q) => q.flag('acte2_fini') && sansAbysses(), do: [{ travel: { to: 'pics', zone: 'col', cell: [12, 7] } }] };

export const QUESTS_PICS = {
  /* ================= Quêtes principales — Acte V : les Pics du Vent ================= */
  q_pics: {
    kind: 'main', island: 'pics', act: 5, title: 'Un souffle sur le Col', giver: 'boree',
    summary: 'Le vent a cessé de souffler sur les Pics. Borée, le doyen du Col, t’envoie chercher une voile auprès d’Alizée, puis réveiller les Courants.',
    steps: [
      { id: 'parler', type: 'talk', npc: 'boree', text: 'Parler à Borée sur la place du Col', zone: 'col' },
      { id: 'voile', type: 'talk', npc: 'alizee', text: 'Recevoir la voile d’Alizée, près de la forge', zone: 'col' },
      { id: 'courants', type: 'gates', gates: ['pg1', 'pg2', 'pg3'], text: 'Traverser les trois salles des Courants (à l’est du Col)', zone: 'cr1' },
      { id: 'terrasse', type: 'reach', zone: 'gir', text: 'Atteindre la Terrasse des Girouettes' },
      { id: 'retour', type: 'talk', npc: 'boree', text: 'Retourner voir Borée au Col', zone: 'col' },
    ],
    rewards: { xp: 520, ecus: 220, items: { grande_potion: 2 }, pa: [320, 110] },
  },
  q_moulins: {
    kind: 'main', island: 'pics', act: 5, title: 'Le moulin de pierre', giver: 'boree', after: 'q_pics',
    summary: 'Le moulin du Grand Meunier s’est arrêté, et avec lui tout le vent des Pics. Il faut descendre les Pentes, entrer dans le moulin et rendre son cœur au Col.',
    steps: [
      { id: 'pentes', type: 'reach', zone: 'pentes', text: 'Descendre aux Pentes du Col (au sud du village)' },
      { id: 'moulin', type: 'reach', zone: 'moulins', text: 'Couper la haie de ronces et entrer dans le moulin' },
      { id: 'salles', type: 'gates', gates: ['md_combat', 'md_light'], text: 'Briser le sceau et rallumer les trois relais du moulin', zone: 'moulins' },
      { id: 'meunier', type: 'flag', flag: 'boss_meunier', text: 'Vaincre le Grand Meunier', zone: 'moulins' },
      { id: 'retour', type: 'talk', npc: 'boree', text: 'Rapporter le cœur du moulin à Borée', zone: 'col' },
    ],
    rewards: { xp: 680, ecus: 300, items: { grande_potion: 2, tisane_cimes: 2 }, pa: [450, 160] },
  },
  q_phare_vents: {
    kind: 'main', island: 'pics', act: 5, title: 'Le Phare des Vents', giver: 'boree', after: 'q_moulins',
    summary: 'Le premier souffle est revenu, mais le Phare des Vents reste éteint. Il se dresse au bout des Sommets et exige le rouge, le bleu et le magenta en même temps.',
    steps: [
      { id: 'neve', type: 'reach', zone: 'so1', text: 'Prendre le pont de la Terrasse jusqu’au Névé' },
      { id: 'dalle', type: 'gates', gates: ['lf1'], text: 'Faire monter les dalles de la Dalle qui s’élève', zone: 'so2' },
      { id: 'cretes', type: 'reach', zone: 'so4', text: 'Planer au-dessus des Crêtes' },
      { id: 'souffle', type: 'gates', gates: ['lf3'], text: 'Allumer les trois relais du Souffle court', zone: 'so4' },
      { id: 'phare', type: 'gates', gates: ['end'], text: 'Rallumer le Phare des Vents : rouge, bleu et magenta ensemble', zone: 'phare_v' },
      { id: 'retour', type: 'talk', npc: 'boree', text: 'Annoncer la bonne nouvelle à Borée', zone: 'col' },
    ],
    rewards: { xp: 850, ecus: 400, items: { grande_potion: 3, pelisse_cimes: 1 }, pa: [600, 220] },
  },

  /* ================= Quêtes secondaires ================= */
  s_cerfvolant: {
    kind: 'side', island: 'pics', title: 'Les cerfs-volants d’Edel', giver: 'edel', requires: 'q_pics',
    summary: 'Edel a perdu trois cerfs-volants dans les Pics, là où le vent les a laissés tomber : de l’autre côté d’un vide, évidemment.',
    steps: [
      { id: 'cerfs', type: 'item', item: 'cerf_volant', n: 3, text: 'Retrouver les 3 cerfs-volants (Pentes, Névé, Crêtes)', zone: 'pentes' },
      { id: 'retour', type: 'talk', npc: 'edel', text: 'Les rapporter à Edel (place du Col)', zone: 'col' },
    ],
    rewards: { xp: 150, ecus: 110, items: { soupe_montagne: 2 }, unlock: ['teinte_givre'], pa: [90, 35] },
  },
  s_moulin: {
    kind: 'side', island: 'pics', title: 'La mécanique de Tourmente', giver: 'tourmente',
    summary: 'Tourmente, le meunier du Col, peut remettre la mécanique de son moulin en marche, s’il retrouve une roue dentée de cuivre et trois morceaux de bois clair.',
    steps: [
      { id: 'engrenage', type: 'item', item: 'engrenage', n: 1, text: 'Retrouver une roue dentée de cuivre (Pentes du Col)', zone: 'pentes' },
      { id: 'bois', type: 'item', item: 'bois', n: 3, text: 'Réunir 3 bois clairs (comptoir de Zéphyr)', zone: 'col' },
      { id: 'retour', type: 'talk', npc: 'tourmente', text: 'Les apporter à Tourmente (près du moulin)', zone: 'col' },
    ],
    rewards: { xp: 130, ecus: 90, items: { pain_miel: 2 }, unlock: ['teinte_violet'], pa: [80, 30] },
  },
  s_fleurs: {
    kind: 'side', island: 'pics', title: 'Des fleurs pour les onguents', giver: 'gentiane',
    summary: 'Gentiane prépare des onguents contre le froid, mais l’edelweiss se fait rare : il ne pousse qu’en altitude, souvent près d’un vide.',
    steps: [
      { id: 'fleurs', type: 'item', item: 'edelweiss', n: 5, text: 'Cueillir 5 edelweiss (Pentes, Névé, Crêtes)', zone: 'pentes' },
      { id: 'retour', type: 'talk', npc: 'gentiane', text: 'Les apporter à Gentiane (étal du Col)', zone: 'col' },
    ],
    rewards: { xp: 110, ecus: 70, items: { tisane_cimes: 3 }, unlock: ['teinture_lavande'], pa: [70, 25] },
  },
  s_chasse_pics: {
    kind: 'side', island: 'pics', title: 'Le gibier des cimes', giver: 'frimas', requires: 'q_pics',
    summary: 'Frimas ne peut plus forger en paix : les bouquetins et les givrelins descendent jusqu’à son enclume.',
    steps: [
      { id: 'chasse', type: 'kill', n: 12, text: 'Vaincre 12 créatures (Pentes, Névé, Crêtes)', zone: 'pentes' },
      { id: 'retour', type: 'talk', npc: 'frimas', text: 'Faire ton rapport à Frimas (forge)', zone: 'col' },
    ],
    rewards: { xp: 170, ecus: 130, items: { cristal_vent: 3 }, unlock: ['teinte_cime'], pa: [90, 35] },
  },
  s_fanions: {
    kind: 'side', island: 'pics', title: 'Les fanions du Col', giver: 'alizee',
    summary: 'Alizée aimerait voir flotter, un jour, les fanions du Col. Fia n’a qu’à les effleurer pour les hisser.',
    steps: [
      { id: 'fanions', type: 'count', what: 'fanions', n: 7, text: 'Hisser 7 fanions (Col, Névé, Crêtes)', zone: 'col' },
      { id: 'retour', type: 'talk', npc: 'alizee', text: 'Prévenir Alizée (place du Col)', zone: 'col' },
    ],
    rewards: { xp: 100, ecus: 80, items: { elixir: 2 }, pa: [60, 20] },
  },
  s_courrier: {
    kind: 'side', island: 'pics', title: 'Courrier en souffrance', giver: 'rafale', requires: 'q_pics',
    summary: 'Rafale a trois lettres en retard et aucune envie de passer les Courants. Une pour Gentiane, une pour Tourmente, une pour Cime, sur la Terrasse.',
    steps: [
      { id: 'gentiane', type: 'talk', npc: 'gentiane', text: 'Porter la première lettre à Gentiane (étal du Col)', zone: 'col' },
      { id: 'tourmente', type: 'talk', npc: 'tourmente', text: 'Porter la deuxième à Tourmente (moulin du Col)', zone: 'col' },
      { id: 'cime', type: 'talk', npc: 'cime', text: 'Porter la troisième à Cime (Terrasse des Girouettes)', zone: 'gir' },
      { id: 'retour', type: 'talk', npc: 'rafale', text: 'Rendre compte à Rafale (place du Col)', zone: 'col' },
    ],
    rewards: { xp: 120, ecus: 120, items: { elixir: 1, grande_potion: 1 }, pa: [80, 30] },
  },
  s_corne: {
    kind: 'side', island: 'pics', title: 'La corne du vieux bouquetin', giver: 'flocon', requires: 'q_moulins',
    summary: 'Flocon rêve d’accrocher au-dessus de sa cheminée la corne du plus vieux bouquetin des Crêtes. Il lui manque une voyageuse pour aller la chercher.',
    steps: [
      { id: 'corne', type: 'item', item: 'corne_cimes', n: 1, text: 'Rapporter la corne du bouquetin des Crêtes', zone: 'so3' },
      { id: 'retour', type: 'talk', npc: 'flocon', text: 'La donner à Flocon (auberge du Col)', zone: 'auberge_p' },
    ],
    rewards: { xp: 180, ecus: 150, items: { crampons_givre: 1 }, pa: [100, 40] },
  },
};
