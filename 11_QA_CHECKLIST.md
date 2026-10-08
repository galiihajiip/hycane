# QA CHECKLIST

## Functional

- [ ] Login berhasil
- [ ] Demo login autofill bekerja
- [ ] Logout bekerja
- [ ] Router/hash navigation bekerja
- [ ] Browser refresh tidak merusak state penting
- [ ] Dashboard tampil
- [ ] Monitoring tampil
- [ ] Chart auto-update
- [ ] Simulation event bekerja
- [ ] Reset bekerja
- [ ] Recommendation berubah berdasarkan state
- [ ] Marketplace search bekerja
- [ ] Filter category bekerja
- [ ] Product detail bekerja
- [ ] Cart add/remove/update bekerja
- [ ] Total cart benar
- [ ] Checkout demo bekerja
- [ ] Education list bekerja
- [ ] Education detail bekerja
- [ ] Community tampil
- [ ] Orders tampil
- [ ] Notifications tampil
- [ ] Profile tampil
- [ ] Demo controls bekerja

## Simulation sanity

- [ ] pH tidak melompat >0.1 tanpa event
- [ ] TDS dan EC bergerak berkorelasi
- [ ] temperatur berubah perlahan
- [ ] water level turun perlahan
- [ ] major anomaly jarang
- [ ] event bisa dipicu manual

## Recommendation sanity

- [ ] low pH mendapat recommendation
- [ ] high pH mendapat recommendation
- [ ] low TDS mendapat recommendation
- [ ] high TDS mendapat recommendation
- [ ] high temperature mendapat recommendation
- [ ] low water mendapat recommendation
- [ ] pump failure mendapat recommendation

## Marketplace

- [ ] semua produk punya category
- [ ] semua produk punya image/fallback
- [ ] semua benchmark punya source URL atau flagged needs-validation
- [ ] margin >=30% setelah rounding
- [ ] bundle total benar

## Visual

- [ ] no clipping
- [ ] no horizontal overflow desktop
- [ ] no broken layout mobile
- [ ] card heights consistent
- [ ] chart labels readable
- [ ] buttons have clear hierarchy
- [ ] warning colors readable
- [ ] images crop nicely

## Accessibility

- [ ] alt text
- [ ] focus states
- [ ] keyboard navigation
- [ ] sufficient contrast
- [ ] labels for form controls

## Code

- [ ] no console error
- [ ] no unused critical references
- [ ] no hardcoded secrets
- [ ] no external API key in frontend
- [ ] no broken relative path

## Pitch readiness

- [ ] login <10 seconds
- [ ] dashboard understandable in <20 seconds
- [ ] anomaly can be triggered reliably
- [ ] recommendation appears reliably
- [ ] marketplace can be reached in 1-2 clicks
- [ ] reset demo works instantly
