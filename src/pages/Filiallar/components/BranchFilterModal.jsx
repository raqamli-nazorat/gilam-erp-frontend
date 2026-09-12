import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchRegions } from '@/features/geo/geoSlice'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_BRANCH_FILTERS = {
  tashkilot: '',
  viloyat: '',
  holat: '',
  sanaDan: '',
  sanaGacha: '',
}

export default function BranchFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const regions = useSelector((s) => s.geo.regions)

  useEffect(() => {
    if (!open) return
    dispatch(fetchOrganizations())
    dispatch(fetchRegions())
  }, [open, dispatch])

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
          options={orgs.map((o) => o.name)}
        />
      </FilterField>
      <FilterField label="Viloyat">
        <FilterSelect
          value={draft.viloyat}
          onChange={(v) => set('viloyat', v)}
          placeholder="Barcha viloyatlar"
          options={regions.map((r) => r.name)}
        />
      </FilterField>
      <FilterField className="col-span-2!" label="Holat">
        <FilterSelect
          value={draft.holat}
          onChange={(v) => set('holat', v)}
          placeholder="Barcha holatlar"
          options={['Faol', 'Yopilgan']}
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
