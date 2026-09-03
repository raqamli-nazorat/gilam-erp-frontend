import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Filter, Plus, Search, ShoppingCart, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RETURN_TAB_COUNTS } from '@/features/returns/returnsMockData'
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
import ReturnStatusBadge from './components/ReturnStatusBadge'
import ReturnExportMenu from './components/ReturnExportMenu'
import ReturnFilterModal, { EMPTY_RETURN_FILTERS } from './components/ReturnFilterModal'

const TABS = [
  ['all', 'Barchasi'],
  ['client', 'Klientdan'],
  ['supplier', 'Yetkazuvchiga'],
]

const TYPE_LABEL = { client: 'Klientdan qaytarish', supplier: 'Yetkazuvchiga qaytarish' }
const STATUS_LABEL = { accepted: 'Qabul qilindi', review: 'Tekshiruvda', rejected: 'Rad etildi' }

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function ReturnsListPage() {
  const navigate = useNavigate()
  const returns = useSelector((state) => state.returns.list)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_RETURN_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const chips = useMemo(() => {
    const out = []
    if (filters.from || filters.to) {
      out.push({ key: 'date', label: `Sana: ${filters.from ? formatDate(filters.from) : '…'} — ${filters.to ? formatDate(filters.to) : '…'}` })
    }
    if (filters.counterparty) out.push({ key: 'counterparty', label: `Kontragent: ${filters.counterparty}` })
    if (filters.reason) out.push({ key: 'reason', label: `Sabab: ${filters.reason}` })
    if (filters.partiya) out.push({ key: 'partiya', label: `Partiya: ${filters.partiya}` })
    const st = ['accepted', 'review', 'rejected'].filter((k) => filters[k])
    if (st.length) out.push({ key: 'status', label: `Holat: ${st.map((k) => STATUS_LABEL[k]).join(', ')}` })
    return out
  }, [filters])

  function removeChip(key) {
    if (key === 'date') setFilters((f) => ({ ...f, from: '', to: '' }))
    if (key === 'counterparty') setFilters((f) => ({ ...f, counterparty: '' }))
    if (key === 'reason') setFilters((f) => ({ ...f, reason: '' }))
    if (key === 'partiya') setFilters((f) => ({ ...f, partiya: '' }))
    if (key === 'status') setFilters((f) => ({ ...f, accepted: false, review: false, rejected: false }))
  }

  const filtered = useMemo(() => {
    const statusSet = ['accepted', 'review', 'rejected'].filter((k) => filters[k])
    return returns.filter((r) => {
      if (tab !== 'all' && r.type !== tab) return false
      if (search) {
        const q = search.toLowerCase()
        const haystack = `${r.counterparty} ${r.rows.map((row) => row.partiya).join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.from && r.date < filters.from) return false
      if (filters.to && r.date > filters.to) return false
      if (filters.counterparty && r.counterparty !== filters.counterparty) return false
      if (filters.reason && !r.rows.some((row) => row.reason === filters.reason)) return false
      if (filters.partiya && !r.rows.some((row) => row.partiya.includes(filters.partiya))) return false
      if (statusSet.length && !statusSet.includes(r.status)) return false
      return true
    })
  }, [returns, tab, search, filters])

  const isNarrowed = !!search || chips.length > 0
  const totalCount = RETURN_TAB_COUNTS.client + RETURN_TAB_COUNTS.supplier
  usePageHeader('Tovarlar qaytarishi', {
    label: isNarrowed ? String(filtered.length) : String(tab === 'all' ? totalCount : RETURN_TAB_COUNTS[tab]),
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
                {key === 'all' ? totalCount : RETURN_TAB_COUNTS[key]}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Shtrix kod yoki kontragent…"
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
          <ReturnExportMenu />
          <Button
            onClick={() => navigate('/tovarlar-qaytarishi/yangi')}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi qaytarish
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
                onClick={() => removeChip(chip.key)}
                className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="text-[13px] font-medium text-[#0052D2] hover:underline"
            onClick={() => setFilters(EMPTY_RETURN_FILTERS)}
          >
            Tozalash
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <ShoppingCart className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Tanlangan davrda qaytarish yo'q</p>
            <p className="text-sm text-[#737373]">
              Qaytarish shtrix kodni skanerlashdan boshlanadi — rulon partiyasi shu orqali topiladi
            </p>
            <Button
              onClick={() => navigate('/tovarlar-qaytarishi/yangi')}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Yangi qaytarish
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F5F5F5] dark:bg-white/5">
              <TableRow className="h-10 border-b border-[#E5E5E5] hover:bg-transparent dark:border-white/10">
                <TableHead className={cn(TH, 'w-10')}>#</TableHead>
                <TableHead className={TH}>
                  <span className="inline-flex items-center gap-1">SANA <ChevronDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className={TH}>KONTRAGENT</TableHead>
                <TableHead className={TH}>PARTIYA</TableHead>
                <TableHead className={cn(TH, 'text-right')}>M²</TableHead>
                <TableHead className={cn(TH, 'text-right')}>SUMMA, USD</TableHead>
                <TableHead className={TH}>SABAB</TableHead>
                <TableHead className={TH}>QAYTARISH TURI</TableHead>
                <TableHead className={TH}>HOLAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => {
                const m2 = r.rows.reduce((s, row) => s + row.m2, 0)
                const sum = r.rows.reduce((s, row) => s + row.sum, 0)
                const partiya = r.rows.map((row) => row.partiya).join(', ')
                const reason = r.rows[0]?.reason ?? r.reason
                return (
                  <TableRow
                    key={r.id}
                    className="h-11 cursor-pointer border-b border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5"
                    onClick={() => navigate(`/tovarlar-qaytarishi/${r.id}`)}
                  >
                    <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{formatDate(r.date)}</TableCell>
                    <TableCell className="max-w-[190px] truncate px-3 text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{r.counterparty || '—'}</TableCell>
                    <TableCell className="max-w-[140px] truncate px-3 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">{partiya || '—'}</TableCell>
                    <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(m2)}</TableCell>
                    <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(sum)}</TableCell>
                    <TableCell className="max-w-[170px] truncate px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{reason || '—'}</TableCell>
                    <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{TYPE_LABEL[r.type]}</TableCell>
                    <TableCell className="px-3"><ReturnStatusBadge status={r.status} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <ReturnFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
