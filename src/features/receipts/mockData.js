// Backend hali ulanmagan — bu yerdagi ma'lumotlar faqat interfeysni sinash uchun (mock).

export const WAREHOUSES = ['MAGAZIN', 'OMBOR']

export const COUNTERPARTIES = [
  'XISSADOR BOTIR AKA',
  'XISSADOR SARDOR',
  '12 TREST ZOHID',
  'SAG ZAVOD',
  'AKTUEL TEKSTIL',
  'SAMARQAND GILAM',
]

export const AUTHORS = ['SAG MENEJER', 'AXRORJON', 'SALMONOV S.']
export const THIRD_PARTIES = ['MENEJER', 'VAKIL', 'BROKER']

export const QUALITIES = ['AKTUEL', 'ACTUAL', 'TUMARIS', 'DELTA LOOP', 'ORZU']
export const DESIGNS = ['400X3000', 'D-9900 400', '1530 YJ43 300', '9548 YK23 400X2']
export const COLORS = ['GRI / MAVI', 'CREAM / WHITE', 'GREY / WHITE', 'BEJ / KREM']
export const MATERIALS = ['YS17', 'YK23', 'YJ43', 'YJ34']
export const SHAPES = [
  { value: 'R', label: "R · to'rtburchak" },
  { value: 'O', label: 'O · oval' },
  { value: 'D', label: 'D · doira' },
]

export const EXCHANGE_RATE = 12230

// "Exceldan yuklash" natijasi — barcha ekranlarda bir xil ko'rsatkichlar
export const EXCEL_TEMPLATE = {
  fileName: 'Tovarlar kirimi shabloni.xlsx',
  rows: 84,
  m2: 3320,
}

// Rulon namunalari — qabul jarayonida qatorlar sifatida ishlatiladi
const ROW_TEMPLATES = [
  {
    quality: 'AKTUEL',
    design: '400X3000',
    color: 'GRI / MAVI',
    material: 'YS17',
    shape: 'R',
    partiya: '0080332',
    widthM: 4,
    heightM: 30,
    priceIn: 25,
    markupPct: 20,
    priceSale: 30,
  },
  {
    quality: 'ACTUAL',
    design: '400X3000',
    color: 'CREAM / WHITE',
    material: 'YK23',
    shape: 'R',
    partiya: '0080331',
    widthM: 4,
    heightM: 30,
    priceIn: 25,
    markupPct: 20,
    priceSale: 30,
  },
  {
    quality: 'TUMARIS',
    design: '1530 YJ43 300',
    color: 'GREY / WHITE',
    material: 'YJ43',
    shape: 'R',
    partiya: '2168108',
    widthM: 0.4,
    heightM: 30,
    priceIn: 32,
    markupPct: 9,
    priceSale: 35,
  },
  {
    quality: 'DELTA LOOP',
    design: 'D-9900 400',
    color: 'BEJ / KREM',
    material: 'YJ34',
    shape: 'R',
    partiya: '2168116',
    widthM: 3.4667,
    heightM: 30,
    priceIn: 3.1,
    markupPct: 29,
    priceSale: 4,
  },
  {
    quality: 'ORZU',
    design: '9548 YK23 400X2',
    color: 'CREAM / WHITE',
    material: 'YK23',
    shape: 'R',
    partiya: '2168124',
    widthM: 3.4,
    heightM: 30,
    priceIn: 11.2,
    markupPct: 16,
    priceSale: 13,
  },
]

let rowSeq = 1
function makeRow(template, overrides = {}) {
  const widthM = overrides.widthM ?? template.widthM
  const heightM = overrides.heightM ?? template.heightM
  const m2 = Number((widthM * heightM).toFixed(2))
  return {
    id: `row-${rowSeq++}`,
    quality: template.quality,
    design: template.design,
    color: template.color,
    material: template.material,
    shape: template.shape,
    partiya: template.partiya,
    widthM,
    heightM,
    m2,
    priceIn: template.priceIn,
    markupPct: template.markupPct,
    priceSale: template.priceSale,
    currency: 'USD',
    ready: true,
    ...overrides,
  }
}

function buildRows() {
  return ROW_TEMPLATES.map((t) => makeRow(t))
}

// KR-0268 — Figma'dagi kabi 84 ta rulon. Birinchi 5 qator ko'rinadigan namunalar,
// qolgan 79 tasi jami 3 320,00 m² va 10 292,00 USD kirim summasini to'ldiradi.
function build84Rows() {
  const rows = ROW_TEMPLATES.map((t) => makeRow(t))
  for (let i = 0; i < 79; i += 1) {
    const template = ROW_TEMPLATES[i % ROW_TEMPLATES.length]
    const isLast = i === 78
    const widthM = isLast ? 1.8 : 1.2
    const priceIn = isLast ? 56.4 / 54 : 0.85
    rows.push(
      makeRow(template, {
        partiya: String(2168130 + i),
        widthM,
        heightM: 30,
        priceIn,
        markupPct: 20,
        priceSale: Number((priceIn * 1.2).toFixed(2)),
      })
    )
  }
  return rows
}

