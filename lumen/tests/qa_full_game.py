"""PARCOURS COMPLET en une seule partie : Aube -> Forêt -> Désert -> Abysses -> Pics -> Zénith -> écran de fin.
Réels : nouvelle partie, dialogues de fin d'acte, voyages par les passeurs (Calixte, Tessel, Yaël, Lagon, Zéphyr), chargements d'île, sauvegarde,
rechargement de la page + bouton « Continuer » entre chaque île, résolution des énigmes du phare, écran de fin et pourcentages.
Fabriqués (API autorisée) : l'avancement de l'île avant la scène du phare (quêtes précédentes, portes, boss, objets pris par les PNJ).
Lancer : flock /tmp/lumen-chrome.lock timeout 900 python3 -u qa_full_game.py   (port 8873 ; ?low&nobloom ; 640x360)"""
import sys, os, shutil, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *
PROF = '/tmp/qa_prof_fullgame6'; shutil.rmtree(PROF, ignore_errors=True)
q = QA('partie-complete', profile=PROF); q.load()
J = q.js
EXTRA = r"""
window.FG = {
  // avancement fabriqué d'une île jusqu'à « juste avant la scène du phare » : quêtes principales précédentes finies, portes ouvertes, boss vaincu, objets que les PNJ reprennent
  async prep(chain, given){ const L=__lumen, Q=(await import('/lumen/js/data/quests.js')).QUESTS, mine=Object.keys(Q).filter(k=>Q[k].kind==='main'&&(Q[k].island||'aube')===L.st.player.island);
    for (const k of mine) { if (chain.includes(k)) continue; if (L.st.quests[k]?.state!=='done') L.st.quests[k]={state:'done',step:Q[k].steps.length,base:{kills:L.st.stats.kills}}; }
    for (const [id,n] of Object.entries(given||{})) L.give(id,n);
    for (const g of Object.keys(L.isl.gates)) if (g!=='end' && !L.isl.gates[g].open) L.openGate(g,false);
    L.st.flags[L.G.meta.boss]=1;
    // butin à moitié ramassé (éclats, lueurs, pages, coffres) : la complétion recalculée hors de l'île doit rester égale à celle de l'île vivante
    L.isl.ents.filter(e=>['shard','wisp','page'].includes(e.t)).forEach((e,i)=>{ if(i%2===0) L.st.world.picked[e.id]=1; });
    Object.keys(L.world.chestViews).forEach((c,i)=>{ if(i%2===0) L.st.world.chests[c]=1; });
    return 'ok'; },
  // quête fabriquée à sa dernière étape (« retour : parler à… ») puis VRAI dialogue
  async finalTalk(k){ const L=__lumen, Q=(await import('/lumen/js/data/quests.js')).QUESTS, qd=Q[k], last=qd.steps[qd.steps.length-1];
    L.st.quests[k]={state:'active',step:qd.steps.length-1,base:{kills:L.st.stats.kills}}; L.quests.check();
    const r=await T.talkTo(last.npc); await T.tick(900); return k+' -> '+T.q(k)+' npc='+last.npc; },
  closeEnd(){ const b=document.querySelector('#screen .end-card [data-a=close]'); if(!b) return 'pas d’écran de fin d’acte'; const t=document.querySelector('#screen .end-card').innerText; b.click(); return t.toLowerCase().replace(/\n+/g,' | '); },
  pct(){ const L=__lumen; return JSON.stringify({isl:L.st.player.island,live:L.completion(),all:L.G.completionAll()}); },
};
"""
q.ev(EXTRA)

def refresh():
    q.ev(EXTRA)

def travel(npc, rx, dest, label):
    q.ev("window.__old=1")
    q.js(f'{npc} : partir pour {label}', f"T.talkTo('{npc}',(n,l)=>{{const t=l[l.length-1];const i=t.findIndex(x=>/{rx}/.test(x));return i<0?t.length-1:i}})")
    try:
        q.reloaded(timeout=150000)
    except Exception as e:
        print('ERR chargement de l\'île', str(e)[:200]); q.results.append(('chargement '+dest, 'ERR', str(e)[:200]))
    refresh()
    J(f'arrivée : {label}', "(async()=>{await T.tick(1200);T.pump();return T.info()})()", dest)

