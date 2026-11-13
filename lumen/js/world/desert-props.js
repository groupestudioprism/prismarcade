/* =========================================================
   LUMEN — ACTE III : décor et objets du Désert des Échos (vues 3D).
   Appelé par world/build.js :
     buildSplitter(g, e, ctx)      lame semi-réfléchissante (verre à moitié argenté dans un cadre doré)
     buildSocle(so, ctx)           socle de pierre où l'on pose les objets portés
     desertProp(p, z, ctx)         tente d'abri, vasque, stèle, jarre, palmier… (null si le décor n'est pas de ce fichier)
     desertTrees(opts)             palmiers et cactus à la place des arbres (thème « desert »)
   ctx = { THREE, M, mat, glow, haloSprite, T, W, BEAM_Y, hash }
   ========================================================= */

/* Couleurs par thème (fusionnées dans THEMES de build.js) */
export const DESERT_THEMES = {
  desert: { grass: '#e9c77c', edge: '#f3d78f', path: '#d6b06a', dirt: '#9a6a3e', under: '#74503a', rock: '#c99a5c', tuft: '#d9bb62', leaves: [['#6f9a4a', '#7fae52', '#5f8a42'], ['#6f9a4a', '#7fae52', '#5f8a42']], blossom: 0, desert: true },
  cite: { grass: '#edcd86', edge: '#f6dc9a', path: '#e6cf9c', dirt: '#9a6a3e', under: '#74503a', rock: '#d1a566', tuft: '#dcbf6a', leaves: [['#6f9a4a', '#7fae52', '#5f8a42'], ['#6f9a4a', '#7fae52', '#5f8a42']], blossom: 0, desert: true },
  ruines: { grass: '#e2bd72', edge: '#ecce86', path: '#d0a862', dirt: '#8a5e38', under: '#6a4a3a', rock: '#b98c52', tuft: '#d2b25a', leaves: [['#6f9a4a', '#7fae52', '#5f8a42'], ['#6f9a4a', '#7fae52', '#5f8a42']], blossom: 0, desert: true },
  temple_sable: { grass: '#d9b878', edge: '#cba868', path: '#e3c68a', dirt: '#5a4430', under: '#3e2f26', rock: '#b58b4e', tuft: '#e8c878', leaves: [['#6f9a4a', '#7fae52', '#5f8a42'], ['#6f9a4a', '#7fae52', '#5f8a42']], blossom: 0, floor: true },
  phare_sable: { grass: '#e8cf94', edge: '#dcc07a', path: '#f0dca8', dirt: '#5a4430', under: '#3e2f26', rock: '#c9a05a', tuft: '#f0d890', leaves: [['#6f9a4a', '#7fae52', '#5f8a42'], ['#6f9a4a', '#7fae52', '#5f8a42']], blossom: 0, floor: true },
};

/* Animation : vasques allumées (flamme + halo) et anneaux des socles */
export function tickDesert(t, dt, { props, socleViews, isl }) {
  (props || []).forEach((pr) => {
    const u = pr.g.userData;
    if (pr.p.t !== 'vasque' || !u.flame) return;
    const lit = !!u.lit;
    u.flame.visible = lit;
    if (lit) { u.flame.scale.set(1 + Math.sin(t * 9 + pr.p.x) * 0.08, 1 + Math.sin(t * 7 + pr.p.y) * 0.12, 1); }
    if (u.vasqueHalo) u.vasqueHalo.material.opacity += ((lit ? 0.55 + Math.sin(t * 6) * 0.08 : 0) - u.vasqueHalo.material.opacity) * (1 - Math.exp(-5 * dt));
    if (u.vasqueGem) u.vasqueGem.rotation.y += dt * (lit ? 2 : 0.4);
  });
  (socleViews || []).forEach((sv) => {
    const busy = !!(isl && isl.entAt[sv.so.x + ',' + sv.so.y]);
    sv.ringMat.opacity += ((busy ? 0.35 : 0.55 + Math.sin(t * 3 + sv.so.x) * 0.3) - sv.ringMat.opacity) * (1 - Math.exp(-6 * dt));
    sv.halo.material.opacity += ((busy ? 0 : 0.3) - sv.halo.material.opacity) * (1 - Math.exp(-4 * dt));
  });
}

