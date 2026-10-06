// Rejalashtirilgan narx — sifatlar bo'yicha tannarx/sotuv narxi hujjatlari.
// DIQQAT: backendda narx hujjatlari uchun endpoint yo'q (Quality modelida narx maydoni ham yo'q) —
// hujjatlar Redux'da saqlanadi. Sifatlar ro'yxati, kurs va boshlang'ich narxlar esa API'dan olinadi.
// Quyidagi jurnal namunalari faqat interfeysni sinash uchun (mock).

// Mustaqil bo'lim (Ma'lumotnomalar ichida emas)
export const REJA_NARX_ROOT = '/rejalashtirilgan-narx'

export const STATUS = { DRAFT: 'draft', CONFIRMED: 'confirmed', CANCELLED: 'cancelled' }

// Nomni solishtirish uchun (mock qatorlarda id yo'q, API sifatlari bilan nom bo'yicha moslanadi)
export function qualityKey(name) {
  return String(name ?? '').trim().toLowerCase()
}

export function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100
}

// Ustama, % — sotuv narxining tannarxga nisbatan ustamasi
export function markupPct(row) {
  const cost = Number(row.cost) || 0
  return cost > 0 ? ((Number(row.sale) || 0) / cost - 1) * 100 : 0
}

// O'zgarish, % — yangi sotuv narxining eski sotuv narxiga nisbatan o'zgarishi
export function changePct(row) {
  const old = Number(row.oldSale) || 0
  return old > 0 ? ((Number(row.sale) || 0) / old - 1) * 100 : 0
}

export function isRowChanged(row) {
  return round2(row.cost) !== round2(row.oldCost) || round2(row.sale) !== round2(row.oldSale)
}

export function docStats(doc) {
  const rows = doc.rows ?? []
  const changed = rows.filter(isRowChanged)
  const avgMarkup = rows.length ? rows.reduce((s, r) => s + markupPct(r), 0) / rows.length : 0
  // Jurnal filtri uchun — o'zgargan qatorlar ichidagi eng katta mutlaq o'zgarish
  const maxChange = changed.reduce((m, r) => Math.max(m, Math.abs(changePct(r))), 0)
  return { qualities: rows.length, changed: changed.length, changedRows: changed, avgMarkup, maxChange }
}

// Amaldagi narxlar: har bir sifat uchun — amal qilish sanasi bo'yicha eng so'nggi TASDIQLANGAN
// hujjatdagi qiymat. Bekor qilingan hujjat hisobga olinmaydi, shuning uchun bekor qilish
// narxlarni avtomatik ravishda oldingi hujjat qiymatlariga qaytaradi.
export function currentPrices(docs, { excludeId } = {}) {
  const confirmed = docs
    .filter((d) => d.status === STATUS.CONFIRMED && d.id !== excludeId)
    .sort((a, b) => (a.effectiveDate + a.createdAt).localeCompare(b.effectiveDate + b.createdAt))
  const map = new Map()
  for (const doc of confirmed) {
    for (const r of doc.rows) {
      const entry = { cost: r.cost, sale: r.sale, docNumber: doc.number }
      if (r.qualityId) map.set(r.qualityId, entry)
      map.set(qualityKey(r.quality), entry)
    }
  }
  return map
}

export function priceFor(map, row) {
  return map.get(row.qualityId) ?? map.get(qualityKey(row.quality)) ?? null
}

// Bekor qilinganda narxlar qaytadigan hujjat — shu hujjatdan oldingi so'nggi tasdiqlangan
export function previousConfirmed(docs, doc) {
  return (
    docs
      .filter(
        (d) =>
          d.status === STATUS.CONFIRMED &&
          d.id !== doc.id &&
          d.effectiveDate + d.createdAt <= doc.effectiveDate + doc.createdAt
      )
      .sort((a, b) => (b.effectiveDate + b.createdAt).localeCompare(a.effectiveDate + a.createdAt))[0] ?? null
  )
}

let seq = 13
export function nextNumber() {
  return `RN-${String(seq++).padStart(4, '0')}`
}

// ── Mock jurnal ──
const BASE = [
  ['FLORA', 6.8, 9.2], ['DÉCOR', 7.5, 11.8], ['GOLF', 5, 6.9], ['LAVANDA', 5.5, 8.6],
  ['VERDE50', 8, 10.4], ['GRAVITY', 10, 14.7], ['PLATINA', 5.95, 8], ['BROOKLYN', 5.25, 6.9],
  ['COLIBRI', 3.35, 4.8], ['CORDINAL', 3.45, 4.9], ['CRISTAL', 9.45, 11.8], ['DALIDA', 7.75, 9.6],
  ['LOOP', 3, 4], ['MIRAGE', 4.6, 6.9], ['PALOS', 4.2, 6.4], ['AKTUEL', 6.2, 8.1],
  ['TUMARIS', 3.2, 4.3], ['DELTA LOOP', 3.1, 4], ['ORZU', 11.2, 13], ['SAHARA', 5.6, 7.4],
  ['MONACO', 8.4, 11.2], ['VENEZIA', 7.1, 9.5], ['OPERA', 6.6, 8.9], ['ROYAL', 12.4, 16.5],
  ['KASHMIR', 9.9, 13.1], ['EMPIRE', 8.8, 11.6], ['ATLAS', 4.9, 6.5], ['OSCAR', 5.3, 7.2],
]

