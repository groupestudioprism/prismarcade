"""QA-GAMEPLAY — bibliothèque commune (port 8776). Rendu neutralisé : on teste la logique, pas le GPU."""
import sys, json, time, subprocess, os
from playwright.sync_api import sync_playwright

PORT = int(os.environ.get("QA_PORT", "8776"))
ROOT = "/home/claude/prismarcade"
SOL = open(os.path.join(os.path.dirname(__file__), "qa_solutions.json")).read()

HELP = r"""
window.SOL = %s;
window.T = {
  talk(id, pick){ const L=__lumen; L.G.screens.dialog(id); return T.pump(pick); },
  pump(pick){ const L=__lumen; let n=0, last=[];
    while(L.G.screens.dialogOpen && n<600){ n++;
      const ch=document.querySelectorAll('#dialog .choice');
      if(ch.length){ last.push([...ch].map(c=>c.textContent)); const i = typeof pick==='function'?pick(ch.length,last):(pick===undefined?ch.length-1:Math.min(pick,ch.length-1)); L.G.screens.choose(i); }
      else L.G.screens.nextLine(); }
    return {n, open:L.G.screens.dialogOpen, choices:last}; },
  q(id){ return __lumen.quests.state(id)+':'+__lumen.quests.stepId(id); },
  tick(ms){ return new Promise(r=>setTimeout(r,ms||60)); },
  solve(gate){ const L=__lumen; const s=SOL[L.st.player.island||'aube'][gate]; if(!s) return 'nosol:'+gate;
    Object.entries(s).forEach(([id,v])=>L.set(id,v)); return L.isl.gates[gate].open; },
  killAll(){ const c=__lumen.combat; let n=0; c.enemies.filter(e=>e.state!=='dead').forEach(e=>{c.dealDamage(e,99999,'tranchant',{heavy:true});n++}); return n; },
  zone(){ return __lumen.G.zoneId(); },
  info(){ const L=__lumen; return JSON.stringify({mode:L.S.mode,zone:L.G.zoneId(),isl:L.st.player.island,hp:L.st.player.hp,ecus:L.st.player.ecus,x:+(L.P.x/2).toFixed(1),y:+(L.P.z/2).toFixed(1)}); }
};
""" % SOL
HELP += open(os.path.join(os.path.dirname(__file__), "qa_helpers.js")).read()


class QA:
    def __init__(self, name, viewport=(640, 360), query="?low&nobloom", noop=True, serve=True, profile=None):
        self.name = name; self.errs = []; self.results = []; self.noop = noop; self.query = query
        self.srv = None
        if serve:
            # le serveur 8776 est lancé à part ; on n'en démarre un que s'il manque
            import socket
            s = socket.socket(); ok = s.connect_ex(("127.0.0.1", PORT)) == 0; s.close()
            if not ok:
                self.srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
        self.p = sync_playwright().start()
        args = ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"]
        if profile:
            self.ctx = self.p.chromium.launch_persistent_context(profile, executable_path="/usr/bin/google-chrome", args=args, viewport={"width": viewport[0], "height": viewport[1]})
            self.b = self.ctx
        else:
            self.b = self.p.chromium.launch(executable_path="/usr/bin/google-chrome", args=args)
            self.ctx = self.b.new_context(viewport={"width": viewport[0], "height": viewport[1]})
        self.pg = self.ctx.pages[0] if (profile and self.ctx.pages) else self.ctx.new_page()
        self.pg.on("pageerror", lambda e: self.errs.append("PAGEERR " + str(e)[:300]))
        self.pg.on("console", lambda m: self.errs.append("CONSOLE " + m.text[:300]) if m.type in ("error",) and "ERR_TUNNEL" not in m.text and "favicon" not in m.text else None)
        self.pg.on("dialog", lambda d: d.accept())

    def load(self, extra="", wait=3500):
        self.pg.goto(f"http://localhost:{PORT}/lumen/{self.query}{extra}", wait_until="load")
        self.pg.wait_for_function("window.__lumen && __lumen.S", timeout=60000)
        self.prep()

    def prep(self):
        if self.noop:
            self.pg.evaluate("__lumen.renderer.render=()=>{}")
        self.pg.evaluate(HELP)

    def reloaded(self, timeout=90000):
        """après un voyage entre îles"""
        self.pg.wait_for_function("!window.__old && window.__lumen && __lumen.S && __lumen.S.mode==='play'", timeout=timeout, polling=300)
        self.prep(); self.pg.wait_for_timeout(300)

    def ev(self, js):
        return self.pg.evaluate(js)

    def step(self, name, fn, expect=None):
        try:
            r = fn()
            ok = True
            if expect is not None:
                ok = expect(r) if callable(expect) else (expect in str(r))
            self.results.append((name, "OK" if ok else "FAIL", r))
            print(("OK   " if ok else "FAIL ") + name, (str(r)[:300] if r is not None else ""), flush=True)
            return r
        except Exception as e:
            self.results.append((name, "ERR", str(e)[:300]))
            print("ERR  ", name, str(e)[:400], flush=True)

    def js(self, name, code, expect=None):
        return self.step(name, lambda: self.ev(code), expect)

    def tick(self, ms=100):
        self.pg.wait_for_timeout(ms)

    def done(self):
        fails = [r for r in self.results if r[1] != "OK"]
        print("\n=== %s ===\nERRORS:" % self.name, sorted(set(self.errs))[:30])
        print("FAILS:", fails, flush=True)
        try:
            self.b.close(); self.p.stop()
        except Exception:
            pass
        if self.srv: self.srv.terminate()
