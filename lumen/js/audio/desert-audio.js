/* =========================================================
   LUMEN — ACTE III : thèmes musicaux et ambiances du Désert des Échos.
   Gamme « hdom » (phrygien dominant) : les secondes augmentées font le désert.
   ========================================================= */
export const DESERT_SCALE = { hdom: [0, 1, 4, 5, 7, 8, 10] };

export const DESERT_TH = {
  cite: { bpm: 100, root: 50, sc: 'hdom', floor: 0.5, bpc: 2, swing: 0.06, prog: [[0, 'M'], [1, 'M'], [0, 'M'], [10, 'M']],
    pad: { wave: 'triangle', vol: 0.028, cut: 1500, oct: 0 }, bass: { pat: '0...0.5.0...5...', wave: 'triangle', vol: 0.14, cut: 650, min: 0.1 },
    arp: { pat: '0123210231', every: 2, wave: 'triangle', vol: 0.045, dec: 0.35, oct: 1, rev: 0.4, min: 0 },
    mel: { wave: 'sine', vol: 0.065, cut: 2800, vib: 5, rev: 0.5, density: 0.8, rest: 0.3, lo: 7, hi: 15, min: 0.1 },
    perc: { shaker: 'x.o.x.o.x.o.x.o.', wood: 'x..o..x...o.x...', kick: 'x.......x.......', kmin: 0.55, hmin: 0.1, wmin: 0.35 }, bell: { p: 0.08, vol: 0.03, min: 0.6 } },
  dunes: { bpm: 66, root: 47, sc: 'hdom', floor: 0.3, bpc: 2, prog: [[0, 'm'], [1, 'M'], [0, 'm7'], [10, 'M']],
    pad: { wave: 'sawtooth', vol: 0.012, cut: 700, cutTo: 1300, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.13, min: 0.1 },
    arp: { pat: '0213', every: 4, wave: 'sine', vol: 0.04, dec: 1.2, oct: 1, rev: 0.9, min: 0.1, p: 0.85 },
    mel: { wave: 'triangle', vol: 0.05, cut: 2600, vib: 6, rev: 0.9, density: 0.4, rest: 0.5, lo: 7, hi: 14, min: 0.2 },
    perc: { tom: 'x.......x...o...', tmin: 0.5, shaker: '..o...o...o...o.', hmin: 0.7 }, bell: { p: 0.1, vol: 0.035, min: 0.3 } },
  temple_sable: { bpm: 54, root: 46, sc: 'hdom', floor: 0.2, bpc: 2, prog: [[0, 'm'], [1, 'M'], [0, 'm7'], [7, 'd']],
    pad: { wave: 'sawtooth', vol: 0.012, cut: 420, cutTo: 760, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.14, min: 0.1 },
    arp: { pat: '0231', every: 6, wave: 'sine', vol: 0.04, dec: 1.6, oct: 2, rev: 1, min: 0.2, p: 0.8 },
    mel: { wave: 'glass', vol: 0.04, cut: 3000, vib: 0, rev: 1, density: 0.3, rest: 0.6, lo: 8, hi: 15, min: 0.55 },
    perc: { gong: 'x...............', gmin: 0.45 }, bell: { p: 0.1, vol: 0.04, min: 0.15 } },
  phare_sable: { bpm: 84, root: 50, sc: 'hdom', floor: 0.55, bpc: 2, prog: [[0, 'M'], [5, 'M'], [0, 'M9'], [10, 'M']],
    pad: { wave: 'triangle', vol: 0.032, cut: 2000, oct: 0, sub: true }, bass: { pat: '0...............', wave: 'sine', vol: 0.14, min: 0 },
    arp: { pat: '01230321', every: 2, wave: 'glass', vol: 0.04, dec: 0.9, oct: 1, rev: 0.8, min: 0 },
    mel: { wave: 'glass', vol: 0.06, cut: 3800, vib: 0, rev: 0.9, density: 0.75, rest: 0.3, lo: 8, hi: 17, min: 0.1 },
    perc: { kick: 'x.......x.......', tom: '................', kmin: 0.7, shaker: '..o...o...o...o.', hmin: 0.6 }, bell: { p: 0.3, vol: 0.045, min: 0 } },
};

export const DESERT_AMBIENCE = {
  cite: { wind: 0.25, birds: 0.2, water: 0.25, distant: 0.2, insects: 0.1 },
  dunes: { wind: 0.75, distant: 0.35, insects: 0.1 },
  desert: { wind: 0.75, distant: 0.35, insects: 0.1 },
  temple_sable: { hum: 0.7, wind: 0.2, distant: 0.3, mist: 0.15 },
  phare_sable: { wind: 0.6, hum: 0.3, distant: 0.3, glassrain: 0.15 },
};
