import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function DeleteRecordModal({ open, onOpenChange, entity, record, note, onDelete }) {
  if (!record) return null
  const detail = note || (record.goods ? "Bunga bog'liq hujjatlar bo'lsa, ular ta'sirlanadi." : "Undagi qoldiq 0 bo'lgani uchun hujjatlar buzilmaydi.")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {cap(entity)}ni o'chirish
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          «{record.name || record.date}» o'chiriladi. {detail} Amalni qaytarib bo'lmaydi.
        </p>

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
