/* 20 Community feed (Stitch 18), 21 Post detail (Stitch 19), 22 Notifications, 25-27 states, 28 Demo controls page.
   Profile & Settings live in account.js (Stitch 21). */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

(function () {
  const { esc, fmt, rupiah, timeAgo } = HC.util;
  const icon = HC.icon;

  /* ---------------- Community data helpers ---------------- */
  function allPosts() {
    const c = HC.store.get('community');
    const now = Date.now();
    const seeded = HC.data.seedPosts.map((p) => Object.assign({}, p, { at: now - p.hoursAgo * 3600000,
      guided: p.guided ? Object.assign({}, p.guided, { at: now - p.guided.hoursAgo * 3600000 }) : null,
      replies: p.replies.map((r) => Object.assign({}, r, { at: now - r.hoursAgo * 3600000 })) }));
    return c.posts.concat(seeded).map((p) => Object.assign({}, p, {
      replies: p.replies.concat(c.replies[p.id] || []),
      likes: p.likes + (c.liked[p.id] ? 1 : 0), liked: !!c.liked[p.id], saved: !!(c.saved || {})[p.id], best: (c.best || {})[p.id],
    }));
  }
  const catLabel = (id) => (HC.data.communityCats.find((c) => c.id === id) || {}).label || id;
  const av = (name, cls = '') => `<span class="avatar avatar-sm ${cls}" aria-hidden="true">${esc(name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase())}</span>`;
  const telemetryChips = (t) => (t ? `<span class="pill ${t.ph < 5.8 || t.ph > 6.8 ? 'pill-crit' : 'pill-ok'}">pH ${fmt(t.ph, 1)}</span><span class="pill pill-ok">TDS ${fmt(t.tds)} ppm</span><span class="pill ${t.temp > 29.5 ? 'pill-warn' : 'pill-info'}">Suhu air ${fmt(t.temp, 1)}°C</span>` : '');

  function postCard(p) {
    return `<article class="card post-card ${p.guided ? 'guided' : ''}">
      ${p.guided ? '<div class="post-stripe"></div>' : ''}
      <div class="row-between"><div class="row">${p.guided ? `<span class="pill pill-mintbright">${icon('checkCircle')}Jawaban Terpandu Tim HYCANE</span>` : ''}<span class="pill pill-muted">${esc(catLabel(p.cat))}</span></div><button class="icon-btn" data-save="${p.id}" aria-label="Simpan diskusi" aria-pressed="${p.saved}">${icon('bookmark', p.saved ? 'filled' : '')}</button></div>
      <div class="post-meta">${av(p.author, 'avatar-soft')}<div><b>${esc(p.author)}</b> <span class="muted small">(${esc(p.city || '')})</span><small class="muted block">${esc(p.level)} • ${timeAgo(p.at)}</small></div></div>
      <a href="#/community/${p.id}"><h2>${esc(p.title)}</h2></a><p class="muted post-ex">${esc(p.body.split('\n')[0])}</p>
      ${p.telemetry ? `<div class="row tele-chips">${icon('wifi')}<span class="label-sm">Snapshot sensor:</span>${telemetryChips(p.telemetry)}</div>` : ''}
      ${p.tags ? `<div class="tags">${p.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
      ${p.guided ? `<div class="panel guided-box"><b class="row green">${icon('sparkles')}Panduan HYCANE & Tindakan</b><p class="small"><b>Jawaban terpandu:</b> ${esc(p.guided.steps[1][1])} ${esc(p.guided.steps[2][1].split('.')[0])}.</p></div>` : ''}
      ${p.images && !p.guided ? `<div class="ph post-img">${HC.ui.img(p.images[0][0], p.images[0][1])}<span class="ph-cap"><span class="cap">${esc(p.images[0][1])}</span></span></div>` : ''}
      <div class="row-between post-foot"><div class="row small muted">${p.guided ? `<span class="row green">${icon('award')}1 jawaban terpandu</span>` : ''}<span class="row">${icon('message')}${p.replies.length} balasan</span><button class="row like ${p.liked ? 'on' : ''}" data-like="${p.id}">${icon('heart')}${p.likes} disukai</button></div><a class="link" href="#/community/${p.id}">${p.guided ? 'Buka Diskusi Lengkap' : p.cat === 'troubleshooting' ? 'Bantu Jawab' : 'Lihat Detail & Komentar'}${icon('arrowRight')}</a></div>
    </article>`;
  }

  async function newPostModal() {
    let res = null;
    const snap = HC.sim.snapshot('A');
    const r = await HC.ui.modal(`<h2>Tanya Komunitas</h2><p class="muted small">Pertanyaanmu akan terlihat oleh anggota komunitas demo.</p>
      <div class="field"><label for="np-title">Judul pertanyaan</label><input id="np-title" maxlength="140" placeholder="Contoh: TDS saya turun cepat, kenapa?"></div>
      <div class="field"><label for="np-cat">Kategori</label><select id="np-cat">${HC.data.communityCats.filter((x) => x.id !== 'all').map((x) => `<option value="${x.id}">${esc(x.label)}</option>`).join('')}</select></div>
      <div class="field"><label for="np-body">Ceritakan kondisinya</label><textarea id="np-body" rows="4" placeholder="Umur tanaman, gejala yang terlihat, apa yang sudah dicoba…"></textarea></div>
      <label class="check"><input type="checkbox" id="np-tel" checked><span>Lampirkan snapshot sensor kit saya (pH ${fmt(snap.ph, 1)}, TDS ${fmt(snap.tds)} ppm, ${fmt(snap.temperature, 1)}°C)</span></label>
      <div class="modal-actions"><button class="btn btn-ghost" data-modal="cancel">Batal</button><button class="btn btn-primary" data-modal="ok">${icon('send')}Kirim Pertanyaan</button></div>`,
    { focus: '#np-title', collect: (m) => ({ title: m.querySelector('#np-title').value.trim(), cat: m.querySelector('#np-cat').value, body: m.querySelector('#np-body').value.trim(), tel: m.querySelector('#np-tel').checked }), set result(v) { res = v; } });
    if (r !== 'ok') return;
    if (!res || !res.title) { HC.ui.toast('Judul pertanyaan belum diisi', { sev: 'warn' }); return; }
    const prof = HC.store.get('profile');
    const post = { id: HC.util.uid('post'), cat: res.cat, author: prof.name, city: HC.data.user.city, level: 'Pemula · Anda', at: Date.now(), likes: 0, mine: true, title: res.title, body: res.body || '(tanpa detail)',
      telemetry: res.tel ? { ph: +snap.ph.toFixed(1), tds: Math.round(snap.tds), temp: +snap.temperature.toFixed(1) } : null, tags: ['Pemula'], replies: [] };
    HC.store.update('community', (cm) => { cm.posts.unshift(post); return cm; });
    HC.ui.toast('Pertanyaan diterbitkan', { sev: 'ok' });
    HC.router.go('#/community/' + post.id);
  }

  function toggle(field, id) {
    HC.store.update('community', (c) => { c[field] = c[field] || {}; c[field][id] = !c[field][id]; return c; });
  }

  /* ---------------- 20 Community feed ---------------- */
  HC.views.community = {
    render() {
      const mine = allPosts().filter((p) => p.mine).length;
      return `<div class="page">
        <section class="card comm-head"><div><nav class="crumbs">HYCANE ${icon('chevronRight')}<span class="ink">Komunitas Petani Kota</span></nav><h1>Komunitas & Ruang Diskusi Petani HYCANE</h1><p class="muted">Belajar bersama, bertukar pengalaman instalasi, dan atasi kendala tanaman bersama sesama pemula.</p></div>
          <div class="row"><button class="btn btn-soft" data-mine>${icon('message')}Diskusi Saya <span class="pill pill-mintbright">${mine} aktif</span></button><button class="btn btn-primary" data-new-post>${icon('plus')}Tanya Komunitas (+ Buat Diskusi)</button></div></section>
        <section class="card card-sm comm-filter"><div class="chips scroll-x">${HC.data.communityCats.map((c, i) => `<button class="chip ${i === 0 ? 'active' : ''}" data-ccat="${c.id}">${esc(c.label)}${c.id === 'all' ? ` (${allPosts().length})` : ''}</button>`).join('')}</div>
          <div class="row-between"><div class="search soft comm-search">${icon('search')}<label for="c-q" class="sr-only">Cari diskusi</label><input id="c-q" type="search" placeholder="Cari pertanyaan, gejala daun, atau tipe kit…"></div>
            <div class="row small"><span class="label-sm">Topik populer:</span>${HC.data.hotTopics.map((t) => `<button class="tag topic" data-topic="${esc(t)}"># ${esc(t)}</button>`).join('')}</div></div></section>
        <div class="split">
          <div class="stack" data-posts></div>
          <aside class="stack">
            <div class="card card-sm"><div class="row-between"><h2 class="row">${icon('sparkles')}Tim & Moderator</h2><span class="dot"></span></div>
              <div class="stack-sm mentors"><div class="panel row">${av('Tim Agronomi', 'avatar-mint')}<div><b>Tim Agronomi HYCANE</b><small class="block muted">Jawaban terpandu untuk pemula</small><small class="green">Online • demo</small></div>${icon('message')}</div>
                <div class="panel row">${av('Moderator Komunitas', 'avatar-soft')}<div><b>Moderator Komunitas</b><small class="block muted">Menjaga diskusi tetap ramah</small><small class="green">Online • demo</small></div>${icon('message')}</div></div>
              <div class="panel panel-mint small row">${icon('bolt')}Pertanyaan pemula biasanya dibalas dalam beberapa jam (demo).</div></div>
            <div class="card card-sm"><h2 class="row">${icon('trend')}Topik Terhangat Minggu Ini</h2><ol class="hot">${allPosts().slice().sort((a, b) => b.replies.length + b.likes / 10 - (a.replies.length + a.likes / 10)).slice(0, 3).map((p, i) => `<li><a href="#/community/${p.id}"><b>${i + 1}. ${esc(p.title)}</b><small class="muted">${p.replies.length} balasan • ${p.likes} disukai</small></a></li>`).join('')}</ol></div>
            <div class="card card-sm"><h2 class="row">${icon('heart')}Etika Komunitas Ramah Pemula</h2><p class="small muted ethic">Tidak ada pertanyaan yang "terlalu dasar" di HYCANE. Semua petani pernah jadi pemula.</p><ul class="checklist"><li>${icon('checkCircle')}<span>Sertakan angka pH/TDS bila bisa</span></li><li>${icon('checkCircle')}<span>Saran anggota bukan diagnosis pasti</span></li><li>${icon('checkCircle')}<span>Ubah satu hal dalam satu waktu</span></li></ul></div>
            <div class="card card-sm"><h2 class="row">${icon('book')}Akses Cepat Modul Terkait</h2><ul class="lesson-links"><li><a href="#/learn/ph"><span class="icon-box sm">${icon('book')}</span><span>Apa itu pH?<small>Panduan praktis 5 menit</small></span>${icon('arrowRight')}</a></li><li><a href="#/marketplace/p/media-18"><span class="icon-box sm sky">${icon('basket')}</span><span>Refill Bagasse Media<small>Tersedia di Marketplace</small></span>${icon('arrowRight')}</a></li><li><a href="#/diagnosis"><span class="icon-box sm">${icon('stethoscope')}</span><span>Diagnosis tanaman<small>Cek gejala dulu</small></span>${icon('arrowRight')}</a></li></ul></div>
          </aside>
        </div></div>`;
    },
    mount(root) {
      let cat = 'all', mineOnly = false;
      const paint = () => {
        const q = root.querySelector('#c-q').value.trim().toLowerCase();
        const list = allPosts().filter((p) => (cat === 'all' || p.cat === cat) && (!mineOnly || p.mine) && (!q || `${p.title} ${p.body} ${(p.tags || []).join(' ')}`.toLowerCase().includes(q)));
        root.querySelector('[data-posts]').innerHTML = list.length ? list.map(postCard).join('') + '<p class="center muted small">Menampilkan semua diskusi demo.</p>'
          : HC.ui.emptyState({ icon: 'message', title: mineOnly ? 'Kamu belum membuat diskusi' : 'Belum ada diskusi yang cocok', body: 'Jadilah yang pertama bertanya.', actions: '<button class="btn btn-primary" data-new-post>Tanya Komunitas</button>' });
      };
      root.addEventListener('input', (e) => { if (e.target.id === 'c-q') paint(); });
      root.addEventListener('click', (e) => {
        const c = e.target.closest('[data-ccat]');
        if (c) { cat = c.dataset.ccat; mineOnly = false; root.querySelectorAll('[data-ccat]').forEach((x) => x.classList.toggle('active', x === c)); paint(); }
        const t = e.target.closest('[data-topic]'); if (t) { root.querySelector('#c-q').value = t.dataset.topic.split(' ')[0]; paint(); }
        if (e.target.closest('[data-mine]')) { mineOnly = !mineOnly; paint(); }
        const lk = e.target.closest('[data-like]'); if (lk) { toggle('liked', lk.dataset.like); paint(); }
        const sv = e.target.closest('[data-save]'); if (sv) { toggle('saved', sv.dataset.save); paint(); HC.ui.toast('Daftar simpanan diperbarui', { icon: 'bookmark' }); }
        if (e.target.closest('[data-new-post]')) newPostModal();
      });
      paint();
    },
  };

  /* ---------------- 21 Post detail ---------------- */
  HC.views.post = {
    render({ id }) {
      const p = allPosts().find((x) => x.id === id);
      if (!p) return HC.ui.emptyState({ icon: 'message', title: 'Diskusi tidak ditemukan', body: 'Mungkin sudah dihapus.', actions: '<a class="btn btn-primary" href="#/community">Kembali ke Komunitas</a>' });
      const t = p.telemetry;
      const g = p.guided;
      const rel = (g && g.lesson ? [g.lesson] : []).concat(t && (t.ph < 5.8 || t.ph > 6.8) ? ['ph'] : [], ['tds', 'daun-menguning']).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).map((s) => HC.data.lessonBySlug[s]).filter(Boolean);
      const prod = HC.data.productById[(g && g.products && g.products[0]) || 'meter-set'];
      const similar = allPosts().filter((x) => x.id !== id && x.cat === p.cat).slice(0, 2);
      return `<div class="page">
        <section class="card card-sm post-bar"><div><nav class="crumbs small"><a href="#/community">${icon('arrowLeft')}Kembali ke Semua Diskusi</a> / Komunitas / ${esc(catLabel(p.cat))} / <span class="here">Diskusi #${esc(p.id.toUpperCase())}</span></nav>
          <div class="row"><span class="pill pill-muted"><span class="dot"></span>Topik aktif • ${p.replies.length} tanggapan</span>${g ? `<span class="pill pill-mintbright">${icon('checkCircle')}Jawaban terpandu Tim HYCANE</span>` : ''}<span class="pill pill-outline">${icon('flag')}FESTAFORA 2026 Sandbox</span></div></div>
          <div class="row"><button class="btn btn-ghost btn-sm" data-save>${icon('bookmark')}${p.saved ? 'Tersimpan' : 'Simpan Topik'}</button><button class="btn btn-ghost btn-sm" data-share>${icon('share')}Bagikan</button></div></section>
        <div class="split">
          <div class="stack">
            <article class="card post-full">
              <div class="row-between"><div class="post-meta">${av(p.author, 'avatar-soft')}<div><b class="lg">${esc(p.author)}</b> <span class="pill pill-info">${esc(p.city || '')}</span><small class="muted block">${esc(p.level)} • diunggah ${timeAgo(p.at)}</small></div></div></div>
              ${t ? `<div class="panel row tele-snap">${icon('wifi')}<span class="label-sm">Snapshot telemetri terlampir:</span>${telemetryChips(t)}</div>` : ''}
              <h1>${esc(p.title)}</h1>${p.body.split('\n').filter(Boolean).map((para) => `<p class="post-p">${esc(para)}</p>`).join('')}
              ${p.images ? `<div class="g2">${p.images.map(([src, cap]) => `<div class="ph post-img">${HC.ui.img(src, cap)}<span class="ph-cap"><span class="cap">${icon('image')} ${esc(cap)}</span></span></div>`).join('')}</div>` : ''}
              <div class="row-between post-actions"><div class="row"><button class="btn btn-ghost btn-sm like ${p.liked ? 'on' : ''}" data-like aria-pressed="${p.liked}">${icon('thumb')}<span>${p.likes}</span> Terbantu</button><span class="row small muted">${icon('message')}${p.replies.length} tanggapan</span></div><button class="link-btn small muted" data-report>${icon('flag')}Laporkan</button></div>
            </article>
            ${g ? `<article class="card guided-ans"><div class="post-stripe"></div><div class="row-between"><span class="pill pill-mintbright">${icon('checkCircle')}HYCANE Guided Answer • Jawaban terpandu</span><span class="small muted">${timeAgo(g.at)}${p.best ? ' • Ditandai solusi terbaik' : ''}</span></div>
              <div class="post-meta">${av('Tim Agronomi', 'avatar-mint')}<div><b class="lg">${esc(g.author)}</b><small class="muted block">${esc(g.role)} · bukan diagnosis pasti</small></div></div>
              <div class="stack-sm">${g.steps.map(([h, x], i) => `<div class="panel gstep"><b class="green row">${icon(['stethoscope', 'droplet', 'clock'][i] || 'check')}${i + 1}. ${esc(h)}</b><p>${esc(x)}</p></div>`).join('')}</div>
              <div class="row gbtns"><button class="btn btn-primary btn-sm" data-best ${p.best ? 'disabled' : ''}>${icon('thumb')}${p.best ? 'Solusi terbaik ✓' : 'Tandai Sebagai Solusi Terbaik'}</button><a class="btn btn-soft btn-sm" href="#/learn/${g.lesson}">${icon('book')}Buka Modul Edukasi</a>${prod ? `<button class="btn btn-mint btn-sm" data-add="${prod.id}">${icon('basket')}Beli ${esc(prod.name.split(' (')[0])}</button>` : ''}</div></article>` : ''}
            <div class="row-between"><h2>Tanggapan Komunitas (${p.replies.length})</h2><span class="small muted">Urutkan: <b class="green">Terbaru</b></span></div>
            <ul class="replies">${p.replies.slice().reverse().map((r) => `<li class="card card-sm reply"><div class="row-between"><div class="post-meta">${av(r.author)}<div><b>${esc(r.author)}</b> <span class="pill pill-muted">${esc(r.meta || r.level || '')}</span><small class="muted block">${timeAgo(r.at)}</small></div></div></div><p>${esc(r.text)}</p><div class="row small muted reply-f"><span class="row">${icon('thumb')}${r.likes || 0} mendukung</span><button class="link-btn small" data-reply-to="${esc(r.author)}">Balas</button></div></li>`).join('')}</ul>
            <form class="card reply-form" id="reply-form"><div class="row">${av(HC.store.get('profile').name, 'avatar-mint')}<div><h2>Tulis Tanggapan atau Bagikan Solusi</h2><small class="muted">Balas sebagai ${esc(HC.store.get('profile').name)} (${esc(HC.store.get('profile').farm)})</small></div></div>
              <label for="reply" class="sr-only">Tanggapan</label><textarea id="reply" rows="4" placeholder="Tulis balasan dengan bahasa yang ramah dan saling mendukung…"></textarea>
              <div class="row-between"><div class="row"><button type="button" class="btn btn-soft btn-sm" data-photo>${icon('camera')}Lampirkan Foto</button><button type="button" class="btn btn-soft btn-sm" data-insert>${icon('wifi')}Sisipkan Data Sensor Kit Saya</button></div><button class="btn btn-primary" type="submit">${icon('send')}Kirim Tanggapan</button></div></form>
          </div>
          <aside class="stack">
            ${t ? `<section class="card card-sm"><div class="row-between"><h2 class="row">${icon('cpu')}Kit Pelapor Terhubung</h2><span class="pill pill-mintbright">Snapshot</span></div>
              <ul class="kv small kit-kv"><li><span>Hardware</span><b>HYCANE Smart Kit</b></li><li><span>Lokasi</span><b>${esc(p.city || '-')}</b></li></ul>
              <div class="g2"><div class="panel tbox ${t.ph < 5.8 || t.ph > 6.8 ? 'bad' : 'good'}"><small>Sensor pH air</small><b>${fmt(t.ph, 1)}</b><small>Target 5,8–6,8</small></div><div class="panel tbox good"><small>Sensor TDS</small><b>${fmt(t.tds)}<small> ppm</small></b><small>Target 650–1.100</small></div></div>
              <a class="btn btn-soft btn-sm btn-block" href="#/monitoring">${icon('activity')}Bandingkan dengan Data Kit Saya</a></section>` : ''}
            <section class="card card-sm"><div class="row-between"><h2 class="row">${icon('graduation')}Materi Edukasi Terkait</h2><a class="link small" href="#/learn">Akademi</a></div>
              <ul class="lesson-links">${rel.map((l) => `<li><a href="#/learn/${l.slug}"><span class="sy-ic done">${String(l.no).padStart(2, '0')}</span><span>${esc(l.title)}<small>${l.mins} menit baca</small></span>${icon('chevronRight')}</a></li>`).join('')}</ul></section>
            ${prod ? `<section class="card card-sm"><div class="row-between"><h2 class="row">${icon('basket')}Solusi Produk Terkait</h2><a class="link small" href="#/marketplace">Toko HYCANE</a></div><div class="panel row prod-sol"><div class="thumb">${HC.ui.productImg(prod)}</div><div><b>${esc(prod.name)}</b><small class="block muted">${esc(prod.short)}</small><b class="green">${rupiah(HC.pricing.price(prod))}</b></div></div><button class="btn btn-primary btn-block" data-add="${prod.id}">${icon('cart')}+ Tambah ke Keranjang</button></section>` : ''}
            ${similar.length ? `<section class="card card-sm"><h2 class="row">${icon('message')}Diskusi Serupa</h2><ul class="similar">${similar.map((s) => `<li><a href="#/community/${s.id}"><b>“${esc(s.title)}”</b><small class="muted">${s.replies.length} tanggapan • ${timeAgo(s.at)}</small></a></li>`).join('')}</ul></section>` : ''}
          </aside>
        </div>
      </div>`;
    },
    mount(root, { id }) {
      const form = root.querySelector('#reply-form');
      if (!form) return null;
      const rerender = () => { const y = window.scrollY; HC.router.resolve(); window.scrollTo(0, y); };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const t = root.querySelector('#reply').value.trim();
        if (!t) { HC.ui.toast('Tanggapan masih kosong', { sev: 'warn' }); return; }
        const prof = HC.store.get('profile');
        HC.store.update('community', (c) => { (c.replies[id] = c.replies[id] || []).push({ author: prof.name, meta: `${prof.farm} (Anda)`, at: Date.now(), likes: 0, text: t }); return c; });
        rerender();
        HC.ui.toast('Tanggapan terkirim', { sev: 'ok' });
      });
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-like]')) { toggle('liked', id); rerender(); }
        if (e.target.closest('[data-save]')) { toggle('saved', id); rerender(); HC.ui.toast('Daftar simpanan diperbarui', { icon: 'bookmark' }); }
        if (e.target.closest('[data-best]')) { HC.store.update('community', (c) => { c.best = c.best || {}; c.best[id] = true; return c; }); rerender(); HC.ui.toast('Ditandai sebagai solusi terbaik', { sev: 'ok' }); }
        if (e.target.closest('[data-share]')) { const url = location.href; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => HC.ui.toast('Tautan diskusi disalin', { sev: 'ok', icon: 'link' }), () => HC.ui.toast(url, { icon: 'link' })); }
        if (e.target.closest('[data-report]')) HC.ui.toast('Terima kasih. Laporan diteruskan ke moderator (demo).', { icon: 'flag' });
        if (e.target.closest('[data-photo]')) HC.ui.toast('Unggah foto tidak tersedia di demo ini', { icon: 'camera' });
        const rt = e.target.closest('[data-reply-to]'); if (rt) { const ta = root.querySelector('#reply'); ta.value = `@${rt.dataset.replyTo} `; ta.focus(); }
        if (e.target.closest('[data-insert]')) {
          const s = HC.sim.snapshot('A'); const ta = root.querySelector('#reply');
          ta.value = (ta.value ? ta.value + '\n' : '') + `[Data kit saya: pH ${fmt(s.ph, 1)} • TDS ${fmt(s.tds)} ppm • suhu air ${fmt(s.temperature, 1)}°C • air ${fmt(s.waterLevel)}%]`;
          ta.focus();
        }
      });
    },
  };

  /* ---------------- 22 Notifications ---------------- */
  const NCATS = [['all', 'Semua'], ['monitoring', 'Monitoring'], ['recommendation', 'Rekomendasi'], ['orders', 'Pesanan'], ['education', 'Edukasi']];
  const NICON = { monitoring: 'activity', recommendation: 'sparkles', orders: 'truck', education: 'book' };
  HC.views.notifications = {
    render() {
      return `<div class="page narrow">
        <div class="page-head"><div><nav class="crumbs">HYCANE ${icon('chevronRight')} Aktivitas ${icon('chevronRight')}<span class="here">Notifikasi</span></nav><h1>Notifikasi</h1><p data-unread></p></div>
          <div class="row"><button class="btn btn-soft btn-sm" data-read-all>${icon('check')}Tandai semua dibaca</button><button class="btn btn-ghost btn-sm" data-clear>${icon('trash')}Hapus semua</button></div></div>
        <div class="chips scroll-x">${NCATS.map(([k, l], i) => `<button class="chip ${i === 0 ? 'active' : ''}" data-ncat="${k}">${l}</button>`).join('')}</div>
        <ul class="notif-list" data-notifs></ul>
      </div>`;
    },
    mount(root) {
      let cat = 'all';
      const paint = () => {
        const list = HC.store.get('notifs').filter((n) => cat === 'all' || n.cat === cat);
        root.querySelector('[data-unread]').textContent = `${HC.notify.unread()} belum dibaca · peringatan kondisi air, pesanan, dan materi baru`;
        root.querySelector('[data-notifs]').innerHTML = list.length ? list.map((n) => { const lv = HC.ui.LEVEL[n.sev] ? HC.ui.LEVEL[n.sev].cls : 'info'; return `<li><a class="card card-sm notif ${n.read ? '' : 'unread'} notif-${lv}" href="${n.link || '#/notifications'}" data-nid="${n.id}">
          <span class="icon-box sm ${lv === 'crit' ? 'crit' : lv === 'warn' ? 'warn' : lv === 'ok' ? '' : 'sky'}">${icon(n.sev === 'crit' ? 'octagon' : n.sev === 'warn' ? 'alert' : NICON[n.cat] || 'bell')}</span>
          <span class="notif-body"><span class="row-between"><b>${esc(n.title)}</b><small class="muted">${timeAgo(n.at)}</small></span>${n.body ? `<span class="muted">${esc(n.body)}</span>` : ''}<span class="row">${HC.ui.pill(n.sev === 'warn' || n.sev === 'crit' || n.sev === 'ok' ? n.sev : 'info', (NCATS.find((c) => c[0] === n.cat) || [0, 'Info'])[1])}</span></span>
          ${n.read ? '' : '<span class="dot dot-blue unread-dot" aria-label="Belum dibaca"></span>'}</a></li>`; }).join('')
          : `<li>${HC.ui.emptyState({ icon: 'bell', title: 'Tidak ada notifikasi', body: 'Kamu akan diberi tahu saat kondisi air berubah, pesanan dikirim, atau ada materi baru.', actions: '<a class="btn btn-soft" href="#/dashboard">Ke Dashboard</a>' })}</li>`;
      };
      root.addEventListener('click', async (e) => {
        const c = e.target.closest('[data-ncat]');
        if (c) { cat = c.dataset.ncat; root.querySelectorAll('[data-ncat]').forEach((x) => x.classList.toggle('active', x === c)); paint(); }
        const n = e.target.closest('[data-nid]'); if (n) HC.notify.markRead(n.dataset.nid);
        if (e.target.closest('[data-read-all]')) { HC.notify.markAll(); paint(); }
        if (e.target.closest('[data-clear]') && await HC.ui.confirm('Hapus semua notifikasi?', 'Notifikasi yang dihapus tidak bisa dikembalikan (kecuali dengan Reset Demo).', 'Hapus', true)) { HC.store.set('notifs', []); paint(); }
      });
      paint();
      return HC.bus.on('store:notifs', paint);
    },
  };

  /* ---------------- Pricing audit (presenter) ---------------- */
  HC.views.pricingAudit = function () {
    const rows = HC.data.products.map((p) => ({ p, q: HC.pricing.quote(p) }));
    const researched = rows.filter((r) => r.p.sourceType === 'marketplace-benchmark').length;
    const minMargin = Math.min(...rows.map((r) => r.q.grossMargin));
    return `<section class="card"><div class="card-head"><div><h2>${icon('lock')}Audit Harga (presenter)</h2><p>${rows.length} produk · ${researched} benchmark Shopee · margin kotor minimum ${fmt(minMargin * 100, 1)}%</p></div></div>
      <p class="muted small">Harga jual = biaya acuan ÷ 0,70, dibulatkan ke atas. Bukan biaya × 1,30.</p>
      <div class="table-wrap"><table class="table table-sm"><thead><tr><th>Produk</th><th>Sumber</th><th class="num">Biaya acuan</th><th class="num">Harga jual</th><th class="num">Margin</th></tr></thead><tbody>
      ${rows.map(({ p, q }) => `<tr><td>${esc(p.name)}</td><td>${p.sourceType === 'marketplace-benchmark' ? `<a class="link" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Shopee</a>` : p.sourceType === 'hycane-bom' ? 'BOM kit' : '<span class="muted">needs-validation</span>'}</td><td class="num">${rupiah(q.benchmarkCost)}</td><td class="num">${rupiah(q.sellingPrice)}</td><td class="num">${fmt(q.grossMargin * 100, 1)}%</td></tr>`).join('')}
      </tbody></table></div></section>`;
  };

  /* ---------------- 28 Demo Simulation Controls (full page) ---------------- */
  HC.views.demo = {
    render() {
      return `<div class="page">
        <div class="page-head"><div><div class="eyebrow">Hanya untuk presenter</div><h1>Demo Simulation Controls</h1><p>Picu kondisi sensor secara terkendali saat pitching. Bukan fitur pelanggan.</p></div><a class="btn btn-ghost" href="#/monitoring">${icon('wifi')}Buka Live Monitoring</a></div>
        <div class="split"><section class="card">${HC.ui.demoControls()}</section>
          <section class="card card-sm"><h2 class="row">${icon('activity')}Skenario Pitching</h2><ol class="steps demo-steps"><li>Tunjukkan Dashboard normal (pH 6,2 · TDS 880 · 26,4°C · air 78%).</li><li>Klik <b>Simulate Low Water</b>, tunggu ± 20 detik hingga status <i>Perhatian</i> lalu <i>Mendesak</i>.</li><li>Buka AI Recommendation → “Lihat Panduan Lengkap” → modul Ketinggian Air.</li><li>Marketplace → beli refill/spare part.</li><li>Kembali ke Rekomendasi → <b>Tandai Sudah Dikerjakan</b> (air terisi bertahap) atau <b>Reset to Normal</b>.</li></ol></section></div>
        ${HC.views.pricingAudit()}
      </div>`;
    },
    mount(root) { return HC.ui.mountDemoControls(root.querySelector('.demo-panel').parentElement); },
  };

  /* ---------------- 25/26/27 State screens ---------------- */
  HC.views.states = {
    render({ kind = 'notfound', detail } = {}) {
      if (kind === 'offline') {
        const snap = HC.sim.snapshot('A');
        const off = HC.store.get('settings').offline;
        return `<div class="page narrow"><div class="state">
          <div class="state-ic state-muted">${icon('wifiOff')}</div><h1>Perangkat sedang offline</h1>
          <p>HYCANE-001 tidak mengirim data. Angka terakhir tetap ditampilkan, dan layar LCD di perangkat tetap menunjukkan kondisi air walau internet putus.</p>
          <div class="panel state-last"><b>Data terakhir</b><span>pH ${fmt(snap.ph, 2)} · TDS ${fmt(snap.tds)} ppm · ${fmt(snap.temperature, 1)}°C · air ${fmt(snap.waterLevel)}%</span><span class="muted small">${HC.util.fmtTime(snap.timestamp)}</span></div>
          <ol class="steps left"><li>Pastikan adaptor perangkat menyala.</li><li>Cek Wi-Fi rumah dan jaraknya ke perangkat.</li><li>Cabut lalu pasang lagi daya perangkat, tunggu 1 menit.</li><li>Sementara itu, cek pH/TDS dengan alat ukur manual.</li></ol>
          <div class="empty-actions">${off ? `<button class="btn btn-primary" data-go-online>${icon('refresh')}Hubungkan ulang (demo)</button>` : `<button class="btn btn-soft" data-go-offline>${icon('wifiOff')}Simulasikan offline</button>`}<a class="btn btn-ghost" href="#/dashboard">Ke Dashboard</a></div>
        </div></div>`;
      }
      if (kind === 'error') {
        return `<div class="page narrow"><div class="state">
          <div class="state-ic state-crit">${icon('bug')}</div><h1>Terjadi kesalahan</h1>
          <p>Halaman ini tidak dapat ditampilkan. Data kamu aman. Coba muat ulang, atau kembali ke Dashboard.</p>
          ${detail ? `<details class="muted small"><summary>Detail teknis</summary><code>${esc(detail)}</code></details>` : '<p class="muted small">(Contoh tampilan Error State untuk demo.)</p>'}
          <div class="empty-actions"><button class="btn btn-primary" data-reload>${icon('refresh')}Coba lagi</button><a class="btn btn-ghost" href="#/dashboard">Ke Dashboard</a></div></div></div>`;
      }
      if (kind === 'empty') {
        return `<div class="page narrow"><h1 class="sr-only">Empty State</h1>${HC.ui.emptyState({ icon: 'package', title: 'Belum ada pesanan', body: 'Mulai dari kit pemula atau refill yang kamu butuhkan. (Contoh Empty State; pola yang sama dipakai di keranjang, pencarian, dan notifikasi.)', actions: '<a class="btn btn-primary" href="#/marketplace">Ke Marketplace</a> <a class="btn btn-ghost" href="#/dashboard">Ke Dashboard</a>' })}</div>`;
      }
      return `<div class="page narrow"><div class="state"><div class="state-ic state-muted">${icon('search')}</div><h1>Halaman tidak ditemukan</h1><p>Alamat ini tidak ada di aplikasi HYCANE.</p><div class="empty-actions"><a class="btn btn-primary" href="#/dashboard">Ke Dashboard</a></div></div></div>`;
    },
    mount(root) {
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-reload]')) HC.router.go('#/dashboard');
        const on = e.target.closest('[data-go-online]'), off = e.target.closest('[data-go-offline]');
        if (on || off) {
          HC.store.update('settings', (s) => Object.assign(s, { offline: !!off }));
          HC.ui.refreshDevicePill(); HC.bus.emit('settings', 'offline');
          HC.ui.toast(off ? 'Perangkat disimulasikan offline' : 'Perangkat terhubung kembali', { sev: off ? 'warn' : 'ok' });
          HC.router.resolve();
        }
      });
    },
  };
})();
