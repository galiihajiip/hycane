/* HYCANE demo catalog.
   cost = benchmarkCost (Rp). Selling price is derived in js/pricing.js as cost / 0.70, rounded up.
   sourceType:
     'marketplace-benchmark'  -> observed Shopee listing from 07_MARKETPLACE_CATALOG.md / seed_demo_catalog.csv
     'internal-estimate'      -> no verified listing yet; research_status 'needs-validation'
     'hycane-bom'             -> HYCANE kit: sum of component costs + assembly allowance (internal, needs validation)
   Never add a source URL that was not actually observed. */
var HC = window.HC || (window.HC = {});

HC.data = HC.data || {};

HC.data.categories = [
  { id: 'kit', label: 'HYCANE Kit', icon: 'sprout', blurb: 'Paket siap tanam & paket komponen' },
  { id: 'media', label: 'Media Tanam', icon: 'leaf', blurb: 'Media ampas tebu & refill' },
  { id: 'nutrients', label: 'Nutrisi', icon: 'flask', blurb: 'AB Mix, pH Up/Down, kalibrasi' },
  { id: 'seeds', label: 'Benih', icon: 'sprout', blurb: 'Sayur daun & tanaman buah' },
  { id: 'plumbing', label: 'Pipa & Fitting', icon: 'layers', blurb: 'PVC, sambungan, selang' },
  { id: 'electronics', label: 'Elektronik & Sensor', icon: 'cpu', blurb: 'ESP32, sensor, modul' },
  { id: 'water', label: 'Sistem Air', icon: 'droplet', blurb: 'Pompa, aerator, valve' },
  { id: 'tools', label: 'Alat Ukur & Perkakas', icon: 'wrench', blurb: 'Meter, gelas ukur, timbangan' },
  { id: 'spare', label: 'Spare Part & Wadah', icon: 'package', blurb: 'Netpot, tandon, pengganti' },
];

HC.data.SOURCE_CAPTURE = '2026-10 (riset perencanaan, 07_MARKETPLACE_CATALOG.md)';

