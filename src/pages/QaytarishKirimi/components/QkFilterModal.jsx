import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { FilterResetIcon } from '@/components/ui/icons'
import { QK_QUALITIES, QK_WAREHOUSES } from '@/features/qaytarishKirimi/qkMockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker, toISODate, fromISODate } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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

export const EMPTY_QK_FILTERS = {
  from: '',
  to: '',
  warehouse: '',
  basis: '',
  quality: '',
  entered: false,
  pending: false,
}

const inputCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function QkFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[480px]">
        <DialogHeader className="flex flex-row items-center justify-between pb-1">
          <DialogTitle className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
            Filtr
          </DialogTitle>
          <button
            type="button"
            onClick={() => setDraft(EMPTY_QK_FILTERS)}
            className="flex items-center gap-1.5 pr-6 text-[13px] font-medium leading-[18px] text-[#0052D2] transition-colors hover:underline dark:text-[#60A5FA]"
          >
            <FilterResetIcon className="h-4 w-4 text-[#0052D2] dark:text-[#60A5FA]" /> Tozalash
          </button>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div>
            <Label className={labelCls}>Sana oralig'i</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <DatePicker value={fromISODate(draft.from)} onChange={(d) => set('from', toISODate(d))} />
              <DatePicker value={fromISODate(draft.to)} onChange={(d) => set('to', toISODate(d))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Ombor</Label>
              <Select value={draft.warehouse || '__all'} onValueChange={(v) => set('warehouse', v === '__all' ? '' : v)}>
                <SelectTrigger className={inputCls}>
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {QK_WAREHOUSES.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Asos hujjat</Label>
              <Input
                placeholder="QT- raqami"
                value={draft.basis}
                onChange={(e) => set('basis', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Sifat holati</Label>
              <Select value={draft.quality || '__all'} onValueChange={(v) => set('quality', v === '__all' ? '' : v)}>
                <SelectTrigger className={inputCls}>
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {QK_QUALITIES.map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Holat</Label>
              <div className="flex flex-col gap-1.5 pt-1">
                {[
                  ['entered', 'Omborga kirdi'],
                  ['pending', 'Kutilmoqda'],
                ].map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-[14px] font-normal text-[#0A0A0A] dark:text-white">
                    <Checkbox checked={draft[key]} onCheckedChange={(v) => set(key, !!v)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(draft)
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo'llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
