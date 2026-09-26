import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'

// Figma: FilterModal bilan bir xil qobiq — header 60px, body px-6, footer 72px #F5F5F5.
export default function TabelModal({ open, onOpenChange, title, width = 560, footer, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ maxWidth: width }}
        className="w-full gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 dark:bg-card"
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 pl-6 pr-4">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#0A0A0A] dark:text-white">{title}</DialogTitle>
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

        <div className="px-6 pb-6 pt-2">{children}</div>

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2 bg-[#F5F5F5] px-6 dark:bg-white/5">{footer}</div>
      </DialogContent>
    </Dialog>
  )
}

export function ModalButton({ variant = 'primary', className, ...props }) {
  return (
    <Button
      type="button"
      variant={variant === 'outline' ? 'outline' : 'default'}
      className={cn(
        'h-9 gap-2 rounded-[8px] px-4 text-[14px] font-medium shadow-[0px_1px_2px_0px_#0000001A]',
        variant === 'outline'
          ? 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white'
          : 'bg-[#0052D2] text-white hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10',
        className
      )}
      {...props}
    />
  )
}
