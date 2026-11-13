/* =========================================================
   LUMEN — Acte IV : créatures des Abysses Miroirs (low-poly).
   Même interface que creatures.js : { root, mat, animate(dt, s) } avec
   s = { move, attack 0..1, wind 0..1, hurt 0..1, stun, charging, tired, phase, dead 0..1 }.
   crabe_lanterne : lanterne sur le dos, pinces levées avant de frapper
   meduse         : ombrelle translucide, tentacules, gonfle avant de tirer
   anguille       : long corps ondulant, mâchoire qui s’ouvre avant la morsure
   corail         : sentinelle de corail et de nacre, bouclier de corail
   ========================================================= */
import * as THREE from 'three';

const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.8 }, o));
const glow = (hex, k = 2.5) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
const glassM = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, emissive: hex, emissiveIntensity: 0.45, flatShading: true, roughness: 0.15, transparent: true, opacity: 0.7 }, o));
const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; };
const shadowAll = (g) => g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial' && !o.material.transparent) o.castShadow = true; });
function stunStars(parent, y, r = 0.5) {
  const g = new THREE.Group(); g.position.y = y; g.visible = false; parent.add(g);
  const m = glow('#ffe48a', 2.2), geo = new THREE.OctahedronGeometry(0.09, 0);
  const st = [0, 1, 2].map(() => { const o = new THREE.Mesh(geo, m); g.add(o); return o; });
  return { update(t, on) { g.visible = !!on; if (on) st.forEach((o, i) => { const a = t * 4 + i * 2.09; o.position.set(Math.cos(a) * r, Math.sin(t * 6 + i) * 0.04, Math.sin(a) * r); o.rotation.y = t * 5; }); } };
}
const eyePair = (parent, y, z, sep, r, hex) => [-1, 1].map((s) => mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ color: hex }), parent, s * sep, y, z));

/* ---------- Crabe-lanterne ---------- */
function crabe_lanterne() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const shell = mat('#e8826a', { emissive: '#a03a3a', emissiveIntensity: 0.25 }), dark = mat('#b85a4a');
  const carapace = mesh(new THREE.SphereGeometry(0.5, 9, 6), shell, body, 0, 0.42, 0); carapace.scale.set(1.2, 0.62, 0.95);
  mesh(new THREE.OctahedronGeometry(0.16, 0), dark, body, 0, 0.72, 0.2).scale.set(1, 0.6, 1);
  // lanterne sur une tige : c’est elle qui attire les curieux
  const stalk = mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.55, 5), dark, body, 0, 0.9, -0.1); stalk.rotation.x = 0.25;
  const lamp = mesh(new THREE.SphereGeometry(0.15, 10, 8), glow('#9ffff0', 2.4), body, 0, 1.2, -0.2);
  const lampHalo = mesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#6fe8ff').multiplyScalar(1.2), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }), body, 0, 1.2, -0.2);
  const pups = eyePair(body, 0.62, 0.5, 0.17, 0.06, '#ffffff');
  [-1, 1].forEach((s) => { const st = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 4), dark, body, s * 0.17, 0.6, 0.46); st.rotation.x = 0.8; });
  const claws = [-1, 1].map((s) => {
    const arm = new THREE.Group(); arm.position.set(s * 0.58, 0.45, 0.28); body.add(arm);
    mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 5), shell, arm, s * 0.1, 0, 0.12).rotation.z = s * 1.0;
    const pinch = mesh(new THREE.OctahedronGeometry(0.2, 0), shell, arm, s * 0.3, 0.12, 0.32); pinch.scale.set(1, 0.7, 1.4);
    mesh(new THREE.ConeGeometry(0.07, 0.24, 4), dark, arm, s * 0.3, 0.12, 0.55).rotation.x = Math.PI / 2;
    return arm;
  });
  const legs = [-1, 1].flatMap((s) => [0, 1, 2].map((i) => { const l = mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.45, 4), dark, body, s * 0.58, 0.18, -0.15 + i * 0.22); l.rotation.z = s * 1.0; return l; }));
  const stars = stunStars(body, 1.2, 0.4);
  shadowAll(root);
  const red = new THREE.Color('#ff4a5a'), calm = new THREE.Color('#ffffff');
  let t = Math.random() * 5;
  return { root, mat: shell, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0;
    const sc = s.move ? Math.sin(t * 14) : 0;
    body.position.y = Math.abs(sc) * 0.04; body.position.z = atk * 0.55 - wind * 0.1;
    body.rotation.y = s.move ? sc * 0.08 : 0; body.rotation.z = s.stun ? Math.sin(t * 9) * 0.2 : 0;
    claws.forEach((c, i) => { c.rotation.x = -wind * 0.9 - atk * 0.3 + Math.sin(t * 3 + i * 3) * 0.05; c.position.y = 0.45 + wind * 0.3; });
    legs.forEach((l, i) => { l.rotation.x = s.move ? Math.sin(t * 16 + i) * 0.35 : 0; });
    lamp.scale.setScalar(1 + Math.sin(t * 3) * 0.1 + wind * 0.5); lampHalo.scale.setScalar(1 + wind * 0.9 + Math.sin(t * 2.3) * 0.08);
    pups.forEach((p) => p.material.color.copy(calm).lerp(red, wind || atk));
    stars.update(t, s.stun);
    if (s.dead) { body.scale.setScalar(Math.max(0.01, 1 - s.dead)); }
  } };
}

