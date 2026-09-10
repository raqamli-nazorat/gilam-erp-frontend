// Backend hali ulanmagan — "Filiallar" (platforma admini) bo'limi uchun mock ma'lumotlar.
import { initialOrgs, VILOYATLAR, TUMANLAR } from '@/features/tashkilotlar/tashkilotlarData'

export { VILOYATLAR, TUMANLAR }
export const TASHKILOT_NOMLARI = initialOrgs.map((o) => o.name)
export const FILIAL_TURLARI = ['Salon', 'Ombor', 'Savdo nuqtasi', 'Ishlab chiqarish', 'Bosh ofis']

const HOLAT = { active: 'Faol', closed: 'Yopilgan' }
export const holatLabel = (s) => HOLAT[s] ?? s

// ── "Registon filiali" — to'liq (barcha sub-sahifalar shu bo'yicha) ──────────
const REGISTON_XODIMLAR = [
  { id: 'x1', name: 'Salmonov Sardor', lavozim: 'Direktor', phone: '+998 66 233-11-01', ishHaqiTuri: 'Asoschi', ishgaKirgan: '14.02.2024 09:00', holat: 'Faol' },
  { id: 'x2', name: 'Karimova Nilufar', lavozim: 'Menejer', phone: '+998 66 233-11-02', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '20.03.2024 09:00', holat: 'Faol' },
  { id: 'x3', name: 'Toshev Doniyor', lavozim: 'Sotuvchi', phone: '+998 66 233-11-03', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '05.04.2024 09:00', holat: 'Faol' },
  { id: 'x4', name: 'Yusupova Malika', lavozim: 'Sotuvchi', phone: '+998 66 233-11-04', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '12.06.2024 09:00', holat: 'Faol' },
  { id: 'x5', name: 'Rasulov Bekzod', lavozim: 'Sotuvchi', phone: '+998 66 233-11-05', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '18.08.2024 09:00', holat: 'Faol' },
  { id: 'x6', name: 'Ergasheva Zilola', lavozim: 'Kassir', phone: '+998 66 233-11-06', ishHaqiTuri: 'Belgilangan summa', ishgaKirgan: '02.11.2024 09:00', holat: 'Faol' },
  { id: 'x7', name: 'Aliyev Jasur', lavozim: 'Omborchi', phone: '+998 66 233-11-07', ishHaqiTuri: 'Belgilangan summa', ishgaKirgan: '15.01.2025 09:00', holat: 'Faol' },
  { id: 'x8', name: 'Nazarova Dilnoza', lavozim: 'Administrator', phone: '+998 66 233-11-08', ishHaqiTuri: 'Belgilangan summa', ishgaKirgan: '08.03.2025 09:00', holat: 'Faol' },
  { id: 'x9', name: 'Qodirov Shohruh', lavozim: 'Sotuvchi', phone: '+998 66 233-11-09', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '22.05.2025 09:00', holat: "Ta'tilda" },
  { id: 'x10', name: 'Ibrohimova Sevara', lavozim: 'Sotuvchi', phone: '+998 66 233-11-10', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '10.07.2025 09:00', holat: 'Faol' },
  { id: 'x11', name: 'Xolmatov Aziz', lavozim: 'Omborchi', phone: '+998 66 233-11-11', ishHaqiTuri: 'Belgilangan summa', ishgaKirgan: '01.08.2025 09:00', holat: 'Faol' },
  { id: 'x12', name: 'Sattorova Gulnora', lavozim: 'Kassir', phone: '+998 66 233-11-12', ishHaqiTuri: 'Belgilangan summa', ishgaKirgan: '14.09.2025 09:00', holat: 'Faol' },
  { id: 'x13', name: 'Umarov Javohir', lavozim: 'Sotuvchi', phone: '+998 66 233-11-13', ishHaqiTuri: 'Savdodan foiz', ishgaKirgan: '03.12.2025 09:00', holat: 'Faol' },
]

