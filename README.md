# HYCANE · Demo Web App (BPC FESTAFORA 2026)

Demo aplikasi **HYCANE**: hidroponik terpandu agar pemula tidak bingung dan tanaman tidak mudah gagal.
Inti pengalaman: **Sense → Understand → Act** (sensor membaca, aplikasi menjelaskan, rekomendasi memberi tahu apa yang harus dilakukan, edukasi menjelaskan alasannya, marketplace menyediakan yang dibutuhkan).

Stack: HTML5 + CSS3 + JavaScript vanilla (ES6, tanpa build step, tanpa framework) + Chart.js 4.4.1 (di-vendor lokal di `assets/vendor/`). Tidak butuh backend; state disimpan di `localStorage` (prefix `hycane.v2.`).

## Desain

Visual mengikuti ekspor Google Stitch di `stitch_hycane_smart_hydroponic_ecosystem/` (19 layar + design system **Botanical Precision** di `botanical_precision/DESIGN.md`): font Inter, hijau `#006b2c`, permukaan biru muda `#eff4ff`, kartu radius 16px, sidebar ber-grup MAIN/EXPLORE/ACTIVITY/ACCOUNT, top bar dengan pill status sistem dan tanaman sehat. Layout Stitch diimplementasikan dengan CSS buatan sendiri (tanpa Tailwind CDN) agar ringan dan berjalan offline. Gambar Stitch diunduh ke `assets/images/stitch/`.

Beberapa isi teks di file Stitch disesuaikan agar sesuai aturan proyek (CLAUDE.md):
- Klaim kinerja ampas tebu yang belum terbukti ("retensi kapiler 1,4x", "aerasi 22% lebih tinggi", "−74% karbon") diganti pernyataan bahwa kinerjanya masih divalidasi.
- Pembacaan sensor yang tidak ada di kit (N/P/K, dissolved oxygen, auto-dosing) diganti dengan sensor yang memang ada (pH, TDS/EC, suhu, level air, pompa).
- Sertifikat panen "blockchain/kriptografis", hasil uji lab, dan nama mitra ritel diganti menjadi ringkasan catatan budidaya (demo) dengan sidik jari SHA-256 dari data aplikasi; klaim bebas pestisida ditandai sebagai deklarasi petani.
- Harga di Stitch diganti harga dari mesin harga (benchmark ÷ 0,70); kupon/diskon langganan yang menurunkan margin di bawah 30% tidak dipakai.
- Persona ahli bergelar diganti "Tim Agronomi HYCANE (demo)".

## Menjalankan

```bash
cd hycane-web
python3 -m http.server 8765
```

Buka **http://localhost:8765/**. (Port 8000 di mesin ini dipakai proses lain/Docker, jadi demo memakai 8765. Port lain apa pun juga boleh.)

