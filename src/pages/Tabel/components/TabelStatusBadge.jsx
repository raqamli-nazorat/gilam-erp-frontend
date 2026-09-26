import { cn } from '@/lib/utils'
import { TABEL_STATUS } from '@/features/tabel/tabelData'

// Figma: yumshoq fonli yorliqlar — Qoralama (to'q sariq), Tasdiqlangan (yashil), Bekor qilingan (qizil)
const CLS = {
  draft: 'bg-[#FFF4E5] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  confirmed: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]',
}

export default function TabelStatusBadge({ status }) {
  return (
    <span className={cn('inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium', CLS[status])}>
      {TABEL_STATUS[status]}
    </span>
  )
}
