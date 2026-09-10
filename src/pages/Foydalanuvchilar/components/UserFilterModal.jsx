import { useState } from 'react'
import { FILIALLAR_BY_TASHKILOT, ROLLAR_NOMLARI, TASHKILOT_NOMLARI } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_USER_FILTERS = { tashkilot: '', filial: '', rol: '', holat: '', sanaDan: '', sanaGacha: '' }

export default function UserFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  const filialOptions = FILIALLAR_BY_TASHKILOT[draft.tashkilot] ?? []

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_USER_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Tashkilot">
        <FilterSelect value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} options={TASHKILOT_NOMLARI} />
      </FilterField>
      <FilterField label="Filial">
        <FilterSelect
          value={draft.filial}
          onChange={(v) => set('filial', v)}
          options={filialOptions}
          disabled={!draft.tashkilot}
        />
      </FilterField>
      <FilterField label="Rol">
        <FilterSelect value={draft.rol} onChange={(v) => set('rol', v)} options={ROLLAR_NOMLARI} />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} options={['Faol', 'Bloklangan']} />
      </FilterField>
      <FilterDateRange
        from={draft.sanaDan}
        to={draft.sanaGacha}
        onFromChange={(v) => set('sanaDan', v)}
        onToChange={(v) => set('sanaGacha', v)}
      />
    </FilterModal>
  )
}
