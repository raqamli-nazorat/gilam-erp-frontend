// Backend hali ulanmagan — "Ma'lumotnomalar" (spravochniklar) katalogi va konfiguratsiyalari.

export const MALUMOTNOMA_CATALOG = [
  {
    section: "Tashkilot ma'lumotlari",
    icon: 'org',
    items: [
      { slug: 'rekvizitlar', name: 'Rekvizitlar' },
      { slug: 'omborlar', name: 'Omborlar' },
      { slug: 'kassalar', name: 'Kassalar' },
      { slug: 'vklad-tarixi', name: 'Vklad tarixi' },
      { slug: 'xarajat-turlari', name: 'Xarajat turlari' },
      { slug: 'excel-malumotlari', name: "Excel ma'lumotlari" },
    ],
  },
  {
    section: "Xodimlar ma'lumotlari",
    icon: 'people',
    items: [
      { slug: 'xodimlar', name: 'Xodimlar' },
      { slug: 'foydalanuvchilar', name: 'Foydalanuvchilar' },
      { slug: 'lavozimlar', name: 'Lavozimlar' },
      { slug: 'ish-tartibi', name: 'Ish tartibi' },
      { slug: 'qosh-ushlan', name: "Qo'sh/Ushlan" },
    ],
  },
  {
    section: "Tovar ma'lumotlari",
    icon: 'box',
    items: [
      { slug: 'tovarlar', name: 'Tovarlar' },
      { slug: 'sifatlar', name: 'Sifatlar' },
      { slug: 'dizayn', name: 'Dizayn' },
      { slug: 'ranglar', name: 'Ranglar' },
      { slug: 'razmer', name: 'Razmer' },
      { slug: 'olchov-birligi', name: "O'lchov birligi" },
      { slug: 'partiya', name: 'Partiya' },
      { slug: 'material', name: 'Material' },
      { slug: 'sifat-narxi', name: 'Sifat narxi' },
    ],
  },
  {
    section: "Kontragent ma'lumotlari",
    icon: 'briefcase',
    items: [
      { slug: 'kontragentlar', name: 'Kontragentlar' },
      { slug: 'banklar', name: 'Banklar' },
      { slug: 'transportlar', name: 'Transportlar' },
    ],
  },
  {
    section: "Qo'shimcha ma'lumotlar",
    icon: 'box',
    items: [
      { slug: 'davlatlar', name: 'Davlatlar' },
      { slug: 'viloyatlar', name: 'Viloyatlar' },
      { slug: 'tumanlar', name: 'Tumanlar' },
      { slug: 'shartnomalar', name: 'Shartnomalar' },
    ],
  },
]

export const MALUMOTNOMA_INDEX = Object.fromEntries(
  MALUMOTNOMA_CATALOG.flatMap((s) => s.items.map((it) => [it.slug, { ...it, section: s.section }]))
)

const EMPLOYEE_NAMES = [
  "Mirzajonov G'afforjon",
  'Mirzadjonov Ziyodulla',
  'Alimov Shuxrat',
  'Usmonov Jamshid',
  'Kamol Usta',
  'Qodirov Anvar',
  'Toshev Diyor',
  'Ergashev Bekzod',
]

// ── Konfiguratsiyalar ──────────────────────────────────────────────────────
// kind: 'card'  — Rekvizitlar kabi yagona yozuv (ko'rish / tahrirlash)
// kind: 'list'  — jadval (Faol / Arxiv / Barchasi tablari + Yangi/Tahrirlash/O'chirish)

