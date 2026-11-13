/* =========================================================
   LUMEN — musique générative synthétisée.
   Chaque thème = tonalité + gamme + grille d'accords + couches
   (nappe, basse, arpège, mélodie, percussions, cloches).
   Un planificateur à l'avance joue les notes ; les mélodies
   dérivent d'un motif graine qui évolue lentement.
   ========================================================= */
import { DESERT_SCALE, DESERT_TH } from './desert-audio.js';   /* ACTE III */
import { A, vol, tone, noise, mtof, clamp, rng, hash, state } from './core.js';

const SC = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], lyd: [0, 2, 4, 6, 7, 9, 11], mix: [0, 2, 4, 5, 7, 9, 10], phr: [0, 1, 3, 5, 7, 8, 10], pent: [0, 2, 4, 7, 9], mpent: [0, 3, 5, 7, 10] };
const CH = { M: [0, 4, 7], m: [0, 3, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], s2: [0, 2, 7], s4: [0, 5, 7], d: [0, 3, 6], M9: [0, 4, 7, 14], m9: [0, 3, 7, 14], D7: [0, 4, 7, 10], '5': [0, 7, 12] };
const RH16 = [[0, 3, 6, 8, 11], [0, 2, 4, 7, 10, 12], [0, 4, 8, 10, 12], [0, 3, 4, 8, 11, 14], [2, 4, 8, 12], [0, 6, 8, 14], [0, 2, 3, 6, 10, 12, 14], [0, 4, 6, 8, 12]];
const RH12 = [[0, 4, 8], [0, 3, 6, 8], [0, 6, 8, 10], [0, 2, 4, 6, 8]];

