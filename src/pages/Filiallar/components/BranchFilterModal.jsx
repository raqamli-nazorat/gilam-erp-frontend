import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { FilterResetIcon } from '@/components/ui/icons'
import { FILIAL_TURLARI, TASHKILOT_NOMLARI, VILOYATLAR } from '@/features/filiallar/filiallarData'
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

export const EMPTY_BRANCH_FILTERS = { tashkilot: '', viloyat: '', turi: '', holat: '' }

function F({ label, value, onChange, allLabel, options }) {
  return (
    <div>
      <Label className={labelCls}>{label}</Label>
      <Select value={value || '__all'} onValueChange={(v) => onChange(v === '__all' ? '' : v)}>
        <SelectTrigger className={fieldCls}>
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

export default function BranchFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between pb-1">
          <DialogTitle className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">Filtr</DialogTitle>
          <button
            type="button"
            onClick={() => setDraft(EMPTY_BRANCH_FILTERS)}
            className="flex items-center gap-1.5 pr-6 text-[13px] font-medium text-[#0052D2] transition-colors hover:underline dark:text-[#60A5FA]"
          >
            <FilterResetIcon className="h-4 w-4 text-[#0052D2] dark:text-[#60A5FA]" /> Tozalash
          </button>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          <F label="Tashkilot" value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} allLabel="Barcha tashkilotlar" options={TASHKILOT_NOMLARI} />
          <F label="Viloyat" value={draft.viloyat} onChange={(v) => set('viloyat', v)} allLabel="Barcha viloyatlar" options={VILOYATLAR} />
          <F label="Filial turi" value={draft.turi} onChange={(v) => set('turi', v)} allLabel="Barcha turlar" options={FILIAL_TURLARI} />
          <F label="Holat" value={draft.holat} onChange={(v) => set('holat', v)} allLabel="Barcha holatlar" options={['Faol', 'Yopilgan']} />
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2 border-0 bg-transparent p-0">
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
            onClick={() => { onApply(draft); onOpenChange(false) }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo‘llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
