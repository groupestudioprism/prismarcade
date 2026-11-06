/* =========================================================
   LUMEN — sons synthétisés (aucun fichier) : effets et nappes
   d'ambiance par région. Volume maître / effets / musique.
   ========================================================= */
let actx = null, master = null, sfxBus = null, musBus = null, noiseBuf = null;
const vol = { master: 1, sfx: 1, music: 0.8, muted: false };

function ctx() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.connect(actx.destination);
      sfxBus = actx.createGain(); sfxBus.connect(master);
      musBus = actx.createGain(); musBus.connect(master);
      noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.6, actx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      apply();
    } catch (e) { return null; }
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function apply() {
  if (!master) return;
  master.gain.value = vol.muted ? 0 : vol.master;
  sfxBus.gain.value = vol.sfx;
  musBus.gain.value = vol.music * 0.9;
}
export const audio = {
  unlock: () => ctx(),
  set(o) { Object.assign(vol, o); apply(); },
  get: () => Object.assign({}, vol),
  tone(f, dur = 0.3, type = 'sine', v = 0.08, delay = 0, slide = 0) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur = 0.2, v = 0.1, freq = 1200, q = 0.8, delay = 0, type = 'bandpass') {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + delay, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur + 0.05);
  },
  chime(f, dur = 0.3, type = 'sine') { this.tone(f, dur, type, 0.07); this.tone(f * 2, dur * 0.6, 'sine', 0.02); },
  chord(fs, step = 0.09) { fs.forEach((f, i) => { this.tone(f, 0.9, 'sine', 0.06, i * step); this.tone(f * 2, 0.5, 'triangle', 0.015, i * step); }); },
  /* effets nommés */
  sfx(name) {
    const r = 0.94 + Math.random() * 0.12;
    switch (name) {
      case 'swing': this.noise(0.16, 0.12, 1800 * r, 1.2); break;
      case 'swingHeavy': this.noise(0.3, 0.16, 700 * r, 1); this.tone(110, 0.25, 'sine', 0.05, 0, 0.6); break;
      case 'hit': this.noise(0.1, 0.18, 900 * r, 1.5); this.tone(220 * r, 0.12, 'square', 0.03, 0, 0.5); break;
      case 'hitBrume': this.noise(0.18, 0.14, 2400 * r, 2); this.tone(660 * r, 0.2, 'sine', 0.04, 0, 0.5); break;
      case 'block': this.tone(880, 0.12, 'square', 0.03); this.noise(0.08, 0.12, 3000, 3); break;
      case 'hurt': this.tone(300, 0.25, 'sawtooth', 0.05, 0, 0.5); this.noise(0.15, 0.1, 600, 1); break;
      case 'dodge': this.noise(0.22, 0.08, 1200, 0.7, 0, 'lowpass'); break;
      case 'shoot': this.tone(880 * r, 0.14, 'triangle', 0.05, 0, 1.6); break;
      case 'magic': this.tone(660 * r, 0.3, 'sine', 0.06, 0, 2); this.tone(990 * r, 0.25, 'sine', 0.03, 0.03, 1.5); break;
      case 'onde': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.5, 'sine', 0.05, i * 0.03)); this.noise(0.5, 0.08, 2000, 0.5); break;
      case 'kill': this.tone(520, 0.3, 'sine', 0.05, 0, 1.8); this.noise(0.3, 0.08, 3000, 1.5); break;
      case 'pickup': this.chord([784, 1047], 0.06); break;
      case 'coin': this.tone(1318, 0.12, 'square', 0.025); this.tone(1760, 0.18, 'square', 0.02, 0.06); break;
      case 'ui': this.tone(660, 0.08, 'sine', 0.04); break;
      case 'uiBack': this.tone(440, 0.08, 'sine', 0.035); break;
      case 'buy': this.tone(988, 0.1, 'triangle', 0.05); this.tone(1318, 0.15, 'triangle', 0.04, 0.07); break;
      case 'deny': this.tone(196, 0.18, 'square', 0.035); break;
      case 'chest': this.chord([392, 523, 659, 784], 0.07); break;
      case 'cut': this.noise(0.18, 0.12, 2600, 1.3); this.noise(0.25, 0.06, 500, 0.8, 0.05); break;
      case 'break': this.noise(0.5, 0.25, 300, 0.6, 0, 'lowpass'); this.tone(80, 0.4, 'sine', 0.08, 0, 0.5); break;
      case 'door': this.tone(150, 0.4, 'triangle', 0.05, 0, 1.5); this.noise(0.4, 0.06, 400, 0.7); break;
      case 'talk': this.tone(520 + Math.random() * 120, 0.05, 'triangle', 0.018); break;
      case 'level': this.chord([523, 659, 784, 1047, 1318], 0.08); break;
      case 'quest': this.chord([587, 740, 880, 1175], 0.1); break;
      case 'slam': this.noise(0.6, 0.3, 160, 0.5, 0, 'lowpass'); this.tone(60, 0.5, 'sine', 0.12, 0, 0.6); break;
      case 'roar': this.tone(90, 0.8, 'sawtooth', 0.05, 0, 0.6); this.noise(0.8, 0.08, 400, 0.6); break;
      case 'heal': this.chord([659, 880, 1175], 0.07); break;
      case 'lamp': this.chord([880, 1109, 1319], 0.06); break;
      default: this.tone(600, 0.1);
    }
  },
};

/* ---------- Musique d'ambiance : nappe douce, couleur par région ---------- */
const MOODS = {
  village: { notes: [130.81, 196, 261.63, 329.63, 392], cut: 1500, lfo: 0.05 },
  puzzle: { notes: [110, 164.81, 220, 277.18, 329.63], cut: 1100, lfo: 0.06 },
  lande: { notes: [98, 146.83, 196, 233.08, 293.66], cut: 900, lfo: 0.08 },
  sanctuaire: { notes: [73.42, 110, 146.83, 174.61, 220], cut: 650, lfo: 0.11 },
  interieur: { notes: [146.83, 220, 293.66, 369.99, 440], cut: 1300, lfo: 0.04 },
  boss: { notes: [65.41, 98, 130.81, 155.56, 196], cut: 1400, lfo: 0.4 },
};
let pad = null, moodNow = '';
export function music(mood, level = 0.6) {
  const a = ctx(); if (!a) return;
  if (!pad) {
    const g = a.createGain(); g.gain.value = 0; g.connect(musBus);
    const filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 900; filt.connect(g);
    const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.06; lg.gain.value = 300; lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
    const voices = [0, 1, 2, 3, 4].map((i) => { const o = a.createOscillator(), og = a.createGain(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = 110; o.detune.value = (i - 2) * 4; og.gain.value = 0; o.connect(og); og.connect(filt); o.start(); return { o, og }; });
    g.gain.linearRampToValueAtTime(0.05, a.currentTime + 3);
    pad = { g, filt, lfo, voices };
  }
  const m = MOODS[mood] || MOODS.puzzle;
  if (mood !== moodNow) {
    moodNow = mood;
    pad.voices.forEach((v, i) => v.o.frequency.setTargetAtTime(m.notes[i], a.currentTime, 1.2));
    pad.lfo.frequency.setTargetAtTime(m.lfo, a.currentTime, 1);
  }
  pad.voices.forEach((v, i) => v.og.gain.setTargetAtTime(i < 2 ? 0.5 : level > (i - 1) * 0.22 ? 0.35 : 0, a.currentTime, 1.5));
  pad.filt.frequency.setTargetAtTime(m.cut * (0.6 + level * 0.8), a.currentTime, 2);
}