// ── Registon rulonlari — 46 ta (34 "Registon asosiy" + 12 "Registon zaxira") ──
const REGISTON_RULONLAR = [
  { id: 'r1', tovar: 'AKTUEL 1247, bej', rulonNo: 'RL-20411', ombor: 'Registon asosiy', boshlangich: 25, qoldiq: 19, obrezok: false, holat: 'Mavjud' },
  { id: 'r2', tovar: 'AKTUEL 1247, bej', rulonNo: 'RL-20388', ombor: 'Registon asosiy', boshlangich: 25, qoldiq: 2.4, obrezok: true, holat: 'Mavjud' },
  { id: 'r3', tovar: 'GRI MAVI YS17, ko‘k', rulonNo: 'RL-20390', ombor: 'Registon asosiy', boshlangich: 30, qoldiq: 11.6, obrezok: false, holat: 'Band' },
  { id: 'r4', tovar: 'CREAM WHITE YK23', rulonNo: 'RL-20402', ombor: 'Registon asosiy', boshlangich: 25, qoldiq: 25, obrezok: false, holat: 'Mavjud' },
  { id: 'r5', tovar: 'Sun‘iy maysa 4 m', rulonNo: 'RL-20502', ombor: 'Registon asosiy', boshlangich: 40, qoldiq: 18, obrezok: false, holat: 'Mavjud' },
  { id: 'r6', tovar: 'Kovrolin STANDART', rulonNo: 'RL-20470', ombor: 'Registon asosiy', boshlangich: 30, qoldiq: 24.5, obrezok: false, holat: 'Mavjud' },
  { id: 'r7', tovar: 'SHAGGY 5 sm, kulrang', rulonNo: 'RL-20520', ombor: 'Registon asosiy', boshlangich: 20, qoldiq: 20, obrezok: false, holat: 'Band' },
  { id: 'r8', tovar: 'OSCAR 3200', rulonNo: 'RL-20506', ombor: 'Registon zaxira', boshlangich: 25, qoldiq: 25, obrezok: false, holat: 'Mavjud' },
  { id: 'r9', tovar: 'ANTIK 770, ko‘k', rulonNo: 'RL-20488', ombor: 'Registon zaxira', boshlangich: 20, qoldiq: 8.4, obrezok: false, holat: 'Mavjud' },
  { id: 'r10', tovar: 'Kovrolin LUX', rulonNo: 'RL-20509', ombor: 'Registon zaxira', boshlangich: 30, qoldiq: 30, obrezok: false, holat: 'Mavjud' },
  { id: 'r11', tovar: 'Sun‘iy maysa 2 m', rulonNo: 'RL-20498', ombor: 'Registon zaxira', boshlangich: 40, qoldiq: 0, obrezok: false, holat: 'Tugagan' },
  ...(() => {
    const tovarlar = [
      'FLORIDA 4400, qizil', 'PALERMO 900, bej', 'VISION 5100', 'MODENA 320, jigarrang',
      'ATLAS 7700', 'CARAMEL YK9', 'LOTUS 220', 'DIAMOND 6000', 'VINTAGE 88, kulrang',
      'SAHARA 1500, qumrang', 'MARMARIS 640', 'AZALIA 330, pushti', 'TROY 2100', 'EFES 4800, ko‘k',
      'AKTUEL 1247, bej', 'GRI MAVI YS17, ko‘k', 'CREAM WHITE YK23', 'Kovrolin STANDART',
    ]
    const holatlar = ['Mavjud', 'Mavjud', 'Mavjud', 'Band', 'Mavjud', 'Mavjud', 'Tugagan', 'Mavjud']
    const boshl = [20, 25, 30, 35, 40]
    return Array.from({ length: 35 }, (_, i) => {
      const b = boshl[i % boshl.length]
      const qoldiq = Number((b * (((i * 41) % 100) / 100)).toFixed(1))
      return {
        id: `r${i + 12}`,
        tovar: tovarlar[i % tovarlar.length],
        rulonNo: `RL-${20521 + i * 6}`,
        ombor: i < 27 ? 'Registon asosiy' : 'Registon zaxira',
        boshlangich: b,
        qoldiq,
        obrezok: i % 6 === 2,
        holat: qoldiq < 0.05 ? 'Tugagan' : holatlar[i % holatlar.length],
      }
    })
  })(),
]

