/* Demo user, credentials, and seed notifications. Front-end demo only: no real auth. */
var HC = window.HC || (window.HC = {});
HC.data = HC.data || {};

HC.data.DEMO_CREDENTIALS = { email: 'demo@hycane.id', password: 'hycane2026' };

HC.data.user = {
  id: 'demo-user-001',
  name: 'Galih Aji Pangestu',
  shortName: 'Galih',
  email: 'demo@hycane.id',
  phone: '0812-3456-7890',
  city: 'Surabaya',
  address: 'Jl. Rungkut Madya No. 12, Gunung Anyar, Surabaya, Jawa Timur 60294',
  experienceLevel: 'Pemula',
  farm: 'Smart Farm A',
  farmDesc: 'Rooftop NFT + DWC · Rungkut, Surabaya',
  photo: 'assets/images/stitch/s21-46.jpg',
  joinedAt: '2026-01-01',
  deviceCount: 2,
  harvests: 3,
  totalPlants: 18,
};

/* Media replacement cycle drives the reorder reminder on the dashboard. */
HC.data.mediaCycle = { lengthDays: 35, changedDaysAgo: 30, reorder: [['media-18', 1], ['abmix-leafy', 1]] };

HC.data.seedNotifications = [
  { cat: 'orders', sev: 'info', title: 'Pesanan #HC1024 telah dikirim', body: 'Paket pH Meter + TDS/EC Meter dan larutan kalibrasi sedang dalam perjalanan.', link: '#/orders/HC1024', minsAgo: 95 },
  { cat: 'recommendation', sev: 'warn', title: 'Media tanam diperkirakan perlu diganti', body: 'Bagasse Media di Rak Sayur Daun diperkirakan perlu diganti dalam 5 hari.', link: '#/marketplace/p/media-18', minsAgo: 180 },
  { cat: 'education', sev: 'info', title: 'Materi baru tersedia: Apa itu EC?', body: 'Pelajari bedanya TDS dan EC dalam 4 menit.', link: '#/learn/ec', minsAgo: 300 },
  { cat: 'monitoring', sev: 'warn', title: 'Rak Tanaman Buah: 1 cabai daunnya menguning', body: 'Coba alat Diagnosis untuk mempersempit kemungkinan penyebab.', link: '#/diagnosis', minsAgo: 720 },
  { cat: 'monitoring', sev: 'info', title: 'Reservoir diisi ulang', body: 'Ketinggian air kembali ke 80%.', link: '#/monitoring', minsAgo: 1440 },
];

/* Device & calibration demo data (Profile & Kit Settings). Values are demo/simulated. */
HC.data.device = {
  id: 'HYCANE-ESP32-001', mac: '24:6F:28:B1:0C:42', fw: 'v2.4.1', wifi: 'SmartFarm_IoT', ip: '192.168.1.145', rssi: -58,
  intervals: [['2', 'Setiap 2 detik (Demo pitch)'], ['30', 'Setiap 30 detik (Rekomendasi)'], ['60', 'Setiap 1 menit (Hemat daya)']],
};
HC.data.seedCalibrations = [
  { sensor: 'ph', daysAgo: 14, method: 'Kalibrasi 2 titik', detail: 'Buffer 4,00 & 6,86 · suhu 25,1°C', slope: 98.4, offset: 0.018, status: 'ok', by: 'Galih Aji (mandiri)' },
  { sensor: 'ph', daysAgo: 44, method: 'Kalibrasi 2 titik', detail: 'Buffer 4,00 & 6,86 · suhu 24,8°C', slope: 97.9, offset: 0.021, status: 'ok', by: 'Galih Aji (mandiri)' },
  { sensor: 'ph', daysAgo: 70, method: 'Kalibrasi awal', detail: 'Setup kit · suhu 25,0°C', slope: 99.1, offset: 0, status: 'factory', by: 'QC HYCANE' },
];
