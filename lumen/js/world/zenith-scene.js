/* =========================================================
   LUMEN — Acte VI : le décor lointain du Zénith.
   - la Brume : un anneau de nuées sombres qui encercle la citadelle (menaçante, puis dissipée à la fin) ;
   - les six phares de l’archipel, très loin (matériaux sans brouillard : on les voit même de la Porte) ;
   - les six faisceaux du phare final, de six couleurs, un vers chaque phare ;
   - le Prisme reforgé, qui s’élève au-dessus du phare.
   Rien n’est visible « en provisoire » : tout existe dès l’arrivée, éteint ou voilé.
   ========================================================= */
import * as THREE from 'three';
import { W, hash, lerp } from '../engine/util.js';

export const SIX = [
  { id: 'aube', name: 'le phare de l’Aube', c: '#ff4d6d', k: 'r' },
  { id: 'foret', name: 'le phare de la Forêt', c: '#3ee08f', k: 'g' },
  { id: 'desert', name: 'le phare du Désert', c: '#ffd84d', k: 'y' },
  { id: 'abysses', name: 'le phare des Abysses', c: '#4d8dff', k: 'b' },
  { id: 'pics', name: 'le phare des Pics', c: '#ff6bd6', k: 'm' },
  { id: 'socle', name: 'le phare du Socle', c: '#4dd8ff', k: 'c' },
];

const flat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.9, fog: false }, o));
const glow = (hex, k = 2.4) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), fog: false });

