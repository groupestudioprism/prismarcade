"""CAMÉRA FIXE — audit de visibilité et de commandes, île par île (Aube, Désert, Abysses, Pics, Zénith ; la Forêt est refaite à part).
Pour chaque île : (1) aucun objet clé (lanterne, miroir, receveur, vanne, socle, coffre, panneau, porte, éclat…) n'est TOTALEMENT masqué par du décor,
vu de la caméra fixe (rayons réels sur les maillages du monde) ; (2) le trou de visibilité rend Lyra visible sur toutes les cases accessibles (aucun
bloqueur « non troué ») ; (3) le lacet reste 0 après dialogue, changement de zone, boss, finale / fin et changement d'île ; la caméra reste au sud ;
(4) haut = nord pour la marche, l'esquive, l'orientation de Lyra (grappin, plané, portails). (5) plus aucun texte ne parle de tourner la caméra.
Lancer :  QA_PORT=8876 flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/qa_camera_fixe.py [aube desert ...]"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *

HOME = {'aube': 'havre', 'desert': 'cite', 'abysses': 'greve', 'pics': 'col', 'zenith': 'porte'}
BOSSZONE = {'aube': 'sanctuaire', 'desert': 'temple_d', 'abysses': 'grottes', 'pics': 'moulins', 'zenith': 'salle'}
ISLES = [a for a in sys.argv[1:] if a in HOME] or list(HOME)
ALLFAILS = []

# ---------- (5) textes : aucune mention de rotation de caméra dans le code ni la doc du jeu
ROOT_L = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BAD = re.compile(r"(tourn\w+|pivot\w+|orient\w+) (la |sa |ta )?(cam[ée]ra|vue)|rotation de la cam|glisser[^.\n]{0,40}(cam[ée]ra|vue)|(cam[ée]ra|vue)[^.\n]{0,40}glisser|clic droit[^.\n]{0,20}(tourn|cam)|[QA] ?/ ?E : ?(tourn|cam)", re.I)
hits = []
for base in (os.path.join(ROOT_L, 'js'), os.path.join(ROOT_L, 'index.html'), os.path.join(ROOT_L, 'css'), os.path.join(ROOT_L, 'README.md'), os.path.join(ROOT_L, '..', 'README.md'), os.path.join(ROOT_L, 'HANDOFF.md')):
    files = [base] if os.path.isfile(base) else [os.path.join(d, f) for d, _, fs in os.walk(base) for f in fs if f.endswith(('.js', '.css', '.html', '.md'))]
    for f in files:
        if os.sep + 'islands' + os.sep in f: continue
        for i, line in enumerate(open(f, encoding='utf-8', errors='ignore')):
            m = BAD.search(line)
            if m and 'plus' not in line.lower()[:0]: hits.append('%s:%d %s' % (os.path.relpath(f, ROOT_L), i + 1, line.strip()[:120]))
print('textes caméra :', 'aucun' if not hits else hits)
if hits: ALLFAILS.append(('textes caméra', hits))

FREE = r"""const L=__lumen; L.S.zone=-1; L.tpZone('%s'); const x0=L.P.x,z0=L.P.z; let best=null; for(let r=0;r<12&&!best;r+=0.5) for(let dx=-r;dx<=r&&!best;dx+=0.5) for(let dz=-r;dz<=r&&!best;dz+=0.5){ if(Math.max(Math.abs(dx),Math.abs(dz))<r) continue; let ok=true; for(let k=-3;k<=3&&ok;k+=0.5){ if(!L.canStand(x0+dx+k,z0+dz)||!L.canStand(x0+dx,z0+dz+k)) ok=false; } if(ok) best=[x0+dx,z0+dz]; } if(best){L.P.x=best[0];L.P.z=best[1];} L.P.vx=L.P.vz=0; L.P.dodgeCD=0;"""

OCC = r"""
(async()=>{
const THREE = await import('three'); const L=__lumen, G=L.G, isl=L.isl, zones=G.zones; const W=(c)=>c*2;
L.scene.updateMatrixWorld(true); const pitch=L.CAM_PITCH, dist=17;
const ray=new THREE.Raycaster(); const meshes=[]; L.world.root.traverse(o=>{ if(o.isMesh) meshes.push(o); });
const own=(o,set)=>{ let a=o; while(a){ if(set.has(a)) return true; a=a.parent;} return false; };
function occ(x,y,z,selfSet){ ray.set(new THREE.Vector3(x,y,z), new THREE.Vector3(0,Math.sin(pitch),Math.cos(pitch))); ray.near=0.05; ray.far=dist;
  for(const h of ray.intersectObjects(meshes,false)){ const o=h.object; const ms=Array.isArray(o.material)?o.material:[o.material]; const m=ms[0];
    if(m.depthWrite===false||(m.transparent&&m.opacity<0.9)||m.blending===THREE.AdditiveBlending) continue;
    if(selfSet && own(o,selfSet)) continue;
    if(!ms.some(mm=>mm.userData.holePatched) && h.distance<0.9) continue;
    return {d:+h.distance.toFixed(2), cell:[Math.round(h.point.x/2),Math.round(h.point.z/2)], geo:o.geometry.type}; }
  return null; }
const res=[]; const HT={lantern:[0.6,1.3],mirror:[0.6,1.3],receiver:[0.6,1.5],prism:[0.6,1.4],relay:[0.6,1.2],splitter:[0.6,1.2],valve:[0.5,1.0],post:[0.8,2.2],socle:[0.3,0.9],vent:[0.6,1.2],ledge:[0.3,0.9],portal:[0.6,1.4],vitrail:[0.6,1.6],pool:[0.2,0.5],shard:[0.4,1.0],page:[0.4,0.9]};
let n=0;
function add(zi,kind,id,x,z,hts,selfSet){ n++; const gy=L.heightAt(x,z); const r=hts.map(ht=>occ(x,gy+ht,z,selfSet)); if(r.every(Boolean)) res.push({zone:zones[zi].id,kind,id,b:r[0]}); }
isl.ents.forEach(e=>{ if(!HT[e.t]) return; const v=L.world.views[e.id]; add(e.zone,e.t,e.id,W(e.x),W(e.y),HT[e.t],v?new Set([v.g||v.group].filter(Boolean)):null); });
Object.values(L.world.chestViews).forEach(cv=>add(cv.zi,'chest',cv.c.id,W(cv.x),W(cv.y),[0.4,0.9],new Set([cv.g])));
L.world.props.forEach(pr=>{ const p=pr.p; if(p.t==='house'&&p.door){ const z=pr.z; add(pr.zi,'door',p.id||p.name,W(z.ox+p.door[0]),W(z.oy+p.door[1]),[0.8,1.6],new Set([pr.g])); } if(p.t==='sign') add(pr.zi,'sign',p.id||'sign',pr.g.position.x,pr.g.position.z,[0.8,1.4],new Set([pr.g])); });
// Lyra : cases accessibles, bloqueurs NON troués (matériau non patché par hole.js, hors petits objets lumineux)
let bad=0,tot=0; const dir=new THREE.Vector3(0,Math.sin(pitch),Math.cos(pitch)); const ex=[];
for(let cy=0;cy<isl.h;cy+=2) for(let cx=0;cx<isl.w;cx+=2){ const x=cx*2,z=cy*2; if(!L.canStand(x,z)) continue; tot++; ray.set(new THREE.Vector3(x,L.heightAt(x,z)+1,z),dir); ray.near=0.05; ray.far=17;
  for(const h of ray.intersectObjects(meshes,false)){ const o=h.object,m=Array.isArray(o.material)?o.material[0]:o.material; if(m.depthWrite===false||(m.transparent&&m.opacity<0.9)) continue; if(m.userData.holePatched) break; if(h.distance<0.9||m.isMeshBasicMaterial) continue; bad++; if(ex.length<5) ex.push([cx,cy,o.geometry.type]); break; } }
return JSON.stringify({n,hidden:res,lyra:{tot,bad,ex}}); })()
"""

for iid in ISLES:
    print('\n=====', iid)
    q = QA('camera-fixe-' + iid, query='?low&nobloom&ile=' + iid); q.load()
    J = q.js; hz = HOME[iid]
    J('départ', "(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='%s';s.player.zone='%s';s.player.respawn={zone:'%s',cell:[12,7]};s.world=m.newWorld('%s');s.player.abilities={porter:true};await __lumen.G.startFrom(s,'auto',false,true);await T.tick(1500);T.pump();await T.tick(400);return __lumen.S.mode+':'+__lumen.st.player.island})()" % (iid, hz, hz, hz), 'play:' + iid)
    camok = "(()=>{const L=__lumen;return JSON.stringify({yaw:L.S.yaw,yawT:L.S.yawT,pitch:L.S.pitch,dx:+(L.camera.position.x-L.S.camT.x).toFixed(3),dz:+(L.camera.position.z-L.S.camT.z).toFixed(2)})})()"
    def cam_fixe(r):
        d = json.loads(r); return abs(d['yaw']) < 1e-6 and abs(d['yawT']) < 1e-6 and abs(d['pitch'] - 0.95) < 1e-6 and abs(d['dx']) < 0.05 and d['dz'] > 3
    J('caméra fixe au départ (lacet 0, au sud, inclinaison 0,95)', camok, cam_fixe)
    J('trou de visibilité actif', "(()=>{const L=__lumen;return L.hole.cfg.enabled && L.hole.uniforms.uHA.value.z>0})()", lambda r: r is True)
    # (1)(2) visibilité
    r = q.ev(OCC); d = json.loads(r)
    q.step('%d cibles clés : aucune totalement masquée' % d['n'], lambda: d['hidden'], lambda x: len(x) == 0)
    q.step('Lyra : aucun bloqueur non troué sur %d cases' % d['lyra']['tot'], lambda: d['lyra'], lambda x: x['bad'] == 0)
    # (4) commandes : haut = nord
    mv = """(async()=>{const L=__lumen; const res={}; L.tpZone('%s'); await T.tick(500); L.P.x=%s; L.P.z=%s; L.P.vx=L.P.vz=0; await T.tick(300); return 1})()"""
    z = q.ev("(()=>{const L=__lumen,z=L.G.zones[L.G.zones.findIndex(z=>z.id==='%s')]; return [z.ox*2+z.spawn[0]*2, z.oy*2+z.spawn[1]*2]})()" % hz)
    def walk(key):
        q.ev("(()=>{%s})()" % (FREE % hz)); q.tick(700)
        a = q.ev("[__lumen.P.x,__lumen.P.z]"); q.pg.keyboard.down(key); q.tick(1000); q.pg.keyboard.up(key); q.tick(300)
        b = q.ev("[__lumen.P.x,__lumen.P.z,__lumen.P.face]"); return [b[0] - a[0], b[1] - a[1], b[2]]
    for key, name, test in [('d', 'D = est (+x)', lambda r: r[0] > 0.3 and abs(r[1]) < 0.2 and abs(r[2] - 1.5708) < 0.25),
                            ('a', 'Q/A = ouest (-x)', lambda r: r[0] < -0.3 and abs(r[1]) < 0.2 and abs(abs(r[2]) - 1.5708) < 0.25)]:
        q.step('marche : ' + name, lambda k=key: walk(k), test)
    q.step('marche : Z/W = nord (-z), orientation tournée vers le haut de l\'écran', lambda: walk('w'), lambda r: r[1] < -0.3 and abs(r[0]) < 0.2 and abs(abs(r[2]) - 3.1416) < 0.25)
    q.step('marche : S = sud (+z)', lambda: walk('s'), lambda r: r[1] > 0.3 and abs(r[0]) < 0.2 and abs(r[2]) < 0.25)
    def dodge_dir():
        q.ev("(()=>{%s})()" % (FREE % hz)); q.tick(700)
        a = q.ev("[__lumen.P.x,__lumen.P.z]"); q.pg.keyboard.down('w'); q.tick(150); q.pg.keyboard.press(' '); q.tick(600); q.pg.keyboard.up('w'); q.tick(300)
        b = q.ev("[__lumen.P.x,__lumen.P.z]"); return [b[0] - a[0], b[1] - a[1]]
    q.step('esquive avec Z/W : vers le nord', dodge_dir, lambda r: r[1] < -0.3 and abs(r[0]) < 0.3)
    # (3) lacet constant après dialogue / zones / boss / finale
    npc = q.ev("(()=>{const n=__lumen.npcs[0];return n?n.id:null})()")
    if npc:
        J('dialogue : lacet inchangé', "(async()=>{const L=__lumen; L.tpZone(L.G.zones[L.npcs[0].zi].id); await T.tick(400); L.G.screens.dialog('NPC'); await T.tick(900); const m=L.S.mode; const y1=[L.S.yaw,L.S.yawT]; T.pump(); await T.tick(900); return JSON.stringify([m,y1,L.S.yaw,L.S.yawT])})()".replace('NPC', npc), lambda r: json.loads(r)[0] == 'dialog' and json.loads(r)[1] == [0, 0] and json.loads(r)[2] == 0 and json.loads(r)[3] == 0)
    J('changement de zone (toutes) : lacet inchangé', "(async()=>{const L=__lumen; const bad=[]; for(const z of L.G.zones){ L.tpZone(z.id); await T.tick(180); if(Math.abs(L.S.yaw)>1e-6||Math.abs(L.S.yawT)>1e-6) bad.push(z.id); } return JSON.stringify(bad)})()", '[]')
    J('arène du boss : lacet 0, caméra reculée de 5 si boss engagé', "(async()=>{const L=__lumen; L.tpZone('%s'); await T.tick(600); const b=L.combat.enemies.find(e=>e.boss); if(b){ L.G.bossStart(b); await T.tick(1500);} const d=Math.hypot(L.camera.position.x-L.S.camT.x,L.camera.position.y-L.S.camT.y,L.camera.position.z-L.S.camT.z); const r={boss:!!b,yaw:L.S.yaw,d:+d.toFixed(1),dx:+(L.camera.position.x-L.S.camT.x).toFixed(2)}; L.S.boss=null; L.G.hud.bossBar&&L.G.hud.bossBar(null); return JSON.stringify(r)})()" % BOSSZONE[iid], lambda r: json.loads(r)['yaw'] == 0 and abs(json.loads(r)['dx']) < 0.05 and (not json.loads(r)['boss'] or json.loads(r)['d'] >= 20))
    if iid == 'zenith':
        J('fin du jeu (rejouée) puis reprise : lacet 0', "(async()=>{const L=__lumen; L.tpZone('phare_z'); await T.tick(500); L.startEnding(true); await T.tick(1500); const y1=[L.S.yaw,L.S.mode]; L.fin.skip(); await T.tick(2500); return JSON.stringify([y1,L.S.yaw,L.S.yawT,L.S.mode])})()", lambda r: json.loads(r)[1] == 0 and json.loads(r)[2] == 0)
    else:
        J('finale : lacet 0 pendant et après, retour au plan fixe', "(async()=>{const L=__lumen; L.tpZone('HZ'); await T.tick(500); L.startFinale(); let ys=[0]; for(let i=0;i<400&&L.S.mode==='cutscene';i++){ await T.tick(150); ys.push(L.S.yaw); } await T.tick(2500); const c=JSON.parse(CAMOK); return JSON.stringify({mode:L.S.mode,maxyaw:Math.max(...ys.map(Math.abs)),cam:c})})()".replace('HZ', hz).replace('CAMOK', camok), lambda r: json.loads(r)['mode'] == 'play' and json.loads(r)['maxyaw'] == 0 and cam_fixe(json.dumps(json.loads(r)['cam'])))
    q.done()
    ALLFAILS += [(iid,) + tuple(r[:3]) for r in q.results if r[1] != 'OK']

print('\n##### QA CAMÉRA FIXE — ÉCHECS :', ALLFAILS)
sys.exit(1 if ALLFAILS else 0)
