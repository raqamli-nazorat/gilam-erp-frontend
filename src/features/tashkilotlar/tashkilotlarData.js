// Backend hali ulanmagan — "Tashkilotlar" (platforma admini) bo'limi uchun mock ma'lumotlar.

export const VILOYATLAR = [
  'Toshkent shahri',
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Andijon',
  'Farg‘ona',
  'Namangan',
  'Xorazm',
  'Qashqadaryo',
  'Surxondaryo',
  'Navoiy',
  'Jizzax',
  'Sirdaryo',
  'Qoraqalpog‘iston',
]

// Har bir viloyat uchun bir nechta tuman (modal'dagi "Tuman" select uchun)
export const TUMANLAR = {
  'Toshkent shahri': ['Chilonzor', 'Yunusobod', 'Sergeli', 'Mirzo Ulug‘bek', 'Yashnobod', 'Shayxontohur'],
  Toshkent: ['Zangiota', 'Qibray', 'Bo‘ka', 'Yangiyo‘l', 'Chirchiq'],
  Samarqand: ['Samarqand tumani', 'Temiryo‘l', 'Siyob', 'Bulung‘ur', 'Urgut', 'Kattaqo‘rg‘on'],
  Buxoro: ['Buxoro shahri', 'Kogon', 'G‘ijduvon', 'Vobkent', 'Romitan'],
  Andijon: ['Andijon shahri', 'Asaka', 'Xonobod', 'Shahrixon', 'Marhamat'],
  'Farg‘ona': ['Farg‘ona shahri', 'Qo‘qon shahri', 'Marg‘ilon', 'Quva', 'Rishton'],
  Namangan: ['Namangan shahri', 'Chust', 'Pop', 'Uchqo‘rg‘on', 'To‘raqo‘rg‘on'],
  Xorazm: ['Urganch shahri', 'Xiva', 'Gurlan', 'Xonqa', 'Yangibozor'],
  Qashqadaryo: ['Qarshi shahri', 'Shahrisabz', 'Kitob', 'G‘uzor', 'Koson'],
  Surxondaryo: ['Termiz shahri', 'Denov', 'Sherobod', 'Sho‘rchi', 'Jarqo‘rg‘on'],
  Navoiy: ['Navoiy shahri', 'Zarafshon', 'Karmana', 'Qiziltepa', 'Nurota'],
  Jizzax: ['Jizzax shahri', 'Zomin', 'G‘allaorol', 'Do‘stlik', 'Paxtakor'],
  Sirdaryo: ['Guliston shahri', 'Yangiyer', 'Sirdaryo tumani', 'Boyovut', 'Sayxunobod'],
  'Qoraqalpog‘iston': ['Nukus shahri', 'Xo‘jayli', 'Chimboy', 'To‘rtko‘l', 'Beruniy'],
}

const USER_ROLES = ['Sotuvchi', 'Menejer', 'Kassir', 'Omborchi', 'Administrator', 'Direktor']

// Foydalanuvchilar umumiy sonini rollarga taqsimlaydi (JAMI aynan mos keladi)
function splitUsers(total) {
  if (!total) return USER_ROLES.map((role) => ({ role, count: 0 }))
  const weights = [0.48, 0.26, 0.14, 0.08, 0.03, 0.01]
  const rows = weights.map((w, i) => ({ role: USER_ROLES[i], count: Math.max(i >= 4 ? 1 : 2, Math.round(total * w)) }))
  const diff = total - rows.reduce((s, r) => s + r.count, 0)
  rows[0].count += diff
  return rows
}

// branchCount ta filial "sintez" qiladi (SAG uchun qo'lda yozilgan ro'yxat ustuvor)
function synthBranches(name, viloyat, count) {
  const tumanlar = TUMANLAR[viloyat] ?? ['Markaz']
  return Array.from({ length: count }, (_, i) => ({
    id: `b${i + 1}`,
    name: i === 0 ? 'Markaziy filial' : `${viloyat} filiali ${i}`,
    viloyat,
    tuman: tumanlar[i % tumanlar.length],
    manzil: `${['Mustaqillik', 'Navoiy', 'Amir Temur', 'Bunyodkor', 'Islom Karimov'][i % 5]} ${10 + i * 7}`,
    xodim: 12 - (i % 6),
    ombor: 1 + (i % 3),
  }))
}

