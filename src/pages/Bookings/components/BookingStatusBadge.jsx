import { cn } from '@/lib/utils'

const CONFIG = {
  active: {
    label: 'Faol',
    className: 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]',
  },
  partial: {
    label: 'Qisman sotilgan',
    className: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  },
  closed: {
    label: 'Yopilgan',
    className: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  },
  draft: {
    label: 'Qoralama',
    className: 'bg-[#F5F5F5] text-[#737373]',
  },
}

export default function BookingStatusBadge({ status, className }) {
  const config = CONFIG[status] ?? CONFIG.active
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center justify-center rounded-full px-2.5 text-[11px] font-medium leading-[14px] tracking-[0.3px]',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
