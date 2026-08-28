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

export default function ConfirmDeleteModal({ open, onOpenChange, receipt, onConfirm }) {
  if (!receipt) return null
  const totalM2 = receipt.rows.reduce((sum, r) => sum + r.m2, 0)
  const rowCount = receipt.excelMeta?.rows ?? receipt.rows.length
  const m2 = receipt.excelMeta?.m2 ?? totalM2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Kirim hujjati o'chirilsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {rowCount} ta partiya bekor qilinadi va ombor qoldig'idan {formatNumber(m2)} m² ayiriladi.
            Agar bu partiyalardan sotuv bo'lgan bo'lsa, o'chirish rad etiladi.
          </p>
        </div>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hujjat</span>
            <span className="font-medium">{receipt.number} · {formatDate(receipt.date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Kontragent</span>
            <span className="font-medium">{receipt.counterparty || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bog'langan sotuvlar</span>
            <span className="font-medium">yo'q</span>
          </div>
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
            variant="destructive"
            onClick={onConfirm}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white hover:bg-[#B91C1C]"
          >
            <Trash2 className="h-4 w-4" /> O'chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
