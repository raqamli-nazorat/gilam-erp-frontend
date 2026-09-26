import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search, UserPlus } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { getRecruitmentsPage } from '@/services/recruitmentService'
import { bulkCreateRecruitments, createRecruitment, fetchXodimlar, mapRecruitment } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import RecruitmentModal from './components/RecruitmentModal'
import HireChoiceModal from './components/HireChoiceModal'
import EmployeePickerModal from './components/EmployeePickerModal'
import XodimFilterModal, { EMPTY_XODIM_FILTERS } from './components/XodimFilterModal'
import { StatusBadge, StatusTabs, statusParam, useStatusTabCounts } from './components/statusTabs'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

function dmyToIso(value) {
  const m = String(value ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

const fetchRecruitmentsPage = (params) =>
  getRecruitmentsPage(params).then((res) => ({
    ...res,
    results: res.results.map((r) => mapRecruitment({ ...r, type: 'recruitment' })),
  }))

// "Ishga qabul qilish" — RecruitmentDismissal hujjatlarining o'zi (Kadrlar/Xodimlardan farqli),
// Qoralama/Tasdiqlangan/Bekor qilingan uch holatli ish jarayoni bilan. Backendda bu holat
// maydoni tasdiqlanmagan — mapRecruitment eski/nomaʼlum qiymatlarni "confirmed" deb o'qiydi.
//
// Jadval "scroll pagination" bilan yuklanadi (bitta-bitta sahifa). Oldin sahifa ochilishida
// fetchRecruitments (barcha sahifalar) + fetchXodimlar (barcha xodimlar va yana barcha
// recruitment sahifalari) birga ishga tushib, har bir sahifa ikki marta so'ralardi. Xodimlar
// ro'yxati endi faqat "Ishga olish" oynasi ochilganda (xodim tanlash uchun) yuklanadi.
// Qidiruv, "Sana" oralig'i va holat tab'i (backend `status`) serverga yuboriladi;
// tashkilot/filial/lavozim filtrlari yuklangan qatorlar ustida ishlaydi.
export default function IshgaQabulQilishListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const branches = useSelector((s) => s.filiallar.list)
  const kadrlar = useSelector((s) => s.xodimlar.list)
  const kadrStatus = useSelector((s) => s.xodimlar.listStatus)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_XODIM_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState('')

  // "+ Ishga olish" — avval "Bitta"/"Bir nechta" tanlanadi (HireChoiceModal). "Bitta" to'g'ridan-
  // to'g'ri RecruitmentModal'ni pagersiz-bir-slotli rejimda ochadi ("Xodim" maydoni bosilganda
  // o'zi tanlash oynasini ochadi). "Bir nechta" avval EmployeePickerModal (ko'p tanlash) orqali
  // xodimlar ro'yxatini tanlaydi, so'ng RecruitmentModal'ni shu ro'yxat bilan navbat/pager
  // rejimida ochadi — har bir xodim uchun alohida maydonlar, pager orqali o'tiladi.
  const [choiceOpen, setChoiceOpen] = useState(false)
  const [bulkPickerOpen, setBulkPickerOpen] = useState(false)
  const [hireOpen, setHireOpen] = useState(false)
  const [hireEmployees, setHireEmployees] = useState(null)
  const createdIdsRef = useRef([])

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Ishga qabul qilish' }])

  // Xodim tanlash oynasi uchun — faqat "Ishga olish" jarayoni boshlanganda, bir marta.
  const hireFlowOpen = choiceOpen || bulkPickerOpen || hireOpen
  useEffect(() => {
    if (hireFlowOpen && kadrStatus === 'idle') dispatch(fetchXodimlar())
  }, [hireFlowOpen, kadrStatus, dispatch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const {
    items: records,
    totalCount,
    counts: statusCounts,
    isLoading,
    isLoadingMore,
    error: listError,
    hasMore,
    containerRef,
    sentinelRef,
    handleScroll,
    reload,
  } = useServerPagedList(fetchRecruitmentsPage, {
    search: debouncedSearch.trim(),
    start_date: dmyToIso(filters.sanaDan),
    end_date: dmyToIso(filters.sanaGacha),
    status: statusParam(tab),
  })

  const counts = useStatusTabCounts({
    fetchPage: getRecruitmentsPage,
    baseParams: { search: debouncedSearch.trim(), start_date: dmyToIso(filters.sanaDan), end_date: dmyToIso(filters.sanaGacha) },
    statusCounts,
    tab,
    totalCount,
    isLoading,
    listError,
  })

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function copy(e, text, label) {
    e.stopPropagation()
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  // Filiallar ro'yxati bu sahifada ataylab yuklanmaydi (barcha sahifalarini so'rashning hojati yo'q) —
  // store'da bo'lsa (boshqa sahifadan) zaxira sifatida ishlatiladi.
  // Ro'yxat javobi tashkilot nomini to'g'ridan-to'g'ri beradi (r.tashkilot, mapRecruitment
  // orqali organization_name'dan) — topilmasa (masalan detaldan kelgan bo'lsa) filiallar
  // ro'yxatidan qidiramiz.
  const enriched = useMemo(
    () => records.map((r) => ({ ...r, tashkilot: r.tashkilot || branches.find((b) => b.id === r.branchId)?.tashkilot || '' })),
    [records, branches]
  )

  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = enriched
    if (filters.tashkilot) out = out.filter((r) => r.tashkilot === filters.tashkilot)
    if (filters.filial) out = out.filter((r) => r.branch === filters.filial)
    if (filters.lavozim) out = out.filter((r) => r.lavozim === filters.lavozim)
    return out
  }, [enriched, filters])

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
              'h-9 gap-2 border-[#E5E5E5] bg-white rounded-xl px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setChoiceOpen(true)}
            className="h-9 gap-2 rounded-xl bg-[#0052D2] px-3.5 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Ishga olish
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
              <th className={cn(TH, 'w-12 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>F.I.SH.</th>
              <th className={cn(TH, 'text-left')}>TASHKILOT</th>
              <th className={cn(TH, 'text-left')}>FILIAL</th>
              <th className={cn(TH, 'text-left')}>LAVOZIM</th>
              <th className={cn(TH, 'text-left')}>ISHGA OLINGAN</th>
              <th className={cn(TH, 'text-left')}>YARATILGAN</th>
              <th className={cn(TH, 'text-left')}>YANGILANGAN</th>
              <th className={cn(TH, 'text-left')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && shown.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : listError && shown.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
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
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                      <UserPlus className="h-6 w-6 text-[#737373]" />
                    </div>
                    <p className="text-sm text-[#737373]">Yozuv topilmadi</p>
                  </div>
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/malumotnomalar/ishga-qabul-qilish/${r.id}`)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{i + 1}</td>
                  <td className="px-4 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">
                    <span className="inline-flex items-center gap-1.5">
                      {r.employeeName && (
                        <button
                          type="button"
                          onClick={(e) => copy(e, r.employeeName, 'F.I.SH.')}
                          className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                          aria-label="Nusxa olish"
                        >
                          <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                        </button>
                      )}
                      {r.employeeName || ''}
                    </span>
                  </td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{r.tashkilot || ''}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{r.branch || ''}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{r.lavozim || ''}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.sana ? formatDate(r.sana) : ''}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.yaratilgan || ''}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.ozgartirilgan || ''}</td>
                  <td className="px-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
            {shown.length > 0 && hasMore && !isLoading && (
              <tr ref={sentinelRef} className="h-1 border-0 p-0">
                <td colSpan={9} className="h-1 border-0 p-0" />
              </tr>
            )}
            {isLoadingMore && (
              <tr>
                <td colSpan={9} className="py-4 text-center">
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

      <HireChoiceModal
        open={choiceOpen}
        onOpenChange={setChoiceOpen}
        onChooseSingle={() => {
          setHireEmployees(null)
          setHireOpen(true)
        }}
        onChooseBulk={() => setBulkPickerOpen(true)}
      />
      <EmployeePickerModal
        open={bulkPickerOpen}
        onOpenChange={setBulkPickerOpen}
        employees={kadrlar}
        multiple
        onConfirm={(ids) => {
          setHireEmployees(kadrlar.filter((k) => ids.includes(k.id)))
          setHireOpen(true)
        }}
      />

      <RecruitmentModal
        open={hireOpen}
        onOpenChange={setHireOpen}
        record={null}
        employees={hireEmployees}
        onSaveOne={({ employeeId, status, ...draftValues }) =>
          dispatch(createRecruitment({ employeeId, status, draft: draftValues }))
            .unwrap()
            .then((created) => {
              createdIdsRef.current.push(created.id)
            })
            .catch((err) => {
              setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' })
              throw err
            })
        }
        onSaveBulk={(items, status) =>
          dispatch(bulkCreateRecruitments({ items, status }))
            .unwrap()
            .then((created) => {
              created.forEach((r) => createdIdsRef.current.push(r.id))
            })
            .catch((err) => {
              setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' })
              throw err
            })
        }
        onDone={(count) => {
          if (count > 1) {
            setToast(`${count} ta xodim ishga olindi`)
            reload()
          }
          else if (createdIdsRef.current[0]) navigate(`/malumotnomalar/ishga-qabul-qilish/${createdIdsRef.current[0]}`)
          createdIdsRef.current = []
        }}
      />

      <XodimFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}
