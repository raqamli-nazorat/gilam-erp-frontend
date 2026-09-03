import { useEffect, useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { rollBookedM2 } from '@/features/bookings/bookingsMockData'
import { formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function CutRollModal({ open, onOpenChange, roll, onConfirm }) {
  const [marked, setMarked] = useState(true)
  useEffect(() => {
    if (open) setMarked(true)
  }, [open])

  if (!roll) return null
  const cutArea = rollBookedM2(roll)
  const leftAfter = Math.max(0, Number((roll.stockM2 - cutArea).toFixed(2)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Rulon kesilsinmi?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Kesilgan deb belgilangan rulonning qoldig‘i kamayadi va u boshqa bronlarda faqat qolgan qismi
          bilan ko‘rinadi. Amalni qaytarish uchun bronni tahrirlash kerak.
        </p>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rulon</span>
            <span className="font-medium">{roll.quality} {roll.design} · {roll.partiya}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Kesiladigan maydon</span>
            <span className="font-medium">{formatNumber(cutArea)} m²</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Qoldiq kesishdan keyin</span>
            <span className="font-medium text-[#B45309] dark:text-[#FBBF24]">{formatNumber(leftAfter)} m²</span>
          </div>
        </div>

        <div className="flex gap-2.5 rounded-lg border border-[#FDE9C8] bg-[#FFF8E6] p-3 text-sm text-[#B45309] dark:border-[#B45309]/40 dark:bg-[#B45309]/15 dark:text-[#FBBF24]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Rulon to‘liq ishlatiladi — ortiqcha qoldiq qolmaydi.</p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-[14px] font-normal text-[#0A0A0A] dark:text-white">
          <Checkbox checked={marked} onCheckedChange={(v) => setMarked(!!v)} />
          «Kesildi» deb belgilansin
        </label>

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
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
