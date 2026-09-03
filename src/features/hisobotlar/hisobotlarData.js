// Backend hali ulanmagan — "Hisobotlar" moduli uchun mock ma'lumotlar.
// Bitta katalog sahifasi + bitta umumiy hisobot generatori (slug bo'yicha).

export const COMPANY = {
  name: 'SAG GILAMLARI MCHJ',
  address: "Andijon sh., Boburshoh ko'chasi 17g · +998 91 601 43 33",
}

export const REPORT_WAREHOUSES = ['MAGAZIN', 'OMBOR', 'Bron ombori', 'SAG ZAVOD']
export const REPORT_QUALITIES = [
  'ACTUAL', 'AKTUEL', 'ORZU', 'BROOKLYN', 'DELTA LOOP', 'TUMARIS', 'VIVALDI', 'GAZON', 'SHAGGY', 'TITAN', 'KOVROLIN',
]
export const REPORT_STAKEHOLDERS = ['Mirzajonov Sardor', 'Alimov Shuxrat', "Mirzajonov G'afforjon", 'Xolboyev N.']
export const REPORT_COUNTERPARTIES = ['«TITAN GROUP» MCHJ', 'Xumo Arena', 'Ibn Sino Sayfulla', '972013333', '958000000']
export const ACCOUNT_KINDS = ["Savdo va to'lovlar", 'Faqat savdo', "Faqat to'lovlar"]

// ── Katalog ────────────────────────────────────────────────────────────────
export const REPORT_CATALOG = [
  {
    section: "Omborlar bo'yicha",
    icon: 'warehouse',
    items: [
      { slug: 'tovarlar-kirimi', name: 'Tovarlar kirimi' },
      { slug: 'tovarlar-hisoboti', name: 'Tovarlar hisoboti' },
      { slug: 'omborlararo-otkazma', name: "Omborlararo o'tkazma" },
      { slug: 'tovarlar-qoldigi', name: "Tovarlar qoldig'i" },
      { slug: 'hisobdan-chiqarilgan', name: 'Hisobdan chiqarilgan tovarlar' },
      { slug: 'qaytarilgan-tovarlar', name: 'Qaytarilgan tovarlar' },
      { slug: 'sifat-qoldigi', name: "Sifat qoldig'i" },
      { slug: 'zavod-sifat-qoldigi', name: "Zavod sifat qoldig'i" },
    ],
  },
  {
    section: "Savdo bo'yicha",
    icon: 'cart',
    items: [
      { slug: 'savdo-aylanmasi', name: 'Savdo aylanmasi' },
      { slug: 'savdo-aylanmasi-oylik', name: 'Savdo aylanmasi (oylik)' },
      { slug: 'kunlik-savdo', name: 'Kunlik savdo' },
    ],
  },
  {
    section: "Kassalar bo'yicha",
    icon: 'cash',
    items: [
      { slug: 'kassalar-hisoboti', name: 'Kassalar hisoboti' },
      { slug: 'kassa-kirimi', name: 'Kassa kirimi' },
      { slug: 'kassa-chiqimi', name: 'Kassa chiqimi' },
      { slug: 'kassalararo-otkazmalar', name: "Kassalararo o'tkazmalar" },
      { slug: 'xarajatlar', name: 'Xarajatlar' },
    ],
  },
  {
    section: "Ish haqi bo'yicha",
    icon: 'briefcase',
    items: [
      { slug: 'xodimlar-hisob-kitob', name: 'Xodimlar (hisob-kitob)' },
      { slug: 'qoshimcha-ushlanma', name: "Qo'shimchalar va ushlanmalar" },
      { slug: 'ishchilarga-berilgan', name: 'Ishchilarga berilgan summalar' },
      { slug: 'tabel-hisoboti', name: 'Tabel hisoboti' },
      { slug: 'ish-haqi-umumiy', name: 'Ish haqi (umumiy)' },
    ],
  },
  {
    section: "Kontragentlar bo'yicha",
    icon: 'users',
    items: [
      { slug: 'akt-sverka', name: 'Akt-sverka (hisob-kitob)' },
      { slug: 'kontragent-haq-qarz', name: 'Kontragentlar haq/qarzi' },
      { slug: 'kontragent-hisoboti', name: 'Kontragent hisoboti' },
    ],
  },
]

