import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
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
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)

  useEffect(() => {
    if (open) dispatch(fetchOrganizations())
  }, [open, dispatch])

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
          options={['Barcha tashkilotlar', ...orgs.map((o) => o.name)]}
        />
      </FilterField>
      <FilterField label="Turi">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} options={['Tizim roli', 'Odatiy rol']} />
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
