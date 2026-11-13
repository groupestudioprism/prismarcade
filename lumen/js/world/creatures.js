/* =========================================================
   LUMEN — créatures low-poly. Chaque fabrique renvoie
   { root, mat?, animate(dt, s) } ; s = { move, attack 0..1, wind 0..1, hurt 0..1, stun, charging,
   tired, phase, dead 0..1 (optionnel) }.
   Chaque créature annonce ses coups (wind) par un geste lisible : gonflement, yeux rouges,
   bouche qui s'illumine, patte qui gratte, poings qui s'allument…
   La fabrique reçoit la teinte (variantes de la Forêt de Verre) : elles deviennent translucides.
   Le Gardien d'ombre réutilise le modèle de personnage.
   ========================================================= */
import * as THREE from 'three';
import { Character } from './character.js';
import { glassTexture } from './gfx.js';

const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.8 }, o));
const glow = (hex, k = 2.5) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
const glassM = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, emissive: hex, emissiveIntensity: 0.35, flatShading: true, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.72 }, o));
const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

/* yeux avec reflet ; renvoie les pupilles pour pouvoir les allumer (annonce d'attaque) */
function eyes(parent, y, z, sep, r = 0.07, hex = '#ffffff', pupil = true) {
  const pups = [];
  [-1, 1].forEach((s) => {
    const e = mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ color: hex }), parent, s * sep, y, z);
    if (pupil) { const p = mesh(new THREE.SphereGeometry(r * 0.55, 6, 4), new THREE.MeshBasicMaterial({ color: '#1b1238' }), parent, s * sep, y, z + r * 0.62); pups.push(p); }
  });
  return pups;
}
const shadowAll = (g) => g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial' && !o.material.transparent) o.castShadow = true; });
/* petites étoiles qui tournent au-dessus d'une créature étourdie */
function stunStars(parent, y, r = 0.5) {
  const g = new THREE.Group(); g.position.y = y; g.visible = false; parent.add(g);
  const m = glow('#ffe48a', 2.2), geo = new THREE.OctahedronGeometry(0.09, 0);
  const st = [0, 1, 2].map((i) => { const o = new THREE.Mesh(geo, m); g.add(o); return o; });
  return { g, update(t, on) { g.visible = !!on; if (on) st.forEach((o, i) => { const a = t * 4 + i * 2.09; o.position.set(Math.cos(a) * r, Math.sin(t * 6 + i) * 0.04, Math.sin(a) * r); o.rotation.y = t * 5; }); } };
}

