import { Loader2, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function SyncRatesModal({ open, onOpenChange, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[480px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-5 pb-2">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Kurslarni yangilash
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <p className="text-[14px] leading-6 text-[#0A0A0A] dark:text-white">
            Kurslar{' '}
            <a
              href="https://cbu.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#0052D2] underline-offset-2 hover:underline dark:text-[#60A5FA]"
            >
              cbu.uz
            </a>{' '}
            platformasidan yangilanishga rozimisiz?
          </p>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-0 flex gap-2 border-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 rounded-lg border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-9 gap-1.5 rounded-lg bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Yangilash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
