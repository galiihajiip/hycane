/* 02 Dashboard — Stitch 02_dashboard: hero, Telemetri Biosistem, "Apa yang perlu dilakukan sekarang?",
   real-time chart, reservoir & media status, crops, quick actions, refill, learning card. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

HC.views.dashboard = (function () {
  const { esc, fmt, fmtTime, greeting, rupiah, daysBetween } = HC.util;
  const icon = HC.icon;
  const M = () => HC.ui.METRICS;
  const LV = (l) => HC.ui.LEVEL[l] || HC.ui.LEVEL.info;

  function heroHtml(snap, recs, offline) {
    const lvl = offline ? 'offline' : HC.sim.overall(snap);
    const chip = offline ? 'Perangkat Offline' : lvl === 'ok' ? 'Sistem Normal (Hijau)' : lvl === 'warn' ? 'Perlu Perhatian (Kuning)' : 'Kondisi Mendesak (Merah)';
    const msg = offline ? 'Menampilkan data terakhir yang diterima' : lvl === 'ok' ? 'Semua sistem berjalan normal' : `${recs.length} hal perlu ditangani`;
    return `<div class="dash-hero card">
      <div>
        <div class="row"><span class="pill pill-lg ${lvl === 'ok' ? 'pill-mintbright' : 'pill-' + LV(lvl).cls}">${chip}</span><span class="muted small">• ${icon('refresh')} Diperbarui <b data-ts>${fmtTime(snap.timestamp)}</b> (real-time IoT)</span></div>
        <h1 class="greet">${greeting()}, ${esc(HC.data.user.shortName)}.</h1>
        <p class="muted">${msg} • Terhubung ke <b class="ink">${HC.data.systems.A.device}</b></p>
      </div>
      <div class="hero-actions">
        <div class="local-box">${icon('cpu')}<div><b>Layar Lokal Aktif</b><small>Kit tetap menampilkan kondisi air tanpa Wi-Fi</small></div></div>
        <a class="btn btn-primary" href="#/diagnosis">${icon('bolt')}Quick Diagnostic</a>
      </div>
    </div>`;
  }

  function tile(metric, snap, offline) {
    const m = M()[metric];
    const lvl = offline ? 'offline' : snap.levels[metric];
    const digits = metric === 'ph' ? 1 : m.digits;
    return `<a class="tele ${lvl !== 'ok' ? 'tele-' + LV(lvl).cls : ''}" href="#/monitoring?m=${metric}" data-kpi="${metric}">
      <div class="tele-top"><span>${m.label}</span><span data-kpi-badge>${lvl === 'ok' ? '<span class="dot"></span>' : HC.ui.pill(lvl)}</span></div>
      <div class="tele-val"><b data-kpi-val>${fmt(snap[metric], digits)}</b><small>${m.unit}</small></div>
      <div class="tele-foot"><div class="row-between"><span class="tele-st" data-kpi-st>${LV(lvl).label === 'Normal' ? 'Normal & Aman' : LV(lvl).label}</span><span>${HC.ui.range(metric)}</span></div><span class="tele-desc" data-kpi-desc>${esc(HC.ui.describe(metric, snap[metric], snap.levels[metric]))}</span></div>
    </a>`;
  }
  function ecTile(snap) {
    return `<a class="tele" href="#/monitoring?m=tds" data-kpi="ec"><div class="tele-top"><span>EC</span><span class="pill pill-info">Turunan TDS</span></div>
      <div class="tele-val"><b data-kpi-val>${fmt(snap.ec, 2)}</b><small>mS/cm</small></div>
      <div class="tele-foot"><div class="row-between"><span class="tele-st">Bergerak bersama TDS</span><span>÷ 704</span></div><span class="tele-desc">Konduktivitas ion nutrisi</span></div></a>`;
  }
  function pumpTile(snap) {
    const on = snap.pumpOn;
    return `<a class="tele ${on ? '' : 'tele-crit'}" href="#/monitoring" data-kpi="pump"><div class="tele-top"><span>Status Pompa</span><span data-kpi-badge>${on ? '<span class="dot"></span>' : HC.ui.pill('crit')}</span></div>
      <div class="tele-val"><b class="${on ? 'green' : 'red'}" data-kpi-val>${on ? 'AKTIF' : 'MATI'}</b></div>
      <div class="tele-foot"><div class="row-between"><span class="tele-st">Aliran</span><span data-kpi-flow>${fmt(snap.flow, 1)} L/mnt</span></div><span class="tele-desc" data-kpi-desc>${on ? 'Sirkulasi nutrisi berjalan' : 'Aliran berhenti, periksa daya'}</span></div></a>`;
  }
  function plantsTile() {
    const s = HC.model.plantStats();
    return `<a class="tele tele-green" href="#/crops" data-kpi="plants"><div class="tele-top"><span>Kondisi Kebun</span>${icon('sprout')}</div>
      <div class="tele-val"><b data-kpi-val>${s.healthy}</b><small>/ ${s.total}</small></div>
      <div class="tele-foot"><div class="row-between"><span>${Math.round((s.healthy / s.total) * 100)}% sehat</span><span data-kpi-risk>${s.atRisk ? s.atRisk + ' berisiko' : (s.total - s.healthy) + ' dipantau'}</span></div><span class="tele-desc">${HC.store.get('crops').length} jenis tanaman di 2 rak</span></div></a>`;
  }

  function actionHtml(snap, recs, offline) {
    const lvl = offline ? 'offline' : HC.sim.overall(snap);
    const status = offline ? 'Status: Offline' : lvl === 'ok' ? 'Status: Sistem Normal' : lvl === 'warn' ? 'Status: Perlu Perhatian' : 'Status: Mendesak';
    const chips = [['ph', `pH ${fmt(snap.ph, 1)}`], ['tds', `Nutrisi ${fmt(snap.tds)} ppm`], ['temperature', `Suhu ${fmt(snap.temperature, 1)}°C`], ['waterLevel', `Air ${fmt(snap.waterLevel)}%`]];
    const word = { ok: { ph: 'Stabil', tds: '', temperature: '', waterLevel: 'Cukup' } };
    const chipHtml = chips.map(([k, t]) => { const l = snap.levels[k]; return `<span class="act-chip act-${LV(l).cls}">${icon(LV(l).icon)}${t}${l === 'ok' && word.ok[k] ? ' ' + word.ok[k] : l !== 'ok' ? ' · ' + LV(l).label : ''}</span>`; }).join('');
    const main = recs.length
      ? `<div class="act-main"><div><p class="act-msg"><b>${esc(recs[0].title)}</b> ${esc(recs[0].todo[0])}</p><div class="act-chips">${chipHtml}</div></div><a class="btn btn-dark" href="#/ai?focus=${recs[0].key}">Lihat Langkah Lengkap${icon('arrowRight')}</a></div>`
      : `<div class="act-main"><div><p class="act-msg">Tidak ada tindakan mendesak. Semua 4 parameter utama dalam rentang aman.</p><div class="act-chips">${chipHtml}</div></div><a class="btn btn-dark" href="#/ai">Lihat Detail Panduan & Diagnosis${icon('arrowRight')}</a></div>`;
    const r = HC.reco.mediaReminder();
    return `<section class="card act-card ${lvl !== 'ok' && !offline ? 'act-' + LV(lvl).cls : ''}">
      <div class="card-head"><div class="row"><span class="icon-box ${lvl === 'ok' ? '' : lvl === 'warn' ? 'warn' : 'crit'}">${icon(lvl === 'ok' ? 'checkCircle' : LV(lvl).icon)}</span><div><div class="eyebrow">Instruksi Langsung</div><h2 class="act-title">APA YANG PERLU DILAKUKAN SEKARANG?</h2></div></div>
        <span class="pill pill-lg ${lvl === 'ok' ? 'pill-ok' : 'pill-' + LV(lvl).cls}">${status}</span></div>
      ${main}
      <div class="early">${icon('info')}<span><b>Peringatan Dini:</b> ${r.daysLeft > 0 ? `Media ampas tebu di Rak Sayur Daun diperkirakan perlu diganti dalam ${r.daysLeft} hari.` : 'Media ampas tebu sudah waktunya diganti.'}</span><a class="link link-blue" href="#/marketplace/p/media-18">Siapkan Refill</a></div>
    </section>`;
  }

  function reservoirHtml(snap) {
    const sys = HC.data.systems.A;
    const liters = (snap.waterLevel / 100) * sys.tankL;
    const tdsPct = Math.min(100, (snap.tds / 1100) * 100);
    const meta = HC.store.get('meta');
    const age = daysBetween(meta.mediaChangedAt, new Date());
    const health = Math.round(Object.values(snap.sensorHealth).reduce((a, b) => a + b, 0) / 4);
    const row = (label, val, pct, cls = '') => `<div class="panel res-row"><div class="row-between"><span>${label}</span><b class="${cls}">${val}</b></div><div class="bar thin ${cls === 'warn' ? 'warn' : cls === 'blue' ? 'blue' : ''}"><span style="width:${Math.max(3, Math.min(100, pct))}%"></span></div></div>`;
    return `<div class="eyebrow muted-eyebrow">Reservoir & Media</div>
      <div class="row-between"><h2>Status Reservoir</h2>${icon('flask')}</div>
      <p class="muted small">Ringkasan tandon dan media tanam di ${esc(sys.name)}.</p>
      <div class="stack-sm res-rows">
        ${row('Volume tandon', `${fmt(liters, 1)} L / ${sys.tankL} L`, snap.waterLevel, snap.levels.waterLevel === 'ok' ? '' : 'warn')}
        ${row('Kepekatan nutrisi (TDS)', `${fmt(snap.tds)} ppm`, tdsPct, snap.levels.tds === 'ok' ? '' : 'warn')}
        ${row('Umur media ampas tebu', `${age} / ${HC.data.mediaCycle.lengthDays} hari`, (age / HC.data.mediaCycle.lengthDays) * 100, age > 30 ? 'warn' : '')}
        ${row('Kesehatan sensor rata-rata', `${health}%`, health, 'blue')}
      </div>
      <div class="panel panel-mint note small">${icon('leaf')}<span>Media ampas tebu bersifat biodegradable dan bisa dikomposkan setelah panen. Kinerjanya sebagai media hidroponik masih dalam tahap validasi.</span></div>`;
  }

  function cropCards() {
    const crops = HC.store.get('crops').map(HC.model.crop).slice(0, 4);
    return crops.map((c) => {
      const st = c.level === 'ok' ? (c.score >= 94 ? 'Sangat Sehat' : 'Sehat') : c.level === 'warn' ? 'Perhatian' : 'Berisiko';
      return `<a class="card card-flush crop-tile" href="#/crops/${c.id}">
        <div class="ph crop-tile-img">${HC.ui.img(c.image, c.name)}<span class="ph-badge right pill ${c.level === 'ok' ? 'pill-solid' : c.level === 'warn' ? 'pill-warn' : 'pill-crit'}">${st}</span><span class="ph-cap"><span class="cap">Slot ${esc(c.slotLabel)}</span></span></div>
        <div class="crop-tile-body"><h3>${esc(c.name)} ${esc(c.variety || '')}</h3>
          <div class="row-between"><span class="muted">Hari ke-${c.age}</span><span class="pill pill-info">${esc(c.stage.label)}</span></div>
          <div class="panel vit"><div class="row-between small"><span>Skor Vitalitas</span><b>${c.score}%</b></div><div class="bar thin ${c.level === 'ok' ? '' : 'warn'}"><span style="width:${c.score}%"></span></div><span class="small muted">${c.harvestIn ? `Estimasi panen ${c.harvestIn} hari lagi` : 'Siap panen'}</span></div>
        </div></a>`;
    }).join('');
  }

  function refillHtml() {
    const r = HC.reco.mediaReminder();
    const m = HC.data.productById['media-18'], a = HC.data.productById['abmix-leafy'];
    return `<div class="card refill"><div class="row-between"><div><div class="eyebrow">Sirkularitas Tebu</div><h2>Waktunya Isi Ulang?</h2></div>${icon('package')}</div>
      <div class="panel refill-row"><div><b>${esc(m.name)}</b><small>${r.daysLeft > 0 ? `Media saat ini cukup untuk ± ${r.daysLeft} hari` : 'Sudah waktunya diganti'} · ${rupiah(HC.pricing.price(m))}</small></div><button class="btn btn-primary btn-sm" data-add="media-18">Beli Refill Media</button></div>
      <div class="panel refill-row"><div><b>${esc(a.name)}</b><small>Terakhir dibeli di pesanan #HC1019 · ${rupiah(HC.pricing.price(a))}</small></div><button class="btn btn-soft btn-sm" data-add="abmix-leafy">Pesan AB Mix</button></div>
      <button class="link-btn small" data-reorder>${icon('repeat')}Beli keduanya sekaligus</button></div>`;
  }

  function render() {
    const snap = HC.sim.snapshot('A');
    const offline = HC.store.get('settings').offline;
    const recs = offline ? [] : HC.reco.evaluate(snap, 'A');
    const tabs = [['ph', 'pH Air'], ['tds', 'TDS / EC'], ['temperature', 'Suhu Air'], ['waterLevel', 'Ketinggian Air']];
    return `<div class="page dash">
      <div data-hero>${heroHtml(snap, recs, offline)}</div>

      <section>
        <div class="sec-title tele-head"><h2>${icon('activity')}Telemetri Biosistem</h2><span class="label-sm">Standar tanaman hidroponik tropis (acuan demo)</span></div>
        <div class="tele-grid">${tile('ph', snap, offline)}${tile('tds', snap, offline)}${ecTile(snap)}${tile('temperature', snap, offline)}${tile('waterLevel', snap, offline)}${pumpTile(snap)}${plantsTile()}</div>
      </section>

      <div data-action>${actionHtml(snap, recs, offline)}</div>

      <div class="split-wide">
        <section class="card chart-card">
          <div class="card-head"><div><h2>Kondisi Sistem Secara Real-Time</h2><p>Riwayat pembacaan sensor 3 menit terakhir dengan rentang aman.</p></div>
            <div class="seg" role="tablist" aria-label="Pilih parameter">${tabs.map(([m, l], i) => `<button role="tab" aria-selected="${i === 0}" data-metric="${m}">${l}</button>`).join('')}</div></div>
          <div class="chart-wrap">
            <div class="row-between small chart-legend"><span class="row"><span class="legend-sq"></span><span data-chart-label>Rentang Ideal (${HC.ui.range('ph')} pH)</span></span><b class="green" data-chart-now></b></div>
            <div class="chart-box"><canvas data-chart role="img" aria-label="Grafik pH real-time"></canvas></div>
          </div>
          <div class="panel panel-sky row-between learn-hint"><span class="row">${icon('info')}<span>Bagaimana membaca grafik ini? Pelajari cara kerja pH dalam 5 menit di Modul Edukasi.</span></span><a class="link link-blue" href="#/learn/ph">Buka Modul${icon('arrowRight')}</a></div>
        </section>
        <section class="card" data-reservoir>${reservoirHtml(snap)}</section>
      </div>

      <section>
        <div class="sec-title"><div><h2 class="h-xl">Tanamanmu di Kit 001</h2><p>Pertumbuhan dan fase setiap batch di ${HC.model.plantStats().total} lubang tanam.</p></div><a class="btn btn-soft btn-sm" href="#/crops">Lihat Semua Lubang Tanam${icon('chevronRight')}</a></div>
        <div class="g4 crop-tiles">${cropCards()}</div>
      </section>

      <div class="g3 dash-bottom">
        <div class="card"><h2>Aksi Cepat Sistem</h2><p class="muted small">Jalan pintas ke kebutuhan harian kebunmu.</p>
          <div class="quick-grid"><a href="#/monitoring">${icon('search')}<span>Cek Kondisi</span></a><a href="#/ai">${icon('sparkles')}<span>Rekomendasi AI</span></a><a href="#/crops/new">${icon('plus')}<span>Tambah Tanaman</span></a><a href="#/marketplace">${icon('basket')}<span>Belanja Kebutuhan</span></a></div>
          <div class="row-between tiny quick-foot"><span class="muted">Firmware ${HC.data.device.fw} (demo)</span><span class="green">Sensor aktif 4/4</span></div></div>
        ${refillHtml()}
        <a class="card learn-card" href="#/learn/tds"><span class="icon-box sm glass">${icon('graduation')}</span><div class="eyebrow light">Modul Kilat Petani</div><h2>Masih bingung membaca TDS & pH?</h2><p>Pahami cara menjaga keseimbangan nutrisi hidroponik dari nol dalam panduan singkat bergambar.</p><div class="row-between"><span class="small">${icon('clock')} 4–5 Menit Saja</span><span class="btn btn-white btn-sm">Mulai Belajar${icon('play')}</span></div></a>
      </div>
    </div>`;
  }

  function mount(root) {
    const { $, $$ } = HC.util;
    let metric = 'ph';
    let chart = HC.charts.create($('[data-chart]', root), metric, 'A');
    let lastSig = '';
    const sigOf = (snap, offline) => (offline ? 'off|' : '') + HC.reco.evaluate(snap, 'A').map((r) => r.key + r.severity).join('|') + '|' + Object.values(snap.levels).join('');

    const paintNow = (snap) => {
      const m = M()[metric];
      $('[data-chart-now]', root).textContent = `● Sekarang: ${fmt(snap[metric], metric === 'ph' ? 2 : m.digits)} ${m.unit}`;
    };

    function update() {
      const snap = HC.sim.snapshot('A');
      const offline = HC.store.get('settings').offline;
      ['ph', 'tds', 'temperature', 'waterLevel'].forEach((k) => {
        const card = $(`[data-kpi="${k}"]`, root);
        if (!card) return;
        const lvl = offline ? 'offline' : snap.levels[k];
        $('[data-kpi-val]', card).textContent = fmt(snap[k], k === 'ph' ? 1 : M()[k].digits);
        $('[data-kpi-desc]', card).textContent = HC.ui.describe(k, snap[k], snap.levels[k]);
        $('[data-kpi-st]', card).textContent = lvl === 'ok' ? 'Normal & Aman' : LV(lvl).label;
        card.className = 'tele' + (lvl !== 'ok' ? ' tele-' + LV(lvl).cls : '');
        const b = $('[data-kpi-badge]', card); const nb = lvl === 'ok' ? '<span class="dot"></span>' : HC.ui.pill(lvl); if (b.innerHTML !== nb) b.innerHTML = nb;
      });
      const ec = $('[data-kpi="ec"] [data-kpi-val]', root); if (ec) ec.textContent = fmt(snap.ec, 2);
      const pk = $('[data-kpi="pump"]', root); if (pk) pk.outerHTML = pumpTile(snap);
      const pl = $('[data-kpi="plants"]', root); if (pl) pl.outerHTML = plantsTile();
      const ts = $('[data-ts]', root); if (ts) ts.textContent = fmtTime(snap.timestamp);
      const sig = sigOf(snap, offline);
      if (sig !== lastSig) {
        lastSig = sig;
        const recs = offline ? [] : HC.reco.evaluate(snap, 'A');
        $('[data-action]', root).innerHTML = actionHtml(snap, recs, offline);
        $('[data-hero]', root).innerHTML = heroHtml(snap, recs, offline);
      }
      $('[data-reservoir]', root).innerHTML = reservoirHtml(snap);
      if (!offline) chart.update();
      paintNow(snap);
    }
    paintNow(HC.sim.snapshot('A'));
    lastSig = sigOf(HC.sim.snapshot('A'), HC.store.get('settings').offline);

    root.querySelector('.seg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-metric]');
      if (!b || b.dataset.metric === metric) return;
      metric = b.dataset.metric;
      $$('.seg [data-metric]', root).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      chart.destroy();
      const canvas = $('[data-chart]', root);
      canvas.setAttribute('aria-label', `Grafik ${M()[metric].label} real-time`);
      chart = HC.charts.create(canvas, metric, 'A');
      const unit = { ph: 'pH', tds: 'ppm', temperature: '°C', waterLevel: '%' }[metric];
      $('[data-chart-label]', root).textContent = `Rentang Ideal (${HC.ui.range(metric)}${metric === 'ph' || metric === 'tds' ? ' ' + unit : ''})`;
      paintNow(HC.sim.snapshot('A'));
    });
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-reorder]')) HC.cart.addMany(HC.data.mediaCycle.reorder, 'Bagasse Media Refill 18 + AB Mix ditambahkan ke keranjang');
    });
    const offs = [HC.bus.on('sim:tick', update), HC.bus.on('sim:event', update), HC.bus.on('settings', update)];
    return () => { offs.forEach((f) => f()); chart.destroy(); };
  }

  return { render, mount };
})();
