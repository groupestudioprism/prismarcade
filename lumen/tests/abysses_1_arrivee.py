"""Acte IV — arrivée aux Abysses (nouvelle partie directe), village, PNJ, boutiques, auberge, ciblage depuis de vraies positions."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import QA

q = QA("abysses-arrivee")
q.load("&ile=abysses")
q.js("arrivée par voyage", "T.arrive()", "play")
q.js("île et zone", "T.info()", lambda r: '"isl":"abysses"' in r or 'greve' in r or 'auberge_a' in r)
q.js("quête principale lancée", "T.q('q_abysses')", "active:parler")
q.js("capacité orbe absente au départ", "!!__lumen.st.player.abilities.orbe", lambda r: r is False)
q.js("zones", "__lumen.G.zones.map(z=>z.id).join(',')")
q.js("pas d'erreur de vue", "Object.values(__lumen.world.views).filter(v=>['pool','valve','socle','ledge'].includes(v.e.t)).length", lambda r: r >= 30)
# PNJ du village : on se place près de chacun et on vérifie la cible réelle
for n in ["maree", "corail", "nacre", "varech", "isoard", "ecume", "petoncle", "murene", "lagon"]:
    q.js("cible PNJ " + n, "(async()=>{ __lumen.tpZone('greve'); await T.tick(300); return await T.near('%s') })()" % n, "ok")
q.js("auberge : sargasse", "(async()=>{ __lumen.tpZone('auberge_a'); await T.tick(300); return await T.near('sargasse') })()", "ok")
# dialogue d'ouverture : Marée donne l'orbe et ouvre les ponts
q.js("dialogue Marée", "(async()=>{ __lumen.tpZone('greve'); await T.tick(200); return await T.talkTo('maree') })()")
q.js("orbe apprise", "!!__lumen.st.player.abilities.orbe", lambda r: r is True)
q.js("ponts ouverts", "[__lumen.isl.gates.b_lac.open,__lumen.isl.gates.b_recifs.open].join()", "true,true")
q.js("étape suivante", "T.q('q_abysses')", "active:lac")
for s in ["corail", "nacre", "varech", "lagon"]:
    q.js("boutique " + s, "T.shopBuy('%s')" % s)
q.js("repos auberge", "(async()=>{ __lumen.tpZone('auberge_a'); await T.tick(300); return await T.talkTo('sargasse') })()")
q.js("repère de repos", "JSON.stringify(__lumen.st.player.respawn)", "auberge_a")
q.done()
