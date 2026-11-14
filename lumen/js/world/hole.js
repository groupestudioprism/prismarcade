/* =========================================================
   LUMEN — « trou de visibilité » (caméra fixe).
   Un décor haut (arbre, mur, maison, falaise, rocher) situé ENTRE la caméra et Lyra la cache. Solution générique et
   peu coûteuse, en espace écran : les fragments du décor qui sont
     1) plus proches de la caméra que le joueur (profondeur < celle du joueur − marge),
     2) plus hauts que ses pieds (hauteur monde > pieds + FOOT : le sol devant lui n'est jamais percé),
     3) dans un rayon écran autour de lui,
   sont tramés (dither Bayer-like, ≈ 90 % de transparence au centre, bord adouci). Un second trou suit le PNJ
   en dialogue (ou toute autre cible : hole.setTarget).
   Mise en œuvre : hole.install(root) patche les matériaux Mesh du décor (onBeforeCompile, chaîné après les patchs
   existants : vent, eau…) et leur ajoute #define HOLE ; fonctionne donc pour les maillages instanciés et fusionnés.
   Les personnages, ennemis, effets, sprites et le ciel ne sont pas patchés (ils ne sont jamais troués).
   Matériaux ShaderMaterial / RawShaderMaterial / Points / Sprites : ignorés.
   Réglages (hole.cfg) : radius (rayon écran ≈ taille du joueur, en hauteurs d'écran/2), margin (profondeur, unités),
     foot (hauteur au-dessus des pieds), alpha (0..1, opacité du trou), enabled.
   Désactivé de fait en intérieur (hole.enabled=false pendant les scènes) ou avec ?nohole.
   ========================================================= */
import * as THREE from 'three';

const U = {
  uHA: { value: new THREE.Vector4(0, 0, 0, 0) },   // x, y (NDC), rayon (en NDC-y), profondeur max
  uHB: { value: new THREE.Vector4(0, 0, 0, 0) },
  uHF: { value: new THREE.Vector4(0, 0, 1, 0.9) }, // yPieds A, yPieds B, aspect, alpha
  uHC: { value: new THREE.Vector4(0, 0, 0, 0) },   // camY, e[1], e[5], e[9] (axe Y monde en repère caméra)
};

const VERT_DECL = 'varying vec4 vHoleC;\nvarying vec3 vHoleV;';
const FRAG_DECL = 'uniform vec4 uHA;\nuniform vec4 uHB;\nuniform vec4 uHF;\nuniform vec4 uHC;\nvarying vec4 vHoleC;\nvarying vec3 vHoleV;';
const FRAG_CODE = `
#ifdef HOLE
{
  vec2 hn = vHoleC.xy / vHoleC.w;
  float hy = uHC.x + vHoleV.x * uHC.y + vHoleV.y * uHC.z + vHoleV.z * uHC.w;
  float ha = 0.0;
  vec2 da = (hn - uHA.xy) * vec2(uHF.z, 1.0);
  ha = max(ha, (1.0 - smoothstep(uHA.z * 0.55, uHA.z, length(da))) * step(vHoleC.w, uHA.w) * step(uHF.x, hy));
  vec2 db = (hn - uHB.xy) * vec2(uHF.z, 1.0);
  ha = max(ha, (1.0 - smoothstep(uHB.z * 0.55, uHB.z, length(db))) * step(vHoleC.w, uHB.w) * step(uHF.y, hy));
  float hnoise = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  if (ha * uHF.w > hnoise) discard;
}
#endif
`;

function patch(mat) {
  if (!mat || !mat.isMaterial || mat.userData.holePatched) return;
  if (mat.isShaderMaterial || mat.isPointsMaterial || mat.isSpriteMaterial || mat.isLineBasicMaterial) return;
  if (!(mat.isMeshStandardMaterial || mat.isMeshBasicMaterial || mat.isMeshLambertMaterial || mat.isMeshPhongMaterial || mat.isMeshToonMaterial)) return;
  mat.userData.holePatched = true;
  mat.defines = Object.assign({}, mat.defines, { HOLE: 1 });
  const prev = mat.onBeforeCompile, prevKey = mat.customProgramCacheKey;
  mat.onBeforeCompile = function (sh, renderer) {
    if (prev) prev.call(this, sh, renderer);
    if (!sh.vertexShader.includes('#include <project_vertex>') || !sh.vertexShader.includes('#include <common>')) return;
    sh.uniforms.uHA = U.uHA; sh.uniforms.uHB = U.uHB; sh.uniforms.uHF = U.uHF; sh.uniforms.uHC = U.uHC;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERT_DECL)
      .replace('#include <project_vertex>', '#include <project_vertex>\nvHoleC = gl_Position;\nvHoleV = mvPosition.xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAG_DECL)
      .replace(/void\s+main\s*\(\s*\)\s*\{/, (m) => m + FRAG_CODE);
  };
  mat.customProgramCacheKey = function () { return (prevKey ? prevKey.call(this) : '') + '|hole'; };
  mat.needsUpdate = true;
}

const v = new THREE.Vector3();
const cfg = { enabled: true, radius: 2.3, margin: 0.55, foot: 0.8, alpha: 0.92 };
let targetB = null;   // {x,y,z} monde (y = pieds) ou null

export const hole = {
  cfg, uniforms: U,
  /* patche tous les matériaux Mesh sous root (à appeler une fois le monde construit) */
  install(root) {
    let n = 0;
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!m.userData.holePatched) { patch(m); n++; } });
    });
    return n;
  },
  patch,
  setTarget(p) { targetB = p; },
  /* à appeler chaque image, caméra à jour : pf = pieds du joueur (monde), eyeH = hauteur du torse au-dessus des pieds */
  update(camera, pf, eyeH = 1.0) {
    camera.updateMatrixWorld();
    const set = (u, p) => {
      v.set(p.x, p.y + eyeH, p.z).applyMatrix4(camera.matrixWorldInverse);
      const depth = -v.z;
      v.set(p.x, p.y + eyeH, p.z).project(camera);
      const rad = cfg.radius / (Math.max(1, depth) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      u.value.set(v.x, v.y, cfg.enabled ? Math.min(0.6, rad) : 0, depth - cfg.margin);
    };
    set(U.uHA, pf);
    if (targetB) set(U.uHB, targetB); else U.uHB.value.set(0, 0, 0, 0);
    const e = camera.matrixWorld.elements;
    U.uHC.value.set(camera.position.y, e[1], e[5], e[9]);
    U.uHF.value.set(pf.y + cfg.foot, targetB ? targetB.y + cfg.foot : 0, camera.aspect, cfg.alpha);
  },
};
