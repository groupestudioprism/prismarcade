Object.assign(window.T, {
  heal(){ const L=__lumen; L.st.player.hp = L.G.stats().maxHp; L.st.player.en = L.G.stats().maxEn; },
  npc(id){ return __lumen.npcs.find(n=>n.id===id); },
  // se place à côté d'un PNJ comme un joueur, attend la mise à jour de la cible, renvoie la cible
  async near(id){ const L=__lumen, n=T.npc(id); if(!n) return 'nonpc:'+id;
    L.tpZone(L.world ? L.G.zones[n.zi].id : null, [ (n.x/2) - L.G.zones[n.zi].ox, (n.z/2) - L.G.zones[n.zi].oy + 0.9 ]);
    for (const [dx,dz] of [[0,1.4],[0,-1.4],[1.4,0],[-1.4,0],[0.9,0.9],[-0.9,0.9]]) { if (L.G.canStand(n.x+dx, n.z+dz)) { L.P.x=n.x+dx; L.P.z=n.z+dz; break; } }
    L.P.vx=L.P.vz=0; L.S.mode==='play'||0;
    for (let i=0;i<30;i++){ await T.tick(60); const t=L.target(); if (t && t.kind==='npc' && t.n.id===id) return 'ok'; }
    const t=L.target(); return 'cible:'+(t?t.kind+':'+(t.n?t.n.id:t.label):'aucune'); },
  async talkTo(id, pick){ const r = await T.near(id); const L=__lumen; if (r!=='ok') { L.G.screens.dialog(id); } else L.interact(); await T.tick(80); const p = T.pump(pick); return JSON.stringify({near:r, ...p}); },
  async cutAndKill(types, maxMs){ const L=__lumen,c=L.combat; const t0=Date.now(); let k=0;
    while (Date.now()-t0 < (maxMs||20000)) { const e=c.enemies.find(x=>x.state!=='dead' && (!types||(typeof types==='function'?types(x):types.includes(x.type)))); if(!e) break;
      L.st.player.hp=9999; L.P.x=e.x; L.P.z=e.z+1.3; L.P.face=Math.PI; k+=c.melee({mult:1}); await T.tick(100); }
    return k; },
});
Object.assign(window.T, {
  chestView(id){ return Object.values(__lumen.world.chestViews).find(cv=>cv.c.id===id); },
  // ouvre un coffre en passant par la vraie cible d'interaction
  async openChest(id){ const L=__lumen, cv=T.chestView(id); if(!cv) return 'nochest:'+id; if(!cv.g.visible) return 'invisible';
    const cx=cv.x*2, cz=cv.y*2; const dbg=[];
    for (const [dx,dz] of [[0,2],[0,-2],[2,0],[-2,0],[1.5,1.5],[-1.5,1.5],[1.5,-1.5],[-1.5,-1.5],[0,1.4],[1.4,0]]) { if (!L.G.canStand(cx+dx, cz+dz)) continue; L.P.x=cx+dx; L.P.z=cz+dz; L.P.vx=L.P.vz=0; L.st.player.hp=Math.max(L.st.player.hp,50);
      for (let i=0;i<12;i++){ await T.tick(60); const t=L.target(); if (t && t.kind==='chest' && t.cv.c.id===id) { L.interact(); await T.tick(700); return 'ouvert:'+!!L.st.world.chests[id]; } }
      const t=L.target(); dbg.push([dx,dz,t?t.kind:'-'].join(':')); }
    return 'cible:aucune zone='+L.S.zone+'/'+cv.zi+' mode='+L.S.mode+' alive='+L.P.alive+' essais='+dbg.join(';'); },
  async newGame(){ const L=__lumen; await L.G.startFrom(null,'auto'); await T.tick(1000); T.pump(); await T.tick(200); return L.S.mode; },
  async useTarget(kind, x, z){ const L=__lumen; L.P.x=x; L.P.z=z; for (let i=0;i<30;i++){ await T.tick(60); const t=L.target(); if (t && t.kind===kind) { L.interact(); await T.tick(300); return 'ok:'+t.label; } } const t=L.target(); return 'cible:'+(t?t.kind+':'+t.label:'aucune'); },
  async fightBoss(maxMs){ const L=__lumen,c=L.combat; const b=c.enemies.find(e=>e.boss); if(!b) return 'noboss'; const log=[]; const t0=Date.now(); let ph=1; const states=new Set();
    while (b.state!=='dead' && Date.now()-t0 < (maxMs||60000)) { L.st.player.hp = 9999; if (b.hp < b.maxHp*0.5) {} L.P.x=b.x+ (b.def.radius||1.5)+0.4; L.P.z=b.z; L.P.face=-Math.PI/2; c.melee({mult:1}); states.add(b.state+':p'+b.phase); await T.tick(130); }
    return JSON.stringify({dead:b.state==='dead', phase:b.phase, states:[...states], ms:Date.now()-t0}); },
});
Object.assign(window.T, {
  snap(){ const L=__lumen, s=L.st; return JSON.stringify({q:Object.fromEntries(Object.entries(s.quests).map(([k,v])=>[k,v.state+':'+v.step])),f:Object.keys(s.flags).sort(),inv:s.inv,eq:s.equip,gates:Object.keys(s.world.gates).sort().length,picked:Object.keys(s.world.picked).length,chests:Object.keys(s.world.chests).length,cut:Object.keys(s.world.cut).length,ecus:s.player.ecus,lvl:s.player.lvl,xp:s.player.xp,frag:s.player.fragments,isl:s.player.island,unl:Object.keys(s.unlocks).sort(),gear:s.gear,seen:Object.keys(s.seen).length,shops:s.shops}); },
  async roundtrip(slot){ const L=__lumen; const before=T.snap(); await L.saveTo(slot); const sv=await L.G.saves.read(slot); await L.G.startFrom(sv,slot); await T.tick(500); T.pump(); const after=T.snap(); if (before===after) return 'identique'; const a=JSON.parse(before), b=JSON.parse(after); const diff=Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>k+': '+JSON.stringify(a[k]).slice(0,120)+' -> '+JSON.stringify(b[k]).slice(0,120)); return 'DIFF '+diff.join(' ## '); },
});
Object.assign(window.T, {
  // saute vraiment avec le grappin : pour chaque poteau et chaque liaison
  async hookAll(zoneId){ const L=__lumen; const lg=await import('/lumen/js/logic.js'); const zi=L.G.zones.findIndex(z=>z.id===zoneId); const posts=L.isl.ents.filter(e=>e.t==='post'&&e.zone===zi); const out=[];
    for (const p of posts) { for (const l of lg.postLinks(L.isl,p)) { const [dx,dy]=lg.DIRS[l.dir]; const sx=p.x-dx, sy=p.y-dy;
        if(!L.G.canStand(sx*2,sy*2)) { out.push('pos? '+p.id+' '+l.dir); continue; }
        L.P.x=sx*2; L.P.z=sy*2; L.P.vx=L.P.vz=0; L.P.face=Math.atan2(dx,dy); await T.tick(250);
        const t=L.target(); if(!t||t.kind!=='post'){ out.push('cible? '+p.id+' '+(t?t.kind:'-')); continue; }
        L.interact(); let n=0; while(L.S.mode==='grapple'&&n++<100) await T.tick(100); await T.tick(150);
        const ok = Math.hypot(L.P.x-l.land[0]*2, L.P.z-l.land[1]*2)<0.3; out.push((ok?'ok ':'KO ')+p.id+'->'+l.dir+(ok?'':' pos='+(L.P.x/2).toFixed(1)+','+(L.P.z/2).toFixed(1)+' attendu '+l.land)); } }
    return out.join(' | '); },
  async shopBuy(shopId){ const L=__lumen; L.G.screens.close(); L.st.player.ecus=Math.max(L.st.player.ecus,5000); L.G.screens.shop(shopId,false); await T.tick(200); const rows=document.querySelectorAll('#screen .shop-list li').length; const b=document.querySelector('#screen [data-buy]'); const e0=L.st.player.ecus; if(b) b.click(); await T.tick(150); const r={lignes:rows,achat:e0-L.st.player.ecus}; L.G.screens.close(); return JSON.stringify(r); },
});
Object.assign(window.T, {
  pre(){ const s=__lumen.st; return {inv:{...s.inv},unl:{...s.unlocks},ecus:s.player.ecus,xp:s.player.xp,lvl:s.player.lvl}; },
  async rewardCheck(qid, before){ const L=__lumen,s=L.st,Q=L.G.quests.def(qid).rewards,o=[]; const st=L.quests.state(qid); if(st!=='done') return 'PAS TERMINEE '+T.q(qid);
    for (const [id,n] of Object.entries(Q.items||{})) { const got=(s.inv[id]||0)-(before.inv[id]||0); if(got<n && !(L.G.def && ['arme','armure'].includes(0))) o.push('objet '+id+' reçu '+got+'/'+n); }
    for (const u of [].concat(Q.unlock||[])) if(!s.unlocks[u]) o.push('déblocage '+u+' manquant');
    if (Q.ecus && s.player.ecus < before.ecus+Q.ecus) o.push('écus '+(s.player.ecus-before.ecus)+'<'+Q.ecus);
    return o.length?'KO '+o.join('; '):'récompenses ok'; },
  async pickupAt(pkId){ const L=__lumen; const pv=Object.values(L.world.pickupViews).find(v=>v.pk.id===pkId); if(!pv) return 'nopk:'+pkId; if(!pv.g.visible) return 'dejapris';
    const z=L.G.zones[pv.zi]; L.tpZone(z.id,[pv.x-z.ox,pv.y-z.oy]); for(let i=0;i<20&&pv.g.visible;i++) await T.tick(80); if(L.G.screens.current) L.G.screens.close(); return pv.g.visible?'non ramassé':'ramassé'; },
  async lightLamps(){ const L=__lumen; let n=0; for (const pr of L.world.props.filter(p=>p.p.t==='lamp'&&p.zi===L.S.zone)) { const x=pr.g.position.x, z=pr.g.position.z; for (const [dx,dz] of [[0,1.4],[0,-1.4],[1.4,0],[-1.4,0]]) if(L.G.canStand(x+dx,z+dz)){L.P.x=x+dx;L.P.z=z+dz;break;} 
      for(let i=0;i<20;i++){ await T.tick(60); const t=L.target(); if(t&&t.kind==='lamp'&&t.pr===pr){ L.interact(); n++; await T.tick(100); break; } } }
    return n+' lampions, compte='+L.G.counts('lampions'); },
});
Object.assign(window.T, {
  async exercise(){ const L=__lumen, o=[]; const tryit=async(n,f)=>{ try{ await f(); }catch(e){ o.push(n+': '+e.message); } };
    await tryit('menus',async()=>{ for (const t of ['inventaire','personnage','journal','carte','options']) { L.G.screens.menu(t); await T.tick(120); const body=document.querySelector('#m-body'); if(!body||!body.innerHTML.length) o.push('menu vide '+t); } L.G.screens.close(); });
    await tryit('collection',async()=>{ L.G.screens.menu('journal'); document.querySelector('[data-jt=collection]')&&document.querySelector('[data-jt=collection]').click(); await T.tick(100); L.G.screens.close(); });
    await tryit('hud',async()=>{ L.G.hud.refresh(); await T.tick(100); });
    await tryit('dialogue',async()=>{ for (const n of L.npcs.slice(0,6)) { L.G.screens.dialog(n.id); T.pump(); } });
    await tryit('save',async()=>{ await L.saveTo('s2'); });
    await tryit('completion',async()=>{ L.completion(); });
    await tryit('frames',async()=>{ await T.tick(500); });
    return o.join(' | ')||'ok'; },
});
Object.assign(window.T, {
  /* ACTE IV : arrivée sur l'île des Abysses comme après un voyage (état neuf, Forêt terminée) */
  async arrive(opts){ const m=await import('/lumen/js/game/state.js'); const s=m.newState(); s.player.island='abysses'; s.player.zone='greve'; s.world=m.newWorld('greve'); s.flags.acte2_fini=1; s.player.respawn={zone:'auberge_a',cell:[6,7]}; s.player.ecus=(opts&&opts.ecus)||200;
    s.quests.q_reveil={state:'done',step:3,base:{}}; s.quests.q_verre={state:'done',step:6,base:{}}; s.quests.q_phare_verre={state:'done',step:9,base:{}};
    s.inv.epee_courte=1; s.equip.weapon='epee_courte'; s.inv.potion=3; s.player.lvl=6; await __lumen.G.startFrom(s,'auto',false,true); await T.tick(800); T.pump(); return __lumen.S.mode; },
});
Object.assign(window.T, {
  /* ACTE IV : pour chaque objet manœuvrable (lanterne, miroir, relais, vanne, socle, corniche), depuis chaque case voisine marchable,
     la cible d'interaction doit être CET objet. Renvoie la liste des échecs. */
  async auditDevices(zoneId){ const L=__lumen, lg=await import('/lumen/js/logic.js'); const zi=L.G.zones.findIndex(z=>z.id===zoneId); const bad=[]; let n=0;
    const list=L.isl.ents.filter(e=>e.zone===zi && ((e.rot&&['lantern','mirror','relay','valve','socle'].includes(e.t))||e.t==='ledge'));
    for (const e of list) { for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const cx=e.x+dx, cy=e.y+dy; if(!lg.walkable(L.isl,cx,cy)) continue;
        L.P.x=cx*2; L.P.z=cy*2; L.P.vx=L.P.vz=0; L.S.zone=zi; let ok=false, t=null;
        for(let i=0;i<14;i++){ await T.tick(50); t=L.target(); if(t&&t.e===e){ ok=true; break; } }
        n++; if(!ok) bad.push(e.id+' depuis ('+cx+','+cy+') : cible='+(t?(t.kind+':'+(t.e?t.e.id:t.label)):'aucune')); } }
    return JSON.stringify({testes:n, ko:bad}); },
  /* amène l'objet à la valeur voulue en passant par la vraie interaction, depuis une case voisine */
  async operate(id, want){ const L=__lumen, lg=await import('/lumen/js/logic.js'); const e=L.isl.ents.find(x=>x.id===id); if(!e) return 'noent:'+id;
    const cur=()=>e.t==='mirror'||e.t==='valve'?e.state:e.t==='lantern'?e.dir:e.t==='relay'?e.out:null;
    let spot=null; for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) if(lg.walkable(L.isl,e.x+dx,e.y+dy)){ spot=[e.x+dx,e.y+dy]; break; } if(!spot) return 'nospot:'+id;
    L.G.screens.close(); L.S.mode==='play'||0; L.P.x=spot[0]*2; L.P.z=spot[1]*2; L.P.vx=L.P.vz=0; L.S.zone=e.zone;
    for(let k=0;k<10;k++){ if(cur()===want) return 'ok'; let t=null; for(let i=0;i<14;i++){ await T.tick(50); t=L.target(); if(t&&t.e===e) break; }
      if(!t||t.e!==e) return 'cible:'+(t?t.kind:'aucune')+' pour '+id; L.interact(); await T.tick(120); }
    return cur()===want?'ok':'pas atteint '+id+'='+cur(); },
  async operateOrb(at, dir){ const L=__lumen, lg=await import('/lumen/js/logic.js'); const e=L.isl.ents.find(x=>x.id===at); if(!e) return 'nosocle:'+at;
    let spot=null; for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) if(lg.walkable(L.isl,e.x+dx,e.y+dy)){ spot=[e.x+dx,e.y+dy]; break; } if(!spot) return 'nospot:'+at;
    L.G.screens.close(); L.P.x=spot[0]*2; L.P.z=spot[1]*2; L.P.vx=L.P.vz=0; L.S.zone=e.zone;
    for(let k=0;k<8;k++){ if(L.isl.orb.at===at && L.isl.orb.dir===dir) return 'ok'; let t=null; for(let i=0;i<14;i++){ await T.tick(50); t=L.target(); if(t&&t.e===e) break; }
      if(!t||t.e!==e) return 'cible:'+(t?t.kind:'aucune')+' pour '+at; L.interact(); await T.tick(120); }
    return L.isl.orb.at===at && L.isl.orb.dir===dir?'ok':'orbe '+L.isl.orb.at+' '+L.isl.orb.dir; },
  /* rejoue la solution d'une porte par de vraies interactions */
  async realSolve(gate){ const L=__lumen; const s=SOL.abysses[gate]; const out=[]; for(const [id,v] of Object.entries(s)){ out.push(id==='@orb'? await T.operateOrb(v.at,v.dir) : await T.operate(id,v)); } return JSON.stringify({gate,open:!!L.isl.gates[gate].open,steps:out}); },
});
