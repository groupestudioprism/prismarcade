/* Export GLB + tables d'animation (Node) */
import fs from 'fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildLyra, ANIMS, MOVES, JOINTS, sample, toClip, PALETTE, FPS } from './lyra.mjs';

globalThis.FileReader = class { readAsArrayBuffer(b) { b.arrayBuffer().then((r) => { this.result = r; this.onloadend && this.onloadend(); this.onload && this.onload({ target: this }); }); } readAsDataURL(b) { b.arrayBuffer().then((r) => { this.result = 'data:application/octet-stream;base64,' + Buffer.from(r).toString('base64'); this.onloadend && this.onloadend(); }); } };

const out = process.argv[2] || 'out';
fs.mkdirSync(out, { recursive: true });
const { root } = buildLyra();
// statistiques
let tris = 0; const per = [];
root.traverse((o) => { if (o.isMesh) { const n = o.geometry.attributes.position.count / 3; tris += n; per.push([o.name, n]); } });
const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3());
console.log('triangles', tris, 'max/maillage', Math.max(...per.map((p) => p[1])), 'taille', size.toArray().map((v) => v.toFixed(3)).join(' × '), 'min y', box.min.y.toFixed(3));
/* recalage au sol : aucune pièce sous Y = 0 ; la pose finale de la défaite repose exactement au sol */
const D2R = Math.PI / 180;
const meshes = []; root.traverse((o) => { if (o.isMesh && !o.name.endsWith('_Outline') && !o.name.startsWith('Fia') && o.name !== 'Staff_LightRing') { o.geometry.computeBoundingBox(); meshes.push(o); } });
const byName = {}; root.traverse((o) => { if (o.name) byName[o.name] = o; });
const minY = () => { root.updateMatrixWorld(true); let m = 1e9; const v = new THREE.Vector3(); meshes.forEach((o) => { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y < m) m = v.y; } }); return m; };
const SAMPLES = {};
Object.keys(ANIMS).forEach((name) => {
  const S = sample(name); let fixed = 0;
  S.frames.forEach((f, i) => {
    Object.entries(f.j).forEach(([j, v]) => { const o = byName[j]; if (!o) return; o.position.set(...v.p); o.rotation.set(v.r[0] * D2R, v.r[1] * D2R, v.r[2] * D2R); o.scale.setScalar(v.s); });
    const m = minY();
    const lastFrames = name === 'DEFEATED' && f.t >= 2.2;
    if (m < -0.002 || lastFrames) { const dy = lastFrames ? -m : -m; f.j.Pelvis.p[1] += dy; if (Math.abs(dy) > 0.002) fixed++; }
  });
  SAMPLES[name] = S;
  if (fixed) console.log('recalage au sol', name, fixed, 'images');
});
// remise en pose de repos pour l'export
buildLyra; const fresh = buildLyra().root;
const clips = Object.keys(ANIMS).map((n) => toClip(n, SAMPLES[n]));
const glb = await new GLTFExporter().parseAsync(fresh, { binary: true, animations: clips, onlyVisible: false });
fs.writeFileSync(out + '/Lyra_Fia.glb', Buffer.from(glb));
console.log('GLB', (glb.byteLength / 1024).toFixed(0), 'Ko');
// tables d'images clés (CSV complet, 30 i/s) + résumé JSON
const rows = ['animation,time_s,joint,rot_x_deg,rot_y_deg,rot_z_deg,pos_x_m,pos_y_m,pos_z_m,scale'];
const summary = {};
Object.keys(ANIMS).forEach((name) => {
  const S = SAMPLES[name];
  S.frames.forEach((f) => JOINTS.forEach((j) => { const v = f.j[j]; rows.push([name, f.t.toFixed(3), j, ...v.r.map((x) => x.toFixed(2)), ...v.p.map((x) => x.toFixed(4)), v.s.toFixed(4)].join(',')); }));
  summary[name] = { duration_s: S.dur, loop: S.loop, frames: S.frames.length, fps: FPS };
});
fs.writeFileSync(out + '/Lyra_keyframes_30fps.csv', rows.join('\n'));
fs.writeFileSync(out + '/Lyra_moves.json', JSON.stringify({ palette: PALETTE, animations: summary, moves: MOVES }, null, 2));
console.log('lignes CSV', rows.length - 1);
