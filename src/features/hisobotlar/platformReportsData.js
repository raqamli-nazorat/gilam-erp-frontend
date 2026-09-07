// Backend hali ulanmagan — "Hisobotlar" (platforma admini) bo'limidagi 5 ta hisobot uchun mock ma'lumotlar.
// Bular tenant ERP'ning mavjud Hisobotlar katalogidan (hisobotlarData.js) mustaqil — Figma'dagi
// Savdo/Moliya/Ombor/Mijozlar/Xodimlar bo'yicha sahifalariga mos.

export const PLATFORM_REPORT_SLUGS = ['savdo-boyicha', 'moliya-boyicha', 'ombor-boyicha', 'mijozlar-boyicha', 'xodimlar-boyicha']

const trend = (value, unit) => ({ value, unit: unit ?? '%', positive: value >= 0 })

/* ─────────────────── Savdo bo'yicha ─────────────────── */
const SAVDO_ROWS = [
  { sana: '03.09.2026 16:24', buyurtma: 'SV-2052', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: 'Abdullayev Sherzod', dona: 1, m2: 6.0, tovar: 1184000, jami: 1280000, tolov: 'Naqd' },
  { sana: '03.09.2026 15:48', buyurtma: 'SV-2051', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', mijoz: 'Yo‘ldosheva Nilufar', dona: 2, m2: 9.6, tovar: 1640000, jami: 1640000, tolov: 'Karta' },
  { sana: '03.09.2026 14:12', buyurtma: 'SV-2049', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: 'Ergashev Qodir', dona: 1, m2: 12.0, tovar: 1764000, jami: 1860000, tolov: 'Naqd' },
  { sana: '03.09.2026 13:05', buyurtma: 'SV-2048', tashkilot: 'Buxoro Gilam Savdo', filial: 'Buxoro markaziy', mijoz: 'Sobirova Zulfiya', dona: 1, m2: 4.5, tovar: 720000, jami: 720000, tolov: 'Karta' },
  { sana: '03.09.2026 12:20', buyurtma: 'SV-2047', tashkilot: 'SAG Gilamlari', filial: 'Yunusobod filiali', mijoz: '«OLMOS SAVDO» MCHJ', dona: 4, m2: 31.6, tovar: 3928000, jami: 4120000, tolov: 'O‘tkazma' },
  { sana: '03.09.2026 11:47', buyurtma: 'SV-2046', tashkilot: 'Namangan Karpet', filial: 'Namangan markaziy', mijoz: 'Toshev Dilshod', dona: 2, m2: 8.4, tovar: 1540000, jami: 1540000, tolov: 'Naqd' },
  { sana: '03.09.2026 11:08', buyurtma: 'SV-2045', tashkilot: 'SAG Gilamlari', filial: 'Siyob filiali', mijoz: 'Nazarova Gulnora', dona: 3, m2: 14.2, tovar: 2684000, jami: 2780000, tolov: 'Karta' },
  { sana: '03.09.2026 10:32', buyurtma: 'SV-2044', tashkilot: 'Andijon Gilam Markazi', filial: 'Andijon markaziy', mijoz: 'Rahmonov Aziz', dona: 1, m2: 5.2, tovar: 960000, jami: 960000, tolov: 'Naqd' },
  { sana: '03.09.2026 10:05', buyurtma: 'SV-2043', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: '«TITAN GROUP» MCHJ', dona: 3, m2: 18.0, tovar: 3228000, jami: 3420000, tolov: 'Bo‘lib to‘lash' },
  { sana: '03.09.2026 09:41', buyurtma: 'SV-2042', tashkilot: 'Farg‘ona To‘qimachilik', filial: 'Qo‘qon filiali', mijoz: 'Yusupova Malika', dona: 1, m2: 6.0, tovar: 1180000, jami: 1180000, tolov: 'Karta' },
  { sana: '03.09.2026 09:14', buyurtma: 'SV-2041', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: 'Karimov Sanjar', dona: 2, m2: 10.8, tovar: 2244000, jami: 2340000, tolov: 'Naqd' },
  { sana: '02.09.2026 17:56', buyurtma: 'SV-2040', tashkilot: 'Xorazm Gilam', filial: 'Urganch markaziy', mijoz: 'Nazarov Jasur', dona: 2, m2: 9.0, tovar: 1920000, jami: 1920000, tolov: 'Naqd' },
  { sana: '02.09.2026 16:14', buyurtma: 'SV-2039', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', mijoz: 'Qodirova Malika', dona: 3, m2: 16.4, tovar: 3364000, jami: 3460000, tolov: 'O‘tkazma' },
  { sana: '02.09.2026 14:40', buyurtma: 'SV-2038', tashkilot: 'Buxoro Gilam Savdo', filial: 'G‘ijduvon filiali', mijoz: 'Ismoilov Bobur', dona: 2, m2: 11.2, tovar: 2240000, jami: 2240000, tolov: 'Naqd' },
]

const savdoReport = {
  name: 'Savdo bo‘yicha',
  manba: 'Order, OrderItem, Product',
  statMeta: [
    { key: 'buyurtmalar', title: 'Buyurtmalar', suffix: ' ta', digits: 0, sub: 'sentyabr, 12 tashkilot', trend: trend(6.4) },
    { key: 'aylanma', title: 'Aylanma', suffix: ' UZS', digits: 2, sub: '12 oy', trend: trend(27.2) },
    { key: 'ortachaChek', title: 'O‘rtacha chek', suffix: ' UZS', digits: 2, sub: 'bitta buyurtma', trend: trend(3.1) },
    { key: 'qaytarishlar', title: 'Qaytarishlar', suffix: ' ta', digits: 0, sub: '1,6 % buyurtmadan', trend: trend(-0.4) },
  ],
  stats: { buyurtmalar: 4128, aylanma: 9552440000, ortachaChek: 2313000, qaytarishlar: 68 },
  groups: [
    { label: '', span: 5 },
    { label: 'Miqdor', span: 2 },
    { label: 'Summa, UZS', span: 3 },
  ],
  columns: [
    { key: 'sana', label: 'Sana', align: 'left' },
    { key: 'buyurtma', label: 'Buyurtma', align: 'left' },
    { key: 'tashkilot', label: 'Tashkilot', align: 'left' },
    { key: 'filial', label: 'Filial', align: 'left' },
    { key: 'mijoz', label: 'Mijoz', align: 'left' },
    { key: 'dona', label: 'Dona', align: 'right', num: 0 },
    { key: 'm2', label: 'm²', align: 'right', num: 2 },
    { key: 'tovar', label: 'Tovar', align: 'right', num: 0 },
    { key: 'jami', label: 'Jami', align: 'right', num: 0 },
    { key: 'tolov', label: 'To‘lov', align: 'left' },
  ],
  rows: SAVDO_ROWS,
  total: { sana: 'JAMI', buyurtma: '4 128 ta', dona: 9480, m2: 48210, tovar: 9139640000, jami: 9552440000, tolov: '' },
  filterFields: [
    { key: 'davrDan', label: 'Davr, dan', kind: 'date', default: '01.09.2026 00:00' },
    { key: 'davrGacha', label: 'Davr, gacha', kind: 'date', default: '30.09.2026 23:59' },
    { key: 'tashkilot', label: 'Tashkilot', kind: 'multi', default: '2 ta tanlangan' },
    { key: 'filial', label: 'Filial', kind: 'select', default: 'Barchasi' },
    { key: 'tolovUsuli', label: 'To‘lov usuli', kind: 'select', default: 'Barchasi' },
    { key: 'buyurtmaHolati', label: 'Buyurtma holati', kind: 'select', default: 'Yakunlangan' },
    { key: 'sotuvchi', label: 'Sotuvchi', kind: 'select', default: 'Barchasi' },
    { key: 'kategoriya', label: 'Kategoriya', kind: 'select', default: 'Barchasi' },
    { key: 'summaDan', label: 'Summa, dan', kind: 'number', default: '0,00' },
    { key: 'summaGacha', label: 'Summa, gacha', kind: 'number', default: '0,00' },
    { key: 'mijozTuri', label: 'Mijoz turi', kind: 'select', default: 'Barchasi' },
    { key: 'qaytarishlar', label: 'Qaytarishlar', kind: 'select', default: 'Hisobga olinsin' },
  ],
}

/* ─────────────────── Moliya bo'yicha ─────────────────── */
const MOLIYA_ROWS = [
  { sana: '03.09.2026 16:24', tolov: 'TL-4821', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: 'Abdullayev Sherzod', usul: 'Naqd', summa: 1280000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 15:48', tolov: 'TL-4820', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', mijoz: 'Yo‘ldosheva Nilufar', usul: 'Karta', summa: 1640000, qarz: 980000, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 14:12', tolov: 'TL-4819', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: 'Ergashev Qodir', usul: 'Naqd', summa: 1860000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 13:05', tolov: 'TL-4818', tashkilot: 'Buxoro Gilam Savdo', filial: 'Buxoro markaziy', mijoz: 'Sobirova Zulfiya', usul: 'Karta', summa: 720000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 12:26', tolov: 'TL-4817', tashkilot: 'SAG Gilamlari', filial: 'Yunusobod filiali', mijoz: '«OLMOS SAVDO» MCHJ', usul: 'O‘tkazma', summa: 4120000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 11:52', tolov: 'TL-4816', tashkilot: 'Namangan Karpet', filial: 'Namangan markaziy', mijoz: 'Toshev Dilshod', usul: 'Naqd', summa: 1000000, qarz: 540000, holat: 'Qisman' },
  { sana: '03.09.2026 11:08', tolov: 'TL-4815', tashkilot: 'SAG Gilamlari', filial: 'Siyob filiali', mijoz: 'Nazarova Gulnora', usul: 'Karta', summa: 2780000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 10:32', tolov: 'TL-4814', tashkilot: 'Andijon Gilam Markazi', filial: 'Andijon markaziy', mijoz: 'Rahmonov Aziz', usul: 'Naqd', summa: 960000, qarz: 5140000, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 10:05', tolov: 'TL-4813', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: '«TITAN GROUP» MCHJ', usul: 'Bo‘lib to‘lash', summa: 1140000, qarz: 42180000, holat: 'Grafik bo‘yicha' },
  { sana: '03.09.2026 09:36', tolov: 'TL-4812', tashkilot: 'Farg‘ona To‘qimachilik', filial: 'Qo‘qon filiali', mijoz: 'Yusupova Malika', usul: 'Karta', summa: 1180000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '03.09.2026 09:18', tolov: 'TL-4811', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', mijoz: 'Karimov Sanjar', usul: 'Naqd', summa: 2340000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '02.09.2026 17:56', tolov: 'TL-4810', tashkilot: 'Xorazm Gilam', filial: 'Urganch markaziy', mijoz: 'Nazarov Jasur', usul: 'Naqd', summa: 1920000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '02.09.2026 16:14', tolov: 'TL-4809', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', mijoz: 'Qodirova Malika', usul: 'O‘tkazma', summa: 3460000, qarz: 0, holat: 'Tasdiqlangan' },
  { sana: '02.09.2026 14:40', tolov: 'TL-4808', tashkilot: 'Buxoro Gilam Savdo', filial: 'G‘ijduvon filiali', mijoz: 'Ismoilov Bobur', usul: 'Naqd', summa: 2240000, qarz: 0, holat: 'Tasdiqlangan' },
]

const moliyaReport = {
  name: 'Moliya bo‘yicha',
  manba: 'Payment, DebtLedger, InstallmentAgreement',
  statMeta: [
    { key: 'tushum', title: 'Tushum', suffix: ' UZS', digits: 2, sub: '12 oy', trend: trend(8.4) },
    { key: 'qarzdorlik', title: 'Qarzdorlik', suffix: ' UZS', digits: 2, sub: '318 ta mijoz', trend: trend(-2.1) },
    { key: 'muddatiOtgan', title: 'Muddati o‘tgan', suffix: ' UZS', digits: 2, sub: '24,8 % qarzdan', trend: trend(1.2) },
    { key: 'bolibTolash', title: 'Bo‘lib to‘lash', suffix: ' ta shartnoma', digits: 0, sub: 'amaldagi', trend: trend(11, 'ta') },
  ],
  stats: { tushum: 6924010000, qarzdorlik: 1284620000, muddatiOtgan: 318460000, bolibTolash: 164 },
  columns: [
    { key: 'sana', label: 'Sana', align: 'left' },
    { key: 'tolov', label: 'To‘lov', align: 'left' },
    { key: 'tashkilot', label: 'Tashkilot', align: 'left' },
    { key: 'filial', label: 'Filial', align: 'left' },
    { key: 'mijoz', label: 'Mijoz', align: 'left' },
    { key: 'usul', label: 'Usul', align: 'left' },
    { key: 'summa', label: 'Summa', align: 'right', num: 0 },
    { key: 'qarz', label: 'Qarz', align: 'right', num: 0 },
    { key: 'holat', label: 'Holat', align: 'left' },
  ],
  rows: MOLIYA_ROWS,
  total: { sana: 'JAMI', tolov: '3 642 ta', summa: 6924010000, qarz: 1284620000, holat: '' },
  filterFields: [
    { key: 'davrDan', label: 'Davr, dan', kind: 'date', default: '01.09.2026 00:00' },
    { key: 'davrGacha', label: 'Davr, gacha', kind: 'date', default: '30.09.2026 23:59' },
    { key: 'tashkilot', label: 'Tashkilot', kind: 'select', default: 'Barchasi' },
    { key: 'filial', label: 'Filial', kind: 'select', default: 'Barchasi' },
    { key: 'tolovUsuli', label: 'To‘lov usuli', kind: 'select', default: 'Barchasi' },
    { key: 'tolovTuri', label: 'To‘lov turi', kind: 'select', default: 'To‘liq' },
    { key: 'kassir', label: 'Kassir', kind: 'select', default: 'Barchasi' },
    { key: 'tolovHolati', label: 'To‘lov holati', kind: 'select', default: 'Tasdiqlangan' },
    { key: 'summaDan', label: 'Summa, dan', kind: 'number', default: '0,00' },
    { key: 'summaGacha', label: 'Summa, gacha', kind: 'number', default: '0,00' },
    { key: 'qarzHolati', label: 'Qarz holati', kind: 'select', default: 'Barchasi' },
    { key: 'shartnoma', label: 'Shartnoma', kind: 'select', default: 'Barchasi' },
  ],
}

/* ─────────────────── Ombor bo'yicha ─────────────────── */
const OMBOR_ROWS = [
  { sana: '03.09.2026 16:40', hujjat: 'OM-1284', ombor: 'Registon ombori', tovar: 'AKTUEL 1247, bej', rulon: 'RL-20411', amal: 'Chiqim', m2: 24.0, qiymat: 10080000, masul: 'Xolmatov S.' },
  { sana: '03.09.2026 15:12', hujjat: 'OM-1283', ombor: 'Chilonzor ombori', tovar: 'GRI MAVI YS17', rulon: 'RL-20388', amal: 'Chiqim', m2: 18.5, qiymat: 7030000, masul: 'Sobirov A.' },
  { sana: '03.09.2026 14:05', hujjat: 'OM-1282', ombor: 'Zavod ombori', tovar: 'Sun‘iy maysa 4 m', rulon: 'RL-20502', amal: 'Kirim', m2: 220.0, qiymat: 31900000, masul: 'Xolmatov S.' },
  { sana: '03.09.2026 12:48', hujjat: 'OM-1281', ombor: 'Registon ombori', tovar: 'CREAM WHITE YK23', rulon: 'RL-20477', amal: 'Ko‘chirish', m2: 46.0, qiymat: 18400000, masul: 'Xolmatov S.' },
  { sana: '03.09.2026 11:30', hujjat: 'OM-1280', ombor: 'Siyob ombori', tovar: 'Kovrolin STANDART', rulon: 'RL-20455', amal: 'Chiqim', m2: 62.0, qiymat: 9920000, masul: 'Toshev F.' },
  { sana: '03.09.2026 10:52', hujjat: 'OM-1279', ombor: 'Buxoro ombori', tovar: 'SHAGGY 5 sm', rulon: 'RL-20431', amal: 'Chiqim', m2: 12.0, qiymat: 5640000, masul: 'Rasulov B.' },
  { sana: '03.09.2026 10:14', hujjat: 'OM-1278', ombor: 'Zavod ombori', tovar: 'AKTUEL 1247, bej', rulon: 'RL-20428', amal: 'Kirim', m2: 340.0, qiymat: 142800000, masul: 'Xolmatov S.' },
  { sana: '02.09.2026 17:26', hujjat: 'OM-1277', ombor: 'Namangan ombori', tovar: 'GRI MAVI YS17', rulon: 'RL-20402', amal: 'Qirqim', m2: 3.2, qiymat: 1216000, masul: 'Yo‘ldoshev N.' },
  { sana: '02.09.2026 16:08', hujjat: 'OM-1276', ombor: 'Yunusobod ombori', tovar: 'Sun‘iy maysa 4 m', rulon: 'RL-20396', amal: 'Chiqim', m2: 86.0, qiymat: 12470000, masul: 'Ismoilov B.' },
  { sana: '02.09.2026 14:44', hujjat: 'OM-1275', ombor: 'Registon ombori', tovar: 'Bordo klassik', rulon: 'RL-20384', amal: 'Ko‘chirish', m2: 28.0, qiymat: 13720000, masul: 'Xolmatov S.' },
  { sana: '02.09.2026 12:20', hujjat: 'OM-1274', ombor: 'Qo‘qon ombori', tovar: 'Kovrolin STANDART', rulon: 'RL-20361', amal: 'Chiqim', m2: 44.0, qiymat: 7040000, masul: 'Ergashev Q.' },
  { sana: '02.09.2026 09:58', hujjat: 'OM-1273', ombor: 'Zavod ombori', tovar: 'CREAM WHITE YK23', rulon: 'RL-20350', amal: 'Kirim', m2: 180.0, qiymat: 72000000, masul: 'Xolmatov S.' },
  { sana: '01.09.2026 17:40', hujjat: 'OM-1272', ombor: 'Andijon ombori', tovar: 'SHAGGY 5 sm', rulon: 'RL-20338', amal: 'Chiqim', m2: 16.0, qiymat: 7520000, masul: 'Karimov A.' },
  { sana: '01.09.2026 15:22', hujjat: 'OM-1271', ombor: 'Zavod ombori', tovar: 'Bordo klassik', rulon: 'RL-20329', amal: 'Kirim', m2: 260.0, qiymat: 127400000, masul: 'Xolmatov S.' },
]

const omborReport = {
  name: 'Ombor bo‘yicha',
  manba: 'Warehouse, ProductStock, CarpetRoll, StockTransaction',
  statMeta: [
    { key: 'omborlar', title: 'Omborlar', suffix: ' ta', digits: 0, sub: '12 tashkilotda', trend: trend(2, 'ta') },
    { key: 'qoldiqQiymati', title: 'Qoldiq qiymati', suffix: ' UZS', digits: 2, sub: 'joriy qoldiq', trend: trend(3.2) },
    { key: 'rulonlar', title: 'Rulonlar', suffix: ' ta', digits: 0, sub: 'omborlarda', trend: trend(184, 'ta') },
    { key: 'qirqimlar', title: 'Qirqimlar', suffix: ' ta', digits: 0, sub: '8,0 % rulondan', trend: trend(-0.6) },
  ],
  stats: { omborlar: 63, qoldiqQiymati: 18340000000, rulonlar: 4820, qirqimlar: 386 },
  columns: [
    { key: 'sana', label: 'Sana', align: 'left' },
    { key: 'hujjat', label: 'Hujjat', align: 'left' },
    { key: 'ombor', label: 'Ombor', align: 'left' },
    { key: 'tovar', label: 'Tovar', align: 'left' },
    { key: 'rulon', label: 'Rulon', align: 'left' },
    { key: 'amal', label: 'Amal', align: 'left' },
    { key: 'm2', label: 'm²', align: 'right', num: 2 },
    { key: 'qiymat', label: 'Qiymat', align: 'right', num: 0 },
    { key: 'masul', label: 'Mas‘ul', align: 'left' },
  ],
  rows: OMBOR_ROWS,
  total: { sana: 'JAMI', hujjat: '1 284 ta', m2: 9580, qiymat: 18340000000 },
  filterFields: [
    { key: 'davrDan', label: 'Davr, dan', kind: 'date', default: '01.09.2026 00:00' },
    { key: 'davrGacha', label: 'Davr, gacha', kind: 'date', default: '30.09.2026 23:59' },
    { key: 'tashkilot', label: 'Tashkilot', kind: 'select', default: 'Barchasi' },
    { key: 'ombor', label: 'Ombor', kind: 'select', default: 'Barchasi' },
    { key: 'amalTuri', label: 'Amal turi', kind: 'select', default: 'Barchasi' },
    { key: 'tovar', label: 'Tovar', kind: 'select', default: 'Barchasi' },
    { key: 'kolleksiya', label: 'Kolleksiya', kind: 'select', default: 'Barchasi' },
    { key: 'rulonHolati', label: 'Rulon holati', kind: 'select', default: 'Barchasi' },
    { key: 'miqdorDan', label: 'Miqdor, dan', kind: 'number', default: '0,00' },
    { key: 'miqdorGacha', label: 'Miqdor, gacha', kind: 'number', default: '0,00' },
    { key: 'qirqimlar', label: 'Qirqimlar', kind: 'select', default: 'Hisobga olinsin' },
    { key: 'masul', label: 'Mas‘ul', kind: 'select', default: 'Barchasi' },
  ],
}

/* ─────────────────── Mijozlar bo'yicha ─────────────────── */
const MIJOZLAR_ROWS = [
  { oxirgi: '03.09.2026 16:24', mijoz: 'Abdullayev Sherzod', phone: '+998 90 901-23-45', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', soni: 2, xarid: 3180000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 15:48', mijoz: 'Yo‘ldosheva Nilufar', phone: '+998 93 222-11-00', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', soni: 2, xarid: 3640000, qarz: 980000, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 14:12', mijoz: 'Ergashev Qodir', phone: '+998 90 666-77-88', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', soni: 3, xarid: 4860000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 13:05', mijoz: 'Sobirova Zulfiya', phone: '+998 91 012-34-56', tashkilot: 'Buxoro Gilam Savdo', filial: 'Buxoro markaziy', soni: 3, xarid: 5240000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 12:26', mijoz: '«OLMOS SAVDO» MCHJ', phone: '+998 88 445-67-89', tashkilot: 'SAG Gilamlari', filial: 'Yunusobod filiali', soni: 9, xarid: 38640000, qarz: 4120000, turi: 'Yuridik' },
  { oxirgi: '03.09.2026 11:52', mijoz: 'Toshev Dilshod', phone: '+998 88 555-66-77', tashkilot: 'Namangan Karpet', filial: 'Namangan markaziy', soni: 3, xarid: 6480000, qarz: 1240000, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 11:08', mijoz: 'Nazarova Gulnora', phone: '+998 97 678-90-12', tashkilot: 'SAG Gilamlari', filial: 'Siyob filiali', soni: 7, xarid: 18420000, qarz: 4260000, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 10:32', mijoz: 'Rahmonov Aziz', phone: '+998 95 567-89-01', tashkilot: 'Andijon Gilam Markazi', filial: 'Andijon markaziy', soni: 4, xarid: 9840000, qarz: 5140000, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 10:05', mijoz: '«TITAN GROUP» MCHJ', phone: '+998 90 111-22-33', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', soni: 18, xarid: 186420000, qarz: 42180000, turi: 'Yuridik' },
  { oxirgi: '03.09.2026 09:36', mijoz: 'Yusupova Malika', phone: '+998 94 234-56-78', tashkilot: 'Farg‘ona To‘qimachilik', filial: 'Qo‘qon filiali', soni: 2, xarid: 4120000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '03.09.2026 09:18', mijoz: 'Karimov Sanjar', phone: '+998 90 123-45-67', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', soni: 9, xarid: 38640000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '02.09.2026 17:56', mijoz: 'Nazarov Jasur', phone: '+998 94 999-00-11', tashkilot: 'Xorazm Gilam', filial: 'Urganch markaziy', soni: 2, xarid: 4120000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '02.09.2026 16:14', mijoz: 'Qodirova Malika', phone: '+998 93 111-22-33', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', soni: 4, xarid: 8920000, qarz: 0, turi: 'Jismoniy' },
  { oxirgi: '02.09.2026 14:40', mijoz: 'Ismoilov Bobur', phone: '+998 95 222-33-44', tashkilot: 'Buxoro Gilam Savdo', filial: 'G‘ijduvon filiali', soni: 5, xarid: 11840000, qarz: 0, turi: 'Jismoniy' },
]

const mijozlarReport = {
  name: 'Mijozlar bo‘yicha',
  manba: 'Customer, Order, DebtLedger',
  statMeta: [
    { key: 'mijozlar', title: 'Mijozlar', suffix: ' ta', digits: 0, sub: 'bazada', trend: trend(284, 'ta') },
    { key: 'yangi', title: 'Yangi', suffix: ' ta', digits: 0, sub: 'sentyabr', trend: trend(18.2) },
    { key: 'takroriyXarid', title: 'Takroriy xarid', suffix: ' ta', digits: 0, sub: '24,9 % mijozdan', trend: trend(2.4) },
    { key: 'qarzdor', title: 'Qarzdor', suffix: ' ta', digits: 0, sub: '1 284 620 000,00 UZS', trend: trend(-12, 'ta') },
  ],
  stats: { mijozlar: 7480, yangi: 284, takroriyXarid: 1862, qarzdor: 318 },
  columns: [
    { key: 'oxirgi', label: 'Oxirgi savdo', align: 'left' },
    { key: 'mijoz', label: 'Mijoz', align: 'left' },
    { key: 'phone', label: 'Telefon', align: 'left' },
    { key: 'tashkilot', label: 'Tashkilot', align: 'left' },
    { key: 'filial', label: 'Filial', align: 'left' },
    { key: 'soni', label: 'Soni', align: 'right', num: 0 },
    { key: 'xarid', label: 'Xarid', align: 'right', num: 0 },
    { key: 'qarz', label: 'Qarz', align: 'right', num: 0 },
    { key: 'turi', label: 'Turi', align: 'left' },
  ],
  rows: MIJOZLAR_ROWS,
  total: { oxirgi: 'JAMI', mijoz: '7 480 ta mijoz', soni: 4128, xarid: 9552440000, qarz: 1284620000 },
  filterFields: [
    { key: 'davrDan', label: 'Davr, dan', kind: 'date', default: '01.09.2026 00:00' },
    { key: 'davrGacha', label: 'Davr, gacha', kind: 'date', default: '30.09.2026 23:59' },
    { key: 'tashkilot', label: 'Tashkilot', kind: 'select', default: 'Barchasi' },
    { key: 'filial', label: 'Filial', kind: 'select', default: 'Barchasi' },
    { key: 'mijozTuri', label: 'Mijoz turi', kind: 'select', default: 'Barchasi' },
    { key: 'hudud', label: 'Hudud', kind: 'select', default: 'Barchasi' },
    { key: 'qarzHolati', label: 'Qarz holati', kind: 'select', default: 'Barchasi' },
    { key: 'faollik', label: 'Faollik', kind: 'select', default: 'Barchasi' },
    { key: 'xaridDan', label: 'Xarid, dan', kind: 'number', default: '0,00' },
    { key: 'xaridGacha', label: 'Xarid, gacha', kind: 'number', default: '0,00' },
    { key: 'buyurtmaSoniDan', label: 'Buyurtma soni, dan', kind: 'number', default: '0' },
    { key: 'oxirgiSavdo', label: 'Oxirgi savdo', kind: 'select', default: 'Barchasi' },
  ],
}

/* ─────────────────── Xodimlar bo'yicha ─────────────────── */
// Bu hisobot Foydalanuvchilar modulidagi ma'lumotdan hosil qilinadi (bir xil F.I.SH./tashkilot/filial/sana) —
// qatorlar buildXodimlarRows() orqali runtime'da quriladi, shu yerda faqat namuna (fallback) saqlanadi.
export const XODIMLAR_SAMPLE_ROWS = [
  { xodim: 'Salmonov Sardor', lavozim: 'Direktor', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', ishgaKirgan: '14.02.2024', savdo: 0, komissiya: 0, holat: 'Ishlayapti' },
  { xodim: 'Mirzajonov G‘afforjon', lavozim: 'Menejer', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', ishgaKirgan: '20.03.2024', savdo: 48640000, komissiya: 2432000, holat: 'Ishlayapti' },
  { xodim: 'Sobirov Aziz', lavozim: 'Kassir', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', ishgaKirgan: '05.04.2024', savdo: 22680000, komissiya: 640000, holat: 'Ishlayapti' },
  { xodim: 'Rahimova Nigora', lavozim: 'Sotuvchi', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', ishgaKirgan: '12.06.2024', savdo: 31240000, komissiya: 1562000, holat: 'Ishlayapti' },
  { xodim: 'Qodirova Malika', lavozim: 'Sotuvchi', tashkilot: 'SAG Gilamlari', filial: 'Chilonzor filiali', ishgaKirgan: '18.08.2024', savdo: 28460000, komissiya: 1423000, holat: 'Ishlayapti' },
  { xodim: 'Ismoilov Bobur', lavozim: 'Sotuvchi', tashkilot: 'SAG Gilamlari', filial: 'Yunusobod filiali', ishgaKirgan: '02.11.2024', savdo: 26180000, komissiya: 1309000, holat: 'Ishlayapti' },
  { xodim: 'Yusupov Anvar', lavozim: 'Sotuvchi', tashkilot: 'Buxoro Gilam Savdo', filial: 'Buxoro markaziy', ishgaKirgan: '15.01.2025', savdo: 24820000, komissiya: 1241000, holat: 'Ishlayapti' },
  { xodim: 'Nazarova Gulnora', lavozim: 'Sotuvchi', tashkilot: 'Namangan Karpet', filial: 'Namangan markaziy', ishgaKirgan: '08.03.2025', savdo: 21460000, komissiya: 1073000, holat: 'Ishlayapti' },
  { xodim: 'Toshev Jamshid', lavozim: 'Sotuvchi', tashkilot: 'Andijon Gilam Markazi', filial: 'Andijon markaziy', ishgaKirgan: '22.05.2025', savdo: 19840000, komissiya: 992000, holat: 'Ishlayapti' },
  { xodim: 'Ergashev Qodir', lavozim: 'Kassir', tashkilot: 'Farg‘ona To‘qimachilik', filial: 'Qo‘qon filiali', ishgaKirgan: '10.07.2025', savdo: 18260000, komissiya: 548000, holat: 'Ishlayapti' },
  { xodim: 'Xolmatov Sardor', lavozim: 'Omborchi', tashkilot: 'SAG Gilamlari', filial: 'Zavod ombori', ishgaKirgan: '01.09.2026', savdo: 0, komissiya: 0, holat: 'Ishga olindi' },
  { xodim: 'Abdullayev Sherzod', lavozim: 'Sotuvchi', tashkilot: 'Xorazm Gilam', filial: 'Urganch markaziy', ishgaKirgan: '14.09.2025', savdo: 14280000, komissiya: 714000, holat: 'Chiqarildi' },
  { xodim: 'Rahmonov Aziz', lavozim: 'Administrator', tashkilot: 'SAG Gilamlari', filial: 'Registon filiali', ishgaKirgan: '03.12.2025', savdo: 0, komissiya: 0, holat: 'Ishlayapti' },
  { xodim: 'Nazarov Jasur', lavozim: 'Sotuvchi', tashkilot: 'Xorazm Gilam', filial: 'Urganch markaziy', ishgaKirgan: '19.01.2026', savdo: 12640000, komissiya: 632000, holat: 'Ishlayapti' },
]

const xodimlarReport = {
  name: 'Xodimlar bo‘yicha',
  manba: 'Employee, EmployeeCommission, RecruitmentDismissal',
  statMeta: [
    { key: 'xodimlar', title: 'Xodimlar', suffix: ' ta', digits: 0, sub: '12 tashkilotda', trend: trend(18, 'ta') },
    { key: 'ishgaOlingan', title: 'Ishga olingan', suffix: ' ta', digits: 0, sub: 'sentyabr', trend: trend(4, 'ta') },
    { key: 'chiqarilgan', title: 'Chiqarilgan', suffix: ' ta', digits: 0, sub: 'sentyabr', trend: trend(-2, 'ta') },
    { key: 'komissiya', title: 'Komissiya', suffix: ' UZS', digits: 2, sub: 'hisoblangan', trend: trend(6.8) },
  ],
  stats: { xodimlar: 284, ishgaOlingan: 18, chiqarilgan: 6, komissiya: 412800000 },
  columns: [
    { key: 'xodim', label: 'Xodim', align: 'left' },
    { key: 'lavozim', label: 'Lavozim', align: 'left' },
    { key: 'tashkilot', label: 'Tashkilot', align: 'left' },
    { key: 'filial', label: 'Filial', align: 'left' },
    { key: 'ishgaKirgan', label: 'Ishga kirgan', align: 'left' },
    { key: 'savdo', label: 'Savdo', align: 'right', num: 0 },
    { key: 'komissiya', label: 'Komissiya', align: 'right', num: 0 },
    { key: 'holat', label: 'Holat', align: 'left' },
  ],
  rows: XODIMLAR_SAMPLE_ROWS,
  total: { xodim: 'JAMI, 284 ta xodim', savdo: 9552440000, komissiya: 412800000 },
  filterFields: [
    { key: 'davrDan', label: 'Davr, dan', kind: 'date', default: '01.09.2026 00:00' },
    { key: 'davrGacha', label: 'Davr, gacha', kind: 'date', default: '30.09.2026 23:59' },
    { key: 'tashkilot', label: 'Tashkilot', kind: 'select', default: 'Barchasi' },
    { key: 'filial', label: 'Filial', kind: 'select', default: 'Barchasi' },
    { key: 'lavozim', label: 'Lavozim', kind: 'select', default: 'Barchasi' },
    { key: 'ishHaqiTuri', label: 'Ish haqi turi', kind: 'select', default: 'Barchasi' },
    { key: 'xodimHolati', label: 'Xodim holati', kind: 'select', default: 'Ishlayapti' },
    { key: 'komissiyaHolati', label: 'Komissiya holati', kind: 'select', default: 'Barchasi' },
    { key: 'komissiyaDan', label: 'Komissiya, dan', kind: 'number', default: '0,00' },
    { key: 'komissiyaGacha', label: 'Komissiya, gacha', kind: 'number', default: '0,00' },
    { key: 'ishgaKirgan', label: 'Ishga kirgan', kind: 'select', default: 'Barchasi' },
    { key: 'masul', label: 'Mas‘ul', kind: 'select', default: 'Barchasi' },
  ],
}

export const PLATFORM_REPORTS = {
  'savdo-boyicha': savdoReport,
  'moliya-boyicha': moliyaReport,
  'ombor-boyicha': omborReport,
  'mijozlar-boyicha': mijozlarReport,
  'xodimlar-boyicha': xodimlarReport,
}
