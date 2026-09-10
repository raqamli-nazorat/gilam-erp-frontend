import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons/index'

const BG = ['#D7D5FD', '#CDE7FE', '#F8C3B3', '#B3F8C5']

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
              'rounded-xl p-5 text-left text-[#0A0A0A] transition-[filter] duration-150',
              it.to && 'cursor-pointer hover:brightness-95'
            )}
          >
            <div className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.4px]">
              {it.title}
              {it.to && (
                <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={3} size={20} className="text-[#0052D2]" />
              )}
            </div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{it.value}</p>
          </Tag>
        )
      })}
    </div>
  )
}
