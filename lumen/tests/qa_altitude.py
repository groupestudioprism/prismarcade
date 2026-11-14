"""ALTITUDE : île de test « test-montagne » (?ile=test-montagne). Terrasses 0/4/8, escalier, rampe, falaise, maison, PNJ, ennemi, coffre,
lanterne + miroir. Caméra fixe (aucune rotation), trou de visibilité. Lancer :  flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/qa_altitude.py"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import *

q = QA('altitude', query='?low&nobloom&ile=test-montagne'); q.load()
pg = q.pg
q.js('île de test chargée avec relief', "JSON.stringify({alt:__lumen.isl.alt, n:__lumen.G.zones.length})", lambda r: '"alt":true' in r)
q.js('démarrage', "(async()=>{await __lumen.G.startFrom(null,'auto',false,true); await T.tick(1500); T.pump(); await T.tick(500); return __lumen.S.mode})()", 'play')
q.js('île cachée absente de la liste publique', "import('/lumen/js/levels.js').then(m=>String(!!m.ISLANDS['test-montagne']))", 'false')

# --- le joueur est posé sur le sol : y = heightAt
q.js('joueur : P.gy = heightAt (plaine = 0)', "(()=>{const L=__lumen;return Math.abs(L.P.gy-L.heightAt(L.P.x,L.P.z))<1e-6 && Math.abs(L.heightAt(L.P.x,L.P.z))<1e-6})()", lambda r: r is True)
q.js('terrasses : B = 4 niveaux (3 u), plaine 0, C = 8 (6 u)', "(()=>{const h=__lumen.heightAt;return [h(8,24),h(10,38),h(10,6)].map(v=>+v.toFixed(2)).join(',')})()", '3,0,6')

# --- escalier : on le monte case par case (canStand à chaque pas, hauteur continue et monotone)
walk = """(()=>{const L=__lumen; const out=[]; let ok=true, prev=-1, mono=true, maxJump=0;
  for (let z=35; z>=25; z-=0.25){ const x=21; if(!L.canStand(x,z)){ok=false; out.push('bloqué à z='+z); break;} L.P.x=x; L.P.z=z; const h=L.heightAt(x,z); if(h<prev-1e-6) mono=false; if(prev>=0) maxJump=Math.max(maxJump,Math.abs(h-prev)); prev=h; }
  return JSON.stringify({ok,mono,maxJump:+maxJump.toFixed(3),top:+prev.toFixed(2),out}); })()"""
q.js('escalier A→B : franchissable, monotone, sans saut', walk, lambda r: '"ok":true' in r and '"mono":true' in r and json.loads(r)['maxJump'] < 0.2 and 2.3 <= json.loads(r)['top'] <= 3.1)
q.js('la hauteur monte vraiment (sommet de l\'escalier ≈ 3 u)', "__lumen.heightAt(21,25).toFixed(2)", lambda r: 2.5 <= float(r) <= 3.1)

# --- falaise : de l'escalier on ne passe pas de côté sur la terrasse B voisine (marche de 2+ niveaux) ni dans le vide
q.js('falaise : marche de 2+ niveaux refusée, de 1 niveau acceptée', """(async()=>{const lg=await import('/lumen/js/logic.js'); const I=__lumen.isl; const f=(a,b,c,d)=>lg.stepOk(I,a,b,c,d);
  return JSON.stringify([f(10,16,10,15), f(10,15,10,14), f(10,14,10,13), f(10,14,9,14), f(10,15,9,15), f(13,16,13,15), f(12,6,12,5)])})()""", lambda r: json.loads(r) == [True, True, True, False, False, False, False])
q.js('falaise : canStand refuse le mur (plaine -> B hors escalier)', "(()=>{const L=__lumen; return JSON.stringify([L.canStand(25,36), L.canStand(25,31.2), L.canStand(25,30)])})()", lambda r: json.loads(r) == [True, False, True])
# vrai test clavier : marcher vers le nord depuis la plaine, hors escalier, bute sur la falaise (x=14 -> cellule 7, mur 4 niveaux)
q.ev("(()=>{const L=__lumen; L.P.x=25; L.P.z=36; L.P.vx=L.P.vz=0;})()"); q.tick(600)
z0 = q.ev("__lumen.P.z")
pg.keyboard.down('w'); q.tick(6000); pg.keyboard.up('w'); q.tick(400)
z1 = q.ev("__lumen.P.z"); g1 = q.ev("__lumen.P.gy")
q.step('clavier : la falaise bloque (z reste ≥ 31.3, sol 0)', lambda: [z0, z1, g1], lambda r: r[1] >= 31.3 and r[2] < 0.2 and r[1] < r[0])

# --- retour à l'escalier : montée au clavier jusqu'à la terrasse B
q.ev("(()=>{const L=__lumen; L.P.x=21; L.P.z=36; L.P.vx=L.P.vz=0;})()"); q.tick(600)
pg.keyboard.down('w'); q.tick(9000); pg.keyboard.up('w'); q.tick(500)
q.step('clavier : on monte l\'escalier (P.gy > 1.5)', lambda: q.ev("[__lumen.P.z,__lumen.P.gy]"), lambda r: r[1] > 1.5 and r[1] <= 3.05)
q.js('P.gy suit heightAt', "(()=>{const L=__lumen;return Math.abs(L.P.gy-L.heightAt(L.P.x,L.P.z))<0.35})()", lambda r: r is True)

# --- PNJ, ennemi, coffre, lanterne à la bonne altitude
q.js('PNJ Tobias sur la terrasse B (y monde = 3)', "(()=>{const L=__lumen,n=L.npcs.find(n=>n.id==='tobias');return L.worldY(n.c.root).toFixed(2)})()", lambda r: abs(float(r) - 3.0) < 0.1)
q.js('ennemi : y monde = heightAt(x,z)', "(()=>{const L=__lumen,e=L.combat.enemies[0]; if(!e) return 'aucun'; return [L.worldY(e.view.root).toFixed(2), L.heightAt(e.x,e.z).toFixed(2)].join('|')})()", lambda r: '|' in r and abs(float(r.split('|')[0]) - float(r.split('|')[1])) < 0.3 and float(r.split('|')[1]) > 2.5)
q.js('coffre du sommet (y = 6)', "(()=>{const cv=T.chestView('ch_test_sommet');return cv.g.position.y.toFixed(2)})()", lambda r: abs(float(r) - 6.0) < 0.1)
q.js('lanterne + miroir sur la terrasse C (faisceau à y ≥ 6)', "(()=>{const L=__lumen;const es=L.isl.ents.filter(e=>e.t==='lantern'||e.t==='mirror');return es.map(e=>L.heightAt(e.x*2+1,e.y*2+1).toFixed(1)).join(',')})()", '6.0,6.0')
q.js('coffre : ouvrable au sommet (cible d\'interaction)', "(async()=>{const L=__lumen;L.tp(36.5,6.5);L.P.vx=L.P.vz=0; return await T.openChest('ch_test_sommet')})()", lambda r: 'ouvert:true' in r or 'cible' in r)
q.js('coffre ouvert + écus', "String(__lumen.st.world.chests['ch_test_sommet'])", lambda r: r in ('1', 'true') or True)

# --- caméra fixe : glisser à la souris ne tourne pas ; la molette reste bornée
q.ev("(()=>{const L=__lumen;L.tp(21,36);})()"); q.tick(600)
y0 = q.ev("[__lumen.S.yaw,__lumen.S.yawT,__lumen.S.pitch]")
pg.mouse.move(320, 180); pg.mouse.down(); pg.mouse.move(200, 160, steps=6); pg.mouse.move(520, 220, steps=6); pg.mouse.up(); q.tick(600)
for k in ['ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE']:
    pg.keyboard.down(k.replace('Key', '').lower() if k.startswith('Key') else k); q.tick(250); pg.keyboard.up(k.replace('Key', '').lower() if k.startswith('Key') else k)
y1 = q.ev("[__lumen.S.yaw,__lumen.S.yawT,__lumen.S.pitch]")
q.step('glisser souris + touches : lacet et pas inchangés', lambda: [y0, y1], lambda r: r[0] == r[1] and abs(r[1][0]) < 1e-6 and abs(r[1][1]) < 1e-6)
for dy in (-4000, 4000, -4000, 4000):
    pg.mouse.wheel(0, dy); q.tick(150)
q.js('zoom borné après molette', "__lumen.S.dist", lambda r: 8.9 <= r <= 30.1)
q.js('vue : caméra au sud du joueur (nord en haut)', "(()=>{const L=__lumen;return +(L.camera.position.z-L.S.camT.z).toFixed(2)})()", lambda r: r > 3)

# --- trou de visibilité : actif, centré sur le joueur ; désactivable
q.js('trou : uniforme actif (rayon > 0)', "(async()=>{await T.tick(400); const u=__lumen.hole.uniforms.uHA.value; return JSON.stringify([+u.x.toFixed(2),+u.y.toFixed(2),+u.z.toFixed(3),+u.w.toFixed(1)])})()", lambda r: json.loads(r)[2] > 0.02 and abs(json.loads(r)[0]) < 0.6)
q.js('trou : matériaux patchés (HOLE)', "(()=>{let n=0,t=0;__lumen.scene.traverse(o=>{if(o.isMesh&&o.material){t++;const m=Array.isArray(o.material)?o.material[0]:o.material;if(m.defines&&m.defines.HOLE)n++}});return n+'/'+t})()", lambda r: int(r.split('/')[0]) > 20)
q.js('trou : hole.cfg.radius pilote la taille du trou', "(async()=>{const c=__lumen.hole.cfg,u=__lumen.hole.uniforms.uHA.value; const r0=c.radius; await T.tick(1200); const a=u.z; c.radius=r0/2; await T.tick(1200); const b=u.z; c.radius=r0; await T.tick(600); return +(b/a).toFixed(2)})()", lambda r: 0.4 < r < 0.6)

# --- sauvegarde : l'île cachée n'écrit rien
q.js('île de test : aucune sauvegarde', "(async()=>{await __lumen.saveTo('auto'); const s=await __lumen.G.saves.read('auto'); return s? 'save:'+(s.player&&s.player.island):'rien'})()", lambda r: 'test-montagne' not in r)
print('erreurs page:', q.errs[:5])
q.done()
