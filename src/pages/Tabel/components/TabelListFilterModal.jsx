import { useEffect, useState } from 'react'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { BRANCHES, ORGANIZATIONS, TABEL_STATUS, periodOption } from '@/features/tabel/tabelData'

export const EMPTY_TABEL_LIST_FILTERS = {
  orgId: '',
  branchId: '',
  period: '',
  status: '',
  yaratilganDan: '',
  yaratilganGacha: '',
  yangilanganDan: '',
  yangilanganGacha: '',
}

// periods: ['2026-8', ...] — ro'yxatdagi mavjud oylar (yangisidan eskisiga)
export default function TabelListFilterModal({ open, onOpenChange, filters, onApply, periods }) {
  const [draft, setDraft] = useState(filters)
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const branches = BRANCHES.filter((b) => !draft.orgId || b.orgId === draft.orgId)

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => {
        onApply(EMPTY_TABEL_LIST_FILTERS)
        onOpenChange(false)
      }}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Tashkilot">
        <FilterSelect
          value={draft.orgId}
          onChange={(v) => set({ orgId: v, branchId: BRANCHES.some((b) => b.id === draft.branchId && b.orgId === v) ? draft.branchId : '' })}
          options={ORGANIZATIONS.map((o) => ({ value: o.id, label: o.name }))}
        />
      </FilterField>
      <FilterField label="Filial">
        <FilterSelect value={draft.branchId} onChange={(v) => set({ branchId: v })} options={branches.map((b) => ({ value: b.id, label: b.name }))} />
      </FilterField>
      <FilterField label="Oy">
        <FilterSelect
          value={draft.period}
          onChange={(v) => set({ period: v })}
          options={periods.map(periodOption)}
        />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect
          value={draft.status}
          onChange={(v) => set({ status: v })}
          options={Object.entries(TABEL_STATUS).map(([value, label]) => ({ value, label }))}
        />
      </FilterField>
      <FilterDateRange
        label="Yaratilgan"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set({ yaratilganDan: v })}
        onToChange={(v) => set({ yaratilganGacha: v })}
      />
      <FilterDateRange
        label="Yangilangan"
        from={draft.yangilanganDan}
        to={draft.yangilanganGacha}
        onFromChange={(v) => set({ yangilanganDan: v })}
        onToChange={(v) => set({ yangilanganGacha: v })}
      />
    </FilterModal>
  )
}
