/* =========================================================
   LUMEN — décor de l'introduction : l'archipel d'Iridia vu de loin.
   Entièrement procédural (aucune image, aucun fichier) : îles flottantes
   low-poly, six phares, le Grand Prisme (six éclats), brume, mer de nuages,
   lucioles, rayons de lumière, étoiles, la barque de Lyra et Fia.
   Sert à l'écran-titre (état « éclats flottants, crépuscule ») et à la
   cinématique d'ouverture (état piloté par le temps). Tout est possédé par
   `root` et libéré par dispose() : rien ne reste en mémoire GPU après usage.
   Le décor est posé à OFF (loin du monde de jeu) : le monde reste intact.
   ========================================================= */
import * as THREE from 'three';

export const OFF = new THREE.Vector3(4000, 0, 0);
export const RING = 62;                       /* rayon de l'anneau d'îles */
export const COLS = ['#ff5a6e', '#4cf0a0', '#ffd25a', '#5aa8ff', '#b07aff', '#fff3d6'];   /* rouge, vert, or, bleu, violet, blanc doré */
const ANG0 = 0.5;
export const islandPos = (k) => { const a = ANG0 + (k * Math.PI) / 3; return new THREE.Vector3(Math.cos(a) * RING, [2, -3, 6, -1, 8, 3][k], Math.sin(a) * RING); };
export const BOAT = new THREE.Vector3(Math.cos(ANG0) * RING * 0.52 + 6, -25, Math.sin(ANG0) * RING * 0.52 + 12);
export const PRISM_Y = 17;

/* ---------- Petits outils ---------- */
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mixC = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);

function spriteTexture(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  if (kind === 'soft') { r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); }
  else { r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(0.5, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); }
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function beamTexture() {   /* dégradé vertical : opaque en bas, transparent en haut */
  const c = document.createElement('canvas'); c.width = 4; c.height = 64;
  const g = c.getContext('2d'), l = g.createLinearGradient(0, 64, 0, 0);
  l.addColorStop(0, 'rgba(255,255,255,.9)'); l.addColorStop(0.6, 'rgba(255,255,255,.25)'); l.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = l; g.fillRect(0, 0, 4, 64);
  return new THREE.CanvasTexture(c);
}
function jitter(geo, amt, rnd) {
  const p = geo.attributes.position, seen = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3);
    let d = seen.get(key); if (!d) { d = [(rnd() - 0.5) * amt, (rnd() - 0.5) * amt * 0.6, (rnd() - 0.5) * amt]; seen.set(key, d); }
    p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]);
  }
  geo.computeVertexNormals(); return geo;
}

/* ---------- Palettes du ciel : 0 = heure dorée, 0.5 = crépuscule, 1 = nuit ---------- */
const SKY = [
  { m: 0, top: '#4a62c8', hor: '#ffd1a0', bot: '#c89ad0', fog: '#f0c8c0', hemi: 1.25, sun: 2.4, sunC: '#ffdca8' },
  { m: 0.5, top: '#35286e', hor: '#ff9a8c', bot: '#6a4a9c', fog: '#b88ab0', hemi: 0.95, sun: 1.5, sunC: '#ffb09a' },
  { m: 1, top: '#070518', hor: '#2a1a52', bot: '#0e0a24', fog: '#150f30', hemi: 0.5, sun: 0.35, sunC: '#7a70c0' },
];
export function skyAt(m) {
  m = Math.min(1, Math.max(0, m));
  const a = m < 0.5 ? SKY[0] : SKY[1], b = m < 0.5 ? SKY[1] : SKY[2], k = (m < 0.5 ? m : m - 0.5) / 0.5;
  return { top: mixC(a.top, b.top, k), hor: mixC(a.hor, b.hor, k), bot: mixC(a.bot, b.bot, k), fog: mixC(a.fog, b.fog, k), hemi: a.hemi + (b.hemi - a.hemi) * k, sun: a.sun + (b.sun - a.sun) * k, sunC: mixC(a.sunC, b.sunC, k) };
}

