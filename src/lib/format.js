// 12 230,00 uslubidagi son formatlash (bo'shliq — minglik, vergul — kasr ajratkichi)
export function formatNumber(value, fractionDigits = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  const fixed = Number(value).toFixed(fractionDigits)
  const [intPart, fracPart] = fixed.split('.')
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return fracPart ? `${withSpaces},${fracPart}` : withSpaces
}

export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return `${d}.${m}.${y}`
}

export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
