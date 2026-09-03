// Backend hali ulanmagan — Bron tovarlar moduli uchun mock ma'lumotlar.

export const BOOKING_WAREHOUSES = ['Bron ombori', 'MAGAZIN', 'OMBOR']
export const BOOKING_AGENTS = [
  "Mirzajonov G'afforjon",
  'Alimov Shuxrat',
  'Kamol Usta',
  'Mirzadjonov Ziyodullo',
  'Usmonov Jamshid',
]
export const TRANSPORTS = ['Tanlanmagan', 'Anvar Matiz', 'Damas', 'Labo', 'Isuzu']
export const CASHBOXES = ['KICHIK KASSA', 'ASOSIY KASSA', 'BANK']
export const CANCEL_REASONS = [
  'Mijoz rad etdi',
  'Muddati o‘tdi',
  'Xato kiritilgan',
  'Boshqa sabab',
]
export const QUALITIES = ['ORZU', 'DELTA LOOP', 'AKTUEL', 'TUMARIS', 'ACTUAL']

export const BOOKING_EXCHANGE_RATE = 11400

// Statik tab hisoblagichlari (Figma: 46 / 18 / 214)
export const BOOKING_TAB_COUNTS = { active: 46, partial: 18, closed: 214 }

export const BOOKING_STORE = { name: 'SAG GILAMLARI', address: 'Andijon sh., Boburshoh 17g' }

// Bron uchun mavjud rulonlar (Rulon qo'shish oynasi)
export const AVAILABLE_ROLLS = [
  { id: 'ar-1', quality: 'ORZU', design: '6866 YK24 400X1200', partiya: '12615696', warehouse: 'Bron ombori', stockM2: 48, widthM: 4, priceUsd: 13 },
  { id: 'ar-2', quality: 'ORZU', design: '0 400X1200', partiya: '10093468', warehouse: 'Bron ombori', stockM2: 48, widthM: 4, priceUsd: 13 },
  { id: 'ar-3', quality: 'DELTA LOOP', design: 'D-9900 400', partiya: '2168111', warehouse: 'Bron ombori', stockM2: 104, widthM: 4, priceUsd: 4 },
  { id: 'ar-4', quality: 'DELTA LOOP', design: 'D-9900 400', partiya: '2168124', warehouse: 'Bron ombori', stockM2: 104, widthM: 4, priceUsd: 4 },
  { id: 'ar-5', quality: 'AKTUEL', design: '400X3000', partiya: '0080332', warehouse: 'MAGAZIN', stockM2: 120, widthM: 4, priceUsd: 30 },
]

let seq = 1
export function makeRoom(name, widthM, lengthM) {
  return { id: `room-${seq++}`, name, widthM, lengthM }
}
export function roomArea(room) {
  return Number((Number(room.widthM || 0) * Number(room.lengthM || 0)).toFixed(2))
}

export function makeRoll(src, lengthM, { selected = false, cut = false } = {}) {
  return {
    id: `roll-${seq++}`,
    quality: src.quality,
    design: src.design,
    partiya: src.partiya,
    warehouse: src.warehouse,
    stockM2: src.stockM2,
    widthM: src.widthM,
    lengthM,
    priceUsd: src.priceUsd,
    selected,
    cut,
  }
}
export function rollBookedM2(roll) {
  return Number((Number(roll.widthM || 0) * Number(roll.lengthM || 0)).toFixed(2))
}
export function rollSum(roll) {
  return Number((rollBookedM2(roll) * Number(roll.priceUsd || 0)).toFixed(2))
}

// BR-0046 — Figma'dagi to'liq namuna (26–33-freymlar)
function br0046Rooms() {
  return [
    makeRoom('Oshxona', 4, 5),
    makeRoom('Mehmonxona', 4, 6.5),
    makeRoom('Yotoqxona', 3, 4),
    makeRoom('Koridor', 1.2, 6),
  ]
}
function br0046Rolls() {
  return [
    makeRoll(AVAILABLE_ROLLS[0], 12, { selected: true }),
    makeRoll(AVAILABLE_ROLLS[1], 7, { selected: true }),
    makeRoll(AVAILABLE_ROLLS[2], 14),
    makeRoll(AVAILABLE_ROLLS[3], 26),
  ]
}

