/* =========================================================
   LUMEN — bruitages synthétisés. play(nom, opts) ne lève jamais.
   ========================================================= */
import { A, tone, noise, dest, mtof, hash, clamp, bumpTension, duck } from './core.js';

const NOTE = { r: [523.25], g: [659.25], b: [783.99], y: [523.25, 659.25], m: [523.25, 783.99], c: [659.25, 783.99], w: [523.25, 659.25, 783.99] };
const GROUND_ALIAS = { grass: 'herbe', stone: 'pierre', wood: 'bois', water: 'eau', glass: 'verre', dirt: 'terre', sable: 'terre', sand: 'terre', pont: 'bois', plancher: 'bois', parquet: 'bois', rocher: 'pierre', dalle: 'pierre', cristal: 'verre', vitre: 'verre' };

/* Kit passé à chaque définition : sources déjà routées (bus, pan, distance), hauteur variable. */
function kit(o, bus) {
  const out = dest(bus || A.out.sfx, o); if (!out) return null;
  const p = (o.pitch || 1) * (0.95 + Math.random() * 0.1);
  const b = { out, prio: o.prio };
  return {
    p, o,
    T: (f, d = 0.2, wave = 'sine', v = 0.06, delay = 0, slide = 0, x = {}) => tone(f * p, d, Object.assign({ wave, vol: v, delay, slide, out }, x, { prio: o.prio })),
    N: (d = 0.15, v = 0.1, cut = 1200, q = 0.8, delay = 0, ftype = 'bandpass', x = {}) => noise(d, Object.assign({ vol: v, cut: cut * p, q, delay, ftype, out }, x, { prio: o.prio })),
    /* cloche : fondamentale + partiels inharmoniques + réverbération */
    bell: (f, d = 0.9, v = 0.05, delay = 0, rev = 0.5) => { tone(f * p, d, { wave: 'sine', vol: v, delay, out, rev, a: 0.006 }); tone(f * p * 2.76, d * 0.5, { wave: 'sine', vol: v * 0.3, delay, out, rev, a: 0.004 }); tone(f * p * 5.4, d * 0.25, { wave: 'sine', vol: v * 0.1, delay, out, rev }); },
    b,
  };
}

