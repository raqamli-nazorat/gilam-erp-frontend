// Backend hali ulanmagan — "Balans" moduli uchun mock ma'lumotlar.

export const BALANS_DATE = '13.08.2026'
export const BALANS_WAREHOUSES = ['MAGAZIN', 'OMBOR', 'Bron ombori', 'SAG ZAVOD']
export const COUNTERPARTY_KINDS = ['Klient', 'Xissador', 'Yetkazib beruvchi']

export const BALANS_TABS = [
  { key: 'umumiy', label: 'Umumiy' },
  { key: 'kontragentlar', label: 'Kontragentlar' },
  { key: 'kassalar', label: 'Kassalar' },
  { key: 'ombor', label: 'Ombor' },
  { key: 'xodimlar', label: 'Xodimlar' },
]

const MOVE_COLS = [
  { key: 'modda', label: 'MODDA', align: 'left' },
  { key: 'bosh', label: 'BOSH QOLDIQ, USD', align: 'right', num: 2, negRed: true },
  { key: 'kirim', label: 'KIRIM, USD', align: 'right', num: 2 },
  { key: 'chiqim', label: 'CHIQIM, USD', align: 'right', num: 2 },
  { key: 'oxirgi', label: 'OXIRGI QOLDIQ, USD', align: 'right', num: 2, negRed: true },
  { key: 'izoh', label: 'IZOH', align: 'left' },
]

