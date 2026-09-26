import { cn } from '@/lib/utils'
import { OYLIK_STATUS, STATUS_BADGE_CLASSES } from '@/features/oylikHisoblash/oylikData'

export default function OylikStatusBadge({ status, className }) {
  const label = OYLIK_STATUS[status] || status || 'Qoralama'
  const badgeClass = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.draft

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium transition-colors',
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  )
}
