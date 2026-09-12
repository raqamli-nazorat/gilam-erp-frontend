import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskDate } from '@/components/ui/filter-modal'
import { formatDate, dmyToNum } from '@/lib/format'
import { ISH_HAQI_TURLARI } from '@/features/xodimlar/xodimlarData'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { positionSlice } from '@/features/malumotnomalar/referenceEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fieldCls =
  'h-11 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

// "DD.MM.YYYY" -> "YYYY-MM-DD" (backend rec_dism_date shakli)
function toIsoDate(dmy) {
  const n = dmyToNum(dmy)
  if (n == null) return ''
  const s = String(n)
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

const EMPTY = {
  name: '',
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
  manzil: '',
  passportSeria: '',
  passportNumber: '',
  jshshir: '',
  stir: '',
  phone: '',
}

function Picker({ value, onChange, placeholder, options, disabled }) {
  return (
    <Select value={value || '__none'} onValueChange={(v) => onChange(v === '__none' ? '' : v)} disabled={disabled}>
      <SelectTrigger className={cn(fieldCls, disabled && 'opacity-60')}>
        <SelectValue>
          {(v) => {
            if (v === '__none') return <span className="text-[#737373]">{placeholder}</span>
            return options.find((o) => o.id === v)?.name ?? ''
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

// employee: null (yangi xodim — Employee + "Ishga olish" hujjati birga yaratiladi) | mavjud xodim (tahrirlash)
export default function HireEmployeeModal({ open, onOpenChange, employee, onSave }) {
  const isEdit = !!employee
  const dispatch = useDispatch()
  const [draft, setDraft] = useState(EMPTY)

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
    if (employee) {
      setDraft({
        name: employee.name ?? '',
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
        manzil: employee.manzil ?? '',
        passportSeria: employee.passportSeria ?? '',
        passportNumber: employee.passportNumber ?? '',
        jshshir: employee.jshshir ?? '',
        stir: employee.stir ?? '',
        phone: employee.phone ?? '',
      })
    } else {
      setDraft(EMPTY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee, dispatch, orgsStatus, branchesStatus, positionsStatus])

  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
    return next
  })

  const filialOptions = useMemo(
    () => branches.filter((b) => b.tashkilotId === draft.tashkilot),
    [branches, draft.tashkilot]
  )

  const isFoiz = draft.ishHaqiTuri === 'sales_percent'

  // Tahrirlashda faqat xodim profili (F.I.SH./aloqa/hujjatlar) o'zgaradi — lavozim/oylik/karta
  // "Ishga olish" hujjatiga tegishli va faqat Ishdan chiqarish + Qayta ishga olish orqali yangilanadi.
  const canSave = isEdit
    ? draft.name.trim().length > 1 && !!draft.tashkilot && !!draft.filial
    : draft.name.trim().length > 1 &&
      !!draft.tashkilot &&
      !!draft.filial &&
      !!draft.lavozim &&
      !!draft.kartaRaqami.trim() &&
      !!draft.ishgaOlinganSana

  function buildValues() {
    return {
      name: draft.name.trim(),
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
      manzil: draft.manzil,
      passportSeria: draft.passportSeria,
      passportNumber: draft.passportNumber,
      jshshir: draft.jshshir,
      stir: draft.stir,
      phone: draft.phone,
    }
  }

  function handleSave() {
    onSave(buildValues())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[640px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Xodimni tahrirlash' : 'Xodimni ishga olish'}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto px-6 pb-4 pt-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <Label className={labelCls}>F.I.SH.</Label>
              <Input
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Masalan: Karimov Sanjar"
                className={fieldCls}
              />
            </div>

            <div>
              <Label className={labelCls}>Tashkilot</Label>
              <Picker value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} placeholder="Tashkilotni tanlang" options={orgs} />
            </div>
            <div>
              <Label className={labelCls}>Filial</Label>
              <Picker
                value={draft.filial}
                onChange={(v) => set('filial', v)}
                placeholder={draft.tashkilot ? 'Filialni tanlang' : 'Avval tashkilotni tanlang'}
                options={filialOptions}
                disabled={!draft.tashkilot}
              />
            </div>

            {!isEdit && (
              <>
                <div>
                  <Label className={labelCls}>Lavozim</Label>
                  <Picker value={draft.lavozim} onChange={(v) => set('lavozim', v)} placeholder="Lavozimni tanlang" options={positions} />
                </div>
                <div>
                  <Label className={labelCls}>Karta raqami (Tabeliy nomer)</Label>
                  <div className="relative">
                    <Input
                      value={draft.kartaRaqami}
                      onChange={(e) => set('kartaRaqami', e.target.value)}
                      placeholder="AC-000000"
                      className={cn(fieldCls, 'pr-10')}
                    />
                    <QrCode className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                  </div>
                </div>

                <div>
                  <Label className={labelCls}>Ish haqi turi</Label>
                  <Select value={draft.ishHaqiTuri} onValueChange={(v) => set('ishHaqiTuri', v)}>
                    <SelectTrigger className={fieldCls}>
                      <SelectValue>{(v) => ISH_HAQI_TURLARI.find((t) => t.value === v)?.label ?? ''}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ISH_HAQI_TURLARI.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {isFoiz ? (
                  <div>
                    <Label className={labelCls}>Ish haqi foizi, %</Label>
                    <Input
                      value={draft.ishHaqiFoizi}
                      onChange={(e) => set('ishHaqiFoizi', e.target.value.replace(/[^\d.]/g, ''))}
                      inputMode="decimal"
                      placeholder="0"
                      className={fieldCls}
                    />
                  </div>
                ) : (
                  <div>
                    <Label className={labelCls}>Ish haqi summasi, UZS</Label>
                    <Input
                      value={draft.ishHaqiSummasi}
                      onChange={(e) => set('ishHaqiSummasi', e.target.value.replace(/[^\d]/g, ''))}
                      inputMode="numeric"
                      placeholder="0"
                      className={fieldCls}
                    />
                  </div>
                )}

                <div>
                  <Label className={labelCls}>Ishga olingan sana</Label>
                  <Input
                    value={draft.ishgaOlinganSana}
                    onChange={(e) => set('ishgaOlinganSana', maskDate(e.target.value))}
                    placeholder="DD.MM.YYYY"
                    inputMode="numeric"
                    className={fieldCls}
                  />
                </div>
              </>
            )}
            <div>
              <Label className={labelCls}>Telefon</Label>
              <Input
                value={draft.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+998 90 123-45-67"
                className={fieldCls}
              />
            </div>

            {!isEdit && (
              <>
                <div>
                  <Label className={labelCls}>Qo‘shimcha summa, UZS</Label>
                  <Input
                    value={draft.qoshimchaSumma}
                    onChange={(e) => set('qoshimchaSumma', e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    placeholder="0"
                    className={fieldCls}
                  />
                </div>
                <div>
                  <Label className={labelCls}>Qo‘shimcha foizi, %</Label>
                  <Input
                    value={draft.qoshimchaFoizi}
                    onChange={(e) => set('qoshimchaFoizi', e.target.value.replace(/[^\d.]/g, ''))}
                    inputMode="decimal"
                    placeholder="0"
                    className={fieldCls}
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <Label className={labelCls}>Manzil</Label>
              <Input
                value={draft.manzil}
                onChange={(e) => set('manzil', e.target.value)}
                placeholder="Ko‘cha, uy"
                className={fieldCls}
              />
            </div>

            <div>
              <Label className={labelCls}>Passport seriyasi</Label>
              <Input
                value={draft.passportSeria}
                onChange={(e) => set('passportSeria', e.target.value.toUpperCase())}
                placeholder="AD"
                className={fieldCls}
              />
            </div>
            <div>
              <Label className={labelCls}>Passport raqami</Label>
              <Input
                value={draft.passportNumber}
                onChange={(e) => set('passportNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="1234567"
                className={fieldCls}
              />
            </div>

            <div>
              <Label className={labelCls}>JSHSHIR</Label>
              <Input
                value={draft.jshshir}
                onChange={(e) => set('jshshir', e.target.value.replace(/\D/g, ''))}
                placeholder="14 ta raqam"
                className={fieldCls}
              />
            </div>
            <div>
              <Label className={labelCls}>STIR</Label>
              <Input
                value={draft.stir}
                onChange={(e) => set('stir', e.target.value.replace(/\D/g, ''))}
                placeholder="STIR"
                className={fieldCls}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2.5 rounded-b-[20px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 gap-2 rounded-lg border border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-11 gap-2 rounded-lg bg-[#0052D2] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> {isEdit ? 'Saqlash' : 'Ishga olish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
