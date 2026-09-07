import { cn } from '@/lib/utils'

const BLUE = 'stroke-[#2a78d6] dark:stroke-[#3987e5]'
const BLUE_FILL = 'fill-[#2a78d6] dark:fill-[#3987e5]'
const BLUE_LIGHT_FILL = 'fill-[#9ec5f4] dark:fill-[#5598e7]'

// variant: 'bars' | 'step' | 'line' | 'dots' — statistik kartalar uchun bezakli, kichik trend ko'rsatkichi.
export default function MiniChart({ variant, className }) {
  const w = 100
  const h = 32

  if (variant === 'bars') {
    const values = [4, 6, 8, 10, 13, 16, 18, 20, 22, 24]
    const max = Math.max(...values)
    const bw = w / values.length
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
        {values.map((v, i) => {
          const barH = (v / max) * h
          const last = i === values.length - 1
          return (
            <rect
              key={i}
              x={i * bw + 1}
              y={h - barH}
              width={bw - 2}
              height={barH}
              rx="1.5"
              className={last ? BLUE_FILL : BLUE_LIGHT_FILL}
            />
          )
        })}
      </svg>
    )
  }

  if (variant === 'step') {
    const values = [4, 4, 8, 8, 8, 14, 14, 18, 18, 24, 24]
    const max = Math.max(...values)
    const n = values.length
    const points = values.map((v, i) => `${(i / (n - 1)) * w},${h - (v / max) * h}`).join(' ')
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
        <polyline points={points} fill="none" strokeWidth="2" strokeLinejoin="round" className={cn(BLUE)} />
      </svg>
    )
  }

  if (variant === 'dots') {
    const values = [10, 9, 11, 10, 12, 11, 13, 12, 15, 14, 24]
    const max = Math.max(...values)
    const n = values.length
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
        {values.map((v, i) => {
          const last = i === n - 1
          return (
            <circle
              key={i}
              cx={(i / (n - 1)) * w}
              cy={h - (v / max) * h}
              r={last ? 3.5 : 2}
              className={last ? BLUE_FILL : BLUE_LIGHT_FILL}
            />
          )
        })}
      </svg>
    )
  }

  // 'line' (silliq o'sish egri chizig'i)
  const values = [10, 12, 11, 14, 13, 16, 18, 17, 20, 22, 24]
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const n = values.length
  const points = values.map((v, i) => `${(i / (n - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <polyline points={points} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={BLUE} />
      <circle cx={w} cy={h - ((values[n - 1] - min) / range) * h} r="3.5" className={BLUE_FILL} />
    </svg>
  )
}
