"""Acte VI — sauvegarde juste avant la fin (la scène se rejoue), rejeu volontaire, jeu libre après la fin, sauvegarde/rechargement."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-4', query='?ile=zenith&low&nobloom'); q.load()
J=q.js
J('état « juste avant la fin » (portes ouvertes, balises prêtes)',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='phare_z';s.player.respawn={zone:'phare_z',cell:[1,2]};s.world=m.newWorld('phare_z');s.player.abilities={porter:true,portails:true};s.player.lvl=14;s.flags={boss_zenith:1};for(const k of ['q_porte','q_jardins','q_salle'])s.quests[k]={state:'done',step:9,base:{}};
  s.world.gates={b_portails:1,zg1:1,zg2:1,zg3:1,b_salle:1,gs_combat:1,gs_light:1,gs_key:1,b_zenith:1,ph_d1:1,ph_d2:1,end:1};
  window.__sv=s;await __lumen.G.startFrom(s,'auto',false,true);await T.tick(3500);T.pump();return __lumen.S.mode+' '+T.info()})()""","ending")
J('la scène a repris les récompenses une seule fois',"(()=>JSON.stringify({fin_jeu:__lumen.st.flags.fin_jeu}))()")
J('passer, bilan',"(async()=>{document.querySelector('#fin .skip').click();await T.tick(3000);return __lumen.fin.phase+' fin_jeu='+__lumen.st.flags.fin_jeu})()","bilan fin_jeu=1")
J('jeu libre',"(async()=>{document.querySelector('#fin [data-a=free]').click();await T.tick(2500);return __lumen.S.mode})()","play")
J('cible « Contempler le Prisme »',"(async()=>{const L=__lumen;const tp=L.zscene.top;let ok=0;for(const [dx,dz] of [[-4,0],[0,4],[4,0],[0,-4],[-3,3],[3,3],[-5,2]]){if(L.G.canStand(tp.x+dx,tp.z+dz)){L.P.x=tp.x+dx;L.P.z=tp.z+dz;ok=1;break;}}await T.tick(900);const t=L.target();return t?t.kind+':'+t.label:'aucune'})()","prisme")
J('rejeu par la cible',"(async()=>{const L=__lumen;L.interact();await T.tick(1500);const m1=L.S.mode;document.querySelector('#fin .skip').click();await T.tick(2500);document.querySelector('#fin [data-a=free]').click();await T.tick(2500);return m1+' -> '+L.S.mode})()","ending -> play")
J('sauvegarde/chargement après la fin',"T.roundtrip('s2')","identique")
J('rechargement : pas de rejeu auto',"(async()=>{await T.tick(2500);return __lumen.S.mode+' fin='+__lumen.fin.active})()","play fin=false")
J('Célestine : rejouer la fin',"(async()=>{const r=await T.talkTo('celestine',(n,l)=>{const i=[...document.querySelectorAll('#dialog .choice')].findIndex(c=>/Revoir la scène/.test(c.textContent));return i<0?0:i});await T.tick(1500);let k=0;while(__lumen.S.mode!=='ending'&&k++<30)await T.tick(100);return __lumen.S.mode+' fin='+__lumen.fin.active+' '+r})()","ending fin=true")
J('rejeu terminé : retour au jeu libre',"(async()=>{document.querySelector('#fin .skip').click();await T.tick(2500);document.querySelector('#fin [data-a=free]').click();await T.tick(2500);return __lumen.S.mode})()","play")
q.done()
