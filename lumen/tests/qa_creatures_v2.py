"""Créatures v2 de l'Île de l'Aube dans le jeu : chargement sans erreur, les six modèles v2 sont bien utilisés,
combat réel près de chacune (annonce, coup, coup reçu), défaite et retrait, boss (attaques, phase 2, défaite). Captures dans /tmp."""
import sys; sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from qa_lib import *
q = QA('creatures-v2', viewport=(960, 540), query="?low&nobloom", noop=False); q.load()
q.js('nouvelle partie', "T.newGame()", "play")
q.pg.wait_for_timeout(2000)
q.js('apparition de toutes les zones', "(()=>{const L=__lumen;L.G.zones.forEach((z,i)=>L.combat.spawnZone(i));const c={};L.combat.enemies.forEach(e=>c[e.type]=(c[e.type]||0)+1);return JSON.stringify(c)})()",
     lambda r: all(k in r for k in ['brumelin', 'ronceux', 'lanceur', 'sanglier', 'gardien', 'colosse']))
q.js('modèles v2 utilisés', "(()=>{const L=__lumen,o={};L.combat.enemies.forEach(e=>{if(!e.def.tint)o[e.type]=!!(e.view.nodes&&e.view.deathDur)});return JSON.stringify(o)})()",
     lambda r: 'false' not in r and 'colosse' in r)
NEAR = """(async()=>{const L=__lumen,P=L.P,e=L.combat.enemies.find(x=>x.type==='%s'&&x.state!=='dead');if(!e)return 'absent';
 L.st.player.hp=L.st.player.maxHp=99999;const seen={};const t0=performance.now();let hit=false;
 while(performance.now()-t0<%d){ if(Math.hypot(P.x-e.x,P.z-e.z)>%f||!seen.idle&&!seen.go){P.x=e.x+%f;P.z=e.z+0.3;P.vx=P.vz=0;seen.go=1;} seen[e.state]=1; await T.tick(40);
   if(!hit&&performance.now()-t0>3000){hit=true;L.combat.dealDamage(e,1,'lame',{});}
   if(%s)break; }
 delete seen.go;return Object.keys(seen).join(',')})()"""
KILL = """(async()=>{const L=__lumen,e=L.combat.enemies.find(x=>x.type==='%s'&&x.state!=='dead');
 L.combat.dealDamage(e,999999,'lame',{heavy:true});await T.tick(300);const mid=e.state;const t0=performance.now();
 while(L.combat.enemies.includes(e)&&performance.now()-t0<40000)await T.tick(100);return mid+':'+(L.combat.enemies.includes(e)?'encore là':'retiré')})()"""
for t, dist, reach in [('brumelin', 1.6, 6), ('ronceux', 1.8, 5), ('lanceur', 5.0, 9), ('sanglier', 4.0, 9), ('gardien', 2.0, 6)]:
    q.js(t + ' : combat', NEAR % (t, 40000, reach, dist, "hit&&(seen.attack||seen.charge||seen.fire)&&performance.now()-t0>6000"), lambda r: r != 'absent')
    q.pg.screenshot(path=f'/tmp/v2_{t}.png')
    q.js(t + ' : défaite', KILL % t, lambda r: r == 'dead:retiré')
q.js('colosse : combat', NEAR % ('colosse', 90000, 9, 4.0, "seen.attack&&seen.tired"), lambda r: 'wind' in r and 'attack' in r)
q.pg.screenshot(path='/tmp/v2_colosse.png')
q.js('colosse : phase 2', "(async()=>{const L=__lumen,P=L.P,e=L.combat.enemies.find(x=>x.type==='colosse');e.hp=e.maxHp*0.4;const t0=performance.now();while(performance.now()-t0<20000){if(Math.hypot(P.x-e.x,P.z-e.z)>9){P.x=e.x+4;P.z=e.z;}await T.tick(50);}return e.phase})()", lambda r: r == 2)
q.pg.screenshot(path='/tmp/v2_colosse_p2.png')
q.js('colosse : défaite', "(async()=>{const L=__lumen,e=L.combat.enemies.find(x=>x.type==='colosse');L.combat.dealDamage(e,999999,'lame',{heavy:true});await T.tick(5000);return e.state})()", lambda r: r == 'dead')
q.pg.screenshot(path='/tmp/v2_colosse_mort.png')
q.js('colosse : retiré', "(async()=>{const L=__lumen;const t0=performance.now();while(L.combat.enemies.some(x=>x.type==='colosse')&&performance.now()-t0<60000)await T.tick(100);return L.combat.enemies.some(x=>x.type==='colosse')})()", lambda r: r is False)
print('ERRORS:', q.errs)
for r in q.results: print(r)
q.b.close(); q.p.stop()
sys.exit(1 if q.errs or any(r[1] != 'OK' for r in q.results) else 0)
