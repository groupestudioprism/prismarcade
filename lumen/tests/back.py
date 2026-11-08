import time, subprocess
from playwright.sync_api import sync_playwright

def wait_reloaded(pg, timeout=150000):
    """Après un voyage (rechargement de page) : sondage actif au lieu d'un délai fixe."""
    pg.wait_for_function("!window.__old && window.__lumen && __lumen.S && __lumen.G.zoneId && __lumen.G.zoneId() !== null", timeout=timeout, polling=500)
    pg.wait_for_timeout(800)
srv = subprocess.Popen(["python3", "-m", "http.server", "8775"], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
errs=[]
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1000, "height": 600})
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.goto("http://localhost:8775/lumen/", wait_until="load"); pg.wait_for_timeout(3500)
        ev=lambda js: pg.evaluate(js)
        print(ev("(async()=>{await __lumen.G.startFrom(null,'auto');return __lumen.G.zoneId()})()"))
        pg.wait_for_timeout(1000)
        ev("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;window.__old=1;L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}])})()")
        wait_reloaded(pg)
        print("foret", ev("(()=>{const L=__lumen;return JSON.stringify({z:L.G.zoneId(),isl:L.st.player.island,x:L.P.x,zz:L.P.z})})()"))
        ev("(()=>{const L=__lumen;window.__old=1;L.G.runEffects([{travel:{to:'aube',zone:'havre',cell:[27,7]}}])})()")
        wait_reloaded(pg)
        print("aube", ev("(()=>{const L=__lumen;return JSON.stringify({z:L.G.zoneId(),isl:L.st.player.island,x:L.P.x,zz:L.P.z,mode:L.S.mode})})()"))
        pg.screenshot(path="/tmp/back.png")
        b.close()
finally:
    srv.terminate()
print(errs)
