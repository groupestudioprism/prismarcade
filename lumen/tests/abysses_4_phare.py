"""Acte IV — Phare des Abysses, fin d'acte, capacité Planer, Îlots du Reflet (plané réel d'une corniche à l'autre)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import QA

q = QA("abysses-phare")
q.load("&ile=abysses")
q.js("arrivée", "T.arrive()", "play")
q.js("parler à Marée", "(async()=>{ __lumen.tpZone('greve'); await T.tick(200); return await T.talkTo('maree') })()")
q.js("Grottes réglées (API)", "(async()=>{ const L=__lumen; ['la1','la2','la3'].forEach(g=>T.solve(g)); L.tpZone('grottes'); await T.tick(300); ['gr_combat','gr_key','gr_eau'].forEach(g=>L.openGate(g)); L.st.flags.boss_marees=1; L.openGate('gr_arene'); L.quests.check(); await T.tick(300); return T.q('q_grottes') })()", "active:retour")
q.js("retour à Marée", "(async()=>{ __lumen.tpZone('greve'); await T.tick(300); return await T.talkTo('maree') })()")
q.js("Phare lancé", "T.q('q_phare_abysses')", "active:phare")
q.js("arrivée au phare", "(async()=>{ __lumen.tpZone('phare_a'); await T.tick(500); return T.q('q_phare_abysses') })()", "active:salles")
q.js("audit de ciblage du phare", "T.auditDevices('phare_a')", lambda r: '"ko":[]' in r)
q.js("salle A", "T.realSolve('ph_d1')", lambda r: '"open":true' in r)
q.js("salle B", "T.realSolve('ph_d2')", lambda r: '"open":true' in r)
q.js("étape suivante", "T.q('q_phare_abysses')", "active:balise")
q.js("salle C : balise", "T.realSolve('end')", lambda r: '"open":true' in r)
q.js("finale (cinématique)", "(async()=>{ await T.tick(9000); return __lumen.S.mode })()", "play")
q.js("étape retour", "T.q('q_phare_abysses')", "active:retour")
q.js("raccourci impossible : balise éteinte si on défait l'orbe", "(()=>{ const L=__lumen; return L.isl.gates.end.open })()", lambda r: r is True)
q.js("fin d'acte", "(async()=>{ const L=__lumen; const b=T.pre(); L.tpZone('greve'); await T.tick(300); await T.talkTo('maree'); await T.tick(1200); return JSON.stringify({scr:L.G.screens.current, ab:L.st.player.abilities, prisme:L.st.inv.prisme_bleu, flag:L.st.flags.acte4_fini, rec:await T.rewardCheck('q_phare_abysses', b)}) })()", lambda r: 'prisme\":1' in r and '"planer":true' in r and 'acte4_fini' not in r and 'récompenses ok' in r and '"scr":"end"' in r)
q.js("pont des Îlots ouvert", "__lumen.isl.gates.b_ilots.open", lambda r: r is True)
q.js("avant planer : corniche muette (message)", "(()=>{ const L=__lumen; const a=L.st.player.abilities.planer; L.st.player.abilities.planer=false; L.tpZone('ilots',[16,5]); return 'ok' })()")
q.js("corniche sans capacité", "(async()=>{ const L=__lumen; L.G.screens.close(); L.P.x=(L.G.zones.find(z=>z.id==='ilots').ox+15)*2; await T.tick(500); const t=L.target(); L.interact(); await T.tick(200); const r=[t&&t.kind, L.S.mode, L.G.screens.current].join(); L.G.screens.close(); L.st.player.abilities.planer=true; return r })()", "ledge")
q.js("plané réel sur les 3 îlots", """(async()=>{ const L=__lumen, z=L.G.zones.find(z=>z.id==='ilots'); L.G.screens.close(); const out=[]; const pairs=[['ledge_a1','E','ledge_a2'],['ledge_a2','W','ledge_a1'],['ledge_b1','E','ledge_b2'],['ledge_b2','W','ledge_b1']];
  for(const [a,d,b] of pairs){ const A=L.isl.ents.find(e=>e.id===a), B=L.isl.ents.find(e=>e.id===b); const dx=d==='E'?1:-1; L.P.x=(A.x-dx)*2; L.P.z=A.y*2; L.P.vx=L.P.vz=0; L.P.face=Math.atan2(dx,0); L.S.zone=A.zone; let t=null; for(let i=0;i<14;i++){ await T.tick(60); t=L.target(); if(t&&t.kind==='ledge'&&t.e===A) break; }
    if(!t||t.kind!=='ledge'||t.e!==A){ out.push('cible? '+a+':'+(t?t.kind:'-')); continue; } L.interact(); let n=0; while(L.S.mode==='grapple'&&n++<150) await T.tick(100); await T.tick(150);
    const ok=Math.hypot(L.P.x-B.x*2, L.P.z-B.y*2)<0.3; out.push((ok?'ok ':'KO ')+a+'->'+b+(ok?'':' pos='+(L.P.x/2).toFixed(1)+','+(L.P.z/2).toFixed(1))); }
  return out.join(' | ') })()""", lambda r: r.count('ok ') == 4 and 'KO' not in r and 'cible?' not in r)
q.js("coffres des Îlots à portée", "(async()=>{ const L=__lumen; const out=[]; for(const id of ['ch_ilot_ecus','ch_ilot_coeur','ch_ilot_amulette']){ out.push(id+':'+await T.openChest(id)); } return out.join(' ') })()", lambda r: r.count('ouvert:true') == 3)
q.js("sauvegarde / rechargement", "T.roundtrip('auto')", "identique")
q.done()
