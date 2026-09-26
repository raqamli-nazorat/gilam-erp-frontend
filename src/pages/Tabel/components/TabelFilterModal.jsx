import { useEffect, useState } from 'react'
import { FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { SCHEDULES } from '@/features/tabel/tabelData'

export const EMPTY_TABEL_FILTERS = { schedule: '', deviation: '' }

export const DEVIATION_OPTIONS = [
  { value: 'norma', label: 'Norma' },
  { value: 'kam', label: 'Kam soat' },
  { value: 'kelmagan', label: 'Kelmagan' },
]

export default function TabelFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => {
        setDraft(EMPTY_TABEL_FILTERS)
        onApply(EMPTY_TABEL_FILTERS)
        onOpenChange(false)
      }}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Ish grafigi">
        <FilterSelect
          value={draft.schedule}
          onChange={(v) => setDraft((d) => ({ ...d, schedule: v }))}
          options={Object.values(SCHEDULES).map((s) => ({ value: s.id, label: s.name }))}
        />
      </FilterField>
      <FilterField label="Og‘ish turi">
        <FilterSelect
          value={draft.deviation}
          onChange={(v) => setDraft((d) => ({ ...d, deviation: v }))}
          options={DEVIATION_OPTIONS}
        />
      </FilterField>
    </FilterModal>
  )
}
