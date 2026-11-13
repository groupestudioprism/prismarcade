/* =========================================================
   LUMEN — Acte V (Les Pics du Vent) : thèmes musicaux, ambiances et bruitages.
   Fusionnés par une ligne dans music.js (TH), ambience.js (PRE) et sfx.js (D).
   ========================================================= */
export const TH_PICS = {
  /* thème générique de l'île : gamme lydienne, cordes de vent, cloches claires */
  pics: { bpm: 76, root: 47, sc: 'lyd', floor: 0.35, bpc: 2, prog: [[0, 'M9'], [7, 's4'], [9, 'm7'], [5, 'M7']],
    pad: { wave: 'triangle', vol: 0.03, cut: 1800, cutTo: 2600, oct: 1, sub: true }, bass: { pat: '0.......5.......', wave: 'sine', vol: 0.12, min: 0.1 },
    arp: { pat: '0231', every: 3, wave: 'glass', vol: 0.04, dec: 0.9, oct: 1, rev: 0.8, min: 0 },
    mel: { wave: 'sine', vol: 0.055, cut: 3200, vib: 6, rev: 0.8, density: 0.6, rest: 0.4, lo: 8, hi: 17, min: 0.2 },
    perc: { shaker: '..o...o...o...o.', hmin: 0.6 }, bell: { p: 0.14, vol: 0.035, min: 0.2 } },
  /* le Col : village, plus chaleureux */
  col: { bpm: 96, root: 52, sc: 'mix', floor: 0.45, bpc: 2, swing: 0.08, prog: [[0, 'M'], [10, 'M'], [5, 'M7'], [7, 'M']],
    pad: { wave: 'triangle', vol: 0.028, cut: 1600, oct: 0 }, bass: { pat: '0..5..0.3..5.0..', wave: 'triangle', vol: 0.14, cut: 700, min: 0 },
    arp: { pat: '01210232', every: 2, wave: 'triangle', vol: 0.045, dec: 0.35, oct: 1, rev: 0.35, min: 0 },
    mel: { wave: 'triangle', vol: 0.06, cut: 3000, vib: 4, rev: 0.45, density: 0.85, rest: 0.25, lo: 8, hi: 16, min: 0.1 },
    perc: { wood: 'x.....o...x.....', wmin: 0.4, shaker: 'x.o.x.o.x.o.x.o.', hmin: 0.3, kick: 'x.......x.......', kmin: 0.6 }, bell: { p: 0.1, vol: 0.03, min: 0.5 } },
  /* le moulin : grondement de meule, tons mineurs */
  moulins: { bpm: 62, root: 46, sc: 'dor', floor: 0.3, bpc: 2, prog: [[0, 'm'], [8, 'M'], [3, 'M7'], [10, 'M']],
    pad: { wave: 'sawtooth', vol: 0.014, cut: 550, cutTo: 950, oct: 0, sub: true }, bass: { pat: '0...0...5...0...', wave: 'sine', vol: 0.15, min: 0 },
    arp: { pat: '0213', every: 4, wave: 'sine', vol: 0.04, dec: 1.1, oct: 2, rev: 0.9, min: 0.3, p: 0.8 },
    mel: { wave: 'glass', vol: 0.04, cut: 2600, vib: 0, rev: 0.9, density: 0.4, rest: 0.5, lo: 8, hi: 15, min: 0.5 },
    perc: { tom: 'x.......x...x...', tmin: 0.55, gong: 'x...............', gmin: 0.5 }, bell: { p: 0.1, vol: 0.04, min: 0.2 } },
  /* les cimes : plus large, plus lent */
  sommets: { bpm: 70, root: 50, sc: 'lyd', floor: 0.3, bpc: 2, prog: [[0, 'M7'], [2, 'M'], [9, 'm7'], [7, 'M9']],
    pad: { wave: 'triangle', vol: 0.032, cut: 2200, oct: 1, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.12, min: 0.1 },
    arp: { pat: '01320231', every: 2, wave: 'glass', vol: 0.04, dec: 1.0, oct: 1, rev: 0.9, min: 0.15 },
    mel: { wave: 'glass', vol: 0.055, cut: 4000, vib: 0, rev: 0.9, density: 0.55, rest: 0.45, lo: 9, hi: 18, min: 0.3 },
    perc: { shaker: '....o.......o...', hmin: 0.7 }, bell: { p: 0.22, vol: 0.04, min: 0.15 } },
  phare_vents: { bpm: 84, root: 49, sc: 'lyd', floor: 0.55, bpc: 2, prog: [[0, 'M9'], [7, 'M'], [9, 'm7'], [2, 'M9']],
    pad: { wave: 'triangle', vol: 0.034, cut: 2400, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.14, min: 0 },
    arp: { pat: '01230321', every: 2, wave: 'glass', vol: 0.04, dec: 0.9, oct: 1, rev: 0.8, min: 0 },
    mel: { wave: 'glass', vol: 0.06, cut: 4200, vib: 0, rev: 0.9, density: 0.8, rest: 0.3, lo: 8, hi: 18, min: 0.1 },
    perc: { kick: 'x.......x.......', kmin: 0.7, shaker: '..o...o...o...o.', hmin: 0.6 }, bell: { p: 0.3, vol: 0.045, min: 0 } },
};