/* =========================================================
   Construction
   ========================================================= */
export function createArchipelago({ low = false, still = false } = {}) {
  const rnd = mulberry(20261108);
  const root = new THREE.Group(); root.position.copy(OFF); root.name = 'intro-archipel';
  const own = { geo: [], mat: [], tex: [] };
  const G = (g) => { own.geo.push(g); return g; };
  const M = (m) => { own.mat.push(m); return m; };
  const T = (t) => { own.tex.push(t); return t; };
  const tSoft = T(spriteTexture('soft')), tHalo = T(spriteTexture('halo')), tBeam = T(beamTexture());
  const flat = (color, extra = {}) => M(new THREE.MeshStandardMaterial(Object.assign({ color, flatShading: true, roughness: 0.9, metalness: 0 }, extra)));
  const glowMat = (color, k = 1) => M(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), fog: false }));
  const addMat = (color, op, map) => M(new THREE.MeshBasicMaterial({ color, map: map || null, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  const spriteMat = (color, op, tex = tSoft, additive = true) => M(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: op, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, fog: false }));

  /* ----- mer de nuages ----- */
  const nCloud = low ? 45 : 130;
  const cloudMat = flat('#ffffff', { emissive: '#8a6aa8', emissiveIntensity: 0.35 });
  const clouds = new THREE.InstancedMesh(G(new THREE.IcosahedronGeometry(1, 1)), cloudMat, nCloud);
  { const d = new THREE.Object3D(); for (let i = 0; i < nCloud; i++) {
    const a = rnd() * Math.PI * 2, r = 20 + Math.sqrt(rnd()) * 330;
    d.position.set(Math.cos(a) * r, -34 + rnd() * 6 - (r > 150 ? 2 : 0), Math.sin(a) * r);
    const s = 9 + rnd() * 22; d.scale.set(s * (1 + rnd() * 0.8), s * 0.34, s * (1 + rnd() * 0.8)); d.rotation.y = rnd() * 3; d.updateMatrix(); clouds.setMatrixAt(i, d.matrix);
  } clouds.instanceMatrix.needsUpdate = true; }
  clouds.frustumCulled = false; root.add(clouds);

  /* ----- étoiles (suivent la caméra) ----- */
  const stars = (() => {
    const n = low ? 70 : 180, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = rnd() * Math.PI * 2, v = 0.12 + rnd() * 0.88, rr = 280; p[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * rr; p[i * 3 + 1] = v * rr; p[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * rr; }
    const g = G(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = M(new THREE.PointsMaterial({ size: 2.2, map: tHalo, color: '#fff6e0', transparent: true, opacity: 0, depthWrite: false, fog: false, sizeAttenuation: false, blending: THREE.AdditiveBlending }));
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = -1; root.add(pts); return pts;
  })();

  /* ----- îles ----- */
  const THEMES = [
    { top: '#8fd68a', tint: '#ffb8cc', rock: '#7a6a8a', kind: 'cerisier' },
    { top: '#4fc0a0', tint: '#9ff0d8', rock: '#4a6a7a', kind: 'verre' },
    { top: '#e8c878', tint: '#ffe0a0', rock: '#a07858', kind: 'dune' },
    { top: '#5fb0d8', tint: '#aee0ff', rock: '#456a8a', kind: 'eau' },
    { top: '#e8eef8', tint: '#ffffff', rock: '#7a82a0', kind: 'pic' },
    { top: '#f4ead0', tint: '#fff2c0', rock: '#9a8aa8', kind: 'tour' },
  ];
  function island(rad, th, seed) {
    const r = mulberry(seed), g = new THREE.Group();
    const top = new THREE.Mesh(G(jitter(new THREE.CylinderGeometry(rad, rad * 0.9, 1.6, low ? 7 : 10, 1), rad * 0.16, r)), flat(th.top)); top.position.y = -0.8; g.add(top);
    const base = new THREE.Mesh(G(jitter(new THREE.ConeGeometry(rad * 0.9, rad * (1.3 + r() * 0.4), low ? 6 : 9, 2), rad * 0.3, r)), flat(th.rock)); base.rotation.x = Math.PI; base.position.y = -1.6 - rad * 0.65; g.add(base);
    for (let i = 0; i < (low ? 1 : 3); i++) {    /* petits rochers qui flottent en dessous */
      const rk = new THREE.Mesh(G(jitter(new THREE.IcosahedronGeometry(0.8 + r() * 1.2, 0), 0.5, r)), flat(th.rock)); rk.position.set((r() - 0.5) * rad * 1.8, -rad * (1.2 + r() * 0.9), (r() - 0.5) * rad * 1.8); rk.userData.f = r() * 6; g.add(rk);
    }
    return g;
  }
  const lamps = [], beamsUp = [], halos = [], shardTargets = [], islands = [];
  const lampGeo = G(new THREE.SphereGeometry(0.8, 10, 8)), towerGeo = G(new THREE.CylinderGeometry(0.75, 1.15, 6.2, 8)), capGeo = G(new THREE.ConeGeometry(1.25, 1.1, 8));
  const colGeo = G(new THREE.CylinderGeometry(2.6, 0.7, 60, low ? 8 : 12, 1, true));
  for (let k = 0; k < 6; k++) {
    const th = THEMES[k], p = islandPos(k), rad = 11 + (k % 3) * 1.4;
    const isl = island(rad, th, 700 + k * 13); isl.position.copy(p); root.add(isl); islands.push(isl); isl.userData.base = p.clone(); isl.userData.ph = k * 1.3;
    /* décor selon le thème */
    const deco = (n, build) => { for (let i = 0; i < n; i++) { const a = rnd() * 6.28, d = 2.5 + rnd() * (rad - 5), o = build(); o.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); isl.add(o); } };
    const tree = (cTop, h = 2.2) => () => { const g = new THREE.Group(); const t = new THREE.Mesh(G(new THREE.CylinderGeometry(0.14, 0.2, h * 0.5, 5)), flat('#6a4a3a')); t.position.y = h * 0.25; const f = new THREE.Mesh(G(jitter(new THREE.IcosahedronGeometry(h * 0.52, 0), 0.4, rnd)), flat(cTop)); f.position.y = h * 0.8; g.add(t, f); return g; };
    const spike = (c, h) => () => { const m = new THREE.Mesh(G(jitter(new THREE.ConeGeometry(0.5 + rnd() * 0.5, h * (0.6 + rnd() * 0.8), 5), 0.2, rnd)), flat(c)); m.position.y = h * 0.4; return m; };
    if (th.kind === 'cerisier') deco(low ? 3 : 6, tree('#ff9fc0'));
    else if (th.kind === 'verre') deco(low ? 3 : 7, () => { const m = new THREE.Mesh(G(new THREE.OctahedronGeometry(0.9, 0)), flat('#7ff0d0', { transparent: true, opacity: 0.8, emissive: '#2aa88a', emissiveIntensity: 0.6 })); m.scale.y = 1.9; m.position.y = 1.4; const g = new THREE.Group(); g.add(m); return g; });
    else if (th.kind === 'dune') deco(low ? 2 : 4, spike('#d8a860', 3));
    else if (th.kind === 'eau') { deco(low ? 2 : 4, tree('#8fe0ff', 1.8)); const pool = new THREE.Mesh(G(new THREE.CircleGeometry(rad * 0.35, 12)), glowMat('#9fe9ff', 0.8)); pool.rotation.x = -Math.PI / 2; pool.position.set(rad * 0.25, 0.04, -rad * 0.2); isl.add(pool); }
    else if (th.kind === 'pic') deco(low ? 3 : 5, spike('#dfe6f4', 6));
    else deco(low ? 2 : 4, () => { const b = new THREE.Mesh(G(new THREE.BoxGeometry(1.2, 4 + rnd() * 3, 1.2)), flat('#f4ead0')); b.position.y = 2.4; return b; });
    /* phare */
    const lh = new THREE.Group(); lh.position.set(0, 0, 0);
    const tw = new THREE.Mesh(towerGeo, flat('#f1ecff')); tw.position.y = 3.1;
    const band = new THREE.Mesh(G(new THREE.CylinderGeometry(0.93, 1.0, 0.7, 8)), flat(COLS[k], { emissive: COLS[k], emissiveIntensity: 0.25 })); band.position.y = 2.6;
    const cap = new THREE.Mesh(capGeo, flat('#3a2e66')); cap.position.y = 7.3;
    const lampM = M(new THREE.MeshBasicMaterial({ color: new THREE.Color(COLS[k]).multiplyScalar(0.3), fog: false }));
    const lamp = new THREE.Mesh(lampGeo, lampM); lamp.position.y = 6.5;
    const halo = new THREE.Sprite(spriteMat(COLS[k], 0, tHalo)); halo.scale.setScalar(14); halo.position.y = 6.5;
    lh.add(tw, band, cap, lamp, halo); isl.add(lh);
    const col = new THREE.Mesh(colGeo, addMat(COLS[k], 0, tBeam)); col.position.y = 6.5 + 30; col.visible = !low || k < 3;
    isl.add(col);
    lamps.push({ lamp, mat: lampM, halo, col, k, base: new THREE.Color(COLS[k]) });
    beamsUp.push(col);
    halos.push(halo);
  }

  /* ----- île centrale : le Sanctuaire en ruine ----- */
  const core = island(9, { top: '#cfc4e8', rock: '#6a5a8a' }, 91); core.position.set(0, -2, 0); root.add(core);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283, h = 2.5 + (i % 3) * 1.1; const pl = new THREE.Mesh(G(new THREE.BoxGeometry(0.9, h, 0.9)), flat('#efe9ff')); pl.position.set(Math.cos(a) * 5.4, h / 2 - 0.4, Math.sin(a) * 5.4); pl.rotation.z = (rnd() - 0.5) * 0.15; core.add(pl); }
  const altar = new THREE.Mesh(G(new THREE.CylinderGeometry(1.8, 2.2, 0.8, 8)), flat('#efe9ff')); altar.position.y = 0.2; core.add(altar);

  /* ----- ponts de lumière entre îles voisines ----- */
  const bridges = [];
  for (let k = 0; k < 6; k++) {
    const a = islandPos(k), b = islandPos((k + 1) % 6), mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b) - 24;
    const br = new THREE.Mesh(G(new THREE.BoxGeometry(2.2, 0.18, Math.max(4, len))), addMat('#ffe8b0', 0));
    br.position.copy(mid); br.position.y -= 0.3; br.lookAt(b.x, b.y - 0.3, b.z); br.visible = !low; root.add(br); bridges.push(br);
  }

  /* ----- Grand Prisme : six tétraèdres autour de l'axe ----- */
  const prism = new THREE.Group(); prism.position.y = PRISM_Y; root.add(prism);
  const shards = [];
  const HEIGHT = 7.2, RAD = 3.6;
  for (let k = 0; k < 6; k++) {
    const a0 = (k / 6) * Math.PI * 2, a1 = ((k + 1) / 6) * Math.PI * 2, am = (a0 + a1) / 2;
    const P0 = [Math.cos(a0) * RAD, 0, Math.sin(a0) * RAD], P1 = [Math.cos(a1) * RAD, 0, Math.sin(a1) * RAD], Tp = [0, HEIGHT, 0], Bt = [0, -HEIGHT, 0];
    const g = new THREE.BufferGeometry();
    const tri = [Tp, P0, P1, Bt, P1, P0, Tp, Bt, P0, Bt, Tp, P1];
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tri.flat()), 3)); g.computeVertexNormals(); G(g);
    const c = new THREE.Color(COLS[k]);
    const mat = M(new THREE.MeshStandardMaterial({ color: mixC('#ffffff', COLS[k], 0.35), emissive: c, emissiveIntensity: 0.9, flatShading: true, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.93, side: THREE.DoubleSide }));
    const m = new THREE.Mesh(g, mat);
    const holder = new THREE.Group(); holder.add(m); prism.add(holder);
    const dirx = Math.cos(am), dirz = Math.sin(am);
    shards.push({ holder, mesh: m, mat, k, dirx, dirz, spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2), ph: rnd() * 6, tgt: islandPos(k) });
  }
  const prismGlow = new THREE.Sprite(spriteMat('#fff4e0', 0.9, tSoft)); prismGlow.scale.setScalar(34); prismGlow.position.y = PRISM_Y; root.add(prismGlow);
  const prismFlash = new THREE.Sprite(spriteMat('#ffffff', 0, tSoft)); prismFlash.scale.setScalar(90); prismFlash.position.y = PRISM_Y; root.add(prismFlash);
  /* liens prisme → phares */
  const links = [];
  for (let k = 0; k < 6; k++) {
    const to = islandPos(k).add(new THREE.Vector3(0, 6.5, 0)), from = new THREE.Vector3(0, PRISM_Y, 0), len = from.distanceTo(to);
    const m = new THREE.Mesh(G(new THREE.CylinderGeometry(0.16, 0.16, len, 5, 1, true)), addMat(COLS[k], 0));
    m.position.copy(from).add(to).multiplyScalar(0.5); m.lookAt(to); m.rotateX(Math.PI / 2); root.add(m); links.push(m);
  }

  /* ----- Brume ----- */
  const brumeN = low ? 8 : 18, brume = [];
  for (let i = 0; i < brumeN; i++) {
    const s = new THREE.Sprite(spriteMat('#1c0f38', 0, tSoft, false)); s.scale.setScalar(16 + rnd() * 16); root.add(s);
    brume.push({ s, a: rnd() * 6.28, r: 6 + rnd() * 10, y: PRISM_Y + (rnd() - 0.5) * 12, sp: 0.3 + rnd() * 0.5 });
  }
  /* ----- brume basse (écran-titre) ----- */
  const mistN = low ? 8 : 22, mist = [];
  for (let i = 0; i < mistN; i++) {
    const s = new THREE.Sprite(spriteMat('#e8d4f0', 0.16, tSoft, false)); s.scale.set(34 + rnd() * 30, 14 + rnd() * 8, 1);
    const a = rnd() * 6.28, r = 15 + rnd() * 85; s.position.set(Math.cos(a) * r, -14 + rnd() * 16, Math.sin(a) * r); root.add(s); mist.push({ s, a, r, sp: (rnd() - 0.5) * 0.02, y: s.position.y, ph: rnd() * 6 });
  }

  /* ----- rayons de lumière du ciel ----- */
  const shafts = [];
  if (!low) for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(G(new THREE.CylinderGeometry(3 + rnd() * 3, 9 + rnd() * 5, 90, 10, 1, true)), addMat('#ffe0c0', 0.1, tBeam));
    const k = i + 0.5, a = ANG0 + (k * Math.PI) / 3 * 1.0; m.position.set(Math.cos(a) * 40, 25, Math.sin(a) * 40); m.rotation.z = 0.25; m.rotation.y = a; root.add(m); shafts.push(m);
  }

  /* ----- lucioles ----- */
  const ffN = low ? 40 : 130, ffPos = new Float32Array(ffN * 3), ffSeed = new Float32Array(ffN * 4);
  for (let i = 0; i < ffN; i++) { const k = i % 6, c = islandPos(k); ffSeed[i * 4] = c.x + (rnd() - 0.5) * 30; ffSeed[i * 4 + 1] = c.y + 1 + rnd() * 9; ffSeed[i * 4 + 2] = c.z + (rnd() - 0.5) * 30; ffSeed[i * 4 + 3] = rnd() * 100; }
  const ffGeo = G(new THREE.BufferGeometry()); ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const ffMat = M(new THREE.PointsMaterial({ size: 0.9, map: tHalo, color: '#ffe9a0', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const flies = new THREE.Points(ffGeo, ffMat); flies.frustumCulled = false; root.add(flies);

  /* ----- barque, Lyra endormie, Fia ----- */
  const boat = new THREE.Group(); boat.position.copy(BOAT); boat.visible = false; root.add(boat);
  { const hull = new THREE.Mesh(G(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), flat('#8a5a3a', { side: THREE.DoubleSide })); hull.scale.set(1.35, 0.7, 3.2); hull.position.y = 0.55; boat.add(hull);
    const rim = new THREE.Mesh(G(new THREE.TorusGeometry(1, 0.06, 5, 16)), flat('#c89a62')); rim.rotation.x = Math.PI / 2; rim.scale.set(1.35, 3.2, 1); rim.position.y = 0.56; boat.add(rim);
    const mast = new THREE.Mesh(G(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 5)), flat('#5a3a28')); mast.position.set(0, 1.8, 1.8); boat.add(mast);
    const lant = new THREE.Mesh(G(new THREE.SphereGeometry(0.17, 8, 6)), glowMat('#ffd890', 2.2)); lant.position.set(0, 3.0, 1.8); boat.add(lant);
    const lh = new THREE.Sprite(spriteMat('#ffc070', 0.7, tHalo)); lh.scale.setScalar(3.4); lh.position.copy(lant.position); boat.add(lh);
    /* Lyra, couchée */
    const ly = new THREE.Group(); ly.position.set(0, 0.95, -0.2);
    const body = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.28, 0.9, 4, 8)), flat('#6a4fb0')); body.rotation.x = Math.PI / 2; body.position.set(0, 0.1, 0.1); ly.add(body);
    const cloak = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.34, 0.8, 4, 8)), flat('#f6a5c8')); cloak.rotation.x = Math.PI / 2; cloak.scale.set(1, 1, 0.55); cloak.position.set(0, 0.32, 0.25); ly.add(cloak);
    const head = new THREE.Mesh(G(new THREE.SphereGeometry(0.26, 10, 8)), flat('#f6d3b6')); head.position.set(0, 0.16, -0.78); ly.add(head);
    const hair = new THREE.Mesh(G(new THREE.SphereGeometry(0.285, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62)), flat('#4a2f6e')); hair.position.set(0, 0.2, -0.76); hair.rotation.x = -0.5; ly.add(hair);
    boat.add(ly); }
  const fia = new THREE.Group(); fia.position.copy(BOAT).add(new THREE.Vector3(0, 2.6, -0.4)); fia.visible = false; root.add(fia);
  { const core2 = new THREE.Mesh(G(new THREE.SphereGeometry(0.22, 10, 8)), glowMat('#fff0c2', 4)); const h1 = new THREE.Sprite(spriteMat('#ffe9a8', 0.95, tHalo)); h1.scale.setScalar(2.6); const h2 = new THREE.Sprite(spriteMat('#ffd9a0', 0.4, tSoft)); h2.scale.setScalar(9); fia.add(core2, h1, h2); fia.userData = { h1, h2 }; }

  /* =======================================================
     État + animation
     ======================================================= */
  const st = { mood: 0.5, shatter: 1, fall: 0, lit: [1, 0.1, 0.1, 0.8, 0.1, 0.1], brume: 0, flash: 0, boat: 0, fia: 0, bridges: 0, links: 0, floatRing: 1, tick: 0 };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  function update(dt, t) {
    const sc = st.shatter, fl = st.fall;
    /* Prisme et éclats */
    const ang = still ? 0 : t * 0.25 * (1 - sc * 0.5);
    prism.rotation.y = ang;
    prism.position.y = PRISM_Y + (still ? 0 : Math.sin(t * 0.7) * 0.5) * (1 - fl);
    prismGlow.position.y = prism.position.y; prismFlash.position.y = prism.position.y;
    prismGlow.material.opacity = (0.85 * (1 - sc) + 0.35 * sc) * (1 - fl * 0.8) * (1 - sstep(0.6, 1, st.mood) * 0.5);
    prismGlow.scale.setScalar(30 + (still ? 0 : Math.sin(t * 1.3) * 2) + sc * 14);
    prismFlash.material.opacity = st.flash; prismFlash.scale.setScalar(70 + st.flash * 80);
    const ca = Math.cos(ang), sa = Math.sin(ang), ringR = 7.5, e = fl * fl * (3 - 2 * fl);
    for (const s of shards) {
      /* anneau d'éclats flottants (0 = prisme entier, 1 = dispersés) */
      const bob = still ? 0 : Math.sin(t * 0.8 + s.ph) * 0.8;
      const ex = s.dirx * sc * ringR, ez = s.dirz * sc * ringR, ey = sc * ((s.k % 2 ? 2.5 : -1.5) + bob);
      /* chute vers l'île d'origine (coordonnées locales du prisme, qui tourne) */
      const tg = s.tgt, wx = tg.x, wz = tg.z, fx = wx * ca - wz * sa, fz = wx * sa + wz * ca, fy = tg.y + 1.2 - prism.position.y;
      const arc = Math.sin(e * Math.PI) * 10;
      s.holder.position.set(ex + (fx - ex) * e, ey + (fy - ey) * e + arc, ez + (fz - ez) * e);
      const spinK = sc * (1 - fl * 0.9), tt = still ? 0 : t;
      s.holder.rotation.set(s.spin.x * tt * 0.3 * spinK + sc * 0.4 * s.dirx, s.spin.y * tt * 0.3 * spinK, s.spin.z * tt * 0.3 * spinK + sc * 0.3 * s.dirz);
      s.holder.scale.setScalar(1 - fl * 0.72);
      s.mat.emissiveIntensity = 0.7 + sc * 0.5 + (still ? 0 : Math.sin(t * 2 + s.ph) * 0.2) - sstep(0.8, 1, st.mood) * 0.25 * (1 - fl);
    }
    /* Phares, colonnes, halos */
    for (const L of lamps) {
      const v = st.lit[L.k];
      L.mat.color.copy(L.base).multiplyScalar(0.18 + v * 3.2);
      L.halo.material.opacity = v * 0.9; L.halo.scale.setScalar(8 + v * 10);
      L.col.material.opacity = v * 0.34 * (0.5 + 0.5 * sc);
      /* clignotement d'une braise qui s'éteint */
    }
    /* Rayons prisme → phares : actifs tant que le prisme est entier */
    for (let k = 0; k < 6; k++) links[k].material.opacity = st.lit[k] * (1 - sc) * 0.55 * st.links;
    for (let k = 0; k < 6; k++) { const v = (st.lit[k] + st.lit[(k + 1) % 6]) * 0.5 * st.bridges; bridges[k].material.opacity = v * 0.5; }
    /* Brume autour du prisme */
    for (const b of brume) {
      const aa = still ? b.a : b.a + t * b.sp * 0.6, rr = b.r * (1.3 - st.brume * 0.5);
      b.s.position.set(Math.cos(aa) * rr, b.y + (still ? 0 : Math.sin(t + b.a) * 1.2), Math.sin(aa) * rr);
      b.s.material.opacity = st.brume * (0.55 - 0.3 * fl);
    }
    for (const m of mist) { const aa = m.a + (still ? 0 : t * m.sp); m.s.position.set(Math.cos(aa) * m.r, m.y + (still ? 0 : Math.sin(t * 0.3 + m.ph) * 1.4), Math.sin(aa) * m.r); m.s.material.opacity = 0.17 + st.mood * 0.04; }
    /* îles : lévitation douce */
    for (const isl of islands) { const b = isl.userData.base; isl.position.y = b.y + (still ? 0 : Math.sin(t * 0.5 + isl.userData.ph) * 0.7); isl.rotation.y = still ? 0 : Math.sin(t * 0.1 + isl.userData.ph) * 0.05; }
    core.position.y = -2 + (still ? 0 : Math.sin(t * 0.45) * 0.6);
    /* lucioles */
    if (!still) {
      const p = ffPos;
      for (let i = 0; i < ffN; i++) { const s0 = ffSeed[i * 4 + 3], x = ffSeed[i * 4], y = ffSeed[i * 4 + 1], z = ffSeed[i * 4 + 2]; p[i * 3] = x + Math.sin(t * 0.35 + s0) * 4 + Math.sin(t * 0.9 + s0 * 2) * 1.2; p[i * 3 + 1] = y + Math.sin(t * 0.5 + s0 * 1.7) * 2.2; p[i * 3 + 2] = z + Math.cos(t * 0.3 + s0 * 1.3) * 4; }
      ffGeo.attributes.position.needsUpdate = true;
    } else if (!update.ffInit) { update.ffInit = 1; for (let i = 0; i < ffN; i++) { ffPos[i * 3] = ffSeed[i * 4]; ffPos[i * 3 + 1] = ffSeed[i * 4 + 1]; ffPos[i * 3 + 2] = ffSeed[i * 4 + 2]; } ffGeo.attributes.position.needsUpdate = true; }
    ffMat.opacity = 0.95 * (1 - st.brume * 0.7) * (0.55 + st.mood * 0.45) * (1 - fl * 0.6 * sstep(0.7, 1, st.mood));
    ffMat.size = 0.8 + st.mood * 0.5;
    /* rayons du ciel */
    for (const m of shafts) m.material.opacity = (1 - sstep(0.4, 0.9, st.mood)) * (0.14 + (still ? 0 : Math.sin(t * 0.4 + m.position.x) * 0.03)) * (1 - st.brume);
    /* nuages et étoiles */
    cloudMat.emissive.copy(mixC('#9a7ab8', '#2a2058', st.mood)); cloudMat.color.copy(mixC('#ffffff', '#8a82b8', st.mood));
    stars.material.opacity = sstep(0.62, 1, st.mood) * 0.9;
    /* barque */
    boat.visible = st.boat > 0.01;
    if (boat.visible) { boat.position.y = BOAT.y + (still ? 0 : Math.sin(t * 0.9) * 0.22); boat.rotation.z = still ? 0 : Math.sin(t * 0.7) * 0.05; boat.rotation.x = still ? 0 : Math.sin(t * 0.55) * 0.03; boat.rotation.y = 0.4; }
    fia.visible = st.fia > 0.01;
    if (fia.visible) {
      fia.position.set(BOAT.x + (still ? 0.6 : Math.cos(t * 0.8) * 1.0), BOAT.y + 2.6 + (still ? 0.3 : Math.sin(t * 1.6) * 0.35), BOAT.z - 0.4 + (still ? 0 : Math.sin(t * 0.8) * 0.6));
      fia.scale.setScalar(0.4 + st.fia * 0.6); fia.userData.h1.material.opacity = st.fia * 0.95; fia.userData.h2.material.opacity = st.fia * (0.35 + (still ? 0 : Math.sin(t * 3) * 0.08));
    }
  }

  /* Étoiles : à replacer sur la caméra à chaque image */
  function followCamera(camPos) { stars.position.copy(camPos).sub(OFF); }

  function dispose() {
    root.removeFromParent();
    root.traverse((o) => { if (o.material && !own.mat.includes(o.material) && o.material.dispose) o.material.dispose(); });
    own.geo.forEach((g) => g.dispose()); own.mat.forEach((m) => m.dispose()); own.tex.forEach((t) => t.dispose());
    own.geo.length = own.mat.length = own.tex.length = 0;
  }

  return { root, st, update, followCamera, dispose, still, counts: () => ({ geo: own.geo.length, mat: own.mat.length, tex: own.tex.length }) };
}
