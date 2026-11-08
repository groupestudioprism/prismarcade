"""FINITION : cerf de prisme + vitrail + programmes de shaders dans la Forêt (zones visitées une à une). Usage : python3 finition_foret.py DOSSIER [port]"""
import sys, os, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8778
os.makedirs(OUT, exist_ok=True); errs = []; prog = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
    pg = b.new_page(viewport={"width": 1280, "height": 720})
    pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:200]))
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" and "ERR_TUNNEL" not in m.text and "favicon" not in m.text else None)
    ev = pg.evaluate
    pg.goto(f"http://localhost:{PORT}/lumen/", wait_until="load"); pg.wait_for_function("window.__lumen&&__lumen.S", timeout=90000); pg.wait_for_timeout(2500)
    ev("(async()=>{await __lumen.G.startFrom(null,'auto')})()"); pg.wait_for_timeout(3500)
    ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
    ev("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;window.__old=1;L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}])})()")
    pg.wait_for_function("!window.__old && window.__lumen && __lumen.S && __lumen.G.zoneId && __lumen.G.zoneId() !== null", timeout=150000, polling=500); pg.wait_for_timeout(1500)
    ev("(()=>{const L=__lumen;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';})()")
    n0 = ev("__lumen.renderer.info.programs.length"); print("départ", n0)
    for z in ["vitrebourg", "lisiere", "f1", "f2", "f3", "temple", "belv", "can1", "can2", "can3", "can4", "phare_f"]:
        ev("__lumen.tpZone('%s')" % z); pg.wait_for_timeout(2200)
        prog[z] = ev("__lumen.renderer.info.programs.length"); print(z, prog[z], flush=True)
    ev("(()=>{const L=__lumen;L.tpZone('can3');const e=L.combat.enemies.find(e=>e.type==='cerf_prisme');if(e){L.P.x=e.x;L.P.z=e.z-4.5;L.P.face=0;L.S.dist=7;L.S.pitch=0.6;L.S.yaw=L.S.yawT=0}})()"); pg.wait_for_timeout(2000)
    pg.screenshot(path=f"{OUT}/cerf_prisme.png")
    ev("(()=>{const L=__lumen;L.tpZone('f1');const v=L.isl.ents.find(e=>e.t==='vitrail');if(v){L.tp(v.x,v.y+3);L.S.dist=8;L.S.pitch=0.7}})()"); pg.wait_for_timeout(1800)
    pg.screenshot(path=f"{OUT}/vitrail.png")
    b.close()
json.dump(prog, open(f"{OUT}/programmes.json", "w"), indent=1)
print("ERRORS", errs)
