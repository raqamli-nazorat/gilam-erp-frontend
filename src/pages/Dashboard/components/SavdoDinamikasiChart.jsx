import { useRef, useState } from 'react'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SAVDO_DINAMIKASI } from '@/features/dashboard/dashboardData'

const W = 1000
const H = 300
const PAD_L = 56
const PAD_R = 12
const PAD_T = 12
const PAD_B = 28
const Y_MAX = 1600
const Y_TICKS = [0, 400, 800, 1200, 1600]

const { oylar, qiymatlarMln } = SAVDO_DINAMIKASI
const N = oylar.length

function xAt(i) {
  return PAD_L + (i / (N - 1)) * (W - PAD_L - PAD_R)
}
function yAt(v) {
  return PAD_T + (1 - v / Y_MAX) * (H - PAD_T - PAD_B)
}

const linePoints = qiymatlarMln.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')
const areaPoints = `${xAt(0)},${yAt(0)} ${linePoints} ${xAt(N - 1)},${yAt(0)}`

export default function SavdoDinamikasiChart() {
  const [hover, setHover] = useState(N - 1)
  const svgRef = useRef(null)

  function handleMove(e) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const frac = (px - PAD_L) / (W - PAD_L - PAD_R)
    const idx = Math.round(frac * (N - 1))
    setHover(Math.min(N - 1, Math.max(0, idx)))
  }

  const value = qiymatlarMln[hover] * 1_000_000
  const prev = hover > 0 ? qiymatlarMln[hover - 1] * 1_000_000 : null
  const pct = prev ? ((value - prev) / prev) * 100 : null
  const positive = pct == null || pct >= 0

  // Tooltip'ni chekka nuqtalarda qirqilmasligi uchun moslashtirish
  const tipLeftPct = Math.min(78, Math.max(2, (xAt(hover) / W) * 100 - 8))

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card lg:h-[306px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A] dark:text-white">Savdo dinamikasi</p>
        <p className="text-[12px] text-[#737373] dark:text-muted-foreground">Okt 2025 — Sen 2026, mln UZS</p>
      </div>

      <div className="relative flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full touch-none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(N - 1)}
          role="img"
          aria-label="Savdo dinamikasi grafigi"
        >
          <defs>
            <linearGradient id="savdoArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a78d6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2a78d6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={yAt(t)}
                y2={yAt(t)}
                className="stroke-[#E5E5E5] dark:stroke-white/10"
                strokeWidth="1"
              />
              <text x={PAD_L - 10} y={yAt(t) + 4} textAnchor="end" className="fill-[#A3A3A3] text-[11px]">
                {formatNumber(t, 0)}
              </text>
            </g>
          ))}

          {oylar.map((m, i) => (
            <text key={m} x={xAt(i)} y={H - 6} textAnchor="middle" className="fill-[#A3A3A3] text-[11px]">
              {m}
            </text>
          ))}

          <polygon points={areaPoints} fill="url(#savdoArea)" />
          <polyline
            points={linePoints}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
          />

          {/* Krosxeyr */}
          <line
            x1={xAt(hover)}
            x2={xAt(hover)}
            y1={PAD_T}
            y2={H - PAD_B}
            className="stroke-[#0052D2]/30 dark:stroke-[#60A5FA]/30"
            strokeWidth="1"
          />

          {qiymatlarMln.map((v, i) => (
            <circle
              key={`hit-${i}`}
              cx={xAt(i)}
              cy={yAt(v)}
              r={10}
              className="fill-transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
          {/* Ochiq (hollow) belgi — faol nuqtada */}
          <circle
            cx={xAt(hover)}
            cy={yAt(qiymatlarMln[hover])}
            r={6}
            strokeWidth="2.5"
            className="fill-white stroke-[#2a78d6] dark:fill-card dark:stroke-[#3987e5]"
          />
        </svg>

        <div
          className="pointer-events-none absolute top-2 w-[190px] rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 shadow-md dark:border-white/10 dark:bg-card"
          style={{ left: `${tipLeftPct}%` }}
        >
          <p className="text-[12px] font-medium text-[#0A0A0A] dark:text-white">{oylar[hover]} {hover === N - 1 ? '2026' : ''}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(value, 2)} UZS</span>
            {pct != null && (
              <span
                className={cn(
                  'inline-flex h-[18px] items-center rounded-full px-1.5 text-[10px] font-medium',
                  positive
                    ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    : 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
                )}
              >
                {positive ? '+' : ''}{formatNumber(pct, 1)} %
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
