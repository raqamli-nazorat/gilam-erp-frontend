import { useState } from 'react'
import { FILIAL_TURLARI, TASHKILOT_NOMLARI, VILOYATLAR } from '@/features/filiallar/filiallarData'
import { FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_BRANCH_FILTERS = { tashkilot: '', viloyat: '', turi: '', holat: '' }

export default function BranchFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_BRANCH_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Tashkilot">
        <FilterSelect
          value={draft.tashkilot}
          onChange={(v) => set('tashkilot', v)}
          placeholder="Barcha tashkilotlar"
          options={TASHKILOT_NOMLARI}
        />
      </FilterField>
      <FilterField label="Viloyat">
        <FilterSelect
          value={draft.viloyat}
          onChange={(v) => set('viloyat', v)}
          placeholder="Barcha viloyatlar"
          options={VILOYATLAR}
        />
      </FilterField>
      <FilterField label="Filial turi">
        <FilterSelect
          value={draft.turi}
          onChange={(v) => set('turi', v)}
          placeholder="Barcha turlar"
          options={FILIAL_TURLARI}
        />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect
          value={draft.holat}
          onChange={(v) => set('holat', v)}
          placeholder="Barcha holatlar"
          options={['Faol', 'Yopilgan']}
        />
      </FilterField>
    </FilterModal>
  )
}
