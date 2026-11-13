"""Acte VI — arrivée, village, Célestine, salles à portails (logique réelle, rendu neutralisé)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-1', query='?ile=zenith&low&nobloom'); q.load()
J=q.js
J('arrivée (état voyageur)',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='porte';s.player.respawn={zone:'porte',cell:[12,7]};s.world=m.newWorld('porte');s.player.abilities={porter:true};
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(1500);T.pump();await T.tick(300);return T.info()})()""","play")
J('île/zone',"__lumen.st.player.island+' '+T.zone()+' '+T.q('q_porte')","zenith")
J('PNJ présents',"JSON.stringify(__lumen.npcs.map(n=>n.id))")
J('Célestine',"(async()=>await T.talkTo('celestine'))()")
J('état quête',"T.q('q_porte')+' portails='+__lumen.st.abilities.portails+' b='+__lumen.G.isGateOpen('b_portails')")
J('erreurs',"'ok'")
q.done()
