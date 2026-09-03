import { useMemo, useState } from 'react'
import { BarChart3, Check, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import {
  CALC_SCHEMES,
  employeeBreakdown,
  sumBy,
} from '@/features/payroll/payrollMockData'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
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

const STAFF_GROUPS = ['Barcha menejerlar', 'Barcha xodimlar', 'Faqat kassirlar']

const emptyDraft = () => ({
  from: '2023-12-01',
  to: '2023-12-31',
  scheme: 'savdodan',
  percent: '2',
  staff: 'Barcha menejerlar',
  applyAdjustments: true,
})

export default function NewCalcModal({ open, onOpenChange, onCreate }) {
  const [draft, setDraft] = useState(emptyDraft)
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  // Oldindan hisob — "har bir xodim savdosidan" breakdown asosida
  const preview = useMemo(() => {
    const rows = employeeBreakdown.xodim_savdo
    const percent = Number(draft.percent) || 0
    const totalSales = sumBy(rows.filter((r) => r.base != null), 'base')
    const accrued = rows.reduce(
      (s, r) => s + (r.base != null ? (r.base * percent) / 100 : r.hisoblangan),
      0
    )
    return { count: rows.length, totalSales, accrued }
  }, [draft.percent])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(emptyDraft())
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Yangi hisoblash
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Davr boshi</Label>
              <DatePicker value={fromISODate(draft.from)} onChange={(d) => set('from', toISODate(d))} />
            </div>
            <div>
              <Label className={labelCls}>Davr oxiri</Label>
              <DatePicker value={fromISODate(draft.to)} onChange={(d) => set('to', toISODate(d))} />
            </div>
          </div>

          <div>
            <Label className={labelCls}>Hisoblash sxemasi</Label>
            <Select value={draft.scheme} onValueChange={(v) => set('scheme', v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>{(v) => CALC_SCHEMES.find((s) => s.key === v)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CALC_SCHEMES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Foiz, %</Label>
              <NumberInput pad={2} placeholder="0,00" value={draft.percent} onChange={(e) => set('percent', e.target.value)} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Xodimlar</Label>
              <Select value={draft.staff} onValueChange={(v) => set('staff', v)}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAFF_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[14px] font-normal text-[#0A0A0A] dark:text-white">
            <Checkbox checked={draft.applyAdjustments} onCheckedChange={(v) => set('applyAdjustments', !!v)} />
            Avans va ushlanmalarni hisobga olish
          </label>

          <div className="flex items-start gap-2.5 rounded-lg bg-[#EAF1FE] p-3 text-[13px] text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
            <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Oldindan hisob: {preview.count} xodim · savdo {formatNumber(preview.totalSales)} USD ·
              hisoblanadi taxminan {formatNumber(preview.accrued)} USD
            </p>
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
            onClick={() => {
              onCreate({
                from: draft.from,
                to: draft.to,
                scheme: draft.scheme,
                percent: Number(draft.percent) || 0,
                totalSales: preview.totalSales,
                totalAmount: Number(preview.accrued.toFixed(2)),
                employeeAmount: Number((preview.accrued / (preview.count || 1)).toFixed(2)),
              })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Hisoblash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
