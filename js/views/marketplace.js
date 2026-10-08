/* 08 Marketplace (Stitch 08_marketplace), 09 Category Listing, 10 Product Detail. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt, rupiah } = HC.util;
  const icon = HC.icon;
  const P = (id) => HC.data.productById[id];

  /* English/Indonesian synonyms so "pump", "seed", "pipe" etc. find the Indonesian names. */
  const SYN = { pump: 'pompa', seed: 'benih', seeds: 'benih', pipe: 'pipa', nutrient: 'nutrisi', nutrients: 'nutrisi', water: 'air', tool: 'alat', tools: 'alat',
    bagasse: 'ampas', lettuce: 'selada', spinach: 'bayam', tomato: 'tomat', chili: 'cabai', cucumber: 'mentimun', strawberry: 'stroberi',
    hose: 'selang', tubing: 'selang', scale: 'timbangan', scissors: 'gunting', cup: 'gelas', reservoir: 'tandon', tank: 'tandon', air: 'udara' };
  const CAT_ICON = { kit: 'grid', media: 'recycle', nutrients: 'flask', seeds: 'sprout', plumbing: 'link', electronics: 'cpu', water: 'droplet', tools: 'wrench', spare: 'package' };

  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const has = (txt, t) => txt.includes(t) || (SYN[t] && txt.includes(SYN[t]));
    return HC.data.products.map((p) => {
      const cat = (HC.data.categories.find((c) => c.id === p.category) || {}).label || '';
      const name = p.name.toLowerCase();
      const hay = `${p.name} ${p.short} ${cat} ${p.what} ${p.id}`.toLowerCase();
      if (!terms.every((t) => has(hay, t))) return null;
      return { p, score: terms.filter((t) => has(name, t)).length * 10 + terms.filter((t) => has(cat.toLowerCase(), t)).length };
    }).filter(Boolean).sort((a, b) => b.score - a.score).map((x) => x.p);
  }

  function pricingInfo() {
    return HC.ui.modal(`<h2>Bagaimana harga demo dihitung?</h2>
      <p>Harga di marketplace ini adalah <b>harga retail demo</b>, bukan harga komersial final HYCANE.</p>
      <ol class="steps"><li>Biaya acuan diambil dari <b>benchmark listing marketplace</b> (Shopee) yang dicatat saat riset, bila tersedia.</li>
      <li>Produk tanpa benchmark terverifikasi ditandai <b>“Estimasi internal · perlu validasi”</b>. Tidak ada sumber yang dikarang.</li>
      <li>Harga jual = biaya ÷ 0,70 (margin kotor 30%), lalu dibulatkan ke atas ke angka retail yang mudah dibaca.</li>
      <li>Harga kit = jumlah biaya komponen + biaya perakitan/kemasan, dengan rumus yang sama.</li></ol>
      <p class="muted small">Harga marketplace dapat berubah sewaktu-waktu.</p>
      <div class="modal-actions"><button class="btn btn-primary" data-modal="ok">Mengerti</button></div>`);
  }

  function kitCard(id, badge, feats) {
    const p = P(id), q = HC.pricing.quote(p);
    return `<article class="card card-flush kit-card">
      <a class="ph kit-img" href="#/marketplace/p/${id}">${HC.ui.productImg(p)}<span class="ph-badge pill ${badge[1]}">${esc(badge[0])}</span></a>
      <div class="kit-body"><h3><a href="#/marketplace/p/${id}">${esc(p.name)}</a></h3><p class="muted small">${esc(p.short)}</p>
        <div class="kit-feats">${feats.map(([ic, t]) => `<span>${icon(ic)}${esc(t)}</span>`).join('')}</div>
        <div class="row-between kit-price"><div><small class="muted">Harga terpadu</small><div class="price big">${rupiah(q.sellingPrice)}</div></div><span class="pill ${p.stock < 10 ? 'pill-warn' : 'pill-ok'}">${p.stock < 10 ? 'Sisa ' + p.stock + ' unit' : 'Stok Ready'}</span></div>
        ${q.componentsRetail > q.sellingPrice ? `<p class="small green">Hemat ${rupiah(q.componentsRetail - q.sellingPrice)} dibanding beli komponen satuan</p>` : ''}
        <div class="g2"><a class="btn btn-soft" href="#/marketplace/p/${id}">${icon('eye')}Detail</a><button class="btn btn-primary" data-add="${id}">${icon('cart')}Beli Kit</button></div></div>
    </article>`;
  }

  function refillCard(id, badge, tail) {
    const p = P(id);
    return `<article class="card card-sm refill-card"><a class="ph refill-img" href="#/marketplace/p/${id}">${HC.ui.productImg(p)}<span class="ph-badge pill pill-mintbright">${esc(badge)}</span></a>
      <h3><a href="#/marketplace/p/${id}">${esc(p.name)}</a></h3><p class="muted small clamp2">${esc(p.short)}</p>
      <div class="row-between"><b class="price">${rupiah(HC.pricing.price(p))}</b><span class="tiny muted">${esc(tail)}</span></div>
      <button class="btn btn-soft btn-sm btn-block" data-add="${id}">${icon('plus')}Tambah</button></article>`;
  }

  function seedCard(id, ic) {
    const p = P(id);
    const lvl = { 'Sangat Mudah': 'pill-mintbright', Mudah: 'pill-ok', Menengah: 'pill-muted', Sulit: 'pill-warn' }[p.difficulty] || 'pill-muted';
    return `<article class="card card-sm seed-card"><div class="row-between"><span class="pill ${lvl}">Tingkat: ${esc(p.difficulty)}</span><span class="tiny muted row">${icon('calendar')}${esc(p.days)} hari</span></div>
      <div class="row seed-id"><span class="icon-box sm ${p.id === 'seed-tomato' ? 'crit' : ''}">${icon(ic)}</span><div><b>${esc(p.variety)}</b><small class="muted">Pack eceran</small></div></div>
      <div class="panel small">Target EC acuan: ${esc(p.ecRef)} mS/cm • ${esc(p.short)}</div>
      <div class="row-between"><b class="price price-dark">${rupiah(HC.pricing.price(p))}</b><button class="btn btn-primary btn-xs" data-add="${id}">${icon('plus')}Beli</button></div></article>`;
  }

  function cartBar() {
    const n = HC.cart.count();
    if (!n) return '';
    const t = HC.cart.totals();
    return `<div class="cart-bar"><span class="icon-box sm solid">${icon('cart')}</span><div class="cb-txt"><b>${n} item terpilih</b> <span class="green small">• ${t.shipping ? 'Ongkir ' + rupiah(t.shipping) : 'Gratis ongkir'}</span><small class="muted">Total sementara: <b class="ink">${rupiah(t.total)}</b></small></div><a class="btn btn-soft btn-sm" href="#/cart">Rincian</a><a class="btn btn-primary btn-sm" href="#/checkout">Checkout Sekarang${icon('arrowRight')}</a></div>`;
  }

  function homeHtml() {
    const r = HC.reco.mediaReminder();
    const last = HC.store.get('orders').find((o) => o.status === 'Selesai' && o.items.some((i) => P(i.id) && P(i.id).category !== 'kit'));
    const parts = ['pump-8w', 'netpot-50', 'pvc-2', 'sensor-ph', 'calib', 'meter-set', 'air-pump', 'esp32'];
    return `
      <section class="mk-hero"><div class="mk-hero-copy"><span class="pill pill-mintbright">${icon('recycle')}EKOSISTEM SIRKULAR BERBASIS AMPAS TEBU</span>
        <h1>Semua kebutuhan hidroponikmu dalam satu tempat.</h1>
        <p>Kit, refill, dan komponen yang cocok dengan platform monitoring HYCANE. Ramah pemula, harga transparan, dan terbuka untuk instalasi buatan sendiri.</p>
        <div class="row"><a class="btn btn-primary" href="#/bundle">Buka Bundle Builder${icon('arrowRight')}</a><span class="row small">${icon('checkCircle')}Komponen terbuka, bisa dipakai di instalasi DIY</span></div></div>
        <div class="mk-hero-art" aria-hidden="true"><span></span></div></section>
      <div class="chips scroll-x cat-chips"><a class="chip active" href="#/marketplace/c/all">${icon('grid')}Semua Produk</a>${HC.data.categories.map((c) => `<a class="chip" href="#/marketplace/c/${c.id}">${icon(CAT_ICON[c.id])}${esc(c.label)}</a>`).join('')}</div>
      ${r.dueSoon ? `<div class="card card-sm mk-reminder"><span class="icon-box sm warn">${icon('repeat')}</span><div><b>Waktunya isi ulang</b><p class="small muted">Bagasse Media diperkirakan perlu diganti dalam ${Math.max(0, r.daysLeft)} hari.</p></div><button class="btn btn-primary btn-sm" data-reorder-media>${icon('cart')}Beli lagi (Media + AB Mix)</button></div>` : ''}
      <section class="stack"><div class="sec-title"><div><div class="label-sm row"><span class="dot"></span>Paket siap pakai</div><h2 class="h-xl">Paket Kit Unggulan</h2></div><p class="small muted mk-note">Kit terpandu untuk panen pertama. Semua kit tetap bisa dipakai tanpa langganan.</p></div>
        <div class="g3">${kitCard('kit-18', ['Rekomendasi Pemula • Paling Lengkap', 'pill-solid'], [['bolt', 'Pompa 8 W'], ['wifi', 'Wi-Fi + layar LCD'], ['sprout', '18 lubang']])}${kitCard('kit-starter', ['Ramah Budget', 'pill-mintbright'], [['arrowRight', 'Bisa di-upgrade modul IoT kapan saja']])}${kitCard('kit-sensor', ['Upgrade Kit', 'pill-info'], [['link', 'Pasang ke instalasi yang sudah ada']])}</div></section>
      <section class="stack"><div class="sec-title"><div><div class="label-sm row"><span class="dot"></span>Sirkularitas tebu lokal</div><h2 class="h-xl">Isi Ulang Berkala & Media Tanam</h2></div>${last ? `<button class="pill pill-lg pill-ok" data-reorder-order="${last.id}">${icon('repeat')}Beli lagi pesanan #${last.id}</button>` : ''}</div>
        <div class="g4">${refillCard('media-18', '1 Siklus Panen', '18 plug')}${refillCard('media-36', '2 Siklus Hemat', '36 plug')}${refillCard('abmix-leafy', 'Sayuran Daun', 'A+B 1 L')}${refillCard('ph-pack', 'Kit Kontrol pH', 'Isi 2 botol')}</div></section>
      <section class="stack"><div class="sec-title"><div><div class="label-sm row"><span class="dot dot-blue"></span>Ramah pemula</div><h2 class="h-xl">Katalog Benih Terkurasi</h2></div><p class="small muted mk-note">Dilengkapi panduan target EC acuan & waktu panen. Rentang dapat berbeda per varietas.</p></div>
        <div class="g4">${seedCard('seed-pakcoy', 'leaf')}${seedCard('seed-lettuce', 'sprout')}${seedCard('seed-kangkung', 'leaf')}${seedCard('seed-tomato', 'sprout')}</div></section>
      <section class="stack"><div class="sec-title"><div><div class="label-sm row"><span class="dot dot-muted"></span>Komponen & suku cadang</div><h2 class="h-xl">Pipa, Elektronik, Sistem Air & Alat</h2></div><a class="btn btn-soft btn-sm" href="#/marketplace/c/all">Lihat semua ${HC.data.products.length} produk${icon('chevronRight')}</a></div>
        <div class="pgrid">${parts.map((id) => HC.ui.productCard(P(id))).join('')}</div></section>
      <section class="bundle-band"><div><span class="row green small">${icon('sliders')}<b>Kustomisasi Mandiri</b></span><h2>HYCANE Custom Bundle Builder</h2><p>Sudah punya rangka atau ingin mulai kecil? Pilih struktur, sensor, media, pompa, dan nutrisi sesuai kebutuhan lahan dan budget.</p><div class="row"><span class="pill pill-outline">Diskon bundel otomatis</span><span class="pill pill-outline">Gratis ongkir untuk bundel</span></div></div>
        <div class="row"><a class="btn btn-ghost" href="#/marketplace/c/all">Lihat Semua Produk</a><a class="btn btn-primary" href="#/bundle">Mulai Konfigurasi${icon('sliders')}</a></div></section>
      <div class="g2">
        <div class="card card-sm value-c"><span class="icon-box">${icon('shield')}</span><div><b>Harga transparan & terbuka</b><p class="small muted">Setiap produk menampilkan dasar harganya. Refill dan suku cadang tidak dikunci ke merek HYCANE.</p><button class="link-btn small" data-price-info>${icon('info')}Benchmark marketplace + HYCANE demo pricing</button></div></div>
        <div class="card card-sm value-c"><span class="icon-box sky">${icon('graduation')}</span><div><b>Bukan sekadar belanja</b><p class="small muted">Setiap produk terhubung ke materi edukasi: apa fungsinya, kenapa penting, dan cara memakainya untuk pemula.</p><a class="link small" href="#/learn">Buka Edukasi${icon('arrowRight')}</a></div></div>
      </div>`;
  }

  function resultsHtml(q) {
    const res = search(q);
    if (!res.length) return HC.ui.emptyState({ icon: 'search', title: `Tidak ada hasil untuk “${q}”`, body: 'Coba kata lain seperti “pompa”, “pH”, “benih”, atau jelajahi kategori.', actions: '<button class="btn btn-soft" data-clear-search>Hapus pencarian</button> <a class="btn btn-ghost" href="#/marketplace/c/all">Semua produk</a>' });
    return `<p class="muted">${res.length} produk untuk “${esc(q)}” <button class="link-btn" data-clear-search>Hapus</button></p><div class="pgrid">${res.map((p) => HC.ui.productCard(p)).join('')}</div>`;
  }

  HC.views.marketplace = {
    render() {
      const q = HC.util.query().get('q') || '';
      return `<div class="page mk">${q ? '<h1 class="sr-only">Hasil pencarian Marketplace</h1>' : ''}
        <div class="row-between mk-top"><nav class="crumbs">HYCANE ${icon('chevronRight')}<span class="here">Marketplace Terpadu</span><span class="pill pill-mintbright">FESTAFORA 2026</span></nav>
          <div class="row"><form class="search mk-search" role="search" data-search>${icon('search')}<label for="mk-q" class="sr-only">Cari produk</label><input id="mk-q" type="search" placeholder="Cari kebutuhan hidroponik, media tanam, nutrisi…" value="${esc(q)}" autocomplete="off"></form>
            <a class="btn btn-ghost" href="#/cart">${icon('basket')}Keranjang <span class="pill pill-solid" data-cartn>${HC.cart.count()}</span></a></div></div>
        <div class="stack mk-body" data-mk-body>${q ? resultsHtml(q) : homeHtml()}</div>
        <div data-cartbar>${cartBar()}</div>
      </div>`;
    },
    mount(root) {
      const { $ } = HC.util;
      const input = $('#mk-q', root), body = $('[data-mk-body]', root);
      let t = null;
      const run = () => {
        const q = input.value.trim();
        body.innerHTML = q ? resultsHtml(q) : homeHtml();
        history.replaceState(null, '', q ? '#/marketplace?q=' + encodeURIComponent(q) : '#/marketplace');
      };
      input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 180); });
      $('[data-search]', root).addEventListener('submit', (e) => { e.preventDefault(); run(); });
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-price-info]')) pricingInfo();
        const ro = e.target.closest('[data-reorder-order]'); if (ro) HC.cart.reorder(ro.dataset.reorderOrder);
        if (e.target.closest('[data-reorder-media]')) HC.cart.addMany(HC.data.mediaCycle.reorder, 'Bagasse Media Refill 18 + AB Mix ditambahkan ke keranjang');
        if (e.target.closest('[data-clear-search]')) { input.value = ''; run(); input.focus(); }
      });
      const off = HC.bus.on('store:cart', () => { $('[data-cartbar]', root).innerHTML = cartBar(); const n = $('[data-cartn]', root); if (n) n.textContent = HC.cart.count(); });
      return () => { clearTimeout(t); off(); };
    },
  };

  /* ---------------- 09 Category listing ---------------- */
  HC.views.category = {
    render({ cat }) {
      const c = HC.data.categories.find((x) => x.id === cat);
      const title = c ? c.label : 'Semua Produk';
      return `<div class="page">
        <div class="page-head"><div><nav class="crumbs"><a href="#/marketplace">Marketplace</a>${icon('chevronRight')}<span class="here">${esc(title)}</span></nav><h1>${esc(title)}</h1><p>${c ? esc(c.blurb) : 'Seluruh katalog demo HYCANE.'}</p></div><a class="btn btn-ghost" href="#/cart">${icon('basket')}Keranjang <span class="pill pill-solid">${HC.cart.count()}</span></a></div>
        <div class="chips scroll-x"><a class="chip ${!c ? 'active' : ''}" href="#/marketplace/c/all">${icon('grid')}Semua</a>${HC.data.categories.map((x) => `<a class="chip ${x.id === cat ? 'active' : ''}" href="#/marketplace/c/${x.id}">${icon(CAT_ICON[x.id])}${esc(x.label)}</a>`).join('')}</div>
        <div class="card card-sm filters">
          <div class="field"><label for="f-q">Cari</label><input id="f-q" type="search" placeholder="Nama produk"></div>
          <div class="field"><label for="f-sort">Urutkan</label><select id="f-sort"><option value="rec">Rekomendasi</option><option value="low">Harga terendah</option><option value="high">Harga tertinggi</option><option value="best">Terlaris</option></select></div>
          <div class="field"><label for="f-max">Harga maks.</label><select id="f-max"><option value="0">Semua harga</option><option value="50000">≤ Rp50.000</option><option value="150000">≤ Rp150.000</option><option value="500000">≤ Rp500.000</option></select></div>
          <label class="check"><input type="checkbox" id="f-beg"><span>Ramah pemula</span></label>
          <label class="check"><input type="checkbox" id="f-stock"><span>Stok ≥ 10</span></label>
        </div>
        <div data-list></div>
      </div>`;
    },
    mount(root, { cat }) {
      const { $ } = HC.util;
      const base = cat === 'all' || !HC.data.categories.find((x) => x.id === cat) ? HC.data.products : HC.data.products.filter((p) => p.category === cat);
      const paint = () => {
        const q = $('#f-q', root).value.trim().toLowerCase();
        const sort = $('#f-sort', root).value, max = Number($('#f-max', root).value);
        let list = base.filter((p) => (!q || (p.name + ' ' + p.short).toLowerCase().includes(q) || (SYN[q] && p.name.toLowerCase().includes(SYN[q]))) &&
          (!max || HC.pricing.price(p) <= max) && (!$('#f-beg', root).checked || p.beginner) && (!$('#f-stock', root).checked || p.stock >= 10));
        if (sort === 'low') list = list.slice().sort((a, b) => HC.pricing.price(a) - HC.pricing.price(b));
        if (sort === 'high') list = list.slice().sort((a, b) => HC.pricing.price(b) - HC.pricing.price(a));
        if (sort === 'best') list = list.slice().sort((a, b) => b.sold - a.sold);
        $('[data-list]', root).innerHTML = list.length ? `<p class="muted small">${list.length} produk</p><div class="pgrid">${list.map((p) => HC.ui.productCard(p)).join('')}</div>`
          : HC.ui.emptyState({ icon: 'filter', title: 'Tidak ada produk yang cocok', body: 'Coba longgarkan filter harga atau hapus kata kunci.', actions: '<button class="btn btn-soft" data-reset-filters>Reset filter</button>' });
      };
      root.addEventListener('input', paint);
      root.addEventListener('change', paint);
      root.addEventListener('click', (e) => { if (e.target.closest('[data-reset-filters]')) { $('#f-q', root).value = ''; $('#f-max', root).value = '0'; $('#f-beg', root).checked = false; $('#f-stock', root).checked = false; paint(); } });
      paint();
    },
  };

  /* ---------------- 10 Product detail ---------------- */
  function sourceBlock(p, q) {
    const presenter = HC.store.get('settings').presenter;
    const type = { 'marketplace-benchmark': 'Benchmark marketplace (Shopee)', 'internal-estimate': 'Estimasi internal · perlu validasi', 'hycane-bom': 'Estimasi BOM kit HYCANE · perlu validasi' }[p.sourceType];
    let rows = `<li><span>Dasar harga</span><b>${type}</b></li>`;
    if (p.sourceType === 'marketplace-benchmark') {
      rows += `<li><span>Harga benchmark</span><b>${rupiah(p.cost)}</b></li><li><span>Dicatat</span><b>${esc(HC.data.SOURCE_CAPTURE)}</b></li><li><span>Sumber</span><a class="link" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Lihat listing${icon('external')}</a></li>`;
      if (p.altSources) rows += p.altSources.map((s) => `<li><span>Benchmark lain</span><a class="link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${rupiah(s.cost)}${icon('external')}</a></li>`).join('');
    }
    if (p.sourceNote) rows += `<li class="full"><span class="muted small">${esc(p.sourceNote)}</span></li>`;
    if (p.components) rows += `<li><span>Total harga komponen jika dibeli satuan</span><b>${rupiah(q.componentsRetail)}</b></li>`;
    if (presenter) rows += `<li class="presenter"><span>Biaya acuan (presenter)</span><b>${rupiah(q.benchmarkCost)}</b></li><li class="presenter"><span>Rumus</span><b>${rupiah(q.benchmarkCost)} ÷ 0,70 = ${rupiah(Math.round(q.rawPrice))} → ${rupiah(q.sellingPrice)}</b></li><li class="presenter"><span>Margin kotor terealisasi</span><b>${fmt(q.grossMargin * 100, 1)}%</b></li>`;
    return `<details class="price-src"><summary>${icon('info')}Transparansi harga demo</summary><ul class="kv">${rows}</ul><p class="muted small">Harga retail demo, bukan harga komersial final HYCANE.</p></details>`;
  }

  function composition(p) {
    if (!p.components) return '';
    const rows = p.components.map(([id, q]) => { const c = P(id); return `<tr><td><a class="row comp-row" href="#/marketplace/p/${id}"><span class="thumb thumb-xs">${HC.ui.productImg(c)}</span>${esc(c.name)}</a></td><td class="num">${q}×</td><td class="muted small">${esc(c.short)}</td></tr>`; }).join('');
    const extra = ['kit-smart', 'kit-18'].includes(p.id) ? '<tr><td>Akses aplikasi HYCANE & rekomendasi</td><td class="num">✓</td><td class="muted small">Tanpa langganan wajib</td></tr>' : '';
    return `<section class="card"><div class="card-head"><h2>${icon('package')}Isi Kit</h2><span class="pill pill-muted">${p.components.length} komponen</span></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Komponen</th><th class="num">Jml</th><th>Fungsi</th></tr></thead><tbody>${rows}${extra}<tr><td>${esc(p.allowanceLabel)}</td><td class="num">✓</td><td class="muted small">Termasuk paket edukasi pemula</td></tr></tbody></table></div></section>`;
  }

  HC.views.product = {
    render({ id }) {
      const p = P(id);
      if (!p) return HC.ui.emptyState({ icon: 'search', title: 'Produk tidak ditemukan', body: 'Produk ini tidak tersedia di katalog demo.', actions: '<a class="btn btn-primary" href="#/marketplace">Kembali ke Marketplace</a>' });
      const q = HC.pricing.quote(p);
      const cat = HC.data.categories.find((c) => c.id === p.category);
      const ctx = p.category === 'media' ? 'assets/images/stitch/s14-31.jpg' : p.category === 'kit' ? 'assets/images/stitch/s03-05.jpg' : null;
      const thumbs = [p.photo ? HC.ui.img(p.photo, p.name) : HC.ui.productArt(p)].concat(p.photo ? [HC.ui.productArt(p)] : []).concat(ctx ? [HC.ui.img(ctx, 'Foto konteks')] : []);
      const lessons = (p.learn || []).map((s) => HC.data.lessonBySlug[s]).filter(Boolean);
      const compat = (p.compatible || []).map(P).filter(Boolean);
      return `<div class="page">
        <nav class="crumbs"><a href="#/marketplace">Marketplace</a>${icon('chevronRight')}<a href="#/marketplace/c/${p.category}">${esc(cat.label)}</a>${icon('chevronRight')}<span class="here">${esc(p.name)}</span></nav>
        <section class="card pd">
          <div class="pd-gallery"><div class="ph pd-main" data-main>${thumbs[0]}</div>
            ${thumbs.length > 1 ? `<div class="pd-thumbs">${thumbs.map((h, i) => `<button class="pd-thumb ${i === 0 ? 'active' : ''}" data-thumb="${i}" aria-label="Gambar ${i + 1}">${h}</button>`).join('')}</div>` : ''}</div>
          <div class="pd-info">
            <div class="row">${p.badge ? `<span class="pill pill-solid">${esc(p.badge)}</span>` : ''}<span class="pill pill-muted">${esc(cat.label)}</span>${p.beginner ? '<span class="pill pill-ok">Ramah pemula</span>' : ''}</div>
            <h1>${esc(p.name)}</h1>
            <div class="row small muted">${HC.ui.stars(p.rating)}<span>· ${fmt(p.sold)} terjual · per ${esc(p.unit)}</span></div>
            <div class="pd-price">${rupiah(q.sellingPrice)}</div>
            ${q.componentsRetail && q.componentsRetail > q.sellingPrice ? `<p class="save">Hemat ${rupiah(q.componentsRetail - q.sellingPrice)} dibanding beli komponen satuan</p>` : ''}
            <p class="stock ${p.stock < 10 ? 'low' : ''}">${icon('package')}${p.stock < 10 ? `Sisa ${p.stock} unit` : `Stok ${p.stock}`} · dikirim dari Surabaya</p>
            <p class="pd-short">${esc(p.short)}</p>
            <div class="pd-buy">${HC.ui.qtyStepper(p.id, 1, 'data-pd-qty')}<button class="btn btn-primary btn-lg" data-pd-add>${icon('cart')}Tambah ke keranjang</button><button class="btn btn-soft btn-lg" data-pd-buy>Beli sekarang</button></div>
            ${p.category === 'kit' ? `<a class="btn btn-ghost btn-block" href="#/bundle?preset=${p.id}">${icon('sliders')}Sesuaikan isi kit di Bundle Builder</a>` : ''}
            ${sourceBlock(p, q)}
          </div>
        </section>
        <div class="split">
          <div class="stack">
            <section class="card beginner"><div class="card-head"><h2>${icon('graduation')}Penjelasan untuk Pemula</h2></div>
              <div class="g2"><div class="panel"><div class="label-sm green">Apa fungsinya?</div><p>${esc(p.what)}</p></div><div class="panel"><div class="label-sm green">Kenapa penting?</div><p>${esc(p.why)}</p></div></div>
              ${p.replace ? `<div class="panel panel-sky note small replace-n">${icon('calendar')}<span><b>Kapan perlu diganti?</b> ${esc(p.replace)}</span></div>` : ''}</section>
            ${p.category === 'media' ? `<section class="card story"><div class="card-head"><h2>${icon('leaf')}Kenapa ampas tebu?</h2></div>
              <ul class="bullets"><li>Ampas tebu adalah residu agroindustri dari proses penggilingan tebu.</li><li>HYCANE mengeksplorasi pemanfaatannya sebagai material media tanam biodegradable.</li><li>Kinerjanya untuk hidroponik masih harus divalidasi melalui pengujian.</li><li>Keberlanjutan adalah nilai tambah. Yang utama tetap media yang praktis dan konsisten.</li></ul>
              <a class="link" href="#/learn/ampas-tebu">Baca selengkapnya${icon('arrowRight')}</a></section>` : ''}
            ${composition(p)}
            <section class="card"><div class="card-head"><h2>${icon('sliders')}Spesifikasi</h2></div><ul class="kv">${p.specs.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}<li><span>Kategori</span><b>${esc(cat.label)}</b></li></ul></section>
          </div>
          <aside class="stack">
            ${lessons.length ? `<section class="card card-sm"><h2 class="row">${icon('book')}Pelajari dulu</h2><ul class="lesson-links">${lessons.map((l) => `<li><a href="#/learn/${l.slug}"><span class="icon-box sm">${icon('graduation')}</span><span>${esc(l.title)}<small>Modul #${String(l.no).padStart(2, '0')} · ${l.mins} menit</small></span>${icon('chevronRight')}</a></li>`).join('')}</ul></section>` : ''}
            ${compat.length ? `<section class="card card-sm"><h2 class="row">${icon('layers')}Cocok dipakai bersama</h2><div class="mini-list">${compat.map(HC.ui.miniProduct).join('')}</div></section>` : ''}
          </aside>
        </div>
      </div>`;
    },
    mount(root, { id }) {
      const p = P(id);
      if (!p) return null;
      let qty = 1;
      root.addEventListener('click', (e) => {
        const step = e.target.closest('[data-pd-qty]');
        if (step) { qty = Math.max(1, Math.min(99, qty + Number(step.dataset.delta))); root.querySelector('.qty-val').textContent = qty; }
        if (e.target.closest('[data-pd-add]')) HC.cart.add(id, qty);
        if (e.target.closest('[data-pd-buy]')) { HC.cart.add(id, qty, { silent: true }); HC.router.go('#/cart'); }
        const th = e.target.closest('[data-thumb]');
        if (th) {
          root.querySelectorAll('[data-thumb]').forEach((x) => x.classList.toggle('active', x === th));
          root.querySelector('[data-main]').innerHTML = th.innerHTML;
        }
      });
    },
  };

  HC.views.marketplaceSearch = search;
})();
