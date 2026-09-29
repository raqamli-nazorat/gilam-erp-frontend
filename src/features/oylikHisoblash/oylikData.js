// Oylik hisoblash uchun doimiylar (ma'lumotlar faqat backend API orqali keladi)

export const OYLIK_MONTHS = [
  { value: 1, label: 'Yanvar' },
  { value: 2, label: 'Fevral' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Aprel' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Iyun' },
  { value: 7, label: 'Iyul' },
  { value: 8, label: 'Avgust' },
  { value: 9, label: 'Sentyabr' },
  { value: 10, label: 'Oktyabr' },
  { value: 11, label: 'Noyabr' },
  { value: 12, label: 'Dekabr' },
]

export const MONTH_NAMES = {
  1: 'Yanvar',
  2: 'Fevral',
  3: 'Mart',
  4: 'Aprel',
  5: 'May',
  6: 'Iyun',
  7: 'Iyul',
  8: 'Avgust',
  9: 'Sentyabr',
  10: 'Oktyabr',
  11: 'Noyabr',
  12: 'Dekabr',
}

export const OYLIK_STATUS = {
  draft: 'Qoralama',
  approved: 'Tasdiqlangan',
  cancelled: 'Bekor qilingan',
}

export const STATUS_BADGE_CLASSES = {
  draft: 'bg-[#FFF4E5] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  approved: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]',
}
