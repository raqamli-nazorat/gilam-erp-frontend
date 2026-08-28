import { Check, X } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ConfirmSubmitModal({ open, onOpenChange, receipt, onConfirm }) {
  if (!receipt) return null
  const totalM2 = receipt.rows.reduce((sum, r) => sum + r.m2, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Hujjat tasdiqlansinmi?
          </DialogTitle>
          <DialogDescription>
            Tasdiqlangandan keyin qatorlarni o'zgartirib bo'lmaydi. Tovar ombor qoldig'iga
            qo'shiladi va partiyalar sotuvga ochiladi.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <Row label="Hujjat" value={`${receipt.number} · ${formatDate(receipt.date)}`} />
          <Row label="Ombor" value={receipt.warehouse} />
          <Row
            label="Qatorlar"
            value={`${receipt.excelMeta?.rows ?? receipt.rows.length} ta · ${formatNumber(receipt.excelMeta?.m2 ?? totalM2)} m²`}
          />
          <Row
            label="Kirim summasi"
            value={`${formatNumber(receipt.sumUsd)} USD · ${formatNumber(receipt.sumUzs, 0)} UZS`}
          />
        </div>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            onClick={onConfirm}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
