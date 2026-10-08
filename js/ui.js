/* App shell (Stitch layout: grouped sidebar + status top bar) and shared UI components. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

HC.ui = (function () {
  const { esc, fmt, rupiah, $, $$, fmtTime } = HC.util;
  const icon = HC.icon;
  const PLACEHOLDER = 'assets/images/placeholder.svg';
  // Official HYCANE logo (assets/images/brand, generated from the supplied logo file).
  const LOGO = 'assets/images/brand/hycane-logo.png';
  const LOGO_WHITE = 'assets/images/brand/hycane-logo-white.png';
  const MARK = 'assets/images/brand/hycane-mark.png';
  const MARK_WHITE = 'assets/images/brand/hycane-mark-white.png';

  const NAV = [
    { group: 'MAIN' },
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', href: '#/dashboard' },
    { id: 'monitoring', label: 'Live Monitoring', icon: 'wifi', href: '#/monitoring' },
    { id: 'crops', label: 'My Crops', icon: 'sprout', href: '#/crops' },
    { id: 'ai', label: 'AI Recommendation', icon: 'sparkles', href: '#/ai' },
    { group: 'EXPLORE' },
    { id: 'marketplace', label: 'Marketplace', icon: 'store', href: '#/marketplace' },
    { id: 'learn', label: 'Education', icon: 'graduation', href: '#/learn' },
    { id: 'diagnosis', label: 'Diagnosis', icon: 'stethoscope', href: '#/diagnosis' },
    { id: 'community', label: 'Community', icon: 'message', href: '#/community' },
    { group: 'ACTIVITY' },
    { id: 'orders', label: 'Orders', icon: 'receipt', href: '#/orders' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', href: '#/notifications' },
    { group: 'ACCOUNT' },
    { id: 'profile', label: 'Profile', icon: 'user', href: '#/profile' },
    { id: 'settings', label: 'Settings', icon: 'sliders', href: '#/settings' },
  ];
  const ITEMS = NAV.filter((n) => n.id);
  const BOTTOM = ['dashboard', 'monitoring', 'ai', 'marketplace'];

  /* ---------------- status vocabulary (never color alone) ---------------- */
  const LEVEL = {
    ok: { label: 'Normal', icon: 'checkCircle', cls: 'ok' },
    warn: { label: 'Perhatian', icon: 'alert', cls: 'warn' },
    crit: { label: 'Mendesak', icon: 'octagon', cls: 'crit' },
    info: { label: 'Info', icon: 'info', cls: 'info' },
    offline: { label: 'Offline', icon: 'wifiOff', cls: 'muted' },
  };
  const badge = (level, text) => { const l = LEVEL[level] || LEVEL.info; return `<span class="badge badge-${l.cls}">${icon(l.icon)}${esc(text || l.label)}</span>`; };
  /* Stitch-style status pill: tinted container + leading dot + text. */
  const pill = (level, text) => { const l = LEVEL[level] || LEVEL.info; return `<span class="pill pill-${l.cls}"><span class="dot ${level === 'ok' ? '' : level === 'warn' ? 'dot-warn' : level === 'crit' ? 'dot-crit' : level === 'info' ? 'dot-blue' : 'dot-muted'}"></span>${esc(text || l.label)}</span>`; };

  const METRICS = {
    ph: { label: 'pH Air', unit: 'pH', digits: 1, icon: 'flask', lesson: 'ph', color: '#006b2c', eyebrow: 'Keasaman Air', panel: 'Panel pH Air' },
    tds: { label: 'TDS', unit: 'ppm', digits: 0, icon: 'zap', lesson: 'tds', color: '#006b2c', eyebrow: 'Konsentrasi Hara', panel: 'Panel TDS & EC' },
    ec: { label: 'EC', unit: 'mS/cm', digits: 2, icon: 'zap', lesson: 'ec', color: '#006b2c' },
    temperature: { label: 'Suhu Air', unit: '°C', digits: 1, icon: 'thermometer', lesson: 'suhu-air', color: '#006b2c', eyebrow: 'Termal Reservoir', panel: 'Panel Suhu Air' },
    waterLevel: { label: 'Ketinggian Air', unit: '%', digits: 0, icon: 'waves', lesson: 'ketinggian-air', color: '#006b2c', eyebrow: 'Volume Tangki', panel: 'Ketinggian Air' },
  };

  function describe(metric, v, level, sys = 'A') {
    const th = HC.sim.THRESH[sys];
    if (metric === 'ph') {
      if (level === 'ok') return 'Keasaman optimal untuk penyerapan nutrisi';
      return v > th.ph.warn[1] ? (level === 'crit' ? 'Terlalu basa, perlu disesuaikan' : 'Mulai terlalu tinggi') : (level === 'crit' ? 'Terlalu asam, perlu disesuaikan' : 'Mulai terlalu rendah');
    }
    if (metric === 'tds') {
      if (level === 'ok') return 'Kepekatan nutrisi pas';
      return v > th.tds.warn[1] ? (level === 'crit' ? 'Larutan terlalu pekat' : 'Sedikit terlalu pekat') : (level === 'crit' ? 'Larutan terlalu encer' : 'Sedikit terlalu encer');
    }
    if (metric === 'temperature') {
      if (level === 'ok') return v > 28.5 ? 'Agak hangat, masih aman' : 'Nyaman untuk akar';
      return v > th.temperature.warn[1] ? (level === 'crit' ? 'Air terlalu panas, periksa sirkulasi' : 'Air cukup hangat, periksa sirkulasi') : 'Air terlalu dingin';
    }
    if (metric === 'waterLevel') {
      if (level === 'ok') return v < 55 ? 'Cukup, isi ulang dalam beberapa hari' : 'Volume cadangan aman';
      return level === 'crit' ? 'Hampir habis, isi sekarang' : 'Mulai rendah, siapkan isi ulang';
    }
    return '';
  }
  const range = (metric, sys = 'A') => {
    const th = HC.sim.THRESH[sys][metric];
    if (metric === 'ph') return `${fmt(th.warn[0], 1)}–${fmt(th.warn[1], 1)}`;
    if (metric === 'tds') return `${fmt(th.warn[0])}–${fmt(th.warn[1])}`;
    if (metric === 'temperature') return `≤ ${fmt(th.warn[1], 1)}°C`;
    if (metric === 'waterLevel') return `≥ ${th.warn[0]}%`;
    return '';
  };

  /* ---------------- images ---------------- */
  const img = (src, alt, cls = '') => `<img class="${cls}" src="${esc(src || PLACEHOLDER)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  window.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fellBack) { t.dataset.fellBack = '1'; t.src = PLACEHOLDER; }
  }, true);
  const productArt = (p) => HC.art.render(p.art, { accent: p.accent, accent2: p.accent2, mark: p.mark, d: p.d, fruit: p.fruit, leafy: p.leafy, alt: p.name });
  /* Prefer the Stitch product photo; fall back to the SVG illustration. */
  const productImg = (p) => (p.photo ? img(p.photo, p.name) : productArt(p));
  const stars = (r) => `<span class="stars" aria-label="Rating ${fmt(r, 1)} dari 5">${icon('star')}${fmt(r, 1)}</span>`;

  function productCard(p) {
    const q = HC.pricing.quote(p);
    const cat = HC.data.categories.find((c) => c.id === p.category);
    return `<article class="pcard">
      <a class="pcard-media ph" href="#/marketplace/p/${p.id}" aria-label="${esc(p.name)}">${productImg(p)}${p.badge ? `<span class="ph-badge pill pill-solid">${esc(p.badge)}</span>` : ''}</a>
      <div class="pcard-body">
        <div class="label-sm">${esc(cat ? cat.label : '')}</div>
        <h3 class="pcard-title"><a href="#/marketplace/p/${p.id}">${esc(p.name)}</a></h3>
        <p class="pcard-short">${esc(p.short)}</p>
        <div class="pcard-foot">
          <div><div class="price">${rupiah(q.sellingPrice)}</div><div class="stock ${p.stock < 10 ? 'low' : ''}">${p.stock < 10 ? 'Sisa ' + p.stock : 'Stok ' + p.stock} · ${stars(p.rating)}</div></div>
        </div>
        <button class="btn btn-soft btn-sm btn-block" data-add="${p.id}" aria-label="Tambah ${esc(p.name)} ke keranjang">${icon('plus')}Tambah</button>
      </div>
    </article>`;
  }

  function miniProduct(p) {
    return `<div class="mini-product">
      <a href="#/marketplace/p/${p.id}" class="thumb" aria-hidden="true" tabindex="-1">${productImg(p)}</a>
      <div class="mini-body"><a href="#/marketplace/p/${p.id}" class="mini-name">${esc(p.name)}</a><div class="price-sm">${rupiah(HC.pricing.price(p))}</div></div>
      <button class="btn btn-mint btn-xs" data-add="${p.id}" aria-label="Tambah ${esc(p.name)}">${icon('plus')}Beli</button>
    </div>`;
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (b) { e.preventDefault(); HC.cart.add(b.dataset.add, Number(b.dataset.qty || 1)); }
  });

  /* ---------------- shell ---------------- */
  let shellMounted = false;
  function ensureShell() {
    if (shellMounted) return;
    const app = document.getElementById('app');
    const u = HC.store.get('profile') || HC.data.user;
    app.innerHTML = `
    <a class="skip" href="#view" onclick="event.preventDefault();document.getElementById('view').focus()">Lewati ke konten</a>
    <div class="shell">
      <aside class="sidebar" aria-label="Navigasi utama">
        <a class="brand" href="#/dashboard" aria-label="HYCANE beranda"><img class="brand-logo" src="${MARK}" alt=""><span class="brand-text"><b>HYCANE</b><small>Smart Hydroponic</small></span></a>
        <nav class="side-nav">${NAV.map((n) => (n.group ? `<div class="side-group">${n.group}</div>` : `<a href="${n.href}" data-nav="${n.id}">${icon(n.icon)}<span>${n.label}</span>${n.id === 'notifications' ? '<b class="count" data-count="notif" hidden></b>' : ''}</a>`)).join('')}</nav>
        <div class="side-foot">
          <button class="demo-chip" data-open-demo title="Buka Demo Tools (Shift+D)"><span class="dot"></span>Demo Mode: FESTAFORA 2026</button>
          <div class="user-card">
            <a href="#/profile"><span class="avatar">${icon('user')}</span><span><b>${esc(u.name.split(' ').slice(0, 2).join(' '))}</b><small>${esc(u.farm || 'Smart Farm A')}</small></span></a>
            <button class="icon-btn" data-logout aria-label="Keluar">${icon('logout')}</button>
          </div>
        </div>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <button class="icon-btn back-btn" data-back aria-label="Kembali" hidden>${icon('arrowLeft')}</button>
          <a class="brand-mobile" href="#/dashboard" aria-label="HYCANE"><img class="brand-logo" src="${MARK}" alt=""></a>
          <div class="tb-crumb"><img src="${MARK}" alt="" class="tb-logo">HYCANE ${icon('chevronRight')}<b id="page-title">Ecosystem Control</b></div>
          <div class="tb-center"><span class="sys-pill" id="device-pill" role="status" aria-live="polite"></span></div>
          <div class="topbar-right">
            <a class="plants-pill" href="#/crops" id="plants-pill">${icon('leaf')}<span></span></a>
            <a class="icon-btn" href="#/cart" aria-label="Keranjang">${icon('cart')}<b class="count" data-count="cart" hidden></b></a>
            <a class="icon-btn" href="#/notifications" aria-label="Notifikasi">${icon('bell')}<b class="count" data-count="notif" hidden></b></a>
            <button class="demo-tools-btn" data-open-demo title="Demo Tools (Shift+D)">${icon('sliders')}<span>Demo Tools</span></button>
            <a class="avatar" href="#/profile" aria-label="Profil">${icon('user')}</a>
          </div>
        </header>
        <div class="banner banner-offline" id="offline-banner" hidden>${icon('wifiOff')}<span>Perangkat offline. Menampilkan data terakhir yang diterima. <a href="#/state/offline">Pelajari</a></span></div>
        <main id="view" class="view" tabindex="-1"></main>
      </div>
      <nav class="bottomnav" aria-label="Navigasi bawah">
        ${BOTTOM.map((id) => { const n = ITEMS.find((x) => x.id === id); return `<a href="${n.href}" data-nav="${n.id}">${icon(n.icon)}<span>${{ dashboard: 'Dashboard', monitoring: 'Monitor', ai: 'Rekomendasi', marketplace: 'Toko' }[id]}</span></a>`; }).join('')}
        <button data-open-more aria-haspopup="dialog">${icon('grid')}<span>Lainnya</span></button>
      </nav>
      <div class="sheet-backdrop" id="more-sheet" hidden>
        <div class="sheet" role="dialog" aria-modal="true" aria-label="Menu lainnya">
          <div class="sheet-head"><strong>Menu</strong><button class="icon-btn" data-close-sheet aria-label="Tutup">${icon('x')}</button></div>
          <div class="sheet-grid">${ITEMS.filter((n) => !BOTTOM.includes(n.id)).map((n) => `<a href="${n.href}" data-close-sheet>${icon(n.icon)}<span>${n.label}</span></a>`).join('')}
            <button data-open-demo data-close-sheet>${icon('sliders')}<span>Demo Tools</span></button>
            <button data-logout>${icon('logout')}<span>Keluar</span></button></div>
        </div>
      </div>
      <div class="drawer-backdrop" id="demo-drawer" hidden>
        <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="demo-title">
          <div class="drawer-head"><div><div class="eyebrow">Demo Pitch FESTAFORA 2026 · presenter</div><h2 id="demo-title">Simulation Controls</h2></div><button class="icon-btn" data-close-demo aria-label="Tutup">${icon('x')}</button></div>
          <div id="demo-drawer-body"></div>
        </aside>
      </div>
    </div>`;
    shellMounted = true;
    wireShell();
    refreshCounts();
    refreshDevicePill();
  }
  function unmountShell() { shellMounted = false; }

  const logo = () => `<img class="brand-logo" src="${MARK}" alt="HYCANE">`;
  const initials = (n) => n.split(' ').slice(0, 2).map((w) => w[0]).join('');

  function wireShell() {
    const app = document.getElementById('app');
    app.addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t) return;
      if (t.hasAttribute('data-open-demo')) { e.preventDefault(); openDemo(); }
      if (t.hasAttribute('data-close-demo')) closeDemo();
      if (t.hasAttribute('data-open-more')) openSheet();
      if (t.hasAttribute('data-close-sheet')) closeSheet();
      if (t.hasAttribute('data-back')) HC.router.back('#/dashboard');
      if (t.hasAttribute('data-logout')) { e.preventDefault(); closeSheet(); logout(); }
    });
    $('#demo-drawer').addEventListener('click', (e) => { if (e.target.id === 'demo-drawer') closeDemo(); });
    $('#more-sheet').addEventListener('click', (e) => { if (e.target.id === 'more-sheet') closeSheet(); });
  }
  function openSheet() { $('#more-sheet').hidden = false; const f = $('#more-sheet a'); if (f) f.focus(); }
  function closeSheet() { const s = $('#more-sheet'); if (s) s.hidden = true; }

  let demoCleanup = null;
  function openDemo() {
    const d = $('#demo-drawer');
    if (!d) return;
    if (!d.hidden) { closeDemo(); return; }
    d.hidden = false;
    const body = $('#demo-drawer-body');
    body.innerHTML = demoControls();
    demoCleanup = mountDemoControls(body);
    const first = body.querySelector('button');
    if (first) first.focus();
  }
  function closeDemo() {
    const d = $('#demo-drawer');
    if (d) d.hidden = true;
    if (demoCleanup) { demoCleanup(); demoCleanup = null; }
  }

  async function logout() {
    const ok = await confirm('Keluar dari HYCANE?', 'Data demo (keranjang, pesanan, progres belajar) tetap tersimpan di perangkat ini.', 'Keluar');
    if (!ok) return;
    const a = HC.store.get('auth') || {};
    HC.store.set('auth', { loggedIn: false, remember: a.remember, email: a.email });
    HC.router.go('#/login');
  }

  function setPage(title, navId, showBack) {
    const t = $('#page-title');
    if (t) t.textContent = title;
    $$('[data-nav]').forEach((a) => { const on = a.dataset.nav === navId; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const b = $('[data-back]');
    if (b) b.hidden = !showBack;
    document.body.classList.toggle('has-back', !!showBack);
  }

  function refreshCounts() {
    const c = HC.cart.count(), n = HC.notify.unread();
    $$('[data-count="cart"]').forEach((el) => { el.hidden = !c; el.textContent = c > 99 ? '99+' : c; });
    $$('[data-count="notif"]').forEach((el) => { el.hidden = !n; el.textContent = n > 99 ? '99+' : n; });
  }

  function refreshDevicePill() {
    const el = $('#device-pill');
    if (!el) return;
    const off = HC.store.get('settings').offline;
    const snap = HC.sim.snapshot('A');
    const lvl = off ? 'offline' : HC.sim.overall(snap);
    const txt = off ? 'Perangkat Offline' : lvl === 'ok' ? 'Sistem Terhubung • Real-Time' : lvl === 'warn' ? 'Perlu Perhatian • Real-Time' : 'Kondisi Mendesak • Real-Time';
    el.className = 'sys-pill pill-' + LEVEL[lvl].cls;
    el.innerHTML = `<span class="dot ${lvl === 'warn' ? 'dot-warn' : lvl === 'crit' ? 'dot-crit' : lvl === 'offline' ? 'dot-muted' : ''}"></span><span>${txt}</span><span class="pill-time">${fmtTime(snap.timestamp)}</span>`;
    const ob = $('#offline-banner'); if (ob) ob.hidden = !off;
    const pp = $('#plants-pill span');
    if (pp) { const s = HC.model.plantStats(); pp.textContent = `${s.healthy}/${s.total} Tanaman Sehat`; }
  }

  /* ---------------- toast & modal ---------------- */
  function toast(msg, opts = {}) {
    let wrap = document.getElementById('toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; wrap.setAttribute('aria-live', 'polite'); wrap.setAttribute('role', 'status'); document.body.appendChild(wrap); }
    const el = document.createElement('div');
    const sev = opts.sev || 'info';
    el.className = 'toast toast-' + (LEVEL[sev] ? LEVEL[sev].cls : sev);
    el.innerHTML = `${icon(opts.icon || (LEVEL[sev] || LEVEL.info).icon)}<span class="toast-msg">${esc(msg)}</span>${opts.action ? `<a href="${opts.action.href}" class="toast-act">${esc(opts.action.label)}</a>` : ''}<button class="toast-x" aria-label="Tutup notifikasi">${icon('x')}</button>`;
    wrap.appendChild(el);
    while (wrap.children.length > 3) wrap.firstChild.remove();
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    el.querySelector('.toast-x').onclick = kill;
    const a = el.querySelector('.toast-act'); if (a) a.addEventListener('click', kill);
    setTimeout(kill, opts.duration || 4200);
  }

  function modal(html, opts = {}) {
    return new Promise((resolve) => {
      const back = document.createElement('div');
      back.className = 'modal-backdrop';
      back.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
      document.body.appendChild(back);
      const prev = document.activeElement;
      const close = (val) => { back.remove(); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); resolve(val); };
      const onKey = (e) => { if (e.key === 'Escape') close(null); };
      document.addEventListener('keydown', onKey);
      back.addEventListener('click', (e) => {
        if (e.target === back) close(null);
        const b = e.target.closest('[data-modal]');
        if (b) { if (opts.collect) opts.result = opts.collect(back); close(b.dataset.modal); }
      });
      if (opts.mount) opts.mount(back);
      const f = back.querySelector(opts.focus || '[data-modal="ok"], button');
      if (f) f.focus();
    });
  }
  async function confirm(title, body, okLabel = 'Ya', danger = false) {
    const r = await modal(`<h2>${esc(title)}</h2><p class="muted">${esc(body)}</p><div class="modal-actions"><button class="btn btn-ghost" data-modal="cancel">Batal</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-modal="ok">${esc(okLabel)}</button></div>`);
    return r === 'ok';
  }

  /* ---------------- Demo Tools / Simulation Controls ---------------- */
  const DEMO = [
    ['highPH', 'Simulate High pH', 'pH ± 7,4 (terlalu basa)', 'flask', 'Picu kenaikan pH'],
    ['lowWater', 'Simulate Low Water', '< 25% (risiko pompa kering)', 'waves', 'Picu air rendah'],
    ['highTDS', 'Simulate High TDS', '± 1.330 ppm (terlalu pekat)', 'zap', 'Picu kepekatan tinggi'],
    ['highTemp', 'Simulate High Temp', '± 31,8°C (risiko akar stres)', 'thermometer', 'Picu suhu tinggi'],
    ['pumpFail', 'Simulate Pump Failure', 'Aliran berhenti total', 'power', 'Matikan pompa'],
    ['lowPH', 'Simulate Low pH', 'pH ± 5,2 (terlalu asam)', 'flask', 'Picu penurunan pH'],
    ['lowTDS', 'Simulate Low TDS', '± 500 ppm (terlalu encer)', 'zap', 'Picu larutan encer'],
  ];
  function demoTiles() {
    return DEMO.map(([k, t, d, ic, cta]) => `<button class="sim-tile ${k === 'pumpFail' || k === 'lowWater' || k === 'highTemp' ? 'danger' : ''}" data-trigger="${k}">
      <span class="sim-top"><b>${t}</b><span class="sim-ic">${icon(ic)}</span></span><span class="sim-desc">${d}</span><span class="sim-cta">${cta}${icon('arrowRight')}<em data-active-flag="${k}" hidden>aktif</em></span></button>`).join('') +
      `<button class="sim-tile green" data-demo-normal><span class="sim-top"><b>Reset to Normal</b><span class="sim-ic">${icon('refresh')}</span></span><span class="sim-desc">pH 6,2 • 880 ppm • 26,4°C • 78%</span><span class="sim-cta">Kembalikan kondisi ideal${icon('arrowRight')}</span></button>`;
  }
  function demoControls() {
    const s = HC.store.get('settings');
    return `<div class="demo-panel">
      <p class="muted small">Nilai sensor bergerak <b>bertahap</b> menuju kondisi abnormal, lalu status, rekomendasi, dan notifikasi bereaksi otomatis. Berlaku untuk Rak Sayur Daun (HYCANE-001).</p>
      <div class="demo-live" data-demo-live></div>
      <div class="sim-grid">${demoTiles()}</div>
      <div class="demo-toggles">
        <label class="switch"><input type="checkbox" data-setting="autoEvents" ${s.autoEvents ? 'checked' : ''}><span></span>Event acak otomatis (1 tiap 45–120 detik)</label>
        <label class="switch"><input type="checkbox" data-setting="offline" ${s.offline ? 'checked' : ''}><span></span>Simulasikan perangkat offline</label>
        <label class="switch"><input type="checkbox" data-setting="presenter" ${s.presenter ? 'checked' : ''}><span></span>Tampilkan data margin (presenter)</label>
      </div>
      <div class="demo-links">
        <a href="#/monitoring" data-close-demo>${icon('wifi')}Live Monitoring</a>
        <a href="#/demo" data-close-demo>${icon('sliders')}Halaman Demo</a>
        <a href="#/state/offline" data-close-demo>${icon('wifiOff')}Offline</a>
        <a href="#/state/error" data-close-demo>${icon('bug')}Error</a>
        <a href="#/state/empty" data-close-demo>${icon('package')}Empty</a>
      </div>
      <button class="btn btn-danger-soft btn-block" data-reset-demo>${icon('history')}Reset Demo (kembali ke kondisi awal)</button>
    </div>`;
  }
  function mountDemoControls(root) {
    const live = root.querySelector('[data-demo-live]');
    const paint = () => {
      const s = HC.sim.snapshot('A');
      if (live) live.innerHTML = ['ph', 'tds', 'temperature', 'waterLevel'].map((m) => `<span class="lv lv-${s.levels[m]}">${METRICS[m].label}: <b>${fmt(s[m], m === 'ph' ? 2 : METRICS[m].digits)}${m === 'temperature' ? '°C' : m === 'waterLevel' ? '%' : ''}</b></span>`).join('') + `<span class="lv lv-${s.levels.pump}">Pompa: <b>${s.pumpOn ? 'ON' : 'OFF'}</b></span>`;
      root.querySelectorAll('[data-active-flag]').forEach((el) => { el.hidden = !s.events[el.dataset.activeFlag]; });
    };
    paint();
    const offs = [HC.bus.on('sim:tick', paint), HC.bus.on('sim:event', paint)];
    const onClick = async (e) => {
      const t = e.target.closest('button');
      if (!t || !root.contains(t)) return;
      if (t.dataset.trigger) { HC.sim.trigger(t.dataset.trigger); toast(`Simulasi dimulai: ${HC.sim.EVENTS[t.dataset.trigger].label}. Nilai bergerak bertahap.`, { icon: 'sliders' }); }
      if (t.hasAttribute('data-demo-normal')) { HC.sim.resetNormal(); toast('Kembali ke normal. Nilai pulih bertahap.', { sev: 'ok' }); }
      if (t.hasAttribute('data-reset-demo')) {
        const ok = await confirm('Reset seluruh demo?', 'Sensor, alert, keranjang, notifikasi, pesanan demo, tanaman, jurnal & progres belajar kembali ke kondisi awal. Katalog tidak terhapus.', 'Reset Demo', true);
        if (ok) { HC.app.resetDemo(); closeDemo(); }
      }
    };
    const onChange = (e) => {
      const k = e.target.dataset.setting;
      if (!k) return;
      HC.store.update('settings', (s) => Object.assign(s, { [k]: e.target.checked }));
      if (k === 'offline') refreshDevicePill();
      HC.bus.emit('settings', k);
    };
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    return () => { offs.forEach((f) => f()); root.removeEventListener('click', onClick); root.removeEventListener('change', onChange); };
  }

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '');
    if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !typing && shellMounted) { e.preventDefault(); openDemo(); }
    if (e.key === 'Escape') { closeDemo(); closeSheet(); }
  });

  function emptyState({ icon: ic = 'package', title, body, actions = '' }) {
    return `<div class="empty">${HC.icon(ic, 'empty-ic')}<h2>${esc(title)}</h2><p>${esc(body)}</p><div class="empty-actions">${actions}</div></div>`;
  }
  function qtyStepper(id, qty, attr = 'data-qty-id') {
    return `<div class="qty" role="group" aria-label="Jumlah"><button class="qty-btn" ${attr}="${id}" data-delta="-1" aria-label="Kurangi">${icon('minus')}</button><span class="qty-val" aria-live="polite">${qty}</span><button class="qty-btn" ${attr}="${id}" data-delta="1" aria-label="Tambah">${icon('plus')}</button></div>`;
  }

  /* Range bar with zones and a live marker. lo/hi = safe range, min/max = scale ends. */
  function rangeBar(v, lo, hi, min, max, level) {
    const pct = (x) => Math.max(0, Math.min(100, ((x - min) / (max - min)) * 100));
    return `<div class="rangebar" role="img" aria-label="Nilai ${fmt(v, 1)}, rentang aman ${fmt(lo, 1)}–${fmt(hi, 1)}"><span class="z z-lo" style="width:${pct(lo)}%"></span><span class="z z-ok" style="width:${pct(hi) - pct(lo)}%"></span><span class="z z-hi" style="width:${100 - pct(hi)}%"></span><span class="mk ${level === 'ok' ? 'ok' : level === 'warn' ? 'warn' : ''}" style="left:${pct(v)}%"></span></div>`;
  }

  /* Decorative QR-style pattern (deterministic from text). Clearly an illustration, not a scannable code. */
  function qrArt(text, size = 120) {
    let h = 0; for (const ch of String(text)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rng = HC.util.makeRng(h), n = 21, c = size / n; let cells = '';
    const finder = (x, y) => `<rect x="${x * c}" y="${y * c}" width="${7 * c}" height="${7 * c}" fill="#0b1c30"/><rect x="${(x + 1) * c}" y="${(y + 1) * c}" width="${5 * c}" height="${5 * c}" fill="#fff"/><rect x="${(x + 2) * c}" y="${(y + 2) * c}" width="${3 * c}" height="${3 * c}" fill="#0b1c30"/>`;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inF && rng() > 0.55) cells += `<rect x="${x * c}" y="${y * c}" width="${c}" height="${c}" fill="#0b1c30"/>`;
    }
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Ilustrasi kode QR (demo)"><rect width="${size}" height="${size}" fill="#fff"/>${cells}${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}</svg>`;
  }

  /* Trigger a client-side file download (CSV, etc.). */
  function download(name, text, type = 'text/csv') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  return { LOGO_WHITE, MARK_WHITE, ensureShell, unmountShell, setPage, refreshCounts, refreshDevicePill, toast, modal, confirm, badge, pill, LEVEL, METRICS, describe, range, img, productArt, productImg, productCard, miniProduct, stars, demoControls, mountDemoControls, demoTiles, openDemo, closeDemo, emptyState, qtyStepper, rangeBar, qrArt, download, logo, initials, PLACEHOLDER, LOGO, MARK };
})();
