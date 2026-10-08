/* App state + localStorage persistence + tiny event bus.
   Catalog/lesson data live in /data and are never written to storage. */
var HC = window.HC || (window.HC = {});

HC.bus = (function () {
  const map = {};
  return {
    on(evt, fn) { (map[evt] = map[evt] || new Set()).add(fn); return () => map[evt].delete(fn); },
    emit(evt, payload) { (map[evt] || []).forEach((fn) => { try { fn(payload); } catch (e) { console.error(e); } }); },
  };
})();

HC.store = (function () {
  const PREFIX = 'hycane.v2.';
  const KEYS = ['auth', 'cart', 'orders', 'crops', 'settings', 'notifs', 'edu', 'community', 'sim', 'recs', 'meta', 'journal', 'harvests', 'calib', 'profile', 'simlog', 'sop'];
  const mem = {};

  function read(key) {
    try { const raw = localStorage.getItem(PREFIX + key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function write(key, value) {
    mem[key] = value;
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* storage blocked: keep in memory */ }
  }

  function orderFromSeed(o) {
    const items = o.items.map(([id, qty]) => ({ id, qty, price: HC.pricing.price(id) }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= HC.data.SHIPPING.freeOver ? 0 : HC.data.SHIPPING.flat;
    const created = HC.util.addDays(new Date(), -o.daysAgo).getTime();
    const flow = HC.data.ORDER_FLOW;
    const history = flow.slice(0, flow.indexOf(o.status) + 1).map((s, i) => ({ status: s, at: created + i * 26 * 3600 * 1000 }));
    return { id: o.id, createdAt: created, items, subtotal, shipping, discount: 0, total: subtotal + shipping, status: o.status, history,
      courier: o.courier, resi: o.resi, address: HC.data.user.address, payment: 'Transfer Virtual Account (demo)', seeded: true };
  }

  function defaults() {
    const now = Date.now();
    return {
      cart: [],
      orders: HC.data.seedOrders.map(orderFromSeed),
      crops: HC.data.seedCrops.map((c) => Object.assign({}, c, { plantedAt: HC.util.isoDate(HC.util.addDays(new Date(), -c.plantedDaysAgo)) })),
      settings: { notifMonitoring: true, notifOrders: true, notifEducation: true, sound: false, presenter: false, autoEvents: false, offline: false, lastSeenNotif: 0 },
      notifs: HC.data.seedNotifications.map((n, i) => Object.assign({ id: 'n-seed-' + i, read: i > 1, at: now - n.minsAgo * 60000 }, n)),
      edu: { done: {}, quiz: {} },
      community: { posts: [], replies: {}, liked: {} },
      recs: { done: [] },
      meta: { nextOrder: 1025, mediaChangedAt: HC.util.addDays(new Date(), -HC.data.mediaCycle.changedDaysAgo).getTime() },
      journal: seedJournal(),
      harvests: HC.data.seedHarvests.map((h) => Object.assign({ at: HC.util.addDays(new Date(), -h.daysAgo).getTime() }, h)),
      calib: HC.data.seedCalibrations.map((c) => Object.assign({ at: HC.util.addDays(new Date(), -c.daysAgo).getTime() }, c)),
      profile: { name: HC.data.user.name, email: HC.data.user.email, phone: HC.data.user.phone, address: HC.data.user.address, farm: HC.data.user.farm, level: 'Pemula Tingkat Menengah (Level 2)', install: 'Rooftop NFT 16 lubang + DWC 6 lubang', interval: '2' },
      simlog: [{ at: now - 4000, sev: 'ok', title: 'Sistem operasional normal', body: 'Semua parameter (pH, TDS, suhu, level air) dalam rentang aman.' }],
      sop: {},
    };
  }

  function seedJournal() {
    const out = {};
    HC.data.seedCrops.forEach((c) => {
      const list = HC.data.seedJournal[c.id] || HC.data.seedJournal.default;
      out[c.id] = list.map(([day, title, text, kind]) => {
        const d = day < 0 ? c.plantedDaysAgo : day;
        return { day: d, at: HC.util.addDays(new Date(), -(c.plantedDaysAgo - d)).getTime(), title, text, kind };
      });
    });
    return out;
  }

  function init() {
    const d = defaults();
    KEYS.forEach((k) => { const v = read(k); mem[k] = v !== null ? v : d[k] !== undefined ? d[k] : null; });
    // Fill any missing keys in settings (forward compatible after updates).
    mem.settings = Object.assign({}, d.settings, mem.settings || {});
  }

  const get = (k) => mem[k];
  function set(k, v) { write(k, v); HC.bus.emit('store:' + k, v); }
  function update(k, fn) { const v = fn(structuredCloneSafe(mem[k])); set(k, v); return v; }
  function structuredCloneSafe(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

  /* Reset Demo: restores the healthy seeded state but keeps the session logged in. */
  function resetDemo() {
    const auth = mem.auth;
    KEYS.forEach((k) => { try { localStorage.removeItem(PREFIX + k); } catch (e) { /* ignore */ } });
    const d = defaults();
    Object.keys(d).forEach((k) => write(k, d[k]));
    write('sim', null);
    write('auth', auth);
    KEYS.forEach((k) => HC.bus.emit('store:' + k, mem[k]));
  }

  return { init, get, set, update, resetDemo, write };
})();
