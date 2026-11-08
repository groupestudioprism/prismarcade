import sys; sys.path.insert(0,'/home/claude/prismarcade/lumen/tests')
from qa_lib import *
q=QA('aube-secondaires'); q.load()
J=q.js
J('nouvelle partie',"T.newGame()","play")
J('prépa Séléné 1/2 + arme',"""(async()=>{const L=__lumen;await T.talkTo('selene');L.openGate('g1');L.openGate('g2');L.quests.check();await T.talkTo('selene');L.give('epee_courte',1);L.G.equip('epee_courte',true);L.st.player.ecus=500;return T.q('q_lentille')+' '+L.st.equip.weapon})()""")
# ----- Maëlle : s_pain
J('s_pain: proposée',"(async()=>{__lumen.tpZone('auberge_in');await T.tick(300);window.__b=T.pre();return await T.talkTo('maelle',(n)=>1)+' '+T.q('s_pain')})()","active:fleurs")
J('s_pain: fleurs (ramassage réel, ronces)',"""(async()=>{const L=__lumen;L.tpZone('lande');await T.tick(900);const o=[];for(const id of ['fleur1','fleur2','fleur3','fleur4'])o.push(await T.pickupAt(id));return o.join(',')+' fleurs='+L.st.inv.fleur_miel+' '+T.q('s_pain')})()""","active:retour")
J('s_pain: Gaspard ne rachète pas les fleurs',"(async()=>{const L=__lumen;L.G.screens.shop('gaspard',true);await T.tick(200);const t=document.querySelector('#screen').innerText;L.G.screens.close();return JSON.stringify({vendable:t.includes('Fleur de miel')})})()","\"vendable\":false")
J('s_pain: remise',"(async()=>{const b=window.__b=T.pre();__lumen.tpZone('auberge_in');await T.tick(300);await T.talkTo('maelle');return T.q('s_pain')+' '+await T.rewardCheck('s_pain',b)})()","récompenses ok")
# ----- Bran : s_marteau (nécessite forge_ouverte)
J('s_marteau: Bran propose',"(async()=>{const L=__lumen;L.st.flags.forge_ouverte=1;L.tpZone('havre');await T.tick(400);const r=await T.talkTo('bran',(n,l)=>2);return r+' '+T.q('s_marteau')})()","active:trouver")
J('s_marteau: coffre de la lande',"(async()=>{const L=__lumen;L.tpZone('lande');await T.tick(900);await T.cutAndKill(null,20000);const zi=L.G.zones.findIndex(z=>z.id==='lande');for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='r'&&L.isl.zoneAt[y][x]===zi){L.P.x=x*2;L.P.z=y*2-1.2;L.P.face=0;L.st.player.hp=999;for(let i=0;i<6&&L.isl.terrain[y][x]==='r';i++){L.combat.melee({mult:1});await T.tick(50);}}return await T.openChest('ch_marteau_bran')+' '+T.q('s_marteau')})()","active:retour")
J('s_marteau: remise (remise forge)',"(async()=>{const b=T.pre();__lumen.tpZone('havre');await T.tick(300);await T.talkTo('bran');return T.q('s_marteau')+' remise='+__lumen.st.flags.forge_remise+' '+await T.rewardCheck('s_marteau',b)})()","récompenses ok")
# ----- Ysolde : s_ysolde
J('s_ysolde: propose',"(async()=>{__lumen.tpZone('havre');await T.tick(300);return await T.talkTo('ysolde',(n)=>1)+' '+T.q('s_ysolde')})()","active:brume")
J('s_ysolde: 5 brumes (give)',"(async()=>{const L=__lumen;L.give('brume',5);L.quests.check();return T.q('s_ysolde')})()","active:retour")
J('s_ysolde: remise + stock grande potion',"(async()=>{const b=T.pre();await T.talkTo('ysolde');const r=T.q('s_ysolde')+' plus='+__lumen.st.flags.ysolde_plus+' '+await T.rewardCheck('s_ysolde',b);return r})()","récompenses ok")
J('s_ysolde: boutique débloque grande potion',"(async()=>{const L=__lumen;L.G.screens.shop('ysolde',false);await T.tick(200);const t=document.querySelector('#screen').innerText;L.G.screens.close();return JSON.stringify({gp:t.includes('Grande potion')})})()","\"gp\":true")
# ----- Tobias : s_pendentif
J('s_pendentif: propose',"(async()=>{__lumen.tpZone('havre');await T.tick(300);return await T.talkTo('tobias')+' '+T.q('s_pendentif')})()","active:trouver")
J('s_pendentif: pendentif (ronces)',"""(async()=>{const L=__lumen;L.tpZone('havre');await T.tick(600);const zi=L.G.zones.findIndex(z=>z.id==='havre');let c=0;for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='r'&&L.isl.zoneAt[y][x]===zi){L.P.x=x*2;L.P.z=y*2-1.2;L.P.face=0;L.st.player.hp=999;for(let i=0;i<6&&L.isl.terrain[y][x]==='r';i++){L.combat.melee({mult:1});await T.tick(50);}c++;}const r=await T.pickupAt('pendentif');return c+' ronces; '+r+' '+T.q('s_pendentif')})()""","active:retour")
J('s_pendentif: remise',"(async()=>{const b=T.pre();__lumen.tpZone('havre');await T.tick(300);await T.talkTo('tobias');return T.q('s_pendentif')+' '+await T.rewardCheck('s_pendentif',b)})()","récompenses ok")
# ----- Pell : s_prisme (8 éclats) et Lison : s_pages (3 pages) → via secrets
J('s_prisme + s_pages: propositions',"(async()=>{const L=__lumen;L.tpZone('havre');await T.tick(300);await T.talkTo('pell',(n)=>2);await T.talkTo('lison');return T.q('s_prisme')+' '+T.q('s_pages')})()","active:eclats active:pages")
J('énigmes + secrets + ramassage',"""(async()=>{const L=__lumen;for(const [z,g] of [['z1','g1'],['z2','g2'],['z3','g3'],['z3','s1'],['z4','g4'],['z4','s2'],['z8','g8'],['z8','s3']]){L.tpZone(z);await T.tick(200);T.solve(g);}
  for(const [z,g] of [['s1','t1'],['s2','t2'],['s3','t3']]){L.tpZone(z);await T.tick(200);T.solve(g);}
  for(const e of L.isl.ents.filter(e=>['shard','page'].includes(e.t))){const z=L.G.zones[e.zone];L.tpZone(z.id,[e.x-z.ox,e.y-z.oy]);for(let i=0;i<10&&!L.st.world.picked[e.id];i++)await T.tick(60);if(L.G.screens.current)L.G.screens.close();}
  L.G.screens.close();return 'shards='+L.G.counts('shards')+' pages='+L.G.counts('pages')+' '+T.q('s_prisme')+' '+T.q('s_pages')})()""")
