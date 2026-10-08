/* Seeded community discussions (demo data, no backend). Members are fictional demo personas. */
var HC = window.HC || (window.HC = {});
HC.data = HC.data || {};

HC.data.communityCats = [
  { id: 'all', label: 'Semua Diskusi' },
  { id: 'pemula', label: 'Pertanyaan Pemula' },
  { id: 'troubleshooting', label: 'Troubleshooting & Hama' },
  { id: 'diy', label: 'Tips DIY & Modifikasi Kit' },
  { id: 'panen', label: 'Cerita Panen & Hasil Sayur' },
  { id: 'setup', label: 'Setup Sistem' },
];

HC.data.hotTopics = ['pH Fluktuatif', 'Daun Menguning', 'Ampas Tebu vs Rockwool', 'Suhu Air Panas'];

HC.data.seedPosts = [
  { id: 'p1', cat: 'pemula', author: 'Budi Prasetyo', city: 'Surabaya', level: 'Pemula · Smart Kit', hoursAgo: 3, likes: 38, saved: 0,
    title: 'Daun pakcoy umur 14 hari mulai menguning di tepi luar. Kekurangan nutrisi atau pH terlalu asam?',
    body: 'Halo teman-teman, ini siklus tanam pertama saya pakai kit HYCANE. Daun pakcoy di lubang A1–A4 mulai menguning tipis di tepi dan pertumbuhannya sedikit melambat dibanding kangkung.\n\nDi dashboard terbaca pH 5,4 dan TDS 820 ppm. Apakah saya harus menguras seluruh tandon, atau cukup menaikkan pH sedikit demi sedikit?',
    telemetry: { ph: 5.4, tds: 820, temp: 27.8 },
    tags: ['Pakcoy', 'pH-Asam', 'NutrisiABMix', 'Pemula'],
    images: [['assets/images/stitch/s19-41.jpg', 'Foto daun lubang A1–A4 (hari ke-14)'], ['assets/images/stitch/s19-42.jpg', 'Grafik penurunan pH 48 jam terakhir']],
    guided: {
      author: 'Tim Agronomi HYCANE', role: 'Moderator · jawaban terpandu', hoursAgo: 2,
      steps: [
        ['Kemungkinan penyebab: pH terlalu rendah', 'pH 5,4 berada di bawah rentang acuan sayur daun (± 5,8–6,8). Pada kondisi terlalu asam, sebagian unsur hara lebih sulit diserap walaupun TDS-nya cukup. Menambah pupuk sekarang belum tentu membantu.'],
        ['Tindakan: koreksi pH bertahap, tidak perlu menguras tandon', 'Tambahkan pH Up sedikit sesuai takaran label (larutkan dulu di air bersih), aduk, biarkan pompa bersirkulasi.'],
        ['Cek ulang & target', 'Ukur lagi setelah 15–20 menit. Arahkan pelan-pelan ke kisaran 6,0–6,5. Daun yang sudah kuning tidak kembali hijau, tapi daun baru seharusnya tumbuh normal.'],
      ],
      products: ['ph-pack'], lesson: 'ph',
    },
    replies: [
      { author: 'Siti Rahma', meta: 'Malang · Rak 36 lubang', hoursAgo: 2, likes: 12, text: 'Saya dulu juga panik dan hampir buang 30 liter larutan. Ternyata cukup koreksi pH sedikit-sedikit, dua hari kemudian daun barunya hijau lagi. Semangat!' },
      { author: 'Galih Aji Pangestu', meta: 'Smart Farm A (Anda)', hoursAgo: 1, likes: 8, text: 'Tambahan: bilas probe sensor pH dengan air bersih sebelum mengukur ulang, supaya sisa larutan tidak mengganggu pembacaan.' },
      { author: 'Farhan Hadi', meta: 'Urban Farming Gresik', hoursAgo: 0.75, likes: 5, text: 'Kalau mau lebih praktis, buka menu Rekomendasi AI. Langkahnya muncul otomatis saat pH keluar dari rentang aman.' },
    ] },
  { id: 'p2', cat: 'panen', author: 'Siti Rahma', city: 'Malang', level: 'Petani Mandiri · 36 lubang', hoursAgo: 5, likes: 85,
    title: 'Catatan pakai media ampas tebu untuk semai selada: hari ke-7 akar mulai keluar',
    body: 'Biasanya saya pakai rockwool dan sering gatal di tangan. Kali ini coba plug ampas tebu. Sejauh ini media tetap lembap dan akar mulai menembus di hari ke-7. Masih pengamatan pribadi satu siklus, nanti saya update hasil panennya.',
    tags: ['AmpasTebu', 'BagassePlugs', 'Selada'],
    images: [['assets/images/stitch/s18-40.jpg', 'Semai selada di plug ampas tebu']],
    replies: [
      { author: 'Dimas', meta: 'Malang · Berpengalaman', hoursAgo: 4, likes: 6, text: 'Menarik. Coba catat pH di minggu pertama juga ya, media baru kadang memengaruhi pH larutan.' },
      { author: 'Tim Agronomi HYCANE', meta: 'Moderator', hoursAgo: 4, likes: 9, text: 'Terima kasih sudah berbagi! Catatan: kinerja media ampas tebu masih dalam tahap pengujian. Data pengamatan seperti ini membantu kami.' },
    ] },
  { id: 'p3', cat: 'diy', author: 'Dedi Kurniawan', city: 'Sidoarjo', level: 'Eksperimen DIY + modul sensor', hoursAgo: 8, likes: 41,
    title: 'Menghubungkan Sensor Pack HYCANE ke talang PVC 2,5" rakitan sendiri: data berhasil tampil',
    body: 'Buat yang punya rangka sendiri: Sensor Pack + ESP32 bisa dipasang di tandon instalasi DIY. Data pH dan suhu langsung tampil di dashboard. Kuncinya posisi probe terendam dan kabel jauh dari percikan air.',
    tags: ['DIYFriendly', 'ESP32', 'SensorPack'],
    replies: [
      { author: 'Hendra', meta: 'Pasuruan', hoursAgo: 7, likes: 3, text: 'Mantap, probe TDS-nya dikalibrasi pakai apa, Mas?' },
      { author: 'Dedi Kurniawan', meta: 'Sidoarjo', hoursAgo: 6, likes: 2, text: 'Saya bandingkan dengan TDS meter genggam yang sudah dikalibrasi, lalu sesuaikan faktornya.' },
    ] },
  { id: 'p4', cat: 'troubleshooting', author: 'Rian Pratama', city: 'Gresik', level: 'Pemula', hoursAgo: 24, likes: 64,
    title: 'Suhu air tandon naik ke 31°C saat siang terik. Gimana menurunkannya tanpa alat mahal?',
    body: 'Sudah coba tambah botol es batu tapi cepat cair. Ada saran penempatan tandon atau penutup yang efektif?',
    telemetry: { ph: 6.3, tds: 910, temp: 31.0 },
    tags: ['SuhuAir', 'Reservoir', 'CuacaPanas'],
    replies: [
      { author: 'Tim Agronomi HYCANE', meta: 'Moderator', hoursAgo: 23, likes: 14, text: 'Mulai dari yang murah: pindahkan tandon ke tempat teduh, beri penutup, gunakan wadah gelap, dan tambah aerasi. Hindari menambah es sekaligus karena suhu berubah drastis. Lihat materi "Apa itu suhu air".' },
      { author: 'Wulan', meta: 'Jember', hoursAgo: 20, likes: 6, text: 'Tandon saya bungkus kain basah + taruh di bawah rak. Turun 2–3 derajat.' },
    ] },
  { id: 'p5', cat: 'setup', author: 'Bayu', city: 'Surabaya', level: 'Pemula', hoursAgo: 30, likes: 18,
    title: 'Pipa 2 inch cocok untuk sistem apa?',
    body: 'Mau bikin NFT di balkon. Pipa 2" cukup atau harus 2,5"?',
    tags: ['NFT', 'Pipa'],
    replies: [
      { author: 'Dimas', meta: 'Malang · Berpengalaman', hoursAgo: 29, likes: 4, text: 'Untuk sayur daun seperti selada dan pakcoy, 2" cukup. Tanaman berakar banyak atau DFT, ambil 2,5–3".' },
    ] },
  { id: 'p6', cat: 'pemula', author: 'Putri', city: 'Madiun', level: 'Pemula', hoursAgo: 40, likes: 40,
    title: 'Berapa kali harus cek pH kalau belum punya sensor otomatis?',
    body: 'Tanpa sensor otomatis, idealnya cek pH berapa kali seminggu?',
    tags: ['pH', 'Rutinitas'],
    replies: [
      { author: 'Tim Agronomi HYCANE', meta: 'Moderator', hoursAgo: 39, likes: 10, text: 'Minggu pertama: setiap hari supaya paham polanya. Setelah stabil, 2–3 kali seminggu biasanya cukup. Catat hasilnya agar terlihat trennya.' },
    ] },
  { id: 'p7', cat: 'panen', author: 'Wulan', city: 'Jember', level: 'Menengah', hoursAgo: 70, likes: 56,
    title: 'Panen kangkung pertama, 28 hari!',
    body: 'Akhirnya panen. Kuncinya ternyata disiplin cek air setiap sore.',
    tags: ['Kangkung', 'Panen'],
    replies: [{ author: 'Rina', meta: 'Sidoarjo', hoursAgo: 69, likes: 2, text: 'Keren! Pakai nutrisi berapa ppm, Kak?' }] },
  { id: 'p8', cat: 'setup', author: 'Nadia', city: 'Surabaya', level: 'Pemula', hoursAgo: 120, likes: 15,
    title: 'Kratky vs NFT untuk kamar kos?',
    body: 'Listrik terbatas dan ruang sempit. Mending mulai dari mana?',
    tags: ['Kratky', 'NFT'],
    replies: [{ author: 'Tim Agronomi HYCANE', meta: 'Moderator', hoursAgo: 110, likes: 7, text: 'Dua-duanya valid. Kratky tanpa listrik dan cocok untuk belajar; NFT lebih produktif tapi butuh pompa. Lihat materi "Apa itu Kratky?".' }] },
];
