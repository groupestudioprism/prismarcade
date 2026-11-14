/* =========================================================
   LUMEN — ACTE III : mécaniques du Désert des Échos.
   · Porter : prendre un miroir / un prisme / une lame posé sur un socle et le reposer sur un autre socle libre
              (R ou appui long pour prendre ; Interagir ou R devant un socle libre pour poser).
   · Tempêtes de sable : cycles calme → alerte → tempête ; dans les zones « storm », les faisceaux ne portent plus que
              quelques cases. Aucune pénalité : tout ce qui est allumé reste allumé, on peut attendre ou s’abriter sous une tente.
   · Orbe : Fia devient lanterne de poche et allume les vasques de pierre.
   · Fin de boss générique, rattrapage des capacités à l’arrivée, stèles d’écho.
   Aucune donnée ici : les zones, objets et quêtes sont dans js/islands/desert.js et js/data/desert-*.js.
   ========================================================= */
import * as THREE from 'three';
import { liftEnt, placeEnt, freeSocles } from '../logic.js';
import { W, lerp, damp } from '../engine/util.js';
import { lift as altLift } from '../world/lift.js';   /* ALTITUDE (le nom « lift » est pris par la fonction Porter) */

/* Ambiances (fusionnées dans AMB de main.js) */
export const DESERT_AMB = {
  desert: { sky: [['#5a2a3a', '#d9803a', '#ffc880'], ['#e8903a', '#ffd89a', '#fff0c8']], fog: [60, 200], hemi: 1.05, sun: 1.15, tint: '#ffd8a0', amb: '#ffe2a0' },
  cite: { sky: [['#5a2a3a', '#d9803a', '#ffc880'], ['#e8903a', '#ffd89a', '#fff0c8']], fog: [80, 230], hemi: 1.08, sun: 1.15, tint: '#ffe0b0', amb: '#ffe2a0' },
  ruines: { sky: [['#4a2638', '#c9703a', '#f0b878'], ['#e08a3a', '#ffd08a', '#ffeec0']], fog: [50, 170], hemi: 1.0, sun: 1.1, tint: '#ffd8a0', amb: '#ffe2a0' },
  temple_sable: { sky: [['#2a1a14', '#4a2f20', '#6a4a30'], ['#33211a', '#5a3a28', '#7a5a3a']], fog: [20, 90], hemi: 0.7, sun: 0.4, tint: '#ffd8a0', fogColor: '#3a281c', amb: '#ffd98a' },
  phare_sable: { sky: [['#3a2038', '#a85a3a', '#e8a860'], ['#d08a48', '#ffd08a', '#fff0c8']], fog: [45, 160], hemi: 1.0, sun: 0.9, tint: '#ffe0b0', amb: '#fff0b0' },
};

const STELES = {
  stele_cite: ['Stèle de la Cité', '« Ici, les voix reviennent. Parle doucement : la ville répète tout. »'],
  stele_dunes: ['Stèle des Dunes', '« Quand le vent se lève, la lumière s’épuise. Elle n’est pas morte : elle attend. »'],
  stele_temple: ['Stèle du Temple', '« Un miroir sur le mauvais socle ne reflète que le mur. Porte-le là où la lumière monte. »'],
  stele_phare: ['Stèle du Phare', '« Trois couleurs, une flamme. Le prisme les sépare ; un miroir les rassemble. Les vasques n’aiment que les flammes qu’on porte. »'],
};
const NAMES = { mirror: 'le miroir', prism: 'le prisme', splitter: 'la lame', vitrail: 'le vitrail' };

