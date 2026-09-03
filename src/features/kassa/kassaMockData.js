// Backend hali ulanmagan — "Kassa" moduli uchun mock ma'lumotlar.
// Uch bo'lim: Ish o'rni · Kassa operatsiyalari · Kun yakuni.

export const KASSA_EXCHANGE_RATE = 12230

export const KASSAS = ['KICHIK KASSA', 'PERECHISLENIYA', 'SAG ZAVOD']
export const ACQUIRING = ['HUMO', 'UZCARD']

export const CASHIER_NAME = 'Sobirov A.'

// KICHIK KASSA joriy holati (Figma freym 29)
export const KASSA_BALANCE = {
  kassa: 'KICHIK KASSA',
  usd: 12480,
  uzs: 152630400,
  asOf: '13.08.2026 09:41',
  todayIn: 38420,
  todayOut: 9150,
  todayOps: 14,
}

// ── Ish o'rni — amal tugmalari ─────────────────────────────────────────────
export const SALES_ACTIONS = [
  { key: 'savdo', label: 'Tovarlar savdosi', to: '/tovarlar-savdosi' },
  { key: 'bron', label: 'Bron tovarlar', to: '/bron-tovarlar' },
  { key: 'qaytarish', label: 'Tovarlar qaytarishi', to: '/tovarlar-qaytarishi' },
  { key: 'nasiya', label: "Nasiya to'lovi qabuli", tab: 'navbat' },
  { key: 'kunlik', label: 'Kunlik savdo tushumi', to: '/kassa/operatsiyalar' },
  { key: 'inkassa', label: 'Inkassaga topshirish', modal: 'collection' },
]

export const KASSA_ACTIONS = [
  { key: 'chiqim', label: 'Kassa chiqimi', modal: 'cashout', chiqimType: 'Xarajat' },
  { key: 'kontragent', label: 'Kontragentga chiqim', modal: 'cashout', chiqimType: 'Kontragentga chiqim' },
  { key: 'kassaga', label: 'Kassadan kassaga', modal: 'cashout', chiqimType: 'Kassadan kassaga' },
  { key: 'konvert', label: 'Konvertatsiya', modal: 'convert' },
  { key: 'avans', label: 'Xodimga avans', modal: 'cashout', chiqimType: 'Xodimga avans' },
  { key: 'transport', label: 'Transport xizmati', modal: 'cashout', chiqimType: 'Xarajat' },
]

export const CHIQIM_TYPES = [
  'Xarajat',
  'Kontragentga chiqim',
  'Kassadan kassaga',
  'Xodimga avans',
  'Inkassaga topshirish',
]

export const CHIQIM_RECIPIENTS = [
  'Taksist',
  'Xissador Botir aka',
  'SAG ZAVOD',
  'Mirzadjonov Ziyodulla',
  "Mirzajonov G'afforjon",
  'Yetkazib beruvchi',
]

export const COLLECTORS = ['Sobirov A. · Inkassa xizmati', 'Yusupov B. · Inkassa xizmati']

// ── Oxirgi operatsiyalar (Ish o'rni pastki jadval, Figma freym 29) ─────────
let opSeq = 1
const OP = (o) => ({
  id: `op-${opSeq++}`,
  date: o.date ?? '2026-08-13',
  time: o.time,
  type: o.type,
  note: o.note,
  kassa: o.kassa ?? 'KICHIK KASSA',
  cashIn: o.cashIn ?? null,
  cashOut: o.cashOut ?? null,
  cashier: o.cashier ?? CASHIER_NAME,
  flow: o.cashIn != null ? 'kirim' : 'chiqim',
})

export const initialOperations = [
  OP({ date: '2026-08-13', time: '09:41', type: "Savdo to'lovi", note: 'SH-1042 · Mirzajonov Sardor', kassa: 'KICHIK KASSA', cashIn: 3922 }),
  OP({ date: '2026-08-13', time: '10:05', type: "Nasiya to'lovi", note: 'SH-1039 · «TITAN GROUP» MCHJ', kassa: 'KICHIK KASSA', cashIn: 1200 }),
  OP({ date: '2026-08-13', time: '11:48', type: "Savdo to'lovi", note: 'SH-1041 · 972013333', kassa: 'HUMO', cashIn: 5100 }),
  OP({ date: '2026-08-12', time: '16:20', type: 'Inkassadan kirim', note: 'Inkassa · 12 000 000 UZS', kassa: 'KICHIK KASSA', cashIn: 981.2 }),
  OP({ date: '2026-08-12', time: '14:02', type: 'Kassadan kassaga', note: 'SAG ZAVOD → KICHIK KASSA', kassa: 'KICHIK KASSA', cashIn: 5000 }),
  OP({ date: '2026-08-12', time: '09:30', type: "Savdo to'lovi", note: 'SH-1038 · 958000000', kassa: 'UZCARD', cashIn: 11210 }),
  OP({ date: '2026-08-13', time: '11:20', type: 'Xarajat', note: 'Transport xizmati · Taksist', kassa: 'KICHIK KASSA', cashOut: 150 }),
  OP({ date: '2026-08-13', time: '13:15', type: 'Inkassaga topshirish', note: 'Inkassa · 12 000 000 UZS', kassa: 'KICHIK KASSA', cashOut: 981.2 }),
  OP({ date: '2026-08-12', time: '17:40', type: 'Ish haqi', note: '01.11 — 30.11.2023 · 5 xodim', kassa: 'KICHIK KASSA', cashOut: 4957 }),
  OP({ date: '2026-08-12', time: '15:10', type: 'Xodimga avans', note: 'Mirzadjonov Ziyodulla', kassa: 'KICHIK KASSA', cashOut: 600 }),
  OP({ date: '2026-08-12', time: '12:02', type: 'Kassadan kassaga', note: 'KICHIK KASSA → SAG ZAVOD', kassa: 'KICHIK KASSA', cashOut: 5000 }),
  OP({ date: '2026-08-11', time: '10:25', type: 'Kontragentga chiqim', note: 'Xissador Botir aka', kassa: 'PERECHISLENIYA', cashOut: 2400, cashier: 'Salmonov S.' }),
]

