import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Filter, PackageOpen, Plus, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
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
import FilterModal, { EMPTY_FILTERS } from './components/FilterModal'
import ExportMenu from './components/ExportMenu'
import StatusBadge from './components/StatusBadge'

export default function ReceiptsListPage() {
  const navigate = useNavigate()
  const receipts = useSelector((state) => state.receipts.list)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const counts = useMemo(
    () => ({
      all: receipts.length,
      confirmed: receipts.filter((r) => r.status === 'confirmed').length,
      draft: receipts.filter((r) => r.status !== 'confirmed').length,
    }),
    [receipts]
  )

  const activeFilterChips = useMemo(() => {
    const chips = []
    if (filters.from || filters.to) {
      chips.push({ key: 'date', label: `Sana: ${filters.from ? formatDate(filters.from) : '…'} — ${filters.to ? formatDate(filters.to) : '…'}` })
    }
    if (filters.warehouse) chips.push({ key: 'warehouse', label: `Ombor: ${filters.warehouse}` })
    if (filters.counterparty) chips.push({ key: 'counterparty', label: `Kontragent: ${filters.counterparty}` })
    if (filters.author) chips.push({ key: 'author', label: `Muallif: ${filters.author}` })
    if (filters.confirmed && !filters.draft) chips.push({ key: 'status', label: 'Holat: Tasdiqlangan' })
    if (filters.draft && !filters.confirmed) chips.push({ key: 'status', label: 'Holat: Qoralama' })
    if (filters.minSum || filters.maxSum) {
      chips.push({ key: 'sum', label: `Summa: ${filters.minSum || 0} — ${filters.maxSum || '∞'} USD` })
    }
    return chips
  }, [filters])

  function removeChip(key) {
    if (key === 'date') setFilters((f) => ({ ...f, from: '', to: '' }))
    if (key === 'warehouse') setFilters((f) => ({ ...f, warehouse: '' }))
    if (key === 'counterparty') setFilters((f) => ({ ...f, counterparty: '' }))
    if (key === 'author') setFilters((f) => ({ ...f, author: '' }))
    if (key === 'status') setFilters((f) => ({ ...f, confirmed: false, draft: false }))
    if (key === 'sum') setFilters((f) => ({ ...f, minSum: '', maxSum: '' }))
  }

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      if (tab === 'confirmed' && r.status !== 'confirmed') return false
      if (tab === 'draft' && r.status === 'confirmed') return false
      if (search) {
        const q = search.toLowerCase()
        const haystack = `${r.number} ${r.counterparty} ${r.warehouse}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.from && r.date < filters.from) return false
      if (filters.to && r.date > filters.to) return false
      if (filters.warehouse && r.warehouse !== filters.warehouse) return false
      if (filters.counterparty && r.counterparty !== filters.counterparty) return false
      if (filters.author && r.author !== filters.author) return false
      if (filters.confirmed && !filters.draft && r.status !== 'confirmed') return false
      if (filters.draft && !filters.confirmed && r.status === 'confirmed') return false
      if (filters.minSum && r.sumUsd < Number(filters.minSum)) return false
      if (filters.maxSum && r.sumUsd > Number(filters.maxSum)) return false
      return true
    })
  }, [receipts, tab, search, filters])

  usePageHeader('Tovarlar kirimi', { label: String(filtered.length), variant: 'new' })

  return (
    <div className="flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        {/* Figma Line-Style Tabs */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={cn(
              'relative flex cursor-pointer items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
              tab === 'all'
                ? 'font-medium text-[#0A0A0A] dark:text-white'
                : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
            )}
          >
            Barchasi
            <span
              className={cn(
                'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px] transition-colors',
                tab === 'all'
                  ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                  : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
              )}
            >
              {counts.all}
            </span>
            {tab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab('confirmed')}
            className={cn(
              'relative flex cursor-pointer items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
              tab === 'confirmed'
                ? 'font-medium text-[#0A0A0A] dark:text-white'
                : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
            )}
          >
            Tasdiqlangan
            <span
              className={cn(
                'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px] transition-colors',
                tab === 'confirmed'
                  ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                  : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
              )}
            >
              {counts.confirmed}
            </span>
            {tab === 'confirmed' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab('draft')}
            className={cn(
              'relative flex cursor-pointer items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
              tab === 'draft'
                ? 'font-medium text-[#0A0A0A] dark:text-white'
                : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
            )}
          >
            Qoralama
            <span
              className={cn(
                'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px] transition-colors',
                tab === 'draft'
                  ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                  : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
              )}
            >
              {counts.draft}
            </span>
            {tab === 'draft' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />
            )}
          </button>
        </div>

        {/* Right Search & Action Controls */}
        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Hujjat, kontragent yoki ombor…"
              className="h-9 w-[280px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <Filter className="h-4 w-4 text-[#0A0A0A] dark:text-foreground" /> Filtr
          </Button>
          <ExportMenu />
          <Button
            onClick={() => navigate('/tovarlar-kirimi/yangi')}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi kirim
          </Button>
        </div>
      </div>

      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-foreground"
            >
              {chip.label}
              <button type="button" onClick={() => removeChip(chip.key)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="text-xs font-medium text-[#0052D2] hover:underline"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Tozalash
          </button>
        </div>
      )}

      {/* Figma Table */}
      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <PackageOpen className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Tanlangan davrda kirim hujjati yo‘q</p>
            <p className="text-sm text-[#737373]">
              Davr yoki omborni o'zgartiring, yoki Exceldan yuklab yangi kirim yarating
            </p>
            <Button
              onClick={() => navigate('/tovarlar-kirimi/yangi')}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Yangi kirim
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F5F5F5] dark:bg-white/5">
              <TableRow className="h-10 border-b border-[#E5E5E5] hover:bg-transparent dark:border-white/10">
                <TableHead className="w-10 px-3 text-[11px] font-semibold text-[#737373] uppercase">#</TableHead>
                <TableHead className="px-3 text-[11px] font-semibold text-[#737373] uppercase">№</TableHead>
                <TableHead className="px-3 text-[11px] font-semibold text-[#737373] uppercase">
                  <span className="inline-flex items-center gap-1">SANA <ChevronDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="px-3 text-[11px] font-semibold text-[#737373] uppercase">OMBOR</TableHead>
                <TableHead className="px-3 text-[11px] font-semibold text-[#737373] uppercase">KONTRAGENT</TableHead>
                <TableHead className="px-3 text-[11px] font-semibold text-[#737373] uppercase">MUALLIF</TableHead>
                <TableHead className="px-3 text-right text-[11px] font-semibold text-[#737373] uppercase">SUMMA, USD</TableHead>
                <TableHead className="px-3 text-right text-[11px] font-semibold text-[#737373] uppercase">SUMMA, UZS</TableHead>
                <TableHead className="px-3 text-[11px] font-semibold text-[#737373] uppercase">HOLAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow
                  key={r.id}
                  className="h-11 cursor-pointer border-b border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5"
                  onClick={() => navigate(`/tovarlar-kirimi/${r.id}`)}
                >
                  <TableCell className="px-3 text-[13px] text-[#737373]">{i + 1}</TableCell>
                  <TableCell className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.number}</TableCell>
                  <TableCell className="px-3 text-[13px] font-normal text-[#737373] dark:text-muted-foreground">{formatDate(r.date)}</TableCell>
                  <TableCell className="px-3 text-[13px] font-normal text-[#737373] dark:text-muted-foreground">{r.warehouse}</TableCell>
                  <TableCell className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.counterparty || '—'}</TableCell>
                  <TableCell className="px-3 text-[13px] font-normal text-[#737373] dark:text-muted-foreground">{r.author || '—'}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(r.sumUsd)}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(r.sumUzs, 0)}</TableCell>
                  <TableCell className="px-3">
                    <StatusBadge status={r.status === 'confirmed' ? 'confirmed' : 'draft'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  )
}
