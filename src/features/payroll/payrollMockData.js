// Backend hali ulanmagan — "Ish haqi" moduli uchun mock ma'lumotlar.
// Uch bo'lim: Ish haqi hisoblash · Avans va ushlanmalar · Kunlik tabel.

export const PAYROLL_EXCHANGE_RATE = 12230
export const PAYROLL_KASSAS = ['KICHIK KASSA', 'PERECHISLENIYA']

// ── Xodimlar ────────────────────────────────────────────────────────────────
export const EMPLOYEES = [
  { id: 'emp-1', name: "Mirzajonov G'afforjon", role: 'Menejer', badge: '1001' },
  { id: 'emp-2', name: 'Mirzadjonov Ziyodulla', role: 'Menejer', badge: '1002' },
  { id: 'emp-3', name: 'Alimov Shuxrat', role: 'Menejer', badge: '1003' },
  { id: 'emp-4', name: 'Usmonov Jamshid', role: 'Menejer', badge: '1004' },
  { id: 'emp-5', name: 'Kamol Usta', role: 'Menejer', badge: '1005' },
  { id: 'emp-6', name: 'Qodirov Anvar', role: 'Kassir', badge: '1006' },
  { id: 'emp-7', name: 'Toshev Diyor', role: 'Menejer', badge: '1007' },
  { id: 'emp-8', name: 'Ergashev Bekzod', role: 'Omborchi', badge: '1008' },
]

// ── Hisoblash sxemalari ─────────────────────────────────────────────────────
export const CALC_SCHEMES = [
  { key: 'savdodan', label: 'Savdodan', kind: 'period' },
  { key: 'savdo_xarajat', label: 'Savdodan xarajat bilan', kind: 'period' },
  { key: 'savdo_foyda', label: 'Savdo foydasidan', kind: 'period' },
  { key: 'foyda_xarajat', label: 'Foydadan xarajat bilan', kind: 'period' },
  { key: 'xodim_savdo', label: 'Har bir xodim savdosidan', kind: 'employee', baseLabel: 'SHAXSIY SAVDO, USD' },
  { key: 'xodim_foyda', label: 'Har bir xodim foydasidan', kind: 'employee', baseLabel: 'SHAXSIY FOYDA, USD' },
]

// Sxema bo'yicha hisoblangan davrlar soni (Figma header badge: 7 / 6 / 5 / 4 / 7 / 7)
export const SCHEME_COUNTS = {
  savdodan: 7,
  savdo_xarajat: 6,
  savdo_foyda: 5,
  foyda_xarajat: 4,
  xodim_savdo: 7,
  xodim_foyda: 7,
}

let periodSeq = 1
const P = (from, to, totalSales, percent, totalAmount, employeeAmount, status) => ({
  id: `calc-${periodSeq++}`,
  from,
  to,
  scheme: 'savdodan',
  totalSales,
  percent,
  totalAmount,
  employeeAmount,
  author: 'SAG MENEJER',
  status, // 'berildi' | 'hisoblandi'
})

// Figma freym 17 dagi davrlar (eng ko'pi — 7 ta; sxemaga qarab kesiladi)
export const initialCalcPeriods = [
  P('2023-11-01', '2023-11-30', 270452.174, 2, 5409.043, 555.914, 'berildi'),
  P('2023-10-01', '2023-10-31', 367237.22, 2, 7344.744, 819.726, 'berildi'),
  P('2023-09-01', '2023-09-30', 261318.034, 2, 5226.361, 479.483, 'berildi'),
  P('2023-08-01', '2023-08-31', 271787.191, 2, 5435.744, 489.707, 'berildi'),
  P('2023-07-01', '2023-07-31', 267409.443, 2, 5348.189, 499.831, 'berildi'),
  P('2023-06-01', '2023-06-30', 253392.291, 2, 5067.846, 422.32, 'hisoblandi'),
  P('2023-05-01', '2023-05-31', 248100, 2, 4962.0, 410.0, 'hisoblandi'),
]

// ── Har bir xodim bo'yicha hisob-kitob (schemes 5–6) ────────────────────────
// base — shaxsiy savdo yoki foyda; fixed — kassir kabi ulushsiz xodim uchun.
const R = (empId, base, percent, avans, ushlanma, fixed = null) => {
  const emp = EMPLOYEES.find((e) => e.id === empId)
  const hisoblangan = base != null ? Number((base * percent / 100).toFixed(2)) : fixed
  return {
    empId,
    name: emp.name,
    role: emp.role,
    base,
    percent: base != null ? percent : null,
    hisoblangan,
    avans,
    ushlanma,
    beriladigan: Number((hisoblangan - avans - ushlanma).toFixed(2)),
  }
}