const D = {
  /* --- combat (existants + variantes) --- */
  swing: (k) => k.N(0.16, 0.12, 1800, 1.2, 0, 'bandpass', { cutTo: 900 }),
  swing_lame: (k) => { k.N(0.18, 0.12, 2600, 1.4, 0, 'bandpass', { cutTo: 1100 }); k.T(1800, 0.1, 'sine', 0.012, 0.02, 0.6); },
  swing_lourde: (k) => { k.N(0.34, 0.17, 800, 1, 0, 'bandpass', { cutTo: 300 }); k.T(110, 0.28, 'sine', 0.06, 0, 0.55); },
  swingHeavy: (k) => D.swing_lourde(k),
  swing_distance: (k) => { k.T(180, 0.08, 'triangle', 0.05, 0, 0.5); k.N(0.1, 0.07, 3200, 1, 0.01); k.T(880, 0.18, 'triangle', 0.035, 0.02, 1.7); },
  shoot: (k) => D.swing_distance(k),
  swing_magie: (k) => { k.T(660, 0.4, 'sine', 0.06, 0, 2); k.T(990, 0.3, 'sine', 0.03, 0.04, 1.5); k.T(1320, 0.25, 'triangle', 0.015, 0.07, 1.3, { rev: 0.5 }); },
  magic: (k) => D.swing_magie(k),
  hit: (k) => { k.N(0.1, 0.18, 900, 1.5); k.T(220, 0.12, 'square', 0.03, 0, 0.5); k.T(90, 0.14, 'sine', 0.07, 0, 0.5); },
  hitCrit: (k) => { D.hit(k); k.bell(1568, 0.5, 0.05); k.N(0.2, 0.12, 4200, 2, 0.02); },
  hitBrume: (k) => { k.N(0.2, 0.14, 2400, 2); k.T(660, 0.22, 'sine', 0.04, 0, 0.5); k.T(330, 0.3, 'triangle', 0.03, 0.02, 0.6, { rev: 0.3 }); },
  block: (k) => { k.T(880, 0.14, 'square', 0.03); k.N(0.08, 0.12, 3000, 3); k.bell(1760, 0.4, 0.02, 0.01, 0.2); },
  parry: (k) => D.block(k),
  hurt: (k) => { k.T(300, 0.28, 'sawtooth', 0.05, 0, 0.5, { cut: 1400 }); k.N(0.16, 0.1, 600, 1); k.T(70, 0.2, 'sine', 0.08, 0, 0.6); },
  hurtBig: (k) => { D.hurt(k); k.N(0.4, 0.14, 250, 0.7, 0.02, 'lowpass'); k.T(55, 0.45, 'sine', 0.1, 0, 0.5); },
  death: (k) => { k.T(392, 1.4, 'triangle', 0.06, 0, 0.45, { rev: 0.6 }); k.T(294, 1.6, 'sine', 0.05, 0.25, 0.5, { rev: 0.6 }); k.T(196, 2, 'sine', 0.05, 0.5, 0.6, { rev: 0.6 }); k.N(0.9, 0.06, 500, 0.5, 0, 'lowpass'); },
  dodge: (k) => { k.N(0.24, 0.09, 1400, 0.7, 0, 'lowpass', { cutTo: 400 }); k.N(0.12, 0.04, 3500, 1, 0.02, 'highpass'); },
  onde: (k) => { [523, 659, 784, 1047].forEach((f, i) => k.T(f, 0.6, 'sine', 0.05, i * 0.03, 1, { rev: 0.5 })); k.N(0.6, 0.08, 2000, 0.5, 0, 'bandpass', { cutTo: 6000 }); },
  kill: (k) => { k.T(520, 0.32, 'sine', 0.05, 0, 1.8); k.N(0.3, 0.08, 3000, 1.5); k.bell(1047, 0.7, 0.03, 0.05, 0.6); },
  enemyDie: (k) => D.kill(k),
  impact_verre: (k) => { k.N(0.3, 0.14, 6000, 0.7, 0, 'highpass'); [2637, 3136, 3951, 2093].forEach((f, i) => k.T(f * (1 + Math.random() * 0.03), 0.3, 'sine', 0.02, i * 0.025, 0.9, { rev: 0.4 })); },
  slam: (k) => { k.N(0.7, 0.3, 160, 0.5, 0, 'lowpass'); k.T(60, 0.55, 'sine', 0.13, 0, 0.6); k.N(0.4, 0.1, 700, 0.6, 0.02, 'bandpass', { rev: 0.3 }); },
  roar: (k) => { k.T(90, 0.9, 'sawtooth', 0.05, 0, 0.6, { cut: 500, cutTo: 200 }); k.T(135, 0.8, 'sawtooth', 0.03, 0, 0.55, { cut: 600 }); k.N(0.9, 0.09, 400, 0.6, 0, 'bandpass', { cutTo: 160 }); },
  boss_intro: (k) => { D.roar(k); k.T(55, 2, 'sine', 0.1, 0, 0.8, { rev: 0.5 }); [220, 233, 277].forEach((f, i) => k.T(f, 1.8, 'sawtooth', 0.02, 0.2 + i * 0.1, 0.98, { cut: 700, rev: 0.6 })); },
  boss_phase: (k) => { D.slam(k); D.roar(k); k.T(41, 1.2, 'sine', 0.12, 0, 0.7); },
  /* --- déplacement --- */
  step_herbe: (k) => { k.N(0.09, 0.05, 2400, 0.6, 0, 'bandpass', { pink: true, cutTo: 1400 }); k.N(0.06, 0.05, 6000, 0.5, 0.01, 'highpass', { pink: true }); },
  step_pierre: (k) => { k.N(0.04, 0.07, 3800, 1.2, 0, 'highpass'); k.T(190, 0.07, 'sine', 0.04, 0, 0.6); },
  step_bois: (k) => { k.T(150, 0.09, 'triangle', 0.06, 0, 0.6); k.N(0.07, 0.05, 800, 1.5); k.T(310, 0.05, 'sine', 0.015, 0.005, 0.7); },
  step_eau: (k) => { k.N(0.2, 0.08, 800, 0.9, 0, 'bandpass', { cutTo: 2600 }); k.T(500, 0.12, 'sine', 0.025, 0.02, 1.8); k.T(750, 0.1, 'sine', 0.015, 0.07, 1.6); },
  step_verre: (k) => { k.N(0.05, 0.05, 7000, 0.8, 0, 'highpass'); k.T(2800 + Math.random() * 600, 0.14, 'sine', 0.02, 0, 0.9, { rev: 0.4 }); },
  step_terre: (k) => { k.N(0.1, 0.06, 500, 0.5, 0, 'lowpass', { pink: true }); k.N(0.05, 0.03, 1800, 0.7, 0.01); },
  jump: (k) => { k.T(300, 0.16, 'triangle', 0.04, 0, 2); k.N(0.1, 0.04, 1500, 0.6, 0, 'bandpass', { cutTo: 3000 }); },
  land: (k) => { const h = k.o.hard ? 1.7 : 1; k.N(0.14, 0.09 * h, 500, 0.6, 0, 'lowpass'); k.T(95, 0.14, 'sine', 0.07 * h, 0, 0.6); },
  splash: (k) => { k.N(0.5, 0.14, 1200, 0.6, 0, 'bandpass', { cutTo: 3500 }); k.N(0.3, 0.08, 300, 0.5, 0, 'lowpass'); [600, 900, 1300].forEach((f, i) => k.T(f, 0.12, 'sine', 0.02, 0.05 + i * 0.05, 1.8)); },
  fall: (k) => { k.T(900, 0.9, 'sine', 0.04, 0, 0.18); k.N(0.9, 0.04, 2000, 0.8, 0, 'bandpass', { cutTo: 300 }); },
  /* --- objets / monde --- */
  pickup: (k) => { k.T(784, 0.5, 'sine', 0.06, 0); k.T(1047, 0.5, 'sine', 0.06, 0.06); k.T(1568, 0.3, 'triangle', 0.015, 0.06, 1, { rev: 0.4 }); },
  coin: (k) => { k.T(1318, 0.12, 'square', 0.025); k.T(1760, 0.2, 'square', 0.02, 0.06); k.bell(2637, 0.4, 0.02, 0.06, 0.3); },
  key: (k) => { [880, 1175, 1568].forEach((f, i) => k.bell(f, 0.8, 0.045, i * 0.09, 0.6)); k.N(0.05, 0.05, 5000, 2, 0, 'highpass'); },
  chest: (k) => { k.T(130, 0.35, 'triangle', 0.05, 0, 0.7); k.N(0.25, 0.06, 500, 1.5, 0); [392, 523, 659, 784].forEach((f, i) => { k.T(f, 0.9, 'sine', 0.05, 0.12 + i * 0.07, 1, { rev: 0.4 }); k.T(f * 2, 0.5, 'triangle', 0.012, 0.12 + i * 0.07); }); },
  chestLocked: (k) => { k.T(196, 0.12, 'square', 0.03); k.N(0.05, 0.08, 2500, 3, 0.05); k.T(170, 0.12, 'square', 0.03, 0.12); },
  door: (k) => { k.T(150, 0.45, 'triangle', 0.05, 0, 1.5); k.N(0.45, 0.06, 400, 0.7, 0, 'bandpass', { cutTo: 900 }); k.T(95, 0.3, 'sine', 0.05, 0.3, 0.7); },
  doorOpen: (k) => D.door(k),
  doorClose: (k) => { k.T(180, 0.2, 'triangle', 0.05, 0, 0.5); k.N(0.12, 0.1, 350, 0.8, 0.12, 'lowpass'); k.T(70, 0.2, 'sine', 0.08, 0.14, 0.6); },
  doorLocked: (k) => { k.T(200, 0.1, 'square', 0.03); k.T(200, 0.1, 'square', 0.03, 0.14); k.N(0.05, 0.06, 2000, 3, 0.02); },
  gate: (k) => { k.N(1.2, 0.2, 200, 0.5, 0, 'lowpass', { cutTo: 80 }); k.T(48, 1.2, 'sawtooth', 0.04, 0, 1.3, { cut: 200 }); k.bell(784, 1.2, 0.03, 0.7, 0.7); },
  barrier: (k) => { [1568, 1319, 1047, 784, 659].forEach((f, i) => k.T(f, 0.7, 'sine', 0.035, i * 0.06, 0.9, { rev: 0.7 })); k.N(0.7, 0.07, 6000, 0.6, 0, 'highpass'); },
  secret: (k) => { [523, 622, 784, 1047, 1245].forEach((f, i) => k.bell(f, 1.2, 0.04, i * 0.11, 0.8)); },
  cut: (k) => { k.N(0.18, 0.12, 2600, 1.3); k.N(0.25, 0.06, 500, 0.8, 0.05); k.T(1400, 0.1, 'sine', 0.01, 0, 0.5); },
  break: (k) => { k.N(0.55, 0.25, 300, 0.6, 0, 'lowpass'); k.T(80, 0.4, 'sine', 0.08, 0, 0.5); k.N(0.3, 0.1, 1800, 1.3, 0.04); },
  page: (k) => { k.N(0.18, 0.06, 4000, 0.7, 0, 'bandpass', { cutTo: 1500 }); k.bell(988, 0.8, 0.03, 0.12, 0.6); },
  checkpoint: (k) => { [392, 494, 587].forEach((f, i) => k.bell(f, 1.4, 0.04, i * 0.15, 0.9)); },
  save: (k) => { k.bell(1047, 0.6, 0.035, 0, 0.5); k.bell(1568, 0.8, 0.03, 0.1, 0.5); },
  sparkle: (k) => { for (let i = 0; i < 4; i++) k.T(2000 + Math.random() * 2500, 0.18, 'sine', 0.014, i * 0.05, 0.8, { rev: 0.5 }); },
  fia: (k) => { k.T(1500, 0.07, 'sine', 0.03, 0, 1.4, { vib: 20 }); k.T(1900, 0.09, 'sine', 0.025, 0.08, 0.8); k.T(2300, 0.1, 'sine', 0.02, 0.17, 0.7, { rev: 0.4 }); },
  potion: (k) => { for (let i = 0; i < 3; i++) k.T(350 + i * 60, 0.09, 'sine', 0.04, i * 0.1, 1.9); k.N(0.3, 0.04, 1500, 1, 0.05); },
  heal: (k) => { [659, 880, 1175].forEach((f, i) => k.T(f, 0.9, 'sine', 0.055, i * 0.07, 1, { rev: 0.4 })); k.T(1760, 0.8, 'triangle', 0.012, 0.2, 1, { rev: 0.5 }); },
  lamp: (k) => { k.N(0.25, 0.07, 1200, 0.6, 0, 'bandpass', { cutTo: 3500 }); [880, 1109, 1319].forEach((f, i) => k.T(f, 0.9, 'sine', 0.055, 0.06 + i * 0.06, 1, { rev: 0.4 })); },
  equip: (k) => { k.N(0.06, 0.08, 3000, 3); k.T(420, 0.08, 'triangle', 0.04, 0.02, 1.4); },
  /* --- interface --- */
  ui: (k) => k.T(660, 0.09, 'sine', 0.04),
  uiHover: (k) => k.T(880, 0.04, 'sine', 0.015),
  uiBack: (k) => k.T(440, 0.09, 'sine', 0.035, 0, 0.8),
  uiConfirm: (k) => { k.T(660, 0.08, 'sine', 0.04); k.T(990, 0.14, 'sine', 0.04, 0.06); },
  uiOpen: (k) => { k.T(440, 0.1, 'sine', 0.035, 0, 1.5); k.T(660, 0.14, 'sine', 0.03, 0.05, 1.3); k.N(0.15, 0.03, 4000, 0.8, 0, 'highpass'); },
  uiClose: (k) => { k.T(660, 0.1, 'sine', 0.03, 0, 0.7); k.T(440, 0.14, 'sine', 0.03, 0.05, 0.7); },
  uiTab: (k) => k.T(560 + Math.random() * 80, 0.06, 'triangle', 0.03),
  deny: (k) => { k.T(196, 0.18, 'square', 0.035); k.T(185, 0.2, 'square', 0.03, 0.09); },
  toast: (k) => { k.bell(1319, 0.5, 0.03, 0, 0.3); k.bell(1760, 0.6, 0.025, 0.08, 0.3); },
  banner: (k) => { k.T(220, 1.6, 'sine', 0.05, 0, 1, { rev: 0.7, a: 0.3 }); k.bell(659, 1.4, 0.035, 0.2, 0.8); k.bell(988, 1.6, 0.03, 0.4, 0.8); },
  buy: (k) => { k.T(988, 0.1, 'triangle', 0.05); k.T(1318, 0.15, 'triangle', 0.04, 0.07); k.N(0.04, 0.05, 6000, 2, 0, 'highpass'); },
  sell: (k) => { k.T(1318, 0.1, 'triangle', 0.045); k.T(988, 0.16, 'triangle', 0.04, 0.07); k.N(0.04, 0.05, 6000, 2, 0.06, 'highpass'); },
  /* --- lumière et énigmes --- */
  beam_on: (k) => { k.T(300, 0.5, 'sine', 0.04, 0, 3, { rev: 0.4 }); k.N(0.4, 0.04, 2000, 0.6, 0, 'bandpass', { cutTo: 7000 }); },
  beam_off: (k) => { k.T(900, 0.4, 'sine', 0.03, 0, 0.3); k.N(0.3, 0.03, 5000, 0.6, 0, 'bandpass', { cutTo: 800 }); },
  lantern: (k) => { k.N(0.15, 0.05, 900, 0.8, 0, 'bandpass', { cutTo: 2500 }); k.bell(698, 0.9, 0.04, 0.05, 0.6); },
  mirror: (k) => { k.T(520, 0.18, 'triangle', 0.045); k.T(1040, 0.14, 'sine', 0.015, 0.01); k.N(0.05, 0.04, 4500, 3, 0); },
  rotate: (k) => { k.N(0.12, 0.05, 1200, 2, 0, 'bandpass', { cutTo: 2200 }); k.T(440, 0.12, 'triangle', 0.035, 0, 1.2); },
  prism: (k) => { [1047, 1319, 1568, 2093].forEach((f, i) => k.T(f, 0.6, 'sine', 0.025, i * 0.045, 1, { rev: 0.7 })); k.N(0.4, 0.03, 7000, 0.6, 0, 'highpass'); },
  vitrail: (k) => { [523, 659, 784, 988].forEach((f, i) => { k.T(f, 1.4, 'triangle', 0.025, i * 0.1, 1, { rev: 0.8, a: 0.08 }); }); k.N(0.8, 0.03, 5000, 0.5, 0, 'highpass'); },
  mixer: (k) => { k.T(330, 0.7, 'sine', 0.04, 0, 2.2, { vib: 30, rev: 0.5 }); k.T(495, 0.7, 'sine', 0.035, 0.1, 2.2, { vib: 30, rev: 0.5 }); k.bell(1319, 0.8, 0.03, 0.45, 0.6); },
  receiver: (k) => { const ns = NOTE[k.o.color] || NOTE.w; ns.forEach((f, i) => k.bell(f, 1.3, 0.05, i * 0.04, 0.7)); k.bell((ns[0]) * 2, 1.1, 0.02, 0.1, 0.8); },
  relay: (k) => { const ns = NOTE[k.o.color] || NOTE.w; ns.forEach((f) => k.T(f * 0.5, 0.35, 'triangle', 0.035, 0, 1, { rev: 0.4 })); },
  puzzle_solved: (k) => { [523, 659, 784, 1047, 1319].forEach((f, i) => { k.bell(f, 1.6, 0.045, i * 0.12, 0.9); k.T(f / 2, 1.2, 'triangle', 0.02, i * 0.12, 1, { rev: 0.5 }); }); k.N(1.2, 0.04, 6000, 0.5, 0.3, 'highpass', { a: 0.4 }); },
  /* --- voyage --- */
  portal_open: (k) => { k.T(110, 1.8, 'sawtooth', 0.04, 0, 3, { cut: 400, cutTo: 3000, rev: 0.7, a: 0.6 }); k.T(165, 1.8, 'sine', 0.05, 0.1, 4, { rev: 0.7, a: 0.6 }); [784, 1175, 1568].forEach((f, i) => k.bell(f, 1.6, 0.035, 0.9 + i * 0.1, 0.9)); },
  portal_travel: (k) => { k.N(1.6, 0.12, 400, 0.8, 0, 'bandpass', { cutTo: 8000, a: 0.5 }); k.T(220, 1.6, 'sine', 0.06, 0, 4, { rev: 0.8, a: 0.4 }); k.bell(1568, 1.4, 0.04, 1.1, 0.9); },
  warp: (k) => { D.portal_travel(k); },
  boat: (k) => { k.N(0.5, 0.07, 500, 0.8, 0, 'bandpass', { cutTo: 1500, pink: true }); k.N(0.4, 0.06, 900, 0.8, 0.6, 'bandpass', { pink: true }); k.T(140, 0.3, 'triangle', 0.025, 0.1, 0.8, { cut: 600 }); k.T(120, 0.3, 'triangle', 0.02, 0.7, 0.8, { cut: 600 }); },
  /* --- quêtes --- */
  quest: (k) => { [587, 740, 880, 1175].forEach((f, i) => { k.T(f, 1.0, 'sine', 0.055, i * 0.1, 1, { rev: 0.4 }); k.T(f * 2, 0.5, 'triangle', 0.012, i * 0.1); }); },
  quest_new: (k) => D.quest(k),
  quest_done: (k) => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { k.T(f, 0.7, 'triangle', 0.04, i * 0.1, 1, { rev: 0.5 }); k.T(f * 2, 0.5, 'sine', 0.012, i * 0.1); }); k.bell(2093, 1.4, 0.03, 0.7, 0.9); },
  level: (k) => { [523, 659, 784, 1047, 1318].forEach((f, i) => { k.T(f, 1.1, 'sine', 0.055, i * 0.08, 1, { rev: 0.4 }); k.T(f * 2, 0.5, 'triangle', 0.015, i * 0.08); }); k.bell(2093, 1.5, 0.03, 0.5, 0.9); },
  victory: (k) => { [392, 523, 659, 784, 1047].forEach((f, i) => { k.T(f, 1.4, 'triangle', 0.045, i * 0.18, 1, { rev: 0.6 }); k.T(f / 2, 1.4, 'sine', 0.04, i * 0.18); }); k.bell(1568, 2, 0.04, 0.9, 0.9); },
  defeat: (k) => { [330, 311, 294, 262].forEach((f, i) => k.T(f, 1.2, 'triangle', 0.045, i * 0.3, 0.97, { rev: 0.7 })); },
  /* --- grappin --- */
  grapple_throw: (k) => { k.N(0.22, 0.1, 2500, 1, 0, 'bandpass', { cutTo: 700 }); k.T(500, 0.2, 'triangle', 0.03, 0, 0.5); },
  grapple_hit: (k) => { k.N(0.06, 0.12, 3000, 2); k.T(240, 0.12, 'square', 0.04, 0, 0.5); k.T(1200, 0.2, 'sine', 0.02, 0.02, 0.7); },
  grapple_pull: (k) => { k.N(0.5, 0.07, 600, 1, 0, 'bandpass', { cutTo: 2200 }); k.T(160, 0.5, 'triangle', 0.03, 0, 2.5, { cut: 900 }); },
  rope: (k) => { k.N(0.18, 0.05, 1800 + Math.random() * 500, 3, 0, 'bandpass', { cutTo: 1100 }); },
};
/* ACTE V */
import { SFX_PICS } from './themes-pics.js';
Object.assign(D, SFX_PICS);
/* variantes : couleurs, armes, sols */
for (const c of Object.keys(NOTE)) D['note_' + c] = (k) => { const ns = NOTE[c]; ns.forEach((f, i) => k.bell(f, 1.1, ns.length > 1 ? 0.04 : 0.055, i * 0.025, 0.5)); };
['bois', 'pierre', 'herbe', 'eau', 'verre', 'terre', 'neige'].forEach((g) => { D['hitground_' + g] = D['step_' + g]; });
D.step = (k) => { const g = GROUND_ALIAS[k.o.ground] || k.o.ground; (D['step_' + g] || D.step_herbe)(k); };
D.swingWeapon = (k) => (D['swing_' + k.o.weapon] || D.swing)(k);
D.attack = D.swingWeapon;
D.uiPage = D.uiTab; D.gong = (k) => { k.bell(110, 3, 0.1, 0, 0.9); k.N(1.5, 0.05, 300, 0.6, 0, 'lowpass'); };

