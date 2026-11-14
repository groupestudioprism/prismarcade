/* =========================================================
   LUMEN — son : façade publique (100 % synthétisé, aucun fichier).
   API conservée : audio.{unlock,set,get,tone,noise,chime,chord,sfx},
   music(thème, niveau). Nouveautés : sfx(nom, opts), ambience(),
   listener(), step(), note(), bossPhase(), volumes par catégorie.
   Détail des modules dans js/audio/*.js ; contrat dans COORDINATION.md.
   ========================================================= */
import { A, vol, create, ensure, applyVolumes, persist, tone as coreTone, noise as coreNoise, L } from '../audio/core.js';
import { play, names } from '../audio/sfx.js';
import { setMusic, flushWanted, musicInfo, themes } from '../audio/music.js';
import { init as ambInit, setAmbience, setRestore, ambienceInfo, presets } from '../audio/ambience.js';

let last = { theme: undefined, level: undefined }, unlocked = false;

function unlockNow() {
  if (!A.ctx) { if (!create()) return null; }
  ensure();
  if (!unlocked) {
    unlocked = true; ambInit();
    if (last.theme !== undefined) music(last.theme, last.level);
  }
  return A.ctx;
}
/* Autoplay : le contexte audio naît au premier geste de l'utilisateur. */
const GESTES = ['pointerdown', 'keydown', 'touchstart', 'mousedown', 'click'];
function onGesture() {
  unlockNow();
  if (A.ctx && A.ctx.state === 'running') GESTES.forEach((e) => window.removeEventListener(e, onGesture, true));
}
try { GESTES.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true })); } catch (err) { /* hors navigateur */ }
try { document.addEventListener('visibilitychange', () => { if (!document.hidden && A.ctx) ensure(); }); } catch (err) { /* ignore */ }

const SAFE = (fn) => (...a) => { try { return fn(...a); } catch (e) { return undefined; } };

export const music = SAFE((theme, level) => {
  last = { theme, level: typeof level === 'number' ? level : last.level };
  if (!A.ctx) return;
  ensure(); ambInit();
  setMusic(theme, level);
  const name = theme === null || theme === false ? null : String(theme);
  if (name) { setAmbience(name === 'boss1' ? 'boss' : name, true); if (!/^(combat|boss|boss2|boss3|victoire|epilogue|generique)$/.test(name) && typeof level === 'number') setRestore(level); }
  else setAmbience('none', true);
});

export const audio = {
  unlock: SAFE(() => unlockNow()),
  /* volumes : master, music, sfx, ambience, voice (0..1), muted */
  set: SAFE((o) => { if (!o) return; for (const k in vol) if (k in o && o[k] !== undefined) vol[k] = k === 'muted' ? !!o[k] : Math.min(1, Math.max(0, +o[k] || 0)); applyVolumes(); persist(); }),
  get: () => Object.assign({}, vol),
  /* anciens générateurs bas niveau (compatibles) */
  tone: SAFE((f, dur = 0.3, type = 'sine', v = 0.08, delay = 0, slide = 0) => { if (A.ctx) coreTone(f, dur, { wave: type, vol: v, delay, slide, a: 0.012 }); }),
  noise: SAFE((dur = 0.2, v = 0.1, freq = 1200, q = 0.8, delay = 0, type = 'bandpass') => { if (A.ctx) coreNoise(dur, { vol: v, cut: freq, q, delay, ftype: type }); }),
  chime(f, dur = 0.3, type = 'sine') { this.tone(f, dur, type, 0.07); this.tone(f * 2, dur * 0.6, 'sine', 0.02); },
  chord(fs, step = 0.09) { (fs || []).forEach((f, i) => { this.tone(f, 0.9, 'sine', 0.06, i * step); this.tone(f * 2, 0.5, 'triangle', 0.015, i * step); }); },
  sfx: SAFE((name, opts) => { if (!A.ctx) return; if (A.ctx.state !== 'running') ensure(); play(String(name), opts); }),
  step(ground, opts) { this.sfx('step_' + (ground || 'herbe'), Object.assign({ ground }, opts)); },
  note(color, opts) { this.sfx('note_' + (color || 'w'), opts); },
  music,
  ambience: SAFE((spec) => { if (A.ctx) { ambInit(); } setAmbience(spec, false); }),
  bossPhase(n) { music(n >= 3 ? 'boss3' : n >= 2 ? 'boss2' : 'boss', 1); },
  listener: (x, z, yaw, y) => { L.on = true; L.x = x; L.z = z; L.yaw = yaw || 0; L.y = y || 0; },   /* ALTITUDE : y = sol sous l'auditeur */
  /* diagnostic / tests */
  info: () => Object.assign({ state: A.ctx ? A.ctx.state : 'none', voices: A.active, low: A.low }, musicInfo(), { ambience: ambienceInfo() }),
  names: () => names(),
  themes: () => themes(),
  presets: () => presets(),
};