/* Définitions de thèmes ------------------------------------------------ */
const TH = {
  title: { bpm: 66, root: 50, sc: 'lyd', floor: 0.6, bpc: 2, prog: [[0, 'M9'], [9, 'm7'], [5, 'M7'], [7, 's2']],
    pad: { wave: 'sawtooth', vol: 0.016, cut: 900, cutTo: 1700, oct: 0 }, bass: { pat: '0...............', wave: 'sine', vol: 0.13, min: 0.1 },
    arp: { pat: '0123210132', every: 2, wave: 'sine', vol: 0.035, dec: 0.9, oct: 1, rev: 0.7, min: 0 },
    mel: { wave: 'triangle', vol: 0.045, cut: 2400, vib: 6, rev: 0.7, density: 0.7, rest: 0.35, lo: 7, hi: 16, min: 0.15 }, bell: { p: 0.1, vol: 0.03, min: 0.3 } },
  village: { bpm: 92, root: 55, sc: 'maj', floor: 0.4, bpc: 2, swing: 0.1, prog: [[0, 'M'], [9, 'm7'], [5, 'M7'], [7, 'M']],
    pad: { wave: 'triangle', vol: 0.03, cut: 1300, oct: 0 }, bass: { pat: '0...5...0.5.3...', wave: 'triangle', vol: 0.15, cut: 700, min: 0.1 },
    arp: { pat: '01210212', every: 2, wave: 'triangle', vol: 0.05, dec: 0.3, oct: 1, rev: 0.25, min: 0 },
    mel: { wave: 'sine', vol: 0.07, cut: 3000, vib: 5, rev: 0.4, density: 0.85, rest: 0.25, lo: 7, hi: 15, min: 0.1 },
    perc: { shaker: '.o.o.o.o.o.o.o.x', wood: 'x.....o...x.....', kick: 'x.......x.......', kmin: 0.5, hmin: 0.15, wmin: 0.3 }, bell: { p: 0.05, vol: 0.03, min: 0.7 } },
  puzzle: { bpm: 72, root: 45, sc: 'dor', floor: 0.15, bpc: 2, prog: [[0, 'm9'], [8, 'M7'], [3, 'M9'], [10, 's2']],
    pad: { wave: 'triangle', vol: 0.03, cut: 900, cutTo: 1400, oct: 1 }, bass: { pat: '0...............', wave: 'sine', vol: 0.12, min: 0.2 },
    arp: { pat: '01232103', every: 3, wave: 'sine', vol: 0.05, dec: 0.5, oct: 1, rev: 0.6, min: 0.12, p: 0.85 },
    mel: { wave: 'sine', vol: 0.05, cut: 2200, vib: 4, rev: 0.7, density: 0.5, rest: 0.5, lo: 7, hi: 14, min: 0.5, every: 2 },
    perc: { wood: 'x...........o...', wmin: 0.75 }, bell: { p: 0.12, vol: 0.035, min: 0.3 } },
  lande: { bpm: 60, root: 50, sc: 'min', floor: 0.3, bpc: 2, prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']],
    pad: { wave: 'sawtooth', vol: 0.016, cut: 650, cutTo: 1100, oct: 0 }, bass: { pat: '0...............', wave: 'sine', vol: 0.15, min: 0 },
    arp: { pat: '0210', every: 4, wave: 'triangle', vol: 0.04, dec: 0.8, oct: 1, rev: 0.8, min: 0.45 },
    mel: { wave: 'sine', vol: 0.06, cut: 1800, vib: 9, rev: 0.8, density: 0.5, rest: 0.45, lo: 7, hi: 15, min: 0.2 },
    perc: { tom: 'x...............', tmin: 0.6, shaker: '..........o.....', hmin: 0.8 }, bell: { p: 0.05, vol: 0.03, min: 0.5 } },
  sanctuaire: { bpm: 52, root: 50, sc: 'phr', floor: 0.25, bpc: 2, prog: [[0, 'm'], [1, 'M7'], [8, 'M'], [7, 'd']],
    pad: { wave: 'sawtooth', vol: 0.014, cut: 500, cutTo: 900, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.15, min: 0 },
    arp: { pat: '0213', every: 6, wave: 'sine', vol: 0.04, dec: 1.2, oct: 2, rev: 0.9, min: 0.3, p: 0.7 },
    mel: { wave: 'sine', vol: 0.045, cut: 1500, vib: 12, rev: 0.9, density: 0.4, rest: 0.55, lo: 7, hi: 14, min: 0.55 },
    perc: { kick: 'x.....o.........', kmin: 0.5 }, bell: { p: 0.12, vol: 0.04, min: 0.2 } },
  foret: { bpm: 84, root: 52, sc: 'lyd', floor: 0.35, bpc: 2, prog: [[0, 'M9'], [2, 'M'], [9, 'm7'], [7, 's4']],
    pad: { wave: 'triangle', vol: 0.03, cut: 2000, oct: 1 }, bass: { pat: '0.......5.......', wave: 'sine', vol: 0.12, min: 0.15 },
    arp: { pat: '02130231', every: 2, wave: 'glass', vol: 0.04, dec: 0.7, oct: 1, rev: 0.6, min: 0 },
    mel: { wave: 'glass', vol: 0.05, cut: 4000, vib: 0, rev: 0.7, density: 0.7, rest: 0.4, lo: 8, hi: 16, min: 0.35 },
    perc: { shaker: 'o.o.o.o.o.o.o.o.', hmin: 0.5, wood: '..x.......x.....', wmin: 0.6 }, bell: { p: 0.15, vol: 0.035, min: 0.2 } },
  vitrebourg: { bpm: 104, root: 53, sc: 'maj', floor: 0.55, bpc: 2, swing: 0.08, prog: [[0, 'M'], [9, 'm7'], [2, 'm7'], [7, 'D7']],
    pad: { wave: 'triangle', vol: 0.028, cut: 2000, oct: 0 }, bass: { pat: '0..5..0.3..5.0..', wave: 'triangle', vol: 0.15, cut: 800, min: 0 },
    arp: { pat: '01210232', every: 2, wave: 'glass', vol: 0.045, dec: 0.35, oct: 1, rev: 0.35, min: 0 },
    mel: { wave: 'triangle', vol: 0.06, cut: 3200, vib: 4, rev: 0.4, density: 0.9, rest: 0.2, lo: 8, hi: 16, min: 0.1 },
    perc: { kick: 'x.....x...x.....', snare: '........x.......', shaker: 'x.xox.xox.xox.xo', kmin: 0.5, smin: 0.7, hmin: 0.2 }, bell: { p: 0.12, vol: 0.035, min: 0.4 } },
  lisiere: { bpm: 70, root: 48, sc: 'mix', floor: 0.3, bpc: 2, prog: [[0, 'M'], [10, 'M'], [5, 'M9'], [0, 's4']],
    pad: { wave: 'sawtooth', vol: 0.014, cut: 800, cutTo: 1500, oct: 0 }, bass: { pat: '0...............', wave: 'sine', vol: 0.13, min: 0.1 },
    arp: { pat: '0120', every: 4, wave: 'triangle', vol: 0.04, dec: 0.7, oct: 1, rev: 0.7, min: 0.35 },
    mel: { wave: 'sine', vol: 0.06, cut: 2200, vib: 8, rev: 0.8, density: 0.55, rest: 0.4, lo: 7, hi: 15, min: 0.15 },
    perc: { tom: 'x.......o.......', tmin: 0.65, shaker: '..o...o...o...o.', hmin: 0.5 }, bell: { p: 0.08, vol: 0.03, min: 0.4 } },
  temple: { bpm: 58, root: 49, sc: 'phr', floor: 0.2, bpc: 2, prog: [[0, 'm'], [1, 'M'], [0, 'm7'], [10, 'M']],
    pad: { wave: 'sawtooth', vol: 0.013, cut: 450, cutTo: 800, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.14, min: 0.1 },
    arp: { pat: '0231', every: 6, wave: 'sine', vol: 0.045, dec: 1.4, oct: 2, rev: 1, min: 0.2, p: 0.8 },
    mel: { wave: 'glass', vol: 0.04, cut: 3000, vib: 0, rev: 1, density: 0.35, rest: 0.55, lo: 8, hi: 15, min: 0.55 },
    perc: { gong: 'x...............', gmin: 0.45 }, bell: { p: 0.1, vol: 0.04, min: 0.15 } },
  canopee: { bpm: 96, root: 57, sc: 'lyd', floor: 0.5, bpc: 2, swing: 0.06, prog: [[0, 'M9'], [2, 'M'], [7, 'M7'], [9, 'm7']],
    pad: { wave: 'triangle', vol: 0.028, cut: 2400, oct: 0 }, bass: { pat: '0.....5.0.....5.', wave: 'triangle', vol: 0.13, cut: 700, min: 0.1 },
    arp: { pat: '02130231', every: 2, wave: 'glass', vol: 0.04, dec: 0.5, oct: 1, rev: 0.5, min: 0 },
    mel: { wave: 'sine', vol: 0.065, cut: 3200, vib: 6, rev: 0.6, density: 0.85, rest: 0.3, lo: 8, hi: 16, min: 0.1 },
    perc: { shaker: 'x.o.x.o.x.o.x.o.', wood: '..x.......x.x...', hmin: 0.3, wmin: 0.5, tom: 'x...............', tmin: 0.75 }, bell: { p: 0.15, vol: 0.035, min: 0.3 } },
  phare: { bpm: 80, root: 50, sc: 'maj', floor: 0.55, bpc: 2, prog: [[0, 'M9'], [7, 'M'], [9, 'm7'], [5, 'M9']],
    pad: { wave: 'triangle', vol: 0.034, cut: 2200, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.14, min: 0 },
    arp: { pat: '01230321', every: 2, wave: 'glass', vol: 0.04, dec: 0.9, oct: 1, rev: 0.8, min: 0 },
    mel: { wave: 'glass', vol: 0.06, cut: 4000, vib: 0, rev: 0.9, density: 0.8, rest: 0.3, lo: 8, hi: 17, min: 0.1 },
    perc: { kick: 'x.......x.......', tom: '................', kmin: 0.7, shaker: '..o...o...o...o.', hmin: 0.6 }, bell: { p: 0.3, vol: 0.045, min: 0 } },
  interieur: { bpm: 96, root: 48, sc: 'maj', floor: 0.45, bpc: 2, steps: 12, prog: [[0, 'M'], [9, 'm7'], [5, 'M7'], [7, 'D7']],
    pad: { wave: 'triangle', vol: 0.022, cut: 1100, oct: 0 }, bass: { pat: '0.....5.....', wave: 'triangle', vol: 0.14, cut: 600, min: 0 },
    arp: { pat: '012121', every: 2, wave: 'triangle', vol: 0.05, dec: 0.35, oct: 1, rev: 0.3, min: 0 },
    mel: { wave: 'sine', vol: 0.06, cut: 2500, vib: 5, rev: 0.4, density: 0.85, rest: 0.3, lo: 7, hi: 14, min: 0.35 },
    perc: { wood: 'x.....o.....', wmin: 0.7 }, bell: { p: 0.06, vol: 0.03, min: 0.6 } },
  combat: { bpm: 140, root: 45, sc: 'min', floor: 0.75, bpc: 1, prog: [[0, 'm'], [8, 'M'], [10, 'M'], [7, 'm']],
    pad: { wave: 'sawtooth', vol: 0.016, cut: 900, oct: 0 }, bass: { pat: '0.0.0.0.0.0.0.0.', wave: 'sawtooth', vol: 0.11, cut: 500, min: 0 },
    arp: { pat: '0213', every: 2, wave: 'sawtooth', vol: 0.025, dec: 0.15, oct: 1, cut: 2200, rev: 0.15, min: 0.35 },
    mel: { wave: 'sawtooth', vol: 0.035, cut: 2600, vib: 4, rev: 0.25, density: 0.8, rest: 0.2, lo: 8, hi: 15, min: 0.5 },
    perc: { kick: 'x...x...x...x..o', snare: '....x.......x...', shaker: 'x.x.x.x.x.x.x.xx', kmin: 0, smin: 0.2, hmin: 0.35 }, bell: null },
  boss: { bpm: 118, root: 50, sc: 'phr', floor: 0.85, bpc: 1, prog: [[0, 'm'], [0, 'm'], [8, 'M'], [7, 'M']],
    pad: { wave: 'sawtooth', vol: 0.02, cut: 700, oct: 0, sub: true }, bass: { pat: '0..0..0.0..0.5.0', wave: 'sawtooth', vol: 0.12, cut: 450, min: 0 },
    arp: { pat: '0123', every: 1, wave: 'sawtooth', vol: 0.018, dec: 0.12, oct: 1, cut: 1800, rev: 0.1, min: 0.6, p: 0.9 },
    mel: { wave: 'sawtooth', vol: 0.04, cut: 2000, vib: 5, rev: 0.4, density: 0.75, rest: 0.25, lo: 7, hi: 14, min: 0.3 },
    perc: { kick: 'x..x..x...x.x...', snare: '........x.......', tom: '..x...x...x...xx', kmin: 0, smin: 0.3, tmin: 0.5, shaker: 'x.x.x.x.x.x.x.x.', hmin: 0.6 }, bell: null },
  boss2: { bpm: 150, root: 50, sc: 'phr', floor: 1, bpc: 1, prog: [[0, 'm'], [1, 'M'], [0, 'm'], [6, 'd']],
    pad: { wave: 'sawtooth', vol: 0.024, cut: 1000, oct: 0, sub: true }, bass: { pat: '0.0.0.00.0.0.0.0', wave: 'sawtooth', vol: 0.12, cut: 600, min: 0 },
    arp: { pat: '01232103', every: 1, wave: 'sawtooth', vol: 0.02, dec: 0.1, oct: 1, cut: 2600, rev: 0.1, min: 0 },
    mel: { wave: 'sawtooth', vol: 0.045, cut: 2600, vib: 6, rev: 0.35, density: 0.9, rest: 0.1, lo: 9, hi: 17, min: 0 },
    perc: { kick: 'x...x...x...x.xx', snare: '....x.......x..x', tom: '..x..x..x..x..x.', shaker: 'xxxxxxxxxxxxxxxx', kmin: 0, smin: 0, tmin: 0.3, hmin: 0 }, bell: null },
  victoire: { bpm: 100, root: 48, sc: 'maj', floor: 0.9, bpc: 1, prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M'], [0, 'M9'], [7, 's4'], [5, 'M9'], [0, 'M']],
    pad: { wave: 'triangle', vol: 0.035, cut: 2500, oct: 0 }, bass: { pat: '0...5...0...5...', wave: 'triangle', vol: 0.15, cut: 900, min: 0 },
    arp: { pat: '012321', every: 2, wave: 'triangle', vol: 0.045, dec: 0.4, oct: 1, rev: 0.4, min: 0 },
    mel: { wave: 'triangle', vol: 0.07, cut: 3500, vib: 5, rev: 0.5, density: 0.95, rest: 0.1, lo: 8, hi: 17, min: 0 },
    perc: { kick: 'x.......x.......', shaker: 'x.o.x.o.x.o.x.o.', kmin: 0.4, hmin: 0.1 }, bell: { p: 0.25, vol: 0.04, min: 0 } },
  /* ACTE IV : Les Abysses Miroirs */
  greve: { bpm: 88, root: 53, sc: 'maj', floor: 0.4, bpc: 2, swing: 0.08, prog: [[0, 'M9'], [2, 'm7'], [7, 'M'], [5, 'M7']],
    pad: { wave: 'triangle', vol: 0.03, cut: 1800, oct: 0 }, bass: { pat: '0...5...0...3...', wave: 'sine', vol: 0.13, cut: 700, min: 0.1 },
    arp: { pat: '01230213', every: 2, wave: 'glass', vol: 0.045, dec: 0.5, oct: 1, rev: 0.6, min: 0 },
    mel: { wave: 'sine', vol: 0.06, cut: 3000, vib: 5, rev: 0.6, density: 0.8, rest: 0.3, lo: 8, hi: 16, min: 0.1 },
    perc: { shaker: 'o.o.o.o.o.o.o.o.', hmin: 0.45, wood: '..x.......x.....', wmin: 0.6 }, bell: { p: 0.16, vol: 0.04, min: 0.2 } },
  abysses: { bpm: 62, root: 50, sc: 'lyd', floor: 0.25, bpc: 2, prog: [[0, 'M9'], [7, 'M'], [9, 'm7'], [2, 'M7']],
    pad: { wave: 'sawtooth', vol: 0.013, cut: 500, cutTo: 1000, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.13, min: 0.1 },
    arp: { pat: '0231', every: 4, wave: 'glass', vol: 0.045, dec: 1.2, oct: 2, rev: 1, min: 0.1, p: 0.85 },
    mel: { wave: 'glass', vol: 0.045, cut: 3400, vib: 0, rev: 1, density: 0.4, rest: 0.5, lo: 8, hi: 16, min: 0.4 },
    perc: { gong: 'x...............', gmin: 0.5 }, bell: { p: 0.14, vol: 0.045, min: 0.1 } },
};
/* ACTE III */ Object.assign(SC, DESERT_SCALE); Object.assign(TH, DESERT_TH);
const ALIAS = { grotte: 'abysses', lac: 'abysses', recifs: 'greve', phare_abysses: 'phare', /* ACTE IV */ canopy: 'canopee', lighthouse: 'phare', phare_de_verre: 'phare', menu: 'title', aube: 'village', havre: 'village', sanctuary: 'sanctuaire', forest: 'foret', foretdeverre: 'foret', interior: 'interieur', auberge: 'interieur', boss1: 'boss', boss_phase2: 'boss2', victory: 'victoire', energie: 'puzzle', enigme: 'puzzle', salle: 'puzzle' };

