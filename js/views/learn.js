/* 16 Education Home (Stitch 16), 17 Module + Quiz (Stitch 17), 18 Quiz route, 19 Problem Diagnosis. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt } = HC.util;
  const icon = HC.icon;
  const L = () => HC.data.lessons;
  const pad2 = (n) => String(n).padStart(2, '0');
  const edu = () => HC.store.get('edu');
  const catOf = (id) => HC.data.eduCats.find((c) => c.id === id);
  const pillarNo = (id) => HC.data.eduCats.findIndex((c) => c.id === id) + 1;

  function pillarPct(cat) {
    const ls = L().filter((l) => l.cat === cat);
    return Math.round((ls.filter((l) => edu().done[l.slug]).length / ls.length) * 100);
  }

  function lessonCard(l, current) {
    const done = edu().done[l.slug], score = edu().quiz[l.slug];
    const st = done ? ['pill-ok', 'checkCircle', 'Selesai Dipelajari'] : current ? ['pill-solid', 'refresh', 'Lanjutkan'] : ['pill-muted', 'lock', 'Belum Dimulai'];
    return `<a class="card lcard ${current ? 'cur' : ''}" href="#/learn/${l.slug}">
      <div class="row-between"><span class="pill ${st[0]}">${icon(st[1])}${st[2]}</span><span class="tiny muted row">${icon('clock')}${l.mins} Menit</span></div>
      <span class="label-sm">Modul #${pad2(l.no)}${current ? ' • Target aktif' : ''}</span>
      <h3>${esc(l.title)}</h3><p class="muted small">${esc(l.summary)}</p>
      <div class="row-between lcard-f"><span class="small ${score != null ? 'green' : 'muted'} row">${score != null ? icon('award') + `Skor kuis: ${score}/100` : icon('book') + l.level}</span><span class="btn btn-soft btn-xs">${done ? 'Buka Ringkasan' : current ? 'Lanjutkan Baca' : 'Mulai Modul'}${icon(done ? 'eye' : 'play')}</span></div></a>`;
  }

  HC.views.learn = {
    render() {
      const p = HC.model.eduProgress();
      const next = HC.model.nextLesson();
      const cat = HC.util.query().get('cat') || 'all';
      return `<div class="page">
        <div class="row-between"><nav class="crumbs upper green">${icon('graduation')}Akademi Tani HYCANE / <span class="muted">Modul Pemula</span></nav><span class="pill pill-muted"><span class="dot"></span>FESTAFORA 2026 Interactive Learning</span></div>
        <div class="page-head"><div><h1>Pusat Edukasi Hidroponik Ramah Pemula</h1><p>Belajar hidroponik dari nol. Pahami apa yang terjadi pada air, nutrisi, dan tanamanmu tanpa rumus biologi rumit atau istilah lab yang membingungkan.</p></div>
          <div class="card card-sm target"><span class="icon-box sm">${icon('checkCircle')}</span><div><span class="label-sm">Target capaian</span><b>Panen Mandiri 30 Hari</b></div></div></div>
        <section class="card journey">
          <div class="stack">
            <div class="row"><span class="pill pill-mintbright">${icon('award')}Level: Petani Pemula (Siap Panen Pertama)</span><span class="pill pill-muted">${icon('award')}Lencana Mandiri FESTAFORA 2026</span></div>
            <div class="row-between"><h2>Perjalanan Belajarmu</h2><b class="green">${p.done} dari ${p.total} Modul Selesai (${p.pct}%)</b></div>
            <div class="bar thick"><span style="width:${p.pct}%"></span></div>
            <div class="row-between tiny muted">${HC.data.eduCats.map((c) => `<span>${esc(c.label)} (${pillarPct(c.id)}%)</span>`).join('')}</div>
            <div class="panel cont"><span class="icon-box solid">${icon('book')}</span><div><span class="label-sm">Lanjutkan modul</span><b>${esc(next.title)} (Modul #${pad2(next.no)})</b><small class="muted block">${esc(next.summary)}</small></div><a class="btn btn-primary" href="#/learn/${next.slug}">Lanjut Belajar (${next.mins} Menit)${icon('arrowRight')}</a></div>
          </div>
          <div class="panel tipcard"><div class="ph tip-img">${HC.ui.img('assets/images/stitch/s16-35.jpg', 'Selada hidroponik di media ampas tebu')}<span class="ph-cap"><span class="cap">${icon('leaf')} Media ampas tebu HYCANE</span></span></div>
            <span class="label-sm green">Tips hari ini</span><p class="small"><i>“Akar putih segar adalah tanda tanaman menyerap dengan baik. Jika air tandon terasa hangat di siang hari, segera pindahkan ke tempat teduh.”</i></p></div>
        </section>
        <section class="stack">
          <div class="sec-title"><div><div class="label-sm red">Pertolongan pertama tanaman</div><h2 class="h-xl">Tanamanmu Bermasalah? Diagnosis Cepat</h2><p class="small">Pemula sering panik saat daun berubah warna. Pilih gejala untuk melihat kemungkinan penyebabnya.</p></div><span class="tiny muted">*Panduan pengecekan, bukan diagnosis pasti</span></div>
          <div class="g4">${HC.data.symptoms.slice(0, 4).map((s) => `<a class="card card-sm sym-card" href="#/diagnosis?s=${s.id}"><div class="row-between"><span class="pill pill-${s.tagSev}">${icon(s.tagSev === 'crit' ? 'octagon' : s.tagSev === 'warn' ? 'alert' : 'info')}${esc(s.tag)}</span>${icon(s.icon)}</div><h3>${esc(s.label)}</h3><p class="small muted">${esc(s.desc)}</p><div class="panel small"><span class="label-sm">Kemungkinan penyebab:</span><p>${esc(s.likely)}</p></div><span class="btn btn-soft btn-sm btn-block">Cek Solusi${icon('arrowRight')}</span></a>`).join('')}</div>
        </section>
        <section class="stack">
          <div class="sec-title"><div><div class="label-sm green">Silabus berjenjang</div><h2 class="h-xl">${HC.data.eduCats.length} Pilar Kurikulum Terstruktur</h2><p class="small">Disusun bertahap dari pemahaman dasar, kimia air, media ramah lingkungan, hingga teknologi IoT.</p></div>
            <div class="panel pill-filter"><div class="chips">${[['all', `Semua (${L().length} Modul)`]].concat(HC.data.eduCats.map((c, i) => [c.id, `${i + 1}. ${c.label}`])).map(([k, l]) => `<button class="chip ${cat === k ? 'active' : ''}" data-cat="${k}">${l}</button>`).join('')}</div></div></div>
          <div class="search edu-q">${icon('search')}<label for="edu-q" class="sr-only">Cari materi</label><input id="edu-q" type="search" placeholder="Cari materi: pH, akar busuk, NFT, ampas tebu…"></div>
          <div data-lessons class="stack"></div>
        </section>
        <section class="card cta-band edu-cta"><div><div class="label-sm green row"><span class="dot"></span>Tanya mentor & komunitas urban</div><h2>Masih ada pertanyaan yang belum terjawab di materi modul?</h2><p class="muted">Kamu tidak berkebun sendirian. Bergabunglah dengan diskusi sesama pemula atau gunakan Diagnosis untuk gejala tanaman.</p></div>
          <div class="row"><a class="btn btn-ghost" href="#/community">${icon('message')}Masuk Komunitas</a><a class="btn btn-primary" href="#/diagnosis">${icon('stethoscope')}Diagnosis Tanaman</a></div></section>
      </div>`;
    },
    mount(root) {
      const { $, $$ } = HC.util;
      let cat = HC.util.query().get('cat') || 'all';
      const next = HC.model.nextLesson();
      const paint = () => {
        const q = $('#edu-q', root).value.trim().toLowerCase();
        const list = L().filter((l) => (cat === 'all' || l.cat === cat) && (!q || (l.title + ' ' + l.summary + ' ' + l.what).toLowerCase().includes(q)));
        if (!list.length) { $('[data-lessons]', root).innerHTML = HC.ui.emptyState({ icon: 'book', title: 'Materi tidak ditemukan', body: 'Coba kata kunci lain, misalnya “pH”, “nutrisi”, atau “akar”.' }); return; }
        $('[data-lessons]', root).innerHTML = HC.data.eduCats.filter((c) => list.some((l) => l.cat === c.id)).map((c) => `<div class="pillar-sec"><div class="row pillar-h"><span class="bnum dark">${pillarNo(c.id)}</span><div><h2>${esc(c.long)}</h2><p class="small muted">${esc(c.blurb)}</p></div></div>
          <div class="lgrid">${list.filter((l) => l.cat === c.id).map((l) => lessonCard(l, l === next)).join('')}</div></div>`).join('');
      };
      $('#edu-q', root).addEventListener('input', paint);
      root.addEventListener('click', (e) => {
        const c = e.target.closest('[data-cat]');
        if (!c) return;
        cat = c.dataset.cat;
        $$('[data-cat]', root).forEach((x) => x.classList.toggle('active', x === c));
        paint();
      });
      paint();
    },
  };

  /* ---------------- Diagrams for parameter lessons ---------------- */
  const DIAGRAM = {
    ph: { title: 'Skala Spektrum pH Hidroponik Sayur Daun', zones: [['Asam (< 5,8)', 'lo', 35], ['Zona Aman (5,8–6,8)', 'ok', 30], ['Basa (> 6,8)', 'hi', 35]], ticks: ['0 (asam)', '5,8', '6,2 (target)', '6,8', '14 (basa)'],
      boxes: [['alert', '< 5,8: Terlalu asam', 'Sebagian nutrisi sulit diserap dan akar bisa stres.'], ['checkCircle', '5,8–6,8: Rentang acuan', 'Sebagian besar unsur hara untuk sayur daun tersedia dengan baik.'], ['lock', '> 6,8: Terlalu basa', 'Unsur seperti zat besi lebih sulit diserap; daun muda bisa menguning.']], metric: 'ph' },
    tds: { title: 'Rentang Kepekatan Nutrisi (TDS) Sayur Daun', zones: [['Encer (< 650 ppm)', 'lo', 30], ['Zona Aman (650–1.100)', 'ok', 40], ['Pekat (> 1.100)', 'hi', 30]], ticks: ['0', '650', '880 (contoh)', '1.100', '1.600+'],
      boxes: [['alert', 'Terlalu encer', 'Tanaman kekurangan makanan, tumbuh lambat dan pucat.'], ['checkCircle', 'Rentang acuan', 'Kepekatan cukup untuk sayur daun di sistem rumahan.'], ['alert', 'Terlalu pekat', 'Akar stres dan ujung daun bisa tampak terbakar.']], metric: 'tds' },
    ec: { title: 'Hubungan TDS dan EC', zones: [['Rendah (< 0,9)', 'lo', 30], ['Acuan (0,9–1,6 mS/cm)', 'ok', 40], ['Tinggi (> 1,6)', 'hi', 30]], ticks: ['0', '0,9', '1,25 (contoh)', '1,6', '3,0'],
      boxes: [['info', 'EC diukur alat', 'Banyak alat mengukur EC lalu mengonversinya ke TDS.'], ['checkCircle', 'Bergerak bersama', 'Di HYCANE, 880 ppm setara ± 1,25 mS/cm.'], ['thermometer', 'Dipengaruhi suhu', 'Gunakan sensor suhu untuk koreksi pembacaan.']], metric: 'tds' },
    'suhu-air': { title: 'Rentang Suhu Air Tandon', zones: [['Dingin (< 20°C)', 'hi', 25], ['Nyaman (20–29,5°C)', 'ok', 45], ['Panas (> 29,5°C)', 'lo', 30]], ticks: ['15°C', '20°C', '26,4°C (contoh)', '29,5°C', '35°C'],
      boxes: [['info', 'Terlalu dingin', 'Penyerapan nutrisi bisa melambat.'], ['checkCircle', 'Rentang nyaman', 'Akar mendapat oksigen cukup dan tetap segar.'], ['alert', 'Terlalu panas', 'Oksigen terlarut berkurang, risiko akar busuk naik.']], metric: 'temperature' },
    'ketinggian-air': { title: 'Zona Ketinggian Air Tandon', zones: [['Kritis (< 25%)', 'lo', 25], ['Rendah (25–40%)', 'hi', 15], ['Aman (≥ 40%)', 'ok', 60]], ticks: ['0%', '25%', '40%', '78% (contoh)', '100%'],
      boxes: [['octagon', 'Kritis', 'Pompa bisa menyedot udara; segera isi ulang.'], ['alert', 'Mulai rendah', 'Siapkan air dan cek ulang TDS/pH setelah mengisi.'], ['checkCircle', 'Aman', 'Volume cukup untuk sirkulasi yang stabil.']], metric: 'waterLevel' },
  };

  function diagramHtml(slug) {
    const d = DIAGRAM[slug];
    if (!d) return '';
    return `<section class="card diagram"><div class="row-between"><div><span class="label-sm">Diagram sensor & biologi</span><h2>${d.title}</h2></div><span class="pill pill-ok">${icon('sliders')}Acuan demo HYCANE</span></div>
      <div class="panel"><div class="spectrum">${d.zones.map(([t, c, w]) => `<span class="sz sz-${c}" style="flex:${w}">${esc(t)}</span>`).join('')}</div>
        <div class="row-between tiny muted spec-ticks">${d.ticks.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="g3 spec-boxes">${d.boxes.map(([ic, t, x], i) => `<div class="specbox ${i === 1 ? 'mid' : ''}">${icon(ic)}<div><b>${esc(t)}</b><p>${esc(x)}</p></div></div>`).join('')}</div></div></section>`;
  }

  function quizHtml(l) {
    return `<section class="card quiz-card" id="quiz"><div class="row-between"><div class="row"><span class="icon-box sm">${icon('award')}</span><div><span class="label-sm green">Uji pemahaman kilat</span><h2>Kuis Pemula: ${l.quiz.length} pertanyaan</h2></div></div><span class="pill pill-mintbright">${icon('sparkles')}Lulus ≥ 50%</span></div>
      ${l.quiz.map((q, qi) => `<div class="qblock" data-q="${qi}"><div class="panel qq"><b>${qi + 1}. “${esc(q.q)}”</b></div>
        <div class="qopts">${q.o.map((o, oi) => `<button class="qopt" data-qi="${qi}" data-oi="${oi}"><span class="qletter">${String.fromCharCode(65 + oi)}</span><span>${esc(o)}</span></button>`).join('')}</div><p class="qfb" hidden></p></div>`).join('')}
      <div data-qresult></div></section>`;
  }

  HC.views.lesson = {
    render({ slug }) {
      const l = HC.data.lessonBySlug[slug];
      if (!l) return HC.ui.emptyState({ icon: 'book', title: 'Materi tidak ditemukan', body: 'Materi ini belum tersedia.', actions: '<a class="btn btn-primary" href="#/learn">Kembali ke Edukasi</a>' });
      const cat = catOf(l.cat);
      const inCat = L().filter((x) => x.cat === l.cat);
      const pos = inCat.indexOf(l) + 1;
      const done = edu().done[slug];
      const products = (l.products || []).map((id) => HC.data.productById[id]).filter(Boolean);
      const i = L().indexOf(l), prev = L()[i - 1], next = L()[i + 1];
      const metric = (DIAGRAM[slug] || {}).metric || (l.cat === 'air' ? 'ph' : null);
      return `<div class="page lesson">
        <div class="lpath"><span class="row small"><span class="dot"></span>Jalur Belajar: <b class="green">${esc(cat.label)}</b> • Modul ${pos} dari ${inCat.length}</span><span class="row small"><span class="bar thin lp-bar"><span style="width:${Math.round((pos / inCat.length) * 100)}%"></span></span>${Math.round((pos / inCat.length) * 100)}%</span></div>
        <div class="page-head"><div><nav class="crumbs upper"><a href="#/learn">Edukasi</a>${icon('chevronRight')}${esc(cat.label)}${icon('chevronRight')}<span class="here">Modul #${pad2(l.no)}</span></nav>
          <h1 class="lesson-h1">Modul ${pad2(l.no)}: ${esc(l.title)}</h1>
          <div class="row"><span class="pill pill-muted">${icon('clock')}${l.mins} Menit Membaca</span><span class="pill pill-muted">${icon('user')}Tingkat: ${esc(l.level)}</span><span class="pill pill-info">${icon(cat.icon)}${esc(cat.label)}</span>${done ? `<span class="pill pill-ok">${icon('checkCircle')}Sudah dipelajari</span>` : ''}</div></div>
          <div class="row"><a class="btn btn-soft" href="#/learn">${icon('arrowLeft')}Katalog Edukasi</a><button class="btn btn-primary" data-mark ${done ? 'disabled' : ''}>${icon('checkCircle')}${done ? 'Modul Selesai' : 'Tandai Modul Selesai'}</button></div></div>
        <div class="split">
          <article class="stack lesson-main">
            ${l.image ? `<figure class="ph lesson-fig">${HC.ui.img(l.image, l.title)}</figure>` : ''}
            ${diagramHtml(slug)}
            <section class="card lsec"><h2><span class="lnum">1</span>PENGERTIAN SEDERHANA (APA ITU?)</h2><p>${esc(l.what)}</p>
              ${l.analogy ? `<div class="panel analogy">${'<span class="icon-box sm">' + icon('lightbulb') + '</span>'}<div><b>Analogi sederhana</b><p>${esc(l.analogy)}</p></div></div>` : ''}</section>
            <section class="card lsec"><h2><span class="lnum">2</span>KENAPA PENTING? (EFEK TERHADAP TANAMAN)</h2><p>${esc(l.why)}</p>
              ${slug === 'ph' ? `<div class="g2 compare"><div class="panel"><div class="row-between"><span class="pill pill-ok">Kondisi ideal</span><b class="green">pH 5,8–6,8</b></div><div class="ph cmp-img">${HC.ui.img('assets/images/stitch/s17-36.jpg', 'Selada sehat')}</div><p class="small muted">Nutrisi lebih mudah diserap; daun hijau segar.</p></div><div class="panel"><div class="row-between"><span class="pill pill-crit">Di luar rentang</span><b class="red">pH &lt; 5,5 / &gt; 7,2</b></div><div class="ph cmp-img">${HC.ui.img('assets/images/stitch/s17-37.jpg', 'Daun menguning')}</div><p class="small muted">Daun bisa menguning dan pertumbuhan melambat walau nutrisi cukup.</p></div></div>` : ''}</section>
            <section class="card lsec"><h2><span class="lnum">3</span>CONTOH SEDERHANA</h2><div class="panel panel-mint note">${icon('leaf')}<p>${esc(l.example)}</p></div></section>
            <section class="card lsec"><h2><span class="lnum">4</span>APA YANG HARUS DILAKUKAN?</h2><div class="stack-sm">${l.todo.map((t, k) => `<div class="panel todo"><span class="tnum">${k + 1}</span><p>${esc(t)}</p></div>`).join('')}</div></section>
            <section class="card lsec"><h2 class="red">${icon('alert')}KESALAHAN UMUM PEMULA (HINDARI INI!)</h2><div class="g3 mistakes">${l.mistakes.map((t) => `<div class="mist">${icon('x')}<p>${esc(t)}</p></div>`).join('')}</div>
              ${l.note ? `<div class="panel panel-warn note small">${icon('info')}<span>${esc(l.note)}</span></div>` : ''}
              <p class="tiny muted">${icon('info')} Rentang dan takaran dapat berbeda menurut jenis tanaman, varietas, dan fase pertumbuhan.</p></section>
            ${quizHtml(l)}
            <nav class="lesson-nav">${prev ? `<a class="btn btn-ghost" href="#/learn/${prev.slug}">${icon('arrowLeft')}Modul ${pad2(prev.no)}: ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn btn-ghost" href="#/learn/${next.slug}">Modul ${pad2(next.no)}: ${esc(next.title)}${icon('arrowRight')}</a>` : ''}</nav>
          </article>
          <aside class="stack">
            ${metric ? `<section class="card card-sm kitlive"><div class="row-between"><span class="label-sm">Kit hardware terhubung</span><span class="dot"></span></div><div class="row kl-dev"><span class="icon-box sm sky">${icon('wifi')}</span><div><b>${HC.data.systems.A.device}</b><small class="muted block">${esc(HC.data.systems.A.name)}</small></div></div>
              <div class="panel" data-kl>${klHtml(metric)}</div><a class="btn btn-sky btn-sm btn-block" href="#/monitoring?m=${metric}">Buka Panel Live Monitoring</a></section>` : ''}
            ${products.length ? `<section class="card card-sm"><div class="row-between"><div><span class="label-sm">Katalog pendukung</span><h2>${esc(l.productsTitle || 'Produk Terkait Modul Ini')}</h2></div>${icon('store')}</div><div class="mini-list">${products.map(HC.ui.miniProduct).join('')}</div></section>` : ''}
            <section class="card card-sm"><div class="row-between"><h2>Daftar Modul Silabus</h2><span class="tiny muted">${esc(cat.label)}</span></div>
              <ul class="syllabus">${inCat.map((x) => `<li><a class="${x === l ? 'cur' : ''}" href="#/learn/${x.slug}"><span class="sy-ic ${edu().done[x.slug] ? 'done' : ''}">${x === l ? pad2(x.no) : edu().done[x.slug] ? icon('check') : icon('lock')}</span><span><b>Modul ${pad2(x.no)}: ${esc(x.title)}</b><small>${edu().done[x.slug] ? `Tuntas${edu().quiz[x.slug] != null ? ' • Skor ' + edu().quiz[x.slug] : ''}` : x === l ? 'Sedang dipelajari' : 'Belum dimulai'}</small></span></a></li>`).join('')}</ul></section>
            <section class="card card-sm tips"><h3 class="row green">${icon('lightbulb')}Tip lapangan</h3><p><i>“Ukur pada jam yang sama setiap hari dan catat hasilnya. Tren beberapa hari lebih bermakna daripada satu angka.”</i></p><small class="muted">— Tim Edukasi HYCANE</small></section>
          </aside>
        </div>
      </div>`;
    },
    mount(root, { slug }) {
      const l = HC.data.lessonBySlug[slug];
      if (!l) return null;
      const answers = {};
      const finish = () => {
        const correct = l.quiz.filter((q, i) => answers[i] === q.a).length;
        const pct = Math.round((correct / l.quiz.length) * 100);
        const passed = pct >= 50;
        HC.store.update('edu', (ed) => { ed.quiz[slug] = Math.max(pct, ed.quiz[slug] || 0); if (passed) ed.done[slug] = Date.now(); return ed; });
        const next = L()[L().indexOf(l) + 1];
        root.querySelector('[data-qresult]').innerHTML = `<div class="qres ${passed ? 'pass' : 'fail'}"><span class="icon-box ${passed ? 'solid' : 'warn'}">${icon(passed ? 'award' : 'refresh')}</span><div><b>Skor Modul: ${correct}/${l.quiz.length} (${pct}%)</b><small class="block">${passed ? 'Modul ditandai selesai. Kerja bagus!' : 'Belum lulus. Baca lagi bagian yang kurang tepat lalu coba lagi.'}</small></div>
          ${passed ? (next ? `<a class="btn btn-primary" href="#/learn/${next.slug}">Lanjut ke Modul ${pad2(next.no)}${icon('arrowRight')}</a>` : '<a class="btn btn-primary" href="#/learn">Kembali ke Edukasi</a>') : '<button class="btn btn-soft" data-retry>Coba lagi</button>'}</div>`;
        if (passed) HC.ui.toast(`Modul “${l.title}” selesai`, { sev: 'ok', icon: 'award' });
      };
      root.addEventListener('click', (e) => {
        const o = e.target.closest('[data-oi]');
        if (o) {
          const qi = Number(o.dataset.qi), oi = Number(o.dataset.oi);
          if (answers[qi] !== undefined) return;
          answers[qi] = oi;
          const q = l.quiz[qi], blk = root.querySelector(`[data-q="${qi}"]`);
          blk.querySelectorAll('.qopt').forEach((b) => { const k = Number(b.dataset.oi); b.classList.toggle('right', k === q.a); b.classList.toggle('wrong', k === oi && oi !== q.a); b.disabled = true; });
          const fb = blk.querySelector('.qfb'); fb.hidden = false;
          fb.className = 'qfb ' + (oi === q.a ? 'ok' : 'no');
          fb.innerHTML = `${icon(oi === q.a ? 'checkCircle' : 'x')}<span><b>${oi === q.a ? 'Jawaban benar!' : `Kurang tepat. Jawaban: ${String.fromCharCode(65 + q.a)}.`}</b> ${esc(q.x)}</span>`;
          if (Object.keys(answers).length === l.quiz.length) finish();
        }
        if (e.target.closest('[data-retry]')) HC.router.resolve();
        if (e.target.closest('[data-mark]')) {
          HC.store.update('edu', (ed) => { ed.done[slug] = Date.now(); return ed; });
          const b = e.target.closest('[data-mark]'); b.disabled = true; b.innerHTML = `${icon('checkCircle')}Modul Selesai`;
          HC.ui.toast('Modul ditandai selesai', { sev: 'ok', icon: 'award' });
        }
      });
      const metric = (DIAGRAM[slug] || {}).metric || (l.cat === 'air' ? 'ph' : null);
      if (HC.router.current().path.endsWith('/quiz')) setTimeout(() => { const q = root.querySelector('#quiz'); if (q) q.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
      if (!metric) return null;
      return HC.bus.on('sim:tick', () => { const el = root.querySelector('[data-kl]'); if (el) el.innerHTML = klHtml(metric); });
    },
  };

  function klHtml(metric) {
    const s = HC.sim.snapshot('A'), m = HC.ui.METRICS[metric];
    const lvl = s.levels[metric];
    return `<div class="row-between"><small class="muted">Sensor ${esc(m.label)} terkini</small>${HC.ui.pill(lvl, lvl === 'ok' ? 'Optimal' : null)}</div><b class="kl-v">${fmt(s[metric], metric === 'ph' ? 1 : m.digits)}<small>${m.unit}</small></b><p class="small muted">${lvl === 'ok' ? `HYCANE mendeteksi ${m.label.toLowerCase()} tandonmu dalam kondisi aman. Tidak perlu tindakan koreksi saat ini.` : `${HC.ui.describe(metric, s[metric], lvl)}. Lihat Rekomendasi untuk langkahnya.`}</p>`;
  }

  /* Quiz route renders the module and jumps to the inline quiz. */
  HC.views.quiz = { render: (p) => HC.views.lesson.render(p), mount: (root, p) => HC.views.lesson.mount(root, p) };

  /* ---------------- 19 Problem Diagnosis ---------------- */
  function signals() {
    const out = {};
    ['A', 'B'].forEach((s) => {
      const sn = HC.sim.snapshot(s), th = HC.sim.THRESH[s];
      if (sn.levels.ph !== 'ok') out.phOut = s;
      if (sn.tds < th.tds.warn[0]) out.tdsLow = s;
      if (sn.tds > th.tds.warn[1]) out.tdsHigh = s;
      if (sn.temperature > th.temperature.warn[1]) out.tempHigh = s;
      if (!sn.pumpOn) out.pumpOff = s;
      if (sn.levels.waterLevel !== 'ok') out.waterLow = s;
    });
    return out;
  }

  HC.views.diagnosis = {
    render() {
      const sel = HC.util.query().get('s');
      return `<div class="page">
        <div class="page-head"><div><div class="label-sm red">Pertolongan pertama tanaman</div><h1>Diagnosis Masalah Tanaman</h1><p>Pilih gejala yang kamu lihat. HYCANE menggabungkan gejala dengan data sensor terbaru untuk menyarankan apa yang dicek lebih dulu.</p></div><span class="pill pill-warn pill-lg">${icon('info')}Panduan pengecekan, bukan diagnosis pasti</span></div>
        <div class="g3 dx-sym" role="radiogroup" aria-label="Gejala">${HC.data.symptoms.map((s) => `<button class="card card-sm sym-btn ${sel === s.id ? 'on' : ''}" role="radio" aria-checked="${sel === s.id}" data-sym="${s.id}"><div class="row-between"><span class="pill pill-${s.tagSev}">${esc(s.tag)}</span>${icon(s.icon)}</div><b>${esc(s.label)}</b><small class="muted">${esc(s.desc)}</small></button>`).join('')}</div>
        <div data-dx>${sel ? resultHtml(sel) : `<div class="card dx-hint"><span class="icon-box">${icon('stethoscope')}</span><p>Mulai dengan memilih satu gejala di atas. Contoh: <b>Daun menguning</b>.</p></div>`}</div>
      </div>`;
    },
    mount(root) {
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-sym]');
        if (!b) return;
        root.querySelectorAll('[data-sym]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
        root.querySelector('[data-dx]').innerHTML = resultHtml(b.dataset.sym);
        history.replaceState(null, '', '#/diagnosis?s=' + b.dataset.sym);
        root.querySelector('[data-dx]').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
  };

  function resultHtml(id) {
    const s = HC.data.symptoms.find((x) => x.id === id);
    if (!s) return '';
    const sig = signals();
    const ranked = s.causes.map((c, i) => ({ c, live: c.signal && sig[c.signal], i })).sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0) || a.i - b.i);
    const prods = [...new Set(ranked.flatMap((r) => r.c.products))].slice(0, 4).map((x) => HC.data.productById[x]).filter(Boolean);
    const lesson = HC.data.lessonBySlug[s.lesson];
    return `<section class="split dx">
      <div class="stack"><div class="card"><div class="row"><span class="icon-box">${icon(s.icon)}</span><div><h2>${esc(s.label)}: kemungkinan penyebab</h2><p class="small muted">Periksa satu per satu dan ubah satu hal dalam satu waktu. Penyebab yang terdeteksi sensor ditaruh paling atas.</p></div></div></div>
        <ol class="dx-list">${ranked.map((r, n) => `<li class="card dx-item ${r.live ? 'live' : ''}"><div class="row-between"><div class="row"><span class="bnum ${r.live ? 'dark' : ''}">${n + 1}</span><h3>${esc(r.c.title)}</h3></div>${r.live ? `<span class="pill pill-warn">${icon('activity')}Terdeteksi sensor · ${esc(HC.data.systems[r.live].name)}</span>` : ''}</div>
          <div class="g2 dx-body"><div class="panel"><span class="label-sm">Cek</span><p>${esc(r.c.check)}</p></div><div class="panel panel-mint"><span class="label-sm green">Tindakan yang disarankan</span><p>${esc(r.c.action)}</p></div></div></li>`).join('')}</ol></div>
      <aside class="stack">${prods.length ? `<section class="card card-sm"><h2 class="row">${icon('store')}Produk yang membantu</h2><div class="mini-list">${prods.map(HC.ui.miniProduct).join('')}</div></section>` : ''}
        <section class="card card-sm"><h2 class="row">${icon('book')}Pelajari penyebabnya</h2><ul class="lesson-links"><li><a href="#/learn/${lesson.slug}"><span class="icon-box sm">${icon('graduation')}</span><span>${esc(lesson.title)}<small>Modul #${pad2(lesson.no)} · ${lesson.mins} menit</small></span>${icon('chevronRight')}</a></li>
          <li><a href="#/community"><span class="icon-box sm sky">${icon('users')}</span><span>Tanya komunitas<small>Lihat pengalaman pengguna lain</small></span>${icon('chevronRight')}</a></li><li><a href="#/ai"><span class="icon-box sm">${icon('sparkles')}</span><span>Rekomendasi HYCANE<small>Status kondisi air saat ini</small></span>${icon('chevronRight')}</a></li></ul></section></aside>
    </section>`;
  }
})();