export function buildSplitter(g, e, ctx) {
  const { THREE, M, glow, BEAM_Y } = ctx;
  const frame = new THREE.Group(); frame.position.y = BEAM_Y; g.add(frame);
  // verre semi-argenté : moitié miroir, moitié transparent (damier fin sur la vitre)
  const half = new THREE.MeshStandardMaterial({ color: 0xdfeaff, metalness: 0.9, roughness: 0.12, transparent: true, opacity: 0.5, emissive: 0x6f9fd0, emissiveIntensity: 0.25, flatShading: true, side: THREE.DoubleSide });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.25, 0.06), half); panel.castShadow = false; frame.add(panel);
  for (let i = -3; i <= 3; i++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.075), M.mirror); bar.position.x = i * 0.24; frame.add(bar); }   // lamelles argentées
  const fr = glow('#ffd98a', 1.6);
  [0.66, -0.66].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.12), M.gold); b.position.y = y; frame.add(b); });
  [0.86, -0.86].forEach((x) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.33, 0.12), M.gold); b.position.x = x; frame.add(b); });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), fr); gem.position.y = 0.78; gem.scale.y = 1.4; frame.add(gem);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 6), M.metal); stand.position.y = -0.62; frame.add(stand);
  frame.rotation.y = e.state ? -Math.PI / 4 : Math.PI / 4;
  return { head: frame, target: () => (e.state ? -Math.PI / 4 : Math.PI / 4) };
}

export function buildSocle(so, ctx) {
  const { THREE, M, glow, haloSprite, W } = ctx;
  const g = new THREE.Group(); g.position.set(W(so.x), 0, W(so.y));
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.92, 0.22, 8), M.stone); base.position.y = 0.11; base.receiveShadow = true; g.add(base);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.1, 8), M.stoneDark); top.position.y = 0.26; g.add(top);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd98a').multiplyScalar(2.4), transparent: true, opacity: 0.9 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.035, 5, 28), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.33; g.add(ring);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const r = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.24), glow('#ffd98a', 1.4)); r.position.set(Math.cos(a) * 0.45, 0.32, Math.sin(a) * 0.45); r.rotation.y = -a; g.add(r); }
  const halo = haloSprite('#ffd98a', 1.8, 0.0); halo.position.y = 0.5; g.add(halo);
  return { g, ring, ringMat, halo, so };
}

export function desertTrees({ THREE, G, instanced, C, hash, W, cells, M, mat }) {
  if (!cells.length) return;
  const palms = cells.filter(([x, y]) => hash(x, y, 200) < 0.62), cacti = cells.filter(([x, y]) => hash(x, y, 200) >= 0.62);
  const trunkM = mat('#9a7448'), leafM = mat('#6f9a4a'), cactM = mat('#6fa05a');
  // palmiers : fût légèrement penché, six palmes
  instanced(G, new THREE.CylinderGeometry(0.1, 0.2, 2.4, 6).translate(0, 1.2, 0), trunkM, palms, (o, [x, y]) => { const k = 0.9 + hash(x, y, 201) * 0.4; o.position.set(W(x), 0, W(y)); o.scale.set(k, k, k); o.rotation.set(0, hash(x, y, 202) * 6, (hash(x, y, 203) - 0.5) * 0.18); }, { cast: true });
  const leafG = new THREE.ConeGeometry(0.22, 1.7, 4).translate(0, 0.85, 0);
  instanced(G, leafG, leafM, palms.flatMap(([x, y]) => [0, 1, 2, 3, 4, 5].map((k) => [x, y, k])), (o, [x, y, k]) => {
    const kk = 0.9 + hash(x, y, 201) * 0.4, a = k * 1.047 + hash(x, y, 204);
    o.position.set(W(x), 2.4 * kk, W(y)); o.rotation.set(0, -a, 0); o.rotateZ(-1.25 + (k % 2) * 0.25); o.scale.set(1, kk, 1);
    return C(['#6f9a4a', '#7fae52', '#5f8a42'][k % 3]);
  }, { cast: true });
  instanced(G, new THREE.DodecahedronGeometry(0.16, 0), mat('#7a5a30'), palms.flatMap(([x, y]) => [0, 1, 2].map((k) => [x, y, k])), (o, [x, y, k]) => { const kk = 0.9 + hash(x, y, 201) * 0.4; o.position.set(W(x) + (k - 1) * 0.16, 2.3 * kk, W(y) + (k % 2) * 0.12); });
  // cactus : colonne et deux bras
  instanced(G, new THREE.CylinderGeometry(0.2, 0.26, 1.7, 6).translate(0, 0.85, 0), cactM, cacti, (o, [x, y]) => { const k = 0.8 + hash(x, y, 205) * 0.5; o.position.set(W(x), 0, W(y)); o.scale.set(k, k, k); o.rotation.y = hash(x, y, 206) * 6; return C('#6fa05a').offsetHSL(0, 0, (hash(x, y, 207) - 0.5) * 0.06); }, { cast: true });
  instanced(G, new THREE.CylinderGeometry(0.12, 0.14, 0.7, 6).translate(0, 0.35, 0), cactM, cacti.flatMap(([x, y]) => [-1, 1].map((s) => [x, y, s])), (o, [x, y, s]) => { const k = 0.8 + hash(x, y, 205) * 0.5; o.position.set(W(x) + s * 0.34 * k, (0.55 + (s > 0 ? 0.15 : 0.35)) * k, W(y)); o.scale.set(k, k, k); }, { cast: true });
  instanced(G, new THREE.OctahedronGeometry(0.1, 0), mat('#ff9ec7'), cacti, (o, [x, y]) => { const k = 0.8 + hash(x, y, 205) * 0.5; o.position.set(W(x), 1.78 * k, W(y)); });
}

