/* =========================================================
   LUMEN : les Îles Brisées — boucle de jeu et orchestration.
   Modules : engine/ (rendu, sons, commandes), world/ (vues 3D),
   game/ (état, sauvegardes, quêtes, combats), ui/ (interface),
   data/ (contenu). Ce fichier relie le tout.
   ========================================================= */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ISLANDS, HIDDEN_ISLANDS, ISLAND_META, UPCOMING } from './levels.js';
import { heightAt, setActiveIsland, hasRelief, stepOk, MAX_STEP, HU } from './altitude.js';   /* ALTITUDE */
import { lift } from './world/lift.js';
import { hole } from './world/hole.js';
import { buildIsland, evaluate, rotate, walkable, snapshot, restore, COLORS, BLOCK_TERRAIN, DIRS, postLinks, glideFrom /* ACTE IV */, clearTimers /* ACTE V */ } from './logic.js';
import { orbAct } from './mech/eau.js';   /* ACTE IV */
/* ACTE V : Les Pics du Vent */
import { initPics } from './world/pics.js';
import { createPicsMech } from './game/pics-mech.js';
import { platform } from './platform.js';
import { $, esc, fmt, hash, lerp, clamp, damp, angleTo, rand, store, bus, T, W, BEAM_Y } from './engine/util.js';
import { audio, music } from './engine/audio.js';
import { createInput } from './engine/input.js';
import { buildWorld, glow, themeOf } from './world/build.js';
import { Character } from './world/character.js';
import { Lyra } from './world/lyra.js';
import { ITEMS, UPGRADES, RECIPES } from './data/items.js';
import { ENEMIES } from './data/enemies.js';
import { NPCS } from './data/npcs.js';
import { QUESTS } from './data/quests.js';
import { SHOPS } from './data/shops.js';
import { UNLOCK_NAMES } from './data/looks.js';
import { newState, newWorld, fromRun, normalize, addItem, takeItem, stats as calcStats, xpFor, lookToModel } from './game/state.js';
import { saves } from './game/save.js';
import { createQuests } from './game/quests.js';
import { createCombat } from './game/combat.js';
import { createAct3, DESERT_AMB } from './game/acte3.js';   /* ACTE III */
import { createHud } from './ui/hud.js';
import { createScreens } from './ui/screens.js';
import { icon } from './ui/icons.js';
import { createIntro } from './ui/intro.js';
/* ACTE VI */
import { createZenithScene } from './world/zenith-scene.js';
import { createFin } from './game/fin.js';
import { globalCompletion } from './game/completion.js';

const params = new URLSearchParams(location.search);
/* Une page = une île : le voyage enregistre l'île d'arrivée puis recharge la page (voir switchIsland). */
/* Îles de test (HIDDEN_ISLANDS) : chargeables par ?ile=test-montagne (ou ?island=…), jamais proposées au joueur ni mémorisées. */
const ASKED = params.get('ile') || params.get('island');
const DEF = (ASKED && HIDDEN_ISLANDS.find((i) => i.id === ASKED)) || ISLANDS.find((i) => i.id === (ASKED || store.get('lumen.island', 'aube'))) || ISLANDS[0], IID = DEF.id;
const META = ISLAND_META[IID];
const HIDDEN = HIDDEN_ISLANDS.includes(DEF);   /* île de test : jamais de sauvegarde, jamais de voyage */
const settings = Object.assign({ quality: 'auto', master: 1, sfx: 1, music: 0.8, ambience: 0.8, voice: 0.9, muted: platform.muted() }, store.get('lumen.settings', {}));
audio.set({ master: settings.master, sfx: settings.sfx, music: settings.music, ambience: settings.ambience, voice: settings.voice, muted: settings.muted });
const TOUCH0 = matchMedia('(pointer: coarse)').matches || params.has('touch');
const NOHOLE = params.has('nohole');   /* ALTITUDE : désactive le trou de visibilité (comparaisons, tests) */
let LOW = settings.quality === 'low' || params.has('low') || (settings.quality === 'auto' && TOUCH0 && Math.min(screen.width, screen.height) < 500);

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
let useBloom = !params.has('nobloom') && !LOW;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); composer.setPixelRatio(pixelRatio); composer.setSize(w, h);
  bloom.resolution.set(w * (LOW ? 0.4 : 0.6), h * (LOW ? 0.4 : 0.6));
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: 'uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vW; void main(){ float h = normalize(vW).y; vec3 c = h > 0.0 ? mix(horizon, top, pow(min(h * 1.7, 1.0), 0.75)) : mix(horizon, bottom, pow(min(-h * 2.4, 1.0), 0.6)); gl_FragColor = vec4(c, 1.0); }',
}));
sky.renderOrder = -1; scene.add(sky);
scene.fog = new THREE.Fog(0xffffff, 75, 220);
const hemi = new THREE.HemisphereLight(0xffffff, 0x3a2f4a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2bd, 2.0);
sun.castShadow = true; sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -(LOW ? 18 : 24), right: LOW ? 18 : 24, top: LOW ? 18 : 24, bottom: -(LOW ? 18 : 24), near: 1, far: 120 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

/* Ambiances par thème : ciel (aube ↔ crépuscule), brouillard, lumières */
const AMB = {  /* ACTE III : Object.assign(AMB, DESERT_AMB) juste après */
  puzzle: { sky: null, fog: [75, 220], hemi: 1, sun: 1, tint: null },
  village: { sky: null, fog: [80, 230], hemi: 1.05, sun: 1.05, tint: null },
  lande: { sky: [['#4a3a78', '#8a7ab0', '#d9a0a8'], ['#5a7ad0', '#c0c8f0', '#f0c8b0']], fog: [50, 180], hemi: 0.95, sun: 0.95, tint: '#c9b6e8' },
  foret: { sky: [['#1f4a5a', '#5aa8a8', '#d9b0c8'], ['#4aa0d0', '#b0e8ec', '#ffe4c0']], fog: [55, 190], hemi: 1.0, sun: 0.95, tint: '#bff3ff' },
  temple: { sky: [['#0f2438', '#1d3f5a', '#2a5a7a'], ['#163048', '#2a5a7a', '#3f7a9a']], fog: [18, 80], hemi: 0.6, sun: 0.35, tint: '#8fe3ff', fogColor: '#17314a' },
  sanctuaire: { sky: [['#140f2c', '#2a1d55', '#3a2a6a'], ['#1d1640', '#3a2a6a', '#5a3f8a']], fog: [16, 75], hemi: 0.55, sun: 0.35, tint: '#9f88d8', fogColor: '#2a1d55' },
  canopee: { sky: [['#14423f', '#4fa890', '#c8d8b0'], ['#5ab8c8', '#bff0e0', '#fff0c8']], fog: [45, 160], hemi: 1.0, sun: 0.85, tint: '#c8ffe8' },
  phare_verre: { sky: [['#1a3a5a', '#5a8ac0', '#d0b8e0'], ['#6ab0e8', '#c8e8ff', '#fff4d8']], fog: [60, 210], hemi: 1.05, sun: 1.0, tint: '#d8f4ff' },
  /* ACTE IV */
  greve: { sky: [['#0c3a4a', '#2f9aa8', '#e6b8a8'], ['#3ab0d8', '#a8f0e8', '#fff0c8']], fog: [55, 190], hemi: 1.0, sun: 0.95, tint: '#c8fff0' },
  recifs: { sky: [['#0c3a4a', '#2f9aa8', '#e6b8a8'], ['#3ab0d8', '#a8f0e8', '#fff0c8']], fog: [50, 180], hemi: 1.0, sun: 0.9, tint: '#c8fff0' },
  grotte: { sky: [['#04161f', '#0a2e3a', '#10424e'], ['#06202c', '#0e3e4c', '#175a68']], fog: [14, 62], hemi: 0.6, sun: 0.3, tint: '#6ff0dc', fogColor: '#08303c' },
  lac: { sky: [['#04161f', '#0a2e3a', '#10424e'], ['#06202c', '#0e3e4c', '#175a68']], fog: [16, 70], hemi: 0.65, sun: 0.3, tint: '#6ff0dc', fogColor: '#08303c' },
  phare_abysses: { sky: [['#061c28', '#0e4050', '#1a6a78'], ['#082636', '#14586a', '#228a96']], fog: [20, 90], hemi: 0.75, sun: 0.4, tint: '#8ff8e8', fogColor: '#0a3846' },
  /* ACTE V */
  pics: { sky: [['#241f4d', '#5a5a9e', '#c8a8e0'], ['#4a5ec0', '#a8bef0', '#fff0e8']], fog: [55, 200], hemi: 1.0, sun: 0.95, tint: '#cfd8ff' },
  moulins: { sky: [['#18123a', '#2e2a66', '#4a4290'], ['#1d1848', '#3a3478', '#5a4fa0']], fog: [20, 90], hemi: 0.65, sun: 0.4, tint: '#b8acff', fogColor: '#2a2658' },
  phare_vents: { sky: [['#2a2a6a', '#6a6ac0', '#d0b8f0'], ['#6a8ae8', '#c0d0ff', '#fff4e8']], fog: [60, 210], hemi: 1.05, sun: 1.0, tint: '#e0e4ff' },
  interieur: { sky: [['#1a120e', '#2a1d18', '#3a2a22'], ['#1a120e', '#2a1d18', '#3a2a22']], fog: [14, 40], hemi: 0.75, sun: 0.25, tint: '#ffd8b0', fogColor: '#241812' },
  /* ACTE VI : citadelle blanche et dorée au-dessus des nuages */
  zenith: { sky: [['#3a2a6a', '#c88ab8', '#ffd8a0'], ['#4aa8e8', '#cfe8ff', '#fff2d0']], fog: [95, 340], hemi: 1.1, sun: 1.1, tint: '#fff4d6' },
  jardins: { sky: [['#3a2a6a', '#c88ab8', '#ffd8a0'], ['#5ab8ee', '#d8f0ff', '#fff4d8']], fog: [80, 300], hemi: 1.08, sun: 1.05, tint: '#fffbe0' },
  salle: { sky: [['#1d1636', '#3a2a5a', '#5a4a7a'], ['#2a2048', '#4a3a6a', '#7a6a9a']], fog: [20, 90], hemi: 0.7, sun: 0.4, tint: '#ffe9a8', fogColor: '#2e2448' },
  phare_zenith: { sky: [['#3a2a6a', '#c88ab8', '#ffd8a0'], ['#4aa8e8', '#cfe8ff', '#fff2d0']], fog: [120, 420], hemi: 1.1, sun: 1.0, tint: '#fff4d6' },
};
Object.assign(AMB, DESERT_AMB);   /* ACTE III */

/* =========================================================
   Monde
   ========================================================= */
const isl = buildIsland(DEF);
setActiveIsland(isl);   /* ALTITUDE : heightAt(x, z) lit le relief de cette île */
isl.frozenTimers = false;   /* ACTE V : relais temporisés actifs en jeu (les outils d’analyse les figent) */
const zones = DEF.zones;
const zoneIndex = Object.fromEntries(zones.map((z, i) => [z.id, i]));
const MAIN_GATES = zones.filter((z) => !z.secret && !z.area).map((z) => z.ents.find((e) => e.gate && !e.optional)).filter(Boolean).map((e) => e.gate);
const SECRET_GATES = zones.filter((z) => z.secret).map((z) => z.barrier);
const OPT_GATES = isl.ents.filter((e) => e.optional && e.gate).map((e) => e.gate);
const world = buildWorld(scene, isl, DEF, { low: LOW });
const zscene = IID === 'zenith' ? createZenithScene(scene, isl, zones, zoneIndex) : null;   /* ACTE VI */
const PAL = { dusk: DEF.sky.dusk.map((c) => new THREE.Color(c)), dawn: DEF.sky.dawn.map((c) => new THREE.Color(c)) };

/* Objets dont le décor est fourni par world/ : on ne dessine un secours que si rien n'a été construit
   (poteaux du grappin ; balise à couleurs personnalisées « need », ex. Phare de Verre : jaune, magenta, cyan). */
isl.ents.filter((e) => e.t === 'post').forEach((e) => {
  const v = world.views[e.id]; if (!v || v.g.children.length) return;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.3, 8), world.M.stone); base.position.y = 0.15; v.g.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.1, 6), world.M.glass); shaft.position.y = 1.3; v.g.add(shaft);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 6, 16), world.M.gold); hook.position.y = 2.25; hook.rotation.x = Math.PI / 2; v.g.add(hook);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), glow('#bff3ff', 3)); gem.position.y = 2.25; v.g.add(gem); v.float = gem; v.spinObj = gem;
  v.g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') o.castShadow = true; });
});
isl.ents.filter((e) => e.t === 'beacon' && e.need).forEach((e) => {
  const v = world.views[e.id];
  if (v && v.rings && !v.rings.every((r, i) => r.c === e.need[i])) v.rings.forEach((r, i) => { const c = e.need[i] || r.c; r.c = c; r.mat.color.set(COLORS[c]); r.mat.emissive.set(COLORS[c]); });
});

/* ACTE V : visuels des Pics du Vent (pierres de vent, dalles, moulins, portails…) */
const pics = initPics({ world, scene, isl, DEF });

/* Cristaux de voyage */
const WARPS_BY = {
  aube: [
    { id: 'havre', name: 'Fontaine de Havre-Aube', zone: 'havre', cell: [15, 12], arrive: [15, 15], r: 4.6, where: 'Havre-Aube' },
    { id: 'rivage', name: 'Cristal du Rivage', zone: 'z1', cell: [3, 5], arrive: [4, 5], r: 2.2, where: 'Le Rivage' },
    { id: 'sanctuaire', name: 'Hall du Sanctuaire', zone: 'sanctuaire', cell: [15, 4], arrive: [15, 6], r: 2.2, where: 'Le Sanctuaire de Brume', needs: (st) => st.flags.boss_colosse, mesh: true },
    { id: 'phare', name: 'Cristal du Phare', zone: 'phare', cell: [3, 3], arrive: [4, 4], r: 2.2, where: 'Le Phare de l’Aube', needs: () => isl.gates.end && isl.gates.end.open, mesh: true },
  ],
  /* ACTE IV : Les Abysses Miroirs */
  abysses: [
    { id: 'greve', name: 'Cristal de la Grève', zone: 'greve', cell: [15, 12], arrive: [15, 15], r: 4.6, where: 'La Grève' },
    { id: 'lac', name: 'Cristal du Lac', zone: 'lac1', cell: [1, 8], arrive: [2, 7], r: 2.2, where: 'Le Lac souterrain' },
    { id: 'grottes', name: 'Hall des Grottes', zone: 'grottes', cell: [15, 5], arrive: [15, 6], r: 2.2, where: 'Les Grottes Miroirs', needs: (st) => st.flags.boss_marees, mesh: true },
    { id: 'phare', name: 'Cristal du Phare des Abysses', zone: 'phare_a', cell: [1, 3], arrive: [2, 3], r: 2.2, where: 'Le Phare des Abysses', needs: () => isl.gates.gr_arene && isl.gates.gr_arene.open, mesh: true },
    { id: 'ilots', name: 'Cristal des Îlots', zone: 'ilots', cell: [9, 5], arrive: [10, 5], r: 2.2, where: 'Les Îlots du Reflet', needs: () => isl.gates.b_ilots && isl.gates.b_ilots.open, mesh: true },
  ],
  foret: [
    { id: 'vitrebourg', name: 'Fontaine de Vitrebourg', zone: 'vitrebourg', cell: [15, 12], arrive: [15, 15], r: 4.6, where: 'Vitrebourg' },
    { id: 'vitraux', name: 'Cristal des Vitraux', zone: 'f1', cell: [5, 8], arrive: [5, 9], r: 2.2, where: 'Les Salles de Vitraux' },
    { id: 'portique', name: 'Cristal du Portique', zone: 'sentier_t', cell: [4, 26], arrive: [3, 26], r: 2.2, where: 'Le Sentier du Portique', mesh: true },   /* MONTAGNE */
    { id: 'belvedere', name: 'Cristal du Belvédère', zone: 'belv', cell: [3, 5], arrive: [4, 5], r: 2.2, where: 'Le Belvédère de Verre', needs: () => isl.gates.fg3 && isl.gates.fg3.open, mesh: true },
    { id: 'temple', name: 'Hall du Temple', zone: 'temple', cell: [15, 4], arrive: [15, 6], r: 2.2, where: 'Le Temple de Verre', needs: (st) => st.flags.boss_verre, mesh: true },
    { id: 'canopee', name: 'Cristal de la Canopée', zone: 'can1', cell: [3, 3], arrive: [4, 4], r: 2.2, where: 'La Canopée', mesh: true },
    { id: 'phare', name: 'Cristal du Phare de Verre', zone: 'phare_f', cell: [3, 10], arrive: [4, 10], r: 2.2, where: 'Le Phare de Verre', needs: () => isl.gates.fc2 && isl.gates.fc2.open, mesh: true },
  ],
  /* ACTE III */
  desert: [
    { id: 'cite', name: 'Fontaine de la Cité', zone: 'cite', cell: [15, 12], arrive: [15, 15], r: 4.6, where: 'La Cité des Échos' },
    { id: 'salles', name: 'Cristal des salles de sable', zone: 'd1', cell: [1, 8], arrive: [2, 7], r: 2.2, where: 'Les salles de sable', mesh: true },
    { id: 'dunes', name: 'Cristal des Dunes', zone: 'dunes', cell: [6, 6], arrive: [7, 6], r: 2.2, where: 'Les Dunes', mesh: true },
    { id: 'temple_d', name: 'Hall du Temple enseveli', zone: 'temple_d', cell: [15, 4], arrive: [15, 6], r: 2.2, where: 'Le Temple enseveli', needs: (st) => st.flags.boss_echos, mesh: true },
    { id: 'phare_v', name: 'Cristal du vestibule', zone: 'ph_vest', cell: [3, 5], arrive: [4, 5], r: 2.2, where: 'Le vestibule du Phare', mesh: true },
    { id: 'phare_d', name: 'Cristal du Phare des Sables', zone: 'phare_d', cell: [3, 10], arrive: [4, 10], r: 2.2, where: 'Le Phare des Sables', mesh: true },
  ],
};
/* ACTE VI */
WARPS_BY.zenith = [
  { id: 'porte', name: 'Fontaine de la Porte', zone: 'porte', cell: [15, 12], arrive: [15, 15], r: 4.6, where: 'La Porte du Zénith' },
  { id: 'jardins', name: 'Cristal des Jardins', zone: 'jardins', cell: [3, 6], arrive: [4, 6], r: 2.2, where: 'Les Jardins célestes', needs: () => isl.gates.zg3 && isl.gates.zg3.open, mesh: true },
  { id: 'salle', name: 'Hall de la Grande Salle', zone: 'salle', cell: [15, 5], arrive: [15, 6], r: 2.2, where: 'La Grande Salle', needs: (st) => st.flags.boss_zenith, mesh: true },
  { id: 'phare', name: 'Cristal du Phare du Zénith', zone: 'phare_z', cell: [3, 10], arrive: [4, 10], r: 2.2, where: 'Le Phare du Zénith', needs: () => isl.gates.b_zenith && isl.gates.b_zenith.open, mesh: true },
];
/* ACTE V */
WARPS_BY.pics = [
  { id: 'col', name: 'Cairn du Col', zone: 'col', cell: [15, 12], arrive: [15, 15], r: 4.6, where: 'Le Col' },
  { id: 'courants', name: 'Cristal des Courants', zone: 'cr1', cell: [1, 8], arrive: [2, 7], r: 2.2, where: 'Les Courants' },
  { id: 'terrasse', name: 'Cristal de la Terrasse', zone: 'gir', cell: [3, 5], arrive: [4, 5], r: 2.2, where: 'La Terrasse des Girouettes', needs: () => isl.gates.pg3 && isl.gates.pg3.open, mesh: true },
  { id: 'moulins', name: 'Hall du Moulin', zone: 'moulins', cell: [15, 4], arrive: [15, 6], r: 2.2, where: 'Le Moulin du Grand Meunier', needs: (st) => st.flags.boss_meunier, mesh: true },
  { id: 'neve', name: 'Cristal du Névé', zone: 'so1', cell: [10, 3], arrive: [10, 4], r: 2.2, where: 'Le Névé', needs: () => isl.gates.b_sommets && isl.gates.b_sommets.open, mesh: true },
  { id: 'cretes', name: 'Cristal des Crêtes', zone: 'so3', cell: [2, 3], arrive: [2, 4], r: 2.2, where: 'Les Crêtes', needs: () => isl.gates.lf1 && isl.gates.lf1.open, mesh: true },
  { id: 'phare', name: 'Cristal du Phare des Vents', zone: 'phare_v', cell: [3, 10], arrive: [4, 10], r: 2.2, where: 'Le Phare des Vents', needs: () => isl.gates.lf3 && isl.gates.lf3.open, mesh: true },
];
const WARPS = WARPS_BY[IID] || [];
const warpMeshes = {};
WARPS.filter((w) => w.mesh).forEach((w) => {
  const z = zones[zoneIndex[w.zone]];
  const g = new THREE.Group(); g.position.set(W(z.ox + w.cell[0]), heightAt(W(z.ox + w.cell[0]), W(z.oy + w.cell[1])), W(z.oy + w.cell[1]));
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 0.4, 8), world.M.stone); base.position.y = 0.2; g.add(base);
  const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), new THREE.MeshStandardMaterial({ color: '#bff3ff', emissive: '#7fdcff', emissiveIntensity: 1.5, flatShading: true }));
  cr.position.y = 1.3; cr.scale.y = 1.5; g.add(cr); g.userData.cr = cr; g.visible = false;
  world.zoneGroups[zoneIndex[w.zone]].add(g); warpMeshes[w.id] = g;
});

