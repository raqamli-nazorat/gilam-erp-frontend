import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search, UserPlus } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { createRecruitment, fetchRecruitments, fetchXodimlar } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import RecruitmentModal from './components/RecruitmentModal'
import HireChoiceModal from './components/HireChoiceModal'
import EmployeePickerModal from './components/EmployeePickerModal'
import XodimFilterModal, { EMPTY_XODIM_FILTERS } from './components/XodimFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

const STATUS_LABEL = { draft: 'Qoralama', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan' }
const STATUS_CLS = {
  draft: 'bg-[#0A0A0A] text-white dark:bg-white/20 dark:text-white',
  confirmed: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]',
}

// "Ishga qabul qilish" — RecruitmentDismissal hujjatlarining o'zi (Kadrlar/Xodimlardan farqli),
// Qoralama/Tasdiqlangan/Bekor qilingan uch holatli ish jarayoni bilan. Backendda bu holat
// maydoni tasdiqlanmagan — mapRecruitment eski/nomaʼlum qiymatlarni "confirmed" deb o'qiydi.
export default function IshgaQabulQilishListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const records = useSelector((s) => s.xodimlar.recruitments)
  const listStatus = useSelector((s) => s.xodimlar.recruitmentsStatus)
  const listError = useSelector((s) => s.xodimlar.recruitmentsError)
  const branches = useSelector((s) => s.filiallar.list)
  const branchesStatus = useSelector((s) => s.filiallar.listStatus)
  const kadrlar = useSelector((s) => s.xodimlar.list)
  const kadrStatus = useSelector((s) => s.xodimlar.listStatus)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
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

  // Har uch dispatch ham o'zining "idle" holatiga qarab qo'riqlanadi (fetchXodimlar avvalgi
  // qo'riqlanmagan chaqiruvi bo'yicha bitta so'rovga bir nechta marta ketayotgan edi — bu effekt
  // `listStatus` (recruitmentsStatus) o'zgarganda qayta ishga tushadi, `fetchRecruitments` esa
  // aynan shu maydonni idle→loading→succeeded qilib o'zgartiradi, shuning uchun effekt bir
  // marta mount'da 3 marta qayta ishga tushadi; qo'riqlanmagan `dispatch(fetchXodimlar())` har
  // safar qayta yuborilib, u o'zi ichida employees VA recruitment-dismissals'ni birga so'raydi —
  // natijada bitta sahifa yuklanishida employees 3 marta, recruitment-dismissals 4 marta so'ralardi).
  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchRecruitments())
    if (kadrStatus === 'idle') dispatch(fetchXodimlar())
    if (branchesStatus === 'idle') dispatch(fetchBranches())
  }, [listStatus, kadrStatus, branchesStatus, dispatch])

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

  // Har bir hujjatning tashkilotini filialdan qidiramiz — hujjatning o'zi tashkilotni saqlamaydi.
  const enriched = useMemo(
    () => records.map((r) => ({ ...r, tashkilot: branches.find((b) => b.id === r.branchId)?.tashkilot ?? '' })),
    [records, branches]
  )

  const counts = useMemo(
    () => ({
      all: enriched.length,
      draft: enriched.filter((r) => r.status === 'draft').length,
      confirmed: enriched.filter((r) => r.status === 'confirmed').length,
      cancelled: enriched.filter((r) => r.status === 'cancelled').length,
    }),
    [enriched]
  )
  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = enriched
    if (tab !== 'all') out = out.filter((r) => r.status === tab)
    if (search) {
      const q = search.trim().toLowerCase()
      out = out.filter((r) => r.employeeName.toLowerCase().includes(q))
    }
    if (filters.tashkilot) out = out.filter((r) => r.tashkilot === filters.tashkilot)
    if (filters.filial) out = out.filter((r) => r.branch === filters.filial)
    if (filters.lavozim) out = out.filter((r) => r.lavozim === filters.lavozim)
    if (filters.sanaDan || filters.sanaGacha)
      out = out.filter((r) => matchesDateRange(r.yaratilgan, filters.sanaDan, filters.sanaGacha))
    return out
  }, [enriched, tab, search, filters])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
          {[
            ['all', 'Barchasi', counts.all],
            ['confirmed', 'Tasdiqlangan', counts.confirmed],
            ['draft', 'Qoralama', counts.draft],
            ['cancelled', 'Bekor qilingan', counts.cancelled],
          ].map(([key, label, n]) => {
            const active = tab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] dark:bg-card dark:text-white'
                    : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
                )}
              >
                {label}
                <span
                  className={cn(
                    'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                    active
                      ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                      : 'text-[#A3A3A3] dark:text-muted-foreground'
                  )}
                >
                  {n}
                </span>
              </button>
            )
          })}
        </div>

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

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
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
            {listStatus === 'loading' && shown.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : listStatus === 'failed' && shown.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-[#DC2626]">{listError || 'Xatolik yuz berdi'}</p>
                    <Button
                      variant="outline"
                      onClick={() => dispatch(fetchRecruitments())}
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
                      {r.employeeName || '—'}
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
                    </span>
                  </td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{r.tashkilot || '—'}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{r.branch || '—'}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{r.lavozim || '—'}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.sana || '—'}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.yaratilgan || '—'}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.ozgartirilgan || '—'}</td>
                  <td className="px-4">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        STATUS_CLS[r.status]
                      )}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                </tr>
              ))
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
              setToast(err || 'Saqlashda xatolik yuz berdi')
              throw err
            })
        }
        onDone={(count) => {
          if (count > 1) setToast(`${count} ta xodim ishga olindi`)
          else if (createdIdsRef.current[0]) navigate(`/malumotnomalar/ishga-qabul-qilish/${createdIdsRef.current[0]}`)
          createdIdsRef.current = []
        }}
      />

      <XodimFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}
