import fs from 'fs';
import { MOVES } from './lyra.mjs';
const mode = process.argv[2];   // local | cdn
const glb = 'data:model/gltf-binary;base64,' + fs.readFileSync('out/Lyra_Fia.glb').toString('base64');
let h = fs.readFileSync('viewer.template.html', 'utf8')
  .replace('__THREE__', mode === 'local' ? '/node_modules/three/build/three.module.js' : 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
  .replace('__ADDONS__', mode === 'local' ? '/node_modules/three/examples/jsm/' : 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/')
  .replace('__GLB__', glb).replace('__MOVES__', JSON.stringify(MOVES));
fs.writeFileSync(mode === 'local' ? 'viewer_local.html' : 'out/Lyra_apercu.html', h);
console.log(mode, (h.length / 1024).toFixed(0), 'Ko');
