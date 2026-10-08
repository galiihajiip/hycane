/* Harvest Log (Stitch 07_harvest_workflow_logging) and Traceability Certificate (Stitch 20).
   All economics and certificate data are demo records derived from the user's own inputs and sensor log.
   The certificate is a cultivation-record summary, NOT a third-party or lab certification. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt, fmtDate, fmtTime, rupiah, isoDate } = HC.util;
  const icon = HC.icon;
  const pad2 = (n) => String(n).padStart(2, '0');
  const KWH = 1444.7; // Rp/kWh, household tariff assumption for the demo
  const STEPS = [
    ['Persiapan pra-panen', 'Cek warna & tekstur daun. Opsional: ganti sebagian larutan dengan air bersih 1–2 hari sebelum panen.', 'checkCircle'],
    ['Panen pagi hari', 'Panen sebelum terik (± sebelum 08.00) agar daun tetap segar dan renyah.', 'sun'],
    ['Penimbangan & sortasi', 'Timbang total hasil, pisahkan Grade A (utuh, segar) dan Grade B (sedikit cacat).', 'scale2'],
    ['Sirkularitas media', 'Cacah plug ampas tebu bekas untuk kompos atau mulsa pot.', 'recycle'],
  ];

  function stats(sys) {
    const h = HC.sim.history(sys);
    const med = (arr) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
    return { ph: med(h.map((p) => p.ph)), temp: h.reduce((a, p) => a + p.temperature, 0) / h.length, tds: h[h.length - 1].tds, ec: h[h.length - 1].ec };
  }

  function draftOf(c) {
    const key = 'harvest:' + c.id;
    const saved = (HC.store.get('sop') || {})[key];
    if (saved) return saved;
    const plants = c.slots;
    const gA = Math.max(0, c.healthy), gB = plants - gA;
    const kg = +((plants * c.info.gramPerPlant) / 1000 * 0.95).toFixed(2);
    return { step: 1, kg, plants, gA, gB, gC: 0, priceA: 30000, priceB: 15000, media: 'kompos' };
  }
  const saveDraft = (c, d) => HC.store.update('sop', (o) => { o = o || {}; o['harvest:' + c.id] = d; return o; });

  /* Cost of one cycle, from the catalog prices actually sold in the marketplace + electricity estimate. */
  function cogs(c, d) {
    const P = (id) => HC.pricing.price(id);
    const media = (P('media-18') / 18) * d.plants;
    const seeds = P(c.info.seed) * 0.25; // one pack lasts ~4 sowings
    const share = d.plants / HC.data.systems[c.system].slots;
    const nutrient = (P(c.system === 'B' ? 'abmix-fruit' : 'abmix-leafy') / 3) * share; // ~3 cycles per 1 L set, shared by the rack
    const power = (8 * 24 * Math.max(1, c.age) / 1000) * KWH * share; // 8 W pump, shared by the rack
    return { media, seeds, nutrient, power, total: media + seeds + nutrient + power };
  }

  function econHtml(c, d) {
    const k = cogs(c, d);
    const tot = d.gA + d.gB + d.gC || 1;
    const kgA = (d.kg * d.gA) / tot, kgB = (d.kg * d.gB) / tot;
    const rev = kgA * d.priceA + kgB * d.priceB;
    const margin = rev > 0 ? (rev - k.total) / rev : 0;
    return `<div class="card-head"><div class="row">${icon('chart')}<div><h2>Analisis Ekonomi Siklus Tanam</h2><p>Estimasi nilai jual dan biaya siklus ini (asumsi demo, dapat diubah).</p></div></div><span class="pill pill-lg pill-mintbright">Margin kotor: ${fmt(margin * 100, 1)}%</span></div>
      <div class="g2">
        <div class="panel econ"><div class="label-sm green">Valuasi Penjualan Panen</div>
          <div class="econ-row"><span>Grade A · ${fmt(kgA, 2)} kg @</span><input type="number" min="0" step="500" value="${d.priceA}" data-h="priceA" aria-label="Harga Grade A per kg"><b>${rupiah(kgA * d.priceA)}</b></div>
          <div class="econ-row"><span>Grade B · ${fmt(kgB, 2)} kg @</span><input type="number" min="0" step="500" value="${d.priceB}" data-h="priceB" aria-label="Harga Grade B per kg"><b>${rupiah(kgB * d.priceB)}</b></div>
          <div class="econ-total"><span>Total nilai (revenue)</span><b class="green">${rupiah(rev)}</b></div></div>
        <div class="panel econ"><div class="label-sm red">Biaya Operasional Siklus (COGS)</div>
          <div class="econ-row"><span>Media ampas tebu (${d.plants} plug)</span><b>${rupiah(k.media)}</b></div>
          <div class="econ-row"><span>Nutrisi AB Mix (porsi rak)</span><b>${rupiah(k.nutrient)}</b></div>
          <div class="econ-row"><span>Benih (¼ pack)</span><b>${rupiah(k.seeds)}</b></div>
          <div class="econ-row"><span>Listrik pompa 8 W (${c.age} hari, porsi rak)</span><b>${rupiah(k.power)}</b></div>
          <div class="econ-total"><span>Total pengeluaran</span><b>${rupiah(k.total)}</b></div></div>
      </div>
      <div class="profit"><span class="icon-box solid">${icon('trend')}</span><div><div class="label-sm green">Laba kotor siklus ini</div><b>${rupiah(rev - k.total)}</b><small> / ${d.plants} lubang</small></div><p class="tiny muted">Harga jual per kg adalah asumsi yang bisa kamu ubah. Biaya memakai harga demo marketplace HYCANE dan tarif listrik ± Rp${fmt(KWH, 0)}/kWh. Belum termasuk biaya kit (investasi awal).</p></div>`;
  }

  function stepCards(d) {
    return STEPS.map(([t, desc, ic], i) => {
      const st = i + 1 < d.step ? 'done' : i + 1 === d.step ? 'now' : 'wait';
      return `<div class="hstep ${st}"><div class="row-between"><span class="label-sm">Langkah ${pad2(i + 1)}</span>${st === 'done' ? HC.ui.pill('ok', 'Selesai') : st === 'now' ? '<span class="pill pill-solid">● Sedang aktif</span>' : '<span class="pill pill-muted">Menunggu</span>'}</div>
        <b>${t}</b><p>${desc}</p>${st === 'now' ? `<button class="btn btn-white btn-sm" data-step-done>${icon('check')}Tandai selesai</button>` : `<span class="hstep-f">${icon(ic)}${st === 'done' ? 'Tercatat' : 'Belum dimulai'}</span>`}</div>`;
    }).join('');
  }

  HC.views.harvest = {
    render({ id }) {
      const raw = HC.store.get('crops').find((x) => x.id === id);
      if (!raw) return HC.ui.emptyState({ icon: 'sprout', title: 'Batch tidak ditemukan', body: 'Batch ini mungkin sudah diarsipkan setelah panen.', actions: '<a class="btn btn-primary" href="#/crops">Kembali ke Tanaman Saya</a>' });
      const c = HC.model.crop(raw);
      const d = draftOf(c);
      const sopDone = Object.values(((HC.store.get('sop') || {})[id]) || {}).filter(Boolean).length;
      const s = stats(c.system);
      const avg = d.plants ? (d.kg * 1000) / d.plants : 0;
      return `<div class="page">
        <nav class="crumbs">HYCANE ${icon('chevronRight')}<a href="#/crops">Tanaman Saya</a>${icon('chevronRight')}<a href="#/crops/${id}">Batch #${pad2(c.batch)}: ${esc(c.name)} ${esc(c.variety)}</a>${icon('chevronRight')}<span class="here">Alur & Pencatatan Panen (Harvest Log)</span></nav>
        <section class="card hv-head"><div><div class="row"><span class="pill pill-mintbright">${icon('sprout')}BATCH #${pad2(c.batch)}: ${esc((c.name + ' ' + c.variety).toUpperCase())}</span><span class="pill pill-info">Hari ke-${c.age} (${esc(c.stage.label)})</span><span class="pill pill-muted">SOP pra-panen ${sopDone}/3</span></div>
          <h1>Siklus Panen & Pencatatan Hasil Panen</h1><p class="muted">Panen pagi hari, timbang hasilnya, catat grade, lalu tutup siklus media ampas tebu secara sirkular.</p></div>
          <div class="stack-sm"><a class="btn btn-soft" href="#/certificate/${id}">${icon('qr')}Pratinjau Sertifikat Panen</a><button class="btn btn-primary" data-archive>${icon('save')}Simpan & Arsipkan Batch</button></div></section>

        <section class="card"><div class="card-head"><h2>${icon('checkCircle')}Protokol Panen Standar HYCANE</h2><span class="pill pill-outline">SOP demo v1</span></div>
          <div class="g4 hsteps" data-steps>${stepCards(d)}</div></section>

        <div class="split">
          <div class="stack">
            <section class="card"><div class="card-head"><div><h2>${icon('scale2')}Pencatatan Hasil Panen</h2><p>Masukkan hasil timbangan. Angka awal adalah estimasi dari jumlah lubang dan bobot acuan.</p></div><span class="pill pill-muted">Input manual</span></div>
              <div class="g3 yield">
                <label class="panel yf"><span class="label-sm">Total bobot panen (kg)</span><input type="number" min="0" step="0.01" value="${d.kg}" data-h="kg"><small class="green">${icon('trend')}Estimasi ${fmt((c.slots * c.info.gramPerPlant) / 1000, 2)} kg</small></label>
                <div class="panel yf"><span class="label-sm">Rata-rata bobot / tanaman</span><b data-avg>${fmt(avg)}<small> gram</small></b><small class="blue">${icon('info')}Acuan ± ${c.info.gramPerPlant} g</small></div>
                <label class="panel yf"><span class="label-sm">Tanaman dipanen</span><input type="number" min="0" max="${c.slots}" value="${d.plants}" data-h="plants"><small class="muted">dari ${c.slots} lubang (${fmt((d.plants / c.slots) * 100)}% berhasil)</small></label>
              </div>
              <div class="row-between grade-head"><b>Klasifikasi Kualitas & Sortasi</b><span class="small muted">Total tercatat: <b data-gtotal>${d.gA + d.gB + d.gC}</b> tanaman</span></div>
              <div class="g3 grades">
                <label class="grade"><span class="row-between"><span class="pill pill-mintbright">Grade A (segar, utuh)</span><input type="number" min="0" value="${d.gA}" data-h="gA" aria-label="Jumlah Grade A"></span><small>Daun hijau merata, tegak, akar putih bersih.</small></label>
                <label class="grade"><span class="row-between"><span class="pill pill-info">Grade B (konsumsi lokal)</span><input type="number" min="0" value="${d.gB}" data-h="gB" aria-label="Jumlah Grade B"></span><small>Sedikit cacat/menguning di tepi, bobot lebih ringan.</small></label>
                <label class="grade"><span class="row-between"><span class="pill pill-muted">Grade C (afkir)</span><input type="number" min="0" value="${d.gC}" data-h="gC" aria-label="Jumlah Grade C"></span><small>Rusak; bisa dikomposkan bersama media.</small></label>
              </div>
              <div class="row-between grade-head"><b>${icon('camera')}Dokumentasi Visual (contoh)</b><span class="small muted">Unggah foto tidak tersedia di demo</span></div>
              <div class="g2"><div class="ph hv-img">${HC.ui.img('assets/images/stitch/s07-13.jpg', 'Hasil panen pakcoy')}<span class="ph-cap"><span class="cap">Hasil panen ${d.plants} lubang</span><span class="cap">Contoh foto</span></span></div><div class="ph hv-img">${HC.ui.img('assets/images/stitch/s07-14.jpg', 'Akar sehat pada media ampas tebu')}<span class="ph-cap"><span class="cap">Struktur akar & media ampas tebu</span></span></div></div>
            </section>
            <section class="card" data-econ>${econHtml(c, d)}</section>
            <section class="card"><div class="card-head"><div><h2>${icon('activity')}Evaluasi Biosensor</h2><p>Ringkasan kondisi air dari data sensor yang tersimpan di aplikasi.</p></div><span class="pill pill-info">${esc(c.systemInfo.name)}</span></div>
              <div class="g4 evalg"><div class="panel"><small>Median pH larutan</small><b>${fmt(s.ph, 2)}</b><span class="green">Acuan ${fmt(c.info.ph[0], 1)}–${fmt(c.info.ph[1], 1)}</span></div><div class="panel"><small>Rata-rata suhu air</small><b>${fmt(s.temp, 1)}°C</b><span class="green">Sejuk</span></div><div class="panel"><small>EC terakhir</small><b>${fmt(s.ec, 2)}</b><span class="green">mS/cm</span></div><div class="panel"><small>Catatan jurnal</small><b>${(HC.store.get('journal')[id] || []).length}</b><span class="green">entri</span></div></div></section>
          </div>
          <aside class="stack">
            <section class="card card-sm"><div class="row">${icon('recycle')}<div><h2>Misi Sirkularitas Ampas Tebu</h2><small class="green">Media biodegradable</small></div></div>
              <p class="small circ-p">Plug ampas tebu bekas panen tidak perlu dibuang ke tempat sampah seperti rockwool. Pilih cara mengolahnya:</p>
              <label class="opt ${d.media === 'kompos' ? 'on' : ''}"><input type="radio" name="media" value="kompos" ${d.media === 'kompos' ? 'checked' : ''} data-h="media"><span><b>Opsi A: Kompos rumah tangga</b><small>Cacah dan masukkan ke komposter bersama sisa sayur.</small></span></label>
              <label class="opt ${d.media === 'mulsa' ? 'on' : ''}"><input type="radio" name="media" value="mulsa" ${d.media === 'mulsa' ? 'checked' : ''} data-h="media"><span><b>Opsi B: Mulsa pot tanaman</b><small>Taburkan di permukaan pot untuk menjaga kelembapan tanah.</small></span></label>
              <button class="btn btn-primary btn-block" data-recycle>${icon('recycle')}Catat Daur Ulang Media</button></section>
            <section class="card card-sm"><div class="row-between"><h2 class="row">${icon('shield')}Ketertelusuran Panen</h2><span class="pill pill-mintbright">Demo</span></div>
              <p class="small muted">Pembeli bisa melihat ringkasan catatan budidaya batch ini: tanggal tanam, media, dan rata-rata kondisi air dari sensor.</p>
              <a class="qr-card panel" href="#/certificate/${id}">${HC.ui.qrArt('HYC-' + id, 112)}<b>HYC-${pad2(c.batch)}-${isoDate(new Date()).replace(/-/g, '')}</b><small>Ilustrasi kode QR · lihat sertifikat</small></a></section>
            <section class="card card-sm next-c"><h2 class="row">${icon('arrowRight')}Siklus Tanam Berikutnya</h2><p class="small muted">Setelah batch ini diarsipkan, ${c.slots} lubang di ${esc(c.systemInfo.name)} akan kosong dan siap ditanami.</p>
              <div class="panel row">${icon('sprout')}<span class="small">Siapkan ${c.slots} plug ampas tebu baru dan benih untuk semai berikutnya.</span></div>
              <button class="btn btn-soft btn-block" data-add="media-18">${icon('cart')}Pesan Refill Media</button></section>
          </aside>
        </div>
      </div>`;
    },
    mount(root, { id }) {
      const raw = HC.store.get('crops').find((x) => x.id === id);
      if (!raw) return null;
      const { $ } = HC.util;
      const c = HC.model.crop(raw);
      let d = draftOf(c);
      const refresh = () => {
        $('[data-avg]', root).innerHTML = `${fmt(d.plants ? (d.kg * 1000) / d.plants : 0)}<small> gram</small>`;
        $('[data-gtotal]', root).textContent = d.gA + d.gB + d.gC;
        $('[data-econ]', root).innerHTML = econHtml(c, d);
        root.querySelectorAll('.opt').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked));
      };
      root.addEventListener('input', (e) => {
        const k = e.target.dataset.h;
        if (!k) return;
        d = Object.assign({}, d, { [k]: k === 'media' ? e.target.value : Math.max(0, Number(e.target.value) || 0) });
        saveDraft(c, d);
        if (k !== 'priceA' && k !== 'priceB') refresh(); else { const pos = e.target.selectionStart; $('[data-econ]', root).innerHTML = econHtml(c, d); const inp = root.querySelector(`[data-h="${k}"]`); inp.focus(); try { inp.setSelectionRange(pos, pos); } catch (er) { /* number inputs */ } }
      });
      root.addEventListener('change', (e) => { if (e.target.dataset.h === 'media') { d.media = e.target.value; saveDraft(c, d); refresh(); } });
      root.addEventListener('click', async (e) => {
        if (e.target.closest('[data-step-done]')) { d = Object.assign({}, d, { step: Math.min(STEPS.length + 1, d.step + 1) }); saveDraft(c, d); $('[data-steps]', root).innerHTML = stepCards(d); HC.ui.toast('Langkah protokol panen dicatat', { sev: 'ok' }); }
        if (e.target.closest('[data-recycle]')) {
          HC.store.update('journal', (j) => { (j[id] = j[id] || []).push({ day: c.age, at: Date.now(), title: 'Daur ulang media', text: d.media === 'kompos' ? `${d.plants} plug ampas tebu bekas dicacah untuk kompos rumah tangga.` : `${d.plants} plug ampas tebu bekas dipakai sebagai mulsa pot.`, kind: 'catatan' }); return j; });
          HC.ui.toast('Daur ulang media dicatat di jurnal batch', { sev: 'ok', icon: 'recycle' });
        }
        if (e.target.closest('[data-archive]')) {
          const ok = await HC.ui.confirm('Simpan & arsipkan batch?', `Hasil panen ${fmt(d.kg, 2)} kg dari ${d.plants} tanaman akan disimpan ke riwayat panen, dan ${c.slots} lubang tanam menjadi kosong.`, 'Simpan & Arsipkan');
          if (!ok) return;
          const hid = 'H-' + String(HC.store.get('harvests').length + 1).padStart(3, '0');
          const s = stats(c.system);
          HC.store.update('harvests', (h) => [{ id: hid, cropId: id, crop: `${c.name} ${c.variety}`.trim(), type: c.type, at: Date.now(), plantedAt: c.plantedAt, plants: d.plants, kg: d.kg, gradeA: d.gA, gradeB: d.gB, gradeC: d.gC, system: c.system, batch: c.batch, ph: s.ph, temp: s.temp, media: d.media, journal: (HC.store.get('journal')[id] || []).slice() }].concat(h));
          HC.store.update('crops', (cs) => cs.filter((x) => x.id !== id));
          HC.ui.toast(`Batch #${pad2(c.batch)} diarsipkan. Sertifikat panen dibuat.`, { sev: 'ok', icon: 'award' });
          HC.router.go('#/certificate/' + hid);
        }
      });
    },
  };

  /* ---------------- Certificate (Stitch 20) ---------------- */
  function certData(id) {
    const h = HC.store.get('harvests').find((x) => x.id === id);
    if (h) {
      const info = HC.data.cropCatalog[h.type] || {};
      return { id, crop: h.crop, latin: info.latin || '', date: h.at, plantedAt: h.plantedAt || null, kg: h.kg, plants: h.plants, gA: h.gradeA, gB: h.gradeB, ph: h.ph, temp: h.temp, system: h.system || 'A', journal: h.journal || [], final: true, image: info.image };
    }
    const raw = HC.store.get('crops').find((x) => x.id === id);
    if (!raw) return null;
    const c = HC.model.crop(raw);
    const s = stats(c.system);
    const d = draftOf(c);
    return { id, crop: `${c.name} ${c.variety}`.trim(), latin: c.info.latin, date: c.harvestDate.getTime(), plantedAt: c.plantedAt, kg: d.kg, plants: d.plants, gA: d.gA, gB: d.gB, ph: s.ph, temp: s.temp, system: c.system, journal: HC.store.get('journal')[id] || [], final: false, image: c.image };
  }

  async function fingerprint(obj) {
    const txt = JSON.stringify(obj);
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { // non-secure context fallback
      let h = 0; for (const ch of txt) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h.toString(16).padStart(8, '0') + '(fallback)';
    }
  }

  HC.views.certificate = {
    render({ id }) {
      const x = certData(id);
      if (!x) return HC.ui.emptyState({ icon: 'qr', title: 'Sertifikat tidak ditemukan', body: 'Data panen untuk sertifikat ini tidak tersedia.', actions: '<a class="btn btn-primary" href="#/crops">Ke Tanaman Saya</a>' });
      const certNo = `HYC-${isoDate(x.date).replace(/-/g, '')}-${id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase()}`;
      const grade = x.gA + x.gB ? Math.round((x.gA / (x.gA + x.gB)) * 100) : 0;
      const tl = (x.journal || []).slice().sort((a, b) => a.at - b.at);
      const prof = HC.store.get('profile');
      return `<div class="page cert-page">
        <div class="row-between"><div><nav class="crumbs upper">HYCANE ${icon('chevronRight')} Budidaya ${icon('chevronRight')} ${esc(x.crop)} ${icon('chevronRight')}<span class="ink">Sertifikat Ketertelusuran</span></nav>
          <h1 class="cert-h1">Paspor Panen Digital #${certNo}</h1><span class="pill pill-mintbright">${icon('checkCircle')}${x.final ? 'Tercatat dari Harvest Log' : 'Pratinjau (belum dipanen)'}</span></div>
          <div class="stack-sm cert-actions"><div class="row"><button class="btn btn-sky btn-sm" data-copy>${icon('link')}Salin Tautan</button><button class="btn btn-sky btn-sm" data-mobile>${icon('phone')}Pratinjau Konsumen</button></div><button class="btn btn-primary" data-print>${icon('printer')}Cetak Label Kemasan</button></div></div>
        <div class="panel panel-sky note small">${icon('info')}<span>Dokumen ini adalah <b>ringkasan catatan budidaya</b> dari aplikasi HYCANE (demo): tanggal tanam, media, catatan jurnal, dan rata-rata data sensor. Ini <b>bukan</b> sertifikasi pihak ketiga atau hasil uji laboratorium.</span></div>
        <div class="split">
          <section class="card card-flush cert">
            <div class="cert-top"><div class="row"><img class="cert-logo" src="${HC.ui.MARK}" alt="HYCANE"><div><div class="eyebrow">HYCANE Grow Record • FESTAFORA 2026</div><h2>PASPOR KETERTELUSURAN SAYUR HIDROPONIK</h2><p class="muted small">Ringkasan catatan budidaya dari kebun hidroponik rumahan</p></div></div>
              <div class="grade-badge"><span class="pill pill-solid pill-lg">${grade >= 80 ? 'GRADE A DOMINAN' : 'GRADE CAMPURAN'}</span><small>No: ${certNo}</small></div></div>
            <div class="cert-body">
              <div class="g4 cert-tiles">
                <div class="panel"><span class="label-sm">Komoditas</span><b>${esc(x.crop)}</b><small class="green"><i>${esc(x.latin)}</i></small></div>
                <div class="panel"><span class="label-sm">Tanggal panen</span><b>${fmtDate(x.date)}</b><small>${x.final ? 'tercatat' : 'perkiraan'}</small></div>
                <div class="panel"><span class="label-sm">Lokasi produksi</span><b>${esc(prof.farm)}</b><small>${esc(HC.data.user.city)}, Jawa Timur</small></div>
                <div class="panel"><span class="label-sm">Volume panen</span><b class="green">${fmt(x.kg, 2)} kg</b><small>${x.plants} tanaman · ${x.gA} Grade A</small></div>
              </div>
              <div class="ph cert-hero">${HC.ui.img('assets/images/stitch/s20-44.jpg', 'Pakcoy segar hasil panen')}<div class="cert-hero-cap"><span class="label-sm light">Kondisi pasca-panen</span><b>Dipanen pagi hari • disimpan sejuk</b></div></div>
              <div class="row-between"><h2>4 Pilar Catatan Budidaya</h2><span class="label-sm green">Data aplikasi & deklarasi petani</span></div>
              <div class="g2 pillars">
                <div class="panel pillar"><div class="row-between"><span class="row">${icon('shield')}<b>Tanpa pestisida sintetis</b></span><span class="pill pill-warn">Deklarasi petani</span></div><p>Petani menyatakan tidak memakai insektisida/fungisida sintetis selama siklus ini. Belum diverifikasi uji laboratorium.</p></div>
                <div class="panel pillar"><div class="row-between"><span class="row">${icon('recycle')}<b>Media tanam ampas tebu</b></span><span class="pill pill-ok">Tercatat</span></div><p>Bibit ditanam di plug media ampas tebu yang biodegradable dan dapat dikomposkan setelah panen.</p></div>
                <div class="panel pillar"><div class="row-between"><span class="row">${icon('wifi')}<b>Kondisi air terpantau sensor</b></span><span class="pill pill-info">IoT (demo)</span></div><p>Ringkasan pembacaan sensor yang tersimpan di aplikasi.</p><div class="g2 pv"><div><small>Median pH</small><b>${fmt(x.ph, 2)}</b></div><div><small>Rata-rata suhu air</small><b>${fmt(x.temp, 1)}°C</b></div></div></div>
                <div class="panel pillar"><div class="row-between"><span class="row">${icon('droplet')}<b>Perlakuan pra-panen</b></span><span class="pill pill-ok">SOP</span></div><p>Panen pagi hari dan pemeriksaan kualitas daun sebelum dikemas, sesuai protokol panen HYCANE.</p></div>
              </div>
              <div class="panel audit"><div class="row-between"><div><h2>Audit Kronologi Pertumbuhan</h2><p class="muted small">Dari jurnal batch di aplikasi HYCANE</p></div><span class="pill pill-outline">${tl.length + 1} titik catatan</span></div>
                <ol class="vtl cert-tl">${tl.map((j) => `<li><span class="v-dot ${j.kind === 'koreksi' ? 'crit' : ''}"></span><div class="v-head"><small class="green">${fmtDate(j.at)} • Hari ${j.day}</small></div><p><b>${esc(j.title)}</b><br>${esc(j.text)}</p></li>`).join('')}
                  <li><span class="v-dot"></span><div class="v-head"><small class="green">${fmtDate(x.date)}</small></div><p><b>${x.final ? 'Panen tercatat' : 'Rencana panen'}</b><br>${fmt(x.kg, 2)} kg dari ${x.plants} tanaman (${x.gA} Grade A, ${x.gB} Grade B).</p></li></ol></div>
              <div class="cert-sign"><div class="row"><span class="icon-box">${icon('award')}</span><div><span class="label-sm">Dicatat oleh</span><b>${esc(prof.name)}</b><small class="muted">${esc(prof.farm)} • petani pengguna HYCANE</small></div></div>
                <div class="hashbox"><span class="label-sm">Sidik jari data (SHA-256)</span><code data-hash>menghitung…</code><small class="green">Berubah jika isi catatan diubah</small></div></div>
            </div>
          </section>
          <aside class="stack">
            <section class="card card-sm"><div class="row-between"><h2 class="row">${icon('flag')}Stiker Label Kemasan</h2><span class="pill pill-muted">7 × 5 cm</span></div><p class="small muted">Pratinjau label untuk kemasan sayur.</p>
              <div class="label-sticker" id="print-label"><div class="row-between"><b class="row green"><img class="ls-logo" src="${HC.ui.MARK}" alt="">HYCANE FRESH</b><span class="pill pill-solid">${grade >= 80 ? 'GRADE A' : 'CAMPURAN'}</span></div>
                <div class="row ls-body">${HC.ui.qrArt(certNo, 86)}<div><b>${esc(x.crop)}</b><small class="green">Media ampas tebu</small><small>Panen: ${fmtDate(x.date)}</small><small class="mono">${certNo}</small></div></div>
                <small class="green ls-foot">${icon('qr')}Ilustrasi QR (demo) · tautan riwayat batch</small></div></section>
            <section class="card card-sm" id="consumer"><div class="row-between"><h2 class="row">${icon('phone')}Simulasi Layar Konsumen</h2><span class="pill pill-ok">Pratinjau</span></div><p class="small muted">Tampilan yang dilihat pembeli saat membuka tautan sertifikat.</p>
              <div class="phone"><div class="phone-top"><img class="ls-logo" src="${HC.ui.MARK_WHITE}" alt="">HYCANE PASPOR</div>
                <div class="phone-body"><div class="row phone-hero"><div class="thumb">${HC.ui.img(x.image, x.crop)}</div><div><small class="green">CATATAN BUDIDAYA</small><b>${esc(x.crop)}</b><small>Panen ${fmtDate(x.date)}</small></div></div>
                  <div class="phone-row">${icon('shield')}<span><b>Tanpa pestisida sintetis</b><small>Deklarasi petani</small></span></div>
                  <div class="phone-row">${icon('recycle')}<span><b>Media ampas tebu</b><small>Biodegradable, bisa dikomposkan</small></span></div>
                  <div class="phone-row">${icon('wifi')}<span><b>pH rata-rata ${fmt(x.ph, 1)}</b><small>Kondisi air terpantau sensor</small></span></div>
                  <div class="phone-farm"><b>Ditanam oleh ${esc(prof.name.split(' ')[0])}</b><small>${esc(prof.farm)}, ${esc(HC.data.user.city)}</small></div></div></div></section>
            <section class="card card-sm"><h2>Metadata Catatan</h2><ul class="kv zebra small"><li><span>No. catatan</span><b class="mono">${certNo}</b></li><li><span>Perangkat</span><b class="mono">${HC.data.systems[x.system].device}</b></li><li><span>Penyimpanan</span><b>Lokal (demo)</b></li><li><span>Dibuat</span><b>${fmtDate(Date.now())} ${fmtTime(Date.now())}</b></li></ul></section>
          </aside>
        </div>
      </div>`;
    },
    mount(root, { id }) {
      const x = certData(id);
      if (!x) return null;
      fingerprint({ id: x.id, crop: x.crop, date: x.date, kg: x.kg, plants: x.plants, ph: +Number(x.ph).toFixed(2), journal: x.journal.map((j) => [j.at, j.title]) }).then((h) => { const el = root.querySelector('[data-hash]'); if (el) el.textContent = h.slice(0, 20) + '…' + h.slice(-8); });
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-print]')) window.print();
        if (e.target.closest('[data-mobile]')) document.getElementById('consumer').scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (e.target.closest('[data-copy]')) {
          const url = location.href;
          (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => HC.ui.toast('Tautan sertifikat disalin', { sev: 'ok', icon: 'link' }), () => HC.ui.toast('Tautan: ' + url, { icon: 'link' }));
        }
      });
    },
  };
})();
