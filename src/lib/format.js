// Butun son qismini minglik bo'shliqlari bilan ajratadi: "1234567" -> "1 234 567"
export function groupThousands(intStr) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// 12 230,00 uslubidagi son formatlash (bo'shliq — minglik, vergul — kasr ajratkichi)
export function formatNumber(value, fractionDigits = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  const fixed = Number(value).toFixed(fractionDigits)
  const [intPart, fracPart] = fixed.split('.')
  const withSpaces = groupThousands(intPart)
  return fracPart ? `${withSpaces},${fracPart}` : withSpaces
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
  if (!isoDate) return '—'
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

export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
