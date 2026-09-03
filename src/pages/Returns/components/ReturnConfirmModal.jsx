import { Check, Info, X } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ReturnConfirmModal({ open, onOpenChange, doc, exchangeRate, onConfirm }) {
  if (!doc) return null
  const m2 = doc.rows.reduce((s, r) => s + r.m2, 0)
  const sumUsd = doc.rows.reduce((s, r) => s + r.sum, 0)
  const sumUzs = Math.round(sumUsd * exchangeRate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Qaytarish tasdiqlansinmi?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Tasdiqlangandan keyin tovar omborga kiritiladi va mijoz qarzi kamaytiriladi. Qaytarish
          kirimi hujjati avtomatik yaratiladi.
        </p>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <Row label="Hujjat" value={`${doc.number} · ${formatDate(doc.date)}`} />
          <Row label="Kontragent" value={doc.counterparty || '—'} />
          <Row label="Qaytariladigan maydon" value={`${formatNumber(m2)} m²`} />
          <Row label="Summa" value={`${formatNumber(sumUsd)} USD · ${formatNumber(sumUzs, 0)} UZS`} />
        </div>

        <div className="flex gap-2.5 rounded-lg bg-[#EAF1FE] p-3 text-[13px] text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>«Qaytarish kirimi» bo'limida {doc.number} asosida yangi kirim paydo bo'ladi.</p>
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
            <Check className="h-4 w-4" /> Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
