/* Symptom-based troubleshooting. Causes may reference a live sensor condition ("signal");
   if that condition is currently true it is ranked first. Never presented as a definitive diagnosis. */
var HC = window.HC || (window.HC = {});
HC.data = HC.data || {};

HC.data.symptoms = [
  { id: 'kuning', label: 'Daun menguning', icon: 'leaf', lesson: 'daun-menguning',
    causes: [
      { title: 'pH di luar rentang', signal: 'phOut', check: 'Ukur pH larutan. Bandingkan dengan rentang acuan tanaman.', action: 'Sesuaikan pH sedikit demi sedikit dengan pH Up/Down, lalu ukur ulang setelah beberapa menit.', products: ['ph-down', 'ph-up', 'calib'] },
      { title: 'Nutrisi terlalu encer', signal: 'tdsLow', check: 'Cek TDS/EC. Apakah lebih rendah dari target untuk umur tanaman?', action: 'Tambahkan AB Mix sesuai takaran secara bertahap, aduk, lalu ukur ulang.', products: ['abmix-leafy', 'meter-set'] },
      { title: 'Masalah akar', signal: 'tempHigh', check: 'Angkat netpot dan lihat akar: putih segar, atau cokelat dan berlendir?', action: 'Turunkan suhu air, tambah aerasi, pisahkan tanaman yang parah.', products: ['air-pump', 'air-stone'] },
      { title: 'Daun tua yang menua alami', check: 'Apakah hanya 1–2 daun paling bawah dan daun baru tetap hijau?', action: 'Pangkas daun tua dengan gunting bersih. Ini wajar.', products: ['scissors'] },
      { title: 'Cahaya kurang', check: 'Apakah tanaman mendapat sinar matahari cukup setiap hari?', action: 'Pindahkan ke lokasi yang lebih terang secara bertahap.', products: [] },
    ] },
  { id: 'busuk', label: 'Akar cokelat / berlendir', icon: 'droplet', lesson: 'akar-busuk',
    causes: [
      { title: 'Air terlalu hangat', signal: 'tempHigh', check: 'Cek suhu air, terutama siang hari.', action: 'Pindahkan tandon ke tempat teduh, gunakan penutup, tingkatkan sirkulasi.', products: ['ds18b20', 'reservoir'] },
      { title: 'Oksigen/aliran kurang', signal: 'pumpOff', check: 'Apakah pompa/aerator menyala dan aliran lancar?', action: 'Pastikan pompa berjalan, bersihkan saringan, tambah aerator dan batu aerasi.', products: ['air-pump', 'air-stone', 'pump-8w'] },
      { title: 'Sistem kotor', check: 'Apakah ada lendir/endapan di tandon atau pipa?', action: 'Bersihkan sistem di antara siklus, gunakan media baru.', products: ['cleaner', 'media-18'] },
    ] },
  { id: 'layu', label: 'Tanaman layu', icon: 'sprout', lesson: 'pompa',
    causes: [
      { title: 'Aliran air berhenti', signal: 'pumpOff', check: 'Apakah pompa menyala? Apakah air sampai ke ujung talang?', action: 'Periksa listrik, kabel, dan saringan pompa. Siapkan pompa cadangan.', products: ['pump-8w', 'pump-dc'] },
      { title: 'Air tandon hampir habis', signal: 'waterLow', check: 'Lihat ketinggian air tandon.', action: 'Isi ulang tandon, lalu cek ulang TDS dan pH.', products: ['hose-58', 'ultrasonic'] },
      { title: 'Panas berlebih', signal: 'tempHigh', check: 'Apakah layu terjadi siang hari lalu segar lagi sore?', action: 'Beri naungan saat terik dan jaga suhu air.', products: ['ds18b20'] },
      { title: 'Akar rusak', check: 'Cek warna dan bau akar.', action: 'Lihat panduan akar busuk.', products: ['air-pump'] },
    ] },
  { id: 'lumut', label: 'Lumut hijau muncul', icon: 'waves', lesson: 'lumut',
    causes: [
      { title: 'Cahaya masuk ke tandon/media', check: 'Apakah tandon bening atau tidak tertutup? Ada lubang tanam kosong?', action: 'Tutup tandon dan lubang kosong, gunakan wadah gelap.', products: ['reservoir'] },
      { title: 'Media/sistem lama', check: 'Kapan terakhir sistem dibersihkan dan media diganti?', action: 'Bersihkan sistem dan ganti media setiap siklus.', products: ['cleaner', 'media-18'] },
    ] },
  { id: 'tipburn', label: 'Ujung daun cokelat / terbakar', icon: 'sun', lesson: 'tds',
    causes: [
      { title: 'Nutrisi terlalu pekat', signal: 'tdsHigh', check: 'Cek TDS/EC. Apakah melebihi target?', action: 'Encerkan bertahap dengan air bersih, lalu ukur ulang.', products: ['meter-set'] },
      { title: 'Suhu tinggi & penguapan', signal: 'tempHigh', check: 'Apakah terjadi saat cuaca panas?', action: 'Perbaiki sirkulasi udara dan naungan.', products: ['ds18b20'] },
    ] },
  { id: 'lambat', label: 'Pertumbuhan lambat', icon: 'clock', lesson: 'tds',
    causes: [
      { title: 'Nutrisi terlalu encer', signal: 'tdsLow', check: 'Cek TDS/EC dibanding target umur tanaman.', action: 'Naikkan kepekatan bertahap sesuai panduan.', products: ['abmix-leafy'] },
      { title: 'pH di luar rentang', signal: 'phOut', check: 'Ukur pH larutan.', action: 'Sesuaikan pH secara bertahap.', products: ['ph-down', 'ph-up'] },
      { title: 'Cahaya kurang', check: 'Berapa jam sinar matahari langsung?', action: 'Pindahkan ke lokasi lebih terang.', products: [] },
    ] },
];

/* Short summaries for the "Diagnosis Cepat" cards (education home + dashboard). */
(function () {
  const META = {
    kuning: ['Sering Terjadi', 'warn', 'Urat daun masih hijau tapi helai daun menguning, sering di daun tua terlebih dulu.', 'Kepekatan nutrisi rendah atau pH di luar rentang sehingga nutrisi sulit diserap.'],
    busuk: ['Kritis (Akar)', 'crit', 'Akar tidak lagi putih segar: cokelat, lembek, berlendir, kadang berbau.', 'Air tandon terlalu hangat dan oksigen rendah, aliran/aerasi kurang.'],
    layu: ['Transpirasi', 'info', 'Tanaman terkulai saat siang lalu kembali segar sore hari.', 'Aliran air berhenti, air tandon menipis, atau panas berlebih.'],
    lumut: ['Sanitasi', 'muted', 'Lapisan hijau di netpot, pipa, atau dasar tandon.', 'Cahaya masuk ke tandon/pipa sehingga alga tumbuh di air bernutrisi.'],
    tipburn: ['Nutrisi', 'warn', 'Ujung atau tepi daun cokelat seperti terbakar.', 'Larutan terlalu pekat atau penguapan tinggi saat panas.'],
    lambat: ['Pertumbuhan', 'muted', 'Tanaman kecil dan lambat dibanding jadwal.', 'Nutrisi terlalu encer, pH di luar rentang, atau cahaya kurang.'],
  };
  HC.data.symptoms.forEach((s) => { const m = META[s.id]; if (m) Object.assign(s, { tag: m[0], tagSev: m[1], desc: m[2], likely: m[3] }); });
})();
