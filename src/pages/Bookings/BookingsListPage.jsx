import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Filter, Plus, Search, Tag } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { BOOKING_TAB_COUNTS } from '@/features/bookings/bookingsMockData'
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
import BookingStatusBadge from './components/BookingStatusBadge'
import BookingExportMenu from './components/BookingExportMenu'
import BookingFilterModal, { EMPTY_BOOKING_FILTERS } from './components/BookingFilterModal'

const TABS = [
  ['active', 'Faol'],
  ['partial', 'Qisman sotilgan'],
  ['closed', 'Yopilgan'],
]

// Jadval sarlavha yacheykasi — Onest 600, 13/18, #525252
const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function BookingsListPage() {
  const navigate = useNavigate()
  const bookings = useSelector((state) => state.bookings.list)

  const [tab, setTab] = useState('active')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_BOOKING_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const statusFilterOn = filters.active || filters.partial || filters.closed

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilterOn) {
        const allowed = [
          filters.active && 'active',
          filters.partial && 'partial',
          filters.closed && 'closed',
        ].filter(Boolean)
        if (!allowed.includes(b.status)) return false
      } else if (tab !== 'active' && b.status !== tab) {
        // "Faol" tab hamma bronni ko'rsatadi; qolgan tablar status bo'yicha filtrlaydi
        return false
      }
      if (search) {
        const q = search.toLowerCase()
        const hay = `${b.number} ${b.customer} ${b.agent}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.from && b.date < filters.from) return false
      if (filters.to && b.date > filters.to) return false
      if (filters.customer && !b.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false
      if (filters.agent && b.agent !== filters.agent) return false
      if (filters.warehouse && b.warehouse !== filters.warehouse) return false
      if (filters.minM2 && b.bronM2 < Number(filters.minM2)) return false
      if (filters.maxM2 && b.bronM2 > Number(filters.maxM2)) return false
      return true
    })
  }, [bookings, tab, search, filters, statusFilterOn])

  const totalCount = BOOKING_TAB_COUNTS.active + BOOKING_TAB_COUNTS.partial + BOOKING_TAB_COUNTS.closed
  usePageHeader('Bron tovarlar', {
    label: String(filtered.length === 0 ? 0 : tab === 'active' ? totalCount : BOOKING_TAB_COUNTS[tab]),
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
                  'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px] transition-colors',
                  tab === key
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}
              >
                {key === 'active' ? totalCount : BOOKING_TAB_COUNTS[key]}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Mijoz, telefon yoki partiya…"
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
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <BookingExportMenu />
          <Button
            onClick={() => navigate('/bron-tovarlar/yangi')}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi bron
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <Tag className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Faol bron yo‘q</p>
            <p className="text-sm text-[#737373]">
              Mijoz xonalarini o‘lchab, yangi bron oching — rulon qoldig‘i shu yerdan hisoblanadi
            </p>
            <Button
              onClick={() => navigate('/bron-tovarlar/yangi')}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Yangi bron
            </Button>
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
                <TableHead className={TH}>KIMGA</TableHead>
                <TableHead className={TH}>AGENT</TableHead>
                <TableHead className={TH}>OMBOR</TableHead>
                <TableHead className={cn(TH, 'text-right')}>BRON, M²</TableHead>
                <TableHead className={cn(TH, 'text-right')}>SOTILGAN, M²</TableHead>
                <TableHead className={cn(TH, 'text-right')}>QAYTGAN, M²</TableHead>
                <TableHead className={TH}>HOLAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b, i) => (
                <TableRow
                  key={b.id}
                  className="h-11 cursor-pointer border-b border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5"
                  onClick={() => navigate(`/bron-tovarlar/${b.id}`)}
                >
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{b.number}</TableCell>
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{formatDate(b.date)}</TableCell>
                  <TableCell className="max-w-[170px] truncate px-3 text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{b.customer || '—'}</TableCell>
                  <TableCell className="max-w-[150px] truncate px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{b.agent}</TableCell>
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{b.warehouse}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(b.bronM2)}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(b.soldM2)}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(b.returnedM2)}</TableCell>
                  <TableCell className="px-3">
                    <BookingStatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <BookingFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
