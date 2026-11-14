"""FORÊT DE VERRE : LA MONTAGNE. Montée du village au phare par les vraies routes (marche au clavier, grappin réel), altitude croissante,
falaises bloquantes, raccourci de la Cascade (s'ouvre vers le bas), trou de visibilité en trois points, géographie (une seule masse).
Lancer :  QA_PORT=8875 flock /tmp/lumen-chrome.lock timeout 900 python3 -u tests/qa_montagne_foret.py"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import *
from qa_walk import *

q = QA('montagne-foret', query='?low&nobloom&ile=foret'); q.load()
J = q.js
J('arrivée en Forêt (état neuf, fin d\'acte I)', """(async()=>{const m=await import('/lumen/js/game/state.js'); const s=m.newState(); s.player.island='foret'; s.player.zone='vitrebourg'; s.world=m.newWorld('vitrebourg');
  s.flags.acte1_fini=1; s.quests.q_reveil={state:'done',step:3,base:{}}; s.inv.epee_courte=1; s.equip.weapon='epee_courte'; s.inv.grappin=1; s.player.lvl=8;
  await __lumen.G.startFrom(s,'auto',false,true); await T.tick(1500); T.pump(); return __lumen.S.mode})()""", 'play')
ZI = json.loads(q.ev("JSON.stringify(Object.fromEntries(__lumen.G.zones.map(z=>[z.id,[z.ox,z.oy,z.map[0].length,z.map.length]])))"))
gc = lambda z, x, y: (ZI[z][0] + x, ZI[z][1] + y)

# ---------- géographie ----------
J('île à relief, 16 zones, marque de géographie', "JSON.stringify({alt:__lumen.isl.alt, n:__lumen.G.zones.length, layout:__lumen.isl.def.layout})", lambda r: '"alt":true' in r and '"n":16' in r and 'montagne-1' in r)
J('plus aucun pont au-dessus du vide entre zones principales (seules les 3 passerelles de cime restent)', "JSON.stringify(Object.values(__lumen.isl.gates).filter(g=>g.kind==='bridge').map(g=>g.id).sort())", lambda r: json.loads(r) == ['fc0', 'fc1', 'fc2'])
J('altitude : 14 niveaux d\'écart (0 → 13), plusieurs terrasses', """(()=>{const I=__lumen.isl; let mn=99,mx=-1; const set=new Set(); for(const row of I.hgt) for(const v of row) if(v!==null&&v!==undefined){mn=Math.min(mn,v);mx=Math.max(mx,v);set.add(v)} return JSON.stringify({mn,mx,levels:set.size})})()""", lambda r: json.loads(r)['mn'] == 0 and json.loads(r)['mx'] >= 13 and json.loads(r)['levels'] >= 12)
J('une seule masse : les zones extérieures se touchent (contact connexe)', """(()=>{const L=__lumen,I=L.isl,zs=L.G.zones,adj={};zs.forEach(z=>adj[z.id]=new Set());
  for(let y=0;y<I.h;y++)for(let x=0;x<I.w;x++){const a=I.zoneAt[y][x]; if(a<0)continue; for(const [dx,dy] of [[1,0],[0,1]]){const b=(I.zoneAt[y+dy]||[])[x+dx]; if(b!==undefined&&b>=0&&b!==a){adj[zs[a].id].add(zs[b].id);adj[zs[b].id].add(zs[a].id)}}}
  const seen=new Set(['vitrebourg']),q=['vitrebourg']; while(q.length){const c=q.shift(); adj[c].forEach(n=>{if(!seen.has(n)){seen.add(n);q.push(n)}})}
  return JSON.stringify({manquent:zs.filter(z=>!z.interior&&!seen.has(z.id)).map(z=>z.id)})})()""", lambda r: set(json.loads(r)['manquent']) <= {'can2','can3','can4','cime_c','phare_f'})

# ---------- portes : pas de route sans les portes ----------
J('portes fermées : aucun chemin du village à la Lisière ni aux vitraux', """(async()=>{const L=__lumen;const r=(...a)=>0; return 'ok'})()""")
for name, dst in (('Lisière', gc('lisiere', 15, 26)), ('salle des vitraux', gc('f1', 5, 9))):
    r = q.pg.evaluate("(" + ROUTE_JS + ")", [list(gc('vitrebourg', 12, 7)), list(dst)])
    q.step('portes fermées : pas de route vers la ' + name, lambda r=r: r, lambda r: r is None)

# ---------- le village jusqu'au Temple (flanc ouest) : marche réelle, altitude croissante ----------
q.js('portes du village et de la Lisière ouvertes (comme après Ambre)', "(()=>{['b_vitres','b_lisiere'].forEach(g=>__lumen.openGate(g,true)); return 'ok'})()")
q.js('haie de ronces coupée (lame obtenue)', """(()=>{const L=__lumen,I=L.isl,zi=L.G.zones.findIndex(z=>z.id==='lisiere'); let n=0; for(let y=0;y<I.h;y++)for(let x=0;x<I.w;x++) if(I.terrain[y][x]==='r'&&I.zoneAt[y][x]===zi){I.terrain[y][x]=',';L.world.removeCell('r',x,y);L.st.world.cut[x+','+y]=1;n++} return n})()""", lambda r: r >= 5)
q.js('porte du Portique ouverte (Lyra s\'approche)', "(()=>{__lumen.openGate('b_temple',true); return 'ok'})()")
log = []
t0 = time.time()
res = walk_cells(q, gc('temple', 15, 1), maxms=300000, log=log)
q.step('marche au clavier : Vitrebourg -> Lisière -> Sentier du Portique -> Temple', lambda: [res, round(time.time() - t0), log], lambda r: r[0][0] is True)
zs = [z for z, _ in log]
q.step('zones traversées dans l\'ordre de la montée', lambda: zs, lambda r: r[:2] == ['vitrebourg', 'lisiere'] and 'sentier_t' in r and r[-1] == 'temple')
gys = [g for _, g in log]
q.step('altitude croissante à chaque nouvelle zone (0 -> 7,5 u)', lambda: gys, lambda r: all(b >= a - 0.01 for a, b in zip(r, r[1:])) and r[-1] >= 7.0 and r[0] <= 2.0)
q.step('Temple atteint à 10 niveaux (7,5 u)', lambda: q.ev("__lumen.P.gy"), lambda r: 7.0 <= r <= 8.0)

# ---------- falaises : le clavier bute (Lisière, entre deux terrasses, hors escalier) ----------
spot = q.ev("""(async()=>{const L=__lumen,I=L.isl,lg=await import('/lumen/js/logic.js'),zi=L.G.zones.findIndex(z=>z.id==='lisiere'),z=L.G.zones[zi];
  for(let ly=14;ly<=27;ly++)for(let lx=2;lx<z.map[0].length-2;lx++){const x=z.ox+lx,y=z.oy+ly; if(I.zoneAt[y][x]!==zi||!lg.walkable(I,x,y)) continue;
    if(I.zoneAt[y-1][x]===zi && I.terrain[y-1][x]!==' ' && I.hgt[y-1][x]-I.hgt[y][x]>=2){ let free=true; for(let k=1;k<=3;k++){ if(!lg.walkable(I,x,y+k)||I.hgt[y+k][x]!==I.hgt[y][x]) free=false } if(free) return [x,y,I.hgt[y][x]] } }
  return null})()""")
q.step('une falaise franche trouvée dans la Lisière', lambda: spot, lambda r: r is not None)
if spot:
    x, y, lv = spot
    q.ev(f"(()=>{{const L=__lumen; L.P.x={x * 2}; L.P.z={y * 2 + 1.2}; L.P.vx=L.P.vz=0; L.st.player.hp=999;}})()"); q.tick(700)
    q.pg.keyboard.down('w'); q.tick(5000); q.pg.keyboard.up('w'); q.tick(400)
    st = q.ev("[__lumen.P.z/2, __lumen.P.gy]")
    q.step('clavier : la falaise (≥ 2 niveaux) bloque la marche vers le nord', lambda: [spot, st], lambda r: r[1][0] >= y - 0.56 and r[1][1] <= lv * 0.75 + 0.5)

# ---------- la montée principale : vitraux -> belvédère -> Canopée -> Phare (marche + grappin réels) ----------
J('retour au village', "(()=>{__lumen.tpZone('vitrebourg',[12,7]); return 'ok'})()", 'ok')
J('portes de la voie principale ouvertes (énigmes résolues, grappin forgé)', """(()=>{const L=__lumen; ['fg1','fg2','fg3','b_canopee','fc0','fc1','cn_combat','fc2'].forEach(g=>L.openGate(g,true)); L.st.inv.grappin=1; L.st.player.abilities.grappin=true; const G=L.isl.gates.rac_cime; G.open=false; delete L.st.world.gates.rac_cime; L.world.setGateView(G,false,true); return JSON.stringify({rac:L.G.isGateOpen('rac_cime')})})()""", '"rac":false')
log2 = []
t0 = time.time()
pe = json.loads(q.ev("(()=>{const z=__lumen.isl.def.zones.find(z=>z.id==='phare_f'); return JSON.stringify(z.entry||z.spawn||z.start)})()"))
res2 = walk_cells(q, (ZI['phare_f'][0] + pe[0], ZI['phare_f'][1] + pe[1]), maxms=420000, log=log2)
q.step('montée du village au Phare : marche au clavier et sauts de grappin réels', lambda: [res2, round(time.time() - t0), log2], lambda r: r[0][0] is True)
zs2 = [z for z, _ in log2]
q.step('chemin des zones : vitraux, belvédère, Canopée, Corniche, Passerelle, Nid, Phare', lambda: zs2, lambda r: [z for z in ['f1', 'f3', 'belv', 'can1', 'can2', 'cime_c', 'can3', 'can4', 'phare_f'] if z in r] == ['f1', 'f3', 'belv', 'can1', 'can2', 'cime_c', 'can3', 'can4', 'phare_f'])
gys2 = [g for _, g in log2]
q.step('altitude du joueur croissante de zone en zone (0 -> 9,75 u)', lambda: gys2, lambda r: all(b >= a - 0.01 for a, b in zip(r, r[1:])) and r[-1] >= 9.5)
q.step('au phare : niveau 13', lambda: q.ev("Math.round(__lumen.P.gy/0.75)"), lambda r: r == 13)

# ---------- raccourci de la Cascade : ne s'ouvre que vers le bas ----------
J('raccourci : fermé tant que le 3e vitrail n\'est pas résolu', """(()=>{const L=__lumen; ['fg3','rac_cime'].forEach(g=>{const G=L.isl.gates[g]; G.open=false; delete L.st.world.gates[g]; L.world.setGateView(G,false,true)}); return L.G.isGateOpen('rac_cime')})()""", lambda r: r is False)
r = q.pg.evaluate("(" + ROUTE_JS + ")", [list(gc('vitrebourg', 12, 7)), list(gc('cascade', 1, 20))])
q.step('raccourci : pas de route montante depuis le village (porte du bas fermée)', lambda: r, lambda r: r is None)
J('3e vitrail résolu -> la descente s\'ouvre (lien de portes)', "(()=>{const L=__lumen; L.openGate('fg3'); return L.G.isGateOpen('rac_cime')})()", lambda r: r is True)
J('belvédère (porte b_canopee…) : tp au sommet de la Cascade', "(()=>{__lumen.tpZone('belv',[3,5]); return 'ok'})()", 'ok')
g0 = q.ev("__lumen.P.gy")
res3 = walk_cells(q, gc('vitrebourg', 37, 3), maxms=200000, log=(lg3 := []))
q.step('descente de la Cascade jusqu\'au village (marche réelle)', lambda: [res3, lg3, g0, q.ev("__lumen.P.gy")], lambda r: r[0][0] is True and r[3] < r[2] - 2.0 and r[1][-1][0] == 'vitrebourg')

# ---------- trou de visibilité : Lyra reste visible en trois points ----------
q.ev("(()=>{__lumen.hole.cfg.enabled=true})()")
VIS = """async ([ax, ay, label]) => {
  const L = __lumen; L.P.x = ax * 2; L.P.z = ay * 2; L.P.vx = L.P.vz = 0; L.S.mode === 'play' || 0; L.st.player.hp = 999;
  await T.tick(1400);
  const u = L.hole.uniforms.uHA.value, hh = L.P.gy;
  // occultation réelle : un point du rayon caméra->Lyra est-il sous un relief, ou y a-t-il un décor haut juste au sud ?
  const cam = L.camera.position, tgt = { x: L.P.x, y: hh + 1, z: L.P.z }; let occ = 0, occLabel = '';
  for (let t = 0.04; t < 0.96; t += 0.02) { const x = tgt.x + (cam.x - tgt.x) * t, y = tgt.y + (cam.y - tgt.y) * t, z = tgt.z + (cam.z - tgt.z) * t; if (L.heightAt(x, z) > y) { occ++; occLabel = 'relief'; } }
  const tc = [Math.round(L.P.x / 2), Math.round(L.P.z / 2)]; for (let k = 1; k <= 4 && !occ; k++) { const t = L.isl.terrain[tc[1] + k] && L.isl.terrain[tc[1] + k][tc[0]]; if (t === 'T' || t === 'H' || t === '#') { occ++; occLabel = 'décor:' + t; } }
  return JSON.stringify({ label, r: +u.z.toFixed(3), x: +u.x.toFixed(2), y: +u.y.toFixed(2), occ, occLabel, gy: +hh.toFixed(2) });
}"""
# 1. sentier derrière un arbre (un arbre 'T' juste au sud d'une case de chemin) ; 2. escalier de la Lisière ; 3. pied de falaise (au nord du mur du Temple)
tree = q.ev("""(async()=>{const L=__lumen,I=L.isl,lg=await import('/lumen/js/logic.js'),z=L.G.zones.find(z=>z.id==='lisiere'); for(let ly=2;ly<z.map[0].length;ly++){} 
  for(let y=z.oy+3;y<z.oy+26;y++)for(let x=z.ox+2;x<z.ox+32;x++){ if(I.terrain[y][x]===','&&I.terrain[y+1][x]==='T'&&lg.walkable(I,x,y)&&I.hgt[y][x]===I.hgt[y+1][x]) return [x,y] } return null})()""")
stair = None
if True:
    stair = q.ev("""(async()=>{const L=__lumen,I=L.isl,lg=await import('/lumen/js/logic.js'),z=L.G.zones.find(z=>z.id==='lisiere'); for(let y=z.oy+3;y<z.oy+26;y++)for(let x=z.ox+2;x<z.ox+32;x++){ if(lg.walkable(I,x,y)&&lg.walkable(I,x,y+1)&&lg.walkable(I,x,y-1)&&I.hgt[y+1][x]===I.hgt[y][x]-1&&I.hgt[y-1][x]===I.hgt[y][x]+1) return [x,y] } return null})()""")
foot = [ZI['sentier_t'][0] + 21, ZI['sentier_t'][1] + 1]    # bande nord du sentier du Portique : le mur nord du Temple est entre la caméra et Lyra
for name, c in (('sentier derrière un arbre', tree), ('escalier', stair), ('pied de falaise / mur du Temple', foot)):
    q.step('visibilité : ' + name, lambda c=c, name=name: json.loads(q.pg.evaluate("(" + VIS + ")", [c[0], c[1], name])) if c else None,
           lambda r: r is not None and r['r'] > 0.02 and abs(r['x']) < 0.6 and abs(r['y']) < 0.7)
    print('   ', q.results[-1][2], flush=True)
q.step('visibilité : au moins un des trois points est réellement occulté (le trou sert)', lambda: [json.loads(q.pg.evaluate("(" + VIS + ")", [c[0], c[1], 'x'])).get('occ') for c in (tree, stair, foot) if c], lambda r: any(v > 0 for v in r))
print('erreurs page:', q.errs[:5])
q.done()
