import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { Input } from '@/components/ui/input'

export const EMPTY_ISH_GRAFIGI_FILTERS = {
  nomi: '',
  filial: '',
  yaratilganDan: '',
  yaratilganGacha: '',
}

const FIELD_CLS =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white'

export default function IshGrafigiFilterModal({ open, onOpenChange, filters, onApply }) {
  const branches = useSelector((s) => s.filiallar.list)
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const branchNames = branches.map((b) => b.name)

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_ISH_GRAFIGI_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Nomi">
        <Input
          value={draft.nomi}
          onChange={(e) => set('nomi', e.target.value)}
          placeholder="Nomi bo‘yicha qidirish"
          className={FIELD_CLS}
        />
      </FilterField>
      <FilterField label="Filiali">
        <FilterSelect value={draft.filial} onChange={(v) => set('filial', v)} placeholder="Barchasi" options={branchNames} />
      </FilterField>
      <FilterDateRange
        label="Yaratilgan"
        className="col-span-2"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set('yaratilganDan', v)}
        onToChange={(v) => set('yaratilganGacha', v)}
      />
    </FilterModal>
  )
}
