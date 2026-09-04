import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { FilterResetIcon } from '@/components/ui/icons'
import { VILOYATLAR } from '@/features/tashkilotlar/tashkilotlarData'
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

export const EMPTY_ORG_FILTERS = { viloyat: '', holat: '' }

export default function OrgFilterModal({ open, onOpenChange, filters, onApply }) {
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
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between pb-1">
          <DialogTitle className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">Filtr</DialogTitle>
          <button
            type="button"
            onClick={() => setDraft(EMPTY_ORG_FILTERS)}
            className="flex items-center gap-1.5 pr-6 text-[13px] font-medium text-[#0052D2] transition-colors hover:underline dark:text-[#60A5FA]"
          >
            <FilterResetIcon className="h-4 w-4 text-[#0052D2] dark:text-[#60A5FA]" /> Tozalash
          </button>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          <div>
            <Label className={labelCls}>Viloyat</Label>
            <Select value={draft.viloyat || '__all'} onValueChange={(v) => set('viloyat', v === '__all' ? '' : v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Barchasi</SelectItem>
                {VILOYATLAR.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={labelCls}>Holat</Label>
            <Select value={draft.holat || '__all'} onValueChange={(v) => set('holat', v === '__all' ? '' : v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Barchasi</SelectItem>
                <SelectItem value="Faol">Faol</SelectItem>
                <SelectItem value="To‘xtatilgan">To‘xtatilgan</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
