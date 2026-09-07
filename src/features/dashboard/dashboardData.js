// Backend hali ulanmagan — "Boshqaruv paneli" (platforma admini) bo'limi uchun mock ma'lumotlar.
// Tashkilotlar/Filiallar/Foydalanuvchilar sonlari tegishli slice'lardan hisoblanadi (bitta manba);
// savdo bilan bog'liq raqamlar Hisobotlar > Savdo bo'yicha'dagi JAMI summaga bog'langan.

export const AS_OF = '04.09.2026 17:00'

// "Savdo dinamikasi" — Okt 2025 – Sen 2026, mln UZS. Faqat oxirgi nuqta (Sen) Figma'da aniq
// ko'rsatilgan (1 284 440 000 UZS, +27,2%); qolgani egri chiziq shakliga mos taxminiy qatordir.
export const SAVDO_DINAMIKASI = {
  oylar: ['Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen'],
  qiymatlarMln: [640, 700, 800, 580, 620, 680, 700, 780, 720, 850, 1010, 1284.44],
}

// "Savdo kesimi, tashkilot" — donut (top 3 + qolganlari)
export const SAVDO_KESIMI = [
  { name: 'SAG Gilamlari', pct: 50.4 },
  { name: 'Buxoro Gilam Savdo', pct: 12.6 },
  { name: 'Namangan Karpet', pct: 9.0 },
  { name: 'Boshqa 9 ta tashkilot', pct: 28.0 },
]

// "Top tashkilotlar, savdo ulushi" — 12 tadan 6 tasi
export const TOP_TASHKILOTLAR = [
  { name: 'SAG Gilamlari', summa: 4812640000, pct: 50.4 },
  { name: 'Buxoro Gilam Savdo', summa: 1204300000, pct: 12.6 },
  { name: 'Namangan Karpet', summa: 864150000, pct: 9.0 },
  { name: 'Andijon Gilam Markazi', summa: 612480000, pct: 6.4 },
  { name: 'Farg‘ona To‘qimachilik', summa: 548920000, pct: 5.7 },
  { name: 'Xorazm Gilam', summa: 402660000, pct: 4.2 },
]

// "Pul qanday keladi" — to'lov usullari bo'yicha kesim
export const PUL_QANDAY_KELADI = [
  { name: 'Naqd', summa: 4298598000, pct: 45.0 },
  { name: 'Karta, HUMO va UZCARD', summa: 2674683000, pct: 28.0 },
  { name: 'O‘tkazma', summa: 1528390000, pct: 16.0 },
  { name: 'Bo‘lib to‘lash', summa: 1050769000, pct: 11.0 },
]
