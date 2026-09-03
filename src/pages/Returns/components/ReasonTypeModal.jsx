import { useEffect, useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import { RETURN_REASONS } from '@/features/returns/returnsMockData'
import { cn } from '@/lib/utils'
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

const TYPES = [
  { value: 'client', title: 'Klientdan qaytarish', hint: 'Tovar omborga qaytadi, mijoz qarzi kamayadi' },
  { value: 'supplier', title: 'Yetkazuvchiga qaytarish', hint: 'Tovar ombordan chiqadi, yetkazuvchi qarzi kamayadi' },
]

export default function ReasonTypeModal({ open, onOpenChange, doc, onApply }) {
  const [type, setType] = useState('client')
  const [reason, setReason] = useState(RETURN_REASONS[0])
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (open && doc) {
      setType(doc.type || 'client')
      setReason(doc.reason || RETURN_REASONS[0])
      setComment(doc.comment || '')
    }
  }, [open, doc])

  if (!doc) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Qaytarish sababi va turi
          </DialogTitle>
        </DialogHeader>

        <div>
          <Label className="mb-2 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Qaytarish turi
          </Label>
          <div className="grid gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                  type === t.value
                    ? 'border-[#0052D2] bg-[#EAF1FE] dark:bg-[#0052D2]/15'
                    : 'border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/10 dark:hover:bg-white/5'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                    type === t.value ? 'border-[#0052D2]' : 'border-[#D4D4D4] dark:border-white/20'
                  )}
                >
                  {type === t.value && <span className="h-2 w-2 rounded-full bg-[#0052D2]" />}
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-[#0A0A0A] dark:text-white">{t.title}</span>
                  <span className="block text-[12px] text-[#737373] dark:text-muted-foreground">{t.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Sabab
          </Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETURN_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Qo'shimcha izoh (ixtiyoriy)
          </Label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] outline-none focus-visible:border-[#0052D2] focus-visible:ring-2 focus-visible:ring-[#0052D2]/20 dark:border-white/10 dark:bg-card dark:text-white"
          />
        </div>

        <div className="flex gap-2.5 rounded-lg bg-[#EAF1FE] p-3 text-[13px] text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Sabab har bir qatorga alohida ham qo'yilishi mumkin — bu yerdagi qiymat barcha qatorlarga
            qo'llanadi.
          </p>
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
              onApply({ type, reason, comment })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo'llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
