/* =========================================================
   Prism Arcade — compte Studio Prism, sauvegarde cloud et classements

   - Même projet Firebase et mêmes comptes que le site Studio Prism et ses applications
     (projet « archivision-studioprism »). Prism Arcade NE CRÉE PAS de compte et ne modifie pas
     le profil : l'inscription et la gestion du compte restent sur studio-prism.com.
   - Un compte « suspended », « pending » ou sans profil n'entre pas (même logique que NEXUS).
   - Progression : paPlayers/{uid} (lisible et modifiable par son seul titulaire).
     Copie locale par compte (« prismarcade.v1.u.<uid> ») : le jeu reste jouable hors ligne.
     À la première connexion, la progression « invité » de l'appareil est rattachée au compte.
   - Classements : paBoards/{jeu}/scores/{uid} = { uid, name, score, updatedAt } (lecture publique ;
     écriture par le titulaire uniquement, un record ne peut jamais baisser).
   - Le jeu fonctionne entièrement sans Firebase (hors ligne, SDK bloqué) : la progression reste locale.
   ========================================================= */
(function () {
  'use strict';
  const PA = window.PA;
  const SDK = 'https://www.gstatic.com/firebasejs/13.0.0/';
  /* Configuration Web PUBLIQUE par conception (identique au site Studio Prism et aux applications) :
     elle identifie le projet, sans donner aucun droit. La sécurité repose sur Authentication et les règles Firestore. */
  const CONFIG = {
    apiKey: 'AIzaSyAAD5rrHuVh6_PC2_45L3y9F7zWe5ACW6E',
    authDomain: 'archivision-studioprism.firebaseapp.com',
    projectId: 'archivision-studioprism',
    storageBucket: 'archivision-studioprism.firebasestorage.app',
    messagingSenderId: '226072216517',
    appId: '1:226072216517:web:0aeef645a4f1481fe801ac',
  };
  PA.SITE = 'https://studio-prism.com/';
  const userKey = (uid) => 'prismarcade.v1.u.' + uid;

  /* status : loading | out | in | error */
  const C = (PA.cloud = { status: 'loading', user: null, profile: null, notice: '', sync: 'idle', syncError: '' });
  let fb = null, boot = null, pushT = null, applying = false, manual = 0, unwatch = null, lastName = null;
  const setC = (patch) => { Object.assign(C, patch); PA.emit('cloud', C); };

  const withTimeout = (p, ms, code = 'app/timeout') => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error(code), { code })), ms))]);

  function sdk() {
    if (!boot) {
      boot = (async () => {
        const [core, A, F] = await withTimeout(Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]), 20000, 'app/sdk-unavailable');
        const app = core.initializeApp(CONFIG);
        const auth = A.getAuth(app);
        auth.languageCode = 'fr';
        const db = F.getFirestore(app);
        window.PRISM_PRESENCE_USER = () => auth.currentUser;   // présence en direct (tableau de bord Studio Prism)
        return { app, auth, db, A, F };
      })().catch((e) => { boot = null; throw Object.assign(e, { code: e.code || 'app/sdk-unavailable' }); });
    }
    return boot;
  }

  /* ---------- Messages d'erreur en français ---------- */
  const MSG = {
    'auth/invalid-credential': 'Adresse e-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'Adresse e-mail ou mot de passe incorrect.',
    'auth/user-not-found': 'Adresse e-mail ou mot de passe incorrect.',
    'auth/invalid-email': 'Cette adresse e-mail n’est pas valide.',
    'auth/missing-password': 'Saisis ton mot de passe.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie dans quelques minutes.',
    'auth/network-request-failed': 'Connexion internet indisponible.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'app/pending': 'Ce compte est en attente de validation par Studio Prism.',
    'app/suspended': 'Ce compte est désactivé. Contacte Studio Prism.',
    'app/account-deleted': 'Ce compte n’existe plus.',
    'app/profile-invalid': 'Ce compte n’est pas utilisable pour le moment.',
    'app/sdk-unavailable': 'Le service de comptes est injoignable (connexion ou bloqueur). Tu peux continuer à jouer sans compte.',
    'app/timeout': 'Le service met trop de temps à répondre. Réessaie.',
    'app/session-expired': 'Ta session a expiré. Reconnecte-toi.',
    'permission-denied': 'Accès refusé par le serveur (règles Firestore à publier ?).',
    'unavailable': 'Serveur injoignable : la progression est gardée sur cet appareil.',
  };
  PA.errText = (e) => MSG[(e && e.code) || e] || 'Une erreur est survenue (' + ((e && e.code) || 'inconnue') + ').';

  /* ---------- Profil Studio Prism ---------- */
  const FATAL = new Set(['app/pending', 'app/suspended', 'app/account-deleted', 'app/profile-invalid']);
  async function readProfile(u) {
    const { db, F } = fb;
    const snap = await withTimeout(F.getDoc(F.doc(db, 'users', u.uid)), 15000);
    if (!snap.exists()) throw Object.assign(new Error('x'), { code: 'app/account-deleted' });
    const d = snap.data();
    if (d.status === 'pending') throw Object.assign(new Error('x'), { code: 'app/pending' });
    if (d.status === 'suspended') throw Object.assign(new Error('x'), { code: 'app/suspended' });
    if (d.status !== 'active') throw Object.assign(new Error('x'), { code: 'app/profile-invalid' });
    return { uid: u.uid, firstName: d.firstName || '', lastName: d.lastName || '', role: d.role || 'user' };
  }

  function watchProfile(uid) {
    stopWatch();
    const { db, F } = fb;
    try {
      unwatch = F.onSnapshot(F.doc(db, 'users', uid), (snap) => {
        const d = snap.exists() ? snap.data() : null;
        const code = !d ? 'app/account-deleted' : d.status !== 'active' ? (d.status === 'suspended' ? 'app/suspended' : d.status === 'pending' ? 'app/pending' : 'app/profile-invalid') : '';
        if (code) forceOut(code);
      }, () => {});
    } catch (e) { unwatch = null; }
  }
  function stopWatch() { if (unwatch) { try { unwatch(); } catch (e) { /* rien */ } } unwatch = null; }
  let pendingNotice = '';
  async function forceOut(code) { pendingNotice = code; stopWatch(); if (fb) await fb.A.signOut(fb.auth).catch(() => {}); }

  /* ---------- Conversion pour Firestore ---------- */
  const CLOUD_KEYS = ['name', 'xp', 'coins', 'coinsEarned', 'theme', 'themes', 'muted', 'games', 'ach', 'boards', 'daily', 'dailyStreak', 'lastDailyDone', 'totals', 'created',
    'inv', 'equip', 'boost', 'periods', 'claims', 'trophies', 'giftDay', 'giftStreak'];
  function toCloud(s) {
    const o = {};
    CLOUD_KEYS.forEach((k) => (o[k] = s[k] === undefined ? null : s[k]));
    o.name = String(o.name || 'Joueur').slice(0, 18) || 'Joueur';
    return JSON.parse(JSON.stringify(o));   // retire les « undefined » refusés par Firestore
  }
  function fromCloud(d) {
    const o = {};
    CLOUD_KEYS.forEach((k) => { if (d[k] !== undefined && d[k] !== null) o[k] = d[k]; });
    return o;
  }

  /* ---------- Connexion d'un compte : fusion des progressions ---------- */
  async function enter(u) {
    setC({ status: 'loading' });
    const profile = await readProfile(u);
    const { db, F } = fb;
    let cloud = null;
    try {
      const snap = await withTimeout(F.getDoc(F.doc(db, 'paPlayers', u.uid)), 15000);
      if (snap.exists()) cloud = fromCloud(snap.data());
    } catch (e) {
      console.warn('[Prism Arcade] progression cloud illisible :', e.code || e);
      setC({ syncError: e.code || 'unknown' });
    }
    const cache = PA.readStore(userKey(u.uid));
    const guest = PA.readStore(PA.GUEST_KEY);
    let merged = PA.defaults();
    [cloud, cache].forEach((s) => { if (s) merged = PA.merge(merged, s); });
    const imported = PA.hasProgress(guest);
    if (imported) merged = PA.merge(merged, guest);
    if (merged.name === 'Joueur' && profile.firstName) merged.name = profile.firstName.slice(0, 18);
    applying = true; PA.useStore(userKey(u.uid), merged); applying = false;
    if (imported) PA.clearStore(PA.GUEST_KEY);
    lastName = merged.name;
    try { localStorage.setItem('prismarcade.lastUid', u.uid); } catch (e) { /* rien */ }
    setC({ status: 'in', user: { uid: u.uid, email: u.email }, profile, notice: imported ? 'merged' : '' });
    watchProfile(u.uid);
    await push();
    submitBests();
    claimRewards();
  }

  function leave(notice) {
    stopWatch();
    clearTimeout(pushT); pushT = null;
    applying = true; PA.useStore(PA.GUEST_KEY, PA.readStore(PA.GUEST_KEY) || PA.defaults()); applying = false;
    lastName = null;
    try { localStorage.removeItem('prismarcade.lastUid'); } catch (e) { /* rien */ }
    setC({ status: 'out', user: null, profile: null, notice: notice || '', sync: 'idle', syncError: '' });
  }

  /* ---------- Sauvegarde dans le cloud (regroupée : 2,5 s après la dernière modification) ---------- */
  async function push() {
    clearTimeout(pushT); pushT = null;
    if (C.status !== 'in' || !fb || !fb.auth.currentUser) return;
    const uid = fb.auth.currentUser.uid;
    setC({ sync: 'saving' });
    try {
      const { db, F } = fb;
      await withTimeout(F.setDoc(F.doc(db, 'paPlayers', uid), Object.assign(toCloud(PA.state()), { updatedAt: F.serverTimestamp() })), 15000);
      setC({ sync: 'saved', syncError: '', lastSync: Date.now() });
    } catch (e) {
      console.warn('[Prism Arcade] sauvegarde cloud impossible :', e.code || e);
      setC({ sync: 'error', syncError: e.code || 'unknown' });
    }
  }
  PA.on('change', (s) => {
    if (applying || C.status !== 'in') return;
    clearTimeout(pushT);
    pushT = setTimeout(push, 2500);
    if (lastName !== null && s.name !== lastName) { lastName = s.name; submitBests(true); }
  });
  window.addEventListener('pagehide', () => { if (pushT) push(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && pushT) push(); });

  /* ---------- Classements ---------- */
  /* Entrée publique : pseudo, avatar et cadre équipés (jamais l'e-mail ni le vrai nom). */
  function entry(uid, score, F) {
    const s = PA.state(), av = PA.equipped && PA.equipped('avatar'), fr = PA.equipped && PA.equipped('frame');
    const o = { uid, name: String(s.name || 'Joueur').slice(0, 18) || 'Joueur', score: Math.floor(score), updatedAt: F.serverTimestamp() };
    if (av && PA.item(av)) o.avatar = PA.item(av).data.glyph;
    if (fr) o.frame = String(fr).slice(0, 40);
    return o;
  }
  const boardRef = (F, db, path, uid) => (path.period ? F.doc(db, 'paPeriods', path.period, 'scores', uid) : F.doc(db, 'paBoards', path.game, 'scores', uid));

  /* Score d'une partie : met à jour les classements de la semaine et du mois s'il améliore le score de la période. */
  async function submitPeriods(gameId, score) {
    if (C.status !== 'in' || !fb || !fb.auth.currentUser || !(score > 0)) return;
    const { db, F } = fb, uid = fb.auth.currentUser.uid, s = PA.state();
    s.periods = s.periods || {};
    for (const kind of ['w', 'm']) {
      const key = PA.periodKey(gameId, kind);
      if ((s.periods[key] || 0) >= score) continue;
      try {
        await withTimeout(F.setDoc(boardRef(F, db, { period: key }, uid), entry(uid, score, F)), 15000);
        s.periods[key] = Math.floor(score); PA.save();
        delete boardCache[key];
      } catch (e) { console.warn('[Prism Arcade] classement', key, 'non mis à jour :', e.code || e); }
    }
  }

  async function submit(gameId, score) {
    if (C.status !== 'in' || !fb || !fb.auth.currentUser || !(score > 0)) return false;
    const { db, F } = fb, uid = fb.auth.currentUser.uid;
    try {
      await withTimeout(F.setDoc(F.doc(db, 'paBoards', gameId, 'scores', uid), entry(uid, score, F)), 15000);
      const s = PA.state();
      s.boards = s.boards || {};
      if ((s.boards[gameId] || 0) < score) { s.boards[gameId] = Math.floor(score); PA.save(); }
      delete boardCache[gameId];
      return true;
    } catch (e) {
      // refus attendu si un autre appareil a déjà envoyé un meilleur score : rien à faire
      console.warn('[Prism Arcade] score non envoyé :', gameId, e.code || e);
      return false;
    }
  }
  /* Envoie les records pas encore publiés (ou tous, après un changement de pseudo). */
  async function submitBests(all) {
    const s = PA.state();
    for (const g of PA.games) {
      const st = s.games[g.id];
      if (st && st.best > 0 && (all || st.best > ((s.boards || {})[g.id] || 0))) await submit(g.id, st.best);
    }
  }

  const boardCache = {};
  const col = (F, db, gameId, period) => (period ? F.collection(db, 'paPeriods', period, 'scores') : F.collection(db, 'paBoards', gameId, 'scores'));
  /* period : clé « jeu__w123 » / « jeu__m456 », ou rien pour le classement des records. */
  async function top(gameId, n = 10, period) {
    const ck = period || gameId, c = boardCache[ck];
    if (c && Date.now() - c.at < 30000 && c.n >= n) return c.list.slice(0, n);
    if (!fb) fb = await sdk();
    const { db, F } = fb;
    const q = F.query(col(F, db, gameId, period), F.orderBy('score', 'desc'), F.limit(n));
    const snap = await withTimeout(F.getDocs(q), 15000);
    const list = snap.docs.map((d) => { const x = d.data(); return { uid: d.id, name: String(x.name || 'Joueur').slice(0, 18), score: Number(x.score) || 0, avatar: typeof x.avatar === 'string' ? x.avatar.slice(0, 8) : '', frame: typeof x.frame === 'string' ? x.frame : '' }; });
    boardCache[ck] = { at: Date.now(), n, list };
    return list;
  }
  /* Rang du joueur connecté : 1 + nombre de scores strictement supérieurs (requête de comptage, sans index composite). */
  async function rank(gameId, score, period) {
    if (!(score > 0)) return null;
    if (!fb) fb = await sdk();
    const { db, F } = fb;
    if (!F.getCountFromServer) return null;
    const q = F.query(col(F, db, gameId, period), F.where('score', '>', Math.floor(score)));
    const snap = await withTimeout(F.getCountFromServer(q), 15000);
    return snap.data().count + 1;
  }

  /* ---------- Cadeaux des classements terminés ----------
     Pour chaque période terminée où le joueur a envoyé un score et qu'il n'a pas encore réclamée : lecture du podium ;
     s'il y figure, le cadeau est ajouté à sa progression (une seule fois, mémorisé dans « claims »). */
  let claiming = false;
  async function claimRewards() {
    if (claiming || C.status !== 'in' || !fb || !fb.auth.currentUser) return [];
    claiming = true;
    const won = [];
    try {
      const uid = fb.auth.currentUser.uid, s = PA.state();
      const keys = Object.keys(s.periods || {}).filter((k) => PA.periodOver(k) && !(s.claims || {})[k]);
      for (const key of keys) {
        const p = PA.parseKey(key);
        try {
          const podium = await top(p.game, 3, key);
          const i = podium.findIndex((r) => r.uid === uid);
          const res = PA.grantPrize(key, i + 1, i >= 0 ? podium[i].score : 0);
          if (res) won.push(res);
        } catch (e) { console.warn('[Prism Arcade] podium illisible', key, e.code || e); }
      }
    } finally { claiming = false; }
    if (won.length) PA.emit('prizes', won);
    return won;
  }

  /* ---------- Actions de l'interface ---------- */
  async function signIn(email, password, remember = true) {
    if (!fb) fb = await sdk();
    manual++;
    try {
      await fb.A.setPersistence(fb.auth, remember ? fb.A.browserLocalPersistence : fb.A.browserSessionPersistence);
      const cred = await withTimeout(fb.A.signInWithEmailAndPassword(fb.auth, String(email).trim(), password), 20000);
      try { await enter(cred.user); }
      catch (err) { await fb.A.signOut(fb.auth).catch(() => {}); leave(); throw err; }
    } finally { manual--; }
  }
  async function signOut() {
    if (!fb) return;
    if (pushT) await push();
    await fb.A.signOut(fb.auth);
  }
  async function resetPassword(email) {
    if (!fb) fb = await sdk();
    try { await fb.A.sendPasswordResetEmail(fb.auth, String(email).trim()); }
    catch (e) { if (e && e.code === 'auth/user-not-found') return; throw e; }   // même réponse que l'adresse existe ou non
  }

  /* ---------- Documents des grands jeux (ex. Lumen : lumenSaves/{uid}/slots/{slot}) ----------
     Accès générique, réservé au compte connecté ; les règles Firestore décident de ce qui est permis. */
  const segs = (path) => String(path).split('/').filter(Boolean);
  const store = {
    async get(path) { if (C.status !== 'in' || !fb) throw Object.assign(new Error('out'), { code: 'app/out' }); const snap = await withTimeout(fb.F.getDoc(fb.F.doc(fb.db, ...segs(path))), 15000); return snap.exists() ? Object.assign({ id: snap.id }, snap.data()) : null; },
    async set(path, data) { if (C.status !== 'in' || !fb) throw Object.assign(new Error('out'), { code: 'app/out' }); await withTimeout(fb.F.setDoc(fb.F.doc(fb.db, ...segs(path)), Object.assign({}, data, { updatedAt: fb.F.serverTimestamp() })), 20000); return true; },
    async list(path) { if (C.status !== 'in' || !fb) throw Object.assign(new Error('out'), { code: 'app/out' }); const qs = await withTimeout(fb.F.getDocs(fb.F.collection(fb.db, ...segs(path))), 15000); return qs.docs.map((d) => Object.assign({ id: d.id }, d.data())); },
    async del(path) { if (C.status !== 'in' || !fb) throw Object.assign(new Error('out'), { code: 'app/out' }); await withTimeout(fb.F.deleteDoc(fb.F.doc(fb.db, ...segs(path))), 15000); return true; },
  };

  Object.assign(C, { signIn, signOut, resetPassword, top, rank, submit, submitPeriods, claimRewards, retry: () => push(), store });
  // une période peut se terminer pendant que la page est ouverte
  setInterval(() => { if (C.status === 'in') claimRewards(); }, 10 * 60 * 1000);

  /* ---------- Démarrage ---------- */
  // affiche tout de suite la progression du dernier compte connecté sur cet appareil, le temps que la session se restaure
  try {
    const last = localStorage.getItem('prismarcade.lastUid');
    if (last && PA.readStore(userKey(last))) { applying = true; PA.useStore(userKey(last)); applying = false; }
  } catch (e) { /* rien */ }
  (async () => {
    try { fb = await sdk(); }
    catch (e) { setC({ status: 'error', notice: e.code || 'app/sdk-unavailable' }); return; }
    fb.A.onAuthStateChanged(fb.auth, (u) => {
      if (!u) { const n = pendingNotice; pendingNotice = ''; leave(n); return; }
      if (manual > 0) return;   // signIn() s'en occupe
      enter(u).catch((err) => {
        if (FATAL.has(err.code)) { forceOut(err.code); return; }
        console.error('[Prism Arcade] profil illisible :', err.code || err);
        setC({ status: 'error', notice: err.code || 'unknown' });
      });
    });
  })();
})();
