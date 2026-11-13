"""Acte IV — voyage réel Forêt de Verre -> Abysses Miroirs (Tessel), retour par Lagon, ancienne sauvegarde."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q = QA("abysses-voyage", query="?low&nobloom")
q.load("&ile=foret")
J = q.js
J("état Forêt terminée (Acte II fini)", """(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='foret';s.player.zone='vitrebourg';s.world=m.newWorld('vitrebourg');s.flags.acte2_fini=1;
 for(const [id,st] of [['q_reveil',3],['q_verre',6],['q_phare_verre',9]]) s.quests[id]={state:'done',step:st,base:{}};
 s.inv.epee_courte=1;s.equip.weapon='epee_courte';s.player.lvl=8;s.player.ecus=300;s.player.abilities={porter:true};
 await __lumen.G.startFrom(s,'auto',false,true);await T.tick(800);T.pump();await __lumen.saveTo('auto');return __lumen.st.player.island})()""", "foret")
q.ev("window.__old=1")
J("voyage : choix de la route", "(async()=>{const r=await T.talkTo('tessel',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Abysses')));return r.slice(0,60)})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement", e)
J("arrivée aux Abysses", "T.info()+' '+__lumen.st.player.island", "abysses")
J("quête principale démarrée", "T.q('q_abysses')", "active")
J("Marée présente", "String(!!T.npc('maree'))", "true")
J("sauvegarde et rechargement", "T.roundtrip('s2')", "identique")
J("retour par Lagon vers la Forêt", "(async()=>{window.__old=1;const r=await T.talkTo('lagon',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Vitrebourg')));return r.slice(0,60)})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement retour", e)
J("retour en Forêt", "__lumen.st.player.island+' '+T.q('q_abysses')", "foret")
J("second aller (idempotent, pas de double récompense)", "(async()=>{const e=__lumen.st.player.ecus;window.__old=1;await T.talkTo('tessel',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Abysses')));return String(e)})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement 2", e)
J("de nouveau aux Abysses", "__lumen.st.player.island+' '+T.q('q_abysses')", "abysses")
q.done()
