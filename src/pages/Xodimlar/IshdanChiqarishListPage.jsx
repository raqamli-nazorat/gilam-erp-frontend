import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDate, matchesDateRange } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { getDismissalsPage } from '@/services/recruitmentService'
import { mapRecruitment } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/ui/copy-button'
import IshdanChiqarishFilterModal, { EMPTY_ISHDAN_CHIQARISH_FILTERS } from './components/IshdanChiqarishFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-left text-[13px] font-semibold leading-[18px] whitespace-nowrap text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD = 'border-b border-[#F0F0F0] px-4 text-[13px] text-[#0A0A0A] dark:border-white/5 dark:text-muted-foreground'
const COLS = 8

function dmyToIso(value) {
  const m = String(value ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

const fetchDismissalsPage = (params) =>
  getDismissalsPage(params).then((res) => ({
    ...res,
    results: res.results.map((raw) => ({ ...mapRecruitment({ ...raw, type: 'dismissal' }), sanaFmt: formatDate(raw.rec_dism_date) })),
  }))

// "Ishdan chiqarish" — ishdan chiqarilgan xodimlar ro'yxati (RecruitmentDismissal, type=dismissal),
// scroll pagination bilan. Qidiruv, filial va "Yaratilgan" oralig'i serverga yuboriladi;
// "Ishdan chiqarilgan sana" oralig'i yuklangan qatorlar ustida ishlaydi.
// Holat ustuni yo'q — ro'yxat javobida (RecruitmentDismissalList) holat maydoni yo'q.
// "Sabab" `dismissal_reason` ro'yxat javobida kelganda avtomatik ko'rinadi (mapRecruitment uni
// o'qiydi); hozircha backend uni faqat detal endpointida qaytaradi.
export default function IshdanChiqarishListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ISHDAN_CHIQARISH_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const hasFilter = Object.values(filters).some(Boolean)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Ishdan chiqarish' }])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])


  const {
    items: rows,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    containerRef,
    sentinelRef,
    handleScroll,
    reload,
  } = useServerPagedList(fetchDismissalsPage, {
    search: debouncedSearch.trim(),
    branch: filters.filialId,
    start_date: dmyToIso(filters.yaratilganDan),
    end_date: dmyToIso(filters.yaratilganGacha),
  })

  const shown = useMemo(() => {
    if (!filters.sanaDan && !filters.sanaGacha) return rows
    return rows.filter((r) => matchesDateRange(r.sanaFmt, filters.sanaDan, filters.sanaGacha))
  }, [rows, filters])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
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

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12')}>#</th>
              <th className={TH}>F.I.SH</th>
              <th className={TH}>Lavozim</th>
              <th className={TH}>Filial</th>
              <th className={TH}>Ishdan chiqarilgan sana</th>
              <th className={TH}>Sabab</th>
              <th className={TH}>Yaratilgan</th>
              <th className={TH}>Yangilangan</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && shown.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : error && shown.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                    <Button
                      variant="outline"
                      onClick={reload}
                      className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                    >
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/malumotnomalar/ishdan-chiqarish/${r.id}`)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={cn(TD, 'w-12 text-[#525252]')}>{i + 1}</td>
                  <td className={cn(TD, 'whitespace-nowrap text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]')}>
                    {r.employeeName || '—'}
                  </td>
                  <td className={cn(TD, 'whitespace-nowrap text-[#737373]')}>
                    <span className="inline-flex items-center gap-1.5">
                      {r.lavozim || '—'}
                      {r.lavozim && <CopyButton value={r.lavozim} />}
                    </span>
                  </td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.branch || '—'}</td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.sanaFmt}</td>
                  <td className={cn(TD, 'min-w-[140px] max-w-[260px] py-2 leading-[18px]')}>{r.dismissalReason || '—'}</td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.yaratilgan || '—'}</td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.ozgartirilgan || '—'}</td>
                </tr>
              ))
            )}
            {shown.length > 0 && hasMore && !isLoading && (
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

      <IshdanChiqarishFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
