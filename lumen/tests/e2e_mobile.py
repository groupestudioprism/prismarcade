import time, subprocess
from playwright.sync_api import sync_playwright
srv=subprocess.Popen(["python3","-m","http.server","8765"],cwd=__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","..")),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1.5)
errs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path=__import__("os").environ.get("CHROME","/usr/bin/google-chrome"),args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
    ctx=b.new_context(viewport={"width":844,"height":390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=ctx.new_page()
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("console",lambda m:errs.append(m.text) if m.type=="error" and "ERR_TUNNEL" not in m.text else None)
    pg.goto("http://localhost:8765/lumen/?touch",wait_until="load"); pg.wait_for_timeout(4000)
    pg.evaluate("__lumen.G.startFrom(null,'auto')"); pg.wait_for_timeout(1500)
    for _ in range(10): pg.evaluate("__lumen.G.screens.dialogOpen&&__lumen.G.screens.nextLine()")
    pg.evaluate("__lumen.tpZone('havre')"); pg.wait_for_timeout(1500)
    pg.screenshot(path="/tmp/t_mobile.png")
    print("touch visible:",pg.evaluate("!document.querySelector('#touch').hidden"))
    b.close()
finally: srv.terminate()
print("ERRORS",errs)
