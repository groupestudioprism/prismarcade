/* Export : node export.mjs <id> [dossier=out/<id>] → <Id>.glb (modèle, contours, animations cuites à 30 i/s), <Id>_moves.json, statistiques. */
import fs from 'fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { sample, toClip, FPS } from '../../js/world/kit3d.js';
globalThis.FileReader = class { readAsArrayBuffer(b) { b.arrayBuffer().then((r) => { this.result = r; this.onloadend && this.onloadend(); this.onload && this.onload({ target: this }); }); } readAsDataURL(b) { b.arrayBuffer().then((r) => { this.result = 'data:application/octet-stream;base64,' + Buffer.from(r).toString('base64'); this.onloadend && this.onloadend(); }); } };
const id = process.argv[2], out = process.argv[3] || 'out/' + id.replace(':', '_'); fs.mkdirSync(out, { recursive: true });
const [mfile, variant] = id.split(':'), mod = await import(`../../js/world/models/${mfile}.js`), model = variant ? mod.models[variant] : mod.model, { root } = model.build(model.PALETTE);
let tris = 0, max = 0; root.traverse((o) => { if (o.isMesh) { const n = o.geometry.attributes.position.count / 3; tris += n; max = Math.max(max, n); } });
const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3());
const stats = { triangles: tris, maxParMaillage: max, taille_m: size.toArray().map((v) => +v.toFixed(3)), minY: +box.min.y.toFixed(3) }; console.log(stats);
const S = {}, clips = Object.keys(model.ANIMS).map((n) => toClip(model, n, (S[n] = sample(model, n))));
const glb = await new GLTFExporter().parseAsync(root, { binary: true, animations: clips, onlyVisible: false });
fs.writeFileSync(`${out}/${model.file || id}.glb`, Buffer.from(glb));
const anims = {}; Object.keys(S).forEach((n) => { anims[n] = { duration_s: S[n].dur, loop: S[n].loop, frames: S[n].frames.length, fps: FPS }; });
fs.writeFileSync(`${out}/${model.file || id}_moves.json`, JSON.stringify({ id, name: model.name, palette: model.PALETTE, stats, animations: anims, moves: model.MOVES || {} }, null, 2));
console.log('GLB', (glb.byteLength / 1024).toFixed(0), 'Ko →', out);
