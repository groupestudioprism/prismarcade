/* =========================================================
   LUMEN — introduction : écran de démarrage (logo), écran-titre animé
   (archipel 3D vivant), cinématique d'ouverture de la nouvelle partie,
   « Revoir l'introduction ». Voir DESIGN.md §12 et js/world/intro-scene.js.

   Branchement dans main.js (petits patchs) :
     createIntro(G, env)  · opening.boot(travel)  · opening.frame()  (fin d'update)
     opening.gate(...) en tête de G.startFrom · opening.wake(cb) en fin de G.startFrom
     opening.musicLock dans le choix de la musique.
   Drapeaux d'URL : ?skipintro (ni logo ni cinématique, titre animé conservé), ?nosplash (sans le logo seulement),
   ?intro (force tout, même sous automatisation). Sous automatisation
   (navigator.webdriver) sans ?intro : comportement « classique » d'origine,
   pour ne pas casser les tests qui supposent le démarrage direct.
   ========================================================= */
import * as THREE from 'three';
import { audio } from '../engine/audio.js';
import { createArchipelago, OFF, skyAt, BOAT } from '../world/intro-scene.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const $ = (s) => document.querySelector(s);
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

/* ---------- Chronologie de la cinématique (secondes) ---------- */
const DURATION = 33.6;
const SUBS = [
  [0.6, 5.0, 'Autrefois, la lumière voyageait d’île en île.'],
  [5.2, 10.4, 'Au cœur d’Iridia, le Grand Prisme recueillait le soleil et le confiait à chaque phare.'],
  [10.8, 14.0, 'Puis, une nuit, la Brume l’a enveloppé.'],
  [14.8, 18.2, 'Il s’est brisé en six éclats, tombés sur six îles.'],
  [18.4, 22.6, 'Un à un, les phares se sont éteints. Les ponts de lumière se sont effondrés.'],
  [23.2, 27.0, 'Mais au loin, sur la mer de nuages, une barque dérive…'],
  [27.2, 31.0, 'Lyra, apprentie Porteuse de lumière, et Fia, sa petite Lueur.'],
];
const SHATTER_T = 14.5, FALL_T = 15.0, OFF_T0 = 15.4, OFF_DT = 1.1;
const CAM = [[0, -125, -14, 150], [5.2, -78, 6, 98], [10.4, -26, 20, 38], [14.0, 20, 27, 36], [17.5, 52, 24, 60], [21.5, 6, 16, -64], [23.4, BOAT.x - 18, -12, BOAT.z + 46], [27.0, BOAT.x + 9, -19, BOAT.z + 18], [DURATION, BOAT.x + 6, -17.8, BOAT.z + 11]];
const LOOK = [[0, 0, 5, 0], [5.2, 0, 9, 0], [10.4, 0, 16, 0], [14.0, 0, 17, 0], [17.5, 0, 10, 0], [21.5, -10, 2, -10], [23.4, BOAT.x, -18, BOAT.z], [27.0, BOAT.x, -23.4, BOAT.z], [DURATION, BOAT.x, -23.6, BOAT.z]];
const MOOD = [[0, 0], [5.2, 0.12], [10.4, 0.3], [14.0, 0.55], [16, 0.8], [21, 1], [DURATION, 1]];
const BRUME = [[10.4, 0], [12.5, 0.6], [14.4, 1], [16.5, 0.8], [19, 0.2], [21, 0]];
/* version « mouvement réduit » : plans fixes (début, fin, instant représentatif) */
const STILL = [[0, 5.2, 3.5], [5.2, 10.6, 9.6], [10.6, 14.6, 13.8], [14.6, 18.4, 18.2], [18.4, 23.0, 22.6], [23.0, 27.0, 25.8], [27.0, DURATION, 31.5]];
const SFX = [[0.7, 'note_r'], [0.95, 'note_g'], [1.2, 'note_b'], [1.7, 'beam_on'], [5.4, 'prism'], [11.0, 'roar', { vol: 0.4, pitch: 0.7 }], [SHATTER_T, 'break'], [SHATTER_T + 0.05, 'impact_verre'], [SHATTER_T + 0.1, 'warp'],
  ...[0, 1, 2, 3, 4, 5].map((k) => [OFF_T0 + OFF_DT * k, 'beam_off']), [23.4, 'boat'], [25.8, 'fia'], [27.6, 'sparkle'], [30.6, 'note_w']];
