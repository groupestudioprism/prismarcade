import sys, json, time, subprocess
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["python3","-m","http.server","8775"],cwd="/home/claude/prismarcade",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1.5)
errs=[]
JS = """
async () => {
  const au = await import('/lumen/js/engine/audio.js'); const core = await import('/lumen/js/audio/core.js');
  const audio = au.audio, out = {};
  out.before = audio.info().state;
  audio.sfx('nom_inconnu'); audio.music('theme_inconnu', 0.5); audio.ambience('xx'); // avant geste : aucune exception
  return out;
}
"""
JS2 = """
async () => {
  const au = await import('/lumen/js/engine/audio.js'); const core = await import('/lumen/js/audio/core.js');
  const audio = au.audio, A = core.A, res = {};
  audio.unlock(); await new Promise(r=>setTimeout(r,300));
  res.state = audio.info().state;
  const an = A.ctx.createAnalyser(); an.fftSize = 2048; A.out.master.connect(an);
  const buf = new Float32Array(2048); let peak = 0, maxVoices = 0;
  const sample = () => { an.getFloatTimeDomainData(buf); for (const v of buf) peak = Math.max(peak, Math.abs(v)); maxVoices = Math.max(maxVoices, A.active); };
  const iv = setInterval(sample, 20);
  const names = audio.names(); res.nsfx = names.length;
  for (const n of names) { try { audio.sfx(n, {color:'m', weapon:'lame', ground:'bois', voice:'ysolde', x:3, z:2}); } catch(e){ res.err = (res.err||[]).concat(n+':'+e.message); } await new Promise(r=>setTimeout(r,25)); }
  audio.sfx('zzz'); audio.sfx(undefined); audio.sfx(null); audio.sfx(12);
  res.sfxPeak = peak; res.sfxMaxVoices = maxVoices;
  await new Promise(r=>setTimeout(r,2500));
  res.themes = {};
  for (const t of audio.themes()) {
    peak = 0; maxVoices = 0; audio.music(t, 0.8);
    await new Promise(r=>setTimeout(r,6500));
    res.themes[t] = {peak: +peak.toFixed(3), voices: maxVoices, info: audio.info().eff};
  }
  audio.music('boss', 1); for (let i=0;i<10;i++) audio.sfx('hit');
  await new Promise(r=>setTimeout(r,500)); res.tension = audio.info().tension;
  audio.bossPhase(2); await new Promise(r=>setTimeout(r,1500)); res.boss2 = audio.info().theme;
  audio.ambience({fire:0.8}); audio.ambience('temple'); await new Promise(r=>setTimeout(r,1500));
  audio.set({music:0.3, ambience:0.5, voice:0.7, muted:true}); res.vol = audio.get(); audio.set({muted:false});
  res.stored = localStorage.getItem('lumen.audio');
  audio.music(null); await new Promise(r=>setTimeout(r,3500)); res.after = audio.info().theme;
  clearInterval(iv); return res;
}
"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.on("pageerror",lambda e:errs.append("PAGEERR "+str(e)))
    pg.on("console",lambda m:errs.append("CONSOLE "+m.text) if m.type in("error","warning") else None)
    pg.goto("http://localhost:8775/lumen/js/",wait_until="load")
    pg.wait_for_timeout(500)
    print(pg.evaluate(JS))
    pg.mouse.click(300,300)
    r=pg.evaluate(JS2)
    print(json.dumps(r,indent=1))
    b.close()
finally:
  srv.terminate()
print("ERRORS:",errs[:20])
