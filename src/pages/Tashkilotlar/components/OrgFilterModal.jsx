import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDistricts, fetchRegions } from '@/features/geo/geoSlice'
import { FilterField, FilterModal, FilterSelect } from '@/components/ui/filter-modal'
import { DatePicker, toISODate } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'

export const EMPTY_ORG_FILTERS = {
  region: '',
  district: '',
  holat: '',
  inn: '',
  branches_count_min: '',
  branches_count_max: '',
  start_date: '',
  end_date: '',
}

export default function OrgFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const dispatch = useDispatch()
  const regions = useSelector((s) => s.geo.regions)
  const districts = useSelector((s) => (draft.region ? s.geo.districtsByRegion[draft.region] || [] : []))

  useEffect(() => {
    if (open) dispatch(fetchRegions())
  }, [open, dispatch])

  useEffect(() => {
    if (draft.region) {
      dispatch(fetchDistricts(draft.region))
    }
  }, [draft.region, dispatch])

  return (
    <FilterModal
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
      onReset={() => setDraft(EMPTY_ORG_FILTERS)}
      onApply={() => {
        onApply(draft)
        onOpenChange(false)
      }}
    >
      <FilterField label="Viloyat">
        <FilterSelect
          value={draft.region}
          onChange={(v) => setDraft((d) => ({ ...d, region: v, district: '' }))}
          placeholder="Barcha viloyatlar"
          options={regions.map((r) => ({ value: r.id, label: r.name }))}
        />
      </FilterField>

      <FilterField label="Tuman">
        <FilterSelect
          value={draft.district}
          onChange={(v) => set('district', v)}
          placeholder={draft.region ? 'Barcha tumanlar' : 'Avval viloyatni tanlang'}
          disabled={!draft.region}
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
        />
      </FilterField>

      <FilterField label="Holat">
        <FilterSelect
          value={draft.holat}
          onChange={(v) => set('holat', v)}
          placeholder="Barcha holatlar"
          options={['Faol', 'To‘xtatilgan']}
        />
      </FilterField>

      <FilterField label="INN">
        <Input
          value={draft.inn}
          onChange={(e) => set('inn', e.target.value)}
          placeholder="INN bo‘yicha..."
          className="h-9 rounded-[8px] border-[#E5E5E5] bg-white px-3 text-[14px] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white"
        />
      </FilterField>

      <div className="col-span-2">
        <label className="mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground">
          Filiallar soni
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="0"
            value={draft.branches_count_min}
            onChange={(e) => set('branches_count_min', e.target.value)}
            placeholder="Dan (masalan: 1)"
            className="h-9 rounded-[8px] border-[#E5E5E5] bg-white px-3 text-[14px] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white"
          />
          <Input
            type="number"
            min="0"
            value={draft.branches_count_max}
            onChange={(e) => set('branches_count_max', e.target.value)}
            placeholder="Gacha (masalan: 10)"
            className="h-9 rounded-[8px] border-[#E5E5E5] bg-white px-3 text-[14px] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white"
          />
        </div>
      </div>

      <div className="col-span-2">
        <label className="mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground">
          Yaratilgan sana
        </label>
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            value={draft.start_date}
            onChange={(d) => set('start_date', toISODate(d))}
            placeholder="dan: KK.OO.YYYY"
          />
          <DatePicker
            value={draft.end_date}
            onChange={(d) => set('end_date', toISODate(d))}
            placeholder="gacha: KK.OO.YYYY"
          />
        </div>
      </div>
    </FilterModal>
  )
}
