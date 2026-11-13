/* =========================================================
   LUMEN — ACTE III : créatures du Désert des Échos (scarabée cuirassé, scorpion de grès).
   Même contrat que world/creatures.js : { root, mat, animate(dt, s) } avec
   s = { move, attack 0..1, wind 0..1, stun, tired, dead 0..1 }.
   Les autres créatures du désert réutilisent les modèles existants (momie = gardien, cactus = lance-épines…)
   teintés de sable (def.matte : pas de variante de verre).
   Ce module s'enregistre lui-même dans CREATURES quand il est importé (voir game/combat.js).
   ========================================================= */
import * as THREE from 'three';
import { CREATURES } from './creatures.js';

const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.8 }, o));
const glow = (hex, k = 2.5) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; };
const shadowAll = (g) => g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') o.castShadow = true; });
function stars(parent, y, r) {
  const g = new THREE.Group(); g.position.y = y; g.visible = false; parent.add(g);
  const m = glow('#ffe48a', 2.2), geo = new THREE.OctahedronGeometry(0.09, 0);
  const st = [0, 1, 2].map(() => { const o = new THREE.Mesh(geo, m); g.add(o); return o; });
  return { update(t, on) { g.visible = !!on; if (on) st.forEach((o, i) => { const a = t * 4 + i * 2.09; o.position.set(Math.cos(a) * r, Math.sin(t * 6 + i) * 0.04, Math.sin(a) * r); o.rotation.y = t * 5; }); } };
}

/* ---------- Scarabée cuirassé : petit, rapide, carapace dorée qui s'ouvre avant de charger ---------- */
function scarabee() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const shellM = mat('#c99a3a', { emissive: '#7a4a10', emissiveIntensity: 0.25, metalness: 0.35, roughness: 0.45 });
  const darkM = mat('#3b2a1c'), eyeM = new THREE.MeshBasicMaterial({ color: '#1b1238' });
  const shell = mesh(new THREE.SphereGeometry(0.5, 8, 6), shellM, body, 0, 0.42, -0.05); shell.scale.set(0.95, 0.62, 1.2);
  const stripe = mesh(new THREE.BoxGeometry(0.07, 0.04, 1.05), mat('#6a3a14'), body, 0, 0.74, -0.05);
  const gem = mesh(new THREE.OctahedronGeometry(0.1, 0), glow('#ffe2a0', 1.6), body, 0, 0.78, -0.2); gem.scale.y = 1.4;
  const head = mesh(new THREE.SphereGeometry(0.26, 7, 5), darkM, body, 0, 0.36, 0.58); head.scale.set(1, 0.8, 0.9);
  const eyes = [-1, 1].map((s) => mesh(new THREE.SphereGeometry(0.07, 6, 4), eyeM.clone(), body, s * 0.14, 0.42, 0.76));
  const mand = [-1, 1].map((s) => { const m = mesh(new THREE.ConeGeometry(0.06, 0.34, 4), shellM, body, s * 0.16, 0.28, 0.84); m.rotation.x = Math.PI / 2; m.rotation.z = s * 0.4; return m; });
  const wings = [-1, 1].map((s) => { const w = mesh(new THREE.BoxGeometry(0.42, 0.03, 0.8), mat('#f0dca0', { transparent: true, opacity: 0.8 }), body, s * 0.22, 0.74, -0.1); w.visible = false; return w; });
  const legs = [];
  [-1, 1].forEach((s) => [-0.3, 0.05, 0.4].forEach((z, i) => { const l = new THREE.Group(); l.position.set(s * 0.4, 0.3, z); const seg = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.5, 4), darkM, l, s * 0.2, -0.05, 0); seg.rotation.z = s * 1.1; body.add(l); legs.push({ l, s, i }); }));
  const st = stars(body, 1.1, 0.4);
  shadowAll(root);
  const red = new THREE.Color('#ff5a6a'), calm = new THREE.Color('#1b1238');
  let t = Math.random() * 5;
  return { root, mat: shellM, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0;
    body.position.y = Math.abs(Math.sin(t * (s.move ? 14 : 3))) * (s.move ? 0.05 : 0.01) + atk * 0.1;
    body.position.z = atk * 0.5 - wind * 0.1;
    body.rotation.x = -wind * 0.25 + atk * 0.2;
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.2 : 0;
    legs.forEach(({ l, s: sd, i }) => { l.rotation.y = Math.sin(t * (s.move ? 16 : 2) + i * 2 + (sd > 0 ? 0 : Math.PI)) * (s.move ? 0.5 : 0.08); });
    wings.forEach((w, i) => { w.visible = wind > 0.2 || atk > 0; w.rotation.z = (i ? -1 : 1) * (0.2 + wind * 0.9); });
    eyes.forEach((e) => e.material.color.copy(calm).lerp(red, Math.max(wind, atk)));
    mand.forEach((m, i) => { m.rotation.z = (i ? 1 : -1) * (0.4 - wind * 0.4); });
    gem.rotation.y += dt * 2; stripe.visible = true;
    st.update(t, s.stun);
    if (s.dead) { body.scale.setScalar(Math.max(0.01, 1 - s.dead)); }
  } };
}

