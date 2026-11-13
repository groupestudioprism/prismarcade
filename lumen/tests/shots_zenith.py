"""Acte VI — captures d'écran (rendu réel logiciel, 640×360) pour contrôle visuel. Sortie : /tmp/zshots/*.png"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
os.makedirs('/tmp/zshots', exist_ok=True)
q=QA('shots-zenith', query='?ile=zenith&low&nobloom', noop=False); q.load()
J=q.js
J('arrivée',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='porte';s.player.respawn={zone:'porte',cell:[12,7]};s.world=m.newWorld('porte');s.player.abilities={porter:true,portails:true};s.player.lvl=14;
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(2500);T.pump();return T.info()})()""")
def shot(name, js, wait=2500):
    q.ev(js); q.tick(wait); q.pg.screenshot(path='/tmp/zshots/%s.png'%name); print('shot',name, flush=True)
shot('01_porte', "T.tick(10)")
shot('02_porte_nord', "(()=>{const L=__lumen;L.P.x=30;L.P.z=30;L.S.yaw=0.8})()")
shot('03_jz1', "(async()=>{__lumen.tpZone('jz1');})()", 3500)
shot('04_jz2', "(async()=>{__lumen.tpZone('jz2');})()", 3500)
shot('05_jardins', "(async()=>{__lumen.tpZone('jardins');})()", 3500)
shot('06_salle', "(async()=>{__lumen.tpZone('salle');})()", 3500)
shot('07_arene', "(async()=>{__lumen.tpZone('salle',[15,17]);})()", 4000)
shot('08_phare', "(async()=>{__lumen.tpZone('phare_z');})()", 4000)
q.done()
