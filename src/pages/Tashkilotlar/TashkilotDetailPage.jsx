import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, FileBarChart2, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { orgActivated, orgSuspended, orgUpdated } from '@/features/tashkilotlar/tashkilotlarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import OrgModal from './components/OrgModal'
import SuspendOrgModal from './components/SuspendOrgModal'
import ActivateOrgModal from './components/ActivateOrgModal'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon, Copy01Icon, Edit02Icon } from '@hugeicons/core-free-icons/index'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'
const headBg = 'bg-[#9AC2FF] dark:bg-[#0052D2]/40'
const surface = 'bg-[#EFF1F7] dark:bg-white/[0.04]'

const STAT_META = [
  { key: 'filiallar', title: 'FILIALLAR', bg: '#D7D5FD', suffix: ' ta', digits: 0, to: '/filiallar' },
  { key: 'foydalanuvchilar', title: 'FOYDALANUVCHILAR', bg: '#CDE7FE', suffix: ' ta', digits: 0, to: '/foydalanuvchilar' },
  { key: 'mijozlar', title: 'MIJOZLAR', bg: '#F8C3B3', suffix: ' ta', digits: 0, to: '/hisobotlar/mijozlar-boyicha' },
  { key: 'savdo', title: 'SAVDO', bg: '#B3F8C5', suffix: ' UZS', digits: 2, to: '/hisobotlar/savdo-boyicha' },
]

