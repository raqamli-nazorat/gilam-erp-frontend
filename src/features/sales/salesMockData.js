// Tovarlar savdosi jurnali — mock ma'lumotlar (backend hali ulanmagan).

export const SALES_TOTAL = 4618
export const SALES_TAB_COUNTS = { unpaid: 412, paid: 4206, all: 4618 }

export const SALE_AGENTS = [
  'Mirzadjonov Ziyodulla',
  "Mirzajonov G'afforjon",
  'Alimov Shuxrat',
  'Usmonov Jamshid',
  'Kamol Usta',
  'Mirzajonov Sardor',
]

const S = (number, date, counterparty, agent, usd, uzs, paidPct, status, contract) => ({
  id: `SL-${number}`,
  number,
  date,
  counterparty,
  agent,
  usd,
  uzs,
  paidPct,
  status, // 'paid' | 'partial' | 'debt'
  contract,
})

// Figma freymlaridagi (63–69) yozuvlar
export const SALES = [
  S(4618, '2023-12-29', 'Mirzajonov Sardor', 'Mirzajonov Sardor', 3922, 47966060, 100, 'paid', 'SH-1042'),
  S(4614, '2023-12-29', '972013333', 'Usmonov Jamshid', 5100, 62373000, 100, 'paid', 'SH-1041'),
  S(4605, '2023-12-29', '938240107', 'Mirzadjonov Ziyodulla', 3450, 42193500, 91.7, 'partial', 'SH-1039'),
  S(4602, '2023-12-29', '958000000', 'Mirzadjonov Ziyodulla', 11210, 137098300, 100, 'paid', 'SH-1038'),
  S(4596, '2023-12-29', '«TITAN GROUP» MCHJ', 'Mirzadjonov Ziyodulla', 4760, 54264000, 82.8, 'partial', 'SH-1035'),
  S(4588, '2023-12-28', 'Ibn Sino Sayfulla', 'Alimov Shuxrat', 4890, 59804700, 48.7, 'debt', 'SH-1033'),
  S(4571, '2023-12-27', 'Xumo Arena', 'Kamol Usta', 5990, 68286000, 100, 'paid', 'SH-1030'),
  S(4567, '2023-12-27', 'Omon SAG Xujand', 'Mirzadjonov Ziyodulla', 2822.49, 34519000, 100, 'paid', 'SH-1029'),
  S(4550, '2023-12-26', '909125500', 'Alimov Shuxrat', 6292.9, 76962167, 100, 'paid', 'SH-1026'),
  S(4541, '2023-12-26', 'Navoi Diller', 'Mirzadjonov Ziyodulla', 4920, 56088000, 1.5, 'debt', 'SH-1024'),
  S(4538, '2023-12-25', '12 TREST ZOHID', "Mirzajonov G'afforjon", 8140, 99552200, 100, 'paid', 'SH-1022'),
  S(4528, '2023-12-25', '935004411', 'Usmonov Jamshid', 1960, 23970800, 0, 'debt', 'SH-1020'),
  S(4522, '2023-12-24', 'Ibn Sino Sayfulla', 'Alimov Shuxrat', 3015, 36873450, 100, 'paid', 'SH-1019'),
  S(4517, '2023-12-24', '12 TREST ZOHID', "Mirzajonov G'afforjon", 8140, 99552200, 64.2, 'partial', 'SH-1017'),
  S(4509, '2023-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjonov Ziyodulla', 7480, 91480400, 100, 'paid', 'SH-1015'),
  S(4503, '2023-12-23', 'Xissador Botir aka', 'Alimov Shuxrat', 2380, 29107400, 35.0, 'partial', 'SH-1013'),
  S(4495, '2023-12-22', '935004411', 'Usmonov Jamshid', 1960, 23970800, 100, 'paid', 'SH-1011'),
  S(4491, '2023-12-22', '+998 93 659 12 28', 'Kamol Usta', 1205, 14737150, 0, 'debt', 'SH-1009'),
  S(4480, '2023-12-21', 'Navoi Diller', 'Mirzadjonov Ziyodulla', 6740, 82430200, 12.8, 'debt', 'SH-1006'),
  S(4468, '2023-12-20', 'Xumo Arena', 'Kamol Usta', 3015, 36873450, 78.4, 'partial', 'SH-1002'),
  S(4462, '2023-12-19', 'Omon SAG Xujand', 'Mirzadjonov Ziyodulla', 2180, 26661400, 44.0, 'partial', 'SH-0999'),
  S(4377, '2023-12-12', 'Navoi Diller', 'Alimov Shuxrat', 9310, 113861300, 100, 'paid', 'SH-0971'),
]

export const SALE_COUNTERPARTIES = [...new Set(SALES.map((s) => s.counterparty))].sort()

