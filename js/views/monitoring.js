/* 03 Live Monitoring — Stitch 03_live_monitoring: device strip, zone banner, four sensor panels,
   Simulation Controls (demo pitch) with a live event log, and short explainer cards. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

HC.views.monitoring = (function () {
  const { esc, fmt, fmtTime, fmtShortTime, timeAgo } = HC.util;
  const icon = HC.icon;
  const METRICS = ['ph', 'tds', 'temperature', 'waterLevel'];
  const SCALE = { ph: [4.5, 8], tds: { A: [300, 1500], B: [800, 2300] }, temperature: [18, 34], waterLevel: [0, 100] };
  const FOOT = {
    ph: ['checkCircle', 'Larutan dalam rentang yang mendukung penyerapan nutrisi.'],
    tds: ['zap', 'Kepekatan stabil. EC dihitung dari TDS dan bergerak bersama.'],
    temperature: ['thermometer', 'Suhu air yang sejuk membantu akar tetap nyaman.'],
    waterLevel: ['shield', 'Level cukup agar pompa tidak berjalan kering.'],
  };
  let sys = 'A';

  const scaleOf = (m) => (Array.isArray(SCALE[m]) ? SCALE[m] : SCALE[m][sys]);
  const stats = (m) => { const v = HC.sim.history(sys).map((p) => p[m]); return { min: Math.min(...v), max: Math.max(...v) }; };

  function panel(m, snap, offline) {
    const meta = HC.ui.METRICS[m];
    const th = HC.sim.THRESH[sys][m];
    const lvl = offline ? 'offline' : snap.levels[m];
    const [smin, smax] = scaleOf(m);
    const lo = th.warn[0], hi = m === 'waterLevel' ? 100 : th.warn[1];
    const pct = (x) => Math.max(0, Math.min(100, ((x - smin) / (smax - smin)) * 100));
    const sysInfo = HC.data.systems[sys];
    const sub = m === 'tds' ? `(${fmt(snap.ec, 2)} mS/cm)` : m === 'waterLevel' ? `(${fmt((snap.waterLevel / 100) * sysInfo.tankL, 1)} Liter)` : '';
    const stTxt = { ok: { ph: 'Optimal', tds: 'Stabil', temperature: 'Sejuk Ideal', waterLevel: `Aman (${sysInfo.tankL} L Tank)` }[m] }[lvl] || HC.ui.LEVEL[lvl].label;
    const scaleTop = m === 'waterLevel'
      ? `<span class="red">Kritis &lt;${th.crit[0]}%</span><b>Normal &gt;${th.warn[0]}%</b><span>${sysInfo.tankL} L</span>`
      : `<span>${fmt(lo, m === 'tds' ? 0 : 1)} Min</span><b>${m === 'ph' ? 'Target: 6,0–6,5' : m === 'tds' ? `Normal: ${fmt(lo)}–${fmt(hi)}` : `Rentang: ${fmt(lo, 1)}–${fmt(hi, 1)}°C`}</b><span>${fmt(hi, m === 'tds' ? 0 : 1)} Max</span>`;
    return `<section class="card mon-panel ${lvl !== 'ok' ? 'mon-' + HC.ui.LEVEL[lvl].cls : ''}" id="mon-${m}" data-mon="${m}">
      <div class="mon-top"><div><div class="label-sm">${meta.eyebrow}</div><h2>${meta.panel}</h2></div><span data-mon-badge>${HC.ui.pill(lvl, stTxt)}</span></div>
      <div class="mon-val"><b data-mon-val>${fmt(snap[m], m === 'ph' ? 2 : meta.digits)}</b><small>${meta.unit}</small>${sub ? `<span class="pill pill-outline" data-mon-sub>${sub}</span>` : ''}</div>
      <div class="scale"><div class="scale-top">${scaleTop}</div><div class="track"><span class="tz" style="left:${pct(lo)}%;width:${pct(hi) - pct(lo)}%"></span><span class="tv" data-mon-bar style="width:${pct(snap[m])}%"></span></div></div>
      <div class="row-between label-sm mon-tl"><span>Timeline 3 menit</span><span data-mon-range></span></div>
      <div class="chart-box spark"><canvas data-mon-chart="${m}" role="img" aria-label="Grafik ${meta.label}"></canvas></div>
      <div class="mon-foot">${icon(FOOT[m][0])}<span data-mon-desc>${esc(lvl === 'ok' ? FOOT[m][1] : HC.ui.describe(m, snap[m], snap.levels[m], sys) + '. Buka Rekomendasi untuk langkahnya.')}</span><a class="link small" href="#/learn/${meta.lesson}">Pelajari</a></div>
    </section>`;
  }

  function logHtml() {
    const list = (HC.store.get('simlog') || []).slice(0, 6);
    return list.map((l) => `<li class="log-item"><span class="log-ic log-${l.sev}">${icon(l.sev === 'crit' ? 'octagon' : l.sev === 'warn' ? 'alert' : l.sev === 'info' ? 'sliders' : 'checkCircle')}</span><div><div class="row-between"><b>${esc(l.title)}</b><span class="tiny muted mono">${fmtTime(l.at)}</span></div><p>${esc(l.body)}</p></div></li>`).join('');
  }

  function render() {
    const q = HC.util.query();
    sys = q.get('sys') === 'B' ? 'B' : 'A';
    const snap = HC.sim.snapshot(sys);
    const offline = HC.store.get('settings').offline;
    const S = HC.data.systems[sys];
    const sh = snap.sensorHealth;
    const crops = HC.store.get('crops').map(HC.model.crop).filter((c) => c.system === sys);
    return `<div class="page">
      <section class="card dev-strip">
        <div><span class="pill pill-lg ${offline ? 'pill-muted' : 'pill-ok'}"><span class="dot ${offline ? 'dot-muted' : ''}"></span>${offline ? 'Perangkat Offline' : `IoT Hardware Terhubung (${S.device})`}</span>
          <div class="dev-meta muted small">${icon('wifi')}Wi-Fi ${esc(HC.data.device.wifi)} (sinyal ${offline ? '-' : '94%'}) • ${icon('refresh')}<span data-ts>${fmtTime(snap.timestamp)}</span> • Interval demo 2 detik</div></div>
        <div class="dev-chips" data-health>${healthChips(sh, snap)}</div>
      </section>

      <section class="zone-banner">
        <div class="zone-copy">
          <div class="row"><span class="pill pill-solid">ZONA ${sys}: ${S.type} ${esc(S.name.toUpperCase())}</span><span class="muted small">${crops.length ? `${esc(crops.map((c) => c.name).join(', '))} · hari ke-${crops[0].age}` : ''}</span></div>
          <h1>Stabilitas Nutrisi & Hidrologi</h1>
          <p>Sensor mengirim pembacaan setiap 2 detik (simulasi demo). HYCANE menilai tiap angka terhadap batas aman lalu menerjemahkannya menjadi status dan tindakan yang mudah dipahami.</p>
          <div class="zone-legend"><span><span class="dot"></span>Dalam Batas Aman</span><span><span class="dot dot-warn"></span>Perhatian</span><span><span class="dot dot-crit"></span>Mendesak</span></div>
          <div class="seg" role="tablist" aria-label="Pilih rak">${Object.values(HC.data.systems).map((s) => `<button role="tab" aria-selected="${s.id === sys}" data-sys="${s.id}">${esc(s.name)} <small>${s.type}</small></button>`).join('')}</div>
        </div>
        <div class="zone-img">${HC.ui.img('assets/images/stitch/s03-05.jpg', 'Instalasi NFT dengan selada')}</div>
      </section>

      <div class="g4 mon-grid">${METRICS.map((m) => panel(m, snap, offline)).join('')}</div>

      <section class="card sim-card">
        <div class="sim-head panel">
          <div class="row"><span class="icon-box sky">${icon('sliders')}</span><div><div class="row"><h2>Simulation Controls</h2><span class="pill pill-info">DEMO PITCH FESTAFORA 2026</span></div><p class="muted small">Gunakan tombol ini untuk mensimulasikan skenario masalah hidroponik secara langsung di hadapan dewan juri.</p></div></div>
          <div class="row small"><span class="muted">Mode:</span><span class="pill pill-info">Simulasi Sensor (bukan hardware nyata)</span></div>
        </div>
        <div class="sim-body">
          <div><div class="row-between label-sm sim-sub"><span>Injeksi Anomali Sensor</span><span class="muted">Klik untuk memicu respons rekomendasi</span></div>
            <div class="sim-grid" data-sim-tiles>${HC.ui.demoTiles()}</div></div>
          <div><div class="row-between label-sm sim-sub"><span>Status Log Live</span><span class="green">${offline ? 'Telemetri Terputus' : 'Telemetri Aktif'}</span></div>
            <div class="log-box"><ul class="log-list" data-log>${logHtml()}</ul>
              <div class="row-between log-foot small"><span class="muted">Protokol keamanan:</span><span class="row"><span class="pill pill-ok">Notifikasi Aktif</span><span class="pill pill-info">Rekomendasi Siap</span></span></div></div></div>
        </div>
      </section>

      <div class="g3">
        <div class="card card-sm explain">${'<span class="icon-box sm">' + icon('flask') + '</span>'}<div><b>Mengapa pH 5,8–6,8?</b><p>Pada rentang ini, sebagian besar unsur hara untuk sayur daun tersedia dengan baik. Rentang ideal bisa berbeda per tanaman.</p></div></div>
        <div class="card card-sm explain"><span class="icon-box sm sky">${icon('waves')}</span><div><b>Kenapa TDS & air saling terkait?</b><p>Saat air menguap, nutrisi tertinggal sehingga larutan makin pekat. Setelah isi ulang, cek kembali TDS dan pH.</p></div></div>
        <div class="card card-sm explain"><span class="icon-box sm">${icon('sparkles')}</span><div><b>Pitch Takeaway</b><p>HYCANE tidak berhenti di angka: setiap perubahan diterjemahkan menjadi status, alasan, dan langkah yang bisa dilakukan pemula.</p></div></div>
      </div>
    </div>`;
  }

  function healthChips(sh, snap) {
    return `<span class="pill pill-outline">pH Probe: <b>${fmt(sh.ph)}%</b></span><span class="pill pill-outline">TDS Probe: <b>${fmt(sh.tds)}%</b></span><span class="pill pill-outline">DS18B20: <b>${fmt(sh.temperature)}%</b></span><span class="pill pill-outline">Ultrasonik: <b>${fmt(sh.waterLevel)}%</b></span><span class="pill ${snap.pumpOn ? 'pill-ok' : 'pill-crit'}">${icon('power')}Pompa: ${snap.pumpOn ? 'Normal' : 'Mati'}</span><button class="btn btn-ghost btn-xs" data-toggle-pump>${snap.pumpOn ? 'Matikan' : 'Nyalakan'}</button>`;
  }

  function mount(root) {
    const { $ } = HC.util;
    const charts = {};
    METRICS.forEach((m) => { charts[m] = HC.charts.create($(`[data-mon-chart="${m}"]`, root), m, sys, { spark: true }); });
    const cleanupDemo = HC.ui.mountDemoControls(root.querySelector('.sim-card'));

    function update() {
      const snap = HC.sim.snapshot(sys);
      const offline = HC.store.get('settings').offline;
      METRICS.forEach((m) => {
        const c = $(`[data-mon="${m}"]`, root);
        const lvl = offline ? 'offline' : snap.levels[m];
        const meta = HC.ui.METRICS[m];
        $('[data-mon-val]', c).textContent = fmt(snap[m], m === 'ph' ? 2 : meta.digits);
        if (m === 'tds' && $('[data-mon-sub]', c)) $('[data-mon-sub]', c).textContent = `(${fmt(snap.ec, 2)} mS/cm)`;
        if (m === 'waterLevel') $('[data-mon-sub]', c).textContent = `(${fmt((snap.waterLevel / 100) * HC.data.systems[sys].tankL, 1)} Liter)`;
        const [smin, smax] = scaleOf(m);
        $('[data-mon-bar]', c).style.width = Math.max(0, Math.min(100, ((snap[m] - smin) / (smax - smin)) * 100)) + '%';
        const s = stats(m);
        $('[data-mon-range]', c).textContent = `min ${fmt(s.min, m === 'ph' ? 2 : meta.digits)} · maks ${fmt(s.max, m === 'ph' ? 2 : meta.digits)}`;
        c.className = `card mon-panel ${lvl !== 'ok' ? 'mon-' + HC.ui.LEVEL[lvl].cls : ''}`;
        const ok = { ph: 'Optimal', tds: 'Stabil', temperature: 'Sejuk Ideal', waterLevel: `Aman (${HC.data.systems[sys].tankL} L Tank)` }[m];
        const nb = HC.ui.pill(lvl, lvl === 'ok' ? ok : null); const b = $('[data-mon-badge]', c); if (b.innerHTML !== nb) b.innerHTML = nb;
        $('[data-mon-desc]', c).textContent = lvl === 'ok' ? FOOT[m][1] : HC.ui.describe(m, snap[m], snap.levels[m], sys) + '. Buka Rekomendasi untuk langkahnya.';
        if (!offline) charts[m].update();
      });
      $('[data-ts]', root).textContent = fmtTime(snap.timestamp);
      $('[data-health]', root).innerHTML = healthChips(snap.sensorHealth, snap);
    }
    update();

    root.addEventListener('click', async (e) => {
      const sb = e.target.closest('[data-sys]');
      if (sb && sb.dataset.sys !== sys) { HC.router.go('#/monitoring?sys=' + sb.dataset.sys); return; }
      if (e.target.closest('[data-toggle-pump]')) {
        const on = HC.sim.snapshot(sys).pumpOn;
        if (on && !(await HC.ui.confirm('Matikan pompa?', 'Aliran nutrisi ke akar akan berhenti. Gunakan hanya untuk perawatan singkat.', 'Matikan pompa'))) return;
        HC.sim.togglePump(sys); update();
      }
    });
    const focus = HC.util.query().get('m');
    if (focus) { const el = $('#mon-' + focus, root); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); }
    const paintLog = () => { const l = $('[data-log]', root); if (l) l.innerHTML = logHtml(); };
    const offs = [HC.bus.on('sim:tick', update), HC.bus.on('sim:event', update), HC.bus.on('store:simlog', paintLog)];
    return () => { offs.forEach((f) => f()); cleanupDemo(); Object.values(charts).forEach((c) => c.destroy()); };
  }

  return { render, mount };
})();
