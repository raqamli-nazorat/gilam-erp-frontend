import { useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import RecruitmentFieldsGrid, {
  EMPTY_HIRE_DRAFT,
  buildHireValues,
  compactFieldCls,
  compactLabelCls,
  isHireDraftValid,
  useHireCatalogs,
} from './hireFields'

const pagerPillCls =
  'flex h-7 items-center justify-center rounded-lg bg-[#F5F5F5] px-1.5 text-[13px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] dark:bg-white/10 dark:text-white'

// "Xodimni ishga olish" — Figma dev-mode spec: 17px sarlavha, 36px ("control") maydonlar,
// ‹ i-Xodim › pager. Pager faqat 2 va undan ko'p xodim navbatda qolganda ko'rinadi — bitta
// xodim tanlanganda (yoki navbatda bitta qolganda) butunlay yashiriladi. Saqlash joriy xodimni
// saqlaydi va navbatdan chiqarib tashlaydi (shu bilan "qolgan xodimlar" soni kamayadi); Tasdiqlash
// navbatdagi qolgan hammasini saqlab, oynani yopadi.
export default function BulkHireModal({ open, onOpenChange, employees, onSaveOne, onDone }) {
  const { orgs, branches, positions } = useHireCatalogs(open)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [drafts, setDrafts] = useState({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    setIndex(0)
    setQueue(employees)
    setDrafts(Object.fromEntries(employees.map((e) => [e.id, EMPTY_HIRE_DRAFT])))
  }, [open, employees])

  const current = queue[index]
  const draft = drafts[current?.id] ?? EMPTY_HIRE_DRAFT
  const valid = isHireDraftValid(draft)
  const showPager = queue.length > 1

  const set = (k, v) =>
    setDrafts((d) => {
      const prev = d[current.id] ?? EMPTY_HIRE_DRAFT
      const next = { ...prev, [k]: v }
      if (k === 'tashkilot' && v !== prev.tashkilot) next.filial = ''
      return { ...d, [current.id]: next }
    })

  if (!current) return null

  async function saveEmployee(emp) {
    await onSaveOne({ employeeId: emp.id, ...buildHireValues(drafts[emp.id] ?? EMPTY_HIRE_DRAFT) })
  }

  async function handleSaqlash() {
    if (!valid || pending) return
    setPending(true)
    try {
      await saveEmployee(current)
      const next = queue.filter((e) => e.id !== current.id)
      if (next.length === 0) {
        onDone()
        onOpenChange(false)
        return
      }
      setQueue(next)
      setIndex((i) => Math.min(i, next.length - 1))
    } catch {
      // xatolik haqida toast chaqiruvchi tomonda (onSaveOne) ko'rsatiladi
    } finally {
      setPending(false)
    }
  }

  async function handleTasdiqlash() {
    if (pending) return
    const invalid = queue.some((e) => !isHireDraftValid(drafts[e.id] ?? EMPTY_HIRE_DRAFT))
    if (invalid) return
    setPending(true)
    try {
      for (const e of queue) {
        // eslint-disable-next-line no-await-in-loop
        await saveEmployee(e)
        setQueue((q) => q.filter((x) => x.id !== e.id))
      }
      onDone()
      onOpenChange(false)
    } catch {
      // xatolik haqida toast chaqiruvchi tomonda (onSaveOne) ko'rsatiladi; qolgan xodimlar saqlanmay qoladi
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 rounded-[20px] p-0 sm:max-w-[560px]">
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 px-6">
          <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">Xodimni ishga olish</h2>
          <div className="flex items-center gap-3">
            {showPager && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className={cn(pagerPillCls, 'w-6 px-0 disabled:opacity-30')}
                  aria-label="Oldingi xodim"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className={pagerPillCls}>{index + 1}-Xodim</span>
                <button
                  type="button"
                  disabled={index === queue.length - 1}
                  onClick={() => setIndex((i) => Math.min(queue.length - 1, i + 1))}
                  className={cn(pagerPillCls, 'w-6 px-0 disabled:opacity-30')}
                  aria-label="Keyingi xodim"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
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
        </div>

        <div className="max-h-[65vh] overflow-auto px-6 pb-5 pt-2">
          <div className="mb-4">
            <label className={compactLabelCls}>Xodim</label>
            <div className={cn(compactFieldCls, 'flex items-center bg-[#F5F5F5] dark:bg-white/5')}>{current.name}</div>
          </div>

          <RecruitmentFieldsGrid draft={draft} set={set} orgs={orgs} branches={branches} positions={positions} compact />
        </div>

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2.5 rounded-b-[20px] bg-[#F5F5F5] px-6 dark:bg-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 w-[109px] gap-1.5 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="size-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!valid || pending}
            onClick={handleSaqlash}
            className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
          >
            <Check className="size-4" /> Saqlash
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={handleTasdiqlash}
            className="h-9 w-[109px] gap-1.5 rounded-[8px] bg-[#00A25C] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#008C4F] disabled:opacity-60"
          >
            <Check className="size-4" /> Tasdiqlash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
