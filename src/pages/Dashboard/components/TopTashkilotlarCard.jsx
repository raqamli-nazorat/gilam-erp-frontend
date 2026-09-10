import { formatNumber } from '@/lib/format'
import { TOP_TASHKILOTLAR } from '@/features/dashboard/dashboardData'

// Figma: 1-o'rin yashil, 2-o'rin binafsha, qolganlari marjon rang
const STEPS = ['#9BE3A8', '#C7C1F4', '#F2AC9B', '#F2AC9B', '#F2AC9B', '#F2AC9B']

export default function TopTashkilotlarCard({ totalCount }) {
  const max = Math.max(...TOP_TASHKILOTLAR.map((t) => t.summa))

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 dark:bg-card lg:h-[306px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A] dark:text-white">Eng ko‘p savdo qilgan tashkilotlar</p>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">{totalCount} tadan {TOP_TASHKILOTLAR.length} tasi</p>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        {TOP_TASHKILOTLAR.map((t, i) => (
          <div key={t.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
              <span className="font-medium text-[#0A0A0A] dark:text-white">{t.name}</span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-semibold tabular-nums text-[#0A0A0A] dark:text-white">{formatNumber(t.summa, 2)} UZS</span>
                <span className="w-12 text-right text-[13px] tabular-nums text-[#737373] dark:text-muted-foreground">
                  {t.pct.toFixed(1).replace('.', ',')} %
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0F0F0] dark:bg-white/10">
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