export default function TashkilotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const org = useSelector((s) => s.tashkilotlar.list.find((o) => o.id === id))
  const currentUser = useSelector((s) => s.auth.user)

  const [editOpen, setEditOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader(org ? `Tashkilotlar › ${org.name}` : 'Tashkilotlar')

  useEffect(() => {
    if (!org) navigate('/tashkilotlar', { replace: true })
  }, [org, navigate])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!org) return null

  const suspended = org.status === 'suspended'

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        {/* Statistika kartalari */}
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_META.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => navigate(c.to)}
              style={{ backgroundColor: c.bg }}
              className="cursor-pointer rounded-lg p-5 text-left text-[#0A0A0A] transition-[filter] duration-150 hover:brightness-95"
            >
              <div className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.4px]">
                {c.title} <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={3} size={20} className="text-[#0052D2]" />
              </div>
              <p className="mt-3 text-[20px] font-semibold leading-tight">
                {formatNumber(org.stats[c.key], c.digits)}{c.suffix}
              </p>
            </button>
          ))}
        </div>

        {suspended && org.suspend && (
          <div className="rounded-[8px] bg-[#FEECEC] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Tashkilot to‘xtatilgan, {org.suspend.at}. Sabab: {org.suspend.reason}. To‘xtatdi: {org.suspend.by}.
          </div>
        )}
        {!suspended && org.activation && (
          <div className="rounded-lg bg-[#E6FAF1] px-4 py-3 text-[13px] font-medium leading-[19px] text-[#047A47] dark:bg-[#047A47]/15">
            Tashkilot faollashtirildi, {org.activation.at}. To‘xtatish sababi audit jurnalida saqlanib qoldi. Faollashtirdi:{' '}
            {org.activation.by}.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-row gap-2">
          {/* Filiallar jadvali */}
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>NOMI</th>
                    <th className={cn(THb, 'text-left')}>VILOYAT</th>
                    <th className={cn(THb, 'text-left')}>TUMAN</th>
                    <th className={cn(THb, 'text-left')}>MANZIL</th>
                    <th className={cn(THb, 'text-right')}>XODIM</th>
                    <th className={cn(THb, 'pr-4 text-right')}>OMBOR</th>
                  </tr>
                </thead>
                <tbody>
                  {org.branches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-sm text-[#737373]">Filial yo‘q</td>
                    </tr>
                  ) : (
                    org.branches.map((b, i) => (
                      <tr key={b.id} className="h-[60px] hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                        <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                        <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{b.name}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{b.viloyat}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{b.tuman}</td>
                        <td className="px-3 text-[13px] text-[#737373] dark:text-muted-foreground">{b.manzil}</td>
                        <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{b.xodim}</td>
                        <td className="px-3 pr-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{b.ombor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* O'ng panel */}
          <div className="w-full shrink-0 space-y-4 overflow-auto lg:w-[400px]">
            <Panel title="Tashkilot ma’lumotlari:">
              <InfoRow label="INN" value={org.inn} onCopy={() => copy(org.inn, 'INN')} />
              <InfoRow label="Direktor" value={org.director} />
              <InfoRow label="Titul" value={org.titul} onCopy={() => copy(org.titul, 'Titul')} />
              <InfoRow label="Telefon" value={org.phone} onCopy={() => copy(org.phone, 'Telefon')} />
              <InfoRow label="Viloyat" value={org.viloyat} />
              <InfoRow label="Tuman" value={org.tuman} />
              <InfoRow label="Manzil" value={org.manzil} />
              <InfoRow label="Ro‘yxatga olingan" value={org.registeredAt} />
              <InfoRow
                label="Holat"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                      suspended
                        ? 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                        : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    )}
                  >
                    {suspended ? 'To‘xtatilgan' : 'Faol'}
                  </span>
                }
              />
            </Panel>

            <Panel title="Foydalanuvchilar:">
              {org.users.map((u) => (
                <div key={u.role} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-[#525252] dark:text-muted-foreground">{u.role}</span>
                  <span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(u.count, 2)} UZS</span>
                </div>
              ))}
              <div className={cn('flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white', headBg)}>
                <span>JAMI</span>
                <span>{formatNumber(org.stats.foydalanuvchilar, 2)} UZS</span>
              </div>
            </Panel>
          </div>
        </div>

        {/* Pastki panel */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 py-3 dark:border-white/10 dark:bg-white/5">
          <Button
            onClick={() => setToast('Hisobot tayyorlanmoqda…')}
            className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <FileBarChart2 className="h-4 w-4" /> Xisobot
          </Button>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              disabled={suspended}
              onClick={() => setEditOpen(true)}
              className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
            </Button>
            {suspended ? (
              <Button
                onClick={() => setActivateOpen(true)}
                className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
              >
                <CheckCircle2 className="h-4 w-4" /> Faollashtirish
              </Button>
            ) : (
              <Button
                onClick={() => setSuspendOpen(true)}
                className="h-9 gap-2 bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
              >
                <X className="h-4 w-4" /> To‘xtatish
              </Button>
            )}
          </div>
        </div>
      </div>

      <OrgModal
        open={editOpen}
        onOpenChange={setEditOpen}
        org={org}
        onSave={(values) => {
          dispatch(orgUpdated({ id: org.id, patch: values }))
          setToast('O‘zgarishlar saqlandi')
        }}
      />
      <SuspendOrgModal
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        org={org}
        onConfirm={(reason) => {
          dispatch(orgSuspended({ id: org.id, reason, by: currentUser?.fullName ?? 'Administrator' }))
          setToast('Tashkilot to‘xtatildi')
        }}
      />
      <ActivateOrgModal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        org={org}
        onConfirm={() => {
          dispatch(orgActivated({ id: org.id, by: currentUser?.fullName ?? 'Administrator' }))
          setToast('Tashkilot faollashtirildi')
        }}
      />
      <Toast message={toast} />
    </>
  )
}

function Panel({ title, children }) {
  return (
    <div className={cn('overflow-hidden rounded-lg', surface)}>
      <div className={cn('sticky top-0 z-10 px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white', headBg)}>
        {title}
      </div>
      <div className="divide-y divide-[#DFE4EF] dark:divide-white/5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-[#737373] dark:text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center justify-end gap-1.5 text-right font-medium text-[#0A0A0A] dark:text-white">
        <span className="truncate">{value || '—'}</span>
        {onCopy && value && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
            aria-label="Nusxa olish"
          >
            <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
          </button>
        )}
      </span>
    </div>
  )
}
