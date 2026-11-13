"""Acte V : aides communes aux tests des Pics du Vent (port 8872)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("QA_PORT", "8872")
from qa_lib import *

ARRIVE = """(async()=>{const m=await import('/lumen/js/game/state.js');const s=m.newState();
 s.player.island='pics';s.player.zone='col';s.player.x=null;s.player.z=null;s.player.lvl=%d;
 s.player.abilities={onde:true,grappin:true};s.flags.acte1_fini=1;s.flags.acte2_fini=1;
 s.inv.grappin=1;s.inv.potion=5;s.world=m.newWorld('col');s.player.ecus=%d;
 await __lumen.G.startFrom(s,'t5',false,true);await T.tick(900);T.pump();return T.info()})()"""

def arrive(q, lvl=12, ecus=400):
    return q.js('arrivée aux Pics', ARRIVE % (lvl, ecus), "col")

def new(name, **kw):
    q = QA(name, query='?low&nobloom&ile=pics', **kw); q.load(); return q
