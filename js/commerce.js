/* Cart, checkout, demo order lifecycle and reorder. No real payment. */
var HC = window.HC || (window.HC = {});

HC.cart = (function () {
  const P = () => HC.data.productById;

  /* Cart line: { k, id, qty, bundle? }. Bundle lines stay grouped so the bundle discount applies. */
  const keyOf = (id, bundle) => id + (bundle ? '@' + bundle : '');

  function add(id, qty = 1, opts = {}) {
    const p = P()[id];
    if (!p) return;
    const k = keyOf(id, opts.bundle);
    HC.store.update('cart', (c) => {
      const line = c.find((l) => l.k === k);
      if (line) line.qty = Math.min(99, line.qty + qty); else c.push({ k, id, qty, bundle: opts.bundle || null });
      return c;
    });
    if (!opts.silent) HC.ui.toast(`${p.name} ditambahkan ke keranjang`, { icon: 'cart', action: { label: 'Lihat', href: '#/cart' } });
  }
  function addMany(lines, label, opts = {}) {
    lines.forEach(([id, qty]) => add(id, qty, { silent: true, bundle: opts.bundle }));
    HC.ui.toast(label || `${lines.length} produk ditambahkan ke keranjang`, { icon: 'cart', action: { label: 'Lihat', href: '#/cart' } });
  }
  function setQty(k, qty) {
    HC.store.update('cart', (c) => (qty <= 0 ? c.filter((l) => l.k !== k) : c.map((l) => (l.k === k ? Object.assign(l, { qty: Math.min(99, qty) }) : l))));
  }
  const remove = (k) => setQty(k, 0);
  const removeBundle = (b) => HC.store.update('cart', (c) => c.filter((l) => l.bundle !== b));
  const clear = () => HC.store.set('cart', []);
  const count = () => HC.store.get('cart').reduce((s, l) => s + l.qty, 0);

  function totals(lines = HC.store.get('cart')) {
    const subtotal = lines.reduce((s, l) => s + HC.pricing.price(l.id) * l.qty, 0);
    const bundles = [...new Set(lines.filter((l) => l.bundle).map((l) => l.bundle))];
    const discount = bundles.reduce((s, b) => s + HC.pricing.bundleQuote(lines.filter((l) => l.bundle === b)).discount, 0);
    const shipping = subtotal === 0 || bundles.length || subtotal >= HC.data.SHIPPING.freeOver ? 0 : HC.data.SHIPPING.flat;
    return { subtotal, discount, shipping, total: subtotal - discount + shipping, hasBundle: bundles.length > 0 };
  }

  function checkout({ address, payment, note, courier, shipping, email }) {
    const lines = HC.store.get('cart');
    if (!lines.length) return null;
    const t = totals(lines);
    const meta = HC.store.get('meta');
    const id = 'HC' + meta.nextOrder;
    HC.store.set('meta', Object.assign({}, meta, { nextOrder: meta.nextOrder + 1 }));
    const now = Date.now();
    const order = {
      id, createdAt: now, items: lines.map((l) => ({ id: l.id, qty: l.qty, price: HC.pricing.price(l.id), bundle: l.bundle || null })),
      subtotal: t.subtotal, shipping: shipping != null ? shipping : t.shipping, discount: t.discount, total: t.subtotal - t.discount + (shipping != null ? shipping : t.shipping), status: 'Diproses',
      history: [{ status: 'Diproses', at: now }], address, payment, note, email, courier: courier || 'Ekspedisi reguler (demo)', resi: 'HYC' + String(now).slice(-10), demo: true,
    };
    HC.store.update('orders', (o) => [order].concat(o));
    clear();
    HC.notify.push({ cat: 'orders', sev: 'info', title: `Pesanan #${id} berhasil dibuat`, body: 'Status: Diproses. Status akan berjalan otomatis untuk demo.', link: '#/orders/' + id }, { toast: false });
    // Media refill bought => reset the reorder reminder clock.
    if (order.items.some((i) => i.id.startsWith('media-'))) HC.store.update('meta', (m) => Object.assign(m, { mediaChangedAt: now }));
    return order;
  }

  /* Demo lifecycle: Diproses -> Dikemas -> Dikirim -> Selesai, advancing every ~7 s. */
  const STEP_MS = 7000;
  function advanceOrders() {
    const flow = HC.data.ORDER_FLOW;
    let changed = null;
    HC.store.update('orders', (orders) => orders.map((o) => {
      if (!o.demo || o.status === 'Selesai') return o;
      const last = o.history[o.history.length - 1];
      if (Date.now() - last.at < STEP_MS) return o;
      const next = flow[flow.indexOf(o.status) + 1];
      o.status = next; o.history.push({ status: next, at: Date.now() });
      changed = o;
      return o;
    }));
    if (changed) {
      const msg = { Dikemas: 'sedang dikemas', Dikirim: 'telah dikirim', Selesai: 'telah diterima. Pesanan selesai' }[changed.status];
      HC.notify.push({ cat: 'orders', sev: changed.status === 'Selesai' ? 'ok' : 'info', title: `Pesanan #${changed.id} ${msg}`, body: changed.status === 'Selesai' ? 'Butuh lagi? Gunakan tombol "Beli Lagi" di detail pesanan.' : 'Lacak status di menu Pesanan.', link: '#/orders/' + changed.id }, { toast: true });
    }
  }
  function speedUp(id) {
    HC.store.update('orders', (orders) => orders.map((o) => {
      if (o.id === id && o.status !== 'Selesai') o.history[o.history.length - 1].at -= STEP_MS;
      return o;
    }));
    advanceOrders();
  }

  function reorder(orderId) {
    const o = HC.store.get('orders').find((x) => x.id === orderId);
    if (!o) return;
    addMany(o.items.map((i) => [i.id, i.qty]), `Isi pesanan #${o.id} ditambahkan ke keranjang`);
  }

  return { add, addMany, setQty, remove, removeBundle, clear, count, totals, checkout, advanceOrders, speedUp, reorder };
})();

HC.notify = (function () {
  function push(n, opts = {}) {
    const settings = HC.store.get('settings');
    const catOn = { monitoring: settings.notifMonitoring, recommendation: settings.notifMonitoring, orders: settings.notifOrders, education: settings.notifEducation }[n.cat];
    const item = Object.assign({ id: HC.util.uid('n'), at: Date.now(), read: false }, n);
    HC.store.update('notifs', (list) => [item].concat(list).slice(0, 60));
    if (opts.toast && catOn !== false) HC.ui.toast(n.title, { sev: n.sev, icon: n.sev === 'crit' ? 'octagon' : n.sev === 'warn' ? 'alert' : n.cat === 'orders' ? 'truck' : 'bell', action: n.link ? { label: 'Buka', href: n.link } : null });
    return item;
  }
  const unread = () => HC.store.get('notifs').filter((n) => !n.read).length;
  const markAll = () => HC.store.update('notifs', (l) => l.map((n) => Object.assign(n, { read: true })));
  const markRead = (id) => HC.store.update('notifs', (l) => l.map((n) => (n.id === id ? Object.assign(n, { read: true }) : n)));
  return { push, unread, markAll, markRead };
})();
