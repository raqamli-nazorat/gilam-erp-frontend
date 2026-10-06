import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { ChevronDown, Filter, PackageOpen, Plus, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/ui/copy-button'
import { Download01Icon } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import StatusBadge from '@/pages/Receipts/components/StatusBadge'
import { docStats, qualityKey, REJA_NARX_ROOT as ROOT } from '@/features/rejaNarx/rejaNarxData'
import RejaNarxFilterModal, { EMPTY_FILTERS } from './components/RejaNarxFilterModal'
import { exportJournal } from './utils/rejaNarxExport'

const TABS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'confirmed', label: 'Tasdiqlangan' },
  { key: 'draft', label: 'Qoralama' },
  { key: 'cancelled', label: 'Bekor qilingan' },
]

const EXPORTS = [
  { key: 'xlsx', label: 'Excel (.xlsx)' },
  { key: 'pdf', label: 'PDF hujjat' },
  { key: 'csv', label: 'CSV fayl' },
]

const TH = 'h-10 px-3 text-left text-[12px] font-semibold uppercase tracking-[0.2px] text-[#525252] dark:text-muted-foreground'
const TD = 'h-[58px] px-3 text-[14px]'

// "DD.MM.YYYY HH:mm" (filtr) -> taqqoslanadigan "YYYY-MM-DDTHH:mm"
function filterDate(value, endOfDay) {
  const m = String(value ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/)
  if (!m) return ''
  const time = m[4] ? `${m[4]}:${m[5]}` : endOfDay ? '23:59' : '00:00'
  return `${m[3]}-${m[2]}-${m[1]}T${time}`
}

