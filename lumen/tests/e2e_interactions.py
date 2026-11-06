import sys, json, time, subprocess
from playwright.sync_api import sync_playwright

srv = subprocess.Popen(["python3", "-m", "http.server", "8765"], cwd=__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","..")),
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
        b = p.chromium.launch(executable_path=__import__("os").environ.get("CHROME","/usr/bin/google-chrome"),
                              args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 720})
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text)
              if m.type == "error" and "ERR_TUNNEL" not in m.text else None)
        pg.goto("http://localhost:8765/lumen/", wait_until="load")
        pg.wait_for_timeout(4000)
        pg.evaluate(HELP)
        ev = lambda js: pg.evaluate(js)

        step("nouvelle partie", lambda: ev("(async()=>{await __lumen.G.startFrom(null,'auto'); T.pump(); return __lumen.S.mode})()"))
        pg.wait_for_timeout(1500); ev("T.pump()")
        ev("(()=>{const L=__lumen;['g1','g2'].forEach(g=>L.openGate(g,true));L.tpZone('havre');L.give('baton',1)})()")
        pg.wait_for_timeout(1200)
        step("lampions: 7 props", lambda: ev("__lumen.world.props.filter(p=>p.p.t==='lamp').length"))
        step("lampions: vraie interaction", lambda: ev("""(async()=>{const L=__lumen;L.quests.start('s_lampions');
          const ps=L.world.props.filter(p=>p.p.t==='lamp');let ok=0;
          for(const pr of ps){for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){L.P.x=pr.g.position.x+dx;L.P.z=pr.g.position.z+dz;await T.tick(150);const t=L.target();if(t&&t.kind==='lamp'){L.interact();ok++;await T.tick(100);break;}}}
          return JSON.stringify({props:ps.length,interactions:ok,compte:L.G.counts('lampions'),step:L.quests.stepId('s_lampions')})})()"""))
        step("pendentif: ramassage réel", lambda: ev("""(async()=>{const L=__lumen;L.tpZone('havre',[26,20]);await T.tick(400);
          const t=L.target();const k=t&&t.kind;if(t)L.interact();await T.tick(200);return JSON.stringify({cible:k,pendentif:L.st.inv.pendentif})})()"""))
        step("coffre marteau (Lande, [29,17])", lambda: ev("""(async()=>{const L=__lumen;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';L.tpZone('lande',[29,17]);await T.tick(700);
          const t=L.target();const k=t&&t.kind;if(t)L.interact();await T.tick(300);return JSON.stringify({cible:k,label:t&&t.label,marteau:L.st.inv.marteau_bran||0,ouvert:!!L.st.world.chests&&JSON.stringify(L.st.world.chests).slice(0,80)})})()"""))
        pg.screenshot(path="/tmp/t_lande2.png")
        b.close()
finally:
    srv.terminate()
print("ERRORS:", sorted(set(errs))[:20])
