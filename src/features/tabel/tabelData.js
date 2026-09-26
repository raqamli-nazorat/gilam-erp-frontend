// "Tabel" — xodimlarning oylik ish vaqti hisobi (filial + oy kesimida).
// Backendda hozircha tabel endpoint'i yo'q — tashkilot/filial/xodim ro'yxatlari, tabellar va kunlik
// yozuvlar shu yerda deterministik tarzda yaratiladi (bir xil kalit — har doim bir xil natija).

export const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

// JS getDay(): 0 — yakshanba
export const WEEKDAY_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
export const WEEKDAY_FULL = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

export const TABEL_STATUS = {
  draft: 'Qoralama',
  confirmed: 'Tasdiqlangan',
  cancelled: 'Bekor qilingan',
}

export const ORGANIZATIONS = [
  { id: 'sag', name: 'SAG Gilamlari' },
  { id: 'buxoro', name: 'Buxoro Gilam Savdo' },
  { id: 'namangan', name: 'Namangan Karpet' },
  { id: 'andijon', name: 'Andijon Gilam Markazi' },
  { id: 'fargona', name: 'Farg‘ona To‘qimachilik' },
  { id: 'xorazm', name: 'Xorazm Gilam' },
  { id: 'qashqadaryo', name: 'Qashqadaryo Savdo' },
]

// staff — filialdagi odatiy xodimlar soni (tabel yaratilganda shundan olinadi)
export const BRANCHES = [
  { id: 'registon', orgId: 'sag', name: 'Registon filiali', staff: 8 },
  { id: 'siyob', orgId: 'sag', name: 'Siyob filiali', staff: 15 },
  { id: 'chilonzor', orgId: 'sag', name: 'Chilonzor filiali', staff: 22 },
  { id: 'yunusobod', orgId: 'sag', name: 'Yunusobod filiali', staff: 29 },
  { id: 'zavod', orgId: 'sag', name: 'Zavod ombori', staff: 11 },
  { id: 'buxoro-m', orgId: 'buxoro', name: 'Buxoro markaziy', staff: 18 },
  { id: 'gijduvon', orgId: 'buxoro', name: 'G‘ijduvon filiali', staff: 25 },
  { id: 'namangan-m', orgId: 'namangan', name: 'Namangan markaziy', staff: 32 },
  { id: 'chust', orgId: 'namangan', name: 'Chust filiali', staff: 14 },
  { id: 'andijon-m', orgId: 'andijon', name: 'Andijon markaziy', staff: 21 },
  { id: 'fargona-m', orgId: 'fargona', name: 'Farg‘ona markaziy', staff: 28 },
  { id: 'qoqon', orgId: 'fargona', name: 'Qo‘qon filiali', staff: 10 },
  { id: 'urganch', orgId: 'xorazm', name: 'Urganch markaziy', staff: 17 },
  { id: 'qarshi', orgId: 'qashqadaryo', name: 'Qarshi filiali', staff: 24 },
]

export const orgName = (id) => ORGANIZATIONS.find((o) => o.id === id)?.name ?? ''
export const branchName = (id) => BRANCHES.find((b) => b.id === id)?.name ?? ''

// Ish grafiklari: qaysi hafta kunlari ishlanadi va kunlik reja soati.
export const SCHEDULES = {
  asosiy: { id: 'asosiy', name: 'Asosiy smena', days: [1, 2, 3, 4, 5], hours: 8, start: '09:00', lunch: '13:00', back: '14:00', end: '18:00' },
  ombor: { id: 'ombor', name: 'Ombor smena', days: [1, 2, 3, 4, 5, 6], hours: 8, start: '09:00', lunch: '13:00', back: '14:00', end: '18:00' },
  kassa: { id: 'kassa', name: 'Kassa smena', days: [1, 3, 5, 6], hours: 8, start: '09:00', lunch: '13:00', back: '14:00', end: '18:00' },
}

