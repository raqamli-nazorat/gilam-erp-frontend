import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

// Rulon yorlig'i — o'ng paneldagi ko'rinish va "Yorliqlar" oynasidagi kartochka
// bir xil ko'rinishда bo'lishi uchun umumiy komponent.

function Barcode({ code }) {
  const src = String(code || '00000000').padEnd(12, '0')
  // Kod raqamlaridan barqaror, lekin "tasodifiy" ko'rinadigan chiziq kengliklari
  const widths = []
  for (let i = 0; i < 44; i += 1) {
    const ch = src.charCodeAt(i % src.length) + i * 7
    widths.push(1 + (ch % 3))
  }
  const total = widths.reduce((a, b) => a + b, 0)
  let x = 0
  return (
    <svg viewBox={`0 0 ${total} 40`} preserveAspectRatio="none" className="h-10 w-full text-[#0A0A0A] dark:text-white">
      {widths.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} fill="currentColor" /> : null
        x += w
        return rect
      })}
    </svg>
  )
}

function QrMock({ seed = '00000000' }) {
  const n = 25
  const s = String(seed || '00000000')
  const isFinder = (r, c) => {
    const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7
    const ring = (br, bc) =>
      inBox(br, bc) && (r === br || r === br + 6 || c === bc || c === bc + 6 || (r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4))
    return ring(0, 0) || ring(0, n - 7) || ring(n - 7, 0)
  }
  const inFinderArea = (r, c) =>
    (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8)
  const cells = []
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (isFinder(r, c)) {
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" />)
      } else if (!inFinderArea(r, c)) {
        const v = s.charCodeAt((r * n + c) % s.length) + r * 13 + c * 7
        if (v % 2 === 0) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" />)
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-[76px] w-[76px] text-[#0A0A0A] dark:text-white">
      {cells}
    </svg>
  )
}

export default function RollLabel({ row, agentName, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#D4D4D4] p-4 text-center dark:border-white/20',
        className
      )}
    >
      <p className="text-[14px] font-semibold tracking-[0.4px] text-[#0A0A0A] dark:text-white">
        {row.quality} <span className="ml-1">{row.design}</span>
      </p>
      <p className="text-[16px] font-bold text-[#0A0A0A] dark:text-white">Kod: {row.partiya}</p>
      <div className="w-full">
        <Barcode code={row.partiya} />
      </div>
      <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">
        Qoldiq: ({formatNumber(row.widthM * 100, 0)} m) × (m) · {formatNumber(row.m2)} m²
      </p>
      <QrMock seed={row.partiya} />
      <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">Agent: {agentName}</p>
    </div>
  )
}
