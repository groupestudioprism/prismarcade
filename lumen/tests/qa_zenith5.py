"""Acte VI — liaison Forêt → Zénith (provisoire, via Ambre) : voyage réel, arrivée, quête principale lancée, sauvegarde conservée."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-5', query='?ile=foret&low&nobloom'); q.load()
J=q.js
J('état Forêt terminée',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='foret';s.player.zone='vitrebourg';s.player.respawn={zone:'vitrebourg',cell:[12,7]};s.world=m.newWorld('vitrebourg');s.player.abilities={porter:true,grappin:true};s.player.lvl=12;
  for(const k of ['q_reveil','q_lentille','q_verre','q_phare_verre'])s.quests[k]={state:'done',step:9,base:{}};s.flags.acte2_fini=1;s.inv.grappin=1;
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(2000);T.pump();return T.info()})()""","foret")
try:   # le voyage recharge la page : l'évaluation est interrompue, c'est le comportement attendu
    q.ev("(async()=>{const r=await T.talkTo('ambre',(n,l)=>0);await T.tick(1500);return r})()")
except Exception as e:
    print('OK   Ambre propose le voyage (page rechargée)', str(e)[:60])
q.pg.wait_for_timeout(1000)
try:
    q.reloaded(timeout=120000)
except Exception as e:
    print('ERR reloaded', str(e)[:200])
J('arrivée au Zénith',"(async()=>{await T.tick(1500);T.pump();return T.info()+' '+T.q('q_porte')+' portails='+__lumen.st.player.abilities.portails})()","zenith")
J('niveau et inventaire conservés',"JSON.stringify({lvl:__lumen.st.player.lvl,grappin:__lumen.st.inv.grappin,abil:__lumen.st.player.abilities})","\"lvl\":12")
q.done()
