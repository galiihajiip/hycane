/* Sensor simulation engine.
   Each reservoir is a set of mean-reverting bounded random walks:
     next = current + clampStep(k * (target - current)) + small noise
   - pH: slow oscillating drift around baseline
   - TDS: falls slowly with nutrient uptake, occasional top-up; EC is derived from TDS
   - Temperature: compressed "day" sine cycle, max 0.2 °C per tick
   - Water level: falls with consumption + evaporation (faster when warm), periodic refill
   Events move a value gradually toward an abnormal target (no instant jumps). */
var HC = window.HC || (window.HC = {});

HC.sim = (function () {
  const { clamp, makeRng } = HC.util;
  const TICK_MS = 2000;
  const HISTORY = 90; // 3 minutes of points at 2 s
  const EC_FACTOR = 704; // 880 ppm <-> 1.25 mS/cm (matches the device's conversion)

  const THRESH = {
    A: { ph: { warn: [5.8, 6.8], crit: [5.5, 7.2] }, tds: { warn: [650, 1100], crit: [550, 1250] }, temperature: { warn: [20, 29.5], crit: [18, 31] }, waterLevel: { warn: [40, 101], crit: [25, 101] } },
    B: { ph: { warn: [5.8, 6.8], crit: [5.5, 7.2] }, tds: { warn: [1150, 1900], crit: [1000, 2100] }, temperature: { warn: [20, 29.5], crit: [18, 31] }, waterLevel: { warn: [40, 101], crit: [25, 101] } },
  };

  const BASE = {
    A: { ph: 6.2, tds: 880, temperature: 26.4, waterLevel: 78, flow: 2.4, seed: 20261 },
    B: { ph: 6.1, tds: 1480, temperature: 26.0, waterLevel: 72, flow: 1.8, seed: 20262 },
  };

  /* Event definitions: which metric, target value and the max change per tick. */
  const EVENTS = {
    highPH: { label: 'pH tinggi', metric: 'ph', target: 7.45, cap: 0.08, opposite: 'lowPH' },
    lowPH: { label: 'pH rendah', metric: 'ph', target: 5.15, cap: 0.08, opposite: 'highPH' },
    highTDS: { label: 'TDS tinggi', metric: 'tds', target: 1330, cap: 24, opposite: 'lowTDS' },
    lowTDS: { label: 'TDS rendah', metric: 'tds', target: 500, cap: 24, opposite: 'highTDS' },
    highTemp: { label: 'Suhu tinggi', metric: 'temperature', target: 31.8, cap: 0.2 },
    lowWater: { label: 'Air rendah', metric: 'waterLevel', target: 21, cap: 3.6 },
    pumpFail: { label: 'Pompa mati', metric: 'pump' },
  };

  const devices = {};
  let timer = null;
  let tickCount = 0;
  let nextAutoEventAt = 0;

  function gauss(rng) { // approx. normal(0,1) from 3 uniforms
    return (rng() + rng() + rng() - 1.5) * 2;
  }

  function makeDevice(id) {
    const b = BASE[id];
    return {
      id, rng: makeRng(b.seed), t: 0,
      truth: { ph: b.ph, tds: b.tds, temperature: b.temperature, waterLevel: b.waterLevel, flow: b.flow },
      reading: null,
      tdsBase: b.tds, tdsUptake: 0,
      refill: 0, nutrientDose: 0,
      pumpOn: true, lightOn: true,
      events: {}, recovering: {},
      sensorHealth: { ph: 98, tds: 96, temperature: 99, waterLevel: 97 },
      history: [], timestamp: Date.now(),
    };
  }

  /* Move `cur` toward `target` with proportional gain k, but never more than `cap` per tick. */
  const approach = (cur, target, k, cap) => cur + clamp((target - cur) * k, -cap, cap);

  function step(d) {
    const b = BASE[d.id], r = d.rng, T = d.truth;
    d.t += TICK_MS / 1000;

    /* --- pH --- */
    const phTarget = b.ph + 0.07 * Math.sin((2 * Math.PI * d.t) / 260) + 0.03 * Math.sin((2 * Math.PI * d.t) / 71);
    const phEv = d.events.highPH ? EVENTS.highPH : d.events.lowPH ? EVENTS.lowPH : null;
    if (phEv) T.ph = approach(T.ph, phEv.target, 0.12, phEv.cap) + gauss(r) * 0.006;
    else T.ph = approach(T.ph, phTarget, d.recovering.ph ? 0.18 : 0.08, d.recovering.ph ? 0.09 : 0.03) + gauss(r) * 0.006;

    /* --- TDS (nutrient uptake + occasional dose) --- */
    d.tdsUptake += 0.12;
    if (d.tdsUptake > 45 && !d.events.lowTDS && !d.events.highTDS) { d.tdsUptake = 0; d.nutrientDose = 55; HC.bus.emit('sim:minor', { device: d.id, kind: 'dose' }); }
    if (d.nutrientDose > 0) { const add = Math.min(d.nutrientDose, 4); d.nutrientDose -= add; d.tdsUptake -= add; }
    // Less water with the same dissolved salts => a more concentrated solution (and refills dilute it).
    const concentration = clamp(Math.pow(b.waterLevel / Math.max(T.waterLevel, 10), 0.15), 0.95, 1.3);
    const tdsTarget = (d.tdsBase - d.tdsUptake + 14 * Math.sin((2 * Math.PI * d.t) / 330)) * concentration;
    const tdsEv = d.events.highTDS ? EVENTS.highTDS : d.events.lowTDS ? EVENTS.lowTDS : null;
    if (tdsEv) T.tds = approach(T.tds, tdsEv.target, 0.1, tdsEv.cap) + gauss(r) * 2;
    else T.tds = approach(T.tds, tdsTarget, d.recovering.tds ? 0.2 : 0.07, d.recovering.tds ? 35 : 8) + gauss(r) * 2;

    /* --- Temperature (compressed day cycle ~7 min) --- */
    let tempTarget = b.temperature + 0.45 * Math.sin((2 * Math.PI * d.t) / 420);
    if (!d.pumpOn) tempTarget += 1.1; // stagnant water warms up
    if (d.events.highTemp) T.temperature = approach(T.temperature, EVENTS.highTemp.target, 0.08, EVENTS.highTemp.cap) + gauss(r) * 0.01;
    else T.temperature = approach(T.temperature, tempTarget, d.recovering.temperature ? 0.15 : 0.05, d.recovering.temperature ? 0.2 : (d.pumpOn ? 0.04 : 0.05)) + gauss(r) * 0.01;

    /* --- Water level --- */
    const evap = 0.03 * (1 + Math.max(0, T.temperature - 26) * 0.12);
    if (d.events.lowWater) {
      T.waterLevel = approach(T.waterLevel, EVENTS.lowWater.target, 0.12, EVENTS.lowWater.cap);
    } else if (d.refill > 0) {
      const add = Math.min(d.refill, 2.5); d.refill -= add; T.waterLevel += add;
    } else {
      T.waterLevel -= evap;
      if (T.waterLevel < 60 && !d.recovering.waterLevel) { d.refill = b.waterLevel + 4 - T.waterLevel; HC.bus.emit('sim:minor', { device: d.id, kind: 'refill' }); }
    }
    if (d.recovering.waterLevel) { d.refill = Math.max(0, b.waterLevel - T.waterLevel); delete d.recovering.waterLevel; }
    // Topping up with fresh water dilutes the solution slightly (correlation).
    T.waterLevel = clamp(T.waterLevel, 5, 100);

    /* --- Pump / flow --- */
    T.flow = d.pumpOn ? approach(T.flow, b.flow + gauss(r) * 0.03, 0.4, 0.3) : approach(T.flow, 0, 0.6, 1);

    /* Clear recovery flags once values are back near baseline. */
    if (d.recovering.ph && Math.abs(T.ph - b.ph) < 0.12) delete d.recovering.ph;
    if (d.recovering.tds && Math.abs(T.tds - (d.tdsBase - d.tdsUptake)) < 40) delete d.recovering.tds;
    if (d.recovering.temperature && Math.abs(T.temperature - b.temperature) < 0.6) delete d.recovering.temperature;

    T.ph = clamp(T.ph, 3.5, 9); T.tds = clamp(T.tds, 150, 2600); T.temperature = clamp(T.temperature, 16, 36);

    /* Sensor reading = truth + small sensor noise, then EMA smoothing (what a firmware would show). */
    const raw = {
      ph: T.ph + gauss(r) * 0.008,
      tds: T.tds + gauss(r) * 2.5,
      temperature: T.temperature + gauss(r) * 0.02,
      waterLevel: T.waterLevel + gauss(r) * 0.12,
    };
    const prev = d.reading || raw;
    const a = 0.55;
    const rd = {
      ph: prev.ph + a * (raw.ph - prev.ph),
      tds: prev.tds + a * (raw.tds - prev.tds),
      temperature: prev.temperature + a * (raw.temperature - prev.temperature),
      waterLevel: prev.waterLevel + a * (raw.waterLevel - prev.waterLevel),
    };
    rd.ec = rd.tds / EC_FACTOR + gauss(r) * 0.002;
    rd.flow = Math.max(0, T.flow);
    d.reading = rd;

    if (tickCount % 15 === 0) Object.keys(d.sensorHealth).forEach((k) => { d.sensorHealth[k] = clamp(d.sensorHealth[k] + (r() - 0.5) * 0.4, 95.5, 99.5); });

    d.timestamp = Date.now();
    d.history.push({ t: d.timestamp, ph: rd.ph, tds: rd.tds, ec: rd.ec, temperature: rd.temperature, waterLevel: rd.waterLevel });
    if (d.history.length > HISTORY) d.history.shift();
  }

  /* Pre-fill the chart history so it ends exactly at the healthy defaults
     (pH 6.2, TDS 880, 26.4 °C, water 78%): sine phases end at 0, uptake ends at 0. */
  function warmUp(d) {
    const now = Date.now();
    d.t = -HISTORY * (TICK_MS / 1000);
    d.tdsUptake = -HISTORY * 0.12;
    d.truth.waterLevel = BASE[d.id].waterLevel + HISTORY * 0.03;
    for (let i = 0; i < HISTORY; i++) step(d);
    d.reading = Object.assign({}, d.reading, { ph: BASE[d.id].ph, tds: BASE[d.id].tds, temperature: BASE[d.id].temperature, waterLevel: BASE[d.id].waterLevel, ec: BASE[d.id].tds / EC_FACTOR });
    Object.assign(d.truth, { ph: BASE[d.id].ph, tds: BASE[d.id].tds, temperature: BASE[d.id].temperature, waterLevel: BASE[d.id].waterLevel });
    Object.assign(d.history[d.history.length - 1], { ph: d.reading.ph, tds: d.reading.tds, ec: d.reading.ec, temperature: d.reading.temperature, waterLevel: d.reading.waterLevel });
    d.history.forEach((p, i) => { p.t = now - (HISTORY - 1 - i) * TICK_MS; });
  }

  /* ---------------- persistence ---------------- */
  function serialize() {
    const out = { savedAt: Date.now(), devices: {} };
    Object.values(devices).forEach((d) => {
      out.devices[d.id] = { truth: d.truth, reading: d.reading, tdsBase: d.tdsBase, tdsUptake: d.tdsUptake, refill: d.refill, pumpOn: d.pumpOn,
        events: d.events, recovering: d.recovering, sensorHealth: d.sensorHealth, history: d.history, t: d.t };
    });
    return out;
  }
  const save = () => HC.store.set('sim', serialize());

  function restore(saved) {
    Object.keys(BASE).forEach((id) => {
      const d = makeDevice(id);
      const s = saved && saved.devices && saved.devices[id];
      if (s && s.history && s.history.length) {
        Object.assign(d, { truth: s.truth, reading: s.reading, tdsBase: s.tdsBase, tdsUptake: s.tdsUptake, refill: s.refill || 0, pumpOn: s.pumpOn,
          events: s.events || {}, recovering: s.recovering || {}, sensorHealth: s.sensorHealth, history: s.history, t: s.t || 0 });
        // Re-time history so the chart stays continuous after a refresh.
        const now = Date.now();
        d.history.forEach((p, i) => { p.t = now - (d.history.length - 1 - i) * TICK_MS; });
        d.rng = makeRng(BASE[id].seed + Math.floor(d.t));
      } else warmUp(d);
      devices[id] = d;
    });
  }

  /* ---------------- loop ---------------- */
  function tick() {
    const offline = HC.store.get('settings').offline;
    tickCount++;
    if (!offline) Object.values(devices).forEach(step);
    maybeAutoEvent();
    if (tickCount % 3 === 0) save();
    HC.bus.emit('sim:tick', { offline });
  }

  function maybeAutoEvent() {
    if (!HC.store.get('settings').autoEvents) return;
    const now = Date.now();
    if (!nextAutoEventAt) { nextAutoEventAt = now + 45000 + Math.random() * 75000; return; }
    if (now < nextAutoEventAt) return;
    const A = devices.A;
    const active = Object.keys(A.events);
    if (active.length) { active.forEach((e) => resolve(e)); } else trigger(['lowWater', 'highTDS', 'highTemp', 'highPH'][Math.floor(Math.random() * 4)], { auto: true });
    nextAutoEventAt = now + 45000 + Math.random() * 75000;
  }

  function start() {
    if (timer) return;
    timer = setInterval(tick, TICK_MS);
  }
  function stop() { clearInterval(timer); timer = null; }

  /* ---------------- controls (Demo Tools) ---------------- */
  function trigger(type, opts = {}) {
    const d = devices[opts.device || 'A'];
    const ev = EVENTS[type];
    if (!ev) return;
    if (type === 'pumpFail') { d.pumpOn = false; d.events.pumpFail = true; d.refill = 0; d.truth.waterLevel = clamp(d.truth.waterLevel + 2, 0, 100); }
    else {
      if (ev.opposite) delete d.events[ev.opposite];
      d.events[type] = true;
      delete d.recovering[ev.metric];
    }
    save();
    HC.bus.emit('sim:event', { type, device: d.id, auto: !!opts.auto });
  }

  /* Resolve one event: the value recovers gradually (as it would after the user acts). */
  function resolve(type, deviceId = 'A') {
    const d = devices[deviceId];
    const ev = EVENTS[type];
    if (!ev) return;
    delete d.events[type];
    if (type === 'pumpFail') { d.pumpOn = true; d.recovering.temperature = true; }
    else d.recovering[ev.metric] = true;
    if (type === 'lowWater') { d.recovering.waterLevel = true; d.recovering.tds = true; }
    save();
    HC.bus.emit('sim:event', { type: 'resolved:' + type, device: d.id });
  }

  function resetNormal(deviceId = 'A') {
    const d = devices[deviceId];
    Object.keys(d.events).forEach((e) => resolve(e, deviceId));
    d.pumpOn = true;
    ['ph', 'tds', 'temperature', 'waterLevel'].forEach((m) => (d.recovering[m] = true));
    save();
    HC.bus.emit('sim:event', { type: 'reset', device: d.id });
  }

  /* Hard reset used by "Reset Demo": instantly back to the healthy seeded baseline. */
  function hardReset() {
    Object.keys(BASE).forEach((id) => { const d = makeDevice(id); warmUp(d); devices[id] = d; });
    save();
    HC.bus.emit('sim:tick', { offline: false });
    HC.bus.emit('sim:event', { type: 'hardreset' });
  }

  function togglePump(deviceId = 'A') {
    const d = devices[deviceId];
    if (d.pumpOn) trigger('pumpFail', { device: deviceId }); else resolve('pumpFail', deviceId);
  }

  /* ---------------- status helpers ---------------- */
  const SHOWN = { ph: 100, tds: 1, temperature: 10, waterLevel: 1 };
  function levelOf(systemId, metric, raw) {
    const th = THRESH[systemId][metric];
    const v = Math.round(raw * SHOWN[metric]) / SHOWN[metric]; // judge the value the user actually sees
    if (v < th.crit[0] || v > th.crit[1]) return 'crit';
    if (v < th.warn[0] || v > th.warn[1]) return 'warn';
    return 'ok';
  }

  function snapshot(id = 'A') {
    const d = devices[id];
    const rd = d.reading;
    return {
      id, ph: rd.ph, tds: rd.tds, ec: rd.ec, temperature: rd.temperature, waterLevel: rd.waterLevel, flow: rd.flow,
      pumpOn: d.pumpOn, lightOn: d.lightOn, sensorHealth: d.sensorHealth, timestamp: d.timestamp, events: Object.assign({}, d.events),
      levels: {
        ph: levelOf(id, 'ph', rd.ph), tds: levelOf(id, 'tds', rd.tds), temperature: levelOf(id, 'temperature', rd.temperature),
        waterLevel: levelOf(id, 'waterLevel', rd.waterLevel), pump: d.pumpOn ? 'ok' : 'crit',
      },
    };
  }

  function overall(snap) {
    const v = Object.values(snap.levels);
    return v.includes('crit') ? 'crit' : v.includes('warn') ? 'warn' : 'ok';
  }

  const history = (id = 'A') => devices[id].history;

  function init() { restore(HC.store.get('sim')); }

  return { init, start, stop, trigger, resolve, resetNormal, hardReset, togglePump, snapshot, overall, history, THRESH, EVENTS, TICK_MS, EC_FACTOR, devices };
})();
