import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, QrCode, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskDate } from '@/components/ui/filter-modal'
import { dmyToNum, maskMoney, unmaskMoney } from '@/lib/format'
import { ISH_HAQI_TURLARI } from '@/features/xodimlar/xodimlarData'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { positionSlice } from '@/features/malumotnomalar/referenceEntities'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import TashkilotPickerModal from './TashkilotPickerModal'

// "Ishga olish"/"Tahrirlash" oynalarida takror ishlatiladigan maydonlar to'plami
// (RecruitmentDismissal hujjatining maydonlari) — Xodimlar ro'yxati, xodim detali va
// Foydalanuvchilar detali barchasi shu bir xil qatorlarni ko'rsatadi.

// Figma dev-mode spec (Xodim/Tashkilot/Filial va h.k.): maydon 36px ("control" o'lcham),
// radius 8, border 1px #E5E5E5, shadow 0px 1px 2px #0000001A, padding 4/12/4/12. Avval bu
// h-11/rounded-lg/faqat border-rangi (border KENGLIGI'siz) edi — border-kenglik utilitasi
// yo'qligi sababli brauzerning o'z ("native") tugma/select ko'rinishi ko'rinib qolardi
// (qalin qora chegara + tўliq dumaloq burchak) — shuning uchun `border` (1px) va
// `appearance-none` endi majburiy qo'shildi.
export const fieldCls =
  'h-9 w-full appearance-none rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
export const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

// Bir xil "control" o'lcham — RecruitmentModal'ning ham bitta, ham bir nechta xodim (navbat)
// rejimlarida ishlatiladi.
export const compactFieldCls =
  'h-9 w-full appearance-none rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
export const compactLabelCls = 'mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground'

// "Xodimni ishga olish" oynasining sarlavha qatori — Figma: chap tarafda sarlavha, o'ng
// tarafda oddiy yopish (X) tugmasi. Pager YO'Q — bitta va bir nechta xodim ishga olish bir xil
// oddiy sarlavhaga ega (dev-mode screenshotlar bilan tasdiqlangan: "Xodim" maydoni bosilganda
// ochiladigan tanlash oynasigina bitta/ko'p tanlash rejimi bilan farqlanadi, oynaning o'zi emas).
export function HireModalHeader({ title, onClose }) {
  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 px-6">
      <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Yopish"
        className="flex size-8 items-center justify-center rounded-md text-[#525252] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] dark:text-white/70 dark:hover:bg-white/10"
      >
        <X className="size-5" />
      </button>
    </div>
  )
}

// Footer tugmalari — RecruitmentModal'ning barcha rejimlarida bir xil (109px, 36px).
export const hireFooterBtnCls =
  'h-9 w-[109px] gap-1.5 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white'

// Tahrirlash oynalarida "Saqlash" faqat draft dastlabki holatdan farq qilganda yoqiladi
// (Figma: bo'sh joyda Saqlash o'chiq turadi, o'zgartirilgach yoqiladi).
export function isDraftDirty(draft, initialDraft) {
  return JSON.stringify(draft) !== JSON.stringify(initialDraft)
}

// "DD.MM.YYYY" -> "YYYY-MM-DD" (backend rec_dism_date shakli)
export function toIsoDate(dmy) {
  const n = dmyToNum(dmy)
  if (n == null) return ''
  const s = String(n)
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

export const EMPTY_HIRE_DRAFT = {
  tashkilot: '',
  filial: '',
  lavozim: '',
  kartaRaqami: '',
  ishHaqiTuri: 'fixed_amount',
  ishHaqiSummasi: '',
  ishHaqiFoizi: '',
  ishgaOlinganSana: '',
  qoshimchaSumma: '',
  qoshimchaFoizi: '',
}

// Mavjud xodimning joriy (yoki oxirgi) hujjatidan draft tuzadi — Tahrirlash/Qayta ishga olishda.
export function hireDraftFromXodim(employee) {
  if (!employee) return EMPTY_HIRE_DRAFT
  return {
    tashkilot: employee.tashkilotId ?? '',
    filial: employee.filialId ?? '',
    lavozim: employee.lavozimId ?? '',
    kartaRaqami: employee.kartaRaqami ?? '',
    ishHaqiTuri: employee.ishHaqiTuri ?? 'fixed_amount',
    ishHaqiSummasi: employee.ishHaqiSummasi ? maskMoney(String(employee.ishHaqiSummasi)) : '',
    ishHaqiFoizi: employee.ishHaqiFoizi ? String(employee.ishHaqiFoizi) : '',
    ishgaOlinganSana: employee.ishgaOlinganSana ?? '',
    qoshimchaSumma: employee.qoshimchaSumma ? maskMoney(String(employee.qoshimchaSumma)) : '',
    qoshimchaFoizi: employee.qoshimchaFoizi ? String(employee.qoshimchaFoizi) : '',
  }
}

// Backend `card_number`ni MAJBURIY va bo'sh bo'lmagan (minLength 1) qilib talab qiladi —
// avtomatik generatsiya qilmaydi (avvalgi taxmin noto'g'ri chiqdi, bo'sh yuborilsa 400 qaytaradi).
// Maydon UI'da hali ham o'zgarmas/disabled turadi (Figma: "Saqlangandan so'ng avtomatik
// beriladi"), shuning uchun buni foydalanuvchi o'rniga shu yerda, saqlash paytida generatsiya
// qilamiz — backend hech qanday generatsiya/tekshirish qilmagani uchun global unikallik
// kafolatlanmaydi, lekin amaliyotda to'qnashuv ehtimoli juda past.
export function generateCardNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000)
  return `AC-${digits}`
}

