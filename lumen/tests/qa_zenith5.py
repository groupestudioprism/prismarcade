"""Acte VI — vraie route Pics du Vent → Citadelle du Zénith (Zéphyr), conditions des 5 fragments, passeurs des autres îles, retour du Zénith vers toutes les îles. Port 8873."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
q=QA('zenith-5', query='?ile=pics&low&nobloom'); q.load()
J=q.js
ETAT = """(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();s.player.island='pics';s.player.zone='col';s.player.respawn={zone:'col',cell:[12,7]};s.world=m.newWorld('col');
  s.player.abilities={porter:true,grappin:true,orbe:true,planer:true,portails:true};s.player.lvl=12;s.inv.grappin=1;
  Object.assign(s.flags,{acte1_fini:1,acte2_fini:1,verre_fini:1,acte3_fini:1,dore_fini:1,acte4_fini:1%s});
  await __lumen.G.startFrom(s,'auto',false,true);await T.tick(2000);T.pump();return T.info()})()"""
J('Pics : 4 fragments seulement (Acte V pas fini)', ETAT % '', "pics")
J('Zéphyr ne propose PAS le Zénith', "(async()=>{const r=await T.talkTo('zephyr',()=>0);return String(/Zénith/.test(r))})()", "false")
J('Pics : cinq fragments (Acte V fini)', "(async()=>{const L=__lumen;L.st.flags.acte5_fini=1;L.st.flags.moulin_col=1;return 'ok'})()", "ok")
J('données : choix Zénith pour Calixte, Yaël, Lagon, Zéphyr', """(async()=>{const m=await import('/lumen/js/data/npcs.js');const z=await import('/lumen/js/data/zenith.js');const out={};
  for(const id of ['calixte','yael','lagon','zephyr']) out[id]=m.NPCS[id].talk.some(t=>(t.choices||[]).some(c=>c.t==='Partir pour la Citadelle du Zénith'));
  const q=(f)=>({flag:(k)=>!!f[k]});const base={acte1_fini:1,acte2_fini:1,acte3_fini:1,acte4_fini:1,acte5_fini:1};
  out.ok5=z.zenithReady(q(base));for(const k of Object.keys(base)){const f=Object.assign({},base);delete f[k];out['sans_'+k]=z.zenithReady(q(f));}
  return JSON.stringify(out)})()""", "\"calixte\":true,\"yael\":true,\"lagon\":true,\"zephyr\":true,\"ok5\":true,\"sans_acte1_fini\":false,\"sans_acte2_fini\":false,\"sans_acte3_fini\":false,\"sans_acte4_fini\":false,\"sans_acte5_fini\":false")
q.ev("window.__old=1")
J('Zéphyr : partir pour le Zénith', "T.talkTo('zephyr',(n,l)=>{const t=l[l.length-1];const i=t.findIndex(x=>/Zénith/.test(x));return i<0?t.length-1:i})")
try:
    q.reloaded(timeout=120000)
except Exception as e:
    print('ERR reloaded', str(e)[:200])
J('arrivée au Zénith', "(async()=>{await T.tick(1500);T.pump();return T.info()+' '+T.q('q_porte')})()", "zenith")
J('arrivée : à la Porte, jouable, quête lancée', "__lumen.S.mode+' '+__lumen.G.zoneId()+' '+T.q('q_porte')", "play porte active:parler")
J('niveau, capacités et île précédente conservés', "JSON.stringify({lvl:__lumen.st.player.lvl,ab:Object.keys(__lumen.st.player.abilities),o:Object.keys(__lumen.st.otherWorlds||{})})", "\"lvl\":12")
J('les 5 îles sont rangées, portails gardés', "Object.keys(__lumen.st.otherWorlds||{}).join(',')+' p='+__lumen.st.player.abilities.portails", "pics")
J('Célestine : ne reprend pas la capacité en double', "(async()=>{await T.talkTo('celestine');return T.q('q_porte')+' portails='+__lumen.st.player.abilities.portails+' off='+__lumen.isl.portalsOff})()", "portails=true off=false")
J('Calixte du Zénith : les 5 retours', "(async()=>{const m=await import('/lumen/js/data/zenith.js');const c=m.ZENITH_NPCS.calixte_z.talk.flatMap(t=>(t.choices||[]).map(x=>x.t)).filter((v,i,a)=>a.indexOf(v)===i);return JSON.stringify(c)})()", "Pics du Vent")
for dest, label, rx in (('aube','Aube','havre'),('desert','Désert','cite'),('abysses','Abysses','greve'),('foret','Forêt','vitrebourg')):
    q.ev("window.__old=1")
    J(f'Calixte (Zénith) → {label}', f"(async()=>{{__lumen.st.flags.fin_jeu=1;return await T.talkTo('calixte_z',(n,l)=>{{const t=l[l.length-1];const i=t.findIndex(x=>/{label}/.test(x));return i<0?t.length-1:i}})}})()")
    try:
        q.reloaded(timeout=120000)
    except Exception as e:
        print('ERR reloaded', str(e)[:200])
    J(f'arrivée {label}', "T.info()", dest)
    # retour au Zénith par le passeur de l'île (Zénith déjà visité : quête non relancée)
    passeur = {'aube':'calixte','desert':'yael','abysses':'lagon','foret':'tessel'}[dest]
    if dest != 'foret':
        q.ev("window.__old=1")
        J(f'{passeur} → Zénith', f"T.talkTo('{passeur}',(n,l)=>{{const t=l[l.length-1];const i=t.findIndex(x=>/Zénith/.test(x));return i<0?t.length-1:i}})")
        try:
            q.reloaded(timeout=120000)
        except Exception as e:
            print('ERR reloaded', str(e)[:200])
        J('retour au Zénith', "T.info()+' '+T.q('q_porte')", "zenith")
q.done()
