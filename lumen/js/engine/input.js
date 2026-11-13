/* =========================================================
   LUMEN — commandes : clavier, souris, tactile → actions.
   Actions ponctuelles : attack, special, dodge, interact, reverse, potion,
                         inventory, journal, map, pause, character
   Clavier : ZQSD / WASD / flèches · clic gauche ou K : attaque · clic droit ou L : spéciale
             Espace ou Maj : esquive · E : interagir · R : sens inverse · F : potion
             I / Tab : inventaire · J : journal · M : carte · C : personnage · Échap / P : pause
   ========================================================= */
const KEYS = {
  up: ['arrowup', 'z', 'w'], down: ['arrowdown', 's'], left: ['arrowleft', 'q', 'a'], right: ['arrowright', 'd'],
};
const PRESS = {
  attack: ['k'], special: ['l'], dodge: [' ', 'shift'], interact: ['e', 'enter'], reverse: ['r'], potion: ['f'], portal: ['v'],   /* ACTE V */
  inventory: ['i', 'tab'], journal: ['j'], map: ['m'], pause: ['escape', 'p'], character: ['c'],
};

export function createInput(canvas, opts = {}) {
  const keys = {}, queue = new Set();
  const cam = { dx: 0, dy: 0, zoom: 0 };
  const joy = { active: false, id: null, x: 0, y: 0, ox: 0, oy: 0 };
  let enabled = false, attackHeld = false, attackHeldT = 0;
  const touch = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('touch');

  const fire = (a) => { queue.add(a); if (opts.onAction) opts.onAction(a); };
  addEventListener('keydown', (ev) => {
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA')) return;
    const k = ev.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k)) ev.preventDefault();
    const dg = /^(?:Digit|Numpad)([0-9])$/.exec(ev.code || '');   // clavier AZERTY : la rangée du haut donne « & é " ' ( » sans Maj → on lit la touche physique
    if (dg) keys[dg[1]] = true;
    const was = keys[k]; keys[k] = true;
    if (was) return;
    for (const [a, ks] of Object.entries(PRESS)) if (ks.includes(k)) fire(a);
    if (k === 'k') attackHeld = true;
  });
  addEventListener('keyup', (ev) => { const k = ev.key.toLowerCase(); keys[k] = false; const dg = /^(?:Digit|Numpad)([0-9])$/.exec(ev.code || ''); if (dg) keys[dg[1]] = false; if (k === 'k') attackHeld = false; });
  addEventListener('blur', () => { Object.keys(keys).forEach((k) => (keys[k] = false)); attackHeld = false; if (opts.onBlur) opts.onBlur(); });

  /* souris : clic court = attaque ; glisser = caméra ; clic droit = spéciale ; molette = zoom */
  let drag = null;
  canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  canvas.addEventListener('pointerdown', (ev) => {
    if (!enabled) return;
    if (ev.pointerType === 'touch') {
      if (ev.clientX < innerWidth * 0.45) return;   // côté joystick
      drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, moved: 0, touch: true };
      return;
    }
    if (ev.button === 2) { fire('special'); return; }
    if (ev.button !== 0) return;
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, moved: 0, t: performance.now() };
    attackHeld = true; attackHeldT = 0;
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!drag || drag.id !== ev.pointerId) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved > 8) { cam.dx += dx; cam.dy += dy; if (!drag.touch) attackHeld = false; }
    drag.x = ev.clientX; drag.y = ev.clientY;
  });
  const up = (ev) => {
    if (!drag || drag.id !== ev.pointerId) return;
    if (!drag.touch && drag.moved <= 8) fire('attack');
    attackHeld = false; drag = null;
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', () => { drag = null; attackHeld = false; });
  canvas.addEventListener('wheel', (ev) => { ev.preventDefault(); cam.zoom += ev.deltaY; }, { passive: false });

  /* joystick tactile */
  const joyEl = document.getElementById('joy'), knob = document.getElementById('knob');
  canvas.addEventListener('touchstart', (ev) => {
    if (!enabled) return;
    const t = ev.changedTouches[0];
    if (t.clientX > innerWidth * 0.45) return;
    joy.active = true; joy.id = t.identifier; joy.ox = t.clientX; joy.oy = t.clientY; joy.x = joy.y = 0;
    joyEl.style.left = t.clientX - 60 + 'px'; joyEl.style.top = t.clientY - 60 + 'px'; joyEl.classList.add('on');
    ev.preventDefault();
  }, { passive: false });
  addEventListener('touchmove', (ev) => {
    for (const t of ev.changedTouches) {
      if (t.identifier !== joy.id) continue;
      let dx = t.clientX - joy.ox, dy = t.clientY - joy.oy;
      const l = Math.hypot(dx, dy), max = 52;
      if (l > max) { dx *= max / l; dy *= max / l; }
      joy.x = dx / max; joy.y = dy / max;
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      ev.preventDefault();
    }
  }, { passive: false });
  const joyEnd = (ev) => { for (const t of ev.changedTouches) if (t.identifier === joy.id) { joy.active = false; joy.x = joy.y = 0; knob.style.transform = ''; joyEl.classList.remove('on'); } };
  addEventListener('touchend', joyEnd); addEventListener('touchcancel', joyEnd);

  /* boutons tactiles : data-act="attack" etc. ; appui long sur interagir = sens inverse */
  document.querySelectorAll('[data-touch]').forEach((b) => {
    let hold = null;
    b.addEventListener('pointerdown', (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      const a = b.dataset.touch;
      if (a === 'interact') { hold = setTimeout(() => { hold = 'long'; fire('reverse'); }, 450); return; }
      if (a === 'attack') attackHeld = true;
      fire(a);
    });
    const rel = (ev) => {
      ev.preventDefault();
      if (b.dataset.touch === 'interact') { if (hold && hold !== 'long') { clearTimeout(hold); fire('interact'); } hold = null; }
      if (b.dataset.touch === 'attack') attackHeld = false;
    };
    b.addEventListener('pointerup', rel); b.addEventListener('pointercancel', rel); b.addEventListener('pointerleave', (ev) => { if (b.dataset.touch === 'attack') attackHeld = false; });
  });

  const held = (dir) => KEYS[dir].some((k) => keys[k]);
  return {
    touch,
    enable(on) { enabled = on; if (!on) { queue.clear(); joy.active = false; joy.x = joy.y = 0; attackHeld = false; } },
    axis() {
      let x = 0, y = 0;
      if (held('left')) x -= 1; if (held('right')) x += 1; if (held('up')) y += 1; if (held('down')) y -= 1;
      if (joy.active) { x += joy.x; y -= joy.y; }
      const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
      return { x, y };
    },
    take(a) { if (queue.has(a)) { queue.delete(a); return true; } return false; },
    clear() { queue.clear(); },
    attackHeld: () => attackHeld,
    camera() { const c = { dx: cam.dx, dy: cam.dy, zoom: cam.zoom }; cam.dx = cam.dy = cam.zoom = 0; return c; },
    keyDown: (k) => !!keys[k],
  };
}
