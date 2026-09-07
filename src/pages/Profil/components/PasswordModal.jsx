import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
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

const fieldCls =
  'h-11 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

const EMPTY = { current: '', next: '', confirm: '' }

export default function PasswordModal({ open, onOpenChange, onSave }) {
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (open) setDraft(EMPTY)
  }, [open])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.current.trim().length > 0 && draft.next.trim().length >= 8 && draft.next === draft.confirm

  function handleSave() {
    onSave()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Parolni o‘zgartirish
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 pb-4 pt-2">
          <div>
            <Label className={labelCls}>Joriy parol</Label>
            <Input
              type="password"
              value={draft.current}
              onChange={(e) => set('current', e.target.value)}
              placeholder="Joriy parolni kiriting"
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Yangi parol</Label>
            <Input
              type="password"
              value={draft.next}
              onChange={(e) => set('next', e.target.value)}
              placeholder="Kamida 8 belgi"
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Parolni takrorlang</Label>
            <Input
              type="password"
              value={draft.confirm}
              onChange={(e) => set('confirm', e.target.value)}
              placeholder="Yangi parolni qayta kiriting"
              className={fieldCls}
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2.5 rounded-b-[20px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 gap-2 rounded-lg border border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-11 gap-2 rounded-lg bg-[#0052D2] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
