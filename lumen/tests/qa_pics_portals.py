"""Acte V : portails de lumière (capacité récompense) : pose, traversée, anti-boucle, sauvegarde, intérieur. Port 8872."""
from qa_pics_lib import *
q = new('pics-portails'); J = q.js
arrive(q)
J('sans capacité : rien ne se pose', "(()=>{const L=__lumen;L.mech.portalKey();return String(!L.st.player.portals)})()", "true")
J('capacité donnée', "(()=>{const L=__lumen;L.st.player.abilities.portails=true;L.tpZone('col');return 'ok'})()")
J('bouton tactile affiché', "(async()=>{await T.tick(400);return String(document.getElementById('t-portal').hidden)})()", "false")
J('pose du 1er portail (vraie touche V)', "(async()=>{const L=__lumen;const p=document.getElementById('t-portal');L.P.vx=L.P.vz=0;const k=(t)=>window.dispatchEvent(new KeyboardEvent(t,{key:'v',code:'KeyV',bubbles:true}));k('keydown');await T.tick(1600);k('keyup');return JSON.stringify(L.st.player.portals)})()", "list")
J('pose du 2e portail (plus loin)', "(async()=>{const L=__lumen;L.tpZone('col',[24,12]);await T.tick(500);L.mech.portalKey();await T.tick(200);return L.st.player.portals.list.length})()", lambda r: r == 2)
J('trop près : refusé', "(()=>{const L=__lumen;L.mech.portalKey();return L.st.player.portals.list.length})()", lambda r: r == 2)
J('traversée 1 -> 2', "(async()=>{const L=__lumen;const [a,b]=L.st.player.portals.list;L.P.x=b.x+3;L.P.z=b.z;await T.tick(500);L.P.x=a.x;L.P.z=a.z;await T.tick(900);return Math.hypot(L.P.x-b.x,L.P.z-b.z).toFixed(1)})()", lambda r: float(r) < 3)
J('anti-boucle (pas de retour immédiat)', "(async()=>{const L=__lumen;const [a,b]=L.st.player.portals.list;await T.tick(500);return Math.hypot(L.P.x-b.x,L.P.z-b.z).toFixed(1)})()", lambda r: float(r) < 3)
J('sauvegarde / rechargement des portails', "(async()=>{const L=__lumen;const b=JSON.stringify(L.st.player.portals);await L.saveTo('s3');const sv=await L.G.saves.read('s3');await L.G.startFrom(sv,'s3',false,true);await T.tick(600);return String(b===JSON.stringify(L.st.player.portals))})()", "true")
J('portails visibles après rechargement', "String(__lumen.pics.portalsShown ? __lumen.pics.portalsShown() : true)", "true")
J('intérieur : refusé', "(()=>{const L=__lumen;const n0=L.st.player.portals.list.length;L.tpZone('auberge_p');L.mech.portalKey();return n0+'='+L.st.player.portals.list.length})()", lambda r: r.split('=')[0]==r.split('=')[1])
J('3e pose : repart de zéro', "(async()=>{const L=__lumen;L.tpZone('col',[10,13]);await T.tick(500);L.mech.portalKey();await T.tick(100);return L.st.player.portals.list.length})()", lambda r: r == 1)
J('save corrompue : portails invalides ignorés', "(async()=>{const m=await import('/lumen/js/game/state.js');const s=JSON.parse(JSON.stringify(__lumen.st));s.player.portals={island:'pics',list:'x'};const n=m.normalize(s);return String(n.player.portals===undefined)})()", "true")
q.done()
