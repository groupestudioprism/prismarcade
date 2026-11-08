/* =========================================================
   LUMEN — son : noyau (contexte, bus, limiteur, voix, outils)
   Chaîne : sources → bus de catégorie → master → limiteur → sortie
   Le contexte n'est créé qu'après un premier geste (autoplay).
   ========================================================= */
export const A = { ctx: null, out: null, noise: null, pink: null, active: 0, low: false, rev: null };
export const vol = { master: 0.9, music: 0.8, sfx: 1, ambience: 0.8, voice: 0.9, muted: false };
const KEY = 'lumen.audio';
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) for (const k in vol) if (k in s) vol[k] = s[k]; } catch (e) { /* stockage indisponible */ }
try { A.low = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches) || /[?&](touch|lowaudio)\b/.test(location.search); } catch (e) { /* ignore */ }
export const MAXV = () => (A.low ? 26 : 48); /* polyphonie globale max */
/* La musique n'a droit qu'à ~70 % de la polyphonie : le reste est réservé aux bruitages (sinon, en plein boss, les coups ne sonnent plus). */
export const capFor = (o) => (o && o.mus ? Math.floor(MAXV() * 0.7) : MAXV());

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
export const hash = (str) => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

export function persist() { try { localStorage.setItem(KEY, JSON.stringify(vol)); } catch (e) { /* ignore */ } }
export function applyVolumes(fast) {
  if (!A.ctx) return;
  const t = A.ctx.currentTime, k = fast ? 0.01 : 0.06, o = A.out;
  o.master.gain.setTargetAtTime(vol.muted ? 0 : vol.master * 0.9, t, k);
  o.music.gain.setTargetAtTime(vol.music, t, k);
  o.sfx.gain.setTargetAtTime(vol.sfx, t, k);
  o.amb.gain.setTargetAtTime(vol.ambience, t, k);
  o.voice.gain.setTargetAtTime(vol.voice, t, k);
}

/* Création du contexte : à appeler depuis un geste utilisateur (ou plus tard). */
export function create() {
  if (A.ctx) return A.ctx;
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    const ctx = A.ctx = new C({ latencyHint: 'interactive' });
    const g = () => ctx.createGain();
    const master = g(), lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -12; lim.knee.value = 10; lim.ratio.value = 14; lim.attack.value = 0.004; lim.release.value = 0.22;
    master.connect(lim); lim.connect(ctx.destination);
    const o = A.out = { master, music: g(), sfx: g(), amb: g(), voice: g(), rev: g(), musicDuck: g() };
    o.musicDuck.connect(o.music); o.music.connect(master); o.sfx.connect(master); o.amb.connect(master); o.voice.connect(master);
    /* réverbération partagée (impulsion bruitée décroissante) */
    const len = Math.floor(ctx.sampleRate * (A.low ? 1.4 : 2.4)), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 200;
    o.rev.gain.value = 0.55; o.rev.connect(hp); hp.connect(conv); conv.connect(master);
    /* bruits blanc et rose */
    const nl = ctx.sampleRate * 2, nb = ctx.createBuffer(1, nl, ctx.sampleRate), pb = ctx.createBuffer(1, nl, ctx.sampleRate);
    const nd = nb.getChannelData(0), pd = pb.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < nl; i++) { const w = Math.random() * 2 - 1; nd[i] = w; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; pd[i] = (b0 + b1 + b2 + w * 0.1848) * 0.22; }
    A.noise = nb; A.pink = pb;
    master.gain.value = 0; applyVolumes(true);
  } catch (e) { A.ctx = null; return null; }
  return A.ctx;
}
export function ensure() {
  if (!A.ctx) return null;
  if (A.ctx.state === 'suspended' || A.ctx.state === 'interrupted') { try { A.ctx.resume(); } catch (e) { /* ignore */ } }
  return A.ctx;
}
export const now = () => (A.ctx ? A.ctx.currentTime : 0);

