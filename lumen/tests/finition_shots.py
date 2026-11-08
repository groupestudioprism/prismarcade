"""FINITION : recaptures (cerf de prisme, fleurs, dessous des îles, garde-robe, halo rose) + mesure des programmes de shaders.
Usage : python3 finition_shots.py DOSSIER [port]"""
import sys, os, time, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8778
os.makedirs(OUT, exist_ok=True); errs = []
def progs(pg): return pg.evaluate("__lumen.renderer.info.programs.length")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
    pg = b.new_page(viewport={"width": 1280, "height": 720})
    pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:200]))
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" and "ERR_TUNNEL" not in m.text and "favicon" not in m.text else None)
    ev = pg.evaluate
    pg.goto(f"http://localhost:{PORT}/lumen/", wait_until="load"); pg.wait_for_function("window.__lumen&&__lumen.S", timeout=90000); pg.wait_for_timeout(2500)
    ev("(async()=>{await __lumen.G.startFrom(null,'auto')})()"); pg.wait_for_timeout(3500)
    ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
    ev("__lumen.give('epee_aube',1);__lumen.st.equip.weapon='epee_aube'"); pg.wait_for_timeout(500)
    def shot(name, zone, pos=None, dist=12, pitch=0.8, yaw=0, wait=1800):
        ev("(()=>{const L=__lumen;L.tpZone('%s'%s);L.S.dist=%s;L.S.pitch=%s;L.S.yaw=L.S.yawT=%s})()" % (zone, (","+json.dumps(pos)) if pos else "", dist, pitch, yaw))
        pg.wait_for_timeout(wait); pg.screenshot(path=f"{OUT}/{name}.png"); print("shot", name, "programmes", progs(pg), flush=True)
    shot("fleurs", "havre", [15, 15], dist=7, pitch=0.5)
    shot("havre", "havre", [15, 15], dist=17, pitch=0.92)
    shot("dessous", "havre", [8, 8], dist=11, pitch=0.5, yaw=2.4)
    ev("(()=>{const L=__lumen;L.S.pitch=0.5;})()")
    ev("__lumen.G.screens.wardrobe&&__lumen.G.screens.wardrobe()"); pg.wait_for_timeout(1800); pg.screenshot(path=f"{OUT}/garderobe.png"); print("shot garderobe")
    ev("__lumen.G.screens.close&&__lumen.G.screens.close()"); pg.wait_for_timeout(500)
    json.dump({"aube_programmes": progs(pg)}, open(f"{OUT}/progs_aube.json", "w"))
    b.close()
print("ERRORS", errs)