/* ---------- Méduse-reflet ---------- */
function meduse_reflet() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const bell = glassM('#9fe8ff', { emissiveIntensity: 0.6, opacity: 0.62 });
  const dome = mesh(new THREE.SphereGeometry(0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), bell, body, 0, 1.0, 0);
  const core = mesh(new THREE.OctahedronGeometry(0.2, 0), glow('#eaffff', 2.2), body, 0, 1.05, 0);
  const rim = mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 14), glassM('#c8f6ff', { opacity: 0.8 }), body, 0, 0.86, 0); rim.rotation.x = Math.PI / 2;
  const tent = [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; const tg = new THREE.Group(); tg.position.set(Math.cos(a) * 0.32, 0.86, Math.sin(a) * 0.32); body.add(tg); mesh(new THREE.CylinderGeometry(0.03, 0.012, 0.8, 4), glassM('#7fdcff', { opacity: 0.8 }), tg, 0, -0.4, 0); return tg; });
  const eyes = eyePair(body, 0.98, 0.42, 0.18, 0.07, '#1b3a5a');
  const stars = stunStars(body, 1.7, 0.4);
  const hot = new THREE.Color('#ff8fd0'), calm = new THREE.Color('#9fe8ff');
  let t = Math.random() * 5;
  return { root, mat: bell, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0;
    body.position.y = 0.45 + Math.sin(t * 2.2) * 0.1 + atk * 0.2;
    const pulse = 1 + Math.sin(t * 3) * 0.06 + wind * 0.35;
    dome.scale.set(pulse, 1 - Math.sin(t * 3) * 0.05 + wind * 0.2, pulse);
    tent.forEach((tg, i) => { tg.rotation.z = Math.sin(t * 2 + i) * 0.18; tg.rotation.x = Math.cos(t * 1.7 + i * 2) * 0.18; });
    bell.emissive.copy(calm).lerp(hot, wind); core.scale.setScalar(1 + wind * 1.2 + Math.sin(t * 5) * 0.1);
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.2 : 0;
    eyes.forEach((e) => e.scale.setScalar(1 + wind * 0.5));
    stars.update(t, s.stun);
    if (s.dead) { body.scale.setScalar(Math.max(0.01, 1 - s.dead)); body.position.y += s.dead * 0.4; }
  } };
}

/* ---------- Anguille d’ombre ---------- */
function anguille() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const skin = mat('#2b4a6a', { emissive: '#103a5a', emissiveIntensity: 0.4 }), belly = mat('#6fb8c8', { emissive: '#2a7a8a', emissiveIntensity: 0.3 });
  const N = 7, seg = [];
  for (let i = 0; i < N; i++) {
    const r = 0.26 - i * 0.024;
    const g = mesh(new THREE.SphereGeometry(r, 8, 6), i % 2 ? skin : belly, body, 0, 0.35, -i * 0.3 + 0.5); g.scale.set(1, 0.9, 1.35);
    seg.push(g);
    if (i % 2 === 0) mesh(new THREE.ConeGeometry(0.05, 0.22, 4), glow('#6fe8ff', 1.6), g, 0, r * 0.9, 0);
  }
  const head = seg[0];
  const jaw = mesh(new THREE.BoxGeometry(0.22, 0.07, 0.3), skin, head, 0, -0.1, 0.22);
  const pups = eyePair(head, 0.08, 0.2, 0.14, 0.05, '#bff3ff');
  const stars = stunStars(body, 0.95, 0.35);
  const red = new THREE.Color('#ff4a5a'), calm = new THREE.Color('#bff3ff');
  let t = Math.random() * 5;
  return { root, mat: skin, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0, spd = s.move ? 9 : 3.5;
    seg.forEach((g, i) => { g.position.x = Math.sin(t * spd - i * 0.9) * (0.08 + i * 0.03) * (wind ? 0.3 : 1); g.position.y = 0.35 + Math.sin(t * 2 + i) * 0.03 + (i === 0 ? atk * 0.1 : 0); g.position.z = -i * (0.3 - wind * 0.04) + 0.5 + (i < 2 ? atk * 0.6 : 0); });
    jaw.rotation.x = wind * 0.7 + atk * 0.5; head.rotation.x = -wind * 0.25;
    pups.forEach((p) => p.material.color.copy(calm).lerp(red, wind || atk));
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.2 : 0;
    stars.update(t, s.stun);
    if (s.dead) { body.scale.setScalar(Math.max(0.01, 1 - s.dead)); }
  } };
}

