/* =========================================================
   LUMEN — construction 3D du monde à partir de l'île logique :
   terrain par zone (thèmes), décor, bâtiments, portes et ponts,
   objets de lumière (lanternes, miroirs…), faisceaux, coffres,
   objets à ramasser. Aucun état de partie ici : seulement des vues.
   ========================================================= */
import * as THREE from 'three';
import { COLORS, DIRS } from '../logic.js';
import { hash, T, W, BEAM_Y } from '../engine/util.js';
import { U, tickGfx, patchSway, patchWater, glassTexture, shaftTexture, haloSprite, merge, mx, bakeStatic } from './gfx.js';
import { createLife } from './life.js';
import { abyssView, ABYSSES_ENTS } from './abysses.js';   /* ACTE IV */
import { heightOf, levelAt } from '../altitude.js';   /* ALTITUDE */
import { buildReliefMesh } from './relief.js';
import { hole } from './hole.js';
import { DESERT_THEMES, buildSplitter, buildSocle, desertTrees, desertProp, tickDesert } from './desert-props.js';   /* ACTE III */

const C = (hex) => new THREE.Color(hex);
const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.9 }, o));
export const glow = (hex, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });

/* Couleurs par thème */
const THEMES = {
  puzzle: { grass: '#78bd68', edge: '#92b862', path: '#d4c09a', dirt: '#8a6650', under: '#5d4b66', rock: '#9097ab', tuft: '#86c46a', leaves: [['#4f9a6a', '#5fae76', '#468a5f'], ['#f4a7c4', '#ec8db3', '#f7c1d6']], blossom: 0.65 },
  village: { grass: '#82c46c', edge: '#9bbd66', path: '#dcc9a4', dirt: '#8a6650', under: '#5d4b66', rock: '#a29fb3', tuft: '#8cca6e', leaves: [['#4f9a6a', '#5fae76', '#468a5f'], ['#f4a7c4', '#ec8db3', '#f7c1d6']], blossom: 0.5 },
  lande: { grass: '#a8c070', edge: '#bcb872', path: '#cdb890', dirt: '#7a5a46', under: '#4e4060', rock: '#9a96a8', tuft: '#c2d078', leaves: [['#3f7a4f', '#4f8a5a', '#5a7a3f'], ['#c9a050', '#b98a3f', '#d9b060']], blossom: 0.25 },
  foret: { grass: '#66c4a4', edge: '#86d2b0', path: '#d6e8cc', dirt: '#6a5a4a', under: '#3f5a6a', rock: '#9fb8c8', tuft: '#8fe0c0', leaves: [['#5fd6cc', '#6fe6d6', '#4fc4b8'], ['#b8f0fa', '#96e2f4', '#d0f6fc']], blossom: 0.55, glass: true, cliff: '#c6e4ec', wall: '#8fb8b0' },
  canopee: { grass: '#7fd8bf', edge: '#a0e6d0', path: '#e6f4dc', dirt: '#8a7a5a', under: '#4f6f7a', rock: '#a8c4d0', tuft: '#a0ecd0', leaves: [['#6fe6d6', '#86f0e0', '#5fd6c6'], ['#c8f6fc', '#ffd8f0', '#e0fbff']], blossom: 0.5, glass: true, cliff: '#c2e2ea', wall: '#92bcb4' },
  phare_verre: { grass: '#8ad0c4', edge: '#a8e0d4', path: '#eaf4f0', dirt: '#6a7a8a', under: '#4a5f72', rock: '#b8d0dc', tuft: '#a8ecd8', leaves: [['#6fe6d6', '#86f0e0', '#5fd6c6'], ['#c8f6fc', '#d8e8ff', '#e0fbff']], blossom: 0.4, glass: true, cliff: '#c8e0ee', wall: '#94b4c4' },
  temple: { grass: '#7ea4bc', edge: '#6e96b0', path: '#8eb2c8', dirt: '#34485a', under: '#243444', rock: '#5c84a0', tuft: '#7fd6e8', leaves: [['#4a8aa0', '#5a9ab0', '#3a7a90'], ['#4a8aa0', '#5a9ab0', '#3a7a90']], blossom: 0, floor: true, cliff: '#8ab4d0', wall: '#6f9bb6' },
  sanctuaire: { grass: '#8a84ae', edge: '#7a74a0', path: '#938db6', dirt: '#3f3a55', under: '#2e2840', rock: '#615a86', tuft: '#8f7ad6', leaves: [['#5a4a8a', '#6a5a9a', '#4a3a7a'], ['#5a4a8a', '#6a5a9a', '#4a3a7a']], blossom: 0, floor: true },
  /* ACTE IV : Les Abysses Miroirs (turquoise, sable pâle, coraux) */
  greve: { grass: '#8ccfae', edge: '#b6e4c4', path: '#efe2bd', dirt: '#8a7a62', under: '#2f5a6a', rock: '#8fb4c0', tuft: '#a8e8c4', leaves: [['#4fc8b4', '#5fd6c0', '#3fb8a4'], ['#ff9f8a', '#ff7f9a', '#ffc0a8']], blossom: 0.45 },
  recifs: { grass: '#7ac8b0', edge: '#a0e0c8', path: '#e6dab4', dirt: '#7a6a58', under: '#2a5a6a', rock: '#7aa8b8', tuft: '#98e4c8', leaves: [['#3fb8c8', '#4fc8d8', '#2fa8b8'], ['#ff8f9a', '#ff6f8a', '#ffb0a8']], blossom: 0.6 },
  grotte: { grass: '#4a8a92', edge: '#3a7a84', path: '#5a9aa2', dirt: '#1f3a48', under: '#14283a', rock: '#3a6a7c', tuft: '#5fe0d0', leaves: [['#2f8a9a', '#3a9aaa', '#257a8a'], ['#2f8a9a', '#3a9aaa', '#257a8a']], blossom: 0, floor: true },
  lac: { grass: '#3f8a9a', edge: '#4a9aa8', path: '#6ab2b8', dirt: '#1b3646', under: '#12283a', rock: '#336a80', tuft: '#6ff0dc', leaves: [['#2f8a9a', '#3a9aaa', '#257a8a'], ['#2f8a9a', '#3a9aaa', '#257a8a']], blossom: 0, floor: true },
  phare_abysses: { grass: '#5aa8b4', edge: '#6ab8c0', path: '#8ad0d0', dirt: '#1f4658', under: '#16304a', rock: '#4a86a0', tuft: '#8ff8e8', leaves: [['#3a9aaa', '#4aaaba', '#2f8a9a'], ['#3a9aaa', '#4aaaba', '#2f8a9a']], blossom: 0, floor: true },
  interieur: { grass: '#a0714f', edge: '#8f6446', path: '#a0714f', dirt: '#5a3f2f', under: '#3a2a22', rock: '#e9dcc2', tuft: '#a0714f', leaves: [['#5fae76', '#4f9a6a', '#468a5f'], ['#5fae76', '#4f9a6a', '#468a5f']], blossom: 0, floor: true, wood: true },
};
Object.assign(THEMES, DESERT_THEMES);   /* ACTE III */
/* ACTE V */
import { THEMES_PICS } from './pics-themes.js';
Object.assign(THEMES, THEMES_PICS);
/* ACTE VI : la Citadelle du Zénith (blanc et or) */
Object.assign(THEMES, {
  zenith: { grass: '#f2ece0', edge: '#e6dcc6', path: '#f6e6b8', dirt: '#b8a888', under: '#9a8fa8', rock: '#efe8da', tuft: '#fff3cf', leaves: [['#f6e8b0', '#fff2c2', '#ecd98c'], ['#ffe0ec', '#ffd0e2', '#fff0f6']], blossom: 0.5 },
  jardins: { grass: '#d9ecc8', edge: '#eef0cc', path: '#f8ecc4', dirt: '#b8a888', under: '#9a8fa8', rock: '#f2ead8', tuft: '#f4f0b0', leaves: [['#f2e6a8', '#ffefb8', '#e6d68a'], ['#ffd6e6', '#ffc4dc', '#fff0f6']], blossom: 0.6 },
  salle: { grass: '#e8e0d0', edge: '#d8ccb4', path: '#ecdcae', dirt: '#6a5e50', under: '#4a4258', rock: '#f4eee0', tuft: '#ffe8a8', leaves: [['#f6e8b0', '#fff2c2', '#ecd98c'], ['#f6e8b0', '#fff2c2', '#ecd98c']], blossom: 0, floor: true },
  phare_zenith: { grass: '#f6f0e4', edge: '#ece2cc', path: '#fbe9b0', dirt: '#b0a080', under: '#8f86a0', rock: '#fbf6ea', tuft: '#fff3cf', leaves: [['#f6e8b0', '#fff2c2', '#ecd98c'], ['#ffe0ec', '#ffd0e2', '#fff0f6']], blossom: 0.3, floor: true },
});
const PORTAL_COLS = ['#7fe6ff', '#ffb0e8', '#ffe27a', '#a8ffb8'];   /* ACTE VI : une teinte par paire de portails */
const GLASS_COLS = ['#3fc8bc', '#4fc8f0', '#3fc8bc', '#7fe0a8', '#a890f0', '#f08cc4', '#f0cc6a', '#4fc8f0'];
export const themeOf = (z) => (z && z.theme) || 'puzzle';

