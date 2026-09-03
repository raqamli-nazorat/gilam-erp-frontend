// Backend hali ulanmagan — "Qaytarish kirimi" (QK) moduli uchun mock ma'lumotlar.
// QK — tasdiqlangan "Tovarlar qaytarishi" (QT) hujjati asosida rulonlarni
// omborga qaytadan kirim qilish bosqichi.

export const QK_EXCHANGE_RATE = 12230
export const QK_WAREHOUSES = ['MAGAZIN', 'OMBOR']
export const QK_LOCATIONS = [
  'A-12 / 3-qator',
  'A-14 / 1-qator',
  'B-03 / 2-qator',
  'B-07 / 4-qator',
  'Nuqson zonasi',
]
export const QK_RECEIVERS = [
  'AXRORJON',
  "Mirzajonov G'afforjon",
  'Alimov Shuxrat',
  'Kamol Usta',
  'Usmonov Jamshid',
]
export const QK_QUALITIES = ['Yaroqli', 'Nuqsonli']
export const DEFECT_LOCATION = 'Nuqson zonasi'

// Statik tab hisoblagichlari (Figma: 142 / 26 · jami 168)
export const QK_TAB_COUNTS = { entered: 142, pending: 26 }
export const QK_TOTAL = QK_TAB_COUNTS.entered + QK_TAB_COUNTS.pending

let qkRowSeq = 1
export function makeQkRow(o) {
  const priceUsd = o.priceUsd ?? 0
  const sum = o.sum ?? Number((o.m2 * priceUsd).toFixed(2))
  return {
    id: `qkrow-${qkRowSeq++}`,
    name: o.name,
    partiya: o.partiya,
    basis: o.basis ?? '',
    m2: o.m2,
    priceUsd,
    sum,
    quality: o.quality ?? 'Yaroqli', // 'Yaroqli' | 'Nuqsonli'
    warehouse: o.warehouse ?? '',
    location: o.location ?? '',
    partiyaMode: o.partiyaMode ?? 'original', // 'original' | 'new'
  }
}

const D = (number, date, basis, counterparty, warehouse, status, rows) => ({
  id: `QK-${number}`,
  number: `QK-${number}`,
  date,
  basis,
  basisDate: date,
  counterparty,
  warehouse,
  receiver: 'AXRORJON',
  status, // 'pending' (Kutilmoqda) | 'entered' (Omborga kirdi)
  rows: rows.map((r) => makeQkRow({ ...r, basis })),
})

export const initialQk = [
  D('0168', '2023-12-29', 'QT-0212', 'Mirzajonov Sardor', 'MAGAZIN', 'entered', [
    { name: 'DELTA LOOP D-9900 400', partiya: '2168111', m2: 12, priceUsd: 4, quality: 'Yaroqli', warehouse: 'MAGAZIN', location: 'A-12 / 3-qator' },
  ]),
  D('0167', '2023-12-28', 'QT-0211', '972013333', 'MAGAZIN', 'entered', [
    { name: 'ORZU 6866 YK24 400X1200', partiya: '12615696', m2: 4.5, priceUsd: 13, quality: 'Yaroqli', warehouse: 'MAGAZIN', location: 'A-14 / 1-qator' },
  ]),
  D('0166', '2023-12-27', 'QT-0209', '«TITAN GROUP» MCHJ', 'OMBOR', 'pending', [
    { name: 'DELTA LOOP D-9900 400', partiya: '2168124', m2: 26, priceUsd: 4, quality: 'Yaroqli', warehouse: 'OMBOR' },
  ]),
  D('0165', '2023-12-26', 'QT-0208', 'Ibn Sino Sayfulla', 'OMBOR', 'pending', [
    { name: 'ORZU 0 400X1200', partiya: '10093468', m2: 7, priceUsd: 13, quality: 'Nuqsonli', warehouse: 'OMBOR' },
  ]),
  D('0164', '2023-12-22', 'QT-0204', '909125500', 'MAGAZIN', 'entered', [
    { name: 'BROOKLYN 400X34', partiya: '2168130', m2: 15, priceUsd: 4, quality: 'Yaroqli', warehouse: 'MAGAZIN', location: 'B-03 / 2-qator' },
  ]),
]

// "+ Kirim qilish" — tasdiqlangan QT-0213 asosida yangi qoralama QK yaratadi.
// Figma freym: QK-0169 · 13.08.2026.
export const QK_DRAFT_TEMPLATE = {
  date: '2026-08-13',
  basis: 'QT-0213',
  basisDate: '2026-08-13',
  counterparty: 'Mirzajonov Sardor',
  warehouse: 'OMBOR',
  receiver: 'AXRORJON',
  rows: [
    { name: 'DELTA LOOP D-9900 400', partiya: '2168111', m2: 12, priceUsd: 4, quality: 'Yaroqli', warehouse: 'OMBOR', location: 'A-12 / 3-qator', partiyaMode: 'original' },
    { name: 'ORZU 6866 YK24 400X1200', partiya: '12615696', m2: 6, priceUsd: 13, quality: 'Nuqsonli', warehouse: 'OMBOR', location: DEFECT_LOCATION, partiyaMode: 'new' },
  ],
}

let qkSeq = 169
export function nextQkNumber() {
  return `QK-${String(qkSeq++).padStart(4, '0')}`
}

// Yig'indi hisoblagichlar
export const qkArea = (doc) => doc.rows.reduce((s, r) => s + r.m2, 0)
export const qkValue = (doc) => doc.rows.reduce((s, r) => s + r.sum, 0)
export const qkDefectArea = (doc) =>
  doc.rows.filter((r) => r.quality === 'Nuqsonli').reduce((s, r) => s + r.m2, 0)