/* =========================================================
   État et contexte partagé
   ========================================================= */
const ev = bus();
let st = newState();
let slot = 'auto';
const P = { x: 0, y: 0, gy: 0, z: 0, vx: 0, vz: 0, face: 0, alive: true, dodging: false, dodgeT: 0, dodgeCD: 0, iframes: 0, swing: null, swingCD: 0, combo: 0, comboT: 0, chargeT: 0, spinT: 0, hurtT: 0, kbx: 0, kbz: 0, regenT: 0, buffRegen: 0 };
/* CAMÉRA FIXE : le jeu normal regarde toujours vers le nord (haut de l'écran = nord = −z). Plus aucune rotation par le joueur ;
   S.yaw / S.yawT restent utilisables en interne (cinématiques, tests) et la conversion des commandes les respecte. */
const CAM_YAW = 0, CAM_PITCH = 0.95;
const S = { mode: 'title', zone: -1, zoneT: 0, time: 0, yaw: CAM_YAW, yawT: CAM_YAW, pitch: CAM_PITCH, dist: TOUCH0 ? 12 : 17, camT: new THREE.Vector3(), shake: 0, hitstop: 0, restore: 0, restoreT: 0, wardrobe: false, finale: null, talkTo: null, boss: null, hints: {}, lastSave: 0, ambT: null };
const G = {
  scene, camera, isl, zones, def: DEF, P, audio, emit: ev.emit, on: ev.on, upcoming: UPCOMING.filter((u) => u.num > DEF.num && !ISLANDS.some((i) => i.num === u.num)), meta: META /* ACTE IV */,   /* ACTE V : filtre des îles à venir */
  get st() { return st; },
  stats: () => calcStats(st), xpFor,
};
const input = createInput(canvas, { onBlur: () => { if (S.mode === 'play') G.screens.menu('options'); } });
G.input = input;
const sparks = createSparks();
G.sparks = sparks;
G.hud = createHud(G);
G.ui = G.hud;   // le combat affiche dégâts, barres d'ennemis et barre de boss via G.ui
G.quests = createQuests(G);
G.combat = createCombat(G);
G.screens = createScreens(G);
G.saves = saves;
const hud = G.hud, quests = G.quests, combat = G.combat, screens = G.screens;
const fin = zscene ? createFin(G, { S, scene3: zscene, setTouch, platform, IID, music, camera }) : null;   /* ACTE VI */
G.fin = fin;

/* ---------- Requêtes (dialogues, boutiques, quêtes) ---------- */
G.counts = (what) => {
  if (what === 'pages') return isl.ents.filter((e) => e.t === 'page' && ['orin1', 'orin2', 'orin3'].includes(e.page) && st.world.picked[e.id]).length;
  if (what === 'shards') return isl.ents.filter((e) => e.t === 'shard' && st.world.picked[e.id]).length;
  if (what === 'lampions') return Object.keys(st.world.lamps).filter((k) => !k.startsWith('fanion')).length;
  if (what === 'fanions') return Object.keys(st.world.lamps).filter((k) => k.startsWith('fanion')).length;   /* ACTE V */
  if (what === 'kills') { const id = quests.active().find((q) => { const s0 = quests.step(q); return s0 && s0.type === 'kill'; }); const r = id && st.quests[id]; return r ? st.stats.kills - (r.base.kills || 0) : 0; }
  if (what === 'eclats') return st.inv.eclat_verre || 0;
  if (what === 'graines') return st.inv.graine_canopee || 0;
  return 0;
};
G.countAll = (t) => isl.ents.filter((e) => e.t === t).length;
G.isGateOpen = (id) => !!(isl.gates[id] && isl.gates[id].open);
G.zoneId = () => (zones[S.zone] ? zones[S.zone].id : null);
G.q = () => ({ flag: (f) => !!st.flags[f], quest: (id) => quests.state(id), step: (id) => quests.stepId(id), has: (id, n = 1) => (st.inv[id] || 0) >= n, count: G.counts });
G.account = () => platform.account();
G.legacyRun = () => platform.loadRun(IID);
G.quality = () => settings.quality;
G.setQuality = (q) => { settings.quality = q; store.set('lumen.settings', settings); hud.toast('⚙', 'Qualité modifiée', 'Recharge la page pour l’appliquer entièrement.'); useBloom = q !== 'low'; };
G.saveSettings = () => { Object.assign(settings, audio.get()); store.set('lumen.settings', settings); };
G.pageList = () => Object.keys(DEF.pages).map((id) => ({ id, title: DEF.pages[id].title, found: isl.ents.some((e) => e.t === 'page' && e.page === id && st.world.picked[e.id]) || !!st.world.picked['page_' + id] }));
G.helpHtml = () => input.touch
  ? '<p><b>Joystick</b> (gauche) : marcher · <b>pincer</b> : zoom (la caméra est fixe, le haut de l’écran est le nord)</p><p><b>⚔</b> attaque (maintenir : coup chargé) · <b>✦</b> Onde de lumière · <b>⤳</b> esquive · <b>✋</b> interagir (appui long : sens inverse) · <b>♥</b> objet rapide</p>'
  : '<p><b>ZQSD / WASD / flèches</b> : marcher · <b>molette</b> : zoom (caméra fixe : le haut de l’écran est le nord)</p><p><b>Clic gauche / K</b> : attaque (maintenir : coup chargé) · <b>Clic droit / L</b> : Onde de lumière · <b>Espace / Maj</b> : esquive</p><p><b>E</b> : interagir · <b>R</b> : tourner dans l’autre sens · <b>F</b> : objet rapide · <b>I</b> inventaire · <b>J</b> journal · <b>M</b> carte · <b>C</b> personnage · <b>Échap</b> : menu</p>';

/* =========================================================
   Lyra et Fia
   ========================================================= */
const hero = new Lyra(lookToModel(st.look));   // nouveau modèle de Lyra (facetté, contours noirs, Fia intégrée)
scene.add(hero.root);
hero.root.traverse((o) => { if (o.isMesh && !o.userData.noShadow) o.castShadow = true; });
G.lift = lift; G.hole = hole;
lift.add(hero.root, () => P.gy);   /* ALTITUDE : P.y = hauteur au-dessus du sol, P.gy = sol sous Lyra (mis à jour chaque image) */
const fia = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glow('#fff0c2', 5)); scene.add(fia);
fia.visible = false;   // Fia fait désormais partie du modèle de Lyra
const fiaLight = new THREE.PointLight(0xffd9a0, LOW ? 0 : 6, 8, 2); scene.add(fiaLight); lift.add(fiaLight);
const chargeRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fe9ff').multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false }));
chargeRing.rotation.x = -Math.PI / 2; scene.add(chargeRing); lift.add(chargeRing);
const selRing = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.045, 6, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc861).multiplyScalar(2.6), transparent: true, opacity: 0.9 }));
selRing.rotation.x = Math.PI / 2; selRing.visible = false; scene.add(selRing); lift.add(selRing);
G.applyLook = () => { hero.build(lookToModel(st.look)); hero.root.traverse((o) => { if (o.isMesh && !o.userData.noShadow) o.castShadow = true; }); updateWeaponModel(); };
function updateWeaponModel() { const w = ITEMS[st.equip.weapon]; hero.setWeapon(w ? w.model : null); }

/* =========================================================
   Habitants
   ========================================================= */
const npcs = [];
zones.forEach((z, zi) => (z.npcs || []).forEach((n) => {
  const d = NPCS[n.id]; if (!d) return;
  const c = new Character(d.look);
  if (d.look.staff) c.arms[0].rotation.x = -0.3;
  const x = W(z.ox + n.x), zz = W(z.oy + n.y);
  c.root.position.set(x, 0, zz);
  c.root.rotation.y = n.face === 'N' ? Math.PI : n.face === 'E' ? Math.PI / 2 : n.face === 'W' ? -Math.PI / 2 : 0;
  world.zoneGroups[zi].add(c.root); lift.add(c.root);
  const mk = new THREE.Group();
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc861').multiplyScalar(2.4) }));
  gem.scale.y = 1.6; mk.add(gem); mk.visible = false; world.zoneGroups[zi].add(mk); lift.add(mk);
  npcs.push({ id: n.id, d, c, zi, x, z: zz, hx: x, hz: zz, face: c.root.rotation.y, baseFace: c.root.rotation.y, wander: n.wander || 0, counter: !!n.counter, mk, gem, wt: rand(1, 4), tx: x, tz: zz, talking: false });
}));
function npcMarkers() {
  npcs.forEach((n) => {
    const turnIn = quests.waitingAt(n.id), offer = quests.offeredBy(n.id);
    n.mk.visible = !!(turnIn || offer);
    if (n.mk.visible) n.gem.material.color.set(turnIn ? '#9fe9ff' : '#ffc861').multiplyScalar(2.4);
  });
}

/* =========================================================
   Application de l'état sauvegardé au monde
   ========================================================= */
function applyWorld() {
  isl.portalsOff = !st.player.abilities.portails;   /* ACTE VI : sans la capacité, les portails sont éteints */
  // remise à zéro de l'île logique
  restore(isl, isl.initial);
  for (let y = 0; y < isl.h; y++) for (let x = 0; x < isl.w; x++) { const t0 = DEF.zones[isl.zoneAt[y][x]]; if (!t0) continue; const ch = t0.map[y - t0.oy] && t0.map[y - t0.oy][x - t0.ox]; if (ch === 'r' || ch === 'c') isl.terrain[y][x] = ch; }
  Object.values(isl.gates).forEach((g) => (g.open = false));
  clearTimers(isl);   /* ACTE V */
  restore(isl, { dev: st.world.dev, gates: st.world.gates, pos: st.world.moved });   /* ACTE III : objets portés */
  Object.entries(DEF.gateLinks || {}).forEach(([from, to]) => { if (isl.gates[from] && isl.gates[from].open) to.forEach((id) => { if (isl.gates[id]) { isl.gates[id].open = true; st.world.gates[id] = 1; } }); });   /* MONTAGNE : portes liées (le raccourci de la Cascade s’ouvre avec le 3e vitrail) */
  Object.keys(st.world.cut).forEach((k) => { const [x, y] = k.split(',').map(Number); isl.terrain[y][x] = ','; world.removeCell('r', x, y); });
  Object.keys(st.world.broken).forEach((k) => { const [x, y] = k.split(',').map(Number); isl.terrain[y][x] = ','; world.removeCell('c', x, y); });
  Object.values(world.views).forEach((v) => { if (v.head && v.target) v.head.rotation.y = v.target(); if (v.pick) v.g.visible = !st.world.picked[v.e.id]; });
  Object.values(isl.gates).forEach((g) => world.setGateView(g, g.open, true));
  Object.values(world.chestViews).forEach((cv) => { cv.open = !!st.world.chests[cv.c.id]; cv.anim = cv.open ? 1 : 0; cv.lid.rotation.x = cv.open ? -1.9 : 0; });
  Object.values(world.pickupViews).forEach((pv) => (pv.g.visible = !st.world.picked['pk_' + pv.pk.id]));
  // objets bloquants : coffres
  isl.solid.clear();
  Object.values(world.chestViews).forEach((cv) => isl.solid.add(cv.x + ',' + cv.y));
  world.props.forEach((pr) => { if (pr.p.t === 'lamp') setLamp(pr, !!st.world.lamps[pr.p.id]); });
  const res = evaluate(isl);
  world.drawBeams(res.segs); refreshCrystals(true);
  syncGates();
  updateChestVisibility();
  A3.applyWorld();   /* ACTE III */
  S.restore = S.restoreT = restoreLevel();
}
function syncGates() { const sn = snapshot(isl); st.world.dev = sn.dev; st.world.moved = sn.pos;   /* ACTE III */ Object.values(isl.gates).forEach((g) => { if (g.open) st.world.gates[g.id] = 1; }); }
function updateChestVisibility() {
  Object.values(world.chestViews).forEach((cv) => { const ok = !cv.c.after || st.flags[cv.c.after]; cv.g.visible = ok; if (!ok) isl.solid.delete(cv.x + ',' + cv.y); else isl.solid.add(cv.x + ',' + cv.y); });
  WARPS.forEach((w) => { if (warpMeshes[w.id]) warpMeshes[w.id].visible = !w.needs || !!w.needs(st); });
}
function setLamp(pr, on) { const u = pr.g.userData; if (!u.lampMat) return; u.lampMat.emissiveIntensity = on ? 2.4 : 0; u.lit = on; }
function restoreLevel() {
  const done = MAIN_GATES.filter((g) => isl.gates[g] && isl.gates[g].open && g !== 'end').length + (META.restoreBoss && st.flags[META.boss] ? 1 : 0);
  return isl.gates.end && isl.gates.end.open ? 1 : 0.15 + (done / Math.max(1, MAIN_GATES.length + (META.restoreBoss ? 1 : 0))) * 0.7;
}

/* ---------- Cristaux ---------- */
const snd = (n, o) => { try { audio.sfx(n, o); } catch (e) { /* le son ne doit jamais casser le jeu */ } };
/* ACTE III : porter, tempêtes de sable, Orbe (voir game/acte3.js) */
const A3 = createAct3(G, { S, P, isl, world, zones, zoneIndex, IID, hud, audio, snd, sparks, scene, fiaLight, fade, reEvaluate: () => reEvaluate(), openGate: (id) => openGate(id), autosave: () => autosave() });
G.a3 = A3; G.islands = ISLANDS;
let beamsOn = false;
const litBefore = {};
function refreshCrystals(silent) {
  isl.ents.forEach((e) => {
    const v = world.views[e.id];
    if (e.t === 'receiver') { v.lit = e.lit; if (e.lit && !litBefore[e.id] && !silent) { audio.sfx('receiver', { color: e.color }); sparks.burst(new THREE.Vector3(W(e.x), BEAM_Y, W(e.y)), COLORS[e.color], 24, 3, 1.5); } }
    else if (e.t === 'relay') { v.lit = !!e.emit; if (v.lit) { v.mat.emissive.set(COLORS[e.emit]); v.mat.color.set(COLORS[e.emit]); } else { v.mat.emissive.set('#ffffff'); v.mat.color.set('#f3e9ff'); } if (e.lit && !litBefore[e.id] && !silent) audio.sfx('relay', { color: e.emit }); }
    else if (e.t === 'beacon') { const prevG = litBefore['g:' + e.id] || ''; (e.got || []).forEach((c) => { if (!silent && !prevG.includes(c)) { try { audio.note(c); } catch (er) { /* rien */ } } }); litBefore['g:' + e.id] = (e.got || []).join(''); v.rings.forEach((r) => (r.on = (e.got || []).includes(r.c))); v.lit = e.lit; }
    litBefore[e.id] = e.lit;
  });
}
function reEvaluate() {
  const res = evaluate(isl);
  world.drawBeams(res.segs); refreshCrystals(false);
  { const on = res.segs.length > 0; if (on !== beamsOn) { snd(on ? 'beam_on' : 'beam_off'); beamsOn = on; } }
  res.opened.forEach(onGateOpened);
  syncGates();
}
/* Ponts vers les donjons (Sanctuaire de Brume, Temple de Verre) : ils se déploient quand Lyra
   arrive au bout du chemin, devant l'arche (après avoir franchi la haie de ronces). */
