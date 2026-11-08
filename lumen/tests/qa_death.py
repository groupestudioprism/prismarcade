"""Mort et réapparition dans chaque zone des deux îles (clic réel sur « Se relever »)."""
import sys, shutil; sys.path.insert(0,'/home/claude/prismarcade/lumen/tests')
from qa_lib import *
which = sys.argv[1] if len(sys.argv)>1 else 'aube'
if which=='foret':
    shutil.rmtree('/tmp/qa_prof_death', ignore_errors=True); shutil.copytree('/tmp/qa_prof_foret2','/tmp/qa_prof_death')
    q=QA('mort-foret', profile='/tmp/qa_prof_death'); q.load()
    q.js('charger s3',"(async()=>{const sv=await __lumen.G.saves.read('s3');await __lumen.G.startFrom(sv,'s3');await T.tick(800);T.pump();return T.info()})()")
else:
    q=QA('mort-aube'); q.load(); q.js('nouvelle partie',"T.newGame()","play")
zones = q.ev("__lumen.G.zones.map(z=>z.id)")
print(zones)
DEATH = """(async(zid)=>{const L=__lumen;const z=L.G.zones.find(z=>z.id===zid);
  L.tpZone(zid); for(let i=0;i<20&&L.G.zoneId()!==zid;i++)await T.tick(80); await T.tick(600);
  const e0=L.st.player.ecus=500, d0=L.st.stats.deaths, rz=L.st.player.respawn;
  L.st.player.hp=1; L.G.hurtPlayer(500, L.P.x+1, L.P.z, {});
  for(let i=0;i<40&&L.G.screens.current!=='death';i++)await T.tick(100);
  const shown = L.G.screens.current==='death'; const txt=(document.querySelector('#screen')||{}).innerText||'';
  const btn=document.querySelector('#screen [data-a=rise]'); if(btn) btn.click(); await T.tick(500);
  const okPos=L.G.canStand(L.P.x,L.P.z), zid2=L.G.zoneId();
  return JSON.stringify({z:zid,shown,btn:!!btn,deaths:L.st.stats.deaths-d0,ecus:L.st.player.ecus,hpOK:L.st.player.hp>=L.G.stats().maxHp,mode:L.S.mode,alive:L.P.alive,stand:okPos,respZone:rz.zone,landed:zid2,txt:txt.slice(0,70)});
})"""
for z in zones:
    q.js('mort '+z, "(%s)('%s')" % (DEATH, z), lambda r: '"shown":true' in r and '"mode":"play"' in r and '"stand":true' in r and '"alive":true' in r)
# mort pendant un combat de boss
q.js('mort pendant le boss',"""(async()=>{const L=__lumen;const bz=L.G.zones.find(z=>z.spawns&&z.spawns.some(s=>s.boss));L.st.flags.boss_colosse=0;L.st.flags.boss_verre=0;Object.keys(L.st.world.killed).forEach(k=>delete L.st.world.killed[k]);
  L.combat.resetAll();L.tpZone(bz.id,[15,13]);await T.tick(1500);const b=L.combat.enemies.find(e=>e.boss);if(!b)return 'pas de boss '+bz.id;
  L.P.x=b.x+2;L.P.z=b.z;b.hp=b.maxHp*0.4;L.st.player.hp=1;L.G.hurtPlayer(999,b.x,b.z,{});for(let i=0;i<40&&L.G.screens.current!=='death';i++)await T.tick(100);
  document.querySelector('#screen [data-a=rise]').click();await T.tick(800);const nb=L.combat.enemies.find(e=>e.boss);
  return JSON.stringify({zone:L.G.zoneId(),boss:nb?nb.hp+'/'+nb.maxHp:'absent',S_boss:!!L.S.boss,mode:L.S.mode,bar:!!document.querySelector('.boss-bar:not([hidden])')})})()""")
q.done()
