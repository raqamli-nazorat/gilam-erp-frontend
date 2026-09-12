import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import RecruitmentFieldsGrid, {
  EMPTY_HIRE_DRAFT,
  buildHireValues,
  fieldCls,
  hireDraftFromXodim,
  isHireDraftValid,
  labelCls,
  useHireCatalogs,
} from './hireFields'

// Faqat mavjud xodim uchun: "Tahrirlash" (latestHireId bor — hujjat PATCH qilinadi) yoki
// hali umuman ishga olinmagan ("yangi") xodim uchun birinchi hujjatni yaratish (POST).
// Xodimni TANLASH (yangi ishga olish) endi HireChoiceModal → EmployeePickerModal → BulkHireModal
// (pager) zanjiri orqali ishlaydi — bu oyna faqat allaqachon ma'lum bitta xodim uchun.
export default function HireEmployeeModal({ open, onOpenChange, employee, onSave }) {
  const hasRecord = !!employee?.latestHireId
  const { orgs, branches, positions } = useHireCatalogs(open)
  const [draft, setDraft] = useState(EMPTY_HIRE_DRAFT)

  useEffect(() => {
    if (!open) return
    setDraft(hireDraftFromXodim(employee))
  }, [open, employee])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  const canSave = isHireDraftValid(draft)

  function handleSave() {
    onSave({ recruitmentId: employee?.latestHireId ?? null, ...buildHireValues(draft) })
    onOpenChange(false)
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[640px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {hasRecord ? 'Xodimni tahrirlash' : 'Xodimni ishga olish'}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto px-6 pb-4 pt-2">
          <div className="mb-5">
            <Label className={labelCls}>Xodim</Label>
            <div className={`${fieldCls} flex items-center bg-[#F5F5F5] text-[#0A0A0A] dark:bg-white/5 dark:text-white`}>
              {employee.name}
            </div>
          </div>

          <RecruitmentFieldsGrid draft={draft} set={set} orgs={orgs} branches={branches} positions={positions} />
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2.5 rounded-b-[20px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 gap-2 rounded-lg border border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-11 gap-2 rounded-lg bg-[#0052D2] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> {hasRecord ? 'Saqlash' : 'Ishga olish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
