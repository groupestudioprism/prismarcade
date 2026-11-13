"""Commandes tactiles : joystick, boutons, dialogue au toucher, menus (viewport 844x390, ?touch)."""
import sys; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from qa_lib import *
q=QA('tactile', viewport=(844,390), query='?low&nobloom&touch'); q.load(); pg=q.pg
cdp=q.ctx.new_cdp_session(pg)
def touch(t, x, y, id=1):
    cdp.send('Input.dispatchTouchEvent', {'type': t, 'touchPoints': [] if t=='touchEnd' else [{'x': x, 'y': y, 'id': id}]})
J=q.js
J('nouvelle partie tactile',"T.newGame()","play")
J('contrôles tactiles visibles',"JSON.stringify({touch:!document.getElementById('touch').hidden,tactile:__lumen.G.input.touch,btns:[...document.querySelectorAll('[data-touch]')].map(b=>b.dataset.touch+':'+(b.offsetWidth>0))})", '"touch":true')
J('aide tactile',"__lumen.G.helpHtml().slice(0,60)","Joystick")
J('prépa',"(async()=>{const L=__lumen;await T.talkTo('selene');L.openGate('g1');L.openGate('g2');L.quests.check();await T.talkTo('selene');L.give('epee_courte',1);L.G.equip('epee_courte',true);L.tpZone('havre');await T.tick(400);L.st.player.hp=100;return L.S.mode})()","play")
# joystick
p0=q.ev("[__lumen.P.x,__lumen.P.z]")
touch('touchStart',120,250); touch('touchMove',170,250); pg.wait_for_timeout(700); touch('touchMove',170,200); pg.wait_for_timeout(500)
p1=q.ev("[__lumen.P.x,__lumen.P.z]")
touch('touchEnd',0,0); pg.wait_for_timeout(400)
q.step('joystick déplace Lyra', lambda: [p0,p1], lambda r: abs(r[0][0]-r[1][0])+abs(r[0][1]-r[1][1])>1.5)
q.step('joystick relâché: arrêt', lambda: q.ev("Math.hypot(__lumen.P.vx,__lumen.P.vz)<0.5"), lambda r: r is True)
# boutons : clic souris réel = pointerdown/up
def tap(sel, hold=60):
    b=pg.locator(sel); box=b.bounding_box(); x=box['x']+box['width']/2; y=box['y']+box['height']/2
    pg.mouse.move(x,y); pg.mouse.down(); pg.wait_for_timeout(hold); pg.mouse.up(); pg.wait_for_timeout(150)
q.js('place un ennemi proche',"(async()=>{const L=__lumen;L.tpZone('lande');await T.tick(900);const e=L.combat.enemies.find(x=>x.type==='brumelin');L.P.x=e.x+1.2;L.P.z=e.z;L.st.player.hp=100;L.P.face=-Math.PI/2;return 'ok'})()")
tap('[data-touch=attack]'); q.step('bouton ⚔ lance un coup', lambda: q.ev("JSON.stringify({sw:!!__lumen.P.swing,cd:__lumen.P.swingCD>0})"), lambda r: 'true' in r)
pg.wait_for_timeout(600)
q.ev("__lumen.P.dodgeCD=0")
tap('[data-touch=dodge]'); q.step('bouton ⤳ esquive', lambda: q.ev("__lumen.P.dodging||__lumen.P.dodgeCD>0"), lambda r: r)
pg.wait_for_timeout(700)
q.ev("__lumen.st.player.abilities.onde=true;__lumen.st.player.en=60")
tap('[data-touch=special]'); q.step('bouton ✦ Onde (énergie)', lambda: q.ev("__lumen.st.player.en<60"), lambda r: r)
q.ev("__lumen.st.player.hp=40;__lumen.give('potion',2)")
tap('[data-touch=potion]'); q.step('bouton ♥ potion', lambda: q.ev("__lumen.st.player.hp>40"), lambda r: r)
# interagir : PNJ
q.js('près de Bran',"(async()=>{const L=__lumen;L.combat.resetAll();return await T.near('bran')})()","ok")
tap('[data-touch=interact]',60); pg.wait_for_timeout(400)
q.step('bouton ✋ ouvre le dialogue', lambda: q.ev("__lumen.S.mode+'|'+__lumen.G.screens.dialogOpen"), lambda r: r.startswith('dialog|true'))
# toucher le dialogue pour avancer
for i in range(15):
    if not q.ev("__lumen.G.screens.dialogOpen"): break
    ch=q.ev("document.querySelectorAll('#dialog .choice').length")
    if ch: pg.locator('#dialog .choice').last.click()
    else: pg.locator('#dialog').click()
    pg.wait_for_timeout(200)
q.step('dialogue terminé au toucher', lambda: q.ev("__lumen.S.mode+'|'+__lumen.G.screens.dialogOpen"), lambda r: r.startswith('play|false') or r.startswith('screen'))
q.ev("__lumen.G.screens.close()")
# long appui interagir = sens inverse sur une lanterne
q.js('près d\'une lanterne',"(async()=>{const L=__lumen;L.tpZone('z1');await T.tick(500);const e=L.isl.ents.find(e=>e.t==='lantern'&&e.zone===L.G.zoneIndexAt(L.P.x,L.P.z));window.__lan=e;window.__d0=e.dir;L.P.x=e.x*2;L.P.z=e.y*2+1.5;await T.tick(500);const t=L.target();return t?t.kind:'-'})()","device")
tap('[data-touch=interact]',700); q.step('appui long = sens inverse', lambda: q.ev("window.__d0+'->'+window.__lan.dir"), lambda r: r.split('->')[0]!=r.split('->')[1])
# menus tactiles
for ui in ['inventaire','journal','carte','options']:
    pg.locator(f'[data-ui={ui}]').click(); pg.wait_for_timeout(250); q.step('menu tactile '+ui, lambda: q.ev("__lumen.S.mode+'|'+(__lumen.G.screens.current||'')+'|touch='+!document.getElementById('touch').hidden"), lambda r: r.startswith('screen|menu|touch=false'))
    pg.locator('#screen .m-close').click(); pg.wait_for_timeout(250); q.step('fermeture '+ui, lambda: q.ev("__lumen.S.mode+'|touch='+!document.getElementById('touch').hidden"), lambda r: r.startswith('play|touch=true'))
# glisser la caméra à droite
y0=q.ev("__lumen.S.yawT"); touch('touchStart',700,200,2); touch('touchMove',640,200,2); touch('touchMove',560,200,2); touch('touchEnd',0,0); pg.wait_for_timeout(300)
q.step('glisser à droite = caméra', lambda: [y0,q.ev("__lumen.S.yawT")], lambda r: r[0]!=r[1])
# la bulle d'interaction
q.js('invite tactile',"document.getElementById('prompt').innerText+'|'+document.getElementById('prompt').hidden")
q.done()
