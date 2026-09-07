import { useMemo, useState } from 'react'
import { BarChart3, ChevronDown, ChevronRight, Filter as FilterIcon, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PLATFORM_REPORTS } from '@/features/hisobotlar/platformReportsData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download01Icon } from '@/components/ui/icons'
import Toast from '@/components/Toast'
import Sparkline from './components/Sparkline'

const TH = 'px-3 h-11 text-[12px] font-semibold uppercase leading-[16px] text-white/90 text-left'
const searchableKeys = ['mijoz', 'tashkilot', 'filial', 'buyurtma', 'tolov', 'hujjat', 'xodim', 'tovar', 'ombor']

function cellValue(row, col) {
  const v = row[col.key]
  if (v == null || v === '') return col.num != null ? '—' : ''
  if (col.num != null) return formatNumber(v, col.num)
  return v
}

function StatCard({ meta, value }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">{meta.title}</p>
        <ChevronRight className="h-4 w-4 text-[#A3A3A3]" />
      </div>
      <p className="mt-1.5 text-[20px] font-bold text-[#0A0A0A] dark:text-white">
        {formatNumber(value, meta.digits)}{meta.suffix}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Sparkline seed={meta.title.length} positive={meta.trend.positive} className="h-6 w-16" />
        <div className="flex flex-col items-end">
          <span className="text-[11px] text-[#737373] dark:text-muted-foreground">{meta.sub}</span>
          <span
            className={cn(
              'text-[11px] font-medium',
              meta.trend.positive ? 'text-[#047A47] dark:text-[#34D399]' : 'text-[#DC2626] dark:text-[#F87171]'
            )}
          >
            {meta.trend.positive ? '+' : ''}
            {meta.trend.unit === '%' ? formatNumber(meta.trend.value, 1) : formatNumber(meta.trend.value, 0)} {meta.trend.unit}
          </span>
        </div>
      </div>
    </div>
  )
}

function FilterField({ field }) {
  const iconCls = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]'
  const boxCls =
    'h-10 w-full rounded-md border border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'

  return (
    <div>
      <Label className="mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground">
        {field.label}
      </Label>
      {field.kind === 'date' || field.kind === 'number' ? (
        <div className="relative">
          <Search className={iconCls} />
          <Input readOnly value={field.default} className={boxCls} />
        </div>
      ) : (
        <div className={cn(boxCls, 'flex items-center justify-between pl-3 text-[#0A0A0A] dark:text-white')}>
          <span className="truncate">{field.default}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
        </div>
      )}
    </div>
  )
}

export default function PlatformReportPage({ slug }) {
  const report = PLATFORM_REPORTS[slug]

  const [filterOpen, setFilterOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | ready
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  usePageHeader(report ? `Hisobotlar › ${report.name}` : 'Hisobotlar')

  const shownRows = useMemo(() => {
    if (!report) return []
    if (!search.trim()) return report.rows
    const q = search.trim().toLowerCase()
    return report.rows.filter((r) => searchableKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
  }, [report, search])

  if (!report) {
    return (
      <div className="flex flex-col gap-4">
        <p className="py-16 text-center text-sm text-[#737373]">Hisobot topilmadi</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Izlash"
              className="h-9 w-[300px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setFilterOpen((v) => !v)}
              className={cn(
                'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
                filterOpen && 'border-[#0052D2] text-[#0052D2]'
              )}
            >
              <FilterIcon className="h-4 w-4" /> Filtrlash
            </Button>
            {filterOpen && (
              <Button
                variant="outline"
                onClick={() => setFilterOpen(false)}
                className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#DC2626] hover:bg-[#FEECEC] dark:border-white/10 dark:bg-card"
              >
                <X className="h-4 w-4" /> Tozalash
              </Button>
            )}
            <Button
              variant="outline"
              disabled={status !== 'ready'}
              onClick={() => setToast('Backend hali ulanmagan')}
              className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
            >
              <Download01Icon className="h-4 w-4" /> Yuklab olish
            </Button>
            <Button
              onClick={() => setStatus('ready')}
              className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <BarChart3 className="h-4 w-4" /> Shakllantirish
            </Button>
          </div>
        </div>

        {filterOpen && (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {report.filterFields.map((field) => <FilterField key={field.key} field={field} />)}
            </div>
          </div>
        )}

        {status === 'idle' ? (
          <div className="rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
            <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
              <p className="font-medium text-[#0A0A0A] dark:text-white">Hisobot hali shakllantirilmagan</p>
              <p className="max-w-md text-sm text-[#737373] dark:text-muted-foreground">
                Davr, tashkilot va kesimni «Filtrlash» orqali tanlang, so‘ng «Shakllantirish» tugmasini bosing.
              </p>
              <p className="text-[12px] text-[#A3A3A3]">Manba: {report.manba}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {report.statMeta.map((meta) => (
                <StatCard key={meta.key} meta={meta} value={report.stats[meta.key]} />
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#1B3E75]">
                    {report.groups && (
                      <tr className="border-b border-white/10">
                        <th rowSpan={2} className={cn(TH, 'w-10 align-bottom')}>#</th>
                        {report.groups.map((g, i) => (
                          <th
                            key={i}
                            colSpan={g.span}
                            className={cn(TH, 'border-l border-white/10 text-center', !g.label && 'border-l-0')}
                          >
                            {g.label}
                          </th>
                        ))}
                      </tr>
                    )}
                    <tr className="h-11 border-b border-white/10">
                      {!report.groups && <th className={cn(TH, 'w-10')}>#</th>}
                      {report.columns.map((c) => (
                        <th key={c.key} className={cn(TH, c.align === 'right' && 'text-right')}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shownRows.length === 0 ? (
                      <tr><td colSpan={report.columns.length + 1} className="py-14 text-center text-sm text-[#737373]">Yozuv topilmadi</td></tr>
                    ) : (
                      shownRows.map((r, i) => (
                        <tr key={i} className="h-12 border-b border-[#E5E5E5] last:border-0 hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5">
                          <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                          {report.columns.map((c, ci) => (
                            <td
                              key={c.key}
                              className={cn(
                                'px-3 text-[13px]',
                                c.align === 'right' ? 'text-right' : 'text-left',
                                ci === 0 ? 'font-medium text-[#0A0A0A] dark:text-white' : 'text-[#525252] dark:text-muted-foreground'
                              )}
                            >
                              {cellValue(r, c)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
                    <tr className="h-12">
                      <td className="px-3" />
                      {report.columns.map((c, ci) => (
                        <td
                          key={c.key}
                          className={cn(
                            'px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white',
                            c.align === 'right' ? 'text-right' : 'text-left'
                          )}
                        >
                          {ci === 0 ? report.total[c.key] : cellValue(report.total, c)}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <Toast message={toast} />
    </>
  )
}
