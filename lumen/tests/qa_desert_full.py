"""Désert des Échos — parcours complet de l'Acte III : voyage depuis la Forêt, Cité, salles de sable (portés, lames, tempête),
Dunes, Temple enseveli, boss, Orbe, vestibule, Phare des Sables, fin d'acte, sauvegarde.
Lancer : flock /tmp/lumen-chrome.lock timeout 900 python3 -u qa_desert_full.py   (port 8870 ; ?low&nobloom ; 640×360)"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
import shutil; shutil.rmtree('/tmp/qa_prof_desert2', ignore_errors=True)
H2 = r"""
window.T2 = {
  // se place à côté d'une case comme un joueur et attend une cible d'interaction vérifiant pred
  async stand(cx, cy, pred, tries){ const L=__lumen, X=cx*2, Z=cy*2;
    for (const [dx,dz] of [[0,2],[0,-2],[2,0],[-2,0],[1.5,1.5],[-1.5,1.5],[1.5,-1.5],[-1.5,-1.5],[0,1.4],[1.4,0],[0,-1.4],[-1.4,0]]) {
      if (!L.G.canStand(X+dx, Z+dz)) continue; L.P.x=X+dx; L.P.z=Z+dz; L.P.vx=L.P.vz=0;
      for (let i=0;i<(tries||12);i++){ await T.tick(60); const t=L.target(); if (t && pred(t)) return t; } }
    return null; },
  async carryTo(id, tx, ty){ const L=__lumen, A=L.G.a3, e=L.isl.ents.find(x=>x.id===id); const so=L.isl.socles.find(q=>q.x===tx&&q.y===ty); if(!so) return 'nosocle';
    if (e.x===tx && e.y===ty) return 'deja';
    let t = await T2.stand(e.x, e.y, t=>(t.kind==='device'||t.kind==='carry') && t.e.id===id); if(!t) return 'cible-pièce?';
    if (t.kind==='device') L.interactBack(); else L.interact(); await T.tick(80); if(!A.carrying()) return 'pas-pris';
    t = await T2.stand(so.x, so.y, t=>t.kind==='socle' && t.so.id===so.id); if(!t) return 'cible-socle?';
    L.interact(); await T.tick(80); return A.carrying() ? 'pas-posé' : 'ok'; },
  async rot(id, want){ const L=__lumen; const e=L.isl.ents.find(x=>x.id===id); if(!e) return 'id?'+id+' ont:'+L.isl.ents.filter(x=>x.zone===L.G.zones.findIndex(z=>z.id===L.G.zoneId())).map(x=>x.id).join('/')+' isl='+L.isl.id; const cur=()=> e.t==='lantern'?e.dir:e.t==='relay'?e.out:e.state;
    for (let i=0;i<4 && cur()!==want;i++){ const t = await T2.stand(e.x, e.y, t=>t.kind==='device' && t.e.id===id); if(!t) return 'cible?'+id; L.interact(); await T.tick(70); } return cur()===want ? 'ok' : 'état?'+id; },
  async solveReal(gate){ const L=__lumen, s=SOL.desert[gate]; if(!s) return 'nosol'; const out=[];
    let todo=Object.entries(s).filter(([k])=>k.startsWith('pos:')).map(([k,p])=>[k.slice(4),p]), guard=0;
    while(todo.length && guard++<8){ const rest=[]; for (const [id,p] of todo){ if(L.isl.entAt[p[0]+','+p[1]] && L.isl.entAt[p[0]+','+p[1]].id!==id){ rest.push([id,p]); continue; } const r=await T2.carryTo(id,p[0],p[1]); if(r!=='ok'&&r!=='deja') out.push(id+':'+r); } todo=rest; }
    for (const [k,v] of Object.entries(s)) if(!k.startsWith('pos:')){ const r=await T2.rot(k,v); if(r!=='ok') out.push(r); }
    await T.tick(200); return (L.isl.gates[gate].open?'ouverte':'FERMÉE')+(out.length?' '+out.join(','):''); },
};
"""
q = QA('desert-complet', profile='/tmp/qa_prof_desert2'); q.load()
J = q.js
J('nouvelle partie Aube', "T.newGame()", "play")
J('prépa fin acte II', """(()=>{const L=__lumen,s=L.st;Object.assign(s.flags,{acte1_fini:1,acte2_fini:1,boss_colosse:1,boss_verre:1,verre_fini:1,lens_set:1});
  ['q_reveil','q_lentille','q_phare','q_verre','q_phare_verre'].forEach(k=>s.quests[k]={state:'done',step:9,base:{}});
  L.give('epee_aube',1);L.G.equip('epee_aube',true);L.give('marteau',1);L.give('grappin',1);s.player.lvl=9;s.player.ecus=2000;window.__old=1;return 'ok'})()""")
J('Calixte → Désert (vrai voyage)', "T.talkTo('calixte',(n,last)=>{ const t=last[last.length-1]; const i=t.findIndex(x=>/Désert/.test(x)); return i<0?0:i; })")
q.reloaded(); q.pg.evaluate(H2)
J('arrivée Désert', "T.info()+' '+T.q('q_echos')+' porter='+__lumen.st.player.abilities.porter", "active:parler")
J('Oumi 1 : ponts ouverts', "(async()=>{await T.talkTo('oumi');const G=__lumen.G;return JSON.stringify({sable:G.isGateOpen('b_sable'),oasis:G.isGateOpen('b_oasis'),q:T.q('q_echos')})})()", '"sable":true')
for n in ['djamila','kassim','rafik']:
    J('boutique '+n, f"T.shopBuy('{n}')")
for n in ['oumi','yael','djamila','kassim','rafik','leila','idris','samir','tarek','ysmael']:
    J('dialogue '+n, f"(async()=>{{__lumen.G.screens.close();return await T.talkTo('{n}')}})()")
J('Nour (auberge)', "(async()=>{const L=__lumen;L.G.screens.close();L.tpZone('auberge_d');await T.tick(400);return await T.talkTo('nour')})()")
J('lit : repos', "(async()=>{const L=__lumen;const pr=L.world.props.find(p=>p.p.t==='bed'&&p.zi===L.S.zone);const t=await T2.stand(pr.p.x+L.G.zones[pr.zi].ox,pr.p.y+L.G.zones[pr.zi].oy,t=>t.kind==='bed');return t?'cible lit ok':'LIT?'})()", "ok")
# ---------- salles de sable : vraies interactions (porter, poser, tourner), tempête ----------
J('d1 : lame', "(async()=>{const L=__lumen;L.tpZone('d1',[1,5]);await T.tick(500);return await T2.solveReal('ds1')})()", "ouverte")
J('d2 : tempête → la lumière ne porte pas', """(async()=>{const L=__lumen,A=L.G.a3;L.tpZone('d2',[1,5]);await T.tick(500);A.setStorm('storm');await T.tick(200);
  const r=await T2.solveReal('ds2');const fade=(L.world&&1)?1:0;A.setStorm('calm');await T.tick(400);return r+' | après tempête: '+(L.isl.gates.ds2.open?'ouverte':'FERMÉE')})()""", "FERMÉE | après tempête: ouverte")
J('tempête : porte restée ouverte', "(async()=>{const L=__lumen,A=L.G.a3;A.setStorm('storm');await T.tick(300);const o=L.isl.gates.ds2.open;A.setStorm('calm');return 'ouverte pendant tempête: '+o})()", "true")
J('d3 : deux routes', "(async()=>{const L=__lumen;L.tpZone('d3',[1,5]);await T.tick(500);return await T2.solveReal('ds3')})()", "ouverte")
J('retour sur socle en quittant la salle', """(async()=>{const L=__lumen,A=L.G.a3;L.tpZone('d4',[1,5]);await T.tick(500);const p=L.isl.ents.find(e=>e.t==='prism'&&e.carry);
  let t=await T2.stand(p.x,p.y,t=>t.kind==='carry'&&t.e.id===p.id);if(!t)return 'cible?';L.interact();await T.tick(100);const had=!!A.carrying();
  L.tpZone('d3',[1,5]);await T.tick(500);return 'porté='+had+' après changement de salle: '+(A.carrying()?'ENCORE PORTÉ':'posé')+' prisme en '+p.x+','+p.y+' socle:'+!!L.isl.socles.find(q=>q.x===p.x&&q.y===p.y)})()""", "porté=true après changement de salle: posé")
J('d4 : prisme porté', "(async()=>{const L=__lumen;L.tpZone('d4',[1,5]);await T.tick(500);return await T2.solveReal('ds4')})()", "ouverte")
J('quête salles → dunes', "(async()=>{const L=__lumen;L.tpZone('dunes');await T.tick(1200);return T.q('q_echos')+' | '+T.q('q_temple')})()", "active:temple")
q.tick(500)
J('récompenses q_echos', "T.rewardCheck('q_echos',{inv:{},unl:{},ecus:0})")
# ---------- Dunes : abri de tempête, ennemis, coffres, ronces ----------
J('dunes : abri', """(async()=>{const L=__lumen,A=L.G.a3;L.tpZone('dunes',[12,10]);await T.tick(500);A.setStorm('storm');await T.tick(300);
  const t=await T2.stand(96+12,9,t=>t.kind==='shelter');if(!t)return 'abri?';L.interact();await T.tick(1200);return 'tempête après abri: '+A.storm.phase+' portée '+L.isl.range})()""", "calm portée null")
J('dunes : ennemis', "(async()=>{const L=__lumen;L.tpZone('dunes',[15,12]);await T.tick(1000);const t={};L.combat.enemies.forEach(e=>t[e.type]=(t[e.type]||0)+1);return JSON.stringify(t)})()", "scarabee")
J('dunes : combats (scorpion, chacal, cactus, momie, écho)', "(async()=>{const L=__lumen;const k=await T.cutAndKill(['scorpion','chacal','cactus','scarabee'],40000);return k})()")
J('dunes : coffres', """(async()=>{const o=[];for(const id of ['ch_dun_ecus','ch_dun_the','ch_dun_masse'])o.push(id+':'+await T.openChest(id));return o.join(' ')})()""")
J('dunes : ronces sèches', """(async()=>{const L=__lumen;const zi=L.G.zones.findIndex(z=>z.id==='dunes');let c=0,n=0;for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='r'&&L.isl.zoneAt[y][x]===zi){n++;L.P.x=x*2;L.P.z=y*2-1.2;L.P.face=0;L.st.player.hp=999;for(let i=0;i<6&&L.isl.terrain[y][x]==='r';i++){L.combat.melee({mult:1});await T.tick(60);}if(L.isl.terrain[y][x]!=='r')c++;}return c+'/'+n})()""")
J('dunes : roches (marteau)', """(async()=>{const L=__lumen;const zi=L.G.zones.findIndex(z=>z.id==='dunes');L.G.equip('marteau',true);let n=0;for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='c'&&L.isl.zoneAt[y][x]===zi){L.P.x=x*2;L.P.z=y*2-1.3;L.P.face=0;L.st.player.hp=999;for(let i=0;i<8&&L.isl.terrain[y][x]==='c';i++){L.combat.melee({mult:1});await T.tick(150);}n++;}L.G.equip('epee_aube',true);return 'blocs '+n+' broken='+Object.keys(L.st.world.broken).length})()""")
J('dunes : coffres cachés', """(async()=>{const o=[];for(const id of ['ch_dun_coeur'])o.push(id+':'+await T.openChest(id));return o.join(' ')})()""")
# ---------- Temple enseveli ----------
J('pont du temple (approche)', "(async()=>{const L=__lumen;L.tpZone('dunes',[20,28]);await T.tick(1500);return 'b_temple_d='+L.G.isGateOpen('b_temple_d')+' '+T.q('q_temple')})()", "b_temple_d=true")
J('temple : entrée', "(async()=>{const L=__lumen;L.tpZone('temple_d');await T.tick(1200);return T.q('q_temple')+' '+JSON.stringify(L.st.player.respawn)})()", "active:sceau")
J('temple : salle combat', "(async()=>{const L=__lumen;L.tpZone('temple_d',[5,5]);await T.tick(1200);const k=await T.cutAndKill(e=>e.room==='td_combat',60000);await T.tick(1500);return k+' gate='+L.G.isGateOpen('td_combat')})()", "gate=true")
J('temple : salle des lames (porter)', "(async()=>{const L=__lumen;L.tpZone('temple_d',[22,5]);await T.tick(500);return await T2.solveReal('td_light')})()", "ouverte")
J('temple : ennemis suite', "(async()=>{const L=__lumen;L.tpZone('temple_d',[5,14]);await T.tick(1000);return await T.cutAndKill(['momie','scorpion'],60000)})()")
J('temple : coffre clé', "T.openChest('ch_cle_td')", "ouvert:true")
J('temple : coffre trésor', "T.openChest('ch_tresor_td')", "ouvert:true")
J('temple : porte', """(async()=>{const L=__lumen;const [x,y]=L.isl.gates.td_key.cells[0];return await T.useTarget('lock',x*2,(y-1)*2-0.4)+' ouverte='+L.G.isGateOpen('td_key')})()""", "ouverte=true")
J('temple : roches cachées', """(async()=>{const L=__lumen;L.G.equip('marteau',true);let n=0;L.tpZone('temple_d',[4,19]);await T.tick(600);for(let y=0;y<L.isl.h;y++)for(let x=0;x<L.isl.w;x++)if(L.isl.terrain[y][x]==='c'&&L.isl.zoneAt[y][x]===L.S.zone){L.P.x=x*2;L.P.z=y*2-1.3;L.P.face=0;L.st.player.hp=999;for(let i=0;i<8&&L.isl.terrain[y][x]==='c';i++){L.combat.melee({mult:1});await T.tick(150);}n++;}L.G.equip('epee_aube',true);return 'blocs '+n})()""")
J('temple : coffres cachés + page + objets', """(async()=>{const o=[];for(const id of ['ch_cache_td','ch_cache2_td'])o.push(id+':'+await T.openChest(id));for(const p of ['tablette2','tablette3','jarre3','pg_temple'])o.push(p+':'+await T.pickupAt(p));return o.join(' ')})()""")
J('temple : boss', "(async()=>{const L=__lumen;L.tpZone('temple_d',[15,15]);await T.tick(1200);return await T.fightBoss(150000)})()", '"dead":true')
q.tick(2500)
J('temple : suites', "JSON.stringify({flag:__lumen.st.flags.boss_echos,q:T.q('q_temple'),warp:__lumen.st.world.warps.temple_d,mode:__lumen.S.mode})")
J('temple : coffre fragment doré', "T.openChest('ch_prisme_d')", "ouvert:true")
J('Oumi : fragment doré → Orbe', "(async()=>{const L=__lumen;L.G.screens.close();L.tpZone('cite');await T.tick(600);const r=await T.talkTo('oumi');return T.q('q_temple')+' orbe='+L.st.player.abilities.orbe+' b_phare='+L.G.isGateOpen('b_phare')+' | '+T.q('q_phare_sable')})()", "orbe=true b_phare=true | active:vasques")
J('récompenses q_temple', "T.rewardCheck('q_temple',{inv:{},unl:{},ecus:0})")
# ---------- Phare des Sables ----------
J('vestibule : vasques (Orbe)', """(async()=>{const L=__lumen;L.tpZone('ph_vest');await T.tick(1200);const prs=L.world.props.filter(p=>p.p.t==='vasque');let n=0;
  for(const pr of prs){const z=L.G.zones[pr.zi];const t=await T2.stand(pr.p.x+z.ox,pr.p.y+z.oy,t=>t.kind==='vasque'&&t.pr===pr);if(!t)return 'cible?'+pr.p.id;L.interact();await T.tick(300);n++;}
  return n+' vasques ; porte='+L.G.isGateOpen('ph_vasques')+' '+T.q('q_phare_sable')})()""", "porte=true active:phare")
J('vestibule : ennemis', "(async()=>{const L=__lumen;L.tpZone('ph_vest',[10,6]);await T.tick(1000);return await T.cutAndKill(null,50000)})()")
J('vestibule : coffres', """(async()=>{const o=[];for(const id of ['ch_phv_potion','ch_phv_anneau'])o.push(id+':'+await T.openChest(id));return o.join(' ')})()""")
J('phare : puzzle final (porter prisme + miroir)', "(async()=>{const L=__lumen;L.tpZone('phare_d',[1,1]);await T.tick(700);return await T2.solveReal('end')+' mode='+L.S.mode})()", "ouverte")
q.tick(1500)
J('après finale', "__lumen.S.mode+' '+T.q('q_phare_sable')+' restore='+__lumen.S.restoreT")
q.tick(6000)
J('Oumi : fin', "(async()=>{const L=__lumen;L.G.screens.close();L.S.mode='play';L.tpZone('cite');await T.tick(600);await T.talkTo('oumi');return T.q('q_phare_sable')+' acte3_fini='+L.st.flags.acte3_fini+' écran='+L.G.screens.current})()", "acte3_fini=1")
q.tick(1500)
J('écran de fin d’acte : suite disponible (Abysses, plus de « bientôt »)', "(document.querySelector('#screen .end-card')||{}).innerText||'pas d’écran'", "disponible")
J('récompenses q_phare_sable', "T.rewardCheck('q_phare_sable',{inv:{},unl:{},ecus:0})")
# ---------- annexes ----------
def side(giver, qid, pre, post):
    J('annexe %s : proposer' % qid, "(async()=>{__lumen.G.screens.close();await T.talkTo('%s',(n,l)=>{const t=l[l.length-1]||[];const i=t.findIndex(x=>/aide/.test(x));return i<0?t.length-1:i});return T.q('%s')})()" % (giver, qid), "active")
    J('annexe %s : objectif' % qid, pre)
    J('annexe %s : rendre' % qid, "(async()=>{const b=T.pre();__lumen.G.screens.close();await T.talkTo('%s');return T.q('%s')+' '+await T.rewardCheck('%s',b)})()" % (giver, qid, qid), "done")
side('djamila','s_roses',"(async()=>{const L=__lumen;let r=[];for(const p of ['fleur1','fleur2','fleur3','fleur4'])r.push(await T.pickupAt(p));return r.join(',')+' fleurs='+(L.st.inv.fleur_sable||0)})()",None)
side('leila','s_jarres',"(async()=>{const L=__lumen;let r=[];for(const p of ['jarre1','jarre2','jarre3'])r.push(await T.pickupAt(p));return r.join(',')+' jarres='+(L.st.inv.jarre_ancienne||0)})()",None)
side('samir','s_scorpions',"(async()=>{const L=__lumen;L.tpZone('oasis',[15,5]);await T.tick(1200);const k=await T.cutAndKill(null,40000);L.tpZone('dunes',[22,10]);await T.tick(1000);await T.cutAndKill(null,40000);return T.q('s_scorpions')})()",None)
side('tarek','s_chameau',"T.pickupAt('collier1')",None)
side('idris','s_tablettes',"(async()=>{const L=__lumen;return await T.pickupAt('tablette1')+' tablettes='+(L.st.inv.tablette_echo||0)})()",None)
J('annexe s_lampions_d : proposer', "(async()=>{__lumen.G.screens.close();L=__lumen;L.tpZone('auberge_d');await T.tick(400);await T.talkTo('nour',(n,l)=>{const t=l[l.length-1]||[];const i=t.findIndex(x=>/aide/.test(x));return i<0?t.length-1:i});return T.q('s_lampions_d')})()", "active")
J('annexe s_lampions_d : lampions', "(async()=>{const L=__lumen;L.tpZone('cite',[12,7]);await T.tick(800);await T.lightLamps();return 'lampions='+L.G.counts('lampions')})()", "lampions=7")
J('annexe s_lampions_d : rendre', "(async()=>{const b=T.pre();const L=__lumen;L.G.screens.close();L.tpZone('auberge_d');await T.tick(400);await T.talkTo('nour');return T.q('s_lampions_d')+' '+await T.rewardCheck('s_lampions_d',b)})()", "done")
J('annexe s_colis_d : proposer', "(async()=>{const L=__lumen;L.G.screens.close();L.tpZone('cite',[12,7]);await T.tick(500);await T.talkTo('kassim',(n,l)=>{const t=l[l.length-1]||[];const i=t.findIndex(x=>/aide/.test(x));return i<0?t.length-1:i});return T.q('s_colis_d')+' colis='+__lumen.st.inv.colis_kassim})()", "active")
J('annexe s_colis_d : chaîne', "(async()=>{const b=T.pre();for(const n of ['leila','samir','kassim']){__lumen.G.screens.close();await T.talkTo(n);}return T.q('s_colis_d')+' '+await T.rewardCheck('s_colis_d',b)})()", "done")
J('complétion et catalogue', "JSON.stringify({done:Object.keys(__lumen.st.quests).filter(k=>__lumen.st.quests[k].state==='done').length,comp:__lumen.completion()})")
J('save/load', "T.roundtrip('s1')", "identique")
# ---------- voyage retour et allers-retours ----------
J('Yaël → Forêt', "(async()=>{window.__old=1;__lumen.G.screens.close();return await T.talkTo('yael',(n,l)=>{const t=l[l.length-1]||[];const i=t.findIndex(x=>/Vitrebourg/.test(x));return i<0?0:i})})()")
q.reloaded(); q.pg.evaluate(H2)
J('retour Forêt', "T.info()", '"isl":"foret"')
J('Tessel → Désert', "(async()=>{window.__old=1;__lumen.G.screens.close();return await T.talkTo('tessel',(n,l)=>{const t=l[l.length-1]||[];const i=t.findIndex(x=>/Désert/.test(x));return i<0?0:i})})()")
q.reloaded(); q.pg.evaluate(H2)
J('Désert retrouvé (monde conservé)', "T.info()+' fin='+__lumen.st.flags.acte3_fini+' ds4='+__lumen.G.isGateOpen('ds4')+' end='+__lumen.G.isGateOpen('end')", "ds4=true end=true")
q.done()
