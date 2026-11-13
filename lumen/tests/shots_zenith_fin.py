"""Acte VI — captures de la séquence de fin (rendu réel logiciel). Sortie : /tmp/zshots/fin_*.png"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
os.makedirs('/tmp/zshots', exist_ok=True)
q=QA('shots-fin', query='?ile=zenith&low&nobloom', noop=False); q.load()
J=q.js
J('arrivée',"""(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='zenith';s.player.zone='phare_z';s.player.respawn={zone:'phare_z',cell:[1,2]};s.world=m.newWorld('phare_z');s.player.abilities={porter:true,portails:true};s.player.lvl=14;s.flags={boss_zenith:1};
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(2500);T.pump();return T.info()})()""")
J('prisme: contempler (cible)',"(async()=>{const L=__lumen;L.tpZone('phare_z');await T.tick(500);return 'ok'})()")
J('avant fin',"(async()=>{const L=__lumen;for(const g of ['ph_d1','ph_d2'])T.solve(g);await T.tick(500);return 'ok'})()")
q.pg.screenshot(path='/tmp/zshots/fin_00_avant.png')
J('finale',"(async()=>{T.solve('end');await T.tick(500);return __lumen.S.mode})()","ending")
for name,to in (('01',8),('02',16),('03',24),('04',32),('05',40),('06',48)):
    q.ev("(()=>{const f=__lumen.fin;while(f.time<%d&&f.phase==='scene')f.update(0.25);})()"%to); q.tick(3500); q.pg.screenshot(path='/tmp/zshots/fin_%s.png'%name); print('shot',name,q.ev("JSON.stringify([__lumen.fin.time.toFixed(1),__lumen.fin.phase,document.querySelector('#fin .cap')&&document.querySelector('#fin .cap').textContent])"),flush=True)
q.ev("document.querySelector('#fin .skip').click()"); q.tick(3500); q.pg.screenshot(path='/tmp/zshots/fin_07_bilan.png')
q.ev("document.querySelector('#fin [data-a=credits]').click()"); q.tick(6000); q.pg.screenshot(path='/tmp/zshots/fin_08_credits.png')
q.done()
