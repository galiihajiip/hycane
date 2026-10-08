/* Bootstrap: routes, background watchers, Reset Demo. */
var HC = window.HC || (window.HC = {});

HC.app = (function () {
  const V = HC.views;
  const R = HC.router;

  function routes() {
    R.add('/login', V.login, { bare: true, title: 'Masuk' });
    R.add('/dashboard', V.dashboard, { title: 'Ecosystem Control', nav: 'dashboard' });
    R.add('/monitoring', V.monitoring, { title: 'Live Monitoring', nav: 'monitoring' });
    R.add('/ai', V.ai, { title: 'Rekomendasi AI', nav: 'ai' });
    R.add('/crops', V.crops, { title: 'My Crops', nav: 'crops' });
    R.add('/crops/new', V.cropAdd, { title: 'Tambah Tanaman', nav: 'crops', back: true });
    R.add('/crops/:id', V.cropDetail, { title: 'Detail Batch', nav: 'crops', back: true });
    R.add('/crops/:id/harvest', V.harvest, { title: 'Harvest Log', nav: 'crops', back: true });
    R.add('/certificate/:id', V.certificate, { title: 'Sertifikat Panen', nav: 'crops', back: true });
    R.add('/marketplace', V.marketplace, { title: 'Marketplace', nav: 'marketplace' });
    R.add('/marketplace/c/:cat', V.category, { title: 'Kategori', nav: 'marketplace', back: true });
    R.add('/marketplace/p/:id', V.product, { title: 'Detail Produk', nav: 'marketplace', back: true });
    R.add('/bundle', V.bundle, { title: 'Bundle Builder', nav: 'marketplace', back: true });
    R.add('/cart', V.cart, { title: 'Keranjang', nav: 'marketplace', back: true });
    R.add('/checkout', V.checkout, { title: 'Checkout', nav: 'marketplace', back: true });
    R.add('/orders', V.orders, { title: 'Pesanan', nav: 'orders' });
    R.add('/orders/:id', V.orderDetail, { title: 'Detail Pesanan', nav: 'orders', back: true });
    R.add('/learn', V.learn, { title: 'Edukasi', nav: 'learn' });
    R.add('/learn/:slug', V.lesson, { title: 'Materi', nav: 'learn', back: true });
    R.add('/learn/:slug/quiz', V.quiz, { title: 'Kuis', nav: 'learn', back: true });
    R.add('/diagnosis', V.diagnosis, { title: 'Diagnosis Masalah', nav: 'diagnosis' });
    R.add('/community', V.community, { title: 'Komunitas', nav: 'community' });
    R.add('/community/:id', V.post, { title: 'Diskusi', nav: 'community', back: true });
    R.add('/notifications', V.notifications, { title: 'Notifikasi', nav: 'notifications' });
    R.add('/profile', V.account, { title: 'Profile', nav: 'profile' });
    R.add('/settings', V.account, { title: 'Settings', nav: 'settings' });
    R.add('/demo', V.demo, { title: 'Demo Tools', nav: 'settings', back: true });
    R.add('/state/:kind', V.states, { title: 'Status', back: true });
  }

  function log(sev, title, body) {
    HC.store.update('simlog', (l) => [{ at: Date.now(), sev, title, body }].concat(l || []).slice(0, 30));
  }

  /* Push a notification (and toast) when a parameter escalates: ok -> warn -> crit.
     De-duplicated per parameter so the demo never spams. */
  const lastLevel = {};
  const RANK = { ok: 0, warn: 1, crit: 2 };
  const MSG = {
    ph: (s, l) => (s.ph > 6.8 ? (l === 'crit' ? `pH terlalu tinggi (${HC.util.fmt(s.ph, 1)}).` : 'pH mendekati batas aman.') : (l === 'crit' ? `pH terlalu rendah (${HC.util.fmt(s.ph, 1)}).` : 'pH turun mendekati batas aman.')),
    tds: (s, l) => (s.tds > 1000 ? (l === 'crit' ? 'Larutan nutrisi terlalu pekat.' : 'Sensor TDS membaca kenaikan konsentrasi.') : (l === 'crit' ? 'Larutan nutrisi terlalu encer.' : 'Kepekatan nutrisi mulai turun.')),
    temperature: (s, l) => (l === 'crit' ? `Air terlalu panas (${HC.util.fmt(s.temperature, 1)}°C).` : `Suhu air mulai tinggi (${HC.util.fmt(s.temperature, 1)}°C).`),
    waterLevel: (s) => `Air tinggal ${Math.round(s.waterLevel)}%.`,
    pump: () => 'Pompa tidak aktif. Aliran air berhenti.',
  };
  function watchAlerts() {
    if (HC.store.get('settings').offline) return;
    ['A', 'B'].forEach((sys) => {
      const s = HC.sim.snapshot(sys);
      Object.entries(s.levels).forEach(([k, l]) => {
        const key = sys + k;
        const prev = lastLevel[key] || 'ok';
        if (RANK[l] > RANK[prev]) {
          if (sys === 'A') log(l, MSG[k](s, l), l === 'crit' ? 'Status mendesak. Rekomendasi HYCANE diperbarui.' : 'Mendekati batas aman. Rekomendasi HYCANE diperbarui.');
          HC.notify.push({ cat: 'monitoring', sev: l, title: `${HC.data.systems[sys].name}: ${MSG[k](s, l)}`, body: 'Buka Rekomendasi HYCANE untuk langkah yang perlu dilakukan.', link: '#/ai' }, { toast: true });
        } else if (l === 'ok' && prev !== 'ok') {
          if (sys === 'A') log('ok', `${HC.ui.METRICS[k] ? HC.ui.METRICS[k].label : 'Pompa'} kembali normal`, 'Nilai kembali ke rentang aman.');
          HC.notify.push({ cat: 'monitoring', sev: 'ok', title: `${HC.data.systems[sys].name}: ${HC.ui.METRICS[k] ? HC.ui.METRICS[k].label : 'Pompa'} kembali normal.`, body: '', link: '#/monitoring' }, { toast: true });
        }
        lastLevel[key] = l;
      });
    });
  }
  function primeAlerts() {
    ['A', 'B'].forEach((sys) => { const s = HC.sim.snapshot(sys); Object.entries(s.levels).forEach(([k, l]) => { lastLevel[sys + k] = l; }); });
  }

  function resetDemo() {
    HC.store.resetDemo();
    HC.sim.hardReset();
    primeAlerts();
    HC.ui.refreshCounts();
    HC.ui.refreshDevicePill();
    HC.ui.toast('Demo di-reset ke kondisi awal yang sehat', { sev: 'ok', icon: 'refresh' });
    HC.router.go('#/dashboard');
  }

  function start() {
    HC.store.init();
    HC.sim.init();
    routes();
    primeAlerts();

    HC.bus.on('sim:tick', () => { watchAlerts(); HC.ui.refreshDevicePill(); });
    HC.bus.on('sim:event', ({ type, device }) => {
      HC.ui.refreshDevicePill();
      if (device && device !== 'A') return;
      if (HC.sim.EVENTS[type]) log('info', `Simulasi dipicu: ${HC.sim.EVENTS[type].label}`, 'Nilai sensor bergerak bertahap menuju kondisi abnormal.');
      else if (type === 'reset') log('info', 'Reset to Normal', 'Semua parameter dipulihkan bertahap ke kondisi ideal.');
      else if (type && type.startsWith('resolved:')) log('ok', 'Tindakan ditandai selesai', 'Sensor memantau pemulihan secara bertahap.');
    });
    HC.bus.on('store:cart', HC.ui.refreshCounts);
    HC.bus.on('store:notifs', HC.ui.refreshCounts);
    HC.bus.on('sim:minor', ({ device, kind }) => {
      if (device !== 'A') return;
      if (kind === 'refill') log('info', 'Reservoir diisi ulang', 'Pengisian terjadwal (simulasi).');
      if (kind === 'refill') HC.notify.push({ cat: 'monitoring', sev: 'info', title: 'Reservoir diisi ulang', body: 'Pengisian terjadwal (simulasi). Cek ulang TDS & pH.', link: '#/monitoring' });
    });

    HC.sim.start();
    setInterval(() => HC.cart.advanceOrders(), 2500);
    R.start();
  }

  return { start, resetDemo };
})();

document.addEventListener('DOMContentLoaded', () => {
  try { HC.app.start(); } catch (e) {
    console.error(e);
    document.getElementById('app').innerHTML = '<div style="padding:40px;font-family:system-ui"><h1>HYCANE gagal dimuat</h1><p>Muat ulang halaman. Jika masih gagal, hapus data situs (localStorage) lalu coba lagi.</p></div>';
  }
});