// ─── Sotuv hujjati (detal) ───────────────────────────────────────────────
export const SALE_EXCHANGE_RATE = 12230
export const SALE_WAREHOUSES = ['MAGAZIN', 'OMBOR']
export const SALE_TRANSPORTS = ['Tanlanmagan', 'Anvar Matiz', 'Damas', 'Labo', 'Isuzu']
export const SALE_CASHBOXES = ['KICHIK KASSA', 'ASOSIY KASSA', 'HUMO', 'PERECHISLENIYA']
export const PAYMENT_TYPES = ['Naqd', 'Karta', "O'tkazma"]
export const SALE_STORE = {
  name: 'SAG GILAMLARI MCHJ',
  address: "Andijon sh., Boburshoh ko'chasi 17g",
  phone: '+998 91 601 43 33',
}

// "Tovar qo'shish" oynasidagi mavjud tovarlar (frame 74)
export const SALE_PRODUCTS = [
  { id: 'sp-1', name: 'AKTUEL 400X3000', partiya: '0080332', warehouse: 'MAGAZIN', stockM2: 120, widthM: 4, priceUsd: 30 },
  { id: 'sp-2', name: 'ORZU 9548 YK23 400X2', partiya: '2168124', warehouse: 'MAGAZIN', stockM2: 102, widthM: 4, priceUsd: 11.2 },
  { id: 'sp-3', name: 'DELTA LOOP D-9900 400', partiya: '2168116', warehouse: 'OMBOR', stockM2: 104, widthM: 4, priceUsd: 3.1 },
  { id: 'sp-4', name: 'TUMARIS 1530 YJ43 300', partiya: '2168108', warehouse: 'MAGAZIN', stockM2: 12, widthM: 3, priceUsd: 32 },
  { id: 'sp-5', name: 'BROOKLYN 400X34', partiya: '2168130', warehouse: 'OMBOR', stockM2: 960, widthM: 4, priceUsd: 9.6 },
  { id: 'sp-6', name: 'VIVALDI 300X400', partiya: '2158911', warehouse: 'MAGAZIN', stockM2: 48, widthM: 3, priceUsd: 9.6 },
]

let sRow = 1
export function makeSaleRow(o) {
  const m2 = o.m2 ?? Number((o.widthM * o.lengthM).toFixed(2))
  const sum = o.sum ?? Number((m2 * o.priceUsd).toFixed(2))
  return {
    id: `srow-${sRow++}`,
    name: o.name,
    partiya: o.partiya,
    basis: o.basis ?? '',
    widthM: o.widthM,
    lengthM: o.lengthM,
    m2,
    priceUsd: o.priceUsd,
    sum,
    discount: o.discount ?? 0,
    profit: o.profit ?? 0,
  }
}

// SV-1042 — Figma freymlaridagi to'liq namuna (73–80)
function svDemoRows() {
  return [
    makeSaleRow({ name: 'ORZU 6866 YK24 400X1200', partiya: '12615696', basis: 'BR-0046', widthM: 4, lengthM: 12, priceUsd: 13, discount: 0, profit: 96 }),
    makeSaleRow({ name: 'ORZU 0 400X1200', partiya: '10093468', basis: 'BR-0046', widthM: 4, lengthM: 7, priceUsd: 13, discount: 20, profit: 51 }),
    makeSaleRow({ name: 'DELTA LOOP D-9900 400', partiya: '2168111', widthM: 4, lengthM: 14, priceUsd: 4, discount: 0, profit: 33.6 }),
    makeSaleRow({ name: 'AKTUEL 400X3000', partiya: '0080332', widthM: 4, lengthM: 30, priceUsd: 30, discount: 150, profit: 540 }),
    makeSaleRow({ name: 'TUMARIS 1530 YJ43 300', partiya: '2168108', widthM: 3, lengthM: 4, priceUsd: 35, discount: 0, profit: 63 }),
  ]
}
function svDemoPayments() {
  return [
    { id: 'pay-1', date: '2023-12-29', cashbox: 'KICHIK KASSA', type: 'Naqd', usd: 1500, uzs: 18345000 },
    { id: 'pay-2', date: '2024-01-05', cashbox: 'HUMO', type: 'Karta', usd: 1200, uzs: 14676000 },
    { id: 'pay-3', date: '2024-01-12', cashbox: 'PERECHISLENIYA', type: "O'tkazma", usd: 1222, uzs: 14945060 },
  ]
}

let saleSeq = 1043
export function nextSaleNumber() {
  return `SV-${saleSeq++}`
}

export const initialSaleDocs = [
  {
    id: 'SV-1042',
    number: 'SV-1042',
    date: '2023-12-29',
    counterparty: '«TITAN GROUP» MCHJ',
    agent: 'Mirzadjonov Ziyodulla',
    warehouse: 'MAGAZIN',
    dueDate: '2024-01-15',
    transport: 'Anvar Matiz',
    contract: 'SH-1042',
    status: 'draft',
    rows: svDemoRows(),
    payments: svDemoPayments(),
  },
]
