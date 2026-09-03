import { useMemo, useState } from 'react'
import { Wallet, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatNumber } from '@/lib/format'
import { employeeBreakdown, PAYROLL_KASSAS } from '@/features/payroll/payrollMockData'
import { Button } from '@/components/ui/button'
import { DatePicker, toISODate, fromISODate } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

const today = () => new Date().toISOString().slice(0, 10)

export default function PayModal({ open, onOpenChange, period, exchangeRate, onConfirm }) {
  const rows = employeeBreakdown.xodim_savdo

  const [selected, setSelected] = useState(() => new Set(rows.map((r) => r.empId)))
  const [kassa, setKassa] = useState(PAYROLL_KASSAS[0])
  const [payDate, setPayDate] = useState(today())
  const [payType, setPayType] = useState('cash')

  const reset = () => {
    setSelected(new Set(rows.map((r) => r.empId)))
    setKassa(PAYROLL_KASSAS[0])
    setPayDate(today())
    setPayType('cash')
  }

  const totals = useMemo(() => {
    const picked = rows.filter((r) => selected.has(r.empId))
    const usd = picked.reduce((s, r) => s + r.beriladigan, 0)
    return { count: picked.length, usd, uzs: Math.round(usd * exchangeRate) }
  }, [rows, selected, exchangeRate])

  const toggle = (empId) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(empId)) next.delete(empId)
      else next.add(empId)
      return next
    })

  const periodLabel = period ? `${formatDate(period.from)} — ${formatDate(period.to)}` : ''

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Ish haqini berish · {periodLabel}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Belgilangan xodimlarga to'lov kassadan chiqim sifatida yoziladi. Avans va
          ushlanmalar allaqachon ayirilgan.
        </p>

        <div className="overflow-hidden rounded-lg border border-[#E5E5E5] dark:border-white/10">
          {rows.map((r, i) => (
            <label
              key={r.empId}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3',
                i !== rows.length - 1 && 'border-b border-[#E5E5E5] dark:border-white/10'
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={selected.has(r.empId)} onCheckedChange={() => toggle(r.empId)} />
                <div>
                  <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">{r.name}</p>
                  <p className="text-[12px] text-[#737373] dark:text-muted-foreground">{r.role}</p>
                </div>
              </div>
              <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">
                {formatNumber(r.beriladigan)} USD
              </span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label className={labelCls}>Kassa</Label>
            <Select value={kassa} onValueChange={setKassa}>
              <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYROLL_KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={labelCls}>To'lov sanasi</Label>
            <DatePicker value={fromISODate(payDate)} onChange={(d) => setPayDate(toISODate(d))} />
          </div>
        </div>

        <div>
          <Label className={labelCls}>To'lov turi</Label>
          <div className="flex flex-col gap-2">
            <RadioRow checked={payType === 'cash'} onClick={() => setPayType('cash')} label="Naqd pul" />
            <RadioRow checked={payType === 'card'} onClick={() => setPayType('card')} label="Karta (HUMO / UZCARD)" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#EAF1FE] px-3.5 py-3 text-[13px] font-medium text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
          <span>{totals.count} ta xodim tanlandi</span>
          <span>{formatNumber(totals.usd)} USD · {formatNumber(totals.uzs, 0)} UZS</span>
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
            disabled={totals.count === 0}
            onClick={() => {
              onConfirm({ count: totals.count, usd: totals.usd })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Wallet className="h-4 w-4" /> Berish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RadioRow({ checked, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-left">
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          checked ? 'border-[#0052D2]' : 'border-[#D4D4D4] dark:border-white/25'
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#0052D2]" />}
      </span>
      <span className="text-[14px] text-[#0A0A0A] dark:text-white">{label}</span>
    </button>
  )
}
