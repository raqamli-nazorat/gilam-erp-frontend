import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import {
  createWorkSchedule,
  deleteWorkSchedule,
  mapWorkSchedule,
  updateWorkSchedule,
} from '@/features/ishGrafigi/ishGrafigiSlice'
import { workScheduleApi } from '@/services/workScheduleService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import DeleteIshGrafigiModal from './components/DeleteIshGrafigiModal'
import IshGrafigiModal, { formatDaysPart } from './components/IshGrafigiModal'
import IshGrafigiFilterModal, { EMPTY_ISH_GRAFIGI_FILTERS } from './components/IshGrafigiFilterModal'

const TH =
  'sticky top-0 z-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD_MUTED = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

export default function IshGrafigiListPage() {
  const dispatch = useDispatch()
  const [modalRec, setModalRec] = useState(null) // record | 'new' | null
  const [delRec, setDelRec] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ISH_GRAFIGI_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState('')

  const hasFilter = Object.values(filters).some(Boolean)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Ish grafigi' }])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const fetchRecordsPage = useCallback(
    (params) => workScheduleApi.page(params).then((res) => ({ ...res, results: res.results.map(mapWorkSchedule) })),
    []
  )
  const {
    items: rows,
    isLoading: rowsLoading,
    isLoadingMore: rowsLoadingMore,
    error: rowsError,
    hasMore: rowsHasMore,
    containerRef: rowsScrollRef,
    sentinelRef: rowsSentinelRef,
    handleScroll: handleRowsScroll,
    reload: reloadRows,
  } = useServerPagedList(fetchRecordsPage, { search: debouncedSearch.trim() })

  const shown = useMemo(() => {
    let out = rows
    if (filters.nomi.trim()) {
      const q = filters.nomi.trim().toLowerCase()
      out = out.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (filters.filial) out = out.filter((r) => r.filial === filters.filial)
    if (filters.yaratilganDan || filters.yaratilganGacha)
      out = out.filter((r) => matchesDateRange(r.yaratilgan, filters.yaratilganDan, filters.yaratilganGacha))
    return out
  }, [rows, filters])

  function saveRecord(draft) {
    const action = modalRec === 'new' ? createWorkSchedule(draft) : updateWorkSchedule({ id: modalRec.id, draft })
    dispatch(action)
      .unwrap()
      .then(() => {
        setToast('Saqlandi')
        reloadRows()
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' }))
  }

  function confirmDelete() {
    dispatch(deleteWorkSchedule(delRec.id))
      .unwrap()
      .then(() => {
        setToast('O‘chirildi')
        reloadRows()
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'O‘chirishda xatolik yuz berdi' }))
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[260px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
        </div>

        <Button
          onClick={() => setModalRec('new')}
          className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <Plus className="h-4 w-4" /> Qo‘shish
        </Button>
      </div>

      <div
        ref={rowsScrollRef}
        onScroll={handleRowsScroll}
        className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'h-10 w-12 text-left whitespace-nowrap')}>#</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>NOMI</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>FILIALI</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>ISH VAQTI</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>ISH KUNLARI</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>TAVSIF</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>YARATILGAN</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>O‘ZGARTIRILGAN</th>
            </tr>
          </thead>
          <tbody>
            {rowsLoading && shown.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : rowsError && shown.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                    <Button
                      variant="outline"
                      onClick={reloadRows}
                      className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                    >
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setModalRec(r)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={cn(TD_MUTED, 'w-12 whitespace-nowrap')}>{i + 1}</td>
                  <td className="max-w-[200px] px-4 text-[14px] font-medium whitespace-nowrap text-[#0052D2] dark:text-[#60A5FA]">
                    <div className="truncate" title={r.name}>{r.name || ''}</div>
                  </td>
                  <td className="max-w-[200px] px-4 text-[13px] whitespace-nowrap text-[#0A0A0A] dark:text-muted-foreground">
                    <div className="truncate" title={r.filial}>{r.filial || ''}</div>
                  </td>
                  <td className="px-4 text-[13px] whitespace-nowrap text-[#0A0A0A] dark:text-muted-foreground">
                    {r.fromHour && r.toHour ? `${r.fromHour} – ${r.toHour}` : ''}
                  </td>
                  <td className="px-4 text-[13px] whitespace-nowrap text-[#0A0A0A] dark:text-muted-foreground">
                    {formatDaysPart(r.days) || ''}
                  </td>
                  <td className="max-w-[320px] px-4 text-[13px] whitespace-nowrap text-[#0A0A0A] dark:text-muted-foreground 2xl:max-w-[480px]">
                    <div className="truncate" title={r.tavsif}>{r.tavsif || ''}</div>
                  </td>
                  <td className={cn(TD_MUTED, 'whitespace-nowrap')}>{r.yaratilgan}</td>
                  <td className={cn(TD_MUTED, 'whitespace-nowrap')}>{r.ozgartirilgan}</td>
                </tr>
              ))
            )}
            {shown.length > 0 && rowsHasMore && !rowsLoading && (
              <tr ref={rowsSentinelRef} className="h-1 border-0 p-0">
                <td colSpan={8} className="h-1 border-0 p-0" />
              </tr>
            )}
            {rowsLoadingMore && (
              <tr>
                <td colSpan={8} className="py-4 text-center">
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

      <IshGrafigiModal
        open={!!modalRec}
        onOpenChange={(next) => !next && setModalRec(null)}
        record={modalRec === 'new' ? null : modalRec}
        onSave={saveRecord}
        onDelete={() => {
          const rec = modalRec
          setModalRec(null)
          setDelRec(rec)
        }}
      />
      <DeleteIshGrafigiModal
        open={!!delRec}
        onOpenChange={(next) => !next && setDelRec(null)}
        record={delRec}
        onDelete={confirmDelete}
      />
      <IshGrafigiFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}
