/* =========================================================
   LUMEN — Acte V, Les Pics du Vent : visuels propres à l'île, construits APRÈS buildWorld() sans toucher à build.js :
   pierres de vent (rubans, anneau runique), dalles qui s'élèvent (ponts « lift »), moulins, mâts, girouettes, bonshommes de neige,
   cairns, fanions, anneaux de mémoire des relais temporisés, voile du planeur, portails de lumière, décor lointain enneigé.
   ========================================================= */
import * as THREE from 'three';
import { haloSprite } from './gfx.js';
import { glow } from './build.js';
import { T, W } from '../engine/util.js';
import { lift } from './lift.js';   /* ALTITUDE */

const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, flatShading: true, roughness: 0.9 }, o));
const PORTAL_COLORS = ['#7fe6ff', '#ff8ae6'];

export function initPics(ctx) {
  const { world, scene, isl, DEF } = ctx;
  const M = world.M;
  const state = { windmillSpin: 0, ribbons: [], flags: [], sails: [], rings: [], portals: [], runes: [] };
  const snowM = mat('#f4f8ff', { roughness: 1 });
  const hasPics = DEF.id === 'pics';
  if (!hasPics) return { update() {}, setGlide() {}, setPortals() {}, glider: null, active: false };

  /* ---------- toits enneigés, décor lointain ---------- */
  M.roofRed.color.set('#b9bfe0'); M.roofBlue.color.set('#a7b4e6'); M.roofBrown.color.set('#c4bcd8'); M.roofSlate.color.set('#c9d0ea');
  world.decor.forEach((g) => {
    if (g.userData.cloud) { g.children.forEach((c) => c.material && c.material.color && c.material.color.set('#e6e0ff')); return; }
    const [top, bot, tr] = g.children;
    if (top) top.material.color.set('#e6eef8'); if (bot) bot.material.color.set('#5a5a7a'); if (tr) tr.material.color.set('#5f7fa0');
  });

  /* ---------- pierres de vent ---------- */
  Object.values(world.views).filter((v) => v.e.t === 'vent').forEach((v) => {
    const g = v.g;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.36, 7), M.stone); base.position.y = 0.18; base.castShadow = true; g.add(base);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.5, 0.34), mat('#a9a3d0')); slab.position.y = 1.55; slab.rotation.y = 0.35; slab.castShadow = true; g.add(slab);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.5, 4), mat('#a9a3d0')); tip.position.y = 3.05; tip.rotation.y = 0.35 + Math.PI / 4; g.add(tip);
    const rune = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 24), glow('#c9b8ff', 2.2)); rune.rotation.x = Math.PI / 2; rune.position.y = 0.42; g.add(rune); state.runes.push(rune);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), glow('#d8ccff', 2.6)); gem.position.y = 3.55; gem.scale.y = 1.5; g.add(gem); v.float = gem; v.spinObj = gem; v.floatY = 3.55;
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.16, 6, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(['#c9b8ff', '#9fc4ff', '#ffd6f0'][i]).multiplyScalar(1.6), side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
      r.position.set(0.3, 2.9 - i * 0.28, 0); g.add(r); state.ribbons.push({ m: r, ph: i * 1.3 + (v.e.x + v.e.y) * 0.4 });
    }
    v.halo = haloSprite('#c9b8ff', 2.4, 0.5); v.halo.position.y = 3.5; g.add(v.halo); v.lit = true;
    g.traverse((o) => { if (o.isMesh && o.material.type !== 'MeshBasicMaterial') o.castShadow = true; });
  });

  /* ---------- dalles qui s'élèvent (ponts « lift ») ---------- */
  const slabGeo = new THREE.BoxGeometry(T * 0.98, 0.7, T * 0.98), runeGeo = new THREE.BoxGeometry(T * 0.62, 0.03, 0.12);
  const slabM = mat('#b9b4d8'), edgeM = glow('#c9b8ff', 1.8);
  Object.values(isl.gates).filter((gt) => gt.look === 'lift').forEach((gt) => {
    (world.gateViews[gt.id] || []).forEach((v, i) => {
      const g = v.group; while (g.children.length) g.remove(g.children[0]);
      g.rotation.y = 0;
      const s = new THREE.Mesh(slabGeo, slabM); s.position.y = -0.34; s.castShadow = true; s.receiveShadow = true; g.add(s);
      const r = new THREE.Mesh(runeGeo, edgeM); r.position.y = 0.012; r.rotation.y = (i % 2) * Math.PI / 2; g.add(r);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(T * 0.9, 0.08, T * 0.9), snowM); cap.position.y = 0.01; g.add(cap);
      v.delay = i * 0.2;
    });
  });

  /* ---------- décor : moulins, mâts, girouettes, bonshommes de neige, cairns, fanions ---------- */
  const box = (g, w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  const cyl = (g, r1, r2, h, m, x, y, z, seg = 8) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); c.position.set(x, y, z); c.castShadow = true; g.add(c); return c; };
  const FLAGC = ['#ff8aa8', '#ffd76a', '#8fd0ff', '#c9b8ff', '#9fe8c0', '#ffa86a', '#ffffff'];
  world.props.forEach((pr) => {
    const p = pr.p, g = pr.g, u = g.userData;
    const wipe = () => { while (g.children.length) g.remove(g.children[0]); Object.keys(u).forEach((k) => delete u[k]); };
    if (p.t === 'windmill') {
      wipe();
      cyl(g, 1.7, 2.3, 0.5, M.stoneDark, 0, 0.25, 0, 8);
      cyl(g, 1.3, 1.9, 3.6, mat('#ece6f6'), 0, 2.3, 0, 8);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.3, 8), M.roofSlate); cap.position.y = 4.8; cap.castShadow = true; g.add(cap);
      box(g, 0.7, 1.1, 0.12, M.woodDark, 0, 0.95, 1.85);
      box(g, 0.5, 0.5, 0.08, glow('#bfe0ff', 1.1), 0, 3.0, 1.55);
      const hub = new THREE.Group(); hub.position.set(0, 4.2, 1.9); g.add(hub);
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 6), M.woodDark); axle.rotation.x = Math.PI / 2; hub.add(axle);
      const sails = new THREE.Group(); sails.position.z = 0.35; hub.add(sails);
      for (let i = 0; i < 4; i++) {
        const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; sails.add(arm);
        box(arm, 0.2, 4.2, 0.12, M.woodDark, 0, 2.3, 0);
        box(arm, 1.0, 3.0, 0.05, mat('#f3ecdc'), 0.62, 2.7, 0.07);
      }
      state.sails.push({ g: sails, pr });
    } else if (p.t === 'flagpole') {
      wipe();
      cyl(g, 0.07, 0.1, 4.6, M.woodDark, 0, 2.3, 0, 6);
      const fm = new THREE.MeshStandardMaterial({ color: FLAGC[(p.x + p.y) % 7], emissive: FLAGC[(p.x + p.y) % 7], emissiveIntensity: 0.25, side: THREE.DoubleSide, flatShading: true });
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9, 5, 2), fm); f.position.set(0.8, 4.05, 0); g.add(f); state.flags.push({ m: f, ph: p.x * 0.7 });
    } else if (p.t === 'weathervane') {
      wipe();
      cyl(g, 0.06, 0.09, 3.2, M.metal, 0, 1.6, 0, 6);
      const vane = new THREE.Group(); vane.position.y = 3.2; g.add(vane);
      box(vane, 1.2, 0.06, 0.06, M.gold, 0, 0, 0);
      const tri = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 3), M.gold); tri.rotation.z = -Math.PI / 2; tri.position.x = 0.7; vane.add(tri);
      box(vane, 0.4, 0.4, 0.04, M.gold, -0.6, 0.1, 0);
      u.vane = vane;
    } else if (p.t === 'snowman') {
      wipe();
      [[0.62, 0.55], [0.46, 1.35], [0.32, 2.0]].forEach(([r, y]) => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), snowM); s.position.y = y; s.castShadow = true; g.add(s); });
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 5), mat('#ff8a3a')); nose.rotation.x = Math.PI / 2; nose.position.set(0, 2.0, 0.32); g.add(nose);
      [-0.1, 0.1].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), mat('#222')); e.position.set(x, 2.08, 0.28); g.add(e); });
      const sc = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 5, 10), mat('#c0584a')); sc.rotation.x = Math.PI / 2; sc.position.y = 1.72; g.add(sc);
    } else if (p.t === 'cairn') {
      wipe();
      cyl(g, 1.7, 2.0, 0.4, M.stoneDark, 0, 0.2, 0, 8);
      [[1.1, 0.4], [0.82, 0.78], [0.55, 1.1], [0.32, 1.38]].forEach(([r, y], i) => { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), i % 2 ? M.stone : M.stoneDark); s.position.set((i % 2) * 0.05, y + 0.3, 0); s.scale.y = 0.62; s.castShadow = true; g.add(s); });
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), glow('#bff3ff', 1.8)); cr.position.y = 2.5; cr.scale.y = 1.6; g.add(cr); u.spin = cr;
      const hl = haloSprite('#bff3ff', 2.6, 0.4); hl.position.y = 2.5; g.add(hl);
    } else if (p.t === 'lamp' && String(p.id || '').startsWith('fanion')) {
      wipe();
      const col = FLAGC[(p.x * 3 + p.y) % 7];
      cyl(g, 0.05, 0.08, 2.6, M.woodDark, 0, 1.3, 0, 6);
      const fm = new THREE.MeshStandardMaterial({ color: col, emissive: '#ffb35a', emissiveIntensity: 0, side: THREE.DoubleSide, flatShading: true });
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.62, 5, 2), fm); f.position.set(0.55, 2.2, 0); g.add(f);
      state.flags.push({ m: f, ph: p.x * 0.9 + p.y, hang: true });
      const hl = haloSprite('#ffc27a', 2.2, 0); hl.position.set(0.5, 2.2, 0); g.add(hl);
      u.lampMat = fm; u.halo = hl;
    }
  });

  /* ---------- objets à ramasser : edelweiss, cerfs-volants, engrenage, corne, cristal ---------- */
  Object.values(world.pickupViews).forEach((pv) => {
    const it = pv.pk.item, g = pv.g;
    let f = null;
    if (it === 'edelweiss') {
      f = new THREE.Group();
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.5, 4), mat('#6fae7a')); st.position.y = 0.25; f.add(st);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const pt = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), mat('#f8fbff', { emissive: '#cfe0ff', emissiveIntensity: 0.4 })); pt.position.set(Math.cos(a) * 0.14, 0.58, Math.sin(a) * 0.14); pt.scale.set(1, 0.4, 1); f.add(pt); }
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), glow('#ffe9a0', 1.6)); c.position.y = 0.6; f.add(c);
    } else if (it === 'cerf_volant') {
      f = new THREE.Group();
      const k = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshStandardMaterial({ color: '#ff8aa8', emissive: '#ff4d80', emissiveIntensity: 0.5, flatShading: true })); k.scale.set(1, 1.5, 0.12); k.position.y = 1.05; f.add(k);
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 3), mat('#fff')); tail.position.y = 0.45; f.add(tail);
      const hl = haloSprite('#ff9ec0', 1.6, 0.5); hl.position.y = 1.05; f.add(hl);
    } else if (it === 'engrenage') {
      f = new THREE.Group();
      const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 10), mat('#c98a4a', { metalness: 0.6, roughness: 0.4 })); gr.rotation.x = Math.PI / 2; gr.position.y = 0.9; f.add(gr);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const t = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.12), mat('#c98a4a', { metalness: 0.6 })); t.position.set(Math.cos(a) * 0.46, 0.9 + Math.sin(a) * 0.46, 0); f.add(t); }
      const hl = haloSprite('#ffcf8a', 1.5, 0.45); hl.position.y = 0.9; f.add(hl);
    } else if (it === 'corne_cimes') {
      f = new THREE.Group();
      const h = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 7), mat('#e8d9b0', { emissive: '#bfa060', emissiveIntensity: 0.3 })); h.position.y = 0.9; h.rotation.z = 0.7; f.add(h);
      const hl = haloSprite('#ffe9b0', 1.8, 0.5); hl.position.y = 0.9; f.add(hl);
    } else if (it === 'cristal_vent') {
      f = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow('#c9b8ff', 2.6)); f.position.y = 0.9; f.scale.y = 1.5;
    }
    if (f) { g.remove(pv.f); g.add(f); pv.f = f; }
  });

  /* ---------- anneaux de mémoire des relais temporisés ---------- */
  isl.ents.filter((e) => e.t === 'relay' && e.hold).forEach((e) => {
    const v = world.views[e.id]; if (!v) return;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.05, 6, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd98a').multiplyScalar(2), transparent: true, opacity: 0.0 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; v.g.add(ring);
    state.rings.push({ e, ring });
  });

  /* ---------- voile du planeur ---------- */
  const glider = new THREE.Group(); glider.visible = false; scene.add(glider); lift.add(glider, () => (glider.userData.P && glider.userData.P.gy) || 0);
  {
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7, 6, 3), new THREE.MeshStandardMaterial({ color: '#efeaff', emissive: '#9f88ff', emissiveIntensity: 0.35, side: THREE.DoubleSide, flatShading: true }));
    cloth.rotation.x = -Math.PI / 2 + 0.28; cloth.position.set(0, 3.0, -0.2); glider.add(cloth); glider.userData.cloth = cloth;
    [-1, 1].forEach((s) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 4), M.woodDark); b.rotation.x = Math.PI / 2 - 0.28; b.position.set(s * 1.3, 3.0, -0.2); glider.add(b);
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.7, 3), new THREE.MeshBasicMaterial({ color: '#ffffff' })); str.position.set(s * 0.65, 2.0, 0.0); str.rotation.z = s * 0.38; glider.add(str); });
    { const h = haloSprite('#c9b8ff', 3.2, 0.35); h.position.set(0, 2.9, 0); glider.add(h); }
  }

  /* ---------- portails de lumière ---------- */
  function makePortal(color) {
    const g = new THREE.Group();
    const c = new THREE.Color(color);
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 6, 36), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(2.2) })); r1.rotation.x = Math.PI / 2; r1.position.y = 0.12; g.add(r1);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(1.6), transparent: true, opacity: 0.8 })); r2.rotation.x = Math.PI / 2; r2.position.y = 0.16; g.add(r2);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 3.6, 18, 1, true), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(1.6), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); col.position.y = 1.8; g.add(col);
    const hl = haloSprite(color, 3, 0.55); hl.position.y = 0.4; g.add(hl);
    g.userData = { r1, r2, col }; g.visible = false; scene.add(g); lift.add(g); return g;
  }
  state.portals = PORTAL_COLORS.map(makePortal);
  function setPortals(list) {
    state.portals.forEach((g, i) => { const p = list && list[i]; g.visible = !!p; if (p) g.position.set(p.x, 0, p.z); });
  }
  function setGlide(on, P, t) {
    glider.visible = !!on; glider.userData.P = P;
    if (on) { glider.position.set(P.x, P.y, P.z); glider.rotation.y = P.face; glider.userData.cloth.rotation.z = Math.sin(t * 6) * 0.05; }
  }

  function update(dt, t, st) {
    state.ribbons.forEach(({ m, ph }) => { m.rotation.y = Math.sin(t * 2.4 + ph) * 0.5; m.rotation.z = Math.sin(t * 3 + ph) * 0.18; m.position.x = 0.3 + Math.sin(t * 2 + ph) * 0.05; });
    state.runes.forEach((r, i) => { r.rotation.z += dt * 0.9; });
    state.flags.forEach(({ m, ph, hang }) => { m.rotation.y = Math.sin(t * 2.2 + ph) * (hang ? 0.22 : 0.3); });
    const fast = st && (st.flags.moulin_col || st.flags.boss_meunier) ? (st.flags.boss_meunier ? 1.4 : 0.9) : 0;
    state.sails.forEach((s) => { s.g.rotation.z -= dt * fast; });
    world.props.forEach((pr) => { if (pr.g.userData.vane) pr.g.userData.vane.rotation.y = Math.sin(t * 0.7 + pr.p.x) * 0.5 + (fast ? 0.8 : 0); });
    state.rings.forEach(({ e, ring }) => {
      const k = e.hold && e.heldT > 0 && !e.live ? e.heldT / e.hold : e.live ? 1 : 0;
      ring.material.opacity += ((k > 0 ? 0.9 : 0) - ring.material.opacity) * (1 - Math.exp(-8 * dt));
      ring.scale.setScalar(0.4 + 0.6 * k);
      ring.rotation.z += dt * 2;
    });
    state.portals.forEach((g, i) => { if (!g.visible) return; const u = g.userData; u.r1.rotation.z += dt * 1.6 * (i ? -1 : 1); u.r2.rotation.z -= dt * 2.4 * (i ? -1 : 1); u.col.material.opacity = 0.18 + Math.sin(t * 3 + i) * 0.05; });
  }
  return { update, setGlide, setPortals, glider, active: true };
}
