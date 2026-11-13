/* =========================================================
   LUMEN — Acte IV, Les Abysses Miroirs : rendu des objets propres à l’île.
   bassin (eau miroir, avec sa flèche), vanne, socle d’orbe (et orbe de Fia), corniche de plané.
   Aucun état de jeu ici : chaque vue lit l’île logique (isl) à chaque image.
   Appelé par world/build.js (voir la mention « ACTE IV »).
   ========================================================= */
import * as THREE from 'three';
import { DIRS } from '../logic.js';
import { poolUp, poolDir } from '../mech/eau.js';

export const ABYSSES_ENTS = new Set(['pool', 'valve', 'socle', 'ledge']);
const ang = (d) => Math.atan2(-DIRS[d][1], DIRS[d][0]);

/* K : { M, glow, haloSprite, pedestal, BEAM_Y, T } fournis par build.js (évite une importation circulaire) */
export function abyssView(e, g, v, K) {
  const { M, glow, haloSprite, pedestal, BEAM_Y, T } = K;
  if (e.t === 'pool') {
    // bassin d’eau miroir : dalle turquoise en surface quand l’eau est haute, lit de sable sombre quand elle est basse
    const bed = new THREE.Mesh(new THREE.BoxGeometry(T * 0.98, 0.1, T * 0.98), new THREE.MeshStandardMaterial({ color: '#2a8a8c', roughness: 1, flatShading: true }));
    bed.position.y = 0.04; g.add(bed);
    const sheet = new THREE.MeshStandardMaterial({ color: '#7fe8e0', emissive: '#2fc8c0', emissiveIntensity: 0.55, transparent: true, opacity: 0.86, roughness: 0.04, metalness: 0.4, flatShading: true });
    const water = new THREE.Mesh(new THREE.BoxGeometry(T * 0.98, 0.9, T * 0.98), sheet); water.position.y = 0.45; water.castShadow = false; g.add(water);
    const arrowMat = glow('#eaffff', 2.4);
    const arrow = new THREE.Group(); arrow.position.y = 0.93;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(T * 0.46, 0.05, 0.16), arrowMat); shaft.position.x = -T * 0.08; arrow.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.46, 3), arrowMat); tip.rotation.z = -Math.PI / 2; tip.rotation.y = 0; tip.position.x = T * 0.26; tip.scale.set(1, 1, 0.12); arrow.add(tip);
    arrow.rotation.y = ang(poolDir(e)); g.add(arrow);
    v.water = water; v.arrow = arrow; v.sheet = sheet; v.level = poolUp(K.isl, e) ? 1 : 0; v.pulse = Math.random() * 6;
    v.tick = (t, dt, isl) => {
      const up = poolUp(isl, e) ? 1 : 0;
      v.level += (up - v.level) * (1 - Math.exp(-3.2 * dt));
      water.position.y = -0.4 + 0.85 * v.level + Math.sin(t * 1.6 + v.pulse) * 0.012;
      water.scale.y = 1; sheet.opacity = 0.22 + 0.64 * v.level; sheet.emissiveIntensity = 0.15 + 0.5 * v.level + Math.sin(t * 2 + v.pulse) * 0.05;
      arrow.visible = v.level > 0.5; arrow.position.y = water.position.y + 0.48;
      water.visible = v.level > 0.02;
    };
  } else if (e.t === 'valve') {
    pedestal(g, true);
    const wheel = new THREE.Group(); wheel.position.y = 1.0; g.add(wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 6, 20), M.gold); wheel.add(rim);
    [0, 1, 2].forEach((i) => { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.07, 0.07), M.gold); sp.rotation.z = (i * Math.PI) / 3; wheel.add(sp); });
    const hub = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), glow('#7fffe8', 2.6)); wheel.add(hub);
    wheel.rotation.x = Math.PI / 2 - 0.5; wheel.rotation.y = 0;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 8), M.metal); pipe.position.y = 0.6; g.add(pipe);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' })); lamp.position.set(0, 1.62, 0); g.add(lamp);
    v.wheel = wheel; v.spin = e.state ? 1 : 0;
    v.tick = (t, dt, isl) => {
      const want = e.state ? Math.PI : 0;
      v.spin += (want - v.spin) * (1 - Math.exp(-6 * dt));
      wheel.rotation.z = v.spin * 1.5;
      lamp.material.color.set(e.state ? '#6ffff0' : '#8a9aa8').multiplyScalar(e.state ? 2.4 : 0.8);
    };
  } else if (e.t === 'socle') {
    pedestal(g, true);
    const col = e.color === 'c' ? '#6fe8ff' : e.color === 'y' ? '#ffe36f' : e.color === 'm' ? '#ff7fe0' : '#ffffff';
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), glow(col, 1.6)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; g.add(ring);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), glow(col, 3.2)); orb.position.y = BEAM_Y; orb.visible = false; g.add(orb);
    const halo = haloSprite(col, 2.6, 0); halo.position.y = BEAM_Y; g.add(halo);
    const head = new THREE.Group(); head.position.y = BEAM_Y; g.add(head);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.36, 6), M.gold); cone.rotation.z = -Math.PI / 2; cone.position.x = 0.62; head.add(cone);
    head.visible = false;
    v.head = head; v.target = () => ang(K.isl.orb.dir || 'E'); v.orb = orb; v.halo2 = halo;
    v.tick = (t, dt, isl) => {
      const here = isl.orb && isl.orb.at === e.id;
      orb.visible = here; head.visible = here; ring.rotation.z += dt * (here ? 2 : 0.3);
      orb.position.y = BEAM_Y + Math.sin(t * 2.4 + e.x) * 0.06; halo.position.y = orb.position.y;
      halo.material.opacity += ((here ? 0.8 : 0.0) - halo.material.opacity) * (1 - Math.exp(-6 * dt));
    };
  } else if (e.t === 'ledge') {
    // corniche : dalle de pierre gravée d’un chevron, qui brille quand on sait planer
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.16, 6), M.stone); slab.position.y = 0.08; g.add(slab);
    const glyph = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 5, 6), glow('#8ffff0', 1.8)); glyph.rotation.x = Math.PI / 2; glyph.position.y = 0.2; g.add(glyph);
    const chev = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 3), glow('#eaffff', 2.2)); chev.rotation.z = -Math.PI / 2; chev.scale.set(1, 1, 0.2); chev.position.set(0.1, 0.24, 0);
    const cg = new THREE.Group(); cg.rotation.y = ang(e.dir || 'E'); cg.add(chev); g.add(cg);
    v.halo2 = haloSprite('#8ffff0', 2.2, 0.35); v.halo2.position.y = 0.3; g.add(v.halo2);
    v.tick = (t) => { glyph.rotation.z = t * 0.6; v.halo2.material.opacity = 0.3 + Math.sin(t * 2.2 + e.x) * 0.1; };
  }
}
