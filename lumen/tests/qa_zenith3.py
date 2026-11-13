"""Acte VI — quêtes secondaires, boutiques, forge, objets uniques et rattrapage (logique réelle)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-3', query='?ile=zenith&low&nobloom'); q.load()
J=q.js
J('arrivée',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='porte';s.player.respawn={zone:'porte',cell:[12,7]};s.world=m.newWorld('porte');s.player.abilities={porter:true};s.player.lvl=14;s.player.ecus=300;
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(1500);T.pump();await T.tick(300);return T.info()})()""","play")
J('intro',"(async()=>{for(const n of ['celestine','selene_z','bran_z'])await T.talkTo(n);return T.q('q_porte')+' '+T.q('q_jardins')})()","done")
# lampions
J('s_lampions_z: Mira',"(async()=>{await T.talkTo('mira_z',(n)=>0);return T.q('s_lampions_z')})()","active:lampions")
J('s_lampions_z: 7 lampions',"(async()=>{const L=__lumen;L.tpZone('porte');await T.tick(600);const r=await T.lightLamps();return r+' '+T.q('s_lampions_z')})()","active:retour")
J('s_lampions_z: remise',"(async()=>{const b=T.pre();await T.talkTo('mira_z');return T.q('s_lampions_z')+' '+await T.rewardCheck('s_lampions_z',b)})()","récompenses ok")
# colis
J('s_colis_z: Gaspard',"(async()=>{await T.talkTo('gaspard_z',(n,l)=>1);return T.q('s_colis_z')+' colis='+__lumen.st.inv.colis_z})()","active:pell")
J('s_colis_z: Pell, Ysolde, Gaspard',"(async()=>{const b=T.pre();await T.talkTo('pell_z');const a=T.q('s_colis_z');await T.talkTo('ysolde_z');const c=T.q('s_colis_z');await T.talkTo('gaspard_z');return a+' '+c+' '+T.q('s_colis_z')+' '+await T.rewardCheck('s_colis_z',b)})()","récompenses ok")
# garde
J('s_garde_z: Aldo',"(async()=>{await T.talkTo('aldo_z',(n)=>0);return T.q('s_garde_z')})()","active:chasse")
J('s_garde_z: 12 kills dans les Jardins',"(async()=>{const L=__lumen;L.tpZone('jardins');await T.tick(1500);let k=0;for(let r=0;r<6&&(L.st.stats.kills-(L.st.quests.s_garde_z.base.kills||0))<12;r++){k+=await T.cutAndKill(null,25000);await T.tick(500);}return k+' '+T.q('s_garde_z')+' kills='+L.st.stats.kills+' ivoire='+L.st.inv.eclat_ivoire})()","active:retour")
J('fleurs: Vesper propose',"(async()=>{await T.talkTo('vesper',(n)=>0);await T.talkTo('vesper',(n)=>0);return T.q('s_fleurs_z')})()","active")
J('fleurs: cueillette',"(async()=>{const o=[];for(const id of ['fleur1','fleur2','fleur3','fleur4'])o.push(await T.pickupAt(id));return o.join(',')+' '+__lumen.st.inv.fleur_ciel+' '+T.q('s_fleurs_z')})()","retour")
J('fleurs: remise',"(async()=>{const b=T.pre();await T.talkTo('vesper');return T.q('s_fleurs_z')+' '+await T.rewardCheck('s_fleurs_z',b)})()","récompenses ok")
J('éclats d’ivoire (drops + boutique)',"(async()=>{const L=__lumen;const have=L.st.inv.eclat_ivoire||0;return 'ivoire='+have})()")
J('s_garde_z: remise',"(async()=>{const L=__lumen;const b=T.pre();await T.talkTo('aldo_z');return T.q('s_garde_z')+' '+await T.rewardCheck('s_garde_z',b)})()","récompenses ok")
J('s_verre_z: Silex',"(async()=>{await T.talkTo('silex_z',(n,l)=>1);return T.q('s_verre_z')})()","active")
J('s_verre_z: éclats (rattrapage si besoin)',"(async()=>{const L=__lumen;const had=L.st.inv.eclat_ivoire||0;L.G.screens.close();L.st.player.ecus=3000;L.G.screens.shop('silex_z',false);await T.tick(200);const lis=[...document.querySelectorAll('#screen .shop-list li')].map(li=>li.textContent.slice(0,50));L.G.screens.close();return had+' | '+JSON.stringify(lis)})()")
J('éclats de prisme (4)',"(async()=>{const L=__lumen;const o=[];for(const z of ['jz1','jz2','jz3','jardins','salle']){L.tpZone(z);await T.tick(600);}return JSON.stringify(L.G.counts('shards'))+' pk='+Object.values(L.world.pickupViews).filter(v=>/shard|eclat/.test(v.pk.id||'')).map(v=>v.pk.id+':'+(v.g.visible?'ici':'pris')).join(',')})()")
q.done()
