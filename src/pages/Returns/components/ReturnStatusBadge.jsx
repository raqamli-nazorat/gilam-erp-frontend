import { cn } from '@/lib/utils'

const CONFIG = {
  accepted: { label: 'Qabul qilindi', className: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]' },
  review: { label: 'Tekshiruvda', className: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]' },
  rejected: { label: 'Rad etildi', className: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]' },
  draft: { label: 'Qoralama', className: 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground' },
}

export default function ReturnStatusBadge({ status, className }) {
  const c = CONFIG[status] ?? CONFIG.review
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