def save_reload_continue(label):
    """sauvegarde réelle, rechargement de la page, bouton « Continuer » du titre : l'état doit être identique"""
    before = q.ev("(async()=>{await __lumen.saveTo('s1');return T.snap()})()")
    q.pg.reload(wait_until="load"); q.pg.wait_for_function("window.__lumen && __lumen.S", timeout=60000); q.prep(); refresh()
    ok = q.pg.evaluate("(async()=>{for(let i=0;i<80;i++){const b=document.querySelector('[data-a=continue]');if(b){b.click();return 'clic'}await new Promise(r=>setTimeout(r,250))}return 'pas de bouton Continuer'})()")
    q.pg.wait_for_function("__lumen.S.mode==='play'", timeout=90000, polling=300); q.pg.wait_for_timeout(800); q.ev("T.pump()"); refresh()
    after = q.ev("T.snap()")
    a, b = json.loads(before), json.loads(after)
    diff = [k for k in a if json.dumps(a[k], sort_keys=True) != json.dumps(b[k], sort_keys=True)]
    q.results.append((f'sauvegarde + rechargement + Continuer ({label})', 'OK' if (ok == 'clic' and not diff) else 'FAIL', f'{ok} diff={diff}')); print(('OK   ' if not diff and ok == 'clic' else 'FAIL ') + f'sauvegarde + rechargement + Continuer ({label}) {ok} diff={diff}', flush=True)

PCT = {}
def record(isl):
    r = json.loads(q.ev("FG.pct()")); PCT[isl] = r
    q.results.append((f'complétion {isl}', 'OK' if r['live'] == next(i['pct'] for i in r['all']['islands'] if i['id'] == isl) else 'FAIL', json.dumps(r)[:200]))
    print(('OK   ' if q.results[-1][1] == 'OK' else 'FAIL ') + f'complétion {isl} (île courante : live == bilan)', json.dumps(r)[:240], flush=True)

def act(isl, chain, given, solve_msg, kill=False):
    J(f'{isl} : avancement fabriqué', f"FG.prep({json.dumps(chain)}, {json.dumps(given)})", "ok")
    J(f'{isl} : scène du phare (vraie énigme finale)', "(async()=>{const L=__lumen;L.tpZone(L.G.zones.find(z=>/^phare/.test(z.id)).id);await T.tick(900);const r=T.solve('end');for(let i=0;i<200&&L.S.mode!=='play';i++)await T.tick(100);return r+' mode='+L.S.mode+' fin='+L.isl.gates.end.open})()", "true mode=play")
    for k in chain:
        J(f'{isl} : dialogue de fin {k}', f"FG.finalTalk('{k}')", f"{k} -> done")
    t = J(f'{isl} : écran de fin d\'acte', "(async()=>{await T.tick(800);return FG.closeEnd()})()", solve_msg)
    bad = 'bientôt' in str(t).lower()
    q.results.append((f'{isl} : écran de fin sans « bientôt »', 'FAIL' if bad else 'OK', str(t)[-120:])); print(('FAIL ' if bad else 'OK   ') + f'{isl} : écran de fin sans « bientôt »', flush=True)

