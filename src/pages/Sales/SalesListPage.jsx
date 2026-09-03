import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Filter, Plus, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SALES, SALES_TAB_COUNTS, SALES_TOTAL } from '@/features/sales/salesMockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import SalesStatusBadge from './components/SalesStatusBadge'
import SalesExportMenu from './components/SalesExportMenu'
import SalesFilterModal, { EMPTY_SALES_FILTERS } from './components/SalesFilterModal'

const TABS = [
  ['unpaid', "To'lanmagan"],
  ['paid', "To'langan"],
  ['all', 'Barchasi'],
]

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

const STATUS_LABEL = { paid: "To'langan", partial: 'Qisman', debt: 'Qarz' }

function paidText(p) {
  if (p === 0) return '0'
  if (p === 100) return '100'
  return formatNumber(p, 1)
}

export default function SalesListPage() {
  const navigate = useNavigate()

  const [tab, setTab] = useState('unpaid')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_SALES_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const chips = useMemo(() => {
    const out = []
    if (filters.from || filters.to) {
      const short = (s) => (s ? s.split('-').reverse().slice(0, 2).join('.') : '…')
      out.push({ key: 'date', label: `Sana: ${short(filters.from)} — ${filters.to ? formatDate(filters.to) : '…'}` })
    }
    if (filters.counterparty) out.push({ key: 'counterparty', label: `Kontragent: ${filters.counterparty}` })
    if (filters.agent) out.push({ key: 'agent', label: `Agent: ${filters.agent}` })
    if (filters.contract) out.push({ key: 'contract', label: `Shartnoma: ${filters.contract}` })
    const st = ['paid', 'partial', 'debt'].filter((k) => filters[k]).map((k) => STATUS_LABEL[k])
    if (st.length) out.push({ key: 'status', label: `Holat: ${st.join(', ')}` })
    if (filters.paidMin || filters.paidMax) {
      out.push({ key: 'paid', label: `To'langan: ${filters.paidMin || 0} — ${filters.paidMax || 100} %` })
    }
    return out
  }, [filters])

  const filtered = useMemo(() => {
    const statusSet = ['paid', 'partial', 'debt'].filter((k) => filters[k])
    return SALES.filter((s) => {
      if (tab === 'unpaid' && s.status === 'paid') return false
      if (tab === 'paid' && s.status !== 'paid') return false
      if (search) {
        const q = search.toLowerCase()
        if (!`${s.counterparty} ${s.agent} ${s.contract} ${s.number}`.toLowerCase().includes(q)) return false
      }
      if (filters.from && s.date < filters.from) return false
      if (filters.to && s.date > filters.to) return false
      if (filters.counterparty && s.counterparty !== filters.counterparty) return false
      if (filters.agent && s.agent !== filters.agent) return false
      if (filters.contract && !s.contract.toLowerCase().includes(filters.contract.toLowerCase())) return false
      if (statusSet.length && !statusSet.includes(s.status)) return false
      if (filters.paidMin && s.paidPct < Number(filters.paidMin)) return false
      if (filters.paidMax && s.paidPct > Number(filters.paidMax)) return false
      return true
    })
  }, [tab, search, filters])

  const isNarrowed = !!search || chips.length > 0
  usePageHeader('Tovarlar savdosi jurnali', {
    label: isNarrowed ? String(filtered.length) : formatNumber(SALES_TOTAL, 0),
    variant: 'new',
  })

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
                {formatNumber(SALES_TAB_COUNTS[key], 0)}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Kontragent, agent yoki shartnoma…"
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
          <SalesExportMenu />
          <Button
            onClick={() => navigate('/tovarlar-savdosi/yangi')}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi sotuv
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
              <button
                type="button"
                onClick={() => setFilters((f) => resetChip(f, chip.key))}
                className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="text-[13px] font-medium text-[#0052D2] hover:underline"
            onClick={() => setFilters(EMPTY_SALES_FILTERS)}
          >
            Tozalash
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <Search className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Sotuv topilmadi</p>
            <p className="text-sm text-[#737373]">Qidiruv yoki filtrni o‘zgartiring</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F5F5F5] dark:bg-white/5">
              <TableRow className="h-10 border-b border-[#E5E5E5] hover:bg-transparent dark:border-white/10">
                <TableHead className={cn(TH, 'w-10')}>#</TableHead>
                <TableHead className={cn(TH, 'text-right')}>№</TableHead>
                <TableHead className={TH}>
                  <span className="inline-flex items-center gap-1">SANA <ChevronDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className={TH}>KONTRAGENT</TableHead>
                <TableHead className={TH}>AGENT</TableHead>
                <TableHead className={cn(TH, 'text-right')}>TO‘LOV, USD</TableHead>
                <TableHead className={cn(TH, 'text-right')}>TO‘LOV, UZS</TableHead>
                <TableHead className={cn(TH, 'text-right')}>TO‘LANDI</TableHead>
                <TableHead className={TH}>HOLAT</TableHead>
                <TableHead className={cn(TH, 'text-right')}>SHARTNOMA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, i) => (
                <TableRow key={s.id} className="h-11 border-b border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5">
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(s.number, 0)}</TableCell>
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{formatDate(s.date)}</TableCell>
                  <TableCell className="max-w-[190px] truncate px-3 text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{s.counterparty}</TableCell>
                  <TableCell className="max-w-[160px] truncate px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{s.agent}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(s.usd)}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(s.uzs, 3)}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{paidText(s.paidPct)} %</TableCell>
                  <TableCell className="px-3"><SalesStatusBadge status={s.status} /></TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">{s.contract}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <SalesFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}

function resetChip(f, key) {
  if (key === 'date') return { ...f, from: '', to: '' }
  if (key === 'counterparty') return { ...f, counterparty: '' }
  if (key === 'agent') return { ...f, agent: '' }
  if (key === 'contract') return { ...f, contract: '' }
  if (key === 'status') return { ...f, paid: false, partial: false, debt: false }
  if (key === 'paid') return { ...f, paidMin: '', paidMax: '' }
  return f
}
