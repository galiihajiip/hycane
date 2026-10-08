/* "Rekomendasi HYCANE" — AI Recommendation DEMO.
   This is a transparent rule engine over the current sensor snapshot (threshold logic),
   NOT a trained predictive model. Priority: pump > water > temperature > pH > TDS > sensor health. */
var HC = window.HC || (window.HC = {});

HC.reco = (function () {
  const { fmt } = HC.util;
  const DISCLAIMER = 'Demo menggunakan rule-based logic untuk mensimulasikan pengalaman rekomendasi sebelum model prediktif berbasis data sensor nyata dikembangkan.';
  const SEV_RANK = { crit: 0, warn: 1, info: 2, ok: 3 };

  function evaluate(snap, systemId = 'A') {
    const sys = HC.data.systems[systemId];
    const th = HC.sim.THRESH[systemId];
    const L = snap.levels;
    const out = [];
    const ph = fmt(snap.ph, 1), tds = fmt(snap.tds), ec = fmt(snap.ec, 2), temp = fmt(snap.temperature, 1), water = fmt(snap.waterLevel);
    const base = { device: systemId, systemName: sys.name };

    if (!snap.pumpOn) out.push(Object.assign({}, base, {
      key: 'pump', severity: 'crit', priority: 1, metric: 'Pompa', value: 'OFF', event: 'pumpFail',
      title: 'Pompa tidak aktif. Aliran air berhenti.',
      what: `Pompa di ${sys.name} berhenti. Debit aliran turun ke ${fmt(snap.flow, 1)} L/menit.`,
      why: 'Di sistem NFT, akar hanya dialiri lapisan air tipis. Tanpa aliran, akar bisa mengering dan kekurangan oksigen dalam waktu singkat, apalagi saat siang hari.',
      todo: ['Periksa koneksi dan sumber daya: colokan, adaptor, dan stopkontak.', 'Angkat pompa dan bersihkan saringan dari sisa akar atau lumut.', 'Pastikan pompa terendam air dan tidak menyedot udara.', 'Jika pompa tetap mati, pasang pompa cadangan.'],
      expected: 'Aliran kembali normal (± 2,4 L/menit) dan suhu air berhenti naik.',
      lesson: 'pompa', products: ['pump-8w', 'pump-dc', 'kit-maint'],
    }));

    if (L.waterLevel !== 'ok') out.push(Object.assign({}, base, {
      key: 'water', severity: L.waterLevel, priority: 2, metric: 'Ketinggian air', value: `${water}%`, event: 'lowWater',
      title: L.waterLevel === 'crit' ? 'Air hampir habis. Isi reservoir sekarang.' : 'Ketinggian air mulai rendah.',
      what: `Air di reservoir tinggal ${water}% (batas aman ${th.waterLevel.warn[0]}%).`,
      why: 'Jika air terlalu sedikit, pompa bisa menyedot udara dan aliran ke akar tidak optimal. Larutan yang tersisa juga menjadi lebih pekat dan lebih cepat panas.',
      todo: ['Isi reservoir sebelum pompa kehilangan aliran optimal, sampai level aman (± 75–80%).', 'Gunakan air bersih, lalu aduk perlahan.', 'Setelah diisi, cek ulang TDS/EC dan pH karena larutan menjadi lebih encer.'],
      expected: 'Level air kembali di atas 70% dan aliran pompa stabil.',
      lesson: 'ketinggian-air', products: ['hose-58', 'ultrasonic', 'reservoir'],
    }));

    if (L.temperature !== 'ok') {
      const hot = snap.temperature > th.temperature.warn[1];
      out.push(Object.assign({}, base, {
        key: 'temp', severity: L.temperature, priority: 3, metric: 'Suhu air', value: `${temp}°C`, event: hot ? 'highTemp' : null,
        title: hot ? 'Suhu air mulai terlalu tinggi.' : 'Suhu air terlalu rendah.',
        what: `Suhu air ${temp}°C (batas aman ${fmt(th.temperature.warn[1], 1)}°C).`,
        why: hot ? 'Air yang lebih hangat umumnya menahan oksigen lebih sedikit. Akar menjadi kurang nyaman dan lebih rentan bermasalah, termasuk busuk akar.' : 'Air yang terlalu dingin dapat memperlambat penyerapan nutrisi.',
        todo: hot ? ['Periksa sirkulasi dan lokasi reservoir. Jauhkan dari sinar matahari langsung.', 'Tutup reservoir dan gunakan wadah gelap/opaque.', 'Tambahkan aerasi untuk membantu oksigen di air.', 'Hindari menambah es batu sekaligus. Turunkan suhu secara bertahap.'] : ['Pindahkan reservoir ke tempat yang lebih hangat.', 'Pantau suhu beberapa jam ke depan.'],
        expected: 'Suhu air kembali di bawah 29°C dalam beberapa jam.',
        lesson: 'suhu-air', products: ['air-pump', 'air-stone', 'ds18b20'],
      }));
    }

    if (L.ph !== 'ok') {
      const high = snap.ph > th.ph.warn[1];
      out.push(Object.assign({}, base, {
        key: 'ph', severity: L.ph, priority: 4, metric: 'pH air', value: ph, event: high ? 'highPH' : 'lowPH',
        title: high ? 'pH terlalu tinggi.' : 'pH terlalu rendah.',
        what: `pH ${high ? 'naik' : 'turun'} ke ${ph} (rentang acuan ${fmt(th.ph.warn[0], 1)}–${fmt(th.ph.warn[1], 1)}).`,
        why: high ? 'Saat pH terlalu tinggi, beberapa unsur hara (misalnya zat besi) lebih sulit diserap tanaman. Gejalanya bisa berupa daun muda menguning.' : 'pH yang terlalu rendah (terlalu asam) dapat mengganggu ketersediaan nutrisi dan membuat akar stres.',
        todo: ['Periksa pembacaan sensor dengan pH meter manual. Pastikan alat sudah dikalibrasi.', `Lakukan penyesuaian secara bertahap dengan ${high ? 'pH Down' : 'pH Up'}: sedikit saja, aduk, tunggu 10–15 menit, lalu ukur ulang.`, 'Jangan mengejar angka sempurna sekaligus. Target bergeser perlahan ke kisaran 6,0–6,5.', 'Catat penyesuaian agar terlihat polanya.'],
        expected: 'pH kembali ke rentang aman dalam 1–2 kali penyesuaian.',
        lesson: 'ph', products: [high ? 'ph-down' : 'ph-up', 'meter-set', 'calib'],
      }));
    }

    if (L.tds !== 'ok') {
      const high = snap.tds > th.tds.warn[1];
      out.push(Object.assign({}, base, {
        key: 'tds', severity: L.tds, priority: 5, metric: 'TDS/EC', value: `${tds} ppm`, event: high ? 'highTDS' : 'lowTDS',
        title: high ? 'Kepekatan nutrisi terlalu tinggi.' : 'Kepekatan nutrisi rendah.',
        what: `TDS ${tds} ppm · EC ${ec} mS/cm (acuan rak ini ${fmt(th.tds.warn[0])}–${fmt(th.tds.warn[1])} ppm).`,
        why: high ? 'Larutan yang terlalu pekat dapat membuat akar stres dan ujung daun tampak terbakar.' : 'Larutan yang terlalu encer membuat tanaman kekurangan makanan sehingga pertumbuhan melambat dan daun bisa pucat.',
        todo: high ? ['Periksa larutan sebelum menambahkan nutrisi. Jangan tambah AB Mix dulu.', 'Encerkan bertahap dengan air bersih, aduk, lalu ukur ulang.', 'Cek apakah level air turun (air menguap membuat larutan lebih pekat).'] : ['Periksa kebutuhan nutrisi tanaman sesuai umur dan jenisnya.', 'Tambahkan AB Mix A dan B secara terpisah sesuai takaran label, sedikit demi sedikit.', 'Aduk rata, lalu ukur ulang TDS/EC dan pH.'],
        expected: 'TDS kembali ke rentang acuan dan EC mengikuti.',
        lesson: 'tds', products: high ? ['meter-set', 'meter-tds'] : ['abmix-leafy', 'syringe', 'meter-set'],
      }));
    }

    const lowHealth = Object.entries(snap.sensorHealth).filter(([, v]) => v < 95);
    if (lowHealth.length) out.push(Object.assign({}, base, {
      key: 'sensor', severity: 'info', priority: 6, metric: 'Kesehatan sensor', value: `${fmt(lowHealth[0][1])}%`, event: null,
      title: 'Saatnya kalibrasi sensor.',
      what: 'Kualitas sinyal salah satu sensor sedikit menurun.',
      why: 'Sensor yang bergeser memberi angka yang kurang akurat, sehingga rekomendasi juga kurang tepat.',
      todo: ['Bersihkan probe dengan air bersih.', 'Kalibrasi sensor pH dengan larutan buffer 4,00 dan 6,86.'],
      expected: 'Kualitas sensor kembali di atas 96%.', lesson: 'sensor', products: ['calib'],
    }));

    out.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || a.priority - b.priority);
    return out;
  }

  /* Positive state + routine guidance when nothing is wrong. */
  function healthy(snap) {
    return {
      key: 'ok', severity: 'ok', title: 'Semua sistem berjalan normal.',
      what: `pH ${fmt(snap.ph, 1)}, TDS ${fmt(snap.tds)} ppm, suhu ${fmt(snap.temperature, 1)}°C, air ${fmt(snap.waterLevel)}%. Semua dalam rentang aman.`,
      why: 'Kondisi air yang stabil membuat akar nyaman menyerap nutrisi.',
      todo: ['Tidak ada tindakan mendesak.', 'Rutinitas hari ini: intip akar 1–2 tanaman dan cek apakah ada daun yang menguning.', 'Kalibrasi sensor pH dijadwalkan dalam 9 hari.'],
      expected: 'Tanaman tumbuh sesuai jadwal.', lesson: 'menggunakan-hycane', products: [],
    };
  }

  function mediaReminder() {
    const meta = HC.store.get('meta');
    const age = HC.util.daysBetween(meta.mediaChangedAt, new Date());
    const left = HC.data.mediaCycle.lengthDays - age;
    return { daysLeft: left, dueSoon: left <= 7 };
  }

  return { evaluate, healthy, mediaReminder, DISCLAIMER };
})();
