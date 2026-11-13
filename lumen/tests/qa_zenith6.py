"""Acte VI — boutiques, forge, auberge (repos), mort et reprise."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-6', query='?ile=zenith&low&nobloom'); q.load()
J=q.js
J('arrivée',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='porte';s.player.respawn={zone:'porte',cell:[12,7]};s.world=m.newWorld('porte');s.player.abilities={porter:true,portails:true};s.player.lvl=14;
  s.quests.q_porte={state:'done',step:3,base:{}};s.flags.boss_zenith=1;s.inv.baton=1;s.equip.weapon='baton';
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(1500);T.pump();return T.info()})()""","play")
for sh in ('ysolde_z','gaspard_z','bran_z','silex_z','pell_z','lison_z'):
    J('boutique '+sh,"(async()=>{const r=await T.shopBuy('%s');return JSON.stringify(r)})()"%sh)
J('forge: recettes du Zénith',"""(async()=>{const L=__lumen;L.st.player.ecus=9000;for(const [k,n] of Object.entries({eclat_ivoire:20,larme_ombre:2,essence_brume:6,pierre:10,fibre:10}))L.give(k,n);
  L.G.screens.close();L.G.screens.forge&&L.G.screens.forge();await T.tick(300);const rows=[...document.querySelectorAll('#screen li')].map(li=>li.textContent.slice(0,40));
  const btns=[...document.querySelectorAll('#screen [data-craft]')];const out=btns.length;let ok=0;for(const b of btns){if(!b.disabled){b.click();await T.tick(120);ok++;}}L.G.screens.close();
  return JSON.stringify({boutons:out,forges:ok,epee:L.st.inv.epee_zenith,marteau:L.st.inv.marteau_ivoire,armure:L.st.inv.armure_zenith})})()""")
J('auberge: repos',"(async()=>{const L=__lumen;L.tpZone('auberge_z');await T.tick(900);L.st.player.hp=10;const r=await T.talkTo('oriel',(n,l)=>l[l.length-1]?0:0);return r+' hp='+L.st.player.hp})()")
J('mort et reprise',"""(async()=>{const L=__lumen;L.tpZone('jardins');await T.tick(900);L.st.player.hp=5;L.G.hurtPlayer(9999,L.P.x+1,L.P.z,{});
  let seen=[];for(let i=0;i<40;i++){await T.tick(300);seen.push(L.S.mode+(L.G.screens.current?':'+L.G.screens.current:''));if(L.S.mode==='play'&&i>3&&L.P.alive)break;}
  if(L.G.screens.current==='death'){document.querySelector('#screen [data-a]')&&document.querySelector('#screen [data-a]').click();await T.tick(2500);}
  return [...new Set(seen)].join(',')+' alive='+L.P.alive+' hp='+L.st.player.hp+' '+T.info()})()""")
J('menus (inventaire, journal, carte)',"T.exercise()","ok")
q.done()
