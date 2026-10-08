# HYCANE Demo Web App - Claude Code Package

Paket ini disiapkan untuk mengarahkan Claude Code membangun demo web app HYCANE yang siap dipakai untuk pitching BPC FESTAFORA 2026.

## Urutan penggunaan

1. Baca `12_FESTAFORA_CONTEXT_LOCK.md` terlebih dahulu.
2. Baca `14_README_SCRAPING_INSIGHTS.md` untuk consumer insights dan batasan riset.
3. Baca `01_MASTER_PROMPT.md` sebagai instruksi utama.
4. Baca `03_PRD_HYCANE.md` untuk requirement produk.
5. Baca `04_UI_UX_SPEC.md`, `05_DATA_MODEL.md`, `06_SIMULATION_AND_AI.md`, dan `07_MARKETPLACE_CATALOG.md`.
6. Baca `08_IMAGE_RESEARCH.md` dan `09_EDUCATION_CONTENT.md` untuk isi visual dan edukasi.
7. Baca `10_DEMO_SCRIPT.md` untuk skenario demo saat pitching.
8. Gunakan `11_QA_CHECKLIST.md` sebelum menyatakan aplikasi selesai.

## Prinsip utama

Aplikasi harus sederhana secara teknis, tetapi terlihat matang secara product design.

Stack wajib:
- HTML
- CSS
- JavaScript vanilla

Library eksternal yang diperbolehkan via CDN:
- Chart.js untuk grafik
- Lucide Icons atau icon library ringan
- Font eksternal hanya bila benar-benar diperlukan, tetapi UI default harus tetap baik dengan system font

Tidak boleh:
- React
- Vue
- Angular
- Next.js
- backend wajib
- database server wajib
- authentication provider wajib

Semua data dapat berjalan sebagai local demo state.
