"""Audit de ciblage de l'Acte VI : chaque objet interactif doit être ciblable depuis une vraie position de marche.
Usage : flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/audit_zenith.py [open2]   (open2 = toutes les portes ouvertes, y compris à clé)"""
import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
JS = r"""
(() => {
const L=__lumen, isl=L.isl, G=L.G, S=L.S, P=L.P, st=L.st, T=2;
const W=(c)=>c*T;
// 1) monde ouvert : énigmes, ponts, salles ; portes à clé et sceau restent fermés
Object.values(isl.gates).forEach(g=>{ if(g.key||g.id==='lens'||g.id==='end'||g.open) return; try{ L.openGate(g.id,true);}catch(e){} });
if(window.__MODE2){ Object.values(isl.gates).forEach(g=>{ if(!g.open&&g.id!=='end'){ try{L.openGate(g.id,true);}catch(e){} } }); for(let y=0;y<isl.h;y++)for(let x=0;x<isl.w;x++){ const t=isl.terrain[y][x]; if(t==='r'||t==='c') isl.terrain[y][x]='.'; } }
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
isl.ents.forEach(e=>{ if(e.rot) add('dev:'+e.id,'device',W(e.x),W(e.y),{zone:e.zone}); if(e.t==='post') add('post:'+e.id,'post',W(e.x),W(e.y),{zone:e.zone}); });
L.npcs.forEach(n=>add('npc:'+(n.d.id||n.id),'npc',n.x,n.z,{zone:n.zi}));
Object.entries(L.world.chestViews).forEach(([id,cv])=>add('chest:'+id,'chest',W(cv.x),W(cv.y),{zone:cv.zi}));
L.world.props.forEach((pr,i)=>{ const p=pr.p; if(p.t==='house'&&p.door){ add('door:'+i+':'+(p.interior||''),'door',pr.g.position.x,pr.g.position.z,{zone:pr.zi,door:1}); } if(['sign','bed','desk','well'].includes(p.t)) add(p.t+':'+i,p.t,pr.g.position.x,pr.g.position.z,{zone:pr.zi}); });
Object.values(isl.gates).forEach(g=>{ if(g.key||g.id==='lens') g.cells.forEach((c,i)=>add('lock:'+g.id+':'+i,'lock',W(c[0]),W(c[1]),{gate:g.id})); });
// 4) cible : identité d'un candidat
const idOf=(c)=>{ switch(c.kind){ case 'device': return 'dev:'+c.e.id; case 'post': return 'post:'+c.e.id; case 'npc': return 'npc:'+(c.n.d.id||c.n.id); case 'chest': return null; case 'lock': return 'lock:'+c.g.id; case 'sign': case 'bed': case 'desk': case 'well': return c.kind+':'+L.world.props.indexOf(c.pr); case 'door': return 'door:'+L.world.props.indexOf(c.pr); default: return null; } };
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
return {pts:pts.length,objs:objs.length,res,zone:S.zone};
})()
"""
q=QA('audit-zenith', viewport=(480,270), query='?ile=zenith&low&nobloom'); q.load()
q.ev("""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='porte';s.player.respawn={zone:'porte',cell:[12,7]};s.world=m.newWorld('porte');s.player.abilities={porter:true,portails:true};
  await __lumen.G.startFrom(s,'auto',false,true);})()""")
q.tick(3500); q.ev("T.pump()")
mode2 = len(sys.argv)>1 and sys.argv[1]=='open2'
if mode2: q.ev('window.__MODE2=1')
r=q.ev(JS)
json.dump(r,open('/tmp/audit_zenith%s.json'%('_open2' if mode2 else ''),'w'))
res=r['res']; print('points accessibles',r['pts'],'objets',r['objs'],'erreurs',q.errs[:3])
bad=[x for x in res if not x['seen']]
print("JAMAIS CIBLABLE :")
for x in bad:
    if x['minD']<=2.6: print('  ',x)
print("hors d'atteinte (aucun point accessible a <=2.6) :",[x['id'] for x in bad if x['minD']>2.6])
shadow=[x for x in res if x['seen'] and not x['top']]
print('toujours masques par un autre objet :',[(x['id'],x['comp']) for x in shadow][:20])
q.done()
