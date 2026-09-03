import {
  SALE_TRANSPORTS,
  SALE_WAREHOUSES,
} from '@/features/sales/salesMockData'
import { SALE_AGENTS, SALE_COUNTERPARTIES } from '@/features/sales/salesMockData'
import { formatDate, formatNumber } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker, toISODate, fromISODate } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'
const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'

export default function SaleHeaderForm({ doc, exchangeRate, readOnly, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card">
      <div className="grid flex-1 grid-cols-2 items-start gap-4 sm:grid-cols-6">
        <div>
          <Label className={labelCls}>Hujjat</Label>
          <Input value={`${doc.number} · ${formatDate(doc.date)}`} disabled className={`${fieldCls} truncate font-medium disabled:opacity-100`} />
        </div>

        <div>
          <Label className={labelCls}>Kimga</Label>
          <Select value={doc.counterparty || '__none'} onValueChange={(v) => onChange({ counterparty: v === '__none' ? '' : v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}>
              <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">Kontragent tanlang</span> : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Kontragent tanlang</SelectItem>
              {SALE_COUNTERPARTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>Agent</Label>
          <Select value={doc.agent} onValueChange={(v) => onChange({ agent: v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SALE_AGENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>Ombor</Label>
          <Select value={doc.warehouse} onValueChange={(v) => onChange({ warehouse: v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SALE_WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>To'lov muddati</Label>
          <DatePicker value={fromISODate(doc.dueDate)} onChange={(d) => onChange({ dueDate: toISODate(d) })} disabled={readOnly} />
        </div>

        <div>
          <Label className={labelCls}>Transport</Label>
          <Select value={doc.transport} onValueChange={(v) => onChange({ transport: v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}>
              <SelectValue>{(v) => (v === 'Tanlanmagan' ? <span className="text-[#737373]">Tanlanmagan</span> : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SALE_TRANSPORTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center pl-2 text-right">
        <p className="text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">Kurs</p>
        <p className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">{formatNumber(exchangeRate)}</p>
      </div>
    </div>
  )
}