const APPROACH_BRIDGES = { b_sanct: 'Le pont du Sanctuaire se déploie', b_temple: 'Le portique du Temple s’ouvre', b_temple_d: 'Le pont du Temple enseveli se déploie' /* ACTE III */, b_moulins: 'Le pont du Moulin se déploie', b_so2: 'Le pont de la Dalle se déploie', b_so4: 'Le pont du Souffle court se déploie' /* ACTE V */, b_salle: 'Le grand escalier de la Grande Salle se déploie' /* ACTE VI */ };
function approachBridges() {
  Object.keys(APPROACH_BRIDGES).forEach((id) => {
    const g = isl.gates[id]; if (!g || g.open) return;
    if (!g.cells.some(([x, y]) => Math.hypot(W(x) - P.x, W(y) - P.z) < 5.5)) return;
    openGate(id);
    hud.toast('✦', APPROACH_BRIDGES[id], 'Fia illumine les planches une à une.');
    autosave();
  });
}
function openGate(id, quiet) {
  const g = isl.gates[id]; if (!g || g.open) return;
  g.open = true; st.world.gates[id] = 1;
  world.setGateView(g, true, false);
  ((DEF.gateLinks || {})[id] || []).forEach((l) => { const lg = isl.gates[l]; if (lg && !lg.open) { lg.open = true; st.world.gates[l] = 1; world.setGateView(lg, true, false); hud.toast('✦', 'Un raccourci s’ouvre vers le bas', 'La descente jusqu’au village est libre.'); } });   /* MONTAGNE */
  if (!quiet) { audio.sfx(g.look === 'door' ? 'door' : 'chest'); g.cells.forEach(([x, y]) => sparks.burst(new THREE.Vector3(W(x), 0.6, W(y)), g.look === 'seal' ? '#b39cff' : '#9fe9ff', 10, 2.5, 2)); }
  quests.check();
}
function onGateOpened(id) {
  const g = isl.gates[id];
  world.setGateView(g, true, false);
  st.world.gates[id] = 1;
  ((DEF.gateLinks || {})[id] || []).forEach((l) => { const lg = isl.gates[l]; if (lg && !lg.open) { lg.open = true; st.world.gates[l] = 1; world.setGateView(lg, true, false); setTimeout(() => hud.toast('✦', 'Un raccourci s’ouvre vers le bas', 'L’escalier de la Cascade descend jusqu’au village.'), 2600); } });   /* MONTAGNE */
  if (id === 'end') { S.restoreT = 1; if (fin) startEnding(false); else startFinale(); quests.check(); return; }   /* ACTE VI : séquence de fin du jeu */
  if (id === 'sd_light') { audio.chord([523, 659, 784]); hud.toast('✦', 'La barrière de cristal se dissout', 'Le Sanctuaire révèle un passage.'); reward('g:sanct:light', 80, 25); quests.check(); return; }
  if ((DEF.stageGates || []).includes(id)) {   // portes d'étape (Branches basses, Phare de Verre)
    audio.chord([523, 659, 784], 0.1); audio.sfx('barrier');
    { const gt = (DEF.gateText || {})[id]; hud.toast('✦', gt ? gt[0] : id === 'fc0' ? 'Le pont des Feuilles se forme' : 'Une porte de verre s’ouvre', gt ? gt[1] : id === 'fc0' ? 'La lumière a trouvé son cristal.' : 'Une salle de plus. Les objets de la suivante sont à portée.'); }   /* ACTE V : textes propres à l’île */
    reward('g:' + IID + ':' + id, 80, 25); gainXp(20);
    g.cells.forEach(([x, y]) => sparks.burst(new THREE.Vector3(W(x), 0.6, W(y)), '#9fe9ff', 14, 2.5, 2));
    S.restoreT = restoreLevel(); quests.check(); autosave(); return;
  }
  const kind = SECRET_GATES.includes(id) ? 'treasure' : OPT_GATES.includes(id) ? 'secret' : 'main';
  if (kind === 'main') {
    audio.chord([523, 659, 784]); audio.sfx('puzzle_solved');
    const z = zones.find((zz) => zz.ents.some((e) => e.gate === id && !e.optional));
    hud.toast('✦', `${z ? z.title : 'Énigme'} : résolue`, g.kind === 'bridge' ? 'Un pont de lumière se forme.' : 'La barrière de cristal se dissout.');
    reward('g:' + IID + ':' + id, 120, 40); gainXp(25);
  } else if (kind === 'secret') {
    audio.chord([587, 740, 880, 1175]); snd('secret'); hud.toast('✧', 'Un passage secret s’ouvre', 'Un pont mène à une chambre cachée.'); reward('o:' + IID + ':' + id, 60, 20); gainXp(15);
  } else {
    audio.chord([659, 784, 988, 1319]); snd('secret'); hud.toast('◆', 'Chambre secrète résolue', 'La barrière de cristal se dissout.'); reward('g:' + IID + ':' + id, 200, 60); gainXp(40);
  }
  g.cells.forEach(([x, y]) => sparks.burst(new THREE.Vector3(W(x), 0.4, W(y)), '#9fe9ff', 8, 2.5, 2));
  S.restoreT = restoreLevel();
  quests.check();
  autosave();
}

/* =========================================================
   Récompenses, XP, objets
   ========================================================= */
function reward(key, xp, coins) {
  const r = platform.reward(key, xp, coins);
  if (!r) return;
  setTimeout(() => hud.toast(icon('star'), [r.xp ? `+${fmt(r.xp)} XP` : '', r.coins ? `+${fmt(r.coins)} pièces` : ''].filter(Boolean).join(' · '), 'Prism Arcade', 'reward'), 600);
  if (r.levelUp) setTimeout(() => hud.toast('⬆️', `Niveau ${r.levelUp} sur Prism Arcade !`, '', 'reward'), 1500);
}
G.reward = (qid) => {
  const q = QUESTS[qid], r = q.rewards;
  audio.sfx('quest');
  hud.banner(q.kind === 'main' ? 'Quête principale terminée' : 'Quête terminée', q.title);
  if (r.ecus) addEcus(r.ecus, true);
  Object.entries(r.items || {}).forEach(([id, n]) => giveItem(id, n, true));
  (r.unlock || []).forEach((u) => unlock(u));
  if (r.xp) gainXp(r.xp);
  if (r.pa) reward('q:' + qid, r.pa[0], r.pa[1]);
  const parts = [r.xp ? `+${r.xp} XP` : '', r.ecus ? `+${r.ecus} écus` : '', ...Object.entries(r.items || {}).map(([id, n]) => `${ITEMS[id].name}${n > 1 ? ' ×' + n : ''}`)].filter(Boolean);
  hud.toast('🏆', q.title, parts.join(' · '), 'reward');
  autosave();
};
function gainXp(n) {
  const p = st.player; p.xp += n;
  while (p.xp >= xpFor(p.lvl)) {
    p.xp -= xpFor(p.lvl); p.lvl++;
    const s = calcStats(st); p.hp = s.maxHp; p.en = s.maxEn;
    audio.sfx('level'); hud.banner('Niveau supérieur', `Niveau ${p.lvl}`);
    sparks.burst(new THREE.Vector3(P.x, 1, P.z), '#ffe2a0', 60, 4, 4, 2);
    hud.toast('⬆️', `Niveau ${p.lvl}`, 'Vie et énergie restaurées, statistiques en hausse.', 'reward');
    if (p.lvl >= 3 && !p.abilities.charge) { p.abilities.charge = true; setTimeout(() => hud.toast('✦', 'Nouvelle capacité : Coup chargé', input.touch ? 'Maintiens ⚔ puis relâche.' : 'Maintiens l’attaque puis relâche.', 'reward'), 1600); }
  }
}
G.gainXp = gainXp;
function addEcus(n, quiet) { st.player.ecus += n; if (!quiet) audio.sfx('coin'); }
function giveItem(id, n = 1, quiet) {
  const it = ITEMS[id]; if (!it) return;
  if (it.instant && id === 'fragment_coeur') {
    st.player.fragments += n; const s = calcStats(st); st.player.hp = s.maxHp;
    audio.sfx('heal'); hud.toast(icon('heart'), 'Fragment de cœur !', '+15 points de vie maximum.', 'reward'); return;
  }
  const got = addItem(st, id, n);
  if (!got && !quiet) return;
  if (!quiet && (it.cat === 'cle' || /^cle_|_cle$|^cle/.test(id))) snd('key');
  if (!quiet) hud.toast(icon(it.icon), `${it.name}${n > 1 ? ' ×' + n : ''}`, it.cat === 'quete' ? 'Objet de quête' : '', 'reward');
  if (it.tip) { audio.sfx('quest'); setTimeout(() => { hud.banner(it.name, 'Nouvel objet'); setTimeout(() => hud.toast('💡', it.name, it.tip), 1400); }, 700); }
  // première arme / armure : équiper automatiquement
  if (it.cat === 'arme' && !st.equip.weapon) G.equip(id, true);
  if (it.cat === 'armure' && !st.equip.armor) G.equip(id, true);
  quests.check();
}
function unlock(u) { if (st.unlocks[u]) return; st.unlocks[u] = 1; hud.toast('✨', 'Apparence débloquée', UNLOCK_NAMES[u] || u, 'reward'); }
G.collectDrop = (id, n) => { if (id === 'ecus') { addEcus(n); hud.update(); } else { addItem(st, id, n); audio.sfx('pickup'); hud.damage(P.x, 2, P.z, '+' + ITEMS[id].name, 'loot'); quests.check(); } };
G.equip = (id, quiet) => {
  const it = ITEMS[id]; if (!it || !st.inv[id]) return;
  if (it.cat === 'arme') st.equip.weapon = id;
  else if (it.cat === 'armure') st.equip.armor = id;
  else if (it.cat === 'accessoire') { if (st.equip.acc1 && st.equip.acc2) st.equip.acc2 = id; else if (!st.equip.acc1) st.equip.acc1 = id; else st.equip.acc2 = id; }
  updateWeaponModel();
  const s = calcStats(st); st.player.hp = Math.min(st.player.hp, s.maxHp); st.player.en = Math.min(st.player.en, s.maxEn);
  if (!quiet) audio.sfx('ui');
  hud.refresh();
};
G.unequip = (id) => { ['acc1', 'acc2'].forEach((k) => { if (st.equip[k] === id) st.equip[k] = null; }); hud.refresh(); };
G.useItem = (id) => {
  const it = ITEMS[id]; if (!it || it.cat !== 'conso' || !st.inv[id]) return false;
  const s = calcStats(st), p = st.player;
  if (it.heal && p.hp >= s.maxHp && !it.energy) { hud.toast('♥', 'Ta vie est déjà au maximum'); audio.sfx('deny'); return false; }
  if (it.energy && !it.heal && p.en >= s.maxEn) { hud.toast('✦', 'Ton énergie est déjà au maximum'); audio.sfx('deny'); return false; }
  takeItem(st, id, 1);
  if (it.heal) { p.hp = Math.min(s.maxHp, p.hp + it.heal); hud.damage(P.x, 2.2, P.z, '+' + it.heal, 'heal'); }
  if (it.energy) p.en = Math.min(s.maxEn, p.en + it.energy);
  if (it.regen) P.buffRegen = it.regen;
  audio.sfx('heal'); sparks.burst(new THREE.Vector3(P.x, 1, P.z), it.energy && !it.heal ? '#9fe9ff' : '#ff9ec7', 24, 2, 2);
  hud.refresh();
  return true;
};
G.useQuick = () => { const id = st.equip.quick; if (!id || !st.inv[id]) { const alt = ['potion', 'grande_potion', 'pain_miel'].find((x) => st.inv[x]); if (alt) { st.equip.quick = alt; return G.useItem(alt); } hud.toast('♥', 'Aucun objet rapide', 'Achète des potions chez Ysolde.'); audio.sfx('deny'); return false; } return G.useItem(id); };

/* ---------- Boutiques et forge ---------- */
G.shopStock = (id) => {
  const sh = SHOPS[id];
  st.shops[id] = st.shops[id] || {};
  sh.items.forEach((r) => { if (r.id && st.shops[id][r.id] === undefined) st.shops[id][r.id] = r.stock === undefined ? null : r.stock; });
  return st.shops[id];
};
G.buy = (shopId, x) => {
  if (!x || x.out || x.owned) return false;
  if (st.player.ecus < x.price) { audio.sfx('deny'); hud.toast(icon('coin'), 'Pas assez d’écus', `Il te manque ${x.price - st.player.ecus} écus.`); return false; }
  st.player.ecus -= x.price;
  if (x.r.unlock) unlock(x.r.unlock);
  else { const stock = G.shopStock(shopId); if (stock[x.r.id] !== null && stock[x.r.id] !== undefined) stock[x.r.id]--; addItem(st, x.r.id, 1); if (ITEMS[x.r.id].cat === 'arme' || ITEMS[x.r.id].cat === 'armure') hud.toast(icon(ITEMS[x.r.id].icon), ITEMS[x.r.id].name, 'Équipe-le depuis l’inventaire (I).', 'reward'); }
  audio.sfx('buy'); quests.check(); hud.refresh();
  return true;
};
G.sell = (id) => { const it = ITEMS[id]; if (!it || !st.inv[id]) return; if (G.questLocked(id)) { snd('deny'); hud.toast('✋', 'Objet de quête', 'Une quête en cours en a besoin : garde-le.'); return; } takeItem(st, id, 1); addEcus(it.sell); audio.sfx('buy'); quests.check(); };
function payCost(cost, disc) {
  const e = Math.round(cost.ecus * disc);
  if (st.player.ecus < e || !Object.entries(cost.mats).every(([id, n]) => (st.inv[id] || 0) >= n)) { audio.sfx('deny'); return false; }
  st.player.ecus -= e; Object.entries(cost.mats).forEach(([id, n]) => takeItem(st, id, n)); return true;
}
G.upgrade = (id, disc) => { const it = ITEMS[id], lvl = st.gear[id] || 0, next = UPGRADES[it.cat][lvl]; if (!next || (next.island && next.island !== IID) /* ACTE VI : niveau 4 / 3 réservés à la forge du Zénith */ || !payCost(next, disc)) return; st.gear[id] = lvl + 1; audio.sfx('break'); setTimeout(() => audio.sfx('level'), 250); hud.toast(icon(it.icon), `${it.name} +${lvl + 1}`, `${META.smith || (IID === 'foret' ? 'Silex' : 'Bran')} a fait du beau travail.`, 'reward'); autosave(); };
G.craft = (id, disc) => { if (st.inv[id] || !payCost(RECIPES[id], disc)) return; addItem(st, id, 1); audio.sfx('level'); hud.toast(icon(ITEMS[id].icon), ITEMS[id].name, 'Fabriqué à la forge.', 'reward'); autosave(); };

/* ---------- Effets des dialogues ---------- */
/* Un objet réclamé par une quête en cours ne se vend pas (sinon la remise échoue sans bruit). */
G.questLocked = (id) => quests.active().some((q) => ((quests.def(q) || {}).steps || []).some((s) => s.type === 'item' && s.item === id));
G.runEffects = (list) => {
  const res = {};
  // un « take » qui ne peut pas être honoré annule tout l'échange : la quête ne doit jamais avancer sans l'objet
  const need = {}; list.forEach((e) => { if (e.take) need[e.take] = (need[e.take] || 0) + (e.n || 1); });
  const missing = Object.keys(need).find((id) => (st.inv[id] || 0) < need[id]);
  if (missing) { snd('deny'); hud.toast('✋', 'Il te manque quelque chose', `${ITEMS[missing] ? ITEMS[missing].name : missing} ×${need[missing] - (st.inv[missing] || 0)} à rapporter.`); return { blocked: true }; }
  list.forEach((e) => {
    if (e.start) quests.start(e.start);
    if (e.step) quests.advance(e.step);
    if (e.give) giveItem(e.give, e.n || 1);
    if (e.take) takeItem(st, e.take, e.n || 1);
    if (e.ecus) addEcus(e.ecus);
    if (e.flag) { st.flags[e.flag] = 1; if (/^acte\d+_fini$/.test(e.flag)) setTimeout(() => screens.actEnd(S.finaleRewards), 400); }
    if (e.open) openGate(e.open, false);
    if (e.equip) G.equip(e.equip, true);
    if (e.ability) {   /* ACTE IV : capacités sauvegardées (orbe, planer) */
      const had = !!st.player.abilities[e.ability];
      st.player.abilities[e.ability] = true;
      const nm = { orbe: ['Orbe de Fia', 'Fia se pose sur un socle de lumière et éclaire tout droit. E pour la poser ou la tourner.'], portails: ['Portails', input.touch ? 'Bouton ◎ : pose un portail ; deux portails se relient. Au Zénith, ils renvoient aussi la lumière.' : 'Touche V : pose un portail ; deux portails se relient. Au Zénith, ils renvoient aussi la lumière.'], planer: ['Planer', 'Sur une corniche ou près d’une pierre de vent, tourne-toi vers l’autre rive et appuie sur E : Lyra plane de l’autre côté du vide.'] }[e.ability] || [e.ability, ''];
      if (!had) hud.toast('✦', 'Nouvelle capacité : ' + nm[0], nm[1], 'reward');
    }
    if ((e.ability === 'portails' || e.teach === 'portails') && isl.portalsOff) { isl.portalsOff = false; reEvaluate(); }   /* ACTE VI : une seule capacité « portails » (Borée, Acte V) allume aussi les portails de lumière du Zénith */
    if (e.teach) {
      st.player.abilities[e.teach] = true;
      const tn = A3.teachNote(e.teach);   /* ACTE III : porter, orbe */
      const T5 = { onde: ['Onde de lumière', input.touch ? 'Bouton ✦ (35 énergie).' : 'Clic droit ou L (35 énergie).'],
        planer: ['Planer', 'Près d’une pierre de vent, tourné vers l’autre rive : Interagir.'],   /* ACTE V : même capacité « planer » que l’Acte IV (corniches) */
        portails: ['Portails', input.touch ? 'Bouton ◎ : pose un portail ; deux portails se relient.' : 'Touche V : pose un portail ; deux portails se relient.'] }[e.teach] || [e.teach, ''];
      if (tn) hud.toast('✦', tn[0], tn[1], 'reward'); else hud.toast('✦', 'Nouvelle capacité : ' + T5[0], T5[1], 'reward');
    }
    if (e.replay === 'fin' && fin) setTimeout(() => startEnding(true), 400);   /* ACTE VI */
    if (e.travel) { const tv = e.travel; setTimeout(() => G.travelTo(tv.to, tv.zone, tv.cell), 100); res.travel = true; }
    if (e.unlock) unlock(e.unlock);
    if (e.heal) { const s = calcStats(st); st.player.hp = s.maxHp; st.player.en = s.maxEn; }
    if (e.shop) { res.screen = 'shop'; res.shop = e.shop; res.sell = !!e.sell; }
    if (e.forge) res.screen = 'forge';
    if (e.wardrobe) res.screen = 'wardrobe';
    if (e.rest) rest();
  });
  quests.check(); npcMarkers(); updateChestVisibility(); hud.refresh();
  if (list.length) autosave();
  return res;
};
function rest() {
  const s = calcStats(st); st.player.hp = s.maxHp; st.player.en = s.maxEn;
  // les boutiques se réapprovisionnent, les créatures reviennent
  Object.entries(SHOPS).forEach(([id, sh]) => { const stock = G.shopStock(id); sh.items.forEach((r) => { if (r.id && r.restock) stock[r.id] = Math.min((stock[r.id] || 0) + r.restock, r.stock); }); });
  combat.resetAll();
  st.player.respawn = { zone: META.home.zone, cell: META.home.cell };
  audio.sfx('heal');
  fade(() => { hud.toast('🌙', 'Tu te reposes ' + META.inn, 'Vie et énergie restaurées. Partie sauvegardée.'); });
  saveTo('auto');
}

/* =========================================================
   Sauvegarde
   ========================================================= */
