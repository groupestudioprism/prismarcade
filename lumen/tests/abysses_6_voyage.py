"""Acte IV — voyage réel Désert des Échos -> Abysses Miroirs (Yaël, après l'Acte III), retours par Lagon (Désert, Forêt, Aube), Tessel sans route des Abysses, ancienne sauvegarde."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q = QA("abysses-voyage", query="?low&nobloom")
q.load("&ile=desert")
J = q.js
J("état Désert terminé (Acte III fini)", """(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='desert';s.player.zone='cite';s.world=m.newWorld('cite');s.flags.acte2_fini=1;s.flags.acte3_fini=1;s.flags.dore_fini=1;
 for(const [id,st] of [['q_reveil',3],['q_verre',6],['q_phare_verre',9],['q_echos',9],['q_temple',9],['q_phare_sable',9]]) s.quests[id]={state:'done',step:st,base:{}};
 s.inv.epee_courte=1;s.equip.weapon='epee_courte';s.player.lvl=8;s.player.ecus=300;s.player.abilities={porter:true,orbe:true};
 await __lumen.G.startFrom(s,'auto',false,true);await T.tick(800);T.pump();await __lumen.saveTo('auto');return __lumen.st.player.island})()""", "desert")
q.ev("window.__old=1")
J("Yaël propose les Abysses (acte3_fini)", "(async()=>{const r=await T.talkTo('yael',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Abysses')));return r.slice(0,80)})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement", e)
J("arrivée aux Abysses", "T.info()+' '+__lumen.st.player.island", "abysses")
J("quête principale démarrée", "T.q('q_abysses')", "active")
J("Marée présente", "String(!!T.npc('maree'))", "true")
J("capacités conservées (orbe + porter)", "JSON.stringify(__lumen.st.player.abilities)", lambda r: 'orbe' in r and 'porter' in r)
J("sauvegarde et rechargement", "T.roundtrip('s2')", "identique")
J("retour par Lagon vers le Désert", "(async()=>{window.__old=1;const r=await T.talkTo('lagon',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Désert')));return r.slice(0,60)})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement retour", e)
J("retour au Désert", "__lumen.st.player.island+' '+T.q('q_abysses')", "desert")
J("second aller (idempotent)", "(async()=>{window.__old=1;await T.talkTo('yael',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Abysses')));return 'ok'})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement 2", e)
J("de nouveau aux Abysses", "__lumen.st.player.island+' '+T.q('q_abysses')", "abysses")
J("retour par Lagon vers Vitrebourg", "(async()=>{window.__old=1;await T.talkTo('lagon',(n,l)=>l[l.length-1].findIndex(t=>t.includes('Vitrebourg')));return 'ok'})()")
try:
    q.reloaded()
except Exception as e:
    print("FAIL rechargement Forêt", e)
J("retour en Forêt", "__lumen.st.player.island", "foret")
J("Tessel ne propose plus les Abysses", "(async()=>{__lumen.tpZone('vitrebourg');await T.tick(300);const r=await T.talkTo('tessel',(n,l)=>{window.__tl=l[l.length-1].map(t=>t.t||t);return -1});return JSON.stringify(window.__tl||r)})()", lambda r: 'Abysses' not in r and 'Désert' in r)
q.done()
