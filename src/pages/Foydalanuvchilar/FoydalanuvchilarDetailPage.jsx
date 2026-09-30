import { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { useServerPagedList } from '@/hooks/useServerPagedList'
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
import StatusBanner from '@/components/ui/StatusBanner'
import StatCards from './components/StatCards'
import UserFooter from './components/UserFooter'
import { Panel, InfoRow, surface, headBg } from './components/InfoPanel'

const THb =
  'sticky top-0 z-10 h-10 bg-[#9AC2FF] px-4 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

function statusMetaKey(userId) {
  return `gilam:userStatusMeta:${userId}`
}
function loadStatusMeta(userId) {
  try {
    const raw = localStorage.getItem(statusMetaKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function saveStatusMeta(userId, meta) {
  try {
    localStorage.setItem(statusMetaKey(userId), JSON.stringify(meta))
  } catch {
    // localStorage yo'q/bloklangan bo'lsa — banner shunchaki "kim"siz ko'rinadi
  }
}

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
  const currentUser = useSelector((s) => s.auth.user)
  const [toast, setToast] = useState('')
  // Shu renderda hozir bajarilgan harakat natijasi ({ userId, type, at, by, reason }) — userId
  // joriy `id`ga mos kelmasa (boshqa foydalanuvchiga o'tilgan), localStorage'dagi qiymat ishlatiladi.
  const [actionMeta, setActionMeta] = useState(null)
  const statusMeta = actionMeta?.userId === id ? actionMeta : loadStatusMeta(id)

  // Bog'langan xodimning to'liq ish tarixi — faqat "hozir bloklanganmi" emas, "hozirgina
  // faollashtirildimi" (justRehired) degan savolga javob berish uchun kerak (XodimlarDetailPage
  // bilan bir xil naqsh).
  const history = xodim?.history || []

  // Foydalanuvchining audit jurnali — scroll pagination bilan /audits/logs/?actor=<id>
  const fetchUserAuditPage = useCallback((params) => getAuditLogs(params), [])
  const {
    items: auditLogs,
    isLoading: auditLoading,
    isLoadingMore: auditLoadingMore,
    hasMore: auditHasMore,
    containerRef: auditScrollRef,
    sentinelRef: auditSentinelRef,
    handleScroll: handleAuditScroll,
  } = useServerPagedList(
    fetchUserAuditPage,
    { actor: id, ordering: '-timestamp' },
    { enabled: Boolean(id) }
  )

  usePageHeader(user ? [{ label: 'Foydalanuvchilar', to: '/foydalanuvchilar' }, { label: user.name }] : 'Foydalanuvchilar')

  useEffect(() => {
    dispatch(fetchUserDetail(id))
  }, [id, dispatch])

  useEffect(() => {
    if (user?.employeeId && xodim?.id !== user.employeeId) {
      dispatch(fetchXodimDetail(user.employeeId))
    }
  }, [user?.employeeId, xodim?.id, dispatch])

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
  const lastDismissal = [...history].reverse().find((r) => r.type === 'dismissal')
  const lastRecord = history[history.length - 1]
  const justRehired =
    xodim?.holat === 'faol' &&
    lastRecord?.type === 'recruitment' &&
    history.length > 1 &&
    history[history.length - 2]?.type === 'dismissal'
  const d = user.detail
  const salesTotal = d.lastSales.reduce((s, r) => s + r.amount, 0)

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-2">
        <StatCards
          items={[
            { title: 'SAVDOLARI', value: `${formatNumber(d.stats.savdolar, 0)} ta` },
            { title: 'SAVDO SUMMASI', value: `${formatNumber(d.stats.savdoSummasi, 2)} UZS` },
            { title: 'QAYTARISHLAR', value: `${formatNumber(d.stats.qaytarishlar, 0)} ta` },
            { title: 'OXIRGI KIRISH', value: d.stats.oxirgiKirish },
          ]}
        />

        {/* Figma: bog'langan xodim ishdan chiqarilganda ham bu sahifada "bloklangan"/"kirish
            yopildi" tilida ko'rsatiladi (Foydalanuvchilar sahifasi uchun asosiy ma'no — hisobga
            kirish yopilgani), garchi tagida bir xil TerminateEmployeeModal ishlatilsa ham. */}
        {xodim?.holat === 'boshagan' && lastDismissal && (
          <StatusBanner variant="danger">
            Foydalanuvchi bloklangan, {lastDismissal.yaratilgan}. Sabab: {lastDismissal.dismissalReason || ''}. Kirish yopildi.
            Blokladi: {currentUser?.fullName || ''}.
          </StatusBanner>
        )}
        {xodim && justRehired && lastRecord && (
          <StatusBanner variant="success">
            Foydalanuvchi faollashtirilgan, {lastRecord.yaratilgan}. Faollashtirdi: {currentUser?.fullName || ''}. Avvalgi
            bloklash sababi audit jurnalida saqlangan.
          </StatusBanner>
        )}
        {blocked && (
          <StatusBanner variant="danger">
            Foydalanuvchi bloklangan, {(statusMeta?.type === 'block' && statusMeta.at) || user.block?.at || ''}. Sabab:{' '}
            {(statusMeta?.type === 'block' && statusMeta.reason) || user.block?.reason || ''}. Blokladi:{' '}
            {(statusMeta?.type === 'block' && statusMeta.by) || user.block?.by || ''}.
          </StatusBanner>
        )}
        {!blocked && !xodim && statusMeta?.type === 'activate' && (
          <StatusBanner variant="success">
            Foydalanuvchi faollashtirilgan, {statusMeta.at}. Faollashtirdi: {statusMeta.by || ''}. Avvalgi bloklash sababi audit
            jurnalida saqlangan.
          </StatusBanner>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
          {/* Audit jadvali */}
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm', surface)}>
            <div ref={auditScrollRef} onScroll={handleAuditScroll} className="min-h-0 flex-1 overflow-auto">
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
                  {auditLoading && auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0052D2]" />
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center text-sm text-[#737373]">Amallar yo‘q</td>
                    </tr>
                  ) : (
                    auditLogs.map((row, i) => {
                      const info = getActionInfo(row.action)
                      const obyekt = row.object_repr || row.content_type_name || ''
                      return (
                        <tr key={row.id ?? i} className="h-10 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                          <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                          <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">
                            {formatAuditDateTime(row.timestamp).full}
                          </td>
                          <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">{info.label}</td>
                          <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">
                            {obyekt}
                          </td>
                          <td className="px-3 pr-4 text-[13px] text-[#737373] dark:text-muted-foreground">{row.remote_addr || ''}</td>
                        </tr>
                      )
                    })
                  )}
                  {auditLogs.length > 0 && auditHasMore && !auditLoading && (
                    <tr ref={auditSentinelRef} className="h-1">
                      <td colSpan={5} className="h-1 p-0" />
                    </tr>
                  )}
                  {auditLoadingMore && (
                    <tr>
                      <td colSpan={5} className="py-3 text-center">
                        <Loader2 className="mx-auto h-4 w-4 animate-spin text-[#0052D2]" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* O'ng panel */}
          <div className="flex w-full min-h-0 shrink-0 flex-col gap-4 lg:w-[400px] overflow-y-auto">
            <Panel title="FOYDALANUVCHI MA’LUMOTLARI" className="shrink-0">
              <InfoRow label="Tashkiloti" value={user.tashkilot?.name} />
              <InfoRow label="Filiali" value={user.filial?.name} />
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

            <Panel title="Oxirgi savdolari:" className="flex-1 overflow-y-auto min-h-[200px] max-h-[calc(100vh-480px)]">
              {d.lastSales.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4 py-3 text-center text-[13px] text-[#737373] dark:text-muted-foreground">
                  Bu ma’lumot hali mavjud emas
                </div>
              ) : (
                <>
                  {d.lastSales.map((r) => (
                    <div key={r.date} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                      <span className="text-[#525252] dark:text-muted-foreground">{r.date}</span>
                      <span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(r.amount, 2)} UZS</span>
                    </div>
                  ))}
                  <div className={cn('flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white', headBg)}>
                    <span>JAMI, {d.lastSales.length} kun</span>
                    <span>{formatNumber(salesTotal, 2)} UZS</span>
                  </div>
                </>
              )}
            </Panel>
          </div>
        </div>

        <UserFooter
          user={user}
          xodim={xodim}
          onStatusChange={(meta) => {
            saveStatusMeta(id, meta)
            setActionMeta(meta)
          }}
        />
      </div>
      <Toast message={toast} />
    </>
  )
}
