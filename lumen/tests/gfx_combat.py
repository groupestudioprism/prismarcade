import sys, json, time, subprocess
from playwright.sync_api import sync_playwright

def wait_reloaded(pg, timeout=150000):
    """Après un voyage (rechargement de page) : sondage actif au lieu d'un délai fixe."""
    pg.wait_for_function("!window.__old && window.__lumen && __lumen.S && __lumen.G.zoneId && __lumen.G.zoneId() !== null", timeout=timeout, polling=500)
    pg.wait_for_timeout(800)
OUT = sys.argv[1]; PORT = 8775
srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 720})
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.goto("http://localhost:%d/lumen/" % PORT, wait_until="load"); pg.wait_for_timeout(4000)
        ev = pg.evaluate
        ev("(async()=>{await __lumen.G.startFrom(null,'auto'); })()"); pg.wait_for_timeout(3500)
        ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
        ev("__lumen.give('epee_aube',1);__lumen.st.equip.weapon='epee_aube';")
        def foc(name, zone, typ, state=None, dist=7, pitch=0.6):
            ev("(()=>{const L=__lumen;L.tpZone('%s');})()" % zone); pg.wait_for_timeout(1500)
            r = ev("""(()=>{const L=__lumen;const es=L.combat.enemies.filter(e=>e.type==='%s');if(!es.length)return 'none';const e=es[0];
              L.P.x=e.x;L.P.z=e.z-4.5;L.P.face=0;L.S.dist=%s;L.S.pitch=%s;L.S.yaw=L.S.yawT=0;%s return e.x+','+e.z;})()""" % (typ, dist, pitch, ("es[0].state='%s';es[0].t=0;" % state) if state else ""))
            pg.wait_for_timeout(1400); pg.screenshot(path="%s/%s.png" % (OUT, name)); print("shot", name, r, flush=True)
        which = sys.argv[2] if len(sys.argv) > 2 else "aube"
        if which == "aube":
            foc("c_brumelin", "lande", "brumelin"); foc("c_ronceux", "lande", "ronceux"); foc("c_ronceux_wind", "lande", "ronceux", "wind"); foc("c_lanceur", "lande", "lanceur"); foc("c_sanglier", "lande", "sanglier"); foc("c_sanglier_wind", "lande", "sanglier", "wind")
            foc("c_gardien", "sanctuaire", "gardien"); foc("c_colosse", "sanctuaire", "colosse", None, 14, 0.7)
        else:
            ev("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;window.__old=1;L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}])})()"); pg.wait_for_timeout(8500)
            ev("(()=>{const L=__lumen;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';})()")
            foc("c_eclat", "lisiere", "eclat"); foc("c_lierre", "lisiere", "lierre"); foc("c_cerf", "lisiere", "cerf"); foc("c_cerf_wind", "lisiere", "cerf", "wind"); foc("c_sentinelle", "temple", "sentinelle"); foc("c_gverre", "temple", "gardien_verre", None, 14, 0.7)
        b.close()
finally:
    srv.terminate()
print("ERRORS:", sorted(set(errs))[:10])
