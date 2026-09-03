import { AlertTriangle, Trash2, X } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function DeleteSaleModal({ open, onOpenChange, doc, onConfirm }) {
  if (!doc) return null
  const m2 = doc.rows.reduce((s, r) => s + r.m2, 0)
  const paid = doc.payments.reduce((s, p) => s + p.usd, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Hujjat o‘chirilsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Bu amalni qaytarib bo‘lmaydi. Hujjat bilan birga unga bog‘langan to‘lovlar ham bekor
            qilinadi va rulon qoldig‘i omborga qaytariladi.
          </p>
        </div>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hujjat</span>
            <span className="font-medium">{doc.number} · {formatDate(doc.date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Qatorlar</span>
            <span className="font-medium">{doc.rows.length} ta · {formatNumber(m2)} m²</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Qabul qilingan to‘lov</span>
            <span className="font-medium text-[#DC2626]">{formatNumber(paid)} USD</span>
          </div>
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
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white hover:bg-[#B91C1C]"
          >
            <Trash2 className="h-4 w-4" /> O‘chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
