import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRegions } from '@/features/geo/geoSlice'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const FILIALLAR_SONI_BUCKETS = ['1 ta', '2–5 ta', '6–10 ta', '10+ ta']
export const FOYDALANUVCHILAR_SONI_BUCKETS = ['1–10 ta', '11–50 ta', '51–100 ta', '100+ ta']

export const EMPTY_ORG_FILTERS = {
  hudud: '',
  holat: '',
  filiallarSoni: '',
  foydalanuvchilar: '',
  sanaDan: '',
  sanaGacha: '',
}

export default function OrgFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const dispatch = useDispatch()
  const regions = useSelector((s) => s.geo.regions)

  useEffect(() => {
    if (open) dispatch(fetchRegions())
  }, [open, dispatch])

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_ORG_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Viloyat">
        <FilterSelect value={draft.hudud} onChange={(v) => set('hudud', v)} options={regions.map((r) => r.name)} />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} options={['Faol', 'To‘xtatilgan']} />
      </FilterField>
      <FilterField label="Filiallar soni">
        <FilterSelect
          value={draft.filiallarSoni}
          onChange={(v) => set('filiallarSoni', v)}
          options={FILIALLAR_SONI_BUCKETS}
        />
      </FilterField>
      <FilterField label="Foydalanuvchilar">
        <FilterSelect
          value={draft.foydalanuvchilar}
          onChange={(v) => set('foydalanuvchilar', v)}
          options={FOYDALANUVCHILAR_SONI_BUCKETS}
        />
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
