import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Check, Loader2, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import * as recruitmentService from '@/services/recruitmentService'
import { mapRecruitment, rehireXodim, terminateXodim, updateRecruitment } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import { Panel, InfoRow, surface } from './components/InfoPanel'
import RecruitmentModal from './components/RecruitmentModal'
import TerminateEmployeeModal from './components/TerminateEmployeeModal'
import RehireEmployeeModal from './components/RehireEmployeeModal'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

const byDate = (a, b) => {
  if (a.sana !== b.sana) return a.sana < b.sana ? -1 : 1
  return a.yaratilganAt < b.yaratilganAt ? -1 : 1
}

// Xodimning to'liq ish tarixi (ishga olish / ishdan chiqarish hujjatlari), eskisidan yangisiga.
// Ro'yxat javobida `dismissal_reason` yo'q — sabab faqat banner/"Qayta ishga olish" oynasida
// ko'rsatiladigan ENG OXIRGI ishdan chiqarish hujjati uchun (bitta detal so'rovi) olinadi.
async function loadHistory(employeeId) {
  const rows = await recruitmentService.getAllRecruitmentDismissalsTagged({ employee: employeeId })
  const hist = rows.map(mapRecruitment).sort(byDate)
  const lastDismissal = [...hist].reverse().find((r) => r.type === 'dismissal')
  if (lastDismissal && !lastDismissal.dismissalReason) {
    try {
      const full = mapRecruitment(await recruitmentService.getRecruitmentDismissal(lastDismissal.id))
      lastDismissal.dismissalReason = full.dismissalReason
    } catch {
      // Sabab ko'rinmasa ham sahifa ishlayveradi.
    }
  }
  return hist
}