const SAG_BRANCHES = [
  { id: 'b1', name: 'Registon filiali', viloyat: 'Samarqand', tuman: 'Temiryo‘l', manzil: 'Registon ko‘chasi 12', xodim: 18, ombor: 2 },
  { id: 'b2', name: 'Siyob filiali', viloyat: 'Samarqand', tuman: 'Siyob', manzil: 'Siyob bozori 4', xodim: 14, ombor: 1 },
  { id: 'b3', name: 'Chilonzor filiali', viloyat: 'Toshkent shahri', tuman: 'Chilonzor', manzil: 'Chilonzor 45', xodim: 22, ombor: 3 },
  { id: 'b4', name: 'Yunusobod filiali', viloyat: 'Toshkent shahri', tuman: 'Yunusobod', manzil: 'Amir Temur 108', xodim: 16, ombor: 2 },
  { id: 'b5', name: 'Sergeli ombori', viloyat: 'Toshkent shahri', tuman: 'Sergeli', manzil: 'Sergeli 7', xodim: 9, ombor: 2 },
  { id: 'b6', name: 'Buxoro filiali', viloyat: 'Buxoro', tuman: 'Buxoro shahri', manzil: 'Mustaqillik 22', xodim: 11, ombor: 1 },
  { id: 'b7', name: 'Namangan filiali', viloyat: 'Namangan', tuman: 'Namangan shahri', manzil: 'Navoiy 31', xodim: 10, ombor: 1 },
  { id: 'b8', name: 'Andijon filiali', viloyat: 'Andijon', tuman: 'Andijon shahri', manzil: 'Bobur 17', xodim: 9, ombor: 1 },
  { id: 'b9', name: 'Farg‘ona filiali', viloyat: 'Farg‘ona', tuman: 'Farg‘ona shahri', manzil: 'Al-Farg‘oniy 5', xodim: 8, ombor: 1 },
  { id: 'b10', name: 'Qo‘qon filiali', viloyat: 'Farg‘ona', tuman: 'Qo‘qon shahri', manzil: 'Turkiston 63', xodim: 7, ombor: 1 },
  { id: 'b11', name: 'Urganch filiali', viloyat: 'Xorazm', tuman: 'Urganch shahri', manzil: 'Al-Xorazmiy 9', xodim: 8, ombor: 1 },
  { id: 'b12', name: 'Qarshi filiali', viloyat: 'Qashqadaryo', tuman: 'Qarshi shahri', manzil: 'Nasaf 14', xodim: 7, ombor: 1 },
  { id: 'b13', name: 'Zavod ombori', viloyat: 'Samarqand', tuman: 'Bulung‘ur', manzil: 'Sanoat zonasi 3', xodim: 9, ombor: 4 },
]

