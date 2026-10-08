/* Derived domain values: crop age/stage, live health, plant totals. */
var HC = window.HC || (window.HC = {});

HC.model = (function () {
  const { daysBetween, addDays } = HC.util;

  /* Physical slot codes per rack (A1..D4 for rack A, E1..F3 for rack B), assigned in crop order. */
  function slotMap() {
    const out = {};
    Object.values(HC.data.systems).forEach((sys) => {
      const codes = [];
      sys.rows.forEach((r) => { for (let i = 1; i <= sys.perRow; i++) codes.push(r + i); });
      let k = 0;
      HC.store.get('crops').filter((c) => c.system === sys.id).forEach((c) => { out[c.id] = codes.slice(k, k + c.slots); k += c.slots; });
      out['free-' + sys.id] = codes.slice(k);
    });
    return out;
  }

  function crop(c) {
    const info = HC.data.cropCatalog[c.type] || { name: c.name || c.type, cycle: 40, ph: [5.8, 6.8], ec: [1, 2] };
    const age = Math.max(0, daysBetween(c.plantedAt, new Date()));
    const stage = HC.data.growthStage(age, info.cycle);
    const snap = HC.sim.snapshot(c.system);
    const sysLevel = HC.store.get('settings').offline ? 'ok' : HC.sim.overall(snap);
    // Live stress lowers the displayed score a little: the plant is "at risk", not instantly dead.
    const penalty = sysLevel === 'crit' ? 12 : sysLevel === 'warn' ? 5 : 0;
    const score = Math.max(0, Math.min(100, c.healthScore - penalty));
    const level = score >= 85 && sysLevel === 'ok' ? 'ok' : score < 70 || sysLevel === 'crit' ? 'crit' : 'warn';
    const harvestIn = Math.max(0, info.cycle - age);
    const phOk = snap.ph >= info.ph[0] && snap.ph <= info.ph[1];
    const ecOk = snap.ec >= info.ec[0] && snap.ec <= info.ec[1];
    const codes = slotMap()[c.id] || [];
    return Object.assign({}, c, { info, codes, slotLabel: codes.length > 1 ? `${codes[0]} - ${codes[codes.length - 1]}` : codes[0] || '-', variety: c.variety || '', name: c.name || info.name, image: info.image, age, stage, score, level, sysLevel, snap, harvestIn,
      harvestDate: addDays(new Date(), harvestIn), phOk, ecOk, system: c.system, systemInfo: HC.data.systems[c.system] });
  }

  function plantStats() {
    const crops = HC.store.get('crops');
    const total = crops.reduce((s, c) => s + c.slots, 0);
    const healthy = crops.reduce((s, c) => s + c.healthy, 0);
    const atRisk = HC.store.get('settings').offline ? 0 : crops.filter((c) => HC.sim.overall(HC.sim.snapshot(c.system)) === 'crit').reduce((s, c) => s + c.slots, 0);
    return { total, healthy, atRisk, capacity: Object.values(HC.data.systems).reduce((s, x) => s + x.slots, 0) };
  }

  function eduProgress() {
    const done = HC.store.get('edu').done;
    const n = HC.data.lessons.filter((l) => done[l.slug]).length;
    return { done: n, total: HC.data.lessons.length, pct: Math.round((n / HC.data.lessons.length) * 100) };
  }

  function nextLesson() {
    const done = HC.store.get('edu').done;
    return HC.data.lessons.find((l) => !done[l.slug]) || HC.data.lessons[0];
  }

  return { crop, slotMap, plantStats, eduProgress, nextLesson };
})();
