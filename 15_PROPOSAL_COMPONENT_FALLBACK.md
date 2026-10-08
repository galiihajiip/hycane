# PROPOSAL COMPONENT FALLBACK

Dokumen ini merangkum komponen yang secara eksplisit muncul pada proposal HYCANE. Ini adalah fallback spesifikasi konsep, BUKAN harga pasar final.

| Komponen | Fungsi dalam HYCANE | Status |
|---|---|---|
| ESP32 | Mikrokontroler dan konektivitas | Core |
| Sensor pH | Memantau tingkat keasaman air | Core |
| Sensor TDS/EC | Memantau konsentrasi larutan nutrisi | Core |
| Sensor ultrasonik | Memantau ketinggian air | Core |
| DS18B20 / temperature sensor | Memantau suhu air | Core |
| LCD display | Informasi lokal tanpa harus membuka aplikasi | Core |
| Relay module | Mengendalikan beban/aktuator | Core |
| Pompa DC mini | Sirkulasi air | Core |
| Solenoid valve | Kontrol aliran air bila dibutuhkan | Optional/advanced |
| DC step-down / adaptor | Catu daya | Core |
| PCB perfboard + konektor | Integrasi elektronik prototipe | Prototype |
| Enclosure | Melindungi elektronik | Core |
| Packaging | Pengiriman | Core |
| Pipa PVC | Saluran hidroponik | Core |
| Selang | Jalur air | Core |
| Netpot | Wadah tanaman | Core |
| Bagasse growing media | Media tanam biodegradable | Core differentiation |
| Nutrient / AB Mix | Nutrisi hidroponik | Consumable |
| Benih | Input budidaya | Consumable |

## Rule untuk Claude Code

1. Gunakan daftar di atas sebagai referensi komponen HYCANE.
2. Jangan membuat spesifikasi baru seolah-olah sudah tervalidasi.
3. Untuk marketplace, pisahkan `HYCANE Product` dan `Accessory/Replacement`.
4. Komponen yang belum punya benchmark harga nyata diberi `needs-validation`.
5. Jangan menggunakan harga fallback proposal sebagai “marketplace price”.