const regionName = () => { const z = zones[S.zone]; return z ? (DEF.regions[z.region] || {}).name || z.title : ''; };
G.packState = () => { packPosition(); return st; };
function packPosition() {
  const z = zones[S.zone];
  if (z) Object.assign(st.player, { zone: z.id, x: (S.grap || S.glide) ? (S.grap || S.glide).to.x : P.x, z: (S.grap || S.glide) ? (S.grap || S.glide).to.z : P.z, face: P.face });
  st.completion = completion();
  syncGates();
}
async function saveTo(s) {
  if (S.leaving || HIDDEN) return null;   // voyage en cours : l'état est déjà écrit ; île de test : on ne touche pas aux sauvegardes du joueur   // voyage en cours : l'état est déjà écrit
  packPosition();
  const r = await saves.write(s, st, regionName());
  S.lastSave = S.time;
  if (s === 'auto') flashSave(r.cloud);
  return r;
}
G.saveTo = saveTo;
let autoT = null;
function autosave() { clearTimeout(autoT); autoT = setTimeout(() => { if (S.mode !== 'title') saveTo('auto'); }, 800); }
G.autosave = autosave;
let lastSaveSnd = 0;
function flashSave(cloud) { if (performance.now() - lastSaveSnd > 30000) { lastSaveSnd = performance.now(); snd('save', { vol: 0.5 }); } const el = $('#saveflag'); el.innerHTML = `${icon('save')}<span>${cloud ? 'Sauvegardé en ligne' : 'Sauvegardé'}</span>`; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }

/* =========================================================
   Démarrage d'une partie
   ========================================================= */
/* Change d'île : on enregistre l'île voulue puis on recharge la page, qui construit le bon monde. */
function switchIsland(id, s, then = 'resume') {
  S.leaving = true;   // empêche la sauvegarde de fermeture d'écraser la position d'arrivée
  store.set('lumen.island', id);
  try { sessionStorage.setItem('lumen.boot', JSON.stringify({ slot: s, then })); } catch (e) { /* rien */ }
  location.replace(location.pathname + (id === 'aube' ? '' : '') );
}
G.switchIsland = switchIsland;
/* Voyage vers une autre île : on range le monde actuel, on charge celui de l'île d'arrivée, on enregistre, puis on recharge. */
G.travelTo = async (id, zone, cell) => {
  if (!ISLANDS.some((i) => i.id === id) || S.leaving) return false;
  packPosition(); clearTimeout(autoT); S.leaving = true; snd('boat');
  st.otherWorlds = st.otherWorlds || {};
  st.otherWorlds[IID] = st.world;
  st.world = st.otherWorlds[id] || newWorld(ISLAND_META[id].warp);
  delete st.otherWorlds[id];
  const tz = ISLANDS.find((i) => i.id === id).zones.find((z) => z.id === zone);
  st.player.island = id; st.player.zone = zone; st.player.x = W(tz.ox + cell[0]); st.player.z = W(tz.oy + cell[1]);
  st.player.respawn = { zone, cell };
  await saves.write(slot, st, ISLAND_META[id].title);
  if (slot !== 'auto') await saves.write('auto', st, ISLAND_META[id].title);
  switchIsland(id, slot);
  return true;
};
G.startFrom = async (state, s = 'auto', legacy = false, noIntro = false) => {
  audio.unlock();
  if (opening.gate(state, s, legacy, noIntro)) return;   // intro : fondu / cinématique d'ouverture, puis rappel avec noIntro
  const want = HIDDEN ? IID : state ? ((state.player && state.player.island) || 'aube') : legacy || !state ? 'aube' : IID;
  if (want !== IID && ISLANDS.some((i) => i.id === want)) { switchIsland(want, s, state ? 'resume' : legacy ? 'legacy' : 'new'); return; }
  screens.close();
  slot = s;
  if (state) st = normalize(state);
  else if (legacy) st = migrateLegacy();
  else { st = newState(); }
  const fresh = !state && !legacy;
  st.player.island = IID;
  if (fresh) { quests.start(META.first || 'q_reveil'); st.player.zone = META.home.zone; st.player.respawn = { zone: META.home.zone, cell: META.home.cell }; }
  G.applyLook(); applyWorld(); mech.syncPortals(); combat.resetAll(); combat.clearProjectiles(); hud.clearBars();
  // position
  const zi = zoneIndex[st.player.zone] !== undefined ? zoneIndex[st.player.zone] : zoneIndex[META.town];
  const z = zones[zi];
  /* MONTAGNE : une partie enregistrée dans l'ancienne géographie de l'île (sans marque `layout`) n'a plus de coordonnées valables :
     on replace Lyra à l'arrivée de sa zone (elle existe toujours) et on vérifie le point de reprise */
  const relayout = !!(DEF.layout && st.world.layout !== DEF.layout && !fresh);
  if (DEF.layout) st.world.layout = DEF.layout;
  if (relayout) {
    st.player.x = null;
    const rz = st.player.respawn && zoneIndex[st.player.respawn.zone] !== undefined ? zones[zoneIndex[st.player.respawn.zone]] : null;
    if (!rz || !canStand(W(rz.ox + st.player.respawn.cell[0]), W(rz.oy + st.player.respawn.cell[1]))) st.player.respawn = { zone: META.home.zone, cell: META.home.cell };
  }
  if (st.player.x !== null && st.player.x !== undefined && canStand(st.player.x, st.player.z)) { P.x = st.player.x; P.z = st.player.z; P.face = st.player.face || 0; }
  else { const c = fresh ? META.home.cell : z.spawn; P.x = W(z.ox + c[0]); P.z = W(z.oy + c[1]); P.face = 0; }
  const s0 = calcStats(st); st.player.hp = Math.min(Math.max(1, st.player.hp), s0.maxHp); st.player.en = Math.min(st.player.en, s0.maxEn);
  P.alive = true; P.vx = P.vz = 0; P.swing = null; P.dodging = false;
  S.zone = -1; S.camT.set(P.x, heightAt(P.x, P.z) + 0.8, P.z); S.yaw = S.yawT = CAM_YAW; S.pitch = CAM_PITCH; S.mode = 'play';
  platform.startSession();
  hud.show(true); setTouch(true); input.enable(true); input.clear();
  // arrivée sur une autre île (voyage) : sa quête principale démarre toute seule (sinon Ambre n'ouvre jamais les ponts)
  if (META.first && !st.quests[META.first]) quests.start(META.first);
  A3.arrive();   /* ACTE III : Porter / Orbe rattrapés à l'arrivée dans le Désert */
  quests.check(); npcMarkers(); hud.refresh();
  if (fin && isl.gates.end && isl.gates.end.open && !st.flags.fin_jeu) setTimeout(() => startEnding(false), 1800);   /* ACTE VI : sauvegarde juste avant la fin → la scène finale se rejoue */
  if (fresh) opening.wake(() => intro(), true);
  else if (legacy) setTimeout(() => hud.toast('✦', 'Bienvenue dans la nouvelle aventure', 'Tes énigmes et tes objets sont conservés. Séléné t’attend à Havre-Aube.'), 800);
  if (!fresh) opening.wake(null, false);
  saveTo('auto');
};
function migrateLegacy() {
  const run = platform.loadRun(IID) || {};
  const s = fromRun(run);
  s.quests.q_reveil = { state: 'active', step: 0, base: { kills: 0 } };
  addItem(s, 'baton'); addItem(s, 'veste_voyage'); s.equip.weapon = 'baton'; s.equip.armor = 'veste_voyage';
  s.world.gates.b_rivage = 1; s.world.gates.b_lande = 1;
  if (s.world.gates.g1 && s.world.gates.g2) { s.quests.q_reveil = { state: 'done', step: 3, base: {} }; s.quests.q_lentille = { state: 'active', step: 0, base: { kills: 0 } }; s.player.abilities.onde = true; }
  if (s.world.gates.end) { s.flags.lens_set = 1; s.world.gates.lens = 1; }
  s.player.zone = 'havre'; s.player.x = null;
  s.inv.potion = 2;
  return s;
}
function intro() {
  NPCS._intro = { name: 'Fia', role: 'ta Lueur', talk: [{ if: () => true, say: [
    { who: 'fia', t: 'Lyra ? Lyra ! Tu te réveilles enfin. On est à l’auberge du Lampion, à Havre-Aube. La barque nous a déposées cette nuit.' },
    { who: 'lyra', t: 'Je… je ne me souviens de rien. Qui es-tu ?' },
    { who: 'fia', t: 'Fia ! Ta Lueur. Je suis toujours avec toi, promis. Et quelqu’un nous attend sur la place du village : Séléné, la gardienne du phare.' },
    { who: 'fia', t: input.touch ? 'Utilise le joystick pour marcher. Approche-toi des gens et des objets, puis touche ✋.' : 'ZQSD ou les flèches pour marcher, E pour parler ou agir, Échap pour le menu. On y va ?' },
  ] }] };
  screens.dialog('_intro');
}

/* =========================================================
   Déplacements et collisions
   ========================================================= */
function canStand(x, z, r = 0.34, fx, fz) {
  const cx = Math.round(x / T), cy = Math.round(z / T);
  for (const [ox, oz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const ax = Math.round((x + ox) / T), ay = Math.round((z + oz) / T);
    if (!walkable(isl, ax, ay)) return false;
    if (isl.alt && (ax !== cx || ay !== cy) && !stepOk(isl, cx, cy, ax, ay)) return false;   /* ALTITUDE : falaise = mur (|Δh| > pas) */
  }
  if (isl.alt && fx !== undefined) { const ox = Math.round(fx / T), oy = Math.round(fz / T); if ((ox !== cx || oy !== cy) && !stepOk(isl, ox, oy, cx, cy)) return false; }   /* évite de traverser une falaise en un grand pas (esquive) */
  return true;
}
G.canStand = canStand;
G.zoneIndexAt = (x, z) => { const cx = Math.round(x / T), cy = Math.round(z / T); return isl.zoneAt[cy] ? isl.zoneAt[cy][cx] : -1; };
G.solidAt = (x, z) => { const cx = Math.round(x / T), cy = Math.round(z / T); const t = isl.terrain[cy] && isl.terrain[cy][cx]; if (t === undefined || t === ' ') return true; if (t === '#' || t === 'T' || t === 'H' || t === 'c') return true; if (t === 'x') return !(isl.gates[isl.gateCell[cx + ',' + cy]] || {}).open; return false; };
const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
G.hitstop = (t) => { if (!REDUCED) S.hitstop = Math.max(S.hitstop, t); };
G.shake = (a) => { if (!REDUCED) S.shake = Math.max(S.shake, a); };
G.hintOnce = (k, text) => { if (S.hints[k] && S.time - S.hints[k] < 20) return; S.hints[k] = S.time; hud.toast('💡', text); };
G.onCut = (x, y) => {
  isl.terrain[y][x] = ','; st.world.cut[x + ',' + y] = 1; world.removeCell('r', x, y);
  audio.sfx('cut'); sparks.burst(new THREE.Vector3(W(x), 0.8, W(y)), '#7aa84f', 22, 3, 2);
  if (Math.random() < 0.35) combat.dropPickup(W(x), W(y), 'fibre', 1);
  if (Math.random() < 0.2) combat.dropPickup(W(x), W(y), 'ecus', 2);
};
G.onBreak = (x, y) => {
  // brise tout le bloc fissuré
  const q = [[x, y]], seen = new Set();
  while (q.length) { const [cx, cy] = q.pop(); const k = cx + ',' + cy; if (seen.has(k) || isl.terrain[cy][cx] !== 'c') continue; seen.add(k); isl.terrain[cy][cx] = ','; st.world.broken[k] = 1; world.removeCell('c', cx, cy); sparks.burst(new THREE.Vector3(W(cx), 0.8, W(cy)), '#d9d4e3', 30, 4, 3); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => q.push([cx + dx, cy + dy])); }
  audio.sfx('break'); G.shake(0.4); hud.toast('✧', 'La roche s’effondre !', 'Un passage caché…');
  autosave();
};

/* ---------- Dégâts reçus ---------- */
G.hurtPlayer = (dmg, fx, fz, o = {}) => {
  if (!P.alive || P.iframes > 0 || S.mode !== 'play') return;
  if (P.dodging) { if (!P.dodgeNoted) { P.dodgeNoted = true; hud.damage(P.x, 2, P.z, 'Esquivé', 'block'); } return; }
  const s = calcStats(st);
  let d = Math.max(1, Math.round(dmg - s.def * 0.8));
  if (o.brume && s.resBrume) d = Math.max(1, Math.round(d * (1 - s.resBrume)));
  if (o.sable && s.resSable) d = Math.max(1, Math.round(d * (1 - s.resSable)));   /* ACTE III */
  st.player.hp = Math.max(0, st.player.hp - d);
  P.iframes = 0.85; P.hurtT = 0.4;
  const a = Math.atan2(P.x - fx, P.z - fz), k = o.knock || 1.5;
  P.kbx = Math.sin(a) * k * 5; P.kbz = Math.cos(a) * k * 5;
  hud.damage(P.x, 2.2, P.z, d, 'hurt'); hud.hurtFlash(); audio.sfx('hurt'); G.shake(0.3);
  if (st.player.hp <= 0) die();
};
function die() {
  P.alive = false; S.mode = 'dead'; setTouch(false); input.enable(false);
  st.stats.deaths++;
  const lost = Math.min(50, Math.floor(st.player.ecus * 0.1)); st.player.ecus -= lost;
  snd('death');
  const rz = zones[zoneIndex[st.player.respawn.zone]] || zones[zoneIndex[META.town]];
  setTimeout(() => screens.death(rz.title, lost), 1100);
}
G.respawn = () => {
  const r = st.player.respawn, zi = zoneIndex[r.zone] !== undefined ? zoneIndex[r.zone] : zoneIndex[META.town], z = zones[zi];
  const s = calcStats(st); st.player.hp = s.maxHp; st.player.en = s.maxEn;
  combat.resetAll(); combat.clearProjectiles(); hud.clearBars(); S.boss = null;
  teleport(W(z.ox + r.cell[0]), W(z.oy + r.cell[1]));
  P.alive = true; S.mode = 'play'; setTouch(true); input.enable(true);
};
/* Sol sous les pieds de Lyra (bruit des pas) */
function groundAt() {
  const z = zones[S.zone], t = isl.terrain[Math.round(P.z / T)] && isl.terrain[Math.round(P.z / T)][Math.round(P.x / T)];
  if (t === '=') return 'bois';
  const th = themeOf(z);
  return z && z.interior ? 'bois' : th === 'temple' || th === 'sanctuaire' || th === 'grotte' || th === 'lac' || th === 'phare_abysses' /* ACTE IV */ || th === 'moulins' /* ACTE V */ ? 'pierre' : th === 'pics' || th === 'phare_vents' ? 'neige' /* ACTE V */ : th === 'foret' || th === 'canopee' || th === 'phare_verre' ? 'verre' : th === 'lande' || th === 'desert' || th === 'cite' || th === 'ruines' ? 'terre' : th === 'temple_sable' || th === 'phare_sable' ? 'pierre' : 'herbe';   /* ACTE III */
}
function teleport(x, z) { P.x = x; P.z = z; P.vx = P.vz = 0; S.camT.set(x, heightAt(x, z) + 0.8, z); S.zone = -1; }
function fade(cb) { const f = $('#fade'); f.classList.add('on'); setTimeout(() => { cb && cb(); f.classList.remove('on'); }, 450); }

/* =========================================================
   Interactions
   ========================================================= */
