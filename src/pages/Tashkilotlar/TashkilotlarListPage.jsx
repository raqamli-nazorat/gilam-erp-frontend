import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Building2, Filter, Plus, Search } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { orgAdded } from '@/features/tashkilotlar/tashkilotlarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import OrgModal from './components/OrgModal'
import OrgFilterModal, { EMPTY_ORG_FILTERS } from './components/OrgFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

function matchesCountBucket(n, bucket) {
  if (!bucket) return true
  if (bucket.endsWith('+ ta')) return n >= Number.parseInt(bucket, 10)
  const [lo, hi] = bucket.replace(' ta', '').split('–').map((s) => Number.parseInt(s, 10))
  return hi == null ? n === lo : n >= lo && n <= hi
}

export default function TashkilotlarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ORG_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader('Tashkilotlar')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function copy(e, text, label) {
    e.stopPropagation()
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

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
    if (filters.hudud) out = out.filter((o) => o.viloyat === filters.hudud)
    if (filters.holat) out = out.filter((o) => (filters.holat === 'Faol' ? o.status === 'active' : o.status === 'suspended'))
    if (filters.filiallarSoni) out = out.filter((o) => matchesCountBucket(o.branchCount, filters.filiallarSoni))
    if (filters.foydalanuvchilar) out = out.filter((o) => matchesCountBucket(o.stats?.foydalanuvchilar ?? 0, filters.foydalanuvchilar))
    if (filters.sanaDan || filters.sanaGacha)
      out = out.filter((o) => matchesDateRange(o.registeredAt, filters.sanaDan, filters.sanaGacha))
    return out
  }, [orgs, tab, search, filters])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
          {[
            ['all', 'Barchasi', counts.all],
            ['active', 'Faol', counts.active],
            ['suspended', 'To‘xtatilgan', counts.suspended],
          ].map(([key, label, n]) => {
            const active = tab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] dark:bg-card dark:text-white'
                    : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
                )}
              >
                {label}
                <span
                  className={cn(
                    'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                    active
                      ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                      : 'text-[#A3A3A3] dark:text-muted-foreground'
                  )}
                >
                  {n}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tashkilot yoki INN…"
              className="h-9 w-[280px] rounded-xl border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white rounded-xl px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-9 gap-2 rounded-xl bg-[#0052D2] px-3.5 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className={cn(TH, 'w-12 text-left')}>#</th>
                <th className={cn(TH, 'text-left')}>NOMI</th>
                <th className={cn(TH, 'text-right')}>INN</th>
                <th className={cn(TH, 'text-left')}>DIREKTOR</th>
                <th className={cn(TH, 'text-left')}>TELEFON</th>
                <th className={cn(TH, 'text-left')}>VILOYAT</th>
                <th className={cn(TH, 'text-left')}>TUMAN</th>
                <th className={cn(TH, 'text-right')}>FILIAL</th>
                <th className={cn(TH, 'text-left')}>HOLAT</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                        <Building2 className="h-6 w-6 text-[#737373]" />
                      </div>
                      <p className="text-sm text-[#737373]">Tashkilot topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shown.map((o, i) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/tashkilotlar/${o.id}`)}
                    className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{i + 1}</td>
                    <td className="px-4 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:text-[#60A5FA]">{o.name}</td>
                    <td className="px-4 text-right text-[13px] font-normal leading-[18px] text-[#0A0A0A] dark:text-muted-foreground">
                      <span className="inline-flex items-center justify-end gap-1.5">
                        {o.inn}
                        {o.inn && (
                          <button
                            type="button"
                            onClick={(e) => copy(e, o.inn, 'INN')}
                            className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                            aria-label="Nusxa olish"
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{o.director || '—'}</td>
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">
                      {o.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          {o.phone}
                          <button
                            type="button"
                            onClick={(e) => copy(e, o.phone, 'Telefon')}
                            className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                            aria-label="Nusxa olish"
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                          </button>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{o.viloyat || '—'}</td>
                    <td className="px-4 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{o.tuman || '—'}</td>
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
      <Toast message={toast} />
    </div>
  )
}