// Ma'lumotnomalar > Ishdan chiqarish > <xodim>. `:id` — ishdan chiqarish hujjati; sahifa shu
// hujjat egasi bo'lgan xodimning butun tarixini ko'rsatadi va uni qayta ishga olish /
// yana ishdan chiqarish imkonini beradi (Figma).
export default function IshdanChiqarishDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [doc, setDoc] = useState(null) // ochilgan ishdan chiqarish hujjati
  const [history, setHistory] = useState([])
  const [hire, setHire] = useState(null) // eng oxirgi "ishga olish" hujjatining to'liq shakli
  const [status, setStatus] = useState('loading')
  const [version, setVersion] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [rehireOpen, setRehireOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader([
    { label: "Ma'lumotnomalar" },
    { label: 'Ishdan chiqarish', to: '/malumotnomalar/ishdan-chiqarish' },
    ...(doc ? [{ label: doc.employeeName }] : []),
  ])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const current = mapRecruitment(await recruitmentService.getRecruitmentDismissal(id))
        const hist = await loadHistory(current.employeeId)
        const lastHire = [...hist].reverse().find((r) => r.type === 'recruitment')
        const hireFull = lastHire ? mapRecruitment(await recruitmentService.getRecruitmentDismissal(lastHire.id)) : null
        if (cancelled) return
        setDoc(current)
        setHistory(hist)
        setHire(hireFull ? { ...hireFull, tashkilot: lastHire.tashkilot } : null)
        setStatus('succeeded')
      } catch {
        if (!cancelled) setStatus('failed')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, version])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (status !== 'succeeded' || !doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        {status === 'failed' ? (
          <>
            <p className="text-sm text-[#DC2626]">Ma’lumotni yuklab bo‘lmadi</p>
            <Button variant="outline" onClick={() => setVersion((v) => v + 1)} className="h-8 px-3 text-[13px]">
              Qayta urinish
            </Button>
          </>
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
        )}
      </div>
    )
  }

  const latest = history[history.length - 1]
  const terminated = latest?.type === 'dismissal'
  const lastDismissal = [...history].reverse().find((r) => r.type === 'dismissal')
  const rehired = !terminated && history.length > 1 && history[history.length - 2]?.type === 'dismissal'

  const src = hire ?? doc
  const lavozim = src.lavozim
  const filial = src.branch
  const ishgaOlingan = hire?.sana ? formatDate(hire.sana) : ''
  const ishHaqi = !hire
    ? ''
    : hire.ishHaqiTuri === 'sales_percent'
      ? `Savdodan foiz — ${formatNumber(hire.fixFoiz, 0)}%`
      : hire.ishHaqiTuri === 'founder'
        ? 'Asoschi'
        : `Belgilangan summa — ${formatNumber(hire.fixSumma, 2)} UZS`

  const amalLabel = (r, i) =>
    r.type === 'dismissal' ? 'Ishdan chiqarildi' : i > 0 && history[i - 1]?.type === 'dismissal' ? 'Qayta ishga olindi' : 'Ishga olindi'

  function handleTerminate(reason, file) {
    dispatch(terminateXodim({ id: doc.employeeId, reason, file }))
      .unwrap()
      .then(() => {
        setToast('Xodim ishdan chiqarildi')
        setVersion((v) => v + 1)
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Ishdan chiqarishda xatolik yuz berdi' }))
  }

  // Qayta ishga olish — oxirgi "ishga olish" hujjatidagi filial/lavozim/karta/oylik bilan yangi hujjat.
  function handleRehire() {
    if (!hire) return
    dispatch(
      rehireXodim({
        id: doc.employeeId,
        draft: {
          filial: hire.branchId,
          lavozim: hire.lavozimId,
          kartaRaqami: hire.kartaRaqami,
          ishHaqiTuri: hire.ishHaqiTuri,
          ishHaqiSummasi: hire.fixSumma,
          ishHaqiFoizi: hire.fixFoiz,
          qoshimchaSumma: hire.extraSumma,
          qoshimchaFoizi: hire.extraFoiz,
          ishgaOlinganSana: new Date().toISOString().slice(0, 10),
        },
      })
    )
      .unwrap()
      .then(() => {
        setToast('Xodim qayta ishga olindi')
        setVersion((v) => v + 1)
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Qayta ishga olishda xatolik yuz berdi' }))
  }

  const cards = [
    ['HOLATI', terminated ? 'Ishdan chiqarilgan' : 'Faol', 'bg-[#DAD7FB]'],
    ['LAVOZIMI', lavozim, 'bg-[#CDE7FE]'],
    ['FILIALI', filial, 'bg-[#F8C3B3]'],
    ['ISHGA OLINGAN', ishgaOlingan, 'bg-[#B3F8C5]'],
  ]

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, bg]) => (
            <div key={label} className={cn('rounded-xl p-5 text-left text-[#0A0A0A]', bg)}>
              <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">{label}</div>
              <p className="mt-3 truncate text-[22px] font-bold leading-tight min-h-[1.25em]">{value || ''}</p>
            </div>
          ))}
        </div>

        {terminated && lastDismissal && (
          <div className="shrink-0 rounded-[8px] bg-[#FEECEC] px-4 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Xodim ishdan chiqarildi, {lastDismissal.yaratilgan}. Sabab: {lastDismissal.dismissalReason || ''}.
          </div>
        )}
        {rehired && (
          <div className="shrink-0 rounded-lg bg-[#E6FAF1] px-4 py-3 text-[13px] font-medium leading-5 text-[#047A47] dark:bg-[#047A47]/15 dark:text-[#34D399]">
            Xodim qayta ishga olindi, {latest.yaratilgan}. Avvalgi ishdan chiqarish sababi tarixda saqlangan.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>SANA</th>
                    <th className={cn(THb, 'text-left')}>AMAL</th>
                    <th className={cn(THb, 'text-left')}>LAVOZIM</th>
                    <th className={cn(THb, 'pr-4 text-left')}>FILIAL</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={r.id} className="h-11 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                      <td className="border-b border-[#DFE4EF] px-3 text-[13px] text-[#737373] dark:border-white/5">{i + 1}</td>
                      <td className="border-b border-[#DFE4EF] px-3 text-[13px] text-[#0A0A0A] dark:border-white/5 dark:text-white">
                        {formatDate(r.sana)}
                      </td>
                      <td className="border-b border-[#DFE4EF] px-3 text-[13px] text-[#0A0A0A] dark:border-white/5 dark:text-white">
                        {amalLabel(r, i)}
                      </td>
                      <td className="border-b border-[#DFE4EF] px-3 text-[13px] text-[#0052D2] dark:border-white/5 dark:text-[#60A5FA]">
                        {r.lavozim || ''}
                      </td>
                      <td className="border-b border-[#DFE4EF] px-3 pr-4 text-[13px] text-[#737373] dark:border-white/5 dark:text-muted-foreground">
                        {r.branch || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex w-full min-h-0 shrink-0 flex-col gap-4 lg:w-[400px]">
            <Panel title="XODIM MA’LUMOTLARI">
              <InfoRow label="Tashkiloti" value={hire?.tashkilot || doc.tashkilot} />
              <InfoRow label="Filiali" value={filial} />
              <InfoRow label="Lavozimi" value={lavozim} />
              <InfoRow
                label="Karta raqami"
                value={hire?.kartaRaqami}
                onCopy={() => {
                  navigator.clipboard?.writeText(hire.kartaRaqami)
                  setToast('Karta raqami nusxalandi')
                }}
              />
              <InfoRow label="Ishga olingan sana" value={ishgaOlingan} />
              <InfoRow label="Ish haqi turi" value={ishHaqi} />
              <InfoRow
                label="Holati"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                      terminated
                        ? 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
                        : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    )}
                  >
                    {terminated ? 'Ishdan chiqarilgan' : 'Faol'}
                  </span>
                }
              />
            </Panel>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 py-3 dark:border-white/10 dark:bg-white/5">
          <Button
            variant="outline"
            disabled={terminated || !hire}
            onClick={() => setEditOpen(true)}
            className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] disabled:border-transparent disabled:bg-transparent disabled:text-[#A3A3A3] disabled:opacity-100 disabled:shadow-none dark:border-white/10 dark:bg-card dark:text-white"
          >
            <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
          </Button>
          {terminated ? (
            <Button
              disabled={!hire}
              onClick={() => setRehireOpen(true)}
              className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-60"
            >
              <Check className="h-4 w-4" /> Qayta ishga olish
            </Button>
          ) : (
            <Button
              onClick={() => setTerminateOpen(true)}
              className="h-9 gap-2 rounded-lg bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <X className="h-4 w-4" /> Ishdan chiqarish
            </Button>
          )}
        </div>
      </div>

      <RecruitmentModal
        open={editOpen}
        onOpenChange={setEditOpen}
        record={hire}
        onSave={({ status: recStatus, draft }) => {
          dispatch(updateRecruitment({ id: hire.id, employeeId: doc.employeeId, status: recStatus, draft }))
            .unwrap()
            .then(() => {
              setToast('O‘zgarishlar saqlandi')
              setVersion((v) => v + 1)
            })
            .catch((err) => setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' }))
        }}
      />
      <TerminateEmployeeModal
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        employee={{ name: doc.employeeName, lavozim, tashkilot: hire?.tashkilot || doc.tashkilot, filial }}
        onConfirm={handleTerminate}
      />
      <RehireEmployeeModal
        open={rehireOpen}
        onOpenChange={setRehireOpen}
        employee={{
          name: doc.employeeName,
          lavozim,
          termination: lastDismissal ? { reason: lastDismissal.dismissalReason, at: lastDismissal.yaratilgan } : null,
        }}
        onConfirm={handleRehire}
      />
      <Toast message={toast} />
    </>
  )
}
