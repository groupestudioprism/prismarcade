/* =========================================================
   LUMEN — construction 3D du monde à partir de l'île logique :
   terrain par zone (thèmes), décor, bâtiments, portes et ponts,
   objets de lumière (lanternes, miroirs…), faisceaux, coffres,
   objets à ramasser. Aucun état de partie ici : seulement des vues.
   ========================================================= */
import * as THREE from 'three';
import { COLORS, DIRS } from '../logic.js';
import { hash, T, W, BEAM_Y } from '../engine/util.js';

const C = (hex) => new THREE.Color(hex);
const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.9 }, o));
export const glow = (hex, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });

/* Couleurs par thème */
const THEMES = {
  puzzle: { grass: '#6aae5c', edge: '#86a85a', path: '#c9b48e', dirt: '#8a6650', under: '#5d4b66', rock: '#9097ab', tuft: '#86c46a', leaves: [['#4f9a6a', '#5fae76', '#468a5f'], ['#f4a7c4', '#ec8db3', '#f7c1d6']], blossom: 0.65 },
  village: { grass: '#74b862', edge: '#8fae5e', path: '#d2bf9c', dirt: '#8a6650', under: '#5d4b66', rock: '#a29fb3', tuft: '#8cca6e', leaves: [['#4f9a6a', '#5fae76', '#468a5f'], ['#f4a7c4', '#ec8db3', '#f7c1d6']], blossom: 0.5 },
  lande: { grass: '#8ea85a', edge: '#a3a560', path: '#b9a47e', dirt: '#7a5a46', under: '#4e4060', rock: '#8a8698', tuft: '#a9b86a', leaves: [['#3f7a4f', '#4f8a5a', '#5a7a3f'], ['#c9a050', '#b98a3f', '#d9b060']], blossom: 0.25 },
  sanctuaire: { grass: '#6c6788', edge: '#5d5878', path: '#7a7596', dirt: '#3f3a55', under: '#2e2840', rock: '#4a4362', tuft: '#8f7ad6', leaves: [['#5a4a8a', '#6a5a9a', '#4a3a7a'], ['#5a4a8a', '#6a5a9a', '#4a3a7a']], blossom: 0, floor: true },
  interieur: { grass: '#a0714f', edge: '#8f6446', path: '#a0714f', dirt: '#5a3f2f', under: '#3a2a22', rock: '#e9dcc2', tuft: '#a0714f', leaves: [['#5fae76', '#4f9a6a', '#468a5f'], ['#5fae76', '#4f9a6a', '#468a5f']], blossom: 0, floor: true, wood: true },
};
export const themeOf = (z) => (z && z.theme) || 'puzzle';