export function buildHireValues(draft) {
  return {
    tashkilot: draft.tashkilot,
    filial: draft.filial,
    lavozim: draft.lavozim,
    kartaRaqami: draft.kartaRaqami.trim() || generateCardNumber(),
    ishHaqiTuri: draft.ishHaqiTuri,
    ishHaqiSummasi: Number(unmaskMoney(draft.ishHaqiSummasi)) || 0,
    ishHaqiFoizi: Number(draft.ishHaqiFoizi) || 0,
    // toIsoDate allaqachon ISO ("YYYY-MM-DD") qaytaradi — oldin bu yerda formatDate() bilan
    // yana bir marta (noto'g'ri) DD.MM.YYYY'ga o'girib qo'yilardi, backend esa ISO kutadi.
    ishgaOlinganSana: toIsoDate(draft.ishgaOlinganSana) || new Date().toISOString().slice(0, 10),
    qoshimchaSumma: Number(unmaskMoney(draft.qoshimchaSumma)) || 0,
    qoshimchaFoizi: Number(draft.qoshimchaFoizi) || 0,
  }
}

// Karta raqami saqlangandan keyin backend tomonidan avtomatik beriladi (foydalanuvchi
// qo'lda kiritmaydi) — shuning uchun majburiy maydonlar ro'yxatida emas.
export function isHireDraftValid(draft) {
  return !!draft.tashkilot && !!draft.filial && !!draft.lavozim && !!draft.ishgaOlinganSana
}

