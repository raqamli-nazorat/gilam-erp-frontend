import { cn } from '@/lib/utils'
import {
  ACCRUAL_RETENTION_STATUS,
  ACCRUAL_STATUS_BADGE_CLASSES,
} from '@/features/accrualRetention/accrualRetentionData'

export default function QoshimchaStatusBadge({ status, className }) {
  const label = ACCRUAL_RETENTION_STATUS[status] || status || 'Qoralama'
  const badgeClass =
    ACCRUAL_STATUS_BADGE_CLASSES[status] || ACCRUAL_STATUS_BADGE_CLASSES.draft

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
