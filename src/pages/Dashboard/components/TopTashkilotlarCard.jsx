import { formatNumber } from '@/lib/format'
import { TOP_TASHKILOTLAR } from '@/features/dashboard/dashboardData'

const STEPS = ['#0d366b', '#184f95', '#256abf', '#2a78d6', '#3987e5', '#5598e7']

export default function TopTashkilotlarCard({ totalCount }) {
  const max = Math.max(...TOP_TASHKILOTLAR.map((t) => t.summa))

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card lg:h-[306px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A] dark:text-white">Top tashkilotlar, savdo ulushi</p>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">{totalCount} tadan {TOP_TASHKILOTLAR.length} tasi</p>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        {TOP_TASHKILOTLAR.map((t, i) => (
          <div key={t.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
              <span className="font-medium text-[#0A0A0A] dark:text-white">{t.name}</span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-medium tabular-nums text-[#0A0A0A] dark:text-white">{formatNumber(t.summa, 2)} UZS</span>
                <span className="w-12 text-right text-[13px] tabular-nums text-[#737373] dark:text-muted-foreground">
                  {t.pct.toFixed(1).replace('.', ',')} %
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F5] dark:bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${(t.summa / max) * 100}%`, backgroundColor: STEPS[i % STEPS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
