/* =========================================================
   LUMEN — créatures low-poly. Chaque fabrique renvoie
   { root, animate(dt, s) } ; s = { move, attack 0..1, wind 0..1, hurt 0..1, stun, phase }.
   Le Gardien d'ombre réutilise le modèle de personnage.
   ========================================================= */
import * as THREE from 'three';
import { Character } from './character.js';

const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.8 }, o));
const glow = (hex, k = 2.5) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
function eyes(parent, y, z, sep, r = 0.07, hex = '#ffffff', pupil = true) {
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ color: hex })); e.position.set(s * sep, y, z); parent.add(e);
    if (pupil) { const p = new THREE.Mesh(new THREE.SphereGeometry(r * 0.5, 6, 4), new THREE.MeshBasicMaterial({ color: '#1b1238' })); p.position.set(s * sep, y, z + r * 0.7); parent.add(p); }
  });
}
const shadowAll = (g) => g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') o.castShadow = true; });

function brumelin() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const m = mat('#8f7ad6', { emissive: '#5a3fb0', emissiveIntensity: 0.45, transparent: true, opacity: 0.92, roughness: 0.4 });
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.44, 1), m); b.position.y = 0.45; body.add(b);
  eyes(body, 0.55, 0.36, 0.14, 0.085);
  const wisps = [0, 1, 2].map((i) => { const w = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), glow('#c9b6ff', 1.6)); body.add(w); return w; });
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, mat: m, animate(dt, s) {
    t += dt;
    const hop = Math.abs(Math.sin(t * (s.move ? 7 : 2.5)));
    body.position.y = hop * (s.move ? 0.28 : 0.06) + (s.attack ? Math.sin(s.attack * Math.PI) * 0.5 : 0);
    const sq = 1 + (1 - hop) * 0.18;
    b.scale.set(sq, 1 / sq + (s.wind || 0) * 0.2, sq);
    wisps.forEach((w, i) => { const a = t * 2 + i * 2.1; w.position.set(Math.cos(a) * 0.55, 0.5 + Math.sin(t * 3 + i) * 0.15, Math.sin(a) * 0.55); });
  } };
}

function ronceux() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const base = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), mat('#5a4a3a')); base.position.y = 0.25; base.scale.y = 0.6; body.add(base);
  const vineM = mat('#4f7a3a'), thornM = mat('#c9b48a');
  const vines = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Group(); const a = (i / 6) * Math.PI * 2; p.position.set(Math.cos(a) * 0.3, 0.3, Math.sin(a) * 0.3); p.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
    const v = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 1.0, 5), vineM); v.position.y = 0.5; p.add(v);
    for (let k = 0; k < 3; k++) { const th = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 4), thornM); th.position.set(0.06, 0.25 + k * 0.25, 0); th.rotation.z = -1.3; p.add(th); }
    body.add(p); vines.push(p);
  }
  const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), mat('#c94d6a', { emissive: '#7a1a3a', emissiveIntensity: 0.4 })); bulb.position.y = 0.85; body.add(bulb);
  eyes(bulb, 0.02, 0.18, 0.08, 0.05, '#ffe2a0', false);
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, animate(dt, s) {
    t += dt;
    vines.forEach((v, i) => { const a = (i / 6) * Math.PI * 2; const lash = s.attack ? Math.sin(s.attack * Math.PI) * 1.2 : 0; const sway = Math.sin(t * 2 + i) * 0.12; v.rotation.set(Math.sin(a) * (0.6 + sway + lash), 0, -Math.cos(a) * (0.6 + sway + lash)); v.scale.y = 1 + (s.wind || 0) * 0.3 + lash * 0.4; });
    bulb.rotation.y += dt * 0.8; bulb.position.y = 0.85 + Math.sin(t * 3) * 0.04;
  } };
}

function lanceur() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6), mat('#4f7a3a')); stem.position.y = 0.25; body.add(stem);
  const head = new THREE.Group(); head.position.y = 0.72; body.add(head);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), mat('#7aa84f', { roughness: 0.6 })); head.add(bulb);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 6, 12), mat('#3a1f2a')); mouth.position.z = 0.32; head.add(mouth);
  const in_ = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), glow('#ffcf7a', 1.4)); in_.position.z = 0.33; head.add(in_);
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), mat('#c94d6a')); const a = (i / 6) * Math.PI * 2; p.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, -0.12); p.rotation.set(0, 0, a - Math.PI / 2); head.add(p); }
  eyes(head, 0.18, 0.25, 0.12, 0.05);
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, animate(dt, s) {
    t += dt;
    const inf = s.wind ? 1 + s.wind * 0.25 : 1 + Math.sin(t * 3) * 0.03;
    bulb.scale.setScalar(inf); head.rotation.x = s.attack ? -Math.sin(s.attack * Math.PI) * 0.4 : 0;
    body.position.y = s.move ? Math.abs(Math.sin(t * 8)) * 0.1 : 0;
  } };
}

