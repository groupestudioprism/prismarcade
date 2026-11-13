/* =========================================================
   LUMEN — vie ambiante : papillons, lucioles, oiseaux, poissons,
   fumée de cheminée, braises, pétales, poussières de verre.
   Tout est mis en commun dans quelques « pools » : un seul appel
   de dessin pour toutes les particules (points), deux pour les
   papillons, deux pour les oiseaux. Le décor ne suit que la zone
   courante (showZones → setZone), donc coût constant.
   ========================================================= */
import * as THREE from 'three';
import { hash, T, W } from '../engine/util.js';

/* ---- système de points mou (taille et opacité par point) ---- */
function pointCloud(N, additive) {
  const pos = new Float32Array(N * 3), size = new Float32Array(N), alpha = new Float32Array(N), col = new Float32Array(N * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1)); g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uPx: { value: 700 } },
    vertexShader: 'attribute float aSize; attribute float aAlpha; attribute vec3 aColor; uniform float uPx; varying float vA; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; float d = -mv.z; gl_PointSize = clamp(aSize * uPx / max(d, 0.5), 0.0, 96.0); vA = aAlpha * clamp((170.0 - d) / 90.0, 0.0, 1.0); vC = aColor; }',
    fragmentShader: 'varying float vA; varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float r = length(q) * 2.0; float a = smoothstep(1.0, 0.15, r) * vA; if (a < 0.01) discard; gl_FragColor = vec4(vC, a); }',
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = additive ? 6 : 5;
  return { pts, pos, size, alpha, col, N, g, m, n: 0 };
}

