import { useState } from 'react'
import { TASHKILOT_NOMLARI } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { FilterDateRange, FilterField, FilterModal, FilterRangeRow, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_ROLE_FILTERS = {
  tashkilot: '',
  holat: '',
  foydalanuvchiDan: '',
  foydalanuvchiGacha: '',
  sanaDan: '',
  sanaGacha: '',
}

const onlyDigits = (v) => v.replace(/\D/g, '')

export default function RoleFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_ROLE_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Tashkilot">
        <FilterSelect
          value={draft.tashkilot}
          onChange={(v) => set('tashkilot', v)}
          options={['Barcha tashkilotlar', ...TASHKILOT_NOMLARI]}
        />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} options={['Faol', 'Nofaol']} />
      </FilterField>
      <FilterRangeRow
        label="Foydalanuvchi soni"
        from={draft.foydalanuvchiDan}
        to={draft.foydalanuvchiGacha}
        onFromChange={(v) => set('foydalanuvchiDan', v)}
        onToChange={(v) => set('foydalanuvchiGacha', v)}
        transform={onlyDigits}
        inputMode="numeric"
      />
      <FilterDateRange
        from={draft.sanaDan}
        to={draft.sanaGacha}
        onFromChange={(v) => set('sanaDan', v)}
        onToChange={(v) => set('sanaGacha', v)}
      />
    </FilterModal>
  )
}
