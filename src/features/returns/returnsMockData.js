// Backend hali ulanmagan — Tovarlar qaytarishi moduli uchun mock ma'lumotlar.

export const RETURN_EXCHANGE_RATE = 12230
export const RETURN_WAREHOUSES = ['MAGAZIN', 'OMBOR']
export const RETURN_TRANSPORTS = ['Tanlanmagan', 'Anvar Matiz', 'Damas', 'Labo', 'Isuzu']
export const RETURN_AGENTS = [
  "Mirzajonov G'afforjon",
  'Alimov Shuxrat',
  'Kamol Usta',
  'Mirzadjonov Ziyodulla',
  'Usmonov Jamshid',
]

// Qaytarish sababi (mijoz/yetkazuvchiga qaytarishda qo'llaniladi)
export const RETURN_REASONS = [
  "O'lcham mos kelmadi",
  'Rang farqi',
  'Ortiqcha buyurtma',
  'Nuqson aniqlandi',
  'Shartnoma bekor qilindi',
]

// Rad etish sababi — qabul qilishdan bosh tortilganda ko'rsatiladi
export const REJECT_REASONS = [
  'Tovarda mijoz aybi bilan nuqson bor',
  "Qaytarish muddati o'tgan",
  "Hujjat / asos topilmadi",
  'Boshqa sabab',
]

// Statik tab hisoblagichlari (Figma: 212 / 168 / 44)
export const RETURN_TAB_COUNTS = { all: 212, client: 168, supplier: 44 }

const D = (
  number,
  date,
  counterparty,
  type,
  status,
  row
) => ({
  id: `QT-${number}`,
  number: `QT-${number}`,
  date,
  counterparty,
  agent: "Mirzajonov G'afforjon",
  warehouse: 'MAGAZIN',
  transport: 'Tanlanmagan',
  type, // 'client' | 'supplier'
  status, // 'draft' | 'review' | 'accepted' | 'rejected'
  reason: row.reason,
  comment: '',
  rejectReason: '',
  rejectComment: '',
  rows: [makeReturnRow(row)],
})

let rRow = 1
export function makeReturnRow(o) {
  const m2 = o.m2 ?? Number((o.widthM * o.lengthM).toFixed(2))
  const sum = o.sum ?? Number((m2 * o.priceUsd).toFixed(2))
  return {
    id: `rrow-${rRow++}`,
    name: o.name,
    partiya: o.partiya,
    basis: o.basis ?? '',
    widthM: o.widthM,
    lengthM: o.lengthM,
    m2,
    priceUsd: o.priceUsd,
    sum,
    reason: o.reason,
  }
}

// Figma freymlaridagi (1–3) yozuvlar — ro'yxat jadvali
export const initialReturns = [
  D('0212', '2023-12-29', 'Mirzajonov Sardor', 'client', 'accepted', {
    name: 'DELTA LOOP D-9900 400', partiya: '2168111', basis: 'SV-1042',
    widthM: 4, lengthM: 3, priceUsd: 4, reason: "O'lcham mos kelmadi",
  }),
  D('0211', '2023-12-28', '972013333', 'client', 'accepted', {
    name: 'ORZU 6866 YK24 400X1200', partiya: '12615696', basis: 'SV-1042',
    widthM: 3, lengthM: 1.5, priceUsd: 13, reason: 'Rang farqi',
  }),
  D('0210', '2023-12-27', '«TITAN GROUP» MCHJ', 'client', 'review', {
    name: 'DELTA LOOP D-9900 400', partiya: '2168124', basis: 'SV-1035',
    widthM: 4, lengthM: 6.5, priceUsd: 4, reason: 'Ortiqcha buyurtma',
  }),
  D('0209', '2023-12-26', 'Ibn Sino Sayfulla', 'supplier', 'review', {
    name: 'ORZU 0 400X1200', partiya: '10093468', basis: 'KR-0245',
    widthM: 4, lengthM: 1.75, priceUsd: 13, reason: 'Nuqson aniqlandi',
  }),
  D('0208', '2023-12-24', 'Xumo Arena', 'client', 'rejected', {
    name: 'VIVALDI 300X400', partiya: '2158911', basis: 'SV-1030',
    widthM: 3, lengthM: 40, priceUsd: 3.1, reason: 'Shartnoma bekor qilindi',
  }),
  D('0207', '2023-12-22', '909125500', 'client', 'accepted', {
    name: 'BROOKLYN 400X34', partiya: '2168130', basis: 'SV-1026',
    widthM: 4, lengthM: 3.75, priceUsd: 4, reason: "O'lcham mos kelmadi",
  }),
]

export const RETURN_COUNTERPARTIES = [...new Set(initialReturns.map((r) => r.counterparty))].sort()

let returnSeq = 213
export function nextReturnNumber() {
  return `QT-${String(returnSeq++).padStart(4, '0')}`
}

// "Shtrix kodni skanerlang" — mavjud sotuv/kirim hujjatlaridagi qaytarilishi mumkin
// rulonlar. `group` — bitta asos hujjatga tegishli rulonlarni bog'laydi: bitta rulon
// skanerlansa, o'sha hujjatdagi qolgan qaytariladigan rulonlar ham birga topiladi.
export const RETURNABLE_ROLLS = [
  {
    partiya: '2168111', group: 'SV-1042', basis: 'SV-1042', name: 'DELTA LOOP D-9900 400',
    counterparty: 'Mirzajonov Sardor', widthM: 4, lengthM: 3, priceUsd: 4, reason: "O'lcham mos kelmadi",
  },
  {
    partiya: '12615696', group: 'SV-1042', basis: 'SV-1042', name: 'ORZU 6866 YK24 400X1200',
    counterparty: 'Mirzajonov Sardor', widthM: 4, lengthM: 1.5, priceUsd: 13, reason: 'Rang farqi',
  },
  {
    partiya: '10093468', group: 'SV-1042', basis: 'SV-1042', name: 'ORZU 0 400X1200',
    counterparty: 'Mirzajonov Sardor', widthM: 4, lengthM: 2, priceUsd: 13, reason: "O'lcham mos kelmadi",
  },
  {
    partiya: '0080332', group: 'SV-1038', basis: 'SV-1038', name: 'AKTUEL 400X3000',
    counterparty: '958000000', widthM: 4, lengthM: 5, priceUsd: 30, reason: 'Ortiqcha buyurtma',
  },
  {
    partiya: '2168108', group: 'SV-1038', basis: 'SV-1038', name: 'TUMARIS 1530 YJ43 300',
    counterparty: '958000000', widthM: 3, lengthM: 1.2, priceUsd: 35, reason: 'Rang farqi',
  },
]

export function findReturnableGroup(code) {
  const hit = RETURNABLE_ROLLS.find((r) => r.partiya === code)
  if (!hit) return []
  return RETURNABLE_ROLLS.filter((r) => r.group === hit.group)
}
