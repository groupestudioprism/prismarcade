import sys, json, time, subprocess
from playwright.sync_api import sync_playwright

srv = subprocess.Popen(["python3", "-m", "http.server", "8775"], cwd=__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","..")),
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
        pg.goto("http://localhost:8775/lumen/", wait_until="load")
        pg.wait_for_timeout(4000)
        pg.evaluate(HELP)
        ev = lambda js: pg.evaluate(js)

        step("nouvelle partie", lambda: ev("(async()=>{await __lumen.G.startFrom(null,'auto'); T.pump(); return __lumen.S.mode})()"))
        pg.wait_for_timeout(1500); ev("T.pump()")
        ev("(()=>{const L=__lumen;['g1','g2'].forEach(g=>L.openGate(g,true));L.quests.advance('q_reveil');L.quests.advance('q_reveil');L.quests.advance('q_reveil');L.tpZone('havre')})()")
        pg.wait_for_timeout(1200)
        SIDE=[("s_pain","maelle","fleur_miel",3),("s_marteau","bran","marteau_bran",1),("s_ysolde","ysolde","brume",5),("s_pendentif","tobias","pendentif",1)]
        for q,giver,item,n in SIDE:
            step("%s: proposition"%q, lambda q=q,giver=giver: ev("(()=>{const L=__lumen;L.tpZone('havre');const r=T.talk('%s');return L.quests.state('%s')+' choix='+JSON.stringify(r.choices)})()"%(giver,q)))
            step("%s: démarrée"%q, lambda q=q: ev("(()=>{const L=__lumen;if(L.quests.state('%s')==='none')L.quests.start('%s');return L.quests.state('%s')})()"%(q,q,q)))
            step("%s: objet"%q, lambda item=item,n=n: ev("(()=>{const L=__lumen;const e=L.isl.ents.find(x=>x.item==='%s');return e?e.id+'@'+e.x+','+e.y+' zone='+e.zone:'ENTITÉ ABSENTE'})()"%item))
            step("%s: rendre"%q, lambda q=q,giver=giver,item=item,n=n: ev("(()=>{const L=__lumen;L.give('%s',%d);L.quests.check();const s1=L.quests.stepId('%s');const e0=L.st.player.ecus;L.tpZone('havre');T.talk('%s');return s1+' -> '+L.quests.state('%s')+' ecus+'+(L.st.player.ecus-e0)})()"%(item,n,q,giver,q)))
        # lampions: vraie interaction
        step("s_lampions", lambda: ev("""(async()=>{const L=__lumen;L.tpZone('havre');T.talk('mira');L.quests.state('s_lampions')==='none'&&L.quests.start('s_lampions');
          const lamps=L.isl.ents.filter(e=>e.t==='lamp');let ok=0;
          for(const l of lamps){L.tpZone('havre',[l.x-1,l.y]);await T.tick(150);const t=L.target();if(t&&t.kind==='lamp'){L.interact();ok++;await T.tick(80);}}
          return JSON.stringify({lampes:lamps.length,allumees:ok,compte:L.G.counts('lampions'),step:L.quests.stepId('s_lampions')})})()"""))
        step("s_lampions rendre", lambda: ev("(()=>{const L=__lumen;T.talk('mira');return L.quests.state('s_lampions')})()"))
        # pages, éclats : décompte réel
        step("pages/éclats comptes", lambda: ev("JSON.stringify({pages:__lumen.isl.ents.filter(e=>e.t==='page').length,eclats:__lumen.isl.ents.filter(e=>e.t==='shard').length})"))
        step("s_pages fin", lambda: ev("(()=>{const L=__lumen;T.talk('lison');if(L.quests.state('s_pages')==='none')L.quests.start('s_pages');L.isl.ents.filter(e=>e.t==='page').forEach(e=>L.st.world.picked[e.id]=1);L.quests.check();T.talk('lison');return L.quests.state('s_pages')+' cle='+L.st.inv.cle_orin})()"))
        step("s_prisme fin", lambda: ev("(()=>{const L=__lumen;T.talk('pell');if(L.quests.state('s_prisme')==='none')L.quests.start('s_prisme');L.isl.ents.filter(e=>e.t==='shard').slice(0,8).forEach(e=>L.st.world.picked[e.id]=1);L.quests.check();T.talk('pell');return L.quests.state('s_prisme')+' unlock='+JSON.stringify(L.st.unlocked||L.st.wardrobe)})()"))
        step("s_chasse fin", lambda: ev("(()=>{const L=__lumen;T.talk('aldo');if(L.quests.state('s_chasse')==='none')L.quests.start('s_chasse');L.st.stats.kills+=12;L.quests.check();T.talk('aldo');return L.quests.state('s_chasse')})()"))
        step("bilan quêtes", lambda: ev("JSON.stringify({done:__lumen.quests.done().length,actives:__lumen.quests.active()})"))
        step("complétion", lambda: ev("JSON.stringify(__lumen.completion())"))
        b.close()
finally:
    srv.terminate()
print("ERRORS:", sorted(set(errs))[:20])
