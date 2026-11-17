"""Capture d'une planche : python3 shot.py <sortie.png> "m=<id>&poses=IDLE:0,ATTACK:0.3:s" (serveur local lancé au besoin sur lumen/, port QA_PORT ou 8951)."""
import sys, os, socket, subprocess, time
from playwright.sync_api import sync_playwright
PORT = int(os.environ.get('QA_PORT', '8951')); ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
s = socket.socket(); up = s.connect_ex(('127.0.0.1', PORT)) == 0; s.close()
if not up: subprocess.Popen(['python3', '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True); time.sleep(1.2)
out, qs = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 2000, 'height': 1240}); errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://localhost:{PORT}/tools/models3d/turn.html?' + qs)
    try: pg.wait_for_function('window.done===true', timeout=90000)
    except Exception as e: errs.append('délai dépassé')
    pg.screenshot(path=out); b.close(); print('erreurs :', errs[:3])
