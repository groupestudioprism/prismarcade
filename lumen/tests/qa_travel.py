"""Voyages aller-retour répétés, chargement inter-îles, sauvegarde pendant le voyage."""
import sys, shutil, json; sys.path.insert(0,'/home/claude/prismarcade/lumen/tests')
from qa_lib import *
shutil.rmtree('/tmp/qa_prof_travel', ignore_errors=True); shutil.copytree('/tmp/qa_prof_foret2','/tmp/qa_prof_travel')
q=QA('voyages', profile='/tmp/qa_prof_travel'); q.load()
J=q.js
J('charger s3 (Forêt)',"(async()=>{const sv=await __lumen.G.saves.read('s3');await __lumen.G.startFrom(sv,'s3');await T.tick(800);T.pump();return T.info()})()","foret")
def keyinfo():
    return q.ev("""(()=>{const s=__lumen.st;return JSON.stringify({isl:s.player.island,ecus:s.player.ecus,xp:s.player.xp,lvl:s.player.lvl,fr:s.player.fragments,qd:Object.values(s.quests).filter(r=>r.state==='done').length,qa:Object.values(s.quests).filter(r=>r.state==='active').length,gates:Object.keys(s.world.gates).length,picked:Object.keys(s.world.picked).length,chests:Object.keys(s.world.chests).length,other:Object.fromEntries(Object.entries(s.otherWorlds||{}).map(([k,w])=>[k,[Object.keys(w.gates).length,Object.keys(w.picked).length,Object.keys(w.chests).length]])),flags:Object.keys(s.flags).length,inv:Object.keys(s.inv).length})})()""")
first = keyinfo(); print('départ', first)
refs = {}
for i in range(3):
    # Forêt -> Aube (Tessel)
    k0 = keyinfo()
    q.ev("window.__old=1")
    q.js(f'tour {i+1}: Tessel → Aube',"T.talkTo('tessel',()=>0)")
    try:
        q.reloaded(); ok=True
    except Exception as e:
        ok=False; print('FAIL rechargement Aube', e)
    k1 = keyinfo()
    q.results.append((f'arrivée Aube {i+1}', 'OK' if json.loads(k1)['isl']=='aube' else 'FAIL', k1)); print('arrivée Aube', k1)
    q.js(f'tour {i+1}: zone/mode Aube',"T.info()+' q_verre='+T.q('q_verre')+' calixte='+JSON.stringify(!!T.npc('calixte'))","havre")
    # compteur stable : pas de récompense en double
    a0=json.loads(k0); a1=json.loads(k1)
    for f in ['ecus','xp','lvl','fr','qd','qa']:
        if a0[f]!=a1[f]: print('FAIL variation', f, a0[f], a1[f]); q.results.append((f'variation {f}','FAIL',[a0[f],a1[f]]))
    q.ev("window.__old=1")
    q.js(f'tour {i+1}: Calixte → Forêt',"T.talkTo('calixte',()=>0)")
    q.reloaded()
    k2 = keyinfo()
    b=json.loads(k2)
    print('retour Forêt', k2)
    for f in ['ecus','xp','lvl','fr','qd','qa','gates','picked','chests','flags','inv']:
        if a0[f]!=b[f]: print('FAIL variation aller-retour', f, a0[f], b[f]); q.results.append((f'aller-retour {f}','FAIL',[a0[f],b[f]]))
    q.js(f'tour {i+1}: zone Forêt',"T.info()+' '+T.q('q_verre')+' '+T.q('q_phare_verre')","foret")
# chargement inter-îles : charger un slot Aube depuis une page Forêt
q.js('slot Aube depuis Forêt',"(async()=>{const L=__lumen;window.__old=1;const s=JSON.parse(JSON.stringify(L.st));s.player.island='aube';s.player.zone='havre';s.player.x=null;await L.saveTo('s1');const raw=JSON.parse(localStorage.getItem('lumen.save.local.s1'));raw.data.player.island='aube';raw.data.player.zone='havre';raw.data.player.x=null;raw.data.player.z=null;localStorage.setItem('lumen.save.local.s2',JSON.stringify(raw));const sv=await L.G.saves.read('s2');L.G.startFrom(sv,'s2');return 'lancé'})()")
q.reloaded()
q.js('arrivée Aube par chargement',"T.info()+' '+T.q('q_verre')","aube")
q.done()
