import { Check, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ActivateOrgModal({ open, onOpenChange, org, onConfirm }) {
  if (!org) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Tashkilot faollashtirilsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
          {[
            ['Tashkilot', org.name, false],
            ['INN', org.inn, true],
            ['Filiallar', `${org.stats.filiallar} ta`, false],
            ['Foydalanuvchilar', `${org.stats.foydalanuvchilar} ta`, false],
            ['To‘xtatilgan', org.suspend?.at ?? '—', false],
            ['Sababi', org.suspend?.reason ?? '—', false],
          ].map(([k, v, copyable]) => (
            <div key={k} className="flex items-center justify-between gap-3 py-1">
              <span className="shrink-0 text-[#737373] dark:text-muted-foreground">{k}</span>
              <span className="flex min-w-0 items-center gap-1.5 text-right font-medium text-[#0A0A0A] dark:text-white">
                <span className="truncate">{v}</span>
                {copyable && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(String(v))}
                    className="shrink-0 text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                    aria-label="Nusxa olish"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                  </button>
                )}
              </span>
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
