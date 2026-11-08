import sys; sys.path.insert(0,'/home/claude/prismarcade/lumen/tests')
from qa_lib import *
q=QA('aube2'); q.load()
# état de départ : saute directement après Bran 2 (déjà validé par aube1) en forgeant l'état par les VRAIES API
q.js('nouvelle partie',"(async()=>{await __lumen.G.startFrom(null,'auto'); T.pump(); return __lumen.S.mode})()","play")
q.tick(1000)
q.js('prépa: Séléné→Bran',"""(async()=>{const L=__lumen;
  await T.talkTo('selene'); L.openGate('g1');L.openGate('g2');L.quests.check(); await T.talkTo('selene'); await T.talkTo('bran'); L.give('brume',3); L.quests.check(); await T.talkTo('bran');
  return T.q('q_lentille')+' '+L.st.equip.weapon})()""")
# --- haie de ronces : inaccessible sans lame, puis coupée à la vraie épée
q.js('haie: accessibilité sans couper',"""(async()=>{const L=__lumen;const lg=await import('/lumen/js/logic.js');
  const z=L.G.zones.find(z=>z.id==='lande'), s=L.G.zones.find(z=>z.id==='sanctuaire');
  const seen=lg.reachCells(L.isl,[[z.ox+z.spawn[0],z.oy+z.spawn[1]]]);
  const seen2=lg.reachCells(L.isl,[[z.ox+z.spawn[0],z.oy+z.spawn[1]]],{cut:true});
  const sp=(s.ox+s.spawn[0])+','+(s.oy+s.spawn[1]);
  return JSON.stringify({sansLame:seen.has(sp), avecLame:seen2.has(sp)})})()""", lambda r: '"sansLame":false' in r and '"avecLame":true' in r)
q.js('haie: couper avec l\'épée',"""(async()=>{const L=__lumen;L.tpZone('lande',[15,1]);await T.tick(500);
  const ron=[];for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='r'&&L.isl.zoneAt[y][x]===L.G.zoneIndexAt(L.P.x,L.P.z))ron.push([x,y]);
  if(!ron.length)return 'aucune ronce';const [x,y]=ron[0];L.P.x=x*2;L.P.z=y*2-1.2;L.P.face=0;L.st.player.hp=999;
  const before=L.isl.terrain[y][x];for(let i=0;i<8&&L.isl.terrain[y][x]==='r';i++){L.combat.melee({mult:1});await T.tick(120);}
  return JSON.stringify({n:ron.length,before,after:L.isl.terrain[y][x],cut:Object.keys(L.st.world.cut).length})})()""", lambda r: '"after":","' in r or '"after":","' in r or 'after":","' in r)
q.js('ronce: tout couper en réel (lande)',"""(async()=>{const L=__lumen;const zi=L.G.zoneIndexAt(L.P.x,L.P.z);let c=0;
  for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='r'&&L.isl.zoneAt[y][x]===zi){L.P.x=x*2;L.P.z=y*2-1.2;L.P.face=0;L.st.player.hp=999;for(let i=0;i<6&&L.isl.terrain[y][x]==='r';i++){L.combat.melee({mult:1});await T.tick(60);}
   if(L.isl.terrain[y][x]!=='r')c++;}
  return 'coupées '+c})()""")
q.js('sanctuaire atteint',"(async()=>{const L=__lumen;L.tpZone('sanctuaire');await T.tick(900);return T.q('q_lentille')+' warp='+JSON.stringify(L.st.world.warps)+' resp='+JSON.stringify(L.st.player.respawn)})()")
q.js('salle de combat: sceau fermé',"JSON.stringify({gate:__lumen.G.isGateOpen('sd_combat'),alive:__lumen.combat.roomAlive('sd_combat')})")
q.js('salle de combat: vraie mêlée',"""(async()=>{const L=__lumen,c=L.combat;L.tpZone('sanctuaire',[5,5]);const k=await T.cutAndKill(null,40000);await T.tick(1500);
  return JSON.stringify({hits:k,gate:L.G.isGateOpen('sd_combat'),alive:c.roomAlive('sd_combat')})})()""", lambda r: '"gate":true' in r)
q.js('énigme de lumière sd_light',"(async()=>{const L=__lumen;L.tpZone('sanctuaire',[24,5]);await T.tick(300);const mir=L.isl.ents.filter(e=>e.t==='mirror'&&e.zone===L.G.zoneIndexAt(L.P.x,L.P.z));return JSON.stringify({mir:mir.length,sol:T.solve('sd_light')})})()")
q.js('coffre clé',"T.openChest('ch_cle')", "ouvert:true")
q.js('clé en poche',"JSON.stringify({cle:__lumen.st.inv.cle_sanctuaire})")
q.js('coffre trésor',"T.openChest('ch_tresor')", "ouvert:true")
q.js('porte à clé (interaction réelle)',"""(async()=>{const L=__lumen;const g=L.isl.gates.sd_key;const [x,y]=g.cells[0];return await T.useTarget('lock',x*2,(y-1)*2-0.4)+' ouverte='+L.G.isGateOpen('sd_key')})()""")
q.js('coffre marteau caché avant boss',"JSON.stringify({vis:T.chestView('ch_marteau').g.visible})")
q.js('arène: boss présent',"(async()=>{const L=__lumen;L.tpZone('sanctuaire',[15,13]);await T.tick(900);const b=L.combat.enemies.find(e=>e.boss);return b?JSON.stringify({t:b.type,hp:b.hp,st:b.state}):'absent'})()")
q.js('boss: combat réel',"T.fightBoss(90000)")
q.tick(2500)
q.js('boss: suites',"JSON.stringify({flag:__lumen.st.flags.boss_colosse,lentille:__lumen.st.inv.lentille,q:T.q('q_lentille'),mode:__lumen.S.mode,warp:__lumen.st.world.warps.sanctuaire,marteauVisible:T.chestView('ch_marteau').g.visible})")
q.js('coffre marteau',"T.openChest('ch_marteau')", "ouvert:true")
q.js('Séléné: retour Lentille',"T.talkTo('selene')")
q.js('état',"T.q('q_lentille')+' | '+T.q('q_phare')")
q.js('complétion',"JSON.stringify(__lumen.completion())")
q.done()
