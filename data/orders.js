/* Seed order history. Prices are resolved at seed time from the pricing engine. */
var HC = window.HC || (window.HC = {});
HC.data = HC.data || {};

HC.data.ORDER_FLOW = ['Diproses', 'Dikemas', 'Dikirim', 'Selesai'];

HC.data.seedOrders = [
  { id: 'HC1024', daysAgo: 2, status: 'Dikirim', items: [['meter-set', 1], ['calib', 1]], courier: 'JNE REG', resi: 'JNE0198273645' },
  { id: 'HC1019', daysAgo: 33, status: 'Selesai', items: [['media-18', 1], ['abmix-leafy', 1]], courier: 'SiCepat', resi: 'SCP5521093847' },
  { id: 'HC1012', daysAgo: 55, status: 'Selesai', items: [['kit-smart', 1], ['kit-sensor', 1], ['esp32', 1], ['reservoir', 1], ['air-pump', 1], ['air-stone', 1]], courier: 'JNE YES', resi: 'JNE0177340012' },
];

HC.data.SHIPPING = { flat: 15000, freeOver: 500000 };
HC.data.PAYMENT_METHODS = [
  { id: 'va', label: 'Transfer Virtual Account (demo)' },
  { id: 'ewallet', label: 'E-wallet (demo)' },
  { id: 'cod', label: 'Bayar di tempat (demo)' },
];
