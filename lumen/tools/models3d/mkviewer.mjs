/* Aperçu animé : node mkviewer.mjs <id> [cdn|local] → out/<id>/index.html (GLB intégré). « local » lit three.js sur le serveur lancé dans lumen/. */
import fs from 'fs';
const id = process.argv[2], mode = process.argv[3] || 'cdn', [mfile, variant] = id.split(':'), mod = await import(`../../js/world/models/${mfile}.js`), model = variant ? mod.models[variant] : mod.model, dir = 'out/' + id.replace(':', '_'), f = model.file || id;
const meta = JSON.parse(fs.readFileSync(`${dir}/${f}_moves.json`, 'utf8')); meta.labels = model.LABELS || {};
const h = fs.readFileSync('viewer.template.html', 'utf8').replace('__TITLE__', model.name + ' : modèle 3D (aperçu animé)').replace('__NAME__', model.name).replace('__SUB__', model.subtitle || 'modèle low-poly facetté')
  .replace('__THREE__', mode === 'local' ? '/vendor/three.module.min.js' : 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').replace('__ADDONS__', mode === 'local' ? '/node_modules/three/examples/jsm/' : 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/')
  .replace('__GLB__', 'data:model/gltf-binary;base64,' + fs.readFileSync(`${dir}/${f}.glb`).toString('base64')).replace('__META__', JSON.stringify(meta));
fs.writeFileSync(mode === 'local' ? `${dir}/local.html` : `${dir}/index.html`, h); console.log(mode, (h.length / 1024).toFixed(0), 'Ko');
