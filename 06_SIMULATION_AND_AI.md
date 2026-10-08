# SIMULATION + AI DEMO SPEC

## A. Simulation philosophy

Tujuan simulasi bukan membuat random numbers.
Tujuannya memberi kesan sistem sensor nyata.

Gunakan:
1. bounded random walk
2. correlated metrics
3. slow environmental trend
4. rare events
5. user-triggered events

## B. Recommended normal ranges

### pH
- normal lower: 5.8
- normal upper: 6.8
- default: 6.2

### TDS
- demo lower: 650 ppm
- demo upper: 1100 ppm
- default: 880 ppm

### Temperature
- default: 26.4 C
- warning: >29.5 C
- critical: >31 C

### Water level
- normal: 40-90%
- warning: <40%
- critical: <25%

These are demo ranges, not a universal agronomic prescription. Crop requirements vary.

## C. Event examples

### LOW WATER
- waterLevel drops to 25-35%
- alert appears
- AI recommendation appears
- chart shows gradual decline

### HIGH pH
- pH drifts to 7.1-7.3
- warning
- recommendation

### HIGH TDS
- TDS rises to 1200-1300
- EC follows correlated rise
- recommendation appears

### HIGH TEMPERATURE
- temperature rises above 30 C
- recommendation says to check heat and circulation

### PUMP FAILURE
- pump false
- waterLevel starts declining faster
- recommendation: check pump and power

## D. Recommendation priority

1. Pump failure
2. Low water
3. High temperature
4. pH out of range
5. TDS out of range
6. Sensor health warning

## E. Recommendation copy

Keep language actionable and beginner-friendly.

Bad:
“EC anomaly detected.”

Good:
“Kepekatan nutrisi naik cukup tinggi. Periksa pembacaan TDS/EC dan lakukan penyesuaian secara bertahap sesuai panduan tanaman.”

## F. AI disclaimer

“Rekomendasi pada demo ini menggunakan rule engine untuk mensimulasikan pengalaman AI. Model prediktif berbasis data sensor nyata merupakan tahap pengembangan berikutnya.”
