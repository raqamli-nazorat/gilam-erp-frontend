import { cn } from '@/lib/utils'

const BG = ['#D7D5FD', '#CDE7FE', '#F8C3B3', '#B3F8C5']

// items: [{ title, value }]
export default function StatCards({ items }) {
  return (
    <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <div
          key={it.title}
          style={{ backgroundColor: BG[i % 4] }}
          className={cn('rounded-xl p-5 text-left text-[#0A0A0A]')}
        >
          <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">{it.title}</div>
          <p className="mt-3 text-[22px] font-bold leading-tight">{it.value}</p>
        </div>
      ))}
    </div>
  )
}