export const REPORT_INDEX = Object.fromEntries(
  REPORT_CATALOG.flatMap((s) => s.items.map((it) => [it.slug, { ...it, section: s.section, icon: s.icon }]))
)

// ── Batafsil konfiguratsiyalar (Figma freymlarida ko'rsatilganlar) ─────────
const TURNOVER_COLS = [
  { key: 'tovar', label: 'TOVAR', align: 'left' },
  { key: 'bosh', label: 'BOSH QOLDIQ, m²', align: 'right', num: 2, negRed: true },
  { key: 'kirim', label: 'KIRIM, m²', align: 'right', num: 2 },
  { key: 'chiqim', label: 'CHIQIM, m²', align: 'right', num: 2 },
  { key: 'oxirgi', label: 'OXIRGI QOLDIQ, m²', align: 'right', num: 2, negRed: true },
  { key: 'summa', label: 'SUMMA, USD', align: 'right', num: 2, negRed: true },
]

export const REPORT_CONFIGS = {
  'savdo-aylanmasi': {
    filterSet: 'stock',
    columns: TURNOVER_COLS,
    footnote: "- manfiy qoldiq: hujjatlar ketma-ketligi buzilgan, omborni tekshirish zarur",
    footnoteTone: 'red',
    rows: [
      { tovar: 'ACTUAL 1211 · 3×4', bosh: 420, kirim: 180, chiqim: 360, oxirgi: 240, summa: 18720 },
      { tovar: 'AKTUEL 2255 · 2×3', bosh: 260, kirim: 120, chiqim: 310, oxirgi: 70, summa: 5460 },
      { tovar: 'SHAGGY 5500 · oval', bosh: 180, kirim: 60, chiqim: 190, oxirgi: 50, summa: 4250 },
      { tovar: 'KOVROLIN VIVALDI · rulon', bosh: 1240, kirim: 600, chiqim: 980, oxirgi: 860, summa: 32680 },
      { tovar: 'GAZON PREMIUM · rulon', bosh: 320, kirim: 0, chiqim: 440, oxirgi: -120, summa: -4800 },
      { tovar: 'TITAN 3300 · 2×3', bosh: 150, kirim: 240, chiqim: 180, oxirgi: 210, summa: 9870 },
    ],
    total: { tovar: 'JAMI', bosh: 2570, kirim: 1200, chiqim: 2460, oxirgi: 1310, summa: 66180 },
  },
  'tovarlar-hisoboti': {
    filterSet: 'stock',
    columns: TURNOVER_COLS,
    footnote: "- manfiy qoldiq: hujjatlar ketma-ketligi buzilgan, omborni tekshirish zarur",
    footnoteTone: 'red',
    rows: [
      { tovar: 'AKTUEL 400X3000', bosh: 480, kirim: 360, chiqim: 240, oxirgi: 600, summa: 15000 },
      { tovar: 'ACTUAL 400X3000', bosh: 360, kirim: 120, chiqim: 600, oxirgi: -120, summa: -3000 },
      { tovar: 'ORZU 6866 YK24 400X1200', bosh: 816, kirim: 480, chiqim: 96, oxirgi: 1200, summa: 15600 },
      { tovar: 'ORZU 9548 YK23 400X2', bosh: 204, kirim: 102, chiqim: 102, oxirgi: 204, summa: 2284.8 },
      { tovar: 'DELTA LOOP D-9900 400', bosh: 312, kirim: 208, chiqim: 520, oxirgi: 0, summa: 0 },
      { tovar: 'TUMARIS 1530 YJ43 300', bosh: 48, kirim: 12, chiqim: 60, oxirgi: 0, summa: 0 },
      { tovar: 'BROOKLYN 400X34', bosh: 1920, kirim: 960, chiqim: 1920, oxirgi: 960, summa: 9216 },
      { tovar: 'VIVALDI 300X400', bosh: 288, kirim: 240, chiqim: 48, oxirgi: 480, summa: 4608 },
    ],
    total: { tovar: 'JAMI', bosh: 4428, kirim: 2482, chiqim: 3586, oxirgi: 3324, summa: 43708.8 },
  },
  'sifat-qoldigi': {
    filterSet: 'stock',
    warning: '4 ta sifat bo\'yicha manfiy qoldiq aniqlandi — jami -412,00 m². Bu hujjatlar ketma-ketligi buzilganini bildiradi: chiqim kirimdan oldin o\'tkazilgan.',
    columns: [
      { key: 'sifat', label: 'SIFAT', align: 'left' },
      { key: 'ombor', label: 'OMBOR', align: 'left' },
      { key: 'partiyalar', label: 'PARTIYALAR', align: 'right', num: 0 },
      { key: 'qoldiq', label: 'QOLDIQ, m²', align: 'right', num: 2, negRed: true },
      { key: 'summa', label: 'SUMMA, USD', align: 'right', num: 2, negRed: true },
    ],
    footnote: "- manfiy qoldiq: hujjatlar ketma-ketligi buzilgan, omborni tekshirish zarur",
    footnoteTone: 'red',
    rows: [
      { sifat: 'ACTUAL', ombor: 'MAGAZIN', partiyalar: 12, qoldiq: -120, summa: -3000 },
      { sifat: 'AKTUEL', ombor: 'MAGAZIN', partiyalar: 8, qoldiq: -240, summa: -6000 },
      { sifat: 'BROOKLYN', ombor: 'OMBOR', partiyalar: 24, qoldiq: 960, summa: 9216 },
      { sifat: 'DELTA LOOP', ombor: 'OMBOR', partiyalar: 16, qoldiq: -32, summa: -128 },
      { sifat: 'ORZU', ombor: 'Bron ombori', partiyalar: 31, qoldiq: 1240, summa: 16120 },
      { sifat: 'TUMARIS', ombor: 'MAGAZIN', partiyalar: 9, qoldiq: -20, summa: -700 },
      { sifat: 'VIVALDI', ombor: 'MAGAZIN', partiyalar: 14, qoldiq: 480, summa: 4608 },
    ],
    total: { sifat: 'JAMI', ombor: '', partiyalar: 114, qoldiq: 2268, summa: 20116 },
  },
  'kassalar-hisoboti': {
    filterSet: 'stock',
    footnote: "Har bir kassa ikki qatorda ko'rsatiladi: dollar va UZS alohida yuritiladi, jami faqat dollarda jamlanadi.",
    footnoteTone: 'muted',
    columns: [
      { key: 'kassa', label: 'KASSA', align: 'left' },
      { key: 'valyuta', label: 'VALYUTA', align: 'left' },
      { key: 'bosh', label: 'BOSH QOLDIQ', align: 'right', perRowNum: true },
      { key: 'kirim', label: 'KIRIM', align: 'right', perRowNum: true },
      { key: 'chiqim', label: 'CHIQIM', align: 'right', perRowNum: true },
      { key: 'oxirgi', label: 'OXIRGI QOLDIQ', align: 'right', perRowNum: true },
    ],
    rows: [
      { kassa: 'KICHIK KASSA', valyuta: 'USD', bosh: 9150, kirim: 27413.2, chiqim: 14088.2, oxirgi: 22475 },
      { kassa: 'KICHIK KASSA', valyuta: 'UZS', bosh: 111904500, kirim: 335263436, chiqim: 172298686, oxirgi: 274869250 },
      { kassa: 'SAG ZAVOD', valyuta: 'USD', bosh: 3210, kirim: 5000, chiqim: null, oxirgi: 8210 },
      { kassa: 'SAG ZAVOD', valyuta: 'UZS', bosh: 39258300, kirim: 61150000, chiqim: null, oxirgi: 100408300 },
      { kassa: 'HUMO', valyuta: 'USD', bosh: 1480, kirim: 5100, chiqim: null, oxirgi: 6580 },
      { kassa: 'UZCARD', valyuta: 'USD', bosh: 2040, kirim: 11210, chiqim: null, oxirgi: 13250 },
      { kassa: 'PERECHISLENIYA', valyuta: 'USD', bosh: 6400, kirim: null, chiqim: 2400, oxirgi: 4000 },
      { kassa: 'SULAYMON KASSA', valyuta: 'USD', bosh: 820, kirim: null, chiqim: null, oxirgi: 820 },
    ],
    total: { kassa: 'JAMI, USD', valyuta: '', bosh: 23100, kirim: 48723.2, chiqim: 16488.2, oxirgi: 55335 },
  },
  'akt-sverka': {
    filterSet: 'aktsverka',
    footnote: 'Musbat saldo — kontragent qarzi. Akt ikki nusxada chop etiladi va imzo bilan tasdiqlanadi.',
    footnoteTone: 'muted',
    columns: [
      { key: 'sana', label: 'SANA', align: 'left' },
      { key: 'hujjat', label: 'HUJJAT', align: 'left' },
      { key: 'izoh', label: 'IZOH', align: 'left' },
      { key: 'debet', label: 'DEBET, USD', align: 'right', num: 2 },
      { key: 'kredit', label: 'KREDIT, USD', align: 'right', num: 2 },
      { key: 'saldo', label: 'SALDO, USD', align: 'right', num: 2 },
    ],
    rows: [
      { marker: true, sana: '01.01.2026', hujjat: '', izoh: 'Davr boshiga saldo', debet: null, kredit: null, saldo: 2140 },
      { sana: '14.02.2026', hujjat: 'SV-0871', izoh: 'Tovar sotuvi', debet: 4320, kredit: null, saldo: 6460 },
      { sana: '20.02.2026', hujjat: 'KAS-0412', izoh: "Naqd to'lov", debet: null, kredit: 4000, saldo: 2460 },
      { sana: '11.04.2026', hujjat: 'SV-1035', izoh: 'Tovar sotuvi', debet: 4760, kredit: null, saldo: 7220 },
      { sana: '18.04.2026', hujjat: 'KAS-0644', izoh: "Karta orqali to'lov", debet: null, kredit: 3940, saldo: 3280 },
      { sana: '22.06.2026', hujjat: 'QT-0209', izoh: 'Tovar qaytarishi', debet: null, kredit: 104, saldo: 3176 },
      { sana: '13.08.2026', hujjat: 'SV-1042', izoh: 'Tovar sotuvi', debet: 5232, kredit: null, saldo: 8408 },
      { marker: true, sana: '13.08.2026', hujjat: '', izoh: 'Davr oxiriga saldo', debet: null, kredit: null, saldo: 8408 },
    ],
    total: { sana: 'JAMI', hujjat: '', izoh: '', debet: 14312, kredit: 8044, saldo: 8408 },
  },
}

// Batafsil config bo'lmagan hisobotlar uchun umumiy namuna
export const GENERIC_CONFIG = {
  filterSet: 'stock',
  columns: [
    { key: 'k', label: "KO'RSATKICH", align: 'left' },
    { key: 'qiymat', label: 'QIYMAT, USD', align: 'right', num: 2 },
    { key: 'ulush', label: 'ULUSH', align: 'right', num: 1 },
  ],
  rows: [
    { k: 'MAGAZIN', qiymat: 42180, ulush: 46.2 },
    { k: 'OMBOR', qiymat: 28640, ulush: 31.4 },
    { k: 'Bron ombori', qiymat: 14320, ulush: 15.7 },
    { k: 'SAG ZAVOD', qiymat: 6110, ulush: 6.7 },
  ],
  total: { k: 'JAMI', qiymat: 91250, ulush: 100 },
}