/* Décor de zones d'aventure : renvoie { g } ou null */
export function desertProp(p, z, ctx) {
  const { THREE, M, mat, glow, haloSprite, T, W } = ctx;
  if (!['shelter', 'vasque', 'stele', 'pot', 'carpet', 'palm', 'dunerock', 'tent'].includes(p.t)) return null;
  const g = new THREE.Group();
  const cx = W(z.ox + p.x) + (p.w - 1) * T / 2, cz = W(z.oy + p.y) + (p.h - 1) * T / 2;
  g.position.set(cx, 0, cz);
  const add = (m, x = 0, y = 0, zz = 0) => { m.position.set(x, y, zz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const u = g.userData;
  const cloth = mat(p.color || '#c0584a', { side: THREE.DoubleSide });
  switch (p.t) {
    case 'shelter': case 'tent': {   // tente d'abri : quatre mâts, toile en pente, tapis dessous
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.1, 5), M.woodDark), sx * 1.1, 1.05, sz * 0.9));
      const roof = add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 2.2), cloth), 0, 2.15, 0); roof.rotation.z = 0.08;
      add(new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.3, 0.06), mat('#f3e6c8')), 0, 1.98, 1.1);
      add(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 1.6), mat('#8a3a4a')), 0, 0.03, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.5), mat('#e8b65a')), -0.5, 0.2, -0.3);
      const lamp = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), glow('#ffcf7a', 1.8)), 0.8, 1.7, 0.7); lamp.scale.y = 1.4;
      break;
    }
    case 'vasque': {   // vasque d'échos : s'allume avec l'Orbe de Fia
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.9, 8), M.stone), 0, 0.45, 0);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.4, 0.4, 8), M.stoneDark), 0, 1.05, 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 5, 24), M.gold); ring.rotation.x = Math.PI / 2; ring.position.y = 1.25; g.add(ring);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc861').multiplyScalar(2.2), transparent: true, opacity: 0.95 })); flame.position.y = 1.7; flame.visible = false; g.add(flame);
      const halo = haloSprite('#ffc861', 3.6, 0.0); halo.position.y = 1.7; g.add(halo);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), glow('#9fe9ff', 1.2)); gem.position.y = 1.55; gem.scale.y = 1.5; g.add(gem);
      u.flame = flame; u.vasqueHalo = halo; u.vasqueGem = gem; u.spin = gem;
      break;
    }
    case 'stele': {   // stèle d'écho : pierre haute gravée de runes
      add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.0), M.stoneDark), 0, 0.15, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.8, 0.45), M.stone), 0, 1.7, 0);
      const cap = add(new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 4), M.stone), 0, 3.35, 0); cap.rotation.y = Math.PI / 4;
      [0.9, 1.5, 2.1, 2.7].forEach((y, i) => { const r = new THREE.Mesh(new THREE.BoxGeometry(0.34 - i * 0.03, 0.06, 0.05), glow('#ffd98a', 1.3)); r.position.set(0, y, 0.24); g.add(r); });
      break;
    }
    case 'pot': {
      add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat(p.color || '#c9783a')), 0, 0.45, 0).scale.set(1, 1.15, 1);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.2, 8), mat('#a85a28')), 0, 0.98, 0);
      add(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 4, 14), mat('#f3e6c8')), 0, 0.5, 0).rotation.x = Math.PI / 2;
      break;
    }
    case 'carpet': {
      add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.5, 0.04, p.h * T - 0.5), mat(p.color || '#8a3a4a')), 0, 0.03, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(p.w * T - 0.9, 0.05, p.h * T - 0.9), mat('#e8b65a')), 0, 0.035, 0);
      break;
    }
    case 'palm': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 2.6, 6), mat('#9a7448')), 0, 1.3, 0);
      for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.8, 4), mat(['#6f9a4a', '#7fae52', '#5f8a42'][i % 3])); l.geometry.translate(0, 0.9, 0); l.position.y = 2.6; l.rotation.y = -i * 1.047; l.rotateZ(-1.2); l.castShadow = true; g.add(l); }
      break;
    }
    case 'dunerock': {
      const r = add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), mat('#c9a06a')), 0, 0.5, 0); r.scale.set(1.2, 0.8, 1);
      add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), mat('#b8895a')), 0.8, 0.25, 0.3);
      break;
    }
  }
  return { g };
}
