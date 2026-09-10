import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

// Figma: rangli kartochka (bg-surface emas), radius 12, padding 16.
// Sarlavha — Onest 11px/500, uppercase, 0.4px, #525252.
// Qiymat — Onest 24px/600, -1px, #0A0A0A. O'ng-yuqorida doira ichida ArrowUpRight.
// Har bir tur uchun: kartochka foni + doira/pill uchun to'qroq "accent" rang (Figma qiymatlari).
const TONES = {
  violet: { bg: '#E5E5FF', accent: '#D7D5FD' },
  blue: { bg: '#E9F6FF', accent: '#CDE7FE' },
  peach: { bg: '#FFDDD1', accent: '#F8C3B3' },
  green: { bg: '#D9FFD1', accent: '#B3F8C5' },
}

export default function DashboardStatCard({
  title,
  value,
  suffix = '',
  digits = 0,
  sub,
  delta,
  deltaSuffix = '',
  to,
  tone = 'violet',
}) {
  const navigate = useNavigate()
  const positive = delta >= 0
  const isPct = deltaSuffix.trim() === '%'
  const t = TONES[tone] ?? TONES.violet

  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      style={{ backgroundColor: t.bg }}
      className={cn(
        'flex h-[124px] flex-col justify-between rounded-xl p-4 text-left transition-transform',
        to && 'hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="pt-1 text-[11px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#525252]">
          {title}
        </span>
        <span
          style={{ backgroundColor: t.accent }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#0A0A0A]"
        >
          <ArrowUpRight className="size-[18px]" />
        </span>
      </div>

      <p className="whitespace-nowrap text-[24px] font-semibold leading-[28px] tracking-[-1px] text-[#0A0A0A]">
        {formatNumber(value, digits)}
        {suffix}
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] leading-[16px] text-[#525252]">{sub}</span>
        <span
          style={{ backgroundColor: t.accent }}
          className="inline-flex shrink-0 items-center rounded-full px-2 py-[3px] text-[11px] font-medium leading-none text-[#0A0A0A]"
        >
          {positive ? '+' : ''}
          {formatNumber(delta, isPct ? 1 : 0)}
          {deltaSuffix}
        </span>
      </div>
    </button>
  )
}