function cellCenter(z, c) { return [W(z.ox + c[0]), W(z.oy + c[1])]; }
function findTarget(all) {   /* ACTE VI : all → renvoie tous les candidats (audit) */
  const cands = [];
  /* ALTITUDE : une cible sur une autre terrasse (écart de plus de deux niveaux) est hors d'atteinte */
  const d = (x, z) => Math.hypot(x - P.x, z - P.z) + (isl.alt && Math.abs(heightAt(x, z) - heightAt(P.x, P.z)) > 2 * HU + 0.05 ? 99 : 0);
  const push = (dist, max, o) => { if (dist < max) cands.push(Object.assign({ dist }, o)); };
  const zi = S.zone, z = zones[zi];
  // objets de lumière
  isl.ents.forEach((e) => { if (e.rot && e.t !== 'socle' /* ACTE IV : socle d’orbe, voir plus bas */ && Math.abs(e.zone - zi) <= 0 && e.zone === zi) push(d(W(e.x), W(e.y)), 2.5, { kind: 'device', e, x: W(e.x), z: W(e.y), label: `Tourner ${{ lantern: 'la lanterne', mirror: 'le miroir', relay: 'le relais', splitter: 'la lame', valve: 'la vanne (niveau de l’eau)' }[e.t]}` }); });
  /* ACTE IV : socles de l’orbe de Fia (kind « orbsocle », distinct des socles d’objets portés de l’Acte III), corniches de plané */
  isl.ents.forEach((e) => {
    if (e.zone !== zi) return;
    if (e.t === 'socle') push(d(W(e.x), W(e.y)), 2.5, { kind: 'orbsocle', e, x: W(e.x), z: W(e.y), label: !st.player.abilities.orbe ? 'Socle de lumière' : isl.orb.at === e.id ? 'Tourner l’orbe de Fia' : 'Poser l’orbe de Fia ici' });
    if (e.t === 'ledge') push(d(W(e.x), W(e.y)) - 0.4, 2.4, { kind: 'ledge', e, x: W(e.x), z: W(e.y), label: !st.player.abilities.planer ? 'Corniche de pierre' : glideLink(e) ? `Planer vers ${DIR_WORDS[glideLink(e).dir]}` : 'Corniche · tourne-toi vers l’autre îlot' });
  });
  // poteaux du grappin
  isl.ents.forEach((e) => { if (e.t === 'post' && e.zone === zi) push(d(W(e.x), W(e.y)) - (st.inv.grappin && pickLink(e) ? 1.0 : 0), 2.7, { kind: 'post', e, x: W(e.x), z: W(e.y), label: postLabel(e) }); });   // le poteau qu'on peut utiliser passe avant un miroir voisin
  /* ACTE V : pierres de vent (planer) */
  isl.ents.forEach((e) => { if (e.t === 'vent' && e.zone === zi) push(d(W(e.x), W(e.y)) - (st.player.abilities.planer && mech.pick(e) ? 1.0 : 0), 2.7, { kind: 'vent', e, x: W(e.x), z: W(e.y), label: mech.ventLabel(e) }); });
  // habitants
  npcs.forEach((n) => { if (n.zi === zi) push(d(n.x, n.z), n.counter ? 4.4 : 2.7, { kind: 'npc', n, x: n.x, z: n.z, label: `Parler à ${n.d.name}` }); });
  // coffres
  Object.values(world.chestViews).forEach((cv) => { if (cv.zi === zi && !cv.open && cv.g.visible) push(d(W(cv.x), W(cv.y)), 2.4, { kind: 'chest', cv, x: W(cv.x), z: W(cv.y), label: 'Ouvrir le coffre' }); });
  // bâtiments, décor
  world.props.forEach((pr) => {
    if (pr.zi !== zi) return;
    const p = pr.p;
    if (p.t === 'house' && p.door) { const [x, zz] = cellCenter(pr.z, p.door); push(d(x, zz), 2.0, { kind: 'door', pr, x, z: zz, label: p.interior ? (p.lock && !st.inv[p.lock] && !st.flags['ouvert_' + p.id] ? `${p.name} (fermée à clé)` : `Entrer · ${p.name}`) : p.name }); }
    const [cx, cz] = [pr.g.position.x, pr.g.position.z];
    if (p.t === 'sign') push(d(cx, cz), 2.3, { kind: 'sign', pr, x: cx, z: cz, label: 'Lire le panneau' });
    if (p.t === 'lamp' && !pr.g.userData.lit && (quests.state('s_lampions') === 'active' || quests.state('s_lampions_f') === 'active' || quests.state('s_lampions_d') === 'active' /* ACTE III */ || quests.state('s_lampions_a') === 'active' /* ACTE IV */ || quests.state('s_lampions_z') === 'active' /* ACTE VI */)) push(d(cx, cz), 2.4, { kind: 'lamp', pr, x: cx, z: cz, label: 'Rallumer le lampion avec Fia' });
    if (p.t === 'lamp' && String(p.id || '').startsWith('fanion') && !pr.g.userData.lit) push(d(cx, cz), 2.4, { kind: 'fanion', pr, x: cx, z: cz, label: 'Hisser le fanion avec Fia' });   /* ACTE V */
    if (p.t === 'bed') push(d(cx, cz), 3.4, { kind: 'bed', pr, x: cx, z: cz, label: 'Se reposer' });
    if (p.t === 'desk') push(d(cx, cz), 3.0, { kind: 'desk', pr, x: cx, z: cz, label: 'Étudier les cartes d’Orin' });
    if (p.t === 'well' && !st.flags.puits) push(d(cx, cz), 2.4, { kind: 'well', pr, x: cx, z: cz, label: 'Regarder au fond du puits' });
  });
  // cristaux de voyage
  WARPS.forEach((w) => { if (zoneIndex[w.zone] !== zi || (w.needs && !w.needs(st))) return; const [x, zz] = cellCenter(z, w.cell); push(d(x, zz), w.r, { kind: 'warp', w, x, z: zz, label: 'Cristal de voyage' }); });
  // ACTE VI : contempler le Prisme reforgé (revoir la scène finale), depuis le phare
  if (zscene && z.id === 'phare_z' && isl.gates.end && isl.gates.end.open && st.flags.fin_jeu) push(d(zscene.top.x, zscene.top.z), 6.2, { kind: 'prisme', x: zscene.top.x, z: zscene.top.z, label: 'Contempler le Prisme' });
  // portes verrouillées et sceau du phare
  Object.values(isl.gates).forEach((g) => {
    if (g.open || !(g.key || g.id === 'lens')) return;
    g.cells.forEach(([x, y]) => { if (g.id !== 'lens' && isl.zoneAt[y][x] !== zi && isl.zoneAt[y][x] !== -1) return; const wx = W(x), wz = W(y); push(d(wx, wz), 2.6, { kind: 'lock', g, x: wx, z: wz, label: g.id === 'lens' ? (st.inv.lentille ? 'Poser la Lentille d’Aube' : 'Un sceau de brume') : st.inv[g.key] ? 'Déverrouiller la porte' : 'Porte verrouillée' }); });
  });
  A3.targets(zi, push, d);   /* ACTE III : objets portés, socles, vasques, abris, stèles */
  const PRIO = { socle: -0.5, orbsocle: -0.3 /* ACTE IV */, ledge: -0.2 /* ACTE IV */, carry: -0.35, vasque: -0.4, shelter: 0.3, stele: 0.5, npc: -1.2, chest: -0.6, post: -0.2, device: -0.3, lock: -0.3, warp: 1.6, door: 0.2, sign: 0.4, lamp: -1.5, bed: 0.5, desk: 0, well: 0.6, vent: -0.2, fanion: -1.5 /* ACTE V */, prisme: 0.8 /* ACTE VI */ };
  cands.sort((a, b) => (a.dist + (PRIO[a.kind] || 0)) - (b.dist + (PRIO[b.kind] || 0)));
  A3.decorate(cands);
  return all ? cands : (cands[0] || null);
}
/* ---------- Grappin de lumière ---------- */
const DIR_WORDS = { N: 'le nord', E: 'l’est', S: 'le sud', W: 'l’ouest' };
/* Liaison choisie pour un poteau : celle vers laquelle Lyra est tournée (la seule s'il n'y en a qu'une) */
function pickLink(post) {
  const links = postLinks(isl, post);
  if (!links.length) return null;
  if (links.length === 1) return links[0];
  const fx = Math.sin(P.face), fz = Math.cos(P.face);
  let best = null, bd = 0.3;
  links.forEach((l) => { const [dx, dy] = DIRS[l.dir]; const dot = fx * dx + fz * dy; if (dot > bd) { bd = dot; best = l; } });
  return best;
}
function postLabel(post) {
  if (!st.inv.grappin) return 'Poteau de verre';
  const l = pickLink(post);
  return l ? `Lancer le grappin vers ${DIR_WORDS[l.dir]}` : 'Poteau de verre · tourne-toi vers l’autre rive';
}
/* ACTE IV : plané (capacité « planer », corniches de l’île des Abysses) : on franchit un vide entre deux corniches en ligne droite */
function glideLink(ledge) {
  const links = glideFrom(isl, ledge);
  if (!links.length) return null;
  if (links.length === 1) return links[0];
  const fx = Math.sin(P.face), fz = Math.cos(P.face);
  let best = null, bd = 0.3;
  links.forEach((l) => { const [dx, dy] = DIRS[l.dir]; const dot = fx * dx + fz * dy; if (dot > bd) { bd = dot; best = l; } });
  return best;
}
function startGlide(l) {
  const to = { x: W(l.land[0]), z: W(l.land[1]) }, hook = { x: W(l.to.x), z: W(l.to.y) };
  const dist = Math.hypot(to.x - P.x, to.z - P.z);
  S.grap = { t: 0, dur: Math.max(1.1, 0.5 + dist / 9), from: { x: P.x, z: P.z }, to, hook, glide: true };
  S.mode = 'grapple'; setTouch(false); input.clear(); hud.prompt('');
  P.face = Math.atan2(to.x - P.x, to.z - P.z); P.vx = P.vz = 0; P.swing = null; P.dodging = false; P.chargeT = 0;
  P.iframes = Math.max(P.iframes, S.grap.dur + 0.1);
  audio.sfx('dodge');
}
const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bff3ff').multiplyScalar(2.6), transparent: true, opacity: 0.95 }));
rope.visible = false; scene.add(rope);
const ropeTip = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), glow('#e8fbff', 4)); ropeTip.visible = false; scene.add(ropeTip);
function startGrapple(l) {
  const to = { x: W(l.land[0]), z: W(l.land[1]) }, hook = { x: W(l.to.x), z: W(l.to.y) };
  const dist = Math.hypot(to.x - P.x, to.z - P.z);
  S.grap = { t: 0, dur: Math.max(0.7, 0.35 + dist / 22), from: { x: P.x, z: P.z }, to, hook };
  S.mode = 'grapple'; setTouch(false); input.clear(); hud.prompt('');
  P.face = Math.atan2(to.x - P.x, to.z - P.z); P.vx = P.vz = 0; P.swing = null; P.dodging = false; P.chargeT = 0;
  P.iframes = Math.max(P.iframes, S.grap.dur + 0.1);
  audio.sfx('grapple_throw');
}
function endGrapple() {
  const g = S.grap; if (!g) return;
  P.x = g.to.x; P.z = g.to.z; P.y = 0; P.vx = P.vz = 0;
  S.grap = null; rope.visible = ropeTip.visible = false; if (world.grappleHide) world.grappleHide();
  S.mode = 'play'; setTouch(true); input.clear();
  audio.sfx('land'); sparks.burst(new THREE.Vector3(P.x, 0.4, P.z), '#9fe9ff', 14, 2.2, 1.5);
  if (g.glide) st.flags.a_plane = 1; else st.flags.a_grappe = 1;   /* ACTE IV */
  autosave();
}
function updateGrapple(dt) {
  const g = S.grap; g.t += dt;
  const k = Math.min(1, g.t / g.dur), cast = Math.min(1, k / 0.22), pull = Math.max(0, (k - 0.22) / 0.78), e = pull * pull * (3 - 2 * pull);
  if (!g.hit && cast >= 1) { g.hit = true; audio.sfx('grapple_hit'); sparks.burst(new THREE.Vector3(g.hook.x, 2.2, g.hook.z), '#e8fbff', 16, 2.5, 1); }
  if (g.glide) {   /* ACTE IV : plané : longue courbe, sans câble */
    const ek = k * k * (3 - 2 * k);
    P.x = lerp(g.from.x, g.to.x, ek); P.z = lerp(g.from.z, g.to.z, ek); P.y = 0.4 + Math.sin(Math.PI * ek) * 2.4;
    if (Math.random() < 0.5) sparks.burst(new THREE.Vector3(P.x, P.y + 0.6, P.z), '#9ffff0', 1, 0.6, 0.2, 1, 0.5);
    if (k >= 1) endGrapple();
    return;
  }
  P.x = lerp(g.from.x, g.to.x, e); P.z = lerp(g.from.z, g.to.z, e); P.y = Math.sin(Math.PI * e) * 1.15;
  // câble : de la main de Lyra à la tête du poteau d'arrivée (visuel de world/ si disponible, sinon secours)
  const hkH = heightAt(g.hook.x, g.hook.z);   /* ALTITUDE : le câble relie les hauteurs réelles */
  const a = tmpV.set(P.x, P.gy + P.y + 1.3, P.z);
  if (world.grappleLine) {
    world.grappleLine(a.clone(), new THREE.Vector3(g.hook.x, 2.95 + hkH, g.hook.z), cast, pull);
    if (!g.pulled && pull > 0.02) { g.pulled = true; audio.sfx('grapple_pull'); }
  } else {
    const b = new THREE.Vector3(lerp(P.x, g.hook.x, cast), lerp(P.gy + P.y + 1.3, 2.25 + hkH, cast), lerp(P.z, g.hook.z, cast));
    const len = a.distanceTo(b); rope.visible = len > 0.05; rope.position.copy(a).lerp(b, 0.5); rope.scale.set(1, Math.max(0.01, len), 1); rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    ropeTip.visible = true; ropeTip.position.copy(b); ropeTip.rotation.y += dt * 8;
  }
  if (k >= 1) endGrapple();
}

/* ACTE IV : si l’eau monte sous les pieds de Lyra, on la replace sur la case marchable la plus proche */
function unstickPlayer() {
  if (canStand(P.x, P.z)) return;
  const cx = Math.round(P.x / T), cy = Math.round(P.z / T);
  for (let r = 1; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (walkable(isl, cx + dx, cy + dy) && canStand(W(cx + dx), W(cy + dy))) { P.x = W(cx + dx); P.z = W(cy + dy); return; } }
}
function interact(back) {
  const t = S.target; if (!t) return;
  switch (t.kind) {
    case 'device': {
      if (back && t.e.carry && A3.lift(t.e)) break;   /* ACTE III : R = porter */
      const e = t.e, n = back && (e.t === 'lantern' || e.t === 'relay') ? 3 : 1;
      for (let i = 0; i < n; i++) rotate(e);
      audio.sfx(e.t === 'vitrail' ? 'vitrail' : e.t === 'mirror' || e.t === 'splitter' ? 'mirror' : e.t === 'relay' ? (e.mix ? 'mixer' : 'relay') : 'lantern', { x: W(e.x), z: W(e.y) });
      sparks.burst(new THREE.Vector3(W(e.x), BEAM_Y, W(e.y)), '#ffd98a', 10, 2, 1);
      if (e.t === 'valve') { audio.sfx('door', { x: W(e.x), z: W(e.y) }); hud.toast('≈', e.state ? 'L’eau monte' : 'L’eau descend', 'Les bassins de la salle changent de niveau.'); unstickPlayer(); }
      reEvaluate(); autosave();
      break;
    }
    case 'orbsocle': {   /* ACTE IV */
      if (!st.player.abilities.orbe) { screens.message('Socle de lumière', 'Un socle de pierre creusé d’un anneau luisant. Une petite lumière pourrait s’y poser… mais Fia ne sait pas encore faire cela.'); break; }
      const r = orbAct(isl, t.e, back);
      audio.sfx('relay', { x: W(t.e.x), z: W(t.e.y) }); sparks.burst(new THREE.Vector3(W(t.e.x), BEAM_Y, W(t.e.y)), '#bff3ff', r === 'pose' ? 24 : 8, 2, 1);
      if (r === 'pose') hud.toast('✦', 'Fia se pose sur le socle', 'Sa lumière part tout droit. Reviens appuyer sur E pour la tourner.');
      reEvaluate(); autosave(); break;
    }
    case 'ledge': {
      if (!st.player.abilities.planer) { screens.message('Corniche de pierre', 'Une dalle gravée d’un chevron, au bord du vide. De l’autre côté, une autre corniche lui répond. Il faudrait savoir planer pour les relier.'); break; }
      const l = glideLink(t.e);
      if (!l) { audio.sfx('deny'); hud.toast('✋', 'Aucune corniche en face', 'Tourne-toi vers l’autre îlot, puis réessaie.'); break; }
      startGlide(l); break;
    }
    case 'post': {
      if (!st.inv.grappin) { screens.message('Poteau de verre', 'Un poteau de verre taillé, assez solide pour retenir un câble de lumière. De l’autre côté du vide, un deuxième poteau lui répond. Il faudrait un grappin pour les relier.'); break; }
      const l = pickLink(t.e);
      if (!l) { audio.sfx('deny'); hud.toast('✋', 'Aucun poteau en face', 'Tourne-toi vers le poteau de l’autre rive, puis réessaie.'); break; }
      startGrapple(l); break;
    }
    case 'vent': mech.interactVent(t.e, screens); break;   /* ACTE V */
    case 'fanion': { const pr = t.pr; st.world.lamps[pr.p.id] = 1; setLamp(pr, true); snd('fanion'); sparks.burst(new THREE.Vector3(pr.g.position.x, 2.4, pr.g.position.z), '#ffb35a', 26, 2, 1); hud.toast('✦', `Fanion hissé (${G.counts('fanions')})`); quests.check(); autosave(); break; }
    case 'npc': talkTo(t.n); break;
    case 'chest': openChest(t.cv); break;
    case 'door': {
      const p = t.pr.p;
      if (!p.interior) { screens.message(p.name, p.closed || 'La porte est fermée.'); break; }
      if (p.lock && !st.flags['ouvert_' + p.id]) { if (!st.inv[p.lock]) { audio.sfx('deny'); hud.toast('🔒', 'Fermée à clé', 'Il faudrait la clé de cette maison.'); break; } st.flags['ouvert_' + p.id] = 1; hud.toast('🔑', 'La porte s’ouvre', p.name); }
      const iz = zones[zoneIndex[p.interior]];
      audio.sfx('door');
      fade(() => teleport(W(iz.ox + iz.spawn[0]), W(iz.oy + iz.spawn[1])));
      break;
    }
    case 'sign': screens.message('Panneau', t.pr.p.text); break;
    case 'prisme': startEnding(true); break;   /* ACTE VI */
    case 'lamp': { const pr = t.pr; st.world.lamps[pr.p.id] = 1; setLamp(pr, true); audio.sfx('lamp'); sparks.burst(new THREE.Vector3(pr.g.position.x, 2.4, pr.g.position.z), '#ffb35a', 30, 2, 1); hud.toast('✦', `Lampion rallumé (${G.counts('lampions')} / 7)`); quests.check(); autosave(); break; }
    case 'bed': rest(); break;
    case 'desk': {
      if (!st.player.abilities.vision) { st.player.abilities.vision = true; hud.toast('✧', 'Nouvelle capacité : Vision d’éclat', 'Les secrets cachés apparaissent sur ta carte (M).', 'reward'); reward('o:' + IID + ':vision', 60, 20); }
      screens.message('Les cartes d’Orin', 'Des dizaines de cartes de l’archipel, couvertes d’annotations : « roche fissurée ici », « coffre sous les ronces », « le Colosse dort mal ». Fia les mémorise toutes. Désormais, ta carte montre les secrets de l’île.');
      autosave(); break;
    }
    case 'well': st.flags.puits = 1; addEcus(25); hud.toast(icon('coin'), 'Une bourse au fond du puits !', '+25 écus. Quelqu’un les avait jetés pour faire un vœu…'); autosave(); break;
    case 'warp': {
      st.world.warps[t.w.id] = 1;
      const list = WARPS.filter((w) => st.world.warps[w.id] && (!w.needs || w.needs(st))).map((w) => ({ id: w.id, name: w.name, where: w.where, here: w.id === t.w.id }));
      if (list.length < 2) { hud.toast('✦', 'Cristal de voyage réveillé', 'Réveille d’autres cristaux pour voyager de l’un à l’autre.'); snd('portal_open'); break; }
      screens.warps(list); break;
    }
    case 'carry': case 'socle': case 'vasque': case 'shelter': case 'stele': A3.interact(t, back); break;   /* ACTE III */
    case 'lock': {
      const g = t.g;
      if (g.id === 'lens') { if (!st.inv.lentille) { screens.message('Le sceau de brume', 'Une brume épaisse et violette bouche l’entrée du phare. Seule la lumière de la Lentille d’Aube pourrait la dissiper.'); break; } takeItem(st, 'lentille', 1); st.flags.lens_set = 1; openGate('lens'); hud.banner('Phare de l’Aube', 'La Lentille est en place'); quests.check(); autosave(); break; }
      if (!st.inv[g.key]) { audio.sfx('deny'); hud.toast('🔒', 'Porte verrouillée', 'Il faut une clé. Elle doit être quelque part dans le Sanctuaire.'); break; }
      takeItem(st, g.key, 1); openGate(g.id); hud.toast('🔑', 'La porte s’ouvre'); autosave(); break;
    }
  }
}
function openChest(cv) {
  cv.open = true; st.world.chests[cv.c.id] = 1; st.stats.chests++;
  audio.sfx('chest'); sparks.burst(new THREE.Vector3(W(cv.x), 1, W(cv.y)), '#ffe2a0', 40, 3, 3);
  setTimeout(() => {
    if (cv.c.ecus) { addEcus(cv.c.ecus); hud.toast(icon('coin'), `${cv.c.ecus} écus`, 'Trouvés dans un coffre.', 'reward'); }
    if (cv.c.item) giveItem(cv.c.item, cv.c.n || 1);
    reward('c:' + IID + ':' + cv.c.id, 20, 10);
    hud.refresh(); autosave();
  }, 300);
}
function talkTo(n) {
  S.talkTo = n; n.talking = true;
  screens.dialog(n.id);
}
G.dialogStart = () => { S.mode = 'dialog'; setTouch(false); input.clear(); hud.prompt(''); };
G.dialogEnd = () => { if (S.talkTo) S.talkTo.talking = false; S.talkTo = null; npcMarkers(); };
G.onScreenClosed = () => { if (S.mode === 'title') return; if (S.mode === 'dead') return; S.mode = 'play'; setTouch(true); input.enable(true); input.clear(); hud.refresh(); };
G.warpTo = (id) => {
  const w = WARPS.find((x) => x.id === id), z = zones[zoneIndex[w.zone]];
  audio.sfx('warp'); snd('portal_travel');
  fade(() => { teleport(W(z.ox + w.arrive[0]), W(z.oy + w.arrive[1])); st.player.respawn = { zone: w.zone, cell: w.arrive }; snd('checkpoint'); });
  autosave();
};
G.wardrobeCam = (on) => { S.wardrobe = on; S.mode = on ? 'screen' : S.mode; };