function makeBooking(o) {
  return {
    id: o.number,
    number: o.number,
    date: o.date,
    time: o.time ?? '09:20',
    customer: o.customer,
    agent: o.agent,
    warehouse: o.warehouse ?? 'Bron ombori',
    transport: o.transport ?? 'Tanlanmagan',
    supplierDoc: o.supplierDoc ?? '',
    status: o.status,
    rooms: o.rooms ?? [],
    rolls: o.rolls ?? [],
    bronM2: o.bronM2 ?? 0,
    soldM2: o.soldM2 ?? 0,
    returnedM2: o.returnedM2 ?? 0,
  }
}

// Figma freymlaridagi bronlar (35–37): Faol tab HAMMASINI ko'rsatadi,
// "Qisman sotilgan" va "Yopilgan" tablari status bo'yicha filtrlaydi.
export const initialBookings = [
  makeBooking({ number: 'BR-0046', date: '2023-05-19', time: '14:32', customer: '+998 93 659 12 28', agent: "Mirzajonov G'afforjon", transport: 'Anvar Matiz', status: 'active', rooms: br0046Rooms(), rolls: br0046Rolls(), bronM2: 236, soldM2: 0, returnedM2: 0 }),
  makeBooking({ number: 'BR-0045', date: '2023-05-18', customer: 'Xumo Arena', agent: 'Kamol Usta', status: 'partial', bronM2: 412, soldM2: 120, returnedM2: 0 }),
  makeBooking({ number: 'BR-0044', date: '2023-05-17', customer: '«TITAN GROUP» MCHJ', agent: 'Mirzadjonov Ziyodullo', status: 'active', bronM2: 180, soldM2: 0, returnedM2: 0 }),
  makeBooking({ number: 'BR-0043', date: '2023-05-16', customer: '972013333', agent: 'Usmonov Jamshid', status: 'closed', bronM2: 96, soldM2: 96, returnedM2: 0 }),
  makeBooking({ number: 'BR-0042', date: '2023-05-15', customer: 'Ibn Sino Sayfulla', agent: 'Alimov Shuxrat', status: 'partial', bronM2: 54, soldM2: 30, returnedM2: 12 }),
  makeBooking({ number: 'BR-0041', date: '2023-05-12', customer: 'Navoi Diller', agent: 'Mirzadjonov Ziyodullo', status: 'active', bronM2: 320, soldM2: 0, returnedM2: 0 }),
  makeBooking({ number: 'BR-0040', date: '2023-05-11', customer: '958000000', agent: 'Alimov Shuxrat', status: 'closed', bronM2: 78, soldM2: 78, returnedM2: 0 }),
  makeBooking({ number: 'BR-0039', date: '2023-05-10', customer: 'Omon SAG Xujand', agent: 'Kamol Usta', status: 'closed', bronM2: 144, soldM2: 0, returnedM2: 144 }),
  makeBooking({ number: 'BR-0037', date: '2023-05-08', customer: '12 TREST ZOHID', agent: "Mirzajonov G'afforjon", status: 'partial', bronM2: 620, soldM2: 410, returnedM2: 0 }),
  makeBooking({ number: 'BR-0036', date: '2023-05-06', customer: 'Xissador Botir aka', agent: 'Mirzadjonov Ziyodullo', status: 'closed', bronM2: 210, soldM2: 210, returnedM2: 0 }),
  makeBooking({ number: 'BR-0034', date: '2023-05-04', customer: '935004411', agent: 'Usmonov Jamshid', status: 'partial', bronM2: 88, soldM2: 44, returnedM2: 0 }),
  makeBooking({ number: 'BR-0033', date: '2023-05-02', customer: 'Navoi Diller', agent: 'Alimov Shuxrat', status: 'closed', bronM2: 64, soldM2: 64, returnedM2: 0 }),
]

let bookingSeq = 47
export function nextBookingNumber() {
  return `BR-${String(bookingSeq++).padStart(4, '0')}`
}
