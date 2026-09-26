import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchDistricts, fetchRegions } from '@/features/geo/geoSlice'
import { FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { DatePicker, toISODate } from '@/components/ui/date-picker'

export const EMPTY_BRANCH_FILTERS = {
  tashkilot: '',
  viloyat: '',
  tuman: '',
  holat: '',
  sanaDan: '',
  sanaGacha: '',
}

export default function BranchFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const orgsStatus = useSelector((s) => s.tashkilotlar.listStatus)
  const regions = useSelector((s) => s.geo.regions)
  const districts = useSelector((s) => (draft.viloyat ? s.geo.districtsByRegion[draft.viloyat] || [] : []))

  useEffect(() => {
    if (!open) return
    if (orgsStatus === 'idle') dispatch(fetchOrganizations())
    dispatch(fetchRegions())
  }, [open, orgsStatus, dispatch])

  useEffect(() => {
    if (draft.viloyat) {
      dispatch(fetchDistricts(draft.viloyat))
    }
  }, [draft.viloyat, dispatch])

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_BRANCH_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Tashkilot">
        <FilterSelect
          value={draft.tashkilot}
          onChange={(v) => set('tashkilot', v)}
          placeholder="Barcha tashkilotlar"
          options={orgs.map((o) => ({ value: o.id, label: o.name }))}
        />
      </FilterField>

      <FilterField label="Holat">
        <FilterSelect
          value={draft.holat}
          onChange={(v) => set('holat', v)}
          placeholder="Barcha holatlar"
          options={['Faol', 'Yopilgan']}
        />
      </FilterField>

      <FilterField label="Viloyat">
        <FilterSelect
          value={draft.viloyat}
          onChange={(v) => {
            setDraft((d) => ({ ...d, viloyat: v, tuman: '' }))
          }}
          placeholder="Barcha viloyatlar"
          options={regions.map((r) => ({ value: r.id, label: r.name }))}
        />
      </FilterField>

      <FilterField label="Tuman">
        <FilterSelect
          value={draft.tuman}
          onChange={(v) => set('tuman', v)}
          placeholder={draft.viloyat ? 'Barcha tumanlar' : 'Avval viloyatni tanlang'}
          disabled={!draft.viloyat}
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
        />
      </FilterField>

      <div className="col-span-2">
        <label className="mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground">
          Yaratilgan sana
        </label>
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            value={draft.sanaDan}
            onChange={(d) => set('sanaDan', toISODate(d))}
            placeholder="dan: KK.OO.YYYY"
          />
          <DatePicker
            value={draft.sanaGacha}
            onChange={(d) => set('sanaGacha', toISODate(d))}
            placeholder="gacha: KK.OO.YYYY"
          />
        </div>
      </div>
    </FilterModal>
  )
}
