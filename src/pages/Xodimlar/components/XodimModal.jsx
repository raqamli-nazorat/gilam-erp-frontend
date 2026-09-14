import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatJshshir, formatStir, formatUzPassport, splitUzPassport } from '@/lib/format'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { fetchDistricts, fetchRegions } from '@/features/geo/geoSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// `border` (kenglik) va `appearance-none` — bo'lmasa brauzerning o'z ("native") tugma/select
// ko'rinishi orqaga chiqib qolishi mumkin (qalin qora chegara + to'liq dumaloq burchak);
// bu ikkalasi doim aniq berilishi kerak (faqat border-RANGI yetarli emas).
const fieldCls =
  'h-10 w-full appearance-none rounded-md border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

// tashkilot/viloyat/tuman/filial — backend UUID'lari (Select value'lari uchun)
const EMPTY = {
  name: '',
  phone: '',
  passport: '',
  jshshir: '',
  stir: '',
  tashkilot: '',
  viloyat: '',
  tuman: '',
  manzil: '',
  filial: '',
  active: true,
  tavsif: '',
}

function Picker({ value, onChange, placeholder, options, disabled, loading }) {
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
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#737373]">
            <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
          </div>
        ) : (
          options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

function joinPassport(seria, number) {
  return formatUzPassport(`${seria ?? ''}${number ?? ''}`)
}

// Mavjud xodimdan draft tuzadi — modal ochilganda VA "o'zgartirilmaganmi" tekshiruvida
// (dirty check) bir xil shakl ishlatilishi uchun bitta joyda.
function draftFromXodim(xodim) {
  if (!xodim) return EMPTY
  return {
    name: xodim.name ?? '',
    phone: xodim.phone ?? '',
    passport: joinPassport(xodim.passportSeria, xodim.passportNumber),
    jshshir: xodim.jshshir ?? '',
    stir: xodim.stir ?? '',
    tashkilot: xodim.tashkilotId ?? '',
    viloyat: xodim.viloyatId ?? '',
    tuman: xodim.tumanId ?? '',
    manzil: xodim.manzil ?? '',
    filial: xodim.filialId ?? '',
    active: xodim.active ?? true,
    tavsif: xodim.tavsif ?? '',
  }
}

// Xodim (Employee) shaxsiy profilini to'g'ridan-to'g'ri yaratish/tahrirlash — "Ishga olish"
// (Recruitment hujjati) siz. Lavozim/oylik/ish tarixi "Ishga qabul qilish" bo'limida alohida
// boshqariladi (bu yerda tegilmaydi).
export default function XodimModal({ open, onOpenChange, xodim, onSave }) {
  const isEdit = !!xodim
  const [draft, setDraft] = useState(EMPTY)
  const dispatch = useDispatch()

  const orgs = useSelector((s) => s.tashkilotlar.list)
  const orgsStatus = useSelector((s) => s.tashkilotlar.listStatus)
  const branches = useSelector((s) => s.filiallar.list)
  const branchesStatus = useSelector((s) => s.filiallar.listStatus)
  const regions = useSelector((s) => s.geo.regions)
  const regionsStatus = useSelector((s) => s.geo.regionsStatus)
  const districtsByRegion = useSelector((s) => s.geo.districtsByRegion)
  const districtsStatus = useSelector((s) => s.geo.districtsStatus)

  useEffect(() => {
    if (!open) return
    if (orgsStatus === 'idle') dispatch(fetchOrganizations())
    if (branchesStatus === 'idle') dispatch(fetchBranches())
    dispatch(fetchRegions())
    setDraft(draftFromXodim(xodim))
    if (xodim?.viloyatId) dispatch(fetchDistricts(xodim.viloyatId))
  }, [open, xodim, dispatch, orgsStatus, branchesStatus])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'viloyat' && v !== d.viloyat) next.tuman = ''
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  function setViloyat(regionId) {
    set('viloyat', regionId)
    if (regionId) dispatch(fetchDistricts(regionId))
  }

  const tumanOptions = districtsByRegion[draft.viloyat] ?? []
  const districtsLoading = districtsStatus[draft.viloyat] === 'loading'
  const filialOptions = useMemo(
    () => (draft.tashkilot ? branches.filter((b) => b.tashkilotId === draft.tashkilot) : branches),
    [branches, draft.tashkilot]
  )

  // Tahrirlashda hech narsa o'zgartirilmagan bo'lsa "Saqlash" o'chirilgan (kulrang) holda
  // qoladi — foydalanuvchi biror maydonni haqiqatan o'zgartirgandagina yoqiladi (ko'kga
  // o'tadi). Yangi xodim yaratishda "asl qiymat" yo'q, shuning uchun har doim "o'zgargan".
  const dirty = useMemo(() => {
    if (!xodim) return true
    const original = draftFromXodim(xodim)
    return Object.keys(EMPTY).some((k) => draft[k] !== original[k])
  }, [draft, xodim])

  const canSave = dirty && draft.name.trim().length > 1 && !!draft.tashkilot

  function handleSave() {
    const { seria, number } = splitUzPassport(draft.passport)
    onSave({ ...draft, name: draft.name.trim(), passportSeria: seria, passportNumber: number })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Xodim tahrirlash' : 'Yangi xodim'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 px-5 py-4">
          <div className="col-span-2">
            <Label className={labelCls}>F.I.SH.</Label>
            <Input
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Familiya Ism Sharif"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Telefon</Label>
            <PhoneInput value={draft.phone} onChange={(v) => set('phone', v)} className={fieldCls} />
          </div>
          <div>
            <Label className={labelCls}>Passport seriyasi va raqami</Label>
            <Input
              value={draft.passport}
              onChange={(e) => set('passport', formatUzPassport(e.target.value))}
              placeholder="AA 123 45 67"
              inputMode="text"
              maxLength={12}
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>JSHSHIR</Label>
            <Input
              value={draft.jshshir}
              onChange={(e) => set('jshshir', formatJshshir(e.target.value))}
              placeholder="31402198540012"
              inputMode="numeric"
              maxLength={14}
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>STIR</Label>
            <Input
              value={draft.stir}
              onChange={(e) => set('stir', formatStir(e.target.value))}
              placeholder="302 145 678"
              inputMode="numeric"
              maxLength={11}
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Viloyat</Label>
            <Picker
              value={draft.viloyat}
              onChange={setViloyat}
              placeholder="Viloyatni tanlang"
              options={regions}
              loading={regionsStatus === 'loading'}
            />
          </div>
          <div>
            <Label className={labelCls}>Tuman</Label>
            <Picker
              value={draft.tuman}
              onChange={(v) => set('tuman', v)}
              placeholder={draft.viloyat ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'}
              options={tumanOptions}
              disabled={!draft.viloyat}
              loading={districtsLoading}
            />
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Manzil</Label>
            <Input value={draft.manzil} onChange={(e) => set('manzil', e.target.value)} placeholder="Ko‘cha, uy" className={fieldCls} />
          </div>

          <div>
            <Label className={labelCls}>Tashkilot</Label>
            <Picker
              value={draft.tashkilot}
              onChange={(v) => set('tashkilot', v)}
              placeholder="Tashkilotni tanlang"
              options={orgs}
              loading={orgsStatus === 'loading'}
            />
          </div>
          <div>
            <Label className={labelCls}>Filial</Label>
            <Picker
              value={draft.filial}
              onChange={(v) => set('filial', v)}
              placeholder="Filialni tanlang"
              options={filialOptions}
              loading={branchesStatus === 'loading'}
            />
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Izoh</Label>
            <Input value={draft.tavsif} onChange={(e) => set('tavsif', e.target.value)} placeholder="Kiriting" className={fieldCls} />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 flex items-center justify-end gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              <Check className="h-4 w-4" /> Saqlash
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
