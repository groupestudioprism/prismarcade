"""Acte IV — le lac souterrain : audit de ciblage de chaque objet, puis résolution des trois salles par de vraies interactions."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import QA

q = QA("abysses-lac")
q.load("&ile=abysses")
q.js("arrivée", "T.arrive()", "play")
q.js("parler à Marée (orbe + ponts)", "(async()=>{ __lumen.tpZone('greve'); await T.tick(200); return await T.talkTo('maree') })()")
for z in ["lac1", "lac2", "lac3"]:
    q.js("audit de ciblage " + z, "(async()=>{ __lumen.tpZone('%s'); await T.tick(300); return await T.auditDevices('%s') })()" % (z, z), lambda r: '"ko":[]' in r)
for g, z in [("la1", "lac1"), ("la2", "lac2"), ("la3", "lac3")]:
    q.js("résolution " + g, "(async()=>{ __lumen.tpZone('%s'); await T.tick(300); return await T.realSolve('%s') })()" % (z, g), lambda r: '"open":true' in r)
q.js("pont vers les Grottes", "__lumen.isl.gates.la3.open", lambda r: r is True)
q.js("quête : Grottes lancée", "T.q('q_grottes')", "active")
q.js("sauvegarde et rechargement", "T.roundtrip('auto')", "identique")
q.js("orbe conservée à la sauvegarde", "JSON.stringify([__lumen.isl.orb.at, __lumen.isl.orb.dir])", "l3_s1")
q.done()
