"""Captures du décor (sol et nature) pour comparer avant/après une refonte graphique.
Usage : QA_PORT=8881 python3 shots_monde1_nature.py <étiquette> [île]
  étiquette : « avant » ou « apres » (préfixe des fichiers de /tmp/m1n/)
  île       : aube (défaut) ou une autre île (foret…) pour vérifier qu'elle ne change pas
Sorties : /tmp/m1n/<étiquette>_<vue>.png (1280×720) et /tmp/m1n/<étiquette>_<île>.json (appels de dessin, triangles, signature du décor).
`python3 shots_monde1_nature.py assemble` colle les paires avant/après dans /tmp/monde1_nature_<vue>.png."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
OUT = '/tmp/m1n'; os.makedirs(OUT, exist_ok=True)

if len(sys.argv) > 1 and sys.argv[1] == 'assemble':
    from PIL import Image, ImageDraw
    names = sorted(f[len('avant_'):-4] for f in os.listdir(OUT) if f.startswith('avant_') and f.endswith('.png'))
    for n in names:
        a, b = os.path.join(OUT, f'avant_{n}.png'), os.path.join(OUT, f'apres_{n}.png')
        if not os.path.exists(b): continue
        A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
        im = Image.new('RGB', (A.width + B.width + 12, max(A.height, B.height) + 34), (20, 18, 30))
        im.paste(A, (0, 34)); im.paste(B, (A.width + 12, 34))
        d = ImageDraw.Draw(im); d.text((12, 10), 'AVANT - ' + n, fill=(255, 255, 255)); d.text((A.width + 24, 10), 'APRES - ' + n, fill=(255, 255, 255))
        im.save(f'/tmp/monde1_nature_{n}.png'); print(f'/tmp/monde1_nature_{n}.png')
    sys.exit(0)

from qa_lib import *
label = sys.argv[1] if len(sys.argv) > 1 else 'avant'
island = sys.argv[2] if len(sys.argv) > 2 else 'aube'
only = sys.argv[3].split(',') if len(sys.argv) > 3 else None      # liste de vues, séparées par des virgules
size = tuple(int(v) for v in os.environ.get('SHOT_SIZE', '1280x720').split('x'))
q = QA('shots-nature', viewport=size, query='?nobloom' + ('' if island == 'aube' else '&island=' + island), noop=False); q.load()
if island != 'aube':
    # Autre monde : pas de nouvelle partie (elle ramènerait à l'Aube). On fige l'horloge des shaders et on rend soi-même
    # deux vues fixes ; la signature du décor construit (géométries, instances, couleurs) est la preuve d'identité.
    q.pg.wait_for_timeout(3000)
    res = q.ev("""(async()=>{const L=__lumen,r=L.renderer;const s=document.createElement('style');s.textContent='body>*:not(canvas){visibility:hidden!important}';document.head.appendChild(s);
      const g=await import('/lumen/js/world/gfx.js');const real=r.render.bind(r);r.render=()=>{};await new Promise(q=>setTimeout(q,500));g.U.time.value=0;
      let n=0,h=0;const add=(v)=>{h=(Math.imul(h,31)+(Math.round(v*1000)|0))|0;};
      /* terrain et végétation = maillages posés directement dans les groupes de zone (les accessoires et entités sont dans des sous-groupes) + décor lointain */
      const one=(o)=>{if(!o.isMesh)return;n++;const p=o.geometry.attributes.position;add(p.count);for(let i=0;i<p.array.length;i+=3)add(p.array[i]);
        if(o.isInstancedMesh){add(o.count);const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)add(a[i]);if(o.instanceColor){const c=o.instanceColor.array;for(let i=0;i<c.length;i++)add(c[i]);}}
        add(o.castShadow?1:0);add(o.receiveShadow?1:0);const m=o.material;add(m.type.length);add(m.roughness||0);add(m.opacity);};
      L.world.zoneGroups.forEach(g=>g.children.forEach(one));L.world.decor.forEach(g=>g.traverse(one));
      window.__shot=(zi)=>{const z=L.G.zones[zi],x=(z.ox+z.map[0].length/2)*2,zz=(z.oy+z.map.length/2)*2;L.camera.position.set(x,Math.sin(0.95)*24,zz+Math.cos(0.95)*24);L.camera.lookAt(x,0,zz);L.camera.updateMatrixWorld();r.info.autoReset=false;r.info.reset();real(L.scene,L.camera);return {calls:r.info.render.calls,tris:r.info.render.triangles};};
      return {meshes:n,hash:h};})()""")
    out = {'sig': res, 'views': {}}
    for zi in (0, 2, 5):
        out['views'][f'{island}{zi}'] = q.ev(f"__shot({zi})"); q.pg.wait_for_timeout(300)
        q.pg.screenshot(path=f'{OUT}/{label}_{island}{zi}.png', timeout=240000); print(island, zi, out['views'][f'{island}{zi}'], flush=True)
    json.dump(out, open(f'{OUT}/{label}_{island}.json', 'w'), indent=1); print('signature', res, 'ERRORS:', q.errs)
    q.b.close(); q.p.stop()
    if q.srv: q.srv.terminate()
    sys.exit(1 if q.errs else 0)
q.js('nouvelle partie', "T.newGame()", "play")
q.ev("""(()=>{const s=document.createElement('style');s.textContent='body>*:not(canvas){visibility:hidden!important}';document.head.appendChild(s);
 const L=__lumen; L.st.player.hp=L.st.player.maxHp=99999;
 window.N={
  /* attend que la caméra soit posée et que n images aient été rendues */
  async settle(n){const L=__lumen,r=L.renderer,c=L.camera.position;const t0=performance.now();let f0=r.info.render.frame,px=c.x,pz=c.z;
   while(performance.now()-t0<60000){await T.tick(80);const d=Math.hypot(c.x-px,c.z-pz);px=c.x;pz=c.z;if(d<0.02&&r.info.render.frame-f0>=(n||6))return true;if(d>=0.02)f0=r.info.render.frame;}return false;},
  /* case où l'on peut se tenir, la plus proche d'une case de terrain `ch` de la zone (k-ième trouvée) */
  near(zid,ch,k){const L=__lumen,zi=L.G.zones.findIndex(z=>z.id===zid),z=L.G.zones[zi],out=[];
   z.map.forEach((row,ly)=>{for(let lx=0;lx<row.length;lx++){const x=z.ox+lx,y=z.oy+ly;const t=L.isl.terrain[y][x];if(ch==='bord'?!(t!==' '&&t!=='='&&(L.isl.terrain[y+1]||[])[x]===' '):t!==ch)continue;
     for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,1]]){if(L.canStand((x+dx)*2,(y+dy)*2)){out.push([x+dx,y+dy,x,y]);break;}}}});
   return out[Math.min(out.length-1,k||0)]||null;},
  async go(x,y,dist){const L=__lumen;L.P.x=x*2;L.P.z=y*2;L.P.vx=L.P.vz=0;L.S.dist=dist;L.combat.enemies.forEach(e=>{e.view.root.visible=false;});await T.tick(200);return await N.settle(8);},
  async stats(){const L=__lumen,r=L.renderer;L.combat.enemies.forEach(e=>{e.view.root.visible=false;});await T.tick(400);r.info.autoReset=false;r.info.reset();const f0=r.info.render.frame;while(r.info.render.frame-f0<5)await T.tick(60);const n=r.info.render.frame-f0;const o={calls:Math.round(r.info.render.calls/n),tris:Math.round(r.info.render.triangles/n)};r.info.autoReset=true;return o;},
  /* signature du décor construit : sert à prouver qu'un autre monde est resté identique */
  sig(){const L=__lumen;let n=0,h=0;const add=(v)=>{h=(Math.imul(h,31)+(Math.round(v*1000)|0))|0;};
   L.world.root.traverse(o=>{if(!o.isMesh)return;n++;const p=o.geometry.attributes.position;add(p.count);for(let i=0;i<Math.min(p.array.length,300);i++)add(p.array[i]);
    if(o.isInstancedMesh){add(o.count);const a=o.instanceMatrix.array;for(let i=0;i<a.length;i+=7)add(a[i]);if(o.instanceColor){const c=o.instanceColor.array;for(let i=0;i<c.length;i+=5)add(c[i]);}}
    const m=o.material;if(m&&m.color)add(m.type.length);});
   return {meshes:n,hash:h};}
 };})()""")
VIEWS = {
 'aube': [
  ('rivage', "(()=>{const z=__lumen.G.zones.find(z=>z.id==='z1');return [z.ox+5,z.oy+6,20]})()"),
  ('village', "(()=>{const z=__lumen.G.zones.find(z=>z.id==='havre');return [z.ox+z.spawn[0],z.oy+z.spawn[1],22]})()"),
  ('jardins', "(()=>{const z=__lumen.G.zones.find(z=>z.id==='z5');return [z.ox+5,z.oy+6,20]})()"),
  ('lande', "(()=>{const z=__lumen.G.zones.find(z=>z.id==='lande');return [z.ox+z.spawn[0],z.oy+z.spawn[1],22]})()"),
  ('lande2', "(()=>{const p=N.near('lande','r',6);return [p[0],p[1],18]})()"),
  ('gros_arbre', "(()=>{const p=N.near('havre','T',8);return [p[0],p[1],9]})()"),
  ('gros_rocher', "(()=>{const p=N.near('lande','#',20);return [p[0],p[1],9]})()"),
  ('gros_bord', "(()=>{const p=N.near('havre','bord',4);return [p[0],p[1],10]})()"),
  ('gros_eau', "(()=>{const p=N.near('havre','~',3);return [p[0],p[1],9]})()"),
  ('gros_ronces', "(()=>{const p=N.near('lande','r',2);return [p[0],p[1],9]})()"),
  ('gros_fissure', "(()=>{const p=N.near('lande','c',0);return [p[0],p[1],9]})()"),
  ('pont', "(()=>{T.solve('g1');const z=__lumen.G.zones.find(z=>z.id==='z1');return [z.ox+9,z.oy+5,11]})()"),
  ('gros_rivage', "(()=>{const z=__lumen.G.zones.find(z=>z.id==='z1');return [z.ox+2,z.oy+8,9]})()"),
  # île restaurée (lumière d'aube, fin du monde 1) : contrôle de la palette en pleine lumière
  ('aube_village', "(()=>{const L=__lumen;L.S.restore=L.S.restoreT=1;const z=L.G.zones.find(z=>z.id==='havre');return [z.ox+12,z.oy+16,22]})()"),
  ('aube_lande', "(()=>{const L=__lumen;L.S.restore=L.S.restoreT=1;const z=L.G.zones.find(z=>z.id==='lande');return [z.ox+16,z.oy+9,20]})()"),
 ],
 'foret': [('foret', "(()=>{const z=__lumen.G.zones[0];return [z.ox+z.spawn[0],z.oy+z.spawn[1],20]})()"),
           ('foret2', "(()=>{const z=__lumen.G.zones[2];return [z.ox+z.spawn[0],z.oy+z.spawn[1],20]})()")],
}
jp = f'{OUT}/{label}_{island}.json'
res = json.load(open(jp)) if os.path.exists(jp) else {'views': {}}
res['sig'] = q.ev("N.sig()")
for name, expr in VIEWS.get(island, VIEWS['foret']):
    if only and name not in only: continue
    p = q.ev(expr)
    ok = q.ev(f"N.go({p[0]},{p[1]},{p[2]})")
    st = q.ev("N.stats()")
    q.pg.screenshot(path=f'{OUT}/{label}_{name}.png', timeout=240000)
    res['views'][name] = {'pos': p, 'posee': ok, **st}
    print(name, p, ok, st, flush=True)
json.dump(res, open(jp, 'w'), indent=1)
print('signature', res['sig']); print('ERRORS:', q.errs)
q.b.close(); q.p.stop()
if q.srv: q.srv.terminate()
sys.exit(1 if q.errs else 0)