# ---------------------------------------------------------------- Acte I : Aube
J('nouvelle partie (réelle)', "T.newGame()", "play")
J('Séléné (vrai dialogue)', "T.talkTo('selene')")
act('aube', ['q_phare'], {'lentille': 1}, "acte 1 terminé")
record('aube')
save_reload_continue('Aube')
J('Aube : flag acte1_fini + Calixte propose la Forêt, pas le Zénith', "(async()=>{const r=await T.talkTo('calixte');return String(__lumen.st.flags.acte1_fini)+' zenith='+/Zénith/.test(r)})()", "1 zenith=false")
travel('calixte', 'Forêt', 'foret', 'la Forêt de Verre')
# ---------------------------------------------------------------- Acte II : Forêt
J('Forêt : première quête', "T.q('q_verre')", "active")
act('foret', ['q_verre', 'q_phare_verre'], {'prisme_vert': 1}, "acte 2 terminé")
record('foret'); save_reload_continue('Forêt')
travel('tessel', 'Désert', 'desert', 'le Désert des Échos')
# ---------------------------------------------------------------- Acte III : Désert
J('Désert : première quête', "T.q('q_echos')", "active")
act('desert', ['q_temple', 'q_phare_sable'], {'prisme_dore': 1}, "acte 3 terminé")
record('desert'); save_reload_continue('Désert')
travel('yael', 'Abysses', 'abysses', 'les Abysses Miroirs')
# ---------------------------------------------------------------- Acte IV : Abysses
J('Abysses : première quête', "T.q('q_abysses')", "active")
act('abysses', ['q_grottes', 'q_phare_abysses'], {}, "acte 4 terminé")
record('abysses'); save_reload_continue('Abysses')
travel('lagon', 'Pics', 'pics', 'les Pics du Vent')
# ---------------------------------------------------------------- Acte V : Pics
J('Pics : première quête', "T.q('q_pics')", "active")
act('pics', ['q_moulins', 'q_phare_vents'], {'coeur_moulin': 1}, "citadelle du zénith")
J('Pics : capacité portails (Borée) + 5 fragments', "JSON.stringify({p:__lumen.st.player.abilities.portails,fl:['acte1_fini','acte2_fini','verre_fini','acte3_fini','dore_fini','acte4_fini','acte5_fini'].map(k=>__lumen.st.flags[k]?1:0).join('')})", "\"p\":true,\"fl\":\"1111111\"")
record('pics'); save_reload_continue('Pics')
J('Pics : Zéphyr propose le Zénith', "(async()=>{const r=await T.talkTo('zephyr');return String(/Zénith/.test(r))})()", "true")
travel('zephyr', 'Zénith', 'zenith', 'la Citadelle du Zénith')
# ---------------------------------------------------------------- Acte VI : Zénith
J('Zénith : première quête', "T.q('q_porte')", "active")
J('Zénith : Célestine (vrai dialogue)', "(async()=>{await T.talkTo('celestine');return T.q('q_porte')+' portails='+__lumen.st.player.abilities.portails+' off='+__lumen.isl.portalsOff})()", "portails=true off=false")
J('Zénith : avancement fabriqué', "FG.prep(['q_zenith','q_epilogue'], {})", "ok")
J('Zénith : étapes du phare (vraies énigmes)', "(async()=>{const L=__lumen;L.tpZone('phare_z');await T.tick(1200);const a=T.solve('ph_d1');await T.tick(400);const b=T.solve('ph_d2');await T.tick(400);return a+' '+b+' '+T.q('q_zenith')})()", "true true active:six")
record('zenith')
save_reload_continue('Zénith (avant la fin)')
J('Zénith : sauvegarde de pourcentages avant la fin', "FG.pct()")
J('Zénith : balise finale -> cinématique', "(async()=>{const L=__lumen;L.tpZone('phare_z');await T.tick(900);const r=T.solve('end');await T.tick(1500);return r+' mode='+L.S.mode})()", "mode=ending")
J('Zénith : passer la scène, bilan', "(async()=>{document.querySelector('#fin .skip').click();let n=0;while(__lumen.fin.phase!=='bilan'&&n++<150)await T.tick(100);return __lumen.fin.phase+' fin_jeu='+__lumen.st.flags.fin_jeu})()", "bilan fin_jeu=1")
final = q.js('Écran de fin : 6 îles et pourcentages réels', "(()=>{const c=document.querySelector('#fin .card');const rows=[...c.querySelectorAll('.isl span')].map(s=>s.textContent);const all=__lumen.G.completionAll();return JSON.stringify({rows,all:all.islands.map(i=>i.name+'|'+i.pct+' %'),total:all.total,txt:c.innerText.slice(0,160)})})()")
try:
    d = json.loads(final)
    exp = []
    for i in d['all']:
        n, p = i.split('|'); exp += [n, p]
    q.results.append(('bilan : 12 cellules = 6 îles x (nom, %)', 'OK' if d['rows'] == exp and len(d['rows']) == 12 else 'FAIL', str(d['rows'])))
    print('OK   ' if d['rows'] == exp and len(d['rows']) == 12 else 'FAIL ', 'bilan : lignes affichées == completionAll()', d['rows'], flush=True)
    for isl, r in PCT.items():
        if isl == 'zenith': continue   # l'île en cours a progressé depuis (fin d'acte) : comparée à part
        got = next(i['pct'] for i in json.loads(q.ev("JSON.stringify(__lumen.G.completionAll())"))['islands'] if i['id'] == isl)
        ok = got == r['live']
        q.results.append((f'pourcentage {isl} conservé au bilan', 'OK' if ok else 'FAIL', f'quitté à {r["live"]} % / bilan {got} %')); print('OK   ' if ok else 'FAIL ', f'pourcentage {isl}: quitté à {r["live"]} %, au bilan {got} %', flush=True)
except Exception as e:
    print('ERR analyse bilan', e); q.results.append(('analyse bilan', 'ERR', str(e)))
J('zénith : live == bilan après la fin', "(()=>{const L=__lumen;const z=L.G.completionAll().islands.find(i=>i.id==='zenith').pct;return L.completion()+'='+z})()", lambda r: r.split('=')[0] == r.split('=')[1])
J('générique', "(()=>{document.querySelector('#fin [data-a=credits]').click();return document.querySelector('#fin .credits')?'credits':'rien'})()", "credits")
q.tick(1500)
J('jeu libre', "(async()=>{document.querySelector('#fin [data-a=free]').click();await T.tick(2500);return __lumen.S.mode})()", "play")
save_reload_continue('après la fin')
J('après la fin : fin_jeu conservé, Célestine propose de revoir la fin', "(async()=>{const r=await T.talkTo('celestine');return String(__lumen.st.flags.fin_jeu)+' '+/Revoir la scène/.test(r)})()", "1 true")
travel('calixte_z', 'Aube', 'aube', 'l\'Île de l\'Aube (retour)')
J('Aube : progression conservée', "JSON.stringify({a1:__lumen.st.flags.acte1_fini,q:T.q('q_phare'),fin:__lumen.st.flags.fin_jeu})", "\"a1\":1")
travel('calixte', 'Zénith', 'zenith', 'la Citadelle du Zénith (retour)')
J('Zénith (2e visite) : fin conservée, rien relancé', "T.q('q_porte')+' '+T.q('q_epilogue')+' fin='+__lumen.st.flags.fin_jeu", "done")
q.done()
