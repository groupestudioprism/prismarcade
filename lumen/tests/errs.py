import time, subprocess
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["python3", "-m", "http.server", "8775"], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1000, "height": 600}); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:300]) if m.type in ("error","warning") else None)
        pg.goto("http://localhost:8775/lumen/", wait_until="load"); pg.wait_for_timeout(4000)
        pg.evaluate("(async()=>{await __lumen.G.startFrom(null,'auto'); })()"); pg.wait_for_timeout(2500)
        ev=pg.evaluate
        ev("__lumen.tpZone('havre',[15,15])"); pg.wait_for_timeout(2500)
        print(ev("(()=>{const L=__lumen;return JSON.stringify({mode:L.S.mode,zone:L.G.zoneId(),vis:L.world.zoneGroups.map(g=>g.visible?1:0).join(''),x:L.P.x,z:L.P.z})})()"))
        pg.screenshot(path="/tmp/gfx/err.png")
        print("\n".join(sorted(set(errs))[:10])); b.close()
finally: srv.terminate()
