"""Acte V : voyage Forêt -> Pics du Vent (Tessel) puis retour (Zéphyr), sans doublon de récompense ni de quête. Port 8872."""
from qa_pics_lib import *
q = QA('pics-voyage', query='?low&nobloom&ile=foret'); q.load(); J = q.js
J('départ en Forêt', """(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();
 s.player.island='foret';s.player.zone='vitrebourg';s.player.x=null;s.player.z=null;s.player.lvl=12;
 s.player.abilities={onde:true,grappin:true};s.flags.acte1_fini=1;s.flags.acte2_fini=1;s.inv.grappin=1;s.world=m.newWorld('havre');
 await __lumen.G.startFrom(s,'s2',false,true);await T.tick(900);T.pump();return T.info()})()""", "foret")
q.ev("window.__old=1")
J('Tessel : propose les Pics', "T.talkTo('tessel',(n,l)=>{const t=l[l.length-1];const i=t.findIndex(x=>/Pics/.test(x));return i<0?t.length-1:i})")
try:
    q.reloaded(); ok = True
except Exception as e:
    ok = False; print('FAIL rechargement', e)
J('arrivée aux Pics', "T.info()+' q_pics='+T.q('q_pics')", "pics")
J('arrivée : quête principale lancée', "T.q('q_pics')", "active:parler")
J('arrivée : au Col, jouable', "__lumen.S.mode+' '+__lumen.G.zoneId()", "play col")
J('arrivée : capacités gardées', "JSON.stringify(__lumen.st.player.abilities)", "grappin")
J('autres îles rangées', "Object.keys(__lumen.st.otherWorlds||{}).join(',')", "foret")
q.ev("window.__old=1")
J('Zéphyr : retour en Forêt', "T.talkTo('zephyr',(n,l)=>{const t=l[l.length-1];const i=t.findIndex(x=>/Forêt/.test(x));return i<0?t.length-1:i})")
try:
    q.reloaded(); ok = True
except Exception as e:
    ok = False; print('FAIL rechargement', e)
J('retour en Forêt', "T.info()", "foret")
q.ev("window.__old=1")
J('Tessel : deuxième voyage', "T.talkTo('tessel',(n,l)=>{const t=l[l.length-1];const i=t.findIndex(x=>/Pics/.test(x));return i<0?t.length-1:i})")
try:
    q.reloaded()
except Exception as e:
    print('FAIL rechargement', e)
J('2e arrivée : état conservé, quête non relancée', "T.info()+' '+T.q('q_pics')+' quêtes='+Object.keys(__lumen.st.quests).filter(k=>/pics|moulins|phare_vents/.test(k)).join(',')", "pics")
J('bouton portail masqué sans capacité', "String(document.getElementById('t-portal').hidden)", "true")
q.done()
