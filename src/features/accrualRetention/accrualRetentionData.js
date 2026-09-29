import { formatNumber } from '@/lib/format'

export const ACCRUAL_RETENTION_STATUS = {
  draft: 'Qoralama',
  approved: 'Tasdiqlangan',
  cancelled: 'Bekor qilingan',
}

export const ACCRUAL_STATUS_BADGE_CLASSES = {
  draft: 'bg-[#FFF4E5] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  approved: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]',
}

// Hujjat qiymati: "12,00 %" yoki "150 000,00 UZS".
// accrual_retention_info.currency — faqat UUID, shuning uchun nomi `currencyMap` (id -> short_name) dan olinadi.
export function formatAccrualRetentionValue(doc, currencyMap = {}) {
  if (!doc) return '-'
  const ar = doc.accrual_retention_info || {}
  const type = doc.type || ar.type
  const value = doc.value ?? ar.value ?? 0
  const currency = currencyMap[ar.currency] || ar.currency_info?.short_name || 'UZS'

  if (type === 'percent') {
    return `${formatNumber(value, 2)} %`
  }
  return `${formatNumber(value, 2)} ${currency}`
}

