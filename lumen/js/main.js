/* =========================================================
   LUMEN : les Îles Brisées — moteur 3D (Three.js r160)
   Rendu, monde, personnage, caméra, commandes, faisceaux,
   effets, sons, interface, sauvegarde.
   ========================================================= */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ISLANDS, UPCOMING } from './levels.js';
import { buildIsland, evaluate, rotate, walkable, snapshot, restore, COLORS, DIRS, ORDER } from './logic.js';
import { platform } from './platform.js';

const DEF = ISLANDS[0];
const IID = DEF.id;
const T = 2, BEAM_Y = 1.05;
const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const TOUCH = matchMedia('(pointer: coarse)').matches || params.has('touch');
let LOW = params.has('low') || (TOUCH && Math.min(screen.width, screen.height) < 500);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
const hash = (x, y, k = 0) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(k, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (k, dt) => 1 - Math.exp(-k * dt);

/* =========================================================
   Île (logique)
   ========================================================= */
const isl = buildIsland(DEF);
const zones = DEF.zones;
const zoneIndex = Object.fromEntries(zones.map((z, i) => [z.id, i]));
const MAIN_GATES = zones.filter((z) => !z.secret).map((z) => z.ents.find((e) => e.gate && !e.optional)).filter(Boolean).map((e) => e.gate);
const SECRET_GATES = zones.filter((z) => z.secret).map((z) => z.barrier);
const OPT_GATES = isl.ents.filter((e) => e.optional).map((e) => e.gate);
const W = (x) => x * T;

/* =========================================================
   Rendu
   ========================================================= */
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW, powerPreference: 'high-performance' });
let pixelRatio = Math.min(devicePixelRatio || 1, LOW ? 1.25 : 1.75);
renderer.setPixelRatio(pixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 700);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.62, 0.5, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());
let useBloom = !params.has('nobloom');

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(w, h);
  bloom.resolution.set(w * (LOW ? 0.4 : 0.6), h * (LOW ? 0.4 : 0.6));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* ---------- Ciel ---------- */
const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: 'uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vW; void main(){ float h = normalize(vW).y; vec3 c = h > 0.0 ? mix(horizon, top, pow(min(h * 1.7, 1.0), 0.75)) : mix(horizon, bottom, pow(min(-h * 2.4, 1.0), 0.6)); gl_FragColor = vec4(c, 1.0); }',
}));
sky.renderOrder = -1;
scene.add(sky);
scene.fog = new THREE.Fog(0xffffff, 75, 220);
const PAL = {
  dusk: DEF.sky.dusk.map((c) => new THREE.Color(c)),
  dawn: DEF.sky.dawn.map((c) => new THREE.Color(c)),
};

/* ---------- Lumières ---------- */
const hemi = new THREE.HemisphereLight(0xffffff, 0x3a2f4a, 1.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2bd, 2.0);
sun.castShadow = true;
sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

/* =========================================================
   Matériaux
   ========================================================= */
const M = {
  grass: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.95 }),
  dirt: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 }),
  under: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 }),
  rock: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }),
  foliage: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.85 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x6b4a3a, flatShading: true, roughness: 1 }),
  tuft: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xd9d4e3, flatShading: true, roughness: 0.75 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x8c88a3, flatShading: true, roughness: 0.8 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xa0714f, flatShading: true, roughness: 0.9 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xe8b65a, metalness: 0.7, roughness: 0.35, flatShading: true }),
  metal: new THREE.MeshStandardMaterial({ color: 0x3d3a52, metalness: 0.6, roughness: 0.4, flatShading: true }),
  ring: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc861).multiplyScalar(2.6), transparent: true, opacity: 0.9 }),
  ghost: new THREE.MeshBasicMaterial({ color: 0x9be8ff, transparent: true, opacity: 0.1, depthWrite: false }),
  glass: new THREE.MeshStandardMaterial({ color: 0xdcefff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1, emissive: 0x9fc4ff, emissiveIntensity: 0.5, flatShading: true }),
};
/* Environnement doux pour les miroirs (dégradé), sans fichier */
const envTex = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 32;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 32);
  gr.addColorStop(0, '#9ec4ff'); gr.addColorStop(0.5, '#ffe7c7'); gr.addColorStop(1, '#4b3f63');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 32);
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
M.mirror = new THREE.MeshStandardMaterial({ color: 0xeef4ff, metalness: 1, roughness: 0.06, envMap: envTex, envMapIntensity: 1.4 });
const glow = (hex, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });

/* =========================================================
   Monde : construction de l'île
   ========================================================= */
const world = new THREE.Group();
scene.add(world);
const dummy = new THREE.Object3D();
function instanced(geo, mat, items, set, opts = {}) {
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
  m.count = items.length;
  items.forEach((it, i) => {
    dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
    const col = set(dummy, it, i);
    dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    if (col) m.setColorAt(i, col);
  });
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  m.castShadow = !!opts.cast; m.receiveShadow = opts.receive !== false;
  world.add(m);
  return m;
}
const terr = (x, y) => (y >= 0 && y < isl.h && x >= 0 && x < isl.w ? isl.terrain[y][x] : ' ');
const isLand = (x, y) => { const t = terr(x, y); return t !== ' ' && t !== '='; };

