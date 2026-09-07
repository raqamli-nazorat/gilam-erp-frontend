import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { holatLabel } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import Toast from '@/components/Toast'
import StatCards from './components/StatCards'
import UserFooter from './components/UserFooter'
import { Panel, InfoRow, headBg, surface } from './components/InfoPanel'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

export default function FoydalanuvchilarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector((s) => s.foydalanuvchilar.list.find((u) => u.id === id))
  const [toast, setToast] = useState('')

  usePageHeader(user ? `Foydalanuvchilar › ${user.name}` : 'Foydalanuvchilar')

  useEffect(() => {
    if (!user) navigate('/foydalanuvchilar', { replace: true })
  }, [user, navigate])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!user) return null

  const blocked = user.holat === 'blocked'
  const d = user.detail
  const salesTotal = d.lastSales.reduce((s, r) => s + r.amount, 0)

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        {blocked && user.block && (
          <div className="rounded-lg bg-[#FEECEC] px-4 py-3 text-[13px] font-medium leading-[19px] text-[#DC2626] dark:bg-[#DC2626]/15">
            Foydalanuvchi bloklangan, {user.block.at}. Sabab: {user.block.reason}. Blokladi: {user.block.by}.
          </div>
        )}
        {!blocked && user.activation && (
          <div className="rounded-lg bg-[#E6FAF1] px-4 py-3 text-[13px] font-medium leading-[19px] text-[#047A47] dark:bg-[#047A47]/15">
            Foydalanuvchi faollashtirilgan, {user.activation.at}. Faollashtirdi: {user.activation.by}. Avvalgi bloklash sababi audit
            jurnalida saqlangan.
          </div>
        )}

        <StatCards
          items={[
            { title: 'SAVDOLARI', value: `${formatNumber(d.stats.savdolar, 0)} ta` },
            { title: 'SAVDO SUMMASI', value: `${formatNumber(d.stats.savdoSummasi, 2)} UZS` },
            { title: 'QAYTARISHLAR', value: `${formatNumber(d.stats.qaytarishlar, 0)} ta` },
            { title: 'OXIRGI KIRISH', value: d.stats.oxirgiKirish },
          ]}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          {/* Audit jadvali */}
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>SANA VA VAQT</th>
                    <th className={cn(THb, 'text-left')}>AMAL</th>
                    <th className={cn(THb, 'text-left')}>OBYEKT</th>
                    <th className={cn(THb, 'pr-4 text-left')}>IP MANZIL</th>
                  </tr>
                </thead>
                <tbody>
                  {d.audit.length === 0 ? (
                    <tr><td colSpan={5} className="py-14 text-center text-sm text-[#737373]">Amallar yo‘q</td></tr>
                  ) : (
                    d.audit.map((row, i) => (
                      <tr key={`${row.at}-${i}`} className="h-[60px] hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                        <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{row.at}</td>
                        <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">{row.amal}</td>
                        <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">
                          {row.obyekt === '–' ? <span className="font-normal text-[#737373] dark:text-muted-foreground">–</span> : row.obyekt}
                        </td>
                        <td className="px-3 pr-4 text-[13px] text-[#737373] dark:text-muted-foreground">{row.ip}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* O'ng panel */}
          <div className="w-full shrink-0 space-y-4 overflow-auto lg:w-[360px]">
            <Panel title="Foydalanuvchi ma’lumotlari:">
              <InfoRow label="Tashkiloti" value={user.tashkilot} />
              <InfoRow label="Filiali" value={user.filial} />
              <InfoRow label="Roli" value={user.rol} />
              <InfoRow label="Telefoni" value={user.phone} onCopy={() => copy(user.phone, 'Telefon')} />
              <InfoRow label="Yaratilgan" value={user.yaratilgan} />
              <InfoRow label="Oxirgi kirish" value={user.oxirgiKirish} />
              <InfoRow
                label="Holati"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                      blocked
                        ? 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
                        : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    )}
                  >
                    {holatLabel(user.holat)}
                  </span>
                }
              />
            </Panel>

            <Panel title="Oxirgi savdolari:">
              {d.lastSales.map((r) => (
                <div key={r.date} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-[#525252] dark:text-muted-foreground">{r.date}</span>
                  <span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(r.amount, 2)}</span>
                </div>
              ))}
              <div className={cn('flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white', headBg)}>
                <span>JAMI, 7 kun</span>
                <span>{formatNumber(salesTotal, 2)}</span>
              </div>
            </Panel>
          </div>
        </div>

        <UserFooter user={user} />
      </div>
      <Toast message={toast} />
    </>
  )
}
