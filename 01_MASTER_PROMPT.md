# MASTER PROMPT FOR CLAUDE CODE

Anda adalah senior frontend engineer, product designer, data visualization engineer, dan startup demo builder.

Tugas Anda: bangun sebuah **web app demo HYCANE** yang akan digunakan untuk **final pitching Business Plan Competition FESTAFORA 2026**.

JANGAN membuat landing page.
JANGAN membuat website marketing biasa.
Buat aplikasi seolah-olah user sudah login.

Aplikasi harus terlihat seperti produk yang benar-benar dapat dipakai, tetapi secara teknis cukup sederhana dan dapat dijalankan dengan membuka `index.html` atau melalui static local server.

============================================================
1. STACK WAJIB
============================================================

Gunakan hanya:
- HTML5
- CSS3
- JavaScript vanilla ES6+

Library CDN yang diperbolehkan:
- Chart.js untuk grafik
- Lucide icons atau icon library ringan

Jangan gunakan:
- React
- Vue
- Angular
- Next.js
- Nuxt
- Svelte
- TypeScript
- backend wajib
- framework CSS berat

Tidak perlu build step.

Target penggunaan:
- laptop
- desktop browser
- layar presentasi 16:9

Tetap responsive untuk tablet/mobile.

============================================================
2. KONTEKS BISNIS
============================================================

Produk: HYCANE

HYCANE adalah smart hydroponic ecosystem yang menggabungkan:
1. biodegradable growing media berbasis sugarcane bagasse
2. IoT monitoring
3. mobile dashboard
4. actionable recommendation
5. education
6. marketplace untuk kit dan komponen/refill

Target awal paling kuat berdasarkan consumer listening:
- pemula hidroponik
- orang yang sedang mengalami masalah pada tanaman
- evaluator hemat/DIY

Value proposition utama:
**“Bukan sekadar menunjukkan angka. HYCANE membantu pengguna memahami kondisi sistem dan memberi tahu apa yang harus dilakukan.”**

============================================================
3. CONSUMER INSIGHT WAJIB MENJADI DASAR UX
============================================================

Dari social listening HYCANE:

- customer voice = 91.068 records
- 8 platform
- sekitar 84% dari orang yang menyebut pengalaman adalah pemula
- tutorial/edukasi menjadi permintaan eksplisit terbesar
- komunitas juga kuat
- TDS/EC dan pH termasuk fitur yang diminta secara eksplisit
- diagnosis masalah dan dashboard termasuk fitur yang diminta
- banyak orang sensitif harga dan menyukai DIY
- sustainability jarang menjadi alasan utama membeli
- ampas tebu jarang disebut sebagai buying reason
- users sering butuh jawaban praktis, bukan jargon AI
- AI sebagai kata hampir tidak menjadi demand utama

Implikasi UX:
1. Dashboard harus sederhana.
2. Tampilkan “apa yang terjadi” dan “apa yang harus dilakukan”.
3. Jangan memaksa user memahami angka.
4. Education harus sangat kuat.
5. Marketplace harus transparan.
6. Kit tidak boleh terlihat locked-in.
7. App adalah assistant, bukan sekadar data monitor.

============================================================
4. AUTHENTICATION
============================================================

Tidak perlu backend auth.

Buat demo login screen langsung saat aplikasi dibuka.

Demo credential:
Email:
`demo@hycane.id`

Password:
`hycane2026`

Fitur:
- input email
- input password
- show/hide password
- Remember me checkbox (demo only)
- Login button
- “Use Demo Account” button yang mengisi credential otomatis

Saat login berhasil:
- simpan state di localStorage
- redirect ke dashboard

Jangan membuat halaman registration.
Jangan membuat forgot password nyata.

============================================================
5. APP SHELL
============================================================

Setelah login, layout utama:

LEFT SIDEBAR DESKTOP
- Logo/wordmark HYCANE
- Dashboard
- Live Monitoring
- AI Recommendation
- My Crops
- Marketplace
- Education
- Community
- Orders
- Notifications
- Profile
- Settings
- Logout

TOP BAR
- page title
- current device status
- notification icon
- user avatar
- small “Demo Mode” badge

MAIN CONTENT
- card-based dashboard
- charts
- tables
- product cards
- educational cards

Mobile:
- sidebar berubah menjadi bottom navigation / hamburger

============================================================
6. DESIGN DIRECTION
============================================================

