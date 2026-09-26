import { Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import { MONTH_NAMES } from '@/features/oylikHisoblash/oylikData'

export default function ApproveConfirmModal({
  open,
  onOpenChange,
  hisob,
  onConfirm,
  loading = false,
}) {
  if (!hisob) return null

  const branchName = hisob.branchName || hisob.branch_info?.name || '-'
  const monthName = MONTH_NAMES[hisob.forMonth || hisob.for_month] || hisob.forMonth || hisob.for_month || '-'
  const employeeCount = hisob.employeeCount || hisob.employee_count || (Array.isArray(hisob.employees) ? hisob.employees.length : 1)
  const totalAmount = hisob.totalAmount || hisob.amount || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[20px] p-0 shadow-2xl ring-0 sm:max-w-[460px] dark:bg-[#18181B] border-none"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <DialogTitle className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">
            Hisob tasdiqlansinmi?
          </DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Yopish"
                className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>

        {/* Ma'lumotlar bloki (1-rasmdagi kulrang karta) */}
        <div className="p-6">
          <div className="rounded-2xl bg-[#F5F5F7] p-4 space-y-2.5 text-sm dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[#737373] dark:text-gray-400">Filial</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{branchName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#737373] dark:text-gray-400">Oy</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{monthName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#737373] dark:text-gray-400">Xodimlar</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{employeeCount}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#737373] dark:text-gray-400">Jami, UZS</span>
              <span className="text-[16px] font-bold text-[#0A0A0A] dark:text-white">
                {formatNumber(totalAmount, 2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer (1-rasmdagi tugmalar) */}
        <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] px-6 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 dark:bg-zinc-800 dark:border-white/10 dark:text-white"
          >
            <X className="size-4 mr-1.5" /> Yopish
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-10 px-6 rounded-xl bg-[#00A34D] hover:bg-[#008A41] text-sm font-semibold text-white shadow-none"
          >
            <Check className="size-4 mr-1.5" /> {loading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