/* ---------- Objets au sol ---------- */
function checkPickups() {
  isl.ents.forEach((e) => {
    const v = world.views[e.id];
    if (!v.pick || st.world.picked[e.id] || e.zone !== S.zone) return;
    if (Math.hypot(W(e.x) - P.x, W(e.y) - P.z) < 1.25) pickEnt(e);
  });
  Object.values(world.pickupViews).forEach((pv) => {
    if (!pv.g.visible || pv.zi !== S.zone) return;
    if (Math.hypot(W(pv.x) - P.x, W(pv.y) - P.z) < 1.25) {
      pv.g.visible = false; st.world.picked['pk_' + pv.pk.id] = 1;
      sparks.burst(new THREE.Vector3(W(pv.x), 1, W(pv.y)), '#ffe2a0', 30, 3, 2);
      if (pv.pk.t === 'page') { st.world.picked['page_' + pv.pk.page] = 1; audio.chord([523, 659, 784, 1047], 0.15); reward('p:' + IID + ':' + pv.pk.page, 50, 20); gainXp(30); screens.reader(pv.pk.page, true); }
      else { audio.sfx('pickup'); giveItem(pv.pk.item, 1); }
      quests.check(); autosave();
    }
  });
}
function pickEnt(e) {
  const v = world.views[e.id];
  st.world.picked[e.id] = 1; v.g.visible = false;
  const p = new THREE.Vector3(W(e.x), 1, W(e.y));
  if (e.t === 'shard') {
    sparks.burst(p, '#d8b4fe', 40, 4, 2.5); audio.chord([988, 1319], 0.12);
    const n = G.counts('shards');
    hud.toast('✦', `Éclat de prisme ${n} / ${G.countAll('shard')}`, n === G.countAll('shard') ? 'Tous les éclats de l’île sont réunis !' : 'Pell, le tailleur, s’y intéresse beaucoup.');
    reward('s:' + IID + ':' + e.id, 0, 30); addEcus(15, true); gainXp(10);
  } else if (e.t === 'page') {
    sparks.burst(p, '#ffe2a0', 30, 3, 2); audio.chord([523, 659, 784, 1047], 0.15);
    reward('p:' + IID + ':' + e.page, 50, 20); gainXp(30);
    screens.reader(e.page, true);
  } else if (e.t === 'wisp') {
    sparks.burst(p, '#ffd1f0', 40, 3, 2); audio.chord([659, 880, 1109], 0.15);
    hud.toast('✿', DEF.wisp.name, 'Elle te suit désormais.'); reward('w:' + IID, 80, 30); gainXp(20);
  }
  quests.check(); hud.refresh(); autosave();
}

/* =========================================================
   Combat (actions de Lyra)
   ========================================================= */
function startSwing() {
  const s = calcStats(st), w = s.weapon;
  if (!w) { G.hintOnce('noweapon', 'Tu n’as pas d’arme. Séléné, sur la place du village, peut t’aider.'); return; }
  if (P.swing || P.swingCD > 0 || P.dodging) { P.buffered = 0.25; return; }
  if (w.wclass === 'magie' && st.player.en < w.energy) { audio.sfx('deny'); hud.damage(P.x, 2, P.z, 'Énergie', 'block'); return; }
  const aim = combat.autoAim(w.wclass === 'distance' || w.wclass === 'magie' ? 13 : 4.5, w.wclass === 'distance' || w.wclass === 'magie' ? 0.7 : 1.4);
  if (aim !== null) P.face = aim;
  P.combo = S.time - P.comboT < 0.55 ? (P.combo + 1) % 3 : 0;
  const dur = (w.wclass === 'lourde' ? 0.62 : 0.34) / w.rate * 1.15;
  P.swing = { t: 0, dur, kind: w.wclass, combo: P.combo, hit: false };
  P.swingCD = dur + 0.05;
}
function updateSwing(dt) {
  if (!P.swing) return;
  const sw = P.swing; sw.t += dt;
  const k = sw.t / sw.dur;
  if (!sw.hit && k > (sw.kind === 'lourde' ? 0.5 : 0.3)) {
    sw.hit = true;
    const w = calcStats(st).weapon;
    if (sw.kind === 'distance' || sw.kind === 'magie') { if (sw.kind === 'magie') st.player.en -= w.energy; combat.ranged(); }
    else combat.melee({ mult: sw.combo === 2 ? 1.4 : 1 });
  }
  if (k >= 1) { P.swing = null; P.comboT = S.time; }
}
function special() {
  if (!st.player.abilities.onde) { G.hintOnce('onde', 'Fia ne sait pas encore libérer d’onde de lumière.'); return; }
  if (st.player.en < 35) { audio.sfx('deny'); hud.damage(P.x, 2, P.z, 'Énergie', 'block'); return; }
  if (P.spinT > 0) return;
  st.player.en -= 35; P.spinT = 0.45; P.swing = null;
  combat.onde();
}
function chargeSpin() { P.spinT = 0.45; P.swing = null; combat.melee({ spin: true, mult: 1.8 }); sparks.burst(new THREE.Vector3(P.x, 1, P.z), '#9fe9ff', 30, 5, 1); }
function dodge() {
  if (P.dodgeCD > 0 || P.dodging) return;
  const a = input.axis();
  let ang = P.face;
  if (Math.hypot(a.x, a.y) > 0.2) { const fx = -Math.sin(S.yaw), fz = -Math.cos(S.yaw), rx = Math.cos(S.yaw), rz = -Math.sin(S.yaw); ang = Math.atan2(rx * a.x + fx * a.y, rz * a.x + fz * a.y); }
  P.dodging = true; P.dodgeT = 0; P.dodgeDir = ang; P.dodgeCD = 0.55; P.swing = null; P.dodgeNoted = false; P.face = ang;
  audio.sfx('dodge');
}

/* =========================================================
   Finale de l'acte I (le phare se rallume)
   ========================================================= */
function startFinale() {
  const b = isl.ents.find((e) => e.t === 'beacon');
  S.finale = { t: 0, at: new THREE.Vector3(W(b.x), 2 + heightAt(W(b.x), W(b.y)), W(b.y)), from: { yaw: S.yaw, dist: S.dist, pitch: S.pitch } };
  S.mode = 'cutscene'; setTouch(false); hud.prompt('');
  audio.chord([392, 494, 587, 784, 988], 0.4);
  const first = platform.reward('g:' + IID + ':end', 120, 40);
  const done = platform.reward('done:' + IID, 600, 200);
  platform.finish(IID, st.playTime);
  S.finaleRewards = { xp: (first ? first.xp : 0) + (done ? done.xp : 0), coins: (first ? first.coins : 0) + (done ? done.coins : 0) };
  gainXp(150); updateChestVisibility();
  if (META.finaleGive) giveItem(META.finaleGive, 1);   /* ACTE V : le fragment du Prisme apparaît au-dessus de la flamme */
  autosave();
}

/* ACTE VI : fin du jeu (voir game/fin.js). replay : revoir la scène sans reprendre les récompenses. */
function startEnding(replay) {
  if (!fin || fin.active) return;
  packPosition(); S.boss = null; hud.bossBar(null);
  if (!replay) { gainXp(300); updateChestVisibility(); }
  fin.start({ replay });
  autosave();
}

/* =========================================================
   Carte
   ========================================================= */
G.drawMap = (cv) => {
  const g = cv.getContext('2d');
  const outdoor = zones.filter((z) => !z.interior);
  let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0;
  outdoor.forEach((z) => { x0 = Math.min(x0, z.ox); y0 = Math.min(y0, z.oy); x1 = Math.max(x1, z.ox + z.map[0].length); y1 = Math.max(y1, z.oy + z.map.length); });
  const MNT = !!(isl.alt && DEF.layout);   /* MONTAGNE : plan teinté par l'altitude à gauche, coupe de la montagne à droite */
  const AW = MNT ? Math.round(cv.width * 0.52) : cv.width;
  const s = Math.min((AW - 20) / (x1 - x0), (cv.height - 20) / (y1 - y0)), ox = (AW - (x1 - x0) * s) / 2 - x0 * s, oy = (cv.height - (y1 - y0) * s) / 2 - y0 * s;
  g.clearRect(0, 0, cv.width, cv.height);
  const seen = (zi) => st.seen[zones[zi].id];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const t = isl.terrain[y] && isl.terrain[y][x]; if (!t || t === ' ') continue;
    const zi = isl.zoneAt[y][x];
    if (t === '=') { const gt = isl.gates[isl.gateCell[x + ',' + y]]; if (!gt.open) continue; g.fillStyle = '#e8b65a'; }
    else { if (zi < 0 || !seen(zi) || zones[zi].interior) continue; const th = themeOf(zones[zi]); g.fillStyle = t === '#' || t === 'T' ? 'rgba(255,255,255,.18)' : t === '~' ? '#5fa8e8' : t === 'H' ? 'rgba(240,198,107,.55)' : t === ',' ? 'rgba(232,214,180,.6)' : t === 'r' ? '#3f5a32' : t === 'x' ? '#9fe9ff' : th === 'sanctuaire' ? 'rgba(160,140,220,.5)' : th === 'temple' ? 'rgba(120,190,220,.5)' : th === 'foret' || th === 'canopee' || th === 'phare_verre' ? 'rgba(110,210,180,.55)' : th === 'zenith' || th === 'jardins' || th === 'salle' || th === 'phare_zenith' ? 'rgba(240,214,150,.6)' : th === 'lande' ? 'rgba(180,200,120,.5)' : zones[zi].secret ? 'rgba(216,180,254,.5)' : 'rgba(150,220,140,.55)'; }
    g.fillRect(ox + x * s, oy + y * s, s + 0.5, s + 0.5);
    if (MNT && t !== '=') { const lv = isl.hgt[y][x] || 0; g.fillStyle = `rgba(255,255,255,${(lv / 14 * 0.42).toFixed(3)})`; g.fillRect(ox + x * s, oy + y * s, s + 0.5, s + 0.5);
      const ls = isl.hgt[y + 1] && isl.terrain[y + 1][x] !== ' ' && isl.terrain[y + 1][x] !== '=' ? isl.hgt[y + 1][x] : null; if (ls !== null && lv - ls >= 2) { g.fillStyle = 'rgba(20,40,60,.8)'; g.fillRect(ox + x * s, oy + (y + 1) * s - Math.max(1, s * 0.3), s + 0.5, Math.max(1.5, s * 0.3)); } }
    if (t === 'c' && st.player.abilities.vision && seen(zi)) { g.fillStyle = '#ffe2a0'; g.fillRect(ox + x * s + s * 0.25, oy + y * s + s * 0.25, s * 0.5, s * 0.5); }
  }
  g.font = '600 13px Inter, sans-serif'; g.textAlign = 'center';
  outdoor.forEach((z, i) => { const zi = zoneIndex[z.id]; if (!seen(zi) || (!z.area && z.id !== 'z1' && z.id !== 'z4' && z.id !== 'z7' && z.id !== 'phare' && z.id !== 'can2' && z.id !== 'phare_f' && z.id !== 'f2' && z.id !== 'jz2' && z.id !== 'phare_z')) return; const name = z.area ? z.title : DEF.regions[z.region].name; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(name, ox + (z.ox + z.map[0].length / 2) * s + 1, oy + (z.oy + 1.4) * s + 1); g.fillStyle = '#fff'; g.fillText(name, ox + (z.ox + z.map[0].length / 2) * s, oy + (z.oy + 1.4) * s); });
  // coffres (vision), cristaux de voyage, objectif
  if (st.player.abilities.vision) Object.values(world.chestViews).forEach((c) => { if (c.open || !c.g.visible || !seen(c.zi) || zones[c.zi].interior) return; g.fillStyle = '#ffe2a0'; g.font = '700 14px Inter'; g.fillText('✧', ox + (c.x + 0.5) * s, oy + (c.y + 0.9) * s); });
  WARPS.forEach((w) => { if (!st.world.warps[w.id]) return; const z = zones[zoneIndex[w.zone]]; g.fillStyle = '#9fe9ff'; g.font = '700 16px Inter'; g.fillText('✦', ox + (z.ox + w.cell[0] + 0.5) * s, oy + (z.oy + w.cell[1] + 0.9) * s); });
  const qt = quests.tracked(), stp = qt ? quests.step(qt) : null;
  if (stp && stp.zone && zoneIndex[stp.zone] !== undefined) { const z = zones[zoneIndex[stp.zone]]; const npc = stp.npc && npcs.find((n) => n.id === stp.npc); let mx, my; if (npc && !zones[npc.zi].interior) { mx = npc.x / T; my = npc.z / T; } else { mx = z.ox + z.map[0].length / 2; my = z.oy + z.map.length / 2; } g.fillStyle = '#ffc861'; g.font = '800 22px Inter'; g.fillText('◆', ox + (mx + 0.5) * s, oy + (my + 0.9) * s); }
  if (MNT) mountainProfile(g, cv, AW, x0, x1, outdoor, seen);
  // Lyra
  const inside = zones[S.zone] && zones[S.zone].interior;
  const px = inside ? (zones[S.zone].id === 'auberge_in' ? W(5) : W(23)) / T : P.x / T, py = inside ? 4 : P.z / T;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(ox + (px + 0.5) * s, oy + (py + 0.5) * s, Math.max(4, s * 0.8), 0, 7); g.fill(); g.strokeStyle = '#3e3f9c'; g.lineWidth = 2.5; g.stroke();
};


/* MONTAGNE : coupe (vue de face, depuis le sud) : silhouette du massif par colonne, niveaux, zones visitées et position de Lyra */
function mountainProfile(g, cv, AW, x0, x1, outdoor, seen) {
  const X0 = AW + 24, X1 = cv.width - 14, Y0 = 56, Y1 = cv.height - 44, MAXL = 14;
  const lvl = (y) => Y1 - (y / MAXL) * (Y1 - Y0);
  const sx = (X1 - X0) / (x1 - x0);
  g.save();
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(AW + 8, 8, cv.width - AW - 16, cv.height - 16);
  g.font = '700 17px Inter, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8f6f4'; g.fillText('Coupe de la montagne', AW + 20, 34);
  // graduations d'altitude
  g.font = '600 13px Inter, sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1;
  for (let l = 0; l <= MAXL; l += 2) { g.beginPath(); g.moveTo(X0, lvl(l)); g.lineTo(X1, lvl(l)); g.stroke(); g.fillText(String(l), X0 - 22, lvl(l) + 4); }
  // silhouette : pour chaque colonne, le niveau le plus haut ; couleur de la zone qui porte ce sommet
  for (let x = x0; x < x1; x++) {
    let best = -1, bz = -1; for (let y = 0; y < isl.h; y++) { const t = isl.terrain[y][x]; if (!t || t === ' ' || t === '=') continue; const zi = isl.zoneAt[y][x]; if (zi >= 0 && zones[zi].interior) continue; const lv = isl.hgt[y][x] || 0; if (lv > best) { best = lv; bz = zi; } }
    if (best < 0) continue;
    const vis = bz >= 0 && seen(bz);
    g.fillStyle = vis ? 'rgba(120,214,190,.9)' : 'rgba(150,170,190,.32)';
    g.fillRect(X0 + (x - x0) * sx, lvl(best), sx + 0.6, Y1 - lvl(best) + 1);
    g.fillStyle = vis ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.18)'; g.fillRect(X0 + (x - x0) * sx, lvl(best), sx + 0.6, 2);
  }
  // paliers : un repère par zone visitée à son altitude moyenne
  g.font = '700 13px Inter, sans-serif'; g.textAlign = 'center';
  const lab = { vitrebourg: 'Vitrebourg', lisiere: 'Lisière', f2: 'Vitraux', belv: 'Belvédère', temple: 'Temple', sentier_t: 'Portique', can1: 'Canopée', can3: 'Passerelle', phare_f: 'Phare' };
  outdoor.forEach((z) => { const zi = zoneIndex[z.id]; if (!lab[z.id] || !seen(zi)) return; let sum = 0, n = 0, mx = 0; z.map.forEach((row, ly) => { for (let lx = 0; lx < row.length; lx++) if (row[lx] !== ' ') { sum += isl.hgt[z.oy + ly][z.ox + lx] || 0; n++; } }); mx = z.ox + z.map[0].length / 2; const lv = n ? sum / n : 0;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(lab[z.id], X0 + (mx - x0) * sx + 1, lvl(lv) - 7); g.fillStyle = '#fff'; g.fillText(lab[z.id], X0 + (mx - x0) * sx, lvl(lv) - 8); });
  // phare au sommet
  g.font = '700 22px Inter, sans-serif'; g.fillStyle = '#ffe9a8'; { const z = zones[zoneIndex.phare_f]; if (z) g.fillText('✦', X0 + (z.ox + z.map[0].length / 2 - x0) * sx, lvl(13) - 26); }
  // Lyra
  const inside = zones[S.zone] && zones[S.zone].interior;
  if (!inside) { const lx = P.x / T, lv = isl.hgt[Math.round(P.z / T)] ? heightAt(P.x, P.z) / 0.75 : 0; g.fillStyle = '#fff'; g.strokeStyle = '#3e3f9c'; g.lineWidth = 3; g.beginPath(); g.arc(X0 + (lx + 0.5 - x0) * sx, lvl(lv), 7, 0, 7); g.fill(); g.stroke();
    g.font = '700 15px Inter, sans-serif'; g.textAlign = 'right'; g.fillStyle = '#ffe9a8'; g.fillText(`Altitude ${Math.round(lv)} / 13`, X1, cv.height - 18); }
  g.restore();
}

/* =========================================================
   Complétion
   ========================================================= */