export const MALUMOTNOMA_CONFIG = {
  rekvizitlar: {
    kind: 'card',
    cards: [
      {
        title: 'TASHKILOT',
        fields: [
          { key: 'name', label: 'Nomi', value: 'SAG Gilamlari' },
          { key: 'fullName', label: "To'liq nomi", value: '«SAG GILAMLARI» MCHJ' },
          { key: 'inn', label: 'INN / STIR', value: '305 412 876' },
          { key: 'director', label: 'Direktor', value: "Mirzajonov G'afforjon" },
          { key: 'accountant', label: 'Bosh buxgalter', value: 'Rahimova Nilufar' },
        ],
      },
      {
        title: 'MANZIL VA ALOQA',
        fields: [
          { key: 'legalAddr', label: 'Yuridik manzil', value: "Andijon shahri, Boburshoh ko'chasi 17g" },
          { key: 'factoryAddr', label: 'Ishlab chiqarish (zavod)', value: "Samarqand viloyati, Urgut tumani, Zavod ko'chasi 12" },
          { key: 'phone', label: 'Telefon', value: '+998 91 601 43 33' },
          { key: 'email', label: 'Email', value: 'info@sag.uz' },
          { key: 'website', label: 'Veb-sayt', value: 'sag.uz' },
        ],
      },
      {
        title: 'BANK REKVIZITLARI',
        fields: [
          { key: 'bank', label: 'Bank', value: 'Ipoteka Bank, Toshkent sh. filiali' },
          { key: 'mfo', label: 'MFO', value: '00443' },
          { key: 'account', label: 'Hisob raqami', value: '2020 8000 1234 5678 9001' },
          { key: 'currency', label: 'Valyuta', value: 'UZS / USD' },
        ],
      },
      {
        title: 'HUJJAT SOZLAMALARI',
        fields: [
          { key: 'logo', label: 'Logotip', value: 'sag-logo.png' },
          { key: 'stamp', label: 'Muhr va imzo', value: 'muhr.png' },
          { key: 'contractPrefix', label: 'Shartnoma prefiksi', value: 'SH-' },
          { key: 'invoicePrefix', label: 'Hisob-faktura prefiksi', value: 'HF-' },
        ],
      },
    ],
  },

  omborlar: {
    kind: 'list',
    entity: 'ombor',
    searchPlaceholder: "Ombor nomi bo'yicha qidirish",
    columns: [
      { key: 'name', label: 'NOMI', align: 'left', sortable: true },
      { key: 'type', label: 'TURI', align: 'left' },
      { key: 'owner', label: "MAS'UL", align: 'left' },
      { key: 'goods', label: 'TOVARLAR', align: 'right', num: 0 },
    ],
    modalFields: [
      { key: 'name', label: 'Nomi', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'type', label: 'Turi', kind: 'select', required: true, options: ['Savdo nuqtasi', 'Asosiy ombor', 'Bron', 'Ishlab chiqarish'] },
      { key: 'owner', label: "Mas'ul xodim", kind: 'select', options: EMPLOYEE_NAMES, full: true },
    ],
    filterFields: [
      { key: 'type', label: 'Turi', options: ['Savdo nuqtasi', 'Asosiy ombor', 'Bron', 'Ishlab chiqarish'] },
      { key: 'owner', label: "Mas'ul", options: EMPLOYEE_NAMES },
    ],
    deleteNote: "Undagi qoldiq 0 bo'lgani uchun hujjatlar buzilmaydi.",
    rows: [
      { id: 'w1', name: 'MAGAZIN', type: 'Savdo nuqtasi', owner: 'Alimov Shuxrat', goods: 4820, active: true },
      { id: 'w2', name: 'OMBOR', type: 'Asosiy ombor', owner: 'Qodirov Anvar', goods: 12640, active: true },
      { id: 'w3', name: 'Bron ombori', type: 'Bron', owner: 'Usmonov Jamshid', goods: 1240, active: true },
      { id: 'w4', name: 'SAG ZAVOD', type: 'Ishlab chiqarish', owner: "Mirzajonov G'afforjon", goods: 8310, active: true },
      { id: 'w5', name: 'Samarqand filiali', type: 'Savdo nuqtasi', owner: 'Toshev Diyor', goods: 2180, active: true },
      { id: 'w6', name: 'Andijon filiali', type: 'Savdo nuqtasi', owner: 'Ergashev Bekzod', goods: 1960, active: true },
      { id: 'w7', name: 'Eski ombor', type: 'Asosiy ombor', owner: '', goods: 0, active: false },
    ],
  },

  kassalar: {
    kind: 'list',
    entity: 'kassa',
    searchPlaceholder: "Kassa nomi bo'yicha qidirish",
    columns: [
      { key: 'name', label: 'NOMI', align: 'left', sortable: true },
      { key: 'type', label: 'TURI', align: 'left' },
      { key: 'owner', label: 'OMBOR / FILIAL', align: 'left' },
      { key: 'currency', label: 'VALYUTA', align: 'left' },
    ],
    modalFields: [
      { key: 'name', label: 'Nomi', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'type', label: 'Turi', kind: 'select', required: true, options: ['Naqd', 'Ekvayring', "Bank o'tkazmasi"] },
      { key: 'owner', label: 'Ombor / filial', kind: 'select', options: ['MAGAZIN', 'SAG ZAVOD', 'Samarqand filiali', 'Andijon filiali'] },
      { key: 'currency', label: 'Valyuta', kind: 'select', required: true, options: ['UZS', 'USD', 'USD / UZS'] },
    ],
    filterFields: [
      { key: 'type', label: 'Turi', options: ['Naqd', 'Ekvayring', "Bank o'tkazmasi"] },
      { key: 'currency', label: 'Valyuta', options: ['UZS', 'USD', 'USD / UZS'] },
    ],
    deleteNote: 'Uning kirim va chiqim hujjatlari tarixda saqlanadi.',
    rows: [
      { id: 'k1', name: 'KICHIK KASSA', type: 'Naqd', owner: 'MAGAZIN', currency: 'USD / UZS', active: true },
      { id: 'k2', name: 'SULAYMON KASSA', type: 'Naqd', owner: 'MAGAZIN', currency: 'USD / UZS', active: true },
      { id: 'k3', name: 'SAG ZAVOD', type: 'Naqd', owner: 'SAG ZAVOD', currency: 'UZS', active: true },
      { id: 'k4', name: 'HUMO', type: 'Ekvayring', owner: 'MAGAZIN', currency: 'UZS', active: true },
      { id: 'k5', name: 'UZCARD', type: 'Ekvayring', owner: 'MAGAZIN', currency: 'UZS', active: true },
      { id: 'k6', name: 'PERECHISLENIYA', type: "Bank o'tkazmasi", owner: '', currency: 'UZS', active: true },
      { id: 'k7', name: 'KICHIK KASSA 2', type: 'Naqd', owner: 'Samarqand filiali', currency: 'UZS', active: false },
    ],
  },

  'vklad-tarixi': {
    kind: 'list',
    entity: 'yozuv',
    searchPlaceholder: "Hissador yoki izoh bo'yicha qidirish",
    sortKey: 'date',
    searchKeys: ['hissador', 'note'],
    columns: [
      { key: 'date', label: 'SANA', align: 'left', sortable: true },
      { key: 'hissador', label: 'HISSADOR', align: 'left' },
      { key: 'type', label: 'TURI', align: 'left' },
      { key: 'amount', label: 'SUMMA, USD', align: 'right', num: 2 },
      { key: 'note', label: 'IZOH', align: 'left' },
    ],
    modalFields: [
      { key: 'date', label: 'Sana', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'hissador', label: 'Hissador', kind: 'select', required: true, options: ['HISSADOR BOTIR AKA', 'HISSADOR SARDOR', 'SAG ZAVOD'] },
      { key: 'type', label: 'Turi', kind: 'select', required: true, options: ['Vklad', 'Qaytarish'] },
      { key: 'amount', label: 'Summa, USD', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'note', label: 'Izoh', kind: 'text', placeholder: 'Kiriting', full: true },
    ],
    filterFields: [
      { key: 'hissador', label: 'Hissador', options: ['HISSADOR BOTIR AKA', 'HISSADOR SARDOR', 'SAG ZAVOD'] },
      { key: 'type', label: 'Turi', options: ['Vklad', 'Qaytarish'] },
      { key: '__year', label: 'Davr', options: ['2026', '2025', '2024'] },
    ],
    deleteNote: 'Yozuv tarixda saqlanadi.',
    rows: [
      { id: 'v1', date: '12.08.2026', hissador: 'HISSADOR BOTIR AKA', type: 'Vklad', amount: 25000, note: 'ACTUAL kolleksiyasi uchun', active: true },
      { id: 'v2', date: '04.07.2026', hissador: 'HISSADOR SARDOR', type: 'Vklad', amount: 18000, note: 'SHAGGY partiyasi', active: true },
      { id: 'v3', date: '21.05.2026', hissador: 'HISSADOR BOTIR AKA', type: 'Qaytarish', amount: 6500, note: 'Foyda ulushi', active: true },
      { id: 'v4', date: '14.03.2026', hissador: 'SAG ZAVOD', type: 'Vklad', amount: 40000, note: 'Zavod xomashyosi', active: true },
      { id: 'v5', date: '02.02.2026', hissador: 'HISSADOR SARDOR', type: 'Vklad', amount: 12000, note: 'TITAN partiyasi', active: true },
      { id: 'v6', date: '18.12.2025', hissador: 'HISSADOR BOTIR AKA', type: 'Qaytarish', amount: 9200, note: 'Yillik hisob-kitob', active: true },
      { id: 'v7', date: '09.09.2025', hissador: 'Eski hissador', type: 'Vklad', amount: 5000, note: 'Shartnoma tugagan', active: false },
    ],
  },

  lavozimlar: {
    kind: 'list',
    entity: 'lavozim',
    searchPlaceholder: 'Lavozim nomi bo\'yicha qidirish',
    columns: [
      { key: 'name', label: 'LAVOZIM', align: 'left', sortable: true },
      { key: 'dept', label: "BO'LIM", align: 'left' },
      { key: 'percent', label: 'ODATIY FOIZ', align: 'left' },
    ],
    modalFields: [
      { key: 'name', label: 'Lavozim', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'dept', label: "Bo'lim", kind: 'select', options: ['Savdo', 'Kassa', 'Ombor', 'Boshqaruv'] },
      { key: 'percent', label: 'Odatiy foiz', kind: 'text', placeholder: '2,00 %', full: true },
    ],
    rows: [
      { id: 'p1', name: 'Menejer', dept: 'Savdo', percent: '2,00 %', active: true },
      { id: 'p2', name: 'Kassir', dept: 'Kassa', percent: '—', active: true },
      { id: 'p3', name: 'Omborchi', dept: 'Ombor', percent: '—', active: true },
      { id: 'p4', name: 'Direktor', dept: 'Boshqaruv', percent: '—', active: true },
    ],
  },

  ranglar: {
    kind: 'list',
    entity: 'rang',
    searchPlaceholder: 'Rang nomi bo\'yicha qidirish',
    columns: [
      { key: 'name', label: 'RANG', align: 'left', sortable: true },
      { key: 'code', label: 'KOD', align: 'left' },
    ],
    modalFields: [
      { key: 'name', label: 'Rang', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'code', label: 'Kod', kind: 'text', placeholder: 'BEJ' },
    ],
    rows: [
      { id: 'c1', name: 'Bej', code: 'BEJ', active: true },
      { id: 'c2', name: 'Kulrang', code: 'GRY', active: true },
      { id: 'c3', name: "Ko'k", code: 'BLU', active: true },
      { id: 'c4', name: 'Qizil', code: 'RED', active: true },
      { id: 'c5', name: 'Yashil', code: 'GRN', active: true },
    ],
  },

  'xarajat-turlari': {
    kind: 'list',
    entity: 'xarajat turi',
    searchPlaceholder: "Xarajat turi bo'yicha qidirish",
    columns: [
      { key: 'name', label: 'NOMI', align: 'left', sortable: true },
      { key: 'group', label: 'GURUH', align: 'left' },
      { key: 'account', label: 'HISOB', align: 'right' },
    ],
    modalFields: [
      { key: 'name', label: 'Nomi', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'group', label: 'Guruh', kind: 'select', required: true, options: ['Ofis va salon', 'Logistika', 'Marketing', 'Xodimlar', 'Moliya', 'Boshqa'] },
      { key: 'account', label: 'Hisob raqami', kind: 'text', placeholder: 'Kiriting', full: true },
    ],
    filterFields: [
      { key: 'group', label: 'Guruh', options: ['Ofis va salon', 'Logistika', 'Marketing', 'Xodimlar', 'Moliya', 'Boshqa'] },
    ],
    deleteNote: 'Ushbu tur bilan yozilgan hujjatlar tarixda saqlanadi.',
    rows: [
      { id: 'e1', name: 'Transport xizmati', group: 'Logistika', account: '4410', active: true },
      { id: 'e2', name: 'Ijara', group: 'Ofis va salon', account: '4420', active: true },
      { id: 'e3', name: "Kommunal to'lovlar", group: 'Ofis va salon', account: '4430', active: true },
      { id: 'e4', name: 'Reklama', group: 'Marketing', account: '4440', active: true },
      { id: 'e5', name: 'Xodimlar ovqati', group: 'Xodimlar', account: '4450', active: true },
      { id: 'e6', name: 'Bank xizmati', group: 'Moliya', account: '4460', active: true },
      { id: 'e7', name: "Ta'mirlash", group: 'Ofis va salon', account: '4470', active: true },
      { id: 'e8', name: 'Boshqa xarajatlar', group: 'Boshqa', account: '4490', active: false },
    ],
  },

  transportlar: {
    kind: 'list',
    entity: 'transport',
    searchPlaceholder: 'Transport nomi bo\'yicha qidirish',
    columns: [
      { key: 'name', label: 'NOMI', align: 'left', sortable: true },
      { key: 'plate', label: 'RAQAM', align: 'left' },
      { key: 'driver', label: 'HAYDOVCHI', align: 'left' },
    ],
    modalFields: [
      { key: 'name', label: 'Nomi', kind: 'text', required: true, placeholder: 'Damas' },
      { key: 'plate', label: 'Raqam', kind: 'text', placeholder: '01 A 123 BC' },
      { key: 'driver', label: 'Haydovchi', kind: 'text', full: true },
    ],
    rows: [
      { id: 't1', name: 'Anvar Matiz', plate: '40 A 555 AA', driver: 'Anvar', active: true },
      { id: 't2', name: 'Damas', plate: '40 B 210 BC', driver: 'Sardor', active: true },
      { id: 't3', name: 'Labo', plate: '40 C 771 DE', driver: 'Jamshid', active: true },
      { id: 't4', name: 'Isuzu', plate: '40 D 909 FG', driver: 'Bekzod', active: true },
    ],
  },

  banklar: {
    kind: 'list',
    entity: 'bank',
    searchPlaceholder: 'Bank nomi bo\'yicha qidirish',
    columns: [
      { key: 'name', label: 'BANK', align: 'left', sortable: true },
      { key: 'mfo', label: 'MFO', align: 'left' },
    ],
    modalFields: [
      { key: 'name', label: 'Bank', kind: 'text', required: true, placeholder: 'Kiriting' },
      { key: 'mfo', label: 'MFO', kind: 'text', placeholder: '00000' },
    ],
    rows: [
      { id: 'b1', name: 'Ipoteka Bank', mfo: '00443', active: true },
      { id: 'b2', name: 'Kapital Bank', mfo: '01088', active: true },
      { id: 'b3', name: 'Hamkorbank', mfo: '00967', active: true },
    ],
  },
}

// Batafsil config bo'lmaganlar uchun umumiy ro'yxat
export function genericListConfig(name) {
  return {
    kind: 'list',
    entity: name.toLowerCase(),
    searchPlaceholder: `${name} bo'yicha qidirish`,
    columns: [{ key: 'name', label: 'NOMI', align: 'left', sortable: true }],
    modalFields: [{ key: 'name', label: 'Nomi', kind: 'text', required: true, placeholder: 'Kiriting' }],
    rows: [
      { id: 'g1', name: `${name} — 1`, active: true },
      { id: 'g2', name: `${name} — 2`, active: true },
      { id: 'g3', name: `${name} — 3`, active: false },
    ],
  }
}
