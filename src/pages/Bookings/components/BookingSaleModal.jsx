import { useEffect, useState } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { CASHBOXES, rollBookedM2, rollSum } from '@/features/bookings/bookingsMockData'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'
const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white'

export default function BookingSaleModal({ open, onOpenChange, rolls = [], exchangeRate, onCreate }) {
  const [picked, setPicked] = useState([])
  const [dueDate, setDueDate] = useState('')
  const [cashbox, setCashbox] = useState(CASHBOXES[0])

  useEffect(() => {
    if (open) setPicked(rolls.filter((r) => r.selected).map((r) => r.id))
  }, [open, rolls])

  const pickedRolls = rolls.filter((r) => picked.includes(r.id))
  const totalM2 = pickedRolls.reduce((s, r) => s + rollBookedM2(r), 0)
  const totalUsd = pickedRolls.reduce((s, r) => s + rollSum(r), 0)
  const totalUzs = Math.round(totalUsd * exchangeRate)

  function toggle(id) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Bron tovarlar sotuvi
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Belgilangan rulonlar bo‘yicha yangi sotuv hujjati yaratiladi. Bron qisman bajarilishi mumkin —
          qolgan rulonlar bronda qoladi.
        </p>

        <div className="overflow-hidden rounded-lg border border-[#E5E5E5] dark:border-white/10">
          {rolls.map((r, i) => {
            const on = picked.includes(r.id)
            return (
              <div
                key={r.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-3.5 py-2.5',
                  i > 0 && 'border-t border-[#E5E5E5] dark:border-white/10',
                  on && 'bg-[#EFF5FF] dark:bg-[#0052D2]/10'
                )}
                onClick={() => toggle(r.id)}
              >
                <Checkbox checked={on} onCheckedChange={() => toggle(r.id)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.quality} {r.design}</p>
                  <p className="text-[11px] text-[#737373] dark:text-muted-foreground">Partiya {r.partiya}</p>
                </div>
                <span className="text-[13px] text-[#737373]">{formatNumber(rollBookedM2(r))} m²</span>
                <span className="w-24 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(rollSum(r))} USD</span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className={labelCls}>To'lov muddati</Label>
            <DatePicker value={fromISODate(dueDate)} onChange={(d) => setDueDate(toISODate(d))} />
          </div>
          <div>
            <Label className={labelCls}>Kassa</Label>
            <Select value={cashbox} onValueChange={setCashbox}>
              <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {CASHBOXES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#EAF1FE] px-3.5 py-2.5 text-[13px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
          <span>Sotuvga: {pickedRolls.length} ta rulon · {formatNumber(totalM2)} m²</span>
          <span>{formatNumber(totalUsd)} USD · {formatNumber(totalUzs, 0)} UZS</span>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-3 gap-2 border-0 bg-transparent p-0">
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
            disabled={pickedRolls.length === 0}
            onClick={() => {
              onCreate(picked)
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" /> Sotuv yaratish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
