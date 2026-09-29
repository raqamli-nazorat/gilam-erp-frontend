import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUzPhone } from '@/lib/format'
import { PagedSelect } from '@/components/ui/paged-select'
import { districtOptions, regionOptions } from '@/services/optionSources'
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

const fieldCls =
  'h-9 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

// viloyat/tuman bu yerda backend UUID'lari sifatida saqlanadi
const EMPTY = {
  name: '',
  inn: '',
  phone: '',
  director: '',
  viloyat: '',
  viloyatName: '',
  tuman: '',
  tumanName: '',
  manzil: '',
  titul: '',
}

export default function OrgModal({ open, onOpenChange, org, onSave }) {
  const isEdit = !!org
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (org) {
      setDraft({
        name: org.name ?? '',
        inn: org.inn ?? '',
        phone: org.phone ?? '',
        director: org.director ?? '',
        viloyat: org.viloyatId ?? '',
        viloyatName: typeof org.viloyat === 'object' ? org.viloyat?.name ?? '' : org.viloyat ?? '',
        tuman: org.tumanId ?? '',
        tumanName: typeof org.tuman === 'object' ? org.tuman?.name ?? '' : org.tuman ?? '',
        manzil: org.manzil ?? '',
        titul: org.titul ?? '',
      })
    } else {
      setDraft(EMPTY)
    }
  }, [open, org])

  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'viloyat' && v !== d.viloyat) {
      next.tuman = ''
      next.tumanName = ''
    }
    return next
  })

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
            <PagedSelect
              value={draft.viloyat}
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  viloyat: v,
                  viloyatName: item?.name ?? '',
                  ...(v !== d.viloyat && { tuman: '', tumanName: '' }),
                }))
              }
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
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  tuman: v,
                  tumanName: item?.name ?? '',
                }))
              }
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