export function createAct3(G, X) {
  const { S, P, isl, world, zones, zoneIndex, IID, hud, audio, snd, sparks, scene, fiaLight, fade, reEvaluate, openGate, autosave } = X;
  const st = () => G.st;
  const abil = () => st().player.abilities;
  const carrying = () => isl.ents.find((e) => e.carry && e.carried) || null;
  const nameOf = (e) => NAMES[e.t] || 'l’objet';

  /* ---------- Interface : bandeau (tempête / objet porté) ---------- */
  const veil = document.createElement('div');
  veil.id = 'storm';
  veil.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;transition:none;background:radial-gradient(ellipse at 50% 40%,rgba(235,190,120,.12) 0%,rgba(214,160,92,.42) 55%,rgba(168,112,60,.7) 100%)';
  const chip = document.createElement('div');
  chip.id = 'a3chip';
  chip.style.cssText = 'position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:none;padding:6px 14px;border-radius:999px;background:rgba(40,28,20,.72);color:#ffe9c0;font:600 13px Inter,system-ui,sans-serif;letter-spacing:.01em;display:none;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis';
  document.body.appendChild(veil); document.body.appendChild(chip);
  /* grains de sable : couche légère, uniquement en tempête */
  const sand = document.createElement('div');
  sand.style.cssText = 'position:fixed;inset:-20%;pointer-events:none;z-index:5;opacity:0;background-image:repeating-linear-gradient(100deg,rgba(255,226,170,.0) 0 14px,rgba(255,226,170,.18) 14px 15px,rgba(255,226,170,0) 15px 38px);mix-blend-mode:screen';
  document.body.appendChild(sand);

  /* ---------- Objet porté : petit hologramme au-dessus de Lyra ---------- */
  const hold = new THREE.Group();
  const holdMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2a0').multiplyScalar(1.8), transparent: true, opacity: 0.9 });
  const holdMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), holdMat); holdMesh.scale.y = 1.5; hold.add(holdMesh);
  hold.visible = false; scene.add(hold); altLift.add(hold, () => P.gy || 0);

  /* ---------- Tempêtes de sable ---------- */
  const storm = { phase: 'calm', t: 38, warned: false, k: 0 };
  const RANGE = 5;
  const inStormZone = () => { const z = zones[S.zone]; return !!(z && z.storm); };
  function setPhase(ph, dur) {
    storm.phase = ph; storm.t = dur; storm.warned = false;
    if (ph === 'storm') { isl.range = RANGE; reEvaluate(); audio.ambience({ wind: 1, distant: 0.6 }); }
    if (ph === 'calm') { isl.range = null; reEvaluate(); audio.ambience({ wind: null, distant: null }); }
    if (ph === 'warn' && inStormZone()) { hud.toast('🌬', 'Le vent se lève', 'Une tempête de sable approche : la lumière ne portera bientôt plus loin. Rien ne se referme : attends, ou abrite-toi.'); }
  }
  function endStorm(quiet) {
    if (storm.phase === 'calm') return;
    setPhase('calm', 55 + Math.random() * 25);
    if (!quiet) hud.toast('☀', 'Le sable retombe', 'Les faisceaux portent de nouveau.');
  }

  /* ---------- Capacités ---------- */
  const teachNote = (id) => ({
    porter: ['Nouvelle capacité : Porter', G.input.touch ? 'Appui long sur ✋ devant un miroir ou un prisme sur son socle : tu le prends. Puis ✋ devant un socle libre pour le poser.' : 'Devant un miroir ou un prisme sur son socle, appuie sur R pour le prendre. Puis E ou R devant un socle libre pour le poser.'],
    orbe: ['Nouvelle capacité : l’Orbe', 'Fia peut se faire lanterne de poche : approche-toi d’une vasque de pierre et interagis pour l’allumer.'],
  })[id] || null;
  function arrive() {
    if (IID !== 'desert') return;
    const ab = abil();
    if (!ab.porter) { ab.porter = true; setTimeout(() => { const n = teachNote('porter'); hud.toast('✦', n[0], n[1], 'reward'); }, 1400); }
    if (st().flags.dore_fini && !ab.orbe) { ab.orbe = true; setTimeout(() => { const n = teachNote('orbe'); hud.toast('✦', n[0], n[1], 'reward'); }, 2600); }
    st().flags.porter_ok = 1;
  }

  /* ---------- Porter ---------- */
  function lift(e) {
    if (!abil().porter) { snd('deny'); hud.toast('✋', 'Trop lourd pour l’instant', 'Le fragment vert du Grand Prisme t’apprendra à porter ce qu’on croyait scellé.'); return true; }
    if (carrying()) { snd('deny'); hud.toast('✋', 'Tes mains sont pleines', 'Pose d’abord ce que tu portes sur un socle libre.'); return true; }
    liftEnt(isl, e);
    const v = world.views[e.id]; if (v) v.g.visible = false;
    snd('mirror'); sparks.burst(new THREE.Vector3(W(e.x), 1.2, W(e.y)), '#ffe2a0', 16, 2, 1);
    reEvaluate(); autosave();
    G.hintOnce && G.hintOnce('porter', `Tu portes ${nameOf(e)}. Cherche un socle libre dans la salle (E ou R pour le poser).`);
    return true;
  }
  function place(so) {
    const e = carrying(); if (!e) return;
    placeEnt(isl, e, so.x, so.y);
    const v = world.views[e.id]; if (v) { v.g.position.set(W(so.x), 0, W(so.y)); v.g.visible = true; }
    snd('mirror'); sparks.burst(new THREE.Vector3(W(so.x), 1.2, W(so.y)), '#9fe9ff', 18, 2, 1);
    reEvaluate(); autosave();
  }
  function giveBack(e) {   // quitter la salle avec un objet en main : il retourne sur son socle d'origine
    const free = freeSocles(isl, e.zone);
    const so = free.find((q) => q.x === e.home[0] && q.y === e.home[1]) || free[0];
    if (!so) return;
    placeEnt(isl, e, so.x, so.y);
    const v = world.views[e.id]; if (v) { v.g.position.set(W(so.x), 0, W(so.y)); v.g.visible = true; }
    reEvaluate();
    hud.toast('✦', 'L’objet retourne sur son socle', 'Les objets portés ne quittent pas leur salle.');
  }

  /* ---------- Cibles d'interaction (appelé par findTarget) ---------- */
  function targets(zi, push, d) {
    const car = carrying(), ab = abil();
    isl.ents.forEach((e) => {
      if (!e.carry || e.zone !== zi || e.carried || e.rot) return;
      push(d(W(e.x), W(e.y)), 2.5, { kind: 'carry', e, x: W(e.x), z: W(e.y), label: ab.porter ? `Porter ${nameOf(e)}` : `${nameOf(e)[0].toUpperCase() + nameOf(e).slice(1)} sur son socle`, alt: null });
    });
    if (car && car.zone === zi) freeSocles(isl, zi).forEach((so) => push(d(W(so.x), W(so.y)), 2.4, { kind: 'socle', so, x: W(so.x), z: W(so.y), label: `Poser ${nameOf(car)} ici`, alt: 'poser' }));
    world.props.forEach((pr) => {
      if (pr.zi !== zi) return;
      const p = pr.p, x = pr.g.position.x, z = pr.g.position.z;
      if (p.t === 'vasque' && !pr.g.userData.lit) push(d(x, z), 2.7, { kind: 'vasque', pr, x, z, label: ab.orbe ? 'Allumer la vasque avec l’Orbe' : 'Une vasque de pierre éteinte' });
      if (p.t === 'shelter') push(d(x, z), 2.9, { kind: 'shelter', pr, x, z, label: 'S’abriter sous la tente' });
      if (p.t === 'stele') push(d(x, z), 2.5, { kind: 'stele', pr, x, z, label: 'Lire la stèle' });
    });
  }
  /* après tri : les objets orientables portables proposent aussi « porter » */
  function decorate(cands) {
    if (!abil().porter) return;
    cands.forEach((c) => { if (c.kind === 'device' && c.e.carry) c.alt = 'porter'; });
  }

  /* ---------- Interaction ---------- */
  function interact(t, back) {
    switch (t.kind) {
      case 'carry': lift(t.e); return true;
      case 'socle': place(t.so); return true;
      case 'stele': { const s = STELES[t.pr.p.id] || ['Stèle', 'Des signes usés par le sable.']; G.screens.message(s[0], s[1]); return true; }
      case 'shelter': {
        if (storm.phase === 'calm') { hud.toast('⛺', 'Un abri tranquille', 'Quand la tempête se lèvera, tu pourras t’y réfugier : le sable retombera aussitôt. Aucune hâte.'); return true; }
        audio.sfx('door');
        fade(() => { endStorm(true); hud.toast('⛺', 'Tu t’abrites un moment', 'Quand tu ressors, le sable est retombé.'); });
        return true;
      }
      case 'vasque': {
        const pr = t.pr, id = pr.p.id;
        if (!abil().orbe) { G.screens.message('Vasque de pierre', 'Une vasque taillée dans le grès, froide depuis des siècles. Il lui faudrait une flamme qu’on puisse porter dans la main : l’Orbe, peut-être, que garde Oumi.'); return true; }
        st().flags['vasque_' + id] = 1; pr.g.userData.lit = true;
        audio.sfx('lamp'); sparks.burst(new THREE.Vector3(pr.g.position.x, 1.9, pr.g.position.z), '#ffc861', 36, 2.4, 1.2);
        const all = world.props.filter((q) => q.p.t === 'vasque'), n = all.filter((q) => q.g.userData.lit).length;
        hud.toast('✦', `Vasque allumée (${n} / ${all.length})`, n < all.length ? 'Fia s’est posée un instant dans la flamme.' : 'La porte de lumière s’ouvre.');
        if (n >= all.length) { audio.chord([523, 659, 784, 1047]); openGate('ph_vasques'); }
        autosave();
        return true;
      }
    }
    return false;
  }

  /* ---------- Hooks ---------- */
  function applyWorld() {
    isl.ents.filter((e) => e.carry).forEach((e) => { const v = world.views[e.id]; if (!v) return; v.g.position.set(W(e.x), 0, W(e.y)); v.g.visible = !e.carried; });
    world.props.filter((pr) => pr.p.t === 'vasque').forEach((pr) => { pr.g.userData.lit = !!st().flags['vasque_' + pr.p.id]; });
  }
  function zoneChange(zi) {
    const e = carrying();
    if (e && e.zone !== zi) giveBack(e);
    chipUpdate(true);
  }
  function bossWon(def) {   // fin de boss générique (def.win)
    const w = def.win;
    hud.banner('Victoire', w.banner);
    st().world.warps[w.warp] = 1;
    setTimeout(() => hud.toast('✦', 'Un cristal de voyage s’est réveillé', w.toast), 2500);
  }

  /* ---------- Mise à jour ---------- */
  let chipTxt = '';
  function chipUpdate(force) {
    const car = carrying(), z = zones[S.zone];
    let txt = '';
    if (car) txt = `Tu portes ${nameOf(car)} · pose-le sur un socle libre (R)`;
    else if (z && z.storm && storm.phase === 'storm') txt = 'Tempête de sable : la lumière ne porte plus loin. Patiente ou abrite-toi.';
    else if (z && z.storm && storm.phase === 'warn') txt = 'Le vent se lève…';
    if (txt !== chipTxt || force) { chipTxt = txt; chip.textContent = txt; chip.style.display = txt && S.mode !== 'title' ? 'block' : 'none'; }
  }
  function update(dt, t) {
    if (S.mode === 'title') { veil.style.opacity = 0; sand.style.opacity = 0; chip.style.display = 'none'; return; }
    if (IID === 'desert') {
      if (S.mode === 'play' || S.mode === 'dialog') {
        storm.t -= dt;
        if (storm.t <= 0) {
          if (storm.phase === 'calm') setPhase('warn', 5);
          else if (storm.phase === 'warn') setPhase('storm', 22 + Math.random() * 6);
          else endStorm(false);
        }
      }
      const want = inStormZone() ? (storm.phase === 'storm' ? 1 : storm.phase === 'warn' ? 0.25 : 0) : 0;
      storm.k = lerp(storm.k, want, damp(1.4, dt));
      veil.style.opacity = (storm.k * 0.78).toFixed(3);
      sand.style.opacity = (storm.k * 0.7).toFixed(3);
      if (storm.k > 0.02) sand.style.transform = `translate(${((t * 420) % 60).toFixed(1)}px, ${((t * 90) % 40).toFixed(1)}px)`;
      chipUpdate(false);
      // Fia, lanterne de poche
      if (abil().orbe) { fiaLight.intensity *= 1.45; fiaLight.distance = 11; }
    }
    const car = carrying();
    hold.visible = !!car && S.mode !== 'title';
    if (car) {
      hold.position.set(P.x, 3.25 + Math.sin(t * 2.4) * 0.1, P.z); hold.rotation.y += dt * 1.6;
      holdMat.color.set(car.t === 'prism' ? '#9fe9ff' : car.t === 'splitter' ? '#d8e4ff' : '#ffe2a0').multiplyScalar(1.8);
    }
  }

  return {
    storm, carrying, lift, place, targets, decorate, interact, applyWorld, zoneChange, bossWon, update, arrive, teachNote,
    setStorm(ph) { if (ph === 'storm') setPhase('storm', 30); else if (ph === 'warn') setPhase('warn', 5); else endStorm(true); },
    range: () => isl.range,
  };
}