const land = [];
for (let y = 0; y < isl.h; y++) for (let x = 0; x < isl.w; x++) if (isLand(x, y)) land.push([x, y]);
/* distance au vide (pour la profondeur des stalactites) */
const depth = {};
land.forEach(([x, y]) => {
  let d = 0;
  for (let r = 1; r <= 4; r++) { let ok = true; for (let dy = -r; dy <= r && ok; dy++) for (let dx = -r; dx <= r; dx++) if (!isLand(x + dx, y + dy)) { ok = false; break; } if (!ok) break; d = r; }
  depth[x + ',' + y] = d;
});
const C = (hex) => new THREE.Color(hex);
{
  const tile = new THREE.BoxGeometry(T, 0.6, T);
  instanced(tile, M.grass, land, (o, [x, y]) => {
    o.position.set(W(x), -0.3 + (hash(x, y, 1) - 0.5) * 0.025, W(y));
    const edge = depth[x + ',' + y] === 0;
    return C(edge ? '#86a85a' : '#6aae5c').offsetHSL((hash(x, y, 2) - 0.5) * 0.04, 0, (hash(x, y, 3) - 0.5) * 0.08);
  });
  instanced(new THREE.BoxGeometry(T, 1.8, T), M.dirt, land, (o, [x, y]) => { o.position.set(W(x), -1.5, W(y)); return C('#8a6650').offsetHSL(0, 0, (hash(x, y, 4) - 0.5) * 0.08); });
  instanced(new THREE.ConeGeometry(T * 0.78, 1, 6), M.under, land, (o, [x, y]) => {
    const h = 2 + depth[x + ',' + y] * 2.4 + hash(x, y, 5) * 3;
    o.position.set(W(x) + (hash(x, y, 6) - 0.5) * 0.6, -2.4 - h / 2, W(y) + (hash(x, y, 7) - 0.5) * 0.6);
    o.rotation.set(Math.PI, hash(x, y, 8) * 6, 0); o.scale.set(1, h, 1);
    return C('#5d4b66').offsetHSL(0, 0, (hash(x, y, 9) - 0.5) * 0.1);
  }, { receive: false });
  const rocks = land.filter(([x, y]) => terr(x, y) === '#');
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  instanced(rockGeo, M.rock, rocks.flatMap(([x, y]) => [[x, y, 0], [x, y, 1]]), (o, [x, y, k]) => {
    const s = k ? 0.45 : 0.78;
    o.position.set(W(x) + (k ? (hash(x, y, 10) - 0.5) * 1.1 : 0), (k ? 0.2 : 0.38) + hash(x, y, 11) * 0.2, W(y) + (k ? (hash(x, y, 12) - 0.5) * 1.1 : 0));
    o.rotation.set(hash(x, y, 13) * 3, hash(x, y, 14) * 6, hash(x, y, 15) * 3);
    o.scale.set(s, s * (0.75 + hash(x, y, 16) * 0.55), s);
    return C('#9097ab').offsetHSL(0, 0, (hash(x, y, 17) - 0.5) * 0.12);
  }, { cast: true });
  const trees = land.filter(([x, y]) => terr(x, y) === 'T');
  instanced(new THREE.CylinderGeometry(0.14, 0.22, 1.3, 6), M.trunk, trees, (o, [x, y]) => { o.position.set(W(x), 0.65, W(y)); }, { cast: true });
  const blossom = (x, y) => hash(x, y, 20) < 0.65;
  instanced(new THREE.IcosahedronGeometry(0.85, 0), M.foliage, trees.flatMap(([x, y]) => [[x, y, 0], [x, y, 1], [x, y, 2]]), (o, [x, y, k]) => {
    const s = [1, 0.75, 0.6][k];
    o.position.set(W(x) + [0, 0.45, -0.4][k], 1.75 + [0, 0.35, 0.55][k], W(y) + [0, -0.2, 0.3][k]);
    o.rotation.set(hash(x, y, 21 + k), hash(x, y, 24 + k) * 6, 0); o.scale.set(s, s * 0.85, s);
    return blossom(x, y) ? C(['#f4a7c4', '#ec8db3', '#f7c1d6'][k]) : C(['#4f9a6a', '#5fae76', '#468a5f'][k]);
  }, { cast: true });
  // herbes et fleurs
  const grassCells = land.filter(([x, y]) => terr(x, y) === '.' && !isl.entAt[x + ',' + y]);
  const tufts = [];
  grassCells.forEach(([x, y]) => { for (let k = 0; k < 3; k++) if (hash(x, y, 30 + k) < 0.55) tufts.push([x, y, k]); });
  instanced(new THREE.ConeGeometry(0.09, 0.42, 4), M.tuft, tufts, (o, [x, y, k]) => {
    o.position.set(W(x) + (hash(x, y, 40 + k) - 0.5) * 1.7, 0.18, W(y) + (hash(x, y, 50 + k) - 0.5) * 1.7);
    o.rotation.z = (hash(x, y, 60 + k) - 0.5) * 0.4;
    return C('#86c46a').offsetHSL(0, 0, (hash(x, y, 70 + k) - 0.5) * 0.15);
  }, { receive: false });
  const flowers = grassCells.filter(([x, y]) => hash(x, y, 80) < 0.3);
  instanced(new THREE.IcosahedronGeometry(0.09, 0), M.tuft, flowers, (o, [x, y]) => {
    o.position.set(W(x) + (hash(x, y, 81) - 0.5) * 1.6, 0.14, W(y) + (hash(x, y, 82) - 0.5) * 1.6);
    return C(['#ffffff', '#ffd76a', '#ff9ec7', '#c9b6ff'][Math.floor(hash(x, y, 83) * 4)]);
  }, { receive: false });
}
/* Décor lointain : îlots flottants et nuages */
const decor = [];
{
  const cx = W(isl.w / 2), cz = W(isl.h / 2);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + hash(i, 1) * 0.4, r = 120 + hash(i, 2) * 70;
    const g = new THREE.Group();
    const s = 3 + hash(i, 3) * 6;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(s, s * 0.9, s * 0.35, 7), M.grass); top.position.y = 0;
    const bot = new THREE.Mesh(new THREE.ConeGeometry(s * 0.95, s * 2.2, 7), M.under); bot.rotation.x = Math.PI; bot.position.y = -s * 1.25;
    g.add(top, bot);
    if (hash(i, 4) < 0.6) { const tr = new THREE.Mesh(new THREE.IcosahedronGeometry(s * 0.35, 0), M.foliage); tr.position.set(s * 0.2, s * 0.45, 0); g.add(tr); }
    g.position.set(cx + Math.cos(a) * r, -10 + hash(i, 5) * 22, cz + Math.sin(a) * r);
    g.userData = { base: g.position.y, ph: hash(i, 6) * 6 };
    scene.add(g); decor.push(g);
  }
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1, transparent: true, opacity: 0.92 });
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group();
    const n = 3 + Math.floor(hash(i, 9) * 4);
    for (let k = 0; k < n; k++) {
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(2 + hash(i, k + 10) * 2.5, 0), cloudMat);
      p.position.set(k * 2.6 - n * 1.3, hash(i, k + 20) * 1.2, (hash(i, k + 30) - 0.5) * 2.5); p.scale.y = 0.6;
      g.add(p);
    }
    g.position.set(-60 + hash(i, 40) * (W(isl.w) + 120), -16 - hash(i, 41) * 14, -50 + hash(i, 42) * (W(isl.h) + 100));
    g.userData = { cloud: true, v: 0.6 + hash(i, 43) * 0.8 };
    scene.add(g); decor.push(g);
  }
}

/* ---------- Ponts et barrières ---------- */
const gateViews = {};   // id → [{ group, ghost, kind, delay }]
Object.values(isl.gates).forEach((g) => (gateViews[g.id] = []));
{
  const plank = new THREE.BoxGeometry(0.52, 0.14, 1.85), rail = new THREE.BoxGeometry(T, 0.09, 0.09), post = new THREE.BoxGeometry(0.14, 0.6, 0.14);
  const ghostGeo = new THREE.BoxGeometry(T * 0.96, 0.06, 1.8);
  Object.values(isl.gates).forEach((gt) => {
    gt.cells.forEach(([x, y], i) => {
      if (gt.kind === 'bridge' || terr(x, y) === '=') {
        const along = isl.gateCell[(x + 1) + ',' + y] === gt.id || isl.gateCell[(x - 1) + ',' + y] === gt.id || isLand(x + 1, y) || isLand(x - 1, y);
        const grp = new THREE.Group();
        [-0.62, 0, 0.62].forEach((o) => { const p = new THREE.Mesh(plank, M.wood); p.position.set(o, -0.07, 0); p.castShadow = true; p.receiveShadow = true; grp.add(p); });
        [-0.95, 0.95].forEach((z) => { const r = new THREE.Mesh(rail, M.wood); r.position.set(0, 0.55, z); grp.add(r); const p = new THREE.Mesh(post, M.wood); p.position.set(-0.85, 0.25, z); grp.add(p); });
        grp.position.set(W(x), 0, W(y)); if (!along) grp.rotation.y = Math.PI / 2;
        grp.visible = false;
        const ghost = new THREE.Mesh(ghostGeo, M.ghost); ghost.position.set(W(x), -0.05, W(y)); if (!along) ghost.rotation.y = Math.PI / 2;
        world.add(grp, ghost);
        gateViews[gt.id].push({ group: grp, ghost, kind: 'bridge', delay: i * 0.12 });
      } else {
        const grp = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0xbff3ff, emissive: 0x7fdcff, emissiveIntensity: 1.6, transparent: true, opacity: 0.85, flatShading: true });
        [[-0.5, 0.1, 1.3], [0.05, -0.2, 1.7], [0.55, 0.15, 1.2]].forEach(([ox, oz, s]) => { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), mat); c.position.set(ox, s * 0.7, oz); c.scale.set(0.8, s * 1.4, 0.8); c.castShadow = true; grp.add(c); });
        grp.position.set(W(x), 0, W(y));
        world.add(grp);
        gateViews[gt.id].push({ group: grp, kind: 'barrier', mat, delay: 0 });
      }
    });
  });
}