/* ---------- Scorpion de grès : immobile, dard annoncé par la queue qui se dresse ---------- */
function scorpion() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const shellM = mat('#b8743a', { emissive: '#5a2a0a', emissiveIntensity: 0.25, roughness: 0.55 }), darkM = mat('#5a3a22');
  const torso = mesh(new THREE.SphereGeometry(0.5, 8, 6), shellM, body, 0, 0.36, 0); torso.scale.set(1, 0.55, 1.25);
  const head = mesh(new THREE.SphereGeometry(0.22, 7, 5), darkM, body, 0, 0.34, 0.6);
  [-1, 1].forEach((s) => mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffe48a' }), body, s * 0.1, 0.42, 0.78));
  const claws = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * 0.32, 0.3, 0.65); body.add(g); const arm = mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 5), shellM, g, s * 0.15, 0, 0.2); arm.rotation.z = s * 0.9; arm.rotation.x = 1.1; const pin = mesh(new THREE.DodecahedronGeometry(0.2, 0), darkM, g, s * 0.3, 0.02, 0.5); pin.scale.set(1.1, 0.6, 1.5); return { g, s }; });
  const legs = [];
  [-1, 1].forEach((s) => [-0.25, 0, 0.25, 0.5].forEach((z, i) => { const l = new THREE.Group(); l.position.set(s * 0.4, 0.25, z); const seg = mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.5, 4), darkM, l, s * 0.2, -0.02, 0); seg.rotation.z = s * 1.2; body.add(l); legs.push({ l, s, i }); }));
  // queue : cinq segments qui s'enroulent vers l'avant
  const tail = new THREE.Group(); tail.position.set(0, 0.35, -0.55); body.add(tail);
  const segs = [];
  let parent = tail;
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.set(0, i ? 0.3 : 0, i ? 0 : 0); parent.add(g); mesh(new THREE.SphereGeometry(0.17 - i * 0.015, 6, 4), shellM, g, 0, 0.1, 0); segs.push(g); parent = g; }
  const stinger = mesh(new THREE.ConeGeometry(0.08, 0.3, 5), new THREE.MeshStandardMaterial({ color: '#e8d4a0', emissive: '#ff8a30', emissiveIntensity: 0, flatShading: true }), parent, 0, 0.32, 0);
  const st = stars(body, 1.2, 0.45);
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, mat: shellM, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0;
    body.position.y = Math.sin(t * 2) * 0.01;
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.2 : 0;
    // enroulement : au repos la queue est à demi dressée ; en annonce elle monte ; à l'attaque elle s'abat vers l'avant
    const base = 0.8 + Math.sin(t * 1.5) * 0.05 + wind * 0.5 - atk * 2.2;
    tail.rotation.x = -base * 0.4;
    segs.forEach((g, i) => { g.rotation.x = i ? 0.42 + (atk ? -atk * 0.35 : 0) : 0.2; });
    stinger.material.emissiveIntensity = wind * 2.2 + atk;
    claws.forEach(({ g, s: sd }) => { g.rotation.y = -sd * (0.2 + wind * 0.4 + Math.sin(t * 2 + sd) * 0.05); });
    legs.forEach(({ l, s: sd, i }) => { l.rotation.y = Math.sin(t * (s.move ? 12 : 1.5) + i * 1.7 + (sd > 0 ? 0 : Math.PI)) * (s.move ? 0.45 : 0.04); });
    st.update(t, s.stun);
    if (s.dead) body.scale.setScalar(Math.max(0.01, 1 - s.dead));
  } };
}

Object.assign(CREATURES, { scarabee, scorpion });
export { scarabee, scorpion };
