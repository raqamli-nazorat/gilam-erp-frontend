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
  HireQueuePager,
  buildHireValues,
  compactFieldCls,
  compactLabelCls,
  hireFooterBtnCls,
  isDraftDirty,
  isHireDraftValid,
  useHireCatalogs,
} from './hireFields'
import EmployeePickerModal from './EmployeePickerModal'

const SINGLE_KEY = '__single__'

// Ishga olish/tahrirlash oynasi — uch rejim:
// - Tahrirlash (`record` bor): bitta hujjatning maydonlari, pagersiz.
// - Bitta xodim ishga olish (`record` yo'q, `employees` prop berilmagan): "Xodim" maydoni
//   bosilganda EmployeePickerModal (bitta tanlash) ochiladi; pager doim ko'rinadi lekin
//   statik "1-Xodim" (navbatda bitta xodim bo'lgani uchun o'q/olib-tashlash faolsiz).
// - Bir nechta xodim ishga olish (`record` yo'q, `employees` — oldindan tanlangan ro'yxat):
//   navbat — har bir xodimning O'Z alohida maydonlari bor, pager ("N-Xodim (N/JAMI)") orqali
//   navbat bo'ylab o'tiladi, qizil tugma joriy xodimni navbatdan (saqlamasdan) olib tashlaydi.
//   Saqlash/Tasdiqlash butun navbatni — har birini o'z maydonlari bilan — bir yo'la yuboradi.
export default function RecruitmentModal({ open, onOpenChange, record, employees, onSave, onSaveOne, onSaveBulk, onDone }) {
  const isEdit = !!record
  const isBulk = Array.isArray(employees)
  const { orgs, branches, positions } = useHireCatalogs(open)
  const kadrlar = useSelector((s) => s.xodimlar.list)

  // Tahrirlash uchun alohida (flat) draft/initial holat.
  const [editDraft, setEditDraft] = useState(EMPTY_HIRE_DRAFT)
  const [editInitial, setEditInitial] = useState(EMPTY_HIRE_DRAFT)
  const [editEmployeeId, setEditEmployeeId] = useState('')

  // Yaratish (bitta/bir nechta) uchun navbat.
  const [queue, setQueue] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [drafts, setDrafts] = useState({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    setPending(false)
    if (record) {
      const nextDraft = {
        // Hujjatning o'zi tashkilotni saqlamaydi, faqat filialni — filial orqali qaysi
        // tashkilotga tegishli ekanini branches ro'yxatidan topamiz (aks holda Tashkilot
        // bo'sh qolib, Filial tanlagichi ham hech narsa topa olmasdi — filialOptions
        // draft.tashkilot bo'yicha filtrlanadi).
        tashkilot: branches.find((b) => b.id === record.branchId)?.tashkilotId ?? '',
        filial: record.branchId ?? '',
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
      setEditDraft(nextDraft)
      setEditInitial(nextDraft)
    } else if (isBulk) {
      const nextQueue = employees.map((e) => ({ id: e.id, name: e.name }))
      setQueue(nextQueue)
      setDrafts(Object.fromEntries(nextQueue.map((item) => [item.id, EMPTY_HIRE_DRAFT])))
      setActiveIndex(0)
    } else {
      setQueue([{ id: '', name: '' }])
      setDrafts({ [SINGLE_KEY]: EMPTY_HIRE_DRAFT })
      setActiveIndex(0)
    }
    // `branches` deps'ga qo'shildi — modal ochilganda hali yuklanmagan bo'lishi mumkin
    // (useHireCatalogs asinxron so'raydi), yuklangach effekt qayta ishlab tashkilotni to'g'ri hosil qiladi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record, isBulk, branches])

  const current = queue[activeIndex]
  const keyFor = (item) => (isBulk ? item?.id : SINGLE_KEY)
  const draft = drafts[keyFor(current)] ?? EMPTY_HIRE_DRAFT

  const set = (k, v) =>
    setDrafts((d) => {
      const key = keyFor(current)
      const prev = d[key] ?? EMPTY_HIRE_DRAFT
      const next = { ...prev, [k]: v }
      if (k === 'tashkilot' && v !== prev.tashkilot) next.filial = ''
      return { ...d, [key]: next }
    })

  const editSet = (k, v) =>
    setEditDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  // Xodimlar ro'yxati (kadrlar) hali yuklanmagan bo'lishi mumkin — hujjatdagi ism zaxira sifatida.
  const editEmployeeName = kadrlar.find((k) => k.id === editEmployeeId)?.name ?? record?.employeeName

  const editCanSave = isHireDraftValid(editDraft) && isDraftDirty(editDraft, editInitial)
  const createCanSave =
    queue.length > 0 && queue.every((item) => item.id && isHireDraftValid(drafts[keyFor(item)] ?? EMPTY_HIRE_DRAFT))

  function submitEdit() {
    onSave({ employeeId: editEmployeeId, status: record.status, draft: buildHireValues(editDraft) })
    onOpenChange(false)
  }

  async function submitCreate(status) {
    if (!createCanSave || pending) return
    setPending(true)
    try {
      // Bir nechta xodim (bulk) — bitta so'rovda (onSaveBulk) yuboramiz, N ta alohida
      // so'rov o'rniga. Bitta xodim (tanlab yoki navbatda bitta) — onSaveOne yetarli.
      if (isBulk && queue.length > 1 && onSaveBulk) {
        await onSaveBulk(
          queue.map((item) => ({ employeeId: item.id, draft: buildHireValues(drafts[keyFor(item)]) })),
          status
        )
      } else {
        for (const item of queue) {
          // eslint-disable-next-line no-await-in-loop
          await onSaveOne({ employeeId: item.id, status, ...buildHireValues(drafts[keyFor(item)]) })
        }
      }
      onDone(queue.length)
      onOpenChange(false)
    } catch {
      // xatolik haqida toast chaqiruvchi tomonda (onSaveOne/onSaveBulk) ko'rsatiladi; oyna ochiq qoladi
    } finally {
      setPending(false)
    }
  }

  function removeCurrent() {
    setQueue((q) => {
      const next = q.filter((_, i) => i !== activeIndex)
      setActiveIndex((i) => Math.min(i, next.length - 1))
      return next
    })
  }

  function pickSingle(ids) {
    const emp = kadrlar.find((k) => k.id === ids[0])
    if (!emp) return
    setQueue([{ id: emp.id, name: emp.name }])
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
          right={
            !isEdit && (
              <HireQueuePager
                index={activeIndex}
                total={queue.length}
                onPrev={() => setActiveIndex((i) => Math.max(0, i - 1))}
                onNext={() => setActiveIndex((i) => Math.min(queue.length - 1, i + 1))}
                onRemove={removeCurrent}
              />
            )
          }
        />

        {isEdit ? (
          <div className="min-h-0 flex-1 overflow-auto px-6 pb-5 pt-2">
            <div className="mb-4">
              <label className={compactLabelCls}>Xodim</label>
              <div className={cn(compactFieldCls, 'flex items-center bg-[#F5F5F5] text-[#0A0A0A] dark:bg-white/5 dark:text-white')}>
                {editEmployeeName}
              </div>
            </div>
            <RecruitmentFieldsGrid draft={editDraft} set={editSet} orgs={orgs} branches={branches} positions={positions} compact />
          </div>
        ) : (
          current && (
            <div className="min-h-0 flex-1 overflow-auto px-6 pb-5 pt-2">
              <div className="mb-4">
                <label className={compactLabelCls}>Xodim</label>
                {isBulk ? (
                  <div className={cn(compactFieldCls, 'flex items-center bg-[#F5F5F5] text-[#0A0A0A] dark:bg-white/5 dark:text-white')}>
                    {current.name}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className={cn(compactFieldCls, 'flex items-center justify-between text-left')}
                    >
                      <span className={cn('truncate', !current.id && 'text-[#737373]')}>
                        {current.id ? current.name : 'Xodim ro‘yxatidan tanlang'}
                      </span>
                      <ChevronDown className="size-3.5 shrink-0 text-[#737373]" />
                    </button>
                    <EmployeePickerModal
                      open={pickerOpen}
                      onOpenChange={setPickerOpen}
                      employees={kadrlar}
                      multiple={false}
                      onConfirm={pickSingle}
                    />
                  </>
                )}
              </div>
              <RecruitmentFieldsGrid draft={draft} set={set} orgs={orgs} branches={branches} positions={positions} compact />
            </div>
          )
        )}

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2.5 rounded-b-[12px] bg-[#F5F5F5] px-6 dark:bg-white/5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={hireFooterBtnCls}>
            <X className="size-4" /> Bekor qilish
          </Button>
          {isEdit ? (
            <Button
              type="button"
              disabled={!editCanSave}
              onClick={submitEdit}
              className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
            >
              <Check className="size-4" /> Saqlash
            </Button>
          ) : (
            <>
              <Button
                type="button"
                disabled={!createCanSave || pending}
                onClick={() => submitCreate('draft')}
                className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
              >
                <Check className="size-4" /> Saqlash
              </Button>
              <Button
                type="button"
                disabled={!createCanSave || pending}
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