export function buildWorld(scene, isl, def, opts = {}) {
  const LOW = !!opts.low;
  const root = new THREE.Group(); scene.add(root);
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
      dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      if (col) m.setColorAt(i, col);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = !!o.cast; m.receiveShadow = o.receive !== false;
    parent.add(m);
    return m;
  }
  const zoneGroups = zones.map(() => { const g = new THREE.Group(); root.add(g); return g; });
  const cellIndex = { r: {}, c: {} };   // ronces / roches fissurées : index d'instance par case (pour les retirer)
  const meshes = { r: [], c: [] };
  const depthOf = {};
  const tileGeo = new THREE.BoxGeometry(T, 0.6, T), dirtGeo = new THREE.BoxGeometry(T, 1.8, T), underGeo = new THREE.ConeGeometry(T * 0.78, 1, 6);
  const wallGeo = new THREE.BoxGeometry(T, 1, T);
  const rockGeo = new THREE.DodecahedronGeometry(1, 0), trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.3, 6), crownGeo = new THREE.IcosahedronGeometry(0.85, 0);
  const tuftGeo = new THREE.ConeGeometry(0.09, 0.42, 4), flowerGeo = new THREE.IcosahedronGeometry(0.09, 0), pebbleGeo = new THREE.DodecahedronGeometry(0.16, 0);
  const ronceGeo = new THREE.IcosahedronGeometry(0.75, 0), thornGeo = new THREE.ConeGeometry(0.07, 0.4, 4);

  zones.forEach((z, zi) => {
    const th = THEMES[themeOf(z)], G = zoneGroups[zi];
    const cells = [];
    z.map.forEach((row, ly) => { for (let lx = 0; lx < row.length; lx++) { const x = z.ox + lx, y = z.oy + ly; if (isl.zoneAt[y][x] === zi && isLand(x, y)) cells.push([x, y]); } });
    cells.forEach(([x, y]) => { let d = 0; for (let r = 1; r <= 4; r++) { let ok = true; for (let dy = -r; dy <= r && ok; dy++) for (let dx = -r; dx <= r; dx++) if (!isLand(x + dx, y + dy)) { ok = false; break; } if (!ok) break; d = r; } depthOf[x + ',' + y] = d; });
    const wallTheme = th.floor;   // sanctuaire / intérieur : '#' = murs hauts
    const floorCells = cells.filter(([x, y]) => !(wallTheme && terr(x, y) === '#'));
    instanced(G, tileGeo, M.grass, floorCells, (o, [x, y]) => {
      const t = terr(x, y), edge = depthOf[x + ',' + y] === 0;
      o.position.set(W(x), -0.3 + (th.floor ? 0 : (hash(x, y, 1) - 0.5) * 0.025), W(y));
      if (th.wood) return C(((x + y) % 2) ? '#a77a55' : '#9a6c4a').offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.05);
      if (th.floor) return C(((x + y) % 2) ? th.grass : th.edge).offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.05);
      if (t === ',' || t === 'r' && false) return C(th.path).offsetHSL(0, 0, (hash(x, y, 3) - 0.5) * 0.08);
      if (t === 'x') return C(th.path);
      return C(edge ? th.edge : th.grass).offsetHSL((hash(x, y, 2) - 0.5) * 0.04, 0, (hash(x, y, 3) - 0.5) * 0.08);
    });
    if (!z.interior) {
      instanced(G, dirtGeo, M.dirt, cells, (o, [x, y]) => { o.position.set(W(x), -1.5, W(y)); return C(th.dirt).offsetHSL(0, 0, (hash(x, y, 4) - 0.5) * 0.08); });
      instanced(G, underGeo, M.under, cells, (o, [x, y]) => {
        const h = 2 + depthOf[x + ',' + y] * 2.4 + hash(x, y, 5) * 3;
        o.position.set(W(x) + (hash(x, y, 6) - 0.5) * 0.6, -2.4 - h / 2, W(y) + (hash(x, y, 7) - 0.5) * 0.6);
        o.rotation.set(Math.PI, hash(x, y, 8) * 6, 0); o.scale.set(1, h, 1);
        return C(th.under).offsetHSL(0, 0, (hash(x, y, 9) - 0.5) * 0.1);
      }, { receive: false });
    }
    // murs (donjon, intérieurs) ou rochers (extérieur)
    const rocks = cells.filter(([x, y]) => terr(x, y) === '#');
    if (wallTheme) {
      const hgt = z.interior ? 2.6 : 2.9;
      const lowRow = z.oy + z.map.length - 1;   // mur sud abaissé : la caméra voit l'intérieur
      instanced(G, wallGeo, z.interior ? M.rock : M.rock, rocks, (o, [x, y]) => {
        const hh = z.interior && y === lowRow ? 0.45 : hgt;
        o.position.set(W(x), hh / 2 - 0.02, W(y)); o.scale.set(1, hh, 1);
        if (z.interior) return C(((x + y) % 3 === 0) ? '#d9c9a8' : '#efe4cf');
        return C(th.rock).offsetHSL(0, 0, (hash(x, y, 17) - 0.5) * 0.1);
      }, { cast: !z.interior });
      if (z.interior) instanced(G, new THREE.BoxGeometry(T * 1.02, 0.22, 0.3), M.woodDark, rocks.filter(([x, y]) => y !== z.oy + z.map.length - 1), (o, [x, y]) => { o.position.set(W(x), 2.0, W(y)); });
      else {
        // cristaux sur les murs du sanctuaire
        const tips = rocks.filter(([x, y]) => hash(x, y, 40) < 0.18);
        instanced(G, new THREE.OctahedronGeometry(0.35, 0), glow('#9f7aff', 1.6), tips, (o, [x, y]) => { o.position.set(W(x) + (hash(x, y, 41) - 0.5), 3.05, W(y) + (hash(x, y, 42) - 0.5)); o.scale.set(0.7, 1.6 + hash(x, y, 43), 0.7); o.rotation.y = hash(x, y, 44) * 3; }, { receive: false });
        instanced(G, new THREE.BoxGeometry(T * 1.04, 0.18, T * 1.04), mat('#5d5878'), rocks, (o, [x, y]) => { o.position.set(W(x), 2.9, W(y)); });
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
    const trees = cells.filter(([x, y]) => terr(x, y) === 'T');
    instanced(G, trunkGeo, M.trunk, trees, (o, [x, y]) => { o.position.set(W(x), 0.65, W(y)); }, { cast: true });
    instanced(G, crownGeo, M.foliage, trees.flatMap(([x, y]) => [[x, y, 0], [x, y, 1], [x, y, 2]]), (o, [x, y, k]) => {
      const s = [1, 0.75, 0.6][k];
      o.position.set(W(x) + [0, 0.45, -0.4][k], 1.75 + [0, 0.35, 0.55][k], W(y) + [0, -0.2, 0.3][k]);
      o.rotation.set(hash(x, y, 21 + k), hash(x, y, 24 + k) * 6, 0); o.scale.set(s, s * 0.85, s);
      return C(th.leaves[hash(x, y, 20) < th.blossom ? 1 : 0][k]);
    }, { cast: true });
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
        o.position.set(W(x) + (hash(x, y, 40 + k) - 0.5) * 1.7, 0.18, W(y) + (hash(x, y, 50 + k) - 0.5) * 1.7);
        o.rotation.z = (hash(x, y, 60 + k) - 0.5) * 0.4;
        if (themeOf(z) === 'lande') o.scale.set(1, 1.5, 1);
        return C(th.tuft).offsetHSL(0, 0, (hash(x, y, 70 + k) - 0.5) * 0.15);
      }, { receive: false });
      const flowers = grassCells.filter(([x, y]) => hash(x, y, 80) < (themeOf(z) === 'village' ? 0.4 : 0.3));
      instanced(G, flowerGeo, M.tuft, flowers, (o, [x, y]) => {
        o.position.set(W(x) + (hash(x, y, 81) - 0.5) * 1.6, 0.14, W(y) + (hash(x, y, 82) - 0.5) * 1.6);
        return C(['#ffffff', '#ffd76a', '#ff9ec7', '#c9b6ff'][Math.floor(hash(x, y, 83) * 4)]);
      }, { receive: false });
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
      scene.add(g); decor.push(g);
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
      scene.add(g); decor.push(g);
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
          grp.position.set(W(x), 0, W(y)); if (!along) grp.rotation.y = Math.PI / 2;
          grp.visible = false;
          const ghost = new THREE.Mesh(ghostGeo, M.ghost); ghost.position.set(W(x), -0.05, W(y)); if (!along) ghost.rotation.y = Math.PI / 2;
          root.add(grp, ghost);
          gateViews[gt.id].push({ group: grp, ghost, kind: 'bridge', delay: i * 0.12 });
        } else {
          const grp = new THREE.Group(); grp.position.set(W(x), 0, W(y));
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
          gateViews[gt.id].push({ group: grp, kind: gt.look || 'barrier', mat: m, delay: 0 });
        }
      });
    });
  }
  function setGateView(g, open, instant) {
    (gateViews[g.id] || []).forEach((v) => {
      if (v.kind === 'bridge') {
        v.ghost.visible = !open;
        if (instant) { v.group.visible = open; v.group.position.y = 0; v.group.scale.set(1, 1, 1); v.anim = 1; }
        else if (open) { v.group.visible = true; v.anim = -v.delay; v.group.position.y = -3; }
      } else {
        if (instant) { v.group.visible = !open; v.group.scale.set(1, 1, 1); v.group.position.y = 0; v.anim = 0; }
        else if (open) v.anim = 0.0001;
      }
    });
  }

  /* ---------- Objets de lumière ---------- */
  const views = {};
  const pedestalGeo = new THREE.CylinderGeometry(0.72, 0.9, 0.42, 8);
  const dirAngle = (d) => Math.atan2(-DIRS[d][1], DIRS[d][0]);
  function pedestal(g, rot) {
    const p = new THREE.Mesh(pedestalGeo, M.stone); p.position.y = 0.21; p.castShadow = true; p.receiveShadow = true; g.add(p);
    if (rot) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.05, 6, 32), M.gold); r.rotation.x = Math.PI / 2; r.position.y = 0.43; g.add(r); }
  }
  const RECV_GEO = { w: new THREE.OctahedronGeometry(0.42, 0), r: new THREE.ConeGeometry(0.46, 0.8, 3), g: new THREE.IcosahedronGeometry(0.4, 0), b: new THREE.BoxGeometry(0.55, 0.55, 0.55) };
  isl.ents.forEach((e) => {
    const zg = zoneGroups[e.zone] || root;
    const g = new THREE.Group();
    g.position.set(W(e.x), 0, W(e.y));
    const v = { e, g };
    if (e.t === 'lantern') {
      pedestal(g, e.rot);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 6), M.metal); post.position.y = 0.66; g.add(post);
      const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 6, 1, true), M.metal); cage.rotation.z = Math.PI / 2; head.add(cage);
      head.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow('#fff1c9', 4)));
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.4, 8), M.gold); nozzle.rotation.z = -Math.PI / 2; nozzle.position.x = 0.42; head.add(nozzle);
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
    } else if (e.t === 'relay') {
      pedestal(g, true);
      const m = new THREE.MeshStandardMaterial({ color: 0xf3e9ff, emissive: 0xffffff, emissiveIntensity: 0.12, flatShading: true, roughness: 0.3 });
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 0), m); c.position.y = BEAM_Y; g.add(c);
      const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 6), M.gold); arrow.rotation.z = -Math.PI / 2; arrow.position.x = 0.6; head.add(arrow);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.06), M.gold); arm.position.x = 0.3; head.add(arm);
      head.rotation.y = dirAngle(e.out);
      v.head = head; v.target = () => dirAngle(e.out); v.crystal = c; v.mat = m;
    } else if (e.t === 'beacon') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.7, 6), M.stone); base.position.y = 0.35; base.castShadow = true; g.add(base);
      const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.62, 4.6, 6), M.stone); ob.position.y = 2.9; ob.castShadow = true; g.add(ob);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d6, emissiveIntensity: 0.1, flatShading: true });
      const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), crownMat); crown.position.y = 5.8; g.add(crown);
      v.rings = ['r', 'g', 'b'].map((c, i) => {
        const m = new THREE.MeshStandardMaterial({ color: COLORS[c], emissive: COLORS[c], emissiveIntensity: 0.1, metalness: 0.3, roughness: 0.4 });
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.78 - i * 0.08, 0.08, 8, 32), m); r.rotation.x = Math.PI / 2; r.position.y = 1.05 + i * 0.75; g.add(r);
        return { c, mat: m, r };
      });
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.2, 120, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6b0').multiplyScalar(2.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      col.position.y = 66; g.add(col);
      v.crown = crown; v.crownMat = crownMat; v.column = col;
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
    } else if (e.t === 'start') {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 24), M.stone); r.rotation.x = Math.PI / 2; r.position.y = 0.04; g.add(r);
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glow('#9fe9ff', 2)); cr.position.y = 0.6; g.add(cr); v.float = cr; v.spinObj = cr;
    }
    g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') o.castShadow = true; });
    zg.add(g);
    views[e.id] = v;
  });

  /* ---------- Bâtiments et décor des zones d'aventure ---------- */
  const props = [];   // { p, zi, g, kind, light? }
  const roofs = { auberge: M.roofRed, pierre: M.roofSlate, forge: M.roofBrown, bois: M.roofBlue, phare: M.roofBlue };
  function house(p, z) {
    const g = new THREE.Group();
    const w = p.w * T, d = p.h * T, h = p.style === 'forge' ? 2.4 : 2.7;
    const cx = W(z.ox + p.x) + w / 2 - T / 2, cz = W(z.oy + p.y) + d / 2 - T / 2;
    g.position.set(cx, 0, cz);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, h, d - 0.3), p.style === 'pierre' || p.style === 'phare' ? mat('#cfc9da') : M.plaster); walls.position.y = h / 2; walls.castShadow = true; walls.receiveShadow = true; g.add(walls);
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
    if (p.style !== 'phare') { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), M.stoneDark); ch.position.set(w * 0.25, h + 1.0, -d * 0.15); ch.castShadow = true; g.add(ch); }
    else { const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 2, 8), mat('#e9e2f5')); tw.position.set(w / 2 - 0.9, h + 1, 0); g.add(tw); const lt = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), glow('#ffe6b0', 2)); lt.position.set(w / 2 - 0.9, h + 2.3, 0); g.add(lt); }
    // fenêtres (s'allument à mesure que l'île se réveille)
    const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffcf7a').multiplyScalar(1.2) });
    const front = p.side === 'N' ? -1 : 1;
    for (let i = 0; i < p.w - 1; i++) { const wn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), winM); wn.position.set(-w / 2 + T * (i + 1) - 0.1, h * 0.62, front * (d / 2 - 0.12)); if (Math.abs(W(z.ox + p.x + i + 1) - W(z.ox + p.door[0])) < 0.5 && p.side !== 'E') continue; g.add(wn); }
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
    const g = new THREE.Group();
    const cx = W(z.ox + p.x) + (p.w - 1) * T / 2, cz = W(z.oy + p.y) + (p.h - 1) * T / 2;
    g.position.set(cx, 0, cz);
    const add = (m, x = 0, y = 0, zz = 0) => { m.position.set(x, y, zz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    let light = null;
    switch (p.t) {
      case 'stall': {
        add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.3, 0.9, 1.1), M.wood), 0, 0.45, 0.2);
        add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.2, 0.08, 1.3), M.woodDark), 0, 0.92, 0.2);
        [-1, 1].forEach((s) => add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), M.woodDark), s * (p.w * T / 2 - 0.2), 1.2, -0.6));
        [-1, 1].forEach((s) => add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.12), M.woodDark), s * (p.w * T / 2 - 0.2), 1.0, 0.75));
        const aw = add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T + 0.2, 0.08, 1.9), mat(p.color)), 0, 2.25, 0.1); aw.rotation.x = 0.22;
        for (let i = 0; i < 6; i++) add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T / 6 - 0.04, 0.3, 0.05), mat(i % 2 ? p.color : '#f3ead8')), -p.w * T / 2 + (i + 0.5) * (p.w * T / 6) + 0.1, 2.0, 1.05);
        // marchandises
        const goods = p.id === 'etal_ysolde' ? ['#e85a6a', '#5fa8e8', '#e85a6a', '#9fe9ff'] : p.id === 'etal_pell' ? ['#e58fb8', '#4f7fd0', '#f0c66b', '#2f7d5b'] : ['#c9965a', '#8c88a3', '#a0714f', '#b39cff'];
        goods.forEach((c, i) => add(new THREE.Mesh(p.id === 'etal_ysolde' ? new THREE.CylinderGeometry(0.1, 0.13, 0.32, 6) : new THREE.BoxGeometry(0.3, 0.2, 0.3), mat(c, p.id === 'etal_ysolde' ? { emissive: c, emissiveIntensity: 0.4 } : {})), -0.9 + i * 0.6, 1.1, 0.2));
        break;
      }
      case 'fountain': {
        add(new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.6, 12), M.stone), 0, 0.3, 0);
        const wt = add(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.1, 12), M.water), 0, 0.55, 0); wt.castShadow = false;
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.4, 8), M.stone), 0, 1.1, 0);
        const cr = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshStandardMaterial({ color: '#bff3ff', emissive: '#7fdcff', emissiveIntensity: 1.4, flatShading: true, transparent: true, opacity: 0.9 })), 0, 2.4, 0);
        cr.scale.y = 1.5; g.userData.spin = cr; g.userData.float = cr;
        break;
      }
      case 'anvil': {
        add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), M.woodDark), 0, 0.25, 0);
        add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.45), M.metal), 0, 0.65, 0);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), M.metal), 0.6, 0.66, 0).rotation.z = -Math.PI / 2;
        break;
      }
      case 'lamp': {
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.6, 6), M.metal), 0, 1.3, 0);
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.08, 6), M.metal), 0, 2.62, 0);
        const lm = new THREE.MeshStandardMaterial({ color: '#e9dcc2', emissive: '#ffb35a', emissiveIntensity: 0, flatShading: true });
        const bulb = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.45, 6), lm), 0, 2.35, 0);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.3, 6), M.metal), 0, 2.75, 0);
        g.userData.lampMat = lm; g.userData.bulb = bulb;
        break;
      }
      case 'crate': add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.1), M.wood), 0, 0.5, 0).rotation.y = 0.3; add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), M.wood), 0.2, 1.3, 0.1).rotation.y = 0.9; break;
      case 'barrel': add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.1, 9), M.wood), 0, 0.55, 0); [0.25, 0.85].forEach((y) => add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 12), M.metal), 0, y, 0).rotation.x = Math.PI / 2); break;
      case 'bench': add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.6), M.wood), 0, 0.5, 0); [-0.7, 0.7].forEach((x) => add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.5), M.woodDark), x, 0.25, 0)); break;
      case 'well': {
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.9, 10), M.stone), 0, 0.45, 0);
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.05, 10), M.water), 0, 0.8, 0);
        [-0.7, 0.7].forEach((x) => add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), M.woodDark), x, 1.4, 0));
        const r = add(new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.6, 4), M.roofRed), 0, 2.4, 0); r.rotation.y = Math.PI / 4;
        break;
      }
      case 'sign': add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), M.woodDark), 0, 0.6, 0); add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.08), M.wood), 0, 1.2, 0.06); break;
      case 'ruin': {
        [-1.4, 1.4].forEach((x) => add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.4, 0.7), mat('#6f6a86')), x, 1.7, 0));
        add(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 0.8), mat('#5d5878')), 0, 3.6, 0);
        add(new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow('#b39cff', 2)), 0, 3.0, 0);
        break;
      }
      case 'brazier': {
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.9, 6), M.metal), 0, 0.45, 0);
        const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 6), glow('#b98cff', 2.4)), 0, 1.25, 0); g.userData.flame = f;
        break;
      }
      case 'crystal': { const c = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), glow('#9f7aff', 1.8)), 0, 1.1, 0); c.scale.y = 2; g.userData.spin = c; break; }
      case 'counter': add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.2, 1.0, 1.2), M.wood), 0, 0.5, 0); add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T, 0.1, 1.4), M.woodDark), 0, 1.05, 0); [-1.5, -0.5, 0.8].forEach((x, i) => add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 6), mat(['#c97a5a', '#5fa8e8', '#f0c66b'][i])), x, 1.25, 0)); break;
      case 'fireplace': {
        add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.2, 2.2, 1.2), mat('#8c88a3')), 0, 1.1, -0.3);
        const f = add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.3), glow('#ff8a3a', 2.2)), 0, 0.5, 0.3); g.userData.flame = f;
        break;
      }
      case 'bed': add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.4, 0.5, p.h * T - 0.4), M.wood), 0, 0.3, 0); add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.5, 0.2, p.h * T - 0.9), mat('#c0584a')), 0, 0.62, 0.2); add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.6), mat('#f3ead8')), 0, 0.65, -p.h * T / 2 + 0.6); break;
      case 'table': add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 10), M.wood), 0, 0.85, 0); add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.85, 6), M.woodDark), 0, 0.42, 0); add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.2, 6), mat('#f0c66b')), 0.2, 1.0, 0); break;
      case 'shelf': add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.2, 2.2, 0.7), M.woodDark), 0, 1.1, -0.4); for (let i = 0; i < p.w * 3; i++) add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.4), mat(['#c0584a', '#4f6fae', '#5fae76', '#e8b65a'][i % 4])), -p.w * T / 2 + 0.35 + i * 0.6, 1.5 - (i % 2) * 0.7, -0.3); break;
      case 'desk': add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.3, 0.9, 1.2), M.wood), 0, 0.45, 0); { const mp = add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 1.0), mat('#f3e6c8')), 0, 0.92, 0); mp.rotation.y = 0.1; } add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6), M.gold), 1.2, 1.05, 0.2); break;
      case 'globe': add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), mat('#4f7fd0')), 0, 1.2, 0); add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 4, 16), M.gold), 0, 1.2, 0).rotation.y = 0.5; add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.25, 0.75, 6), M.woodDark), 0, 0.37, 0); break;
      case 'telescope': { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.4, 8), M.gold), 0, 1.3, 0); t.rotation.z = 0.8; add(new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.0, 3, 1, true), M.woodDark), 0, 0.5, 0); break; }
      default: add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), M.wood), 0, 0.4, 0);
    }
    return { g, light };
  }
  zones.forEach((z, zi) => {
    (z.props || []).forEach((p) => {
      const r = p.t === 'house' ? { g: house(p, z) } : propMesh(p, z);
      zoneGroups[zi].add(r.g);
      props.push({ p, zi, z, g: r.g });
    });
  });

  /* ---------- Coffres et objets à ramasser ---------- */
  const chestViews = {};
  const chestGeo = new THREE.BoxGeometry(1.1, 0.7, 0.8), lidGeo = new THREE.BoxGeometry(1.14, 0.3, 0.84);
  function makeChest(c, z, zi) {
    const g = new THREE.Group(); g.position.set(W(z.ox + c.x), 0, W(z.oy + c.y));
    const rare = c.item && ['marteau', 'sceptre', 'fragment_coeur', 'anneau_vie', 'amulette_lume'].includes(c.item);
    const b = new THREE.Mesh(chestGeo, rare ? mat('#5a4a8a') : M.wood); b.position.y = 0.35; b.castShadow = true; g.add(b);
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.12, 0.84), M.gold); band.position.y = 0.45; g.add(band);
    const lidP = new THREE.Group(); lidP.position.set(0, 0.7, -0.4); g.add(lidP);
    const lid = new THREE.Mesh(lidGeo, rare ? mat('#6a5a9a') : M.woodDark); lid.position.set(0, 0.15, 0.4); lid.castShadow = true; lidP.add(lid);
    const lk = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.1), M.gold); lk.position.set(0, 0.55, 0.42); g.add(lk);
    const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), glow('#ffe2a0', 2.5)); sparkle.position.y = 1.3; g.add(sparkle);
    g.rotation.y = 0;
    zoneGroups[zi].add(g);
    return { c, z, zi, g, lid: lidP, sparkle, open: false, anim: 0, x: z.ox + c.x, y: z.oy + c.y };
  }
  zones.forEach((z, zi) => (z.chests || []).forEach((c) => (chestViews[c.id] = makeChest(c, z, zi))));

  const pickupViews = {};
  zones.forEach((z, zi) => (z.pickups || []).forEach((pk) => {
    const g = new THREE.Group(); g.position.set(W(z.ox + pk.x), 0, W(z.oy + pk.y));
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
    zoneGroups[zi].add(g);
    pickupViews[pk.id] = { pk, z, zi, g, f, x: z.ox + pk.x, y: z.oy + pk.y };
  }));

  /* ---------- Faisceaux ---------- */
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), flareGeo = new THREE.SphereGeometry(1, 12, 8);
  const beamMats = {};
  ['w', 'r', 'g', 'b'].forEach((c) => {
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
      a.set(W(s.x0), BEAM_Y, W(s.y0)); b.set(W(s.x1), BEAM_Y, W(s.y1));
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

  /* ---------- Animations du décor ---------- */
  function animate(dt, t, ctx) {
    Object.values(views).forEach((v) => {
      if (!v.g.parent || !v.g.parent.visible) return;
      if (v.head && v.target) { const want = v.target(); let d = want - v.head.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); v.head.rotation.y += d * (1 - Math.exp(-14 * dt)); }
      if (v.float) v.float.position.y = (v.e.t === 'prism' ? BEAM_Y + 0.1 : v.e.t === 'start' ? 0.7 : 1) + Math.sin(t * 2 + v.e.x) * 0.08;
      if (v.spinObj) v.spinObj.rotation.y += dt * (v.e.t === 'prism' ? 0.4 : 1.5);
      if (v.e.t === 'receiver') {
        const on = v.lit ? 1 : 0;
        v.mat.emissiveIntensity += ((on ? 3.2 + Math.sin(t * 4) * 0.4 : 0.15) - v.mat.emissiveIntensity) * (1 - Math.exp(-6 * dt));
        v.crystal.rotation.y += dt * (on ? 1.6 : 0.3);
      }
      if (v.e.t === 'relay') { v.mat.emissiveIntensity += ((v.lit ? 3 : 0.12) - v.mat.emissiveIntensity) * (1 - Math.exp(-6 * dt)); v.crystal.rotation.y += dt * (v.lit ? 2 : 0.3); }
      if (v.e.t === 'beacon') {
        v.rings.forEach((rg, i) => { rg.mat.emissiveIntensity += ((rg.on ? 3.5 : 0.1) - rg.mat.emissiveIntensity) * (1 - Math.exp(-5 * dt)); rg.r.rotation.z += dt * (rg.on ? 1.2 + i * 0.3 : 0.1); });
        const end = isl.gates.end && isl.gates.end.open;
        v.crownMat.emissiveIntensity += ((end ? 6 : 0.1) - v.crownMat.emissiveIntensity) * (1 - Math.exp(-1.5 * dt));
        v.crown.rotation.y += dt * (end ? 1 : 0.2);
        v.column.material.opacity += ((end ? 0.35 : 0) - v.column.material.opacity) * (1 - Math.exp(-0.8 * dt));
      }
    });
    Object.values(gateViews).forEach((list) => list.forEach((v) => {
      if (v.kind === 'bridge' && v.anim !== undefined && v.group.visible && v.anim < 1) {
        v.anim += dt * 1.6;
        const k = Math.max(0, Math.min(1, v.anim)), e = 1 - Math.pow(1 - k, 3);
        v.group.position.y = -3 + 3 * e; v.group.scale.setScalar(Math.max(0.01, e));
      } else if (v.kind !== 'bridge' && v.anim > 0 && v.group.visible) {
        v.anim += dt * 1.2;
        if (v.kind === 'door') v.group.position.y = -v.anim * 2.8;
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
      if (u.float) u.float.position.y = 2.4 + Math.sin(t * 1.6) * 0.15;
      if (u.flame) u.flame.scale.set(1 + Math.sin(t * 13) * 0.08, 1 + Math.sin(t * 9 + 1) * 0.15, 1);
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
  }

  return { root, M, views, gateViews, setGateView, drawBeams, animate, props, chestViews, pickupViews, removeCell, showZones, zoneGroups, decor };
}