const NAMES = [
  ['Abdullayev Otabek', 'ombor'], ['Karimov Jasur', 'asosiy'], ['Yusupova Malika', 'asosiy'],
  ['Rahimova Dilfuza', 'ombor'], ['Xolmatov Bekzod', 'kassa'], ['Norboyev Shohruh', 'asosiy'],
  ['Ismoilova Madina', 'ombor'], ['Nazarova Zilola', 'asosiy'], ['Sobirova Feruza', 'asosiy'],
  ['Hamidov Aziz', 'ombor'], ['Ortiqova Nodira', 'asosiy'], ['Qodirova Nigora', 'asosiy'],
  ['Rustamov Javohir', 'ombor'], ['Saidova Gulnora', 'asosiy'], ['Botirov Sherzod', 'kassa'],
  ['Tursunov Akmal', 'asosiy'], ['Ergasheva Shahnoza', 'asosiy'], ['Mirzayev Dilshod', 'ombor'],
  ['Jo‘rayeva Kamola', 'kassa'], ['Umarov Sardor', 'asosiy'], ['Qosimova Dildora', 'asosiy'],
  ['Safarov Bobur', 'ombor'], ['Aliyeva Sevara', 'asosiy'], ['Xasanov Ulug‘bek', 'ombor'],
  ['Po‘latova Munisa', 'asosiy'], ['Toshmatov Farrux', 'kassa'], ['G‘aniyeva Laylo', 'asosiy'],
  ['Yo‘ldoshev Anvar', 'ombor'], ['Raximov Islom', 'asosiy'], ['Abdurahmonova Zarina', 'asosiy'],
  ['Normatov Jamshid', 'ombor'], ['Sultonova Mohira', 'asosiy'],
]

export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export function monthDays(year, month) {
  return Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const wd = new Date(year, month, i + 1).getDay()
    return { day: i + 1, wd, weekend: wd === 0 || wd === 6 }
  })
}

// ── Deterministik "tasodif" ──────────────────────────────────────────────
export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

// Tabel xodimlari: filialga bog'liq barqaror ro'yxat (id — tabel ichidagi tartib raqami)
export function tabelEmployees(tabel) {
  const offset = Math.floor(hash(tabel.branchId) * NAMES.length)
  return Array.from({ length: tabel.employeeCount }, (_, i) => {
    const [name, schedule] = NAMES[(offset + i) % NAMES.length]
    return { id: String(i + 1), name, schedule, seed: `${tabel.branchId}|${name}` }
  })
}

