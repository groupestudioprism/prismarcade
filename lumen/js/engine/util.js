/* LUMEN — petits outils partagés */
export const $ = (s, root = document) => root.querySelector(s);
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
export const hash = (x, y, k = 0) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(k, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const damp = (k, dt) => 1 - Math.exp(-k * dt);
export const angleTo = (a, b) => { let d = b - a; return Math.atan2(Math.sin(d), Math.cos(d)); };
export const rand = (a, b) => a + Math.random() * (b - a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const T = 2;           // taille d'une case en unités 3D
export const BEAM_Y = 1.05;
export const W = (x) => x * T;

/* Bus d'événements minimal (quêtes, interface, sons) */
export function bus() {
  const map = {};
  return {
    on(ev, fn) { (map[ev] = map[ev] || []).push(fn); return () => (map[ev] = map[ev].filter((f) => f !== fn)); },
    emit(ev, data) { (map[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error('[Lumen]', ev, e); } }); },
  };
}

export const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* rien */ } },
};
