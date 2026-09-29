import { useState } from 'react'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { PagedSelect } from '@/components/ui/paged-select'
import { branchOptions, organizationOptions, roleOptions } from '@/services/optionSources'

export const EMPTY_USER_FILTERS = {
  tashkilot: '',
  tashkilotName: '',
  filial: '',
  filialName: '',
  rol: '',
  rolName: '',
  holat: '',
  sanaDan: '',
  sanaGacha: '',
}

export default function UserFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) {
        next.filial = ''
        next.filialName = ''
      }
      return next
    })

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
        <PagedSelect
          value={draft.tashkilot}
          onChange={(v, item) =>
            setDraft((d) => ({
              ...d,
              tashkilot: v,
              tashkilotName: item?.name ?? '',
              ...(v !== d.tashkilot && { filial: '', filialName: '' }),
            }))
          }
          fetchPage={organizationOptions}
          selectedLabel={draft.tashkilotName}
          placeholder="Barcha tashkilotlar"
          allowAll
          allLabel="Barcha tashkilotlar"
          className="h-9 rounded-[8px]"
        />
      </FilterField>
      <FilterField label="Filial">
        <PagedSelect
          value={draft.filial}
          onChange={(v, item) =>
            setDraft((d) => ({
              ...d,
              filial: v,
              filialName: item?.name ?? '',
            }))
          }
          fetchPage={branchOptions}
          params={draft.tashkilot ? { organization: draft.tashkilot } : undefined}
          disabled={!draft.tashkilot}
          selectedLabel={draft.filialName}
          placeholder={draft.tashkilot ? 'Barcha filiallar' : 'Avval tashkilotni tanlang'}
          allowAll
          allLabel="Barcha filiallar"
          className="h-9 rounded-[8px]"
        />
      </FilterField>
      <FilterField label="Rol">
        <PagedSelect
          value={draft.rol}
          onChange={(v, item) =>
            setDraft((d) => ({
              ...d,
              rol: v,
              rolName: item?.name ?? '',
            }))
          }
          fetchPage={roleOptions}
          selectedLabel={draft.rolName}
          placeholder="Barcha rollar"
          allowAll
          allLabel="Barcha rollar"
          className="h-9 rounded-[8px]"
        />
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

