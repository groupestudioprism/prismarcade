"""Captures mobiles (390x844 portrait, 844x390 paysage) : titre, HUD, dialogue, inventaire, combat, énigme + mesures de débordement.
Usage : python3 mobile_shots.py DOSSIER_SORTIE [port]"""
import sys, time, subprocess, os, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8778
os.makedirs(OUT, exist_ok=True)
srv = None
import socket
s = socket.socket(); ok = s.connect_ex(("127.0.0.1", PORT)) == 0; s.close()
if not ok:
    srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
errs = []; rep = {}
MEASURE = """(()=>{const vw=innerWidth,vh=innerHeight,bad=[];
 document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect(); if(!r.width||!r.height)return; const cs=getComputedStyle(e); if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return; if(e.closest('[hidden]'))return;
  if(e.tagName==='CANVAS'||e.closest('svg'))return;
  const small = (e.matches('button,.btn,.tb,.icon-btn,.choice,.seg button,[data-a],[data-q],input[type=range]')) && (r.width<44||r.height<40) && !e.closest('#hud') ;
  const out = r.right>vw+1||r.left<-1||r.bottom>vh+1;
  const fs=parseFloat(cs.fontSize); const txt=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
  if(out&&r.width<vw*1.5) bad.push('OUT '+(e.id||e.className||e.tagName)+' '+[r.left,r.top,r.right,r.bottom].map(Math.round));
  if(small) bad.push('SMALL '+(e.id||e.className||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height));
  if(txt&&fs<12) bad.push('FONT '+fs+' '+(e.className||e.tagName)+' '+e.textContent.trim().slice(0,20));
 }); return bad.slice(0,40);})()"""
try:
  with sync_playwright() as p:
    for tag, (w, h) in {"p": (390, 844), "l": (844, 390)}.items():
      b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
      ctx = b.new_context(viewport={"width": w, "height": h}, has_touch=True, is_mobile=True, device_scale_factor=2)
      pg = ctx.new_page()
      pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:200]))
      pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" and "ERR_TUNNEL" not in m.text and "favicon" not in m.text else None)
      ev = pg.evaluate
      pg.goto(f"http://localhost:{PORT}/lumen/?touch&nobloom", wait_until="load"); pg.wait_for_function("window.__lumen&&__lumen.S", timeout=90000); pg.wait_for_timeout(2500)
      def shot(name):
          pg.wait_for_timeout(900); pg.screenshot(path=f"{OUT}/{tag}_{name}.png"); rep[f"{tag}_{name}"] = ev(MEASURE); print(tag, name, rep[f"{tag}_{name}"], flush=True)
      shot("titre")
      ev("(async()=>{await __lumen.G.startFrom(null,'auto')})()"); pg.wait_for_timeout(3500)
      shot("dialogue")
      ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()"); pg.wait_for_timeout(800)
      ev("__lumen.tpZone('havre')"); pg.wait_for_timeout(2000); shot("hud")
      ev("__lumen.give('epee_aube',1);__lumen.st.equip.weapon='epee_aube';__lumen.give('potion',3)")
      ev("__lumen.G.screens.menu('inventaire');__lumen.S.mode='screen'"); shot("inventaire")
      ev("__lumen.G.screens.menu('options')"); shot("options")
      ev("__lumen.G.screens.menu('journal')"); shot("journal")
      ev("document.querySelector('#screen').hidden=true;__lumen.S.mode='play'"); 
      ev("(()=>{const L=__lumen;L.tpZone('lande');})()"); pg.wait_for_timeout(1800)
      ev("(()=>{const L=__lumen;const e=L.combat.enemies.find(e=>e.state!=='dead');if(e){L.P.x=e.x;L.P.z=e.z-4;L.P.face=0}})()"); pg.wait_for_timeout(1500); shot("combat")
      ev("(()=>{const L=__lumen;const m=L.isl.ents.find(e=>e.t==='mirror');if(m){L.tp(m.x,m.y+2.5);L.S.dist=15}})()"); pg.wait_for_timeout(2200); shot("enigme")
      b.close()
finally:
  if srv: srv.terminate()
json.dump(rep, open(f"{OUT}/rapport.json", "w"), indent=1)
print("ERRORS", sorted(set(errs))[:10])