export const BALANS_CONFIG = {
  umumiy: {
    columns: MOVE_COLS,
    footnote:
      "- manfiy qoldiq: yetkazuvchilarga qarz yoki xodimlar hisobidagi ortiqcha avans. Manfiy tovar qoldig'i bo'lsa, hujjatlar ketma-ketligini tekshiring.",
    footnoteTone: 'red',
    rows: [
      { modda: "Tovar qoldig'i (ombor)", bosh: 412880, kirim: 268400, chiqim: 241120, oxirgi: 440160, izoh: '12 tur sifat' },
      { modda: 'Kassalar', bosh: 86340, kirim: 1942100, chiqim: 1903640, oxirgi: 124800, izoh: '7 ta kassa' },
      { modda: 'Kontragentlar qarzi', bosh: 214500, kirim: 96200, chiqim: 142800, oxirgi: 167900, izoh: 'Nasiya savdo' },
      { modda: 'Yetkazuvchilarga qarz', bosh: -98200, kirim: 142000, chiqim: 120400, oxirgi: -76600, izoh: 'Xissadorlar' },
      { modda: 'Xodimlar hisobi', bosh: -12400, kirim: 48600, chiqim: 52100, oxirgi: -15900, izoh: 'Avans va ish haqi' },
      { modda: 'Sof balans', bosh: 602120, kirim: null, chiqim: null, oxirgi: 640360, izoh: '', strong: true },
    ],
  },
  kontragentlar: {
    columns: [
      { key: 'name', label: 'KONTRAGENT', align: 'left' },
      { key: 'kind', label: 'TURI', align: 'left' },
      { key: 'bosh', label: 'BOSH QARZ, USD', align: 'right', num: 2, negRed: true },
      { key: 'savdo', label: 'SAVDO, USD', align: 'right', num: 2 },
      { key: 'tolov', label: "TO'LOV, USD", align: 'right', num: 2 },
      { key: 'qoldiq', label: 'QOLDIQ QARZ, USD', align: 'right', num: 2, negRed: true },
    ],
    rows: [
      { id: 'cp-1', name: '«TITAN GROUP» MCHJ', kind: 'Klient', bosh: 2140, savdo: 14312, tolov: 8044, qoldiq: 8408 },
      { id: 'cp-2', name: 'Xumo Arena', kind: 'Klient', bosh: 0, savdo: 11980, tolov: 5990, qoldiq: 5990 },
      { id: 'cp-3', name: 'Navoi Diller', kind: 'Klient', bosh: 1820, savdo: 11660, tolov: 1400, qoldiq: 12080 },
      { id: 'cp-4', name: 'Omon SAG Xujand', kind: 'Klient', bosh: 0, savdo: 5644.98, tolov: 5644.98, qoldiq: 0 },
      { id: 'cp-5', name: 'Ibn Sino Sayfulla', kind: 'Klient', bosh: 340, savdo: 7905, tolov: 4100, qoldiq: 4145 },
      { id: 'cp-6', name: 'Xissador Botir aka', kind: 'Xissador', bosh: -12400, savdo: null, tolov: 2400, qoldiq: -14800 },
      { id: 'cp-7', name: 'Xissador Sardor', kind: 'Xissador', bosh: -4200, savdo: null, tolov: null, qoldiq: -4200 },
      { id: 'cp-8', name: '12 TREST ZOHID', kind: 'Klient', bosh: 620, savdo: 8140, tolov: 5220, qoldiq: 3540 },
    ],
    total: { name: 'JAMI', kind: '', bosh: -11680, savdo: 59641.98, tolov: 32798.98, qoldiq: 15163 },
  },
  kassalar: {
    footnote: "Har bir kassa ikki qatorda ko'rsatiladi: dollar va UZS alohida yuritiladi, jami faqat dollarda jamlanadi.",
    footnoteTone: 'muted',
    columns: [
      { key: 'kassa', label: 'KASSA', align: 'left' },
      { key: 'valyuta', label: 'VALYUTA', align: 'left' },
      { key: 'bosh', label: 'BOSH QOLDIQ', align: 'right', perRowNum: true },
      { key: 'kirim', label: 'KIRIM', align: 'right', perRowNum: true },
      { key: 'chiqim', label: 'CHIQIM', align: 'right', perRowNum: true },
      { key: 'oxirgi', label: 'OXIRGI QOLDIQ', align: 'right', perRowNum: true },
    ],
    rows: [
      { kassa: 'KICHIK KASSA', valyuta: 'USD', bosh: 9150, kirim: 27413.2, chiqim: 14088.2, oxirgi: 22475 },
      { kassa: 'KICHIK KASSA', valyuta: 'UZS', bosh: 111904500, kirim: 335263436, chiqim: 172298686, oxirgi: 274869250 },
      { kassa: 'SAG ZAVOD', valyuta: 'USD', bosh: 3210, kirim: 5000, chiqim: null, oxirgi: 8210 },
      { kassa: 'HUMO', valyuta: 'USD', bosh: 1480, kirim: 5100, chiqim: null, oxirgi: 6580 },
      { kassa: 'UZCARD', valyuta: 'USD', bosh: 2040, kirim: 11210, chiqim: null, oxirgi: 13250 },
      { kassa: 'PERECHISLENIYA', valyuta: 'USD', bosh: 6400, kirim: null, chiqim: 2400, oxirgi: 4000 },
      { kassa: 'SULAYMON KASSA', valyuta: 'USD', bosh: 820, kirim: null, chiqim: null, oxirgi: 820 },
    ],
    total: { kassa: 'JAMI, USD', valyuta: '', bosh: 23100, kirim: 48723.2, chiqim: 16488.2, oxirgi: 55335 },
  },
  ombor: {
    columns: [
      { key: 'ombor', label: 'OMBOR', align: 'left' },
      { key: 'partiyalar', label: 'PARTIYALAR', align: 'right', num: 0 },
      { key: 'qoldiq', label: 'QOLDIQ, m²', align: 'right', num: 2 },
      { key: 'tannarx', label: 'TANNARX, USD', align: 'right', num: 2 },
      { key: 'sotuv', label: 'SOTUV NARXI, USD', align: 'right', num: 2 },
      { key: 'foyda', label: 'FOYDA POTENSIALI, USD', align: 'right', num: 2 },
    ],
    rows: [
      { ombor: 'MAGAZIN', partiyalar: 412, qoldiq: 8240, tannarx: 96480, sotuv: 128640, foyda: 32160 },
      { ombor: 'OMBOR', partiyalar: 186, qoldiq: 12960, tannarx: 142560, sotuv: 186120, foyda: 43560 },
      { ombor: 'Bron ombori', partiyalar: 64, qoldiq: 2480, tannarx: 28520, sotuv: 36240, foyda: 7720 },
    ],
    total: { ombor: 'JAMI', partiyalar: 662, qoldiq: 23680, tannarx: 267560, sotuv: 351000, foyda: 83440 },
  },
  xodimlar: {
    columns: [
      { key: 'name', label: 'XODIM', align: 'left' },
      { key: 'role', label: 'LAVOZIM', align: 'left' },
      { key: 'hisoblangan', label: 'HISOBLANGAN, USD', align: 'right', num: 2 },
      { key: 'berilgan', label: 'BERILGAN, USD', align: 'right', num: 2 },
      { key: 'avans', label: 'AVANS, USD', align: 'right', num: 2 },
      { key: 'qoldiq', label: 'QOLDIQ, USD', align: 'right', num: 2, negRed: true },
    ],
    rows: [
      { name: "Mirzajonov G'afforjon", role: 'Menejer', hisoblangan: 1728.4, berilgan: 1328.4, avans: 400, qoldiq: 0 },
      { name: 'Mirzadjonov Ziyodulla', role: 'Menejer', hisoblangan: 2247.6, berilgan: 1597.6, avans: 600, qoldiq: 50 },
      { name: 'Alimov Shuxrat', role: 'Menejer', hisoblangan: 1283, berilgan: 983, avans: 300, qoldiq: 0 },
      { name: 'Usmonov Jamshid', role: 'Menejer', hisoblangan: 978, berilgan: 778, avans: 200, qoldiq: 0 },
      { name: 'Kamol Usta', role: 'Menejer', hisoblangan: 744.8, berilgan: null, avans: 200, qoldiq: 544.8 },
      { name: 'Qodirov Anvar', role: 'Kassir', hisoblangan: 420, berilgan: 270, avans: 150, qoldiq: 0 },
      { name: 'Toshev Diyor', role: 'Menejer', hisoblangan: 312, berilgan: null, avans: 400, qoldiq: -88 },
    ],
    total: { name: 'JAMI', role: '', hisoblangan: 7713.8, berilgan: 4957, avans: 2250, qoldiq: 506.8 },
  },
}

