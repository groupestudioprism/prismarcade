/* =========================================================
   LUMEN — Acte V, Les Pics du Vent : mécaniques de jeu propres à l'île.
   - Planer : les pierres de vent (entité « vent », logic.js : ventLinks) portent Lyra d'une rive à l'autre.
     Capacité « planer » (abilities.planer) accordée par Alizée ; si l'Acte IV la définit déjà, elle sert telle quelle.
   - Relais temporisés : décompte à chaque image, réévaluation des faisceaux à l'extinction.
   - Portails : capacité « portails » (abilities.portails). Touche V : pose un portail ; deux portails posés se relient.
     Réutilisable à l'Acte VI : l'état est dans st.player.portals = { island, list: [{ x, z }, { x, z }] } (coordonnées monde).
   ========================================================= */
import { ventLinks, tickTimers } from '../logic.js';
import { DIRS } from '../logic.js';

const DIR_WORDS = { N: 'le nord', E: 'l’est', S: 'le sud', W: 'l’ouest' };

export function createPicsMech(C) {
  const { isl, P, S, W, T, audio, snd, hud, sparks, THREE, input, setTouch, canStand, teleport, fade, autosave, reEvaluate, zones, pics, IID } = C;
  const st = () => C.st();
  const vents = isl.ents.filter((e) => e.t === 'vent');
  const lerp = (a, b, k) => a + (b - a) * k;
  const portal = { armed: false, cd: 0 };

  /* ---------- Planer ---------- */
  function pickVent(vent) {
    const links = ventLinks(isl, vent);
    if (!links.length) return null;
    if (links.length === 1) return links[0];
    const fx = Math.sin(P.face), fz = Math.cos(P.face);
    let best = null, bd = 0.3;
    links.forEach((l) => { const [dx, dy] = DIRS[l.dir]; const dot = fx * dx + fz * dy; if (dot > bd) { bd = dot; best = l; } });
    return best;
  }
  const can = () => !!st().player.abilities.planer;
  function ventLabel(vent) {
    if (!can()) return 'Pierre de vent';
    const l = pickVent(vent);
    return l ? `Planer vers ${DIR_WORDS[l.dir]}` : 'Pierre de vent · tourne-toi vers l’autre rive';
  }
  function interactVent(vent, screens) {
    if (!can()) { screens.message('Pierre de vent', 'Une pierre dressée, couverte de rubans qui ne bougent pas. De l’autre côté du vide, une jumelle lui répond. Il faudrait une voile pour s’y laisser porter.'); return; }
    const l = pickVent(vent);
    if (!l) { audio.sfx('deny'); hud.toast('✋', 'Aucune pierre en face', 'Tourne-toi vers la pierre de l’autre rive, puis réessaie.'); return; }
    startGlide(l);
  }
  function startGlide(l) {
    const to = { x: W(l.land[0]), z: W(l.land[1]) };
    const dist = Math.hypot(to.x - P.x, to.z - P.z);
    S.glide = { t: 0, dur: 1.0 + dist / 9, H: 2.2 + dist * 0.11, from: { x: P.x, z: P.z }, to, side: (Math.random() - 0.5) * 0.8 };
    S.mode = 'glide'; setTouch(false); input.clear(); hud.prompt('');
    P.face = Math.atan2(to.x - P.x, to.z - P.z); P.vx = P.vz = 0; P.swing = null; P.dodging = false; P.chargeT = 0;
    P.iframes = Math.max(P.iframes, S.glide.dur + 0.1);
    snd('glide_start');
  }
  function endGlide() {
    const g = S.glide; if (!g) return;
    P.x = g.to.x; P.z = g.to.z; P.y = 0; P.vx = P.vz = 0;
    S.glide = null; pics.setGlide(false);
    S.mode = 'play'; setTouch(true); input.clear();
    snd('glide_land'); sparks.burst(new THREE.Vector3(P.x, 0.4, P.z), '#e6dcff', 18, 2.4, 1.6);
    st().flags.a_plane = 1;
    autosave();
  }
  function updateGlide(dt, t) {
    const g = S.glide; g.t += dt;
    const k = Math.min(1, g.t / g.dur), e = k * k * (3 - 2 * k);
    P.x = lerp(g.from.x, g.to.x, e); P.z = lerp(g.from.z, g.to.z, e);
    P.y = Math.sin(Math.PI * Math.pow(k, 0.85)) * g.H + 0.4 * Math.sin(Math.PI * k);
    pics.setGlide(true, P, t);
    if (Math.random() < dt * 14) sparks.burst(new THREE.Vector3(P.x, P.y + 2.6, P.z), '#d8ccff', 2, 0.8, 0.2, 1, 0.5);
    if (k >= 1) endGlide();
  }

  /* ---------- Relais temporisés + portails : à appeler à chaque image ---------- */
  function tick(dt) {
    if (S.mode === 'play' || S.mode === 'glide' || S.mode === 'grapple') { if (tickTimers(isl, dt)) { snd('relay_expire'); reEvaluate(); } }
    if (S.mode !== 'play') return;
    portal.cd -= dt;
    const pt = st().player.portals;
    if (!pt || pt.island !== IID || pt.list.length < 2) return;
    const d = pt.list.map((p) => Math.hypot(p.x - P.x, p.z - P.z));
    if (!portal.armed) { if (d[0] > 1.8 && d[1] > 1.8) portal.armed = true; return; }
    if (portal.cd > 0) return;
    const i = d[0] < 0.85 ? 0 : d[1] < 0.85 ? 1 : -1;
    if (i < 0) return;
    const o = pt.list[1 - i];
    portal.armed = false; portal.cd = 1.2;
    snd('portal_use');
    sparks.burst(new THREE.Vector3(P.x, 0.6, P.z), i ? '#ff8ae6' : '#7fe6ff', 24, 3, 2);
    teleport(o.x, o.z);
    sparks.burst(new THREE.Vector3(o.x, 0.6, o.z), i ? '#7fe6ff' : '#ff8ae6', 24, 3, 2);
  }
  function syncPortals() {
    const pt = st().player.portals;
    pics.setPortals(pt && pt.island === IID && Array.isArray(pt.list) ? pt.list : []);
    portal.armed = false;
  }
  function portalKey() {
    if (S.mode !== 'play') return;
    const ab = st().player.abilities;
    if (!ab.portails) return;
    const z = zones[S.zone];
    if (!z || z.interior) { hud.toast('✋', 'Portail impossible ici', 'Les portails ne se posent qu’en plein air.'); audio.sfx('deny'); return; }
    if (!canStand(P.x, P.z)) { audio.sfx('deny'); return; }
    let pt = st().player.portals;
    if (!pt || pt.island !== IID || !Array.isArray(pt.list)) pt = st().player.portals = { island: IID, list: [] };
    const here = { x: Math.round(P.x / T) * T, z: Math.round(P.z / T) * T };
    if (pt.list.some((p) => Math.hypot(p.x - here.x, p.z - here.z) < T * 1.5)) { audio.sfx('deny'); hud.toast('✋', 'Trop près', 'Pose le deuxième portail plus loin.'); return; }
    if (pt.list.length >= 2) pt.list = [];
    pt.list.push(here);
    syncPortals(); portal.armed = false;
    snd('portal_set'); sparks.burst(new THREE.Vector3(here.x, 0.5, here.z), pt.list.length === 1 ? '#7fe6ff' : '#ff8ae6', 26, 2.5, 2);
    hud.toast('✦', pt.list.length === 1 ? 'Premier portail posé' : 'Deuxième portail posé', pt.list.length === 1 ? 'Pose le second ailleurs : les deux s’ouvriront l’un sur l’autre.' : 'Entre dans l’un, tu sors de l’autre. Un troisième appui recommence.');
    autosave();
  }
  void fade; void vents;
  return { pick: pickVent, ventLabel, interactVent, updateGlide, tick, portalKey, syncPortals };
}
