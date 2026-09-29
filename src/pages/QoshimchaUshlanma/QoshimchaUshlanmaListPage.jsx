import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import {
  createAccrualRetentionDocument,
  getAccrualRetentionDocumentCounts,
  getAccrualRetentionDocumentsPage,
} from '@/services/accrualRetentionDocumentService'
import { formatAccrualRetentionValue } from '@/features/accrualRetention/accrualRetentionData'
import { getCurrencyMap } from '@/features/oylikHisoblash/oylikGroups'
import QoshimchaStatusBadge from './components/QoshimchaStatusBadge'
import QoshimchaFilterModal, { EMPTY_QOSHIMCHA_FILTERS } from './components/QoshimchaFilterModal'
import NewQoshimchaModal from './components/NewQoshimchaModal'

const TH =
  'sticky top-0 z-10 h-14 bg-[#F5F5F5] px-4 text-left text-[14px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD =
  'h-[56px] border-b border-[#F0F0F0] px-4 text-[14px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 8

const fmtDt = (iso) => (iso ? formatDateTime(new Date(iso)) : '—')
const isoDay = (iso) => (iso ? String(iso).slice(0, 10) : '')

function mapAccrualDoc(r, currencyMap) {
  return {
    ...r,
    branchName: r.branch_info?.name || '—',
    employeeName: r.employee_info?.full_name || '—',
    typeName: r.accrual_retention_info?.name || '—',
    isRetention: Boolean(r.accrual_retention_info?.is_retention),
    valueDisplay: formatAccrualRetentionValue(r, currencyMap),
    dateDisplay: fmtDt(r.date),
    updatedDisplay: fmtDt(r.updated_at || r.created_at),
    status: r.status || 'draft',
  }
}

