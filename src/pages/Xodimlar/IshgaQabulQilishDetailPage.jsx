import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, FileBarChart2, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import * as recruitmentService from '@/services/recruitmentService'
import {
  mapRecruitment,
  rehireXodim,
  setRecruitmentStatus,
  terminateXodim,
  updateRecruitment,
} from '@/features/xodimlar/xodimlarSlice'
import { getBranch } from '@/services/branchService'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import { Panel, InfoRow, surface } from './components/InfoPanel'
import RecruitmentModal from './components/RecruitmentModal'
import TerminateEmployeeModal from './components/TerminateEmployeeModal'
import RehireEmployeeModal from './components/RehireEmployeeModal'

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
  const branches = useSelector((s) => s.filiallar.list)
  const currentUser = useSelector((s) => s.auth.user)
  const [editOpen, setEditOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [rehireOpen, setRehireOpen] = useState(false)
  const [toast, setToast] = useState('')

  // `record` (state.xodimlar.recruitments) RO'YXAT endpointidan keladi — backend ro'yxat
  // javobida xodim/filial/lavozim ID'sini, karta raqami/oylik maydonlarini UMUMAN qaytarmaydi
  // (faqat tekis F.I.SH./filial/lavozim NOMLARI, real OpenAPI sxemasi bilan tasdiqlangan —
  // RecruitmentDismissalList vs RecruitmentDismissal). Shu sahifa esa aynan shu ID'larga
  // muhtoj (Tahrirlash formasi, Ishdan chiqarish/Qayta ishga olish uchun xodim ID'si) —
  // shuning uchun bitta hujjatning TO'LIQ (detal) shaklini alohida so'raymiz.
  const [detail, setDetail] = useState(null)
  const [detailFailed, setDetailFailed] = useState(false)
  useEffect(() => {
    if (!id) return undefined
    let cancelled = false
    setDetail(null)
    setDetailFailed(false)
    recruitmentService
      .getRecruitmentDismissal(id)
      .then((raw) => {
        if (!cancelled) setDetail(mapRecruitment(raw))
      })
      .catch(() => {
        if (!cancelled) setDetailFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Ro'yxatdan kelgan `record` (tashkilot NOMI bor — organization_name) + detaldan kelgan
  // `detail` (ID'lar, karta, oylik bor, lekin tashkilot nomi umuman yo'q) birlashtiriladi.
  const full = record ? { ...record, ...(detail ?? {}), tashkilot: record.tashkilot } : detail
  // Ro'yxat endi scroll pagination bilan Redux'siz yuklanadi — hujjat store'da bo'lmasa
  // (to'g'ridan-to'g'ri havola, ro'yxatdan o'tish) sahifa detal javobining o'zi bilan ishlaydi.
  const rec = full

  // Shu hujjat egasi bo'lgan xodimning haqiqiy ish holati — "Bekor qilish" endi shu hujjatning
  // o'z holatini emas, XODIMNING o'zini ishdan chiqaradi (terminateXodim), shuning uchun
  // "hozir ishlaydimi" degan savolga javobni bu hujjat emas, xodimning to'liq tarixi beradi.
  const [history, setHistory] = useState([])
  const [historyVersion, setHistoryVersion] = useState(0)

  usePageHeader(
    rec
      ? [{ label: "Ma'lumotnomalar" }, { label: 'Ishga qabul qilish', to: '/malumotnomalar/ishga-qabul-qilish' }, { label: rec.employeeName }]
      : 'Ishga qabul qilish'
  )

  useEffect(() => {
    if (!record && detailFailed) navigate('/malumotnomalar/ishga-qabul-qilish', { replace: true })
  }, [record, detailFailed, navigate])

  // Hujjatning o'zi tashkilotni saqlamaydi, faqat filialni — ro'yxat javobi tashkilot nomini
  // to'g'ridan-to'g'ri beradi (full.tashkilot). Topilmasa barcha filiallarni emas, faqat shu
  // bitta filialni so'raymiz (branches/{id}) va uning tashkilot nomini olamiz.
  const [branchOrg, setBranchOrg] = useState('')
  const needBranchOrg = !full?.tashkilot && !!full?.branchId && !branches.some((b) => b.id === full.branchId)
  useEffect(() => {
    if (!needBranchOrg) return undefined
    let cancelled = false
    getBranch(full.branchId)
      .then((b) => {
        if (!cancelled) setBranchOrg(b?.organization_info?.name ?? '')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [needBranchOrg, full?.branchId])
  const tashkilot = full?.tashkilot || branches.find((b) => b.id === full?.branchId)?.tashkilot || branchOrg

  // Xodim tarixi ham xuddi shu ro'yxat-endpoint muammosidan aziyat chekadi — `type` maydoni
  // ro'yxat javobida yo'q, shuning uchun ikkita alohida `type` bo'yicha filtrlangan so'rov
  // orqali OLIB, HAR BIRINI BIZ BILGAN TURI bilan belgilaymiz (getAllRecruitmentDismissalsTagged).
  useEffect(() => {
    if (!full?.employeeId) return undefined
    let cancelled = false
    recruitmentService
      .getAllRecruitmentDismissalsTagged({ employee: full.employeeId })
      .then((rows) => {
        if (cancelled) return
        setHistory(rows.map(mapRecruitment).sort((a, b) => (a.yaratilganAt < b.yaratilganAt ? -1 : 1)))
      })
      .catch(() => {
        if (!cancelled) setHistory([])
      })
    return () => {
      cancelled = true
    }
  }, [full?.employeeId, historyVersion])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!rec) return null

  const latestDoc = history[history.length - 1]
  const employeeTerminated = latestDoc?.type === 'dismissal'
  const lastDismissal = [...history].reverse().find((r) => r.type === 'dismissal')
  const justRehired =
    !employeeTerminated &&
    latestDoc?.type === 'recruitment' &&
    history.length > 1 &&
    history[history.length - 2]?.type === 'dismissal'

  const ishHaqi =
    full?.ishHaqiTuri === 'sales_percent'
      ? `Savdodan foiz — ${formatNumber(full?.fixFoiz, 0)}%`
      : `Belgilangan summa — ${formatNumber(full?.fixSumma, 2)} UZS`

  function setStatus(status) {
    dispatch(setRecruitmentStatus({ id: rec.id, status }))
      .unwrap()
      .then(() => {
        setDetail((d) => (d ? { ...d, status } : d))
        setToast('Tasdiqlandi')
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Xatolik yuz berdi' }))
  }

  // Endi "Bekor qilish" o'rniga xodimning o'zini ishdan chiqaramiz (terminateXodim — maxsus
  // "dismiss" endpointi orqali, filial/lavozim/karta/oylik backend tomonidan xodimning hozirgi
  // faol yozuvidan avtomatik ko'chiriladi) va shu hujjatni ham "Bekor qilingan" deb belgilaymiz,
  // so'ng xodim tarixini qayta yuklaymiz (banner/tugmalar shunga qarab yangilanadi). `full.
  // employeeId` (ro'yxatdan emas, detaldan) kerak — ro'yxat javobida xodim ID'si umuman yo'q.
  function handleTerminate(reason, file) {
    dispatch(terminateXodim({ id: full.employeeId, reason, file }))
      .unwrap()
      .then(() => dispatch(setRecruitmentStatus({ id: rec.id, status: 'cancelled' })).unwrap())
      .then(() => {
        setDetail((d) => (d ? { ...d, status: 'cancelled' } : d))
        setToast('Xodim ishdan chiqarildi')
        setHistoryVersion((v) => v + 1)
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Ishdan chiqarishda xatolik yuz berdi' }))
  }

  // Qayta ishga olish yangi "Ishga olish" hujjati yaratadi, lekin shu sahifada (shu xodimning
  // o'zida) qolamiz — boshqa hujjatga o'tib ketmaymiz (foydalanuvchi buni aniq so'radi:
  // "boshqa sahifaga yo'nalib ketyabdi, o'zini bo'limida qolishi kerak"). Banner/tugmalar
  // xodimning to'liq tarixidan (history) kelib chiqadi, aynan shu hujjatdan emas — shuning
  // uchun qolib turish xavfsiz.
  function handleRehire() {
    dispatch(
      rehireXodim({
        id: full.employeeId,
        draft: {
          filial: full.branchId,
          lavozim: full.lavozimId,
          kartaRaqami: full.kartaRaqami,
          ishHaqiTuri: full.ishHaqiTuri,
          ishHaqiSummasi: full.fixSumma,
          ishHaqiFoizi: full.fixFoiz,
          qoshimchaSumma: full.extraSumma,
          qoshimchaFoizi: full.extraFoiz,
          ishgaOlinganSana: new Date().toISOString().slice(0, 10),
        },
      })
    )
      .unwrap()
      .then(() => {
        setToast('Xodim qayta ishga olindi')
        setHistoryVersion((v) => v + 1)
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Qayta ishga olishda xatolik yuz berdi' }))
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={cn('rounded-xl p-5 text-left', STATUS_CARD_CLS[rec.status])}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">HOLATI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight min-h-[1.25em]">{STATUS_LABEL[rec.status]}</p>
          </div>
          <div className="rounded-xl bg-[#CDE7FE] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">LAVOZIMI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight min-h-[1.25em]">{rec.lavozim || ''}</p>
          </div>
          <div className="rounded-xl bg-[#F8C3B3] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">FILIALI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight min-h-[1.25em]">{rec.branch || ''}</p>
          </div>
          <div className="rounded-xl bg-[#B3F8C5] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">ISHGA OLINGAN</div>
            <p className="mt-3 text-[22px] font-bold leading-tight min-h-[1.25em]">{rec.sana || ''}</p>
          </div>
        </div>

        {employeeTerminated && lastDismissal && (
          <div className="shrink-0 rounded-[8px] bg-[#FEECEC] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Xodim ishdan chiqarildi, {lastDismissal.yaratilgan}. Sabab: {lastDismissal.dismissalReason || ''}. Chiqardi:{' '}
            {currentUser?.fullName || ''}.
          </div>
        )}
        {justRehired && latestDoc && (
          <div className="shrink-0 rounded-lg bg-[#E6FAF1] px-4 py-3 text-[13px] font-medium leading-[19px] text-[#047A47] dark:bg-[#047A47]/15">
            Xodim qayta ishga olindi, {latestDoc.yaratilgan}. Ishga oldi: {currentUser?.fullName || ''}. Avvalgi ishdan
            chiqarish sababi tarixda saqlangan.
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
                    <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{rec.sana || ''}</td>
                    <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{rec.yaratilgan || ''}</td>
                    <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{rec.ozgartirilgan || ''}</td>
                    <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">Ishga olindi</td>
                    <td className="px-3 text-[13px] text-[#0052D2] dark:text-[#60A5FA]">{rec.lavozim || ''}</td>
                    <td className="px-3 pr-4 text-[13px] text-[#525252] dark:text-muted-foreground">{rec.branch || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex w-full min-h-0 shrink-0 flex-col gap-4 lg:w-[400px]">
            <Panel title="XODIM MA’LUMOTLARI" className="min-h-0 flex-1">
              <InfoRow label="Tashkiloti" value={tashkilot} />
              <InfoRow label="Filiali" value={rec.branch} />
              <InfoRow label="Lavozimi" value={rec.lavozim} />
              <InfoRow label="Karta raqami" value={full?.kartaRaqami} />
              <InfoRow label="Ishga olingan sana" value={rec.sana} />
              <InfoRow label="Ish haqi turi" value={ishHaqi} />
              <InfoRow label="Qo‘shimcha summa" value={`${formatNumber(full?.extraSumma, 2)} UZS`} />
              <InfoRow label="Qo‘shimcha foiz" value={`${formatNumber(full?.extraFoiz, 0)} %`} />
              <InfoRow
                label="Holati"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-medium tracking-[0.3px]',
                      STATUS_BADGE_CLS[rec.status]
                    )}
                  >
                    {STATUS_LABEL[rec.status]}
                  </span>
                }
              />
            </Panel>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2.5 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 py-3 dark:border-white/10 dark:bg-white/5">
          <Button
            onClick={() => setToast({ variant: 'info', message: 'Hisobot tayyorlanmoqda…' })}
            className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <FileBarChart2 className="h-4 w-4" /> Xisobot
          </Button>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              disabled={!full?.employeeId}
              onClick={() => setEditOpen(true)}
              className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] disabled:opacity-60 dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
            </Button>
            {rec.status === 'draft' && (
              <Button
                onClick={() => setStatus('confirmed')}
                className="h-9 gap-2 bg-[#00A25C] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#008C4F]"
              >
                Tasdiqlash
              </Button>
            )}
            {employeeTerminated ? (
              <Button
                disabled={!full?.employeeId}
                onClick={() => setRehireOpen(true)}
                className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> Qayta ishga olish
              </Button>
            ) : (
              rec.status === 'confirmed' && (
                <Button
                  disabled={!full?.employeeId}
                  onClick={() => setTerminateOpen(true)}
                  className="h-9 gap-2 bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C] disabled:opacity-60"
                >
                  <X className="h-4 w-4" /> Ishdan chiqarish
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <RecruitmentModal
        open={editOpen}
        onOpenChange={setEditOpen}
        record={full}
        onSave={({ status, draft }) => {
          dispatch(updateRecruitment({ id: rec.id, employeeId: full.employeeId, status, draft }))
            .unwrap()
            .then((updated) => {
              setDetail((d) => ({ ...(d ?? {}), ...updated, status }))
              setToast('O‘zgarishlar saqlandi')
            })
            .catch((err) => setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' }))
        }}
      />
      <TerminateEmployeeModal
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        employee={{ name: rec.employeeName, lavozim: rec.lavozim, tashkilot, filial: rec.branch }}
        onConfirm={handleTerminate}
      />
      <RehireEmployeeModal
        open={rehireOpen}
        onOpenChange={setRehireOpen}
        employee={{
          name: rec.employeeName,
          lavozim: rec.lavozim,
          termination: lastDismissal ? { reason: lastDismissal.dismissalReason, at: lastDismissal.yaratilgan } : null,
        }}
        onConfirm={handleRehire}
      />
      <Toast message={toast} />
    </>
  )
}