/* ---------- Brumelin (et Éclat vagabond) ---------- */
function brumelin(tint) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const glass = !!tint;
  let m, core, tail, wisps;
  if (!glass) {
    m = mat('#8f7ad6', { emissive: '#5a3fb0', emissiveIntensity: 0.45, transparent: true, opacity: 0.92, roughness: 0.4 });
    core = mesh(new THREE.IcosahedronGeometry(0.44, 1), m, body, 0, 0.5, 0);
    tail = mesh(new THREE.ConeGeometry(0.3, 0.55, 7), m, body, 0, 0.12, 0); tail.rotation.x = Math.PI;
    [-1, 1].forEach((s) => { const h = mesh(new THREE.ConeGeometry(0.09, 0.26, 5), m, body, s * 0.26, 0.92, 0); h.rotation.z = -s * 0.5; });
    wisps = [0, 1, 2].map(() => mesh(new THREE.SphereGeometry(0.08, 6, 4), glow('#c9b6ff', 1.6), body));
  } else {
    m = glassM(tint, { emissiveIntensity: 0.5, opacity: 0.68 });
    core = mesh(new THREE.OctahedronGeometry(0.46, 0), m, body, 0, 0.62, 0); core.scale.set(0.9, 1.3, 0.9);
    const inner = mesh(new THREE.OctahedronGeometry(0.2, 0), glow(tint, 2.4), body, 0, 0.62, 0); inner.name = 'inner';
    tail = mesh(new THREE.ConeGeometry(0.1, 0.3, 4), m, body, 0, 0.1, 0); tail.rotation.x = Math.PI;
    wisps = [0, 1, 2, 3].map(() => { const w = mesh(new THREE.OctahedronGeometry(0.09, 0), glow(tint, 1.8), body); w.scale.y = 1.6; return w; });
  }
  const eyeY = 0.58, pups = eyes(body, glass ? 0.64 : eyeY, 0.36, 0.15, 0.09, '#ffffff');
  if (glass) { body.children.forEach((c) => { if (c.geometry && c.geometry.type === 'SphereGeometry' && c.position.z > 0.3) c.position.z = 0.33; }); }
  const mouth = mesh(new THREE.TorusGeometry(0.07, 0.016, 4, 8, Math.PI), new THREE.MeshBasicMaterial({ color: '#2a1a4a' }), body, 0, glass ? 0.52 : 0.46, 0.41); mouth.rotation.z = Math.PI;
  const arms = [-1, 1].map((s) => mesh(new THREE.SphereGeometry(0.1, 6, 4), m, body, s * 0.46, 0.42, 0.1));
  const stars = stunStars(body, 1.15, 0.4);
  shadowAll(root);
  const redEye = new THREE.Color('#ff5a6a'), calm = new THREE.Color('#1b1238');
  let t = Math.random() * 5;
  return { root, mat: m, animate(dt, s) {
    t += dt;
    const hop = Math.abs(Math.sin(t * (s.move ? 7 : 2.5)));
    const atk = s.attack ? Math.sin(s.attack * Math.PI) : 0, wind = s.wind || 0;
    body.position.y = (glass ? 0.25 + Math.sin(t * 2.4) * 0.08 : hop * (s.move ? 0.28 : 0.06)) + atk * 0.35;
    body.position.z = atk * 0.5 - wind * 0.15;
    const sq = 1 + (1 - hop) * (glass ? 0.04 : 0.18);
    core.scale.set(sq * (1 + wind * 0.25), (glass ? 1.3 : 1) / sq + wind * 0.2, sq * (1 + wind * 0.25));
    if (glass) core.rotation.y += dt * (0.8 + wind * 6);
    body.rotation.z = wind ? Math.sin(t * 40) * 0.08 * wind : (s.stun ? Math.sin(t * 9) * 0.2 : 0);
    tail.scale.y = 1 + Math.sin(t * 5) * 0.12 + (s.move ? 0.25 : 0);
    wisps.forEach((w, i) => { const a = t * (2 + wind * 3) + i * (6.28 / wisps.length); const rr = 0.55 - wind * 0.15; w.position.set(Math.cos(a) * rr, 0.5 + Math.sin(t * 3 + i) * 0.15, Math.sin(a) * rr); w.rotation.y = t * 3; });
    pups.forEach((p) => { p.material.color.copy(calm).lerp(redEye, wind || atk); p.scale.setScalar(1 + wind * 0.6); });
    arms.forEach((a, i) => { a.position.y = 0.42 + Math.sin(t * 3 + i * 2) * 0.05 + wind * 0.3; });
    stars.update(t, s.stun);
    if (s.dead) { body.scale.setScalar(Math.max(0.01, 1 - s.dead)); body.position.y += s.dead * 0.5; }
  } };
}

/* ---------- Ronceux ---------- */
function ronceux() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const barkM = mat('#5a4a3a', { emissive: '#3a1a1a', emissiveIntensity: 0.3 });
  const base = mesh(new THREE.DodecahedronGeometry(0.55, 0), barkM, body, 0, 0.25, 0); base.scale.y = 0.6;
  // racines qui rampent
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.3; const r = mesh(new THREE.ConeGeometry(0.09, 0.8, 4), barkM, body, Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55); r.rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4); }
  const vineM = mat('#4f7a3a'), thornM = mat('#e4d4a8', { emissive: '#ff9a4a', emissiveIntensity: 0 });
  const vines = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Group(); const a = (i / 6) * Math.PI * 2; p.position.set(Math.cos(a) * 0.3, 0.3, Math.sin(a) * 0.3);
    mesh(new THREE.CylinderGeometry(0.03, 0.08, 1.0, 5), vineM, p, 0, 0.5, 0);
    for (let k = 0; k < 3; k++) { const th = mesh(new THREE.ConeGeometry(0.04, 0.16, 4), thornM, p, 0.06, 0.25 + k * 0.25, 0); th.rotation.z = -1.3; }
    mesh(new THREE.SphereGeometry(0.06, 5, 4), vineM, p, 0, 1.0, 0);
    body.add(p); vines.push(p);
  }
  const bulbM = mat('#c94d6a', { emissive: '#7a1a3a', emissiveIntensity: 0.4 });
  const bulb = new THREE.Group(); bulb.position.y = 0.85; body.add(bulb);
  mesh(new THREE.IcosahedronGeometry(0.22, 0), bulbM, bulb);
  const petals = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const pt = new THREE.Group(); pt.rotation.y = a; bulb.add(pt); const pm = mesh(new THREE.ConeGeometry(0.13, 0.34, 4), mat(i % 2 ? '#f08aa8' : '#e8607f', { emissive: '#7a1a3a', emissiveIntensity: 0.3 }), pt, 0.17, 0.12, 0); pm.rotation.z = -0.5; petals.push(pm); }
  const pups = eyes(bulb, 0.02, 0.18, 0.08, 0.05, '#ffe2a0', false);
  const stars = stunStars(body, 1.5, 0.35);
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, mat: bulbM, animate(dt, s) {
    t += dt;
    const lash = s.attack ? Math.sin(s.attack * Math.PI) * 1.2 : 0, wind = s.wind || 0;
    vines.forEach((v, i) => { const a = (i / 6) * Math.PI * 2; const sway = Math.sin(t * 2 + i) * 0.12 + (wind ? Math.sin(t * 30 + i) * 0.05 * wind : 0); const tilt = 0.6 + sway + lash - wind * 0.45; v.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt); v.scale.y = 1 + wind * 0.3 + lash * 0.4; });
    thornM.emissiveIntensity = wind * 1.4 + lash * 0.8;
    petals.forEach((p) => { p.rotation.z = -0.5 - wind * 0.7 + Math.sin(t * 3) * 0.05; });
    bulb.rotation.y += dt * (0.8 + wind * 6); bulb.position.y = 0.85 + Math.sin(t * 3) * 0.04 + wind * 0.15;
    stars.update(t, s.stun);
    if (s.dead) body.scale.setScalar(Math.max(0.01, 1 - s.dead));
  } };
}

