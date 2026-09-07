import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import MiniChart from './MiniChart'

// Figma: width 279 / height 130 / padding 16 / gap 4 / bg var(--bg-surface, #FFFFFF)
// "On click" -> navigate (instant)
export default function DashboardStatCard({ title, value, suffix, digits = 0, chart, sub, delta, deltaSuffix = '', to }) {
  const navigate = useNavigate()
  const positive = delta >= 0

  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      className="flex h-[130px] flex-col gap-1 rounded-xl border border-[#E5E5E5] bg-white p-4 text-left transition-colors hover:border-[#0052D2]/30 hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-card dark:hover:bg-white/5"
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">{title}</p>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
      </div>
      <p className="text-[22px] font-bold text-[#0A0A0A] dark:text-white">
        {formatNumber(value, digits)}{suffix}
      </p>

      <MiniChart variant={chart} className="h-6 w-full" />

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] text-[#737373] dark:text-muted-foreground">{sub}</span>
        <span
          className={cn(
            'inline-flex h-[20px] shrink-0 items-center rounded-full px-2 text-[11px] font-medium',
            positive
              ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
              : 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
          )}
        >
          {positive ? '+' : ''}{formatNumber(delta, deltaSuffix === '%' ? 1 : 0)}{deltaSuffix}
        </span>
      </div>
    </button>
  )
}
