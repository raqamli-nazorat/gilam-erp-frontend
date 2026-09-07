// Backend hali ulanmagan — "Audit jurnali" (platforma admini) bo'limi uchun mock ma'lumotlar.
// Foydalanuvchi/tashkilot ma'lumotlari Foydalanuvchilar moduli bilan bir xil (nomlar mos keladi).

export const AMALLAR = ['INSERT', 'UPDATE', 'DELETE']
export const JADVALLAR = [
  'Order', 'OrderItem', 'Payment', 'DebtLedger', 'InstallmentAgreement', 'Warehouse', 'ProductStock', 'CarpetRoll',
  'StockTransaction', 'Customer', 'Employee', 'EmployeeCommission', 'Product', 'SupplierPurchase', 'Organization',
  'User', 'Expense',
]

const AMAL_BADGE = {
  INSERT: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  UPDATE: 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]',
  DELETE: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]',
}
export const amalBadgeCls = (amal) => AMAL_BADGE[amal] ?? AMAL_BADGE.UPDATE

// Jadval bo'yicha o'zgaruvchi maydon nomi — eski/yangi qiymat namunasi uchun
const JADVAL_FIELD = {
  Order: 'status', OrderItem: 'qty', Payment: 'amount', DebtLedger: 'balance', InstallmentAgreement: 'nextDueAt',
  Warehouse: 'name', ProductStock: 'qty', CarpetRoll: 'lengthM', StockTransaction: 'qty', Customer: 'phone',
  Employee: 'position', EmployeeCommission: 'amount', Product: 'price', SupplierPurchase: 'amount',
  Organization: 'phone', User: 'phone', Expense: 'amount',
}

function fieldValue(field, seed) {
  switch (field) {
    case 'phone': return `+998 90 123-45-${60 + (seed % 40)}`
    case 'amount': case 'balance': return String(400000 + seed * 12345)
    case 'qty': return String(1 + (seed % 40))
    case 'status': return ['Yangi', 'Yakunlangan', 'Bekor qilingan'][seed % 3]
    case 'price': return String(80000 + seed * 640)
    case 'position': return ['Sotuvchi', 'Kassir', 'Menejer'][seed % 3]
    case 'name': return `Ombor ${seed % 12}`
    case 'lengthM': return (4 + (seed % 20)).toFixed(1)
    case 'nextDueAt': return `2026-${String(1 + (seed % 12)).padStart(2, '0')}-10`
    default: return String(seed)
  }
}

// "03.09.2026" + "14:40:12" -> Date
function toDate(sana, vaqt) {
  const [d, m, y] = sana.split('.').map(Number)
  const [h, mi, s] = vaqt.split(':').map(Number)
  return new Date(y, m - 1, d, h, mi, s)
}

export function buildDiff(row) {
  const field = JADVAL_FIELD[row.jadval] ?? 'phone'
  const seed = row.yozuv
  const after = toDate(row.sana, row.vaqt)
  const before = new Date(after.getTime() - 2 * 60 * 1000)
  const beforeObj = { [field]: fieldValue(field, seed), updated_at: before.toISOString() }
  const afterObj = { [field]: fieldValue(field, seed + 1), updated_at: after.toISOString() }
  if (row.amal === 'INSERT') return { before: null, after: afterObj }
  if (row.amal === 'DELETE') return { before: beforeObj, after: null }
  return { before: beforeObj, after: afterObj }
}

// "16:42:11" + sana -> "16.42.2026 16:42" ko'rinishidagi to'liq vaqt
function full(sana, vaqt) {
  return `${sana} ${vaqt.slice(0, 5)}`
}

const BUGUN = '03.09.2026'

