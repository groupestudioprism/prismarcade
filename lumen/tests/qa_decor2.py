"""Décor v2 (sol et nature de l'Île de l'Aube, js/world/decor2.js) : contrôles automatiques.
- les zones puzzle / village / lande sont dessinées par decor2 (maillage « sol2 »), le sanctuaire et les intérieurs non ;
- aucune coordonnée invalide, aucun objet sous le sol ou flottant (rochers, troncs, dalles : base au niveau du sol) ;
- le sol est continu : chaque case de terre a un dessus à Y = 0 (ou une mare), sans trou ;
- le vent (patchSway de gfx.js) est bien branché sur le feuillage, son contour, l'herbe et les fleurs, et il fait bouger l'image ;
- couper une ronce / briser une roche fissurée retire le corps, le contour et les fissures.
Usage : QA_PORT=8881 python3 qa_decor2.py"""
import sys; sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from qa_lib import *
q = QA('decor2', viewport=(640, 360), query="?nobloom", noop=False); q.load()
q.js('nouvelle partie', "T.newGame()", "play")
q.js('zones dessinées par decor2', """(()=>{const L=__lumen,o={};L.G.zones.forEach((z,i)=>{const th=z.theme||'puzzle';const has=L.world.zoneGroups[i].children.some(c=>c.name==='sol2');(o[th]=o[th]||[]).push(has)});
  return JSON.stringify(Object.fromEntries(Object.entries(o).map(([k,v])=>[k,v.every(Boolean)?'oui':v.some(Boolean)?'MIXTE':'non'])))})()""",
     lambda r: '"puzzle":"oui"' in r and '"village":"oui"' in r and '"lande":"oui"' in r and '"sanctuaire":"non"' in r and '"interieur":"non"' in r and 'MIXTE' not in r)
q.js('géométries valides (pas de NaN)', """(()=>{const L=__lumen;let bad=0,n=0;L.world.zoneGroups.forEach(g=>g.children.forEach(c=>{if(!c.isMesh)return;n++;const a=c.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!Number.isFinite(a[i])){bad++;break;}
   if(c.isInstancedMesh){const m=c.instanceMatrix.array;for(let i=0;i<m.length;i++)if(!Number.isFinite(m[i])){bad++;break;}}}));return n+' maillages, '+bad+' invalides'})()""", lambda r: r.endswith(' 0 invalides'))
q.js('sol continu : un dessus par case', """(()=>{const L=__lumen,isl=L.isl;let miss=0,cells=0;
  L.G.zones.forEach((z,zi)=>{const sol=L.world.zoneGroups[zi].children.find(c=>c.name==='sol2');if(!sol)return;const p=sol.geometry.attributes.position.array,area={};
   for(let i=0;i<p.length;i+=9){const ys=[p[i+1],p[i+4],p[i+7]];if(!ys.every(y=>Math.abs(y)<1e-6||Math.abs(y+0.42)<1e-6))continue;   // dessus (Y=0) ou fond de mare
     const ax=p[i],az=p[i+2],bx=p[i+3],bz=p[i+5],cx=p[i+6],cz=p[i+8];const a=Math.abs((bx-ax)*(cz-az)-(cx-ax)*(bz-az))/2;const k=Math.round((ax+bx+cx)/6)+','+Math.round((az+bz+cz)/6);area[k]=(area[k]||0)+a;}
   z.map.forEach((row,ly)=>{for(let lx=0;lx<row.length;lx++){const x=z.ox+lx,y=z.oy+ly,t=isl.terrain[y][x];if(isl.zoneAt[y][x]!==zi||t===' '||t==='=')continue;cells++;if(Math.abs((area[x+','+y]||0)-4)>0.02)miss++;}});});
  return cells+' cases, '+miss+' incomplètes'})()""", lambda r: r.endswith(' 0 incomplètes'))
q.js('rien ne flotte (solides posés au sol)', """(()=>{const L=__lumen;let n=0,bad=[];L.world.zoneGroups.forEach((g,zi)=>{const m=g.children.find(c=>c.name==='solides2');if(!m)return;n++;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;if(b.min.y>0||b.min.y<-0.25)bad.push(zi+':'+b.min.y.toFixed(2));});
  L.world.zoneGroups.forEach((g,zi)=>g.children.forEach(c=>{if(c.name!=='feuillage2')return;const a=c.instanceMatrix.array;let low=0;for(let i=0;i<c.count;i++)if(a[i*16+13]<-0.05)low++;if(low)bad.push('feuillage '+zi+':'+low);}));
  return n+' zones, anomalies : '+JSON.stringify(bad)})()""", lambda r: r.endswith('[]'))
