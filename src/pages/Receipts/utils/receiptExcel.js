import XLSX from 'xlsx-js-style'

// Tovarlar kirimi Excel shabloni ustunlari. Sarlavhalar katta-kichik harf, apostrof va
// ", m" / ", USD" kabi qo'shimchalardan qat'i nazar taniladi.
const COLUMNS = [
  { key: 'quality', title: 'Sifat', aliases: ['sifat', 'quality'] },
  { key: 'design', title: 'Dizayn', aliases: ['dizayn', 'design'] },
  { key: 'color', title: 'Rang', aliases: ['rang', 'color'] },
  { key: 'material', title: 'Material', aliases: ['material'] },
  { key: 'shape', title: 'Shakli', aliases: ['shakl', 'shape'] },
  { key: 'partiya', title: 'Partiya', aliases: ['partiya', 'party', 'kod'] },
  { key: 'widthM', title: 'Eni, m', aliases: ['eni', 'width'] },
  { key: 'heightM', title: "Bo'yi, m", aliases: ['boyi', 'boy', 'uzunlik', 'length', 'height'] },
  { key: 'priceIn', title: 'Kirim narxi, USD', aliases: ['kirimnarx', 'kirim', 'tannarx', 'purchase'] },
  { key: 'markupPct', title: 'Ustama, %', aliases: ['ustama', 'markup'] },
  { key: 'priceSale', title: 'Sotuv narxi, USD', aliases: ['sotuvnarx', 'sotuv', 'sale'] },
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024

function headerKey(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function toNumber(value) {
  if (typeof value === 'number') return value
  const n = Number(String(value ?? '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function matchColumn(header) {
  const key = headerKey(header)
  if (!key) return null
  return COLUMNS.find((c) => c.aliases.some((a) => key.startsWith(a)))?.key ?? null
}

// Faylni o'qib, kirim qatorlariga aylantiradi. Bo'sh qatorlar tashlab yuboriladi.
export async function parseReceiptExcel(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error("Faylda varaq topilmadi")
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false })

  // Sarlavha qatori — birinchi 10 qator ichida kamida "Sifat" va o'lcham ustuni bor qator.
  const headerIndex = matrix.slice(0, 10).findIndex((cells) => {
    const keys = cells.map(matchColumn)
    return keys.includes('quality') && (keys.includes('widthM') || keys.includes('heightM'))
  })
  if (headerIndex === -1) {
    throw new Error("Sarlavha topilmadi — kamida «Sifat», «Eni» va «Bo'yi» ustunlari bo'lishi kerak")
  }
  const mapping = matrix[headerIndex].map(matchColumn)

  const rows = []
  for (const cells of matrix.slice(headerIndex + 1)) {
    const raw = {}
    mapping.forEach((key, i) => {
      if (key && raw[key] === undefined) raw[key] = cells[i]
    })
    if (!String(raw.quality ?? '').trim()) continue

    const widthM = toNumber(raw.widthM)
    const heightM = toNumber(raw.heightM)
    const priceIn = toNumber(raw.priceIn)
    let markupPct = toNumber(raw.markupPct)
    let priceSale = toNumber(raw.priceSale)
    if (!priceSale && priceIn) priceSale = Number((priceIn * (1 + markupPct / 100)).toFixed(2))
    if (!markupPct && priceIn && priceSale) markupPct = Number(((priceSale / priceIn - 1) * 100).toFixed(1))

    rows.push({
      quality: String(raw.quality).trim(),
      design: String(raw.design ?? '').trim(),
      color: String(raw.color ?? '').trim(),
      material: String(raw.material ?? '').trim(),
      shape: String(raw.shape ?? 'R').trim().slice(0, 1).toUpperCase() || 'R',
      partiya: String(raw.partiya ?? '').trim(),
      widthM,
      heightM,
      m2: Number((widthM * heightM).toFixed(2)),
      priceIn,
      markupPct,
      priceSale,
      currency: 'USD',
      ready: Boolean(String(raw.partiya ?? '').trim()),
    })
  }
  if (rows.length === 0) throw new Error("Faylda kirim qatorlari topilmadi")
  return rows
}

// Bo'sh shablonni yuklab berish (bitta namunaviy qator bilan).
export function downloadReceiptTemplate() {
  const header = COLUMNS.map((c) => c.title)
  const sample = ['AKTUEL', '400X3000', 'GRI / MAVI', 'YS17', 'R', '', 4, 30, 25, 20, 30]
  const sheet = XLSX.utils.aoa_to_sheet([header, sample])
  sheet['!cols'] = COLUMNS.map(() => ({ wch: 16 }))
  header.forEach((_, i) => {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: i })]
    if (cell) cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'EAF1FE' } } }
  })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Kirim')
  XLSX.writeFile(workbook, 'Tovarlar kirimi shabloni.xlsx')
}