const MUSIC = [[0, 'title', 0.8], [10.8, 'sanctuaire', 0.5], [23.0, 'title', 0.7]];

function cr(keys, t, out) {   /* spline de Catmull-Rom (cardinale) sur des clés [t, x, y, z] */
  let i = 0; while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  const k1 = keys[i], k2 = keys[Math.min(i + 1, keys.length - 1)], k0 = keys[Math.max(i - 1, 0)], k3 = keys[Math.min(i + 2, keys.length - 1)];
  const u = clamp((t - k1[0]) / Math.max(1e-6, k2[0] - k1[0]), 0, 1), u2 = u * u, u3 = u2 * u;
  for (let c = 1; c <= 3; c++) {
    const p0 = k0[c], p1 = k1[c], p2 = k2[c], p3 = k3[c];
    out[c - 1] = 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
  }
  return out;
}
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1]; const last = keys[keys.length - 1]; if (t >= last[0]) return last[1];
  let i = 0; while (t >= keys[i + 1][0]) i++;
  return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * sstep(keys[i][0], keys[i + 1][0], t);
}

export function createIntro(G, env) {
  const { scene, camera, renderer, sky, skyU, hemi, sun, world, S, LOW, REDUCED, params } = env;
  const webdriver = !!navigator.webdriver;
  const FORCE = params.has('intro');
  const CLASSIC = webdriver && !FORCE;              /* démarrage direct d'origine */
  const SKIP = CLASSIC || params.has('skipintro');   /* pas de logo ni de cinématique */
  const scr = $('#screen');

  let arch = null, mode = 'off';                     /* 'off' | 'title' | 'cine' */
  let leaving = false, broken = false, saved = null, cine = null, splashOn = false, booted = false, veilBlack = false;
  const camP = new THREE.Vector3(), camL = new THREE.Vector3(), tmpA = [0, 0, 0], tmpB = [0, 0, 0];

  /* ---------- Voile noir (transitions) et fondu de la cinématique ---------- */
  const veil = el('<div id="intro-veil" class="i-veil"></div>');
  const dip = el('<div id="intro-dip" class="i-dip"></div>');
  document.body.append(veil, dip);
  function veilSet(op, ms) {
    veil.style.transition = ms ? `opacity ${ms}ms ease` : 'none'; void veil.offsetWidth; veil.style.opacity = String(op); veilBlack = op >= 1;
  }

  /* ---------- Décor 3D ---------- */
  function ensureScene() {
    if (arch) return true; if (broken) return false;
    try {
      arch = createArchipelago({ low: LOW, still: REDUCED });
      scene.add(arch.root);
      saved = { worldVisible: world.root.visible, fov: camera.fov, autoUpdate: renderer.shadowMap.autoUpdate, fogNear: scene.fog.near, fogFar: scene.fog.far };
      world.root.visible = false; renderer.shadowMap.autoUpdate = false;
      document.body.classList.add('intro-title');
      return true;
    } catch (e) { console.warn('intro: décor indisponible', e); broken = true; releaseScene(); return false; }
  }
  function releaseScene() {
    if (arch) { arch.dispose(); arch = null; }
    if (saved) {
      world.root.visible = saved.worldVisible; camera.fov = saved.fov; camera.updateProjectionMatrix();
      renderer.shadowMap.autoUpdate = saved.autoUpdate; renderer.shadowMap.needsUpdate = true;
      scene.fog.near = saved.fogNear; scene.fog.far = saved.fogFar; saved = null;
    }
    mode = 'off'; document.body.classList.remove('intro-title', 'intro-cine');
  }
  function titleState() {
    const s = arch.st;
    Object.assign(s, { mood: 0.5, shatter: 1, fall: 0, brume: 0, flash: 0, boat: 0, fia: 0, bridges: 0, links: 0 });
    s.lit = [1, 0.08, 0.08, 0.85, 0.08, 0.08];
  }
  function atmosphere(mood, fogNear, fogFar) {
    const k = skyAt(mood);
    skyU.top.value.copy(k.top); skyU.horizon.value.copy(k.hor); skyU.bottom.value.copy(k.bot);
    scene.fog.color.copy(k.fog); scene.fog.near = fogNear; scene.fog.far = fogFar;
    hemi.color.copy(k.top).lerp(new THREE.Color('#ffffff'), 0.55); hemi.intensity = k.hemi;
    sun.color.copy(k.sunC); sun.intensity = k.sun; sun.position.set(OFF.x + 40, 60, 30); sun.target.position.copy(OFF);
  }
  function fitFov() {
    const asp = innerWidth / Math.max(1, innerHeight), f = asp < 0.75 ? 70 : asp < 1.1 ? 58 : 45;
    if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
  }

  /* ---------- Boucle (appelée à la fin de update() de main.js) ---------- */
  function frame() {
    if (mode === 'off' || !arch) return;
    const now = performance.now() / 1000;
    fitFov();
    if (mode === 'title') {
      const t = REDUCED ? 0 : now, asp = innerWidth / Math.max(1, innerHeight), far = 118 * (asp < 1 ? 0.82 : 1);
      const a = 0.9 + t * 0.028;
      camP.set(Math.cos(a) * far, 22 + Math.sin(t * 0.13) * 3, Math.sin(a) * far);
      camL.set(0, PRISM_LOOK_Y(asp), 0);
      arch.update(0.016, t);
      atmosphere(0.5, 130, 430);
    } else if (mode === 'cine') {
      cineFrame(now);
      if (!arch || mode === 'off') return;     /* la cinématique a pu se terminer (et libérer le décor) dans cette image */
    }
    camera.position.copy(camP).add(OFF); camera.lookAt(camL.x + OFF.x, camL.y, camL.z + OFF.z);
    arch.followCamera(camera.position);
    sky.position.copy(camera.position);
  }
  const PRISM_LOOK_Y = (asp) => (asp < 1 ? -10 : -6);

  /* =======================================================
     Cinématique
     ======================================================= */
  function cineFrame(now) {
    const c = cine; let t = c.hold != null ? c.hold : clamp(now - c.t0, 0, DURATION);
    if (c.skipAt != null) { const k = clamp((now - c.skipAt) / 0.5, 0, 1); dip.style.opacity = String(k); if (k >= 1) { endCine(); return; } }
    /* temps « de plan » : en mouvement réduit on fige chaque plan sur un instant représentatif */
    let ts = t, dipV = 0;
    if (REDUCED) {
      for (const [a, b, rep] of STILL) if (t >= a && t < b) { ts = rep; dipV = Math.max(dipV, 1 - Math.min(t - a, b - t) / 0.5); break; }
      dipV = clamp(dipV, 0, 1);
    }
    dipV = Math.max(dipV, clamp(1 - t / 1.2, 0, 1), clamp((t - (DURATION - 1.0)) / 1.0, 0, 1));
    if (c.skipAt == null) dip.style.opacity = String(dipV);
    const s = arch.st;
    cr(CAM, ts, tmpA); cr(LOOK, ts, tmpB);
    const asp = innerWidth / Math.max(1, innerHeight), back = asp < 1 ? 1 + (1 - asp) * 0.55 : 1;
    camL.set(tmpB[0], tmpB[1], tmpB[2]);
    camP.set(tmpA[0], tmpA[1], tmpA[2]);
    if (back > 1) camP.sub(camL).multiplyScalar(back).add(camL);
    if (!REDUCED) { camP.x += Math.sin(now * 0.7) * 0.25; camP.y += Math.sin(now * 0.9) * 0.2; }
    s.mood = track(MOOD, ts); s.brume = track(BRUME, ts) * (ts < 10.4 ? 0 : 1);
    s.shatter = sstep(SHATTER_T, SHATTER_T + 0.5, ts); s.fall = sstep(FALL_T, FALL_T + 3.0, ts);
    s.flash = ts < SHATTER_T ? 0 : Math.pow(clamp(1 - (ts - SHATTER_T - 0.1) / 1.0, 0, 1), 1.5) * (ts > SHATTER_T + 0.05 ? 1 : 0);
    s.links = sstep(0.4, 1.8, ts); s.bridges = sstep(1.8, 3.4, ts);
    for (let k = 0; k < 6; k++) { const on = sstep(0.2 + k * 0.15, 1.2 + k * 0.15, ts), off = 1 - sstep(OFF_T0 + OFF_DT * k, OFF_T0 + OFF_DT * k + 0.7, ts); s.lit[k] = on * off + (1 - off) * 0.03 * on; }
    s.boat = ts > 21.0 ? 1 : 0; s.fia = sstep(25.2, 27.2, ts);
    arch.update(0.016, REDUCED ? 0 : now);
    atmosphere(s.mood, 90 + (1 - s.brume) * 40, 360);
    if (s.mood > 0.9) { scene.fog.near = 60; scene.fog.far = 280; }
    /* sous-titres */
    let idx = -1; for (let i = 0; i < SUBS.length; i++) if (t >= SUBS[i][0] && t < SUBS[i][1]) idx = i;
    if (idx !== c.sub) { c.sub = idx; showSub(idx); }
    c.card.classList.toggle('on', t >= 31.2 && t < DURATION - 0.3);
    c.bars.classList.toggle('on', t > 0.2);
    /* sons et musique */
    if (c.skipAt == null) {
      while (c.sfxI < SFX.length && t >= SFX[c.sfxI][0]) { const [, n, o] = SFX[c.sfxI++]; audio.sfx(n, o); }
      while (c.musI < MUSIC.length && t >= MUSIC[c.musI][0]) { const [, th, lv] = MUSIC[c.musI++]; audio.music(th, lv); }
    }
    if (t >= DURATION && c.skipAt == null) { c.skipAt = now - 0.5; }
  }
  function showSub(i) {
    const box = cine.sub$; box.innerHTML = '';
    if (i < 0) return;
    const words = SUBS[i][2].split(' '), p = document.createElement('p');
    p.innerHTML = words.map((w, j) => `<span style="animation-delay:${REDUCED ? 0 : (j * 0.09).toFixed(2)}s">${w}</span>`).join(' ');
    box.append(p);
  }
  function cineUI() {
    const ui = el(`<div id="intro-cine" class="i-cine${REDUCED ? ' still' : ''}" role="region" aria-label="Introduction">
      <div class="i-bar top"></div><div class="i-bar bot"></div>
      <div class="i-sub" aria-live="polite"></div>
      <div class="i-card"><small>Acte I</small><b>L’Île de l’Aube</b></div>
      <button class="i-skip" type="button" aria-label="Passer l’introduction">Passer <span aria-hidden="true">›</span></button>
    </div>`);
    document.body.append(ui); return ui;
  }
  function playCinematic(then) {
    if (!ensureScene()) return false;
    mode = 'cine'; document.body.classList.add('intro-cine');
    scr.classList.add('intro-hidden');
    const ui = cineUI();
    cine = { t0: performance.now() / 1000, then, sub: -2, sfxI: 0, musI: 0, skipAt: null, ui, sub$: ui.querySelector('.i-sub'), card: ui.querySelector('.i-card'), bars: ui };
    Object.assign(arch.st, { mood: 0, shatter: 0, fall: 0, brume: 0, flash: 0, boat: 0, fia: 0, links: 0, bridges: 0 }); arch.st.lit = [0, 0, 0, 0, 0, 0];
    dip.style.opacity = '1';
    veilSet(0, 0);
    ui.querySelector('.i-skip').addEventListener('click', (e) => { e.stopPropagation(); skipCine(); });
    addEventListener('keydown', onCineKey, true);
    audio.music('title', 0.8);
    return true;
  }
  function onCineKey(e) { if (mode !== 'cine') return; if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); skipCine(); } }
  function skipCine() { if (!cine || cine.skipAt != null) return; cine.skipAt = performance.now() / 1000; audio.sfx('uiBack'); }
  function endCine() {
    const c = cine; cine = null;
    removeEventListener('keydown', onCineKey, true);
    veilSet(1, 0);                       /* noir tenu pendant le changement de scène */
    c.ui.remove(); dip.style.opacity = '0';
    scr.classList.remove('intro-hidden');
    c.then && c.then();
  }

  /* =======================================================
     Écran de démarrage (logo)
     ======================================================= */
  function runSplash(done) {
    splashOn = true;
    document.body.classList.add('intro-splash');
    const root = el(`<div id="intro-splash" class="i-splash">
      <canvas></canvas>
      <div class="isp-title"><h1 aria-label="LUMEN">${[...'LUMEN'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</h1><p>Les Îles Brisées</p></div>
      <div class="isp-by">Studio Prism <i>·</i> Prism Arcade</div>
      <div class="isp-hint">Touche l’écran pour continuer</div>
    </div>`);
    document.body.append(root);
    const cv = root.querySelector('canvas'), g = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1;
    const fit = () => { dpr = Math.min(window.devicePixelRatio || 1, LOW ? 1 : 1.5); w = cv.width = Math.floor(innerWidth * dpr); h = cv.height = Math.floor(innerHeight * dpr); };
    fit(); addEventListener('resize', fit);
    const T_END = REDUCED ? 2.2 : 3.6, t0 = performance.now(); let raf = 0, finished = false, sfxI = 0, skipped = false;
    const hint = root.querySelector('.isp-hint');
    const running = () => { try { return audio.info().state === 'running'; } catch (e) { return false; } };
    const wasRunning = running();
    if (wasRunning) hint.remove();
    const SP = [[0.35, 'note_r'], [0.6, 'note_g'], [0.85, 'note_b'], [1.75, 'note_w'], [2.1, 'sparkle']];
    if (REDUCED) root.classList.add('still');

    const rays = [['#ff4d6a', -1], ['#52f2a2', 0], ['#58a6ff', 1]];
    function draw(u) {
      g.clearRect(0, 0, w, h);
      const m = Math.min(w, h), s = m * (w > h ? 0.16 : 0.2), L = Math.min(w * 0.34, m * 0.62);
      const x0 = w / 2 - L / 2, y0 = h * 0.37;
      const pIn = [x0 - s * 0.32, y0 + s * 0.12], pOut = [x0 + s * 0.4, y0 + s * 0.12], Q = [x0 + L, y0 + s * 0.12];
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      /* faisceau blanc entrant */
      const a = REDUCED ? 1 : sstep(0, 0.65, u);
      if (a > 0) {
        const xs = -s, xe = xs + (pIn[0] - xs) * a;
        g.globalCompositeOperation = 'lighter';
        for (const [lw, al] of [[14 * dpr, 0.08], [7 * dpr, 0.2], [2.4 * dpr, 0.95]]) { g.strokeStyle = `rgba(255,248,235,${al})`; g.lineWidth = lw; g.beginPath(); g.moveTo(xs, pIn[1]); g.lineTo(xe, pIn[1]); g.stroke(); }
      }
      /* prisme (triangle de verre) */
      const pa = REDUCED ? 1 : sstep(0.15, 0.6, u), tri = [[x0 + s * 0.04, y0 - s * 0.72], [x0 - s * 0.66, y0 + s * 0.68], [x0 + s * 0.74, y0 + s * 0.68]];
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = pa; g.beginPath(); g.moveTo(...tri[0]); g.lineTo(...tri[1]); g.lineTo(...tri[2]); g.closePath();
      const fg = g.createLinearGradient(tri[1][0], tri[1][1], tri[2][0], tri[0][1]); fg.addColorStop(0, 'rgba(255,255,255,.04)'); fg.addColorStop(1, 'rgba(190,170,255,.22)');
      g.fillStyle = fg; g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.2 * dpr; g.stroke(); g.globalAlpha = 1;
      /* dispersion puis recomposition : chaque rayon est une courbe qui s'écarte puis se rejoint en Q */
      const b = REDUCED ? 1 : sstep(0.55, 1.9, u);
      if (b > 0) {
        g.globalCompositeOperation = 'lighter';
        for (const [col, d] of rays) {
          const spread = d * s * 1.05, c1 = [pOut[0] + (Q[0] - pOut[0]) * 0.25, pOut[1] + spread * 1.9], c2 = [pOut[0] + (Q[0] - pOut[0]) * 0.75, pOut[1] + spread * 1.9];
          const N = 40, n = Math.max(2, Math.floor(N * b));
          for (const [lw, al] of [[11 * dpr, 0.1], [4.5 * dpr, 0.35], [1.8 * dpr, 0.95]]) {
            g.strokeStyle = col; g.globalAlpha = al; g.lineWidth = lw; g.beginPath();
            for (let i = 0; i <= n; i++) { const k = (i / N), q = 1 - k; const x = q * q * q * pOut[0] + 3 * q * q * k * c1[0] + 3 * q * k * k * c2[0] + k * k * k * Q[0], y = q * q * q * pOut[1] + 3 * q * q * k * c1[1] + 3 * q * k * k * c2[1] + k * k * k * Q[1]; i ? g.lineTo(x, y) : g.moveTo(x, y); }
            g.stroke();
          }
        }
        g.globalAlpha = 1;
      }
      /* éclat blanc à la recomposition */
      const f = REDUCED ? 1 : sstep(1.6, 2.0, u) * (1 - 0.35 * sstep(2.2, 3.4, u));
      if (f > 0) {
        const r = m * (0.07 + 0.05 * f), gr = g.createRadialGradient(Q[0], Q[1], 0, Q[0], Q[1], r * 2.6);
        gr.addColorStop(0, `rgba(255,255,255,${0.95 * f})`); gr.addColorStop(0.25, `rgba(255,236,200,${0.5 * f})`); gr.addColorStop(1, 'rgba(255,200,160,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(Q[0], Q[1], r * 2.6, 0, 7); g.fill();
      }
      g.restore();
    }
    function tick(now) {
      if (finished) return;
      const u = REDUCED ? 3 : (performance.now() - t0) / 1000;
      draw(REDUCED ? 3 : u);
      if (!REDUCED) while (sfxI < SP.length && u >= SP[sfxI][0]) { if (running()) audio.sfx(SP[sfxI][1], { vol: 0.5 }); sfxI++; }
      if (u >= T_END) return finish();
      raf = requestAnimationFrame(tick);
    }
    function finish(byUser) {
      if (finished) return; finished = true; cancelAnimationFrame(raf);
      removeEventListener('resize', fit); removeEventListener('keydown', onKey, true); root.removeEventListener('pointerdown', onPtr);
      if (byUser) audio.sfx('sparkle', { vol: 0.6 });
      audio.music('title', 0.6);
      root.classList.add('out');
      document.body.classList.remove('intro-splash'); document.body.classList.add('intro-reveal');
      setTimeout(() => document.body.classList.remove('intro-reveal'), 2600);
      setTimeout(() => { root.remove(); splashOn = false; }, 800);
      done && done();
    }
    function onKey(e) { if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return; e.preventDefault(); skipped = true; finish(true); }
    function onPtr() { skipped = true; finish(true); }
    addEventListener('keydown', onKey, true); root.addEventListener('pointerdown', onPtr);
    if (REDUCED) setTimeout(() => finish(false), T_END * 1000);
    raf = requestAnimationFrame(tick);
    api._skipSplash = () => finish(true);
    return skipped;
  }

  /* =======================================================
     API publique
     ======================================================= */
  function injectReplay() {
    const obs = new MutationObserver(() => {
      const acts = document.querySelector('#t-card .actions');
      if (acts && !acts.querySelector('[data-intro]') && !acts.dataset.introDone) {
        acts.dataset.introDone = '1';
        const b = document.createElement('button'); b.className = 'btn i-replay'; b.type = 'button'; b.dataset.intro = 'replay'; b.textContent = '✦ Revoir l’introduction';
        acts.append(b);
      }
    });
    obs.observe(scr, { childList: true, subtree: true });
    document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-intro="replay"]'); if (!b) return; e.stopPropagation(); audio.sfx('ui'); replay(); }, true);
  }
  function replay() {
    if (mode === 'cine') return;
    scr.classList.add('intro-hidden');
    veilSet(1, 0);
    if (!ensureScene()) { scr.classList.remove('intro-hidden'); veilSet(0, 300); return; }
    mode = 'title'; titleState();
    playCinematic(() => {
      mode = 'title'; titleState(); audio.music('title', 0.6);
      veilSet(0, 900);
    });
  }

  const api = {
    get active() { return mode !== 'off'; },
    get musicLock() { return mode === 'cine'; },
    get mode() { return mode; },
    frame,
    /* Appelée une fois au démarrage (travel = reprise automatique après un voyage entre îles : rien à montrer). */
    boot(travel) {
      if (booted) return; booted = true;
      if (CLASSIC || travel) return;
      if (!SKIP && !params.has('nosplash')) { try { runSplash(); } catch (e) { console.warn('intro: logo indisponible', e); document.body.classList.remove('intro-splash'); } }
      mode = 'title';
      requestAnimationFrame(() => {   /* le logo est déjà peint : on construit le décor 3D ensuite */
        if (mode !== 'title') return;
        if (!ensureScene()) { mode = 'off'; return; }
        titleState();
      });
      injectReplay();
    },
    /* En tête de G.startFrom. Retourne true si l'intro prend la main et rappellera startFrom avec noIntro = true. */
    gate(state, slot, legacy, noIntro) {
      if (CLASSIC) return false;
      if (noIntro) { if (arch || mode !== 'off') releaseScene(); return false; }
      if (mode === 'off' && !arch) return false;
      if (mode === 'cine' || leaving) return true;        /* démarrage déjà pris en charge */
      const fresh = !state && !legacy;
      const again = () => G.startFrom(state, slot, legacy, true);
      if (splashOn && api._skipSplash) api._skipSplash();
      if (fresh && !SKIP) {
        const ok = playCinematic(() => G.startFrom(null, slot, false, true));
        if (ok) return true;
      }
      leaving = true; veilSet(1, 450); setTimeout(() => { leaving = false; again(); }, 480);
      return true;
    },
    /* En fin de G.startFrom : révèle la partie (yeux qui s'ouvrent pour une nouvelle partie), puis cb. */
    wake(cb, fresh) {
      if (!veilBlack) { cb && setTimeout(cb, 700); return; }
      if (!fresh) { veilSet(0, 700); cb && cb(); return; }
      const cv = $('#c'), t0 = performance.now(), D = REDUCED ? 700 : 2400;
      if (REDUCED) { veilSet(0, 700); cb && setTimeout(cb, 800); return; }
      /* « réveil » : le voile s'ouvre comme des paupières et l'image est d'abord floue */
      veil.style.transition = 'none'; veil.classList.add('lids'); veil.style.opacity = '1';
      cv.style.filter = 'blur(10px) brightness(1.4)';
      veil.style.setProperty('--o', '-20%');
      const step = () => {
        const k = clamp((performance.now() - t0) / D, 0, 1), e = k * k * (3 - 2 * k);
        veil.style.setProperty('--o', (e * 155 - 20).toFixed(1) + '%');
        cv.style.filter = k >= 1 ? '' : `blur(${((1 - e) * 10).toFixed(1)}px) brightness(${(1 + (1 - e) * 0.4).toFixed(2)})`;
        if (k < 1) requestAnimationFrame(step);
        else { veil.classList.remove('lids'); veil.style.removeProperty('--o'); veilSet(0, 0); }
      };
      requestAnimationFrame(step);
      cb && setTimeout(cb, D - 500);
    },
    replay,
    debug: () => ({ mode, splash: splashOn, scene: !!arch, counts: arch ? arch.counts() : null, t: cine ? +(performance.now() / 1000 - cine.t0).toFixed(1) : null, classic: CLASSIC, skip: SKIP }),
    /* test : place la cinématique à l'instant t (secondes) */
    seek(t) { if (cine) cine.t0 = performance.now() / 1000 - t; },
    /* test : fige la cinématique à l'instant t (null pour relâcher) */
    hold(t) { if (cine) { cine.hold = t; if (t != null) { cine.sfxI = SFX.length; cine.musI = MUSIC.length; } } },
  };
  window.__intro = api;
  return api;
}
