import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Building2, Filter, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { orgAdded } from '@/features/tashkilotlar/tashkilotlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import OrgModal from './components/OrgModal'
import OrgFilterModal, { EMPTY_ORG_FILTERS } from './components/OrgFilterModal'

const TH =
  'sticky top-0 z-10 h-11 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

export default function TashkilotlarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ORG_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  usePageHeader('Tashkilotlar')

  const counts = useMemo(
    () => ({
      all: orgs.length,
      active: orgs.filter((o) => o.status === 'active').length,
      suspended: orgs.filter((o) => o.status === 'suspended').length,
    }),
    [orgs]
  )
  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = orgs
    if (tab === 'active') out = out.filter((o) => o.status === 'active')
    if (tab === 'suspended') out = out.filter((o) => o.status === 'suspended')
    if (search) {
      const q = search.trim().toLowerCase()
      out = out.filter((o) => o.name.toLowerCase().includes(q) || o.inn.includes(q))
    }
    if (filters.viloyat) out = out.filter((o) => o.viloyat === filters.viloyat)
    if (filters.holat) out = out.filter((o) => (filters.holat === 'Faol' ? o.status === 'active' : o.status === 'suspended'))
    return out
  }, [orgs, tab, search, filters])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          {[
            ['all', 'Barchasi', counts.all],
            ['active', 'Faol', counts.active],
            ['suspended', 'To‘xtatilgan', counts.suspended],
          ].map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key
                  ? 'font-medium text-[#0A0A0A] dark:text-white'
                  : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                  tab === key
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}
              >
                {n}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tashkilot yoki INN…"
              className="h-9 w-[300px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi tashkilot
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className={cn(TH, 'text-left')}>NOMI</th>
                <th className={cn(TH, 'text-right')}>INN</th>
                <th className={cn(TH, 'text-left')}>DIREKTOR</th>
                <th className={cn(TH, 'text-left')}>TELEFON</th>
                <th className={cn(TH, 'text-left')}>HUDUD</th>
                <th className={cn(TH, 'text-right')}>FILIAL</th>
                <th className={cn(TH, 'text-left')}>HOLAT</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                        <Building2 className="h-6 w-6 text-[#737373]" />
                      </div>
                      <p className="text-sm text-[#737373]">Tashkilot topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shown.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/tashkilotlar/${o.id}`)}
                    className="h-[72px] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{o.name}</td>
                    <td className="px-4 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{o.inn}</td>
                    <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{o.director || '—'}</td>
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{o.phone || '—'}</td>
                    <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{o.viloyat || '—'}</td>
                    <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{o.branchCount}</td>
                    <td className="px-4">
                      <span
                        className={cn(
                          'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                          o.status === 'active'
                            ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                            : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                        )}
                      >
                        {o.status === 'active' ? 'Faol' : 'To‘xtatilgan'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrgModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        org={null}
        onSave={(values) => {
          const action = dispatch(orgAdded(values))
          navigate(`/tashkilotlar/${action.payload.id}`)
        }}
      />
      <OrgFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
