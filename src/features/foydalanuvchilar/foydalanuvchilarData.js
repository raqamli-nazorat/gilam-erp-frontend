// Backend hali ulanmagan — "Foydalanuvchilar" (platforma admini) bo'limi uchun mock ma'lumotlar.
import { initialOrgs } from '@/features/tashkilotlar/tashkilotlarData'

export const TASHKILOT_NOMLARI = initialOrgs.map((o) => o.name)

// Har bir tashkilot uchun filiallar ro'yxati (modal/filtrdagi kaskad select uchun)
export const FILIALLAR_BY_TASHKILOT = {
  'SAG Gilamlari': ['Registon filiali', 'Siyob filiali', 'Chilonzor filiali', 'Yunusobod filiali', 'Zavod ombori'],
  'Buxoro Gilam Savdo': ['Buxoro markaziy', 'G‘ijduvon filiali'],
  'Namangan Karpet': ['Namangan markaziy', 'Chust filiali'],
  'Andijon Gilam Markazi': ['Andijon markaziy'],
  'Farg‘ona To‘qimachilik': ['Farg‘ona markaziy', 'Qo‘qon filiali'],
  'Xorazm Gilam': ['Urganch markaziy'],
  'Qashqadaryo Savdo': ['Qarshi filiali'],
  'Navoiy Gilam Uyi': ['Navoiy markaziy'],
  'Surxon Karpet': ['Termiz markaziy'],
  'Jizzax Gilam': ['Jizzax markaziy'],
  'Sirdaryo Savdo': ['Guliston markaziy'],
  'Qoraqalpog‘iston Gilam': ['Nukus markaziy'],
}

// Rollar — Figma'dagi sonlarga mos tartibda (kamayish bo'yicha)
export const ROLE_DEFS = [
  { name: 'Sotuvchi', count: 121 },
  { name: 'Menejer', count: 62 },
  { name: 'Kassir', count: 41 },
  { name: 'Omborchi', count: 28 },
  { name: 'Direktor', count: 18 },
  { name: 'Administrator', count: 14 },
]
export const ROLLAR_NOMLARI = ROLE_DEFS.map((r) => r.name)

const HOLAT = { active: 'Faol', blocked: 'Bloklangan' }
export const holatLabel = (s) => HOLAT[s] ?? s

// Ruxsatlar katalogi — "Role" jadvalida faqat nom saqlanadi, bu ro'yxat frontend taklifi
export const PERMISSIONS = [
  'Savdo yaratish',
  'To‘lov qabul qilish',
  'Chek chop etish',
  'Chegirma berish',
  'Qaytarishni tasdiqlash',
  'Ombor harakati',
  'Hisobotlar',
  'Foydalanuvchilarni boshqarish',
  'Kassa smenasini ochish',
  'Kassa smenasini yopish',
  'Naqd pul qabul qilish',
  'Karta orqali to‘lov',
  'Qarzni yopish',
  'Mijoz qo‘shish',
  'Bo‘lib to‘lash rasmiylashtirish',
  'Buyurtmani bekor qilish',
  'Narxni o‘zgartirish',
]