/* ---------- Lance-épines (et Lierre-prisme) ---------- */
function lanceur(tint) {
  const glass = !!tint;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const stemM = mat('#4f7a3a');
  const stem = mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6), stemM, body, 0, 0.25, 0);
  [-1, 1].forEach((s) => { const l = mesh(new THREE.ConeGeometry(0.14, 0.5, 4), stemM, body, s * 0.22, 0.28, 0); l.rotation.z = -s * 1.1; l.scale.set(1, 1, 0.35); });
  const head = new THREE.Group(); head.position.y = 0.72; body.add(head);
  const bulbM = glass ? glassM('#7fe0c0', { opacity: 0.8 }) : mat('#7aa84f', { roughness: 0.6, emissive: '#2a4a1a', emissiveIntensity: 0.3 });
  const bulb = mesh(new THREE.SphereGeometry(0.36, 10, 8), bulbM, head);
  const mouthRing = mesh(new THREE.TorusGeometry(0.13, 0.05, 6, 12), mat('#3a1f2a'), head, 0, 0, 0.32);
  const inner = mesh(new THREE.CircleGeometry(0.12, 10), glow('#ffcf7a', 1.4), head, 0, 0, 0.335);
  const petals = [];
  for (let i = 0; i < 6; i++) { const p = mesh(new THREE.ConeGeometry(0.12, 0.35, 4), glass ? glassM(i % 2 ? '#ffb0e0' : '#9fe9ff', { opacity: 0.8 }) : mat('#c94d6a'), head); const a = (i / 6) * Math.PI * 2; p.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, -0.12); p.rotation.set(0, 0, a - Math.PI / 2); petals.push({ p, a }); }
  const spines = [];
  for (let i = 0; i < 5; i++) { const sp = mesh(new THREE.ConeGeometry(0.025, 0.22, 4), glow(glass ? '#e8fbff' : '#f6e6b8', 1.2), head); const a = (i / 5) * Math.PI * 2; sp.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0.3); sp.rotation.x = Math.PI / 2; spines.push(sp); }
  const pups = eyes(head, 0.18, 0.25, 0.12, 0.05);
  const stars = stunStars(body, 1.45, 0.4);
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, mat: bulbM, animate(dt, s) {
    t += dt;
    const wind = s.wind || 0, atk = s.attack ? Math.sin(s.attack * Math.PI) : 0;
    const inf = s.wind ? 1 + wind * 0.25 : 1 + Math.sin(t * 3) * 0.03;
    bulb.scale.setScalar(inf); head.rotation.x = -atk * 0.4 - wind * 0.25; head.position.z = atk * 0.2 - wind * 0.05;
    head.rotation.z = Math.sin(t * 1.5) * 0.06;
    inner.scale.setScalar(1 + wind * 1.1 + atk * 0.6); inner.material.color.set('#ffcf7a').multiplyScalar(1.4 + wind * 3.2);
    petals.forEach((q, i) => { const open = 1 + wind * 0.5; q.p.position.set(Math.cos(q.a) * 0.3 * open, Math.sin(q.a) * 0.3 * open, -0.12); });
    spines.forEach((sp) => { sp.scale.y = 1 + wind * 1.2; });
    stem.scale.x = stem.scale.z = 1 - wind * 0.12;
    body.position.y = s.move ? Math.abs(Math.sin(t * 8)) * 0.1 : 0;
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.15 : 0;
    pups.forEach((p) => p.material.color.set('#1b1238').lerp(new THREE.Color('#ff5a6a'), wind));
    stars.update(t, s.stun);
    if (s.dead) body.scale.setScalar(Math.max(0.01, 1 - s.dead));
  } };
}