// ── Registon mijozlari — ro'yxatda 28 ta ko'rsatiladi ─────────────────────────
const REGISTON_MIJOZLAR = [
  { id: 'm1', name: '«TITAN GROUP» MCHJ', phone: '+998 90 111-22-33', buyurtma: 18, jamiXarid: 186420000, qarz: 42180000, oxirgi: '03.09.2026 10:05' },
  { id: 'm2', name: 'Karimov Sanjar', phone: '+998 90 123-45-67', buyurtma: 9, jamiXarid: 38640000, qarz: 0, oxirgi: '03.09.2026 09:14' },
  { id: 'm3', name: 'Nazarova Gulnora', phone: '+998 97 678-90-12', buyurtma: 7, jamiXarid: 18420000, qarz: 4260000, oxirgi: '03.09.2026 11:08' },
  { id: 'm4', name: 'Rahmonov Aziz', phone: '+998 95 567-89-01', buyurtma: 4, jamiXarid: 9840000, qarz: 5140000, oxirgi: '03.09.2026 10:32' },
  { id: 'm5', name: 'Abdullayev Sherzod', phone: '+998 90 901-23-45', buyurtma: 2, jamiXarid: 3180000, qarz: 0, oxirgi: '03.09.2026 16:22' },
  { id: 'm6', name: 'Yusupov Anvar', phone: '+998 97 333-44-55', buyurtma: 6, jamiXarid: 14260000, qarz: 0, oxirgi: '02.09.2026 11:52' },
  { id: 'm7', name: 'Ismoilov Bobur', phone: '+998 95 222-33-44', buyurtma: 5, jamiXarid: 11840000, qarz: 0, oxirgi: '02.09.2026 14:40' },
  { id: 'm8', name: 'Qodirova Malika', phone: '+998 93 111-22-33', buyurtma: 4, jamiXarid: 8920000, qarz: 0, oxirgi: '01.09.2026 15:18' },
  { id: 'm9', name: 'Toshev Jamshid', phone: '+998 88 555-66-77', buyurtma: 3, jamiXarid: 6480000, qarz: 1240000, oxirgi: '31.08.2026 12:04' },
  { id: 'm10', name: 'Sobirova Zulfiya', phone: '+998 91 012-34-56', buyurtma: 3, jamiXarid: 5240000, qarz: 0, oxirgi: '30.08.2026 16:30' },
  ...(() => {
    const names = [
      'Ergashev Qodir', 'Nazarov Jasur', 'Yo‘ldosheva Nilufar', 'Xolmatov Sardor', '«NUR SAVDO» MCHJ',
      'Sattorov Bekzod', 'Umarova Dilnoza', 'Jo‘rayev Sardor', '«OLMOS TEKSTIL» MCHJ', 'Qurbonov Akmal',
      'Hasanova Ziyoda', 'Mirzayev Ulug‘bek', 'Salimova Ra’no', '«BARAKA MEBEL» MCHJ', 'Tursunov Doston',
      'Ochilova Malika', 'Rustamov Jahongir', '«ZAMIN QURILISH» MCHJ',
    ]
    const kunlar = ['29.08.2026', '28.08.2026', '27.08.2026', '26.08.2026', '25.08.2026', '24.08.2026', '23.08.2026', '22.08.2026', '21.08.2026', '20.08.2026', '19.08.2026', '18.08.2026', '17.08.2026', '16.08.2026', '15.08.2026', '14.08.2026', '13.08.2026', '12.08.2026']
    return names.map((name, i) => {
      const buyurtma = 1 + ((i * 3) % 6)
      const hasQarz = i % 4 === 0
      return {
        id: `m${i + 11}`,
        name,
        phone: `+998 ${90 + (i % 9)} ${String(100 + i * 3).slice(0, 3)}-${String(10 + (i % 89)).padStart(2, '0')}-${String(10 + ((i * 7) % 89)).padStart(2, '0')}`,
        buyurtma,
        jamiXarid: 2400000 + ((i * 1370000) % 9200000) + buyurtma * 640000,
        qarz: hasQarz ? 620000 + (i % 5) * 460000 : 0,
        oxirgi: `${kunlar[i]} ${String(9 + (i % 9)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
      }
    })
  })(),
]

const REGISTON = {
  lastSales: [
    { date: '03.09.2026', amount: 4850000 },
    { date: '02.09.2026', amount: 12300000 },
    { date: '01.09.2026', amount: 7640000 },
    { date: '31.08.2026', amount: 9120000 },
    { date: '30.08.2026', amount: 5480000 },
    { date: '29.08.2026', amount: 15200000 },
  ],
  xodimlar: REGISTON_XODIMLAR,
  xodimlarStats: {
    xodimlar: 13,
    sotuvchi: 6,
    kassir: 2,
    ishHaqiFondi: 38400000,
    ishHaqiTaqsimot: [
      { label: 'QAT‘IY OYLIK', summa: 24600000, xodim: 8, pct: 64.1 },
      { label: 'FOIZLI', summa: 10200000, xodim: 4, pct: 26.6 },
      { label: 'ARALASH', summa: 3600000, xodim: 1, pct: 9.3 },
    ],
  },
  omborlar: [
    { id: 'o1', name: 'Registon asosiy', manzil: 'Registon ko‘chasi 12', rulon: 34, qoldiq: 968.2, qiymat: 184320000, holat: 'Faol' },
    { id: 'o2', name: 'Registon zaxira', manzil: 'Registon ko‘chasi 12, 2-qavat', rulon: 12, qoldiq: 316.2, qiymat: 48640000, holat: 'Faol' },
  ],
  omborStats: { omborlar: 2, rulon: REGISTON_RULONLAR.length, qoldiq: 1284.4, qiymat: 232960000 },
  rulonlar: REGISTON_RULONLAR,
  mijozlar: REGISTON_MIJOZLAR,
  mijozStats: { mijozlar: 640, qarziBor: 18, jamiQarz: 42180000, ortachaChek: 2306000 },
  savdo: {
    stats: { savdo12: 412800000, buyurtma: 172, ortachaChek: 2400000, qaytarish: 8640000 },
    dinamikaDavr: '01.10.2025 — 31.09.2026',
    dinamikaBirlik: 'mln UZS',
    dinamikaMax: 48,
    oylar: ['Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen'],
    dinamika: [31.8, 35.5, 38.4, 27.2, 29.3, 34.6, 31.8, 35.0, 33.0, 36.3, 38.8, 41.1],
    tolov: [
      { usul: 'Naqd', pct: 54.8, summa: 226040000 },
      { usul: 'Karta', pct: 27.0, summa: 111456000 },
      { usul: "O‘tkazma", pct: 10.3, summa: 42512000 },
      { usul: "Bo‘lib to‘lash", pct: 7.9, summa: 32792000 },
    ],
    tolovJami: 412800000,
    topTovarlar: [
      { name: 'AKTUEL 1247, bej', m2: 284, summa: 18640000 },
      { name: "Sun'iy maysa 4 m", m2: 412, summa: 14820000 },
      { name: "GRI MAVI YS17, ko‘k", m2: 196, summa: 12460000 },
      { name: 'Kovrolin STANDART', m2: 318, summa: 10240000 },
      { name: 'CREAM WHITE YK23', m2: 148, summa: 8640000 },
      { name: 'SHAGGY 5 sm, kulrang', m2: 86, summa: 6280000 },
      { name: 'ANTIK 770, ko‘k', m2: 74, summa: 4820000 },
    ],
    sotuvchilar: [
      { name: 'Rahimova Nigora', savdo: 34, summa: 78420000 },
      { name: 'Qodirova Malika', savdo: 28, summa: 62180000 },
      { name: 'Ismoilov Bobur', savdo: 24, summa: 54640000 },
      { name: 'Yusupov Anvar', savdo: 21, summa: 46320000 },
      { name: 'Nazarova Gulnora', savdo: 18, summa: 38940000 },
      { name: 'Toshev Jamshid', savdo: 14, summa: 28460000 },
      { name: 'Ergashev Qodir', savdo: 11, summa: 22180000 },
    ],
  },
}

// Boshqa filiallar uchun yengil sintez
function synth(branch) {
  const n = branch.stats.xodimlar
  const roles = ['Direktor', 'Menejer', 'Sotuvchi', 'Sotuvchi', 'Kassir', 'Omborchi', 'Administrator']
  const xodimlar = Array.from({ length: n }, (_, i) => ({
    id: `x${i + 1}`,
    name: `Xodim ${i + 1}`,
    lavozim: roles[i % roles.length],
    phone: `+998 ${90 + (i % 9)} ${100 + i}-${10 + i}-${20 + i}`,
    ishHaqiTuri: i === 0 ? 'Asoschi' : i % 2 ? 'Savdodan foiz' : 'Belgilangan summa',
    ishgaKirgan: `0${1 + (i % 9)}.0${1 + (i % 9)}.2024 09:00`,
    holat: 'Faol',
  }))
  const omborlar = Array.from({ length: Math.max(1, branch.ombor) }, (_, i) => ({
    id: `o${i + 1}`,
    name: `${branch.name} ombori ${i + 1}`,
    manzil: branch.manzil,
    rulon: 10 + i * 6,
    qoldiq: 240.5 + i * 90,
    qiymat: 40000000 + i * 12000000,
    holat: 'Faol',
  }))
  const rTovar = ['AKTUEL 1247, bej', 'GRI MAVI YS17, ko‘k', 'CREAM WHITE YK23', 'Sun‘iy maysa 4 m', 'Kovrolin STANDART', 'SHAGGY 5 sm, kulrang', 'OSCAR 3200', 'ANTIK 770, ko‘k', 'FLORIDA 4400, qizil', 'PALERMO 900, bej', 'VISION 5100', 'ATLAS 7700', 'LOTUS 220', 'DIAMOND 6000', 'SAHARA 1500, qumrang', 'TROY 2100']
  const rHolat = ['Mavjud', 'Mavjud', 'Band', 'Mavjud', 'Mavjud', 'Tugagan', 'Mavjud', 'Band']
  const rulonCount = omborlar.reduce((s, o) => s + o.rulon, 0)
  const rulonlar = Array.from({ length: rulonCount }, (_, i) => {
    const b = 20 + (i % 4) * 10
    const qoldiq = Number((b * (((i * 41) % 100) / 100)).toFixed(1))
    return {
      id: `r${i + 1}`,
      tovar: rTovar[i % rTovar.length],
      rulonNo: `RL-${20400 + i * 6}`,
      ombor: omborlar[i % omborlar.length].name,
      boshlangich: b,
      qoldiq,
      obrezok: i % 6 === 1,
      holat: qoldiq < 0.05 ? 'Tugagan' : rHolat[i % rHolat.length],
    }
  })
  const sotuvchi = xodimlar.filter((x) => x.lavozim === 'Sotuvchi').length
  const kassir = xodimlar.filter((x) => x.lavozim === 'Kassir').length
  const fond = n * 2600000
  const qatiyN = Math.max(1, Math.round(n * 0.6))
  const foizN = Math.max(1, Math.round(n * 0.3))
  const aralashN = Math.max(0, n - qatiyN - foizN)
  return {
    lastSales: REGISTON.lastSales.map((r) => ({ ...r, amount: Math.round(r.amount * 0.4) })),
    xodimlar,
    xodimlarStats: {
      xodimlar: n,
      sotuvchi,
      kassir,
      ishHaqiFondi: fond,
      ishHaqiTaqsimot: [
        { label: 'QAT‘IY OYLIK', summa: Math.round(fond * 0.64), xodim: qatiyN, pct: 64 },
        { label: 'FOIZLI', summa: Math.round(fond * 0.27), xodim: foizN, pct: 27 },
        { label: 'ARALASH', summa: Math.round(fond * 0.09), xodim: aralashN, pct: 9 },
      ],
    },
    omborlar,
    rulonlar,
    omborStats: {
      omborlar: omborlar.length,
      rulon: omborlar.reduce((s, o) => s + o.rulon, 0),
      qoldiq: omborlar.reduce((s, o) => s + o.qoldiq, 0),
      qiymat: omborlar.reduce((s, o) => s + o.qiymat, 0),
    },
    mijozlar: REGISTON.mijozlar.slice(0, 16),
    mijozStats: { mijozlar: branch.stats.mijozlar, qarziBor: 4, jamiQarz: 9800000, ortachaChek: 1840000 },
    savdo: { ...REGISTON.savdo, stats: { savdo12: branch.stats.savdo, buyurtma: 60, ortachaChek: 1900000, qaytarish: 2400000 } },
  }
}

const NAMED = [
  { id: 'registon', name: 'Registon filiali', tashkilot: 'SAG Gilamlari', turi: 'Salon', viloyat: 'Samarqand', tuman: 'Temiryo‘l', manzil: 'Registon ko‘chasi 12', phone: '+998 66 233-11-01', director: 'Salmonov Sardor', openedAt: '14.02.2024 10:24', status: 'active', ombor: 2, stats: { xodimlar: 13, omborlar: 2, mijozlar: 640, savdo: 412800000 } },
  { id: 'siyob', name: 'Siyob filiali', tashkilot: 'SAG Gilamlari', turi: 'Salon', viloyat: 'Samarqand', tuman: 'Siyob', manzil: 'Siyob bozori 4', phone: '+998 66 233-11-02', director: 'Karimova Nilufar', openedAt: '02.05.2024 11:10', status: 'active', ombor: 1, stats: { xodimlar: 14, omborlar: 1, mijozlar: 410, savdo: 286400000 } },
  { id: 'chilonzor', name: 'Chilonzor filiali', tashkilot: 'SAG Gilamlari', turi: 'Salon', viloyat: 'Toshkent', tuman: 'Chilonzor', manzil: 'Chilonzor 45', phone: '+998 71 200-14-05', director: 'Aliyev Jasur', openedAt: '18.06.2024 09:40', status: 'active', ombor: 3, stats: { xodimlar: 22, omborlar: 3, mijozlar: 980, savdo: 612300000 } },
  { id: 'yunusobod', name: 'Yunusobod filiali', tashkilot: 'SAG Gilamlari', turi: 'Salon', viloyat: 'Toshkent', tuman: 'Yunusobod', manzil: 'Amir Temur 108', phone: '+998 71 200-14-06', director: 'Nazarova Dilnoza', openedAt: '05.07.2024 10:00', status: 'active', ombor: 2, stats: { xodimlar: 16, omborlar: 2, mijozlar: 720, savdo: 498700000 } },
  { id: 'zavod-ombori', name: 'Zavod ombori', tashkilot: 'SAG Gilamlari', turi: 'Ombor', viloyat: 'Samarqand', tuman: 'Bulung‘ur', manzil: 'Sanoat zonasi 3', phone: '+998 66 233-11-09', director: 'Xolmatov Aziz', openedAt: '20.02.2024 08:30', status: 'active', ombor: 4, stats: { xodimlar: 9, omborlar: 4, mijozlar: 0, savdo: 0 } },
  { id: 'buxoro-markaziy', name: 'Buxoro markaziy', tashkilot: 'Buxoro Gilam Savdo', turi: 'Savdo nuqtasi', viloyat: 'Buxoro', tuman: 'Buxoro shahri', manzil: 'Mustaqillik 22', phone: '+998 65 221-30-11', director: 'Rasulov B.', openedAt: '06.06.2024 09:10', status: 'active', ombor: 1, stats: { xodimlar: 11, omborlar: 1, mijozlar: 320, savdo: 214800000 } },
  { id: 'gijduvon', name: 'G‘ijduvon filiali', tashkilot: 'Buxoro Gilam Savdo', turi: 'Salon', viloyat: 'Buxoro', tuman: 'G‘ijduvon', manzil: 'Navoiy 8', phone: '+998 65 221-30-12', director: 'Sobirov Aziz', openedAt: '22.07.2024 10:20', status: 'active', ombor: 1, stats: { xodimlar: 6, omborlar: 1, mijozlar: 140, savdo: 96400000 } },
  { id: 'namangan-markaziy', name: 'Namangan markaziy', tashkilot: 'Namangan Karpet', turi: 'Savdo nuqtasi', viloyat: 'Namangan', tuman: 'Namangan shahri', manzil: 'Navoiy 31', phone: '+998 69 227-45-01', director: 'Yo‘ldoshev N.', openedAt: '19.09.2024 09:30', status: 'active', ombor: 1, stats: { xodimlar: 10, omborlar: 1, mijozlar: 260, savdo: 168200000 } },
  { id: 'chust', name: 'Chust filiali', tashkilot: 'Namangan Karpet', turi: 'Salon', viloyat: 'Namangan', tuman: 'Chust', manzil: 'Istiqlol 5', phone: '+998 69 227-45-02', director: 'Umarov Javohir', openedAt: '01.10.2024 11:00', status: 'closed', ombor: 1, stats: { xodimlar: 5, omborlar: 1, mijozlar: 90, savdo: 42600000 }, close: { at: '12.07.2026 14:20', reason: 'Ijara shartnomasi tugadi', by: 'Anvarov Sardorbek' } },
  { id: 'andijon-markaziy', name: 'Andijon markaziy', tashkilot: 'Andijon Gilam Markazi', turi: 'Savdo nuqtasi', viloyat: 'Andijon', tuman: 'Andijon shahri', manzil: 'Bobur 17', phone: '+998 74 223-60-01', director: 'Karimov A.', openedAt: '02.11.2024 09:50', status: 'active', ombor: 1, stats: { xodimlar: 8, omborlar: 1, mijozlar: 180, savdo: 128400000 } },
  { id: 'fargona-markaziy', name: 'Farg‘ona markaziy', tashkilot: 'Farg‘ona To‘qimachilik', turi: 'Savdo nuqtasi', viloyat: 'Farg‘ona', tuman: 'Farg‘ona shahri', manzil: 'Al-Farg‘oniy 5', phone: '+998 73 244-12-01', director: 'Toshev F.', openedAt: '17.12.2024 10:15', status: 'active', ombor: 1, stats: { xodimlar: 9, omborlar: 1, mijozlar: 210, savdo: 142800000 } },
  { id: 'qoqon', name: 'Qo‘qon filiali', tashkilot: 'Farg‘ona To‘qimachilik', turi: 'Salon', viloyat: 'Farg‘ona', tuman: 'Qo‘qon shahri', manzil: 'Turkiston 63', phone: '+998 73 244-12-02', director: 'Ergashev Qodir', openedAt: '11.01.2025 09:25', status: 'active', ombor: 1, stats: { xodimlar: 7, omborlar: 1, mijozlar: 130, savdo: 88600000 } },
  { id: 'urganch-markaziy', name: 'Urganch markaziy', tashkilot: 'Xorazm Gilam', turi: 'Savdo nuqtasi', viloyat: 'Xorazm', tuman: 'Urganch shahri', manzil: 'Al-Xorazmiy 9', phone: '+998 62 226-77-01', director: 'Matniyozov X.', openedAt: '21.01.2025 10:40', status: 'active', ombor: 1, stats: { xodimlar: 8, omborlar: 1, mijozlar: 160, savdo: 104200000 } },
]

// Figma'dagi 47 ta / 45 faol / 2 yopilgan sonini saqlash uchun to'ldiramiz
const FILL_VILOYAT = ['Samarqand', 'Toshkent', 'Andijon', 'Namangan', 'Buxoro', 'Xorazm', 'Qashqadaryo', 'Navoiy']
const filled = [...NAMED]
let seq = 1
while (filled.length < 47) {
  const v = FILL_VILOYAT[seq % FILL_VILOYAT.length]
  const org = TASHKILOT_NOMLARI[seq % TASHKILOT_NOMLARI.length]
  const closed = seq === 4 // Chust'dan tashqari yana bitta yopilgan filial
  filled.push({
    id: `filial-${seq}`,
    name: `${v} filiali ${seq}`,
    tashkilot: org,
    turi: FILIAL_TURLARI[seq % 3],
    viloyat: v,
    tuman: (TUMANLAR[v] ?? ['Markaz'])[seq % 3],
    manzil: `${['Navoiy', 'Mustaqillik', 'Amir Temur', 'Bunyodkor'][seq % 4]} ${10 + seq}`,
    phone: `+998 ${70 + (seq % 9)} ${200 + seq}-${10 + (seq % 80)}-0${seq % 9}`,
    director: `Direktor ${seq}`,
    openedAt: `1${seq % 9}.0${1 + (seq % 8)}.2024 09:00`,
    status: closed ? 'closed' : 'active',
    ombor: 1 + (seq % 3),
    stats: { xodimlar: 5 + (seq % 12), omborlar: 1 + (seq % 3), mijozlar: 80 + seq * 7, savdo: 60000000 + seq * 3000000 },
    close: closed ? { at: '05.08.2026 10:00', reason: 'Optimizatsiya', by: 'Anvarov Sardorbek' } : undefined,
  })
  seq += 1
}

export const initialBranches = filled.map((b) => ({
  close: null,
  ...b,
  detail: b.id === 'registon' ? REGISTON : synth(b),
}))
