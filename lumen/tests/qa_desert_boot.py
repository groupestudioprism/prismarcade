"""Désert des Échos — amorçage : voyage réel Forêt → Désert, arrivée, ressources chargées. flock /tmp/lumen-chrome.lock timeout 900 python3 -u qa_desert_boot.py"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
import shutil; shutil.rmtree('/tmp/qa_prof_desert', ignore_errors=True)
q = QA('desert-boot', profile='/tmp/qa_prof_desert'); q.load()
J = q.js
J('nouvelle partie Aube', "T.newGame()", "play")
J('prépa fin acte II', """(()=>{const L=__lumen,s=L.st;Object.assign(s.flags,{acte1_fini:1,acte2_fini:1,boss_colosse:1,boss_verre:1,verre_fini:1,lens_set:1});
  ['q_reveil','q_lentille','q_phare'].forEach(k=>s.quests[k]={state:'done',step:9,base:{}});['q_verre','q_phare_verre'].forEach(k=>s.quests[k]={state:'done',step:9,base:{}});
  L.give('epee_aube',1);L.G.equip('epee_aube',true);L.give('marteau',1);L.give('grappin',1);s.player.lvl=8;s.player.ecus=600;window.__old=1;return 'ok'})()""")
J('Calixte → Désert (choix)', "T.talkTo('calixte',(n,last)=>{ const t=last[last.length-1]; const i=t.findIndex(x=>/Désert/.test(x)); return i<0?0:i; })")
q.reloaded()
J('arrivée Désert', "T.info()+' '+T.q('q_echos')+' porter='+__lumen.st.player.abilities.porter", "active:parler")
J('zones', "__lumen.G.zones.map(z=>z.id).join(',')")
J('thème et musique', "JSON.stringify({th:__lumen.world&&1, zone:__lumen.G.zoneId()})")
q.tick(1500)
J('tempête forcée', "(()=>{const A=__lumen.G.a3;A.setStorm('storm');const r=__lumen.isl.range;A.setStorm('calm');return r+'/'+__lumen.isl.range})()", "5/null")
q.done()
