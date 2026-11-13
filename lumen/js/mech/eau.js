/* =========================================================
   LUMEN — Acte IV, Les Abysses Miroirs : mécaniques de l’eau et de l’orbe.
   Logique pure (aucun rendu), utilisée par logic.js, les outils de vérification et main.js.
   - bassin (« pool ») : eau miroir. Niveau haut : infranchissable, renvoie toute lumière
     dans le sens de sa flèche (o). Niveau bas : lit sec, on marche et la lumière passe.
     Le niveau dépend d’une vanne (valve) ; inv:true inverse la relation ; sans vanne, le bassin est toujours en eau.
   - vanne (« valve ») : objet de la salle, état 0 = niveau bas, 1 = niveau haut. Se manœuvre depuis une case voisine.
   - socle (« socle ») : l’orbe de Fia (capacité « orbe ») s’y pose et émet un faisceau (couleur du socle, blanc par défaut).
     Une seule orbe dans l’île : isl.orb = { at: id du socle | null, dir }.
   - corniche (« ledge ») : point d’envol du plané (capacité « planer »), relie deux corniches de part et d’autre d’un vide.
   ========================================================= */
const DIR = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const ORD = ['N', 'E', 'S', 'W'];

export const GLIDE_RANGE = 7;
export const SPECIAL_RIGHT = new Set(['valve', 'socle']);   // objets « rot » qui ne se tournent pas comme une lanterne

/* Le bassin est-il en eau (niveau haut) ? */
export function poolUp(isl, e) {
  if (e.valve === undefined || e.valve === null) return true;
  const v = isl.valves && isl.valves[e.valve];
  const high = v ? v.state === 1 : true;
  return e.inv ? !high : high;
}
export const poolDir = (e) => (DIR[e.o] ? e.o : 'N');

/* Source de lumière de l’orbe : { x, y, d, c } ou null */
export function orbSource(isl) {
  if (!isl.orb || !isl.orb.at) return null;
  const s = isl.orbSocles && isl.orbSocles[isl.orb.at];
  return s ? { x: s.x, y: s.y, d: DIR[isl.orb.dir] ? isl.orb.dir : 'E', c: s.color || 'w', from: 0.32 } : null;
}

/* Action sur un socle : pose l’orbe ici si elle est ailleurs, sinon la tourne (back : sens inverse). */
export function orbAct(isl, socle, back) {
  if (!isl.orb) return null;
  if (isl.orb.at !== socle.id) { isl.orb.at = socle.id; return 'pose'; }
  const n = back ? 3 : 1;
  for (let i = 0; i < n; i++) isl.orb.dir = ORD[(ORD.indexOf(isl.orb.dir) + 1) % 4];
  return 'tourne';
}

/* Liaisons de plané depuis une corniche : de l’autre côté d’un vide (case vide, eau, pont éteint, bassin en eau), une autre corniche en ligne droite. */
export function glideLinks(isl, ledge, walkable) {
  const out = [];
  for (const d of ORD) {
    const [dx, dy] = DIR[d];
    let gap = 0;
    for (let k = 1; k <= GLIDE_RANGE; k++) {
      const x = ledge.x + dx * k, y = ledge.y + dy * k;
      if (x < 0 || y < 0 || x >= isl.w || y >= isl.h) break;
      const t = isl.terrain[y][x];
      if (['#', 'T', 'H', 'c', 'r'].includes(t)) break;
      if (t === 'x' && !(isl.gates[isl.gateCell[x + ',' + y]] || {}).open) break;
      const e = isl.entAt[x + ',' + y];
      if (e && e.t === 'ledge') { if (gap > 0 && walkable(isl, x, y)) out.push({ dir: d, to: e, land: [x, y], gap, from: ledge }); break; }
      if (e && e.t === 'pool' && !poolUp(isl, e)) break;
      if (e && e.t !== 'pool' && e.t !== 'shard' && e.t !== 'page' && e.t !== 'wisp') break;
      if (t === ' ' || t === '~' || (t === '=' && !(isl.gates[isl.gateCell[x + ',' + y]] || {}).open) || (e && e.t === 'pool')) gap++;
      else if (walkable(isl, x, y)) break;   // un sol marchable sans corniche : la corniche n’est pas en face d’un vide
    }
  }
  return out;
}
