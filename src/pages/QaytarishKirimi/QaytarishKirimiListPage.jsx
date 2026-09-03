import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Filter, Package, Plus, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  qkArea,
  qkValue,
  QK_TAB_COUNTS,
  QK_TOTAL,
} from '@/features/qaytarishKirimi/qkMockData'
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
import QkStatusBadge from './components/QkStatusBadge'
import QkExportMenu from './components/QkExportMenu'
import QkFilterModal, { EMPTY_QK_FILTERS } from './components/QkFilterModal'

const TABS = [
  ['entered', 'Omborga kirdi'],
  ['pending', 'Kutilmoqda'],
]

const QUALITY_LABEL = { entered: 'Omborga kirdi', pending: 'Kutilmoqda' }
const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function QaytarishKirimiListPage() {
  const navigate = useNavigate()
  const list = useSelector((state) => state.qaytarishKirimi.list)

  const [tab, setTab] = useState('entered')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_QK_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const chips = useMemo(() => {
    const out = []
    if (filters.from || filters.to) {
      out.push({ key: 'date', label: `Sana: ${filters.from ? formatDate(filters.from) : '…'} — ${filters.to ? formatDate(filters.to) : '…'}` })
    }
    if (filters.warehouse) out.push({ key: 'warehouse', label: `Ombor: ${filters.warehouse}` })
    if (filters.basis) out.push({ key: 'basis', label: `Asos hujjat: ${filters.basis}` })
    if (filters.quality) out.push({ key: 'quality', label: `Sifat: ${filters.quality}` })
    const st = ['entered', 'pending'].filter((k) => filters[k])
    if (st.length) out.push({ key: 'status', label: `Holat: ${st.map((k) => QUALITY_LABEL[k]).join(', ')}` })
    return out
  }, [filters])

  function removeChip(key) {
    if (key === 'date') setFilters((f) => ({ ...f, from: '', to: '' }))
    if (key === 'warehouse') setFilters((f) => ({ ...f, warehouse: '' }))
    if (key === 'basis') setFilters((f) => ({ ...f, basis: '' }))
    if (key === 'quality') setFilters((f) => ({ ...f, quality: '' }))
    if (key === 'status') setFilters((f) => ({ ...f, entered: false, pending: false }))
  }

  const filtered = useMemo(() => {
    const statusSet = ['entered', 'pending'].filter((k) => filters[k])
    return list.filter((d) => {
      if (d.status !== tab) return false
      if (search) {
        const q = search.toLowerCase()
        const haystack = `${d.basis} ${d.number} ${d.counterparty} ${d.rows.map((r) => r.partiya).join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.from && d.date < filters.from) return false
      if (filters.to && d.date > filters.to) return false
      if (filters.warehouse && d.warehouse !== filters.warehouse) return false
      if (filters.basis && !d.basis.toLowerCase().includes(filters.basis.toLowerCase())) return false
      if (filters.quality && !d.rows.some((r) => r.quality === filters.quality)) return false
      if (statusSet.length && !statusSet.includes(d.status)) return false
      return true
    })
  }, [list, tab, search, filters])

  const isNarrowed = !!search || chips.length > 0
  usePageHeader('Qaytarish kirimi', {
    label: isNarrowed ? String(filtered.length) : String(QK_TOTAL),
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
                {QK_TAB_COUNTS[key]}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Partiya yoki hujjat raqami…"
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
          <QkExportMenu />
          <Button
            onClick={() => navigate('/qaytarish-kirimi/yangi')}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Kirim qilish
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
            onClick={() => setFilters(EMPTY_QK_FILTERS)}
          >
            Tozalash
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <Package className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Qaytarish kirimi yo'q</p>
            <p className="text-sm text-[#737373]">
              Tasdiqlangan qaytarishlar shu yerda omborga kirim qilinadi
            </p>
            <Button
              onClick={() => navigate('/qaytarish-kirimi/yangi')}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Kirim qilish
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
                <TableHead className={TH}>ASOS HUJJAT</TableHead>
                <TableHead className={TH}>KONTRAGENT</TableHead>
                <TableHead className={TH}>PARTIYA</TableHead>
                <TableHead className={cn(TH, 'text-right')}>M²</TableHead>
                <TableHead className={TH}>OMBOR</TableHead>
                <TableHead className={cn(TH, 'text-right')}>QIYMAT, USD</TableHead>
                <TableHead className={TH}>HOLAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d, i) => {
                const partiya = d.rows.map((r) => r.partiya).join(', ')
                return (
                  <TableRow
                    key={d.id}
                    className="h-11 cursor-pointer border-b border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5"
                    onClick={() => navigate(`/qaytarish-kirimi/${d.id}`)}
                  >
                    <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{formatDate(d.date)}</TableCell>
                    <TableCell className="px-3 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">{d.basis || '—'}</TableCell>
                    <TableCell className="max-w-[200px] truncate px-3 text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{d.counterparty || '—'}</TableCell>
                    <TableCell className="max-w-[150px] truncate px-3 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">{partiya || '—'}</TableCell>
                    <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(qkArea(d))}</TableCell>
                    <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{d.warehouse}</TableCell>
                    <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(qkValue(d))}</TableCell>
                    <TableCell className="px-3"><QkStatusBadge status={d.status} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <QkFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
