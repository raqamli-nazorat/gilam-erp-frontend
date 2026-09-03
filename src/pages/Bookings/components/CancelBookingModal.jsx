import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { CANCEL_REASONS, rollBookedM2 } from '@/features/bookings/bookingsMockData'
import { formatDate, formatNumber } from '@/lib/format'
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

export default function CancelBookingModal({ open, onOpenChange, booking, onConfirm }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0])
  if (!booking) return null

  const cutRolls = booking.rolls.filter((r) => r.cut)
  const cutM2 = cutRolls.reduce((s, r) => s + rollBookedM2(r), 0)
  const bookedM2 = booking.rolls.reduce((s, r) => s + rollBookedM2(r), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Bron bekor qilinsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Bandlangan {formatNumber(bookedM2)} m² bron omboridan chiqariladi va rulonlar boshqa mijozlarga
            ochiladi. Kesilgan rulonlar qaytarilmaydi.
          </p>
        </div>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bron</span>
            <span className="font-medium">{booking.number} · {formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mijoz</span>
            <span className="font-medium">{booking.customer || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Kesilgan rulonlar</span>
            <span className="font-medium text-[#DC2626]">{cutRolls.length} ta · {formatNumber(cutM2)} m²</span>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Bekor qilish sababi
          </Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CANCEL_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-3 gap-2 border-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Yopish
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(reason)
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white hover:bg-[#B91C1C]"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
