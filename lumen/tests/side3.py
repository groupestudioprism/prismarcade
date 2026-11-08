import sys, json, time, subprocess
from playwright.sync_api import sync_playwright

srv = subprocess.Popen(["python3", "-m", "http.server", "8775"], cwd="/home/claude/prismarcade",
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
errs = []
results = []


def step(name, fn):
    try:
        r = fn()
        results.append((name, "OK", r))
        print("OK  ", name, r if r is not None else "")
    except Exception as e:
        results.append((name, "FAIL", str(e)[:300]))
        print("FAIL", name, str(e)[:400])


HELP = """
window.T = {
  talk(id){ const L=__lumen; L.G.screens.dialog(id); return T.pump(); },
  pump(){ const L=__lumen; let n=0, last=[];
    while(L.G.screens.dialogOpen && n<400){ n++;
      const ch=document.querySelectorAll('#dialog .choice');
      if(ch.length){ last.push([...ch].map(c=>c.textContent)); L.G.screens.choose(ch.length-1); }
      else L.G.screens.nextLine(); }
    return {n, open:L.G.screens.dialogOpen, choices:last}; },
  q(id){ return __lumen.quests.state(id)+':'+__lumen.quests.stepId(id); },
  tick(ms){ return new Promise(r=>setTimeout(r,ms||60)); }
};
"""

try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome",
                              args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 720})
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text)
              if m.type == "error" and "ERR_TUNNEL" not in m.text else None)
        pg.goto("http://localhost:8775/lumen/", wait_until="load")
        pg.wait_for_timeout(4000)
        pg.evaluate(HELP)
        ev = lambda js: pg.evaluate(js)

        step("nouvelle partie", lambda: ev("(async()=>{await __lumen.G.startFrom(null,'auto'); T.pump(); return __lumen.S.mode})()"))
        pg.wait_for_timeout(1500); ev("T.pump()")
        step("ronces: coupe réelle", lambda: ev("""(async()=>{const L=__lumen;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';L.tpZone('lande',[15,15]);await T.tick(900);
          const th=L.world.props.filter(p=>p.p.t==='thorn'||p.p.t==='bramble'||/ronce|thorn/.test(p.p.t));
          const types=[...new Set(L.world.props.map(p=>p.p.t))].join(',');
          return JSON.stringify({ronces:th.length,types})})()"""))
        step("coffre marteau: ouverture", lambda: ev("""(async()=>{const L=__lumen;L.tpZone('lande',[28,17]);await T.tick(700);
          const t=L.target();const k=t&&t.kind;if(t&&k==='chest')L.interact();await T.tick(400);
          return JSON.stringify({cible:k,marteau:L.st.inv.marteau_bran||0,quete:L.quests.state('s_marteau')})})()"""))
        b.close()
finally:
    srv.terminate()
print("ERRORS:", sorted(set(errs))[:20])
