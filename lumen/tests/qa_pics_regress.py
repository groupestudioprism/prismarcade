"""Acte V : non-régression Aube / Forêt (démarrage, zones, énigmes, grappin, voyage). Port 8872."""
from qa_pics_lib import *
q = QA('regress-aube', query='?low&nobloom'); q.load(); J = q.js
J('Aube : nouvelle partie', "T.newGame()", "play")
J('Aube : zones', """(async()=>{const L=__lumen;const o=[];for(const z of L.G.zones){L.tpZone(z.id);await T.tick(350);o.push(z.id+':'+L.S.mode)}return o.join(' ')})()""", lambda r: 'play' in r and 'dead' not in r)
J('Aube : énigmes (solutions)', """(()=>{const L=__lumen;const o=[];for(const g of Object.keys(SOL.aube)){if(!SOL.aube[g])continue;o.push(g+'='+T.solve(g))}return o.join(' ')})()""", lambda r: 'false' not in r)
J('Aube : Fia, quête', "T.q('q_reveil')")
J('Aube : touche V sans capacité', "(()=>{const L=__lumen;const n=document.querySelectorAll('.toast').length;return String(!L.st.player.abilities.portails)})()", "true")
J('Aube : pas de pierre de vent', "String(__lumen.isl.ents.filter(e=>e.t==='vent').length)", "0")
q.done()
q = QA('regress-foret', query='?low&nobloom&ile=foret'); q.load(); J = q.js
J('Forêt : arrivée', """(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();
 s.player.island='foret';s.player.zone='vitrebourg';s.player.x=null;s.player.z=null;s.player.lvl=10;s.player.abilities={onde:true,grappin:true};s.flags.acte1_fini=1;s.inv.grappin=1;s.world=m.newWorld('havre');
 await __lumen.G.startFrom(s,'s2',false,true);await T.tick(900);T.pump();return T.info()})()""", "foret")
J('Forêt : zones', """(async()=>{const L=__lumen;const o=[];for(const z of L.G.zones){L.tpZone(z.id);await T.tick(350);o.push(z.id+':'+L.S.mode)}return o.join(' ')})()""", lambda r: 'play' in r)
J('Forêt : grappin réel (can1)', "(async()=>{const L=__lumen;L.tpZone('can1');await T.tick(600);return await T.hookAll('can1')})()", lambda r: 'KO' not in r and 'ok' in r)
J('Forêt : énigmes (solutions)', """(()=>{const L=__lumen;const o=[];for(const g of Object.keys(SOL.foret)){if(!SOL.foret[g])continue;o.push(g+'='+T.solve(g))}return o.join(' ')})()""", lambda r: 'false' not in r)
J('Forêt : pas de relais temporisé / vent', "String(__lumen.isl.ents.filter(e=>e.t==='vent'||(e.t==='relay'&&e.hold)).length)", "0")
q.done()
