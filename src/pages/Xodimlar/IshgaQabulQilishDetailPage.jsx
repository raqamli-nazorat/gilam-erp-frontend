import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { setRecruitmentStatus, updateRecruitment } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import { Panel, InfoRow, surface } from './components/InfoPanel'
import RecruitmentModal from './components/RecruitmentModal'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

const STATUS_LABEL = { draft: 'Qoralama', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan' }
const STATUS_CARD_CLS = {
  draft: 'bg-[#E5E5E5] text-[#0A0A0A]',
  confirmed: 'bg-[#CDE7FE] text-[#0A0A0A]',
  cancelled: 'bg-[#F8C3B3] text-[#0A0A0A]',
}
const STATUS_BADGE_CLS = {
  draft: 'bg-[#0A0A0A] text-white dark:bg-white/20 dark:text-white',
  confirmed: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]',
}

export default function IshgaQabulQilishDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const record = useSelector((s) => s.xodimlar.recruitments.find((r) => r.id === id))
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader(
    record
      ? [{ label: "Ma'lumotnomalar" }, { label: 'Ishga qabul qilish', to: '/malumotnomalar/ishga-qabul-qilish' }, { label: record.employeeName }]
      : 'Ishga qabul qilish'
  )

  useEffect(() => {
    if (!record) navigate('/malumotnomalar/ishga-qabul-qilish', { replace: true })
  }, [record, navigate])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!record) return null

  const ishHaqi =
    record.ishHaqiTuri === 'sales_percent'
      ? `Savdodan foiz — ${formatNumber(record.fixFoiz, 0)}%`
      : `Belgilangan summa — ${formatNumber(record.fixSumma, 2)} UZS`

  function setStatus(status) {
    dispatch(setRecruitmentStatus({ id: record.id, status }))
      .unwrap()
      .then(() => setToast(status === 'confirmed' ? 'Tasdiqlandi' : 'Bekor qilindi'))
      .catch((err) => setToast(err || 'Xatolik yuz berdi'))
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={cn('rounded-xl p-5 text-left', STATUS_CARD_CLS[record.status])}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">HOLATI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{STATUS_LABEL[record.status]}</p>
          </div>
          <div className="rounded-xl bg-[#CDE7FE] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">LAVOZIMI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{record.lavozim || '—'}</p>
          </div>
          <div className="rounded-xl bg-[#F8C3B3] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">FILIALI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{record.branch || '—'}</p>
          </div>
          <div className="rounded-xl bg-[#B3F8C5] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">ISHGA OLINGAN</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{record.sana || '—'}</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>SANA</th>
                    <th className={cn(THb, 'text-left')}>YARATILGAN</th>
                    <th className={cn(THb, 'text-left')}>YANGILANGAN</th>
                    <th className={cn(THb, 'text-left')}>AMAL</th>
                    <th className={cn(THb, 'text-left')}>LAVOZIM</th>
                    <th className={cn(THb, 'pr-4 text-left')}>FILIAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-11 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                    <td className="px-3 text-[13px] text-[#737373]">1</td>
                    <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{record.sana || '—'}</td>
                    <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{record.yaratilgan || '—'}</td>
                    <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{record.ozgartirilgan || '—'}</td>
                    <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">Ishga olindi</td>
                    <td className="px-3 text-[13px] text-[#0052D2] dark:text-[#60A5FA]">{record.lavozim || '—'}</td>
                    <td className="px-3 pr-4 text-[13px] text-[#525252] dark:text-muted-foreground">{record.branch || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex w-full min-h-0 shrink-0 flex-col gap-4 lg:w-[400px]">
            <Panel title="XODIM MA’LUMOTLARI" className="min-h-0 flex-1">
              <InfoRow label="F.I.SH." value={record.employeeName} />
              <InfoRow label="Filiali" value={record.branch} />
              <InfoRow label="Lavozimi" value={record.lavozim} />
              <InfoRow label="Karta raqami" value={record.kartaRaqami} />
              <InfoRow label="Ishga olingan sana" value={record.sana} />
              <InfoRow label="Ish haqi turi" value={ishHaqi} />
              <InfoRow label="Qo‘shimcha summa" value={`${formatNumber(record.extraSumma, 2)} UZS`} />
              <InfoRow label="Qo‘shimcha foiz" value={`${formatNumber(record.extraFoiz, 0)} %`} />
              <InfoRow
                label="Holati"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-medium tracking-[0.3px]',
                      STATUS_BADGE_CLS[record.status]
                    )}
                  >
                    {STATUS_LABEL[record.status]}
                  </span>
                }
              />
            </Panel>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 py-3 dark:border-white/10 dark:bg-white/5">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
          >
            <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
          </Button>
          {record.status === 'draft' && (
            <Button
              onClick={() => setStatus('confirmed')}
              className="h-9 gap-2 bg-[#047A47] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#036139]"
            >
              Tasdiqlash
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button
              onClick={() => setStatus('cancelled')}
              className="h-9 gap-2 bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              Bekor qilish
            </Button>
          )}
        </div>
      </div>

      <RecruitmentModal
        open={editOpen}
        onOpenChange={setEditOpen}
        record={record}
        onSave={({ status, draft }) => {
          dispatch(updateRecruitment({ id: record.id, employeeId: record.employeeId, status, draft }))
            .unwrap()
            .then(() => setToast('O‘zgarishlar saqlandi'))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />
      <Toast message={toast} />
    </>
  )
}
