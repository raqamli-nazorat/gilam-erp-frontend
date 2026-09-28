import { useEffect, useState } from 'react'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { PagedSelect } from '@/components/ui/paged-select'
import { branchOptions, organizationOptions } from '@/services/optionSources'
import { periodOptions } from '@/features/tabel/tabelData'

// Holat — ro'yxat tablari orqali. Tashkilot, oy (yil + oy), yaratilgan va yangilangan sana oraliqlari
// serverga yuboriladi (organization / year / updated_* — backend topshirig'ida).
export const EMPTY_TABEL_LIST_FILTERS = {
  orgId: '',
  orgName: '',
  branch: '',
  branchName: '',
  period: '', // "YYYY-M"
  yaratilganDan: '',
  yaratilganGacha: '',
  yangilanganDan: '',
  yangilanganGacha: '',
}

const SELECT = 'h-10 rounded-[8px]'

export default function TabelListFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

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
        <PagedSelect
          value={draft.orgId}
          onChange={(v, item) =>
            set({
              orgId: v,
              orgName: item?.name ?? '',
              ...(v !== draft.orgId && { branch: '', branchName: '' }),
            })
          }
          fetchPage={organizationOptions}
          selectedLabel={draft.orgName}
          placeholder="Barchasi"
          allowAll
          className={SELECT}
        />
      </FilterField>
      <FilterField label="Filial">
        <PagedSelect
          value={draft.branch}
          onChange={(v, item) => set({ branch: v, branchName: item?.name ?? '' })}
          fetchPage={branchOptions}
          params={draft.orgId ? { organization: draft.orgId } : undefined}
          selectedLabel={draft.branchName}
          placeholder="Barchasi"
          allowAll
          className={SELECT}
        />
      </FilterField>
      <FilterField label="Oy">
        <FilterSelect value={draft.period} onChange={(v) => set({ period: v })} options={periodOptions()} />
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
