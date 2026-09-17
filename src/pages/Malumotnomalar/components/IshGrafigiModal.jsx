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

// Backend "WorkSchedule"da hafta kunlari (Du/Se/Ch...) uchun alohida maydon yo'q (Swagger
// tasdiqlagan) — shuning uchun bu tanlov faqat Tavsifni avtomatik shakllantirish uchun
// ishlatiladi (UI-only), saqlashda alohida maydon sifatida yuborilmaydi.
const WEEKDAYS = [
  { key: 'mon', label: 'Du' },
  { key: 'tue', label: 'Se' },
  { key: 'wed', label: 'Ch' },
  { key: 'thu', label: 'Pa' },
  { key: 'fri', label: 'Ju' },
  { key: 'sat', label: 'Sh' },
  { key: 'sun', label: 'Ya' },
]

function formatDaysPart(days) {
  if (days.length === 0) return ''
  if (days.length === 7) return 'kunlik'
  const idxs = days.map((d) => WEEKDAYS.findIndex((w) => w.key === d)).sort((a, b) => a - b)
  const contiguous = idxs.every((v, i) => i === 0 || v === idxs[i - 1] + 1)
  if (contiguous && idxs.length > 1) return `${WEEKDAYS[idxs[0]].label}-${WEEKDAYS[idxs[idxs.length - 1]].label}`
  // "/" (vergul emas) — daysPart'ning o'zi tavsifning boshqa qismidan (timePart) faqat bitta
  // vergul bilan ajratiladi, shuning uchun daysPart ichida vergul bo'lmasligi kerak
  // (parseDaysFromTavsif shu bitta vergulga tayanadi).
  return idxs.map((i) => WEEKDAYS[i].label).join('/')
}

function autoTavsif(fromHour, toHour, days) {
  const timePart = fromHour && toHour ? `${fromHour}-${toHour}` : ''
  return [timePart, formatDaysPart(days)].filter(Boolean).join(', ')
}

// formatDaysPart/autoTavsif'ning teskarisi — backendda "days" saqlanmagani uchun, tahrirlashda
// oldin tanlangan Ish kunlarini FAQAT shu (o'zimiz yozgan) Tavsif matnidan qayta tiklaymiz.
// Matn qo'lda o'zgartirilgan/mos kelmasa — bo'sh massiv qaytadi (tiklab bo'lmadi, xato emas).
function parseDaysFromTavsif(tavsif) {
  if (!tavsif) return []
  const commaIdx = tavsif.indexOf(',')
  const daysPart = (commaIdx === -1 ? tavsif : tavsif.slice(commaIdx + 1)).trim()
  if (!daysPart) return []
  if (/^kunlik$/i.test(daysPart)) return WEEKDAYS.map((w) => w.key)
  const rangeMatch = daysPart.match(/^([A-Za-z]{2})-([A-Za-z]{2})$/)
  if (rangeMatch) {
    const fromIdx = WEEKDAYS.findIndex((w) => w.label === rangeMatch[1])
    const toIdx = WEEKDAYS.findIndex((w) => w.label === rangeMatch[2])
    return fromIdx !== -1 && toIdx !== -1 && fromIdx <= toIdx
      ? WEEKDAYS.slice(fromIdx, toIdx + 1).map((w) => w.key)
      : []
  }
  const labels = daysPart.split('/').map((s) => s.trim())
  const keys = labels.map((l) => WEEKDAYS.find((w) => w.label === l)?.key).filter(Boolean)
  return keys.length === labels.length ? keys : []
}

// Backend WorkSchedule majburiy sana oralig'ini (from_date/to_date) talab qiladi, lekin Figma
// dizaynida bunday maydon ko'rsatilmagan — shuning uchun orqa fonda "bugundan cheksizga"
// (uzoq kelajak sanasi) avtomatik belgilanadi, foydalanuvchiga ko'rinmaydi. Tahrirlashda
// mavjud yozuvning o'z sanasi saqlanadi (o'zgartirilmaydi).
const FAR_FUTURE_DATE = '2099-12-31'
function todayIso() {
  return new Date().toISOString().slice(0, 10)
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
    const parsedDays = isEdit ? parseDaysFromTavsif(tavsif) : []
    setDraft({
      filialId: record?.filialId ?? '',
      name: record?.name ?? '',
      tavsif,
      fromDate: record?.fromDate || todayIso(),
      toDate: record?.toDate || FAR_FUTURE_DATE,
      fromHour: record?.fromHour ?? '',
      toHour: record?.toHour ?? '',
      days: parsedDays,
    })
    // Tavsif avtomatik shakllantirilgan ko'rinsa (Ish kunlari undan muvaffaqiyatli tiklandi)
    // — yana avtomatik yangilanishda davom etadi. Qo'lda yozilgan/mos kelmaydigan tavsif
    // bo'lsa (tiklab bo'lmadi) — endi tegilmaydi, foydalanuvchi matni ustidan yozilmaydi.
    setTavsifTouched(isEdit && parsedDays.length === 0 && !!tavsif)
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

  const canSave = draft.name.trim().length > 0 && !!draft.filialId && !!draft.fromHour && !!draft.toHour
  const restDays = 7 - draft.days.length

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
                {draft.days.length}/{restDays}
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
