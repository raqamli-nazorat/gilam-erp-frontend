import { useState } from 'react'
import { FileSpreadsheet, RefreshCw, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/format'
import { formatAccrualRetentionValue } from '@/features/accrualRetention/accrualRetentionData'

export default function CancelConfirmModal({
  open,
  onOpenChange,
  document: doc,
  onConfirm,
  loading = false,
  currencyMap = {},
}) {
  const [reason, setReason] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  if (!doc) return null

  const employeeName = doc.employee_info?.full_name || doc.employee_info?.name || doc.employeeName || '-'
  const branchName = doc.branch_info?.name || doc.branchName || '-'
  const typeName = doc.accrual_retention_info?.name || doc.accrualRetentionName || '-'
  const valueDisplay = formatAccrualRetentionValue(doc, currencyMap)
  const dateDisplay = doc.date ? formatDateTime(new Date(doc.date)) : (doc.createdAt || '-')
  const approvedDisplay = doc.approved_at
    ? formatDateTime(new Date(doc.approved_at))
    : doc.updated_at
      ? formatDateTime(new Date(doc.updated_at))
      : dateDisplay

  const isApproved = doc.status === 'approved'

  const handleConfirm = () => {
    const finalReason = reason.trim() || "Ma'lumotlar noto'g'ri kiritilgan"
    onConfirm({ reason: finalReason, attachment: file, file })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[20px] p-0 shadow-2xl ring-0 sm:max-w-[480px] dark:bg-[#18181B] border-none"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <DialogTitle className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">
            {isApproved ? 'Tasdiqlangan hujjat bekor qilinsinmi?' : 'Hujjat bekor qilinsinmi?'}
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

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Kulrang ma'lumotlar kartasi */}
          <div className="rounded-2xl bg-[#F5F5F7] p-4 space-y-2.5 text-sm dark:bg-white/5">
            <div className="flex justify-between items-center text-[#737373] dark:text-gray-400">
              <span>Xodim</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{employeeName}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-gray-400">
              <span>Filial</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{branchName}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-gray-400">
              <span>Qo‘shimcha va ushlanma</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{typeName}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-gray-400">
              <span>Qiymat</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{valueDisplay}</span>
            </div>
            <div className="flex justify-between items-center text-[#737373] dark:text-gray-400">
              <span>Sana</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{dateDisplay}</span>
            </div>
            {isApproved && (
              <div className="flex justify-between items-center text-[#737373] dark:text-gray-400">
                <span>Tasdiqlangan</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">{approvedDisplay}</span>
              </div>
            )}
          </div>

          {/* Sabab */}
          <div>
            <label className="block text-sm font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
              Sabab
            </label>
            <Input
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder="Ma’lumotlar noto‘g‘ri kiritilgan"
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#0A0A0A] placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#DC2626] dark:border-white/10 dark:bg-zinc-800 dark:text-white"
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          {/* Hujjat fayl yuklash (PDF yoki Excel) */}
          <div>
            <label className="block text-sm font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
              Hujjat
            </label>
            <label className="flex items-center gap-3.5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20 p-3.5 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
                <RefreshCw className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white truncate">
                  {file ? file.name : 'Faylni tanlang yoki shu yerga tashlang'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  PDF yoki Excel (XLS, XLSX)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] px-6 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 dark:bg-zinc-800 dark:border-white/10 dark:text-white cursor-pointer"
          >
            <X className="size-4 mr-1.5" /> Yopish
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="h-10 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-sm font-semibold text-white shadow-none cursor-pointer flex items-center gap-1.5"
          >
            <X className="size-4 mr-1.5" /> {loading ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