/* ---------- Sanglier de brume (et Cerf de verre) ---------- */
function sanglier(tint) {
  if (tint) return cerf(tint);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const furM = mat('#5a4a6e', { emissive: '#2a1f40', emissiveIntensity: 0.3 }), darkM = mat('#3a2f4a');
  const torso = mesh(new THREE.IcosahedronGeometry(0.55, 0), furM, body, 0, 0.78, -0.05); torso.scale.set(0.85, 0.85, 1.35);
  const rump = mesh(new THREE.IcosahedronGeometry(0.45, 0), furM, body, 0, 0.74, -0.5); rump.scale.set(0.9, 0.9, 0.9);
  const head = new THREE.Group(); head.position.set(0, 0.72, 0.68); body.add(head);
  mesh(new THREE.BoxGeometry(0.52, 0.48, 0.5), furM, head);
  mesh(new THREE.BoxGeometry(0.32, 0.24, 0.22), mat('#c99ab0'), head, 0, -0.08, 0.34);
  [-1, 1].forEach((s) => { const tk = mesh(new THREE.ConeGeometry(0.05, 0.3, 5), mat('#f3ead8'), head, s * 0.18, -0.04, 0.4); tk.rotation.set(-1.2, 0, s * 0.3); const ear = mesh(new THREE.ConeGeometry(0.1, 0.22, 4), furM, head, s * 0.22, 0.3, -0.05); ear.rotation.z = -s * 0.4; });
  const eyeM = [-1, 1].map((s) => mesh(new THREE.SphereGeometry(0.05, 6, 4), glow('#d8b4fe', 3), head, s * 0.17, 0.1, 0.26));
  // crinière de brume : crêtes lumineuses le long du dos
  const maneM = mat('#8f7ad6', { emissive: '#5a3fb0', emissiveIntensity: 0.7 });
  const mane = []; for (let i = 0; i < 5; i++) { const sp = mesh(new THREE.ConeGeometry(0.1 - i * 0.008, 0.45 - i * 0.04, 5), maneM, body, 0, 1.2 - i * 0.02, 0.35 - i * 0.28); sp.rotation.x = -0.35; mane.push(sp); }
  const tail = new THREE.Group(); tail.position.set(0, 0.9, -0.85); body.add(tail); mesh(new THREE.ConeGeometry(0.06, 0.45, 5), maneM, tail, 0, 0.1, -0.1).rotation.x = -1.0;
  const legs = [[-0.26, 0.4], [0.26, 0.4], [-0.26, -0.4], [0.26, -0.4]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 0.5, z); mesh(new THREE.BoxGeometry(0.17, 0.46, 0.17), darkM, p, 0, -0.23, 0); mesh(new THREE.BoxGeometry(0.19, 0.08, 0.2), mat('#d8c8b0'), p, 0, -0.48, 0.01); body.add(p); return p; });
  const stars = stunStars(head, 0.6, 0.4);
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, mat: furM, animate(dt, s) {
    t += dt;
    const sp = s.charging ? 22 : s.move ? 10 : 0, wind = s.wind || 0;
    legs.forEach((l, i) => (l.rotation.x = sp ? Math.sin(t * sp + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.7 : 0));
    // annonce : tête basse, patte avant qui gratte le sol, yeux qui s'embrasent
    if (wind) { legs[1].rotation.x = -0.6 + Math.sin(t * 22) * 0.55 * wind; body.position.y = Math.sin(t * 22) * 0.03; } else body.position.y = sp ? Math.abs(Math.sin(t * sp)) * (s.charging ? 0.12 : 0.05) : Math.sin(t * 2) * 0.012;
    body.rotation.x = s.charging ? 0.12 : wind ? -0.12 + Math.sin(t * 30) * 0.03 : 0;
    head.rotation.x = wind ? 0.45 : s.charging ? 0.25 : s.stun ? 0.5 + Math.sin(t * 5) * 0.08 : Math.sin(t * 1.3) * 0.05;
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.15 : 0;
    tail.rotation.x = sp ? 0.6 : Math.sin(t * 3) * 0.2; tail.rotation.z = Math.sin(t * 6) * 0.3;
    eyeM.forEach((e) => e.material.color.set(wind || s.charging ? '#ff4a6a' : '#d8b4fe').multiplyScalar(3 + wind * 2));
    maneM.emissiveIntensity = 0.7 + wind * 1.2 + (s.charging ? 1 : 0);
    mane.forEach((m, i) => { m.rotation.x = -0.35 - (s.charging ? 0.25 : 0) + Math.sin(t * 4 + i) * 0.05; });
    stars.update(t, s.stun);
    if (s.dead) body.scale.setScalar(Math.max(0.01, 1 - s.dead));
  } };
}

