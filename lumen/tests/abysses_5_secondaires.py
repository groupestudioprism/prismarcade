"""Acte IV — les 7 quêtes secondaires : démarrage par dialogue, objets ramassés/ennemis/lampions réels, remise, récompenses."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q = QA("abysses-secondaires", query="?low&nobloom")
q.load()
J = q.js
PICK = "(n,l)=>{const i=l[l.length-1].findIndex(t=>t.includes('besoin'));return i<0?n-1:i}"
J("arrivée à la Grève", "T.arrive()", "play")
J("prérequis : lac et grottes (état de jeu)", "(()=>{const L=__lumen;['q_abysses','q_grottes'].forEach(id=>{L.st.quests[id]={state:'done',step:0,base:{}}});L.st.flags.boss_marees=1;L.quests.check();return T.q('q_abysses')+' '+T.q('q_grottes')})()", "done")

def side(qid, giver, pickups=None, extra=None):
    J(qid + " : démarrage", "(async()=>{const r=await T.talkTo('%s',%s);return T.q('%s')})()" % (giver, PICK, qid), "active")
    if pickups:
        J(qid + " : objets réels", "(async()=>{const o=[];for(const id of %s)o.push(await T.pickupAt(id));return o.join()+' '+T.q('%s')})()" % (pickups, qid), "retour")
    if extra:
        J(qid + " : action", extra, "retour")
    J(qid + " : remise", "(async()=>{const b=T.pre();await T.talkTo('%s');return T.q('%s')+' '+await T.rewardCheck('%s',b)})()" % (giver, qid, qid), "récompenses ok")

side("s_corail", "corail", ["corail1", "corail2", "corail3"])
side("s_coquilles", "nacre", ["coq1", "coq2", "coq3", "coq4"])
side("s_filets", "ecume", ["filet1", "filet2", "filet3"])
side("s_perle", "murene", ["perle_m"])
side("s_crabes", "petoncle", None,
     "(async()=>{const L=__lumen;L.tpZone('recifs');await T.tick(900);for(let r=0;r<5&&(L.st.stats.kills-(L.st.quests.s_crabes.base.kills||0))<8;r++){await T.cutAndKill(null,40000);await T.tick(300);}return T.q('s_crabes')})()")
side("s_lampions_a", "sargasse", None,
     "(async()=>{const L=__lumen;L.tpZone('auberge_a');await T.tick(600);let r=await T.lightLamps();L.tpZone('greve');await T.tick(600);r+=await T.lightLamps();return r+' '+T.q('s_lampions_a')})()")
J("s_etoiles : prérequis (phare)", "(()=>{const L=__lumen;L.st.quests.q_phare_abysses={state:'done',step:0,base:{}};L.st.flags.acte4_fini=1;L.st.player.abilities.planer=true;L.quests.check();return T.q('q_phare_abysses')})()", "done")
side("s_etoiles", "lagon", ["etoile1", "etoile2", "etoile3"])
J("bilan", "JSON.stringify(['s_corail','s_coquilles','s_filets','s_perle','s_crabes','s_lampions_a','s_etoiles'].map(i=>T.q(i)))", lambda r: r.count("done") == 7)
J("sauvegarde / rechargement", "T.roundtrip('s5')", "identique")
q.done()
