/* =========================================================
   LUMEN — Acte VI : L’Ombre du Prisme, boss final (trois phases).
   Appelé par combat.js (case 'boss_zenith') avec « K », la boîte à outils du combat :
   { shoot, warnFx, ringFx, slashFx, spawnAdds, moveEnemy, enemies, rand }.
   Phase 1 : coups au sol annoncés, balayage, gerbe de lances dorées, ombres invoquées.
   Phase 2 : spirales de projectiles colorés, bonds (elle disparaît, puis frappe là où tu te tiens).
   Phase 3 : l’Éclipse. Elle se couvre d’un bouclier tant que ses lanternes noires brûlent ; une fois toutes
             éteintes, elle est à découvert quelques secondes, puis redouble de violence (deuxième éclipse à 12 %).
   ========================================================= */
import * as THREE from 'three';
const COLS = ['#ff4d6d', '#ffd84d', '#3ee08f', '#4dd8ff', '#4d8dff', '#ff6bd6'];

export function updateBossZenith(K, G, e, dt, dist, toP, anim, faceTo) {
  const P = G.P, d = e.def, rand = K.rand;
  const hpk = e.hp / e.maxHp;
  const want = hpk < 0.33 ? 3 : hpk < 0.66 ? 2 : 1;
  const lanternsAlive = () => K.enemies.some((x) => x.tag === 'eclipse' && x.state !== 'dead');
  const eclipse = (n) => {
    K.spawnAdds(n, 'lanterne_noire', 'eclipse');
    if (!lanternsAlive()) return;
    e.state = 'eclipse'; e.t = 0; e.shielded = true; e.vx = e.vz = 0; e.volley = 0;
    G.audio.sfx('roar'); G.shake(0.6);
    G.ui.toast('☾', 'L’Éclipse', 'Éteins ses lanternes noires : elle est invulnérable tant qu’elles brûlent.');
  };
  if (want > e.phase && e.state !== 'idle' && e.state !== 'intro') {
    e.phase = want; G.audio.sfx('roar'); if (G.audio.bossPhase) G.audio.bossPhase(want); G.shake(0.6);
    if (want === 2) { G.ui.toast('⚠', 'L’Ombre se déchire', 'Elle prend les couleurs du Prisme : spirales et bonds.'); K.spawnAdds(2); }
    else { G.ui.toast('⚠', 'Troisième phase', 'L’Éclipse approche.'); eclipse(3); }
  }
  if (e.phase === 3 && !e.eclipse2 && hpk < 0.12 && e.state !== 'eclipse') { e.eclipse2 = true; eclipse(4); }
  const fast = e.phase === 1 ? 1 : e.phase === 2 ? 0.8 : 0.68;
  const col = () => COLS[Math.floor(rand(0, COLS.length))];

  switch (e.state) {
    case 'idle':
      if (dist < 10 && G.zoneIndexAt(P.x, P.z) === e.zi) { e.state = 'intro'; e.t = 0; G.audio.sfx('roar'); G.shake(0.6); G.bossStart(e); }
      break;
    case 'intro': anim.wind = Math.min(1, e.t); if (e.t > 1.8) { e.state = 'walk'; e.t = 0; e.cd = 1; } break;
    case 'walk':
      faceTo(toP, 2.5); K.moveEnemy(e, P.x, P.z, d.speed * (e.phase === 1 ? 1 : 1.25), dt); anim.move = 1;
      if (e.cd <= 0) {
        const r = Math.random();
        if (e.phase === 1) e.atk = dist < 4.5 ? (r < 0.5 ? 'sweep' : 'slam') : (r < 0.35 ? 'slam' : r < 0.7 ? 'lances' : 'summon');
        else if (e.phase === 2) e.atk = dist < 4.5 ? (r < 0.4 ? 'sweep' : 'blink') : (r < 0.35 ? 'spiral' : r < 0.65 ? 'blink' : r < 0.85 ? 'lances' : 'summon');
        else e.atk = dist < 4.5 ? (r < 0.4 ? 'slam' : 'blink') : (r < 0.5 ? 'spiral' : r < 0.8 ? 'lances' : 'blink');
        if (e.atk === 'summon' && K.enemies.filter((x) => x.adds && x.state !== 'dead').length >= 4) e.atk = 'lances';
        e.state = 'wind'; e.t = 0; e.vx = e.vz = 0;
        if (e.atk === 'slam') { e.tx = P.x; e.tz = P.z; K.warnFx(e.tx, e.tz, 3.4, 1.1 * fast, '#ffd84d'); }
        if (e.atk === 'sweep') K.warnFx(e.x + Math.sin(e.face) * 2, e.z + Math.cos(e.face) * 2, 4.3, 0.75 * fast, '#ffd84d');
        if (e.atk === 'blink') {
          const a = Math.random() * Math.PI * 2;
          let bx = P.x + Math.cos(a) * 3.2, bz = P.z + Math.sin(a) * 3.2;
          if (!G.canStand(bx, bz, 0.6)) { bx = P.x; bz = P.z; }
          e.tx = bx; e.tz = bz; K.warnFx(bx, bz, 3.3, 1.0 * fast, '#c9a0ff');
        }
      }
      break;
    case 'wind': {
      const wt = (e.atk === 'slam' ? 1.1 : e.atk === 'sweep' ? 0.75 : e.atk === 'blink' ? 1.0 : e.atk === 'spiral' ? 0.9 : 0.8) * fast;
      anim.wind = Math.min(1, e.t / wt);
      if (e.atk === 'blink') { if (e.t > 0.25) e.view.root.visible = false; }
      else if (e.atk !== 'slam') faceTo(toP, 3);
      if (e.t > wt) {
        e.state = 'attack'; e.t = 0; e.volley = 0;
        if (e.atk === 'slam') {
          G.audio.sfx('slam'); G.shake(0.8); K.ringFx(e.tx, e.tz, 3.6, '#ffd84d', 0.6);
          G.sparks.burst(new THREE.Vector3(e.tx, 0.4, e.tz), '#fff0b0', 50, 6, 3);
          if (Math.hypot(P.x - e.tx, P.z - e.tz) < 3.5) G.hurtPlayer(d.atk + 4, e.tx, e.tz, { knock: 3, brume: true });
          if (e.phase >= 2) for (let i = 0; i < 8; i++) K.shoot(e.tx, e.tz, (i / 8) * Math.PI * 2, { speed: 8, range: 10, size: 0.3, color: col(), dmg: 12, owner: 'enemy', y: 0.6 });
        } else if (e.atk === 'sweep') {
          G.audio.sfx('swingHeavy');
          const cx = e.x + Math.sin(e.face) * 2, cz = e.z + Math.cos(e.face) * 2;
          if (Math.hypot(P.x - cx, P.z - cz) < 4.4) G.hurtPlayer(d.atk, cx, cz, { knock: 3.5, brume: true });
          K.slashFx(e.x, e.z, e.face, 5, Math.PI * 1.1, '#ffe27a', 1.4);
        } else if (e.atk === 'lances') {
          const n = e.phase === 1 ? 5 : 7;
          for (let i = 0; i < n; i++) K.shoot(e.x + Math.sin(toP) * 1.5, e.z + Math.cos(toP) * 1.5, toP + (i - (n - 1) / 2) * 0.26, { speed: 11, range: 17, size: 0.34, color: '#ffe27a', dmg: 14, owner: 'enemy', y: 2.0 });
          G.audio.sfx('magic');
        } else if (e.atk === 'summon') { K.spawnAdds(e.phase === 1 ? 2 : 3); G.audio.sfx('roar'); }
        else if (e.atk === 'blink') {
          e.x = e.tx; e.z = e.tz; e.view.root.visible = true; G.audio.sfx('slam'); G.shake(0.6);
          K.ringFx(e.x, e.z, 3.6, '#c9a0ff', 0.6);
          if (Math.hypot(P.x - e.x, P.z - e.z) < 3.4) G.hurtPlayer(d.atk + 2, e.x, e.z, { knock: 3, brume: true });
        }
      }
      break;
    }
    case 'attack':
      anim.attack = Math.min(1, e.t / 0.4);
      if (e.atk === 'spiral') {   // spirale : un tir toutes les 0,09 s pendant 1,6 s
        const n = Math.floor(e.t / 0.09);
        while (e.volley < n && e.volley < 18) {
          const a = e.volley * 0.62 + (e.phase === 3 ? 0.3 : 0);
          K.shoot(e.x, e.z, a, { speed: 7.5, range: 15, size: 0.27, color: COLS[e.volley % COLS.length], dmg: 11, owner: 'enemy', y: 1.0 });
          K.shoot(e.x, e.z, a + Math.PI, { speed: 7.5, range: 15, size: 0.27, color: COLS[(e.volley + 3) % COLS.length], dmg: 11, owner: 'enemy', y: 1.0 });
          e.volley++;
        }
        if (e.t > 1.8) { e.state = 'walk'; e.cd = rand(1.0, 1.8) * fast; }
      } else if (e.t > 0.5) {
        if (e.atk === 'slam') { e.state = 'tired'; e.t = 0; e.tired = true; G.ui.damage(e.x, 4.6, e.z, 'Elle est à découvert !', 'alert'); }
        else if (e.atk === 'blink') { e.state = 'tired'; e.t = 0; e.tired = true; e.short = true; }
        else { e.state = 'walk'; e.cd = rand(1.1, 2.0) * fast; }
      }
      break;
    case 'tired':
      anim.tired = true; e.tired = true;
      if (e.t > (e.short ? 1.2 : e.afterEclipse ? 3.6 : 2.2) * fast) { e.tired = false; e.short = false; e.afterEclipse = false; e.state = 'walk'; e.cd = rand(0.9, 1.6) * fast; }
      break;
    case 'eclipse': {
      faceTo(toP, 2); anim.wind = 0.6 + Math.sin(e.t * 3) * 0.2;
      e.volley = e.volley || 0;
      const n = Math.floor(e.t / 0.4);
      while (e.volley < n) {
        const a = e.volley * 0.9;
        for (let k = 0; k < 3; k++) K.shoot(e.x, e.z, a + (k * Math.PI * 2) / 3, { speed: 6.5, range: 14, size: 0.28, color: COLS[(e.volley + k) % COLS.length], dmg: 10, owner: 'enemy', y: 1.0 });
        e.volley++;
      }
      if (!lanternsAlive()) {
        e.shielded = false; e.state = 'tired'; e.t = 0; e.tired = true; e.afterEclipse = true; e.vx = e.vz = 0;
        G.audio.sfx('roar'); G.ui.damage(e.x, 4.6, e.z, 'L’éclipse se brise !', 'alert'); G.sparks.burst(new THREE.Vector3(e.x, 2, e.z), '#fff0b0', 80, 7, 3);
      }
      break;
    }
  }
  if (e.state !== 'eclipse' && e.shielded) e.shielded = false;
  if (dist < d.radius + 0.6 && e.view.root.visible) G.hurtPlayer(9, e.x, e.z, { knock: 2.5, brume: true });
  G.ui.bossBar(e);
}
