import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUzPhone } from '@/lib/format'
import { FILIAL_TURLARI, TASHKILOT_NOMLARI, VILOYATLAR, TUMANLAR } from '@/features/filiallar/filiallarData'
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

const EMPTY = { name: '', tashkilot: '', turi: '', viloyat: '', tuman: '', manzil: '', phone: '' }
const KEYS = Object.keys(EMPTY)

function Picker({ value, onChange, placeholder, options, disabled }) {
  return (
    <Select value={value || '__none'} onValueChange={(v) => onChange(v === '__none' ? '' : v)} disabled={disabled}>
      <SelectTrigger className={cn(fieldCls, disabled && 'opacity-60')}>
        <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">{placeholder}</span> : v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

export default function BranchModal({ open, onOpenChange, branch, onSave }) {
  const isEdit = !!branch
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (branch) {
      const base = {}
      KEYS.forEach((k) => { base[k] = branch[k] ?? '' })
      setDraft(base)
    } else {
      setDraft(EMPTY)
    }
  }, [open, branch])

  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'viloyat' && v !== d.viloyat) next.tuman = ''
    return next
  })

  const tumanOptions = TUMANLAR[draft.viloyat] ?? []

  const dirty = useMemo(() => {
    if (!branch) return true
    return KEYS.some((k) => (draft[k] ?? '') !== (branch[k] ?? ''))
  }, [draft, branch])

  const canSave =
    dirty &&
    draft.name.trim().length > 1 &&
    !!draft.tashkilot &&
    !!draft.turi &&
    !!draft.viloyat &&
    !!draft.tuman &&
    (!draft.phone || isValidUzPhone(draft.phone))

  function handleSave() {
    onSave({ ...draft, name: draft.name.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Filialni tahrirlash' : 'Yangi filial'}
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

          <div>
            <Label className={labelCls}>Tashkilot</Label>
            <Picker value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} placeholder="Tashkilotni tanlang" options={TASHKILOT_NOMLARI} />
          </div>
          <div>
            <Label className={labelCls}>Filial turi</Label>
            <Picker value={draft.turi} onChange={(v) => set('turi', v)} placeholder="Turini tanlang" options={FILIAL_TURLARI} />
          </div>

          <div>
            <Label className={labelCls}>Viloyat</Label>
            <Picker value={draft.viloyat} onChange={(v) => set('viloyat', v)} placeholder="Viloyatni tanlang" options={VILOYATLAR} />
          </div>
          <div>
            <Label className={labelCls}>Tuman</Label>
            <Picker
              value={draft.tuman}
              onChange={(v) => set('tuman', v)}
              placeholder={draft.viloyat ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'}
              options={tumanOptions}
              disabled={!draft.viloyat}
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
