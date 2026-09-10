import { cn } from '@/lib/utils'
import { SAVDO_KESIMI } from '@/features/dashboard/dashboardData'

// Figma: kategoriyali pastel palitra (yashil / binafsha / marjon / och-ko'k)
const STEPS = [
  { swatch: 'bg-[#9BE3A8]', stroke: 'stroke-[#9BE3A8]' },
  { swatch: 'bg-[#C7C1F4]', stroke: 'stroke-[#C7C1F4]' },
  { swatch: 'bg-[#F2AC9B]', stroke: 'stroke-[#F2AC9B]' },
  { swatch: 'bg-[#DCEEFB]', stroke: 'stroke-[#DCEEFB]' },
]

function formatMlrd(sumUzs) {
  return `${(sumUzs / 1_000_000_000).toFixed(2).replace('.', ',')} mlrd`
}

// Figma: yarim-doira gauge (chapdan tepaga, tepadan o'ngga) — to'liq donut emas.
export default function SavdoKesimiDonut({ jamiUzs }) {
  const segments = SAVDO_KESIMI.reduce((acc, s) => {
    const len = s.pct * 0.5 // 0-100 pathLength'ning yarmi — yarim doira uchun
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0
    acc.push({ ...s, len, offset })
    return acc
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 dark:bg-card lg:h-[306px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A] dark:text-white">Tashkilotlar bo‘yicha savdo ulushi</p>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">12 oy</p>
      </div>

      <svg viewBox="0 0 200 128" className="w-full">
        {/* rotate(180) + pathLength'ning birinchi yarmi -> chapdan tepa orqali o'ngga qarab yoyiladi */}
        {segments.map((s, i) => (
          <circle
            key={s.name}
            cx="100"
            cy="100"
            r="76"
            pathLength={100}
            strokeWidth="26"
            fill="none"
            strokeDasharray={`${s.len} ${100 - s.len}`}
            strokeDashoffset={-s.offset}
            transform="rotate(180 100 100)"
            className={STEPS[i % STEPS.length].stroke}
          />
        ))}
        <text x="100" y="98" textAnchor="middle" className="fill-[#0A0A0A] text-[22px] font-bold dark:fill-white">
          {formatMlrd(jamiUzs)}
        </text>
        <text x="100" y="118" textAnchor="middle" className="fill-[#737373] text-[10px] font-semibold uppercase tracking-[0.4px]">
          Jami, UZS
        </text>
      </svg>

      <div className="flex flex-1 flex-col justify-center gap-2">
        {segments.map((s, i) => (
          <div key={s.name} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-[#525252] dark:text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-[3px]', STEPS[i % STEPS.length].swatch)} />
              {s.name}
            </span>
            <span className="font-medium tabular-nums text-[#0A0A0A] dark:text-white">
              {s.pct.toFixed(1).replace('.', ',')} %
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
