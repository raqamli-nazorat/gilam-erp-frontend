// Backend hali ulanmagan — "Xarajatlar" moduli uchun mock ma'lumotlar.

export const EXPENSE_EXCHANGE_RATE = 12230

// Kassa manbalari. Har biri bitta tabga tegishli:
//   KICHIK KASSA   -> "Kichik kassa"
//   PERECHISLENIYA -> "Pul o'tkazmalari"
export const EXPENSE_KASSAS = ['KICHIK KASSA', 'PERECHISLENIYA']
export const KASSA_TAB = { 'KICHIK KASSA': 'kichik', PERECHISLENIYA: 'transfer' }

export const EXPENSE_TYPES = [
  'Transport xizmati',
  'Ijara',
  "Kommunal to'lovlar",
  'Ofis xarajatlari',
  'Reklama',
  'Taksi',
  'Bank xizmati',
  'Soliq',
]

export const EXPENSE_AUTHORS = ['SAG MENEJER', 'AXRORJON']

// Statik tab hisoblagichlari (Figma: 758 / 402 / 356)
export const EXPENSE_TAB_COUNTS = { all: 758, kichik: 402, transfer: 356 }

let expSeq = 1
export function makeExpense(o) {
  return {
    id: `exp-${expSeq++}`,
    date: o.date,
    type: o.type,
    kassa: o.kassa,
    note: o.note ?? '',
    amountUzs: o.amountUzs ?? null,
    amountUsd: o.amountUsd ?? null,
    author: o.author ?? 'AXRORJON',
  }
}

// Figma freymlaridagi (8) yozuvlar
export const initialExpenses = [
  makeExpense({ date: '2023-12-18', type: 'Transport xizmati', kassa: 'PERECHISLENIYA', note: "Toshkent yo'nalishi", amountUzs: 279378.98, author: 'SAG MENEJER' }),
  makeExpense({ date: '2023-12-18', type: 'Ijara', kassa: 'PERECHISLENIYA', note: 'Dekabr oyi uchun', amountUzs: 70000, author: 'SAG MENEJER' }),
  makeExpense({ date: '2023-12-18', type: "Kommunal to'lovlar", kassa: 'KICHIK KASSA', note: 'Elektr va suv', amountUzs: 590000, author: 'AXRORJON' }),
  makeExpense({ date: '2023-12-18', type: 'Ofis xarajatlari', kassa: 'KICHIK KASSA', note: 'Kanselyariya', amountUzs: 50000, author: 'AXRORJON' }),
  makeExpense({ date: '2023-12-15', type: 'Reklama', kassa: 'PERECHISLENIYA', note: 'Banner va flayer', amountUzs: 1200000, author: 'SAG MENEJER' }),
  makeExpense({ date: '2023-12-14', type: 'Taksi', kassa: 'KICHIK KASSA', note: 'Yetkazib berish', amountUzs: 800000, author: 'AXRORJON' }),
]
