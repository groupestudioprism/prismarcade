"""Clavier, menus, pause pendant un combat, dialogue au clavier, flou/onglet caché, redimensionnement, tactile."""
import sys; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from qa_lib import *
q=QA('ui', viewport=(800,450)); q.load()
J=q.js; pg=q.pg
# réponses 404 / requêtes en échec
bad=[]
pg.on("response", lambda r: bad.append(f"{r.status} {r.url}") if r.status>=400 and 'fonts.g' not in r.url else None)
pg.on("requestfailed", lambda r: bad.append(f"FAILED {r.url}") if 'fonts.g' not in r.url and 'ERR_TUNNEL' not in str(r.failure) else None)
J('nouvelle partie',"T.newGame()","play")
J('prépa',"(async()=>{const L=__lumen;await T.talkTo('selene');L.openGate('g1');L.openGate('g2');L.quests.check();await T.talkTo('selene');L.st.player.hp=100;L.tpZone('havre');await T.tick(300);return L.S.mode})()","play")
def key(k, wait=250):
    pg.keyboard.press(k); pg.wait_for_timeout(wait)
def mode(): return q.ev("__lumen.S.mode+'|'+(__lumen.G.screens.current||'')")
for k,exp in [('i','menu'),('j','menu'),('m','menu'),('c','menu'),('Escape','menu')]:
    key(k); m=mode(); q.step('touche '+k+' ouvre', lambda m=m: m, lambda r: r.startswith('screen|menu'))
    key(k if k!='Escape' else 'Escape'); m2=mode(); q.step('touche '+k+' ferme', lambda m2=m2: m2, lambda r: r.startswith('play|'))
# onglet puis Tab
key('Tab'); q.step('Tab ouvre inventaire', mode, lambda r: r.startswith('screen|menu')); key('Tab'); q.step('Tab ferme', mode, lambda r: r.startswith('play'))
key('p'); q.step('P ouvre pause', mode, lambda r: r.startswith('screen')); key('p'); q.step('P ferme', mode, lambda r: r.startswith('play'))
# boutons HUD (clics réels)
for ui in ['inventaire','journal','carte','options']:
    pg.click(f'[data-ui={ui}]'); pg.wait_for_timeout(250); q.step('bouton HUD '+ui, mode, lambda r: r.startswith('screen|menu'))
    pg.click('#screen [data-a=close], #screen .m-close'); pg.wait_for_timeout(250); q.step('fermer '+ui, mode, lambda r: r.startswith('play'))
# onglets du menu au clic
J('onglets cliquables',"""(async()=>{const L=__lumen;L.G.screens.menu('inventaire');await T.tick(100);const out=[];for(const t of ['personnage','journal','carte','options','inventaire']){document.querySelector('[data-tab='+t+']').click();await T.tick(100);out.push(t+':'+document.querySelector('#m-body').innerHTML.length>50);}
  for(const c of ['arme','armure','accessoire','conso','materiau','quete']){document.querySelector('[data-cat='+c+']')&&document.querySelector('[data-cat='+c+']').click();await T.tick(50);}
  L.G.screens.close();return out.join(',')})()""")
# --- pause pendant un combat : rien ne bouge
J('combat gelé en menu',"""(async()=>{const L=__lumen;L.tpZone('lande');await T.tick(900);const e=L.combat.enemies.find(x=>x.type==='brumelin');L.P.x=e.x+2.5;L.P.z=e.z;L.st.player.hp=100;L.st.player.hp=100;await T.tick(500);
  L.G.screens.menu('inventaire');L.S.mode='screen';const p0=[e.x,e.z,L.st.player.hp];await T.tick(2000);const p1=[e.x,e.z,L.st.player.hp];
  L.G.screens.close();await T.tick(1500);const p2=[e.x,e.z,L.st.player.hp];
  return JSON.stringify({gele:p0[0]===p1[0]&&p0[1]===p1[1]&&p0[2]===p1[2],reprise:(p2[0]!==p1[0]||p2[1]!==p1[1]||p2[2]!==p1[2]),mode:L.S.mode})})()""", lambda r: '"gele":true' in r and '"reprise":true' in r)
