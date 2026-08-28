import { COUNTERPARTIES, THIRD_PARTIES, WAREHOUSES } from '@/features/receipts/mockData'
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

export default function ReceiptHeaderForm({ receipt, exchangeRate, readOnly, onChange }) {
  return (
    <div className="flex h-auto min-h-[90px] items-center justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card">
      <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-4">
        {/* Hujjat */}
        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Hujjat
          </Label>
          <Input
            value={`${receipt.number} · ${formatDate(receipt.date)}`}
            disabled
            className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-100 dark:border-white/10 dark:bg-card dark:text-white"
          />
        </div>

        {/* Kimdan */}
        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Kimdan
          </Label>
          <Select
            value={receipt.counterparty || '__none'}
            onValueChange={(v) => onChange({ counterparty: v === '__none' ? '' : v })}
            disabled={readOnly}
          >
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">Kontragent tanlang</span> : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Kontragent tanlang</SelectItem>
              {COUNTERPARTIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3-shaxs */}
        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            3-shaxs
          </Label>
          <Select
            value={receipt.thirdParty || '__none'}
            onValueChange={(v) => onChange({ thirdParty: v === '__none' ? '' : v })}
            disabled={readOnly}
          >
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue>{(v) => (v === '__none' ? <span className="text-[#737373]">Tanlanmagan</span> : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Tanlanmagan</SelectItem>
              {THIRD_PARTIES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ombor */}
        <div>
          <Label className="mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Ombor
          </Label>
          <Select
            value={receipt.warehouse}
            onValueChange={(v) => onChange({ warehouse: v })}
            disabled={readOnly}
          >
            <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WAREHOUSES.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side: Kurs */}
      <div className="flex shrink-0 flex-col items-end justify-center pl-2 text-right">
        <div className="text-right">
          <p className="text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Kurs
          </p>
          <p className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
            {formatNumber(exchangeRate)}
          </p>
        </div>
      </div>
    </div>
  )
}
