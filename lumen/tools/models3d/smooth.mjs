/* Fluidité : node smooth.mjs <id> — plus grand saut d'une image à l'autre (degrés pour les pièces, cm pour la racine), par animation. */
import * as THREE from 'three';
import { sample, applyPose } from '../../js/world/kit3d.js';
const [mfile, variant] = process.argv[2].split(':'), mod = await import(`../../js/world/models/${mfile}.js`), model = variant ? mod.models[variant] : mod.model, { root, nodes } = model.build(model.PALETTE);
for (const name of Object.keys(model.ANIMS)) {
  const S = sample(model, name), prev = {}, worst = {};
  S.frames.forEach((f, i) => { const p = {}; for (const [j, v] of Object.entries(f.j)) { const R = model.REST[j]; p[j] = { r: v.r.map((x, k) => x - R.r[k]), p: v.p.map((x, k) => x - R.p[k]), s: Array.isArray(v.s) ? v.s.map((x) => x / (R.s || 1)) : v.s / (R.s || 1) }; }
    applyPose(model, nodes, p); root.updateMatrixWorld(true); if (S.loop && i === S.frames.length - 1) return;
    for (const j of model.JOINTS) { const n = nodes[j]; if (!n) continue; const q = new THREE.Quaternion(), pos = new THREE.Vector3(), s = new THREE.Vector3(); n.matrixWorld.decompose(pos, q, s); if (prev[j]) { const a = prev[j].q.angleTo(q) * 180 / Math.PI, dcm = prev[j].p.distanceTo(pos) * 100; if (!worst[j] || a > worst[j].a) worst[j] = { a, t: f.t, d: Math.max(dcm, worst[j] ? worst[j].d : 0) }; else worst[j].d = Math.max(worst[j].d, dcm); } prev[j] = { q, p: pos }; } });
  const top = Object.entries(worst).sort((a, b) => b[1].a - a[1].a).slice(0, 4).map(([j, w]) => `${j} ${w.a.toFixed(0)}°@${w.t} (${w.d.toFixed(0)} cm)`);
  console.log(name.padEnd(14), top.join('  '));
}