/* ---------- Sentinelle de corail ---------- */
function corail() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const coral = mat('#ff8f7a', { emissive: '#a03a4a', emissiveIntensity: 0.3 }), nacre = mat('#f2eef8', { emissive: '#8fd8e8', emissiveIntensity: 0.25 }), dark = mat('#7a3a4a');
  const legs = [-1, 1].map((s) => mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.7, 6), dark, body, s * 0.22, 0.35, 0));
  const torso = mesh(new THREE.DodecahedronGeometry(0.52, 0), coral, body, 0, 1.05, 0); torso.scale.set(1.1, 1.2, 0.9);
  const head = new THREE.Group(); head.position.set(0, 1.82, 0.05); body.add(head);
  mesh(new THREE.OctahedronGeometry(0.3, 0), nacre, head).scale.set(1, 1.1, 1);
  const pups = eyePair(head, 0.04, 0.26, 0.11, 0.05, '#7fffe8');
  [-1, 0, 1].forEach((k) => { const c = mesh(new THREE.ConeGeometry(0.07, 0.4, 5), coral, head, k * 0.14, 0.4, -0.05); c.rotation.z = -k * 0.3; });
  const arms = [-1, 1].map((s) => { const a = new THREE.Group(); a.position.set(s * 0.62, 1.4, 0); body.add(a); mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.7, 5), coral, a, 0, -0.3, 0); mesh(new THREE.DodecahedronGeometry(0.17, 0), nacre, a, 0, -0.7, 0); return a; });
  const shield = new THREE.Group(); shield.position.set(-0.7, 1.15, 0.45); body.add(shield);
  const plate = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 7), coral, shield); plate.rotation.x = Math.PI / 2;
  [0, 1, 2, 3, 4, 5].forEach((i) => { const a = (i / 6) * Math.PI * 2; const sp = mesh(new THREE.ConeGeometry(0.07, 0.3, 4), nacre, shield, Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0.12); sp.rotation.x = Math.PI / 2; });
  mesh(new THREE.OctahedronGeometry(0.16, 0), glow('#8ffff0', 2.4), shield, 0, 0, 0.14);
  const stars = stunStars(body, 2.6, 0.5);
  const red = new THREE.Color('#ff4a5a'), calm = new THREE.Color('#7fffe8');
  let t = Math.random() * 5;
  return { root, mat: coral, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0, w = s.move ? Math.sin(t * 6) : 0;
    body.position.y = Math.abs(w) * 0.06; body.position.z = atk * 0.7;
    body.rotation.y = w * 0.06; body.rotation.z = s.stun ? Math.sin(t * 9) * 0.15 : 0;
    legs.forEach((l, i) => { l.rotation.x = w * (i ? 0.4 : -0.4); });
    arms[1].rotation.x = -wind * 1.8 - atk * 0.6; arms[0].rotation.x = Math.sin(t * 1.5) * 0.05;
    torso.scale.set(1.1 + wind * 0.15, 1.2 + Math.sin(t * 2) * 0.02, 0.9 + wind * 0.1);
    pups.forEach((p) => p.material.color.copy(calm).lerp(red, wind || atk));
    shield.rotation.z = Math.sin(t * 1.3) * 0.05;
    stars.update(t, s.stun);
    if (s.dead) { body.scale.setScalar(Math.max(0.01, 1 - s.dead)); }
  } };
}

export const CREATURES_ABYSSES = { crabe_lanterne, meduse_reflet, anguille, corail };