Style:
- modern agritech
- premium but approachable
- clean
- minimal clutter
- soft green + blue + neutral palette
- rounded cards
- subtle shadow
- high contrast text
- large data cards
- generous whitespace

Jangan membuat UI seperti admin template generik.

Gunakan visual hierarchy yang jelas.

Primary message:
“Tanam lebih mudah karena tahu apa yang harus dilakukan.”

Gunakan bahasa Indonesia untuk user-facing UI.
Istilah teknis boleh muncul setelah dijelaskan.

============================================================
7. DASHBOARD HOME
============================================================

Dashboard adalah halaman paling penting.

Bagian atas:

Greeting:
“Selamat pagi, Galih.”

Status:
“Semua sistem berjalan normal.”

Summary KPI cards:
1. pH air
2. TDS/EC
3. Suhu air
4. Ketinggian air
5. Pump status
6. Plants healthy

Contoh default values:
- pH: 6.2
- TDS: 880 ppm
- EC: 1.25 mS/cm
- Water temperature: 26.4°C
- Water level: 78%
- Pump: ON
- Plants healthy: 15/18

Berikan status warna:
- normal
- warning
- critical

Jangan gunakan warna berlebihan.

============================================================
8. REAL-TIME MONITORING
============================================================

Harus ada grafik hidup yang bergerak sendiri.

Gunakan Chart.js.

Update interval:
1,5 sampai 3 detik.

Data jangan bergerak random liar.
Gunakan bounded random walk + trend.

### pH
Rentang normal demo:
5.6 - 6.8

Base around:
6.2

Per update:
next = current + smallDelta
smallDelta kira-kira -0.03 s/d +0.03

Tambahkan drift kecil.

### TDS
Rentang demo:
650 - 1100 ppm

Base:
880 ppm

Per update perubahan kecil:
-12 sampai +12 ppm

Saat nutrient refill event:
naik 40-70 ppm, kemudian perlahan turun.

### EC
Hubungkan secara realistis ke TDS secara visual.

Jangan membuat EC naik turun independen secara ekstrem dari TDS.

### Water temperature
Range normal:
24.5 - 29.5°C

Jangan bergerak lebih dari 0.2°C per tick kecuali event.

Buat slow daily trend:
- siang lebih hangat
- malam lebih rendah

### Water level
Range:
35 - 90%

Turun perlahan karena consumption/evaporation.

Saat refill:
naik 20-30 points.

### Pump
Status ON/OFF.

Pump dapat berubah saat:
- user manual toggle
- anomaly event
- maintenance mode

### Sensor health
Tampilkan:
- pH sensor: 98%
- TDS sensor: 96%
- temperature sensor: 99%
- level sensor: 97%

============================================================
9. SIMULATION ENGINE
============================================================

Buat file:
`js/simulation.js`

Implement a deterministic-ish simulation with seedable PRNG if practical.

State object:
```js
{
  timestamp,
  ph,
  tds,
  ec,
  temperature,
  waterLevel,
  pumpOn,
  lightOn,
  sensorHealth,
  cropHealth
}
```

Gunakan helper:
- clamp(value,min,max)
- randomBetween(min,max)
- boundedRandomWalk(current, drift, noise, min, max)
- correlatedEcFromTds(tds)

Event scheduler:
- no event by default
- occasional “low water” event
- occasional “nutrient concentration rising” event
- occasional “water temperature high” event
- occasional “pump off” event

Events harus jarang.

Jangan membuat dashboard terlihat rusak terus-menerus.

Recommended frequency:
1 significant event every 45-120 seconds.

User controls:
- Simulate Low Water
- Simulate High pH
- Simulate High TDS
- Simulate High Temperature
- Simulate Pump Failure
- Reset to Normal

============================================================
10. AI RECOMMENDATION
============================================================

Buat halaman dedicated:
`ai.html`
atau state-based route jika memakai single page.

UI:
- status card
- current issue
- severity
- recommended action
- why it matters
- expected result
- “Mark as Done”
- “See tutorial”

Recommendation engine memakai rule-based demo logic.

Examples:

IF pH < 5.7:
Title: “pH terlalu rendah”
Explanation:
“Air terlalu asam. Kondisi ini dapat mengganggu ketersediaan nutrisi untuk tanaman.”
Action:
“Periksa kembali pembacaan dan lakukan penyesuaian pH secara bertahap sesuai panduan.”

IF pH > 6.8:
“pH terlalu tinggi”

IF TDS > 1100:
“Larutan nutrisi terlalu pekat”

