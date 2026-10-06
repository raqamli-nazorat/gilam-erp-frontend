import { useEffect, useState } from 'react'
import { FilterDateRange, FilterField, FilterModal } from '@/components/ui/filter-modal'
import { Input } from '@/components/ui/input'
import { PagedSelect } from '@/components/ui/paged-select'

export const EMPTY_REFERENCE_FILTERS = {
  nomi: '',
  yaratilganDan: '',
  yaratilganGacha: '',
  ozgartirilganDan: '',
  ozgartirilganGacha: '',
}

const FIELD_CLS =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white'

// `extraFilters`: [{ key, label, fetchPage, dependsOn? }] — backend FK filtrlari (masalan
// Sifat → `quality`). Tanlangan id `filters[key]`da, nomi `filters[key + 'Label']`da saqlanadi.
// `dependsOn` berilsa, ro'yxat o'sha filtr qiymati bilan toraytiriladi va u o'zgarsa tozalanadi.
export default function ReferenceFilterModal({ open, onOpenChange, filters, onApply, extraFilters = [] }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  function setExtra(key, id, item) {
    setDraft((d) => {
      const next = { ...d, [key]: id, [`${key}Label`]: id ? item?.name ?? '' : '' }
      for (const f of extraFilters) {
        if (f.dependsOn === key && id !== d[key]) {
          next[f.key] = ''
          next[`${f.key}Label`] = ''
        }
      }
      return next
    })
  }

  const empty = { ...EMPTY_REFERENCE_FILTERS }
  for (const f of extraFilters) {
    empty[f.key] = ''
    empty[`${f.key}Label`] = ''
  }

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(empty)}
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
      {extraFilters.map((f) => {
        const parent = f.dependsOn ? draft[f.dependsOn] : ''
        return (
          <FilterField key={f.key} label={f.label} className={extraFilters.length === 1 ? 'col-span-2' : undefined}>
            <PagedSelect
              value={draft[f.key] ?? ''}
              selectedLabel={draft[`${f.key}Label`]}
              onChange={(id, item) => setExtra(f.key, id, item)}
              fetchPage={f.fetchPage}
              params={parent ? { [f.dependsOn]: parent } : undefined}
              allowAll
              placeholder="Barchasi"
              className="h-9"
            />
          </FilterField>
        )
      })}
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
