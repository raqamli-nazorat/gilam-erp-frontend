import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, Plus, Search, Trash2, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ADVANCE_TAB_COUNTS, ADVANCE_TOTAL } from '@/features/payroll/payrollMockData'
import { advanceAdded, advanceDeleted } from '@/features/payroll/payrollSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import PayrollExportMenu from './components/PayrollExportMenu'
import NewAdvanceModal from './components/NewAdvanceModal'
import AdvanceFilterModal, { EMPTY_ADVANCE_FILTERS } from './components/AdvanceFilterModal'

const TABS = [
  ['Avans', 'Avanslar'],
  ['Ushlanma', 'Ushlanmalar'],
  ["Qo'shimcha", "Qo'shimchalar"],
]
const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function AdvancesPage() {
  const dispatch = useDispatch()
  const advances = useSelector((s) => s.payroll.advances)
  const exchangeRate = useSelector((s) => s.payroll.exchangeRate)

  const [tab, setTab] = useState('Avans')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ADVANCE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const chips = useMemo(() => {
    const out = []
    if (filters.from || filters.to) out.push({ key: 'date', label: `Sana: ${filters.from ? formatDate(filters.from) : '…'} — ${filters.to ? formatDate(filters.to) : '…'}` })
    if (filters.empName) out.push({ key: 'emp', label: `Xodim: ${filters.empName}` })
    if (filters.type) out.push({ key: 'type', label: `Turi: ${filters.type}` })
    return out
  }, [filters])

  function removeChip(key) {
    if (key === 'date') setFilters((f) => ({ ...f, from: '', to: '' }))
    if (key === 'emp') setFilters((f) => ({ ...f, empName: '' }))
    if (key === 'type') setFilters((f) => ({ ...f, type: '' }))
  }

  const filtered = useMemo(() => {
    return advances.filter((a) => {
      if (a.type !== tab) return false
      if (search && !`${a.empName} ${a.note}`.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.from && a.date < filters.from) return false
      if (filters.to && a.date > filters.to) return false
      if (filters.empName && a.empName !== filters.empName) return false
      if (filters.type && a.type !== filters.type) return false
      return true
    })
  }, [advances, tab, search, filters])

  const isNarrowed = !!search || chips.length > 0
  usePageHeader('Avans va ushlanmalar', {
    label: isNarrowed ? String(filtered.length) : String(ADVANCE_TOTAL),
    variant: 'new',
  })

  const totalUsd = filtered.reduce((s, a) => s + a.amountUsd, 0)
  const totalUzs = filtered.reduce((s, a) => s + a.amountUzs, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex cursor-pointer items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key
                  ? 'font-medium text-[#0A0A0A] dark:text-white'
                  : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px]',
                  tab === key
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}
              >
                {ADVANCE_TAB_COUNTS[key]}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Xodim yoki izoh…"
              className="h-9 w-[300px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <PayrollExportMenu />
          <Button
            onClick={() => setNewOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi avans
          </Button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#0A0A0A] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {chip.label}
              <button type="button" onClick={() => removeChip(chip.key)} className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button type="button" className="text-[13px] font-medium text-[#0052D2] hover:underline" onClick={() => setFilters(EMPTY_ADVANCE_FILTERS)}>
            Tozalash
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F5] dark:bg-white/5">
            <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
              <th className={cn(TH, 'w-10 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>SANA</th>
              <th className={cn(TH, 'text-left')}>XODIM</th>
              <th className={cn(TH, 'text-left')}>TURI</th>
              <th className={cn(TH, 'text-left')}>IZOH</th>
              <th className={cn(TH, 'text-right')}>SUMMA, USD</th>
              <th className={cn(TH, 'text-right')}>SUMMA, UZS</th>
              <th className={cn(TH, 'text-left')}>MUALLIF</th>
              <th className={cn(TH, 'w-10')} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-sm text-[#737373]">Yozuvlar yo'q</td>
              </tr>
            ) : (
              filtered.map((a, i) => (
                <tr key={a.id} className="group h-12 border-b border-[#E5E5E5] last:border-0 hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5">
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{formatDate(a.date)}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{a.empName}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{a.type}</td>
                  <td className="max-w-[220px] truncate px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{a.note || '—'}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(a.amountUsd)}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(a.amountUzs, 0)}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{a.author}</td>
                  <td className="px-3">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(advanceDeleted(a.id))
                        setToast("Yozuv o'chirildi")
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] opacity-0 transition-opacity hover:bg-[#FEECEC] hover:text-[#DC2626] group-hover:opacity-100 dark:hover:bg-[#DC2626]/15"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-11">
                <td className="px-3" />
                <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={4}>JAMI</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(totalUsd)}</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(totalUzs, 0)}</td>
                <td className="px-3" colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <AdvanceFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <NewAdvanceModal
        open={newOpen}
        onOpenChange={setNewOpen}
        defaultType={tab}
        exchangeRate={exchangeRate}
        onSave={(input) => {
          dispatch(advanceAdded(input))
          setToast(`Saqlandi · ${input.empName} · ${formatNumber(input.amountUsd)} USD`)
        }}
      />
      <Toast message={toast} />
    </div>
  )
}
