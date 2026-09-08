import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { FILIALLAR_BY_TASHKILOT, ROLLAR_NOMLARI, TASHKILOT_NOMLARI } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { Button } from '@/components/ui/button'
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
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

export const EMPTY_USER_FILTERS = { tashkilot: '', filial: '', rol: '', holat: '', sana: '' }

function F({ label, value, onChange, allLabel, options, disabled }) {
  return (
    <div>
      <Label className={labelCls}>{label}</Label>
      <Select value={value || '__all'} onValueChange={(v) => onChange(v === '__all' ? '' : v)} disabled={disabled}>
        <SelectTrigger className={cnDisabled(fieldCls, disabled)}>
          <SelectValue>{(v) => (v === '__all' ? allLabel : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{allLabel}</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function cnDisabled(base, disabled) {
  return disabled ? `${base} opacity-60` : base
}

export default function UserFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => {
    const next = { ...d, [k]: v }
    if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
    return next
  })

  const filialOptions = FILIALLAR_BY_TASHKILOT[draft.tashkilot] ?? []

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] text-[#0A0A0A] dark:text-white">Filtr</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          <F label="Tashkilot" value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} allLabel="Barchasi" options={TASHKILOT_NOMLARI} />
          <F
            label="Filial"
            value={draft.filial}
            onChange={(v) => set('filial', v)}
            allLabel="Barchasi"
            options={filialOptions}
            disabled={!draft.tashkilot}
          />
          <F label="Rol" value={draft.rol} onChange={(v) => set('rol', v)} allLabel="Barchasi" options={ROLLAR_NOMLARI} />
          <F label="Holat" value={draft.holat} onChange={(v) => set('holat', v)} allLabel="Barchasi" options={['Faol', 'Bloklangan']} />
          <div className="col-span-2">
            <F
              label="Yaratilgan sana"
              value={draft.sana}
              onChange={(v) => set('sana', v)}
              allLabel="Barchasi"
              options={['Bugun', 'Shu hafta', 'Shu oy', 'Shu yil']}
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2 border-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(EMPTY_USER_FILTERS)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Tozalash
          </Button>
          <Button
            type="button"
            onClick={() => { onApply(draft); onOpenChange(false) }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo‘llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
