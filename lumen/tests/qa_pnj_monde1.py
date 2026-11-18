"""PNJ du monde 1 (Île de l'Aube) dans le jeu : captures 1280×720 de la place du village et de chaque habitant en gros plan,
dialogue réel avec plusieurs habitants (animation de parole), marche des habitants qui se promènent, coût par habitant.
Usage : QA_PORT=8883 python3 qa_pnj_monde1.py [avant|apres|marche] [id,id,…]   → /tmp/pnj_<étiquette>_<id>.png
« avant » sert au navigateur le js/main.js du dernier commit (git show HEAD:…) : anciens personnages, sans toucher au dépôt.
Une liste d'identifiants limite le passage aux gros plans de ces habitants.
Avec « apres », assemble aussi /tmp/monde1_pnj_<id>.png (avant | après) si les captures « avant » existent."""
import sys, os, json, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
TAG = sys.argv[1] if len(sys.argv) > 1 else 'apres'
IDS = ['selene', 'ysolde', 'pell', 'gaspard', 'bran', 'tobias', 'lison', 'mira', 'aldo', 'calixte', 'maelle']
ONLY = sys.argv[2].split(',') if len(sys.argv) > 2 else None
q = QA('pnj-monde1-' + TAG, viewport=(1280, 720), query="?nobloom&nohole", noop=False)
if TAG == 'avant':
    OLD = subprocess.check_output(['git', 'show', 'HEAD:lumen/js/main.js'], cwd=os.path.dirname(os.path.abspath(__file__)))
    q.pg.route('**/js/main.js', lambda r: r.fulfill(body=OLD, content_type='text/javascript'))
q.load()
q.js('nouvelle partie', "T.newGame()", "play")
q.ev("""(()=>{const L=__lumen,r=L.renderer,r0=r.render.bind(r);window.__frames=0;window.__shot=null;
 r.render=(sc,cam)=>{ if(cam===L.camera){window.__frames++; const s=window.__shot; if(s){ const d=s.dir?new cam.position.constructor(s.dir[0],s.dir[1],s.dir[2]).normalize():cam.position.clone().sub(L.S.camT).normalize(); cam.position.set(s.x+d.x*s.d,s.y+d.y*s.d,s.z+d.z*s.d); cam.lookAt(s.x,s.y,s.z); cam.updateMatrixWorld(true);} } return r0(sc,cam); };
 window.T.frames=async(n)=>{const f0=window.__frames,t0=performance.now();while(window.__frames<f0+n&&performance.now()-t0<60000)await T.tick(50);return window.__frames-f0;};
 /* habitant derrière un comptoir : caméra de face ; dehors (étal sous auvent) elle passe sous l'auvent */
 window.T.counterShot=(n)=>{const f=n.baseFace,out=L.G.zones[n.zi].id==='havre';return {x:n.x,y:1.0,z:n.z,d:out?3.9:4.4,dir:[Math.sin(f)+0.3*Math.cos(f),out?0.17:0.42,Math.cos(f)-0.3*Math.sin(f)]};};
 window.T.stand=(id,far)=>{const n=T.npc(id),c=far?[[0,3.6],[1.2,3.4],[-1.2,3.4],[0,4.2]]:[[1.2,1.5],[-1.2,1.5],[1.5,1.1],[-1.5,1.1],[1.6,0.2],[-1.6,0.2],[1.2,-1.2],[-1.2,-1.2]];
   for(const [dx,dz] of c){ if(L.G.canStand(n.x+dx,n.z+dz)){L.P.x=n.x+dx;L.P.z=n.z+dz;L.P.vx=L.P.vz=0;return [dx,dz];} } return null; };
})()""")
q.js('les 11 habitants existent', "JSON.stringify(%s.map(id=>!!T.npc(id)))" % json.dumps(IDS), lambda r: 'false' not in r)
if TAG != 'avant':
    q.js('modèles v2 utilisés pour les 11', "JSON.stringify(%s.map(id=>!!(T.npc(id).c.nodes&&T.npc(id).c.villager)))" % json.dumps(IDS), lambda r: 'false' not in r)
    q.js('les autres habitants gardent Character', "__lumen.npcs.filter(n=>!%s.includes(n.id)).every(n=>!n.c.villager)" % json.dumps(IDS), lambda r: r is True)

