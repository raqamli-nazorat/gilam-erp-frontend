import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { ADVANCE_TYPES, EMPLOYEES } from '@/features/payroll/payrollMockData'
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

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

const today = () => new Date().toISOString().slice(0, 10)
const emptyDraft = (type) => ({ date: today(), empName: EMPLOYEES[0].name, type, note: '', amountUsd: '' })

export default function NewAdvanceModal({ open, onOpenChange, defaultType, exchangeRate, onSave }) {
  const [draft, setDraft] = useState(() => emptyDraft(defaultType))
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  const usd = Number(draft.amountUsd) || 0
  const canSave = usd > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(emptyDraft(defaultType))
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Yangi yozuv
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Sana</Label>
              <DatePicker value={fromISODate(draft.date)} onChange={(d) => set('date', toISODate(d))} />
            </div>
            <div>
              <Label className={labelCls}>Turi</Label>
              <Select value={draft.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADVANCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className={labelCls}>Xodim</Label>
            <Select value={draft.empName} onValueChange={(v) => set('empName', v)}>
              <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMPLOYEES.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Summa, USD</Label>
              <NumberInput pad={2} placeholder="0,00" value={draft.amountUsd} onChange={(e) => set('amountUsd', e.target.value)} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Summa, UZS</Label>
              <Input
                value={usd ? formatNumber(Math.round(usd * exchangeRate), 0) : ''}
                disabled
                placeholder="0"
                className={`${fieldCls} bg-[#F5F5F5] text-[#737373] disabled:opacity-100 dark:bg-white/5`}
              />
            </div>
          </div>

          <div>
            <Label className={labelCls}>Izoh</Label>
            <Input
              value={draft.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="Masalan: Oylik avans"
              className={fieldCls}
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
              onSave({ date: draft.date, empName: draft.empName, type: draft.type, note: draft.note.trim(), amountUsd: usd })
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
