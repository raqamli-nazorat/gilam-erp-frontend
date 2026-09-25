import { useState } from 'react'
import { Check, Loader2, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const fieldCls =
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
export const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

export function FormField({ label, full, children }) {
  return (
    <div className={cn(full && 'col-span-2')}>
      <Label className={labelCls}>{label}</Label>
      {children}
    </div>
  )
}

// `options`: [{ id, name }]
export function OptionSelect({ value, onChange, options, placeholder = 'Tanlang', disabled }) {
  return (
    <Select value={value || '__none'} onValueChange={(v) => onChange(v === '__none' ? '' : v)} disabled={disabled}>
      <SelectTrigger className={cn(fieldCls, disabled && 'opacity-60')}>
        <SelectValue>
          {(v) =>
            v === '__none' ? (
              <span className="text-[#737373]">{placeholder}</span>
            ) : (
              options.find((o) => o.id === v)?.name ?? ''
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-[13px] text-[#737373]">Ma’lumot yo‘q</div>
        ) : (
          options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

// Figma'dagi "Yangi ..." / "... tahrirlash" oynalarining umumiy qobig'i: sarlavha, 2 ustunli
// maydonlar to'ri, tahrirlashda Yaratilgan/Yangilangan (o'qish uchun), pastki panel
// (O'chirish | Bekor qilish, Saqlash). `onSave` promise qaytaradi — xato bo'lsa oyna ochiq qoladi.
// Tahrirlashda "Saqlash" faqat biror narsa o'zgarganda (`isDirty`) yoqiladi.
export default function ReferenceFormModal({
  open,
  onOpenChange,
  title,
  record,
  isValid,
  isDirty,
  onSave,
  onDelete,
  children,
}) {
  const isEdit = !!record
  const [saving, setSaving] = useState(false)
  const canSave = isValid && (!isEdit || isDirty) && !saving

  async function handleSave() {
    setSaving(true)
    try {
      await onSave()
      onOpenChange(false)
    } catch {
      // Xato xabari sahifadagi toast orqali ko'rsatiladi.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between px-5 pt-5">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-4 overflow-y-auto px-5 py-4">
          {children}
          {isEdit && (
            <>
              <FormField label="Yaratilgan">
                <Input value={record.yaratilgan} disabled className={fieldCls} />
              </FormField>
              <FormField label="Yangilangan">
                <Input value={record.ozgartirilgan} disabled className={fieldCls} />
              </FormField>
            </>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 flex shrink-0 items-center gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row sm:justify-between">
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
              onClick={handleSave}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Saqlash
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Modal draft holati: ochilganda `record`dan (yoki EMPTY'dan) to'ldiriladi; isDirty — boshlang'ichdan farq.
export function useFormDraft(open, record, empty) {
  const [draft, setDraft] = useState(empty)
  const [initial, setInitial] = useState(empty)
  const [openedFor, setOpenedFor] = useState(null)

  // Ochilish/yozuv almashganda render paytida qayta boshlaymiz (effect'siz).
  const key = open ? (record?.id ?? 'new') : null
  if (key !== openedFor) {
    setOpenedFor(key)
    if (open) {
      const base = Object.fromEntries(Object.keys(empty).map((k) => [k, record?.[k] ?? empty[k]]))
      setDraft(base)
      setInitial(base)
    }
  }

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const isDirty = Object.keys(empty).some((k) => draft[k] !== initial[k])
  return { draft, setDraft, set, isDirty }
}
