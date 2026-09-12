import { useState } from 'react'
import { FilterDateRange, FilterModal } from '@/components/ui/filter-modal'

// Davlat/Viloyat/Tuman sahifalari uchun umumiy filtr — faqat sana bo'yicha
// (bu modellarda "holat" tushunchasi yo'q, shuning uchun boshqa filtr maydoni yo'q).
export const EMPTY_GEO_FILTERS = {
  yaratilganDan: '',
  yaratilganGacha: '',
  ozgartirilganDan: '',
  ozgartirilganGacha: '',
}

export default function GeoFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_GEO_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterDateRange
        label="Yaratilgan"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set('yaratilganDan', v)}
        onToChange={(v) => set('yaratilganGacha', v)}
      />
      <FilterDateRange
        label="O‘zgartirilgan"
        from={draft.ozgartirilganDan}
        to={draft.ozgartirilganGacha}
        onFromChange={(v) => set('ozgartirilganDan', v)}
        onToChange={(v) => set('ozgartirilganGacha', v)}
      />
    </FilterModal>
  )
}
