import { useMemo, useState } from 'react'
import { ChevronDown, Filter, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { AUDIT_LOG, amalBadgeCls } from '@/features/audit/auditData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download01Icon } from '@/components/ui/icons'
import Toast from '@/components/Toast'
import AuditFilterModal, { EMPTY_AUDIT_FILTERS } from './components/AuditFilterModal'
import AuditDetailModal from './components/AuditDetailModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

export default function AuditJurnaliPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_AUDIT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [asc, setAsc] = useState(false)
  const [active, setActive] = useState(null)
  const [toast, setToast] = useState('')

  usePageHeader('Platforma › Audit jurnali')

  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = AUDIT_LOG
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter(
        (r) => r.jadval.toLowerCase().includes(q) || String(r.yozuv).includes(q) || r.ip.includes(q)
      )
    }
    if (filters.amal) out = out.filter((r) => r.amal === filters.amal)
    if (filters.jadval) out = out.filter((r) => r.jadval === filters.jadval)
    if (filters.foydalanuvchi) out = out.filter((r) => r.foydalanuvchi === filters.foydalanuvchi)
    if (filters.tashkilot) out = out.filter((r) => r.tashkilot === filters.tashkilot)
    const key = (r) => `${r.sana.split('.').reverse().join('')}${r.vaqt}`
    const dir = asc ? 1 : -1
    return [...out].sort((a, b) => dir * key(a).localeCompare(key(b)))
  }, [search, filters, asc])

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Jadval, yozuv ID yoki IP…"
              className="h-9 w-full max-w-[520px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2.5">
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
              variant="outline"
              onClick={() => setToast('Backend hali ulanmagan')}
              className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
            >
              <Download01Icon className="h-4 w-4" /> Yuklash
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-white dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className={cn(TH, 'text-left')}>
                    <button type="button" onClick={() => setAsc((v) => !v)} className="inline-flex items-center gap-1">
                      VAQT <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', asc && 'rotate-180')} />
                    </button>
                  </th>
                  <th className={cn(TH, 'text-left')}>FOYDALANUVCHI</th>
                  <th className={cn(TH, 'text-left')}>TASHKILOT</th>
                  <th className={cn(TH, 'text-left')}>AMAL</th>
                  <th className={cn(TH, 'text-left')}>JADVAL</th>
                  <th className={cn(TH, 'text-right')}>YOZUV</th>
                  <th className={cn(TH, 'text-left')}>IP</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-[#737373]">Yozuv topilmadi</td>
                  </tr>
                ) : (
                  shown.slice(0, 300).map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setActive(r)}
                      className="h-[52px] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                    >
                      <td className="px-4 text-[13px] text-[#0A0A0A] dark:text-white">{r.vaqt}</td>
                      <td className="px-4 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.foydalanuvchi}</td>
                      <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{r.tashkilot}</td>
                      <td className="px-4">
                        <span className={cn('inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold tracking-[0.3px]', amalBadgeCls(r.amal))}>
                          {r.amal}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{r.jadval}</td>
                      <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.yozuv}</td>
                      <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AuditFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
        <AuditDetailModal row={active} onClose={() => setActive(null)} />
      </div>
      <Toast message={toast} />
    </>
  )
}