const T = () => true
const F = () => false
export const ROLE_PERMISSIONS = {
  Direktor: Object.fromEntries(PERMISSIONS.map((p) => [p, true])),
  Administrator: {
    'Savdo yaratish': F(), 'To‘lov qabul qilish': F(), 'Chek chop etish': F(), 'Chegirma berish': T(),
    'Qaytarishni tasdiqlash': T(), 'Ombor harakati': T(), 'Hisobotlar': T(), 'Foydalanuvchilarni boshqarish': T(),
    'Kassa smenasini ochish': F(), 'Kassa smenasini yopish': F(), 'Naqd pul qabul qilish': F(), 'Karta orqali to‘lov': F(),
    'Qarzni yopish': T(), 'Mijoz qo‘shish': T(), 'Bo‘lib to‘lash rasmiylashtirish': T(), 'Buyurtmani bekor qilish': T(),
    'Narxni o‘zgartirish': T(),
  },
  Menejer: {
    'Savdo yaratish': T(), 'To‘lov qabul qilish': T(), 'Chek chop etish': T(), 'Chegirma berish': T(),
    'Qaytarishni tasdiqlash': T(), 'Ombor harakati': T(), 'Hisobotlar': T(), 'Foydalanuvchilarni boshqarish': F(),
    'Kassa smenasini ochish': T(), 'Kassa smenasini yopish': T(), 'Naqd pul qabul qilish': T(), 'Karta orqali to‘lov': T(),
    'Qarzni yopish': T(), 'Mijoz qo‘shish': T(), 'Bo‘lib to‘lash rasmiylashtirish': T(), 'Buyurtmani bekor qilish': T(),
    'Narxni o‘zgartirish': F(),
  },
  Kassir: {
    'Savdo yaratish': T(), 'To‘lov qabul qilish': T(), 'Chek chop etish': T(), 'Chegirma berish': F(),
    'Qaytarishni tasdiqlash': F(), 'Ombor harakati': F(), 'Hisobotlar': T(), 'Foydalanuvchilarni boshqarish': F(),
    'Kassa smenasini ochish': T(), 'Kassa smenasini yopish': T(), 'Naqd pul qabul qilish': T(), 'Karta orqali to‘lov': T(),
    'Qarzni yopish': T(), 'Mijoz qo‘shish': T(), 'Bo‘lib to‘lash rasmiylashtirish': F(), 'Buyurtmani bekor qilish': F(),
    'Narxni o‘zgartirish': F(),
  },
  Sotuvchi: {
    'Savdo yaratish': T(), 'To‘lov qabul qilish': T(), 'Chek chop etish': T(), 'Chegirma berish': F(),
    'Qaytarishni tasdiqlash': F(), 'Ombor harakati': F(), 'Hisobotlar': F(), 'Foydalanuvchilarni boshqarish': F(),
    'Kassa smenasini ochish': F(), 'Kassa smenasini yopish': F(), 'Naqd pul qabul qilish': T(), 'Karta orqali to‘lov': T(),
    'Qarzni yopish': F(), 'Mijoz qo‘shish': T(), 'Bo‘lib to‘lash rasmiylashtirish': F(), 'Buyurtmani bekor qilish': F(),
    'Narxni o‘zgartirish': F(),
  },
  Omborchi: {
    'Savdo yaratish': F(), 'To‘lov qabul qilish': F(), 'Chek chop etish': F(), 'Chegirma berish': F(),
    'Qaytarishni tasdiqlash': F(), 'Ombor harakati': T(), 'Hisobotlar': T(), 'Foydalanuvchilarni boshqarish': F(),
    'Kassa smenasini ochish': F(), 'Kassa smenasini yopish': F(), 'Naqd pul qabul qilish': F(), 'Karta orqali to‘lov': F(),
    'Qarzni yopish': F(), 'Mijoz qo‘shish': F(), 'Bo‘lib to‘lash rasmiylashtirish': F(), 'Buyurtmani bekor qilish': F(),
    'Narxni o‘zgartirish': F(),
  },
}