/* ---------- Objets ---------- */
const views = {};   // id entité → vue
const pedestalGeo = new THREE.CylinderGeometry(0.72, 0.9, 0.42, 8);
const ringGeo = new THREE.TorusGeometry(0.98, 0.045, 6, 40);
const dirAngle = (d) => Math.atan2(-DIRS[d][1], DIRS[d][0]);
function pedestal(g, rot) {
  const p = new THREE.Mesh(pedestalGeo, M.stone); p.position.y = 0.21; p.castShadow = true; p.receiveShadow = true; g.add(p);
  if (rot) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.05, 6, 32), M.gold); r.rotation.x = Math.PI / 2; r.position.y = 0.43; g.add(r); }
}
const RECV_GEO = {
  w: new THREE.OctahedronGeometry(0.42, 0),
  r: new THREE.ConeGeometry(0.46, 0.8, 3),
  g: new THREE.IcosahedronGeometry(0.4, 0),
  b: new THREE.BoxGeometry(0.55, 0.55, 0.55),
};
function buildEntity(e) {
  const g = new THREE.Group();
  g.position.set(W(e.x), 0, W(e.y));
  const v = { e, g, spin: 0 };
  if (e.t === 'lantern') {
    pedestal(g, e.rot);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 6), M.metal); post.position.y = 0.66; g.add(post);
    const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 6, 1, true), M.metal); cage.rotation.z = Math.PI / 2; head.add(cage);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow('#fff1c9', 4)); head.add(core);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.4, 8), M.gold); nozzle.rotation.z = -Math.PI / 2; nozzle.position.x = 0.42; head.add(nozzle);
    head.rotation.y = dirAngle(e.dir);
    v.head = head; v.target = () => dirAngle(e.dir);
  } else if (e.t === 'mirror') {
    pedestal(g, true);
    const frame = new THREE.Group(); frame.position.y = BEAM_Y; g.add(frame);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.25, 0.08), M.mirror); panel.castShadow = true; frame.add(panel);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.78, 1.33, 0.06), M.stoneDark); back.position.z = -0.06; frame.add(back);
    const edge = glow('#9fe9ff', 2.2);
    [[0, 0.66, 1.78, 0.05], [0, -0.66, 1.78, 0.05]].forEach(([x, y, w, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), edge); b.position.set(x, y, 0); frame.add(b); });
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
    const mat = new THREE.MeshStandardMaterial({ color: COLORS[e.color], emissive: COLORS[e.color], emissiveIntensity: 0.15, flatShading: true, roughness: 0.3 });
    const c = new THREE.Mesh(RECV_GEO[e.color] || RECV_GEO.w, mat); c.position.y = BEAM_Y; c.castShadow = true; g.add(c);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 6, 32), glow(COLORS[e.color], 1.2)); halo.rotation.x = Math.PI / 2; halo.position.y = 0.46; g.add(halo);
    v.crystal = c; v.mat = mat; v.halo = halo; v.spinObj = c;
  } else if (e.t === 'relay') {
    pedestal(g, true);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf3e9ff, emissive: 0xffffff, emissiveIntensity: 0.12, flatShading: true, roughness: 0.3 });
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 0), mat); c.position.y = BEAM_Y; g.add(c);
    const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 6), M.gold); arrow.rotation.z = -Math.PI / 2; arrow.position.x = 0.6; head.add(arrow);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.06), M.gold); arm.position.x = 0.3; head.add(arm);
    head.rotation.y = dirAngle(e.out);
    v.head = head; v.target = () => dirAngle(e.out); v.crystal = c; v.mat = mat; v.spinObj = c;
  } else if (e.t === 'beacon') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.7, 6), M.stone); base.position.y = 0.35; base.castShadow = true; base.receiveShadow = true; g.add(base);
    const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.62, 4.6, 6), M.stone); ob.position.y = 2.9; ob.castShadow = true; g.add(ob);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d6, emissiveIntensity: 0.1, flatShading: true });
    const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), crownMat); crown.position.y = 5.8; g.add(crown);
    v.rings = ['r', 'g', 'b'].map((c, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: COLORS[c], emissive: COLORS[c], emissiveIntensity: 0.1, metalness: 0.3, roughness: 0.4 });
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.78 - i * 0.08, 0.08, 8, 32), mat); r.rotation.x = Math.PI / 2; r.position.y = 1.05 + i * 0.75; g.add(r);
      return { c, mat, r };
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
  }
  g.traverse((o) => { if (o.isMesh && o.castShadow === false && o.material !== M.ring) o.castShadow = o.material.type !== 'MeshBasicMaterial'; });
  world.add(g);
  views[e.id] = v;
}
isl.ents.forEach(buildEntity);

/* Anneau de sélection */
const selRing = new THREE.Mesh(ringGeo, M.ring);
selRing.rotation.x = Math.PI / 2; selRing.visible = false;
scene.add(selRing);

/* =========================================================
   Faisceaux
   ========================================================= */
const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true);
const flareGeo = new THREE.SphereGeometry(1, 12, 8);
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
function getPooled(kind, geo, i) {
  if (!pool[kind][i]) { const m = new THREE.Mesh(geo, beamMats.w[kind]); m.frustumCulled = false; beamGroup.add(m); pool[kind][i] = m; }
  return pool[kind][i];
}
let segsNow = [];
function drawBeams(segs) {
  segsNow = segs;
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

/* =========================================================
   Particules
   ========================================================= */
class Sparks {
  constructor(n = 700) {
    this.n = n; this.i = 0;
    this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.g = new Float32Array(n);
    for (let i = 0; i < n; i++) this.pos[i * 3 + 1] = -9999;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geo = geo;
    this.mesh = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.mesh.frustumCulled = false; scene.add(this.mesh);
  }
  burst(p, color, count = 30, speed = 4, up = 2, grav = 6, life = 0.9) {
    const c = new THREE.Color(color).multiplyScalar(2.5);
    for (let k = 0; k < count; k++) {
      const i = this.i; this.i = (this.i + 1) % this.n;
      const a = Math.random() * Math.PI * 2, el = Math.random() * 1.4 - 0.3, s = speed * (0.3 + Math.random() * 0.7);
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
      this.vel[i * 3] = Math.cos(a) * Math.cos(el) * s; this.vel[i * 3 + 1] = Math.sin(el) * s + up; this.vel[i * 3 + 2] = Math.sin(a) * Math.cos(el) * s;
      this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
      this.life[i] = life * (0.6 + Math.random() * 0.6); this.g[i] = grav;
    }
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -9999; continue; }
      this.vel[i * 3 + 1] -= this.g[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      const f = 1 - dt * 1.6; this.col[i * 3] *= f; this.col[i * 3 + 1] *= f; this.col[i * 3 + 2] *= f;
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
  }
}
const sparks = new Sparks();
/* Pétales et lucioles (ambiance) */
const ambient = (() => {
  const n = LOW ? 70 : 160, pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 50; pos[i * 3 + 1] = Math.random() * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 50; seed[i] = Math.random() * 10; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.16, color: new THREE.Color('#ffc4dc').multiplyScalar(1.4), transparent: true, opacity: 0.85, depthWrite: false });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  return { pts, pos, seed, n, mat };
})();

/* =========================================================
   Personnage : Lyra et Fia
   ========================================================= */
const hero = new THREE.Group();
{
  const cloakMat = new THREE.MeshStandardMaterial({ color: 0x3e3f9c, flatShading: true, roughness: 0.8 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xf0c66b, flatShading: true, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6e3d3, flatShading: true, roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.15, 8), cloakMat); body.position.y = 0.62; body.castShadow = true;
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 6, 16), trimMat); belt.rotation.x = Math.PI / 2; belt.position.y = 0.82;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), skinMat); head.position.y = 1.36; head.castShadow = true;
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.62, 10, 1, true), cloakMat); hood.position.set(0, 1.55, -0.04); hood.rotation.x = -0.18;
  const hoodBack = new THREE.Mesh(new THREE.SphereGeometry(0.31, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), cloakMat); hoodBack.position.set(0, 1.38, -0.05); hoodBack.rotation.x = -0.5;
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1d1b3a });
  [-0.09, 0.09].forEach((x) => { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), eyeMat); eye.position.set(x, 1.38, 0.245); hero.add(eye); });
  hero.add(body, belt, head, hood, hoodBack);
  hero.userData.body = body;
}
scene.add(hero);
const fia = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glow('#fff0c2', 5));
scene.add(fia);
const fiaLight = new THREE.PointLight(0xffd9a0, LOW ? 0 : 6, 7, 2);
scene.add(fiaLight);

/* =========================================================
   État de la partie
   ========================================================= */
const S = {
  mode: 'menu',        // menu · play · pause · journal · read · finale · end
  px: 0, pz: 0, vx: 0, vz: 0, face: 0, walk: 0,
  yaw: 0.35, pitch: 0.92, dist: TOUCH ? 15 : 17, camT: new THREE.Vector3(), camYawT: 0.35,
  run: null, picked: {}, time: 0, zone: -1, seenZone: {}, target: null,
  restore: 0, restoreT: 0, finaleT: 0, sessionXP: 0, sessionCoins: 0, wisp: false,
};

function runSnapshot() { return Object.assign(snapshot(isl), { picked: S.picked, time: Math.round(S.time), zone: zones[S.zone] ? zones[S.zone].id : zones[0].id }); }
let saveT = null;
function save(now) {
  clearTimeout(saveT);
  const fn = () => platform.saveRun(IID, runSnapshot());
  if (now) fn(); else saveT = setTimeout(fn, 600);
}
function loadRun() {
  const run = platform.loadRun(IID);
  // remise à zéro de l'île
  restore(isl, isl.initial);
  Object.values(isl.gates).forEach((g) => (g.open = false));
  S.picked = {}; S.time = 0;
  if (run) { restore(isl, run); S.picked = Object.assign({}, run.picked); S.time = run.time || 0; }
  Object.values(views).forEach((v) => { if (v.head && v.target) v.head.rotation.y = v.target(); if (v.pick) v.g.visible = !S.picked[v.e.id]; });
  S.wisp = !!S.picked[(isl.ents.find((e) => e.t === 'wisp') || {}).id];
  Object.values(isl.gates).forEach((g) => setGateView(g, g.open, true));
  const res = evaluate(isl);
  drawBeams(res.segs); refreshCrystals(true);
  // point d'arrivée : dernière zone visitée, si elle est accessible
  let zi = 0;
  if (run && run.zone && zoneIndex[run.zone] !== undefined) {
    const z = zones[zoneIndex[run.zone]];
    if (!z.entryGate || (isl.gates[z.entryGate] && isl.gates[z.entryGate].open)) zi = zoneIndex[run.zone];
  }
  const z = zones[zi];
  S.px = W(z.ox + z.spawn[0]); S.pz = W(z.oy + z.spawn[1]); S.vx = S.vz = 0;
  S.zone = -1;
  S.restore = S.restoreT = restoreLevel();
  if (isl.gates.end && isl.gates.end.open) S.restore = S.restoreT = 1;
  updateHud();
}

