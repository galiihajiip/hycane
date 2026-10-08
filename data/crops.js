/* Seed crops, growing systems, journals and harvest history.
   Ideal ranges are general references for the demo, not agronomic prescriptions. */
var HC = window.HC || (window.HC = {});
HC.data = HC.data || {};

HC.data.systems = {
  A: { id: 'A', name: 'Rak Sayur Daun', type: 'NFT', device: 'HYCANE-001', slots: 16, rows: ['A', 'B', 'C', 'D'], perRow: 4, deviceName: 'HYCANE Smart Kit #01', tankL: 20,
    targets: { ph: [5.8, 6.8], tds: [650, 1100], temperature: [22, 29.5], water: [40, 100] } },
  B: { id: 'B', name: 'Rak Tanaman Buah', type: 'DWC', device: 'HYCANE-002', slots: 6, rows: ['E', 'F'], perRow: 3, deviceName: 'HYCANE Sensor Pack #02', tankL: 40,
    targets: { ph: [5.8, 6.8], tds: [1150, 1900], temperature: [22, 29.5], water: [40, 100] } },
};

var HC_STITCH_DIR = 'assets/images/stitch/';
HC.data.cropCatalog = {
  pakcoy: { name: 'Pakcoy', latin: 'Brassica rapa subsp. chinensis', image: HC_STITCH_DIR + 's02-01.jpg', cycle: 30, ph: [6.0, 7.0], ec: [1.0, 2.0], seed: 'seed-pakcoy', gramPerPlant: 190,
    gallery: [[5, HC_STITCH_DIR + 's06-08.jpg', 'Semai di plug ampas tebu'], [12, HC_STITCH_DIR + 's06-09.jpg', 'Pindah ke pipa NFT'], [18, HC_STITCH_DIR + 's06-10.jpg', 'Fase vegetatif aktif'], [24, HC_STITCH_DIR + 's06-11.jpg', 'Vegetatif akhir']] },
  lettuce: { name: 'Selada', latin: 'Lactuca sativa', image: HC_STITCH_DIR + 's02-02.jpg', cycle: 40, ph: [5.8, 6.5], ec: [0.8, 1.4], seed: 'seed-lettuce', gramPerPlant: 160 },
  kangkung: { name: 'Kangkung', latin: 'Ipomoea aquatica', image: HC_STITCH_DIR + 's02-03.jpg', cycle: 28, ph: [5.5, 6.5], ec: [1.0, 2.0], seed: 'seed-kangkung', gramPerPlant: 120 },
  tomato: { name: 'Tomat Cherry', latin: 'Solanum lycopersicum var. cerasiforme', image: HC_STITCH_DIR + 's02-04.jpg', cycle: 90, ph: [5.8, 6.5], ec: [2.0, 3.5], seed: 'seed-tomato', gramPerPlant: 900 },
  chili: { name: 'Cabai Rawit', latin: 'Capsicum frutescens', image: 'assets/images/photos/chili.jpg', cycle: 100, ph: [5.8, 6.5], ec: [1.8, 2.8], seed: 'seed-chili', gramPerPlant: 250 },
  strawberry: { name: 'Stroberi', latin: 'Fragaria × ananassa', image: 'assets/images/photos/strawberry.jpg', cycle: 110, ph: [5.5, 6.5], ec: [1.4, 2.2], seed: 'seed-strawberry', gramPerPlant: 300 },
  caisim: { name: 'Caisim', latin: 'Brassica rapa var. parachinensis', image: HC_STITCH_DIR + 's05-07.jpg', cycle: 35, ph: [6.0, 7.0], ec: [1.2, 2.0], seed: 'seed-caisim', gramPerPlant: 150 },
  spinach: { name: 'Bayam', latin: 'Amaranthus spp.', image: HC_STITCH_DIR + 's16-35.jpg', cycle: 28, ph: [6.0, 7.0], ec: [1.2, 2.0], seed: 'seed-spinach', gramPerPlant: 100 },
  basil: { name: 'Basil', latin: 'Ocimum basilicum', image: HC_STITCH_DIR + 's18-40.jpg', cycle: 50, ph: [5.8, 6.8], ec: [1.0, 1.6], seed: 'seed-basil', gramPerPlant: 80 },
};

/* plantedDaysAgo is converted to an absolute date when demo state is first created.
   sick: indexes (0-based) of slots inside this crop that need attention. */
