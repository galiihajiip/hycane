/* Shared helpers: math, formatting (id-ID), DOM. */
var HC = window.HC || (window.HC = {});

HC.util = (function () {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Seedable PRNG (mulberry32) so the simulation is repeatable between reloads.
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const nf = (digits) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const fmt = (v, digits = 0) => nf(digits).format(v);
  const rupiah = (v) => 'Rp' + nf(0).format(Math.round(v));

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => { d = new Date(d); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtTime = (d) => { d = new Date(d); return `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`; };
  const fmtShortTime = (d) => { d = new Date(d); return `${pad(d.getHours())}.${pad(d.getMinutes())}`; };
  const daysBetween = (a, b) => Math.floor((new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0)) / 86400000);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const isoDate = (d) => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  function timeAgo(ts) {
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 45) return 'baru saja';
    if (s < 3600) return `${Math.round(s / 60)} menit lalu`;
    if (s < 86400) return `${Math.round(s / 3600)} jam lalu`;
    return `${Math.round(s / 86400)} hari lalu`;
  }

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let uidCounter = 0;
  const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

  function greeting(d = new Date()) {
    const h = d.getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  }

  const query = () => new URLSearchParams((location.hash.split('?')[1] || ''));

  return { query, clamp, makeRng, fmt, rupiah, fmtDate, fmtTime, fmtShortTime, daysBetween, addDays, isoDate, timeAgo, esc, $, $$, uid, greeting };
})();