// "Skanerlash" usulini simulyatsiya qilish uchun — rulonlar allaqachon partiya bilan keladi
export function buildSampleReadyRows() {
  return ROW_TEMPLATES.map((t) => makeRow(t))
}

// "Exceldan yuklash" usulini simulyatsiya qilish uchun — partiya keyinroq qo'lda yaratiladi
export function buildSampleRawRows() {
  return ROW_TEMPLATES.map((t) => makeRow(t, { partiya: '', ready: false }))
}

function sumRows(rows) {
  return rows.reduce((sum, r) => sum + r.m2 * r.priceIn, 0)
}

let receiptSeq = 269
export function nextReceiptNumber() {
  return `KR-${String(receiptSeq++).padStart(4, '0')}`
}

function makeConfirmedReceipt({ number, date, warehouse, counterparty, author, rows, status = 'confirmed', thirdParty = 'MENEJER', excelMeta = null }) {
  const sumUsd = Number(sumRows(rows).toFixed(2))
  return {
    id: number,
    number,
    date,
    warehouse,
    counterparty,
    thirdParty,
    author,
    supplier: { name: counterparty, doc: '', date },
    rows,
    sumUsd,
    sumUzs: Math.round(sumUsd * EXCHANGE_RATE),
    status,
    excelMeta,
  }
}

export const initialReceipts = [
  makeConfirmedReceipt({
    number: 'KR-0268',
    date: '2023-12-29',
    warehouse: 'MAGAZIN',
    counterparty: 'XISSADOR BOTIR AKA',
    author: 'SAG MENEJER',
    rows: build84Rows(),
    excelMeta: EXCEL_TEMPLATE,
  }),
  makeConfirmedReceipt({
    number: 'KR-0267',
    date: '2023-12-28',
    warehouse: 'OMBOR',
    counterparty: 'XISSADOR SARDOR',
    author: 'AXRORJON',
    rows: buildRows().slice(0, 3),
  }),
  makeConfirmedReceipt({
    number: 'KR-0266',
    date: '2023-12-27',
    warehouse: 'MAGAZIN',
    counterparty: '12 TREST ZOHID',
    author: 'SAG MENEJER',
    rows: buildRows().slice(0, 4),
  }),
  makeConfirmedReceipt({
    number: 'KR-0265',
    date: '2023-12-26',
    warehouse: 'OMBOR',
    counterparty: 'XISSADOR BOTIR AKA',
    author: 'AXRORJON',
    rows: buildRows().slice(0, 2),
    status: 'draft',
  }),
  makeConfirmedReceipt({
    number: 'KR-0264',
    date: '2023-12-25',
    warehouse: 'MAGAZIN',
    counterparty: 'SAG ZAVOD',
    author: 'SALMONOV S.',
    rows: buildRows(),
  }),
  makeConfirmedReceipt({
    number: 'KR-0263',
    date: '2023-12-23',
    warehouse: 'OMBOR',
    counterparty: 'XISSADOR SARDOR',
    author: 'SAG MENEJER',
    rows: buildRows().slice(0, 1),
    status: 'draft',
  }),
  makeConfirmedReceipt({
    number: 'KR-0262',
    date: '2023-12-22',
    warehouse: 'MAGAZIN',
    counterparty: 'XISSADOR BOTIR AKA',
    author: 'AXRORJON',
    rows: buildRows().slice(0, 3),
  }),
  makeConfirmedReceipt({
    number: 'KR-0261',
    date: '2023-12-21',
    warehouse: 'MAGAZIN',
    counterparty: '12 TREST ZOHID',
    author: 'SALMONOV S.',
    rows: buildRows().slice(0, 2),
  }),
  makeConfirmedReceipt({
    number: 'KR-0259',
    date: '2023-12-19',
    warehouse: 'OMBOR',
    counterparty: 'XISSADOR SARDOR',
    author: 'SAG MENEJER',
    rows: buildRows(),
  }),
  makeConfirmedReceipt({
    number: 'KR-0258',
    date: '2023-12-18',
    warehouse: 'MAGAZIN',
    counterparty: 'SAG ZAVOD',
    author: 'AXRORJON',
    rows: buildRows().slice(0, 4),
  }),
  makeConfirmedReceipt({
    number: 'KR-0257',
    date: '2023-12-17',
    warehouse: 'MAGAZIN',
    counterparty: '12 TREST ZOHID',
    author: 'SALMONOV S.',
    rows: buildRows().slice(0, 1),
    status: 'draft',
  }),
  makeConfirmedReceipt({
    number: 'KR-0254',
    date: '2023-12-14',
    warehouse: 'OMBOR',
    counterparty: 'SAG ZAVOD',
    author: 'AXRORJON',
    rows: buildRows().slice(0, 2),
    status: 'draft',
  }),
]

export function generateRandomRow({ scanned = false } = {}) {
  const template = ROW_TEMPLATES[Math.floor(Math.random() * ROW_TEMPLATES.length)]
  return makeRow(
    template,
    scanned
      ? { partiya: String(Math.floor(1000000 + Math.random() * 8999999)), ready: true }
      : { partiya: '', ready: false }
  )
}
