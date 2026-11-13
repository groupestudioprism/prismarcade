/* =========================================================
   LUMEN — ambiances : couches continues (vent, eau, brume,
   résonance, feu, insectes) et événements aléatoires (oiseaux,
   gouttes, craquements, pluie de verre, lointain).
   ========================================================= */
import { A, tone, noise, clamp, mtof, dest } from './core.js';

const PRE = {
  none: {},
  title: { wind: 0.25, birds: 0.1, distant: 0.3 },
  village: { wind: 0.2, birds: 0.6, insects: 0.15, water: 0.15, distant: 0.2 },
  puzzle: { wind: 0.1, hum: 0.2 },
  lande: { wind: 0.8, mist: 0.4, distant: 0.4, insects: 0.1 },
  sanctuaire: { wind: 0.3, mist: 0.8, hum: 0.5, distant: 0.3 },
  foret: { wind: 0.3, birds: 0.3, glassrain: 0.5, water: 0.2, insects: 0.2, mist: 0.2 },
  vitrebourg: { wind: 0.15, birds: 0.3, glassrain: 0.25, water: 0.4 },
  lisiere: { wind: 0.5, mist: 0.6, birds: 0.15, insects: 0.3 },
  temple: { hum: 0.8, water: 0.3, mist: 0.3, distant: 0.2 },
  canopee: { wind: 0.7, birds: 0.4, glassrain: 0.3, distant: 0.2 },
  phare: { wind: 0.5, glassrain: 0.4, distant: 0.3, hum: 0.2 },
  interieur: { fire: 0.6, wind: 0.04 },
  combat: { wind: 0.15 }, boss: { hum: 0.3 }, boss2: { hum: 0.4 }, victoire: { birds: 0.4, wind: 0.1 },
};
/* ACTE VI */
Object.assign(PRE, {
  zenith: { wind: 0.5, birds: 0.1, distant: 0.5, hum: 0.15 }, jardins: { wind: 0.3, birds: 0.5, insects: 0.2, water: 0.2, distant: 0.3 }, salle: { hum: 0.6, wind: 0.1, distant: 0.2 },
  phare_zenith: { wind: 0.5, hum: 0.3, distant: 0.5 }, boss3: { hum: 0.5, wind: 0.2 }, epilogue: { wind: 0.25, birds: 0.35, distant: 0.5 }, generique: { wind: 0.2, birds: 0.2, distant: 0.4 },
});
const KEYS = ['wind', 'water', 'mist', 'hum', 'fire', 'insects', 'birds', 'glassrain', 'distant'];
let base = {}, over = {}, manual = false, lay = null, timer = null, restore = 0.5, pending = null;

function loopSrc(buf) { const s = A.ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s; }
function lfo(f, depth, target) { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.value = f; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); return o; }

function build() {
  const ctx = A.ctx, L = {};
  const mk = () => { const g = ctx.createGain(); g.gain.value = 0; g.connect(A.out.amb); return g; };
  /* vent */
  { const g = mk(), f = ctx.createBiquadFilter(), s = loopSrc(A.pink); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.5; const sw = ctx.createGain(); sw.gain.value = 0.65; lfo(0.11, 0.35, sw.gain); s.connect(f); f.connect(sw); sw.connect(g); lfo(0.06, 260, f.frequency); s.start(); L.wind = { g, k: 0.55 }; }
  /* eau courante */
  { const g = mk(), f = ctx.createBiquadFilter(), s = loopSrc(A.pink); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.4; s.connect(f); f.connect(g); lfo(0.35, 300, f.frequency); s.start(); L.water = { g, k: 0.3 }; }
  /* brume : souffle sombre + deux sinus battants */
  { const g = mk(), f = ctx.createBiquadFilter(), s = loopSrc(A.pink); f.type = 'lowpass'; f.frequency.value = 700; s.connect(f); f.connect(g); lfo(0.05, 250, f.frequency);
    [98, 98.4, 147.2].forEach((fr) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = fr; og.gain.value = 0.05; o.connect(og); og.connect(g); o.start(); }); s.start(); L.mist = { g, k: 0.35 }; }
  /* résonance du temple : accord de sinus lents + battements */
  { const g = mk(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; f.connect(g);
    [55, 55.35, 82.4, 110.6, 164.9].forEach((fr, i) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = i > 2 ? 'sine' : 'triangle'; o.frequency.value = fr; og.gain.value = 0.07 / (1 + i * 0.5); o.connect(og); og.connect(f); lfo(0.04 + i * 0.013, og.gain.value * 0.6, og.gain); o.start(); }); L.hum = { g, k: 1 }; }
  /* feu : grondement doux (les craquements sont des événements) */
  { const g = mk(), f = ctx.createBiquadFilter(), s = loopSrc(A.pink); f.type = 'lowpass'; f.frequency.value = 260; s.connect(f); f.connect(g); lfo(3.1, 80, f.frequency); s.start(); L.fire = { g, k: 0.35 }; }
  /* insectes : trilles à modulation d'amplitude */
  { const g = mk(), am = ctx.createGain(); am.gain.value = 0; am.connect(g);
    [4300, 5100].forEach((fr, i) => { const o = ctx.createOscillator(); o.frequency.value = fr; o.connect(am); o.start(); lfo(24 + i * 6, 0.5, am.gain); });
    const hp = ctx.createGain(); hp.gain.value = 0.014; am.disconnect(); am.connect(hp); hp.connect(g); L.insects = { g, k: 1 }; }
  /* couches événementielles : simple gain de niveau */
  for (const k of ['birds', 'glassrain', 'distant']) L[k] = { g: null, k: 1, ev: true, lvl: 0 };
  return L;
}

