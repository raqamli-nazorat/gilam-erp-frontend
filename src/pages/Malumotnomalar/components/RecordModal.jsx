import { useEffect, useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function RecordModal({ open, onOpenChange, entity, fields, record, onSave, onDelete }) {
  const isEdit = !!record
  const [draft, setDraft] = useState({})

  useEffect(() => {
    if (!open) return
    const base = {
      active: record?.active ?? true,
      yaratilgan: record?.yaratilgan ?? '',
      ozgartirilgan: record?.ozgartirilgan ?? '',
    }
    fields.forEach((f) => {
      base[f.key] = record?.[f.key] ?? ''
    })
    setDraft(base)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = fields.filter((f) => f.required).every((f) => String(draft[f.key] ?? '').trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? `${cap(entity)}ni tahrirlash` : `Yangi ${entity}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 px-5 py-4">
          {fields.map((f) => (
            <div key={f.key} className={cn(f.full && 'col-span-2')}>
              <Label className={labelCls}>
                {f.label}
                {f.required && ' *'}
              </Label>
              {f.kind === 'select' ? (
                <Select value={draft[f.key] || '__none'} onValueChange={(v) => set(f.key, v === '__none' ? '' : v)}>
                  <SelectTrigger className={fieldCls}>
                    <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">Tanlang</span> : v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Tanlang</SelectItem>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.swatchKey ? (
                <div className="relative">
                  <Input
                    value={draft[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder || 'Kiriting'}
                    className={cn(fieldCls, 'pr-9')}
                  />
                  <span
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-black/5"
                    style={{ backgroundColor: draft[f.swatchKey] || '#E5E5E5' }}
                  />
                </div>
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

          {isEdit && (
            <>
              <div>
                <Label className={labelCls}>Yaratilgan</Label>
                <Input
                  value={draft.yaratilgan ?? ''}
                  disabled
                  className={fieldCls}
                />
              </div>
              <div>
                <Label className={labelCls}>Yangilangan</Label>
                <Input
                  value={draft.ozgartirilgan ?? ''}
                  disabled
                  className={fieldCls}
                />
              </div>
            </>
          )}
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