IF TDS < 650:
“Larutan nutrisi terlalu encer”

IF temperature > 29.5:
“Air terlalu hangat”
Action:
“Kurangi paparan panas, tingkatkan sirkulasi, dan pantau kembali suhu.”

IF waterLevel < 35:
“Air hampir habis”
Action:
“Isi reservoir sampai level aman.”

IF pumpOn === false:
“Aliran air berhenti”

IMPORTANT:
Recommendation harus actionable.
Jangan sekadar:
“pH abnormal.”

Harus:
“pH terlalu rendah. Cek pembacaan terlebih dahulu lalu lakukan penyesuaian bertahap.”

============================================================
11. AI DEMO PRESENTATION
============================================================

Tambahkan small label:
“AI Recommendation Demo”

Sub-label:
“Demo menggunakan rule engine untuk mensimulasikan pengalaman AI sebelum model prediktif berbasis data sensor real dikembangkan.”

Jangan menyembunyikan status demo.

============================================================
12. LIVE ALERTS
============================================================

Toast notification:
- “pH turun mendekati batas aman”
- “Ketinggian air perlu diperiksa”
- “Sensor TDS membaca kenaikan konsentrasi”

Badge severity:
- Info
- Perhatian
- Mendesak

============================================================
13. MY CROPS
============================================================

Buat daftar tanaman:
- Selada Hijau
- Pakcoy
- Kangkung
- Caisim
- Bayam
- Tomat Cherry
- Cabai
- Stroberi
- Basil
- Mint

Setiap crop card:
- image
- growth stage
- days after planting
- health score
- estimated harvest
- current issue
- recommended action

Detail crop page:
- overview
- timeline
- environment chart
- notes
- recommendation
- harvest estimate

============================================================
14. MARKETPLACE
============================================================

Marketplace harus menjadi salah satu feature paling lengkap.

Categories:
1. HYCANE Kits
2. Growing Media
3. Nutrients
4. Seeds
5. Hydroponic Plumbing
6. Sensors & Electronics
7. Pumps & Water System
8. Containers & Trays
9. Spare Parts
10. Tools & Calibration
11. Starter Bundles

Search bar.
Filter:
- category
- price
- availability
- beginner-friendly

Sort:
- recommended
- price low to high
- best seller

Product card:
- image
- name
- rating
- price
- old benchmark price if useful
- stock
- badge
- add to cart

Product detail:
- gallery
- description
- specifications
- what it is for
- beginner explanation
- quantity
- add to cart

Cart:
- items
- quantity
- subtotal
- estimated shipping
- total

Checkout demo:
- delivery address
- payment method dummy
- order summary
- place order

Do not implement real payment.

============================================================
15. PRICING RULE
============================================================

The user asked for marketplace benchmark price + 30% gross margin.

IMPORTANT:
30% margin is NOT cost × 1.30.

Use:
`sellPrice = cost / (1 - 0.30)`

Equivalent:
`sellPrice = cost / 0.70`

Then round upward to a neat retail number.

After rounding, verify realized margin:
`margin = (sellPrice - cost) / sellPrice`

If realized margin is below 30%, increase selling price until >= 30%.

For demo bundles:
- add component retail prices
- optionally add a small assembly/service value
- ensure overall gross margin is >= 30% unless the product is explicitly flagged as promotional

Do not claim these demo prices are official market prices.

Display:
“Benchmark marketplace + HYCANE demo pricing”

============================================================
16. HYCANE KIT BUNDLES
============================================================

Create:

### HYCANE Starter
For beginners.
Components:
- hydroponic frame/container
- netpots
- biodegradable bagasse media starter pack
- basic nutrient
- seeds
- tubing
- pump
- beginner guide

### HYCANE Smart Kit
Full smart kit.
Add:
- ESP32
- pH monitoring
- TDS/EC monitoring
- temperature sensor
- water level monitoring
- display
- relay/control
- app connection
- recommendation engine

### HYCANE Grow Refill
- biodegradable media
- AB mix nutrient
- seed pack
- cleaning guide

### HYCANE Sensor Pack
- pH sensor/probe
- TDS/EC sensor
- temperature sensor
- water-level sensor

### HYCANE Plumbing Pack
- PVC pipe
- elbow
- T-joint
- end cap
- connectors
- tubing
- mini valve
- hose clamp

### HYCANE Maintenance Pack
- calibration solution
- cleaning supplies
- spare tubing
- spare pump
- spare fittings