// ── "Salmonov Sardor" — to'liq (detail sahifasi shu bo'yicha, Figma bilan bir xil) ──
const SALMONOV_DETAIL = {
  stats: { savdolar: 128, savdoSummasi: 412800000, qaytarishlar: 4, oxirgiKirish: '04.09.2026 08:12' },
  audit: [
    { at: '04.09.2026 15:33', amal: 'Tahrirlash', obyekt: 'Filial: Registon filiali', ip: '213.230.104.12' },
    { at: '04.09.2026 12:10', amal: 'Yaratish', obyekt: 'Buyurtma №4821', ip: '213.230.104.12' },
    { at: '04.09.2026 08:12', amal: 'Tizimga kirish', obyekt: '–', ip: '213.230.104.12' },
    { at: '03.09.2026 17:02', amal: 'Yaratish', obyekt: 'Buyurtma №4790', ip: '84.54.72.9' },
    { at: '03.09.2026 14:48', amal: 'To‘lov qabul qilish', obyekt: 'To‘lov №2214', ip: '84.54.72.9' },
    { at: '03.09.2026 09:41', amal: 'Tizimga kirish', obyekt: '–', ip: '84.54.72.9' },
    { at: '02.09.2026 18:20', amal: 'Tahrirlash', obyekt: 'Mijoz: Karimov A.', ip: '84.54.72.9' },
    { at: '02.09.2026 11:05', amal: 'Yaratish', obyekt: 'Buyurtma №4755', ip: '213.230.104.12' },
    { at: '01.09.2026 16:37', amal: 'O‘chirish', obyekt: 'Buyurtma №4712', ip: '213.230.104.12' },
    { at: '01.09.2026 09:02', amal: 'Tizimga kirish', obyekt: '–', ip: '213.230.104.12' },
    { at: '31.08.2026 15:14', amal: 'To‘lov qabul qilish', obyekt: 'To‘lov №2190', ip: '84.54.72.9' },
    { at: '30.08.2026 13:58', amal: 'Yaratish', obyekt: 'Buyurtma №4688', ip: '84.54.72.9' },
    { at: '30.08.2026 08:44', amal: 'Tizimga kirish', obyekt: '–', ip: '84.54.72.9' },
  ],
  lastSales: [
    { date: '04.09.2026', amount: 12400000 },
    { date: '03.09.2026', amount: 18900000 },
    { date: '02.09.2026', amount: 9150000 },
    { date: '01.09.2026', amount: 15300000 },
    { date: '31.08.2026', amount: 6700000 },
    { date: '30.08.2026', amount: 21050000 },
  ],
}

const AMAL_HAVUZI = ['Tizimga kirish', 'Yaratish', 'Tahrirlash', 'To‘lov qabul qilish', 'O‘chirish']
function synth(u, seed) {
  const savdolar = 4 + (seed % 140)
  const savdoSummasi = savdolar * (1200000 + (seed % 9) * 260000)
  const qaytarishlar = seed % 6
  const audit = Array.from({ length: 8 }, (_, i) => ({
    at: `0${1 + ((seed + i) % 4)}.09.2026 ${String(8 + ((seed + i) % 10)).padStart(2, '0')}:${String((seed * 7 + i * 13) % 60).padStart(2, '0')}`,
    amal: AMAL_HAVUZI[(seed + i) % AMAL_HAVUZI.length],
    obyekt: (seed + i) % AMAL_HAVUZI.length === 0 ? '–' : `Buyurtma №${4200 + seed * 3 + i}`,
    ip: i % 2 ? '84.54.72.9' : '213.230.104.12',
  }))
  const lastSales = Array.from({ length: 6 }, (_, i) => ({
    date: `0${4 - i > 0 ? 4 - i : 30 + (4 - i)}.09.2026`,
    amount: 800000 + ((seed + i * 5) % 20) * 620000,
  }))
  return {
    stats: { savdolar, savdoSummasi, qaytarishlar, oxirgiKirish: u.oxirgiKirish },
    audit,
    lastSales,
  }
}

