import { ArrowUpRight } from 'lucide-react'

const BG = ['#61FFB8', '#679CFF', '#FFBF68', '#F268FF']

// items: [{ title, value }]
export default function StatCards({ items }) {
  return (
    <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <div key={it.title} style={{ backgroundColor: BG[i % 4] }} className="rounded-xl p-5 text-left text-[#0A0A0A]">
          <div className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.4px]">
            {it.title} <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
          <p className="mt-3 text-[22px] font-bold leading-tight">{it.value}</p>
        </div>
      ))}
    </div>
  )
}
