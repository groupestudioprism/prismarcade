/* LUMEN — Acte V : modèles de créatures des Pics du Vent. Le Grand Meunier est un colosse de pierre givrée portant des pales de moulin dans le dos. */
import * as THREE from 'three';

export const makeGrandMeunier = (colosse) => (tint) => {
  const v = colosse(tint);
  const cool = new THREE.Color('#8f9fd8');
  const seen = new Set();
  v.root.traverse((o) => { const m = o.material; if (m && m.color && !m.isMeshBasicMaterial && !seen.has(m)) { seen.add(m); m.color.lerp(cool, 0.5); if (m.emissive) m.emissive.lerp(new THREE.Color('#3a3a90'), 0.4); } });
  const wood = new THREE.MeshStandardMaterial({ color: '#8a6a4a', flatShading: true, roughness: 0.9 });
  const cloth = new THREE.MeshStandardMaterial({ color: '#efe8ff', emissive: '#7a6ad0', emissiveIntensity: 0.3, flatShading: true, side: THREE.DoubleSide });
  const hub = new THREE.Group(); hub.position.set(0, 3.7, -1.15); v.root.add(hub);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 6), wood); axle.rotation.x = Math.PI / 2; hub.add(axle);
  const sails = new THREE.Group(); hub.add(sails);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; sails.add(arm);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 0.1), wood); beam.position.y = 1.8; arm.add(beam);
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.04), cloth); sl.position.set(0.5, 2.1, 0.06); arm.add(sl);
  }
  sails.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const base = v.animate;
  v.animate = (dt, s) => { base(dt, s); sails.rotation.z -= dt * (s.dead ? 0.2 : s.wind ? 5 : s.tired ? 0.25 : 1.3); };
  return v;
};