export function buildWorld(scene, isl, def, opts = {}) {
  const LOW = !!opts.low;
  const root = new THREE.Group(); scene.add(root);
  const ALT = !!isl.alt;   /* ALTITUDE : vrai si l'île a du relief ; sinon H() vaut 0 partout et rien ne change */
  const H = (wx, wz) => (ALT ? heightOf(isl, wx, wz) : 0);
  const zones = def.zones;
  const terr = (x, y) => (y >= 0 && y < isl.h && x >= 0 && x < isl.w ? isl.terrain[y][x] : ' ');
  const isLand = (x, y) => { const t = terr(x, y); return t !== ' ' && t !== '='; };
  const M = {
    grass: mat('#ffffff', { roughness: 0.95 }), dirt: mat('#ffffff', { roughness: 1 }), under: mat('#ffffff', { roughness: 1 }),
    rock: mat('#ffffff'), foliage: mat('#ffffff', { roughness: 0.85 }), trunk: mat('#6b4a3a', { roughness: 1 }), tuft: mat('#ffffff', { roughness: 1 }),
    stone: mat('#d9d4e3', { roughness: 0.75 }), stoneDark: mat('#8c88a3', { roughness: 0.8 }), wood: mat('#a0714f'), woodDark: mat('#6b4a3a'),
    gold: mat('#e8b65a', { metalness: 0.7, roughness: 0.35 }), metal: mat('#3d3a52', { metalness: 0.6, roughness: 0.4 }),
    plaster: mat('#efe4cf'), roofRed: mat('#c0584a'), roofBlue: mat('#4f6fae'), roofBrown: mat('#7d5a4a'), roofSlate: mat('#5a5f78'),
    water: new THREE.MeshStandardMaterial({ color: '#5fa8e8', transparent: true, opacity: 0.82, roughness: 0.1, metalness: 0.2, emissive: '#1f5fa0', emissiveIntensity: 0.25 }),
    ring: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc861).multiplyScalar(2.6), transparent: true, opacity: 0.9 }),
    ghost: new THREE.MeshBasicMaterial({ color: 0x9be8ff, transparent: true, opacity: 0.1, depthWrite: false }),
    glass: new THREE.MeshStandardMaterial({ color: 0xdcefff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1, emissive: 0x9fc4ff, emissiveIntensity: 0.5, flatShading: true }),
    ronce: mat('#ffffff', { roughness: 0.9 }), thorn: mat('#c9b48a'), crack: mat('#a6a2b8', { roughness: 0.95 }),
  };
  patchSway(M.foliage, { amp: 0.035, speed: 1.1, key: 'fol' }); patchSway(M.tuft, { amp: 0.32, speed: 2.2, key: 'tuft' }); patchWater(M.water);
  M.glassLeaf = patchSway(new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.22, flatShading: true, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.72, depthWrite: false }), { amp: 0.03, speed: 1.0, pulse: 0.3, key: 'gleaf' });
  M.glassTrunk = new THREE.MeshStandardMaterial({ color: '#a8e4dc', emissive: '#3fb0b0', emissiveIntensity: 0.3, flatShading: true, roughness: 0.15, transparent: true, opacity: 0.82 });
  M.glassCore = new THREE.MeshBasicMaterial({ color: new THREE.Color('#8fffe0').multiplyScalar(1.2), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
  const envTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 32;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 32);
    gr.addColorStop(0, '#9ec4ff'); gr.addColorStop(0.5, '#ffe7c7'); gr.addColorStop(1, '#4b3f63');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 32);
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  M.mirror = new THREE.MeshStandardMaterial({ color: 0xeef4ff, metalness: 1, roughness: 0.06, envMap: envTex, envMapIntensity: 1.4 });

  /* ---------- Terrain : un groupe par zone (les intérieurs sont masqués dehors) ---------- */
  const dummy = new THREE.Object3D();
  function instanced(parent, geo, material, items, set, o = {}) {
    if (!items.length) return null;
    const m = new THREE.InstancedMesh(geo, material, items.length);
    items.forEach((it, i) => {
      dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
      const col = set(dummy, it, i);
      if (ALT && !o.noH) dummy.position.y += H(dummy.position.x, dummy.position.z);   /* ALTITUDE : posé sur le relief */
      dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      if (col) m.setColorAt(i, col);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = !!o.cast; m.receiveShadow = o.receive !== false;
    parent.add(m);
    return m;
  }
  const shafts = [];
  const zoneGroups = zones.map(() => { const g = new THREE.Group(); root.add(g); return g; });
  /* Détails (entités, meubles, coffres) rangés par quart de zone : on masque les quarts lointains (coût de dessin constant) */
  const cullers = [], quad = {};
  const detail = (zi, x, y) => {
    const z = zones[zi]; if (!z) return root;
    const w = z.map[0].length, h = z.map.length, qx = x < W(z.ox + w / 2) ? 0 : 1, qy = y < W(z.oy + h / 2) ? 0 : 1, key = zi * 4 + qx * 2 + qy;
    if (!quad[key]) { const g = new THREE.Group(); zoneGroups[zi].add(g); quad[key] = g; cullers.push({ g, x: W(z.ox + w * (qx ? 0.75 : 0.25)), z: W(z.oy + h * (qy ? 0.75 : 0.25)), r: Math.hypot(w, h) * T * 0.3 }); }
    return quad[key];
  };
  const camPos = new THREE.Vector3(1e6, 0, 1e6);
  { const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    const probe = new THREE.Mesh(tri, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false })); probe.frustumCulled = false; probe.renderOrder = -10;
    probe.onBeforeRender = (r, sc, cam) => camPos.setFromMatrixPosition(cam.matrixWorld); root.add(probe); }
  const cellIndex = { r: {}, c: {} };   // ronces / roches fissurées : index d'instance par case (pour les retirer)
  const meshes = { r: [], c: [] };
  const depthOf = {};
  const tileGeo = new THREE.BoxGeometry(T, 0.6, T), dirtGeo = new THREE.BoxGeometry(T, 1.8, T), underGeo = new THREE.ConeGeometry(T * 0.78, 1, 6);
  const wallGeo = new THREE.BoxGeometry(T, 1, T);
  const rockGeo = new THREE.DodecahedronGeometry(1, 0), trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.3, 6), crownGeo = new THREE.IcosahedronGeometry(0.85, 0);
  const bladeG = (h, w) => new THREE.ConeGeometry(w, h, 3).translate(0, h / 2, 0);
  const tuftGeo = merge([[bladeG(0.5, 0.075), mx(0, 0, 0, 0.12, 0, 0.08)], [bladeG(0.62, 0.08), mx(0.05, 0, 0.02, -0.1, 1.2, -0.12)], [bladeG(0.42, 0.07), mx(-0.05, 0, -0.03, 0.05, 2.4, 0.2)], [bladeG(0.34, 0.06), mx(0.0, 0, 0.06, 0.3, 3.6, 0.0)]]);
  /* fleur : cinq pétales en couronne + cœur, tête tournée vers le haut (plus de « fanion » penché) */
  const flowerGeo = merge([...[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2; return [new THREE.OctahedronGeometry(0.05, 0), mx(Math.cos(a) * 0.065, 0.31, Math.sin(a) * 0.065, 0, -a, 0, 1.35, 0.45, 0.85)]; }), [new THREE.OctahedronGeometry(0.05, 0), mx(0, 0.325, 0, 0, 0.4, 0, 0.9, 0.7, 0.9)]]);
  const stemGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.31, 4).translate(0, 0.15, 0), stemM = mat('#6fae5a');
  const pebbleGeo = new THREE.DodecahedronGeometry(0.16, 0);
  const ronceGeo = new THREE.IcosahedronGeometry(0.75, 0), thornGeo = new THREE.ConeGeometry(0.07, 0.4, 4);

  zones.forEach((z, zi) => {
    const th = THEMES[themeOf(z)] || THEMES.puzzle, G = zoneGroups[zi];
    const cells = [];
    z.map.forEach((row, ly) => { for (let lx = 0; lx < row.length; lx++) { const x = z.ox + lx, y = z.oy + ly; if (isl.zoneAt[y][x] === zi && isLand(x, y)) cells.push([x, y]); } });
    cells.forEach(([x, y]) => { let d = 0; for (let r = 1; r <= 4; r++) { let ok = true; for (let dy = -r; dy <= r && ok; dy++) for (let dx = -r; dx <= r; dx++) if (!isLand(x + dx, y + dy)) { ok = false; break; } if (!ok) break; d = r; } depthOf[x + ',' + y] = d; });
    const wallTheme = th.floor;   // sanctuaire / intérieur : '#' = murs hauts
    const floorCells = cells.filter(([x, y]) => !(wallTheme && terr(x, y) === '#'));
    const patch = (x, y) => (Math.sin(x * 0.33 + y * 0.21) + Math.sin(x * 0.12 - y * 0.29 + 1.7) + Math.sin((x + y) * 0.07)) * 0.022;
    const tileColor = (x, y) => {
      const t = terr(x, y), edge = depthOf[x + ',' + y] === 0;
      if (th.wood) return C((y % 2) ? '#b4825a' : '#a87650').offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.045 + ((x * 3 + y) % 4) * 0.008);
      if (th.floor) return C(((x + y) % 2) ? th.grass : th.edge).offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.04);
      if (t === ',' || t === 'r' && false) return C(th.path).offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.05 + patch(x, y) * 0.6);
      if (t === 'x') return C(th.path);
      return C(edge ? th.edge : th.grass).offsetHSL((hash(x, y, 2) - 0.5) * 0.02 + patch(x, y) * 0.3, 0, (hash(x, y, 3) - 0.5) * 0.03 + patch(x, y));
    };
    /* ALTITUDE : une zone a du relief si l'un de ses sols n'est pas au niveau 0 ou touche un sol d'un autre niveau.
       Elle reçoit alors un maillage à hauteurs par sommet (relief.js) à la place des dalles, de la terre et des falaises. */
    const hasRelief = ALT && !z.interior && cells.some(([x, y]) => { const l = levelAt(isl, x, y); if (l) return true; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const q = isLand(x + dx, y + dy) ? levelAt(isl, x + dx, y + dy) : null; return q !== null && q !== l; }); });
    if (hasRelief) {
      if (!M.terrain) M.terrain = mat('#ffffff', { roughness: 0.95, vertexColors: true });
      G.add(buildReliefMesh(isl, zi, cells, th, tileColor, M.terrain));
    } else instanced(G, tileGeo, M.grass, floorCells, (o, [x, y]) => {
      o.position.set(W(x), -0.3 + (th.floor ? 0 : (hash(x, y, 1) - 0.5) * 0.025), W(y));
      return tileColor(x, y);
    });
    if (!z.interior) {
      if (!hasRelief) instanced(G, dirtGeo, M.dirt, cells, (o, [x, y]) => { o.position.set(W(x), -1.5, W(y)); return C(th.dirt).offsetHSL(0, 0, (hash(x, y, 4) - 0.5) * 0.08); });
      instanced(G, underGeo, M.under, cells, (o, [x, y]) => {
        const h = 2 + depthOf[x + ',' + y] * 2.4 + hash(x, y, 5) * 3;
        o.position.set(W(x) + (hash(x, y, 6) - 0.5) * 0.6, -2.4 - h / 2, W(y) + (hash(x, y, 7) - 0.5) * 0.6);
        o.rotation.set(Math.PI, hash(x, y, 8) * 6, 0); o.scale.set(1, h, 1);
        return C(th.under).offsetHSL(0, 0, (hash(x, y, 9) - 0.5) * 0.1 + 0.07); /* un peu plus clair : le dessous des îles n'est plus noir */
      }, { receive: false, noH: true });
    }
    // murs (donjon, intérieurs) ou rochers (extérieur)
    const rocks = cells.filter(([x, y]) => terr(x, y) === '#');
    if (wallTheme) {
      const hgt = z.interior ? 2.6 : 2.9;
      const lowRow = z.oy + z.map.length - 1;   // mur sud abaissé : la caméra voit l'intérieur
      /* CAMÉRA FIXE : un mur qui a du sol juste au nord (face sud, côté caméra) cacherait tout ce qui est posé sur la rangée devant lui
         (receveur, vanne, socle, coffre, PNJ) : il est abaissé en muret. Les murs de fond et de côté gardent leur hauteur. */
      const lowFront = (x, y) => { const n = terr(x, y - 1); return !!n && n !== '#' && n !== ' '; };
      const wallH = (x, y) => (z.interior ? (y === lowRow ? 0.45 : hgt) : lowFront(x, y) ? 0.95 : hgt);
      instanced(G, wallGeo, z.interior ? M.rock : M.rock, rocks, (o, [x, y]) => {
        const hh = wallH(x, y);
        o.position.set(W(x), hh / 2 - 0.02, W(y)); o.scale.set(1, hh, 1);
        if (z.interior) return C(((x + y) % 3 === 0) ? '#d9c9a8' : '#efe4cf');
        return C(th.rock).offsetHSL(0, 0, (hash(x, y, 17) - 0.5) * 0.1);
      }, { cast: !z.interior });
      if (z.interior) {
        instanced(G, new THREE.BoxGeometry(T * 1.02, 0.22, 0.3), M.woodDark, rocks.filter(([x, y]) => y !== z.oy + z.map.length - 1), (o, [x, y]) => { o.position.set(W(x), 2.0, W(y)); });
        // plinthes, et rainures du parquet (lames décalées)
        instanced(G, new THREE.BoxGeometry(T * 1.04, 0.42, T * 1.04), M.woodDark, rocks.filter(([x, y]) => y !== z.oy + z.map.length - 1), (o, [x, y]) => { o.position.set(W(x), 0.21, W(y)); }, { receive: false });
        const lamL = floorCells.flatMap(([x, y]) => [[x, y, 0], [x, y, 1], [x, y, 2]]);
        instanced(G, new THREE.BoxGeometry(T, 0.012, 0.04), mat('#5a3a26'), lamL, (o, [x, y, k]) => { o.position.set(W(x), 0.004, W(y) + (k - 1) * 0.5); }, { receive: false });
        instanced(G, new THREE.BoxGeometry(0.04, 0.012, 0.5), mat('#5a3a26'), floorCells.flatMap(([x, y]) => [0, 1, 2, 3].map((k) => [x, y, k])), (o, [x, y, k]) => { o.position.set(W(x) - 0.85 + ((x * 7 + y * 3 + k * 5) % 5) * 0.42, 0.004, W(y) + (k - 1.5) * 0.5); }, { receive: false });
        // fenêtres lumineuses sur les murs du fond
        const wins = rocks.filter(([x, y]) => y < z.oy + z.map.length - 1 && terr(x, y + 1) !== '#' && terr(x, y + 1) !== ' ' && hash(x, y, 140) < 0.45);
        instanced(G, new THREE.BoxGeometry(1.05, 1.0, 0.06), M.woodDark, wins, (o, [x, y]) => { o.position.set(W(x), 1.5, W(y) + T / 2 + 0.03); }, { receive: false });
        instanced(G, new THREE.BoxGeometry(0.85, 0.8, 0.07), glow('#bfe0ff', 1.15), wins, (o, [x, y]) => { o.position.set(W(x), 1.5, W(y) + T / 2 + 0.05); }, { receive: false });
        instanced(G, new THREE.BoxGeometry(0.07, 0.8, 0.09), M.woodDark, wins, (o, [x, y]) => { o.position.set(W(x), 1.5, W(y) + T / 2 + 0.06); }, { receive: false });
      }
      else {
        // cristaux sur les murs du sanctuaire
        const tips = rocks.filter(([x, y]) => hash(x, y, 40) < 0.18);
        instanced(G, new THREE.OctahedronGeometry(0.35, 0), glow('#9f7aff', 1.6), tips, (o, [x, y]) => { o.position.set(W(x) + (hash(x, y, 41) - 0.5), wallH(x, y) + 0.15, W(y) + (hash(x, y, 42) - 0.5)); o.scale.set(0.7, 1.6 + hash(x, y, 43), 0.7); o.rotation.y = hash(x, y, 44) * 3; }, { receive: false });
        instanced(G, new THREE.BoxGeometry(T * 1.04, 0.18, T * 1.04), mat('#7a74a0'), rocks, (o, [x, y]) => { o.position.set(W(x), wallH(x, y), W(y)); });
        // liseré lumineux au pied des murs, pilastres et dalles runiques : le donjon se lit mieux
        const rim = themeOf(z) === 'temple' ? '#7fe6ff' : '#b39cff';
        instanced(G, new THREE.BoxGeometry(T * 1.03, 0.1, T * 1.03), glow(rim, 1.1), rocks, (o, [x, y]) => { o.position.set(W(x), 0.06, W(y)); }, { receive: false });
        instanced(G, new THREE.BoxGeometry(0.4, hgt, 0.4), mat('#8d86b4'), rocks.filter(([x, y]) => hash(x, y, 150) < 0.3 && !lowFront(x, y)), (o, [x, y]) => { const sx = isLand(x + 1, y) && terr(x + 1, y) !== '#' ? 1 : isLand(x - 1, y) && terr(x - 1, y) !== '#' ? -1 : 0, sz = sx ? 0 : (terr(x, y + 1) !== '#' ? 1 : -1); o.position.set(W(x) + sx * 0.95, hgt / 2, W(y) + sz * 0.95); }, { cast: true });
        instanced(G, new THREE.BoxGeometry(1.1, 0.02, 1.1), glow(rim, 0.9), cells.filter(([x, y]) => terr(x, y) === '.' && hash(x, y, 151) < 0.12), (o, [x, y]) => { o.position.set(W(x), 0.005, W(y)); o.rotation.y = Math.PI / 4; }, { receive: false });
      }
    } else {
      instanced(G, rockGeo, M.rock, rocks.flatMap(([x, y]) => [[x, y, 0], [x, y, 1]]), (o, [x, y, k]) => {
        const s = k ? 0.45 : 0.78;
        o.position.set(W(x) + (k ? (hash(x, y, 10) - 0.5) * 1.1 : 0), (k ? 0.2 : 0.38) + hash(x, y, 11) * 0.2, W(y) + (k ? (hash(x, y, 12) - 0.5) * 1.1 : 0));
        o.rotation.set(hash(x, y, 13) * 3, hash(x, y, 14) * 6, hash(x, y, 15) * 3);
        o.scale.set(s, s * (0.75 + hash(x, y, 16) * 0.55), s);
        return C(th.rock).offsetHSL(0, 0, (hash(x, y, 17) - 0.5) * 0.12);
      }, { cast: true });
    }
    const trees = th.desert ? [] : cells.filter(([x, y]) => terr(x, y) === 'T');   /* ACTE III : palmiers et cactus */
    if (th.desert) desertTrees({ THREE, G, instanced, C, hash, W, cells: cells.filter(([x, y]) => terr(x, y) === 'T'), M, mat });
    const glassy = !!th.glass;
    const tk = (x, y) => 0.88 + hash(x, y, 18) * 0.34;                       // taille de l'arbre
    if (th.conifer) {   /* ACTE V : sapins enneigés */
      instanced(G, trunkGeo, M.trunk, trees, (o, [x, y]) => { const k = tk(x, y); o.position.set(W(x), 0.65 * k, W(y)); o.scale.set(k, k, k); }, { cast: true });
      const cone = new THREE.ConeGeometry(0.95, 1.5, 7), cap = new THREE.ConeGeometry(0.55, 0.62, 7), snowM = mat('#f4f8ff', { roughness: 1 });
      const lay = trees.flatMap(([x, y]) => [[x, y, 0], [x, y, 1], [x, y, 2]]);
      const sc = (k, kk) => [1, 0.78, 0.55][k] * kk, py = (k, kk) => (1.2 + [0, 0.85, 1.6][k]) * kk;
      instanced(G, cone, M.foliage, lay, (o, [x, y, k]) => { const kk = tk(x, y), s0 = sc(k, kk); o.position.set(W(x), py(k, kk), W(y)); o.scale.set(s0, s0, s0); o.rotation.y = hash(x, y, 21 + k) * 6; return C(th.leaves[0][k % 3]); }, { cast: true });
      instanced(G, cap, snowM, lay, (o, [x, y, k]) => { const kk = tk(x, y), s0 = sc(k, kk); o.position.set(W(x), py(k, kk) + 0.38 * s0, W(y)); o.scale.set(s0 * 0.9, s0 * 0.8, s0 * 0.9); o.rotation.y = hash(x, y, 21 + k) * 6; }, { receive: false });
    } else {
    instanced(G, trunkGeo, glassy ? M.glassTrunk : M.trunk, trees, (o, [x, y]) => { const k = tk(x, y); o.position.set(W(x), 0.65 * k, W(y)); o.scale.set(k, k, k); o.rotation.y = hash(x, y, 19) * 6; }, { cast: !glassy });
    const crownList = trees.flatMap(([x, y]) => [[x, y, 0], [x, y, 1], [x, y, 2], [x, y, 3]]);
    instanced(G, crownGeo, glassy ? M.glassLeaf : M.foliage, crownList, (o, [x, y, k]) => {
      const kk = tk(x, y), s0 = [1, 0.75, 0.6, 0.5][k] * kk;
      o.position.set(W(x) + [0, 0.45, -0.4, 0.1][k] * kk, (1.75 + [0, 0.35, 0.55, 1.05][k]) * kk, W(y) + [0, -0.2, 0.3, 0.15][k] * kk);
      o.rotation.set(hash(x, y, 21 + k), hash(x, y, 24 + k) * 6, 0); o.scale.set(s0, s0 * 0.85, s0);
      if (glassy) { const gc = GLASS_COLS[Math.floor(hash(x, y, 20) * GLASS_COLS.length)]; return C(gc).offsetHSL((hash(x, y, 25 + k) - 0.5) * 0.04, 0, (k - 1) * 0.03); }
      return C(th.leaves[hash(x, y, 20) < th.blossom ? 1 : 0][k % 3]);
    }, { cast: !glassy });
    }
    if (glassy) {
      // arbres de verre : cœur lumineux qui pulse + racines translucides
      instanced(G, new THREE.OctahedronGeometry(0.32, 0), M.glassCore, trees, (o, [x, y]) => { const k = tk(x, y); o.position.set(W(x), 1.95 * k, W(y)); o.scale.set(k, k * 1.5, k); o.rotation.y = hash(x, y, 33) * 6; }, { receive: false });
      instanced(G, new THREE.ConeGeometry(0.1, 0.5, 4), M.glassTrunk, trees.flatMap(([x, y]) => [0, 1, 2].map((k) => [x, y, k])), (o, [x, y, k]) => { const a = k * 2.1 + hash(x, y, 34) * 3; o.position.set(W(x) + Math.cos(a) * 0.22, 0.12, W(y) + Math.sin(a) * 0.22); o.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); }, { receive: false });
    } else if (!th.floor && !th.conifer) {
      // pied d'arbre : petit tertre de mousse
      instanced(G, new THREE.DodecahedronGeometry(0.4, 0), M.grass, trees, (o, [x, y]) => { o.position.set(W(x), 0.04, W(y)); o.scale.set(1.5, 0.3, 1.5); o.rotation.y = hash(x, y, 35) * 6; return C(th.grass).offsetHSL(0, 0, -0.04); }, { receive: false });
    }
    // buissons sur le bord des îles (côté vide), pour une silhouette plus naturelle
    if (!th.floor) {
      const bushes = [];
      cells.forEach(([x, y]) => { if (terr(x, y) === '#' || terr(x, y) === 'T' || terr(x, y) === 'r' || terr(x, y) === 'c' || isl.entAt[x + ',' + y]) return; if (hash(x, y, 120) > 0.3) return; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy], i) => { if (!isLand(x + dx, y + dy) && hash(x, y, 121 + i) < 0.7) bushes.push([x, y, dx, dy]); }); });
      const bushList = bushes.slice(0, 220);
      instanced(G, crownGeo, M.foliage, bushList, (o, [x, y, dx, dy]) => { const s0 = 0.34 + hash(x, y, 122) * 0.2; o.position.set(W(x) + dx * 0.85 + (hash(x, y, 123) - 0.5) * 0.6 * Math.abs(dy), 0.28, W(y) + dy * 0.85 + (hash(x, y, 124) - 0.5) * 0.6 * Math.abs(dx)); o.scale.set(s0 * 1.2, s0, s0 * 1.2); o.rotation.y = hash(x, y, 125) * 6; return C(th.leaves[hash(x, y, 126) < th.blossom * 0.6 ? 1 : 0][hash(x, y, 127) < 0.5 ? 0 : 1]); }, { cast: true });
    }
    // rayons de lumière filtrés (arbres) : plans additifs très doux
    if (!th.floor && !z.interior && cells.length) {
      const picks = trees.length ? trees : cells.filter(([x, y]) => hash(x, y, 130) < 0.02);
      const nS = Math.min(LOW ? 1 : 3, picks.length);
      for (let i = 0; i < nS; i++) {
        const [x, y] = picks[Math.floor(hash(i, zi, 131) * picks.length)];
        const sm = new THREE.Mesh(new THREE.PlaneGeometry(2.6 + hash(x, y, 132) * 1.4, 11), new THREE.MeshBasicMaterial({ color: th.glass ? '#b8ffee' : '#ffe9b8', map: shaftTexture(), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
        sm.position.set(W(x) + 1.2, 5.2 + H(W(x), W(y)), W(y)); sm.rotation.set(0, hash(x, y, 133) * 3.14, 0.33); sm.rotation.order = 'YXZ'; sm.userData = { ph: hash(x, y, 134) * 6, base: th.glass ? 0.2 : 0.13 };
        detail(zi, sm.position.x, sm.position.z).add(sm); shafts.push(sm);
      }
    }
    // eau
    const water = cells.filter(([x, y]) => terr(x, y) === '~');
    instanced(G, new THREE.BoxGeometry(T, 0.1, T), M.water, water, (o, [x, y]) => { o.position.set(W(x), -0.12, W(y)); }, { receive: false });
    // chemins : pavés
    if (!th.floor) {
      const paths = cells.filter(([x, y]) => terr(x, y) === ',' && hash(x, y, 90) < 0.75);
      instanced(G, pebbleGeo, M.rock, paths.flatMap(([x, y]) => [[x, y, 0], [x, y, 1]]), (o, [x, y, k]) => {
        o.position.set(W(x) + (hash(x, y, 91 + k) - 0.5) * 1.5, 0.01, W(y) + (hash(x, y, 93 + k) - 0.5) * 1.5); o.scale.set(1.4, 0.35, 1.1); o.rotation.y = hash(x, y, 95 + k) * 3;
        return C(th.path).offsetHSL(0, 0, -0.08 + (hash(x, y, 97 + k) - 0.5) * 0.1);
      }, { receive: false });
    }
    // herbes et fleurs
    if (!th.floor) {
      const grassCells = cells.filter(([x, y]) => terr(x, y) === '.' && !isl.entAt[x + ',' + y]);
      const tufts = [];
      const dens = themeOf(z) === 'lande' ? 0.75 : 0.55;
      grassCells.forEach(([x, y]) => { for (let k = 0; k < (LOW ? 2 : 3); k++) if (hash(x, y, 30 + k) < dens) tufts.push([x, y, k]); });
      instanced(G, tuftGeo, M.tuft, tufts, (o, [x, y, k]) => {
        o.position.set(W(x) + (hash(x, y, 40 + k) - 0.5) * 1.7, 0.02, W(y) + (hash(x, y, 50 + k) - 0.5) * 1.7);
        o.rotation.y = hash(x, y, 60 + k) * 6;
        const sc = 0.75 + hash(x, y, 61 + k) * 0.7; o.scale.set(sc, themeOf(z) === 'lande' ? sc * 1.5 : sc, sc);
        return C(th.tuft).offsetHSL(0, 0.05, (hash(x, y, 70 + k) - 0.5) * 0.12 + 0.03);
      }, { receive: false });
      const flowers = th.desert ? [] : grassCells.filter(([x, y]) => hash(x, y, 80) < (themeOf(z) === 'village' ? 0.4 : 0.3));
      const fl2 = flowers.flatMap(([x, y]) => [[x, y, 0], [x, y, 1], ...(hash(x, y, 88) < 0.5 ? [[x, y, 2]] : [])]);
      const fpos = (x, y, k) => [W(x) + (hash(x, y, 81 + k * 7) - 0.5) * 1.6, W(y) + (hash(x, y, 82 + k * 7) - 0.5) * 1.6];
      instanced(G, flowerGeo, M.tuft, fl2, (o, [x, y, k]) => {
        const [px, pz] = fpos(x, y, k); o.position.set(px, 0.02, pz); o.rotation.y = hash(x, y, 89 + k) * 6; o.scale.setScalar(0.9 + hash(x, y, 90 + k) * 0.4);
        return C(th.flowers ? th.flowers[Math.floor(hash(x, y, 83 + k) * th.flowers.length)] : th.glass ? ['#bff3ff', '#d8c8ff', '#ffd1f0', '#ffffff'][Math.floor(hash(x, y, 83 + k) * 4)] : ['#ffffff', '#ffd76a', '#ff9ec7', '#c9b6ff', '#ff9ec7'][Math.floor(hash(x, y, 83 + k) * 5)]);
      }, { receive: false });
      instanced(G, stemGeo, stemM, fl2, (o, [x, y, k]) => { const [px, pz] = fpos(x, y, k); o.position.set(px, 0.02, pz); o.scale.setScalar(0.9 + hash(x, y, 90 + k) * 0.4); }, { receive: false });
    } else if (themeOf(z) === 'sanctuaire') {
      // brume au sol (petits cristaux)
      const fl = cells.filter(([x, y]) => terr(x, y) === '.' && hash(x, y, 85) < 0.08);
      instanced(G, new THREE.OctahedronGeometry(0.16, 0), glow('#b39cff', 1.4), fl, (o, [x, y]) => { o.position.set(W(x) + (hash(x, y, 86) - 0.5) * 1.4, 0.12, W(y) + (hash(x, y, 87) - 0.5) * 1.4); o.scale.y = 1.8; }, { receive: false });
    }
    // ronces et roches fissurées (retirables)
    const ron = cells.filter(([x, y]) => terr(x, y) === 'r');
    if (ron.length) {
      const m = instanced(G, ronceGeo, M.ronce, ron, (o, [x, y], i) => { cellIndex.r[x + ',' + y] = { m: null, i }; o.position.set(W(x), 0.55, W(y)); o.scale.set(1.1, 0.85 + hash(x, y, 5) * 0.3, 1.1); o.rotation.y = hash(x, y, 6) * 3; return C('#6a9a52').offsetHSL((hash(x, y, 9) - 0.5) * 0.05, 0, (hash(x, y, 7) - 0.5) * 0.12); }, { cast: true });
      const th2 = instanced(G, thornGeo, M.thorn, ron.flatMap(([x, y]) => [0, 1, 2, 3, 4].map((k) => [x, y, k])), (o, [x, y, k]) => { const a = k * 1.3 + hash(x, y, 8); o.position.set(W(x) + Math.cos(a) * 0.7, 0.5 + (k % 3) * 0.25, W(y) + Math.sin(a) * 0.7); o.rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4); }, { receive: false });
      ron.forEach(([x, y], i) => (cellIndex.r[x + ',' + y] = { m, th: th2, i }));
    }
    const cr = cells.filter(([x, y]) => terr(x, y) === 'c');
    if (cr.length) {
      const m = instanced(G, new THREE.DodecahedronGeometry(1.05, 0), M.crack, cr, (o, [x, y]) => { o.position.set(W(x), 0.7, W(y)); o.scale.set(1, 1.15, 1); o.rotation.set(0.2, hash(x, y, 3) * 3, 0.1); }, { cast: true });
      const lines = instanced(G, new THREE.BoxGeometry(0.06, 1.2, 0.06), glow('#ffe2a0', 0.9), cr.flatMap(([x, y]) => [[x, y, 0], [x, y, 1]]), (o, [x, y, k]) => { o.position.set(W(x) + (k ? 0.3 : -0.25), 0.8, W(y) + 0.95); o.rotation.z = k ? 0.5 : -0.4; }, { receive: false });
      cr.forEach(([x, y], i) => (cellIndex.c[x + ',' + y] = { m, lines, i }));
    }
  });
  function removeCell(kind, x, y) {
    const r = cellIndex[kind][x + ',' + y]; if (!r) return;
    const hide = (mesh, i) => { if (!mesh) return; mesh.getMatrixAt(i, dummy.matrix); dummy.matrix.makeScale(0, 0, 0); mesh.setMatrixAt(i, dummy.matrix); mesh.instanceMatrix.needsUpdate = true; };
    hide(r.m, r.i);
    if (r.th) for (let k = 0; k < 5; k++) hide(r.th, r.i * 5 + k);
    if (r.lines) for (let k = 0; k < 2; k++) hide(r.lines, r.i * 2 + k);
    delete cellIndex[kind][x + ',' + y];
  }

  /* ---------- Décor lointain ---------- */
  const decor = [];
  {
    const cx = W(52), cz = W(28);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + hash(i, 1) * 0.4, r = 150 + hash(i, 2) * 70;
      const g = new THREE.Group();
      const s = 3 + hash(i, 3) * 6;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(s, s * 0.9, s * 0.35, 7), mat('#6aae5c')); g.add(top);
      const bot = new THREE.Mesh(new THREE.ConeGeometry(s * 0.95, s * 2.2, 7), mat('#5d4b66')); bot.rotation.x = Math.PI; bot.position.y = -s * 1.25; g.add(bot);
      if (hash(i, 4) < 0.6) { const tr = new THREE.Mesh(new THREE.IcosahedronGeometry(s * 0.35, 0), mat(hash(i, 7) < 0.5 ? '#f4a7c4' : '#5fae76')); tr.position.set(s * 0.2, s * 0.45, 0); g.add(tr); }
      g.position.set(cx + Math.cos(a) * r, -10 + hash(i, 5) * 22, cz + Math.sin(a) * r);
      g.userData = { base: g.position.y, ph: hash(i, 6) * 6 };
      scene.add(g); decor.push(g); bakeStatic(g);
    }
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1, transparent: true, opacity: 0.92 });
    for (let i = 0; i < 30; i++) {
      const g = new THREE.Group();
      const n = 3 + Math.floor(hash(i, 9) * 4);
      for (let k = 0; k < n; k++) {
        const p = new THREE.Mesh(new THREE.IcosahedronGeometry(2 + hash(i, k + 10) * 2.5, 0), cloudMat);
        p.position.set(k * 2.6 - n * 1.3, hash(i, k + 20) * 1.2, (hash(i, k + 30) - 0.5) * 2.5); p.scale.y = 0.6;
        g.add(p);
      }
      g.position.set(-80 + hash(i, 40) * 330, -16 - hash(i, 41) * 14, -60 + hash(i, 42) * 260);
      g.userData = { cloud: true, v: 0.6 + hash(i, 43) * 0.8 };
      scene.add(g); decor.push(g); bakeStatic(g);
    }
  }

  /* ---------- Ponts et portes ---------- */
  const gateViews = {};
  Object.values(isl.gates).forEach((g) => (gateViews[g.id] = []));
  {
    const plank = new THREE.BoxGeometry(0.52, 0.14, 1.85), rail = new THREE.BoxGeometry(T, 0.09, 0.09), post = new THREE.BoxGeometry(0.14, 0.6, 0.14);
    const ghostGeo = new THREE.BoxGeometry(T * 0.96, 0.06, 1.8);
    Object.values(isl.gates).forEach((gt) => {
      gt.cells.forEach(([x, y], i) => {
        const zg = isl.zoneAt[y] && isl.zoneAt[y][x] >= 0 ? zoneGroups[isl.zoneAt[y][x]] : root;
        if (gt.kind === 'bridge' || terr(x, y) === '=') {
          const along = isl.gateCell[(x + 1) + ',' + y] === gt.id || isl.gateCell[(x - 1) + ',' + y] === gt.id || isLand(x + 1, y) || isLand(x - 1, y);
          const grp = new THREE.Group();
          [-0.62, 0, 0.62].forEach((o) => { const p = new THREE.Mesh(plank, M.wood); p.position.set(o, -0.07, 0); p.castShadow = true; p.receiveShadow = true; grp.add(p); });
          [-0.95, 0.95].forEach((z) => { const r = new THREE.Mesh(rail, M.wood); r.position.set(0, 0.55, z); grp.add(r); const p = new THREE.Mesh(post, M.wood); p.position.set(-0.85, 0.25, z); grp.add(p); });
          const by = H(W(x), W(y));   /* ALTITUDE : pont posé sur le relief, incliné selon sa pente */
          grp.position.set(W(x), by, W(y)); if (!along) grp.rotation.y = Math.PI / 2;
          if (ALT) { grp.rotation.order = 'YXZ'; const sl = along ? (H(W(x) + 1, W(y)) - H(W(x) - 1, W(y))) / 2 : -(H(W(x), W(y) + 1) - H(W(x), W(y) - 1)) / 2; grp.rotation.z = Math.atan(sl); }
          grp.visible = false;
          const ghost = new THREE.Mesh(ghostGeo, M.ghost); ghost.position.set(W(x), -0.05 + by, W(y)); if (!along) ghost.rotation.y = Math.PI / 2;
          if (ALT) { ghost.rotation.order = 'YXZ'; ghost.rotation.z = grp.rotation.z; }
          root.add(grp, ghost);
          gateViews[gt.id].push({ group: grp, ghost, kind: 'bridge', delay: i * 0.12, baseY: by });
        } else {
          const grp = new THREE.Group(); grp.position.set(W(x), H(W(x), W(y)), W(y));
          let m = null;
          if (gt.look === 'seal') {
            m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#b39cff').multiplyScalar(1.4), transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
            for (let k = 0; k < 3; k++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8 - k * 0.15, 0), m); p.position.y = 0.7 + k * 0.7; p.userData.spin = (k % 2 ? -1 : 1) * (0.6 + k * 0.3); grp.add(p); }
          } else if (gt.look === 'door') {
            m = mat('#5a4a3a');
            const d = new THREE.Mesh(new THREE.BoxGeometry(T, 2.6, 0.4), m); d.position.y = 1.3; d.castShadow = true; grp.add(d);
            [0.5, 1.3, 2.1].forEach((h) => { const b = new THREE.Mesh(new THREE.BoxGeometry(T * 1.02, 0.12, 0.45), M.metal); b.position.y = h; grp.add(b); });
            if (i === 1 || gt.cells.length === 1) { const lk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.5), M.gold); lk.position.y = 1.3; grp.add(lk); }
            const along = terr(x + 1, y) === '#' || terr(x - 1, y) === '#';
            if (!along) grp.rotation.y = Math.PI / 2;
          } else {
            m = new THREE.MeshStandardMaterial({ color: 0xbff3ff, emissive: 0x7fdcff, emissiveIntensity: 1.6, transparent: true, opacity: 0.85, flatShading: true });
            [[-0.5, 0.1, 1.3], [0.05, -0.2, 1.7], [0.55, 0.15, 1.2]].forEach(([ox, oz, s]) => { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), m); c.position.set(ox, s * 0.7, oz); c.scale.set(0.8, s * 1.4, 0.8); c.castShadow = true; grp.add(c); });
          }
          zg.add(grp);
          gateViews[gt.id].push({ group: grp, kind: gt.look || 'barrier', mat: m, delay: 0, baseY: H(W(x), W(y)) });
        }
      });
    });
  }
  function setGateView(g, open, instant) {
    (gateViews[g.id] || []).forEach((v) => {
      if (v.kind === 'bridge') {
        v.ghost.visible = !open;
        if (instant) { v.group.visible = open; v.group.position.y = v.baseY || 0; v.group.scale.set(1, 1, 1); v.anim = 1; }
        else if (open) { v.group.visible = true; v.anim = -v.delay; v.group.position.y = (v.baseY || 0) - 3; }
      } else {
        if (instant) { v.group.visible = !open; v.group.scale.set(1, 1, 1); v.group.position.y = v.baseY || 0; v.anim = 0; }
        else if (open) v.anim = 0.0001;
      }
    });
  }

  /* ---------- Objets de lumière ---------- */
  const vitrails = [];
  const views = {};
  const pedestalGeo = new THREE.CylinderGeometry(0.72, 0.9, 0.42, 8);
  const dirAngle = (d) => Math.atan2(-DIRS[d][1], DIRS[d][0]);
  function pedestal(g, rot) {
    const p = new THREE.Mesh(pedestalGeo, M.stone); p.position.y = 0.21; p.castShadow = true; p.receiveShadow = true; g.add(p);
    if (rot) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.05, 6, 32), M.gold); r.rotation.x = Math.PI / 2; r.position.y = 0.43; g.add(r); }
  }
  const RECV_GEO = { w: new THREE.OctahedronGeometry(0.42, 0), r: new THREE.ConeGeometry(0.46, 0.8, 3), g: new THREE.IcosahedronGeometry(0.4, 0), b: new THREE.BoxGeometry(0.55, 0.55, 0.55) };
  isl.ents.forEach((e) => {
    const zg = e.zone >= 0 && zones[e.zone] ? detail(e.zone, W(e.x), W(e.y)) : root;
    const g = new THREE.Group();
    g.position.set(W(e.x), H(W(e.x), W(e.y)), W(e.y));   /* ALTITUDE */
    const v = { e, g };
    if (e.t === 'lantern') {
      pedestal(g, e.rot);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 6), M.metal); post.position.y = 0.66; g.add(post);
      const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 6, 1, true), M.metal); cage.rotation.z = Math.PI / 2; head.add(cage);
      head.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow('#fff1c9', 4)));
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.4, 8), M.gold); nozzle.rotation.z = -Math.PI / 2; nozzle.position.x = 0.42; head.add(nozzle);
      const lh = haloSprite('#ffe6b0', 1.9, 0.6); head.add(lh); v.halo = lh; v.lit = true;
      head.rotation.y = dirAngle(e.dir);
      v.head = head; v.target = () => dirAngle(e.dir);
    } else if (e.t === 'mirror') {
      pedestal(g, true);
      const frame = new THREE.Group(); frame.position.y = BEAM_Y; g.add(frame);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.25, 0.08), M.mirror); panel.castShadow = true; frame.add(panel);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.78, 1.33, 0.06), M.stoneDark); back.position.z = -0.06; frame.add(back);
      const edge = glow('#9fe9ff', 2.2);
      [0.66, -0.66].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.05, 0.1), edge); b.position.y = y; frame.add(b); });
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 6), M.metal); stand.position.y = -0.62; frame.add(stand);
      frame.rotation.y = e.state ? -Math.PI / 4 : Math.PI / 4;
      v.head = frame; v.target = () => (e.state ? -Math.PI / 4 : Math.PI / 4);
    } else if (e.t === 'splitter') {   /* ACTE III : lame semi-réfléchissante */
      pedestal(g, true);
      const s = buildSplitter(g, e, { THREE, M, glow, BEAM_Y }); v.head = s.head; v.target = s.target;
    } else if (e.t === 'vitrail') {
      // vitrail : deux vitres croisées dans un cadre doré (se lit bien de toutes les directions)
      pedestal(g, false);
      const col = new THREE.Color(COLORS[e.color] || '#ffffff');
      const tex = glassTexture();
      const gm = new THREE.MeshStandardMaterial({ color: col, map: tex, emissive: col, emissiveMap: tex, emissiveIntensity: 1.0, transparent: true, opacity: 0.8, flatShading: true, roughness: 0.15, side: THREE.DoubleSide });
      [0, Math.PI / 2].forEach((ry) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.7, 0.07), gm); p.position.y = BEAM_Y + 0.15; p.rotation.y = ry; g.add(p);
        const fr = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.09, 0.13), M.gold); fr.position.y = BEAM_Y + 1.02; fr.rotation.y = ry; g.add(fr);
        const fb = fr.clone(); fb.position.y = BEAM_Y - 0.72; g.add(fb);
        [-1, 1].forEach((sd) => { const fs = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.78, 0.13), M.gold); fs.position.set(sd * 0.78, BEAM_Y + 0.15, 0); const holder = new THREE.Group(); holder.rotation.y = ry; holder.add(fs); g.add(holder); });
      });
      const top = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), M.gold); top.position.y = BEAM_Y + 1.2; top.scale.y = 1.4; g.add(top);
      // tache de lumière colorée projetée au sol : lisible et très « vitrail »
      const pool = new THREE.Mesh(new THREE.CircleGeometry(1.15, 20), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.3), map: haloSprite('#fff', 1, 1).material.map, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.46; g.add(pool);
      vitrails.push({ g, col }); // la lueur vient d'un petit pool de lumières partagé (nombre de PointLight constant → pas de recompilation de shaders)
      v.float = null; v.glass = gm;
    } else if (e.t === 'prism') {
      pedestal(g, false);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.3, 3), M.glass); p.position.y = BEAM_Y + 0.1; p.castShadow = true; g.add(p);
      ['r', 'g', 'b'].forEach((c, i) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.05), glow(COLORS[c], 2.5)); l.position.set(Math.cos(i * 2.09) * 0.22, BEAM_Y + 0.1, Math.sin(i * 2.09) * 0.22); g.add(l); });
      v.float = p; v.spinObj = p;
    } else if (e.t === 'receiver') {
      pedestal(g, false);
      const m = new THREE.MeshStandardMaterial({ color: COLORS[e.color], emissive: COLORS[e.color], emissiveIntensity: 0.15, flatShading: true, roughness: 0.3 });
      const c = new THREE.Mesh(RECV_GEO[e.color] || RECV_GEO.w, m); c.position.y = BEAM_Y; c.castShadow = true; g.add(c);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 6, 32), glow(COLORS[e.color], 1.2)); halo.rotation.x = Math.PI / 2; halo.position.y = 0.46; g.add(halo);
      v.crystal = c; v.mat = m;
      v.halo = haloSprite(COLORS[e.color] || '#ffffff', 2.8, 0); v.halo.position.y = BEAM_Y; g.add(v.halo);
    } else if (e.t === 'relay') {
      pedestal(g, true);
      const m = new THREE.MeshStandardMaterial({ color: 0xf3e9ff, emissive: 0xffffff, emissiveIntensity: 0.12, flatShading: true, roughness: 0.3 });
      const c = new THREE.Mesh(e.mix ? new THREE.DodecahedronGeometry(0.4, 0) : new THREE.IcosahedronGeometry(0.36, 0), m); c.position.y = BEAM_Y; g.add(c);
      if (e.mix) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 6, 24), M.gold); ring.position.y = BEAM_Y; ring.rotation.x = Math.PI / 2; g.add(ring); const ring2 = ring.clone(); ring2.rotation.set(0, Math.PI / 2, 0); g.add(ring2); }
      const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 6), M.gold); arrow.rotation.z = -Math.PI / 2; arrow.position.x = 0.6; head.add(arrow);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.06), M.gold); arm.position.x = 0.3; head.add(arm);
      head.rotation.y = dirAngle(e.out);
      v.head = head; v.target = () => dirAngle(e.out); v.crystal = c; v.mat = m;
      v.halo = haloSprite('#ffffff', 2.4, 0); v.halo.position.y = BEAM_Y; g.add(v.halo);
    } else if (e.t === 'beacon') {
      const need = e.need || ['r', 'g', 'b'], n = need.length, glassBeacon = need.some((c) => 'ymc'.includes(c));
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.7, 6), M.stone); base.position.y = 0.35; base.castShadow = true; g.add(base);
      const step2 = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.2, 0.3, 6), M.stoneDark); step2.position.y = 0.85; g.add(step2);
      const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.62, 4.6, 6), glassBeacon ? M.glass : M.stone); ob.position.y = 3.1; ob.castShadow = !glassBeacon; g.add(ob);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d6, emissiveIntensity: 0.1, flatShading: true, transparent: glassBeacon, opacity: glassBeacon ? 0.85 : 1 });
      const crown = new THREE.Mesh(glassBeacon ? new THREE.OctahedronGeometry(0.85, 1) : new THREE.OctahedronGeometry(0.75, 0), crownMat); crown.position.y = 5.9; if (glassBeacon) crown.scale.y = 1.5; g.add(crown);
      const cage = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.05, 5, 6), M.gold); cage.position.y = 5.9; cage.rotation.x = Math.PI / 2; g.add(cage);
      [0, 1, 2, 3, 4, 5].forEach((i) => { const a = i * Math.PI / 3; const pr = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.9, 4), M.gold); pr.position.set(Math.cos(a) * 1.0, 5.45, Math.sin(a) * 1.0); pr.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); g.add(pr); });
      const gap = Math.min(0.75, 3.4 / Math.max(1, n));
      v.rings = need.map((c, i) => {
        const m = new THREE.MeshStandardMaterial({ color: COLORS[c], emissive: COLORS[c], emissiveIntensity: 0.1, metalness: 0.3, roughness: 0.4 });
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.8 - Math.min(i, 3) * 0.06, 0.08, 8, 32), m); r.rotation.x = Math.PI / 2; r.position.y = 1.25 + i * gap; g.add(r);
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), m); gem.position.set(0.8 - Math.min(i, 3) * 0.06, 0, 0); r.add(gem);
        return { c, mat: m, r };
      });
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.2, 120, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6b0').multiplyScalar(2.2), map: shaftTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      col.position.y = 66; g.add(col);
      v.halo = haloSprite('#fff2d6', 7, 0); v.halo.position.y = 5.9; g.add(v.halo); v.haloK = 0.6;
      v.crown = crown; v.crownMat = crownMat; v.column = col; v.cageRing = cage;
    } else if (e.t === 'post') {
      // poteau de grappin : pilier de bois cerclé, anneau d'or et cristal qui indique la prise
      const bs = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.35, 7), M.stone); bs.position.y = 0.17; g.add(bs);
      const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2.7, 7), M.wood); pl.position.y = 1.5; g.add(pl);
      [0.7, 1.4, 2.1].forEach((y) => { const bd = new THREE.Mesh(new THREE.TorusGeometry(0.27 - y * 0.02, 0.035, 4, 10), M.metal); bd.rotation.x = Math.PI / 2; bd.position.y = y; g.add(bd); });
      const hk = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 14), M.gold); hk.position.set(0, 2.95, 0); g.add(hk); v.hook = hk;
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.32, 7), M.woodDark); cap.position.y = 2.95 - 0.38; cap.rotation.x = Math.PI; g.add(cap);
      const gm = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), glow('#9fe9ff', 2.4)); gm.position.y = 3.45; gm.scale.y = 1.5; g.add(gm); v.float = gm; v.spinObj = gm; v.floatY = 3.45;
      v.halo = haloSprite('#9fe9ff', 2.2, 0.5); v.halo.position.y = 3.45; g.add(v.halo); v.lit = true;
    } else if (e.t === 'portal') {   /* ACTE VI : portail de lumière */
      const pc = PORTAL_COLS[(e.pair || 'a').charCodeAt(0) % PORTAL_COLS.length];
      pedestal(g, false);
      const ring = new THREE.Group(); ring.position.y = BEAM_Y + 0.2;
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.07, 8, 28), glow(pc, 2.6)); ring.add(r1);
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.04, 6, 24), M.gold); ring.add(r2);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.76, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(pc).multiplyScalar(1.6), transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); ring.add(disc);
      const disc2 = disc.clone(); disc2.rotation.y = Math.PI / 2; ring.add(disc2);
      g.add(ring); v.spinObj = ring; v.halo = haloSprite(pc, 2.2, 0.5); v.halo.position.y = BEAM_Y + 0.2; g.add(v.halo); v.lit = true;
    } else if (e.t === 'shard') {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow('#d8b4fe', 3)); c.position.y = 1; g.add(c);
      v.float = c; v.spinObj = c; v.pick = true;
    } else if (e.t === 'page') {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.72), new THREE.MeshStandardMaterial({ color: 0xf6ead2, emissive: 0xffe9b8, emissiveIntensity: 0.4 })); p.position.y = 1; p.rotation.x = -0.5; g.add(p);
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 6, 24), glow('#ffe2a0', 2)); r.rotation.x = Math.PI / 2; r.position.y = 0.1; g.add(r);
      v.float = p; v.pick = true;
    } else if (e.t === 'wisp') {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), glow('#ffd1f0', 4)); c.position.y = 0.9; g.add(c);
      v.float = c; v.pick = true;
    } else if (ABYSSES_ENTS.has(e.t)) {   /* ACTE IV : bassins, vannes, socles d’orbe, corniches */
      abyssView(e, g, v, { M, glow, haloSprite, pedestal, BEAM_Y, T, isl });
    } else if (e.t === 'start') {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 24), M.stone); r.rotation.x = Math.PI / 2; r.position.y = 0.04; g.add(r);
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glow('#9fe9ff', 2)); cr.position.y = 0.6; g.add(cr); v.float = cr; v.spinObj = cr;
    }
    g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') o.castShadow = true; });
    zg.add(g);
    views[e.id] = v;
  });

  /* ACTE III : socles (objets portés) */
  const socleViews = [];
  (isl.socles || []).forEach((so) => { const sv = buildSocle(so, { THREE, M, glow, haloSprite, W }); sv.g.position.y += H(W(so.x), W(so.y)); detail(so.zone, W(so.x), W(so.y)).add(sv.g); socleViews.push(sv); });

  /* ---------- Bâtiments et décor des zones d'aventure ---------- */
  const props = [];   // { p, zi, g, kind, light? }
  const roofs = { auberge: M.roofRed, pierre: M.roofSlate, forge: M.roofBrown, bois: M.roofBlue, phare: M.roofBlue, sable: mat('#c4703f') /* ACTE III */, marbre: new THREE.MeshStandardMaterial({ color: '#f0c66b', flatShading: true, roughness: 0.5, metalness: 0.2 }) /* ACTE VI */ };
  function house(p, z) {
    const g = new THREE.Group();
    const w = p.w * T, d = p.h * T, h = p.style === 'forge' ? 2.4 : 2.7;
    const cx = W(z.ox + p.x) + w / 2 - T / 2, cz = W(z.oy + p.y) + d / 2 - T / 2;
    g.position.set(cx, 0, cz);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, h, d - 0.3), p.style === 'pierre' || p.style === 'phare' ? mat('#cfc9da') : p.style === 'sable' ? mat('#e6cf9c') /* ACTE III */ : p.style === 'marbre' ? mat('#f6f0e2') /* ACTE VI */ : M.plaster); walls.position.y = h / 2; walls.castShadow = true; walls.receiveShadow = true; g.add(walls);
    const base = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.5, d - 0.1), M.stoneDark); base.position.y = 0.25; g.add(base);
    // colombages
    if (p.style === 'auberge' || p.style === 'bois') {
      const beam = M.woodDark;
      for (let i = 0; i <= p.w; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, h, 0.16), beam); b.position.set(-w / 2 + 0.15 + i * ((w - 0.3) / p.w), h / 2, d / 2 - 0.12); g.add(b); }
      const hb = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.16, 0.16), beam); hb.position.set(0, h * 0.55, d / 2 - 0.12); g.add(hb);
    }
    // toit à deux pans
    const roofM = roofs[p.style] || M.roofRed;
    const rh = 1.5, over = 0.45;
    const sh = new THREE.Shape(); sh.moveTo(-w / 2 - over, 0); sh.lineTo(0, rh); sh.lineTo(w / 2 + over, 0); sh.lineTo(-w / 2 - over, 0);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: d + over * 2 - 0.3, bevelEnabled: false }), roofM);
    roof.position.set(0, h, -d / 2 - over + 0.15); roof.castShadow = true; g.add(roof);
    // faîtage et rangées de bardeaux
    { const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, d + over * 2 - 0.2, 5), M.woodDark); ridge.rotation.x = Math.PI / 2; ridge.position.set(0, h + rh + 0.02, 0); g.add(ridge);
      const slope = Math.hypot(w / 2 + over, rh), ang = Math.atan2(rh, w / 2 + over);
      for (let k = 1; k <= 3; k++) { [-1, 1].forEach((sd) => { const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, d + over * 2 - 0.25), new THREE.MeshStandardMaterial({ color: new THREE.Color(roofM.color).multiplyScalar(0.8), flatShading: true })); const f = k / 4.2; stripe.position.set(sd * (w / 2 + over) * (1 - f), h + rh * f + 0.05, 0); stripe.rotation.z = -sd * ang; g.add(stripe); }); }
    }
    if (p.style !== 'phare') { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), M.stoneDark); ch.position.set(w * 0.25, h + 1.0, -d * 0.15); ch.castShadow = true; g.add(ch); const cp = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.14, 0.64), M.stone); cp.position.set(w * 0.25, h + 1.65, -d * 0.15); g.add(cp); g.userData.smoke = new THREE.Vector3(w * 0.25, h + 1.8, -d * 0.15); }
    else { const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 2, 8), mat('#e9e2f5')); tw.position.set(w / 2 - 0.9, h + 1, 0); g.add(tw); const lt = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), glow('#ffe6b0', 2)); lt.position.set(w / 2 - 0.9, h + 2.3, 0); g.add(lt); }
    // fenêtres (s'allument à mesure que l'île se réveille)
    const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffcf7a').multiplyScalar(1.2) });
    const front = p.side === 'N' ? -1 : 1;
    for (let i = 0; i < p.w - 1; i++) { const wn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), winM); wn.position.set(-w / 2 + T * (i + 1) - 0.1, h * 0.62, front * (d / 2 - 0.12)); if (Math.abs(W(z.ox + p.x + i + 1) - W(z.ox + p.door[0])) < 0.5 && p.side !== 'E') continue; g.add(wn);
      const wx = wn.position.x, wz = wn.position.z, sgn = Math.sign(wz) || 1;
      const frm = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.78, 0.05), M.woodDark); frm.position.set(wx, wn.position.y, wz - sgn * 0.02); g.add(frm);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.08), M.woodDark); bar.position.set(wx, wn.position.y, wz + sgn * 0.01); g.add(bar);
      const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.08), M.woodDark); bar2.position.set(wx, wn.position.y, wz + sgn * 0.01); g.add(bar2);
      [-1, 1].forEach((sd) => { const sh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.04), p.style === 'pierre' ? M.roofSlate : M.roofBlue); sh.position.set(wx + sd * 0.44, wn.position.y, wz + sgn * 0.03); sh.rotation.y = sd * sgn * 0.35; g.add(sh); });
      const bx = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.2), M.wood); bx.position.set(wx, wn.position.y - 0.46, wz + sgn * 0.12); g.add(bx);
      for (let q = 0; q < 4; q++) { const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: ['#ff9ec7', '#ffd76a', '#ffffff', '#c9b6ff'][(i + q) % 4], flatShading: true })); fl.position.set(wx - 0.22 + q * 0.15, wn.position.y - 0.34, wz + sgn * 0.14); g.add(fl); }
    }
    // porte
    if (p.door) {
      const dx = W(z.ox + p.door[0]) - cx, dz = W(z.oy + p.door[1]) - cz;
      const door = new THREE.Group();
      const dm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.7, 0.12), M.woodDark); dm.position.y = 0.85; door.add(dm);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.85, 0.08), M.wood); fr.position.set(0, 0.9, -0.05); door.add(fr);
      const kn = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), M.gold); kn.position.set(0.3, 0.85, 0.08); door.add(kn);
      if (p.side === 'S') door.position.set(dx, 0, d / 2 - 0.12);
      else if (p.side === 'N') { door.position.set(dx, 0, -d / 2 + 0.12); door.rotation.y = Math.PI; }
      else if (p.side === 'E') { door.position.set(w / 2 - 0.12, 0, dz); door.rotation.y = Math.PI / 2; }
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.6), M.stone); step.position.set(0, 0.07, 0.35); door.add(step);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 0.14), M.stoneDark); lintel.position.set(0, 1.9, -0.02); door.add(lintel);
      [-1, 1].forEach((sd) => { const jb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.9, 0.14), M.stoneDark); jb.position.set(sd * 0.66, 0.95, -0.02); door.add(jb); });
      const lant = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), glow('#ffcf7a', 1.8)); lant.position.set(0.95, 1.6, 0.15); lant.scale.y = 1.4; door.add(lant);
      const lh = haloSprite('#ffc27a', 1.4, 0.45); lh.position.copy(lant.position); door.add(lh); g.userData.doorHalo = lh;
      g.add(door);
      if (p.style === 'forge') {
        const fire = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.1), glow('#ff8a3a', 2)); fire.position.set(w / 2 - 0.1, 0.8, dz + 1.2); fire.rotation.y = Math.PI / 2; g.add(fire);
      }
    }
    if (p.sign) {
      const s = new THREE.Group(); s.position.set(W(z.ox + p.door[0]) - cx + 1.2, 2.1, d / 2 + 0.2);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), M.woodDark); arm.position.x = 0.4; s.add(arm);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), glow('#ff9f6a', 2)); lamp.position.set(0.8, -0.3, 0); s.add(lamp);
      g.add(s);
    }
    return g;
  }
  function propMesh(p, z) {
    { const dp = desertProp(p, z, { THREE, M, mat, glow, haloSprite, T, W }); if (dp) return dp; }   /* ACTE III */
    const g = new THREE.Group();
    const cx = W(z.ox + p.x) + (p.w - 1) * T / 2, cz = W(z.oy + p.y) + (p.h - 1) * T / 2;
    g.position.set(cx, 0, cz);
    const add = (m, x = 0, y = 0, zz = 0) => { m.position.set(x, y, zz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    const box = (w, h, d, m, x, y, zz) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y, zz);
    const cyl = (r1, r2, h, m, x, y, zz, seg = 8) => add(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m), x, y, zz);
    const fl = (hex, k = 2.2) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), transparent: true, opacity: 0.92 });
    let light = null;
    const u = g.userData;
    const flames = (n, r, hex, y) => { u.flames = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.16 + (i % 2) * 0.05, 0.55 + (i % 3) * 0.12, 5), fl(i % 2 ? '#ffd27a' : hex, 2.2)), Math.cos(a) * r, y, Math.sin(a) * r * 0.5); f.castShadow = false; f.userData.ph = i * 1.7; u.flames.push(f); } };
    switch (p.t) {
      case 'stall': {
        box(p.w * T - 0.3, 0.9, 1.1, M.wood, 0, 0.45, 0.2);
        box(p.w * T - 0.2, 0.08, 1.3, M.woodDark, 0, 0.92, 0.2);
        [-1, 1].forEach((s) => box(0.12, 2.4, 0.12, M.woodDark, s * (p.w * T / 2 - 0.2), 1.2, -0.6));
        [-1, 1].forEach((s) => box(0.12, 2.0, 0.12, M.woodDark, s * (p.w * T / 2 - 0.2), 1.0, 0.75));
        const aw = box(p.w * T + 0.2, 0.08, 1.9, mat(p.color), 0, 2.25, 0.1); aw.rotation.x = 0.22;
        for (let i = 0; i < 6; i++) { const st = box(p.w * T / 6 - 0.04, 0.3, 0.05, mat(i % 2 ? p.color : '#f3ead8'), -p.w * T / 2 + (i + 0.5) * (p.w * T / 6) + 0.1, 2.0, 1.05); st.rotation.z = 0; const tri = add(new THREE.Mesh(new THREE.ConeGeometry(p.w * T / 12 - 0.02, 0.16, 3), mat(i % 2 ? p.color : '#f3ead8')), -p.w * T / 2 + (i + 0.5) * (p.w * T / 6) + 0.1, 1.77, 1.05); tri.rotation.x = Math.PI; }
        const goods = p.id === 'etal_ysolde' ? ['#e85a6a', '#5fa8e8', '#e85a6a', '#9fe9ff'] : p.id === 'etal_pell' ? ['#e58fb8', '#4f7fd0', '#f0c66b', '#2f7d5b'] : ['#c9965a', '#8c88a3', '#a0714f', '#b39cff'];
        goods.forEach((c, i) => { const it = add(new THREE.Mesh(p.id === 'etal_ysolde' ? new THREE.CylinderGeometry(0.1, 0.13, 0.32, 6) : new THREE.BoxGeometry(0.3, 0.2, 0.3), mat(c, p.id === 'etal_ysolde' ? { emissive: c, emissiveIntensity: 0.4 } : {})), -0.9 + i * 0.6, 1.1, 0.2); it.rotation.y = i * 0.7; });
        // caisses et sacs devant l'étal, balance et lampion
        box(0.7, 0.5, 0.7, M.wood, p.w * T / 2 - 0.2, 0.25, 1.4).rotation.y = 0.2;
        const sack = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat('#d8c8a0')), -p.w * T / 2 + 0.3, 0.3, 1.3); sack.scale.set(1, 1.1, 1);
        const lamp = add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), fl('#ffb86a', 1.8)), 0, 1.85, 0.7); u.hang = lamp;
        break;
      }
      case 'fountain': {
        const prof = [[0, 0.0], [2.75, 0.0], [2.75, 0.45], [2.55, 0.62], [2.3, 0.62], [2.18, 0.5], [2.18, 0.3], [0, 0.3]].map(([r, y]) => new THREE.Vector2(r, y));
        const basin = add(new THREE.Mesh(new THREE.LatheGeometry(prof, 14), M.stone), 0, 0, 0); basin.material = M.stone; basin.geometry.computeVertexNormals();
        const wt = add(new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.06, 14), M.water), 0, 0.46, 0); wt.castShadow = false;
        cyl(0.55, 0.75, 0.5, M.stone, 0, 0.55, 0, 8); cyl(0.3, 0.45, 1.0, M.stone, 0, 1.3, 0, 8);
        const bowl = add(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.5, 0.35, 10, 1, true), M.stone), 0, 1.65, 0); bowl.material = M.stone.clone(); bowl.material.side = THREE.DoubleSide;
        const bw = add(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 10), M.water), 0, 1.72, 0); bw.castShadow = false;
        const cr = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshStandardMaterial({ color: '#bff3ff', emissive: '#7fdcff', emissiveIntensity: 1.4, flatShading: true, transparent: true, opacity: 0.9 })), 0, 2.6, 0);
        cr.scale.y = 1.5; u.spin = cr; u.float = cr;
        // gouttes : retombent du cristal vers la vasque
        u.drops = []; for (let i = 0; i < 10; i++) { const d = add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), fl('#bfe8ff', 1.4)), 0, 1.7, 0); d.castShadow = false; d.userData = { a: (i / 10) * Math.PI * 2, ph: i / 10 }; u.drops.push(d); }
        // pierres du bord et mousse
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; const st = add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), M.stoneDark), Math.cos(a) * 2.95, 0.15, Math.sin(a) * 2.95); st.scale.set(1.1, 0.7, 1); }
        u.fx = 'fountain';
        break;
      }
      case 'anvil': {
        cyl(0.4, 0.5, 0.55, M.woodDark, 0, 0.27, 0, 8);
        box(1.0, 0.28, 0.45, M.metal, 0, 0.68, 0); box(0.55, 0.2, 0.3, M.metal, 0, 0.5, 0);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 4), M.metal), 0.7, 0.7, 0).rotation.z = -Math.PI / 2;
        box(0.06, 0.5, 0.06, M.woodDark, -0.9, 0.25, 0.6).rotation.z = 0.2; box(0.28, 0.16, 0.16, M.metal, -0.85, 0.56, 0.6);
        break;
      }
      case 'lamp': {
        cyl(0.13, 0.17, 0.2, M.stoneDark, 0, 0.1, 0, 6);
        cyl(0.05, 0.08, 2.3, mat('#6f5a48', { metalness: 0.4 }), 0, 1.25, 0, 6);
        const arm = box(0.5, 0.05, 0.05, mat('#6f5a48'), 0.15, 2.3, 0); arm.rotation.z = 0.05;
        add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 4, 10), mat('#6f5a48')), 0, 2.28, 0).rotation.x = Math.PI / 2;
        const lm = new THREE.MeshStandardMaterial({ color: '#f3ead0', emissive: '#ffb35a', emissiveIntensity: 0, flatShading: true, transparent: true, opacity: 0.92 });
        const bulb = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.42, 6), lm), 0, 2.58, 0);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.3, 6), mat('#6f5a48')), 0, 2.94, 0);
        const sp = haloSprite('#ffc27a', 2.6, 0); sp.position.set(0, 2.58, 0); g.add(sp);
        u.lampMat = lm; u.bulb = bulb; u.halo = sp;
        break;
      }
      case 'crate': {
        const c1 = box(1.1, 1.0, 1.1, M.wood, 0, 0.5, 0); c1.rotation.y = 0.3;
        [[-0.52, -0.52], [0.52, -0.52], [-0.52, 0.52], [0.52, 0.52]].forEach(([x, zz]) => { const q = box(0.1, 1.04, 0.1, M.woodDark, x, 0.5, zz); q.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.3); q.position.y = 0.5; q.rotation.y = 0.3; });
        const bd = box(1.14, 0.1, 0.1, M.woodDark, 0, 0.5, 0); bd.rotation.y = 0.3;
        const c2 = box(0.7, 0.6, 0.7, M.wood, 0.2, 1.3, 0.1); c2.rotation.y = 0.9; box(0.74, 0.08, 0.74, M.woodDark, 0.2, 1.6, 0.1).rotation.y = 0.9;
        break;
      }
      case 'barrel': {
        const b = cyl(0.5, 0.45, 1.1, M.wood, 0, 0.55, 0, 10); b.scale.set(1, 1, 1);
        cyl(0.56, 0.56, 0.2, M.wood, 0, 0.55, 0, 10);
        [0.2, 0.9].forEach((y) => add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 12), M.metal), 0, y, 0).rotation.x = Math.PI / 2);
        cyl(0.42, 0.42, 0.04, M.woodDark, 0, 1.1, 0, 10);
        break;
      }
      case 'bench': {
        box(1.8, 0.12, 0.6, M.wood, 0, 0.5, 0); [-0.7, 0.7].forEach((x) => box(0.12, 0.5, 0.5, M.woodDark, x, 0.25, 0));
        box(1.8, 0.35, 0.08, M.wood, 0, 0.85, -0.28).rotation.x = -0.12; [-0.8, 0.8].forEach((x) => box(0.1, 0.5, 0.1, M.woodDark, x, 0.7, -0.28));
        break;
      }
      case 'well': {
        cyl(0.85, 0.9, 0.9, M.stone, 0, 0.45, 0, 10);
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.05, 10), M.water), 0, 0.8, 0).castShadow = false;
        [-0.7, 0.7].forEach((x) => box(0.12, 1.6, 0.12, M.woodDark, x, 1.4, 0));
        const r = add(new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.6, 4), M.roofRed), 0, 2.4, 0); r.rotation.y = Math.PI / 4;
        cyl(0.07, 0.07, 1.5, M.wood, 0, 1.75, 0, 6).rotation.z = Math.PI / 2;
        cyl(0.02, 0.02, 0.7, mat('#c9b48a'), 0, 1.4, 0, 4); const bk = cyl(0.17, 0.13, 0.22, M.wood, 0, 0.98, 0, 7); u.bucket = bk;
        for (let i = 0; i < 6; i++) { const a = i * 1.05; add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), M.stoneDark), Math.cos(a) * 0.95, 0.1, Math.sin(a) * 0.95); }
        break;
      }
      case 'sign': { box(0.12, 1.2, 0.12, M.woodDark, 0, 0.6, 0); box(1.0, 0.6, 0.08, M.wood, 0, 1.2, 0.06); box(1.06, 0.05, 0.1, M.woodDark, 0, 1.52, 0.06); box(0.6, 0.05, 0.1, M.woodDark, 0, 1.1, 0.06); box(0.4, 0.05, 0.1, M.woodDark, 0, 1.25, 0.06); break; }
      case 'ruin': {
        [-1.4, 1.4].forEach((x, i) => { box(0.7, 3.4 - i * 0.6, 0.7, mat('#6f6a86'), x, (3.4 - i * 0.6) / 2, 0); box(0.9, 0.2, 0.9, mat('#5d5878'), x, 0.1, 0); box(0.85, 0.16, 0.85, mat('#5d5878'), x, 3.35 - i * 0.6, 0); });
        box(3.6, 0.6, 0.8, mat('#5d5878'), 0, 3.6, 0);
        add(new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow('#b39cff', 2)), 0, 3.0, 0);
        for (let i = 0; i < 4; i++) { const a = i * 1.9 + 0.4; const rb = add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + (i % 2) * 0.1, 0), mat('#5d5878')), Math.cos(a) * 1.6, 0.2, Math.sin(a) * 0.9 + 0.8); rb.rotation.set(i, a, 0); }
        break;
      }
      case 'brazier': {
        cyl(0.4, 0.22, 0.7, M.metal, 0, 0.55, 0, 6); cyl(0.12, 0.12, 0.3, M.metal, 0, 0.15, 0, 5); for (let i = 0; i < 3; i++) { const a = i * 2.09; const lg = box(0.08, 0.5, 0.08, M.metal, Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2); lg.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); }
        flames(3, 0.12, '#b98cff', 1.1); const f0 = u.flames[0]; u.flame = f0;
        const sp = haloSprite('#b98cff', 2.4, 0.5); sp.position.y = 1.2; g.add(sp); u.halo2 = sp;
        break;
      }
      case 'crystal': { const c = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), glow('#9f7aff', 1.8)), 0, 1.1, 0); c.scale.y = 2; u.spin = c; const sp = haloSprite('#9f7aff', 3, 0.35); sp.position.y = 1.2; g.add(sp); break; }
      case 'counter': {
        box(p.w * T - 0.2, 1.0, 1.2, M.wood, 0, 0.5, 0); box(p.w * T, 0.1, 1.4, M.woodDark, 0, 1.05, 0);
        for (let i = 0; i < 4; i++) box(p.w * T / 4 - 0.12, 0.7, 0.04, M.woodDark, -p.w * T / 2 + (i + 0.5) * (p.w * T / 4) + 0.05, 0.5, 0.62);
        [-1.5, -0.5, 0.8].forEach((x, i) => cyl(0.12, 0.1, 0.3 + i * 0.05, mat(['#c97a5a', '#5fa8e8', '#f0c66b'][i], { transparent: i === 1, opacity: i === 1 ? 0.8 : 1 }), x, 1.25, 0, 7));
        box(0.5, 0.06, 0.4, mat('#f3e6c8'), 1.3, 1.13, 0.1).rotation.y = 0.3;
        break;
      }
      case 'fireplace': {
        box(p.w * T - 0.2, 2.4, 1.1, mat('#8c88a3'), 0, 1.2, -0.3);
        box(p.w * T + 0.1, 0.18, 1.3, mat('#6f6a86'), 0, 2.35, -0.3);                 // manteau
        box(1.7, 1.05, 0.5, mat('#1f1a26'), 0, 0.62, 0.15);                              // âtre
        box(1.9, 0.14, 0.52, mat('#6f6a86'), 0, 1.2, 0.15);
        for (let i = 0; i < 4; i++) { const lg = cyl(0.1, 0.1, 1.2, M.woodDark, 0, 0.2 + (i % 2) * 0.12, 0.15 + (i - 1.5) * 0.04, 6); lg.rotation.z = Math.PI / 2 + (i - 1.5) * 0.08; }
        flames(5, 0.45, '#ff8a3a', 0.55); u.flame = u.flames[0];
        const sp = haloSprite('#ff9a4a', 3.4, 0.55); sp.position.set(0, 0.8, 0.5); g.add(sp); u.halo2 = sp;
        box(0.5, 0.2, 0.18, mat('#c9b48a'), -0.7, 2.54, -0.2);
        break;
      }
      case 'bed': {
        const w = p.w * T, d = p.h * T;
        box(w * 0.8, 0.03, 1.2, mat('#4f6fae'), 0, 0.016, d / 2 + 0.6).castShadow = false; box(w * 0.8 - 0.3, 0.035, 0.9, mat('#e8d49a'), 0, 0.02, d / 2 + 0.6).castShadow = false;
        box(w - 0.4, 0.4, d - 0.4, M.wood, 0, 0.3, 0);
        box(w - 0.5, 0.22, d - 0.9, mat('#f3ead8'), 0, 0.58, 0.2);                       // matelas
        const bl = box(w - 0.5, 0.18, d * 0.55, mat('#c0584a'), 0, 0.72, 0.45); box(w - 0.5, 0.19, 0.2, mat('#e8b65a'), 0, 0.73, 0.2);
        const pl = box(1.0, 0.22, 0.55, mat('#fffaf0'), 0, 0.78, -d / 2 + 0.65); pl.rotation.x = -0.12;
        box(w - 0.3, 1.0, 0.14, M.woodDark, 0, 0.7, -d / 2 + 0.18);
        [-1, 1].forEach((s) => { box(0.14, 0.9, 0.14, M.woodDark, s * (w / 2 - 0.25), 0.45, d / 2 - 0.25); box(0.14, 0.9, 0.14, M.woodDark, s * (w / 2 - 0.25), 0.45, -d / 2 + 0.2); });
        break;
      }
      case 'table': {
        { const rg = cyl(1.55, 1.55, 0.03, mat('#b04a4a'), 0, 0.015, 0, 14); rg.castShadow = false; cyl(1.35, 1.35, 0.035, mat('#e8c47a'), 0, 0.02, 0, 14).castShadow = false; cyl(1.1, 1.1, 0.04, mat('#b04a4a'), 0, 0.025, 0, 14).castShadow = false; }
        cyl(0.82, 0.82, 0.08, M.wood, 0, 0.88, 0, 10); cyl(0.84, 0.84, 0.02, mat('#f3ead8'), 0, 0.93, 0, 10);
        cyl(0.1, 0.16, 0.85, M.woodDark, 0, 0.42, 0, 6); [0, 1, 2].forEach((i) => { const a = i * 2.09; box(0.5, 0.08, 0.1, M.woodDark, Math.cos(a) * 0.3, 0.06, Math.sin(a) * 0.3).rotation.y = -a; });
        cyl(0.1, 0.08, 0.2, mat('#f0c66b'), 0.25, 1.05, 0.1, 6); cyl(0.07, 0.07, 0.14, mat('#c97a5a'), -0.3, 1.0, -0.2, 6);
        const cd = cyl(0.04, 0.04, 0.22, mat('#fff4d8'), -0.05, 1.07, 0.3, 5); const cf = add(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), fl('#ffc86a', 2.2)), -0.05, 1.26, 0.3); cf.castShadow = false; u.flame = cf;
        [0.9, 2.2, 3.9, 5.3].forEach((a, i) => { cyl(0.2, 0.17, 0.08, M.wood, Math.cos(a) * 1.0, 0.5, Math.sin(a) * 1.0, 7); cyl(0.04, 0.04, 0.5, M.woodDark, Math.cos(a) * 1.0, 0.25, Math.sin(a) * 1.0, 4); });
        break;
      }
      case 'shelf': {
        const w = p.w * T - 0.2;
        box(w, 2.3, 0.1, M.woodDark, 0, 1.15, -0.7); [-1, 1].forEach((s) => box(0.1, 2.3, 0.6, M.woodDark, s * w / 2, 1.15, -0.4));
        [0.05, 0.8, 1.55, 2.3].forEach((y) => box(w, 0.07, 0.62, M.wood, 0, y, -0.4));
        const cols = ['#c0584a', '#4f6fae', '#5fae76', '#e8b65a', '#8a5fb0', '#e9e2f5'];
        for (let r = 0; r < 3; r++) for (let i = 0; i < p.w * 3; i++) { const k = (i * 7 + r * 3) % 6; const x = -w / 2 + 0.3 + i * (w - 0.5) / Math.max(1, p.w * 3 - 1); if ((i + r) % 4 === 3) { cyl(0.12, 0.1, 0.3, mat(cols[k], { transparent: true, opacity: 0.85 }), x, 0.2 + r * 0.75 + 0.12, -0.35, 6); } else { const bk = box(0.16, 0.4 + (k % 3) * 0.08, 0.34, mat(cols[k]), x, 0.1 + r * 0.75 + 0.22, -0.4); bk.rotation.z = (k === 2 && r === 1) ? 0.15 : 0; } }
        break;
      }
      case 'desk': {
        box(p.w * T - 0.3, 0.12, 1.2, M.wood, 0, 0.9, 0); [-1, 1].forEach((s) => box(0.14, 0.9, 1.0, M.woodDark, s * (p.w * T / 2 - 0.3), 0.45, 0));
        box(p.w * T - 0.8, 0.5, 0.9, M.wood, 0, 0.55, 0.05);
        const mp = box(1.6, 0.02, 1.0, mat('#f3e6c8'), 0, 0.97, 0); mp.rotation.y = 0.1;
        cyl(0.08, 0.08, 0.3, M.gold, 1.2, 1.12, 0.2, 6); box(0.4, 0.1, 0.3, mat('#4f6fae'), -1.1, 1.0, -0.2); box(0.4, 0.08, 0.3, mat('#c0584a'), -1.1, 1.09, -0.2).rotation.y = 0.2;
        const cd = cyl(0.04, 0.04, 0.2, mat('#fff4d8'), 0.6, 1.07, -0.3, 5); const cf = add(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), fl('#ffc86a', 2.2)), 0.6, 1.24, -0.3); cf.castShadow = false; u.flame = cf;
        break;
      }
      case 'globe': { add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), mat('#4f7fd0')), 0, 1.2, 0); add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 4, 16), M.gold), 0, 1.2, 0).rotation.y = 0.5; add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 4), mat('#5fae76')), 0.2, 1.38, 0.3); cyl(0.06, 0.25, 0.75, M.woodDark, 0, 0.37, 0, 6); u.spin = g.children[0]; break; }
      case 'telescope': { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.4, 8), M.gold), 0, 1.3, 0); t.rotation.z = 0.8; for (let i = 0; i < 3; i++) { const a = i * 2.09; const lg = box(0.06, 1.0, 0.06, M.woodDark, Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3); lg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); } break; }
      default: box(0.8, 0.8, 0.8, M.wood, 0, 0.4, 0);
    }
    return { g, light };
  }
  zones.forEach((z, zi) => {
    (z.props || []).forEach((p) => {
      const r = p.t === 'house' ? { g: house(p, z) } : propMesh(p, z);
      r.g.position.y += H(r.g.position.x, r.g.position.z);   /* ALTITUDE : bâtiments et meubles posés sur le relief (prévoir un sol plat dessous) */
      detail(zi, r.g.position.x, r.g.position.z).add(r.g);
      { const u = r.g.userData, skip = new Set(); ['spin', 'float', 'flame', 'bulb', 'hang', 'bucket'].forEach((k) => u[k] && skip.add(u[k])); (u.flames || []).forEach((m) => skip.add(m)); (u.drops || []).forEach((m) => skip.add(m)); bakeStatic(r.g, skip); }
      props.push({ p, zi, z, g: r.g });
    });
  });

  /* ---------- Coffres et objets à ramasser ---------- */
  const chestViews = {};
  const chestGeo = new THREE.BoxGeometry(1.1, 0.7, 0.8), lidGeo = new THREE.BoxGeometry(1.14, 0.3, 0.84);
  function makeChest(c, z, zi) {
    const g = new THREE.Group(); g.position.set(W(z.ox + c.x), H(W(z.ox + c.x), W(z.oy + c.y)), W(z.oy + c.y));
    const rare = c.item && ['marteau', 'sceptre', 'fragment_coeur', 'anneau_vie', 'amulette_lume'].includes(c.item);
    const b = new THREE.Mesh(chestGeo, rare ? mat('#5a4a8a') : M.wood); b.position.y = 0.35; b.castShadow = true; g.add(b);
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.12, 0.84), M.gold); band.position.y = 0.45; g.add(band);
    const lidP = new THREE.Group(); lidP.position.set(0, 0.7, -0.4); g.add(lidP);
    const lid = new THREE.Mesh(lidGeo, rare ? mat('#6a5a9a') : M.woodDark); lid.position.set(0, 0.15, 0.4); lid.castShadow = true; lidP.add(lid);
    const lk = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.1), M.gold); lk.position.set(0, 0.55, 0.42); g.add(lk);
    const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), glow('#ffe2a0', 2.5)); sparkle.position.y = 1.3; g.add(sparkle);
    g.rotation.y = 0;
    detail(zi, g.position.x, g.position.z).add(g);
    return { c, z, zi, g, lid: lidP, sparkle, open: false, anim: 0, x: z.ox + c.x, y: z.oy + c.y };
  }
  zones.forEach((z, zi) => (z.chests || []).forEach((c) => (chestViews[c.id] = makeChest(c, z, zi))));

  const pickupViews = {};
  zones.forEach((z, zi) => (z.pickups || []).forEach((pk) => {
    const g = new THREE.Group(); g.position.set(W(z.ox + pk.x), H(W(z.ox + pk.x), W(z.oy + pk.y)), W(z.oy + pk.y));
    let f;
    if (pk.item === 'fleur_miel') {
      f = new THREE.Group();
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4), mat('#5fae76')); st.position.y = 0.3; f.add(st);
      for (let i = 0; i < 5; i++) { const pt = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshStandardMaterial({ color: '#ffd76a', emissive: '#ffb020', emissiveIntensity: 0.6, flatShading: true })); const a = (i / 5) * Math.PI * 2; pt.position.set(Math.cos(a) * 0.14, 0.65, Math.sin(a) * 0.14); pt.scale.y = 0.5; f.add(pt); }
      { const c = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), glow('#fff1c9', 2)); c.position.set(0, 0.68, 0); f.add(c); }
    } else if (pk.t === 'page') {
      f = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.72), new THREE.MeshStandardMaterial({ color: 0xf6ead2, emissive: 0xffe9b8, emissiveIntensity: 0.4 })); f.position.y = 1; f.rotation.x = -0.5;
    } else {
      f = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 14), new THREE.MeshStandardMaterial({ color: '#e8b65a', metalness: 0.7, roughness: 0.3, emissive: '#e8a040', emissiveIntensity: 0.5 })); f.position.y = 0.9;
    }
    g.add(f);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 4, 20), glow('#ffe2a0', 1.5)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; g.add(ring);
    detail(zi, g.position.x, g.position.z).add(g);
    pickupViews[pk.id] = { pk, z, zi, g, f, x: z.ox + pk.x, y: z.oy + pk.y };
  }));

  /* ---------- Faisceaux ---------- */
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), flareGeo = new THREE.SphereGeometry(1, 12, 8);
  const beamMats = {};
  ['w', 'r', 'g', 'b', 'y', 'm', 'c'].forEach((c) => {
    beamMats[c] = {
      outer: new THREE.MeshBasicMaterial({ color: new THREE.Color(COLORS[c]).multiplyScalar(1.4), transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false }),
      core: new THREE.MeshBasicMaterial({ color: new THREE.Color(COLORS[c]).lerp(new THREE.Color('#ffffff'), c === 'w' ? 0.2 : 0.45).multiplyScalar(c === 'w' ? 2.2 : 3) }),
      flare: new THREE.MeshBasicMaterial({ color: new THREE.Color(COLORS[c]).multiplyScalar(3), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
    };
  });
  const beamGroup = new THREE.Group(); scene.add(beamGroup);
  const pool = { outer: [], core: [], flare: [] };
  const UP = new THREE.Vector3(0, 1, 0);
  const getPooled = (kind, g, i) => { if (!pool[kind][i]) { const m = new THREE.Mesh(g, beamMats.w[kind]); m.frustumCulled = false; beamGroup.add(m); pool[kind][i] = m; } return pool[kind][i]; };
  function drawBeams(segs) {
    let io = 0, ic = 0, iflare = 0;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3();
    segs.forEach((s) => {
      a.set(W(s.x0), BEAM_Y + H(W(s.x0), W(s.y0)), W(s.y0)); b.set(W(s.x1), BEAM_Y + H(W(s.x1), W(s.y1)), W(s.y1));   /* ALTITUDE : faisceau incliné entre les hauteurs de ses extrémités */
      d.subVectors(b, a); const len = d.length(); if (len < 0.01) return;
      d.normalize();
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const o = getPooled('outer', beamGeo, io++); o.material = beamMats[s.c].outer; o.position.copy(mid); o.quaternion.setFromUnitVectors(UP, d); o.scale.set(0.13, len, 0.13); o.visible = true; o.userData.base = 0.13;
      const c = getPooled('core', beamGeo, ic++); c.material = beamMats[s.c].core; c.position.copy(mid); c.quaternion.copy(o.quaternion); c.scale.set(0.045, len, 0.045); c.visible = true;
      if (s.end) { const f = getPooled('flare', flareGeo, iflare++); f.material = beamMats[s.c].flare; f.position.copy(b); f.scale.setScalar(s.end === 'hit' ? 0.32 : 0.2); f.visible = true; f.userData.base = s.end === 'hit' ? 0.32 : 0.2; }
    });
    for (let i = io; i < pool.outer.length; i++) pool.outer[i].visible = false;
    for (let i = ic; i < pool.core.length; i++) pool.core[i].visible = false;
    for (let i = iflare; i < pool.flare.length; i++) pool.flare[i].visible = false;
  }

  /* Pool fixe de PointLight pour les vitrails : toujours le même nombre de lumières dans la scène, réaffectées aux vitrails les plus proches */
  const VLIGHTS = LOW ? 0 : 3, vlights = [], vwp = new THREE.Vector3(); let vlAcc = 1;
  for (let i = 0; i < VLIGHTS; i++) { const l = new THREE.PointLight(0xffffff, 0, 4.5); scene.add(l); vlights.push(l); }
  function updateVitrailLights(dt) {
    vlAcc += dt; if (vlAcc < 0.25) return; vlAcc = 0;
    const cand = [];
    vitrails.forEach((vt) => { if (!vt.g.parent || !vt.g.parent.visible || !vt.g.visible) return; vt.g.getWorldPosition(vwp); const d = Math.hypot(vwp.x - camPos.x, vwp.z - camPos.z); if (d < 30) cand.push({ vt, d, x: vwp.x, z: vwp.z }); });
    cand.sort((a, b) => a.d - b.d);
    vlights.forEach((l, i) => { const c = cand[i]; if (!c) { l.intensity = 0; return; } l.color.copy(c.vt.col); l.position.set(c.x, BEAM_Y + 0.2, c.z); l.intensity = 1.2; });
  }
  let cullAcc = 1;
  const life = createLife(scene, isl, zones, { low: LOW });
  const showHalo = (sp) => { sp.visible = sp.material.opacity > 0.02; };
  /* ---------- Ciel : étoiles et halo de soleil, pilotés par setSky(k) (k : 0 crépuscule → 1 aube dorée) ---------- */
  const sky = new THREE.Group(); scene.add(sky);
  let starPts = null, sunSp = null, skyK = 0.5, skyOn = true;
  {
    const NS = LOW ? 90 : 220, pos = new Float32Array(NS * 3), size = new Float32Array(NS), alpha = new Float32Array(NS), col = new Float32Array(NS * 3);
    for (let i = 0; i < NS; i++) { const a = hash(i, 1) * Math.PI * 2, e = 0.12 + hash(i, 2) * 1.2, r = 300; pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; size[i] = 0.9 + hash(i, 3) * 1.4; alpha[i] = 0.5 + hash(i, 4) * 0.5; const c = new THREE.Color(['#ffffff', '#ffe8c8', '#d8e8ff', '#ffd8f0'][i % 4]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1)); g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1)); g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 0 }, uTime: U.time },
      vertexShader: 'attribute float aSize; attribute float aAlpha; attribute vec3 aColor; uniform float uK; uniform float uTime; varying float vA; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * 2.2; vA = aAlpha * uK * (0.7 + 0.3 * sin(uTime * 1.5 + position.x * 0.3)); vC = aColor; }',
      fragmentShader: 'varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, r) * vA; if (a < 0.01) discard; gl_FragColor = vec4(vC, a); }' });
    starPts = new THREE.Points(g, m); starPts.frustumCulled = false; starPts.renderOrder = -3; sky.add(starPts);
    sunSp = haloSprite('#ffd9a0', 150, 0.4); sunSp.renderOrder = -2; sunSp.material.depthTest = false; sky.add(sunSp);
  }
  function setSky(k) { skyK = Math.max(0, Math.min(1, k)); }
  /* ---------- Grappin de lumière : fil lumineux + crochet, piloté par le gameplay ---------- */
  const grap = new THREE.Group(); grap.visible = false; scene.add(grap);
  const gOuter = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fe9ff').multiplyScalar(1.4), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  const gCore = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8fbff').multiplyScalar(3) }));
  const gHook = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff2c9').multiplyScalar(3) }));
  const gSpark = haloSprite('#bff3ff', 1.1, 0.8);
  [gOuter, gCore].forEach((m) => { m.frustumCulled = false; }); grap.add(gOuter, gCore, gHook, gSpark);
  const gA = new THREE.Vector3(), gB = new THREE.Vector3(), gD = new THREE.Vector3();
  /* from, to : THREE.Vector3 ; k : 0..1 portée atteinte (lancer) ; tension : 0..1 (fil plus fin/plus clair quand il tire) */
  function grappleLine(from, to, k = 1, tension = 0) {
    grap.visible = true; gA.copy(from); gB.copy(from).lerp(to, Math.max(0.001, Math.min(1, k)));
    gD.subVectors(gB, gA); const len = gD.length(); if (len < 0.01) { grap.visible = false; return; } gD.normalize();
    const mid = gA.clone().add(gB).multiplyScalar(0.5), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), gD);
    gOuter.position.copy(mid); gOuter.quaternion.copy(q); gOuter.scale.set(0.09 + tension * 0.05, len, 0.09 + tension * 0.05);
    gCore.position.copy(mid); gCore.quaternion.copy(q); gCore.scale.set(0.03, len, 0.03);
    gHook.position.copy(gB); gHook.rotation.y += 0.4; gHook.scale.setScalar(0.9 + Math.sin(performance.now() * 0.02) * 0.15); gSpark.position.copy(gB);
  }
  const grappleHide = () => { grap.visible = false; };
  /* ---------- Animations du décor ---------- */
  function animate(dt, t, ctx) {
    tickGfx(t); life.update(dt, t); updateVitrailLights(dt); tickDesert(t, dt, { props, socleViews, isl });   /* ACTE III */
    if (camPos.x < 1e5) { sky.position.copy(camPos); sunSp.position.set(150, 95 + skyK * 10, 240); }
    if (starPts) { starPts.material.uniforms.uK.value = skyOn ? Math.max(0, 1 - skyK * 1.3) * 0.85 : 0; sunSp.material.opacity = skyOn ? 0.22 + skyK * 0.45 : 0; sunSp.material.color.set('#ff9ec7').lerp(new THREE.Color('#ffe2a0'), skyK); sky.visible = skyOn; }
    cullAcc += dt; if (cullAcc > 0.2) { cullAcc = 0; cullers.forEach((c) => { c.g.visible = Math.hypot(c.x - camPos.x, c.z - camPos.z) < (LOW ? 40 : 50) + c.r; }); }
    shafts.forEach((sm) => { if (sm.parent && sm.parent.visible) sm.material.opacity = sm.userData.base * (0.65 + 0.35 * Math.sin(t * 0.5 + sm.userData.ph)); });
    Object.values(views).forEach((v) => {
      if (!v.g.parent || !v.g.parent.visible) return;
      if (v.tick) v.tick(t, dt, isl);   /* ACTE IV */
      if (v.head && v.target) { const want = v.target(); let d = want - v.head.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); v.head.rotation.y += d * (1 - Math.exp(-14 * dt)); }
      if (v.float) v.float.position.y = (v.floatY || (v.e.t === 'prism' ? BEAM_Y + 0.1 : v.e.t === 'start' ? 0.7 : 1)) + Math.sin(t * 2 + v.e.x) * 0.08;
      if (v.hook) v.hook.rotation.y += dt * 0.6;
      if (v.spinObj) v.spinObj.rotation.y += dt * (v.e.t === 'prism' ? 0.4 : 1.5);
      if (v.e.t === 'receiver') {
        const on = v.lit ? 1 : 0;
        v.mat.emissiveIntensity += ((on ? 3.2 + Math.sin(t * 4) * 0.4 : 0.15) - v.mat.emissiveIntensity) * (1 - Math.exp(-6 * dt));
        v.crystal.rotation.y += dt * (on ? 1.6 : 0.3);
      }
      if (v.halo && v.e.t !== 'beacon') { v.halo.material.opacity += ((v.lit ? 0.7 + Math.sin(t * 4) * 0.1 : 0) - v.halo.material.opacity) * (1 - Math.exp(-6 * dt)); showHalo(v.halo); }
      if (v.e.t === 'relay') { v.mat.emissiveIntensity += ((v.lit ? 3 : 0.12) - v.mat.emissiveIntensity) * (1 - Math.exp(-6 * dt)); v.crystal.rotation.y += dt * (v.lit ? 2 : 0.3); }
      if (v.e.t === 'beacon') {
        v.rings.forEach((rg, i) => { rg.mat.emissiveIntensity += ((rg.on ? 3.5 : 0.1) - rg.mat.emissiveIntensity) * (1 - Math.exp(-5 * dt)); rg.r.rotation.z += dt * (rg.on ? 1.2 + i * 0.3 : 0.1); });
        const end = isl.gates.end && isl.gates.end.open;
        v.crownMat.emissiveIntensity += ((end ? 6 : 0.1) - v.crownMat.emissiveIntensity) * (1 - Math.exp(-1.5 * dt));
        v.crown.rotation.y += dt * (end ? 1 : 0.2); v.cageRing.rotation.z += dt * (end ? 0.9 : 0.1);
        const lit = end || (v.rings.length && v.rings.every((r) => r.on)); v.halo.material.opacity += ((end ? 0.9 : lit ? 0.5 : v.rings.filter((r) => r.on).length * 0.12) - v.halo.material.opacity) * (1 - Math.exp(-2 * dt)); showHalo(v.halo);
        v.column.material.opacity += ((end ? 0.35 : 0) - v.column.material.opacity) * (1 - Math.exp(-0.8 * dt));
      }
    });
    Object.values(gateViews).forEach((list) => list.forEach((v) => {
      if (v.kind === 'bridge' && v.anim !== undefined && v.group.visible && v.anim < 1) {
        v.anim += dt * 1.6;
        const k = Math.max(0, Math.min(1, v.anim)), e = 1 - Math.pow(1 - k, 3);
        v.group.position.y = (v.baseY || 0) - 3 + 3 * e; v.group.scale.setScalar(Math.max(0.01, e));
      } else if (v.kind !== 'bridge' && v.anim > 0 && v.group.visible) {
        v.anim += dt * 1.2;
        if (v.kind === 'door') v.group.position.y = (v.baseY || 0) - v.anim * 2.8;
        else { v.group.scale.set(1 + v.anim * 0.3, Math.max(0.01, 1 - v.anim), 1 + v.anim * 0.3); if (v.mat && v.mat.opacity !== undefined) v.mat.opacity = Math.max(0, 0.85 - v.anim); }
        if (v.anim >= 1) v.group.visible = false;
      }
      if (v.kind === 'seal' && v.group.visible) v.group.children.forEach((c) => (c.rotation.y += dt * (c.userData.spin || 1)));
    }));
    pool.outer.forEach((m, i) => { if (m.visible) { const s = m.userData.base * (1 + Math.sin(t * 9 + i) * 0.12); m.scale.x = m.scale.z = s; } });
    pool.flare.forEach((m, i) => { if (m.visible) m.scale.setScalar(m.userData.base * (1 + Math.sin(t * 12 + i * 2) * 0.25)); });
    decor.forEach((d) => {
      if (d.userData.cloud) { d.position.x += d.userData.v * dt; if (d.position.x > 260) d.position.x = -90; }
      else d.position.y = d.userData.base + Math.sin(t * 0.3 + d.userData.ph) * 1.2;
    });
    props.forEach((pr) => {
      const u = pr.g.userData;
      if (u.spin) u.spin.rotation.y += dt * 0.8;
      if (u.float) u.float.position.y = 2.6 + Math.sin(t * 1.6) * 0.15;
      if (u.flame && !u.flames) u.flame.scale.set(1 + Math.sin(t * 13) * 0.08, 1 + Math.sin(t * 9 + 1) * 0.15, 1);
      if (u.flames) u.flames.forEach((f) => { const ph = t * 9 + f.userData.ph; f.scale.set(1 + Math.sin(ph) * 0.1, 1 + Math.sin(ph * 1.3 + 1) * 0.2, 1 + Math.sin(ph * 0.8) * 0.1); f.rotation.z = Math.sin(ph * 0.7) * 0.08; });
      if (u.halo2) u.halo2.material.opacity = 0.45 + Math.sin(t * 11) * 0.08 + Math.sin(t * 7.3) * 0.06;
      if (u.drops) u.drops.forEach((d) => { const k = (t * 0.7 + d.userData.ph) % 1, a = d.userData.a; d.position.set(Math.cos(a) * (0.35 + k * 0.7), 1.78 + Math.sin(k * Math.PI) * 0.45 - k * k * 1.3, Math.sin(a) * (0.35 + k * 0.7)); d.scale.setScalar(0.7 + (1 - k) * 0.6); });
      if (u.hang) u.hang.position.x = Math.sin(t * 1.4 + pr.p.x) * 0.06;
      if (u.lampMat && u.halo) { u.halo.material.opacity += ((u.lampMat.emissiveIntensity > 0.5 ? 0.5 + Math.sin(t * 7 + pr.p.x) * 0.05 : 0) - u.halo.material.opacity) * (1 - Math.exp(-5 * dt)); showHalo(u.halo); }
      if (u.doorHalo) u.doorHalo.material.opacity = 0.4 + Math.sin(t * 6 + pr.p.x) * 0.06;
      if (u.bucket) u.bucket.rotation.z = Math.sin(t * 1.2) * 0.04;
    });
    Object.values(chestViews).forEach((cv) => {
      if (cv.open && cv.anim < 1) { cv.anim = Math.min(1, cv.anim + dt * 2.5); cv.lid.rotation.x = -cv.anim * 1.9; }
      cv.sparkle.visible = !cv.open; cv.sparkle.rotation.y += dt * 2; cv.sparkle.position.y = 1.3 + Math.sin(t * 3) * 0.1;
    });
    Object.values(pickupViews).forEach((pv) => { if (pv.g.visible) { pv.f.rotation.y += dt * 1.5; } });
  }
  /* Une zone (et ses voisines) visibles ; les intérieurs seulement quand on y est */
  function showZones(current) {
    zones.forEach((z, zi) => { zoneGroups[zi].visible = current >= 0 && zones[current].interior ? zi === current : !z.interior; });
    skyOn = !(current >= 0 && ['sanctuaire', 'temple', 'interieur', 'grotte', 'lac', 'phare_abysses' /* ACTE IV */, 'moulins' /* ACTE V */].includes(zones[current].theme));
    if (current >= 0 && current !== life.cur) { life.cur = current; life.setZone(current, props); }
  }

  hole.install(root);   /* ALTITUDE : trou de visibilité (caméra fixe) sur tous les matériaux du décor */
  return { H, socleViews, setSky, grappleLine, grappleHide, root, M, views, gateViews, setGateView, drawBeams, animate, props, chestViews, pickupViews, removeCell, showZones, zoneGroups, decor };
}