function target(k) { const v = over[k] !== undefined ? over[k] : base[k]; return v || 0; }
function refresh() {
  if (!lay) return;
  const t = A.ctx.currentTime;
  for (const k of KEYS) {
    const l = lay[k]; if (!l) continue;
    let v = clamp(target(k), 0, 1.5);
    if (k === 'birds' || k === 'insects') v *= 0.35 + 0.65 * restore; /* le monde s'anime à mesure qu'il se rallume */
    if (l.ev) l.lvl = v; else l.g.gain.setTargetAtTime(v * l.k * 0.5, t, 1.6);
  }
}

/* Événements aléatoires, cadencés par un minuteur de 250 ms. */
function ev(dt) {
  if (!lay || A.low && Math.random() < 0.4) return;
  const r = Math.random, lv = (k) => (lay[k] ? lay[k].lvl : 0), out = () => dest(A.out.amb, { pan: (r() * 2 - 1) * 0.8 });
  if (lv('birds') > 0.01 && r() < dt * 0.35 * lv('birds')) {
    const o = out(); if (o) { const n = 1 + Math.floor(r() * 4), f0 = 2200 + r() * 2400, up = r() < 0.5 ? 1.5 : 0.7; for (let i = 0; i < n; i++) tone(f0 * (1 + i * 0.04), 0.07 + r() * 0.05, { mus: true, wave: 'sine', vol: 0.014 * Math.min(1.5, lv('birds') + 0.3), delay: i * 0.11, slide: up, out: o, rev: 0.2, a: 0.008 }); }
  }
  if ((lay.water && target('water') > 0.05 || target('hum') > 0.3) && r() < dt * (0.2 + 0.4 * target('water') + 0.25 * target('hum'))) {
    const o = out(); const f = 500 + r() * 900; if (o) tone(f, 0.12, { mus: true, wave: 'sine', vol: 0.02, slide: 1.8, out: o, rev: 0.8, a: 0.004 });
  }
  if (target('fire') > 0.05 && r() < dt * (6 + 10 * target('fire'))) { const o = out(); if (o) noise(0.02 + r() * 0.05, { mus: true, vol: 0.03 * target('fire') + 0.01, cut: 1500 + r() * 3500, q: 1.5, ftype: 'bandpass', out: o }); }
  if (lv('glassrain') > 0.01 && r() < dt * 7 * lv('glassrain')) {
    const o = out(); if (o) tone(mtof(88 + Math.floor(r() * 18)), 0.35 + r() * 0.3, { mus: true, wave: 'sine', vol: 0.008 + r() * 0.01, out: o, rev: 0.9, a: 0.002 });
  }
  if (lv('distant') > 0.01 && r() < dt * 0.07 * lv('distant')) {
    const o = out(); if (o) { const f = [110, 146.8, 164.8, 196][Math.floor(r() * 4)]; tone(f, 3.2, { mus: true, wave: 'triangle', vol: 0.025, a: 1.2, r: 2, out: o, rev: 1, cut: 700 }); tone(f * 1.5, 3, { mus: true, wave: 'sine', vol: 0.012, a: 1.5, r: 2, out: o, rev: 1 }); }
  }
}
let lastT = 0;
function loop() {
  if (!A.ctx) return; const t = A.ctx.currentTime, dt = Math.min(1, t - (lastT || t)); lastT = t;
  if (A.ctx.state === 'running') ev(dt);
}

export function init() {
  if (!A.ctx || lay) return;
  lay = build(); if (!timer) timer = setInterval(loop, 250);
  if (pending) { const p = pending; pending = null; setAmbience(p.spec, p.auto); }
  refresh();
}
export function setRestore(r) { if (typeof r === 'number' && isFinite(r) && Math.abs(r - restore) > 0.02) { restore = clamp(r, 0, 1); refresh(); } }

/* spec : nom de préset | objet {couche: niveau} (fusion) | null (retour au suivi automatique du thème) */
export function setAmbience(spec, auto) {
  if (!A.ctx || !lay) { pending = { spec, auto }; return; }
  if (spec === null || spec === 'auto') { manual = false; over = {}; }
  else if (typeof spec === 'string') {
    const p = PRE[spec]; if (!p) return;
    if (auto) { if (manual) return; base = Object.assign({}, p); } else { manual = true; base = Object.assign({}, p); over = {}; }
  } else if (spec && typeof spec === 'object') {
    for (const k of Object.keys(spec)) { if (!KEYS.includes(k)) continue; if (spec[k] === null) delete over[k]; else over[k] = +spec[k] || 0; }
  }
  refresh();
}
export const ambienceInfo = () => ({ base, over, manual });
export const presets = () => Object.keys(PRE);
