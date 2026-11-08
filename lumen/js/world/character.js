/* =========================================================
   LUMEN — personnages low-poly (Lyra, PNJ, Gardiens d'ombre).
   Un seul modèle paramétrable : coiffure, couleurs, tenue,
   accessoires, taille, arme en main. Animations procédurales :
   marche, attaques, esquive, coup reçu, onde, parole.
   Repère : le personnage regarde vers +z.
   ========================================================= */
import * as THREE from 'three';
import { bakeStatic } from './gfx.js';

const geo = {
  head: new THREE.SphereGeometry(0.235, 12, 9),
  eye: new THREE.SphereGeometry(0.04, 7, 6),
  glint: new THREE.SphereGeometry(0.014, 4, 3),
  hand: new THREE.SphereGeometry(0.066, 7, 5),
  sleeve: new THREE.CylinderGeometry(0.066, 0.056, 0.42, 6),
  shoulder: new THREE.SphereGeometry(0.085, 7, 5),
  thigh: new THREE.CylinderGeometry(0.084, 0.07, 0.27, 6),
  shin: new THREE.CylinderGeometry(0.07, 0.06, 0.27, 6),
  boot: new THREE.BoxGeometry(0.15, 0.12, 0.25),
  toe: new THREE.SphereGeometry(0.075, 6, 4),
  torso: new THREE.CylinderGeometry(0.175, 0.24, 0.52, 8),
  neck: new THREE.CylinderGeometry(0.06, 0.07, 0.1, 6),
  belt: new THREE.TorusGeometry(0.235, 0.035, 5, 14),
};
const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); };
/* Étoffe qui flotte : on déforme un cylindre ouvert (cape, jupe) autour de sa forme de base. */
function flutterable(mesh) {
  const pos = mesh.geometry.attributes.position, base = new Float32Array(pos.array), n = pos.count;
  let ymin = 1e9, ymax = -1e9;
  for (let i = 0; i < n; i++) { const y = base[i * 3 + 1]; if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
  mesh.userData.fl = { base, n, ymin, ymax, pos };
}
function flutter(mesh, t, move, amp, trail) {
  const f = mesh.userData.fl; if (!f) return;
  const { base, n, ymin, ymax, pos } = f, a = pos.array, rng = ymax - ymin || 1;
  for (let i = 0; i < n; i++) {
    const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
    const h = (ymax - y) / rng;                         // 0 en haut, 1 en bas
    const r = Math.hypot(x, z) || 1, ux = x / r, uz = z / r;
    const w = Math.sin(t * 2.4 + Math.atan2(x, z) * 3 + h * 4.5) * amp * h * (0.35 + move) + Math.sin(t * 5.1 + h * 7) * 0.012 * move * h;
    a[i * 3] = x + ux * w;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z + uz * w - h * h * trail * move;   // traîne vers l'arrière quand on court
  }
  pos.needsUpdate = true;
}
const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.82 }, o));

/* ---------- Armes ---------- */
export function weaponMesh(model) {
  const g = new THREE.Group();
  const wood = mat('#8a5f3f'), steel = mat('#dfe4f0', { metalness: 0.6, roughness: 0.3 }), gold = mat('#e8b65a', { metalness: 0.6, roughness: 0.35 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  if (model === 'baton') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.25, 6), wood), 0, -0.45, 0);
    add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 4, 8), gold), 0, -1.0, 0).rotation.x = Math.PI / 2;
  } else if (model === 'epee' || model === 'epee_aube') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), mat('#5a3a2a')), 0, 0.02, 0);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.06), model === 'epee_aube' ? gold : mat('#8c88a3', { metalness: 0.5 })), 0, -0.1, 0);
    const blade = add(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.022), model === 'epee_aube' ? mat('#fff2d8', { emissive: '#ffb37a', emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.25 }) : steel), 0, -0.52, 0);
    add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4), blade.material), 0, -0.98, 0).rotation.x = Math.PI;
  } else if (model === 'marteau') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.05, 6), wood), 0, -0.4, 0);
    const head = add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.24), mat('#8c88a3', { roughness: 0.9 })), 0, -0.95, 0);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.26), gold), 0, -0.95, 0);
    head.rotation.y = Math.PI / 2;
  } else if (model === 'fronde') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.3, 6), wood), 0, -0.1, 0);
    [-1, 1].forEach((s) => { const a = add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 5), wood), s * 0.06, -0.33, 0); a.rotation.z = s * 0.4; });
    add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), mat('#ffe2a0', { emissive: '#ffd27a', emissiveIntensity: 1.5 })), 0, -0.42, 0);
  } else if (model === 'sceptre') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.15, 6), mat('#e9e2f5', { metalness: 0.3 })), 0, -0.45, 0);
    add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 4, 10), gold), 0, -1.04, 0);
    add(new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fe9ff').multiplyScalar(2.2) })), 0, -1.08, 0);
  } else if (model === 'lame_ombre') {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.9, 0.03), mat('#3a2f55', { emissive: '#7a4dff', emissiveIntensity: 0.6 })), 0, -0.55, 0);
  } else if (model === 'staff') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.7, 6), mat('#e9e2f5')), 0, -0.4, 0);
    add(new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6b0').multiplyScalar(2) })), 0, 0.5, 0);
  }
  return g;
}

