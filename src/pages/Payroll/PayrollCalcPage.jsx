import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Briefcase, Check, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  CALC_SCHEMES,
  employeeBreakdown,
  SCHEME_COUNTS,
  sumBy,
} from '@/features/payroll/payrollMockData'
import { calcCreated, calcPaid } from '@/features/payroll/payrollSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import PayrollStatusBadge from './components/PayrollStatusBadge'
import PayrollExportMenu from './components/PayrollExportMenu'
import NewCalcModal from './components/NewCalcModal'
import PayModal from './components/PayModal'

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

// "2023-11-01" .. "2023-11-30"  ->  "01.11 — 30.11.2023"
function periodLabel(from, to) {
  const [, fm, fd] = from.split('-')
  const [ty, tm, td] = to.split('-')
  return `${fd}.${fm} — ${td}.${tm}.${ty}`
}
const dash = (n) => (n ? formatNumber(n) : '—')

export default function PayrollCalcPage() {
  const dispatch = useDispatch()
  const periods = useSelector((s) => s.payroll.periods)
  const exchangeRate = useSelector((s) => s.payroll.exchangeRate)

  const [schemeKey, setSchemeKey] = useState('savdodan')
  const [search, setSearch] = useState('')
  const [newOpen, setNewOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const scheme = CALC_SCHEMES.find((s) => s.key === schemeKey)
  const isEmployeeView = scheme.kind === 'employee'

  const periodRows = useMemo(() => {
    const base = periods.slice(0, SCHEME_COUNTS[schemeKey])
    if (!search) return base
    const q = search.toLowerCase()
    return base.filter((p) => periodLabel(p.from, p.to).toLowerCase().includes(q))
  }, [periods, schemeKey, search])

  const empRows = useMemo(() => {
    const base = employeeBreakdown[schemeKey] ?? []
    if (!search) return base
    const q = search.toLowerCase()
    return base.filter((r) => r.name.toLowerCase().includes(q))
  }, [schemeKey, search])

  const visibleCount = isEmployeeView ? empRows.length : periodRows.length
  usePageHeader('Ish haqi hisoblash', {
    label: search ? String(visibleCount) : String(SCHEME_COUNTS[schemeKey] ?? 0),
    variant: 'new',
  })

  const latestPeriod = periods[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Scheme tabs */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-1 border-b border-[#E5E5E5] dark:border-white/10">
        {CALC_SCHEMES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSchemeKey(s.key)}
            className={cn(
              'relative pb-2.5 pt-1 text-sm transition-colors',
              schemeKey === s.key
                ? 'font-medium text-[#0A0A0A] dark:text-white'
                : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
            )}
          >
            {s.label}
            {schemeKey === s.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#0A0A0A] dark:text-white">Hisoblangan davrlar</h2>
        <div className="flex items-center gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Xodim yoki davr…"
              className="h-9 w-[280px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setNewOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0052D2] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card"
          >
            <Plus className="h-4 w-4" /> Yangi hisoblash
          </Button>
          <PayrollExportMenu />
          <Button
            onClick={() => setPayOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Ish haqini berish
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {visibleCount === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <Briefcase className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Bu sxema bo'yicha hisoblash yo'q</p>
            <p className="text-sm text-[#737373]">
              Davrni tanlab yangi hisoblash yarating — sxemani keyin ham o'zgartirish mumkin
            </p>
            <Button
              onClick={() => setNewOpen(true)}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Yangi hisoblash
            </Button>
          </div>
        ) : isEmployeeView ? (
          <EmployeeTable rows={empRows} baseLabel={scheme.baseLabel} />
        ) : (
          <PeriodTable rows={periodRows} schemeLabel={scheme.label} />
        )}
      </div>

      <NewCalcModal
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={(input) => {
          dispatch(calcCreated(input))
          setToast(`Hisoblash yaratildi · ${periodLabel(input.from, input.to)}`)
        }}
      />
      <PayModal
        open={payOpen}
        onOpenChange={setPayOpen}
        period={latestPeriod}
        exchangeRate={exchangeRate}
        onConfirm={({ count, usd }) => {
          if (latestPeriod) dispatch(calcPaid(latestPeriod.id))
          setToast(`Ish haqi berildi · ${count} xodim · ${formatNumber(usd)} USD`)
        }}
      />
      <Toast message={toast} />
    </div>
  )
}

function PeriodTable({ rows, schemeLabel }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-[#F5F5F5] dark:bg-white/5">
        <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
          <th className={cn(TH, 'w-10 text-left')}>#</th>
          <th className={cn(TH, 'text-left')}>DAVR</th>
          <th className={cn(TH, 'text-left')}>TURI</th>
          <th className={cn(TH, 'text-right')}>JAMI SAVDO, USD</th>
          <th className={cn(TH, 'text-right')}>FOIZ</th>
          <th className={cn(TH, 'text-right')}>JAMI SUMMA, USD</th>
          <th className={cn(TH, 'text-right')}>XODIM SUMMASI, USD</th>
          <th className={cn(TH, 'text-left')}>MUALLIF</th>
          <th className={cn(TH, 'text-left')}>HOLAT</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => (
          <tr key={p.id} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
            <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
            <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{periodLabel(p.from, p.to)}</td>
            <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{schemeLabel}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.totalSales, 3)}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.percent, 2)}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.totalAmount, 3)}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.employeeAmount, 3)}</td>
            <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{p.author}</td>
            <td className="px-3"><PayrollStatusBadge status={p.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EmployeeTable({ rows, baseLabel }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-[#F5F5F5] dark:bg-white/5">
        <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
          <th className={cn(TH, 'w-10 text-left')}>#</th>
          <th className={cn(TH, 'text-left')}>XODIM</th>
          <th className={cn(TH, 'text-left')}>LAVOZIM</th>
          <th className={cn(TH, 'text-right')}>{baseLabel}</th>
          <th className={cn(TH, 'text-right')}>FOIZ</th>
          <th className={cn(TH, 'text-right')}>HISOBLANGAN, USD</th>
          <th className={cn(TH, 'text-right')}>AVANS, USD</th>
          <th className={cn(TH, 'text-right')}>USHLANMA, USD</th>
          <th className={cn(TH, 'text-right')}>BERILADIGAN, USD</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.empId} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
            <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
            <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.name}</td>
            <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.role}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.base != null ? formatNumber(r.base) : '—'}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.percent != null ? formatNumber(r.percent, 2) : '—'}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.hisoblangan)}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.avans)}</td>
            <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{dash(r.ushlanma)}</td>
            <td className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(r.beriladigan)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
        <tr className="h-11">
          <td className="px-3" />
          <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white">JAMI</td>
          <td className="px-3" />
          <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(sumBy(rows, 'base'))}</td>
          <td className="px-3" />
          <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(sumBy(rows, 'hisoblangan'))}</td>
          <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(sumBy(rows, 'avans'))}</td>
          <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(sumBy(rows, 'ushlanma'))}</td>
          <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(sumBy(rows, 'beriladigan'))}</td>
        </tr>
      </tfoot>
    </table>
  )
}
