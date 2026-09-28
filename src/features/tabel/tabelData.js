// "Tabel" — xodimlarning oylik ish vaqti hisobi (filial + oy kesimida).
// Ma'lumotlar backenddan olinadi: hr/timesheets/ (tabel) va hr/timesheet-items/ (xodimning kunlik
// davomati). Bu faylda — backend javobini sahifalar uchun qulay shaklga keltiruvchi va hisoblovchi
// yordamchilar.

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

// Backend `status` <-> frontend holati ("approved" frontendda "confirmed" deb yuritiladi — StatusTabs bilan mos)
const FROM_BACKEND_STATUS = { draft: 'draft', approved: 'confirmed', cancelled: 'cancelled' }
export const TABEL_STATUS_PARAM = { draft: 'draft', confirmed: 'approved', cancelled: 'cancelled' }

// "Oy uchun" tanlovlari — backend for_month: 1..12
export const MONTH_OPTIONS = MONTHS.map((label, i) => ({ value: String(i + 1), label }))

// Yil + oy tanlovlari: keyingi oydan orqaga 12 oy — qiymat "YYYY-M" (M: 1..12)
export function periodOptions(now = new Date()) {
  return Array.from({ length: 13 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 - i, 1)
    return periodOption(d.getFullYear(), d.getMonth() + 1)
  })
}
export function periodOption(year, forMonth) {
  return { value: `${year}-${forMonth}`, label: `${MONTHS[forMonth - 1]} ${year}` }
}

export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export function monthDays(year, month) {
  return Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const wd = new Date(year, month, i + 1).getDay()
    return { day: i + 1, wd, weekend: wd === 0 || wd === 6 }
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
  return Math.round((minutes / 60) * 100) / 100
}

