import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const BG = ['#61FFB8', '#679CFF', '#FFBF68', '#F268FF']

// items: [{ title, value, to? }]
export default function StatCards({ items }) {
  const navigate = useNavigate()
  return (
    <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => {
        const Tag = it.to ? 'button' : 'div'
        return (
          <Tag
            key={it.title}
            {...(it.to ? { type: 'button', onClick: () => navigate(it.to) } : {})}
            style={{ backgroundColor: BG[i % 4] }}
            className={cn(
              'rounded-xl p-5 text-left text-[#0A0A0A]',
              it.to && 'cursor-pointer transition-transform hover:-translate-y-0.5'
            )}
          >
            <div className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.4px]">
              {it.title} <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{it.value}</p>
          </Tag>
        )
      })}
    </div>
  )
}