HC.data.seedCrops = [
  { id: 'c-pakcoy', type: 'pakcoy', variety: 'Nauli F1', batch: 1, system: 'A', slots: 4, healthy: 4, sick: [], plantedDaysAgo: 22, healthScore: 92,
    condition: 'Daun tegak, warna hijau merata.', note: 'Pertumbuhan sesuai jadwal. Siapkan panen dalam ± 1 minggu.' },
  { id: 'c-lettuce', type: 'lettuce', variety: 'Grand Rapids', batch: 2, system: 'A', slots: 4, healthy: 3, sick: [2], plantedDaysAgo: 18, healthScore: 82,
    condition: '1 tanaman ujung daunnya kecokelatan (tip burn ringan).', note: 'Pantau suhu air dan sirkulasi. Pangkas daun yang rusak.' },
  { id: 'c-kangkung', type: 'kangkung', variety: 'Bangkok', batch: 3, system: 'A', slots: 4, healthy: 4, sick: [], plantedDaysAgo: 12, healthScore: 96,
    condition: 'Tumbuh cepat, batang segar.', note: 'Panen pertama sekitar 2 minggu lagi.' },
  { id: 'c-tomato', type: 'tomato', variety: 'Red Ruby', batch: 4, system: 'B', slots: 2, healthy: 2, sick: [], plantedDaysAgo: 46, healthScore: 90,
    condition: 'Mulai berbunga, tandan pertama terlihat.', note: 'Pasang tali penyangga sebelum buah membesar.' },
  { id: 'c-chili', type: 'chili', variety: 'Rawit', batch: 5, system: 'B', slots: 2, healthy: 1, sick: [1], plantedDaysAgo: 40, healthScore: 74,
    condition: '1 tanaman daun bawahnya menguning.', note: 'Cek pH & kepekatan nutrisi rak buah, lalu buka panduan "Daun menguning".' },
  { id: 'c-strawberry', type: 'strawberry', variety: 'California', batch: 6, system: 'B', slots: 2, healthy: 1, sick: [0], plantedDaysAgo: 34, healthScore: 78,
    condition: '1 tanaman tumbuh lebih lambat dari yang lain.', note: 'Pastikan tajuk (crown) tidak terendam air.' },
];

/* Journal entries: [dayOfCycle, title, text, kind] — kind: rutin | koreksi | mekanis | mulai */
HC.data.seedJournal = {
  'c-pakcoy': [
    [22, 'Pemeliharaan rutin nutrisi', 'Menambah air baku ± 3 liter ke tandon, lalu menambah AB Mix sedikit. TDS kembali ± 880 ppm.', 'rutin'],
    [19, 'Koreksi pH bertahap', 'Rekomendasi HYCANE: pH turun ke 5,6. pH Up ditambahkan sedikit, ditunggu 15 menit, lalu diukur ulang: 6,1.', 'koreksi'],
    [12, 'Pindah ke pipa NFT', 'Bibit dengan 3–4 daun sejati dipindah dari tray semai ke netpot di Rak Sayur Daun (A1–A4).', 'mekanis'],
    [0, 'Semai di plug ampas tebu', 'Benih disemai di plug media ampas tebu yang sudah dilembapkan.', 'mulai'],
  ],
  default: [
    [-1, 'Pemantauan rutin', 'Kondisi air dicek lewat dashboard. Tidak ada tindakan khusus.', 'rutin'],
    [0, 'Mulai tanam', 'Bibit dipindah tanam ke sistem.', 'mulai'],
  ],
};

/* Completed harvests (demo history). */
HC.data.seedHarvests = [
  { id: 'H-003', crop: 'Kangkung Bangkok', daysAgo: 41, plants: 4, kg: 1.15, gradeA: 4, gradeB: 0, gradeC: 0 },
  { id: 'H-002', crop: 'Pakcoy Nauli F1', daysAgo: 76, plants: 4, kg: 0.74, gradeA: 3, gradeB: 1, gradeC: 0 },
  { id: 'H-001', crop: 'Selada Grand Rapids', daysAgo: 118, plants: 4, kg: 0.58, gradeA: 3, gradeB: 1, gradeC: 0 },
];

HC.data.HARVEST_SOP = [
  ['Pantau warna & tekstur daun', 'Daun hijau merata, tegak, tidak layu.'],
  ['H-2: Ganti sebagian larutan dengan air bersih', 'Opsional: menurunkan kepekatan sebelum panen (cek panduan tanaman).'],
  ['H-0: Panen pagi hari', 'Panen sebelum terik agar daun tetap segar.'],
];

HC.data.growthStage = function (age, cycle) {
  const r = age / cycle;
  if (r < 0.18) return { key: 'semai', label: 'Semai', idx: 0, pct: r };
  if (r < 0.42) return { key: 'pindah', label: 'Pindah Tanam', idx: 1, pct: r };
  if (r < 0.75) return { key: 'vegetatif', label: cycle > 60 ? 'Berbunga' : 'Vegetatif', idx: 2, pct: r };
  if (r < 1) return { key: 'pra-panen', label: cycle > 60 ? 'Berbuah' : 'Pra-Panen', idx: 3, pct: r };
  return { key: 'panen', label: 'Siap Panen', idx: 4, pct: 1 };
};
HC.data.STAGES = (cycle) => (cycle > 60
  ? [['Semai', 'Perkecambahan'], ['Pindah Tanam', 'Adaptasi akar'], ['Berbunga', 'Fase generatif'], ['Berbuah', 'Pembesaran buah'], ['Panen', 'Petik bertahap']]
  : [['Semai', 'Perkecambahan'], ['Pindah Tanam', 'Daun sejati 3–4'], ['Vegetatif', 'Daun melebar'], ['Pra-Panen', 'Persiapan panen'], ['Panen', 'Siap petik']]);