/* Instance de thème --------------------------------------------------- */
let lastNow = 0, cur = null, fading = [], want = null, timer = null, level = 0.5;
const THEME_LEVEL = { v: 0.5 };

class Inst {
  constructor(name, th) {
    const ctx = A.ctx;
    this.name = name; this.th = th; this.steps = th.steps || 16; this.stepDur = 60 / th.bpm / 4; this.barDur = this.stepDur * this.steps;
    this.scale = SC[th.sc]; this.bpc = th.bpc || 1; this.cycleBars = th.prog.length * this.bpc;
    this.fade = ctx.createGain(); this.fade.gain.value = 0.0001; this.fade.connect(A.out.musicDuck);
    this.rev = ctx.createGain(); this.rev.gain.value = 0.0001; this.rev.connect(A.out.rev);
    this.step = 0; this.bar = 0; this.next = ctx.currentTime + 0.08;
    this.r = rng(hash(name) + 7); this.eff = 0.5;
    const pool = this.steps === 12 ? RH12 : RH16;
    this.rhy = pool[Math.floor(this.r() * pool.length)];
    this.rhyB = pool[Math.floor(this.r() * pool.length)];
    this.contour = this.rhy.map(() => [-2, -1, -1, 0, 1, 1, 2][Math.floor(this.r() * 7)]);
    this.contourB = this.rhyB.map(() => [-2, -1, -1, 0, 1, 1, 2][Math.floor(this.r() * 7)]);
    this.melQ = []; this.deg = th.mel ? Math.round((th.mel.lo + th.mel.hi) / 2) : 0;
    this.dead = false;
  }
  fadeIn(s) { const g = this.fade.gain, t = A.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.linearRampToValueAtTime(1, t + s); const r = this.rev.gain; r.cancelScheduledValues(t); r.setValueAtTime(Math.max(0.0001, r.value), t); r.linearRampToValueAtTime(1, t + s); }
  fadeOut(s) { const g = this.fade.gain, t = A.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.linearRampToValueAtTime(0.0001, t + s); const r = this.rev.gain; r.cancelScheduledValues(t); r.setValueAtTime(Math.max(0.0001, r.value), t); r.linearRampToValueAtTime(0.0001, t + s); this.until = t + s + 0.3; }
  kill() { this.dead = true; try { this.fade.disconnect(); this.rev.disconnect(); } catch (e) { /* ignore */ } }
  chord(bar) {
    const th = this.th, [off, q] = th.prog[Math.floor(bar / this.bpc) % th.prog.length];
    const iv = CH[q] || CH.M; return { off, iv, tones: iv.map((i) => th.root + off + i), pcs: iv.map((i) => (off + i) % 12) };
  }
  /* note de gamme (degré entier, peut être négatif) */
  sn(deg) { const n = this.scale.length, o = Math.floor(deg / n); return this.th.root + o * 12 + this.scale[((deg % n) + n) % n]; }
  snapChord(deg, ch) {
    for (const k of [0, 1, -1, 2, -2, 3, -3]) { const pc = (this.sn(deg + k) - this.th.root + 120) % 12; if (ch.pcs.some((p) => p % 12 === pc)) return deg + k; }
    return deg;
  }
  n(f, dur, o) { tone(f, dur, Object.assign({ out: this.fade, revBus: this.rev, mus: true }, o)); }
  /* un pas du séquenceur */
  play(t, s, bar) {
    const th = this.th, ch = this.chord(bar), eff = this.eff, sd = this.stepDur, low = A.low, ph = bar % this.cycleBars, cyc = Math.floor(bar / this.cycleBars);
    const beat = s % 4 === 0;
    /* nappe + changement d'accord */
    if (s === 0 && bar % this.bpc === 0 && th.pad) {
      const P = th.pad, dur = this.barDur * this.bpc, mod = 0.5 + 0.5 * Math.sin(bar * 0.7);
      ch.tones.slice(0, 3 + (eff > 0.5 && ch.tones.length > 3 ? 1 : 0)).forEach((m, i) => {
        const f = mtof(m + 12 * (P.oct || 0));
        for (const d of low ? [0] : [-7, 7]) this.n(f, dur, { wave: P.wave, vol: P.vol * (low ? 1.5 : 1) * (0.7 + eff * 0.5), a: Math.min(1.8, dur * 0.35), r: 1.2, detune: d + i, cut: P.cut * (0.7 + mod * 0.6), cutTo: (P.cutTo || P.cut * 1.2), t0: t, rev: 0.5, prio: true });
      });
      if (P.sub) this.n(mtof(th.root + ch.off - 12), dur, { wave: 'sine', vol: 0.06, a: 1.5, r: 1.5, t0: t, prio: true });
    }
    /* basse */
    const B = th.bass;
    if (B && eff >= B.min) {
      const c = B.pat[s % B.pat.length];
      if (c !== '.' && c !== undefined) {
        let len = 1; while (len < B.pat.length && B.pat[(s + len) % B.pat.length] === '.' && (s + len) % this.steps !== 0) len++;
        const semi = c === '0' ? 0 : c === '5' ? 7 : c === '3' ? ch.iv[1] : c === '8' ? 12 : c === '7' ? (ch.iv[3] || 10) : 0;
        this.n(mtof(th.root + ch.off - 12 + semi), len * sd * 0.92, { wave: B.wave, vol: B.vol * (beat ? 1 : 0.8), a: 0.02, cut: B.cut || 400, q: 1, t0: t, prio: true, r: 0.15 });
      }
    }
    /* arpège */
    const R = th.arp;
    if (R && eff >= R.min && s % R.every === 0 && !(R.p && this.r() > R.p * (0.6 + eff * 0.5))) {
      const k = (Math.floor(s / R.every) + Math.floor(bar * this.steps / R.every) + cyc) % R.pat.length, idx = +R.pat[k], nn = ch.tones.length;
      const m = ch.tones[idx % nn] + 12 * Math.floor(idx / nn) + 12 * (R.oct || 1);
      if (!(low && R.every === 1 && s % 2)) this.glassOrNote(R.wave, mtof(m), R.dec, R.vol * (beat ? 1.15 : 0.9), t, R.rev, R.cut);
    }
    /* mélodie */
    if (th.mel && eff >= th.mel.min) {
      if (s === 0) this.melQ = this.genMel(bar, ch, ph, cyc);
      for (const e of this.melQ) if (e.s === s) { const M = th.mel; this.glassOrNote(M.wave, mtof(e.m), e.d * sd * 0.95, M.vol * (0.85 + eff * 0.3), t, M.rev, M.cut, M.vib, true); }
    }
    /* cloches / scintillements */
    const Bl = th.bell;
    if (Bl && eff >= Bl.min && !low && s % 2 === 0 && this.r() < Bl.p * (0.5 + eff)) {
      const m = ch.tones[Math.floor(this.r() * ch.tones.length)] + 24 + (this.r() < 0.4 ? 12 : 0);
      this.glassOrNote('glass', mtof(m), 1.4, Bl.vol, t, 1, 6000);
    }
    /* percussions */
    const Pc = th.perc;
    if (Pc) {
      const hit = (pat, min, fn) => { if (!pat || eff < (min || 0)) return; const c = pat[s % pat.length]; if (c === 'x' || (c === 'o' && eff > 0.45)) fn(c === 'o' ? 0.5 : 1); };
      hit(Pc.kick, Pc.kmin, (v) => { this.n(150, 0.2, { wave: 'sine', vol: 0.2 * v, slide: 0.3, t0: t, a: 0.002, r: 0.04, prio: true }); noise(0.02, { mus: true, out: this.fade, vol: 0.05 * v, cut: 2500, t0: t, prio: true }); });
      hit(Pc.snare, Pc.smin, (v) => { noise(0.16, { mus: true, out: this.fade, revBus: this.rev, rev: 0.15, vol: 0.09 * v, cut: 1900, q: 0.7, t0: t }); this.n(190, 0.09, { wave: 'triangle', vol: 0.05 * v, slide: 0.6, t0: t }); });
      hit(Pc.shaker || Pc.hat, Pc.hmin, (v) => { if (!low || s % 2 === 0) noise(0.06, { mus: true, out: this.fade, vol: 0.03 * v, cut: 6500, q: 0.6, ftype: 'highpass', a: 0.012, t0: t }); });
      hit(Pc.tom, Pc.tmin, (v) => { this.n(100, 0.45, { wave: 'sine', vol: 0.2 * v, slide: 0.45, t0: t, a: 0.004, rev: 0.3 }); noise(0.2, { mus: true, out: this.fade, vol: 0.05 * v, cut: 300, ftype: 'lowpass', t0: t }); });
      hit(Pc.wood, Pc.wmin, (v) => { this.n(820 + (s % 3) * 60, 0.05, { wave: 'sine', vol: 0.045 * v, t0: t, a: 0.002, r: 0.03 }); });
      hit(Pc.gong, Pc.gmin, () => { this.glassOrNote('glass', mtof(th.root - 12), 3.5, 0.07, t, 1, 1500); });
    }
  }
  /* timbres : 'glass' = verre/cloche inharmonique ; sinon oscillateur filtré (+ vibrato) */
  glassOrNote(wave, f, dur, v, t, rev, cut, vib, sustain) {
    if (wave === 'glass') {
      this.n(f, Math.max(0.25, dur), { wave: 'sine', vol: v, a: 0.004, t0: t, rev: rev || 0.6 });
      this.n(f * 2.76, Math.max(0.15, dur * 0.4), { wave: 'sine', vol: v * 0.25, a: 0.003, t0: t, rev: rev || 0.6 });
      if (!A.low) this.n(f * 4.2, 0.12, { wave: 'sine', vol: v * 0.1, a: 0.002, t0: t });
    } else {
      this.n(f, dur, { wave, vol: v, a: sustain ? 0.03 : 0.006, t0: t, cut: cut || 3000, q: 0.5, rev: rev || 0.3, vib: vib || 0, sustain: sustain ? 0.5 : undefined, r: sustain ? 0.12 : Math.min(0.25, dur * 0.5) });
    }
  }
  /* génération d'une mesure de mélodie à partir du motif graine */
  genMel(bar, ch, ph, cyc) {
    const M = this.th.mel, r = this.r, out = [], last = ph === this.cycleBars - 1, every = M.every || 1;
    if (every > 1 && cyc % every !== every - 1) return out;
    if (!last && ph % 4 === 3 && r() < M.rest) return out;
    if (ph === 0 && bar > 0) { /* mutation lente du motif à chaque cycle */
      const c = r() < 0.5 ? this.contour : this.contourB, i = Math.floor(r() * c.length); c[i] = clamp(c[i] + (r() < 0.5 ? -1 : 1), -3, 3);
    }
    const answer = ph % 2 === 1, rhy = answer ? this.rhyB : this.rhy, con = answer ? this.contourB : this.contour;
    let deg = this.snapChord(this.deg, ch);
    rhy.forEach((st, i) => {
      if (r() > M.density) return;
      deg += con[i] * (i % 2 ? -1 : 1);
      if (deg < M.lo) deg = M.lo + (M.lo - deg); if (deg > M.hi) deg = M.hi - (deg - M.hi);
      if (st % 4 === 0) deg = this.snapChord(deg, ch);
      const next = rhy[i + 1] === undefined ? this.steps : rhy[i + 1];
      out.push({ s: st, m: this.sn(deg), d: Math.max(1, next - st) * (st % 4 === 0 ? 1 : 0.9) });
    });
    this.deg = deg;
    if (last && out.length) { const e = out[out.length - 1]; e.m = this.th.root + ch.off + 12; e.d = Math.max(e.d, 4); }
    return out;
  }
  tick(now, ahead) {
    /* intensité effective : niveau demandé + tension de combat */
    const th = this.th, tens = state.tension;
    this.eff = clamp(Math.max(th.floor, level) + tens * 0.7, 0, 1);
    if (now > this.next + 1.5) { this.next = now + 0.05; } /* onglet gelé : on resynchronise */
    let guard = 0;
    while (this.next < now + ahead && guard++ < 64) {
      const sw = this.step % 2 === 1 ? (th.swing || 0) * this.stepDur : 0;
      this.play(this.next + sw, this.step, this.bar);
      this.next += this.stepDur; this.step++;
      if (this.step >= this.steps) { this.step = 0; this.bar++; }
    }
  }
}

