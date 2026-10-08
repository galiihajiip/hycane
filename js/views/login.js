/* 01 Login — demo credentials only, no backend. Layout from Stitch 01_login. */
var HC = window.HC || (window.HC = {});
HC.views = HC.views || {};

HC.views.login = {
  render() {
    const auth = HC.store.get('auth') || {};
    const icon = HC.icon;
    const s = HC.sim.snapshot('A');
    return `<div class="login">
      <div class="login-card">
        <section class="login-side" aria-hidden="true">
          <img src="assets/images/stitch/s01-login-bg.jpg" alt="" class="login-photo">
          <div class="login-side-top">
            <span class="glass-pill">${icon('leaf')}FESTAFORA 2026 • Business Plan</span>
            <span class="glass-pill dark"><span class="dot"></span>IoT Aktif</span>
          </div>
          <div class="live-bed">
            <div class="row-between"><span class="label-sm">Live Bed Sensor</span><span class="pill pill-ok"><span class="dot"></span>Optimal</span></div>
            <div class="live-bed-vals"><div><small>pH Air</small><b>${HC.util.fmt(s.ph, 1)}</b></div><div><small>PPM</small><b>${HC.util.fmt(s.tds)}</b></div><div><small>Suhu</small><b>${HC.util.fmt(s.temperature, 1)}°C</b></div></div>
          </div>
          <div class="login-side-copy"><img src="${HC.ui.LOGO_WHITE}" alt="" class="login-side-logo">
            <div class="eyebrow light">Presisi • Berkelanjutan • Terpandu</div>
            <p class="login-quote">Tanam lebih mudah karena tahu apa yang harus dilakukan.</p>
            <div class="login-feats"><span>${icon('recycle')}Media Ampas Tebu</span><span>${icon('wifi')}Telemetri IoT Real-time</span><span>${icon('sparkles')}Rekomendasi Terarah</span></div>
          </div>
        </section>
        <section class="login-main">
          <form class="login-form" id="login-form" novalidate>
            <div class="login-brand"><img src="${HC.ui.LOGO}" alt="HYCANE" class="login-logo"><small>Smart Hydroponic Operating System</small></div>
            <div><h1>Selamat datang.</h1><p class="muted login-lead">Kelola hidroponikmu, pahami kondisinya, dan tahu apa yang harus dilakukan tiap harinya.</p></div>
            <div class="judge-box">
              <div class="judge-head">${icon('award')}<div><b>Mode Penjurian FESTAFORA 2026</b><p>Data sensor IoT disimulasikan, riwayat tanam & katalog sudah disiapkan untuk evaluasi langsung.</p></div></div>
              <button class="judge-btn" type="button" id="demo-btn">${icon('sparkles')}<span>Gunakan Akun Demo Juri</span><span class="pill pill-solid">Instan</span></button>
            </div>
            <div class="field">
              <label for="email">Email Operator / Juri</label>
              <div class="input-wrap">${icon('mail')}<input id="email" name="email" type="email" autocomplete="username" placeholder="demo@hycane.id" value="${HC.util.esc(auth.remember ? auth.email || '' : '')}" required></div>
            </div>
            <div class="field">
              <div class="row-between"><label for="password">Kata Sandi</label><button type="button" class="link-btn link-blue small" id="help-btn">Bantuan login?</button></div>
              <div class="input-wrap">${icon('lock')}<input class="has-btn" id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required>
                <button type="button" class="input-btn" id="toggle-pw" aria-label="Tampilkan kata sandi" aria-pressed="false">${icon('eye')}</button></div>
              <p class="hint" id="help-text" hidden>Akun demo: <b>demo@hycane.id</b> / <b>hycane2026</b>. Tidak ada reset kata sandi di demo ini.</p>
            </div>
            <label class="check"><input type="checkbox" id="remember" ${auth.remember !== false ? 'checked' : ''}><span>Ingat saya di perangkat ini</span></label>
            <p class="form-error" id="login-error" role="alert" hidden></p>
            <button class="btn btn-primary btn-lg btn-block" type="submit" id="login-btn">Masuk ke Dashboard${icon('arrowRight')}</button>
            <div class="login-foot"><span>${icon('cloud')}Bekerja offline & online</span><span>${icon('recycle')}Ampas tebu sirkular</span><span>${icon('sprout')}Dibuat untuk pemula</span></div>
          </form>
        </section>
      </div>
    </div>`;
  },

  mount(root) {
    const { $ } = HC.util;
    const form = $('#login-form', root), err = $('#login-error', root), pw = $('#password', root), em = $('#email', root);
    const tog = $('#toggle-pw', root);
    tog.addEventListener('click', () => {
      const show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      tog.setAttribute('aria-pressed', String(show));
      tog.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      tog.innerHTML = HC.icon(show ? 'eyeOff' : 'eye');
    });
    $('#help-btn', root).addEventListener('click', () => { const h = $('#help-text', root); h.hidden = !h.hidden; });
    const login = () => {
      const { email, password } = HC.data.DEMO_CREDENTIALS;
      if (!em.value.trim() || !pw.value) { err.textContent = 'Isi email dan kata sandi terlebih dahulu.'; err.hidden = false; return; }
      if (em.value.trim().toLowerCase() !== email || pw.value !== password) { err.textContent = 'Email atau kata sandi tidak cocok. Gunakan akun demo juri di atas.'; err.hidden = false; pw.focus(); return; }
      err.hidden = true;
      HC.store.set('auth', { loggedIn: true, email, remember: $('#remember', root).checked, at: Date.now() });
      HC.router.go('#/dashboard');
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); login(); });
    $('#demo-btn', root).addEventListener('click', () => {
      em.value = HC.data.DEMO_CREDENTIALS.email;
      pw.value = HC.data.DEMO_CREDENTIALS.password;
      $('#login-btn', root).innerHTML = 'Masuk sebagai Galih…';
      setTimeout(login, 350);
    });
  },
};
