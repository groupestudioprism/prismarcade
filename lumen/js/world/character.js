/* =========================================================
   LUMEN — personnages low-poly (Lyra, PNJ, Gardiens d'ombre).
   Un seul modèle paramétrable : coiffure, couleurs, tenue,
   accessoires, taille, arme en main. Animations procédurales :
   marche, attaques, esquive, coup reçu, onde, parole.
   Repère : le personnage regarde vers +z.
   ========================================================= */
import * as THREE from 'three';

const geo = {
  head: new THREE.SphereGeometry(0.235, 12, 9),
  eye: new THREE.SphereGeometry(0.034, 6, 5),
  hand: new THREE.SphereGeometry(0.062, 6, 5),
  sleeve: new THREE.CylinderGeometry(0.062, 0.055, 0.42, 6),
  leg: new THREE.CylinderGeometry(0.078, 0.064, 0.5, 6),
  boot: new THREE.BoxGeometry(0.15, 0.13, 0.24),
  torso: new THREE.CylinderGeometry(0.19, 0.25, 0.52, 8),
  belt: new THREE.TorusGeometry(0.245, 0.035, 5, 14),
};
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
export class Character {
  constructor(look = {}) {
    this.root = new THREE.Group();
    this.scaler = new THREE.Group(); this.root.add(this.scaler);
    this.body = new THREE.Group(); this.scaler.add(this.body);
    this.phase = Math.random() * 6; this.t = 0;
    this.look = {};
    this.mats = {};
    this.build(look);
  }
  clearParts() {
    while (this.body.children.length) this.body.remove(this.body.children[0]);
  }
  build(look) {
    this.look = Object.assign({ hair: 'carre', hairHex: '#5b3a2b', skinHex: '#f6e3d3', eyeHex: '#1d1b3a', outfit: 'voyage', cloakHex: '#3e3f9c', tunicHex: '#e9e2f5', trimHex: '#f0c66b', acc: 'aucun', hood: true, scale: 1 }, look);
    const L = this.look;
    this.clearParts();
    const M = this.mats = {
      skin: mat(L.skinHex, { roughness: 0.7 }), hair: mat(L.hairHex, { roughness: 0.9 }), eye: new THREE.MeshBasicMaterial({ color: L.eyeHex }),
      cloak: mat(L.cloakHex), tunic: mat(L.tunicHex), trim: mat(L.trimHex, { roughness: 0.55, metalness: 0.3 }),
      boot: mat('#4a3328'), pants: mat(new THREE.Color(L.tunicHex).multiplyScalar(0.55)),
    };
    if (L.outfit === 'prisme') { M.cloak = mat('#ffffff', { emissive: '#9fe9ff', emissiveIntensity: 0.25, roughness: 0.35, metalness: 0.2 }); this.prismatic = true; } else this.prismatic = false;
    const B = this.body;
    const add = (m, parent = B) => { m.castShadow = true; parent.add(m); return m; };

    /* jambes */
    this.legs = [-1, 1].map((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.11, 0.62, 0); B.add(p);
      add(new THREE.Mesh(geo.leg, M.pants), p).position.y = -0.25;
      const b = add(new THREE.Mesh(geo.boot, L.outfit === 'exploratrice' || L.outfit === 'chasseur' ? mat('#6b4a3a') : M.boot), p); b.position.set(0, -0.52, 0.035);
      if (L.outfit === 'exploratrice') { const c = add(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.2, 6), mat('#6b4a3a')), p); c.position.y = -0.4; }
      return p;
    });
    /* buste */
    const torso = add(new THREE.Mesh(geo.torso, L.outfit === 'armure' || L.outfit === 'chasseur' ? mat(L.outfit === 'armure' ? '#7d8396' : '#4b4458', { metalness: L.outfit === 'armure' ? 0.5 : 0.1 }) : M.tunic));
    torso.position.y = 0.86; this.torso = torso;
    const belt = add(new THREE.Mesh(geo.belt, M.trim)); belt.rotation.x = Math.PI / 2; belt.position.y = 0.66;
    if (L.outfit === 'robe' || L.outfit === 'aube' || L.outfit === 'tablier') {
      const sk = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, L.outfit === 'aube' ? 0.42 : 0.36, 0.5, 9, 1, true), L.outfit === 'aube' ? M.cloak : M.tunic)); sk.position.y = 0.4; sk.material.side = THREE.DoubleSide;
    }
    if (L.outfit === 'tablier') { const ap = add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.04), mat(L.apronHex || '#f3e6c8'))); ap.position.set(0, 0.62, 0.24); ap.rotation.x = 0.08; }
    if (L.outfit === 'exploratrice') { const bag = add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.1), mat('#8a5f3f'))); bag.position.set(0.27, 0.62, 0.05); const st = add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 4, 12, Math.PI), mat('#6b4a3a'))); st.position.set(0, 0.92, 0); st.rotation.set(0, 0, -2.4); }
    if (L.outfit === 'chasseur' || L.outfit === 'armure') {
      [-1, 1].forEach((s) => { const sh = add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), L.outfit === 'armure' ? mat('#9aa0b4', { metalness: 0.6, roughness: 0.4 }) : mat('#6b5a78'))); sh.position.set(s * 0.24, 1.08, 0); });
    }
    /* cape */
    const capeLen = { voyage: 0.85, exploratrice: 0.5, chasseur: 0.9, aube: 0.95, prisme: 0.9 }[L.outfit];
    if (capeLen) {
      const cape = add(new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.43, capeLen, 10, 1, true, Math.PI * 0.62, Math.PI * 1.76), M.cloak));
      cape.material.side = THREE.DoubleSide; cape.position.y = 1.1 - capeLen / 2; cape.rotation.y = Math.PI;
      this.cape = cape; this.capeLen = capeLen;
      const col = add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 5, 12), M.trim)); col.rotation.x = Math.PI / 2; col.position.y = 1.12;
    } else this.cape = null;
    /* bras */
    this.arms = [-1, 1].map((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.26, 1.06, 0); B.add(p);
      add(new THREE.Mesh(geo.sleeve, capeLen && L.outfit !== 'exploratrice' ? M.cloak : M.tunic), p).position.y = -0.2;
      const h = add(new THREE.Mesh(geo.hand, M.skin), p); h.position.y = -0.43;
      const socket = new THREE.Group(); socket.position.y = -0.43; p.add(socket);
      p.userData.socket = socket;
      return p;
    });
    /* tête */
    const head = new THREE.Group(); head.position.y = 1.37; B.add(head); this.head = head;
    const hd = add(new THREE.Mesh(geo.head, M.skin), head); hd.scale.set(1, 1.04, 0.98);
    [-0.085, 0.085].forEach((x) => { const e = new THREE.Mesh(geo.eye, M.eye); e.position.set(x, 0.01, 0.212); e.scale.set(1, 1.35, 0.6); head.add(e); });
    this.eyes = head.children.slice(-2);
    const blush = new THREE.MeshBasicMaterial({ color: '#f29db0', transparent: true, opacity: 0.35 });
    [-0.14, 0.14].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.035, 8), blush); b.position.set(x, -0.06, 0.205); b.rotation.y = x * 2.4; head.add(b); });
    this.buildHair(head, M);
    if (L.beard) { const bd = add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.4), mat(L.beard)), head); bd.position.set(0, -0.06, 0.05); bd.scale.set(1, 1.1, 1.1); }
    if (L.hat === 'chapeau') { const br = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 12), mat('#c9a86a')), head); br.position.y = 0.17; const cr = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.2, 10), mat('#c9a86a')), head); cr.position.y = 0.27; }
    if (L.hat === 'casque') { const cs = add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#9aa0b4', { metalness: 0.6, roughness: 0.35 })), head); cs.position.y = 0.03; const cr = add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.42), mat('#c94d5a')), head); cr.position.y = 0.3; }
    this.buildAccessory(head, M);
    if (L.staff) { const st = weaponMesh('staff'); this.arms[0].userData.socket.add(st); st.rotation.x = Math.PI / 2; st.position.z = 0.0; }
    this.root.scale.setScalar(L.scale || 1);
    this.weaponModel = null; this.weapon = null;
    if (this._wm) this.setWeapon(this._wm, true);
    this.offhand = null;
  }
  buildHair(head, M) {
    const L = this.look;
    const add = (m) => { m.castShadow = true; head.add(m); return m; };
    const hoodUp = L.hood && ['voyage', 'chasseur', 'aube', 'prisme'].includes(L.outfit) && !L.hat;
    // calotte
    if (!L.hat || L.hat === 'chapeau') {
      const cap = add(new THREE.Mesh(new THREE.SphereGeometry(0.255, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56), M.hair));
      cap.position.set(0, 0.02, -0.025); cap.rotation.x = -0.25;
      // frange
      const fr = add(new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 5, -0.9, 1.8, 0.35, 0.55), M.hair)); fr.position.set(0, 0.03, 0.035);
    }
    const s = L.hair;
    if (s === 'carre' || s === 'boucles') {
      const side = add(new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.27, 0.3, 12, 1, true, Math.PI * 0.72, Math.PI * 1.56), M.hair));
      side.material.side = THREE.DoubleSide; side.position.set(0, -0.08, -0.01); side.rotation.y = Math.PI;
    }
    if (s === 'long') { const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 0.12), M.hair)); b.position.set(0, -0.26, -0.18); b.rotation.x = 0.12; this.hairBack = b; }
    if (s === 'tresse') {
      for (let i = 0; i < 5; i++) { const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.075 - i * 0.006, 0), M.hair)); b.position.set(0, -0.12 - i * 0.11, -0.25 - i * 0.02); }
      const t = add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), M.trim)); t.position.set(0, -0.68, -0.33);
    }
    if (s === 'chignon') { const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), M.hair)); b.position.set(0, 0.2, -0.17); }
    if (s === 'boucles') for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 1.4 + Math.PI * 0.8; const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), M.hair)); b.position.set(Math.cos(a) * 0.25, -0.12 + (i % 2) * 0.06, Math.sin(a) * 0.22 - 0.03); }
    if (s === 'court') { const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 6, Math.PI * 0.6, Math.PI * 0.8, Math.PI * 0.3, Math.PI * 0.35), M.hair)); b.position.y = -0.02; }
    // capuche
    if (hoodUp) {
      const hood = add(new THREE.Mesh(new THREE.SphereGeometry(0.31, 12, 8, Math.PI * 0.68, Math.PI * 1.64, 0, Math.PI * 0.66), this.mats.cloak));
      hood.material.side = THREE.DoubleSide; hood.position.set(0, 0.02, -0.03); hood.rotation.y = Math.PI;
      const tip = add(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), this.mats.cloak)); tip.position.set(0, 0.2, -0.26); tip.rotation.x = -1.1;
      const rim = add(new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 4, 14, Math.PI * 1.25), this.mats.trim)); rim.position.set(0, 0.0, 0.07); rim.rotation.set(0, 0, -Math.PI * 0.125 + Math.PI);
      this.hood = hood;
    } else this.hood = null;
  }
  buildAccessory(head, M) {
    const a = this.look.acc;
    const add = (m) => { head.add(m); return m; };
    if (a === 'plume') { const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.42, 5), mat('#ffd1e6', { emissive: '#ff9ec7', emissiveIntensity: 0.3 }))); f.position.set(0.2, 0.22, -0.12); f.rotation.set(-0.5, 0, -0.6); }
    if (a === 'couronne') {
      const c = add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 16), mat('#5fae76'))); c.rotation.x = Math.PI / 2 - 0.25; c.position.y = 0.13;
      ['#ffd76a', '#ff9ec7', '#ffffff', '#c9b6ff', '#ffd76a', '#ff9ec7'].forEach((col, i) => { const fl = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), mat(col))); const ang = (i / 6) * Math.PI * 2; fl.position.set(Math.cos(ang) * 0.24, 0.13 + Math.sin(ang) * 0.06, Math.sin(ang) * 0.24); });
    }
    if (a === 'foulard') { const f = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 5, 12), mat('#e85a6a')); f.rotation.x = Math.PI / 2; f.position.y = 1.18; this.body.add(f); }
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
    const e = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#a87dff').multiplyScalar(2) })); e.position.z = 0.05; sh.add(e);
    sh.position.set(0, 0, 0.18); socket.add(sh); this.shield = sh;
  }
  setEmissiveEyes(hex) { this.eyes.forEach((e) => (e.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(3) }))); }

  /* s = { move 0..1, swing {t 0..1, kind, combo}, dodge 0..1, hurt 0..1, spin 0..1, talk bool, cast 0..1 } */
  animate(dt, s = {}) {
    this.t += dt;
    const mv = s.move || 0;
    this.phase += dt * (4 + mv * 7);
    const sw = Math.sin(this.phase);
    // jambes et bras
    this.legs[0].rotation.x = sw * 0.75 * mv; this.legs[1].rotation.x = -sw * 0.75 * mv;
    let rA = -sw * 0.6 * mv, lA = sw * 0.6 * mv, rZ = -0.08, lZ = 0.08, torsoY = 0, rY = 0;
    this.body.position.y = Math.abs(Math.cos(this.phase)) * 0.06 * mv + Math.sin(this.t * 2) * 0.008 * (1 - mv);
    this.body.rotation.x = mv * 0.06;
    this.body.rotation.z = 0; this.body.rotation.y = 0;
    if (s.swing) {
      const k = s.swing.t, kind = s.swing.kind, c = s.swing.combo || 0;
      const e = k < 0.35 ? k / 0.35 : 1, back = 1 - Math.pow(1 - Math.min(1, k / 0.18), 2);
      if (kind === 'lourde') {
        rA = THREE.MathUtils.lerp(-2.9 * back, -0.5, e * e); lA = rA * 0.9; this.body.rotation.x = -0.15 + e * 0.35;
      } else if (kind === 'distance' || kind === 'magie') {
        rA = -1.55 + (k < 0.3 ? 0 : (k - 0.3) * 0.6); torsoY = 0.15; lA = kind === 'magie' ? -1.2 : -1.4;
      } else if (c % 3 === 2) {
        rA = THREE.MathUtils.lerp(-2.7 * back, -0.3, e); this.body.rotation.x = e * 0.18;
      } else {
        const dir = c % 2 === 0 ? 1 : -1;
        rA = -1.45; rZ = -0.1; rY = 0;
        torsoY = THREE.MathUtils.lerp(dir * 1.0 * back, -dir * 0.9, e);
      }
    }
    if (s.spin) { this.body.rotation.y = s.spin * Math.PI * 2; rZ = -1.3; lZ = 1.3; rA = 0; lA = 0; }
    if (s.dodge) { this.body.rotation.x = s.dodge * Math.PI * 2; this.body.position.y = Math.sin(s.dodge * Math.PI) * 0.25 - 0.1; }
    if (s.hurt) { this.body.rotation.x = -0.35 * s.hurt; }
    if (s.talk) { rA = -0.4 + Math.sin(this.t * 6) * 0.25; rZ = -0.25; }
    if (s.wave) { rA = -2.6 + Math.sin(this.t * 10) * 0.3; rZ = -0.3; }
    this.arms[1].rotation.set(rA, rY, rZ); this.arms[0].rotation.set(lA, 0, lZ);
    this.torso.rotation.y = torsoY * 0.5; this.arms[1].position.x = 0.26;
    this.body.rotation.y += torsoY * 0.6;
    if (this.cape) this.cape.rotation.x = -mv * 0.25 - Math.sin(this.t * 1.7) * 0.03;
    if (this.head) this.head.rotation.y = s.lookYaw || 0;
    if (this.prismatic) { this.mats.cloak.emissive.setHSL((this.t * 0.08) % 1, 0.7, 0.45); this.mats.cloak.emissiveIntensity = 0.35; }
  }
}
