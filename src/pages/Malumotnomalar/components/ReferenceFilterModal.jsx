import { useEffect, useState } from 'react'
import { FilterDateRange, FilterField, FilterModal } from '@/components/ui/filter-modal'
import { Input } from '@/components/ui/input'

export const EMPTY_REFERENCE_FILTERS = {
  nomi: '',
  yaratilganDan: '',
  yaratilganGacha: '',
  ozgartirilganDan: '',
  ozgartirilganGacha: '',
}

const FIELD_CLS =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white'

export default function ReferenceFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_REFERENCE_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Nomi" className="col-span-2">
        <Input
          value={draft.nomi}
          onChange={(e) => set('nomi', e.target.value)}
          placeholder="Nomi bo‘yicha qidirish"
          className={FIELD_CLS}
        />
      </FilterField>
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
