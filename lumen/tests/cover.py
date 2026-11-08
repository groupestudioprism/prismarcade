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

        ev("(async()=>{await __lumen.G.startFrom(null,'auto'); })()"); pg.wait_for_timeout(1500); ev("T.pump()")
        ev("(()=>{const L=__lumen;L.S.dist=24;L.S.pitch=0.8;L.tpZone('z1');(()=>{const c=document.querySelector('canvas');let n=c;while(n&&n!==document.body){[...n.parentElement.children].forEach(k=>{if(k!==n)k.style.display='none'});n=n.parentElement}})()})()")
        pg.wait_for_timeout(3000); pg.screenshot(path="/tmp/cover_new.png")
        b.close()
finally:
    srv.terminate()
