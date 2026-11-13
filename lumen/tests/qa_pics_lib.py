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
    q = QA(name, query="?low&nobloom&ile=pics", **kw); q.load(); prep5(q); return q

TSOL = open(os.path.join(os.path.dirname(__file__), "qa_solutions_pics_timed.json")).read()
HELP5 = r"""
window.TS = %s;
Object.assign(window.T, {
  // planer pour de vrai : chaque pierre de vent, chaque liaison, depuis la case réelle devant la pierre
  async ventsAll(zoneId){ const L=__lumen; const lg=await import('/lumen/js/logic.js'); const zi=L.G.zones.findIndex(z=>z.id===zoneId); const out=[];
    const vents=L.isl.ents.filter(e=>e.t==='vent'&&e.zone===zi);
    for (const v of vents) { for (const l of lg.ventLinks(L.isl,v)) { const [dx,dy]=lg.DIRS[l.dir]; const sx=v.x-dx, sy=v.y-dy;
        if(!L.G.canStand(sx*2,sy*2)) { out.push('pos? '+v.id+' '+l.dir); continue; }
        L.P.x=sx*2; L.P.z=sy*2; L.P.vx=L.P.vz=0; L.P.face=Math.atan2(dx,dy); await T.tick(300);
        const t=L.target(); if(!t||t.kind!=='vent'){ out.push('cible? '+v.id+' '+(t?t.kind:'-')); continue; }
        L.interact(); let n=0; while(L.S.mode==='glide'&&n++<150) await T.tick(100); await T.tick(150);
        const ok = Math.hypot(L.P.x-l.land[0]*2, L.P.z-l.land[1]*2)<0.3 && L.S.mode==='play'; out.push((ok?'ok ':'KO ')+v.id+'->'+l.dir+(ok?'':' pos='+(L.P.x/2).toFixed(1)+','+(L.P.z/2).toFixed(1)+' attendu '+l.land)); } }
    return out.length+' :: '+out.join(' | '); },
  // relais temporisés : rejoue la séquence calculée (temps simulé via mech.tick, en un seul bloc synchrone)
  solveTimed(zoneId){ const L=__lumen; const zi=L.G.zones.findIndex(z=>z.id===zoneId), z=L.G.zones[zi]; const seq=TS[zoneId]; if(!seq) return 'noseq'; let t=0; const log=[];
    L.isl.ents.filter(e=>e.t==='relay'&&e.hold).forEach(e=>{e.heldT=0;e.heldC=null;});
    for (const s of seq) { const dt=s.t-t; for(let a=0;a<dt;a+=0.25) L.mech.tick(Math.min(0.25,dt-a)); t=s.t;
      const e=L.isl.ents.find(x=>x.zone===zi&&x.rot&&x.x===z.ox+s.x&&x.y===z.oy+s.y); if(!e) return 'noent '+s.x+','+s.y; L.set(e.id,s.to); log.push(e.id+'='+s.to); }
    return log.join(' ')+' gates:'+Object.values(L.isl.gates).filter(g=>L.isl.ents.some(x=>x.zone===zi&&x.gate===g.id)||1).filter(g=>g.open).map(g=>g.id).join(','); },
  async roundtrip5(slot){ const L=__lumen; const before=T.snap(); await L.saveTo(slot); const sv=await L.G.saves.read(slot); await L.G.startFrom(sv,slot,false,true); await T.tick(500); T.pump(); const after=T.snap(); if (before===after) return 'identique'; const a=JSON.parse(before), b=JSON.parse(after); return 'DIFF '+Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>k+': '+JSON.stringify(a[k]).slice(0,120)+' -> '+JSON.stringify(b[k]).slice(0,120)).join(' ## '); },
  gate(id){ return !!__lumen.isl.gates[id].open; },
});
""" % TSOL

def prep5(q):
    q.ev(HELP5)
