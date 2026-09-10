import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CopyButton from '@/components/ui/copy-button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function DeleteRecordModal({ open, onOpenChange, entity, record, fields = [], onDelete }) {
  if (!record) return null

  const infoRows = [
    ...fields
      .filter((f) => record[f.key])
      .map((f) => ({ label: f.label, value: record[f.key], copyable: Boolean(f.copyable) })),
    { label: 'Holat', value: record.active ? 'Faol' : 'Arxiv', copyable: false },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {cap(entity)}ni o‘chirish?
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
            {infoRows.map(({ label, value, copyable }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-1">
                <span className="shrink-0 text-[#737373] dark:text-muted-foreground">{label}</span>
                <span className="flex min-w-0 items-center justify-end gap-1.5 text-right font-medium text-[#0A0A0A] dark:text-white">
                  <span className="truncate">{value}</span>
                  {copyable && <CopyButton value={value} stopPropagation={false} />}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 flex gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
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
            <X className="h-4 w-4" /> O‘chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
