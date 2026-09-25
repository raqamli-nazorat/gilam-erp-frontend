import { useEffect, useMemo, useState } from 'react'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { extractErrorMessage } from '@/services/apiHelpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import ReferenceDeleteModal from './ReferenceDeleteModal'
import ReferenceFilterModal, { EMPTY_REFERENCE_FILTERS } from './ReferenceFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-left text-[13px] font-semibold leading-[18px] whitespace-nowrap text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD = 'border-b border-[#F0F0F0] px-4 text-[13px] whitespace-nowrap text-[#525252] dark:border-white/5 dark:text-muted-foreground'

// "DD.MM.YYYY" -> "YYYY-MM-DD" (backend start_date/end_date uchun); to'liq bo'lmasa — ''.
function dmyToIso(value) {
  const m = String(value ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

// Figma'dagi Ma'lumotnomalar ro'yxat sahifalari (Partiyalar, Hisoblash va ushlab qolish
// turlari, Valyutalar) uchun umumiy sahifa: qidiruv + Filtr + "Yangi ..." tugmasi, "scroll
// pagination" jadval, forma/o'chirish/filtr oynalari.
//
// Qidiruv, "Nomi" va "Yaratilgan" oralig'i serverga (search / name / start_date / end_date)
// yuboriladi. "O'zgartirilgan" oralig'i uchun backend parametri yo'q — u yuklangan qatorlar
// ustida ishlaydi. Backend modellarida holat (status) maydoni yo'q — Holat ustuni/filtri ko'rsatilmaydi.
//
// Props:
//   title        — breadcrumb nomi
//   addLabel     — "Yangi partiya" kabi tugma matni
//   api          — { page(params), create(payload), update(id, payload), remove(id) }
//   mapRow       — backend obyekti -> qator ({ id, name, active, yaratilgan, ozgartirilgan, ... })
//   buildPayload — forma draft -> backend so'rovi
//   columns      — [{ key, label, className?, render?(row) }]; birinchi ustun — ko'k "Nomi"
//   FormModal    — ({ open, onOpenChange, record, onSave, onDelete }) komponenti
//   deleteTitle  — "Partiyani o'chirish?"
//   deleteSummary(row) — { label, value }
export default function ReferenceListPage({
  title,
  addLabel,
  api,
  mapRow,
  buildPayload,
  columns,
  FormModal,
  deleteTitle,
  deleteSummary,
}) {
  const [modalRec, setModalRec] = useState(null) // record | 'new' | null
  const [delRec, setDelRec] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_REFERENCE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState('')

  const hasFilter = Object.values(filters).some(Boolean)
  const totalCols = columns.length + 1

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: title }])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const fetchRowsPage = useMemo(
    () => (params) => api.page(params).then((res) => ({ ...res, results: res.results.map(mapRow) })),
    [api, mapRow]
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
  } = useServerPagedList(fetchRowsPage, {
    search: debouncedSearch.trim(),
    name: filters.nomi.trim(),
    start_date: dmyToIso(filters.yaratilganDan),
    end_date: dmyToIso(filters.yaratilganGacha),
  })

  const shown = useMemo(() => {
    let out = rows
    if (filters.ozgartirilganDan || filters.ozgartirilganGacha)
      out = out.filter((r) => matchesDateRange(r.ozgartirilgan, filters.ozgartirilganDan, filters.ozgartirilganGacha))
    return out
  }, [rows, filters])

  // Oyna xato bo'lsa ochiq qolishi uchun xatoni qayta tashlaymiz.
  async function saveRecord(draft) {
    const payload = buildPayload(draft)
    try {
      if (modalRec === 'new') await api.create(payload)
      else await api.update(modalRec.id, payload)
      setToast('Saqlandi')
      reloadRows()
    } catch (err) {
      setToast(extractErrorMessage(err, 'Saqlashda xatolik yuz berdi'))
      throw err
    }
  }

  async function confirmDelete() {
    try {
      await api.remove(delRec.id)
      setToast('O‘chirildi')
      reloadRows()
    } catch (err) {
      setToast(extractErrorMessage(err, 'O‘chirishda xatolik yuz berdi'))
    }
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
          <Plus className="h-4 w-4" /> {addLabel}
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
              <th className={cn(TH, 'w-12')}>#</th>
              {columns.map((c) => (
                <th key={c.key} className={cn(TH, c.headClassName)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsLoading && shown.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : rowsError && shown.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center">
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
                <td colSpan={totalCols} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
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
                  <td className={cn(TD, 'w-12')}>{i + 1}</td>
                  {columns.map((c, ci) => {
                    const value = c.render ? c.render(r) : r[c.key]
                    return (
                      <td
                        key={c.key}
                        className={cn(
                          TD,
                          ci === 0 && 'text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]',
                          c.className
                        )}
                      >
                        <div className="truncate" title={typeof value === 'string' ? value : undefined}>
                          {value === '' || value == null ? '—' : value}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
            {shown.length > 0 && rowsHasMore && !rowsLoading && (
              <tr ref={rowsSentinelRef} className="h-1 border-0 p-0">
                <td colSpan={totalCols} className="h-1 border-0 p-0" />
              </tr>
            )}
            {rowsLoadingMore && (
              <tr>
                <td colSpan={totalCols} className="py-4 text-center">
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

      <FormModal
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
      <ReferenceDeleteModal
        open={!!delRec}
        onOpenChange={(next) => !next && setDelRec(null)}
        title={deleteTitle}
        summary={delRec ? deleteSummary(delRec) : null}
        record={delRec}
        onDelete={confirmDelete}
      />
      <ReferenceFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}
