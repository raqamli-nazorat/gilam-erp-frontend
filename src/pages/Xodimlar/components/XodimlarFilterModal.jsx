import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllDistricts, fetchRegions } from '@/features/geo/geoSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { FilterDateRange, FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'

// XodimlarListPage.jsx uchun (Viloyat/Tuman/Filial/Holat/Yaratilgan) — "Ishga qabul qilish"
// ro'yxatining filtri (Tashkilot/Filial/Lavozim/Ish haqi turi/sana) bilan bir xil emas,
// shuning uchun shu nomdagi alohida fayl (XodimFilterModal.jsx'ga tegilmadi).
export const EMPTY_XODIMLAR_FILTERS = {
  viloyat: '',
  tuman: '',
  filial: '',
  holat: '',
  sanaDan: '',
  sanaGacha: '',
}

export default function XodimlarFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const dispatch = useDispatch()
  const regions = useSelector((s) => s.geo.regions)
  const allDistricts = useSelector((s) => s.geo.allDistricts)
  const branches = useSelector((s) => s.filiallar.list)

  useEffect(() => {
    if (!open) return
    dispatch(fetchRegions())
    dispatch(fetchAllDistricts())
    dispatch(fetchBranches())
  }, [open, dispatch])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'viloyat' && v !== d.viloyat) next.tuman = ''
      return next
    })

  const tumanOptions = useMemo(
    () => (draft.viloyat ? allDistricts.filter((d) => d.regionName === draft.viloyat).map((d) => d.name) : []),
    [allDistricts, draft.viloyat]
  )

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_XODIMLAR_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Viloyat">
        <FilterSelect value={draft.viloyat} onChange={(v) => set('viloyat', v)} options={regions.map((r) => r.name)} />
      </FilterField>
      <FilterField label="Tuman">
        <FilterSelect value={draft.tuman} onChange={(v) => set('tuman', v)} options={tumanOptions} disabled={!draft.viloyat} />
      </FilterField>
      <FilterField label="Filial">
        <FilterSelect value={draft.filial} onChange={(v) => set('filial', v)} options={branches.map((b) => b.name)} />
      </FilterField>
      <FilterField label="Holat">
        <FilterSelect value={draft.holat} onChange={(v) => set('holat', v)} options={['Faol', 'Nofaol']} />
      </FilterField>
      <FilterDateRange
        label="Yaratilgan"
        className="col-span-2"
        from={draft.sanaDan}
        to={draft.sanaGacha}
        onFromChange={(v) => set('sanaDan', v)}
        onToChange={(v) => set('sanaGacha', v)}
      />
    </FilterModal>
  )
}
