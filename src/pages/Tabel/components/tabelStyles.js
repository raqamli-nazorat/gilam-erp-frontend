// Kun katakchalari ranglari — legenda bilan mos (Norma · Kam soat · Kelmagan · Dam olish)
export const CELL_STYLE = {
  norma: 'text-[#0A0A0A] dark:text-white',
  kam: 'bg-[#FEF3E2] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  kelmagan: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]',
  dam: 'bg-[#E5E5E5] dark:bg-white/10',
}

export function farqColor(v) {
  return v < 0 ? 'text-[#DC2626] dark:text-[#F87171]' : ''
}