/* Blip de dialogue : timbre et hauteur propres à chaque personnage. */
function talk(k, o) {
  const h = hash(o.voice || 'default'), base = 150 + (h % 310), wave = ['triangle', 'square', 'sawtooth', 'sine'][(h >>> 8) % 4];
  const f = base * (0.9 + Math.random() * 0.35), d = 0.04 + ((h >>> 12) % 4) * 0.01;
  tone(f, d, { wave, vol: wave === 'sine' ? 0.05 : 0.022, out: k.b.out, cut: 900 + ((h >>> 4) % 1800), q: 1.5, a: 0.006, r: 0.025 });
  if ((h >>> 16) % 3 === 0) tone(f * 1.5, d * 0.8, { wave: 'sine', vol: 0.012, delay: 0.02, out: k.b.out });
}

export function play(name, o) {
  o = o || {};
  if (!A.ctx) return;
  const isVoice = name === 'talk' || name === 'voice';
  const k = kit(o, isVoice ? A.out.voice : A.out.sfx); if (!k) return;
  if (isVoice) { talk(k, o); duck(0.72, 1.4); return; }
  if (name === 'swing' && o.weapon && D['swing_' + o.weapon]) name = 'swing_' + o.weapon;
  const fn = D[name];
  if (!fn) { k.T(600, 0.1, 'sine', 0.03); return; }
  if (/^(swing|hit|hurt|kill|parry|block|enemyDie|slam|roar|dodge|impact|onde|magic|shoot|death)/.test(name)) bumpTension(/^(slam|roar|hurtBig|death)/.test(name) ? 0.9 : 0.6);
  fn(k, o);
}
export const names = () => Object.keys(D).concat(['talk', 'voice']);
export { clamp, mtof };
