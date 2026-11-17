/* Contrôle des traversées : pour chaque image de chaque animation, cherche les pièces qui se pénètrent
   (points de surface d'une pièce à l'intérieur d'une autre, ou collés à la coque de la capuche) et ce qui passe sous le sol. */
import * as THREE from 'three';
import { buildLyra, ANIMS, sample } from './lyra.mjs';
const D2R = Math.PI / 180, STEP = +(process.argv[3] || 2), only = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : null, verbose = process.argv.includes('-v');
const { root } = buildLyra(); const by = {}; root.traverse((o) => { if (o.name) by[o.name] = o; });
const SKIP = new Set(['Eyes_Glow', 'Collar_Runes', 'Staff_LightRing', 'Fia_Core']);
const parts = []; root.traverse((o) => { if (o.isMesh && !o.name.endsWith('_Outline') && !SKIP.has(o.name)) parts.push(o); });
const SPACING = 0.028;
parts.forEach((m) => {
  const p = m.geometry.attributes.position, tris = new Float32Array((m.userData.solid || m.geometry).attributes.position.array), pts = [];
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
    const n = Math.max(1, Math.ceil(Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) / SPACING));
    for (let u = 0; u <= n; u++) for (let v = 0; v <= n - u; v++) { const w = n - u - v; pts.push((A.x * u + B.x * v + C.x * w) / n, (A.y * u + B.y * v + C.y * w) / n, (A.z * u + B.z * v + C.z * w) / n); }
  }
  // dédoublonnage grossier
  const seen = new Set(), out = [];
  for (let i = 0; i < pts.length; i += 3) { const k = Math.round(pts[i] * 250) + ',' + Math.round(pts[i + 1] * 250) + ',' + Math.round(pts[i + 2] * 250); if (!seen.has(k)) { seen.add(k); out.push(pts[i], pts[i + 1], pts[i + 2]); } }
  m.geometry.computeBoundingBox();
  m.userData = { tris, pts: new Float32Array(out), box: m.geometry.boundingBox.clone().expandByScalar(0.012), shell: m.name === 'Hood' };
});
const J = [['Pelvis', 'Torso'], ['Pelvis', 'Leg._Upper'], ['Pelvis', 'Flap_..'], ['Torso', 'Head'], ['Torso', 'Hood'], ['Torso', 'Hair_Bangs'], ['Torso', 'Arm._Upper'], ['Torso', 'Flap_..'], ['Torso', 'Leg._Upper'], ['Head', 'Hood'], ['Head', 'Hair_Bangs'], ['Hood', 'Hair_Bangs'],
  ['Arm(.)_Upper', 'Arm\\1_Lower'], ['Arm(.)_Lower', 'Hand\\1'], ['Leg(.)_Upper', 'Leg\\1_Lower'], ['Leg(.)_Lower', 'Foot\\1'], ['HandL', 'Staff'], ['Flap_..', 'Flap_..'], ['Cloak_.*', 'Cloak_.*'], ['Torso', 'Cloak_.*']].map(([a, b]) => new RegExp('^' + a + '\\|' + b + '$'));
