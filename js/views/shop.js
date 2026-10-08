/* 11 Bundle Builder (Stitch 11), 12 Cart (Stitch 12), 13 Checkout (Stitch 13), 14 Orders (Stitch 14), 15 Order Detail (Stitch 15). */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt, rupiah, fmtDate, fmtShortTime } = HC.util;
  const icon = HC.icon;
  const P = (id) => HC.data.productById[id];
  const sum = (lines) => lines.reduce((s, [id, q]) => s + HC.pricing.price(id) * q, 0);

  /* ---------------- 11 Bundle Builder ---------------- */
  const STEPS = [
    { id: 'base', title: 'Pilih Struktur & Instalasi Hidroponik', sub: 'Rangka pipa PVC untuk sistem NFT dengan aliran tipis yang stabil', options: [
      { key: 'nft18', tag: 'Paling Populer', title: '18 Lubang Tanam NFT', desc: 'Instalasi NFT starter + 2 talang tambahan + netpot. Cocok untuk balkon dan teras.', foot: ['droplet', 'Kapasitas 18 slot'], lines: [['nft-starter', 1], ['pvc-2', 2], ['netpot-50', 1]] },
      { key: 'nft12', tag: 'Hemat Ruang', title: '12 Lubang NFT Starter', desc: 'Rangka + talang NFT dasar. Kapasitas bisa ditambah belakangan.', foot: ['droplet', 'Kapasitas 12 slot'], lines: [['nft-starter', 1]] },
      { key: 'own', tag: 'Bawa Rangka', title: 'Punya Rangka Sendiri', desc: 'Paket pipa & sambungan untuk menyambungkan instalasi buatan sendiri.', foot: ['wrench', 'Tanpa rangka utama'], lines: [['kit-plumbing', 1]] },
    ] },
    { id: 'iot', title: 'Pilih Modul Monitoring', sub: 'Pemantau kondisi air yang terhubung ke dashboard HYCANE', options: [
      { key: 'full', tag: 'Rekomendasi Utama', title: 'Full IoT Monitoring Kit', desc: 'ESP32 + sensor pH, TDS/EC, suhu air, level air + LCD, relay, adaptor & box tahan air.', foot: ['wifi', '4 telemetri lengkap'], lines: [['kit-sensor', 1], ['esp32', 1], ['lcd', 1], ['relay', 1], ['adapter', 1], ['enclosure', 1]] },
      { key: 'manual', tag: 'Pemantau Dasar', title: 'Alat Ukur Manual pH + TDS', desc: 'Dua meter genggam. Cek kondisi air sendiri tanpa sambungan ke aplikasi.', foot: ['flask', '2 parameter manual'], lines: [['meter-set', 1]] },
      { key: 'none', tag: 'Tanpa Modul', title: 'Belum perlu', desc: 'Mulai dulu tanpa monitoring. Sensor Pack bisa ditambah kapan saja.', foot: ['clock', 'Upgrade belakangan'], lines: [] },
    ] },
    { id: 'media', title: 'Media Tanam Biodegradable Ampas Tebu', sub: 'Plug semai dari serat ampas tebu, pengganti rockwool', why: true, options: [
      { key: 'm36', tag: '1 Siklus + Cadangan', title: 'Bagasse Plugs 36 pcs', desc: 'Cukup untuk 18 lubang ditambah cadangan satu siklus berikutnya.', foot: ['recycle', 'Bisa dikomposkan'], lines: [['media-36', 1]] },
      { key: 'm54', tag: 'Hemat 3 Siklus', title: 'Bagasse Plugs 54 pcs', desc: 'Persediaan untuk tiga kali tanam di sistem 18 lubang.', foot: ['recycle', 'Stok berkelanjutan'], lines: [['media-36', 1], ['media-18', 1]] },
    ] },
    { id: 'pump', title: 'Pompa Air & Sirkulasi', sub: 'Mengalirkan larutan nutrisi ke talang secara terus-menerus', options: [
      { key: 'dc', tag: 'Hemat & Aman', title: 'Pompa DC 12V Mini', desc: 'Tegangan rendah, lebih aman dekat air, bisa dijadwalkan lewat relay.', foot: ['bolt', '12 V DC'], lines: [['pump-dc', 1]] },
      { key: 'ac', tag: 'Debit Besar', title: 'Pompa Celup 8W 1000 L/jam', desc: 'Debit lebih besar untuk rak bertingkat atau talang panjang.', foot: ['droplet', '1000 L/jam'], lines: [['pump-8w', 1]] },
    ] },
    { id: 'nutri', title: 'Paket Nutrisi & Starter Benih', sub: 'Nutrisi AB Mix, penyeimbang pH, dan benih sayur daun', options: [
      { key: 'full', tag: 'Siap Semai Langsung', title: 'Paket Pemula Lengkap', desc: 'AB Mix 1 L, pH Balancer Pack, dan 3 benih: Pakcoy, Selada, Kangkung.', foot: ['sparkles', 'Panduan dosis di aplikasi'], lines: [['abmix-leafy', 1], ['ph-pack', 1], ['seed-pakcoy', 1], ['seed-lettuce', 1], ['seed-kangkung', 1]] },
      { key: 'ab', tag: 'Nutrisi Saja', title: 'AB Mix Sayur Daun 1 L', desc: 'Pekatan A & B untuk sayur daun.', foot: ['flask', 'Formula daun hijau'], lines: [['abmix-leafy', 1]] },
    ] },
  ];
  const DEFAULT = { base: 'nft18', iot: 'full', media: 'm36', pump: 'dc', nutri: 'full' };
  const PRESET = { 'kit-smart': { base: 'nft12', iot: 'full' }, 'kit-18': { base: 'nft18', iot: 'full' }, 'kit-starter': { base: 'nft12', iot: 'none' }, 'kit-sensor': { base: 'own', iot: 'full' }, 'kit-plumbing': { base: 'own' } };
  const optOf = (step, key) => step.options.find((o) => o.key === key);
  const selLines = (sel) => STEPS.flatMap((s) => optOf(s, sel[s.id]).lines);

  HC.views.bundle = {
    render() {
      return `<div class="page">
        <div class="page-head"><div><span class="pill pill-info"><span class="dot dot-blue"></span>MODULAR CONFIGURATOR • FESTAFORA 2026</span><h1 class="bb-h1">Rancang Kit Hidroponik Sesuai Kebutuhan & Anggaranmu</h1><p>Pilih komponen yang kamu butuhkan saja: rangka, monitoring, media ampas tebu, pompa, dan nutrisi. Bundel mendapat diskon dan gratis ongkir.</p></div>
          <div class="row bb-badges"><div class="panel row small">${icon('bolt')}<div><small class="muted">Waktu rakit</small><b class="block">± 30–60 menit</b></div></div><div class="panel row small">${icon('recycle')}<div><small class="muted">Media tanam</small><b class="block">Ampas tebu</b></div></div></div></div>
        <div class="split-wide">
          <div class="stack" data-steps></div>
          <aside class="card bb-sum sticky" data-sum aria-live="polite"></aside>
        </div>
      </div>`;
    },
    mount(root) {
      const { $ } = HC.util;
      const preset = HC.util.query().get('preset');
      let saved = null; try { saved = JSON.parse(localStorage.getItem('hycane.v2.bundleDraft') || 'null'); } catch (e) { /* storage blocked */ }
      const sel = Object.assign({}, DEFAULT, saved && !preset ? saved : {}, PRESET[preset] || {});
      const done = () => STEPS.filter((s) => sel[s.id]).length;

      const paintSteps = () => {
        $('[data-steps]', root).innerHTML = `<div class="card card-sm bb-progress"><span class="bnum big">${done()}</span><div><b>Langkah Konfigurasi</b><small class="muted block">Semua komponen saling kompatibel dengan dashboard HYCANE.</small></div><span class="pill pill-mintbright">${done() === STEPS.length ? '100% TERKONFIGURASI' : `${done()}/${STEPS.length} langkah`}</span></div>` +
          STEPS.map((s, i) => `<fieldset class="card bstep"><legend class="sr-only">${s.title}</legend>
            <div class="row-between"><div class="row bstep-h"><span class="bnum">${i + 1}</span><div><h2>${s.title}</h2><p class="muted small">${s.sub}</p></div></div><span class="label-sm">Langkah ${i + 1}/${STEPS.length}</span></div>
            ${s.why ? `<div class="panel why"><span class="icon-box sm">${icon('leaf')}</span><div><b class="green">Mengapa ampas tebu?</b><p class="small">Dibuat dari residu industri tebu lokal dan dirancang biodegradable, sehingga bisa dikomposkan setelah panen. Kinerjanya sebagai media hidroponik masih dalam tahap pengujian.</p></div><span class="pill pill-outline">Biodegradable</span></div>` : ''}
            <div class="bopts" style="--n:${s.options.length}">${s.options.map((o) => {
              const on = sel[s.id] === o.key;
              return `<label class="bopt ${on ? 'on' : ''}"><input type="radio" name="b-${s.id}" value="${o.key}" ${on ? 'checked' : ''} class="sr-only">
                <span class="row-between"><span class="pill ${on ? 'pill-solid' : 'pill-muted'}">${esc(o.tag)}</span><span class="bradio">${on ? icon('check') : ''}</span></span>
                <b class="bprice">${o.lines.length ? rupiah(sum(o.lines)) : 'Rp0'}</b><b class="btitle">${esc(o.title)}</b><span class="bdesc">${esc(o.desc)}</span>
                <span class="bfoot">${icon(o.foot[0])}${esc(o.foot[1])}</span></label>`;
            }).join('')}</div></fieldset>`).join('');
      };

      const paintSum = () => {
        const lines = selLines(sel).map(([id, qty]) => ({ id, qty }));
        const q = HC.pricing.bundleQuote(lines);
        const presenter = HC.store.get('settings').presenter;
        const hero = P(sel.iot === 'full' ? 'kit-smart' : 'kit-starter');
        $('[data-sum]', root).innerHTML = `<div class="row-between"><div><div class="eyebrow">Live Quotation</div><h2>Ringkasan Bundle HYCANE</h2></div>${icon('receipt')}</div>
          <div class="panel bb-hero"><div class="row small green">${icon('checkCircle')}<b>Komponen modular siap dirakit</b><span class="pill pill-outline">Kompatibel</span></div>
            <div class="row bb-hero-p"><div class="thumb">${HC.ui.productImg(hero)}</div><div><b>HYCANE Custom Bundle</b><small class="block muted">${sel.iot === 'full' ? 'Monitoring IoT + media ampas tebu' : 'Tanpa sensor · bisa di-upgrade'}</small></div></div></div>
          <ul class="bb-lines">${STEPS.map((s) => { const o = optOf(s, sel[s.id]); return `<li><span class="row">${icon(o.foot[0])}${esc(o.title)}</span><b>${o.lines.length ? rupiah(sum(o.lines)) : '—'}</b></li>`; }).join('')}</ul>
          <div class="sum-row"><span>Total komponen eceran</span><b>${rupiah(q.subtotal)}</b></div>
          <div class="sum-row green"><span>Diskon paket bundling</span><b>− ${rupiah(q.discount)}</b></div>
          <div class="sum-row green"><span>Ongkos kirim bundel</span><b>Gratis</b></div>
          <div class="bb-total"><div><span class="label-sm">Total harga bundle</span><b>${rupiah(q.total)}</b></div>${q.discount ? `<span class="pill pill-solid">Hemat ${rupiah(q.discount)}</span>` : ''}</div>
          ${presenter ? `<div class="panel panel-sky small row">${icon('chart')}<span><b>Presenter:</b> biaya acuan ${rupiah(q.cost)} · margin kotor ${fmt(q.margin * 100, 1)}% (diskon dibatasi agar ≥ 30%)</span></div>` : ''}
          <button class="btn btn-primary btn-block" data-bundle-checkout ${lines.length ? '' : 'disabled'}>Lanjut ke Pembayaran / Demo Checkout${icon('arrowRight')}</button>
          <button class="btn btn-soft btn-block" data-bundle-add ${lines.length ? '' : 'disabled'}>${icon('cart')}Masukkan ke Keranjang</button>
          <button class="link-btn center-btn" data-bundle-save>${icon('bookmark')}Simpan Konfigurasi Bundle</button>
          <ul class="bb-benefits"><li>${icon('graduation')}Akses gratis modul Edukasi HYCANE</li><li>${icon('users')}Dukungan Komunitas petani hidroponik</li><li>${icon('link')}Komponen terbuka, bisa dibeli ulang satuan</li></ul>`;
      };

      const addToCart = () => {
        const lines = selLines(sel);
        HC.cart.addMany(lines, 'Bundle HYCANE masuk keranjang (diskon bundel diterapkan)', { bundle: 'B' + Date.now().toString(36) });
      };
      root.addEventListener('change', (e) => {
        const inp = e.target;
        if (!inp.name || !inp.name.startsWith('b-')) return;
        sel[inp.name.slice(2)] = inp.value;
        paintSteps(); paintSum();
      });
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-bundle-add]')) { addToCart(); HC.router.go('#/cart'); }
        if (e.target.closest('[data-bundle-checkout]')) { addToCart(); HC.router.go('#/checkout'); }
        if (e.target.closest('[data-bundle-save]')) { try { localStorage.setItem('hycane.v2.bundleDraft', JSON.stringify(sel)); } catch (er) { /* ignore */ } HC.ui.toast('Konfigurasi bundle disimpan di perangkat ini', { sev: 'ok', icon: 'bookmark' }); }
      });
      paintSteps(); paintSum();
      return HC.bus.on('settings', paintSum);
    },
  };

  /* ---------------- 12 Cart ---------------- */
  function itemRow(l) {
    const p = P(l.id);
    const cat = HC.data.categories.find((c) => c.id === p.category);
    return `<li class="cart-row"><a class="thumb thumb-lg" href="#/marketplace/p/${p.id}">${HC.ui.productImg(p)}</a>
      <div class="cr-body"><div class="row-between"><div class="row"><span class="pill pill-muted">${esc(cat.label)}</span>${p.beginner ? '<span class="tiny green">Ramah pemula</span>' : ''}</div><b class="price">${rupiah(HC.pricing.price(p) * l.qty)}</b></div>
        <h3><a href="#/marketplace/p/${p.id}">${esc(p.name)}</a></h3><p class="muted small">${esc(p.short)}</p>
        <div class="cr-actions">${HC.ui.qtyStepper(l.k, l.qty)}<span class="small">Subtotal: <b>${rupiah(HC.pricing.price(p) * l.qty)}</b></span><button class="link-btn red" data-remove="${l.k}">${icon('trash')}Hapus</button></div></div></li>`;
  }
  function bundleRow(b, lines) {
    const q = HC.pricing.bundleQuote(lines);
    const hasIoT = lines.some((l) => l.id === 'kit-sensor');
    return `<li class="cart-row"><div class="thumb thumb-lg">${HC.ui.img('assets/images/stitch/s12-23.jpg', 'Bundle HYCANE')}</div>
      <div class="cr-body"><div class="row-between"><div class="row"><span class="pill pill-muted">Paket Bundling Kustom</span>${hasIoT ? `<span class="tiny green row">${icon('bolt')}IoT Connected</span>` : ''}</div><b class="price">${rupiah(q.total)}</b></div>
        <h3>HYCANE Custom Bundle (${lines.length} komponen)</h3><p class="muted small">${lines.map((l) => esc(P(l.id).name.split(' (')[0])).join(' + ')}</p>
        <div class="cr-actions"><span class="pill pill-ok">Hemat ${rupiah(q.discount)} + gratis ongkir</span><span class="small">Subtotal: <b>${rupiah(q.total)}</b></span><a class="link-btn link-blue" href="#/bundle">${icon('sliders')}Ubah Konfigurasi</a><button class="link-btn red" data-remove-bundle="${b}">${icon('trash')}Hapus</button></div></div></li>`;
  }
  function summaryCard(t, cta, extra = '') {
    const presenter = HC.store.get('settings').presenter;
    return `<aside class="stack sticky"><div class="card cart-sum"><div class="row-between"><div><h2>Ringkasan Belanja</h2><p class="muted small">${HC.cart.count()} unit</p></div>${icon('receipt')}</div>
      <div class="sum-row"><span>Total harga barang</span><b>${rupiah(t.subtotal)}</b></div>
      ${t.discount ? `<div class="sum-row green"><span>Diskon bundle</span><b>− ${rupiah(t.discount)}</b></div>` : ''}
      <div class="sum-row"><span>Ongkos kirim</span><b>${t.shipping ? rupiah(t.shipping) : `<s class="muted">${rupiah(HC.data.SHIPPING.flat)}</s> Rp0`}</b></div>
      <div class="sum-total"><div><b>Total Tagihan</b><small class="muted block">Pembayaran demo</small></div><b class="green big">${rupiah(t.total)}</b></div>
      ${presenter ? `<div class="panel panel-sky small">${icon('chart')}<b> Presenter / pitch note</b><br>Margin kotor setiap produk ≥ 30% (harga = biaya ÷ 0,70). Pembelian ulang media & nutrisi adalah sumber pendapatan berulang.</div>` : ''}
      ${cta}
      <div class="panel small center muted">${icon('shield')} Pembayaran demo aman · tanpa pemotongan saldo. Simulasi untuk presentasi FESTAFORA 2026.</div></div>${extra}</aside>`;
  }

  HC.views.cart = {
    render() {
      const lines = HC.store.get('cart');
      if (!lines.length) return `<div class="page"><nav class="crumbs">HYCANE ${icon('chevronRight')}<a href="#/marketplace">Marketplace</a>${icon('chevronRight')}<span class="here">Keranjang Belanja</span></nav><h1>Keranjang Belanja</h1>${HC.ui.emptyState({ icon: 'cart', title: 'Keranjang masih kosong', body: 'Mulai dari kit pemula, atau refill yang kamu butuhkan.', actions: '<a class="btn btn-primary" href="#/marketplace">Ke Marketplace</a> <a class="btn btn-ghost" href="#/bundle">Rakit kit</a>' })}</div>`;
      const bundles = [...new Set(lines.filter((l) => l.bundle).map((l) => l.bundle))];
      const singles = lines.filter((l) => !l.bundle);
      const t = HC.cart.totals();
      const sugg = ['seed-pakcoy', 'calib', 'tubing-12'].filter((id) => !lines.some((l) => l.id === id)).slice(0, 3);
      return `<div class="page">
        <div class="page-head"><div><nav class="crumbs">HYCANE ${icon('chevronRight')}<a href="#/marketplace">Marketplace</a>${icon('chevronRight')}<span class="here">Keranjang Belanja</span></nav><h1>Keranjang Belanja</h1><p>Periksa kit, media tanam ampas tebu, dan nutrisi sebelum melanjutkan ke pemesanan demo.</p></div><span class="pill pill-info pill-lg">Sesi demo FESTAFORA 2026</span></div>
        <div class="split">
          <div class="stack">
            <div class="card card-sm ship-banner"><div class="row-between"><div class="row"><span class="icon-box sm solid">${icon('truck')}</span><div><b class="green">${t.shipping ? `Gratis ongkir untuk belanja ≥ ${rupiah(HC.data.SHIPPING.freeOver)}` : 'Gratis ongkir aktif'}</b><small class="block muted">${t.shipping ? `Tambah ${rupiah(HC.data.SHIPPING.freeOver - t.subtotal)} lagi, atau beli dalam bentuk bundel.` : 'Berlaku untuk pesanan ini.'}</small></div></div>${t.shipping ? '' : `<span class="pill pill-solid">Hemat ${rupiah(HC.data.SHIPPING.flat)}</span>`}</div>
              <div class="row ship-perks"><span>${icon('link')}Komponen terbuka</span><span>${icon('cpu')}Kompatibel ESP32 HYCANE</span><span>${icon('book')}Modul edukasi gratis</span></div></div>
            <section class="card card-flush"><div class="row-between cart-head"><span class="label-sm">Produk terpilih</span><span class="tiny muted">${bundles.length + singles.length} baris</span></div>
              <ul class="cart-list">${bundles.map((b) => bundleRow(b, lines.filter((l) => l.bundle === b))).join('')}${singles.map(itemRow).join('')}</ul></section>
            ${sugg.length ? `<section class="card"><div class="card-head"><div class="row"><span>${icon('sparkles')}</span><div><h2>Sering Dibeli Bersama untuk Perawatan</h2><p>Tambahkan kebutuhan rutin sebelum pesanan dikirim.</p></div></div><span class="pill pill-muted">Sekali klik</span></div>
              <div class="g3">${sugg.map((id) => { const p = P(id); return `<div class="panel sugg"><div class="row"><div class="thumb">${HC.ui.productImg(p)}</div><div><b>${esc(p.name)}</b><small class="block muted clamp2">${esc(p.short)}</small><b class="green">${rupiah(HC.pricing.price(p))}</b></div></div><button class="btn btn-ghost btn-sm btn-block" data-add="${id}">${icon('plus')}Tambah</button></div>`; }).join('')}</div></section>` : ''}
          </div>
          ${summaryCard(t, `<a class="btn btn-primary btn-lg btn-block" href="#/checkout">Lanjut ke Pembayaran Demo${icon('arrowRight')}</a><a class="link-btn center-btn" href="#/marketplace">${icon('arrowLeft')}Lanjut Belanja di Marketplace</a>`,
            `<div class="card card-sm eco"><span class="icon-box solid">${icon('recycle')}</span><div><b>Dampak media pesanan ini</b><small class="block muted">${lines.filter((l) => l.id.startsWith('media-')).reduce((s, l) => s + l.qty * ({ 'media-18': 18, 'media-36': 36, 'media-starter': 12 }[l.id] || 0), 0)} plug ampas tebu biodegradable menggantikan media sekali pakai.</small></div></div>`)}
        </div></div>`;
    },
    mount(root) {
      const rerender = () => { root.innerHTML = HC.views.cart.render(); };
      root.addEventListener('click', (e) => {
        const q = e.target.closest('[data-qty-id]');
        if (q) { const l = HC.store.get('cart').find((x) => x.k === q.dataset.qtyId); if (l) HC.cart.setQty(l.k, l.qty + Number(q.dataset.delta)); rerender(); }
        const r = e.target.closest('[data-remove]'); if (r) { HC.cart.remove(r.dataset.remove); rerender(); }
        const rb = e.target.closest('[data-remove-bundle]'); if (rb) { HC.cart.removeBundle(rb.dataset.removeBundle); rerender(); }
        if (e.target.closest('[data-add]')) setTimeout(rerender, 0);
      });
    },
  };

  /* ---------------- 13 Checkout ---------------- */
  const SHIP = [
    { id: 'reg', label: 'Ekspedisi Reguler', eta: 'Estimasi 1–2 hari', note: 'Packing kayu untuk rangka & bubble wrap untuk sensor.', price: (t) => t.shipping },
    { id: 'instan', label: 'Kurir Instan', eta: 'Khusus Surabaya/Sidoarjo (± 3 jam)', note: 'Diantar langsung dari gudang Surabaya.', price: () => 25000 },
  ];
  const PAY = [
    { id: 'qris', label: 'QRIS (simulasi)', sub: 'Dompet digital & mobile banking', tag: 'Instant Scan' },
    { id: 'va', label: 'Transfer Virtual Account (demo)', sub: 'Bank BCA, Mandiri, BRI, BNI', tag: 'Verifikasi otomatis' },
    { id: 'cod', label: 'Bayar di Tempat (COD, demo)', sub: 'Area Surabaya & sekitarnya', tag: 'Bayar di tempat' },
  ];

  HC.views.checkout = {
    render() {
      const lines = HC.store.get('cart');
      if (!lines.length) return `<div class="page"><h1>Pemesanan & Pembayaran Demo</h1>${HC.ui.emptyState({ icon: 'cart', title: 'Tidak ada yang perlu dibayar', body: 'Keranjangmu kosong. Tambahkan produk dulu.', actions: '<a class="btn btn-primary" href="#/marketplace">Ke Marketplace</a>' })}</div>`;
      const prof = HC.store.get('profile');
      const t = HC.cart.totals();
      return `<div class="page">
        <div class="page-head"><div><nav class="crumbs upper">HYCANE ${icon('chevronRight')}<a href="#/marketplace">Marketplace</a>${icon('chevronRight')}<a href="#/cart">Keranjang</a>${icon('chevronRight')}<span class="here">Pembayaran Demo</span></nav><div class="row"><h1>Pemesanan & Pembayaran Demo</h1><span class="pill pill-mintbright">● Simulasi</span></div><p>Simulasi alur transaksi lengkap untuk presentasi FESTAFORA 2026.</p></div>
          <div class="panel row small">${icon('shield')}<div><b>Mode Demonstrasi</b><small class="block muted">Tidak ada tagihan riil · sandbox</small></div></div></div>
        <form class="split" id="co-form" novalidate>
          <div class="stack">
            <section class="card co-sec"><div class="row-between"><div class="row"><span class="bnum dark">1</span><div><h2>Informasi Penerima & Lokasi Kebun</h2><p class="muted small">Diisi otomatis dari profil kebun</p></div></div><span class="pill pill-ok">${icon('checkCircle')}Terisi</span></div>
              <div class="field-row"><div class="field"><label for="co-name">Nama lengkap</label><div class="input-wrap">${icon('user')}<input id="co-name" value="${esc(prof.name)}" required></div></div>
                <div class="field"><label for="co-phone">Nomor telepon</label><div class="input-wrap">${icon('phone')}<input id="co-phone" type="tel" value="${esc(prof.phone)}" required></div></div></div>
              <div class="field"><label for="co-email">Email notifikasi & invoice</label><div class="input-wrap">${icon('at')}<input id="co-email" type="email" value="${esc(prof.email)}"></div></div>
              <div class="field"><label for="co-addr">Alamat pengiriman kebun hidroponik</label><div class="input-wrap">${icon('mapPin')}<textarea id="co-addr" rows="2" required>${esc(prof.address)}</textarea></div></div>
              <div class="field"><label for="co-note">Catatan logistik (opsional)</label><div class="input-wrap">${icon('alert')}<input id="co-note" placeholder="Contoh: mohon hati-hati, berisi modul sensor"></div></div></section>
            <section class="card co-sec"><div class="row"><span class="bnum dark">2</span><div><h2>Pilih Layanan Pengiriman</h2><p class="muted small">Perlindungan komponen hidroponik & sensor</p></div></div>
              <div class="stack-sm">${SHIP.map((s, i) => { const pr = s.price(t); return `<label class="co-opt ${i === 0 ? 'on' : ''}"><input type="radio" name="ship" value="${s.id}" ${i === 0 ? 'checked' : ''}><span class="co-opt-body"><span class="row"><b>${s.label}</b><span class="pill pill-mintbright">${s.eta}</span></span><small class="muted">${s.note}</small></span><b class="co-price">${pr ? rupiah(pr) : `Rp0 <s class="tiny muted">${rupiah(HC.data.SHIPPING.flat)}</s>`}</b></label>`; }).join('')}</div></section>
            <section class="card co-sec"><div class="row-between"><div class="row"><span class="bnum dark">3</span><div><h2>Metode Pembayaran Demo</h2><p class="muted small">Gerbang pembayaran virtual untuk pitching</p></div></div><span class="pill pill-muted">Sandbox</span></div>
              <div class="stack-sm">${PAY.map((p, i) => `<label class="co-opt ${i === 0 ? 'on' : ''}" data-pay="${p.id}"><input type="radio" name="pay" value="${esc(p.label)}" ${i === 0 ? 'checked' : ''}><span class="co-opt-body"><b>${p.label}</b><small class="muted">${p.sub}</small></span><span class="label-sm">${p.tag}</span></label>`).join('')}</div>
              <div class="qris panel" data-qris><div class="qris-qr">${HC.ui.qrArt('HYCANE-QRIS-' + t.total, 120)}<small class="mono">Ilustrasi, bukan QR asli</small></div><div><span class="pill pill-mintbright">${icon('qr')}Simulasi QRIS FESTAFORA 2026</span><b class="block qris-m">Merchant: HYCANE (demo)</b><p class="small muted">Tampilan visual untuk demonstrasi. Tidak ada transaksi dan tidak ada data pembayaran yang diproses.</p><div class="panel row small">Nominal: <b class="green" data-qris-amt>${rupiah(t.total)}</b></div></div></div>
              <label class="toggle-row"><span class="row">${icon('refresh')}<span><b>Simpan ke Riwayat Pesanan</b><small>Pesanan muncul di menu Orders dan status berjalan otomatis (demo).</small></span></span><input type="checkbox" checked disabled class="check-lg"></label></section>
          </div>
          <aside class="stack sticky"><div class="card cart-sum"><div class="row-between"><h2>Rincian Pesanan</h2><span class="pill pill-muted">${HC.cart.count()} item</span></div>
            <ul class="co-items">${lines.map((l) => { const p = P(l.id); return `<li><div class="thumb">${HC.ui.productImg(p)}</div><div><b>${esc(p.name)}</b><small class="block muted">${l.qty} × ${rupiah(HC.pricing.price(p))}${l.bundle ? ' · bundle' : ''}</small><b class="green">${rupiah(HC.pricing.price(p) * l.qty)}</b></div></li>`; }).join('')}</ul>
            <div class="panel co-tot"><div class="sum-row"><span>Subtotal produk</span><b>${rupiah(t.subtotal)}</b></div>${t.discount ? `<div class="sum-row green"><span>Diskon bundle</span><b>− ${rupiah(t.discount)}</b></div>` : ''}<div class="sum-row"><span>Biaya kirim</span><b data-ship-amt>${t.shipping ? rupiah(t.shipping) : 'Rp0'}</b></div><div class="sum-row"><span>Biaya layanan aplikasi</span><b>Rp0</b></div>
              <div class="sum-total"><b>Total Pembayaran</b><b class="green big" data-total>${rupiah(t.total)}</b></div></div>
            ${HC.store.get('settings').presenter ? `<div class="panel panel-sky small">${icon('chart')}<b> Unit economics:</b> margin kotor ≥ 30% per produk; pembelian ulang media & nutrisi tiap siklus tanam.</div>` : ''}
            <p class="form-error" id="co-err" role="alert" hidden></p>
            <button type="submit" class="btn btn-primary btn-lg btn-block" id="co-submit">${icon('checkCircle')}Konfirmasi Pemesanan Demo</button>
            <p class="small muted center">Tombol ini mensimulasikan pembayaran <b class="green">Lunas</b> dan membuka halaman detail pesanan.</p>
            <a class="link-btn center-btn" href="#/cart">${icon('arrowLeft')}Kembali ke Keranjang</a></div>
            <div class="card card-sm g3 co-trust"><span>${icon('shield')}Pembayaran demo</span><span>${icon('recycle')}Media biodegradable</span><span>${icon('users')}Dukungan komunitas</span></div></aside>
        </form></div>`;
    },
    mount(root) {
      const form = root.querySelector('#co-form');
      if (!form) return null;
      const t = HC.cart.totals();
      const shipCost = () => { const id = form.querySelector('input[name="ship"]:checked').value; return SHIP.find((s) => s.id === id).price(t); };
      const repaint = () => {
        const sc = shipCost(), total = t.subtotal - t.discount + sc;
        root.querySelector('[data-ship-amt]').textContent = sc ? rupiah(sc) : 'Rp0';
        root.querySelector('[data-total]').textContent = rupiah(total);
        root.querySelector('[data-qris-amt]').textContent = rupiah(total);
        root.querySelectorAll('.co-opt').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked));
        root.querySelector('[data-qris]').hidden = !form.querySelector('[data-pay="qris"] input').checked;
      };
      form.addEventListener('change', repaint);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = (id) => root.querySelector(id).value.trim();
        const err = root.querySelector('#co-err');
        if (!v('#co-name') || !v('#co-phone') || !v('#co-addr')) { err.textContent = 'Lengkapi nama, nomor telepon, dan alamat.'; err.hidden = false; return; }
        const btn = root.querySelector('#co-submit');
        btn.disabled = true; btn.textContent = 'Memproses pembayaran demo…';
        const shipId = form.querySelector('input[name="ship"]:checked').value;
        setTimeout(() => {
          const order = HC.cart.checkout({ address: `${v('#co-name')} · ${v('#co-phone')} · ${v('#co-addr')}`, payment: form.querySelector('input[name="pay"]:checked').value, note: v('#co-note'), email: v('#co-email'),
            courier: SHIP.find((s) => s.id === shipId).label + ' (demo)', shipping: shipCost() });
          HC.router.go('#/orders/' + order.id + '?new=1');
        }, 500);
      });
    },
  };

  /* ---------------- 14 Orders ---------------- */
  const ST = { Diproses: ['pill-info', 'Diproses'], Dikemas: ['pill-info', 'Dikemas'], Dikirim: ['pill-info', 'Sedang Dikirim (In Transit)'], Selesai: ['pill-ok', 'Pesanan Selesai (Delivered)'] };
  const statusPill = (s) => `<span class="pill ${ST[s][0]}"><span class="dot ${s === 'Selesai' ? '' : 'dot-blue'}"></span>${ST[s][1]}</span>`;

  function orderCard(o) {
    const shipping = o.status === 'Dikirim' || o.status === 'Dikemas';
    return `<article class="card card-flush ocard ${o.status === 'Selesai' ? 'done' : 'live'}">
      <div class="ocard-head"><div><div class="row"><h2>#${o.id}</h2>${statusPill(o.status)}</div><p class="muted small">${fmtDate(o.createdAt)} • ${fmtShortTime(o.createdAt)} WIB • ${esc(o.payment || '')}</p></div><a class="icon-btn" href="#/orders/${o.id}" aria-label="Detail pesanan">${icon('chevronRight')}</a></div>
      ${shipping ? `<div class="panel ship-box"><span>${icon('truck')}</span><div><b>${esc(o.courier)} (Resi: ${esc(o.resi)})</b><small class="block muted">${o.status === 'Dikirim' ? 'Dalam perjalanan dari gudang Surabaya' : 'Sedang dikemas di gudang Surabaya'}</small></div>${o.items.some((i) => ['kit-sensor', 'kit-smart', 'kit-18', 'esp32', 'meter-set'].includes(i.id)) ? '<span class="pill pill-info">Penanganan khusus: sensor</span>' : ''}</div>` : ''}
      <ul class="oitems">${o.items.slice(0, 4).map((i) => { const p = P(i.id); return `<li><div class="thumb">${HC.ui.productImg(p)}</div><div><b>${esc(p.name)}</b><small class="block muted">${esc(p.short)}</small></div><div class="oi-r"><b>${rupiah(i.price * i.qty)}</b><small class="muted">${i.qty} ${esc(p.unit.split(' ')[0])}</small></div></li>`; }).join('')}${o.items.length > 4 ? `<li class="muted small">+ ${o.items.length - 4} produk lain</li>` : ''}</ul>
      <div class="ocard-foot"><div><small class="muted">Total ${o.status === 'Selesai' ? 'belanja' : 'nilai pembelian'}</small><b class="${o.status === 'Selesai' ? '' : 'green'}">${rupiah(o.total)}</b></div>
        <div class="row"><a class="btn btn-soft" href="#/orders/${o.id}">${icon('receipt')}${o.status === 'Selesai' ? 'Rincian Transaksi' : 'Invoice'}</a>${o.status === 'Selesai' ? `<button class="btn btn-mint" data-reorder-id="${o.id}">${icon('repeat')}Beli Lagi Semua Item</button>` : `<a class="btn btn-primary" href="#/orders/${o.id}">${icon('mapPin')}Lacak Paket & Status</a>`}</div></div>
    </article>`;
  }

  HC.views.orders = {
    render() {
      const orders = HC.store.get('orders');
      const pack = [['media-18', 1], ['abmix-leafy', 1], ['ph-pack', 1]];
      const spent = orders.reduce((s, o) => s + o.total, 0);
      const plugs = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty * ({ 'media-18': 18, 'media-36': 36, 'media-starter': 12 }[i.id] || 0), 0), 0);
      const cnt = (st) => orders.filter((o) => o.status === st).length;
      return `<div class="page">
        <div class="page-head"><div><nav class="crumbs">HYCANE ${icon('chevronRight')} Aktivitas ${icon('chevronRight')}<span class="here">Pesanan Saya</span></nav><h1>Riwayat Pesanan & Pengadaan Kit</h1><p>Pantau pengiriman kit, modul sensor, dan jadwal isi ulang media tanam ampas tebu untuk siklus berikutnya.</p></div><span class="pill pill-info pill-lg">Mode Demo FESTAFORA 2026</span></div>
        <section class="reorder-band"><span class="icon-box glass">${icon('repeat')}</span><div><div class="row"><span class="pill pill-mintbright">REKOMENDASI SIRKULAR</span><span class="small">Siklus berikutnya</span></div><h2>Waktunya isi ulang nutrisi & media ampas tebu?</h2><p>Siapkan media dan nutrisi untuk semai berikutnya agar rak hidroponik terus berproduksi.</p></div>
          <div class="rb-r"><small>Paket isi ulang 1 siklus</small><b>${rupiah(sum(pack))}</b></div><button class="btn btn-white" data-reorder-pack>${icon('cart')}Pesan Ulang Paket</button></section>
        ${orders.length ? `<div class="row-between ofilter"><div class="search">${icon('search')}<label for="o-q" class="sr-only">Cari pesanan</label><input id="o-q" type="search" placeholder="Cari nomor pesanan atau produk…"></div>
          <div class="chips scroll-x">${[['all', `Semua Pesanan (${orders.length})`], ['Diproses', `Diproses (${cnt('Diproses') + cnt('Dikemas')})`], ['Dikirim', `Dalam Pengiriman (${cnt('Dikirim')})`], ['Selesai', `Selesai (${cnt('Selesai')})`]].map(([k, l], i) => `<button class="chip ${i === 0 ? 'active' : ''}" data-ofilter="${k}">${l}</button>`).join('')}</div></div>` : ''}
        <div class="split">
          <div class="stack" data-orders>${orders.length ? orders.map(orderCard).join('') : HC.ui.emptyState({ icon: 'package', title: 'Belum ada pesanan', body: 'Mulai dari kit pemula atau refill yang kamu butuhkan.', actions: '<a class="btn btn-primary" href="#/marketplace">Ke Marketplace</a>' })}</div>
          <aside class="stack">
            <div class="card card-sm"><h3 class="row label-sm green">${icon('recycle')}Dampak Ekosistem & Belanja</h3><div class="g2 impact"><div class="panel"><small>Akumulasi belanja</small><b>${rupiah(spent)}</b><span class="tiny muted">${orders.length} transaksi</span></div><div class="panel panel-mint"><small class="green">Plug ampas tebu</small><b class="green">${plugs}</b><span class="tiny green">pengganti media sekali pakai</span></div></div>
              <p class="panel small impact-n">Setiap plug ampas tebu dirancang biodegradable dan bisa dikomposkan setelah panen.</p></div>
            <div class="card card-sm"><div class="row-between"><h3 class="row label-sm green">${icon('wifi')}Perangkat & Sensor</h3><span class="pill pill-mintbright">Aktif</span></div>
              <div class="stack-sm dev-list"><div class="panel row">${icon('shield')}<div><b>${HC.data.systems.A.deviceName}</b><small class="block muted">${HC.data.systems.A.device} · firmware ${HC.data.device.fw}</small></div></div>
                <div class="panel row">${icon('sliders')}<div><b>Probe sensor pH & EC</b><small class="block muted">Kalibrasi berikutnya dalam ± 16 hari</small></div></div></div>
              <a class="btn btn-soft btn-block" href="#/settings">${icon('wrench')}Panduan Kalibrasi Mandiri</a></div>
            <div class="card card-sm"><h3 class="row label-sm green">${icon('users')}Bantuan Pengadaan & Teknis</h3><p class="small muted help-p">Ada kendala pengiriman, atau butuh saran nutrisi untuk jenis tanaman lain?</p><a class="btn btn-primary btn-block" href="#/community">${icon('message')}Tanya Komunitas & Tim HYCANE</a></div>
          </aside>
        </div></div>`;
    },
    mount(root) {
      let filter = 'all';
      const paint = () => {
        const q = (root.querySelector('#o-q') || { value: '' }).value.trim().toLowerCase();
        const list = HC.store.get('orders').filter((o) => (filter === 'all' || o.status === filter || (filter === 'Diproses' && o.status === 'Dikemas')) && (!q || (o.id + ' ' + o.items.map((i) => P(i.id).name).join(' ')).toLowerCase().includes(q)));
        const el = root.querySelector('[data-orders]');
        if (el) el.innerHTML = list.length ? list.map(orderCard).join('') : HC.ui.emptyState({ icon: 'search', title: 'Pesanan tidak ditemukan', body: 'Coba kata kunci atau filter lain.', actions: '' });
      };
      const off = HC.bus.on('store:orders', paint);
      root.addEventListener('input', (e) => { if (e.target.id === 'o-q') paint(); });
      root.addEventListener('click', (e) => {
        const f = e.target.closest('[data-ofilter]');
        if (f) { filter = f.dataset.ofilter; root.querySelectorAll('[data-ofilter]').forEach((x) => x.classList.toggle('active', x === f)); paint(); }
        const b = e.target.closest('[data-reorder-id]'); if (b) { e.preventDefault(); HC.cart.reorder(b.dataset.reorderId); }
        if (e.target.closest('[data-reorder-pack]')) HC.cart.addMany([['media-18', 1], ['abmix-leafy', 1], ['ph-pack', 1]], 'Paket isi ulang 1 siklus ditambahkan ke keranjang');
      });
      return off;
    },
  };

  /* ---------------- 15 Order detail ---------------- */
  const IOT = ['kit-sensor', 'kit-smart', 'kit-18', 'esp32'];
  function trackerHtml(o) {
    const flow = HC.data.ORDER_FLOW;
    const idx = flow.indexOf(o.status);
    const hasIoT = o.items.some((i) => IOT.includes(i.id));
    const steps = [['Pesanan Dikonfirmasi', 'check'], ['QC & Dikemas', 'package'], ['Dalam Pengiriman', 'truck'], ['Tiba di Lokasi', 'mapPin'], [hasIoT ? 'Pairing Dashboard' : 'Siap Ditanam', hasIoT ? 'wifi' : 'sprout']];
    const at = (i) => { const h = o.history.find((x) => x.status === flow[i]); return h ? `${fmtDate(h.at).replace(/ \d{4}$/, '')} • ${fmtShortTime(h.at)}` : 'Menunggu'; };
    return `<ol class="tracker" style="--n:5">${steps.map(([t, ic], i) => {
      const st = i < idx ? 'done' : i === idx ? (o.status === 'Selesai' && i === 3 ? 'done' : 'now') : (o.status === 'Selesai' && i === 4 ? 'now' : '');
      return `<li class="${st}"><span class="t-dot">${icon(st === 'done' ? 'check' : ic)}</span><b>${t}</b><small>${i <= 3 ? at(i) : (o.status === 'Selesai' ? 'Langkah mandiri' : 'Setelah tiba')}</small></li>`;
    }).join('')}</ol>`;
  }
  function logHtml(o) {
    const txt = { Diproses: ['Pembayaran terverifikasi (demo)', `Pembayaran ${rupiah(o.total)} via ${o.payment || 'metode demo'} dikonfirmasi.`], Dikemas: ['QC & pengemasan', 'Komponen dicek dan dikemas di gudang Surabaya.'], Dikirim: ['Diserahkan ke kurir', `Paket berangkat dengan ${o.courier}. No. resi ${o.resi}.`], Selesai: ['Paket diterima', 'Pesanan diterima di alamat tujuan.'] };
    return o.history.slice().reverse().map((h) => `<li><span class="v-dot ${h.status === 'Selesai' ? '' : 'blue'}"></span><div class="v-head">${fmtShortTime(h.at)} WIB<span class="pill ${h.status === 'Selesai' ? 'pill-ok' : 'pill-info'}">${txt[h.status][0]}</span></div><p>${txt[h.status][1]}</p></li>`).join('');
  }
  function againHtml(o) {
    return o.status === 'Selesai' ? `<button class="btn btn-primary" data-again>${icon('repeat')}Beli Lagi (Reorder)</button>` : `<button class="btn btn-soft" data-speed>${icon('sliders')}Percepat status (demo)</button>`;
  }

  HC.views.orderDetail = {
    render({ id }) {
      const o = HC.store.get('orders').find((x) => x.id === id);
      if (!o) return HC.ui.emptyState({ icon: 'package', title: 'Pesanan tidak ditemukan', body: 'Pesanan ini tidak ada di riwayat. Mungkin demo sudah di-reset.', actions: '<a class="btn btn-primary" href="#/orders">Lihat semua pesanan</a>' });
      const isNew = HC.util.query().get('new') === '1';
      const hasIoT = o.items.some((i) => IOT.includes(i.id));
      const [name, phone, ...rest] = (o.address || '').split(' · ');
      return `<div class="page">
        ${isNew ? `<div class="banner banner-ok">${icon('checkCircle')}<span><b>Pesanan berhasil dibuat!</b> Status berjalan otomatis untuk demo (Diproses → Dikemas → Dikirim → Selesai).</span></div>` : ''}
        <nav class="crumbs">${icon('home')} HYCANE ${icon('chevronRight')}<a href="#/orders">Pesanan Saya</a>${icon('chevronRight')}<span class="here">#${o.id}</span></nav>
        <section class="card od-head"><span class="icon-box">${icon('truck')}</span><div class="od-h"><h1>Pesanan #${o.id}</h1><div data-od-status>${statusPill(o.status)}</div>
          <p class="muted small row">${icon('calendar')}Dipesan: ${fmtDate(o.createdAt)}, ${fmtShortTime(o.createdAt)} WIB • ${icon('receipt')}Metode: ${esc(o.payment || '-')} • ${icon('package')}${o.items.length} jenis item</p></div>
          <div class="stack-sm"><div class="row"><a class="btn btn-soft" href="#/orders">${icon('arrowLeft')}Daftar Pesanan</a><button class="btn btn-sky" data-print>${icon('download')}Invoice</button></div><div data-od-again>${againHtml(o)}</div></div></section>
        <div class="split">
          <div class="stack">
            <section class="card"><div class="row-between"><div><div class="label-sm">Pelacakan logistik</div><h2>Proses Distribusi${hasIoT ? ' & Aktivasi Perangkat' : ''}</h2></div><span class="pill pill-outline pill-lg">${icon('package')}Resi: ${esc(o.resi)}</span></div>
              <div class="od-track" data-od-steps>${trackerHtml(o)}</div>
              <div class="panel"><div class="label-sm">Catatan perjalanan</div><ol class="vtl od-log" data-od-log>${logHtml(o)}</ol></div></section>
            ${hasIoT ? `<section class="card"><div class="row-between"><div class="row"><span class="icon-box sm">${icon('cpu')}</span><div><div class="label-sm">HYCANE provisioning</div><h2>Status Aktivasi & Pasangan Perangkat</h2></div></div><span class="pill pill-info"><span class="dot dot-blue"></span>${o.status === 'Selesai' ? 'Siap dipasangkan' : 'Menunggu tiba'}</span></div>
              <div class="g3 prov"><div class="panel"><div class="row-between"><span>Device identity</span>${icon('cpu')}</div><b>Node baru</b><small class="muted">ESP32 smart controller</small></div><div class="panel"><div class="row-between"><span>Koneksi dashboard</span>${icon('wifi')}</div><b class="blue">Langkah mandiri</b><small class="muted">Wi-Fi rumah → aplikasi HYCANE</small></div><div class="panel"><div class="row-between"><span>Kalibrasi awal</span>${icon('flask')}</div><b class="green">Panduan tersedia</b><small class="muted">Buffer pH 4,00 & 6,86</small></div></div>
              <div class="panel panel-sky row-between"><span class="row">${icon('play')}<span><b>Panduan unboxing & kalibrasi sederhana</b><small class="block muted">Cara memasang talang, plug ampas tebu, dan menghubungkan sensor ke Wi-Fi.</small></span></span><a class="btn btn-white btn-sm" href="#/learn/menggunakan-hycane">Buka panduan${icon('arrowRight')}</a></div></section>` : ''}
            <section class="card"><div class="row-between"><div><div class="label-sm">Item manifest</div><h2>Rincian Produk Dipesan</h2></div><span class="muted">${o.items.length} macam barang</span></div>
              <ul class="manifest">${[...new Set(o.items.filter((i) => i.bundle).map((i) => i.bundle))].map((b) => { const bl = o.items.filter((i) => i.bundle === b); const tot = bl.reduce((s, i) => s + i.price * i.qty, 0); return `<li class="panel"><div class="thumb thumb-lg">${HC.ui.img('assets/images/stitch/s15-32.jpg', 'Bundle HYCANE')}</div><div class="mf-body"><div class="row"><span class="pill pill-mintbright">Flagship Bundle</span><span class="tiny muted mono">SKU: HYC-CUSTOM</span></div><h3>HYCANE Custom Bundle (${bl.length} komponen)</h3><details class="small"><summary class="link">Lihat isi bundle</summary><ul class="bullets">${bl.map((i) => `<li>${i.qty}× ${esc(P(i.id).name)}</li>`).join('')}</ul></details></div><div class="mf-r"><small>1 paket</small><b>${rupiah(tot)}</b></div></li>`; }).join('')}${o.items.filter((i) => !i.bundle).map((i) => { const p = P(i.id); return `<li class="panel"><a class="thumb thumb-lg" href="#/marketplace/p/${p.id}">${HC.ui.productImg(p)}</a><div class="mf-body"><div class="row"><span class="pill pill-mintbright">${esc(HC.data.categories.find((c) => c.id === p.category).label)}</span><span class="tiny muted mono">SKU: ${p.id.toUpperCase()}</span></div><h3>${esc(p.name)}</h3><p class="small muted clamp2">${esc(p.short)}</p></div><div class="mf-r"><small>${i.qty} ${esc(p.unit)}</small><b>${rupiah(i.price * i.qty)}</b></div></li>`; }).join('')}</ul>
              <div class="od-tot"><div class="sum-row"><span>Subtotal produk (${o.items.length} item)</span><b>${rupiah(o.subtotal)}</b></div>${o.discount ? `<div class="sum-row green"><span>Diskon bundle</span><b>− ${rupiah(o.discount)}</b></div>` : ''}<div class="sum-row"><span>Biaya kirim</span><b>${o.shipping ? rupiah(o.shipping) : '<span class="pill pill-ok">Bebas ongkir</span> Rp0'}</b></div>
                <div class="sum-total"><div><span class="label-sm">Total pembayaran akhir</span><small class="block green">${icon('checkCircle')}Lunas (demo)</small></div><b class="green huge">${rupiah(o.total)}</b></div></div></section>
          </div>
          <aside class="stack">
            <section class="card card-sm"><div class="row"><span class="icon-box sm sky">${icon('mapPin')}</span><div><div class="label-sm">Lokasi pengiriman</div><h2>Alamat Kebun Hidroponik</h2></div></div>
              <div class="panel addr"><div class="row-between"><b>${esc(name || '-')}</b><span class="pill pill-mintbright">Kebun utama</span></div><p>${esc(rest.join(' · ') || '-')}</p><p class="row small">${icon('phone')}${esc(phone || '-')}</p></div>
              ${o.note ? `<div class="panel panel-sky small"><b>Instruksi khusus logistik:</b><p><i>“${esc(o.note)}”</i></p></div>` : ''}
              <div class="row-between small od-meta"><span class="row">${icon('truck')}${esc(o.courier)}</span><span>Resi ${esc(o.resi)}</span></div></section>
            <section class="card card-sm"><div class="row"><span class="icon-box sm">${icon('users')}</span><div><div class="label-sm">Layanan purna jual</div><h2>Bantuan Tim HYCANE</h2></div></div>
              <p class="small muted help-p">Butuh pendampingan saat kit tiba? Tanyakan di komunitas atau pelajari panduan memulai.</p>
              <a class="btn btn-primary btn-block" href="#/community">${icon('message')}Tanya di Komunitas</a><a class="btn btn-soft btn-block" href="#/learn">${icon('book')}Pusat Pengetahuan HYCANE</a></section>
            <section class="card card-sm row-between autorefill"><span class="row">${icon('repeat')}<span><b>Pengingat isi ulang media?</b><small class="block muted">Notifikasi saat media perlu diganti</small></span></span><button class="link-btn" data-remind>Aktifkan</button></section>
          </aside>
        </div></div>`;
    },
    mount(root, { id }) {
      const paint = () => {
        const o = HC.store.get('orders').find((x) => x.id === id);
        if (!o) return;
        const set = (sel, html) => { const el = root.querySelector(sel); if (el) el.innerHTML = html; };
        set('[data-od-steps]', trackerHtml(o)); set('[data-od-status]', statusPill(o.status)); set('[data-od-again]', againHtml(o)); set('[data-od-log]', logHtml(o));
      };
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-speed]')) HC.cart.speedUp(id);
        if (e.target.closest('[data-again]')) { HC.cart.reorder(id); HC.router.go('#/cart'); }
        if (e.target.closest('[data-print]')) window.print();
        if (e.target.closest('[data-remind]')) { HC.notify.push({ cat: 'recommendation', sev: 'info', title: 'Pengingat isi ulang media aktif', body: 'HYCANE akan mengingatkan saat media ampas tebu perlu diganti.', link: '#/marketplace/p/media-18' }, { toast: true }); e.target.closest('[data-remind]').textContent = 'Aktif ✓'; }
      });
      return HC.bus.on('store:orders', paint);
    },
  };
})();
