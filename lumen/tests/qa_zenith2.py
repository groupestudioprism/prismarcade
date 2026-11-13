"""Acte VI — chaîne principale de bout en bout : Porte → portails → Jardins → Grande Salle (boss) → phare → fin → crédits → jeu libre → sauvegarde."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-2', query='?ile=zenith&low&nobloom'); q.load()
J=q.js
J('arrivée',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='porte';s.player.respawn={zone:'porte',cell:[12,7]};s.world=m.newWorld('porte');s.player.abilities={porter:true};s.player.lvl=12;
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(1500);T.pump();await T.tick(300);return T.info()})()""","play")
J('Célestine',"(async()=>{const r=await T.talkTo('celestine');return T.q('q_porte')+' portails='+__lumen.st.player.abilities.portails})()","active")
J('Séléné',"(async()=>{await T.talkTo('selene_z');return T.q('q_porte')})()")
J('Bran',"(async()=>{await T.talkTo('bran_z');return T.q('q_porte')+' | '+T.q('q_jardins')+' b='+__lumen.G.isGateOpen('b_portails')})()")
for g,z in (('zg1','jz1'),('zg2','jz2'),('zg3','jz3')):
    J('salle '+z,f"(async()=>{{const L=__lumen;L.tpZone('{z}');await T.tick(900);const r=T.solve('{g}');await T.tick(300);return r+' '+T.q('q_jardins')+' '+T.info()}})()")
J('jardins arrivée',"(async()=>{const L=__lumen;L.tpZone('jardins');await T.tick(1200);return T.q('q_jardins')})()","vesper")
J('Vesper',"(async()=>{await T.talkTo('vesper',(n)=>0);return T.q('q_jardins')+' '+T.q('s_fleurs_z')})()")
J('salle arrivée',"(async()=>{const L=__lumen;L.tpZone('salle');await T.tick(1500);return T.q('q_jardins')+' '+T.q('q_salle')+' '+T.info()})()")
J('salle: combat',"(async()=>{const L=__lumen;const k=await T.cutAndKill(e=>e.room==='gs_combat',40000);await T.tick(1500);return k+' gate='+L.G.isGateOpen('gs_combat')+' '+JSON.stringify(L.combat.enemies.map(e=>[e.type,e.room,e.state]))+JSON.stringify(Object.keys(L.st.flags))})()")
J('salle: portails',"(async()=>{const r=T.solve('gs_light');await T.tick(300);return r+' '+T.q('q_salle')})()")
J('salle: coffre clé',"(async()=>{const r=await T.openChest('ch_cle_s');return r+' cle='+__lumen.st.inv.cle_salle+' '+T.q('q_salle')})()")
J('salle: état portes',"JSON.stringify({ch:Object.values(__lumen.world.chestViews).map(c=>c.c.id),gk:__lumen.G.isGateOpen('gs_key')})")
J('boss: apparition',"(async()=>{const L=__lumen;await T.tick(800);const b=L.combat.enemies.find(e=>e.boss);return b?b.type+' hp='+b.hp+' state='+b.state:'noboss'})()")
J('porte de l\'arène (clé)',"(async()=>{const L=__lumen;L.tpZone('salle',[15,11]);await T.tick(600);const r=await T.useTarget('lock',L.P.x,L.P.z);return r+' gk='+L.G.isGateOpen('gs_key')+' key='+L.st.inv.cle_salle})()")
J('boss: combat 3 phases',"""(async()=>{const L=__lumen,c=L.combat;L.tpZone('salle',[15,17]);await T.tick(900);
 const b=c.enemies.find(e=>e.boss);if(!b)return 'noboss';const seen=new Set(),log=[];const t0=Date.now();let maxAdds=0,shieldSeen=false;
 while(b.state!=='dead'&&Date.now()-t0<150000){L.st.player.hp=9999;L.st.player.en=999;
   if(b.shielded){shieldSeen=true;const a=c.enemies.find(e=>e.state!=='dead'&&e.tag==='eclipse');if(a){L.P.x=a.x;L.P.z=a.z+1.3;L.P.face=Math.PI;c.melee({mult:1});}else{c.enemies.filter(e=>!e.boss&&e.state!=='dead').forEach(e=>c.dealDamage(e,9999,'tranchant',{heavy:true}));}}
   else{L.P.x=b.x+(b.def.radius||1.5)+0.4;L.P.z=b.z;L.P.face=-Math.PI/2;c.melee({mult:1});}
   seen.add('p'+b.phase);maxAdds=Math.max(maxAdds,c.enemies.filter(e=>!e.boss&&e.state!=='dead').length);await T.tick(100);}
 return JSON.stringify({dead:b.state==='dead',phases:[...seen],shieldSeen,maxAdds,ms:Date.now()-t0,flag:L.st.flags.boss_zenith})})()""","\"dead\":true")
J('après boss',"(async()=>{await T.tick(2500);const L=__lumen;return T.q('q_salle')+' b_zenith='+L.G.isGateOpen('b_zenith')+' mode='+L.S.mode})()")
J('coffre du prisme',"(async()=>{const r=await T.openChest('ch_prisme_z');return r+' '+__lumen.st.inv.eclat_zenith+' '+T.q('q_salle')+' '+T.q('q_zenith')})()")
J('phare: arrivée',"(async()=>{const L=__lumen;L.tpZone('phare_z');await T.tick(1500);return T.q('q_zenith')+' '+T.info()})()")
J('phare: étape 1',"(async()=>{const L=__lumen;const r=T.solve('ph_d1');await T.tick(400);return r+' '+T.q('q_zenith')})()")
J('phare: étape 2',"(async()=>{const L=__lumen;const r=T.solve('ph_d2');await T.tick(400);return r+' '+T.q('q_zenith')})()")
J('sauvegarde avant la fin',"(async()=>{await __lumen.saveTo('s1');return 'ok'})()")
J('phare: finale',"(async()=>{const L=__lumen;const r=T.solve('end');await T.tick(1500);return r+' mode='+L.S.mode+' '+T.q('q_zenith')})()","ending")
q.tick(15000)
J('cinématique en cours',"JSON.stringify({mode:__lumen.S.mode,ph:__lumen.fin.phase,t:+__lumen.fin.time.toFixed(1),cap:(document.querySelector('#fin .cap')||{textContent:''}).textContent,br:__lumen.zscene&&1})")
J('passer la scène',"(()=>{document.querySelector('#fin .skip').click();return 'skip'})()")
q.tick(2500)
J('bilan',"JSON.stringify({ph:__lumen.fin.phase,flag:__lumen.st.flags.fin_jeu,txt:(document.querySelector('#fin .card')||{innerText:''}).innerText.slice(0,500)})","flag\":1")
J('générique',"(()=>{document.querySelector('#fin [data-a=credits]').click();return document.querySelector('#fin .credits')?'credits':'rien'})()","credits")
q.tick(1500)
J('retour jeu libre',"(async()=>{document.querySelector('#fin [data-a=free]').click();await T.tick(2500);const L=__lumen;return L.S.mode+' '+T.q('q_zenith')+' '+T.q('q_epilogue')+' fin='+L.fin.active})()","play")
J('Célestine: épilogue',"(async()=>{await T.talkTo('celestine');return T.q('q_epilogue')+' fin_jeu='+__lumen.st.flags.fin_jeu})()")
J('sauvegarde/rechargement',"T.roundtrip('s2')","identique")
J('complétion globale',"JSON.stringify(__lumen.G.completionAll())")
q.done()
