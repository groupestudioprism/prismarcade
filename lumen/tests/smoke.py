import sys, json, time, subprocess
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["python3","-m","http.server","8775"],cwd="/home/claude/prismarcade",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1.5)
errs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.on("pageerror",lambda e:errs.append("PAGEERR "+str(e)))
    pg.on("console",lambda m:errs.append("CONSOLE "+m.text) if m.type=="error" else None)
    pg.goto("http://localhost:8775/lumen/",wait_until="load")
    pg.wait_for_timeout(6000)
    pg.screenshot(path="/tmp/s1_title.png")
    print("lumen api:",pg.evaluate("typeof window.__lumen"))
    print(pg.evaluate("document.body.innerText.slice(0,300)"))
    b.close()
finally:
  srv.terminate()
print("ERRORS:",errs[:20])