/* ---------- Personnage ---------- */
const BLINK_EVERY = 3.4;
export class Character {
  constructor(look = {}) {
    this.root = new THREE.Group();
    this.scaler = new THREE.Group(); this.root.add(this.scaler);
    this.body = new THREE.Group(); this.scaler.add(this.body);
    this.phase = Math.random() * 6; this.t = Math.random() * 20;
    this.look = {};
    this.mats = {};
    this.mv = 0; this.pose = { rA: 0, lA: 0, rZ: -0.08, lZ: 0.08, rX: 0, lX: 0 }; this.blinkT = 1 + Math.random() * 3; this.deadK = 0;
    this.build(look);
  }
  clearParts() {
    while (this.body.children.length) this.body.remove(this.body.children[0]);
  }
  build(look) {
    this.look = Object.assign({ hair: 'carre', hairHex: '#5b3a2b', skinHex: '#f6e3d3', eyeHex: '#1d1b3a', outfit: 'voyage', cloakHex: '#3e3f9c', tunicHex: '#e9e2f5', trimHex: '#f0c66b', acc: 'aucun', hood: true, scale: 1 }, look);
    const L = this.look;
    this.clearParts();
    // variété des habitants : corpulence et tête dérivées de l'apparence (Lyra, qui a un eyeHex, reste de proportions fixes)
    const npc = look.eyeHex === undefined, hv = npc ? hashStr(JSON.stringify(look)) : 0;
    const wk = npc ? [1, 1.12, 0.92, 1.06, 0.97, 1.04][hv % 6] : 1;
    this.scaler.scale.set(wk, 1, wk);
    this.headK = 1.1 + (npc ? ((hv >> 3) % 3) * 0.025 : 0.02);
    const M = this.mats = {
      skin: mat(L.skinHex, { roughness: 0.7 }), hair: mat(L.hairHex, { roughness: 0.9 }), eye: new THREE.MeshBasicMaterial({ color: L.eyeHex }),
      cloak: mat(L.cloakHex), tunic: mat(L.tunicHex), trim: mat(L.trimHex, { roughness: 0.55, metalness: 0.3 }),
      boot: mat('#4a3328'), pants: mat(new THREE.Color(L.tunicHex).multiplyScalar(0.55)),
    };
    if (L.outfit === 'prisme') { M.cloak = mat('#ffffff', { emissive: '#9fe9ff', emissiveIntensity: 0.25, roughness: 0.35, metalness: 0.2 }); this.prismatic = true; } else this.prismatic = false;
    const B = this.body;
    const add = (m, parent = B) => { m.castShadow = true; parent.add(m); return m; };
    this.flutters = [];

    /* jambes : cuisse + genou + mollet */
    const tallBoots = L.outfit === 'exploratrice' || L.outfit === 'chasseur';
    const bootM = tallBoots ? mat('#6b4a3a') : M.boot;
    this.legs = []; this.knees = [];
    [-1, 1].forEach((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.105, 0.64, 0); B.add(p);
      add(new THREE.Mesh(geo.thigh, M.pants), p).position.y = -0.135;
      const k = new THREE.Group(); k.position.y = -0.27; p.add(k);
      add(new THREE.Mesh(geo.shin, tallBoots ? bootM : M.pants), k).position.y = -0.135;
      const b = add(new THREE.Mesh(geo.boot, bootM), k); b.position.set(0, -0.285, 0.04);
      const toe = add(new THREE.Mesh(geo.toe, bootM), k); toe.position.set(0, -0.3, 0.14); toe.scale.set(1, 0.7, 1);
      this.legs.push(p); this.knees.push(k);
    });
    /* buste */
    const armored = L.outfit === 'armure' || L.outfit === 'chasseur';
    const torso = add(new THREE.Mesh(geo.torso, armored ? mat(L.outfit === 'armure' ? '#7d8396' : '#4b4458', { metalness: L.outfit === 'armure' ? 0.5 : 0.1 }) : M.tunic));
    torso.position.y = 0.9; torso.scale.z = 0.85; this.torso = torso;
    const neck = add(new THREE.Mesh(geo.neck, M.skin)); neck.position.y = 1.2;
    const belt = add(new THREE.Mesh(geo.belt, M.trim)); belt.rotation.x = Math.PI / 2; belt.position.y = 0.69; belt.scale.set(1, 0.85, 1);
    const buckle = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.03), M.trim)); buckle.position.set(0, 0.69, 0.2);
    if (L.outfit === 'robe' || L.outfit === 'aube' || L.outfit === 'tablier') {
      const sk = add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, L.outfit === 'aube' ? 0.44 : 0.37, 0.52, 10, 3, true), L.outfit === 'aube' ? M.cloak : M.tunic)); sk.position.y = 0.4; sk.material = sk.material.clone(); sk.material.side = THREE.DoubleSide;
      flutterable(sk); sk.userData.skirt = L.outfit === 'aube' ? 0.05 : 0.025; this.flutters.push(sk);
      const hem = add(new THREE.Mesh(new THREE.TorusGeometry(L.outfit === 'aube' ? 0.43 : 0.36, 0.018, 4, 14), M.trim)); hem.rotation.x = Math.PI / 2; hem.position.y = 0.15; hem.scale.z = 1;
      sk.userData.hem = hem;
    }
    if (L.outfit === 'tablier') { const ap = add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.04), mat(L.apronHex || '#f3e6c8'))); ap.position.set(0, 0.62, 0.24); ap.rotation.x = 0.08; const pk = add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.03), mat(L.apronHex || '#f3e6c8'))); pk.position.set(0, 0.55, 0.265); pk.material.color.multiplyScalar(0.9); }
    if (L.outfit === 'exploratrice') { const bag = add(new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.2, 0.11), mat('#8a5f3f'))); bag.position.set(0.28, 0.64, 0.05); const fl = add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.12), mat('#6b4a3a'))); fl.position.set(0.28, 0.75, 0.05); const st = add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 4, 12, Math.PI), mat('#6b4a3a'))); st.position.set(0, 0.95, 0); st.rotation.set(0, 0, -2.4); }
    if (L.outfit === 'tunique') { const tl = add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.22, 8, 1, true), M.tunic)); tl.position.y = 0.58; tl.material = tl.material.clone(); tl.material.side = THREE.DoubleSide; const col = add(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 4, 10), M.trim)); col.rotation.x = Math.PI / 2; col.position.y = 1.15; }
    if (armored) {
      [-1, 1].forEach((s) => { const sh = add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), L.outfit === 'armure' ? mat('#9aa0b4', { metalness: 0.6, roughness: 0.4 }) : mat('#6b5a78'))); sh.position.set(s * 0.25, 1.12, 0); sh.rotation.z = -s * 0.35; });
      if (L.outfit === 'armure') { const br = add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.05), mat('#9aa0b4', { metalness: 0.6, roughness: 0.4 }))); br.position.set(0, 0.95, 0.19); const em = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), M.trim)); em.position.set(0, 0.95, 0.225); }
    }
    /* cape : arc centré dans le dos, flotte au vent */
    const capeLen = { voyage: 0.9, exploratrice: 0.5, chasseur: 0.95, aube: 0.95, prisme: 0.95 }[L.outfit];
    if (capeLen) {
      const arcL = Math.PI * 1.5;
      const cape = add(new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.45, capeLen, 12, 5, true, Math.PI - arcL / 2, arcL), M.cloak));
      cape.material.side = THREE.DoubleSide; cape.position.y = 1.14 - capeLen / 2;
      flutterable(cape); cape.userData.cape = true; this.flutters.push(cape);
      this.cape = cape; this.capeLen = capeLen;
      const col = add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 5, 12), M.trim)); col.rotation.x = Math.PI / 2; col.position.y = 1.15;
      const clasp = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), M.trim)); clasp.position.set(0, 1.14, 0.2);
    } else this.cape = null;
    /* bras */
    const sleeveM = capeLen && L.outfit !== 'exploratrice' ? M.cloak : M.tunic;
    this.arms = [-1, 1].map((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.255, 1.1, 0); B.add(p);
      add(new THREE.Mesh(geo.shoulder, sleeveM), p);
      add(new THREE.Mesh(geo.sleeve, sleeveM), p).position.y = -0.2;
      const cuff = add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 4, 8), M.trim), p); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.38;
      const h = add(new THREE.Mesh(geo.hand, M.skin), p); h.position.y = -0.44;
      const socket = new THREE.Group(); socket.position.y = -0.44; p.add(socket);
      p.userData.socket = socket;
      return p;
    });
    /* tête */
    const head = new THREE.Group(); head.position.y = 1.4; B.add(head); this.head = head; head.scale.setScalar(this.headK);
    const hd = add(new THREE.Mesh(geo.head, M.skin), head); hd.scale.set(1, 1.04, 0.98);
    // yeux : grands, avec reflet ; paupières par échelle (clignement)
    this.eyes = []; this.eyeGroups = [];
    [-0.088, 0.088].forEach((x) => {
      const g = new THREE.Group(); g.position.set(x, 0.0, 0.205); head.add(g);
      const e = new THREE.Mesh(geo.eye, M.eye); e.scale.set(1, 1.5, 0.55); g.add(e);
      const gl = new THREE.Mesh(geo.glint, new THREE.MeshBasicMaterial({ color: '#ffffff' })); gl.position.set(0.014, 0.034, 0.02); g.add(gl);
      this.eyes.push(e); this.eyeGroups.push(g);
    });
    const brM = mat(L.hairHex, { roughness: 1 });
    this.brows = [-1, 1].map((s) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.014, 0.02), brM); b.position.set(s * 0.088, 0.085, 0.222); b.userData.s = s; head.add(b); return b; });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), mat(new THREE.Color(L.skinHex).multiplyScalar(0.88))); nose.position.set(0, -0.045, 0.245); head.add(nose);
    this.mouth = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 4, 8, Math.PI), new THREE.MeshBasicMaterial({ color: '#7a3b3b' })); this.mouth.position.set(0, -0.092, 0.228); this.mouth.rotation.z = Math.PI; head.add(this.mouth);
    this.mouthOpen = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#5a2a30' })); this.mouthOpen.position.set(0, -0.095, 0.222); this.mouthOpen.scale.set(1, 0.1, 0.5); head.add(this.mouthOpen);
    const blush = new THREE.MeshBasicMaterial({ color: '#f29db0', transparent: true, opacity: 0.35 });
    [-0.14, 0.14].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.035, 8), blush); b.position.set(x, -0.06, 0.205); b.rotation.y = x * 2.4; head.add(b); });
    [-1, 1].forEach((s) => { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), M.skin); ear.position.set(s * 0.245, -0.02, 0.0); ear.scale.set(0.5, 1, 0.8); head.add(ear); });
    this.buildHair(head, M);
    if (L.beard) { const bd = add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.4), mat(L.beard)), head); bd.position.set(0, -0.06, 0.05); bd.scale.set(1, 1.1, 1.1); const mu = add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), mat(L.beard)), head); mu.position.set(0, -0.065, 0.235); }
    if (L.hat === 'chapeau') { const br = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 12), mat('#c9a86a')), head); br.position.y = 0.17; const cr = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.2, 10), mat('#c9a86a')), head); cr.position.y = 0.27; const bd = add(new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.05, 10), mat('#8a5f3f')), head); bd.position.y = 0.2; }
    if (L.hat === 'casque') { const cs = add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#9aa0b4', { metalness: 0.6, roughness: 0.35 })), head); cs.position.y = 0.03; const cr = add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.42), mat('#c94d5a')), head); cr.position.y = 0.3; const vz = add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.04), mat('#6a7088', { metalness: 0.5 })), head); vz.position.set(0, 0.0, 0.265); }
    this.buildAccessory(head, M);
    this.bake();
    if (L.staff) { const st = weaponMesh('staff'); this.arms[0].userData.socket.add(st); st.rotation.x = Math.PI / 2; st.position.z = 0.0; }
    this.root.scale.setScalar(L.scale || 1);
    this.weaponModel = null; this.weapon = null;
    if (this._wm) this.setWeapon(this._wm, true);
    this.offhand = null; this.shield = null;
    this.mouthK = 0;
  }
  /* Réduit le nombre de maillages (donc d'appels de dessin) : les parties rigides d'un même os sont fusionnées. */
  bake() {
    const B = this.body, anim = new Set([...this.legs, ...this.arms, this.head]);
    const loose = new Set(this.flutters);
    if (this.hairBack) loose.add(this.hairBack);
    (this.braid || []).forEach((b) => loose.add(b)); [this.braidTip, this.hoodTip, this.scarfTail, this.plume, this.cape].forEach((o) => o && loose.add(o));
    if (this.prismatic) this.mats.cloak.userData.unique = true;
    bakeStatic(B, new Set([...anim, ...loose]));
    this.legs.forEach((l, i) => { bakeStatic(this.knees[i]); bakeStatic(l, new Set([this.knees[i]])); });
    this.arms.forEach((a) => bakeStatic(a, new Set([a.userData.socket])));
    const hs = new Set([...this.eyeGroups, ...this.brows, this.mouth, this.mouthOpen, ...loose]);
    bakeStatic(this.head, hs);
  }
  buildHair(head, M) {
    const L = this.look;
    const add = (m) => { m.castShadow = true; head.add(m); return m; };
    const hoodUp = L.hood && ['voyage', 'chasseur', 'aube', 'prisme'].includes(L.outfit) && !L.hat;
    this.hairSway = [];
    // calotte
    if (!L.hat || L.hat === 'chapeau') {
      const cap = add(new THREE.Mesh(new THREE.SphereGeometry(0.255, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56), M.hair));
      cap.position.set(0, 0.02, -0.025); cap.rotation.x = -0.25;
      // frange en mèches
      const fr = add(new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 5, -0.9, 1.8, 0.35, 0.55), M.hair)); fr.position.set(0, 0.03, 0.035);
      [-1, 1].forEach((sx) => { const lk = add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 4), M.hair)); lk.position.set(sx * 0.15, 0.1, 0.2); lk.rotation.set(Math.PI, 0, sx * 0.5); });
    }
    const s = L.hair;
    if (s === 'carre' || s === 'boucles') {
      const side = add(new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.28, 0.3, 12, 1, true, Math.PI * 0.22, Math.PI * 1.56), M.hair));
      side.material.side = THREE.DoubleSide; side.position.set(0, -0.08, -0.01);
    }
    if (s === 'long') { const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.66, 0.12), M.hair)); b.position.set(0, -0.28, -0.19); b.rotation.x = 0.12; b.geometry.translate(0, 0, 0); this.hairBack = b; this.hairSway.push({ m: b, ax: 0.12, k: 0.1 });
      [-1, 1].forEach((sx) => { const l = add(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.12), M.hair)); l.position.set(sx * 0.235, -0.2, 0.0); }); }
    if (s === 'tresse') {
      this.braid = [];
      for (let i = 0; i < 5; i++) { const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.075 - i * 0.006, 0), M.hair)); b.position.set(0, -0.12 - i * 0.11, -0.25 - i * 0.02); b.userData.y0 = b.position.y; b.userData.z0 = b.position.z; this.braid.push(b); }
      const t = add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), M.trim)); t.position.set(0, -0.68, -0.33); this.braidTip = t; t.userData.z0 = -0.33;
    }
    if (s === 'chignon') { const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), M.hair)); b.position.set(0, 0.2, -0.17); const r = add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 4, 10), M.trim)); r.position.set(0, 0.2, -0.17); r.rotation.x = 1.2; }
    if (s === 'boucles') for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 1.4 + Math.PI * 0.8; const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), M.hair)); b.position.set(Math.cos(a) * 0.25, -0.12 + (i % 2) * 0.06, Math.sin(a) * 0.22 - 0.03); }
    if (s === 'court') { const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 6, Math.PI * 1.1, Math.PI * 0.8, Math.PI * 0.3, Math.PI * 0.35), M.hair)); b.position.y = -0.02; }
    // capuche
    if (hoodUp) {
      const hood = add(new THREE.Mesh(new THREE.SphereGeometry(0.31, 12, 8, Math.PI * 0.68, Math.PI * 1.64, 0, Math.PI * 0.66), this.mats.cloak));
      hood.material.side = THREE.DoubleSide; hood.position.set(0, 0.02, -0.03);
      const tip = add(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), this.mats.cloak)); tip.position.set(0, 0.2, -0.26); tip.rotation.x = -1.1; this.hoodTip = tip; tip.userData.rx = tip.rotation.x;
      const rim = add(new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 4, 14, Math.PI * 1.25), this.mats.trim)); rim.position.set(0, -0.01, 0.12); rim.rotation.set(0, 0, -Math.PI * 0.125); rim.scale.set(0.9, 1, 1);
      this.hood = hood;
    } else this.hood = null;
  }
  buildAccessory(head, M) {
    const a = this.look.acc;
    const add = (m) => { head.add(m); return m; };
    if (a === 'plume') { const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.42, 5), mat('#ffd1e6', { emissive: '#ff9ec7', emissiveIntensity: 0.3 }))); f.position.set(0.2, 0.22, -0.12); f.rotation.set(-0.5, 0, -0.6); this.plume = f; }
    if (a === 'couronne') {
      const c = add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 16), mat('#5fae76'))); c.rotation.x = Math.PI / 2 - 0.25; c.position.y = 0.13;
      ['#ffd76a', '#ff9ec7', '#ffffff', '#c9b6ff', '#ffd76a', '#ff9ec7'].forEach((col, i) => { const fl = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), mat(col))); const ang = (i / 6) * Math.PI * 2; fl.position.set(Math.cos(ang) * 0.24, 0.13 + Math.sin(ang) * 0.06, Math.sin(ang) * 0.24); });
    }
    if (a === 'foulard') { const f = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 5, 12), mat('#e85a6a')); f.rotation.x = Math.PI / 2; f.position.y = 1.18; this.body.add(f); const tl = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.03), mat('#e85a6a')); tl.position.set(0.07, 1.02, 0.17); tl.rotation.z = 0.1; this.body.add(tl); this.scarfTail = tl; }
    if (a === 'boucles') [-1, 1].forEach((s) => { const e = add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), mat('#f0c66b', { metalness: 0.7, roughness: 0.3 }))); e.position.set(s * 0.235, -0.09, 0.02); });
    if (a === 'lunettes') { [-1, 1].forEach((s) => { const g = add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 5, 10), mat('#8a5f3f'))); g.position.set(s * 0.085, 0.16, 0.19); g.rotation.x = -0.6; const l = add(new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), new THREE.MeshBasicMaterial({ color: '#9fe9ff', transparent: true, opacity: 0.6 }))); l.position.set(s * 0.085, 0.16, 0.195); l.rotation.x = -0.6; }); }
  }
  setWeapon(model, force) {
    if (this.weaponModel === model && !force) return;
    this._wm = model;
    const socket = this.arms[1].userData.socket;
    if (this.weapon) socket.remove(this.weapon);
    this.weaponModel = model;
    this.weapon = model ? weaponMesh(model) : null;
    if (this.weapon) socket.add(this.weapon);
  }
  setShield(on, hex = '#3a2f55') {
    const socket = this.arms[0].userData.socket;
    if (this.shield) { socket.remove(this.shield); this.shield = null; }
    if (!on) return;
    const sh = new THREE.Group();
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 6), mat(hex, { metalness: 0.4, roughness: 0.5 }));
    p.rotation.x = Math.PI / 2; sh.add(p);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 4, 6), mat('#cfc6ee', { metalness: 0.6, roughness: 0.3 })); rim.rotation.z = Math.PI / 6; rim.position.z = 0.04; sh.add(rim);
    const e = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#a87dff').multiplyScalar(2) })); e.position.z = 0.05; sh.add(e);
    sh.position.set(0, 0, 0.18); socket.add(sh); this.shield = sh;
  }
  setEmissiveEyes(hex) { this.eyes.forEach((e) => (e.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(3) }))); }

  /* s = { move 0..1, swing {t 0..1, kind, combo}, dodge 0..1, hurt 0..1, spin 0..1, talk bool, cast 0..1,
           wave bool, dead 0..1, wind 0..1 (vent), emote 'joie'|'peur'|'colere' } */
  animate(dt, s = {}) {
    this.t += dt;
    const T = this.t;
    const ease = (k) => 1 - Math.exp(-k * dt);
    this.mv += ((s.move || 0) - this.mv) * ease(10);               // transitions fluides marche ↔ arrêt
    const mv = this.mv, run = Math.max(0, (mv - 0.6) / 0.4);       // 0 marche → 1 course
    this.phase += dt * (4 + mv * 5 + run * 4);
    const ph = this.phase, sw = Math.sin(ph);
    const P = this.pose;
    const breathe = Math.sin(T * 2.1);
    // jambes avec genoux
    const stride = 0.55 + run * 0.35;
    this.legs[0].rotation.x = sw * stride * mv; this.legs[1].rotation.x = -sw * stride * mv;
    this.knees[0].rotation.x = Math.max(0, -Math.cos(ph)) * (0.8 + run * 0.5) * mv;
    this.knees[1].rotation.x = Math.max(0, Math.cos(ph)) * (0.8 + run * 0.5) * mv;
    this.legs[0].rotation.z = this.legs[1].rotation.z = 0;
    // cibles des bras (pose de marche / repos)
    let rA = sw * (0.6 + run * 0.5) * mv + breathe * 0.02, lA = -sw * (0.6 + run * 0.5) * mv - breathe * 0.02, rZ = -0.08 - breathe * 0.012, lZ = 0.08 + breathe * 0.012, torsoY = 0, rY = 0;
    if (run > 0) { rA -= run * 0.5; lA -= run * 0.5; }
    this.body.position.set(0, Math.abs(Math.cos(ph)) * (0.06 + run * 0.04) * mv + breathe * 0.006 * (1 - mv), 0);
    this.body.rotation.set(mv * 0.06 + run * 0.14, 0, Math.sin(ph) * 0.03 * mv);
    let snap = false;
    if (s.swing) {
      snap = true;
      const k = s.swing.t, kind = s.swing.kind, c = s.swing.combo || 0;
      const e = k < 0.35 ? k / 0.35 : 1, back = 1 - Math.pow(1 - Math.min(1, k / 0.18), 2);
      if (kind === 'lourde') {
        rA = THREE.MathUtils.lerp(-2.9 * back, -0.5, e * e); lA = rA * 0.9; this.body.rotation.x = -0.15 + e * 0.35;
      } else if (kind === 'distance' || kind === 'magie') {
        rA = -1.55 + (k < 0.3 ? 0 : (k - 0.3) * 0.6); torsoY = 0.15; lA = kind === 'magie' ? -1.2 : -1.4;
      } else if (c % 3 === 2) {
        rA = THREE.MathUtils.lerp(-2.7 * back, -0.3, e); this.body.rotation.x = e * 0.18; this.body.position.y += Math.sin(Math.min(1, k * 2) * Math.PI) * 0.08;
      } else {
        const dir = c % 2 === 0 ? 1 : -1;
        rA = -1.45; rZ = -0.1; rY = 0;
        torsoY = THREE.MathUtils.lerp(dir * 1.0 * back, -dir * 0.9, e);
        this.body.rotation.x = 0.1 * Math.sin(k * Math.PI);
      }
      this.legs[0].rotation.x = 0.35; this.legs[1].rotation.x = -0.3;            // fente : appui sur les jambes
    }
    if (s.spin) { snap = true; this.body.rotation.y = s.spin * Math.PI * 2; rZ = -1.3; lZ = 1.3; rA = 0; lA = 0; }
    if (s.dodge) { snap = true; this.body.rotation.x = s.dodge * Math.PI * 2; this.body.position.y = Math.sin(s.dodge * Math.PI) * 0.25 - 0.1; this.knees[0].rotation.x = this.knees[1].rotation.x = 1.2; }
    if (s.hurt) { this.body.rotation.x += -0.35 * s.hurt; rA -= 0.8 * s.hurt; lA -= 0.8 * s.hurt; rZ -= 0.5 * s.hurt; lZ += 0.5 * s.hurt; }
    if (s.talk) {
      // gestes de conversation : un bras puis l'autre, petits hochements
      const g = Math.sin(T * 2.2), g2 = Math.sin(T * 3.1 + 1);
      rA = -0.55 + Math.max(0, g) * -0.5 + Math.sin(T * 7) * 0.12; rZ = -0.25 - Math.max(0, g) * 0.25;
      lA = -0.25 + Math.max(0, -g2) * -0.45; lZ = 0.15 + Math.max(0, -g2) * 0.2;
      this.body.rotation.x += Math.sin(T * 4) * 0.012;
    }
    if (s.wave) { rA = -2.6 + Math.sin(T * 10) * 0.3; rZ = -0.3; }
    if (s.cast) { rA = -1.7 - s.cast * 0.3; lA = -1.7; rZ = -0.3; lZ = 0.3; }
    // mort : chute en arrière
    if (s.dead !== undefined && s.dead !== null && s.dead > 0) {
      this.deadK += (s.dead - this.deadK) * ease(8); const d = this.deadK; snap = false;
      this.body.rotation.x = -d * 1.45; this.body.position.y = -d * 0.45 + 0.0; rA = -0.6 * d; lA = -0.4 * d; rZ = -1.0 * d; lZ = 1.0 * d;
      this.legs[0].rotation.x = 0.2 * d; this.legs[1].rotation.x = -0.3 * d;
    } else this.deadK = 0;
    // lissage des bras (sauf coups : ils doivent rester nets)
    const kk = snap ? 1 : ease(18);
    P.rA += (rA - P.rA) * kk; P.lA += (lA - P.lA) * kk; P.rZ += (rZ - P.rZ) * kk; P.lZ += (lZ - P.lZ) * kk;
    this.arms[1].rotation.set(P.rA, rY, P.rZ); this.arms[0].rotation.set(P.lA, 0, P.lZ);
    this.torso.rotation.y = torsoY * 0.5; this.torso.scale.y = 1 + breathe * 0.012;
    this.body.rotation.y += torsoY * 0.6;
    // tête : regard qui flâne, hochement, clignement
    const look = s.lookYaw || 0;
    this.head.rotation.y = look + Math.sin(T * 0.45) * 0.12 * (1 - mv);
    this.head.rotation.x = (s.hurt ? -0.35 * s.hurt : 0) + (s.talk ? Math.sin(T * 3.4) * 0.05 : Math.sin(T * 0.7) * 0.025) - run * 0.08;
    this.head.position.y = 1.4 + breathe * 0.004;
    this.blinkT -= dt;
    if (this.blinkT < 0) this.blinkT = BLINK_EVERY * (0.5 + Math.random());
    const blink = this.blinkT < 0.12 ? 0.12 : 1;
    const squint = s.hurt ? 0.45 : s.swing ? 0.7 : 1;
    this.eyeGroups.forEach((g) => (g.scale.y += ((blink * squint) - g.scale.y) * ease(40)));
    // sourcils / bouche : expression
    const ang = s.hurt ? 0.5 : s.swing || s.emote === 'colere' ? -0.4 : s.emote === 'peur' ? 0.35 : 0;
    this.brows.forEach((b) => { const sg = b.userData.s; b.rotation.z = sg * -ang; b.position.y = 0.085 + (s.hurt ? 0.02 : 0) + (s.emote === 'joie' ? 0.012 : 0); });
    const open = s.talk ? Math.max(0, Math.sin(T * 12)) * 0.9 : s.hurt ? 1 : s.swing ? 0.8 : 0;
    this.mouthK += (open - this.mouthK) * ease(30);
    this.mouthOpen.scale.y = 0.1 + this.mouthK * 1.5; this.mouthOpen.visible = this.mouthK > 0.08; this.mouth.visible = this.mouthK <= 0.08;
    // étoffes, cheveux
    const far = s.far;
    if (!far) this.flutters.forEach((m) => { if (m.userData.cape) flutter(m, T, mv, 0.06 + (s.wind || 0) * 0.05, 0.55); else flutter(m, T, mv, m.userData.skirt || 0.03, 0.08); });
    if (this.cape) { this.cape.rotation.x = -mv * 0.18 - Math.sin(T * 1.7) * 0.02 - (s.hurt ? 0.2 * s.hurt : 0); }
    if (this.braid) this.braid.forEach((b, i) => { b.position.x = Math.sin(T * 2.2 + i * 0.7) * 0.012 * (i + 1) + Math.sin(ph) * 0.02 * mv * i; b.position.z = b.userData.z0 - mv * 0.03 * i; });
    if (this.braidTip) { this.braidTip.position.x = Math.sin(T * 2.2 + 4) * 0.07 + Math.sin(ph) * 0.1 * mv; this.braidTip.position.z = this.braidTip.userData.z0 - mv * 0.12; }
    this.hairSway.forEach((h) => { h.m.rotation.x = h.ax - mv * 0.12 + Math.sin(T * 1.8) * 0.02; });
    if (this.hoodTip) this.hoodTip.rotation.x = this.hoodTip.userData.rx - mv * 0.4 + Math.sin(T * 2) * 0.05;
    if (this.scarfTail) { this.scarfTail.rotation.x = -mv * 0.7 + Math.sin(T * 5) * 0.08 * (0.3 + mv); this.scarfTail.rotation.z = 0.1 + Math.sin(T * 3.3) * 0.12 * (0.3 + mv); }
    if (this.plume) this.plume.rotation.z = -0.6 + Math.sin(T * 2.7) * 0.07;
    if (this.prismatic) { this.mats.cloak.emissive.setHSL((T * 0.08) % 1, 0.7, 0.45); this.mats.cloak.emissiveIntensity = 0.35; }
  }
}