============================================================
17. MARKETPLACE COMPONENT COVERAGE
============================================================

At minimum include the following product classes.

Hydroponic core:
- HYCANE Smart Kit
- HYCANE Starter Kit
- reservoir
- tray
- grow channel
- netpot 5 cm
- netpot 7 cm
- growing media

Plumbing:
- PVC pipe 2 inch
- PVC pipe 2.5 inch
- PVC pipe 3 inch
- elbow
- T-joint
- reducer
- end cap
- socket
- valve
- tubing 5/8 inch
- hose connector
- hose clamp
- bulkhead fitting

Water system:
- DC mini pump
- air pump
- air stone
- solenoid valve
- float valve/check valve

Sensors/electronics:
- ESP32 DevKit
- pH sensor
- TDS/EC sensor
- DS18B20 temperature sensor
- ultrasonic water-level sensor
- relay module
- LCD 16x2 / I2C display
- DC adapter
- perfboard
- connectors
- waterproof enclosure
- cable management

Hydroponic consumables:
- AB Mix nutrient 1 L
- pH Up
- pH Down
- calibration solution pH 4.00
- calibration solution pH 6.86/7.00
- cleaning solution
- replacement media pack

Seeds:
- lettuce
- pakcoy
- kale
- spinach
- water spinach/kangkung
- caisim
- mustard greens
- basil
- mint
- tomato cherry
- chili
- cucumber
- strawberry
- melon as an advanced crop option

Tools:
- pH meter
- TDS meter
- measuring cup
- syringe
- digital scale
- seedling tray
- scissors/pruning tool
- plant label

============================================================
18. IMAGE SEARCH AND ASSETS
============================================================

Find images from the internet for:
- hydroponic vegetables
- pH sensor
- TDS sensor
- ESP32 board
- water pump
- netpot
- PVC hydroponic pipe
- seedlings
- lettuce
- pakcoy
- kangkung
- tomatoes
- chili
- strawberries
- biodegradable growing media
- sugarcane bagasse

Preferred sources:
- Wikimedia Commons
- Unsplash
- Pexels
- official manufacturer images when appropriate
- marketplace listing images only for demo marketplace context and where use is permitted

Do not scrape arbitrary copyrighted product images and redistribute them as if owned.

Prefer images with stable direct URLs.

Store metadata:
- source URL
- image title
- provider
- license if known

If downloading images locally is feasible, save them in:
`assets/images/`

Add `assets/images/ATTRIBUTIONS.md`.

Fallback:
if an image cannot be downloaded, use a remote source URL or a clean placeholder.

Never let a broken image ruin the layout.

============================================================
19. EDUCATION HUB
============================================================

Education is a major feature, not a footer.

Research says education/tutorials are the strongest explicit demand signal.

Create learning dashboard with modules:

1. Hidroponik dari nol
2. Kenapa hidroponik cocok untuk lahan terbatas
3. Apa itu pH?
4. Apa itu TDS?
5. Apa itu EC?
6. Mengapa suhu air penting?
7. Mengapa ketinggian air penting?
8. Apa itu AB Mix?
9. Apa itu rockwool?
10. Kenapa HYCANE menggunakan media ampas tebu?
11. Apa itu biodegradable?
12. Apa itu ekonomi sirkular?
13. Apa itu IoT?
14. Apa itu AI recommendation?
15. Cara membaca dashboard HYCANE
16. Apa yang dilakukan ketika pH turun?
17. Apa yang dilakukan ketika TDS terlalu tinggi?
18. Apa yang dilakukan ketika tanaman layu?
19. Cara membersihkan sistem
20. Checklist sebelum mulai menanam
21. Troubleshooting akar busuk
22. Troubleshooting daun menguning
23. Troubleshooting lumut
24. Hemat listrik dalam hidroponik
25. DIY vs HYCANE: kapan sebaiknya pakai masing-masing

Every lesson:
- title
- why it matters
- explanation for beginner
- simple analogy
- example
- do/don’t
- short quiz

============================================================
20. EDUCATION WRITING STYLE
============================================================

Tuliskan seolah-olah menjelaskan kepada seseorang yang sama sekali belum pernah mendengar hidroponik.

Contoh untuk pH:

“pH adalah angka yang menunjukkan apakah air cenderung asam atau basa. Dalam hidroponik, pH penting karena membantu menentukan apakah nutrisi di dalam air dapat digunakan tanaman dengan baik.”

