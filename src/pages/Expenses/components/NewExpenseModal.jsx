import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { EXPENSE_KASSAS } from '@/features/expenses/expensesMockData'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Input } from '@/components/ui/input'
import { DatePicker, toISODate, fromISODate } from '@/components/ui/date-picker'
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
import ExpenseTypeSelect from './ExpenseTypeSelect'

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

const today = () => new Date().toISOString().slice(0, 10)

const emptyDraft = () => ({
  date: today(),
  kassa: EXPENSE_KASSAS[0],
  type: '',
  amountUzs: '',
  note: '',
})

export default function NewExpenseModal({ open, onOpenChange, exchangeRate, onSave }) {
  const [draft, setDraft] = useState(emptyDraft)
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  const uzs = Number(draft.amountUzs) || 0
  const usd = uzs ? uzs / exchangeRate : 0
  const canSave = !!draft.type && uzs > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(emptyDraft())
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Yangi xarajat
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Sana</Label>
              <DatePicker value={fromISODate(draft.date)} onChange={(d) => set('date', toISODate(d))} />
            </div>
            <div>
              <Label className={labelCls}>Kassadan</Label>
              <Select value={draft.kassa} onValueChange={(v) => set('kassa', v)}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className={labelCls}>Xarajat turi</Label>
            <ExpenseTypeSelect value={draft.type} onChange={(v) => set('type', v)} />
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className={labelCls}>Summa, UZS</Label>
                <NumberInput
                  decimals={false}
                  placeholder="0"
                  value={draft.amountUzs}
                  onChange={(e) => set('amountUzs', e.target.value)}
                  className={fieldCls}
                />
              </div>
              <div>
                <Label className={labelCls}>Summa, USD</Label>
                <Input
                  value={usd ? formatNumber(usd) : ''}
                  disabled
                  placeholder="0,00"
                  className={`${fieldCls} bg-[#F5F5F5] text-[#737373] disabled:opacity-100 dark:bg-white/5`}
                />
              </div>
            </div>
            <p className="mt-1.5 text-[12px] leading-[16px] text-[#737373] dark:text-muted-foreground">
              Kurs {formatNumber(exchangeRate)} bo'yicha avtomatik hisoblanadi
            </p>
          </div>

          <div>
            <Label className={labelCls}>Izoh</Label>
            <textarea
              rows={3}
              value={draft.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="Izoh — masalan: Elektr va suv, dekabr"
              className="w-full resize-none rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition-colors placeholder:text-[#737373] focus:border-[#0052D2] focus:ring-2 focus:ring-[#0052D2]/20 dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
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
            disabled={!canSave}
            onClick={() => {
              onSave({
                date: draft.date,
                kassa: draft.kassa,
                type: draft.type,
                note: draft.note.trim(),
                amountUzs: uzs,
                amountUsd: null,
                author: 'AXRORJON',
              })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