const IGN = (a, b) => J.some((r) => r.test(a + '|' + b) || r.test(b + '|' + a));
const DIR = new THREE.Vector3(0.8123, 0.4311, 0.3927).normalize();
function inside(tris, P) {   // parité des croisements d'un rayon
  let c = 0; const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), h = new THREE.Vector3(), s = new THREE.Vector3(), q = new THREE.Vector3(), a = new THREE.Vector3();
  for (let i = 0; i < tris.length; i += 9) {
    a.set(tris[i], tris[i + 1], tris[i + 2]); e1.set(tris[i + 3] - a.x, tris[i + 4] - a.y, tris[i + 5] - a.z); e2.set(tris[i + 6] - a.x, tris[i + 7] - a.y, tris[i + 8] - a.z);
    h.crossVectors(DIR, e2); const det = e1.dot(h); if (Math.abs(det) < 1e-12) continue;
    const f = 1 / det; s.subVectors(P, a); const u = f * s.dot(h); if (u < 0 || u > 1) continue;
    q.crossVectors(s, e1); const v = f * DIR.dot(q); if (v < 0 || u + v > 1) continue;
    if (f * e2.dot(q) > 1e-7) c += det > 0 ? 1 : -1;
  }
  return c !== 0;
}
const tri = new THREE.Triangle(), cp = new THREE.Vector3();
function near(tris, P, d) { for (let i = 0; i < tris.length; i += 9) { tri.a.set(tris[i], tris[i + 1], tris[i + 2]); tri.b.set(tris[i + 3], tris[i + 4], tris[i + 5]); tri.c.set(tris[i + 6], tris[i + 7], tris[i + 8]); tri.closestPointToPoint(P, cp); if (cp.distanceToSquared(P) < d * d) return true; } return false; }
const inv = new THREE.Matrix4(), M = new THREE.Matrix4(), P = new THREE.Vector3();
function measure() {
  root.updateMatrixWorld(true); const res = {}; let ground = 0, gname = '';
  parts.forEach((a) => { const e = a.matrixWorld.elements, pts = a.userData.pts; let m = 0; for (let i = 0; i < pts.length; i += 3) { const y = e[1] * pts[i] + e[5] * pts[i + 1] + e[9] * pts[i + 2] + e[13]; if (y < m) m = y; } if (m < ground) { ground = m; gname = a.name; } });
  for (const b of parts) {
    inv.copy(b.matrixWorld).invert();
    for (const a of parts) {
      if (a === b || IGN(a.name, b.name)) continue;
      M.multiplyMatrices(inv, a.matrixWorld); const pts = a.userData.pts; let n = 0;
      for (let i = 0; i < pts.length; i += 3) {
        P.set(pts[i], pts[i + 1], pts[i + 2]).applyMatrix4(M);
        if (!b.userData.box.containsPoint(P)) continue;
        if (b.userData.shell ? near(b.userData.tris, P, 0.006) : inside(b.userData.tris, P)) n++;
      }
      if (n) res[a.name + ' dans ' + b.name] = n;
    }
  }
  return { res, ground, gname };
}
const apply = (f) => Object.entries(f.j).forEach(([j, v]) => { const o = by[j]; if (!o) return; o.position.set(...v.p); o.rotation.set(v.r[0] * D2R, v.r[1] * D2R, v.r[2] * D2R); (Array.isArray(v.s) ? o.scale.set(...v.s) : o.scale.setScalar(v.s)); });
const rest = measure().res;
if (verbose) console.log('repos', rest);
let total = 0;
for (const name of Object.keys(ANIMS)) {
  if (only && !only.includes(name)) continue;
  const S = sample(name), agg = {}; let g = 0, gn = '', gt = 0;
  for (let i = 0; i < S.frames.length; i += STEP) {
    apply(S.frames[i]); const { res, ground, gname } = measure();
    if (ground < g) { g = ground; gn = gname; gt = S.frames[i].t; }
    for (const [k, n] of Object.entries(res)) { const extra = n - (rest[k] || 0); if (extra > 2) { const a = agg[k] || (agg[k] = { max: 0, frames: 0, t: 0 }); a.frames++; if (extra > a.max) { a.max = extra; a.t = S.frames[i].t; } } }
  }
  const list = Object.entries(agg).sort((x, y) => y[1].max - x[1].max);
  total += list.length + (g < -0.004 ? 1 : 0);
  console.log(`\n== ${name} : ${list.length} traversée(s)` + (g < -0.004 ? ` · sous le sol ${g.toFixed(3)} m (${gn}, t=${gt})` : ''));
  list.forEach(([k, a]) => console.log(`   ${k} : ${a.max} pts, ${a.frames} images, pire à t=${a.t}`));
}
console.log('\nTOTAL', total);
