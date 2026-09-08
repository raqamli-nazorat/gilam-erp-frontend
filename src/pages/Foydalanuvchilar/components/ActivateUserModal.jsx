import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ActivateUserModal({ open, onOpenChange, user, onConfirm }) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Foydalanuvchini faollashtirishmi?
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-[#E6FAF1] px-4 py-3 text-[13px] leading-[19px] dark:bg-[#047A47]/15">
          <p className="text-[#047A47] dark:text-[#34D399]">Faollashtirilgandan so‘ng foydalanuvchi tizimga qayta kira oladi.</p>
          <p className="mt-1.5 text-[#DC2626] dark:text-[#F87171]">Roli va tashkiloti o‘zgarmaydi. Faollashtirish audit jurnaliga yoziladi.</p>
        </div>

        <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
          {[
            ['Foydalanuvchi', user.name],
            ['Roli', user.rol],
            ['Bloklangan', user.block?.at ?? '—'],
            ['Sababi', user.block?.reason ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-[#737373] dark:text-muted-foreground">{k}</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{v}</span>
            </div>
          ))}
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
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Faollashtirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
