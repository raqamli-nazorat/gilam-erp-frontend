import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { fetchRoles } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_USER_FILTERS = { tashkilot: '', filial: '', rol: '', holat: '', sanaDan: '', sanaGacha: '' }

export default function UserFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const branches = useSelector((s) => s.filiallar.list)
  const roles = useSelector((s) => s.foydalanuvchilar.roles)

  useEffect(() => {
    if (!open) return
    dispatch(fetchOrganizations())
    dispatch(fetchBranches())
    dispatch(fetchRoles())
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
      onReset={() => setDraft(EMPTY_USER_FILTERS)}
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
      <FilterField label="Rol">
        <FilterSelect value={draft.rol} onChange={(v) => set('rol', v)} options={roles.map((r) => r.name)} />
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