/* Cerf de verre : même gabarit de comportement (charge) mais silhouette de cerf aux bois de cristal */
function cerf(tint) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const coat = glassM('#8fd8ff', { opacity: 0.78, emissiveIntensity: 0.4 }), coat2 = glassM('#6fb8e8', { opacity: 0.8 });
  const torso = mesh(new THREE.IcosahedronGeometry(0.5, 0), coat, body, 0, 0.95, -0.1); torso.scale.set(0.8, 0.8, 1.45);
  const neck = mesh(new THREE.CylinderGeometry(0.17, 0.26, 0.7, 6), coat, body, 0, 1.25, 0.55); neck.rotation.x = 0.55;
  const head = new THREE.Group(); head.position.set(0, 1.55, 0.8); body.add(head);
  mesh(new THREE.OctahedronGeometry(0.26, 0), coat2, head).scale.set(0.85, 0.8, 1.5);
  mesh(new THREE.SphereGeometry(0.06, 5, 4), mat('#2a4a6a'), head, 0, -0.02, 0.4);
  const eyeM = [-1, 1].map((s) => mesh(new THREE.SphereGeometry(0.045, 6, 4), glow('#ffffff', 3), head, s * 0.14, 0.07, 0.15));
  [-1, 1].forEach((s) => { const ear = mesh(new THREE.ConeGeometry(0.07, 0.24, 4), coat2, head, s * 0.2, 0.2, -0.12); ear.rotation.z = -s * 1.0; });
  // bois : branches de cristal aux trois secondaires (jaune, magenta, cyan) — un clin d'œil aux vitraux
  const antlerCols = ['#ffe36b', '#ff8ad8', '#8ff0ff'];
  const antlers = [-1, 1].map((s) => { const a = new THREE.Group(); a.position.set(s * 0.12, 0.2, -0.05); head.add(a);
    const main = mesh(new THREE.ConeGeometry(0.05, 0.8, 5), glassM('#d8f4ff', { opacity: 0.85, emissiveIntensity: 0.7 }), a, 0, 0.38, 0); main.rotation.z = -s * 0.35;
    for (let k = 0; k < 3; k++) { const b = mesh(new THREE.ConeGeometry(0.035, 0.32 - k * 0.05, 4), glassM(antlerCols[k], { opacity: 0.88, emissiveIntensity: 1.0 }), a, -s * (0.07 + k * 0.06), 0.25 + k * 0.2, 0); b.rotation.z = s * 0.9; }
    return a; });
  const tail = mesh(new THREE.OctahedronGeometry(0.1, 0), glow('#bff3ff', 1.8), body, 0, 1.1, -0.85);
  const heartM = glow('#9fe9ff', 2.2), heart = mesh(new THREE.OctahedronGeometry(0.16, 0), heartM, body, 0, 0.98, -0.05);
  const legs = [[-0.2, 0.42], [0.2, 0.42], [-0.2, -0.5], [0.2, -0.5]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 0.62, z); mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.62, 5), coat2, p, 0, -0.31, 0); mesh(new THREE.ConeGeometry(0.05, 0.1, 4), mat('#2a4a6a'), p, 0, -0.64, 0).rotation.x = Math.PI; body.add(p); return p; });
  const stars = stunStars(head, 0.9, 0.4);
  let t = Math.random() * 5;
  return { root, mat: coat, animate(dt, s) {
    t += dt;
    const sp = s.charging ? 22 : s.move ? 10 : 0, wind = s.wind || 0;
    legs.forEach((l, i) => (l.rotation.x = sp ? Math.sin(t * sp + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.7 : 0));
    if (wind) legs[1].rotation.x = -0.7 + Math.sin(t * 22) * 0.5 * wind;
    body.position.y = sp ? Math.abs(Math.sin(t * sp)) * 0.08 : Math.sin(t * 2) * 0.012;
    body.rotation.x = s.charging ? 0.1 : wind ? -0.1 : 0;
    head.rotation.x = wind ? 0.9 : s.charging ? 0.75 : s.stun ? 0.5 : Math.sin(t * 1.1) * 0.06;
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.15 : 0;
    antlers.forEach((a) => { a.children.forEach((c) => { if (c.material && c.material.emissiveIntensity !== undefined) c.material.emissiveIntensity = 0.7 + wind * 1.4 + Math.sin(t * 3) * 0.15; }); });
    heart.rotation.y += dt * (1 + wind * 6); heartM.color.set(tint || '#9fe9ff').multiplyScalar(2.2 + wind * 2.5 + Math.sin(t * 4) * 0.3);
    tail.position.y = 1.1 + Math.sin(t * 6) * 0.04;
    eyeM.forEach((e) => e.material.color.set(wind || s.charging ? '#ff7a9a' : '#ffffff').multiplyScalar(3));
    stars.update(t, s.stun);
    if (s.dead) body.scale.setScalar(Math.max(0.01, 1 - s.dead));
  } };
}

