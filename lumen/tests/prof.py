import time, subprocess, sys, json
from playwright.sync_api import sync_playwright
zone = sys.argv[1] if len(sys.argv)>1 else 'havre'
srv = subprocess.Popen(["python3", "-m", "http.server", "8775"], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1000, "height": 600}); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)[:300]))
        pg.goto("http://localhost:8775/lumen/", wait_until="load"); pg.wait_for_timeout(4000)
        ev=pg.evaluate
        ev("(async()=>{await __lumen.G.startFrom(null,'auto'); })()"); pg.wait_for_timeout(3500)
        ev("(()=>{const L=__lumen;let n=0;while(L.G.screens.dialogOpen&&n++<300){const ch=document.querySelectorAll('#dialog .choice');if(ch.length)L.G.screens.choose(ch.length-1);else L.G.screens.nextLine();}})()")
        ev("__lumen.tpZone('%s')"%zone); pg.wait_for_timeout(2500)
        r=ev("""(()=>{const L=__lumen;const sc=L.G.scene;const cam=L.G.camera;
          const fr=new (sc.constructor.prototype.constructor===Object?Object:Object)();
          const out={};let tot=0,inst=0,shadowCasters=0;
          sc.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isSprite||o.isLine))return; let v=true;for(let a=o;a;a=a.parent){if(!a.visible){v=false;break}} if(!v)return;
            if(o.isMesh&&o.count===0)return;
            tot++; if(o.isInstancedMesh)inst++; if(o.castShadow)shadowCasters++;
            let p=o.parent;let key=o.isSprite?'sprite':o.isPoints?'points':(o.isInstancedMesh?'inst':'mesh'); out[key]=(out[key]||0)+1;});
          const zg=L.world.zoneGroups; const per={}; sc.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh)return; let v=true;for(let a=o;a;a=a.parent){if(!a.visible){v=false;break}} if(!v)return; let idx=-1; for(let a=o;a;a=a.parent){const i=zg.indexOf(a); if(i>=0){idx=i;break}} const k=idx>=0?'z'+idx:(o.parent===sc?'scene':'other'); per[k]=(per[k]||0)+1;});
          const top={}; sc.children.forEach((c,i)=>{ let n=0; c.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh)return; let v=true;for(let a=o;a&&a!==sc;a=a.parent){if(!a.visible){v=false;break}} if(v)n++;}); if(n>2) top[i+':'+c.type+':'+c.children.length]=n;});
          return JSON.stringify({tot,inst,shadowCasters,out,per,top});})()""")
        print(r, errs); b.close()
finally: srv.terminate()
