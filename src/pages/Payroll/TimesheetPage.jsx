import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Barcode, CheckCircle2, Printer } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EMPLOYEES, TIMESHEET_WEEKDAY } from '@/features/payroll/payrollMockData'
import { timesheetScanned } from '@/features/payroll/payrollSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download01Icon } from '@/components/ui/icons'
import PayrollStatusBadge from './components/PayrollStatusBadge'

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

// "2026-08-13" -> "13.08.2026"
const fmt = (iso) => {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
const nowHM = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function TimesheetPage() {
  const dispatch = useDispatch()
  const timesheet = useSelector((s) => s.payroll.timesheet)

  const [code, setCode] = useState('')
  const [lastScan, setLastScan] = useState({ name: 'Kamol Usta', time: '09:02', action: 'keldi' })
  const [error, setError] = useState('')

  usePageHeader('Kunlik tabel', { label: `${EMPLOYEES.length} xodim`, variant: 'new' })

  const stats = useMemo(() => {
    const present = timesheet.filter((t) => t.arrived).length
    const late = timesheet.filter((t) => t.status === 'kechikdi').length
    const absent = timesheet.filter((t) => !t.arrived).length
    return { present, late, absent, total: timesheet.length }
  }, [timesheet])

  function handleScan() {
    const value = code.trim()
    if (!value) return
    const emp = EMPLOYEES.find((e) => e.badge === value)
    if (!emp) {
      setError(`"${value}" — bunday bej topilmadi`)
      setCode('')
      return
    }
    const row = timesheet.find((t) => t.empId === emp.id)
    const time = nowHM()
    const action = row && !row.arrived ? 'keldi' : row && !row.left ? 'ketdi' : null
    if (!action) {
      setError(`${emp.name} bugun allaqachon kelib-ketgan`)
      setCode('')
      return
    }
    dispatch(timesheetScanned({ empId: emp.id, time }))
    setLastScan({ name: emp.name, time, action })
    setError('')
    setCode('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#0A0A0A] dark:text-white">
          {fmt('2026-08-13')} · {TIMESHEET_WEEKDAY}
        </h2>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Printer className="h-4 w-4" /> Chop etish
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Download01Icon className="h-4 w-4" /> Yuklash
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Scan panel */}
        <div className="w-full shrink-0 self-start rounded-xl border border-[#E5E5E5] bg-white p-5 dark:border-white/10 dark:bg-card lg:w-[340px]">
          <div className="flex flex-col items-center text-center">
            <Barcode className="h-8 w-8 text-[#0052D2] dark:text-[#60A5FA]" />
            <p className="mt-2 text-[15px] font-semibold text-[#0A0A0A] dark:text-white">Bejni skanerlang</p>
            <p className="mt-1 text-[13px] text-[#737373] dark:text-muted-foreground">
              Xodim kelganda va ketganda bir marta skanerlaydi — vaqt avtomatik yoziladi
            </p>
          </div>

          <div className="relative mt-4">
            <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Bej shtrix kodi"
              className="h-9 w-full rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>

          {error ? (
            <p className="mt-2 rounded-lg bg-[#FEECEC] px-3 py-2 text-[13px] font-medium text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
              {error}
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#E6FAF1] px-3 py-2 text-[13px] font-medium text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {lastScan.name} · {lastScan.time} da {lastScan.action}
            </p>
          )}

          <div className="mt-4 space-y-2 text-[13px]">
            <StatRow label="Bugun ishda" value={`${stats.present} / ${stats.total}`} />
            <StatRow label="Kechikkanlar" value={stats.late} />
            <StatRow label="Kelmaganlar" value={stats.absent} />
          </div>
        </div>

        {/* Attendance table */}
        <div className="flex-1 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
                <th className={cn(TH, 'w-10 text-left')}>#</th>
                <th className={cn(TH, 'text-left')}>XODIM</th>
                <th className={cn(TH, 'text-left')}>LAVOZIM</th>
                <th className={cn(TH, 'text-right')}>KELGAN</th>
                <th className={cn(TH, 'text-right')}>KETGAN</th>
                <th className={cn(TH, 'text-right')}>SOAT</th>
                <th className={cn(TH, 'text-left')}>HOLAT</th>
              </tr>
            </thead>
            <tbody>
              {timesheet.map((t, i) => (
                <tr key={t.id} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{t.name}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{t.role}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{t.arrived || '—'}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{t.left || '—'}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{t.hours != null ? formatNumber(t.hours, 2) : '—'}</td>
                  <td className="px-3"><PayrollStatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 last:border-0 last:pb-0 dark:border-white/10">
      <span className="text-[#737373] dark:text-muted-foreground">{label}</span>
      <span className="font-semibold text-[#0A0A0A] dark:text-white">{value}</span>
    </div>
  )
}
