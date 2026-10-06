import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Tasdiqlangan kirimni bekor qilish — sabab majburiy; hujjat jurnalda «Bekor qilingan» bo'lib qoladi.
export default function CancelReceiptModal({ open, onOpenChange, receipt, onConfirm }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  if (!receipt) return null
  const totalM2 = receipt.rows.reduce((sum, r) => sum + r.m2, 0)
  const trimmed = reason.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Kirim bekor qilinsinmi?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {receipt.rows.length} ta partiya bekor qilinadi va ombor qoldig'idan {formatNumber(totalM2)} m²
            ayiriladi. Hujjat jurnalda «Bekor qilingan» holatida qoladi, tarixi saqlanadi.
          </p>
        </div>

        <dl className="grid grid-cols-[140px_1fr] gap-y-2 rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
          <dt className="text-[#737373]">Hujjat</dt>
          <dd className="text-[#0A0A0A] dark:text-white">{receipt.number} · {formatDate(receipt.date)}</dd>
          <dt className="text-[#737373]">Kontragent</dt>
          <dd className="text-[#0A0A0A] dark:text-white">{receipt.counterparty || '—'}</dd>
          <dt className="text-[#737373]">Kirim summasi</dt>
          <dd className="text-[#0A0A0A] dark:text-white">
            {formatNumber(receipt.sumUsd)} USD · {formatNumber(receipt.sumUzs)} UZS
          </dd>
        </dl>

        <div>
          <label htmlFor="cancel-reason" className="mb-1.5 block text-[13px] font-medium text-[#0A0A0A] dark:text-white">
            Bekor qilish sababi <span className="text-red-600">*</span>
          </label>
          <Input
            id="cancel-reason"
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Sababni yozing…"
            maxLength={500}
          />
          <p className="mt-1.5 text-[12px] text-[#737373]">Sabab jurnalda va hujjat tarixida saqlanadi.</p>
        </div>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Yopish
          </Button>
          <Button
            type="button"
            disabled={!trimmed}
            onClick={() => onConfirm(trimmed)}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white hover:bg-[#B91C1C] disabled:bg-[#F5F5F5] disabled:text-[#A3A3A3] disabled:opacity-100"
          >
            <X className="h-4 w-4" /> Kirimni bekor qilish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
