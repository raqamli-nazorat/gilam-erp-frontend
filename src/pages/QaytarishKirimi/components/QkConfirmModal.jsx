import { Check, X } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { qkArea, qkDefectArea } from '@/features/qaytarishKirimi/qkMockData'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function QkConfirmModal({ open, onOpenChange, doc, onConfirm }) {
  if (!doc) return null
  const area = qkArea(doc)
  const defect = qkDefectArea(doc)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Omborga kiritilsinmi?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Tasdiqlangandan keyin ombor qoldig'i oshadi va rulonlar sotuvga ochiladi.
          Nuqsonli qatorlar sotuvga chiqmaydi.
        </p>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <Row label="Hujjat" value={`${doc.number} · ${formatDate(doc.date)}`} />
          <Row label="Ombor" value={doc.warehouse} />
          <Row label="Kirim maydoni" value={`${formatNumber(area)} m²`} />
          <Row
            label="Shundan nuqsonli"
            value={`${formatNumber(defect)} m²`}
            valueClassName="text-[#B45309] dark:text-[#FBBF24]"
          />
        </div>

        <DialogFooter className="mx-0 mb-0 mt-1 gap-2 border-0 bg-transparent p-0">
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
            <Check className="h-4 w-4" /> Omborga kiritish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, valueClassName = '' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  )
}
