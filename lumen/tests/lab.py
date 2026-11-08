import sys, time, subprocess
from playwright.sync_api import sync_playwright
q, out = sys.argv[1], sys.argv[2]; steps = int(sys.argv[3]) if len(sys.argv) > 3 else 90
srv = subprocess.Popen(["python3", "-m", "http.server", "8775"], cwd="/home/claude/prismarcade", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 720}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.goto("http://localhost:8775/lumen/_lab.html?" + q); pg.wait_for_function("window.ready===true", timeout=15000)
        pg.evaluate("step(%d)" % steps); pg.evaluate("shot()"); pg.screenshot(path=out); print("errs", errs[:5]); b.close()
finally: srv.terminate()
