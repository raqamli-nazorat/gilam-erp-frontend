import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fieldCls =
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function RecordModal({ open, onOpenChange, entity, fields, record, onSave }) {
  const isEdit = !!record
  const [draft, setDraft] = useState({})

  useEffect(() => {
    if (!open) return
    const base = { active: record?.active ?? true }
    fields.forEach((f) => { base[f.key] = record?.[f.key] ?? '' })
    setDraft(base)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = fields.filter((f) => f.required).every((f) => String(draft[f.key] ?? '').trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? `${cap(entity)}ni tahrirlash` : `Yangi ${entity}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          {fields.map((f) => (
            <div key={f.key} className={cn(f.full && 'col-span-2')}>
              <Label className={labelCls}>
                {f.label}{f.required && ' *'}
              </Label>
              {f.kind === 'select' ? (
                <Select value={draft[f.key] || '__none'} onValueChange={(v) => set(f.key, v === '__none' ? '' : v)}>
                  <SelectTrigger className={fieldCls}>
                    <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">Tanlang</span> : v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Tanlang</SelectItem>
                    {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={draft[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder || 'Kiriting'}
                  className={fieldCls}
                />
              )}
            </div>
          ))}

          <label className="col-span-2 flex cursor-pointer items-center gap-2.5 text-[14px] text-[#0A0A0A] dark:text-white">
            <Switch checked={draft.active} onCheckedChange={(v) => set('active', v)} />
            Faol · ro'yxatda ko'rinadi
          </label>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-1 gap-2 border-0 bg-transparent p-0">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