export function createLife(scene, isl, zones, opts = {}) {
  const LOW = !!opts.low;
  const root = new THREE.Group(); scene.add(root);
  const glowP = pointCloud(LOW ? 40 : 110, true), softP = pointCloud(LOW ? 30 : 80, false);
  root.add(softP.pts, glowP.pts);
  const C = (h) => new THREE.Color(h);

  /* papillons et oiseaux : deux ailes instanciées qui battent */
  const wingGeo = new THREE.BufferGeometry(); wingGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0.1, 0.34, 0, 0.16, 0.26, 0, -0.14, 0, 0, 0.1, 0.26, 0, -0.14, 0, 0, -0.1]), 3)); wingGeo.computeVertexNormals();
  const birdGeo = new THREE.BufferGeometry(); birdGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0.25, 0.9, 0.05, 0.1, 0.5, 0, -0.3, 0, 0, 0.25, 0.5, 0, -0.3, 0, 0, -0.15]), 3)); birdGeo.computeVertexNormals();
  const NB = LOW ? 6 : 14, NBIRD = LOW ? 3 : 6;
  const mkWings = (geo, n, colorize) => { const L = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), n), R = new THREE.InstancedMesh(geo, L.material, n); L.frustumCulled = R.frustumCulled = false; L.count = R.count = 0; for (let i = 0; i < n; i++) { const c = colorize(i); L.setColorAt(i, c); R.setColorAt(i, c); } root.add(L, R); return [L, R]; };
  const bfly = mkWings(wingGeo, NB, (i) => C(['#ffd76a', '#ff9ec7', '#ffffff', '#9fe9ff', '#c9b6ff'][i % 5]));
  const birds = mkWings(birdGeo, NBIRD, () => C('#4a4060'));
  const dummy = new THREE.Object3D(), flip = new THREE.Object3D();

  /* poissons qui sautent dans les plans d'eau */
  const fishGeo = new THREE.OctahedronGeometry(0.16, 0); fishGeo.scale(0.8, 0.7, 2);
  const fish = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(fishGeo, new THREE.MeshBasicMaterial({ color: '#ffb36a' })); m.visible = false; root.add(m); return { m, k: 2 + Math.random() * 4, x: 0, z: 0, dx: 0, dz: 0 }; });
  const rings = Array.from({ length: 3 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 16), new THREE.MeshBasicMaterial({ color: '#dff6ff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.visible = false; root.add(r); return r; });

  const zoneCells = zones.map((z, zi) => {
    const out = [], water = [];
    for (let ly = 0; ly < z.map.length; ly++) for (let lx = 0; lx < z.map[ly].length; lx++) {
      const x = z.ox + lx, y = z.oy + ly; if (!isl.zoneAt[y] || isl.zoneAt[y][x] !== zi) continue;
      const t = isl.terrain[y][x];
      if (t === '.' || t === ',') out.push([x, y]); else if (t === '~') water.push([x, y]);
    }
    return { out, water };
  });

  let cur = -1, theme = 'puzzle', emitters = [], cellsNow = [], waterNow = [], center = [0, 0];
  const B = new Array(NB).fill(0).map(() => ({}));
  const FIREFLY = { lande: ['#ffe48a', 22], foret: ['#9ffff0', 34], sanctuaire: ['#c9a0ff', 24], temple: ['#8fe3ff', 20], village: ['#ffd88a', 6], puzzle: ['#ffd88a', 8], interieur: ['#ffd88a', 0], greve: ['#9ffff0', 14], recifs: ['#9ffff0', 22], grotte: ['#6fe8ff', 30], lac: ['#6fe8ff', 26], phare_abysses: ['#8ff8e8', 22] /* ACTE IV */ };

  function setZone(zi, props) {
    cur = zi; const z = zones[zi]; theme = (z && z.theme) || 'puzzle'; if (theme === 'canopee' || theme === 'phare_verre') theme = 'foret';
    const zc = zoneCells[zi] || { out: [], water: [] }; cellsNow = zc.out; waterNow = zc.water;
    emitters = [];
    if (!z) return;
    center = [W(z.ox + z.map[0].length / 2), W(z.oy + z.map.length / 2)];
    // émetteurs : cheminées (fumée) et foyers (braises)
    (props || []).forEach((pr) => {
      if (pr.zi !== zi) return; const u = pr.g.userData;
      if (u.smoke) emitters.push({ kind: 'smoke', x: pr.g.position.x + u.smoke.x, y: pr.g.position.y + u.smoke.y, z: pr.g.position.z + u.smoke.z });
      if (u.flames && u.halo2) emitters.push({ kind: 'ember', x: pr.g.position.x, y: 1.0, z: pr.g.position.z, c: u.halo2.material.color.getHexString() === 'ffffff' ? '#ffb36a' : '#' + u.halo2.material.color.getHexString() });
    });
    seed();
  }
  const rnd = (i, k) => hash(i, cur + 7, k);
  const cellPos = (i, k) => { if (!cellsNow.length) return [center[0], center[1]]; const c = cellsNow[Math.floor(rnd(i, k) * cellsNow.length)]; return [W(c[0]) + (rnd(i, k + 1) - 0.5) * T, W(c[1]) + (rnd(i, k + 2) - 0.5) * T]; };
  const FX = []; // particules « posées » : lucioles, pétales, poussières
  function seed() {
    FX.length = 0;
    const [fc, fn] = FIREFLY[theme] || FIREFLY.puzzle, n = LOW ? Math.ceil(fn * 0.5) : fn;
    for (let i = 0; i < n; i++) { const [x, z] = cellPos(i, 10); FX.push({ kind: 'fire', x, z, y: 0.6 + rnd(i, 13) * 1.8, ph: rnd(i, 14) * 6, c: C(fc), s: 0.13 + rnd(i, 15) * 0.08 }); }
    if (theme === 'foret' || theme === 'temple') for (let i = 0; i < (LOW ? 12 : 30); i++) { const [x, z] = cellPos(i, 20); FX.push({ kind: 'mote', x, z, y: rnd(i, 23) * 5, ph: rnd(i, 24) * 6, c: C(['#bff3ff', '#d8ffe8', '#ffe8ff'][i % 3]), s: 0.09 }); }
    if (theme === 'village' || theme === 'puzzle') for (let i = 0; i < (LOW ? 10 : 26); i++) { const [x, z] = cellPos(i, 30); FX.push({ kind: 'petal', x, z, y: rnd(i, 33) * 7, ph: rnd(i, 34) * 6, c: C(['#ffc2d9', '#ffe0ea', '#ffd1e6'][i % 3]), s: 0.14 }); }
    if (theme === 'sanctuaire') for (let i = 0; i < 18; i++) { const [x, z] = cellPos(i, 40); FX.push({ kind: 'mote', x, z, y: rnd(i, 43) * 3, ph: rnd(i, 44) * 6, c: C('#b39cff'), s: 0.12 }); }
    // papillons : seulement en extérieur « de jour »
    const nb = (theme === 'village' || theme === 'puzzle' || theme === 'lande' || theme === 'foret') ? (LOW ? 4 : (theme === 'village' ? 12 : 7)) : 0;
    B.forEach((b, i) => { b.on = i < nb; if (b.on) { const [x, z] = cellPos(i, 50); b.x = x; b.z = z; b.y = 0.8 + rnd(i, 53) * 1.2; b.a = rnd(i, 54) * 6; b.sp = 0.6 + rnd(i, 55) * 0.7; b.ph = rnd(i, 56) * 6; b.tx = x; b.tz = z; b.t = 0; } });
    bfly[0].count = bfly[1].count = nb; bfly[0].visible = bfly[1].visible = nb > 0;
    const nbd = (theme === 'village' || theme === 'puzzle') ? NBIRD : (theme === 'lande' ? 2 : 0);
    birds[0].count = birds[1].count = nbd; birdN = nbd; birds[0].visible = birds[1].visible = nbd > 0;
  }
  let birdN = 0, px = 0;

  const put = (P, i, x, y, z, s, a, c) => { P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z; P.size[i] = s; P.alpha[i] = a; P.col[i * 3] = c.r; P.col[i * 3 + 1] = c.g; P.col[i * 3 + 2] = c.b; };
  const smokeC = C('#e9e2f0');
  const parts = []; // fumée et braises vivantes
  function emit(dt) {
    emitters.forEach((e) => { e.acc = (e.acc || 0) + dt; const per = e.kind === 'smoke' ? 0.55 : 0.28; while (e.acc > per) { e.acc -= per; parts.push({ kind: e.kind, x: e.x + (Math.random() - 0.5) * 0.2, y: e.y, z: e.z + (Math.random() - 0.5) * 0.2, vx: (Math.random() - 0.3) * 0.25, vz: (Math.random() - 0.5) * 0.2, vy: e.kind === 'smoke' ? 0.7 + Math.random() * 0.3 : 0.9 + Math.random() * 0.8, age: 0, life: e.kind === 'smoke' ? 3.2 : 1.6, c: e.kind === 'ember' ? C(e.c) : smokeC }); } });
    if (parts.length > 70) parts.splice(0, parts.length - 70);
  }

  function update(dt, t, camPos) {
    const sP = softP, gP = glowP;
    const px_ = Math.max(300, (opts.height ? opts.height() : innerHeight)) * 0.9; sP.m.uniforms.uPx.value = gP.m.uniforms.uPx.value = px_;
    let gi = 0, si = 0;
    FX.forEach((f, i) => {
      if (f.kind === 'fire') { const a = t * 0.5 + f.ph; put(gP, gi++, f.x + Math.sin(a * 1.3) * 0.9, f.y + Math.sin(a * 2.1) * 0.3, f.z + Math.cos(a) * 0.9, f.s, 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.6 + f.ph * 3)), f.c); }
      else if (f.kind === 'mote') { const k = ((t * 0.12 + f.ph) % 1); put(gP, gi++, f.x + Math.sin(t * 0.4 + f.ph) * 0.6, (f.y + k * 5) % 6, f.z + Math.cos(t * 0.35 + f.ph) * 0.6, f.s, 0.5 * Math.sin(k * Math.PI), f.c); }
      else if (f.kind === 'petal') { const k = ((t * 0.07 + f.ph) % 1); put(sP, si++, f.x + Math.sin(t * 0.9 + f.ph) * 1.2 + k * 2, 7 - k * 7, f.z + Math.cos(t * 0.7 + f.ph) * 0.8, f.s, 0.8 * Math.min(1, k * 6, (1 - k) * 4), f.c); }
    });
    // fumée et braises
    emit(dt);
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.age += dt; if (q.age > q.life) { parts.splice(i, 1); continue; }
      q.x += (q.vx + Math.sin(q.age * 2 + q.y) * 0.1) * dt; q.y += q.vy * dt; q.z += q.vz * dt; const k = q.age / q.life;
      if (q.kind === 'smoke') { if (si < sP.N) put(sP, si++, q.x, q.y, q.z, 0.35 + k * 0.9, 0.5 * (1 - k) * Math.min(1, k * 8), q.c); }
      else if (gi < gP.N) put(gP, gi++, q.x + Math.sin(q.age * 9) * 0.05, q.y, q.z, 0.09, 0.9 * (1 - k), q.c);
    }
    gP.g.setDrawRange(0, gi); sP.g.setDrawRange(0, si);
    for (let i = gi; i < gP.N; i++) gP.alpha[i] = 0; for (let i = si; i < sP.N; i++) sP.alpha[i] = 0;
    ['position', 'aSize', 'aAlpha', 'aColor'].forEach((n) => { gP.g.attributes[n].needsUpdate = true; sP.g.attributes[n].needsUpdate = true; });

    // papillons : flânent d'une fleur à l'autre
    const nb = bfly[0].count;
    for (let i = 0; i < nb; i++) {
      const b = B[i]; b.t -= dt;
      if (b.t < 0) { const [x, z] = cellPos(i + Math.floor(t), 60 + i); b.tx = x; b.tz = z; b.t = 3 + Math.random() * 4; b.ty = 0.5 + Math.random() * 1.6; }
      const dx = b.tx - b.x, dz = b.tz - b.z, d = Math.hypot(dx, dz) || 1, want = Math.atan2(dx, dz);
      let da = want - b.a; da = Math.atan2(Math.sin(da), Math.cos(da)); b.a += da * Math.min(1, dt * 2.5) + Math.sin(t * 3 + b.ph) * dt * 1.2;
      const sp = Math.min(d, 1) * b.sp * 1.6; b.x += Math.sin(b.a) * sp * dt; b.z += Math.cos(b.a) * sp * dt; b.y += ((b.ty || 1) + Math.sin(t * 4 + b.ph) * 0.25 - b.y) * Math.min(1, dt * 1.2);
      const flap = 0.2 + Math.abs(Math.sin(t * 16 + b.ph)) * 1.0;
      dummy.position.set(b.x, b.y, b.z); dummy.rotation.set(0, b.a, 0); dummy.scale.setScalar(1); dummy.updateMatrix();
      const m = dummy.matrix.clone();
      bfly[0].setMatrixAt(i, m.clone().multiply(new THREE.Matrix4().makeRotationZ(flap))); bfly[1].setMatrixAt(i, m.clone().multiply(new THREE.Matrix4().makeRotationZ(-flap)).multiply(new THREE.Matrix4().makeScale(-1, 1, 1)));
    }
    if (nb) { bfly[0].instanceMatrix.needsUpdate = bfly[1].instanceMatrix.needsUpdate = true; }
    // oiseaux : décrivent de grands cercles
    for (let i = 0; i < birdN; i++) {
      const a = t * (0.12 + i * 0.015) * (i % 2 ? 1 : -1) + i * 1.3, rad = 16 + i * 4.5, y = 13 + (i % 3) * 3 + Math.sin(t * 0.5 + i) * 0.8;
      const bx = center[0] + Math.cos(a) * rad, bz = center[1] + Math.sin(a) * rad * 0.8;
      dummy.position.set(bx, y, bz); dummy.rotation.set(0, Math.atan2((i % 2 ? 1 : -1) * -Math.sin(a), (i % 2 ? 1 : -1) * Math.cos(a) * 0.8), 0); dummy.scale.setScalar(1.1); dummy.updateMatrix();
      const fl = Math.sin(t * 7 + i * 2) * 0.5;
      birds[0].setMatrixAt(i, dummy.matrix.clone().multiply(new THREE.Matrix4().makeRotationZ(fl)));
      birds[1].setMatrixAt(i, dummy.matrix.clone().multiply(new THREE.Matrix4().makeRotationZ(-fl)).multiply(new THREE.Matrix4().makeScale(-1, 1, 1)));
    }
    if (birdN) birds[0].instanceMatrix.needsUpdate = birds[1].instanceMatrix.needsUpdate = true;
    // poissons : un saut de temps en temps
    fish.forEach((f, i) => {
      if (!waterNow.length) { f.m.visible = false; return; }
      f.k -= dt;
      if (f.k < 0 && !f.m.visible) { const c = waterNow[Math.floor(Math.random() * waterNow.length)]; f.x = W(c[0]) + (Math.random() - 0.5); f.z = W(c[1]) + (Math.random() - 0.5); const a = Math.random() * 6; f.dx = Math.cos(a) * 0.9; f.dz = Math.sin(a) * 0.9; f.t = 0; f.m.visible = true; }
      if (f.m.visible) {
        f.t += dt * 1.1; const k = f.t;
        f.m.position.set(f.x + f.dx * k, -0.1 + Math.sin(k * Math.PI) * 0.9, f.z + f.dz * k); f.m.rotation.set(Math.cos(k * Math.PI) * 0.9, Math.atan2(f.dx, f.dz), 0);
        const rg = rings[i]; rg.position.set(f.x + f.dx * (k < 0.5 ? 0 : 1), -0.04, f.z + f.dz * (k < 0.5 ? 0 : 1));
        if (k >= 1) { f.m.visible = false; f.k = 4 + Math.random() * 7; rg.userData.r = 0; rg.position.set(f.x + f.dx, -0.04, f.z + f.dz); }
      }
      const rg = rings[i]; if (rg.userData.r !== undefined) { rg.userData.r += dt * 1.4; const q = rg.userData.r; rg.visible = true; rg.scale.setScalar(1 + q * 3); rg.material.opacity = Math.max(0, 0.6 * (1 - q)); if (q > 1) { rg.userData.r = undefined; rg.visible = false; } }
    });
  }
  return { setZone, update, root };
}