# place du village : vue large
if not ONLY and TAG != 'marche':
  q.js('place du village', "(async()=>{const L=__lumen;L.tpZone('havre',[17,11]);L.S.dist=30;await T.frames(6);window.__shot={x:34,y:0,z:22,d:42};await T.frames(4);return T.zone()})()", 'havre')
  q.pg.screenshot(path=f'/tmp/pnj_{TAG}_place.png', timeout=180000)
  q.js('place du village (rapprochée)', "(async()=>{window.__shot={x:30,y:0,z:24,d:20};await T.frames(4);return 1})()")
  q.pg.screenshot(path=f'/tmp/pnj_{TAG}_place2.png', timeout=180000)
  q.ev("window.__shot=null")

# gros plan de chaque habitant (Lyra à côté pour l'échelle)
for i in ([] if TAG == 'marche' else ONLY or IDS):
    q.js(i + ' : gros plan', """(async()=>{const L=__lumen,n=T.npc('%s'),z=L.G.zones[n.zi];L.tpZone(z.id,[n.x/2-z.ox,n.z/2-z.oy+0.9]);await T.frames(3);
      const at=T.stand('%s',n.counter); L.S.dist=9; n.wt=30; await T.frames(8); window.__shot=n.counter?T.counterShot(n):{x:n.x+(at?at[0]*0.3:0),y:0.8,z:n.z+(at?at[1]*0.3:0),d:4.6}; await T.frames(3);
      return JSON.stringify({zone:z.id,at,vis:L.world.zoneGroups[n.zi].visible})})()""" % (i, i), lambda r: 'true' in r)
    q.pg.screenshot(path=f'/tmp/pnj_{TAG}_{i}.png', timeout=180000)
    q.ev("window.__shot=null")

if TAG == 'apres' and not ONLY:
    # dialogue réel : cible d'interaction, ouverture, animation de parole, fermeture
    for i in ['selene', 'bran', 'tobias', 'maelle']:
        q.js(i + ' : dialogue ouvert, animation TALK', """(async()=>{const L=__lumen,n=T.npc('%s');const r=await T.near('%s');if(r!=='ok')return 'cible '+r;L.interact();await T.frames(10);
          const o={open:L.G.screens.dialogOpen,talking:n.talking,talk:+n.c.state.talk.toFixed(2)};window.__shot=n.counter?T.counterShot(n):{x:n.x,y:0.8,z:n.z,d:4.6};await T.frames(3);return JSON.stringify(o)})()""" % (i, i),
             lambda r: '"open":true' in r and '"talking":true' in r and float(json.loads(r)['talk']) > 0.5)
        q.pg.screenshot(path=f'/tmp/pnj_{TAG}_{i}_parle.png', timeout=180000)
        q.js(i + ' : fin du dialogue', "(async()=>{const L=__lumen,n=T.npc('%s');window.__shot=null;const p=T.pump();await T.frames(12);return JSON.stringify({open:L.G.screens.dialogOpen,talking:n.talking,talk:+n.c.state.talk.toFixed(2),lignes:p.n})})()" % i,
             lambda r: '"open":false' in r and '"talking":false' in r and float(json.loads(r)['talk']) < 0.5)
