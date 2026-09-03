import { useEffect, useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { REJECT_REASONS } from '@/features/returns/returnsMockData'
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

export default function ReturnRejectModal({ open, onOpenChange, doc, onReject }) {
  const [reason, setReason] = useState(REJECT_REASONS[0])
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (open) {
      setReason(REJECT_REASONS[0])
      setComment('')
    }
  }, [open])

  if (!doc) return null
  const canReject = comment.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Qaytarish rad etilsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Tovar omborga kiritilmaydi va mijoz qarzi o'zgarmaydi. Mijozga sabab ko'rsatilgan xabar yuboriladi.</p>
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Rad etish sababi
          </Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Izoh (majburiy)
          </Label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Rad etish sababini batafsil yozing"
            className="w-full resize-none rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#737373] focus-visible:border-[#0052D2] focus-visible:ring-2 focus-visible:ring-[#0052D2]/20 dark:border-white/10 dark:bg-card dark:text-white"
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
            disabled={!canReject}
            onClick={() => {
              onReject({ rejectReason: reason, rejectComment: comment.trim() })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white hover:bg-[#B91C1C] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Rad etish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