/* ---------- Gardien d'ombre (et Sentinelle de verre) ---------- */
function gardien(tint) {
  const glassy = !!tint;
  const c = new Character(glassy
    ? { hair: 'court', hairHex: '#bff3ff', skinHex: '#9fe0ff', eyeHex: '#ffffff', outfit: 'armure', tunicHex: '#7fdcff', trimHex: '#e8fbff', hat: 'casque', scale: 1.2 }
    : { hair: 'court', hairHex: '#1b1238', skinHex: '#3a2f55', eyeHex: '#a87dff', outfit: 'armure', tunicHex: '#2a2440', trimHex: '#7a4dff', hat: 'casque', scale: 1.2 });
  c.setWeapon(glassy ? 'sceptre' : 'lame_ombre'); c.setShield(true, glassy ? '#5fc0e0' : '#3a2f55'); c.setEmissiveEyes(glassy ? '#d8f6ff' : '#b98cff');
  const own = [];
  c.root.traverse((o) => {
    if (o.isMesh && o.material && o.material.type === 'MeshStandardMaterial') {
      o.material = o.material.clone();
      if (glassy) { o.material.color.lerp(new THREE.Color('#8fdcff'), 0.45); o.material.emissive = new THREE.Color('#2a8ab0'); o.material.emissiveIntensity = 0.4; o.material.roughness = 0.2; o.material.transparent = true; o.material.opacity = 0.82; }
      else { o.material.color.multiplyScalar(0.55); o.material.emissive = new THREE.Color('#2a1a55'); o.material.emissiveIntensity = 0.4; }
      own.push(o.material);
    }
  });
  // cristaux flottants autour du gardien + épaulières pointues
  const orb = new THREE.Group(); c.body.add(orb);
  const orbs = [0, 1, 2].map(() => { const o = mesh(new THREE.OctahedronGeometry(0.09, 0), glow(glassy ? '#bff3ff' : '#b98cff', 2), orb); o.scale.y = 1.5; return o; });
  [-1, 1].forEach((s) => { const sp = mesh(new THREE.ConeGeometry(0.06, 0.28, 4), mat(glassy ? '#bff3ff' : '#4a3a7a', { emissive: glassy ? '#6fd0ff' : '#7a4dff', emissiveIntensity: 0.6 }), c.body, s * 0.3, 1.28, 0); sp.rotation.z = -s * 0.6; });
  const rune = mesh(new THREE.OctahedronGeometry(0.06, 0), glow(glassy ? '#d8f6ff' : '#b98cff', 2.5), c.body, 0, 0.95, 0.21);
  const stars = stunStars(c.body, 1.9, 0.3);
  let t = 0;
  return { root: c.root, char: c, mat: own[0], animate(dt, s) {
    t += dt;
    const wind = s.wind || 0;
    c.animate(dt, { move: s.move, swing: s.attack ? { t: s.attack, kind: 'lame', combo: 2 } : null, hurt: s.hurt, emote: 'colere' });
    if (s.attack) c.arms[0].rotation.x = 0; else c.arms[0].rotation.x = -1.2; // bouclier levé
    if (wind && !s.attack) { c.arms[1].rotation.x = -2.2 - wind * 0.6; c.body.rotation.x = -0.12 * wind; }  // arme levée : annonce du coup
    orb.rotation.y = t * 1.6; orbs.forEach((o, i) => { const a = i * 2.09; o.position.set(Math.cos(a) * 0.6, 1.1 + Math.sin(t * 2 + i) * 0.1 + wind * 0.2, Math.sin(a) * 0.6); });
    rune.scale.setScalar(1 + wind * 1.5 + Math.sin(t * 4) * 0.2);
    stars.update(t, s.stun);
    if (s.dead) c.root.scale.setScalar(Math.max(0.01, 1.2 * (1 - s.dead)));
  } };
}