const SPECS = [
  // number, createdAt, effectiveDate, rate, qualities, changed (sotuv narxi o'zgarishi, %), author, status
  ['RN-0001', '2025-10-04T10:15', '2025-10-05', 12650, 10, [[0, 3], [3, -2]], 'Axrorjon', STATUS.CONFIRMED],
  ['RN-0002', '2025-11-12T09:40', '2025-11-12', 12700, 12, [[1, 4], [5, 2], [8, -3]], 'Salmonov S.', STATUS.CONFIRMED],
  ['RN-0003', '2025-12-18T15:05', '2025-12-20', 12680, 14, [[2, 5], [9, 3]], 'Mirzajonov G‘.', STATUS.CONFIRMED],
  ['RN-0004', '2026-01-15T11:30', '2026-01-15', 12640, 16, [[4, 2], [10, 4], [12, -2], [14, 3]], 'Axrorjon', STATUS.CONFIRMED],
  ['RN-0005', '2026-02-10T09:20', '2026-02-10', 12600, 16, [[3, 2], [6, -3], [11, 4]], 'Axrorjon', STATUS.DRAFT],
  ['RN-0006', '2026-03-05T15:55', '2026-03-05', 12600, 18, Array.from({ length: 18 }, (_, i) => [i, 2]), 'Mirzajonov G‘.', STATUS.CONFIRMED],
  ['RN-0007', '2026-04-02T11:12', '2026-04-02', 12450, 18, [[7, 3], [15, -2]], 'Salmonov S.', STATUS.CONFIRMED],
  ['RN-0008', '2026-05-15T14:40', '2026-05-15', 12300, 20, [[0, 2], [2, 3], [4, -2], [6, 4], [9, 2], [13, 3], [16, -3], [19, 5]], 'Axrorjon', STATUS.CONFIRMED],
  ['RN-0009', '2026-06-03T10:05', '2026-06-03', 12300, 20, [[1, 6], [5, 4], [8, -5], [12, 3]], 'Mirzajonov G‘.', STATUS.CANCELLED],
  ['RN-0010', '2026-07-01T09:30', '2026-07-01', 12150, 22, [[3, 2], [7, 3], [10, -2], [17, 4], [21, 2]], 'Salmonov S.', STATUS.CONFIRMED],
  ['RN-0011', '2026-08-20T16:13', '2026-08-20', 12000, 22, Array.from({ length: 22 }, (_, i) => [i, 3]), 'Axrorjon', STATUS.CONFIRMED],
  ['RN-0012', '2026-10-06T11:01', '2026-10-06', 12000, 28, [[8, 8.3], [13, 4.3], [14, -6.3]], 'Salmonov S.', STATUS.DRAFT],
]

// Har bir hujjatda: yangi narx — BASE (amaldagi holat), eski narx — o'zgarish foiziga teskari.
// RN-0012 da esa aksincha: eski = BASE (amaldagi), yangi = o'zgartirilgan (Figma'dagi kabi).
function buildMockDocs() {
  return SPECS.map(([number, createdAt, effectiveDate, rate, count, changes, author, status]) => {
    const changeMap = new Map(changes)
    const forward = number === 'RN-0012'
    const rows = BASE.slice(0, count).map(([name, cost, sale], i) => {
      const pct = changeMap.get(i) ?? 0
      const shifted = round2(sale * (forward ? 1 + pct / 100 : 1 / (1 + pct / 100)))
      return {
        qualityId: '',
        quality: name,
        oldCost: cost,
        oldSale: forward ? sale : shifted,
        cost,
        sale: forward ? shifted : sale,
      }
    })
    return {
      id: number,
      number,
      createdAt,
      effectiveDate,
      rate,
      scopeId: '',
      scope: 'Barcha sifatlar',
      rows,
      author,
      status,
      confirmedAt: status !== STATUS.DRAFT ? `${effectiveDate}T11:24` : '',
      confirmedBy: status !== STATUS.DRAFT ? author : '',
      cancelReason: status === STATUS.CANCELLED ? 'Narxlar noto‘g‘ri kiritilgan, yangi hujjat tuziladi' : '',
      cancelFile: '',
    }
  }).reverse()
}

export const initialDocs = buildMockDocs()
