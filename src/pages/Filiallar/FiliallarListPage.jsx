import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Filter, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { holatLabel } from '@/features/filiallar/filiallarData'
import { branchAdded } from '@/features/filiallar/filiallarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BranchModal from './components/BranchModal'
import BranchFilterModal, { EMPTY_BRANCH_FILTERS } from './components/BranchFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

export default function FiliallarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const branches = useSelector((s) => s.filiallar.list)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_BRANCH_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  usePageHeader('Filiallar')

  const counts = useMemo(
    () => ({
      all: branches.length,
      active: branches.filter((b) => b.status === 'active').length,
      closed: branches.filter((b) => b.status === 'closed').length,
    }),
    [branches]
  )
  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = branches
    if (tab === 'active') out = out.filter((b) => b.status === 'active')
    if (tab === 'closed') out = out.filter((b) => b.status === 'closed')
    if (search) {
      const q = search.trim().toLowerCase()
      out = out.filter((b) => b.name.toLowerCase().includes(q) || b.manzil.toLowerCase().includes(q))
    }
    if (filters.tashkilot) out = out.filter((b) => b.tashkilot === filters.tashkilot)
    if (filters.viloyat) out = out.filter((b) => b.viloyat === filters.viloyat)
    if (filters.turi) out = out.filter((b) => b.turi === filters.turi)
    if (filters.holat) out = out.filter((b) => (filters.holat === 'Faol' ? b.status === 'active' : b.status === 'closed'))
    return out
  }, [branches, tab, search, filters])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          {[
            ['all', 'Barchasi', counts.all],
            ['active', 'Faol', counts.active],
            ['closed', 'Yopilgan', counts.closed],
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
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filial yoki manzil…"
              className="h-9 w-[280px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
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
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi filial
          </Button>
        </div>
      </div>

      <p className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
        Filiallar, {shown.length} ta
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-white dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className={cn(TH, 'text-left')}>NOMI</th>
                <th className={cn(TH, 'text-left')}>TASHKILOT</th>
                <th className={cn(TH, 'text-left')}>HUDUD</th>
                <th className={cn(TH, 'text-left')}>MANZIL</th>
                <th className={cn(TH, 'text-left')}>TELEFON</th>
                <th className={cn(TH, 'text-right')}>OMBOR</th>
                <th className={cn(TH, 'text-left')}>HOLAT</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                        <Briefcase className="h-6 w-6 text-[#737373]" />
                      </div>
                      <p className="text-sm text-[#737373]">Filial topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shown.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/filiallar/${b.id}`)}
                    className="h-[72px] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{b.name}</td>
                    <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{b.tashkilot}</td>
                    <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{b.viloyat}</td>
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{b.manzil}</td>
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{b.phone || '—'}</td>
                    <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{b.ombor}</td>
                    <td className="px-4">
                      <span
                        className={cn(
                          'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                          b.status === 'active'
                            ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                            : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                        )}
                      >
                        {holatLabel(b.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BranchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        branch={null}
        onSave={(values) => {
          const action = dispatch(branchAdded(values))
          navigate(`/filiallar/${action.payload.id}`)
        }}
      />
      <BranchFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
