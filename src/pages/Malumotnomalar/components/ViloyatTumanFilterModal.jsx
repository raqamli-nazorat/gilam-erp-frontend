import { useEffect, useState } from 'react'
import { VILOYAT_NOMLARI } from '@/features/malumotnomalar/malumotnomalarData'
import { Input } from '@/components/ui/input'
import { FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_VILOYAT_TUMAN_FILTERS = {
  davlat: '',
  viloyat: '',
  tuman: '',
  holat: '',
  filiallarSoni: '',
}

const FIELD_CLS =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'

export default function ViloyatTumanFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_VILOYAT_TUMAN_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Davlat">
        <FilterSelect value={draft.davlat} onChange={(v) => set('davlat', v)} placeholder="Barchasi" options={["O'zbekiston"]} />
      </FilterField>
      <FilterField label="Viloyat">
        <FilterSelect value={draft.viloyat} onChange={(v) => set('viloyat', v)} placeholder="Barchasi" options={VILOYAT_NOMLARI} />
      </FilterField>
      <FilterField label="Tuman">
        <FilterSelect value={draft.tuman} onChange={(v) => set('tuman', v)} placeholder="Barchasi" options={[]} />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} placeholder="Barchasi" options={['Faol', 'Arxiv']} />
      </FilterField>
      <FilterField className="col-span-2" label="Filiallar soni">
        <Input
          value={draft.filiallarSoni}
          onChange={(e) => set('filiallarSoni', e.target.value)}
          placeholder="Barchasi"
          className={FIELD_CLS}
        />
      </FilterField>
    </FilterModal>
  )
}
