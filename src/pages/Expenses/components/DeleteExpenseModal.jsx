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

export default function DeleteExpenseModal({ open, onOpenChange, expense, onDelete }) {
  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Xarajat o'chirilsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg bg-[#FEECEC] p-3 text-[13px] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Summa kassaga qaytariladi va kassa qoldig'i oshadi. Amalni qaytarib bo'lmaydi.</p>
        </div>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <Row label="Xarajat turi" value={expense.type} />
          <Row label="Sana" value={formatDate(expense.date)} />
          <Row label="Kassadan" value={expense.kassa} />
          <Row
            label="Summa"
            value={`${formatNumber(expense.amountUzs, 3)} UZS`}
            valueClassName="text-[#DC2626] dark:text-[#F87171]"
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
              onDelete()
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
          >
            <Trash2 className="h-4 w-4" /> O'chirish
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
