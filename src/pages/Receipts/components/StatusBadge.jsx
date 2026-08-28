import { cn } from '@/lib/utils'

const CONFIG = {
  confirmed: {
    label: 'Tasdiqlangan',
    className: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399] border-0',
  },
  draft: {
    label: 'Qoralama',
    className: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24] border-0',
  },
  new: {
    label: 'Yangi',
    className: 'bg-[#F5F5F5] text-[#737373] border-0',
  },
}

export default function StatusBadge({ status, className }) {
  const config = CONFIG[status] ?? CONFIG.draft
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center justify-center rounded-full px-2 text-[11px] font-medium leading-[14px] tracking-[0.4px] transition-colors',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
