import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusTabs } from '@/pages/Xodimlar/components/statusTabs'
import { findDuplicate, tabelCreated, tabelSummary } from '@/features/tabel/tabelSlice'
import { MONTHS, branchName, fmtDateTime, fmtHours, orgName } from '@/features/tabel/tabelData'
import TabelStatusBadge from './components/TabelStatusBadge'
import TabelListFilterModal, { EMPTY_TABEL_LIST_FILTERS } from './components/TabelListFilterModal'
import NewTabelModal from './components/NewTabelModal'

const TH =
  'sticky top-0 z-10 h-14 bg-[#F5F5F5] px-4 text-left text-[14px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD = 'h-[56px] border-b border-[#F0F0F0] px-4 text-[15px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 10

// Tab kalitlari StatusTabs bilan bir xil: all | confirmed | draft | cancelled
const fold = (s) => s.toLocaleLowerCase('uz').replace(/[ʻʼ‘’`']/g, "'")

export default function TabelListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector((s) => s.tabel.items)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filters, setFilters] = useState(EMPTY_TABEL_LIST_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  usePageHeader('Tabel')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 200)
    return () => clearTimeout(t)
  }, [search])

  const hasFilter = Object.values(filters).some(Boolean)

  const rows = useMemo(
    () =>
      items.map((t) => ({
        ...t,
        ...tabelSummary(t),
        org: orgName(t.orgId),
        branch: branchName(t.branchId),
        oy: MONTHS[t.month],
        created: fmtDateTime(t.createdAt),
        updated: fmtDateTime(t.updatedAt),
      })),
    [items]
  )

  // Qidiruv va filtrlar — tab sonlari shular bo'yicha hisoblanadi, tab esa oxirida qo'llanadi
  const filtered = useMemo(() => {
    const q = fold(debounced.trim())
    return rows.filter((r) => {
      if (q && ![r.org, r.branch, r.oy].some((v) => fold(v).includes(q))) return false
      if (filters.orgId && r.orgId !== filters.orgId) return false
      if (filters.branchId && r.branchId !== filters.branchId) return false
      if (filters.period && `${r.year}-${r.month}` !== filters.period) return false
      if (filters.status && r.status !== filters.status) return false
      if (!matchesDateRange(r.created, filters.yaratilganDan, filters.yaratilganGacha)) return false
      if (!matchesDateRange(r.updated, filters.yangilanganDan, filters.yangilanganGacha)) return false
      return true
    })
  }, [rows, debounced, filters])

  const counts = useMemo(() => {
    const c = { all: filtered.length, confirmed: 0, draft: 0, cancelled: 0 }
    filtered.forEach((r) => {
      c[r.status] += 1
    })
    return c
  }, [filtered])

  const visible = tab === 'all' ? filtered : filtered.filter((r) => r.status === tab)

  const periods = useMemo(
    () =>
      [...new Set(items.map((t) => `${t.year}-${t.month}`))].sort((a, b) => {
        const [ay, am] = a.split('-').map(Number)
        const [by, bm] = b.split('-').map(Number)
        return by * 12 + bm - (ay * 12 + am)
      }),
    [items]
  )

  function createTabel(data) {
    const dup = findDuplicate(items, data)
    if (dup) return `${branchName(data.branchId)} uchun ${MONTHS[data.month]} oyi tabeli allaqachon mavjud`
    const action = tabelCreated(data)
    dispatch(action)
    setNewOpen(false)
    navigate(`/tabel/${action.payload.id}`)
    return null
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

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
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
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Tabel topilmadi
                </td>
              </tr>
            ) : (
              visible.map((r, i) => (
                <tr key={r.id} onClick={() => navigate(`/tabel/${r.id}`)} className="cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                  <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>{i + 1}</td>
                  <td className={TD}>{r.org}</td>
                  <td className={cn(TD, 'font-medium text-[#0052D2] dark:text-[#60A5FA]')}>{r.branch}</td>
                  <td className={TD}>{r.oy}</td>
                  <td className={TD}>{r.employeeCount}</td>
                  <td className={TD}>{fmtHours(r.plan, true)}</td>
                  <td className={TD}>{fmtHours(r.fakt, true)}</td>
                  <td className={TD}>{r.created}</td>
                  <td className={TD}>{r.updated}</td>
                  <td className={TD}>
                    <TabelStatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TabelListFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} periods={periods} />
      <NewTabelModal open={newOpen} onOpenChange={setNewOpen} onSave={createTabel} />
    </div>
  )
}
