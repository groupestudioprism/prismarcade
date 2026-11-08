import sys, os, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8778
os.makedirs(OUT, exist_ok=True); errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
    pg = b.new_page(viewport={"width": 1280, "height": 720})
    pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:200]))
    ev = pg.evaluate
    pg.goto(f"http://localhost:{PORT}/lumen/", wait_until="load"); pg.wait_for_function("window.__lumen&&__lumen.S", timeout=90000); pg.wait_for_timeout(2500)
    ev("(async()=>{await __lumen.G.startFrom(null,'auto')})()"); pg.wait_for_timeout(3500)
    ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
    ev("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;window.__old=1;L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}])})()")
    pg.wait_for_function("!window.__old && window.__lumen && __lumen.S && __lumen.G.zoneId && __lumen.G.zoneId() !== null", timeout=150000, polling=500); pg.wait_for_timeout(1500)
    ev("__lumen.tpZone('can3')"); pg.wait_for_timeout(2500)
    print(ev("__lumen.combat.enemies.map(e=>e.type+':'+e.state+':'+e.x.toFixed(0)+','+e.z.toFixed(0))"))
    for name, st in (("cerf_prisme", None), ("cerf_prisme_charge", "wind")):
        ev("(()=>{const L=__lumen;const e=L.combat.enemies.find(e=>e.type==='cerf_prisme');if(!e)return;e.state='%s';e.t=0;L.P.x=e.x;L.P.z=e.z-4.5;L.P.face=0;L.S.camT.set(e.x,0.8,e.z-2);L.S.dist=7;L.S.pitch=0.6;L.S.yaw=L.S.yawT=0})()" % (st or "idle"))
        pg.wait_for_timeout(1600); pg.screenshot(path=f"{OUT}/{name}.png")
    b.close()
print("ERRORS", errs)
