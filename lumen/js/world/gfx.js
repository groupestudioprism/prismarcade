/* =========================================================
   LUMEN — outils graphiques partagés (world/*) :
   horloge des shaders, vent dans la végétation, eau qui scintille,
   texture de vitrail, dégradés pour faisceaux de lumière.
   Tout est procédural (canvas / shaders courts), aucun fichier externe.
   ========================================================= */
import * as THREE from 'three';

export const U = { time: { value: 0 } };
export const tickGfx = (t) => { U.time.value = t; };

/* Vent : déplace les sommets proportionnellement à leur hauteur locale (y>0).
   Fonctionne avec ou sans InstancedMesh. pulse : modulation de l'émission par instance. */
export function patchSway(material, { amp = 0.12, speed = 1.6, pulse = 0, key = 'sway' } = {}) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying float vPh;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vPh = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.53;
        #else
          vPh = 0.0;
        #endif
        float swH = max(position.y, 0.0);
        transformed.x += sin(uTime * ${speed.toFixed(2)} + vPh) * ${amp.toFixed(3)} * swH;
        transformed.z += cos(uTime * ${(speed * 0.8).toFixed(2)} + vPh * 1.3) * ${(amp * 0.6).toFixed(3)} * swH;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying float vPh;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance *= (1.0 + ${pulse.toFixed(2)} * sin(uTime * 1.3 + vPh * 2.0));`);
  };
  material.customProgramCacheKey = () => `${key}:${amp}:${speed}:${pulse}`;
  return material;
}

/* Eau : éclats de lumière qui glissent à la surface (coordonnées monde). */
export function patchWater(material) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp4 = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp4 = instanceMatrix * wp4;
        #endif
        vWp = (modelMatrix * wp4).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWp;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float s1 = sin(vWp.x * 1.7 + uTime * 0.9) * sin(vWp.z * 1.3 - uTime * 0.7);
        float s2 = sin((vWp.x + vWp.z) * 2.6 + uTime * 1.7) * sin(vWp.x * 0.9 - vWp.z * 2.1 + uTime * 0.5);
        float sp = smoothstep(0.55, 0.9, s1 * 0.55 + s2 * 0.45);
        totalEmissiveRadiance += vec3(0.55, 0.85, 1.0) * sp * 1.1;
        diffuseColor.rgb += vec3(0.04, 0.07, 0.1) * (0.5 + 0.5 * s1);`);
  };
  material.customProgramCacheKey = () => 'water1';
  return material;
}

/* Texture de vitrail en niveaux de gris : plombs sombres + cellules plus ou moins claires.
   Elle se multiplie à la couleur (et à l'émission) du verre. Mise en cache. */
let _glassTex = null;
export function glassTexture() {
  if (_glassTex) return _glassTex;
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
  // cellules : losanges et rosace, luminosité variable
  const cells = 4, w = S / cells;
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
    const v = 175 + ((i * 7 + j * 13) % 5) * 16;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath(); g.moveTo(i * w + w / 2, j * w); g.lineTo(i * w + w, j * w + w / 2); g.lineTo(i * w + w / 2, j * w + w); g.lineTo(i * w, j * w + w / 2); g.closePath(); g.fill();
    g.fillStyle = `rgb(${Math.min(255, v + 35)},${Math.min(255, v + 35)},${Math.min(255, v + 35)})`;
    g.beginPath(); g.arc(i * w + w / 2, j * w + w / 2, w * 0.17, 0, 7); g.fill();
  }
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 3.5; g.lineCap = 'round';
  for (let k = 0; k <= cells; k++) {
    g.beginPath(); g.moveTo(k * w, 0); g.lineTo(k * w, S); g.stroke();
    g.beginPath(); g.moveTo(0, k * w); g.lineTo(S, k * w); g.stroke();
  }
  g.lineWidth = 2.5;
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
    g.beginPath(); g.moveTo(i * w + w / 2, j * w); g.lineTo(i * w + w, j * w + w / 2); g.lineTo(i * w + w / 2, j * w + w); g.lineTo(i * w, j * w + w / 2); g.closePath(); g.stroke();
  }
  g.lineWidth = 6; g.strokeRect(1, 1, S - 2, S - 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2;
  _glassTex = t; return t;
}

/* Dégradé vertical (alpha) pour faisceaux/rayons de lumière et colonnes de balise. */
let _shaftTex = null;
export function shaftTexture() {
  if (_shaftTex) return _shaftTex;
  const c = document.createElement('canvas'); c.width = 16; c.height = 128;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 16, 128);
  // bords doux (horizontal) : on multiplie par un dégradé central
  const id = g.getImageData(0, 0, 16, 128);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 16; x++) { const k = 1 - Math.abs((x - 7.5) / 8); id.data[(y * 16 + x) * 4 + 3] *= Math.pow(Math.max(0, k), 0.8); }
  g.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  _shaftTex = t; return t;
}

/* Halo rond doux (sprite) pour lampes, braises, balise. */
let _haloTex = null;
export function haloTexture() {
  if (_haloTex) return _haloTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  _haloTex = t; return t;
}
export function haloSprite(hex, size = 1.6, op = 0.6) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: new THREE.Color(hex), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.scale.setScalar(size); return m;
}

/* Fusionne plusieurs formes (géométrie + matrice) en une seule géométrie non indexée. */
export function merge(parts) {
  let n = 0; const gs = parts.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); n += q.attributes.position.count; return q; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  gs.forEach((q) => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); o += q.attributes.position.count; });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  gs.forEach((q) => q.dispose()); return out;
}
export const mx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));

/* Fusionne les maillages statiques d'un groupe (même matériau, même ombre) en un seul :
   les maisons et meubles passent de dizaines d'appels de dessin à quelques-uns.
   `skip` : maillages animés à laisser tels quels (et leurs enfants). */
const matKey = (m) => [m.type, m.color && m.color.getHex(), m.emissive && m.emissive.getHex(), m.emissiveIntensity, m.opacity, m.transparent, m.metalness, m.roughness, m.side, m.flatShading, m.depthWrite, m.blending, m.userData && m.userData.unique ? m.uuid : ''].join('|');
export function bakeStatic(root, skip = new Set()) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || skip.has(o) || (o.material && (Array.isArray(o.material) || o.material.map || o.material.userData.keep))) return;
    for (let a = o.parent; a && a !== root; a = a.parent) if (skip.has(a)) return;
    if (!o.geometry.attributes.normal) return;
    const key = matKey(o.material) + (o.castShadow ? 'c' : 'n') + (o.receiveShadow ? 'r' : 'n');
    let b = buckets.get(key); if (!b) buckets.set(key, (b = { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, parts: [], src: [] }));
    b.parts.push([o.geometry, new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)]); b.src.push(o);
  });
  buckets.forEach((b) => {
    const m = new THREE.Mesh(merge(b.parts), b.mat); m.castShadow = b.cast; m.receiveShadow = b.recv; root.add(m);
    b.src.forEach((o) => o.parent && o.parent.remove(o));
  });
  return root;
}
