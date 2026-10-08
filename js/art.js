/* Original flat SVG product illustrations. One consistent style for every catalog item,
   no network dependency, so product cards never show a broken image. */
var HC = window.HC || (window.HC = {});

HC.art = (function () {
  const INK = '#24332c';
  const W = '#ffffff';
  const PVC = '#e9eef0';
  const PVCS = '#b9c5ca';

  const shapes = {
    kit: (a) => `
      <rect x="40" y="96" width="120" height="34" rx="6" fill="${a}" opacity=".18"/>
      <rect x="44" y="70" width="112" height="16" rx="8" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/>
      <rect x="44" y="44" width="112" height="16" rx="8" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/>
      <path d="M52 86v26M148 86v26M52 60v10M148 60v10" stroke="${PVCS}" stroke-width="4"/>
      ${[66, 92, 118, 140].map((x) => `<path d="M${x} 44c-8-10-4-20 2-22 2 8 0 14-2 22zM${x} 44c6-9 14-10 18-6-6 6-12 7-18 6z" fill="#3c9a5f"/>`).join('')}
      ${[70, 100, 130].map((x) => `<path d="M${x} 70c-6-8-3-15 2-17 1 6 0 11-2 17zM${x} 70c5-7 10-8 14-5-4 5-9 6-14 5z" fill="#57b26f"/>`).join('')}
      <rect x="60" y="104" width="80" height="24" rx="4" fill="${a}"/>
      <text x="100" y="120" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="system-ui">HYCANE</text>`,
    sensorpack: (a) => `
      <rect x="38" y="40" width="124" height="86" rx="10" fill="${W}" stroke="${a}" stroke-width="3"/>
      <rect x="52" y="54" width="10" height="56" rx="5" fill="${INK}"/><circle cx="57" cy="112" r="7" fill="#9fb3bb"/>
      <rect x="78" y="54" width="10" height="50" rx="5" fill="#2e5d8f"/><rect x="77" y="100" width="12" height="10" rx="2" fill="#cfd8dc"/>
      <rect x="104" y="54" width="8" height="54" rx="4" fill="#444"/><rect x="103" y="98" width="10" height="16" rx="3" fill="#b0bec5"/>
      <rect x="124" y="64" width="28" height="18" rx="3" fill="#1e88e5"/><circle cx="131" cy="73" r="5" fill="#cfd8dc"/><circle cx="145" cy="73" r="5" fill="#cfd8dc"/>`,
    plumbingpack: (a) => `
      <rect x="30" y="62" width="100" height="18" rx="9" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/>
      <path d="M130 62h14a10 10 0 0 1 10 10v30" fill="none" stroke="${PVCS}" stroke-width="20" stroke-linecap="round"/>
      <path d="M130 62h14a10 10 0 0 1 10 10v30" fill="none" stroke="${PVC}" stroke-width="15" stroke-linecap="round"/>
      <circle cx="62" cy="112" r="16" fill="none" stroke="${a}" stroke-width="6"/>
      <rect x="92" y="100" width="34" height="22" rx="5" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/>`,
    maintenance: (a) => `
      <rect x="36" y="58" width="128" height="70" rx="10" fill="${a}" opacity=".9"/>
      <rect x="80" y="46" width="40" height="14" rx="5" fill="none" stroke="${a}" stroke-width="5"/>
      <rect x="54" y="78" width="22" height="34" rx="4" fill="${W}"/><rect x="58" y="72" width="14" height="8" rx="2" fill="${W}"/>
      <path d="M96 84l20 20M116 84l-20 20" stroke="${W}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="140" cy="95" r="12" fill="none" stroke="${W}" stroke-width="5"/>`,
    media: (a) => `
      ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => {
        const x = 46 + c * 28 + (r % 2) * 6, y = 50 + r * 26;
        return `<rect x="${x}" y="${y}" width="24" height="22" rx="4" fill="#d8c08f" stroke="#b39461" stroke-width="2"/>
                <path d="M${x + 4} ${y + 6}l14 2M${x + 5} ${y + 12}l12-1M${x + 4} ${y + 17}l15 1" stroke="#a7834d" stroke-width="1.4"/>
                <circle cx="${x + 12}" cy="${y + 11}" r="3" fill="#8c6a3a"/>`;
      }).join('')).join('')}
      <path d="M100 42c-6-12 0-22 8-24 1 10-2 16-8 24z" fill="${a}"/>`,
    bottle: (a, o) => `
      <rect x="74" y="34" width="22" height="12" rx="3" fill="${INK}"/>
      <rect x="64" y="44" width="42" height="84" rx="10" fill="${W}" stroke="${PVCS}" stroke-width="2"/>
      <rect x="68" y="70" width="34" height="40" rx="4" fill="${a}"/>
      <text x="85" y="95" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="system-ui">${o.mark || 'A'}</text>
      <rect x="114" y="34" width="22" height="12" rx="3" fill="${INK}"/>
      <rect x="104" y="44" width="42" height="84" rx="10" fill="${W}" stroke="${PVCS}" stroke-width="2"/>
      <rect x="108" y="70" width="34" height="40" rx="4" fill="${o.accent2 || '#2f6fb0'}"/>
      <text x="125" y="95" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="system-ui">${o.mark2 || 'B'}</text>`,
    dropper: (a, o) => `
      <rect x="88" y="26" width="24" height="16" rx="6" fill="${INK}"/>
      <path d="M94 42h12v6H94z" fill="${INK}"/>
      <rect x="74" y="48" width="52" height="82" rx="12" fill="${W}" stroke="${PVCS}" stroke-width="2"/>
      <rect x="78" y="74" width="44" height="40" rx="5" fill="${a}"/>
      <text x="100" y="99" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="system-ui">${o.mark || 'pH'}</text>`,
    sachet: (a, o) => `
      <path d="M58 40h84l-6 90H64z" fill="${W}" stroke="${PVCS}" stroke-width="2"/>
      <path d="M58 40h84v10H58z" fill="${a}"/>
      <rect x="72" y="66" width="56" height="36" rx="4" fill="${a}" opacity=".18"/>
      <text x="100" y="90" text-anchor="middle" font-size="15" font-weight="800" fill="${a}" font-family="system-ui">${o.mark || '6.86'}</text>`,
    seed: (a, o) => `
      <rect x="62" y="30" width="76" height="102" rx="6" fill="${W}" stroke="${PVCS}" stroke-width="2"/>
      <rect x="62" y="30" width="76" height="16" rx="6" fill="${a}"/>
      <circle cx="100" cy="82" r="24" fill="${o.fruit || a}" opacity="${o.fruit ? 1 : .9}"/>
      <path d="M100 58c-4-10 2-16 8-16-1 8-3 12-8 16z" fill="#3c9a5f"/>
      ${o.leafy ? '<path d="M86 86c6-16 22-18 28-14-4 14-16 20-28 14z" fill="#d6f2d9" opacity=".7"/>' : '<circle cx="92" cy="76" r="5" fill="#fff" opacity=".45"/>'}
      <rect x="72" y="112" width="56" height="8" rx="4" fill="${a}" opacity=".25"/>`,
    pipe: (a, o) => `
      <rect x="22" y="${80 - (o.d || 22) / 2}" width="156" height="${o.d || 22}" rx="${(o.d || 22) / 2}" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/>
      <ellipse cx="170" cy="80" rx="${(o.d || 22) / 4}" ry="${(o.d || 22) / 2 - 1}" fill="#cfd8dc"/>
      ${[52, 86, 120].map((x) => `<ellipse cx="${x}" cy="${80 - (o.d || 22) / 2 + 2}" rx="9" ry="3" fill="#9aa9af"/>`).join('')}
      <rect x="22" y="${80 + (o.d || 22) / 2 + 12}" width="156" height="4" rx="2" fill="${a}" opacity=".25"/>
      <text x="100" y="${80 + (o.d || 22) / 2 + 32}" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}" font-family="system-ui">${o.mark || ''}</text>`,
    elbow: () => `<path d="M60 56h44a24 24 0 0 1 24 24v44" fill="none" stroke="${PVCS}" stroke-width="34" stroke-linecap="butt"/><path d="M60 56h44a24 24 0 0 1 24 24v44" fill="none" stroke="${PVC}" stroke-width="29"/>`,
    tjoint: () => `<path d="M40 64h120" stroke="${PVCS}" stroke-width="34"/><path d="M40 64h120" stroke="${PVC}" stroke-width="29"/><path d="M100 64v62" stroke="${PVCS}" stroke-width="34"/><path d="M100 70v56" stroke="${PVC}" stroke-width="29"/>`,
    cap: () => `<rect x="62" y="46" width="76" height="70" rx="10" fill="${PVC}" stroke="${PVCS}" stroke-width="3"/><ellipse cx="100" cy="116" rx="38" ry="10" fill="#cfd8dc" stroke="${PVCS}" stroke-width="2"/>`,
    reducer: () => `<path d="M40 52h50l30 16v24l-30 16H40z" fill="${PVC}" stroke="${PVCS}" stroke-width="3"/><rect x="118" y="66" width="44" height="28" rx="4" fill="${PVC}" stroke="${PVCS}" stroke-width="3"/>`,
    socket: () => `<rect x="50" y="56" width="100" height="48" rx="8" fill="${PVC}" stroke="${PVCS}" stroke-width="3"/><path d="M80 56v48M120 56v48" stroke="${PVCS}" stroke-width="2"/>`,
    valve: (a) => `<rect x="36" y="70" width="128" height="22" rx="6" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/><rect x="80" y="62" width="40" height="38" rx="6" fill="#cfd8dc" stroke="${PVCS}" stroke-width="2"/><rect x="96" y="40" width="8" height="24" fill="${INK}"/><rect x="70" y="34" width="60" height="10" rx="5" fill="${a}"/>`,
    connector: () => `<rect x="40" y="68" width="50" height="24" rx="4" fill="${PVC}" stroke="${PVCS}" stroke-width="2"/><path d="M90 72h50l14 4v8l-14 4H90z" fill="#cfd8dc" stroke="${PVCS}" stroke-width="2"/><path d="M104 72v16M116 72v16M128 72v16" stroke="${PVCS}" stroke-width="2"/>`,
    tubing: (a) => `<circle cx="100" cy="82" r="44" fill="none" stroke="#a7d8de" stroke-width="12" opacity=".9"/><circle cx="100" cy="82" r="30" fill="none" stroke="#a7d8de" stroke-width="12" opacity=".7"/><path d="M144 82h26" stroke="#a7d8de" stroke-width="12" stroke-linecap="round"/><circle cx="100" cy="82" r="10" fill="${a}" opacity=".25"/>`,
    hose: (a) => `<circle cx="100" cy="82" r="46" fill="none" stroke="${a}" stroke-width="13"/><circle cx="100" cy="82" r="30" fill="none" stroke="${a}" stroke-width="13" opacity=".8"/><circle cx="100" cy="82" r="14" fill="#cfd8dc"/>`,
    clamp: () => `<circle cx="100" cy="80" r="36" fill="none" stroke="#9aa9af" stroke-width="9"/><circle cx="100" cy="80" r="36" fill="none" stroke="#e0e6e8" stroke-width="5" stroke-dasharray="4 4"/><rect x="128" y="64" width="30" height="20" rx="3" fill="#9aa9af"/><rect x="148" y="70" width="18" height="8" rx="2" fill="#777"/>`,
    netpot: (a) => `<path d="M58 48h84l-12 70H70z" fill="#2f3b36"/><path d="M66 60h68M68 74h64M71 88h58M73 102h54" stroke="#56645e" stroke-width="5"/><path d="M84 52v62M100 52v64M116 52v62" stroke="#1d2622" stroke-width="3"/><ellipse cx="100" cy="48" rx="46" ry="7" fill="#3a4842"/>`,
    reservoir: (a) => `<rect x="42" y="48" width="116" height="80" rx="8" fill="#37474f"/><rect x="42" y="40" width="116" height="14" rx="4" fill="#455a64"/><rect x="50" y="78" width="100" height="44" rx="4" fill="${a}" opacity=".35"/><path d="M50 80c10-5 20 5 30 0s20-5 30 0 20 5 40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`,
    tray: (a) => `<rect x="30" y="66" width="140" height="56" rx="6" fill="#2f3b36"/>${[0, 1, 2, 3, 4].map((c) => [0, 1].map((r) => `<rect x="${38 + c * 27}" y="${72 + r * 24}" width="22" height="20" rx="3" fill="#43524b"/>`).join('')).join('')}${[0, 2, 4].map((c) => `<path d="M${49 + c * 27} 72c-4-12 2-18 8-20-1 10-3 14-8 20z" fill="${a}"/>`).join('')}`,
    board: (a) => `<rect x="46" y="54" width="108" height="56" rx="4" fill="#1f2a2e"/><rect x="58" y="62" width="40" height="34" rx="3" fill="#c0c7c9"/><rect x="62" y="66" width="32" height="26" rx="2" fill="#9ea7aa"/>${Array.from({ length: 15 }, (_, i) => `<rect x="${50 + i * 7}" y="50" width="3" height="6" fill="#d4af37"/><rect x="${50 + i * 7}" y="108" width="3" height="6" fill="#d4af37"/>`).join('')}<rect x="132" y="72" width="16" height="20" rx="2" fill="#bfc7ca"/><circle cx="114" cy="96" r="3" fill="${a}"/><text x="118" y="84" font-size="9" fill="#cfd8dc" font-family="system-ui">${'ESP32'}</text>`,
    probe: (a) => `<rect x="94" y="22" width="12" height="70" rx="6" fill="${INK}"/><path d="M94 92h12l-2 26h-8z" fill="#7a8b92"/><circle cx="100" cy="122" r="7" fill="#c7d3d8" stroke="#7a8b92" stroke-width="2"/><path d="M100 22c0-10 30-6 40 2" stroke="${INK}" stroke-width="3" fill="none"/><rect x="130" y="20" width="34" height="22" rx="3" fill="${a}"/><circle cx="140" cy="31" r="3" fill="#fff"/><circle cx="152" cy="31" r="3" fill="#fff"/>`,
    tdsprobe: (a) => `<rect x="84" y="40" width="32" height="60" rx="5" fill="#2e5d8f"/><rect x="88" y="100" width="6" height="22" fill="#b0bec5"/><rect x="106" y="100" width="6" height="22" fill="#b0bec5"/><rect x="128" y="56" width="40" height="26" rx="3" fill="${a}"/><path d="M116 66h12" stroke="${INK}" stroke-width="3"/>`,
    thermo: (a) => `<path d="M40 50c40-10 60 20 80 6s20-12 30-6" stroke="${INK}" stroke-width="4" fill="none"/><rect x="146" y="44" width="10" height="70" rx="5" fill="#b0bec5"/><circle cx="151" cy="118" r="8" fill="${a}"/><rect x="28" y="44" width="16" height="12" rx="2" fill="#555"/>`,
    ultrasonic: (a) => `<rect x="40" y="52" width="120" height="56" rx="4" fill="#1e88e5"/><circle cx="72" cy="80" r="20" fill="#cfd8dc" stroke="#90a4ae" stroke-width="3"/><circle cx="128" cy="80" r="20" fill="#cfd8dc" stroke="#90a4ae" stroke-width="3"/><circle cx="72" cy="80" r="9" fill="#78909c"/><circle cx="128" cy="80" r="9" fill="#78909c"/>${[0, 1, 2, 3].map((i) => `<rect x="${86 + i * 8}" y="108" width="3" height="12" fill="#d4af37"/>`).join('')}`,
    relay: (a) => `<rect x="44" y="50" width="112" height="62" rx="4" fill="#1565c0"/><rect x="58" y="60" width="44" height="34" rx="3" fill="#29b6f6"/><rect x="112" y="64" width="34" height="22" rx="2" fill="#2e7d32"/><circle cx="120" cy="75" r="3" fill="#ddd"/><circle cx="138" cy="75" r="3" fill="#ddd"/><circle cx="66" cy="102" r="3" fill="${a}"/>`,
    lcd: () => `<rect x="34" y="50" width="132" height="62" rx="4" fill="#1b5e20"/><rect x="46" y="60" width="108" height="40" rx="2" fill="#8bc34a"/><text x="54" y="77" font-size="11" font-family="monospace" fill="#1b3a10">pH 6.2 TDS880</text><text x="54" y="93" font-size="11" font-family="monospace" fill="#1b3a10">T26.4 W78%</text>`,
    adapter: (a) => `<rect x="62" y="40" width="58" height="70" rx="10" fill="${INK}"/><rect x="74" y="28" width="6" height="14" fill="#b0bec5"/><rect x="102" y="28" width="6" height="14" fill="#b0bec5"/><path d="M92 110c0 20 30 20 50 10" stroke="${INK}" stroke-width="5" fill="none"/><text x="91" y="80" text-anchor="middle" font-size="12" font-weight="700" fill="#cfd8dc" font-family="system-ui">12V</text>`,
    perfboard: () => `<rect x="44" y="44" width="112" height="76" rx="4" fill="#c9a66b"/>${Array.from({ length: 8 }, (_, r) => Array.from({ length: 12 }, (_, c) => `<circle cx="${54 + c * 9}" cy="${52 + r * 9}" r="2" fill="#8d6e3f"/>`).join('')).join('')}`,
    connkit: (a) => `${[0, 1, 2, 3, 4].map((i) => `<path d="M${50 + i * 22} 42c0 40 ${i % 2 ? 20 : -10} 50 ${10} 84" stroke="${['#e53935', '#212121', '#fbc02d', '#1e88e5', '#43a047'][i]}" stroke-width="4" fill="none"/>`).join('')}<rect x="44" y="34" width="112" height="10" rx="3" fill="#333"/>`,
    enclosure: (a) => `<rect x="48" y="44" width="104" height="80" rx="10" fill="#cfd8dc" stroke="#90a4ae" stroke-width="3"/><rect x="58" y="54" width="84" height="60" rx="6" fill="#eceff1"/>${[56, 144].map((x) => `<circle cx="${x}" cy="52" r="3" fill="#90a4ae"/><circle cx="${x}" cy="116" r="3" fill="#90a4ae"/>`).join('')}<rect x="92" y="122" width="16" height="10" rx="2" fill="#78909c"/><path d="M100 70l-8 16h16l-8 16" stroke="${a}" stroke-width="3" fill="none"/>`,
    pump: (a) => `<rect x="54" y="62" width="76" height="58" rx="10" fill="${INK}"/><rect x="62" y="70" width="60" height="42" rx="6" fill="#3e4c47"/>${[0, 1, 2, 3].map((i) => `<rect x="${68 + i * 13}" y="76" width="6" height="30" rx="3" fill="#56645e"/>`).join('')}<rect x="130" y="80" width="22" height="16" rx="3" fill="${a}"/><rect x="150" y="76" width="10" height="24" rx="3" fill="${a}"/><path d="M92 62c0-20 30-30 50-24" stroke="${INK}" stroke-width="4" fill="none"/>`,
    airpump: (a) => `<rect x="50" y="58" width="100" height="64" rx="18" fill="#eceff1" stroke="#b0bec5" stroke-width="3"/><circle cx="100" cy="90" r="16" fill="${a}" opacity=".25"/><circle cx="100" cy="90" r="6" fill="${a}"/><path d="M150 78c20 0 20-30 0-34" stroke="#a7d8de" stroke-width="5" fill="none"/>`,
    airstone: (a) => `<rect x="60" y="92" width="80" height="22" rx="11" fill="#6d7a80"/>${[70, 86, 100, 114, 128].map((x, i) => `<circle cx="${x}" cy="${78 - (i % 2) * 14}" r="${4 + (i % 3)}" fill="none" stroke="${a}" stroke-width="2"/>`).join('')}<path d="M140 103h22" stroke="#a7d8de" stroke-width="5"/>`,
    solenoid: (a) => `<rect x="40" y="88" width="120" height="22" rx="5" fill="#cfd8dc" stroke="#90a4ae" stroke-width="2"/><rect x="76" y="46" width="48" height="44" rx="5" fill="${INK}"/><rect x="84" y="54" width="32" height="10" rx="2" fill="${a}"/><path d="M90 46v-10M110 46v-10" stroke="#d4af37" stroke-width="3"/>`,
    meter: (a, o) => `<rect x="80" y="20" width="40" height="112" rx="12" fill="${W}" stroke="#b0bec5" stroke-width="3"/><rect x="86" y="34" width="28" height="22" rx="3" fill="#cfe8d6"/><text x="100" y="50" text-anchor="middle" font-size="10" font-weight="700" fill="${INK}" font-family="monospace">${o.mark || '6.2'}</text><circle cx="100" cy="74" r="6" fill="${a}"/><rect x="88" y="110" width="24" height="24" rx="4" fill="#90a4ae"/>`,
    cup: (a) => `<path d="M64 40h72l-8 86H72z" fill="#e3f2fd" stroke="#90caf9" stroke-width="3"/><path d="M70 80h60l-4 44H74z" fill="${a}" opacity=".35"/>${[56, 72, 88, 104].map((y) => `<path d="M68 ${y}h12" stroke="#64b5f6" stroke-width="2"/>`).join('')}`,
    syringe: (a) => `<rect x="44" y="72" width="94" height="22" rx="4" fill="#e3f2fd" stroke="#90caf9" stroke-width="3"/><rect x="48" y="76" width="50" height="14" fill="${a}" opacity=".4"/><path d="M138 83h24" stroke="#90a4ae" stroke-width="4"/><path d="M20 83h24M20 70v26" stroke="#78909c" stroke-width="5"/>`,
    scale: (a) => `<rect x="44" y="70" width="112" height="46" rx="8" fill="#eceff1" stroke="#b0bec5" stroke-width="3"/><rect x="52" y="58" width="96" height="14" rx="4" fill="#cfd8dc"/><rect x="76" y="84" width="48" height="18" rx="3" fill="#263238"/><text x="100" y="98" text-anchor="middle" font-size="11" fill="#8bc34a" font-family="monospace">12.5g</text>`,
    scissors: (a) => `<circle cx="70" cy="104" r="14" fill="none" stroke="${a}" stroke-width="6"/><circle cx="104" cy="112" r="14" fill="none" stroke="${a}" stroke-width="6"/><path d="M80 94l70-58M94 100l60-48" stroke="#90a4ae" stroke-width="6" stroke-linecap="round"/>`,
    labels: (a) => `${[0, 1, 2].map((i) => `<path d="M${64 + i * 26} 40h16v62l-8 14-8-14z" fill="${[a, '#fbc02d', '#64b5f6'][i]}"/>`).join('')}`,
  };

  function render(kind, opts = {}) {
    const a = opts.accent || '#1f8a5b';
    const fn = shapes[kind] || shapes.kit;
    const bg = opts.bg || '#eef6f1';
    return `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${HC.util.esc(opts.alt || 'Ilustrasi produk')}" preserveAspectRatio="xMidYMid meet"><rect width="200" height="160" fill="${bg}"/>${fn(a, opts)}</svg>`;
  }

  return { render };
})();
