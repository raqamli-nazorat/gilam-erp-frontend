import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import { useTabel } from '@/features/tabel/tabelSlice'
import { MONTHS, SCHEDULES, branchName, WEEKDAY_FULL, cellKind, fmtDmy, fmtHours } from '@/features/tabel/tabelData'
import DayDetailModal from './components/DayDetailModal'
import { CELL_STYLE, farqColor } from './components/tabelStyles'

const TH = 'sticky top-0 z-[2] h-12 bg-[#F5F5F5] px-4 text-left text-[14px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD = 'h-[52px] border-b border-[#F0F0F0] px-4 text-[15px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const CARD = 'flex min-h-[104px] flex-col justify-between rounded-xl p-5 text-left text-[#0A0A0A]'
const LABEL = 'text-[12px] font-semibold uppercase tracking-[0.4px]'
const VALUE = 'text-[24px] font-semibold leading-8'

export default function TabelXodimPage() {
  const { id, employeeId } = useParams()
  const { tabel, sheet } = useTabel(id)
  const employee = sheet?.rows.find((r) => r.id === employeeId)
  if (!tabel) return <Navigate to="/tabel" replace />
  // Tabel filiali almashtirilgan va xodim endi yo'q bo'lsa — tabelga qaytamiz
  if (!employee) return <Navigate to={`/tabel/${id}`} replace />
  return <XodimTabel tabel={tabel} days={sheet.days} employee={employee} />
}

function XodimTabel({ tabel, days, employee }) {
  const navigate = useNavigate()
  const { id, status, year, month } = tabel
  const tabelPath = `/tabel/${id}`

  const [dayTarget, setDayTarget] = useState(null)
  const [toast, setToast] = useState('')

  usePageHeader([{ label: `${branchName(tabel.branchId)}, ${MONTHS[month]}`, to: tabelPath }, employee.name])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const schedule = SCHEDULES[employee.schedule]

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4">
        <Link
          to="/malumotnomalar/ish-grafigi"
          className={cn(CARD, 'transition-[filter] hover:brightness-[0.97]')}
          style={{ backgroundColor: '#D7D5FD' }}
        >
          <span className={cn(LABEL, 'inline-flex items-center gap-1')}>
            Ish grafigi <ArrowUpRight className="size-4 text-[#0052D2]" strokeWidth={2.5} />
          </span>
          <span className={cn(VALUE, 'uppercase')}>{schedule.name}</span>
        </Link>
        <div className={CARD} style={{ backgroundColor: '#CDE7FE' }}>
          <span className={LABEL}>Plan soat</span>
          <span className={VALUE}>{fmtHours(employee.plan, true)}</span>
        </div>
        <div className={CARD} style={{ backgroundColor: '#F8C3B3' }}>
          <span className={LABEL}>Fakt soat</span>
          <span className={VALUE}>{fmtHours(employee.fakt, true)}</span>
        </div>
        <div className={CARD} style={{ backgroundColor: '#B3F8C5' }}>
          <span className={LABEL}>Farq</span>
          <span className={cn(VALUE, employee.farq < 0 && 'text-[#B91C1C]')}>{fmtHours(employee.farq, true)}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12')}>#</th>
              <th className={TH}>Sana</th>
              <th className={TH}>Hafta kuni</th>
              <th className={TH}>Plan soat</th>
              <th className={TH}>Ishga kelgan</th>
              <th className={TH}>Tushlikka chiqqan</th>
              <th className={TH}>Tushlikdan qaytgan</th>
              <th className={TH}>Ishdan chiqqan</th>
              <th className={cn(TH, 'text-right')}>Fakt soat</th>
              <th className={cn(TH, 'text-right')}>Farq</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => {
              const e = employee.entries[i]
              const kind = cellKind(e)
              const off = kind === 'dam'
              const farq = e.fakt - e.plan
              return (
                <tr key={d.day} className="hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                  <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>{d.day}</td>
                  <td className={TD}>
                    {off ? (
                      <span className="text-[#525252] dark:text-muted-foreground">{fmtDmy(year, month, d.day)}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDayTarget({ employee, day: d.day, entry: e })}
                        className="font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]"
                      >
                        {fmtDmy(year, month, d.day)}
                      </button>
                    )}
                  </td>
                  <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>{WEEKDAY_FULL[d.wd]}</td>
                  <td className={cn(TD, off && 'text-[#525252]')}>{fmtHours(e.plan)}</td>
                  <td className={cn(TD, off && 'text-[#525252]')}>{e.kelgan || '0'}</td>
                  <td className={cn(TD, off && 'text-[#525252]')}>{e.tushlikChiqqan || '0'}</td>
                  <td className={cn(TD, off && 'text-[#525252]')}>{e.tushlikQaytgan || '0'}</td>
                  <td className={cn(TD, off && 'text-[#525252]')}>{e.ketgan || '0'}</td>
                  <td className={cn(TD, 'text-right')}>
                    {off ? (
                      <span className="text-[#525252]">0</span>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-medium',
                          kind !== 'norma' && CELL_STYLE[kind]
                        )}
                      >
                        {fmtHours(e.fakt)}
                      </span>
                    )}
                  </td>
                  <td className={cn(TD, 'text-right', farq < 0 ? farqColor(farq) : 'text-[#525252]')}>{fmtHours(farq)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="sticky bottom-0 z-[2]">
            <tr className="bg-[#F5F5F5] font-semibold dark:bg-[#1f1f23]">
              <td colSpan={3} className="h-12 px-4 text-[15px]">Jami</td>
              <td className="px-4 text-[15px]">{fmtHours(employee.plan)}</td>
              <td colSpan={4} />
              <td className="px-4 text-right text-[15px]">{fmtHours(employee.fakt)}</td>
              <td className={cn('px-4 text-right text-[15px]', farqColor(employee.farq))}>{fmtHours(employee.farq)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-end rounded-xl bg-[#F5F5F5] px-4 py-3 dark:bg-white/5">
        <Button
          variant="outline"
          onClick={() => navigate(tabelPath)}
          className="h-10 gap-2 rounded-lg border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Tabelga qaytish
        </Button>
      </div>

      <DayDetailModal
        target={dayTarget}
        tabelId={id}
        year={year}
        month={month}
        readOnly={status !== 'draft'}
        onClose={() => setDayTarget(null)}
        onSaved={() => setToast('Kun ma’lumotlari saqlandi')}
      />

      <Toast message={toast} />
    </div>
  )
}
