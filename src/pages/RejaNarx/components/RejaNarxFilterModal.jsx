import { useEffect, useState } from 'react'
import { FilterDateRange, FilterField, FilterModal, FilterRangeRow, FilterSelect } from '@/components/ui/filter-modal'
import { PagedSelect } from '@/components/ui/paged-select'
import { qualityOptions } from '@/services/optionSources'

export const EMPTY_FILTERS = {
  from: '',
  to: '',
  status: '',
  qualityId: '',
  quality: '',
  author: '',
  minChange: '',
  maxChange: '',
}

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Tasdiqlangan' },
  { value: 'draft', label: 'Qoralama' },
  { value: 'cancelled', label: 'Bekor qilingan' },
]

const onlyNumber = (v) => v.replace(/[^\d.,-]/g, '').replace(',', '.')

// Sifat — backenddan (catalog/qualities/); Muallif — jurnaldagi mualliflar.
export default function RejaNarxFilterModal({ open, onOpenChange, filters, onApply, authors }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterDateRange
        label="Sana oralig‘i"
        showTime
        from={draft.from}
        to={draft.to}
        onFromChange={(v) => set('from', v)}
        onToChange={(v) => set('to', v)}
      />
      <FilterField label="Holat">
        <FilterSelect value={draft.status} onChange={(v) => set('status', v)} options={STATUS_OPTIONS} />
      </FilterField>
      <FilterField label="Sifat">
        <PagedSelect
          value={draft.qualityId || (draft.quality ? '__name' : '')}
          selectedLabel={draft.quality}
          fetchPage={qualityOptions}
          allowAll
          placeholder="Barchasi"
          className="h-9"
          onChange={(id, item) => setDraft((d) => ({ ...d, qualityId: id, quality: id ? item?.name ?? '' : '' }))}
        />
      </FilterField>
      <FilterField label="Muallif" className="col-span-2">
        <FilterSelect value={draft.author} onChange={(v) => set('author', v)} options={authors} />
      </FilterField>
      <FilterRangeRow
        label="O‘zgarish, %"
        from={draft.minChange}
        to={draft.maxChange}
        onFromChange={(v) => set('minChange', v)}
        onToChange={(v) => set('maxChange', v)}
        transform={onlyNumber}
        inputMode="decimal"
      />
    </FilterModal>
  )
}
