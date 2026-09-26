import { useEffect, useState } from 'react'
import { branchOptions, positionOptions } from '@/services/optionSources'
import { PagedSelect } from '@/components/ui/paged-select'
import { FilterDateRange, FilterField, FilterModal } from '@/components/ui/filter-modal'

export const EMPTY_ISHDAN_CHIQARISH_FILTERS = {
  filialId: '',
  filialNomi: '', // faqat ko'rsatish uchun (tanlangan filial nomi)
  lavozimId: '',
  lavozimNomi: '', // faqat ko'rsatish uchun (tanlangan lavozim nomi)
  sanaDan: '',
  sanaGacha: '',
  yaratilganDan: '',
  yaratilganGacha: '',
}

export default function IshdanChiqarishFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_ISHDAN_CHIQARISH_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Filial">
        <PagedSelect
          value={draft.filialId}
          onChange={(v, item) => setDraft((d) => ({ ...d, filialId: v, filialNomi: item?.name ?? '' }))}
          fetchPage={branchOptions}
          selectedLabel={draft.filialNomi}
          placeholder="Barchasi"
          className="h-9"
        />
      </FilterField>
      <FilterField label="Lavozim">
        <PagedSelect
          value={draft.lavozimId}
          onChange={(v, item) => setDraft((d) => ({ ...d, lavozimId: v, lavozimNomi: item?.name ?? '' }))}
          fetchPage={positionOptions}
          selectedLabel={draft.lavozimNomi}
          placeholder="Barchasi"
          className="h-9"
        />
      </FilterField>
      <FilterDateRange
        label="Ishdan chiqarilgan sana"
        from={draft.sanaDan}
        to={draft.sanaGacha}
        onFromChange={(v) => set('sanaDan', v)}
        onToChange={(v) => set('sanaGacha', v)}
      />
      <FilterDateRange
        label="Yaratilgan"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set('yaratilganDan', v)}
        onToChange={(v) => set('yaratilganGacha', v)}
      />
    </FilterModal>
  )
}
