import sys, time, subprocess, json
from playwright.sync_api import sync_playwright
PORT = 8775
srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.2)
QS = sys.argv[1] if len(sys.argv) > 1 else ""
errs = []
def wait_for(pg, js, timeout=60000):
    pg.wait_for_function(js, timeout=timeout, polling=500)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1000, "height": 600})
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:300]))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text[:300]) if m.type == "error" else None)
        pg.goto(f"http://localhost:{PORT}/lumen/{QS}", wait_until="load"); wait_for(pg, "window.__lumen && __lumen.S")
        pg.wait_for_timeout(3000)
        print("title ok", pg.evaluate("__lumen.S.mode"))
        def draw(name):
            pg.evaluate("__lumen.S.mode='play'")
            if name not in ("aube-start",):
                try: wait_for(pg, f"__lumen.G.zoneId()==='{name}'", 40000)
                except Exception as e: print("no zone", name)
            pg.wait_for_timeout(1500); pg.screenshot(path=f"/tmp/gfx/probe_{name}{'_low' if 'low' in QS else ''}.png")
            r = pg.evaluate("(()=>{const L=__lumen,R=L.renderer,i=R.info;R.info.autoReset=false;R.info.reset();R.shadowMap.needsUpdate=true;R.render(L.scene,L.camera);const o={zone:L.G.zoneId(),calls:i.render.calls,tris:i.render.triangles,geo:i.memory.geometries};R.info.autoReset=true;return JSON.stringify(o)})()")
            print(name, r)
        pg.evaluate("(async()=>{await __lumen.G.startFrom(null,'auto')})()"); pg.wait_for_timeout(2500)
        pg.evaluate("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n<400){n++;const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()"); pg.wait_for_timeout(1500)
        draw("aube-start")
        for z in ["havre"]:
            ok = pg.evaluate(f"(()=>{{try{{__lumen.tpZone('{z}');return 1}}catch(e){{return 0}}}})()")
            if ok: draw(z)
        # travel to foret
        pg.evaluate("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;L.st.quests.q_reveil={state:'done',step:3,base:{}};L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}]);})()")
        pg.wait_for_timeout(3000)
        wait_for(pg, "window.__lumen && __lumen.S && __lumen.isl && __lumen.isl.zones === undefined ? true : (window.__lumen && __lumen.G.zoneId && __lumen.G.zoneId()==='vitrebourg')", 90000)
        draw("vitrebourg")
        for z in ["lisiere", "temple", "can1", "can2", "can3", "can4", "phare_f"]:
            pg.evaluate(f"__lumen.tpZone('{z}')"); draw(z)
        print("ERRORS:", sorted(set(errs))[:15])
        b.close()
finally: srv.terminate()
