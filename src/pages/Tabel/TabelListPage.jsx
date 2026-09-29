import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { cn } from '@/lib/utils'
import { dmyToIso } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusTabs } from '@/pages/Xodimlar/components/statusTabs'
import { createTimesheet, getTimesheetCounts, getTimesheetsPage } from '@/services/timesheetService'
import { extractErrorMessage } from '@/services/apiHelpers'
import { MONTHS, TABEL_STATUS_PARAM, fmtDateTime, fmtHours, normalizeTimesheet } from '@/features/tabel/tabelData'
import TabelStatusBadge from './components/TabelStatusBadge'
import TabelListFilterModal, { EMPTY_TABEL_LIST_FILTERS } from './components/TabelListFilterModal'
import NewTabelModal from './components/NewTabelModal'

const TH =
  'sticky top-0 z-10 h-14 bg-[#F5F5F5] px-4 text-left text-[14px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD = 'h-[56px] border-b border-[#F0F0F0] px-4 text-[15px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 11

// Backend maydoni hali kelmasa — 0
const hoursOrZero = (v) => fmtHours(v ?? 0, true)

async function fetchTabelPage(params) {
  const res = await getTimesheetsPage(params)
  return { ...res, results: res.results.map(normalizeTimesheet) }
}

export default function TabelListPage() {
  const navigate = useNavigate()

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filters, setFilters] = useState(EMPTY_TABEL_LIST_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  usePageHeader('Tabel')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const hasFilter = Boolean(
    filters.orgId ||
      filters.branch ||
      filters.period ||
      filters.yaratilganDan ||
      filters.yaratilganGacha ||
      filters.yangilanganDan ||
      filters.yangilanganGacha
  )

  // Holatdan tashqari so'rov parametrlari — tab hisoblagichlari ham shular bo'yicha
  const baseParams = useMemo(() => {
    const p = {}
    if (filters.orgId) p.organization = filters.orgId
    if (filters.branch) p.branch = filters.branch
    if (filters.period) {
      const [year, forMonth] = filters.period.split('-')
      p.year = year
      p.for_month = forMonth
    }
    if (filters.yaratilganDan) p.start_date = dmyToIso(filters.yaratilganDan)
    if (filters.yaratilganGacha) p.end_date = dmyToIso(filters.yaratilganGacha)
    if (filters.yangilanganDan) p.updated_start_date = dmyToIso(filters.yangilanganDan)
    if (filters.yangilanganGacha) p.updated_end_date = dmyToIso(filters.yangilanganGacha)
    if (debounced.trim()) p.search = debounced.trim()
    return p
  }, [filters, debounced])

  const listParams = useMemo(
    () => (tab === 'all' ? baseParams : { ...baseParams, status: TABEL_STATUS_PARAM[tab] }),
    [baseParams, tab]
  )

  const { items: rows, totalCount, isLoading, isLoadingMore, error, hasMore, containerRef, sentinelRef, handleScroll, reload } =
    useServerPagedList(fetchTabelPage, listParams)

  const [counts, setCounts] = useState({ all: null, confirmed: null, draft: null, cancelled: null })

  const loadCounts = () => {
    getTimesheetCounts(baseParams)
      .then((data) => {
        if (data) {
          setCounts({
            all: data.all ?? 0,
            confirmed: data.approved ?? data.confirmed ?? 0,
            draft: data.draft ?? 0,
            cancelled: data.cancelled ?? 0,
          })
        }
      })
      .catch((err) => console.error('Tabel hisoblagichlarini yuklab bo‘lmadi:', err))
  }

  useEffect(() => {
    loadCounts()
  }, [baseParams])

  async function createTabel({ branchId, year, forMonth }) {
    try {
      const created = await createTimesheet({ branch: branchId, year, for_month: forMonth })
      setNewOpen(false)
      loadCounts()
      if (created?.id) navigate(`/tabel/${created.id}`)
      else reload()
      return null
    } catch (err) {
      return extractErrorMessage(err, 'Tabel yaratishda xatolik yuz berdi')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <StatusTabs tab={tab} onChange={setTab} counts={counts} />

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[280px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setNewOpen(true)}
            className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi tabel
          </Button>
        </div>
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12')}>#</th>
              <th className={TH}>Tashkilot</th>
              <th className={TH}>Filial</th>
              <th className={TH}>Oy</th>
              <th className={TH}>Xodimlar</th>
              <th className={TH}>Plan soat</th>
              <th className={TH}>Fakt soat</th>
              <th className={TH}>Yaratilgan</th>
              <th className={TH}>Yangilangan</th>
              <th className={TH}>Holat</th>
              <th className={cn(TH, 'w-10')} />
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#0052D2]" />
                  Yuklanmoqda...
                </td>
              </tr>
            ) : error && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <p className="mb-2 text-sm text-[#DC2626]">{extractErrorMessage(error, 'Xatolik yuz berdi')}</p>
                  <Button variant="outline" onClick={reload} className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px]">
                    Qayta urinish
                  </Button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Tabel topilmadi
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} onClick={() => navigate(`/tabel/${r.id}`)} className="cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                  <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>{i + 1}</td>
                  <td className={TD}>{r.orgName || '—'}</td>
                  <td className={cn(TD, 'font-medium text-[#0052D2] dark:text-[#60A5FA]')}>{r.branchName}</td>
                  <td className={TD}>{r.year && r.year !== new Date().getFullYear() ? `${MONTHS[r.month]} ${r.year}` : MONTHS[r.month]}</td>
                  <td className={TD}>{r.employeesCount ?? 0}</td>
                  <td className={TD}>{hoursOrZero(r.planHours)}</td>
                  <td className={TD}>{hoursOrZero(r.factHours)}</td>
                  <td className={TD}>{fmtDateTime(r.createdAt)}</td>
                  <td className={TD}>{fmtDateTime(r.updatedAt)}</td>
                  <td className={TD}>
                    <TabelStatusBadge status={r.status} />
                  </td>
                  <td className={cn(TD, 'pr-4 text-[#525252] dark:text-muted-foreground')}>
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))
            )}
            {rows.length > 0 && hasMore && !isLoading && (
              <tr ref={sentinelRef}>
                <td colSpan={COLS} className="h-1 p-0" />
              </tr>
            )}
            {isLoadingMore && (
              <tr>
                <td colSpan={COLS} className="py-4 text-center text-xs font-medium text-[#737373] dark:text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-[#0052D2]" />
                  Ko‘proq ma’lumotlar yuklanmoqda…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TabelListFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <NewTabelModal open={newOpen} onOpenChange={setNewOpen} onSave={createTabel} />
    </div>
  )
}
