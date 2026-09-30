import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PagedSelect } from '@/components/ui/paged-select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  accrualRetentionOptions,
  branchOptions,
  employeeOptions,
  organizationOptions,
} from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'

const LABEL = 'mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground'

// Yangi qo'shimcha/ushlanma (mode="create") yoki mavjud qoralama hujjatni tahrirlash (mode="edit").
// `initialData` — backend hujjati (branch_info, employee_info, accrual_retention_info, date).
// `onCreate(payload)` — { date (ISO), branch, employee, accrual_retention }; xato bo'lsa throw qiladi.
export default function NewQoshimchaModal({ open, onOpenChange, onCreate, initialData, mode = 'create' }) {
  const isEdit = mode === 'edit'

  const [dateVal, setDateVal] = useState(null)
  const [orgId, setOrgId] = useState('')
  const [orgName, setOrgName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [branchName, setBranchName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [arId, setArId] = useState('')
  const [arName, setArName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const d = initialData
    const dt = isEdit && d?.date ? new Date(d.date) : new Date()
    setDateVal(dt)
    const initialOrgId = d?.organization_info?.id || d?.branch_info?.organization_info?.id || d?.branch_info?.organization || ''
    const initialOrgName = d?.organization_info?.name || d?.branch_info?.organization_info?.name || ''
    setOrgId(initialOrgId)
    setOrgName(initialOrgName)
    setBranchId(d?.branch_info?.id || '')
    setBranchName(d?.branch_info?.name || '')
    setEmployeeId(d?.employee_info?.id || '')
    setEmployeeName(d?.employee_info?.full_name || '')
    setArId(isEdit ? d?.accrual_retention_info?.id || '' : '')
    setArName(isEdit ? d?.accrual_retention_info?.name || '' : '')
    setError('')
    setLoading(false)
  }, [open, initialData, isEdit])

  const parsedDate = dateVal || null

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!parsedDate) return setError('Sanani tanlang')
    if (!branchId) return setError('Filialni tanlang')
    if (!employeeId) return setError('Xodimni tanlang')
    if (!arId) return setError('Qo\'shimcha va ushlanma turini tanlang')

    setLoading(true)
    setError('')
    try {
      await onCreate({
        date: parsedDate.toISOString(),
        branch: branchId,
        employee: employeeId,
        accrual_retention: arId,
      })
      onOpenChange(false)
    } catch (err) {
      setError(extractErrorMessage(err, isEdit ? 'Saqlashda xatolik yuz berdi' : 'Hujjat yaratishda xatolik yuz berdi'))
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
        <div className="flex h-[60px] shrink-0 items-center justify-between px-6">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Hujjatni tahrirlash' : 'Yangi qo\'shimcha yoki ushlanma'}
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 pb-5 pt-1">
            {error && (
              <div className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className={LABEL}>Sana va vaqt</label>
              <DatePicker
                value={dateVal}
                onChange={setDateVal}
                showTime
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Tashkilot</label>
                <PagedSelect
                  value={orgId}
                  onChange={(val, item) => {
                    setOrgId(val)
                    setOrgName(item?.name ?? '')
                    if (val !== orgId) {
                      setBranchId('')
                      setBranchName('')
                      setEmployeeId('')
                      setEmployeeName('')
                    }
                  }}
                  fetchPage={organizationOptions}
                  selectedLabel={orgName}
                  placeholder="Tashkilot tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>

              <div>
                <label className={LABEL}>Filial</label>
                <PagedSelect
                  value={branchId}
                  onChange={(val, item) => {
                    setBranchId(val)
                    setBranchName(item?.name ?? '')
                    if (val !== branchId) {
                      setEmployeeId('')
                      setEmployeeName('')
                    }
                  }}
                  fetchPage={branchOptions}
                  params={orgId ? { organization: orgId } : undefined}
                  selectedLabel={branchName}
                  placeholder={orgId ? 'Filial tanlang' : 'Avval tashkilotni tanlang'}
                  disabled={!orgId}
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Xodim</label>
                <PagedSelect
                  value={employeeId}
                  onChange={(val, item) => {
                    setEmployeeId(val)
                    setEmployeeName(item?.name ?? '')
                  }}
                  fetchPage={employeeOptions}
                  params={branchId ? { branch: branchId } : undefined}
                  selectedLabel={employeeName}
                  placeholder={branchId ? 'Xodim tanlang' : 'Avval filialni tanlang'}
                  disabled={!branchId}
                  className="h-10 rounded-[10px]"
                />
              </div>
              <div>
                <label className={LABEL}>Qo'shimcha va ushlanma</label>
                <PagedSelect
                  value={arId}
                  onChange={(val, item) => {
                    setArId(val)
                    setArName(item?.name ?? '')
                  }}
                  fetchPage={accrualRetentionOptions}
                  selectedLabel={arName}
                  placeholder="Turini tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>
          </div>

          <div className="flex h-[76px] shrink-0 items-center justify-end gap-3 bg-[#F5F5F5] px-6 dark:bg-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 gap-2 rounded-[10px] border-[#E5E5E5] bg-white px-5 text-[14px] font-medium text-[#0A0A0A] shadow-sm hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="size-4" /> Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#0047B8]"
            >
              <Check className="size-4" />
              {loading ? (isEdit ? 'Saqlanmoqda...' : 'Qo\'shilmoqda...') : isEdit ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
