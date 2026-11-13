"""Acte V — fumée : arrivée, zones (port 8872)."""
from qa_pics_lib import *
q = new('pics-fumée'); J = q.js
arrive(q)
J('quête principale', "T.q('q_pics')", "active")
J('zones', "JSON.stringify(__lumen.G.zones.map(z=>z.id))")
J('PNJ', "__lumen.npcs.map(n=>n.id).join(',')")
J('tp zones', """(async()=>{const L=__lumen;const o=[];for(const z of L.G.zones){L.tpZone(z.id);await T.tick(500);o.push(z.id+':'+L.S.mode)}return o.join(' ')})()""")
q.done()
