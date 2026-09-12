import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { holatLabel } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { fetchUserDetail } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { holatBadgeCls as xodimHolatBadgeCls, holatLabel as xodimHolatLabel } from '@/features/xodimlar/xodimlarData'
import { fetchXodimDetail } from '@/features/xodimlar/xodimlarSlice'
import { getAuditLogs } from '@/services/auditService'
import { getActionInfo, formatAuditDateTime } from '@/features/audit/auditData'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import StatCards from './components/StatCards'
import UserFooter from './components/UserFooter'
import { Panel, InfoRow, surface } from './components/InfoPanel'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

export default function FoydalanuvchilarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((s) => (s.foydalanuvchilar.current?.id === id ? s.foydalanuvchilar.current : null))
  const detailStatus = useSelector((s) => s.foydalanuvchilar.detailStatus)
  const detailError = useSelector((s) => s.foydalanuvchilar.detailError)
  // Foydalanuvchiga bog'langan Xodim profili (bo'lsa) — Tahrirlash/Ishdan chiqarish/Qayta ishga
  // olish shu orqali ishlaydi (hr/employees + hr/recruitment-dismissals).
  const xodim = useSelector((s) => (s.xodimlar.current?.id === user?.employeeId ? s.xodimlar.current : null))
  const [toast, setToast] = useState('')

  // Foydalanuvchining audit jurnali — haqiqiy /audits/logs/?actor=<id> orqali
  const [audit, setAudit] = useState([])
  const [auditStatus, setAuditStatus] = useState('idle')

  usePageHeader(user ? [{ label: 'Foydalanuvchilar', to: '/foydalanuvchilar' }, { label: user.name }] : 'Foydalanuvchilar')

  useEffect(() => {
    dispatch(fetchUserDetail(id))
  }, [id, dispatch])

  useEffect(() => {
    if (user?.employeeId) dispatch(fetchXodimDetail(user.employeeId))
  }, [user?.employeeId, dispatch])

  useEffect(() => {
    let cancelled = false
    setAuditStatus('loading')
    getAuditLogs({ actor: id, page: 1, ordering: '-timestamp' })
      .then((res) => {
        if (cancelled) return
        const payload = res?.data || res
        setAudit(payload?.results ?? [])
        setAuditStatus('succeeded')
      })
      .catch(() => {
        if (!cancelled) setAuditStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (detailStatus === 'loading' && !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
        <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
      </div>
    )
  }

  if (detailStatus === 'failed' && !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#DC2626]">{detailError || 'Foydalanuvchi topilmadi'}</p>
        <Button
          variant="outline"
          onClick={() => navigate('/foydalanuvchilar', { replace: true })}
          className="h-9 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
        >
          Foydalanuvchilarga qaytish
        </Button>
      </div>
    )
  }

  if (!user) return null

  const blocked = !xodim && user.holat === 'blocked'
  const d = user.detail

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <StatCards
          items={[
            { title: 'SAVDOLARI', value: `${formatNumber(d.stats.savdolar, 0)} ta` },
            { title: 'SAVDO SUMMASI', value: `${formatNumber(d.stats.savdoSummasi, 2)} UZS` },
            { title: 'QAYTARISHLAR', value: `${formatNumber(d.stats.qaytarishlar, 0)} ta` },
            { title: 'OXIRGI KIRISH', value: d.stats.oxirgiKirish },
          ]}
        />

        {xodim?.holat === 'boshagan' && xodim.termination && (
          <div className="rounded-[8px] bg-[#FEECEC] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Xodim ishdan chiqarildi, {xodim.termination.at}. Sabab: {xodim.termination.reason}.
          </div>
        )}
        {blocked && user.block && (
          <div className="rounded-[8px] bg-[#FEECEC] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Foydalanuvchi bloklangan, {user.block.at}. Sabab: {user.block.reason}. Blokladi: {user.block.by}.
          </div>
        )}
        {!blocked && user.activation && (
          <div className="rounded-lg bg-[#E6FAF1] px-4 py-3 text-[13px] font-medium leading-[19px] text-[#047A47] dark:bg-[#047A47]/15">
            Foydalanuvchi faollashtirilgan, {user.activation.at}. Faollashtirdi: {user.activation.by}. Avvalgi bloklash sababi audit
            jurnalida saqlangan.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
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
                  {auditStatus === 'loading' ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center text-sm text-[#737373]">Yuklanmoqda…</td>
                    </tr>
                  ) : audit.length === 0 ? (
                    <tr><td colSpan={5} className="py-14 text-center text-sm text-[#737373]">Amallar yo‘q</td></tr>
                  ) : (
                    audit.map((row, i) => {
                      const info = getActionInfo(row.action)
                      const obyekt = row.object_repr || row.content_type_name || '–'
                      return (
                        <tr key={row.id ?? i} className="h-11 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                          <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                          <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">
                            {formatAuditDateTime(row.timestamp).full}
                          </td>
                          <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">{info.label}</td>
                          <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">
                            {obyekt === '–' ? <span className="font-normal text-[#737373] dark:text-muted-foreground">–</span> : obyekt}
                          </td>
                          <td className="px-3 pr-4 text-[13px] text-[#737373] dark:text-muted-foreground">{row.remote_addr || '–'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* O'ng panel */}
          <div className="w-full shrink-0 space-y-4 overflow-auto lg:w-[400px]">
            <Panel title="FOYDALANUVCHI MA’LUMOTLARI">
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
                      xodim
                        ? xodimHolatBadgeCls(xodim.holat)
                        : blocked
                          ? 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
                          : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    )}
                  >
                    {xodim ? xodimHolatLabel(xodim.holat) : holatLabel(user.holat)}
                  </span>
                }
              />
            </Panel>

            <Panel title="Oxirgi savdolari:">
              {d.lastSales.length === 0 ? (
                <div className="px-4 py-3 text-center text-[13px] text-[#737373] dark:text-muted-foreground">
                  Bu ma’lumot hali mavjud emas
                </div>
              ) : (
                d.lastSales.map((r) => (
                  <div key={r.date} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                    <span className="text-[#525252] dark:text-muted-foreground">{r.date}</span>
                    <span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(r.amount, 2)} UZS</span>
                  </div>
                ))
              )}
            </Panel>
          </div>
        </div>

        <UserFooter user={user} xodim={xodim} />
      </div>
      <Toast message={toast} />
    </>
  )
}
