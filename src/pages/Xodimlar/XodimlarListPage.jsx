import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search, UserPlus } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { createKadr, createRecruitment, fetchXodimlar } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import XodimModal from './components/XodimModal'
import XodimlarFilterModal, { EMPTY_XODIMLAR_FILTERS } from './components/XodimlarFilterModal'
import HireChoiceModal from './components/HireChoiceModal'
import RecruitmentModal from './components/RecruitmentModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

// Xodim (Employee) shaxsiy profillari ro'yxati — to'g'ridan-to'g'ri yaratish/tahrirlash/
// o'chirish, "Ishga olish" (Recruitment) siz. Lavozim biriktirish/ishga olish "Ishga qabul
// qilish" bo'limida alohida boshqariladi. "Holat" bu yerda Xodimning shaxsiy profil holati
// (Employee.active, "Faol"/"Nofaol") — Ishga qabul qilishdagi Qoralama/Tasdiqlangan emas.
export default function XodimlarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const xodimlar = useSelector((s) => s.xodimlar.list)
  const listStatus = useSelector((s) => s.xodimlar.listStatus)
  const listError = useSelector((s) => s.xodimlar.listError)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_XODIMLAR_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  // "+ Ishga olish" — mavjud xodimni tanlab ishga olish (Ishga qabul qilish hujjati yaratish);
  // "Ishga qabul qilish" ro'yxatidagi bilan bir xil HireChoiceModal → RecruitmentModal zanjiri,
  // shu yerda ham qayta ishlatiladi (bitta va bir nechta xodim uchun BIR XIL RecruitmentModal —
  // `multiple` prop "Xodim" maydoni ochadigan tanlash oynasining rejimini belgilaydi).
  const [choiceOpen, setChoiceOpen] = useState(false)
  const [hireOpen, setHireOpen] = useState(false)
  const [hireMultiple, setHireMultiple] = useState(false)
  const createdIdsRef = useRef([])

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Xodimlar' }])

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchXodimlar())
  }, [listStatus, dispatch])

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

  const counts = useMemo(
    () => ({
      all: xodimlar.length,
      faol: xodimlar.filter((x) => x.active).length,
      nofaol: xodimlar.filter((x) => !x.active).length,
    }),
    [xodimlar]
  )
  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = xodimlar
    if (tab === 'faol') out = out.filter((x) => x.active)
    if (tab === 'nofaol') out = out.filter((x) => !x.active)
    if (search) {
      const q = search.trim().toLowerCase()
      const qDigits = q.replace(/\D/g, '')
      out = out.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          (qDigits && x.phone.replace(/\D/g, '').includes(qDigits)) ||
          x.jshshir.includes(q)
      )
    }
    if (filters.viloyat) out = out.filter((x) => x.viloyat === filters.viloyat)
    if (filters.tuman) out = out.filter((x) => x.tuman === filters.tuman)
    if (filters.filial) out = out.filter((x) => x.filial === filters.filial)
    if (filters.holat) out = out.filter((x) => (filters.holat === 'Faol' ? x.active : !x.active))
    if (filters.sanaDan || filters.sanaGacha)
      out = out.filter((x) => matchesDateRange(x.yaratilgan, filters.sanaDan, filters.sanaGacha))
    return out
  }, [xodimlar, tab, search, filters])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
          {[
            ['all', 'Barchasi', counts.all],
            ['faol', 'Faol', counts.faol],
            ['nofaol', 'Nofaol', counts.nofaol],
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
              placeholder="F.I.SH., telefon yoki JSHSHIR bo‘yicha…"
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
            variant="outline"
            onClick={() => setChoiceOpen(true)}
            className="h-9 gap-2 rounded-xl border-[#E5E5E5] bg-white px-3.5 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <UserPlus className="h-4 w-4" /> Ishga olish
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-9 gap-2 rounded-xl bg-[#0052D2] px-3.5 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Qo‘shish
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>F.I.SH.</th>
              <th className={cn(TH, 'text-left')}>TELEFON</th>
              <th className={cn(TH, 'text-left')}>PASSPORT</th>
              <th className={cn(TH, 'text-left')}>JSHSHIR</th>
              <th className={cn(TH, 'text-left')}>VILOYAT</th>
              <th className={cn(TH, 'text-left')}>TUMAN</th>
              <th className={cn(TH, 'text-left')}>FILIAL</th>
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
                      onClick={() => dispatch(fetchXodimlar())}
                      className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                    >
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Xodim topilmadi
                </td>
              </tr>
            ) : (
              shown.map((x, i) => (
                <tr
                  key={x.id}
                  onClick={() => navigate(`/malumotnomalar/xodimlar/${x.id}`)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{i + 1}</td>
                  <td className="px-4 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">{x.name}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">
                    {x.phone ? (
                      <span className="inline-flex items-center gap-1.5">
                        {x.phone}
                        <button
                          type="button"
                          onClick={(e) => copy(e, x.phone, 'Telefon')}
                          className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                          aria-label="Nusxa olish"
                        >
                          <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                        </button>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">
                    {[x.passportSeria, x.passportNumber].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{x.jshshir || '—'}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{x.viloyat || '—'}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{x.tuman || '—'}</td>
                  <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{x.filial || '—'}</td>
                  <td className="px-4">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        x.active
                          ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                          : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                      )}
                    >
                      {x.active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <XodimModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        xodim={null}
        onSave={(values) => {
          dispatch(createKadr(values))
            .unwrap()
            .then((created) => navigate(`/malumotnomalar/xodimlar/${created.id}`))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />
      <XodimlarFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />

      <HireChoiceModal
        open={choiceOpen}
        onOpenChange={setChoiceOpen}
        onChooseSingle={() => {
          setHireMultiple(false)
          setHireOpen(true)
        }}
        onChooseBulk={() => {
          setHireMultiple(true)
          setHireOpen(true)
        }}
      />
      <RecruitmentModal
        open={hireOpen}
        onOpenChange={setHireOpen}
        record={null}
        multiple={hireMultiple}
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

      <Toast message={toast} />
    </div>
  )
}