/* Contrôle global ------------------------------------------------------ */
function loop() {
  const ctx = A.ctx; if (!ctx) return;
  const now = ctx.currentTime, ahead = document.hidden ? 1.8 : A.low ? 0.45 : 0.3;
  /* la tension décroît ~8 s après le dernier coup */
  const dt = Math.min(0.5, now - (lastNow || now)); lastNow = now;
  if (state.tension > 0 && now - (state.tensionAt || 0) > 4) state.tension = Math.max(0, state.tension - dt * 0.2);
  if (cur) cur.tick(now, ahead);
  fading = fading.filter((f) => { if (now > f.until) { f.kill(); return false; } f.tick(now, ahead); return true; });
  if (!cur && !fading.length && timer) { clearInterval(timer); timer = null; }
}
function start() { if (!timer) timer = setInterval(loop, 90); }

export function setMusic(theme, lvl) {
  if (typeof lvl === 'number' && isFinite(lvl)) level = clamp(lvl, 0, 1);
  if (theme === undefined) return;
  if (!A.ctx) { want = [theme, level]; return; }
  let name = theme === null || theme === 'none' || theme === 'silence' || theme === false ? null : String(theme).toLowerCase();
  if (name && ALIAS[name]) name = ALIAS[name];
  if (name && !TH[name]) name = 'puzzle';
  if (cur && cur.name === name) return;
  if (!cur && name === null) return;
  const fast = name === 'combat' || name === 'boss' || name === 'boss2' || (cur && (cur.name === 'boss' || cur.name === 'boss2'));
  const secs = name === 'victoire' ? 1.2 : fast ? 1.2 : 2.8;
  if (cur) { cur.fadeOut(secs); fading.push(cur); while (fading.length > 2) fading.shift().kill(); }
  cur = null;
  if (name) { try { cur = new Inst(name, TH[name]); cur.fadeIn(secs); } catch (e) { cur = null; } }
  start();
}
export function flushWanted() { if (want && A.ctx) { const w = want; want = null; setMusic(w[0], w[1]); } }
export const musicInfo = () => ({ theme: cur ? cur.name : null, level, tension: state.tension, eff: cur ? cur.eff : 0, fading: fading.length, bar: cur ? cur.bar : 0 });
export const themes = () => Object.keys(TH);
