import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { getAllDismissals, getDismissalsPage } from '@/services/recruitmentService'
import { RECRUITMENT_STATUS_PARAM, mapRecruitment } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/ui/copy-button'
import IshdanChiqarishFilterModal, { EMPTY_ISHDAN_CHIQARISH_FILTERS } from './components/IshdanChiqarishFilterModal'
import { StatusBadge, StatusTabs, statusParam, useRecruitmentDismissalCounts } from './components/statusTabs'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-left text-[13px] font-semibold leading-[18px] whitespace-nowrap text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD = 'border-b border-[#F0F0F0] px-4 text-[13px] text-[#0A0A0A] dark:border-white/5 dark:text-muted-foreground'
const COLS = 10

function dmyToIso(value) {
  const m = String(value ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

function mapDismissal(raw) {
  return { ...mapRecruitment({ ...raw, type: 'dismissal' }), sanaFmt: formatDate(raw.rec_dism_date) }
}

// `dism_from`/`dism_to` — "Ishdan chiqarilgan sana" oralig'i (ISO). Backendda bu sana uchun faqat
// aniq qiymat filtri (`rec_dism_date`) bor:
// - bir kunlik oraliq -> `rec_dism_date` bilan oddiy sahifalab yuklash;
// - haqiqiy oraliq -> mos (qidiruv/filial/lavozim/yaratilgan) yozuvlarning HAMMASI olinadi va
//   sana bo'yicha shu yerda filtrlanadi (faqat yuklangan sahifalar emas — natija to'liq). Bu
//   rejimda holat tab'i ham shu yerda qo'llanadi va tab sonlari (`counts`) shu yerda hisoblanadi.
async function fetchDismissalsPage({ dism_from, dism_to, ...params }) {
  if (dism_from && dism_from === dism_to) {
    const res = await getDismissalsPage({ ...params, rec_dism_date: dism_from })
    return { ...res, results: res.results.map(mapDismissal) }
  }
  if (dism_from || dism_to) {
    const { page, status, ...rest } = params
    if (page > 1) return { results: [], count: 0, next: null, counts: null }
    const all = (await getAllDismissals(rest)).filter(
      (r) => (!dism_from || r.rec_dism_date >= dism_from) && (!dism_to || r.rec_dism_date <= dism_to)
    )
    const counts = { all: all.length }
    Object.values(RECRUITMENT_STATUS_PARAM).forEach((s) => {
      counts[s] = all.filter((r) => r.status === s).length
    })
    const rows = (status ? all.filter((r) => r.status === status) : all).map(mapDismissal)
    return { results: rows, count: rows.length, next: null, counts }
  }
  const res = await getDismissalsPage(params)
  return { ...res, results: res.results.map(mapDismissal) }
}

// "Ishdan chiqarish" — ishdan chiqarish hujjatlari (RecruitmentDismissal, type=dismissal),
// scroll pagination bilan. Barcha filtrlar (qidiruv, holat tab'i, filial, lavozim, "Yaratilgan"
// va "Ishdan chiqarilgan sana" oralig'i) serverdan olingan to'liq natija ustida ishlaydi.
export default function IshdanChiqarishListPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ISHDAN_CHIQARISH_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const hasFilter = [filters.filialId, filters.lavozimId, filters.sanaDan, filters.sanaGacha, filters.yaratilganDan, filters.yaratilganGacha].some(Boolean)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Ishdan chiqarish' }])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const baseParams = {
    search: debouncedSearch.trim(),
    branch: filters.filialId,
    position: filters.lavozimId,
    start_date: dmyToIso(filters.yaratilganDan),
    end_date: dmyToIso(filters.yaratilganGacha),
    dism_from: dmyToIso(filters.sanaDan),
    dism_to: dmyToIso(filters.sanaGacha),
  }

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
  } = useServerPagedList(fetchDismissalsPage, { ...baseParams, status: statusParam(tab) })

  const counts = useRecruitmentDismissalCounts('dismissals')

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <StatusTabs tab={tab} onChange={setTab} counts={counts} />

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[280px] rounded-xl border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 rounded-xl border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
        </div>
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
              <th className={TH}>Tashkilot</th>
              <th className={TH}>Lavozim</th>
              <th className={TH}>Filial</th>
              <th className={TH}>Ishdan chiqarilgan sana</th>
              <th className={TH}>Sabab</th>
              <th className={TH}>Yaratilgan</th>
              <th className={TH}>Yangilangan</th>
              <th className={TH}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : error && rows.length === 0 ? (
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
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/malumotnomalar/ishdan-chiqarish/${r.id}`)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={cn(TD, 'w-12 text-[#525252]')}>{i + 1}</td>
                  <td className={cn(TD, 'whitespace-nowrap text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]')}>
                    <span className="inline-flex items-center gap-1.5">
                      {r.employeeName && <CopyButton value={r.employeeName} />}
                      {r.employeeName || ''}
                    </span>
                  </td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.tashkilot || ''}</td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.lavozim || ''}</td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.branch || ''}</td>
                  <td className={cn(TD, 'whitespace-nowrap')}>{r.sanaFmt}</td>
                  <td className={cn(TD, 'min-w-[140px] max-w-[260px] py-2 leading-[18px]')}>{r.dismissalReason || ''}</td>
                  <td className={cn(TD, 'whitespace-nowrap text-[#737373]')}>{r.yaratilgan || ''}</td>
                  <td className={cn(TD, 'whitespace-nowrap text-[#737373]')}>{r.ozgartirilgan || ''}</td>
                  <td className={TD}>
                    <StatusBadge status={r.status} />
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

      <IshdanChiqarishFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