export function createZenithScene(scene, isl, zones, zoneIndex) {
  const pz = zones[zoneIndex.phare_z];
  const top = new THREE.Vector3(W(pz.ox + 11), 11, W(pz.oy + 6));   // sommet du phare : au centre des trois salles
  const mid = new THREE.Vector3(W(60), 0, W(41));                    // centre de l’île (pour l’archipel autour)
  const root = new THREE.Group(); scene.add(root);

  /* ---------- la Brume : un anneau de nuées sombres ---------- */
  const brume = new THREE.Group(); brume.position.set(mid.x, 0, mid.z); root.add(brume);
  const bm = new THREE.MeshStandardMaterial({ color: '#3d2f63', flatShading: true, roughness: 1, transparent: true, opacity: 0.86 });
  const bm2 = new THREE.MeshStandardMaterial({ color: '#6a4fa8', flatShading: true, roughness: 1, transparent: true, opacity: 0.5, emissive: '#3a1f7a', emissiveIntensity: 0.4 });
  const puffs = [];
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2 + hash(i, 1) * 0.1, r = 165 + hash(i, 2) * 40 + Math.sin(a * 3) * 12;
    const s = 6 + hash(i, 3) * 9;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), hash(i, 4) < 0.7 ? bm : bm2);
    m.position.set(Math.cos(a) * r, -8 + hash(i, 5) * 14, Math.sin(a) * r * 0.78); m.scale.y = 0.55 + hash(i, 6) * 0.3;
    m.userData = { a, r, y: m.position.y, sy: m.scale.y, k: 0.25 + hash(i, 7) * 0.5 };
    brume.add(m); puffs.push(m);
  }
  const brumeState = { k: 1 };   // 1 : pleine Brume · 0 : dissipée

  /* ---------- les six phares de l’archipel ---------- */
  const lights = SIX.map((L, i) => {
    const g = new THREE.Group();
    const s = 11 + hash(i, 11) * 5;
    const rock = new THREE.Mesh(new THREE.CylinderGeometry(s, s * 0.85, s * 0.35, 8), flat('#d9d2c2')); g.add(rock);
    const bot = new THREE.Mesh(new THREE.ConeGeometry(s * 0.9, s * 2.2, 7), flat('#6a5a78')); bot.rotation.x = Math.PI; bot.position.y = -s * 1.2; g.add(bot);
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.95, s, 0.6, 8), flat(L.c, { emissive: L.c, emissiveIntensity: 0.12 })); grass.position.y = s * 0.2; g.add(grass);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.1, 15, 8), flat('#f4eee0')); tower.position.y = s * 0.2 + 7.5; g.add(tower);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(3.4, 4, 8), flat('#f0c66b')); cap.position.y = s * 0.2 + 17; g.add(cap);
    const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(2.1, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(L.c), fog: false })); lamp.position.y = s * 0.2 + 14.6; lamp.scale.y = 1.4; g.add(lamp);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(5.5, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(L.c).multiplyScalar(1.6), transparent: true, opacity: 0, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.y = s * 0.2 + 14.6; g.add(halo);
    const ang = (i / 6) * Math.PI * 2 + 0.5;
    const R0 = 330 + hash(i, 12) * 40, R1 = 215 + hash(i, 13) * 20;
    const h0 = -4 + hash(i, 14) * 26, h1 = 4 + hash(i, 15) * 8;
    const o = { L, g, lamp, halo, ang, R0, R1, h0, h1, lit: 0, tgt: 0, tip: new THREE.Vector3() };
    root.add(g);
    return o;
  });
  lights.forEach((o) => { o.lamp.material.color.set(o.L.c).multiplyScalar(0.18); });   // éteints, tant que le phare final est sombre

  /* ---------- les six faisceaux ---------- */
  const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1, true);
  const beams = SIX.map((L) => {
    const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(L.c).multiplyScalar(2.2), transparent: true, opacity: 0, fog: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.visible = false; root.add(m); return { m, k: 0, tgt: 0 };
  });

  /* ---------- le Prisme reforgé ---------- */
  const prism = new THREE.Group(); prism.visible = false; root.add(prism);
  const geo = new THREE.OctahedronGeometry(3.2, 0).toNonIndexed();
  const cols = SIX.map((L) => new THREE.Color(L.c).multiplyScalar(1.8)).concat([new THREE.Color('#ffffff').multiplyScalar(2), new THREE.Color('#fff4d6').multiplyScalar(2)]);
  const cArr = new Float32Array(geo.attributes.position.count * 3);
  for (let f = 0; f < 8; f++) for (let v = 0; v < 3; v++) { const c = cols[f]; const i = (f * 3 + v) * 3; cArr[i] = c.r; cArr[i + 1] = c.g; cArr[i + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cArr, 3));
  const body = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); body.scale.set(1, 1.9, 1); prism.add(body);
  const aura = new THREE.Mesh(new THREE.SphereGeometry(7.5, 16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4d6').multiplyScalar(1.5), transparent: true, opacity: 0.2, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); prism.add(aura);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(40, 16, 10), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, fog: false, depthWrite: false, side: THREE.BackSide })); flash.visible = false; root.add(flash);
  const pr = { k: 0, tgt: 0, flash: 0 };

  const place = (o, gather) => {
    const R = lerp(o.R0, o.R1, gather), h = lerp(o.h0, o.h1, gather), a = o.ang + gather * 0.35;
    o.g.position.set(mid.x + Math.cos(a) * R, h, mid.z + Math.sin(a) * R * 0.85);
    o.tip.set(o.g.position.x, o.g.position.y + 14.6 + 3, o.g.position.z);
  };
  let gather = 0, gatherT = 0;

  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), q = new THREE.Quaternion();
  function update(dt, t) {
    gather += (gatherT - gather) * (1 - Math.exp(-0.7 * dt));
    lights.forEach((o, i) => {
      place(o, gather);
      o.g.position.y += Math.sin(t * 0.4 + i) * 0.6;
      o.lit += (o.tgt - o.lit) * (1 - Math.exp(-2.4 * dt));
      o.lamp.material.color.set(o.L.c).multiplyScalar(0.18 + o.lit * 2.2);
      o.halo.material.opacity = o.lit * (0.3 + Math.sin(t * 3 + i) * 0.06);
      o.lamp.rotation.y += dt * (0.4 + o.lit * 2);
      const b = beams[i]; b.k += (b.tgt - b.k) * (1 - Math.exp(-2.2 * dt));
      b.m.visible = b.k > 0.01;
      if (b.m.visible) {
        const a = top.clone(), z2 = o.tip;
        dir.subVectors(z2, a); const len = dir.length(); dir.normalize();
        b.m.position.copy(a).addScaledVector(dir, len / 2 * b.k); q.setFromUnitVectors(up, dir); b.m.quaternion.copy(q);
        b.m.scale.set(1 + Math.sin(t * 5 + i) * 0.12, len * b.k, 1 + Math.sin(t * 5 + i) * 0.12);
        b.m.material.opacity = 0.55 * Math.min(1, b.k * 1.5);
      }
    });
    brume.rotation.y += dt * 0.02;
    puffs.forEach((m, i) => {
      const k = brumeState.k, u = m.userData;
      m.visible = k > 0.01;
      if (!m.visible) return;
      const s = 0.2 + 0.8 * k;
      m.scale.set(s, u.sy * s, s);
      m.position.y = u.y + Math.sin(t * u.k + i) * 1.4 + (1 - k) * 18;
      m.material.opacity = (m.material === bm ? 0.86 : 0.5) * Math.min(1, k * 1.4);
    });
    if (pr.tgt > 0 || pr.k > 0.01) {
      prism.visible = true;
      pr.k += (pr.tgt - pr.k) * (1 - Math.exp(-0.9 * dt));
      prism.position.set(top.x, top.y + 4 + pr.k * 16 + Math.sin(t * 1.4) * 0.5, top.z); prism.scale.setScalar(0.3 + pr.k * 0.9);
      body.rotation.y += dt * 0.7; aura.material.opacity = 0.14 + Math.sin(t * 2) * 0.05;
    } else prism.visible = false;
    flash.visible = pr.flash > 0.01;
    if (flash.visible) { flash.position.copy(prism.position); pr.flash = Math.max(0, pr.flash - dt * 0.7); flash.material.opacity = Math.min(1, pr.flash); }
  }

  return {
    update, top, lights, beams, prism, root, brumeState,
    /* pilotage depuis la séquence de fin */
    lightUp(i, on = true) { lights[i].tgt = on ? 1 : 0; beams[i].tgt = on ? 1 : 0; },
    setBrume(k) { brumeState.k = k; },
    setGather(k) { gatherT = k; },
    forge() { pr.tgt = 1; pr.flash = 1.4; prism.visible = true; },
    /* état définitif (fin déjà vue) : tout reste allumé, la Brume reste dissipée, l’archipel est rassemblé */
    settle() { lights.forEach((o, i) => { o.tgt = 1; o.lit = 1; beams[i].tgt = 1; beams[i].k = 1; }); brumeState.k = 0; gather = gatherT = 1; pr.tgt = 1; pr.k = 1; prism.visible = true; },
    reset() { lights.forEach((o, i) => { o.tgt = 0; o.lit = 0; beams[i].tgt = 0; beams[i].k = 0; }); brumeState.k = 1; gather = gatherT = 0; pr.tgt = 0; pr.k = 0; prism.visible = false; },
  };
}
