import * as THREE from 'three';
import { ANIMS, sample, buildLyra } from './lyra.mjs';
const D2R = Math.PI / 180, { root } = buildLyra(), by = {}; root.traverse((o) => { if (o.name) by[o.name] = o; });
const apply = (f) => Object.entries(f.j).forEach(([j, v]) => { const o = by[j]; if (!o) return; o.position.set(...v.p); o.rotation.set(v.r[0] * D2R, v.r[1] * D2R, v.r[2] * D2R); Array.isArray(v.s) ? o.scale.set(...v.s) : o.scale.setScalar(v.s); });
for (const name of Object.keys(ANIMS)) {
  const S = sample(name), prev = {}, worst = {}, list = ['Staff', 'HandL', 'HandR', 'Cloak_Back', 'Cloak_Left', 'Cloak_Right', 'Flap_FL', 'Flap_FR', 'Flap_BL', 'Flap_BR', 'Flap_SL', 'Flap_SR', 'Fia_Body'];
  S.frames.forEach((f, i) => { apply(f); root.updateMatrixWorld(true); if (S.loop && i === S.frames.length - 1) return; for (const j of list) { const q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(); by[j].matrixWorld.decompose(p, q, s); if (prev[j]) { const a = j === 'Fia_Body' ? prev[j].p.distanceTo(p) * 100 : prev[j].q.angleTo(q) / D2R; if (!worst[j] || a > worst[j].a) worst[j] = { a, t: f.t }; } prev[j] = { q, p }; } });
  console.log(name.padEnd(20), list.map((j) => `${j.replace('Cloak_', 'C').replace('Flap_', 'F').replace('_Body', '')} ${worst[j].a.toFixed(0)}@${worst[j].t}`).join('  '));
}