// "HH:MM" niqobi — klaviaturadan yozishda
export function maskTime(raw) {
  const d = String(raw).replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`
}

export const pad2 = (n) => String(n).padStart(2, '0')
export const fmtDmy = (year, month, day) => `${pad2(day)}.${pad2(month + 1)}.${year}`
export const fmtDateTime = (ts) => {
  if (ts == null) return ''
  const d = new Date(ts)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// ISO sana-vaqt -> "HH:MM" (mahalliy vaqt); bo'sh bo'lsa ''
export function isoToHm(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// (yil, oy 0-11, kun, "HH:MM") -> mahalliy vaqt mintaqasi bilan ISO ("2026-09-01T09:00:00+05:00")
export function toIsoDateTime(year, month, day, hm = '00:00') {
  const mins = toMinutes(hm)
  if (mins == null) return null
  const d = new Date(year, month, day, Math.floor(mins / 60), mins % 60)
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00` +
    `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
  )
}

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// ── Backend javobini normallashtirish ─────────────────────────────────────

const toTs = (v) => (v ? new Date(v).getTime() : null)
const numOrNull = (v) => (v == null || v === '' ? null : toNum(v))

// Backend hali qaytarmaydigan maydonlar (organization_info, year, employees_count, plan_hours,
// fact_hours, approved_at, cancel_reason ...) — backendga topshiriq berilgan; kelmasa null bo'ladi
// va sahifa zaxira manbadan (filiallar ro'yxati, qatorlar) oladi yoki "—" ko'rsatadi.
export function normalizeTimesheet(r) {
  const forMonth = Number(r?.for_month) || 1
  const org = r.organization_info ?? r.branch_info?.organization_info ?? null
  return {
    id: r.id,
    orgId: org?.id ?? '',
    orgName: org?.name ?? '',
    branchId: r.branch_info?.id ?? r.branch ?? '',
    branchName: r.branch_info?.name ?? '',
    year: Number(r.year) || null,
    forMonth,
    month: forMonth - 1,
    status: FROM_BACKEND_STATUS[r.status] ?? 'draft',
    itemsCount: r.items_count ?? 0,
    employeesCount: numOrNull(r.employees_count),
    planHours: numOrNull(r.plan_hours),
    factHours: numOrNull(r.fact_hours),
    createdAt: toTs(r.created_at),
    updatedAt: toTs(r.updated_at),
    approvedAt: toTs(r.approved_at),
    cancelledAt: toTs(r.cancelled_at),
    cancelReason: r.cancel_reason ?? '',
    cancelDocument: r.cancel_document ?? null,
  }
}

// Tabelda yil maydoni yo'q — qatorlar sanasidan olinadi, qatorlar bo'lmasa yaratilgan sanadan
// (dekabr tabeli yanvarda yaratilgan bo'lsa — o'tgan yil).
export function inferYear(tabel, items = []) {
  if (tabel.year) return tabel.year
  const first = items.find((it) => it.date)
  if (first) {
    const d = new Date(first.date)
    if (!Number.isNaN(d.getTime())) return d.getFullYear()
  }
  const created = tabel.createdAt ? new Date(tabel.createdAt) : new Date()
  const createdMonth = created.getMonth() + 1
  let year = created.getFullYear()
  if (tabel.forMonth - createdMonth > 6) year -= 1
  else if (createdMonth - tabel.forMonth > 6) year += 1
  return year
}

const EMPTY_ENTRY = { itemId: null, plan: 0, kelgan: '', tushlikChiqqan: '', tushlikQaytgan: '', ketgan: '', fakt: 0 }

function entryFromItem(item) {
  const times = {
    kelgan: isoToHm(item.input_date),
    tushlikChiqqan: isoToHm(item.output_lunch_date),
    tushlikQaytgan: isoToHm(item.input_lunch_date),
    ketgan: isoToHm(item.output_date),
  }
  return {
    itemId: item.id,
    plan: toNum(item.work_hour_in_plan),
    ...times,
    fakt: item.work_hour_in_fact != null ? toNum(item.work_hour_in_fact) : calcFact(times),
  }
}

export function withFact(entry) {
  return { ...entry, fakt: calcFact(entry) }
}

// Tabelning to'liq hisobi: kunlar, xodimlar (har kun yozuvlari bilan) va jamlar.
// items     — backend qatorlari (EmployeeTimesheetItem[])
// employees — qo'shimcha xodimlar [{ id, name }] (qatori hali yo'q xodimlar ham ko'rinsin — qoralama uchun)
// pending   — saqlanmagan o'zgarishlar { [empId]: { [day]: entry } }
export function buildSheet({ year, month, items = [], employees = [], pending = {} }) {
  const days = monthDays(year, month)
  const byEmp = new Map()

  items.forEach((item) => {
    const empId = item.employee_info?.id
    if (!empId) return
    const d = new Date(item.date)
    if (Number.isNaN(d.getTime()) || d.getFullYear() !== year || d.getMonth() !== month) return
    if (!byEmp.has(empId)) {
      byEmp.set(empId, {
        id: empId,
        name: item.employee_info.full_name ?? '',
        schedule: item.employee_info.work_schedule_info?.name ?? '',
        byDay: {},
      })
    }
    byEmp.get(empId).byDay[d.getDate()] = item
  })
  employees.forEach((e) => {
    if (e?.id && !byEmp.has(e.id)) byEmp.set(e.id, { id: e.id, name: e.name ?? '', schedule: e.schedule ?? '', byDay: {} })
  })

  const rows = [...byEmp.values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'uz'))
    .map((emp) => {
      const entries = days.map(({ day }) => {
        if (pending[emp.id]?.[day]) return withFact(pending[emp.id][day])
        const item = emp.byDay[day]
        return item ? entryFromItem(item) : EMPTY_ENTRY
      })
      const plan = entries.reduce((s, e) => s + e.plan, 0)
      const fakt = entries.reduce((s, e) => s + e.fakt, 0)
      return { id: emp.id, name: emp.name, schedule: emp.schedule, entries, plan, fakt, farq: fakt - plan }
    })

  const plan = rows.reduce((s, r) => s + r.plan, 0)
  const fakt = rows.reduce((s, r) => s + r.fakt, 0)
  return { days, rows, plan, fakt }
}

// Kunlik yozuv -> backend so'rov tanasi (PATCH uchun; yangi qator uchun create qo'shimchalari bilan)
export function entryToPayload(entry, { year, month, day }) {
  return {
    input_date: toIsoDateTime(year, month, day, entry.kelgan),
    output_lunch_date: toIsoDateTime(year, month, day, entry.tushlikChiqqan),
    input_lunch_date: toIsoDateTime(year, month, day, entry.tushlikQaytgan),
    output_date: toIsoDateTime(year, month, day, entry.ketgan),
    work_hour_in_fact: calcFact(entry).toFixed(2),
  }
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
