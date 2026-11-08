"""Sauvegardes hostiles / anciennes versions / migration."""
import sys, json; sys.path.insert(0,'/home/claude/prismarcade/lumen/tests')
from qa_lib import *
q=QA('sauvegardes', profile='/tmp/qa_prof_saves2'); q.load()
J=q.js
base = q.ev("(()=>{const s=JSON.parse(JSON.stringify(__lumen.st));return s})()")
def put(name, data, raw=None, slot='s1'):
    key = 'lumen.save.local.'+slot
    val = raw if raw is not None else json.dumps({"meta":{"v":4,"name":"Lyra","region":"Havre-Aube","level":3,"playTime":600,"completion":12,"updated":1760000000000},"data":data})
    q.ev("([k,v])=>localStorage.setItem(k,v)" if False else f"localStorage.setItem({json.dumps(key)}, {json.dumps(val)})")
def case(name, data, raw=None, expect_ok=True):
    put(name, data, raw)
    q.pg.reload(wait_until="load"); q.pg.wait_for_function("window.__lumen && __lumen.S", timeout=60000); q.prep()
    n0=len(q.errs)
    r = q.ev("""(async()=>{try{const L=__lumen;const sv=await L.G.saves.read('s1');if(!sv)return 'read=null';await L.G.startFrom(sv,'s1');await T.tick(900);T.pump();const ex=await T.exercise();return 'mode='+L.S.mode+' zone='+L.G.zoneId()+' hp='+Math.round(L.st.player.hp)+' x='+(L.P.x|0)+' ex='+ex}catch(e){return 'EXC '+e.message}})()""")
    new = q.errs[n0:]
    ok = ('EXC' not in r) and not new and ('ex=ok' in r or r=='read=null')
    print(('OK   ' if ok else 'FAIL ')+name, r, new[:2], flush=True)
    q.results.append((name,'OK' if ok else 'FAIL',r))
import copy
def mk(**kw):
    d=copy.deepcopy(base)
    for k,v in kw.items():
        parts=k.split('__'); t=d
        for p in parts[:-1]: t=t.setdefault(p,{})
        t[parts[-1]]=v
    return d
# --- anciennes versions
v4 = copy.deepcopy(base)
for k in ['otherWorlds']: v4.pop(k,None)
v4['v']=4; v4['player'].pop('island',None); v4['world'].pop('killed',None)
case('0.4: sans île/otherWorlds/killed', v4)
v3 = {"v":3,"name":"Lyra","player":{"zone":"havre","x":None,"z":None,"hp":80,"en":40,"lvl":2,"xp":10,"ecus":55},"inv":{"baton":1,"potion":2},"quests":{"q_reveil":{"state":"active","step":1,"base":{"kills":0}}},"flags":{},"world":{"gates":{"b_rivage":1,"g1":1}}}
case('0.3 minimal', v3)
v02 = {"v":2}
case('objet vide v2', v02)
case('0.5 réelle (état courant)', base)
# --- hostiles
case('arme équipée inconnue', mk(equip__weapon='epee_fantome', equip__armor='armure_fantome', equip__acc1='x', equip__quick='nope'))
case('inventaire inconnu/négatif/NaN', mk(inv={'objet_fantome':3,'potion':-4,'pierre':'beaucoup','baton':1.5,'brume':1e12}))
case('quête inconnue', mk(quests={'q_fantome':{'state':'active','step':0,'base':{}},'q_reveil':{'state':'active','step':0,'base':{'kills':0}}}))
case('étape hors limites', mk(quests={'q_reveil':{'state':'active','step':99,'base':{}}}))
case('étape négative', mk(quests={'q_reveil':{'state':'active','step':-1,'base':{}}}))
case('quête sans base', mk(quests={'q_reveil':{'state':'active','step':0}}))
case('zone inconnue + position hors carte', mk(player__zone='zone_fantome', player__x=99999, player__z=-5))
case('hp 0 / NaN', mk(player__hp=0, player__en=None, player__lvl=0))
case('niveau énorme / xp négatif', mk(player__lvl=9999, player__xp=-5, player__ecus=-100))
case('portes inconnues', mk(world__gates={'porte_fantome':1,'g1':1}, world__picked={'x':1}, world__chests={'ch_fantome':1}))
case('suivi inconnu', mk(tracked='q_fantome'))
case('apparence inconnue', mk(look={'hair':'zzz','skin':'zzz','outfit':'zzz','acc':'zzz','cloak':'zzz'}))
case('île inconnue', mk(player__island='desert'))
case('respawn invalide', mk(player__respawn={'zone':'nulle','cell':[999,999]}))
case('respawn absent', mk(player__respawn=None))
case('flags/unlocks tordus', mk(flags=[1,2,3], unlocks='oui'))
case('version future + champs en plus', mk(v=99, nouveau_champ={'a':1}))
case('data = tableau', [1,2,3])
case('data = chaîne', "bonjour")
case('data = null', None)
case('JSON corrompu', None, raw='{"meta":{"v":4,"level":3},"data":{"v":4,"player":')
case('meta absente', None, raw=json.dumps({"data":base}))
q.done()