Jangan langsung:
“pH mengontrol nutrient availability.”

Gunakan analogi bila membantu.

Contoh TDS:
“TDS membantu memperkirakan seberapa banyak zat terlarut di dalam air. Dalam hidroponik, angka ini dipakai sebagai petunjuk kasar tentang konsentrasi larutan nutrisi.”

Selalu beri catatan bahwa rentang ideal dapat berbeda menurut tanaman dan fase pertumbuhan.

============================================================
21. COMMUNITY
============================================================

Buat halaman komunitas sederhana:
- latest discussions
- beginner questions
- troubleshooting
- showcase
- tips

Contoh post demo:
“Daun pakcoy saya menguning, apa yang harus dicek dulu?”

“Pipa 2 inch cocok untuk sistem apa?”

“Berapa kali harus cek pH?”

Jangan membutuhkan backend.
Gunakan seeded mock posts.

============================================================
22. NOTIFICATIONS
============================================================

Create notification center.

Categories:
- Monitoring
- Recommendation
- Orders
- Education

Examples:
“Water level turun ke 34%.”
“Waktunya cek nutrisi.”
“Pesanan HYCANE Refill Media siap diproses.”

============================================================
23. PROFILE
============================================================

Profile demo:
- Galih Aji
- Beginner Grower
- Surabaya
- 18 planting slots
- 15 healthy plants
- 3 active alerts
- member since 2026

Sections:
- account
- my devices
- crop history
- purchase history
- learning progress
- preferences

============================================================
24. ORDERS
============================================================

Seed demo orders.

Order statuses:
- Processing
- Packed
- Shipped
- Delivered

Example:
Order #HYC-2026-00124
HYCANE Grow Refill
Status: Delivered

============================================================
25. DEMO DATA MODEL
============================================================

Create JS modules or data files:
- `data/products.js`
- `data/crops.js`
- `data/education.js`
- `data/community.js`
- `data/orders.js`
- `data/user.js`
- `data/marketplaceSources.js`

Keep data separate from UI code.

============================================================
26. MARKETPLACE PRICE RESEARCH
============================================================

Before finalizing demo catalog:

1. Search current Indonesian marketplace benchmark prices.
2. Prefer Shopee Indonesia and Tokopedia.
3. Use multiple listings if possible.
4. Store observed benchmark price.
5. Store source URL.
6. Store capture date.
7. Calculate retail price from 30% margin formula.
8. Round to consumer-friendly retail numbers.
9. Verify margin >= 30%.

Never fabricate marketplace prices.

If no reliable listing is available:
- mark `research_status: needs-validation`
- do not invent a “source”
- you may temporarily use a fallback internal BOM estimate, but label it clearly as `internal-proposal-fallback`.

Current benchmark examples gathered during planning are available in:
`07_MARKETPLACE_CATALOG.md`

============================================================
27. IMPORTANT: DO NOT USE OLD FINANCIAL PLAN BLINDLY
============================================================

Do NOT make the app's marketplace pricing equal to the old proposal financial model.

The app is a product demo.

The marketplace should show believable consumer pricing based on actual benchmark sources + a transparent demo margin rule.

Do not claim:
“this is HYCANE's final commercial price.”

Use:
“demo retail price”.

============================================================
28. REALISTIC PRODUCT UX
============================================================

For each product show:
- real-world use case
- beginner explanation
- compatible items
- replacement schedule where relevant
- stock
- rating
- source benchmark
- demo retail price

For example:

pH sensor:
“What it does”
“Membaca tingkat keasaman air.”

“Why you care”
“pH membantu menentukan apakah nutrisi bisa tersedia dengan baik untuk tanaman.”

============================================================
29. FULL HYCOHYDRO KIT COMPOSITION
============================================================

For the flagship HYCANE Smart Kit page, show the bundle composition in a clean table:

- hydroponic structure
- reservoir
- netpots
- bagasse growing media
- pump
- ESP32
- pH sensor
- TDS/EC sensor
- temperature sensor
- water-level sensor
- relay
- display
- tubing
- fittings
- power adapter
- mobile access
- beginner education package

The customer must be able to see what is inside the kit.

============================================================
30. HYCANE STORY INSIDE THE APP
============================================================

Do not make environmental story dominant.

Place it in product detail and education:

“Kenapa ampas tebu?”
- ampas tebu adalah residu agroindustri
- HYCANE mengeksplorasi pemanfaatannya sebagai material biodegradable
- kinerjanya tetap harus divalidasi
- sustainability is a value layer, not the only purchase reason