export default function QoshimchaUshlanmaListPage() {
  const navigate = useNavigate()

  const [tab, setTab] = useState('all') // all | approved | draft | cancelled
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_QOSHIMCHA_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [currencyMap, setCurrencyMap] = useState({})

  usePageHeader("Qo'shimcha va ushlanma")

  useEffect(() => {
    getCurrencyMap().then(setCurrencyMap)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  // Faqat backend qo'llab-quvvatlaydigan parametrlar (tashkilot filtri — filial tanlovini toraytiradi,
  // "Yangilangan" oralig'i — yuklangan qatorlar ustida qo'llanadi)
  const queryParams = useMemo(() => {
    const p = {}
    if (tab !== 'all') p.status = tab
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim()
    if (filters.branch) p.branch = filters.branch
    if (filters.employee) p.employee = filters.employee
    if (filters.accrual_retention) p.accrual_retention = filters.accrual_retention
    if (filters.date_from) p.date_from = filters.date_from
    if (filters.date_to) p.date_to = filters.date_to
    return p
  }, [tab, debouncedSearch, filters])

  const { items, isLoading, isLoadingMore, error, containerRef, sentinelRef, handleScroll, reload } =
    useServerPagedList(getAccrualRetentionDocumentsPage, queryParams)

  const rows = useMemo(() => {
    let list = items.map((r) => mapAccrualDoc(r, currencyMap))
    if (filters.updated_from) list = list.filter((r) => isoDay(r.updated_at) >= filters.updated_from)
    if (filters.updated_to) list = list.filter((r) => isoDay(r.updated_at) <= filters.updated_to)
    return list
  }, [items, currencyMap, filters.updated_from, filters.updated_to])

  const [counts, setCounts] = useState({ all: 0, approved: 0, draft: 0, cancelled: 0 })
  const [countsVersion, setCountsVersion] = useState(0)

  useEffect(() => {
    let active = true
    getAccrualRetentionDocumentCounts().then((data) => {
      if (active) setCounts(data)
    })
    return () => {
      active = false
    }
  }, [countsVersion])

  const handleCreateDocument = useCallback(
    async (payload) => {
      const created = await createAccrualRetentionDocument(payload)
      setCountsVersion((v) => v + 1)
      reload()
      if (created?.id) navigate(`/qoshimcha-va-ushlanma/${created.id}`)
    },
    [reload, navigate]
  )

  const hasActiveFilters = [
    filters.branch,
    filters.employee,
    filters.accrual_retention,
    filters.date_from,
    filters.date_to,
    filters.updated_from,
    filters.updated_to,
  ].some(Boolean)

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Yuqori panel: Tablar, Qidiruv, Filtr, Yangi hujjat */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Chap tomon: Holat tablari */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-[#F5F5F5] p-1 dark:bg-white/5">
          {[
            { id: 'all', label: 'Barchasi', count: counts.all },
            { id: 'approved', label: 'Tasdiqlangan', count: counts.approved },
            { id: 'draft', label: 'Qoralama', count: counts.draft },
            { id: 'cancelled', label: 'Bekor qilingan', count: counts.cancelled },
          ].map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-all cursor-pointer',
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-sm dark:bg-card dark:text-white'
                    : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    active
                      ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                      : 'bg-black/5 text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                  )}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* O'ng tomon: Qidiruv, Filtr, Yangi hujjat */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-10 rounded-xl pl-9 border-[#E5E5E5] bg-white text-sm dark:border-white/10 dark:bg-card"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-10 gap-2 rounded-xl border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white cursor-pointer',
              hasActiveFilters && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filtr</span>
            {hasActiveFilters && (
              <span className="size-2 rounded-full bg-[#0052D2]" />
            )}
          </Button>

          <Button
            type="button"
            onClick={() => setNewOpen(true)}
            className="h-10 gap-2 rounded-xl bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Yangi hujjat</span>
          </Button>
        </div>
      </div>

      {/* Jadval qismi */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card"
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#F0F0F0] dark:border-white/10">
              <th className={cn(TH, 'w-12 text-center')}>#</th>
              <th className={TH}>Filial</th>
              <th className={TH}>Xodim</th>
              <th className={TH}>Qo‘shimcha va ushlanma</th>
              <th className={TH}>Qiymat</th>
              <th className={TH}>Sana</th>
              <th className={TH}>Yangilangan</th>
              <th className={TH}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-sm text-[#737373]">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <span>Yuklanmoqda...</span>
                  </div>
                </td>
              </tr>
            ) : error && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                    <Button variant="outline" onClick={reload} className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px]">
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => navigate(`/qoshimcha-va-ushlanma/${row.id}`)}
                  className="group transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5 cursor-pointer"
                >
                  <td className={cn(TD, 'text-center text-[#737373] font-medium')}>
                    {index + 1}
                  </td>
                  <td className={cn(TD, 'font-medium text-[#0A0A0A] dark:text-white max-w-[200px] truncate')}>
                    {row.branchName}
                  </td>
                  <td className={TD}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const empId = row.employee_info?.id
                        navigate(empId ? `/malumotnomalar/xodimlar/${empId}` : `/qoshimcha-va-ushlanma/${row.id}`)
                      }}
                      className="font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA] cursor-pointer"
                    >
                      {row.employeeName}
                    </button>
                  </td>
                  <td className={cn(TD, 'text-[#0A0A0A] dark:text-white max-w-[200px] truncate')}>
                    {row.typeName}
                  </td>
                  <td className={cn(TD, 'font-medium', row.isRetention ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
                    {row.isRetention ? '−' : '+'}
                    {row.valueDisplay}
                  </td>
                  <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>
                    {row.dateDisplay}
                  </td>
                  <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>
                    {row.updatedDisplay}
                  </td>
                  <td className={TD}>
                    <QoshimchaStatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-4" />

        {isLoadingMore && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#0052D2]" />
          </div>
        )}
      </div>

      {/* Modallar */}
      <QoshimchaFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={(f) => setFilters(f)}
      />

      <NewQoshimchaModal
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={handleCreateDocument}
      />
    </div>
  )
}
