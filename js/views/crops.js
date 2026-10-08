/* 05 My Crops (Stitch 05_my_crops), 06 Crop Detail (Stitch 06_crop_detail_log_tanam), 07 Add Crop. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt, fmtDate, isoDate, daysBetween, timeAgo } = HC.util;
  const icon = HC.icon;
  const pad2 = (n) => String(n).padStart(2, '0');
  const batchName = (c) => `Batch #${pad2(c.batch || 0)}: ${c.name} ${c.variety || ''}`.trim();

  /* Deterministic per-slot health so the slot map is stable between ticks. */
  function slotInfo(c, i) {
    const sick = (c.sick || []).includes(i);
    const jitter = ((c.id.length * 7 + i * 13) % 9) - 3;
    const fit = Math.max(40, Math.min(100, (sick ? c.score - 22 : c.score + 3) + jitter));
    const grams = Math.round((c.info.gramPerPlant || 150) * Math.min(1, c.stage.pct) * (fit / 100));
    return { sick, fit, grams };
  }

  function ringHtml(pct, label, sub) {
    const C = 2 * Math.PI * 22;
    return `<div class="ring-box"><span class="ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" class="ring-bg"/><circle cx="26" cy="26" r="22" class="ring-fg" stroke-dasharray="${(C * pct) / 100} ${C}"/></svg><b>${Math.round(pct)}%</b></span><div><b>${label}</b><small>${sub}</small></div></div>`;
  }

  function stepper(c) {
    const st = HC.data.STAGES(c.info.cycle);
    const bounds = [0.18, 0.42, 0.75, 1].map((r) => Math.round(r * c.info.cycle));
    const range = (i) => (i === 0 ? `Hari 1–${bounds[0]}` : i < 4 ? `Hari ${bounds[i - 1] + 1}–${bounds[i]}` : `Hari ${c.info.cycle}`);
    return `<div class="phase panel"><div class="row-between label-sm"><span>Tahapan Fase Pertumbuhan Siklus</span><span>Fase ${c.stage.idx + 1} dari 5 aktif</span></div>
      <div class="phase-steps">${st.map(([t, d], i) => `<div class="pstep ${i < c.stage.idx ? 'done' : i === c.stage.idx ? 'now' : ''}"><div class="row-between"><b>${i + 1}. ${t}</b>${i < c.stage.idx ? icon('checkCircle') : i === c.stage.idx ? '<span class="dot"></span>' : icon('clock')}</div><span>${range(i)}${i === c.stage.idx ? ' (kini)' : ''}</span><small>${d}</small></div>`).join('')}</div></div>`;
  }

  function slotMap(sys, highlight) {
    const S = HC.data.systems[sys];
    const crops = HC.store.get('crops').map(HC.model.crop).filter((c) => c.system === sys);
    const cells = {};
    crops.forEach((c) => c.codes.forEach((code, i) => { cells[code] = { c, i, n: i + 1, ...slotInfo(c, i) }; }));
    let html = '';
    S.rows.forEach((r) => { for (let k = 1; k <= S.perRow; k++) {
      const code = r + k, x = cells[code];
      if (!x) { html += `<a class="slot empty" href="#/crops/new?sys=${sys}"><span class="row-between"><b>${code}</b></span><span>Kosong</span><small>${icon('plus')}Tanam</small></a>`; continue; }
      const dim = highlight && x.c.id !== highlight;
      html += `<button class="slot ${x.sick ? 'sick' : ''} ${dim ? 'dim' : ''}" data-slot="${code}" data-crop="${x.c.id}" data-i="${x.i}"><span class="row-between"><b>${code}</b><span class="dot ${x.sick ? 'dot-crit' : ''}"></span></span><span class="slot-name">${esc(x.c.name)} #${pad2(x.n)}</span><small><span>${x.grams} g</span><span class="${x.sick ? 'red' : 'green'}">${x.sick ? 'Perhatian' : x.fit + '% Fit'}</span></small></button>`;
    } });
    const sick = crops.reduce((s, c) => s + (c.sick || []).length, 0), all = crops.reduce((s, c) => s + c.slots, 0);
    return `<div class="row-between slot-head"><div><h2>Peta Sensorik ${S.slots} Lubang Tanam (${esc(S.name)})</h2><p class="muted small">Klik slot untuk melihat kondisi tanaman per lubang.</p></div>
      <div class="row small"><span class="row"><span class="dot"></span>${all - sick} Sehat</span><span class="row"><span class="dot dot-crit"></span>${sick} Perlu perhatian</span><span class="row"><span class="dot dot-muted"></span>${S.slots - all} Kosong</span></div></div>
      <div class="slot-grid" style="--cols:${S.perRow === 4 ? 4 : 3}">${html}</div>`;
  }

  function slotDetail(c, i) {
    const x = slotInfo(c, i);
    return `<div class="slot-detail panel"><span class="icon-box ${x.sick ? 'crit' : ''}">${icon('sprout')}</span><div><div class="row"><h3>Slot ${c.codes[i]}: ${esc(c.name)} ${esc(c.variety)}</h3>${HC.ui.pill(x.sick ? 'warn' : 'ok', x.sick ? 'Perlu perhatian' : 'Optimal')}</div>
      <p class="muted small">Hari ke-${c.age} • ${esc(c.stage.label)} • perkiraan bobot ${x.grams} g • ${x.sick ? esc(c.condition) : 'Daun tegak dan warna merata.'}</p></div>
      <div class="row"><a class="btn btn-ghost btn-sm" href="#/crops/${c.id}">Log Tanam</a><a class="btn btn-primary btn-sm" href="#/crops/${c.id}">${icon('camera')}Detail Batch</a></div></div>`;
  }

  function batchCard(c) {
    const harvestPct = Math.min(100, (c.age / c.info.cycle) * 100);
    return `<section class="card batch">
      <div class="row-between"><div><div class="row"><span class="pill pill-mintbright">BATCH #${pad2(c.batch)} AKTIF</span><span class="pill pill-muted">${c.systemInfo.type} ${c.systemInfo.slots} Lubang</span></div>
        <h2 class="batch-title">${esc(c.name)} ${esc(c.variety)} <span class="muted latin">(${esc(c.info.latin)})</span></h2>
        <p class="muted small">Ditanam ${fmtDate(c.plantedAt)} • Media ampas tebu • Nutrisi AB Mix • Slot ${esc(c.slotLabel)}</p></div>
        ${ringHtml(harvestPct, `Hari ke-${c.age} / ${c.info.cycle}`, c.harvestIn ? `H-${c.harvestIn} menuju panen` : 'Siap panen')}</div>
      ${stepper(c)}
      <div data-slotmap>${slotMap(c.system, c.id)}</div>
      <div data-slotdetail>${slotDetail(c, Math.max(0, (c.sick || [])[0] ?? 0))}</div>
      <div class="row-between small batch-foot"><span class="row">${icon('checkCircle')}Sensor terhubung: pH ${fmt(c.snap.ph, 1)} • EC ${fmt(c.snap.ec, 2)} mS/cm • Suhu ${fmt(c.snap.temperature, 1)}°C</span><a class="link" href="#/crops/${c.id}">Buka Detail Batch & Riwayat IoT${icon('arrowRight')}</a></div>
    </section>`;
  }

  function miniBatch(c) {
    return `<a class="card card-flush minibatch" href="#/crops/${c.id}"><div class="ph minibatch-img">${HC.ui.img(c.image, c.name)}<span class="ph-badge pill ${c.level === 'ok' ? 'pill-solid' : c.level === 'warn' ? 'pill-warn' : 'pill-crit'}">${c.level === 'ok' ? 'Sehat' : c.level === 'warn' ? 'Perhatian' : 'Berisiko'}</span><span class="ph-cap"><span class="cap">${esc(c.systemInfo.name)} • Slot ${esc(c.slotLabel)}</span></span></div>
      <div class="minibatch-body"><div class="label-sm">Batch #${pad2(c.batch)}</div><h3>${esc(c.name)} ${esc(c.variety)}</h3><p class="muted small">${esc(c.info.latin)} • ditanam ${fmtDate(c.plantedAt)}</p>
        <div class="panel g2 mb-stats"><div><small>Usia tanam</small><b>Hari ke-${c.age}</b><span class="muted tiny">Target ${c.info.cycle} hari</span></div><div><small>Kesehatan</small><b class="${c.level === 'ok' ? 'green' : 'warn-t'}">${c.healthy}/${c.slots} sehat</b><span class="muted tiny">Skor ${c.score}</span></div></div>
        <div class="row-between tiny"><span>${esc(c.stage.label)}</span><span>${c.harvestIn ? `H-${c.harvestIn} panen` : 'Siap panen'}</span></div><div class="bar thin"><span style="width:${Math.min(100, c.stage.pct * 100)}%"></span></div></div></a>`;
  }

  HC.views.crops = {
    render() {
      const q = HC.util.query();
      const sel = q.get('b') || 'all';
      const sysF = q.get('sys') || 'all';
      const all = HC.store.get('crops').map(HC.model.crop);
      const crops = sysF === 'all' ? all : all.filter((c) => c.system === sysF);
      const s = HC.model.plantStats();
      const next = all.slice().sort((a, b) => a.harvestIn - b.harvestIn)[0];
      const harvests = HC.store.get('harvests');
      const kg = harvests.reduce((a, h) => a + h.kg, 0);
      const plugs = harvests.reduce((a, h) => a + h.plants, 0) + all.reduce((a, c) => a + c.slots, 0);
      const selected = all.find((c) => c.id === sel);
      return `<div class="page">
        <nav class="crumbs">HYCANE ${icon('chevronRight')} Budidaya ${icon('chevronRight')}<span class="here">Tanaman Saya (My Crops)</span></nav>
        <div class="page-head"><div><h1>Kelola Siklus Tanam & Batch Hidroponik</h1><p>Pantau kesehatan, fase pertumbuhan, jadwal panen, dan media tanam ampas tebu di tiap lubang tanam.</p></div>
          <div class="row"><label class="sr-only" for="f-sys">Filter rak</label><select id="f-sys" class="sel-pill"><option value="all" ${sysF === 'all' ? 'selected' : ''}>Semua rak (${s.capacity} lubang)</option>${Object.values(HC.data.systems).map((x) => `<option value="${x.id}" ${sysF === x.id ? 'selected' : ''}>${esc(x.name)} (${x.slots} lubang)</option>`).join('')}</select>
            <button class="btn btn-ghost" data-export>${icon('download')}Export Log (CSV)</button><a class="btn btn-primary" href="#/crops/new">${icon('plus')}Tambah Batch / Semai Baru</a></div></div>

        <div class="g4">
          <div class="card kpi-c"><div class="row-between"><span class="muted">Kapasitas Lubang Tanam</span>${HC.ui.pill(s.total >= s.capacity ? 'ok' : 'info', s.total >= s.capacity ? 'Penuh' : `${s.capacity - s.total} kosong`)}</div><div class="kpi-big"><b>${s.total} / ${s.capacity}</b><small>Lubang</small></div><div class="kpi-f"><span class="green">${icon('checkCircle')}${s.healthy} Prima</span><span class="red">${icon('alert')}${s.total - s.healthy} Perhatian</span></div></div>
          <div class="card kpi-c"><div class="row-between"><span class="muted">Panen Terdekat</span><span class="pill pill-info">${icon('clock')}H-${next ? next.harvestIn : '-'} Hari</span></div><div class="kpi-big"><b class="blue">${next ? fmtDate(next.harvestDate).replace(/ \d{4}$/, '') : '-'}</b><small>Batch #${next ? pad2(next.batch) : '-'}</small></div><div class="kpi-f"><span>${next ? esc(next.name + ' ' + next.variety) : ''}</span><b>Est. ${next ? next.info.gramPerPlant : 0} g / tanaman</b></div></div>
          <div class="card kpi-c"><div class="row-between"><span class="muted">Akumulasi Hasil Panen</span><span class="pill pill-ok">${harvests.length} siklus</span></div><div class="kpi-big"><b>${fmt(kg, 1)}</b><small>kg sayuran</small></div><div class="kpi-f"><span>${harvests.length} siklus selesai</span><a class="link small" href="#/profile">Riwayat</a></div></div>
          <div class="card kpi-c"><div class="row-between"><span class="muted">Media Tanam Ampas Tebu</span><span class="pill pill-ok">${icon('recycle')}Sirkular</span></div><div class="kpi-big"><b class="green">${plugs}</b><small>plug dipakai</small></div><div class="kpi-f"><span>Pengganti rockwool</span><span class="muted">bisa dikomposkan</span></div></div>
        </div>

        <div class="card card-sm tabbar">
          <div class="chips scroll-x"><a class="chip ${sel === 'all' ? 'active' : ''}" href="#/crops${sysF !== 'all' ? '?sys=' + sysF : ''}">Semua Batch Aktif (${crops.length})</a>${crops.map((c) => `<a class="chip ${sel === c.id ? 'active' : ''}" href="#/crops?b=${c.id}">Batch #${pad2(c.batch)}: ${esc(c.name)} (${c.harvestIn ? 'H-' + c.harvestIn : 'panen'})</a>`).join('')}</div>
          <div class="row"><div class="search soft">${icon('search')}<label for="crop-q" class="sr-only">Cari</label><input id="crop-q" type="search" placeholder="Cari varietas / slot…"></div>
            <select id="f-st" class="sel-pill"><option value="all">Semua status</option><option value="ok">Sehat</option><option value="warn">Perlu perhatian</option></select></div>
        </div>

        <div class="split">
          <div class="stack" data-crop-main>${selected ? batchCard(selected) : `<section class="card">${slotMap(sysF === 'B' ? 'B' : 'A')}<div data-slotdetail></div></section><div class="g2" data-grid>${crops.map(miniBatch).join('')}</div>`}</div>
          <aside class="stack">
            ${(() => { const other = all.find((c) => c.system === 'B' && c.id !== sel) || all[all.length - 1]; return other ? `<a class="card card-sm side-batch" href="#/crops/${other.id}"><div class="row-between"><span class="pill pill-info">BATCH #${pad2(other.batch)} ${esc(other.systemInfo.name.toUpperCase())}</span><span class="green small row"><span class="dot"></span>${other.level === 'ok' ? 'Aktif Sehat' : 'Dipantau'}</span></div>
              <div class="ph side-batch-img">${HC.ui.img(HC.data.cropCatalog.lettuce.image === other.image ? 'assets/images/stitch/s05-07.jpg' : other.image, other.name)}<span class="ph-cap"><span class="cap">${esc(other.systemInfo.name)} • ${other.slots} Plug Tebu</span></span></div>
              <h2>${esc(other.name)} ${esc(other.variety)}</h2><p class="muted small">${esc(other.info.latin)} • ditanam ${fmtDate(other.plantedAt)}</p>
              <div class="panel g2 mb-stats"><div><small>Usia tanam</small><b>Hari ke-${other.age}</b><span class="muted tiny">Target ${other.info.cycle} hari</span></div><div><small>Target EC</small><b>${fmt(other.info.ec[0], 1)}–${fmt(other.info.ec[1], 1)}</b><span class="green tiny">mS/cm (acuan)</span></div><div><small>Fase</small><b>${esc(other.stage.label)}</b></div><div><small>Kesehatan</small><b class="green">${other.healthy}/${other.slots} sehat</b></div></div>
              <div class="row-between tiny"><span>Progres siklus</span><span>${Math.round(Math.min(100, other.stage.pct * 100))}%</span></div><div class="bar thin"><span style="width:${Math.min(100, other.stage.pct * 100)}%"></span></div></a>` : ''; })()}
            <div class="card card-sm"><div class="row"><span class="icon-box sm">${icon('recycle')}</span><div><h3>Sirkularitas Ampas Tebu</h3><small class="muted">Media substrat HYCANE</small></div></div>
              <p class="small circ-p">Plug ampas tebu dirancang biodegradable: setelah panen dapat dicacah dan dikomposkan, tidak menumpuk seperti rockwool. Kinerjanya sebagai media hidroponik masih dalam tahap pengujian.</p>
              <div class="panel row-between small"><span class="row">${icon('package')}Stok plug tersedia</span><b class="green">18 plug</b></div></div>
          </aside>
        </div>

        ${next ? `<section class="card harvest-cta"><span class="icon-box solid">${icon('lightbulb')}</span><div><div class="row"><span class="pill pill-mintbright">REKOMENDASI HYCANE</span><span class="muted small">Panen terdekat</span></div>
          <h2>Panen ${esc(next.name)} Batch #${pad2(next.batch)} diperkirakan ${fmtDate(next.harvestDate)}</h2><p class="muted">Cek warna dan tekstur daun beberapa hari sebelumnya, lalu panen pagi hari agar sayur tetap segar. Catat hasil timbangan di Harvest Log.</p></div>
          <div class="stack-sm"><a class="btn btn-soft" href="#/learn/checklist-pemula">${icon('book')}Pelajari Persiapan Panen</a><a class="btn btn-primary" href="#/crops/${next.id}/harvest">${icon('scale2')}Buka Harvest Log</a></div></section>` : ''}
      </div>`;
    },
    mount(root) {
      const { $, $$ } = HC.util;
      $('#f-sys', root).addEventListener('change', (e) => HC.router.go('#/crops' + (e.target.value === 'all' ? '' : '?sys=' + e.target.value)));
      const filter = () => {
        const q = $('#crop-q', root).value.trim().toLowerCase(), st = $('#f-st', root).value;
        $$('.minibatch, .slot[data-crop]', root).forEach((el) => {
          const c = HC.store.get('crops').map(HC.model.crop).find((x) => x.id === (el.dataset.crop || el.getAttribute('href').split('/').pop()));
          if (!c) return;
          const okQ = !q || `${c.name} ${c.variety} ${c.codes.join(' ')}`.toLowerCase().includes(q);
          const okS = st === 'all' || (st === 'ok' ? c.level === 'ok' : c.level !== 'ok');
          el.classList.toggle('dim', !(okQ && okS));
        });
      };
      $('#crop-q', root).addEventListener('input', filter);
      $('#f-st', root).addEventListener('change', filter);
      root.addEventListener('click', (e) => {
        const sl = e.target.closest('[data-slot]');
        if (sl) {
          const c = HC.store.get('crops').map(HC.model.crop).find((x) => x.id === sl.dataset.crop);
          const box = $('[data-slotdetail]', root);
          if (c && box) { box.innerHTML = slotDetail(c, Number(sl.dataset.i)); $$('.slot', root).forEach((x) => x.classList.toggle('sel', x === sl)); }
        }
        if (e.target.closest('[data-export]')) {
          const rows = [['batch', 'tanaman', 'varietas', 'rak', 'slot', 'tanggal_tanam', 'umur_hari', 'fase', 'sehat', 'jumlah_lubang', 'skor', 'perkiraan_panen']];
          HC.store.get('crops').map(HC.model.crop).forEach((c) => rows.push([c.batch, c.name, c.variety, c.systemInfo.name, c.slotLabel, c.plantedAt, c.age, c.stage.label, c.healthy, c.slots, c.score, isoDate(c.harvestDate)]));
          HC.ui.download('hycane-crop-log.csv', rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'));
          HC.ui.toast('Log tanam diekspor (CSV)', { sev: 'ok', icon: 'download' });
        }
      });
    },
  };

  /* ---------------- 06 Crop detail ---------------- */
  function journalHtml(id) {
    const list = (HC.store.get('journal')[id] || []).slice().sort((a, b) => b.at - a.at);
    if (!list.length) return '<p class="muted">Belum ada catatan.</p>';
    const kindTag = { rutin: ['pill-ok', 'Rutin'], koreksi: ['pill-crit', 'Koreksi'], mekanis: ['pill-info', 'Perawatan'], mulai: ['pill-mintbright', 'Mulai batch'], catatan: ['pill-muted', 'Catatan'] };
    return `<ol class="vtl">${list.map((j) => { const k = kindTag[j.kind] || kindTag.catatan; return `<li><span class="v-dot ${j.kind === 'koreksi' ? 'crit' : j.kind === 'mekanis' ? 'blue' : ''}"></span><div class="v-head">Hari ${j.day} — ${esc(j.title)}<span class="pill ${k[0]}">${fmtDate(j.at)}</span><span class="right">${k[1]}</span></div><p>${esc(j.text)}</p></li>`; }).join('')}</ol>`;
  }

  function liveIot(c) {
    const s = c.snap;
    const row = (label, ic, val, unit, target, pct, ok) => `<div class="panel iot-row"><div class="row-between"><span class="row small">${icon(ic)}${label}</span>${HC.ui.pill(ok ? 'ok' : 'warn', ok ? 'Sesuai' : 'Di luar acuan')}</div><div class="row-between"><b class="iot-v">${val}<small>${unit}</small></b><span class="small muted">Target: ${target}</span></div><div class="bar thin ${ok ? '' : 'warn'}"><span style="width:${Math.max(4, Math.min(100, pct))}%"></span></div></div>`;
    return `<div class="row-between"><h2 class="row">${icon('wifi')}Biosistem Live IoT</h2><span class="pill pill-mintbright">SINKRON</span></div>
      ${row('pH derajat keasaman', 'flask', fmt(s.ph, 2), '', `${fmt(c.info.ph[0], 1)}–${fmt(c.info.ph[1], 1)}`, ((s.ph - 4.5) / 3.5) * 100, c.phOk)}
      ${row('Kepekatan nutrisi (EC)', 'zap', fmt(s.ec, 2), ' mS/cm', `${fmt(c.info.ec[0], 1)}–${fmt(c.info.ec[1], 1)}`, (s.ec / 3) * 100, c.ecOk)}
      ${row('Suhu reservoir air', 'thermometer', fmt(s.temperature, 1), '°C', '22–29,5°C', ((s.temperature - 18) / 16) * 100, s.levels.temperature === 'ok')}
      <div class="panel row-between iot-mini"><span class="row small">${icon('waves')}Level air tandon</span><b>${fmt(s.waterLevel)}% • ${fmt(s.flow, 1)} L/mnt</b></div>`;
  }

  HC.views.cropDetail = {
    render({ id }) {
      const raw = HC.store.get('crops').find((c) => c.id === id);
      if (!raw) return HC.ui.emptyState({ icon: 'sprout', title: 'Tanaman tidak ditemukan', body: 'Mungkin sudah dihapus atau demo telah di-reset.', actions: '<a class="btn btn-primary" href="#/crops">Kembali ke Tanaman Saya</a>' });
      const c = HC.model.crop(raw);
      const est = (c.slots * c.info.gramPerPlant) / 1000;
      const water = c.age * 0.75;
      const gallery = (c.info.gallery || []).filter(([d]) => d <= c.age).concat(c.info.gallery && c.info.gallery.some(([d]) => d <= c.age) ? [] : [[c.age, c.image, 'Foto terbaru']]);
      const sop = (HC.store.get('sop') || {})[id] || {};
      const recs = HC.reco.evaluate(c.snap, c.system);
      return `<div class="page crop-detail">
        <div class="row-between"><nav class="crumbs"><a href="#/crops">${icon('arrowLeft')}Kembali ke Tanaman Saya</a> / Budidaya / <span class="here">${esc(batchName(c))}</span></nav>
          <div class="row"><span class="pill pill-muted"><span class="dot"></span>IoT ${c.systemInfo.device} aktif: <span data-ago>${timeAgo(c.snap.timestamp)}</span></span><span class="pill pill-outline">${icon('cloud')}Data lokal demo</span></div></div>
        <div class="page-head"><div><h1>Detail ${esc(batchName(c))}</h1>
          <div class="row chips-row"><span class="pill pill-lg pill-mintbright">${icon('leaf')}Hari ke-${c.age}</span><span class="pill pill-ok"><span class="dot"></span>Fase ${esc(c.stage.label)}</span><span class="pill pill-muted">${icon('recycle')}Media: Ampas Tebu</span><span class="pill pill-muted">${icon('cpu')}${esc(c.systemInfo.deviceName)} · Slot ${esc(c.slotLabel)}</span></div></div>
          <div class="stack-sm"><div class="row"><button class="btn btn-ghost" data-report>${icon('download')}Unduh Laporan Siklus</button><a class="btn btn-ghost" href="#/crops/${id}/harvest">${icon('calendar')}Jadwalkan Panen</a></div><button class="btn btn-primary" data-journal>${icon('camera')}Catat Jurnal / Foto Tanaman (+)</button></div></div>

        <div class="g4">
          <div class="card kpi-c"><div class="row-between"><span class="muted">Health Index</span>${HC.ui.pill(c.level, c.level === 'ok' ? 'Optimal' : null)}</div><div class="kpi-big"><b data-score>${c.score}</b><small>/ 100</small></div><div class="bar ${c.level === 'ok' ? '' : 'warn'}"><span style="width:${c.score}%"></span></div><p class="small muted">${esc(c.condition)}</p></div>
          <div class="card kpi-c"><div class="row-between"><span class="muted">Estimasi Hasil Panen</span>${icon('scale2')}</div><div class="kpi-big"><b>${fmt(est * 0.9, 1)}–${fmt(est * 1.05, 1)}</b><small>kg total</small></div><div class="row small"><span class="pill pill-muted">${c.slots} netpot aktif</span><span class="green">± ${c.info.gramPerPlant} g / lubang</span></div><p class="small muted">Estimasi dari jumlah lubang dan bobot acuan tanaman.</p></div>
          <div class="card kpi-c"><div class="row-between"><span class="muted">Konsumsi Air (estimasi)</span>${icon('droplet')}</div><div class="kpi-big"><b>${fmt(water, 1)}</b><small>liter total</small></div><div class="row small green">${icon('checkCircle')}± 0,75 L / hari</div><p class="small muted">Diperkirakan dari umur tanam; ukuran pasti dari sensor level tandon.</p></div>
          <div class="card kpi-c"><div class="row-between"><span class="muted">Masa Tanam Tersisa</span><span class="pill pill-info">${c.harvestIn ? 'H-' + c.harvestIn : 'Panen'}</span></div><div class="kpi-big"><b class="green">${c.harvestIn}</b><small>hari lagi</small></div><div class="bar"><span style="width:${Math.min(100, c.stage.pct * 100)}%"></span></div><div class="row-between small"><span class="muted">Target panen:</span><b>${fmtDate(c.harvestDate)}</b></div></div>
        </div>

        <div class="split">
          <div class="stack">
            <section class="card"><div class="card-head"><div><h2>${icon('image')}Morfologi & Riwayat Visual Tumbuh</h2><p>Dokumentasi pertumbuhan tajuk dan akar pada media ampas tebu.</p></div></div>
              <div class="gallery">${gallery.map(([d, src, cap], i) => `<figure class="gcard"><div class="ph gimg">${HC.ui.img(src, cap)}<span class="ph-badge pill ${i === gallery.length - 1 ? 'pill-solid' : 'pill-muted'}">Hari ${pad2(d)}${i === gallery.length - 1 ? ' (terbaru)' : ''}</span></div><figcaption><b>${esc(cap)}</b><small>${fmtDate(HC.util.addDays(c.plantedAt, d))}</small></figcaption></figure>`).join('')}</div></section>

            <section class="card"><div class="card-head"><div><h2>${icon('trend')}Korelasi Biosensor (3 menit terakhir)</h2><p>Parameter air di ${esc(c.systemInfo.name)} yang memengaruhi batch ini.</p></div>
              <div class="seg" role="tablist">${[['ph', 'pH Larutan'], ['tds', 'TDS (ppm)'], ['temperature', 'Suhu Air']].map(([m, l], i) => `<button role="tab" aria-selected="${i === 0}" data-cm="${m}">${l}</button>`).join('')}</div></div>
              <div class="chart-wrap"><div class="chart-box"><canvas data-cd-chart role="img" aria-label="Grafik parameter air"></canvas></div></div>
              <div class="panel panel-mint agro"><div class="row"><span class="icon-box sm solid">${icon('sparkles')}</span><b class="green">Rekomendasi HYCANE</b><span class="pill pill-muted">rule-based demo</span></div>
                <p data-agro>${recs.length ? esc(`${recs[0].title} ${recs[0].todo[0]}`) : esc(`Kondisi air di ${c.systemInfo.name} stabil dan sesuai acuan ${c.name}. ${c.note}`)}</p></div></section>

            <section class="card"><div class="card-head"><div><h2>${icon('edit')}Log Harian & Jurnal Aktivitas</h2><p>Catatan tindakan, perawatan, dan rekomendasi yang dijalankan untuk batch ini.</p></div><button class="btn btn-soft btn-sm" data-journal>${icon('plus')}Tambah catatan</button></div>
              <div data-journal-list>${journalHtml(id)}</div></section>
          </div>
          <aside class="stack">
            <section class="card card-sm" data-iot>${liveIot(c)}</section>
            <section class="card card-sm"><div class="row-between"><h2 class="row">${icon('receipt')}SOP Menjelang Panen</h2><span class="pill pill-info">${c.harvestIn ? 'H-' + c.harvestIn : 'Panen'}</span></div>
              <p class="small muted sop-p">Ikuti langkah ini agar sayur dipanen dalam kondisi terbaik.</p>
              <div class="stack-sm">${HC.data.HARVEST_SOP.map(([t, d], i) => `<label class="sop ${sop[i] ? 'done' : ''}"><input type="checkbox" data-sop="${i}" ${sop[i] ? 'checked' : ''}><span><b>${esc(t)}</b><small>${esc(d)}</small></span></label>`).join('')}</div>
              <a class="btn btn-primary btn-block" href="#/crops/${id}/harvest">${icon('scale2')}Buka Harvest Log</a></section>
            <section class="card card-sm circ"><h2 class="row">${icon('recycle')}Sirkularitas Pasca-Panen</h2>
              <div class="ph circ-img">${HC.ui.img('assets/images/stitch/s06-12.jpg', 'Kompos dari media ampas tebu')}<span class="ph-cap"><span class="cap">Media bekas → kompos rumah tangga</span></span></div>
              <p class="small">Setelah panen, plug ampas tebu bekas bisa dicacah dan dikomposkan atau dipakai sebagai mulsa pot, sehingga tidak menambah sampah seperti rockwool.</p>
              <button class="btn btn-primary btn-block" data-add="media-18">${icon('recycle')}Siapkan Media Semai Batch Berikutnya</button>
              <a class="btn btn-ghost btn-block" href="#/community">${icon('message')}Bagikan ke Komunitas</a></section>
            ${raw.userAdded ? `<button class="btn btn-danger-soft btn-block" data-remove-crop>${icon('trash')}Hapus batch ini</button>` : ''}
          </aside>
        </div>
      </div>`;
    },
    mount(root, { id }) {
      const raw = HC.store.get('crops').find((c) => c.id === id);
      if (!raw) return null;
      const { $, $$ } = HC.util;
      let metric = 'ph';
      let chart = HC.charts.create($('[data-cd-chart]', root), metric, raw.system);
      const tick = () => {
        if (HC.store.get('settings').offline) return;
        chart.update();
        const c = HC.model.crop(HC.store.get('crops').find((x) => x.id === id));
        $('[data-iot]', root).innerHTML = liveIot(c);
        $('[data-ago]', root).textContent = timeAgo(c.snap.timestamp);
      };
      root.addEventListener('change', (e) => {
        const s = e.target.dataset.sop;
        if (s === undefined) return;
        HC.store.update('sop', (o) => { o = o || {}; o[id] = o[id] || {}; o[id][s] = e.target.checked; return o; });
        e.target.closest('.sop').classList.toggle('done', e.target.checked);
      });
      root.addEventListener('click', async (e) => {
        const cm = e.target.closest('[data-cm]');
        if (cm && cm.dataset.cm !== metric) {
          metric = cm.dataset.cm; $$('[data-cm]', root).forEach((x) => x.setAttribute('aria-selected', String(x === cm)));
          chart.destroy(); chart = HC.charts.create($('[data-cd-chart]', root), metric, raw.system);
        }
        if (e.target.closest('[data-journal]')) {
          const c = HC.model.crop(raw);
          let res = null;
          const r = await HC.ui.modal(`<h2>Catat Jurnal / Foto Tanaman</h2><p class="muted small">Hari ke-${c.age} • ${esc(batchName(c))}</p>
            <div class="field"><label for="j-title">Judul catatan</label><input id="j-title" placeholder="Contoh: Pangkas daun bawah"></div>
            <div class="field"><label for="j-kind">Jenis</label><select id="j-kind"><option value="rutin">Pemeliharaan rutin</option><option value="koreksi">Koreksi kondisi air</option><option value="mekanis">Perawatan sistem</option><option value="catatan">Catatan umum</option></select></div>
            <div class="field"><label for="j-text">Isi catatan</label><textarea id="j-text" rows="3" placeholder="Apa yang kamu lakukan / amati?"></textarea></div>
            <label class="check"><input type="checkbox" id="j-sensor" checked><span>Sisipkan data sensor saat ini (pH ${fmt(c.snap.ph, 1)}, TDS ${fmt(c.snap.tds)} ppm, ${fmt(c.snap.temperature, 1)}°C)</span></label>
            <p class="hint">${icon('camera')} Unggah foto tidak tersedia di demo ini.</p>
            <div class="modal-actions"><button class="btn btn-ghost" data-modal="cancel">Batal</button><button class="btn btn-primary" data-modal="ok">Simpan catatan</button></div>`,
          { focus: '#j-title', collect: (m) => ({ title: m.querySelector('#j-title').value.trim(), kind: m.querySelector('#j-kind').value, text: m.querySelector('#j-text').value.trim(), sensor: m.querySelector('#j-sensor').checked }), get result() { return res; }, set result(v) { res = v; } });
          if (r === 'ok' && res && (res.title || res.text)) {
            const extra = res.sensor ? ` (Sensor: pH ${fmt(c.snap.ph, 1)}, TDS ${fmt(c.snap.tds)} ppm, suhu ${fmt(c.snap.temperature, 1)}°C)` : '';
            HC.store.update('journal', (j) => { (j[id] = j[id] || []).push({ day: c.age, at: Date.now(), title: res.title || 'Catatan', text: (res.text || '-') + extra, kind: res.kind }); return j; });
            $('[data-journal-list]', root).innerHTML = journalHtml(id);
            HC.ui.toast('Catatan jurnal disimpan', { sev: 'ok' });
          } else if (r === 'ok') HC.ui.toast('Isi judul atau catatan terlebih dahulu', { sev: 'warn' });
        }
        if (e.target.closest('[data-report]')) {
          const c = HC.model.crop(raw);
          const rows = [['hari', 'tanggal', 'judul', 'catatan', 'jenis']].concat((HC.store.get('journal')[id] || []).map((j) => [j.day, isoDate(j.at), j.title, j.text, j.kind]));
          HC.ui.download(`laporan-${id}.csv`, `"${batchName(c)}"\n` + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'));
          HC.ui.toast('Laporan siklus diunduh (CSV)', { sev: 'ok', icon: 'download' });
        }
        if (e.target.closest('[data-remove-crop]') && await HC.ui.confirm('Hapus batch ini?', 'Batch akan dihapus dari daftar tanaman.', 'Hapus', true)) {
          HC.store.update('crops', (cs) => cs.filter((c) => c.id !== id));
          HC.router.go('#/crops');
        }
      });
      const offs = [HC.bus.on('sim:tick', tick)];
      return () => { offs.forEach((f) => f()); chart.destroy(); };
    },
  };

  /* ---------------- 07 Add crop / new batch ---------------- */
  HC.views.cropAdd = {
    render() {
      const crops = HC.store.get('crops');
      const used = (sys) => crops.filter((c) => c.system === sys).reduce((s, c) => s + c.slots, 0);
      const free = { A: HC.data.systems.A.slots - used('A'), B: HC.data.systems.B.slots - used('B') };
      const pre = HC.util.query().get('sys');
      return `<div class="page narrow">
        <nav class="crumbs"><a href="#/crops">Tanaman Saya</a>${icon('chevronRight')}<span class="here">Tambah Batch</span></nav>
        <div class="page-head"><div><h1>Tambah Batch / Semai Baru</h1><p>Catat tanaman baru agar HYCANE bisa memantau umur, fase, dan perkiraan panennya.</p></div></div>
        <form class="card form" id="crop-form" novalidate>
          <div class="field"><label for="f-type">Jenis tanaman</label>
            <select id="f-type" required>${Object.entries(HC.data.cropCatalog).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('')}</select><p class="hint" id="f-type-hint"></p></div>
          <div class="field-row">
            <div class="field"><label for="f-var">Varietas (opsional)</label><input id="f-var" type="text" placeholder="Contoh: Nauli F1"></div>
            <div class="field"><label for="f-sys">Rak</label><select id="f-sys">${Object.values(HC.data.systems).map((s) => `<option value="${s.id}" ${free[s.id] <= 0 ? 'disabled' : ''} ${pre === s.id ? 'selected' : ''}>${esc(s.name)} (${s.type}) · ${Math.max(0, free[s.id])} lubang kosong</option>`).join('')}</select></div>
          </div>
          <div class="field-row">
            <div class="field"><label for="f-slots">Jumlah lubang</label><input id="f-slots" type="number" min="1" value="1" inputmode="numeric"></div>
            <div class="field"><label for="f-date">Tanggal semai / pindah tanam</label><input id="f-date" type="date" value="${isoDate(new Date())}" max="${isoDate(new Date())}"></div>
          </div>
          <div class="field"><label for="f-note">Catatan (opsional)</label><input id="f-note" type="text" placeholder="Contoh: bibit dari semai 10 hari"></div>
          <div class="panel panel-mint note small">${icon('recycle')}<span>Gunakan plug media ampas tebu baru untuk setiap batch agar sistem tetap bersih. <a class="link" href="#/marketplace/p/media-18">Beli refill</a></span></div>
          <p class="form-error" id="crop-err" role="alert" hidden></p>
          ${free.A + free.B <= 0 ? `<div class="banner banner-warn">${icon('alert')}<span>Semua lubang tanam terisi. Panen dulu tanaman yang siap, atau tambah kapasitas dengan <a href="#/marketplace/p/kit-plumbing">Plumbing Pack</a>.</span></div>` : ''}
          <div class="row-end"><a class="btn btn-ghost" href="#/crops">Batal</a><button class="btn btn-primary" type="submit">${icon('plus')}Simpan batch</button></div>
        </form>
      </div>`;
    },
    mount(root) {
      const { $ } = HC.util;
      const crops = HC.store.get('crops');
      const used = (sys) => crops.filter((c) => c.system === sys).reduce((s, c) => s + c.slots, 0);
      const hint = (auto) => {
        const v = HC.data.cropCatalog[$('#f-type', root).value];
        $('#f-type-hint', root).textContent = `Siklus ± ${v.cycle} hari · pH acuan ${fmt(v.ph[0], 1)}–${fmt(v.ph[1], 1)} · ${v.cycle > 60 ? 'cocok di Rak Tanaman Buah' : 'cocok di Rak Sayur Daun'}`;
        if (auto) $('#f-sys', root).value = v.cycle > 60 && !$('#f-sys option[value="B"]', root).disabled ? 'B' : (!$('#f-sys option[value="A"]', root).disabled ? 'A' : 'B');
      };
      hint(!HC.util.query().get('sys'));
      $('#f-type', root).addEventListener('change', () => hint(true));
      $('#crop-form', root).addEventListener('submit', (e) => {
        e.preventDefault();
        const type = $('#f-type', root).value, sys = $('#f-sys', root).value, slots = Number($('#f-slots', root).value), date = $('#f-date', root).value;
        const free = HC.data.systems[sys].slots - used(sys);
        const err = $('#crop-err', root);
        if (!slots || slots < 1) { err.textContent = 'Jumlah lubang minimal 1.'; err.hidden = false; return; }
        if (slots > free) { err.textContent = `Rak ini hanya punya ${Math.max(0, free)} lubang kosong.`; err.hidden = false; return; }
        if (!date) { err.textContent = 'Isi tanggal semai / pindah tanam.'; err.hidden = false; return; }
        const id = HC.util.uid('c');
        const batch = Math.max(0, ...HC.store.get('crops').map((c) => c.batch || 0)) + 1;
        const age = Math.max(0, daysBetween(date, new Date()));
        HC.store.update('crops', (cs) => cs.concat([{ id, type, variety: $('#f-var', root).value.trim(), batch, system: sys, slots, healthy: slots, sick: [], plantedAt: date, healthScore: 95, userAdded: true,
          condition: 'Baru dipindah tanam. Pantau 3 hari pertama.', note: $('#f-note', root).value || 'Jaga media tetap lembap dan hindari terik berlebihan di minggu pertama.' }]));
        HC.store.update('journal', (j) => { j[id] = [{ day: 0, at: new Date(date).getTime(), title: 'Mulai batch', text: 'Batch baru dicatat di HYCANE.', kind: 'mulai' }]; if (age > 0) j[id][0].day = 0; return j; });
        HC.ui.toast(`${HC.data.cropCatalog[type].name} ditambahkan sebagai Batch #${pad2(batch)}`, { sev: 'ok', icon: 'sprout' });
        HC.router.go('#/crops/' + id);
      });
    },
  };
})();