export const employeeBreakdown = {
  xodim_savdo: [
    R('emp-1', 86420, 2, 400, 0),
    R('emp-2', 112380, 2, 600, 50),
    R('emp-3', 64150, 2, 300, 0),
    R('emp-4', 48900, 2, 200, 0),
    R('emp-5', 37240, 2, 200, 25),
    R('emp-6', null, null, 150, 0, 420),
  ],
  xodim_foyda: [
    R('emp-1', 12963, 8, 400, 0),
    R('emp-2', 16857, 8, 600, 50),
    R('emp-3', 9622.5, 8, 300, 0),
    R('emp-4', 7335, 8, 200, 0),
    R('emp-5', 5586, 8, 200, 25),
  ],
}

export const sumBy = (rows, key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0)

let calcSeq = 100
export function nextCalcId() {
  return `calc-${calcSeq++}`
}

// ── Avans va ushlanmalar ────────────────────────────────────────────────────
export const ADVANCE_TYPES = ['Avans', 'Ushlanma', "Qo'shimcha"]
export const ADVANCE_TAB_COUNTS = { Avans: 24, Ushlanma: 8, "Qo'shimcha": 5 }
export const ADVANCE_TOTAL = 37

let advSeq = 1
export function makeAdvance(o) {
  const usd = o.amountUsd ?? 0
  return {
    id: `adv-${advSeq++}`,
    date: o.date,
    empName: o.empName,
    type: o.type, // 'Avans' | 'Ushlanma' | "Qo'shimcha"
    note: o.note ?? '',
    amountUsd: usd,
    amountUzs: o.amountUzs ?? Math.round(usd * PAYROLL_EXCHANGE_RATE),
    author: o.author ?? 'AXRORJON',
  }
}

export const initialAdvances = [
  makeAdvance({ date: '2023-12-10', empName: 'Mirzadjonov Ziyodulla', type: 'Avans', note: 'Oylik avans', amountUsd: 600, author: 'SAG MENEJER' }),
  makeAdvance({ date: '2023-12-10', empName: "Mirzajonov G'afforjon", type: 'Avans', note: 'Oylik avans', amountUsd: 400, author: 'SAG MENEJER' }),
  makeAdvance({ date: '2023-12-10', empName: 'Alimov Shuxrat', type: 'Avans', note: 'Oylik avans', amountUsd: 300, author: 'SAG MENEJER' }),
  makeAdvance({ date: '2023-12-08', empName: 'Kamol Usta', type: 'Ushlanma', note: 'Kechikish uchun', amountUsd: 25, author: 'AXRORJON' }),
  makeAdvance({ date: '2023-12-05', empName: 'Mirzadjonov Ziyodulla', type: 'Ushlanma', note: 'Tovar shikasti', amountUsd: 50, author: 'AXRORJON' }),
  makeAdvance({ date: '2023-12-01', empName: 'Qodirov Anvar', type: "Qo'shimcha", note: 'Bayram ustamasi', amountUsd: 100, author: 'SAG MENEJER' }),
]

// ── Kunlik tabel ────────────────────────────────────────────────────────────
export const TIMESHEET_DATE = '2026-08-13'
export const TIMESHEET_WEEKDAY = 'payshanba'

let tsSeq = 1
const T = (empId, arrived, left, hours, status) => {
  const emp = EMPLOYEES.find((e) => e.id === empId)
  return { id: `ts-${tsSeq++}`, empId, name: emp.name, role: emp.role, arrived, left, hours, status }
}

// status: 'ishda' | 'kechikdi' | 'kelmadi'
export const initialTimesheet = [
  T('emp-1', '08:52', '18:04', 9.2, 'ishda'),
  T('emp-2', '08:47', '18:10', 9.38, 'ishda'),
  T('emp-3', '08:58', null, null, 'ishda'),
  T('emp-4', '09:14', null, null, 'kechikdi'),
  T('emp-5', '09:02', null, null, 'ishda'),
  T('emp-6', '08:40', '17:30', 8.83, 'ishda'),
  T('emp-7', null, null, null, 'kelmadi'),
  T('emp-8', null, null, null, 'kelmadi'),
]