export const PRE_PICS = {
  pics: { wind: 0.9, mist: 0.15, distant: 0.35, birds: 0.05 },
  col: { wind: 0.5, birds: 0.1, distant: 0.25 },
  moulins: { wind: 0.2, hum: 0.55, mist: 0.3, distant: 0.2 },
  sommets: { wind: 1.1, distant: 0.4, mist: 0.2 },
  phare_vents: { wind: 0.9, hum: 0.25, glassrain: 0.2, distant: 0.3 },
};

/* bruitages (k : kit de sfx.js) */
export const SFX_PICS = {
  step_neige: (k) => { k.N(0.13, 0.05, 1300, 0.6, 0, 'bandpass', { pink: true, cutTo: 700 }); k.N(0.07, 0.03, 4200, 0.5, 0.02, 'highpass', { pink: true }); },
  glide_start: (k) => { k.N(0.7, 0.1, 500, 0.8, 0, 'bandpass', { cutTo: 3200, a: 0.15 }); k.T(330, 0.5, 'triangle', 0.025, 0, 1.8, { cut: 1400 }); k.bell(1175, 1.0, 0.03, 0.1, 0.7); },
  glide_land: (k) => { k.N(0.25, 0.08, 2200, 1, 0, 'bandpass', { cutTo: 600 }); k.T(150, 0.18, 'sine', 0.05, 0, 0.6); },
  vent_hum: (k) => { k.T(392, 0.9, 'sine', 0.03, 0, 1.1, { rev: 0.7 }); k.bell(784, 1.0, 0.02, 0.05, 0.8); },
  relay_expire: (k) => { k.T(420, 0.25, 'sine', 0.03, 0, 0.5, { rev: 0.4 }); k.T(300, 0.3, 'sine', 0.02, 0.08, 0.5); },
  portal_set: (k) => { k.T(220, 0.9, 'sawtooth', 0.03, 0, 2.4, { cut: 500, cutTo: 2600, rev: 0.6, a: 0.25 }); [880, 1319].forEach((f, i) => k.bell(f, 1.2, 0.03, 0.15 + i * 0.1, 0.8)); },
  portal_use: (k) => { k.N(0.5, 0.1, 400, 0.8, 0, 'bandpass', { cutTo: 6000, a: 0.1 }); k.T(180, 0.5, 'sine', 0.05, 0, 3.5, { rev: 0.7 }); k.bell(1568, 0.9, 0.035, 0.3, 0.8); },
  fanion: (k) => { k.N(0.3, 0.08, 1800, 0.8, 0, 'bandpass', { cutTo: 900 }); k.bell(988, 0.8, 0.03, 0.05, 0.6); },
};
