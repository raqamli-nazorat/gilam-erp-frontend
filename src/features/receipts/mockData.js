// Tovarlar kirimi uchun mahalliy konstantalar. Namunaviy (mock) kirim hujjatlari olib tashlandi —
// jurnalda faqat foydalanuvchi yaratgan hujjatlar bo'ladi (receiptsSlice — localStorage).
// Ombor, kontragent, sifat, rang, dizayn, kurs va partiyalar API'dan olinadi.

// Header'dagi global ombor tanlagichi uchun (hali API'ga ulanmagan umumiy element)
export const WAREHOUSES = ['MAGAZIN', 'OMBOR']

// SupplierMethodStep (eski, ishlatilmaydigan komponent) uchun qoldirilgan
export const COUNTERPARTIES = []

// Backendda material ma'lumotnomasi yo'q — qator tahririda mahalliy ro'yxat
export const MATERIALS = ['YS17', 'YK23', 'YJ43', 'YJ34']
export const SHAPES = [
  { value: 'R', label: "R · to'rtburchak" },
  { value: 'O', label: 'O · oval' },
  { value: 'D', label: 'D · doira' },
]

// Kurs API'dan (finance/currency-ledgers/) kelguncha ishlatiladigan zaxira qiymat
export const EXCHANGE_RATE = 12230
