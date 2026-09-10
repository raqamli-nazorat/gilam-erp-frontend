import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
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

export default function BlockUserModal({ open, onOpenChange, user, onConfirm }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Foydalanuvchini bloklash?
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
          {[
            ['Foydalanuvchi', user.name],
            ['Roli', user.rol],
            ['Tashkiloti', user.tashkilot],
            ['Filiali', user.filial],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-[#737373] dark:text-muted-foreground">{k}</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{v}</span>
            </div>
          ))}
        </div>

        <div>
          <Label className="mb-1.5 block text-[13px] font-normal text-[#525252] dark:text-muted-foreground">Bloklash sababi</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masalan: xodim ishdan bo‘shadi"
            className="h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white"
          />
          <p className="mt-1.5 text-[12px] text-[#737373] dark:text-muted-foreground">Majburiy. Sabab audit jurnaliga yoziladi.</p>
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
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason.trim())
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <X className="h-4 w-4" /> Bloklash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
