import { useMemo, useState } from 'react'
import { Filter, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { VILOYAT_NOMLARI, VILOYAT_TUMAN_ROWS } from '@/features/malumotnomalar/malumotnomalarData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RecordModal from './components/RecordModal'
import ViloyatTumanFilterModal, { EMPTY_VILOYAT_TUMAN_FILTERS } from './components/ViloyatTumanFilterModal'

const TH =
  'sticky top-0 z-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD_MUTED = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

const TUMAN_FIELDS = [
  { key: 'name', label: 'Tuman nomi', kind: 'text', required: true, placeholder: 'Masalan: Payariq', full: true },
  { key: 'davlat', label: 'Davlat', kind: 'select', required: true, options: ["O'zbekiston"], defaultValue: "O'zbekiston" },
  { key: 'viloyat', label: 'Viloyat', kind: 'select', required: true, options: VILOYAT_NOMLARI },
  { key: 'kodi', label: 'Kodi', kind: 'text', placeholder: 'UZ-SA-15', full: true },
]

export default function ViloyatTumanPage() {
  const [rows, setRows] = useState(VILOYAT_TUMAN_ROWS)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_VILOYAT_TUMAN_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const hasFilter = Object.values(filters).some(Boolean)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Viloyat va tuman' }])

  const shown = useMemo(() => {
    let out = rows
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (filters.davlat) out = out.filter((r) => r.davlat === filters.davlat)
    if (filters.viloyat) out = out.filter((r) => r.name === filters.viloyat)
    if (filters.holat) out = out.filter((r) => (filters.holat === 'Faol' ? r.active : !r.active))
    return out
  }, [rows, search, filters])

  function addTuman(values) {
    setRows((rs) => rs.map((r) => (r.name === values.viloyat ? { ...r, tumanlar: r.tumanlar + 1 } : r)))
  }

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
          onClick={() => setAddOpen(true)}
          className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <Plus className="h-4 w-4" /> Qo‘shish
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'h-10 w-12 text-left')}>#</th>
              <th className={cn(TH, 'h-10 text-left')}>VILOYAT</th>
              <th className={cn(TH, 'h-10 text-left')}>DAVLAT</th>
              <th className={cn(TH, 'h-10 text-left')}>TUMANLAR</th>
              <th className={cn(TH, 'h-10 text-left')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr key={r.id} className="h-11 hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                  <td className={TD_MUTED}>{i + 1}</td>
                  <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.name}</td>
                  <td className="px-4 text-[13px] text-[#0A0A0A] dark:text-muted-foreground">{r.davlat}</td>
                  <td className="px-4 text-[13px] text-[#0A0A0A] dark:text-muted-foreground">{r.tumanlar} ta</td>
                  <td className="px-4">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        r.active
                          ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                          : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                      )}
                    >
                      {r.active ? 'Faol' : 'Arxiv'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RecordModal open={addOpen} onOpenChange={setAddOpen} entity="tuman" fields={TUMAN_FIELDS} record={null} onSave={addTuman} />
      <ViloyatTumanFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