q.js('vent : shaders patchSway compilés', """(async()=>{const L=__lumen;L.tpZone('havre');await T.tick(1500);const keys=L.renderer.info.programs.map(p=>p.cacheKey);
  const has=(k)=>keys.some(s=>s.includes(k));return JSON.stringify({feuillage:has('fol2:'),herbe:has('tuft2:'),eau:has('eau2')})})()""", lambda r: 'false' not in r)
q.js("vent : l'image bouge avec le temps", """(async()=>{const L=__lumen,r=L.renderer,g=await import('/lumen/js/world/gfx.js');const real=r.render.bind(r);r.render=()=>{};await T.tick(300);
  /* on ne rend que le terrain et la végétation (tout le reste est masqué), à deux instants de l'horloge des shaders */
  const sc=L.scene,cam=L.camera,hid=[];const hide=(o)=>{if(o.visible){o.visible=false;hid.push(o);}};
  sc.children.forEach(o=>{if(o!==L.world.root&&!o.isLight)hide(o)});L.world.root.children.forEach(o=>{if(!L.world.zoneGroups.includes(o))hide(o)});L.world.zoneGroups.forEach(G=>G.children.forEach(o=>{if(!o.isMesh)hide(o)}));
  const gl=r.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
  const snap=(t)=>{g.U.time.value=t;real(sc,cam);const px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return px;};
  const t0=g.U.time.value;const a=snap(10),b=snap(10),c=snap(11.3);let same=0,moved=0;for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1])same++;if(a[i]!==c[i]||a[i+1]!==c[i+1]||a[i+2]!==c[i+2])moved++;}
  hid.forEach(o=>o.visible=true);g.U.time.value=t0;r.render=real;return JSON.stringify({bruit:same,bouge:moved})})()""", lambda r: __import__('json').loads(r)['bouge'] > 50 * (1 + __import__('json').loads(r)['bruit']))
REMOVE = """(()=>{const L=__lumen,isl=L.isl;let cell=null;for(let y=0;y<isl.h&&!cell;y++)for(let x=0;x<isl.w;x++)if(isl.terrain[y][x]==='%s'&&(L.G.zones[isl.zoneAt[y][x]].theme||'puzzle')!=='sanctuaire'){cell=[x,y];break;}
  if(!cell)return 'aucune case';const zi=isl.zoneAt[cell[1]][cell[0]];const at=(m)=>{const a=m.instanceMatrix.array,o=[];for(let i=0;i<m.count;i++)if(Math.abs(a[i*16+12]-cell[0]*2)<0.01&&Math.abs(a[i*16+14]-cell[1]*2)<0.01)o.push(Math.abs(a[i*16])+Math.abs(a[i*16+5]));return o;};
  const ms=L.world.zoneGroups[zi].children.filter(c=>c.isInstancedMesh&&at(c).length&&at(c).some(v=>v>0.5)&&c.geometry.attributes.position.count>40&&c.name!=='feuillage2'&&c.name!=='feuillage2_contour');
  const before=ms.length;L.world.removeCell('%s',cell[0],cell[1]);
  /* après retrait, les instances de cette case sont réduites à zéro (leur position devient 0) */
  const left=ms.filter(m=>at(m).some(v=>v>0.5)).length;return before+' maillages avant, '+left+' encore visibles'})()"""
q.js('ronce coupée : corps + contour retirés', REMOVE % ('r', 'r'), lambda r: r.startswith('2 maillages') and r.endswith(' 0 encore visibles'))
q.js('roche brisée : corps + contour + fissures retirés', REMOVE % ('c', 'c'), lambda r: r.startswith('3 maillages') and r.endswith(' 0 encore visibles'))
print('ERRORS:', q.errs)
for r in q.results: print(r)
q.b.close(); q.p.stop()
if q.srv: q.srv.terminate()
sys.exit(1 if q.errs or any(r[1] != 'OK' for r in q.results) else 0)
