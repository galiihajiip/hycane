/* Chart.js helpers. One metric per chart (single y-axis), shaded safe band,
   crosshair tooltip, fixed bounded axes so normal sensor noise looks as small as it is.
   Charts are updated in place each tick (no re-creation). */
var HC = window.HC || (window.HC = {});

HC.charts = (function () {
  const { fmt, fmtTime, fmtShortTime } = HC.util;

  const AXIS = {
    ph: { A: [5, 7.6], B: [5, 7.6] },
    tds: { A: [400, 1400], B: [900, 2200] },
    ec: { A: [0.5, 2], B: [1.2, 3.1] },
    temperature: { A: [22, 33], B: [22, 33] },
    waterLevel: { A: [0, 100], B: [0, 100] },
  };

  /* Shaded "normal" band drawn behind the line. */
  const bandPlugin = {
    id: 'safeBand',
    beforeDatasetsDraw(chart, _args, o) {
      if (!o || o.min == null) return;
      const { ctx, chartArea: a, scales: { y } } = chart;
      const top = y.getPixelForValue(Math.min(o.max, y.max));
      const bot = y.getPixelForValue(Math.max(o.min, y.min));
      ctx.save();
      ctx.fillStyle = o.color || 'rgba(22,163,74,0.10)';
      ctx.fillRect(a.left, top, a.right - a.left, bot - top);
      ctx.strokeStyle = 'rgba(22,163,74,0.55)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      [top, bot].forEach((yy) => { if (yy > a.top + 1 && yy < a.bottom - 1) { ctx.beginPath(); ctx.moveTo(a.left, yy); ctx.lineTo(a.right, yy); ctx.stroke(); } });
      ctx.restore();
    },
  };

  /* Vertical crosshair at the hovered index. */
  const crosshair = {
    id: 'crosshair',
    afterDatasetsDraw(chart) {
      const act = chart.tooltip && chart.tooltip.getActiveElements();
      if (!act || !act.length) return;
      const x = act[0].element.x, { ctx, chartArea: a } = chart;
      ctx.save(); ctx.strokeStyle = 'rgba(36,51,44,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); ctx.stroke(); ctx.restore();
    },
  };

  function bandFor(metric, sys) {
    const th = HC.sim.THRESH[sys];
    if (metric === 'ec') return { min: th.tds.warn[0] / HC.sim.EC_FACTOR, max: th.tds.warn[1] / HC.sim.EC_FACTOR };
    const t = th[metric];
    return t ? { min: t.warn[0], max: Math.min(t.warn[1], 100) } : null;
  }

  function create(canvas, metric, sys = 'A', opts = {}) {
    if (!window.Chart) { canvas.parentElement.innerHTML = '<p class="muted small">Grafik tidak dapat dimuat.</p>'; return { update() {}, destroy() {} }; }
    const meta = HC.ui.METRICS[metric];
    const hist = HC.sim.history(sys);
    const [min, max] = AXIS[metric][sys];
    const digits = meta.digits;
    const ctx = canvas.getContext('2d');
    const h = canvas.parentElement.clientHeight || 200;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexA(meta.color, 0.18)); grad.addColorStop(1, hexA(meta.color, 0));

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hist.map((p) => p.t),
        datasets: [{
          data: hist.map((p) => p[metric]), borderColor: meta.color, backgroundColor: grad, fill: true,
          borderWidth: opts.spark ? 2 : 3, tension: 0.4, pointRadius: (c) => (c.dataIndex === c.dataset.data.length - 1 ? (opts.spark ? 3 : 6) : 0),
          pointBackgroundColor: meta.color, pointBorderColor: '#fff', pointBorderWidth: opts.spark ? 1.5 : 3, pointHoverRadius: 5, pointHitRadius: 12,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 450, easing: 'easeOutCubic' },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: opts.spark ? { top: 4, right: 4, bottom: 4, left: 2 } : { top: 8, right: 10 } },
        scales: opts.spark ? { x: { display: false }, y: { display: false, min, max } } : {
          x: { type: 'category', grid: { display: false }, border: { display: false },
            ticks: { color: '#6b7a73', font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: opts.compact ? 3 : 5, callback(v) { return fmtTime(this.getLabelForValue(v)); } } },
          y: { min, max, grid: { color: 'rgba(36,51,44,0.07)' }, border: { display: false },
            ticks: { color: '#6b7a73', font: { size: 11 }, maxTicksLimit: 5, callback: (v) => fmt(v, metric === 'ph' || metric === 'ec' ? 1 : 0) } },
        },
        plugins: {
          legend: { display: false },
          safeBand: bandFor(metric, sys),
          tooltip: {
            backgroundColor: '#0b1c30', padding: 10, cornerRadius: 8, displayColors: false,
            titleFont: { weight: '600' },
            callbacks: {
              title: (items) => 'Pukul ' + fmtTime(items[0].label),
              label: (item) => `${meta.label}: ${fmt(item.parsed.y, digits)}${meta.unit ? ' ' + meta.unit : ''}`,
            },
          },
        },
      },
      plugins: [bandPlugin, crosshair],
    });

    function update() {
      const hs = HC.sim.history(sys);
      chart.data.labels = hs.map((p) => p.t);
      chart.data.datasets[0].data = hs.map((p) => p[metric]);
      chart.update();
    }
    return { chart, update, destroy: () => chart.destroy() };
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  if (window.Chart) {
    Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue('--font').trim() || 'system-ui, sans-serif';
  }

  return { create };
})();
