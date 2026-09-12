import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Filter, Loader2, Plus, Search, Trash2, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { countrySlice } from '@/features/malumotnomalar/referenceEntities'
import { createRegion, deleteRegion, fetchAllDistricts, fetchRegions, updateRegion } from '@/features/geo/geoSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Toast from '@/components/Toast'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import GeoFilterModal, { EMPTY_GEO_FILTERS } from './components/GeoFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD_MUTED = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'
const fieldCls =
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

// Viloyatlar ro'yxatida "YARATILGAN"/"YANGILANGAN" backend'dan kelmaydi (Region'da bu maydonlar
// bor, lekin biz ularni geoSlice'da hozircha saqlamaymiz) — shu sabab formatDateTime bilan
// hozirgi vaqtni ko'rsatamiz, faqat shu seans davomida (sahifa yangilansa API'dan kelgan qiymat yo'q).
export default function ViloyatPage() {
  const dispatch = useDispatch()
  const regions = useSelector((s) => s.geo.regions)
  const regionsStatus = useSelector((s) => s.geo.regionsStatus)
  const regionsError = useSelector((s) => s.geo.regionsError)
  const allDistricts = useSelector((s) => s.geo.allDistricts)
  const countries = useSelector((s) => s.davlatlar.list)
  const countriesStatus = useSelector((s) => s.davlatlar.listStatus)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_GEO_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalRec, setModalRec] = useState(null)
  const [delRec, setDelRec] = useState(null)
  const [toast, setToast] = useState('')

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Viloyat' }])

  useEffect(() => {
    dispatch(fetchRegions())
    dispatch(fetchAllDistricts())
    if (countriesStatus === 'idle') dispatch(countrySlice.fetchItems())
  }, [dispatch, countriesStatus])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const tumanCountByRegion = useMemo(() => {
    const map = {}
    allDistricts.forEach((d) => {
      map[d.regionId] = (map[d.regionId] ?? 0) + 1
    })
    return map
  }, [allDistricts])

  const shown = useMemo(() => {
    let out = regions
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (filters.yaratilganDan || filters.yaratilganGacha)
      out = out.filter((r) => matchesDateRange(r.yaratilgan, filters.yaratilganDan, filters.yaratilganGacha))
    if (filters.ozgartirilganDan || filters.ozgartirilganGacha)
      out = out.filter((r) => matchesDateRange(r.ozgartirilgan, filters.ozgartirilganDan, filters.ozgartirilganGacha))
    return out
  }, [regions, search, filters])

  function saveRegion(values) {
    const action =
      modalRec === 'new'
        ? createRegion(values)
        : updateRegion({ id: modalRec.id, ...values })
    dispatch(action)
      .unwrap()
      .then(() => setToast('Saqlandi'))
      .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
  }

  function confirmDelete() {
    dispatch(deleteRegion(delRec.id))
      .unwrap()
      .then(() => setToast('O‘chirildi'))
      .catch((err) => setToast(err || 'O‘chirishda xatolik yuz berdi'))
  }

  const hasFilter = Object.values(filters).some(Boolean)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[260px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
        </div>

        <Button
          onClick={() => setModalRec('new')}
          className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <Plus className="h-4 w-4" /> Qo‘shish
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>VILOYAT</th>
              <th className={cn(TH, 'text-left')}>DAVLAT</th>
              <th className={cn(TH, 'text-left')}>TUMANLAR</th>
              <th className={cn(TH, 'text-left')}>YARATILGAN</th>
              <th className={cn(TH, 'text-left')}>YANGILANGAN</th>
              <th className={cn(TH, 'text-left')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {regionsStatus === 'loading' && shown.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : regionsStatus === 'failed' && shown.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <p className="text-sm text-[#DC2626]">{regionsError || 'Xatolik yuz berdi'}</p>
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr key={r.id} onClick={() => setModalRec(r)} className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                  <td className={TD_MUTED}>{i + 1}</td>
                  <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.name}</td>
                  <td className={TD_MUTED}>{r.countryName || '—'}</td>
                  <td className={TD_MUTED}>{tumanCountByRegion[r.id] ?? 0} ta</td>
                  <td className={TD_MUTED}>{r.yaratilgan || '—'}</td>
                  <td className={TD_MUTED}>{r.ozgartirilgan || '—'}</td>
                  <td className="px-4">
                    <span className="inline-flex h-[22px] items-center rounded-full bg-[#E6FAF1] px-2.5 text-[11px] font-medium tracking-[0.3px] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]">
                      Faol
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RegionModal
        open={!!modalRec}
        onOpenChange={(next) => !next && setModalRec(null)}
        record={modalRec === 'new' ? null : modalRec}
        countries={countries}
        countriesLoading={countriesStatus === 'loading'}
        onSave={saveRegion}
        onDelete={() => {
          const rec = modalRec
          setModalRec(null)
          setDelRec(rec)
        }}
      />

      <Dialog open={!!delRec} onOpenChange={(next) => !next && setDelRec(null)}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[480px]">
          <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
            <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
              Viloyatni o‘chirish?
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 text-[14px] text-[#525252] dark:text-muted-foreground">
            <span className="font-medium text-[#0A0A0A] dark:text-white">{delRec?.name}</span> o‘chiriladi. Bu amalni ortga qaytarib bo‘lmaydi.
          </div>
          <DialogFooter className="mx-0 mb-0 mt-0 flex gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDelRec(null)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              onClick={() => {
                confirmDelete()
                setDelRec(null)
              }}
              className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <Trash2 className="h-4 w-4" /> O‘chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GeoFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}

// Eslatma: "Kodi" maydoni backend Region modelida hali yo'q — forma saqlanadi va so'rovga
// qo'shib yuboriladi (backend qo'llab-quvvatlay boshlagach avtomatik ishlaydi).
function RegionModal({ open, onOpenChange, record, countries, countriesLoading, onSave, onDelete }) {
  const isEdit = !!record
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [kodi, setKodi] = useState('')

  useEffect(() => {
    if (!open) return
    setName(record?.name ?? '')
    setCountry(record?.countryId ?? (countries[0]?.id ?? ''))
    setKodi(record?.kodi ?? '')
  }, [open, record, countries])

  const canSave = name.trim().length > 1 && !!country

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[480px]">
        <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Tahrirlash' : 'Yangi viloyat'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 px-5 py-4">
          <div>
            <Label className={labelCls}>Viloyat nomi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Andijon" className={fieldCls} />
          </div>
          <div>
            <Label className={labelCls}>Davlat</Label>
            <Select value={country || '__none'} onValueChange={(v) => setCountry(v === '__none' ? '' : v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>
                  {(v) => {
                    if (v === '__none') return <span className="text-[#737373]">Tanlang</span>
                    return countries.find((c) => c.id === v)?.name ?? ''
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countriesLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#737373]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
                  </div>
                ) : (
                  countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className={labelCls}>Kodi</Label>
            <Input value={kodi} onChange={(e) => setKodi(e.target.value)} placeholder="UZ-SA-15" className={fieldCls} />
          </div>
        </div>
        <DialogFooter className="mx-0 mb-0 mt-0 flex items-center gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row sm:justify-between">
          {isEdit ? (
            <Button
              type="button"
              onClick={() => onDelete?.()}
              className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <Trash2 className="h-4 w-4" /> O‘chirish
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => {
                onSave({ name: name.trim(), country, kodi })
                onOpenChange(false)
              }}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              <Check className="h-4 w-4" /> Saqlash
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