function restoreLevel() {
  const done = MAIN_GATES.filter((g) => isl.gates[g] && isl.gates[g].open && g !== 'end').length;
  return isl.gates.end && isl.gates.end.open ? 1 : (done / Math.max(1, MAIN_GATES.length)) * 0.85;
}

/* ---------- Portes ---------- */
function setGateView(g, open, instant) {
  (gateViews[g.id] || []).forEach((v) => {
    if (v.kind === 'bridge') {
      v.ghost.visible = !open;
      if (instant) { v.group.visible = open; v.group.position.y = 0; v.group.scale.set(1, 1, 1); v.anim = 0; }
      else if (open) { v.group.visible = true; v.anim = -v.delay; v.group.position.y = -3; }
    } else {
      if (instant) { v.group.visible = !open; v.group.scale.set(1, 1, 1); v.anim = 0; }
      else if (open) v.anim = 0.0001;
    }
  });
}

/* ---------- Cristaux ---------- */
const litBefore = {};
function refreshCrystals(silent) {
  isl.ents.forEach((e) => {
    const v = views[e.id];
    if (e.t === 'receiver') {
      v.lit = e.lit;
      if (e.lit && !litBefore[e.id] && !silent) { chime(880, 0.4); sparks.burst(new THREE.Vector3(W(e.x), BEAM_Y, W(e.y)), COLORS[e.color], 24, 3, 1.5); }
    } else if (e.t === 'relay') {
      v.lit = !!e.emit;
      if (v.lit) { v.mat.emissive.set(COLORS[e.emit]); v.mat.color.set(COLORS[e.emit]); } else { v.mat.emissive.set('#ffffff'); v.mat.color.set('#f3e9ff'); }
      if (e.lit && !litBefore[e.id] && !silent) chime(740, 0.3);
    } else if (e.t === 'beacon') {
      v.rings.forEach((r) => (r.on = (e.got || []).includes(r.c)));
      v.lit = e.lit;
    }
    litBefore[e.id] = e.lit;
  });
}

/* ---------- Interaction ---------- */
function interact(back) {
  if (S.mode !== 'play' || !S.target) return;
  const e = S.target;
  const n = back && (e.t === 'lantern' || e.t === 'relay') ? 3 : 1;
  for (let i = 0; i < n; i++) rotate(e);
  chime(e.t === 'mirror' ? 520 : 440, 0.18, 'triangle');
  sparks.burst(new THREE.Vector3(W(e.x), BEAM_Y, W(e.y)), '#ffd98a', 10, 2, 1);
  const res = evaluate(isl);
  drawBeams(res.segs);
  refreshCrystals(false);
  res.opened.forEach(onGateOpened);
  save();
}

function onGateOpened(id) {
  const g = isl.gates[id];
  setGateView(g, true, false);
  if (id === 'end') { S.restoreT = 1; updateHud(); startFinale(); return; }
  const kind = SECRET_GATES.includes(id) ? 'treasure' : OPT_GATES.includes(id) ? 'secret' : 'main';
  if (kind === 'main') {
    chord([523, 659, 784]);
    const z = zones.find((zz) => zz.ents.some((e) => e.gate === id && !e.optional));
    toast('✦', `${z ? z.title : 'Énigme'} : résolue`, 'Un pont de lumière se forme.');
    reward('g:' + IID + ':' + id, 120, 40);
  } else if (kind === 'secret') {
    chord([587, 740, 880, 1175]);
    toast('✧', 'Un passage secret s’ouvre', 'Un pont mène à une chambre cachée.');
    reward('o:' + IID + ':' + id, 60, 20);
  } else {
    chord([659, 784, 988, 1319]);
    toast('◆', 'Chambre secrète résolue', 'La barrière de cristal se dissout.');
    reward('g:' + IID + ':' + id, 200, 60);
  }
  g.cells.forEach(([x, y]) => sparks.burst(new THREE.Vector3(W(x), 0.4, W(y)), '#9fe9ff', 8, 2.5, 2));
  S.restoreT = restoreLevel();
  updateHud();
}

function reward(key, xp, coins) {
  const r = platform.reward(key, xp, coins);
  if (!r) return;
  S.sessionXP += r.xp; S.sessionCoins += r.coins;
  setTimeout(() => toast('🎁', [r.xp ? `+${fmt(r.xp)} XP` : '', r.coins ? `+${fmt(r.coins)} pièces` : ''].filter(Boolean).join(' · '), 'Ajoutés à ta progression Prism Arcade', 'reward'), 500);
  if (r.levelUp) setTimeout(() => toast('⬆️', `Niveau ${r.levelUp} atteint !`, 'Prism Arcade', 'reward'), 1400);
}

function pickup(e) {
  const v = views[e.id];
  S.picked[e.id] = 1;
  v.g.visible = false;
  const p = new THREE.Vector3(W(e.x), 1, W(e.y));
  if (e.t === 'shard') {
    sparks.burst(p, '#d8b4fe', 40, 4, 2.5);
    chord([988, 1319], 0.12);
    const n = countPicked('shard');
    toast('✦', `Éclat de prisme ${n} / ${countAll('shard')}`, n === countAll('shard') ? 'Tous les éclats de l’île sont réunis !' : '');
    reward('s:' + IID + ':' + e.id, 0, 30);
  } else if (e.t === 'page') {
    sparks.burst(p, '#ffe2a0', 30, 3, 2);
    chord([523, 659, 784, 1047], 0.15);
    reward('p:' + IID + ':' + e.page, 50, 20);
    openPage(e.page, true);
  } else if (e.t === 'wisp') {
    S.wisp = true;
    sparks.burst(p, '#ffd1f0', 40, 3, 2);
    chord([659, 880, 1109], 0.15);
    toast('✿', DEF.wisp.name, DEF.wisp.text);
    reward('w:' + IID, 80, 30);
  }
  updateHud(); save();
}
const countAll = (t) => isl.ents.filter((e) => e.t === t).length;
const countPicked = (t) => isl.ents.filter((e) => e.t === t && S.picked[e.id]).length;

/* =========================================================
   Finale
   ========================================================= */
let finaleRewards = null;
function startFinale() {
  S.mode = 'finale'; S.finaleT = 0;
  setTouch(false); $('#prompt').hidden = true;
  const b = isl.ents.find((e) => e.t === 'beacon');
  S.finaleFrom = { yaw: S.yaw, dist: S.dist, pitch: S.pitch };
  S.finaleAt = new THREE.Vector3(W(b.x), 2, W(b.y));
  chord([392, 494, 587, 784, 988], 0.4);
  const first = platform.reward('g:' + IID + ':end', 120, 40);
  const done = platform.reward('done:' + IID, 600, 200);
  const better = platform.finish(IID, S.time);
  finaleRewards = { xp: (first ? first.xp : 0) + (done ? done.xp : 0), coins: (first ? first.coins : 0) + (done ? done.coins : 0), better };
  S.sessionXP += finaleRewards.xp; S.sessionCoins += finaleRewards.coins;
  save(true);
}
function showEnd() {
  S.mode = 'end';
  const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
  const secrets = SECRET_GATES.filter((g) => isl.gates[g].open).length;
  const pct = completion();
  $('#end').innerHTML = `<div class="panel end-card">
    <p class="kicker">Île ${DEF.num} rallumée</p>
    <h1>${esc(DEF.name)}</h1>
    <p class="lead">${esc(DEF.ending)}</p>
    <div class="stats">
      <div><b>${m} min ${String(s).padStart(2, '0')}</b><small>temps${finaleRewards && finaleRewards.better ? ' · record' : ''}</small></div>
      <div><b>${pct} %</b><small>complété</small></div>
      <div><b>${secrets} / ${SECRET_GATES.length}</b><small>chambres secrètes</small></div>
      <div><b>${countPicked('shard')} / ${countAll('shard')}</b><small>éclats</small></div>
      <div><b>${countPicked('page')} / ${countAll('page')}</b><small>pages d’Orin</small></div>
    </div>
    ${finaleRewards && finaleRewards.xp ? `<p class="gain">🎁 +${fmt(finaleRewards.xp)} XP · +${fmt(finaleRewards.coins)} pièces sur Prism Arcade</p>` : ''}
    <div class="next"><h3>La suite du voyage</h3>${UPCOMING.map((u) => `<div class="up"><span>Île ${u.num}</span><b>${esc(u.name)}</b><small>${esc(u.what)} · bientôt</small></div>`).join('')}</div>
    <div class="actions"><button class="btn primary" data-act="explore">${pct < 100 ? 'Continuer à explorer (100 %)' : 'Continuer à explorer'}</button><a class="btn" href="../#/">Retour à Prism Arcade</a></div></div>`;
  $('#end').hidden = false;
}
function completion() {
  const parts = [
    [MAIN_GATES.filter((g) => isl.gates[g].open).length, MAIN_GATES.length, 50],
    [SECRET_GATES.filter((g) => isl.gates[g].open).length, SECRET_GATES.length, 20],
    [countPicked('shard'), countAll('shard'), 15],
    [countPicked('page'), countAll('page'), 10],
    [S.wisp ? 1 : 0, 1, 5],
  ];
  return Math.floor(parts.reduce((a, [n, t, w]) => a + (t ? (n / t) * w : w), 0));
}

