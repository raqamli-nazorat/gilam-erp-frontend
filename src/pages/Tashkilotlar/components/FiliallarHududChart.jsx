import { formatNumber } from '@/lib/format'
import { FILIALLAR_HUDUD_TAQSIMOTI } from '@/features/tashkilotlar/tashkilotlarData'

export default function FiliallarHududChart({ jamiFiliallar }) {
  const max = Math.max(...FILIALLAR_HUDUD_TAQSIMOTI.map((d) => d.soni))

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
        Filiallar hudud bo‘yicha, jami {formatNumber(jamiFiliallar, 0)} ta
      </p>
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
        <div className="flex items-end justify-between gap-3">
          {FILIALLAR_HUDUD_TAQSIMOTI.map((d, i) => {
            const isLast = i === FILIALLAR_HUDUD_TAQSIMOTI.length - 1
            const h = Math.max(6, (d.soni / max) * 96)
            return (
              <div key={d.hudud} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">{d.soni}</span>
                <div
                  style={{ height: `${h}px` }}
                  className={
                    isLast
                      ? 'w-9 rounded-t-md bg-[#9ec5f4] dark:bg-[#5598e7]'
                      : 'w-9 rounded-t-md bg-[#2a4bd0] dark:bg-[#3987e5]'
                  }
                />
                <span className="text-[12px] text-[#737373] dark:text-muted-foreground">{d.hudud}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
