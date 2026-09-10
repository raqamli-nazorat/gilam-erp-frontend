import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import CopyButton from '@/components/ui/copy-button'
import StatCards from './StatCards'
import FilialFooter from './FilialFooter'

export const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'
export const TD = 'px-4 text-[13px] text-[#0A0A0A] dark:text-muted-foreground'
export const TD_LINK = 'px-4 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]'
export const TD_NUM = 'px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white'
export const TD_IDX = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

export function CopyBtn({ value }) {
  return <CopyButton value={value} className="ml-1.5" />
}

// head: [{ label, align }]
export default function FilialSubShell({
  branch,
  crumbTail,
  statItems,
  head,
  children,
  belowTable,
  noFooter,
  tableFill = true,
}) {
  usePageHeader([{ label: branch.name, to: `/filiallar/${branch.id}` }, { label: crumbTail }])

  return (
    <div className="flex h-full flex-col gap-4">
      <StatCards items={statItems} />
      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card',
          tableFill ? 'min-h-0 flex-1' : 'shrink-0'
        )}
      >
        <div className={cn('overflow-auto', tableFill && 'min-h-0 flex-1')}>
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {head.map((h) => (
                  <th key={h.label} className={cn(TH, h.align === 'right' ? 'text-right' : 'text-left')}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
      {belowTable && <div className={tableFill ? 'shrink-0' : 'flex min-h-0 flex-1 flex-col'}>{belowTable}</div>}
      {!noFooter && <FilialFooter branch={branch} />}
    </div>
  )
}
