import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import RecruitmentFieldsGrid, {
  EMPTY_HIRE_DRAFT,
  buildHireValues,
  fieldCls,
  isHireDraftValid,
  labelCls,
  useHireCatalogs,
} from './hireFields'
import EmployeePickerModal from './EmployeePickerModal'

// "Ishga qabul qilish" ro'yxati uchun — Figma: bitta oynada "Xodim" (Kadr) tanlagich +
// ishga olish maydonlari, "Saqlash" (Qoralama) va "Tasdiqlash" (Tasdiqlangan) alohida
// tugmalar bilan. HireEmployeeModal'dan farqli — bu yerda xodim TANLASH ham shu oynaning ichida.
export default function RecruitmentModal({ open, onOpenChange, record, onSave }) {
  const isEdit = !!record
  const { orgs, branches, positions } = useHireCatalogs(open)
  const kadrlar = useSelector((s) => s.xodimlar.list)
  const [employeeId, setEmployeeId] = useState('')
  const [draft, setDraft] = useState(EMPTY_HIRE_DRAFT)
  const [pickerOpen, setPickerOpen] = useState(false)
  const employeeName = kadrlar.find((k) => k.id === employeeId)?.name

  useEffect(() => {
    if (!open) return
    if (record) {
      setEmployeeId(record.employeeId ?? '')
      setDraft({
        tashkilot: '', // recruitment hujjati o'zi tashkilotni saqlamaydi, faqat filialni
        filial: record.filialId ?? '',
        lavozim: record.lavozimId ?? '',
        kartaRaqami: record.kartaRaqami ?? '',
        ishHaqiTuri: record.ishHaqiTuri ?? 'fixed_amount',
        ishHaqiSummasi: record.fixSumma ? String(record.fixSumma) : '',
        ishHaqiFoizi: record.fixFoiz ? String(record.fixFoiz) : '',
        ishgaOlinganSana: record.sana ?? '',
        qoshimchaSumma: record.extraSumma ? String(record.extraSumma) : '',
        qoshimchaFoizi: record.extraFoiz ? String(record.extraFoiz) : '',
      })
    } else {
      setEmployeeId('')
      setDraft(EMPTY_HIRE_DRAFT)
    }
  }, [open, record])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  const canSave = !!employeeId && isHireDraftValid(draft)

  function submit(status) {
    // Tahrirlashda holat o'zgartirilmaydi — faqat maydonlar yangilanadi (holatni Tasdiqlash/
    // Bekor qilish tugmalari sahifaning o'zida alohida boshqaradi).
    onSave({ employeeId, status: isEdit ? record.status : status, draft: buildHireValues(draft) })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Standart balandlik — 560×592, radius 12px: bu bo'limdagi modallar bir-birining ustiga
          "ichma-ich" ochiladi (Xodim/Tashkilot tanlang shu dialog ustida), shuning uchun barchasi
          bitta standart o'lchamda — ma'lumot kam bo'lsa ham hajm o'zgarmaydi. */}
      <DialogContent className="flex h-[592px] flex-col gap-0 rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] sm:max-w-[560px]">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Ishga qabul qilishni tahrirlash' : 'Xodimni ishga olish'}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto px-6 pb-4 pt-2">
          <div className="mb-5">
            <Label className={labelCls}>Xodim</Label>
            {/* Figma: "Xodim" bosilganda oddiy dropdown emas, izlab-tanlash oynasi (EmployeePickerModal, bitta tanlash rejimi) ochiladi. */}
            <button
              type="button"
              disabled={isEdit}
              onClick={() => setPickerOpen(true)}
              className={cn(fieldCls, 'flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60')}
            >
              <span className={cn('truncate', !employeeName && 'text-[#737373]')}>{employeeName || 'Xodim ro‘yxatidan tanlang'}</span>
              <ChevronDown className="size-4 shrink-0 text-[#737373]" />
            </button>
            <EmployeePickerModal
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              employees={kadrlar}
              onConfirm={(ids) => setEmployeeId(ids[0])}
            />
          </div>

          <RecruitmentFieldsGrid draft={draft} set={set} orgs={orgs} branches={branches} positions={positions} />
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 shrink-0 gap-2.5 rounded-b-[12px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
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
            onClick={() => submit('draft')}
            className="h-11 gap-2 rounded-lg bg-[#0052D2] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
          {!isEdit && (
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => submit('confirmed')}
              className="h-11 gap-2 rounded-lg bg-[#047A47] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#036139] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              <Check className="h-4 w-4" /> Tasdiqlash
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
