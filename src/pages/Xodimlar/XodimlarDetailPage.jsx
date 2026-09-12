import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { holatBadgeCls, holatLabel } from '@/features/xodimlar/xodimlarData'
import { fetchXodimLedger } from '@/features/xodimlar/xodimlarSlice'
import Toast from '@/components/Toast'
import StatCards from './components/StatCards'
import XodimFooter from './components/XodimFooter'
import { Panel, InfoRow, surface } from './components/InfoPanel'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

export default function XodimlarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const employee = useSelector((s) => s.xodimlar.list.find((x) => x.id === id))
  const ledger = useSelector((s) => s.xodimlar.ledger)
  const ledgerStatus = useSelector((s) => s.xodimlar.ledgerStatus)
  const [toast, setToast] = useState('')

  usePageHeader(employee ? [{ label: 'Xodimlar', to: '/malumotnomalar/xodimlar' }, { label: employee.name }] : 'Xodimlar')

  useEffect(() => {
    if (!employee) navigate('/malumotnomalar/xodimlar', { replace: true })
  }, [employee, navigate])
  useEffect(() => {
    if (id) dispatch(fetchXodimLedger(id))
  }, [id, dispatch])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!employee) return null

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  const ishHaqi =
    employee.ishHaqiTuri === 'Savdodan foiz'
      ? `${employee.ishHaqiTuri} — ${formatNumber(employee.ishHaqiFoizi, 0)}%`
      : `${employee.ishHaqiTuri} — ${formatNumber(employee.ishHaqiSummasi, 2)} UZS`

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <StatCards
          items={[
            { title: 'HOLATI', value: holatLabel(employee.holat) },
            { title: 'LAVOZIMI', value: employee.lavozim || '—' },
            { title: 'FILIALI', value: employee.filial || '—' },
            { title: 'ISHGA OLINGAN', value: employee.ishgaOlinganSana || '—' },
          ]}
        />

        {employee.holat === 'boshagan' && employee.termination && (
          <div className="rounded-[8px] bg-[#FEECEC] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Xodim ishdan chiqarildi, {employee.termination.at}. Sabab: {employee.termination.reason}.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
          {/* Ish tarixi jadvali (EmployeeLedger) */}
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>SANA</th>
                    <th className={cn(THb, 'text-left')}>AMAL</th>
                    <th className={cn(THb, 'pr-4 text-left')}>FILIAL</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerStatus === 'loading' ? (
                    <tr><td colSpan={4} className="py-14 text-center text-sm text-[#737373]">Yuklanmoqda…</td></tr>
                  ) : ledger.length === 0 ? (
                    <tr><td colSpan={4} className="py-14 text-center text-sm text-[#737373]">Tarix yo‘q</td></tr>
                  ) : (
                    ledger.map((row, i) => (
                      <tr key={row.id} className="h-11 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                        <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{row.sana}</td>
                        <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">{row.amal}</td>
                        <td className="px-3 pr-4 text-[13px] text-[#525252] dark:text-muted-foreground">{row.filial || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* O'ng panel */}
          <div className="w-full shrink-0 space-y-4 overflow-auto lg:w-[400px]">
            <Panel title="XODIM MA’LUMOTLARI">
              <InfoRow label="Tashkiloti" value={employee.tashkilot} />
              <InfoRow label="Filiali" value={employee.filial} />
              <InfoRow label="Lavozimi" value={employee.lavozim} />
              <InfoRow label="Karta raqami" value={employee.kartaRaqami} onCopy={() => copy(employee.kartaRaqami, 'Karta raqami')} />
              <InfoRow label="Ishga olingan sana" value={employee.ishgaOlinganSana} />
              <InfoRow label="Ish haqi turi" value={ishHaqi} />
              <InfoRow label="Qo‘shimcha summa" value={`${formatNumber(employee.qoshimchaSumma, 2)} UZS`} />
              <InfoRow label="Qo‘shimcha foiz" value={`${formatNumber(employee.qoshimchaFoizi, 0)} %`} />
              <InfoRow
                label="Holati"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-medium tracking-[0.3px]',
                      holatBadgeCls(employee.holat)
                    )}
                  >
                    {holatLabel(employee.holat)}
                  </span>
                }
              />
            </Panel>
          </div>
        </div>

        <XodimFooter employee={employee} />
      </div>
      <Toast message={toast} />
    </>
  )
}
