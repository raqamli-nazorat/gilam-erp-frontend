import { useEffect, useState } from 'react'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { Input } from '@/components/ui/input'

const FIELD_CLS =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'

// ── Valyutalar filtri (Image 4 pastki oyna) ──
export const EMPTY_VALYUTA_FILTERS = {
  nomi: '',
  shortName: '',
  yaratilganDan: '',
  yaratilganGacha: '',
  ozgartirilganDan: '',
  ozgartirilganGacha: '',
}

export function ValyutalarFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_VALYUTA_FILTERS)}
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
      <FilterField label="Qisqa nomi">
        <Input
          value={draft.shortName}
          onChange={(e) => set('shortName', e.target.value)}
          placeholder="Qisqa nomi bo‘yicha qidirish"
          className={FIELD_CLS}
        />
      </FilterField>
      <FilterDateRange
        label="Yaratilgan"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set('yaratilganDan', v)}
        onToChange={(v) => set('yaratilganGacha', v)}
      />
      <FilterDateRange
        label="Yangilangan"
        from={draft.ozgartirilganDan}
        to={draft.ozgartirilganGacha}
        onFromChange={(v) => set('ozgartirilganDan', v)}
        onToChange={(v) => set('ozgartirilganGacha', v)}
      />
    </FilterModal>
  )
}

// ── Kurslar filtri (Image 4 yuqori oyna) ──
export const EMPTY_KURSLAR_FILTERS = {
  currencyId: '',
  kunDan: '',
  kunGacha: '',
  yaratilganDan: '',
  yaratilganGacha: '',
  ozgartirilganDan: '',
  ozgartirilganGacha: '',
}

export function KurslarFilterModal({ open, onOpenChange, filters, onApply, currencyOptions = [] }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => setDraft(EMPTY_KURSLAR_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Valyuta" className="col-span-2">
        <FilterSelect
          value={draft.currencyId}
          onChange={(v) => set('currencyId', v)}
          options={currencyOptions}
          placeholder="Barchasi"
        />
      </FilterField>
      <FilterDateRange
        label="Kun"
        from={draft.kunDan}
        to={draft.kunGacha}
        onFromChange={(v) => set('kunDan', v)}
        onToChange={(v) => set('kunGacha', v)}
      />
      <FilterDateRange
        label="Yaratilgan"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set('yaratilganDan', v)}
        onToChange={(v) => set('yaratilganGacha', v)}
      />
      <FilterDateRange
        label="Yangilangan"
        from={draft.ozgartirilganDan}
        to={draft.ozgartirilganGacha}
        onFromChange={(v) => set('ozgartirilganDan', v)}
        onToChange={(v) => set('ozgartirilganGacha', v)}
      />
    </FilterModal>
  )
}
