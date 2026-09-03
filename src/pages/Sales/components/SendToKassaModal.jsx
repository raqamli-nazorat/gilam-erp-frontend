import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import { SALE_CASHBOXES } from '@/features/sales/salesMockData'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
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

export default function SendToKassaModal({ open, onOpenChange, doc, exchangeRate, onConfirm }) {
  const [cashbox, setCashbox] = useState(SALE_CASHBOXES[0])
  if (!doc) return null
  const gross = doc.rows.reduce((s, r) => s + r.sum, 0)
  const grossUzs = Math.round(gross * exchangeRate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Kassaga yuborilsinmi?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Hujjat kassirga o‘tadi va uning navbatida ko‘rinadi. Yuborilgandan keyin qatorlarni
          o‘zgartirib bo‘lmaydi — faqat to‘lov qabul qilinadi.
        </p>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <Row l="Hujjat" r={`${doc.number} · ${formatDate(doc.date)}`} />
          <Row l="Kontragent" r={doc.counterparty || '—'} />
          <Row l="Jami summa" r={`${formatNumber(gross)} USD · ${formatNumber(grossUzs, 0)} UZS`} />
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">Kassa</Label>
          <Select value={cashbox} onValueChange={setCashbox}>
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{SALE_CASHBOXES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-3 gap-2 border-0 bg-transparent p-0">
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
              onConfirm(cashbox)
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Camera className="h-4 w-4" /> Kassaga yuborish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ l, r }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium">{r}</span>
    </div>
  )
}