/* Sortie par appel : gain (distance) + pan stéréo, vers un bus. */
export function dest(bus, o = {}) {
  const ctx = A.ctx; let node = bus;
  let g = o.vol == null ? 1 : o.vol, pan = o.pan || 0;
  if (o.x != null && o.z != null && L.on) { const dx = o.x - L.x, dz = o.z - L.z, d = Math.hypot(dx, dz); const c = Math.cos(L.yaw), s = Math.sin(L.yaw); pan = clamp((-dx * c + dz * s) / 14, -1, 1) * (d > 1 ? 1 : d); g *= 1 / (1 + d * d / 120); if (d > 40) g *= 0.3; }
  if (g < 0.01) return null;
  if (g !== 1) { const n = ctx.createGain(); n.gain.value = g; n.connect(node); node = n; }
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(node); node = p; }
  return node;
}
export const L = { on: false, x: 0, z: 0, yaw: 0 };

/* Oscillateur à enveloppe. o : {wave, vol, a, d (durée), r, slide, to, cut, q, detune, bus, rev, prio, t0, pan} */
export function tone(f, dur, o = {}) {
  const ctx = A.ctx; if (!ctx) return;
  if (A.active >= capFor(o) && !o.prio) return;
  const t = (o.t0 == null ? ctx.currentTime : o.t0) + (o.delay || 0), v = o.vol == null ? 0.08 : o.vol, a = o.a == null ? 0.012 : o.a, r = o.r == null ? Math.min(0.25, dur * 0.5) : o.r;
  const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = o.wave || 'sine';
  osc.frequency.setValueAtTime(f, t);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(clamp(f * o.slide, 20, 18000), t + dur);
  if (o.detune) osc.detune.value = o.detune;
  if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vibRate || 5.5; lg.gain.value = o.vib; l.connect(lg); lg.connect(osc.detune); l.start(t); l.stop(t + dur + r + 0.05); }
  const end = t + dur + r;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a);
  if (o.sustain != null) { g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * o.sustain), t + Math.max(a + 0.01, dur)); g.gain.exponentialRampToValueAtTime(0.0001, end); }
  else g.gain.exponentialRampToValueAtTime(0.0001, end);
  let n = osc;
  if (o.cut) { const f2 = ctx.createBiquadFilter(); f2.type = o.ftype || 'lowpass'; f2.frequency.setValueAtTime(o.cut, t); if (o.cutTo) f2.frequency.exponentialRampToValueAtTime(Math.max(40, o.cutTo), t + dur); f2.Q.value = o.q || 0.7; n.connect(f2); n = f2; }
  n.connect(g);
  const d = o.out || dest(o.bus || A.out.sfx, o); if (!d) { return; }
  g.connect(d);
  if (o.rev) { const s = ctx.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(o.revBus || A.out.rev); }
  A.active++; osc.onended = () => { A.active--; };
  osc.start(t); osc.stop(end + 0.04);
}

/* Rafale de bruit filtrée. o : {vol, cut, q, ftype, cutTo, a, pink, bus, rev, delay, prio, pan} */
export function noise(dur, o = {}) {
  const ctx = A.ctx; if (!ctx) return;
  if (A.active >= capFor(o) && !o.prio) return;
  const t = (o.t0 == null ? ctx.currentTime : o.t0) + (o.delay || 0), v = o.vol == null ? 0.1 : o.vol, a = o.a == null ? 0.004 : o.a;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = o.pink ? A.pink : A.noise; s.loop = true;
  const off = Math.random() * 1.2;
  f.type = o.ftype || 'bandpass'; f.frequency.setValueAtTime(o.cut || 1200, t); if (o.cutTo) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.cutTo), t + dur); f.Q.value = o.q == null ? 0.8 : o.q;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g);
  const d = o.out || dest(o.bus || A.out.sfx, o); if (!d) return;
  g.connect(d);
  if (o.rev) { const r = ctx.createGain(); r.gain.value = o.rev; g.connect(r); r.connect(o.revBus || A.out.rev); }
  A.active++; s.onended = () => { A.active--; };
  s.start(t, off); s.stop(t + dur + 0.05);
}

/* État partagé : tension de combat (0..1, décroît) pour la musique adaptative */
export const state = { tension: 0 };
export function bumpTension(v) { state.tension = Math.min(1, Math.max(state.tension, v) + 0.02); state.tensionAt = A.ctx ? A.ctx.currentTime : 0; }
export function duck(level, secs) {
  if (!A.ctx) return; const g = A.out.musicDuck.gain, t = A.ctx.currentTime;
  g.cancelScheduledValues(t); g.setTargetAtTime(level, t, 0.08); g.setTargetAtTime(1, t + secs, 0.5);
}
