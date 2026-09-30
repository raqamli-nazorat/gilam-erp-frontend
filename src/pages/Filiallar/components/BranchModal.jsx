import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { isValidUzPhone } from '@/lib/format'
import { PagedSelect } from '@/components/ui/paged-select'
import { districtOptions, organizationOptions, regionOptions } from '@/services/optionSources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Label } from '@/components/ui/label'
import BranchLocationMap, { findCoordsByRegionName } from '@/components/BranchLocationMap'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const fieldCls =
  'h-9 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

// tashkilot/viloyat/tuman bu yerda backend UUID'lari sifatida saqlanadi
const EMPTY = {
  name: '',
  tashkilot: '',
  tashkilotName: '',
  viloyat: '',
  viloyatName: '',
  tuman: '',
  tumanName: '',
  manzil: '',
  latitude: '41.2995',
  longitude: '69.2401',
  radius: 150,
  phone: '',
}

export default function BranchModal({ open, onOpenChange, branch, onSave }) {
  const isEdit = !!branch
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (branch) {
      const lat = branch.latitude && Number(branch.latitude) !== 0 ? String(branch.latitude) : '41.2995'
      const lng = branch.longitude && Number(branch.longitude) !== 0 ? String(branch.longitude) : '69.2401'
      const rad = Number(branch.radius) || 150
      setDraft({
        name: branch.name ?? '',
        tashkilot: branch.tashkilotId ?? '',
        tashkilotName: typeof branch.tashkilot === 'object' ? branch.tashkilot?.name ?? '' : branch.tashkilot ?? '',
        viloyat: branch.viloyatId ?? '',
        viloyatName: typeof branch.viloyat === 'object' ? branch.viloyat?.name ?? '' : branch.viloyat ?? '',
        tuman: branch.tumanId ?? '',
        tumanName: typeof branch.tuman === 'object' ? branch.tuman?.name ?? '' : branch.tuman ?? '',
        manzil: branch.manzil ?? '',
        latitude: lat,
        longitude: lng,
        radius: rad,
        phone: branch.phone ?? '',
      })
    } else {
      setDraft(EMPTY)
    }
  }, [open, branch])

  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'viloyat' && v !== d.viloyat) {
      next.tuman = ''
      next.tumanName = ''
    }
    return next
  })

  const dirty = useMemo(() => {
    if (!branch) return true
    return (
      draft.name !== (branch.name ?? '') ||
      draft.tashkilot !== (branch.tashkilotId ?? '') ||
      draft.viloyat !== (branch.viloyatId ?? '') ||
      draft.tuman !== (branch.tumanId ?? '') ||
      draft.manzil !== (branch.manzil ?? '') ||
      draft.latitude !== (branch.latitude ?? '') ||
      draft.longitude !== (branch.longitude ?? '') ||
      draft.radius !== (branch.radius ?? 150) ||
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

  const handleMapChange = useCallback(({ latitude, longitude, radius }) => {
    setDraft((d) => ({
      ...d,
      latitude,
      longitude,
      radius,
    }))
  }, [])

  function handleSave() {
    onSave({ ...draft, name: draft.name.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Tahrirlash' : 'Yangi filial'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[calc(85vh-130px)] grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto px-6 pb-4 pt-2">
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
            <PagedSelect
              value={draft.tashkilot}
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  tashkilot: v,
                  tashkilotName: item?.name ?? '',
                }))
              }
              fetchPage={organizationOptions}
              selectedLabel={draft.tashkilotName}
              placeholder="Tashkilotni tanlang"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Viloyat</Label>
            <PagedSelect
              value={draft.viloyat}
              onChange={(v, item) => {
                const regName = item?.name ?? ''
                const coords = findCoordsByRegionName(regName)
                setDraft((d) => ({
                  ...d,
                  viloyat: v,
                  viloyatName: regName,
                  ...(coords ? { latitude: coords[0].toFixed(7), longitude: coords[1].toFixed(7) } : {}),
                  ...(v !== d.viloyat && { tuman: '', tumanName: '' }),
                }))
              }}
              fetchPage={regionOptions}
              selectedLabel={draft.viloyatName}
              placeholder="Viloyatni tanlang"
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Tuman</Label>
            <PagedSelect
              value={draft.tuman}
              onChange={(v, item) => {
                const tumName = item?.name ?? ''
                const coords = findCoordsByRegionName(tumName)
                setDraft((d) => ({
                  ...d,
                  tuman: v,
                  tumanName: tumName,
                  ...(coords ? { latitude: coords[0].toFixed(7), longitude: coords[1].toFixed(7) } : {}),
                }))
              }}
              fetchPage={districtOptions}
              params={draft.viloyat ? { region: draft.viloyat } : undefined}
              disabled={!draft.viloyat}
              selectedLabel={draft.tumanName}
              placeholder={draft.viloyat ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'}
              className={fieldCls}
            />
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Manzil</Label>
            <Input value={draft.manzil} onChange={(e) => set('manzil', e.target.value)} placeholder="Ko‘cha, uy" className={fieldCls} />
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Joylashuv (xarita)</Label>
            <BranchLocationMap
              latitude={draft.latitude}
              longitude={draft.longitude}
              radius={draft.radius}
              interactive
              onChange={handleMapChange}
              className="h-[180px] w-full rounded-lg border border-[#E5E5E5] dark:border-white/10"
            />
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