// Figma'da ko'rsatilgan 16 ta qator (aniq mos)
const NAMED = [
  { vaqt: '16:42:11', foydalanuvchi: 'Sobirov Aziz', tashkilot: 'SAG Gilamlari', amal: 'UPDATE', jadval: 'Order', yozuv: 1042, ip: '92.168.14.201' },
  { vaqt: '16:38:04', foydalanuvchi: 'Sobirov Aziz', tashkilot: 'SAG Gilamlari', amal: 'INSERT', jadval: 'Payment', yozuv: 8817, ip: '92.168.14.201' },
  { vaqt: '16:31:52', foydalanuvchi: 'Rahimova Nigora', tashkilot: 'SAG Gilamlari', amal: 'INSERT', jadval: 'Order', yozuv: 1042, ip: '92.168.14.118' },
  { vaqt: '16:24:30', foydalanuvchi: 'Axrorjon Nazarov', tashkilot: 'SAG Gilamlari', amal: 'UPDATE', jadval: 'Product', yozuv: 3160, ip: '92.168.14.7' },
  { vaqt: '16:18:09', foydalanuvchi: 'Yusupov Bekzod', tashkilot: 'SAG Gilamlari', amal: 'DELETE', jadval: 'CarpetRoll', yozuv: 20411, ip: '92.168.14.66' },
  { vaqt: '16:05:47', foydalanuvchi: 'Toshev Dilshod', tashkilot: 'SAG Gilamlari', amal: 'INSERT', jadval: 'Customer', yozuv: 3240, ip: '92.168.14.53' },
  { vaqt: '15:58:22', foydalanuvchi: 'Yusupov Bekzod', tashkilot: 'SAG Gilamlari', amal: 'UPDATE', jadval: 'ProductStock', yozuv: 9074, ip: '92.168.14.66' },
  { vaqt: '15:47:15', foydalanuvchi: 'Rasulov Bahodir', tashkilot: 'Buxoro Gilam Savdo', amal: 'INSERT', jadval: 'SupplierPurchase', yozuv: 612, ip: '84.54.72.19' },
  { vaqt: '15:32:58', foydalanuvchi: 'Salmonov Sardor', tashkilot: 'SAG Gilamlari', amal: 'UPDATE', jadval: 'User', yozuv: 148, ip: '92.168.14.2' },
  { vaqt: '15:20:41', foydalanuvchi: 'Ergasheva Dilnoza', tashkilot: 'Buxoro Gilam Savdo', amal: 'INSERT', jadval: 'Order', yozuv: 1041, ip: '84.54.72.31' },
  { vaqt: '15:11:03', foydalanuvchi: 'Sobirov Aziz', tashkilot: 'SAG Gilamlari', amal: 'UPDATE', jadval: 'DebtLedger', yozuv: 774, ip: '92.168.14.201' },
  { vaqt: '14:56:37', foydalanuvchi: 'Karimov Anvar', tashkilot: 'Andijon Gilam Markazi', amal: 'INSERT', jadval: 'Expense', yozuv: 2295, ip: '78.36.11.88' },
  { vaqt: '14:40:12', foydalanuvchi: 'Salmonov Sardor', tashkilot: 'SAG Gilamlari', amal: 'UPDATE', jadval: 'Organization', yozuv: 1, ip: '92.168.14.2' },
  { vaqt: '14:32:48', foydalanuvchi: 'Rasulov Bekzod', tashkilot: 'Buxoro Gilam Savdo', amal: 'UPDATE', jadval: 'Order', yozuv: 20481, ip: '92.168.14.7' },
  { vaqt: '14:28:05', foydalanuvchi: 'Toshev Farrux', tashkilot: 'Farg‘ona To‘qimachilik', amal: 'UPDATE', jadval: 'Product', yozuv: 3942, ip: '92.168.14.9' },
  { vaqt: '14:21:33', foydalanuvchi: 'Ergasheva Dilnoza', tashkilot: 'Qashqadaryo Savdo', amal: 'UPDATE', jadval: 'Payment', yozuv: 15663, ip: '92.168.14.4' },
]

// Qolganlarini to'ldirish uchun havuz
const FOYDALANUVCHI_HAVUZI = [
  ['Mirzajonov G‘afforjon', 'SAG Gilamlari'], ['Rahimova Nigora', 'SAG Gilamlari'], ['Qodirova Malika', 'SAG Gilamlari'],
  ['Ismoilov Bobur', 'SAG Gilamlari'], ['Yusupov Anvar', 'Buxoro Gilam Savdo'], ['Nazarova Gulnora', 'Namangan Karpet'],
  ['Toshev Jamshid', 'Andijon Gilam Markazi'], ['Ergashev Qodir', 'Farg‘ona To‘qimachilik'], ['Nazarov Jasur', 'Xorazm Gilam'],
  ['Abdullayev Sherzod', 'Xorazm Gilam'], ['Rahmonov Aziz', 'SAG Gilamlari'], ['Yo‘ldoshev Nodir', 'Namangan Karpet'],
]

function synth(seq) {
  const [foydalanuvchi, tashkilot] = FOYDALANUVCHI_HAVUZI[seq % FOYDALANUVCHI_HAVUZI.length]
  const amal = AMALLAR[seq % AMALLAR.length]
  const jadval = JADVALLAR[(seq * 3) % JADVALLAR.length]
  const kun = 1 + (seq % 3) // bugundan 1-3 kun oldin
  const soat = String(8 + (seq % 10)).padStart(2, '0')
  const daq = String((seq * 7) % 60).padStart(2, '0')
  const son = String((seq * 13) % 60).padStart(2, '0')
  return {
    sana: `0${kun}.09.2026`,
    vaqt: `${soat}:${daq}:${son}`,
    foydalanuvchi,
    tashkilot,
    amal,
    jadval,
    yozuv: 100 + seq * 17,
    ip: seq % 2 ? `92.168.14.${20 + (seq % 200)}` : `84.54.72.${10 + (seq % 90)}`,
  }
}

const filled = Array.from({ length: 220 }, (_, i) => synth(i + 1))

export const AUDIT_LOG = [
  ...NAMED.map((r) => ({ ...r, sana: BUGUN })),
  ...filled,
].map((r, i) => ({
  id: `audit-${i + 1}`,
  ...r,
  vaqtFull: full(r.sana, r.vaqt),
}))

export const AUDIT_FOYDALANUVCHILAR = [...new Set(AUDIT_LOG.map((r) => r.foydalanuvchi))].sort((a, b) => a.localeCompare(b, 'uz'))
export const AUDIT_TASHKILOTLAR = [...new Set(AUDIT_LOG.map((r) => r.tashkilot))].sort((a, b) => a.localeCompare(b, 'uz'))