// ── Kontragent balansi (detal, Figma freym 61) ────────────────────────────
export const COUNTERPARTY_DETAIL = {
  'cp-1': {
    name: '«TITAN GROUP» MCHJ',
    kind: 'Klient',
    phone: '+998 90 123 45 67',
    openDebt: 2140,
    savdo: 14312,
    tolov: 8044,
    qoldiq: 8408,
    footnote:
      "Musbat saldo — kontragent qarzi. To'lov muddati o'tgan hujjatlar «Tovarlar savdosi» bo'limida «Qarz» belgisi bilan ko'rinadi.",
    rows: [
      { sana: '01.01.2026', hujjat: '—', amal: 'Davr boshiga saldo', izoh: '', debet: null, kredit: null, saldo: 2140 },
      { sana: '14.02.2026', hujjat: 'SV-0871', amal: 'Tovar sotuvi', izoh: '6 ta qator · 320,00 m²', debet: 4320, kredit: null, saldo: 6460 },
      { sana: '20.02.2026', hujjat: 'KAS-0412', amal: "Naqd to'lov", izoh: 'KICHIK KASSA', debet: null, kredit: 4000, saldo: 2460 },
      { sana: '11.04.2026', hujjat: 'SV-1035', amal: 'Tovar sotuvi', izoh: '4 ta qator · 238,00 m²', debet: 4760, kredit: null, saldo: 7220 },
      { sana: '18.04.2026', hujjat: 'KAS-0644', amal: "Karta orqali to'lov", izoh: 'UZCARD', debet: null, kredit: 3940, saldo: 3280 },
      { sana: '22.06.2026', hujjat: 'QT-0209', amal: 'Tovar qaytarishi', izoh: '26,00 m² · ortiqcha buyurtma', debet: null, kredit: 104, saldo: 3176 },
      { sana: '13.08.2026', hujjat: 'SV-1042', amal: 'Tovar sotuvi', izoh: '5 ta qator · 264,00 m²', debet: 5232, kredit: null, saldo: 8408 },
    ],
    total: { debet: 14312, kredit: 8044, saldo: 8408 },
  },
}
