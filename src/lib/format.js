// Butun son qismini minglik bo'shliqlari bilan ajratadi: "1234567" -> "1 234 567"
export function groupThousands(intStr) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// 12 230,00 uslubidagi son formatlash (bo'shliq — minglik, vergul — kasr ajratkichi)
export function formatNumber(value, fractionDigits = 2) {
  if (value == null || Number.isNaN(value)) return 0
  const fixed = Number(value).toFixed(fractionDigits)
  const [intPart, fracPart] = fixed.split('.')
  const withSpaces = groupThousands(intPart)
  return fracPart ? `${withSpaces},${fracPart}` : withSpaces
}

// Pul summasi maydonlari uchun — yozish paytida jonli formatlaydi: butun qism minglik
// bo'shliqlari bilan guruhlanadi, kasr qismi ("." dan keyin) ko'pi bilan 2 xonagacha, butun
// qismga esa istalgancha raqam kiritish mumkin. "32232323" -> "32 232 323", "32232323.5" ->
// "32 232 323.5". Faqat raqam va bitta nuqtani qoldiradi, qolganini e'tiborsiz qoldiradi.
export function maskMoney(raw) {
  let s = String(raw ?? '').replace(/[^\d.]/g, '')
  const dot = s.indexOf('.')
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '')
  const [intRaw, fracPart] = s.split('.')
  const intPart = intRaw.replace(/^0+(?=\d)/, '')
  const grouped = groupThousands(intPart)
  return fracPart === undefined ? grouped : `${grouped}.${fracPart.slice(0, 2)}`
}

// maskMoney natijasidan (yoki har qanday bo'shliqli sondan) Number()ga beriladigan qiymatga
// qaytaradi — minglik bo'shliqlarini olib tashlaydi.
export function unmaskMoney(masked) {
  return String(masked ?? '').replace(/\s/g, '')
}

// "14.02.2024" yoki "14.02.2024 10:24" -> 20240214 (raqam) yoki null
export function dmyToNum(value) {
  const m = String(value ?? '').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  return m ? Number(m[3] + m[2] + m[1]) : null
}

// Sana "dan"/"gacha" oralig'iga tushadimi (ikkalasi ham ixtiyoriy, format DD.MM.YYYY)
export function matchesDateRange(value, danStr, gachaStr) {
  const v = dmyToNum(value)
  if (v == null) return true
  const dan = dmyToNum(danStr)
  const gacha = dmyToNum(gachaStr)
  if (dan != null && v < dan) return false
  if (gacha != null && v > gacha) return false
  return true
}

export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return `${d}.${m}.${y}`
}

// Faqat raqamlarni oladi va "+998 90 123-45-67" ko'rinishiga keltiradi.
// Harf va boshqa belgilar e'tiborsiz qoldiriladi; 998 prefiksi avtomatik.
export function formatUzPhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  digits = digits.slice(0, 9)
  if (!digits) return ''
  let out = '+998 ' + digits.slice(0, 2)
  if (digits.length > 2) out += ' ' + digits.slice(2, 5)
  if (digits.length > 5) out += '-' + digits.slice(5, 7)
  if (digits.length > 7) out += '-' + digits.slice(7, 9)
  return out
}

// Pasport seriya+raqamini "AA 123 45 67" ko'rinishiga keltiradi (2 ta harf + 7 ta raqam,
// 3-2-2 guruhlangan). Harflar avtomatik katta harfga, boshqa belgilar e'tiborsiz qoldiriladi
// — foydalanuvchi harf va raqamlarni istalgan tartibda kiritsa ham to'g'ri ajratib oladi.
export function formatUzPassport(input) {
  const raw = String(input ?? '').toUpperCase()
  const letters = raw.replace(/[^A-Z]/g, '').slice(0, 2)
  const digits = raw.replace(/[^0-9]/g, '').slice(0, 7)
  if (!letters && !digits) return ''
  let out = letters
  if (digits) {
    out += (out ? ' ' : '') + digits.slice(0, 3)
    if (digits.length > 3) out += ' ' + digits.slice(3, 5)
    if (digits.length > 5) out += ' ' + digits.slice(5, 7)
  }
  return out
}

// Pasport seriya+raqamini backend kutgan juftlikka ajratadi: { seria: "AA", number: "1234567" }.
export function splitUzPassport(input) {
  const raw = String(input ?? '').toUpperCase()
  return {
    seria: raw.replace(/[^A-Z]/g, '').slice(0, 2),
    number: raw.replace(/[^0-9]/g, '').slice(0, 7),
  }
}

// JSHSHIR (PINFL) — 14 ta raqam, guruhlanmaydi. Faqat raqam qabul qilinadi.
export function formatJshshir(input) {
  return String(input ?? '').replace(/\D/g, '').slice(0, 14)
}

// STIR (INN) — 9 ta raqam, "302 145 678" ko'rinishida 3-3-3 guruhlangan.
export function formatStir(input) {
  const digits = String(input ?? '').replace(/\D/g, '').slice(0, 9)
  if (!digits) return ''
  let out = digits.slice(0, 3)
  if (digits.length > 3) out += ' ' + digits.slice(3, 6)
  if (digits.length > 6) out += ' ' + digits.slice(6, 9)
  return out
}

// To'liq (9 ta raqamli) O'zbekiston raqami kiritilganmi
export function isValidUzPhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  return digits.length === 9
}

// "04.09.2026 14:32" ko'rinishidagi sana-vaqt (audit yozuvlari uchun)
export function formatDateTime(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${p(date.getDate())}.${p(date.getMonth() + 1)}.${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}`
}

// Klaviaturadan yozilganda "DD.MM.YYYY HH:MM" niqobi
export function maskDateTime(raw) {
  const d = String(raw ?? '').replace(/\D/g, '').slice(0, 12) // DDMMYYYYHHMM
  let out = d.slice(0, 2)
  if (d.length > 2) out += '.' + d.slice(2, 4)
  if (d.length > 4) out += '.' + d.slice(4, 8)
  if (d.length > 8) out += ' ' + d.slice(8, 10)
  if (d.length > 10) out += ':' + d.slice(10, 12)
  return out
}

export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
