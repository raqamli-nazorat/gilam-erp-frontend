import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDateTime, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusTabs } from '@/pages/Xodimlar/components/statusTabs'
import { calculateSalaries, getAllCalculatingSalaries } from '@/services/calculatingSalaryService'
import { groupSalaries, makeHisobId } from '@/features/oylikHisoblash/oylikGroups'
import { MONTH_NAMES } from '@/features/oylikHisoblash/oylikData'
import OylikStatusBadge from './components/OylikStatusBadge'
import OylikFilterModal, { EMPTY_OYLIK_FILTERS } from './components/OylikFilterModal'
import NewOylikModal from './components/NewOylikModal'

const TH =
  'sticky top-0 z-10 h-14 bg-[#F5F5F5] px-4 text-left text-[14px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD =
  'h-[56px] border-b border-[#F0F0F0] px-4 text-[15px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 9

// Tab kaliti -> guruh holati (StatusTabs "confirmed" kalitini ishlatadi)
const TAB_STATUS = { confirmed: 'approved', draft: 'draft', cancelled: 'cancelled' }

const fold = (s) => String(s || '').toLocaleLowerCase('uz').replace(/[ʻʼ‘’`']/g, "'")
const fmtDt = (iso) => (iso ? formatDateTime(new Date(iso)) : '')
const isoDay = (iso) => (iso ? String(iso).slice(0, 10) : '')

export default function OylikHisoblashListPage() {
  const navigate = useNavigate()

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_OYLIK_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  usePageHeader('Oylik hisoblash')

  // Backend qo'llab-quvvatlaydigan filtrlar so'rovga, qolganlari (tashkilot, yangilangan) — frontendda
  const apiParams = useMemo(() => {
    const p = {}
    if (filters.branch) p.branch = filters.branch
    if (filters.employee) p.employee = filters.employee
    if (filters.for_month) p.for_month = filters.for_month
    if (filters.start_date) p.start_date = filters.start_date
    if (filters.end_date) p.end_date = filters.end_date
    return p
  }, [filters.branch, filters.employee, filters.for_month, filters.start_date, filters.end_date])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    getAllCalculatingSalaries(apiParams)
      .then((data) => {
        if (active) setRows(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) {
          setRows([])
          setError(err)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [apiParams, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  // Qatorlarni hisoblarga guruhlash + frontend filtrlari
  const groups = useMemo(() => {
    let list = groupSalaries(rows)
    if (filters.orgId) list = list.filter((g) => String(g.orgId) === String(filters.orgId))
    if (filters.updated_dan) list = list.filter((g) => isoDay(g.updatedAt) >= filters.updated_dan)
    if (filters.updated_gacha) list = list.filter((g) => isoDay(g.updatedAt) <= filters.updated_gacha)
    const q = fold(search.trim())
    if (q) {
      list = list.filter(
        (g) =>
          fold(g.orgName).includes(q) ||
          fold(g.branchName).includes(q) ||
          fold(MONTH_NAMES[g.forMonth]).includes(q) ||
          g.rows.some((r) => fold(r.employee_info?.full_name).includes(q))
      )
    }
    return list
  }, [rows, filters.orgId, filters.updated_dan, filters.updated_gacha, search])

  const counts = useMemo(
    () => ({
      all: groups.length,
      confirmed: groups.filter((g) => g.status === 'approved').length,
      draft: groups.filter((g) => g.status === 'draft').length,
      cancelled: groups.filter((g) => g.status === 'cancelled').length,
    }),
    [groups]
  )

  const visible = useMemo(
    () => (tab === 'all' ? groups : groups.filter((g) => g.status === TAB_STATUS[tab])),
    [groups, tab]
  )

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

  // Yangi hisob — backend filial va oy bo'yicha ishlayotgan xodimlar oyligini hisoblaydi
  const handleCreateHisob = async ({ branch, forMonth, year }) => {
    await calculateSalaries({ branch, for_month: Number(forMonth), year: Number(year) })
    setNewOpen(false)
    reload()
    navigate(`/oylik-hisoblash/${makeHisobId(branch, forMonth, year)}`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Yuqori boshqaruv paneli: Tablar, Qidiruv, Filtr, Yangi hisob */}
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
            <Plus className="h-4 w-4" /> Yangi hisob
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white shadow-sm dark:bg-card">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12')}>#</th>
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
            ) : error ? (
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
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Hisob topilmadi
                </td>
              </tr>
            ) : (
              visible.map((g, idx) => (
                <tr
                  key={g.id}
                  onClick={() => navigate(`/oylik-hisoblash/${g.id}`)}
                  className="cursor-pointer transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={cn(TD, 'w-12 text-[#525252] dark:text-muted-foreground')}>{idx + 1}</td>
                  <td  className={cn(TD, 'max-w-[280px] truncate')}>{g.orgName || ''}</td>
                  <td  className={cn(TD, 'max-w-[280px] truncate text-[#0052D2] dark:text-[#60A5FA]')}>
                    <span className="hover:underline">{g.branchName || ''}</span>
                  </td>
                  <td className={TD}>{MONTH_NAMES[g.forMonth] || g.forMonth}</td>
                  <td className={TD}>{g.employeeCount}</td>
                  <td className={TD}>{formatNumber(g.totalAmount, 2)}</td>
                  <td className={TD}>{fmtDt(g.createdAt)}</td>
                  <td className={TD}>{fmtDt(g.updatedAt)}</td>
                  <td className={TD}>
                    <OylikStatusBadge status={g.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OylikFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={setFilters}
      />

      <NewOylikModal open={newOpen} onOpenChange={setNewOpen} onSubmit={handleCreateHisob} />
    </div>
  )
}
