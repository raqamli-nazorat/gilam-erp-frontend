import { fetchAllPages } from '@/services/apiHelpers'

// Backend (hr/calculating-salaries/) har bir XODIM uchun alohida qator qaytaradi
// ({ employee_info, branch_info, organization_info, for_month, amount, currency_amount, status }).
// Jurnalda esa bitta "hisob" = bitta filial + bitta oy (+ yil) bo'yicha barcha xodimlar qatori.
// Shu fayl qatorlarni hisoblarga guruhlash va hisob ID sini (URL uchun) yasash/o'qish uchun.

const SEP = '_'

// Qator yaratilgan yil (backend `year` qaytarmaydi — created_at dan olinadi)
function rowYear(r) {
  const d = r?.created_at ? new Date(r.created_at) : null
  return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear()
}

// Hisob ID si: "<branchId>_<oy>_<yil>" (UUID ichida "_" yo'q — xavfsiz ajratkich)
export function makeHisobId(branchId, forMonth, year) {
  return [branchId, Number(forMonth), Number(year)].join(SEP)
}

export function parseHisobId(id) {
  const parts = String(id || '').split(SEP)
  if (parts.length !== 3) return null
  const [branchId, m, y] = parts
  const forMonth = Number(m)
  const year = Number(y)
  if (!branchId || !forMonth || !year) return null
  return { branchId, forMonth, year }
}

// Guruh holati: bitta qoralama bo'lsa ham — qoralama; hammasi bekor qilingan — bekor qilingan;
// aks holda — tasdiqlangan.
export function deriveStatus(rows) {
  if (!rows.length) return 'draft'
  if (rows.some((r) => r.status === 'draft')) return 'draft'
  if (rows.every((r) => r.status === 'cancelled')) return 'cancelled'
  return 'approved'
}

export function groupSalaries(rows) {
  const map = new Map()
  for (const r of rows) {
    const branchId = r.branch_info?.id
    if (!branchId) continue
    const id = makeHisobId(branchId, r.for_month, rowYear(r))
    let g = map.get(id)
    if (!g) {
      g = {
        id,
        branchId,
        branchName: r.branch_info?.name || '',
        orgId: r.organization_info?.id || '',
        orgName: r.organization_info?.name || '',
        forMonth: Number(r.for_month),
        year: rowYear(r),
        rows: [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }
      map.set(id, g)
    }
    g.rows.push(r)
    if (r.created_at && (!g.createdAt || r.created_at < g.createdAt)) g.createdAt = r.created_at
    if (r.updated_at && (!g.updatedAt || r.updated_at > g.updatedAt)) g.updatedAt = r.updated_at
  }
  return [...map.values()]
    .map((g) => {
      // Bekor qilingan qatorlar summaga qo'shilmaydi (agar hisob to'liq bekor qilinmagan bo'lsa)
      const status = deriveStatus(g.rows)
      const counted = status === 'cancelled' ? g.rows : g.rows.filter((r) => r.status !== 'cancelled')
      return {
        ...g,
        status,
        employeeCount: new Set(g.rows.map((r) => r.employee_info?.id || r.id)).size,
        totalAmount: counted.reduce((s, r) => s + (Number(r.amount) || 0), 0),
      }
    })
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

// Bitta hisobga tegishli barcha qatorlar (backend filtrlari: employee, currency, search)
export async function getHisobRows({ branchId, forMonth, year, employee, currency, search }) {
  const params = { branch: branchId, for_month: forMonth }
  if (employee) params.employee = employee
  if (currency) params.currency = currency
  if (search?.trim()) params.search = search.trim()
  const rows = await fetchAllPages('hr/calculating-salaries/', params)
  return rows.filter((r) => rowYear(r) === Number(year))
}

// Valyutalar ro'yxati (id -> short_name) — sahifa davomida bir marta yuklanadi
let currencyCache = null
export async function getCurrencyMap() {
  if (!currencyCache) {
    currencyCache = fetchAllPages('finance/currencies/')
      .then((list) => Object.fromEntries(list.map((c) => [c.id, c.short_name || c.name || ''])))
      .catch(() => {
        currencyCache = null
        return {}
      })
  }
  return currencyCache
}

// Oyning birinchi va oxirgi kuni (YYYY-MM-DD) — date_from/date_to filtrlari uchun
export function monthRange(year, month) {
  const p = (n) => String(n).padStart(2, '0')
  const last = new Date(year, month, 0).getDate()
  return { from: `${year}-${p(month)}-01`, to: `${year}-${p(month)}-${p(last)}` }
}

// Qo'shimcha/ushlanma (AccrualRetention) summasi xodim valyutasida.
//   percent   — belgilangan qiymatning foizi;
//   fix_summa — o'z valyutasida; xodim valyutasidan farq qilsa, qatordagi kurs (amount / currency_amount)
//               orqali o'giriladi.
export function computeAdjustment(ar, employee, currencyMap = {}) {
  const value = Number(ar?.value) || 0
  if (ar?.type === 'percent') return (employee.base * value) / 100
  const arCur = currencyMap[ar?.currency] || ar?.currency_info?.short_name || 'UZS'
  if (arCur === employee.currency) return value
  if (arCur === 'UZS' && employee.rate) return value / employee.rate
  return value
}

// Oylik turi (RecruitmentDismissal.salary_type) — jadvaldagi qisqa nomi
export const SALARY_TYPE_LABEL = {
  fixed_amount: 'Oylik',
  sales_percent: 'Savdodan foiz',
  founder: 'Asoschi',
}

// "26.09.2026 09:00" -> Date (noto'g'ri bo'lsa null)
export function parseDmyHm(value) {
  const m = String(value || '').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0))
  return Number.isNaN(d.getTime()) ? null : d
}
