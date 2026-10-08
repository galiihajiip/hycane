/* Hash router: #/path/:param. Guards auth, cleans up the previous view (timers, charts,
   subscriptions) and shows the Error State if a view throws while rendering. */
var HC = window.HC || (window.HC = {});

HC.router = (function () {
  const routes = [];
  let cleanup = null;
  let current = null;

  function add(pattern, view, opts = {}) {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ pattern, re, keys, view, opts });
  }

  function match(path) {
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) return { route: r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
    }
    return null;
  }

  const go = (hash) => { if (location.hash === hash) resolve(); else location.hash = hash; };
  const back = (fallback) => { if (history.length > 1) history.back(); else go(fallback); };

  function resolve() {
    let path = (location.hash || '').replace(/^#/, '').split('?')[0] || '/dashboard';
    const authed = !!(HC.store.get('auth') && HC.store.get('auth').loggedIn);
    if (!authed && path !== '/login') { location.replace('#/login'); return; }
    if (authed && path === '/login') { location.replace('#/dashboard'); return; }
    if (path === '/education') { location.replace('#/learn'); return; }

    if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
    cleanup = null;

    const found = match(path) || match('/state/notfound');
    current = { path, params: found.params, route: found.route };
    const { view, opts } = found.route;

    if (opts.bare) HC.ui.unmountShell(); else HC.ui.ensureShell();
    // Swap in a fresh outlet node so listeners attached by the previous view (or a previous
    // visit to this view) are dropped instead of accumulating.
    const oldOutlet = opts.bare ? document.getElementById('app') : document.getElementById('view');
    const outlet = oldOutlet.cloneNode(false);
    oldOutlet.replaceWith(outlet);
    try {
      outlet.innerHTML = view.render(found.params);
      const title = typeof opts.title === 'function' ? opts.title(found.params) : opts.title;
      if (!opts.bare) HC.ui.setPage(title || 'HYCANE', opts.nav || null, !!opts.back);
      document.title = (title ? title + ' · ' : '') + 'HYCANE';
      if (view.mount) cleanup = view.mount(outlet, found.params) || null;
    } catch (e) {
      console.error('[view error]', e);
      outlet.innerHTML = HC.views.states.render({ kind: 'error', detail: String(e && e.message || e) });
      if (HC.views.states.mount) HC.views.states.mount(outlet, { kind: 'error' });
    }
    if (!opts.keepScroll) window.scrollTo(0, 0);
    const h = outlet.querySelector('h1');
    if (h && !opts.bare) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    HC.bus.emit('route', current);
  }

  function start() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return { add, go, back, start, resolve, current: () => current };
})();
