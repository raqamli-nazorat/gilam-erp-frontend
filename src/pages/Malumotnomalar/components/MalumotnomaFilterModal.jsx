import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TASHKILOT_NOMLARI } from '@/features/filiallar/filiallarData'
import { MALUMOTNOMA_MENU } from '@/features/malumotnomalar/malumotnomalarData'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

export const EMPTY_MALUMOTNOMA_FILTERS = {
  holat: '',
  yaratilganDan: '',
  yaratilganGacha: '',
  tashkilot: '',
}

const MENU_NAMES = MALUMOTNOMA_MENU.map((m) => m.name)

export default function MalumotnomaFilterModal({ open, onOpenChange, slug, filters, onApply }) {
  const navigate = useNavigate()
  const currentName = MALUMOTNOMA_MENU.find((m) => m.slug === slug)?.name ?? MENU_NAMES[0]

  const [draft, setDraft] = useState(filters)
  const [malumotnoma, setMalumotnoma] = useState(currentName)

  useEffect(() => {
    if (!open) return
    setDraft(filters)
    setMalumotnoma(currentName)
  }, [open, filters, currentName])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <FilterModal
      open={open}
      onOpenChange={onOpenChange}
      onReset={() => {
        setDraft(EMPTY_MALUMOTNOMA_FILTERS)
        setMalumotnoma(currentName)
      }}
      onApply={() => {
        const next = MALUMOTNOMA_MENU.find((m) => m.name === malumotnoma)
        if (next && next.slug !== slug) {
          navigate(`/malumotnomalar/${next.slug}`)
        } else {
          onApply(draft)
        }
        onOpenChange(false)
      }}
    >
      <FilterField label="Ma’lumotnoma">
        <FilterSelect value={malumotnoma} onChange={setMalumotnoma} options={MENU_NAMES} placeholder="Tanlang" />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} placeholder="Barchasi" options={['Faol', 'Arxiv']} />
      </FilterField>
      <FilterDateRange
        label="Yaratilgan"
        from={draft.yaratilganDan}
        to={draft.yaratilganGacha}
        onFromChange={(v) => set('yaratilganDan', v)}
        onToChange={(v) => set('yaratilganGacha', v)}
      />
      <FilterField className="col-span-2" label="Tashkilot">
        <FilterSelect
          value={draft.tashkilot}
          onChange={(v) => set('tashkilot', v)}
          placeholder="Barchasi"
          options={TASHKILOT_NOMLARI}
        />
      </FilterField>
    </FilterModal>
  )
}
