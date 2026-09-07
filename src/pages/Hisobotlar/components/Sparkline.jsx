// Kichik, sof bezakli trend chizig'i — statistik kartalar uchun (kutubxonasiz inline SVG).
const SHAPES = [
  [4, 10, 7, 14, 10, 9, 15, 12, 19, 16, 24],
  [3, 6, 5, 10, 8, 13, 11, 17, 15, 20, 24],
  [8, 5, 10, 8, 13, 11, 16, 14, 20, 18, 24],
]

export default function Sparkline({ seed = 0, positive = true, className }) {
  const points = SHAPES[seed % SHAPES.length]
  const w = 100
  const h = 24
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <polyline
        points={coords}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? 'stroke-[#2a78d6] dark:stroke-[#3987e5]' : 'stroke-[#e34948] dark:stroke-[#e66767]'}
      />
    </svg>
  )
}