Membuka `index.html` langsung (file://) juga berjalan karena tidak memakai ES modules, tetapi local server lebih disarankan.

**Login demo:** `demo@hycane.id` / `hycane2026`, atau klik **Gunakan Demo Account**.

## Demo Tools (presenter)

- Tombol **Demo Mode** di bar atas, menu **Demo Tools** di sidebar, atau tekan **Shift + D**.
- Picu: pH tinggi/rendah, TDS tinggi/rendah, suhu tinggi, air rendah, pompa mati. Nilai bergerak **bertahap** (bukan melompat) lalu status, rekomendasi, toast & notifikasi bereaksi.
- **Kembalikan ke Normal**: nilai pulih bertahap. **Reset Demo**: semua kembali ke kondisi awal sehat (sensor, alert, keranjang, notifikasi, pesanan demo, tanaman tambahan, progres belajar). Katalog tidak terhapus.
- Toggle: event acak otomatis (default mati agar pitching terkendali), simulasi perangkat offline, tampilkan data margin (presenter).
- Halaman penuh: `#/demo` (termasuk tabel audit harga).

Skenario pitching ada di `10_DEMO_SCRIPT.md` dan di halaman `#/demo`.

## Rute (hash routing)

| Layar | Rute |
|---|---|
| 01 Login | `#/login` |
| 02 Dashboard | `#/dashboard` |
| 03 Live Monitoring | `#/monitoring` (`?sys=B` untuk rak buah) |
| 04 AI Recommendation | `#/ai` |
| 05–07 Tanaman | `#/crops` (`?b=<id>` untuk detail batch & peta slot), `#/crops/:id`, `#/crops/new` |
| Harvest Log (Stitch 07) | `#/crops/:id/harvest` |
| Sertifikat Panen (Stitch 20) | `#/certificate/:id` (id batch untuk pratinjau, id panen `H-xxx` setelah diarsipkan) |
| 08–10 Marketplace | `#/marketplace`, `#/marketplace/c/:kategori`, `#/marketplace/p/:id` |
| 11 Bundle Builder | `#/bundle` |
| 12–13 Keranjang, Checkout | `#/cart`, `#/checkout` |
| 14–15 Pesanan | `#/orders`, `#/orders/:id` |
| 16–18 Edukasi | `#/learn`, `#/learn/:slug`, `#/learn/:slug/quiz` |
| 19 Diagnosis | `#/diagnosis` |
| 20–21 Komunitas | `#/community`, `#/community/:id` |
| 22 Notifikasi | `#/notifications` |
| 23–24 Profil & Kit Settings (Stitch 21) | `#/profile`, `#/settings` (termasuk wizard kalibrasi pH 2 titik, simulasi) |
| 25–27 Offline / Error / Empty | `#/state/offline`, `#/state/error`, `#/state/empty` |
| 28 Demo Controls | `#/demo` |

## Struktur

```
index.html
css/      style.css (token & shell) · components.css · views.css (layout per layar) · responsive.css
js/       utils, icons, art (ilustrasi produk SVG), pricing, store (state + localStorage),
          simulation, recommendations, model, commerce (cart/order/notif), ui (shell & komponen),
          charts, router, app (bootstrap)
js/views/ login, dashboard, monitoring, ai, crops, marketplace, shop (bundle/cart/checkout/orders),
          learn (edukasi, kuis, diagnosis), misc (komunitas, notifikasi, state, demo), harvest (harvest log, sertifikat),
          account (profil & kit settings)
data/     products, crops, user, orders, education, community, diagnosis
assets/   images/stitch (gambar desain Stitch), images/photos (Wikimedia Commons), images/placeholder.svg, vendor/chart.umd.min.js
```

## Logika simulasi (`js/simulation.js`)

Setiap rak adalah kumpulan *mean-reverting bounded random walk* dengan PRNG seedable, update tiap 2 detik:

- **pH**: drift lambat berosilasi di sekitar 6,2; perubahan normal ≤ 0,03/tick.
- **TDS**: turun perlahan karena serapan nutrisi, sesekali dosis nutrisi (+40–70 ppm lalu turun pelan). Saat air berkurang, larutan makin pekat (korelasi volume ↔ konsentrasi).
- **EC**: diturunkan dari TDS (TDS/704), sehingga 880 ppm ↔ 1,25 mS/cm dan keduanya selalu bergerak bersama.
- **Suhu air**: siklus "hari" terkompresi (~7 menit), maks 0,2°C/tick; naik saat pompa mati (air diam).
- **Ketinggian air**: turun karena konsumsi + penguapan (lebih cepat saat hangat), isi ulang berkala.
- Pembacaan = nilai sebenarnya + noise sensor kecil, lalu dihaluskan (EMA).
- Event demo menggerakkan nilai menuju target abnormal dengan batas perubahan per tick (mis. pH 6,2 → 6,3 → … → Perhatian → Mendesak).
- Status dinilai pada presisi yang ditampilkan, sehingga angka dan label selalu konsisten.

Ambang (demo, bukan resep agronomi): pH 5,8–6,8 (mendesak <5,5 / >7,2) · TDS rak daun 650–1.100 ppm (mendesak <550 / >1.250) · suhu ≤29,5°C (mendesak >31°C) · air ≥40% (mendesak <25%) · pompa OFF = mendesak.

## Rekomendasi (`js/recommendations.js`)

**AI Recommendation Demo** memakai *rule engine* berbasis ambang batas, bukan model prediktif terlatih. Ini dinyatakan di aplikasi:
> Demo menggunakan rule-based logic untuk mensimulasikan pengalaman rekomendasi sebelum model prediktif berbasis data sensor nyata dikembangkan.

Prioritas: pompa → air → suhu → pH → TDS → kesehatan sensor. Setiap rekomendasi berisi *Apa yang terjadi? · Mengapa penting? · Apa yang perlu dilakukan? · Hasil yang diharapkan*, tautan tutorial, dan produk terkait. "Tandai selesai" memicu pemulihan bertahap.

## Metodologi harga (`js/pricing.js`, `data/products.js`)

- Margin kotor 30%: **harga jual = biaya acuan ÷ 0,70** (bukan biaya × 1,30), dibulatkan ke atas ke angka retail (Rp100 / Rp500 / Rp1.000 / Rp5.000 sesuai besaran), lalu margin terealisasi dicek ≥ 30%.
- `marketplace-benchmark`: 13 item dengan benchmark Shopee (ditambah listing ESP32 Rp98.000 sebagai benchmark alternatif) dari `seed_demo_catalog.csv` / `07_MARKETPLACE_CATALOG.md`, beserta URL sumber.
- `internal-estimate` (`needs-validation`): item tanpa benchmark terverifikasi. **Tidak ada URL sumber yang dikarang.**
- `hycane-bom`: harga kit = jumlah biaya komponen + biaya perakitan/kemasan (estimasi internal), rumus sama.
- Diskon Bundle Builder dibatasi agar margin bundel tetap ≥ 30%.
- Biaya & margin tidak ditampilkan ke pelanggan; hanya terlihat bila toggle presenter aktif (detail produk, Bundle Builder, `#/demo`).
- UI menyebut harga sebagai *"Benchmark marketplace + HYCANE demo pricing"* / *harga retail demo*, bukan harga komersial final.

## Gambar

- Foto tanaman, ampas tebu, dan instalasi hidroponik: Wikimedia Commons, lisensi tercatat di `assets/images/ATTRIBUTIONS.md`.
- Gambar produk: ilustrasi SVG orisinal (`js/art.js`), tanpa ketergantungan jaringan.
- Gambar yang gagal dimuat otomatis diganti `assets/images/placeholder.svg`.

## Keterbatasan demo

- Data sensor adalah simulasi; tidak ada koneksi perangkat IoT nyata.
- Rekomendasi adalah rule engine; belum ada model prediktif.
- Kinerja media ampas tebu untuk hidroponik air belum tervalidasi ilmiah. Aplikasi menyatakannya secara eksplisit.
- Pembayaran, autentikasi, komunitas, dan status pengiriman adalah simulasi lokal (status pesanan demo maju otomatis tiap ±7 detik).
- Harga marketplace dapat berubah; sebagian besar item masih `needs-validation`.
- Font Inter dimuat dari Google Fonts; tanpa internet, aplikasi otomatis memakai font sistem.
- Kalibrasi sensor, uji koneksi kit, restart node, dan sertifikat panen adalah simulasi demo; QR pada label/sertifikat adalah ilustrasi, bukan kode yang bisa dipindai.
- Unggah foto (jurnal, komunitas) tidak tersedia di demo.

## Dokumen spesifikasi

`00_START_HERE.md`, `01_MASTER_PROMPT.md`, `03`–`16_*.md`, `seed_demo_catalog.csv`, `seed_demo_state.json`, `CLAUDE.md`.
