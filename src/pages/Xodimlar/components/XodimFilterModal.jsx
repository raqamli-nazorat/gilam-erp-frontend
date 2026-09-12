import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { positionSlice } from '@/features/malumotnomalar/referenceEntities'
import { ISH_HAQI_TURLARI } from '@/features/xodimlar/xodimlarData'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_XODIM_FILTERS = {
  tashkilot: '',
  filial: '',
  lavozim: '',
  ishHaqiTuri: '',
  sanaDan: '',
  sanaGacha: '',
}

export default function XodimFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const branches = useSelector((s) => s.filiallar.list)
  const positions = useSelector((s) => s.lavozimlar.list)

  useEffect(() => {
    if (!open) return
    dispatch(fetchOrganizations())
    dispatch(fetchBranches())
    dispatch(positionSlice.fetchItems())
  }, [open, dispatch])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) next.filial = ''
      return next
    })

  const filialOptions = useMemo(() => {
    const org = orgs.find((o) => o.name === draft.tashkilot)
    return org ? branches.filter((b) => b.tashkilotId === org.id).map((b) => b.name) : []
  }, [orgs, branches, draft.tashkilot])

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_XODIM_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Tashkilot">
        <FilterSelect value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} options={orgs.map((o) => o.name)} />
      </FilterField>
      <FilterField label="Filial">
        <FilterSelect
          value={draft.filial}
          onChange={(v) => set('filial', v)}
          options={filialOptions}
          disabled={!draft.tashkilot}
        />
      </FilterField>
      <FilterField label="Lavozim">
        <FilterSelect value={draft.lavozim} onChange={(v) => set('lavozim', v)} options={positions.map((p) => p.name)} />
      </FilterField>
      <FilterField label="Ish haqi turi">
        <FilterSelect value={draft.ishHaqiTuri} onChange={(v) => set('ishHaqiTuri', v)} options={ISH_HAQI_TURLARI} />
      </FilterField>
      <FilterDateRange
        label="Ishga olingan"
        className="col-span-2"
        from={draft.sanaDan}
        to={draft.sanaGacha}
        onFromChange={(v) => set('sanaDan', v)}
        onToChange={(v) => set('sanaGacha', v)}
      />
    </FilterModal>
  )
}
