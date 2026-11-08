import sys, json, time, subprocess
from playwright.sync_api import sync_playwright

def wait_reloaded(pg, timeout=150000):
    """Après un voyage (rechargement de page) : sondage actif au lieu d'un délai fixe."""
    pg.wait_for_function("!window.__old && window.__lumen && __lumen.S && __lumen.G.zoneId && __lumen.G.zoneId() !== null", timeout=timeout, polling=500)
    pg.wait_for_timeout(800)
OUT = sys.argv[1]; PORT = 8775
srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
errs = []
COUNT = """
(()=>{ if(window.__dc) return; window.__dc={n:0,f:0};
 for (const C of [WebGL2RenderingContext, WebGLRenderingContext]) { for (const k of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']) { const o=C.prototype[k]; C.prototype[k]=function(){ window.__dc.n++; return o.apply(this,arguments);} } }
 const loop=()=>{window.__dc.f++;requestAnimationFrame(loop)};loop(); })()
"""
def dc(pg):
    pg.evaluate("window.__dc.n=0;window.__dc.f=0"); pg.wait_for_timeout(800)
    r = pg.evaluate("window.__dc.f?Math.round(window.__dc.n/window.__dc.f):0"); return r
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 720})
        pg.add_init_script(COUNT)
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text else None)
        pg.goto("http://localhost:%d/lumen/" % PORT, wait_until="load"); pg.wait_for_timeout(4000)
        ev = pg.evaluate
        ev("(async()=>{await __lumen.G.startFrom(null,'auto'); })()"); pg.wait_for_timeout(3500)
        ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
        pg.wait_for_timeout(800)
        ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
        ev("__lumen.give('epee_aube',1);__lumen.st.equip.weapon='epee_aube';['g1','g2'].forEach(g=>__lumen.openGate(g,true))")
        def shot(name, z, pos=None, dist=17, pitch=0.95, yaw=None, wait=1800):
            ev("(()=>{const L=__lumen;L.S.dist=%s;L.S.pitch=%s;%sL.tpZone('%s'%s)})()" % (dist, pitch, ("L.S.yaw=L.S.yawT=%s;" % yaw) if yaw is not None else "", z, (","+json.dumps(pos)) if pos else ""))
            pg.wait_for_timeout(wait); pg.screenshot(path="%s/%s.png" % (OUT, name)); print("shot", name, "dc", dc(pg), flush=True)
        which = sys.argv[2] if len(sys.argv) > 2 else "all"
        if which in ("all", "aube"):
            shot("a_havre", "havre", [15, 15]); shot("a_havre2", "havre", [8, 8]); shot("a_havre_close", "havre", [15, 15], dist=8, pitch=0.55)
            shot("a_auberge", "auberge_in"); shot("a_orin", "orin_in"); shot("a_lande", "lande", [15, 12]); shot("a_lande2", "lande", [10, 20])
            shot("a_sanct", "sanctuaire", [15, 4]); shot("a_boss", "sanctuaire", [15, 24])
            shot("a_z1", "z1"); shot("a_z4", "z4"); shot("a_z7", "z7"); shot("a_phare", "phare"); shot("a_s1", "s1")
        if which in ("all", "foret"):
            ev("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;window.__old=1;L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}])})()")
            wait_reloaded(pg)
            ev("(()=>{const L=__lumen;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';})()")
            shot("f_bourg", "vitrebourg", [12, 7]); shot("f_bourg2", "vitrebourg", [15, 15]); shot("f_bourg_close", "vitrebourg", [12, 7], dist=8, pitch=0.55)
            shot("f_f1", "f1"); shot("f_f2", "f2"); shot("f_f3", "f3"); shot("f_lis", "lisiere"); shot("f_lis2", "lisiere", [17, 20])
            shot("f_temple", "temple", [15, 4]); shot("f_temple_boss", "temple", [15, 22]); shot("f_auberge", "auberge_f"); shot("f_belv", "belv")
        b.close()
finally:
    srv.terminate()
print("ERRORS:", sorted(set(errs))[:20])
