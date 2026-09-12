import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function RehireEmployeeModal({ open, onOpenChange, employee, onConfirm }) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Xodimni qayta ishga olish?
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
          {[
            ['Xodim', employee.name],
            ['Lavozimi', employee.lavozim],
            ['Ishdan chiqarilgan', employee.termination?.at ?? '—'],
            ['Sababi', employee.termination?.reason ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-1">
              <span className="shrink-0 text-[#737373] dark:text-muted-foreground">{k}</span>
              <span className="text-right font-medium text-[#0A0A0A] dark:text-white">{v}</span>
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
            <Check className="h-4 w-4" /> Ishga olish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
