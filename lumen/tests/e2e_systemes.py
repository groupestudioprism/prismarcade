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
        pg.wait_for_timeout(1500)
        ev("T.pump()")
        step("boss: apparition", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;L.give('epee_aube',1);L.st.equip.weapon='epee_aube';
          L.tpZone('sanctuaire',[15,24]);for(let i=0;i<80&&!c.enemies.find(e=>e.boss);i++)await T.tick(100);
          const b=c.enemies.find(e=>e.boss);return b?JSON.stringify({x:b.x,z:b.z,hp:b.hp,r:b.def.radius,state:b.state}):'absent'})()"""))
        step("boss: corps à corps", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;const b=c.enemies.find(e=>e.boss);
          const hp0=b.hp;let hits=0;
          for(let i=0;i<40;i++){L.st.player.hp=100;L.P.x=b.x;L.P.z=b.z+b.def.radius+1.2;L.P.face=Math.PI;hits+=c.melee({mult:1});await T.tick(120);}
          return JSON.stringify({hp0,hp:b.hp,hits,state:b.state,phase:b.phase})})()"""))
        step("boss: phase 2", lambda: ev("""(async()=>{const L=__lumen,c=L.combat;const b=c.enemies.find(e=>e.boss);
          b.hp=b.maxHp*0.45;await T.tick(2500);const adds=c.enemies.filter(e=>e.adds&&e.state!=='dead').length;
          return JSON.stringify({phase:b.phase,adds,state:b.state,pvJoueur:L.st.player.hp})})()"""))
        step("mort du joueur", lambda: ev("""(async()=>{const L=__lumen;const e0=L.st.player.ecus;L.G.hurtPlayer(9999,L.P.x,L.P.z,{});await T.tick(1200);
          return JSON.stringify({mode:L.S.mode,deadScreen:!!document.querySelector('#screen .panel, #screen')?.innerText.slice(0,60),ecus0:e0,ecus:L.st.player.ecus})})()"""))
        step("mort: relance", lambda: ev("""(async()=>{const L=__lumen;const b=[...document.querySelectorAll('#screen button')].map(x=>x.textContent.trim()+'|'+(x.dataset.a||''));
          return JSON.stringify(b)})()"""))
        pg.screenshot(path="/tmp/t_mort.png")
        step("mort: continuer", lambda: ev("""(async()=>{const L=__lumen;const bt=document.querySelector('#screen [data-a="respawn"],#screen .btn.primary');if(bt)bt.click();await T.tick(1500);
          return JSON.stringify({mode:L.S.mode,hp:L.st.player.hp,alive:L.P.alive,zone:L.G.zoneId()})})()"""))
        # boutiques
        for sid in ["ysolde","bran","pell","gaspard","lison"]:
            step("boutique "+sid, lambda sid=sid: ev("""(async()=>{const L=__lumen;L.st.player.ecus=5000;L.tpZone('havre');L.G.screens.close();
              let ok=false;try{L.G.screens.shop('%s');ok=true}catch(e){return 'ERR '+e.message}
              await T.tick(200);const li=document.querySelectorAll('#screen .shop-list li').length;
              const buy=document.querySelector('#screen [data-buy]');const before=L.st.player.ecus;if(buy)buy.click();await T.tick(200);
              const r=JSON.stringify({lignes:li,achat:before-L.st.player.ecus});L.G.screens.close();return r})()""" % sid))
        step("vente gaspard", lambda: ev("""(async()=>{const L=__lumen;L.give('brume',4);L.G.screens.shop('gaspard',true);await T.tick(200);
          const s=document.querySelector('#screen [data-sell]');const e0=L.st.player.ecus;if(s)s.click();await T.tick(200);const r=e0<L.st.player.ecus;L.G.screens.close();return 'vente='+r})()"""))
        step("forge", lambda: ev("""(async()=>{const L=__lumen;L.give('brume',10);L.give('pierre',10);L.give('fibre',10);L.give('bois',10);L.st.player.ecus=5000;L.G.screens.forge();await T.tick(300);
          const bt=[...document.querySelectorAll('#screen button')].map(x=>x.dataset.a||x.className).slice(0,12);
          const act=document.querySelector('#screen [data-up],#screen [data-craft],#screen [data-a="up"]');if(act)act.click();await T.tick(300);L.G.screens.close();return JSON.stringify(bt)})()"""))
        step("garde-robe", lambda: ev("""(async()=>{const L=__lumen;L.G.screens.wardrobe();await T.tick(500);
          const n=document.querySelectorAll('#screen button').length;const sw=document.querySelector('#screen [data-hair],#screen [data-opt],#screen [data-look]');
          if(sw)sw.click();await T.tick(300);L.G.screens.close();return 'boutons='+n+' clic='+!!sw})()"""))
        pg.screenshot(path="/tmp/t_robe.png")
        for m in ["inventaire","personnage","journal","carte","options"]:
            step("menu "+m, lambda m=m: ev("""(async()=>{const L=__lumen;L.G.screens.close();L.G.screens.menu('%s');await T.tick(250);const t=document.querySelector('#screen').innerText.length;L.G.screens.close();return 'texte='+t})()""" % m))
        step("potion (F)", lambda: ev("(()=>{const L=__lumen;L.st.player.hp=10;L.give('potion',1);L.G.useQuick();return L.st.player.hp})()"))
        step("repos/lit", lambda: ev("(()=>{const L=__lumen;L.tpZone('auberge_in');return typeof L.G.shopStock})()"))
        pg.wait_for_timeout(500)
        b.close()
finally:
    srv.terminate()
print("\nERRORS:", sorted(set(errs))[:20])
print("FAILS:", [r for r in results if r[1] != 'OK'])