/* =========================================================
   Son (synthétisé)
   ========================================================= */
let actx = null, master = null, pad = null;
function audio() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = platform.muted() ? 0 : 1; master.connect(actx.destination);
    } catch (e) { return null; }
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(f, dur = 0.3, type = 'sine', vol = 0.08, delay = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
const chime = (f, dur = 0.3, type = 'sine') => { tone(f, dur, type, 0.07); tone(f * 2, dur * 0.6, 'sine', 0.02); };
const chord = (fs, step = 0.09) => fs.forEach((f, i) => { tone(f, 0.9, 'sine', 0.06, i * step); tone(f * 2, 0.5, 'triangle', 0.015, i * step); });
function startPad() {
  const a = audio(); if (!a || pad) return;
  const g = a.createGain(); g.gain.value = 0; g.connect(master);
  const filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 900; filt.connect(g);
  const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.06; lg.gain.value = 350; lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
  const voices = [110, 164.81, 220, 277.18, 329.63].map((f, i) => { const o = a.createOscillator(), og = a.createGain(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 2) * 4; og.gain.value = 0; o.connect(og); og.connect(filt); o.start(); return og; });
  g.gain.linearRampToValueAtTime(0.05, a.currentTime + 3);
  pad = { g, voices, filt };
}
function updatePad() {
  if (!pad || !actx) return;
  // plus l'île est rallumée, plus la nappe s'enrichit
  const lv = S.restore;
  pad.voices.forEach((v, i) => v.gain.setTargetAtTime(i < 2 ? 0.5 : lv > (i - 1) * 0.22 ? 0.35 : 0, actx.currentTime, 1.5));
  pad.filt.frequency.setTargetAtTime(700 + lv * 1400, actx.currentTime, 2);
}
function setMuted(m) { if (master) master.gain.value = m ? 0 : 1; $('#b-mute').innerHTML = m ? ICON.muted : ICON.sound; }

/* =========================================================
   Commandes
   ========================================================= */
const keys = {};
const KEYMAP = { up: ['arrowup', 'z', 'w'], down: ['arrowdown', 's'], left: ['arrowleft', 'q', 'a'], right: ['arrowright', 'd'] };
const held = (dir) => KEYMAP[dir].some((k) => keys[k]);
addEventListener('keydown', (ev) => {
  const k = ev.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k)) ev.preventDefault();
  if (ev.repeat && (k === 'e' || k === ' ' || k === 'enter')) return;
  keys[k] = true;
  if (S.mode === 'play') {
    if (k === 'e' || k === ' ' || k === 'enter') interact(false);
    if (k === 'r') interact(true);
    if (k === 'escape' || k === 'p') openPause();
    if (k === 'j' || k === 'tab') openJournal();
  } else if (S.mode === 'pause' && (k === 'escape' || k === 'p')) closeOverlays();
  else if ((S.mode === 'journal' || S.mode === 'read') && (k === 'escape' || k === 'j' || k === 'tab')) closeOverlays();
});
addEventListener('keyup', (ev) => { keys[ev.key.toLowerCase()] = false; });
addEventListener('blur', () => { Object.keys(keys).forEach((k) => (keys[k] = false)); if (S.mode === 'play') openPause(); });

