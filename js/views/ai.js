/* 04 AI Recommendation (demo, rule-based) — Stitch 04_ai_recommendation. Reacts live to the sensor snapshot. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

HC.views.ai = (function () {
  const { esc, fmt, fmtShortTime, timeAgo, rupiah } = HC.util;
  const icon = HC.icon;
  const resolving = new Set();
  const firstSeen = {};
  let focusKey = null;

  const SCALE = {
    ph: { min: 4.5, max: 8, labels: ['Terlalu Asam', 'Zona Optimal', 'Terlalu Basa'], unit: '' },
    tds: { min: 300, max: 1600, labels: ['Terlalu Encer', 'Zona Optimal', 'Terlalu Pekat'], unit: ' ppm' },
    temp: { min: 18, max: 34, labels: ['Terlalu Dingin', 'Zona Nyaman', 'Terlalu Panas'], unit: '°C' },
    water: { min: 0, max: 100, labels: ['Kritis', 'Mulai Rendah', 'Aman'], unit: '%' },
  };
  const META = {
    pump: { risk: 'Risiko akar mengering: tinggi', time: 'Waktu tindakan: segera (± 5 menit)', metric: null },
    water: { risk: 'Risiko pompa berjalan kering', time: 'Waktu tindakan: ± 10 menit', metric: 'waterLevel' },
    temp: { risk: 'Risiko akar stres & busuk', time: 'Waktu tindakan: ± 15–30 menit', metric: 'temperature' },
    ph: { risk: 'Risiko daun menguning: sedang', time: 'Waktu tindakan: ± 20 menit', metric: 'ph' },
    tds: { risk: 'Risiko ujung daun terbakar / tumbuh lambat', time: 'Waktu tindakan: ± 15 menit', metric: 'tds' },
    sensor: { risk: 'Risiko pembacaan kurang akurat', time: 'Waktu tindakan: ± 15 menit', metric: null },
  };

  function trend(metric, sys) {
    const h = HC.sim.history(sys).slice(-30);
    if (h.length < 2) return 'Tren: stabil';
    const d = h[h.length - 1][metric] - h[0][metric];
    const perMin = d / ((h[h.length - 1].t - h[0].t) / 60000 || 1);
    const digits = metric === 'ph' ? 2 : metric === 'tds' ? 0 : 1;
    if (Math.abs(d) < { ph: 0.05, tds: 15, temperature: 0.2, waterLevel: 1.5 }[metric]) return 'Tren: stabil';
    return `Tren: ${d > 0 ? 'naik' : 'turun'} (${d > 0 ? '+' : ''}${fmt(perMin, digits)}/menit)`;
  }

  function allRecs() {
    if (HC.store.get('settings').offline) return { list: [], offline: true };
    const list = HC.reco.evaluate(HC.sim.snapshot('A'), 'A').concat(HC.reco.evaluate(HC.sim.snapshot('B'), 'B'));
    list.forEach((r) => { const k = r.device + r.key; if (!firstSeen[k]) firstSeen[k] = Date.now(); });
    Object.keys(firstSeen).forEach((k) => { if (!list.some((r) => r.device + r.key === k)) delete firstSeen[k]; });
    return { list, offline: false };
  }

  /* Scale definition for a recommendation (null for pump/sensor). */
  function scaleOf(r) {
    const m = (META[r.key] || {}).metric;
    if (!m) return null;
    const sc = SCALE[r.key];
    const th = HC.sim.THRESH[r.device];
    const lo = m === 'waterLevel' ? th.waterLevel.crit[0] : th[m].warn[0];
    const hi = m === 'waterLevel' ? th.waterLevel.warn[0] : th[m].warn[1];
    const wide = r.key === 'tds' && r.device === 'B';
    return { m, sc, lo, hi, min: wide ? 800 : sc.min, max: wide ? 2300 : sc.max };
  }
  const barOf = (r) => { const s = scaleOf(r); const snap = HC.sim.snapshot(r.device); return HC.ui.rangeBar(snap[s.m], s.lo, s.hi, s.min, s.max, snap.levels[s.m]); };

  function scaleHtml(r) {
    const s = scaleOf(r);
    if (!s) return '';
    const f = (x) => fmt(x, r.key === 'ph' ? 1 : r.key === 'temp' ? 1 : 0);
    return `<div class="rec-scale"><div class="range-labels"><span class="lo">${s.sc.labels[0]} (&lt; ${f(s.lo)}${s.sc.unit})</span><span class="ok">${s.sc.labels[1]} (${f(s.lo)}–${f(s.hi)}${s.sc.unit})</span><span class="hi">${s.sc.labels[2]} (&gt; ${f(s.hi)}${s.sc.unit})</span></div><div data-rec-bar>${barOf(r)}</div></div>`;
  }

  function mainCard(r) {
    const L = HC.ui.LEVEL[r.severity];
    const busy = resolving.has(r.device + '-' + r.key);
    const m = META[r.key] || META.sensor;
    const prod = (r.products || []).map((id) => HC.data.productById[id]).filter(Boolean)[0];
    const safe = r.key === 'pump' ? '± 2,4 L/mnt' : r.key === 'sensor' ? '> 96%' : HC.ui.range(m.metric, r.device);
    const seen = firstSeen[r.device + r.key];
    return `<article class="card rec-main rec-${L.cls} ${busy ? 'rec-resolving' : ''}" data-rec="${r.device}-${r.key}">
      <div class="rec-stripe"><span></span></div>
      <div class="row-between"><span class="pill pill-lg pill-${L.cls}"><span class="dot ${r.severity === 'crit' ? 'dot-crit' : 'dot-warn'}"></span>${L.label} (${r.severity === 'crit' ? 'Critical' : r.severity === 'warn' ? 'Warning' : 'Info'}) • Prioritas ${r.priority <= 2 ? 'Tertinggi' : r.priority <= 4 ? 'Tinggi' : 'Sedang'}</span>
        <span class="muted small row">${icon('clock')}Terdeteksi: hari ini, ${fmtShortTime(seen || Date.now())} WIB</span></div>
      <div class="rec-issue panel">
        <div class="rec-issue-l">${icon(r.severity === 'crit' ? 'octagon' : 'alert', 'issue-ic')}<div><h2 class="rec-title">${esc(r.title.replace(/\.$/, ''))} <span data-rec-val>(${esc(r.value)})</span></h2><p class="muted small">${esc(r.systemName)} • Modul hidroponik ${HC.data.systems[r.device].type}</p></div></div>
        <div class="rec-now"><div><small>Nilai saat ini</small><b class="${L.cls}" data-rec-now>${esc(r.value)}</b></div><div><small>Rentang aman</small><b>${esc(safe)}</b></div></div>
      </div>
      ${scaleHtml(r)}
      <div class="rec-logic-title">${icon('book')}LOGIKA AGRONOMI: 3 TAHAP EDUKASI CERDAS</div>
      <div class="g3 rec-logic">
        <div class="panel logic"><div class="logic-h"><span class="lnum">1</span>APA YANG TERJADI</div><p data-rec-what>${esc(r.what)}</p><div class="logic-f">${icon('trend')}<span data-rec-trend>${m.metric ? trend(m.metric, r.device) : 'Terdeteksi oleh sensor'}</span></div></div>
        <div class="panel logic"><div class="logic-h"><span class="lnum">2</span>KENAPA PENTING</div><p>${esc(r.why)}</p><div class="logic-f red">${icon('alert')}${m.risk}</div></div>
        <div class="panel logic"><div class="logic-h"><span class="lnum">3</span>APA HARUS DILAKUKAN</div><ul class="checklist">${r.todo.slice(0, 4).map((t) => `<li>${icon('checkCircle')}<span>${esc(t)}</span></li>`).join('')}</ul><div class="logic-f green">${icon('clock')}${m.time}</div></div>
      </div>
      <div class="outcome"><span class="icon-box solid">${icon('sparkles')}</span><div><div class="eyebrow">Hasil yang diharapkan (expected outcome)</div><p>${esc(r.expected)}</p></div></div>
      <div class="rec-actions">
        <div class="stack-sm"><a class="btn btn-primary" href="#/learn/${r.lesson}">${icon('book')}Lihat Panduan Lengkap & Penanganannya</a>
          ${busy ? `<button class="btn btn-soft" disabled>${icon('clock')}Memantau pemulihan…</button>` : `<button class="btn btn-soft" data-done="${r.device}|${r.key}|${r.event || ''}">${icon('check')}Tandai Sudah Dikerjakan ✓</button>`}</div>
        ${prod ? `<button class="buy-hint" data-add="${prod.id}"><span class="bh-ic">${icon('basket')}</span><span><small>Butuh ${esc(prod.name.split(' (')[0])}?</small><b>Beli di Marketplace HYCANE (${rupiah(HC.pricing.price(prod))})</b></span>${icon('arrowRight')}</button>` : ''}
      </div>
    </article>`;
  }

  function okCard() {
    const snap = HC.sim.snapshot('A');
    const h = HC.reco.healthy(snap);
    return `<article class="card rec-main rec-ok">
      <div class="rec-stripe"><span></span></div>
      <div class="row-between"><span class="pill pill-lg pill-ok"><span class="dot"></span>Optimal • Tidak ada tindakan mendesak</span><span class="muted small row">${icon('clock')}Diperbarui <span data-ok-ts>${HC.util.fmtTime(snap.timestamp)}</span></span></div>
      <div class="rec-issue panel"><div class="rec-issue-l">${icon('checkCircle', 'issue-ic ok')}<div><h2 class="rec-title">Semua parameter dalam rentang aman</h2><p class="muted small">Rak Sayur Daun & Rak Tanaman Buah</p></div></div>
        <div class="rec-now"><div><small>pH saat ini</small><b class="ok" data-ok-ph>${fmt(snap.ph, 1)}</b></div><div><small>Rentang aman</small><b>5,8–6,8</b></div></div></div>
      <div class="rec-scale"><div class="range-labels"><span class="lo">Terlalu Asam (&lt; 5,8)</span><span class="ok">Zona Optimal (5,8–6,8)</span><span class="hi">Terlalu Basa (&gt; 6,8)</span></div><div data-ok-bar>${HC.ui.rangeBar(snap.ph, 5.8, 6.8, 4.5, 8, 'ok')}</div></div>
      <div class="rec-logic-title">${icon('book')}LOGIKA AGRONOMI: 3 TAHAP EDUKASI CERDAS</div>
      <div class="g3 rec-logic">
        <div class="panel logic"><div class="logic-h"><span class="lnum">1</span>APA YANG TERJADI</div><p data-ok-what>${esc(h.what)}</p></div>
        <div class="panel logic"><div class="logic-h"><span class="lnum">2</span>KENAPA PENTING</div><p>${esc(h.why)} Masalah air sering baru terlihat setelah tanaman sakit, jadi kondisi stabil adalah kabar baik.</p></div>
        <div class="panel logic"><div class="logic-h"><span class="lnum">3</span>APA HARUS DILAKUKAN</div><ul class="checklist">${h.todo.map((t) => `<li>${icon('checkCircle')}<span>${esc(t)}</span></li>`).join('')}</ul></div>
      </div>
      <div class="outcome"><span class="icon-box solid">${icon('sparkles')}</span><div><div class="eyebrow">Hasil yang diharapkan</div><p>${esc(h.expected)}</p></div></div>
      <div class="rec-actions"><div class="row"><a class="btn btn-primary" href="#/learn/menggunakan-hycane">${icon('book')}Cara Membaca Dashboard</a><a class="btn btn-soft" href="#/diagnosis">${icon('stethoscope')}Ada gejala pada tanaman?</a></div></div>
    </article>`;
  }

  function otherList(list, main) {
    const rest = list.filter((r) => r !== main);
    if (!rest.length) return '';
    return `<div class="card card-sm"><div class="label-sm">Rekomendasi lain yang aktif (${rest.length})</div><div class="other-recs">${rest.map((r) => `<button class="other-rec" data-focus="${r.device}${r.key}">${HC.ui.pill(r.severity)}<span><b>${esc(r.title)}</b><small>${esc(r.systemName)} · ${esc(r.metric)} ${esc(r.value)}</small></span>${icon('chevronRight')}</button>`).join('')}</div></div>`;
  }

  function mainHtml() {
    const { list, offline } = allRecs();
    if (offline) return HC.ui.emptyState({ icon: 'wifiOff', title: 'Perangkat sedang offline', body: 'Rekomendasi membutuhkan data sensor terbaru. Periksa Wi-Fi dan daya perangkat.', actions: '<a class="btn btn-primary" href="#/state/offline">Panduan offline</a>' });
    if (!list.length) return okCard();
    const main = list.find((r) => r.device + r.key === focusKey) || list[0];
    return mainCard(main) + otherList(list, main);
  }

  function mstats() {
    const snap = HC.sim.snapshot('A');
    const stat = (label, val, ok, sub) => `<div class="panel mstat"><small>${label}</small><b>${val}</b><span class="${ok ? 'green' : 'warn-t'}">${icon(ok ? 'check' : 'alert')}${sub}</span></div>`;
    return stat('Suhu Reservoir', fmt(snap.temperature, 1) + '°C', snap.levels.temperature === 'ok', snap.levels.temperature === 'ok' ? 'Ideal' : 'Perlu dicek')
      + stat('Level Air', fmt(snap.waterLevel) + '%', snap.levels.waterLevel === 'ok', snap.levels.waterLevel === 'ok' ? 'Cukup' : 'Rendah')
      + stat('EC (Konduktivitas)', fmt(snap.ec, 2) + ' mS/cm', snap.levels.tds === 'ok', snap.levels.tds === 'ok' ? 'Stabil' : 'Di luar acuan')
      + stat('Laju Sirkulasi', fmt(snap.flow, 1) + ' L/m', snap.pumpOn, snap.pumpOn ? 'Normal' : 'Berhenti');
  }

  function sideHtml() {
    const snap = HC.sim.snapshot('A');
    const crops = HC.store.get('crops').map(HC.model.crop).filter((c) => c.system === 'A');
    const healthy = crops.reduce((s, c) => s + c.healthy, 0), slots = crops.reduce((s, c) => s + c.slots, 0) || 1;
    return `<div class="card card-sm affected">
      <div class="row-between"><div><div class="label-sm">Tanaman terdampak</div><h2>${esc(crops.map((c) => c.name).join(', '))}</h2></div>${crops[0] ? `<span class="pill pill-mintbright">Hari ke-${crops[0].age}</span>` : ''}</div>
      <div class="ph affected-img">${HC.ui.img('assets/images/stitch/s04-06.jpg', 'Pakcoy dan selada hidroponik')}<span class="ph-cap"><span class="cap">Nutrisi: AB Mix (EC ${fmt(snap.ec, 2)} mS/cm)</span><span class="cap">${Math.round((healthy / slots) * 100)}% Sehat</span></span></div>
      <div class="g2 mstats" data-mstats>${mstats()}</div></div>
      <div class="card card-sm tips"><h3 class="row">${icon('lightbulb')}Tips HYCANE</h3><p>Saat menambahkan pH Up atau pH Down, larutkan dulu dalam sedikit air bersih sebelum dituang ke tandon, lalu tunggu sirkulasi merata sebelum mengukur ulang.</p></div>
      <div class="card card-sm"><h3 class="row">${icon('history')}Riwayat tindakan</h3><div data-history>${historyHtml()}</div></div>`;
  }

  function historyHtml() {
    const done = HC.store.get('recs').done.slice(0, 5);
    if (!done.length) return '<p class="muted small">Belum ada tindakan yang ditandai selesai.</p>';
    return `<ul class="done-list">${done.map((d) => `<li>${icon('checkCircle')}<span><b>${esc(d.title)}</b><small class="muted">${esc(d.system)} · ${timeAgo(d.at)}</small></span></li>`).join('')}</ul>`;
  }

  function routineHtml() {
    const snap = HC.sim.snapshot('A');
    const r = HC.reco.mediaReminder();
    const liters = (snap.waterLevel / 100) * HC.data.systems.A.tankL;
    const harvest = HC.store.get('crops').map(HC.model.crop).sort((a, b) => a.harvestIn - b.harvestIn)[0];
    const wl = snap.levels.waterLevel;
    return `<div class="g3">
      <div class="card routine"><div class="row-between">${HC.ui.pill(wl, wl === 'ok' ? 'Optimal • Aman' : null)}${icon('droplet')}</div><h3>Ketinggian Air Reservoir</h3><p>${wl === 'ok' ? 'Level air cukup untuk beberapa hari ke depan. Tidak ada tindakan darurat.' : 'Level air rendah. Isi ulang tandon hari ini.'}</p>
        <div class="panel"><div class="row-between small"><span>Volume tersisa</span><b class="green">${fmt(liters, 1)} L (${fmt(snap.waterLevel)}%)</b></div><div class="bar thin ${wl === 'ok' ? '' : 'warn'}"><span style="width:${snap.waterLevel}%"></span></div></div>
        <div class="row-between tiny muted"><span>Konsumsi harian ± 1,5 L (estimasi)</span><a class="link" href="#/monitoring?m=waterLevel">Lihat grafik</a></div></div>
      <div class="card routine"><div class="row-between"><span class="pill pill-info"><span class="dot dot-blue"></span>Terjadwal • Persiapan</span>${icon('recycle')}</div><h3>Penggantian Media Tanam</h3><p>Siapkan media ampas tebu untuk batch berikutnya (± ${Math.max(0, r.daysLeft)} hari lagi).</p>
        <div class="panel row">${icon('calendar')}<div><small class="muted">Panen terdekat</small><b class="block">${harvest ? `${esc(harvest.name)} · ${HC.util.fmtDate(harvest.harvestDate)}` : '-'}</b></div></div>
        <a class="link link-blue" href="#/learn/ampas-tebu">Panduan media ampas tebu${icon('arrowRight')}</a></div>
      <div class="card routine"><div class="row-between"><span class="pill pill-muted"><span class="dot dot-muted"></span>Siklus 30 hari</span>${icon('wrench')}</div><h3>Pembersihan Lumut Pipa</h3><p>Bersihkan pipa dan tandon di antara siklus tanam untuk menjaga aliran dan kebersihan sistem.</p>
        <div class="panel row-between"><div><small class="muted">Terakhir dibersihkan</small><b class="block">22 hari lalu</b></div><span class="pill pill-outline">8 hari lagi</span></div>
        <a class="link" href="#/learn/lumut">${icon('calendar')}Panduan membersihkan sistem</a></div>
    </div>`;
  }

  function render() {
    const f = HC.util.query().get('focus');
    focusKey = f ? 'A' + f : null;
    return `<div class="page ai-page">
      <div class="page-head">
        <div><div class="row"><span class="icon-box sm">${icon('sparkles')}</span><span class="eyebrow">Agronomic Translation Engine</span><span class="muted small">• Rak Sayur Daun & Rak Tanaman Buah</span></div>
          <h1 class="ai-h1">Biar angka tidak hanya jadi angka.</h1><p>HYCANE menerjemahkan kondisi sensor menjadi tindakan nyata yang mudah dipahami pemula.</p></div>
        <div class="sync-box"><span class="dot"></span><div><small>Sinkronisasi sensor</small><b data-sync>${HC.util.fmtTime(HC.sim.snapshot('A').timestamp)} • HYCANE-001</b></div></div>
      </div>
      <div class="disclaimer panel"><span class="icon-box sm sky">${icon('shield')}</span><div><div class="row"><b class="link-blue">AI Recommendation Demo</b><span class="pill pill-muted">FESTAFORA 2026 Edition</span></div><p>${esc(HC.reco.DISCLAIMER)}</p></div></div>
      <div class="split-wide">
        <div class="stack" data-main>${mainHtml()}</div>
        <aside class="stack" data-side>${sideHtml()}</aside>
      </div>
      <section class="stack">
        <div class="sec-title"><div><div class="label-sm">Status ekosistem lainnya</div><h2 class="h-xl">Rekomendasi Pemeliharaan Rutin</h2></div><span class="muted small">4 sensor terpantau aktif</span></div>
        <div data-routine>${routineHtml()}</div>
      </section>
      <div class="card cta-band"><span class="icon-box sky">${icon('graduation')}</span><div><h2>Ingin memahami hubungan pH, TDS, dan EC lebih dalam?</h2><p class="muted">Modul gratis Edukasi HYCANE dirancang khusus untuk pemula urban farming.</p></div><a class="btn btn-ghost" href="#/learn">Buka Modul Belajar${icon('arrowRight')}</a></div>
    </div>`;
  }

  function mount(root) {
    const { $ } = HC.util;
    const sigOf = () => {
      const { list, offline } = allRecs();
      const live = new Set(list.map((r) => r.device + '-' + r.key));
      [...resolving].forEach((k) => { if (!live.has(k)) resolving.delete(k); });
      return offline ? 'off' : list.map((r) => r.device + r.key + r.severity).join('|') + '#' + focusKey;
    };
    let sig = sigOf();

    function update() {
      const s = sigOf();
      if (s !== sig) { sig = s; $('[data-main]', root).innerHTML = mainHtml(); }
      else {
        const { list } = allRecs();
        const el = $('.rec-main[data-rec]', root);
        const r = el && list.find((x) => x.device + '-' + x.key === el.dataset.rec);
        if (r) {
          $('[data-rec-what]', el).textContent = r.what;
          $('[data-rec-val]', el).textContent = `(${r.value})`;
          $('[data-rec-now]', el).textContent = r.value;
          if (scaleOf(r)) { $('[data-rec-trend]', el).textContent = trend(scaleOf(r).m, r.device); $('[data-rec-bar]', el).innerHTML = barOf(r); }
        } else if (!list.length) {
          const snap = HC.sim.snapshot('A');
          const set = (sel, v, html) => { const n = $(sel, root); if (n) n[html ? 'innerHTML' : 'textContent'] = v; };
          set('[data-ok-what]', HC.reco.healthy(snap).what);
          set('[data-ok-ph]', fmt(snap.ph, 1));
          set('[data-ok-ts]', HC.util.fmtTime(snap.timestamp));
          set('[data-ok-bar]', HC.ui.rangeBar(snap.ph, 5.8, 6.8, 4.5, 8, 'ok'), true);
        }
      }
      $('[data-sync]', root).textContent = `${HC.util.fmtTime(HC.sim.snapshot('A').timestamp)} • HYCANE-001`;
      $('[data-mstats]', root).innerHTML = mstats();
      $('[data-routine]', root).innerHTML = routineHtml();
    }

    root.addEventListener('click', (e) => {
      const fo = e.target.closest('[data-focus]');
      if (fo) { focusKey = fo.dataset.focus; sig = sigOf(); $('[data-main]', root).innerHTML = mainHtml(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const b = e.target.closest('[data-done]');
      if (!b) return;
      const [device, key, event] = b.dataset.done.split('|');
      const title = b.closest('.rec-main').querySelector('.rec-title').textContent;
      if (event) HC.sim.resolve(event, device);
      resolving.add(device + '-' + key);
      HC.store.update('recs', (r) => { r.done.unshift({ key, title, system: HC.data.systems[device].name, at: Date.now() }); r.done = r.done.slice(0, 20); return r; });
      HC.ui.toast('Tindakan dicatat. Sensor akan memantau pemulihan secara bertahap.', { sev: 'ok', icon: 'checkCircle' });
      b.disabled = true; b.innerHTML = `${icon('clock')}Memantau pemulihan…`;
      b.closest('.rec-main').classList.add('rec-resolving');
      $('[data-history]', root).innerHTML = historyHtml();
    });
    const offs = [HC.bus.on('sim:tick', update), HC.bus.on('sim:event', update), HC.bus.on('settings', update)];
    return () => offs.forEach((fn) => fn());
  }

  return { render, mount };
})();
