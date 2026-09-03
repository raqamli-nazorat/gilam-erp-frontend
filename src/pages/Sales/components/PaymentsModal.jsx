import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { PAYMENT_TYPES, SALE_CASHBOXES } from '@/features/sales/salesMockData'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker, toISODate, fromISODate } from '@/components/ui/date-picker'
import { NumberInput } from '@/components/ui/number-input'
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

const fieldCls = 'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function PaymentsModal({ open, onOpenChange, doc, exchangeRate, onAddPayment }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ date: '', cashbox: SALE_CASHBOXES[0], type: PAYMENT_TYPES[0], usd: '' })
  if (!doc) return null

  const gross = doc.rows.reduce((s, r) => s + r.sum, 0)
  const paidUsd = doc.payments.reduce((s, p) => s + p.usd, 0)
  const paidUzs = doc.payments.reduce((s, p) => s + p.uzs, 0)
  const debtUsd = Number((gross - paidUsd).toFixed(2))
  const debtUzs = Math.round(debtUsd * exchangeRate)

  function submit() {
    const usd = Number(form.usd) || 0
    if (usd <= 0) return
    onAddPayment({
      date: form.date || new Date().toISOString().slice(0, 10),
      cashbox: form.cashbox,
      type: form.type,
      usd,
      uzs: Math.round(usd * exchangeRate),
    })
    setForm({ date: '', cashbox: SALE_CASHBOXES[0], type: PAYMENT_TYPES[0], usd: '' })
    setAdding(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-5 sm:max-w-[720px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            To'lovlar ro'yxati · {doc.number}
          </DialogTitle>
          <button type="button" onClick={() => onOpenChange(false)} className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-[#E5E5E5] dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                <th className="w-10 px-3 text-left">#</th>
                <th className="px-3 text-left">SANA</th>
                <th className="px-3 text-left">KASSA</th>
                <th className="px-3 text-left">TURI</th>
                <th className="px-3 text-right">SUMMA, USD</th>
                <th className="px-3 text-right">SUMMA, UZS</th>
              </tr>
            </thead>
            <tbody>
              {doc.payments.map((p, i) => (
                <tr key={p.id} className="h-11 border-b border-[#E5E5E5] dark:border-white/5">
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">{formatDate(p.date)}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{p.cashbox}</td>
                  <td className="px-3 text-[13px] text-[#737373] dark:text-muted-foreground">{p.type}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.usd)}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.uzs, 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-10">
                <td className="px-3" />
                <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={3}>JAMI</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(paidUsd)}</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(paidUzs, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center justify-between text-[13px] font-medium">
          <span className="text-[#737373]">Qoldiq qarz</span>
          <span className="text-[#DC2626]">{formatNumber(debtUsd)} USD · {formatNumber(debtUzs, 0)} UZS</span>
        </div>

        {adding && (
          <div className="grid grid-cols-4 gap-2.5 rounded-lg border border-[#E5E5E5] p-3 dark:border-white/10">
            <div>
              <Label className={labelCls}>Sana</Label>
              <DatePicker value={fromISODate(form.date)} onChange={(d) => setForm((f) => ({ ...f, date: toISODate(d) }))} />
            </div>
            <div>
              <Label className={labelCls}>Kassa</Label>
              <Select value={form.cashbox} onValueChange={(v) => setForm((f) => ({ ...f, cashbox: v }))}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>{SALE_CASHBOXES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Turi</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Summa, USD</Label>
              <NumberInput pad={2} value={form.usd} onChange={(e) => setForm((f) => ({ ...f, usd: e.target.value }))} className={fieldCls} />
            </div>
          </div>
        )}

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2 border-0 bg-transparent p-0 sm:justify-end">
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
            onClick={() => (adding ? submit() : setAdding(true))}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Eye className="h-4 w-4" /> To'lov qo'shish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
