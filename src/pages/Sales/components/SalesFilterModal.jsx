import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { FilterResetIcon } from '@/components/ui/icons'
import { SALE_AGENTS, SALE_COUNTERPARTIES } from '@/features/sales/salesMockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
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

export const EMPTY_SALES_FILTERS = {
  from: '',
  to: '',
  counterparty: '',
  agent: '',
  contract: '',
  paid: false,
  partial: false,
  debt: false,
  paidMin: '',
  paidMax: '',
}

const inputCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function SalesFilterModal({ open, onOpenChange, filters, onApply }) {
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
      <DialogContent className="gap-[14px] rounded-[12px] px-6 py-5 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between pb-1">
          <DialogTitle className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
            Filtr
          </DialogTitle>
          <button
            type="button"
            onClick={() => setDraft(EMPTY_SALES_FILTERS)}
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
              <Label className={labelCls}>Kontragent</Label>
              <Select value={draft.counterparty || '__all'} onValueChange={(v) => set('counterparty', v === '__all' ? '' : v)}>
                <SelectTrigger className={inputCls}>
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {SALE_COUNTERPARTIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Agent</Label>
              <Select value={draft.agent || '__all'} onValueChange={(v) => set('agent', v === '__all' ? '' : v)}>
                <SelectTrigger className={inputCls}>
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {SALE_AGENTS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Shartnoma</Label>
              <Input
                placeholder="SH- raqami"
                value={draft.contract}
                onChange={(e) => set('contract', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <Label className={labelCls}>To'lov holati</Label>
              <div className="flex flex-col gap-1.5 pt-1">
                {[
                  ['paid', "To'langan"],
                  ['partial', 'Qisman'],
                  ['debt', 'Qarz'],
                ].map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-[14px] font-normal text-[#0A0A0A] dark:text-white">
                    <Checkbox checked={draft[key]} onCheckedChange={(v) => set(key, !!v)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className={labelCls}>To'langan, %</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <NumberInput decimals={false} placeholder="0" value={draft.paidMin} onChange={(e) => set('paidMin', e.target.value)} className={inputCls} />
              <NumberInput decimals={false} placeholder="99" value={draft.paidMax} onChange={(e) => set('paidMax', e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-1 gap-2 border-0 bg-transparent p-0 sm:justify-end">
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
