/* =========================================================
   LUMEN — ALTITUDE (logique pure, aucun rendu : utilisable par le jeu ET par les outils node).

   Modèle de données (voir DESIGN.md §« Altitude » et HANDOFF.md) :
     - chaque zone peut porter  h : niveau de base de la zone (entier, défaut 0)
                                 hmap : tableau de lignes de la même taille que `map`,
                                        un caractère par case : '0'-'9' puis 'a'-'z' = niveaux 0 à 35
                                        (espace, '.', '_' ou caractère absent = 0) ;
       niveau d'une case = h + valeur de hmap. Absence de h et de hmap = 0 : l'île est plate, rien ne change.
     - un pont peut porter  h : niveau (nombre) ou tableau (un niveau par case). Sans h, ses cases sont
       interpolées entre les sols qui touchent ses deux extrémités.
     - 1 niveau = HU = 0,75 unité 3D. Une case fait T = 2 unités de côté.
     - règle de marche : deux cases voisines sont franchissables si |Δniveau| ≤ MAX_STEP (= 1 niveau :
       marche, escalier ou rampe). Au-delà c'est une FALAISE : infranchissable, rendue comme paroi rocheuse.

   heightAt(x, z) : hauteur du sol en unités 3D au point (x, z) MONDE (x = 2 × colonne, z = 2 × ligne).
   Continue, lissée bilinéairement entre les centres de cases ; une falaise coupe l'interpolation (le point
   garde la hauteur de sa propre case), pour que les parois restent verticales.

   Convention de rendu : la « hauteur logique » d'un objet dynamique (joueur, ennemi, projectile…) est sa
   hauteur AU-DESSUS DU SOL LOCAL ; le moteur ajoute heightAt(x, z) au moment du rendu (world/lift.js).
   ========================================================= */
export const HU = 0.75;
export const MAX_STEP = 1;
const T = 2;
const EPS = 1e-6;

const CH = '0123456789abcdefghijklmnopqrstuvwxyz';
export const levelOfChar = (c) => { const i = CH.indexOf((c || '0').toLowerCase()); return i < 0 ? 0 : i; };

/* Construit isl.hgt (niveau par case, null = pas de sol) et isl.alt (vrai si l'île a un relief). */
export function attachAltitude(isl, def) {
  const { w, h } = isl;
  let any = false;
  const hgt = Array.from({ length: h }, () => Array(w).fill(null));
  def.zones.forEach((z) => {
    const base = Number(z.h) || 0;
    if (base) any = true;
    z.map.forEach((row, ly) => {
      for (let lx = 0; lx < row.length; lx++) {
        if (row[lx] === ' ') continue;
        const hm = z.hmap && z.hmap[ly] ? z.hmap[ly][lx] : undefined;
        const lv = base + (hm === undefined ? 0 : levelOfChar(hm));
        if (lv) any = true;
        hgt[z.oy + ly][z.ox + lx] = lv;
      }
    });
  });
  const hasBridgeH = (def.bridges || []).some((b) => b.h !== undefined);
  if (!any && !hasBridgeH) { isl.alt = false; isl.hgt = null; return; }
  /* ponts : niveau explicite (b.h) ou interpolation entre les sols aux deux extrémités */
  const landAround = (x, y) => {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = (hgt[y + dy] || [])[x + dx]; if (v !== null && v !== undefined && isl.terrain[y + dy][x + dx] !== '=') return v; }
    return null;
  };
  (def.bridges || []).forEach((b) => {
    const n = b.cells.length;
    let l0 = null, l1 = null;
    if (b.h === undefined) { l0 = landAround(...b.cells[0]); l1 = landAround(...b.cells[n - 1]); if (l0 === null) l0 = l1; if (l1 === null) l1 = l0; }
    b.cells.forEach(([x, y], i) => {
      let lv = 0;
      if (Array.isArray(b.h)) lv = b.h[i] === undefined ? 0 : Number(b.h[i]);
      else if (b.h !== undefined) lv = Number(b.h);
      else if (l0 !== null) lv = l0 + (l1 - l0) * ((i + 1) / (n + 1));
      hgt[y][x] = lv;
    });
  });
  isl.alt = true; isl.hgt = hgt;
}

export const levelAt = (isl, x, y) => (isl && isl.alt && isl.hgt[y] ? (isl.hgt[y][x] === undefined ? null : isl.hgt[y][x]) : null);
export const connectedLv = (a, b) => a === null || b === null || Math.abs(a - b) <= MAX_STEP + EPS;
/* vrai si l'on peut passer de la case (x0,y0) à la case voisine (x1,y1) du point de vue de l'altitude */
export function stepOk(isl, x0, y0, x1, y1) {
  if (!isl || !isl.alt) return true;
  return connectedLv(levelAt(isl, x0, y0), levelAt(isl, x1, y1));
}

/* hauteur du sol (unités 3D) au point monde (wx, wz), le point étant considéré comme appartenant à la case (cx, cy)
   (utile pour les sommets posés exactement sur une frontière de case : le maillage l'évalue case par case) */
export function heightOfCell(isl, cx, cy, wx, wz) {
  if (!isl || !isl.alt) return 0;
  const u = wx / T, v = wz / T, i0 = Math.floor(u), j0 = Math.floor(v), fx = u - i0, fy = v - j0;
  const lc = levelAt(isl, cx, cy);
  const s = [levelAt(isl, i0, j0), levelAt(isl, i0 + 1, j0), levelAt(isl, i0, j0 + 1), levelAt(isl, i0 + 1, j0 + 1)];
  let fb = lc;
  if (fb === null) { const ok = s.filter((q) => q !== null); fb = ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : 0; }
  const q = s.map((x) => (x === null || (lc !== null && Math.abs(x - lc) > MAX_STEP + EPS) ? fb : x));
  return ((q[0] * (1 - fx) + q[1] * fx) * (1 - fy) + (q[2] * (1 - fx) + q[3] * fx) * fy) * HU;
}
export const heightOf = (isl, wx, wz) => (isl && isl.alt ? heightOfCell(isl, Math.round(wx / T), Math.round(wz / T), wx, wz) : 0);

/* Île active du jeu (posée par main.js) : heightAt(x, z) est l'API unique utilisée par le rendu, le joueur,
   les PNJ, les ennemis, les projectiles, les objets, les effets, la caméra… */
let ACTIVE = null;
export const setActiveIsland = (isl) => { ACTIVE = isl; };
export const heightAt = (wx, wz) => (ACTIVE && ACTIVE.alt ? heightOf(ACTIVE, wx, wz) : 0);
export const hasRelief = () => !!(ACTIVE && ACTIVE.alt);
