import sys, time, subprocess, json, shutil
from playwright.sync_api import sync_playwright
# Audit de ciblage : chaque objet interactif doit être ciblable depuis une case réellement accessible à pied.
# python3 tools/audit.py <aube|foret|desert> [open2]   (serveur http sur QA_PORT, 8870 par défaut, lancé à la racine du dépôt)
import os, socket
island = sys.argv[1]; port = os.environ.get('QA_PORT', '8870'); variant = 'main'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
s_ = socket.socket(); up = s_.connect_ex(('127.0.0.1', int(port))) == 0; s_.close()
srv = None if up else subprocess.Popen(["python3","-m","http.server",port],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
if srv: time.sleep(1.5)
JS = r"""
(() => {
const L=__lumen, isl=L.isl, G=L.G, S=L.S, P=L.P, st=L.st, T=2;
const W=(c)=>c*T;
// 1) monde ouvert : énigmes, ponts, salles ; portes à clé et sceau restent fermés
Object.values(isl.gates).forEach(g=>{ if(g.key||g.id==='lens'||g.open) return; try{ L.openGate(g.id,true);}catch(e){} });
if(window.__MODE2){ Object.values(isl.gates).forEach(g=>{ if(!g.open){ try{L.openGate(g.id,true);}catch(e){} } }); for(let y=0;y<isl.h;y++)for(let x=0;x<isl.w;x++){ const t=isl.terrain[y][x]; if(t==='r'||t==='c') isl.terrain[y][x]='.'; } }
// 2) échantillons accessibles (pas 1 unité) depuis l'apparition
const key=(a,b)=>a+','+b; const seen=new Set(), q=[]; const ok=(x,z)=>L.canStand(x,z);
const seedList=[[Math.round(P.x),Math.round(P.z)]]; (G.zones||[]).forEach(z=>{ if(z.spawn && !z.entryGate) seedList.push([Math.round(W(z.ox+z.spawn[0])),Math.round(W(z.oy+z.spawn[1]))]); });
seedList.forEach(sd=>{ let st0=null; for(let r=0;r<5&&!st0;r++) for(let dx=-r;dx<=r&&!st0;dx++) for(let dz=-r;dz<=r&&!st0;dz++) if(ok(sd[0]+dx,sd[1]+dz)) st0=[sd[0]+dx,sd[1]+dz]; if(st0&&!seen.has(key(st0[0],st0[1]))){ seen.add(key(st0[0],st0[1])); q.push(st0);} });
const pts=[];
while(q.length){ const [x,z]=q.pop(); pts.push([x,z]); for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,nz=z+dz,k=key(nx,nz); if(seen.has(k)) continue; if(!ok(nx,nz)) continue; seen.add(k); q.push([nx,nz]); } }
const zAt=(x,z)=>G.zoneIndexAt(x,z);
// zones plausibles pour un point hors zone (-1) : zones des points proches
const ptSet=new Map(); pts.forEach(p=>ptSet.set(key(p[0],p[1]),p));
const ctx=(x,z)=>{ const z0=zAt(x,z); if(z0>=0) return [z0]; const s=new Set(); for(let dx=-10;dx<=10;dx+=2)for(let dz=-10;dz<=10;dz+=2){ const a=zAt(x+dx,z+dz); if(a>=0 && ptSet.has(key(x+dx,z+dz))) s.add(a);} return [...s]; };
// 3) objets
const objs=[]; const add=(id,kind,x,z,extra)=>objs.push(Object.assign({id,kind,x,z},extra||{}));
isl.ents.forEach(e=>{ if(e.carry&&!e.rot) add('carry:'+e.id,'carry',W(e.x),W(e.y),{zone:e.zone}); if(e.rot) add('dev:'+e.id,'device',W(e.x),W(e.y),{zone:e.zone}); if(e.t==='post') add('post:'+e.id,'post',W(e.x),W(e.y),{zone:e.zone}); });
L.npcs.forEach(n=>add('npc:'+(n.d.id||n.id),'npc',n.x,n.z,{zone:n.zi}));
Object.entries(L.world.chestViews).forEach(([id,cv])=>add('chest:'+id,'chest',W(cv.x),W(cv.y),{zone:cv.zi}));
L.world.props.forEach((pr,i)=>{ const p=pr.p; if(p.t==='house'&&p.door){ add('door:'+i+':'+(p.interior||''),'door',pr.g.position.x,pr.g.position.z,{zone:pr.zi,door:1}); } if(['sign','bed','desk','well','vasque','shelter','stele'].includes(p.t)) add(p.t+':'+i,p.t,pr.g.position.x,pr.g.position.z,{zone:pr.zi}); });
// socles : visibles seulement quand on porte une pièce de leur zone (test : on prend une pièce, on cherche le socle, on la repose)
const soc=[]; if(isl.socles&&isl.socles.length){ L.st.player.abilities.porter=true; for(const so of isl.socles){ const piece=isl.ents.find(e=>e.carry&&e.zone===so.zone&&!e.carried); if(!piece||isl.entAt[so.x+','+so.y]) { soc.push({id:'socle:'+so.id,occupied:!!isl.entAt[so.x+','+so.y],piece:piece&&piece.id,zone:so.zone,x:W(so.x),z:W(so.y)}); } else soc.push({id:'socle:'+so.id,piece:piece.id,zone:so.zone,x:W(so.x),z:W(so.y)}); } }
Object.values(isl.gates).forEach(g=>{ if(g.key||g.id==='lens') g.cells.forEach((c,i)=>add('lock:'+g.id+':'+i,'lock',W(c[0]),W(c[1]),{gate:g.id})); });
// 4) cible : identité d'un candidat
const idOf=(c)=>{ switch(c.kind){ case 'device': return 'dev:'+c.e.id; case 'post': return 'post:'+c.e.id; case 'npc': return 'npc:'+(c.n.d.id||c.n.id); case 'chest': return null; case 'carry': return 'carry:'+c.e.id; case 'vasque': case 'shelter': case 'stele': return c.kind+':'+L.world.props.indexOf(c.pr); case 'lock': return 'lock:'+c.g.id; case 'sign': case 'bed': case 'desk': case 'well': return c.kind+':'+L.world.props.indexOf(c.pr); case 'door': return 'door:'+L.world.props.indexOf(c.pr); default: return null; } };
const chestId=(c)=>{ for(const [id,cv] of Object.entries(L.world.chestViews)) if(cv===c.cv) return 'chest:'+id; };
const res=[];
for(const o of objs){
  if(o.kind==='chest'||o.kind==='npc'&&false){}
  const near=pts.filter(p=>Math.hypot(p[0]-o.x,p[1]-o.z)<=4.6);
  const minD=near.length?Math.min(...near.map(p=>Math.hypot(p[0]-o.x,p[1]-o.z))):99;
  let seenAny=false, top=false, competitors={};
  for(const p of near){ for(const c of ctx(p[0],p[1])){ S.zone=c; P.x=p[0];P.z=p[1];
      const cands=L.findTarget(true); for(const cd of cands){ let id=cd.kind==='chest'?chestId(cd):idOf(cd); if(id===null||id===undefined) continue;
        const same = id===o.id || (o.kind==='lock'&&id===('lock:'+o.gate)) || (o.kind==='door'&&id.startsWith('door:'+o.id.split(':')[1]));
        if(same) { seenAny=true; if(cands[0]===cd) top=true; else competitors[(cands[0].kind)]=1; } } } }
  res.push({id:o.id,kind:o.kind,zone:o.zone,minD:+minD.toFixed(1),n:near.length,seen:seenAny,top,comp:Object.keys(competitors)});
}
// socles : pour chaque socle libre, prendre une pièce de la zone puis chercher la cible « socle »
const socRes=[]; for(const so of soc){ const piece=isl.ents.find(e=>e.id===so.piece); const free=!isl.entAt[Math.round(so.x/2)+','+Math.round(so.z/2)]; let seenAny=false, top=false, n=0;
  const holder=isl.ents.find(e=>e.carry&&e.carried); const near=pts.filter(p=>Math.hypot(p[0]-so.x,p[1]-so.z)<=4.6);
  // on porte une pièce de la zone (n'importe laquelle) ; si le socle est occupé par elle-même, on la prend d'abord
  let carried=piece; if(!carried){ socRes.push({id:so.id,skipped:true}); continue; }
  const sx=Math.round(so.x/2), sy=Math.round(so.z/2); const occ=isl.entAt[sx+','+sy];
  if(occ&&occ.carry){ G.a3.lift(occ); carried=occ; } else if(!occ){ G.a3.lift(carried); } else { socRes.push({id:so.id,skipped:true,why:'occupé par '+occ.t}); continue; }
  for(const p of near){ for(const c of ctx(p[0],p[1])){ S.zone=c; P.x=p[0];P.z=p[1]; const cands=L.findTarget(true); for(const cd of cands){ if(cd.kind==='socle'&&cd.so.id===so.id.slice(6)){ seenAny=true; n++; if(cands[0]===cd) top=true; } } } }
  socRes.push({id:so.id,seen:seenAny,top,pts:near.length}); if(G.a3.carrying()) { const e=G.a3.carrying(); const home=isl.socles.find(q=>q.x===e.home[0]&&q.y===e.home[1]); if(home&&!isl.entAt[home.x+','+home.y]) G.a3.place(home); } }
return {pts:pts.length,objs:objs.length,res,socRes,zone:S.zone};
})()
"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
    pg=b.new_page(viewport={"width":480,"height":270}); errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)[:200]))
    pg.goto(f"http://localhost:{port}/lumen/?low&nobloom",wait_until="load"); pg.wait_for_timeout(4000)
    pg.evaluate("(async()=>{await __lumen.G.startFrom(null,'auto')})()"); pg.wait_for_timeout(1500)
    if island=='foret':
        pg.evaluate("""(()=>{const L=__lumen;L.st.flags.acte1_fini=1;L.st.quests.q_reveil={state:'done',step:3,base:{}};L.G.runEffects([{travel:{to:'foret',zone:'vitrebourg',cell:[12,7]}}]);})()""")
        pg.wait_for_timeout(9000); pg.wait_for_function('window.__lumen&&__lumen.S&&__lumen.S.mode==="play"',timeout=90000); pg.wait_for_timeout(1500)
    if island=='desert':
        pg.evaluate("""(()=>{const L=__lumen,s=L.st;Object.assign(s.flags,{acte1_fini:1,acte2_fini:1,boss_colosse:1,boss_verre:1,verre_fini:1});L.G.runEffects([{travel:{to:'desert',zone:'cite',cell:[12,7]}}]);})()""")
        pg.wait_for_timeout(9000); pg.wait_for_function('window.__lumen&&__lumen.S&&__lumen.S.mode==="play"',timeout=90000); pg.wait_for_timeout(1500)
    mode2 = len(sys.argv)>2 and sys.argv[2]=='open2'
    if mode2: pg.evaluate('window.__MODE2=1')
    r=pg.evaluate(JS)
    json.dump(r,open(f'/tmp/audit_{island}{"_open2" if mode2 else ""}.json','w'))
    res=r['res']; print(variant,island,'points accessibles',r['pts'],'objets',r['objs'],'erreurs',errs[:3])
    bad=[x for x in res if not x['seen']]
    print('JAMAIS CIBLABLE (objet proche d\'un point accessible mais aucun bouton) :')
    for x in bad: 
        if x['minD']<=2.6: print('  ',x)
    print('hors d\'atteinte (aucun point accessible à <=2.6) :',len([x for x in bad if x['minD']>2.6]))
    shadow=[x for x in res if x['seen'] and not x['top']]
    print('toujours masqués par un autre objet :',[ (x['id'],x['comp']) for x in shadow][:15])
    print('SOCLES :',[x for x in r['socRes'] if not x.get('seen')] or 'tous ciblables', 'soit', len(r['socRes']))
    b.close()
srv and srv.kill()