(function () {
  const MB = 'marketplace-benchmark', EST = 'internal-estimate', BOM = 'hycane-bom';
  const L = []; // products
  const P = (o) => L.push(Object.assign({ stock: 40, rating: 4.7, sold: 120, beginner: false, specs: [], compatible: [], learn: [], tags: [] }, o));

  /* ---------------- MEDIA (HYCANE own product, production cost not yet validated) ---------------- */
  P({ id: 'media-starter', name: 'Bagasse Growing Media Starter Pack', category: 'media', art: 'media', accent: '#8a6a32', unit: 'pack 12 plug',
    cost: 18000, sourceType: EST, status: 'needs-validation', sourceNote: 'Estimasi biaya produksi internal HYCANE (belum tervalidasi).',
    badge: 'HYCANE', beginner: true, stock: 64, rating: 4.6, sold: 210,
    short: 'Plug media semai dari serat ampas tebu untuk 12 lubang tanam.',
    what: 'Tempat bibit tumbuh dan akar berpegangan saat pertama dipindah ke sistem hidroponik.',
    why: 'Media yang lembap dan berpori membantu bibit berdiri tegak dan akar menemukan air.',
    specs: [['Isi', '12 plug'], ['Bahan', 'Serat ampas tebu (prototipe)'], ['Ukuran', 'Untuk netpot 5 cm'], ['Status uji', 'Kinerja masih divalidasi']],
    replace: 'Ganti setiap siklus tanam (± 30–40 hari untuk sayur daun).', learn: ['ampas-tebu', 'biodegradable'], compatible: ['netpot-50', 'tray-semai'] });
  P({ id: 'media-18', name: 'Bagasse Media Refill 18', category: 'media', art: 'media', accent: '#8a6a32', unit: 'pack 18 plug',
    cost: 15000, sourceType: EST, status: 'needs-validation', sourceNote: 'Estimasi biaya produksi internal HYCANE (belum tervalidasi).',
    badge: 'Refill', beginner: true, stock: 120, rating: 4.7, sold: 486,
    short: 'Isi ulang 18 plug, pas untuk satu siklus HYCANE 18 lubang.',
    what: 'Pengganti media setelah panen agar siklus berikutnya mulai dari media bersih.',
    why: 'Media lama bisa menyimpan sisa akar dan lumut. Media baru menurunkan risiko masalah akar.',
    specs: [['Isi', '18 plug'], ['Bahan', 'Serat ampas tebu (prototipe)'], ['Cocok untuk', 'Netpot 5 cm']],
    replace: 'Setiap siklus tanam.', learn: ['ampas-tebu', 'akar-busuk'], compatible: ['abmix-leafy', 'seed-pakcoy'] });
  P({ id: 'media-36', name: 'Bagasse Media Refill 36', category: 'media', art: 'media', accent: '#8a6a32', unit: 'pack 36 plug',
    cost: 27000, sourceType: EST, status: 'needs-validation', sourceNote: 'Estimasi biaya produksi internal HYCANE (belum tervalidasi).',
    badge: 'Hemat', beginner: true, stock: 80, rating: 4.7, sold: 190,
    short: 'Dua siklus sekaligus, lebih hemat per plug.',
    what: 'Stok media untuk dua kali tanam di sistem 18 lubang.',
    why: 'Stok cadangan membuat jadwal tanam tidak tertunda menunggu kiriman.',
    specs: [['Isi', '36 plug'], ['Bahan', 'Serat ampas tebu (prototipe)']],
    replace: 'Setiap siklus tanam.', learn: ['ampas-tebu'], compatible: ['abmix-leafy'] });

  /* ---------------- NUTRIENTS ---------------- */
  P({ id: 'abmix-leafy', name: 'AB Mix Sayur Daun 1 L', category: 'nutrients', art: 'bottle', accent: '#1f8a5b', unit: 'set A+B 1 L',
    cost: 25000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/NUTRISI-AB-MIX-HIDROPONIK-1-LITER-i.233282073.8510422102',
    badge: 'Terlaris', beginner: true, stock: 150, rating: 4.8, sold: 1320,
    short: 'Nutrisi pekatan A dan B untuk pakcoy, selada, kangkung.',
    what: 'Makanan tanaman dalam bentuk larutan. Bagian A dan B dicampur ke air tandon secara terpisah.',
    why: 'Tanpa tanah, semua unsur hara harus datang dari larutan ini.',
    specs: [['Isi', 'A 500 ml + B 500 ml'], ['Untuk', 'Sayur daun'], ['Pemakaian', 'Ikuti takaran pada label']],
    replace: 'Tambah bertahap saat TDS/EC turun. 1 set umumnya cukup beberapa minggu untuk sistem rumahan.', learn: ['ab-mix', 'tds', 'ec'], compatible: ['meter-set', 'cup-ukur', 'syringe'] });
  P({ id: 'abmix-fruit', name: 'AB Mix Tanaman Buah 1 L', category: 'nutrients', art: 'bottle', accent: '#c2410c', accent2: '#7c3aed', unit: 'set A+B 1 L',
    cost: 30000, sourceType: EST, status: 'needs-validation', beginner: false, stock: 70, rating: 4.7, sold: 260,
    short: 'Formulasi untuk tomat cherry, cabai, stroberi, mentimun.',
    what: 'Nutrisi A+B dengan komposisi untuk fase berbunga dan berbuah.',
    why: 'Tanaman buah butuh larutan lebih pekat dan komposisi berbeda dari sayur daun.',
    specs: [['Isi', 'A 500 ml + B 500 ml'], ['Untuk', 'Tanaman buah']], learn: ['ab-mix'], compatible: ['meter-set'] });
  P({ id: 'ph-up', name: 'pH Up 250 ml', category: 'nutrients', art: 'dropper', accent: '#2563eb', mark: 'pH▲', unit: 'botol',
    cost: 22000, sourceType: EST, status: 'needs-validation', beginner: true, stock: 90, rating: 4.6, sold: 340,
    short: 'Menaikkan pH larutan secara bertahap.',
    what: 'Cairan penyesuai untuk menaikkan pH air yang terlalu asam.',
    why: 'pH terlalu rendah dapat membuat nutrisi tertentu sulit diserap tanaman.',
    specs: [['Isi', '250 ml'], ['Pemakaian', 'Tetes sedikit, aduk, tunggu, ukur ulang']], learn: ['ph'], compatible: ['ph-down', 'meter-set'] });
  P({ id: 'ph-down', name: 'pH Down 250 ml', category: 'nutrients', art: 'dropper', accent: '#dc2626', mark: 'pH▼', unit: 'botol',
    cost: 22000, sourceType: EST, status: 'needs-validation', beginner: true, stock: 90, rating: 4.6, sold: 410,
    short: 'Menurunkan pH larutan secara bertahap.',
    what: 'Cairan penyesuai untuk menurunkan pH air yang terlalu basa.',
    why: 'Air PDAM/sumur sering ber-pH tinggi. Larutan ini membantu membawa pH ke rentang target.',
    specs: [['Isi', '250 ml'], ['Pemakaian', 'Tetes sedikit, aduk, tunggu, ukur ulang']], learn: ['ph'], compatible: ['ph-up', 'meter-set'] });
  P({ id: 'calib', name: 'Larutan Kalibrasi pH 4.00 & 6.86', category: 'nutrients', art: 'sachet', accent: '#0e7490', mark: '4 | 6.86', unit: 'set 2 sachet',
    cost: 12000, sourceType: EST, status: 'needs-validation', beginner: true, stock: 140, rating: 4.7, sold: 520,
    short: 'Agar pembacaan pH meter/sensor tetap akurat.',
    what: 'Larutan dengan pH yang sudah diketahui untuk "menyetel ulang" alat ukur pH.',
    why: 'Alat ukur pH bisa bergeser seiring waktu. Tanpa kalibrasi, angka di layar bisa menyesatkan.',
    specs: [['Isi', 'Buffer pH 4.00 + pH 6.86'], ['Bentuk', 'Bubuk sachet, larutkan ke 250 ml air suling']], replace: 'Kalibrasi tiap 2–4 minggu.', learn: ['ph', 'sensor'], compatible: ['meter-ph', 'sensor-ph'] });
  P({ id: 'cleaner', name: 'Cairan Pembersih Instalasi 500 ml', category: 'nutrients', art: 'dropper', accent: '#0f766e', mark: 'Clean', unit: 'botol',
    cost: 20000, sourceType: EST, status: 'needs-validation', stock: 60, rating: 4.5, sold: 150,
    short: 'Membersihkan tandon dan pipa di antara siklus tanam.',
    what: 'Pembersih untuk menghilangkan lendir, lumut, dan endapan.',
    why: 'Sistem yang bersih menurunkan risiko akar busuk dan lumut di siklus berikutnya.',
    specs: [['Isi', '500 ml'], ['Pemakaian', 'Bilas bersih sebelum diisi larutan baru']], learn: ['lumut', 'menjaga-air'] });

  /* ---------------- SEEDS ---------------- */
  P({ id: 'seed-mix', name: 'Paket Benih Sayur Campur', category: 'seeds', art: 'seed', accent: '#16a34a', leafy: true, unit: 'pack',
    cost: 3000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/Benih-Sayur-Sayuran-Halaman-Rumah-Mudah-di-Tanam-Paket-Lengkap-Tanaman-Hidroponik-Kangkung-Bayam-Brokoli-Cabe-Rawit-Daun-Bawang-Kol-Sawi-Pakcoy-Caisim-Terong-Ungu-Tomat-Sayur-Selada-Wortel-i.384112164.20675929498',
    beginner: true, stock: 300, rating: 4.5, sold: 2100, short: 'Benih eceran berbagai sayur untuk coba-coba.',
    what: 'Benih sayur kemasan kecil.', why: 'Cara murah mencoba beberapa jenis tanaman sebelum fokus ke satu.', specs: [['Isi', '1 jenis per pack (pilih varian)']], learn: ['hidroponik'] });
  const seeds = [
    ['seed-lettuce', 'Benih Selada Hijau', '#22c55e', 8000, true, 'Panen ± 30–40 HST. Pilihan paling ramah pemula.', true],
    ['seed-pakcoy', 'Benih Pakcoy', '#15803d', 6000, true, 'Cepat tumbuh, panen ± 30–35 HST.', true],
    ['seed-kangkung', 'Benih Kangkung', '#4d7c0f', 5000, true, 'Tahan panas, bisa dipanen berulang.', true],
    ['seed-caisim', 'Benih Caisim', '#65a30d', 6000, true, 'Sawi hijau populer, panen ± 35 HST.', true],
    ['seed-spinach', 'Benih Bayam', '#166534', 5000, true, 'Panen muda ± 25–30 HST.', true],
    ['seed-basil', 'Benih Basil', '#059669', 12000, true, 'Herba aromatik, petik pucuk berkala.', true],
    ['seed-mint', 'Benih Mint', '#10b981', 15000, false, 'Perkecambahan lebih lambat; sering diperbanyak dari stek.', true],
    ['seed-tomato', 'Benih Tomat Cherry', '#dc2626', 15000, false, 'Tanaman buah, butuh penyangga & nutrisi buah.', false],
    ['seed-chili', 'Benih Cabai Rawit', '#b91c1c', 10000, false, 'Butuh cahaya penuh dan waktu tanam lebih panjang.', false],
    ['seed-cucumber', 'Benih Mentimun', '#4ade80', 12000, false, 'Merambat, perlu ajir/tali.', false],
    ['seed-strawberry', 'Benih Stroberi', '#e11d48', 20000, false, 'Tantangan lanjut; lebih mudah dari bibit/stolon.', false],
  ];
  seeds.forEach(([id, name, color, cost, beginner, short, leafy]) => P({
    id, name, category: 'seeds', art: 'seed', accent: '#15803d', fruit: color, leafy, unit: 'pack', cost, sourceType: EST, status: 'needs-validation',
    beginner, stock: 100, rating: 4.6, sold: 180, short,
    what: 'Benih untuk disemai di media lembap sebelum dipindah ke sistem.',
    why: 'Benih yang segar dan sesuai musim memberi peluang tumbuh lebih seragam.',
    specs: [['Isi', '± 1 pack eceran'], ['Semai', 'Media lembap, tempat teduh 5–10 hari']], learn: ['hidroponik', 'checklist-pemula'], compatible: ['media-starter', 'tray-semai'] }));

  /* ---------------- PLUMBING ---------------- */
  P({ id: 'pvc-2', name: 'Pipa Hidroponik PVC 2" 50 cm (berlubang)', category: 'plumbing', art: 'pipe', d: 22, mark: '2 inch', unit: 'batang',
    cost: 36100, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/Pipa-Hidroponik-Paralon-PVC-2%E2%80%9D-2.5%E2%80%9D-3%E2%80%9D-4%E2%80%9D-Panjang-50cm-1-Meter-%E2%80%93-Lubang-Tanam-Netpot-5cm-Siap-Pakai-Sistem-NFT-DFT-pot-tower-hidroponik-pot-hidroponik-i.1515669251.53008542732',
    beginner: true, stock: 75, rating: 4.7, sold: 640, short: 'Talang NFT siap pakai dengan lubang netpot 5 cm.',
    what: 'Saluran tempat air bernutrisi mengalir tipis melewati akar.', why: 'Ukuran 2" cocok untuk sayur daun dan sistem rumahan yang ringkas.',
    specs: [['Diameter', '2 inch'], ['Panjang', '50 cm'], ['Lubang', 'Netpot 5 cm']], learn: ['nft'], compatible: ['elbow-2', 'cap-2', 'netpot-50'] });
  P({ id: 'pvc-25', name: 'Pipa Hidroponik PVC 2,5" 50 cm', category: 'plumbing', art: 'pipe', d: 28, mark: '2.5 inch', unit: 'batang',
    cost: 45000, sourceType: EST, status: 'needs-validation', stock: 50, rating: 4.6, sold: 200, short: 'Aliran lebih lega untuk tanaman berakar lebih banyak.',
    what: 'Saluran NFT berdiameter sedang.', why: 'Akar lebih leluasa sehingga aliran tidak mudah tersumbat.', specs: [['Diameter', '2,5 inch'], ['Panjang', '50 cm']], learn: ['nft'] });
  P({ id: 'pvc-3', name: 'Pipa Hidroponik PVC 3" 50 cm', category: 'plumbing', art: 'pipe', d: 34, mark: '3 inch', unit: 'batang',
    cost: 55000, sourceType: EST, status: 'needs-validation', stock: 40, rating: 4.6, sold: 150, short: 'Untuk tanaman besar atau sistem DFT.',
    what: 'Saluran besar yang menampung genangan air lebih banyak.', why: 'Volume air lebih besar membuat suhu dan konsentrasi lebih stabil.', specs: [['Diameter', '3 inch'], ['Panjang', '50 cm']], learn: ['nft', 'dwc'] });
  const fittings = [
    ['elbow-2', 'Elbow / Knee PVC 2"', 'elbow', 6000, 'Membelokkan aliran 90° di ujung talang.'],
    ['tjoint-2', 'T-Joint / Tee PVC 2"', 'tjoint', 8000, 'Membagi aliran ke dua arah.'],
    ['cap-2', 'Dop / End Cap PVC 2"', 'cap', 5000, 'Menutup ujung talang agar air tidak tumpah.'],
    ['reducer', 'Reducer PVC 3" ke 2"', 'reducer', 9000, 'Menyambung pipa beda ukuran.'],
    ['socket-2', 'Sok / Socket PVC 2"', 'socket', 5000, 'Menyambung dua pipa lurus.'],
    ['valve-mini', 'Mini Valve Selang 1/2"', 'valve', 5000, 'Mengatur besar kecil aliran ke tiap talang.'],
    ['connector', 'Konektor Selang ke Pipa', 'connector', 4000, 'Menghubungkan selang pompa ke pipa input.'],
    ['tubing-12', 'Selang Bening 1/2" 5 m', 'tubing', 15000, 'Jalur air dari pompa ke talang.'],
    ['clamp', 'Klem Selang (isi 10)', 'clamp', 15000, 'Mengencangkan sambungan selang agar tidak bocor.'],
  ];
  fittings.forEach(([id, name, art, cost, short]) => P({ id, name, category: 'plumbing', art, unit: 'pcs', cost, sourceType: EST, status: 'needs-validation', stock: 200, rating: 4.6, sold: 300, short,
    what: short, why: 'Sambungan yang tepat mencegah bocor dan aliran yang tidak merata.', specs: [['Material', 'PVC / plastik'], ['Ukuran', 'Lihat nama produk']], learn: ['nft'], compatible: ['pvc-2'] }));
  P({ id: 'hose-58', name: 'Selang Taman 5/8" 20 m', category: 'plumbing', art: 'hose', accent: '#16a34a', unit: 'roll',
    cost: 180000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/EELIC-GAH-A20M-GARDEN-HOSE-SELANG-TAMAN-20-METER-DAN-DIAMETER-SELANG-5-8-SELANG-AIR-MULTIFUNGSI-i.2798689.1644755652',
    stock: 25, rating: 4.8, sold: 95, short: 'Selang panjang untuk mengisi tandon dari keran.',
    what: 'Selang air untuk pengisian dan pembersihan.', why: 'Mengisi ulang tandon jadi lebih cepat tanpa mengangkat ember.', specs: [['Diameter', '5/8 inch'], ['Panjang', '20 m']], learn: ['ketinggian-air'] });

  /* ---------------- ELECTRONICS ---------------- */
  P({ id: 'esp32', name: 'ESP32 DevKit V1', category: 'electronics', art: 'board', accent: '#22c55e', unit: 'unit',
    cost: 75000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/ESP32-DEVKIT-V1-USB-Development-Board-Wifi-Bluetooth-4MB-Flash-i.1242367.44609217298',
    altSources: [{ cost: 98000, url: 'https://shopee.co.id/ESP32-DEVKIT-V1-ESP-32-i.102820752.43328738796' }],
    stock: 45, rating: 4.8, sold: 380, short: 'Otak perangkat HYCANE: membaca sensor & mengirim data via WiFi.',
    what: 'Mikrokontroler kecil yang membaca sensor dan mengirim data ke aplikasi.', why: 'Tanpa ini, data sensor tidak bisa tampil otomatis di dashboard.',
    specs: [['Chip', 'ESP32 dual-core'], ['Konektivitas', 'WiFi + Bluetooth'], ['Flash', '4 MB']], learn: ['iot', 'sensor'], compatible: ['sensor-ph', 'sensor-tds', 'ds18b20'] });
  P({ id: 'sensor-ph', name: 'Sensor pH + Probe (modul analog)', category: 'electronics', art: 'probe', accent: '#1e88e5', unit: 'set',
    cost: 135000, sourceType: EST, status: 'needs-validation', stock: 30, rating: 4.5, sold: 140,
    short: 'Membaca tingkat keasaman air secara terus-menerus.',
    what: 'Probe yang dicelup di tandon dan modul yang mengubah sinyalnya menjadi angka pH.', why: 'pH menentukan apakah nutrisi bisa tersedia dengan baik untuk tanaman.',
    specs: [['Rentang', 'pH 0–14'], ['Perawatan', 'Kalibrasi berkala, jangan biarkan probe kering']], replace: 'Probe umumnya perlu diganti tiap 6–12 bulan, tergantung perawatan.', learn: ['ph', 'sensor'], compatible: ['calib', 'esp32'] });
  P({ id: 'sensor-tds', name: 'Sensor TDS/EC (modul analog)', category: 'electronics', art: 'tdsprobe', accent: '#1e88e5', unit: 'set',
    cost: 70000, sourceType: MB, status: 'researched', sourceUrl: 'https://shopee.co.id/search?keyword=tds%20meter%20arduino',
    sourceNote: 'Benchmark dari halaman hasil pencarian Shopee, bukan satu listing tunggal.',
    stock: 40, rating: 4.6, sold: 210, short: 'Membaca kepekatan larutan nutrisi.',
    what: 'Sensor yang memperkirakan jumlah zat terlarut (nutrisi) di air.', why: 'Membantu tahu kapan nutrisi perlu ditambah atau diencerkan.',
    specs: [['Output', 'Analog'], ['Rentang', '0–1000 ppm (perlu kompensasi suhu)']], learn: ['tds', 'ec', 'sensor'], compatible: ['ds18b20', 'esp32'] });
  P({ id: 'ds18b20', name: 'Sensor Suhu DS18B20 Waterproof', category: 'electronics', art: 'thermo', accent: '#f97316', unit: 'unit',
    cost: 20000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/Sensor-Suhu-Waterproof-DS18B20-Digital-temperature-sensor-Kit-i.39683264.15283599530',
    stock: 80, rating: 4.8, sold: 450, short: 'Mengukur suhu air tandon.',
    what: 'Sensor suhu digital berbungkus logam yang aman dicelup air.', why: 'Air terlalu hangat bisa mengurangi kenyamanan akar. Suhu juga dipakai untuk mengoreksi pembacaan TDS.',
    specs: [['Rentang', '-55 s/d 125 °C'], ['Kabel', '± 1 m']], learn: ['suhu-air', 'akar-busuk'], compatible: ['esp32', 'sensor-tds'] });
  P({ id: 'ultrasonic', name: 'Sensor Ultrasonik Waterproof JSN-SR04T', category: 'electronics', art: 'ultrasonic', accent: '#1e88e5', unit: 'unit',
    cost: 65000, sourceType: EST, status: 'needs-validation', stock: 35, rating: 4.5, sold: 120,
    short: 'Mengukur ketinggian air tandon tanpa menyentuh air.',
    what: 'Sensor yang memantulkan gelombang suara ke permukaan air untuk menghitung jarak.', why: 'Memberi tahu sebelum air habis dan pompa berjalan kering.',
    specs: [['Jarak ukur', '± 25–450 cm'], ['Tahan air', 'Ya (probe)']], learn: ['ketinggian-air', 'sensor'], compatible: ['esp32'] });
  const elec = [
    ['relay', 'Modul Relay 2 Channel 5V', 'relay', 15000, 'Saklar elektronik untuk menyalakan/mematikan pompa dari ESP32.'],
    ['lcd', 'LCD 16x2 + I2C', 'lcd', 35000, 'Menampilkan angka pH/TDS langsung di perangkat, tanpa membuka aplikasi.'],
    ['adapter', 'Adaptor DC 12V 2A', 'adapter', 30000, 'Sumber daya untuk perangkat dan pompa DC.'],
    ['perfboard', 'PCB Perfboard 7×9 cm', 'perfboard', 8000, 'Papan untuk menyolder rangkaian prototipe.'],
    ['connkit', 'Kit Kabel Jumper & Terminal', 'connkit', 20000, 'Kabel dan terminal untuk menyambung sensor.'],
    ['enclosure', 'Box Elektronik Waterproof', 'enclosure', 35000, 'Melindungi rangkaian dari percikan air.'],
  ];
  elec.forEach(([id, name, art, cost, short]) => P({ id, name, category: 'electronics', art, accent: '#1e88e5', unit: 'unit', cost, sourceType: EST, status: 'needs-validation', stock: 60, rating: 4.6, sold: 160, short,
    what: short, why: 'Komponen pendukung agar perangkat monitoring bekerja rapi dan aman.', specs: [['Tipe', 'Komponen elektronik']], learn: ['iot'], compatible: ['esp32'] }));

  /* ---------------- WATER SYSTEM ---------------- */
  P({ id: 'pump-8w', name: 'Pompa Celup Hidroponik 8W 1000 L/jam', category: 'water', art: 'pump', accent: '#0ea5e9', unit: 'unit',
    cost: 30000, sourceType: MB, status: 'researched', sourceUrl: 'https://shopee.co.id/greenv.e.r.d.e',
    sourceNote: 'Benchmark dari halaman toko Shopee (bukan URL listing tunggal).',
    badge: 'Spare', beginner: true, stock: 55, rating: 4.7, sold: 720,
    short: 'Mengalirkan larutan nutrisi dari tandon ke talang.',
    what: 'Pompa yang diletakkan di dalam tandon untuk mendorong air ke instalasi.', why: 'Di sistem NFT, aliran yang berhenti berarti akar kekurangan air dan oksigen.',
    specs: [['Daya', '8 W'], ['Debit maks', '1000 L/jam'], ['Head maks', '± 1 m']], replace: 'Bersihkan saringan tiap 2 minggu.', learn: ['pompa', 'nft'], compatible: ['tubing-12', 'connector'] });
  P({ id: 'pump-dc', name: 'Pompa DC 12V Mini', category: 'water', art: 'pump', accent: '#1e88e5', unit: 'unit',
    cost: 45000, sourceType: EST, status: 'needs-validation', stock: 40, rating: 4.6, sold: 210,
    short: 'Pompa 12V yang bisa dikontrol relay/ESP32.', what: 'Pompa bertegangan rendah untuk sistem smart.', why: 'Lebih aman dekat air dan mudah diatur jadwalnya.',
    specs: [['Tegangan', '12 V DC'], ['Debit', '± 240 L/jam']], learn: ['pompa'], compatible: ['adapter', 'relay'] });
  P({ id: 'air-pump', name: 'Pompa Udara Aerator', category: 'water', art: 'airpump', accent: '#0ea5e9', unit: 'unit',
    cost: 35000, sourceType: EST, status: 'needs-validation', stock: 50, rating: 4.6, sold: 330,
    short: 'Menambah oksigen ke air tandon (wajib untuk DWC).', what: 'Pompa yang meniupkan udara ke air lewat batu aerasi.', why: 'Akar butuh oksigen. Air yang diam dan hangat mudah kekurangan oksigen.',
    specs: [['Output', '1–2 lubang'], ['Daya', '± 3 W']], learn: ['akar-busuk', 'dwc'], compatible: ['air-stone', 'tubing-air'] });
  P({ id: 'air-stone', name: 'Batu Aerasi (Air Stone)', category: 'water', art: 'airstone', accent: '#0ea5e9', unit: 'pcs',
    cost: 8000, sourceType: EST, status: 'needs-validation', stock: 120, rating: 4.6, sold: 400,
    short: 'Memecah udara jadi gelembung halus.', what: 'Batu berpori di ujung selang aerator.', why: 'Gelembung kecil membantu oksigen tercampur ke air.',
    specs: [['Ukuran', '± 4 cm']], learn: ['akar-busuk', 'dwc'], compatible: ['air-pump'] });
  P({ id: 'solenoid', name: 'Solenoid Valve 12V 1/2"', category: 'water', art: 'solenoid', accent: '#1e88e5', unit: 'unit',
    cost: 45000, sourceType: EST, status: 'needs-validation', stock: 25, rating: 4.4, sold: 70,
    short: 'Keran elektrik untuk pengisian air otomatis (opsional/lanjutan).', what: 'Katup yang membuka/menutup saat diberi listrik.', why: 'Memungkinkan isi ulang otomatis bila dipasang dengan sensor level.',
    specs: [['Tegangan', '12 V DC'], ['Ukuran', '1/2 inch']], learn: ['ketinggian-air'], compatible: ['relay', 'ultrasonic'] });
  P({ id: 'check-valve', name: 'Stop / Check Valve 1/2"', category: 'water', art: 'valve', accent: '#0ea5e9', unit: 'pcs',
    cost: 13473, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/stop-faucet-check-valve-DRAT-LUAR-1-2-ke-SELANG-AIR-1-2-atau-5-8-hose-5-16-3-8-sambungan-ulir-paralon-pipa-PVC-sock-sok-sambung-joint-join-keran-kran-hidroponik-selang-rumah-rumahan-bening-benang-akuarium-aquarium-siram-tanaman-pekarangan-semprot-tumbuhan-i.16653843.8130292961',
    stock: 90, rating: 4.7, sold: 260, short: 'Mengatur dan menahan aliran balik.', what: 'Katup pada jalur selang.', why: 'Membantu mengatur debit dan mencegah air kembali ke pompa.',
    specs: [['Ukuran', '1/2 inch ke selang']], learn: ['pompa'] });
  P({ id: 'tubing-air', name: 'Selang Aerator 4 mm 5 m', category: 'water', art: 'tubing', accent: '#0ea5e9', unit: 'roll',
    cost: 10000, sourceType: EST, status: 'needs-validation', stock: 100, rating: 4.6, sold: 210, short: 'Selang kecil untuk pompa udara.', what: 'Selang silikon/PVC kecil.', why: 'Menyalurkan udara dari aerator ke batu aerasi.', specs: [['Diameter', '4 mm'], ['Panjang', '5 m']], learn: ['dwc'], compatible: ['air-pump', 'air-stone'] });

  /* ---------------- TOOLS ---------------- */
  P({ id: 'meter-set', name: 'Paket pH Meter + TDS/EC Meter', category: 'tools', art: 'meter', accent: '#16a34a', mark: '6.2', unit: 'set',
    cost: 118000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/HARGA-TERMURAH%21.-pH-Meter-TDS-EC-Meter-%28PH-009-EZ-1%29-Paket-Alat-Ukur-Hidroponik-i.348233961.22076615755',
    badge: 'Ramah pemula', beginner: true, stock: 60, rating: 4.7, sold: 890,
    short: 'Alat ukur manual untuk cek silang pembacaan sensor.', what: 'Dua alat ukur genggam: satu untuk pH, satu untuk TDS/EC.', why: 'Penting untuk memastikan sensor otomatis masih akurat, atau untuk sistem tanpa sensor.',
    specs: [['Isi', 'pH meter PH-009 + TDS/EC meter EZ-1'], ['Pemakaian', 'Celup, tunggu angka stabil, catat']], learn: ['ph', 'tds', 'sensor'], compatible: ['calib'] });
  const tools = [
    ['meter-ph', 'pH Meter Pen Digital', 'meter', 60000, 'Cek pH larutan secara manual.', '#2563eb', ['ph']],
    ['meter-tds', 'TDS Meter Pen Digital', 'meter', 45000, 'Cek kepekatan nutrisi secara manual.', '#0ea5e9', ['tds']],
    ['cup-ukur', 'Gelas Ukur 500 ml', 'cup', 10000, 'Menakar air dan nutrisi dengan tepat.', '#0ea5e9', ['ab-mix']],
    ['syringe', 'Suntikan Takar 10 ml (isi 3)', 'syringe', 6000, 'Menakar AB Mix dan pH Up/Down dalam jumlah kecil.', '#16a34a', ['ab-mix', 'ph']],
    ['scale', 'Timbangan Digital 0,01 g', 'scale', 45000, 'Menimbang nutrisi bubuk.', '#16a34a', ['ab-mix']],
    ['tray-semai', 'Tray Semai 50 Lubang', 'tray', 15000, 'Tempat menyemai benih sebelum pindah tanam.', '#16a34a', ['checklist-pemula']],
    ['scissors', 'Gunting Pangkas', 'scissors', 20000, 'Memanen dan memangkas daun rusak.', '#16a34a', ['daun-menguning']],
    ['labels', 'Label Tanaman (isi 50)', 'labels', 8000, 'Menandai jenis & tanggal tanam.', '#16a34a', ['checklist-pemula']],
  ];
  tools.forEach(([id, name, art, cost, short, accent, learn]) => P({ id, name, category: 'tools', art, accent, mark: id === 'meter-tds' ? '880' : '6.2', unit: 'pcs', cost, sourceType: EST, status: 'needs-validation',
    beginner: true, stock: 80, rating: 4.6, sold: 240, short, what: short, why: 'Alat sederhana yang membuat perawatan harian lebih terukur.', specs: [['Tipe', 'Alat bantu']], learn }));

  /* ---------------- SPARE PARTS & CONTAINERS ---------------- */
  P({ id: 'netpot-50', name: 'Netpot 5 cm (isi 50)', category: 'spare', art: 'netpot', unit: 'pack',
    cost: 25000, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/Netpot-Hidroponik-isi-50-Ukuran-5cm-untuk-sistem-NFT-dan-DFT-i.243795382.7327134559',
    beginner: true, stock: 150, rating: 4.8, sold: 1100, short: 'Pot berlubang untuk dudukan tanaman di talang.', what: 'Wadah kecil berlubang tempat media dan bibit diletakkan.', why: 'Menahan tanaman sambil membiarkan akar menjuntai ke aliran air.',
    specs: [['Diameter', '5 cm'], ['Isi', '50 pcs']], learn: ['nft'], compatible: ['media-18', 'pvc-2'] });
  P({ id: 'netpot-1', name: 'Netpot 5 cm (satuan)', category: 'spare', art: 'netpot', unit: 'pcs',
    cost: 500, sourceType: MB, status: 'researched',
    sourceUrl: 'https://shopee.co.id/Netpot-Hidroponik-Ukuran-5cm-%28Untuk-Gully-Hidroponik-NFT%29-i.243795382.5227141379',
    stock: 500, rating: 4.7, sold: 3000, short: 'Ganti netpot yang retak.', what: 'Netpot pengganti satuan.', why: 'Netpot retak bisa membuat tanaman miring.', specs: [['Diameter', '5 cm']], learn: ['nft'] });
  P({ id: 'nft-starter', name: 'Instalasi NFT Starter 12 Lubang (tanpa sensor)', category: 'spare', art: 'kit', accent: '#64748b', unit: 'set',
    cost: 330000, sourceType: MB, status: 'researched', sourceUrl: 'https://shopee.co.id/greenv.e.r.d.e',
    sourceNote: 'Benchmark paket set NFT/DFT dari halaman toko Shopee (bukan URL listing tunggal).',
    stock: 18, rating: 4.6, sold: 85, short: 'Rangka + talang NFT dasar. Cocok bila ingin merakit sendiri.',
    what: 'Struktur hidroponik NFT siap rakit tanpa perangkat monitoring.', why: 'Pilihan hemat untuk yang ingin mulai dulu, sensor bisa ditambah belakangan.',
    specs: [['Kapasitas', '± 12 lubang'], ['Sistem', 'NFT/DFT']], learn: ['nft', 'hidroponik'], compatible: ['kit-sensor', 'media-18'] });
  P({ id: 'reservoir', name: 'Tandon / Reservoir 40 L Gelap', category: 'spare', art: 'reservoir', accent: '#0ea5e9', unit: 'unit',
    cost: 75000, sourceType: EST, status: 'needs-validation', stock: 30, rating: 4.6, sold: 140,
    short: 'Wadah larutan nutrisi berdinding gelap.', what: 'Bak penampung air bernutrisi.', why: 'Dinding gelap mengurangi cahaya masuk sehingga lumut lebih sulit tumbuh.',
    specs: [['Volume', '40 L'], ['Warna', 'Gelap / opaque']], learn: ['reservoir', 'lumut'], compatible: ['pump-8w'] });
  P({ id: 'probe-ph-spare', name: 'Probe pH Pengganti (BNC)', category: 'spare', art: 'probe', accent: '#64748b', unit: 'unit',
    cost: 85000, sourceType: EST, status: 'needs-validation', stock: 20, rating: 4.4, sold: 60,
    short: 'Elektroda pengganti untuk sensor pH HYCANE.', what: 'Ujung sensor pH yang dicelup ke air.', why: 'Probe aus menyebabkan pembacaan lambat atau melenceng.',
    specs: [['Konektor', 'BNC']], replace: 'Umumnya 6–12 bulan.', learn: ['sensor', 'ph'], compatible: ['sensor-ph', 'calib'] });

  /* ---------------- HYCANE KITS (cost = component BOM + allowance) ---------------- */
  P({ id: 'kit-starter', name: 'HYCANE Starter Kit', category: 'kit', art: 'kit', accent: '#1f8a5b', unit: 'kit', sourceType: BOM, status: 'needs-validation',
    components: [['nft-starter', 1], ['media-starter', 1], ['abmix-leafy', 1], ['seed-pakcoy', 1], ['seed-lettuce', 1], ['seed-kangkung', 1]],
    allowance: 25000, allowanceLabel: 'Perakitan, kemasan & panduan pemula',
    badge: 'Mulai di sini', beginner: true, stock: 22, rating: 4.8, sold: 164,
    short: 'Paket mulai menanam tanpa sensor. Bisa di-upgrade ke Smart kapan saja.',
    what: 'Semua yang dibutuhkan untuk panen pertama: rangka NFT, media ampas tebu, nutrisi, benih, dan panduan langkah demi langkah.',
    why: 'Pemula tidak perlu bingung memilih komponen satu per satu.',
    specs: [['Kapasitas', '12 lubang'], ['Sistem', 'NFT'], ['Monitoring', 'Manual (tanpa sensor)'], ['Aplikasi', 'Opsional: edukasi & komunitas tetap gratis']],
    learn: ['hidroponik', 'checklist-pemula', 'menggunakan-hycane'], compatible: ['kit-sensor', 'meter-set'] });
  P({ id: 'kit-smart', name: 'HYCANE Smart Kit', category: 'kit', art: 'kit', accent: '#0f6b4f', unit: 'kit', sourceType: BOM, status: 'needs-validation',
    components: [['nft-starter', 1], ['media-starter', 1], ['abmix-leafy', 1], ['seed-pakcoy', 1], ['seed-lettuce', 1], ['seed-kangkung', 1],
      ['esp32', 1], ['sensor-ph', 1], ['sensor-tds', 1], ['ds18b20', 1], ['ultrasonic', 1], ['relay', 1], ['lcd', 1], ['adapter', 1], ['perfboard', 1], ['connkit', 1], ['enclosure', 1]],
    allowance: 60000, allowanceLabel: 'Perakitan elektronik, QC, kemasan & paket edukasi',
    badge: 'Unggulan', beginner: true, stock: 15, rating: 4.9, sold: 98,
    short: 'Kit hidroponik terpandu: sensor pH, TDS/EC, suhu & level air + rekomendasi di aplikasi.',
    what: 'Sistem NFT 12 lubang dengan perangkat monitoring HYCANE. Angka sensor diterjemahkan menjadi status dan langkah yang mudah dipahami.',
    why: 'Masalah air tidak terlihat mata. Kit ini memberi tahu lebih awal sebelum tanaman terlihat sakit.',
    specs: [['Kapasitas', '12 lubang'], ['Sensor', 'pH, TDS/EC, suhu air, level air'], ['Layar lokal', 'LCD 16x2 (tetap jalan tanpa aplikasi)'], ['Konektivitas', 'WiFi (ESP32)'], ['Langganan', 'Tidak wajib']],
    learn: ['menggunakan-hycane', 'iot', 'ai-recommendation'], compatible: ['media-18', 'abmix-leafy', 'calib'] });
  P({ id: 'kit-18', name: 'HYCANE Smart Kit 18-Plant Edition', category: 'kit', art: 'kit', accent: '#0b5a42', unit: 'kit', sourceType: BOM, status: 'needs-validation',
    components: [['nft-starter', 1], ['pvc-2', 2], ['netpot-50', 1], ['media-18', 1], ['abmix-leafy', 1], ['seed-pakcoy', 1], ['seed-lettuce', 1], ['seed-kangkung', 1],
      ['esp32', 1], ['sensor-ph', 1], ['sensor-tds', 1], ['ds18b20', 1], ['ultrasonic', 1], ['relay', 1], ['lcd', 1], ['adapter', 1], ['perfboard', 1], ['connkit', 1], ['enclosure', 1]],
    allowance: 80000, allowanceLabel: 'Perakitan elektronik & rangka tambahan, QC, kemasan & paket edukasi',
    badge: 'Kapasitas besar', stock: 9, rating: 4.9, sold: 41,
    short: 'Versi 18 lubang untuk keluarga atau usaha rumahan kecil.',
    what: 'Smart Kit dengan dua talang tambahan dan netpot ekstra.', why: 'Panen lebih banyak per siklus dengan satu perangkat monitoring.',
    specs: [['Kapasitas', '18 lubang'], ['Sensor', 'pH, TDS/EC, suhu air, level air'], ['Langganan', 'Tidak wajib']], learn: ['menggunakan-hycane'], compatible: ['media-36'] });
  P({ id: 'kit-sensor', name: 'HYCANE Sensor Pack', category: 'kit', art: 'sensorpack', accent: '#1e6fb2', unit: 'pack', sourceType: BOM, status: 'needs-validation',
    components: [['sensor-ph', 1], ['sensor-tds', 1], ['ds18b20', 1], ['ultrasonic', 1], ['connkit', 1]], allowance: 10000, allowanceLabel: 'QC & kemasan',
    badge: 'Upgrade', stock: 20, rating: 4.7, sold: 66,
    short: 'Upgrade instalasi DIY/Starter jadi bisa dipantau otomatis.', what: 'Empat sensor inti HYCANE dalam satu paket.', why: 'Tidak perlu membeli kit baru jika sudah punya instalasi sendiri.',
    specs: [['Isi', 'pH, TDS/EC, DS18B20, ultrasonik, kabel'], ['Butuh', 'ESP32 / perangkat HYCANE']], learn: ['sensor'], compatible: ['esp32', 'nft-starter'] });
  P({ id: 'kit-plumbing', name: 'HYCANE Plumbing Pack', category: 'kit', art: 'plumbingpack', accent: '#64748b', unit: 'pack', sourceType: BOM, status: 'needs-validation',
    components: [['pvc-2', 3], ['elbow-2', 4], ['tjoint-2', 2], ['cap-2', 4], ['socket-2', 2], ['valve-mini', 1], ['connector', 4], ['tubing-12', 1], ['clamp', 1]], allowance: 10000, allowanceLabel: 'Kemasan',
    stock: 25, rating: 4.6, sold: 52,
    short: 'Paket pipa & sambungan untuk memperluas atau merakit NFT sendiri.', what: 'Pipa 2", elbow, T-joint, dop, sok, valve, konektor, selang dan klem.', why: 'Ukuran sudah saling cocok, tidak perlu bolak-balik ke toko bangunan.',
    specs: [['Isi', 'Lihat komposisi'], ['Ukuran', '2 inch']], learn: ['nft'], compatible: ['kit-starter'] });
  P({ id: 'kit-maint', name: 'HYCANE Maintenance Pack', category: 'kit', art: 'maintenance', accent: '#0f766e', unit: 'pack', sourceType: BOM, status: 'needs-validation',
    components: [['calib', 1], ['cleaner', 1], ['tubing-12', 1], ['pump-dc', 1], ['elbow-2', 2], ['connector', 2]], allowance: 5000, allowanceLabel: 'Kemasan',
    stock: 30, rating: 4.7, sold: 74,
    short: 'Kalibrasi, pembersih, dan cadangan untuk perawatan rutin.', what: 'Larutan kalibrasi, cairan pembersih, selang & fitting cadangan, serta pompa DC cadangan.', why: 'Perawatan berkala menjaga pembacaan sensor tetap akurat dan sistem tidak berhenti mendadak.',
    specs: [['Isi', 'Lihat komposisi']], learn: ['menjaga-air', 'sensor'], compatible: ['kit-smart'] });

  /* pH Balancer Pack = pH Up + pH Down (component BOM, same 30% rule). */
  P({ id: 'ph-pack', name: 'pH Balancer Pack (Up + Down 250 ml)', category: 'nutrients', art: 'dropper', accent: '#2563eb', mark: 'pH±', unit: 'pack 2 botol',
    sourceType: BOM, status: 'needs-validation', components: [['ph-up', 1], ['ph-down', 1]], allowance: 0, allowanceLabel: 'Kemasan gabungan',
    badge: 'Kit Kontrol pH', beginner: true, stock: 70, rating: 4.7, sold: 380,
    short: 'Sepasang pH Up & pH Down untuk menjaga keasaman air di rentang aman.',
    what: 'Dua cairan penyesuai: pH Up untuk air yang terlalu asam, pH Down untuk air yang terlalu basa.',
    why: 'pH di luar rentang membuat sebagian nutrisi sulit diserap walau nutrisinya ada di air.',
    specs: [['Isi', 'pH Up 250 ml + pH Down 250 ml'], ['Pemakaian', 'Sedikit demi sedikit, aduk, tunggu, ukur ulang']], learn: ['ph'], compatible: ['meter-set', 'calib'] });

  /* Photos from the Google Stitch design export (assets/images/stitch). Products without one use the SVG illustration. */
  const PHOTO = {
    'kit-smart': 's11-22', 'kit-18': 's08-15', 'kit-starter': 's08-16', 'kit-sensor': 's08-17', 'esp32': 's14-29',
    'media-18': 's08-18', 'media-36': 's08-19', 'media-starter': 's13-27', 'abmix-leafy': 's08-20', 'ph-pack': 's08-21',
    'ph-up': 's17-38', 'ph-down': 's15-34', 'calib': 's17-39', 'nft-starter': 's15-32',
  };
  L.forEach((p) => { if (PHOTO[p.id]) p.photo = 'assets/images/stitch/' + PHOTO[p.id] + '.jpg'; });

  /* Seed metadata: difficulty, days to harvest, general EC reference (acuan umum, bukan resep). */
  const SEEDMETA = {
    'seed-pakcoy': ['Pakcoy Nauli F1', 'Mudah', '25–30', '1,5–2,0'], 'seed-lettuce': ['Selada Grand Rapids', 'Mudah', '35–40', '1,2–1,6'],
    'seed-kangkung': ['Kangkung Bangkok', 'Sangat Mudah', '20–25', '1,8–2,2'], 'seed-tomato': ['Tomat Cherry', 'Menengah', '60–70', '2,2–2,8'],
    'seed-caisim': ['Caisim', 'Mudah', '30–35', '1,5–2,0'], 'seed-spinach': ['Bayam', 'Mudah', '25–30', '1,4–1,8'],
    'seed-basil': ['Basil', 'Mudah', '45–50', '1,0–1,6'], 'seed-mint': ['Mint', 'Menengah', '60+', '1,2–1,6'],
    'seed-chili': ['Cabai Rawit', 'Menengah', '90–100', '1,8–2,8'], 'seed-cucumber': ['Mentimun', 'Menengah', '45–55', '1,7–2,5'],
    'seed-strawberry': ['Stroberi', 'Sulit', '100+', '1,4–2,2'],
  };
  L.forEach((p) => { const m = SEEDMETA[p.id]; if (m) Object.assign(p, { variety: m[0], difficulty: m[1], days: m[2], ecRef: m[3] }); });

  HC.data.products = L;
  HC.data.productById = Object.fromEntries(L.map((p) => [p.id, p]));
})();