/* Caméra à la souris / au doigt */
let drag = null;
canvas.addEventListener('pointerdown', (ev) => {
  if (S.mode !== 'play') return;
  if (ev.pointerType === 'touch' && ev.clientX < innerWidth * 0.45) return; // côté joystick
  drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
  canvas.setPointerCapture(ev.pointerId);
});
canvas.addEventListener('pointermove', (ev) => {
  if (!drag || drag.id !== ev.pointerId) return;
  S.camYawT -= (ev.clientX - drag.x) * 0.006;
  S.pitch = Math.min(1.25, Math.max(0.55, S.pitch + (ev.clientY - drag.y) * 0.003));
  drag.x = ev.clientX; drag.y = ev.clientY;
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (ev) => { ev.preventDefault(); S.dist = Math.min(30, Math.max(10, S.dist + ev.deltaY * 0.012)); }, { passive: false });

/* Joystick tactile */
const joy = { active: false, id: null, x: 0, y: 0, ox: 0, oy: 0 };
const joyEl = $('#joy'), knob = $('#knob');
function joyStart(ev) {
  if (S.mode !== 'play') return;
  const t = ev.changedTouches[0];
  if (t.clientX > innerWidth * 0.45) return;
  joy.active = true; joy.id = t.identifier; joy.ox = t.clientX; joy.oy = t.clientY; joy.x = joy.y = 0;
  joyEl.style.left = t.clientX - 60 + 'px'; joyEl.style.top = t.clientY - 60 + 'px'; joyEl.classList.add('on');
  ev.preventDefault();
}
function joyMove(ev) {
  for (const t of ev.changedTouches) {
    if (t.identifier !== joy.id) continue;
    let dx = t.clientX - joy.ox, dy = t.clientY - joy.oy;
    const l = Math.hypot(dx, dy), max = 52;
    if (l > max) { dx *= max / l; dy *= max / l; }
    joy.x = dx / max; joy.y = dy / max;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    ev.preventDefault();
  }
}
function joyEnd(ev) {
  for (const t of ev.changedTouches) if (t.identifier === joy.id) { joy.active = false; joy.x = joy.y = 0; knob.style.transform = ''; joyEl.classList.remove('on'); }
}
canvas.addEventListener('touchstart', joyStart, { passive: false });
addEventListener('touchmove', joyMove, { passive: false });
addEventListener('touchend', joyEnd); addEventListener('touchcancel', joyEnd);
let actHold = null;
$('#b-act').addEventListener('pointerdown', (ev) => { ev.preventDefault(); actHold = setTimeout(() => { actHold = 'long'; interact(true); }, 450); });
$('#b-act').addEventListener('pointerup', (ev) => { ev.preventDefault(); if (actHold !== 'long') { clearTimeout(actHold); interact(false); } actHold = null; });
function setTouch(on) { $('#touch').hidden = !(on && TOUCH); }

/* =========================================================
   Interface
   ========================================================= */
const ICON = {
  sound: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>',
  muted: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
};
function toast(icon, title, sub = '', kind = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = `<span class="ti">${icon}</span><div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  const box = $('#toasts');
  box.appendChild(el);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, kind === 'reward' ? 2600 : 4200);
}
function banner(z) {
  const el = $('#banner');
  const region = DEF.regions[z.region];
  el.innerHTML = `<small>${esc(region ? region.name : '')}${z.secret ? '' : ` · Énigme ${z.num}${z.id === 'phare' ? '' : ` / ${MAIN_GATES.length - 1}`}`}</small><b>${esc(z.title)}</b>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function updateHud() {
  const main = MAIN_GATES.filter((g) => isl.gates[g].open).length;
  $('#h-puz').textContent = `${main} / ${MAIN_GATES.length}`;
  $('#h-shard').textContent = `${countPicked('shard')} / ${countAll('shard')}`;
  const z = zones[S.zone];
  const rn = z ? DEF.regions[z.region].name : '';
  $('#h-where').textContent = z ? (rn === z.title ? z.title : `${rn} · ${z.title}`) : DEF.name;
}
function openPause() {
  S.mode = 'pause'; setTouch(false);
  const m = Math.floor(S.time / 60);
  $('#pause').innerHTML = `<div class="panel menu-card"><h2>Pause</h2><p class="muted">${esc(DEF.name)} · ${m} min de jeu · ${completion()} % complété</p>
    <div class="actions"><button class="btn primary" data-act="resume">Reprendre</button><button class="btn" data-act="journal">Journal</button><button class="btn" data-act="help">Commandes</button><button class="btn" data-act="restart">Recommencer l’île</button><a class="btn" href="../#/">Quitter vers Prism Arcade</a></div>
    <div id="help" class="help" hidden>${HELP}</div></div>`;
  $('#pause').hidden = false;
}
const HELP = TOUCH
  ? '<p><b>Joystick</b> (côté gauche) : se déplacer · <b>glisser à droite</b> : tourner la caméra</p><p><b>Bouton ↻</b> : tourner l’objet entouré d’or · <b>appui long</b> : dans l’autre sens</p>'
  : '<p><b>ZQSD / WASD / flèches</b> : se déplacer · <b>glisser la souris</b> : caméra · <b>molette</b> : zoom</p><p><b>E / Espace</b> : tourner l’objet entouré d’or · <b>R</b> : dans l’autre sens · <b>J</b> : journal · <b>Échap</b> : pause</p>';
function openJournal(tab = 'quests') {
  S.mode = 'journal'; setTouch(false);
  const regionRows = Object.entries(DEF.regions).filter(([k]) => k !== 'secret').map(([k, r]) => {
    const zs = r.zones.map((id) => zones[zoneIndex[id]]);
    const done = zs.filter((z) => { const g = z.ents.find((e) => e.gate && !e.optional); return g && isl.gates[g.gate].open; }).length;
    return `<li class="${done === zs.length ? 'done' : ''}"><span class="check"></span><div><b>${esc(r.name)}</b><small>${zs.map((z) => { const g = z.ents.find((e) => e.gate && !e.optional); return `<span class="${g && isl.gates[g.gate].open ? 'ok' : ''}">${esc(z.title)}</span>`; }).join(' · ')}</small></div><em>${done} / ${zs.length}</em></li>`;
  }).join('');
  const nextZone = zones.find((z) => !z.secret && !(z.ents.find((e) => e.gate && !e.optional) && isl.gates[z.ents.find((e) => e.gate && !e.optional).gate].open));
  const secrets = SECRET_GATES.filter((g) => isl.gates[g].open).length, secretsFound = OPT_GATES.filter((g) => isl.gates[g].open).length;
  const pages = isl.ents.filter((e) => e.t === 'page');
  const tabs = { quests: 'Quêtes', collection: 'Collection', map: 'Carte' };
  $('#journal').innerHTML = `<div class="panel journal-card">
    <div class="j-head"><h2>Journal de Lyra</h2><button class="icon-btn" data-act="close" aria-label="Fermer">✕</button></div>
    <div class="seg">${Object.entries(tabs).map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
    <div class="j-body">${tab === 'quests' ? `
      <div class="quest main"><small>Quête principale</small><b>Rallumer le phare de l’Aube</b><p>${nextZone ? `Prochaine étape : <b>${esc(nextZone.title)}</b> (${esc(DEF.regions[nextZone.region].name)}). ${esc(nextZone.hint)}` : 'Le phare brille. Il reste des secrets à découvrir.'}</p></div>
      <ul class="qlist">${regionRows}</ul>
      <div class="quest"><small>Quêtes secondaires</small>
        <p>◆ Chambres secrètes : <b>${secrets} / ${SECRET_GATES.length}</b> résolues (${secretsFound} passage${secretsFound > 1 ? 's' : ''} découvert${secretsFound > 1 ? 's' : ''}). <span class="muted">Certains cristaux ne s’allument qu’avec une autre orientation que celle qui ouvre le chemin…</span></p>
        <p>✿ ${esc(DEF.wisp.name)} : <b>${S.wisp ? 'trouvée' : 'introuvable pour l’instant'}</b></p></div>` : tab === 'collection' ? `
      <div class="coll"><div><b>${countPicked('shard')} / ${countAll('shard')}</b><small>éclats de prisme</small></div><div><b>${countPicked('page')} / ${pages.length}</b><small>pages d’Orin</small></div><div><b>${completion()} %</b><small>île complétée</small></div></div>
      <ul class="pages">${pages.map((p) => S.picked[p.id] ? `<li><button class="link" data-page="${p.page}">${esc(DEF.pages[p.page].title)}</button></li>` : '<li class="muted">Page manquante · une chambre secrète la garde</li>').join('')}</ul>` : `
      <canvas id="minimap" width="560" height="380"></canvas><p class="muted small">● toi · ◆ chambre secrète · les ponts dorés sont ouverts</p>`}</div></div>`;
  $('#journal').hidden = false;
  if (tab === 'map') drawMap($('#minimap'));
}
function drawMap(cv) {
  const g = cv.getContext('2d'), s = Math.min(cv.width / isl.w, cv.height / isl.h), ox = (cv.width - isl.w * s) / 2, oy = (cv.height - isl.h * s) / 2;
  g.clearRect(0, 0, cv.width, cv.height);
  for (let y = 0; y < isl.h; y++) for (let x = 0; x < isl.w; x++) {
    const t = isl.terrain[y][x];
    if (t === ' ') continue;
    const zi = isl.zoneAt[y][x], z = zones[zi];
    if (t === '=') { const gt = isl.gates[isl.gateCell[x + ',' + y]]; if (!gt.open) continue; g.fillStyle = '#e8b65a'; }
    else if (t === '#' || t === 'T') g.fillStyle = 'rgba(255,255,255,.22)';
    else if (t === 'x') g.fillStyle = isl.gates[isl.gateCell[x + ',' + y]].open ? 'rgba(255,255,255,.5)' : '#7fdcff';
    else g.fillStyle = z && z.secret ? 'rgba(216,180,254,.55)' : 'rgba(150,220,140,.55)';
    g.fillRect(ox + x * s, oy + y * s, s + 0.5, s + 0.5);
  }
  isl.ents.forEach((e) => {
    if (e.t === 'receiver' || e.t === 'beacon') { g.fillStyle = e.lit ? COLORS[e.color || 'w'] : 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(ox + (e.x + 0.5) * s, oy + (e.y + 0.5) * s, s * 0.45, 0, 7); g.fill(); }
  });
  g.fillStyle = '#fff'; g.beginPath(); g.arc(ox + (S.px / T + 0.5) * s, oy + (S.pz / T + 0.5) * s, s * 0.7, 0, 7); g.fill();
  g.strokeStyle = '#3e3f9c'; g.lineWidth = 2; g.stroke();
}
function openPage(id, fresh) {
  const p = DEF.pages[id];
  S.mode = 'read'; setTouch(false);
  $('#reader').innerHTML = `<div class="panel page-card"><p class="kicker">${fresh ? 'Page trouvée' : 'Journal'}</p><h2>${esc(p.title)}</h2><p class="page-text">${esc(p.text)}</p><div class="actions"><button class="btn primary" data-act="close">Continuer</button></div></div>`;
  $('#reader').hidden = false;
}
function closeOverlays() {
  ['#pause', '#journal', '#reader'].forEach((s) => ($(s).hidden = true));
  if (S.mode !== 'end' && S.mode !== 'finale' && S.mode !== 'menu') { S.mode = 'play'; setTouch(true); }
}

document.addEventListener('click', (ev) => {
  const a = ev.target.closest('[data-act]');
  const tab = ev.target.closest('[data-tab]');
  const page = ev.target.closest('[data-page]');
  if (tab) { openJournal(tab.dataset.tab); return; }
  if (page) { openPage(page.dataset.page, false); return; }
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'play') startGame(false);
  else if (act === 'new') { if (confirm('Recommencer l’Île de l’Aube depuis le début ? Les récompenses déjà gagnées restent acquises.')) startGame(true); }
  else if (act === 'resume' || act === 'close') closeOverlays();
  else if (act === 'journal') openJournal();
  else if (act === 'help') { const h = $('#help'); if (h) h.hidden = !h.hidden; }
  else if (act === 'restart') { if (confirm('Recommencer l’île ? Les orientations, portes et objets ramassés sont remis à zéro (les récompenses restent acquises).')) { closeOverlays(); startGame(true); } }
  else if (act === 'explore') { $('#end').hidden = true; S.mode = 'play'; setTouch(true); }
});
$('#b-pause').addEventListener('click', () => (S.mode === 'play' ? openPause() : closeOverlays()));
$('#b-journal').addEventListener('click', () => (S.mode === 'play' ? openJournal() : closeOverlays()));
$('#b-mute').addEventListener('click', () => setMuted(platform.toggleMute()));

/* ---------- Écran d'accueil ---------- */
function menu() {
  const run = platform.loadRun(IID);
  const done = platform.flag('done:' + IID);
  const acc = platform.account();
  const best = platform.bestTime(IID);
  $('#menu').innerHTML = `<div class="menu-wrap">
    <div class="title"><h1>LUMEN</h1><p>Les Îles Brisées</p></div>
    <div class="panel island-card">
      <p class="kicker">Île ${DEF.num}${done ? ' · rallumée ✦' : ''}</p>
      <h2>${esc(DEF.name)}</h2>
      <p class="muted">${esc(DEF.intro)}</p>
      ${run ? `<p class="small muted">Partie en cours · ${Math.floor((run.time || 0) / 60)} min de jeu${best ? ` · meilleur temps ${Math.floor(best / 60)} min` : ''}</p>` : ''}
      <div class="actions">
        <button class="btn primary" data-act="play">${run ? 'Continuer' : 'Jouer'}</button>
        ${run ? '<button class="btn" data-act="new">Nouvelle partie</button>' : ''}
      </div>
      <div class="help">${HELP}</div>
      <p class="small muted">${platform.available ? (acc === 'in' ? 'Progression et récompenses enregistrées sur ton compte Studio Prism.' : 'Progression enregistrée dans Prism Arcade. Connecte-toi sur Prism Arcade pour la sauvegarder en ligne.') : 'Progression enregistrée sur cet appareil.'}</p>
    </div>
    <div class="upcoming">${UPCOMING.map((u) => `<span>Île ${u.num} · ${esc(u.name)} <em>bientôt</em></span>`).join('')}</div>
    <a class="back-link" href="../#/">← Prism Arcade</a></div>`;
  $('#menu').hidden = false;
}
function startGame(fresh) {
  audio(); startPad();
  if (fresh) platform.clearRun(IID);
  loadRun();
  platform.startSession();
  $('#menu').hidden = true; $('#end').hidden = true; $('#hud').hidden = false;
  S.mode = 'play'; setTouch(true);
  S.seenZone = {};
  S.camT.set(S.px, 0, S.pz);
  if (!platform.loadRun(IID) || fresh) setTimeout(() => toast('✦', 'Bienvenue, Porteuse de lumière', TOUCH ? 'Approche-toi des objets entourés d’or et touche ↻.' : 'Approche-toi des objets entourés d’or et appuie sur E.'), 600);
  save(true);
}

/* =========================================================
   Boucle
   ========================================================= */
const tmpV = new THREE.Vector3();
let last = performance.now(), fpsAcc = 0, fpsN = 0, qualityChecked = false, elapsed = 0;
function canStand(x, z) {
  const r = 0.34;
  for (const [ox, oz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) if (!walkable(isl, Math.round((x + ox) / T), Math.round((z + oz) / T))) return false;
  return true;
}
function update(dt) {
  elapsed += dt;
  const t = elapsed;
  /* -------- joueur -------- */
  if (S.mode === 'play') {
    S.time += dt;
    let ix = 0, iy = 0;
    if (held('left')) ix -= 1; if (held('right')) ix += 1; if (held('up')) iy += 1; if (held('down')) iy -= 1;
    if (joy.active) { ix += joy.x; iy -= joy.y; }
    const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; }
    const fx = -Math.sin(S.yaw), fz = -Math.cos(S.yaw), rx = Math.cos(S.yaw), rz = -Math.sin(S.yaw);
    const speed = 5.6;
    const tx = (rx * ix + fx * iy) * speed, tz = (rz * ix + fz * iy) * speed;
    S.vx = lerp(S.vx, tx, damp(14, dt)); S.vz = lerp(S.vz, tz, damp(14, dt));
    const nx = S.px + S.vx * dt, nz = S.pz + S.vz * dt;
    if (canStand(nx, S.pz)) S.px = nx; else S.vx = 0;
    if (canStand(S.px, nz)) S.pz = nz; else S.vz = 0;
    const sp = Math.hypot(S.vx, S.vz);
    if (sp > 0.3) { const want = Math.atan2(S.vx, S.vz); let d = want - S.face; d = Math.atan2(Math.sin(d), Math.cos(d)); S.face += d * damp(12, dt); }
    S.walk += sp * dt * 2.2;
    /* zone */
    const tx0 = Math.round(S.px / T), ty0 = Math.round(S.pz / T);
    const zi = isl.zoneAt[ty0] ? isl.zoneAt[ty0][tx0] : -1;
    if (zi >= 0 && zi !== S.zone) {
      S.zone = zi; updateHud();
      if (!S.seenZone[zi]) { S.seenZone[zi] = true; banner(zones[zi]); const z = zones[zi]; const g = z.ents.find((e) => e.gate && !e.optional); if (!(g && isl.gates[g.gate].open)) setTimeout(() => toast('💡', z.title, z.hint), 900); }
      save();
    }
    /* objets à ramasser */
    isl.ents.forEach((e) => {
      if (!views[e.id].pick || S.picked[e.id]) return;
      if (Math.hypot(W(e.x) - S.px, W(e.y) - S.pz) < 1.25) pickup(e);
    });
    /* cible d'interaction */
    let best = null, bd = 2.5;
    isl.ents.forEach((e) => { if (!e.rot) return; const d = Math.hypot(W(e.x) - S.px, W(e.y) - S.pz); if (d < bd) { bd = d; best = e; } });
    if (best !== S.target) {
      S.target = best;
      const p = $('#prompt');
      if (best) {
        const name = { lantern: 'la lanterne', mirror: 'le miroir', relay: 'le relais' }[best.t];
        p.innerHTML = TOUCH ? `↻ Tourner ${name}` : `<kbd>E</kbd> Tourner ${name}${best.t !== 'mirror' ? ' · <kbd>R</kbd> dans l’autre sens' : ''}`;
        p.hidden = false;
      } else p.hidden = true;
      $('#b-act').classList.toggle('ready', !!best);
    }
    if (time30(t)) save();
  }
  /* -------- personnage -------- */
  const moving = Math.hypot(S.vx, S.vz) > 0.4 && S.mode === 'play';
  hero.position.set(S.px, moving ? Math.abs(Math.sin(S.walk * 3)) * 0.07 : 0, S.pz);
  hero.rotation.y = S.face;
  hero.userData.body.rotation.x = moving ? 0.08 : 0;
  const fa = t * 1.6;
  fia.position.set(S.px + Math.cos(fa) * 0.75, 1.75 + Math.sin(t * 2.3) * 0.12, S.pz + Math.sin(fa) * 0.75);
  fiaLight.position.copy(fia.position);
  if (S.selRingFor !== S.target) S.selRingFor = S.target;
  if (S.target && S.mode === 'play') { selRing.visible = true; selRing.position.set(W(S.target.x), 0.47, W(S.target.y)); selRing.scale.setScalar(1 + Math.sin(t * 5) * 0.04); } else selRing.visible = false;

  /* -------- caméra -------- */
  S.yaw = lerp(S.yaw, S.camYawT, damp(10, dt));
  if (S.mode === 'menu') {
    const c = new THREE.Vector3(W(isl.w / 2), 0, W(isl.h / 2));
    const a = t * 0.05;
    camera.position.set(c.x + Math.cos(a) * 95, 55, c.z + Math.sin(a) * 95);
    camera.lookAt(c.x, -4, c.z);
    S.camT.copy(c);
  } else if (S.mode === 'finale' || (S.mode === 'end' && S.finaleAt)) {
    S.finaleT += dt;
    const k = Math.min(1, S.finaleT / 4.5), e = k * k * (3 - 2 * k);
    const tgt = S.finaleAt;
    S.camT.lerp(tgt, damp(2, dt));
    const yaw = S.finaleFrom.yaw + e * 1.6, dist = lerp(S.finaleFrom.dist, 30, e), pitch = lerp(S.finaleFrom.pitch, 0.55, e);
    camera.position.set(S.camT.x + Math.sin(yaw) * Math.cos(pitch) * dist, S.camT.y + Math.sin(pitch) * dist, S.camT.z + Math.cos(yaw) * Math.cos(pitch) * dist);
    camera.lookAt(S.camT.x, S.camT.y + 2 * e, S.camT.z);
    S.restoreT = 1;
    if (S.mode === 'finale' && S.finaleT > 6.5) showEnd();
  } else {
    tmpV.set(S.px, 0.8, S.pz);
    S.camT.lerp(tmpV, damp(6, dt));
    const d = S.dist;
    camera.position.set(S.camT.x + Math.sin(S.yaw) * Math.cos(S.pitch) * d, S.camT.y + Math.sin(S.pitch) * d, S.camT.z + Math.cos(S.yaw) * Math.cos(S.pitch) * d);
    camera.lookAt(S.camT);
  }
  sky.position.copy(camera.position);
  sun.position.set(S.camT.x + 22, 34, S.camT.z + 14); sun.target.position.copy(S.camT);

  /* -------- restauration du monde -------- */
  S.restore = lerp(S.restore, S.restoreT, damp(0.8, dt));
  const r = S.restore;
  skyU.top.value.copy(PAL.dusk[0]).lerp(PAL.dawn[0], r);
  skyU.bottom.value.copy(PAL.dusk[1]).lerp(PAL.dawn[1], r);
  skyU.horizon.value.copy(PAL.dusk[2]).lerp(PAL.dawn[2], r);
  scene.fog.color.copy(skyU.horizon.value);
  hemi.color.copy(skyU.top.value).lerp(new THREE.Color('#ffffff'), 0.5); hemi.intensity = 1.05 + r * 0.4;
  sun.intensity = 1.7 + r * 1.0; sun.color.set('#ffc6b0').lerp(new THREE.Color('#fff1d6'), r);
  const tint = new THREE.Color('#a3a0bd').lerp(new THREE.Color('#ffffff'), 0.35 + r * 0.65);
  M.grass.color.copy(tint); M.foliage.color.copy(tint); M.tuft.color.copy(tint);
  ambient.mat.opacity = 0.35 + r * 0.6;
  updatePadThrottled(t);

  /* -------- animations des objets -------- */
  Object.values(views).forEach((v) => {
    if (v.head && v.target) { const want = v.target(); let d = want - v.head.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); v.head.rotation.y += d * damp(14, dt); }
    if (v.float) v.float.position.y = (v.e.t === 'prism' ? BEAM_Y + 0.1 : 1) + Math.sin(t * 2 + v.e.x) * 0.08;
    if (v.spinObj && v.e.t !== 'receiver') v.spinObj.rotation.y += dt * (v.e.t === 'prism' ? 0.4 : 1.5);
    if (v.e.t === 'receiver') {
      const on = v.lit ? 1 : 0;
      v.mat.emissiveIntensity = lerp(v.mat.emissiveIntensity, on ? 3.2 + Math.sin(t * 4) * 0.4 : 0.15, damp(6, dt));
      v.crystal.rotation.y += dt * (on ? 1.6 : 0.3);
      v.crystal.position.y = BEAM_Y + (on ? Math.sin(t * 3) * 0.06 : 0);
    }
    if (v.e.t === 'relay') { v.mat.emissiveIntensity = lerp(v.mat.emissiveIntensity, v.lit ? 3 : 0.12, damp(6, dt)); v.crystal.rotation.y += dt * (v.lit ? 2 : 0.3); }
    if (v.e.t === 'beacon') {
      v.rings.forEach((rg, i) => { rg.mat.emissiveIntensity = lerp(rg.mat.emissiveIntensity, rg.on ? 3.5 : 0.1, damp(5, dt)); rg.r.rotation.z += dt * (rg.on ? 1.2 + i * 0.3 : 0.1); });
      const end = isl.gates.end && isl.gates.end.open;
      v.crownMat.emissiveIntensity = lerp(v.crownMat.emissiveIntensity, end ? 6 : 0.1, damp(1.5, dt));
      v.crown.rotation.y += dt * (end ? 1 : 0.2);
      v.column.material.opacity = lerp(v.column.material.opacity, end ? 0.35 : 0, damp(0.8, dt));
    }
  });
  /* -------- portes -------- */
  Object.values(gateViews).forEach((list) => list.forEach((v) => {
    if (v.kind === 'bridge' && v.anim !== undefined && v.group.visible && v.anim < 1) {
      v.anim += dt * 1.6;
      const k = Math.max(0, Math.min(1, v.anim)), e = 1 - Math.pow(1 - k, 3);
      v.group.position.y = lerp(-3, 0, e); v.group.scale.setScalar(Math.max(0.01, e));
      if (k > 0 && k < 0.06) { chime(392 + Math.random() * 200, 0.15, 'triangle'); }
    }
    if (v.kind === 'barrier' && v.anim > 0 && v.group.visible) {
      v.anim += dt * 1.2;
      v.group.scale.set(1 + v.anim * 0.3, Math.max(0.01, 1 - v.anim), 1 + v.anim * 0.3);
      v.mat.opacity = Math.max(0, 0.85 - v.anim);
      if (v.anim >= 1) v.group.visible = false;
    }
  }));
  /* -------- faisceaux (scintillement) -------- */
  pool.outer.forEach((m, i) => { if (m.visible) { const s = m.userData.base * (1 + Math.sin(t * 9 + i) * 0.12); m.scale.x = m.scale.z = s; } });
  pool.flare.forEach((m, i) => { if (m.visible) m.scale.setScalar(m.userData.base * (1 + Math.sin(t * 12 + i * 2) * 0.25)); });
  /* -------- décor -------- */
  decor.forEach((d) => {
    if (d.userData.cloud) { d.position.x += d.userData.v * dt; if (d.position.x > W(isl.w) + 70) d.position.x = -70; }
    else d.position.y = d.userData.base + Math.sin(t * 0.3 + d.userData.ph) * 1.2;
  });
  // pétales autour du joueur
  for (let i = 0; i < ambient.n; i++) {
    const p = ambient.pos, sd = ambient.seed[i];
    p[i * 3 + 1] -= dt * (0.35 + (sd % 1) * 0.3);
    p[i * 3] += Math.sin(t * 0.8 + sd) * dt * 0.6 + dt * 0.4;
    p[i * 3 + 2] += Math.cos(t * 0.6 + sd) * dt * 0.4;
    if (p[i * 3 + 1] < -0.5) { p[i * 3 + 1] = 8 + Math.random() * 2; p[i * 3] = S.camT.x + (Math.random() - 0.5) * 50; p[i * 3 + 2] = S.camT.z + (Math.random() - 0.5) * 50; }
  }
  ambient.pts.geometry.attributes.position.needsUpdate = true;
  sparks.update(dt);
  // la Lueur suit Lyra une fois trouvée
  const wv = Object.values(views).find((v) => v.e.t === 'wisp');
  if (wv && S.wisp) { wv.g.visible = true; wv.g.position.set(S.px - Math.sin(S.face) * 1.1 + Math.sin(t * 1.3) * 0.3, 0.6 + Math.sin(t * 2.1) * 0.15, S.pz - Math.cos(S.face) * 1.1); }
}
let lastSaveTick = 0;
const time30 = (t) => { if (t - lastSaveTick > 30) { lastSaveTick = t; return true; } return false; };
let lastPad = 0;
const updatePadThrottled = (t) => { if (t - lastPad > 1) { lastPad = t; updatePad(); } };

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt);
  if (useBloom) composer.render(); else renderer.render(scene, camera);
  // qualité automatique : si la machine peine, on allège
  if (!qualityChecked && S.mode === 'play') {
    fpsAcc += dt; fpsN++;
    if (fpsAcc > 4) {
      const fps = fpsN / fpsAcc;
      if (fps < 40 && pixelRatio > 1) { pixelRatio = 1; renderer.setPixelRatio(1); resize(); fpsAcc = 0; fpsN = 0; }
      else if (fps < 32 && useBloom) { useBloom = false; qualityChecked = true; }
      else qualityChecked = true;
    }
  }
}

/* =========================================================
   Démarrage
   ========================================================= */
resize();
$('#b-mute').innerHTML = platform.muted() ? ICON.muted : ICON.sound;
loadRun();
menu();
$('#loader').hidden = true;
requestAnimationFrame(frame);
platform.onChange(() => { if (S.mode === 'menu') menu(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (S.mode === 'play') openPause(); save(true); } });

/* Outils de test (automatisation) */
window.__lumen = {
  isl, S,
  set(id, v) { const e = isl.ents.find((x) => x.id === id); if (!e) return; if (e.t === 'mirror') e.state = v; else if (e.t === 'lantern') e.dir = v; else if (e.t === 'relay') e.out = v; const r = evaluate(isl); drawBeams(r.segs); refreshCrystals(false); r.opened.forEach(onGateOpened); save(); },
  tp(x, y) { S.px = W(x); S.pz = W(y); },
  start: () => startGame(false),
  completion,
};
