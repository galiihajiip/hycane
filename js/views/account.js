/* 23 Profile & 24 Settings — Stitch 21_profile_kit_settings: profile, kit/sensor configuration,
   2-point pH calibration wizard (simulated), thresholds, notifications, demo tools. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt, rupiah, fmtDate, fmtShortTime } = HC.util;
  const icon = HC.icon;
  const TABS = [['profil', 'badge', 'Profil & Akun Petani', 'user'], ['hardware', 'cpu', 'Konfigurasi Hardware & Sensor', 'cpu'], ['ambang', 'sliders', 'Ambang Batas Peringatan', 'sliders'], ['notif', 'bell', 'Notifikasi & Peringatan', 'bell'], ['demo', 'sliders', 'Demo Tools (presenter)', 'bolt']];

  function calibRows() {
    return HC.store.get('calib').filter((c) => c.sensor === 'ph').sort((a, b) => b.at - a.at).slice(0, 4).map((c) => `<tr><td><b>${fmtDate(c.at)}</b><small class="block muted">${fmtShortTime(c.at)} WIB</small></td><td>${esc(c.method)}<small class="block muted">${esc(c.detail)}</small></td><td class="mono small">Slope: ${fmt(c.slope, 1)}%<br>Offset: ${c.offset >= 0 ? '+' : ''}${fmt(c.offset, 3)} pH</td><td>${c.status === 'factory' ? '<span class="pill pill-info">Pabrik / QC</span>' : '<span class="pill pill-ok"><span class="dot"></span>Sukses</span>'}<small class="block muted">${esc(c.by)}</small></td></tr>`).join('');
  }

  function rangeRow(title, ic, val, lo, hi, min, max, labels) {
    const pct = (x) => Math.max(0, Math.min(100, ((x - min) / (max - min)) * 100));
    return `<div class="panel thr"><div class="row-between"><b class="row">${icon(ic)}${title}</b><span class="mono val-chip">${val}</span></div>
      <div class="thr-bar"><span class="tz-lo" style="width:${pct(lo)}%"></span><span class="tz-ok" style="width:${pct(hi) - pct(lo)}%"></span><span class="tz-hi" style="width:${100 - pct(hi)}%"></span></div>
      <div class="row-between tiny"><span class="muted">${labels[0]}</span><span class="green">${labels[1]}</span><span class="muted">${labels[2]}</span></div></div>`;
  }

  function liveKit() {
    const s = HC.sim.snapshot('A');
    const up = 99.8, chip = 33.5 + (s.temperature - 26) * 0.4;
    return `<div class="panel row-between"><span class="small">Uptime ESP32 (simulasi)</span><b>${fmt(up, 1)}%</b></div>
      <div class="panel row-between"><span class="small">Suhu chip ESP (simulasi)</span><span class="row"><b>${fmt(chip, 1)}°C</b><span class="pill pill-ok">Normal</span></span></div>
      <div class="panel row-between"><span class="small">Catu daya</span><span class="row"><b>12 V DC</b><span class="pill pill-muted">Adaptor 2 A</span></span></div>
      <div class="panel row-between"><span class="small">Pembacaan terakhir</span><b class="mono">${HC.util.fmtTime(s.timestamp)}</b></div>`;
  }

  HC.views.account = {
    render() {
      const settingsRoute = HC.router.current() && HC.router.current().path === '/settings';
      const prof = HC.store.get('profile');
      const st = HC.store.get('settings');
      const stats = HC.model.plantStats();
      const ep = HC.model.eduProgress();
      const orders = HC.store.get('orders');
      const crops = HC.store.get('crops').map(HC.model.crop);
      const alerts = HC.reco.evaluate(HC.sim.snapshot('A'), 'A').length + HC.reco.evaluate(HC.sim.snapshot('B'), 'B').length;
      const lastPh = HC.store.get('calib').filter((c) => c.sensor === 'ph').sort((a, b) => b.at - a.at)[0];
      const s = HC.sim.snapshot('A');
      const tog = (k, title, sub) => `<label class="toggle-row"><span><b>${title}</b><small>${sub}</small></span><span class="switch"><input type="checkbox" data-set="${k}" ${st[k] ? 'checked' : ''}><span></span></span></label>`;
      return `<div class="page account">
        <div class="page-head"><div><nav class="crumbs">HYCANE ${icon('chevronRight')} Pengaturan & Akun ${icon('chevronRight')}<span class="here">Profil & Konfigurasi Kit IoT</span></nav>
          <div class="row"><h1>Profil Pengguna & Manajemen Kit IoT</h1><span class="pill pill-mintbright"><span class="dot"></span>Node: Active</span></div>
          <p>Kelola identitas kebun, kalibrasi sensor, ambang batas peringatan, preferensi notifikasi, dan alat demo.</p></div>
          <div class="row"><button class="btn btn-soft" data-ping>${icon('wifi')}Uji Koneksi Kit <span class="pill pill-muted" data-ping-ms>—</span></button><button class="btn btn-primary" data-save>${icon('save')}Simpan Perubahan</button></div></div>

        <div class="acc-grid">
          <nav class="card card-sm acc-tabs" aria-label="Bagian pengaturan">${TABS.map(([id, , label, ic], i) => `<a href="#/${settingsRoute ? 'settings' : 'profile'}" data-tab="${id}" class="${(settingsRoute ? i === 1 : i === 0) ? 'active' : ''}">${icon(ic)}${label}</a>`).join('')}
            <button class="acc-logout" data-logout>${icon('logout')}Keluar</button></nav>

          <div class="stack">
            <section class="card" id="sec-profil"><div class="row-between"><h2 class="row">${icon('user')}Bio Petani & Parameter Fasilitas</h2><span class="pill pill-mintbright">FESTAFORA 2026 Demo</span></div><p class="muted small">Identitas kebun untuk rekam jejak sertifikat hasil panen.</p>
              <div class="prof-hero"><div class="avatar avatar-lg">${HC.ui.img(HC.data.user.photo, 'Foto profil')}</div><div><div class="row"><h2 class="lg">${esc(prof.name)}</h2><span class="pill pill-ok">${icon('sprout')}Grower ${esc(HC.data.user.experienceLevel)}</span></div><p class="muted small">${esc(prof.farm)} • ${esc(HC.data.user.farmDesc)} • Bergabung ${fmtDate(HC.data.user.joinedAt)}</p></div></div>
              <div class="g3 stat-grid">${[['sprout', stats.total, 'Tanaman aktif'], ['leaf', stats.healthy, 'Tanaman sehat'], ['award', HC.store.get('harvests').length, 'Panen tercatat'], ['grid', stats.capacity, 'Lubang tanam'], ['alert', alerts, 'Alert aktif'], ['receipt', orders.length, 'Pesanan']].map(([ic, v, l]) => `<div class="panel stat"><span class="icon-box sm">${icon(ic)}</span><div><b>${v}</b><small>${l}</small></div></div>`).join('')}</div>
              <div class="form">
                <div class="field-row"><div class="field"><label for="pf-name">Nama lengkap</label><input id="pf-name" data-pf="name" value="${esc(prof.name)}"></div><div class="field"><label for="pf-email">Email terdaftar</label><div class="input-wrap">${icon('mail')}<input id="pf-email" type="email" data-pf="email" value="${esc(prof.email)}"></div></div></div>
                <div class="field-row"><div class="field"><label for="pf-phone">No. WhatsApp notifikasi</label><div class="input-wrap">${icon('phone')}<input id="pf-phone" type="tel" data-pf="phone" value="${esc(prof.phone)}"></div></div><div class="field"><label for="pf-farm">Nama kebun</label><input id="pf-farm" data-pf="farm" value="${esc(prof.farm)}"></div></div>
                <div class="field"><label for="pf-addr">Lokasi fasilitas hidroponik</label><div class="input-wrap">${icon('mapPin')}<input id="pf-addr" data-pf="address" value="${esc(prof.address)}"></div></div>
                <div class="field-row"><div class="field"><label for="pf-inst">Tipe & kapasitas instalasi</label><select id="pf-inst" data-pf="install">${['Rooftop NFT 16 lubang + DWC 6 lubang', 'Balkon NFT 12 lubang', 'Indoor tower vertikal 36 lubang', 'Kratky / wadah pasif'].map((o) => `<option ${o === prof.install ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
                  <div class="field"><label for="pf-lvl">Tingkat pengalaman</label><select id="pf-lvl" data-pf="level">${['Pemula (Level 1)', 'Pemula Tingkat Menengah (Level 2)', 'Menengah (Level 3)', 'Berpengalaman (Level 4)'].map((o) => `<option ${o === prof.level ? 'selected' : ''}>${o}</option>`).join('')}</select></div></div>
              </div>
              <div class="g2 prof-more"><div class="panel"><div class="row-between"><b class="row">${icon('graduation')}Progres belajar</b><a class="link small" href="#/learn">Edukasi</a></div><div class="bar"><span style="width:${ep.pct}%"></span></div><small class="muted">${ep.done} dari ${ep.total} modul selesai (${ep.pct}%)</small></div>
                <div class="panel"><div class="row-between"><b class="row">${icon('receipt')}Riwayat pembelian</b><a class="link small" href="#/orders">Semua</a></div>${orders.slice(0, 2).map((o) => `<div class="row-between small"><a class="link" href="#/orders/${o.id}">#${o.id}</a><span>${o.status} · ${rupiah(o.total)}</span></div>`).join('')}</div></div>
              <div class="panel"><div class="row-between"><b class="row">${icon('sprout')}Tanaman saat ini</b><a class="link small" href="#/crops">Kelola</a></div><div class="crop-chips">${crops.map((c) => `<a class="crop-chip" href="#/crops/${c.id}"><span class="thumb thumb-xs">${HC.ui.img(c.image, c.name)}</span>${esc(c.name)} <small class="muted">· ${c.slots} lubang · hari ${c.age}</small></a>`).join('')}</div></div>
            </section>

            <section class="card" id="sec-hardware"><div class="row-between"><div class="row"><span class="icon-box sm">${icon('cpu')}</span><div><h2>Kit Telemetri & Sensor ESP32</h2><p class="muted small">Perangkat mikrokontroler & kalibrasi probe cairan nutrisi</p></div></div><div class="row"><span class="pill pill-muted">FW: ${HC.data.device.fw} (stabil)</span><button class="btn btn-ghost btn-xs" data-fw>${icon('refresh')}Periksa Update</button></div></div>
              <div class="g3 hw"><div class="panel"><span class="label-sm">Device ID & MAC</span><b class="mono">#${HC.data.device.id}</b><small class="mono muted">${HC.data.device.mac}</small></div><div class="panel"><span class="label-sm">Jaringan Wi-Fi</span><b class="row">${icon('wifi')}${esc(HC.data.device.wifi)}</b><small class="muted">IP ${HC.data.device.ip} (${HC.data.device.rssi} dBm, kuat)</small></div>
                <div class="panel"><label class="label-sm" for="pf-int">Interval telemetri</label><select id="pf-int" data-pf="interval">${HC.data.device.intervals.map(([v, l]) => `<option value="${v}" ${v === prof.interval ? 'selected' : ''}>${l}</option>`).join('')}</select><small class="muted">Demo selalu memakai 2 detik.</small></div></div>
              <div class="row-between sub-h"><span class="label-sm">Status kalibrasi probe sensor</span><span class="tiny muted">Rekomendasi kalibrasi setiap 30 hari</span></div>
              <div class="panel probe"><span class="icon-box sm">${icon('flask')}</span><div><div class="row"><b>Sensor pH Air (Glass Electrode)</b><span class="pill pill-ok">Terkalibrasi</span></div><small class="muted">Terakhir ${lastPh ? fmtDate(lastPh.at) : '-'} (offset ${lastPh ? (lastPh.offset >= 0 ? '+' : '') + fmt(lastPh.offset, 3) : '-'} pH • slope ${lastPh ? fmt(lastPh.slope, 1) : '-'}%)</small></div><button class="btn btn-ghost btn-sm" data-calib-ph>Mulai Kalibrasi 2 Titik (4,00 & 6,86)</button></div>
              <div class="panel calib-hist"><div class="row-between"><b class="row">${icon('history')}Riwayat Kalibrasi Sensor pH</b><button class="btn btn-ghost btn-xs" data-calib-csv>${icon('download')}Ekspor Log (.CSV)</button></div>
                <div class="table-wrap"><table class="table table-sm"><thead><tr><th>Tanggal & waktu</th><th>Metode</th><th>Parameter</th><th>Status & operator</th></tr></thead><tbody data-calib-rows>${calibRows()}</tbody></table></div>
                <div class="panel panel-mint small row">${icon('activity')}<span><b>Kesehatan elektroda:</b> ${fmt(s.sensorHealth.ph, 1)}% (sangat baik — penggantian probe dianjurkan bila slope &lt; 85%)</span></div></div>
              <div class="panel probe"><span class="icon-box sm sky">${icon('zap')}</span><div><div class="row"><b>Sensor EC / TDS Nutrisi</b><span class="pill pill-ok">Terkalibrasi</span></div><small class="muted">Standar 1.413 µS/cm • kompensasi suhu dari DS18B20</small></div><button class="btn btn-ghost btn-sm" data-calib-ec>Mulai Kalibrasi Standar 1.413 µS/cm</button></div>
              <div class="g2"><div class="panel row-between"><span class="row">${icon('thermometer')}<span><b>Suhu air (DS18B20)</b><small class="block muted">Deviasi ± 0,1°C</small></span></span><b class="mono" data-hw-t>${fmt(s.temperature, 1)}°C</b></div><div class="panel row-between"><span class="row">${icon('waves')}<span><b>Level air tandon</b><small class="block muted">Kapasitas ${HC.data.systems.A.tankL} L</small></span></span><b class="mono" data-hw-w>${fmt(s.waterLevel)}% (${fmt((s.waterLevel / 100) * HC.data.systems.A.tankL, 1)} L)</b></div></div>
            </section>

            <section class="card" id="sec-ambang"><div class="row"><span class="icon-box sm">${icon('sliders')}</span><div><h2>Ambang Batas Peringatan</h2><p class="muted small">Batas yang dipakai HYCANE untuk status Normal / Perhatian / Mendesak (Rak Sayur Daun).</p></div></div>
              <div class="stack-sm">${rangeRow('Rentang pH aman kebun', 'droplet', '5,8 — 6,8 pH', 5.8, 6.8, 4.5, 8, ['Asam (< 5,5 mendesak)', 'Optimal: 6,0–6,5', 'Basa (> 7,2 mendesak)'])}
                ${rangeRow('Ambang nutrisi TDS (ppm)', 'leaf', '650 — 1.100 ppm', 650, 1100, 300, 1500, ['Encer (< 550 mendesak)', 'Target vegetatif ± 880', 'Pekat (> 1.250 mendesak)'])}
                <div class="panel row-between"><span class="row">${icon('alert')}<span><b>Batas suhu air tandon</b><small class="block muted">Perhatian di atas 29,5°C, mendesak di atas 31°C</small></span></span><span class="pill pill-crit pill-lg">Maks 29,5°C</span></div>
                <div class="panel row-between"><span class="row">${icon('waves')}<span><b>Batas level air</b><small class="block muted">Perhatian di bawah 40%, mendesak di bawah 25%</small></span></span><span class="pill pill-warn pill-lg">Min 40%</span></div></div>
              <p class="tiny muted">Ambang ini adalah acuan demo untuk sayur daun. Kebutuhan dapat berbeda menurut tanaman, varietas, dan fase pertumbuhan.</p></section>

            <section class="card" id="sec-notif"><div class="row"><span class="icon-box sm">${icon('bell')}</span><div><h2>Notifikasi & Peringatan</h2><p class="muted small">Pilih jenis pemberitahuan yang ingin kamu terima.</p></div></div>
              <div class="stack-sm">${tog('notifMonitoring', 'Peringatan kondisi air', 'pH, TDS/EC, suhu, level air, dan pompa')}${tog('notifOrders', 'Status pesanan', 'Dikemas, dikirim, dan selesai')}${tog('notifEducation', 'Materi baru & pengingat belajar', 'Rekomendasi modul edukasi')}</div>
              <div class="panel panel-sky small note">${icon('info')}<span>Notifikasi WhatsApp, dosing otomatis, dan sinkronisasi cloud belum tersedia di demo ini. Kit tetap menampilkan kondisi air di layar LCD tanpa aplikasi.</span></div></section>

            <section class="card" id="sec-demo"><div class="row-between"><div class="row"><span class="icon-box sm warn">${icon('bolt')}</span><div><h2>Demo Tools</h2><p class="muted small">Untuk presenter. Juga tersedia lewat tombol <b>Demo Tools</b> di bar atas atau <kbd>Shift</kbd>+<kbd>D</kbd>.</p></div></div><span class="pill pill-info">Presenter</span></div>
              <div data-demo>${HC.ui.demoControls()}</div></section>
            <div data-audit>${st.presenter ? HC.views.pricingAudit() : ''}</div>
          </div>

          <aside class="stack acc-side">
            <section class="card card-sm"><div class="row-between"><h2 class="row">${icon('activity')}Live Telemetri Kit</h2><span class="pill pill-mintbright">Real-time</span></div><div class="stack-sm" data-livekit>${liveKit()}</div>
              <button class="btn btn-soft btn-block" data-restart>${icon('refresh')}Restart Node IoT (demo)</button></section>
            <section class="card card-sm"><h2 class="row">${icon('shield')}Keamanan & Pasangan Perangkat</h2>
              <div class="stack-sm sec-list"><button class="panel row-between" data-pw>${icon('key')}<span>Ubah kata sandi akun</span>${icon('chevronRight')}</button><button class="panel row-between" data-logout>${icon('logout')}<span>Keluar dari akun</span>${icon('chevronRight')}</button>
                <button class="btn btn-danger-soft btn-block" data-unpair>${icon('unlink')}Putuskan Koneksi Perangkat</button></div>
              <p class="tiny muted center">Tindakan ini hanya simulasi di demo.</p></section>
            <section class="card card-sm"><h2 class="row">${icon('info')}Tentang Demo</h2><ul class="bullets small"><li>Demo HYCANE untuk final BPC FESTAFORA 2026, subtema Teknologi.</li><li>${esc(HC.reco.DISCLAIMER)}</li><li>Data sensor adalah simulasi; data disimpan lokal di browser.</li><li>Harga adalah harga retail demo (benchmark + margin kotor 30%).</li></ul></section>
          </aside>
        </div>
      </div>`;
    },
    mount(root) {
      const { $ } = HC.util;
      const cleanupDemo = HC.ui.mountDemoControls(root.querySelector('[data-demo]'));
      const settingsRoute = HC.router.current().path === '/settings';
      if (settingsRoute) setTimeout(() => { const el = $('#sec-hardware', root); if (el) el.scrollIntoView({ block: 'start' }); }, 50);
      const draft = {};
      root.addEventListener('input', (e) => { const k = e.target.dataset.pf; if (k) draft[k] = e.target.value; });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.set;
        if (k) { HC.store.update('settings', (s) => Object.assign(s, { [k]: e.target.checked })); HC.ui.toast('Preferensi notifikasi disimpan', { sev: 'ok' }); }
        const p = e.target.dataset.pf; if (p) draft[p] = e.target.value;
      });
      const offA = HC.bus.on('settings', (k) => { if (k === 'presenter') $('[data-audit]', root).innerHTML = HC.store.get('settings').presenter ? HC.views.pricingAudit() : ''; });
      root.addEventListener('click', async (e) => {
        const tab = e.target.closest('[data-tab]');
        if (tab) { e.preventDefault(); root.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('active', x === tab)); const el = $('#sec-' + tab.dataset.tab, root); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        if (e.target.closest('[data-save]')) {
          if (!Object.keys(draft).length) { HC.ui.toast('Tidak ada perubahan', { icon: 'info' }); return; }
          HC.store.update('profile', (p) => Object.assign(p, draft));
          Object.keys(draft).forEach((k) => delete draft[k]);
          HC.ui.toast('Konfigurasi disimpan', { sev: 'ok', icon: 'save' });
        }
        if (e.target.closest('[data-ping]')) { const ms = 18 + Math.round(Math.random() * 20); $('[data-ping-ms]', root).textContent = HC.store.get('settings').offline ? 'offline' : ms + ' ms'; HC.ui.toast(HC.store.get('settings').offline ? 'Perangkat tidak merespons (offline)' : `HYCANE-001 merespons dalam ${ms} ms (simulasi)`, { sev: HC.store.get('settings').offline ? 'warn' : 'ok', icon: 'wifi' }); }
        if (e.target.closest('[data-fw]')) HC.ui.toast(`Firmware ${HC.data.device.fw} sudah versi terbaru (demo)`, { sev: 'ok' });
        if (e.target.closest('[data-restart]')) HC.ui.toast('Node IoT dimulai ulang (simulasi). Data tetap berjalan.', { icon: 'refresh' });
        if (e.target.closest('[data-pw]')) HC.ui.toast('Ubah kata sandi tidak tersedia di akun demo', { icon: 'key' });
        if (e.target.closest('[data-unpair]') && await HC.ui.confirm('Putuskan koneksi perangkat?', 'Di demo ini perangkat tidak benar-benar diputus. Data simulasi tetap berjalan.', 'Ya, simulasikan')) HC.ui.toast('Simulasi: perangkat diputus lalu dipasangkan kembali', { icon: 'unlink' });
        if (e.target.closest('[data-calib-ph]')) calibWizard(root);
        if (e.target.closest('[data-calib-ec]')) {
          if (await HC.ui.confirm('Kalibrasi sensor EC/TDS', 'Celupkan probe ke larutan standar 1.413 µS/cm, tunggu angka stabil, lalu simpan. (Simulasi demo.)', 'Simpan kalibrasi')) {
            HC.store.update('calib', (c) => [{ sensor: 'ec', at: Date.now(), method: 'Kalibrasi standar', detail: '1.413 µS/cm @ 25°C', slope: 100, offset: 0, status: 'ok', by: 'Galih Aji (mandiri)' }].concat(c));
            HC.ui.toast('Kalibrasi EC tersimpan (simulasi)', { sev: 'ok' });
          }
        }
        if (e.target.closest('[data-calib-csv]')) {
          const rows = [['tanggal', 'sensor', 'metode', 'detail', 'slope_pct', 'offset', 'oleh']].concat(HC.store.get('calib').map((c) => [HC.util.isoDate(c.at), c.sensor, c.method, c.detail, c.slope, c.offset, c.by]));
          HC.ui.download('hycane-kalibrasi.csv', rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'));
        }
      });
      const tick = () => { const s = HC.sim.snapshot('A'); const lk = $('[data-livekit]', root); if (lk) lk.innerHTML = liveKit(); const t = $('[data-hw-t]', root); if (t) t.textContent = fmt(s.temperature, 1) + '°C'; const w = $('[data-hw-w]', root); if (w) w.textContent = `${fmt(s.waterLevel)}% (${fmt((s.waterLevel / 100) * HC.data.systems.A.tankL, 1)} L)`; };
      const offT = HC.bus.on('sim:tick', tick);
      return () => { cleanupDemo(); offA(); offT(); };
    },
  };

  /* 2-point pH calibration wizard (simulated readings converge to the buffer value). */
  function calibWizard(root) {
    const steps = [{ buf: 6.86, label: 'Langkah 1: Buffer 6,86' }, { buf: 4.0, label: 'Langkah 2: Buffer 4,00' }, { label: 'Langkah 3: Verifikasi & simpan' }];
    let i = 0, timer = null, reading = 7.4, stable = false;
    const results = [];
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    document.body.appendChild(back);
    const close = () => { clearInterval(timer); back.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const slope = () => 97.6 + Math.random() * 1.2, offset = () => +(Math.random() * 0.03 - 0.01).toFixed(3);
    let finalSlope = slope(), finalOffset = offset();
    const paint = () => {
      const head = steps.map((s, k) => `<div class="cw-step ${k < i ? 'done' : k === i ? 'now' : ''}"><span>${k < i ? icon('check') : k + 1}</span><b>${s.label}</b><small>${k < i ? `Selesai (terbaca ${fmt(results[k], 2)})` : k === i ? 'Sedang berjalan' : 'Menunggu'}</small></div>`).join('');
      let body;
      if (i < 2) {
        body = `<div class="panel panel-sky small note">${icon('info')}<span>Bilas probe dengan air bersih, lalu celupkan ke larutan buffer <b>pH ${fmt(steps[i].buf, 2)}</b>. Tunggu angka stabil sebelum mengonfirmasi.</span></div>
          <div class="cw-read"><small class="muted">Pembacaan probe (simulasi)</small><b data-cw-read>${fmt(reading, 2)}</b>${stable ? HC.ui.pill('ok', 'Stabil') : HC.ui.pill('warn', 'Menstabilkan…')}</div>`;
      } else {
        body = `<div class="panel panel-mint small note">${icon('shield')}<span>Kedua titik kalibrasi terbaca dengan deviasi kecil. Tinjau hasil lalu simpan ke perangkat.</span></div>
          <div class="g4 cw-res"><div class="panel"><small>Slope</small><b class="green">${fmt(finalSlope, 1)}%</b><small class="muted">ideal 95–105%</small></div><div class="panel"><small>Offset</small><b>${finalOffset >= 0 ? '+' : ''}${fmt(finalOffset, 3)}</b><small class="muted">pH</small></div><div class="panel"><small>Kompensasi suhu</small><b>${fmt(HC.sim.snapshot('A').temperature, 1)}°C</b><small class="muted">dari DS18B20</small></div><div class="panel"><small>Status elektroda</small><b class="green">Baik</b><small class="muted">responsif</small></div></div>`;
      }
      back.innerHTML = `<div class="modal wide calib-modal" role="dialog" aria-modal="true" aria-labelledby="cw-t"><div class="row-between"><div class="row"><span class="icon-box">${icon('flask')}</span><div><h2 id="cw-t">Kalibrasi 2 Titik Sensor pH</h2><small class="muted">Simulasi prosedur kalibrasi (demo)</small></div></div><button class="icon-btn" data-cw-close aria-label="Tutup">${icon('x')}</button></div>
        <div class="cw-steps">${head}</div>${body}
        <div class="modal-actions"><button class="btn btn-ghost" data-cw-close>Batal</button>${i > 0 && i < 3 ? `<button class="btn btn-soft" data-cw-back>${icon('arrowLeft')}Kembali</button>` : ''}${i < 2 ? `<button class="btn btn-primary" data-cw-next ${stable ? '' : 'disabled'}>Konfirmasi titik ${i + 1}</button>` : `<button class="btn btn-soft" data-cw-redo>${icon('refresh')}Bilas & Uji Ulang</button><button class="btn btn-primary" data-cw-save>${icon('save')}Simpan Kalibrasi</button>`}</div></div>`;
    };
    const run = () => {
      clearInterval(timer); stable = false; reading = i === 0 ? 7.4 : 6.6;
      paint();
      timer = setInterval(() => {
        const target = steps[i].buf + finalOffset;
        reading += (target - reading) * 0.35 + (Math.random() - 0.5) * 0.01;
        if (Math.abs(reading - target) < 0.02) { stable = true; clearInterval(timer); paint(); return; }
        const el = back.querySelector('[data-cw-read]'); if (el) el.textContent = fmt(reading, 2);
      }, 450);
    };
    back.addEventListener('click', (e) => {
      if (e.target === back || e.target.closest('[data-cw-close]')) close();
      if (e.target.closest('[data-cw-next]')) { results[i] = reading; i++; if (i < 2) run(); else paint(); }
      if (e.target.closest('[data-cw-back]')) { i = Math.max(0, i - 1); run(); }
      if (e.target.closest('[data-cw-redo]')) { i = 0; results.length = 0; finalSlope = slope(); finalOffset = offset(); run(); }
      if (e.target.closest('[data-cw-save]')) {
        HC.store.update('calib', (c) => [{ sensor: 'ph', at: Date.now(), method: 'Kalibrasi 2 titik', detail: `Buffer 4,00 & 6,86 · suhu ${fmt(HC.sim.snapshot('A').temperature, 1)}°C`, slope: +finalSlope.toFixed(1), offset: finalOffset, status: 'ok', by: 'Galih Aji (mandiri)' }].concat(c));
        close();
        const rows = root.querySelector('[data-calib-rows]'); if (rows) rows.innerHTML = calibRows();
        HC.ui.toast('Kalibrasi pH tersimpan (simulasi)', { sev: 'ok', icon: 'save' });
      }
    });
    run();
  }
})();
