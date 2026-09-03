import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, Plus, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { KASSAS, OPERATION_TAB_COUNTS } from '@/features/kassa/kassaMockData'
import { cashOutMade } from '@/features/kassa/kassaSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Toast from '@/components/Toast'
import KassaExportMenu from './components/KassaExportMenu'
import KassaOpFilterModal, { EMPTY_OP_FILTERS } from './components/KassaOpFilterModal'
import CashOutModal from './components/CashOutModal'

const TABS = [
  ['kirim', 'Kirim'],
  ['chiqim', 'Chiqim'],
  ['all', 'Barchasi'],
]
const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function KassaOperationsPage() {
  const dispatch = useDispatch()
  const operations = useSelector((s) => s.kassa.operations)
  const balance = useSelector((s) => s.kassa.balance)
  const rate = useSelector((s) => s.kassa.exchangeRate)

  const [tab, setTab] = useState('kirim')
  const [search, setSearch] = useState('')
  const [kassa, setKassa] = useState(KASSAS[0])
  const [filters, setFilters] = useState(EMPTY_OP_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader('Kassa operatsiyalari')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const filtered = useMemo(() => {
    return operations.filter((o) => {
      if (tab !== 'all' && o.flow !== tab) return false
      if (search && !`${o.type} ${o.note} ${o.cashier}`.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.from && o.date < filters.from) return false
      if (filters.to && o.date > filters.to) return false
      if (filters.kassa && o.kassa !== filters.kassa) return false
      if (filters.cashier && o.cashier !== filters.cashier) return false
      if (filters.type && !o.type.toLowerCase().includes(filters.type.toLowerCase())) return false
      return true
    })
  }, [operations, tab, search, filters])

  const totalIn = filtered.reduce((s, o) => s + (o.cashIn || 0), 0)
  const totalOut = filtered.reduce((s, o) => s + (o.cashOut || 0), 0)

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
                'relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key ? 'font-medium text-[#0A0A0A] dark:text-white' : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              <span className={cn(
                'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                tab === key ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]' : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
              )}>{OPERATION_TAB_COUNTS[key]}</span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Izoh, asos hujjat yoki kassir…"
              className="h-9 w-[280px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm dark:border-white/10 dark:bg-card dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={kassa} onValueChange={setKassa}>
            <SelectTrigger className="h-9 w-[170px] rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <KassaExportMenu />
          <Button
            onClick={() => setNewOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi amal
          </Button>
        </div>
      </div>

      {(filters.from || filters.to || filters.kassa || filters.cashier || filters.type) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#0A0A0A] dark:border-white/10 dark:bg-white/5 dark:text-white">
            Filtr faol
            <button type="button" onClick={() => setFilters(EMPTY_OP_FILTERS)} className="text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"><X className="h-3 w-3" /></button>
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F5] dark:bg-white/5">
            <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
              <th className={cn(TH, 'w-10 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>SANA</th>
              <th className={cn(TH, 'text-left')}>VAQT</th>
              <th className={cn(TH, 'text-left')}>TURI</th>
              <th className={cn(TH, 'text-left')}>ASOS / IZOH</th>
              <th className={cn(TH, 'text-left')}>KASSA</th>
              <th className={cn(TH, 'text-right')}>KIRIM, USD</th>
              <th className={cn(TH, 'text-right')}>CHIQIM, USD</th>
              <th className={cn(TH, 'text-left')}>KASSIR</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-16 text-center text-sm text-[#737373]">Operatsiya yo'q</td></tr>
            ) : filtered.map((o, i) => (
              <tr key={o.id} className="h-12 border-b border-[#E5E5E5] last:border-0 hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5">
                <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{formatDate(o.date)}</td>
                <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.time}</td>
                <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{o.type}</td>
                <td className="max-w-[260px] truncate px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.note}</td>
                <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.kassa}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{o.cashIn != null ? formatNumber(o.cashIn) : '—'}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{o.cashOut != null ? formatNumber(o.cashOut) : '—'}</td>
                <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.cashier}</td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-11">
                <td className="px-3" />
                <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={5}>JAMI</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{totalIn ? formatNumber(totalIn) : '—'}</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{totalOut ? formatNumber(totalOut) : '—'}</td>
                <td className="px-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <KassaOpFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <CashOutModal
        open={newOpen}
        onOpenChange={setNewOpen}
        balance={balance}
        exchangeRate={rate}
        onConfirm={(p) => {
          dispatch(cashOutMade(p))
          setToast(`Chiqim qilindi · ${formatNumber(p.usd)} USD`)
        }}
      />
      <Toast message={toast} />
    </div>
  )
}
