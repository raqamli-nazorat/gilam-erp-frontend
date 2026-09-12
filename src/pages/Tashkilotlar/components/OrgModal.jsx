import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUzPhone } from '@/lib/format'
import { fetchDistricts, fetchRegions } from '@/features/geo/geoSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
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

// viloyat/tuman bu yerda backend UUID'lari sifatida saqlanadi (Select value'lari uchun)
const EMPTY = { name: '', inn: '', phone: '', director: '', viloyat: '', tuman: '', manzil: '', titul: '' }

export default function OrgModal({ open, onOpenChange, org, onSave }) {
  const isEdit = !!org
  const [draft, setDraft] = useState(EMPTY)
  const dispatch = useDispatch()
  const regions = useSelector((s) => s.geo.regions)
  const regionsStatus = useSelector((s) => s.geo.regionsStatus)
  const districtsByRegion = useSelector((s) => s.geo.districtsByRegion)
  const districtsStatus = useSelector((s) => s.geo.districtsStatus)

  useEffect(() => {
    if (!open) return
    dispatch(fetchRegions())
    if (org) {
      setDraft({
        name: org.name ?? '',
        inn: org.inn ?? '',
        phone: org.phone ?? '',
        director: org.director ?? '',
        viloyat: org.viloyatId ?? '',
        tuman: org.tumanId ?? '',
        manzil: org.manzil ?? '',
        titul: org.titul ?? '',
      })
      if (org.viloyatId) dispatch(fetchDistricts(org.viloyatId))
    } else {
      setDraft(EMPTY)
    }
  }, [open, org, dispatch])

  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'viloyat' && v !== d.viloyat) next.tuman = ''
    return next
  })

  function setViloyat(regionId) {
    set('viloyat', regionId)
    if (regionId) dispatch(fetchDistricts(regionId))
  }

  const tumanOptions = districtsByRegion[draft.viloyat] ?? []
  const districtsLoading = districtsStatus[draft.viloyat] === 'loading'
  const innDigits = draft.inn.replace(/\D/g, '')

  const dirty = useMemo(() => {
    if (!org) return true
    return (
      draft.name !== (org.name ?? '') ||
      draft.inn !== (org.inn ?? '') ||
      draft.phone !== (org.phone ?? '') ||
      draft.director !== (org.director ?? '') ||
      draft.viloyat !== (org.viloyatId ?? '') ||
      draft.tuman !== (org.tumanId ?? '') ||
      draft.manzil !== (org.manzil ?? '') ||
      draft.titul !== (org.titul ?? '')
    )
  }, [draft, org])

  const canSave =
    dirty &&
    draft.name.trim().length > 1 &&
    innDigits.length === 9 &&
    draft.director.trim().length > 1 &&
    !!draft.viloyat &&
    !!draft.tuman &&
    (!draft.phone || isValidUzPhone(draft.phone))

  function handleSave() {
    onSave({ ...draft, inn: innDigits, name: draft.name.trim(), director: draft.director.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Tahrirlash' : 'Yangi tashkilot'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pb-4 pt-2">
          <div className="col-span-2">
            <Label className={labelCls}>Tashkilot nomi</Label>
            <Input
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Masalan: SAG Gilamlari"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>INN</Label>
            <Input
              value={draft.inn}
              onChange={(e) => set('inn', e.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              placeholder="9 ta raqam"
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Telefon</Label>
            <PhoneInput
              value={draft.phone}
              onChange={(v) => set('phone', v)}
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Direktor</Label>
            <Input
              value={draft.director}
              onChange={(e) => set('director', e.target.value)}
              placeholder="F.I.SH."
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Titul</Label>
            <Input
              value={draft.titul}
              onChange={(e) => set('titul', e.target.value)}
              placeholder="Masalan: SAG"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Viloyat</Label>
            <Select value={draft.viloyat || '__none'} onValueChange={(v) => setViloyat(v === '__none' ? '' : v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>
                  {(v) => {
                    if (v === '__none') return <span className="text-[#737373]">Viloyatni tanlang</span>
                    return regions.find((r) => r.id === v)?.name ?? ''
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {regionsStatus === 'loading' ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#737373]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
                  </div>
                ) : (
                  regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={labelCls}>Tuman</Label>
            <Select
              value={draft.tuman || '__none'}
              onValueChange={(v) => set('tuman', v === '__none' ? '' : v)}
              disabled={!draft.viloyat}
            >
              <SelectTrigger className={cn(fieldCls, !draft.viloyat && 'opacity-60')}>
                <SelectValue>
                  {(v) => {
                    if (v === '__none') {
                      return <span className="text-[#737373]">{draft.viloyat ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'}</span>
                    }
                    return tumanOptions.find((t) => t.id === v)?.name ?? ''
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {districtsLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#737373]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
                  </div>
                ) : (
                  tumanOptions.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Manzil</Label>
            <Input
              value={draft.manzil}
              onChange={(e) => set('manzil', e.target.value)}
              placeholder="Ko‘cha, uy"
              className={fieldCls}
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2.5 rounded-b-[20px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 gap-2 rounded-lg border border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-11 gap-2 rounded-lg bg-[#0052D2] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