if TAG in ('apres', 'marche') and not ONLY:
    # les habitants qui se promènent marchent (animation WALK) sans quitter le sol
    for i in ['tobias', 'mira']:
        q.js(i + ' : marche', """(async()=>{const L=__lumen,n=T.npc('%s'),z=L.G.zones[n.zi];let moved=false; if(!L.G.canStand(n.x,n.z,0.3)){ /* point de départ non praticable dans les données du monde : l'habitant ne bouge jamais ; le test le décale sur la case libre la plus proche */
            search: for(let r=0.4;r<4;r+=0.4)for(let a=0;a<6.28;a+=0.4){const x=n.hx+Math.cos(a)*r,zz=n.hz+Math.sin(a)*r;if(L.G.canStand(x,zz,0.3)){n.x=n.hx=x;n.z=n.hz=zz;moved=true;break search;}} }
          L.tpZone(z.id,[n.x/2-z.ox,n.z/2-z.oy+3.2]);n.wt=0;let mv=0,x0=n.x,z0=n.z;const t0=performance.now();
          while(performance.now()-t0<40000&&!(mv>0.5&&Math.hypot(n.x-x0,n.z-z0)>0.5)){ if(Math.hypot(L.P.x-n.x,L.P.z-n.z)<2.2){L.P.x=n.x;L.P.z=n.z+3.4;} mv=Math.max(mv,n.c.state.move); await T.tick(60);}
          window.__shot={x:n.x,y:0.8,z:n.z,d:4.6};await T.frames(2);return JSON.stringify({mv:+mv.toFixed(2),d:+Math.hypot(n.x-x0,n.z-z0).toFixed(2),decale:moved})})()""" % i, lambda r: json.loads(r)['mv'] > 0.5)
        q.pg.screenshot(path=f'/tmp/pnj_apres_{i}_marche.png', timeout=180000); q.ev("window.__shot=null")
if TAG == 'apres' and not ONLY:
    q.js('Tobias : salut de la main', """(async()=>{const L=__lumen,n=T.npc('tobias');n.wt=30;let w=0;const t0=performance.now();while(performance.now()-t0<30000&&w<0.6){L.P.x=n.x;L.P.z=n.z+2.7;L.P.vx=L.P.vz=0;w=Math.max(w,n.c.state.wave);await T.tick(60);}
      window.__shot={x:n.x,y:0.8,z:n.z,d:4.6};await T.frames(2);return +w.toFixed(2)})()""", lambda r: r >= 0.6)
    q.pg.screenshot(path='/tmp/pnj_%s_tobias_salut.png' % TAG, timeout=180000); q.ev("window.__shot=null")
    # coût : animation seule (ms par habitant et par image), triangles et appels de dessin par habitant
    q.js('coût par habitant', """(()=>{const L=__lumen,o={};for(const id of %s){const n=T.npc(id);let tri=0,dc=0;n.c.root.traverse(m=>{if(m.isMesh){dc++;tri+=m.geometry.attributes.position.count/3;}});
      const s={move:n.wander?0.35:0,talking:false,talk:false};const t0=performance.now();for(let i=0;i<300;i++)n.c.animate(1/60,s);o[id]={ms:+((performance.now()-t0)/300).toFixed(3),tri,dc};}
      const old=L.npcs.find(n=>!n.c.villager);return JSON.stringify(o)})()""" % json.dumps(IDS))
print('ERRORS:', q.errs)
for r in q.results: print(r)
q.b.close(); q.p.stop()
if TAG == 'apres' and os.path.exists('/tmp/pnj_avant_place.png'):
    from PIL import Image, ImageDraw
    for i in (ONLY or IDS + ['place', 'place2']):
        a, b = Image.open(f'/tmp/pnj_avant_{i}.png').convert('RGB'), Image.open(f'/tmp/pnj_{TAG}_{i}.png').convert('RGB')
        im = Image.new('RGB', (a.width + b.width + 8, a.height), 'white'); im.paste(a, (0, 0)); im.paste(b, (a.width + 8, 0))
        d = ImageDraw.Draw(im); d.rectangle((0, 0, 110, 26), fill='black'); d.text((8, 7), 'AVANT', fill='white'); d.rectangle((a.width + 8, 0, a.width + 118, 26), fill='black'); d.text((a.width + 16, 7), 'APRES', fill='white')
        im.save(f'/tmp/monde1_pnj_{i}.png')
sys.exit(1 if q.errs or any(r[1] != 'OK' for r in q.results) else 0)
