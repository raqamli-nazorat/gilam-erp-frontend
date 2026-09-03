import { cn } from '@/lib/utils'

const CONFIG = {
  berildi: { label: 'Berildi', className: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]' },
  hisoblandi: { label: 'Hisoblandi', className: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]' },
  ishda: { label: 'Ishda', className: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]' },
  kechikdi: { label: 'Kechikdi', className: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]' },
  kelmadi: { label: 'Kelmadi', className: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]' },
}

export default function PayrollStatusBadge({ status, className }) {
  const c = CONFIG[status] ?? CONFIG.hisoblandi
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center justify-center rounded-full px-2.5 text-[11px] font-medium leading-[14px] tracking-[0.3px]',
        c.className,
        className
      )}
    >
      {c.label}
    </span>
  )
}