// ── Vaqt yordamchilari ────────────────────────────────────────────────────
export function toMinutes(hm) {
  const m = String(hm ?? '').match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

// Fakt soat = (tushlikkacha) + (tushlikdan keyin). Noto'g'ri/yetishmayotgan vaqtlar — 0.
export function calcFact({ kelgan, tushlikChiqqan, tushlikQaytgan, ketgan }) {
  const a = toMinutes(kelgan)
  const b = toMinutes(tushlikChiqqan)
  const c = toMinutes(tushlikQaytgan)
  const d = toMinutes(ketgan)
  if (a == null || d == null) return 0
  let minutes
  if (b != null && c != null) minutes = Math.max(0, b - a) + Math.max(0, d - c)
  else minutes = Math.max(0, d - a)
  return Math.round((minutes / 60) * 10) / 10
}

// "HH:MM" niqobi — klaviaturadan yozishda
export function maskTime(raw) {
  const d = String(raw).replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`
}

const EMPTY_TIMES = { kelgan: '', tushlikChiqqan: '', tushlikQaytgan: '', ketgan: '' }

// Bir xodimning bir kunlik standart yozuvi
export function generateEntry(employee, year, month, day) {
  const s = SCHEDULES[employee.schedule]
  const wd = new Date(year, month, day).getDay()
  if (!s.days.includes(wd)) return { plan: 0, ...EMPTY_TIMES }

  const r = hash(`${employee.seed}|${year}-${month}-${day}`)
  const base = { plan: s.hours, kelgan: s.start, tushlikChiqqan: s.lunch, tushlikQaytgan: s.back, ketgan: s.end }
  if (r < 0.015) return { plan: s.hours, ...EMPTY_TIMES } // kelmagan
  if (r < 0.05) return { ...base, ketgan: '14:00', tushlikChiqqan: '12:00', tushlikQaytgan: '13:00' } // 4 soat
  if (r < 0.09) return { ...base, ketgan: '16:00' } // 6
  if (r < 0.12) return { ...base, ketgan: '16:30' } // 6,5
  if (r < 0.14) return { ...base, ketgan: '17:00' } // 7
  if (r < 0.19) return { ...base, ketgan: '17:30' } // 7,5
  return base
}

export function withFact(entry) {
  return { ...entry, fakt: calcFact(entry) }
}

// Tabelning to'liq hisobi: kunlar, xodimlar (har kun yozuvlari bilan) va jamlar.
export function buildSheet(tabel) {
  const { year, month, overrides = {} } = tabel
  const days = monthDays(year, month)
  const rows = tabelEmployees(tabel).map((emp) => {
    const entries = days.map(({ day }) => withFact(overrides[emp.id]?.[day] ?? generateEntry(emp, year, month, day)))
    const plan = entries.reduce((s, e) => s + e.plan, 0)
    const fakt = entries.reduce((s, e) => s + e.fakt, 0)
    return { ...emp, entries, plan, fakt, farq: fakt - plan }
  })
  const plan = rows.reduce((s, r) => s + r.plan, 0)
  const fakt = rows.reduce((s, r) => s + r.fakt, 0)
  return { days, rows, plan, fakt }
}

// Kun katakchasi turi — legenda bilan mos
export function cellKind(entry) {
  if (!entry.plan && !entry.fakt) return 'dam'
  if (entry.fakt === 0) return 'kelmagan'
  if (entry.fakt < entry.plan) return 'kam'
  return 'norma'
}

// Tabel sonlari: 7,5 / 8 / 2 632,0 kabi
export function fmtHours(v, fixed = false) {
  const n = Math.round(Number(v || 0) * 10) / 10
  const [i, f] = (fixed ? n.toFixed(1) : String(n)).split('.')
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return f ? `${int},${f}` : int
}

export const pad2 = (n) => String(n).padStart(2, '0')
export const fmtDmy = (year, month, day) => `${pad2(day)}.${pad2(month + 1)}.${year}`
export const fmtDateTime = (ts) => {
  const d = new Date(ts)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// "DD.MM.YYYY HH:MM" -> timestamp (noto'g'ri bo'lsa null)
export function parseDateTime(s) {
  const m = String(s ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0))
  return d.getMonth() === Number(m[2]) - 1 && Number(m[4] ?? 0) < 24 && Number(m[5] ?? 0) < 60 ? d.getTime() : null
}

// ── Boshlang'ich tabellar (106 ta) ───────────────────────────────────────
// Joriy oydan orqaga 8 oy × 14 filial dan deterministik tanlab olinadi; holatlar:
// 22 qoralama, 20 bekor qilingan, qolgani tasdiqlangan.
export function seedTabels(now = new Date()) {
  const list = []
  for (let back = 0; back < 8; back += 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - back, 1)
    const year = ref.getFullYear()
    const month = ref.getMonth()
    BRANCHES.forEach((b) => {
      const h = hash(`${b.id}|${year}-${month}`)
      const dayMax = back === 0 ? Math.max(1, now.getDate()) : daysInMonth(year, month)
      const created = new Date(year, month, 1 + Math.floor(h * dayMax), 9 + Math.floor(h * 97) % 9, Math.floor(h * 6007) % 60)
      list.push({
        branchId: b.id,
        orgId: b.orgId,
        year,
        month,
        h,
        createdAt: Math.min(created.getTime(), now.getTime()),
        employeeCount: Math.max(6, b.staff + Math.round((hash(`${b.id}${month}`) - 0.5) * 6)),
      })
    })
  }
  const picked = list.sort((a, b) => a.h - b.h).slice(0, 106)
  // Qoralama — eng yangilari ustunlik bilan, qolganlari deterministik aralash
  const byDate = [...picked].sort((a, b) => b.createdAt - a.createdAt)
  const draftSet = new Set(
    [...byDate.slice(0, 40)].sort((a, b) => hash(`d${a.branchId}${a.month}`) - hash(`d${b.branchId}${b.month}`)).slice(0, 22)
  )
  const rest = byDate.filter((t) => !draftSet.has(t))
  const cancelSet = new Set([...rest].sort((a, b) => hash(`c${a.branchId}${a.month}`) - hash(`c${b.branchId}${b.month}`)).slice(0, 20))

  return byDate.map((t, i) => {
    const status = draftSet.has(t) ? 'draft' : cancelSet.has(t) ? 'cancelled' : 'confirmed'
    const updatedAt =
      status === 'draft' ? t.createdAt : Math.min(t.createdAt + (1 + Math.floor(t.h * 4)) * 86_400_000 + 3_600_000 * 3, now.getTime())
    return {
      id: String(1000 + i),
      orgId: t.orgId,
      branchId: t.branchId,
      year: t.year,
      month: t.month,
      employeeCount: t.employeeCount,
      date: t.createdAt,
      createdAt: t.createdAt,
      updatedAt,
      confirmedAt: status === 'draft' ? null : updatedAt,
      status,
      overrides: {},
    }
  })
}

// Joriy oydan orqaga 12 oy — "YYYY-M" qiymatlar (tanlov ro'yxatlari uchun)
export function monthOptions() {
  const d = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    return periodOption(`${x.getFullYear()}-${x.getMonth()}`)
  })
}

export function periodOption(value) {
  const [y, m] = value.split('-').map(Number)
  return { value, label: y === new Date().getFullYear() ? MONTHS[m] : `${MONTHS[m]} ${y}` }
}