============================================================
31. DASHBOARD MICROCOPY
============================================================

Replace technical-only statuses with useful language.

Bad:
“pH = 6.24”

Good:
“pH 6,24 · aman untuk kondisi saat ini”

Bad:
“TDS 1150 ppm”

Good:
“TDS 1.150 ppm · sedikit terlalu pekat”

Bad:
“Temperature 31.0°C”

Good:
“31°C · air cukup hangat, periksa sirkulasi”

============================================================
32. ACCESSIBILITY
============================================================

Must have:
- keyboard navigation
- visible focus states
- sufficient contrast
- semantic HTML
- alt text for images
- button labels

============================================================
33. PERFORMANCE
============================================================

Keep the app fast.

Do not load giant images.
Use lazy loading.
Use compressed images where possible.

Chart should update efficiently, not recreate the whole chart every tick.

============================================================
34. ERROR STATES
============================================================

Handle:
- broken image
- empty cart
- no notifications
- no search results
- simulated device offline

Do not show raw JS errors to user.

============================================================
35. DEMO MODE
============================================================

Add “Demo Mode” badge.

Add a hidden or visible presenter control panel that lets the team trigger:
- Low Water
- High pH
- High TDS
- High Temperature
- Pump Failure
- Reset All

Presenter control can be under Settings > Demo Controls.

This is important because the team needs predictable moments during live pitch.

============================================================
36. APP NAVIGATION
============================================================

Use URL hash routes for simplicity:

#/dashboard
#/monitoring
#/ai
#/crops
#/marketplace
#/marketplace/product/:id
#/education
#/education/:slug
#/community
#/orders
#/notifications
#/profile
#/settings

No server routing dependency.

============================================================
37. FILE STRUCTURE
============================================================

Use:

hycane-app/
├── index.html
├── README.md
├── CLAUDE.md
├── package_docs/
├── css/
│   ├── style.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── simulation.js
│   ├── recommendations.js
│   ├── storage.js
│   ├── ui.js
│   └── utils.js
├── data/
│   ├── products.js
│   ├── crops.js
│   ├── education.js
│   ├── community.js
│   ├── orders.js
│   └── user.js
├── assets/
│   ├── images/
│   └── icons/
└── docs/

You may simplify to one CSS and one JS if cleaner, but keep logical separation.

============================================================
38. README FOR APP
============================================================

Create app README with:
- project purpose
- stack
- how to run
- demo login
- routes
- simulation logic
- product pricing methodology
- image sources
- demo limitations

============================================================
39. BUILD ORDER
============================================================

Implement in this sequence:

PHASE 1
- shell
- login
- dashboard skeleton

PHASE 2
- live charts
- simulation
- alerts

PHASE 3
- recommendation engine
- AI page

PHASE 4
- marketplace
- product detail
- cart
- checkout demo

PHASE 5
- education
- community
- profile
- orders

PHASE 6
- visual polish
- images
- responsiveness

PHASE 7
- QA

============================================================
40. FINAL QA REQUIREMENTS
============================================================

Before saying “done”, test:

1. Login works.
2. Demo account autofills.
3. Dashboard opens.
4. Charts update automatically.
5. Values remain believable.
6. Manual event controls work.
7. Reset works.
8. AI recommendation changes according to current sensor state.
9. Marketplace search works.
10. Category filters work.
11. Product detail works.
12. Cart quantity changes.
13. Cart total is correct.
14. Checkout demo works.
15. Education search/filter works if included.
16. All images load or have fallback.
17. Broken image does not break layout.
18. Mobile nav works.
19. Logout works.
20. No console errors.

============================================================
41. FINAL ACCEPTANCE CRITERIA
============================================================

The final demo should feel like:

“an actual beginner-focused smart hydroponic product, not a generic IoT dashboard.”

Most important UX principle:

**SENSE → UNDERSTAND → ACT**

Sensor reads condition.
App explains condition.
Recommendation says what to do.
Education explains why.
Marketplace provides what the user may need.

That loop is the core of HYCANE.

============================================================
42. START NOW
============================================================

Read every file in the supplied Claude Code package first.

Then inspect the existing repository.

Do not overwrite good existing work blindly.

Build the app incrementally.

Run it locally.
Fix layout problems.
Fix console errors.

Do not stop after creating scaffolding.
The final result must be a working, navigable demo.
