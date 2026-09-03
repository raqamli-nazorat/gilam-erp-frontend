import { cn } from '@/lib/utils'

const CONFIG = {
  entered: { label: 'Omborga kirdi', className: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]' },
  pending: { label: 'Kutilmoqda', className: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]' },
}

export default function QkStatusBadge({ status, className }) {
  const c = CONFIG[status] ?? CONFIG.pending
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