export const OPERATION_TAB_COUNTS = { kirim: 128, chiqim: 96, all: 224 }

// ── Menejerlar navbati (Figma freym 30) ───────────────────────────────────
export const MANAGER_QUEUE = [
  { id: 'mgr-1', name: 'Mirzadjonov Ziyodulla', role: 'Menejer', initials: 'MZ', unpaid: 4, paid: 12 },
  { id: 'mgr-2', name: 'Alimov Shuxrat', role: 'Menejer', initials: 'AS', unpaid: 2, paid: 7 },
  { id: 'mgr-3', name: 'Usmonov Jamshid', role: 'Menejer', initials: 'UJ', unpaid: 1, paid: 5 },
  { id: 'mgr-4', name: 'Kamol Usta', role: 'Menejer', initials: 'KU', unpaid: 0, paid: 3 },
  { id: 'mgr-5', name: 'Qodirov Anvar', role: 'Menejer', initials: 'QA', unpaid: 0, paid: 2 },
  { id: 'mgr-6', name: 'Toshev Diyor', role: 'Menejer', initials: 'TD', unpaid: 0, paid: 1 },
  { id: 'mgr-7', name: 'Ergashev Bekzod', role: 'Menejer', initials: 'EB', unpaid: 0, paid: 0 },
]

let docSeq = 1
const DOC = (o) => ({
  id: `qdoc-${docSeq++}`,
  managerId: o.managerId,
  date: o.date,
  counterparty: o.counterparty,
  contract: o.contract,
  amountUsd: o.amountUsd,
  paidPct: o.paidPct, // 0..100
  paid: o.paid ?? false,
})

export const QUEUE_DOCS = [
  DOC({ managerId: 'mgr-1', date: '2026-08-13', counterparty: 'Xumo Arena', contract: 'SH-1030', amountUsd: 5990, paidPct: 0 }),
  DOC({ managerId: 'mgr-1', date: '2026-08-13', counterparty: '938240107', contract: 'SH-1039', amountUsd: 3450, paidPct: 91.7 }),
  DOC({ managerId: 'mgr-1', date: '2026-08-12', counterparty: '«TITAN GROUP» MCHJ', contract: 'SH-1035', amountUsd: 4760, paidPct: 82.8 }),
  DOC({ managerId: 'mgr-1', date: '2026-08-12', counterparty: 'Ibn Sino Sayfulla', contract: 'SH-1033', amountUsd: 4890, paidPct: 48.7 }),
  DOC({ managerId: 'mgr-2', date: '2026-08-13', counterparty: 'Anvar Savdo', contract: 'SH-1031', amountUsd: 2100, paidPct: 0 }),
  DOC({ managerId: 'mgr-2', date: '2026-08-12', counterparty: '905112233', contract: 'SH-1028', amountUsd: 3900, paidPct: 40 }),
  DOC({ managerId: 'mgr-3', date: '2026-08-13', counterparty: 'Sharq Ziyo', contract: 'SH-1032', amountUsd: 1750, paidPct: 0 }),
]

export function docStatus(doc) {
  if (doc.paid || doc.paidPct >= 100) return 'tolangan'
  if (doc.paidPct > 0) return 'qisman'
  return 'qarz'
}

// ── Kun yakuni (Figma freym 41) ──────────────────────────────────────────
export const DAY_END = {
  date: '13.08.2026',
  kassa: 'KICHIK KASSA',
  cashier: CASHIER_NAME,
  openUsd: 9150,
  openUzs: 111904500,
  inUsd: 27413.2,
  inOps: 128,
  outUsd: 14088.2,
  outOps: 96,
  closeUsd: 22475,
  closeUzs: 274869250,
  rows: [
    { type: "Savdo to'lovi", count: 96, cashIn: 20232, cashOut: null, cash: 13922, card: 6310 },
    { type: "Nasiya to'lovi", count: 24, cashIn: 1200, cashOut: null, cash: 1200, card: null },
    { type: 'Kassadan kassaga', count: 4, cashIn: 5000, cashOut: 5000, cash: 5000, card: null },
    { type: 'Inkassadan kirim', count: 4, cashIn: 981.2, cashOut: null, cash: 981.2, card: null },
    { type: 'Xarajat', count: 38, cashIn: null, cashOut: 150, cash: 150, card: null },
    { type: 'Ish haqi va avans', count: 12, cashIn: null, cashOut: 5557, cash: 5557, card: null },
    { type: 'Kontragentga chiqim', count: 6, cashIn: null, cashOut: 2400, cash: null, card: 2400 },
    { type: 'Inkassaga topshirish', count: 4, cashIn: null, cashOut: 981.2, cash: 981.2, card: null },
  ],
  totals: { count: 188, cashIn: 27413.2, cashOut: 14088.2, cash: 27791.4, card: 8710 },
}