# --- flou de fenêtre et onglet caché
J('blur → pause',"(async()=>{const L=__lumen;L.G.screens.close();await T.tick(200);window.dispatchEvent(new Event('blur'));await T.tick(300);return L.S.mode+'|'+L.G.screens.current})()", lambda r: r.startswith('screen|menu'))
J('fermer pause',"(async()=>{__lumen.G.screens.close();await T.tick(200);return __lumen.S.mode})()","play")
J('onglet caché → pause+sauvegarde',"""(async()=>{const L=__lumen;const t0=L.st.updated;Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));await T.tick(400);const r=L.S.mode+'|'+L.G.screens.current+'|saved='+(L.st.updated>=t0);Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));L.G.screens.close();await T.tick(200);return r+'|'+L.S.mode})()""", lambda r: r.startswith('screen|menu|saved=true') and r.endswith('|play'))
# --- dialogue au clavier
J('dialogue clavier: E',"(async()=>{const L=__lumen;const r=await T.near('selene');return r+' mode='+L.S.mode})()","ok")
key('e',300); q.step('E ouvre le dialogue', lambda: q.ev("__lumen.S.mode+'|'+__lumen.G.screens.dialogOpen"), lambda r: r.startswith('dialog|true'))
n=0
while q.ev("__lumen.G.screens.dialogOpen") and n<30:
    n+=1; ch=q.ev("document.querySelectorAll('#dialog .choice').length")
    if ch: key('1',300)
    else: key('e',200)
q.step('dialogue Séléné terminé au clavier', lambda: q.ev("__lumen.S.mode+'|'+__lumen.G.screens.dialogOpen+' n='+%d"%n), lambda r: r.startswith('play|false'))
# dialogue à choix : Bran (touches 1..4)
J('Bran: choix au clavier',"(async()=>{const L=__lumen;L.st.flags.forge_ouverte=1;L.st.quests.q_lentille={state:'done',step:6,base:{}};const r=await T.near('bran');return r})()","ok")
key('e',300)
for _ in range(10):
    if q.ev("document.querySelectorAll('#dialog .choice').length"): break
    key('e',250)
q.step('choix affichés', lambda: q.ev("[...document.querySelectorAll('#dialog .choice')].map(c=>c.textContent).join('|')"), lambda r: '1' in r)
key('2',500); q.step('touche 2 = boutique/forge', lambda: q.ev("(__lumen.G.screens.current||'')+'|'+__lumen.S.mode"), lambda r: r.startswith('shop') or r.startswith('forge') or 'screen' in r)
J('fermer',"(()=>{__lumen.G.screens.close();return __lumen.S.mode})()","play")
# Entrée sur un choix focalisé (risque de double déclenchement)
J('dialogue: Entrée sur un bouton de choix',"""(async()=>{const L=__lumen;await T.near('maelle').catch(()=>0);L.tpZone('auberge_in');await T.tick(300);const r=await T.near('maelle');L.interact();await T.tick(200);let g=0;while(!document.querySelector('#dialog .choice')&&g++<20){L.G.screens.nextLine();await T.tick(30);}
  const nb=document.querySelectorAll('#dialog .choice').length;return r+' choix='+nb})()""")
pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
q.step('Entrée: état', lambda: q.ev("__lumen.S.mode+'|'+(__lumen.G.screens.current||'')+'|dlg='+__lumen.G.screens.dialogOpen+'|hp='+Math.round(__lumen.st.player.hp)"))
J('fermer tout',"(()=>{const L=__lumen;let n=0;while((L.G.screens.dialogOpen||L.G.screens.current)&&n++<30){if(L.G.screens.dialogOpen)L.G.screens.nextLine();else L.G.screens.close();}return L.S.mode})()","play")
# --- redimensionnement
for (w,h) in [(320,480),(1920,1080),(480,320),(200,120),(1024,768)]:
    pg.set_viewport_size({"width":w,"height":h}); pg.wait_for_timeout(500)
    q.step(f'resize {w}x{h}', lambda: q.ev("JSON.stringify({c:[document.getElementById('c').width,document.getElementById('c').height],win:[innerWidth,innerHeight],aspect:+__lumen.camera.aspect.toFixed(2),hud:!document.getElementById('hud').hidden,mode:__lumen.S.mode})"), lambda r: '"mode":"play"' in r)
    q.ev("__lumen.G.screens.menu('inventaire')"); pg.wait_for_timeout(200)
    ov = q.ev("(()=>{const p=document.querySelector('#screen .panel');if(!p)return 'nopanel';const r=p.getBoundingClientRect();return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),dx:Math.round(r.right-innerWidth),dy:Math.round(r.bottom-innerHeight)})})()")
    print('   panneau menu', ov); q.ev("__lumen.G.screens.close()")
pg.set_viewport_size({"width":800,"height":450})
print('RÉSEAU 404/échecs :', sorted(set(bad))[:10])
q.done()
