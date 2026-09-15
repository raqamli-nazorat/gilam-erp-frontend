import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskMoney } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import RecruitmentFieldsGrid, {
  EMPTY_HIRE_DRAFT,
  HireModalHeader,
  buildHireValues,
  compactFieldCls,
  compactLabelCls,
  hireFooterBtnCls,
  isDraftDirty,
  isHireDraftValid,
  useHireCatalogs,
} from './hireFields'
import EmployeePickerModal from './EmployeePickerModal'

// Ishga olish/tahrirlash oynasi — BITTA umumiy forma: "Bitta xodim ishga olish" va "Bir nechta
// xodim ishga olish" ikkalasi ham xuddi shu oynani ochadi (Figma dev-mode: pager yo'q, oddiy
// sarlavha). Farq faqat "Xodim" maydoni bosilganda ochiladigan EmployeePickerModal'ning rejimida:
// `multiple=false` — bitta tanlash ("Xodim tanlash"), `multiple=true` — ko'p tanlash ("Xodimlar
// tanlash"). Tanlangan xodim(lar)ga BIR XIL forma qiymatlari (Tashkilot/Filial/Lavozim/Ish
// haqi/sana/qo'shimcha) qo'llaniladi — har bir xodim uchun alohida forma/navbat YO'Q.
export default function RecruitmentModal({ open, onOpenChange, record, multiple = false, onSave, onSaveOne, onDone }) {
  const isEdit = !!record
  const { orgs, branches, positions } = useHireCatalogs(open)
  const kadrlar = useSelector((s) => s.xodimlar.list)

  const [draft, setDraft] = useState(EMPTY_HIRE_DRAFT)
  const [initialDraft, setInitialDraft] = useState(EMPTY_HIRE_DRAFT)
  // Tahrirlashda — hujjatning o'zi tegishli bitta xodim. Yaratishda — Xodim maydoni orqali
  // tanlangan id(lar) ro'yxati (bitta rejimda ko'pi bilan 1 ta).
  const [editEmployeeId, setEditEmployeeId] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    setPending(false)
    if (record) {
      const nextDraft = {
        tashkilot: '', // recruitment hujjati o'zi tashkilotni saqlamaydi, faqat filialni
        filial: record.filialId ?? '',
        lavozim: record.lavozimId ?? '',
        kartaRaqami: record.kartaRaqami ?? '',
        ishHaqiTuri: record.ishHaqiTuri ?? 'fixed_amount',
        ishHaqiSummasi: record.fixSumma ? maskMoney(String(record.fixSumma)) : '',
        ishHaqiFoizi: record.fixFoiz ? String(record.fixFoiz) : '',
        ishgaOlinganSana: record.sana ?? '',
        qoshimchaSumma: record.extraSumma ? maskMoney(String(record.extraSumma)) : '',
        qoshimchaFoizi: record.extraFoiz ? String(record.extraFoiz) : '',
      }
      setEditEmployeeId(record.employeeId ?? '')
      setDraft(nextDraft)
      setInitialDraft(nextDraft)
    } else {
      setDraft(EMPTY_HIRE_DRAFT)
      setSelectedIds([])
    }
  }, [open, record])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  const editEmployeeName = kadrlar.find((k) => k.id === editEmployeeId)?.name
  const singleName = kadrlar.find((k) => k.id === selectedIds[0])?.name

  const fieldsValid = isHireDraftValid(draft)
  // Tahrirlashda hech narsa o'zgarmagan bo'lsa Saqlash o'chiq turadi (Figma); yaratishda kamida
  // bitta xodim tanlangan bo'lishi kerak.
  const canSave = isEdit ? fieldsValid && isDraftDirty(draft, initialDraft) : selectedIds.length > 0 && fieldsValid

  function submitEdit() {
    onSave({ employeeId: editEmployeeId, status: record.status, draft: buildHireValues(draft) })
    onOpenChange(false)
  }

  // Tanlangan har bir xodim uchun BIR XIL forma qiymatlari bilan alohida hujjat yaratiladi.
  async function submitCreate(status) {
    if (!canSave || pending) return
    setPending(true)
    try {
      const values = buildHireValues(draft)
      for (const id of selectedIds) {
        // eslint-disable-next-line no-await-in-loop
        await onSaveOne({ employeeId: id, status, ...values })
      }
      onDone(selectedIds.length)
      onOpenChange(false)
    } catch {
      // xatolik haqida toast chaqiruvchi tomonda (onSaveOne) ko'rsatiladi; oyna ochiq qoladi
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Standart balandlik — 560×592, radius 12px: bu bo'limdagi modallar bir-birining ustiga
          "ichma-ich" ochiladi (Xodim/Tashkilot tanlang shu dialog ustida), shuning uchun barchasi
          bitta standart o'lchamda — ma'lumot kam bo'lsa ham hajm o'zgarmaydi. */}
      <DialogContent showCloseButton={false} className="flex h-[592px] flex-col gap-0 rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] sm:max-w-[560px]">
        <HireModalHeader
          title={isEdit ? 'Ishga qabul qilishni tahrirlash' : 'Xodimni ishga olish'}
          onClose={() => onOpenChange(false)}
        />

        <div className="min-h-0 flex-1 overflow-auto px-6 pb-5 pt-2">
          <div className="mb-4">
            <label className={compactLabelCls}>Xodim</label>
            {isEdit ? (
              <div className={cn(compactFieldCls, 'flex items-center bg-[#F5F5F5] text-[#0A0A0A] dark:bg-white/5 dark:text-white')}>
                {editEmployeeName}
              </div>
            ) : (
              <>
                {/* Figma: "Xodim" bosilganda oddiy dropdown emas, izlab-tanlash oynasi
                    (EmployeePickerModal) ochiladi — `multiple` prop'ga qarab bitta yoki ko'p
                    tanlash rejimida. */}
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className={cn(compactFieldCls, 'flex items-center justify-between text-left')}
                >
                  <span className={cn('truncate', selectedIds.length === 0 && 'text-[#737373]')}>
                    {selectedIds.length === 0
                      ? 'Xodim ro‘yxatidan tanlang'
                      : multiple
                        ? `${selectedIds.length} ta xodim tanlandi`
                        : singleName}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 text-[#737373]" />
                </button>
                <EmployeePickerModal
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  employees={kadrlar}
                  multiple={multiple}
                  onConfirm={(ids) => setSelectedIds(ids)}
                />
              </>
            )}
          </div>

          <RecruitmentFieldsGrid draft={draft} set={set} orgs={orgs} branches={branches} positions={positions} compact />
        </div>

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2.5 rounded-b-[12px] bg-[#F5F5F5] px-6 dark:bg-white/5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={hireFooterBtnCls}>
            <X className="size-4" /> Bekor qilish
          </Button>
          {isEdit ? (
            <Button
              type="button"
              disabled={!canSave}
              onClick={submitEdit}
              className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
            >
              <Check className="size-4" /> Saqlash
            </Button>
          ) : (
            <>
              <Button
                type="button"
                disabled={!canSave || pending}
                onClick={() => submitCreate('draft')}
                className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
              >
                <Check className="size-4" /> Saqlash
              </Button>
              <Button
                type="button"
                disabled={!canSave || pending}
                onClick={() => submitCreate('confirmed')}
                className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#00A25C] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#008C4F] disabled:opacity-60"
              >
                <Check className="size-4" /> Tasdiqlash
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
