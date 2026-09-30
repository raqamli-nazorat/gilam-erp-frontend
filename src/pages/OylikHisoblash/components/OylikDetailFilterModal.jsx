import { useEffect, useState } from 'react'
import { FilterField, FilterModal } from '@/components/ui/filter-modal'
import { PagedSelect } from '@/components/ui/paged-select'
import { currencyOptions, employeeOptions } from '@/services/optionSources'

export const EMPTY_OYLIK_DETAIL_FILTERS = {
  currency: '',
  currencyName: '',
  employee: '',
  employeeName: '',
}

export default function OylikDetailFilterModal({ open, onOpenChange, filters, onApply, branchId }) {
  const [draft, setDraft] = useState(filters || EMPTY_OYLIK_DETAIL_FILTERS)

  useEffect(() => {
    if (open) setDraft(filters || EMPTY_OYLIK_DETAIL_FILTERS)
  }, [open, filters])

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => {
        onApply(EMPTY_OYLIK_DETAIL_FILTERS)
        onOpenChange(false)
      }}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Valyuta">
        <PagedSelect
          value={draft.currency}
          onChange={(val, item) => set({ currency: val, currencyName: item?.name ?? '' })}
          fetchPage={currencyOptions}
          selectedLabel={draft.currencyName}
          placeholder="Barchasi"
          allowAll
          className="h-10 rounded-[10px]"
        />
      </FilterField>

      <FilterField label="Xodim">
        <PagedSelect
          value={draft.employee}
          onChange={(val, item) => set({ employee: val, employeeName: item?.name ?? '' })}
          fetchPage={employeeOptions}
          params={branchId ? { branch: branchId } : undefined}
          selectedLabel={draft.employeeName}
          placeholder="Barchasi"
          allowAll
          className="h-10 rounded-[10px]"
        />
      </FilterField>
    </FilterModal>
  )
}