/* ---------- Colosse de Brume (et Gardien de Verre) ---------- */
function colosse(tint) {
  const glassy = !!tint;
  const T = tint || '#b98cff', T2 = tint || '#c9a0ff', T3 = tint || '#9f7aff';
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.scale.setScalar(1.18);
  const rock = glassy ? glassM('#7fc8e0', { opacity: 0.82, emissiveIntensity: 0.3, roughness: 0.2 }) : mat('#5d5470', { roughness: 0.95, emissive: '#2a1a40', emissiveIntensity: 0.25 });
  const rock2 = glassy ? glassM('#5fa8c8', { opacity: 0.85, emissiveIntensity: 0.25, roughness: 0.2 }) : mat('#4a4260', { roughness: 0.95, emissive: '#1a1030', emissiveIntensity: 0.2 });
  const torso = mesh(new THREE.DodecahedronGeometry(1.25, 0), rock, body, 0, 2.5, 0); torso.scale.set(1.15, 1.05, 0.9);
  const hips = mesh(new THREE.DodecahedronGeometry(0.85, 0), rock2, body, 0, 1.35, 0);
  const head = new THREE.Group(); head.position.set(0, 3.75, 0.25); body.add(head);
  mesh(new THREE.DodecahedronGeometry(0.6, 0), rock2, head);
  [-1, 1].forEach((s) => mesh(new THREE.BoxGeometry(0.22, 0.08, 0.05), glow(T2, 3), head, s * 0.22, 0.05, 0.53));
  // épaules : blocs de roche et pointes
  [-1, 1].forEach((s) => { const sh = mesh(new THREE.DodecahedronGeometry(0.62, 0), rock2, body, s * 1.35, 3.45, -0.05); sh.scale.set(1, 0.8, 1); for (let k = 0; k < 2; k++) { const sp = mesh(new THREE.ConeGeometry(0.16, 0.7, 5), glassy ? glassM(['#ffe36b', '#ff8ad8'][k], { opacity: 0.9, emissiveIntensity: 1 }) : mat('#3a3250', { emissive: '#7a4dff', emissiveIntensity: 0.5 }), sh, (k - 0.5) * 0.4, 0.5, 0); sp.rotation.z = (k - 0.5) * 0.6; } });
  // couronne / bois (verre) ou pointes (brume)
  const crown = [];
  for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.42; const cm = glassy ? glassM(['#ffe36b', '#ff8ad8', '#8ff0ff', '#ff8ad8', '#ffe36b'][i], { opacity: 0.9, emissiveIntensity: 1.1 }) : mat('#3a3250', { emissive: '#9f7aff', emissiveIntensity: 0.7 }); const b = mesh(new THREE.ConeGeometry(0.1, glassy ? 1.1 : 0.7, 5), cm, head, Math.sin(a) * 0.55, 0.68, -0.05); b.rotation.z = -a * 0.9; crown.push(b); }
  // fissures lumineuses sur le torse et sillons runiques
  const crackM = glow(T2, 1.8);
  for (let i = 0; i < 4; i++) { const cr = mesh(new THREE.BoxGeometry(0.07, 0.9 + (i % 2) * 0.4, 0.05), crackM, body, -0.8 + i * 0.55, 2.35 + (i % 2) * 0.35, 0.95 - Math.abs(i - 1.5) * 0.15); cr.rotation.z = (i - 1.5) * 0.3; }
  const coreM = new THREE.MeshBasicMaterial({ color: new THREE.Color(T).multiplyScalar(2.2) });
  const core = mesh(new THREE.OctahedronGeometry(0.42, 0), coreM, body, 0, 2.55, 1.0);
  const cage = mesh(new THREE.TorusGeometry(0.58, 0.07, 5, 10), rock2, body, 0, 2.55, 0.95);
  const fistM = [];
  const arms = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 1.55, 3.0, 0); body.add(p);
    mesh(new THREE.DodecahedronGeometry(0.5, 0), rock, p, 0, -0.5, 0);
    const fm = glassy ? glassM('#6fb8d8', { opacity: 0.88, emissiveIntensity: 0.3 }) : mat('#4a4260', { roughness: 0.95, emissive: '#7a4dff', emissiveIntensity: 0.0 }); fistM.push(fm);
    mesh(new THREE.DodecahedronGeometry(0.72, 0), fm, p, 0, -1.55, 0);
    for (let k = 0; k < 3; k++) mesh(new THREE.OctahedronGeometry(0.16, 0), glow(T3, 1.6), p, s * 0.3, -1.0 - k * 0.3, 0.3);
    return p;
  });
  const legs = [-1, 1].map((s) => mesh(new THREE.DodecahedronGeometry(0.6, 0), rock2, body, s * 0.7, 0.55, 0));
  // roches en orbite et couronne de brume
  const rocksO = [0, 1, 2, 3, 4].map(() => mesh(new THREE.DodecahedronGeometry(0.2, 0), rock2, body));
  const mistM = new THREE.MeshBasicMaterial({ color: tint || '#b39cff', transparent: true, opacity: 0.22, depthWrite: false });
  const mist = []; for (let i = 0; i < 8; i++) mist.push(mesh(new THREE.SphereGeometry(0.45, 8, 6), mistM, body));
  const stompRing = mesh(new THREE.RingGeometry(0.9, 1.15, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(T).multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), root, 0, 0.05, 0.9); stompRing.rotation.x = -Math.PI / 2;
  shadowAll(root);
  let t = 0;
  return { root, core, coreM, mat: rock, animate(dt, s) {
    t += dt;
    const step = s.move ? Math.sin(t * 4) : 0, wind = s.wind || 0;
    legs[0].position.y = 0.55 + Math.max(0, step) * 0.3; legs[1].position.y = 0.55 + Math.max(0, -step) * 0.3;
    body.rotation.z = step * 0.05; body.position.y = s.move ? Math.abs(step) * 0.08 : Math.sin(t * 1.4) * 0.03;
    let ra = Math.sin(t * 1.5) * 0.1, la = -ra;
    if (s.wind) { ra = la = -2.6 * s.wind; body.rotation.x = -0.15 * s.wind; }
    else if (s.attack) { const k = Math.min(1, s.attack * 3); ra = la = -2.6 + k * 3.0; body.rotation.x = 0.25 * k; }
    else body.rotation.x = s.tired ? 0.35 : 0;
    arms[0].rotation.x = la; arms[1].rotation.x = ra;
    head.rotation.x = s.tired ? 0.5 : wind ? -0.2 : Math.sin(t * 1.1) * 0.05; head.rotation.y = Math.sin(t * 0.7) * 0.15 * (1 - wind);
    // poings qui s'embrasent à l'annonce
    fistM.forEach((f) => { f.emissiveIntensity = (glassy ? 0.3 : 0) + wind * 1.8 + (s.attack ? 1.2 : 0); });
    crown.forEach((c, i) => { if (c.material.emissiveIntensity !== undefined) c.material.emissiveIntensity = (glassy ? 1.1 : 0.7) + wind * 1.5 + Math.sin(t * 3 + i) * 0.15; });
    const pulse = s.tired ? 3.8 + Math.sin(t * 10) * 1 : 1.6 + Math.sin(t * 3) * 0.3 + wind * 1.4;
    coreM.color.set(T).multiplyScalar(pulse);
    core.rotation.y += dt * 2; cage.rotation.z += dt * (s.tired ? 0.2 : 0.8);
    mist.forEach((m, i) => { const a = t * 0.6 + i * 0.8; m.position.set(Math.cos(a) * 1.6, 3.3 + Math.sin(t + i) * 0.4, Math.sin(a) * 1.2); });
    rocksO.forEach((r, i) => { const a = t * (0.5 + wind) + i * 1.26; r.position.set(Math.cos(a) * 2.2, 2.0 + Math.sin(t * 1.3 + i * 2) * 0.7, Math.sin(a) * 2.0); r.rotation.set(t + i, t * 0.7, 0); });
    // onde de choc au sol quand les poings retombent
    const hit = s.attack ? Math.min(1, Math.max(0, (s.attack - 0.15) * 3)) : 0;
    stompRing.material.opacity = hit > 0 && hit < 1 ? 0.9 * (1 - hit) : 0; stompRing.scale.setScalar(1 + hit * 4);
    if (s.dead) body.scale.setScalar(Math.max(0.01, 1.18 * (1 - s.dead)));
  } };
}

export const CREATURES = { brumelin, ronceux, lanceur, sanglier, gardien, colosse };
/* ACTE V */
import { makeGrandMeunier } from './creatures-pics.js';
CREATURES.grand_meunier = makeGrandMeunier(colosse);
