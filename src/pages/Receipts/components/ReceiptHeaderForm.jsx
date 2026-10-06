import { formatDate, formatNumber } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PagedSelect } from '@/components/ui/paged-select'
import { counterpartyOptions, employeeOptions, warehouseOptions } from '@/services/optionSources'

const labelClass =
  'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'
const controlClass = 'h-9'

// Kimdan (kontragent), 3-shaxs (xodim) va Ombor — backend ma'lumotnomalaridan (scroll pagination).
export default function ReceiptHeaderForm({ receipt, exchangeRate, readOnly, onChange }) {
  return (
    <div className="flex h-auto min-h-[90px] items-center justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card">
      <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-4">
        <div>
          <Label className={labelClass}>Hujjat</Label>
          <Input
            value={`${receipt.number} · ${formatDate(receipt.date)}`}
            disabled
            className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-100 dark:border-white/10 dark:bg-card dark:text-white"
          />
        </div>

        <div>
          <Label className={labelClass}>Kimdan</Label>
          <PagedSelect
            value={receipt.counterpartyId || (receipt.counterparty ? '__legacy' : '')}
            selectedLabel={receipt.counterparty}
            onChange={(id, item) => onChange({ counterpartyId: id, counterparty: item?.name ?? '' })}
            fetchPage={counterpartyOptions}
            placeholder="Kontragent tanlang"
            disabled={readOnly}
            className={controlClass}
          />
        </div>

        <div>
          <Label className={labelClass}>3-shaxs</Label>
          <PagedSelect
            value={receipt.thirdPartyId || (receipt.thirdParty ? '__legacy' : '')}
            selectedLabel={receipt.thirdParty}
            onChange={(id, item) => onChange({ thirdPartyId: id, thirdParty: item?.name ?? '' })}
            fetchPage={employeeOptions}
            placeholder="Tanlanmagan"
            allowAll
            allLabel="Tanlanmagan"
            disabled={readOnly}
            className={controlClass}
          />
        </div>

        <div>
          <Label className={labelClass}>Ombor</Label>
          <PagedSelect
            value={receipt.warehouseId || (receipt.warehouse ? '__legacy' : '')}
            selectedLabel={receipt.warehouse}
            onChange={(id, item) =>
              onChange({ warehouseId: id, warehouse: item?.name ?? '', branchId: item?.branchId ?? '' })
            }
            fetchPage={warehouseOptions}
            placeholder="Ombor tanlang"
            disabled={readOnly}
            className={controlClass}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center pl-2 text-right">
        <p className="text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">Kurs</p>
        <p className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
          {formatNumber(exchangeRate)}
        </p>
      </div>
    </div>
  )
}
