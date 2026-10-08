# MARKETPLACE CATALOG SPEC

## Pricing rule

Gunakan gross margin 30%:

`retail = cost / 0.70`

Bukan:
`cost * 1.30`

Lakukan pembulatan ke angka retail yang mudah dibaca.
Setelah dibulatkan, pastikan realized margin tetap >= 30%.

## Current benchmark examples from Indonesian marketplace research

These are examples gathered during planning. Prices fluctuate and must be re-checked at build time if current accuracy is important.

| Product | Observed marketplace price | Proposed demo retail at >=30% margin | Source |
|---|---:|---:|---|
| ESP32 DevKit V1 | Rp75.000 | Rp107.500 | Shopee |
| ESP32 DevKit V1 / ESP-32 | Rp98.000 | Rp140.000 | Shopee |
| TDS meter digital | Rp70.000 | Rp100.000 | Shopee |
| pH + TDS/EC meter set | Rp118.000 | Rp169.000 | Shopee |
| DS18B20 waterproof sensor | Rp20.000 | Rp29.000 | Shopee |
| pipa hidroponik 2 inch 50 cm | Rp36.100 | Rp52.000 | Shopee |
| netpot 5 cm single | Rp500 | Rp800 | Shopee |
| netpot 5 cm 50 pcs | Rp25.000 | Rp36.000 | Shopee |
| pompa hidroponik 8 W / 1000 L/h | Rp30.000 | Rp43.000 | Shopee |
| AB Mix 1 L | Rp25.000 | Rp36.000 | Shopee |
| stop/check valve | Rp13.473 | Rp19.500 | Shopee |
| paket set NFT/DFT | Rp330.000 | Rp471.500 | Shopee |
| seed bundle | Rp3.000 | Rp4.500 | Shopee |
| garden hose 5/8, 20 m | Rp180.000 | Rp257.500 | Shopee |

## Source URLs

1. ESP32 DevKit V1 75k:
https://shopee.co.id/ESP32-DEVKIT-V1-USB-Development-Board-Wifi-Bluetooth-4MB-Flash-i.1242367.44609217298

2. ESP32 98k:
https://shopee.co.id/ESP32-DEVKIT-V1-ESP-32-i.102820752.43328738796

3. TDS sensor 70k:
https://shopee.co.id/search?keyword=tds%20meter%20arduino

4. pH + TDS/EC 118k:
https://shopee.co.id/HARGA-TERMURAH%21.-pH-Meter-TDS-EC-Meter-%28PH-009-EZ-1%29-Paket-Alat-Ukur-Hidroponik-i.348233961.22076615755

5. DS18B20 20k:
https://shopee.co.id/Sensor-Suhu-Waterproof-DS18B20-Digital-temperature-sensor-Kit-i.39683264.15283599530

6. Pipe 36.1k:
https://shopee.co.id/Pipa-Hidroponik-Paralon-PVC-2%E2%80%9D-2.5%E2%80%9D-3%E2%80%9D-4%E2%80%9D-Panjang-50cm-1-Meter-%E2%80%93-Lubang-Tanam-Netpot-5cm-Siap-Pakai-Sistem-NFT-DFT-pot-tower-hidroponik-pot-hidroponik-i.1515669251.53008542732

7. Netpot single 500:
https://shopee.co.id/Netpot-Hidroponik-Ukuran-5cm-%28Untuk-Gully-Hidroponik-NFT%29-i.243795382.5227141379

8. Netpot 50 pcs 25k:
https://shopee.co.id/Netpot-Hidroponik-isi-50-Ukuran-5cm-untuk-sistem-NFT-dan-DFT-i.243795382.7327134559

9. Pump 30k:
https://shopee.co.id/greenv.e.r.d.e

10. AB Mix 25k:
https://shopee.co.id/NUTRISI-AB-MIX-HIDROPONIK-1-LITER-i.233282073.8510422102

11. Valve ~13.5k:
https://shopee.co.id/stop-faucet-check-valve-DRAT-LUAR-1-2-ke-SELANG-AIR-1-2-atau-5-8-hose-5-16-3-8-sambungan-ulir-paralon-pipa-PVC-sock-sok-sambung-joint-join-keran-kran-hidroponik-selang-rumah-rumahan-bening-benang-akuarium-aquarium-siram-tanaman-pekarangan-semprot-tumbuhan-i.16653843.8130292961

12. Seed bundle ~3k:
https://shopee.co.id/Benih-Sayur-Sayuran-Halaman-Rumah-Mudah-di-Tanam-Paket-Lengkap-Tanaman-Hidroponik-Kangkung-Bayam-Brokoli-Cabe-Rawit-Daun-Bawang-Kol-Sawi-Pakcoy-Caisim-Terong-Ungu-Tomat-Sayur-Selada-Wortel-i.384112164.20675929498

13. Starter NFT/DFT 330k:
https://shopee.co.id/greenv.e.r.d.e

14. Garden hose 20m 180k:
https://shopee.co.id/EELIC-GAH-A20M-GARDEN-HOSE-SELANG-TAMAN-20-METER-DAN-DIAMETER-SELANG-5-8-SELANG-AIR-MULTIFUNGSI-i.2798689.1644755652

## IMPORTANT

These observed prices are benchmarks, not HYCANE's official production BOM.

If a listing is variant-dependent, store the exact selected variant.

If there is no trustworthy live benchmark, mark `needs-validation`.

## Catalog groups to build

### Kits
- HYCANE Starter Kit
- HYCANE Smart Kit
- HYCANE Smart Kit 18-Plant Edition
- HYCANE Sensor Pack
- HYCANE Plumbing Pack
- HYCANE Maintenance Pack

### Media
- Bagasse Media Starter Pack
- Bagasse Media Refill 18 plugs
- Bagasse Media Refill 36 plugs

### Nutrients
- AB Mix Leafy Greens 1 L
- AB Mix Fruit 1 L
- pH Up
- pH Down
- Calibration Solution

### Seeds
- Lettuce
- Pakcoy
- Kangkung
- Caisim
- Spinach
- Basil
- Mint
- Tomato Cherry
- Chili
- Cucumber
- Strawberry

### Plumbing
- PVC 2 inch
- PVC 2.5 inch
- PVC 3 inch
- Elbow
- T-joint
- End cap
- Reducer
- Socket
- Mini valve
- Connector
- Tubing
- Hose clamp

### Electronics
- ESP32
- pH sensor
- TDS/EC sensor
- DS18B20
- ultrasonic level sensor
- relay
- LCD display
- adapter
- perfboard
- connector kit
- waterproof enclosure

### Water system
- DC pump
- air pump
- air stone
- solenoid valve
- check valve

### Tools
- pH meter
- TDS meter
- measuring cup
- syringe
- scale
- seedling tray
- pruning scissors
- labels
