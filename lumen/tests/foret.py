import sys, json, time, subprocess
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["python3", "-m", "http.server", "8765"], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
errs = []; results = []
def step(name, fn):
    try:
        r = fn(); results.append((name, "OK", r)); print("OK  ", name, r if r is not None else "")
    except Exception as e:
        results.append((name, "FAIL", str(e)[:300])); print("FAIL", name, str(e)[:500])
HELP = """
window.T = {
  talk(id){ const L=__lumen; L.G.screens.dialog(id); return T.pump(); },
  pump(pick){ const L=__lumen; let n=0, last=[];
    while(L.G.screens.dialogOpen && n<400){ n++;
      const ch=document.querySelectorAll('#dialog .choice');
      if(ch.length){ last.push([...ch].map(c=>c.textContent)); L.G.screens.choose(pick===undefined?ch.length-1:Math.min(pick,ch.length-1)); }
      else L.G.screens.nextLine(); }
    return {n, open:L.G.screens.dialogOpen, choices:last}; },
  q(id){ return __lumen.quests.state(id)+':'+__lumen.quests.stepId(id); },
  tick(ms){ return new Promise(r=>setTimeout(r,ms||60)); },
  solve(zoneIdx, gate){ const L=__lumen; const rots=L.isl.ents.filter(e=>e.rot&&e.zone===zoneIdx);
    const ORD=['N','E','S','W']; const st=e=>e.t==='mirror'?[0,1]:ORD; const tot=rots.reduce((a,e)=>a*st(e).length,1);
    for(let n=0;n<tot;n++){ let k=n; rots.forEach(e=>{const s=st(e); L.set(e.id,s[k%s.length]); k=Math.floor(k/s.length);}); if(L.isl.gates[gate].open) return n; }
    return -1; }
};
"""
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 720})
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text else None)
        pg.goto("http://localhost:8765/lumen/", wait_until="load"); pg.wait_for_timeout(3500); pg.evaluate(HELP)
        ev = lambda js: pg.evaluate(js)
        step("aube: nouvelle partie", lambda: ev("(async()=>{await __lumen.G.startFrom(null,'auto'); T.pump(); return __lumen.S.mode})()"))
        pg.wait_for_timeout(1200)
        step("aube: calixte avant l'acte", lambda: ev("T.talk('calixte')"))
        step("aube: voyage", lambda: ev("(()=>{const L=__lumen;L.st.flags.acte1_fini=1;L.st.quests.q_reveil={state:'done',step:3,base:{}};L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}]);return 'ok'})()"))
        pg.wait_for_timeout(7000)
        pg.evaluate(HELP)
        step("foret: chargée", lambda: ev("(()=>{const L=__lumen;return JSON.stringify({mode:L.S.mode,zone:L.G.zoneId(),isl:L.st.player.island,x:Math.round(L.P.x),z:Math.round(L.P.z)})})()"))
        pg.wait_for_timeout(1500)
        pg.screenshot(path="/tmp/f_bourg.png")
        step("ambre: dialogue + quête", lambda: ev("(()=>{const L=__lumen;L.st.quests.q_verre||L.quests.start('q_verre');const r=T.talk('ambre');return JSON.stringify({r,q:T.q('q_verre'),b:L.isl.gates.b_vitres.open,l:L.isl.gates.b_lisiere.open})})()"))
        for sid in ["opaline","silex","galet"]:
            step("boutique "+sid, lambda sid=sid: ev("""(async()=>{const L=__lumen;L.st.player.ecus=5000;L.G.screens.close();
              try{L.G.screens.shop('%s',true)}catch(e){return 'ERR '+e.message}
              await T.tick(200);const li=document.querySelectorAll('#screen .shop-list li').length;
              const buy=document.querySelector('#screen [data-buy]');const before=L.st.player.ecus;if(buy)buy.click();await T.tick(200);
              const r=JSON.stringify({lignes:li,achat:before-L.st.player.ecus});L.G.screens.close();return r})()""" % sid))
        for n in ["silex","perle","ficus","tessel","galet","opaline"]:
            step("dialogue "+n, lambda n=n: ev("(()=>{__lumen.G.screens.close();return JSON.stringify(T.talk('%s'))})()" % n))
        step("repos aubergiste", lambda: ev("(async()=>{const L=__lumen;L.G.screens.close();L.tpZone('auberge_f');await T.tick(300);return JSON.stringify(T.talk('mousse'))})()"))
        # puzzles
        def solve(zid, gate):
            return ev("""(async()=>{const L=__lumen;L.G.screens.close();const zi=%d;L.tpZone('%s');await T.tick(400);const n=T.solve(zi,'%s');return JSON.stringify({sol:n,open:L.isl.gates['%s'].open})})()"""%({'f1':1,'f2':2,'f3':3}[zid],zid,gate,gate))
        # indices de zones : vitrebourg0? -> calculé en page
        zi = ev("(()=>__lumen.isl.def.zones.map(z=>z.id))()"); print("zones", zi)
        def idx(z): return zi.index(z)
        for zid, gate in [("f1","fg1"),("f2","fg2"),("f3","fg3")]:
            step("énigme "+zid, lambda zid=zid, gate=gate: ev("""(async()=>{const L=__lumen;L.G.screens.close();L.tpZone('%s');await T.tick(400);const n=T.solve(%d,'%s');return JSON.stringify({sol:n,open:L.isl.gates['%s'].open,q:T.q('q_verre')})})()"""%(zid,idx(zid),gate,gate)))
        pg.screenshot(path="/tmp/f_f3.png")
        step("belvédère", lambda: ev("(async()=>{const L=__lumen;L.tpZone('belv');await T.tick(600);return JSON.stringify({z:L.G.zoneId(),q:T.q('q_verre')})})()"))
        step("lisière: ennemis", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;L.tpZone('lisiere',[15,3]);await T.tick(800);
          const t={};c.enemies.forEach(e=>t[e.type]=(t[e.type]||0)+1);return JSON.stringify({t,q:T.q('q_verre')})})()"""))
        pg.screenshot(path="/tmp/f_lis.png")
        step("combat éclat/cerf", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;L.give('epee_verre',1);L.st.equip.weapon='epee_verre';L.st.player.hp=999;
          const e=c.enemies.find(x=>x.type==='eclat');L.P.x=e.x;L.P.z=e.z+1.3;L.P.face=Math.PI;let k=0;for(let i=0;i<30&&e.state!=='dead';i++){L.st.player.hp=999;L.P.x=e.x;L.P.z=e.z+1.3;k+=c.melee({mult:1});await T.tick(110);}
          return JSON.stringify({dead:e.state==='dead',hits:k,drops:Object.keys(L.st.inv)})})()"""))
        step("temple: énigme + boss", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';
          L.tpZone('temple',[15,24]);for(let i=0;i<80&&!c.enemies.find(e=>e.boss);i++)await T.tick(100);
          const b=c.enemies.find(e=>e.boss);return b?JSON.stringify({type:b.type,hp:b.hp,state:b.state}):'absent'})()"""))
        pg.screenshot(path="/tmp/f_boss.png")
        step("boss: combat", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;const b=c.enemies.find(e=>e.boss);
          b.hp=b.maxHp*0.44;await T.tick(2500);const adds=c.enemies.filter(e=>e.adds&&e.state!=='dead').length;const ph=b.phase;b.hp=60;for(let i=0;i<40&&b.state!=='dead';i++){L.st.player.hp=999;L.P.x=b.x;L.P.z=b.z+b.def.radius+1.2;L.P.face=Math.PI;c.melee({mult:1});await T.tick(120);}
          await T.tick(2500);return JSON.stringify({adds,ph,state:b.state,flag:L.st.flags.boss_verre,warp:L.st.world.warps.temple,q:T.q('q_verre')})})()"""))
        step("coffre prisme_vert", lambda: ev("""(async()=>{const L=__lumen;L.tpZone('temple',[15,24]);await T.tick(300);const v=Object.values(L.world.chestViews).find(cv=>cv.c.id==='ch_prisme');return JSON.stringify({visible:v&&v.g.visible})})()"""))
        step("retour ambre", lambda: ev("(()=>{const L=__lumen;L.give('prisme_vert',1);L.G.screens.close();const r=T.talk('ambre');return JSON.stringify({r,q:T.q('q_verre'),flag:L.st.flags.verre_fini})})()"))
        step("retour à l'Aube", lambda: ev("(()=>{const L=__lumen;L.G.screens.close();L.G.runEffects([{travel:{to:'aube',zone:'havre',cell:[27,7]}}]);return 'ok'})()"))
        pg.wait_for_timeout(12000); pg.evaluate(HELP)
        step("aube rechargée", lambda: ev("(()=>{const L=__lumen;return JSON.stringify({zone:L.G.zoneId(),isl:L.st.player.island,flag:L.st.flags.boss_verre,gates:Object.keys(L.st.otherWorlds||{})})})()"))
        pg.wait_for_timeout(500)
        b.close()
finally:
    srv.terminate()
print("\nERRORS:", sorted(set(errs))[:20])
print("FAILS:", [r for r in results if r[1] != 'OK'])
