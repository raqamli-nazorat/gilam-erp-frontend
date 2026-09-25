import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const fieldCls =
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

// Backend "WorkSchedule.days": 0=Dushanba ... 6=Yakshanba — key shu raqamning o'zi.
export const WEEKDAYS = [
  { key: 0, label: 'Du' },
  { key: 1, label: 'Se' },
  { key: 2, label: 'Ch' },
  { key: 3, label: 'Pa' },
  { key: 4, label: 'Ju' },
  { key: 5, label: 'Sh' },
  { key: 6, label: 'Ya' },
]

export function formatDaysPart(days) {
  if (days.length === 0) return ''
  if (days.length === 7) return 'kunlik'
  const idxs = days.map((d) => WEEKDAYS.findIndex((w) => w.key === d)).sort((a, b) => a - b)
  const contiguous = idxs.every((v, i) => i === 0 || v === idxs[i - 1] + 1)
  if (contiguous && idxs.length > 1) return `${WEEKDAYS[idxs[0]].label}-${WEEKDAYS[idxs[idxs.length - 1]].label}`
  return idxs.map((i) => WEEKDAYS[i].label).join('/')
}

function autoTavsif(fromHour, toHour, days) {
  const timePart = fromHour && toHour ? `${fromHour}-${toHour}` : ''
  return [timePart, formatDaysPart(days)].filter(Boolean).join(', ')
}

const EMPTY = { filialId: '', name: '', tavsif: '', fromHour: '', toHour: '', days: [] }

export default function IshGrafigiModal({ open, onOpenChange, record, onSave, onDelete }) {
  const isEdit = !!record
  const dispatch = useDispatch()
  const branches = useSelector((s) => s.filiallar.list)
  const branchesStatus = useSelector((s) => s.filiallar.listStatus)
  const [draft, setDraft] = useState(EMPTY)
  // Tavsif qo'lda o'zgartirilgan bo'lsa, Ish kunlari/vaqti o'zgarganda uni endi avtomatik
  // qayta yozib qo'ymaymiz (foydalanuvchi matnini bosib o'tmaslik uchun).
  const [tavsifTouched, setTavsifTouched] = useState(false)

  useEffect(() => {
    if (branchesStatus === 'idle') dispatch(fetchBranches())
  }, [branchesStatus, dispatch])

  useEffect(() => {
    if (!open) return
    const tavsif = record?.tavsif ?? ''
    const days = record?.days ?? []
    const fromHour = record?.fromHour ?? ''
    const toHour = record?.toHour ?? ''
    setDraft({
      filialId: record?.filialId ?? '',
      name: record?.name ?? '',
      tavsif,
      fromHour,
      toHour,
      days,
    })
    // Tavsif avtomatik shakllantirilgan bo'lsa — avtomatik yangilanishda davom etadi; qo'lda
    // yozilgan bo'lsa — foydalanuvchi matni ustidan yozilmaydi.
    setTavsifTouched(isEdit && !!tavsif && tavsif !== autoTavsif(fromHour, toHour, days))
  }, [open, record, isEdit])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const setTavsif = (v) => {
    setTavsifTouched(true)
    set('tavsif', v)
  }
  const toggleDay = (key) =>
    setDraft((d) => {
      const days = d.days.includes(key) ? d.days.filter((k) => k !== key) : [...d.days, key]
      const next = { ...d, days }
      if (!tavsifTouched) next.tavsif = autoTavsif(d.fromHour, d.toHour, days)
      return next
    })
  const setHour = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (!tavsifTouched) next.tavsif = autoTavsif(next.fromHour, next.toHour, d.days)
      return next
    })

  const canSave = draft.name.trim().length > 0 && !!draft.filialId && !!draft.fromHour && !!draft.toHour && draft.days.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Ish grafigi' : 'Yangi ish grafigi'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-4">
          <div>
            <Label className={labelCls}>Filiali</Label>
            <Select value={draft.filialId || '__none'} onValueChange={(v) => set('filialId', v === '__none' ? '' : v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>
                  {(v) => (v === '__none' ? <span className="text-[#737373]">Filialni tanlang</span> : branches.find((b) => b.id === v)?.name ?? '')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelCls}>Nomi</Label>
            <Input
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Masalan: Asosiy smena"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Tavsif</Label>
            <Input
              value={draft.tavsif}
              onChange={(e) => setTavsif(e.target.value)}
              placeholder="Ish vaqti (masalan: 09:00-18:00, Dush-Juma)"
              className={fieldCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={labelCls}>Ish boshlanishi</Label>
              <input type="time" value={draft.fromHour} onChange={(e) => setHour('fromHour', e.target.value)} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Ish tugashi</Label>
              <input type="time" value={draft.toHour} onChange={(e) => setHour('toHour', e.target.value)} className={fieldCls} />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground">Ish kunlari</Label>
              <span className="text-[12px] font-medium text-[#737373] dark:text-muted-foreground">
                {draft.days.length}/7
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((d) => {
                const active = draft.days.includes(d.key)
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={cn(
                      'h-10 rounded-lg text-[14px] font-medium transition-colors',
                      active
                        ? 'bg-[#0052D2] text-white'
                        : 'bg-[#F5F5F5] text-[#525252] hover:bg-[#E5E5E5] dark:bg-white/5 dark:text-muted-foreground dark:hover:bg-white/10'
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 flex items-center gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row sm:justify-between">
          {isEdit ? (
            <Button
              type="button"
              onClick={() => onDelete?.()}
              className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <Trash2 className="h-4 w-4" /> O‘chirish
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => {
                onSave(draft)
                onOpenChange(false)
              }}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              <Check className="h-4 w-4" /> Saqlash
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
