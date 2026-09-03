import { QK_RECEIVERS, QK_WAREHOUSES } from '@/features/qaytarishKirimi/qkMockData'
import { RETURN_COUNTERPARTIES } from '@/features/returns/returnsMockData'
import { formatDate, formatNumber } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const COUNTERPARTIES = [...new Set([...RETURN_COUNTERPARTIES, 'Mirzajonov Sardor'])]

export default function QkHeaderForm({ doc, exchangeRate, readOnly, onChange }) {
  return (
    <div className="flex h-auto min-h-[90px] items-center justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card">
      <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-5">
        <div>
          <Label className={labelCls}>Hujjat</Label>
          <Input value={`${doc.number} · ${formatDate(doc.date)}`} disabled className={`${fieldCls} font-medium disabled:opacity-100`} />
        </div>

        <div>
          <Label className={labelCls}>Asos hujjat</Label>
          <Input value={`${doc.basis} · ${formatDate(doc.basisDate)}`} disabled className={`${fieldCls} font-medium text-[#0052D2] disabled:opacity-100 dark:text-[#60A5FA]`} />
        </div>

        <div>
          <Label className={labelCls}>Kontragent</Label>
          <Select value={doc.counterparty || '__none'} onValueChange={(v) => onChange({ counterparty: v === '__none' ? '' : v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}>
              <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">Kontragent tanlang</span> : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Kontragent tanlang</SelectItem>
              {COUNTERPARTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>Ombor</Label>
          <Select value={doc.warehouse} onValueChange={(v) => onChange({ warehouse: v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {QK_WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>Qabul qildi</Label>
          <Select value={doc.receiver} onValueChange={(v) => onChange({ receiver: v })} disabled={readOnly}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {QK_RECEIVERS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
