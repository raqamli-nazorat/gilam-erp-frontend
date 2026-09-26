import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Figma: "<Entity>ni o'chirish?" — kulrang blokda yozuv qatorlari (chapda yorliq, o'ngda qiymat).
// `summary`: { label, value } yoki [{ label, value }, ...]
export default function ReferenceDeleteModal({ open, onOpenChange, title, summary, record, onDelete }) {
  if (!record) return null

  const rows = Array.isArray(summary) ? summary : summary ? [summary] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[480px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-5 pb-2">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-3">
          <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5 space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="min-w-0 text-[#737373] dark:text-muted-foreground">{row.label}</span>
                <span className="shrink-0 text-right font-medium text-[#0A0A0A] dark:text-white">
                  {row.value || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 flex gap-2 border-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 rounded-lg border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={() => {
              onDelete()
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 rounded-lg bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
          >
            <Trash2 className="h-4 w-4" /> O‘chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
