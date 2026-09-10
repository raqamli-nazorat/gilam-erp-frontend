import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUzPhone } from '@/lib/format'
import { FILIALLAR_BY_TASHKILOT, ROLLAR_NOMLARI, TASHKILOT_NOMLARI } from '@/features/foydalanuvchilar/foydalanuvchilarData'
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

// Yangi foydalanuvchi modali ro'yxatdagi birinchi tashkilot/filial/rol bilan ochiladi (Figma bilan bir xil)
const DEFAULT_TASHKILOT = TASHKILOT_NOMLARI[0] ?? ''
const EMPTY = {
  name: '',
  tashkilot: DEFAULT_TASHKILOT,
  filial: (FILIALLAR_BY_TASHKILOT[DEFAULT_TASHKILOT] ?? [])[0] ?? '',
  rol: ROLLAR_NOMLARI[0] ?? '',
  holat: 'Faol',
  phone: '',
  password: '',
}
const KEYS = ['name', 'tashkilot', 'filial', 'rol', 'holat', 'phone']

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

// user: null (yangi) | { ...record, holat: 'active'|'blocked' }
export default function UserModal({ open, onOpenChange, user, onSave }) {
  const isEdit = !!user
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (user) {
      setDraft({
        name: user.name ?? '',
        tashkilot: user.tashkilot ?? '',
        filial: user.filial ?? '',
        rol: user.rol ?? '',
        holat: user.holat === 'blocked' ? 'Bloklangan' : 'Faol',
        phone: user.phone ?? '',
        password: '',
      })
    } else {
      setDraft(EMPTY)
    }
  }, [open, user])

  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
    return next
  })

  const filialOptions = FILIALLAR_BY_TASHKILOT[draft.tashkilot] ?? []

  const baseline = useMemo(() => {
    if (!user) return null
    return {
      name: user.name ?? '',
      tashkilot: user.tashkilot ?? '',
      filial: user.filial ?? '',
      rol: user.rol ?? '',
      holat: user.holat === 'blocked' ? 'Bloklangan' : 'Faol',
      phone: user.phone ?? '',
    }
  }, [user])

  const dirty = useMemo(() => {
    if (!baseline) return true
    return KEYS.some((k) => (draft[k] ?? '') !== (baseline[k] ?? ''))
  }, [draft, baseline])

  const canSave =
    dirty &&
    draft.name.trim().length > 1 &&
    !!draft.tashkilot &&
    !!draft.filial &&
    !!draft.rol &&
    !!draft.phone &&
    isValidUzPhone(draft.phone) &&
    (isEdit || draft.password.trim().length >= 8)

  function handleSave() {
    const patch = {
      name: draft.name.trim(),
      tashkilot: draft.tashkilot,
      filial: draft.filial,
      rol: draft.rol,
      holat: draft.holat === 'Bloklangan' ? 'blocked' : 'active',
      phone: draft.phone,
    }
    onSave(patch)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Foydalanuvchi' : 'Yangi foydalanuvchi'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pb-4 pt-2">
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
            <Picker value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} placeholder="Tashkilotni tanlang" options={TASHKILOT_NOMLARI} />
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

          <div>
            <Label className={labelCls}>Rol</Label>
            <Picker value={draft.rol} onChange={(v) => set('rol', v)} placeholder="Rolni tanlang" options={ROLLAR_NOMLARI} />
          </div>
          <div>
            <Label className={labelCls}>Holat</Label>
            <Picker value={draft.holat} onChange={(v) => set('holat', v)} placeholder="Holatni tanlang" options={['Faol', 'Bloklangan']} />
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Telefon</Label>
            <PhoneInput value={draft.phone} onChange={(v) => set('phone', v)} className={fieldCls} />
          </div>

          {!isEdit && (
            <div className="col-span-2">
              <Label className={labelCls}>Parol</Label>
              <Input
                type="password"
                value={draft.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Kamida 8 belgi"
                className={fieldCls}
              />
            </div>
          )}
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