J('s_prisme: forcer 8 éclats si manquants',"(async()=>{const L=__lumen;return T.q('s_prisme')+' '+L.G.counts('shards')})()")
J('s_pages: remise (clé d\'Orin)',"(async()=>{const b=T.pre();__lumen.tpZone('havre');await T.tick(300);await T.talkTo('lison');return T.q('s_pages')+' cle='+__lumen.st.inv.cle_orin+' '+await T.rewardCheck('s_pages',b)})()","récompenses ok")
J('s_prisme: remise',"(async()=>{const b=T.pre();await T.talkTo('pell');return T.q('s_prisme')+' '+await T.rewardCheck('s_prisme',b)})()","récompenses ok")
J('maison d\'Orin: porte + bureau + page 4',"""(async()=>{const L=__lumen;L.tpZone('havre');await T.tick(500);const pr=L.world.props.find(p=>p.p.id==='orin');const [x,z]=[pr.g.position.x,pr.g.position.z];
  const cell=L.G.zones[pr.zi];const dx=(cell.ox+pr.p.door[0])*2,dz=(cell.oy+pr.p.door[1])*2;L.P.x=dx;L.P.z=dz+1.2;let r='';for(let i=0;i<20;i++){await T.tick(60);const t=L.target();if(t&&t.kind==='door'){r=t.label;L.interact();break;}}await T.tick(900);
  const zin=L.G.zoneId();const o=await T.useTarget('desk',L.P.x,L.P.z);return r+' -> '+zin+' desk:'+o+' vision='+L.st.player.abilities.vision})()""")
J('page 4',"T.pickupAt('page_orin4')")
# ----- Aldo : s_chasse
J('s_chasse: propose',"(async()=>{__lumen.tpZone('havre');await T.tick(300);return await T.talkTo('aldo')+' '+T.q('s_chasse')})()","active:chasse")
J('s_chasse: 12 kills',"(async()=>{const L=__lumen;let r=0;L.tpZone('lande',[15,3]);await T.tick(1200);while(r++<5&&(L.st.stats.kills-L.st.quests.s_chasse.base.kills)<12){await T.cutAndKill(null,25000);L.combat.resetAll();L.tpZone('lande',[15,3]);await T.tick(900);}return (L.st.stats.kills-L.st.quests.s_chasse.base.kills)+' '+T.q('s_chasse')})()","active:retour")
J('s_chasse: remise',"(async()=>{const b=T.pre();__lumen.tpZone('havre');await T.tick(300);await T.talkTo('aldo');return T.q('s_chasse')+' '+await T.rewardCheck('s_chasse',b)})()","récompenses ok")
# ----- Mira : s_lampions (7)
J('s_lampions: propose',"(async()=>{__lumen.tpZone('havre');await T.tick(300);return await T.talkTo('mira')+' '+T.q('s_lampions')})()","active:lampions")
J('s_lampions: 7 lampions (interaction réelle)',"(async()=>{const L=__lumen;L.tpZone('havre');await T.tick(700);const r=await T.lightLamps();return r+' '+T.q('s_lampions')})()","active:retour")
J('s_lampions: remise',"(async()=>{const b=T.pre();await T.talkTo('mira');return T.q('s_lampions')+' '+await T.rewardCheck('s_lampions',b)})()","récompenses ok")
J('puits',"""(async()=>{const L=__lumen;const pr=L.world.props.find(p=>p.p.t==='well');const e0=L.st.player.ecus;const r=await T.useTarget('well',pr.g.position.x,pr.g.position.z+1.4);return r+' +'+(L.st.player.ecus-e0)})()""")
J('complétion + état',"JSON.stringify({c:__lumen.completion(),done:__lumen.quests.done('side').length,active:__lumen.quests.active()})")
J('save/load',"T.roundtrip('s1')","identique")
q.done()
