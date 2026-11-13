/* =========================================================
   LUMEN — combats : créatures (apparition, IA, dégâts, butin),
   projectiles, attaques de Lyra (mêlée, lourde, distance, magie,
   Onde de lumière), effets visuels de combat.
   G fournit : scene, isl, zones, st, P (joueur), stats(), canStand(x, z, r), terrainAt(x, z),
               hurtPlayer(dmg, fromX, fromZ, opts), emit(ev, d), sparks, audio, ui, onCut(x, y), onBreak(x, y)
   ========================================================= */
import * as THREE from 'three';
import { ENEMIES } from '../data/enemies.js';
import { CREATURES } from '../world/creatures.js';
import '../world/creatures-desert.js';   /* ACTE III : scarabée et scorpion s'ajoutent à CREATURES */
import { T, W, rand, randi, angleTo, damp, lerp } from '../engine/util.js';
import { updateBossZenith } from './boss-zenith.js';   /* ACTE VI */

export function createCombat(G) {
  const enemies = [];
  const projectiles = [];
  const fx = [];          // effets temporaires (traînées, ondes, cercles d'alerte)
  const pickups = [];     // pièces et matériaux tombés
  const deadAt = {};      // clé d'apparition → instant de la mort (réapparition)
  const group = new THREE.Group(); G.scene.add(group);
  let clock = 0;

  /* ---------- Matériaux d'effets ---------- */
  const add = (o) => { group.add(o); return o; };
  const fxMat = (hex, op = 0.8) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  function slashFx(x, z, face, reach, arc, color = '#fff1c9', y = 1.0) {
    const m = new THREE.Mesh(new THREE.RingGeometry(reach * 0.55, reach, 24, 1, -arc / 2, arc), fxMat(color, 0.7));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.rotation.z = face - Math.PI / 2;
    add(m); fx.push({ m, t: 0, dur: 0.22, kind: 'slash' });
  }
  function ringFx(x, z, r, color, dur = 0.5, y = 0.2) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 40), fxMat(color, 0.9)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
    add(m); fx.push({ m, t: 0, dur, kind: 'ring', r });
  }
  function warnFx(x, z, r, dur, color = '#ff5a7a') {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z);
    const edge = new THREE.Mesh(new THREE.RingGeometry(r * 0.94, r, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false })); edge.rotation.x = -Math.PI / 2; edge.position.set(x, 0.07, z);
    add(m); add(edge); fx.push({ m, edge, t: 0, dur, kind: 'warn' });
  }

  /* ---------- Variantes de couleur (Forêt de Verre) ---------- */
  const sparkCol = (def, big) => def.spark || (def.family === 'brume' ? (big ? '#d8b4fe' : '#c9b6ff') : '#b5e08a');
  function tintView(root, hex, k = 0.6, ke = 0.5) {
    const tc = new THREE.Color(hex);
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      o.material = o.material.clone();
      if (o.material.color) o.material.color.lerp(tc, o.material.type === 'MeshBasicMaterial' ? Math.min(0.8, k * 0.6) : k);
      if (o.material.emissive) o.material.emissive.lerp(tc, ke);
    });
  }

  /* ---------- Apparition ---------- */
  function spawnZone(zi) {
    const z = G.zones[zi];
    (z.spawns || []).forEach((sp, si) => {
      for (let k = 0; k < (sp.n || 1); k++) {
        const key = `${z.id}:${si}:${k}`;
        if (enemies.some((e) => e.key === key)) continue;
        if (sp.room && G.isGateOpen(sp.room)) continue;                 // salle déjà libérée : elle le reste
        if (G.st.world.killed[key]) continue;                         // élite ou boss vaincu pour de bon
        if (deadAt[key] && clock - deadAt[key] < 90) continue;          // réapparition après un moment
        const def = ENEMIES[sp.type];
        if (sp.boss && G.st.flags[def.bossFlag || 'boss_colosse']) continue;
        const a = (k / Math.max(1, sp.n)) * Math.PI * 2;
        let cx = sp.x + (sp.n > 1 ? Math.cos(a) * 1.2 : 0), cy = sp.y + (sp.n > 1 ? Math.sin(a) * 1.2 : 0);
        const x = W(z.ox + cx), zz = W(z.oy + cy);
        const view = CREATURES[def.model || sp.type](def.matte ? undefined : def.tint);   /* ACTE III : matte = teinte sans variante de verre */
        if (def.tint && (def.model !== 'colosse' || def.matte)) tintView(view.root, def.tint, def.tintK, def.tintE);
        view.root.position.set(x, 0, zz);
        add(view.root);
        const hp = Math.round(def.hp * (sp.elite ? 1.2 : 1));
        enemies.push({ key, type: sp.type, def, zi, z, view, x: G.canStand(x, zz, 0.3) ? x : W(z.ox + sp.x), z: G.canStand(x, zz, 0.3) ? zz : W(z.oy + sp.y), hx: W(z.ox + sp.x), hz: W(z.oy + sp.y), vx: 0, vz: 0, face: Math.random() * 6, hp, maxHp: hp, state: 'idle', t: rand(0, 2), cd: rand(0.5, 2), hurt: 0, stun: 0, room: sp.room || null, elite: !!sp.elite, boss: !!sp.boss, kb: { x: 0, z: 0 }, phase: 1, seen: false, wanderT: rand(1, 3), shown: 0 });
      }
    });
  }
  function clearZone(zi, keepBoss) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.zi !== zi || (keepBoss && e.boss)) continue;
      group.remove(e.view.root); G.ui.enemyBar(e, null); enemies.splice(i, 1);
    }
  }
  function resetAll() { for (let i = enemies.length - 1; i >= 0; i--) { group.remove(enemies[i].view.root); G.ui.enemyBar(enemies[i], null); } enemies.length = 0; Object.keys(deadAt).forEach((k) => delete deadAt[k]); }

  /* ---------- Dégâts ---------- */
  function dealDamage(e, base, dtype, opts = {}) {
    if (e.state === 'dead') return 0;
    if (e.boss && e.state === 'intro') return 0; /* QA-VISUEL : invulnérable pendant l'annonce du boss */
    const P = G.P;
    if (e.shielded) { G.audio.sfx('block'); G.ui.damage(e.x, 4.4, e.z, 'Éclipse', 'block'); return 0; }   /* ACTE VI : bouclier du boss final */
    // bouclier : de face, sauf arme lourde ou onde
    if (e.def.shield && !opts.heavy && !opts.onde && e.state !== 'stun' && e.state !== 'attack') {
      const toP = Math.atan2(P.x - e.x, P.z - e.z);
      if (Math.abs(angleTo(e.face, toP)) < 1.2) { G.audio.sfx('block'); G.ui.damage(e.x, 1.8, e.z, 'Paré', 'block'); G.sparks.burst(new THREE.Vector3(e.x, 1.3, e.z), '#c9b6ff', 10, 3, 1); e.kb.x += Math.sin(toP) * -2; e.kb.z += Math.cos(toP) * -2; return 0; }
    }
    let m = (e.def.weak[dtype] || 1) * (e.def.resist[dtype] || 1);
    if (opts.bonus && e.def.family && opts.bonus[e.def.family]) m *= opts.bonus[e.def.family];
    if (e.state === 'stun' || e.tired) m *= e.boss ? 2 : 1.5;
    const crit = Math.random() < 0.1;
    let dmg = Math.max(1, Math.round(base * m * rand(0.9, 1.1) * (crit ? 1.5 : 1) - e.def.def));
    e.hp -= dmg; e.hurt = 1;
    G.st.stats.dmgDealt += dmg;
    if (!e.boss && opts.knock !== 0) { const a = Math.atan2(e.x - P.x, e.z - P.z), k = (opts.knock || 1.4) * (e.type === 'ronceux' ? 0 : 1); e.kb.x += Math.sin(a) * k * 4; e.kb.z += Math.cos(a) * k * 4; }
    G.ui.damage(e.x, (e.boss ? 4.4 : 1.8), e.z, dmg, crit ? 'crit' : m > 1.05 ? 'weak' : m < 0.95 ? 'resist' : '');
    G.sparks.burst(new THREE.Vector3(e.x, e.boss ? 2.5 : 0.9, e.z), sparkCol(e.def, false), 14, 4, 1.5);
    G.audio.sfx(e.def.family === 'brume' ? 'hitBrume' : 'hit');
    if (!e.seen) { e.seen = true; }
    if (e.state === 'idle') e.state = 'chase';
    if (e.hp <= 0) kill(e);
    G.hitstop(crit ? 0.07 : 0.035);
    return dmg;
  }
  function kill(e) {
    e.state = 'dead'; e.t = 0;
    G.audio.sfx('kill');
    G.sparks.burst(new THREE.Vector3(e.x, 1, e.z), sparkCol(e.def, true), e.boss ? 120 : 40, e.boss ? 8 : 4, 2.5);
    deadAt[e.key] = clock;
    if (e.elite || e.boss) G.st.world.killed[e.key] = 1;
    if (e.boss) enemies.forEach((o) => { if (o.adds && o.state !== 'dead') { o.state = 'dead'; o.t = 0; G.ui.enemyBar(o, null); } });   /* ACTE VI : les ombres invoquées s’éteignent avec leur maître */
    G.st.stats.kills++; G.st.stats.killsBy[e.type] = (G.st.stats.killsBy[e.type] || 0) + 1;
    // butin
    const [a, b] = e.def.ecus; const ec = randi(a, b);
    for (let i = 0; i < Math.min(8, Math.ceil(ec / 3)); i++) dropPickup(e.x, e.z, 'ecus', Math.ceil(ec / Math.min(8, Math.ceil(ec / 3))));
    e.def.drops.forEach(([id, p]) => { if (Math.random() < p) dropPickup(e.x, e.z, id, 1); });
    G.gainXp(e.def.xp);
    G.ui.enemyBar(e, null);
    G.emit('kill', { type: e.type, boss: e.boss, key: e.key, room: e.room });
  }

  /* ---------- Butin au sol ---------- */
  const coinGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), coinMat = new THREE.MeshStandardMaterial({ color: '#f0c66b', metalness: 0.8, roughness: 0.25, emissive: '#c99a3a', emissiveIntensity: 0.4 });
  const matColors = { eclat_verre: '#9fe9ff', givre_foret: '#bff3ff', larme_verre: '#9fffe0', brume: '#b39cff', fibre: '#7aa84f', pierre: '#a29fb3', bois: '#c9965a', larme_colosse: '#c9a0ff', ecaille_scarabee: '#e0b050', dard_scorpion: '#ff9a50', bandelette: '#efe0b8', larme_sable: '#ffd98a', sable_dore: '#f0d080', fleur_dune: '#ffc0d0' /* ACTE III */ };
  function dropPickup(x, z, id, n) {
    const m = id === 'ecus' ? new THREE.Mesh(coinGeo, coinMat) : new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshStandardMaterial({ color: matColors[id] || '#ffffff', emissive: matColors[id] || '#ffffff', emissiveIntensity: 0.6, flatShading: true }));
    if (id === 'ecus') m.rotation.x = Math.PI / 2;
    const a = Math.random() * Math.PI * 2, s = rand(1.5, 3.5);
    const p = { id, n, x, z, y: 0.8, vx: Math.cos(a) * s, vz: Math.sin(a) * s, vy: rand(4, 6), m, t: 0 };
    m.position.set(x, 0.8, z); add(m); pickups.push(p);
  }

  /* ---------- Projectiles ---------- */
  function shoot(x, z, angle, o) {
    const geo = new THREE.SphereGeometry(o.size || 0.18, 8, 6);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color || '#ffe2a0').multiplyScalar(2.6) }));
    m.position.set(x, o.y || 1.0, z); add(m);
    projectiles.push({ x, z, vx: Math.sin(angle) * o.speed, vz: Math.cos(angle) * o.speed, r: o.r || 0.4, dmg: o.dmg, dtype: o.dtype || 'percant', owner: o.owner, ttl: (o.range || 12) / o.speed, pierce: !!o.pierce, hit: new Set(), m, bonus: o.bonus, y: o.y || 1.0, trail: o.color });
  }

  /* ---------- Attaques de Lyra ---------- */
  function cellsInArc(px, pz, face, reach, arc) {
    const out = [];
    const cx = Math.round(px / T), cz = Math.round(pz / T), R = Math.ceil(reach / T) + 1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cx + dx, y = cz + dy, wx = W(x), wz = W(y);
      const d = Math.hypot(wx - px, wz - pz);
      if (d > reach + 0.9) continue;
      if (d > 0.6 && Math.abs(angleTo(face, Math.atan2(wx - px, wz - pz))) > arc / 2 + 0.35) continue;
      out.push([x, y]);
    }
    return out;
  }
  function melee(o) {
    const P = G.P, s = G.stats(), w = s.weapon;
    const reach = (w ? w.reach : 1.8) * (o.spin ? 1.15 : 1), arc = o.spin ? Math.PI * 2 : (w ? w.arc : 1.6);
    const heavy = w && w.wclass === 'lourde';
    slashFx(P.x, P.z, P.face, reach + 0.3, arc, o.spin ? '#9fe9ff' : heavy ? '#ffd7a0' : '#fff1c9', heavy ? 0.6 : 1.0);
    let hits = 0;
    enemies.forEach((e) => {
      if (e.state === 'dead') return;
      const d = Math.hypot(e.x - P.x, e.z - P.z);
      if (d > reach + e.def.radius + 0.2) return;
      if (!o.spin && d > 0.6 && Math.abs(angleTo(P.face, Math.atan2(e.x - P.x, e.z - P.z))) > arc / 2 + 0.25) return;
      dealDamage(e, s.atk * (o.mult || 1), w ? w.dmg : 'contondant', { heavy: heavy || o.spin, knock: w && w.knock ? w.knock : o.spin ? 2 : 1.2, bonus: w && w.bonus });
      hits++;
    });
    // ronces et roches fissurées
    cellsInArc(P.x, P.z, P.face, reach, arc).forEach(([x, y]) => {
      const t = G.isl.terrain[y] && G.isl.terrain[y][x];
      if (t === 'r') { if (w && w.cuts) G.onCut(x, y); else if (!o.quiet) { G.hintOnce('ronces', 'Ces ronces sont trop épaisses pour un bâton. Il faudrait une vraie lame.'); } }
      if (t === 'c') { if (w && w.breaks) G.onBreak(x, y); else if (!o.quiet) G.hintOnce('fissure', 'La roche est fissurée… un coup très lourd pourrait la briser.'); }
    });
    G.audio.sfx('swing', { weapon: w ? w.wclass : 'lame' });
    if (heavy) { ringFx(P.x + Math.sin(P.face) * 1.6, P.z + Math.cos(P.face) * 1.6, 2.4, '#ffd7a0', 0.4); G.shake(0.25); }
    return hits;
  }
  function ranged() {
    const P = G.P, s = G.stats(), w = s.weapon;
    const target = autoAim(12, 0.6);
    const ang = target != null ? target : P.face;
    shoot(P.x + Math.sin(ang) * 0.6, P.z + Math.cos(ang) * 0.6, ang, { speed: w.proj.speed, range: w.proj.range, size: w.proj.size, color: w.proj.color, pierce: w.proj.pierce, dmg: s.atk, dtype: w.dmg, owner: 'player', bonus: w.bonus });
    G.audio.sfx(w.wclass === 'magie' ? 'magic' : 'shoot');
    return ang;
  }
  /* visée douce : ennemi le plus proche devant soi */
  function autoAim(range, cone) {
    const P = G.P; let best = null, bd = 1e9;
    enemies.forEach((e) => {
      if (e.state === 'dead') return;
      const d = Math.hypot(e.x - P.x, e.z - P.z); if (d > range) return;
      const a = Math.atan2(e.x - P.x, e.z - P.z), off = Math.abs(angleTo(P.face, a));
      if (off > cone) return;
      const score = d + off * 4; if (score < bd) { bd = score; best = a; }
    });
    return best;
  }
  function onde() {
    const P = G.P, s = G.stats();
    ringFx(P.x, P.z, 4.6, '#9fe9ff', 0.55, 0.6); ringFx(P.x, P.z, 3.2, '#fff1c9', 0.4, 0.9);
    G.sparks.burst(new THREE.Vector3(P.x, 1, P.z), '#9fe9ff', 60, 7, 1, 2, 0.8);
    G.audio.sfx('onde'); G.shake(0.2);
    enemies.forEach((e) => {
      if (e.state === 'dead') return;
      const d = Math.hypot(e.x - P.x, e.z - P.z);
      if (d < 4.6 + e.def.radius) dealDamage(e, s.atk * 1.8 + 6, 'lumiere', { onde: true, knock: 2.6 });
    });
  }

  /* ---------- IA des créatures ---------- */
  const tmp = new THREE.Vector3();
  function moveEnemy(e, tx, tz, speed, dt) {
    const dx = tx - e.x, dz = tz - e.z, l = Math.hypot(dx, dz);
    const vx = l > 0.05 ? (dx / l) * speed : 0, vz = l > 0.05 ? (dz / l) * speed : 0;
    e.vx = lerp(e.vx, vx, damp(8, dt)); e.vz = lerp(e.vz, vz, damp(8, dt));
  }
  function separate(e) {
    enemies.forEach((o) => { if (o === e || o.state === 'dead') return; const dx = e.x - o.x, dz = e.z - o.z, d = Math.hypot(dx, dz), m = e.def.radius + o.def.radius; if (d < m && d > 0.001) { e.x += (dx / d) * (m - d) * 0.5; e.z += (dz / d) * (m - d) * 0.5; } });
  }
  function touchPlayer(e, radius, dmg, opts) {
    const P = G.P;
    if (Math.hypot(P.x - e.x, P.z - e.z) < radius + 0.35) G.hurtPlayer(dmg, e.x, e.z, Object.assign({ brume: e.def.family === 'brume', sable: e.def.family === 'sable' /* ACTE III */ }, opts));
  }
  function updateEnemy(e, dt) {
    const P = G.P, d = e.def;
    const dist = Math.hypot(P.x - e.x, P.z - e.z), toP = Math.atan2(P.x - e.x, P.z - e.z);
    const homeD = Math.hypot(e.hx - e.x, e.hz - e.z);
    const canSee = dist < d.aggro && G.P.alive && G.zoneIndexAt(P.x, P.z) === e.zi;
    e.t += dt; e.cd -= dt;
    e.hurt = Math.max(0, e.hurt - dt * 3);
    let anim = { move: 0 };
    const faceTo = (a, k = 10) => { e.face += angleTo(e.face, a) * damp(k, dt); };
    if (e.state === 'dead') {
      const k = e.t / 0.6;
      anim = { move: 0, dead: Math.min(1, k) }; e.view.animate(dt, anim);
      if (k >= 1) { group.remove(e.view.root); return false; }
      return true;
    }
    switch (d.behavior) {
      case 'chaser': case 'guard': {
        if (e.state === 'idle') {
          e.wanderT -= dt;
          if (e.wanderT < 0) { e.wanderT = rand(2, 4); e.wx = e.hx + rand(-2.5, 2.5); e.wz = e.hz + rand(-2.5, 2.5); }
          if (e.wx !== undefined) { moveEnemy(e, e.wx, e.wz, d.speed * 0.35, dt); anim.move = 0.4; faceTo(Math.atan2(e.vx, e.vz), 4); }
          if (canSee) { e.state = 'chase'; if (!e.seen) { e.seen = true; G.ui.damage(e.x, 2, e.z, '!', 'alert'); } }
        } else if (e.state === 'chase') {
          if (!canSee || homeD > d.leash) { e.state = 'return'; break; }
          moveEnemy(e, P.x, P.z, d.speed, dt); anim.move = 1; faceTo(toP);
          if (dist < (d.behavior === 'guard' ? 2.3 : 1.7) && e.cd <= 0) { e.state = 'wind'; e.t = 0; }
        } else if (e.state === 'wind') {
          moveEnemy(e, e.x, e.z, 0, dt); faceTo(toP, 6); anim.wind = Math.min(1, e.t / 0.4);
          if (e.t > (d.behavior === 'guard' ? 0.5 : 0.38)) { e.state = 'attack'; e.t = 0; e.vx = Math.sin(e.face) * (d.behavior === 'guard' ? 4 : 7); e.vz = Math.cos(e.face) * (d.behavior === 'guard' ? 4 : 7); e.didHit = false; }
        } else if (e.state === 'attack') {
          anim.attack = Math.min(1, e.t / 0.3);
          if (!e.didHit && e.t > 0.1) { const r = d.behavior === 'guard' ? 2.1 : 0.9; const ang = Math.abs(angleTo(e.face, toP)); if (dist < r + 0.4 && (d.behavior !== 'guard' || ang < 1.3)) { touchPlayer(e, r + 0.5, d.atk); e.didHit = true; } }
          e.vx *= 0.9; e.vz *= 0.9;
          if (e.t > 0.32) { e.state = 'recover'; e.t = 0; e.cd = rand(0.7, 1.3); }
        } else if (e.state === 'recover') {
          moveEnemy(e, e.x, e.z, 0, dt);
          if (e.t > 0.55) e.state = canSee ? 'chase' : 'return';
        } else if (e.state === 'return') {
          moveEnemy(e, e.hx, e.hz, d.speed * 0.8, dt); anim.move = 0.7; faceTo(Math.atan2(e.vx, e.vz), 6);
          if (homeD < 0.8) { e.state = 'idle'; e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.5); }
          if (canSee && homeD < d.leash * 0.7) e.state = 'chase';
        }
        break;
      }
      case 'territorial': {
        faceTo(toP, 3);
        if (e.state === 'idle' || e.state === 'chase') { if (canSee && dist < d.aggro && e.cd <= 0) { e.state = 'wind'; e.t = 0; } }
        else if (e.state === 'wind') { anim.wind = Math.min(1, e.t / 0.5); if (e.t > 0.5) { e.state = 'attack'; e.t = 0; e.didHit = false; warnFx(e.x, e.z, 3.2, 0.15, '#c9b48a'); } }
        else if (e.state === 'attack') { anim.attack = Math.min(1, e.t / 0.3); if (!e.didHit && e.t > 0.1) { touchPlayer(e, 3.0, d.atk); e.didHit = true; } if (e.t > 0.35) { e.state = 'idle'; e.cd = rand(1.0, 1.6); } }
        e.vx = e.vz = 0;
        break;
      }
      case 'ranged': {
        if (e.state === 'idle') { if (canSee) e.state = 'chase'; }
        else if (e.state === 'chase') {
          if (!canSee || homeD > d.leash) { e.state = 'return'; break; }
          faceTo(toP);
          if (dist < d.keep - 1) { moveEnemy(e, e.x - Math.sin(toP) * 3, e.z - Math.cos(toP) * 3, d.speed, dt); anim.move = 1; }
          else if (dist > d.keep + 2) { moveEnemy(e, P.x, P.z, d.speed, dt); anim.move = 1; }
          else moveEnemy(e, e.x, e.z, 0, dt);
          if (e.cd <= 0 && dist < d.aggro) { e.state = 'wind'; e.t = 0; }
        } else if (e.state === 'wind') {
          moveEnemy(e, e.x, e.z, 0, dt); faceTo(toP, 8); anim.wind = Math.min(1, e.t / 0.5);
          if (e.t > 0.5) { shoot(e.x + Math.sin(e.face) * 0.5, e.z + Math.cos(e.face) * 0.5, e.face, { speed: d.proj, range: 14, size: 0.14, color: '#c9e08a', dmg: d.atk, owner: 'enemy', y: 0.8 }); G.audio.sfx('shoot'); e.state = 'chase'; e.cd = d.fire; e.shotT = 0.25; }
        } else if (e.state === 'return') {
          moveEnemy(e, e.hx, e.hz, d.speed, dt); anim.move = 1;
          if (homeD < 0.8) e.state = 'idle';
        }
        if (e.shotT > 0) { e.shotT -= dt; anim.attack = 1 - e.shotT / 0.25; }
        break;
      }
      case 'charger': {
        if (e.state === 'idle') { if (canSee) e.state = 'chase'; }
        else if (e.state === 'chase') {
          if (!canSee || homeD > d.leash) { e.state = 'return'; break; }
          faceTo(toP, 5); moveEnemy(e, P.x, P.z, d.speed * (dist > 5 ? 1 : 0.4), dt); anim.move = 1;
          if (e.cd <= 0 && dist < 9 && dist > 2.5) { e.state = 'wind'; e.t = 0; }
          else if (dist < 1.8 && e.cd <= 0) { touchPlayer(e, 1.2, Math.round(d.atk * 0.6)); e.cd = 1.2; }
        } else if (e.state === 'wind') {
          moveEnemy(e, e.x, e.z, 0, dt); faceTo(toP, 7); anim.wind = 1;
          if (e.t > 0.85) { e.state = 'charge'; e.t = 0; e.didHit = false; G.audio.sfx('dodge'); }
        } else if (e.state === 'charge') {
          anim.charging = true;
          e.vx = Math.sin(e.face) * d.charge; e.vz = Math.cos(e.face) * d.charge;
          if (!e.didHit && dist < 1.4) { touchPlayer(e, 1.4, d.atk, { knock: 2 }); e.didHit = true; }
          const nx = e.x + e.vx * dt * 1.6, nz = e.z + e.vz * dt * 1.6;
          if (!G.canStand(nx, nz, d.radius)) { e.state = 'stun'; e.t = 0; e.vx = e.vz = 0; G.shake(0.2); G.audio.sfx('break'); G.sparks.burst(new THREE.Vector3(nx, 1, nz), '#d9d4e3', 20, 3, 2); G.ui.damage(e.x, 2.2, e.z, 'Étourdi !', 'alert'); }
          else if (e.t > 1.3) { e.state = 'recover'; e.t = 0; }
        } else if (e.state === 'stun') { anim.stun = true; e.vx *= 0.8; e.vz *= 0.8; if (e.t > 1.8) { e.state = 'chase'; e.cd = 1.2; } }
        else if (e.state === 'recover') { e.vx *= 0.85; e.vz *= 0.85; if (e.t > 0.7) { e.state = 'chase'; e.cd = rand(1.4, 2.4); } }
        else if (e.state === 'return') { moveEnemy(e, e.hx, e.hz, d.speed, dt); anim.move = 1; faceTo(Math.atan2(e.vx, e.vz), 6); if (homeD < 1) e.state = 'idle'; }
        break;
      }
      case 'boss': updateBoss(e, dt, dist, toP, anim, faceTo); break;
      case 'boss_zenith': updateBossZenith(kit, G, e, dt, dist, toP, anim, faceTo); break;   /* ACTE VI */
    }
    // déplacement avec collisions
    const kx = e.kb.x * dt, kz = e.kb.z * dt; e.kb.x *= Math.exp(-8 * dt); e.kb.z *= Math.exp(-8 * dt);
    const nx = e.x + e.vx * dt + kx, nz = e.z + e.vz * dt + kz;
    if (d.speed > 0 || e.kb.x || e.kb.z) {
      if (G.canStand(nx, e.z, d.radius * 0.7) && G.zoneIndexAt(nx, e.z) === e.zi) e.x = nx; else e.vx = 0;
      if (G.canStand(e.x, nz, d.radius * 0.7) && G.zoneIndexAt(e.x, nz) === e.zi) e.z = nz; else e.vz = 0;
    }
    separate(e);
    e.view.root.position.set(e.x, 0, e.z);
    e.view.root.rotation.y = e.face;
    anim.hurt = e.hurt;
    e.view.animate(dt, anim);
    // couleur de coup
    if (e.view.mat) e.view.mat.emissiveIntensity = 0.45 + e.hurt * 1.5;
    if (e.hp < e.maxHp && !e.boss) G.ui.enemyBar(e, e.hp / e.maxHp);
    return true;
  }

  /* ---------- Le Colosse de Brume ---------- */
  function updateBoss(e, dt, dist, toP, anim, faceTo) {
    const P = G.P, d = e.def;
    if (e.hp < e.maxHp * 0.5 && e.phase === 1) { e.phase = 2; G.audio.sfx('roar'); if (G.audio.bossPhase) G.audio.bossPhase(2); G.shake(0.5); G.ui.toast('⚠', (e.def.rageName || d.name) + ' s’enrage !', 'Ses attaques s’accélèrent.');   /* ACTE III : nom du boss */ spawnAdds(2); }
    const fast = e.phase === 2 ? 0.75 : 1;
    switch (e.state) {
      case 'idle':
        if (dist < 10 && G.zoneIndexAt(P.x, P.z) === e.zi) { e.state = 'intro'; e.t = 0; G.audio.sfx('roar'); G.shake(0.6); G.bossStart(e); }
        break;
      case 'intro': anim.wind = Math.min(1, e.t); if (e.t > 1.6) { e.state = 'walk'; e.t = 0; e.cd = 1; } break;
      case 'walk':
        faceTo(toP, 2.5); moveEnemy(e, P.x, P.z, d.speed * (e.phase === 2 ? 1.3 : 1), dt); anim.move = 1;
        if (e.cd <= 0) {
          const r = Math.random();
          e.atk = dist < 4.5 ? (r < 0.55 ? 'sweep' : 'slam') : (r < 0.5 ? 'slam' : r < 0.8 ? 'rocks' : 'summon');
          if (e.atk === 'summon' && enemies.filter((x) => x.adds && x.state !== 'dead').length >= 3) e.atk = 'rocks';
          e.state = 'wind'; e.t = 0; e.vx = e.vz = 0;
          if (e.atk === 'slam') { e.tx = P.x; e.tz = P.z; warnFx(e.tx, e.tz, 3.3, 1.1 * fast); }
          if (e.atk === 'sweep') warnFx(e.x + Math.sin(e.face) * 2, e.z + Math.cos(e.face) * 2, 4.2, 0.75 * fast, '#ffb35a');
        }
        break;
      case 'wind': {
        const wt = (e.atk === 'slam' ? 1.1 : e.atk === 'sweep' ? 0.75 : 0.8) * fast;
        anim.wind = Math.min(1, e.t / wt);
        if (e.atk !== 'slam') faceTo(toP, 3);
        if (e.t > wt) {
          e.state = 'attack'; e.t = 0;
          if (e.atk === 'slam') {
            G.audio.sfx('slam'); G.shake(0.7); ringFx(e.tx, e.tz, 3.6, '#c9a0ff', 0.6);
            G.sparks.burst(new THREE.Vector3(e.tx, 0.4, e.tz), '#d9d4e3', 50, 6, 3);
            if (Math.hypot(P.x - e.tx, P.z - e.tz) < 3.4) G.hurtPlayer(d.atk + 4, e.tx, e.tz, { knock: 3, brume: true });
            if (e.phase === 2) for (let i = 0; i < 6; i++) shoot(e.tx, e.tz, (i / 6) * Math.PI * 2, { speed: 8, range: 9, size: 0.3, color: '#b39cff', dmg: 12, owner: 'enemy', y: 0.6 });
          } else if (e.atk === 'sweep') {
            G.audio.sfx('swingHeavy');
            const cx = e.x + Math.sin(e.face) * 2, cz = e.z + Math.cos(e.face) * 2;
            if (Math.hypot(P.x - cx, P.z - cz) < 4.3) G.hurtPlayer(d.atk, cx, cz, { knock: 3.5, brume: true });
            slashFx(e.x, e.z, e.face, 5, Math.PI * 1.1, '#c9a0ff', 1.4);
          } else if (e.atk === 'rocks') {
            const n = e.phase === 2 ? 5 : 3;
            for (let i = 0; i < n; i++) shoot(e.x + Math.sin(toP) * 1.5, e.z + Math.cos(toP) * 1.5, toP + (i - (n - 1) / 2) * 0.28, { speed: 10, range: 16, size: 0.38, color: d.bossColor || '#9f7aff', dmg: 14, owner: 'enemy', y: 2.2 });
            G.audio.sfx('magic');
          } else if (e.atk === 'summon') { spawnAdds(e.phase === 2 ? 3 : 2); G.audio.sfx('roar'); }
        }
        break;
      }
      case 'attack':
        anim.attack = Math.min(1, e.t / 0.4);
        if (e.t > 0.5) { if (e.atk === 'slam') { e.state = 'tired'; e.t = 0; e.tired = true; G.ui.damage(e.x, 4.6, e.z, d.tiredText || 'Son cœur brille !', 'alert'); } else { e.state = 'walk'; e.cd = rand(1.2, 2.2) * fast; } }
        break;
      case 'tired':
        anim.tired = true; e.tired = true;
        if (e.t > 2.4 * fast) { e.tired = false; e.state = 'walk'; e.cd = rand(1, 1.8) * fast; }
        break;
    }
    if (dist < d.radius + 0.6) G.hurtPlayer(8, e.x, e.z, { knock: 2.5, brume: true });
    G.ui.bossBar(e);
  }
  function spawnAdds(n, typeOverride, tag) {   /* ACTE VI : type et étiquette facultatifs */
    const b = enemies.find((x) => x.boss); if (!b) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, x = b.x + Math.cos(a) * 3, z = b.z + Math.sin(a) * 3;
      if (!G.canStand(x, z, 0.4)) continue;
      const at = typeOverride || b.def.adds || 'brumelin', def = ENEMIES[at], view = CREATURES[def.model || at](def.matte ? undefined : def.tint); if (def.tint) tintView(view.root, def.tint); view.root.position.set(x, 0, z); add(view.root);
      enemies.push({ key: 'add' + Math.random(), type: at, def, zi: b.zi, z: b.z, view, x, z, hx: x, hz: z, vx: 0, vz: 0, face: 0, hp: def.hp, maxHp: def.hp, state: 'chase', t: 0, cd: 1, hurt: 0, kb: { x: 0, z: 0 }, adds: true, tag: tag || null, seen: true, wanderT: 1 });
      G.sparks.burst(new THREE.Vector3(x, 0.6, z), '#b39cff', 20, 3, 2);
    }
  }

  /* ---------- Boucle ---------- */
  function update(dt) {
    clock += dt;
    for (let i = enemies.length - 1; i >= 0; i--) if (!updateEnemy(enemies[i], dt)) enemies.splice(i, 1);
    // projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.ttl -= dt; p.x += p.vx * dt; p.z += p.vz * dt; p.m.position.set(p.x, p.y, p.z);
      let dead = p.ttl <= 0 || G.solidAt(p.x, p.z);
      if (!dead && p.owner === 'player') {
        for (const e of enemies) {
          if (e.state === 'dead' || p.hit.has(e)) continue;
          if (Math.hypot(e.x - p.x, e.z - p.z) < e.def.radius + p.r) { dealDamage(e, p.dmg, p.dtype, { knock: 0.8, bonus: p.bonus }); p.hit.add(e); if (!p.pierce) { dead = true; break; } }
        }
        const cx = Math.round(p.x / T), cy = Math.round(p.z / T);
        if (G.isl.terrain[cy] && G.isl.terrain[cy][cx] === 'r') dead = true;
      } else if (!dead && p.owner === 'enemy') {
        if (Math.hypot(G.P.x - p.x, G.P.z - p.z) < 0.55 + p.r) { G.hurtPlayer(p.dmg, p.x - p.vx * 0.1, p.z - p.vz * 0.1, { knock: 1.2, brume: true }); dead = !G.P.dodging; }
      }
      if (dead) { G.sparks.burst(new THREE.Vector3(p.x, p.y, p.z), p.trail || '#ffffff', 8, 2, 1); group.remove(p.m); projectiles.splice(i, 1); }
    }
    // butin : rebond puis aimant vers Lyra
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i]; p.t += dt;
      if (p.y > 0.25 || p.vy > 0) { p.vy -= 16 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt; if (p.y < 0.25) { p.y = 0.25; p.vy = Math.abs(p.vy) > 2 ? -p.vy * 0.35 : 0; p.vx *= 0.5; p.vz *= 0.5; } }
      const d = Math.hypot(G.P.x - p.x, G.P.z - p.z);
      if (p.t > 0.5 && d < 3.2) { p.x = lerp(p.x, G.P.x, damp(9, dt)); p.z = lerp(p.z, G.P.z, damp(9, dt)); }
      p.m.position.set(p.x, p.y + Math.sin(p.t * 4) * 0.05, p.z); p.m.rotation.y += dt * 4;
      if (p.t > 0.5 && d < 0.8) { G.collectDrop(p.id, p.n); group.remove(p.m); pickups.splice(i, 1); }
      else if (p.t > 40) { group.remove(p.m); pickups.splice(i, 1); }
    }
    // effets
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i]; f.t += dt; const k = f.t / f.dur;
      if (f.kind === 'slash') { f.m.material.opacity = 0.7 * (1 - k); f.m.scale.setScalar(1 + k * 0.15); }
      else if (f.kind === 'ring') { f.m.scale.setScalar(0.3 + k * f.r); f.m.material.opacity = 0.9 * (1 - k); }
      else if (f.kind === 'warn') { f.m.material.opacity = 0.12 + k * 0.28; f.edge.material.opacity = 0.5 + Math.sin(f.t * 20) * 0.3; }
      if (k >= 1) { group.remove(f.m); if (f.edge) group.remove(f.edge); fx.splice(i, 1); }
    }
  }
  function clearProjectiles() { projectiles.forEach((p) => group.remove(p.m)); projectiles.length = 0; }

  const kit = { shoot, warnFx, ringFx, slashFx, spawnAdds, moveEnemy, enemies, rand };   /* ACTE VI */
  return { enemies, spawnZone, clearZone, resetAll, update, melee, ranged, onde, autoAim, dealDamage, clearProjectiles, dropPickup, ringFx, roomAlive: (gate) => enemies.some((e) => e.room === gate && e.state !== 'dead'), hasRoom: (gate) => enemies.some((e) => e.room === gate) };
}
