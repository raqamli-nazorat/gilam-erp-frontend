import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUzPhone } from '@/lib/format'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
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

// tashkilot/viloyat/tuman bu yerda backend UUID'lari sifatida saqlanadi (Select value'lari uchun)
const EMPTY = { name: '', tashkilot: '', viloyat: '', tuman: '', manzil: '', phone: '' }

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
          options.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)
        )}
      </SelectContent>
    </Select>
  )
}

export default function BranchModal({ open, onOpenChange, branch, onSave }) {
  const isEdit = !!branch
  const [draft, setDraft] = useState(EMPTY)
  const dispatch = useDispatch()

  const orgs = useSelector((s) => s.tashkilotlar.list)
  const orgsStatus = useSelector((s) => s.tashkilotlar.listStatus)
  const regions = useSelector((s) => s.geo.regions)
  const regionsStatus = useSelector((s) => s.geo.regionsStatus)
  const districtsByRegion = useSelector((s) => s.geo.districtsByRegion)
  const districtsStatus = useSelector((s) => s.geo.districtsStatus)

  useEffect(() => {
    if (!open) return
    if (orgsStatus === 'idle') dispatch(fetchOrganizations())
    dispatch(fetchRegions())
    if (branch) {
      setDraft({
        name: branch.name ?? '',
        tashkilot: branch.tashkilotId ?? '',
        viloyat: branch.viloyatId ?? '',
        tuman: branch.tumanId ?? '',
        manzil: branch.manzil ?? '',
        phone: branch.phone ?? '',
      })
      if (branch.viloyatId) dispatch(fetchDistricts(branch.viloyatId))
    } else {
      setDraft(EMPTY)
    }
  }, [open, branch, dispatch, orgsStatus])

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

  const dirty = useMemo(() => {
    if (!branch) return true
    return (
      draft.name !== (branch.name ?? '') ||
      draft.tashkilot !== (branch.tashkilotId ?? '') ||
      draft.viloyat !== (branch.viloyatId ?? '') ||
      draft.tuman !== (branch.tumanId ?? '') ||
      draft.manzil !== (branch.manzil ?? '') ||
      draft.phone !== (branch.phone ?? '')
    )
  }, [draft, branch])

  const canSave =
    dirty &&
    draft.name.trim().length > 1 &&
    !!draft.tashkilot &&
    !!draft.viloyat &&
    !!draft.tuman &&
    (!draft.phone || isValidUzPhone(draft.phone))

  function handleSave() {
    onSave({ ...draft, name: draft.name.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Tahrirlash' : 'Yangi filial'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pb-4 pt-2">
          <div className="col-span-2">
            <Label className={labelCls}>Filial nomi</Label>
            <Input
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Masalan: Registon filiali"
              className={fieldCls}
            />
          </div>

          <div className="col-span-2">
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

          <div className="col-span-2">
            <Label className={labelCls}>Telefon</Label>
            <PhoneInput value={draft.phone} onChange={(v) => set('phone', v)} className={fieldCls} />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2.5 rounded-b-[20px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-2 rounded-xl border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-9 gap-2 rounded-xl bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