const NAMED = [
  { id: 'salmonov-sardor', name: 'Salmonov Sardor', phone: '+998 90 123-45-67', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', rol: 'Direktor', holat: 'active', yaratilgan: '14.02.2024 10:24', oxirgiKirish: '04.09.2026 08:12' },
  { id: 'mirzajonov-gafforjon', name: 'Mirzajonov G‘afforjon', phone: '+998 90 234-56-78', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', rol: 'Menejer', holat: 'active', yaratilgan: '20.03.2024 09:00', oxirgiKirish: '04.09.2026 09:10' },
  { id: 'sobirov-aziz', name: 'Sobirov Aziz', phone: '+998 91 345-67-89', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', rol: 'Kassir', holat: 'active', yaratilgan: '05.04.2024 09:00', oxirgiKirish: '04.09.2026 08:40' },
  { id: 'toshev-dilshod', name: 'Toshev Dilshod', phone: '+998 93 456-78-90', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', rol: 'Menejer', holat: 'active', yaratilgan: '12.06.2024 09:00', oxirgiKirish: '03.09.2026 18:02' },
  { id: 'rahimova-nigora', name: 'Rahimova Nigora', phone: '+998 94 567-89-01', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', rol: 'Sotuvchi', holat: 'active', yaratilgan: '18.08.2024 09:00', oxirgiKirish: '04.09.2026 10:15' },
  { id: 'yusupov-bekzod', name: 'Yusupov Bekzod', phone: '+998 95 678-90-12', tashkilot: 'SAG Gilamlari', filial: 'Zavod ombori', rol: 'Omborchi', holat: 'active', yaratilgan: '02.11.2024 09:00', oxirgiKirish: '03.09.2026 16:44' },
  { id: 'axrorjon-nazarov', name: 'Axrorjon Nazarov', phone: '+998 97 789-01-23', tashkilot: 'SAG Gilamlari', filial: 'Yunusobod filiali', rol: 'Administrator', holat: 'active', yaratilgan: '08.03.2025 09:00', oxirgiKirish: '04.09.2026 07:55' },
  { id: 'rasulov-bahodir', name: 'Rasulov Bahodir', phone: '+998 91 890-12-34', tashkilot: 'Buxoro Gilam Savdo', filial: 'Buxoro markaziy', rol: 'Direktor', holat: 'active', yaratilgan: '06.06.2024 09:10', oxirgiKirish: '04.09.2026 08:30' },
  { id: 'ergasheva-dilnoza-1', name: 'Ergasheva Dilnoza', phone: '+998 99 901-23-45', tashkilot: 'Buxoro Gilam Savdo', filial: 'Buxoro markaziy', rol: 'Sotuvchi', holat: 'active', yaratilgan: '22.07.2024 10:20', oxirgiKirish: '03.09.2026 12:10' },
  { id: 'yoldoshev-nodir', name: 'Yo‘ldoshev Nodir', phone: '+998 93 012-34-56', tashkilot: 'Namangan Karpet', filial: 'Namangan markaziy', rol: 'Direktor', holat: 'active', yaratilgan: '19.09.2024 09:30', oxirgiKirish: '04.09.2026 09:05' },
  { id: 'karimov-anvar', name: 'Karimov Anvar', phone: '+998 94 123-45-67', tashkilot: 'Andijon Gilam Markazi', filial: 'Andijon markaziy', rol: 'Direktor', holat: 'active', yaratilgan: '02.11.2024 09:50', oxirgiKirish: '04.09.2026 08:20' },
  { id: 'toshev-farrux-1', name: 'Toshev Farrux', phone: '+998 95 234-56-78', tashkilot: 'Farg‘ona To‘qimachilik', filial: 'Farg‘ona markaziy', rol: 'Kassir', holat: 'blocked', yaratilgan: '17.12.2024 10:15', oxirgiKirish: '28.08.2026 14:10' },
  { id: 'matniyozov-xurshid', name: 'Matniyozov Xurshid', phone: '+998 97 345-67-89', tashkilot: 'Xorazm Gilam', filial: 'Urganch markaziy', rol: 'Direktor', holat: 'active', yaratilgan: '21.01.2025 10:40', oxirgiKirish: '04.09.2026 09:32' },
  { id: 'ergasheva-dilnoza-2', name: 'Ergasheva Dilnoza', phone: '+998 99 789-01-23', tashkilot: 'Qashqadaryo Savdo', filial: 'Qarshi filiali', rol: 'Kassir', holat: 'active', yaratilgan: '11.02.2025 12:15', oxirgiKirish: '03.09.2026 15:40' },
  { id: 'toshev-farrux-2', name: 'Toshev Farrux', phone: '+998 95 567-89-01', tashkilot: 'Farg‘ona To‘qimachilik', filial: 'Qo‘qon filiali', rol: 'Sotuvchi', holat: 'active', yaratilgan: '11.01.2025 09:25', oxirgiKirish: '02.09.2026 17:12' },
  { id: 'rasulov-bekzod', name: 'Rasulov Bekzod', phone: '+998 91 234-56-78', tashkilot: 'Buxoro Gilam Savdo', filial: 'G‘ijduvon filiali', rol: 'Menejer', holat: 'active', yaratilgan: '22.07.2024 10:20', oxirgiKirish: '03.09.2026 11:50' },
]

const FIRST_NAMES = ['Aziz', 'Bekzod', 'Sardor', 'Dilnoza', 'Zilola', 'Javohir', 'Shahzod', 'Malika', 'Sevara', 'Nodira', 'Botir', 'Farrux', 'Jasur', 'Kamola', 'Laylo', 'Mansur', 'Nargiza', 'Otabek', 'Parvina', 'Rustam', 'Sarvinoz', 'Temur', 'Ulug‘bek', 'Feruza', 'Gulnora', 'Ilhom', 'Jamshid', 'Kamron', 'Lobar', 'Muxlisa']
const SURNAMES = ['Karimov', 'Toshev', 'Yusupov', 'Rahimov', 'Sobirov', 'Ergashev', 'Nazarov', 'Xolmatov', 'Sattorov', 'Umarov', 'Ibrohimov', 'Qodirov', 'Abdullayev', 'Mirzajonov', 'Salimov', 'Tursunov', 'Yodgorov', 'Zokirov', 'Ashurov', 'Bekmatov']
const FEMALE = new Set(['Dilnoza', 'Zilola', 'Malika', 'Sevara', 'Nodira', 'Kamola', 'Laylo', 'Nargiza', 'Parvina', 'Sarvinoz', 'Feruza', 'Gulnora', 'Lobar', 'Muxlisa'])

// Sonlarni (Sotuvchi 121, Menejer 62, Kassir 41, Omborchi 28, Direktor 18, Administrator 14 = 284)
// Figma bilan bir xil saqlash uchun rollar bo'yicha to'ldirish rejasi (named foydalanuvchilardan qolgani)
const NAMED_ROLE_COUNT = NAMED.reduce((acc, u) => ({ ...acc, [u.rol]: (acc[u.rol] ?? 0) + 1 }), {})
const FILL_PLAN = ROLE_DEFS.map((r) => ({ rol: r.name, qty: r.count - (NAMED_ROLE_COUNT[r.name] ?? 0) }))
const NAMED_BLOCKED = NAMED.filter((u) => u.holat === 'blocked').length
const TARGET_BLOCKED = 8
let blockedLeft = TARGET_BLOCKED - NAMED_BLOCKED

const filled = []
let seq = 0
FILL_PLAN.forEach(({ rol, qty }) => {
  for (let i = 0; i < qty; i += 1) {
    seq += 1
    const org = TASHKILOT_NOMLARI[seq % TASHKILOT_NOMLARI.length]
    const filiallar = FILIALLAR_BY_TASHKILOT[org] ?? [`${org} markaziy`]
    const filial = filiallar[seq % filiallar.length]
    const first = FIRST_NAMES[seq % FIRST_NAMES.length]
    let surname = SURNAMES[(seq * 3 + 7) % SURNAMES.length]
    if (FEMALE.has(first)) surname += 'a'
    const blockThis = blockedLeft > 0 && seq % 34 === 0
    if (blockThis) blockedLeft -= 1
    filled.push({
      id: `fu-${seq}`,
      name: `${surname} ${first}`,
      phone: `+998 ${90 + (seq % 9)} ${100 + (seq % 900)}-${10 + (seq % 80)}-${10 + (seq % 80)}`,
      tashkilot: org,
      filial,
      rol,
      holat: blockThis ? 'blocked' : 'active',
      yaratilgan: `1${seq % 9}.0${1 + (seq % 8)}.202${4 + (seq % 3)} 09:00`,
      oxirgiKirish: `0${1 + (seq % 4)}.09.2026 ${String(8 + (seq % 11)).padStart(2, '0')}:${String((seq * 11) % 60).padStart(2, '0')}`,
    })
  }
})

export const initialUsers = [...NAMED, ...filled].map((u, i) => ({
  block: u.holat === 'blocked' ? { at: '28.08.2026 09:40', reason: 'Xodim ishdan bo‘shadi', by: 'Anvarov Sardorbek' } : null,
  activation: null,
  ...u,
  detail: u.id === 'salmonov-sardor' ? SALMONOV_DETAIL : synth(u, i + 1),
}))
