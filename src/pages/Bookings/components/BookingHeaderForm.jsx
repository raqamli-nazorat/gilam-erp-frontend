import { BOOKING_AGENTS, BOOKING_WAREHOUSES, TRANSPORTS } from '@/features/bookings/bookingsMockData'
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

export default function BookingHeaderForm({ booking, exchangeRate, onChange }) {
  return (
    <div className="flex h-auto min-h-[90px] items-center justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card">
      <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-5">
        <div>
          <Label className={labelCls}>Hujjat</Label>
          <Input value={`${booking.number} · ${formatDate(booking.date)}`} disabled className={`${fieldCls} font-medium disabled:opacity-100`} />
        </div>

        <div>
          <Label className={labelCls}>Kimga</Label>
          <Input
            value={booking.customer}
            onChange={(e) => onChange({ customer: e.target.value })}
            placeholder="Mijoz ismi yoki telefoni"
            className={`${fieldCls} placeholder:text-[#737373]`}
          />
        </div>

        <div>
          <Label className={labelCls}>Agent</Label>
          <Select value={booking.agent} onValueChange={(v) => onChange({ agent: v })}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {BOOKING_AGENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>Ombor</Label>
          <Select value={booking.warehouse} onValueChange={(v) => onChange({ warehouse: v })}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {BOOKING_WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelCls}>Transport</Label>
          <Select value={booking.transport} onValueChange={(v) => onChange({ transport: v })}>
            <SelectTrigger className={fieldCls}>
              <SelectValue>{(v) => (v === 'Tanlanmagan' ? <span className="text-[#737373]">Tanlanmagan</span> : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TRANSPORTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
