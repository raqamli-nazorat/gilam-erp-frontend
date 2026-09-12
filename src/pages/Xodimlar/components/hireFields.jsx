import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskDate } from '@/components/ui/filter-modal'
import { formatDate, dmyToNum } from '@/lib/format'
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

// "Ishga olish"/"Tahrirlash" oynalarida takror ishlatiladigan maydonlar to'plami
// (RecruitmentDismissal hujjatining maydonlari) — Xodimlar ro'yxati, xodim detali va
// Foydalanuvchilar detali barchasi shu bir xil qatorlarni ko'rsatadi.

export const fieldCls =
  'h-11 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
export const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

// Figma dev-mode spec ("Xodimni ishga olish" pager oynasi): maydon 36px ("control" o'lcham),
// radius 8, border 1px #E5E5E5, shadow 0px 1px 2px #0000001A, padding 4/12/4/12.
export const compactFieldCls =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
export const compactLabelCls = 'mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground'

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
    ishHaqiSummasi: employee.ishHaqiSummasi ? String(employee.ishHaqiSummasi) : '',
    ishHaqiFoizi: employee.ishHaqiFoizi ? String(employee.ishHaqiFoizi) : '',
    ishgaOlinganSana: employee.ishgaOlinganSana ?? '',
    qoshimchaSumma: employee.qoshimchaSumma ? String(employee.qoshimchaSumma) : '',
    qoshimchaFoizi: employee.qoshimchaFoizi ? String(employee.qoshimchaFoizi) : '',
  }
}

export function buildHireValues(draft) {
  return {
    tashkilot: draft.tashkilot,
    filial: draft.filial,
    lavozim: draft.lavozim,
    kartaRaqami: draft.kartaRaqami.trim(),
    ishHaqiTuri: draft.ishHaqiTuri,
    ishHaqiSummasi: Number(draft.ishHaqiSummasi) || 0,
    ishHaqiFoizi: Number(draft.ishHaqiFoizi) || 0,
    ishgaOlinganSana: toIsoDate(draft.ishgaOlinganSana) || formatDate(new Date().toISOString().slice(0, 10)),
    qoshimchaSumma: Number(draft.qoshimchaSumma) || 0,
    qoshimchaFoizi: Number(draft.qoshimchaFoizi) || 0,
  }
}

export function isHireDraftValid(draft) {
  return !!draft.tashkilot && !!draft.filial && !!draft.lavozim && !!draft.kartaRaqami.trim() && !!draft.ishgaOlinganSana
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
  const filialOptions = useMemo(
    () => branches.filter((b) => b.tashkilotId === draft.tashkilot),
    [branches, draft.tashkilot]
  )
  const isFoiz = draft.ishHaqiTuri === 'sales_percent'
  const fCls = compact ? compactFieldCls : fieldCls
  const lCls = compact ? compactLabelCls : labelCls

  return (
    <div className={cn('grid grid-cols-2', compact ? 'gap-x-4 gap-y-4' : 'gap-x-6 gap-y-5')}>
      <div>
        <Label className={lCls}>Tashkilot</Label>
        <Picker value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} placeholder="Tashkilotni tanlang" options={orgs} compact={compact} />
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
        <div className="relative">
          <Input
            value={draft.kartaRaqami}
            onChange={(e) => set('kartaRaqami', e.target.value)}
            placeholder="AC-000000"
            className={cn(fCls, 'pr-10')}
          />
          <QrCode
            className={cn(
              'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#737373]',
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
            onChange={(e) => set('ishHaqiSummasi', e.target.value.replace(/[^\d]/g, ''))}
            inputMode="numeric"
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
          onChange={(e) => set('qoshimchaSumma', e.target.value.replace(/[^\d]/g, ''))}
          inputMode="numeric"
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
