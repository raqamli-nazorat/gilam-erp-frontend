import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { PUL_QANDAY_KELADI } from '@/features/dashboard/dashboardData'

const STEPS = [
  { bar: 'bg-[#0d366b]', swatch: 'bg-[#0d366b]' },
  { bar: 'bg-[#1c5cab]', swatch: 'bg-[#1c5cab]' },
  { bar: 'bg-[#3987e5]', swatch: 'bg-[#3987e5]' },
  { bar: 'bg-[#86b6ef]', swatch: 'bg-[#86b6ef]' },
]

export default function PulQandayKeladiCard({ jamiUzs }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card lg:h-[306px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A] dark:text-white">Pul qanday keladi</p>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">12 oy</p>
      </div>

      <div>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">Jami tushum</p>
        <p className="text-[20px] font-bold text-[#0A0A0A] dark:text-white">{formatNumber(jamiUzs, 2)} UZS</p>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {PUL_QANDAY_KELADI.map((p, i) => (
          <div
            key={p.name}
            className={cn(STEPS[i % STEPS.length].bar, i > 0 && 'ml-0.5')}
            style={{ width: `${p.pct}%` }}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {PUL_QANDAY_KELADI.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-[#525252] dark:text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', STEPS[i % STEPS.length].swatch)} />
              {p.name}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-medium tabular-nums text-[#0A0A0A] dark:text-white">{formatNumber(p.summa, 2)} UZS</span>
              <span className="w-12 text-right text-[12px] tabular-nums text-[#737373] dark:text-muted-foreground">
                {p.pct.toFixed(1).replace('.', ',')} %
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
