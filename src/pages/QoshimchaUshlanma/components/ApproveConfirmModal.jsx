import { Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { formatAccrualRetentionValue } from '@/features/accrualRetention/accrualRetentionData'

export default function ApproveConfirmModal({
  open,
  onOpenChange,
  document: doc,
  onConfirm,
  loading = false,
  currencyMap = {},
}) {
  if (!doc) return null

  const employeeName = doc.employee_info?.full_name || doc.employee_info?.name || doc.employeeName || '-'
  const branchName = doc.branch_info?.name || doc.branchName || '-'
  const typeName = doc.accrual_retention_info?.name || doc.accrualRetentionName || '-'
  const valueDisplay = formatAccrualRetentionValue(doc, currencyMap)
  const dateDisplay = doc.date ? formatDateTime(new Date(doc.date)) : (doc.createdAt || '-')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[16px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[580px] dark:bg-card"
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">
            Hujjat tasdiqlansinmi?
          </DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Yopish"
                className="flex size-8 items-center justify-center rounded-md text-[#525252] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] dark:text-white/70 dark:hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>

        {/* Content */}
        <div className="space-y-3 px-6 py-5">
          <div className="rounded-xl bg-[#F9FAFB] p-4 dark:bg-white/5 space-y-2.5 text-sm">
            <div className="flex justify-between items-center text-[#737373] dark:text-muted-foreground">
              <span>Xodim</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{employeeName}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-muted-foreground">
              <span>Filial</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{branchName}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-muted-foreground">
              <span>Qo‘shimcha va ushlanma</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{typeName}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-muted-foreground">
              <span>Qiymat</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{valueDisplay}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-muted-foreground">
              <span>Sana</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{dateDisplay}</span>
            </div>
          </div>
          <p className="text-xs text-[#737373] dark:text-muted-foreground">
            Hujjat tasdiqlangandan so‘ng uni o‘zgartirib yoki bekor qilib bo‘lmaydi.
          </p>
        </div>

        {/* Footer */}
        <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] bg-[#F9FAFB] px-6 dark:border-white/10 dark:bg-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 gap-2 rounded-[10px] border-[#E5E5E5] bg-white px-5 text-[14px] font-medium text-[#0A0A0A] shadow-sm hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="size-4" /> Yopish
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 gap-2 rounded-[10px] bg-[#00A34D] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#008A41]"
          >
            <Check className="size-4" /> {loading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
