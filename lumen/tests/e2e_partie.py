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

        step("nouvelle partie", lambda: ev("(async()=>{await __lumen.G.startFrom(null,'auto'); return __lumen.S.mode})()"))
        pg.wait_for_timeout(1500)
        step("intro", lambda: ev("T.pump()"))
        step("quête 1 active", lambda: ev("T.q('q_reveil')"))
        pg.screenshot(path="/tmp/t_auberge.png")
        step("tp havre", lambda: ev("__lumen.tpZone('havre'); T.q('q_reveil')"))
        pg.wait_for_timeout(1200)
        pg.screenshot(path="/tmp/t_havre.png")
        step("Séléné 1", lambda: ev("T.talk('selene')"))
        step("après Séléné 1", lambda: ev("T.q('q_reveil')+' baton='+__lumen.st.inv.baton"))
        step("rivage g1 g2", lambda: ev("__lumen.openGate('g1');__lumen.openGate('g2'); __lumen.quests.check(); T.q('q_reveil')"))
        step("Séléné 2", lambda: ev("T.talk('selene'); T.q('q_reveil')+' | '+T.q('q_lentille')"))
        step("Bran 1", lambda: ev("T.talk('bran'); T.q('q_lentille')"))
        step("brume x3", lambda: ev("__lumen.give('brume',3); __lumen.quests.check(); T.q('q_lentille')"))
        step("Bran 2", lambda: ev("T.talk('bran'); T.q('q_lentille')+' arme='+__lumen.st.equip.weapon"))
        step("lande", lambda: ev("__lumen.tpZone('lande'); T.q('q_lentille')"))
        pg.wait_for_timeout(1500)
        pg.screenshot(path="/tmp/t_lande.png")
        step("sanctuaire", lambda: ev("__lumen.tpZone('sanctuaire'); __lumen.quests.check(); T.q('q_lentille')"))
        pg.wait_for_timeout(2500)
        pg.screenshot(path="/tmp/t_sanct.png")
        step("salle scellée", lambda: ev("JSON.stringify({has:__lumen.combat.hasRoom('sd_combat'),alive:__lumen.combat.roomAlive('sd_combat'),gate:__lumen.G.isGateOpen('sd_combat')})"))
        step("tuer salle", lambda: ev("(async()=>{const c=__lumen.combat;c.enemies.filter(e=>e.room==='sd_combat').forEach(e=>c.dealDamage(e,9999,'tranchant',{}));await T.tick(300);return JSON.stringify({alive:c.roomAlive('sd_combat'),gate:__lumen.G.isGateOpen('sd_combat'),kills:__lumen.st.stats.kills})})()"))
        step("objets sanctuaire", lambda: ev("__lumen.isl.ents.filter(e=>e.t==='key'||e.t==='chest'||e.t==='mirror'&&e.x>=22&&e.x<=30&&e.y>=56).map(e=>e.id+':'+e.t+'@'+e.x+','+e.y).slice(0,20).join(' ')"))
        step("boss: arène", lambda: ev("__lumen.tpZone('sanctuaire',[15,40]);1"))
        pg.wait_for_timeout(800)
        step("boss: présent", lambda: ev("(()=>{const b=__lumen.combat.enemies.find(e=>e.boss);return b?JSON.stringify({x:b.x,z:b.z,hp:b.hp,state:b.state}):'absent'})()"))
        step("boss: combat ~10 s", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;const b=c.enemies.find(e=>e.boss);
          const log=[];for(let i=0;i<60;i++){L.st.player.hp=100;L.P.x=b.x+3;L.P.z=b.z+3;L.P.face=Math.atan2(b.x-L.P.x,b.z-L.P.z);
          c.melee({mult:1});await T.tick(160);log.push(b.state+':'+Math.round(b.hp)+':p'+b.phase);}
          return log.filter((v,i)=>i%6==0).join(' ')})()"""))
        step("boss: vaincre", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;const b=c.enemies.find(e=>e.boss);
          c.dealDamage(b,99999,'contondant',{heavy:true});await T.tick(2500);
          return JSON.stringify({flag:L.st.flags.boss_colosse,len:L.st.inv.lentille,q:T.q('q_lentille'),mode:L.S.mode})})()"""))
        step("Séléné 3", lambda: ev("__lumen.tpZone('havre');T.talk('selene'); T.q('q_lentille')+' | '+T.q('q_phare')"))
        step("g3..g9", lambda: ev("['g3','g4','g5','g6','g7','g8','g9'].forEach(g=>__lumen.openGate(g,true));__lumen.quests.check();T.q('q_phare')"))
        step("sceau: cible", lambda: ev("(async()=>{const L=__lumen;L.tpZone('phare');await T.tick(400);const t=L.target();return JSON.stringify({target:t&&t.kind,lens:L.st.inv.lentille})})()"))
        step("sceau: poser lentille", lambda: ev("(async()=>{const L=__lumen;L.interact();await T.tick(200);return JSON.stringify({set:L.st.flags.lens_set,q:T.q('q_phare')})})()"))
        step("phare end", lambda: ev("__lumen.openGate('end');__lumen.quests.check();T.q('q_phare')"))
        step("Séléné fin", lambda: ev("__lumen.tpZone('havre');T.talk('selene');T.q('q_phare')+' mode='+__lumen.S.mode"))
        pg.wait_for_timeout(2500)
        pg.screenshot(path="/tmp/t_fin.png")
        step("complétion", lambda: ev("JSON.stringify(__lumen.completion())"))
        step("sauvegarde s1", lambda: ev("__lumen.saveTo('s1').then(r=>JSON.stringify(r))"))
        step("rechargement s1", lambda: ev("(async()=>{const s=await __lumen.G.saves.read('s1');await __lumen.G.startFrom(s,'s1');return T.q('q_phare')+' potions='+__lumen.st.inv.potion+' gates='+Object.keys(__lumen.st.world.gates).length})()"))
        pg.wait_for_timeout(500)
        b.close()
finally:
    srv.terminate()
print("\nERRORS:", sorted(set(errs))[:20])
print("FAILS:", [r for r in results if r[1] != 'OK'])
