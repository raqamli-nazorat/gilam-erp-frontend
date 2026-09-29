import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDateTime, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusTabs } from '@/pages/Xodimlar/components/statusTabs'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import {
  getCalculatingSalariesPage,
  getCalculatingSalaryCounts,
} from '@/services/calculatingSalaryService'
import { calculateSalariesThunk } from '@/features/oylikHisoblash/oylikSlice'
import { MONTH_NAMES, MOCK_OYLIK_ITEMS } from '@/features/oylikHisoblash/oylikData'
import OylikStatusBadge from './components/OylikStatusBadge'
import OylikFilterModal, { EMPTY_OYLIK_FILTERS } from './components/OylikFilterModal'
import NewOylikModal from './components/NewOylikModal'

const TH =
  'sticky top-0 z-10 h-14 bg-[#F5F5F5] px-4 text-left text-[14px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD =
  'h-[56px] border-b border-[#F0F0F0] px-4 text-[15px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 9

function dmyToIso(value) {
  if (!value) return ''
  const m = String(value ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : value
}

function mapCalculatingSalary(r) {
  const orgName =
    r.branch_info?.organization?.name ||
    r.branch_info?.organization_name ||
    r.orgName ||
    r.organization_name ||
    ''
  const branchName = r.branch_info?.name || r.branchName || r.branch_name || ''
  const forMonth = r.for_month ?? r.forMonth
  const employeeCount = r.employee_count ?? (r.employee_info ? 1 : 0)
  const totalAmount = Number(r.amount ?? r.totalAmount ?? 0)
  const createdAt = r.created_at ? formatDateTime(new Date(r.created_at)) : (r.createdAt || '')
  const updatedAt = r.updated_at ? formatDateTime(new Date(r.updated_at)) : (r.updatedAt || '')
  const status = r.status || 'draft'

  return {
    ...r,
    id: r.id,
    orgName,
    branchName,
    forMonth,
    employeeCount,
    totalAmount,
    createdAt,
    updatedAt,
    status,
  }
}

// Bitta sahifani so'rab, qatorlarni formatlovchi funksiya (scroll pagination uchun)
async function fetchCalculatingSalariesPage(params) {
  try {
    const res = await getCalculatingSalariesPage(params)
    return {
      ...res,
      results: (res?.results || []).map(mapCalculatingSalary),
      count: res?.count ?? (res?.results?.length || 0),
    }
  } catch {
    return {
      results: [],
      count: 0,
      next: null,
    }
  }
}

export default function OylikHisoblashListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [tab, setTab] = useState('all') // all | confirmed (approved) | draft | cancelled
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_OYLIK_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  usePageHeader('Oylik hisoblash')

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  const statusParam = (currentTab) => {
    if (currentTab === 'confirmed') return 'approved'
    if (currentTab === 'all') return undefined
    return currentTab // draft | cancelled
  }

  // Backend so'rov parametrlari
  const baseParams = useMemo(() => {
    const params = {}
    if (filters.orgId) params.organization = filters.orgId
    if (filters.branch) params.branch = filters.branch
    if (filters.employee) params.employee = filters.employee
    if (filters.for_month) params.for_month = filters.for_month
    if (filters.start_date) params.start_date = dmyToIso(filters.start_date)
    if (filters.end_date) params.end_date = dmyToIso(filters.end_date)
    if (filters.updated_dan) params.updated_from = dmyToIso(filters.updated_dan)
    if (filters.updated_gacha) params.updated_to = dmyToIso(filters.updated_gacha)
    const st = statusParam(tab)
    if (st) params.status = st
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    return params
  }, [filters, tab, debouncedSearch])

  // Scroll pagination hooki - sahifaga kirganda faqat 1-sahifani oladi, scroll bo'lganda keyingisini yuklaydi
  const {
    items: rows,
    totalCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    containerRef,
    sentinelRef,
    handleScroll,
    reload,
  } = useServerPagedList(fetchCalculatingSalariesPage, baseParams)

  const [counts, setCounts] = useState({ all: 0, confirmed: 0, draft: 0, cancelled: 0 })
  const [countsVersion, setCountsVersion] = useState(0)

  // Holatlar sonini /api/v1/hr/calculating-salaries/count/ endpointidan olish
  useEffect(() => {
    let active = true
    getCalculatingSalaryCounts().then((data) => {
      if (active) setCounts(data)
    })
    return () => {
      active = false
    }
  }, [countsVersion])

  const hasFilter = [
    filters.orgId,
    filters.branch,
    filters.for_month,
    filters.employee,
    filters.start_date,
    filters.end_date,
    filters.updated_dan,
    filters.updated_gacha,
  ].some(Boolean)

  // Yangi hisob yaratish handler
  const handleCreateHisob = async (data) => {
    const payload = {
      branch: data.branchId || data.branch,
      for_month: data.forMonth || data.for_month,
      year: data.year || new Date().getFullYear(),
    }
    if (data.organization || data.orgId) {
      payload.organization = data.organization || data.orgId
    }
    if (data.date) {
      payload.date = data.date
    }

    const res = await dispatch(calculateSalariesThunk(payload)).unwrap()

    setNewOpen(false)
    setCountsVersion((v) => v + 1)
    reload()

    if (res?.id) {
      navigate(`/oylik-hisoblash/${res.id}`)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Yuqori boshqaruv paneli: Tablar, Qidiruv, Filtr, Yangi hisob */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <StatusTabs tab={tab} onChange={setTab} counts={counts} />

        <div className="flex flex-1 items-center justify-end gap-2.5">
          {/* Qidirish inputi */}
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[280px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>

          {/* Filtr tugmasi */}
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

          {/* Yangi hisob tugmasi */}
          <Button
            onClick={() => setNewOpen(true)}
            className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi hisob
          </Button>
        </div>
      </div>

      {/* Jadval konteyneri - scroll pagination bilan */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto rounded-xl bg-white shadow-sm dark:bg-card"
      >
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12 text-center')}>#</th>
              <th className={TH}>Tashkilot</th>
              <th className={TH}>Filial</th>
              <th className={TH}>Oy</th>
              <th className={TH}>Xodimlar</th>
              <th className={TH}>Jami, UZS</th>
              <th className={TH}>Yaratilgan</th>
              <th className={TH}>Yangilangan</th>
              <th className={TH}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p>Yuklanmoqda...</p>
                  </div>
                </td>
              </tr>
            ) : error && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                    <Button
                      variant="outline"
                      onClick={reload}
                      className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px]"
                    >
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Hisob topilmadi
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/oylik-hisoblash/${row.id}`)}
                  className="cursor-pointer hover:bg-[#F9FAFB] transition-colors dark:hover:bg-white/5"
                >
                  <td className={cn(TD, 'w-12 text-center text-[#525252] dark:text-muted-foreground')}>
                    {idx + 1}
                  </td>
                  <td className={TD}>{row.orgName || ''}</td>
                  <td className={cn(TD, 'font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]')}>
                    {row.branchName || ''}
                  </td>
                  <td className={TD}>{MONTH_NAMES[row.forMonth] || row.forMonth || ''}</td>
                  <td className={TD}>{row.employeeCount}</td>
                  <td className={cn(TD, 'font-medium')}>{formatNumber(row.totalAmount, 2)}</td>
                  <td className={TD}>{row.createdAt || ''}</td>
                  <td className={TD}>{row.updatedAt || ''}</td>
                  <td className={TD}>
                    <OylikStatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
            {rows.length > 0 && hasMore && !isLoading && (
              <tr ref={sentinelRef} className="h-1 border-0 p-0">
                <td colSpan={COLS} className="h-1 border-0 p-0" />
              </tr>
            )}
            {isLoadingMore && (
              <tr>
                <td colSpan={COLS} className="py-4 text-center">
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0052D2]" />
                    Ko‘proq ma’lumotlar yuklanmoqda…
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modallar */}
      <OylikFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={setFilters}
      />

      <NewOylikModal
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={handleCreateHisob}
      />
    </div>
  )
}