export default function RejaNarxListPage() {
  const navigate = useNavigate()
  const docs = useSelector((state) => state.rejaNarx.list)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  usePageHeader(['Rejalashtirilgan narx', 'Hujjatlar jurnali'])

  const enriched = useMemo(() => docs.map((d) => ({ ...d, stats: docStats(d) })), [docs])
  const authors = useMemo(() => [...new Set(docs.map((d) => d.author).filter(Boolean))].sort(), [docs])

  const counts = useMemo(() => {
    const c = { all: docs.length, confirmed: 0, draft: 0, cancelled: 0 }
    docs.forEach((d) => {
      c[d.status] += 1
    })
    return c
  }, [docs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const from = filterDate(filters.from, false)
    const to = filterDate(filters.to, true)
    const qKey = qualityKey(filters.quality)
    return enriched.filter((d) => {
      if (tab !== 'all' && d.status !== tab) return false
      if (q && !`${d.number} ${d.author}`.toLowerCase().includes(q)) return false
      if (from && d.createdAt < from) return false
      if (to && d.createdAt > to) return false
      if (filters.status && d.status !== filters.status) return false
      if (filters.author && d.author !== filters.author) return false
      if (
        qKey &&
        !d.rows.some((r) => (filters.qualityId && r.qualityId === filters.qualityId) || qualityKey(r.quality) === qKey)
      )
        return false
      if (filters.minChange !== '' && d.stats.maxChange < Number(filters.minChange)) return false
      if (filters.maxChange !== '' && d.stats.maxChange > Number(filters.maxChange)) return false
      return true
    })
  }, [enriched, tab, search, filters])

  const chips = useMemo(() => {
    const out = []
    if (filters.from || filters.to) out.push({ keys: ['from', 'to'], label: `Sana: ${filters.from || '…'} — ${filters.to || '…'}` })
    if (filters.status) out.push({ keys: ['status'], label: `Holat: ${TABS.find((t) => t.key === filters.status)?.label}` })
    if (filters.quality) out.push({ keys: ['qualityId', 'quality'], label: `Sifat: ${filters.quality}` })
    if (filters.author) out.push({ keys: ['author'], label: `Muallif: ${filters.author}` })
    if (filters.minChange !== '' || filters.maxChange !== '')
      out.push({ keys: ['minChange', 'maxChange'], label: `O‘zgarish: ${filters.minChange || 0} — ${filters.maxChange || '∞'} %` })
    return out
  }, [filters])

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'relative flex cursor-pointer items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === t.key
                  ? 'font-medium text-[#0A0A0A] dark:text-white'
                  : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {t.label}
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px]',
                  tab === t.key
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}
              >
                {counts[t.key]}
              </span>
              {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hujjat, muallif…"
              className="h-9 rounded-md border-[#E5E5E5] bg-white pl-9 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="relative h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Filter className="h-4 w-4" /> Filtr
            {chips.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#DC2626]" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="h-9 gap-2 rounded-md border-[#D4D4D4] bg-[#F5F5F5] px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#EAEAEA] dark:border-white/10 dark:bg-card dark:text-white"
                >
                  <Download01Icon className="h-4 w-4" /> Yuklash <ChevronDown className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl p-1.5">
              {EXPORTS.map((e) => (
                <DropdownMenuItem
                  key={e.key}
                  disabled={filtered.length === 0}
                  onClick={() => exportJournal(filtered, e.key)}
                  className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px]"
                >
                  <Download01Icon className="h-4 w-4" /> {e.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => navigate(`${ROOT}/yangi`)}
            className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Qo‘shish
          </Button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 text-[13px] text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white"
            >
              {c.label}
              <button
                type="button"
                aria-label="Olib tashlash"
                onClick={() => setFilters((f) => ({ ...f, ...Object.fromEntries(c.keys.map((k) => [k, ''])) }))}
                className="text-[#737373] hover:text-[#0A0A0A]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-[13px] font-medium text-[#0052D2] hover:underline">
            Tozalash
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <PackageOpen className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Narx hujjati topilmadi</p>
            <p className="text-sm text-[#737373]">Filtrni o‘zgartiring yoki yangi narx hujjati yarating</p>
            <Button
              onClick={() => navigate(`${ROOT}/yangi`)}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Qo‘shish
            </Button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-[#F5F5F5] dark:bg-[#1f2937]">
                <tr>
                  <th className={cn(TH, 'w-10')}>#</th>
                  <th className={TH}>№</th>
                  <th className={TH}>
                    <span className="inline-flex items-center gap-1">
                      Sana <ChevronDown className="h-3.5 w-3.5 text-[#0052D2]" />
                    </span>
                  </th>
                  <th className={TH}>Kurs, UZS</th>
                  <th className={TH}>Sifatlar</th>
                  <th className={TH}>O‘zgargan</th>
                  <th className={cn(TH, 'text-right')}>Muallif</th>
                  <th className={cn(TH, 'text-right')}>O‘rt. ustama</th>
                  <th className={TH}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`${ROOT}/${d.id}`)}
                    className="cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className={cn(TD, 'text-[13px] text-[#737373]')}>{i + 1}</td>
                    <td className={TD}>
                      <span className="inline-flex items-center gap-2 font-medium text-[#0A0A0A] dark:text-white">
                        <CopyButton value={d.number} /> {d.number}
                      </span>
                    </td>
                    <td className={cn(TD, 'text-[#737373]')}>{dayjs(d.createdAt).format('DD.MM.YYYY HH:mm')}</td>
                    <td className={cn(TD, 'text-[#737373]')}>{formatNumber(d.rate)}</td>
                    <td className={cn(TD, 'font-medium text-[#0A0A0A] dark:text-white')}>{d.stats.qualities} ta</td>
                    <td className={cn(TD, 'text-[#737373]')}>{d.stats.changed} ta</td>
                    <td className={cn(TD, 'text-right font-medium text-[#0A0A0A] dark:text-white')}>{d.author}</td>
                    <td className={cn(TD, 'text-right font-medium text-[#0A0A0A] dark:text-white')}>
                      {formatNumber(d.stats.avgMarkup, 1)} %
                    </td>
                    <td className={TD}>
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RejaNarxFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={setFilters}
        authors={authors}
      />
    </div>
  )
}
