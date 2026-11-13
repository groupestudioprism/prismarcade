/* Test : Lyra rejoint à pied le Sanctuaire de Brume et le Temple de Verre (ponts déployés à l’approche).
   Lancer un serveur à la racine du dépôt (python3 -m http.server 8765) puis : node lumen/tests/ponts_donjons.cjs */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const walk = async (zone, cell, label) => {
    await p.evaluate(([z, c]) => { const L = __lumen; L.G.screens.close && L.G.screens.close(); L.S.mode = 'play'; L.tpZone(z, c); L.S.yaw = L.S.yawT = 0; }, [zone, cell]);
    const before = await p.evaluate(() => { const L = __lumen; return L.G.zones[L.S.zone] && L.G.zones[L.S.zone].id; });
    await p.keyboard.down('s'); 
    let reached = null;
    for (let i = 0; i < 60; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => __lumen.G.screens.dialogOpen)) { await p.keyboard.up('s'); await p.keyboard.press('e'); await p.keyboard.down('s'); } reached = await p.evaluate(() => { const L = __lumen; return L.G.zones[L.G.zoneIndexAt(L.P.x, L.P.z)] && L.G.zones[L.G.zoneIndexAt(L.P.x, L.P.z)].id; }); if (reached === 'sanctuaire' || reached === 'temple') break; }
    await p.keyboard.up('s');
    const open = await p.evaluate(() => Object.values(__lumen.isl.gates).filter((g) => ['b_sanct', 'b_temple'].includes(g.id)).map((g) => g.id + ':' + g.open).join(' '));
    console.log(await p.evaluate(() => { const L = __lumen, g = L.isl.gates.b_sanct || L.isl.gates.b_temple; return 'mode=' + L.S.mode + ' P=' + (L.P.x/2).toFixed(1) + ',' + (L.P.z/2).toFixed(1) + ' pont=' + JSON.stringify(g.cells) + ' dialog=' + L.G.screens.dialogOpen; }));
    console.log(label, 'départ', before, '→ arrivée', reached, '|', open);
  };
  await p.goto('http://localhost:8765/lumen/?nobloom');
  await p.waitForFunction(() => window.__lumen && window.__lumen.G, null, { timeout: 90000 });
  await p.evaluate(async () => { await __lumen.G.startFrom(null, 'auto'); });
  await p.waitForTimeout(1500);
  for (let i = 0; i < 40; i++) { const o = await p.evaluate(() => __lumen.G.screens.dialogOpen); if (!o) break; await p.keyboard.press('e'); await p.waitForTimeout(200); }
  await walk('lande', [17, 23], 'Aube :');
  const q = await p.evaluate(() => { const L = __lumen; L.quests.check(); return JSON.stringify(L.st.seen.sanctuaire || 0); });
  console.log('sanctuaire visité', q);
  // Forêt de Verre
  await p.evaluate(() => { const L = __lumen; L.st.flags.acte1_fini = 1; L.st.quests.q_reveil = { state: 'done', step: 3, base: {} }; L.G.runEffects([{ travel: { to: 'foret', zone: 'vitrebourg', cell: [12, 7] } }]); });
  await p.waitForTimeout(6000);
  await p.waitForFunction(() => window.__lumen && window.__lumen.G && window.__lumen.G.def.id === 'foret', null, { timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(3000);
  console.log('île', await p.evaluate(() => __lumen.G.def.id));
  await walk('lisiere', [17, 23], 'Forêt :');
  console.log(errs.join('\n') || 'aucune erreur');
  await b.close();
})();
