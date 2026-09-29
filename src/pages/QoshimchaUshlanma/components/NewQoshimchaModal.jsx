import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PagedSelect } from '@/components/ui/paged-select'
import { Input } from '@/components/ui/input'
import {
  accrualRetentionOptions,
  branchOptions,
  employeeOptions,
  organizationOptions,
} from '@/services/optionSources'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'

export default function NewQoshimchaModal({
  open,
  onOpenChange,
  onCreate,
  initialData,
}) {
  const [date, setDate] = useState('')
  const [orgId, setOrgId] = useState('')
  const [orgName, setOrgName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [branchName, setBranchName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [accrualRetentionId, setAccrualRetentionId] = useState('')
  const [accrualRetentionItem, setAccrualRetentionItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setDate(formatDateTime(new Date()))

      // Dastlabki qiymatlar (initialData bo'lsa)
      const initialOrgId =
        initialData?.orgId ||
        initialData?.branch_info?.organization?.id ||
        initialData?.branch_info?.organization_id ||
        initialData?.employee_info?.organization ||
        ''
      const initialOrgName =
        initialData?.orgName ||
        initialData?.branch_info?.organization?.name ||
        initialData?.branch_info?.organization_name ||
        initialData?.employee_info?.organization_name ||
        ''
      const initialBranchId =
        initialData?.branchId ||
        initialData?.branch ||
        initialData?.branch_info?.id ||
        ''
      const initialBranchName =
        initialData?.branchName ||
        initialData?.branch_info?.name ||
        ''
      const initialEmployeeId =
        initialData?.employeeId ||
        initialData?.employee ||
        initialData?.employee_info?.id ||
        ''
      const initialEmployeeName =
        initialData?.employeeName ||
        initialData?.employee_info?.full_name ||
        initialData?.employee_info?.name ||
        ''
      const initialArId =
        initialData?.accrualRetentionId ||
        initialData?.accrual_retention ||
        ''
      const initialArItem =
        initialData?.accrualRetentionItem ||
        initialData?.accrual_retention_info ||
        null

      setOrgId(initialOrgId)
      setOrgName(initialOrgName)
      setBranchId(initialBranchId)
      setBranchName(initialBranchName)
      setEmployeeId(initialEmployeeId)
      setEmployeeName(initialEmployeeName)
      setAccrualRetentionId(initialArId)
      setAccrualRetentionItem(initialArItem)
      setError('')
      setLoading(false)
    }
  }, [open, initialData])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!branchId) {
      setError('Filialni tanlang')
      return
    }
    if (!employeeId) {
      setError('Xodimni tanlang')
      return
    }
    if (!accrualRetentionId) {
      setError("Qo'shimcha va ushlanma turini tanlang")
      return
    }

    setLoading(true)
    setError('')

    try {
      await onCreate({
        date: new Date().toISOString(),
        organization: orgId,
        organizationName: orgName,
        branch: branchId,
        branchName,
        employee: employeeId,
        employeeName,
        accrual_retention: accrualRetentionId,
        accrualRetentionItem,
      })
      onOpenChange(false)
    } catch (err) {
      setError(extractErrorMessage(err, 'Hujjat yaratishda xatolik yuz berdi'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[16px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">
            Yangi qo‘shimcha yoki ushlanma
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

        {/* Forma (Figma 2-rasm) */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400 whitespace-pre-line">
                {error}
              </div>
            )}

            {/* 1-qator: Sana */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                Sana
              </label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="27.09.2026 10:00"
                className="h-10 rounded-[10px] border-[#E5E5E5] bg-white text-sm text-[#0A0A0A] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              />
            </div>

            {/* 2-qator: Tashkilot va Filial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Tashkilot
                </label>
                <PagedSelect
                  value={orgId}
                  onChange={(val, item) => {
                    setOrgId(val)
                    setOrgName(item?.name ?? '')
                    // Tashkilot o'zgarganda filial va xodim tozalanadi
                    setBranchId('')
                    setBranchName('')
                    setEmployeeId('')
                    setEmployeeName('')
                  }}
                  fetchPage={organizationOptions}
                  selectedLabel={orgName}
                  placeholder="Tashkilot tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Filial
                </label>
                <PagedSelect
                  value={branchId}
                  onChange={(val, item) => {
                    setBranchId(val)
                    setBranchName(item?.name ?? '')
                    // Filial o'zgarganda xodim tozalanadi
                    setEmployeeId('')
                    setEmployeeName('')
                  }}
                  fetchPage={branchOptions}
                  params={orgId ? { organization: orgId } : undefined}
                  selectedLabel={branchName}
                  placeholder={orgId ? 'Filial tanlang' : 'Filial tanlang'}
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>

            {/* 3-qator: Xodim va Qo'shimcha va ushlanma */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Xodim
                </label>
                <PagedSelect
                  value={employeeId}
                  onChange={(val, item) => {
                    setEmployeeId(val)
                    setEmployeeName(item?.name ?? '')
                  }}
                  fetchPage={employeeOptions}
                  params={branchId ? { branch: branchId } : (orgId ? { organization: orgId } : undefined)}
                  selectedLabel={employeeName}
                  placeholder={branchId ? 'Xodim tanlang' : (orgId ? 'Xodim tanlang' : 'Xodim tanlang')}
                  className="h-10 rounded-[10px]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Qo‘shimcha va ushlanma
                </label>
                <PagedSelect
                  value={accrualRetentionId}
                  onChange={(val, item) => {
                    setAccrualRetentionId(val)
                    setAccrualRetentionItem(item)
                  }}
                  fetchPage={accrualRetentionOptions}
                  selectedLabel={accrualRetentionItem?.name ?? ''}
                  placeholder="Turini tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>
          </div>

          {/* Footer (Bekor qilish va Qo'shish) */}
          <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] bg-[#F9FAFB] px-6 dark:border-white/10 dark:bg-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 gap-2 rounded-[10px] border-[#E5E5E5] bg-white px-5 text-[14px] font-medium text-[#0A0A0A] shadow-sm hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white cursor-pointer"
            >
              <X className="size-4" /> Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#0047B8] cursor-pointer"
            >
              <Check className="size-4" /> {loading ? 'Qo‘shilmoqda...' : 'Qo‘shish'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