function completion() {
  const mine = (k) => (QUESTS[k].island || 'aube') === IID;
  const mainQ = Object.keys(QUESTS).filter((k) => QUESTS[k].kind === 'main' && mine(k)), sideQ = Object.keys(QUESTS).filter((k) => QUESTS[k].kind === 'side' && mine(k));
  const chests = Object.keys(world.chestViews);
  const parts = [
    [mainQ.filter((q) => quests.state(q) === 'done').length, mainQ.length, 25],
    [MAIN_GATES.filter((g) => isl.gates[g] && isl.gates[g].open).length, MAIN_GATES.length, 15],
    [SECRET_GATES.filter((g) => isl.gates[g].open).length, SECRET_GATES.length, 8],
    [sideQ.filter((q) => quests.state(q) === 'done').length, sideQ.length, 22],
    [G.counts('shards'), G.countAll('shard'), 8],
    [G.pageList().filter((p) => p.found).length, G.pageList().length, 6],
    [chests.filter((c) => st.world.chests[c]).length, chests.length, 8],
    [isl.ents.filter((e) => e.t === 'wisp' && st.world.picked[e.id]).length, isl.ents.filter((e) => e.t === 'wisp').length, 3],
    [Math.min(2, st.player.fragments), 2, 3],
    [st.flags[META.boss] ? 1 : 0, 1, 2],
  ];
  return Math.floor(parts.reduce((a, [n, t, w]) => a + (t ? (n / t) * w : w), 0));
}
G.completion = completion;
G.completionAll = () => globalCompletion(ISLANDS, ISLAND_META, st, QUESTS, { id: IID, pct: completion() });   /* ACTE VI */

/* =========================================================
   Événements de jeu
   ========================================================= */
ev.on('quest:start', ({ q }) => { audio.sfx('quest'); hud.toast(q.kind === 'main' ? '◆' : '!', q.kind === 'main' ? 'Nouvelle quête principale' : 'Nouvelle quête', q.title, 'reward'); npcMarkers(); hud.refresh(); });
ev.on('quest:step', ({ q, step }) => { hud.toast('✓', q.title, step.text); npcMarkers(); hud.refresh(); });
ev.on('quest:done', () => { snd('quest_done'); npcMarkers(); hud.refresh(); });
ev.on('kill', (k) => {
  quests.check();
  if (k.room && !combat.roomAlive(k.room)) setTimeout(() => { openGate(k.room); hud.toast('✦', 'Le sceau se dissipe', 'La salle est libérée.'); autosave(); }, 500);
  if (k.boss) setTimeout(() => bossDefeated(k), 1200);
  hud.refresh();
});
G.bossStart = (e) => { S.boss = e; music('boss', 1); hud.banner(e.def.place || 'Le Sanctuaire de Brume', e.def.name); };
function bossDefeated(k) {
  const def = ENEMIES[(k && k.type) || 'colosse'] || ENEMIES.colosse;
  if (def.bossFlag === 'boss_marees') {   /* ACTE IV : le Gardien des Marées */
    st.flags.boss_marees = 1; S.boss = null; hud.bossBar(null);
    audio.chord([392, 523, 659, 784, 1047], 0.15); S.victoryUntil = performance.now() + 20000; music('victoire', 1);
    hud.banner('Victoire', 'Le Gardien des Marées s’apaise');
    reward('b:' + IID + ':gardien', 320, 110);
    updateChestVisibility();
    st.world.warps.grottes = 1;
    quests.check(); autosave();
    setTimeout(() => hud.toast('✦', 'Un cristal de voyage s’est réveillé', 'Il te ramène au Hall des Grottes quand tu veux. Le pont vers le Phare des Abysses se déploie.'), 2500);
    return;
  }
  const flag = def.bossFlag || 'boss_colosse', verre = flag === 'boss_verre', meunier = flag === 'boss_meunier' /* ACTE V */, zen = flag === 'boss_zenith' /* ACTE VI */, win = def.win || null;   /* ACTE III : win = fin de boss propre à l'île */
  st.flags[flag] = 1; S.boss = null; hud.bossBar(null);
  audio.chord([392, 523, 659, 784, 1047], 0.15); S.victoryUntil = performance.now() + 20000; music('victoire', 1);
  if (win) A3.bossWon(def); else hud.banner('Victoire', zen ? 'L’Ombre du Prisme est dissipée' : verre ? 'Le Gardien de Verre est brisé' : meunier ? 'Le Grand Meunier est délivré' : 'Le Colosse de Brume est dissipé');
  if (!verre && !meunier && !zen && !win) giveItem('lentille', 1);
  reward('b:' + IID + ':' + (win ? win.key : zen ? 'ombre' : verre ? 'gardien' : meunier ? 'meunier' : 'colosse'), win ? win.xp : zen ? 600 : meunier ? 360 : verre ? 300 : 250, win ? win.coins : zen ? 200 : meunier ? 120 : verre ? 100 : 80);
  if (zen) { openGate('b_zenith'); S.restoreT = restoreLevel(); }   /* ACTE VI : le pont du Zénith se déploie */
  updateChestVisibility();
  if (!win) st.world.warps[zen ? 'salle' : verre ? 'temple' : meunier ? 'moulins' : 'sanctuaire'] = 1;
  quests.check(); autosave();
  if (!win) setTimeout(() => hud.toast('✦', 'Un cristal de voyage s’est réveillé', zen ? 'Il te ramène à la Grande Salle quand tu veux. Le dernier fragment t’attend dans le coffre de l’arène, et le pont du Zénith est ouvert.' : meunier ? 'Il te ramène au Moulin quand tu veux. Le cœur du Grand Meunier t’attend dans le coffre de l’arène.' : verre ? 'Il te ramène au Temple de Verre quand tu veux. Le fragment vert t’attend dans le coffre de l’arène.' : 'Il te ramène à Havre-Aube quand tu veux.'), 2500);
}

/* =========================================================
   Particules
   ========================================================= */
function createSparks() {
  const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), vel = new Float32Array(n * 3), life = new Float32Array(n), grav = new Float32Array(n);
  for (let i = 0; i < n; i++) pos[i * 3 + 1] = -9999;
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  mesh.frustumCulled = false; scene.add(mesh);
  let k = 0;
  return {
    burst(p, color, count = 30, speed = 4, up = 2, g = 6, l = 0.9) {
      const c = new THREE.Color(color).multiplyScalar(2.5);
      for (let j = 0; j < count; j++) {
        const i = k; k = (k + 1) % n;
        const a = Math.random() * Math.PI * 2, el = Math.random() * 1.4 - 0.3, s = speed * (0.3 + Math.random() * 0.7);
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y + heightAt(p.x, p.z); pos[i * 3 + 2] = p.z;   /* ALTITUDE : y relatif au sol */
        vel[i * 3] = Math.cos(a) * Math.cos(el) * s; vel[i * 3 + 1] = Math.sin(el) * s + up; vel[i * 3 + 2] = Math.sin(a) * Math.cos(el) * s;
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; life[i] = l * (0.6 + Math.random() * 0.6); grav[i] = g;
      }
    },
    update(dt) {
      for (let i = 0; i < n; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt; if (life[i] <= 0) { pos[i * 3 + 1] = -9999; continue; }
        vel[i * 3 + 1] -= grav[i] * dt;
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        const f = 1 - dt * 1.6; col[i * 3] *= f; col[i * 3 + 1] *= f; col[i * 3 + 2] *= f;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    },
  };
}
const ambient = (() => {
  const n = LOW ? 70 : 160, pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 50; pos[i * 3 + 1] = Math.random() * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 50; seed[i] = Math.random() * 10; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.16, color: new THREE.Color('#ffc4dc').multiplyScalar(1.4), transparent: true, opacity: 0.85, depthWrite: false });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  return { pts, pos, seed, n, mat };
})();

/* =========================================================
   Tactile
   ========================================================= */
function setTouch(on) { $('#touch').hidden = !(on && input.touch); }

/* =========================================================
   Boucle
   ========================================================= */
const tmpV = new THREE.Vector3(), tint = new THREE.Color(), cA = new THREE.Color(), cB = new THREE.Color();
let last = performance.now(), fpsAcc = 0, fpsN = 0, qualityChecked = settings.quality !== 'auto', elapsed = 0;
const amb = { fogNear: 75, fogFar: 220, hemi: 1, sun: 1 };

function onZoneChange(zi, prev) {
  const z = zones[zi];
  if (prev >= 0 && prev !== zi) combat.clearZone(prev);
  combat.spawnZone(zi);
  world.showZones(zi);
  const first = !st.seen[z.id];
  st.seen[z.id] = 1;
  const rn = DEF.regions[z.region] ? DEF.regions[z.region].name : z.title;
  const prevZ = zones[prev];
  if (!prevZ || prevZ.region !== z.region || first) {
    if (z.area) hud.banner(z.interior ? rn : z.dungeon ? 'Donjon' : 'Région', z.title);   /* ACTE III : nom de la région (et non « Havre-Aube ») */
    else if (!z.secret) hud.banner(rn, z.title);
    else hud.banner('Chambre secrète', z.title);
  }
  if (first && (!z.area || z.hint)) { const g = z.ents.find((e) => e.gate && !e.optional); if (!(g && isl.gates[g.gate] && isl.gates[g.gate].open)) setTimeout(() => hud.toast('💡', z.title, z.hint), 900); }
  WARPS.forEach((w) => { if (w.zone === z.id && !w.needs) st.world.warps[w.id] = 1; });
  if ((z.dungeon || z.respawn) && first) { st.player.respawn = { zone: z.id, cell: z.spawn }; snd('checkpoint'); setTimeout(() => hud.toast('⚠', z.title, 'Si tu tombes ici, Fia te ramènera à l’entrée.'), 1500); }
  A3.zoneChange(zi);   /* ACTE III */
  const th = themeOf(z);
  music(S.boss ? 'boss' : z.music || th, S.restore);
  quests.check(); npcMarkers(); hud.refresh();
  autosave();
}

/* ACTE V : mécaniques des Pics du Vent (planer, relais temporisés, portails) */
const mech = createPicsMech({ THREE, isl, P, S, W, T, audio, snd, hud, sparks, input, setTouch, canStand, teleport, fade, autosave, reEvaluate, zones, pics, IID, st: () => st });

