import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { BALANS_CONFIG, BALANS_DATE, BALANS_TABS } from '@/features/balans/balansData'
import { Button } from '@/components/ui/button'
import { Download01Icon } from '@/components/ui/icons'
import BalansFilterModal, { EMPTY_BALANS_FILTERS } from './components/BalansFilterModal'

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

function cellText(row, col) {
  const v = row[col.key]
  if (!col.num && col.num !== 0 && !col.perRowNum) return v ?? ''
  if (v == null) return '—'
  if (col.perRowNum) return formatNumber(v, row.valyuta === 'UZS' ? 0 : 2)
  return formatNumber(v, col.num)
}

export default function BalansPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('umumiy')
  const [filters, setFilters] = useState(EMPTY_BALANS_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const config = BALANS_CONFIG[tab]
  const rows = useMemo(() => {
    let out = config.rows
    if (filters.onlyNegative && tab !== 'umumiy') {
      out = out.filter((r) => Object.values(r).some((v) => typeof v === 'number' && v < 0))
    }
    return out
  }, [config, filters, tab])

  usePageHeader('Balans', {
    label: tab === 'umumiy' ? BALANS_DATE : String(rows.length),
    variant: 'new',
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          {BALANS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'relative pb-2.5 pt-1 text-sm transition-colors',
                tab === t.key ? 'font-medium text-[#0A0A0A] dark:text-white' : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {t.label}
              {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Download01Icon className="h-4 w-4" /> Yuklash
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-11 border-b border-[#E5E5E5] dark:border-white/10">
                <th className={cn(TH, 'w-10 text-left')}>#</th>
                {config.columns.map((c) => (
                  <th key={c.key} className={cn(TH, c.align === 'right' ? 'text-right' : 'text-left')}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const clickable = tab === 'kontragentlar' && r.id
                return (
                  <tr
                    key={i}
                    onClick={clickable ? () => navigate(`/balans/kontragent/${r.id}`) : undefined}
                    className={cn(
                      'h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5',
                      clickable && 'cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5',
                      r.strong && 'bg-[#F9FAFB] dark:bg-white/5'
                    )}
                  >
                    <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                    {config.columns.map((c, ci) => {
                      const v = r[c.key]
                      const neg = c.negRed && typeof v === 'number' && v < 0
                      return (
                        <td
                          key={c.key}
                          className={cn(
                            'px-3 text-[13px]',
                            c.align === 'right' ? 'text-right' : 'text-left',
                            ci === 0 ? 'font-medium text-[#0A0A0A] dark:text-white' : 'text-[#525252] dark:text-muted-foreground',
                            (r.strong || neg) && 'font-medium',
                            neg ? 'text-[#DC2626] dark:text-[#F87171]' : r.strong && ci !== 0 && 'text-[#0A0A0A] dark:text-white'
                          )}
                        >
                          {cellText(r, c)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
            {config.total && (
              <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
                <tr className="h-12">
                  <td className="px-3" />
                  {config.columns.map((c) => {
                    const v = config.total[c.key]
                    const neg = c.negRed && typeof v === 'number' && v < 0
                    return (
                      <td key={c.key} className={cn('px-3 text-[13px] font-semibold', c.align === 'right' ? 'text-right' : 'text-left', neg ? 'text-[#DC2626] dark:text-[#F87171]' : 'text-[#0A0A0A] dark:text-white')}>
                        {cellText(config.total, c)}
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {config.footnote && (
        <p className={cn('text-[13px]', config.footnoteTone === 'red' ? 'text-[#DC2626] dark:text-[#F87171]' : 'text-[#737373] dark:text-muted-foreground')}>
          {config.footnote}
        </p>
      )}

      <BalansFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
