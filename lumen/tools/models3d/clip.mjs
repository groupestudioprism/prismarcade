/* Contrôle des traversées : node clip.mjs <id> [pas=1] [-v]
   Pour chaque image de chaque animation : points de surface d'une pièce à l'intérieur d'une autre (ou collés à une coque
   ouverte), et ce qui passe sous le sol. Paires ignorées : parent/enfant direct (articulations) + model.ignore.
   Le résultat attendu est « TOTAL 0 ». */
import * as THREE from 'three';
import { sample, applyPose, D2R } from '../../js/world/kit3d.js';
const id = process.argv[2], STEP = +(process.argv[3] || 1) || 1, verbose = process.argv.includes('-v');
const { model } = await import(`../../js/world/models/${id}.js`);
const { root, nodes } = model.build(model.PALETTE);
const parts = []; root.traverse((o) => { if (o.isMesh && !o.name.endsWith('_Outline') && !o.userData.glow) parts.push(o); });
const meshParent = (o) => { let p = o.parent; while (p && !p.isMesh) p = p.parent; return p; };
const IGN = (model.ignore || []).map(([a, b]) => [new RegExp('^' + a + '$'), new RegExp('^' + b + '$')]);
const ign = (a, b) => meshParent(a) === b || meshParent(b) === a || IGN.some(([x, y]) => (x.test(a.name) && y.test(b.name)) || (x.test(b.name) && y.test(a.name)));
const SPACING = model.clipSpacing || 0.028;
parts.forEach((m) => {
  const p = m.geometry.attributes.position, tris = new Float32Array((m.userData.solid || m.geometry).attributes.position.array), pts = [];
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) { A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
    const n = Math.max(1, Math.min(40, Math.ceil(Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) / SPACING)));
    for (let u = 0; u <= n; u++) for (let v = 0; v <= n - u; v++) { const w = n - u - v; pts.push((A.x * u + B.x * v + C.x * w) / n, (A.y * u + B.y * v + C.y * w) / n, (A.z * u + B.z * v + C.z * w) / n); } }
  const seen = new Set(), out = [];
  for (let i = 0; i < pts.length; i += 3) { const k = Math.round(pts[i] * 250) + ',' + Math.round(pts[i + 1] * 250) + ',' + Math.round(pts[i + 2] * 250); if (!seen.has(k)) { seen.add(k); out.push(pts[i], pts[i + 1], pts[i + 2]); } }
  const bb = new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(tris, 3));
  m.userData.c = { tris, pts: new Float32Array(out), box: bb.expandByScalar(0.012) };
});
const DIR = new THREE.Vector3(0.8123, 0.4311, 0.3927).normalize();
function inside(tris, P) { let c = 0; const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), h = new THREE.Vector3(), s = new THREE.Vector3(), q = new THREE.Vector3(), a = new THREE.Vector3();
  for (let i = 0; i < tris.length; i += 9) { a.set(tris[i], tris[i + 1], tris[i + 2]); e1.set(tris[i + 3] - a.x, tris[i + 4] - a.y, tris[i + 5] - a.z); e2.set(tris[i + 6] - a.x, tris[i + 7] - a.y, tris[i + 8] - a.z);
    h.crossVectors(DIR, e2); const det = e1.dot(h); if (Math.abs(det) < 1e-12) continue; const f = 1 / det; s.subVectors(P, a); const u = f * s.dot(h); if (u < 0 || u > 1) continue;
    q.crossVectors(s, e1); const v = f * DIR.dot(q); if (v < 0 || u + v > 1) continue; if (f * e2.dot(q) > 1e-7) c += det > 0 ? 1 : -1; }
  return c !== 0; }
const tri = new THREE.Triangle(), cp = new THREE.Vector3();
function near(tris, P, d) { for (let i = 0; i < tris.length; i += 9) { tri.a.set(tris[i], tris[i + 1], tris[i + 2]); tri.b.set(tris[i + 3], tris[i + 4], tris[i + 5]); tri.c.set(tris[i + 6], tris[i + 7], tris[i + 8]); tri.closestPointToPoint(P, cp); if (cp.distanceToSquared(P) < d * d) return true; } return false; }
const inv = new THREE.Matrix4(), M = new THREE.Matrix4(), P = new THREE.Vector3();
function measure() {
  root.updateMatrixWorld(true); const res = {}; let ground = 0, gname = '';
  parts.forEach((a) => { const e = a.matrixWorld.elements, pts = a.userData.c.pts; let m = 0; for (let i = 0; i < pts.length; i += 3) { const y = e[1] * pts[i] + e[5] * pts[i + 1] + e[9] * pts[i + 2] + e[13]; if (y < m) m = y; } if (m < ground) { ground = m; gname = a.name; } });
  for (const b of parts) { inv.copy(b.matrixWorld).invert();
    for (const a of parts) { if (a === b || ign(a, b)) continue; M.multiplyMatrices(inv, a.matrixWorld); const pts = a.userData.c.pts; let n = 0;
      for (let i = 0; i < pts.length; i += 3) { P.set(pts[i], pts[i + 1], pts[i + 2]).applyMatrix4(M); if (!b.userData.c.box.containsPoint(P)) continue; if (b.userData.shell ? near(b.userData.c.tris, P, 0.006) : inside(b.userData.c.tris, P)) n++; }
      if (n) res[a.name + ' dans ' + b.name] = n; } }
  return { res, ground, gname };
}
const fromFrame = (f) => { const p = {}; for (const [j, v] of Object.entries(f.j)) { const R = model.REST[j]; p[j] = { r: v.r.map((x, i) => x - R.r[i]), p: v.p.map((x, i) => x - R.p[i]), s: Array.isArray(v.s) ? v.s.map((x) => x / (R.s || 1)) : v.s / (R.s || 1) }; } return p; };
applyPose(model, nodes, {}); const rest = measure().res;
if (verbose || Object.keys(rest).length) console.log('Repos (recouvrements de construction, à réduire au minimum) :', rest);
let total = 0;
for (const name of Object.keys(model.ANIMS)) {
  const S = sample(model, name), agg = {}; let g = 0, gn = '', gt = 0;
  for (let i = 0; i < S.frames.length; i += STEP) { applyPose(model, nodes, fromFrame(S.frames[i])); const { res, ground, gname } = measure();
    if (ground < g) { g = ground; gn = gname; gt = S.frames[i].t; }
    for (const [k, n] of Object.entries(res)) { const extra = n - (rest[k] || 0); if (extra > 2) { const a = agg[k] || (agg[k] = { max: 0, frames: 0, t: 0 }); a.frames++; if (extra > a.max) { a.max = extra; a.t = S.frames[i].t; } } } }
  const list = Object.entries(agg).sort((x, y) => y[1].max - x[1].max), under = model.ground !== false && g < -0.004;
  total += list.length + (under ? 1 : 0);
  console.log(`== ${name} : ${list.length} traversée(s)` + (under ? ` · sous le sol ${g.toFixed(3)} m (${gn}, t=${gt})` : ''));
  list.forEach(([k, a]) => console.log(`   ${k} : ${a.max} pts, ${a.frames} images, pire à t=${a.t}`));
}
console.log('TOTAL', total);
process.exit(total ? 1 : 0);