// Xom ro'yxat — keyin to'ldiriladi (branches / users / stats)
const RAW_ORGS = [
  { id: 'sag', name: 'SAG Gilamlari', titul: 'SAG', inn: '301234567', director: 'Salmonov S.', phone: '+998 90 123-45-67', viloyat: 'Samarqand', tuman: 'Samarqand tumani', manzil: 'Registon ko‘chasi 12', registeredAt: '14.02.2024 10:24', status: 'active', branchCount: 21, stats: { filiallar: 21, foydalanuvchilar: 148, mijozlar: 3240, savdo: 4812640000 }, branches: SAG_BRANCHES, users: [
    { role: 'Sotuvchi', count: 71 },
    { role: 'Menejer', count: 38 },
    { role: 'Kassir', count: 21 },
    { role: 'Omborchi', count: 12 },
    { role: 'Administrator', count: 4 },
    { role: 'Direktor', count: 2 },
  ] },
  { id: 'buxoro-savdo', name: 'Buxoro Gilam Savdo', titul: 'BGS', inn: '302456789', director: 'Rasulov B.', phone: '+998 91 234-56-78', viloyat: 'Buxoro', tuman: 'Buxoro shahri', manzil: 'Bahouddin Naqshband 8', registeredAt: '05.06.2024 09:10', status: 'active', branchCount: 6, stats: { filiallar: 6, foydalanuvchilar: 42, mijozlar: 910, savdo: 1148200000 } },
  { id: 'namangan-karpet', name: 'Namangan Karpet', titul: 'NK', inn: '303112233', director: 'Yo‘ldoshev N.', phone: '+998 93 345-67-89', viloyat: 'Namangan', tuman: 'Namangan shahri', manzil: 'Uychi ko‘chasi 21', registeredAt: '19.09.2024 14:35', status: 'active', branchCount: 4, stats: { filiallar: 4, foydalanuvchilar: 28, mijozlar: 540, savdo: 631400000 } },
  { id: 'andijon-markaz', name: 'Andijon Gilam Markazi', titul: 'AGM', inn: '304556677', director: 'Karimov A.', phone: '+998 94 456-78-90', viloyat: 'Andijon', tuman: 'Andijon shahri', manzil: 'Bobur shoh 44', registeredAt: '02.11.2024 11:02', status: 'active', branchCount: 3, stats: { filiallar: 3, foydalanuvchilar: 21, mijozlar: 430, savdo: 498700000 } },
  { id: 'fargona-toqimachilik', name: 'Farg‘ona To‘qimachilik', titul: 'FTU', inn: '305889900', director: 'Toshev F.', phone: '+998 95 567-89-01', viloyat: 'Farg‘ona', tuman: 'Farg‘ona shahri', manzil: 'Mustaqillik 76', registeredAt: '17.12.2024 16:20', status: 'active', branchCount: 3, stats: { filiallar: 3, foydalanuvchilar: 19, mijozlar: 380, savdo: 452100000 } },
  { id: 'xorazm-gilam', name: 'Xorazm Gilam', titul: 'XG', inn: '306223344', director: 'Matniyozov X.', phone: '+998 97 678-90-12', viloyat: 'Xorazm', tuman: 'Urganch shahri', manzil: 'Al-Xorazmiy 3', registeredAt: '21.01.2025 10:45', status: 'active', branchCount: 2, stats: { filiallar: 2, foydalanuvchilar: 14, mijozlar: 260, savdo: 296800000 } },
  { id: 'qashqadaryo-savdo', name: 'Qashqadaryo Savdo', titul: 'QS', inn: '307445566', director: 'Ergashev Q.', phone: '+998 99 789-01-23', viloyat: 'Qashqadaryo', tuman: 'Qarshi shahri', manzil: 'Nasaf 51', registeredAt: '11.02.2025 12:15', status: 'active', branchCount: 2, stats: { filiallar: 2, foydalanuvchilar: 13, mijozlar: 240, savdo: 271500000 } },
  { id: 'navoiy-gilam-uyi', name: 'Navoiy Gilam Uyi', titul: 'NGU', inn: '308667788', director: 'Sobirov N.', phone: '+998 88 890-12-34', viloyat: 'Navoiy', tuman: 'Navoiy shahri', manzil: 'Navoiy 19', registeredAt: '03.03.2025 09:50', status: 'active', branchCount: 2, stats: { filiallar: 2, foydalanuvchilar: 12, mijozlar: 210, savdo: 238900000 } },
  { id: 'surxon-karpet', name: 'Surxon Karpet', titul: 'SK', inn: '309998877', director: 'Xolmatov S.', phone: '+998 90 901-23-45', viloyat: 'Surxondaryo', tuman: 'Termiz shahri', manzil: 'Al-Hakim at-Termiziy 6', registeredAt: '28.03.2025 15:05', status: 'active', branchCount: 1, stats: { filiallar: 1, foydalanuvchilar: 7, mijozlar: 120, savdo: 132400000 } },
  { id: 'jizzax-gilam', name: 'Jizzax Gilam', titul: 'JG', inn: '310334455', director: 'Nazarov J.', phone: '+998 91 012-34-56', viloyat: 'Jizzax', tuman: 'Jizzax shahri', manzil: 'Sharof Rashidov 12', registeredAt: '09.04.2025 10:30', status: 'active', branchCount: 1, stats: { filiallar: 1, foydalanuvchilar: 6, mijozlar: 95, savdo: 104600000 } },
  { id: 'sirdaryo-savdo', name: 'Sirdaryo Savdo', titul: 'SS', inn: '311776655', director: 'Abdullayev S.', phone: '+998 93 123-45-67', viloyat: 'Sirdaryo', tuman: 'Guliston shahri', manzil: 'Istiqlol 4', registeredAt: '22.04.2025 13:40', status: 'active', branchCount: 1, stats: { filiallar: 1, foydalanuvchilar: 5, mijozlar: 80, savdo: 88300000 } },
  { id: 'qoraqalpogiston-gilam', name: 'Qoraqalpog‘iston Gilam', titul: 'QQG', inn: '312001122', director: 'Seytov Q.', phone: '+998 94 234-56-78', viloyat: 'Qoraqalpog‘iston', tuman: 'Nukus shahri', manzil: 'Ernazar Alako‘z 30', registeredAt: '06.05.2025 11:25', status: 'suspended', branchCount: 1, stats: { filiallar: 1, foydalanuvchilar: 4, mijozlar: 60, savdo: 61900000 }, suspend: { at: '18.08.2026 09:12', reason: 'Shartnoma muddati tugadi, to‘lov kelmadi', by: 'Anvarov Sardorbek' } },
]

export const initialOrgs = RAW_ORGS.map((o) => ({
  suspend: null,
  activation: null,
  ...o,
  branches: o.branches ?? synthBranches(o.name, o.viloyat, o.branchCount),
  users: o.users ?? splitUsers(o.stats.foydalanuvchilar),
}))
