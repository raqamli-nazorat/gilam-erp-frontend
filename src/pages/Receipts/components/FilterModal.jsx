import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Calendar03Icon, FilterResetIcon } from '@/components/ui/icons'
import { AUTHORS, COUNTERPARTIES, WAREHOUSES } from '@/features/receipts/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export const EMPTY_FILTERS = {
  from: '',
  to: '',
  warehouse: '',
  counterparty: '',
  author: '',
  confirmed: false,
  draft: false,
  minSum: '',
  maxSum: '',
}

export default function FilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  function set(key, value) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS)
  }

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
          <div className="flex items-center gap-3 pr-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[13px] font-medium leading-[18px] text-[#0052D2] transition-colors hover:underline dark:text-[#60A5FA]"
            >
              <FilterResetIcon className="h-4 w-4 text-[#0052D2] dark:text-[#60A5FA]" /> Tozalash
            </button>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          {/* Sana oralig'i */}
          <div>
            <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
              Sana oralig'i
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <Calendar03Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                <Input
                  type="date"
                  value={draft.from}
                  onChange={(e) => set('from', e.target.value)}
                  className="h-9 w-full rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
                />
              </div>
              <div className="relative">
                <Calendar03Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                <Input
                  type="date"
                  value={draft.to}
                  onChange={(e) => set('to', e.target.value)}
                  className="h-9 w-full rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Ombor & Kontragent */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
                Ombor
              </Label>
              <Select value={draft.warehouse || '__all'} onValueChange={(v) => set('warehouse', v === '__all' ? '' : v)}>
                <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {WAREHOUSES.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
                Kontragent (kimdan)
              </Label>
              <Select value={draft.counterparty || '__all'} onValueChange={(v) => set('counterparty', v === '__all' ? '' : v)}>
                <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {COUNTERPARTIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Muallif & Holat */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
                Muallif
              </Label>
              <Select value={draft.author || '__all'} onValueChange={(v) => set('author', v === '__all' ? '' : v)}>
                <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                  <SelectValue>{(v) => (v === '__all' ? 'Barchasi' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Barchasi</SelectItem>
                  {AUTHORS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
                Holat
              </Label>
              <div className="flex h-9 items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-[14px] font-normal text-[#0A0A0A] dark:text-white">
                  <Checkbox checked={draft.confirmed} onCheckedChange={(v) => set('confirmed', !!v)} />
                  Tasdiqlangan
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[14px] font-normal text-[#0A0A0A] dark:text-white">
                  <Checkbox checked={draft.draft} onCheckedChange={(v) => set('draft', !!v)} />
                  Qoralama
                </label>
              </div>
            </div>
          </div>

          {/* Summa, USD */}
          <div>
            <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
              Summa, USD
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                type="number"
                placeholder="0"
                value={draft.minSum}
                onChange={(e) => set('minSum', e.target.value)}
                className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              />
              <Input
                type="number"
                placeholder="50 000"
                value={draft.maxSum}
                onChange={(e) => set('maxSum', e.target.value)}
                className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              />
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
            onClick={handleApply}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo'llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
