/* Pricing: 30% GROSS margin => sellingPrice = cost / 0.70 (NOT cost * 1.30).
   Rounded UP to a readable retail step, then realized margin is re-checked (>= 30%). */
var HC = window.HC || (window.HC = {});

HC.pricing = (function () {
  const TARGET_MARGIN = 0.30;
  const step = (v) => (v < 10000 ? 100 : v < 100000 ? 500 : v < 1000000 ? 1000 : 5000);

  function retailFromCost(cost) {
    const raw = cost / (1 - TARGET_MARGIN);
    let price = Math.ceil(raw / step(raw)) * step(raw);
    while ((price - cost) / price < TARGET_MARGIN) price += step(price);
    return price;
  }

  const cache = {};
  function costOf(p) {
    if (!p.components) return p.cost;
    return p.components.reduce((s, [id, q]) => s + costOf(HC.data.productById[id]) * q, 0) + (p.allowance || 0);
  }

  function quote(p) {
    if (cache[p.id]) return cache[p.id];
    const benchmarkCost = costOf(p);
    const sellingPrice = retailFromCost(benchmarkCost);
    const grossMargin = (sellingPrice - benchmarkCost) / sellingPrice;
    // Sum of individual component retail prices, to show what the kit saves vs. buying separately.
    const componentsRetail = p.components ? p.components.reduce((s, [id, q]) => s + quote(HC.data.productById[id]).sellingPrice * q, 0) : null;
    return (cache[p.id] = { benchmarkCost, sellingPrice, grossMargin, rawPrice: benchmarkCost / 0.7, componentsRetail });
  }

  const price = (idOrP) => quote(typeof idOrP === 'string' ? HC.data.productById[idOrP] : idOrP).sellingPrice;

  /* Bundle discount is capped so the whole bundle still keeps >= 30% gross margin. */
  function bundleQuote(lines) {
    let subtotal = 0, cost = 0;
    lines.forEach(({ id, qty }) => { const q = quote(HC.data.productById[id]); subtotal += q.sellingPrice * qty; cost += q.benchmarkCost * qty; });
    const wanted = subtotal * 0.05;
    const headroom = Math.max(0, subtotal - cost / (1 - TARGET_MARGIN));
    const discount = Math.floor(Math.min(wanted, headroom) / 500) * 500;
    const total = subtotal - discount;
    return { subtotal, discount, total, cost, margin: total ? (total - cost) / total : 0 };
  }

  return { TARGET_MARGIN, retailFromCost, quote, price, costOf, bundleQuote };
})();