function sanglier() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const furM = mat('#5a4a6e'), darkM = mat('#3a2f4a');
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 1.2), furM); torso.position.y = 0.72; body.add(torso);
  const head = new THREE.Group(); head.position.set(0, 0.72, 0.68); body.add(head);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.5), furM); head.add(h);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.2), mat('#c99ab0')); snout.position.set(0, -0.08, 0.32); head.add(snout);
  [-1, 1].forEach((s) => { const tk = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 5), mat('#f3ead8')); tk.position.set(s * 0.18, -0.08, 0.36); tk.rotation.x = -1.2; tk.rotation.z = s * 0.3; head.add(tk); });
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), glow('#d8b4fe', 3)); e.position.set(s * 0.17, 0.1, 0.26); head.add(e); });
  const mane = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.9, 5), mat('#8f7ad6', { emissive: '#5a3fb0', emissiveIntensity: 0.5 })); mane.position.set(0, 1.08, 0.1); mane.rotation.x = Math.PI / 2; body.add(mane);
  const legs = [[-0.26, 0.4], [0.26, 0.4], [-0.26, -0.4], [0.26, -0.4]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 0.45, z); const l = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), darkM); l.position.y = -0.22; p.add(l); body.add(p); return p; });
  shadowAll(root);
  let t = Math.random() * 5;
  return { root, animate(dt, s) {
    t += dt;
    const sp = s.charging ? 22 : s.move ? 10 : 0;
    legs.forEach((l, i) => (l.rotation.x = sp ? Math.sin(t * sp + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0));
    body.rotation.x = s.charging ? 0.12 : s.wind ? -0.12 + Math.sin(t * 30) * 0.04 : 0;
    head.rotation.x = s.wind ? 0.3 : 0;
    body.rotation.z = s.stun ? Math.sin(t * 9) * 0.15 : 0;
  } };
}

function gardien() {
  const c = new Character({ hair: 'court', hairHex: '#1b1238', skinHex: '#3a2f55', eyeHex: '#a87dff', outfit: 'armure', tunicHex: '#2a2440', trimHex: '#7a4dff', hat: 'casque', scale: 1.18 });
  c.setWeapon('lame_ombre'); c.setShield(true); c.setEmissiveEyes('#b98cff');
  c.root.traverse((o) => { if (o.isMesh && o.material && o.material.color && o.material.type === 'MeshStandardMaterial') { o.material = o.material.clone(); o.material.color.multiplyScalar(0.55); o.material.emissive = new THREE.Color('#2a1a55'); o.material.emissiveIntensity = 0.4; } });
  return { root: c.root, char: c, animate(dt, s) {
    c.animate(dt, { move: s.move, swing: s.attack ? { t: s.attack, kind: 'lame', combo: 2 } : null, hurt: s.hurt });
    c.arms[0].rotation.x = s.attack ? 0 : -1.2; // bouclier levé
  } };
}

function colosse() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const rock = mat('#5d5470', { roughness: 0.95 }), rock2 = mat('#4a4260', { roughness: 0.95 });
  const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), rock); torso.position.y = 2.5; torso.scale.set(1.15, 1.05, 0.9); body.add(torso);
  const hips = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), rock2); hips.position.y = 1.35; body.add(hips);
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), rock2); head.position.set(0, 3.75, 0.25); body.add(head);
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.05), glow('#c9a0ff', 3)); e.position.set(s * 0.22, 3.8, 0.78); body.add(e); });
  const coreM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#b98cff').multiplyScalar(2.2) });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), coreM); core.position.set(0, 2.55, 1.0); body.add(core);
  const arms = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 1.45, 3.0, 0); body.add(p);
    const up = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), rock); up.position.y = -0.5; p.add(up);
    const fist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 0), rock2); fist.position.y = -1.55; p.add(fist);
    for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), glow('#9f7aff', 1.6)); c.position.set(s * 0.3, -1.0 - k * 0.3, 0.3); p.add(c); }
    return p;
  });
  const legs = [-1, 1].map((s) => { const l = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), rock2); l.position.set(s * 0.7, 0.55, 0); body.add(l); return l; });
  // couronne de brume
  const mistM = new THREE.MeshBasicMaterial({ color: '#b39cff', transparent: true, opacity: 0.25, depthWrite: false });
  const mist = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), mistM); body.add(m); mist.push(m); }
  shadowAll(root);
  let t = 0;
  return { root, core, coreM, animate(dt, s) {
    t += dt;
    const step = s.move ? Math.sin(t * 4) : 0;
    legs[0].position.y = 0.55 + Math.max(0, step) * 0.3; legs[1].position.y = 0.55 + Math.max(0, -step) * 0.3;
    body.rotation.z = step * 0.05;
    // phase : 'slam' (bras levés puis frappe), 'sweep', 'roar', 'tired'
    let ra = Math.sin(t * 1.5) * 0.1, la = -ra;
    if (s.wind) { ra = la = -2.6 * s.wind; body.rotation.x = -0.15 * s.wind; }
    else if (s.attack) { const k = Math.min(1, s.attack * 3); ra = la = -2.6 + k * 3.0; body.rotation.x = 0.25 * k; }
    else body.rotation.x = s.tired ? 0.35 : 0;
    arms[0].rotation.x = la; arms[1].rotation.x = ra;
    const pulse = s.tired ? 3.8 + Math.sin(t * 10) * 1 : 1.6 + Math.sin(t * 3) * 0.3;
    coreM.color.set('#b98cff').multiplyScalar(pulse);
    core.rotation.y += dt * 2;
    mist.forEach((m, i) => { const a = t * 0.6 + i * 0.8; m.position.set(Math.cos(a) * 1.6, 3.3 + Math.sin(t + i) * 0.4, Math.sin(a) * 1.2); });
  } };
}

export const CREATURES = { brumelin, ronceux, lanceur, sanglier, gardien, colosse };
