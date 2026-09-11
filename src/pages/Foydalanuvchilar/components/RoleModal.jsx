import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TASHKILOT_NOMLARI } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fieldCls =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground'

const TASHKILOT_OPTIONS = ['Barcha tashkilotlar', ...TASHKILOT_NOMLARI]

const EMPTY = { name: '', tashkilot: 'Barcha tashkilotlar', holat: 'Faol' }

export default function RoleModal({ open, onOpenChange, role, onSave }) {
  const isEdit = !!role
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    setDraft(
      role
        ? {
            name: role.name ?? '',
            tashkilot: role.tashkilot ?? 'Barcha tashkilotlar',
            holat: role.holat === 'active' ? 'Faol' : 'Nofaol',
          }
        : EMPTY
    )
  }, [open, role])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.name.trim().length > 1

  function handleSave() {
    onSave({
      name: draft.name.trim(),
      tashkilot: draft.tashkilot,
      holat: draft.holat === 'Faol' ? 'active' : 'inactive',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 pl-6 pr-4">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Tahrirlash' : 'Yangi rol'}
          </DialogTitle>
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

        <div className="grid grid-cols-2 gap-4 px-6 pb-6 pt-2">
          <div className="col-span-2">
            <Label className={labelCls}>Rol nomi</Label>
            <Input
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Masalan: Katta kassir"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Tashkilot</Label>
            <Select value={draft.tashkilot} onValueChange={(v) => set('tashkilot', v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASHKILOT_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={labelCls}>Holat</Label>
            <Select value={draft.holat} onValueChange={(v) => set('holat', v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Faol">Faol</SelectItem>
                <SelectItem value="Nofaol">Nofaol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2 bg-[#F5F5F5] px-6 dark:bg-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-2 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="size-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={cn(
              'h-9 gap-2 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10'
            )}
          >
            <Check className="size-4" /> Saqlash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