function update(dt) {
  elapsed += dt; const t = elapsed;
  S.time = elapsed;
  /* -------- commandes globales -------- */
  if (S.mode === 'play') {
    if (input.take('pause')) { screens.menu('options'); S.mode = 'screen'; setTouch(false); }
    else if (input.take('inventory')) { screens.menu('inventaire'); S.mode = 'screen'; setTouch(false); }
    else if (input.take('journal')) { screens.menu('journal'); S.mode = 'screen'; setTouch(false); }
    else if (input.take('map')) { screens.menu('carte'); S.mode = 'screen'; setTouch(false); }
    else if (input.take('character')) { screens.menu('personnage'); S.mode = 'screen'; setTouch(false); }
  } else if (S.mode === 'screen') {
    if (input.take('pause') || (screens.current === 'menu' && (input.take('inventory') || input.take('journal') || input.take('map') || input.take('character')))) { if (S.wardrobe) G.wardrobeCam(false); screens.close(); }
    input.clear();
  } else if (S.mode === 'dialog') {
    if (input.take('interact') || input.take('dodge') || input.take('attack')) screens.nextLine();
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((k, i) => { if (input.keyDown(k) && !S['_k' + k]) { S['_k' + k] = true; screens.choose(i); } if (!input.keyDown(k)) S['_k' + k] = false; });
    if (input.take('pause')) screens.nextLine();
    input.clear();
  }
  if (screens.current && S.mode === 'play') S.mode = screens.current === 'dialog' ? 'dialog' : 'screen';

  /* -------- joueur -------- */
  const s = calcStats(st), p = st.player;
  if (S.mode === 'play' && P.alive) {
    st.playTime += dt;
    P.swingCD -= dt; P.dodgeCD -= dt; P.iframes -= dt; P.hurtT -= dt; P.spinT -= dt;
    if (input.take('dodge')) dodge();
    if (input.take('attack')) { if (P.chargeT > 0.55 && p.abilities.charge) chargeSpin(); else startSwing(); }
    if (P.buffered > 0) { P.buffered -= dt; if (!P.swing && P.swingCD <= 0) { P.buffered = 0; startSwing(); } }
    if (input.take('special')) special();
    if (input.take('portal')) mech.portalKey();   /* ACTE V */
    if (input.take('potion')) G.useQuick();
    // coup chargé
    const w = s.weapon;
    if (input.attackHeld() && p.abilities.charge && w && (w.wclass === 'lame' || w.wclass === 'lourde')) P.chargeT += dt;
    else { if (P.chargeT > 0.55 && p.abilities.charge && !input.attackHeld()) chargeSpin(); P.chargeT = 0; }
    if (input.take('interact')) interact(false);
    if (input.take('reverse')) interact(true);
    updateSwing(dt);
    // déplacement
    const a = input.axis();
    const fx = -Math.sin(S.yaw), fz = -Math.cos(S.yaw), rx = Math.cos(S.yaw), rz = -Math.sin(S.yaw);
    let speed = 5.8 * s.speed * (P.swing ? 0.35 : 1) * (P.chargeT > 0.2 ? 0.5 : 1);
    let tx = (rx * a.x + fx * a.y) * speed, tz = (rz * a.x + fz * a.y) * speed;
    if (P.dodging) {
      P.dodgeT += dt; const k = P.dodgeT / 0.36;
      tx = Math.sin(P.dodgeDir) * 12 * (1 - k * 0.6); tz = Math.cos(P.dodgeDir) * 12 * (1 - k * 0.6);
      P.vx = tx; P.vz = tz;
      if (k >= 1) { P.dodging = false; P.iframes = Math.max(P.iframes, 0.05); }
    } else { P.vx = lerp(P.vx, tx, damp(14, dt)); P.vz = lerp(P.vz, tz, damp(14, dt)); }
    const kx = P.kbx * dt, kz = P.kbz * dt; P.kbx *= Math.exp(-9 * dt); P.kbz *= Math.exp(-9 * dt);
    const nx = P.x + P.vx * dt + kx, nz = P.z + P.vz * dt + kz;
    if (canStand(nx, P.z, 0.34, P.x, P.z)) P.x = nx; else { P.vx = 0; P.kbx = 0; }
    if (canStand(P.x, nz, 0.34, P.x, P.z)) P.z = nz; else { P.vz = 0; P.kbz = 0; }
    const sp = Math.hypot(P.vx, P.vz);
    if (sp > 0.6 && !P.dodging) { P.stepT = (P.stepT || 0) - dt; if (P.stepT <= 0) { audio.step(groundAt()); P.stepT = sp > 6.5 ? 0.26 : 0.38; } } else P.stepT = 0;
    if (sp > 0.3 && !P.swing && !P.dodging) P.face += angleTo(P.face, Math.atan2(P.vx, P.vz)) * damp(12, dt);
    // énergie
    p.en = Math.min(s.maxEn, p.en + s.regen * dt * (P.swing ? 0.3 : 1));
    if (P.buffRegen > 0) { const h = Math.min(P.buffRegen, dt * 3); P.buffRegen -= h; p.hp = Math.min(s.maxHp, p.hp + h); }
    // zone
    const zi = G.zoneIndexAt(P.x, P.z);
    if (zi >= 0 && zi !== S.zone) { const prev = S.zone; S.zone = zi; onZoneChange(zi, prev); }
    // sortie d'un intérieur
    const z = zones[S.zone];
    if (z && z.exit) { const [ex, ez] = cellCenter(z, z.exit.cell); if (Math.hypot(ex - P.x, ez - P.z) < 1.1) { const oz = zones[zoneIndex[z.exit.to]]; audio.sfx('door'); fade(() => { teleport(W(oz.ox + z.exit.at[0]), W(oz.oy + z.exit.at[1]) + 0.6); P.face = 0; }); } }
    checkPickups();
    if (Math.floor(t * 5) !== Math.floor((t - dt) * 5)) approachBridges();
    // cible d'interaction
    if (Math.floor(t * 10) !== Math.floor((t - dt) * 10)) {
      { const pb = document.getElementById('t-portal'); if (pb) pb.hidden = !p.abilities.portails; }   /* ACTE V */
      const tg = findTarget(); S.target = tg;
      hud.prompt(tg ? (input.touch ? `✋ ${esc(tg.label)}` : `<kbd>E</kbd> ${esc(tg.label)}${tg.alt ? ` · <kbd>R</kbd> ${tg.alt}` : tg.kind === 'device' && tg.e.t !== 'mirror' && tg.e.t !== 'splitter' ? ' · <kbd>R</kbd> autre sens' : ''}`) : '');
    }
    if (S.time - S.lastSave > 60) saveTo('auto');
    // salles de combat : barrière fermée tant que des créatures vivent
  }
  /* ALTITUDE : sol sous Lyra (pendant le grappin / le plané, interpolé entre départ et arrivée pour ne pas « sauter » sur une falaise) */
  { const gg = (S.mode === 'grapple' && S.grap) || (S.mode === 'glide' && S.glide);
    if (gg && gg.dur) { const kk = Math.min(1, gg.t / gg.dur), ee = kk * kk * (3 - 2 * kk); P.gy = lerp(heightAt(gg.from.x, gg.from.z), heightAt(gg.to.x, gg.to.z), ee); }
    else P.gy = heightAt(P.x, P.z); }
  /* -------- combats -------- */
  if (S.mode === 'grapple') updateGrapple(dt);
  if (S.mode === 'glide') mech.updateGlide(dt, t);   /* ACTE V */
  mech.tick(dt); pics.update(dt, t, st);
  if (S.mode === 'play' || S.mode === 'dialog' || S.mode === 'cutscene' || S.mode === 'grapple' || S.mode === 'glide') combat.update(S.mode === 'play' || S.mode === 'grapple' || S.mode === 'glide' ? dt : 0);
  /* -------- personnage -------- */
  const moving = Math.hypot(P.vx, P.vz) / 5.8;
  hero.root.position.set(P.x, P.y, P.z);
  hero.root.rotation.y = P.face;
  const flick = P.iframes > 0 && !P.dodging && Math.sin(t * 40) > 0;
  hero.root.visible = !flick || S.mode !== 'play';
  hero.animate(dt, {
    move: S.mode === 'play' ? Math.min(1, moving) : 0,
    swing: P.swing ? { t: P.swing.t / P.swing.dur, kind: P.swing.kind, combo: P.swing.combo } : null,
    dodge: P.dodging && S.mode !== 'grapple' ? Math.min(1, P.dodgeT / 0.36) : 0, hurt: P.hurtT > 0 ? P.hurtT / 0.4 : 0,
    spin: P.spinT > 0 ? 1 - P.spinT / 0.45 : 0, talk: false, grapple: S.mode === 'grapple' || S.mode === 'glide', dead: !P.alive,
  });
  chargeRing.position.set(P.x, 0.08, P.z); chargeRing.material.opacity = P.chargeT > 0.2 ? Math.min(0.9, (P.chargeT - 0.2) * 2) : 0; chargeRing.scale.setScalar(P.chargeT > 0.55 ? 1.3 + Math.sin(t * 20) * 0.08 : 1);
  const fa = t * 1.6;
  fia.position.set(P.x + Math.cos(fa) * 0.75, 1.75 + Math.sin(t * 2.3) * 0.12, P.z + Math.sin(fa) * 0.75);
  if (P.spinT > 0) fia.position.set(P.x + Math.cos(t * 20) * 1.4, 1.1, P.z + Math.sin(t * 20) * 1.4);
  hero.root.updateMatrixWorld(true); hero.fiaWorld(fiaLight.position);
  fiaLight.intensity = LOW ? 0 : (['sanctuaire', 'temple', 'grotte', 'lac', 'phare_abysses' /* ACTE IV */, 'moulins' /* ACTE V */].includes(themeOf(zones[S.zone])) ? 14 : 6) * (P.chargeT > 0.55 ? 1.6 : 1);
  A3.update(dt, t);   /* ACTE III : tempêtes de sable, objet porté, Orbe */
  const tg = S.target;
  if (tg && (tg.kind === 'device' || tg.kind === 'orbsocle' || tg.kind === 'socle' || tg.kind === 'carry') && S.mode === 'play') { selRing.visible = true; selRing.position.set(tg.x, 0.47, tg.z); selRing.scale.setScalar(1 + Math.sin(t * 5) * 0.04); } else selRing.visible = false;
  /* -------- habitants -------- */
  npcs.forEach((n) => {
    if (!world.zoneGroups[n.zi].visible) return;
    const dP = Math.hypot(P.x - n.x, P.z - n.z);
    let mv = 0;
    if (n.wander && !n.talking) {
      n.wt -= dt;
      if (n.wt < 0) { n.wt = rand(2, 5); const a = Math.random() * 6; n.tx = n.hx + Math.cos(a) * n.wander * Math.random() * T; n.tz = n.hz + Math.sin(a) * n.wander * Math.random() * T; }
      const dx = n.tx - n.x, dz = n.tz - n.z, l = Math.hypot(dx, dz);
      if (l > 0.2 && dP > 1.6) { const nx = n.x + (dx / l) * 1.6 * dt, nz = n.z + (dz / l) * 1.6 * dt; if (canStand(nx, nz, 0.3)) { n.x = nx; n.z = nz; mv = 0.35; n.face += angleTo(n.face, Math.atan2(dx, dz)) * damp(6, dt); } else n.wt = 0; }
    }
    if (dP < 5.5 || n.talking) n.face += angleTo(n.face, Math.atan2(P.x - n.x, P.z - n.z)) * damp(4, dt);
    else if (!n.wander) n.face += angleTo(n.face, n.baseFace) * damp(2, dt);
    n.c.root.position.set(n.x, 0, n.z); n.c.root.rotation.y = n.face;
    n.c.animate(dt, { move: mv, talk: n.talking && Math.sin(t * 2) > -0.3, wave: !n.talking && dP < 3.2 && dP > 2.2 && n.id === 'tobias' });
    n.mk.position.set(n.x, 2.65 * (n.d.look.scale || 1) + 0.25 + Math.sin(t * 3) * 0.1, n.z); n.gem.rotation.y += dt * 2;
  });
  /* -------- caméra -------- */
  const cam = input.camera();
  /* CAMÉRA FIXE : seul le zoom (molette / pincement) reste au joueur ; yaw et inclinaison ne bougent plus */
  if (S.mode === 'play') S.dist = clamp(S.dist + cam.zoom * 0.012, 9, 30);
  S.yaw = lerp(S.yaw, S.yawT, damp(10, dt));
  const inside = zones[S.zone] && zones[S.zone].interior;
  if (S.mode === 'title') {
    const c = new THREE.Vector3(W(30), 0, W(16)), a = t * 0.04;
    camera.position.set(c.x + Math.cos(a) * 70, 42, c.z + Math.sin(a) * 70); camera.lookAt(c.x, -2, c.z); S.camT.copy(c);
  } else if (S.mode === 'cutscene' && S.finale) {
    const F = S.finale; F.t += dt;
    const k = Math.min(1, F.t / 4.5), e = k * k * (3 - 2 * k);
    S.camT.lerp(F.at, damp(2, dt));
    const yaw = F.from.yaw + e * 1.6, dist = lerp(F.from.dist, 30, e), pitch = lerp(F.from.pitch, 0.55, e);
    camera.position.set(S.camT.x + Math.sin(yaw) * Math.cos(pitch) * dist, S.camT.y + Math.sin(pitch) * dist, S.camT.z + Math.cos(yaw) * Math.cos(pitch) * dist);
    camera.lookAt(S.camT.x, S.camT.y + 2 * e, S.camT.z);
    S.restoreT = 1;
    if (F.t > 6.5) { S.finale = null; S.mode = 'play'; setTouch(true); hud.banner(META.finale.title, META.finale.sub); quests.check(); npcMarkers(); }
  } else if (S.mode === 'ending' && fin) {
    fin.update(dt);   /* ACTE VI : la caméra appartient à la séquence de fin */
  } else if (S.wardrobe) {
    tmpV.set(P.x, P.gy + 1.0, P.z); S.camT.lerp(tmpV, damp(6, dt));
    const yaw = P.face + 0.35, d = 5.2, pitch = 0.22;
    camera.position.set(S.camT.x + Math.sin(yaw) * Math.cos(pitch) * d - Math.cos(yaw) * 1.3, S.camT.y + Math.sin(pitch) * d + 0.2, S.camT.z + Math.cos(yaw) * Math.cos(pitch) * d + Math.sin(yaw) * 1.3);
    camera.lookAt(S.camT.x - Math.cos(yaw) * 1.3, S.camT.y, S.camT.z + Math.sin(yaw) * 1.3);
  } else {
    const focus = S.mode === 'dialog' && S.talkTo ? tmpV.set((P.x + S.talkTo.x) / 2, (P.gy + heightAt(S.talkTo.x, S.talkTo.z)) / 2 + 0.8, (P.z + S.talkTo.z) / 2) : tmpV.set(P.x, P.gy + 0.8, P.z);   /* ALTITUDE : la cible de caméra suit le sol */
    S.camT.lerp(focus, damp(6, dt));
    const d = S.mode === 'dialog' ? Math.min(S.dist, 11) : inside ? Math.min(S.dist, 13) : S.dist + (S.boss ? 5 : 0);
    const pitch = S.mode === 'dialog' ? 0.62 : S.pitch;
    camera.position.set(S.camT.x + Math.sin(S.yaw) * Math.cos(pitch) * d, S.camT.y + Math.sin(pitch) * d, S.camT.z + Math.cos(S.yaw) * Math.cos(pitch) * d);
    camera.lookAt(S.camT);
  }
  if (S.shake > 0) { camera.position.x += (Math.random() - 0.5) * S.shake; camera.position.y += (Math.random() - 0.5) * S.shake; S.shake = Math.max(0, S.shake - dt * 1.6); }
  audio.listener(P.x, P.z, S.yaw + Math.PI, P.gy);
  sky.position.copy(camera.position);
  sun.position.set(S.camT.x + 22, S.camT.y + 33.2, S.camT.z + 14); sun.target.position.copy(S.camT);

  /* -------- ambiance -------- */
  S.restore = lerp(S.restore, S.restoreT, damp(0.8, dt));
  if (world.setSky) world.setSky(S.restore);
  const r = S.restore, th = S.mode === 'title' ? 'village' : themeOf(zones[S.zone]), A = AMB[th] || AMB.puzzle;
  const dusk = A.sky ? A.sky[0].map((c) => cA.set(c).clone()) : PAL.dusk, dawn = A.sky ? A.sky[1].map((c) => cB.set(c).clone()) : PAL.dawn;
  const k = damp(1.5, dt);
  skyU.top.value.lerp(tint.copy(dusk[0]).lerp(dawn[0], r), k);
  skyU.bottom.value.lerp(tint.copy(dusk[1]).lerp(dawn[1], r), k);
  skyU.horizon.value.lerp(tint.copy(dusk[2]).lerp(dawn[2], r), k);
  amb.fogNear = lerp(amb.fogNear, A.fog[0], k); amb.fogFar = lerp(amb.fogFar, A.fog[1], k);
  scene.fog.near = amb.fogNear; scene.fog.far = amb.fogFar;
  scene.fog.color.lerp(A.fogColor ? tint.set(A.fogColor) : skyU.horizon.value, k);
  if (DEF.layout && isl.alt && S.mode !== 'title') {   /* MONTAGNE : plus on monte, plus la brume est proche et claire (mer de brume au pied, air vif en haut) */
    const hf = Math.min(1, Math.max(0, P.gy / HU / 13));
    scene.fog.near = amb.fogNear * (1 - 0.28 * hf); scene.fog.far = amb.fogFar * (1 - 0.2 * hf);
    scene.fog.color.lerp(tint.set('#e2f7f5'), 0.14 * hf);
    skyU.top.value.lerp(tint.set('#bfe6f4'), 0.25 * hf); skyU.bottom.value.lerp(tint.set('#e8f8f6'), 0.2 * hf);
  }
  amb.hemi = lerp(amb.hemi, A.hemi, k); amb.sun = lerp(amb.sun, A.sun, k);
  hemi.color.copy(skyU.top.value).lerp(new THREE.Color('#ffffff'), 0.5); hemi.intensity = (1.05 + r * 0.4) * amb.hemi;
  sun.intensity = (1.7 + r * 1.0) * amb.sun; sun.color.set('#ffc6b0').lerp(new THREE.Color('#fff1d6'), r);
  tint.set('#a3a0bd').lerp(new THREE.Color('#ffffff'), 0.35 + r * 0.65);
  if (A.tint) tint.lerp(new THREE.Color(A.tint), 0.25);
  world.M.grass.color.copy(tint); world.M.foliage.color.copy(tint); world.M.tuft.color.copy(tint); if (world.M.terrain) world.M.terrain.color.copy(tint);   /* ALTITUDE : maillage de relief */
  ambient.mat.opacity = th === 'interieur' ? 0 : 0.35 + r * 0.6;
  ambient.mat.color.set(A.amb || (th === 'pics' || th === 'phare_vents' ? '#eef4ff' : th === 'moulins' ? '#d8ccff' : th === 'sanctuaire' || th === 'lande' ? '#c9b6ff' : th === 'foret' || th === 'canopee' || th === 'phare_verre' || th === 'temple' || th === 'greve' || th === 'recifs' || th === 'grotte' || th === 'lac' || th === 'phare_abysses' /* ACTE IV */ ? '#bff3ff' : '#ffc4dc')).multiplyScalar(1.4);
  if (!opening.musicLock && Math.floor(t) !== Math.floor(t - dt)) music(S.mode === 'title' ? 'title' : S.victoryUntil > performance.now() ? 'victoire' : S.mode === 'ending' && S.endMusic ? S.endMusic /* ACTE VI */ : S.boss && S.boss.state !== 'dead' ? (S.boss.phase === 3 ? 'boss3' : S.boss.phase === 2 ? 'boss2' : 'boss') : (zones[S.zone] && zones[S.zone].music) || th, S.mode === 'title' ? 0.6 : r);

  /* -------- monde -------- */
  world.animate(dt, t);
  if (zscene) zscene.update(dt, t);   /* ACTE VI */
  Object.values(warpMeshes).forEach((g) => { if (g.visible) { g.userData.cr.rotation.y += dt; g.userData.cr.position.y = 1.3 + Math.sin(t * 2) * 0.12; } });
  const wv = Object.values(world.views).find((v) => v.e.t === 'wisp');
  if (wv && st.world.picked[wv.e.id] && S.mode !== 'title') { wv.g.visible = true; if (wv.g.parent !== scene) scene.add(wv.g); if (!wv.lifted) { wv.lifted = true; lift.add(wv.g); } wv.g.position.set(P.x - Math.sin(P.face) * 1.1 + Math.sin(t * 1.3) * 0.3, 0.6 + Math.sin(t * 2.1) * 0.15, P.z - Math.cos(P.face) * 1.1); }
  for (let i = 0; i < ambient.n; i++) {
    const pp = ambient.pos, sd = ambient.seed[i];
    pp[i * 3 + 1] -= dt * (0.35 + (sd % 1) * 0.3); pp[i * 3] += Math.sin(t * 0.8 + sd) * dt * 0.6 + dt * 0.4; pp[i * 3 + 2] += Math.cos(t * 0.6 + sd) * dt * 0.4;
    if (pp[i * 3 + 1] < -0.5) { pp[i * 3 + 1] = 8 + Math.random() * 2; pp[i * 3] = S.camT.x + (Math.random() - 0.5) * 50; pp[i * 3 + 2] = S.camT.z + (Math.random() - 0.5) * 50; }
  }
  ambient.pts.position.y = S.camT.y - 0.8;   /* ALTITUDE : les poussières suivent la hauteur de la caméra */
  ambient.pts.geometry.attributes.position.needsUpdate = true;
  sparks.update(dt);
  if (S.mode !== 'title') hud.update();
  hud.frame(dt);
  opening.frame();   // intro : décor 3D du titre / cinématique (reprend la caméra, le ciel et les lumières)
}

/* MONTAGNE : repère du phare. À la caméra fixe on ne voit que quelques cases devant Lyra : le Phare, tout en haut, est signalé par une
   petite boussole (direction + niveaux restants à gravir). Seulement sur les îles à relief marquées `layout` (la Forêt de Verre). */
let peakEl = null, peakT = 0;
function updatePeak(dt) {
  if (!(DEF.layout && isl.alt && zoneIndex.phare_f !== undefined)) return;
  if (!peakEl) { peakEl = document.createElement('div'); peakEl.id = 'peak-gauge'; peakEl.hidden = true; peakEl.setAttribute('aria-hidden', 'true'); peakEl.style.cssText = 'position:fixed;left:50%;top:9px;transform:translateX(-50%);z-index:6;pointer-events:none;font:700 12px Inter,system-ui,sans-serif;color:#eafffa;background:rgba(14,40,52,.55);border:1px solid rgba(160,240,220,.35);border-radius:999px;padding:3px 10px;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.6)'; document.body.appendChild(peakEl); }
  peakT -= dt; if (peakT > 0) return; peakT = 0.25;
  const z = zones[S.zone], show = S.mode === 'play' && z && !z.interior && !$('#hud').hidden;
  peakEl.hidden = !show; if (!show) return;
  const pz = zones[zoneIndex.phare_f], tx = W(pz.ox + pz.map[0].length / 2), tz = W(pz.oy + pz.map.length / 2);
  const ang = Math.atan2(tx - P.x, -(tz - P.z)), lv = Math.round(P.gy / HU), left = Math.max(0, 13 - lv);
  peakEl.innerHTML = `<span style="display:inline-block;transform:rotate(${ang.toFixed(2)}rad);color:#ffe9a8">▲</span> ✦ Phare · ${left ? left + ' niveaux à gravir' : 'au sommet'} <span style="opacity:.7">· alt. ${lv}</span>`;
}
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (S.hitstop > 0) { S.hitstop -= dt; dt *= 0.08; }
  update(dt); updatePeak(dt);
  /* ALTITUDE : pose les objets dynamiques sur le relief le temps du rendu, et règle le trou de visibilité autour de Lyra (et du PNJ en dialogue) */
  lift.apply();
  try {
    hole.cfg.enabled = !NOHOLE && ['play', 'dialog', 'screen', 'grapple', 'glide', 'dead'].includes(S.mode);
    hole.setTarget(S.mode === 'dialog' && S.talkTo ? { x: S.talkTo.x, y: heightAt(S.talkTo.x, S.talkTo.z), z: S.talkTo.z } : null);
    hole.update(camera, { x: P.x, y: P.gy + P.y, z: P.z });
    if (useBloom) composer.render(); else renderer.render(scene, camera);
  } finally { lift.restore(); }
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
applyWorld();
world.showZones(zoneIndex[META.town]);
hud.show(false);
screens.title();
const opening = createIntro(G, { scene, camera, renderer, sky, skyU, hemi, sun, world, S, LOW, REDUCED, params });
$('#loader').hidden = true;
{ // reprise automatique après un voyage entre îles
  let boot = null; try { boot = JSON.parse(sessionStorage.getItem('lumen.boot') || 'null'); sessionStorage.removeItem('lumen.boot'); } catch (e) { /* rien */ }
  if (boot) setTimeout(async () => { if (boot.then === 'new') G.startFrom(null, boot.slot, false, true); else if (boot.then === 'legacy') G.startFrom(null, boot.slot, true, true); else { const sv = await saves.read(boot.slot); if (sv) G.startFrom(sv, boot.slot, false, true); } }, 50);
  opening.boot(!!boot);
}
requestAnimationFrame(frame);
platform.onChange(() => { if (S.mode === 'title' && screens.current === 'title') screens.title(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode !== 'title' && !S.leaving) { if (S.mode === 'play') { screens.menu('options'); S.mode = 'screen'; setTouch(false); } saveTo('auto'); } });
addEventListener('pagehide', () => { if (S.mode !== 'title' && !S.leaving && !HIDDEN) { packPosition(); saves.write('auto', st, regionName(), { cloud: false }); } });
{ let hov = null, hovT = 0; document.addEventListener('pointerover', (ev) => { if (ev.pointerType !== 'mouse') return; const b = ev.target.closest && ev.target.closest('button, .choice, .btn, [data-a], [data-q]'); if (!b || b === hov || b.disabled) return; hov = b; const n = performance.now(); if (n - hovT < 70) return; hovT = n; snd('uiHover', { vol: 0.6 }); }); }
document.querySelectorAll('[data-ui]').forEach((b) => b.addEventListener('click', () => { if (S.mode !== 'play') return; const tab = b.dataset.ui; screens.menu(tab); S.mode = 'screen'; setTouch(false); audio.sfx('ui'); }));

/* Outils de test (automatisation) */
window.__lumen = {
  isl, S, P, G, get st() { return st; }, combat, quests, npcs, world, renderer, scene, camera,
  findTarget, WARPS, canStand, mech, pics,   /* ACTE V : audit des cibles d’interaction */
  set(id, v) { const e = isl.ents.find((x) => x.id === id); if (!e) return; if (e.t === 'mirror') e.state = v; else if (e.t === 'lantern') e.dir = v; else if (e.t === 'relay') e.out = v; else if (e.t === 'valve') e.state = v; /* ACTE IV */ reEvaluate(); },
  setOrb(at, dir) { isl.orb.at = at; if (dir) isl.orb.dir = dir; reEvaluate(); },   /* ACTE IV */
  tp(x, y) { P.x = W(x); P.z = W(y); },
  tpZone(id, c) { const z = zones[zoneIndex[id]]; const cc = c || z.spawn; teleport(W(z.ox + cc[0]), W(z.oy + cc[1])); },
  give: (id, n) => giveItem(id, n),
  findTarget, WARPS, canStand: (x, z) => canStand(x, z), completion, interact: () => interact(false), interactBack: () => interact(true), target: () => S.target, saveTo, openGate, a3: A3,
  fin, zscene, startEnding,   /* ACTE VI : audit de ciblage et tests */
  lift, hole, heightAt, CAM_YAW, CAM_PITCH, worldY: (o) => lift.worldY(o),   /* ALTITUDE : tests (y logique = au-dessus du sol ; worldY = y rendu) */
};