export function Picker({ value, onChange, placeholder, options, disabled, compact }) {
  return (
    <Select value={value || '__none'} onValueChange={(v) => onChange(v === '__none' ? '' : v)} disabled={disabled}>
      <SelectTrigger className={cn(compact ? compactFieldCls : fieldCls, disabled && 'opacity-60')}>
        <SelectValue>
          {(v) => {
            if (v === '__none') return <span className="text-[#737373]">{placeholder}</span>
            return options.find((o) => o.id === v)?.name ?? ''
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Reference katalog (tashkilot/filial/lavozim) hooklari — komponent ochilganda bir marta yuklaydi.
export function useHireCatalogs(open) {
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const orgsStatus = useSelector((s) => s.tashkilotlar.listStatus)
  const branches = useSelector((s) => s.filiallar.list)
  const branchesStatus = useSelector((s) => s.filiallar.listStatus)
  const positions = useSelector((s) => s.lavozimlar.list)
  const positionsStatus = useSelector((s) => s.lavozimlar.listStatus)

  useEffect(() => {
    if (!open) return
    if (orgsStatus === 'idle') dispatch(fetchOrganizations())
    if (branchesStatus === 'idle') dispatch(fetchBranches())
    if (positionsStatus === 'idle') dispatch(positionSlice.fetchItems())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatch])

  return { orgs, branches, positions }
}

// Tashkilot → Filial → Lavozim → Karta → Ish haqi turi/(summasi yoki foizi) → Ishga olingan sana →
// Qo'shimcha summa/foizi — RecruitmentDismissal'ning to'liq maydonlar to'plami.
// compact: true — "Xodimni ishga olish" pager oynasining Figma dev-spec o'lchamlari (36px maydon,
// 12px label). false/undefined — odatiy Tahrirlash oynasi (44px maydon).
export default function RecruitmentFieldsGrid({ draft, set, orgs, branches, positions, compact }) {
  const [tashkilotPickerOpen, setTashkilotPickerOpen] = useState(false)
  const filialOptions = useMemo(
    () => branches.filter((b) => b.tashkilotId === draft.tashkilot),
    [branches, draft.tashkilot]
  )
  const isFoiz = draft.ishHaqiTuri === 'sales_percent'
  const fCls = compact ? compactFieldCls : fieldCls
  const lCls = compact ? compactLabelCls : labelCls
  const tashkilotName = orgs.find((o) => o.id === draft.tashkilot)?.name

  return (
    <div className={cn('grid grid-cols-2', compact ? 'gap-x-4 gap-y-4' : 'gap-x-6 gap-y-5')}>
      <div>
        <Label className={lCls}>Tashkilot</Label>
        {/* Figma: "Tashkilot" bosilganda oddiy dropdown emas, izlab-tanlash oynasi (TashkilotPickerModal) ochiladi. */}
        <button
          type="button"
          onClick={() => setTashkilotPickerOpen(true)}
          className={cn(fCls, 'flex items-center justify-between text-left')}
        >
          <span className={cn('truncate', !tashkilotName && 'text-[#737373]')}>{tashkilotName || 'Tashkilotni tanlang'}</span>
          <ChevronDown className={cn('shrink-0 text-[#737373]', compact ? 'size-3.5' : 'size-4')} />
        </button>
        <TashkilotPickerModal
          open={tashkilotPickerOpen}
          onOpenChange={setTashkilotPickerOpen}
          organizations={orgs}
          onConfirm={(id) => set('tashkilot', id)}
        />
      </div>
      <div>
        <Label className={lCls}>Filial</Label>
        <Picker
          value={draft.filial}
          onChange={(v) => set('filial', v)}
          placeholder={draft.tashkilot ? 'Filialni tanlang' : 'Avval tashkilotni tanlang'}
          options={filialOptions}
          disabled={!draft.tashkilot}
          compact={compact}
        />
      </div>

      <div>
        <Label className={lCls}>Lavozim</Label>
        <Picker value={draft.lavozim} onChange={(v) => set('lavozim', v)} placeholder="Lavozimni tanlang" options={positions} compact={compact} />
      </div>
      <div>
        <Label className={lCls}>Karta raqami (Tabeliy nomer)</Label>
        {/* Saqlangandan keyin backend tomonidan avtomatik beriladi — shuning uchun har doim disabled. */}
        <div className="relative">
          <Input
            value={draft.kartaRaqami}
            readOnly
            disabled
            placeholder="Saqlangandan so‘ng avtomatik beriladi"
            className={cn(fCls, 'pr-10 disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:opacity-100 dark:disabled:bg-white/5')}
          />
          <QrCode
            className={cn(
              'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#A3A3A3]',
              compact ? 'right-3 h-3.5 w-3.5' : 'right-3.5 h-4 w-4'
            )}
          />
        </div>
      </div>

      <div>
        <Label className={lCls}>Ish haqi turi</Label>
        <Select value={draft.ishHaqiTuri} onValueChange={(v) => set('ishHaqiTuri', v)}>
          <SelectTrigger className={fCls}>
            <SelectValue>{(v) => ISH_HAQI_TURLARI.find((t) => t.value === v)?.label ?? ''}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ISH_HAQI_TURLARI.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isFoiz ? (
        <div>
          <Label className={lCls}>Ish haqi foizi, %</Label>
          <Input
            value={draft.ishHaqiFoizi}
            onChange={(e) => set('ishHaqiFoizi', e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0"
            className={fCls}
          />
        </div>
      ) : (
        <div>
          <Label className={lCls}>Ish haqi summasi, UZS</Label>
          <Input
            value={draft.ishHaqiSummasi}
            onChange={(e) => set('ishHaqiSummasi', maskMoney(e.target.value))}
            inputMode="decimal"
            placeholder="0"
            className={fCls}
          />
        </div>
      )}

      <div>
        <Label className={lCls}>Ishga olingan sana</Label>
        <Input
          value={draft.ishgaOlinganSana}
          onChange={(e) => set('ishgaOlinganSana', maskDate(e.target.value))}
          placeholder="DD.MM.YYYY"
          inputMode="numeric"
          className={fCls}
        />
      </div>
      <div>
        <Label className={lCls}>Qo‘shimcha summa, UZS</Label>
        <Input
          value={draft.qoshimchaSumma}
          onChange={(e) => set('qoshimchaSumma', maskMoney(e.target.value))}
          inputMode="decimal"
          placeholder="0"
          className={fCls}
        />
      </div>

      <div>
        <Label className={lCls}>Qo‘shimcha foizi, %</Label>
        <Input
          value={draft.qoshimchaFoizi}
          onChange={(e) => set('qoshimchaFoizi', e.target.value.replace(/[^\d.]/g, ''))}
          inputMode="decimal"
          placeholder="0"
          className={fCls}
        />
      </div>
    </div>
  )
}
