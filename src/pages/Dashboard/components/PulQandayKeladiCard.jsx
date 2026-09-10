import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { PUL_QANDAY_KELADI } from '@/features/dashboard/dashboardData'

// Figma: kategoriyali pastel palitra (SavdoKesimiDonut bilan bir xil)
const STEPS = [
  { bar: 'bg-[#9BE3A8]', swatch: 'bg-[#9BE3A8]' },
  { bar: 'bg-[#C7C1F4]', swatch: 'bg-[#C7C1F4]' },
  { bar: 'bg-[#F2AC9B]', swatch: 'bg-[#F2AC9B]' },
  { bar: 'bg-[#DCEEFB]', swatch: 'bg-[#DCEEFB]' },
]

export default function PulQandayKeladiCard({ jamiUzs }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 dark:bg-card lg:h-[306px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A] dark:text-white">To‘lov usullari bo‘yicha tushum</p>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">12 oy</p>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">Jami tushum</p>
        <p className="text-[18px] font-bold tabular-nums text-[#0A0A0A] dark:text-white">{formatNumber(jamiUzs, 2)} UZS</p>
      </div>

      <div className="flex h-3 w-full gap-1">
        {PUL_QANDAY_KELADI.map((p, i) => (
          <div
            key={p.name}
            className={cn('rounded-full', STEPS[i % STEPS.length].bar)}
            style={{ width: `${p.pct}%` }}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {PUL_QANDAY_KELADI.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-[#525252] dark:text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-[3px]', STEPS[i % STEPS.length].swatch)} />
              {p.name}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-semibold tabular-nums text-[#0A0A0A] dark:text-white">{formatNumber(p.summa, 2)} UZS</span>
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
